from __future__ import annotations

import hashlib
import hmac
import logging
import re
from dataclasses import dataclass
from typing import Any

import requests

from app.config import (
    settings,
    valid_graph_api_version,
    valid_whatsapp_language_code,
    valid_whatsapp_template_name,
)
from app.services.notification_provider import NotificationOutcomeUnknown
from app.services.whatsapp_content import bounded_whatsapp_message


logger = logging.getLogger("whatsapp")

PHONE_PATTERN = re.compile(r"^[1-9][0-9]{7,14}$")
MAX_ENTRIES = 16
MAX_CHANGES = 32
MAX_MESSAGES = 32
MAX_STATUSES = 64
MAX_STATUS_ERRORS = 8
MAX_PROVIDER_MESSAGE_ID_LENGTH = 255
MAX_META_TEXT_LENGTH = 4096
MAX_PRODUCT_TEXT_LENGTH = 1600
MAX_TEMPLATE_PARAMETER_LENGTH = 1024
MAX_BUTTON_PAYLOAD_LENGTH = 256
MAX_QUICK_REPLY_BUTTONS = 3


@dataclass(frozen=True)
class MetaInboundMessage:
    message_id: str
    from_number: str
    body: str | None
    button_payload: str | None = None


@dataclass(frozen=True)
class MetaMessageStatus:
    message_id: str
    status: str
    timestamp: int
    error_code: str | None


def meta_whatsapp_ready() -> bool:
    return bool(
        settings.WHATSAPP_ACCESS_TOKEN
        and settings.WHATSAPP_APP_SECRET
        and settings.WHATSAPP_VERIFY_TOKEN
        and settings.WHATSAPP_BUSINESS_ACCOUNT_ID
        and settings.WHATSAPP_PHONE_NUMBER_ID
        and valid_graph_api_version(settings.WHATSAPP_GRAPH_API_VERSION)
    )


def verify_meta_challenge(
    mode: str | None,
    verify_token: str | None,
    challenge: str | None,
) -> str | None:
    if (
        not meta_whatsapp_ready()
        or mode != "subscribe"
        or not verify_token
        or not challenge
        or len(challenge) > 512
    ):
        return None
    if not hmac.compare_digest(verify_token, settings.WHATSAPP_VERIFY_TOKEN):
        return None
    return challenge


def validate_meta_signature(raw_body: bytes, signature: str | None) -> bool:
    if not meta_whatsapp_ready() or not signature:
        return False
    if not re.fullmatch(r"sha256=[0-9a-fA-F]{64}", signature):
        return False
    expected = "sha256=" + hmac.new(
        settings.WHATSAPP_APP_SECRET.encode("utf-8"),
        raw_body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature.lower())


def _require_mapping(value: Any, field: str) -> dict[str, Any]:
    if not isinstance(value, dict):
        raise ValueError(f"invalid {field}")
    return value


def _require_bounded_list(value: Any, field: str, maximum: int) -> list[Any]:
    if not isinstance(value, list) or len(value) > maximum:
        raise ValueError(f"invalid {field}")
    return value


def _valid_message_id(value: Any) -> bool:
    return bool(
        isinstance(value, str)
        and value.startswith("wamid.")
        and len(value) <= MAX_PROVIDER_MESSAGE_ID_LENGTH
        and all(0x21 <= ord(character) <= 0x7E for character in value)
    )


