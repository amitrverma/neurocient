# SEC-05 CSRF protection implementation contract

Date: 2026-10-31  
Base revision: `aeb3d05e8052791025f30e18f1ef6492f142f4bf`  
Risk: High (browser authentication, session creation, and state mutation)

## Outcome

An attacker-controlled site must not be able to create, rotate, revoke, or use a
Neurocient browser session, or mutate private Neurocient state, by causing a
victim's browser to send a request. The control must hold at both public entry
points: the Next.js `/api` boundary and direct FastAPI access.

## Trust boundaries and threat model

- Browsers authenticate with `access_token` and `refresh_token` HttpOnly cookies.
- The public web application sends browser mutations to same-origin Next.js API
  routes. Those routes forward selected requests and cookies to FastAPI.
- FastAPI may also be reachable directly. CORS is not a CSRF control: simple
  cross-origin requests can be sent even when their responses cannot be read.
- An attacker can host arbitrary HTML and JavaScript, submit forms, issue fetches
  allowed by the browser, choose content types, and omit request bodies. The
  attacker cannot set a forged browser `Origin`, read HttpOnly cookies, or compute
  a valid HMAC without the server-only proxy secret.
- Non-browser callers using only `Authorization: Bearer` are outside the cookie
  CSRF threat. Provider webhooks and admin-key jobs keep their own signature/key
  authentication and must not be broken by browser-CSRF policy.

## Required behavior

### Browser cookies

- Production auth and session-hint cookies use `Secure`, host/domain settings
  already configured for the deployment, and `SameSite=Lax`.
- Auth cookies remain HttpOnly. `session_present` remains a non-secret readable
  hint and receives the same SameSite setting.
- Cookie clearing uses matching domain/path attributes.

### Next.js boundary

- Every unsafe request (`POST`, `PUT`, `PATCH`, `DELETE`) under `/api` is rejected
  before its route handler unless `Origin` exactly equals the effective request
  origin. If `Origin` is absent, an exact-origin `Referer` is the only fallback.
- Missing, opaque (`null`), malformed, multiple, cross-scheme, cross-host, or
  cross-port origins fail with `403`, a stable `csrf_failed` code, and
  `Cache-Control: no-store`.
- Safe methods and `OPTIONS` are not blocked by this policy.
- The matcher also preserves the existing `/insights` guest-cookie behavior.
- Every Next-to-FastAPI unsafe proxy call carries the existing HMAC proxy proof,
  bound to timestamp, method, backend path, and normalized client IP. This proof
  represents that the Next boundary already accepted the browser origin.
- The inventory includes server components and server utilities outside `/api`.
  `requestArticleAccess()` performs a quota-consuming backend `POST` while serving
  a page `GET`; it must require `Sec-Fetch-Site: same-origin` or `none`, rejecting
  cross-site, same-site, and missing evidence (including top-level document
  navigation) before contacting FastAPI. An accepted navigation
  signs the explicit outbound `POST` method and backend path rather than the inbound
  page method. Cross-site visitors receive the closed/teaser state and must make a
  subsequent deliberate same-origin navigation to consume a grant.
- Production and preview fail closed if the proxy secret is absent or invalid.

### FastAPI authoritative boundary

- A central ASGI middleware evaluates unsafe requests before route/business logic.
- A request requires CSRF proof when it carries any Neurocient browser credential:
  `access_token`, `refresh_token`, `session_present`, or `guest_access_id`. The
  guest identifier authorizes and consumes free Insight grants and is therefore a
  credential for this policy even though it is not an account session.
- Every unsafe `/auth/*` browser endpoint requires proof even before a cookie
  exists. This includes signup, login, refresh, logout, password-reset request and
  confirmation, and Firebase login; it prevents login/session-swapping CSRF and
  protects recovery side effects consistently.
- Proof is either:
  1. an exact allowlisted HTTPS/local-development `Origin` (or exact-origin
     `Referer` fallback), or
  2. a valid, fresh HMAC proxy proof from the Next.js boundary.
- Requests that require proof and have missing, malformed, opaque, or untrusted
  evidence fail with `403`, stable `csrf_failed`, and `Cache-Control: no-store`.
