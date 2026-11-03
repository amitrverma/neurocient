# WhatsApp companion implementation contract

Status: implemented locally; genuine-provider staging pending

Owner: Amit

Contract version: 1.1 (2026-11-03)

Version 1.1 makes the daily nugget selection durable and shared across the web
and outbound delivery. It also requires bounded outbound WhatsApp bodies and
retention of accepted provider message identifiers for dispatch correlation.

## Outcome

WhatsApp is Neurocient's lightweight daily interaction surface while the web
application remains the place where a user chooses and configures their work.
The first companion supports three shared product outcomes:

1. record a Spot the Inner Caveman entry;
2. receive the user's active Microchallenge and report today's outcome; and
3. receive the same daily nugget used by Neurocient's signed-in home.

WhatsApp and the web application use the same authoritative account records.
This is a deterministic companion, not an open-ended AI chatbot.

## Confirmed behaviour

- A verified WhatsApp sender may record a Spot the Inner Caveman entry with
  `spot: <description>`.
- Spot capture uses the same free-account allowance and membership decision as
  the web application. WhatsApp is not an alternate path around access rules.
- A Microchallenge reminder is sent only when the user has an active
  Microchallenge and has not reported an outcome for the current India calendar
  day.
- The reminder identifies the active Microchallenge and its first concrete
  instruction. It offers `Done`, `Partly`, and `Didn't happen` responses.
- `Done` records a completed repetition and advances the existing 21-day
  progress calculation. `Partly` and `Didn't happen` record truthful evidence
  for the day without advancing completed-day progress.
- After `Partly` or `Didn't happen`, the user may attach one optional obstacle
  note with `note: <what got in the way>`; it is stored on that same daily log.
- Only one outcome may be recorded for an assignment and calendar day. Provider
  replay, repeated replies, and concurrent web/WhatsApp submissions must not
  create duplicate progress.
- A response is applied only to the sender's current active assignment. A stale
  response must not update a removed, completed, failed, or different user's
  assignment.
- A plain-text outcome is tied to the assignment recorded on that India-day's
  durable WhatsApp reminder dispatch. Without that context it is guidance, not
  permission to mutate whichever challenge happens to be active later.
- A reply may resolve user interaction after a dispatch whose provider outcome
  was uncertain: the durable assignment context remains valid because the
  signed inbound reply itself demonstrates that the prompt reached the verified
  sender. Failed and skipped dispatches do not create response authority.
- A report made on WhatsApp is visible through the existing Microchallenge web
  APIs. A web report prevents a later reminder or duplicate WhatsApp report.
- `spot:` retains command priority. `help` and an unrecognised message from a
  verified sender receive concise guidance; an unknown sender receives the same
  generic webhook response and no account-disclosing reply.
- Purpose and channel consent remain authoritative for outbound optional
  reminders. A user-initiated inbound Spot or progress response is accepted from
  the currently verified number even when optional reminders are disabled.
- Daily nuggets retain the current shared-content outbound path. They are
  one-way in this version. The first web or worker request for an India calendar
  day durably selects one active nugget; every later web and outbound request
  for that date reuses it even if the active content inventory changes. When a
  user also has an unreported active
  Microchallenge with reminders enabled, that reminder takes priority and the
  nugget is skipped for the day.

## Failure and privacy contract

- The signed Twilio webhook, bounded form parsing, exact public URL validation,
  privacy-safe logging, and MessageSid replay claim remain mandatory.
- The replay claim and any Spot or Microchallenge mutation commit in one database
  transaction before a reply is attempted.
- A provider reply failure must not roll back a committed user record or invite
  duplicate mutation. Reply delivery remains best-effort until durable outbound
  replies and status callbacks are implemented.
- Outbound bodies are bounded to the provider's 1,600-character limit. A long
  Microchallenge title or instruction must not remove the three response
  options. When Twilio accepts a scheduled dispatch and returns a well-formed
  MessageSid, that identifier is retained on the durable dispatch record.
- Phone numbers, message text, notes, verification codes, signatures, and
  provider response bodies must not appear in application logs.

## Acceptance criteria

- **WA-COMP-01:** An authentic `spot:` message from a verified number writes one
  Spot across sequential and concurrent provider replay.
- **WA-COMP-02:** An eligible user receives reminder copy containing their active
  Microchallenge rather than a generic reminder.
- **WA-COMP-03:** Authentic `Done`, `Partly`, and `Didn't happen` responses write
  one outcome to the sender's active assignment for the India calendar day.
- **WA-COMP-04:** Only `Done` increases completed-day progress; all three outcomes
  prevent another reminder for that day.
- **WA-COMP-05:** Unknown senders, inactive assignments, expired experiments,
  duplicate replies, and unknown commands cause no incorrect progress mutation.
- **WA-COMP-06:** The existing web log request remains backward compatible and is
  treated as `Done` when it omits an outcome.
- **WA-COMP-07:** The signed-in home and WhatsApp resolve to one durable nugget
  for the same India calendar day, including concurrent first access and later
  changes to the active nudge inventory.
- **WA-COMP-08:** Provider-valid outbound bodies stay within 1,600 characters,
  Microchallenge response options survive truncation, and accepted scheduled
  sends retain the provider MessageSid when available.
- **WA-COMP-09:** Web and WhatsApp Spot capture enforce the same serialized
  free-account allowance; a denied WhatsApp write commits no Spot while keeping
  the webhook response generic.

## Deferred provider work

- approved WhatsApp authentication and reinforcement templates;
- interactive reply buttons;
- durable outbound reply records, delivery callbacks, retry, and reconciliation;
- genuine Twilio staging evidence and limited-cohort rollout.

## Rollout and recovery

Apply the additive outcome migration before deploying the companion code. The
migration backfills every existing daily log as `Done`, preserving historical
progress. After a `Partly` or `Didn't happen` outcome exists, schema downgrade
is blocked because older code would miscount that evidence as a completed day;
use forward repair instead.

Apply the following daily-nudge-selection migration before application code.
It is additive and may be downgraded independently while the companion is not
serving traffic. The table retains one row per product day and prevents a
selected nugget from being deleted while it remains part of that day's shared
experience.

## Local implementation evidence

- Focused backend tests cover explicit command parsing, response authority,
  outcome semantics, note attachment, consent rechecks, provider failures,
  content bounds, provider MessageSid retention, and reminder priority.
- Real PostgreSQL tests cover signed webhook privacy, sequential and concurrent
  replay, shared Microchallenge outcomes, rollback/retry behavior, and
  concurrent durable daily-nugget selection. They also prove that WhatsApp
  cannot bypass the web Spot allowance.
- A disposable PostgreSQL migration run proved legacy log backfill to `Done`,
  outcome constraint creation, daily-selection upgrade/downgrade/re-upgrade,
  and the forward-repair guard after `Partly` evidence.
- Final local gates passed 283 backend non-integration tests, 13 affected real
  PostgreSQL tests run in isolated processes, and all 146 frontend tests. The
  affected frontend lint and the production frontend build also passed; the
  build retains the repository's existing `turbopack.conditions` warning.
- The legacy Microchallenge page remains an oversized orchestration surface at
  796 physical lines. The new check-in rendering was extracted into its own
  covered component so this change does not add another render responsibility;
  the next material Microchallenge-page change should continue decomposition.
- Genuine Twilio delivery, template behavior, provider callbacks, and limited-
  cohort operation remain provider-staging evidence and are not claimed here.
