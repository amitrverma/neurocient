"""Server-side PayPal Sandbox adapter for owned USD billing offers."""

import json
import logging
from decimal import Decimal, InvalidOperation
from urllib.parse import urlsplit

import httpx

from app.config import settings
from app.observability import correlation_headers, log_event


logger = logging.getLogger(__name__)


class ProviderRejected(RuntimeError):
    """PayPal certainly rejected the request."""


class ProviderOutcomeUnknown(RuntimeError):
    """A mutating PayPal request may have completed."""


class ProviderUnavailable(RuntimeError):
    """A non-mutating PayPal dependency call could not be completed."""


def _base_url() -> str:
    if settings.PAYPAL_ENV != "sandbox":
        raise ProviderRejected("PayPal live checkout is not approved")
    return "https://api-m.sandbox.paypal.com"


def _credentials_ready() -> bool:
    return bool(
        settings.PAYPAL_ENV == "sandbox"
        and settings.PAYPAL_CLIENT_ID
        and settings.PAYPAL_CLIENT_SECRET
    )


def paypal_membership_ready() -> bool:
    return bool(
        _credentials_ready()
        and settings.PAYPAL_MEMBERSHIP_WEBHOOK_ID
        and settings.PAYPAL_MEMBERSHIP_PLAN_ID
        and settings.PAYPAL_MEMBERSHIP_AMOUNT_MINOR == 600
        and settings.PAYPAL_MEMBERSHIP_CURRENCY == "USD"
        and settings.PAYPAL_RETURN_BASE_URL
    )


def paypal_cohort_ready() -> bool:
    return bool(
        _credentials_ready()
        and settings.PAYPAL_COHORT_WEBHOOK_ID
        and settings.PAYPAL_COHORT_AMOUNT_MINOR == 24_900
        and settings.PAYPAL_COHORT_CURRENCY == "USD"
    )


async def _access_token(client: httpx.AsyncClient) -> str:
    if not settings.PAYPAL_CLIENT_ID or not settings.PAYPAL_CLIENT_SECRET:
        raise ProviderRejected("PayPal checkout is not configured")
    try:
        response = await client.request(
            "POST",
            f"{_base_url()}/v1/oauth2/token",
            auth=(settings.PAYPAL_CLIENT_ID, settings.PAYPAL_CLIENT_SECRET),
            headers={**correlation_headers(), "Accept": "application/json"},
            data={"grant_type": "client_credentials"},
        )
    except httpx.RequestError as exc:
        raise ProviderOutcomeUnknown("PayPal authentication outcome is unknown") from exc
    if response.status_code >= 500:
        raise ProviderOutcomeUnknown("PayPal authentication outcome is unknown")
    if response.status_code >= 400:
        raise ProviderRejected("PayPal authentication was rejected")
    try:
        payload = response.json()
    except ValueError as exc:
        raise ProviderOutcomeUnknown("PayPal returned invalid authentication data") from exc
    token = payload.get("access_token") if isinstance(payload, dict) else None
    if not isinstance(token, str) or not token:
        raise ProviderOutcomeUnknown("PayPal returned invalid authentication data")
    return token


async def _request(
    method: str,
    path: str,
    *,
    json_body: dict | None = None,
    request_id: str | None = None,
    mutation: bool = False,
    allow_empty: bool = False,
) -> dict:
    try:
        async with httpx.AsyncClient(timeout=15) as client:
            token = await _access_token(client)
            headers = {
                **correlation_headers(),
                "Authorization": f"Bearer {token}",
                "Accept": "application/json",
            }
            if request_id:
                headers["PayPal-Request-Id"] = request_id
            response = await client.request(
                method,
                f"{_base_url()}/{path.lstrip('/')}",
                headers=headers,
                json=json_body,
            )
    except ProviderOutcomeUnknown:
        raise
    except httpx.RequestError as exc:
        error = ProviderOutcomeUnknown if mutation else ProviderUnavailable
        raise error("PayPal request could not be completed") from exc

    if response.status_code >= 500:
        error = ProviderOutcomeUnknown if mutation else ProviderUnavailable
        raise error("PayPal request could not be completed")
    if response.status_code >= 400:
        log_event(
            logger,
            "paypal_request_rejected",
            level=logging.WARNING,
            component="payments",
            operation=f"{method.lower()}_{path.split('?')[0]}",
            outcome="failure",
            provider="paypal",
            status_code=response.status_code,
            retryable=False,
        )
        raise ProviderRejected("PayPal rejected the request")
    if allow_empty and response.status_code == 204:
        return {}
    try:
        payload = response.json()
    except ValueError as exc:
        error = ProviderOutcomeUnknown if mutation else ProviderUnavailable
        raise error("PayPal returned invalid response data") from exc
    if not isinstance(payload, dict):
        error = ProviderOutcomeUnknown if mutation else ProviderUnavailable
        raise error("PayPal returned invalid response data")
    return payload


