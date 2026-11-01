# ADR 0007: Operational control plane and dedicated scheduler worker

Date: 2026-11-01

Status: accepted

## Context

The API process currently embeds APScheduler, logs mostly unstructured text,
and exposes only process liveness. More than one web replica could execute the
same reminders. Payment contradictions and uncertain provider outcomes are
distributed across product tables and require code inspection to discover.

## Decision

Use a small provider-neutral operational control plane in PostgreSQL:

- request correlation and JSON events are application infrastructure, with an
  allow-listed field vocabulary;
- a dedicated worker process owns schedules, while web processes never start
  them;
- durable schedule and notification-dispatch claims make duplicate or
  uncertain external effects visible and non-replayable by default;
- a generic reconciliation-issue ledger records observation-only payment and
  delivery contradictions while product-specific services retain authority;
- durable wrapping cursors guarantee eventual coverage for every bounded
  reconciliation stream rather than repeatedly inspecting the first batch;
- liveness, readiness, and authenticated operational state remain distinct.

## Alternatives

- Keep APScheduler in a single web replica: rejected because replica count is
  an unsafe correctness boundary and prevents normal scaling.
- Adopt a managed queue immediately: deferred until workload and operational
  ownership justify the additional service. The durable claims preserve a
  migration path.
- Automatically repair provider differences: rejected for initial rollout
  because observation volume and false-positive behavior are not established.

## Consequences

Deployments need a separate worker command and must leave the legacy embedded
scheduler disabled. PostgreSQL becomes the coordination boundary. Unknown
external completion intentionally requires reconciliation instead of automatic
retry. Operational rows require bounded retention work before high volume.

## Testability

Focused tests cover formatting and state comparison. PostgreSQL integration
tests cover unique claims, lease expiry, issue deduplication, wrapping
multi-batch coverage, and bounded operational queries. Provider and
multi-process production evidence remains a release gate.

## Operability

The worker emits run outcome, attempt, correlation, and safe counts. Readiness
checks configuration and database reachability. Admin-only operational state
surfaces unresolved issues and stale work. External alert routing begins in
observation-only mode later.

## Reversal

The additive tables can remain while schedule execution moves to Azure Jobs or
another queue. Web startup no longer depends on the worker. Do not remove claim
or issue history while unresolved uncertain outcomes exist.

## Review trigger

Revisit when schedules require sub-minute latency, worker throughput exceeds a
single process, PostgreSQL coordination becomes material load, or a managed
queue/job platform is adopted.
