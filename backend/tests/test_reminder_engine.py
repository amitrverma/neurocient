import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.utils import reminder_engine


@pytest.fixture(autouse=True)
def durable_dispatch_claims(monkeypatch):
    claim = AsyncMock(
        side_effect=lambda *args, **kwargs: SimpleNamespace(id="dispatch-id")
    )
    finish = AsyncMock()
    monkeypatch.setattr(reminder_engine, "claim_notification_dispatch", claim)
    monkeypatch.setattr(reminder_engine, "finish_notification_dispatch", finish)
    return claim, finish


class FakeResult:
    def __init__(self, values):
        self.values = values

    def scalars(self):
        return self

    def all(self):
        return self.values


class DeliverySession:
    def __init__(self, preferences, subscriptions=()):
        self.preferences = preferences
        self.subscriptions = list(subscriptions)

    async def scalar(self, _statement):
        return self.preferences

    async def execute(self, _statement):
        return FakeResult(self.subscriptions)

    async def refresh(self, _value, attribute_names=None):
        return None


def preferences(**overrides):
    values = {
        "nudge_enabled": False,
        "spot_reminder_enabled": False,
        "microchallenge_enabled": False,
        "push_enabled": False,
        "whatsapp_enabled": False,
        "whatsapp_verified": False,
        "whatsapp_number": None,
    }
    values.update(overrides)
    return SimpleNamespace(**values)


def test_has_spotted_today_uses_persisted_result():
    db = SimpleNamespace(scalar=AsyncMock(side_effect=["spot-id", None]))
    assert asyncio.run(reminder_engine.has_spotted_today("u1", db)) is True
    assert asyncio.run(reminder_engine.has_spotted_today("u1", db)) is False


def test_has_logged_micro_today_uses_persisted_result():
    db = SimpleNamespace(scalar=AsyncMock(side_effect=["log-id", None]))
    assert asyncio.run(reminder_engine.has_logged_micro_today("u1", db)) is True
    assert asyncio.run(reminder_engine.has_logged_micro_today("u1", db)) is False


@pytest.mark.parametrize(
    ("purpose", "purpose_field"),
    [
        ("nudge", "nudge_enabled"),
        ("spot_reminder", "spot_reminder_enabled"),
        ("microchallenge", "microchallenge_enabled"),
    ],
)
def test_disabled_purpose_never_reaches_provider(
    monkeypatch,
    purpose,
    purpose_field,
):
    send_push = AsyncMock(return_value=True)
    send_whatsapp = AsyncMock(return_value=True)
    monkeypatch.setattr(reminder_engine, "send_push", send_push)
    monkeypatch.setattr(reminder_engine.asyncio, "to_thread", send_whatsapp)
    db = DeliverySession(
        preferences(
            **{
                purpose_field: False,
                "push_enabled": True,
                "whatsapp_enabled": True,
                "whatsapp_verified": True,
                "whatsapp_number": "+919876543210",
            }
        ),
        [SimpleNamespace(id="s1", endpoint="https://push.test/1", keys={})],
    )

    result = asyncio.run(
        reminder_engine._deliver_to_user(
            db,
            user_id="u1",
            purpose=purpose,
            title="Title",
            body="Body",
        )
    )

    assert result == {
        "push_success": 0,
        "push_failed": 0,
        "whatsapp_success": 0,
        "whatsapp_failed": 0,
    }
    send_push.assert_not_awaited()
    send_whatsapp.assert_not_awaited()


def test_enabled_purpose_delivers_only_enabled_verified_channels(monkeypatch):
    send_push = AsyncMock(return_value=True)
    send_whatsapp = AsyncMock(return_value=True)
    monkeypatch.setattr(reminder_engine, "send_push", send_push)
    monkeypatch.setattr(reminder_engine.asyncio, "to_thread", send_whatsapp)
    subscription = SimpleNamespace(
        id="s1",
        endpoint="https://push.test/1",
        keys={"p256dh": "key", "auth": "auth"},
    )
    db = DeliverySession(
        preferences(
            nudge_enabled=True,
            push_enabled=True,
            whatsapp_enabled=True,
            whatsapp_verified=True,
            whatsapp_number="+919876543210",
        ),
        [subscription],
    )

    result = asyncio.run(
        reminder_engine._deliver_to_user(
            db,
            user_id="u1",
            purpose="nudge",
            title="Title",
            body="Body",
        )
    )

    assert result == {
        "push_success": 1,
        "push_failed": 0,
        "whatsapp_success": 1,
        "whatsapp_failed": 0,
    }
    send_push.assert_awaited_once()
    send_whatsapp.assert_awaited_once()


