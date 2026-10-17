# Admin, Cohorts, and Modern Caveman Commerce

Status: approved for implementation
Owner: Neurocient product
Decision date: 2026-10-15

## Outcome

Neurocient will have a private administrative surface for operating paid,
facilitated Modern Caveman cohorts. An administrator can create and publish a
cohort, manage its schedule and capacity, review enrolments and payments, and
connect an open cohort to Razorpay. A signed-in user can pay for a specific
open cohort and see the resulting enrolment in their Profile.

The landing-page refinement is a separate workstream. The existing article
narrative remains unchanged pending the holistic claims and narrative review.

## Actors and authorization

- `hello@neurocient.com` is the initial administrator and uses the existing
  email/password authentication flow.
- Administrator access is represented by an authoritative backend role tied to
  the user account. Frontend email comparison is not authorization.
- Every admin API denies authenticated non-admin users and anonymous users.
- In local development, the configured admin address may create its password
  account through the normal signup flow and receives the role immediately.
  Production keeps the address reserved and requires controlled provisioning;
  submitting it to public signup can never grant production admin access.
- Sensitive admin mutations retain a privacy-safe audit record of actor,
  action, target, time, outcome, and reason where applicable.

## Cohort model

A cohort belongs to the Modern Caveman facilitated program and records:

- public title, slug, description, audience, and facilitator;
- start and end dates, timezone, enrolment window, and session details;
- hard capacity, price, currency, and Razorpay checkout configuration;
- public state and operational timestamps.

Canonical cohort states are:

`draft -> published -> open -> full | closed -> in_progress -> completed`

A cohort may also become `cancelled`. Publishing makes its information public;
only `open` permits checkout. Reaching hard capacity moves the purchase surface
to a waitlist path and prevents further checkout creation.

## Enrolment and waitlist model

- Account creation or login is required before payment.
- One user may enrol in multiple cohorts over time, but only once per cohort.
- Canonical enrolment states are `pending_payment`, `paid`, `active`,
  `completed`, `cancelled`, and `refunded`.
- The waitlist is cohort-specific and ordered. Reaching capacity exposes the
  waitlist instead of accepting another payment.
- The existing single-email `Participant.cohort` representation is legacy and
  must not remain the authoritative cohort/enrolment model.

## Razorpay payment contract

- Checkout is created by the backend for a specific signed-in user and cohort.
- Capacity is checked authoritatively before checkout. A bounded reservation
  prevents concurrent checkout attempts from overselling the cohort.
- A browser redirect never marks an enrolment paid.
- Only a verified, idempotently processed Razorpay webhook can confirm payment
  and transition the enrolment to `paid`.
- Duplicate, late, failed, or mismatched events must not create duplicate
  enrolments or exceed capacity.
- A captured payment that arrives after its reservation has expired enters
  visible reconciliation if capacity has gone; it never silently overbooks.
- Automated refunds for that exceptional state remain a go-live prerequisite.
- Admin payment views expose reconciliation state without exposing secrets.

## Admin MVP surfaces

- `/admin/login`: focused email/password entry and safe denied state.
- `/admin`: upcoming cohorts, capacity, enrolments, payment exceptions, and
  operational next actions.
- `/admin/cohorts`: cohort list, filters, and state.
- `/admin/cohorts/new`: progressive cohort creation.
- `/admin/cohorts/[id]`: overview, schedule, offer, capacity, checkout, preview,
  publication state, and participant access.
- `/admin/cohorts/[id]/participants`: enrolments and waitlist.
- `/admin/payments`: payment state and reconciliation.
- `/admin/users` and `/admin/memberships`: account lookup and reasoned manual
  Membership activation, extension, or cancellation.
- `/admin/audit`: sensitive administrative activity.

Content publishing, newsletter campaigns, claims governance, complex coupons,
multiple admin roles, facilitator accounts, and advanced analytics are deferred.

## Signed-in customer surface

Profile remains the signed-in home and will be redesigned around continuity:

1. continue the current Practice loop or Microchallenge;
2. see Scan and real-life evidence;
3. return to saved reading;
4. see cohort enrolment and upcoming sessions;
5. see Membership status and paid-through date;
6. reach account and delivery preferences.

Saved remains a separate reading utility. `/my-caveman` remains the detailed
Scan portrait, subordinate to Profile. `/my-caveman/spot` and `/tools/spots`
will share one Spot persistence and interaction model, with Scan-linked context
when entered from the portrait.

## Acceptance criteria

- **AC-ADMIN-01:** Only a backend-authorized administrator can read or mutate
  admin resources, including through direct API calls.
- **AC-ADMIN-02:** `hello@neurocient.com` can use email/password login and reach
  the admin dashboard after controlled role provisioning.
- **AC-COHORT-01:** An admin can create, preview, publish, open, close, cancel,
  and complete a cohort without exposing draft cohorts publicly.
- **AC-COHORT-02:** Public Modern Caveman content shows a specific published
  cohort. Payment is available only while that cohort is open and has capacity.
- **AC-CAPACITY-01:** Concurrent purchase attempts cannot produce paid
  enrolments beyond hard capacity.
- **AC-WAITLIST-01:** A full cohort offers a cohort-specific waitlist and cannot
  create another checkout.
- **AC-PAY-01:** Checkout requires a signed-in account and is tied to one user
  and one cohort.
- **AC-PAY-02:** A redirect, client request, replayed webhook, or mismatched
  amount cannot grant a paid enrolment.
- **AC-PROFILE-01:** A paid cohort enrolment and its next relevant session are
  visible from the signed-in Profile.
- **AC-AUDIT-01:** Sensitive admin changes and manual entitlement operations
  are attributable and reviewable.

## Live-payment prerequisites

Implementation may begin now, but live charging remains disabled until:

- Razorpay key ID and webhook secret are supplied through deployment secrets;
- the production webhook URL is configured in Razorpay;
- the Modern Caveman cancellation/refund policy is confirmed and reflected in
  the purchase journey and Terms;
- Privacy and Terms describe the account, cohort, payment, and participant data
  actually processed.

