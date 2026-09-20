# Practice Detailing

## Purpose
This document turns the Practice pivot into a working product blueprint.

It is not a final specification. It is the bridge between product direction and later work on design, IA, architecture, challenge content, and code.

Practice should become an adaptive emotional behavior-change system. Procrastination is the first proof case, not the whole product.

## Product Thesis
Practice helps users get more life from life by losing less time, energy, and possibility to autopilot.

The product does this by helping the user:

1. recognize a real behavior loop
2. see the self-story it creates
3. understand why the behavior makes emotional sense
4. notice what in the environment keeps the loop easy
5. take one small matched action
6. retrieve the insight over time
7. see evidence that persistence is forming

The product is not selling productivity. It is selling recovered agency.

## Experience Shape
The experience should feel like a guided emotional journey, not a procedural form.

The surface should be:

- calm
- concrete
- adaptive
- story-led
- low-friction
- visually restrained
- emotionally safe
- evidence-oriented

The user should feel that the system understands the lived moment before it offers a framework.

## Procrastination Starting Point
Procrastination should open through concrete behavior recognition.

Use scenes such as:

- "I wait until the deadline is close."
- "I switch to something easier even though the real task is still there."
- "I delay the decision, then the decision becomes the task."
- "I keep the document closed because opening it makes the task real."
- "I clean, check, arrange, or plan instead of starting."

The first question is not "Why do you procrastinate?"

The first job is recognition:

> "Which of these moments have you lived recently?"

This should feel like being seen, not diagnosed.

## Core User Journey
The preferred first-pass journey:

1. **Recognition**
   The user selects one or more lived procrastination moments.

2. **Advice Audit**
   The user marks what they have already tried.

3. **Effect Check**
   The user says whether those attempts helped, helped briefly, or did not really hold.

4. **Another Angle / Knowledge**
   The product reframes procrastination as a loop that may be protecting short-term relief, not proof of laziness.

5. **Identity**
   The product names the self-story the loop can create and offers an identity the user can practice instead.

6. **Environment**
   The product identifies friction, cues, defaults, and setup conditions that keep the loop easy.

7. **Matched Action**
   The product gives one tiny action that fits the selected pattern and environment.

8. **Reinforcement Hook**
    The system schedules or suggests a future retrieval prompt.

9. **Post-Action Evidence**
   Later, after the user has actually tried the action or returned to the loop, the product can capture what changed.

This order can adapt, but action should not become the default opening move.

## Information Architecture
Practice should eventually have these surfaces:

- **Practice Home**
  A quiet entry point organized around behavior loops, not generic challenges.

- **Loop Entry**
  A specific behavior path, starting with procrastination.

- **Session**
  A short, screen-based journey through recognition, insight, environment, action, and optional remembering.

- **Progress Evidence**
  A visual history of real behavioral persistence.

- **Reinforcement**
  Lightweight return prompts through in-app, email, WhatsApp-style channels, or future mobile notification surfaces.

- **Personal Map**
  A structured memory of the user's patterns, self-stories, environment frictions, matched actions, and victories.

For the rebuild, the current web surface starts again from `/practice`.

The old `/practice/[slug]`, `/practice/[slug]/result`, and `frontend/src/content/challenges/**` MVP implementation has been retired. Future routes should be introduced intentionally after the flow and data handoffs are clear.

Future architecture should avoid making pages the whole product model. Routes should be containers for a deeper adaptive system connected to existing auth, preferences, WhatsApp, microchallenge, and IKEA worksheet infrastructure.

## Modular Architecture Direction
Practice should not be implemented as a single-page app hidden inside `/practice`.

The route may be interactive, but the code should remain modular and legible. Before the product grows beyond the first procrastination loop, split the implementation into clear parts:

- `PracticeHome` or route-level entry container
- `PracticeSessionShell` for the common session frame
- reusable screen components for recognition, advice audit, effect check, identity, knowledge, environment, action, reinforcement, and post-action check-ins
- reusable choice/card controls aligned with current product UI
- loop definitions that hold content, scenes, prompts, actions, and behavioral design levers
- a small flow controller or reducer that decides the next step
- adapters that hand off authenticated state to existing IKEA, microchallenge, user preferences, WhatsApp, and progress systems

