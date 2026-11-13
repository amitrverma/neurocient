import asyncio
from datetime import datetime
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
        "whatsapp_pending_action": None,
        "whatsapp_pending_action_expires_at": None,
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


def test_microchallenge_reminder_uses_active_experiment_content():
    title, body, whatsapp_body = reminder_engine.microchallenge_reminder_copy(
        "Put the phone away",
        ["Leave your phone outside the room for the first ten minutes.", "Begin work."],
    )

    assert title == "Today's experiment"
    assert body == "Put the phone away"
    assert "Put the phone away" in whatsapp_body
    assert "Leave your phone outside the room" in whatsapp_body
    assert "Done" in whatsapp_body
    assert "Partly" in whatsapp_body
    assert "Didn't happen" in whatsapp_body


def test_microchallenge_reminder_keeps_response_options_with_long_content():
    _title, _body, whatsapp_body = reminder_engine.microchallenge_reminder_copy(
        "T" * 2_000,
        ["I" * 2_000],
    )

    assert len(whatsapp_body) <= 1_600
    assert whatsapp_body.endswith(
        "How did it go? Reply:\n1. Done\n2. Partly\n3. Didn't happen"
    )


def test_microchallenge_job_sends_active_content_only_when_unreported(monkeypatch):
    monkeypatch.setattr(
        reminder_engine,
        "_candidate_user_ids",
        AsyncMock(return_value=["u1", "u2", "u3"]),
    )
    monkeypatch.setattr(
        reminder_engine,
        "has_logged_micro_today",
        AsyncMock(side_effect=[False, True, False]),
    )
    active = SimpleNamespace(
        title="Put the phone away",
        instructions=["Leave it outside the room for ten minutes."],
    )
    monkeypatch.setattr(
        reminder_engine,
        "active_microchallenge",
        AsyncMock(side_effect=[(SimpleNamespace(id="a1"), active), None]),
    )
    deliver = AsyncMock(
        return_value={
            "push_success": 0,
            "push_failed": 0,
            "whatsapp_success": 1,
            "whatsapp_failed": 0,
        }
    )
    monkeypatch.setattr(reminder_engine, "_deliver_to_user", deliver)

    result = asyncio.run(reminder_engine.send_microchallenge_pushes(SimpleNamespace()))

    assert result["whatsapp_success"] == 1
    deliver.assert_awaited_once()
    assert deliver.await_args.kwargs["user_id"] == "u1"
    assert deliver.await_args.kwargs["whatsapp_destination_key"] == (
        "microchallenge-assignment:a1"
    )
    assert deliver.await_args.kwargs["whatsapp_template_parameters"] == (
        "Put the phone away",
        "Leave it outside the room for ten minutes.",
    )


def test_daily_nudge_yields_to_due_microchallenge_reminder(monkeypatch):
    monkeypatch.setattr(
        reminder_engine,
        "get_daily_active_nudge",
        AsyncMock(
            return_value=SimpleNamespace(
                id="n1",
                title="Nudge",
                quote="Return to one useful idea.",
                paragraphs=[],
            )
        ),
    )
    monkeypatch.setattr(
        reminder_engine,
        "_candidate_user_ids",
        AsyncMock(return_value=["u1", "u2"]),
    )
    monkeypatch.setattr(
        reminder_engine,
        "microchallenge_reminder_due",
        AsyncMock(side_effect=[True, False]),
    )
    deliver = AsyncMock(
        return_value={
            "push_success": 0,
            "push_failed": 0,
            "whatsapp_success": 1,
            "whatsapp_failed": 0,
        }
    )
    monkeypatch.setattr(reminder_engine, "_deliver_to_user", deliver)

    result = asyncio.run(reminder_engine.send_daily_nudge(SimpleNamespace()))

    deliver.assert_awaited_once()
    assert deliver.await_args.kwargs["user_id"] == "u2"
    assert result["whatsapp_success"] == 1


@pytest.mark.parametrize(
    ("purpose", "purpose_field"),
    [
        ("nudge", "nudge_enabled"),
        ("spot_reminder", "spot_reminder_enabled"),
        ("microchallenge", "microchallenge_enabled"),
    ],
)
def test_legacy_purpose_flags_do_not_override_enabled_channels(
    monkeypatch,
    purpose,
    purpose_field,
):
    template_name = {
        "nudge": "neurocient_daily_nudge_v2",
        "spot_reminder": "neurocient_spot_checkin_v2",
        "microchallenge": "neurocient_microchallenge_checkin_v2",
    }[purpose]
    monkeypatch.setattr(
        reminder_engine.settings,
        {
            "nudge": "WHATSAPP_NUDGE_TEMPLATE_NAME",
            "spot_reminder": "WHATSAPP_SPOT_TEMPLATE_NAME",
            "microchallenge": "WHATSAPP_MICROCHALLENGE_TEMPLATE_NAME",
        }[purpose],
        template_name,
    )
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
        "push_success": 1,
        "push_failed": 0,
        "whatsapp_success": 1,
        "whatsapp_failed": 0,
    }
    send_push.assert_awaited_once()
    send_whatsapp.assert_awaited_once()
    assert (
        send_whatsapp.await_args.args[0]
        is reminder_engine.send_whatsapp_template_message
    )
    assert send_whatsapp.await_args.kwargs == {
        "template_name": template_name,
        "language_code": "en_GB",
        "body_parameters": ("Title", "Body"),
        "quick_reply_payloads": (),
    }


