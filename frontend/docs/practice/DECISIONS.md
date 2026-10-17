# Practice Decisions

## 2026-10-14: The product journey does not replace the navbar taxonomy yet

The primary product model is recognition, understanding, application,
real-life use, and deeper support. The agreed language is Recognise through the
Scan, Understand through Inner Caveman and Insights, Work with it through
Practice, Use it in real life through Spots and Microchallenges, and Go deeper
through a personal program or workplace offering.

This journey guides transitions and page responsibilities, but does not replace
the established navbar taxonomy yet. The navbar retains Insights, Practice,
Diagnostics, Tools, Programs, and About, without a separate Start the Scan CTA.

Personal evidence is not a separate “My Caveman” stage. It belongs inside the
signed-in Profile together with reflections and continuity. The existing
`/my-caveman` portrait may remain as a subordinate Scan detail while that account
experience is consolidated. Saved and Profile remain account-owned utilities and
do not return to the public footer.

The route roles, audience paths, narrative contract, known gaps, and phased
alignment criteria are recorded in `../PLATFORM_ALIGNMENT.md`.

## 2026-10-14: One design foundation across the Neurocient product

Landing, Scan, insights, Practice, tools, programs, and account surfaces use one
product-wide typography, color, navigation, and hierarchy foundation. Journey-specific
composition remains deliberate: Scan may stay scene-led, Practice remains calm and
progressively disclosed, and articles retain a sustained-reading mode. These are modes
of one product rather than separate visual brands.

Playfair Display is the shared display face, Inter is the shared UI and explanatory
body face, and the system editorial serif stack is reserved for long-form reading.
Top-level routes use the shared page-title and eyebrow roles. Every route owns one
`main` landmark, and global navigation remains available with a visible current-page
state. The governing reference is `../DESIGN_SYSTEM.md`.

## 2026-09-19: First public result connects the Scan to the product

Implement the agreed sequence: the landing page introduces the Inner Caveman, the Scan lets the person see it in ordinary situations, and the public result establishes whether it appeared before introducing Neurocient's IKEA and reinforcement approach. Login follows that explanation and leads into the existing product. Reading retains the existing guest allowance and login gates.

Correction after review: the opening is not a synthesis of recurring behaviours and does not repeat selected scenarios. That treatment missed the result's purpose and could misrepresent useful behaviours such as planning and organising as the problem. The opening now states whether the Inner Caveman appeared, explains automatic and deliberate processing together, and explicitly avoids a dominant drive or personality conclusion. If it did not appear in the selected situations, the user receives a positive result and an easy exit.

The result remains visually continuous with the wider product. It uses the Scan's `caveman-scan-page` typography context and the product's full-width, background-separated sections. Content within those bands uses open layouts and simple rules; result sections are not placed inside invented rounded, bordered containers. Buttons and accents reuse existing product treatments.

The remainder introduces a concrete IKEA example, optional sourced science, and the roles of Spot the Caveman, microchallenges, and Practice (in development). The product CTA uses the existing AuthModal and `/tools/spots`; authenticated users continue directly. Existing account portrait routes remain available but are not part of this handoff, and the result does not claim an account save. The current contract is in `../scan/RESULT_APPROACH.md` and supersedes the earlier result-pattern interpretation for this public screen.

## 2026-09-19: Evolved automatic processing and the result's product role

The Inner Caveman is a system operating according to evolved tendencies without intention or agency. It is not a protector, guardian, or inner personality. Removing explicit intention while still explaining every behaviour as protection does not satisfy this distinction. An evolved response need not be useful in current conditions.

Product copy must be concrete and direct. Avoid poetic or therapeutic framing around "attention", "protection", "flow", "moment", and similar abstractions. Describe the situation, behaviour, and automatic response. Use "automatic processing" without implying that all the behaviours discussed belong to the anatomical autonomic nervous system.

The Scan result is the bridge between the landing page and the product: it connects the person's answers to an understanding of automatic behaviour and then explains Neurocient's approach and relevant tools. Do not classify the person by a dominant drive, force a problem onto their answers, or replace their result with a generic sales page. Explain IKEA and reinforcement in relation to behaviour change, distinguish the purposes of Spot the Caveman and microchallenges, and acknowledge that Practice is in development.

This clarification supersedes older protector framing and abstract copy examples. Existing evidence identifiers and historical decisions remain as implementation/history references, not copy guidance. Result sequencing, science presentation, and authentication placement remain open design questions; the preceding discussion was exploratory, not approval of a specific design.

## 2026-07-18: The Scan Begins With Lived Recognition

The Inner Caveman Scan should help users recognise recurring behaviour in concrete everyday scenes and begin appreciating how the Inner Caveman may be shaping it.

Reason:

- The landing page establishes familiar struggles and introduces the Inner Caveman as protective.
- The Scan must prove the lens by helping users recognise the Inner Caveman inside a moment they have lived.
- Users often already know that they compare, scroll, delay, worry, or keep planning. Neurocient adds value by contrasting the conventional interpretation with the protective Inner Caveman reading.
- Watchtowers are useful internal evidence, but starting from drive coverage produces forced scenes and unnatural choices.

Implication:

- Source the 12 Scan scenarios only from behaviour established on the landing page.
- Write concrete second-person stories with a time, place, object, person, or physical action.
- Ask for the next honest movement in the scene rather than an abstract inner-voice classification.
- Use four choices by default and add a fifth only when it protects honesty.
- Avoid conspicuously virtuous Rational Mind answers.
- Follow each response with a concise conventional-take versus Inner-Caveman contrast; keep deeper science optional.
- Write the scene truthfully first and assign Watchtower evidence second.
- Never force all five Watchtowers into one scenario.
- Use `frontend/docs/scan/SCAN_AUTHORING.md` as the canonical authoring and review guide.

## 2026-07-13: The landing page should alternate intensity without fragmenting the story

- Use background shifts and geometry to establish section boundaries while keeping one continuous narrative.
- Reserve large dark fields for the two strongest contrasts: why surface fixes fail and the final invitation to see the pattern personally.
- Keep final conversion moments on one clear reading path, with benefits immediately preceding the action.
- Avoid fixed mobile card heights when content can determine the natural rhythm.

