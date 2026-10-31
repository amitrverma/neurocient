from fastapi import APIRouter, Depends, HTTPException, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from sqlalchemy import delete, func, text
from app.database import get_db
from app.models import Article, ArticleAccessGrant, SavedArticle, User
from app.utils.auth import get_current_user, get_optional_user
import uuid
from datetime import datetime
from app.analytics.posthog_client import track_event
from app.services.membership import (
    decide_article_access,
    has_active_membership,
    lock_account_access,
    membership_required_detail,
)

router = APIRouter()

GUEST_ACCESS_COOKIE = "guest_access_id"
GUEST_ARTICLE_LIMIT = 5
ACCOUNT_ARTICLE_LIMIT = 20
ARTICLE_ACCESS_REQUEST_HEADER = "x-neurocient-access-request"


def guest_identity_required_detail() -> dict:
    return {
        "code": "guest_identity_required",
        "message": "A valid guest identity is required to open this Insight.",
    }


@router.post("/{slug}/access")
async def grant_article_access(
    slug: str,
    request: Request,
    db: AsyncSession = Depends(get_db),
    current_user: User | None = Depends(get_optional_user),
):
    """Grant access before the frontend compiles or returns full MDX."""

    if request.headers.get(ARTICLE_ACCESS_REQUEST_HEADER) != "insight-page":
        raise HTTPException(status_code=403, detail="Access request not permitted")

    normalized_slug = slug.strip().lower()
    if not normalized_slug or len(normalized_slug) > 200:
        raise HTTPException(status_code=404, detail="Insight not found")

    user_id = current_user.id if current_user else None
    guest_id = None
    if user_id:
        await lock_account_access(db, user_id)
        membership_active = await has_active_membership(db, user_id)
        limit = ACCOUNT_ARTICLE_LIMIT
        identity_filter = ArticleAccessGrant.user_id == user_id
    else:
        try:
            guest_id = uuid.UUID(request.cookies.get(GUEST_ACCESS_COOKIE, ""))
        except (ValueError, AttributeError):
            raise HTTPException(
                status_code=400,
                detail=guest_identity_required_detail(),
            )
        await db.execute(
            text(
                "select pg_advisory_xact_lock("
                "hashtextextended(:guest_identity, 0))"
            ),
            {"guest_identity": f"article-access:{guest_id}"},
        )
        membership_active = False
        limit = GUEST_ARTICLE_LIMIT
        identity_filter = ArticleAccessGrant.guest_id == guest_id

    existing = await db.scalar(
        select(ArticleAccessGrant.id).where(
            identity_filter,
            ArticleAccessGrant.article_slug == normalized_slug,
        )
    )
    used = await db.scalar(
        select(func.count(ArticleAccessGrant.id)).where(identity_filter)
    )
    decision = decide_article_access(
        membership_active=membership_active,
        already_granted=existing is not None,
        used=used or 0,
        limit=limit,
    )

    if not decision.granted:
        detail = membership_required_detail("articles", limit)
        detail["remaining"] = 0
        if current_user is None:
            detail.update(
                {
                    "code": "account_required",
                    "next_action": "sign_in",
                    "message": (
                        "You have read five free Insights. Sign in to continue "
                        "with a free account."
                    ),
                }
            )
        else:
            detail["next_action"] = "membership"
        raise HTTPException(status_code=402, detail=detail)

    if decision.consume:
        db.add(
            ArticleAccessGrant(
                article_slug=normalized_slug,
                user_id=user_id,
                guest_id=guest_id,
            )
        )
        await db.commit()

    return {
        "granted": True,
        "membership_active": membership_active,
        "remaining": decision.remaining,
    }

# ✅ Save article
@router.post("/save/{slug}")
async def save_article(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # get article by slug
    result = await db.execute(select(Article).where(Article.slug == slug))
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    # check if already saved
    result = await db.execute(
        select(SavedArticle).where(
            SavedArticle.user_id == current_user.id,
            SavedArticle.article_id == article.id,
        )
    )
    existing = result.scalar_one_or_none()
    if existing:
        return {"status": "already_saved"}

    saved = SavedArticle(
        id=uuid.uuid4(),
        user_id=current_user.id,
        article_id=article.id,
        created_at=datetime.utcnow(),
    )
    db.add(saved)
    article.save_count += 1  # ✅ increment global counter
    await db.commit()
    track_event(str(current_user.id), "article_saved", {"slug": slug})

    return {"status": "saved", "save_count": article.save_count}


# ✅ Get saved articles for current user
@router.get("/saved")
async def get_saved_articles(
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    # join to fetch metadata
    result = await db.execute(
        select(Article)
        .join(SavedArticle, SavedArticle.article_id == Article.id)
        .where(SavedArticle.user_id == current_user.id)
        .order_by(SavedArticle.created_at.desc())
    )
    articles = result.scalars().all()

    return {
        "saved": [
            {
                "slug": a.slug,
                "title": a.title,
                "excerpt": a.excerpt,
                "read_count": a.read_count,
                "save_count": a.save_count,
            }
            for a in articles
        ]
    }


# ✅ Unsave article
@router.delete("/save/{slug}")
async def unsave_article(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Article).where(Article.slug == slug))
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    # delete the SavedArticle entry
    q = await db.execute(
        select(SavedArticle).where(
            SavedArticle.user_id == current_user.id,
            SavedArticle.article_id == article.id,
        )
    )
    saved = q.scalar_one_or_none()
    if not saved:
        raise HTTPException(status_code=404, detail="Not saved")

    await db.delete(saved)
    article.save_count = max(0, article.save_count - 1)  # ✅ decrement safely
    await db.commit()
    track_event(str(current_user.id), "article_unsaved", {"slug": slug})

    return {"status": "removed", "save_count": article.save_count}


# ✅ Check if current user saved a specific article
@router.get("/saved/{slug}")
async def is_article_saved(
    slug: str,
    db: AsyncSession = Depends(get_db),
    current_user: User = Depends(get_current_user),
):
    result = await db.execute(select(Article).where(Article.slug == slug))
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(status_code=404, detail="Article not found")

    q = await db.execute(
        select(SavedArticle).where(
            SavedArticle.user_id == current_user.id,
            SavedArticle.article_id == article.id,
        )
    )
    saved = q.scalar_one_or_none()

    return {"isSaved": bool(saved)}

# ✅ Get top read articles
@router.get("/top")
async def get_top_articles(
    limit: int = 3,
    db: AsyncSession = Depends(get_db),
):
    result = await db.execute(
        select(Article).order_by(Article.read_count.desc()).limit(limit)
    )
    articles = result.scalars().all()

    return [
        {
            "slug": a.slug,
            "title": a.title,
            "excerpt": a.excerpt,
            "read_count": a.read_count,
            "save_count": a.save_count,
        }
        for a in articles
    ]

@router.post("/{slug}/read")
async def increment_article_read(slug: str, db: AsyncSession = Depends(get_db)):
    result = await db.execute(select(Article).where(Article.slug == slug))
    article = result.scalar_one_or_none()
    if not article:
        raise HTTPException(404, "Article not found")

    article.read_count += 1
    article.updated_at = datetime.utcnow()
    await db.commit()
    track_event(None, "article_read", {"slug": slug})
    return {"slug": slug, "read_count": article.read_count}
