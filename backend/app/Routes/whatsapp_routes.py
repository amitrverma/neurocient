import asyncio
import logging
import re
from datetime import UTC, datetime
from urllib.parse import parse_qsl
from uuid import UUID

import requests
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.services.notification_provider import NotificationOutcomeUnknown
from app.services.whatsapp_content import bounded_whatsapp_message
from app.database import get_db
from app.models import (
    NotificationDispatch,
    UserPreferences,
    WhatsAppWebhookEvent,
)
from app.services.microchallenge_progress import (
    add_obstacle_note,
    product_today,
    record_checkin,
)
from app.services.spot_capture import capture_spot
from app.services.twilio_webhook import (
    twilio_webhook_ready,
    validate_twilio_request,
)

router = APIRouter()
logger = logging.getLogger("whatsapp")

MESSAGE_SID_PATTERN = re.compile(r"^SM[0-9a-fA-F]{32}$")
PHONE_PATTERN = re.compile(r"^\+[1-9][0-9]{7,14}$")
MAX_BODY_LENGTH = 1600
MAX_FORM_BYTES = 8192
MAX_FORM_FIELDS = 64
MAX_FIELD_NAME_LENGTH = 128
ACCEPTED_RESPONSE = {"status": "accepted"}
HELP_MESSAGE = (
    "I can save what you noticed in Spot the Inner Caveman or update today's "
    "experiment. Send 'spot: ...', or reply Done, Partly, or Didn't happen "
    "to an experiment reminder."
)
MICROCHALLENGE_RESPONSES = {
    "done": "done",
    "1": "done",
    "partly": "partly",
    "2": "partly",
    "didn't happen": "not_today",
    "did not happen": "not_today",
    "not today": "not_today",
    "3": "not_today",
}


def _utcnow() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def _safe_error(status_code: int) -> JSONResponse:
    return JSONResponse(
        {"status": "rejected", "message": "Unable to process request"},
        status_code=status_code,
    )


def parse_microchallenge_response(message: str) -> str | None:
    return MICROCHALLENGE_RESPONSES.get(message.strip().lower())


def parse_obstacle_note(message: str) -> str | None:
    normalized = message.strip()
    if not normalized.lower().startswith("note:"):
        return None
    note = normalized[5:].strip()
    return note or None


def microchallenge_acknowledgement(outcome: str) -> str:
    if outcome == "done":
        return "Recorded for today."
    if outcome == "partly":
        return (
            "Recorded. Partial attempts still show what makes the behaviour "
            "easier or harder. If you want, reply 'note: ...' with what got in the way."
        )
    return (
        "Recorded. Nothing to make up for. This helps show what got in the way. "
        "If you want, reply 'note: ...' with what got in the way."
    )


async def _prompted_assignment_id(db: AsyncSession, user_id) -> UUID | None:
    destination_key = await db.scalar(
        select(NotificationDispatch.destination_key).where(
            NotificationDispatch.user_id == user_id,
            NotificationDispatch.purpose == "microchallenge",
            NotificationDispatch.channel == "whatsapp",
            NotificationDispatch.dispatch_date == product_today(),
            NotificationDispatch.status.in_(
                ["dispatching", "sent", "reconciliation_required"]
            ),
        )
    )
    prefix = "microchallenge-assignment:"
    if not destination_key or not destination_key.startswith(prefix):
        return None
    try:
        return UUID(destination_key.removeprefix(prefix))
    except ValueError:
        return None


async def _read_bounded_form(request: Request) -> dict[str, str]:
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > MAX_FORM_BYTES:
                raise OverflowError
        except ValueError as exc:
            raise ValueError("invalid content length") from exc

    raw_body = bytearray()
    async for chunk in request.stream():
        raw_body.extend(chunk)
        if len(raw_body) > MAX_FORM_BYTES:
            raise OverflowError

    pairs = parse_qsl(
        raw_body.decode("utf-8"),
        keep_blank_values=True,
        strict_parsing=True,
        encoding="utf-8",
        errors="strict",
        max_num_fields=MAX_FORM_FIELDS,
        separator="&",
    )
    if any(not name or len(name) > MAX_FIELD_NAME_LENGTH for name, _ in pairs):
        raise ValueError("invalid field name")
    if len({name for name, _ in pairs}) != len(pairs):
        raise ValueError("duplicate field")
    return dict(pairs)


