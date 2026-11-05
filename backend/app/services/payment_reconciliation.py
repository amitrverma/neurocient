from __future__ import annotations

import logging
import uuid
from datetime import datetime, timedelta

from sqlalchemy import or_, select
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import (
    CohortEnrollment,
    CohortWaitlistEntry,
    CohortWelcomeEmailDelivery,
    MembershipBillingEvent,
    MembershipEntitlement,
    MembershipWelcomeEmailDelivery,
    PaymentRecord,
    ReconciliationCheckpoint,
    ReconciliationIssue,
)
from app.observability import current_correlation_id, log_event
from app.services.membership_razorpay import (
    ProviderOutcomeUnknown,
    ProviderNotFound,
    ProviderRejected,
    fetch_membership_subscription,
)
from app.services.payment_reconciliation_rules import (
    PROVIDER_COMPARISON_CODES,
    ObservedIssue,
    membership_provider_issues,
)


logger = logging.getLogger("reconciliation")
MAX_RECONCILIATION_BATCH = 50
LOCAL_OBSERVATION_CODES = {
    "checkout_outcome_unknown",
    "cancellation_outcome_unknown",
    "legacy_provider_migration_required",
    "refund_required",
    "billing_event_unmatched",
    "welcome_delivery_failed",
    "waitlist_offer_delivery_failed",
}


async def bounded_reconciliation_page(
    db: AsyncSession,
    *,
    stream_name: str,
    query,
    key_column,
    cursor_parser=lambda value: value,
    batch_size: int = MAX_RECONCILIATION_BATCH,
) -> list:
    """Return a deterministic wrapping page and durably advance its cursor."""

    checkpoint = await db.get(
        ReconciliationCheckpoint,
        stream_name,
        with_for_update=True,
    )
    if checkpoint is None:
        checkpoint = ReconciliationCheckpoint(stream_name=stream_name, cursor=None)
        db.add(checkpoint)

    async def fetch(after: str | None):
        statement = query.order_by(key_column).limit(batch_size)
        if after:
            try:
                statement = statement.where(key_column > cursor_parser(after))
            except (TypeError, ValueError):
                checkpoint.cursor = None
        return (await db.execute(statement)).scalars().all()

    rows = await fetch(checkpoint.cursor)
    if not rows and checkpoint.cursor:
        checkpoint.cursor = None
        rows = await fetch(None)
    checkpoint.cursor = str(getattr(rows[-1], key_column.key)) if len(rows) == batch_size else None
    return rows


async def record_issue(db: AsyncSession, issue: ObservedIssue) -> None:
    correlation = current_correlation_id.get()
    correlation_uuid = uuid.UUID(correlation) if correlation else None
    now = datetime.utcnow()
    await db.execute(
        insert(ReconciliationIssue)
        .values(
            id=uuid.uuid4(),
            dedupe_key=issue.dedupe_key,
            product=issue.product,
            issue_code=issue.issue_code,
            object_type=issue.object_type,
            local_object_id=issue.local_object_id,
            provider_object_id=issue.provider_object_id,
            severity=issue.severity,
            status="open",
            details=issue.details or {},
            correlation_id=correlation_uuid,
            first_seen_at=now,
            last_seen_at=now,
        )
        .on_conflict_do_update(
            index_elements=[ReconciliationIssue.dedupe_key],
            set_={
                "status": "open",
                "severity": issue.severity,
                "details": issue.details or {},
                "correlation_id": correlation_uuid,
                "last_seen_at": now,
                "resolved_at": None,
                "updated_at": now,
            },
        )
    )


