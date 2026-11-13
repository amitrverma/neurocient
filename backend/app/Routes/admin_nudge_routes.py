from datetime import date
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Query, status
from pydantic import AnyHttpUrl, BaseModel, Field, field_validator, model_validator
from sqlalchemy import func, or_, select
from sqlalchemy.ext.asyncio import AsyncSession

from app.database import get_db
from app.models import AdminAuditEvent, BehavioralNudge, DailyNudgeSelection, User
from app.services.admin import require_admin
from app.services.admin_data import iso, pagination
from app.services.product_clock import product_today
from app.services.whatsapp_content import bounded_whatsapp_message, truncate_whatsapp_text


router = APIRouter(prefix="/admin/nudges")


class NudgeInput(BaseModel):
    title: str = Field(min_length=1, max_length=300)
    paragraphs: list[str] = Field(default_factory=list, max_length=10)
    quote: str | None = Field(default=None, max_length=1_000)
    link: AnyHttpUrl | None = None
    is_active: bool = True

    @field_validator("title")
    @classmethod
    def normalize_title(cls, value: str) -> str:
        normalized = value.strip()
        if not normalized:
            raise ValueError("Title is required")
        return normalized

    @field_validator("paragraphs")
    @classmethod
    def normalize_paragraphs(cls, value: list[str]) -> list[str]:
        normalized = [paragraph.strip() for paragraph in value if paragraph.strip()]
        if any(len(paragraph) > 1_000 for paragraph in normalized):
            raise ValueError("Each paragraph must be at most 1000 characters")
        return normalized

    @field_validator("quote")
    @classmethod
    def normalize_quote(cls, value: str | None) -> str | None:
        normalized = value.strip() if value else ""
        return normalized or None

    @field_validator("link", mode="before")
    @classmethod
    def normalize_link(cls, value):
        if isinstance(value, str):
            return value.strip() or None
        return value

    @model_validator(mode="after")
    def require_message_content(self):
        if not self.paragraphs and not self.quote:
            raise ValueError("Add at least one paragraph or a quote")
        return self


def _canonical_link(value) -> str | None:
    return str(value) if value else None


def nudge_content_changed(nudge: BehavioralNudge, payload: NudgeInput) -> bool:
    return any(
        (
            nudge.title != payload.title,
            list(nudge.paragraphs or []) != payload.paragraphs,
            nudge.quote != payload.quote,
            nudge.link != _canonical_link(payload.link),
        )
    )


def _whatsapp_preview(nudge) -> str:
    title = truncate_whatsapp_text(nudge.title or "Inner Caveman reminder", 300)
    message = "\n\n".join(nudge.paragraphs or [])
    if nudge.quote:
        message = f"{message}\n\n{nudge.quote}" if message else nudge.quote
    message = truncate_whatsapp_text(bounded_whatsapp_message(message), 1_024)
    return truncate_whatsapp_text(f"{title}\n\n{message}", 1_024)


def nudge_payload(
    nudge: BehavioralNudge,
    *,
    last_selected_on: date | None,
    selected_today: bool,
) -> dict:
    return {
        "id": str(nudge.id),
        "title": nudge.title,
        "paragraphs": list(nudge.paragraphs or []),
        "quote": nudge.quote,
        "link": nudge.link,
        "is_active": bool(nudge.is_active),
        "created_at": iso(nudge.created_at),
        "last_selected_on": last_selected_on.isoformat() if last_selected_on else None,
        "selected_today": selected_today,
        "web_preview": {
            "title": nudge.title,
            "paragraphs": list(nudge.paragraphs or []),
            "quote": nudge.quote,
            "link": nudge.link,
        },
        "whatsapp_preview": _whatsapp_preview(nudge),
    }


