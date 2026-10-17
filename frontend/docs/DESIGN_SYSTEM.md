# Neurocient Design System

## Purpose

Neurocient should feel like one product across the landing page, Scan, insights,
Practice, tools, programs, and account surfaces. Individual journeys may change
composition to suit their task, but they must not create a separate typography,
navigation, color, or interaction foundation.

The system is mobile-first and text-rich. Consistency should make substantial
ideas easier to enter; it must not be used as a reason to remove substance.

## Product-wide foundations

### Typography

Use semantic roles rather than choosing fonts per screen:

- **Display:** Playfair Display for page and major section headings.
- **UI:** Inter for navigation, controls, labels, metadata, and explanatory body copy.
- **Reading:** the system editorial serif stack exposed as `--font-reading`, only for
  long-form article prose where sustained reading benefits from it.

Compatibility variables for the retired Montserrat and Quattrocento roles remain
temporarily available in `globals.css`, but both resolve to the shared display/UI
families. Do not introduce another font family without a documented product reason.

Shared hierarchy classes:

- `.page-title`: the primary title of a route or full-screen product step.
- `.page-section-title`: a major section transition within a long page.
- `.page-lede`: the opening explanation beneath a page title.
- `.page-eyebrow`: short navigational or contextual labels.

Avoid new arbitrary type sizes when one of these roles expresses the same meaning.
Small supporting copy may use Tailwind's standard scale. Meaningful labels should
not be smaller than `0.75rem`.

### Color

Use the existing brand tokens. Color communicates role:

- dark teal: primary text and decisive actions;
- red: primary emphasis and active state;
- light teal: orientation, secondary emphasis, and focus;
- yellow: contrast, connective rules, and selected supporting emphasis;
- white and warm off-white: reading surfaces.

Do not create route-local near-duplicates of these colors unless contrast evidence
or a specific information state requires it.

### Shape and spacing

- Prefer open page sections, rules, and background changes for narrative content.
- Use rounded containers for interactive choices, saved objects, or bounded tools,
  not as a default wrapper around every paragraph.
- Keep one primary reading path on mobile.
- Use the shared `max-w-6xl` product frame for top-level pages unless the task is a
  focused flow or long-form reading surface.
- Internal destination pages inherit the actual hero hierarchy of the navigation
  destinations: `.surface-hero` composition, a wider headline column, shared
  eyebrow/title scale, and a compact supporting column. `.surface-page` alone
  does not establish visual alignment. Account and support destinations may use
  the shorter `.utility-hero` variant so their task content remains close.
- Results, questionnaires, and long-form articles may use a narrower task or
  reading composition without creating a separate visual system.
- Account and other task-first screens put their usable controls and current
  state near the top. They share typography and color with destination pages,
  but must not spend the first viewport on a promotional hero.

## Information architecture

The product journey is:

1. See it: Scan and diagnostics.
2. Understand it: Inner Caveman and insights.
3. Work with it: Practice.
4. Support it: spots, microchallenges, and other tools.
5. Go deeper: programs.

Primary navigation names destinations by their user-facing purpose. Account-owned
utilities such as Saved and Profile belong in the account menu. The navbar, footer,
sitemap, and page titles must use consistent names for the same destination.

Every route owns exactly one `<main>` landmark. The application shell supplies
navigation and spacing, not a second main landmark. Primary navigation is available
throughout the site and exposes `aria-current="page"` for orientation.

## Journey-specific variation

The landing page, Scan, and Practice may vary pacing and composition:

- Landing may use larger editorial display moments.
- Scan should keep one readable scene and one decision at a time.
- Practice should remain calm, spacious, and progressively disclosed.
- Insights may use the reading font for article prose.

These are modes of one product, not separate brands. They inherit the same font
roles, colors, focus treatment, control vocabulary, and global navigation.

## Adding or changing a screen

Before introducing a local pattern:

1. Identify the screen's place in the product journey.
2. Reuse the shared typography role that matches the content's meaning.
3. Reuse an existing action, card, label, and feedback treatment where semantics match.
4. Check the navbar, footer, sitemap, and metadata if a destination changes.
5. Verify at narrow mobile, tablet, and desktop widths.
6. Record a design decision when the change creates or alters a product-wide rule.
