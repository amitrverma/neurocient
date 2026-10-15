from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Date, JSON, UniqueConstraint, Integer, Boolean, Index
from sqlalchemy.dialects.postgresql import UUID
from sqlalchemy.orm import relationship
import uuid
from datetime import datetime
from app.database import Base

class User(Base):
    __tablename__ = "users"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    password_hash = Column(String, nullable=True) 
    google_id = Column(String, unique=True, nullable=True)
    name = Column(String, nullable=True)
    phone_number = Column(String, unique=True, index=True, nullable=True)
    whatsapp_opt_in = Column(Boolean, default=True)
    created_at = Column(DateTime, default=datetime.utcnow)


class UserRole(Base):
    __tablename__ = "user_roles"

    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), primary_key=True)
    role = Column(String, primary_key=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class Cohort(Base):
    __tablename__ = "cohorts"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    program_key = Column(String, nullable=False, default="modern-caveman", index=True)
    slug = Column(String, nullable=False, unique=True, index=True)
    title = Column(String, nullable=False)
    description = Column(Text, nullable=True)
    facilitator = Column(String, nullable=True)
    timezone = Column(String, nullable=False, default="Asia/Kolkata")
    starts_at = Column(DateTime, nullable=False)
    ends_at = Column(DateTime, nullable=False)
    enrollment_opens_at = Column(DateTime, nullable=True)
    enrollment_closes_at = Column(DateTime, nullable=True)
    capacity = Column(Integer, nullable=False)
    price_minor = Column(Integer, nullable=False)
    currency = Column(String, nullable=False, default="INR")
    status = Column(String, nullable=False, default="draft", index=True)
    published_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class CohortSession(Base):
    __tablename__ = "cohort_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cohort_id = Column(UUID(as_uuid=True), ForeignKey("cohorts.id", ondelete="CASCADE"), nullable=False, index=True)
    title = Column(String, nullable=False)
    starts_at = Column(DateTime, nullable=False)
    ends_at = Column(DateTime, nullable=False)
    public_note = Column(Text, nullable=True)
    meeting_url = Column(Text, nullable=True)
    sort_order = Column(Integer, nullable=False, default=0)


class CohortEnrollment(Base):
    __tablename__ = "cohort_enrollments"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cohort_id = Column(UUID(as_uuid=True), ForeignKey("cohorts.id", ondelete="CASCADE"), nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False, index=True)
    status = Column(String, nullable=False, default="pending_payment", index=True)
    reservation_expires_at = Column(DateTime, nullable=True)
    provider_order_id = Column(String, nullable=True, unique=True, index=True)
    provider_payment_id = Column(String, nullable=True, unique=True, index=True)
    amount_minor = Column(Integer, nullable=False)
    currency = Column(String, nullable=False)
    paid_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (UniqueConstraint("cohort_id", "user_id", name="uq_cohort_enrollment_user"),)


class CohortWaitlistEntry(Base):
    __tablename__ = "cohort_waitlist_entries"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    cohort_id = Column(UUID(as_uuid=True), ForeignKey("cohorts.id", ondelete="CASCADE"), nullable=False)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), nullable=False)
    status = Column(String, nullable=False, default="waiting")
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        UniqueConstraint("cohort_id", "user_id", name="uq_cohort_waitlist_user"),
        Index("ix_cohort_waitlist_order", "cohort_id", "created_at"),
    )


class PaymentRecord(Base):
    __tablename__ = "payment_records"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    enrollment_id = Column(UUID(as_uuid=True), ForeignKey("cohort_enrollments.id", ondelete="CASCADE"), nullable=False, index=True)
    provider = Column(String, nullable=False, default="razorpay")
    provider_order_id = Column(String, nullable=False, index=True)
    provider_payment_id = Column(String, nullable=True, unique=True, index=True)
    status = Column(String, nullable=False)
    amount_minor = Column(Integer, nullable=False)
    currency = Column(String, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)


class PaymentWebhookEvent(Base):
    __tablename__ = "payment_webhook_events"

    provider_event_id = Column(String, primary_key=True)
    event_type = Column(String, nullable=False)
    payload = Column(JSON, nullable=False)
    status = Column(String, nullable=False, default="received")
    processed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class AdminAuditEvent(Base):
    __tablename__ = "admin_audit_events"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    actor_user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    action = Column(String, nullable=False, index=True)
    subject_type = Column(String, nullable=False)
    subject_id = Column(String, nullable=True)
    details = Column(JSON, nullable=False, default=dict)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False, index=True)


class MembershipEntitlement(Base):
    """Provider-neutral paid access state for manual or gateway activation."""

    __tablename__ = "membership_entitlements"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    status = Column(String, nullable=False, default="inactive", index=True)
    provider = Column(String, nullable=True)
    provider_customer_id = Column(String, nullable=True, index=True)
    provider_subscription_id = Column(String, nullable=True, unique=True)
    current_period_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    user = relationship("User")

class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)

    nudge_enabled = Column(Boolean, default=True)
    microchallenge_enabled = Column(Boolean, default=True)
    notif_channel = Column(String, default="push")   # push | whatsapp | both
    whatsapp_number = Column(String, nullable=True)
    whatsapp_verified = Column(Boolean, default=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="preferences")

class CavemanSpot(Base):
    __tablename__ = "spots"
    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"))
    description = Column(Text)
    date = Column(Date)
    created_at = Column(DateTime, default=datetime.utcnow)

class Waitlist(Base):
    __tablename__ = "waitlist"

    id = Column(UUID(as_uuid=True), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, index=True)
    name = Column(String)
    created_at = Column(DateTime, default=datetime.utcnow)

