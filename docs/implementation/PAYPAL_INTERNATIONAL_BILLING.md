# PayPal international billing implementation contract (superseded)

Status: superseded on 2026-11-05; retained only as historical design context.

PayPal checkout and runtime configuration were removed when Razorpay became the
sole provider for the owned INR and USD offers. Do not implement or operate from
this document. The current contract is `PAYMENT_PRODUCTS.md`.

Status: approved contract; implementation in progress

Owner: Amit

Contract version: 1.1 (2026-11-04)

Base revision: `8cde3be2cd7a908d8fb9818d1d642cbaa5ee7d21`

## Outcome

Authenticated international customers can explicitly choose PayPal Sandbox for
either a USD 6 monthly Membership subscription or a USD 249 one-time Modern
Caveman cohort payment. Existing INR/Razorpay offers and customers are
unchanged. Razorpay remains the primary checkout and PayPal is a secondary,
explicitly labelled wallet choice. PayPal is not offered for domestic Indian
payments.

## Authoritative offers

| Product | Provider object | Charge | Fulfilment |
| --- | --- | --- | --- |
| Membership | PayPal subscription against the versioned configured plan | USD 6.00 monthly (600 minor units) | A verified PayPal lifecycle event updates the existing provider-neutral membership entitlement |
| Modern Caveman | PayPal Order v2 with immediate capture | USD 249.00 once (24,900 minor units) | A verified capture webhook confirms the existing cohort enrollment, subject to capacity rules |

The prices are owned USD offers, not live or browser-calculated conversions.
Provider plan/order amount and currency must match the persisted offer snapshot.

## Boundaries and invariants

- A signed-in user chooses Razorpay/INR or PayPal/USD explicitly; IP address,
  browser locale, email, and provider callbacks do not decide identity or price.
- PayPal credentials, access tokens, and webhook verification remain server-side.
- Missing or partial PayPal configuration disables only PayPal checkout.
- The backend creates provider objects with a stable `PayPal-Request-Id` tied to
  a durable local checkout operation. Retry may reuse the operation; uncertain
  completion cannot create an unrelated second charge or subscription.
- Browser approval, return URLs, and capture responses are presentation or
  progress evidence only. Paid access and cohort fulfilment require a verified,
  durably deduplicated PayPal webhook.
- PayPal webhook signatures are verified for the configured REST app and
  webhook ID before parsing can mutate billing state.
- Event identity is durable and replay-safe. Events can mutate only a matching
  current provider object, plan, amount, currency, user, and product.
- Refund, reversal, dispute, failed renewal, suspension, cancellation, expiry,
  delayed delivery, and out-of-order delivery fail closed and remain visible.
- Membership and cohort state machines, ledgers, and fulfilment remain separate.
  Both continue to expose provider-neutral access/enrollment state to consumers.

## User-visible behavior

- Membership presents INR 499/month via Razorpay as the primary action and
  `Pay with PayPal · USD 6/month` as the secondary action, with recurrence
  stated before checkout. The PayPal subscription may require a PayPal account.
- Modern Caveman presents INR 21,000 via Razorpay as the primary action and
  `Pay with PayPal · USD 249` as the secondary action before checkout. Guest
  card availability inside PayPal is provider-controlled and is not promised.
- Dismissal or cancellation grants nothing. After PayPal approval/capture the UI
  reports pending confirmation until authoritative status is visible on refresh.
- Duplicate submission is disabled while an operation is in progress. Unknown
  completion tells the user not to pay again and requires reconciliation.

## Evidence required

- Focused adapter tests for OAuth, idempotency headers, plan/order validation,
  webhook verification, error classification, timeout, and redaction.
- Real API/database tests for ownership, atomic event receipt, replay,
  out-of-order lifecycle, provider isolation, amount/currency mismatch, capacity
  conflict, and absence of browser-callback fulfilment.
- Frontend tests for provider choice, truthful price/recurrence, duplicate
  prevention, dismissal, pending confirmation, reload, and narrow-screen access.
- Genuine PayPal Sandbox evidence for one subscription lifecycle and one order
  capture, including webhook delivery and replay. Refund/dispute/cancellation
  evidence is required before live enablement.
- Independent two-stage review because this change governs money, paid
  authorization, external side effects, concurrency, and durable state.

## Rollout and exclusions

Sandbox only in this change. Live enablement additionally requires an eligible
PayPal Business account, India receiving/KYC setup, live REST credentials,
separate live plan and webhook IDs, operational reconciliation, and explicit
release approval. Taxes, invoices, coupons, trials, annual plans, FX conversion,
automatic geo-routing, and domestic Indian PayPal payments are excluded.

## Change history

- Version 1.1 (2026-11-04): Razorpay retained as the primary checkout; PayPal
  repositioned and labelled as a secondary wallet choice after confirming that
  standard PayPal subscriptions can require the buyer to use a PayPal account.
