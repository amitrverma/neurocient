from passlib.context import CryptContext
from dataclasses import dataclass
from datetime import UTC, datetime, timedelta
import hmac
from jose import JWTError, jwt
from fastapi import Depends, HTTPException, status, Request, Response
from fastapi.security import HTTPBearer, HTTPAuthorizationCredentials
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy import update
from sqlalchemy.future import select
from app.database import get_db
from app.models import AuthSession, User
from app.config import settings
from app.services.auth_security import digest_secret
import os
from typing import Optional
from uuid import UUID, uuid4

pwd_context = CryptContext(
    schemes=["bcrypt_sha256", "bcrypt"],
    deprecated=["bcrypt"],
)

# ------------------------
# Config
# ------------------------
SECRET_KEY = settings.JWT_SECRET or "super-secret-key"
ALGORITHM = "HS256"
ACCESS_TOKEN_EXPIRE_MINUTES = 15
REFRESH_TOKEN_EXPIRE_DAYS = 30
REFRESH_REPLAY_GRACE_SECONDS = 3

ENV = settings.ENV

# Domain setup
raw_domain = os.getenv("COOKIE_DOMAIN", None)
COOKIE_DOMAIN = None if raw_domain in (None, "None", "localhost") else raw_domain

# Cookie flags
if ENV == "prod":
    COOKIE_SECURE = True
    COOKIE_SAMESITE = "None"
else:  # local dev
    COOKIE_SECURE = False
    COOKIE_SAMESITE = "Lax"

# ------------------------
# Password hashing
# ------------------------
def hash_password(password: str) -> str:
    return pwd_context.hash(password)

def verify_password(plain: str, hashed: str) -> bool:
    return pwd_context.verify(plain, hashed)

# ------------------------
# JWT handling
# ------------------------
def _utcnow() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def create_access_token(
    data: dict,
    expires_delta: timedelta | None = None,
    session_id: UUID | str | None = None,
) -> str:
    to_encode = data.copy()
    expire = _utcnow() + (
        expires_delta or timedelta(minutes=ACCESS_TOKEN_EXPIRE_MINUTES)
    )
    if session_id is not None:
        to_encode["sid"] = str(session_id)
    to_encode.update({"exp": expire, "typ": "access"})
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)


def create_refresh_token(
    user_id: str,
    session_id: UUID | str | None = None,
    family_id: UUID | str | None = None,
) -> str:
    expire = _utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS)
    to_encode = {"sub": user_id, "exp": expire, "typ": "refresh"}
    if session_id is not None:
        to_encode["sid"] = str(session_id)
    if family_id is not None:
        to_encode["fid"] = str(family_id)
    return jwt.encode(to_encode, SECRET_KEY, algorithm=ALGORITHM)

def decode_token(token: str):
    try:
        return jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
    except JWTError:
        return None

# ------------------------
# Stateful sessions and cookie helpers
# ------------------------
@dataclass(frozen=True)
class SessionTokens:
    access: str
    refresh: str
    session_id: UUID
    family_id: UUID


class SessionCredentialError(Exception):
    def __init__(self, code: str):
        super().__init__(code)
        self.code = code


def _session_tokens(user_id: UUID, session_id: UUID, family_id: UUID) -> SessionTokens:
    return SessionTokens(
        access=create_access_token(
            {"sub": str(user_id)},
            session_id=session_id,
        ),
        refresh=create_refresh_token(
            str(user_id),
            session_id=session_id,
            family_id=family_id,
        ),
        session_id=session_id,
        family_id=family_id,
    )


async def issue_session(
    db: AsyncSession,
    user_id: UUID,
    *,
    family_id: UUID | None = None,
) -> SessionTokens:
    session_id = uuid4()
    resolved_family_id = family_id or uuid4()
    tokens = _session_tokens(user_id, session_id, resolved_family_id)
    db.add(
        AuthSession(
            id=session_id,
            user_id=user_id,
            family_id=resolved_family_id,
            refresh_token_hash=digest_secret(tokens.refresh),
            expires_at=_utcnow() + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        )
    )
    await db.commit()
    return tokens


def set_auth_cookies(resp: Response, tokens: SessionTokens) -> None:
    """Set access, rotating refresh, and readable session-hint cookies."""

    resp.set_cookie(
        key="access_token",
        value=tokens.access,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        domain=COOKIE_DOMAIN,
        path="/",
        max_age=ACCESS_TOKEN_EXPIRE_MINUTES * 60,
    )
    resp.set_cookie(
        key="refresh_token",
        value=tokens.refresh,
        httponly=True,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        domain=COOKIE_DOMAIN,
        path="/",
        max_age=REFRESH_TOKEN_EXPIRE_DAYS * 24 * 60 * 60,
    )
    resp.set_cookie(
        key="session_present",  # readable by frontend/middleware
        value="1",
        httponly=False,
        secure=COOKIE_SECURE,
        samesite=COOKIE_SAMESITE,
        domain=COOKIE_DOMAIN,
        path="/",
    )


async def _revoke_family(
    db: AsyncSession,
    family_id: UUID,
    *,
    reason: str,
) -> None:
    await db.execute(
        update(AuthSession)
        .where(
            AuthSession.family_id == family_id,
            AuthSession.revoked_at.is_(None),
        )
        .values(revoked_at=_utcnow(), revocation_reason=reason)
    )


