from __future__ import annotations

import hashlib
from dataclasses import dataclass
from datetime import UTC

from app.models import MembershipEntitlement


PROVIDER_COMPARISON_CODES = {
    "provider_state_unavailable",
    "provider_subscription_mismatch",
    "provider_subscription_missing",
    "provider_plan_mismatch",
    "provider_customer_mismatch",
    "provider_status_unknown",
    "provider_local_status_conflict",
    "provider_cancellation_not_scheduled",
    "provider_period_mismatch",
    "provider_period_unavailable",
}


@dataclass(frozen=True)
class ObservedIssue:
    product: str
    issue_code: str
    object_type: str
    local_object_id: str
    provider_object_id: str | None = None
    severity: str = "warning"
    details: dict | None = None

    @property
    def dedupe_key(self) -> str:
        value = "\n".join(
            (
                self.product,
                self.issue_code,
                self.object_type,
                self.local_object_id,
                self.provider_object_id or "",
            )
        )
        return hashlib.sha256(value.encode("utf-8")).hexdigest()


def membership_provider_issues(
    entitlement: MembershipEntitlement,
    provider: dict,
) -> list[ObservedIssue]:
    local_id = str(entitlement.user_id)
    subscription_id = entitlement.provider_subscription_id
    issues: list[ObservedIssue] = []

    def add(code: str, *, severity: str = "warning", details: dict | None = None):
        issues.append(
            ObservedIssue(
                product="membership",
                issue_code=code,
                object_type="membership_entitlement",
                local_object_id=local_id,
                provider_object_id=subscription_id,
                severity=severity,
                details=details,
            )
        )

    if provider.get("id") != subscription_id:
        add("provider_subscription_mismatch", severity="critical")
        return issues
    if provider.get("plan_id") != entitlement.provider_plan_id:
        add("provider_plan_mismatch", severity="critical")
    provider_customer_id = provider.get("customer_id")
    if (
        entitlement.provider_customer_id
        and provider_customer_id
        and provider_customer_id != entitlement.provider_customer_id
    ):
        add("provider_customer_mismatch", severity="critical")

    provider_status = str(provider.get("status") or "").lower()
    provider_period_end = provider.get("current_end")
    if provider_period_end is None and provider_status == "active":
        add("provider_period_unavailable", severity="critical")
    elif provider_period_end is not None:
        try:
            provider_period_epoch = int(provider_period_end)
        except (TypeError, ValueError):
            provider_period_epoch = None
        local_period_end = entitlement.current_period_end
        local_period_epoch = (
            int(local_period_end.replace(tzinfo=UTC).timestamp())
            if local_period_end is not None
            else None
        )
        if (
            provider_period_epoch is None
            or local_period_epoch is None
            or abs(provider_period_epoch - local_period_epoch) > 300
        ):
            add(
                "provider_period_mismatch",
                severity="critical",
                details={
                    "period_delta_seconds": (
                        abs(provider_period_epoch - local_period_epoch)
                        if provider_period_epoch is not None
                        and local_period_epoch is not None
                        else None
                    )
                },
            )
    if (
        entitlement.cancellation_state == "requested"
        and provider_status not in {"cancelled", "completed"}
        and provider.get("cancel_at_cycle_end") not in {True, 1}
    ):
        add("provider_cancellation_not_scheduled", severity="critical")
    expected = {
        "active": {"active"},
        "authenticated": {"inactive", "authenticated"},
        "pending": {"past_due"},
        "halted": {"past_due"},
        "paused": {"paused"},
        "cancelled": {"canceled"},
        "completed": {"expired"},
    }.get(provider_status)
    if expected is None:
        add("provider_status_unknown", details={"provider_status": provider_status})
    elif entitlement.status not in expected:
        add(
            "provider_local_status_conflict",
            severity="critical" if entitlement.status == "active" else "warning",
            details={
                "local_status": entitlement.status,
                "provider_status": provider_status,
            },
        )
    return issues
