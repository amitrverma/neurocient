import asyncio
from datetime import datetime, timedelta
from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.services import waitlist_offers
from app.services.waitlist_offers import (
    WAITLIST_OFFER_DURATION,
    build_waitlist_offer_email_payload,
    waitlist_offer_is_checkoutable,
    waitlist_offer_is_valid,
)


def entry(status="offered", expires_at=None, email_status="sent"):
    return SimpleNamespace(
        status=status,
        offer_expires_at=expires_at,
        offer_email_status=email_status,
    )


def test_only_an_unexpired_offered_or_started_entry_can_checkout():
    now = datetime(2026, 11, 5, 12, 0, 0)
    expiry = now + WAITLIST_OFFER_DURATION

    assert waitlist_offer_is_valid(entry("offered", expiry), now=now) is True
    assert waitlist_offer_is_valid(entry("checkout_started", expiry), now=now) is True
    assert waitlist_offer_is_valid(entry("waiting", expiry), now=now) is False
    assert waitlist_offer_is_valid(entry("offered", now), now=now) is False
    assert waitlist_offer_is_valid(entry("offered"), now=now) is False
    assert waitlist_offer_is_valid(entry("offered", expiry, "failed"), now=now) is False
    assert waitlist_offer_is_valid(None, now=now) is False


def test_checkout_also_requires_an_open_cohort_window():
    now = datetime(2026, 11, 5, 12, 0, 0)
    offered = entry("offered", now + WAITLIST_OFFER_DURATION)
    cohort = SimpleNamespace(
        status="full",
        timezone="Asia/Kolkata",
        enrollment_opens_at=datetime(2026, 11, 5, 17, 0, 0),
        enrollment_closes_at=datetime(2026, 11, 6, 17, 0, 0),
        starts_at=datetime(2026, 11, 20, 17, 0, 0),
    )

    assert waitlist_offer_is_checkoutable(offered, cohort, now=now) is True
    cohort.status = "closed"
    assert waitlist_offer_is_checkoutable(offered, cohort, now=now) is False
    cohort.status = "full"
    cohort.enrollment_closes_at = datetime(2026, 11, 5, 17, 30, 0)
    assert waitlist_offer_is_checkoutable(
        offered,
        cohort,
        now=datetime(2026, 11, 5, 12, 0, 0),
    ) is False


def test_offer_email_is_transactional_date_aware_and_account_bound():
    expires_at = datetime(2026, 11, 6, 12, 0, 0)
    payload = build_waitlist_offer_email_payload(
        recipient="member@example.test",
        user_name="Amit & Co",
        cohort_title="November <Cohort>",
        starts_at=datetime(2026, 11, 20, 18, 30, 0),
        timezone="Asia/Kolkata",
        offer_expires_at=expires_at,
        offer_url="https://neurocient.com/modern-caveman?waitlist_offer=entry-1",
    )

    assert payload["to"] == ["member@example.test"]
    assert "place is available" in payload["subject"].lower()
    assert "6 November 2026" in payload["text"]
    assert "same Neurocient account" in payload["text"]
    assert "waitlist_offer=entry-1" in payload["html"]
    assert "Amit &amp; Co" in payload["html"]
    assert "November &lt;Cohort&gt;" in payload["html"]


def test_dispatch_isolates_cohort_failures_and_reports_the_run_failed(monkeypatch):
    class CohortResult:
        def scalars(self):
            return self

        def all(self):
            return ["cohort-1", "cohort-2"]

    class FakeDb:
        rollback = AsyncMock()

        async def execute(self, _query):
            return CohortResult()

    dispatch = AsyncMock(side_effect=[RuntimeError("first failed"), {
        "offered": 1,
        "emailed": 1,
        "email_pending": 0,
    }])
    monkeypatch.setattr(waitlist_offers, "dispatch_waitlist_offers_for_cohort", dispatch)
    db = FakeDb()

    with pytest.raises(RuntimeError, match="1 cohort"):
        asyncio.run(waitlist_offers.dispatch_available_waitlist_offers(db))

    assert dispatch.await_count == 2
    db.rollback.assert_awaited_once()
