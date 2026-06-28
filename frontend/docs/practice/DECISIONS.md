# Practice Decisions

## 2026-06-28: Use IKEA Instead Of IDEA
Practice should use **IKEA** as the internal behavior-change framework: Identity, Knowledge, Environment, Action.

Reason:

- The framework is not being opened to the world as a public branded methodology right now.
- The existing backend already uses `IkeaWorksheet` and `IkeaTracker`.
- "Knowledge" fits the product's internal model better than "Discovery" because the system is helping the user form and retrieve usable understanding, not just discover something once.
- Keeping the naming aligned avoids building a second conceptual layer beside the existing IKEA infrastructure.

Implication:

- Use IKEA in docs, implementation names, and internal product references.
- Use Knowledge for the second framework step.
- User-facing copy can still say things like "understand what is happening" or "see why the loop makes sense"; it does not need to expose the acronym.
- Do not reintroduce IDEA/Discovery as the framework language unless there is a deliberate product decision to make the framework public later.

## 2026-06-28: Retire Local Practice MVP And Reuse Existing Systems
The previous Practice MVP has been removed as an implementation target.

Reason:

- It was a standalone localStorage flow with challenge content in `frontend/src/content/challenges/**`.
- The repo already has auth, subscription/membership, user progress, microchallenges, Spot the Caveman, insight access, user preferences, WhatsApp utilities, nudges, and an IKEA worksheet/tracker.
- Rebuilding Practice as a parallel stack would duplicate product mechanisms that already exist.
- The next Practice system needs to be adaptive and connected to authenticated reinforcement after the free first session.

Implication:

- Do not extend the retired `frontend/src/content/challenges/**` model.
- Do not add a second auth, progress, reminder, or reinforcement system for Practice.
- The rebuilt `/practice` flow should start fresh at the UI/content layer.
- After auth, Practice should reuse or extend existing backend systems such as user preferences, WhatsApp support, microchallenge assignment/logging, and `IkeaWorksheet`/`IkeaTracker`.
- Any new Practice-specific data model should be thin and justified by gaps in the existing models.

## 2026-06-28: Free Insight, Gated Reinforcement
The first Practice session should be free and ungated. Authentication should appear only when the user chooses reinforcement support.

Reason:

- The product must earn trust before asking for an account.
- The first session should give real value: recognition, perspective, and one small action.
- Spaced repetition, WhatsApp support, saved progress, adaptive follow-up, and progress tracking require identity and contact details.
- The conversion moment should feel like continuity: "help me remember this," not "sign up to use the app."
- The early product should remain a web app with WhatsApp integration until there is enough cash flow to justify broader platform investment.

Implication:

- Do not gate the initial procrastination journey behind auth.
- Place the auth ask after the user has completed the first insight/action flow and is entering reinforcement.
- Keep WhatsApp positioned as a reinforcement channel, not as the whole product.
- Ask for only the minimum user details needed to support reminders, consent, and progress tracking.
- User-facing copy should frame account creation around remembering, reinforcement, and evidence of progress over time.

## 2026-06-28: Practice Pivots To Adaptive Emotional Journey
Practice should be treated as an adaptive emotional behavior-change system, not a procedural challenge flow.

Reason:

- The product promise is "Get more life from life": a fuller life where less is lost to autopilot.
- Procrastination is not just task delay; it is a repeated lived moment where agency, attention, and possibility leak away.
- The user clarified that storytelling is the base approach, copy should be concrete and vivid, and the system should be adaptive rather than procedural.
- The system must help users live with it long enough for change to work, which requires repeated felt usefulness, not more content.

Implication:

- Future Practice work should frame flows as emotional journeys, not lists of features or generic advice paths.
- The user should recognize actual behavior before seeing explanations or actions.
- Insights should be compressed into moments rather than lessons.
- Progress should be shown as evidence of behavioral persistence: caught earlier, returned sooner, changed the environment, made the next action visible, or interrupted autopilot.
- Mature Practice architecture should route users adaptively across Identity, Knowledge, Environment, Action, Reinforcement, and Moment of Victory.

