import json
import logging
import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException, Query, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import and_, func, or_, select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import (
    AdminAuditEvent,
    Cohort,
    CohortEnrollment,
    CohortSession,
    CohortWaitlistEntry,
    PaymentRecord,
    PaymentWebhookEvent,
    User,
)
from app.services.admin import require_admin
from app.services import cohort_welcome_email
from app.services.cohorts import (
    PUBLIC_STATUSES,
    captured_payment_has_seat,
    enrollment_is_open,
    enrollment_window_is_open,
    occupied_seats,
    validate_cohort_timezone,
    validate_cohort_values,
    validate_modern_caveman_price,
)
from app.services.waitlist_offers import (
    dispatch_waitlist_offers_for_cohort,
    waitlist_offer_is_checkoutable,
)
from app.services.cohort_billing import CaptureMismatch, apply_verified_capture
from app.services.razorpay import (
    ProviderOutcomeUnknown,
    ProviderRejected,
    create_order,
    razorpay_ready,
    verify_checkout_signature,
    verify_webhook_signature,
)
from app.services.payment_offers import (
    COHORT_INR_OFFER_ID,
    cohort_offer,
    cohort_offers,
)
from app.services.rate_limits import enforce, enforce_ip
from app.utils.auth import get_current_user

router = APIRouter()
logger = logging.getLogger(__name__)


async def _deliver_paid_enrollment_welcome(
    db: AsyncSession,
    enrollment_id: uuid.UUID,
    event_id: str,
) -> None:
    try:
        await cohort_welcome_email.deliver_welcome_email(db, enrollment_id)
    except cohort_welcome_email.WelcomeEmailDeliveryError as error:
        logger.error(
            "cohort_payment_fulfilled_email_pending",
            extra={
                "event_id": event_id,
                "enrollment_id": str(enrollment_id),
                "reason_code": error.reason_code,
            },
        )
        if not error.retryable:
            logger.critical(
                "cohort_welcome_email_reconciliation_required",
                extra={"event_id": event_id, "enrollment_id": str(enrollment_id)},
            )
            return
        raise HTTPException(
            status_code=503,
            detail={"code": "welcome_email_pending"},
        ) from error

ALLOWED_TRANSITIONS = {
    "draft": {"published", "cancelled"},
    "published": {"open", "closed", "cancelled"},
    "open": {"full", "closed", "in_progress", "cancelled"},
    "full": {"open", "closed", "in_progress", "cancelled"},
    "closed": {"open", "in_progress", "cancelled"},
    "in_progress": {"completed", "cancelled"},
    "completed": set(),
    "cancelled": set(),
}


class SessionInput(BaseModel):
    title: str = Field(min_length=1, max_length=200)
    starts_at: datetime
    ends_at: datetime
    public_note: str | None = None
    meeting_url: str | None = None


class CohortInput(BaseModel):
    slug: str = Field(pattern=r"^[a-z0-9]+(?:-[a-z0-9]+)*$")
    title: str = Field(min_length=1, max_length=200)
    description: str | None = None
    facilitator: str | None = None
    timezone: str = "Asia/Kolkata"
    starts_at: datetime
    ends_at: datetime
    enrollment_opens_at: datetime | None = None
    enrollment_closes_at: datetime | None = None
    capacity: int
    price_minor: int
    currency: str = Field(default="INR", min_length=3, max_length=3)
    status: str = "draft"
    sessions: list[SessionInput] = Field(default_factory=list)


class CohortUpdate(BaseModel):
    title: str | None = None
    description: str | None = None
    facilitator: str | None = None
    timezone: str | None = None
    starts_at: datetime | None = None
    ends_at: datetime | None = None
    enrollment_opens_at: datetime | None = None
    enrollment_closes_at: datetime | None = None
    capacity: int | None = None
    price_minor: int | None = None
    currency: str | None = None
    status: str | None = None


class CohortCheckoutInput(BaseModel):
    offer_id: str = Field(default=COHORT_INR_OFFER_ID, pattern=r"^(inr|usd)$")


class WaitlistOfferEmailResolutionInput(BaseModel):
    action: str = Field(pattern=r"^(confirmed_sent|retry_confirmed_absent|revoke)$")