@router.get("")
async def list_nudges(
    query: str | None = Query(default=None, max_length=200),
    state: str = Query(default="all", pattern=r"^(all|active|inactive)$"),
    page: int = Query(default=1),
    page_size: int = Query(default=25),
    _: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    page, page_size, offset = pagination(page, page_size)
    criteria = []
    if query and query.strip():
        pattern = f"%{query.strip().lower()}%"
        criteria.append(
            or_(
                func.lower(func.coalesce(BehavioralNudge.title, "")).like(pattern),
                func.lower(func.coalesce(BehavioralNudge.quote, "")).like(pattern),
            )
        )
    if state != "all":
        criteria.append(BehavioralNudge.is_active.is_(state == "active"))

    total = await db.scalar(select(func.count(BehavioralNudge.id)).where(*criteria))
    last_selected = (
        select(func.max(DailyNudgeSelection.selection_date))
        .where(DailyNudgeSelection.nudge_id == BehavioralNudge.id)
        .correlate(BehavioralNudge)
        .scalar_subquery()
    )
    rows = (
        await db.execute(
            select(BehavioralNudge, last_selected.label("last_selected_on"))
            .where(*criteria)
            .order_by(BehavioralNudge.created_at.desc(), BehavioralNudge.id.asc())
            .offset(offset)
            .limit(page_size)
        )
    ).all()
    today = product_today()
    selected_nudge = await db.scalar(
        select(BehavioralNudge)
        .join(
            DailyNudgeSelection,
            DailyNudgeSelection.nudge_id == BehavioralNudge.id,
        )
        .where(DailyNudgeSelection.selection_date == today)
    )
    items = [
        nudge_payload(
            nudge,
            last_selected_on=last_selected_on,
            selected_today=bool(selected_nudge and nudge.id == selected_nudge.id),
        )
        for nudge, last_selected_on in rows
    ]
    return {
        "items": items,
        "total": int(total or 0),
        "page": page,
        "page_size": page_size,
        "today_selection": (
            nudge_payload(
                selected_nudge,
                last_selected_on=today,
                selected_today=True,
            )
            if selected_nudge
            else None
        ),
    }


@router.post("", status_code=status.HTTP_201_CREATED)
async def create_nudge(
    payload: NudgeInput,
    actor: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    nudge = BehavioralNudge(
        title=payload.title,
        paragraphs=payload.paragraphs,
        quote=payload.quote,
        link=_canonical_link(payload.link),
        is_active=payload.is_active,
    )
    db.add(nudge)
    await db.flush()
    db.add(
        AdminAuditEvent(
            actor_user_id=actor.id,
            action="nudge_created",
            subject_type="behavioral_nudge",
            subject_id=str(nudge.id),
            details={"is_active": payload.is_active},
        )
    )
    await db.commit()
    await db.refresh(nudge)
    return nudge_payload(nudge, last_selected_on=None, selected_today=False)


@router.patch("/{nudge_id}")
async def update_nudge(
    nudge_id: UUID,
    payload: NudgeInput,
    actor: User = Depends(require_admin),
    db: AsyncSession = Depends(get_db),
):
    nudge = await db.get(BehavioralNudge, nudge_id, with_for_update=True)
    if nudge is None:
        raise HTTPException(status_code=404, detail="Nudge not found")

    content_changed = nudge_content_changed(nudge, payload)
    selected_today = (
        await db.scalar(
            select(DailyNudgeSelection.nudge_id).where(
                DailyNudgeSelection.selection_date == product_today(),
                DailyNudgeSelection.nudge_id == nudge.id,
            )
        )
    ) is not None
    if content_changed and selected_today:
        raise HTTPException(
            status_code=status.HTTP_409_CONFLICT,
            detail=(
                "Today's selected nudge cannot be edited after publication. "
                "Create a new nudge or edit this one tomorrow."
            ),
        )

    nudge.title = payload.title
    nudge.paragraphs = payload.paragraphs
    nudge.quote = payload.quote
    nudge.link = _canonical_link(payload.link)
    nudge.is_active = payload.is_active
    db.add(
        AdminAuditEvent(
            actor_user_id=actor.id,
            action="nudge_updated",
            subject_type="behavioral_nudge",
            subject_id=str(nudge.id),
            details={
                "content_changed": content_changed,
                "is_active": payload.is_active,
            },
        )
    )
    await db.commit()
    await db.refresh(nudge)
    last_selected_on = await db.scalar(
        select(func.max(DailyNudgeSelection.selection_date)).where(
            DailyNudgeSelection.nudge_id == nudge.id
        )
    )
    return nudge_payload(
        nudge,
        last_selected_on=last_selected_on,
        selected_today=selected_today,
    )
