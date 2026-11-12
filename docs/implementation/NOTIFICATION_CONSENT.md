# Notification channel consent implementation contract

Status: implemented locally; owned-number provider path working; exact-candidate consent journey pending

Contract version: 2.1 (2026-11-12)

## Outcome

Neurocient decides which nudges and check-ins are relevant from current product
state. The user decides whether those messages may leave the product through
browser notifications or the WhatsApp companion. Daily nudges, Spot check-ins,
and active-microchallenge check-ins are product behavior, not three preferences.

## Consent model

- `UserPreferences.push_enabled` is the authority for browser delivery.
- A stored push subscription and browser permission are capabilities, not
  substitutes for current channel consent.
- WhatsApp delivery requires a linked sender, `whatsapp_verified=true`, and
  current `whatsapp_enabled=true` at provider dispatch.
- A signed-in user starts WhatsApp pairing. The server creates a random,
  short-lived, single-use token and returns a `wa.me` link with an explicit
  prefilled message naming Neurocient, relevant nudges/check-ins,
  microchallenge progress, and STOP. STOP is explained at pairing and in Help,
  while Profile retains a direct Disconnect control; it is not repeated on
  every Utility reminder.
- Mobile users may open the prepared message directly. Desktop users remain on
  Neurocient and can scan a QR code with their phone without configuring
  WhatsApp Web. The page checks for the completed connection while the handoff
  is open.
- The user sends that message from WhatsApp. The signed Meta webhook binds the
  actual sender number to the token's account and enables the channel in one
  transaction. No typed phone number, outbound OTP, second toggle, or save step
  is required.
- `STOP` immediately pauses outbound WhatsApp messages while retaining the link;
  `START` explicitly resumes it. Profile Disconnect revokes the link and clears
  the destination.
- The legacy per-purpose booleans remain temporarily for migration compatibility
  but are neither exposed nor consulted by reminder delivery.

## Acceptance criteria

- **CONSENT-02-A:** The profile presents only browser notifications and the
  WhatsApp companion as user choices. Channel actions persist immediately.
- **CONSENT-02-B:** General preference mutation accepts only `push_enabled`.
  Clients cannot set WhatsApp identity, verification, consent, or pairing data.
- **CONSENT-02-C:** Pairing tokens are random, hashed at rest, expire after ten
  minutes, are single-use, and are bound to one signed-in account.
- **CONSENT-02-D:** A sender already owned by another account cannot be
  reassigned. Concurrent or replayed webhooks cannot create two owners.
- **CONSENT-02-E:** The webhook is accepted only after Meta signature and asset
  validation. Token values, contact data, message bodies, and signatures are
  absent from logs.
- **CONSENT-02-F:** Product state controls relevance: Spot reminders respond to
  today's Spot state; microchallenge reminders require an active assignment and
  no check-in today; daily nudges yield to a due microchallenge check-in.
- **CONSENT-02-G:** Every adapter re-reads its channel immediately before the
  provider call. STOP, Disconnect, or push opt-out before dispatch produces no
  later provider call.
- **CONSENT-02-H:** A WhatsApp microchallenge reply updates only the durable
  assignment referenced by that day's sent reminder. `Done`, `Partly`, and
  `Didn't happen` remain truthful progress evidence.
- **CONSENT-02-I:** Pairing never depends on WhatsApp Web. The direct link and
  QR code encode the same short-lived prepared message, reveal no token in page
  copy, and leave the Neurocient page available to confirm connection.

## Failure and recovery

- Invalid, expired, or consumed pairing tokens do not change an account.
- Ownership conflicts preserve the current owner and return neutral guidance.
- Push enablement rolls back the browser subscription if server consent cannot
  be stored. Push disablement stores consent off before capability cleanup.
- Scheduler startup remains disabled by default. Provider staging must pass on
  the release candidate before scheduled WhatsApp delivery is enabled.

## Evidence

- Real PostgreSQL integration covers strict channel mutation, hashed pairing,
  signed inbound connection, replay, duplicate ownership, STOP/START,
  Disconnect, expiry, and response privacy.
- Reminder tests cover channel re-read and prove legacy purpose flags no longer
  authorize or suppress product-selected messages.
- Profile tests cover the channel-only surface, immediate push mutation,
  WhatsApp disconnect, and the direct-link/QR pairing handoff; the production
  frontend build is required.
- On 2026-11-12 the owner confirmed that testing through Neurocient's actual
  configured WhatsApp number works. The Meta test-number `131031` failure is not
  a blocker. Three Utility templates were submitted and approved on 2026-11-12.
  A local FastAPI/PostgreSQL candidate exposed through ngrok then proved all
  three template deliveries, status callbacks, Spot, STOP/START, all three
  Microchallenge outcomes, and duplicate-outcome protection. Disconnect and
  dispatch-time opt-out still require the deployed dev-candidate journey, as
  does repetition of the assembled evidence on the exact release candidate.

## Excluded scope

- Deployed exact-candidate template delivery for all three purposes.
- Marketing campaigns or newsletter consent.
- Removing the legacy purpose/OTP columns; that is a later cleanup migration
  after this application-compatible rollout is established.
