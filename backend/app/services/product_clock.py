from datetime import UTC, date, datetime
from zoneinfo import ZoneInfo


PRODUCT_TIMEZONE = ZoneInfo("Asia/Kolkata")


def product_today() -> date:
    return datetime.now(PRODUCT_TIMEZONE).date()


def utcnow_naive() -> datetime:
    """Return UTC in the repository's existing naive database representation."""
    return datetime.now(UTC).replace(tzinfo=None)
