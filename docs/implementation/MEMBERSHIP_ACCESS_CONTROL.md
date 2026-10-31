# Membership access control implementation contract

Status: implemented and independently reviewed; staging verification pending

Base revision: `6f8b69ad94daad7530decf1e40b271294217236d`

## Outcome

Paid access is decided from the provider-neutral PostgreSQL entitlement at the
authoritative server boundary. Clearing browser storage, requesting a direct
Insight URL, or calling a feature API directly cannot turn an exhausted free
allowance into paid access.

This slice completes the access-control foundation. It does not create a
Razorpay checkout, process provider webhooks, or mutate entitlement lifecycle
state.

## Actors and rules

- A guest may open five distinct Insights.
- A signed-in free account may open twenty distinct Insights.
- Reopening an Insight already granted to the same guest or account does not
  consume another free slot.
- An account has paid access only when its entitlement is `active` or
  `trialing` and `current_period_end` is in the future.
- Missing, expired, `inactive`, `past_due`, `canceled`, refunded, disputed, or
  otherwise unknown entitlement states fail closed.
- Practice, Spots, and Microchallenge creation retain their existing
  PostgreSQL-enforced limits.

The guest identifier is an opaque HttpOnly cookie. It prevents local-storage
reset and direct-URL bypass for the current browser identity. A guest can still
clear all site cookies or use a new browser; strong cross-device identity
requires sign-in and is intentionally outside this slice.

## Invariants

- **MAC-01:** Full Insight MDX is not compiled into or returned with a denied
  page response.
- **MAC-02:** Only the backend can grant or consume an Insight allowance.
- **MAC-03:** A unique database record represents each free actor/Insight grant,
  so refreshes and retries are idempotent. Paid views do not consume or create
  free grants.
- **MAC-04:** Concurrent first access cannot exceed an actor's allowance.
- **MAC-05:** An invalid or refresh authentication token cannot be treated as a
  paid account or silently downgraded to a fresh guest identity.
- **MAC-06:** The frontend checks that an Insight exists before requesting
  access. The proxy replaces a missing or malformed guest cookie before the
  access request; any invalid identity reaching the backend, prefetch, or
  cross-site embedded request fails closed without consuming access.

## Evidence

- Focused policy tests cover free, existing, exhausted, paid, and stale states.
- Real FastAPI/PostgreSQL tests cover guest and account limits, revisits,
  expired/canceled denial, active access, durable records, and concurrent
  attempts.
- Frontend tests prove the access request forwards cookies and denied responses
  do not enter the MDX compilation path.
- Alembic upgrade and drift checks prove the new access ledger constraints.
- The final candidate must pass the backend suite and `npm.cmd run build`.
- A local production Next -> FastAPI -> PostgreSQL smoke used an exhausted guest
  against a real Insight. The HTML contained the denial, excluded a unique MDX
  body sentinel, and returned `Cache-Control: private, no-cache, no-store,
  max-age=0, must-revalidate`. Its five temporary ledger rows were removed.
- An independent two-stage review found no material blocker for this bounded
  implementation after refresh-only session downgrade and malformed-success
  response handling were corrected. It retained assembled staging/cache and
  broader concurrency evidence as release-verification gaps.

## Rollout

Deploy in this order: database migration, backend access endpoint, then the
frontend revision that calls it. The endpoint and table are additive. Roll back
the frontend first; retain access-ledger rows during forward repair.

Existing browser-local article history is intentionally not imported. The
server-authoritative ledger begins empty at rollout, giving every actor a fresh
allowance under the new policy.
