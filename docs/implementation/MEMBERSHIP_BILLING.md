# Membership billing implementation contract

Status: approved for implementation

Owner: Amit

Base revision: `cd08080a09ba6e7ce2b4b1fd9ebbe9f1965fd335`

Contract version: 1.0 (2026-11-01)

## Outcome

A signed-in Neurocient account can start a Razorpay subscription for the
published USD 9 monthly membership. Paid access changes only after a verified,
durably recorded provider event is safely applied to the provider-neutral
membership entitlement. Browser callbacks, email addresses, and unverified
provider payloads never grant access.

This contract closes the implementation scope of PAY-01 and PAY-02. Genuine
Razorpay test-mode checkout and webhook lifecycle evidence remains necessary
before either item is `Verified`.

## Actors and entry points

- A signed-in user starts or resumes membership checkout from `/membership`.
- Razorpay Standard Checkout authenticates the recurring mandate for the
  server-created subscription.
- Razorpay sends signed lifecycle events to a membership-specific webhook.
- Feature routes continue reading only the provider-neutral
  `membership_entitlements` record.
- An administrator may inspect billing and event state through the existing
  read-only admin console. Customer cancellation and billing management remain
  PAY-04 scope.

## Confirmed product and provider decisions

- The offer is one membership at USD 9 per month, with no trial in this slice.
- A Razorpay plan is created and governed outside the application. Deployment
  supplies its plan ID and the intended finite billing-cycle count because the
  provider requires `total_count` or `end_at`. Missing or partial configuration
  disables checkout.
- Before creating a subscription, the backend fetches the configured plan and
  verifies its amount, currency, monthly interval, and active state against the
  Neurocient offer. A wrong plan fails closed before a subscription is created.
- Checkout is authenticated and tied to the immutable Neurocient user ID and a
  durable local checkout operation. The user email is presentation data only.
- The browser receives only the public Razorpay key, provider subscription ID,
  displayed amount/currency, and safe checkout copy. The key secret and webhook
  secret remain server-side.
- A checkout handler may say that confirmation is pending. It never activates
  membership. Reload/re-entry reads authoritative backend status.
- Membership webhooks use a membership-specific endpoint and secret so their
  state machine and ledger do not become coupled to cohort fulfilment.

## Authoritative state and lifecycle

The current membership entitlement owns the active provider subscription
mapping, immutable offer snapshot, provider customer/payment identifiers,
provider lifecycle state, paid-through time, and last applied provider event.
A separate durable event ledger records a privacy-minimised projection of every
authenticated membership event and its processing outcome.

Provider lifecycle maps as follows:

| Provider event/state | Entitlement outcome | Paid access |
| --- | --- | --- |
| checkout created/authenticated | `checkout_pending` / `authenticated` | No |
| `subscription.activated`, `subscription.charged`, `subscription.resumed` | `active` with a future provider `current_end` | Yes |
| `subscription.pending`, `subscription.halted`, `subscription.paused` | `past_due` or `paused` | No |
| `subscription.cancelled` | `canceled` | No |
| `subscription.completed` | `expired` | No |
| refund against the current membership payment | `refunded` | No |
| dispute/chargeback against the current membership payment | `disputed` | No |

`active` without a future paid-through time remains inactive under the existing
access policy. Refund, dispute, cancellation, and completion are terminal for
that provider subscription. A later purchase creates a new provider
subscription; events for an older subscription cannot change the new one.

## Invariants and acceptance criteria

- **PAY12-A:** Checkout requires the current signed-in user, applicable abuse
  controls, complete provider configuration, and an exact verified plan. The
  persisted mapping contains user ID, provider, plan, price, currency, billing
  count, and subscription ID. No client-supplied price or identity is trusted.
- **PAY12-B:** Concurrent/repeated checkout cannot create two subscriptions for
  the same current operation. A ready incomplete checkout is reused. If provider
  completion is uncertain, the operation becomes reconciliation-required and
  automatic retry cannot create another subscription.
- **PAY12-C:** Only a valid HMAC over the exact raw request body reaches event
  parsing or durable billing state. Missing configuration, signature, event
  identity, required entity fields, or unsupported object relationships fails
  safely without granting access.
- **PAY12-D:** Provider event identity is durably unique under sequential and
  concurrent delivery. Replays return success only after confirming the prior
  durable receipt and never repeat the entitlement mutation.
