from datetime import UTC, datetime, timedelta
from types import SimpleNamespace

import pytest

from app.services.cohorts import (
    captured_payment_has_seat,
    enrollment_is_open,
    validate_cohort_timezone,
    validate_cohort_values,
    validate_modern_caveman_price,
)


def cohort(**overrides):
    values = {
        "status": "open",
        "capacity": 10,
        "timezone": "Asia/Kolkata",
        "enrollment_opens_at": None,
        "enrollment_closes_at": None,
    }
    values.update(overrides)
    return SimpleNamespace(**values)


def test_cohort_validation_rejects_invalid_dates_capacity_and_price():
    now = datetime(2026, 10, 15, 12)
    with pytest.raises(ValueError, match="end"):
        validate_cohort_values(starts_at=now, ends_at=now, capacity=10, price_minor=100)
    with pytest.raises(ValueError, match="Capacity"):
        validate_cohort_values(starts_at=now, ends_at=now + timedelta(days=1), capacity=0, price_minor=100)
    with pytest.raises(ValueError, match="Price"):
        validate_cohort_values(starts_at=now, ends_at=now + timedelta(days=1), capacity=10, price_minor=0)


def test_modern_caveman_price_is_canonical_in_inr():
    validate_modern_caveman_price(price_minor=2_100_000, currency="INR")

    with pytest.raises(ValueError, match="2,100,000"):
        validate_modern_caveman_price(price_minor=2_099_900, currency="INR")
    with pytest.raises(ValueError, match="INR"):
        validate_modern_caveman_price(price_minor=2_100_000, currency="USD")


def test_cohort_timezone_must_be_an_iana_timezone():
    validate_cohort_timezone("Asia/Kolkata")
    with pytest.raises(ValueError, match="IANA timezone"):
        validate_cohort_timezone("Not/A-Timezone")


def test_hard_capacity_closes_enrollment():
    now = datetime(2026, 10, 15, 12)
    assert enrollment_is_open(cohort(capacity=2), 1, now) is True
    assert enrollment_is_open(cohort(capacity=2), 2, now) is False


def test_enrollment_window_and_status_are_enforced():
    now = datetime(2026, 10, 15, 12)
    assert enrollment_is_open(cohort(status="draft"), 0, now) is False
    assert enrollment_is_open(cohort(status="published"), 0, now) is False
    assert enrollment_is_open(cohort(status="full"), 0, now) is False
    assert enrollment_is_open(cohort(enrollment_opens_at=now + timedelta(minutes=1)), 0, now) is False
    assert enrollment_is_open(cohort(enrollment_closes_at=now), 0, now) is False


def test_enrollment_window_uses_the_cohort_wall_clock():
    now_utc = datetime(2026, 11, 1, 6, 50, tzinfo=UTC)
    opening_time_in_kolkata = datetime(2026, 11, 1, 12, 17)
    closing_time_in_kolkata = datetime(2026, 11, 1, 13, 0)

    assert enrollment_is_open(
        cohort(
            enrollment_opens_at=opening_time_in_kolkata,
            enrollment_closes_at=closing_time_in_kolkata,
        ),
        0,
        now_utc,
    ) is True


def test_invalid_cohort_timezone_fails_closed():
    assert enrollment_is_open(cohort(timezone="Not/A-Timezone"), 0) is False


def test_late_payment_never_overbooks_hard_capacity():
    now = datetime(2026, 10, 15, 12)
    assert captured_payment_has_seat(
        reservation_expires_at=now + timedelta(seconds=1), occupied_other_seats=10, capacity=10, now=now
    ) is True
    assert captured_payment_has_seat(
        reservation_expires_at=now - timedelta(seconds=1), occupied_other_seats=10, capacity=10, now=now
    ) is False
    assert captured_payment_has_seat(
        reservation_expires_at=now - timedelta(seconds=1), occupied_other_seats=9, capacity=10, now=now
    ) is True
