from dataclasses import dataclass
from datetime import date, datetime
from typing import Literal
from uuid import UUID

from sqlalchemy import func, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import CavemanSpot
from app.services.membership import has_active_membership, lock_account_access


FREE_SPOT_LIMIT = 15


@dataclass(frozen=True)
class SpotCaptureResult:
    result: Literal["recorded", "limit_reached"]
    spot: CavemanSpot | None = None


async def capture_spot(
    db: AsyncSession,
    *,
    user_id: UUID,
    description: str,
    spot_date: date,
    created_at: datetime,
) -> SpotCaptureResult:
    """Apply the shared Spot entitlement rule without owning the transaction."""
    await lock_account_access(db, user_id)
    if not await has_active_membership(db, user_id):
        count = await db.scalar(
            select(func.count(CavemanSpot.id)).where(
                CavemanSpot.user_id == user_id,
            )
        )
        if (count or 0) >= FREE_SPOT_LIMIT:
            return SpotCaptureResult(result="limit_reached")

    spot = CavemanSpot(
        user_id=user_id,
        description=description,
        date=spot_date,
        created_at=created_at,
    )
    db.add(spot)
    return SpotCaptureResult(result="recorded", spot=spot)
