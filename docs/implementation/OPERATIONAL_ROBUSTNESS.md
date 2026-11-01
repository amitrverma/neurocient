# Operational robustness implementation contract

Status: approved for implementation

Owner: Amit

Contract version: 1.2 (2026-11-01)

Base revision: `b8dc9560e10b1bac9fa697e8f8e2bcd13e40012d`

## Outcome

Neurocient's critical account, payment, notification, and scheduled-work paths
leave privacy-safe operational evidence, can be correlated across the Next.js
and FastAPI boundary, surface contradictory durable state for an operator, and
do not duplicate external effects merely because a process restarts or more
than one worker is present.

This milestone implements the local engineering foundations for OPS-02,
OPS-03, OPS-05, and PAY-04. It does not claim production monitoring, provider
sandbox evidence, or assembled end-to-end release evidence.

## Actors and boundaries

- A user receives a correlation identifier on API responses and may quote it
  to support without receiving internal diagnostics.
- Next.js server routes preserve or create the correlation identifier when
  calling FastAPI on the critical commerce paths.
- FastAPI records allow-listed structured events and never logs credentials,
  cookies, message bodies, full provider payloads, phone numbers, or email
  addresses through the observability API.
- A signed-in member may request cancellation at the end of the current paid
  period. Only a verified provider event changes paid access.
- An administrator may inspect bounded operational and reconciliation state.
- A dedicated worker owns schedules. Web replicas never start schedules.
- Reconciliation is observation-only in this milestone. It may open or resolve
  an issue, but it may not change entitlement, enrolment, or refund state.

## Acceptance criteria

- **OR-OBS-01:** Every FastAPI request has a UUID correlation ID. A valid
  inbound ID is preserved, an invalid or missing value is replaced, the ID is
  returned in `X-Correlation-ID`, and completion or failure is emitted as a
  structured event without raw URL query data or request bodies.
- **OR-OBS-02:** The membership and cohort Next.js proxies pass the same
  correlation ID to FastAPI and return the backend ID to the browser. Provider
  adapter events retain that operation context without exposing secrets.
- **OR-OBS-03:** Unexpected API failures return a stable safe contract with the
  correlation ID. Logging failure cannot replace the original response.
- **OR-PAY-01:** Membership cancellation is authenticated, rate limited, tied
  to the current provider subscription, and requested for period end. Provider
  rejection and uncertain completion are distinct. The browser request never
  changes paid access; a verified webhook remains authoritative.
- **OR-PAY-02:** A bounded observation-only reconciliation pass compares local
  membership state with authenticated provider state and records privacy-safe,
  deduplicated issues. It also surfaces cohort checkout uncertainty,
  capacity-conflict refunds, unmatched billing events, and failed welcome
  delivery without combining the two products' fulfilment state.
- **OR-PAY-03:** Reconciliation issues retain first/last observation, status,
  safe identifiers, reason code, and correlation. A clean later observation
  resolves only the matching issue; it does not erase history or mutate money.
- **OR-JOB-01:** Scheduled work runs only in the dedicated worker entry point.
  A durable unique run claim prevents two workers from executing the same
  logical schedule. A stale in-progress claim becomes reconciliation-required
  rather than being silently replayed.
- **OR-JOB-02:** Notification dispatch has a durable per-user, per-channel,
  per-purpose, per-day claim. Restart or duplicate scheduling cannot resend a
  completed or uncertain dispatch. Provider failure and uncertain completion
  remain visible with bounded attempts.
- **OR-HEALTH-01:** `/healthz` remains a cheap liveness check. `/readyz` checks
  startup configuration and database connectivity with a bounded timeout and
  returns truthful component state without secrets.
- **OR-HEALTH-02:** An authenticated admin endpoint returns bounded counts for
  unresolved reconciliation, stale jobs, failed delivery, stuck checkout, and
  recent webhook failure. It provides signals, not a false claim that an
  external alert was delivered.

