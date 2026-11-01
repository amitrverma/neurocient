from __future__ import annotations

import contextvars
import json
import logging
import sys
import traceback
import uuid
from datetime import datetime, timezone
from typing import Any


current_correlation_id: contextvars.ContextVar[str | None] = contextvars.ContextVar(
    "correlation_id", default=None
)

STRUCTURED_FIELDS = {
    "attempt", "channel", "component", "correlation_id", "count", "duration_ms",
    "error_type", "event", "issue_code", "job_name", "method", "operation",
    "outcome", "product", "provider", "purpose", "reason_code", "retryable", "route",
    "run_key", "stack", "status_code",
}


def normalize_correlation_id(value: str | None) -> str:
    if value:
        try:
            return str(uuid.UUID(value.strip()))
        except (ValueError, AttributeError):
            pass
    return str(uuid.uuid4())


def correlation_headers() -> dict[str, str]:
    value = current_correlation_id.get()
    return {"X-Correlation-ID": value} if value else {}


class JsonFormatter(logging.Formatter):
    def format(self, record: logging.LogRecord) -> str:
        payload: dict[str, Any] = {
            "timestamp": datetime.now(timezone.utc).isoformat(),
            "level": record.levelname.lower(),
            "logger": record.name,
            "event": getattr(record, "event", record.getMessage()),
        }
        for field in STRUCTURED_FIELDS - {"event"}:
            value = getattr(record, field, None)
            if value is not None:
                payload[field] = value
        return json.dumps(payload, separators=(",", ":"), default=str)


class CorrelationFilter(logging.Filter):
    def filter(self, record: logging.LogRecord) -> bool:
        if getattr(record, "correlation_id", None) is None:
            record.correlation_id = current_correlation_id.get()
        return True


def configure_logging(level: int = logging.INFO) -> None:
    root = logging.getLogger()
    if any(getattr(handler, "_neurocient_json", False) for handler in root.handlers):
        root.setLevel(level)
        return
    handler = logging.StreamHandler(sys.stdout)
    handler.setFormatter(JsonFormatter())
    handler.addFilter(CorrelationFilter())
    handler._neurocient_json = True  # type: ignore[attr-defined]
    root.handlers.clear()
    root.addHandler(handler)
    root.setLevel(level)


def log_event(
    logger: logging.Logger,
    event_name: str,
    *,
    level: int = logging.INFO,
    **fields: Any,
) -> None:
    unknown = sorted(set(fields) - STRUCTURED_FIELDS)
    if unknown:
        raise ValueError("Unapproved structured log fields: " + ", ".join(unknown))
    logger.log(
        level,
        event_name,
        extra={
            "event": event_name,
            "correlation_id": current_correlation_id.get(),
            **fields,
        },
    )


def safe_exception_fields(error: BaseException) -> dict[str, Any]:
    frames = traceback.extract_tb(error.__traceback__)
    return {
        "error_type": type(error).__name__,
        "stack": [
            {
                "file": frame.filename.rsplit("/", 1)[-1].rsplit("\\", 1)[-1],
                "line": frame.lineno,
                "function": frame.name,
            }
            for frame in frames[-8:]
        ],
    }