@router.post("/webhook/whatsapp")
async def whatsapp_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    if not twilio_webhook_ready():
        logger.error("whatsapp_webhook_rejected reason=configuration_missing")
        return _safe_error(503)

    content_type = request.headers.get("content-type", "")
    media_type = content_type.split(";", 1)[0].strip().lower()
    if media_type != "application/x-www-form-urlencoded":
        logger.warning("whatsapp_webhook_rejected reason=unsupported_content_type")
        return _safe_error(415)

    try:
        form = await _read_bounded_form(request)
    except OverflowError:
        logger.warning("whatsapp_webhook_rejected reason=request_too_large")
        return _safe_error(413)
    except (UnicodeDecodeError, ValueError):
        logger.warning("whatsapp_webhook_rejected reason=malformed_form")
        return _safe_error(400)

    signature = request.headers.get("X-Twilio-Signature")
    if not validate_twilio_request(form, signature):
        logger.warning("whatsapp_webhook_rejected reason=invalid_signature")
        return _safe_error(403)

    message_sid = form.get("MessageSid")
    from_value = form.get("From")
    message_body = form.get("Body")
    if (
        not isinstance(message_sid, str)
        or not MESSAGE_SID_PATTERN.fullmatch(message_sid)
        or not re.fullmatch(r"AC[0-9a-fA-F]{32}", form.get("AccountSid", ""))
        or not isinstance(from_value, str)
        or not from_value.startswith("whatsapp:")
        or not PHONE_PATTERN.fullmatch(from_value.removeprefix("whatsapp:"))
        or not isinstance(message_body, str)
        or len(message_body) > MAX_BODY_LENGTH
    ):
        logger.warning("whatsapp_webhook_rejected reason=malformed_fields")
        return _safe_error(400)

    from_number = from_value.removeprefix("whatsapp:")
    normalized_body = message_body.strip()
    description = (
        normalized_body[5:].strip()
        if normalized_body.lower().startswith("spot:")
        else ""
    )
    microchallenge_outcome = parse_microchallenge_response(normalized_body)
    obstacle_note = parse_obstacle_note(normalized_body)
    acknowledgement: str | None = None

    try:
        claim = await db.execute(
            insert(WhatsAppWebhookEvent)
            .values(
                provider_message_sid=message_sid,
                status="received",
                created_at=_utcnow(),
            )
            .on_conflict_do_nothing(
                index_elements=[WhatsAppWebhookEvent.provider_message_sid],
            )
            .returning(WhatsAppWebhookEvent.provider_message_sid)
        )
        if claim.scalar_one_or_none() is None:
            await db.rollback()
            logger.info("whatsapp_webhook_accepted")
            return JSONResponse(ACCEPTED_RESPONSE)

        result = await db.execute(
            select(UserPreferences.user_id).where(
                UserPreferences.whatsapp_number == from_number,
                UserPreferences.whatsapp_verified.is_(True),
            )
        )
        user_id = result.scalar_one_or_none()
        if user_id is not None:
            if description:
                capture = await capture_spot(
                    db,
                    user_id=user_id,
                    description=description,
                    spot_date=product_today(),
                    created_at=_utcnow(),
                )
                if capture.result == "recorded":
                    acknowledgement = (
                        "Recorded. What you noticed is saved in "
                        "Spot the Inner Caveman."
                    )
                else:
                    acknowledgement = (
                        "Your free Spot the Inner Caveman limit has been reached. "
                        "Open Neurocient to continue with membership."
                    )
            elif microchallenge_outcome is not None:
                prompted_assignment_id = await _prompted_assignment_id(db, user_id)
                if prompted_assignment_id is None:
                    acknowledgement = (
                        "There isn't a recent experiment reminder to update. "
                        "Open Neurocient to check your active experiment."
                    )
                else:
                    checkin = await record_checkin(
                        db,
                        user_id=user_id,
                        assignment_id=prompted_assignment_id,
                        outcome=microchallenge_outcome,
                    )
                    if checkin.result == "recorded":
                        acknowledgement = microchallenge_acknowledgement(
                            microchallenge_outcome
                        )
                    elif checkin.result == "already_recorded":
                        acknowledgement = "Today's experiment has already been recorded."
                    elif checkin.result == "ended":
                        acknowledgement = "That experiment has ended. Your progress is saved."
                    else:
                        acknowledgement = (
                            "That reminder no longer matches your active experiment. "
                            "Open Neurocient to check what is active now."
                        )
            elif obstacle_note is not None:
                note_recorded = await add_obstacle_note(
                    db,
                    user_id=user_id,
                    note=obstacle_note,
                )
                acknowledgement = (
                    "Thanks. That's recorded with today's experiment."
                    if note_recorded
                    else "There isn't a recent experiment response waiting for a note."
                )
            else:
                acknowledgement = HELP_MESSAGE

        await db.execute(
            update(WhatsAppWebhookEvent)
            .where(WhatsAppWebhookEvent.provider_message_sid == message_sid)
            .values(status="processed", processed_at=_utcnow())
        )
        await db.commit()
        logger.info("whatsapp_webhook_accepted")
    except Exception:
        await db.rollback()
        logger.error("whatsapp_webhook_failed reason=internal_error")
        return _safe_error(500)

    if acknowledgement:
        try:
            await asyncio.to_thread(
                send_whatsapp_message,
                from_number,
                acknowledgement,
                emit_logs=False,
            )
        except Exception:
            # The durable inbound write is already committed. A provider or
            # worker failure must not expose details or invite a replay.
            pass

    return JSONResponse(ACCEPTED_RESPONSE)


def send_whatsapp_message(
    to_number: str,
    message: str,
    *,
    emit_logs: bool = True,
) -> bool | str:
    if not (
        settings.TWILIO_ACCOUNT_SID
        and settings.TWILIO_AUTH_TOKEN
        and settings.TWILIO_WHATSAPP_NUMBER
    ):
        if emit_logs:
            logger.error("whatsapp_send_failed reason=configuration_missing")
        return False

    url = (
        "https://api.twilio.com/2010-04-01/Accounts/"
        f"{settings.TWILIO_ACCOUNT_SID}/Messages.json"
    )
    data = {
        "From": settings.TWILIO_WHATSAPP_NUMBER,
        "To": f"whatsapp:{to_number}",
        "Body": bounded_whatsapp_message(message),
    }

    try:
        response = requests.post(
            url,
            data=data,
            auth=(settings.TWILIO_ACCOUNT_SID, settings.TWILIO_AUTH_TOKEN),
            timeout=15,
        )
        if response.status_code == 201:
            if emit_logs:
                logger.info("whatsapp_send outcome=accepted")
            try:
                provider_message_id = response.json().get("sid")
            except Exception:
                provider_message_id = None
            return (
                provider_message_id
                if isinstance(provider_message_id, str)
                and MESSAGE_SID_PATTERN.fullmatch(provider_message_id)
                else True
            )
        if response.status_code >= 500:
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
