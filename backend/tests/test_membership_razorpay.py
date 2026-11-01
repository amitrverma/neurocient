import hashlib
import hmac

from app.config import settings
from app.services.membership_razorpay import membership_razorpay_ready, verify_membership_webhook
from app.services.razorpay import razorpay_ready, verify_webhook_signature


def test_membership_webhook_signature_uses_exact_body_and_dedicated_secret(monkeypatch):
    body = b'{"event":"subscription.charged","amount":49900}'
    secret = "membership-secret"
    signature = hmac.new(secret.encode(), body, hashlib.sha256).hexdigest()
    monkeypatch.setattr(settings, "RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET", secret)
    monkeypatch.setattr(settings, "RAZORPAY_WEBHOOK_SECRET", "cohort-secret")

    assert verify_membership_webhook(body, signature) is True
    assert verify_membership_webhook(body + b" ", signature) is False
    assert verify_membership_webhook(body, None) is False

    cohort_signature = hmac.new(b"cohort-secret", body, hashlib.sha256).hexdigest()
    assert verify_membership_webhook(body, cohort_signature) is False
    assert verify_webhook_signature(body, cohort_signature) is True
    assert verify_webhook_signature(body, signature) is False


def test_membership_configuration_does_not_change_cohort_readiness(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_KEY_ID", "rzp_test_shared")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", "shared-key-secret")
    monkeypatch.setattr(settings, "RAZORPAY_WEBHOOK_SECRET", "cohort-secret")
    monkeypatch.setattr(settings, "RAZORPAY_MEMBERSHIP_PLAN_ID", None)
    monkeypatch.setattr(settings, "RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET", None)

    assert razorpay_ready() is True


def test_membership_readiness_requires_an_independent_webhook_secret(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_KEY_ID", "rzp_test_shared")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", "shared-key-secret")
    monkeypatch.setattr(settings, "RAZORPAY_WEBHOOK_SECRET", "same-secret")
    monkeypatch.setattr(settings, "RAZORPAY_MEMBERSHIP_PLAN_ID", "plan_monthly")
    monkeypatch.setattr(settings, "RAZORPAY_MEMBERSHIP_AMOUNT_MINOR", 49_900)
    monkeypatch.setattr(settings, "RAZORPAY_MEMBERSHIP_CURRENCY", "INR")
    monkeypatch.setattr(settings, "RAZORPAY_MEMBERSHIP_TOTAL_COUNT", 12)
    monkeypatch.setattr(settings, "RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET", "same-secret")

    assert membership_razorpay_ready() is False
