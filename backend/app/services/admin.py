from fastapi import Depends, HTTPException, status
from sqlalchemy import select
from sqlalchemy.ext.asyncio import AsyncSession

from app.config import settings
from app.database import get_db
from app.models import User, UserRole
from app.utils.auth import get_current_user


def is_configured_admin_email(email: str) -> bool:
    return email.strip().lower() == settings.ADMIN_EMAIL


def admin_self_registration_allowed() -> bool:
    """Local bootstrap only; deployed environments must provision the account."""
    return settings.ENV in {"dev", "development", "local", "test"}


async def roles_for_user(db: AsyncSession, user_id) -> list[str]:
    result = await db.execute(select(UserRole.role).where(UserRole.user_id == user_id))
    return list(result.scalars().all())


async def provision_configured_admin(db: AsyncSession, user: User) -> bool:
    """Grant the configured bootstrap role only after password authentication."""
    if not is_configured_admin_email(user.email):
        return False
    result = await db.execute(
        select(UserRole).where(UserRole.user_id == user.id, UserRole.role == "admin")
    )
    if result.scalar_one_or_none():
        return False
    db.add(UserRole(user_id=user.id, role="admin"))
    await db.commit()
    return True


async def require_admin(
    current_user: User = Depends(get_current_user),
    db: AsyncSession = Depends(get_db),
) -> User:
    roles = await roles_for_user(db, current_user.id)
    if "admin" not in roles:
        raise HTTPException(status_code=status.HTTP_403_FORBIDDEN, detail="Admin access required")
    return current_user
