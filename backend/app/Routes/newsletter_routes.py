from fastapi import APIRouter, Depends, Request
from sqlalchemy.ext.asyncio import AsyncSession
from sqlalchemy.future import select
from app.database import get_db
from app.models import NewsletterSubscriber
from pydantic import BaseModel, EmailStr
from datetime import datetime
from app.analytics.posthog_client import track_event
from app.services.rate_limits import enforce, normalize_email, request_rules

router = APIRouter()

class SubscribeRequest(BaseModel):
    email: EmailStr

@router.post("/subscribe")
async def subscribe(payload: SubscribeRequest, request: Request, db: AsyncSession = Depends(get_db)):
    email = normalize_email(str(payload.email))
    await enforce(
        db,
        request_rules(request, ("newsletter_email", email), ip_policy="newsletter_ip"),
    )
    # Check if already subscribed
    result = await db.execute(
        select(NewsletterSubscriber).where(NewsletterSubscriber.email == email)
    )
    existing = result.scalar_one_or_none()

    if existing:
        return {"status": "already_subscribed"}

    # Add new subscriber
    subscriber = NewsletterSubscriber(email=email, created_at=datetime.utcnow())
    db.add(subscriber)
    await db.commit()
    track_event(email, "newsletter_subscribed")
    return {"status": "subscribed"}
