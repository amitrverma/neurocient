# Supabase Alembic adoption

Status: adopted and verified on hosted Supabase
Observed: 2026-10-31
Hosted PostgreSQL: 17.4

Hosted execution completed on 2026-10-31. The guarded preflight found exactly
the two rehearsed differences, reconciliation applied them transactionally,
managed metadata comparison returned zero differences, and Supabase was stamped
at `20261031_0001 (head)`. `alembic check` reported no new operations; invariant
queries reported an Alembic marker, zero null emails, zero saved-article
duplicate keys, and zero legacy subscriber rows. The live Azure Container App
returned HTTP 200 from `/healthz`.

## Verification result

A read-only comparison reached the database configured on the Azure Container
App and compared its public schema directly with current SQLAlchemy metadata.
The hosted database has no `alembic_version` marker. After aligning the model
with the stronger hosted invariants and excluding only the retained legacy
`subscribers` table, the hosted database differs from managed metadata in two
expected operations.

Aggregate safety checks returned:

- zero users with a null email;
- zero waitlist entries with a null email;
- zero duplicate `(user_id, article_id)` saved-article keys;
- zero rows in the legacy `subscribers` table.

No personal values were selected or written during verification.

A PostgreSQL 17.4 `pg_dump` schema-only snapshot of the hosted `public` schema
was written to the local system temp directory for this verification session:

- size: 31,261 bytes;
- SHA-256: `3A2A04F883F5820DF1F6550B92FBBEE5405F90A3F2E2126BB55A6BF3FECD8B8D`;
- options: schema-only, no owner, no privileges, no table data.

This temporary schema snapshot remains comparison evidence only. A separate
encrypted production-data backup and restore exercise is recorded below.

## Encrypted data backup and restore evidence

Before hosted mutation, PostgreSQL 17.4 `pg_dump` captured the complete hosted
`public` schema and data in custom format. The plaintext dump was immediately
packed into an AES-256, header-encrypted 7-Zip archive, the archive passed a
password-protected integrity test, and plaintext copies were removed from both
the host and Docker container.

- archive: `neurocient-supabase-public-20261031-093203.dump.7z`;
- location: the current user's `Documents\Neurocient Backups` directory;
- encrypted size: 92,834 bytes;
- SHA-256: `19EAC78E5BF03723655DC9BC0182DC5EB92C553C02670736E60B9B158A0C9930`;
- recovery key: adjacent `.key.dpapi` file, successfully round-tripped and
  decryptable only by the current Windows user profile.

The archive was then decrypted temporarily and restored into the isolated
database `neurocient_data_rehearsal`. With the restored production-shaped data,
the preflight again found zero null user emails and zero duplicate saved-article
keys. Reconciliation completed in 633 ms, produced zero managed-schema
differences, and passed stamp/current/check. Temporary plaintext was removed
after restore.

This is a sound immediate rollback asset for baseline adoption. It does not by
itself establish durable off-machine retention, alerting, organizational access,
or long-term RPO/RTO ownership; those remain DATA-02 operational work.

## Dispositions and remaining hosted changes

- Hosted Supabase retains an empty legacy `subscribers` table. It is explicitly
  excluded from Alembic autogeneration and remains unmanaged; other reflected
  tables are not broadly excluded.
- The hosted `microchallenge_logs.assignment_id` foreign key is named and uses
  `ON DELETE CASCADE`; the model and empty-database baseline now preserve it.
- Hosted `saved_articles` lacks the model's unique `(user_id, article_id)`
  constraint. This is one of the two guarded hosted reconciliation changes.
- Hosted `users.email` is nullable while the model requires it. Current data is
  safe to constrain because no null emails exist. This is the other guarded
  hosted reconciliation change.
- Hosted phone-number uniqueness is represented by a named unique constraint
  plus a separate index; the model and baseline now use the hosted names and
  representation.
- Hosted `waitlist.email` is non-null; the model and baseline now preserve it.

## Isolated adoption rehearsal

The schema-only PostgreSQL 17.4 snapshot was first restored into the disposable
local database `neurocient_adoption_rehearsal`. The guarded command reported
exactly the two expected changes. Applying it:

- acquired a transaction-scoped advisory lock;
- enforced five-second lock and thirty-second statement timeouts;
- required exact confirmation of both the configured host and
  `current_database()`;
- rejected null emails, duplicate saved-article keys, conflicting constraints,
  missing schema objects, and an existing Alembic marker;
- applied both DDL changes atomically and verified their postconditions.

Afterward, the managed schema had zero metadata differences. Stamping revision
`20261031_0001`, running `alembic current`, and running `alembic check` all
succeeded. A separate fresh empty database also upgraded to the baseline with
zero drift. The later encrypted full-data restore repeated the same sequence
against production-shaped data as described above.

## Required adoption sequence

Completed prerequisites and hosted execution:

1. The read-only preflight was repeated immediately before mutation.
2. Host and database fingerprints were confirmed and reconciliation succeeded.
3. Structural comparison returned zero managed differences.
4. Revision `20261031_0001` was stamped deliberately.
5. `current`, `check`, invariant queries, and live health all passed.

Never run the empty-database baseline directly against the current hosted
database. Its online guard intentionally rejects non-empty unversioned schemas.
