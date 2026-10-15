import hashlib
import hmac

import httpx

from app.config import settings


def razorpay_ready() -> bool:
    return bool(settings.RAZORPAY_KEY_ID and settings.RAZORPAY_KEY_SECRET and settings.RAZORPAY_WEBHOOK_SECRET)


async def create_order(*, amount_minor: int, currency: str, receipt: str, notes: dict) -> dict:
    if not settings.RAZORPAY_KEY_ID or not settings.RAZORPAY_KEY_SECRET:
        raise RuntimeError("Razorpay checkout is not configured")
    async with httpx.AsyncClient(timeout=15) as client:
        response = await client.post(
            "https://api.razorpay.com/v1/orders",
            auth=(settings.RAZORPAY_KEY_ID, settings.RAZORPAY_KEY_SECRET),
            json={
                "amount": amount_minor,
                "currency": currency,
                "receipt": receipt,
                "notes": notes,
            },
        )
    response.raise_for_status()
    return response.json()


def verify_webhook_signature(body: bytes, signature: str | None) -> bool:
    if not settings.RAZORPAY_WEBHOOK_SECRET or not signature:
        return False
    expected = hmac.new(
        settings.RAZORPAY_WEBHOOK_SECRET.encode("utf-8"), body, hashlib.sha256
    ).hexdigest()
    return hmac.compare_digest(expected, signature)
