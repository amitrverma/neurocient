# Inner Caveman Scan Authoring Guide

## Purpose

The Inner Caveman Scan is a recognition experience.

Its primary job is to help a person:

1. recognise a recurring lived behaviour in an ordinary moment; and
2. begin appreciating how the Inner Caveman may be shaping that behaviour.

The desired reaction is:

> "I have lived this. I knew I did it, but I had not seen the Inner Caveman inside it."

The Scan is not a personality test, clinical assessment, psychometric instrument, behaviour score, or five-drive quiz. It should let users see themselves first, then use the framework to reveal a more compassionate interpretation.

## Continuity From The Landing Page

The user arrives knowing that common fixes may work briefly and fade, recurring behaviour is not necessarily a personal failure, the Inner Caveman is a useful lens on fast inherited responses, and awareness comes before change.

The Inner Caveman has no agency. It is not a tiny guardian inside the head, an inner character with intentions, goals, a voice, or a plan to protect the person. It is shorthand for a highly efficient automated processing system operating through biological automation: inherited tendencies through which immediate reward, threat, effort, uncertainty, status, belonging, and energy cost can become salient before deliberate thought catches up.

Use this as a content-validation test: if a sentence would require the Inner Caveman to think, speak, care, decide, watch over the person, or intentionally intervene, rewrite it in terms of automatic processing and concrete behaviour. Do not use protection as the default explanation even after removing explicit intention. The system operates according to evolved tendencies; its responses are not necessarily useful in present conditions.

Write:

> The Inner Caveman lens shows why the immediate reward carries more weight.

Do not write:

> Your Inner Caveman wants relief, decides what matters, keeps you safe, or chooses the easier task.

These are authoring constraints, not explanations to give the reader. User-facing copy should demonstrate the contrast through the moment itself. Do not label a passage “The Inner Caveman lens,” disclaim personification, or explain the metaphor after it has already landed. Trust the reader to make the connection.

Scan scenarios must come from behaviour already established on the landing page. Do not add adjacent self-help problems merely to create variety or cover an internal construct.

Current source territory includes:

- waiting to feel ready before starting a project, contacting an old friend, exercising, or trying something new;
- scrolling while knowing something more meaningful needs attention;
- returning to the phone because improvement feels overwhelming;
- comparing clothes, confidence, ease, career, progress, timing, and milestones;
- wondering what one is doing wrong after seeing others progress;
- carrying unfinished or unresolved responsibilities into rest;
- making mental lists while trying to rest;
- scrolling to escape a stressful reality;
- replaying conversations;
- pre-playing social interactions;
- anticipating problems that often never happen;
- making detailed plans, printing them, displaying them, and still not following through;
- losing time to random videos and aimless scrolling;
- trying the gym, healthy food, multivitamins, motivational quotes, goal plans, and screen filters without change sticking;
- sleeping or taking breaks but still waking tired;
- running out of energy before reaching what matters;
- turning meditation, yoga, or journaling into another demand to "rest harder";
- repeated burnout;
- trying routines, productivity systems, or self-help practices that work briefly and fade;
- knowing what to do while still feeling resistance;
- watching someone close struggle with their health and reconsidering one's own;
- realising close relationships have drifted into the bare minimum;
- avoiding conflict or judgment and accepting surface-level relationships; and
- becoming triggered by small things while feeling under pressure all day.

## Language Constraint (2026-09-19)

Avoid "attention", "protection", "flow", "moment", and similar poetic or therapeutic devices in product copy. Describe the situation, what the person selected or did, and the automatic response plainly. For example, prefer "You kept checking the plan instead of starting the report" to "Your attention sought protection from a difficult moment."

"Automatic processing" is the product term for operation without deliberate choice. Do not turn the description of an autonomic system into a claim that these behaviours are all functions of the anatomical autonomic nervous system.

Older terms below such as "protective move" and Watchtower, and existing identifiers such as `ProtectiveMove`, describe the legacy evidence model. They do not establish a protective purpose or prescribe user-facing language. Any schema migration is separate implementation work.

