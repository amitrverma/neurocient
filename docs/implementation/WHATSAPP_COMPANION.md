# WhatsApp companion implementation contract

Status: local owned-number journey passed; deployed dev-candidate verification pending

Owner: Amit

Contract version: 1.7 (2026-11-13)

Version 1.1 makes the daily nugget selection durable and shared across the web
and outbound delivery. It also requires bounded outbound WhatsApp bodies and
retention of accepted provider message identifiers for dispatch correlation.
Version 1.2 replaces the pre-release Twilio transport with the direct Meta
WhatsApp Cloud API without changing companion behavior or consent authority.
Version 1.3 separates inbound service-window replies from proactive template
delivery, submits the three reminder templates, and records signed Meta delivery
status callbacks against the durable dispatch.
Version 1.5 removes repeated opt-out copy from proactive reminders and makes
desktop pairing a phone handoff rather than a dependency on WhatsApp Web.
Version 1.6 moves opt-out guidance to the connection confirmation and lets a
person add an obstacle note as an ordinary follow-up reply.
Version 1.7 presents the account-binding credential as a short, human-readable
connection code while preserving one-time use, expiry, and hashed storage.

## Outcome

WhatsApp is Neurocient's lightweight daily interaction surface while the web
application remains the place where a user chooses and configures their work.
The first companion supports three shared product outcomes:

1. record a Spot the Inner Caveman entry;
2. receive the user's active Microchallenge and report today's outcome; and
3. receive the same daily nugget used by Neurocient's signed-in home.

WhatsApp and the web application use the same authoritative account records.
This is a deterministic companion, not an open-ended AI chatbot.

## Confirmed behaviour

- A verified WhatsApp sender may record a Spot the Inner Caveman entry with
  `spot: <description>`.
- Spot capture uses the same free-account allowance and membership decision as
  the web application. WhatsApp is not an alternate path around access rules.
- A Microchallenge reminder is sent only when the user has an active
  Microchallenge and has not reported an outcome for the current India calendar
  day.
- The reminder identifies the active Microchallenge and its first concrete
  instruction. It offers `Done`, `Partly`, and `Didn't happen` responses.
- `Done` records a completed repetition and advances the existing 21-day
  progress calculation. `Partly` and `Didn't happen` record truthful evidence
  for the day without advancing completed-day progress.
- After `Partly` or `Didn't happen`, Neurocient invites one optional ordinary
  text reply about what got in the way. A 15-minute, account-bound pending state
  stores that reply on the same daily log. The legacy `note:` command remains
  accepted for compatibility but is not shown to users.
- Only one outcome may be recorded for an assignment and calendar day. Provider
  replay, repeated replies, and concurrent web/WhatsApp submissions must not
  create duplicate progress.
- A response is applied only to the sender's current active assignment. A stale
  response must not update a removed, completed, failed, or different user's
  assignment.
- A plain-text outcome is tied to the assignment recorded on that India-day's
  durable WhatsApp reminder dispatch. Without that context it is guidance, not
  permission to mutate whichever challenge happens to be active later.
- A reply may resolve user interaction after a dispatch whose provider outcome
  was uncertain: the durable assignment context remains valid because the
  signed inbound reply itself demonstrates that the prompt reached the verified
  sender. Failed and skipped dispatches do not create response authority.
- A report made on WhatsApp is visible through the existing Microchallenge web
  APIs. A web report prevents a later reminder or duplicate WhatsApp report.
- `spot:` retains command priority. `help` and an unrecognised message from a
  verified sender receive concise guidance; an unknown sender receives the same
  generic webhook response and no account-disclosing reply.
- Purpose and channel consent remain authoritative for outbound optional
  reminders. A user-initiated inbound Spot or progress response is accepted from
  the currently verified number even when optional reminders are disabled.
- Daily nuggets retain the current shared-content outbound path. They are
  one-way in this version. The first web or worker request for an India calendar
  day durably selects one active nugget; every later web and outbound request
  for that date reuses it even if the active content inventory changes. When a
  user also has an unreported active
  Microchallenge with reminders enabled, that reminder takes priority and the
  nugget is skipped for the day.

