from __future__ import annotations

import logging
import uuid
from datetime import UTC, datetime

from apscheduler.schedulers.asyncio import AsyncIOScheduler
from apscheduler.triggers.cron import CronTrigger
from apscheduler.triggers.interval import IntervalTrigger
from pytz import timezone
from sqlalchemy.exc import OperationalError

from app.database import AsyncSessionLocal
from app.observability import current_correlation_id, log_event, safe_exception_fields
from app.services.job_control import (
    claim_job_run,
    complete_job_run,
    fail_job_run,
    mark_stale_dispatches_uncertain,
    record_worker_heartbeat,
)
from app.services.payment_reconciliation import run_payment_reconciliation
from app.services.waitlist_offers import dispatch_available_waitlist_offers
from app.utils.reminder_engine import (
    send_daily_nudge,
    send_microchallenge_pushes,
    send_spot_pushes,
)


logger = logging.getLogger("scheduler")
scheduler = AsyncIOScheduler()
india_tz = timezone("Asia/Kolkata")
worker_instance_id = uuid.uuid4()
worker_started_at = datetime.utcnow()


def _daily_run_key(now: datetime | None = None) -> str:
    current = now or datetime.now(india_tz)
    if current.tzinfo is None:
        current = india_tz.localize(current)
    return current.astimezone(india_tz).date().isoformat()


def _interval_run_key(minutes: int, now: datetime | None = None) -> str:
    current = now or datetime.now(UTC)
    if current.tzinfo is None:
        current = current.replace(tzinfo=UTC)
    bucket_seconds = minutes * 60
    bucket = int(current.timestamp()) // bucket_seconds
    return f"{minutes}m/{bucket}"


async def run_claimed_job(task_func, name: str, *, run_key: str | None = None):
    logical_key = run_key or _daily_run_key()
    try:
        async with AsyncSessionLocal() as claim_db:
            run = await claim_job_run(
                claim_db,
                job_name=name,
                run_key=logical_key,
            )
    except OperationalError:
        log_event(
            logger,
            "scheduled_job_claim_failed",
            level=logging.ERROR,
            component="worker",
            operation="scheduled_job",
            outcome="failure",
            job_name=name,
            run_key=logical_key,
            reason_code="database_unavailable",
            retryable=True,
        )
        return None

    if run is None:
        log_event(
            logger,
            "scheduled_job_duplicate_skipped",
            component="worker",
            operation="scheduled_job",
            outcome="skipped",
            job_name=name,
            run_key=logical_key,
            reason_code="durable_claim_exists",
        )
        return None

    token = current_correlation_id.set(str(run.correlation_id))
    try:
        async with AsyncSessionLocal() as recovery_db:
            await mark_stale_dispatches_uncertain(recovery_db)
        async with AsyncSessionLocal() as task_db:
            result = await task_func(task_db)
        safe_result = {
            key: value
            for key, value in (result or {}).items()
            if isinstance(value, int) and not isinstance(value, bool)
        }
        async with AsyncSessionLocal() as outcome_db:
            await complete_job_run(outcome_db, run.id, safe_result)
        log_event(
            logger,
            "scheduled_job_finished",
            component="worker",
            operation="scheduled_job",
            outcome="success",
            job_name=name,
            run_key=logical_key,
            count=sum(safe_result.values()),
        )
        return result
    except Exception as error:
        async with AsyncSessionLocal() as outcome_db:
            await fail_job_run(
                outcome_db,
                run.id,
                error_code=type(error).__name__,
            )
        log_event(
            logger,
            "scheduled_job_failed",
            level=logging.ERROR,
            component="worker",
            operation="scheduled_job",
            outcome="failure",
            job_name=name,
            run_key=logical_key,
            reason_code="task_failed",
            retryable=False,
            **safe_exception_fields(error),
        )
        return None
    finally:
        current_correlation_id.reset(token)


async def run_spot_job():
    return await run_claimed_job(send_spot_pushes, "spot_reminder")


async def run_challenge_job():
    return await run_claimed_job(send_microchallenge_pushes, "microchallenge")


async def run_behavioral_job():
    return await run_claimed_job(send_daily_nudge, "daily_nudge")


async def run_reconciliation_job():
    return await run_claimed_job(run_payment_reconciliation, "payment_reconciliation")


async def run_waitlist_offer_job():
    return await run_claimed_job(
        dispatch_available_waitlist_offers,
        "waitlist_offer_dispatch",
        run_key=_interval_run_key(2),
    )


async def record_heartbeat():
    async with AsyncSessionLocal() as db:
        await record_worker_heartbeat(
            db,
            worker_name="scheduler",
            instance_id=worker_instance_id,
            started_at=worker_started_at,
        )


def start_scheduler() -> None:
    if scheduler.running:
        log_event(
            logger,
            "scheduler_start_skipped",
            component="worker",
            operation="scheduler_start",
            outcome="skipped",
            reason_code="already_running",
        )
        return

    jobs = (
        (run_reconciliation_job, "payment_reconciliation", 3, 0),
        (run_behavioral_job, "daily_nudge", 9, 0),
        (run_challenge_job, "microchallenge", 13, 0),
        (run_spot_job, "spot_reminder", 20, 0),
    )
    scheduler.add_job(
        record_heartbeat,
        IntervalTrigger(minutes=1),
        id="worker_heartbeat",
        replace_existing=True,
        coalesce=True,
        max_instances=1,
    )
    scheduler.add_job(
        run_waitlist_offer_job,
        IntervalTrigger(minutes=2),
        id="waitlist_offer_dispatch",
        replace_existing=True,
        coalesce=True,
        max_instances=1,
    )
    for func, job_id, hour, minute in jobs:
        scheduler.add_job(
            func,
            CronTrigger(hour=hour, minute=minute, timezone=india_tz),
            id=job_id,
            replace_existing=True,
            coalesce=True,
            max_instances=1,
            misfire_grace_time=15 * 60,
        )
    scheduler.start()
    log_event(
        logger,
        "scheduler_started",
        component="worker",
        operation="scheduler_start",
        outcome="success",
        count=len(jobs) + 2,
    )


def stop_scheduler() -> None:
    if scheduler.running:
        scheduler.shutdown(wait=False)
        log_event(
            logger,
            "scheduler_stopped",
            component="worker",
            operation="scheduler_stop",
            outcome="success",
        )