## 2026-07-13: Long perspective shifts should unfold as editorial narratives

- Preserve a single reading path while giving each conceptual turn a distinct visual treatment.
- Use contrast, typography, borders, and restrained geometry to pace text-rich explanation without reducing its substance.
- Reserve the strongest visual block for the central mismatch users should remember.

## 2026-07-13: The Inner Caveman introduction should read as one visual narrative

- Keep the existing explanatory copy intact while using hierarchy, grouping, and pacing to connect the introduction, framework image, five drives, and closing reframe.
- Present the five drives as a coherent protective system rather than a generic list of content links.
- Preserve a single vertical narrative at every breakpoint, with the framework image as a centered feature moment rather than a two-column split.

## 2026-07-13: Text-Rich Sequences Use Controlled Presentational Variation

Long text-rich sequences should vary the user's mode of comprehension while retaining one coherent visual grammar.

Reason:

- Repeating the same heading, lead, detail, and callout composition makes semantically different ideas feel monotonous.
- Purely decorative variation can add extraneous cognitive load without improving comprehension or recall.
- Distinct visual signals, pacing, hierarchy, and composition can make dense material easier to enter without removing substance.

Implication:

- Use mobile-first progressive pacing and clear chunk boundaries for long landing and product sequences.
- Give major ideas a meaningful visual memory cue when appropriate, rather than styling every paragraph independently.
- Keep typography, color, spacing, and illustration grammar consistent while varying reading motion and composition.
- Do not treat copy reduction as the default solution to cognitive load.

## 2026-07-11: Account-Linked Portraits Must Be Retrievable

A completed Scan linked during authentication must be available again from the user's account, independent of the original browser's local storage.

Reason:

- Persistence without a return path is not user value.
- Creating an account to "keep your portrait" establishes a clear expectation that it can be revisited.
- Local storage supports resume but cannot be the source of truth for an account-owned result.

Implication:

- `/diagnostics/caveman-scan` loads the authenticated user's latest completed portrait when there is no current local Scan.
- The backend exposes the latest completed account-linked Scan with full evidence and portrait data.
- Future account/history surfaces can build on the same records without changing the persistence contract.

## 2026-07-11: Watchtowers Stay Internal Unless Deliberately Taught

The Watchtower and landscape metaphors are internal product, scoring, and design language. They should not appear in the public Scan by default.

Reason:

- A user entering the Scan has not been taught what a Watchtower or landscape means.
- Exposing internal metaphors makes the user decode the product instead of recognizing themselves.
- The public experience is clearer when it describes what the Inner Caveman notices first, what it is trying to protect, where it becomes alert, and where Rational Mind stays grounded.

Implication:

- Keep Watchtower identifiers and mappings in code and internal documentation.
- Use the established five core-drive names only where naming the concern adds clarity.
- Do not mention supporting Watchtowers, landscapes, standing guard, or towers in public copy unless a future experience deliberately introduces and earns the metaphor.
- Review public Scan copy specifically for implementation-language leakage during every iteration.

## 2026-07-11: First Watchtower Scan Ships As An End-To-End Vertical Slice

The versioned Watchtower foundation now powers the public `/diagnostics/caveman-scan` experience from intro through the account-linked living portrait.

Reason:

- The complete interaction is necessary to validate more than isolated types and scoring functions.
- Scenario recognition, progressive pacing, the anonymous value boundary, account motivation, and report usefulness need to be experienced together.
- A working vertical slice gives future wording and visual iterations a stable evidence and persistence base.

Implication:

- Complete all 12 moments before asking for an account.
- Give anonymous users a meaningful first portrait observation rather than withholding the promised result.
- Ask for a free account to keep and deepen the portrait, then link the anonymous session to that user.
- Randomize response presentation without changing option identities or mappings.
- Keep the full report deterministic in this version and route toward Inner Caveman 101 and Practice.
- Treat the current copy and presentation as a testable first iteration, not final calibrated language.

## 2026-07-11: Build The Scan Foundation Before Reworking Presentation

The first implementation step for the new Inner Caveman Scan is the versioned domain, evidence, and persistence foundation. Wording and visible presentation will be reviewed in a later iteration.

Reason:

- Scenario options must retain stable links to the five Watchtowers and Rational Mind before a trustworthy portrait can be generated.
- Historical evidence must remain reproducible when scenario copy, mappings, scoring, or report language changes.
- Anonymous users should be able to complete the Scan while the same session can later be linked to an account for the living portrait.

Implication:

- Keep the existing public Scan UI active until the Watchtower presentation is intentionally designed.
- Establish versioned scenarios, deterministic 12-scenario selection, response snapshots, evidence scoring, portrait inputs, anonymous sessions, and account linking first.
- Treat current scenario wording as version-one source material, not final calibrated copy.
- Do not prematurely implement the preview gate, full report prose, progressive reflections, or Watchtower visual landscape in this foundation pass.

## 2026-07-11: Build The Scan Around Watchtowers, Not Drive Scores

While building the Inner Caveman Scan, the five core drives should be modeled internally as Watchtowers: places the Inner Caveman goes to keep watch when an ordinary moment acquires survival-relevant meaning.

Reason:

- "Drive" can imply a stable trait, a quantity a person possesses, or a force that determines behavior.
- The Scan is intended to observe what the mind notices and protects first, not assign personality traits.
- Watchtowers provide a coherent narrative and visual language for scenarios, progressive reflections, and the final portrait.
- The metaphor supports contextual portraits: the Caveman may watch the Horizon in uncertainty, the Campfire in group moments, the High Ground during evaluation, the Home Path in close bonds, and the Care Circle around responsibility for others.

Implication:

- Use the working Watchtowers Horizon/Safety, Campfire/Belonging, High Ground/Status, Home Path/Bond, and Care Circle/Kin.
- Preserve each scientific core-drive construct as metadata attached to its Watchtower.
- Model Rational Mind separately; it is not a sixth Watchtower or a superior command tower.
- Persist response evidence against stable identifiers and versioned mappings, not only a winning category or final score.
- Generate reports as a contextual landscape showing where the Caveman keeps watch and where Rational Mind can stay with the evidence.
- Avoid trait language, dominant-drive labels, rationality percentages, cartoon treatment, and gamified tower visuals.
- See `frontend/docs/NEUROCIENT_PRODUCT_SYSTEM.md` for the canonical cross-product explanation.

