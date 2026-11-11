# Neurocient discovery strategy and map

- Status: active operating document
- Owner: Neurocient product and editorial team
- Last reviewed: 2026-11-11
- Review cadence: monthly, with a full quarterly remap

This is the source of truth for how Neurocient becomes discoverable. It joins search strategy, AI discovery, content architecture, external authority, measurement, and the existing article inventory in one plan. The technical implementation checklist lives in [SEARCH_READINESS.md](./SEARCH_READINESS.md).

## 1. The outcome

Neurocient should be present when someone looks for a problem that Neurocient can genuinely help explain or address, even when they have never heard the name Neurocient.

Discovery therefore begins with the person's language:

- "Why do I keep replaying arguments?"
- "Why do I compare myself to everyone?"
- "Why do employees stay silent?"
- "Why doesn't training change behaviour?"
- "Why do I keep scrolling when I want to stop?"

It should then lead through a coherent progression:

> concrete problem -> useful explanation -> recognition of the underlying pattern -> relevant diagnostic or tool -> Practice or another appropriate next step

Traffic alone is not the objective. The objective is qualified discovery that helps people understand Neurocient's distinctive approach and gives them a useful next action.

## 2. Discovery principles

1. **Lead with demand language.** Use the words people search and ask, not proprietary vocabulary they cannot know yet.
2. **Earn the introduction to Neurocient's model.** First answer the concrete question; then show how evolved automatic processing and modern conditions help explain it.
3. **One page, one primary job.** Related pages may support one another, but each must own a distinct intent.
4. **Build territories, not isolated posts.** A credible cluster has a clear hub, supporting explanations, deliberate internal links, and a relevant next step.
5. **Make important pages reference-worthy.** Original synthesis, evidence, diagrams, frameworks, examples, or data make a page worth citing.
6. **Use precise product language.** The Inner Caveman means evolved automatic processing. It is not a protector, guardian, personality, or intentional actor.
7. **Protect trust.** Claims must be supportable, nuance must survive optimisation, and content must remain useful even if a visitor never converts.
8. **Design for people and machines together.** Clear headings, direct answers, semantic HTML, structured data, stable URLs, and explicit relationships improve comprehension by search engines and AI systems as well as readers.
9. **Treat distribution as part of publishing.** A good page does not acquire attention or citations merely by existing.
10. **Measure progression, not only reach.** Impressions matter, but so do qualified visits, engaged reading, Scan starts, tool use, Practice entry, return visits, and earned citations.

## 3. Discovery system

Discovery is a connected system with six workstreams:

| Workstream | Purpose | Primary outputs |
| --- | --- | --- |
| Technical search | Make public pages reliably crawlable, indexable, canonical, and understandable | Sitemap, robots rules, canonicals, metadata, schema, redirects, index monitoring |
| Content architecture | Match real demand and give every page a distinct role | Territories, hubs, intent ownership, internal links, content briefs |
| Page quality | Become the best useful answer for a narrow problem | Clear answer, evidence, examples, distinctive explanation, next step |
| Entity and authority | Help systems understand who Neurocient is and why it is credible | Consistent profiles, authorship, citations, relevant referring domains, mentions |
| Distribution and relationships | Put useful work in front of people who can use, share, or cite it | LinkedIn-native ideas, partner outreach, expert contributions, communities, media |
| Measurement and learning | Use evidence to choose what to improve next | Search Console, analytics, referral data, product progression, quarterly remap |

No single workstream substitutes for the others. Technical correctness makes discovery possible; content relevance and authority make it probable; a strong product path makes it valuable.

## 4. Current baseline

As of 2026-11-11:

- the repository implements public-page metadata, self-canonicals, sitemap and robots controls, structured data, legacy redirects, and `noindex` treatment for private or personalised routes;
- `llms.txt` provides a concise machine-readable description of the public site;
- the canonical apex sitemap is accepted in Google Search Console and reports 61 discovered URLs;
- the obsolete `www` sitemap entry has been removed;
- validation has been started for the previously reported not-found and crawled-not-indexed groups;
- priority crawling has been requested for the homepage, the insight index, two representative insights, and the Caveman Scan;
- the content inventory contains 29 insight articles;
- internal linking is uneven: many articles have no contextual internal link, so the library does not yet behave as a strong cluster system;
- article bodies generally do not expose supporting external references, reducing their present reference value and the transparency of evidence-heavy claims;
- Google Search Console currently reports no external links. This is a starting point, not an emergency, but earned authority is now a material constraint.

