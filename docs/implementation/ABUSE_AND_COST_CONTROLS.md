# Abuse and provider-cost controls implementation contract

Status: implemented; staging verification pending

Owner: Amit

Base revision: `de4682dba356bbdc174f6ecbe550ab6fa8f792d3`

## Outcome

Public and authenticated entry points that can create accounts or private
state, test credentials, send email, call OpenAI, or create payment-provider
objects have bounded request rates and payloads at the authoritative backend.
Limits remain effective across process restarts and multiple API replicas,
do not disclose whether an account exists, and do not store raw IP addresses,
emails, tokens, or session credentials.

## Protected surfaces and policy

Limits are fixed windows. A request counts whether its eventual business
operation succeeds or fails.

| Surface | IP limit | Subject limit | Subject |
| --- | ---: | ---: | --- |
| Password login | 30 / 5 min | 10 / 15 min | normalized email |
| Signup | 5 / hour | 3 / day | normalized email |
| Session refresh | 120 / 5 min | 30 / 5 min | refresh-token digest |
| Password-reset request | 5 / hour | 3 / hour | normalized email |
| Password-reset confirmation | 10 / hour | 5 / hour | reset-token digest |
| Firebase login | 20 / 5 min | 10 / 5 min | submitted token digest |
| Scan creation | 20 / hour | 30 / hour | authenticated user, when present |
| Newsletter signup | 5 / hour | 3 / day | normalized email |
| Contact email | 3 / hour | 3 / day | normalized email |
| Weekly AI reflection | 10 / day | 3 / day | authenticated user |
| Cohort checkout | 20 / hour | 10 / hour | authenticated user |

Provider webhooks are excluded from generic rate limiting. Their signature,
payload bounds, replay protection, and idempotency own that boundary; limiting
legitimate retries could lose provider state.

## Decisions

- PostgreSQL is the launch-stage distributed rate-limit store. Each policy and
  HMAC-derived identity owns one row updated atomically with `INSERT ... ON
  CONFLICT`. No raw identifier is persisted.
- `RATE_LIMIT_KEY_SECRET` is independent from JWT/provider secrets. Production
  startup requires rate limiting enabled and a secret of at least 32
  characters. Development may disable it explicitly; a missing/failed limiter
  in production fails the protected operation closed.
- Vercel server routes sign the client IP, backend method, path, and timestamp
  with `ABUSE_PROXY_SECRET`. FastAPI accepts the forwarded identity only after
  constant-time verification and a short timestamp window. Direct Azure
  Container Apps traffic uses the rightmost ingress-provided
  `X-Forwarded-For` address; raw addresses are immediately HMAC-derived.
- A denied request returns `429`, a whole-second `Retry-After`, `Cache-Control:
  no-store`, and `{"detail":{"code":"rate_limited","retry_after":N}}`.
  The response does not reveal which dimension was exhausted or whether an
  account exists.
- Mutation request bodies are capped at 256 KiB before application parsing.
  Smaller domain bounds remain authoritative: contact name 100 characters,
  message 4,000 characters, Firebase token 4,096 characters, and Scan version,
  scenario, response, evidence, and portrait structures are bounded.
- Contact delivery moves behind FastAPI so the same durable limiter owns both
  direct and Vercel-proxied entry. The browser-visible behavior remains a
  generic success or safe unavailable response.
- Weekly reflection generation is idempotent per user and calendar week. A
  repeat within the IP abuse quota returns the stored reflection without
  consuming the user/provider quota or calling OpenAI. Provider calls
  have a finite timeout, a 12,000-character input ceiling, and bounded output.
  A calendar-week provider-attempt bucket is consumed immediately before the
  call. Because a timeout has an unknowable provider outcome, it is not retried
  automatically that week; support may investigate and deliberately clear the
  pseudonymous attempt bucket if the provider confirms no work was performed.
- Buckets older than 30 days are deleted by an indexed, at-most-hourly cleanup.
  Rotating `RATE_LIMIT_KEY_SECRET` resets active identity buckets and strands
  old hashes until cleanup, so rotation is an incident operation rather than
  routine deployment work.
- Fixed windows permit a boundary burst of up to twice the nominal limit.
  This known launch-stage tradeoff is accepted in exchange for a small,
  inspectable PostgreSQL implementation. Revisit when traffic or replicas make
  a managed edge/Redis limiter operationally justified.

## Invariants

- **ABUSE-01:** Every listed surface enforces both applicable dimensions before
  credential verification, durable business mutation, email delivery, OpenAI
  use, or payment-provider creation.
- **ABUSE-02:** Parallel requests across independent database sessions cannot
  exceed the configured window count. Restarting a process or adding a replica
  does not reset limits.
- **ABUSE-03:** Limit decisions and logs never persist or emit raw IP, email,
  password, provider token, reset token, refresh credential, Firebase token, or
  request body. Responses do not expose the exhausted dimension.
