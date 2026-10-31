# Notification consent implementation contract

Status: approved for implementation

Owner: Amit

Base revision: `d0bdea9dae4f03b752c571cca8e9dc2a8c93556a`

Contract version: 1.0 (2026-10-31)

## Outcome

Signed-in users control whether Neurocient may send optional reinforcement and
which verified channels it may use. Optional purposes and channels default off.
Changing or losing consent prevents later scheduled and manually triggered
delivery, including when the preference changes after a job was scheduled.

## Actors and entry points

- A signed-in user reads and changes delivery preferences in `/profile`.
- A signed-in user may register or remove a browser push subscription.
- A signed-in user may request a WhatsApp ownership code and confirm it.
- The scheduler and authenticated admin trigger routes may request delivery.
- Twilio may deliver a signed inbound `spot:` message from a verified number.
- Password reset email, a reply to an inbound WhatsApp Spot, contact-form
  forwarding, and a separately submitted newsletter subscription are distinct
  user-initiated or service-message purposes and are not optional reinforcement.

## Decisions

- `UserPreferences` is the only authority for optional reinforcement consent.
  Legacy `User.phone_number` and `User.whatsapp_opt_in` do not authorize sends.
- Purposes are independent: daily nudges, Spot reminders, and microchallenge
  reminders. Channels are independent: web push and WhatsApp.
- Every optional purpose and channel defaults to `false`, including existing
  ambiguous rows whose previous values could have come from unsafe defaults.
- Browser permission and a stored push subscription are prerequisites, not
  consent substitutes. A sender requires both a current enabled purpose and a
  current enabled channel immediately before provider dispatch.
- A WhatsApp number must be E.164 and confirmed with a short-lived, one-time,
  bounded-attempt code sent to that number. Only the server may set verification
  state. Changing the number invalidates prior verification and does not silently
  enable WhatsApp.
- Preference mutation accepts an explicit schema only. Unknown and server-owned
  fields are rejected; clients cannot set verification state or verification
  secrets.
- The inbound WhatsApp account lookup uses only the current verified number.
  The existing same-sender acknowledgement remains a transactional response to
  a user-initiated Spot and is not optional reinforcement.
- Scheduler startup remains disabled by default through `ENABLE_SCHEDULER=false`.
  Admin trigger routes remain protected by `ADMIN_API_KEY`; when invoked they use
  the same consent-enforcing delivery path as scheduled jobs.

## Invariants and acceptance criteria

- **CONSENT-01-A:** A new account and a migrated ambiguous account have every
  optional purpose and channel off. No provider call occurs from those defaults.
- **CONSENT-01-B:** Only `nudge_enabled`, `spot_reminder_enabled`,
  `microchallenge_enabled`, `push_enabled`, and `whatsapp_enabled` are mutable
  through the general preference PATCH. Unknown fields and verification fields
  are rejected without a partial mutation.
- **CONSENT-01-C:** WhatsApp cannot be enabled until the current number has been
  confirmed. Codes expire, are one-time, have bounded attempts, are stored only
  as hashes, and a new request invalidates the previous code.
- **CONSENT-01-D:** Daily-nudge, Spot-reminder, and microchallenge senders each
  require the matching purpose plus the selected channel at dispatch time. An
  opt-out before a later run produces no provider call.
- **CONSENT-01-E:** Push delivery targets only subscriptions owned by an eligible
  user. WhatsApp delivery targets only the user's current verified number. A
  subscription endpoint already owned by another user is not silently adopted.
- **CONSENT-01-F:** Provider failure is reported truthfully and does not turn an
  unverified number into a verified one. Logs omit phone numbers, codes,
  subscription endpoints, credentials, and provider response bodies.
- **CONSENT-01-G:** The preference UI starts from persisted state, explains the
  verification requirement, exposes independent purposes and channels, and
  never presents WhatsApp as enabled before confirmation succeeds.
- **CONSENT-01-H:** Password recovery, contact forwarding, newsletter signup,
  and same-sender inbound acknowledgement retain their existing purpose-specific
  entry conditions and are not accidentally blocked or authorized by optional
  reinforcement preferences.

## Failure, retry, and concurrency contract

- Validation and consent conflicts return stable 4xx responses without provider
  calls. Provider/configuration failure returns a retryable 5xx response without
  confirming ownership.
- Re-requesting verification replaces the prior pending challenge. Only the
  latest unexpired code can confirm the latest pending number.
- Reconfirming an already consumed code fails without changing consent. Failed
  code attempts are bounded and invalidate the challenge at the limit.
- Provider delivery failures do not re-enable consent. Existing push cleanup for
  expired endpoints remains bounded to the failed subscription.

## Required evidence

- Real PostgreSQL/API tests for safe defaults, allowlisted mutations, rejection
  without partial writes, WhatsApp request/confirm/expiry/replay/attempt limits,
  and subscription ownership.
- Provider-adapter tests proving no push or WhatsApp call for every disabled
  channel/purpose combination, verified delivery for enabled combinations, and
  opt-out immediately before a later scheduled/manual run.
- Migration upgrade, downgrade/re-upgrade, current, drift, and schema comparison.
- Frontend tests for persisted rendering, WhatsApp verification states, error
  handling, and channel/purpose controls, plus a production frontend build.
- Independent two-stage review because this change governs external side effects,
  personal contact data, and every notification entry point.
- Twilio and web-push staging delivery remain required before `Verified` status.

## Rollout and recovery

Apply the schema migration while the scheduler stays disabled. Deploy code that
reads only the new authoritative fields. Users then explicitly re-enable desired
purposes and channels; WhatsApp requires re-verification. Enable a single
scheduler replica only after staging evidence. Forward repair is preferred after
shared deployment; disabling the scheduler and admin key stops optional sends.

## Excluded scope

- Newsletter campaign tooling and unsubscribe-link implementation.
- Marketing email preferences; no account-marketing sender currently exists.
- Twilio template approval and genuine provider sandbox certification (TEST-02).
- Moving APScheduler into a dedicated worker or adding a durable delivery queue.

