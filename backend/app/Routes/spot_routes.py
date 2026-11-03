import logging

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models import CavemanSpot, User
from app.utils.auth import get_current_user
from datetime import date
from app.analytics.posthog_client import track_event
from app.services.membership import membership_required_detail
from app.services.product_clock import product_today, utcnow_naive
from app.services.spot_capture import FREE_SPOT_LIMIT, capture_spot

router = APIRouter(prefix="/spots")
logger = logging.getLogger("spots")

@router.post("/")
async def create_spot(
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        body = await request.json()
        description = body.get("description")
        spot_date = body.get("date")

        if not description:
            raise HTTPException(status_code=400, detail="Description is required")

        try:
            effective_date = date.fromisoformat(spot_date) if spot_date else product_today()
        except (TypeError, ValueError):
            raise HTTPException(
                status_code=422,
                detail="Date must use YYYY-MM-DD format",
            )

        capture = await capture_spot(
            db,
            user_id=current_user.id,
            description=description,
            spot_date=effective_date,
            created_at=utcnow_naive(),
        )
        if capture.result == "limit_reached":
            raise HTTPException(
                status_code=402,
                detail=membership_required_detail("spots", FREE_SPOT_LIMIT),
            )
        new_spot = capture.spot
        if new_spot is None:
            raise RuntimeError("Spot capture did not return a record")
        await db.commit()
        await db.refresh(new_spot)
        track_event(str(current_user.id), "spot_created")

        return {
            "id": str(new_spot.id),
            "description": new_spot.description,
            "date": new_spot.date,
            "created_at": new_spot.created_at,
        }
    except HTTPException:
        raise
    except Exception:
        await db.rollback()
        logger.error("spot_create_failed reason=internal_error")
        raise HTTPException(
            status_code=500,
            detail="Spot could not be saved",
        )


@router.get("/")
async def get_spots(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    try:
        result = await db.execute(
            select(CavemanSpot)
            .where(CavemanSpot.user_id == current_user.id)
            .order_by(CavemanSpot.date.desc())
        )
        spots = result.scalars().all()

        return [
            {
                "id": str(s.id),
                "description": s.description,
                "date": s.date,
                "created_at": s.created_at,
            }
            for s in spots
        ]
    except Exception:
        logger.error("spot_list_failed reason=internal_error")
        raise HTTPException(
            status_code=500,
            detail="Spots could not be loaded",
        )
