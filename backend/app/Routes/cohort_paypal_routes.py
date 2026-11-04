import json
import uuid
from datetime import datetime, timedelta
from decimal import Decimal, InvalidOperation

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.exc import IntegrityError
from sqlalchemy.ext.asyncio import AsyncSession

from app.Routes.cohort_routes import _deliver_paid_enrollment_welcome, enforce_checkout_ip
from app.config import settings
from app.database import get_db
from app.models import (
    Cohort,
    CohortEnrollment,
    PaymentRecord,
    PaymentWebhookEvent,
    User,
)
from app.services.cohort_billing import CaptureMismatch, apply_verified_capture
from app.services.cohorts import (
    PUBLIC_STATUSES,
    enrollment_is_open,
    occupied_seats,
    validate_modern_caveman_price,
)
from app.services.paypal import (
    ProviderOutcomeUnknown,
    ProviderRejected,
    ProviderUnavailable,
    capture_cohort_order,
    create_cohort_order,
    paypal_cohort_ready,
    verify_webhook,
)
from app.services.rate_limits import enforce
from app.utils.auth import get_current_user


router = APIRouter()


def _amount_minor(value: object) -> int | None:
    try:
        amount = Decimal(str(value)) * 100
    except (InvalidOperation, ValueError):
        return None
    if amount != amount.to_integral_value() or not 0 <= amount <= 2_147_483_647:
        return None
    return int(amount)


def _paypal_capture(payload: dict) -> tuple[str | None, str | None, int | None, str | None]:
    resource = payload.get("resource")
    if not isinstance(resource, dict):
        return None, None, None, None
    payment_id = resource.get("id") if isinstance(resource.get("id"), str) else None
    amount = resource.get("amount") if isinstance(resource.get("amount"), dict) else {}
    supplementary = resource.get("supplementary_data")
    related = (
        supplementary.get("related_ids")
        if isinstance(supplementary, dict)
        and isinstance(supplementary.get("related_ids"), dict)
        else {}
    )
    order_id = related.get("order_id") if isinstance(related.get("order_id"), str) else None
    currency = amount.get("currency_code") if isinstance(amount.get("currency_code"), str) else None
    return payment_id, order_id, _amount_minor(amount.get("value")), currency