The component boundary should follow product meaning, not just visual layout. A future loop should be able to reuse most of the session structure while changing the loop definition and selected branch logic.

Procrastination-specific content should live in a procrastination loop definition or similar module. It should not be scattered through route-level UI code.

## Multi-Loop Product Model
Every Practice decision should assume more loops will follow.

Procrastination is the first loop because it is vivid, common, and well suited to the IKEA journey. It should establish the architecture pattern for later loops, but not hardcode the product around procrastination.

Future loops may include:

- avoidance
- overthinking
- impulsive checking
- distraction
- inconsistency
- people-pleasing
- emotional eating
- sleep revenge/procrastination
- conflict avoidance

Shared concepts across loops:

- lived behavior scenes
- identity story
- knowledge pattern
- environment friction
- matched action
- post-action evidence
- reinforcement prompt
- cognitive bias/design lever

Loop-specific concepts belong in data/configuration first. Shared interaction patterns belong in components. Cross-loop persistence and progress should use existing backend systems where possible.

## Adaptive Model
Practice should move from fixed flow to adaptive routing.

The system should decide the next useful step from observed inputs:

- recognized behavior
- advice already tried
- whether advice helped
- selected or inferred self-story
- discovered emotional logic
- environment friction
- action size
- reinforcement response
- post-action evidence
- return behavior

Example routing:

- If prior advice worked, close respectfully and offer optional reinforcement.
- If prior advice helped briefly, route to environment and reinforcement.
- If advice did not help, route to knowledge before action.
- If the user selects shame-heavy self-story, route to identity reframe before action.
- If the user knows what to do but does not start, route to environment.
- If the user starts but does not persist, route to reinforcement and smaller action.
- If the user returns after forgetting, treat return itself as progress.

The system should feel adaptive without showing the user a complex diagnostic machine.

## Cognitive Bias Design Map
Cognitive biases should be used intentionally and ethically.

| Bias or Lever | Product Use | Guardrail |
| --- | --- | --- |
| Present bias | Make the first move tiny and immediately doable. | Do not overpromise instant transformation. |
| Loss aversion | Show less life lost to autopilot. | Do not create panic or shame. |
| Identity consistency | Connect small action to a healthier self-story. | Do not force aspirational identity slogans. |
| Availability bias | Keep recent wins and patterns visible. | Do not exaggerate progress. |
| Commitment effect | Ask for small promises the user can keep today. | Do not ask for public or high-pressure commitment too early. |
| Default effect | Make the next useful step the easiest path. | Preserve user choice and exit. |
| Zeigarnik effect | Leave a visible first step that invites return. | Do not create artificial anxiety. |
| Peak-end rule | End with recognition, relief, or a useful next move. | Do not manufacture false celebration. |
| Fresh start effect | Give graceful re-entry after forgetting. | Do not imply the user has failed before returning. |
| Salience bias | Make the old loop vivid enough to notice earlier. | Do not turn vivid copy into accusation. |

Every major interaction should be explainable through a behavior design purpose and an ethical guardrail.

## Progress Evidence
Progress should be measured as persistence, not only completion.

Progress evidence should not be manufactured inside the first session. Capture it after the user has tried the matched action, returns through reinforcement, or reports a real-world change.

Good evidence types:

- caught the loop earlier
- named the feeling
- changed one environmental cue
- made the next action visible
- started for three minutes
- returned after forgetting
- reduced task ambiguity
- resisted switching to the easier activity once
- completed one ugly first pass

Visual progress should show real-life evidence:

- "You caught the loop twice this week."
- "You returned after forgetting."
- "Your first move is getting clearer."
- "You changed the setup before asking for willpower."

Avoid making streaks the emotional center. Streaks can be secondary if they ever appear.

## Content Model Direction
The content system should evolve from static challenge copy to structured behavior-change data that can connect to existing systems.

Likely future entities:

```ts
type PracticeLoop = {
  slug: string;
  title: string;
  existingMicrochallengeId?: string;
  ikeaWorksheetTemplateId?: string;
  promise: string;
  behaviorScenes: BehaviorScene[];
  adviceAudit: AdviceOption[];
  identityStories: IdentityStory[];
  knowledgePatterns: KnowledgePattern[];
  environmentFrictions: EnvironmentFriction[];
  actions: PracticeAction[];
  reinforcementPrompts: ReinforcementPrompt[];
  evidencePrompts: EvidencePrompt[];
  behaviorDesignLevers: BehavioralDesignLever[];
};

type BehaviorScene = {
  id: string;
  copy: string;
  visualCue?: string;
  linkedStories: string[];
  linkedPatterns: string[];
};

type EvidencePrompt = {
  id: string;
  title: string;
  evidence: string;
  persistenceSignal:
    | "caught_earlier"
    | "named_feeling"
    | "changed_environment"
    | "made_action_visible"
    | "started_small"
    | "returned_after_forgetting";
};
```

This is direction, not an immediate migration requirement.

## Existing Infrastructure Integration
Practice should enhance current systems rather than duplicate them.

Known reusable pieces:

- `AuthContext`, `AuthModal`, and `/api/auth/**` for account creation and login
- user preferences and WhatsApp channel details through `/api/user/preferences`
- `User.phone_number`, `User.whatsapp_opt_in`, and `UserPreferences.whatsapp_number`
- WhatsApp send/webhook utilities in the backend
- microchallenge assignment, daily logging, and progress through `/api/challenges/**`
- `IkeaWorksheet` and `IkeaTracker` for IKEA saved maps and daily tracking
- spots, nudges, push notifications, weekly reflections, saved articles, and insight access mechanisms

Open integration question:

- Should the authenticated reinforcement object be a richer `IkeaWorksheet`, a specialized microchallenge assignment, or a new thin Practice table that references both?

Default bias:

- reuse and extend `IkeaWorksheet` for the user's loop map
- reuse microchallenge logging/progress where the reinforcement action is a repeated behavior experiment
- reuse preferences/WhatsApp fields for reinforcement delivery
- avoid a second progress engine unless the existing models block the product experience

## Initial Persistence Contract
The first implementation uses a thin Practice adapter over the existing IKEA worksheet endpoint.

Anonymous flow:

1. The user completes the free recognition, knowledge, identity, environment, and action path.
2. Nothing is persisted to the backend during the ungated journey.
3. When the user asks to remember the loop, the current Practice draft is written to browser local storage.
4. The auth modal opens.
5. After login or signup succeeds, the pending draft is posted through a Practice-facing API route.
6. The local draft is cleared only after the authenticated save succeeds.

Authenticated flow:

1. The user completes the same first-session path.
2. When they ask to remember the loop, the Practice draft is posted immediately.
3. The UI shows only a simple keeping/kept/error state.
4. The current saved practice becomes visible on the Practice surface as a return map.

Saved draft contents:

- loop slug
- selected behavior scene
- advice tried
- effect check response
- identity story and reframe
- knowledge / alternate perspective
- environment prompt
- matched action
- reinforcement prompt

Backend mapping:

- `struggle`: selected behavior scene
- `identity`: practiced identity / reframe
- `knowledge`: selected alternate perspective
- `environment`: JSON carrying Practice metadata, environment prompt, reminder, advice, and effect
- `tiny_action`: matched action

This is not the final Practice data model. It is the minimum useful persistence bridge until a dedicated Practice table, richer reinforcement schedule, or WhatsApp bot flow is justified.

Return surface:

- Logged-in users should see their current saved practice on `/practice`.
- The return view should show the meaningful behavior map: moment, old story, practiced identity, why it made sense, setup, next move, and future prompt.
- Do not make users go looking for an "IKEA worksheet" unless the framework is intentionally being taught.
- The saved worksheet helps only as infrastructure: it powers retrieval, tracking, reflection, and future reinforcement. The user-facing object is the current practice.

## Personalization
Personalization should begin lightweight and become deeper over time.

Near-term personalization:

- selected behavior scenes
- advice tried
- effect of advice
- selected identity story
- selected environment friction
- selected action
- post-action evidence, when it exists

Later personalization:

- demographic/context details
- work/study/life context
- preferred reinforcement channel
- time-of-day vulnerability
- repeated failure points
- action size tolerance
- response to different bias levers

Personalization should not overload the user with intake. A comprehensive questionnaire may exist later, but the first product should earn trust through small, accurate recognition.

## Reinforcement System
Reinforcement should retrieve the user's own insight.

Poor:

> "Do your procrastination practice."

Better:

> "Yesterday you noticed the task gets heavier when the next move is vague. Is the next move visible right now?"

Reinforcement should eventually support:

- spaced repetition
- adaptive prompts
- quick quiz/check-ins
- in-app return cards
- WhatsApp-style bot prompts
- email or mobile notification paths

The reinforcement algorithm should decide what the user needs to retrieve:

- Identity: when shame or self-attack returns
- Knowledge: when the reason is unclear
- Environment: when knowing does not become doing
- Action: when the next move is too large
- Evidence: when a small persistence signal appears after action or return

## UX Principles For Screens
Each screen should have one job.

Use:

- one primary question
- short concrete copy
- 4 primary choices plus one escape hatch when possible
- visible selected states
- calm transitions
- meaningful progress indication
- restrained visual hierarchy

Avoid:

- dense dashboards
- feature explanations
- abstract labels as first contact
- long teaching screens
- productivity aesthetics
- heavy gamification
- moral language
- interface instructions for obvious controls

## Visual Direction
The visual language should feel quieter than the main Neurocient portal, but still aligned with the current product.

Useful qualities:

- off-white or soft neutral backgrounds
- charcoal text
- muted accent colors
- generous spacing
- hairline dividers
- compact cards only when they represent selectable repeated items
- progress shown as evidence markers, not flashy badges
- strong typography, but not oversized marketing composition

The product should feel premium because it is precise, not because it is decorative.

Practice should not look like a separate experimental app unless that is an explicit design decision. Use the existing product's typography, auth surfaces, spacing discipline, and interaction expectations as the base, then make the Practice surface calmer and more focused.

## MVP Detailing For Procrastination
The next meaningful product iteration should focus on the procrastination path while preserving the multi-loop architecture.

Recommended MVP target:

1. Rewrite opening behavior scenes to be more concrete and visual.
2. Keep the advice audit but make it feel like evidence gathering.
3. Add a clearer knowing-doing transition when advice did not hold.
4. Make alternate perspective, Identity, Environment, and Action feel like story moments rather than framework screens.
5. End the first session with the matched action and reinforcement handoff; do not ask for victory before real-world action.
6. Store enough local evidence to show progress on the result page or next Practice surface.
7. Keep persistence local only for pre-auth trial state; after auth, hand off to existing systems intentionally.
8. Refactor any first-pass single-file implementation before adding another loop, backend persistence, or WhatsApp reinforcement.

Do not add many new features before the first emotional journey feels right.

## Open Questions
These should be resolved before larger implementation:

1. What is the exact first-session length target: 3 minutes, 5 minutes, or 7 minutes?
2. Should the first procrastination flow allow multiple behavior scenes or force one strongest scene?
3. What is the first visible progress evidence surface: result page, Practice home, or a small return card?
4. Should reinforcement be simulated in web first before building a WhatsApp-style path?
5. How much personalization should be explicit user choice versus inferred from behavior?
6. What is the first post-action evidence prompt we want every user to be able to answer?
7. Which existing backend model should own the saved Practice loop after auth?
8. Should the current `IkeaWorksheet` naming be preserved internally or wrapped behind a Practice-facing API?

## Next Work Sequence
The recommended next sequence:

1. Define the procrastination first-session script screen by screen.
2. Define the data model changes needed for behavior scenes and post-action evidence.
3. Design the IA for Practice Home, Session, Result, and Progress Evidence.
4. Choose whether the first saved loop maps to `IkeaWorksheet`, microchallenge assignment, or a thin new Practice record.
5. Implement the new `/practice` flow as modular components and loop data, not as one large SPA component.
6. Wire auth only at the reinforcement handoff.
7. Run `npm.cmd run build`.

The product should stay content-led until the emotional arc is strong enough to justify architecture changes.
