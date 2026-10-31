# Membership provisioning

Membership is a provider-neutral account entitlement. The product reads the
`membership_entitlements` table; payment providers do not directly determine
access inside feature routes.

## Current purchase path

- Price: USD 9 per month.
- When `MEMBERSHIP_CHECKOUT_URL` is configured in the frontend server
  environment, `/membership` sends the user to that hosted checkout.
- Without that configuration, `/membership` uses the assisted WhatsApp path.
- Assisted purchases require an entitlement row to be activated after payment
  is confirmed.

## Entitlement contract

An account has paid access only when:

- `status` is `active` or `trialing`; and
- `current_period_end` is later than the current UTC time.

Missing subscription timing, expired periods, and all other states fail closed.
Supported provider lifecycle states can be stored without granting access,
including `inactive`, `past_due`, and `canceled`.

The provider integration should upsert by `user_id` and persist:

- `provider`
- `provider_customer_id`
- `provider_subscription_id`
- `status`
- `current_period_end`

The webhook must verify the provider signature and map the payment customer to
an existing Neurocient user before changing entitlement state. Replayed events
must be idempotent. Do not grant access from a browser redirect alone.

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

## Manual activation

Until a gateway webhook exists, activation is an operational database action.
Use the verified Neurocient user ID, set `provider` to `manual`, set `status` to
`active`, and set the paid-through time in `current_period_end`. Renewal or
cancellation must update the same row. Never create an entitlement from an
unverified email supplied through chat.