async def rotate_refresh_session(
    db: AsyncSession,
    raw_refresh_token: str,
) -> tuple[UUID, SessionTokens]:
    try:
        payload = jwt.decode(raw_refresh_token, SECRET_KEY, algorithms=[ALGORITHM])
        if payload.get("typ") != "refresh":
            raise SessionCredentialError("invalid_refresh")
        user_id = UUID(str(payload.get("sub")))
        session_id = UUID(str(payload.get("sid")))
        family_id = UUID(str(payload.get("fid")))
    except (JWTError, ValueError, TypeError, AttributeError):
        raise SessionCredentialError("invalid_refresh")

    session = await db.scalar(
        select(AuthSession)
        .where(AuthSession.id == session_id)
        .with_for_update()
    )
    if session is None or session.user_id != user_id or session.family_id != family_id:
        raise SessionCredentialError("invalid_refresh")

    token_matches = hmac.compare_digest(
        session.refresh_token_hash,
        digest_secret(raw_refresh_token),
    )
    now = _utcnow()
    if (
        token_matches
        and session.revocation_reason == "rotated"
        and session.revoked_at is not None
        and now - session.revoked_at <= timedelta(seconds=REFRESH_REPLAY_GRACE_SECONDS)
    ):
        raise SessionCredentialError("refresh_conflict")

    if session.revoked_at is not None or session.replaced_by_id is not None or not token_matches:
        await _revoke_family(db, family_id, reason="refresh_replay")
        await db.commit()
        raise SessionCredentialError("refresh_replayed")

    if session.expires_at <= now:
        session.revoked_at = now
        session.revocation_reason = "expired"
        await db.commit()
        raise SessionCredentialError("expired_refresh")

    replacement_id = uuid4()
    replacement_tokens = _session_tokens(user_id, replacement_id, family_id)
    db.add(
        AuthSession(
            id=replacement_id,
            user_id=user_id,
            family_id=family_id,
            refresh_token_hash=digest_secret(replacement_tokens.refresh),
            expires_at=now + timedelta(days=REFRESH_TOKEN_EXPIRE_DAYS),
        )
    )
    await db.flush()
    session.revoked_at = now
    session.revocation_reason = "rotated"
    session.replaced_by_id = replacement_id
    session.last_used_at = now
    await db.commit()
    return user_id, replacement_tokens


async def revoke_all_user_sessions(
    db: AsyncSession,
    user_id: UUID,
    *,
    reason: str,
) -> None:
    await db.execute(
        update(AuthSession)
        .where(
            AuthSession.user_id == user_id,
            AuthSession.revoked_at.is_(None),
        )
        .values(revoked_at=_utcnow(), revocation_reason=reason)
    )


async def revoke_request_session(db: AsyncSession, req: Request) -> None:
    session_ids: set[UUID] = set()
    for raw_token in (
        req.cookies.get("refresh_token"),
        req.cookies.get("access_token"),
    ):
        if not raw_token:
            continue
        try:
            payload = jwt.decode(
                raw_token,
                SECRET_KEY,
                algorithms=[ALGORITHM],
                options={"verify_exp": False},
            )
            session_ids.add(UUID(str(payload.get("sid"))))
        except (JWTError, ValueError, TypeError, AttributeError):
            continue

    changed = False
    for session_id in session_ids:
        session = await db.get(AuthSession, session_id)
        if session and session.revoked_at is None:
            session.revoked_at = _utcnow()
            session.revocation_reason = "logout"
            changed = True
    if changed:
        await db.commit()

def clear_auth_cookies(resp: Response):
    """Clear all auth cookies."""
    for key in ["access_token", "refresh_token", "session_present"]:
        resp.delete_cookie(key, domain=COOKIE_DOMAIN, path="/")

def get_token_from_cookies(req: Request) -> Optional[str]:
    return req.cookies.get("access_token")

# ------------------------
# Security dependency
# ------------------------
security = HTTPBearer(auto_error=False)

async def _resolve_access_token_user(token: str, db: AsyncSession) -> User:
    try:
        payload = jwt.decode(token, SECRET_KEY, algorithms=[ALGORITHM])
        user_id = payload.get("sub")
        session_id = payload.get("sid")

        if not user_id or not session_id or payload.get("typ") != "access":
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid token")

        try:
            normalized_user_id = UUID(str(user_id))
            normalized_session_id = UUID(str(session_id))
        except (ValueError, TypeError, AttributeError):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Invalid token",
            )

        result = await db.execute(
            select(User)
            .join(AuthSession, AuthSession.user_id == User.id)
            .where(
                User.id == normalized_user_id,
                AuthSession.id == normalized_session_id,
                AuthSession.revoked_at.is_(None),
                AuthSession.expires_at > _utcnow(),
            )
        )
        user = result.scalar_one_or_none()
        if not user:
            raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="User not found")

        return user
    except JWTError:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Invalid or expired token")


def _request_access_token(
    credentials: HTTPAuthorizationCredentials | None,
    req: Request,
) -> str | None:
    if credentials:
        return credentials.credentials
    return get_token_from_cookies(req)


async def get_optional_user(
    req: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User | None:
    """Resolve an account when present; reject invalid presented credentials."""

    token = _request_access_token(credentials, req)
    if not token:
        if req.cookies.get("refresh_token") or req.cookies.get("session_present"):
            raise HTTPException(
                status_code=status.HTTP_401_UNAUTHORIZED,
                detail="Session refresh required",
            )
        return None
    return await _resolve_access_token_user(token, db)


async def get_current_user(
    req: Request,
    credentials: HTTPAuthorizationCredentials | None = Depends(security),
    db: AsyncSession = Depends(get_db),
) -> User:
    """Extract the current user from a Bearer token or HttpOnly cookie."""

    user = await get_optional_user(req, credentials, db)
    if user is None:
        raise HTTPException(
            status_code=status.HTTP_401_UNAUTHORIZED,
            detail="Not authenticated",
        )
    return user
