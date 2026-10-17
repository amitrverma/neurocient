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

## Manual activation

Until a gateway webhook exists, activation is an operational database action.
Use the verified Neurocient user ID, set `provider` to `manual`, set `status` to
`active`, and set the paid-through time in `current_period_end`. Renewal or
cancellation must update the same row. Never create an entitlement from an
unverified email supplied through chat.
