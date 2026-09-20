# Neurocient Product System

## Purpose

This document preserves the current product direction connecting Neurocient's positioning, the Inner Caveman Scan, Inner Caveman 101, Practice, and the existing behavior-change tools.

The product promise is:

> **Get more life from life.**

Neurocient exists to help people lose less time, attention, energy, connection, and possibility to protective patterns operating on autopilot. It should move beyond explaining those patterns in a knowledge base. It should help people see the patterns in themselves, understand what they protect, work with them in real situations, and retrieve useful responses when life happens again.

## The Core Problem

People often know what they should do and may genuinely want to do it. Yet procrastination, distraction, comparison, worry, pressure, guilt, disconnection, and other recurring patterns continue.

Most conventional fixes operate at the level of behavior: try harder, organize better, become more disciplined, or stay motivated. Neurocient starts underneath behavior.

Many modern struggles contain older protective responses shaped around survival, belonging, hierarchy, bonds, and care. These responses are not personal failures. They may be sensible adaptations using old priorities in a very different environment.

The product should help close the knowing-doing gap without shaming the user or turning the Inner Caveman into an enemy.

## The Inner Caveman

The Inner Caveman is Neurocient's shorthand for the fast, protective system that reacts before deliberate reasoning. It is not a literal anatomical brain layer, a villain, a diagnosis, or a fixed personality type.

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

This is not a trait assignment. A person may use different Watchtowers in different contexts, and the portrait should describe that landscape rather than declare a dominant personality type.

### Rational Mind is not a Watchtower

Rational Mind remains categorically separate. The Watchtowers scan for particular forms of survival-relevant meaning. Rational Mind stays with the available evidence and asks what is actually happening without automatically turning ambiguity into a protective story.

Do not describe Rational Mind as a command tower, superior tower, or ruler defeating the Caveman. Useful internal shorthand is:

> The Watchtowers ask, "What might this mean for us?" Rational Mind asks, "What is actually happening?"

Persistence should therefore distinguish `WatchtowerId` from the Rational Mind response target. Do not model Rational Mind as a sixth Watchtower or sixth drive.

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

Scenario responses should persist the selected evidence target, scenario and option versions, and the mapping at the time of selection. Reports should be generated from this evidence rather than storing only a winning Watchtower.

### Report and visual language

Prefer portrait language such as:

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

- what their ancient protective system makes ordinary ambiguity mean;
- which survival concerns their mind notices or protects first;
- the situations in which particular drives repeatedly appear;
- where Rational Mind can hold the same moment without automatically making it a survival concern.

The desired outcome is:

> "I can finally see my Inner Caveman."

Recognition, not numerical precision, is the primary success metric. The final result should read as a humane narrative portrait, not a diagnosis or percentage-led scorecard.

### Experience model

Concrete lived scene → honest continuation → conventional interpretation → Inner Caveman contrast → optional science → evidence across moments

Scenarios should feel ordinary, recent, concrete, emotionally safe, and drawn from behaviour established on the landing page. Ask what happens next in the lived moment rather than asking the user to explain themselves through the framework. Write the scene truthfully first and assign internal Watchtower evidence second. Never force all five drives into one scenario.

## Why Rational Mind Is Essential

Rational Mind is not a sixth drive and not merely a "none of these" escape hatch. It supplies the contrast needed to understand whether an ancient drive is taking the interpretive lead at all.

Without Rational Mind, every scenario presupposes that the moment must be interpreted through one of the five survival concerns. With it, the Scan can observe both:

- which drive leads when the Inner Caveman is active; and
- how often the person can respond to what is present without turning ambiguity into a protective story.

Rational Mind should not be framed as defeating, silencing, or exiling the Caveman. Its role is to determine whether the protective interpretation fits the current moment.

Self-report carries an unavoidable risk: a person may select how they want to see themselves rather than what actually arises. Neurocient accepts this risk. Design should reduce it by making every response equally human and believable, avoiding obviously virtuous Rational Mind copy, and asking about the first familiar voice rather than the best response.

## Inner Caveman 101

Inner Caveman 101 is the shared orientation layer. The repository already contains early material through the complete Inner Caveman guide, the Foundation pathway, evolutionary mismatch insights, audio, books, and research.

