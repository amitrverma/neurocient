import asyncio
from types import SimpleNamespace
from unittest.mock import AsyncMock
from uuid import uuid4

import pytest
from fastapi import HTTPException

from app.Routes import spot_routes


class JsonRequest:
    def __init__(self, body):
        self.body = body

    async def json(self):
        return self.body


def test_spot_date_validation_is_actionable():
    with pytest.raises(HTTPException) as raised:
        asyncio.run(
            spot_routes.create_spot(
                request=JsonRequest(
                    {"description": "A concrete situation", "date": "03/11/2026"}
                ),
                db=SimpleNamespace(),
                current_user=SimpleNamespace(id=uuid4()),
            )
        )

    assert raised.value.status_code == 422
    assert raised.value.detail == "Date must use YYYY-MM-DD format"


def test_spot_internal_failure_is_generic_and_rolls_back(monkeypatch, caplog):
    private_error = "private-database-detail"
    rollback = AsyncMock()
    monkeypatch.setattr(
        spot_routes,
        "capture_spot",
        AsyncMock(side_effect=RuntimeError(private_error)),
    )

    with pytest.raises(HTTPException) as raised:
        asyncio.run(
            spot_routes.create_spot(
                request=JsonRequest({"description": "A concrete situation"}),
                db=SimpleNamespace(rollback=rollback),
                current_user=SimpleNamespace(id=uuid4()),
            )
        )

    assert raised.value.status_code == 500
    assert raised.value.detail == "Spot could not be saved"
    rollback.assert_awaited_once()
    assert private_error not in caplog.text