## 2026-07-11: Practice Belongs To One Neurocient Recognition-To-Change System

The Inner Caveman Scan, Inner Caveman 101, Spot Your Inner Caveman, Practice, microchallenges, and reinforcement should be designed as one connected product journey under the promise "Get more life from life."

Reason:

- Neurocient is moving beyond a knowledge base into applied, real-life behavior change.
- The Scan creates personal recognition; Inner Caveman 101 supplies the shared mental model; Practice applies that understanding to a recurring behavior loop.
- The existing spots, microchallenges, nudges, WhatsApp, reflections, and IKEA infrastructure can support awareness, experiments, retrieval, and evidence without creating parallel systems.
- The procrastination Practice is the first proof case for turning a broad Caveman insight into work on one place where time, attention, energy, or agency is being lost.

Implication:

- Treat the Scan as the mirror, Inner Caveman 101 as orientation, and Practice as guided application.
- Preserve Rational Mind in the Scan as a necessary contrast to the five protective drives; it is not a sixth drive or a claim that the Caveman should be defeated.
- Connect existing capabilities through a recognition → understanding → spotting → practice → small experiment → reinforcement → evidence journey.
- Do not present tools as an unrelated catalogue when they are supporting stages of the same product loop.
- Use `frontend/docs/NEUROCIENT_PRODUCT_SYSTEM.md` as the cross-product reference for this direction.

## 2026-06-28: First Persistence Uses Local Draft Then Existing IKEA Worksheet
The first implemented persistence path for Practice should save an anonymous draft locally, then persist it to the existing IKEA worksheet system after authentication.

Reason:

- The first session remains ungated, but reinforcement and progress need a user identity.
- The repo already has `IkeaWorksheet` and `IkeaTracker`; creating a second Practice persistence engine now would duplicate existing behavior-change infrastructure.
- A Practice-facing API adapter can hide internal IKEA naming from the UI while still reusing the backend model.
- Users who are already logged in should not see an auth interruption; their selected loop can be saved directly.

Implication:

- Before login, keep the selected loop draft in browser local storage only after the user asks to remember it.
- After login/signup, convert that pending draft into an authenticated active worksheet.
- For authenticated users, save the draft immediately when they choose reinforcement.
- Store the Practice-specific context inside the worksheet environment JSON until a dedicated Practice table is justified.
- Do not expose worksheet, schema, account status, or persistence mechanics as user-facing copy.
- A logged-in user must be able to see the current saved practice details on the Practice surface; persistence without a return view is not product value.

## 2026-06-28: Reinforcement Handoff Must Not Look Like Account Plumbing
The screen after "help me remember this" should feel like a continuation of the emotional journey, not an admin summary.

Reason:

- Labels such as "Setup", "Connected", "Pattern", and signed-in email expose internal implementation state.
- A list of saved objects makes the moment feel like configuration, not support.
- The user has asked to remember an insight; the product should keep attention on the prompt returning at the right moment.

Implication:

- Do not show account status, email, or object-summary cards as the main reinforcement handoff.
- Keep the reminder prompt visible and concrete.
- If backend reminder setup is incomplete, avoid pretending a real reminder has been scheduled.
- User-facing copy should stay close to the lived loop, not the persistence mechanism.

## 2026-06-28: Do Not Manufacture Victory Inside The First Session
The first Practice session should not ask the user to pick a "victory" card before they have acted in real life.

Reason:

- A victory is evidence from behavior, not a feeling selected inside the same screen flow.
- After the matched action, the user has only received a next move; the product does not yet know whether anything changed.
- Asking for a victory too early makes progress feel fake and turns evidence into interface busywork.
- The better end of the first session is a useful action plus an optional reinforcement handoff.

Implication:

- Current procrastination flow order is: recognition, advice audit, effect check, alternate perspective/knowledge, identity, environment, action, remembering.
- Do not add card selection for victory/evidence before the user has tried the action.
- Capture progress evidence later through reinforcement, return check-ins, or post-action logging.
- "Moment of victory" remains a product concept, but only when tied to real behavior such as caught earlier, returned sooner, changed the setup, made the next move visible, or started small.

## 2026-06-28: Environment Redesign Follows Identity
After the identity reframe, the next useful movement is relevant environment redesign.

Reason:

- Identity names what the user may be identifying with and what identity they can practice instead.
- The next screen should help that identity become easier to act from by changing the setup around the user.
- Environment is where the product moves from self-story into design: cues, friction, defaults, visibility, and first-move support.
- In this flow, the alternate perspective is the knowledge/discovery moment, so environment should not wait behind another knowledge screen.

Implication:

- Current procrastination flow order is: recognition, advice audit, effect check, alternate perspective/knowledge, identity, environment, action, remembering.
- Environment copy should feel like redesigning the setup, not receiving generic advice.
- The older 2026-06-02 decision "Environment Screen Follows Knowledge" is superseded for the rebuilt Practice flow.

## 2026-06-28: Alternate Perspective Is The Knowledge Moment
The rebuilt procrastination flow should not add a separate "why it happens" screen after the alternate perspective.

Reason:

- The alternate perspective already explains why procrastination makes sense from the Neurocient/evolutionary mismatch angle.
- A second knowledge screen repeats the same layer and delays environment redesign and action.
- The experience should feel like an unfolding journey, not a framework checklist.

Implication:

- Treat the "Another angle" screen as the Knowledge/Discovery moment for this flow.
- Keep deeper why-language inside the scene-specific perspective copy.
- Move from alternate perspective to identity, then environment redesign, then action.
- Reintroduce a separate knowledge screen only if a future loop truly needs more explanation to make the setup/action coherent.

## 2026-06-28: Identity Screen Reframes Self-Identification
The identity screen should show the self-story the loop invites, then offer an identity the user can practice instead.

Reason:

