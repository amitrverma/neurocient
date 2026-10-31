# Neurocient go live readiness checklist

This checklist is the durable source of truth for deciding whether Neurocient can accept public traffic, private user data, and payments. It was established from the primary and independent launch-readiness reviews of clean `main` commit `ad9c74c266afe754175ca07b70042e52a90deab6` on 2026-10-31.

The current decision is **no-go for a public paid/private-product launch**. A content-only release has a smaller boundary, but it is safe only when every excluded capability is authoritatively disabled or not deployed. Hiding navigation or buttons is not sufficient.

## How to use this checklist

Use one of these statuses for every item:

- `Blocked`: required work or evidence is missing.
- `In progress`: implementation or verification has started.
- `Implemented`: code is complete, but release-grade evidence is still missing.
- `Verified`: the correction and its important failure paths passed at the required boundary.
- `Accepted risk`: the owner explicitly accepted the remaining risk and recorded the rationale, scope, expiry or review trigger, and compensating controls.
- `Not applicable`: the capability is authoritatively disabled or outside the approved launch boundary.

A release blocker is closed only when it is `Verified`, `Accepted risk`, or legitimately `Not applicable`. A unit test or code inspection cannot close an item that requires real database, provider, browser, staging, deployment, or recovery evidence.

When updating an item, record:

- owner;
- implementation pull request or commit;
- verification environment and exact artifact revision;
- commands, scenarios, and evidence locations;
- unresolved risk and next review trigger.

## Launch decision summary

| Launch boundary | Current status | Exit rule |
| --- | --- | --- |
| Public content only | Conditionally possible | All accounts, private persistence, AI generation, payments, webhooks, admin APIs, and scheduled communications are authoritatively disabled or not deployed; content, accessibility, security headers, legal text, deployment, and smoke checks pass. |
| Invite-only private beta without payments | Blocked | All applicable security, consent, data, operations, and private-journey items below are closed. Payment-only items may be `Not applicable` only when checkout and payment routes are disabled. |
| Public paid/private product | Blocked | Every P0 item and every required release-evidence item is closed for the exact release candidate. |

## P0 security and privacy blockers