## 2026-06-28: Cognitive Biases Are A Core Behavior Design Material
Practice should heavily use cognitive biases to drive useful behavior, with explicit ethical guardrails.

Reason:

- Behavior change depends on attention, memory, friction, salience, emotion, reward, defaults, and identity, not only rational instruction.
- Cognitive biases can help users keep promises they already want to keep.
- The product should work with the brain's shortcuts instead of pretending users behave like rational planners.

Implication:

- Future designs may use present bias, loss aversion, identity and consistency bias, availability bias, commitment effects, default effects, the Zeigarnik effect, the peak-end rule, fresh start effects, and salience bias.
- These levers must reduce friction, increase clarity, make progress visible, and support emotionally safe persistence.
- Do not use cognitive biases as dark patterns, shame pressure, over-notification, or hidden manipulation.
- Challenge content and future schemas should be able to document which behavioral design lever is being used and why.

## 2026-06-28: Procrastination Starts From Lived Behavior And The Knowing-Doing Gap
The procrastination experience should start from concrete behaviors, then ask what the user has already tried and whether it helped.

Reason:

- The user notes identify procrastination through actual behaviors such as waiting until a deadline, switching to easier activity, and delaying decision-making.
- Common advice is often already known; the real problem is the knowing-doing gap.
- Asking whether prior advice helped lets the product respect working strategies and only introduce a different path when needed.

Implication:

- Do not open procrastination with abstract labels or immediate action.
- Use story-like behavior recognition before explanation.
- Keep the advice audit, but treat it as evidence about what has or has not held.
- If action advice returns later, it should feel newly matched to the user's identity, knowledge, and environment rather than recycled productivity advice.

## 2026-06-02: Reinforcement Support Comes After Action
The flow now adds a final reinforcement screen after the matched action.

Reason:

- Even a well-matched action can fade without retrieval, reminders, and repeated return.
- Support should be offered only after the user has received value from the flow.
- The signup/login prompt should be opt-in and framed as support, not a hard sell.

Implication:

- The final screen explains that forgetting is normal and old loops are easy to return to.
- "Yes, support me" opens the existing authentication modal.
- "Not now" finishes the flow without pressure.

## 2026-06-02: Action Returns After IKEA
The flow now circles back to one small matched action after the brief IKEA summary.

Reason:

- Action should come after the user has seen the pattern, brain logic, environment, and self-story.
- The action should not be generic advice; it should fit the selected pattern and what the user just learned.
- Ending with one concrete move keeps the experience useful without becoming a productivity prescription.

Implication:

- Each `ChallengePattern` can define an `action` object with a headline, body, tiny move, environment support, and close.
- The final action screen must render only the selected pattern's matched action.
- Keep actions tiny, visible, emotionally light, and possible today.

## 2026-06-02: Identity And IKEA Are Introduced Lightly
The flow now adds a selected-pattern identity screen followed by a brief IKEA summary.

Reason:

- Identity should help the user notice the story a loop can create without feeling labeled or diagnosed.
- The IKEA framework should appear as a simple working shape, not as a lecture or heavy terminology dump.
- This preserves the product spine while keeping the experience emotionally light.

Implication:

- Each `ChallengePattern` can define an `identity` object with the old story, gentler reframe, and close.
- The identity screen should avoid preachy language and moralizing.
- The IKEA screen should stay quick and worksheet-like: Identity, Knowledge, Environment, and Action should be shown as an applied map of the selected pattern.

## 2026-06-02: Environment Screen Follows Knowledge
The flow now adds a selected-pattern environment screen after the brain-mechanics knowledge screen.

Reason:

- Once the user understands why the loop makes sense, the next useful move is to see how context keeps the loop easy.
- Environment should not appear as generic advice; it should show the specific cues, friction, defaults, and setup problems that support the selected pattern.
- This keeps the flow aligned with IKEA without naming the framework heavily in the UI.

Implication:

