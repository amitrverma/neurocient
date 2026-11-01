import hashlib
import hmac

import httpx

from app.config import settings
from app.observability import correlation_headers


class ProviderRejected(RuntimeError):
    """The provider certainly rejected the request; retry can create a new order."""


class ProviderOutcomeUnknown(RuntimeError):
    """The provider may have created an order; automatic retry is unsafe."""


def razorpay_ready() -> bool:
    return bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET and settings.RAZORPAY_WEBHOOK_SECRET)


async def create_order(*, amount_minor: int, currency: str, receipt: str, notes: dict) -> dict:
    if not isinstance(amount_minor, int) or isinstance(amount_minor, bool) or amount_minor < 100:
        raise ProviderRejected("Razorpay orders require at least 100 minor units")
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise ProviderRejected("Razorpay checkout is not configured")
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.post(
                "https://api.razorpay.com/v1/orders",
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET),
                headers=correlation_headers(),
                json={
                    "amount": amount_minor,
                    "currency": currency,
                    "receipt": receipt,
                    "notes": notes,
                },
            )
    except httpx.RequestError as exc:
        raise ProviderOutcomeUnknown("Razorpay order outcome is unknown") from exc
    if response.status_code >= 500:
        raise ProviderOutcomeUnknown("Razorpay order outcome is unknown")
    if response.status_code >= 400:
        raise ProviderRejected("Razorpay rejected the order")
    try:
        order = response.json()
    except ValueError as exc:
        raise ProviderOutcomeUnknown("Razorpay returned an invalid order") from exc
    if (
        not order.get("id")
        or order.get("amount") != amount_minor
        or str(order.get("currency", "")).upper() != currency.upper()
        or order.get("receipt") != receipt
        or order.get("status") != "created"
    ):
        raise ProviderOutcomeUnknown("Razorpay returned a contradictory order")
    return order


def verify_webhook_signature(body: bytes, signature: str | None) -> bool:
    if not settings.RAZORPAY_WEBHOOK_SECRET or not signature:
        return False
    expected = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode("utf-8"), body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


def verify_checkout_signature(
    order_id: str,
    payment_id: str,
    signature: str | None,
) -> bool:
    """Verify Checkout's browser callback without treating it as capture proof."""
    if not settings.RAZORPAY_KEY_SECRET or not signature:
        return False
    expected = hmac.new(
        settings.RAZORPAY_KEY_SECRET.encode("utf-8"),
        f"{order_id}|{payment_id}".encode("utf-8"),
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