- The product is not only explaining why procrastination happens; it is helping the user stop identifying with the loop.
- A "more accurate read" can become analysis copy. The screen needs an identity reframe.
- The user should see the difference between "what I may be calling myself" and "who I can practice being in this moment."

Implication:

- The first card should name the borrowed identity or self-label from the loop.
- The second card should be a concise identity-to-practice statement.
- It is acceptable for this screen to use "Identity" as user-facing language because identity is the explicit work of the moment.
- Avoid turning the second card into explanation; keep it as a usable self-story.

## 2026-06-28: Effect Check Routes To Scene-Specific Alternate Perspective
After the user says an attempted fix only helped briefly or did not really help, the next screen should deliver an alternate perspective tied to the selected lived moment.

Reason:

- The whiteboard flow calls for alternate perspective / knowledge / discovery after checking what the user tried.
- A generic "advice is not enough" transition loses the thread created by the selected scene.
- The user should feel the system is responding to their exact loop before moving into story, why, setup, and next move.
- For procrastination, this perspective should show the older protective system choosing short-term relief, safety, clarity, control, or threat reduction.

Implication:

- Each behavior scene should carry a short alternate perspective.
- The post-effect screen should use the selected scene's perspective, not a generic explanation.
- The perspective should come before deeper story/why/setup/action screens.
- If the user's attempt worked, the flow can still close respectfully and offer optional remembering.
- Do not name "Inner Caveman" or other internal branded concepts in this user-facing moment.

## 2026-06-28: Advice Audit Must Follow The Selected Moment
The "what have you already tried?" screen should be anchored to the behavior scene the user selected.

Reason:

- Different procrastination loops invite different attempted fixes.
- Showing the same generic advice options after every recognition choice makes the flow feel less adaptive.
- The selected moment is already shaping the loop map, so the next screen should continue that thread.
- The audit is more useful when it asks about attempts that plausibly match the lived scene.

Implication:

- Each behavior scene should define or resolve to relevant audit options.
- Changing the selected scene should clear stale advice/effect answers.
- Keep the option count low: four relevant attempts plus an honest escape hatch where possible.
- Shared options can be reused, but the visible set should be selected by the loop/scene.

## 2026-06-28: Internal Framework Language Is Not User-Facing Copy
Practice should use internal concepts to guide product thinking, not to explain the product to users by default.

Reason:

- The user uses concepts like IKEA, reinforcement, identity, knowledge, environment, cognitive biases, free access, gating, and persistence so the product team can reason clearly.
- Those words are often too abstract, instructional, or system-facing for the actual experience.
- Users should not be treated as if they need obvious interface behavior explained.
- The product should feel intelligent through precise interaction and concrete copy, not through visible framework labels.

Implication:

- Keep IKEA and related framework terms in docs, code structure, data models, and internal discussion.
- Do not expose internal labels like "Identity", "Knowledge", "Environment", "Action", "Reinforcement", "IKEA", "gated", or "free session" in user-facing copy unless explicitly chosen.
- Avoid CTA copy that explains the commercial/access model when the user can infer it.
- Prefer plain, concrete, lived-moment copy such as "Start", "Continue", "Keep this for later", "What changed?", and "Help me remember this".
- Educate users only where it matters: consent, privacy, payment, WhatsApp reminders, account creation, or genuinely ambiguous product behavior.

## 2026-06-28: Practice Must Be Multi-Loop And Modular
Practice should be architected as a family of behavior-change loops, not as a procrastination-only single-page app.

Reason:

- Procrastination is only the first pattern/loop/practice, not the full product.
- Future loops should reuse the same emotional journey, IKEA structure, reinforcement handoff, and progress evidence patterns.
- A large route-level client component would become hard to understand, hard to maintain, and easy to copy incorrectly.
- Practice should align with the current Neurocient product design and infrastructure instead of becoming a disconnected app inside the app.

Implication:

- Do not treat `/practice` as a standalone SPA.
- Do not hardcode the architecture around procrastination.
- Split Practice into small reusable components, loop definitions, flow logic, and integration adapters before adding more loops or deeper persistence.
- Keep route files as containers and composition points.
- Keep procrastination-specific copy and branching in a loop definition or clearly isolated module.
- Reuse current auth, progress, WhatsApp, microchallenge, preferences, and IKEA systems.
- Match the existing product design language while making Practice calmer and more focused.

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
- Mature Practice architecture should route users adaptively across Identity, Knowledge, Environment, Action, Reinforcement, and post-action evidence.

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
Superseded by 2026-06-28: "Environment Redesign Follows Identity."

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
## 2026-07-11: Neurocient Is Mobile-First
Neurocient should be designed and implemented for mobile as the default experience, while continuing to support desktop well.

Reason:

- The expected primary usage context is mobile.
- Mobile constraints force clearer hierarchy, lower cognitive load, more deliberate progressive disclosure, and appropriately sized interactions.
- Starting from desktop and compressing afterward tends to preserve desktop density and weakens the intended calm, lightweight experience.

Implication:

- Begin new flows, pages, and components with the narrow-screen experience.
- Make content order, interaction states, touch targets, line wrapping, and one-idea-per-viewport behavior work on mobile before adding desktop enhancements.
- Treat desktop layouts as a deliberate expansion of the mobile product, not as the source layout.
- Verify both surfaces, but resolve design tradeoffs in favor of the mobile experience unless a task explicitly targets desktop.

# 2026-07-18: Landing Emphasis Has Distinct Narrative Jobs

The landing page uses two additional emphasis patterns selectively: isolated phrases for the knowing-doing gap and editorial pull quotes for transitions into a useful next step.

Reason:

- Each treatment supports a different stage of the story instead of adding decoration for its own sake.
- Isolated phrases create a recognition pause, while pull quotes compress the product belief into a retrievable thought.

Implication:

- Use these treatments sparingly and mobile-first.
- Do not repeat both treatments in every section.
- Preserve the sequence of recognition, understanding, and then action.
## 2026-07-19: Scan results are based on recurring protective moves, not a Caveman score

