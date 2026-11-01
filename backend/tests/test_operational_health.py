import pytest
from datetime import datetime
from zoneinfo import ZoneInfo

from app.services import operational_health


def test_due_daily_jobs_only_flags_work_after_its_grace_window():
    india = ZoneInfo("Asia/Kolkata")
    assert operational_health._due_daily_jobs(
        datetime(2026, 11, 1, 2, 59, tzinfo=india)
    ) == []
    assert operational_health._due_daily_jobs(
        datetime(2026, 11, 1, 9, 16, tzinfo=india)
    ) == [
        ("payment_reconciliation", "2026-11-01"),
        ("daily_nudge", "2026-11-01"),
    ]


class FakeSession:
    def __init__(self, error=None):
        self.error = error

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_args):
        return False

    async def execute(self, _statement):
        if self.error:
            raise self.error
        return None


@pytest.mark.asyncio
async def test_readiness_distinguishes_configuration_failure(monkeypatch):
    def fail_configuration():
        raise RuntimeError("secret value should not be returned")

    monkeypatch.setattr(
        operational_health.settings,
        "validate_for_startup",
        fail_configuration,
    )

    ready, payload = await operational_health.readiness_snapshot()

    assert ready is False
    assert payload == {
        "status": "not_ready",
        "components": {
            "configuration": "failed",
            "database": "not_checked",
        },
    }
    assert "secret" not in str(payload)


@pytest.mark.asyncio
async def test_readiness_reports_database_without_exception_text(monkeypatch):
    monkeypatch.setattr(
        operational_health.settings,
        "validate_for_startup",
        lambda: None,
    )
    monkeypatch.setattr(
        operational_health,
        "AsyncSessionLocal",
        lambda: FakeSession(RuntimeError("postgres password=private")),
    )

    ready, payload = await operational_health.readiness_snapshot()

    assert ready is False
    assert payload["components"] == {
        "configuration": "ok",
        "database": "failed",
    }
    assert "private" not in str(payload)


@pytest.mark.asyncio
async def test_readiness_reports_database_success(monkeypatch):
    monkeypatch.setattr(
        operational_health.settings,
        "validate_for_startup",
        lambda: None,
    )
    monkeypatch.setattr(
        operational_health,
        "AsyncSessionLocal",
        lambda: FakeSession(),
    )

    ready, payload = await operational_health.readiness_snapshot()

    assert ready is True
    assert payload["status"] == "ready"
