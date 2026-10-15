import os
from dotenv import load_dotenv

load_dotenv()


def _env_bool(name: str, default: bool = False) -> bool:
    value = os.getenv(name)
    if value is None:
        return default
    return value.strip().lower() in {"1", "true", "yes", "on"}


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
    ENABLE_SCHEDULER = _env_bool("ENABLE_SCHEDULER", default=False)

    def validate_for_startup(self) -> None:
        missing = []
        if not self.DATABASE_URL:
            missing.append("DATABASE_URL")

        if self.ENV == "prod":
            for name in ("JWT_SECRET", "OPENAI_API_KEY"):
                if not getattr(self, name):
                    missing.append(name)

        if missing:
            raise RuntimeError(
                "Missing required runtime configuration: " + ", ".join(sorted(missing))
            )

settings = Settings()
