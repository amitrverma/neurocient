import asyncio
import logging
import re
from datetime import UTC, date, datetime
from urllib.parse import parse_qsl
from uuid import uuid4

import requests
from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse
from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import CavemanSpot, User, WhatsAppWebhookEvent
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


def _utcnow() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def _safe_error(status_code: int) -> JSONResponse:
    return JSONResponse(
        {"status": "rejected", "message": "Unable to process request"},
        status_code=status_code,
    )


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
    should_acknowledge = False

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

        if description:
            result = await db.execute(
                select(User.id).where(User.phone_number == from_number)
            )
            user_id = result.scalar_one_or_none()
            if user_id is not None:
                db.add(
                    CavemanSpot(
                        id=uuid4(),
                        user_id=user_id,
                        description=description,
                        date=date.today(),
                        created_at=_utcnow(),
                    )
                )
                should_acknowledge = True

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

    if should_acknowledge:
        try:
            await asyncio.to_thread(
                send_whatsapp_message,
                from_number,
                "Got it. Your caveman has been spotted and logged.",
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
) -> bool:
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
        "Body": message,
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
            return True
        if emit_logs:
            logger.warning(
                "whatsapp_send_failed reason=provider_status status_code=%s",
                response.status_code,
            )
        return False
    except Exception:
        if emit_logs:
            logger.warning("whatsapp_send_failed reason=transport_error")
        return False