def _money_value(amount_minor: int) -> str:
    return f"{Decimal(amount_minor) / Decimal(100):.2f}"


def _approval_url(payload: dict) -> str | None:
    for link in payload.get("links", []):
        if isinstance(link, dict) and link.get("rel") == "approve":
            href = link.get("href")
            if isinstance(href, str) and urlsplit(href).scheme == "https":
                return href
    return None


def _matches_money(value: object, amount_minor: int) -> bool:
    try:
        return Decimal(str(value)) == Decimal(amount_minor) / Decimal(100)
    except (InvalidOperation, ValueError):
        return False


async def create_cohort_order(*, enrollment_id: str, request_id: str) -> dict:
    if not paypal_cohort_ready():
        raise ProviderRejected("PayPal cohort checkout is not configured")
    invoice_id = f"neurocient-{enrollment_id}"
    order = await _request(
        "POST",
        "/v2/checkout/orders",
        request_id=request_id,
        mutation=True,
        json_body={
            "intent": "CAPTURE",
            "purchase_units": [
                {
                    "custom_id": enrollment_id,
                    "invoice_id": invoice_id,
                    "description": "Modern Caveman cohort",
                    "amount": {
                        "currency_code": settings.PAYPAL_COHORT_CURRENCY,
                        "value": _money_value(settings.PAYPAL_COHORT_AMOUNT_MINOR),
                    },
                }
            ],
            "payment_source": {
                "paypal": {
                    "experience_context": {
                        "shipping_preference": "NO_SHIPPING",
                        "user_action": "PAY_NOW",
                        "return_url": f"{settings.PAYPAL_RETURN_BASE_URL}/modern-caveman?paypal=approved",
                        "cancel_url": f"{settings.PAYPAL_RETURN_BASE_URL}/modern-caveman?paypal=cancelled",
                    }
                }
            },
        },
    )
    order_id = order.get("id")
    approval_url = _approval_url(order)
    if not isinstance(order_id, str) or order.get("status") != "CREATED" or not approval_url:
        raise ProviderOutcomeUnknown("PayPal returned a contradictory order")
    try:
        verified_order = await _request("GET", f"/v2/checkout/orders/{order_id}")
    except (ProviderRejected, ProviderOutcomeUnknown, ProviderUnavailable) as exc:
        raise ProviderOutcomeUnknown("PayPal order verification is inconclusive") from exc
    units = verified_order.get("purchase_units")
    unit = units[0] if isinstance(units, list) and len(units) == 1 and isinstance(units[0], dict) else {}
    amount = unit.get("amount") if isinstance(unit.get("amount"), dict) else {}
    if (
        verified_order.get("id") != order_id
        or verified_order.get("status") != "CREATED"
        or unit.get("custom_id") != enrollment_id
        or unit.get("invoice_id") != invoice_id
        or amount.get("currency_code") != settings.PAYPAL_COHORT_CURRENCY
        or not _matches_money(amount.get("value"), settings.PAYPAL_COHORT_AMOUNT_MINOR)
    ):
        raise ProviderOutcomeUnknown("PayPal returned a contradictory order")
    verified_order["approval_url"] = approval_url
    return verified_order


async def capture_cohort_order(*, order_id: str, request_id: str) -> dict:
    if not order_id or len(order_id) > 255:
        raise ProviderRejected("PayPal order is invalid")
    return await _request(
        "POST",
        f"/v2/checkout/orders/{order_id}/capture",
        request_id=request_id,
        mutation=True,
        json_body={},
    )