WebMCP and Agentic Resource Discovery are not current launch requirements. They should be added only when Neurocient exposes a real, safe agent-facing capability with clear schemas, authentication, privacy, rate limits, and abuse controls. Files created only to satisfy an audit would not improve discovery.

## 5. Discovery territories

These are the initial territories inferred from the existing library. Search Console evidence may change their names, boundaries, or priority.

| Territory | Human problem | Neurocient's useful angle | Primary product connection |
| --- | --- | --- | --- |
| Behaviour change and the knowing-doing gap | "I know what to do, so why don't I do it?" | Behaviour is shaped by identity, understanding, environment, action, and reinforcement—not information or willpower alone | Practice and relevant tools |
| Digital habits and self-regulation | "Why can't I stop scrolling, watching, eating, or avoiding exercise?" | Modern environments amplify automatic tendencies; redesigning conditions is more reliable than moral judgement | Scan, Practice, tools |
| Anxiety, rumination, and social threat | "Why does my mind keep anticipating, replaying, comparing, or overreacting?" | Threat-sensitive automatic processing can misread modern uncertainty and social signals | Scan and relevant Practice challenges |
| Workplace behaviour and learning | "Why do smart teams stay silent, conform, miss deadlines, or fail to apply training?" | Status, belonging, uncertainty, memory, and transfer conditions shape organisational behaviour | Workplace resources and services |
| Perception and decision-making | "Why do I see patterns, mishandle uncertainty, or fear losses?" | Fast inference was useful under older conditions but can distort abstract, statistical environments | Educational tools and insight journeys |
| The evolutionary mismatch model | "Why do modern problems feel so hard despite our intelligence?" | Many recurring difficulties become more intelligible when evolved tendencies meet unfamiliar environments | Inner Caveman overview, Scan, entire product model |

The territories are entry doors, not navigation labels that must be forced on visitors. Language should stay concrete and problem-led.

## 6. Existing-content discovery map

Priority meanings:

- **P1 — reference page:** upgrade first; it should anchor a territory and become worthy of citation.
- **P2 — cluster support:** clarify its intent, strengthen evidence and internal links, and connect it to the appropriate hub.
- **P3 — evaluate/reposition:** retain for now, but resolve positioning, evidence, or strategic fit before promoting it.

