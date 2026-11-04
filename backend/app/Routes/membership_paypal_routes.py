import json
import logging
import uuid
from datetime import UTC, datetime
from decimal import Decimal, InvalidOperation

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy import select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.Routes.membership_routes import _apply_event, _deliver_membership_welcome
from app.config import settings
from app.database import get_db
from app.models import MembershipBillingEvent, MembershipEntitlement, User
from app.services import membership_welcome_email
from app.services.membership import (
    entitlement_is_active,
    lock_membership_entitlement,
)
from app.services.membership_billing import PlanMismatch, validate_paypal_membership_plan
from app.services.paypal import (
    ProviderOutcomeUnknown,
    ProviderRejected,
    ProviderUnavailable,
    create_membership_subscription,
    fetch_membership_plan,
    fetch_membership_subscription,
    paypal_membership_ready,
    verify_webhook,
)
from app.services.rate_limits import enforce, enforce_ip
from app.utils.auth import get_current_user


router = APIRouter()
logger = logging.getLogger(__name__)

EVENT_MAP = {
    "BILLING.SUBSCRIPTION.CREATED": "subscription.authenticated",
    "BILLING.SUBSCRIPTION.ACTIVATED": "subscription.activated",
    "BILLING.SUBSCRIPTION.SUSPENDED": "subscription.halted",
    "BILLING.SUBSCRIPTION.CANCELLED": "subscription.cancelled",
    "BILLING.SUBSCRIPTION.EXPIRED": "subscription.completed",
    "BILLING.SUBSCRIPTION.PAYMENT.FAILED": "subscription.pending",
    "PAYMENT.SALE.COMPLETED": "subscription.charged",
    "PAYMENT.SALE.REFUNDED": "payment.refunded",
    "PAYMENT.SALE.REVERSED": "payment.dispute.created",
}


def _parse_datetime(value: object) -> datetime | None:
    if not isinstance(value, str) or len(value) > 64:
        return None
    try:
        parsed = datetime.fromisoformat(value.replace("Z", "+00:00"))
    except ValueError:
        return None
    if parsed.tzinfo is not None:
        parsed = parsed.astimezone(UTC).replace(tzinfo=None)
    return parsed


def _text(value: object) -> str | None:
    return value if isinstance(value, str) and 0 < len(value) <= 255 else None


def _amount_minor(amount: object) -> int | None:
    try:
        value = Decimal(str(amount))
    except (InvalidOperation, ValueError):
        return None
    minor = value * 100
    if minor != minor.to_integral_value() or not 0 <= minor <= 2_147_483_647:
        return None
    return int(minor)


def _checkout_payload(entitlement: MembershipEntitlement, approval_url: str) -> dict:
    return {
        "provider": "paypal",
        "subscription_id": entitlement.provider_subscription_id,
        "approval_url": approval_url,
        "amount": entitlement.price_minor,
        "currency": entitlement.currency,
        "description": "USD 6 per month",
    }


async def enforce_membership_checkout_ip(request: Request) -> None:
    await enforce_ip(request, "checkout_ip")


