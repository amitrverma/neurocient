# Payment products

Status: approved product contract; implementation under verification

Owner: Amit

Last amended: 2026-11-01

## Canonical offers

Neurocient has two distinct paid products. They must not share fulfilment state,
webhook state machines, or access consequences.

| Product | Provider shape | Canonical charge | Fulfilment |
| --- | --- | --- | --- |
| Membership | Recurring Razorpay subscription | INR 499 each month (49,900 minor units) | Active provider-verified entitlement unlocks the self-guided membership |
| Modern Caveman | One-time Razorpay order for a published cohort | INR 21,000 (2,100,000 minor units) | Captured, verified payment confirms one seat in the selected cohort |

“Equivalent” means any conversion displayed or applied by the payment provider,
card issuer, or customer bank. Neurocient does not calculate or persist a live FX
rate in this implementation. The backend sends the canonical charge and currency
above and verifies the same values on provider events.

## Global commerce direction

Neurocient is intended to become a globally purchasable platform. INR remains
the sole authoritative launch currency for both current paid products while the
international payment method, recurring-card, compliance, settlement, refund,
and reconciliation paths are validated. An overseas customer may use an
international payment method only when Razorpay has enabled that capability;
this does not make a converted display amount an authoritative Neurocient price.

Multi-currency pricing is a later, explicit product and billing change. It must
use versioned currency-specific offers and provider plans rather than replacing
the INR environment variables or applying a browser-calculated FX rate. Existing
INR subscriptions and their renewals must continue to validate against the offer
they originally purchased. Revisit this decision after international recurring
payments are approved and proven, or when sustained non-India demand justifies
owned USD, EUR, GBP, or other local-currency offers.

## Boundaries

- Membership payment never creates a cohort enrolment.
- Modern Caveman payment never grants or renews membership access.
- Both checkouts require an authenticated Neurocient user and server-created
  provider objects tied to immutable local records.
- Browser callbacks are presentation-only. Only authenticated, durably recorded
  provider events may grant access or confirm a seat.
- A missing, incomplete, or contradictory provider configuration fails closed.
- Price and currency are authoritative backend invariants, not editable browser
  values. Modern Caveman cohort administration may change schedule and capacity,
  but not the canonical offer price in this release.

## Evidence required before live charging

- Genuine Razorpay test-mode membership subscription: activation, renewal,
  failed renewal, cancellation, duplicate/delayed delivery, refund, and dispute.
- Genuine Razorpay test-mode Modern Caveman order: capture, duplicate/delayed
  delivery, full-capacity conflict, refund completion, and provider-success/local-
  failure recovery.
- Assembled signed-in browser journeys for both products, including dismissal,
  reload/re-entry, authoritative confirmation, and mobile/keyboard behavior.
- Operator reconciliation evidence for unmatched, uncertain, contradictory, and
  refund-required records.

Membership-specific behavior is defined in `MEMBERSHIP_BILLING.md`. Modern
Caveman cohort behavior is also governed by
`frontend/docs/ADMIN_COHORTS_IMPLEMENTATION_CONTRACT.md`.