- Each Scan option records its lived response, protective move, possible concern, evidence strength, optional Watchtower, likely cost, and mirror language.
- The result may surface a protective move only after it recurs across meaningfully different scenarios.
- A grounded response is evidence of flexibility in that moment, not evidence that the Caveman is absent.
- The current landing-page-led scenario set is not balanced across all five Watchtowers, so it must not produce ranked Watchtower scores or infer quiet Watchtowers from missing evidence.
- Pressure discharge remains distinct from relief, control, and pushing through because collapsing it would misdescribe the accumulated-pressure scenario.

## 2026-07-20: The Scan result has an open primary portrait and a gated deeper portrait

- Completion always reveals the primary result without requiring authentication.
- The open result includes selected evidence, the recurring movement, the protective interpretation, and a cue to notice in real life.
- Authentication happens only when the reader chooses to open the deeper portrait.
- The deeper portrait may include a supported secondary movement, later costs, flexibility evidence, and relevant continuation.
- The open result must be meaningful on its own and must never be reduced to a teaser for account creation.
- The Scan, open result, and deeper portrait use three deliberate routes: `/diagnostics/caveman-scan`, `/diagnostics/caveman-scan/result`, and `/my-caveman` respectively. Neither result is expanded inline beneath the Scan.

## 2026-07-20: Post-portrait progression begins with lived spotting

- The deeper portrait asks for one real-world Spot rather than another reading, test, or immediate behavior fix.
- `/my-caveman/spot` carries the primary portrait cue into a short lived-evidence capture using the existing Spots API.
- The first Spot reinforces noticing. A microchallenge is offered only after the same primary movement has been recorded more than once.
- Microchallenge completion may hand into Practice only when the Caveman movement has a relevant authored Practice. The current direct Practice handoff is restricted to procrastination rather than force-fitting every Scan result into the first proof loop.
- Progress is recognition, repeated spotting, a small experiment, and then deeper Practice—not feature discovery or raw streak completion.

## 2026-07-20: The end-to-end Caveman journey preserves one narrative and one next move

- Landing copy remains the source of truth and must not be rewritten as part of Scan work. The Scan and everything after it help the person realise, meet, and gradually recognise their Inner Caveman; “patterns” is not the user-facing product frame.
- Optional science remains available after the immediate reflection. It should deepen the Inner Caveman reading without interrupting the recognition flow or competing with the primary result.
- The open result ends with one primary transition into the deeper portrait; generic reading links do not compete with that handoff.
- Spots return to `/my-caveman` as visible lived evidence so the portrait does not remain a static scan report.
- The portrait advances its next action from first Spot, to repeated Spot, to a small experiment.
- Guided microchallenge arrivals suppress dashboard metrics, reduce visible catalogue choice, and use experiment language.
- Machine-readable Spot metadata and internal pattern identifiers remain implementation details and must not appear in the user's awareness log or journey copy.
- Legacy quick-test promotion is removed; `/diagnostics/spot-your-caveman` redirects to the canonical Scan.

## 2026-07-20: The Scan introduction demonstrates the reading instead of explaining the interface

The Caveman Scan introduction opens with concrete moment fragments and previews the contrast between the usual take and the Inner Caveman take.

Reason:

- The Scan earns interest through recognition, not a feature list or broad self-help questions.
- A small example makes the Scan’s compassionate value clearer than explaining its internal sequence.
- Setting expectations such as approximate time, no score, and no right answers reduces test anxiety without turning the page into instructions.

Implication:

- Intro copy should remain grounded in behaviour already established on the landing page.
- The preview may demonstrate the interpretive lens, but it must not diagnose the reader or pre-empt their result.
- Mobile shows the promise and primary action before the explanatory example; desktop may expand this into a two-part editorial composition.

## 2026-07-20: The open Scan result leads with the personalised protective bargain

The open result leads with the recurring protective movement, its immediate payoff, and its later cost. It then connects concrete selected scenes before explaining supported drives and the missing layer beneath familiar advice.

Reason:

- Repeating the landing-page Caveman illustration does not add information after the person has completed the Scan.
- Analytical mirror statements alone feel like paraphrases of answers; the result must show how concrete selected scenes connect through one immediate-versus-later bargain.
- The familiar intervention becomes useful context only when the result also explains why it helps and what protective logic it leaves untouched.

Implication:

- Do not repeat the landing-page illustration as the result hero; lead with synthesis unique to the person's answers.
- Show selected scenes, selected actions, and their protective function before abstracting to the recurring movement.
- Show only drives directly supported by selected evidence.
- Do not rank drives, calculate drive percentages, infer absent drives, or call one drive dominant from the current scenario set.
- Keep the open result meaningful: personalised synthesis, selected evidence, supported drives, recurring movement, immediate protection, later cost, and one real-life cue all remain available before authentication.

## 2026-07-20: The Scan gate previews Neurocient's way forward, not more diagnosis

The authentication transition after the open result briefly explains how Neurocient Labs works differently, while the authenticated portrait contains the personalised practical detail.

Reason:

- The open result has already explained what the Caveman is protecting; promising more analysis weakens the natural next question: what do I do instead?
- Generic discipline and routine advice starts at action. Neurocient first corrects the self-story, preserves the protective explanation, changes the conditions around the moment, and then offers a small matched response.
- The gate should create informed curiosity without withholding the core Scan result or dumping the full method before the person opts into continuity.

Implication:

- The open gate names Neurocient Labs, contrasts its approach with willpower-first advice, and previews the practical transformation briefly.
- After authentication, the way forward appears before secondary analysis and expands the user's self-story, reframe, environment, matched action, and retrieval cue without naming the internal IKEA framework.
- Account language remains about keeping and returning to a personal way forward, not paying to discover what the Scan found.
- The authenticated continuation answers how to work with the result: the self-story the movement can create, a more accurate reframe, an environmental adjustment, one matched action, and a retrieval cue. These stages follow the product framework internally but are expressed in ordinary language rather than framework labels.

## 2026-07-24: Visual Scan scenes use an editorial story hierarchy

Visual Scan scenes are composed as a narrow reading column with authored metadata, story beats, an interruption object, a callout, and then the decision prompt.

Reason:

