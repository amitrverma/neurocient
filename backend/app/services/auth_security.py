import hashlib


MIN_PASSWORD_LENGTH = 12
MAX_PASSWORD_LENGTH = 128
COMMON_PASSWORDS = {
    "123456789012",
    "letmein12345",
    "password1234",
    "qwerty123456",
}


def normalize_email(email: str) -> str:
    return email.strip().lower()


def validate_password(password: str) -> str:
    if not MIN_PASSWORD_LENGTH <= len(password) <= MAX_PASSWORD_LENGTH:
        raise ValueError(
            f"Password must contain {MIN_PASSWORD_LENGTH} to "
            f"{MAX_PASSWORD_LENGTH} characters"
        )
    if password.casefold() in COMMON_PASSWORDS:
        raise ValueError("Choose a less common password")
    return password


def digest_secret(secret: str) -> str:
    return hashlib.sha256(secret.encode("utf-8")).hexdigest()
