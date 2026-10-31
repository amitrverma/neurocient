import logging

from posthog import Posthog
from app.config import settings


logger = logging.getLogger(__name__)

API_KEY = settings.POSTHOG_API_KEY
HOST = settings.POSTHOG_HOST or "https://app.posthog.com"

# Internal flag to avoid errors in local/dev
_enabled = bool(API_KEY)
_client: Posthog | None = None

if _enabled:
    _client = Posthog(project_api_key=API_KEY, host=HOST)


def track_event(user_id: str | None, event: str, properties: dict | None = None):
    """
    Capture an event in PostHog.

    Args:
        user_id: Optional UUID/string (must match frontend identify()).
        event: Event name.
        properties: Extra metadata.
    """
    if not _client:
        # Local dev: don't crash, just log
        print(f"[DEV] Event skipped: {event}, props={properties}")
        return

    try:
        _client.capture(
            distinct_id=user_id or "anonymous",
            event=event,
            properties=properties or {},
        )
    except Exception:
        logger.exception("PostHog event capture failed")


def identify_user(user_id: str, traits: dict | None = None):
    """
    Identify or update user profile in PostHog.
    """
    if not _client:
        print(f"[DEV] Identify skipped: {user_id}, traits={traits}")
        return

    try:
        _client.capture(
            distinct_id=user_id,
            event="user_identified",
            properties={"$set": traits or {}},
        )
    except Exception:
        logger.exception("PostHog person update failed")
