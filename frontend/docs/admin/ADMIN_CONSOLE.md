# Admin console

## Purpose

The admin console provides operational visibility into data already persisted by Neurocient. It does not create a parallel analytics system or broaden the product's data collection.

## Current surfaces

- Overview: aggregate account, communication, access, product-use, delivery, and content counts.
- Accounts: registered accounts, authentication method, role and membership state, delivery readiness, and per-feature activity counts.
- Newsletter: persisted subscriber emails and signup dates.
- Memberships: provider-neutral entitlement records.
- Content: article read/save counters, the active/inactive nudge inventory, and the microchallenge library with assignment counts.
- Cohorts: program setup, lifecycle, sessions, enrollment, and cohort waitlist.
- Payments: provider payment records and sanitized webhook-processing events used for reconciliation.
- Audit: material cohort and payment events.

The legacy Google preview-gate Participant and Waitlist records remain part of the existing login journey, but they are intentionally excluded from the admin interface.

## Privacy boundary

Admin list views expose the minimum information needed for operations. They may show account identity and aggregate counts, but they do not return or display the content of Spots, Scan responses or portraits, Practice worksheets or notes, microchallenge notes, weekly reflections, or notification endpoints and keys.

## Authority

All admin data APIs require the backend `admin` role. The frontend redirect improves navigation but is not an authorization boundary. Existing cohort state transitions remain the only mutation available through the console; the new audience, membership, activity, and content surfaces are read-only.
