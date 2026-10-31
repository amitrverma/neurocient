# ADR 0003: PostgreSQL-backed abuse rate limits

Date: 2026-10-31

Status: accepted for launch-stage implementation

## Context

Neurocient has public traffic split between Vercel server routes and a public
FastAPI service on Azure Container Apps. It has no managed Redis or shared edge
rate-limit store. In-process counters reset on deployment and diverge across
replicas. Vercel-proxied requests also reach FastAPI from shared Vercel egress
addresses, so naïve backend IP extraction would combine unrelated users.

## Decision

Use PostgreSQL atomic fixed-window buckets keyed by policy plus an HMAC-derived
identity. Use signed, short-lived Vercel-to-FastAPI client identity headers and
the Azure ingress-provided rightmost forwarded address for direct requests.
Require rate limiting and independent secrets in production.

## Alternatives

- In-memory middleware was rejected because deploys and replicas reset or
  partition enforcement.
- A new managed Redis/Upstash service would provide better high-volume
  isolation, but adds infrastructure, credentials, cost, and an unowned
  operational dependency before current traffic justifies it.
- Vercel/Azure WAF rules remain desirable for volumetric traffic but cannot by
  themselves enforce account, credential, user, or provider-cost dimensions
  across both hosting boundaries.

## Consequences

Limits are durable, replica-safe, locally testable, and require no new service.
Every protected request adds a small indexed database write, and a distributed
attack can still pressure PostgreSQL before an edge control intervenes. Fixed
windows allow a boundary burst up to twice the nominal count. Identifiers are
not reversible without the independent HMAC secret.

Buckets are retained for 30 days and removed opportunistically at most hourly.
Changing the HMAC key resets active limits and leaves old hashes unreadable
until cleanup, so key rotation requires an incident decision and observation.

## Testability

Real PostgreSQL tests can exercise atomic thresholds, concurrency, expiry,
restart persistence, schema drift, privacy-safe storage, and route side-effect
absence. Proxy signatures are deterministic and independently testable in
Python and TypeScript.

## Operability

Production startup fails if protection or secrets are missing. Stable 429/503
contracts distinguish ordinary saturation from limiter failure without
disclosing identities. Operators can inspect counts by policy and timestamps,
not by person. Platform HTTP logs remain the source for raw ingress diagnosis
under restricted access.

## Reversal

The route policy interface and HMAC identity scheme can be retained while the
bucket repository moves to managed Redis or an edge provider. The additive
table may remain through rollback and be removed only after no deployed
revision uses it.

## Review trigger

Revisit when sustained protected traffic exceeds 20 requests/second, database
write latency materially affects user paths, API replicas scale beyond the
launch topology, a managed WAF/Redis service gains an owner, or observed abuse
shows fixed windows or IP/account dimensions are insufficient.