def test_provider_rejections_are_counted_as_failures(monkeypatch):
    monkeypatch.setattr(reminder_engine, "send_push", AsyncMock(return_value=None))
    monkeypatch.setattr(
        reminder_engine.asyncio,
        "to_thread",
        AsyncMock(return_value=False),
    )
    db = DeliverySession(
        preferences(
            nudge_enabled=True,
            push_enabled=True,
            whatsapp_enabled=True,
            whatsapp_verified=True,
            whatsapp_number="+919876543210",
        ),
        [SimpleNamespace(id="s1", endpoint="https://push.test/1", keys={})],
    )

    result = asyncio.run(
        reminder_engine._deliver_to_user(
            db,
            user_id="u1",
            purpose="nudge",
            title="Title",
            body="Body",
        )
    )

    assert result == {
        "push_success": 0,
        "push_failed": 1,
        "whatsapp_success": 0,
        "whatsapp_failed": 1,
    }


def test_transport_ambiguous_delivery_requires_reconciliation(
    monkeypatch,
    durable_dispatch_claims,
):
    _, finish = durable_dispatch_claims
    monkeypatch.setattr(
        reminder_engine,
        "send_push",
        AsyncMock(side_effect=RuntimeError("transport lost after submit")),
    )
    db = DeliverySession(
        preferences(nudge_enabled=True, push_enabled=True),
        [SimpleNamespace(id="s1", endpoint="https://push.test/1", keys={})],
    )

    result = asyncio.run(
        reminder_engine._deliver_to_user(
            db,
            user_id="u1",
            purpose="nudge",
            title="Title",
            body="Body",
        )
    )

    assert result["push_failed"] == 1
    assert finish.await_args.kwargs == {
        "status": "reconciliation_required",
        "error_code": "provider_outcome_unknown",
    }


def test_push_falls_back_to_next_device_under_one_daily_claim(
    monkeypatch,
    durable_dispatch_claims,
):
    claim, finish = durable_dispatch_claims
    send_push = AsyncMock(side_effect=[None, True])
    monkeypatch.setattr(reminder_engine, "send_push", send_push)
    db = DeliverySession(
        preferences(nudge_enabled=True, push_enabled=True),
        [
            SimpleNamespace(id="expired", endpoint="https://push.test/1", keys={}),
            SimpleNamespace(id="valid", endpoint="https://push.test/2", keys={}),
        ],
    )

    result = asyncio.run(
        reminder_engine._deliver_to_user(
            db,
            user_id="u1",
            purpose="nudge",
            title="Title",
            body="Body",
        )
    )

    assert result["push_success"] == 1
    assert send_push.await_count == 2
    claim.assert_awaited_once()
    assert finish.await_args.kwargs == {"status": "sent", "error_code": None}


def test_existing_dispatch_claim_prevents_duplicate_provider_call(
    monkeypatch,
    durable_dispatch_claims,
):
    claim, finish = durable_dispatch_claims
    claim.side_effect = None
    claim.return_value = None
    send_push = AsyncMock(return_value=True)
    monkeypatch.setattr(reminder_engine, "send_push", send_push)
    db = DeliverySession(
        preferences(nudge_enabled=True, push_enabled=True),
        [SimpleNamespace(id="s1", endpoint="https://push.test/1", keys={})],
    )

    result = asyncio.run(
        reminder_engine._deliver_to_user(
            db,
            user_id="u1",
            purpose="nudge",
            title="Title",
            body="Body",
        )
    )

    assert result["push_success"] == 0
    assert result["push_failed"] == 0
    send_push.assert_not_awaited()
    finish.assert_not_awaited()


