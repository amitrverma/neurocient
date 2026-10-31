# ADR 0001: Versioned PostgreSQL migrations

Date: 2026-10-31
Status: Accepted for development; hosted comparison complete, reconciliation pending

## Context

The backend previously called SQLAlchemy `create_all()` during every process
startup. That can create missing tables, but it cannot safely evolve existing
columns, constraints, indexes, or data. Local development also connected
directly to the hosted Supabase database, making ordinary development changes
capable of affecting shared data.

## Decision

- PostgreSQL 17.4 in Docker is the default local development database, matching
  the currently observed Supabase server version.
- Alembic revisions are the authoritative record of schema evolution.
- Application startup validates configuration but never creates or migrates
  schema.
- Migrations run as an explicit deployment step before application traffic is
  moved to a revision that requires them.
- The initial revision must build a new empty database and remain drift-free
  against the current SQLAlchemy metadata.
- The existing Supabase database will not be stamped or migrated until its
  schema has been exported, compared with the baseline, backed up, and any
  differences have been reconciled.

## Alternatives

- Continue using `create_all()`: rejected because it provides no ordered schema
  history or safe upgrade path.
- Continue developing against Supabase: rejected because it increases blast
  radius and makes destructive tests unsafe.
- Run migrations automatically at API startup: rejected because multiple
  replicas can race and application rollout becomes coupled to schema mutation.

## Consequences

Developers must start PostgreSQL and run `alembic upgrade head` before the
backend. Every schema change requires a reviewed revision. Deployment gains an
additional explicit step and must preserve application/schema compatibility
during rolling releases.

## Testability

The baseline is checked by upgrading an empty PostgreSQL database, confirming
the expected head, running `alembic check`, exercising application startup, and
performing a base-to-head rebuild. Hosted adoption additionally requires a
schema comparison and production-shaped upgrade evidence.

`alembic upgrade head --sql` is available for review, but its generated SQL
cannot carry the runtime non-empty-schema inspection. Execute migrations through
online Alembic after the target database has passed the adoption checks; do not
apply offline output directly to an arbitrary database.

## Operability and recovery

Migration logs and the `alembic_version` table identify the applied revision.
Forward repair is preferred once a migration has reached a shared environment.
Downgrade support is decided per revision; destructive downgrades require an
explicit backup and restore plan.

## Reversal and review trigger

Reversal requires restoring automatic schema creation or adopting another
migration authority. Revisit this decision if Supabase introduces an external
schema authority that must coexist with Alembic, or if rolling-deployment
requirements demand a stricter expand-and-contract policy.
