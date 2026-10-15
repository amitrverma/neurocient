# Practice Product Context

## What Practice Is
Practice is the new product surface for applying Neurocient concepts to lived behavior.

It starts on the web and may later become a mobile-native app. The web version should therefore avoid assumptions that only work for static portal pages.

Practice can be described, for now, as a personal growth system. Its deeper orientation is evolutionary psychology and evolutionary mismatch: recurring behaviours can reflect evolved automatic responses operating in modern environments with different incentives, friction, cues, and rewards.

The product promise is: **Get more life from life**.

This means a fuller life where less time, attention, energy, and possibility are lost to autopilot. Procrastination is not only task delay; it is a recurring moment where life quietly leaks into avoidance, background guilt, and postponed agency.

## Inner Caveman And Product Language

The Inner Caveman is a system operating according to evolved tendencies. It has no intention or agency and is not a protector, guardian, or inner personality trying to help the person. Its responses need not serve the person's current goals. Explain the automatic response and the conditions in which it occurs; do not invent a protective purpose for every behaviour.

Use "automatic processing" for this broad product concept. The description of an autonomic system emphasises operation without deliberate choice; it is not an anatomical claim that all these behaviours belong to the autonomic nervous system.

Use concrete, direct language. Avoid "attention", "protection", "flow", "moment", and similar poetic or therapeutic abstractions as the recurring vocabulary of the product. Name the situation, behaviour, immediate consequence, and relevant explanation instead. Precise scientific or implementation uses remain distinct from product copy.

## The Scan Result As The Product Bridge

The landing page introduces the problem and the Inner Caveman concept. The Scan lets the person recognise relevant behaviours in their own answers. The result must connect that recognition to an explanation of Neurocient's approach and the product available to them.

The result has two linked responsibilities: explain what the answers support about automatic behaviour, and explain how Neurocient addresses behaviour change through IKEA and reinforcement. Introduce Spot the Caveman and microchallenges through their actual purpose; describe Practice honestly as in development. Avoid classifying the person by a dominant drive or forcing a difficulty onto answers that do not support one.

The first result attempt follows landing page -> Scan -> public result establishing the presence or absence of the Inner Caveman -> Neurocient approach -> login -> product. It does not repeat the Scan's scenarios or name a recurring behaviour as the user's result. The product continuation uses the existing Spot the Caveman tool. Reading remains available through existing guest limits before login is requested. Practice is previewed as in development. See `../scan/RESULT_APPROACH.md` for the current contract.

## Market Positioning
The self-help and behavior-change app market is saturated. Practice should not compete by adding more advice, more content, more tracking, or more motivation.

The niche is:

1. **Exceptional UI/UX**
2. **Emotionally lightweight behavior change**

This means the experience itself is the differentiator. The user should feel the product understands cognitive load, timing, friction, shame, forgetting, and emotional energy.

The standard to hold:

- fewer decisions at once
- one clear next movement
- no heavy self-improvement pressure
- no noisy dashboard energy
- no content dump disguised as a flow
- no generic "tips" experience
- no unnecessary hand-holding
- every screen should feel calm, intentional, and easy to continue

Practice should feel:

- emotionally calm
- minimal
- non-judgmental
- reflective
- usable in short sessions
- grounded in behavior change, not productivity theater
- grounded in why the pattern makes sense before asking the user to change it

Practice uses the shared Neurocient design foundation documented in
`../DESIGN_SYSTEM.md`: product-wide font roles, brand colors, controls, focus
treatment, and navigation language. Its calmer, progressively disclosed composition
is a journey-specific mode of the same product, not a separate visual brand. Shared
foundations must not be used to force Practice into a dense portal or dashboard.

Practice should be treated as a design problem throughout. The experience must use product design, interaction design, behavior design, storytelling, and evidence of persistence to help the user live with the system long enough for it to work.

## What Practice Is Not
Practice is not:

- a generic tools page
- a productivity dashboard
- a habit tracker clone
- a content article with buttons
- a quiz that ends with advice
- a collection of unrelated challenges
- a list of features
- a procedural wizard that treats every user the same

## Current Implementation Status
The previous Practice MVP has been retired.

