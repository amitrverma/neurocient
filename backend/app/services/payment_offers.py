"""Canonical server-owned offers exposed through Razorpay checkout."""

from dataclasses import dataclass

from app.config import settings


MEMBERSHIP_INR_OFFER_ID = "inr"
MEMBERSHIP_USD_OFFER_ID = "usd"
COHORT_INR_OFFER_ID = "inr"
COHORT_USD_OFFER_ID = "usd"


@dataclass(frozen=True)
class PaymentOffer:
    offer_id: str
    amount_minor: int
    currency: str
    display_price: str
    plan_id: str | None = None


def membership_offer(offer_id: str) -> PaymentOffer:
    if offer_id == MEMBERSHIP_INR_OFFER_ID:
        return PaymentOffer(
            offer_id=offer_id,
            amount_minor=49_900,
            currency="INR",
            display_price="₹499/month",
            plan_id=settings.RAZORPAY_MEMBERSHIP_PLAN_ID,
        )
    if offer_id == MEMBERSHIP_USD_OFFER_ID:
        return PaymentOffer(
            offer_id=offer_id,
            amount_minor=600,
            currency="USD",
            display_price="US$6/month",
            plan_id=settings.RAZORPAY_MEMBERSHIP_USD_PLAN_ID,
        )
    raise ValueError("Unsupported membership offer")


def membership_offers() -> tuple[PaymentOffer, PaymentOffer]:
    return (
        membership_offer(MEMBERSHIP_INR_OFFER_ID),
        membership_offer(MEMBERSHIP_USD_OFFER_ID),
    )


def membership_offer_for_plan(plan_id: str | None) -> PaymentOffer | None:
    if not plan_id:
        return None
    return next(
        (offer for offer in membership_offers() if offer.plan_id == plan_id),
        None,
    )


def cohort_offer(offer_id: str) -> PaymentOffer:
    if offer_id == COHORT_INR_OFFER_ID:
        return PaymentOffer(
            offer_id=offer_id,
            amount_minor=2_100_000,
            currency="INR",
            display_price="₹21,000",
        )
    if offer_id == COHORT_USD_OFFER_ID:
        return PaymentOffer(
            offer_id=offer_id,
            amount_minor=24_900,
            currency="USD",
            display_price="US$249",
        )
    raise ValueError("Unsupported cohort offer")


def cohort_offers() -> tuple[PaymentOffer, PaymentOffer]:
    return (
        cohort_offer(COHORT_INR_OFFER_ID),
        cohort_offer(COHORT_USD_OFFER_ID),
    )