async def _resolve_absent_membership_issues(
    db: AsyncSession,
    entitlement: MembershipEntitlement,
    observed_keys: set[str],
) -> None:
    result = await db.execute(
        select(ReconciliationIssue).where(
            ReconciliationIssue.product == "membership",
            ReconciliationIssue.object_type == "membership_entitlement",
            ReconciliationIssue.local_object_id == str(entitlement.user_id),
            ReconciliationIssue.status == "open",
            ReconciliationIssue.issue_code.in_(PROVIDER_COMPARISON_CODES),
        )
    )
    now = datetime.utcnow()
    for issue in result.scalars().all():
        if issue.dedupe_key not in observed_keys:
            issue.status = "resolved"
            issue.resolved_at = now


async def _resolve_cleared_local_issues(db: AsyncSession) -> None:
    issues = await bounded_reconciliation_page(
        db,
        stream_name="local_issue_resolution",
        key_column=ReconciliationIssue.id,
        cursor_parser=uuid.UUID,
        query=(
            select(ReconciliationIssue)
            .where(
                ReconciliationIssue.status == "open",
                ReconciliationIssue.issue_code.in_(LOCAL_OBSERVATION_CODES),
            )
        ),
    )
    now = datetime.utcnow()
    for issue in issues:
        try:
            local_uuid = uuid.UUID(issue.local_object_id)
        except ValueError:
            local_uuid = None
        still_open = True
        if issue.issue_code in {
            "checkout_outcome_unknown",
            "cancellation_outcome_unknown",
            "legacy_provider_migration_required",
        } and issue.object_type == "membership_entitlement" and local_uuid:
            entitlement = await db.get(MembershipEntitlement, local_uuid)
            if entitlement:
                if issue.issue_code == "checkout_outcome_unknown":
                    still_open = entitlement.checkout_state == "unknown"
                elif issue.issue_code == "cancellation_outcome_unknown":
                    still_open = entitlement.cancellation_state in {"unknown", "requesting"}
                else:
                    still_open = entitlement.provider != "razorpay"
        elif (
            issue.issue_code == "checkout_outcome_unknown"
            and issue.object_type == "payment_record"
            and local_uuid
        ):
            payment = await db.get(PaymentRecord, local_uuid)
            if payment:
                still_open = payment.status == "checkout_unknown"
        elif (
            issue.issue_code == "checkout_outcome_unknown"
            and issue.object_type == "cohort_enrollment"
            and local_uuid
        ):
            enrollment = await db.get(CohortEnrollment, local_uuid)
            if enrollment:
                still_open = enrollment.status == "checkout_unknown"
        elif issue.issue_code == "refund_required" and local_uuid:
            payment = await db.get(PaymentRecord, local_uuid)
            if payment:
                still_open = payment.status in {"capacity_conflict", "duplicate_payment"}
        elif issue.issue_code == "billing_event_unmatched":
            event = await db.get(MembershipBillingEvent, issue.local_object_id)
            if event:
                still_open = event.status in {"unmatched", "ambiguous"}
        elif issue.issue_code == "welcome_delivery_failed" and local_uuid:
            model = (
                MembershipWelcomeEmailDelivery
                if issue.object_type == "membership_welcome"
                else CohortWelcomeEmailDelivery
            )
            delivery = await db.get(model, local_uuid)
            if delivery:
                still_open = delivery.status in {"failed", "reconciliation_required"}
        elif issue.issue_code == "waitlist_offer_delivery_failed" and local_uuid:
            entry = await db.get(CohortWaitlistEntry, local_uuid)
            if entry:
                still_open = (
                    entry.status == "offered"
                    and entry.offer_email_status
                    in {"failed", "reconciliation_required"}
                )
        if not still_open:
            issue.status = "resolved"
            issue.resolved_at = now


