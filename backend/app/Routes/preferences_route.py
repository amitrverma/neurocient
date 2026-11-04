import asyncio
import hashlib
import hmac
import logging
import re
import secrets
from datetime import UTC, datetime, timedelta

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict, Field, StrictBool
from sqlalchemy import select, update
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import User, UserPreferences
from app.services.meta_whatsapp import send_whatsapp_message
from app.services.rate_limits import enforce, request_rules
from app.utils.auth import get_current_user

router = APIRouter()
logger = logging.getLogger("notification_consent")

PHONE_PATTERN = re.compile(r"^\+[1-9][0-9]{7,14}$")
CODE_PATTERN = re.compile(r"^[0-9]{6}$")
VERIFICATION_TTL = timedelta(minutes=10)
MAX_VERIFICATION_ATTEMPTS = 5


class PreferenceUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")

    # Concrete defaults let PATCH omit fields while rejecting an explicitly
    # supplied null. model_dump(exclude_unset=True) still returns only fields
    # present in the request body.
    nudge_enabled: StrictBool = False
    spot_reminder_enabled: StrictBool = False
    microchallenge_enabled: StrictBool = False
    push_enabled: StrictBool = False
    whatsapp_enabled: StrictBool = False


class WhatsAppVerificationRequest(BaseModel):
    model_config = ConfigDict(extra="forbid")

    number: str = Field(min_length=9, max_length=16)


class WhatsAppVerificationConfirm(BaseModel):
    model_config = ConfigDict(extra="forbid")

    code: str = Field(min_length=6, max_length=6)


