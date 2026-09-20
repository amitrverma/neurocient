import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

from app.utils import reminder_engine


class FakeResult:
    def __init__(self, obj):
        self.obj = obj

    def scalars(self):
        return self

    def first(self):
        return self.obj

    def all(self):
        return self.obj


class FakeSession:
    def __init__(self, obj):
        self.obj = obj

    async def execute(self, stmt):
        return FakeResult(self.obj)


def test_has_spotted_today(monkeypatch):
    db_true = FakeSession(object())
    assert asyncio.run(reminder_engine.has_spotted_today("u1", db_true)) is True

    db_false = FakeSession(None)
    assert asyncio.run(reminder_engine.has_spotted_today("u1", db_false)) is False


def test_has_logged_micro_today(monkeypatch):
    db_true = FakeSession(object())
    assert asyncio.run(reminder_engine.has_logged_micro_today("u1", db_true)) is True

    db_false = FakeSession(None)
    assert asyncio.run(reminder_engine.has_logged_micro_today("u1", db_false)) is False


def test_send_spot_pushes_awaits_each_delivery(monkeypatch):
    user = SimpleNamespace(id="u1", phone_number=None)
    subscription = SimpleNamespace(id="sub-1", endpoint="endpoint", keys={})

    class SequencedSession:
        def __init__(self):
            self.results = [
                FakeResult(["u1"]),
                SimpleNamespace(scalar_one_or_none=lambda: user),
                FakeResult([subscription]),
            ]

        async def execute(self, stmt):
            return self.results.pop(0)

    send_push = AsyncMock(return_value="ok")
    monkeypatch.setattr(reminder_engine, "send_push", send_push)
    monkeypatch.setattr(reminder_engine, "has_spotted_today", AsyncMock(return_value=False))

    db = SequencedSession()
    asyncio.run(reminder_engine.send_spot_pushes(db))

    send_push.assert_awaited_once()
    assert send_push.await_args.kwargs["db"] is db
    assert send_push.await_args.kwargs["sub_id"] == "sub-1"
