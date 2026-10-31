# Twilio webhook security implementation contract

Status: implemented; local release evidence complete, Twilio staging pending

Owner: Amit

Base revision: `a4204a7fc7f55f04bce032bded05ab994956ad22`

## Outcome

Only authentic, well-formed Twilio inbound WhatsApp messages can reach the
message handler. A provider message is processed at most once across retries,
process restarts, and multiple replicas. Responses and logs do not disclose a
sender's phone number, message, account membership, signature, credentials, or
internal exception details.

## Decisions

- Validate `application/x-www-form-urlencoded` requests with Twilio's official
  Python request validator, the primary Auth Token, every received form field,
  and the exact public URL configured in `TWILIO_WHATSAPP_WEBHOOK_URL`.
- Do not derive the signed URL from `Host` or forwarded headers. This avoids
  proxy ambiguity and prevents an attacker from choosing validation input.
- Fail closed when the Auth Token, Account SID, webhook URL, signature, or
  required inbound fields are absent or invalid.
- Limit the complete encoded form to 8 KiB and 64 uniquely named fields;
  reject duplicate names and non-urlencoded content. Limit `Body` to 1,600
  Unicode characters. Require documented Account SID, Message SID, and
  WhatsApp E.164 sender shapes before database access.
- Use Twilio's `MessageSid` as a durable unique replay key. Store only the SID,
  processing state, and timestamps—not the phone number or message body.
- A valid `spot:` message receives the same generic accepted response whether
  or not the sender matches an account. Non-Spot and replayed messages also
  receive a generic accepted response. The response never reveals account
  membership or whether a Spot was written.
- Preserve the existing acknowledgement only for a newly persisted Spot. This
  same-sender acknowledgement intentionally confirms the write to that sender;
  the no-enumeration guarantee applies to the webhook HTTP response, where
  known, unknown, non-Spot, and replay responses are identical.
  The webhook acknowledgement path suppresses outcome logs so it cannot reveal
  account membership by timestamp correlation. Outbound delivery failure does
  not make Twilio retry the inbound write.
- Commit the replay claim and Spot in one transaction before acknowledgement.
  A crash after commit but before acknowledgement accepts an at-most-once
  availability tradeoff: replay will not attempt the acknowledgement again.
- This slice secures the existing inbound flow. Outbound consent policy,
  rate-limiting, and provider sandbox certification remain separate launch
  controls.

## Invariants

- **WA-01:** Missing or invalid Twilio signatures, signatures made for a
  different URL, and requests for a different Twilio account are rejected
  before database lookup, write, or outbound acknowledgement.
- **WA-02:** A well-formed provider `MessageSid` can cause at most one Spot
  write and at most one acknowledgement attempt, including concurrent requests
  and requests handled by different application replicas.
- **WA-03:** Non-urlencoded, duplicate-field, over-8-KiB, over-64-field, and
  malformed content is rejected safely. Message bodies are limited to 1,600
  Unicode characters; empty Spot descriptions do not create records.
- **WA-04:** Authentic known, unknown, non-Spot, and replay webhook responses
  are the same `200 {"status":"accepted"}`. They do not reveal whether the
  sender's phone number is registered or whether processing produced a Spot.
- **WA-05:** Application logs and durable replay records contain no phone
  number, message body, Twilio signature, Auth Token, or provider response
  body. Unexpected failures return a stable generic response.
- **WA-06:** The schema migration is additive, reversible, and deployable
  before application code. Production configuration requires the exact HTTPS
  webhook URL.

## Required evidence

- Focused signature tests cover valid, missing, invalid, wrong-URL, and
  evolving form-field fixtures using the official Twilio validator.
- Real FastAPI/PostgreSQL tests cover authentic write, unknown sender,
  malformed input, sequential replay, and concurrent replay.
- Captured logs and HTTP bodies are inspected using unique canary phone and
  message values; neither may appear. Provider error and internal exception
  canaries must also remain absent.
- Alembic upgrade, downgrade/re-upgrade, current, drift, and schema comparison
  pass from revision `20261031_0003`.
- A provider-signed staging or Twilio sandbox request is required before this
  control moves from `Implemented` to `Verified`.

Local evidence on 2026-10-31: 101 backend tests and seven real PostgreSQL
integrations passed. The webhook coverage includes exact-URL/full-form
signatures, wrong account and URL, request bounds, duplicate fields, malformed
input, known/unknown/non-Spot/empty messages, changed-payload and concurrent
replay, rollback/retry, acknowledgement exceptions, and privacy canaries.
Alembic downgrade/re-upgrade, current, drift, and schema comparison passed, as
did a clean production Docker build with `twilio==9.12.0`.

The independent two-stage review first modeled the pre-change boundary, then
inspected and probed the candidate. It drove bounded raw-form handling,
outcome-neutral webhook logs, complete production configuration, and
post-commit acknowledgement exception containment. The amended review found
no remaining material code issue. No genuine Twilio sandbox request has yet
been run, so SEC-02 remains `Implemented` rather than `Verified`.

## Rollout and recovery

Apply the additive replay-table migration first. Configure
`TWILIO_ACCOUNT_SID`, `TWILIO_AUTH_TOKEN`, `TWILIO_WHATSAPP_NUMBER`, and the
exact HTTPS `TWILIO_WHATSAPP_WEBHOOK_URL`, then deploy the backend and enable
the webhook. If forward repair is needed, disable the webhook and roll back the
backend before downgrading the table.

## Excluded scope

- Consent capture, opt-out handling, template policy, and scheduler ownership
  remain CONSENT-01.
- Edge and account rate limiting remain SEC-03.
- Provider-wide sandbox coverage remains TEST-02.
- Broader structured logging and alerting remain OPS-05 and OPS-06.
