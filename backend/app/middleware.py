from __future__ import annotations

from starlette.types import ASGIApp, Message, Receive, Scope, Send


MAX_MUTATION_BODY_BYTES = 256 * 1024


class MutationBodyLimitMiddleware:
    def __init__(self, app: ASGIApp, max_bytes: int = MAX_MUTATION_BODY_BYTES):
        self.app = app
        self.max_bytes = max_bytes

    async def __call__(self, scope: Scope, receive: Receive, send: Send) -> None:
        if scope["type"] != "http" or scope["method"] not in {
            "POST", "PUT", "PATCH", "DELETE"
        }:
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