@pytest.mark.parametrize(
    ("purpose", "purpose_field"),
    [
        ("nudge", "nudge_enabled"),
        ("spot_reminder", "spot_reminder_enabled"),
        ("microchallenge", "microchallenge_enabled"),
    ],
)
@pytest.mark.parametrize(
    ("push_enabled", "whatsapp_enabled", "expected_push", "expected_whatsapp"),
    [
        (False, False, 0, 0),
        (True, False, 1, 0),
        (False, True, 0, 1),
        (True, True, 1, 1),
    ],
)
def test_every_purpose_honors_each_channel_independently(
    monkeypatch,
    purpose,
    purpose_field,
    push_enabled,
    whatsapp_enabled,
    expected_push,
    expected_whatsapp,
):
    send_push = AsyncMock(return_value=True)
    send_whatsapp = AsyncMock(return_value=True)
    monkeypatch.setattr(reminder_engine, "send_push", send_push)
    monkeypatch.setattr(reminder_engine.asyncio, "to_thread", send_whatsapp)
    db = DeliverySession(
        preferences(
            **{
                purpose_field: True,
                "push_enabled": push_enabled,
                "whatsapp_enabled": whatsapp_enabled,
                "whatsapp_verified": True,
                "whatsapp_number": "+919876543210",
            }
        ),
        [SimpleNamespace(id="s1", endpoint="https://push.test/1", keys={})],
    )

    result = asyncio.run(
        reminder_engine._deliver_to_user(
            db,
            user_id="u1",
            purpose=purpose,
            title="Title",
            body="Body",
        )
    )

    assert result == {
        "push_success": expected_push,
        "push_failed": 0,
        "whatsapp_success": expected_whatsapp,
        "whatsapp_failed": 0,
    }


def test_unverified_whatsapp_is_never_called(monkeypatch):
    send_whatsapp = AsyncMock(return_value=True)
    monkeypatch.setattr(reminder_engine.asyncio, "to_thread", send_whatsapp)
    db = DeliverySession(
        preferences(
            spot_reminder_enabled=True,
            whatsapp_enabled=True,
            whatsapp_verified=False,
            whatsapp_number="+919876543210",
        )
    )

    result = asyncio.run(
        reminder_engine._deliver_to_user(
            db,
            user_id="u1",
            purpose="spot_reminder",
            title="Title",
            body="Body",
        )
    )

    assert result == {
        "push_success": 0,
        "push_failed": 0,
        "whatsapp_success": 0,
        "whatsapp_failed": 0,
    }
    send_whatsapp.assert_not_awaited()


def test_scheduled_candidate_is_rechecked_after_opt_out(monkeypatch):
    monkeypatch.setattr(
        reminder_engine,
        "_candidate_user_ids",
        AsyncMock(return_value=["u1"]),
    )
    monkeypatch.setattr(
        reminder_engine,
        "has_spotted_today",
        AsyncMock(return_value=False),
    )
    send_push = AsyncMock(return_value=True)
    send_whatsapp = AsyncMock(return_value=True)
    monkeypatch.setattr(reminder_engine, "send_push", send_push)
    monkeypatch.setattr(reminder_engine.asyncio, "to_thread", send_whatsapp)
    # The candidate existed when the run began, but current persisted consent
    # is disabled by the time dispatch re-reads it.
    db = DeliverySession(
        preferences(
            spot_reminder_enabled=False,
            push_enabled=True,
            whatsapp_enabled=True,
            whatsapp_verified=True,
            whatsapp_number="+919876543210",
        )
    )

    result = asyncio.run(reminder_engine.send_spot_pushes(db))

    assert result == {
        "push_success": 0,
        "push_failed": 0,
        "whatsapp_success": 0,
        "whatsapp_failed": 0,
    }
    send_push.assert_not_awaited()
    send_whatsapp.assert_not_awaited()


def test_opt_out_after_target_selection_stops_adapter_call(monkeypatch):
    send_push = AsyncMock(return_value=True)
    send_whatsapp = AsyncMock(return_value=True)
    monkeypatch.setattr(reminder_engine, "send_push", send_push)
    monkeypatch.setattr(reminder_engine.asyncio, "to_thread", send_whatsapp)
    prefs = preferences(
        nudge_enabled=True,
        push_enabled=True,
        whatsapp_enabled=True,
        whatsapp_verified=True,
        whatsapp_number="+919876543210",
    )

    class RevokingSession(DeliverySession):
        async def refresh(self, _value, attribute_names=None):
            prefs.nudge_enabled = False

    db = RevokingSession(
        prefs,
        [SimpleNamespace(id="s1", endpoint="https://push.test/1", keys={})],
    )

    result = asyncio.run(
        reminder_engine._deliver_to_user(
            db,
            user_id="u1",
            purpose="nudge",
            title="Title",
            body="Body",
        )
    )

    assert result == {
        "push_success": 0,
        "push_failed": 0,
        "whatsapp_success": 0,
        "whatsapp_failed": 0,
    }
    send_push.assert_not_awaited()
    send_whatsapp.assert_not_awaited()
