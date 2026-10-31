# ADR 0005: Authoritative notification consent

Date: 2026-10-31
Status: Accepted

## Context

Optional notification state is split between `users` and `user_preferences`.
Several fields default on, the profile can write arbitrary matching attributes,
and reminder senders select subscriptions or legacy user fields without applying
both current purpose and channel consent. A typed WhatsApp number is treated as
usable without proving ownership.

## Decision

`user_preferences` owns all optional reinforcement consent, channel state, the
verified WhatsApp destination, and pending ownership verification. Purpose and
channel booleans are explicit and default off. Provider adapters are reached only
through delivery selection that re-reads those authoritative fields at dispatch.
The legacy user contact fields cease to authorize optional messages.

WhatsApp ownership is confirmed through a short-lived server-generated code sent
to the pending E.164 number. The database stores only a keyed hash, expiry,
bounded attempt count, and pending number. Confirmation promotes the pending
number but does not infer consent beyond the user's explicit channel choice.

## Alternatives

- Keep `notif_channel` plus legacy user fields: rejected because overlapping
  authorities make opt-out behavior path-dependent.
- Treat a browser subscription or entered phone number as consent: rejected
  because capability and ownership are not purpose-specific permission.
- Introduce a generic event/consent ledger now: deferred because it adds a new
  subsystem before the current three purposes and two channels require it.

## Consequences

Existing ambiguous opt-ins are reset off and users must opt in again. WhatsApp
users must verify their current number. Reminder selection becomes slightly more
query-heavy, but the policy is inspectable and enforceable at the external-side-
effect boundary. Service messages and independently subscribed newsletters keep
separate purpose-specific contracts.

## Testability

Real-database API tests can prove defaults, ownership transitions, field
allowlisting, and atomic rejection. Adapter spies can prove the absence of a
provider call for every denied purpose/channel combination and after a last-
minute opt-out. Staging is still required to prove real provider delivery.

## Operability and recovery

Privacy-safe outcome logs identify purpose, channel, and reason without contact
data. Scheduler and manual triggers share the same selection boundary. The
scheduler remains off by default and is the immediate kill switch. The migration
is applied before code activation; forward repair is preferred after deployment.

## Reversal and review trigger

Reversal requires a data migration and would risk restoring ambiguous consent.
Revisit when new notification purposes or channels make explicit columns
unwieldy, when legal requirements demand a consent/audit ledger, or when delivery
moves to a durable queue whose workers need versioned consent snapshots plus a
dispatch-time revocation check.
