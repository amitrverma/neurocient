# Membership provisioning

Membership is a provider-neutral account entitlement. The product reads the
`membership_entitlements` table; payment providers do not directly determine
access inside feature routes.

## Current purchase path

- Price: INR 499 per month.
- `/membership` requires sign-in and asks the backend to create or reuse a
  Razorpay subscription. The browser receives a public key and subscription ID,
  never provider secrets.
- The configured Razorpay plan is fetched before subscription creation and must
  be active, monthly, INR 499, and interval 1. Checkout remains unavailable when
  any membership configuration is missing or mismatched.
- The browser callback reports confirmation pending and polls authoritative
  membership status. It cannot activate access.
- `POST /api/membership/razorpay/webhook` is the only gateway activation path.
  It uses a membership-only webhook secret and exact raw-body verification.
- The first verified event that establishes active paid access also creates a
  durable, one-per-account membership welcome-email intent in the same database
  transaction. Provider dispatch happens after that commit and uses a stable
  idempotency key, so webhook retries resume delivery without sending a second
  welcome.

## Entitlement contract

An account has paid access only when:

- `status` is `active` or `trialing`; and
- `current_period_end` is later than the current UTC time.

Missing subscription timing, expired periods, and all other states fail closed.
Supported provider lifecycle states can be stored without granting access,
including `inactive`, `past_due`, and `canceled`.

The provider integration persists:

- `provider`
- `provider_customer_id`
- `provider_subscription_id`
- `provider_plan_id`, checkout operation and immutable price/currency/count
- current payment and provider ordering metadata
- `status`
- `current_period_end`

Webhook event IDs are unique in `membership_billing_events`. Event receipt,
processing outcome, and entitlement mutation commit atomically. Uncertain
subscription creation is deliberately blocked for reconciliation because an
automatic retry could create a second subscription. Inspect `checkout_state`,
provider status, subscription ID, and the read-only membership event endpoint
when reconciling; do not clear the operation and retry without comparing the
provider state.

## Authoritative product access

Feature routes read the provider-neutral entitlement above. They must not infer
paid access from browser state, checkout redirects, or provider payloads.

Insight access is enforced by `POST /articles/{slug}/access` before the frontend
compiles the article body:

- a guest receives five distinct Insights per opaque HttpOnly browser cookie;
- a signed-in free account receives twenty distinct Insights;
- revisiting an already granted Insight is free and idempotent;
- an active or trialing paid account bypasses the free ledger; and
- invalid tokens, missing identity, stale entitlements, and exhausted allowances
  fail closed.

The guest cookie is not a durable person identity. Clearing all site cookies or
using another browser creates a new guest allowance; cross-device enforcement
requires sign-in. At rollout, existing browser-local article history is not
migrated, so every actor starts with the server-authoritative allowance.

Deploy in this order: the Alembic migration that creates
`article_access_grants`, the backend access endpoint, and then the frontend
revision that calls it. Roll the frontend back first if forward repair is
required; retaining ledger rows is safe.

## Configuration

The backend requires these deployment values for membership checkout:

- `RAZORPAY_KEY_ID` and `RAZORPAY_KEY_SECRET`
- `RAZORPAY_MEMBERSHIP_PLAN_ID`
- `RAZORPAY_MEMBERSHIP_AMOUNT_MINOR=49900`
- `RAZORPAY_MEMBERSHIP_CURRENCY=INR`
- `RAZORPAY_MEMBERSHIP_TOTAL_COUNT` (an explicit positive commercial choice)
- `RAZORPAY_MEMBERSHIP_WEBHOOK_SECRET` (independent of the cohort secret)

Disabling the membership plan ID is the checkout kill switch. Existing paid
access continues from durable entitlement state.

## Welcome email recovery

Email delivery does not determine paid access. A temporary Resend failure keeps
the verified entitlement active, records the failed attempt, and returns a
retryable webhook response. Duplicate Razorpay delivery resumes the same intent.
If a payment predates the welcome-email migration, or an operator needs to
resume one exact account after checking its state, run from `backend`:

```powershell
.\.venv\Scripts\python.exe -m scripts.send_membership_welcome_email USER_UUID
```

The command sends only when the account currently has active, future-dated paid
access. Re-running it after success returns `already_sent` without another
provider call. Inspect `membership_welcome_email_deliveries` for status,
attempts, provider message ID, and reconciliation state.

Once any checkout operation or membership event exists, the billing migration
intentionally refuses schema downgrade because that would erase reconciliation
evidence. Retain the additive schema and use forward repair.

## Manual activation

Manual activation remains available only for independently verified assisted
purchases or recovery.
Use the verified Neurocient user ID, set `provider` to `manual`, set `status` to
`active`, and set the paid-through time in `current_period_end`. Renewal or
cancellation must update the same row. Never create an entitlement from an
unverified email supplied through chat.
