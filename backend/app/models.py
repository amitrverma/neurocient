from sqlalchemy import Column, String, DateTime, ForeignKey, Text, Date, JSON, UniqueConstraint, Integer, Boolean, CheckConstraint, Index, func
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
    phone_number = Column(String, nullable=True)
    # Legacy compatibility only. Optional delivery authority lives in
    # UserPreferences and no sender may consult this field.
    whatsapp_opt_in = Column(Boolean, default=False, nullable=False)
    created_at = Column(DateTime, default=datetime.utcnow)

    __table_args__ = (
        UniqueConstraint("phone_number", name="uq_users_phone_number"),
        Index("idx_users_phone_number", "phone_number"),
        Index("uq_users_email_lower", func.lower(email), unique=True),
    )


class AuthSession(Base):
    __tablename__ = "auth_sessions"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    family_id = Column(UUID(as_uuid=True), nullable=False, index=True)
    refresh_token_hash = Column(String, nullable=False, unique=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    revoked_at = Column(DateTime, nullable=True, index=True)
    revocation_reason = Column(String, nullable=True)
    replaced_by_id = Column(
        UUID(as_uuid=True),
        ForeignKey("auth_sessions.id", ondelete="SET NULL"),
        nullable=True,
    )
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    last_used_at = Column(DateTime, nullable=True)


class PasswordResetToken(Base):
    __tablename__ = "password_reset_tokens"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=False,
        index=True,
    )
    token_hash = Column(String, nullable=False, unique=True)
    expires_at = Column(DateTime, nullable=False, index=True)
    used_at = Column(DateTime, nullable=True, index=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


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


class CohortWelcomeEmailDelivery(Base):
    """Durable, replay-safe welcome email for one paid cohort enrollment."""

    __tablename__ = "cohort_welcome_email_deliveries"

    enrollment_id = Column(
        UUID(as_uuid=True),
        ForeignKey("cohort_enrollments.id", ondelete="CASCADE"),
        primary_key=True,
    )
    recipient = Column(String, nullable=False)
    payload = Column(JSON, nullable=False)
    status = Column(String, nullable=False, default="pending", index=True)
    attempt_count = Column(Integer, nullable=False, default=0)
    provider_message_id = Column(String, nullable=True, unique=True)
    last_error_code = Column(String, nullable=True)
    first_dispatched_at = Column(DateTime, nullable=True)
    last_attempt_at = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'dispatching', 'failed', 'sent', 'suppressed', 'reconciliation_required')",
            name="ck_cohort_welcome_email_status",
        ),
    )


class WhatsAppWebhookEvent(Base):
    """Minimal durable replay record for an inbound Twilio message."""

    __tablename__ = "whatsapp_webhook_events"

    provider_message_sid = Column(String(34), primary_key=True)
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
    provider_plan_id = Column(String, nullable=True)
    provider_payment_id = Column(String, nullable=True, index=True)
    provider_status = Column(String, nullable=True)
    checkout_operation_id = Column(UUID(as_uuid=True), nullable=True, unique=True)
    checkout_state = Column(String, nullable=True, index=True)
    price_minor = Column(Integer, nullable=True)
    currency = Column(String, nullable=True)
    billing_total_count = Column(Integer, nullable=True)
    last_provider_event_at = Column(DateTime, nullable=True)
    last_provider_event_rank = Column(Integer, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(
        DateTime,
        default=datetime.utcnow,
        onupdate=datetime.utcnow,
        nullable=False,
    )

    user = relationship("User")


class MembershipBillingEvent(Base):
    """Privacy-minimised durable ledger for membership webhooks."""

    __tablename__ = "membership_billing_events"

    provider_event_id = Column(String, primary_key=True)
    event_type = Column(String, nullable=False, index=True)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="SET NULL"), nullable=True, index=True)
    provider_subscription_id = Column(String, nullable=True, index=True)
    provider_payment_id = Column(String, nullable=True, index=True)
    provider_customer_id = Column(String, nullable=True, index=True)
    provider_plan_id = Column(String, nullable=True)
    amount_minor = Column(Integer, nullable=True)
    currency = Column(String, nullable=True)
    provider_created_at = Column(DateTime, nullable=True)
    current_period_end = Column(DateTime, nullable=True)
    status = Column(String, nullable=False, default="received", index=True)
    reason_code = Column(String, nullable=True)
    processed_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)