async def reconcile_memberships(db: AsyncSession) -> dict[str, int]:
    entitlements = await bounded_reconciliation_page(
        db,
        stream_name="membership_provider",
        key_column=MembershipEntitlement.user_id,
        cursor_parser=uuid.UUID,
        query=(
        select(MembershipEntitlement)
        .where(
            MembershipEntitlement.provider == "razorpay",
            MembershipEntitlement.provider_subscription_id.is_not(None),
        )
        ),
    )
    checked = 0
    issue_count = 0
    provider_failures = 0
    for entitlement in entitlements:
        checked += 1
        try:
            provider = await fetch_membership_subscription(
                entitlement.provider_subscription_id
            )
        except ProviderNotFound:
            issue = ObservedIssue(
                product="membership",
                issue_code="provider_subscription_missing",
                object_type="membership_entitlement",
                local_object_id=str(entitlement.user_id),
                provider_object_id=entitlement.provider_subscription_id,
                severity="critical",
            )
            await record_issue(db, issue)
            issue_count += 1
            continue
        except (ProviderRejected, ProviderOutcomeUnknown) as error:
            provider_failures += 1
            issue = ObservedIssue(
                product="membership",
                issue_code="provider_state_unavailable",
                object_type="membership_entitlement",
                local_object_id=str(entitlement.user_id),
                provider_object_id=entitlement.provider_subscription_id,
                details={"failure_type": type(error).__name__},
            )
            await record_issue(db, issue)
            issue_count += 1
            continue

        issues = membership_provider_issues(entitlement, provider)
        for issue in issues:
            await record_issue(db, issue)
        await _resolve_absent_membership_issues(
            db, entitlement, {issue.dedupe_key for issue in issues}
        )
        issue_count += len(issues)
    await db.commit()
    log_event(
        logger,
        "membership_reconciliation_finished",
        component="worker",
        operation="membership_reconciliation",
        outcome="success" if provider_failures == 0 else "degraded",
        product="membership",
        count=checked,
        reason_code="provider_unavailable" if provider_failures else None,
    )
    return {
        "checked": checked,
        "issues": issue_count,
        "provider_failures": provider_failures,
    }


