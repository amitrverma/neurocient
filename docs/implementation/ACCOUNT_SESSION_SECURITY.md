# Account and session security implementation contract

Status: implemented; local release evidence complete, staging delivery pending

Owner: Amit

Base revision: `cc7a78d604bcb34f9c519e77611069a270e46f37`

## Outcome

Password accounts have a bounded credential policy, recover through a verified
one-time email link, and use server-recorded sessions whose refresh credentials
rotate once, detect replay, and can be revoked immediately by logout or password
reset. Google/Firebase login uses the same server-side session contract after
Firebase verifies the external identity.

## Decisions

- Email identity is trimmed and case-insensitively canonicalized to lowercase.
- New and reset passwords contain 12 to 128 characters. Passphrases are allowed;
  composition rules are not required. A small explicit set of commonly used
  passwords is rejected.
- Access credentials last 15 minutes. Refresh sessions last 30 days and rotate
  on every successful refresh.
- One refresh succeeds under concurrent use. Reuse within a three-second
  concurrency window returns a conflict without credentials; replay after that
  window revokes the entire session family.
- Logout revokes the presented server session before clearing cookies. Access
  tokens are bound to that session, so logout takes effect immediately.
- Password reset links expire after 30 minutes, are single-use, and revoke every
  existing session for that account when consumed.
- Browser responses keep access credentials in HttpOnly cookies rather than
  returning them in JSON. Reset links carry their one-time secret in the URL
  fragment so it is not sent in HTTP requests, referrers, or server logs.
- Password-reset request responses do not reveal whether an email exists or
  whether the account uses password or Google authentication.

## Invariants

- **AUTH-01:** Every access and refresh credential is bound to one durable
  server session. Missing, revoked, expired, malformed, wrong-type, or unknown
  session identity fails closed.
- **AUTH-02:** Refresh rotation is atomic. Exactly one concurrent use succeeds;
  the short concurrency loser receives no credential and can retry with the
  browser's newly shared cookie. Replay outside that window revokes the session
  family and cannot mint access.
- **AUTH-03:** Logout revokes the presented session even if the browser retains
  copied cookies. A revoked session cannot access `/auth/me` or refresh.
- **AUTH-04:** Signup and password reset enforce the same password and normalized
  email policy at the backend, independent of frontend validation.
- **AUTH-05:** A reset token is stored only as a hash, expires, succeeds once,
  and revokes all account sessions. Request and reset errors never expose
  credentials or account existence.
- **AUTH-06:** Browser auth mutations reach FastAPI through the established Next
  boundary with a non-simple request marker. Missing marker fails closed.
- **AUTH-07:** Legacy stateless credentials without a server session identifier
  fail closed after rollout; users sign in again.
- **AUTH-08:** Browser-readable response bodies and request URLs do not expose
  access, refresh, or password-reset credentials.

## Evidence

- Focused tests cover password/email policy and token validation.
- Real FastAPI/PostgreSQL tests cover signup validation, login session creation,
  refresh rotation, refresh replay, concurrent refresh, logout revocation,
  reset expiry/single use, session revocation after reset, and no account
  enumeration.
- Frontend route tests cover cookie propagation and stable failure handling.
- An assembled local browser or HTTP journey covers login, refresh, logout,
  recovery, and re-entry against PostgreSQL.
- Alembic upgrade, downgrade/re-upgrade, current, drift, and schema comparison
  pass from revision `20261031_0002`.

Local evidence on 2026-10-31: 83 backend tests, 88 frontend tests, five real
PostgreSQL integration tests, the production Next build, Alembic downgrade and
re-upgrade, `alembic check`, and schema comparison passed. An assembled
Next-to-FastAPI-to-PostgreSQL HTTP journey passed signup, `/me`, refresh,
logout/revocation, non-enumerating recovery request, one-time reset, old
password denial, new-password re-entry, and response-body credential checks.
Synthetic records were deleted afterward.

An independent review then found and drove correction of four cross-boundary
defects: Scan routes now use the same durable session dependency; Firebase
login requires a verified Google identity and rejects UID mismatch; logout
revokes every valid presented session even alongside malformed cookies; and
multi-tab refresh conflicts use bounded retry/backoff.

The amended independent review repeated the real PostgreSQL auth/Scan tests,
malformed-cookie logout probe, legacy/revoked Scan probes, focused backend and
frontend tests, and Alembic checks. It found no remaining material issue within
SEC-04 and accepted the candidate for commit as `Implemented`.

## Rollout and recovery

Deploy the additive database migration before the backend and frontend changes.
The release intentionally invalidates legacy stateless cookies. Roll the
frontend back first if forward repair is needed. Retain session and reset audit
rows; do not restore stateless refresh acceptance.

Configure `RESEND_API_KEY`, `RESEND_FROM_EMAIL`, and
`PASSWORD_RESET_BASE_URL` before enabling password recovery. Missing delivery
configuration fails safely without exposing account existence.

## Excluded scope

- Repository-wide IP/account rate limiting and credential-stuffing protection
  remain SEC-03. Password-reset requests include a per-account cooldown, but it
  is not a substitute for edge rate limiting.
- The whole-site CSRF program remains SEC-05. This slice protects its own auth
  mutations with the Next-to-backend request marker.
- MFA, device management UI, breach-password provider lookup, email-address
  verification at initial signup, and Google account recovery are deferred.
