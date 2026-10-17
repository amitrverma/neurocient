# Scan result and My Inner Caveman

## Contract (2026-10-17)

The Scan exists to bring the Inner Caveman into view through situations the
person recognises. Its result must not infer a drive, type, trait, recurring
movement, or person-level pattern from the answer set.

Personalisation comes only from the person's selected answers:

> completed Scan -> selected Inner Caveman answers -> answer-specific
> reflections -> contrast with the more deliberate response -> save and
> continue in My Inner Caveman

## Public result

- Identify scenarios in which the selected option is authored as an Inner
  Caveman response.
- Select a small, varied sample of those exact answers for reflection.
- Keep the sample stable for the completed Scan; it may vary between answer
  sets but must not change merely because the page refreshed.
- For each reflection, show the situation, the answer selected, its direct
  mirror statement, the authored deliberate contrast, and one question.
- Do not connect one selected answer to another or claim a shared cause.
- Do not calculate a score, rank, dominant drive, profile, or prediction.
- If no Inner Caveman response was selected, say so honestly and do not invent
  reflection material.

The complete public result remains visible before authentication. Authentication
creates continuity; it does not unlock the meaning of the result.

## My Inner Caveman

`/my-caveman` is the logged-in continuation of the same experience, not a deeper
diagnostic report. It shows the fuller set of relevant Scan answers and can grow
through situations the person records from real life.

The conceptual sequence is:

> what I chose in the Scan -> what I notice in real life -> what I understand ->
> what I try

The main public action is **Save to My Inner Caveman**. After authentication the
completed Scan is saved and the user continues to `/my-caveman` with the same
visual and narrative foundation. From there, **Record a real-life situation**
continues to the canonical Spots tool at `/tools/spots`.

## Persistence

New saved sessions use `selected-response-1` and `answer-reflections-1`. The
stored interpretation contains canonical selected option IDs and the stable
reflection IDs only. It does not persist a generated drive or person-level
portrait. Existing database field names remain a compatibility detail.

## Verification

Focused tests must prove that reflections come only from selected Inner Caveman
answers, the public sample remains stable, deliberate-only answers do not create
a false result, the saved view exposes the fuller set, login dismissal preserves
the public result, and authenticated continuation reaches `/my-caveman`.