def extract_meta_messages(payload: Any) -> list[MetaInboundMessage]:
    root = _require_mapping(payload, "payload")
    if root.get("object") != "whatsapp_business_account":
        raise ValueError("invalid object")

    inbound: list[MetaInboundMessage] = []
    entries = _require_bounded_list(root.get("entry"), "entry", MAX_ENTRIES)
    for entry_value in entries:
        entry = _require_mapping(entry_value, "entry item")
        if entry.get("id") != settings.WHATSAPP_BUSINESS_ACCOUNT_ID:
            raise ValueError("unexpected business account")
        changes = _require_bounded_list(
            entry.get("changes"), "changes", MAX_CHANGES
        )
        for change_value in changes:
            change = _require_mapping(change_value, "change")
            if change.get("field") != "messages":
                continue
            value = _require_mapping(change.get("value"), "change value")
            metadata = _require_mapping(value.get("metadata"), "metadata")
            if metadata.get("phone_number_id") != settings.WHATSAPP_PHONE_NUMBER_ID:
                raise ValueError("unexpected phone number")

            messages_value = value.get("messages")
            if messages_value is None:
                continue
            messages = _require_bounded_list(
                messages_value, "messages", MAX_MESSAGES
            )
            if len(inbound) + len(messages) > MAX_MESSAGES:
                raise ValueError("too many messages")

            for message_value in messages:
                message = _require_mapping(message_value, "message")
                message_id = message.get("id")
                from_number = message.get("from")
                if not _valid_message_id(message_id):
                    raise ValueError("invalid message id")
                if not isinstance(from_number, str) or not PHONE_PATTERN.fullmatch(
                    from_number
                ):
                    raise ValueError("invalid sender")

                body: str | None = None
                button_payload: str | None = None
                if message.get("type") == "text":
                    text = _require_mapping(message.get("text"), "text")
                    candidate = text.get("body")
                    if not isinstance(candidate, str) or len(candidate) > MAX_META_TEXT_LENGTH:
                        raise ValueError("invalid text body")
                    if len(candidate) <= MAX_PRODUCT_TEXT_LENGTH:
                        body = candidate
                elif message.get("type") == "button":
                    button = _require_mapping(message.get("button"), "button")
                    candidate = button.get("text")
                    payload_value = button.get("payload")
                    if (
                        not isinstance(candidate, str)
                        or not candidate
                        or len(candidate) > MAX_PRODUCT_TEXT_LENGTH
                        or not isinstance(payload_value, str)
                        or not payload_value
                        or len(payload_value) > MAX_BUTTON_PAYLOAD_LENGTH
                    ):
                        raise ValueError("invalid button reply")
                    body = candidate
                    button_payload = payload_value

                inbound.append(
                    MetaInboundMessage(
                        message_id=message_id,
                        from_number=f"+{from_number}",
                        body=body,
                        button_payload=button_payload,
                    )
                )
    return inbound


def extract_meta_statuses(payload: Any) -> list[MetaMessageStatus]:
    root = _require_mapping(payload, "payload")
    if root.get("object") != "whatsapp_business_account":
        raise ValueError("invalid object")

    extracted: list[MetaMessageStatus] = []
    entries = _require_bounded_list(root.get("entry"), "entry", MAX_ENTRIES)
    for entry_value in entries:
        entry = _require_mapping(entry_value, "entry item")
        if entry.get("id") != settings.WHATSAPP_BUSINESS_ACCOUNT_ID:
            raise ValueError("unexpected business account")
        changes = _require_bounded_list(entry.get("changes"), "changes", MAX_CHANGES)
        for change_value in changes:
            change = _require_mapping(change_value, "change")
            if change.get("field") != "messages":
                continue
            value = _require_mapping(change.get("value"), "change value")
            metadata = _require_mapping(value.get("metadata"), "metadata")
            if metadata.get("phone_number_id") != settings.WHATSAPP_PHONE_NUMBER_ID:
                raise ValueError("unexpected phone number")

            statuses_value = value.get("statuses")
            if statuses_value is None:
                continue
            statuses = _require_bounded_list(
                statuses_value, "statuses", MAX_STATUSES
            )
            if len(extracted) + len(statuses) > MAX_STATUSES:
                raise ValueError("too many statuses")
            for status_value in statuses:
                provider_status = _require_mapping(status_value, "status")
                message_id = provider_status.get("id")
                status = provider_status.get("status")
                timestamp = provider_status.get("timestamp")
                if not _valid_message_id(message_id):
                    raise ValueError("invalid status message id")
                if status not in {"sent", "delivered", "read", "failed"}:
                    raise ValueError("invalid provider status")
                if (
                    not isinstance(timestamp, str)
                    or not timestamp.isdecimal()
                    or len(timestamp) > 12
                ):
                    raise ValueError("invalid status timestamp")
                timestamp_value = int(timestamp)
                if not 946_684_800 <= timestamp_value <= 4_102_444_800:
                    raise ValueError("status timestamp out of range")

                error_code = None
                errors_value = provider_status.get("errors")
                if errors_value is not None:
                    errors = _require_bounded_list(
                        errors_value, "status errors", MAX_STATUS_ERRORS
                    )
                    if errors:
                        error = _require_mapping(errors[0], "status error")
                        code = error.get("code")
                        if not isinstance(code, int) or code < 0:
                            raise ValueError("invalid status error code")
                        error_code = f"meta_{code}"

                extracted.append(
                    MetaMessageStatus(
                        message_id=message_id,
                        status=status,
                        timestamp=timestamp_value,
                        error_code=error_code,
                    )
                )
    return extracted