| Existing page | Territory and primary discoverable intent | Role and route onward | Priority and editorial direction |
| --- | --- | --- | --- |
| `/insights/the-past-is-prologue` — *The Past Is Prologue* | Evolutionary mismatch: why old human tendencies still shape modern behaviour | Foundational model; route to Inner Caveman and Scan | **P1.** Make this the rigorous model page; distinguish it from the accessible mismatch introduction below. |
| `/insights/evolutionary-lag` — *Still Running on Caveman Code* | Evolutionary mismatch: why modern life conflicts with ancient tendencies | Accessible pillar; route to the formal model, Scan, and relevant problem clusters | **P1.** Own the plain-language overview and link outward to concrete applications. |
| `/insights/wait-but-why` — *Wait, but why?* | Knowing-doing gap: why understanding a problem does not automatically change behaviour | Bridge to the behaviour-change method and Practice | **P2.** Make the question and practical consequence explicit; avoid duplicating willpower. |
| `/insights/concrete-vs-abstract` — *The Concrete Mind in an Abstract World* | Why abstract goals, numbers, and delayed outcomes are hard to act on | Mechanism page; support behaviour change and decision-making clusters | **P2.** Own abstraction and psychological distance, not evolutionary mismatch generally. |
| `/insights/willpower` — *Why Willpower Isn't the Answer* | Why willpower fails and what works better | Behaviour-change pillar candidate; route to environment design and Practice | **P1.** Build the clearest path from failed self-control to IKEA + Reinforcement without turning it into generic tips. |
| `/insights/doomscrolling` — *Why Do You Scroll Endlessly on Social Media?* | Why people keep doomscrolling and how feeds exploit monitoring and novelty | Digital-habits support; route to Scan or a relevant Practice challenge | **P2.** Own news/social-feed checking; distinguish from episodic viewing. |
| `/insights/binge-watch` — *Why Our Inner Caveman Can't Resist Next Episode* | Why it is hard to stop watching the next episode | Digital-habits support | **P2.** Own narrative continuation and platform design; revise agentic Inner Caveman wording. |
| `/insights/stress-comfort-food` — *Why Stress Sends You to Sugar and Snacks* | Why stress increases cravings for energy-dense food | Self-regulation support; route to a context-specific tool or Practice challenge | **P2.** Strengthen evidence and avoid universal causal claims. |
| `/insights/struggle-to-exercise` — *The Ancient Instinct That Keeps You Off the Treadmill* | Why starting or sustaining exercise feels difficult | Self-regulation support; route to environment and tiny-action work | **P2.** Own effort conservation and exercise context; avoid blaming a single instinct. |
| `/insights/anticipatory-anxiety` — *Why We Worry About Problems That Haven't Happened* | Why people worry before uncertain future events | Anxiety support; route to Scan or relevant Practice work | **P2.** Own pre-event uncertainty; distinguish from catastrophic interpretation. |
| `/insights/catastrophe` — *The Caveman Code Behind Everyday Overreactions* | Why the mind jumps to worst-case outcomes | Anxiety support | **P2.** Own threat amplification and worst-case inference; link to anticipatory anxiety without merging them. |
| `/insights/negativity-bias` — *Why Our Minds Hold On to Criticism* | Why criticism is remembered more strongly than praise | Social-threat support; route to feedback and rumination pages | **P2.** Own memory and weighting of negative feedback; do not compete with performance reviews. |
| `/insights/replay-arguments` — *The Real Reason You Keep Replaying Arguments* | Why arguments repeat in the mind after they end | Rumination support; route to Scan or relevant Practice challenge | **P2.** Own unresolved social conflict after the event; connect to, but distinguish from, shutdown during conflict. |
| `/insights/spotlight-bias` — *All Eyes on Me?* | Why people feel watched and judged more than they are | Social-threat support | **P2.** Own perceived observation and judgement; distinguish from status comparison. |
| `/insights/why-we-compare` — *Why We Compare Ourselves Constantly* | Why social comparison is automatic and painful | Social-comparison reference page; route to Scan and related Practice work | **P1.** Deepen evidence, examples, and useful distinctions; own comparison rather than general social anxiety. |
| `/insights/connections` — *We've Never Been More Connected – Yet Why Are We Lonelier Than Ever?* | Why digital connection can coexist with loneliness | Belonging support; route to relevant tools | **P2.** Own depth, reciprocity, and belonging; avoid drifting into comparison or doomscrolling. |
| `/insights/alloparenting` — *When an Argument Makes Me Disappear* | Why some people shut down, withdraw, or go blank during conflict | Relationship-pattern support; route to Scan or a suitable challenge | **P2.** Lead with the actual conflict response; verify whether “alloparenting” is the right explanatory frame or title vocabulary. |
| `/insights/she-will-never-understand-you` — *She Will Never Understand You* | Likely relationship misunderstanding and recurring conflict | Long-form relationship support | **P3.** Reassess search intent, gender framing, evidence, and length before promotion; give it a neutral problem-led job. |
| `/insights/performance-reviews` — *When Feedback Feels Like Fight-or-Flight* | Why performance feedback triggers defensiveness or threat responses | Workplace reference page; route to organisational resources | **P1.** Make this the definitive feedback-threat page with manager and employee applications. |
| `/insights/silent-team` — *The Status Threat That Keeps Teams Quiet* | Why employees do not speak up in meetings | Workplace support | **P2.** Own status risk and speaking up; distinguish from conformity in decisions. |
| `/insights/groupthink` — *Conformity Over Creativity: The Groupthink Trap* | Why teams conform and make weaker decisions | Workplace support | **P2.** Own conformity and decision quality; link reciprocally with silence and team trust. |
| `/insights/team-building` — *From Campfires to Conference Rooms: The Mismatch in Team-Building* | Why team-building events often fail to create durable trust | Workplace support | **P2.** Own cooperation conditions and transfer back to work; avoid generic team-building advice. |
| `/insights/planning-fallacy` — *Why Smart People Still Miss Deadlines* | Why people underestimate time and complexity | Workplace/decision support | **P2.** Own forecasting and inside-view errors; add practical examples and credible sources. |
| `/insights/lnd-workshops` — *From Inspiration to Inaction: The Workshop Trap* | Why training workshops fail to change workplace behaviour | Workplace learning reference page; route to Neurocient's behaviour-change approach | **P1.** Develop as a citation-worthy transfer and reinforcement resource, not a sales page. |
| `/insights/loss-aversion` — *Why Loss Hurts Twice as Much as Gain Feels Good* | Why losses influence decisions more strongly than equivalent gains | Decision-making support | **P2.** Own loss framing; qualify the familiar “twice as much” shorthand and cite primary evidence. |
| `/insights/false-patterns` — *Faces in the Clouds, Tigers in the Grass: Why We See Patterns* | Why people detect patterns that are not really there | Perception support | **P2.** Own apophenia and false-positive pattern detection; distinguish from beliefs about merit and randomness. |
| `/insights/randomness` — *The Lie We Love: How Our Caveman Brains Betray Us in the Modern World* | Why people underestimate chance in success and failure | Decision-making support | **P2.** Own randomness, survivorship, and outcome attribution; revise accusatory and agentic framing. |
| `/insights/big-numbers` — *Stone Age Minds in a Statistical World* | Why large numbers and statistics are hard to understand intuitively | Decision-making support | **P2.** Own scale and numeracy; connect to the abstraction mechanism page. |
| `/insights/mission-vs-exploration` — *Mission vs. Exploration: Why Men and Women Shop Differently* | Current intent is gender differences in shopping behaviour | Decision-making/consumer behaviour | **P3.** Reassess premise, evidence, essentialist framing, and strategic value before linking or distributing. |

