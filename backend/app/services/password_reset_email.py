import html
import logging
from urllib.parse import quote

import httpx

from app.config import settings


logger = logging.getLogger(__name__)


async def send_password_reset_email(email: str, token: str) -> bool:
    if not (
        settings.RESEND_API_KEY
        and settings.RESEND_FROM_EMAIL
        and settings.PASSWORD_RESET_BASE_URL
    ):
        logger.error("Password reset email configuration is missing")
        return False

    reset_url = f"{settings.PASSWORD_RESET_BASE_URL}#token={quote(token, safe='')}"
    safe_url = html.escape(reset_url, quote=True)
    payload = {
        "from": f"Neurocient <{settings.RESEND_FROM_EMAIL}>",
        "to": [email],
        "subject": "Reset your Neurocient password",
        "html": (
            "<p>You requested a Neurocient password reset.</p>"
            f'<p><a href="{safe_url}">Reset your password</a></p>'
            "<p>This link expires in 30 minutes and works once. "
            "If you did not request it, you can ignore this email.</p>"
        ),
    }
    try:
        async with httpx.AsyncClient(timeout=10.0) as client:
            response = await client.post(
                "https://api.resend.com/emails",
                headers={
                    "Authorization": f"Bearer {settings.RESEND_API_KEY}",
                    "Content-Type": "application/json",
                },
                json=payload,
            )
        if response.status_code == 200:
            return True
        logger.error(
            "Password reset email provider rejected delivery",
            extra={"status_code": response.status_code},
        )
    except httpx.HTTPError:
        logger.exception("Password reset email delivery failed")
    return False
