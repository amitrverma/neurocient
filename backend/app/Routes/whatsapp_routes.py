import asyncio
import json
import logging
import re
from datetime import UTC, datetime
from uuid import UUID

from fastapi import APIRouter, Depends, Request
from fastapi.responses import JSONResponse, PlainTextResponse
from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.Routes.preferences_route import CONSENT_VERSION, pairing_token_hash
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
from app.services.meta_whatsapp import (
    MetaInboundMessage,
    extract_meta_messages,
    meta_whatsapp_ready,
    send_whatsapp_message,
    validate_meta_signature,
    verify_meta_challenge,
)

router = APIRouter()
logger = logging.getLogger("whatsapp")

MAX_WEBHOOK_BYTES = 65_536
ACCEPTED_RESPONSE = {"status": "accepted"}
HELP_MESSAGE = (
    "I can save what you noticed in Spot the Inner Caveman or update today's "
    "experiment. Send 'spot: ...', or reply Done, Partly, or Didn't happen "
    "to an experiment reminder. Reply STOP to pause WhatsApp messages."
)
PAIRING_PATTERN = re.compile(r"(?:^|\n)CONNECT ([A-Za-z0-9_-]{32,128})\s*$")
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


def parse_pairing_token(message: str) -> str | None:
    match = PAIRING_PATTERN.search(message.strip())
    return match.group(1) if match else None


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


async def _read_bounded_body(request: Request) -> bytes:
    content_length = request.headers.get("content-length")
    if content_length:
        try:
            if int(content_length) > MAX_WEBHOOK_BYTES:
                raise OverflowError
        except ValueError as exc:
            raise ValueError("invalid content length") from exc

    raw_body = bytearray()
    async for chunk in request.stream():
        raw_body.extend(chunk)
        if len(raw_body) > MAX_WEBHOOK_BYTES:
            raise OverflowError
    return bytes(raw_body)


@router.get("/webhook/whatsapp")
async def verify_whatsapp_webhook(request: Request):
    challenge = verify_meta_challenge(
        request.query_params.get("hub.mode"),
        request.query_params.get("hub.verify_token"),
        request.query_params.get("hub.challenge"),
    )
    if challenge is None:
        logger.warning("whatsapp_webhook_verification_rejected")
        return _safe_error(403)
    logger.info("whatsapp_webhook_verified")
    return PlainTextResponse(challenge)


