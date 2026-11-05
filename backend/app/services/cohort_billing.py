"""Provider-neutral cohort capture fulfilment inside the caller transaction."""

from dataclasses import dataclass
from datetime import datetime

from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    AdminAuditEvent,
    Cohort,
    CohortEnrollment,
    PaymentRecord,
    PaymentWebhookEvent,
)
from app.services import cohort_welcome_email
from app.services.cohorts import captured_payment_has_seat, occupied_seats


class CaptureMismatch(ValueError):
    pass


@dataclass(frozen=True)
class CaptureResult:
    enrollment_id: object
    outcome: str
    requires_refund: bool = False


async def apply_verified_capture(
    db: AsyncSession,
    *,
    webhook: PaymentWebhookEvent,
    provider: str,
    order_id: str,
    payment_id: str,
    amount_minor: int,
    currency: str,
) -> CaptureResult:
    payment_lookup = await db.execute(
        select(PaymentRecord).where(
            PaymentRecord.provider == provider,
            PaymentRecord.provider_order_id == order_id,
        )
    )
    located_record = payment_lookup.scalar_one_or_none()
    if not located_record:
        raise CaptureMismatch("Payment record does not exist")

    enrollment_result = await db.execute(
        select(CohortEnrollment)
        .where(
            CohortEnrollment.id == located_record.enrollment_id,
        )
        .with_for_update()
    )
    enrollment = enrollment_result.scalar_one_or_none()
    if not enrollment:
        raise CaptureMismatch("Payment record does not match an enrollment")

    payment_result = await db.execute(
        select(PaymentRecord)
        .where(
            PaymentRecord.id == located_record.id,
        )
        .with_for_update()
    )
    record = payment_result.scalar_one_or_none()
    if (
        not record
        or record.enrollment_id != enrollment.id
        or record.provider != provider
        or record.provider_order_id != order_id
        or amount_minor != record.amount_minor
        or not isinstance(currency, str)
        or currency.upper() != record.currency.upper()
    ):
        raise CaptureMismatch("Payment record does not match enrollment")
    if record.provider_payment_id and record.provider_payment_id != payment_id:
        raise CaptureMismatch("Payment record already has a different payment")

    if record.status in ("capacity_conflict", "duplicate_payment"):
        record.provider_payment_id = payment_id
        webhook.status = record.status
        webhook.processed_at = datetime.utcnow()
        return CaptureResult(
            enrollment.id,
            record.status,
            requires_refund=True,
        )

    if enrollment.status in ("paid", "active", "completed"):
        if enrollment.provider_payment_id != payment_id:
            record.status = "duplicate_payment"
            record.provider_payment_id = payment_id
            webhook.status = "duplicate_payment"
            webhook.processed_at = datetime.utcnow()
            db.add(
                AdminAuditEvent(
                    actor_user_id=None,
                    action="payment.duplicate_capture",
                    subject_type="cohort_enrollment",
                    subject_id=str(enrollment.id),
                    details={
                        "provider": provider,
                        "provider_order_id": order_id,
                        "fulfilled_order_id": enrollment.provider_order_id,
                    },
                )
            )
            return CaptureResult(
                enrollment.id,
                "duplicate_payment",
                requires_refund=True,
            )
        record.status = "captured"
        record.provider_payment_id = payment_id
        webhook.status = "processed"
        webhook.processed_at = datetime.utcnow()
        await cohort_welcome_email.ensure_welcome_email_delivery(db, enrollment.id)
        return CaptureResult(enrollment.id, "duplicate")

    cohort_result = await db.execute(
        select(Cohort).where(Cohort.id == enrollment.cohort_id).with_for_update()
    )
    cohort = cohort_result.scalar_one()
    occupied = await occupied_seats(db, cohort.id)
    current_reservation_counted = bool(
        enrollment.status == "pending_payment"
        and enrollment.reservation_expires_at
        and enrollment.reservation_expires_at > datetime.utcnow()
    )
    occupied_other = max(occupied - (1 if current_reservation_counted else 0), 0)
    if not captured_payment_has_seat(
        reservation_expires_at=enrollment.reservation_expires_at,
        occupied_other_seats=occupied_other,
        capacity=cohort.capacity,
    ):
        enrollment.status = "cancelled"
        enrollment.provider_payment_id = payment_id
        record.status = "capacity_conflict"
        record.provider_payment_id = payment_id
        webhook.status = "capacity_conflict"
        webhook.processed_at = datetime.utcnow()
        db.add(
            AdminAuditEvent(
                actor_user_id=None,
                action="payment.capacity_conflict",
                subject_type="cohort_enrollment",
                subject_id=str(enrollment.id),
                details={"provider": provider, "provider_order_id": order_id},
            )
        )
        return CaptureResult(enrollment.id, "capacity_conflict", requires_refund=True)

    enrollment.status = "paid"
    enrollment.provider = provider
    enrollment.provider_order_id = order_id
    enrollment.provider_payment_id = payment_id
    enrollment.amount_minor = record.amount_minor
    enrollment.currency = record.currency
    enrollment.paid_at = datetime.utcnow()
    record.status = "captured"
    record.provider_payment_id = payment_id
    other_attempts_result = await db.execute(
        select(PaymentRecord)
        .where(
            PaymentRecord.enrollment_id == enrollment.id,
            PaymentRecord.id != record.id,
            PaymentRecord.status.in_(("created", "signature_verified")),
        )
        .with_for_update()
    )
    for other_attempt in other_attempts_result.scalars().all():
        other_attempt.status = "superseded"
    webhook.status = "processed"
    webhook.processed_at = datetime.utcnow()
    db.add(
        AdminAuditEvent(
            actor_user_id=None,
            action="payment.captured",
            subject_type="cohort_enrollment",
            subject_id=str(enrollment.id),
            details={"provider": provider, "provider_order_id": order_id},
        )
    )
    await cohort_welcome_email.ensure_welcome_email_delivery(db, enrollment.id)
    return CaptureResult(enrollment.id, "processed")
