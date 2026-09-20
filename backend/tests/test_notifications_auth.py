import asyncio

import pytest
from fastapi import HTTPException

from app.Routes.notifications_routes import require_admin_key
from app.config import settings


def test_notification_admin_key_is_required(monkeypatch):
    monkeypatch.setattr(settings, "ADMIN_API_KEY", "expected")

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(require_admin_key(None))

    assert exc_info.value.status_code == 403


def test_notification_admin_key_must_match(monkeypatch):
    monkeypatch.setattr(settings, "ADMIN_API_KEY", "expected")

    with pytest.raises(HTTPException) as exc_info:
        asyncio.run(require_admin_key("wrong"))

    assert exc_info.value.status_code == 403

    asyncio.run(require_admin_key("expected"))
