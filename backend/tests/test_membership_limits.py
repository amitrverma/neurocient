import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.Routes import challenge_routes, ikea_routes, spot_routes


class ScalarResult:
    def __init__(self, value):
        self.value = value

    def scalar(self):
        return self.value


class OneResultSession:
    def __init__(self, value):
        self.value = value
        self.added = []
        self.commits = 0

    async def execute(self, _statement):
        return ScalarResult(self.value)

    def add(self, value):
        self.added.append(value)

    async def commit(self):
        self.commits += 1


class JsonRequest:
    async def json(self):
        return {"description": "A concrete moment"}


def assert_membership_required(error: HTTPException, resource: str, limit: int):
    assert error.status_code == 402
    assert error.detail["code"] == "membership_required"
    assert error.detail["resource"] == resource
    assert error.detail["limit"] == limit


def test_free_account_cannot_create_sixteenth_spot(monkeypatch):
    monkeypatch.setattr(
        spot_routes,
        "has_active_membership",
        AsyncMock(return_value=False),
    )
    db = OneResultSession(spot_routes.FREE_SPOT_LIMIT)

    with pytest.raises(HTTPException) as raised:
        asyncio.run(
            spot_routes.create_spot(
                request=JsonRequest(),
                db=db,
                current_user=SimpleNamespace(id=uuid4()),
            )
        )

    assert_membership_required(
        raised.value,
        "spots",
        spot_routes.FREE_SPOT_LIMIT,
    )
    assert db.added == []
    assert db.commits == 0


def test_free_account_cannot_assign_sixth_microchallenge(monkeypatch):
    monkeypatch.setattr(
        challenge_routes,
        "has_active_membership",
        AsyncMock(return_value=False),
    )
    db = OneResultSession(challenge_routes.FREE_MICROCHALLENGE_LIMIT)

    with pytest.raises(HTTPException) as raised:
        asyncio.run(
            challenge_routes.assign_microchallenge(
                challenge_id=uuid4(),
                db=db,
                current_user=SimpleNamespace(id=uuid4()),
            )
        )

    assert_membership_required(
        raised.value,
        "microchallenges",
        challenge_routes.FREE_MICROCHALLENGE_LIMIT,
    )
    assert db.added == []
    assert db.commits == 0


def test_free_account_cannot_save_second_practice(monkeypatch):
    monkeypatch.setattr(
        ikea_routes,
        "has_active_membership",
        AsyncMock(return_value=False),
    )
    db = OneResultSession(ikea_routes.FREE_PRACTICE_LIMIT)

    with pytest.raises(HTTPException) as raised:
        asyncio.run(
            ikea_routes.save_worksheet(
                db=db,
                current_user=SimpleNamespace(id=uuid4()),
                struggle="A difficult start",
                identity="I can begin smaller",
                knowledge="Immediate relief can reinforce delay",
                environment={"source": "practice"},
                tinyAction="Open the document",
            )
        )

    assert_membership_required(
        raised.value,
        "practice",
        ikea_routes.FREE_PRACTICE_LIMIT,
    )
    assert db.added == []
    assert db.commits == 0