def cohort_payload(cohort: Cohort, seats: int, *, include_private: bool = False) -> dict:
    data = {
        "id": str(cohort.id),
        "program_key": cohort.program_key,
        "slug": cohort.slug,
        "title": cohort.title,
        "description": cohort.description,
        "facilitator": cohort.facilitator,
        "timezone": cohort.timezone,
        "starts_at": cohort.starts_at.isoformat(),
        "ends_at": cohort.ends_at.isoformat(),
        "capacity": cohort.capacity,
        "seats_remaining": max(cohort.capacity - seats, 0),
        "price_minor": cohort.price_minor,
        "currency": cohort.currency,
        "status": cohort.status,
        "enrollment_open": enrollment_is_open(cohort, seats),
        "enrollment_window_open": enrollment_window_is_open(cohort),
        "waitlist_available": enrollment_window_is_open(cohort)
        and (cohort.status == "full" or seats >= cohort.capacity),
        "checkout_configured": razorpay_ready(),
        "checkout_offers": [
            {
                "offer_id": offer.offer_id,
                "amount": offer.amount_minor,
                "currency": offer.currency,
                "display_price": offer.display_price,
                "configured": razorpay_ready(),
            }
            for offer in cohort_offers()
        ],
    }
    if include_private:
        data.update(
            enrollment_opens_at=cohort.enrollment_opens_at.isoformat() if cohort.enrollment_opens_at else None,
            enrollment_closes_at=cohort.enrollment_closes_at.isoformat() if cohort.enrollment_closes_at else None,
            created_at=cohort.created_at.isoformat(),
        )
    return data


async def audit(db, actor, action, subject_type, subject_id, details=None):
    db.add(AdminAuditEvent(
        actor_user_id=actor.id if actor else None,
        action=action,
        subject_type=subject_type,
        subject_id=str(subject_id) if subject_id else None,
        details=details or {},
    ))


@router.get("/cohorts/modern-caveman")
async def current_modern_caveman(db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(Cohort)
        .where(Cohort.program_key == "modern-caveman", Cohort.status.in_(PUBLIC_STATUSES))
        .order_by(Cohort.starts_at.asc())
    )
    cohort = result.scalars().first()
    if not cohort:
        return {"cohort": None}
    seats = await occupied_seats(db, cohort.id)
    return {"cohort": cohort_payload(cohort, seats)}