@router.post(
    "/membership/paypal/checkout",
    dependencies=[Depends(enforce_membership_checkout_ip)],
)
async def begin_paypal_membership_checkout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await enforce(db, [("checkout_user", str(current_user.id))])
    existing = await db.get(MembershipEntitlement, current_user.id)
    if entitlement_is_active(existing):
        raise HTTPException(409, detail={"code": "membership_active"})
    if existing and existing.checkout_state in {"creating", "unknown"}:
        raise HTTPException(409, detail={"code": "reconciliation_required"})
    if existing and existing.checkout_state == "ready" and existing.provider_subscription_id:
        if existing.provider != "paypal":
            raise HTTPException(409, detail={"code": "checkout_provider_conflict"})
        subscription = await fetch_membership_subscription(
            existing.provider_subscription_id
        )
        approval_url = next(
            (
                link.get("href")
                for link in subscription.get("links", [])
                if isinstance(link, dict) and link.get("rel") == "approve"
            ),
            None,
        )
        if not isinstance(approval_url, str):
            raise HTTPException(409, detail={"code": "reconciliation_required"})
        return _checkout_payload(existing, approval_url)
    if not paypal_membership_ready():
        raise HTTPException(503, detail={"code": "checkout_unavailable"})

    try:
        plan = await fetch_membership_plan()
        validate_paypal_membership_plan(
            plan,
            plan_id=settings.PAYPAL_MEMBERSHIP_PLAN_ID,
            amount_minor=settings.PAYPAL_MEMBERSHIP_AMOUNT_MINOR,
            currency=settings.PAYPAL_MEMBERSHIP_CURRENCY,
        )
    except (ProviderRejected, ProviderOutcomeUnknown, ProviderUnavailable, PlanMismatch):
        raise HTTPException(503, detail={"code": "checkout_unavailable"})

    await db.execute(
        select(User.id).where(User.id == current_user.id).with_for_update()
    )
    entitlement = await lock_membership_entitlement(db, current_user.id)
    if entitlement_is_active(entitlement):
        raise HTTPException(409, detail={"code": "membership_active"})
    if entitlement and entitlement.checkout_state in {"creating", "unknown"}:
        raise HTTPException(409, detail={"code": "reconciliation_required"})
    if entitlement and entitlement.checkout_state == "ready" and entitlement.provider_subscription_id:
        raise HTTPException(409, detail={"code": "checkout_provider_conflict"})

    if entitlement is None:
        entitlement = MembershipEntitlement(user_id=current_user.id, status="inactive")
        db.add(entitlement)
    elif entitlement.status in {"canceled", "expired", "refunded", "disputed"}:
        entitlement.status = "inactive"
        entitlement.provider_customer_id = None
        entitlement.provider_subscription_id = None
        entitlement.provider_payment_id = None
        entitlement.provider_status = None
        entitlement.current_period_end = None
        entitlement.last_provider_event_at = None
        entitlement.last_provider_event_rank = None
        entitlement.cancellation_state = None
        entitlement.cancellation_requested_at = None

    operation_id = uuid.uuid4()
    entitlement.provider = "paypal"
    entitlement.provider_plan_id = settings.PAYPAL_MEMBERSHIP_PLAN_ID
    entitlement.checkout_operation_id = operation_id
    entitlement.checkout_state = "creating"
    entitlement.price_minor = settings.PAYPAL_MEMBERSHIP_AMOUNT_MINOR
    entitlement.currency = settings.PAYPAL_MEMBERSHIP_CURRENCY
    entitlement.billing_total_count = None
    await db.commit()

    try:
        subscription = await create_membership_subscription(
            user_id=str(current_user.id),
            request_id=f"membership-{operation_id}",
        )
    except ProviderRejected as exc:
        entitlement = await lock_membership_entitlement(db, current_user.id)
        if entitlement and entitlement.checkout_operation_id == operation_id:
            entitlement.checkout_state = "failed"
            await db.commit()
        raise HTTPException(502, detail={"code": "provider_rejected"}) from exc
    except ProviderOutcomeUnknown as exc:
        entitlement = await lock_membership_entitlement(db, current_user.id)
        if entitlement and entitlement.checkout_operation_id == operation_id:
            entitlement.checkout_state = "unknown"
            await db.commit()
        raise HTTPException(502, detail={"code": "reconciliation_required"}) from exc

    entitlement = await lock_membership_entitlement(db, current_user.id)
    subscription_id = _text(subscription.get("id"))
    if (
        not entitlement
        or entitlement.checkout_operation_id != operation_id
        or not subscription_id
        or entitlement.provider_subscription_id not in (None, subscription_id)
    ):
        if entitlement and entitlement.checkout_operation_id == operation_id:
            entitlement.checkout_state = "unknown"
            await db.commit()
        raise HTTPException(409, detail={"code": "reconciliation_required"})
    entitlement.provider_subscription_id = subscription_id
    entitlement.provider_status = _text(subscription.get("status"))
    entitlement.checkout_state = "ready"
    await db.commit()
    return _checkout_payload(entitlement, subscription["approval_url"])


