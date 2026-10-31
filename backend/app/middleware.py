from __future__ import annotations

from urllib.parse import urlsplit

from starlette.requests import Request
from starlette.types import ASGIApp, Message, Receive, Scope, Send

from app.config import settings
from app.services.rate_limits import has_valid_proxy_signature


MAX_MUTATION_BODY_BYTES = 256 * 1024
UNSAFE_METHODS = {"POST", "PUT", "PATCH", "DELETE"}
BROWSER_CREDENTIAL_COOKIES = {
    "access_token",
    "refresh_token",
    "session_present",
    "guest_access_id",
}


class MutationBodyLimitMiddleware:
    def __init__(self, app: ASGIApp, max_bytes: int = MAX_MUTATION_BODY_BYTES):
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http" or scope["method"] not in UNSAFE_METHODS:
            await self.app(scope, receive, send)
            return

        headers = dict(scope.get("headers", []))
        try:
            content_length = int(headers.get(b"content-length", b"0"))
        except ValueError:
            content_length = 0
        if content_length > self.max_bytes:
            await self._reject(send)
            return

        messages: list[Message] = []
        consumed = 0
        while True:
            message = await receive()
            messages.append(message)
            if message["type"] != "http.request":
                break
            consumed += len(message.get("body", b""))
            if consumed > self.max_bytes:
                await self._reject(send)
                return
            if not message.get("more_body", False):
                break

        index = 0

        async def replay_receive() -> Message:
            nonlocal index
            if index < len(messages):
                message = messages[index]
                index += 1
                return message
            return {"type": "http.request", "body": b"", "more_body": False}

        await self.app(scope, replay_receive, send)

    @staticmethod
    async def _reject(send: Send) -> None:
        body = b'{"detail":{"code":"payload_too_large"}}'
        await send(
            {
                "type": "http.response.start",
                "status": 413,
                "headers": [
                    (b"content-type", b"application/json"),
                    (b"content-length", str(len(body)).encode("ascii")),
                    (b"cache-control", b"no-store"),
                ],
            }
        )
        await send({"type": "http.response.body", "body": body})


def _header_values(scope: Scope, name: bytes) -> list[str]:
    return [
        value.decode("latin-1").strip()
        for key, value in scope.get("headers", [])
        if key.lower() == name
    ]


def _origin_from_value(value: str, *, referer: bool) -> str | None:
    if not value or value == "null" or "," in value:
        return None
    try:
        parsed = urlsplit(value)
        port = parsed.port
    except ValueError:
        return None
    if (
        parsed.scheme not in {"http", "https"}
        or not parsed.hostname
        or parsed.username is not None
        or parsed.password is not None
        or (not referer and (parsed.path or parsed.query or parsed.fragment))
    ):
        return None
    host = f"[{parsed.hostname}]" if ":" in parsed.hostname else parsed.hostname
    origin = f"{parsed.scheme}://{host.lower()}"
    if port is not None:
        origin += f":{port}"
    return origin


def _has_trusted_direct_origin(scope: Scope) -> bool:
    origins = _header_values(scope, b"origin")
    if origins:
        if len(origins) != 1:
            return False
        candidate = _origin_from_value(origins[0], referer=False)
    else:
        referers = _header_values(scope, b"referer")
        if len(referers) != 1:
            return False
        candidate = _origin_from_value(referers[0], referer=True)
    return candidate in settings.CSRF_TRUSTED_ORIGINS


class CsrfProtectionMiddleware:
    def __init__(self, app: ASGIApp):
        self.app = app

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if (
            scope["type"] != "http"
            or scope["method"] not in UNSAFE_METHODS
        ):
            await self.app(scope, receive, send)
            return

        request = Request(scope)
        path = scope.get("path", "")
        has_browser_credential = any(
            request.cookies.get(name) is not None
            for name in BROWSER_CREDENTIAL_COOKIES
        )
        browser_auth_mutation = path == "/auth" or path.startswith("/auth/")
        if not has_browser_credential and not browser_auth_mutation:
            await self.app(scope, receive, send)
            return

        if has_valid_proxy_signature(request) or _has_trusted_direct_origin(scope):
            await self.app(scope, receive, send)
            return

        body = b'{"detail":{"code":"csrf_failed"}}'
        await send(
            {
                "type": "http.response.start",
                "status": 403,
                "headers": [
                    (b"content-type", b"application/json"),
                    (b"content-length", str(len(body)).encode("ascii")),
                    (b"cache-control", b"no-store"),
                ],
            }
        )
        await send({"type": "http.response.body", "body": body})
