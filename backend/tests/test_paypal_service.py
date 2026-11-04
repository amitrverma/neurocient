import json

import httpx
import pytest

from app.config import settings
from app.services.paypal import (
    ProviderOutcomeUnknown,
    ProviderRejected,
    create_cohort_order,
    create_membership_subscription,
    paypal_cohort_ready,
    paypal_membership_ready,
    verify_webhook,
)
from app.services.membership_billing import PlanMismatch, validate_paypal_membership_plan


class FakeClient:
    def __init__(self, responses=None, error=None):
        self.responses = list(responses or [])
        self.error = error
        self.calls = []

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_args):
        return False

    async def request(self, method, url, **kwargs):
        self.calls.append((method, url, kwargs))
        if self.error:
            raise self.error
        return self.responses.pop(0)


def _configure(monkeypatch):
    monkeypatch.setattr(settings, "PAYPAL_ENV", "sandbox")
    monkeypatch.setattr(settings, "PAYPAL_CLIENT_ID", "client")
    monkeypatch.setattr(settings, "PAYPAL_CLIENT_SECRET", "secret")
    monkeypatch.setattr(settings, "PAYPAL_MEMBERSHIP_WEBHOOK_ID", "WH-MEMBERSHIP")
    monkeypatch.setattr(settings, "PAYPAL_COHORT_WEBHOOK_ID", "WH-COHORT")
    monkeypatch.setattr(settings, "PAYPAL_RETURN_BASE_URL", "http://localhost:3000")
    monkeypatch.setattr(settings, "PAYPAL_MEMBERSHIP_PLAN_ID", "P-PLAN")
    monkeypatch.setattr(settings, "PAYPAL_MEMBERSHIP_AMOUNT_MINOR", 600)
    monkeypatch.setattr(settings, "PAYPAL_MEMBERSHIP_CURRENCY", "USD")
    monkeypatch.setattr(settings, "PAYPAL_COHORT_AMOUNT_MINOR", 24_900)
    monkeypatch.setattr(settings, "PAYPAL_COHORT_CURRENCY", "USD")


def _token_response():
    return httpx.Response(200, json={"access_token": "access", "token_type": "Bearer"})


def test_paypal_readiness_is_product_specific(monkeypatch):
    _configure(monkeypatch)
    assert paypal_membership_ready() is True
    assert paypal_cohort_ready() is True

    monkeypatch.setattr(settings, "PAYPAL_MEMBERSHIP_PLAN_ID", None)
    assert paypal_membership_ready() is False
    assert paypal_cohort_ready() is True

    monkeypatch.setattr(settings, "PAYPAL_COHORT_WEBHOOK_ID", None)
    assert paypal_cohort_ready() is False


def test_paypal_plan_fingerprint_requires_active_usd_monthly_offer():
    plan = {
        "id": "P-PLAN",
        "status": "ACTIVE",
        "billing_cycles": [{
            "tenure_type": "REGULAR",
            "frequency": {"interval_unit": "MONTH", "interval_count": 1},
            "pricing_scheme": {"fixed_price": {"value": "6.00", "currency_code": "USD"}},
        }],
    }
    fingerprint = validate_paypal_membership_plan(
        plan, plan_id="P-PLAN", amount_minor=600, currency="USD"
    )
    assert fingerprint.amount_minor == 600

    plan["billing_cycles"][0]["pricing_scheme"]["fixed_price"]["value"] = "7.00"
    with pytest.raises(PlanMismatch):
        validate_paypal_membership_plan(
            plan, plan_id="P-PLAN", amount_minor=600, currency="USD"
        )


@pytest.mark.asyncio
async def test_create_cohort_order_uses_owned_price_and_stable_idempotency(monkeypatch):
    _configure(monkeypatch)
    client = FakeClient(
        responses=[
            _token_response(),
            httpx.Response(
                201,
                json={
                    "id": "ORDER-1",
                    "status": "CREATED",
                    "links": [{"rel": "approve", "href": "https://sandbox.paypal.test/approve"}],
                },
            ),
            _token_response(),
            httpx.Response(
                200,
                json={
                    "id": "ORDER-1",
                    "status": "CREATED",
                    "purchase_units": [{
                        "custom_id": "enrollment-1",
                        "invoice_id": "neurocient-enrollment-1",
                        "amount": {"currency_code": "USD", "value": "249.00"},
                    }],
                },
            ),
        ]
    )
    monkeypatch.setattr("app.services.paypal.httpx.AsyncClient", lambda **_kwargs: client)

    order = await create_cohort_order(
        enrollment_id="enrollment-1",
        request_id="operation-1",
    )

    assert order["id"] == "ORDER-1"
    method, url, kwargs = client.calls[1]
    assert (method, url) == (
        "POST",
        "https://api-m.sandbox.paypal.com/v2/checkout/orders",
    )
    assert kwargs["headers"]["PayPal-Request-Id"] == "operation-1"
    unit = kwargs["json"]["purchase_units"][0]
    assert unit["amount"] == {"currency_code": "USD", "value": "249.00"}
    assert unit["custom_id"] == "enrollment-1"


