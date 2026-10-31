# ADR 0004: Origin and signed-BFF CSRF defense

- Status: Accepted
- Date: 2026-10-31
- Decision owners: Neurocient engineering
- Related requirement: SEC-05

## Context

Neurocient authenticates browsers with HttpOnly cookies. Browser mutations enter
through same-origin Next.js API routes and are forwarded to a separately deployed
FastAPI service. Production cookies currently use `SameSite=None`, and neither
boundary consistently rejects cross-origin mutations. CORS does not prevent a
browser from sending a simple cross-origin request.

The backend must remain authoritative, but it cannot blindly trust a plain header
claiming a request came from Next.js. The repository already has a server-only HMAC
proof between Next.js and FastAPI, bound to request method and backend path.

## Decision

Use three reinforcing controls:

1. Set production authentication cookies to `SameSite=Lax`.
2. Enforce exact `Origin`, with exact-origin `Referer` fallback, for every unsafe
   Next.js `/api` request. Block cross-site Insight page navigation before its
   hidden quota-consuming server-side mutation.
3. Enforce CSRF centrally in FastAPI for all unsafe cookie-bearing requests and
   session-establishing auth routes. FastAPI accepts either an allowlisted direct
   browser origin or a valid fresh HMAC proof from the Next.js BFF.

The HMAC proof reuses `ABUSE_PROXY_SECRET` and its existing method/path/timestamp/IP
binding. All unsafe BFF-to-backend calls must attach it. Calls initiated while
rendering a safe page request sign their explicit outbound method. Bearer-only clients,
provider-signed webhooks, and admin-key jobs do not require CSRF evidence unless
they also present Neurocient browser credentials. `guest_access_id` is included
because it authorizes and consumes a limited grant.

## Alternatives considered

### SameSite alone

Rejected. It is valuable defense in depth but can be weakened by future domain or
flow changes and does not provide explicit authoritative-boundary evidence.

### CORS alone

Rejected. CORS restricts response reading; it does not reliably stop form or
simple-request submission.

### Double-submit or synchronizer token

Deferred. It is valid but would add a readable token lifecycle and changes across
all browser callers. Exact-origin enforcement is sufficient for the current
same-origin BFF architecture, while signed forwarding preserves backend authority.

### Trust a static BFF marker header

Rejected. A direct caller can forge a constant header. The proof must be
cryptographically authenticated and bound to the forwarded request.

## Consequences

- Cross-origin, missing-origin, and forged direct cookie mutations fail closed.
- Cross-site top-level navigation cannot silently consume an Insight grant; the
  visitor must re-enter through a same-origin interaction.
- Preview/production BFF mutations depend on correct shared-secret deployment.
- Any new unsafe API proxy must attach signed mutation headers; inventory tests
  make omissions visible.
- A future legitimate cross-origin browser client requires an explicit architecture
  review and likely token-based CSRF design rather than a permissive origin entry.
- The backend and frontend origin policies must be covered by adversarial tests and
  deployment configuration evidence.
