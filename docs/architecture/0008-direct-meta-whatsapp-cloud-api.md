# ADR 0008: Direct Meta WhatsApp Cloud API integration

Status: accepted (2026-11-04)

## Context

Neurocient's WhatsApp companion was implemented against Twilio before provider
testing began. The feature has no production traffic or provider compatibility
obligation. Meta now provides an official hosted Cloud API with test numbers,
webhooks, templates, and delivery statuses. Keeping Twilio would add another
commercial and operational boundary while still depending on Meta's channel
rules.

## Decision

Integrate directly with Meta's WhatsApp Cloud API. Keep provider-specific
webhook verification, payload parsing, Graph API calls, identifiers, and
failure translation inside the WhatsApp service adapter. Preserve the existing
consent, number ownership, product command, access, progress, and reminder
boundaries.

Inbound POST authenticity is the raw-body `X-Hub-Signature-256` HMAC using the
app secret. Subscription verification uses a separately configured private
verify token. Payloads must also match the configured business account and
phone-number IDs. Meta `wamid` values are durable replay/correlation keys.

## Alternatives

- Retain Twilio: less code change, but retains its per-message intermediary
  cost and an additional provider-specific boundary before any rollout.
- Abstract multiple live providers now: offers portability but creates unused
  configuration, test, and operational branches for a pre-release feature.
- Use Meta's on-premises API: unnecessary hosting and lifecycle burden for this
  product stage.

## Consequences

Twilio runtime credentials and SDK dependency are removed. Neurocient owns the
Meta webhook and Graph API adapter, including API-version configuration, token
rotation, template approval, callback subscriptions, and delivery-status work.
The replay column widens from 34 to 255 characters for `wamid` values. Product
and consent behavior do not fork.

## Testability

Unit and HTTP-boundary tests prove challenge verification, raw-body HMAC,
configured asset matching, bounded parsing, status-only callbacks, outbound
Graph requests, and privacy. Real PostgreSQL tests prove replay concurrency,
shared progress, access limits, and rollback/retry. Genuine Meta test-number
send/receive evidence remains the release gate.

## Operability

All six Meta settings are explicit and partial configuration fails startup.
Logs contain categorical outcomes only. A provider rejection is distinct from
an uncertain transport/5xx outcome; committed inbound mutations are never
rolled back by a reply failure. The callback can be disabled at Meta while the
existing scheduler kill switch stops optional sends. Delivery status
reconciliation and durable outbound retries are deferred and must be completed
before broad traffic if their absence is no longer acceptable.

## Reversal

A future provider must implement the adapter's inbound authenticity/payload and
outbound outcome contracts. The provider-neutral product rules, consent state,
and widened replay storage can remain. Downgrade to the legacy 34-character
column is blocked while longer replay keys exist.

## Review trigger

Revisit this decision if Meta materially changes Cloud API availability or
pricing, direct account operations become too burdensome, a second channel
provider is required for resilience, or measured volume makes a managed BSP's
support and tooling worth its additional cost.
