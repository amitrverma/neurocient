# Meta WhatsApp Cloud API security implementation contract

Status: implemented locally; owned-number provider path working; exact-candidate evidence pending

Owner: Amit

Contract version: 1.0 (2026-11-04)

## Outcome

Only authentic, well-formed Meta WhatsApp webhook messages for Neurocient's
configured business account and phone number can reach the message handler. A
provider message is processed at most once across retries, restarts, and
multiple replicas. Responses and logs do not disclose a sender's phone number,
message, account membership, signature, credentials, or provider response.

## Decisions

- Complete Meta's GET subscription challenge only when `hub.mode` is
  `subscribe` and `hub.verify_token` matches Neurocient's private configured
  verification token using a constant-time comparison.
- For POST callbacks, validate `X-Hub-Signature-256` as an HMAC-SHA256 over the
  exact raw request body using the Meta app secret before parsing JSON or
  accessing the database.
- Accept messages only for the configured WhatsApp Business Account ID and
  Phone Number ID. Status-only callbacks are valid no-ops.
- Limit the complete JSON body to 64 KiB and bound entries, changes, messages,
  message IDs, sender numbers, and text before database access. Unsupported
  message types are acknowledged without treating their content as commands.
- Use Meta's `wamid` as the durable unique replay key. Store only that provider
  identifier, processing state, and timestamps—not the sender or message body.
- Return the same generic HTTP response for authentic known, unknown,
  unsupported, non-command, and replayed messages. Commit the replay claim and
  any Spot or Microchallenge mutation in one transaction before attempting an
  acknowledgement.
- Treat an acknowledgement transport failure or a Meta 5xx as an uncertain
  outbound result. It must not roll back the committed inbound mutation or
  cause a blind retry within the webhook transaction.
- Send outbound messages directly through the versioned Meta Graph API with a
  bearer token and configured Phone Number ID. Accept success only when the
  provider returns a well-formed `wamid`.

## Invariants

- **WA-01:** Missing, malformed, or invalid POST signatures and callbacks for a
  different business or phone-number identity are rejected before database
  lookup, write, or outbound acknowledgement.
- **WA-02:** A well-formed provider `wamid` can cause at most one Spot or
  Microchallenge write and at most one acknowledgement attempt, including
  concurrent requests handled by different replicas.
- **WA-03:** Non-JSON, over-64-KiB, structurally malformed, over-bounded, and
  invalid sender/message inputs fail safely. Product command text remains
  bounded to 1,600 characters.
- **WA-04:** Authentic known, unknown, unsupported, non-command, status-only,
  and replay callbacks receive an outcome-neutral response that does not reveal
  account membership or whether a record was written.
- **WA-05:** Logs and durable replay records contain no phone number, message
  body, app secret, access/verify token, webhook signature, or provider body.
- **WA-06:** Production and partially enabled local configuration fail startup
  unless all six Meta settings are present, account/phone IDs are numeric,
  credentials meet minimum lengths, app and verify secrets are independent,
  and the Graph API version has the expected `v<major>.0` shape.
- **WA-07:** The replay-key migration is deployable before application code and
  blocks downgrade when a stored identifier cannot fit the legacy 34-character
  column.

## Required evidence

- Focused unit and HTTP-boundary tests cover the GET challenge, valid/missing/
  invalid HMAC signatures, raw-body sensitivity, wrong account/phone identity,
  batched messages, status callbacks, malformed and bounded input, replay, and
  privacy canaries.
- Real FastAPI/PostgreSQL tests cover authentic writes, unknown senders,
  sequential and concurrent replay, shared Microchallenge outcomes, Spot access
  limits, rollback/retry, and post-commit acknowledgement failure.
- Outbound adapter tests prove the versioned Graph URL, bearer authentication,
  destination normalization, returned `wamid`, provider rejection, uncertain
  outcomes, and privacy-safe logging.
- Alembic upgrade, guarded downgrade/re-upgrade, current, drift, and schema
  comparison must pass.
- A genuine callback and send using Neurocient's configured WhatsApp number is
  required before this control moves from `Implemented` to `Verified`. The
  owner confirmed that path working on 2026-11-12; retain exact deployment and
  callback evidence during release-candidate verification before changing the
  checklist status.

Local evidence on 2026-11-04: 292 backend non-integration tests passed. The 60
focused configuration, adapter, and webhook tests passed, as did four real
Meta/PostgreSQL scenarios and the notification-consent integration. The schema
downgraded to `20261103_0014`, re-upgraded to `20261104_0015`, and reports that
revision as head. The production frontend build passed. A genuine Meta test
number message then passed the public challenge, HMAC-protected callback,
configured-asset checks, durable replay claim, and status-callback response.
Meta accepted outbound requests and returned a `wamid`, but its authoritative
delivery callback failed them with `131031 Business Account locked`; Business
Support Home showed no portfolio or WABA issues. This test-number-specific
failure is historical and is not a launch blocker. On 2026-11-12 the owner
confirmed successful testing through Neurocient's actual configured WhatsApp
number. The repository does not yet retain the exact frontend, backend, schema,
request, callback, and account-visible result for that run, so exact-candidate
verification remains pending.

## Rollout and recovery

Apply revision `20261104_0015` before the application code. Configure
`WHATSAPP_ACCESS_TOKEN`, `WHATSAPP_APP_SECRET`, `WHATSAPP_VERIFY_TOKEN`,
`WHATSAPP_BUSINESS_ACCOUNT_ID`, `WHATSAPP_PHONE_NUMBER_ID`, and
`WHATSAPP_GRAPH_API_VERSION`. Start the backend on the candidate, expose its
HTTPS callback, then use Meta's webhook verification flow and subscribe to the
`messages` field. If forward repair is needed, unsubscribe or disable the
callback before rolling back application code. Do not downgrade the replay-key
column while any stored key exceeds 34 characters.

## Excluded scope

- Consent, opt-out, templates, and scheduler ownership remain CONSENT-01 and
  `WHATSAPP_COMPANION.md`.
- Durable outbound reply records, delivery-status reconciliation, and provider
  retry orchestration remain deferred companion work.
- Edge/account rate limiting remains SEC-03; provider-wide live evidence
  remains TEST-02.
