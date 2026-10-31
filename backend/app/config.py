import os
from urllib.parse import urlsplit
from dotenv import load_dotenv

load_dotenv()


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def valid_twilio_webhook_url(value: str | None) -> bool:
    if not value:
        return False
    parsed = urlsplit(value)
    return bool(
        parsed.scheme == "https"
        and parsed.hostname
        and parsed.username is None
        and parsed.password is None
        and not parsed.fragment
        and parsed.path == "/wa/webhook/whatsapp"
    )


def parse_csrf_trusted_origins(value: str | None, env: str) -> tuple[str, ...]:
    if not value:
        if env == "prod":
            return ()
        return ("http://localhost:3000", "http://localhost:3001")

    origins: list[str] = []
    for raw in value.split(","):
        candidate = raw.strip()
        if not candidate:
            raise RuntimeError("CSRF_TRUSTED_ORIGINS contains an empty origin")
        parsed = urlsplit(candidate)
        try:
            port = parsed.port
        except ValueError as exc:
            raise RuntimeError("CSRF_TRUSTED_ORIGINS contains an invalid port") from exc
        if (
            parsed.scheme not in {"http", "https"}
            or not parsed.hostname
            or parsed.username is not None
            or parsed.password is not None
            or parsed.path
            or parsed.query
            or parsed.fragment
        ):
            raise RuntimeError(f"Invalid CSRF trusted origin: {candidate}")
        if parsed.scheme == "http" and not (
            env != "prod" and parsed.hostname in {"localhost", "127.0.0.1", "::1"}
        ):
            raise RuntimeError(f"CSRF trusted origin must use HTTPS: {candidate}")
        host = f"[{parsed.hostname}]" if ":" in parsed.hostname else parsed.hostname
        normalized = f"{parsed.scheme}://{host.lower()}"
        if port is not None:
            normalized += f":{port}"
        if normalized in origins:
            raise RuntimeError(f"Duplicate CSRF trusted origin: {normalized}")
        origins.append(normalized)
    return tuple(origins)


class Settings:
    DATABASE_URL = os.getenv("DATABASE_URL")
    ENV = os.getenv("ENV", "dev").strip().lower()
    JWT_SECRET = os.getenv("JWT_SECRET")
    GOOGLE_CLIENT_ID = os.getenv("GOOGLE_CLIENT_ID")
    GOOGLE_CLIENT_SECRET = os.getenv("GOOGLE_CLIENT_SECRET")
    GOOGLE_REDIRECT_URI = os.getenv("GOOGLE_REDIRECT_URI")
    VAPID_PRIVATE_KEY = os.getenv("VAPID_PRIVATE_KEY")
    VAPID_CLAIMS_EMAIL = os.getenv("VAPID_CLAIMS_EMAIL")
    POSTHOG_API_KEY = os.getenv("POSTHOG_API_KEY", "")
    POSTHOG_HOST = os.getenv("POSTHOG_HOST")
    OPENAI_API_KEY = os.getenv("OPENAI_API_KEY")
    ADMIN_API_KEY = os.getenv("ADMIN_API_KEY")
    ADMIN_EMAIL = os.getenv("ADMIN_EMAIL", "hello@neurocient.com").strip().lower()
    RAZORPAY_KEY_ID = os.getenv("RAZORPAY_KEY_ID")
    RAZORPAY_KEY_SECRET = os.getenv("RAZORPAY_KEY_SECRET")
    RAZORPAY_WEBHOOK_SECRET = os.getenv("RAZORPAY_WEBHOOK_SECRET")
    TWILIO_ACCOUNT_SID = os.getenv("TWILIO_ACCOUNT_SID")
    TWILIO_AUTH_TOKEN = os.getenv("TWILIO_AUTH_TOKEN")
    TWILIO_WHATSAPP_NUMBER = os.getenv("TWILIO_WHATSAPP_NUMBER")
    TWILIO_WHATSAPP_WEBHOOK_URL = os.getenv("TWILIO_WHATSAPP_WEBHOOK_URL")
    CONSENT_VERIFICATION_SECRET = os.getenv("CONSENT_VERIFICATION_SECRET")
    RESEND_API_KEY = os.getenv("RESEND_API_KEY")
    RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL")
    PASSWORD_RESET_BASE_URL = os.getenv("PASSWORD_RESET_BASE_URL")
    RATE_LIMIT_ENABLED = _env_bool("RATE_LIMIT_ENABLED", default=False)
    RATE_LIMIT_KEY_SECRET = os.getenv("RATE_LIMIT_KEY_SECRET")
    ABUSE_PROXY_SECRET = os.getenv("ABUSE_PROXY_SECRET")
    CSRF_TRUSTED_ORIGINS = parse_csrf_trusted_origins(
        os.getenv("CSRF_TRUSTED_ORIGINS"), ENV
    )
    ENABLE_SCHEDULER = _env_bool("ENABLE_SCHEDULER", default=False)

    def validate_for_startup(self) -> None:
        missing = []
        if not self.DATABASE_URL:
            missing.append("DATABASE_URL")

        if self.ENV == "prod":
            for name in ("JWT_SECRET", "OPENAI_API_KEY"):
                if not getattr(self, name):
                    missing.append(name)

            if not self.RATE_LIMIT_ENABLED:
                missing.append("RATE_LIMIT_ENABLED=true")
            for name in (
                "RATE_LIMIT_KEY_SECRET",
                "ABUSE_PROXY_SECRET",
                "CONSENT_VERIFICATION_SECRET",
            ):
                value = getattr(self, name)
                if not value:
                    missing.append(name)
                elif len(value) < 32:
                    raise RuntimeError(
                        f"Invalid runtime configuration: {name} must be at least 32 characters"
                    )
            if (
                self.RATE_LIMIT_KEY_SECRET
                and self.RATE_LIMIT_KEY_SECRET == self.ABUSE_PROXY_SECRET
            ):
                raise RuntimeError(
                    "Invalid runtime configuration: abuse-control secrets must be independent"
                )
            if not self.CSRF_TRUSTED_ORIGINS:
                missing.append("CSRF_TRUSTED_ORIGINS")
            elif any(
                not origin.startswith("https://")
                for origin in self.CSRF_TRUSTED_ORIGINS
            ):
                missing.append("CSRF_TRUSTED_ORIGINS (HTTPS only)")

        twilio_names = (
            "TWILIO_ACCOUNT_SID",
            "TWILIO_AUTH_TOKEN",
            "TWILIO_WHATSAPP_NUMBER",
            "TWILIO_WHATSAPP_WEBHOOK_URL",
        )
        if self.ENV == "prod" or any(getattr(self, name) for name in twilio_names):
            for name in twilio_names:
                if not getattr(self, name):
                    missing.append(name)

        if missing:
            raise RuntimeError(
                "Missing required runtime configuration: " + ", ".join(sorted(missing))
            )

        if self.TWILIO_WHATSAPP_WEBHOOK_URL and not valid_twilio_webhook_url(
            self.TWILIO_WHATSAPP_WEBHOOK_URL
        ):
            raise RuntimeError(
                "Invalid runtime configuration: "
                "TWILIO_WHATSAPP_WEBHOOK_URL must be the exact HTTPS webhook route"
            )

settings = Settings()