def _send_whatsapp_payload(
    to_number: str,
    payload: dict[str, Any],
    *,
    emit_logs: bool = True,
) -> bool | str:
    if not meta_whatsapp_ready():
        if emit_logs:
            logger.error("whatsapp_send_failed reason=configuration_missing")
        return False

    normalized_number = to_number.removeprefix("+")
    if not PHONE_PATTERN.fullmatch(normalized_number):
        if emit_logs:
            logger.warning("whatsapp_send_failed reason=invalid_destination")
        return False

    url = (
        f"https://graph.facebook.com/{settings.WHATSAPP_GRAPH_API_VERSION}/"
        f"{settings.WHATSAPP_PHONE_NUMBER_ID}/messages"
    )
    provider_payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": normalized_number,
        **payload,
    }

    try:
        response = requests.post(
            url,
            headers={"Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}"},
            json=provider_payload,
            timeout=15,
        )
        if response.status_code == 200:
            try:
                provider_message_id = response.json()["messages"][0]["id"]
            except (KeyError, IndexError, TypeError, ValueError) as error:
                raise NotificationOutcomeUnknown(
                    "WhatsApp provider outcome is unknown"
                ) from error
            if not _valid_message_id(provider_message_id):
                raise NotificationOutcomeUnknown(
                    "WhatsApp provider outcome is unknown"
                )
            if emit_logs:
                logger.info("whatsapp_send outcome=accepted")
            return provider_message_id
        if response.status_code == 408 or response.status_code >= 500:
            if emit_logs:
                logger.warning(
                    "whatsapp_send_failed reason=provider_outcome_unknown status_code=%s",
                    response.status_code,
                )
            raise NotificationOutcomeUnknown(
                "WhatsApp provider outcome is unknown"
            )
        if emit_logs:
            logger.warning(
                "whatsapp_send_failed reason=provider_status status_code=%s",
                response.status_code,
            )
        return False
    except NotificationOutcomeUnknown:
        raise
    except Exception as error:
        if emit_logs:
            logger.warning("whatsapp_send_failed reason=transport_error")
        raise NotificationOutcomeUnknown(
            "WhatsApp delivery outcome is unknown"
        ) from error


def send_whatsapp_service_message(
    to_number: str,
    message: str,
    *,
    emit_logs: bool = True,
) -> bool | str:
    """Reply inside Meta's customer-service window using free-form text."""
    return _send_whatsapp_payload(
        to_number,
        {
            "type": "text",
            "text": {
                "preview_url": False,
                "body": bounded_whatsapp_message(message),
            },
        },
        emit_logs=emit_logs,
    )


def send_whatsapp_template_message(
    to_number: str,
    *,
    template_name: str,
    language_code: str,
    body_parameters: tuple[str, ...] = (),
    quick_reply_payloads: tuple[str, ...] = (),
    emit_logs: bool = True,
) -> bool | str:
    """Start a proactive conversation with an approved Meta template."""
    normalized_parameters = tuple(
        re.sub(r"\s+", " ", value).strip()
        if isinstance(value, str)
        else value
        for value in body_parameters
    )
    if (
        not valid_whatsapp_template_name(template_name)
        or not valid_whatsapp_language_code(language_code)
        or any(
            not isinstance(value, str)
            or not value
            or len(value) > MAX_TEMPLATE_PARAMETER_LENGTH
            for value in normalized_parameters
        )
        or len(quick_reply_payloads) > MAX_QUICK_REPLY_BUTTONS
        or any(
            not isinstance(payload, str)
            or not payload
            or len(payload) > MAX_BUTTON_PAYLOAD_LENGTH
            for payload in quick_reply_payloads
        )
    ):
        if emit_logs:
            logger.warning("whatsapp_send_failed reason=invalid_template_contract")
        return False

    template: dict[str, Any] = {
        "name": template_name,
        "language": {"code": language_code},
    }
    components: list[dict[str, Any]] = []
    if body_parameters:
        components.append({
            "type": "body",
            "parameters": [
                {"type": "text", "text": value}
                for value in normalized_parameters
            ],
        })
    components.extend(
        {
            "type": "button",
            "sub_type": "quick_reply",
            "index": str(index),
            "parameters": [{"type": "payload", "payload": payload}],
        }
        for index, payload in enumerate(quick_reply_payloads)
    )
    if components:
        template["components"] = components
    return _send_whatsapp_payload(
        to_number,
        {"type": "template", "template": template},
        emit_logs=emit_logs,
    )