| ID | Status | Requirement and failure prevented | Minimum closure evidence | Owner | Evidence and notes |
| --- | --- | --- | --- | --- | --- |
| SEC-01 | Verified | Authenticate and owner-scope every Practice tracker read and mutation. Prevent anonymous or wrong-owner access through worksheet UUIDs. | Real API and PostgreSQL tests for owner success, anonymous denial, wrong-owner denial, and no forbidden mutation. | Unassigned | Focused HTTP tests cover all three routes and the real Bearer-token dependency (12 passed). `tests/integration/test_ikea_tracker_postgres.py` independently exercises the real FastAPI route, auth dependency, SQLAlchemy session, and PostgreSQL 17.4 persistence for owner success, anonymous denial, wrong-owner non-enumerating denial, and absence of forbidden tracker rows (1 passed). CI now provisions PostgreSQL and runs this test explicitly. |
| SEC-02 | Implemented | Verify Twilio webhook signatures, reject replay, redact phone/message content, and stop returning internal exceptions. Prevent forged Spots, phone enumeration, and private data in logs. | HTTP-boundary tests using valid, invalid, wrong-URL, malformed, and replayed signed fixtures; privacy-safe log inspection. | Amit | The official Twilio validator now checks the exact configured HTTPS URL, all bounded form fields, and configured Account SID before database access. PostgreSQL stores a minimal unique MessageSid claim in the same transaction as the Spot; sequential, changed-payload, rollback/retry, and concurrent replay tests prove at most one write and acknowledgement attempt. Known, unknown, non-Spot, empty, and replay HTTP responses are identical; canary tests cover phone, body, signature, provider response, and internal errors. Local evidence: 101 backend tests, seven PostgreSQL integrations, reversible migration/drift/schema checks, and a clean production Docker build. Independent review found no authenticity bypass or duplicate-write race and drove acknowledgement-exception and outcome-log hardening. Keep the webhook disabled until a genuine Twilio sandbox/staging request validates the deployed URL and provider acknowledgement path on the exact candidate. See `TWILIO_WEBHOOK_SECURITY.md`. |
| SEC-03 | Implemented | Add abuse protection for login, signup, refresh, Scan creation, newsletter, contact, AI generation, and payment entry points. Add bounded payloads and provider-spend controls. | Rate-limit and quota tests for account/IP boundaries, recovery behavior, payload limits, and saturation; production configuration recorded. | Amit | PostgreSQL-backed HMAC buckets now enforce replica-safe IP and subject limits with independent committed accounting, stable 429/503 contracts, 30-day cleanup, global and domain payload bounds, signed Vercel identity, backend-owned contact delivery, one-shot weekly OpenAI spend, and protected checkout. Real PostgreSQL concurrency proved exact thresholds, expiry recovery, and one OpenAI call/row under concurrent generation; assembled route tests cover all auth mutations, newsletter, and IP-before-auth ordering for Scan/reflection/checkout. Duplicate migration preflight, down/up/current/drift, frontend tests/build/lint, and backend Docker build pass. Independent two-stage review found and drove fixes for IPv6 signing, rollout order, transaction isolation, response headers, preview configuration, bounded provider input, secret independence, and boundary evidence. Keep `Implemented` until the signed Vercel to Azure to PostgreSQL staging matrix and observation-only volumes pass on the exact candidate. See `ABUSE_AND_COST_CONTROLS.md`. |
| SEC-04 | Implemented | Complete the account-security contract: password validation, verified recovery, email policy, refresh-session rotation and revocation, replay detection, and access-token type enforcement. | API tests for weak credentials, recovery, expired/revoked/replayed sessions, logout revocation, and refresh tokens rejected as access tokens. | Amit | Server-recorded 15-minute access/30-day rotating refresh sessions now fail closed, detect replay, revoke on logout/reset, and reject legacy or wrong-type credentials. Passwords use a 12–128 policy with bcrypt-SHA256; email identity is normalized and uniquely constrained case-insensitively. Recovery tokens are hashed, single-use, 30-minute secrets carried in URL fragments; request responses do not enumerate accounts. Scan routes share the authoritative session dependency; Firebase requires a verified Google identity and rejects UID mismatch. Local evidence: 83 backend tests, 88 frontend tests, five PostgreSQL integrations, production build, migration down/up/drift/schema checks, and an assembled Next → FastAPI → PostgreSQL signup/refresh/logout/reset/re-entry journey. The amended independent review repeated the critical PostgreSQL and adversarial probes and found no remaining material SEC-04 issue. Before `Verified`, configure Resend in staging and prove actual email delivery/link opening on the exact candidate. See `ACCOUNT_SESSION_SECURITY.md`. |
| SEC-05 | Implemented | Protect cookie-authenticated mutations from CSRF. Use safe SameSite settings where compatible and enforce Origin and/or CSRF tokens at the authoritative boundary. | Cross-origin adversarial tests covering no-body and JSON mutations through both Next.js and direct backend entry points. | Amit | Auth cookies now use `Secure; SameSite=Lax`; Next rejects unsafe `/api` requests without exact same-origin evidence, and FastAPI rejects cookie/guest-credential mutations or browser auth mutations without an exact trusted origin or fresh signed-BFF proof. Every unsafe proxy is inventoried, including alias exports and the quota-consuming Insight POST hidden behind page rendering. Cross-site or provenance-missing Insight navigation performs no backend call. Local evidence: 151 backend tests (9 skipped), 117 frontend tests, focused JSON/no-body/origin/HMAC adversarial tests, production frontend build, lint with zero errors, and a production backend image build. Independent two-stage review found and drove correction of the hidden Insight navigation path, guest credential, alias-export, recovery-route, production fail-closed, and evidence gaps, then approved the final implementation with no remaining material findings. Keep `Implemented` until exact-candidate Vercel-to-Azure browser/staging probes confirm deployed origin, cookie, signed-proxy, and Insight-grant behavior. See `CSRF_PROTECTION.md`. |
| CONSENT-01 | Implemented | Establish one authoritative notification-consent model. Default optional channels off, verify WhatsApp number ownership, allowlist mutable preference fields, and make every sender honor channel and purpose opt-outs. | Real persistence and provider-adapter tests for opt-in, opt-out, number verification, disabled-purpose no-send, and preference changes before a scheduled run. | Amit | `fc5ac86` makes `UserPreferences` authoritative, migrates ambiguous and missing rows to safe defaults, separates WhatsApp ownership from consent, protects push ownership, and routes scheduler/admin delivery through one dispatch-time consent check. Local evidence: 170 backend tests, 122 frontend tests, real PostgreSQL verification/race/ownership coverage, migration down/up/current/drift checks, lint with zero errors, production frontend build, and an independent two-stage review with no remaining material code finding. Keep scheduler/manual reminders disabled and this item `Implemented` until genuine Twilio and Web Push staging delivery passes on the exact candidate. See `NOTIFICATION_CONSENT.md`. |
| PRIV-01 | Blocked | Define and operate data access, correction, export, deletion, retention, consent withdrawal, and incident-response procedures. Confirm analytics-cookie and international-processor handling with counsel. | Approved procedures, verified support/privacy inboxes, representative export/deletion exercise, retention schedule, processor inventory, and counsel disposition. | Unassigned | Legal pages describe rights and processing, but operational evidence is not repository-owned. |

