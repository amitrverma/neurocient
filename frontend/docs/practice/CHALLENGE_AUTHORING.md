# Challenge Authoring

## Current Content Location
The previous local Practice challenge content has been retired.

Do not add new Practice content back into `frontend/src/content/challenges/**` unless that architecture is intentionally revived. The next Practice build should define a fresh content model that can connect to existing auth, progress, WhatsApp, microchallenge, and IKEA worksheet systems.

## Authoring Principle
Each challenge should express IKEA + Reinforcement + Behavioral Design:

- Identity
- Knowledge
- Environment
- Action
- Reinforcement
- ethical use of cognitive biases and behavior design

The old schema was an MVP and should not be treated as the target architecture. When building the next Practice system, evolve toward structured behavior-loop data rather than adding isolated fields for one challenge.

Challenge authoring should start with lived scenes, not concepts. The user should recognize an actual behavior before they are asked to accept an explanation or try an action.

## Retired MVP Schema
The retired procrastination MVP intentionally mirrored the original attached HTML flow rather than the full IKEA model:

```ts
type Challenge = {
  slug: string;
  title: string;
  excerpt: string;
  definition: {
    title: string;
    quote: string;
    variations: ChallengePattern[];
  };
  standardAdvice: ChallengeOption[];
  triedOptions: ChallengeOption[];
  effectOptions: ChallengeOption[];
  checkInMessages: {
    skipped: string;
    empty: string;
    noneTried: string;
    worked: string;
    briefly: string;
    default: string;
  };
  reasons: ChallengeReason[];
  directions: ChallengeDirection[];
};

type ChallengePattern = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  perspective: {
    headline: string;
    body: string;
    pivot: string;
    reframe: string;
    next: string;
  };
  knowledge: {
    headline: string;
    body: string;
    mechanisms: Array<{
      title: string;
      description: string;
    }>;
    close: string;
  };
  environment: {
    headline: string;
    body: string;
    shifts: Array<{
      title: string;
      description: string;
    }>;
    close: string;
  };
  identity: {
    headline: string;
    body: string;
    oldStory: string;
    reframe: string;
    close: string;
  };
  action: {
    headline: string;
    body: string;
    move: string;
    environment: string;
    close: string;
  };
  adviceIds: string[];
  reasonIds: string[];
};
```

The retired flow was:

1. Which one feels most like you?
2. What have you usually tried to get moving?
3. What happened?
4. If it worked, close gently. If it did not hold, segue into the Neurocient approach.
5. Offer an alternate perspective on why the selected procrastination pattern happens.
6. Offer a knowledge screen about the brain mechanics behind the selected pattern.
7. Explain why environment matters for that selected pattern.
8. Reflect the self-story the selected pattern can create, without diagnosing the user.
9. Briefly summarize IKEA as a lightweight worksheet using the user's selected pattern.
10. Circle back to one small matched action.
11. Explain why reinforcement matters and offer opt-in support through signup/login.

The next system may reuse the idea of meaningful opening behavior choices, but should not reuse the old localStorage-only flow as-is.

Future iterations should preserve the whiteboard sequence:

1. List actual behavior.
2. Let people identify themselves with those behaviors.
3. Ask what they have already tried.
4. Ask whether it helped.
5. Offer an alternate perspective on why the behavior happens.
6. Redefine identity without shame.
7. Design the environment.
8. Try a small action that may resemble common advice but is now matched to the discovered pattern.

This sequence exists because procrastination is often a knowing-doing gap, not a knowledge gap.

## Future Schema Direction
The broader product direction remains IKEA + Reinforcement + Behavioral Design. The next schema should connect to existing product systems instead of standing alone:

```ts
type IdentityStory = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  reframe: string;
};

type KnowledgePattern = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  actionId: string;
};

type EnvironmentFriction = {
  id: string;
  title: string;
  subtitle?: string;
  description?: string;
  adjustment: string;
};

type PracticeAction = {
  id: string;
  title: string;
  description: string;
  action: string;
};

type ReinforcementPrompt = {
  id: string;
  title: string;
  prompt: string;
  cadence: string;
};

type BehavioralDesignLever = {
  id: string;
  bias:
    | "present_bias"
    | "loss_aversion"
    | "identity_consistency"
    | "availability"
    | "commitment"
    | "default_effect"
    | "zeigarnik"
    | "peak_end"
    | "fresh_start"
    | "salience";
  use: string;
  ethicalGuardrail: string;
};
```

The exact schema should be decided during implementation. The important constraint is that reinforcement and progress after auth should use or extend existing backend infrastructure where practical.

## Flow Requirements
The original procrastination MVP should:

1. Preserve the emotional and content sequence of the attached HTML.
2. Merge adjacent steps when it makes the interaction feel more seamless without changing the meaning.
3. Avoid over-explaining the full IKEA framework too early.
4. Feel like a calm flow, not a productivity dashboard.
5. Keep the ending light: if the user's existing approach is working, do not upsell; if it is not working, offer an alternate perspective rather than a heavy prescription.

A future fully developed IKEA challenge should generally:

1. Begin with recognition, not advice.
2. Surface identity story or self-label.
3. Help the user discover why the behavior makes sense.
4. Ask what in the environment supports the old loop.
5. Recommend one concrete action.
6. Create a reinforcement hook.
7. Capture a moment of victory.

Future adaptive challenges should not assume every user needs the same next step. Depending on the user's responses, the system may return to Identity, Knowledge, Environment, Action, or Reinforcement.

## Tone
Use language that is:

- warm
- direct
- non-clinical
- emotionally light
- precise without being academic
- concrete, vivid, and visual
- story-driven

Prefer:

- "The document is open, but you keep cleaning the table beside it."
- "The task sits in your head all day and gets heavier each time you pass it."
- "You write the project name again, but not the first physical move."

Avoid:

- "hack"
- "crush"
- "optimize your life"
- shame-based productivity language
- overpromising transformation
- abstract labels before the user has recognized a concrete moment
- conceptual explanation where a scene would work better

## Procrastination Challenge Notes
Procrastination should not be framed as laziness.

Likely roots include:

- fear of failure
- fear of success
- perfectionism
- overwhelm
- low immediate reward
- unclear next action
- emotional avoidance
- decision fatigue

Matched practices include:

- ugly first pass
- define done
- next visible action
- three-minute start
- name the feeling
- pre-decide the start

Future iterations should add explicit Identity and Environment steps before final Action.

Procrastination should be framed as life lost to autopilot without turning that loss into shame. The user should feel: "This explains why I keep doing this, and there is a small place to begin."

## Reinforcement Authoring
Every challenge should include reinforcement prompts that retrieve the user's own insight.

Poor:

> "Do your procrastination challenge."

Better:

> "You noticed that unclear next actions make delay easier. What is the next visible action right now?"

Reinforcement should feel like returning to self-understanding, not receiving a generic reminder.

Reinforcement should eventually support spaced repetition and adaptive routing. A quick check-in can decide whether to repeat Identity, Knowledge, Environment, or Action.

Example routing logic:

- If the user reports shame or self-attack, return to Identity.
- If the user reports confusion about why they avoided the task, return to Knowledge.
- If the user reports they knew what to do but did not start, return to Environment.
- If the user reports the setup was ready but action still felt too large, return to a smaller Action.
- If the user reports a small win, capture a Moment of Victory.

## Moments Of Victory
Challenges should define visible evidence of progress.

Good victory moments include:

- caught the loop earlier
- named the feeling before escaping
- made the next action visible
- changed one environmental cue
- started for three minutes
- returned after forgetting

Avoid treating completion as the only victory. Persistence is the behavior to measure.
