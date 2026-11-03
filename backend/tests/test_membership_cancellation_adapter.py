import httpx
import pytest

from app.config import settings
from app.Routes.membership_cancellation_routes import _confirms_period_end
from app.services.membership_razorpay import (
    ProviderNotFound,
    ProviderOutcomeUnknown,
    cancel_membership_subscription_at_period_end,
    fetch_membership_subscription,
)


class FakeClient:
    def __init__(self, response=None, error=None):
        self.response = response
        self.error = error
        self.request_call = None

    async def __aenter__(self):
        return self

    async def __aexit__(self, *_args):
        return False

    async def request(self, method, url, **kwargs):
        self.request_call = (method, url, kwargs)
        if self.error:
            raise self.error
        return self.response


def test_period_end_confirmation_requires_matching_subscription():
    assert _confirms_period_end({"id": "sub_1", "status": "active"}, "sub_1")
    assert not _confirms_period_end({}, "sub_1")
    assert not _confirms_period_end({"id": "sub_other"}, "sub_1")


@pytest.mark.asyncio
async def test_cancellation_requests_period_end_not_immediate(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_KEY_ID", "key")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", "secret")
    client = FakeClient(
        response=httpx.Response(200, json={"id": "sub_1", "status": "active"})
    )
    monkeypatch.setattr(
        "app.services.membership_razorpay.httpx.AsyncClient",
        lambda **_kwargs: client,
    )

    response = await cancel_membership_subscription_at_period_end("sub_1")

    assert response["id"] == "sub_1"
    assert client.request_call[0] == "POST"
    assert client.request_call[1].endswith("/subscriptions/sub_1/cancel")
    assert client.request_call[2]["json"]["cancel_at_cycle_end"] is True


@pytest.mark.asyncio
async def test_cancellation_transport_failure_is_uncertain(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_KEY_ID", "key")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", "secret")
    request = httpx.Request("POST", "https://api.razorpay.com/v1/subscriptions/sub_1/cancel")
    client = FakeClient(error=httpx.ConnectError("lost", request=request))
    monkeypatch.setattr(
        "app.services.membership_razorpay.httpx.AsyncClient",
        lambda **_kwargs: client,
    )

    with pytest.raises(ProviderOutcomeUnknown):
        await cancel_membership_subscription_at_period_end("sub_1")


@pytest.mark.asyncio
async def test_missing_subscription_is_distinct_from_transient_provider_failure(
    monkeypatch,
):
    monkeypatch.setattr(settings, "RAZORPAY_KEY_ID", "key")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", "secret")
    client = FakeClient(response=httpx.Response(404, json={"error": "missing"}))
    monkeypatch.setattr(
        "app.services.membership_razorpay.httpx.AsyncClient",
        lambda **_kwargs: client,
    )

    with pytest.raises(ProviderNotFound):
        await fetch_membership_subscription("sub_missing")
