import json
import logging
import uuid
from datetime import UTC, datetime

from fastapi import APIRouter, Depends, Header, HTTPException, Request
from sqlalchemy import or_, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import MembershipBillingEvent, MembershipEntitlement, User
from app.services.membership import (
    entitlement_is_active,
    lock_membership_entitlement,
    membership_summary,
)
from app.services import membership_welcome_email
from app.services.membership_billing import (
    BillingEvent,
    BillingState,
    PlanMismatch,
    reduce_billing_event,
    validate_membership_plan,
)
from app.services.membership_razorpay import (
    ProviderOutcomeUnknown,
    ProviderRejected,
    create_membership_subscription,
    fetch_membership_plan,
    membership_razorpay_ready,
    verify_membership_webhook,
)
from app.services.rate_limits import enforce, enforce_ip
from app.utils.auth import get_current_user


router = APIRouter()
logger = logging.getLogger(__name__)
SUPPORTED_EVENTS = {
    "subscription.authenticated",
    "subscription.activated",
    "subscription.charged",
    "subscription.resumed",
    "subscription.pending",
    "subscription.halted",
    "subscription.paused",
    "subscription.cancelled",
    "subscription.completed",
    "payment.refunded",
    "payment.dispute.created",
}


async def _deliver_membership_welcome(
    db: AsyncSession,
    user_id: uuid.UUID,
    event_id: str,
) -> None:
    try:
        await membership_welcome_email.deliver_membership_welcome_email(db, user_id)
    except membership_welcome_email.WelcomeEmailDeliveryError as error:
        logger.error(
            "membership_payment_fulfilled_email_pending",
            extra={
                "event_id": event_id,
                "user_id": str(user_id),
                "reason_code": error.reason_code,
            },
        )
        if not error.retryable:
            logger.critical(
                "membership_welcome_email_reconciliation_required",
                extra={"event_id": event_id, "user_id": str(user_id)},
            )
            return
        raise HTTPException(
            status_code=503,
            detail={"code": "welcome_email_pending"},
        ) from error


def _from_epoch(value) -> datetime | None:
    if value is None:
        return None
    try:
        return datetime.fromtimestamp(int(value), UTC).replace(tzinfo=None)
    except (TypeError, ValueError, OSError, OverflowError):
        return None


def _payload_object(value, field: str) -> dict:
    if value is None:
        return {}
    if not isinstance(value, dict):
        raise HTTPException(status_code=400, detail=f"Invalid webhook {field}")
    return value


def _provider_text(value, field: str) -> str | None:
    if value is None:
        return None
    if not isinstance(value, str) or not value.strip() or len(value) > 255:
        raise HTTPException(status_code=400, detail=f"Invalid webhook {field}")
    return value


def _provider_integer(value, field: str) -> int | None:
    if value is None:
        return None
    if isinstance(value, bool) or not isinstance(value, int) or not 0 <= value <= 2_147_483_647:
        raise HTTPException(status_code=400, detail=f"Invalid webhook {field}")
    return value


def _checkout_payload(entitlement: MembershipEntitlement, user: User) -> dict:
    return {
        "key_id": settings.RAZORPAY_KEY_ID,
        "subscription_id": entitlement.provider_subscription_id,
        "amount": entitlement.price_minor,
        "currency": entitlement.currency,
        "name": "Neurocient Membership",
        "description": "₹499 per month",
        "email": user.email,
    }


async def _lock_entitlement(db: AsyncSession, user_id) -> MembershipEntitlement | None:
    return await lock_membership_entitlement(db, user_id)


