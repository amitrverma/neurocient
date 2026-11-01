import json
import logging
import uuid

import httpx
import pytest

from app.middleware import CorrelationMiddleware
from app.observability import (
    JsonFormatter,
    current_correlation_id,
    log_event,
    normalize_correlation_id,
)


def test_correlation_id_preserves_only_valid_uuid_values():
    value = str(uuid.uuid4())
    assert normalize_correlation_id(value) == value
    assert normalize_correlation_id("not-a-uuid") != "not-a-uuid"
    assert uuid.UUID(normalize_correlation_id(None))


def test_json_formatter_emits_allowlisted_structured_fields():
    formatter = JsonFormatter()
    record = logging.LogRecord("test", logging.INFO, __file__, 1, "request_finished", (), None)
    record.event = "request_finished"
    record.correlation_id = "corr"
    record.operation = "http_request"
    record.outcome = "success"
    record.status_code = 200
    payload = json.loads(formatter.format(record))
    assert payload["event"] == "request_finished"
    assert payload["correlation_id"] == "corr"
    assert payload["operation"] == "http_request"
    assert payload["outcome"] == "success"
    assert "pathname" not in payload


def test_log_event_rejects_unapproved_fields():
    with pytest.raises(ValueError, match="Unapproved structured log fields"):
        log_event(logging.getLogger("test"), "unsafe", email="person@example.com")


def test_log_event_uses_context_correlation(caplog):
    token = current_correlation_id.set("correlation-test")
    try:
        with caplog.at_level(logging.INFO, logger="test"):
            log_event(
                logging.getLogger("test"),
                "operation_finished",
                operation="membership_reconciliation",
                outcome="success",
            )
    finally:
        current_correlation_id.reset(token)
    assert caplog.records[-1].correlation_id == "correlation-test"
    assert caplog.records[-1].event == "operation_finished"


@pytest.mark.asyncio
async def test_correlation_middleware_preserves_valid_id_and_returns_it():
    correlation_id = str(uuid.uuid4())
    messages = []

    async def app(_scope, _receive, send):
        assert current_correlation_id.get() == correlation_id
        await send({"type": "http.response.start", "status": 204, "headers": []})
        await send({"type": "http.response.body", "body": b""})

    async def receive():
        return {"type": "http.request", "body": b"", "more_body": False}

    async def send(message):
        messages.append(message)

    middleware = CorrelationMiddleware(app)
    await middleware(
        {
            "type": "http",
            "method": "GET",
            "path": "/healthz",
            "headers": [(b"x-correlation-id", correlation_id.encode())],
        },
        receive,
        send,
    )

    response_headers = dict(messages[0]["headers"])
    assert response_headers[b"x-correlation-id"] == correlation_id.encode()
    assert current_correlation_id.get() is None


@pytest.mark.asyncio
async def test_correlation_middleware_returns_safe_unexpected_error_contract():
    messages = []

    async def app(_scope, _receive, _send):
        raise RuntimeError("database password=private")

    async def receive():
        return {"type": "http.request", "body": b"", "more_body": False}

    async def send(message):
        messages.append(message)

    middleware = CorrelationMiddleware(app)
    await middleware(
        {"type": "http", "method": "GET", "path": "/private", "headers": []},
        receive,
        send,
    )

    assert messages[0]["status"] == 500
    payload = json.loads(messages[1]["body"])
    assert payload["detail"]["code"] == "internal_error"
    assert uuid.UUID(payload["detail"]["correlation_id"])
    assert "private" not in str(payload)


@pytest.mark.asyncio
async def test_cors_preflight_response_is_correlated():
    from app.config import settings
    from app.main import app

    origin = settings.CSRF_TRUSTED_ORIGINS[0]
    transport = httpx.ASGITransport(app=app)
    async with httpx.AsyncClient(transport=transport, base_url="http://test") as client:
        response = await client.options(
            "/healthz",
            headers={
                "Origin": origin,
                "Access-Control-Request-Method": "GET",
            },
        )

    assert response.status_code == 200
    assert uuid.UUID(response.headers["x-correlation-id"])