def test_quick_reply_payloads_are_enabled_only_for_v3_templates():
    assert reminder_engine.quick_reply_payloads_for(
        "microchallenge", "neurocient_microchallenge_checkin_v2"
    ) == ()
    assert reminder_engine.quick_reply_payloads_for(
        "microchallenge", "neurocient_microchallenge_checkin_v3"
    ) == ("micro_done_v1", "micro_partly_v1", "micro_not_today_v1")


@pytest.mark.parametrize(
    ("purpose", "setting_name", "template_name", "expected_parameters"),
    [
        ("nudge", "WHATSAPP_NUDGE_TEMPLATE_NAME", "neurocient_daily_nudge_v3", ("Title\n\nBody",)),
        ("spot_reminder", "WHATSAPP_SPOT_TEMPLATE_NAME", "neurocient_spot_checkin_v3", ()),
        (
            "microchallenge",
            "WHATSAPP_MICROCHALLENGE_TEMPLATE_NAME",
            "neurocient_microchallenge_checkin_v3",
            ("Title\n\nBody",),
        ),
    ],
)
def test_v3_delivery_matches_approved_template_components(
    monkeypatch,
    purpose,
    setting_name,
    template_name,
    expected_parameters,
):
    monkeypatch.setattr(reminder_engine.settings, setting_name, template_name)
    send_whatsapp = AsyncMock(return_value=True)
    monkeypatch.setattr(reminder_engine.asyncio, "to_thread", send_whatsapp)
    db = DeliverySession(
        preferences(
            whatsapp_enabled=True,
            whatsapp_verified=True,
            whatsapp_number="+919876543210",
        )
    )

    asyncio.run(
        reminder_engine._deliver_to_user(
            db,
            user_id="u1",
            purpose=purpose,
            title="Title",
            body="Body",
        )
    )

    assert send_whatsapp.await_args.kwargs == {
        "template_name": template_name,
        "language_code": "en_GB",
        "body_parameters": expected_parameters,
        "quick_reply_payloads": reminder_engine.QUICK_REPLY_PAYLOADS_BY_PURPOSE[
            purpose
        ],
    }


def test_spot_v4_delivery_opens_capture_window_without_quick_reply(monkeypatch):
    monkeypatch.setattr(
        reminder_engine.settings,
        "WHATSAPP_SPOT_TEMPLATE_NAME",
        "neurocient_spot_checkin_v4",
    )
    sent_at = datetime(2026, 11, 13, 12, 0, 0)
    monkeypatch.setattr(reminder_engine, "_utcnow", lambda: sent_at)
    send_whatsapp = AsyncMock(return_value="wamid.test")
    monkeypatch.setattr(reminder_engine.asyncio, "to_thread", send_whatsapp)
    prefs = preferences(
        whatsapp_enabled=True,
        whatsapp_verified=True,
        whatsapp_number="+919876543210",
    )
    db = DeliverySession(prefs)

    result = asyncio.run(
        reminder_engine._deliver_to_user(
            db,
            user_id="u1",
            purpose="spot_reminder",
            title="Spot check",
            body="Did you spot your Inner Caveman today?",
        )
    )

    assert result["whatsapp_success"] == 1
    assert send_whatsapp.await_args.kwargs["body_parameters"] == ()
    assert send_whatsapp.await_args.kwargs["quick_reply_payloads"] == ()
    assert prefs.whatsapp_pending_action == "spot_capture"
    assert prefs.whatsapp_pending_action_expires_at == (
        sent_at + reminder_engine.SPOT_CAPTURE_WINDOW
    )


def test_failed_spot_v4_delivery_does_not_open_capture_window(monkeypatch):
    monkeypatch.setattr(
        reminder_engine.settings,
        "WHATSAPP_SPOT_TEMPLATE_NAME",
        "neurocient_spot_checkin_v4",
    )
    monkeypatch.setattr(
        reminder_engine.asyncio,
        "to_thread",
        AsyncMock(return_value=False),
    )
    prefs = preferences(
        whatsapp_enabled=True,
        whatsapp_verified=True,
        whatsapp_number="+919876543210",
    )

    asyncio.run(
        reminder_engine._deliver_to_user(
            DeliverySession(prefs),
            user_id="u1",
            purpose="spot_reminder",
            title="Spot check",
            body="Did you spot your Inner Caveman today?",
        )
    )

    assert prefs.whatsapp_pending_action is None
    assert prefs.whatsapp_pending_action_expires_at is None


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


def test_whatsapp_provider_message_id_is_persisted(
    monkeypatch,
    durable_dispatch_claims,
):
    _, finish = durable_dispatch_claims
    provider_message_id = "SM" + "7" * 32
    monkeypatch.setattr(
        reminder_engine.asyncio,
        "to_thread",
        AsyncMock(return_value=provider_message_id),
    )
    db = DeliverySession(
        preferences(
            nudge_enabled=True,
            whatsapp_enabled=True,
            whatsapp_verified=True,
            whatsapp_number="+919876543210",
        )
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

    assert result["whatsapp_success"] == 1
    assert finish.await_args.kwargs == {
        "status": "accepted",
        "error_code": None,
        "provider_message_id": provider_message_id,
    }


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
            push_enabled=False,
            whatsapp_enabled=False,
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
            prefs.push_enabled = False
            prefs.whatsapp_enabled = False

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