- **ABUSE-04:** Missing, stale, malformed, or wrongly signed proxy identity is
  ignored; it cannot choose another actor's IP bucket. Direct ingress identity
  remains available as the safe fallback.
- **ABUSE-05:** Oversized requests are rejected before JSON/form parsing and
  before database or provider effects. Domain payloads reject excessive nested
  or string content with stable `4xx` responses.
- **ABUSE-06:** Limiter database/configuration failure produces a stable safe
  `503` and no protected business/provider effect. A normal limit produces the
  stable `429` contract and a truthful `Retry-After`.
- **ABUSE-07:** One user/week can create at most one OpenAI-backed weekly
  reflection. Retry, refresh, and concurrent generation return one durable
  result and cannot multiply provider spend.
- **ABUSE-08:** Payment checkout reuses its existing live order and cannot call
  Razorpay after either the user or IP limit is exhausted. Signed provider
  webhooks remain unaffected.

## Evidence

- Focused policy tests cover exact threshold, first denial, expiry/reset,
  retry-after, privacy-safe keys, disabled-development behavior, configuration,
  and signed/stale/forged proxy identity.
- Real FastAPI/PostgreSQL tests use independent sessions to cover sequential
  and concurrent threshold enforcement, restart persistence, no forbidden
  mutation/provider call, and stable recovery after window expiry.
- Route tests cover login/account non-enumeration, Scan creation, newsletter,
  contact delivery, weekly-reflection idempotency/provider failure, and payment
  checkout/provider-call absence after denial.
- Frontend route tests prove signed client identity is attached to every
  protected Vercel proxy and that contact no longer calls Resend directly.
- Payload tests cover missing `Content-Length`, oversized streamed bodies,
  boundary values, and no downstream side effects.
- Alembic upgrade, downgrade/re-upgrade, current, drift, and schema comparison
  pass from `20261031_0004`. A bounded concurrency/load probe records allowed,
  denied, latency, database rows, and recovery.
- Staging must verify Vercel signatures, Azure ingress identity, effective
  production configuration, and observation-only rate-limit volumes before
  SEC-03 moves from `Implemented` to `Verified`.

## Rollout and recovery

Apply the additive rate-limit table migration and run the duplicate
`(user_id, week_start)` preflight before deploying application code. Configure
the same `ABUSE_PROXY_SECRET` in Vercel and FastAPI and an independent
`RATE_LIMIT_KEY_SECRET`. Deploy the signed frontend proxies first: the old
backend ignores the extra headers. Confirm signature coverage, then deploy the
backend with `RATE_LIMIT_ENABLED=true`; this avoids temporarily combining
unrelated users in Vercel's egress-IP bucket. Observe `429` and safe
limiter-failure reason codes without logging identifiers. Roll back backend
enforcement first, then frontend; retain the additive table during repair.

## Excluded scope

- Volumetric DDoS protection and bot challenges remain platform/WAF controls;
  database-backed application limits are not a substitute.
- Alert routing and long-term rate-limit dashboards remain OPS-03/OPS-06.
- Provider-specific lifecycle correctness remains PAY-01/PAY-02/PAY-05 and
  TEST-02.
- General CSRF protection remains SEC-05.

## Local candidate evidence

- Backend suite: 117 passed and nine integration tests were intentionally
  skipped in the unit run; focused abuse suites passed 16/16 independently.
  The assembled HTTP tests exercise all six
  auth mutations, newsletter, and IP-before-auth ordering for Scan creation,
  reflection generation, and checkout. Provider sentinels prove denial occurs
  before password work, Resend delivery, and Razorpay work.
- PostgreSQL: 20 simultaneous requests produced exactly five allows and 15
  denials with a measured 708.6 ms p95 on the local Docker database, preserved
  a count of five, and recovered to count one after expiry. Three simultaneous
  weekly-reflection requests produced one OpenAI call, one row, and one result;
  the provider prompt stayed within 12,012 characters.
- Payloads: exact/over global body limits, chunked bodies without
  `Content-Length`, Scan scenario/nesting/non-finite/32 KiB boundaries,
  contact 100/4,000-character boundaries, and Firebase 4,096/4,097-character
  token boundaries are covered.
- Migration: clean downgrade/re-upgrade/current/drift checks pass. A controlled
  legacy fixture with duplicate `(user_id, week_start)` rows aborted 0005 with
  the documented clear error and no partial upgrade; after probe cleanup the
  upgrade reached `20261031_0005 (head)` and `alembic check` reported no drift.
- Frontend: cross-language IPv4/expanded-IPv6 signatures, production/preview
  fail-closed configuration, all protected proxy wiring, and safe propagation
  of `Retry-After`/`Cache-Control` are covered. The production Next build,
  lint with no errors, and backend Docker build pass.
- The independent two-stage review found and drove fixes for rollout order,
  transaction isolation, IPv6 canonicalization, proxy response headers,
  preview configuration, reflection query bounds, distinct secrets, route
  ordering, provider side-effect absence, migration preflight, and payload
  boundary evidence. Staging remains required before `Verified`.

