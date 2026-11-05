# Neurocient Product System

Status: current cross-product direction

Owner: Neurocient product

Last updated: 2026-11-04

## Purpose

This document preserves the current product direction connecting Neurocient's positioning, the Inner Caveman Scan, Inner Caveman 101, Practice, and the existing behavior-change tools.

The product promise is:

> **Get more life from life.**

Neurocient exists to help people lose less time, energy, connection, and possibility to automatic responses operating without intention. It should move beyond explaining those responses in a knowledge base. It should help people see what they actually do, understand why an evolved response arises, work with it in real situations, and retrieve a more useful response when life happens again.

## Current Product Shape (2026-11-04)

This is the current cross-product snapshot. Detailed Scan, Practice, payment,
WhatsApp, administration, and security contracts remain authoritative within
their own boundaries.

### What Neurocient is

Neurocient is a mobile-first, text-rich behaviour-change product for the gap
between knowing what would help and doing it in ordinary life. It is not a
content portal with some tools attached, a personality test, a generic habit
tracker, or an open-ended wellness chatbot.

The Inner Caveman is the shared explanation: evolved automatic processing can
give a modern situation disproportionate survival-relevant meaning without
intending, choosing, protecting, or trying to help. The response may once have
been adaptive and may still be unhelpful in the present situation.

The product movement is:

> recognise what happened -> understand why it arose -> work with one real
> behaviour -> try a small matched change -> retrieve it later -> notice
> evidence in life

### The connected surfaces

1. **Public landing and Insights** make the knowing-doing problem recognisable
   and provide the shared Inner Caveman explanation without requiring a course.
2. **The Inner Caveman Scan** reflects only the person's actual selected
   answers. It does not infer a type, dominant drive, score, or person-level
   pattern. The complete primary result remains visible before authentication.
3. **My Inner Caveman and Spots** preserve selected-answer reflections and add
   situations the person notices in real life. Authentication creates
   continuity; it does not unlock the meaning of the Scan result.
4. **Practice** is the guided behaviour-change product. It uses Identity,
   Knowledge, Environment, Action, and Reinforcement in that order, with one
   concrete recognition or decision at a time. The current `/practice` route is
   a clean shell awaiting the rebuilt reusable challenge flow; existing auth,
   access, preferences, worksheet, tracker, challenge, progress, and reminder
   infrastructure should be reused.
5. **Microchallenges** are small real-world experiments that follow a relevant
   understanding. They are not a detached challenge catalogue or a streak
   system.
6. **WhatsApp** is a deterministic companion for Spots, the active
   Microchallenge check-in, and the shared daily nugget. The web remains where
   a person chooses and configures their work.
7. **Membership** unlocks the self-guided product. **Modern Caveman** is a
   separate live, facilitated cohort purchase; it does not grant membership and
   membership does not reserve a cohort place.

### Access and commerce

- Razorpay is the sole checkout provider for the four owned offers: INR 499/month
  and USD 6/month for Membership; INR 21,000 and USD 249 once for Modern Caveman.
- Currency selection is explicit. The backend owns each exact amount/currency;
  neither browser FX nor geographic inference changes the offer.
- Razorpay International Cards / International Payments is account-enabled, but
  genuine USD one-time and recurring lifecycle evidence is still required before
  live international charging.
- Provider callbacks never grant access by themselves. Server-created payment
  objects, verified and deduplicated provider events, provider-neutral
  entitlements, and separate cohort-enrolment state remain authoritative.

### Provider state, not product completion

- The WhatsApp transport is the direct Meta Cloud API. Genuine inbound test
  delivery and local callback handling work; outbound delivery is waiting on
  Meta to resolve test WABA error `131031 Business Account locked`.
- Razorpay international card activation is shown as successful. A Test Mode USD
  membership plan, recurring international approval, and genuine buyer/webhook/
  settlement evidence remain external readiness requirements.

These external waits do not justify parallel auth, progress, reminder,
entitlement, enrolment, or reinforcement systems. New provider work must attach
to the existing product state rather than create another product beside it.

## The Core Problem

People often know what they should do and may genuinely want to do it. Yet procrastination, distraction, comparison, worry, pressure, guilt, disconnection, and other recurring patterns continue.

Most conventional fixes operate at the level of behavior: try harder, organize better, become more disciplined, or stay motivated. Neurocient starts underneath behavior.

Many modern struggles contain evolved automatic responses shaped around survival, belonging, hierarchy, bonds, and care. These responses are not personal failures. They follow older tendencies operating in a very different environment, but that does not make them useful now.

The product should help close the knowing-doing gap without shaming the user or turning the Inner Caveman into an enemy.

