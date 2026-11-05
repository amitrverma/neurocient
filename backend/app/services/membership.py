from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
from uuid import UUID

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import MembershipEntitlement, User


ACTIVE_MEMBERSHIP_STATUSES = {"active", "trialing"}
PAID_PERIOD_PRESERVING_STATUSES = {
    "active",
    "trialing",
    "past_due",
    "paused",
    "canceled",
    "expired",
}
MEMBERSHIP_GRACE_PERIOD = timedelta(days=3)


@dataclass(frozen=True)
class ArticleAccessDecision:
    granted: bool
    consume: bool
    remaining: int | None


@dataclass(frozen=True)
class MembershipAccessSummary:
    is_active: bool
    phase: str
    current_period_end: datetime | None
    access_ends_at: datetime | None
    grace_period_end: datetime | None
    renewal_at: datetime | None
    cancellation_effective_at: datetime | None


def membership_access_summary(
    entitlement: MembershipEntitlement | None,
    *,
    now: datetime | None = None,
) -> MembershipAccessSummary:
    comparison_time = now or datetime.now(UTC).replace(tzinfo=None)
    if comparison_time.tzinfo is not None:
        comparison_time = comparison_time.astimezone(UTC).replace(tzinfo=None)
    status = entitlement.status if entitlement else "inactive"
    period_end = entitlement.current_period_end if entitlement else None
    if period_end and period_end.tzinfo is not None:
        period_end = period_end.astimezone(UTC).replace(tzinfo=None)
    cancellation_scheduled = bool(
        entitlement
        and getattr(entitlement, "cancellation_state", None)
        in {"requested", "completed"}
    )

    if (
        cancellation_scheduled
        and status in PAID_PERIOD_PRESERVING_STATUSES
        and period_end
        and period_end > comparison_time
    ):
        return MembershipAccessSummary(
            True,
            "cancellation_scheduled",
            period_end,
            period_end,
            None,
            None,
            period_end,
        )

    grace_end = (
        period_end + MEMBERSHIP_GRACE_PERIOD
        if status == "past_due" and period_end and not cancellation_scheduled
        else None
    )
    if (
        status == "past_due"
        and not cancellation_scheduled
        and grace_end
        and grace_end > comparison_time
    ):
        phase = "payment_retrying" if period_end > comparison_time else "grace_period"
        return MembershipAccessSummary(
            True,
            phase,
            period_end,
            grace_end,
            grace_end,
            None,
            None,
        )

    paid_period_active = bool(
        status in PAID_PERIOD_PRESERVING_STATUSES
        and status != "past_due"
        and period_end
        and period_end > comparison_time
    )
    if paid_period_active:
        if cancellation_scheduled:
            phase = "cancellation_scheduled"
        elif status in ACTIVE_MEMBERSHIP_STATUSES:
            phase = "active"
        else:
            phase = "paid_through"
        return MembershipAccessSummary(
            True,
            phase,
            period_end,
            period_end,
            None,
            period_end if phase == "active" else None,
            period_end if phase == "cancellation_scheduled" else None,
        )

    phase = "inactive" if status in {"inactive", "authenticated"} else "ended"
    return MembershipAccessSummary(
        False,
        phase,
        period_end,
        grace_end,
        grace_end,
        None,
        None,
    )


def decide_article_access(
    *,
    membership_active: bool,
    already_granted: bool,
    used: int,
    limit: int,
) -> ArticleAccessDecision:
    """Decide access without mutating state.

    Existing grants remain usable after an allowance is exhausted. Paid access
    never consumes the free ledger.
    """

    if membership_active:
        return ArticleAccessDecision(True, False, None)

    remaining = max(0, limit - used)
    if already_granted:
        return ArticleAccessDecision(True, False, remaining)
    if used >= limit:
        return ArticleAccessDecision(False, False, 0)
    return ArticleAccessDecision(True, True, max(0, remaining - 1))


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
    return membership_access_summary(entitlement, now=now).is_active


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


async def lock_membership_entitlement(
    db: AsyncSession,
    user_id: UUID,
) -> MembershipEntitlement | None:
    result = await db.execute(
        select(MembershipEntitlement)
        .where(MembershipEntitlement.user_id == user_id)
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    return result.scalar_one_or_none()


async def has_active_membership(db: AsyncSession, user_id: UUID) -> bool:
    return entitlement_is_active(await get_membership_entitlement(db, user_id))


async def membership_summary(db: AsyncSession, user_id: UUID) -> dict:
    entitlement = await get_membership_entitlement(db, user_id)
    access = membership_access_summary(entitlement)
    return {
        "status": entitlement.status if entitlement else "inactive",
        "is_active": access.is_active,
        "access_phase": access.phase,
        "current_period_end": (
            access.current_period_end.isoformat() if access.current_period_end else None
        ),
        "access_ends_at": (
            access.access_ends_at.isoformat() if access.access_ends_at else None
        ),
        "grace_period_end": (
            access.grace_period_end.isoformat() if access.grace_period_end else None
        ),
        "renewal_at": access.renewal_at.isoformat() if access.renewal_at else None,
        "cancellation_effective_at": (
            access.cancellation_effective_at.isoformat()
            if access.cancellation_effective_at
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
