import asyncio
import uuid
from datetime import datetime
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.utils import scheduler


@pytest.fixture(autouse=True)
def stale_dispatch_recovery(monkeypatch):
    recovery = AsyncMock(return_value=0)
    monkeypatch.setattr(scheduler, "mark_stale_dispatches_uncertain", recovery)
    return recovery


class DummySession:
    async def __aenter__(self):
        return object()

    async def __aexit__(self, exc_type, exc, tb):
        return None


def test_daily_run_key_uses_india_calendar_day():
    value = datetime.fromisoformat("2026-11-01T23:45:00+05:30")
    assert scheduler._daily_run_key(value) == "2026-11-01"


def test_claimed_job_completes_once(monkeypatch):
    run = SimpleNamespace(id=uuid.uuid4(), correlation_id=uuid.uuid4())
    claim = AsyncMock(return_value=run)
    complete = AsyncMock()
    fail = AsyncMock()
    task = AsyncMock(return_value={"sent": 2})
    monkeypatch.setattr(scheduler, "AsyncSessionLocal", lambda: DummySession())
    monkeypatch.setattr(scheduler, "claim_job_run", claim)
    monkeypatch.setattr(scheduler, "complete_job_run", complete)
    monkeypatch.setattr(scheduler, "fail_job_run", fail)

    result = asyncio.run(
        scheduler.run_claimed_job(task, "daily_nudge", run_key="2026-11-01")
    )

    assert result == {"sent": 2}
    task.assert_awaited_once()
    complete.assert_awaited_once()
    fail.assert_not_awaited()


def test_duplicate_claim_never_executes_task(monkeypatch):
    monkeypatch.setattr(scheduler, "AsyncSessionLocal", lambda: DummySession())
    monkeypatch.setattr(scheduler, "claim_job_run", AsyncMock(return_value=None))
    task = AsyncMock()

    result = asyncio.run(
        scheduler.run_claimed_job(task, "daily_nudge", run_key="2026-11-01")
    )

    assert result is None
    task.assert_not_awaited()


def test_task_failure_is_recorded_without_automatic_replay(monkeypatch):
    run = SimpleNamespace(id=uuid.uuid4(), correlation_id=uuid.uuid4())
    task = AsyncMock(side_effect=ValueError("private provider detail"))
    fail = AsyncMock()
    monkeypatch.setattr(scheduler, "AsyncSessionLocal", lambda: DummySession())
    monkeypatch.setattr(scheduler, "claim_job_run", AsyncMock(return_value=run))
    monkeypatch.setattr(scheduler, "complete_job_run", AsyncMock())
    monkeypatch.setattr(scheduler, "fail_job_run", fail)

    result = asyncio.run(
        scheduler.run_claimed_job(task, "daily_nudge", run_key="2026-11-01")
    )

    assert result is None
    task.assert_awaited_once()
    fail.assert_awaited_once()


def test_start_scheduler_registers_worker_jobs(monkeypatch):
    calls = []

    class DummyScheduler:
        running = False

        def add_job(self, *args, **kwargs):
            calls.append(("add", args, kwargs))

        def start(self):
            calls.append(("start",))

    monkeypatch.setattr(scheduler, "scheduler", DummyScheduler())
    monkeypatch.setattr(scheduler, "CronTrigger", lambda **kwargs: ("cron", kwargs))
    monkeypatch.setattr(scheduler, "IntervalTrigger", lambda **kwargs: ("interval", kwargs))

    scheduler.start_scheduler()

    add_calls = [call for call in calls if call[0] == "add"]
    assert len(add_calls) == 5
    assert all(call[2]["coalesce"] is True for call in add_calls)
    assert all(call[2]["max_instances"] == 1 for call in add_calls)
    assert ("start",) in calls


def test_start_scheduler_is_idempotent(monkeypatch):
    class RunningScheduler:
        running = True

        def add_job(self, *args, **kwargs):
            raise AssertionError("must not add duplicate jobs")

        def start(self):
            raise AssertionError("must not start twice")

    monkeypatch.setattr(scheduler, "scheduler", RunningScheduler())
    scheduler.start_scheduler()