- Rejection happens before authentication dependencies, database writes, session
  rotation/revocation, and provider calls.
- Bearer-only API calls without Neurocient cookies remain supported.
- Razorpay and Twilio webhooks, admin-key notification jobs, and public anonymous
  mutations without session cookies retain their existing authentication and
  abuse controls. If any such request includes Neurocient session cookies, it is
  treated as browser state and must pass CSRF proof.

## Configuration

- FastAPI receives an explicit comma-separated `CSRF_TRUSTED_ORIGINS` setting.
- Production startup fails if the setting is missing, malformed, non-HTTPS, has a
  path/query/fragment/userinfo, or contains duplicates. The two canonical origins
  are expected: `https://www.neurocient.com` and `https://neurocient.com`.
- Development defaults may include only `http://localhost:3000` and
  `http://localhost:3001`.
- The existing independent `ABUSE_PROXY_SECRET` is reused for signed BFF proof;
  it is never exposed to browser code.

## Compatibility and rollout

- Deploy backend support before or with frontend signing. During development,
  trusted local origins permit the BFF flow when the proxy secret is intentionally
  unset; production and preview remain fail closed at the Next helper.
- Existing direct Bearer clients continue to work when they do not send browser
  cookies.
- Existing browser mutation code does not need a readable CSRF token or JavaScript
  cookie access; same-origin fetches already supply `Origin` and the BFF supplies
  authenticated proof to FastAPI.
- `SameSite=Lax` is compatible with the current same-origin browser-to-Next flow.
  Next-to-FastAPI forwarding is server-to-server and is unaffected by browser
  SameSite enforcement.

## Acceptance evidence

Automated evidence must include:

1. Next boundary, JSON mutation: same-origin accepted; foreign, `null`, malformed,
   and scheme/port variants rejected before the handler.
2. Next boundary, no-body mutation: same-origin accepted; foreign and missing
   Origin/Referer rejected.
3. Next Referer fallback: exact same origin accepted and deceptive suffix/prefix
   origins rejected.
4. Direct FastAPI, cookie + JSON and cookie + no body: trusted Origin accepted;
   foreign, missing, `null`, malformed, and cross-port origins rejected before a
   sentinel endpoint executes.
5. Direct FastAPI auth mutations: every unsafe `/auth/*` route rejects missing or
   foreign proof even without cookies, including both password-reset endpoints.
6. Signed BFF proof: correct proof accepted; stale, wrong method, wrong path, wrong
   IP, altered, and absent proofs rejected when cookies are present.
7. Bearer-only direct mutation remains accepted by CSRF middleware; a request that
   adds an auth cookie must provide proof.
8. Provider webhook and admin-key routes remain reachable by their existing
   authentication mechanisms when no Neurocient cookies are present.
9. Cookie tests assert production `Secure; SameSite=Lax; HttpOnly` for auth tokens.
10. Authenticated and guest Insight navigation: cross-site top-level navigation
    performs no backend fetch and consumes no grant; accepted navigation signs the
    explicit outbound `POST` and FastAPI accepts it. A forged direct request with a
    guest cookie is rejected like an account-cookie request.
11. An inventory test fails if any frontend-to-backend unsafe call lacks signed
    mutation proxy headers or an explicit non-browser classification. It scans API
    routes, server components/utilities outside `app/api`, and dynamic alias exports
    such as `export const POST = proxy` and `export const PATCH = proxy`.
12. Full backend tests, frontend tests, frontend production build, focused lint,
    and backend production image build pass.

## Out of scope

- General cross-site scripting prevention and Content Security Policy.
- Replacing provider webhook signatures or admin API keys.
- CSRF protection for stateless bearer-only callers.
- Changing authentication lifetime or session-rotation semantics.

## Stop conditions

Stop and reassess if any browser mutation legitimately requires a cross-site
origin, if a deployed frontend bypasses Next and depends on cross-site auth
cookies, or if an unsafe route cannot be classified as cookie-authenticated,
signed-provider, admin-key, or anonymous before implementation.
