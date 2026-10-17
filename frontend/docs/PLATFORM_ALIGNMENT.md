# Neurocient Platform Alignment

Status: working product contract
Owner: Neurocient product
Baseline: 2026-10-14

## Purpose

Neurocient should feel like one guided product rather than a collection of
articles, diagnostics, tools, programs, and account pages. This document maps
the role of every current surface and sets the contract for connecting them.

It applies the product direction in `NEUROCIENT_PRODUCT_SYSTEM.md`, the shared
interface rules in `DESIGN_SYSTEM.md`, and the more detailed Scan and Practice
contracts. Those sources continue to govern their specialist journeys.

## The User-Centred Product Model

The user does not need to understand Neurocient's internal content types. They
need to know what the product can help them do next.

1. **Recognise it** — see an automatic response in an ordinary situation.
2. **Understand it** — learn why that response arises and why familiar advice
   may be incomplete.
3. **Work with it** — examine one recurring behaviour through Identity,
   Knowledge, Environment, and Action.
4. **Use it in real life** — notice the response in your own situations and try
   small behavioural experiments.

Evidence of noticing earlier, changing a condition, taking a useful action, or
returning after forgetting belongs inside the signed-in Profile. It is not a
separate stage the user must understand or visit.

The product promise remains **Get more life from life**. Every major surface
must help the person reclaim time, energy, connection, or possibility from
automatic behaviour. A surface that cannot explain its role in this movement
should not be a primary destination.

## Audience Paths

Neurocient currently serves two related but different entry paths.

### Personal path

Landing → Inner Caveman Scan → answer-based reflections → saved My Inner Caveman and Spot → relevant
Practice or microchallenge → reinforcement and evidence in Profile

Inner Caveman 101 and Insights support understanding at any point. They are not
separate content businesses and should return the person to a relevant next
step when appropriate.

### Workplace path

Workplace landing → CIC diagnostic → workplace interpretation → conversation,
workshop, or program

The workplace path shares the Inner Caveman lens, but it has a different actor,
problem, and conversion. It must not interrupt or confuse the personal product
journey.

## Surface Contracts

| Surface | User question | Product role | Primary continuation |
| --- | --- | --- | --- |
| `/` | “Why do I keep doing this?” | Establish the lived problem, product promise, and Inner Caveman lens | Start the Scan |
| `/diagnostics/caveman-scan` | “Can I see this in myself?” | Recognition through concrete situations; not a personality test | Public result |
| `/diagnostics/caveman-scan/result` | “Where did my Inner Caveman show up?” | Reflect selected answers without inferring a type or pattern | Save and continue to My Inner Caveman |
| `/my-caveman` | “What have I noticed in the Scan and real life?” | Saved answer reflections and lived evidence; not a diagnostic portrait | Record a real-life situation or take one relevant next step |
| `/inner-caveman` | “What is the Inner Caveman?” | Shared orientation and usable mental model | Scan, relevant insight, or Practice |
| `/insights` | “Why might this behaviour keep happening?” | Find explanations through lived questions; not primarily a publication feed | Relevant article, then a matched next step |
| `/insights/[slug]` | “Help me understand this one behaviour.” | A focused explanation that reduces self-blame without inventing agency | Spot, Practice, or related explanation |
| `/practice` | “How can I work with one behaviour?” | Guided, emotionally lightweight behaviour change | Reinforcement and saved continuity |
| `/tools/spots` | “What actually happened in my life?” | Low-friction capture of lived evidence | Personal portrait or matched experiment |
| `/tools/microchallenges` | “What small experiment can I try?” | Small real-world behaviour experiment | Log evidence and return |
| `/tools` | “What support is available?” | Secondary support index, not a primary product stage | The relevant support tool |
| `/modern-caveman` | “Can I do this with live guidance?” | High-touch personal program | Enrolment or conversation |
| `/caveman-cubicle` | “How does this affect teams and leadership?” | Workplace offer and its evidence | CIC diagnostic or workshop conversation |
| `/diagnostics/cic` | “What may be shaping this team?” | Workplace diagnostic | Workplace result and conversation |
| `/programs` | “What deeper ways of working with Neurocient exist?” | Offer index, not the centre of the self-guided product | Relevant personal or workplace offer |
| `/saved` | “What did I want to return to?” | Account utility for saved reading | Saved item |
| `/profile` | “What have I noticed, tried, and changed?” | Signed-in home for personal evidence, reflections, account settings, and delivery preferences | One relevant next move |
| `/membership` | “What access can I buy?” | USD 9/month self-guided access after free limits | Hosted checkout or assisted activation |
| `/about` | “Who is behind this, and why should I trust it?” | Founder, mission, method, and credibility | A relevant starting point or contact |
| `/contact` | “How can I speak with Neurocient?” | Personal, workplace, and collaboration contact | Successful enquiry |

`/insights/all` and `/tags/[tag]` are discovery utilities within Insights.
`/privacy` and `/terms` are trust and legal utilities. `/subscribe` is a legacy
commercial route that redirects to the canonical Membership page.

## Global Navigation Contract

The product journey is the organising logic behind routes and transitions; it
does not need to become the navbar taxonomy before the individual destinations
have been fully aligned.

For now, global navigation retains the established destinations:

- **Insights** — explore a specific behaviour.
- **Practice** — work with a behaviour.
- **Diagnostics** — access the personal and workplace scans.
- **Tools** — access Spots and Microchallenges.
- **Programs** — access personal and workplace offerings.
- **About** — understand the organisation and method.