Its job is not to become a compulsory course or another content dump. It should give users a usable mental model:

- the Inner Caveman is fast and protective;
- old drives can misread modern circumstances;
- the response is not proof of personal failure;
- the five drives describe what may be protected;
- the event and the meaning assigned to it are not identical;
- Rational Mind can appraise the moment more directly;
- understanding creates room, but real-life practice updates the pattern.

The Scan and 101 have different jobs:

- **The Scan:** "Here is how this may be showing up in you."
- **Inner Caveman 101:** "Here is a way to understand what you just saw."

The order may be flexible, but the two experiences should deliberately connect. A Scan portrait should lead into relevant parts of 101 rather than only linking to a generic content library.

## Practice

Practice is where Neurocient becomes applied rather than merely understood. It turns recognition into emotionally lightweight behavior change using IKEA + Reinforcement + Behavioral Design.

The rudimentary procrastination Practice is the first proof case. Its concrete scenes include escaping into easier tasks, waiting for deadline pressure, planning instead of touching the work, protecting against a messy first version, and delaying because the next decision is unclear.

Its behavioral spine is:

1. Recognize a lived behavior moment.
2. Audit familiar advice and expose the knowing-doing gap.
3. Reveal the protective logic beneath the pattern.
4. Loosen the damaging identity story.
5. Notice how the environment supports the old loop.
6. Choose one small, matched action.
7. Bring the insight back when the loop returns.
8. Capture real-life evidence of change later.

Procrastination is not the product architecture. It demonstrates how a broad Caveman insight can be followed into one recurring place where life is being lost. Future Practice loops may address avoidance, overthinking, comparison, distraction, people-pleasing, emotional eating, inconsistency, or waiting to feel ready.

## One Coherent Product Journey

The existing repository capabilities should be understood as parts of one journey rather than a collection of unrelated destinations.

1. **See it — Inner Caveman Scan**
   Recognize the ancient interpretation and recurring drives.
2. **Understand it — Inner Caveman 101**
   Learn why the pattern makes sense and what it may protect.
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

Modern moment → protective meaning → recognition → understanding → environmental or identity shift → tiny action → reinforcement → real-life evidence

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

> Neurocient helps people see the ancient protective patterns underneath modern struggles, understand them without shame, and work with them in real life so less of their one life is lost to autopilot.

## Scan Foundation Status

The current recognition Scan uses:

- scan version `recognition-1`;
- evidence version `protective-moves-1`;
- report version `two-level-portrait-1`;
- the 12 landing-page-derived lived scenarios documented in the Scan authoring guide;
- option-level protective moves, possible concerns, evidence strength, mirror language, costs, and optional Watchtower evidence;
- deterministic portrait generation based on recurrence across different scenarios rather than a Caveman score;
- an open primary portrait at `/diagnostics/caveman-scan/result`, followed by an authenticated deeper portrait at `/my-caveman`; and
- versioned authenticated backend sessions containing responses, evidence, and the generated portrait.

The deeper portrait adds a supported secondary movement, life contexts, likely costs, moments of flexibility, repeated protective concerns, and a continuation selected from the primary movement. A concern is shown only when supported more than once, and missing evidence is never presented as a quiet Watchtower.

Authenticated users can revisit their latest completed portrait at `/my-caveman`. When the browser does not contain a current Scan, this dedicated personal surface loads the latest completed account portrait. Local storage remains a resume convenience rather than the account retrieval mechanism.

The post-portrait progression is staged rather than presented as a tools menu:

1. `/my-caveman` offers one personalised recognition cue.
2. `/my-caveman/spot` records a real moment through the existing Spots system.
3. The first Spot reinforces observation only; repeated evidence opens the microchallenge surface.
4. Completed microchallenges may lead into Practice only when a relevant authored Practice exists. The current direct handoff is limited to procrastination; other Caveman movements must not be forced into it.

Saved Spots matching the primary movement are reflected back inside `/my-caveman`. The personal portrait therefore progresses from scan evidence to lived evidence and changes its single next action accordingly. Internal pattern identifiers stored with Spots are never displayed to users and “patterns” must not become the user-facing frame for the journey.
