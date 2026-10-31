from fastapi import APIRouter, Depends, HTTPException
from pydantic import BaseModel, ConfigDict, Field, HttpUrl, field_validator
from sqlalchemy import delete, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User, UserPreferences, WebPushSubscription
from app.utils.auth import get_current_user

router = APIRouter()


class WebPushKeys(BaseModel):
    model_config = ConfigDict(extra="forbid")

    p256dh: str = Field(min_length=16, max_length=256)
    auth: str = Field(min_length=8, max_length=128)


class WebPushRegistration(BaseModel):
    model_config = ConfigDict(extra="forbid")

    endpoint: HttpUrl
    keys: WebPushKeys

    @field_validator("endpoint")
    @classmethod
    def supported_push_service(cls, value: HttpUrl) -> HttpUrl:
        hostname = (value.host or "").lower()
        supported = (
            hostname == "fcm.googleapis.com"
            or hostname.endswith(".push.services.mozilla.com")
            or hostname == "web.push.apple.com"
            or hostname == "notify.windows.com"
            or hostname.endswith(".notify.windows.com")
        )
        if value.scheme != "https" or not supported:
            raise ValueError("Unsupported web push service")
        return value


@router.post("/register-webpush")
async def register_webpush(
    payload: WebPushRegistration,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    endpoint = str(payload.endpoint)
    existing = await db.scalar(
        select(WebPushSubscription)
        .where(WebPushSubscription.endpoint == endpoint)
        .with_for_update()
    )
    if existing and existing.user_id != current_user.id:
        raise HTTPException(
            status_code=409,
            detail="This push subscription belongs to another account",
        )

    keys = payload.keys.model_dump()
    if existing:
        existing.keys = keys
    else:
        db.add(
            WebPushSubscription(
                user_id=current_user.id,
                endpoint=endpoint,
                keys=keys,
            )
        )
    try:
        await db.commit()
    except IntegrityError:
        await db.rollback()
        raise HTTPException(
            status_code=409,
            detail="This push subscription belongs to another account",
        ) from None
    return {"status": "ok"}


@router.post("/unregister-webpush")
async def unregister_webpush(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    prefs = await db.scalar(
        select(UserPreferences)
        .where(UserPreferences.user_id == current_user.id)
        .with_for_update()
    )
    if prefs is None:
        raise HTTPException(status_code=404, detail="Preferences not found")
    await db.execute(
        delete(WebPushSubscription).where(
            WebPushSubscription.user_id == current_user.id
        )
    )
    prefs.push_enabled = False
    await db.commit()
    return {"status": "removed"}
