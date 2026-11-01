from __future__ import annotations

import asyncio
from datetime import datetime, time, timedelta
from zoneinfo import ZoneInfo

from sqlalchemy import and_, func, or_, select, text
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import AsyncSessionLocal
from app.models import (
    CohortWelcomeEmailDelivery,
    MembershipBillingEvent,
    MembershipEntitlement,
    MembershipWelcomeEmailDelivery,
    NotificationDispatch,
    PaymentWebhookEvent,
    ReconciliationIssue,
    ScheduledJobRun,
    WorkerHeartbeat,
)


async def readiness_snapshot(timeout_seconds: float = 3.0) -> tuple[bool, dict]:
    try:
        settings.validate_for_startup()
    except RuntimeError:
        return False, {
            "status": "not_ready",
            "components": {
                "configuration": "failed",
                "database": "not_checked",
            },
        }

    async def check_database() -> None:
        async with AsyncSessionLocal() as db:
            await db.execute(text("SELECT 1"))

    try:
        await asyncio.wait_for(check_database(), timeout=timeout_seconds)
    except Exception:
        return False, {
            "status": "not_ready",
            "components": {
                "configuration": "ok",
                "database": "failed",
            },
        }
    return True, {
        "status": "ready",
        "components": {
            "configuration": "ok",
            "database": "ok",
        },
    }


def _due_daily_jobs(now: datetime | None = None) -> list[tuple[str, str]]:
    current = now or datetime.now(ZoneInfo("Asia/Kolkata"))
    if current.tzinfo is None:
        current = current.replace(tzinfo=ZoneInfo("Asia/Kolkata"))
    current = current.astimezone(ZoneInfo("Asia/Kolkata"))
    grace = timedelta(minutes=15)
    schedules = (
        ("payment_reconciliation", time(3, 0)),
        ("daily_nudge", time(9, 0)),
        ("microchallenge", time(13, 0)),
        ("spot_reminder", time(20, 0)),
    )
    return [
        (job_name, current.date().isoformat())
        for job_name, scheduled_time in schedules
        if current
        >= datetime.combine(
            current.date(), scheduled_time, tzinfo=current.tzinfo
        )
        + grace
    ]


async def operational_snapshot(db: AsyncSession) -> dict:
    now = datetime.utcnow()
    recent = now - timedelta(hours=24)
    stuck_cutoff = now - timedelta(minutes=15)

    statements = {
        "reconciliation_open": select(func.count(ReconciliationIssue.id)).where(
            ReconciliationIssue.status == "open"
        ),
        "reconciliation_critical": select(func.count(ReconciliationIssue.id)).where(
            ReconciliationIssue.status == "open",
            ReconciliationIssue.severity == "critical",
        ),
        "jobs_stale": select(func.count(ScheduledJobRun.id)).where(
            ScheduledJobRun.status == "running",
            ScheduledJobRun.lease_expires_at < now,
        ),
        "jobs_failed_recent": select(func.count(ScheduledJobRun.id)).where(
            ScheduledJobRun.status.in_(["failed", "reconciliation_required"]),
            ScheduledJobRun.updated_at >= recent,
        ),
        "notifications_uncertain": select(func.count(NotificationDispatch.id)).where(
            NotificationDispatch.status == "reconciliation_required"
        ),
        "notifications_failed_recent": select(func.count(NotificationDispatch.id)).where(
            NotificationDispatch.status == "failed",
            NotificationDispatch.updated_at >= recent,
        ),
        "membership_stuck": select(func.count(MembershipEntitlement.user_id)).where(
            or_(
                MembershipEntitlement.checkout_state == "unknown",
                MembershipEntitlement.cancellation_state == "unknown",
                (
                    MembershipEntitlement.cancellation_state == "requesting"
                )
                & (MembershipEntitlement.updated_at < stuck_cutoff),
            )
        ),
        "membership_events_attention": select(
            func.count(MembershipBillingEvent.provider_event_id)
        ).where(
            MembershipBillingEvent.status.in_(["rejected", "unmatched", "ambiguous"]),
            MembershipBillingEvent.created_at >= recent,
        ),
        "cohort_events_attention": select(
            func.count(PaymentWebhookEvent.provider_event_id)
        ).where(
            PaymentWebhookEvent.status.in_(["rejected", "capacity_conflict"]),
            PaymentWebhookEvent.created_at >= recent,
        ),
        "welcome_delivery_attention": select(
            (
                select(func.count(MembershipWelcomeEmailDelivery.user_id))
                .where(
                    MembershipWelcomeEmailDelivery.status.in_(
                        ["failed", "reconciliation_required"]
                    )
                )
                .scalar_subquery()
            )
            + (
                select(func.count(CohortWelcomeEmailDelivery.enrollment_id))
                .where(
                    CohortWelcomeEmailDelivery.status.in_(
                        ["failed", "reconciliation_required"]
                    )
                )
                .scalar_subquery()
            )
        ),
    }
    signals = {
        name: int((await db.execute(statement)).scalar_one() or 0)
        for name, statement in statements.items()
    }
    due_jobs = _due_daily_jobs()
    if due_jobs:
        observed_due_jobs = await db.scalar(
            select(func.count(ScheduledJobRun.id)).where(
                or_(
                    *(
                        and_(
                            ScheduledJobRun.job_name == job_name,
                            ScheduledJobRun.run_key == run_key,
                        )
                        for job_name, run_key in due_jobs
                    )
                )
            )
        )
        signals["jobs_missing"] = max(0, len(due_jobs) - int(observed_due_jobs or 0))
    else:
        signals["jobs_missing"] = 0
    heartbeat = await db.get(WorkerHeartbeat, "scheduler")
    signals["worker_heartbeat_stale"] = int(
        heartbeat is None or heartbeat.last_seen_at < now - timedelta(minutes=3)
    )
    requires_attention = any(value > 0 for value in signals.values())
    return {
        "status": "attention" if requires_attention else "healthy",
        "generated_at": now.isoformat(),
        "signals": signals,
    }
