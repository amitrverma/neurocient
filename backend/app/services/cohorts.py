from datetime import datetime

from sqlalchemy import and_, func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import Cohort, CohortEnrollment

SEAT_STATUSES = ("pending_payment", "paid", "active")
PUBLIC_STATUSES = ("published", "open", "full")


def validate_cohort_values(*, starts_at, ends_at, capacity: int, price_minor: int) -> None:
    if ends_at <= starts_at:
        raise ValueError("Cohort end must be after its start")
    if capacity < 1:
        raise ValueError("Capacity must be at least 1")
    if price_minor < 1:
        raise ValueError("Price must be greater than zero")


async def occupied_seats(db: AsyncSession, cohort_id, now: datetime | None = None) -> int:
    now = now or datetime.utcnow()
    result = await db.execute(
        select(func.count(CohortEnrollment.id)).where(
            CohortEnrollment.cohort_id == cohort_id,
            CohortEnrollment.status.in_(SEAT_STATUSES),
            or_(
                CohortEnrollment.status != "pending_payment",
                and_(
                    CohortEnrollment.reservation_expires_at.is_not(None),
                    CohortEnrollment.reservation_expires_at > now,
                ),
            ),
        )
    )
    return int(result.scalar_one())


def enrollment_is_open(cohort: Cohort, seats: int, now: datetime | None = None) -> bool:
    now = now or datetime.utcnow()
    if cohort.status != "open":
        return False
    if cohort.enrollment_opens_at and now < cohort.enrollment_opens_at:
        return False
    if cohort.enrollment_closes_at and now >= cohort.enrollment_closes_at:
        return False
    return seats < cohort.capacity


def captured_payment_has_seat(*, reservation_expires_at, occupied_other_seats: int, capacity: int, now: datetime | None = None) -> bool:
    """A valid reservation owns its seat; an expired one may use only free capacity."""
    now = now or datetime.utcnow()
    if reservation_expires_at and reservation_expires_at > now:
        return True
    return occupied_other_seats < capacity