### Initial reference-page set

The first five pages to make reference-worthy are:

1. `/insights/evolutionary-lag` — accessible introduction to the overall model;
2. `/insights/willpower` — bridge from a common problem to Neurocient's behaviour-change approach;
3. `/insights/why-we-compare` — strong non-brand consumer problem;
4. `/insights/performance-reviews` — strong workplace problem;
5. `/insights/lnd-workshops` — strong organisational learning problem and direct strategic fit.

`/insights/the-past-is-prologue` remains a foundational page and should support the first five. The set is provisional: after enough query and engagement data exists, evidence should decide whether a different page earns P1 investment.

### Overlap rules

Before updating or commissioning content, preserve these distinctions:

- **anticipatory anxiety** is pre-event uncertainty; **catastrophe** is escalation to a worst-case interpretation;
- **negativity bias** is disproportionate weighting or memory; **performance reviews** is the workplace feedback situation;
- **replaying arguments** is post-conflict rumination; **alloparenting** currently addresses withdrawal during conflict;
- **spotlight bias** is perceived observation; **comparison** is relative status or self-evaluation;
- **silent team** is speaking-up risk; **groupthink** is conformity in group judgement; **team-building** is cooperation and trust conditions;
- **false patterns** is detecting structure in noise; **randomness** is misattributing outcomes and underestimating chance;
- **doomscrolling** is feed/news monitoring; **binge-watching** is narrative continuation;
- **willpower** should explain the failure of self-control as a strategy; **wait-but-why** should explain the knowing-doing gap; **L&D workshops** should explain organisational transfer failure;
- **evolutionary lag** is the accessible overview; **the past is prologue** is the fuller model; **concrete vs abstract** is one specific cognitive mismatch.

If two drafts cannot be separated by a different primary question and a different useful answer, improve the existing page instead of publishing another URL.

## 7. Phased roadmap

### Now: establish control (0–2 weeks)

- Adopt this map as the editorial inventory and assign an owner to every P1 page.
- Record a baseline for indexed pages, non-brand impressions, clicks, queries, referring domains, engaged visits, Scan starts, and relevant product progression.
- Confirm Bing Webmaster Tools ownership, submit the canonical sitemap, and assess IndexNow support in the deployment stack.
- Standardise Neurocient's public entity facts across owned profiles: name, description, canonical URL, logo, founder/author information, and topical focus.
- Define the hub architecture and contextual internal-link plan for the six territories.
- Produce upgrade briefs for the five P1 reference pages, including intent, evidence, distinct claim, examples, visuals or original synthesis, links, and next step.
- Audit high-priority copy for legacy protector, personality, or intentional-agent language.