## The Inner Caveman

The Inner Caveman is Neurocient's shorthand for evolved automatic processing that can shape a response before deliberate reasoning. It has no intention or agency. It is not a literal anatomical brain layer, an inner personality, a guardian, a villain, a diagnosis, or a fixed personality type.

Its five core drives are:

1. Safety & Survival — Am I safe?
2. Belonging & Affiliation — Am I included?
3. Status & Hierarchy — Where do I stand?
4. Mate & Bond Security — Is this bond secure?
5. Kin Care — Are my people okay?

These drives are neither good nor bad. The useful question is whether an ancient concern is interpreting a modern moment proportionately.

## Watchtowers: The Internal Product Model

While building the Scan, refer internally to the five core drives as **Watchtowers**.

"Drive" can sound like a trait, a quantity a person possesses, or a force determining behavior. "Watchtower" keeps the product focused on attention and appraisal: when an ordinary moment occurs, where does the Inner Caveman run to keep watch first?

The working metaphor is:

- **Horizon — Safety & Survival:** watches for danger, instability, scarcity, and what might go wrong.
- **Campfire — Belonging & Affiliation:** watches inclusion, acceptance, group connection, and the risk of being left outside.
- **High Ground — Status & Hierarchy:** watches position, recognition, competence, visibility, and relative standing.
- **Home Path — Mate & Bond Security:** watches closeness, distance, trust, attachment, and whether an important bond remains secure.
- **Care Circle — Kin Care:** watches responsibility, provision, vulnerability, and the wellbeing of people who depend on us.

These metaphor names are working language and may be refined through product design. The underlying scientific construct must remain attached as metadata so language can evolve without corrupting historical evidence.

The internal question is:

> Which Watchtower does the Inner Caveman run to first when something happens?

This is not a trait assignment. A person may respond differently across contexts. The current Scan does not aggregate answers into a Watchtower portrait or declare a dominant personality type; Watchtower metadata remains conceptual and authoring context only unless a later approved contract gives it another role.

### Rational Mind is not a Watchtower

Rational Mind remains categorically separate. The Watchtowers describe particular forms of survival-relevant meaning. Rational Mind stays with the available evidence and asks what is actually happening without automatically turning ambiguity into a survival-relevant story.

Do not describe Rational Mind as a command tower, superior tower, or ruler defeating the Caveman. Useful internal shorthand is:

> The Watchtowers ask, "What might this mean for us?" Rational Mind asks, "What is actually happening?"

If Watchtower evidence is used in future authored research or product work,
persistence must distinguish `WatchtowerId` from the Rational Mind response
target. Do not model Rational Mind as a sixth Watchtower or sixth drive. The
current Scan persists selected option and reflection identifiers, not an
inferred Watchtower result.

### Implementation direction

Use stable metaphor-neutral or version-safe identifiers with explicit construct metadata. For example:

```ts
type WatchtowerId =
  | "horizon"
  | "campfire"
  | "high_ground"
  | "home_path"
  | "care_circle";

type EvidenceTarget = WatchtowerId | "rational";

type Watchtower = {
  id: WatchtowerId;
  construct: "safety" | "belonging" | "status" | "bond" | "kin";
  name: string;
  watchesFor: string[];
};
```

This type model is retained only for future authoring or research that explicitly
needs Watchtower evidence. It is not the current Scan persistence contract.
Current Scan sessions persist canonical selected option IDs and stable
reflection IDs under the versions defined in the Scan result contract; they do
not persist a winning Watchtower or generated person-level result.

### Report and visual language

If a future approved experience uses Watchtower language, prefer situational language such as:

- "Your Caveman often heads for the High Ground first."
- "In closer relationships, it watches the Home Path."
- "In some moments, no Watchtower needed to take over; you could stay with what was known."

Avoid language such as:

- "Status is your dominant trait."
- "You have a high Bond drive."
- "You are 40% rational."

The metaphor may support a calm, adult visual landscape in which Watchtowers, paths, distance, and light gradually become visible. Avoid cartoon treatment, gamified towers, or a hierarchy that makes Rational Mind morally superior.

## Purpose Of The Inner Caveman Scan

Detailed scenario, choice, reflection, Watchtower-mapping, and science-note guidance lives in `frontend/docs/scan/SCAN_AUTHORING.md`.

The Scan first helps a person recognise a recurring lived behaviour in an ordinary moment and begin appreciating how the Inner Caveman may be shaping it.

The Scan is not a quiz, personality assessment, psychometric test, diagnosis, or behavior score. It is a recognition experience.

It helps a person notice:

- what evolved automatic processing can make ordinary ambiguity mean;
- which survival-relevant meaning is authored into a selected response;
- the particular situations in which the person recognises an automatic response;
- where Rational Mind can hold the same moment without automatically making it a survival concern.

The desired outcome is:

> "I can finally see my Inner Caveman."

Recognition, not numerical precision, is the primary success metric. The current result should reflect selected answers directly, not turn them into a diagnosis, portrait, or percentage-led scorecard.

### Experience model

Concrete lived scene → honest continuation → conventional interpretation → Inner Caveman contrast → optional science → evidence across moments

Scenarios should feel ordinary, recent, concrete, emotionally safe, and drawn from behaviour established on the landing page. Ask what happens next in the lived moment rather than asking the user to explain themselves through the framework. Write the scene truthfully first and assign internal Watchtower evidence second. Never force all five drives into one scenario.

## Why Rational Mind Is Essential

Rational Mind is not a sixth drive and not merely a "none of these" escape hatch. It supplies the contrast needed to understand whether an ancient drive is taking the interpretive lead at all.

Without Rational Mind, every scenario presupposes that the moment must be
interpreted through one of the five survival concerns. With it, each authored
situation can show both an Inner Caveman response and a more deliberate
alternative. The Scan reflects the option selected in that situation; it does
not aggregate those choices into a leading drive or a rationality score.

Rational Mind should not be framed as defeating, silencing, or exiling the Caveman. Its role is to determine whether the automatic interpretation fits the current moment.

Self-report carries an unavoidable risk: a person may select how they want to see themselves rather than what actually arises. Neurocient accepts this risk. Design should reduce it by making every response equally human and believable, avoiding obviously virtuous Rational Mind copy, and asking about the first familiar voice rather than the best response.

## Inner Caveman 101

Inner Caveman 101 is the shared orientation layer. The repository already contains early material through the complete Inner Caveman guide, the Foundation pathway, evolutionary mismatch insights, audio, books, and research.

Its job is not to become a compulsory course or another content dump. It should give users a usable mental model:

- the Inner Caveman describes fast automatic processing without intention;
- old drives can misread modern circumstances;
- the response is not proof of personal failure;
- the five drives describe survival-relevant concerns that may become salient;
- the event and the meaning assigned to it are not identical;
- Rational Mind can appraise the moment more directly;
- understanding creates room, but real-life practice updates the pattern.

The Scan and 101 have different jobs:

- **The Scan:** "Here are the moments and responses you recognised."
- **Inner Caveman 101:** "Here is a way to understand what you just saw."

The order may be flexible, but the two experiences should deliberately connect. Selected-answer reflections should lead into relevant parts of 101 rather than only linking to a generic content library.

## Practice

Practice is where Neurocient becomes applied rather than merely understood. It turns recognition into emotionally lightweight behavior change using IKEA + Reinforcement + Behavioral Design.

The procrastination Practice is the first authored proof case for the rebuilt shared flow. Its concrete scenes include escaping into easier tasks, waiting for deadline pressure, planning instead of touching the work, avoiding a messy first version, and delaying because the next decision is unclear.

Its behavioral spine is:

1. Recognize a lived behavior moment.
2. Audit familiar advice and expose the knowing-doing gap.
3. Reveal the emotional and automatic logic beneath the behaviour.
4. Loosen the damaging identity story.
5. Notice how the environment supports the old loop.
6. Choose one small, matched action.
7. Bring the insight back when the loop returns.
8. Capture real-life evidence of change later.

Procrastination is not the product architecture. It demonstrates how a broad Caveman insight can be followed into one recurring place where life is being lost. Future Practice loops may address avoidance, overthinking, comparison, distraction, people-pleasing, emotional eating, inconsistency, or waiting to feel ready.

## One Coherent Product Journey

The existing repository capabilities should be understood as parts of one journey rather than a collection of unrelated destinations.

1. **See it — Inner Caveman Scan**
   Recognize the automatic interpretation in specific selected moments.
2. **Understand it — Inner Caveman 101**
   Learn why the response arises and what concern has become salient.
3. **Find it in life — Spot Your Inner Caveman**
   Catch the pattern close to real moments and build awareness of triggers.
4. **Work with one pattern — Practice**
   Apply Identity, Knowledge, Environment, and Action to a meaningful behavior loop.
5. **Try something small — Matched actions and microchallenges**
   Run emotionally light real-world experiments rather than attempting total transformation.
6. **Help it return — Reinforcement**
   Use nudges, WhatsApp, reminders, retrieval, and reflection to bring the insight back at the right time.