The old implementation used:

- `/practice/[slug]`
- `/practice/[slug]/result`
- `frontend/src/content/challenges/**`
- browser localStorage for practice results

That approach should not be extended. It was useful as an exploratory prototype, but the next Practice build should start fresh while reusing existing product infrastructure.

The current `/practice` route is the first rebuilt surface. It may begin with procrastination, but procrastination is only one Practice loop, not the product architecture.

Do not let the first procrastination implementation become a single-page monolith. Any production version should be modular enough to support many loops over time: procrastination, avoidance, overthinking, impulsive checking, emotional eating, inconsistency, distraction, people-pleasing, or future practices not yet named.

The route can host the first experience, but the architecture should separate:

- loop data
- screen components
- flow/routing logic
- response state
- reinforcement handoff
- existing auth/progress/WhatsApp integrations

This keeps Practice from becoming a hardcoded SPA where every new loop requires copying and editing a large page component.

## Existing Systems To Reuse
Do not duplicate mechanisms that already exist in the repo.

Existing primitives include:

- auth through `AuthContext`, `AuthModal`, and `/api/auth/**`
- membership/subscription gating through existing membership UI and usage limits
- user preferences through `/api/user/preferences`
- WhatsApp fields through `User.phone_number`, `User.whatsapp_opt_in`, and `UserPreferences.whatsapp_number`
- WhatsApp webhook/send utilities in `backend/app/Routes/whatsapp_routes.py`
- microchallenge assignment, logging, and progress through `/api/challenges/**`
- "Spot the Caveman" logging through spots APIs and WhatsApp `spot:` messages
- IKEA worksheet and tracker models through `IkeaWorksheet`, `IkeaTracker`, and `/ikea/**`
- nudges, push notifications, and reminder utilities through existing notification routes
- insight access, saved articles, and content gating through the current auth/content mechanisms

Practice should enhance and connect these systems rather than create a parallel auth, progress, reminder, or challenge stack.

## Access Model And Auth Gate
The first Practice session should be free and ungated.

The user should be able to try procrastination, recognize their loop, receive an alternate perspective, and leave with one small useful action without creating an account.

Authentication should appear only when the product moves from one-time insight into reinforcement:

- spaced repetition
- WhatsApp support
- saved progress
- adaptive follow-up
- progress evidence over time
- user details needed to personalize reminders

The auth ask should be framed as continuity, not access control.

Poor:

> "Sign up to save your progress."

Better:

> "Want this insight to come back when the loop returns?"

For the early product, Practice remains a web app with WhatsApp integration. WhatsApp is a reinforcement channel, not the primary app surface. The product should remain free for anyone to try while the business model and cash flow are still being validated.

When the user opts into reinforcement, Practice should hand off to existing authenticated systems for progress tracking, WhatsApp details, reminders, and persistence.

Initial implementation:

- anonymous users keep a pending Practice draft locally only when they ask for reinforcement
- login/signup converts that pending draft into an authenticated saved loop
- logged-in users save the selected loop directly
- the first saved object uses the existing IKEA worksheet backend through a Practice-facing adapter
- logged-in users can see the current saved practice details on the Practice surface
- user-facing screens should not mention worksheets, schemas, or account plumbing

## Emotional Design Principles
Practice should make users feel:

- lighter, not judged
- encouraged, not pushed
- understood, not diagnosed from above
- capable of one small move, not pressured into transformation

Practice is an emotional journey. Every screen should protect the user's willingness to continue.

Prefer:

- progressive disclosure
- one small decision per screen or moment
- concrete behavior language
- vivid action/lack-of-action moments instead of abstract labels
- story-driven scenes over conceptual explanation
- insights compressed into moments rather than lessons
- plain language
- spacious layouts
- muted colors
- single-question screens
- gentle validation
- concrete next steps

Avoid:

- urgency-heavy copy
- dense dashboards
- gamified pressure
- excessive metrics
- loud colors
- "fix yourself" framing
- asking the user to process multiple conceptual layers at once
- making the user feel categorized, diagnosed, or assigned a label too early
- instructional microcopy for obvious interactions
- treating the user as if they need every control explained
- turning a behavior loop into a generic learning module
- making progress feel like administrative completion

