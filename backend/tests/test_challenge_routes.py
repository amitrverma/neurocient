import asyncio
from datetime import date, datetime, timedelta
from types import SimpleNamespace
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.Routes import challenge_routes


class FakeResult:
    def __init__(self, *, rows=None, scalar=None, scalars=None):
        self._rows = rows
        self._scalar = scalar
        self._scalars = scalars

    def all(self):
        return self._rows

    def scalar_one_or_none(self):
        return self._scalar

    def scalar(self):
        return self._scalar

    def scalars(self):
        return FakeResult(rows=self._scalars)


class SequencedSession:
    def __init__(self, results):
        self.results = list(results)
        self.added = []
        self.commits = 0

    async def execute(self, _statement):
        return self.results.pop(0)

    async def commit(self):
        self.commits += 1

    def add(self, value):
        self.added.append(value)


def test_my_microchallenges_reports_assignment_scoped_logged_today():
    assignment_id = uuid4()
    challenge_id = uuid4()
    assignment = SimpleNamespace(
        id=assignment_id,
        challenge_id=challenge_id,
        status="active",
        started_at=datetime(2026, 10, 1),
        completed_at=None,
    )
    challenge = SimpleNamespace(
        title="Start smaller",
        intro=[],
        instructions=[],
        why="",
        tips=[],
        closing="",
    )
    today_log = SimpleNamespace(log_date=date.today())
    db = SequencedSession(
        [
            FakeResult(rows=[(assignment, challenge)]),
            FakeResult(scalars=[today_log]),
        ]
    )

    response = asyncio.run(
        challenge_routes.my_microchallenges(
            db=db,
            current_user=SimpleNamespace(id=uuid4()),
        )
    )

    assert response[0]["assignment_id"] == str(assignment_id)
    assert response[0]["logged_today"] is True


def test_duplicate_daily_log_returns_complete_current_state():
    assignment_id = uuid4()
    assignment = SimpleNamespace(
        id=assignment_id,
        status="active",
        completed_at=None,
        started_at=datetime.now(),
    )
    existing_log = SimpleNamespace(log_date=date.today())
    db = SequencedSession(
        [
            FakeResult(scalar=assignment),
            FakeResult(scalar=existing_log),
            FakeResult(scalars=[existing_log]),
        ]
    )

    response = asyncio.run(
        challenge_routes.log_today(
            payload=challenge_routes.LogTodayRequest(assignment_id=assignment_id),
            db=db,
            current_user=SimpleNamespace(id=uuid4()),
        )
    )

    assert response["message"] == "Already logged today"
    assert response["status"] == "active"
    assert response["progress"] == 4.8
    assert response["completed_at"] is None


def test_challenge_stays_active_through_day_21():
    started_at = datetime.combine(
        date.today() - timedelta(days=20),
        datetime.min.time(),
    )

    assert challenge_routes.final_status(started_at, 17, date.today()) == "active"


def test_challenge_finishes_after_day_21_using_17_day_threshold():
    started_at = datetime.combine(
        date.today() - timedelta(days=21),
        datetime.min.time(),
    )

    assert challenge_routes.final_status(started_at, 17, date.today()) == "success"
    assert challenge_routes.final_status(started_at, 16, date.today()) == "failed"


def test_progress_is_capped_at_100_percent():
    assert challenge_routes.progress_percent(22) == 100.0


def test_logging_after_day_21_finalizes_and_rejects_the_log():
    assignment_id = uuid4()
    assignment = SimpleNamespace(
        id=assignment_id,
        status="active",
        completed_at=None,
        started_at=datetime.combine(
            date.today() - timedelta(days=21),
            datetime.min.time(),
        ),
    )
    logs = [SimpleNamespace(log_date=date.today()) for _ in range(16)]
    db = SequencedSession(
        [
            FakeResult(scalar=assignment),
            FakeResult(scalars=logs),
        ]
    )

    with pytest.raises(HTTPException) as raised:
        asyncio.run(
            challenge_routes.log_today(
                payload=challenge_routes.LogTodayRequest(
                    assignment_id=assignment_id,
                ),
                db=db,
                current_user=SimpleNamespace(id=uuid4()),
            )
        )

    assert raised.value.status_code == 409
    assert raised.value.detail["code"] == "challenge_ended"
    assert raised.value.detail["status"] == "failed"
    assert assignment.status == "failed"
    assert db.commits == 1
