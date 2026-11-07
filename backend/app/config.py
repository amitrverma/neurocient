import os
import re
from urllib.parse import urlsplit
from dotenv import load_dotenv

load_dotenv()


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


def _env_positive_int(name: str) -> int | None:
    value = os.getenv(name)
    if value is None or not value.strip():
        return None
    try:
        parsed = int(value)
    except ValueError as exc:
        raise RuntimeError(f"Invalid runtime configuration: {name} must be an integer") from exc
    if parsed <= 0:
        raise RuntimeError(f"Invalid runtime configuration: {name} must be positive")
    return parsed


def valid_graph_api_version(value: str | None) -> bool:
    return bool(value and re.fullmatch(r"v[1-9][0-9]*\.0", value))


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
    RAZORPAY_MEMBERSHIP_PLAN_ID = os.getenv("RAZORPAY_MEMBERSHIP_PLAN_ID")
    RAZORPAY_MEMBERSHIP_AMOUNT_MINOR = _env_positive_int("RAZORPAY_MEMBERSHIP_AMOUNT_MINOR")
    RAZORPAY_MEMBERSHIP_CURRENCY = os.getenv("RAZORPAY_MEMBERSHIP_CURRENCY", "INR").strip().upper()
    RAZORPAY_MEMBERSHIP_USD_PLAN_ID = os.getenv("RAZORPAY_MEMBERSHIP_USD_PLAN_ID")
    RAZORPAY_MEMBERSHIP_TOTAL_COUNT = _env_positive_int("RAZORPAY_MEMBERSHIP_TOTAL_COUNT")
    RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET = os.getenv("RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET")
    WHATSAPP_ACCESS_TOKEN = os.getenv("WHATSAPP_ACCESS_TOKEN")
    WHATSAPP_APP_SECRET = os.getenv("WHATSAPP_APP_SECRET")
    WHATSAPP_VERIFY_TOKEN = os.getenv("WHATSAPP_VERIFY_TOKEN")
    WHATSAPP_BUSINESS_ACCOUNT_ID = os.getenv("WHATSAPP_BUSINESS_ACCOUNT_ID")
    WHATSAPP_PHONE_NUMBER_ID = os.getenv("WHATSAPP_PHONE_NUMBER_ID")
    WHATSAPP_BUSINESS_NUMBER = os.getenv("WHATSAPP_BUSINESS_NUMBER")
    WHATSAPP_GRAPH_API_VERSION = os.getenv("WHATSAPP_GRAPH_API_VERSION")
    CONSENT_PAIRING_SECRET = os.getenv("CONSENT_PAIRING_SECRET")
    RESEND_API_KEY = os.getenv("RESEND_API_KEY")
    RESEND_FROM_EMAIL = os.getenv("RESEND_FROM_EMAIL")
    PASSWORD_RESET_BASE_URL = os.getenv("PASSWORD_RESET_BASE_URL")
    PUBLIC_SITE_URL = os.getenv("PUBLIC_SITE_URL", "https://neurocient.com").rstrip("/")
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

        whatsapp_names = (
            "WHATSAPP_ACCESS_TOKEN",
            "WHATSAPP_APP_SECRET",
            "WHATSAPP_VERIFY_TOKEN",
            "WHATSAPP_BUSINESS_ACCOUNT_ID",
            "WHATSAPP_PHONE_NUMBER_ID",
            "WHATSAPP_BUSINESS_NUMBER",
            "WHATSAPP_GRAPH_API_VERSION",
            "CONSENT_PAIRING_SECRET",
        )
        if self.ENV == "prod" or any(getattr(self, name) for name in whatsapp_names):
            for name in whatsapp_names:
                if not getattr(self, name):
                    missing.append(name)

        # Membership is an optional deploy-time capability and its plan ID is
        # also the kill switch. Partial configuration disables checkout through
        # membership_razorpay_ready(); it must not prevent a safe deployment.
        if self.RAZORPAY_MEMBERSHIP_AMOUNT_MINOR not in (None, 49_900):
            raise RuntimeError(
                "Invalid runtime configuration: RAZORPAY_MEMBERSHIP_AMOUNT_MINOR must be 49900"
            )
        if self.RAZORPAY_MEMBERSHIP_CURRENCY != "INR":
            raise RuntimeError(
                "Invalid runtime configuration: RAZORPAY_MEMBERSHIP_CURRENCY must be INR"
            )
        if (
            self.RAZORPAY_MEMBERSHIP_PLAN_ID
            and self.RAZORPAY_MEMBERSHIP_USD_PLAN_ID
            and self.RAZORPAY_MEMBERSHIP_PLAN_ID
            == self.RAZORPAY_MEMBERSHIP_USD_PLAN_ID
        ):
            raise RuntimeError(
                "Invalid runtime configuration: INR and USD membership plans must be distinct"
            )
        if (
            self.RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET
            and self.RAZORPAY_WEBHOOK_SECRET
            and self.RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET == self.RAZORPAY_WEBHOOK_SECRET
        ):
            raise RuntimeError(
                "Invalid runtime configuration: membership and cohort webhook secrets must be independent"
            )

        if missing:
            raise RuntimeError(
                "Missing required runtime configuration: " + ", ".join(sorted(missing))
            )

        if self.WHATSAPP_GRAPH_API_VERSION and not valid_graph_api_version(
            self.WHATSAPP_GRAPH_API_VERSION
        ):
            raise RuntimeError(
                "Invalid runtime configuration: "
                "WHATSAPP_GRAPH_API_VERSION must use the form v<major>.0"
            )
        if (
            self.WHATSAPP_BUSINESS_ACCOUNT_ID
            and not self.WHATSAPP_BUSINESS_ACCOUNT_ID.isdecimal()
        ):
            raise RuntimeError(
                "Invalid runtime configuration: WHATSAPP_BUSINESS_ACCOUNT_ID must be numeric"
            )
        if (
            self.WHATSAPP_PHONE_NUMBER_ID
            and not self.WHATSAPP_PHONE_NUMBER_ID.isdecimal()
        ):
            raise RuntimeError(
                "Invalid runtime configuration: WHATSAPP_PHONE_NUMBER_ID must be numeric"
            )
        if self.WHATSAPP_BUSINESS_NUMBER and not re.fullmatch(
            r"[1-9][0-9]{7,14}", self.WHATSAPP_BUSINESS_NUMBER
        ):
            raise RuntimeError(
                "Invalid runtime configuration: WHATSAPP_BUSINESS_NUMBER must be an international number without +"
            )
        for name in (
            "WHATSAPP_ACCESS_TOKEN",
            "WHATSAPP_APP_SECRET",
            "WHATSAPP_VERIFY_TOKEN",
            "CONSENT_PAIRING_SECRET",
        ):
            value = getattr(self, name)
            if value and len(value) < 32:
                raise RuntimeError(
                    f"Invalid runtime configuration: {name} must be at least 32 characters"
                )
        if (
            self.WHATSAPP_APP_SECRET
            and self.WHATSAPP_APP_SECRET == self.WHATSAPP_VERIFY_TOKEN
        ):
            raise RuntimeError(
                "Invalid runtime configuration: WhatsApp app and verify secrets must be independent"
            )

settings = Settings()
