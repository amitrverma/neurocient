# Scan result: first implementation

## Contract (2026-09-19)

The approved sequence is landing page -> Scan -> public result -> Neurocient approach -> login -> product. Reading remains available through existing guest limits and authentication gates. This remains a reviewable first design.

The opening result acknowledges what the person has already seen throughout the Scan: the Inner Caveman in ordinary life. It continues that recognition instead of announcing it as a new finding. It is not a behaviour-pattern report.

- If any selected answer reflects an automatic response, acknowledge that the person saw the Inner Caveman in everyday life.
- If every selected answer reflects deliberate choice, say so clearly, acknowledge the good result, and offer a comfortable exit.
- Explain the Inner Caveman as evolved automatic processing operating alongside deliberate reasoning.
- Do not select a dominant drive, infer a personality, rank responses, show a rationality score, or turn planning, organisation, discipline, or another meaningful behaviour into the problem.
- Do not repeat the selected scenarios or manufacture a connection between them. The Scan already presented and interpreted those situations.
- After establishing the result, explain why correct advice may remain incomplete, then introduce IKEA, reinforcement, and the existing product.
- Introduce Spot the Caveman and microchallenges as available tools and Practice as in development.
- The product CTA uses the existing AuthModal and continues to `/tools/spots`. Already authenticated users continue directly. Dismissing login keeps the result. Reading links retain existing limits.

## Interpretation boundary

Canonical option IDs determine whether a response is automatic or deliberate. Positional label lookup exists only for legacy answers without IDs. Stored interpretation fields are not trusted. Incomplete, unknown, or duplicate-scenario answer sets are rejected rather than interpreted.

The result uses the minimum distinction necessary for the product promise: Inner Caveman present or not found in these situations. Internal counts are not shown. A single automatic answer is enough to establish presence; this does not make it a dominant tendency or describe the person as a type.

## Verification

Focused tests cover presence and absence, a single automatic response among deliberate responses, duplicate answers, stale labels, unknown IDs, result copy, CTA behaviour, login dismissal, signed-in continuation, retake, malformed state recovery, and preservation of an unfinished Scan. Targeted lint and the production build are required.

Browser validation remains pending because the implementation session exposed no connected browser. Component and route tests use a mocked authentication boundary and do not certify real login, backend persistence, or responsive appearance.