async def reconcile_local_payment_state(db: AsyncSession) -> dict[str, int]:
    observations: list[ObservedIssue] = []
    memberships = await bounded_reconciliation_page(
        db,
        stream_name="membership_local",
        key_column=MembershipEntitlement.user_id,
        cursor_parser=uuid.UUID,
        query=(
            select(MembershipEntitlement)
            .where(
                or_(
                    MembershipEntitlement.provider != "razorpay",
                    MembershipEntitlement.checkout_state == "unknown",
                    MembershipEntitlement.cancellation_state == "unknown",
                    (
                        (MembershipEntitlement.cancellation_state == "requesting")
                        & (
                            MembershipEntitlement.updated_at
                            < datetime.utcnow() - timedelta(minutes=15)
                        )
                    ),
                )
            )
        ),
    )
    for entitlement in memberships:
        if entitlement.provider != "razorpay":
            code = "legacy_provider_migration_required"
        elif entitlement.checkout_state == "unknown":
            code = "checkout_outcome_unknown"
        else:
            code = "cancellation_outcome_unknown"
        observations.append(
            ObservedIssue(
                product="membership",
                issue_code=code,
                object_type="membership_entitlement",
                local_object_id=str(entitlement.user_id),
                provider_object_id=entitlement.provider_subscription_id,
                severity="critical",
                details=(
                    {"provider": entitlement.provider}
                    if code == "legacy_provider_migration_required"
                    else None
                ),
            )
        )

    payments = await bounded_reconciliation_page(
        db,
        stream_name="cohort_local",
        key_column=PaymentRecord.id,
        cursor_parser=uuid.UUID,
        query=(
            select(PaymentRecord)
            .where(PaymentRecord.status.in_([
                "capacity_conflict",
                "duplicate_payment",
                "checkout_unknown",
            ]))
        ),
    )
    for payment in payments:
        observations.append(
            ObservedIssue(
                product="cohort",
                issue_code=(
                    "refund_required"
                    if payment.status in {"capacity_conflict", "duplicate_payment"}
                    else "checkout_outcome_unknown"
                ),
                object_type="payment_record",
                local_object_id=str(payment.id),
                provider_object_id=payment.provider_payment_id or payment.provider_order_id,
                severity=(
                    "critical"
                    if payment.status in {"capacity_conflict", "duplicate_payment"}
                    else "warning"
                ),
            )
        )

    unknown_enrollments = await bounded_reconciliation_page(
        db,
        stream_name="cohort_checkout_unknown",
        key_column=CohortEnrollment.id,
        cursor_parser=uuid.UUID,
        query=(
            select(CohortEnrollment)
            .where(CohortEnrollment.status == "checkout_unknown")
        ),
    )
    for enrollment in unknown_enrollments:
        observations.append(
            ObservedIssue(
                product="cohort",
                issue_code="checkout_outcome_unknown",
                object_type="cohort_enrollment",
                local_object_id=str(enrollment.id),
                provider_object_id=enrollment.provider_order_id,
                severity="critical",
            )
        )

    billing_events = await bounded_reconciliation_page(
        db,
        stream_name="membership_billing_events",
        key_column=MembershipBillingEvent.provider_event_id,
        query=(
            select(MembershipBillingEvent)
            .where(MembershipBillingEvent.status.in_(["unmatched", "ambiguous"]))
        ),
    )
    for event in billing_events:
        observations.append(
            ObservedIssue(
                product="membership",
                issue_code="billing_event_unmatched",
                object_type="membership_billing_event",
                local_object_id=event.provider_event_id,
                provider_object_id=event.provider_subscription_id,
                severity="critical",
                details={"event_type": event.event_type},
            )
        )

    for model, product, object_type, id_field in (
        (MembershipWelcomeEmailDelivery, "membership", "membership_welcome", "user_id"),
        (CohortWelcomeEmailDelivery, "cohort", "cohort_welcome", "enrollment_id"),
    ):
        deliveries = await bounded_reconciliation_page(
            db,
            stream_name=f"{product}_{object_type}",
            key_column=getattr(model, id_field),
            cursor_parser=uuid.UUID,
            query=(
                select(model)
                .where(model.status.in_(["failed", "reconciliation_required"]))
            ),
        )
        for delivery in deliveries:
            observations.append(
                ObservedIssue(
                    product=product,
                    issue_code="welcome_delivery_failed",
                    object_type=object_type,
                    local_object_id=str(getattr(delivery, id_field)),
                    severity=(
                        "critical"
                        if delivery.status == "reconciliation_required"
                        else "warning"
                    ),
                    details={"delivery_status": delivery.status},
                )
            )

    waitlist_deliveries = await bounded_reconciliation_page(
        db,
        stream_name="cohort_waitlist_offer_delivery",
        key_column=CohortWaitlistEntry.id,
        cursor_parser=uuid.UUID,
        query=(
            select(CohortWaitlistEntry)
            .where(
                CohortWaitlistEntry.status == "offered",
                CohortWaitlistEntry.offer_email_status.in_(
                    ["failed", "reconciliation_required"]
                )
            )
        ),
    )
    for entry in waitlist_deliveries:
        observations.append(
            ObservedIssue(
                product="cohort",
                issue_code="waitlist_offer_delivery_failed",
                object_type="cohort_waitlist_entry",
                local_object_id=str(entry.id),
                severity=(
                    "critical"
                    if entry.offer_email_status == "reconciliation_required"
                    else "warning"
                ),
                details={"delivery_status": entry.offer_email_status},
            )
        )

    for issue in observations:
        await record_issue(db, issue)
    await _resolve_cleared_local_issues(db)
    await db.commit()
    return {"issues": len(observations)}


async def run_payment_reconciliation(db: AsyncSession) -> dict[str, int]:
    provider = await reconcile_memberships(db)
    local = await reconcile_local_payment_state(db)
    return {
        "membership_checked": provider["checked"],
        "provider_failures": provider["provider_failures"],
        "issues": provider["issues"] + local["issues"],
    }
