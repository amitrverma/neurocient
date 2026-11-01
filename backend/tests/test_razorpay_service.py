import hashlib
import hmac

import httpx
import pytest

from app.config import settings
from app.services.razorpay import (
    ProviderOutcomeUnknown,
    ProviderRejected,
    create_order,
    razorpay_ready,
    verify_checkout_signature,
    verify_webhook_signature,
)


class FakeClient:
    def __init__(self, response=None, error=None):
        self.response = response
        self.error = error

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_args):
        return False

    async def post(self, *_args, **_kwargs):
        if self.error:
            raise self.error
        return self.response


def test_webhook_signature_fails_closed_without_secret(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_WEBHOOK_SECRET", None)
    assert verify_webhook_signature(b"{}", "anything") is False


def test_webhook_signature_uses_exact_raw_body(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_WEBHOOK_SECRET", "test-secret")
    body = b'{"event":"payment.captured"}'
    signature = hmac.new(b"test-secret", body, hashlib.sha256).hexdigest()
    assert verify_webhook_signature(body, signature) is True
    assert verify_webhook_signature(body + b" ", signature) is False


def test_checkout_signature_uses_server_order_and_payment_ids(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", "checkout-secret")
    expected = hmac.new(
        b"checkout-secret",
        b"order_server|pay_checkout",
        hashlib.sha256,
    ).hexdigest()

    assert verify_checkout_signature("order_server", "pay_checkout", expected) is True
    assert verify_checkout_signature("order_tampered", "pay_checkout", expected) is False
    assert verify_checkout_signature("order_server", "pay_tampered", expected) is False


def test_checkout_signature_fails_closed_without_secret(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", None)
    assert verify_checkout_signature("order_server", "pay_checkout", "signature") is False


def test_checkout_requires_all_provider_configuration(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_KEY_ID", "key")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", "secret")
    monkeypatch.setattr(settings, "RAZORPAY_WEBHOOK_SECRET", None)
    assert razorpay_ready() is False
    monkeypatch.setattr(settings, "RAZORPAY_WEBHOOK_SECRET", "webhook")
    assert razorpay_ready() is True


@pytest.mark.asyncio
async def test_create_order_rejects_amounts_below_one_rupee(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_KEY_ID", "key")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", "secret")

    with pytest.raises(ProviderRejected):
        await create_order(
            amount_minor=99,
            currency="INR",
            receipt="enrollment-1",
            notes={},
        )


@pytest.mark.asyncio
async def test_create_order_requires_an_exact_provider_response(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_KEY_ID", "key")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", "secret")
    response = httpx.Response(
        200,
        json={
            "id": "order_1",
            "amount": 2_100_000,
            "currency": "INR",
            "receipt": "enrollment-1",
            "status": "created",
        },
    )
    monkeypatch.setattr(
        "app.services.razorpay.httpx.AsyncClient",
        lambda **_kwargs: FakeClient(response=response),
    )

    order = await create_order(
        amount_minor=2_100_000,
        currency="INR",
        receipt="enrollment-1",
        notes={},
    )
    assert order["id"] == "order_1"


@pytest.mark.asyncio
async def test_create_order_distinguishes_rejection_from_unknown_outcome(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_KEY_ID", "key")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", "secret")

    monkeypatch.setattr(
        "app.services.razorpay.httpx.AsyncClient",
        lambda **_kwargs: FakeClient(response=httpx.Response(400, json={})),
    )
    with pytest.raises(ProviderRejected):
        await create_order(
            amount_minor=2_100_000,
            currency="INR",
            receipt="enrollment-1",
            notes={},
        )

    request = httpx.Request("POST", "https://api.razorpay.com/v1/orders")
    monkeypatch.setattr(
        "app.services.razorpay.httpx.AsyncClient",
        lambda **_kwargs: FakeClient(error=httpx.ConnectError("lost", request=request)),
    )
    with pytest.raises(ProviderOutcomeUnknown):
        await create_order(
            amount_minor=2_100_000,
            currency="INR",
            receipt="enrollment-1",
            notes={},
        )


@pytest.mark.asyncio
async def test_create_order_rejects_contradictory_success(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_KEY_ID", "key")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", "secret")
    response = httpx.Response(
        200,
        json={
            "id": "order_1",
            "amount": 500,
            "currency": "USD",
            "receipt": "someone-else",
            "status": "created",
        },
    )
    monkeypatch.setattr(
        "app.services.razorpay.httpx.AsyncClient",
        lambda **_kwargs: FakeClient(response=response),
    )
    with pytest.raises(ProviderOutcomeUnknown):
        await create_order(
            amount_minor=2_100_000,
            currency="INR",
            receipt="enrollment-1",
            notes={},
        )
