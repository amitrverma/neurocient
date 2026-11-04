from __future__ import annotations

import hashlib
import hmac
import logging
import re
from dataclasses import dataclass
from typing import Any

import requests

from app.config import settings, valid_graph_api_version
from app.services.notification_provider import NotificationOutcomeUnknown
from app.services.whatsapp_content import bounded_whatsapp_message


logger = logging.getLogger("whatsapp")

PHONE_PATTERN = re.compile(r"^[1-9][0-9]{7,14}$")
MAX_ENTRIES = 16
MAX_CHANGES = 32
MAX_MESSAGES = 32
MAX_PROVIDER_MESSAGE_ID_LENGTH = 255
MAX_META_TEXT_LENGTH = 4096
MAX_PRODUCT_TEXT_LENGTH = 1600


@dataclass(frozen=True)
class MetaInboundMessage:
    message_id: str
    from_number: str
    body: str | None


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
                if message.get("type") == "text":
                    text = _require_mapping(message.get("text"), "text")
                    candidate = text.get("body")
                    if not isinstance(candidate, str) or len(candidate) > MAX_META_TEXT_LENGTH:
                        raise ValueError("invalid text body")
                    if len(candidate) <= MAX_PRODUCT_TEXT_LENGTH:
                        body = candidate

                inbound.append(
                    MetaInboundMessage(
                        message_id=message_id,
                        from_number=f"+{from_number}",
                        body=body,
                    )
                )
    return inbound


def send_whatsapp_message(
    to_number: str,
    message: str,
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
    payload = {
        "messaging_product": "whatsapp",
        "recipient_type": "individual",
        "to": normalized_number,
        "type": "text",
        "text": {
            "preview_url": False,
            "body": bounded_whatsapp_message(message),
        },
    }

    try:
        response = requests.post(
            url,
            headers={"Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}"},
            json=payload,
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
