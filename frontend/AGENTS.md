# AGENTS.md

## Purpose
This guide defines how to evolve Neurocient Labs pages and long-form insight articles.
Primary goal: improve clarity, readability, and engagement without altering author-provided meaning.

The current landing page in `src/app/components/LandingPage.tsx` is the site-wide reference for upgraded copy, IA, typography, layout, and color use.

## Scope
Applies to:
- top-level marketing and resource pages under `src/app/**/page.tsx`
- shared site components under `src/app/components/**`
- `src/content/insights/*.mdx`
- `src/app/insights/[slug]/page.tsx`
- `src/app/globals.css`

Do not apply article-specific styling globally unless explicitly requested. Site-wide utilities may be added only when they support repeated page patterns and match the landing page system.

## Non-Negotiables
- Preserve article content meaning. If user says "do not modify content", do not rewrite claims or arguments.
- Prefer structure/presentation changes over wording changes.
- Save MDX files as UTF-8. Avoid cp1252 encoding artifacts, replacement characters, and mojibake.
- Keep changes scoped to the target article when experimenting.
- Do not overwrite existing user edits. Inspect dirty files before changing them.
- Fix visible mojibake when touching nearby copy, but avoid broad copy rewrites unless requested.

## Brand Background Colors
- Use only two brand background colors for page and section backgrounds: white/background (`--background: #ffffff`, exposed as `--color-background`) and `brand-dark` (`--color-brand-dark: #042a2b`), as defined in `src/app/globals.css`.
- Do not introduce additional background color treatments unless the user explicitly requests them.

## Landing Page Design System
Use the current landing page as the default direction for non-article page upgrades:
- Layout: full-width white or brand-dark sections with constrained inner containers (`max-w-6xl`), generous vertical rhythm, and clear section sequencing.
- Typography: serif headlines with strong hierarchy; Montserrat/sans for labels, navigation, metadata, buttons, and dense UI copy.
- Headlines: prefer specific, editorial lines over generic page titles. Use italic accent spans sparingly for meaningful pivots.
- Section labels: use the landing-page pattern of small uppercase sans text, wider tracking, and a thin rule.
- Copy rhythm: favor short paragraphs, line breaks for emphasis, and strong narrative progression over dense blocks.
- Cards: keep cards compact, purposeful, and no more than `rounded-lg` unless an existing component requires otherwise.
- Buttons: prefer rounded full CTAs for primary page actions; pair text with lucide icons when helpful.
- Color: use brand tokens (`brand-dark`, `brand-primary`, `brand-secondary`, `brand-accent`, `brand-teal`) rather than ad hoc hex values.
- Backgrounds: keep section backgrounds to white or brand-dark. Use borders, rules, and text color for hierarchy instead of extra background fills.
- Imagery: use real product/framework/site assets where useful; avoid decorative-only visuals.

## Site Upgrade Strategy
When upgrading the rest of the website after the landing page refresh:
1. Inventory the target page purpose, primary user question, current CTAs, and downstream routes.
2. Preserve factual meaning first, then tighten IA and presentation.
3. Rebuild the page around landing-page patterns: section label, editorial headline, concise intro, high-signal modules, and clear CTA.
4. Replace generic centered hero/card grids where they feel old, especially on `about`, `resources`, `insights`, `diagnostics`, `books`, `tools`, and legal/support pages.
5. Unify repeated motifs into small shared helpers only after at least two pages need the same pattern.
6. Keep interactive tool pages denser and more utilitarian than marketing pages, but still align typography, colors, spacing, and buttons.
7. Verify mobile text wrapping, card density, nav spacing, and contrast against both white and brand-dark sections.

## Page Priority Notes
- `about`: convert from plain article block to origin/mission narrative using the landing-page editorial rhythm.
- `resources`, `insights`, `diagnostics`, `books`: replace generic centered titles and large rounded cards with clearer IA and compact, scannable modules.
- `inner-caveman`: align long-form typography with the premium article system and remove visible mojibake.
- `tools`: keep dashboard utility, but update headings, cards, empty states, and CTAs to match the new system.
- `Navbar` and `Footer`: align borders, background treatment, link hierarchy, and mobile menu with the refreshed page style.

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
- premium reference modules, such as a Further Reading table

Avoid:
- overdecorating the full article background unless requested
- adding distracting nav widgets if user flags distraction

## Variant Pattern (Recommended)
- For newer long-form insight articles, default to `typographyVariant: "prologue"` unless a different treatment is explicitly needed.
- Treat `prologue` as the shared premium long-form typography system, not as a one-off style for `the-past-is-prologue`.
- Add `typographyVariant: "name"` in article frontmatter when a genuinely separate article treatment is needed.
- In `src/app/insights/[slug]/page.tsx`, compute class:
  - `prose prose-article prose-variant-${typographyVariant} max-w-none`
- Implement styles in `globals.css` under:
  - `.prose-article.prose-variant-name { ... }`

The `prologue` variant is the default baseline for new premium essays. Keep experiments isolated only when a piece needs something materially different.

## Lists and Line Breaks
If user requests "separate lines without bullets":
- Use plain lines with `<br />` inside wrapper blocks.
- Prefer the shared utility wrapper:
  - `<div className="article-line-stack">...</div>`
- Legacy `prologue-line-stack` is still supported for backward compatibility.
- Do not render `ul/li` bullets.

## Further Reading Conventions
Preferred rich format for dense educational articles:
- table with columns `Author` and `Work`
- clear row separators
- responsive behavior on mobile
- Prefer the shared wrappers:
  - `.article-reading-list`
  - `.article-reading-table`
- Legacy `prologue-reading-list` / `prologue-reading-table` remain supported.

## QA Checklist Before Finalizing
- Article renders without encoding artifacts or mojibake.
- No unintended global style regressions.
- Audio placement matches request.
- Excerpt is compelling and aligned with article thesis.
- No duplicate separators, such as `hr` plus heading border creating double lines.
- New component/style references are fully removed if reverted later.
- Upgraded pages retain the landing-page visual language on mobile and desktop.

## Quick Workflow
1. Inspect the current landing page, similar existing pages, and current prose styles.
2. Add or update content, IA, and page structure.
3. If needed, add scoped shared utilities or variant-scoped typography in `globals.css`.
4. Wire variant behavior in `page.tsx` only.
5. Verify with grep/status and visual sanity checks.