def _utcnow() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def _verification_hash(number: str, code: str) -> str:
    secret = settings.CONSENT_VERIFICATION_SECRET
    if not secret:
        raise RuntimeError("verification is not configured")
    return hmac.new(
        secret.encode("utf-8"),
        f"{number}:{code}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()


def _clear_pending_verification(prefs: UserPreferences) -> None:
    prefs.whatsapp_pending_number = None
    prefs.whatsapp_verification_code_hash = None
    prefs.whatsapp_verification_expires_at = None
    prefs.whatsapp_verification_attempts = 0


def _preference_response(prefs: UserPreferences) -> dict:
    return {
        "id": str(prefs.id),
        "user_id": str(prefs.user_id),
        "nudge_enabled": prefs.nudge_enabled,
        "spot_reminder_enabled": prefs.spot_reminder_enabled,
        "microchallenge_enabled": prefs.microchallenge_enabled,
        "push_enabled": prefs.push_enabled,
        "whatsapp_enabled": prefs.whatsapp_enabled,
        "whatsapp_number": prefs.whatsapp_number,
        "whatsapp_verified": prefs.whatsapp_verified,
        "whatsapp_pending_number": prefs.whatsapp_pending_number,
    }


async def _get_preferences(
    db: AsyncSession,
    user_id,
    *,
    for_update: bool = False,
) -> UserPreferences:
    statement = select(UserPreferences).where(UserPreferences.user_id == user_id)
    if for_update:
        statement = statement.with_for_update()
    prefs = await db.scalar(statement)
    if prefs is None:
        raise HTTPException(status_code=404, detail="Preferences not found")
    return prefs


@router.get("/preferences")
async def get_preferences(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    return _preference_response(await _get_preferences(db, current_user.id))


@router.patch("/preferences")
async def update_preferences(
    updates: PreferenceUpdate,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prefs = await _get_preferences(db, current_user.id, for_update=True)
    changed = updates.model_dump(exclude_unset=True)
    if changed.get("whatsapp_enabled") is True and not (
        prefs.whatsapp_verified and prefs.whatsapp_number
    ):
        raise HTTPException(
            status_code=409,
            detail="Verify your WhatsApp number before enabling this channel",
        )
    for field, value in changed.items():
        setattr(prefs, field, value)
    await db.commit()
    await db.refresh(prefs)
    logger.info("notification_preferences_updated")
    return _preference_response(prefs)


@router.post("/preferences/whatsapp-verification", status_code=202)
async def request_whatsapp_verification(
    payload: WhatsAppVerificationRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    number = payload.number.strip()
    if not PHONE_PATTERN.fullmatch(number):
        raise HTTPException(status_code=422, detail="Use an E.164 WhatsApp number")
    if not settings.CONSENT_VERIFICATION_SECRET:
        logger.error("whatsapp_verification_failed reason=configuration_missing")
        raise HTTPException(status_code=503, detail="WhatsApp verification is unavailable")
    await enforce(
        db,
        request_rules(
            request,
            ("whatsapp_verify_request_user", str(current_user.id)),
            ("whatsapp_verify_request_number", number),
            ip_policy="whatsapp_verify_request_ip",
        ),
    )

    prefs = await _get_preferences(db, current_user.id, for_update=True)
    code = f"{secrets.randbelow(1_000_000):06d}"
    code_hash = _verification_hash(number, code)
    # Starting verification for a number revokes the previously verified
    # destination immediately. A typed replacement must never inherit consent.
    prefs.whatsapp_enabled = False
    prefs.whatsapp_verified = False
    prefs.whatsapp_number = None
    prefs.whatsapp_pending_number = number
    prefs.whatsapp_verification_code_hash = code_hash
    prefs.whatsapp_verification_expires_at = _utcnow() + VERIFICATION_TTL
    prefs.whatsapp_verification_attempts = 0
    await db.commit()

    delivered = await asyncio.to_thread(
        send_whatsapp_message,
        number,
        f"Your Neurocient verification code is {code}. It expires in 10 minutes.",
    )
    if not delivered:
        # The provider call happens outside the transaction. Clear only this
        # exact challenge with a database-side compare-and-set so an older,
        # slower request cannot erase a newer successfully delivered code.
        await db.execute(
            update(UserPreferences)
            .where(
                UserPreferences.user_id == current_user.id,
                UserPreferences.whatsapp_verification_code_hash == code_hash,
            )
            .values(
                whatsapp_pending_number=None,
                whatsapp_verification_code_hash=None,
                whatsapp_verification_expires_at=None,
                whatsapp_verification_attempts=0,
            )
            .execution_options(synchronize_session=False)
        )
        await db.commit()
        logger.warning("whatsapp_verification_failed reason=provider_delivery")
        raise HTTPException(status_code=502, detail="Verification code could not be sent")

    logger.info("whatsapp_verification_requested")
    return {"status": "code_sent"}


@router.post("/preferences/whatsapp-verification/confirm")
async def confirm_whatsapp_verification(
    confirmation: WhatsAppVerificationConfirm,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not CODE_PATTERN.fullmatch(confirmation.code):
        raise HTTPException(status_code=422, detail="Enter the six-digit code")
    if not settings.CONSENT_VERIFICATION_SECRET:
        raise HTTPException(status_code=503, detail="WhatsApp verification is unavailable")
    await enforce(
        db,
        request_rules(
            request,
            ("whatsapp_verify_confirm_user", str(current_user.id)),
            ip_policy="whatsapp_verify_confirm_ip",
        ),
    )

    prefs = await _get_preferences(db, current_user.id, for_update=True)
    pending_number = prefs.whatsapp_pending_number
    expected_hash = prefs.whatsapp_verification_code_hash
    expires_at = prefs.whatsapp_verification_expires_at
    if not pending_number or not expected_hash or not expires_at:
        raise HTTPException(status_code=409, detail="Request a new verification code")
    if expires_at <= _utcnow():
        _clear_pending_verification(prefs)
        await db.commit()
        raise HTTPException(status_code=409, detail="Verification code expired")

    supplied_hash = _verification_hash(pending_number, confirmation.code)
    if not hmac.compare_digest(supplied_hash, expected_hash):
        prefs.whatsapp_verification_attempts += 1
        if prefs.whatsapp_verification_attempts >= MAX_VERIFICATION_ATTEMPTS:
            _clear_pending_verification(prefs)
        await db.commit()
        raise HTTPException(status_code=400, detail="Verification code is invalid")

    prefs.whatsapp_number = pending_number
    prefs.whatsapp_verified = True
    # Verification proves ownership only. It must not restore consent after a
    # later opt-out; enabling is a separate explicit preference mutation.
    _clear_pending_verification(prefs)
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This WhatsApp number is already verified for another account",
        ) from None
    await db.refresh(prefs)
    logger.info("whatsapp_verification_confirmed")
    return _preference_response(prefs)
