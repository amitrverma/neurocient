import hashlib
import json
import uuid
from datetime import datetime, timedelta

from fastapi import APIRouter, Depends, Header, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy import func, select
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
from app.services.cohorts import PUBLIC_STATUSES, captured_payment_has_seat, enrollment_is_open, occupied_seats, validate_cohort_values
from app.services.razorpay import create_order, razorpay_ready, verify_webhook_signature
from app.utils.auth import get_current_user

router = APIRouter()

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
        "waitlist_available": cohort.status == "full" or seats >= cohort.capacity,
        "checkout_configured": razorpay_ready(),
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
    result = await db.execute(
        select(CohortEnrollment, Cohort)
        .join(Cohort, Cohort.id == CohortEnrollment.cohort_id)
        .where(CohortEnrollment.user_id == current_user.id)
        .order_by(Cohort.starts_at.desc())
    )
    return {"enrollments": [{
        "id": str(enrollment.id), "status": enrollment.status,
        "cohort": {"id": str(cohort.id), "title": cohort.title, "starts_at": cohort.starts_at.isoformat(), "timezone": cohort.timezone},
    } for enrollment, cohort in result.all()]}


@router.post("/cohorts/{cohort_id}/waitlist")
async def join_waitlist(cohort_id: uuid.UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    cohort = await db.get(Cohort, cohort_id)
    if not cohort or cohort.status not in PUBLIC_STATUSES:
        raise HTTPException(status_code=404, detail="Cohort not found")
    seats = await occupied_seats(db, cohort.id)
    if cohort.status != "full" and seats < cohort.capacity:
        raise HTTPException(status_code=409, detail="Waitlist opens when the cohort is full")
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
    position_result = await db.execute(select(func.count(CohortWaitlistEntry.id)).where(
        CohortWaitlistEntry.cohort_id == cohort_id,
        CohortWaitlistEntry.status == "waiting",
        CohortWaitlistEntry.created_at <= entry.created_at,
    ))
    return {"status": entry.status, "position": int(position_result.scalar_one())}


@router.post("/cohorts/{cohort_id}/checkout")
async def begin_checkout(cohort_id: uuid.UUID, current_user: User = Depends(get_current_user), db: AsyncSession = Depends(get_db)):
    if not razorpay_ready():
        raise HTTPException(status_code=503, detail="Checkout is not configured")
    result = await db.execute(select(Cohort).where(Cohort.id == cohort_id).with_for_update())
    cohort = result.scalar_one_or_none()
    if not cohort or cohort.status not in PUBLIC_STATUSES:
        raise HTTPException(status_code=404, detail="Cohort not found")
    existing_result = await db.execute(select(CohortEnrollment).where(
        CohortEnrollment.cohort_id == cohort_id, CohortEnrollment.user_id == current_user.id
    ))
    enrollment = existing_result.scalar_one_or_none()
    if enrollment and enrollment.status in ("paid", "active", "completed"):
        raise HTTPException(status_code=409, detail="You are already enrolled")
    if (
        enrollment
        and enrollment.status == "pending_payment"
        and enrollment.reservation_expires_at
        and enrollment.reservation_expires_at > datetime.utcnow()
        and enrollment.provider_order_id
    ):
        return {
            "key_id": settings.RAZORPAY_KEY_ID, "order_id": enrollment.provider_order_id,
            "amount": enrollment.amount_minor, "currency": enrollment.currency,
            "cohort_title": cohort.title, "email": current_user.email,
            "reservation_expires_at": enrollment.reservation_expires_at.isoformat(),
        }
    seats = await occupied_seats(db, cohort.id)
    if not enrollment_is_open(cohort, seats):
        raise HTTPException(status_code=409, detail={"code": "cohort_full", "waitlist_available": True})
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    enrollment = enrollment or CohortEnrollment(
        cohort_id=cohort.id, user_id=current_user.id,
        amount_minor=cohort.price_minor, currency=cohort.currency,
    )
    enrollment.status = "pending_payment"
    enrollment.reservation_expires_at = expires_at
    enrollment.amount_minor = cohort.price_minor
    enrollment.currency = cohort.currency
    db.add(enrollment)
    await db.flush()
    try:
        order = await create_order(
            amount_minor=cohort.price_minor,
            currency=cohort.currency,
            receipt=str(enrollment.id),
            notes={"cohort_id": str(cohort.id), "enrollment_id": str(enrollment.id), "user_id": str(current_user.id)},
        )
    except Exception:
        await db.rollback()
        raise HTTPException(status_code=502, detail="Payment provider is unavailable")
    enrollment.provider_order_id = order["id"]
    db.add(PaymentRecord(
        enrollment_id=enrollment.id, provider_order_id=order["id"], status="created",
        amount_minor=cohort.price_minor, currency=cohort.currency,
    ))
    await db.commit()
    return {
        "key_id": settings.RAZORPAY_KEY_ID, "order_id": order["id"],
        "amount": cohort.price_minor, "currency": cohort.currency,
        "cohort_title": cohort.title, "email": current_user.email,
        "reservation_expires_at": expires_at.isoformat(),
    }


@router.post("/payments/razorpay/webhook")
async def razorpay_webhook(request: Request, x_razorpay_signature: str | None = Header(default=None), db: AsyncSession = Depends(get_db)):
    body = await request.body()
    if not verify_webhook_signature(body, x_razorpay_signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")
    payload = json.loads(body)
    event_type = payload.get("event", "unknown")
    event_id = request.headers.get("x-razorpay-event-id") or hashlib.sha256(body).hexdigest()
    duplicate = await db.get(PaymentWebhookEvent, event_id)
    if duplicate:
        return {"ok": True, "duplicate": True}
    payment = payload.get("payload", {}).get("payment", {}).get("entity", {})
    webhook = PaymentWebhookEvent(
        provider_event_id=event_id,
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
    if event_type != "payment.captured":
        webhook.status = "ignored"
        webhook.processed_at = datetime.utcnow()
        await db.commit()
        return {"ok": True}
    order_id = payment.get("order_id")
    result = await db.execute(select(CohortEnrollment).where(CohortEnrollment.provider_order_id == order_id).with_for_update())
    enrollment = result.scalar_one_or_none()
    if not enrollment or payment.get("amount") != enrollment.amount_minor or payment.get("currency") != enrollment.currency:
        webhook.status = "rejected"
        webhook.processed_at = datetime.utcnow()
        await db.commit()
        raise HTTPException(status_code=409, detail="Payment does not match an enrollment")
    if enrollment.status == "paid":
        if enrollment.provider_payment_id != payment.get("id"):
            webhook.status = "rejected"
            webhook.processed_at = datetime.utcnow()
            await db.commit()
            raise HTTPException(status_code=409, detail="Enrollment already has a different payment")
        webhook.status = "processed"
        webhook.processed_at = datetime.utcnow()
        await db.commit()
        return {"ok": True, "duplicate": True}
    cohort_result = await db.execute(select(Cohort).where(Cohort.id == enrollment.cohort_id).with_for_update())
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
        enrollment.provider_payment_id = payment.get("id")
        payment_result = await db.execute(select(PaymentRecord).where(PaymentRecord.provider_order_id == order_id))
        record = payment_result.scalar_one_or_none()
        if record:
            record.status = "capacity_conflict"
            record.provider_payment_id = payment.get("id")
        webhook.status = "capacity_conflict"
        webhook.processed_at = datetime.utcnow()
        await audit(db, None, "payment.capacity_conflict", "cohort_enrollment", enrollment.id, {"provider_order_id": order_id})
        await db.commit()
        return {"ok": True, "requires_refund": True}
    enrollment.status = "paid"
    enrollment.provider_payment_id = payment.get("id")
    enrollment.paid_at = datetime.utcnow()
    payment_result = await db.execute(select(PaymentRecord).where(PaymentRecord.provider_order_id == order_id))
    record = payment_result.scalar_one_or_none()
    if record:
        record.status = "captured"
        record.provider_payment_id = payment.get("id")
    webhook.status = "processed"
    webhook.processed_at = datetime.utcnow()
    await audit(db, None, "payment.captured", "cohort_enrollment", enrollment.id, {"provider_order_id": order_id})
    await db.commit()
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
    } for item in sessions_result.scalars().all()]
    data["enrollments"] = [{
        "id": str(item.id), "status": item.status, "email": user.email, "name": user.name,
        "paid_at": item.paid_at.isoformat() if item.paid_at else None,
    } for item, user in enrollments_result.all()]
    data["waitlist"] = [{
        "id": str(item.id), "status": item.status, "email": user.email, "name": user.name,
        "joined_at": item.created_at.isoformat(),
    } for item, user in waitlist_result.all()]
    return data


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
    } for item in sessions_result.scalars().all()]
    data["enrollments"] = [{
        "id": str(item.id), "status": item.status, "email": user.email, "name": user.name,
        "paid_at": item.paid_at.isoformat() if item.paid_at else None,
    } for item, user in enrollments_result.all()]
    data["waitlist"] = [{
        "id": str(item.id), "status": item.status, "email": user.email, "name": user.name,
        "joined_at": item.created_at.isoformat(),
    } for item, user in waitlist_result.all()]
    return data