class MembershipWelcomeEmailDelivery(Base):
    """Durable, replay-safe welcome email for a paid membership account."""

    __tablename__ = "membership_welcome_email_deliveries"

    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        primary_key=True,
    )
    recipient = Column(String, nullable=False)
    payload = Column(JSON, nullable=False)
    status = Column(String, nullable=False, default="pending", index=True)
    attempt_count = Column(Integer, nullable=False, default=0)
    provider_message_id = Column(String, nullable=True, unique=True)
    last_error_code = Column(String, nullable=True)
    first_dispatched_at = Column(DateTime, nullable=True)
    last_attempt_at = Column(DateTime, nullable=True)
    sent_at = Column(DateTime, nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow, nullable=False)

    __table_args__ = (
        CheckConstraint(
            "status IN ('pending', 'dispatching', 'failed', 'sent', 'suppressed', 'reconciliation_required')",
            name="ck_membership_welcome_email_status",
        ),
    )

class UserPreferences(Base):
    __tablename__ = "user_preferences"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    user_id = Column(UUID(as_uuid=True), ForeignKey("users.id", ondelete="CASCADE"), unique=True)

    # Optional reinforcement is always opt-in. These columns are the only
    # authority used by outbound reminder delivery.
    nudge_enabled = Column(Boolean, default=False, nullable=False)
    spot_reminder_enabled = Column(Boolean, default=False, nullable=False)
    microchallenge_enabled = Column(Boolean, default=False, nullable=False)
    push_enabled = Column(Boolean, default=False, nullable=False)
    whatsapp_enabled = Column(Boolean, default=False, nullable=False)
    whatsapp_number = Column(String, nullable=True, unique=True)
    whatsapp_verified = Column(Boolean, default=False, nullable=False)
    whatsapp_pending_number = Column(String, nullable=True)
    whatsapp_verification_code_hash = Column(String, nullable=True)
    whatsapp_verification_expires_at = Column(DateTime, nullable=True)
    whatsapp_verification_attempts = Column(Integer, default=0, nullable=False)

    created_at = Column(DateTime, default=datetime.utcnow)
    updated_at = Column(DateTime, default=datetime.utcnow, onupdate=datetime.utcnow)

    user = relationship("User", backref="preferences")

    __table_args__ = (
        CheckConstraint(
            "NOT whatsapp_verified OR whatsapp_number IS NOT NULL",
            name="ck_user_preferences_verified_number",
        ),
        CheckConstraint(
            "NOT whatsapp_enabled OR whatsapp_verified",
            name="ck_user_preferences_enabled_verified",
        ),
        CheckConstraint(
            "whatsapp_verification_attempts BETWEEN 0 AND 5",
            name="ck_user_preferences_verification_attempts",
        ),
    )

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
    email = Column(String, unique=True, index=True, nullable=False)
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
    assignment_id = Column(
        UUID(as_uuid=True),
        ForeignKey(
            "user_microchallenges.id",
            name="microchallenge_logs_assignment_fk",
            ondelete="CASCADE",
        ),
        nullable=False,
    )
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

    __table_args__ = (
        UniqueConstraint("user_id", "week_start", name="uq_weekly_reflection_user_week"),
    )


class AbuseRateLimitBucket(Base):
    __tablename__ = "abuse_rate_limit_buckets"

    policy = Column(String(length=64), primary_key=True)
    identity_hash = Column(String(length=64), primary_key=True)
    window_started_at = Column(DateTime, nullable=False)
    request_count = Column(Integer, nullable=False)
    updated_at = Column(DateTime, nullable=False)

    __table_args__ = (
        CheckConstraint("request_count >= 1", name="ck_abuse_rate_limit_count_positive"),
        Index("ix_abuse_rate_limit_buckets_updated_at", "updated_at"),
    )


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


class ArticleAccessGrant(Base):
    """A durable, idempotent free-access grant for one actor and Insight."""

    __tablename__ = "article_access_grants"

    id = Column(UUID(as_uuid=True), primary_key=True, default=uuid.uuid4)
    article_slug = Column(String, nullable=False)
    user_id = Column(
        UUID(as_uuid=True),
        ForeignKey("users.id", ondelete="CASCADE"),
        nullable=True,
    )
    guest_id = Column(UUID(as_uuid=True), nullable=True)
    created_at = Column(DateTime, default=datetime.utcnow, nullable=False)

    __table_args__ = (
        CheckConstraint(
            "(user_id IS NOT NULL AND guest_id IS NULL) OR "
            "(user_id IS NULL AND guest_id IS NOT NULL)",
            name="ck_article_access_actor",
        ),
        UniqueConstraint(
            "user_id",
            "article_slug",
            name="uq_article_access_user_slug",
        ),
        UniqueConstraint(
            "guest_id",
            "article_slug",
            name="uq_article_access_guest_slug",
        ),
        Index("ix_article_access_user_id", "user_id"),
        Index("ix_article_access_guest_id", "guest_id"),
    )
    
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
