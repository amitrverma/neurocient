import hmac

from fastapi import APIRouter, Depends, Header, HTTPException
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.utils.reminder_engine import (
    send_daily_nudge as deliver_daily_nudge,
    send_microchallenge_pushes,
    send_spot_pushes,
)

router = APIRouter()


async def require_admin_key(x_admin_key: str | None = Header(default=None)):
    expected = settings.ADMIN_API_KEY
    if not expected or not x_admin_key or not hmac.compare_digest(x_admin_key, expected):
        raise HTTPException(status_code=403, detail="Forbidden")


@router.post("/send-daily-nudge", dependencies=[Depends(require_admin_key)])
async def send_daily_nudge(db: AsyncSession = Depends(get_db)):
    result = await deliver_daily_nudge(db)
    return {"status": "ok", **result}


@router.post("/push-spot", dependencies=[Depends(require_admin_key)])
async def trigger_spot_pushes(db: AsyncSession = Depends(get_db)):
    await send_spot_pushes(db)
    return {"status": "spot nudges sent"}


@router.post("/push-challenge", dependencies=[Depends(require_admin_key)])
async def trigger_challenge_pushes(db: AsyncSession = Depends(get_db)):
    await send_microchallenge_pushes(db)
    return {"status": "microchallenge nudges sent"}
