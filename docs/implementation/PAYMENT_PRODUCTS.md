# Payment products

Status: approved product contract; implementation under verification

Owner: Amit

Last amended: 2026-11-05

## Canonical offers

Neurocient has two distinct paid products. They must not share fulfilment state,
webhook state machines, or access consequences.

| Product | Provider shape | Canonical charge | Fulfilment |
| --- | --- | --- | --- |
| Membership | Recurring Razorpay subscription | INR 499 each month (49,900 minor units) | Active provider-verified entitlement unlocks the self-guided membership |
| Modern Caveman | One-time Razorpay order for a published cohort | INR 21,000 (2,100,000 minor units) | Captured, verified payment confirms one seat in the selected cohort |
| Membership (international) | Recurring Razorpay subscription | USD 6 each month (600 minor units) | Active provider-verified entitlement unlocks the self-guided membership |
| Modern Caveman (international) | One-time Razorpay order for a published cohort | USD 249 (24,900 minor units) | Captured, verified payment confirms one seat in the selected cohort |

“Equivalent” means any conversion displayed or applied by the payment provider,
card issuer, or customer bank. Neurocient does not calculate or persist a live FX
rate in this implementation. The backend sends the canonical charge and currency
above and verifies the same values on provider events.

## Global commerce direction

Razorpay is the sole checkout provider. Each product has an explicit INR and USD
offer; the customer chooses the currency rather than receiving an IP-derived or
browser-calculated conversion. Both offers use the same product entry point and
provider checkout, while the backend owns and verifies the exact amount and
currency. Existing INR subscriptions continue against their original plan.

Membership requires separate Razorpay plan IDs for INR and USD. Missing USD plan
configuration disables only the USD membership action. One-time cohort checkout
creates a Razorpay order in the selected owned currency. EUR, GBP, automatic FX,
and automatic geo-routing remain deferred.

International acceptance still depends on Razorpay account enablement, supported
cards/countries, recurring international mandate approval, and settlement/KYC
configuration. Code completion is not evidence that every international issuer
or recurring card is accepted. Purpose code P1107 is attached to newly created
provider objects; finance/compliance evidence and genuine test-mode lifecycles
remain required before live USD charging.

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

## Provider order identity and forward repair

Each `(provider, provider_order_id)` identifies exactly one immutable local
payment record. Migration `20261105_0017` enforces that invariant and refuses to
run if historical duplicates exist; it does not guess which record owns money.
If the guard fails, stop rollout and retain all rows. For every duplicate group,
compare provider order/payment state, enrollment ownership, amount, currency,
webhook events, and audit history. Record the investigation and correction in an
`AdminAuditEvent`. Resolve the data only through a reviewed corrective migration
that preserves the original identifiers and displaced row contents in durable
audit evidence, then rerun the guarded migration and reconciliation. Do not
delete or silently merge payment evidence, and do not retry fulfilment until the
provider order has one unambiguous enrollment owner.

## Evidence required before live charging

- Genuine Razorpay test-mode membership subscriptions in INR and USD: activation, renewal,
  failed renewal, cancellation, duplicate/delayed delivery, refund, and dispute.
- Genuine Razorpay test-mode Modern Caveman orders in INR and USD: capture, duplicate/delayed
  delivery, full-capacity conflict, refund completion, and provider-success/local-
  failure recovery.
- Assembled signed-in browser journeys for both products, including dismissal,
  reload/re-entry, authoritative confirmation, and mobile/keyboard behavior.
- Operator reconciliation evidence for unmatched, uncertain, contradictory, and
  refund-required records.

Membership-specific behavior is defined in `MEMBERSHIP_BILLING.md`. Modern
Caveman cohort behavior is also governed by
`frontend/docs/ADMIN_COHORTS_IMPLEMENTATION_CONTRACT.md`.
