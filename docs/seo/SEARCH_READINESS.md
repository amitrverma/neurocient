# Neurocient search readiness

Status: repository baseline implemented and canonical sitemap accepted in Google Search Console as of 2026-11-11.

This is the technical implementation and release checklist. The governing discovery strategy, content inventory, authority plan, measurement model, and phased roadmap live in [DISCOVERY_STRATEGY.md](./DISCOVERY_STRATEGY.md).

## Outcome

Neurocient should be discoverable for the concrete problems it explains, not only for its brand name. Public search pages must be crawlable, indexable, internally linked, self-canonical, and useful for a specific search intent. Personalized, administrative, authentication, and result pages must stay out of search.

Google Analytics is not a prerequisite. Google Search Console and PostHog have separate roles:

- Search Console measures visibility before a visit: queries, impressions, clicks, CTR, position, indexing, and search enhancements.
- PostHog measures what happens after the visit: Scan, signup, Practice, and return behavior.

## Repository-owned configuration

The repository owns these controls:

- `/robots.txt` permits public crawling, blocks API routes, and declares `/sitemap.xml`.
- `/sitemap.xml` contains canonical public pages, every Insight, and topic archives with at least two articles.
- Insight `lastmod` values use `updated` frontmatter when present, otherwise the publication `date`. Deployment time is not presented as a content update.
- Public discovery pages emit a self-referential canonical URL.
- Admin, account, saved-content, authentication, personalized-tool, and diagnostic-result routes emit `noindex, nofollow`.
- Legacy duplicate routes use permanent redirects.
- Organization, person, website, and article structured data describe the visible page content.
- Metered Insights declare `isAccessibleForFree: false` and identify the metered article section. This is required because some readers must register or subscribe for access.
- `/llms.txt` provides an optional Markdown map of Neurocient's public explanations. It is not a ranking control and does not replace HTML, structured data, robots, or the sitemap.
- `GOOGLE_SITE_VERIFICATION` can supply an HTML verification token when DNS verification is unavailable. It is optional and must not replace an already working Domain-property verification.

When an Insight receives a substantial update, add an ISO `updated: "YYYY-MM-DD"` field to its frontmatter. Do not change this field for formatting-only edits.

## Search Console account checklist

These checks live outside the repository and must be completed or confirmed in the production Search Console account:

1. Create or retain a **Domain property** for `neurocient.com` and verify it with a DNS TXT record.
2. Keep `https://neurocient.com/` as the preferred public host. Production currently permanently redirects HTTP to HTTPS and `www` to the apex host.
3. Submit exactly `https://neurocient.com/sitemap.xml` under **Indexing → Sitemaps**. Remove obsolete sitemap submissions if they point at another host or path.
4. Use URL Inspection after each material deployment on:
   - `https://neurocient.com/`
   - `https://neurocient.com/insights`
   - one newly published Insight
   - `https://neurocient.com/inner-caveman`
   - `https://neurocient.com/diagnostics/caveman-scan`
5. In the rendered HTML from URL Inspection, confirm the selected canonical matches the declared canonical and that a representative Insight contains the article body, not only an access gate. This is especially important because Insights use metered access.
6. Review **Page indexing** for accidental `noindex`, duplicate/canonical disagreements, soft 404s, blocked resources, and crawled-but-not-indexed pages.
7. Review **Core Web Vitals**, HTTPS, structured-data enhancements, Manual Actions, and Security Issues. Treat regressions as release defects, not content-reporting curiosities.
8. Keep account ownership narrow: at least two trusted owners, and only the permissions each person needs.
9. Do not use temporary removals as a canonicalization tool. Correct redirects, canonicals, or `noindex` at the source.

## Non-brand search strategy

The primary unit is a real question or situation. Each important intent should have one clearly preferred page; several near-duplicate articles should not compete for the same query.

