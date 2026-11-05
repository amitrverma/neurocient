from datetime import datetime, timedelta
from types import SimpleNamespace

from app.services.membership import (
    entitlement_is_active,
    membership_access_summary,
    membership_required_detail,
)


def entitlement(status: str, current_period_end=None):
    return SimpleNamespace(
        status=status,
        current_period_end=current_period_end,
    )


def test_only_active_or_trialing_entitlements_grant_access():
    future = datetime.now() + timedelta(days=1)
    assert entitlement_is_active(entitlement("active", future)) is True
    assert entitlement_is_active(entitlement("trialing", future)) is True
    assert entitlement_is_active(entitlement("past_due")) is False
    assert entitlement_is_active(entitlement("canceled")) is False
    assert entitlement_is_active(None) is False


def test_past_due_entitlement_keeps_paid_access_then_three_day_grace():
    paid_through = datetime(2026, 11, 10, 12, 0, 0)
    past_due = entitlement("past_due", paid_through)

    before_renewal = membership_access_summary(
        past_due, now=paid_through - timedelta(minutes=1)
    )
    during_grace = membership_access_summary(
        past_due, now=paid_through + timedelta(days=2, hours=23)
    )
    grace_expired = membership_access_summary(
        past_due, now=paid_through + timedelta(days=3)
    )

    assert before_renewal.is_active is True
    assert before_renewal.phase == "payment_retrying"
    assert before_renewal.access_ends_at == paid_through + timedelta(days=3)
    assert during_grace.is_active is True
    assert during_grace.phase == "grace_period"
    assert grace_expired.is_active is False
    assert grace_expired.phase == "ended"


def test_initial_past_due_without_paid_period_gets_no_grace():
    summary = membership_access_summary(
        entitlement("past_due"), now=datetime(2026, 11, 10, 12, 0, 0)
    )

    assert summary.is_active is False
    assert summary.phase == "ended"
    assert summary.grace_period_end is None


def test_terminal_or_paused_subscription_preserves_only_unexpired_paid_period():
    now = datetime(2026, 11, 10, 12, 0, 0)

    for status in ("paused", "canceled", "expired"):
        assert entitlement_is_active(
            entitlement(status, now + timedelta(minutes=1)), now=now
        ) is True
        assert entitlement_is_active(entitlement(status, now), now=now) is False

    for status in ("refunded", "disputed"):
        assert entitlement_is_active(
            entitlement(status, now + timedelta(days=30)), now=now
        ) is False


def test_cancellation_scheduled_is_a_date_aware_access_phase():
    paid_through = datetime(2026, 11, 30, 18, 30, 0)
    scheduled = SimpleNamespace(
        status="active",
        current_period_end=paid_through,
        cancellation_state="requested",
    )

    summary = membership_access_summary(
        scheduled, now=datetime(2026, 11, 5, 12, 0, 0)
    )

    assert summary.is_active is True
    assert summary.phase == "cancellation_scheduled"
    assert summary.cancellation_effective_at == paid_through
    assert summary.renewal_at is None


def test_acknowledged_cancellation_never_adds_failed_renewal_grace():
    paid_through = datetime(2026, 11, 30, 18, 30, 0)
    canceled_recovery = SimpleNamespace(
        status="past_due",
        current_period_end=paid_through,
        cancellation_state="requested",
    )

    before_end = membership_access_summary(
        canceled_recovery, now=paid_through - timedelta(seconds=1)
    )
    at_end = membership_access_summary(canceled_recovery, now=paid_through)

    assert before_end.is_active is True
    assert before_end.phase == "cancellation_scheduled"
    assert before_end.access_ends_at == paid_through
    assert before_end.grace_period_end is None
    assert at_end.is_active is False
    assert at_end.grace_period_end is None


def test_cancellation_metadata_cannot_restore_a_refunded_membership():
    now = datetime(2026, 11, 5, 12, 0, 0)
    refunded = SimpleNamespace(
        status="refunded",
        current_period_end=now + timedelta(days=20),
        cancellation_state="requested",
    )

    summary = membership_access_summary(refunded, now=now)

    assert summary.is_active is False
    assert summary.phase == "ended"


def test_active_entitlement_without_period_end_fails_closed():
    assert entitlement_is_active(entitlement("active")) is False


def test_expired_entitlement_fails_closed():
    now = datetime(2026, 10, 15, 12, 0, 0)

    assert entitlement_is_active(
        entitlement("active", now + timedelta(minutes=1)),
        now=now,
    ) is True
    assert entitlement_is_active(
        entitlement("active", now),
        now=now,
    ) is False


def test_membership_required_detail_is_stable_and_actionable():
    detail = membership_required_detail("practice", 1)

    assert detail["code"] == "membership_required"
    assert detail["resource"] == "practice"
    assert detail["limit"] == 1