## Result As The Bridge To The Product

The result must complete the landing page's argument by returning the person to the exact situations where their answers brought the Inner Caveman into view, then connecting that recognition to the available platform. It must not infer a drive, recurring response, or person-level pattern from the answer set.

The current result implementation is defined in `RESULT_APPROACH.md`: answer-based reflections and a practical product explanation come before login. Practice is live; do not describe it as in development. Content remains accessible within the existing guest reading limits before login is requested.

## Experience Model

Each Scan moment should follow:

> Concrete lived scene -> honest continuation -> conventional interpretation -> Inner Caveman contrast -> optional science

The visible experience gives the user stories and recognition. The internal evidence layer may notice a Watchtower. Do not reverse that order by starting with a Watchtower and manufacturing a story around it.

## Writing A Scenario

Write in second person and present tense. Give the scene a specific time, place, object, person, physical action, or digital interaction.

Weak:

> You see someone post an achievement.

Better:

> Dinner is over. The plates are still on the table while you sit on the sofa with Instagram open. Someone from college appears in the feed, standing outside a new house with the keys held up for the photograph.

A scenario is a small story:

1. establish the ordinary setting;
2. introduce the small event;
3. show the reader's attention changing; and
4. stop just before the automatic response is explained.

Do not announce the target behaviour inside the narration. Let the choices reveal what happens.

Use sensory detail selectively. The goal is vivid recognition, not literary performance. Every detail must make the moment easier to inhabit.

The question should naturally continue the scene, for example:

- "What happens inside you next?"
- "Which thought arrives first?"
- "What do you find yourself doing?"
- "What does the next half-hour usually look like?"

Do not use the same question mechanically for all 12 scenarios.

## Visual Story Beats

A scenario should remain prose-led. The current Scan does not render embedded
notification or moment cards when the authored scene already communicates the
same cue.

Reintroduce a small code-native visual only through a deliberate product
decision when an object communicates something the prose cannot convey
efficiently.

The visual should:

- add information rather than repeat the surrounding prose;
- appear inside the story at the moment the cue arrives;
- represent an authored object from the scene rather than decorate the page;
- remain legible and meaningful on a narrow screen;
- use structured scenario data so the treatment can be reused; and
- support, not replace, the written scene.

Use visuals selectively. Do not give every scenario an illustration by default, and do not turn the Scan into a sequence of generic stock images.

## Writing Choices

Use four choices by default. A fifth is acceptable when it protects honesty with a credible low-activation or non-activation path.

Choices should:

- continue the story;
- describe a recognisable thought, feeling, action, or lack of action;
- focus on what arrives first;
- be similar in length and emotional attractiveness;
- be distinct enough to answer without analysis;
- avoid abstract psychological labels;
- avoid one obviously wise, regulated, or therapeutic response; and
- include a truthful non-activation response when the moment may simply pass.

Do not use a polished Rational Mind paragraph as the visibly correct answer. If a grounded response belongs, write it in the same natural register as the other choices.

Do not consistently place the grounded continuation last. Vary its display
position across the set, and phrase it as an ordinary observable move rather
than a summary of the lesson. Reordering must preserve the option's canonical
evidence identity.

The Scan should not merely confirm that the user compares, scrolls, delays, or worries. It should help them notice what that loop looks like as it unfolds.

## Watchtowers Are The Hidden Evidence Layer

The five Watchtowers remain useful internal constructs:

- Horizon: Safety & Survival;
- Campfire: Affiliation & Belonging;
- High Ground: Status & Hierarchy;
- Home Path: Mate & Bond Security; and
- Care Circle: Kin Care.

Write the lived scene truthfully first. Assign the Watchtower second.

Never add unnatural answer choices so one scenario can cover all five Watchtowers. A scenario about another person's milestone may naturally provide Status evidence. It does not also need artificial Safety, Belonging, Bond, and Kin answers. Other Watchtowers should appear in scenes where they genuinely belong.

