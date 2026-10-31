from collections.abc import Mapping

from twilio.request_validator import RequestValidator

from app.config import settings, valid_twilio_webhook_url


def twilio_webhook_ready() -> bool:
    return bool(
        settings.TWILIO_ACCOUNT_SID
        and settings.TWILIO_AUTH_TOKEN
        and valid_twilio_webhook_url(settings.TWILIO_WHATSAPP_WEBHOOK_URL)
    )


def validate_twilio_request(
    form: Mapping[str, str],
    signature: str | None,
) -> bool:
    """Validate the exact configured URL and the complete received form."""

    if not twilio_webhook_ready() or not signature:
        return False
    if form.get("AccountSid") != settings.TWILIO_ACCOUNT_SID:
        return False

    validator = RequestValidator(settings.TWILIO_AUTH_TOKEN)
    return validator.validate(
        settings.TWILIO_WHATSAPP_WEBHOOK_URL,
        form,
        signature,
    )