class Participant(Base):
    __tablename__ = "participants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=lambda: str(uuid.uuid4()))
    email = Column(String, unique=True, nullable=False, index=True)
    phone_number = Column(String, nullable=True)
    cohort = Column(String, nullable=True)
    joined_on = Column(DateTime, default=datetime.utcnow)    

class MicrochallengeDefinition(Base):
    __tablename__ = "microchallenge_definitions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    title = Column(Text, nullable=False)
    intro = Column(JSON, nullable=False)           # Array of paragraphs
    instructions = Column(JSON, nullable=False)    # Array of steps
    why = Column(Text, nullable=False)
    tips = Column(JSON, nullable=False)            # Array of tips
    closing = Column(Text, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    user_challenges = relationship("UserMicrochallenge", back_populates="challenge")


class UserMicrochallenge(Base):
    __tablename__ = "user_microchallenges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    challenge_id = Column(UUID(as_uuid=True), ForeignKey("microchallenge_definitions.id"), nullable=False)
    status = Column(
        String,
        default="active"
    )  # active / success / failed / removed
    started_at = Column(DateTime, default=datetime.utcnow)
    completed_at = Column(DateTime, nullable=True)

    challenge = relationship("MicrochallengeDefinition", back_populates="user_challenges")
    logs = relationship("MicrochallengeLog", back_populates="assignment")


class MicrochallengeLog(Base):
    __tablename__ = "microchallenge_logs"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    assignment_id = Column(UUID(as_uuid=True), ForeignKey("user_microchallenges.id"), nullable=False)
    log_date = Column(Date, nullable=False)
    note = Column(Text)
    created_at = Column(DateTime, default=datetime.utcnow)

    assignment = relationship("UserMicrochallenge", back_populates="logs")

    __table_args__ = (
        UniqueConstraint("assignment_id", "log_date", name="uq_assignment_log_date"),
    )
  

class WebPushSubscription(Base):
    __tablename__ = "web_push_subscriptions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    endpoint = Column(Text, nullable=False, unique=True)
    keys = Column(JSON, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

class IkeaWorksheet(Base):
    __tablename__ = "ikea_worksheet"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)
    status = Column(String, default="active")  # 'active' or 'completed'
    struggle = Column(Text, nullable=False)
    identity = Column(Text, nullable=False)
    knowledge = Column(Text, nullable=False)
    environment = Column(JSON, nullable=False)  # { easier: "", harder: "" }
    tiny_action = Column(Text, nullable=False)

    user = relationship("User", backref="ikea_worksheets")
    tracker_entries = relationship("IkeaTracker", back_populates="worksheet", cascade="all, delete-orphan")


class IkeaTracker(Base):
    __tablename__ = "ikea_tracker"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    worksheet_id = Column(UUID(as_uuid=True), ForeignKey("ikea_worksheet.id"), nullable=False)
    date = Column(Date, nullable=False)
    completed = Column(Boolean, nullable=False, default=False)
    note = Column(Text)

    worksheet = relationship("IkeaWorksheet", back_populates="tracker_entries")

    __table_args__ = (
        UniqueConstraint("worksheet_id", "date", name="uq_worksheet_date"),
    )

class BehavioralNudge(Base):
    __tablename__ = "behavioral_nudges"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)

    title = Column(String, nullable=True)             # Optional, e.g. "💡 Nudge of the Day"
    paragraphs = Column(JSON, nullable=False)         # Array of paragraph strings
    quote = Column(Text, nullable=True)               # Highlighted quote block
    link = Column(String, nullable=True)              # Optional blog/article/resource URL
    is_active = Column(Boolean, default=True)         # Only active nudges are served
    created_at = Column(DateTime, default=datetime.utcnow)    

class WeeklyReflection(Base):
    __tablename__ = "weekly_reflections"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    content = Column(Text, nullable=False)
    week_start = Column(Date, nullable=False)
    week_end = Column(Date, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class NewsletterSubscriber(Base):
    __tablename__ = "newsletter_subscribers"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    email = Column(String, unique=True, index=True, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)


class Article(Base):
    __tablename__ = "articles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    slug = Column(String, unique=True, index=True, nullable=False)   # maps to .mdx filename
    title = Column(String, nullable=False)
    excerpt = Column(Text, nullable=True)

    read_count = Column(Integer, default=0)
    save_count = Column(Integer, default=0)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)
    
class SavedArticle(Base):
    __tablename__ = "saved_articles"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id"), nullable=False)
    article_id = Column(UUID(as_uuid=True), ForeignKey("articles.id"), nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("user_id", "article_id", name="uq_user_article"),
    )


class CavemanScanSession(Base):
    """Versioned evidence captured by the Inner Caveman Scan.

    Content remains defined in the application scenario library. The session
    stores immutable snapshots so historical portraits remain reproducible
    after scenario copy or mappings evolve.
    """

    __tablename__ = "caveman_scan_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    access_token = Column(UUID(as_uuid=True), unique=True, index=True, nullable=False, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    scan_version = Column(String, nullable=False)
    scoring_version = Column(String, nullable=False)
    report_version = Column(String, nullable=False)
    status = Column(String, nullable=False, default="started")
    scenario_ids = Column(JSON, nullable=False, default=list)
    responses = Column(JSON, nullable=False, default=list)
    evidence = Column(JSON, nullable=True)
    portrait = Column(JSON, nullable=True)
    started_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    completed_at = Column(DateTime, nullable=True)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    user = relationship("User", backref="caveman_scan_sessions")
