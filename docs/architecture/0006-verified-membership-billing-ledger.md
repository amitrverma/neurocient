# ADR 0006: Verified membership billing ledger

Date: 2026-11-01

Status: accepted

## Context

Recurring membership changes paid authorization and creates an external side
effect that Razorpay cannot safely deduplicate with an application-provided
idempotency key. Browser callbacks are forgeable, webhooks are at-least-once and
out of order, and a provider response can be lost after subscription creation.
The existing cohort payment webhook has different fulfilment and recovery rules.

## Decision

Use a membership-specific Razorpay adapter, endpoint, webhook secret, checkout
operation, and durable event ledger. Persist the checkout operation before the
provider call. Reuse a ready subscription; block `creating` or `unknown`
operations for reconciliation. Never automatically retry an uncertain create.

Verify the configured plan fingerprint before creation. Verify webhook HMAC on
the exact raw body, require Razorpay event identity, atomically deduplicate in
PostgreSQL, and change only the current mapped subscription. Apply lifecycle
events through a monotonic restriction-first reducer. Active access additionally
requires a future provider paid-through time. A new purchase replaces a terminal
subscription generation so events for the older ID cannot mutate current access.

Keep cohort payment records and handlers separate. Feature routes continue to
depend only on provider-neutral `membership_entitlements`.

## Consequences

- Lost provider responses need operator/provider reconciliation instead of an
  automatic retry.
- Deployment must explicitly supply the bounded Razorpay billing count.
- The event ledger and checkout state provide read-only diagnostics without
  storing full provider payloads or card details.
- Genuine Razorpay test-mode lifecycle evidence is still required before live
  enablement.