Each option may store a primary evidence target, evidence strength, an optional secondary target only when both concerns are genuinely present, and a short internal rationale.

One answer is a concrete reflection point, not evidence for a person-level conclusion. Do not aggregate answers into a drive or portrait.

Watchtower names and mappings remain internal unless a public experience deliberately teaches and earns the metaphor.

## Legacy Evidence Metadata

The metadata below remains attached to authored options for compatibility with older stored sessions. The current result and My Inner Caveman experiences do not aggregate it into a portrait, drive, or person-level interpretation. New product behavior may use only the canonical option identity and direct mirror statement.

The result must not present a Caveman answer count, Caveman-versus-Modern percentage, or rationality score. Internal editorial rules for selecting an appropriate result are documented in `RESULT_APPROACH.md`; they do not establish psychological categories. A selected option records several distinct layers:

1. the concrete situation;
2. the protective move visible in the continuation;
3. a possible concern underneath, only when supported;
4. optional Watchtower evidence, only when the scene and response genuinely earn it;
5. evidence strength;
6. a natural sentence that can be mirrored back to the person; and
7. the possible later cost.

The current protective-move vocabulary is:

- seek immediate relief;
- restore certainty or control;
- monitor the social field;
- create protective distance;
- override an internal signal;
- discharge accumulated pressure;
- turn the moment into a verdict about oneself;
- respond flexibly without following the protective move.

Do not treat a flexible response as proof that the Caveman or a Watchtower is absent. It describes what happened in one moment.

Do not use recurrence across scenarios to name a primary move, supported drive, or absent drive. Watchtower and protective-move fields are legacy authoring metadata, not current result logic.

The canonical option-level map lives in `frontend/src/app/diagnostics/caveman-scan/scanEvidence.ts`. Update it whenever scenario options change. The scan validates that every active option has a corresponding evidence entry.

## Result And Product Access

The result must deliver meaningful recognition before authentication.

The public result selects a stable sample only from scenarios where the chosen option is an Inner Caveman response. It reflects the chosen answer, its direct mirror, the deliberate contrast from the same scenario, and one question. It does not connect answers or infer what response is "best supported." If every answer reflects deliberate choice, say so without inventing a hidden problem. The result must fulfil the Scan promise before asking for login.

The product CTA opens the existing authentication modal, then continues to `/my-caveman`, whose persistence flow saves the completed answers and stable reflection identities. Authenticated users continue directly. Dismissing login preserves the public result. Do not claim the result has been saved before that persistence flow runs.

Route responsibilities:

- `/diagnostics/caveman-scan` always opens with a short explanation of the Scan before the person starts or resumes the questions;
- `/diagnostics/caveman-scan/result` contains a stable sample of answer-based reflections, the Neurocient approach, and the transition to saved continuity;
- `/my-caveman` continues the same experience with the fuller relevant answer set; and
- `/tools/spots` remains the single tool for real-life evidence capture. The legacy `/my-caveman/spot` URL redirects there.

Do not expand the result inline beneath the Scan. The public result reads and validates the completed local answers using canonical option identities. Reading links continue through existing guest limits and login gates; no new entitlement rules are introduced here.

Never ask a person to create an account merely to discover whether the Scan found anything.

## Result Narrative

The result must complete the same argument begun on the landing page. Use this order:

1. state that the Scan brought the Inner Caveman into view without assigning a type;
2. show a stable sample of the person's exact Inner Caveman answers;
3. contrast each with the authored deliberate response from the same scenario;
4. attach one reflection question to each selected situation;
5. explain how Neurocient carries recognition into real life; and
6. offer saved continuity only after the complete public result is visible.

Do not replay full scenarios. Use short mirror statements tied to canonical selected answers. Do not create a personalised headline from a synthesis of the answers.

## Immediate Reflection