@router.get("/cohorts/my")
async def my_cohorts(current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    current_payment_status = (
        select(PaymentRecord.status)
        .where(
            PaymentRecord.enrollment_id == CohortEnrollment.id,
            PaymentRecord.provider_order_id == CohortEnrollment.provider_order_id,
        )
        .order_by(PaymentRecord.updated_at.desc())
        .limit(1)
        .correlate(CohortEnrollment)
        .scalar_subquery()
    )
    result = await db.execute(
        select(
            CohortEnrollment,
            Cohort,
            current_payment_status.label("current_payment_status"),
        )
        .join(Cohort, Cohort.id == CohortEnrollment.cohort_id)
        .where(CohortEnrollment.user_id == current_user.id)
        .order_by(Cohort.starts_at.desc())
    )
    enrollments = []
    for enrollment, cohort, payment_status in result.all():
        session_result = await db.execute(
            select(CohortSession)
            .where(
                CohortSession.cohort_id == cohort.id,
                CohortSession.ends_at >= datetime.utcnow(),
            )
            .order_by(CohortSession.starts_at.asc())
        )
        next_session = session_result.scalars().first()
        enrollments.append({
            "id": str(enrollment.id),
            "status": enrollment.status,
            "payment_confirmation_pending": (
                enrollment.status == "pending_payment"
                and payment_status == "signature_verified"
            ),
            "cohort": {
                "id": str(cohort.id),
                "title": cohort.title,
                "starts_at": cohort.starts_at.isoformat(),
                "timezone": cohort.timezone,
            },
            "next_session": {
                "title": next_session.title,
                "starts_at": next_session.starts_at.isoformat(),
                "ends_at": next_session.ends_at.isoformat(),
            } if next_session else None,
        })
    return {"enrollments": enrollments}


@router.post("/cohorts/{cohort_id}/waitlist")
async def join_waitlist(cohort_id: uuid.UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    cohort = await db.get(Cohort, cohort_id)
    if not cohort or cohort.status not in PUBLIC_STATUSES:
        raise HTTPException(status_code=404, detail="Cohort not found")
    if not enrollment_window_is_open(cohort):
        raise HTTPException(status_code=409, detail={"code": "enrollment_closed"})
    seats = await occupied_seats(db, cohort.id)
    if cohort.status != "full" and seats < cohort.capacity:
        raise HTTPException(status_code=409, detail="Waitlist opens when the cohort is full")
    existing = await db.execute(select(CohortWaitlistEntry).where(
        CohortWaitlistEntry.cohort_id == cohort_id, CohortWaitlistEntry.user_id == current_user.id
    ))
    entry = existing.scalar_one_or_none()
    if not entry:
        entry = CohortWaitlistEntry(cohort_id=cohort_id, user_id=current_user.id)
        db.add(entry)
        await db.commit()
        await db.refresh(entry)
    elif (
        entry.status in ("offered", "checkout_started")
        and entry.offer_email_status == "sent"
        and entry.offer_expires_at
        and entry.offer_expires_at <= datetime.utcnow()
    ):
        entry.status = "offer_expired"

    # Rejoining is an explicit user action. A missed offer does not silently
    # retain or restore the person's old FIFO position.
    if entry.status == "offer_expired":
        entry.status = "waiting"
        entry.created_at = datetime.utcnow()
        entry.offered_at = None
        entry.offer_expires_at = None
        entry.offer_email_sent_at = None
        entry.offer_email_provider_id = None
        entry.offer_email_status = "pending"
        entry.offer_email_attempt_count = 0
        entry.offer_email_last_error_code = None
        entry.offer_email_first_dispatched_at = None
        entry.offer_email_last_attempt_at = None
        entry.offer_email_payload = None
        await db.commit()
    can_checkout = waitlist_offer_is_checkoutable(entry, cohort)
    position_result = await db.execute(select(func.count(CohortWaitlistEntry.id)).where(
        CohortWaitlistEntry.cohort_id == cohort_id,
        CohortWaitlistEntry.status == "waiting",
        or_(
            CohortWaitlistEntry.created_at < entry.created_at,
            and_(
                CohortWaitlistEntry.created_at == entry.created_at,
                CohortWaitlistEntry.id <= entry.id,
            ),
        ),
    ))
    return {
        "status": entry.status,
        "position": int(position_result.scalar_one()) if entry.status == "waiting" else None,
        "can_checkout": can_checkout,
        "offer_expires_at": entry.offer_expires_at.isoformat() if can_checkout else None,
    }


@router.get("/cohorts/{cohort_id}/waitlist/status")
async def waitlist_status(
    cohort_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    cohort = await db.get(Cohort, cohort_id)
    result = await db.execute(
        select(CohortWaitlistEntry).where(
            CohortWaitlistEntry.cohort_id == cohort_id,
            CohortWaitlistEntry.user_id == current_user.id,
        )
    )
    entry = result.scalar_one_or_none()
    can_checkout = waitlist_offer_is_checkoutable(entry, cohort)
    return {
        "status": entry.status if entry else "not_joined",
        "can_checkout": can_checkout,
        "offer_expires_at": entry.offer_expires_at.isoformat() if can_checkout else None,
        "offer_email_status": entry.offer_email_status if entry else None,
    }


async def enforce_checkout_ip(request: Request) -> None:
    await enforce_ip(request, "checkout_ip")


@router.post(
    "/cohorts/{cohort_id}/checkout",
    dependencies=[Depends(enforce_checkout_ip)],
)
async def begin_checkout(
    cohort_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
    payload: CohortCheckoutInput | None = None,
):
    await enforce(
        db,
        [("checkout_user", str(current_user.id))],
    )
    offer = cohort_offer((payload or CohortCheckoutInput()).offer_id)
    if not razorpay_ready():
        raise HTTPException(
            status_code=503,
            detail={"code": "checkout_temporarily_unavailable"},
        )
    result = await db.execute(select(Cohort).where(Cohort.id == cohort_id).with_for_update())
    cohort = result.scalar_one_or_none()
    if not cohort or cohort.status not in PUBLIC_STATUSES:
        raise HTTPException(status_code=404, detail="Cohort not found")
    try:
        validate_modern_caveman_price(
            price_minor=cohort.price_minor, currency=cohort.currency
        )
    except ValueError:
        raise HTTPException(
            status_code=503,
            detail={"code": "cohort_price_misconfigured"},
        )
    waitlist_result = await db.execute(
        select(CohortWaitlistEntry)
        .where(
            CohortWaitlistEntry.cohort_id == cohort_id,
            CohortWaitlistEntry.user_id == current_user.id,
        )
        .with_for_update()
    )
    waitlist_entry = waitlist_result.scalar_one_or_none()
    has_waitlist_offer = waitlist_offer_is_checkoutable(waitlist_entry, cohort)
    existing_result = await db.execute(select(CohortEnrollment).where(
        CohortEnrollment.cohort_id == cohort_id, CohortEnrollment.user_id == current_user.id
    ))
    enrollment = existing_result.scalar_one_or_none()
    if enrollment and enrollment.status in ("paid", "active", "completed"):
        raise HTTPException(status_code=409, detail="You are already enrolled")
    if enrollment and enrollment.status in ("checkout_creating", "checkout_unknown"):
        raise HTTPException(
            status_code=409,
            detail={"code": "checkout_reconciliation_required"},
        )
    if (
        enrollment
        and enrollment.status == "pending_payment"
        and enrollment.reservation_expires_at
        and enrollment.reservation_expires_at > datetime.utcnow()
        and enrollment.provider_order_id
    ):
        if (
            enrollment.provider != "razorpay"
            or enrollment.amount_minor != offer.amount_minor
            or enrollment.currency != offer.currency
        ):
            raise HTTPException(
                status_code=409,
                detail={"code": "checkout_offer_conflict"},
            )
        if has_waitlist_offer and waitlist_entry.status != "checkout_started":
            waitlist_entry.status = "checkout_started"
            await db.commit()
        return {
            "key_id": settings.RAZORPAY_KEY_ID, "order_id": enrollment.provider_order_id,
            "amount": enrollment.amount_minor, "currency": enrollment.currency,
            "offer_id": offer.offer_id,
            "cohort_title": cohort.title, "email": current_user.email,
            "reservation_expires_at": enrollment.reservation_expires_at.isoformat(),
        }
    seats = await occupied_seats(db, cohort.id)
    public_checkout_open = enrollment_is_open(cohort, seats)
    offered_checkout_open = (
        has_waitlist_offer
        and cohort.status in ("open", "full")
        and enrollment_window_is_open(cohort)
        and max(seats - 1, 0) < cohort.capacity
    )
    waiting_count = await db.scalar(
        select(func.count(CohortWaitlistEntry.id)).where(
            CohortWaitlistEntry.cohort_id == cohort.id,
            CohortWaitlistEntry.status == "waiting",
        )
    )
    if (public_checkout_open and waiting_count and not has_waitlist_offer) or (
        not public_checkout_open and not offered_checkout_open
    ):
        raise HTTPException(status_code=409, detail={"code": "cohort_full", "waitlist_available": True})
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    enrollment = enrollment or CohortEnrollment(
        cohort_id=cohort.id, user_id=current_user.id,
        amount_minor=offer.amount_minor, currency=offer.currency,
    )
    enrollment.status = "checkout_creating"
    enrollment.provider = "razorpay"
    enrollment.reservation_expires_at = expires_at
    enrollment.amount_minor = offer.amount_minor
    enrollment.currency = offer.currency
    enrollment.provider_order_id = None
    if has_waitlist_offer:
        waitlist_entry.status = "checkout_started"
    db.add(enrollment)
    await db.commit()
    enrollment_id = enrollment.id
    try:
        order = await create_order(
            amount_minor=offer.amount_minor,
            currency=offer.currency,
            receipt=str(enrollment_id),
            notes={
                "cohort_id": str(cohort.id),
                "enrollment_id": str(enrollment_id),
                "user_id": str(current_user.id),
                "offer_id": offer.offer_id,
                "purpose_code": "P1107",
            },
        )
    except ProviderRejected:
        result = await db.execute(
            select(CohortEnrollment)
            .where(CohortEnrollment.id == enrollment_id)
            .with_for_update()
        )
        enrollment = result.scalar_one()
        enrollment.status = "payment_failed"
        enrollment.reservation_expires_at = None
        await db.commit()
        raise HTTPException(
            status_code=503,
            detail={"code": "checkout_temporarily_unavailable"},
        )
    except ProviderOutcomeUnknown:
        result = await db.execute(
            select(CohortEnrollment)
            .where(CohortEnrollment.id == enrollment_id)
            .with_for_update()
        )
        enrollment = result.scalar_one()
        enrollment.status = "checkout_unknown"
        await db.commit()
        raise HTTPException(
            status_code=502, detail={"code": "checkout_reconciliation_required"}
        )
    result = await db.execute(
        select(CohortEnrollment)
        .where(CohortEnrollment.id == enrollment_id)
        .with_for_update()
    )
    enrollment = result.scalar_one()
    enrollment.status = "pending_payment"
    enrollment.provider_order_id = order["id"]
    db.add(PaymentRecord(
        enrollment_id=enrollment.id, provider="razorpay",
        provider_order_id=order["id"], status="created",
        amount_minor=offer.amount_minor, currency=offer.currency,
    ))
    await db.commit()
    return {
        "key_id": settings.RAZORPAY_KEY_ID, "order_id": order["id"],
        "amount": offer.amount_minor, "currency": offer.currency,
        "offer_id": offer.offer_id,
        "cohort_title": cohort.title, "email": current_user.email,
        "reservation_expires_at": expires_at.isoformat(),
    }


def _checkout_callback_field(payload: dict, name: str, max_length: int = 255) -> str:
    value = payload.get(name)
    if not isinstance(value, str) or not value or len(value) > max_length:
        raise HTTPException(
            status_code=400,
            detail={"code": "invalid_checkout_callback"},
        )
    return value


@router.post("/cohorts/{cohort_id}/checkout/verify")
async def verify_checkout_callback(
    cohort_id: uuid.UUID,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    """Authenticate Checkout's callback; capture webhook remains fulfilment authority."""
    await enforce(db, [("checkout_user", str(current_user.id))])
    submitted_order_id = _checkout_callback_field(payload, "razorpay_order_id")
    payment_id = _checkout_callback_field(payload, "razorpay_payment_id")
    signature = _checkout_callback_field(payload, "razorpay_signature", max_length=128)

    result = await db.execute(
        select(CohortEnrollment)
        .where(
            CohortEnrollment.cohort_id == cohort_id,
            CohortEnrollment.user_id == current_user.id,
        )
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    enrollment = result.scalar_one_or_none()
    if not enrollment or not enrollment.provider_order_id:
        raise HTTPException(status_code=404, detail={"code": "checkout_not_found"})
    server_order_id = enrollment.provider_order_id
    if submitted_order_id != server_order_id or not verify_checkout_signature(
        server_order_id,
        payment_id,
        signature,
    ):
        raise HTTPException(
            status_code=400,
            detail={"code": "invalid_payment_signature"},
        )

    payment_result = await db.execute(
        select(PaymentRecord)
        .where(
            PaymentRecord.enrollment_id == enrollment.id,
            PaymentRecord.provider_order_id == server_order_id,
        )
        .with_for_update()
    )
    payment = payment_result.scalar_one_or_none()
    if not payment:
        raise HTTPException(status_code=409, detail={"code": "payment_record_missing"})
    if payment.provider_payment_id and payment.provider_payment_id != payment_id:
        raise HTTPException(status_code=409, detail={"code": "payment_mismatch"})
    payment.provider_payment_id = payment_id
    if payment.status == "created":
        payment.status = "signature_verified"
    await db.commit()
    return {
        "verified": True,
        "confirmed": enrollment.status in ("paid", "active", "completed"),
    }


@router.post("/payments/razorpay/webhook")
async def razorpay_webhook(request: Request, x_razorpay_signature: str | None = Header(default=None), db: AsyncSession = Depends(get_db)):
    body = await request.body()
    if not verify_webhook_signature(body, x_razorpay_signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")
    try:
        payload = json.loads(body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise HTTPException(status_code=400, detail={"code": "invalid_payload"})
    event_type = payload.get("event", "unknown")
    event_id = request.headers.get("x-razorpay-event-id")
    if not event_id:
        raise HTTPException(status_code=400, detail={"code": "missing_event_id"})
    payment = payload.get("payload", {}).get("payment", {}).get("entity", {})
    webhook = PaymentWebhookEvent(
        provider_event_id=event_id,
        provider="razorpay",
        event_type=event_type,
        payload={
            "payment_id": payment.get("id"),
            "order_id": payment.get("order_id"),
            "amount": payment.get("amount"),
            "currency": payment.get("currency"),
            "status": payment.get("status"),
        },
    )
    db.add(webhook)
    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        existing_event = await db.get(PaymentWebhookEvent, event_id)
        if (
            existing_event
            and existing_event.event_type == "payment.captured"
            and existing_event.status == "processed"
        ):
            existing_order_id = existing_event.payload.get("order_id")
            enrollment = await db.scalar(
                select(CohortEnrollment).where(
                    CohortEnrollment.provider_order_id == existing_order_id
                )
            )
            if enrollment and enrollment.status in ("paid", "active", "completed"):
                await cohort_welcome_email.ensure_welcome_email_delivery(
                    db, enrollment.id
                )
                await db.commit()
                await _deliver_paid_enrollment_welcome(db, enrollment.id, event_id)
        return {"ok": True, "duplicate": True}
    if event_type != "payment.captured":
        webhook.status = "ignored"
        webhook.processed_at = datetime.utcnow()
        await db.commit()
        return {"ok": True}
    order_id = payment.get("order_id")
    if (
        not payment.get("id")
        or not order_id
        or payment.get("status") != "captured"
    ):
        webhook.status = "rejected"
        webhook.processed_at = datetime.utcnow()
        await db.commit()
        raise HTTPException(status_code=400, detail={"code": "invalid_payment"})
    try:
        capture_result = await apply_verified_capture(
            db,
            webhook=webhook,
            provider="razorpay",
            order_id=order_id,
            payment_id=payment.get("id"),
            amount_minor=payment.get("amount"),
            currency=payment.get("currency"),
        )
    except CaptureMismatch:
        webhook.status = "rejected"
        webhook.processed_at = datetime.utcnow()
        await db.commit()
        raise HTTPException(status_code=409, detail="Payment does not match an enrollment")
    await db.commit()
    if capture_result.requires_refund:
        return {"ok": True, "requires_refund": True}
    await _deliver_paid_enrollment_welcome(db, capture_result.enrollment_id, event_id)
    if capture_result.outcome == "duplicate":
        return {"ok": True, "duplicate": True}
    return {"ok": True}


@router.get("/admin/cohorts")
async def admin_cohorts(_: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Cohort).order_by(Cohort.starts_at.desc()))
    items = []
    for cohort in result.scalars().all():
        items.append(cohort_payload(cohort, await occupied_seats(db, cohort.id), include_private=True))
    return {"cohorts": items}


@router.get("/admin/cohorts/{cohort_id}")
async def admin_cohort_detail(cohort_id: uuid.UUID, _: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    cohort = await db.get(Cohort, cohort_id)
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
    sessions_result = await db.execute(select(CohortSession).where(CohortSession.cohort_id == cohort_id).order_by(CohortSession.sort_order))
    enrollments_result = await db.execute(
        select(CohortEnrollment, User).join(User, User.id == CohortEnrollment.user_id)
        .where(CohortEnrollment.cohort_id == cohort_id).order_by(CohortEnrollment.created_at)
    )
    waitlist_result = await db.execute(
        select(CohortWaitlistEntry, User).join(User, User.id == CohortWaitlistEntry.user_id)
        .where(CohortWaitlistEntry.cohort_id == cohort_id).order_by(CohortWaitlistEntry.created_at)
    )
    data = cohort_payload(cohort, await occupied_seats(db, cohort.id), include_private=True)
    data["sessions"] = [{
        "id": str(item.id), "title": item.title, "starts_at": item.starts_at.isoformat(),
        "ends_at": item.ends_at.isoformat(), "public_note": item.public_note,
        "meeting_url": item.meeting_url,
    } for item in sessions_result.scalars().all()]
    data["enrollments"] = [{
        "id": str(item.id), "status": item.status, "email": user.email, "name": user.name,
        "paid_at": item.paid_at.isoformat() if item.paid_at else None,
    } for item, user in enrollments_result.all()]
    data["waitlist"] = [{
        "id": str(item.id), "status": item.status, "email": user.email, "name": user.name,
        "joined_at": item.created_at.isoformat(),
        "offer_expires_at": item.offer_expires_at.isoformat() if item.offer_expires_at else None,
        "offer_email_sent_at": item.offer_email_sent_at.isoformat() if item.offer_email_sent_at else None,
        "offer_email_status": item.offer_email_status,
        "offer_email_last_error_code": item.offer_email_last_error_code,
    } for item, user in waitlist_result.all()]
    return data


@router.post("/admin/cohorts/{cohort_id}/waitlist/offer-next")
async def admin_offer_next_waitlist_place(
    cohort_id: uuid.UUID,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    counts = await dispatch_waitlist_offers_for_cohort(db, cohort_id)
    await audit(
        db,
        admin,
        "cohort.waitlist_offer_sent",
        "cohort_waitlist_entry",
        cohort_id,
        counts,
    )
    await db.commit()
    return counts


@router.post("/admin/cohorts/{cohort_id}/waitlist/{entry_id}/resolve-email")
async def admin_resolve_waitlist_offer_email(
    cohort_id: uuid.UUID,
    entry_id: uuid.UUID,
    data: WaitlistOfferEmailResolutionInput,
    admin: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(CohortWaitlistEntry)
        .where(
            CohortWaitlistEntry.id == entry_id,
            CohortWaitlistEntry.cohort_id == cohort_id,
        )
        .with_for_update()
    )
    entry = result.scalar_one_or_none()
    if not entry:
        raise HTTPException(status_code=404, detail="Waitlist offer not found")
    if entry.status != "offered" or entry.offer_email_status != "reconciliation_required":
        raise HTTPException(
            status_code=409,
            detail={"code": "waitlist_offer_resolution_not_required"},
        )

    now = datetime.utcnow()
    if data.action == "confirmed_sent":
        entry.offer_email_status = "sent"
        entry.offer_email_sent_at = entry.offer_email_sent_at or now
        entry.offer_email_last_error_code = None
        entry.offer_email_payload = None
        if not entry.offer_expires_at or entry.offer_expires_at <= now:
            entry.status = "offer_expired"
    elif data.action == "retry_confirmed_absent":
        entry.offer_email_status = "pending"
        entry.offer_email_attempt_count = 0
        entry.offer_email_last_error_code = None
        entry.offer_email_first_dispatched_at = None
        entry.offer_email_last_attempt_at = None
        entry.offer_email_payload = None
        entry.offer_expires_at = None
    else:
        entry.status = "offer_expired"
        entry.offer_email_last_error_code = "operator_revoked"

    await audit(
        db,
        admin,
        "cohort.waitlist_offer_email_resolved",
        "cohort_waitlist_entry",
        entry.id,
        {"resolution": data.action, "resulting_status": entry.status},
    )
    await db.commit()
    return {
        "status": entry.status,
        "offer_email_status": entry.offer_email_status,
    }


@router.post("/admin/cohorts", status_code=status.HTTP_201_CREATED)
async def create_cohort(data: CohortInput, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    try:
        validate_cohort_values(starts_at=data.starts_at, ends_at=data.ends_at, capacity=data.capacity, price_minor=data.price_minor)
        validate_cohort_timezone(data.timezone)
        validate_modern_caveman_price(
            price_minor=data.price_minor, currency=data.currency
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error))
    if data.status not in ("draft", "published", "open"):
        raise HTTPException(status_code=422, detail="New cohorts must be draft, published, or open")
    cohort = Cohort(**data.model_dump(exclude={"sessions"}), program_key="modern-caveman")
    if data.status != "draft":
        cohort.published_at = datetime.utcnow()
    db.add(cohort)
    await db.flush()
    for index, session in enumerate(data.sessions):
        if session.ends_at <= session.starts_at:
            raise HTTPException(status_code=422, detail="Session end must be after its start")
        db.add(CohortSession(cohort_id=cohort.id, sort_order=index, **session.model_dump()))
    await audit(db, admin, "cohort.created", "cohort", cohort.id, {"status": cohort.status})
    await db.commit()
    await db.refresh(cohort)
    return cohort_payload(cohort, 0, include_private=True)


@router.patch("/admin/cohorts/{cohort_id}")
async def update_cohort(cohort_id: uuid.UUID, data: CohortUpdate, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Cohort).where(Cohort.id == cohort_id).with_for_update())
    cohort = result.scalar_one_or_none()
    if not cohort:
        raise HTTPException(status_code=404, detail="Cohort not found")
    changes = data.model_dump(exclude_unset=True)
    next_status = changes.get("status")
    if next_status and next_status != cohort.status and next_status not in ALLOWED_TRANSITIONS.get(cohort.status, set()):
        raise HTTPException(status_code=409, detail=f"Cannot move cohort from {cohort.status} to {next_status}")
    starts_at = changes.get("starts_at", cohort.starts_at)
    ends_at = changes.get("ends_at", cohort.ends_at)
    capacity = changes.get("capacity", cohort.capacity)
    price_minor = changes.get("price_minor", cohort.price_minor)
    currency = changes.get("currency", cohort.currency)
    timezone = changes.get("timezone", cohort.timezone)
    try:
        validate_cohort_values(starts_at=starts_at, ends_at=ends_at, capacity=capacity, price_minor=price_minor)
        validate_cohort_timezone(timezone)
        validate_modern_caveman_price(
            price_minor=price_minor, currency=currency
        )
    except ValueError as error:
        raise HTTPException(status_code=422, detail=str(error))
    seats = await occupied_seats(db, cohort.id)
    if capacity < seats:
        raise HTTPException(status_code=409, detail="Capacity cannot be lower than occupied seats")
    for key, value in changes.items():
        setattr(cohort, key, value)
    if cohort.status != "draft" and not cohort.published_at:
        cohort.published_at = datetime.utcnow()
    await audit(db, admin, "cohort.updated", "cohort", cohort.id, {"changes": sorted(changes.keys())})
    await db.commit()
    return cohort_payload(cohort, seats, include_private=True)


@router.get("/admin/audit")
async def admin_audit(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    total = (await db.execute(select(func.count(AdminAuditEvent.id)))).scalar_one()
    result = await db.execute(select(AdminAuditEvent).order_by(AdminAuditEvent.created_at.desc()).offset((page - 1) * page_size).limit(page_size))
    return {"events": [{
        "id": str(event.id), "action": event.action, "subject_type": event.subject_type,
        "subject_id": event.subject_id, "details": event.details, "created_at": event.created_at.isoformat(),
    } for event in result.scalars().all()], "total": total, "page": page, "page_size": page_size}




@router.get("/admin/payments")
async def admin_payments(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    total = (await db.execute(select(func.count(PaymentRecord.id)))).scalar_one()
    result = await db.execute(
        select(PaymentRecord, Cohort, User)
        .join(CohortEnrollment, CohortEnrollment.id == PaymentRecord.enrollment_id)
        .join(Cohort, Cohort.id == CohortEnrollment.cohort_id)
        .join(User, User.id == CohortEnrollment.user_id)
        .order_by(PaymentRecord.created_at.desc()).offset((page - 1) * page_size).limit(page_size)
    )
    return {"payments": [{
        "id": str(payment.id), "status": payment.status, "amount_minor": payment.amount_minor,
        "currency": payment.currency, "provider_order_id": payment.provider_order_id,
        "provider_payment_id": payment.provider_payment_id, "email": user.email,
        "cohort_title": cohort.title, "created_at": payment.created_at.isoformat(),
    } for payment, cohort, user in result.all()], "total": total, "page": page, "page_size": page_size}


@router.get("/admin/payment-events")
async def admin_payment_events(
    page: int = Query(default=1, ge=1),
    page_size: int = Query(default=50, ge=1, le=100),
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    total = (await db.execute(select(func.count(PaymentWebhookEvent.provider_event_id)))).scalar_one()
    result = await db.execute(
        select(PaymentWebhookEvent)
        .order_by(PaymentWebhookEvent.created_at.desc())
        .offset((page - 1) * page_size)
        .limit(page_size)
    )
    return {
        "events": [{
            "id": event.provider_event_id,
            "event_type": event.event_type,
            "status": event.status,
            "payment_id": event.payload.get("payment_id"),
            "order_id": event.payload.get("order_id"),
            "processed_at": event.processed_at.isoformat() if event.processed_at else None,
            "created_at": event.created_at.isoformat(),
        } for event in result.scalars().all()],
        "total": total,
        "page": page,
        "page_size": page_size,
    }