- The person should enter the lived moment before seeing the answer interface.
- Separating time, the consequential line, and the interruption makes a dense scene easier to scan without removing substance.
- A structured insertion point keeps notification and moment cards attached to the exact beat they represent.

Implication:

- Scenario data may specify a time label, the paragraph after which its visual appears, and a callout paragraph.
- These are optional authored fields; scenes without them keep the default reusable rendering.
- Visual hierarchy should remain mobile-first, text-rich, and restrained rather than becoming decorative illustration.

## 2026-07-24: The Inner Caveman is a lens, not an agent

User-facing copy treats the Inner Caveman as a useful lens on fast inherited responses. It does not personify it as an inner character that wants, decides, chooses, protects, speaks, or pursues a goal.

Clarification recorded 2026-08-28: the Inner Caveman is not a tiny guardian inside a person's head. It is shorthand for a highly efficient automated processing system operating through biological automation. A response may have a protective function without implying a separate protector, conscious intention, or deliberate intervention.

Reason:

- Agency language implies a separate intentional actor and misstates the product concept.
- The value of the lens is noticing what becomes salient before deliberate thought catches up.
- Contrasting deliberate advice with an immediate reward makes the knowing-doing gap vivid without inventing protective intent.

Implication:

- Prefer language about automatic weighting, salience, inherited sensitivity, immediate payoff, and fast signals.
- Validate content by asking whether it attributes thought, speech, care, choice, vigilance, or intention to the Inner Caveman. If so, rewrite it in terms of automated processing, biological response, weighting, salience, or sensitivity.
- “Eat the frog” may be contrasted with the Inner Caveman noticing the “donut” first: the deliberate task is known, but the immediate reward is already pulling attention.
- Keep “lens” as an internal product description, not a user-facing section label. Let the scene and contrast carry the meaning without defensive disclaimers or redundant explanation.
- Existing and future Scan, result, Practice, and reinforcement copy should be audited for agentic language as those surfaces are revised.

## 2026-07-24: Grounded Scan choices are not an answer key

The grounded continuation is written as an ordinary next action and appears in
different positions across the Scan rather than consistently appearing last.

Reason:

- A repeated final "healthy" answer turns recognition into a test of whether
  the person can identify the lesson.
- Polished therapeutic language encourages aspirational answers rather than an
  honest account of what happens next.
- The Scan needs contrast without dividing the choices into four wrong answers
  and one conspicuously mature answer.

Implication:

- Use concrete actions such as moving the phone, finishing the immediate task,
  sending the simple message, or beginning one small step.
- Avoid having the grounded choice explain its own psychological wisdom.
- Attach canonical evidence before any display-only reordering so result
  interpretation remains stable.

## 2026-07-26: Scan results enter through the problem people recognise

The open Scan result first names the relatable modern problems people commonly
seek help for—such as procrastination, scrolling, overthinking, motivation,
communication, anger, and difficulty switching off—before connecting them
through the Inner Caveman interpretation.

Reason:

- Broad categories describe where a struggle appears but do not explain why the
  competing response keeps feeling useful in the moment.
- People should recognise the problem they came to solve before Neurocient asks
  them to consider a different account of it.
- Neurocient's distinctive contribution is not to deny conventional advice, but
  to show the mismatch layer that advice often leaves unexplained.

Implication:

- Result copy should move from the familiar problem, to the usual intervention,
  to its missing explanation, and then to the immediate-versus-later mismatch.
- Prefer lived help-seeking language over internal categories such as
  productivity, emotional regulation, or protective-move names.
- Derive the named problems, conventional response, and mismatch explanation
  from the person's selected recurring evidence; do not place a generic category
  narrative around otherwise personalised cards.
- Use recognizable life-level struggles such as stress, low motivation, lost
  productivity, relationship strain, overthinking, or low energy in the result
  headline. Keep the more nuanced scene language in the evidence cards beneath it.
- Use the qualified formulation "may not be only" rather than claiming every
  modern difficulty is entirely or conclusively caused by evolutionary mismatch.

## 2026-07-26: The authenticated Scan portrait is an evolving practice surface

The post-authentication screen does not repeat the open result as a longer
report. It saves one accurate reframe, returns one personalised cue, and asks
the person to catch that movement in real life.

Reason:

- The open result has already delivered the interpretation; more diagnosis is
  not a meaningful reason to create an account.
- Account value begins with continuity, lived evidence, and guidance that changes
  as the person notices the movement outside the Scan.
- A five-step explanation of the internal behavior-change method adds cognitive
  load before the person has gathered new evidence.

Implication:

- With no Spots, the primary action is to catch the movement once.
- After one Spot, the primary action is to catch it again.
- After repeated Spots, the primary action may become one small matched
  experiment.
- Secondary movements, costs, supported concerns, and flexibility evidence remain
  available under progressive disclosure rather than competing with the next move.

## 2026-08-27: Each Scan moment separates recognition from interpretation

The Scan presents each moment in two beats: first the lived scene and an honest
continuation choice, then an alternate reading that appears immediately after
selection in a bottom sheet on mobile and a bottom-corner panel on desktop.

Reason:

- A forced full-screen scroll made a repeated 12-moment experience feel heavier
  and more questionnaire-like than intended.
- Alphabetic answer markers implied a scored quiz even though the choices are
  evidence from lived experience rather than correct or incorrect answers.
- The alternate reading is the Scan's primary value and should arrive at the
  moment of recognition without requiring a second confirmation action.

Implication:

- At every breakpoint, the scene, prompt, and continuation choices form one
  uninterrupted editorial sequence. Wider screens may increase measure and
  breathing room, but must not place choices beside the scene.
- Selecting a continuation opens its alternate reading immediately in a
  responsive overlay while preserving the selected response beneath it.
- Reflections keep optional science under progressive disclosure and provide a
  single next-moment action.
- Progress and back navigation remain available in both beats without adding
  quiz-like answer labels or competing navigation controls.

## 2026-10-14: The Modern Caveman page is one guided programme decision

The Modern Caveman sales page preserves its substantive programme content but
organises it as a single mobile-first narrative: recognise the gap between
knowing and doing, inspect the four-week experience and outcomes, assess
personal fit, and then consider the investment.

Reason:

- The previous page presented individually styled content sections without a
  clear relationship between explanation, programme mechanics, fit, and price.
- A high-consideration guided programme needs enough substance to support an
  informed decision without making the user assemble the offer themselves.
- Eligibility belongs before pricing; reassurance and frequently asked
  questions belong after the offer rather than delaying the programme model.
- Founder biography and programme-origin sections are omitted here because the
  wider platform already establishes the point of view, while this route needs
  to help the person evaluate the programme itself.

Implication:

- Keep the programme page visually related to the wider platform while giving
  it a more focused editorial rhythm than discovery routes.
- Preserve the payment destination, price, guarantee, programme inclusions, and
  week-by-week claims when changing presentation.
- Prefer open, sequenced reading and clear dividers over a collection of
  interchangeable marketing cards.

## 2026-10-14: The workplace offer begins with observable team behaviour

The Caveman in the Cubicle page leads with workplace situations a leader can
recognise, then explains the automatic social responses that may sustain them.
Its two continuations are the CIC diagnostic and a workshop conversation.

Reason:

- The workplace path has a different actor and decision from the personal
  product journey: a leader is evaluating a team pattern and a facilitated
  organisational intervention.
- Language such as "leading nervous systems," generic threat, or belonging
  protection is too vague to explain what people actually do at work.
- A workplace buyer needs to see the problem, the explanatory lens, the way of
  working, and the resulting capability without moving through repeated sales
  claims.

Implication:

- Begin with observable actions in meetings, decisions, feedback, hierarchy,
  and follow-through.
- Explain the immediate social consequence that can keep each response useful
  without assigning intention or agency to an Inner Caveman character.
- Keep the diagnostic self-serve path and workshop conversation visibly
  distinct while allowing either to be a valid next step.

## 2026-10-14: Insights begins with lived questions, not publishing taxonomy

The Insights landing page uses familiar situations and questions as its
primary entry points. Recency, topic tags, and the complete article archive
remain available as secondary discovery tools.

Reason:

- A person usually arrives with a repeated behaviour they cannot explain, not
  a publication date or an internal content category.
- Asking for a taxonomy choice before recognition makes the visitor translate
  their experience into the platform's organisational model.
- Insights supports understanding within the wider Neurocient journey; it is
  not a separate media feed competing for attention.

Implication:

- Curate the entry page around concrete moments such as scrolling, replaying
  conflict, worrying, comparing, stress eating, or workplace silence.
- Keep every article discoverable through the full archive and topic routes;
  curation must not become an access restriction.
- Introduce the immediate-payoff and later-cost lens before asking the person
  to choose an explanation.

## 2026-10-14: Every primary navigation destination has one job

The five action-oriented top-level destinations now answer different user
questions: Practice guides active self-service work, Diagnostics helps a person
choose the right context for recognition, Tools records evidence and supports
small experiments, Programs explains high-touch offers, and About establishes
the organisation, method, and trust context.

Reason:

- Container names alone made the platform feel like a collection of sections
  and left visitors to infer how the parts related.
- Practice and Programs need an explicit boundary between self-guided product
  work and facilitated support.
- Personal and workplace diagnostics serve different actors and decisions, so
  the context choice must precede either scan.
- Spots and Microchallenges are complementary parts of an evidence-and-
  experiment loop; fabricated streaks misrepresent both progress and state.

Implication:

- Keep shared typography, colour, and editorial rhythm across public navigation
  surfaces while giving each route an information structure suited to its job.
- Preserve Practice as the calmer authenticated product surface; public routes
  may orient or route users but must not duplicate its guided flow.
- Show account evidence only when it comes from persisted user data, and show a
  truthful loading or failure state when that evidence is unavailable.
- Let the global footer own exhaustive company and legal navigation so About
  can focus on purpose, method, founder context, and useful next doors.

## 2026-10-14: Profile owns personal evidence; tools own the work

The signed-in Profile is the home for returning to a Scan portrait, real-life
Spots, Microchallenges, reflections, and delivery preferences. Spots and
Microchallenges remain focused working surfaces rather than becoming a second
account dashboard.

Reason:

- A person should not need to understand several account destinations to find
  what they previously noticed or tried.
- Calling the Tools index a dashboard confused a public support index with a
  private account home.
- Personal evidence is account-owned continuity, not another public stage in
  the navigation.

Implication:

- Keep Profile behind authentication and link its evidence section to the
  existing portrait, Spots, and Microchallenges routes.
- Keep Saved as a separate reading utility in the account menu.
- Do not add a Dashboard alias unless a distinct signed-in dashboard is later
  designed and given a clear job.

## 2026-10-14: Missing account data is not empty account data

Account surfaces distinguish loading, unavailable, signed-out, genuinely empty,
and populated states. A failed request must not produce a zero count, an empty
shelf, default preferences, or a behavioural recommendation based on presumed
absence.

Reason:

- False emptiness contradicts the user's memory and erodes trust in saved
  evidence.
- The next step after a Scan depends on whether a matching Spot exists; a
  network failure cannot safely answer that question.
- Reminder settings and daily logs affect real behaviour and must remain scoped
  to the authenticated account and assignment.

Implication:

- Spots, Microchallenges, Saved, Profile preferences, and the saved Scan
  portrait expose explicit unavailable states and retry where useful.
- Daily Microchallenge completion comes from the persisted assignment rather
  than a browser-global flag.
- Keep persistence and authorization decisions on existing backend boundaries;
  UI fallbacks must not invent state.

## 2026-10-15: Free use leads to account use, then Membership

The self-guided platform uses a three-stage access model: anonymous use up to
the existing anonymous limit, authenticated free use up to the existing account
limits, then paid Membership at USD 9 per month. A free account may save one
Practice loop. Paid Membership removes the self-guided limits.

Reason:

- The product should demonstrate value before asking for identity or payment.
- Login preserves continuity; Membership pays for continued self-guided use.
- The previous coming-soon and manual-plan language contradicted active usage
  gates and the stated price.

Implication:

- Preserve the current limits of 5 anonymous article reads and, for a free
  account, 20 article reads, 15 Spots, 5 Microchallenges, and 1 Practice loop.