The navbar does not include a separate Start the Scan action. Contextual calls
to action on the landing page and within the journey continue to lead to the
Scan. Saved and Profile remain account-owned destinations.

The footer may expose more of the system, but it must group links by user
purpose: Start, Understand, Practice, Go deeper, and Company. It must not mix
account utilities into the public product hierarchy.

## Narrative Contract

Across the platform, the basic explanation is:

1. A concrete situation occurs.
2. Evolved automatic processing gives particular information or outcomes more
   weight before deliberate reasoning finishes.
3. The resulting behaviour may have an immediate payoff and a later cost.
4. This is not proof of a flawed identity, nor proof that the response is trying
   to help.
5. Understanding creates room to change identity stories, information,
   surroundings, and actions.
6. Repetition and retrieval matter because one explanation is easy to forget.

Use direct descriptions of the situation, response, immediate consequence, and
relevant evidence. Do not turn the Inner Caveman into a protector, guardian,
speaker, personality, anatomical brain layer, or agent with intentions. Avoid
using “nervous system,” “wiring,” “threat,” or “safety” as vague authority. Use
those terms only when the scientific claim is precise and supported.

“Inner Caveman” is the public shorthand. “Automatic processing,” IKEA,
Watchtowers, persistence models, and evidence versions are internal or taught
concepts whose exposure must be earned by the experience.

## Current Alignment Gaps

### Critical product coherence

- Article limits are incremented consistently for anonymous and signed-in users,
  but remain browser-local rather than authoritative account usage. They should
  move to persisted account enforcement with the payment integration.

### Information architecture

- Spotting exists as both the general `/tools/spots` surface and the staged
  `/my-caveman/spot` continuation. Their relationship is meaningful internally
  but not yet clear to users.

### Narrative and content

- Protector language and personified “caveman brain” language remain in older
  landing, Inner Caveman, article, and inactive Scan source material. Current
  Scan, CIC, Spots, Microchallenges, and account handoffs use direct response
  language, but this is not yet a whole-content migration.
- “Ancient wiring,” “nervous system,” “dominant patterns,” “train your brain,”
  and “work with your biology” are used as interchangeable explanations even
  though they make different scientific claims.

### Trust and product state

- Public surfaces make unverified scale and outcome claims that require an
  evidence owner before publication.
- Product naming alternates between Neurocient, Neurocient Labs, and The
  Neurocient Labs.
- Metadata, sitemap coverage, navigation labels, and page titles do not yet
  describe destinations consistently.

## Delivery Sequence

### Phase 1 — Establish the frame

- Align the footer, account surfaces, route names, and primary entry points with
  this contract while retaining the established navbar for now.
- Remove account utilities from public navigation groups.
- Make Profile the signed-in home for personal evidence and continuity.
- Record the platform-level decision in the decision log.

### Phase 2 — Make the central journey continuous

- Reconcile landing → Scan → result → Spot → Profile.
- Remove stale product-state copy from the result.
- Make each transition explain why the next surface is useful.
- Preserve meaningful anonymous value before authentication.

### Phase 3 — Clarify understanding

- Rebuild the Insights entry around lived questions while retaining the archive
  and tag utilities.
- Define the boundary between Inner Caveman 101 and individual Insights.
- Give articles matched continuations instead of relying on random recency.

### Phase 4 — Clarify application and support

- Position Practice as the guided self-service product.
- Position spotting, microchallenges, reminders, and reflections as support for
  the same loop rather than a tools catalogue.
- Replace fixed or activity-only progress with real-life evidence.

### Phase 5 — Complete offers and access

- Connect a payment gateway to the provider-neutral Membership entitlement.
- Distinguish free self-guided product, paid membership, live personal program,
  and workplace services.
- Remove or redirect duplicate commercial routes and update every gate.

### Phase 6 — Narrative and trust pass

- Apply the narrative contract across all public copy and article metadata.
- Review scientific claims and source requirements.
- Standardise organisation naming, metadata, sitemap, and trust language.

## Acceptance Criteria

- **PA-01:** A first-time visitor can identify the primary starting action from
  every public top-level surface.
- **PA-02:** Every top-level route answers a distinct user question and names a
  relevant continuation.
- **PA-03:** Personal, workplace, account, and commercial paths are visibly
  distinct while sharing one product foundation.
- **PA-04:** Global navigation, footer, sitemap, metadata, and page titles use
  consistent destination names.
- **PA-05:** Account-owned utilities are not presented as public product stages.
- **PA-06:** No current public copy assigns intention or agency to the Inner
  Caveman or contradicts the current product-language rule.
- **PA-07:** Claims about access, price, limits, product availability, and saved
  state match runtime behaviour.
- **PA-08:** Mobile presents one primary path and one clear next action before
  exposing secondary choices.
- **PA-09:** Changes are verified by build, focused tests, narrow mobile review,
  desktop review, keyboard review, and route/CTA traversal at the fidelity
  available in the environment.

## Decisions Still Requiring Product Ownership

1. The holistic evidence and governance model for public claims: subscriber
   count, participant outcomes, neuroscience statements, and guarantees.
2. The redesigned relationship between `/my-caveman` and the staged
   `/my-caveman/spot` continuation.

Claims governance is intentionally deferred as a whole-platform workstream.
Existing article narratives remain unchanged until that review.