- Each `ChallengePattern` can define an `environment` object with a headline, body, three focused shifts, and a close.
- The environment screen must render only the selected pattern's explanation.
- Keep environment copy practical and emotionally light: one small outside-the-head adjustment should feel more useful than more willpower.

## 2026-06-02: Knowledge Screen Is Pattern-Specific
The screen after the alternate perspective now explains the brain mechanics behind the selected procrastination pattern.

Reason:

- The user's first recognition should keep shaping the flow after the advice audit.
- A blanket list of causes would feel generic and cognitively heavier.
- Knowledge should make the selected loop feel understandable, using plain brain-and-behavior language such as instant gratification, fear, uncertainty, pressure, and relief.

Implication:

- Each `ChallengePattern` can define a `knowledge` object with a headline, body, three focused mechanisms, and a close.
- The knowledge screen must render only the selected pattern's explanation.
- Keep the language concrete and non-clinical; avoid turning the screen into a taxonomy of all possible causes.

## 2026-06-02: Worked-Well Path Closes Without Selling
When the user says a strategy "Actually worked well," the flow now congratulates them and closes gently instead of routing them into the solution segue.

Reason:

- If the user's existing approach is working, the product should respect that.
- Hard selling would undermine the emotional safety and trust of the Practice surface.
- The Neurocient approach should appear when the user says common advice did not hold, not when they are already helped.

Implication:

- The post-effect screen is conditional.
- "Actually worked well" gets a short positive close and a Finish action.
- "Worked briefly, then did not" and "Not really" move into the approach segue.
- The approach segue should remain sympathetic and lightweight: explain that common advice focuses on what to do while real procrastination often happens before action, without using heavy framework labels like identity or environment.

## 2026-06-02: Alternate Perspective Replaces Direction Picker
The post-segue screen now explains an alternate perspective on procrastination instead of asking the user to pick a direction.

Reason:

- After the user accepts the "look underneath" invitation, the next screen should deliver that perspective directly.
- A direction picker adds decision load at the moment where the product should provide clarity.
- The explanation should stay emotionally light: procrastination can be short-term relief, not laziness or a knowledge gap.

Implication:

- For "Worked briefly, then did not" and "Not really," the flow moves from the segue into the alternate perspective screen.
- For "None of these, honestly," the flow skips the segue and moves directly to the alternate perspective.
- The alternate perspective must be based on the user's selected opening pattern, not a blanket list of possible causes.
- The alternate perspective should use plain language and varied typography, and avoid heavy framework terms.

## 2026-06-02: Effect Check-In Is A Full Step
The "What happened?" effectiveness question now appears as its own screen instead of a modal.

Reason:

- The modal interrupted the calm screen-by-screen rhythm of the Practice flow.
- The check-in is a reflective moment, not a secondary confirmation.
- Keeping it as a full step preserves the one-question-at-a-time experience.

Implication:

- After the user marks advice they have tried, show "What happened?" as the next screen when an effectiveness answer is needed.
- Keep the screen visually clean, with no explanatory eyebrow.
- Users who choose "None of these, honestly" can still skip the effectiveness step and move directly to the reasons.

## 2026-05-31: Opening Pattern Choice Can Branch The Flow
The first procrastination screen now treats the visible variants as selectable behavior patterns, not passive examples.

Reason:

- The user's first recognition should shape what comes next.
- Different procrastination loops invite different common advice, so the "what have you usually tried" screen should not be identical for every user.
- This keeps the flow personal without adding a heavy diagnostic layer.

Implication:

- Challenge definitions can attach `adviceIds` to each opening pattern.
- Challenge definitions can attach `reasonIds` to each opening pattern so the reasons screen does not fall back to a generic list.
- The first branch should remain lightweight: recognize the closest pattern, then audit advice relevant to that pattern.
- Avoid turning the opening choice into a formal label or personality type.

## 2026-05-31: Slug Route Is The Canonical Session Entry
Superseded by 2026-06-28: "Retire Local Practice MVP And Reuse Existing Systems."

