from app.config import settings
from scripts.create_whatsapp_templates import (
    template_components,
    template_definitions,
)


def test_all_proactive_reminder_templates_are_utility_and_request_specific():
    definitions = template_definitions()

    assert [definition.name for definition in definitions] == [
        settings.WHATSAPP_NUDGE_TEMPLATE_NAME,
        settings.WHATSAPP_SPOT_TEMPLATE_NAME,
        settings.WHATSAPP_MICROCHALLENGE_TEMPLATE_NAME,
    ]
    assert all("asked to receive" in definition.body for definition in definitions)
    assert all(definition.body.count("{{1}}") == 1 for definition in definitions)
    assert all(definition.body.count("{{2}}") == 1 for definition in definitions)


def test_v1_utility_templates_preserve_their_approved_footer(monkeypatch):
    monkeypatch.setattr(settings, "WHATSAPP_NUDGE_TEMPLATE_NAME", "neurocient_daily_nudge_v1")
    monkeypatch.setattr(settings, "WHATSAPP_SPOT_TEMPLATE_NAME", "neurocient_spot_checkin_v1")
    monkeypatch.setattr(
        settings,
        "WHATSAPP_MICROCHALLENGE_TEMPLATE_NAME",
        "neurocient_microchallenge_checkin_v1",
    )
    for definition in template_definitions():
        components = template_components(definition)
        rendered = " ".join(component.get("text", "") for component in components)
        assert "STOP" in rendered


def test_v2_utility_templates_do_not_repeat_the_pairing_opt_out_instruction(monkeypatch):
    monkeypatch.setattr(settings, "WHATSAPP_NUDGE_TEMPLATE_NAME", "neurocient_daily_nudge_v2")
    monkeypatch.setattr(settings, "WHATSAPP_SPOT_TEMPLATE_NAME", "neurocient_spot_checkin_v2")
    monkeypatch.setattr(
        settings,
        "WHATSAPP_MICROCHALLENGE_TEMPLATE_NAME",
        "neurocient_microchallenge_checkin_v2",
    )
    for definition in template_definitions():
        rendered = " ".join(
            component.get("text", "") for component in template_components(definition)
        )
        assert "STOP" not in rendered


def test_microchallenge_template_preserves_three_truthful_outcomes():
    microchallenge = template_definitions()[2]

    assert "1. Done" in microchallenge.body
    assert "2. Partly" in microchallenge.body
    assert "3. Didn't happen" in microchallenge.body
