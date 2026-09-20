import pytest
from unittest.mock import AsyncMock
from pywebpush import WebPushException

from app.utils import pushnotification
from app.config import settings


class DummyResponse:
    def __init__(self, status_code):
        self.status_code = status_code


def setup_settings(monkeypatch):
    monkeypatch.setattr(settings, "VAPID_PRIVATE_KEY", "key")
    monkeypatch.setattr(settings, "VAPID_CLAIMS_EMAIL", "test@example.com")


@pytest.mark.asyncio
async def test_send_push_success(monkeypatch):
    setup_settings(monkeypatch)

    def fake_webpush(**kwargs):
        return "ok"

    monkeypatch.setattr(pushnotification, "webpush", lambda **kwargs: fake_webpush(**kwargs))
    db = AsyncMock()
    result = await pushnotification.send_push({"endpoint": "e", "keys": {}}, "data", db)
    assert result == "ok"
    db.execute.assert_not_awaited()


@pytest.mark.parametrize("status", [410, 404, 400, 401, 500])
@pytest.mark.asyncio
async def test_send_push_failures(monkeypatch, status):
    setup_settings(monkeypatch)

    def fake_webpush(**kwargs):
        raise WebPushException("error", response=DummyResponse(status))

    monkeypatch.setattr(pushnotification, "webpush", lambda **kwargs: fake_webpush(**kwargs))
    db = AsyncMock()
    result = await pushnotification.send_push(
        {"endpoint": "e", "keys": {}},
        "data",
        db,
        sub_id="subscription-id",
    )
    assert result is None

    if status in (404, 410):
        db.execute.assert_awaited_once()
        db.commit.assert_awaited_once()
    else:
        db.execute.assert_not_awaited()
        db.commit.assert_not_awaited()
