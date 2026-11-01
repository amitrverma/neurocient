"""Pure membership billing decisions.

The provider adapter and database transaction layer deliberately sit outside
this module.  Keeping the state transition rules pure makes ordering and
fail-closed behaviour straightforward to exercise.
"""

from dataclasses import dataclass
from datetime import UTC, datetime
from typing import Any, Mapping


class PlanMismatch(ValueError):
    """The configured Razorpay plan is not the offer shown to the customer."""


@dataclass(frozen=True)
class PlanFingerprint:
    plan_id: str
    amount_minor: int
    currency: str
    period: str
    interval: int


@dataclass(frozen=True)
class BillingState:
    status: str
    last_event_at: datetime | None
    current_period_end: datetime | None
    provider_payment_id: str | None
    last_event_rank: int | None = None


@dataclass(frozen=True)
class BillingEvent:
    event_type: str
    provider_created_at: datetime
    current_period_end: datetime | None
    provider_payment_id: str | None


@dataclass(frozen=True)
class BillingDecision:
    outcome: str
    state: BillingState
    reason: str | None = None


_EVENT_STATUS = {
    "subscription.authenticated": "authenticated",
    "subscription.activated": "active",
    "subscription.charged": "active",
    "subscription.resumed": "active",
    "subscription.pending": "past_due",
    "subscription.halted": "past_due",
    "subscription.paused": "paused",
    "subscription.cancelled": "canceled",
    "subscription.completed": "expired",
    "payment.refunded": "refunded",
    "payment.dispute.created": "disputed",
}

_GRANT_EVENTS = {
    "subscription.activated",
    "subscription.charged",
    "subscription.resumed",
}
_PAYMENT_TERMINAL_EVENTS = {"payment.refunded", "payment.dispute.created"}
_TERMINAL_STATUSES = {"canceled", "expired", "refunded", "disputed"}

# At an identical provider timestamp, a restrictive transition must win even
# if the granting event was delivered first.
_STATUS_RANK = {
    "authenticated": 10,
    "active": 20,
    "past_due": 40,
    "paused": 50,
    "canceled": 60,
    "expired": 60,
    "refunded": 70,
    "disputed": 80,
}


def _aware(value: datetime) -> datetime:
    if value.tzinfo is None:
        return value.replace(tzinfo=UTC)
    return value.astimezone(UTC)


def validate_membership_plan(
    plan: Mapping[str, Any],
    *,
    plan_id: str,
    amount_minor: int,
    currency: str,
) -> PlanFingerprint:
    """Return the verified commercial fingerprint or fail closed."""

    try:
        item = plan["item"]
        candidate = PlanFingerprint(
            plan_id=str(plan["id"]),
            amount_minor=int(item["amount"]),
            currency=str(item["currency"]).upper(),
            period=str(plan["period"]),
            interval=int(plan["interval"]),
        )
        active = item["active"] is True
    except (KeyError, TypeError, ValueError) as exc:
        raise PlanMismatch("Razorpay membership plan is incomplete") from exc

    expected = PlanFingerprint(
        plan_id=plan_id,
        amount_minor=amount_minor,
        currency=currency.upper(),
        period="monthly",
        interval=1,
    )
    if not active or candidate != expected:
        raise PlanMismatch("Razorpay membership plan does not match the configured offer")
    return candidate


def reduce_billing_event(
    current: BillingState,
    event: BillingEvent,
    *,
    now: datetime,
) -> BillingDecision:
    """Apply one verified event using monotonic, restriction-first ordering."""

    target = _EVENT_STATUS.get(event.event_type)
    if target is None:
        return BillingDecision("rejected", current, "unsupported_event")

    if current.status in _TERMINAL_STATUSES:
        return BillingDecision("stale", current, "terminal_state")

    event_time = _aware(event.provider_created_at)
    current_time = _aware(current.last_event_at) if current.last_event_at else None
    event_rank = _STATUS_RANK[target]
    current_rank = (
        current.last_event_rank
        if current.last_event_rank is not None
        else _STATUS_RANK.get(current.status, 0)
    )
    if current_time is not None and (
        event_time < current_time
        or (event_time == current_time and event_rank <= current_rank)
    ):
        return BillingDecision("stale", current, "event_order")

    if event.event_type in _GRANT_EVENTS and (
        event.current_period_end is None
        or _aware(event.current_period_end) <= _aware(now)
    ):
        return BillingDecision("rejected", current, "invalid_paid_through")

    if event.event_type in _PAYMENT_TERMINAL_EVENTS and (
        not event.provider_payment_id
        or event.provider_payment_id != current.provider_payment_id
    ):
        return BillingDecision("rejected", current, "payment_mismatch")

    paid_through = (
        event.current_period_end if target == "active" else current.current_period_end
    )
    payment_id = event.provider_payment_id or current.provider_payment_id
    return BillingDecision(
        "applied",
        BillingState(
            status=target,
            last_event_at=event.provider_created_at,
            current_period_end=paid_through,
            provider_payment_id=payment_id,
            last_event_rank=event_rank,
        ),
    )
