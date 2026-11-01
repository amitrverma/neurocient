import asyncio
import os
from datetime import date
from datetime import datetime
from uuid import UUID, uuid4

import pytest
from sqlalchemy import delete, func, select


pytestmark = [
    pytest.mark.asyncio,
    pytest.mark.skipif(
        os.getenv("RUN_POSTGRES_INTEGRATION") != "1",
        reason="requires the local PostgreSQL integration database",
    ),
]


async def test_durable_job_and_notification_claims_are_unique():
    from app.database import AsyncSessionLocal, engine
    from app.models import NotificationDispatch, ScheduledJobRun, User
    from app.services.job_control import (
        claim_job_run,
        claim_notification_dispatch,
    )

    user_id = uuid4()
    run_key = f"integration-{uuid4()}"
    async with AsyncSessionLocal() as db:
        db.add(User(id=user_id, email=f"ops-{user_id}@example.test"))
        await db.commit()

    async def claim_run():
        async with AsyncSessionLocal() as db:
            return await claim_job_run(
                db,
                job_name="integration_job",
                run_key=run_key,
            )

    async def claim_dispatch(destination_key="integration-subscription"):
        async with AsyncSessionLocal() as db:
            return await claim_notification_dispatch(
                db,
                user_id=user_id,
                purpose="nudge",
                channel="push",
                destination_key=destination_key,
                dispatch_date=date(2026, 11, 1),
            )

    try:
        run_claims = await asyncio.gather(claim_run(), claim_run())
        dispatch_claims = await asyncio.gather(
            claim_dispatch("integration-subscription-a"),
            claim_dispatch("integration-subscription-b"),
        )

        assert sum(claim is not None for claim in run_claims) == 1
        assert sum(claim is not None for claim in dispatch_claims) == 1
        async with AsyncSessionLocal() as db:
            assert await db.scalar(
                select(func.count(ScheduledJobRun.id)).where(
                    ScheduledJobRun.job_name == "integration_job",
                    ScheduledJobRun.run_key == run_key,
                )
            ) == 1
            assert await db.scalar(
                select(func.count(NotificationDispatch.id)).where(
                    NotificationDispatch.user_id == user_id
                )
            ) == 1
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(
                delete(NotificationDispatch).where(
                    NotificationDispatch.user_id == user_id
                )
            )
            await db.execute(
                delete(ScheduledJobRun).where(
                    ScheduledJobRun.job_name == "integration_job",
                    ScheduledJobRun.run_key == run_key,
                )
            )
            await db.execute(delete(User).where(User.id == user_id))
            await db.commit()
        await engine.dispose()


async def test_reconciliation_issue_upsert_preserves_history():
    from app.database import AsyncSessionLocal, engine
    from app.models import ReconciliationIssue
    from app.services.payment_reconciliation import ObservedIssue, record_issue

    local_id = str(uuid4())
    observation = ObservedIssue(
        product="membership",
        issue_code="provider_local_status_conflict",
        object_type="membership_entitlement",
        local_object_id=local_id,
        provider_object_id="sub_integration",
        severity="critical",
        details={"local_status": "active", "provider_status": "cancelled"},
    )
    try:
        async with AsyncSessionLocal() as db:
            await record_issue(db, observation)
            await db.commit()
        async with AsyncSessionLocal() as db:
            first = await db.scalar(
                select(ReconciliationIssue).where(
                    ReconciliationIssue.dedupe_key == observation.dedupe_key
                )
            )
            first_seen = first.first_seen_at
            first.status = "resolved"
            await db.commit()
        async with AsyncSessionLocal() as db:
            await record_issue(db, observation)
            await db.commit()
        async with AsyncSessionLocal() as db:
            records = (
                await db.execute(
                    select(ReconciliationIssue).where(
                        ReconciliationIssue.dedupe_key == observation.dedupe_key
                    )
                )
            ).scalars().all()
            assert len(records) == 1
            assert records[0].status == "open"
            assert records[0].first_seen_at == first_seen
            assert records[0].severity == "critical"
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(
                delete(ReconciliationIssue).where(
                    ReconciliationIssue.dedupe_key == observation.dedupe_key
                )
            )
            await db.commit()
        await engine.dispose()


