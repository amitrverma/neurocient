from datetime import UTC, datetime
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import MembershipEntitlement, User


ACTIVE_MEMBERSHIP_STATUSES = {"active", "trialing"}


async def lock_account_access(db: AsyncSession, user_id: UUID) -> None:
    """Serialize entitlement and free-limit decisions for one account."""

    await db.execute(
        select(User.id).where(User.id == user_id).with_for_update(),
    )


def entitlement_is_active(
    entitlement: MembershipEntitlement | None,
    *,
    now: datetime | None = None,
) -> bool:
    if not entitlement or entitlement.status not in ACTIVE_MEMBERSHIP_STATUSES:
        return False
    if entitlement.current_period_end is None:
        return False
    comparison_time = now or datetime.now(UTC).replace(tzinfo=None)
    return entitlement.current_period_end > comparison_time


async def get_membership_entitlement(
    db: AsyncSession,
    user_id: UUID,
) -> MembershipEntitlement | None:
    result = await db.execute(
        select(MembershipEntitlement).where(
            MembershipEntitlement.user_id == user_id,
        )
    )
    return result.scalar_one_or_none()


async def has_active_membership(db: AsyncSession, user_id: UUID) -> bool:
    return entitlement_is_active(await get_membership_entitlement(db, user_id))


async def membership_summary(db: AsyncSession, user_id: UUID) -> dict:
    entitlement = await get_membership_entitlement(db, user_id)
    return {
        "status": entitlement.status if entitlement else "inactive",
        "is_active": entitlement_is_active(entitlement),
        "current_period_end": (
            entitlement.current_period_end.isoformat()
            if entitlement and entitlement.current_period_end
            else None
        ),
    }


def membership_required_detail(resource: str, limit: int) -> dict:
    return {
        "code": "membership_required",
        "resource": resource,
        "limit": limit,
        "message": "Your free limit has been reached. Membership is required to continue.",
    }