7. **See life changing — Progress evidence**
   Show noticing earlier, returning sooner, changing the setup, taking a small action, or interrupting autopilot—not merely streaks or platform activity.

The repeating product loop is:

Modern moment → automatic weighting → recognition → understanding → environmental or identity shift → tiny action → reinforcement → real-life evidence

## Public Landing Page Entry (2026-10-17)

The landing page should preserve Neurocient's emotional narrative—wanting more from life, knowing what would help, struggling to do it, and beginning to blame oneself—without making visitors complete a long conceptual lesson before they can understand the product.

Neurocient should be identifiable from the first screen as a behaviour-change platform for the gap between knowing and doing. Recognition should be followed quickly by a useful platform entry rather than treated as an end in itself.

The public entry model is:

1. **Emotional promise:** You want more from your one life.
2. **Recognition:** Familiar situations show the knowing-doing gap without shame.
3. **Explanation:** Evolved automatic processing can give modern signals disproportionate weight.
4. **Personal starting point:** The Inner Caveman Scan reflects how this may show up in the visitor's own life.
5. **Connected product:** Insights, Tools, Practice, Reinforcement, and Programs provide different ways to understand and work with what the visitor notices.

The Scan is the recommended starting point for someone who is unsure where to begin, but it is not a compulsory gate. A visitor may enter through an Insight, a Tool, Practice, or a Program when that route already matches the need they recognise.

The landing page introduces the Inner Caveman briefly and links to the complete guide for optional depth. It presents IKEA + Reinforcement as the method inside guided Practice rather than requiring visitors to learn the framework before they understand the product. Access and account conditions are disclosed on the relevant product surface, not explained as part of the landing-page narrative.

## Role Of Existing Systems

- **Scan:** the first personal mirror.
- **Inner Caveman 101 and insights:** the shared mental model and deeper understanding.
- **Spot Your Inner Caveman:** an everyday awareness log.
- **Practice:** guided application to a specific recurring pattern.
- **Microchallenges:** small behavior experiments, not an unrelated challenge catalogue.
- **Nudges and WhatsApp:** reinforcement channels, not generic engagement notifications.
- **Weekly reflections:** retrieval and meaning-making from lived evidence.
- **IKEA worksheets and trackers:** useful underlying persistence and tracking infrastructure; internal names need not be exposed to users.

These systems should be connected and reused. Do not create parallel auth, progress, reminder, reinforcement, or behavior-change stacks without a genuine product need.

## Product Principles

- Do not make the Inner Caveman the enemy.
- Do not reduce Neurocient to evolutionary-psychology content.
- Do not reduce Practice to tips, productivity advice, or habit tracking.
- Begin with recognition and understanding before asking for action.
- Keep behavior change emotionally light, concrete, and possible.
- Use progressive disclosure and one meaningful movement at a time.
- Treat forgetting as normal and reinforcement as part of the intervention.
- Measure progress through reclaimed agency and real-life evidence.
- Preserve the distinction between the five drives and Rational Mind.
- Let each capability serve the larger promise: more of the user's one life becoming available to them.

## Current Working Product Statement

> Neurocient helps people see the evolved automatic responses underneath modern struggles, understand why they arise without shame, and work with them in real life so less of their one life is lost to autopilot.

## Scan Foundation Status

The current recognition Scan is governed by
`frontend/docs/scan/RESULT_APPROACH.md` and uses:

- interpretation version `selected-response-1`;
- report version `answer-reflections-1`;
- the lived scenarios and option-specific authoring metadata documented in the
  Scan authoring guide;
- a stable, varied sample drawn only from answers the person actually selected
  and that are authored as Inner Caveman responses;
- the complete public result at `/diagnostics/caveman-scan/result`; and
- an authenticated continuation at `/my-caveman` that preserves the same
  selected-answer foundation rather than generating a deeper diagnostic.

The result must not infer a drive, type, trait, recurring movement,
person-level pattern, prediction, or score from the answer set. A deliberate
response is used as an authored contrast for a selected situation; Rational
Mind is not turned into a percentage or virtue signal. If the person selected
no authored Inner Caveman responses, the result says so and invents nothing.

Authentication saves continuity. It does not unlock the meaning of the public
result. `/my-caveman` may show the fuller relevant answer set and situations the
person later records from real life. **Record a real-life situation** continues
to the canonical Spots tool at `/tools/spots`.

The conceptual continuation is:

> what I chose in the Scan -> what I notice in real life -> what I understand
> -> what I try

Microchallenges or Practice should follow only when the person's actual
situation and an authored product flow make that continuation relevant. The
product must not force every Scan response into procrastination or manufacture
a person-level classification to choose the next surface.
