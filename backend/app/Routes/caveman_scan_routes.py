from datetime import datetime
from typing import Any, Literal, Optional
from uuid import UUID

from fastapi import APIRouter, Depends, HTTPException, Request, status
from pydantic import BaseModel, Field
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select

from app.database import get_db
from app.models import CavemanScanSession, User
from app.utils.auth import decode_token, get_token_from_cookies


router = APIRouter(prefix="/caveman-scan")


class CreateScanSession(BaseModel):
    scan_version: str = Field(min_length=1, max_length=50)
    scoring_version: str = Field(min_length=1, max_length=50)
    report_version: str = Field(min_length=1, max_length=50)
    scenario_ids: list[str] = Field(min_length=1, max_length=20)


class UpdateScanSession(BaseModel):
    access_token: UUID = Field(alias="accessToken")
    status: Literal["started", "completed", "abandoned"] = "started"
    responses: list[dict[str, Any]] = Field(default_factory=list, max_length=20)
    evidence: Optional[dict[str, Any]] = None
    portrait: Optional[dict[str, Any]] = None


class LinkScanSession(BaseModel):
    access_token: UUID = Field(alias="accessToken")


async def optional_current_user(request: Request, db: AsyncSession) -> Optional[User]:
    token = get_token_from_cookies(request)
    if not token:
        return None
    payload = decode_token(token)
    user_id = payload.get("sub") if payload else None
    if not user_id:
        return None
    result = await db.execute(select(User).where(User.id == user_id))
    return result.scalar_one_or_none()


def serialize_session(session: CavemanScanSession, include_deep_result: bool) -> dict[str, Any]:
    data = {
        "id": str(session.id),
        "accessToken": str(session.access_token),
        "scanVersion": session.scan_version,
        "scoringVersion": session.scoring_version,
        "reportVersion": session.report_version,
        "status": session.status,
        "scenarioIds": session.scenario_ids,
        "responses": session.responses,
        "startedAt": session.started_at.isoformat() if session.started_at else None,
        "completedAt": session.completed_at.isoformat() if session.completed_at else None,
        "isLinked": session.user_id is not None,
    }
    if include_deep_result:
        data["evidence"] = session.evidence
        data["portrait"] = session.portrait
    return data


async def get_owned_session(
    session_id: UUID,
    access_token: UUID,
    request: Request,
    db: AsyncSession,
) -> tuple[CavemanScanSession, Optional[User]]:
    result = await db.execute(select(CavemanScanSession).where(CavemanScanSession.id == session_id))
    session = result.scalar_one_or_none()
    if not session or session.access_token != access_token:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan session not found")

    user = await optional_current_user(request, db)
    if session.user_id and (not user or session.user_id != user.id):
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="Scan session not found")
    return session, user


@router.post("/sessions", status_code=status.HTTP_201_CREATED)
async def create_session(
    payload: CreateScanSession,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    if len(set(payload.scenario_ids)) != len(payload.scenario_ids):
        raise HTTPException(status_code=422, detail="Scenario IDs must be unique")

    user = await optional_current_user(request, db)
    session = CavemanScanSession(
        user_id=user.id if user else None,
        scan_version=payload.scan_version,
        scoring_version=payload.scoring_version,
        report_version=payload.report_version,
        scenario_ids=payload.scenario_ids,
    )
    db.add(session)
    await db.commit()
    await db.refresh(session)
    return serialize_session(session, include_deep_result=user is not None)


@router.get("/sessions/latest")
async def get_latest_session(
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    user = await optional_current_user(request, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Not authenticated")

    result = await db.execute(
        select(CavemanScanSession)
        .where(
            CavemanScanSession.user_id == user.id,
            CavemanScanSession.status == "completed",
        )
        .order_by(CavemanScanSession.completed_at.desc())
        .limit(1)
    )
    session = result.scalar_one_or_none()
    if not session:
        raise HTTPException(status_code=status.HTTP_404_NOT_FOUND, detail="No saved portrait yet")
    return serialize_session(session, include_deep_result=True)


@router.put("/sessions/{session_id}")
async def update_session(
    session_id: UUID,
    request: Request,
    payload: UpdateScanSession,
    db: AsyncSession = Depends(get_db),
):
    session, user = await get_owned_session(session_id, payload.access_token, request, db)
    if len(payload.responses) > len(session.scenario_ids):
        raise HTTPException(status_code=422, detail="Too many responses for this scan")

    session.responses = payload.responses
    session.status = payload.status
    session.evidence = payload.evidence
    session.portrait = payload.portrait
    session.updated_at = datetime.utcnow()
    if payload.status == "completed" and not session.completed_at:
        session.completed_at = datetime.utcnow()
    await db.commit()
    await db.refresh(session)
    return serialize_session(session, include_deep_result=user is not None)


@router.post("/sessions/{session_id}/link")
async def link_session(
    session_id: UUID,
    request: Request,
    payload: LinkScanSession,
    db: AsyncSession = Depends(get_db),
):
    session, user = await get_owned_session(session_id, payload.access_token, request, db)
    if not user:
        raise HTTPException(status_code=status.HTTP_401_UNAUTHORIZED, detail="Sign in to keep this portrait")
    if session.user_id and session.user_id != user.id:
        raise HTTPException(status_code=status.HTTP_409_CONFLICT, detail="Scan is already linked")

    session.user_id = user.id
    session.updated_at = datetime.utcnow()
    await db.commit()
    await db.refresh(session)
    return serialize_session(session, include_deep_result=True)


@router.get("/sessions/{session_id}")
async def get_session(
    session_id: UUID,
    access_token: UUID,
    request: Request,
    db: AsyncSession = Depends(get_db),
):
    session, user = await get_owned_session(session_id, access_token, request, db)
    return serialize_session(session, include_deep_result=user is not None)
