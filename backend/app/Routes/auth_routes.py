from datetime import UTC, datetime, timedelta
import secrets

from fastapi import APIRouter, BackgroundTasks, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import func, update
from fastapi.responses import JSONResponse
from app.database import get_db
from app.models import (
    PasswordResetToken,
    User,
    Waitlist,
    Participant,
    UserPreferences,
)
from app.utils.auth import (
    SessionCredentialError,
    hash_password,
    verify_password,
    get_current_user,
    issue_session,
    revoke_all_user_sessions,
    revoke_request_session,
    rotate_refresh_session,
    set_auth_cookies,
    clear_auth_cookies,
)
from pydantic import BaseModel, EmailStr, Field
import uuid
import json
import os
from firebase_admin import auth as firebase_auth, credentials, initialize_app
from app.analytics.posthog_client import track_event, identify_user
from app.services.membership import membership_summary
from app.services.auth_security import digest_secret, normalize_email, validate_password
from app.services.password_reset_email import send_password_reset_email
from app.services.rate_limits import (
    credential_digest,
    enforce,
    request_rules,
)
from app.services.admin import (
    admin_self_registration_allowed,
    is_configured_admin_email,
    provision_configured_admin,
    roles_for_user,
)

# ---------------- Firebase init ----------------
firebase_creds_json = os.getenv("FIREBASE_CREDENTIALS_JSON")
firebase_creds_path = os.getenv("FIREBASE_CREDENTIALS_PATH")

if firebase_creds_json:
    try:
        json_dict = json.loads(firebase_creds_json)
        json_dict["private_key"] = json_dict["private_key"].replace("\\n", "\n")
        cred = credentials.Certificate(json_dict)
        initialize_app(cred)
    except Exception as e:
        raise RuntimeError("Failed to initialize Firebase Admin SDK from JSON string") from e

elif firebase_creds_path and os.path.exists(firebase_creds_path):
    try:
        cred = credentials.Certificate(firebase_creds_path)
        initialize_app(cred)
    except Exception as e:
        raise RuntimeError("Failed to initialize Firebase Admin SDK from file") from e
else:
    raise RuntimeError("Missing Firebase credentials")

# ---------------- Router ----------------
router = APIRouter()

class AuthRequest(BaseModel):
    email: EmailStr
    password: str = Field(min_length=1, max_length=128)


class PasswordResetRequest(BaseModel):
    email: EmailStr


class PasswordResetConfirm(BaseModel):
    token: str = Field(min_length=32, max_length=256)
    password: str = Field(min_length=1, max_length=128)

AUTH_REQUEST_HEADER = "x-neurocient-auth-request"
AUTH_REQUEST_VALUE = "browser-bff"
PASSWORD_RESET_MINUTES = 30
PASSWORD_RESET_COOLDOWN_SECONDS = 60


def require_auth_request(request: Request) -> None:
    if request.headers.get(AUTH_REQUEST_HEADER) != AUTH_REQUEST_VALUE:
        raise HTTPException(status_code=403, detail="Auth request not permitted")


def _validated_password(password: str) -> str:
    try:
        return validate_password(password)
    except ValueError as exc:
        raise HTTPException(status_code=422, detail=str(exc))


def _now() -> datetime:
    return datetime.now(UTC).replace(tzinfo=None)


def _verified_google_identity(decoded_token: dict) -> tuple[str, str, str]:
    email = decoded_token.get("email")
    uid = decoded_token.get("uid")
    firebase_claims = decoded_token.get("firebase")
    provider = (
        firebase_claims.get("sign_in_provider")
        if isinstance(firebase_claims, dict)
        else None
    )
    if (
        not isinstance(email, str)
        or not email.strip()
        or decoded_token.get("email_verified") is not True
        or provider != "google.com"
        or not isinstance(uid, str)
        or not uid
    ):
        raise HTTPException(status_code=401, detail="Unverified Google identity")

    name = decoded_token.get("name")
    return normalize_email(email), name if isinstance(name, str) else "Anonymous", uid