@router.post(
    "/cohorts/{cohort_id}/paypal/checkout",
    dependencies=[Depends(enforce_checkout_ip)],
)
async def begin_paypal_cohort_checkout(
    cohort_id: uuid.UUID,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await enforce(db, [("checkout_user", str(current_user.id))])
    if not paypal_cohort_ready():
        raise HTTPException(503, detail={"code": "checkout_temporarily_unavailable"})
    result = await db.execute(
        select(Cohort).where(Cohort.id == cohort_id).with_for_update()
    )
    cohort = result.scalar_one_or_none()
    if not cohort or cohort.status not in PUBLIC_STATUSES:
        raise HTTPException(404, detail="Cohort not found")
    try:
        validate_modern_caveman_price(
            price_minor=cohort.price_minor, currency=cohort.currency
        )
    except ValueError as exc:
        raise HTTPException(503, detail={"code": "cohort_price_misconfigured"}) from exc

    existing_result = await db.execute(
        select(CohortEnrollment).where(
            CohortEnrollment.cohort_id == cohort_id,
            CohortEnrollment.user_id == current_user.id,
        )
    )
    enrollment = existing_result.scalar_one_or_none()
    if enrollment and enrollment.status in ("paid", "active", "completed"):
        raise HTTPException(409, detail={"code": "already_enrolled"})
    if enrollment and enrollment.status in ("checkout_creating", "checkout_unknown"):
        raise HTTPException(409, detail={"code": "checkout_reconciliation_required"})
    if (
        enrollment
        and enrollment.status == "pending_payment"
        and enrollment.reservation_expires_at
        and enrollment.reservation_expires_at > datetime.utcnow()
        and enrollment.provider_order_id
    ):
        if enrollment.provider != "paypal":
            raise HTTPException(409, detail={"code": "checkout_provider_conflict"})
        raise HTTPException(409, detail={"code": "checkout_already_started"})

    seats = await occupied_seats(db, cohort.id)
    if not enrollment_is_open(cohort, seats):
        raise HTTPException(409, detail={"code": "cohort_full", "waitlist_available": True})
    expires_at = datetime.utcnow() + timedelta(minutes=15)
    enrollment = enrollment or CohortEnrollment(
        cohort_id=cohort.id,
        user_id=current_user.id,
        amount_minor=settings.PAYPAL_COHORT_AMOUNT_MINOR,
        currency=settings.PAYPAL_COHORT_CURRENCY,
    )
    enrollment.status = "checkout_creating"
    enrollment.provider = "paypal"
    enrollment.reservation_expires_at = expires_at
    enrollment.amount_minor = settings.PAYPAL_COHORT_AMOUNT_MINOR
    enrollment.currency = settings.PAYPAL_COHORT_CURRENCY
    enrollment.provider_order_id = None
    enrollment.provider_payment_id = None
    db.add(enrollment)
    await db.commit()
    enrollment_id = enrollment.id
    request_id = f"cohort-{enrollment_id}-order-v1"

    try:
        order = await create_cohort_order(
            enrollment_id=str(enrollment_id), request_id=request_id
        )
    except ProviderRejected as exc:
        enrollment = await db.scalar(
            select(CohortEnrollment)
            .where(CohortEnrollment.id == enrollment_id)
            .with_for_update()
        )
        enrollment.status = "payment_failed"
        enrollment.reservation_expires_at = None
        await db.commit()
        raise HTTPException(503, detail={"code": "checkout_temporarily_unavailable"}) from exc
    except ProviderOutcomeUnknown as exc:
        enrollment = await db.scalar(
            select(CohortEnrollment)
            .where(CohortEnrollment.id == enrollment_id)
            .with_for_update()
        )
        enrollment.status = "checkout_unknown"
        await db.commit()
        raise HTTPException(502, detail={"code": "checkout_reconciliation_required"}) from exc

    enrollment = await db.scalar(
        select(CohortEnrollment)
        .where(CohortEnrollment.id == enrollment_id)
        .with_for_update()
    )
    enrollment.status = "pending_payment"
    enrollment.provider_order_id = order["id"]
    db.add(
        PaymentRecord(
            enrollment_id=enrollment.id,
            provider="paypal",
            provider_order_id=order["id"],
            status="created",
            amount_minor=settings.PAYPAL_COHORT_AMOUNT_MINOR,
            currency=settings.PAYPAL_COHORT_CURRENCY,
        )
    )
    await db.commit()
    return {
        "provider": "paypal",
        "order_id": order["id"],
        "approval_url": order["approval_url"],
        "amount": settings.PAYPAL_COHORT_AMOUNT_MINOR,
        "currency": settings.PAYPAL_COHORT_CURRENCY,
        "cohort_title": cohort.title,
        "reservation_expires_at": expires_at.isoformat(),
    }


@router.post("/cohorts/{cohort_id}/paypal/capture")
async def submit_paypal_cohort_capture(
    cohort_id: uuid.UUID,
    payload: dict,
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await enforce(db, [("checkout_user", str(current_user.id))])
    order_id = payload.get("order_id")
    if not isinstance(order_id, str) or not order_id or len(order_id) > 255:
        raise HTTPException(400, detail={"code": "invalid_checkout_callback"})
    enrollment = await db.scalar(
        select(CohortEnrollment)
        .where(
            CohortEnrollment.cohort_id == cohort_id,
            CohortEnrollment.user_id == current_user.id,
        )
        .with_for_update()
    )
    if (
        not enrollment
        or enrollment.provider != "paypal"
        or enrollment.provider_order_id != order_id
    ):
        raise HTTPException(404, detail={"code": "checkout_not_found"})
    try:
        await capture_cohort_order(
            order_id=order_id,
            request_id=f"cohort-{enrollment.id}-capture-v1",
        )
    except ProviderRejected as exc:
        raise HTTPException(502, detail={"code": "capture_provider_rejected"}) from exc
    except ProviderOutcomeUnknown as exc:
        payment = await db.scalar(
            select(PaymentRecord)
            .where(
                PaymentRecord.provider == "paypal",
                PaymentRecord.provider_order_id == order_id,
            )
            .with_for_update()
        )
        if payment:
            payment.status = "capture_unknown"
            await db.commit()
        raise HTTPException(502, detail={"code": "checkout_reconciliation_required"}) from exc
    payment = await db.scalar(
        select(PaymentRecord)
        .where(
            PaymentRecord.provider == "paypal",
            PaymentRecord.provider_order_id == order_id,
        )
        .with_for_update()
    )
    if payment and payment.status == "created":
        payment.status = "capture_submitted"
    await db.commit()
    return {"captured": True, "confirmed": False}


@router.post("/payments/paypal/webhook")
async def paypal_payment_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    body = await request.body()
    try:
        verified = await verify_webhook(
            body,
            dict(request.headers),
            webhook_id=settings.PAYPAL_COHORT_WEBHOOK_ID,
        )
    except (ProviderOutcomeUnknown, ProviderUnavailable) as exc:
        raise HTTPException(503, detail={"code": "webhook_verification_unavailable"}) from exc
    if not verified:
        raise HTTPException(401, detail={"code": "invalid_webhook_signature"})
    try:
        payload = json.loads(body)
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise HTTPException(400, detail={"code": "invalid_payload"}) from exc
    event_id = payload.get("id")
    event_type = payload.get("event_type")
    if not isinstance(event_id, str) or not event_id or len(event_id) > 240:
        raise HTTPException(400, detail={"code": "invalid_event_id"})
    if not isinstance(event_type, str) or not event_type:
        raise HTTPException(400, detail={"code": "invalid_event_type"})
    ledger_id = f"paypal:{event_id}"
    payment_id, order_id, amount_minor, currency = _paypal_capture(payload)
    webhook = PaymentWebhookEvent(
        provider_event_id=ledger_id,
        provider="paypal",
        event_type=event_type,
        payload={
            "payment_id": payment_id,
            "order_id": order_id,
            "amount_minor": amount_minor,
            "currency": currency,
        },
    )
    db.add(webhook)
    try:
        await db.flush()
    except IntegrityError:
        await db.rollback()
        return {"ok": True, "duplicate": True}

    if event_type != "PAYMENT.CAPTURE.COMPLETED":
        webhook.status = "ignored"
        webhook.processed_at = datetime.utcnow()
        await db.commit()
        return {"ok": True, "ignored": True}
    if not payment_id or not order_id or amount_minor is None or not currency:
        webhook.status = "rejected"
        webhook.processed_at = datetime.utcnow()
        await db.commit()
        raise HTTPException(400, detail={"code": "invalid_payment"})
    try:
        result = await apply_verified_capture(
            db,
            webhook=webhook,
            provider="paypal",
            order_id=order_id,
            payment_id=payment_id,
            amount_minor=amount_minor,
            currency=currency,
        )
    except CaptureMismatch as exc:
        webhook.status = "rejected"
        webhook.processed_at = datetime.utcnow()
        await db.commit()
        raise HTTPException(409, detail={"code": "payment_mismatch"}) from exc
    await db.commit()
    if result.requires_refund:
        return {"ok": True, "requires_refund": True}
    await _deliver_paid_enrollment_welcome(db, result.enrollment_id, ledger_id)
    return {"ok": True, "duplicate": result.outcome == "duplicate"}
