import hashlib
import hmac
import logging

import httpx

from app.config import settings
from app.observability import correlation_headers, log_event


logger = logging.getLogger(__name__)


class ProviderRejected(RuntimeError):
    """The provider certainly rejected the request; retry can create a new order."""

    def __init__(self, message: str, *, reason_code: str = "provider_rejected_request"):
        super().__init__(message)
        self.reason_code = reason_code


class ProviderOutcomeUnknown(RuntimeError):
    """The provider may have created an order; automatic retry is unsafe."""


def razorpay_ready() -> bool:
    return bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET and settings.RAZORPAY_WEBHOOK_SECRET)


async def create_order(*, amount_minor: int, currency: str, receipt: str, notes: dict) -> dict:
    if not isinstance(amount_minor, int) or isinstance(amount_minor, bool) or amount_minor < 100:
        raise ProviderRejected(
            "Razorpay orders require at least 100 minor units",
            reason_code="invalid_order_request",
        )
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        log_event(
            logger,
            "razorpay_order_rejected",
            level=logging.ERROR,
            component="payments",
            operation="create_order",
            outcome="failure",
            provider="razorpay",
            reason_code="provider_configuration_missing",
            retryable=False,
        )
        raise ProviderRejected(
            "Razorpay checkout is not configured",
            reason_code="provider_configuration_missing",
        )
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
        log_event(
            logger,
            "razorpay_order_outcome_unknown",
            level=logging.ERROR,
            component="payments",
            operation="create_order",
            outcome="unknown",
            provider="razorpay",
            reason_code="provider_transport_error",
            retryable=False,
        )
        raise ProviderOutcomeUnknown("Razorpay order outcome is unknown") from exc
    if response.status_code >= 500:
        log_event(
            logger,
            "razorpay_order_outcome_unknown",
            level=logging.ERROR,
            component="payments",
            operation="create_order",
            outcome="unknown",
            provider="razorpay",
            reason_code="provider_server_error",
            retryable=False,
            status_code=response.status_code,
        )
        raise ProviderOutcomeUnknown("Razorpay order outcome is unknown")
    if response.status_code >= 400:
        reason_code = (
            "provider_authentication_failed"
            if response.status_code in (401, 403)
            else "provider_rejected_request"
        )
        log_event(
            logger,
            "razorpay_order_rejected",
            level=logging.ERROR,
            component="payments",
            operation="create_order",
            outcome="failure",
            provider="razorpay",
            reason_code=reason_code,
            retryable=False,
            status_code=response.status_code,
        )
        raise ProviderRejected("Razorpay rejected the order", reason_code=reason_code)
    try:
        order = response.json()
    except ValueError as exc:
        log_event(
            logger,
            "razorpay_order_outcome_unknown",
            level=logging.ERROR,
            component="payments",
            operation="create_order",
            outcome="unknown",
            provider="razorpay",
            reason_code="provider_invalid_response",
            retryable=False,
            status_code=response.status_code,
        )
        raise ProviderOutcomeUnknown("Razorpay returned an invalid order") from exc
    if (
        not order.get("id")
        or order.get("amount") != amount_minor
        or str(order.get("currency", "")).upper() != currency.upper()
        or order.get("receipt") != receipt
        or order.get("status") != "created"
    ):
        log_event(
            logger,
            "razorpay_order_outcome_unknown",
            level=logging.ERROR,
            component="payments",
            operation="create_order",
            outcome="unknown",
            provider="razorpay",
            reason_code="provider_contradictory_response",
            retryable=False,
            status_code=response.status_code,
        )
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
