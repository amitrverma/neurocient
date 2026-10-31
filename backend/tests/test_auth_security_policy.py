import pytest

from app.services.auth_security import (
    digest_secret,
    normalize_email,
    validate_password,
)
from app.utils.auth import hash_password, verify_password


@pytest.mark.parametrize(
    ("raw", "normalized"),
    [
        (" Person@Example.COM ", "person@example.com"),
        ("already.normal@example.com", "already.normal@example.com"),
    ],
)
def test_email_identity_is_trimmed_and_case_normalized(raw, normalized):
    assert normalize_email(raw) == normalized


@pytest.mark.parametrize(
    "password",
    [
        "short",
        "password1234",
        "a" * 129,
    ],
)
def test_password_policy_rejects_weak_or_unbounded_values(password):
    with pytest.raises(ValueError):
        validate_password(password)


def test_password_policy_allows_long_passphrases_without_composition_rules():
    assert validate_password("correct horse battery staple") == (
        "correct horse battery staple"
    )


def test_secret_digest_is_deterministic_without_retaining_raw_secret():
    secret = "one-time-secret"
    digest = digest_secret(secret)

    assert digest == digest_secret(secret)
    assert digest != secret
    assert len(digest) == 64


def test_password_hashing_preserves_long_unicode_passphrases():
    password = "correct horse battery staple \U0001f40e" * 4
    hashed = hash_password(password)

    assert hashed.startswith("$bcrypt-sha256$")
    assert verify_password(password, hashed)