## Proactive template contract

Scheduled WhatsApp messages never fall back to free-form text. Inbound
acknowledgements use service messages within the customer-service window;
scheduled reminders use these Meta Utility templates in `en_GB`:

- `neurocient_daily_nudge_v2` with title `{{1}}` and nudge content `{{2}}`;
- `neurocient_spot_checkin_v2` with check-in title `{{1}}` and state-aware
  prompt `{{2}}`; and
- `neurocient_microchallenge_checkin_v2` with the active experiment title
  `{{1}}` and first concrete instruction `{{2}}`.

All three fixed bodies state that the user asked to receive the message. The
approved `v2` templates omit the repeated STOP footer: STOP is explained during
pairing and remains available at any time without turning every Utility reminder
into an exit prompt. The Microchallenge body permanently includes `Done`,
`Partly`, and `Didn't happen`; template variables cannot remove those choices.
The daily nudge contains no product link, membership prompt, promotion, or
return-to-app call to action. Meta remains the final category authority.

On 2026-11-12 the configured WABA approved all three definitions as `UTILITY`.
Repository configuration owns their names and language,
and `python -m scripts.create_whatsapp_templates` provides a dry-run by default;
`--apply` creates only missing definitions.

All three `v2` templates were submitted as `UTILITY` on 2026-11-12 without a
STOP footer and are approved. Repository defaults now select the `v2` set. The
approved `v1` templates remain in Meta as rollback assets and retain their
original STOP footer.

## Failure and privacy contract

- The Meta webhook's raw-body HMAC-SHA256 signature, configured business and
  phone-number identities, bounded JSON parsing, privacy-safe logging, and
  `wamid` replay claim remain mandatory.
- The replay claim and any Spot or Microchallenge mutation commit in one database
  transaction before a reply is attempted.
- A provider reply failure must not roll back a committed user record or invite
  duplicate mutation. It leaves a privacy-safe operational event; durable
  service-reply retries remain deferred.
- Product-authored outbound bodies remain bounded to 1,600 characters. A long
  Microchallenge title or instruction must not remove the three response
  options. When Meta accepts a scheduled dispatch and returns a well-formed
  `wamid`, that identifier is retained on the durable dispatch record.
- Phone numbers, message text, notes, pairing tokens, signatures, and
  provider response bodies must not appear in application logs.
- A successful Graph response records `accepted`, not delivered. Signed status
  callbacks advance a matching provider `wamid` to `delivered` or `read`, or to
  `failed` with a bounded Meta error code. Late or duplicate callbacks cannot
  downgrade a stronger delivery state.

## Acceptance criteria

- **WA-COMP-01:** An authentic `spot:` message from a verified number writes one
  Spot across sequential and concurrent provider replay. Human spacing such as
  `Spot : description` remains valid without broadening unrelated commands.
- **WA-COMP-02:** An eligible user receives reminder copy containing their active
  Microchallenge rather than a generic reminder.
- **WA-COMP-03:** Authentic `Done`, `Partly`, and `Didn't happen` responses write
  one outcome to the sender's active assignment for the India calendar day.
- **WA-COMP-04:** Only `Done` increases completed-day progress; all three outcomes
  prevent another reminder for that day.
- **WA-COMP-05:** Unknown senders, inactive assignments, expired experiments,
  duplicate replies, and unknown commands cause no incorrect progress mutation.
- **WA-COMP-06:** The existing web log request remains backward compatible and is
  treated as `Done` when it omits an outcome.
- **WA-COMP-07:** The signed-in home and WhatsApp resolve to one durable nugget
  for the same India calendar day, including concurrent first access and later
  changes to the active nudge inventory.
- **WA-COMP-08:** Provider-valid outbound bodies stay within 1,600 characters,
  Microchallenge response options survive truncation, and accepted scheduled
  sends retain the provider `wamid` when available.
- **WA-COMP-09:** Web and WhatsApp Spot capture enforce the same serialized
  free-account allowance; a denied WhatsApp write commits no Spot while keeping
  the webhook response generic.