## P0 payment and entitlement blockers

| ID | Status | Requirement and failure prevented | Minimum closure evidence | Owner | Evidence and notes |
| --- | --- | --- | --- | --- | --- |
| PAY-01 | Blocked | Implement authenticated recurring membership checkout tied to an immutable Neurocient user, provider customer, price, and currency. | Provider sandbox checkout from signed-in user through persisted customer/subscription mapping. | Unassigned | Membership currently uses an external URL or assisted WhatsApp activation. |
| PAY-02 | Blocked | Implement a verified, idempotent membership event ledger and entitlement state machine for activation, renewal, failed renewal, past due, cancellation, expiry, refund, and dispute. | Sandbox lifecycle tests including duplicate, delayed, missing, malformed, and out-of-order events; no browser callback can grant access. | Unassigned | Current membership provisioning is manual. |
| PAY-03 | Implemented | Make paid feature limits authoritative on the server. Prevent local-storage clearing, direct URLs, server-rendered content, or direct APIs from bypassing membership. | API/server-render tests for free, active, expired, cancelled, and stale-entitlement actors across every gated resource. | Unassigned | Insights now check the provider-neutral entitlement before compiling MDX and persist distinct free grants in PostgreSQL (guest 5, account 20, revisits free). Real FastAPI/PostgreSQL tests cover limits, concurrency, invalid and refresh-only session denial, canceled denial, active access, and durable counts; focused policy tests cover stale and expired entitlements. Frontend tests cover cookie/header propagation, prefetch/embed rejection, strict grant validation, and the denied pre-compilation path. A local production Next -> FastAPI -> PostgreSQL exhausted-guest response excluded the MDX sentinel and was private/no-store. Existing Practice, Spots, and Microchallenge limits remain server-enforced. Independent review found no bounded implementation blocker; assembled staging and broader concurrency evidence are still required before `Verified`. See `MEMBERSHIP_ACCESS_CONTROL.md`. |
| PAY-04 | Blocked | Provide customer cancellation and billing management, and reconcile provider state with local entitlements. | Cancellation/renewal/reconciliation sandbox journey plus operator evidence for unmatched and contradictory records. | Unassigned | Include invoices, taxes, currency, refunds, and recurring-charge disclosures in the final checkout contract. |
| PAY-05 | Blocked | Complete cohort captured-payment recovery. Durably execute or schedule required refunds and handle retry, reconciliation, disputes, and operator ownership. | Real PostgreSQL and Razorpay sandbox tests for late capture, capacity conflict, duplicate/out-of-order webhook, provider success/local failure, refund completion, and concurrent final-seat attempts. | Unassigned | Current capacity-conflict path returns `requires_refund: true` without completing a refund. |

## P0 data and recovery blockers

