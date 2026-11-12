"""Create Neurocient's proactive WhatsApp templates if they do not exist.

Dry-run is the default. Pass --apply to mutate the configured Meta account.
The script prints template metadata only; it never prints provider credentials.
"""

from __future__ import annotations

import argparse
from dataclasses import dataclass
import json

import requests

from app.config import settings


@dataclass(frozen=True)
class TemplateDefinition:
    name: str
    body: str
    examples: tuple[str, ...]
    footer: str | None = None


def _footer_for(template_name: str) -> str | None:
    if template_name.endswith("_v1"):
        return "Reply STOP to pause WhatsApp reminders."
    return None


def template_definitions() -> tuple[TemplateDefinition, ...]:
    return (
        TemplateDefinition(
            name=settings.WHATSAPP_NUDGE_TEMPLATE_NAME,
            body=(
                "Here is the Neurocient daily nudge you asked to receive:\n\n"
                "{{1}}\n\n{{2}}\n\nKeep what is useful today; leave what is not."
            ),
            examples=(
                "Make the next action visible",
                "An unclear next action makes delay easier. Write down the next "
                "physical action before opening another tab.",
            ),
            footer=_footer_for(settings.WHATSAPP_NUDGE_TEMPLATE_NAME),
        ),
        TemplateDefinition(
            name=settings.WHATSAPP_SPOT_TEMPLATE_NAME,
            body=(
                "Here is the Neurocient Spot the Inner Caveman check-in you "
                "asked to receive:\n\n{{1}}\n\n{{2}}\n\nTo record something, "
                "reply spot: followed by what you noticed."
            ),
            examples=(
                "Spot check",
                "Did an automatic response show up today?",
            ),
            footer=_footer_for(settings.WHATSAPP_SPOT_TEMPLATE_NAME),
        ),
        TemplateDefinition(
            name=settings.WHATSAPP_MICROCHALLENGE_TEMPLATE_NAME,
            body=(
                "Here is the Neurocient experiment check-in you asked to "
                "receive:\n\n{{1}}\n\n{{2}}\n\nHow did it go? Reply:\n"
                "1. Done\n2. Partly\n3. Didn't happen"
            ),
            examples=(
                "Put the phone away",
                "Leave your phone outside the room for the first ten minutes.",
            ),
            footer=_footer_for(settings.WHATSAPP_MICROCHALLENGE_TEMPLATE_NAME),
        ),
    )


def template_components(definition: TemplateDefinition) -> list[dict]:
    components = [
        {
            "type": "BODY",
            "text": definition.body,
            "example": {"body_text": [list(definition.examples)]},
        }
    ]
    if definition.footer:
        components.append({"type": "FOOTER", "text": definition.footer})
    return components


def _ready() -> bool:
    return bool(
        settings.WHATSAPP_ACCESS_TOKEN
        and settings.WHATSAPP_BUSINESS_ACCOUNT_ID
        and settings.WHATSAPP_GRAPH_API_VERSION
    )


def _headers() -> dict[str, str]:
    return {"Authorization": f"Bearer {settings.WHATSAPP_ACCESS_TOKEN}"}


def _base_url() -> str:
    return (
        f"https://graph.facebook.com/{settings.WHATSAPP_GRAPH_API_VERSION}/"
        f"{settings.WHATSAPP_BUSINESS_ACCOUNT_ID}/message_templates"
    )


def _existing_templates() -> dict[tuple[str, str], dict]:
    response = requests.get(
        _base_url(),
        headers=_headers(),
        params={"fields": "id,name,status,category,language", "limit": 100},
        timeout=20,
    )
    response.raise_for_status()
    return {
        (item["name"], item["language"]): item
        for item in response.json().get("data", [])
    }


def _create(definition: TemplateDefinition) -> dict:
    response = requests.post(
        _base_url(),
        headers=_headers(),
        json={
            "name": definition.name,
            "language": settings.WHATSAPP_TEMPLATE_LANGUAGE,
            "category": "UTILITY",
            "components": template_components(definition),
        },
        timeout=20,
    )
    if not response.ok:
        try:
            error = response.json().get("error", {})
        except (json.JSONDecodeError, ValueError):
            error = {}
        raise RuntimeError(
            "Meta rejected template "
            f"{definition.name}: code={error.get('code')} "
            f"subcode={error.get('error_subcode')} "
            f"message={error.get('message', 'unavailable')}"
        )
    return response.json()


def main() -> int:
    parser = argparse.ArgumentParser()
    parser.add_argument(
        "--apply",
        action="store_true",
        help="Create missing templates in the configured Meta account.",
    )
    args = parser.parse_args()
    if not _ready():
        raise RuntimeError("Meta template-management configuration is incomplete")

    existing = _existing_templates()
    for definition in template_definitions():
        key = (definition.name, settings.WHATSAPP_TEMPLATE_LANGUAGE)
        current = existing.get(key)
        if current:
            print(
                f"existing name={definition.name} status={current.get('status')} "
                f"category={current.get('category')}"
            )
            continue
        if not args.apply:
            print(f"missing name={definition.name} action=dry-run")
            continue
        created = _create(definition)
        print(
            f"created name={definition.name} id={created.get('id')} "
            f"status={created.get('status')} category={created.get('category')}"
        )
    return 0


if __name__ == "__main__":
    raise SystemExit(main())