- **WA-COMP-10:** Every scheduled WhatsApp purpose uses its configured approved
  template; service replies remain text messages and are never used as a
  proactive fallback.
- **WA-COMP-11:** Authentic delivery callbacks update only the dispatch matching
  their provider `wamid`, preserve monotonic status, and store no provider text.
- **WA-COMP-12:** Pairing includes an account-bound, 80-bit connection code in
  four readable groups and places STOP guidance in Neurocient's successful
  connection confirmation, not in the person's prefilled consent sentence.
- **WA-COMP-13:** `Partly` and `Didn't happen` open a 15-minute obstacle-note
  reply state; the next ordinary text is stored once on that day's outcome.

## Deferred provider work

- interactive reply buttons;
- durable outbound service-reply records and retry;
- exact-release-candidate WhatsApp journey evidence and limited-cohort rollout.

## Rollout and recovery

Apply the additive outcome migration before deploying the companion code. The
migration backfills every existing daily log as `Done`, preserving historical
progress. After a `Partly` or `Didn't happen` outcome exists, schema downgrade
is blocked because older code would miscount that evidence as a completed day;
use forward repair instead.

Apply the following daily-nudge-selection migration before application code.
It is additive and may be downgraded independently while the companion is not
serving traffic. The table retains one row per product day and prevents a
selected nugget from being deleted while it remains part of that day's shared
experience.

## Local implementation evidence

- Focused backend tests cover explicit command parsing, response authority,
  outcome semantics, note attachment, consent rechecks, provider failures,
  content bounds, provider `wamid` retention, and reminder priority.
- Real PostgreSQL tests cover signed webhook privacy, sequential and concurrent
  replay, shared Microchallenge outcomes, rollback/retry behavior, and
  concurrent durable daily-nugget selection. They also prove that WhatsApp
  cannot bypass the web Spot allowance.
- A disposable PostgreSQL migration run proved legacy log backfill to `Done`,
  outcome constraint creation, daily-selection upgrade/downgrade/re-upgrade,
  and the forward-repair guard after `Partly` evidence.
- The 2026-11-04 provider pivot passed 292 backend non-integration tests. Four
  Meta webhook PostgreSQL scenarios and the notification-consent integration
  passed; every repository PostgreSQL scenario also passes when the existing
  Windows event-loop-sensitive files run in isolated processes. The production
  frontend build passed. Lint reports only existing generated-file warnings and
  an unrelated `Pricing.tsx` apostrophe error; the changed privacy page is clean.
- The legacy Microchallenge page remains an oversized orchestration surface at
  796 physical lines. The new check-in rendering was extracted into its own
  covered component so this change does not add another render responsibility;
  the next material Microchallenge-page change should continue decomposition.
- On 2026-11-12 a local FastAPI/PostgreSQL candidate exposed through ngrok sent
  all three approved Utility templates through Neurocient's configured number;
  Meta callbacks advanced all three to `delivered`. The owner exercised Spot,
  STOP/START, `Done`, duplicate `Done`, `Partly`, and `Didn't happen`; durable
  state matched each contract. After the parser correction, the owned-number
  message `Spot : spacing regression test` created exactly one Spot; that
  disposable record was then removed by its resolved ID. The owner also sent
  `note:`; its live webhook arrived, while durable note behavior is retained as
  real-PostgreSQL integration evidence because the disposable fixture was
  cleaned before inspection.
- Deployed dev-candidate verification and limited-cohort operation remain
  provider-staging evidence and are not claimed here.
- On 2026-11-04, genuine Meta test-number inbound delivery and callback handling
  passed locally. Both direct Graph API text and Meta dashboard `hello_world`
  template requests were accepted, then failed in Meta's delivery callback with
  `131031 Business Account locked`. The test WABA and portfolio showed no visible
  issues. This remains useful historical test-number evidence but is not a
  launch blocker. The later owned-number ngrok journey above supersedes it at
  the local-provider boundary but does not replace a deployed dev-candidate
  journey with retained release evidence.
