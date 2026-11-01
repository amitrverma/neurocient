from __future__ import annotations

import uuid
from datetime import date, datetime, timedelta

from sqlalchemy import select, update
from sqlalchemy.dialects.postgresql import insert
from sqlalchemy.ext.asyncio import AsyncSession

from app.models import NotificationDispatch, ScheduledJobRun, WorkerHeartbeat
from app.observability import current_correlation_id, normalize_correlation_id


def _correlation_uuid() -> uuid.UUID:
    return uuid.UUID(normalize_correlation_id(current_correlation_id.get()))


async def record_worker_heartbeat(
    db: AsyncSession,
    *,
    worker_name: str,
    instance_id: uuid.UUID,
    started_at: datetime,
) -> None:
    now = datetime.utcnow()
    await db.execute(
        insert(WorkerHeartbeat)
        .values(
            worker_name=worker_name,
            instance_id=instance_id,
            started_at=started_at,
            last_seen_at=now,
        )
        .on_conflict_do_update(
            index_elements=[WorkerHeartbeat.worker_name],
            set_={
                "instance_id": instance_id,
                "started_at": started_at,
                "last_seen_at": now,
                "updated_at": now,
            },
        )
    )
    await db.commit()


async def claim_job_run(
    db: AsyncSession,
    *,
    job_name: str,
    run_key: str,
    lease_minutes: int = 30,
) -> ScheduledJobRun | None:
    now = datetime.utcnow()
    run_id = uuid.uuid4()
    inserted = await db.execute(
        insert(ScheduledJobRun)
        .values(
            id=run_id,
            job_name=job_name,
            run_key=run_key,
            status="running",
            attempt_count=1,
            correlation_id=_correlation_uuid(),
            lease_expires_at=now + timedelta(minutes=lease_minutes),
            started_at=now,
        )
        .on_conflict_do_nothing(
            constraint="uq_scheduled_job_run_key"
        )
        .returning(ScheduledJobRun.id)
    )
    if inserted.scalar_one_or_none() is not None:
        await db.commit()
        return await db.get(ScheduledJobRun, run_id)

    await db.rollback()
    existing = await db.scalar(
        select(ScheduledJobRun).where(
            ScheduledJobRun.job_name == job_name,
            ScheduledJobRun.run_key == run_key,
        )
    )
    if (
        existing
        and existing.status == "running"
        and existing.lease_expires_at <= now
    ):
        existing.status = "reconciliation_required"
        existing.last_error_code = "worker_interrupted"
        existing.completed_at = now
        await db.commit()
    return None


async def complete_job_run(
    db: AsyncSession,
    run_id: uuid.UUID,
    result: dict,
) -> None:
    run = await db.get(ScheduledJobRun, run_id, with_for_update=True)
    if not run or run.status != "running":
        return
    run.status = "completed"
    run.result = result
    run.completed_at = datetime.utcnow()
    await db.commit()


async def fail_job_run(
    db: AsyncSession,
    run_id: uuid.UUID,
    *,
    error_code: str,
) -> None:
    run = await db.get(ScheduledJobRun, run_id, with_for_update=True)
    if not run or run.status != "running":
        return
    run.status = "failed"
    run.last_error_code = error_code
    run.completed_at = datetime.utcnow()
    await db.commit()


async def claim_notification_dispatch(
    db: AsyncSession,
    *,
    user_id,
    purpose: str,
    channel: str,
    destination_key: str,
    dispatch_date: date,
) -> NotificationDispatch | None:
    dispatch_id = uuid.uuid4()
    now = datetime.utcnow()
    inserted = await db.execute(
        insert(NotificationDispatch)
        .values(
            id=dispatch_id,
            user_id=user_id,
            purpose=purpose,
            channel=channel,
            destination_key=destination_key,
            dispatch_date=dispatch_date,
            status="dispatching",
            attempt_count=1,
            correlation_id=_correlation_uuid(),
            first_attempt_at=now,
            last_attempt_at=now,
        )
        .on_conflict_do_nothing(
            constraint="uq_notification_dispatch_daily"
        )
        .returning(NotificationDispatch.id)
    )
    if inserted.scalar_one_or_none() is None:
        await db.rollback()
        return None
    await db.commit()
    return await db.get(NotificationDispatch, dispatch_id)


async def finish_notification_dispatch(
    db: AsyncSession,
    dispatch_id: uuid.UUID,
    *,
    status: str,
    error_code: str | None = None,
    provider_message_id: str | None = None,
) -> None:
    dispatch = await db.get(NotificationDispatch, dispatch_id, with_for_update=True)
    if not dispatch or dispatch.status != "dispatching":
        return
    dispatch.status = status
    dispatch.last_error_code = error_code
    dispatch.provider_message_id = provider_message_id
    dispatch.completed_at = datetime.utcnow()
    await db.commit()


async def mark_stale_dispatches_uncertain(
    db: AsyncSession,
    *,
    older_than_minutes: int = 30,
) -> int:
    cutoff = datetime.utcnow() - timedelta(minutes=older_than_minutes)
    result = await db.execute(
        update(NotificationDispatch)
        .where(
            NotificationDispatch.status == "dispatching",
            NotificationDispatch.last_attempt_at < cutoff,
        )
        .values(
            status="reconciliation_required",
            last_error_code="worker_interrupted",
            completed_at=datetime.utcnow(),
        )
    )
    await db.commit()
    return result.rowcount or 0