def _apply_event(entitlement: MembershipEntitlement, event: MembershipBillingEvent) -> tuple[str, str | None]:
    decision = reduce_billing_event(
        BillingState(
            status=entitlement.status,
            last_event_at=entitlement.last_provider_event_at,
            current_period_end=entitlement.current_period_end,
            provider_payment_id=entitlement.provider_payment_id,
            last_event_rank=entitlement.last_provider_event_rank,
        ),
        BillingEvent(
            event_type=event.event_type,
            provider_created_at=event.provider_created_at or datetime.utcnow(),
            current_period_end=event.current_period_end,
            provider_payment_id=event.provider_payment_id,
        ),
        now=datetime.utcnow(),
    )
    if decision.outcome == "applied":
        entitlement.status = decision.state.status
        entitlement.provider_status = decision.state.status
        entitlement.provider_payment_id = decision.state.provider_payment_id
        entitlement.current_period_end = decision.state.current_period_end
        entitlement.last_provider_event_at = decision.state.last_event_at
        entitlement.last_provider_event_rank = decision.state.last_event_rank
    return decision.outcome, decision.reason


def _ownership_error(
    entitlement: MembershipEntitlement,
    event: MembershipBillingEvent,
) -> str | None:
    if event.event_type.startswith("subscription.") and (
        event.provider_subscription_id != entitlement.provider_subscription_id
    ):
        return "subscription_mismatch"
    if event.provider_subscription_id not in (
        None,
        entitlement.provider_subscription_id,
    ):
        return "subscription_mismatch"
    if entitlement.provider_plan_id != settings.RAZORPAY_MEMBERSHIP_PLAN_ID:
        return "plan_mismatch"
    if event.event_type.startswith("subscription.") and (
        event.provider_plan_id != settings.RAZORPAY_MEMBERSHIP_PLAN_ID
    ):
        return "plan_mismatch"
    if event.provider_plan_id not in (None, settings.RAZORPAY_MEMBERSHIP_PLAN_ID):
        return "plan_mismatch"
    if event.event_type.startswith("subscription.") and not event.provider_customer_id:
        return "customer_missing"
    if (
        entitlement.provider_customer_id
        and event.provider_customer_id
        and event.provider_customer_id != entitlement.provider_customer_id
    ):
        return "customer_mismatch"
    if event.event_type.startswith("payment.") and (
        not event.provider_payment_id
        or event.amount_minor != settings.RAZORPAY_MEMBERSHIP_AMOUNT_MINOR
        or event.currency != settings.RAZORPAY_MEMBERSHIP_CURRENCY
    ):
        return "payment_mismatch"
    if (event.amount_minor is None) != (event.currency is None):
        return "price_mismatch"
    if event.amount_minor is not None and (
        event.amount_minor != settings.RAZORPAY_MEMBERSHIP_AMOUNT_MINOR
        or event.currency != settings.RAZORPAY_MEMBERSHIP_CURRENCY
    ):
        return "price_mismatch"
    return None


async def _replay_unmatched(db: AsyncSession, entitlement: MembershipEntitlement) -> None:
    if not entitlement.provider_subscription_id:
        return
    ownership_match = (
        MembershipBillingEvent.provider_subscription_id
        == entitlement.provider_subscription_id
    )
    if entitlement.provider_payment_id:
        ownership_match = or_(
            ownership_match,
            MembershipBillingEvent.provider_payment_id
            == entitlement.provider_payment_id,
        )
    result = await db.execute(
        select(MembershipBillingEvent)
        .where(
            ownership_match,
            MembershipBillingEvent.status == "unmatched",
        )
        .order_by(MembershipBillingEvent.provider_created_at, MembershipBillingEvent.created_at)
        .with_for_update()
    )
    for event in result.scalars().all():
        reason = _ownership_error(entitlement, event)
        if reason:
            event.status = "rejected"
            event.reason_code = reason
            event.processed_at = datetime.utcnow()
            logger.warning(
                "membership_billing_event_rejected",
                extra={"reason_code": reason, "provider_event_id": event.provider_event_id},
            )
            continue
        if entitlement.provider_customer_id is None:
            entitlement.provider_customer_id = event.provider_customer_id
        outcome, reason = _apply_event(entitlement, event)
        event.user_id = entitlement.user_id
        event.status = outcome
        event.reason_code = reason
        event.processed_at = datetime.utcnow()


