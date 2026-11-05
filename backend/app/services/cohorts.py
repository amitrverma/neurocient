from datetime import UTC, datetime
from zoneinfo import ZoneInfo, ZoneInfoNotFoundError

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Cohort, CohortEnrollment, CohortWaitlistEntry

SEAT_STATUSES = ("checkout_creating", "checkout_unknown", "pending_payment", "paid", "active")
PUBLIC_STATUSES = ("published", "open", "full")
MODERN_CAVEMAN_PRICE_MINOR = 2_100_000
MODERN_CAVEMAN_CURRENCY = "INR"


def validate_cohort_values(*, starts_at, ends_at, capacity: int, price_minor: int) -> None:
    if ends_at <= starts_at:
        raise ValueError("Cohort end must be after its start")
    if capacity < 1:
        raise ValueError("Capacity must be at least 1")
    if price_minor < 1:
        raise ValueError("Price must be greater than zero")


def validate_modern_caveman_price(*, price_minor: int, currency: str) -> None:
    if currency.upper() != MODERN_CAVEMAN_CURRENCY:
        raise ValueError("Modern Caveman checkout currency must be INR")
    if price_minor != MODERN_CAVEMAN_PRICE_MINOR:
        raise ValueError("Modern Caveman checkout price must be 2,100,000 minor units")


def validate_cohort_timezone(timezone: str) -> None:
    try:
        ZoneInfo(timezone)
    except (ZoneInfoNotFoundError, ValueError, TypeError) as exc:
        raise ValueError("Cohort timezone must be a valid IANA timezone") from exc


async def occupied_seats(db: AsyncSession, cohort_id, now: datetime | None = None) -> int:
    now = now or datetime.utcnow()
    enrollment_result = await db.execute(
        select(func.count(CohortEnrollment.id)).where(
            CohortEnrollment.cohort_id == cohort_id,
            CohortEnrollment.status.in_(SEAT_STATUSES),
            or_(
                CohortEnrollment.status.not_in(("checkout_creating", "checkout_unknown", "pending_payment")),
                and_(
                    CohortEnrollment.reservation_expires_at.is_not(None),
                    CohortEnrollment.reservation_expires_at > now,
                ),
            ),
        )
    )
    enrollment_count = int(enrollment_result.scalar_one())

    seat_holding_enrollment = select(CohortEnrollment.id).where(
        CohortEnrollment.cohort_id == CohortWaitlistEntry.cohort_id,
        CohortEnrollment.user_id == CohortWaitlistEntry.user_id,
        CohortEnrollment.status.in_(SEAT_STATUSES),
        or_(
            CohortEnrollment.status.not_in(("checkout_creating", "checkout_unknown", "pending_payment")),
            and_(
                CohortEnrollment.reservation_expires_at.is_not(None),
                CohortEnrollment.reservation_expires_at > now,
            ),
        ),
    )
    offer_result = await db.execute(
        select(func.count(CohortWaitlistEntry.id)).where(
            CohortWaitlistEntry.cohort_id == cohort_id,
            CohortWaitlistEntry.status.in_(("offered", "checkout_started")),
            or_(
                CohortWaitlistEntry.offer_email_status != "sent",
                and_(
                    CohortWaitlistEntry.offer_expires_at.is_not(None),
                    CohortWaitlistEntry.offer_expires_at > now,
                ),
            ),
            ~seat_holding_enrollment.exists(),
        )
    )
    return enrollment_count + int(offer_result.scalar_one())


def enrollment_is_open(cohort: Cohort, seats: int, now: datetime | None = None) -> bool:
    return cohort.status == "open" and enrollment_window_is_open(cohort, now) and seats < cohort.capacity


def enrollment_window_is_open(cohort: Cohort, now: datetime | None = None) -> bool:
    try:
        timezone = ZoneInfo(cohort.timezone)
    except (ZoneInfoNotFoundError, ValueError, TypeError):
        return False
    reference = now or datetime.now(UTC)
    wall_clock_now = (
        reference
        if reference.tzinfo is None
        else reference.astimezone(timezone).replace(tzinfo=None)
    )
    if cohort.enrollment_opens_at and wall_clock_now < cohort.enrollment_opens_at:
        return False
    if cohort.enrollment_closes_at and wall_clock_now >= cohort.enrollment_closes_at:
        return False
    # A cohort never accepts new participants after it has started, even when
    # an explicit enrollment close was omitted or configured too late.
    if wall_clock_now >= cohort.starts_at:
        return False
    return True


def captured_payment_has_seat(*, reservation_expires_at, occupied_other_seats: int, capacity: int, now: datetime | None = None) -> bool:
    """A valid reservation owns its seat; an expired one may use only free capacity."""
    now = now or datetime.utcnow()
    if reservation_expires_at and reservation_expires_at > now:
        return True
    return occupied_other_seats < capacity
