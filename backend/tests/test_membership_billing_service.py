from datetime import UTC, datetime, timedelta

import pytest

from app.services.membership_billing import (
    BillingEvent,
    BillingState,
    PlanMismatch,
    reduce_billing_event,
    validate_membership_plan,
)


NOW = datetime(2026, 11, 1, 12, 0, tzinfo=UTC)


def plan(**overrides):
    value = {
        "id": "plan_member_monthly",
        "period": "monthly",
        "interval": 1,
        "item": {
            "active": True,
            "amount": 49_900,
            "currency": "INR",
        },
    }
    value.update(overrides)
    return value


def test_plan_fingerprint_requires_exact_active_monthly_offer():
    fingerprint = validate_membership_plan(
        plan(),
        plan_id="plan_member_monthly",
        amount_minor=49_900,
        currency="INR",
    )

    assert fingerprint.plan_id == "plan_member_monthly"
    assert fingerprint.amount_minor == 49_900
    assert fingerprint.currency == "INR"
    assert fingerprint.period == "monthly"
    assert fingerprint.interval == 1


@pytest.mark.parametrize(
    "candidate",
    [
        plan(id="plan_wrong"),
        plan(period="yearly"),
        plan(interval=2),
        plan(item={"active": False, "amount": 49_900, "currency": "INR"}),
        plan(item={"active": True, "amount": 49_901, "currency": "INR"}),
        plan(item={"active": True, "amount": 49_900, "currency": "USD"}),
        {"id": "plan_member_monthly"},
    ],
)
def test_plan_fingerprint_fails_closed_for_every_mismatch(candidate):
    with pytest.raises(PlanMismatch):
        validate_membership_plan(
            candidate,
            plan_id="plan_member_monthly",
            amount_minor=49_900,
            currency="INR",
        )


def state(status="authenticated", at=None, payment_id=None):
    return BillingState(
        status=status,
        last_event_at=at,
        current_period_end=None,
        provider_payment_id=payment_id,
    )


@pytest.mark.parametrize(
    ("event_type", "expected"),
    [
        ("subscription.authenticated", "authenticated"),
        ("subscription.activated", "active"),
        ("subscription.charged", "active"),
        ("subscription.resumed", "active"),
        ("subscription.pending", "past_due"),
        ("subscription.halted", "past_due"),
        ("subscription.paused", "paused"),
        ("subscription.cancelled", "canceled"),
        ("subscription.completed", "expired"),
    ],
)
def test_subscription_lifecycle_maps_to_fail_closed_entitlement(event_type, expected):
    future = NOW + timedelta(days=30)
    decision = reduce_billing_event(
        state(),
        BillingEvent(
            event_type=event_type,
            provider_created_at=NOW,
            current_period_end=future,
            provider_payment_id="pay_current",
        ),
        now=NOW,
    )

    assert decision.outcome == "applied"
    assert decision.state.status == expected
    if expected == "active":
        assert decision.state.current_period_end == future


@pytest.mark.parametrize("event_type", ["subscription.activated", "subscription.charged", "subscription.resumed"])
@pytest.mark.parametrize("period_end", [None, NOW - timedelta(seconds=1), NOW])
def test_grant_events_require_future_paid_through(event_type, period_end):
    decision = reduce_billing_event(
        state(status="past_due"),
        BillingEvent(event_type, NOW, period_end, "pay_current"),
        now=NOW,
    )

    assert decision.outcome == "rejected"
    assert decision.reason == "invalid_paid_through"
    assert decision.state.status == "past_due"


def test_older_grant_cannot_overwrite_newer_restriction():
    newer = NOW + timedelta(minutes=1)
    decision = reduce_billing_event(
        state(status="past_due", at=newer),
        BillingEvent(
            "subscription.charged",
            NOW,
            NOW + timedelta(days=30),
            "pay_old",
        ),
        now=NOW,
    )

    assert decision.outcome == "stale"
    assert decision.state.status == "past_due"


def test_equal_time_restriction_dominates_grant_regardless_of_delivery_order():
    future = NOW + timedelta(days=30)
    grant_then_restrict = reduce_billing_event(
        reduce_billing_event(
            state(),
            BillingEvent("subscription.charged", NOW, future, "pay_1"),
            now=NOW,
        ).state,
        BillingEvent("subscription.pending", NOW, future, "pay_1"),
        now=NOW,
    )
    restrict_then_grant = reduce_billing_event(
        reduce_billing_event(
            state(),
            BillingEvent("subscription.pending", NOW, future, "pay_1"),
            now=NOW,
        ).state,
        BillingEvent("subscription.charged", NOW, future, "pay_1"),
        now=NOW,
    )

    assert grant_then_restrict.state.status == "past_due"
    assert restrict_then_grant.outcome == "stale"
    assert restrict_then_grant.state.status == "past_due"


@pytest.mark.parametrize("terminal", ["canceled", "expired", "refunded", "disputed"])
def test_terminal_subscription_cannot_be_revived(terminal):
    decision = reduce_billing_event(
        state(status=terminal, at=NOW),
        BillingEvent(
            "subscription.charged",
            NOW + timedelta(days=1),
            NOW + timedelta(days=31),
            "pay_new",
        ),
        now=NOW,
    )

    assert decision.outcome == "stale"
    assert decision.reason == "terminal_state"
    assert decision.state.status == terminal


def test_refund_and_dispute_require_the_current_payment():
    current = state(status="active", at=NOW, payment_id="pay_current")

    unrelated = reduce_billing_event(
        current,
        BillingEvent("payment.refunded", NOW + timedelta(minutes=1), None, "pay_old"),
        now=NOW,
    )
    refunded = reduce_billing_event(
        current,
        BillingEvent("payment.refunded", NOW + timedelta(minutes=1), None, "pay_current"),
        now=NOW,
    )
    disputed = reduce_billing_event(
        current,
        BillingEvent("payment.dispute.created", NOW + timedelta(minutes=1), None, "pay_current"),
        now=NOW,
    )

    assert unrelated.outcome == "rejected"
    assert unrelated.reason == "payment_mismatch"
    assert unrelated.state.status == "active"
    assert refunded.state.status == "refunded"
    assert disputed.state.status == "disputed"