| ID | Status | Requirement and failure prevented | Minimum closure evidence | Owner | Evidence and notes |
| --- | --- | --- | --- | --- | --- |
| DATA-01 | Verified | Replace `create_all()` schema evolution with versioned migrations and a compatible deployment order. | Migration from a production-shaped prior schema, assertions on constraints/data, repeatability check, and documented rollback or forward-repair decision. | Unassigned | Alembic is authoritative; startup no longer mutates schema. Fresh upgrade/downgrade/re-upgrade and drift checks pass. An AES-256 backup passed integrity and full-data isolated restore; guarded reconciliation rehearsed in 633 ms with zero drift. Hosted reconciliation then applied exactly the two expected changes, Supabase was stamped at `20261031_0001 (head)`, `check` and invariants passed, and live `/healthz` returned 200. Independently reviewed. See `SUPABASE_ALEMBIC_ADOPTION.md`. |
| DATA-02 | Blocked | Configure encrypted database backups with owned retention and recovery objectives. | Recorded backup configuration, access controls, retention, RPO/RTO, and alert ownership. | Unassigned | An AES-256 encrypted full `public` schema/data adoption backup now exists and passed integrity/restore checks; its DPAPI-protected recovery key is limited to the current Windows profile. Durable off-machine retention, accountable access, RPO/RTO, and alert ownership are still missing. |
| DATA-03 | Implemented | Prove restoration of private and payment data. | Representative restore into an isolated environment, integrity checks, measured recovery time, and documented runbook corrections. | Unassigned | The encrypted full hosted `public` dump restored into isolated PostgreSQL 17.4 with production-shaped data. Data preconditions passed; reconciliation took 633 ms and zero-diff/stamp/current/check passed. Temporary plaintext was removed. Formal recovery-time target and recurring restore drill remain before Verified. |

## P0 operations and deployment blockers

| ID | Status | Requirement and failure prevented | Minimum closure evidence | Owner | Evidence and notes |
| --- | --- | --- | --- | --- | --- |
| OPS-01 | Blocked | Move every production secret to approved Azure/Vercel secret storage with least privilege and rotation procedures. | Deployed non-secret configuration fingerprint, secret-reference inspection, rotation test for critical credentials, and secret scan of the release artifact. | Unassigned | The deployment runbook records sensitive Azure settings as literal environment values. |
| OPS-02 | Blocked | Add privacy-safe structured logging and correlation across Next.js, FastAPI, jobs, and providers. | One representative success and failure traced end-to-end without credentials, tokens, phone numbers, or private entries in logs. | Unassigned | Several routes return internal exception text or log sensitive payloads. |
| OPS-03 | Blocked | Monitor user and business outcomes: authentication attacks, API failures, payment/webhook/refund state, notification delivery, scheduler health, AI failures/cost, database saturation, and integrity drift. | Alerts tested in observation mode, ownership/escalation recorded, reconciliation output visible, and notification-pipeline failure detectable. | Unassigned | `/healthz` currently proves process response only. |
| OPS-04 | Blocked | Make deployment and recovery executable for the exact candidate artifact. | Clean current-SHA frontend and backend artifacts, current CI green, staging smoke evidence, configuration fingerprint, rollback/forward-repair exercise, and post-deploy checks. | Unassigned | The current development image builds under Python 3.12 and can run `alembic current` against local PostgreSQL. Full container startup without configured Firebase credentials correctly failed at the existing mandatory Firebase boundary; a secret-provisioned image health smoke and staging deployment evidence remain pending. |
| OPS-05 | Blocked | Decide scheduler topology before launch. Until consent is corrected, keep scheduled and manual reminder sends disabled; before API scaling, move schedules to one durable worker or job. | Effective deployed configuration, single-execution proof, restart/duplicate-delivery test, bounded retry behavior, and failure alert. | Unassigned | Embedded APScheduler can duplicate messages when more than one API replica runs. |

## Required release evidence

