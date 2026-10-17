from collections.abc import Iterable
from datetime import datetime
from typing import Any

from sqlalchemy import func, select

from app.services.membership import entitlement_is_active


def pagination(page: int, page_size: int) -> tuple[int, int, int]:
    safe_page = max(page, 1)
    safe_page_size = min(max(page_size, 1), 100)
    return safe_page, safe_page_size, (safe_page - 1) * safe_page_size


def iso(value: datetime | None) -> str | None:
    return value.isoformat() if value else None


def auth_method(user: Any) -> str:
    if user.password_hash and user.google_id:
        return "password + Google"
    if user.google_id:
        return "Google"
    if user.password_hash:
        return "password"
    return "unknown"


def user_payload(
    user: Any,
    *,
    roles: list[str],
    membership: Any | None,
    activity: dict[str, int],
    delivery: dict[str, Any],
) -> dict[str, Any]:
    return {
        "id": str(user.id),
        "email": user.email,
        "name": user.name,
        "created_at": iso(user.created_at),
        "auth_method": auth_method(user),
        "roles": roles,
        "membership": {
            "status": membership.status if membership else "inactive",
            "is_active": entitlement_is_active(membership),
            "current_period_end": iso(membership.current_period_end) if membership else None,
        },
        "activity": activity,
        "delivery": delivery,
    }


async def grouped_counts(db, model, key_column, user_ids: Iterable, *criteria) -> dict:
    ids = list(user_ids)
    if not ids:
        return {}
    statement = (
        select(key_column, func.count(model.id))
        .where(key_column.in_(ids), *criteria)
        .group_by(key_column)
    )
    result = await db.execute(statement)
    return {user_id: count for user_id, count in result.all()}