## Failure and recovery contract

- Validation, restriction, provider rejection, provider outcome unknown,
  conflict, and unexpected internal failure use distinct stable codes.
- Cancellation with an unknown provider outcome is not automatically retried.
  Reconciliation determines the provider state first.
- A process failure after an external delivery begins is an uncertain outcome.
  The durable claim blocks automatic repeat and exposes reconciliation need.
- A failed daily schedule is visible and may be deliberately retried by an
  operator with a new explicit run key; ordinary startup does not replay it.
- Readiness failure does not terminate liveness. It returns 503 and records the
  failing component category without connection strings or exception text.

## Evidence

- Focused tests for correlation validation/redaction, cancellation failure
  classification, reconciliation comparison and deduplication, schedule claims,
  dispatch claims, and operational-snapshot thresholds.
- Real PostgreSQL integration evidence for unique schedule/dispatch claims and
  reconciliation issue persistence.
- Migration upgrade/current/drift evidence and production frontend/backend
  build checks after the candidate stabilises.
- Same-context findings-first adversarial review. This is not an independent
  release review; the larger exact-candidate campaign remains deferred.

## Excluded scope

- Production deployment, external alert destinations, paging ownership, and
  retention configuration.
- Automatic entitlement repair, automatic refunds, or destructive remediation.
- Genuine provider delivery, charge, refund, cancellation, or dispute evidence.
- The broad assembled browser, accessibility, load, recovery, and release
  campaign tracked in the go-live checklist.

## Local verification record

Candidate: working tree based on `b8dc9560e10b1bac9fa697e8f8e2bcd13e40012d`

- Backend regression: 251 passed, 28 PostgreSQL-gated tests skipped. The
  Windows `python -m pytest` console wrapper remained open after reporting;
  invoking the same suite through `pytest.main` exits normally; thread
  inspection showed only the main thread and one daemon helper, so this is
  recorded as a local console-runner issue rather than release evidence.
- Focused robustness correction suite: 62 passed; the final regression
  includes those tests.
- Real PostgreSQL operational and cancellation integration: 6 passed,
  including wrapping pagination across batches and critical-first issue order.
- Alembic: database at `20261101_0012 (head)` and `alembic check` reports no
  upgrade operations. The migration was also rehearsed down to `0011` and back
  to head before this record was written.
- Frontend: 137 tests across 26 files passed; production build compiled,
  type-checked, and generated all pages.
- Frontend lint: the changed membership hook warning is clear. The repository
  gate remains red because of the pre-existing unescaped apostrophe in
  `modern-caveman/sections/Pricing.tsx`; generated coverage/service-worker
  warnings also remain.

This evidence establishes local implementation quality only. It does not
promote OPS-02, OPS-03, OPS-05, or PAY-04 to `Verified` because their required
deployed, provider, alert-delivery, restart, and operator evidence remains.

The same-context adversarial pass found and corrected three issues before this
record was closed: device-specific dispatch keys could duplicate one daily
user notification, a cancellation response without explicit period-end
confirmation was accepted, and heartbeat health could mask a wholly missed
scheduled run. Cross-destination PostgreSQL concurrency, strict period-end
response checks, and due-but-absent job signals now cover those cases.

The first independent review then found three High and three Medium issues and
did not approve the candidate. The amended candidate now compares provider and
local billing periods, distinguishes missing subscriptions, advances durable
wrapping cursors for every bounded reconciliation stream, preserves ambiguous
notification outcomes, falls back across push devices under one daily claim,
guards heartbeat evidence during downgrade, correlates CORS preflights, and
sorts operator issues by explicit severity with investigable identifiers.

The final independent re-review passed the local implementation with no
remaining material findings. The checker independently ran 49 focused tests
and five real-PostgreSQL operational tests. This is local engineering approval,
not release-grade verification: genuine providers, deployed worker recovery,
external alerts, staging journeys, and final exact-candidate release review
remain open.