| ID | Status | Required evidence | Minimum scope | Owner | Evidence and notes |
| --- | --- | --- | --- | --- | --- |
| TEST-01 | Blocked | Real PostgreSQL API integration suite | Authentication, authorization denial, private records, Scan linking, membership limits, payment transactions, admin access, constraints, and concurrency. | Unassigned | Current backend tests are primarily focused/mock tests. |
| TEST-02 | Blocked | Provider contract and sandbox suite | Razorpay membership/cohort lifecycle, Twilio signature and consent behavior, push delivery failure, and OpenAI timeout/quota/degradation. | Unassigned | No provider sandbox was exercised in the review. |
| TEST-03 | Blocked | Assembled staging browser journeys | Vercel to FastAPI to PostgreSQL: signup/login/recovery/refresh/logout, wrong-owner denial, Scan, Practice, membership purchase, reload/re-entry, cancellation, cohort payment, and support recovery. | Unassigned | Record actor, environment, artifact SHA, network/API outcome, and durable state. |
| TEST-04 | Blocked | Mobile-first and accessibility validation | Representative narrow mobile widths and desktop; touch, keyboard, focus, dialogs, validation, screen-reader announcements, contrast, reduced motion, and zoom. | Unassigned | Mobile is the default product boundary under repository guidance. |
| TEST-05 | Blocked | Release quality gates | Frontend tests/build/lint, backend tests, migration check, backend image build/start/health under Python 3.12, dependency and image vulnerability scans, secret scan, and SBOM/provenance where supported. | Unassigned | Backend tests, PostgreSQL migration checks, and a Python 3.12 image build pass in the current development working tree. The image contains Alembic and reports the expected database head. Secret-provisioned container health, frontend gates for the final candidate, lint disposition, vulnerability scans, secret scan, and provenance remain pending. |
| TEST-06 | Blocked | Operational and recovery exercises | Monitoring/alert delivery, reconciliation, scheduler restart, rollback or forward repair, backup restore, and incident/support handoff. | Unassigned | Record exact commands, results, timing, and discovered gaps. |
| TEST-07 | Blocked | Independent release review and owner disposition | Independent findings-first review of the exact release candidate; every material finding corrected, rejected with evidence, deferred with owner/trigger, or accepted as a governed risk. | Unassigned | The 2026-10-31 independent review validates the baseline no-go decision; repeat after material corrections. |

## Improvements allowed after a safe initial launch

These do not override any blocker above. Promote an item when the launch boundary makes its risk material.

| ID | Status | Improvement | Review trigger |
| --- | --- | --- | --- |
| SCALE-01 | Deferred | Add server-side pagination to growing personal collections such as Spots, worksheet history, and challenges. | Before meaningful collection growth or bulk/reporting features. |
| SCALE-02 | Deferred | Replace synchronous provider calls in async paths and add bounded timeouts, backoff, concurrency limits, and graceful degradation. | Before enabling AI/reminders at public scale; promote immediately if latency blocks the single API worker. |
| WEB-01 | Deferred | Add an explicit Content Security Policy and complete browser security headers. | Before enabling third-party checkout/analytics broadly or after the next security review. |
| QUAL-01 | Deferred | Raise meaningful coverage and enforce non-regression, prioritizing auth, payments, permissions, consent, and failure contracts. | With every material change; global threshold after critical paths have outcome-focused tests. |
| UX-01 | Deferred | Remove visible mojibake and resolve the invalid Next.js configuration warning. | Before final public presentation review or framework upgrade. |

## Baseline verification record

Baseline revision: `ad9c74c266afe754175ca07b70042e52a90deab6`

| Check | Baseline result | Evidence boundary |
| --- | --- | --- |
| Frontend tests | 63 passed across 15 files; 73.57% statements, 64.21% branches, 76.45% lines | Focused/component tests with mocked boundaries |
| Frontend production build | Passed; invalid `turbopack.conditions` warning | Compile, type-check, and page generation |
| Frontend lint | Failed with 7 errors and 50 warnings | Static analysis |
| Backend tests | 63 passed, 2 integration tests separately passed; local Python 3.14.2 | Focused tests plus real PostgreSQL authorization and reconciliation coverage |
| Frontend production dependency audit | No reported vulnerabilities | npm advisory database for production dependency graph |
| Python dependency consistency | Passed `pip check` | Installed dependency compatibility, not vulnerability status |
| Backend container | Built under Python 3.12; packaged Alembic reports expected head | Secret-provisioned application startup remains a separate release gate |
| Real PostgreSQL and providers | PostgreSQL authorization and migration reconciliation exercised | Payment/Twilio/OpenAI provider sandboxes remain outstanding |
| Staging and production | Not exercised | Missing assembled/deployed evidence |
| Backup restore and incident response | Encrypted full-data backup integrity and isolated restore passed | Durable off-machine retention, RPO/RTO ownership, alerts, and broader incident drill remain outstanding |

## Release approval record

Do not mark the product ready by editing the decision sentence alone. Record the exact candidate and disposition here after all applicable blockers and evidence items are closed.

| Candidate commit and artifact | Launch boundary | Decision | Decision date | Owner | Residual risks and evidence |
| --- | --- | --- | --- | --- | --- |
| `ad9c74c266afe754175ca07b70042e52a90deab6` | Public paid/private product | No-go | 2026-10-31 | Amit | Baseline primary and independent reviews; blockers recorded above. |