async def test_worker_heartbeat_is_visible_to_operational_snapshot():
    from app.database import AsyncSessionLocal, engine
    from app.models import WorkerHeartbeat
    from app.services.job_control import record_worker_heartbeat
    from app.services.operational_health import operational_snapshot

    instance_id = uuid4()
    try:
        async with AsyncSessionLocal() as db:
            await record_worker_heartbeat(
                db,
                worker_name="scheduler",
                instance_id=instance_id,
                started_at=datetime.utcnow(),
            )
        async with AsyncSessionLocal() as db:
            snapshot = await operational_snapshot(db)
            assert snapshot["signals"]["worker_heartbeat_stale"] == 0
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(
                delete(WorkerHeartbeat).where(
                    WorkerHeartbeat.worker_name == "scheduler"
                )
            )
            await db.commit()
        await engine.dispose()


async def test_bounded_reconciliation_pages_eventually_cover_every_record():
    from app.database import AsyncSessionLocal, engine
    from app.models import (
        MembershipEntitlement,
        ReconciliationCheckpoint,
        User,
    )
    from app.services.payment_reconciliation import bounded_reconciliation_page

    stream_name = f"integration-page-{uuid4()}"
    user_ids = [uuid4() for _ in range(3)]
    try:
        async with AsyncSessionLocal() as db:
            for index, user_id in enumerate(user_ids):
                db.add(User(id=user_id, email=f"page-{user_id}@example.test"))
                db.add(
                    MembershipEntitlement(
                        user_id=user_id,
                        status="active",
                        provider="integration-reconcile",
                        provider_subscription_id=f"sub_page_{index}",
                    )
                )
            await db.commit()

        observed = []
        for _ in range(2):
            async with AsyncSessionLocal() as db:
                page = await bounded_reconciliation_page(
                    db,
                    stream_name=stream_name,
                    query=select(MembershipEntitlement).where(
                        MembershipEntitlement.provider == "integration-reconcile"
                    ),
                    key_column=MembershipEntitlement.user_id,
                    cursor_parser=UUID,
                    batch_size=2,
                )
                observed.extend(item.user_id for item in page)
                await db.commit()

        assert set(observed) == set(user_ids)
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(
                delete(ReconciliationCheckpoint).where(
                    ReconciliationCheckpoint.stream_name == stream_name
                )
            )
            await db.execute(
                delete(MembershipEntitlement).where(
                    MembershipEntitlement.user_id.in_(user_ids)
                )
            )
            await db.execute(delete(User).where(User.id.in_(user_ids)))
            await db.commit()
        await engine.dispose()


async def test_admin_reconciliation_order_prioritizes_critical_issues():
    from app.Routes.admin_data_routes import reconciliation_severity_order
    from app.database import AsyncSessionLocal, engine
    from app.models import ReconciliationIssue
    from app.services.payment_reconciliation import ObservedIssue, record_issue

    local_id = str(uuid4())
    observations = [
        ObservedIssue(
            product="membership",
            issue_code="warning_test",
            object_type="integration",
            local_object_id=local_id,
            severity="warning",
        ),
        ObservedIssue(
            product="membership",
            issue_code="critical_test",
            object_type="integration",
            local_object_id=local_id,
            severity="critical",
        ),
        ObservedIssue(
            product="membership",
            issue_code="warning_test_two",
            object_type="integration",
            local_object_id=local_id,
            severity="warning",
        ),
    ]
    try:
        async with AsyncSessionLocal() as db:
            for observation in observations:
                await record_issue(db, observation)
            await db.commit()
        async with AsyncSessionLocal() as db:
            tied_at = datetime(2026, 11, 1, 12, 0)
            records = (
                await db.execute(
                    select(ReconciliationIssue).where(
                        ReconciliationIssue.local_object_id == local_id
                    )
                )
            ).scalars().all()
            for record in records:
                record.last_seen_at = tied_at
            await db.commit()
        async with AsyncSessionLocal() as db:
            ordered = (
                await db.execute(
                    select(ReconciliationIssue).where(
                        ReconciliationIssue.local_object_id == local_id
                    ).order_by(
                        reconciliation_severity_order(),
                        ReconciliationIssue.last_seen_at.desc(),
                        ReconciliationIssue.id.asc(),
                    )
                )
            ).scalars().all()
            assert [issue.severity for issue in ordered] == [
                "critical",
                "warning",
                "warning",
            ]
            warning_ids = [issue.id for issue in ordered if issue.severity == "warning"]
            assert warning_ids == sorted(warning_ids)
    finally:
        async with AsyncSessionLocal() as db:
            await db.execute(
                delete(ReconciliationIssue).where(
                    ReconciliationIssue.local_object_id == local_id
                )
            )
            await db.commit()
        await engine.dispose()
