from datetime import date, datetime
from types import SimpleNamespace

import pytest
from pydantic import ValidationError

from app.Routes import admin_nudge_routes
from app.services.admin import require_admin


def valid_input(**overrides):
    values = {
        "title": "Notice the first response",
        "paragraphs": ["Watch what happens before the deliberate response."],
        "quote": "Notice first. Decide second.",
        "link": "https://neurocient.com/insights/evolutionary-lag",
        "is_active": True,
    }
    values.update(overrides)
    return admin_nudge_routes.NudgeInput(**values)


def test_every_admin_nudge_route_requires_admin():
    for route in admin_nudge_routes.router.routes:
        dependency_calls = {dependency.call for dependency in route.dependant.dependencies}
        assert require_admin in dependency_calls, route.path


def test_nudge_input_normalizes_content_and_rejects_empty_message():
    payload = valid_input(
        title="  Notice the first response  ",
        paragraphs=["  First paragraph.  ", "", " Second paragraph. "],
        quote="  A short quote.  ",
        link="  https://neurocient.com/insights/evolutionary-lag  ",
    )
    assert payload.title == "Notice the first response"
    assert payload.paragraphs == ["First paragraph.", "Second paragraph."]
    assert payload.quote == "A short quote."
    assert str(payload.link) == "https://neurocient.com/insights/evolutionary-lag"

    with pytest.raises(ValidationError):
        valid_input(paragraphs=["  "], quote=None)


def test_status_only_update_does_not_change_selected_content():
    existing = SimpleNamespace(
        title="Title",
        paragraphs=["Body"],
        quote="Quote",
        link="https://neurocient.com/one",
        is_active=True,
    )
    status_only = valid_input(
        title="Title",
        paragraphs=["Body"],
        quote="Quote",
        link="https://neurocient.com/one",
        is_active=False,
    )
    edited = status_only.model_copy(update={"paragraphs": ["Changed body"]})

    assert admin_nudge_routes.nudge_content_changed(existing, status_only) is False
    assert admin_nudge_routes.nudge_content_changed(existing, edited) is True


def test_nudge_payload_exposes_exact_previews_and_selection_state():
    nudge = SimpleNamespace(
        id="nudge-1",
        title="A useful title",
        paragraphs=["First paragraph.", "Second paragraph."],
        quote="Useful quote.",
        link=None,
        is_active=True,
        created_at=datetime(2026, 11, 1, 9, 0),
    )
    payload = admin_nudge_routes.nudge_payload(
        nudge,
        last_selected_on=date(2026, 11, 13),
        selected_today=True,
    )

    assert payload["selected_today"] is True
    assert payload["last_selected_on"] == "2026-11-13"
    assert payload["web_preview"]["paragraphs"] == [
        "First paragraph.",
        "Second paragraph.",
    ]
    assert payload["whatsapp_preview"] == (
        "A useful title\n\nFirst paragraph.\n\nSecond paragraph.\n\nUseful quote."
    )