- **PAY12-E:** An event can affect only the locally persisted current provider
  subscription, configured plan, and matched payment/customer identifiers.
  Email, webhook notes, browser callback values, and unknown subscriptions do
  not establish ownership.
- **PAY12-F:** Delayed and out-of-order events cannot move a subscription behind
  a later applied provider state or revive a terminal/refunded/disputed
  subscription. Equal-time ambiguity resolves toward no access and remains
  visible for reconciliation.
- **PAY12-G:** Activation and renewal require a verified active/charged event
  with a future `current_end`. Pending, halted, paused, cancelled, completed,
  refunded, disputed, malformed, unmatched, and unknown states grant no access.
- **PAY12-H:** Event receipt, ledger outcome, and entitlement mutation commit in
  one transaction. Storage failure is not acknowledged as success. Provider
  failures and reconciliation-required states have stable, privacy-safe error
  codes and logs without secrets, full payloads, payment details, or email.
- **PAY12-I:** The membership UI requires sign-in, prevents duplicate submission,
  presents price/currency/recurrence before opening checkout, reports pending
  confirmation truthfully, and recovers on reload from backend state. Keyboard,
  narrow-screen, dismissal, script-load failure, and provider failure states
  remain usable.
- **PAY12-J:** Existing entitlement consumers, cohort checkout/webhooks, manual
  entitlements, free limits, and authentication boundaries retain their current
  behavior. A browser return or direct API call cannot bypass PAY-03.

## Retry, concurrency, and failure contract

- Checkout validation/configuration conflicts are stable 4xx/503 outcomes with
  no provider call. Provider rejection or unavailability returns a retryable
  failure only when no subscription could have been created.
- Because Razorpay subscription creation does not expose a general idempotency
  key, a lost/uncertain creation response is not automatically retried. The
  durable operation remains blocked for reconciliation using its provider notes.
- Webhook delivery is at-least-once. Duplicate event IDs are successful no-ops
  only after durable prior receipt. Invalid signatures receive 401; malformed
  authenticated events receive a stable 4xx; durable storage failure receives
  5xx so provider retry remains possible.
- Events older than the last applied provider timestamp are recorded as stale.
  For equal timestamps, access-restricting/terminal outcomes dominate grants.
- Unknown authentic events and unmatched provider objects are recorded for
  bounded reconciliation without changing entitlement state.

## Required evidence

- Focused state-machine, payload-validation, signature, plan-verification,
  checkout-reuse, failure-classification, and out-of-order tests.
- Real FastAPI/PostgreSQL tests for authenticated ownership, concurrent checkout,
  atomic event receipt, concurrent replay, lifecycle transitions, old-subscription
  isolation, malformed/unmatched events, and no browser-callback grant.
- Migration from the current schema with representative manual/active/inactive
  entitlements, plus downgrade/re-upgrade, constraints, current, and drift checks.
- Frontend component tests and an assembled local browser journey with the
  provider boundary stubbed: sign-in requirement, displayed terms, duplicate
  prevention, checkout dismissal/failure, pending confirmation, reload, and
  authoritative activation.
- Independent two-stage review because the change governs money, external side
  effects, concurrency-controlled state, and paid authorization.
- Razorpay test-mode checkout, signed webhook lifecycle, duplicate/delayed event,
  cancellation/refund/dispute where the sandbox permits, and reconciliation on
  the exact staged candidate before `Verified`.

## Rollout and recovery

Apply the additive migration first. Deploy backend configuration and webhook
receiver while membership checkout remains disabled. Configure the Razorpay test
plan and webhook, run the sandbox evidence, then deploy the frontend checkout.
Enable live checkout only after the exact plan fingerprint and webhook secret are
confirmed. Disabling the membership plan ID is the checkout kill switch; paid
access continues to fail closed from the last durable entitlement state.

Forward repair is preferred after provider subscriptions exist. Do not delete
event-ledger or checkout-operation records during rollback. Reconciliation must
compare the current provider subscription with the local mapping before any
manual correction.

## Excluded scope

- Customer cancellation/billing portal and automated provider reconciliation
  UI (PAY-04).
- Cohort capacity-conflict refunds and cohort payment recovery (PAY-05).
- Taxes, invoices, coupons, plan changes, trials, annual plans, and proration.
- Marketing email, dunning messages, or provider notification customization.
- Enabling live charges or mutating production Razorpay configuration.