The reflection is where Neurocient adds value. The user often already knows that they compare, scroll, delay, worry, or keep planning. Repeating the behaviour back is not enough.

Contrast two readings of the same moment.

### The usual take

Name the familiar judgment or conventional solution without caricaturing it: stop comparing, put the phone away, be more disciplined, stop overthinking, make a better plan, become consistent, or learn to relax.

### The Inner Caveman take

Reveal what a fast inherited response makes salient before deliberate thought catches up. The contrast should reduce shame, explain why the pull makes sense, connect an older bias to the modern situation, show the mismatch, remain specific, avoid diagnosis, and avoid rushing into advice.

Example:

> **Usual take:** Comparison is a bad habit. Stop measuring yourself against other people.
>
> **Inner Caveman lens:** In a small group, changes in relative position could affect influence, opportunity, and security. That inherited sensitivity makes other people's progress immediately salient. A modern feed gives it an endless stream of people appearing to move ahead.

End with one retrievable contrast:

> Her achievement is information about her life. The fast comparison system turns it into information about yours.

The purpose is an "oh" moment, not a complete lesson or behaviour prescription.

The immediate reflection must answer **why this happens**, not merely redescribe the trade-off. Connect the modern moment to the older condition that made the response useful: uncertain future reward, energy cost, available food, social position, belonging, bond security, threat detection, or another genuinely supported pressure. Then return to the concrete modern scene. This establishes the Inner Caveman in the moment and fulfils the landing-page promise.

Keep the layers distinct:

1. **Immediate reflection:** the usual advice, the older logic, and the modern mismatch in clear human language.
2. **Want the science?:** optional evolutionary psychology, behavioural science, and neuroscience that deepen the explanation with careful claims and sources.

Do not make the first layer so thin that the scientific layer is the only place the user learns why they responded as they did.

## Optional Science

Deeper science should remain optional so the main Scan stays emotionally light.

Each science note may include a concise title, one-line summary, relevant concept, possible ancestral function, modern mismatch, and short concluding reframe.

Scientific language must be careful and supportable. Do not use neuroscience terminology for authority or make absolute claims such as "rank determined survival" or "this brain region causes comparison." Prefer qualified language such as "could affect," "may have helped," "can become sensitive to," and "research suggests."

All factual claims intended for publication require source verification. Do not fabricate citations.

## Designing The Set Of 12

Across the set:

- use only behaviour established on the landing page;
- vary work, relationships, health, attention, rest, and digital life;
- avoid making every scene about work or social media;
- give every scenario a distinct lived moment and emotional mechanism;
- let Watchtower coverage emerge naturally;
- do not distort scenes to balance drive counts;
- keep the narrative voice consistent;
- design mobile-first, with one readable scene and one decision at a time; and
- preserve an approximately five-minute experience.

The repeated experience should be:

> "I have lived this" -> "That is what happens next" -> "I had not seen the Inner Caveman inside it."

## Authoring Record

For every scenario, document:

1. Landing-page source.
2. Recognition purpose.
3. Concrete second-person scene.
4. Natural continuation question.
5. Four choices by default.
6. Internal target, strength, and rationale per option.
7. Conventional take.
8. Inner Caveman contrast.
9. One retrievable insight.
10. Optional science note and claims requiring verification.

## Quality Gate

Before approving a scenario, verify:

1. Does it come directly from the landing page?
2. Can the reader picture themselves in the moment?
3. Does it contain concrete setting or action details?
4. Does it stop before explaining the behaviour?
5. Do the choices continue the scene?
6. Is any answer conspicuously healthier or more intelligent?
7. Are we forcing an unrelated Watchtower into the choices?
8. Does the conventional take reflect advice people actually hear?
9. Does the Inner Caveman contrast add a genuinely new perspective?
10. Does it reduce shame without excusing or romanticising the behaviour?
11. Is the science cautious and verifiable?
12. Will the insight help the user spot the Inner Caveman a little earlier next time?

If any answer is no, revise the scenario before publishing it.