@pytest.mark.asyncio
async def test_create_membership_subscription_is_server_created_and_owned(monkeypatch):
    _configure(monkeypatch)
    client = FakeClient(
        responses=[
            _token_response(),
            httpx.Response(
                201,
                json={
                    "id": "I-SUB-1",
                    "status": "APPROVAL_PENDING",
                    "links": [{"rel": "approve", "href": "https://sandbox.paypal.test/sub"}],
                },
            ),
            _token_response(),
            httpx.Response(
                200,
                json={
                    "id": "I-SUB-1",
                    "plan_id": "P-PLAN",
                    "custom_id": "user-1",
                    "status": "APPROVAL_PENDING",
                },
            ),
        ]
    )
    monkeypatch.setattr("app.services.paypal.httpx.AsyncClient", lambda **_kwargs: client)

    subscription = await create_membership_subscription(
        user_id="user-1",
        request_id="operation-1",
    )

    assert subscription["id"] == "I-SUB-1"
    payload = client.calls[1][2]["json"]
    assert payload["plan_id"] == "P-PLAN"
    assert payload["custom_id"] == "user-1"
    assert payload["application_context"]["shipping_preference"] == "NO_SHIPPING"
    assert client.calls[1][2]["headers"]["PayPal-Request-Id"] == "operation-1"


@pytest.mark.asyncio
async def test_mutating_transport_failure_is_unknown_not_safe_rejection(monkeypatch):
    _configure(monkeypatch)
    request = httpx.Request("POST", "https://api-m.sandbox.paypal.com/v1/oauth2/token")
    client = FakeClient(error=httpx.ConnectError("lost", request=request))
    monkeypatch.setattr("app.services.paypal.httpx.AsyncClient", lambda **_kwargs: client)

    with pytest.raises(ProviderOutcomeUnknown):
        await create_cohort_order(enrollment_id="enrollment-1", request_id="operation-1")


@pytest.mark.asyncio
async def test_contradictory_success_fails_closed(monkeypatch):
    _configure(monkeypatch)
    client = FakeClient(
        responses=[
            _token_response(),
            httpx.Response(
                201,
                json={
                    "id": "ORDER-1",
                    "status": "CREATED",
                    "links": [{"rel": "approve", "href": "https://sandbox.paypal.test/approve"}],
                },
            ),
            _token_response(),
            httpx.Response(
                200,
                json={
                    "id": "ORDER-1",
                    "status": "CREATED",
                    "purchase_units": [{
                        "custom_id": "someone-else",
                        "invoice_id": "neurocient-enrollment-1",
                        "amount": {"currency_code": "USD", "value": "249.00"},
                    }],
                },
            ),
        ]
    )
    monkeypatch.setattr("app.services.paypal.httpx.AsyncClient", lambda **_kwargs: client)

    with pytest.raises(ProviderOutcomeUnknown):
        await create_cohort_order(enrollment_id="enrollment-1", request_id="operation-1")


@pytest.mark.asyncio
async def test_webhook_verification_posts_required_headers_and_event(monkeypatch):
    _configure(monkeypatch)
    client = FakeClient(
        responses=[_token_response(), httpx.Response(200, json={"verification_status": "SUCCESS"})]
    )
    monkeypatch.setattr("app.services.paypal.httpx.AsyncClient", lambda **_kwargs: client)
    body = json.dumps({"id": "WH-EVENT-1", "event_type": "PAYMENT.CAPTURE.COMPLETED"}).encode()
    headers = {
        "paypal-auth-algo": "SHA256withRSA",
        "paypal-cert-url": "https://api-m.sandbox.paypal.com/cert",
        "paypal-transmission-id": "transmission-1",
        "paypal-transmission-sig": "signature",
        "paypal-transmission-time": "2026-11-04T10:00:00Z",
    }

    assert await verify_webhook(body, headers, webhook_id="WH-COHORT") is True
    verification = client.calls[1][2]["json"]
    assert verification["webhook_id"] == "WH-COHORT"
    assert verification["transmission_id"] == "transmission-1"
    assert verification["webhook_event"]["id"] == "WH-EVENT-1"


@pytest.mark.asyncio
async def test_webhook_verification_fails_closed_on_missing_header(monkeypatch):
    _configure(monkeypatch)
    assert await verify_webhook(b"{}", {}, webhook_id="WH-COHORT") is False


@pytest.mark.asyncio
async def test_provider_rejection_does_not_expose_provider_body(monkeypatch):
    _configure(monkeypatch)
    client = FakeClient(
        responses=[_token_response(), httpx.Response(422, json={"details": [{"issue": "bad"}]})]
    )
    monkeypatch.setattr("app.services.paypal.httpx.AsyncClient", lambda **_kwargs: client)

    with pytest.raises(ProviderRejected) as rejected:
        await create_cohort_order(enrollment_id="enrollment-1", request_id="operation-1")
    assert "details" not in str(rejected.value)