async def create_membership_subscription(*, user_id: str, request_id: str) -> dict:
    if not paypal_membership_ready():
        raise ProviderRejected("PayPal membership checkout is not configured")
    subscription = await _request(
        "POST",
        "/v1/billing/subscriptions",
        request_id=request_id,
        mutation=True,
        json_body={
            "plan_id": settings.PAYPAL_MEMBERSHIP_PLAN_ID,
            "custom_id": user_id,
            "application_context": {
                "brand_name": "Neurocient",
                "locale": "en-US",
                "shipping_preference": "NO_SHIPPING",
                "user_action": "SUBSCRIBE_NOW",
                "return_url": f"{settings.PAYPAL_RETURN_BASE_URL}/membership?paypal=approved",
                "cancel_url": f"{settings.PAYPAL_RETURN_BASE_URL}/membership?paypal=cancelled",
            },
        },
    )
    subscription_id = subscription.get("id")
    approval_url = _approval_url(subscription)
    if (
        not isinstance(subscription_id, str)
        or subscription.get("status") != "APPROVAL_PENDING"
        or not approval_url
    ):
        raise ProviderOutcomeUnknown("PayPal returned a contradictory subscription")
    try:
        verified_subscription = await _request(
            "GET", f"/v1/billing/subscriptions/{subscription_id}"
        )
    except (ProviderRejected, ProviderOutcomeUnknown, ProviderUnavailable) as exc:
        raise ProviderOutcomeUnknown(
            "PayPal subscription verification is inconclusive"
        ) from exc
    if (
        verified_subscription.get("id") != subscription_id
        or verified_subscription.get("plan_id") != settings.PAYPAL_MEMBERSHIP_PLAN_ID
        or verified_subscription.get("custom_id") != user_id
        or verified_subscription.get("status") != "APPROVAL_PENDING"
    ):
        raise ProviderOutcomeUnknown("PayPal returned a contradictory subscription")
    verified_subscription["approval_url"] = approval_url
    return verified_subscription


async def fetch_membership_plan() -> dict:
    if not settings.PAYPAL_MEMBERSHIP_PLAN_ID:
        raise ProviderRejected("PayPal membership plan is not configured")
    return await _request("GET", f"/v1/billing/plans/{settings.PAYPAL_MEMBERSHIP_PLAN_ID}")


async def fetch_membership_subscription(subscription_id: str) -> dict:
    if not subscription_id or len(subscription_id) > 255:
        raise ProviderRejected("PayPal subscription is invalid")
    return await _request("GET", f"/v1/billing/subscriptions/{subscription_id}")


async def cancel_membership_subscription(subscription_id: str) -> dict:
    if not subscription_id or len(subscription_id) > 255:
        raise ProviderRejected("PayPal subscription is invalid")
    await _request(
        "POST",
        f"/v1/billing/subscriptions/{subscription_id}/cancel",
        request_id=f"cancel-{subscription_id}",
        mutation=True,
        allow_empty=True,
        json_body={"reason": "Customer requested cancellation"},
    )
    return {"id": subscription_id, "status": "CANCELLATION_REQUESTED"}


async def verify_webhook(
    body: bytes,
    headers: dict[str, str],
    *,
    webhook_id: str | None,
) -> bool:
    if not _credentials_ready() or not webhook_id:
        return False
    required = {
        "auth_algo": headers.get("paypal-auth-algo"),
        "cert_url": headers.get("paypal-cert-url"),
        "transmission_id": headers.get("paypal-transmission-id"),
        "transmission_sig": headers.get("paypal-transmission-sig"),
        "transmission_time": headers.get("paypal-transmission-time"),
    }
    if any(not isinstance(value, str) or not value for value in required.values()):
        return False
    try:
        event = json.loads(body)
    except (json.JSONDecodeError, UnicodeDecodeError):
        return False
    if not isinstance(event, dict):
        return False
    verification = await _request(
        "POST",
        "/v1/notifications/verify-webhook-signature",
        json_body={
            **required,
            "webhook_id": webhook_id,
            "webhook_event": event,
        },
    )
    return verification.get("verification_status") == "SUCCESS"
