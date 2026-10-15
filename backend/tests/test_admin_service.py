from types import SimpleNamespace
from unittest.mock import AsyncMock

import pytest

from app.config import settings
from app.models import UserRole
from app.services.admin import admin_self_registration_allowed, provision_configured_admin


class Result:
    def __init__(self, value):
        self.value = value

    def scalar_one_or_none(self):
        return self.value


@pytest.mark.asyncio
async def test_only_configured_authenticated_user_is_provisioned(monkeypatch):
    monkeypatch.setattr(settings, "ADMIN_EMAIL", "hello@neurocient.com")
    db = SimpleNamespace(execute=AsyncMock(return_value=Result(None)), add=lambda value: setattr(db, "added", value), commit=AsyncMock())

    changed = await provision_configured_admin(db, SimpleNamespace(id="user-1", email="person@example.com"))
    assert changed is False
    assert not hasattr(db, "added")

    changed = await provision_configured_admin(db, SimpleNamespace(id="user-2", email="Hello@Neurocient.com"))
    assert changed is True
    assert isinstance(db.added, UserRole)
    db.commit.assert_awaited_once()


@pytest.mark.asyncio
async def test_existing_admin_role_is_idempotent(monkeypatch):
    monkeypatch.setattr(settings, "ADMIN_EMAIL", "hello@neurocient.com")
    db = SimpleNamespace(execute=AsyncMock(return_value=Result(UserRole())), add=lambda value: None, commit=AsyncMock())
    changed = await provision_configured_admin(db, SimpleNamespace(id="user-2", email="hello@neurocient.com"))
    assert changed is False
    db.commit.assert_not_awaited()


def test_admin_self_registration_is_local_only(monkeypatch):
    monkeypatch.setattr(settings, "ENV", "dev")
    assert admin_self_registration_allowed() is True
    monkeypatch.setattr(settings, "ENV", "test")
    assert admin_self_registration_allowed() is True
    monkeypatch.setattr(settings, "ENV", "prod")
    assert admin_self_registration_allowed() is False