**Exit condition:** we can explain what each existing page owns, how priority pages connect, what success means, and what will be changed first.

### Short term: build the discovery foundation (2 weeks–3 months)

- Upgrade the five P1 reference pages for answer quality, evidence, authorship, visual explanation, internal links, and product progression.
- Create or improve territory hubs only where they add genuine orientation; do not create thin category pages merely to hold keywords.
- Add reciprocal, contextual internal links across every cluster and ensure no valuable article is orphaned.
- Refresh P2 pages in priority order using observed queries, impressions, and product relevance.
- Add transparent source notes or references where scientific or quantitative claims need support.
- Begin focused authority work with relevant researchers, practitioners, workplace-learning communities, podcast hosts, newsletters, partners, and journalists.
- Use LinkedIn to publish self-contained ideas derived from priority pages, then invite discussion and relevant visits.
- Reclaim legitimate links from founder profiles, speaker pages, partner pages, podcast appearances, professional associations, and existing unlinked mentions.

**Initial authority target:** earn 3–5 genuinely relevant referring domains in the first quarter. This is a quality target, not a quota to be met through low-value directories or exchanges.

**Exit condition:** priority territories have a strong entry page, connected support, credible evidence, real distribution, and early non-brand discovery signals.

### Medium term: earn authority and fill proven gaps (3–6 months)

- Publish one genuinely linkable asset: original research, a transparent dataset, a practical diagnostic framework, a high-quality visual model, or a field guide based on real expertise.
- Build recurring editorial relationships rather than one-off link requests.
- Commission new pages only for gaps demonstrated by query data, audience conversations, product learning, or missing cluster coverage.
- Strengthen the route from insight to Scan, tool, Practice, or workplace resource without turning educational pages into sales interstitials.
- Compare territory performance and concentrate effort where Neurocient has both authority and product fit.
- Test answer formats that AI systems can cite accurately: explicit definitions, scoped claims, concise summaries, examples, FAQs only when real questions warrant them, and stable source attribution.

**Exit condition:** Neurocient is earning discovery from multiple relevant sources, not depending on branded search or a single platform.

### Long term: become a recognised source (6–12+ months)

- Own a defensible category at the intersection of evolved automatic processing, modern mismatch, and emotionally lightweight behaviour change.
- Produce recurring original evidence and update reference assets so they accumulate citations over time.
- Expand the ecosystem through expert collaborations, talks, podcasts, newsletters, communities, partnerships, and selective syndication with canonical control.
- Build durable author and organisational reputation signals around demonstrable expertise.
- Add agent-facing protocols such as WebMCP or ARD only when a real product capability and its security contract exist.

**Exit condition:** relevant people and systems recognise Neurocient as a useful source before they encounter the brand directly.

## 8. External authority and links

External links remain important because they can provide discovery, referral traffic, corroboration, and authority. The goal is not “more backlinks”; it is more relevant independent sources choosing to cite useful Neurocient work.

A valuable link is usually:

- editorially chosen rather than bought or automatically placed;
- topically relevant to the page and audience;
- contextual within meaningful content;
- directed to the most useful deep page, not always the homepage;
- capable of sending qualified readers even if ranking value is ignored;
- expressed with natural, descriptive anchor text.

LinkedIn is primarily a distribution and relationship channel. A link in a LinkedIn post may send readers and create the conditions for later citations, but it should not be counted as the authority outcome itself. Publish a useful native idea, reach the practitioners or writers who care about it, and give them a page worth citing.

Do not buy links, automate mass outreach, use indiscriminate directories, arrange scaled exchanges, or commission low-quality guest posts for anchor text. These tactics weaken trust and create risk without building a real audience.

## 9. AI discovery

AI discovery uses much of the same foundation as search discovery: accessible pages, clear entity identity, useful answers, credible claims, stable URLs, meaningful internal relationships, and independent citations.

Optimise for accurate understanding and citation:

- state the question and answer plainly;
- define Neurocient-specific terms in ordinary language;
- separate evidence, inference, and opinion;
- make authorship and organisational identity explicit;
- use semantic headings and structured data that accurately reflect visible content;
- maintain a useful `llms.txt`, while recognising that it is not a substitute for content quality or authority;
- allow legitimate crawlers deliberately through `robots.txt`, subject to product, privacy, and commercial policy;
- keep important public explanations available without requiring client-side interaction or authentication;
- prefer durable reference pages over a large volume of shallow posts.

No configuration can guarantee inclusion in an AI answer. The strongest strategy is to become a source that systems can retrieve, understand, verify, and safely cite.

## 10. Measurement model

### North-star question

Are more of the right people discovering Neurocient through relevant non-brand problems and progressing to something useful?

### Scorecard

| Layer | Measures | Interpretation |
| --- | --- | --- |
| Availability | Valid indexed pages, sitemap status, crawl/index exclusions, Core Web Vitals | Can discovery systems access and use the site reliably? |
| Demand visibility | Non-brand impressions, query diversity, average position by territory, AI/search mentions where observable | Is Neurocient appearing for relevant problems? |
| Qualified acquisition | Organic clicks, click-through rate, landing pages, engaged sessions, returning organic visitors | Are the right search appearances producing useful visits? |
| Authority | Relevant referring domains, deep-page links, unlinked mentions, referral quality, citations | Are independent sources treating Neurocient as useful? |
| Product progression | Insight-to-Scan rate, Scan starts/completions, tool use, Practice entry, appropriate workplace enquiries | Does discovery lead to meaningful engagement? |
| Content learning | Queries gained/lost, internal path use, page engagement, assisted progression, refresh outcomes | What should be improved, consolidated, or expanded? |

Segment reporting by territory, landing page, brand versus non-brand query, audience type where known, and new versus returning visitor. Avoid a single blended traffic number that hides whether discovery is relevant.

The first reporting cycle establishes the baseline; targets should be set only after the data is trustworthy. Rankings and backlinks are leading indicators, not the final product outcome.

## 11. Operating cadence

### Weekly

- review Search Console for indexing changes, new queries, impression movement, and material errors;
- inspect priority landing-page engagement and product progression;
- distribute one or more useful ideas from current priority work;
- make a small number of relevant, personalised relationship or citation contacts;
- record decisions and anomalies, not screenshots without interpretation.

### Monthly

- review the territory scorecard and the five P1 pages;
- decide which existing page deserves the next improvement;
- inspect new referring domains and mentions for relevance and referral quality;
- review internal-link coverage and orphan risk;
- check entity/profile consistency;
- update this document when priorities, ownership, or evidence change.

### Quarterly

- remap all content against observed demand and product direction;
- reassess P1/P2/P3 assignments;
- consolidate or redirect pages that cannot maintain distinct intent;
- identify the next reference asset or proven content gap;
- review competitor and source landscapes for each priority territory;
- revisit AI crawler and protocol choices against actual product capabilities;
- record outcomes, not just activity.

## 12. Decision rules

- Do not scale new article production until the existing 29 pages have clear roles and connected journeys.
- Improve or consolidate an existing URL when it already addresses the intent.
- Do not begin broad link outreach until the destination is genuinely reference-worthy.
- Do not equate LinkedIn posting with link building.
- Do not optimise proprietary terminology as if users already know it.
- Do not let keywords distort claims, scientific nuance, or the product's direct and non-agentic language.
- Do not create schema, FAQs, agent manifests, or category pages that do not reflect a real visible resource or capability.
- Do not judge discovery on traffic alone; require evidence of relevance, engagement, or progression.
- Prefer a smaller number of strong territories over superficial coverage of every adjacent topic.
- When evidence contradicts this plan, update the plan.

## 13. Next recorded decisions

The next review should record:

1. named owner and upgrade brief for each P1 page;
2. baseline Search Console and product-progression figures;
3. agreed territory hub structure and internal-link specification;
4. Bing Webmaster Tools and IndexNow decision;
5. the first-quarter relationship and authority shortlist;
6. the first linkable asset hypothesis;
7. pages selected for consolidation, reframing, or scientific review.

This document is intentionally a living strategy rather than a one-off SEO audit. Update its status, evidence, map, and decisions as Neurocient learns what people seek, what the site can answer exceptionally well, and which discovery paths lead to meaningful use.
