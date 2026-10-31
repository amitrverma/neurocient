import html

import httpx
from fastapi import APIRouter, Depends, HTTPException, Request
from pydantic import BaseModel, EmailStr, Field
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.services.rate_limits import enforce, normalize_email, request_rules

router = APIRouter()


class ContactRequest(BaseModel):
    name: str = Field(min_length=1, max_length=100)
    email: EmailStr
    message: str = Field(min_length=1, max_length=4000)


@router.post("/contact", status_code=202)
async def send_contact(
    payload: ContactRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    email = normalize_email(str(payload.email))
    await enforce(
        db,
        request_rules(request, ("contact_email", email), ip_policy="contact_ip"),
    )
    if not settings.RESEND_API_KEY or not settings.RESEND_FROM_EMAIL:
        raise HTTPException(status_code=503, detail="Contact delivery is unavailable")

    safe_name = html.escape(payload.name.strip())
    safe_email = html.escape(email)
    safe_message = html.escape(payload.message).replace("\n", "<br>")
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json={
                    "from": settings.RESEND_FROM_EMAIL,
                    "to": ["hello@neurocient.com"],
                    "reply_to": email,
                    "subject": f"New contact form submission from {payload.name.strip()[:100]}",
                    "html": (
                        f"<p><strong>Name:</strong> {safe_name}</p>"
                        f"<p><strong>Email:</strong> {safe_email}</p>"
                        f"<p><strong>Message:</strong><br>{safe_message}</p>"
                    ),
                },
            )
            response.raise_for_status()
    except (httpx.HTTPError, httpx.TimeoutException):
        raise HTTPException(status_code=502, detail="Contact delivery is unavailable")
    return {"ok": True}
