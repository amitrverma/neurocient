from app.config import settings
from scripts.create_whatsapp_templates import template_definitions


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


def test_microchallenge_template_preserves_three_truthful_outcomes():
    microchallenge = template_definitions()[2]

    assert "1. Done" in microchallenge.body
    assert "2. Partly" in microchallenge.body
    assert "3. Didn't happen" in microchallenge.body