## Internal Concepts Versus User-Facing Copy
Many Practice concepts exist to help product, design, and engineering reason clearly. They are not automatically user-facing language.

Internal reference language includes:

- IKEA
- Identity
- Knowledge
- Environment
- Action
- Reinforcement
- behavioral design levers
- cognitive bias names
- free insight / gated reinforcement
- adaptive routing
- persistence, schema, and infrastructure language

Use these concepts in docs, code structure, data models, and team discussion. Do not expose them to users unless there is a deliberate copy/design decision to teach a concept.

User-facing copy should assume the user is intelligent and can infer obvious things from context. Do not explain what the interface already communicates.

Avoid user-facing phrases like:

- "Begin free session"
- "IKEA worksheet"
- "reinforcement loop"
- "Identity step"
- "Knowledge screen"
- "This is gated"
- "Create an account to save progress"
- "This is not a type. It is a scene."
- "The point is..."
- "A strategy that works deserves respect."
- "This gives us useful evidence."

Prefer copy that speaks to the lived moment:

- "Start"
- "Keep this for later"
- "Help me remember this"
- "What changed?"
- "What made this harder?"
- "What is the next visible move?"
- "Pick the one that feels closest to a recent day."
- "Think about the last few times."

Only educate users when education creates real value, reduces uncertainty, or protects consent. For example, explain WhatsApp reminders, account creation, payment, privacy, or why a particular question matters. Do not educate users about internal frameworks just because the framework exists.

## Conceptual Source
The originating whiteboard emphasized:

- emotionally lightweight experiences
- stabilizing self-understanding long enough for behavior to change
- action lists fail unless the environment supports the person
- storytelling and identity are part of action
- knowledge/inner awareness precedes behavior change
- reinforcement and spaced repetition matter because forgetting is real
- progress should be visually reframed
- moments of victory should be visible after real behavior, not manufactured inside the first session
- the opening should ask for actual behavior, not abstract self-labels
- users should identify what they have already tried and whether it helped
- the knowing-doing gap is central
- personalization may use predefined choices, user-added context, and later demographic/context detail
- reinforcement may happen through channels outside the web app, such as WhatsApp or other lightweight messaging
- future systems should decide what to repeat: Identity, Knowledge, Environment, or Action
- a comprehensive questionnaire may inform the path, but should not create the illusion that self-report alone fully controls the system

The updated product direction adds:

- storytelling as the base approach
- copy that is concrete, vivid, and visual rather than abstract or conceptual
- adaptive behavior over procedural steps
- ethical use of cognitive biases to drive useful behavior
- visible evidence of behavioral persistence
- progress framed as real-life evidence, not raw streak mechanics

## Product Loop
A mature Practice loop should become:

1. User enters with a behavior pattern.
2. Product helps them recognize the loop.
3. Product identifies the identity story and emotional logic.
4. Product reveals environment support/friction.
5. Product recommends one tiny matched action.
6. Product reinforces the insight over time.
7. Product captures post-action evidence when the user has tried, returned, or noticed the loop earlier.
8. User gradually sees behavioral persistence.

The mature loop should be adaptive rather than procedural. The system should decide whether the next useful intervention is a story reframe, knowledge prompt, environment adjustment, small action, reinforcement prompt, or post-action evidence capture.

## Architecture Guardrails
Practice is a product family of behavior loops, not a single procrastination page.

Architecture should therefore be:

- modular
- data-driven where useful
- small-component based
- easy to read
- easy to extend with new loops
- aligned with existing product primitives

Avoid:

- building Practice as one large client component
- treating procrastination as the only schema
- creating a standalone SPA inside the route
- duplicating existing auth, progress, microchallenge, WhatsApp, or IKEA systems
- adding route-specific logic that cannot be reused by the next loop

Prefer:

- reusable session shell components
- reusable choice, reflection, evidence, and handoff components
- loop definitions that hold content and behavioral design intent
- route containers that compose smaller modules
- a thin adapter from Practice responses into existing authenticated systems

The first flow can be pragmatic, but before adding the second loop or deeper persistence, split the implementation into reusable pieces.