# ---------------- Signup ----------------
@router.post("/signup")
async def signup(
    req: AuthRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    require_auth_request(request)
    email = normalize_email(str(req.email))
    await enforce(
        db,
        request_rules(request, ("signup_email", email), ip_policy="signup_ip"),
    )
    password = _validated_password(req.password)
    is_admin_signup = is_configured_admin_email(email)
    if is_admin_signup and not admin_self_registration_allowed():
        raise HTTPException(status_code=403, detail="This address is reserved")
    result = await db.execute(select(User).where(func.lower(User.email) == email))
    existing = result.scalar_one_or_none()
    if existing:
        raise HTTPException(status_code=400, detail="Email already registered")

    user = User(id=uuid.uuid4(), email=email, password_hash=hash_password(password))
    db.add(user)
    await db.flush()

    # ✅ Create default preferences row
    prefs = UserPreferences(user_id=user.id)
    db.add(prefs)
    await db.commit()

    if is_admin_signup:
        await provision_configured_admin(db, user)
    roles = await roles_for_user(db, user.id)

    tokens = await issue_session(db, user.id)
    response = JSONResponse(
        content={
            "user": {"id": str(user.id), "email": user.email, "roles": roles},
        }
    )
    set_auth_cookies(response, tokens)

    identify_user(str(user.id), {"email": user.email})
    track_event(str(user.id), "user_signup")

    return response

# ---------------- Login ----------------
@router.post("/login")
async def login(
    req: AuthRequest,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    require_auth_request(request)
    email = normalize_email(str(req.email))
    await enforce(
        db,
        request_rules(request, ("login_email", email), ip_policy="login_ip"),
    )
    result = await db.execute(select(User).where(func.lower(User.email) == email))
    user = result.scalar_one_or_none()

    if not user or not user.password_hash:
        raise HTTPException(status_code=401, detail="Invalid credentials")
    if not verify_password(req.password, user.password_hash):
        raise HTTPException(status_code=401, detail="Invalid credentials")

    await provision_configured_admin(db, user)
    roles = await roles_for_user(db, user.id)

    tokens = await issue_session(db, user.id)
    response = JSONResponse(
        content={
            "user": {"id": str(user.id), "email": user.email, "roles": roles},
        }
    )
    set_auth_cookies(response, tokens)

    track_event(str(user.id), "user_login")
    return response

# ---------------- Me ----------------
@router.get("/me")
async def get_me(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
):
    roles = await roles_for_user(db, current_user.id)
    return {
        "id": str(current_user.id),
        "email": current_user.email,
        "name": current_user.name,
        "membership": await membership_summary(db, current_user.id),
        "roles": roles,
    }

@router.post("/refresh")
async def refresh(req: Request, db: AsyncSession = Depends(get_db)):
    require_auth_request(req)
    rt = req.cookies.get("refresh_token")
    rules = request_rules(req, ip_policy="refresh_ip")
    if rt:
        rules.append(("refresh_token", credential_digest(rt)))
    await enforce(db, rules)
    if not rt:
        raise HTTPException(status_code=401, detail="No refresh token")

    try:
        user_id, tokens = await rotate_refresh_session(db, rt)
    except SessionCredentialError as exc:
        if exc.code == "refresh_conflict":
            return JSONResponse(
                content={"detail": "Refresh already completed"},
                status_code=409,
            )
        response = JSONResponse(
            content={"detail": "Invalid or expired refresh"},
            status_code=401,
        )
        clear_auth_cookies(response)
        return response

    # ✅ Fetch user details from DB
    result = await db.execute(select(User).where(User.id == user_id))
    user = result.scalar_one_or_none()
    if not user:
        response = JSONResponse(content={"detail": "Invalid session"}, status_code=401)
        clear_auth_cookies(response)
        return response

    # ✅ Issue new cookies
    roles = await roles_for_user(db, user.id)
    response = JSONResponse(
        content={
            "ok": True,
            "user": {
                "id": str(user.id),
                "name": user.name,
                "email": user.email,
                "membership": await membership_summary(db, user.id),
                "roles": roles,
            },
        }
    )
    set_auth_cookies(response, tokens)

    return response

# ---------------- Logout ----------------
@router.post("/logout")
async def logout(req: Request, db: AsyncSession = Depends(get_db)):
    require_auth_request(req)
    await revoke_request_session(db, req)
    response = JSONResponse(content={"ok": True})
    clear_auth_cookies(response)
    return response


@router.post("/password-reset/request", status_code=202)
async def request_password_reset(
    payload: PasswordResetRequest,
    request: Request,
    background_tasks: BackgroundTasks,
    db: AsyncSession = Depends(get_db),
):
    require_auth_request(request)
    email = normalize_email(str(payload.email))
    await enforce(
        db,
        request_rules(
            request,
            ("reset_request_email", email),
            ip_policy="reset_request_ip",
        ),
    )
    user = await db.scalar(
        select(User).where(
            func.lower(User.email) == email,
            User.password_hash.is_not(None),
        )
    )

    if user is not None:
        now = _now()
        recent = await db.scalar(
            select(PasswordResetToken.id).where(
                PasswordResetToken.user_id == user.id,
                PasswordResetToken.created_at
                > now - timedelta(seconds=PASSWORD_RESET_COOLDOWN_SECONDS),
            )
        )
        if recent is None:
            await db.execute(
                update(PasswordResetToken)
                .where(
                    PasswordResetToken.user_id == user.id,
                    PasswordResetToken.used_at.is_(None),
                )
                .values(used_at=now)
            )
            raw_token = secrets.token_urlsafe(32)
            db.add(
                PasswordResetToken(
                    user_id=user.id,
                    token_hash=digest_secret(raw_token),
                    expires_at=now + timedelta(minutes=PASSWORD_RESET_MINUTES),
                )
            )
            await db.commit()
            background_tasks.add_task(send_password_reset_email, email, raw_token)

    return {
        "ok": True,
        "message": (
            "If that address can use password recovery, a reset link has been sent."
        ),
    }


@router.post("/password-reset/confirm")
async def confirm_password_reset(
    payload: PasswordResetConfirm,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    require_auth_request(request)
    await enforce(
        db,
        request_rules(
            request,
            ("reset_confirm_token", credential_digest(payload.token)),
            ip_policy="reset_confirm_ip",
        ),
    )
    password = _validated_password(payload.password)
    now = _now()
    reset_token = await db.scalar(
        select(PasswordResetToken)
        .where(PasswordResetToken.token_hash == digest_secret(payload.token))
        .with_for_update()
    )
    if (
        reset_token is None
        or reset_token.used_at is not None
        or reset_token.expires_at <= now
    ):
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")

    user = await db.get(User, reset_token.user_id)
    if user is None or not user.password_hash:
        raise HTTPException(status_code=400, detail="Invalid or expired reset link")

    user.password_hash = hash_password(password)
    reset_token.used_at = now
    await revoke_all_user_sessions(db, user.id, reason="password_reset")
    await db.commit()

    response = JSONResponse(
        content={"ok": True, "message": "Password updated. Sign in again."}
    )
    clear_auth_cookies(response)
    return response

# ---------------- Firebase Login ----------------
@router.post("/firebase-login")
async def firebase_login(request: Request, db: AsyncSession = Depends(get_db)):
    require_auth_request(request)
    try:
        body = await request.json()
        id_token = body.get("idToken")
        if not isinstance(id_token, str) or not id_token:
            raise HTTPException(status_code=400, detail="Missing idToken")
        if len(id_token) > 4096:
            raise HTTPException(status_code=422, detail="idToken is too long")
        await enforce(
            db,
            request_rules(
                request,
                ("firebase_token", credential_digest(id_token)),
                ip_policy="firebase_ip",
            ),
        )

        try:
            decoded_token = firebase_auth.verify_id_token(id_token, clock_skew_seconds=60)
        except firebase_auth.ExpiredIdTokenError:
            raise HTTPException(status_code=401, detail="Expired Firebase token")
        except firebase_auth.InvalidIdTokenError:
            raise HTTPException(status_code=401, detail="Invalid Firebase token")
        except Exception:
            raise HTTPException(status_code=401, detail="Firebase verification failed")

        email, name, google_id = _verified_google_identity(decoded_token)

        # Ensure participant exists
        stmt = select(Participant).where(func.lower(Participant.email) == email)
        result = await db.execute(stmt)
        participant = result.scalars().first()

        if participant:
            stmt = select(User).where(func.lower(User.email) == email)
            result = await db.execute(stmt)
            user = result.scalars().first()

            if user and user.google_id and user.google_id != google_id:
                raise HTTPException(status_code=401, detail="Google identity mismatch")

            if not user:
                user = User(id=uuid.uuid4(), email=email, name=name, google_id=google_id)
                db.add(user)
                await db.flush()

                # Create default preferences row for a newly provisioned user.
                prefs = UserPreferences(user_id=user.id)
                db.add(prefs)
                await db.commit()

            if user and not user.google_id:
                user.google_id = google_id
                await db.commit()
                await db.refresh(user)

            tokens = await issue_session(db, user.id)
            response = JSONResponse(
                content={
                    "user": {"id": str(user.id), "name": user.name, "email": user.email},
                }
            )
            set_auth_cookies(response, tokens)

            track_event(str(user.id), "user_login", {"method": "firebase"})
            return response

        # If not participant, put on waitlist
        stmt = select(Waitlist).where(func.lower(Waitlist.email) == email)
        result = await db.execute(stmt)
        existing = result.scalars().first()

        if not existing:
            waitlist_entry = Waitlist(email=email, name=name)
            db.add(waitlist_entry)
            await db.commit()

        track_event(email, "firebase_preview")
        return JSONResponse(
            content={"user": {"name": name, "email": email}, "preview": True}
        )

    except HTTPException:
        raise
    except Exception:
        raise HTTPException(status_code=500, detail="Server error during Firebase login")