- Represent paid access with a provider-neutral account entitlement. Manual
  activation and a future gateway webhook update the same boundary.
- `/membership` uses a hosted checkout when `MEMBERSHIP_CHECKOUT_URL` is
  configured and assisted WhatsApp purchase otherwise. `/subscribe` redirects
  to the canonical Membership page.
- A browser redirect never grants access; verified entitlement state does.

## 2026-10-15: A Microchallenge is a 21-day experiment with an 80% threshold

A Microchallenge remains active through its twenty-first calendar day. After
that day, 17 or more distinct daily logs is `success`; fewer is `failed`.
Progress is completed days out of 21 and is capped at 100%.

Reason:

- The previous listing, logging, and progress endpoints completed at 21, 19,
  and 17 logs respectively and used conflicting terminal statuses.
- Seventeen days is approximately 80% of the experiment and permits imperfect
  repetition without turning the experience into a streak.
- Finalising only after day 21 keeps the final day available for logging.

Implication:

- Canonical statuses are `active`, `success`, `failed`, and `removed`.
- One assignment accepts at most one log per calendar day.
- Re-entry through listing, progress, or direct logging must converge on the
  same outcome; logging after the experiment ends is rejected.

## 2026-10-15: Facilitated programs remain separate from Membership

The Modern Caveman remains a paid, cohort-based facilitated personal program.
The Caveman in the Cubicle diagnostic remains a public self-serve assessment
that leads to the facilitated CIC program. Neither offer is bundled into the
$9 self-guided Membership by default.

## 2026-10-15: Claims governance is deferred as one platform decision

Evidence ownership, verification, review cadence, and removal rules for public
claims will be designed holistically. Existing article narratives remain in
place until that workstream begins; individual claims should not be migrated
piecemeal in the meantime.

## 2026-10-15: Admin operates cohort-specific Modern Caveman commerce

Neurocient will introduce a private admin surface. The initial administrator is
`hello@neurocient.com`, using the existing email/password authentication flow
and an authoritative backend admin role. Email comparison in the frontend does
not grant access.

The first operational responsibility is Modern Caveman cohorts: their public
details, schedules, hard capacity, enrolment window, price, Razorpay checkout,
participants, waitlist, payment reconciliation, and lifecycle state. Account
creation or login is required before payment. Once capacity is reached,
checkout closes and the cohort-specific waitlist opens.

A verified Razorpay webhook, not the browser return path, confirms payment and
paid enrolment. Admin changes to cohorts, payments, enrolments, and manual
Membership entitlements require audit history. The detailed approved contract
is `frontend/docs/ADMIN_COHORTS_IMPLEMENTATION_CONTRACT.md`.

## 2026-10-15: Profile will become the signed-in continuity surface

The signed-in redesign will make Profile the place to continue current work and
see saved continuity: Practice, active Microchallenge, Scan and Spot evidence,
saved reading, cohort enrolment, Membership state, and account preferences.
Saved remains a separate reading utility. `/my-caveman` remains the detailed
Scan portrait, subordinate to Profile, while its Spot continuation will be
reconciled with the general Spots surface.

Landing-page refinement remains a separate workstream.

## 2026-10-15: Signed-in work has one orientation layer (partly superseded)

Profile is the account overview and chooses a single continuation from live
account state: an active Practice first, then an active Microchallenge, then a
Spot when a Scan portrait exists, otherwise the Scan. It does not replace the
deeper task surfaces.

Profile, Saved, My Caveman, Spots, Microchallenges, and the signed-in Practice
entry share a compact `Your work` navigation. Its responsive placement is
defined by the later left-navigation decision below.

The shared `Your work` navigation was subsequently removed. The continuity and
truthful state requirements below remain authoritative.

Unavailable account data must never be presented as an empty history. Summary
requests therefore distinguish loading, unavailable, empty, and populated
states. Saved remains the reading shelf; My Caveman remains the detailed Scan
portrait; the portrait-specific Spot route remains a guided entry into the
canonical Spots and Microchallenge journey.

## 2026-10-15: Legal copy follows the implemented data journey

Privacy and Terms now describe public reading, private account work, analytics,
AI-generated reflections, reminders, Membership, Razorpay-ready payments,
cohort enrolment, hard capacity, and waitlists. Accounts and paid offerings are
treated as intended for people aged 18 or older because the product does not
implement parental-consent verification.

Claims governance remains deferred and is not resolved by these legal pages.
The legal copy is a product-accurate implementation draft and should receive
qualified Indian legal review before production launch.

## 2026-10-15: The signed-in workspace uses one left navigation (superseded)

The signed-in orientation layer is a persistent left rail on desktop. It owns
both continuation destinations and Profile-level account destinations, so
Profile must not introduce a second local sidebar. Signed-in content occupies
the remaining viewport column and keeps its own readable maximum width within
that column.

On smaller screens the same hierarchy becomes one compact expandable menu
above the content. It must not become a horizontally scrolling top navigation,
because that obscures the relationship between the current destination and the
rest of the signed-in workspace.

This decision was superseded after evaluating the assembled experience. The
rail gave equal weight to utilities and behavior-change work, duplicated the
public navigation, and made returning to Neurocient feel like entering an
account console.

## 2026-10-15: The signed-in home begins with reflection, not navigation

`/profile` is the personal home after sign-in. It begins with one contextual
reflection question derived from the person's current Practice, active
Microchallenge, latest Spot, or most recently saved idea. It then shows the
developing thread and one next useful step. Scan and My Caveman are optional
sources of evidence, not prerequisites or primary signed-in destinations.

There is no second signed-in top bar or persistent left rail. The public global
navigation remains stable; the avatar menu holds account utilities such as
Membership, saved ideas, preferences, and sign-out. This keeps navigation from
competing with the reason the person returned.

Saved articles are described as ideas the person chose to keep. The newest one
is resurfaced on the personal home and can prompt a reflection, while `/saved`
remains available for the full collection. Neurocient must not imply that an
article is relevant because of an algorithm when the only signal is the
person's own save.

Loading, unavailable, empty, and populated account states remain distinct. A
failed request must not be rendered as an empty personal history.
