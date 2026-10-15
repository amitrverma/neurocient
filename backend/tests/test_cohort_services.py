from datetime import datetime, timedelta
from types import SimpleNamespace

import pytest

from app.services.cohorts import captured_payment_has_seat, enrollment_is_open, validate_cohort_values


def cohort(**overrides):
    values = {
        "status": "open",
        "capacity": 10,
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
