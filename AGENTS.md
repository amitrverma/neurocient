# AGENTS.md

## Purpose
This repository is evolving Neurocient from a content portal into a broader behavior-change product. Future work must preserve the conceptual spine behind that expansion, especially the Practice product and the IKEA framework.

The most important product reference is:

- `frontend/docs/practice/IKEA_FRAMEWORK.md`
- `frontend/docs/practice/PRACTICE_PRODUCT_CONTEXT.md`
- `frontend/docs/practice/CHALLENGE_AUTHORING.md`
- `frontend/docs/practice/DECISIONS.md`

Read those before modifying anything under:

- `frontend/src/app/practice/**`
- `frontend/src/content/challenges/**`
- any future practice, challenge, reinforcement, reminder, or behavior-change flow

## Product Direction
The Practice product is not a generic habit tracker, productivity tool, or quiz library.

The self-help app market is saturated. Practice is intended to create a niche through:

1. exceptional UI/UX
2. emotionally lightweight behavior change

For Practice work, cognitive load is a product constraint. The experience should feel easier, calmer, and more precise than typical self-help/productivity apps.

It is a guided behavior-change experience built around:

1. **Identity**: the self-story and cognitive dissonance around the behavior.
2. **Knowledge**: what we understand about why we do what we do; the emotional logic beneath behavior.
3. **Environment**: the context that makes actions easier or harder.
4. **Action**: the smallest concrete move that fits the real cause.
5. **Reinforcement**: repeated retrieval over time because forgetting is real.

Short form: **IKEA + Reinforcement**.

## Non-Negotiables
- Neurocient is a mobile-first product. Design and implement the mobile experience as the default, then expand deliberately for desktop. Desktop support remains required, but it must not drive the initial information hierarchy, interaction model, or layout decisions.
- Neurocient is intentionally text-rich. Do not treat removing substance as the default accessibility solution. Use exceptional hierarchy, pacing, typography, grouping, progressive disclosure, interaction, and visual storytelling to make dense ideas easy to enter and understand.
- Do not reduce Practice to a list of tips.
- Do not start Practice flows with action unless the user explicitly asks for that; action comes after Identity, Knowledge, and Environment.
- Do not make each challenge a one-off page if it can be expressed through shared challenge data and reusable flow components.
- Do not force the Practice surface to match the portal's existing brand-heavy UI. It is allowed to have a calmer, more minimal visual language.
- Preserve emotional safety. The tone should reduce shame and make change feel possible.
- Keep progress meaningful. Prefer moments of recognition, retrieval, environmental changes, and tiny actions over raw streak mechanics.
- Prefer progressive disclosure: one decision or recognition at a time.
- Prefer concrete action/lack-of-action moments over abstract labels.
- Trust the user. Avoid instructional microcopy for obvious interactions; use copy for meaning, not hand-holding.

## Current Architecture
The previous localStorage Practice MVP has been retired. The current `/practice` route is a clean shell for the rebuilt experience.

Future Practice work should reuse existing repo infrastructure where possible:

- auth and account creation
- membership/subscription gates
- user preferences
- WhatsApp support
- microchallenge assignment/logging/progress
- Spot the Caveman
- insight access
- `IkeaWorksheet` and `IkeaTracker`

Do not create a parallel auth, progress, reminder, or reinforcement system unless the existing systems genuinely block the product experience.

## Updating Context
When product thinking changes, update the reference docs in `frontend/docs/practice/` in the same work session. These docs are part of the implementation, not optional commentary.

When adding a new challenge, update `CHALLENGE_AUTHORING.md` if the schema, flow, or content conventions change.

When making a meaningful product/design decision, add it to `DECISIONS.md` with the date.

## Verification
For frontend work, run:

```powershell
npm.cmd run build
```

`npm.cmd run lint` may currently fail on unrelated existing issues. If lint fails, inspect whether any reported issue belongs to the files you changed.