`/practice/[slug]` is now the canonical entry point for a practice flow.

Reason:

- The intro page was replaced by the session content.
- Keeping `/practice/[slug]/session` visible made retake links feel like a duplicate route.
- The user should see one stable route for entering or retaking a practice.

Implication:

- Retake and begin links should point to `/practice/[slug]`.
- `ChallengeSession.tsx` can remain an internal shared component, but `/practice/[slug]/session` should not be treated as a user-facing route.

## 2026-05-31: Practice Is Framed As Personal Growth Through Mismatch
Practice should be framed as a personal growth system rather than a catalogue of challenges.

Reason:

- The user clarified that the broader product is grounded in evolutionary psychology and evolutionary mismatch.
- The entry surface should help users understand why old behavior loops keep winning in modern environments.
- "Challenge" can make the work sound like a one-off task, while the intended product is a guided system for insight, environmental change, small action, and reinforcement.

Implication:

- `/practice` should describe behavior patterns or loops, not merely list challenges.
- Challenge content can remain the current internal implementation language for now, but user-facing copy should avoid making "challenge" the primary concept.
- Future naming should continue moving toward patterns, paths, loops, practices, and reinforcement rather than generic productivity challenges.

## 2026-05-29: Practice Is A Separate Product Surface
Partially superseded by 2026-06-28: "Retire Local Practice MVP And Reuse Existing Systems." Practice remains a separate product surface, but the old slug/result route implementation has been retired.

Practice does not live under `/tools`.

Reason:

- The user clarified that this is a new app-like surface, eventually possibly mobile-native.
- Procrastination is the first challenge, not the whole product.
- The product should support many behavior patterns over time.

Current routes:

- `/practice`
- `/practice/[slug]`
- `/practice/[slug]/result`

## 2026-05-29: Practice Uses A Calmer Visual Language
Practice does not need to match the existing portal UI, typography, or color scheme.

Reason:

- The experience should feel emotionally calm and minimal.
- The user specifically wants practices to feel different from the current Neurocient portal.
- The whiteboard emphasized "emotionally lightweight" and "feel encouraged."

Current direction:

- off-white background
- charcoal text
- muted sage accents
- hairline dividers
- fewer icons
- minimal controls
- one-screen-at-a-time flow

## 2026-05-29: IKEA + Reinforcement Is The Core Framework
The Practice product is based on:

- Identity
- Knowledge
- Environment
- Action
- Reinforcement

Reason:

- Identity matters because cognitive dissonance is real.
- Knowledge matters because users need to understand why they do what they do.
- Environment matters because people underestimate how much context affects action.
- Action matters only when it is matched to identity, knowledge, and environment.
- Reinforcement matters because the forgetting curve is real.

Implication:

- Future Practice flows should move toward IKEA explicitly.
- Current procrastination flow should be refactored to include Identity and Environment before Action.

## 2026-05-29: Local Storage Is MVP Persistence
The current Practice MVP stores session results in browser localStorage.

Reason:

- It keeps the first implementation lightweight.
- Backend persistence, auth, reminders, and mobile sync can be added later.

Implication:

- Do not imply cross-device persistence in copy.
- Be explicit if a result is local to the browser.

## 2026-05-29: Procrastination Flow Now Explicitly Follows IKEA
Superseded by the next decision: "Step Back To Original Procrastination Flow."

The procrastination session was refactored from the earlier advice/effect/root-cause flow into:

- Notice
- Identity
- Knowledge
- Environment
- Action
- Reinforcement

Reason:

- The product spine is IKEA + Reinforcement.
- Action should come after the user has named the self-story, discovered the reason, and noticed environmental support/friction.
- The result page should summarize the full IKEA map, not just a single root cause and recommendation.

Implication:

- Future challenges should use the same structure unless there is a strong product reason to diverge.

## 2026-05-29: Step Back To Original Procrastination Flow
The procrastination MVP was intentionally moved back closer to the original attached HTML flow:

- What is it?
- The standard advice
- Your honest check-in
- The actual reasons
- Where to next?

