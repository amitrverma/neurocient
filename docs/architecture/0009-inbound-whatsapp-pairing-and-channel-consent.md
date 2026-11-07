# ADR 0009: Pair WhatsApp through an explicit inbound consent message

Date: 2026-11-07

Status: accepted

## Context

Daily nudges, Spot check-ins, and microchallenge check-ins are parts of the
product loop. Presenting each as a preference made users configure the product
before choosing the only meaningful preference: whether Neurocient may reach
them outside the app. Typing a phone number, receiving an outbound OTP,
confirming it, enabling a toggle, and saving added friction without being a Meta
requirement for this experience.

## Decision

Consent is channel-first. Browser permission plus current server consent governs
push. WhatsApp is linked when a signed-in user sends an explicit prefilled
consent message to Neurocient's number. A random, hashed, ten-minute,
single-use token binds the signed Meta webhook sender to the initiating account.
That single inbound action both proves control of the sender and records consent.

Product state determines message relevance. `STOP` pauses WhatsApp delivery,
`START` resumes it, and Profile Disconnect revokes the identity link.

## Consequences

- The profile contains two channel actions and no purpose toggles, phone input,
  OTP, WhatsApp toggle, or save button.
- Pairing depends on inbound webhook availability but does not depend on an
  outbound template or open service window.
- Scheduled messages outside Meta's customer-service window still require
  approved templates.
- Legacy purpose and OTP columns remain temporarily for compatible rollout but
  are not consent authority.

This supersedes the purpose-toggle and outbound-OTP decisions in ADR 0005. ADR
0005 still applies to safe defaults, server authority, dispatch-time re-checks,
and privacy-safe observability.
