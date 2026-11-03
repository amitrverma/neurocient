"""Razorpay adapter dedicated to recurring membership billing."""

import hashlib
import hmac
import logging

import httpx

from app.config import settings
from app.observability import correlation_headers


logger = logging.getLogger(__name__)


class ProviderRejected(RuntimeError):
    """The provider certainly rejected the request; a new attempt is safe."""


class ProviderOutcomeUnknown(RuntimeError):
    """The request may have succeeded; automatic retry could double-create."""


class ProviderNotFound(ProviderRejected):
    """The provider authoritatively reports that the subscription is absent."""


def membership_razorpay_ready() -> bool:
    return bool(
        settings.RAZORPAY_KEY_ID
        and settings.RAZORPAY_KEY_SECRET
        and settings.RAZORPAY_MEMBERSHIP_PLAN_ID
        and settings.RAZORPAY_MEMBERSHIP_AMOUNT_MINOR == 49_900
        and settings.RAZORPAY_MEMBERSHIP_CURRENCY == "INR"
        and settings.RAZORPAY_MEMBERSHIP_TOTAL_COUNT
        and settings.RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET
        and settings.RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET
        != settings.RAZORPAY_WEBHOOK_SECRET
    )


def verify_membership_webhook(body: bytes, signature: str | None) -> bool:
    if not settings.RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET or not signature:
        return False
    expected = hmac.new(
        settings.RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET.encode("utf-8"),
        body,
        hashlib.sha256,
    ).hexdigest()
    return hmac.compare_digest(expected, signature)


async def _request(method: str, path: str, **kwargs) -> dict:
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise ProviderRejected("Membership checkout is not configured")
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            response = await client.request(
                method,
                f"https://api.razorpay.com/v1/{path.lstrip('/')}",
                auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET),
                headers=correlation_headers(),
                **kwargs,
            )
    except httpx.RequestError as exc:
        raise ProviderOutcomeUnknown("Razorpay outcome is unknown") from exc
    if response.status_code >= 400:
        provider_code = None
        try:
            payload = response.json()
            if isinstance(payload, dict) and isinstance(payload.get("error"), dict):
                provider_code = payload["error"].get("code")
        except ValueError:
            pass
        logger.warning(
            "membership_razorpay_request_rejected",
            extra={
                "method": method,
                "status_code": response.status_code,
                "provider_code": provider_code,
            },
        )
    if response.status_code >= 500:
        raise ProviderOutcomeUnknown("Razorpay outcome is unknown")
    if response.status_code == 404:
        raise ProviderNotFound("Razorpay subscription was not found")
    if response.status_code >= 400:
        raise ProviderRejected("Razorpay rejected the membership request")
    try:
        return response.json()
    except ValueError as exc:
        raise ProviderOutcomeUnknown("Razorpay returned an invalid response") from exc


async def fetch_membership_plan() -> dict:
    if not settings.RAZORPAY_MEMBERSHIP_PLAN_ID:
        raise ProviderRejected("Membership plan is not configured")
    return await _request("GET", f"plans/{settings.RAZORPAY_MEMBERSHIP_PLAN_ID}")


async def fetch_membership_subscription(subscription_id: str) -> dict:
    if not subscription_id or len(subscription_id) > 255:
        raise ProviderRejected("Membership subscription is invalid")
    return await _request("GET", f"subscriptions/{subscription_id}")


async def cancel_membership_subscription_at_period_end(
    subscription_id: str,
) -> dict:
    if not subscription_id or len(subscription_id) > 255:
        raise ProviderRejected("Membership subscription is invalid")
    return await _request(
        "POST",
        f"subscriptions/{subscription_id}/cancel",
        json={"cancel_at_cycle_end": True},
    )


async def create_membership_subscription(*, user_id: str, operation_id: str) -> dict:
    if not settings.RAZORPAY_MEMBERSHIP_PLAN_ID or not settings.RAZORPAY_MEMBERSHIP_TOTAL_COUNT:
        raise ProviderRejected("Membership plan is not configured")
    return await _request(
        "POST",
        "subscriptions",
        json={
            "plan_id": settings.RAZORPAY_MEMBERSHIP_PLAN_ID,
            "total_count": settings.RAZORPAY_MEMBERSHIP_TOTAL_COUNT,
            "quantity": 1,
            "customer_notify": 1,
            "notes": {
                "purpose": "neurocient_membership",
                "user_id": user_id,
                "operation_id": operation_id,
            },
        },
    )