Reason:

- The user wants to proceed cautiously and intentionally.
- IKEA remains the broader product context, but the first implementation should not overfit the whole framework too early.
- The original procrastination flow is the seed artifact and should be respected before expanding it into the full IKEA model.

Implication:

- Keep the IKEA docs as strategic context.
- Do not force the first procrastination experience to expose every IKEA layer.
- Future iterations can gradually evolve the original flow toward IKEA once the simpler emotional experience feels right.

## 2026-05-29: Prefer Concrete Moments Over Labels
The procrastination copy should avoid turning behavior into abstract labels too early.

Reason:

- Labels can feel diagnostic or distancing.
- The desired experience is action/lack-of-action oriented, concrete, and vivid.
- Users should recognize a moment they have lived, not feel assigned to a category.

Implication:

- Prefer "You keep the task perfect by not opening it" over "Fear of failure."
- Prefer "Your todo says the project name, not the first physical move" over "Unclear next action."
- Use labels only later, if they help organize reflection after recognition.

## 2026-05-29: Merge Advice And Check-In
The original HTML had separate steps for "standard advice" and "honest check-in." In the app flow, these are merged into one screen.

Reason:

- The two steps are cognitively connected: the user should see each common fix and immediately mark whether they have tried it.
- Keeping them separate made the flow feel slower without adding reflection.
- The merge preserves the original meaning while making the interaction smoother.

Implication:

- The current session has four screens: what it is, advice/check-in, reasons, and next direction.

## 2026-05-29: Reduce Cognitive Load In Advice Check-In
The merged advice/check-in screen should behave progressively.

Reason:

- Showing advice options and effectiveness options at the same time asks the user to solve two questions at once.
- The easier sequence is: first recognize what has been tried, then answer how it held.
- Cognitive ease matters for this product; the flow should feel like one small decision at a time.

Implementation:

- Advice options are shown as compact checklist rows.
- The effectiveness question appears only after the user selects at least one tried strategy.
- Selecting "None, honestly" skips the effectiveness question and shows a gentle reflection.

## 2026-05-29: Practice Differentiates Through UX And Emotional Lightness
The self-help app market is saturated. Practice should create a niche through:

1. great UI/UX
2. emotionally lightweight behavior change

Reason:

- More advice is not enough.
- Users are already surrounded by tips, trackers, motivation, and generic self-improvement flows.
- The opportunity is to make behavior change feel calmer, more precise, less shaming, and easier to continue.

Implication:

- Cognitive load is a product constraint, not a polish detail.
- Each Practice screen should ask for one small movement or recognition at a time.
- Concrete, vivid behavior language should be preferred over abstract labels.
- UI should avoid dashboard density, gamified pressure, and heavy self-help aesthetics.
- When in doubt, simplify the interaction before adding more content.

## 2026-05-29: Limit First-Pass Choices
For the procrastination advice check-in, visible choices should be reduced from eight advice options to four primary options plus "None of these."

Reason:

- Eight options make the screen feel like a productivity menu.
- The goal is a lightweight self-check, not exhaustive advice recall.
- Hick's Law and choice overload both support reducing visible options when fast, low-friction reflection matters.
- A tired or mildly avoidant user should be able to scan the screen quickly and continue.

Implication:

- Use four primary choices plus one honest escape hatch as the default pattern for reflective Practice screens.
- Keep additional options hidden or defer them to later only if they are truly needed.

## 2026-05-29: Trust The User, Avoid Hand-Holding
Practice should not treat users as if they are unable to understand obvious UI.

Reason:

- Excess instruction adds noise.
- The desired feel is premium, calm, and intelligent.
- UI should communicate affordance through layout, spacing, contrast, and state, not constant explanatory text.

Implication:

- Remove labels like "Tap" when the row is already clearly interactive.
- Avoid "click here", "select one", and similar helper copy unless the interaction is genuinely ambiguous.
- Use copy for emotional meaning and concrete recognition, not interface narration.
