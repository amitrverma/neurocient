# AGENTS.md

## Purpose
This guide defines how to add and style long-form insight articles in this repository.
Primary goal: improve readability and engagement without altering author-provided meaning.

## Scope
Applies to:
- `src/content/insights/*.mdx`
- `src/app/insights/[slug]/page.tsx`
- `src/app/globals.css` (only scoped article variants)

Do not apply article-specific styling globally unless explicitly requested.

## Non-Negotiables
- Preserve article content meaning. If user says "do not modify content", do not rewrite claims or arguments.
- Prefer structure/presentation changes over wording changes.
- Save MDX files as UTF-8 (avoid cp1252 encoding artifacts like `�`).
- Keep changes scoped to the target article when experimenting.

## Standard Article Frontmatter
Use these fields unless user requests otherwise:
- `title`
- `excerpt`
- `description`
- `date` (ISO format `YYYY-MM-DD`)
- `author`
- `tags`
- `keywords`
- `conversation` (optional but preferred when audio exists)
  - `blobName`
  - `duration`
  - `reflection`
- `typographyVariant` (optional, for article-specific visual treatment)

## Audio Placement Rules
- Default behavior renders audio near top from frontmatter `conversation`.
- If article requires delayed audio placement:
  - add `<ConversationBreak />` in MDX where audio should appear
  - in `page.tsx`, suppress top audio for that variant and inject `ConversationBreak` component
- Keep this behavior variant-scoped.

## Typography + IA Strategy
When article is "dry" or dense, improve scanability with:
- pull quotes for key pivots
- line-stacks (one thought per line, no bullets if requested)
- stronger section rhythm (heading hierarchy, separators, spacing)
- selective emphasis (`strong`) only for high-signal lines
- premium reference modules (e.g., Further Reading table)

Avoid:
- overdecorating the full article background unless requested
- adding distracting nav widgets if user flags distraction

## Variant Pattern (Recommended)
- Add `typographyVariant: "name"` in article frontmatter.
- In `src/app/insights/[slug]/page.tsx`, compute class:
  - `prose prose-article prose-variant-${typographyVariant} max-w-none`
- Implement styles in `globals.css` under:
  - `.prose-article.prose-variant-name { ... }`

This keeps experiments isolated to one article.

## Lists and Line Breaks
If user requests "separate lines without bullets":
- Use plain lines with `<br />` inside wrapper blocks.
- Do not render `ul/li` bullets.

## Further Reading Conventions
Preferred rich format for dense educational articles:
- table with columns `Author` and `Work`
- clear row separators
- responsive behavior on mobile

## QA Checklist Before Finalizing
- Article renders without encoding artifacts (`�`, mojibake).
- No unintended global style regressions.
- Audio placement matches request.
- Excerpt is compelling and aligned with article thesis.
- No duplicate separators (e.g., `hr` + heading border creating double lines).
- New component/style references are fully removed if reverted later.

## Quick Workflow
1. Inspect similar existing article MDX and current prose styles.
2. Add/update article MDX with frontmatter + structure.
3. If needed, add variant-scoped typography in `globals.css`.
4. Wire variant behavior in `page.tsx` only.
5. Verify with grep/status and visual sanity checks.

