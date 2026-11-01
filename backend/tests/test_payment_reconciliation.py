from datetime import UTC, datetime, timedelta
from types import SimpleNamespace
from uuid import uuid4

from app.services.payment_reconciliation import membership_provider_issues


def entitlement(**overrides):
    value = {
        "user_id": uuid4(),
        "provider_subscription_id": "sub_current",
        "provider_customer_id": "cust_current",
        "provider_plan_id": "plan_monthly",
        "status": "active",
        "cancellation_state": None,
        "current_period_end": None,
    }
    value.update(overrides)
    return SimpleNamespace(**value)


def test_matching_provider_membership_has_no_reconciliation_issue():
    period_end = datetime(2026, 11, 30, 12, 0)
    issues = membership_provider_issues(
        entitlement(current_period_end=period_end),
        {
            "id": "sub_current",
            "customer_id": "cust_current",
            "plan_id": "plan_monthly",
            "status": "active",
            "current_end": int(period_end.replace(tzinfo=UTC).timestamp()),
        },
    )
    assert issues == []


def test_provider_identity_conflict_is_critical_and_stops_status_comparison():
    issues = membership_provider_issues(
        entitlement(),
        {
            "id": "sub_other",
            "customer_id": "cust_other",
            "plan_id": "plan_other",
            "status": "cancelled",
        },
    )
    assert [issue.issue_code for issue in issues] == [
        "provider_subscription_mismatch"
    ]
    assert issues[0].severity == "critical"


def test_active_local_access_conflicting_with_cancelled_provider_is_critical():
    issues = membership_provider_issues(
        entitlement(),
        {
            "id": "sub_current",
            "customer_id": "cust_current",
            "plan_id": "plan_monthly",
            "status": "cancelled",
        },
    )
    conflict = next(
        issue for issue in issues if issue.issue_code == "provider_local_status_conflict"
    )
    assert conflict.severity == "critical"
    assert conflict.details == {
        "local_status": "active",
        "provider_status": "cancelled",
    }


def test_reconciliation_issue_key_is_stable_and_separates_products():
    membership_issue = membership_provider_issues(
        entitlement(),
        {
            "id": "sub_current",
            "customer_id": "cust_current",
            "plan_id": "plan_monthly",
            "status": "unknown-new-state",
        },
    )[0]
    assert membership_issue.dedupe_key == membership_issue.dedupe_key
    assert len(membership_issue.dedupe_key) == 64


def test_requested_cancellation_must_be_visible_at_provider():
    issues = membership_provider_issues(
        entitlement(cancellation_state="requested"),
        {
            "id": "sub_current",
            "customer_id": "cust_current",
            "plan_id": "plan_monthly",
            "status": "active",
            "cancel_at_cycle_end": False,
        },
    )
    assert "provider_cancellation_not_scheduled" in {
        issue.issue_code for issue in issues
    }


def test_missing_renewal_event_surfaces_provider_period_drift_as_critical():
    local_period = datetime(2026, 11, 1, 12, 0)
    issues = membership_provider_issues(
        entitlement(current_period_end=local_period),
        {
            "id": "sub_current",
            "customer_id": "cust_current",
            "plan_id": "plan_monthly",
            "status": "active",
            "current_end": int(
                (local_period + timedelta(days=30)).replace(tzinfo=UTC).timestamp()
            ),
        },
    )
    period_issue = next(
        issue for issue in issues if issue.issue_code == "provider_period_mismatch"
    )
    assert period_issue.severity == "critical"


def test_provider_period_precision_tolerance_does_not_create_false_conflict():
    local_period = datetime(2026, 11, 1, 12, 0)
    issues = membership_provider_issues(
        entitlement(current_period_end=local_period),
        {
            "id": "sub_current",
            "customer_id": "cust_current",
            "plan_id": "plan_monthly",
            "status": "active",
            "current_end": int(local_period.replace(tzinfo=UTC).timestamp()) + 60,
        },
    )
    assert "provider_period_mismatch" not in {
        issue.issue_code for issue in issues
    }


def test_active_provider_without_period_boundary_is_not_treated_as_clean():
    issues = membership_provider_issues(
        entitlement(current_period_end=datetime(2026, 11, 30, 12, 0)),
        {
            "id": "sub_current",
            "customer_id": "cust_current",
            "plan_id": "plan_monthly",
            "status": "active",
        },
    )
    issue = next(
        item for item in issues if item.issue_code == "provider_period_unavailable"
    )
    assert issue.severity == "critical"
