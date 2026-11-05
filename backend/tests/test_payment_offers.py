import pytest

from app.config import settings
from app.services.payment_offers import (
    COHORT_INR_OFFER_ID,
    COHORT_USD_OFFER_ID,
    MEMBERSHIP_INR_OFFER_ID,
    MEMBERSHIP_USD_OFFER_ID,
    cohort_offer,
    membership_offer,
    membership_offer_for_plan,
)


def test_membership_offers_are_server_owned_and_currency_specific(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_MEMBERSHIP_PLAN_ID", "plan_inr")
    monkeypatch.setattr(settings, "RAZORPAY_MEMBERSHIP_USD_PLAN_ID", "plan_usd")

    inr = membership_offer(MEMBERSHIP_INR_OFFER_ID)
    usd = membership_offer(MEMBERSHIP_USD_OFFER_ID)

    assert (inr.amount_minor, inr.currency, inr.plan_id) == (49_900, "INR", "plan_inr")
    assert (usd.amount_minor, usd.currency, usd.plan_id) == (600, "USD", "plan_usd")
    assert membership_offer_for_plan("plan_usd") == usd


def test_unknown_or_unconfigured_membership_offer_fails_closed(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_MEMBERSHIP_USD_PLAN_ID", None)

    assert membership_offer_for_plan("plan_missing") is None
    assert membership_offer(MEMBERSHIP_USD_OFFER_ID).plan_id is None
    with pytest.raises(ValueError, match="Unsupported membership offer"):
        membership_offer("eur")


def test_cohort_offers_have_fixed_owned_prices():
    inr = cohort_offer(COHORT_INR_OFFER_ID)
    usd = cohort_offer(COHORT_USD_OFFER_ID)

    assert (inr.amount_minor, inr.currency) == (2_100_000, "INR")
    assert (usd.amount_minor, usd.currency) == (24_900, "USD")
    with pytest.raises(ValueError, match="Unsupported cohort offer"):
        cohort_offer("eur")
