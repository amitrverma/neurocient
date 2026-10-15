from datetime import datetime, timedelta
from types import SimpleNamespace

from app.services.membership import entitlement_is_active, membership_required_detail


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
