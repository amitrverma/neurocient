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
from app.observability import log_event, safe_exception_fields
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
from app.services.whatsapp_interactions import (
    MICROCHALLENGE_NOTE_ACTION,
    MICROCHALLENGE_NOTE_WINDOW,
    SPOT_CAPTURE_ACTION,
    SPOT_CAPTURE_BUTTON_PAYLOAD,
    SPOT_CAPTURE_WINDOW,
)
from app.services.meta_whatsapp import (
    MetaInboundMessage,
    MetaMessageStatus,
    extract_meta_messages,
    extract_meta_statuses,
    meta_whatsapp_ready,
    send_whatsapp_service_message,
    validate_meta_signature,
    verify_meta_challenge,
)

router = APIRouter()
logger = logging.getLogger("whatsapp")

MAX_WEBHOOK_BYTES = 65_536
ACCEPTED_RESPONSE = {"status": "accepted"}
HELP_MESSAGE = (
    "I can save what you noticed in Spot the Inner Caveman or update today's "
    "experiment. Use the buttons in a Neurocient check-in, or send "
    "'spot: ...'. Reply STOP to pause WhatsApp messages. "
    "For human support, email support@neurocient.com."
)
PAIRING_PATTERN = re.compile(
    r"(?:^|\n)(?:"
    r"CONNECT (?P<legacy>[A-Za-z0-9_-]{32,128})|"
    r"Connection code:[ \t]*(?P<code>[A-Z2-7]{4}(?:-[A-Z2-7]{4}){3})"
    r")\s*$",
    re.IGNORECASE,
)
SPOT_PATTERN = re.compile(r"^spot[ \t]*:[ \t]*(.*)$", re.IGNORECASE | re.DOTALL)
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
BUTTON_MICROCHALLENGE_RESPONSES = {
    "micro_done_v1": "done",
    "micro_partly_v1": "partly",
    "micro_not_today_v1": "not_today",
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


def microchallenge_outcome_for_message(message: MetaInboundMessage) -> str | None:
    if message.button_payload is not None:
        return BUTTON_MICROCHALLENGE_RESPONSES.get(message.button_payload)
    return parse_microchallenge_response(message.body or "")


def parse_spot_description(message: str) -> str | None:
    match = SPOT_PATTERN.fullmatch(message.strip())
    if match is None:
        return None
    description = match.group(1).strip()
    return description or None


def parse_obstacle_note(message: str) -> str | None:
    normalized = message.strip()
    if not normalized.lower().startswith("note:"):
        return None
    note = normalized[5:].strip()
    return note or None


def parse_pairing_token(message: str) -> str | None:
    match = PAIRING_PATTERN.search(message.strip())
    if match is None:
        return None
    legacy = match.group("legacy")
    return legacy if legacy is not None else match.group("code").upper()


def microchallenge_acknowledgement(outcome: str) -> str:
    if outcome == "done":
        return "Recorded for today."
    if outcome == "partly":
        return (
            "Recorded. Partial attempts still show what makes the behaviour "
            "easier or harder. If you want, reply with what got in the way."
        )
    return (
        "Recorded. Nothing to make up for. This helps show what got in the way. "
        "If you want, reply with what got in the way."
    )


async def _prompted_assignment_id(db: AsyncSession, user_id) -> UUID | None:
    destination_key = await db.scalar(
        select(NotificationDispatch.destination_key).where(
            NotificationDispatch.user_id == user_id,
            NotificationDispatch.purpose == "microchallenge",
            NotificationDispatch.channel == "whatsapp",
            NotificationDispatch.dispatch_date == product_today(),
            NotificationDispatch.status.in_(
                [
                    "dispatching",
                    "sent",
                    "accepted",
                    "delivered",
                    "read",
                    "reconciliation_required",
                ]
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
    description = parse_spot_description(normalized_body)
    microchallenge_outcome = microchallenge_outcome_for_message(message)
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
                    prefs.whatsapp_pending_action = None
                    prefs.whatsapp_pending_action_expires_at = None
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
                        "You're connected to Neurocient. You can record your progress "
                        "or what you notice here. Reply STOP at any time to pause "
                        "WhatsApp messages."
                    )

    result = await db.execute(
        select(UserPreferences)
        .where(
            UserPreferences.whatsapp_number == message.from_number,
            UserPreferences.whatsapp_verified.is_(True),
        )
        .with_for_update()
    )
    linked_preferences = result.scalar_one_or_none()
    if pairing_token is None and linked_preferences is not None:
        user_id = linked_preferences.user_id
        command = normalized_body.casefold()
        if command == "stop":
            linked_preferences.whatsapp_enabled = False
            linked_preferences.whatsapp_pending_action = None
            linked_preferences.whatsapp_pending_action_expires_at = None
            acknowledgement = (
                "WhatsApp messages are off. Your saved progress is unchanged. "
                "Reply START to turn them on again."
            )
        elif command == "start":
            linked_preferences.whatsapp_enabled = True
            linked_preferences.whatsapp_consent_at = _utcnow()
            linked_preferences.whatsapp_consent_version = CONSENT_VERSION
            linked_preferences.whatsapp_pending_action = None
            linked_preferences.whatsapp_pending_action_expires_at = None
            acknowledgement = (
                "WhatsApp messages are on again. You'll receive relevant Neurocient "
                "nudges and check-ins here."
            )
        elif message.button_payload == SPOT_CAPTURE_BUTTON_PAYLOAD:
            linked_preferences.whatsapp_pending_action = SPOT_CAPTURE_ACTION
            linked_preferences.whatsapp_pending_action_expires_at = (
                _utcnow() + SPOT_CAPTURE_WINDOW
            )
            acknowledgement = "What did you notice? Reply in your own words."
        elif description:
            linked_preferences.whatsapp_pending_action = None
            linked_preferences.whatsapp_pending_action_expires_at = None
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
            linked_preferences.whatsapp_pending_action = None
            linked_preferences.whatsapp_pending_action_expires_at = None
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
                    if microchallenge_outcome in {"partly", "not_today"}:
                        linked_preferences.whatsapp_pending_action = (
                            MICROCHALLENGE_NOTE_ACTION
                        )
                        linked_preferences.whatsapp_pending_action_expires_at = (
                            _utcnow() + MICROCHALLENGE_NOTE_WINDOW
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
            linked_preferences.whatsapp_pending_action = None
            linked_preferences.whatsapp_pending_action_expires_at = None
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
        elif (
            normalized_body
            and linked_preferences.whatsapp_pending_action
            == MICROCHALLENGE_NOTE_ACTION
            and linked_preferences.whatsapp_pending_action_expires_at is not None
            and linked_preferences.whatsapp_pending_action_expires_at > _utcnow()
        ):
            linked_preferences.whatsapp_pending_action = None
            linked_preferences.whatsapp_pending_action_expires_at = None
            note_recorded = await add_obstacle_note(
                db,
                user_id=user_id,
                note=normalized_body,
            )
            acknowledgement = (
                "Thanks. That's recorded with today's experiment."
                if note_recorded
                else "There isn't a recent experiment response waiting for a note."
            )
        elif (
            normalized_body
            and linked_preferences.whatsapp_pending_action == SPOT_CAPTURE_ACTION
            and linked_preferences.whatsapp_pending_action_expires_at is not None
            and linked_preferences.whatsapp_pending_action_expires_at > _utcnow()
        ):
            linked_preferences.whatsapp_pending_action = None
            linked_preferences.whatsapp_pending_action_expires_at = None
            capture = await capture_spot(
                db,
                user_id=user_id,
                description=normalized_body,
                spot_date=product_today(),
                created_at=_utcnow(),
            )
            acknowledgement = (
                "Recorded in Spot the Inner Caveman."
                if capture.result == "recorded"
                else "Your free Spot the Inner Caveman limit has been reached. "
                "Open Neurocient to continue with membership."
            )
        else:
            if (
                linked_preferences.whatsapp_pending_action_expires_at is not None
                and linked_preferences.whatsapp_pending_action_expires_at <= _utcnow()
            ):
                linked_preferences.whatsapp_pending_action = None
                linked_preferences.whatsapp_pending_action_expires_at = None
            acknowledgement = HELP_MESSAGE

    await db.execute(
        update(WhatsAppWebhookEvent)
        .where(WhatsAppWebhookEvent.provider_message_id == message.message_id)
        .values(status="processed", processed_at=_utcnow())
    )
    return acknowledgement


async def _apply_delivery_status(
    db: AsyncSession,
    provider_status: MetaMessageStatus,
) -> bool:
    dispatch = await db.scalar(
        select(NotificationDispatch)
        .where(
            NotificationDispatch.channel == "whatsapp",
            NotificationDispatch.provider_message_id
            == provider_status.message_id,
        )
        .with_for_update()
    )
    if dispatch is None:
        return False

    provider_time = datetime.fromtimestamp(
        provider_status.timestamp,
        UTC,
    ).replace(tzinfo=None)
    if provider_status.status == "failed":
        if dispatch.status in {"delivered", "read"}:
            return False
        dispatch.status = "failed"
        dispatch.last_error_code = provider_status.error_code or "meta_failed"
        dispatch.failed_at = provider_time
        return True

    target_status = {
        "sent": "accepted",
        "delivered": "delivered",
        "read": "read",
    }[provider_status.status]
    rank = {"sent": 0, "accepted": 1, "delivered": 2, "read": 3}
    current_rank = rank.get(dispatch.status)
    if dispatch.status in {"dispatching", "reconciliation_required"}:
        current_rank = 0
    if current_rank is None or rank[target_status] <= current_rank:
        return False
    dispatch.status = target_status
    dispatch.last_error_code = None
    if target_status == "delivered":
        dispatch.delivered_at = provider_time
    elif target_status == "read":
        dispatch.delivered_at = dispatch.delivered_at or provider_time
        dispatch.read_at = provider_time
    return True


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
        statuses = extract_meta_statuses(payload)
    except (UnicodeDecodeError, json.JSONDecodeError, ValueError):
        logger.warning("whatsapp_webhook_rejected reason=malformed_payload")
        return _safe_error(400)

    acknowledgements: list[tuple[str, str]] = []
    try:
        for message in messages:
            acknowledgement = await _process_inbound_message(db, message)
            if acknowledgement:
                acknowledgements.append((message.from_number, acknowledgement))
        for provider_status in statuses:
            await _apply_delivery_status(db, provider_status)
        await db.commit()
        logger.info("whatsapp_webhook_accepted")
    except Exception:
        await db.rollback()
        logger.error("whatsapp_webhook_failed reason=internal_error")
        return _safe_error(500)

    for from_number, acknowledgement in acknowledgements:
        try:
            await asyncio.to_thread(
                send_whatsapp_service_message,
                from_number,
                acknowledgement,
                emit_logs=False,
            )
        except Exception as error:
            # The durable inbound write is already committed. A provider or
            # worker failure must not expose details or invite a replay.
            log_event(
                logger,
                "whatsapp_acknowledgement_failed",
                level=logging.WARNING,
                component="api",
                operation="whatsapp_service_reply",
                outcome="uncertain",
                reason_code="provider_outcome_unknown",
                **safe_exception_fields(error),
            )

    return JSONResponse(ACCEPTED_RESPONSE)
