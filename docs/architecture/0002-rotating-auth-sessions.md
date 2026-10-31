# ADR 0002: Server-recorded rotating authentication sessions

Status: accepted

Date: 2026-10-31

## Context

Neurocient previously used self-contained 30-day refresh JWTs. They could be
replayed until expiry and remained valid after logout because the server kept no
session state.

## Decision

Each login creates a PostgreSQL session identified by a UUID. Access and refresh
JWTs include that session identifier. The server stores a SHA-256 hash of the
current refresh credential and validates session state for both access and
refresh operations.

Refresh rotates to a new row within the same family and revokes the consumed
row atomically. A concurrent loser within three seconds receives a conflict and
no credential so a browser tab can retry with the winner's shared cookie. Reuse
outside that window revokes every active row in that family. Logout revokes the
current row. Password reset revokes every session for the user.

## Consequences

- Access checks require a small indexed session lookup in addition to the user
  lookup.
- Database availability is required for authenticated access; failure does not
  broaden authorization.
- Legacy JWTs without a session identifier stop working at rollout.
- Session-family history supports replay investigation without storing raw
  credentials.
- The migration is additive and can be deployed before application code.