async def _process_inbound_message(
    db: AsyncSession,
    message: MetaInboundMessage,
) -> str | None:
    claim = await db.execute(
        insert(WhatsAppWebhookEvent)
        .values(
            provider_message_id=message.message_id,
            status="received",
            created_at=_utcnow(),
        )
        .on_conflict_do_nothing(
            index_elements=[WhatsAppWebhookEvent.provider_message_id],
        )
        .returning(WhatsAppWebhookEvent.provider_message_id)
    )
    if claim.scalar_one_or_none() is None:
        return None

    normalized_body = (message.body or "").strip()
    description = (
        normalized_body[5:].strip()
        if normalized_body.lower().startswith("spot:")
        else ""
    )
    microchallenge_outcome = parse_microchallenge_response(normalized_body)
    obstacle_note = parse_obstacle_note(normalized_body)
    pairing_token = parse_pairing_token(normalized_body)
    acknowledgement: str | None = None

    if pairing_token:
        prefs = await db.scalar(
            select(UserPreferences)
            .where(
                UserPreferences.whatsapp_pairing_token_hash
                == pairing_token_hash(pairing_token),
                UserPreferences.whatsapp_pairing_expires_at > _utcnow(),
            )
            .with_for_update()
        )
        if prefs is None:
            acknowledgement = (
                "This connection link is invalid or expired. Return to Neurocient "
                "and choose Connect WhatsApp again."
            )
        else:
            existing_owner = await db.scalar(
                select(UserPreferences.user_id).where(
                    UserPreferences.whatsapp_number == message.from_number,
                    UserPreferences.user_id != prefs.user_id,
                )
            )
            if existing_owner is not None:
                acknowledgement = (
                    "This WhatsApp number is already connected to another "
                    "Neurocient account. Disconnect it there before trying again."
                )
            else:
                savepoint = await db.begin_nested()
                try:
                    prefs.whatsapp_number = message.from_number
                    prefs.whatsapp_verified = True
                    prefs.whatsapp_enabled = True
                    prefs.whatsapp_consent_at = _utcnow()
                    prefs.whatsapp_consent_version = CONSENT_VERSION
                    prefs.whatsapp_pairing_token_hash = None
                    prefs.whatsapp_pairing_expires_at = None
                    await db.flush()
                except IntegrityError:
                    await savepoint.rollback()
                    acknowledgement = (
                        "This WhatsApp number is already connected to another "
                        "Neurocient account. Disconnect it there before trying again."
                    )
                else:
                    await savepoint.commit()
                    acknowledgement = (
                        "You're connected to Neurocient. You'll receive relevant "
                        "nudges and reminders here. When a microchallenge check-in "
                        "arrives, reply Done, Partly, or Didn't happen. Reply STOP "
                        "at any time."
                    )

    result = await db.execute(
        select(UserPreferences).where(
            UserPreferences.whatsapp_number == message.from_number,
            UserPreferences.whatsapp_verified.is_(True),
        )
    )
    linked_preferences = result.scalar_one_or_none()
    if pairing_token is None and linked_preferences is not None:
        user_id = linked_preferences.user_id
        command = normalized_body.casefold()
        if command == "stop":
            linked_preferences.whatsapp_enabled = False
            acknowledgement = (
                "WhatsApp messages are off. Your saved progress is unchanged. "
                "Reply START to turn them on again."
            )
        elif command == "start":
            linked_preferences.whatsapp_enabled = True
            linked_preferences.whatsapp_consent_at = _utcnow()
            linked_preferences.whatsapp_consent_version = CONSENT_VERSION
            acknowledgement = (
                "WhatsApp messages are on. You'll receive relevant Neurocient "
                "nudges and reminders here. Reply STOP at any time."
            )
        elif description:
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
        .where(WhatsAppWebhookEvent.provider_message_id == message.message_id)
        .values(status="processed", processed_at=_utcnow())
    )
    return acknowledgement


@router.post("/webhook/whatsapp")
async def whatsapp_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    if not meta_whatsapp_ready():
        logger.error("whatsapp_webhook_rejected reason=configuration_missing")
        return _safe_error(503)

    content_type = request.headers.get("content-type", "")
    media_type = content_type.split(";", 1)[0].strip().lower()
    if media_type != "application/json":
        logger.warning("whatsapp_webhook_rejected reason=unsupported_content_type")
        return _safe_error(415)

    try:
        raw_body = await _read_bounded_body(request)
    except OverflowError:
        logger.warning("whatsapp_webhook_rejected reason=request_too_large")
        return _safe_error(413)
    except (UnicodeDecodeError, ValueError):
        logger.warning("whatsapp_webhook_rejected reason=malformed_body")
        return _safe_error(400)

    signature = request.headers.get("X-Hub-Signature-256")
    if not validate_meta_signature(raw_body, signature):
        logger.warning("whatsapp_webhook_rejected reason=invalid_signature")
        return _safe_error(403)

    try:
        payload = json.loads(raw_body)
        messages = extract_meta_messages(payload)
    except (UnicodeDecodeError, json.JSONDecodeError, ValueError):
        logger.warning("whatsapp_webhook_rejected reason=malformed_payload")
        return _safe_error(400)

    acknowledgements: list[tuple[str, str]] = []
    try:
        for message in messages:
            acknowledgement = await _process_inbound_message(db, message)
            if acknowledgement:
                acknowledgements.append((message.from_number, acknowledgement))
        await db.commit()
        logger.info("whatsapp_webhook_accepted")
    except Exception:
        await db.rollback()
        logger.error("whatsapp_webhook_failed reason=internal_error")
        return _safe_error(500)

    for from_number, acknowledgement in acknowledgements:
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