@router.post("/membership/paypal/webhook")
async def paypal_membership_webhook(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    body = await request.body()
    try:
        verified = await verify_webhook(
            body,
            dict(request.headers),
            webhook_id=settings.PAYPAL_MEMBERSHIP_WEBHOOK_ID,
        )
    except (ProviderOutcomeUnknown, ProviderUnavailable) as exc:
        raise HTTPException(503, detail={"code": "webhook_verification_unavailable"}) from exc
    if not verified:
        raise HTTPException(401, detail={"code": "invalid_webhook_signature"})
    try:
        payload = json.loads(body)
    except (json.JSONDecodeError, UnicodeDecodeError) as exc:
        raise HTTPException(400, detail={"code": "invalid_payload"}) from exc
    event_id = _text(payload.get("id"))
    paypal_type = _text(payload.get("event_type"))
    resource = payload.get("resource")
    if not event_id or not paypal_type or not isinstance(resource, dict):
        raise HTTPException(400, detail={"code": "invalid_payload"})
    internal_type = EVENT_MAP.get(paypal_type)
    ledger_id = f"paypal:{event_id}"
    if not internal_type:
        inserted = await db.execute(
            insert(MembershipBillingEvent)
            .values(
                provider_event_id=ledger_id,
                provider="paypal",
                event_type=paypal_type,
                status="ignored",
                reason_code="unsupported_event",
                processed_at=datetime.utcnow(),
            )
            .on_conflict_do_nothing(index_elements=[MembershipBillingEvent.provider_event_id])
        )
        await db.commit()
        return {"ok": True, "ignored": True}

    subscription_id = (
        _text(resource.get("id"))
        if paypal_type.startswith("BILLING.SUBSCRIPTION.")
        else _text(resource.get("billing_agreement_id"))
    )
    if not subscription_id:
        raise HTTPException(400, detail={"code": "subscription_missing"})
    try:
        subscription = await fetch_membership_subscription(subscription_id)
    except (ProviderRejected, ProviderOutcomeUnknown, ProviderUnavailable) as exc:
        raise HTTPException(503, detail={"code": "subscription_verification_unavailable"}) from exc

    plan_id = _text(subscription.get("plan_id"))
    user_id_text = _text(subscription.get("custom_id"))
    try:
        user_id = uuid.UUID(user_id_text) if user_id_text else None
    except ValueError:
        user_id = None
    subscriber = subscription.get("subscriber")
    customer_id = _text(subscriber.get("payer_id")) if isinstance(subscriber, dict) else None
    billing_info = subscription.get("billing_info")
    period_end = (
        _parse_datetime(billing_info.get("next_billing_time"))
        if isinstance(billing_info, dict)
        else None
    )
    payment_id = _text(resource.get("id")) if paypal_type.startswith("PAYMENT.SALE.") else None
    amount = resource.get("amount") if isinstance(resource.get("amount"), dict) else {}
    amount_minor = _amount_minor(amount.get("total")) if amount else None
    currency = _text(amount.get("currency")) if amount else None
    currency = currency.upper() if currency else None
    event_time = _parse_datetime(payload.get("create_time"))

    inserted = await db.execute(
        insert(MembershipBillingEvent)
        .values(
            provider_event_id=ledger_id,
            provider="paypal",
            event_type=internal_type,
            user_id=user_id,
            provider_subscription_id=subscription_id,
            provider_payment_id=payment_id,
            provider_customer_id=customer_id,
            provider_plan_id=plan_id,
            amount_minor=amount_minor,
            currency=currency,
            provider_created_at=event_time,
            current_period_end=period_end,
            status="received",
        )
        .on_conflict_do_nothing(index_elements=[MembershipBillingEvent.provider_event_id])
        .returning(MembershipBillingEvent.provider_event_id)
    )
    if inserted.scalar_one_or_none() is None:
        await db.rollback()
        return {"ok": True, "duplicate": True}
    event = await db.get(MembershipBillingEvent, ledger_id)

    invalid_reason = None
    if (
        not user_id
        or not event_time
        or (internal_type != "subscription.authenticated" and not customer_id)
    ):
        invalid_reason = "invalid_provider_data"
    elif plan_id != settings.PAYPAL_MEMBERSHIP_PLAN_ID:
        invalid_reason = "plan_mismatch"
    elif amount and (
        amount_minor != settings.PAYPAL_MEMBERSHIP_AMOUNT_MINOR
        or currency != settings.PAYPAL_MEMBERSHIP_CURRENCY
    ):
        invalid_reason = "price_mismatch"
    elif internal_type in {
        "subscription.activated",
        "subscription.charged",
    } and not period_end:
        invalid_reason = "invalid_paid_through"
    if invalid_reason:
        event.status = "rejected"
        event.reason_code = invalid_reason
        event.processed_at = datetime.utcnow()
        await db.commit()
        raise HTTPException(409, detail={"code": invalid_reason})

    entitlement = await lock_membership_entitlement(db, user_id)
    if (
        not entitlement
        or entitlement.provider != "paypal"
        or entitlement.provider_plan_id != settings.PAYPAL_MEMBERSHIP_PLAN_ID
        or entitlement.provider_subscription_id not in (None, subscription_id)
        or entitlement.price_minor != settings.PAYPAL_MEMBERSHIP_AMOUNT_MINOR
        or entitlement.currency != settings.PAYPAL_MEMBERSHIP_CURRENCY
    ):
        event.status = "unmatched"
        event.reason_code = "subscription_not_mapped"
        await db.commit()
        return {"ok": True, "unmatched": True}

    entitlement.provider_subscription_id = subscription_id
    if customer_id:
        entitlement.provider_customer_id = customer_id
    entitlement.checkout_state = "ready"
    if internal_type == "subscription.cancelled" and entitlement.status == "active":
        # PayPal acknowledges cancellation immediately. Preserve already-paid
        # access until current_period_end while stopping future renewals.
        outcome, reason = "applied", "access_until_paid_through"
        entitlement.provider_status = "canceled"
        entitlement.cancellation_state = "completed"
        entitlement.last_provider_event_at = event.provider_created_at
    else:
        outcome, reason = _apply_event(entitlement, event)
    if internal_type == "subscription.cancelled" and outcome == "applied":
        entitlement.cancellation_state = "completed"
    event.status = outcome
    event.reason_code = reason
    event.processed_at = datetime.utcnow()
    welcome_due = entitlement_is_active(entitlement)
    if welcome_due:
        await membership_welcome_email.ensure_membership_welcome_delivery(db, user_id)
    await db.commit()
    if welcome_due:
        await _deliver_membership_welcome(db, user_id, ledger_id)
    return {"ok": True, "outcome": outcome}
