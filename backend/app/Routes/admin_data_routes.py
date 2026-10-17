from datetime import UTC, datetime
from typing import Literal

from fastapi import APIRouter, Depends, Query
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import (
    Article,
    BehavioralNudge,
    CavemanScanSession,
    CavemanSpot,
    CohortEnrollment,
    IkeaWorksheet,
    MembershipEntitlement,
    MicrochallengeDefinition,
    MicrochallengeLog,
    NewsletterSubscriber,
    Participant,
    SavedArticle,
    User,
    UserMicrochallenge,
    UserPreferences,
    UserRole,
    Waitlist,
    WebPushSubscription,
    WeeklyReflection,
)
from app.services.admin import require_admin
from app.services.admin_data import auth_method, grouped_counts, iso, pagination, user_payload
from app.services.membership import ACTIVE_MEMBERSHIP_STATUSES

router = APIRouter()


def _search_clause(query: str | None, *columns):
    if not query or not query.strip():
        return None
    pattern = f"%{query.strip().lower()}%"
    return or_(*(func.lower(func.coalesce(column, "")).like(pattern) for column in columns))


@router.get("/admin/overview")
async def admin_overview(
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    now = datetime.now(UTC)
    statement = select(
        select(func.count(User.id)).scalar_subquery().label("users"),
        select(func.count(NewsletterSubscriber.id)).scalar_subquery().label("newsletter"),
        select(func.count(Participant.id)).scalar_subquery().label("participants"),
        select(func.count(Waitlist.id)).scalar_subquery().label("waitlist"),
        select(func.count(MembershipEntitlement.user_id)).where(
            MembershipEntitlement.status.in_(ACTIVE_MEMBERSHIP_STATUSES),
            MembershipEntitlement.current_period_end > now.replace(tzinfo=None),
        ).scalar_subquery().label("memberships"),
        select(func.count(CohortEnrollment.id)).where(CohortEnrollment.status == "paid").scalar_subquery().label("enrollments"),
        select(func.count(CavemanScanSession.id)).where(CavemanScanSession.status == "completed").scalar_subquery().label("scans"),
        select(func.count(CavemanSpot.id)).scalar_subquery().label("spots"),
        select(func.count(IkeaWorksheet.id)).where(IkeaWorksheet.status == "active").scalar_subquery().label("practice"),
        select(func.count(UserMicrochallenge.id)).where(UserMicrochallenge.status == "active").scalar_subquery().label("challenges"),
        select(func.count(SavedArticle.id)).scalar_subquery().label("saved"),
        select(func.count(WeeklyReflection.id)).scalar_subquery().label("reflections"),
        select(func.count(func.distinct(WebPushSubscription.user_id))).scalar_subquery().label("push_users"),
        select(func.count(UserPreferences.id)).where(UserPreferences.whatsapp_verified.is_(True)).scalar_subquery().label("whatsapp_users"),
        select(func.count(Article.id)).scalar_subquery().label("articles"),
        select(func.count(BehavioralNudge.id)).where(BehavioralNudge.is_active.is_(True)).scalar_subquery().label("nudges"),
        select(func.count(MicrochallengeDefinition.id)).scalar_subquery().label("challenge_definitions"),
    )
    row = (await db.execute(statement)).one()._mapping
    return {
        "generated_at": now.isoformat(),
        "audience": {
            "registered_users": row["users"],
            "newsletter_subscribers": row["newsletter"],
            "preview_participants": row["participants"],
            "login_waitlist": row["waitlist"],
        },
        "access": {
            "active_memberships": row["memberships"],
            "paid_program_enrollments": row["enrollments"],
        },
        "activity": {
            "completed_scans": row["scans"],
            "spots": row["spots"],
            "active_practices": row["practice"],
            "active_microchallenges": row["challenges"],
            "saved_insights": row["saved"],
            "weekly_reflections": row["reflections"],
        },
        "delivery": {
            "push_users": row["push_users"],
            "verified_whatsapp_users": row["whatsapp_users"],
        },
        "content": {
            "articles": row["articles"],
            "active_nudges": row["nudges"],
            "microchallenges": row["challenge_definitions"],
        },
    }


@router.get("/admin/users")
async def admin_users(
    query: str | None = Query(default=None, max_length=200),
    page: int = Query(default=1),
    page_size: int = Query(default=25),
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    page, page_size, offset = pagination(page, page_size)
    search = _search_clause(query, User.email, User.name)
    criteria = [search] if search is not None else []
    total = (await db.execute(select(func.count(User.id)).where(*criteria))).scalar_one()
    users = list((await db.execute(
        select(User).where(*criteria).order_by(User.created_at.desc()).offset(offset).limit(page_size)
    )).scalars().all())
    user_ids = [user.id for user in users]

    roles: dict = {user_id: [] for user_id in user_ids}
    if user_ids:
        for user_id, role in (await db.execute(select(UserRole.user_id, UserRole.role).where(UserRole.user_id.in_(user_ids)))).all():
            roles[user_id].append(role)
    memberships = {
        item.user_id: item for item in (await db.execute(
            select(MembershipEntitlement).where(MembershipEntitlement.user_id.in_(user_ids))
        )).scalars().all()
    } if user_ids else {}

    activity_maps = {
        "completed_scans": await grouped_counts(db, CavemanScanSession, CavemanScanSession.user_id, user_ids, CavemanScanSession.status == "completed"),
        "spots": await grouped_counts(db, CavemanSpot, CavemanSpot.user_id, user_ids),
        "practices": await grouped_counts(db, IkeaWorksheet, IkeaWorksheet.user_id, user_ids),
        "microchallenges": await grouped_counts(db, UserMicrochallenge, UserMicrochallenge.user_id, user_ids),
        "saved_insights": await grouped_counts(db, SavedArticle, SavedArticle.user_id, user_ids),
    }
    push_devices = await grouped_counts(db, WebPushSubscription, WebPushSubscription.user_id, user_ids)
    preferences = {
        item.user_id: item for item in (await db.execute(
            select(UserPreferences).where(UserPreferences.user_id.in_(user_ids))
        )).scalars().all()
    } if user_ids else {}

    items = []
    for user in users:
        preference = preferences.get(user.id)
        items.append(user_payload(
            user,
            roles=roles[user.id],
            membership=memberships.get(user.id),
            activity={key: counts.get(user.id, 0) for key, counts in activity_maps.items()},
            delivery={
                "push_devices": push_devices.get(user.id, 0),
                "whatsapp_enabled": bool(preference and preference.whatsapp_number),
                "whatsapp_verified": bool(preference and preference.whatsapp_verified),
            },
        ))
    return {"items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/admin/newsletter")
async def admin_newsletter(
    query: str | None = Query(default=None, max_length=200),
    page: int = Query(default=1),
    page_size: int = Query(default=50),
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    page, page_size, offset = pagination(page, page_size)
    search = _search_clause(query, NewsletterSubscriber.email)
    criteria = [search] if search is not None else []
    total = (await db.execute(select(func.count(NewsletterSubscriber.id)).where(*criteria))).scalar_one()
    subscribers = (await db.execute(
        select(NewsletterSubscriber).where(*criteria)
        .order_by(NewsletterSubscriber.created_at.desc()).offset(offset).limit(page_size)
    )).scalars().all()
    return {
        "items": [{"id": str(item.id), "email": item.email, "created_at": iso(item.created_at)} for item in subscribers],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/admin/memberships")
async def admin_memberships(
    status: str | None = Query(default=None, max_length=50),
    query: str | None = Query(default=None, max_length=200),
    page: int = Query(default=1),
    page_size: int = Query(default=25),
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    page, page_size, offset = pagination(page, page_size)
    criteria = []
    search = _search_clause(query, User.email, User.name)
    if search is not None:
        criteria.append(search)
    if status:
        criteria.append(MembershipEntitlement.status == status)
    base = select(MembershipEntitlement, User).join(User, User.id == MembershipEntitlement.user_id).where(*criteria)
    total = (await db.execute(
        select(func.count(MembershipEntitlement.user_id)).join(User, User.id == MembershipEntitlement.user_id).where(*criteria)
    )).scalar_one()
    rows = (await db.execute(
        base.order_by(MembershipEntitlement.updated_at.desc()).offset(offset).limit(page_size)
    )).all()
    return {
        "items": [{
            "user_id": str(item.user_id),
            "email": user.email,
            "name": user.name,
            "status": item.status,
            "provider": item.provider,
            "current_period_end": iso(item.current_period_end),
            "updated_at": iso(item.updated_at),
        } for item, user in rows],
        "total": total,
        "page": page,
        "page_size": page_size,
    }


@router.get("/admin/access")
async def admin_access(
    kind: Literal["participants", "waitlist"] = "participants",
    query: str | None = Query(default=None, max_length=200),
    page: int = Query(default=1),
    page_size: int = Query(default=25),
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    page, page_size, offset = pagination(page, page_size)
    if kind == "participants":
        search = _search_clause(query, Participant.email, Participant.cohort)
        criteria = [search] if search is not None else []
        total = (await db.execute(select(func.count(Participant.id)).where(*criteria))).scalar_one()
        records = (await db.execute(
            select(Participant).where(*criteria).order_by(Participant.joined_on.desc()).offset(offset).limit(page_size)
        )).scalars().all()
        items = [{
            "id": str(item.id), "email": item.email, "cohort": item.cohort,
            "created_at": iso(item.joined_on),
        } for item in records]
    else:
        search = _search_clause(query, Waitlist.email, Waitlist.name)
        criteria = [search] if search is not None else []
        total = (await db.execute(select(func.count(Waitlist.id)).where(*criteria))).scalar_one()
        records = (await db.execute(
            select(Waitlist).where(*criteria).order_by(Waitlist.created_at.desc()).offset(offset).limit(page_size)
        )).scalars().all()
        items = [{
            "id": str(item.id), "email": item.email, "name": item.name,
            "created_at": iso(item.created_at),
        } for item in records]
    return {"kind": kind, "items": items, "total": total, "page": page, "page_size": page_size}


@router.get("/admin/content")
async def admin_content(
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    articles = (await db.execute(select(Article).order_by(Article.read_count.desc(), Article.title))).scalars().all()
    nudges = (await db.execute(select(BehavioralNudge).order_by(BehavioralNudge.created_at.desc()))).scalars().all()
    challenge_rows = (await db.execute(
        select(
            MicrochallengeDefinition,
            select(func.count(UserMicrochallenge.id))
            .where(UserMicrochallenge.challenge_id == MicrochallengeDefinition.id)
            .correlate(MicrochallengeDefinition)
            .scalar_subquery()
            .label("assignment_count"),
        ).order_by(MicrochallengeDefinition.created_at.desc())
    )).all()
    return {
        "articles": [{
            "id": str(item.id), "slug": item.slug, "title": item.title,
            "read_count": item.read_count or 0, "save_count": item.save_count or 0,
            "updated_at": iso(item.updated_at),
        } for item in articles],
        "nudges": [{
            "id": str(item.id), "title": item.title or "Untitled nudge",
            "is_active": bool(item.is_active), "created_at": iso(item.created_at),
        } for item in nudges],
        "microchallenges": [{
            "id": str(item.id), "title": item.title,
            "assignment_count": assignment_count,
            "created_at": iso(item.created_at),
        } for item, assignment_count in challenge_rows],
    }


__all__ = ["auth_method", "pagination", "user_payload"]