@router.post("/admin/cohorts", status_code=status.HTTP_201_CREATED)
async def create_cohort(data: CohortInput, admin: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    try:
        validate_cohort_values(starts_at=data.starts_at, ends_at=data.ends_at, capacity=data.capacity, price_minor=data.price_minor)
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
    try:
        validate_cohort_values(starts_at=starts_at, ends_at=ends_at, capacity=capacity, price_minor=price_minor)
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
async def admin_audit(_: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(AdminAuditEvent).order_by(AdminAuditEvent.created_at.desc()).limit(100))
    return {"events": [{
        "id": str(event.id), "action": event.action, "subject_type": event.subject_type,
        "subject_id": event.subject_id, "details": event.details, "created_at": event.created_at.isoformat(),
    } for event in result.scalars().all()]}


@router.get("/admin/payments")
async def admin_payments(_: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PaymentRecord, Cohort, User)
        .join(CohortEnrollment, CohortEnrollment.id == PaymentRecord.enrollment_id)
        .join(Cohort, Cohort.id == CohortEnrollment.cohort_id)
        .join(User, User.id == CohortEnrollment.user_id)
        .order_by(PaymentRecord.created_at.desc()).limit(200)
    )
    return {"payments": [{
        "id": str(payment.id), "status": payment.status, "amount_minor": payment.amount_minor,
        "currency": payment.currency, "provider_order_id": payment.provider_order_id,
        "provider_payment_id": payment.provider_payment_id, "email": user.email,
        "cohort_title": cohort.title, "created_at": payment.created_at.isoformat(),
    } for payment, cohort, user in result.all()]}


@router.get("/admin/payments")
async def admin_payments(_: User = Depends(require_admin), db: AsyncSession = Depends(get_db)):
    result = await db.execute(
        select(PaymentRecord, Cohort, User)
        .join(CohortEnrollment, CohortEnrollment.id == PaymentRecord.enrollment_id)
        .join(Cohort, Cohort.id == CohortEnrollment.cohort_id)
        .join(User, User.id == CohortEnrollment.user_id)
        .order_by(PaymentRecord.created_at.desc()).limit(200)
    )
    return {"payments": [{
        "id": str(payment.id), "status": payment.status, "amount_minor": payment.amount_minor,
        "currency": payment.currency, "provider_order_id": payment.provider_order_id,
        "provider_payment_id": payment.provider_payment_id, "email": user.email,
        "cohort_title": cohort.title, "created_at": payment.created_at.isoformat(),
    } for payment, cohort, user in result.all()]}