def _webhook_rejection_status(reason: str | None) -> int:
    if reason in {"invalid_provider_data", "customer_missing"}:
        return 400
    return 409


async def _reject_webhook_event(
    db: AsyncSession,
    event: MembershipBillingEvent,
    reason: str,
) -> None:
    event.status = "rejected"
    event.reason_code = reason
    event.processed_at = datetime.utcnow()
    await db.commit()
    logger.warning(
        "membership_billing_event_rejected",
        extra={"reason_code": reason, "provider_event_id": event.provider_event_id},
    )
    raise HTTPException(
        status_code=_webhook_rejection_status(reason),
        detail={"code": reason},
    )


@router.get("/membership/status")
async def membership_status(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    summary = await membership_summary(db, current_user.id)
    entitlement = await db.get(MembershipEntitlement, current_user.id)
    summary["checkout_state"] = entitlement.checkout_state if entitlement else None
    summary["cancellation_state"] = entitlement.cancellation_state if entitlement else None
    summary["cancellation_requested_at"] = (
        entitlement.cancellation_requested_at.isoformat()
        if entitlement and entitlement.cancellation_requested_at
        else None
    )
    summary["checkout_configured"] = membership_razorpay_ready()
    return summary


async def enforce_membership_checkout_ip(request: Request) -> None:
    await enforce_ip(request, "checkout_ip")


@router.post(
    "/membership/checkout",
    dependencies=[Depends(enforce_membership_checkout_ip)],
)
async def begin_membership_checkout(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await enforce(db, [("checkout_user", str(current_user.id))])
    existing = await db.get(MembershipEntitlement, current_user.id)
    if entitlement_is_active(existing):
        raise HTTPException(status_code=409, detail={"code": "membership_active"})
    if existing and existing.status not in {"canceled", "expired", "refunded", "disputed"}:
        if existing.checkout_state == "ready" and existing.provider_subscription_id:
            if not membership_razorpay_ready():
                raise HTTPException(status_code=503, detail={"code": "checkout_unavailable"})
            return _checkout_payload(existing, current_user)
        if existing.checkout_state in {"creating", "unknown"}:
            logger.warning(
                "membership_checkout_reconciliation_required",
                extra={"user_id": str(current_user.id), "operation_id": str(existing.checkout_operation_id)},
            )
            raise HTTPException(status_code=409, detail={"code": "reconciliation_required"})
    if not membership_razorpay_ready():
        raise HTTPException(status_code=503, detail={"code": "checkout_unavailable"})

    try:
        plan = await fetch_membership_plan()
        validate_membership_plan(
            plan,
            plan_id=settings.RAZORPAY_MEMBERSHIP_PLAN_ID,
            amount_minor=settings.RAZORPAY_MEMBERSHIP_AMOUNT_MINOR,
            currency=settings.RAZORPAY_MEMBERSHIP_CURRENCY,
        )
    except (ProviderRejected, ProviderOutcomeUnknown, PlanMismatch):
        logger.warning(
            "membership_checkout_plan_unavailable",
            extra={"user_id": str(current_user.id), "reason_code": "plan_unavailable"},
        )
        raise HTTPException(status_code=503, detail={"code": "checkout_unavailable"})

    # Persist the operation before contacting Razorpay. A process failure after
    # provider acceptance therefore blocks an unsafe automatic retry.
    await db.execute(select(User.id).where(User.id == current_user.id).with_for_update())
    entitlement = await _lock_entitlement(db, current_user.id)
    if entitlement_is_active(entitlement):
        raise HTTPException(status_code=409, detail={"code": "membership_active"})
    if entitlement and entitlement.status in {"canceled", "expired", "refunded", "disputed"}:
        # A deliberate new checkout starts a new subscription generation. Old
        # subscription IDs no longer resolve to this account and cannot revive it.
        entitlement.status = "inactive"
        entitlement.provider_customer_id = None
        entitlement.provider_subscription_id = None
        entitlement.provider_payment_id = None
        entitlement.provider_status = None
        entitlement.current_period_end = None
        entitlement.last_provider_event_at = None
        entitlement.last_provider_event_rank = None
        entitlement.checkout_state = None
        entitlement.cancellation_state = None
        entitlement.cancellation_requested_at = None
    if entitlement and entitlement.checkout_state == "ready" and entitlement.provider_subscription_id:
        return _checkout_payload(entitlement, current_user)
    if entitlement and entitlement.checkout_state in {"creating", "unknown"}:
        logger.warning(
            "membership_checkout_reconciliation_required",
            extra={"user_id": str(current_user.id), "operation_id": str(entitlement.checkout_operation_id)},
        )
        raise HTTPException(status_code=409, detail={"code": "reconciliation_required"})

    operation_id = uuid.uuid4()
    if entitlement is None:
        entitlement = MembershipEntitlement(user_id=current_user.id, status="inactive")
        db.add(entitlement)
    entitlement.provider = "razorpay"
    entitlement.provider_plan_id = settings.RAZORPAY_MEMBERSHIP_PLAN_ID
    entitlement.checkout_operation_id = operation_id
    entitlement.checkout_state = "creating"
    entitlement.price_minor = settings.RAZORPAY_MEMBERSHIP_AMOUNT_MINOR
    entitlement.currency = settings.RAZORPAY_MEMBERSHIP_CURRENCY
    entitlement.billing_total_count = settings.RAZORPAY_MEMBERSHIP_TOTAL_COUNT
    await db.commit()

    try:
        subscription = await create_membership_subscription(
            user_id=str(current_user.id),
            operation_id=str(operation_id),
        )
    except ProviderRejected:
        entitlement = await _lock_entitlement(db, current_user.id)
        if entitlement and entitlement.checkout_operation_id == operation_id:
            entitlement.checkout_state = "failed"
            await db.commit()
        logger.warning(
            "membership_checkout_provider_rejected",
            extra={"user_id": str(current_user.id), "operation_id": str(operation_id)},
        )
        raise HTTPException(status_code=502, detail={"code": "provider_rejected"})
    except ProviderOutcomeUnknown:
        entitlement = await _lock_entitlement(db, current_user.id)
        if entitlement and entitlement.checkout_operation_id == operation_id:
            entitlement.checkout_state = "unknown"
            await db.commit()
        logger.warning(
            "membership_checkout_reconciliation_required",
            extra={"user_id": str(current_user.id), "operation_id": str(operation_id)},
        )
        raise HTTPException(status_code=502, detail={"code": "reconciliation_required"})

    subscription_id = subscription.get("id")
    if not subscription_id or subscription.get("plan_id") != settings.RAZORPAY_MEMBERSHIP_PLAN_ID:
        entitlement = await _lock_entitlement(db, current_user.id)
        if entitlement and entitlement.checkout_operation_id == operation_id:
            entitlement.checkout_state = "unknown"
            await db.commit()
        logger.warning(
            "membership_checkout_reconciliation_required",
            extra={"user_id": str(current_user.id), "operation_id": str(operation_id)},
        )
        raise HTTPException(status_code=502, detail={"code": "reconciliation_required"})

    entitlement = await _lock_entitlement(db, current_user.id)
    if not entitlement or entitlement.checkout_operation_id != operation_id:
        logger.warning(
            "membership_checkout_reconciliation_required",
            extra={"user_id": str(current_user.id), "operation_id": str(operation_id)},
        )
        raise HTTPException(status_code=409, detail={"code": "reconciliation_required"})
    if entitlement.provider_subscription_id not in (None, subscription_id):
        entitlement.checkout_state = "unknown"
        await db.commit()
        logger.warning(
            "membership_checkout_reconciliation_required",
            extra={"user_id": str(current_user.id), "operation_id": str(operation_id)},
        )
        raise HTTPException(status_code=409, detail={"code": "reconciliation_required"})
    response_customer_id = subscription.get("customer_id")
    if (
        response_customer_id
        and entitlement.provider_customer_id
        and entitlement.provider_customer_id != response_customer_id
    ):
        entitlement.checkout_state = "unknown"
        await db.commit()
        logger.warning(
            "membership_checkout_reconciliation_required",
            extra={"user_id": str(current_user.id), "operation_id": str(operation_id)},
        )
        raise HTTPException(status_code=409, detail={"code": "reconciliation_required"})
    entitlement.provider_subscription_id = subscription_id
    if response_customer_id:
        entitlement.provider_customer_id = response_customer_id
    entitlement.provider_status = subscription.get("status")
    entitlement.checkout_state = "ready"
    await _replay_unmatched(db, entitlement)
    await db.commit()
    return _checkout_payload(entitlement, current_user)


@router.post("/membership/razorpay/webhook")
async def membership_webhook(
    request: Request,
    x_razorpay_signature: str | None = Header(default=None),
    x_razorpay_event_id: str | None = Header(default=None),
    db: AsyncSession = Depends(get_db),
):
    body = await request.body()
    if not verify_membership_webhook(body, x_razorpay_signature):
        raise HTTPException(status_code=401, detail="Invalid webhook signature")
    if not x_razorpay_event_id:
        raise HTTPException(status_code=400, detail="Missing webhook event id")
    if len(x_razorpay_event_id) > 255:
        raise HTTPException(status_code=400, detail="Invalid webhook event id")
    try:
        payload = json.loads(body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        raise HTTPException(status_code=400, detail="Invalid webhook payload")
    if not isinstance(payload, dict):
        raise HTTPException(status_code=400, detail="Invalid webhook payload")

    event_type = _provider_text(payload.get("event"), "event type")
    if not event_type:
        raise HTTPException(status_code=400, detail="Invalid webhook event type")
    provider_payload = _payload_object(payload.get("payload"), "payload")
    subscription_wrapper = _payload_object(
        provider_payload.get("subscription"), "subscription"
    )
    payment_wrapper = _payload_object(provider_payload.get("payment"), "payment")
    subscription = _payload_object(subscription_wrapper.get("entity"), "subscription entity")
    payment = _payload_object(payment_wrapper.get("entity"), "payment entity")
    subscription_entity_id = _provider_text(subscription.get("id"), "subscription id")
    payment_subscription_id = _provider_text(
        payment.get("subscription_id"), "payment subscription id"
    )
    subscription_id = subscription_entity_id or payment_subscription_id
    payment_id = _provider_text(payment.get("id"), "payment id")
    payment_status = _provider_text(payment.get("status"), "payment status")
    subscription_customer_id = _provider_text(
        subscription.get("customer_id"), "subscription customer id"
    )
    payment_customer_id = _provider_text(payment.get("customer_id"), "payment customer id")
    customer_id = subscription_customer_id or payment_customer_id
    provider_plan_id = _provider_text(subscription.get("plan_id"), "plan id")
    amount_minor = _provider_integer(payment.get("amount"), "payment amount")
    raw_currency = _provider_text(payment.get("currency"), "payment currency")
    currency = raw_currency.upper() if raw_currency else None
    provider_created_at = _from_epoch(payload.get("created_at"))
    period_end = _from_epoch(subscription.get("current_end"))

    inserted = await db.execute(
        insert(MembershipBillingEvent)
        .values(
            provider_event_id=x_razorpay_event_id,
            event_type=event_type,
            provider_subscription_id=subscription_id,
            provider_payment_id=payment_id,
            provider_customer_id=customer_id,
            provider_plan_id=provider_plan_id,
            amount_minor=amount_minor,
            currency=currency,
            provider_created_at=provider_created_at,
            current_period_end=period_end,
            status="received",
        )
        .on_conflict_do_nothing(index_elements=[MembershipBillingEvent.provider_event_id])
        .returning(MembershipBillingEvent.provider_event_id)
    )
    if inserted.scalar_one_or_none() is None:
        await db.rollback()
        prior = await db.get(MembershipBillingEvent, x_razorpay_event_id)
        if prior and prior.status == "rejected":
            raise HTTPException(
                status_code=_webhook_rejection_status(prior.reason_code),
                detail={"code": prior.reason_code},
            )
        if prior and prior.user_id:
            entitlement = await db.get(MembershipEntitlement, prior.user_id)
            if entitlement_is_active(entitlement):
                await membership_welcome_email.ensure_membership_welcome_delivery(
                    db, prior.user_id
                )
                await db.commit()
                await _deliver_membership_welcome(
                    db, prior.user_id, x_razorpay_event_id
                )
        return {"ok": True, "duplicate": True}
    event = await db.get(MembershipBillingEvent, x_razorpay_event_id)

    if event_type not in SUPPORTED_EVENTS:
        event.status = "ignored"
        event.reason_code = "unsupported_event"
        event.processed_at = datetime.utcnow()
        await db.commit()
        return {"ok": True}

    if (
        subscription_entity_id
        and payment_subscription_id
        and subscription_entity_id != payment_subscription_id
    ):
        await _reject_webhook_event(db, event, "subscription_mismatch")
    if (
        subscription_customer_id
        and payment_customer_id
        and subscription_customer_id != payment_customer_id
    ):
        await _reject_webhook_event(db, event, "customer_mismatch")
    if event_type == "subscription.charged" and (
        not payment or not payment_id or payment_status != "captured"
    ):
        await _reject_webhook_event(db, event, "invalid_provider_data")
    if (
        event_type.startswith("subscription.")
        and provider_plan_id != settings.RAZORPAY_MEMBERSHIP_PLAN_ID
    ):
        await _reject_webhook_event(db, event, "plan_mismatch")
    if payment and (
        amount_minor != settings.RAZORPAY_MEMBERSHIP_AMOUNT_MINOR
        or currency != settings.RAZORPAY_MEMBERSHIP_CURRENCY
    ):
        await _reject_webhook_event(db, event, "price_mismatch")
    if (
        (event_type.startswith("subscription.") and not subscription_entity_id)
        or (event_type.startswith("payment.") and not payment_id)
        or not provider_created_at
        or (event_type.startswith("subscription.") and not customer_id)
    ):
        await _reject_webhook_event(
            db,
            event,
            "customer_missing" if not customer_id else "invalid_provider_data",
        )

    ownership_filter = (
        MembershipEntitlement.provider_subscription_id == subscription_entity_id
        if subscription_entity_id
        else MembershipEntitlement.provider_payment_id == payment_id
    )
    result = await db.execute(
        select(MembershipEntitlement)
        .where(ownership_filter)
        .with_for_update()
        .execution_options(populate_existing=True)
    )
    entitlement = result.scalar_one_or_none()

    if entitlement is None:
        event.status = "unmatched"
        event.reason_code = "subscription_not_mapped"
        await db.commit()
        logger.warning(
            "membership_billing_event_unmatched",
            extra={"provider_event_id": event.provider_event_id},
        )
        return {"ok": True}
    ownership_error = _ownership_error(entitlement, event)
    if ownership_error:
        await _reject_webhook_event(db, event, ownership_error)
    if entitlement.provider_customer_id is None:
        entitlement.provider_customer_id = event.provider_customer_id

    event.user_id = entitlement.user_id
    outcome, reason = _apply_event(entitlement, event)
    if event.event_type == "subscription.cancelled" and outcome == "applied":
        entitlement.cancellation_state = "completed"
    event.status = outcome
    event.reason_code = reason
    event.processed_at = datetime.utcnow()
    await _replay_unmatched(db, entitlement)
    welcome_due = entitlement_is_active(entitlement)
    if welcome_due:
        await membership_welcome_email.ensure_membership_welcome_delivery(
            db, entitlement.user_id
        )
    await db.commit()
    if welcome_due:
        await _deliver_membership_welcome(
            db, entitlement.user_id, x_razorpay_event_id
        )
    return {"ok": True, "outcome": outcome}
