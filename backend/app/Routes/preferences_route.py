import hashlib
import hmac
import logging
import secrets
from datetime import UTC, datetime, timedelta
from urllib.parse import quote

from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, ConfigDict, StrictBool
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import User, UserPreferences
from app.services.rate_limits import enforce, request_rules
from app.utils.auth import get_current_user

router = APIRouter()
logger = logging.getLogger("notification_consent")
PAIRING_TTL = timedelta(minutes=10)
CONSENT_VERSION = "whatsapp-companion-v1"
CONSENT_MESSAGE = (
    "Connect my WhatsApp to Neurocient. Send me relevant nudges and reminders, "
    "and let me record my microchallenge check-ins here. I can reply STOP at any time."
)


class PreferenceUpdate(BaseModel):
    model_config = ConfigDict(extra="forbid")
    push_enabled: StrictBool = False


def _utcnow() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def pairing_token_hash(token: str) -> str:
    secret = settings.CONSENT_PAIRING_SECRET
    if not secret:
        raise RuntimeError("WhatsApp pairing is not configured")
    return hmac.new(secret.encode(), token.encode(), hashlib.sha256).hexdigest()


def _masked_number(number: str | None) -> str | None:
    if not number:
        return None
    return f"+{'•' * max(0, len(number) - 5)}{number[-4:]}"


def _clear_pairing(prefs: UserPreferences) -> None:
    prefs.whatsapp_pairing_token_hash = None
    prefs.whatsapp_pairing_expires_at = None


def _preference_response(prefs: UserPreferences) -> dict:
    now = _utcnow()
    connected = bool(prefs.whatsapp_verified and prefs.whatsapp_number)
    pending = bool(
        prefs.whatsapp_pairing_token_hash
        and prefs.whatsapp_pairing_expires_at
        and prefs.whatsapp_pairing_expires_at > now
    )
    return {
        "id": str(prefs.id),
        "user_id": str(prefs.user_id),
        "push_enabled": prefs.push_enabled,
        "whatsapp_connected": connected,
        "whatsapp_enabled": bool(connected and prefs.whatsapp_enabled),
        "whatsapp_display_number": _masked_number(prefs.whatsapp_number),
        "whatsapp_pairing_pending": pending,
        "whatsapp_pairing_expires_at": (
            prefs.whatsapp_pairing_expires_at.isoformat() + "Z" if pending else None
        ),
    }


async def _get_preferences(db: AsyncSession, user_id, *, for_update=False):
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
    for field, value in updates.model_dump(exclude_unset=True).items():
        setattr(prefs, field, value)
    await db.commit()
    await db.refresh(prefs)
    logger.info("notification_channel_updated channel=push")
    return _preference_response(prefs)


@router.post("/preferences/whatsapp-pairing", status_code=201)
async def create_whatsapp_pairing(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    if not settings.CONSENT_PAIRING_SECRET or not settings.WHATSAPP_BUSINESS_NUMBER:
        logger.error("whatsapp_pairing_failed reason=configuration_missing")
        raise HTTPException(status_code=503, detail="WhatsApp connection is unavailable")
    await enforce(
        db,
        request_rules(
            request,
            ("whatsapp_pair_user", str(current_user.id)),
            ip_policy="whatsapp_pair_ip",
        ),
    )
    prefs = await _get_preferences(db, current_user.id, for_update=True)
    token = secrets.token_urlsafe(32)
    prefs.whatsapp_pairing_token_hash = pairing_token_hash(token)
    prefs.whatsapp_pairing_expires_at = _utcnow() + PAIRING_TTL
    await db.commit()
    message = f"{CONSENT_MESSAGE}\n\nCONNECT {token}"
    url = f"https://wa.me/{settings.WHATSAPP_BUSINESS_NUMBER}?text={quote(message, safe='')}"
    logger.info("whatsapp_pairing_created")
    return {
        "whatsapp_url": url,
        "expires_at": prefs.whatsapp_pairing_expires_at.isoformat() + "Z",
    }


@router.delete("/preferences/whatsapp-connection")
async def disconnect_whatsapp(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    await enforce(
        db,
        request_rules(
            request,
            ("whatsapp_disconnect_user", str(current_user.id)),
            ip_policy="whatsapp_disconnect_ip",
        ),
    )
    prefs = await _get_preferences(db, current_user.id, for_update=True)
    prefs.whatsapp_enabled = False
    prefs.whatsapp_verified = False
    prefs.whatsapp_number = None
    _clear_pairing(prefs)
    await db.commit()
    await db.refresh(prefs)
    logger.info("whatsapp_disconnected")
    return _preference_response(prefs)