## Product Design Alignment
Practice can have a calmer expression than the portal, but it must still feel like part of the current Neurocient product.

Align with:

- existing typography and layout sensibility
- current auth and modal patterns
- current user account expectations
- existing content tone where it is already warm, clear, and non-clinical
- current membership/progress systems

Do not create a visually disconnected app-within-the-app unless there is a deliberate design-system decision. Practice should feel more focused and emotionally lighter, not like a separate brand or experimental SPA.

## UX Bar
When working on Practice, evaluate every screen with these questions:

1. What is the one thing the user needs to understand or do here?
2. Can anything be delayed until the user has made the first small choice?
3. Does this screen reduce shame or quietly add pressure?
4. Is the copy concrete enough that the user can picture the moment?
5. Does the UI feel lighter than a typical self-help/productivity app?
6. Would a tired user still know what to do next?
7. Are we explaining an interaction that the UI can communicate by itself?
8. Is the moment concrete enough that the user can see it happening in real life?
9. Does this screen use behavior design ethically, or does it drift into pressure?
10. Does the user see evidence of progress that would matter outside the app?

## Behavioral Design
Practice should deliberately use cognitive biases as design material.

Examples:

- Present bias: make the first useful action feel immediately light.
- Loss aversion: show less life lost to autopilot without shaming the user.
- Identity and consistency bias: connect tiny actions to a better self-story.
- Availability bias: keep real progress evidence and recognized loops easy to remember.
- Commitment effect: ask for small promises the user can actually keep.
- Default effect: make the next useful move the easiest available path.
- Zeigarnik effect: make unfinished first steps visible enough to invite return.
- Peak-end rule: close sessions with recognition, relief, or a useful next move. Save victory language for real evidence.
- Fresh start effect: make returning after forgetting feel normal.
- Salience bias: make old loops vivid enough to notice earlier.

Biases should never be used to trap, shame, over-notify, or create dependency. They should help the user do what they already want to do.

## Trust The User
Practice should assume the user is intelligent and perceptive.

Avoid hand-holding when the interaction is visually obvious. For example:

- avoid "tap", "click here", "select one", or similar instruction text unless ambiguity is real
- prefer clear layout, contrast, and state changes over explanatory copy
- use words for meaning, not for narrating the interface
- remove microcopy if the screen still works without it
- every clickable element should show the hand cursor; disabled controls should clearly stop inviting action

## Choice Count Guidance
For emotionally reflective screens, avoid large visible option sets.

The working guideline:

- show **4 primary choices plus one honest escape hatch** when possible
- avoid showing 7-8 ungrouped choices unless the user explicitly asks to expand
- use progressive disclosure for secondary options

Reason:

- Hick's Law: more visible choices increase decision time.
- Choice overload: too many options can reduce follow-through and satisfaction.
- Reflective behavior-change screens already carry emotional load, so the UI should reduce decision load.

For the procrastination advice check-in, this means:

- show four advice options relevant to the selected procrastination moment
- show "None of these, honestly"
- keep other advice out of the first-pass screen unless a later "something else" path is added
- when the opening moment changes, clear answers that belonged to the previous moment

## Progress Model
Do not default to streaks as the primary progress model.

Better progress signals:

- "I caught the loop earlier."
- "I named the feeling."
- "I changed the environment."
- "I made the next action visible."
- "I started for three minutes."
- "I returned after forgetting."
- "I saw the same loop before it became the whole evening."
- "I changed one cue outside my head."
- "I did not finish everything, but I interrupted autopilot."

Streaks may exist later, but they should not become the emotional center of the product.

Progress should be reframed visually as evidence. A useful progress surface should show actual behavioral persistence: caught earlier, returned sooner, reduced friction, made the next move visible, completed a tiny action, or recovered after forgetting.

## Mobile Future
Since this may become a mobile-native app:

- keep challenge content structured
- avoid hardcoding challenge-specific UI where shared components can work
- keep sessions short and screen-based
- design for repeated return, not one long page
- think in flows, not pages
- keep persistence boundaries explicit
- design for lightweight reinforcement channels, including possible WhatsApp-style prompts or bots
