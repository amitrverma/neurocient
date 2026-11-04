from datetime import datetime

from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import User
from app.services.membership import lock_membership_entitlement
from app.services.membership_razorpay import (
    ProviderOutcomeUnknown,
    ProviderRejected,
    cancel_membership_subscription_at_period_end,
)
from app.services.paypal import (
    ProviderOutcomeUnknown as PayPalOutcomeUnknown,
    ProviderRejected as PayPalRejected,
    cancel_membership_subscription as cancel_paypal_membership_subscription,
)
from app.services.rate_limits import enforce, enforce_ip
from app.utils.auth import get_current_user


router = APIRouter()


async def enforce_membership_cancellation_ip(request: Request) -> None:
    await enforce_ip(request, "checkout_ip")


async def _mark_cancellation_state(
    db: AsyncSession,
    user_id,
    subscription_id: str,
    state: str,
) -> None:
    entitlement = await lock_membership_entitlement(db, user_id)
    if entitlement and entitlement.provider_subscription_id == subscription_id:
        entitlement.cancellation_state = state
        await db.commit()


def _confirms_period_end(response: dict, subscription_id: str) -> bool:
    # Razorpay returns the subscription entity for an accepted cancellation but
    # does not echo cancel_at_cycle_end or expose a scheduled-change marker.
    # The adapter reaches this check only after a 2xx response to the controlled
    # period-end cancellation request, so the matching subscription id is the
    # authoritative acknowledgement.
    return response.get("id") == subscription_id


@router.post(
    "/membership/cancel",
    status_code=202,
    dependencies=[Depends(enforce_membership_cancellation_ip)],
)
async def cancel_membership(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    await enforce(db, [("checkout_user", str(current_user.id))])
    entitlement = await lock_membership_entitlement(db, current_user.id)
    if (
        entitlement is None
        or entitlement.provider not in {"razorpay", "paypal"}
        or not entitlement.provider_subscription_id
        or entitlement.status in {"canceled", "expired", "refunded", "disputed"}
    ):
        raise HTTPException(409, detail={"code": "membership_not_cancellable"})
    if entitlement.cancellation_state in {"requested", "completed"}:
        return {
            "status": entitlement.cancellation_state,
            "effective_at": (
                entitlement.current_period_end.isoformat()
                if entitlement.current_period_end
                else None
            ),
        }
    if entitlement.cancellation_state in {"requesting", "unknown"}:
        raise HTTPException(
            409,
            detail={"code": "cancellation_reconciliation_required"},
        )

    subscription_id = entitlement.provider_subscription_id
    entitlement.cancellation_state = "requesting"
    entitlement.cancellation_requested_at = datetime.utcnow()
    await db.commit()

    try:
        response = (
            await cancel_membership_subscription_at_period_end(subscription_id)
            if entitlement.provider == "razorpay"
            else await cancel_paypal_membership_subscription(subscription_id)
        )
    except (ProviderRejected, PayPalRejected) as error:
        await _mark_cancellation_state(
            db, current_user.id, subscription_id, "failed"
        )
        raise HTTPException(
            502, detail={"code": "cancellation_provider_rejected"}
        ) from error
    except (ProviderOutcomeUnknown, PayPalOutcomeUnknown) as error:
        await _mark_cancellation_state(
            db, current_user.id, subscription_id, "unknown"
        )
        raise HTTPException(
            502, detail={"code": "cancellation_reconciliation_required"}
        ) from error

    if not _confirms_period_end(response, subscription_id):
        await _mark_cancellation_state(
            db, current_user.id, subscription_id, "unknown"
        )
        raise HTTPException(
            502, detail={"code": "cancellation_reconciliation_required"}
        )

    entitlement = await lock_membership_entitlement(db, current_user.id)
    if not entitlement or entitlement.provider_subscription_id != subscription_id:
        raise HTTPException(
            409, detail={"code": "cancellation_reconciliation_required"}
        )
    entitlement.cancellation_state = "requested"
    entitlement.cancellation_requested_at = datetime.utcnow()
    await db.commit()
    return {
        "status": "requested",
        "effective_at": (
            entitlement.current_period_end.isoformat()
            if entitlement.current_period_end
            else None
        ),
    }