| Search intent cluster | Example non-brand questions | Preferred Neurocient destination |
| --- | --- | --- |
| Knowing–doing gap | Why do I know what to do but still not do it? Why don't habits stick? | Homepage, `/insights/willpower`, `/insights/wait-but-why` |
| Endless scrolling | Why can't I stop scrolling? Why do I doomscroll at night? | `/insights/doomscrolling` |
| Anticipatory worry | Why do I worry before anything happens? Why does uncertainty feel dangerous? | `/insights/anticipatory-anxiety` |
| Replaying conflict | Why do I replay arguments? How do I stop rehearsing a conversation? | `/insights/replay-arguments` |
| Social comparison | Why do I compare myself with everyone? Why does social media make me feel behind? | `/insights/why-we-compare` |
| Stress eating | Why do I crave sugar when stressed? Why do deadlines make me snack? | `/insights/stress-comfort-food` |
| Exercise resistance | Why is it hard to exercise consistently? Why does exercise feel like effort? | `/insights/struggle-to-exercise` |
| Criticism and feedback | Why does criticism hurt so much? Why do performance reviews trigger anxiety? | `/insights/negativity-bias`, `/insights/performance-reviews` |
| Planning and deadlines | Why do projects always run late? What is the planning fallacy? | `/insights/planning-fallacy` |
| Team silence and hierarchy | Why don't people speak up in meetings? Why does team building feel forced? | `/insights/silent-team`, `/insights/team-building` |

For each cluster:

1. Answer the concrete question in the title, opening paragraph, headings, and summary without keyword stuffing.
2. Explain the mechanism precisely and cite trustworthy sources where the claim needs support.
3. Link from the relevant archive, related Insights, the Inner Caveman guide, and the appropriate product surface.
4. Give each page a distinct title, description, canonical, and purpose.
5. Update an existing strong page before creating a thin page for a minor keyword variation.

## Weekly Search Console operating rhythm

Use the Search results Performance report and exclude queries containing `neurocient` to focus on discovery demand.

- **High impressions, low CTR:** improve the title and description so they answer the actual query; do not promise content the page does not contain.
- **Positions 5–20:** strengthen the page's answer, evidence, headings, internal links, and coverage of adjacent subquestions.
- **Clicks with poor product progression:** use PostHog to inspect the landing-page-to-Scan-or-Insight journey.
- **Several pages appearing for one query:** choose the best page, consolidate overlap, and clarify internal links and canonicals.
- **Queries with no good destination:** add them to the editorial backlog only when Neurocient has a substantive, evidence-backed explanation.
- **Falling impressions across many pages:** check indexing, manual actions, deployment changes, server availability, and Core Web Vitals before rewriting content.

Record a monthly baseline for non-brand clicks, non-brand impressions, CTR, indexed public URLs, top landing pages, and the percentage of organic visitors who reach a meaningful Neurocient step.

## AI-agent and AI-search features

The checks shown by current audits are not all Google Search requirements:

- **Google AI Overviews and AI Mode:** Google states that there are no additional technical requirements beyond ordinary Search eligibility, indexability, snippets, and helpful content.
- **WebMCP:** an emerging browser API for exposing page actions as callable tools. Neurocient has not defined which actions an autonomous agent may perform, what confirmation is required, or how sensitive Scan and account data must be protected. Do not register contact, authentication, Scan, payment, or account forms merely to satisfy an unscored audit.
- **ARD (`/.well-known/ard.json`):** a discovery manifest for actual callable resources such as MCP servers, A2A agents, skills, or APIs. Neurocient does not currently publish such a resource, so an ARD manifest would be misleading.
- **`llms.txt`:** an optional discovery map. Neurocient publishes one, but no search-ranking or citation benefit should be assumed.

Revisit WebMCP only after an explicit product and security contract defines the allowed tool, actor, confirmation boundary, data exposure, failure behavior, and audit trail. Revisit ARD when Neurocient publishes a genuine agentic resource that needs discovery.

## Release verification

After deployment, verify these URLs without an authenticated session:

```text
https://neurocient.com/robots.txt
https://neurocient.com/sitemap.xml
https://neurocient.com/llms.txt
https://neurocient.com/
https://neurocient.com/insights/doomscrolling
https://neurocient.com/profile
```

Expected results:

- public pages return `200` with their own canonical URL;
- the profile page returns `200` or redirects appropriately and contains `noindex`;
- sitemap URLs return canonical content or a deliberate permanent redirect;
- `llms.txt` is Markdown and contains only public discovery links;
- no public page inherits the homepage canonical.
