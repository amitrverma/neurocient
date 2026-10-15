import hashlib
import hmac

from app.config import settings
from app.services.razorpay import razorpay_ready, verify_webhook_signature


def test_webhook_signature_fails_closed_without_secret(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_WEBHOOK_SECRET", None)
    assert verify_webhook_signature(b"{}", "anything") is False


def test_webhook_signature_uses_exact_raw_body(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_WEBHOOK_SECRET", "test-secret")
    body = b'{"event":"payment.captured"}'
    signature = hmac.new(b"test-secret", body, hashlib.sha256).hexdigest()
    assert verify_webhook_signature(body, signature) is True
    assert verify_webhook_signature(body + b" ", signature) is False


def test_checkout_requires_all_provider_configuration(monkeypatch):
    monkeypatch.setattr(settings, "RAZORPAY_KEY_ID", "key")
    monkeypatch.setattr(settings, "RAZORPAY_KEY_SECRET", "secret")
    monkeypatch.setattr(settings, "RAZORPAY_WEBHOOK_SECRET", None)
    assert razorpay_ready() is False
    monkeypatch.setattr(settings, "RAZORPAY_WEBHOOK_SECRET", "webhook")
    assert razorpay_ready() is True
