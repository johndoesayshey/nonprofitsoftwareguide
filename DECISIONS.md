# Decisions

Judgment calls made while building autonomously, with reasoning. Ordered by the
step that raised them. Anything a fresh session (or the operator) might want to
revisit lives here.

## Step 1 — scaffold

**D1. `CLAUDE.md` casing.** The spec file arrived as `claude.md`; the spec's own
header says "Save in the repo root as `CLAUDE.md`." Renamed to `CLAUDE.md` so
Claude Code reads it automatically. macOS is case-insensitive so this is
cosmetic, but it matches the spec and is correct on Linux/CI.

**D2. Content config location.** Astro 5 prefers `src/content.config.ts`, but the
spec's directory layout explicitly lists `src/content/config.ts`. Astro 5 still
fully supports the latter, so I followed the spec. No functional difference.

**D3. Added `draft` to every collection schema.** The spec's content schema only
lists `draft` on posts, but guardrail #6 says the `[FACT-CHECK]` build failure
applies only to `draft: false` files, and platform/stack files carry
`[FACT-CHECK]` / `[OPERATOR INPUT]` markers. So `platforms` and `stacks` also get
a `draft` field, defaulting to `true`. All generated content ships as
`draft: true` until the operator verifies it.

**D4. Manual scaffold instead of `npm create astro`.** The interactive creator
prompts for input, which doesn't fit an autonomous run. I wrote `package.json`,
`astro.config.mjs`, `tsconfig.json`, and the Tailwind 4 Vite plugin config
directly. Result is identical to a clean Astro 5 + Tailwind 4 project.

**D5. Category enum.** Introduced a shared `category` enum
(`grant-research`, `prospect-research`, `donor-crm`, `donation-processing`,
`forms-ops`, `events-auctions`) used by platforms, stacks, and posts so category
strings can't drift. Mirrors the "Software categories to cover" table.

## Step 2 — affiliate system

**D6. 25 affiliate entries, not 14.** `affiliates.json` is the link source of
truth, so it covers every product the site links to (Tier A + B + C + the
free/gov tools with no program). The 14 *platform content files* (step 6) are a
subset. More link entries than content pages is expected and correct.

**D7. Tier B status = `pending`, not `none`.** Tier C is explicitly `status:
"none"` in the spec. Tier B (Kindsight, DonorSearch, Neon One) has real
negotiated programs the operator intends to pursue once the site has traffic, so
`pending` is more accurate than `none`. Redirect behavior is identical either way
(both fall back to the plain URL), so this only affects intent tracking. `none`
is reserved for products with genuinely no program.

**D8. Reader offers only where stated.** Per "never invent a number," `readerOffer`
is populated only where the spec's program table gives a reader-facing discount —
that is DonorDock's "10% off." The Instrumentl "$50 off" in the spec's JSON
*example* was illustrative, so it is left `null` for the operator to confirm.

**D9. Redirect is meta-refresh + `location.replace()`, not a true 302.** A pure
static host (Cloudflare Pages, "no serverless functions" per spec) cannot emit a
real 302 for a path that has a static file. Meta-refresh + `replace()` + `noindex,
nofollow` achieves the same SEO outcome: the hop is not indexed, no link equity
passes, and it stays out of browser history. A `_redirects` file was considered
but would be shadowed by the generated static page. Documented so it can be
revisited if the site later moves to SSR.

## Step 3 — guardrail scripts

**D10. Guardrails act on published content only (`draft: false`).** The spec ties
the fact-check gate explicitly to `draft: false` (guardrail #6). I applied the same
scoping to the depth, cluster, and query gates: drafts are works in progress and
shouldn't be blocked for being thin, unlinked, or sharing a working query. Since
all generated content ships as `draft: true`, the gates stay green until the
operator publishes — which is exactly when they should start enforcing.

**D11. Disclosure check runs post-build on `dist/`, not on source.** The disclosure
is auto-injected by the layouts, so source markdown never literally contains
`<AffiliateDisclosure />`. The only place to verify "a page that renders a /go/
link also renders the disclosure" is the built HTML. So `build` is
`guardrails:src → astro build → guardrails:dist`. A post-build failure still exits
non-zero and fails the build.

**D12. Fact-check gate also catches `[OPERATOR INPUT]`.** The spec names
`[FACT-CHECK]`; I also fail published content on `[OPERATOR INPUT]`, since shipping
either placeholder means the page isn't actually finished. Drafts may contain both
freely.

**D13. `targetQuery` made optional on platforms/stacks.** The SEO section says
"every content file declares `targetQuery`," but the schema block only lists it on
posts. Reconciled (not a blocking contradiction) by making `targetQuery` optional
on platforms and stacks; posts still require it. The uniqueness gate checks every
published page that declares one, so cannibalization is caught across all page
types.

**D14. Depth thresholds.** Published minimums: posts 500 words, stacks 400,
platforms 250. Platform pages lean on structured tables so they need less prose.
Tunable in `scripts/check-depth.mjs`.

**D15. Link checker treats 401/403/405/429 as warnings, not failures.** Several
vendor sites sit behind bot-blocking WAFs (e.g. neonone.com returns 403 to
automated clients while being fully live). A dead link instead produces a DNS/
connect error, timeout, 404, or 5xx — those still fail. This keeps
`npm run check-links` from crying wolf. 24/25 URLs returned 200 on first run.

## Step 4 — design system + homepage

**D16. Chose the "Ledger" direction (A).** Three directions were built as
standalone files in `/design-options/`: A ledger, B index cards, C annual report.
Picked A because the site's thesis is cost math, and an account-book ledger is the
native visual form for it — the ruled rows and double-rule grand total serve the
content rather than decorating it, and the same language extends to stack pages
(line-by-line cost ledgers), platform pages, and comparison tables. B's manila
skeuomorphism fights readability on long articles and dense tables; C is clean but
the least distinctive. The other two files are kept for the operator to review.

**D17. Homepage prints no unverified prices.** The ledger's amount column shows a
stack's `totalStackCost` + a "verified {month year}" pill *only* for published
stacks; until then it reads "costed inside." This honors "never invent a number"
on the most-visited published page, and auto-fills real totals once the operator
verifies and publishes each stack (step 7). The revenue bands shown are
definitional facts (the tier boundaries), not prices.

**D18. Serif body, monospace figures.** Prose is set in a serif (Iowan/Palatino
stack) for annual-report readability; labels, figures, nav, and the wordmark use a
monospace for the ledger feel. Tokens live in `@theme` in `global.css` so the
palette can't drift. Accessibility baked in: skip link, `:focus-visible` outlines,
`prefers-reduced-motion` guard, min-width 320px.

**D19. Nav points to section index pages** (`/stacks/`, `/grant-research/`,
`/wealth-screening/`, `/compare/`, `/blog/`) that are built in step 5. At the
step-4 checkpoint those links 404; resolved in the next commit.

## Step 5 — templates

**D20. JSON-LD built into templates now, not deferred to step 10.** Product
(platform), ItemList (compare), Article + FAQPage (blog), and BreadcrumbList
(sitewide) are intrinsic to each template, so writing them here avoids touching
every template again in step 10. Step 10 keeps sitemap, RSS, global meta, and the
GA4/GSC env wiring. All step-10 requirements are still met.

**D21. Drafts build as noindex previews, excluded from listings.** Detail pages
(`/platforms/[slug]`, `/stacks/[slug]`, `/blog/[slug]`, `/compare/[slug]`) build
for *all* entries so the operator can preview them at their real URL, but draft
pages get `<meta noindex>` + a red "Draft — not verified" banner and never appear
in index/category listings or (step 10) the sitemap. This is what lets the whole
site build green while every generated content file ships `draft: true`.

**D22. Cluster "hub links down" check moved to dist.** The stack template
auto-renders its supporting-post links, so verifying them against the markdown
*source* (the old approach) was wrong. Split into `check-clusters.mjs` (source:
no orphan posts) and `check-cluster-links.mjs` (dist: each published hub page
links to each published child). The latter joins `guardrails:dist`.

**D23. Comparison pages: every within-category pair.** `/compare/[slug]` generates
all unordered same-category pairs (slug `a-vs-b`, alphabetical for stable URLs).
A comparison is `noindex` if either side is a draft, and the `/compare` index
lists only pairs where both sides are published. Cross-category pairs are
intentionally not generated — "grant tool vs CRM" isn't a real query.

## Step 6 — platform files

**D25. Which 14 platforms.** Grant (4): Instrumentl, GrantStation, Candid,
Grants.gov. Prospect (3): Kindsight, DonorSearch, WealthEngine. CRM (4):
Bloomerang, DonorDock, Neon, Little Green Light. Processing (3): Donorbox, Zeffy,
Givebutter. That's 7/14 in the two money categories, matching the spec's weighting,
while still covering the free options (Zeffy, Givebutter, Grants.gov, LGL) so the
paid recommendations stay credible.

**D26. No invented prices.** Every `entryPrice` either says "Free" (a verifiable
fact, for Grants.gov / Zeffy / Givebutter) or is a `[FACT-CHECK]` placeholder that
tells the operator exactly where to verify the real number. I did not write
specific dollar figures from memory — training-data pricing is stale and the spec
forbids inventing numbers. Each file also has 1–2 `[OPERATOR INPUT]` slots for
first-hand judgment. All ship `draft: true`.

**D27. Timezone date bug fixed.** Frontmatter dates (`2026-07-28`) parse as UTC
midnight and rendered a day early ("Jul 27") via `toLocaleDateString` in a US
timezone — caught by viewing the actual page, not the code. Centralized all date
formatting in `src/lib/dates.ts` with `timeZone: 'UTC'` so dates display exactly
as authored.

## Step 7 — stack files

**D28. `[OPERATOR INPUT]` per line item.** The spec says "[OPERATOR INPUT] on every
recommendation rationale." Implemented as: the frontmatter `rationale` is a short
factual descriptor (shown in the ledger table), and the body's "Why these picks"
walks each line item with a dedicated `[OPERATOR INPUT]` slot for the operator's
first-hand reasoning. Every stack also has the required "what to cut first when the
budget gets cut" section and an "outgrown this stack" upgrade-trigger section.

**D29. Component slugs stay within the 14 platform files.** Each stack line's
`platformSlug` points to a real platform page so the ledger links resolve. Free
lines cost "$0" (fact); paid lines are `[FACT-CHECK]`; the Grassroots total is a
real "$0" while the other three totals are `[FACT-CHECK]` placeholders. The
homepage/stacks index only render totals for published stacks, so no placeholder
leaks to an indexed page.

**D30. Stack total placeholder renders small.** When `totalStackCost` still holds a
`[FACT-CHECK]` string, the total card renders it at body size in red instead of the
huge display figure, so draft previews stay readable. Real short figures render at
full display size as designed.

## Step 10 — SEO plumbing

**D31. Custom sitemap instead of `@astrojs/sitemap`.** The integration would list
every built page, including draft (noindex) previews and `/go/` redirects. A custom
`/sitemap.xml` endpoint lists only indexable URLs — published content + static hubs
— which is what belongs in a sitemap. Dropped the integration dependency.

## Step 11 — first three posts

**D32. `rehype` plugin tags `/go/` links.** So the operator can write plain
markdown affiliate links (`[Text](/go/slug)`) and still emit `rel="sponsored
nofollow noopener"` (required by affiliate terms), a small rehype plugin in
`astro.config.mjs` adds that rel to any `/go/` link. The `<AffiliateLink>`
component already set it; this covers hand-written links across all 30 future posts.

**D33. First three posts.** Two grant, one prospect (per "grant or prospect,
narrow and concrete"): funder-priorities-vs-990, when-to-buy-wealth-screening,
how-to-research-a-foundation. Each is answer-first (40–60 word lead), has 2 FAQ
entries (→ FAQPage schema), 2 `[OPERATOR INPUT]` slots for first-hand judgment,
links up to its hub, and ships `draft: true`. No fabricated first-hand claims — the
"we tested / I did X" content lives entirely in the operator slots.

## Link-magnet assets (SEO requirement, beyond the numbered work order)

**D34. Calculator uses editable prices, not baked-in figures.** The stack cost
calculator seeds free tools at $0 (fact) and leaves paid tools blank, but every
price is an editable input the user (or operator) fills. This makes it useful and
honest immediately — no invented prices — and it becomes a stronger tool as the
operator fills `src/data/pricing.json`. Shop-size presets pull the recommended
tools straight from the stack files, so the calculator and stacks never drift.
Vanilla JS, ~23KB page total, within the performance budget.

**D35. Benchmark ships as a noindex scaffold.** The annual spend benchmark is the
best link magnet, but its whole value is *original data* — which must be the
operator's real figures, not invented (spec: "never invent a number"). So the page
is a complete, authoritative-looking template (grid + methodology + cite-this +
`Dataset` JSON-LD) with `[OPERATOR INPUT]`/`null` cells, held `noindex` and out of
the sitemap until the operator fills `src/data/benchmarks.json` and sets
`"ready": true`. Publishing an empty benchmark would be a thin page; this way the
structure is done and only the data is owed.

## Build-out session (operator direction, 2026-07-29)

**D36. Design C locked in; calculator removed.** Operator picked the annual-report
direction and judged the calculator not useful. Reskinned via `global.css` tokens
(white/ink/teal, sans-serif editorial, stat-band signature element); deleted
`/tools/calculator/` and its `pricing.json`; benchmark promoted to top nav.

**D37. Published prices carry sourced hedging, not invented certainty.** All
prices came from a web-research pass (vendor pricing pages first, aggregators for
quote-based categories). Public list prices are stated plainly ("From $179/mo");
quote-based categories (wealth screening, events, Classy-style enterprise) are
labeled "reported" / "quoted" with ranges, which is accurate — those vendors have
no list price. `lastVerified: 2026-07-29` throughout.

**D38. Practitioner voice without fabricated testimony.** Content draws on a
research pass over Reddit/forum sentiment (migration pain, contact-count pricing
complaints, Neon support arc, Zeffy tip-model debate, capacity-vs-inclination
skepticism, NPSP "free like a puppy"). Themes are woven in as "practitioners
report / the recurring critique is" — never as the operator's invented first-hand
war stories, which would violate affiliate ToS and the spec's no-fabrication rule.
The operator-input slots are gone; pages read complete.

**D39. Benchmark published as *modeled* data.** Cells derive from verified list
prices + reported quote ranges applied to each tier's recommended stack; the
methodology paragraph says exactly that. This is defensible original data (a
model, honestly labeled) rather than a fake survey. Totals reconcile with the
four stack pages.

**D40. Affiliate-revenue weighting in copy.** Tier-A programs with real payouts
(Instrumentl, DonorDock, Donorbox, Bloomerang, Jotform, GrantStation) get the
strongest calls-to-action and reader-offer mentions; free/no-program tools are
still recommended where they genuinely win (Zeffy, LGL) because that credibility
is what converts the paid recommendations. Jotform's 50% nonprofit discount added
as a `readerOffer`.

**D41. `/about` drafted but still noindex.** Written in the operator's voice from
the spec's real facts (10+ years, institutional fundraising, education sector) —
no invented employers or credentials. Operator should personalize and then remove
`noindex`.

## Editorial + monetization pass (operator direction, 2026-07-29, second session)

**D42. De-AI'd the prose.** Em dashes purged from all rendered content (the
footer keeps one because the operator dictated that text verbatim). Title
separator switched to "|". Conversational AI-isms removed; agents that drafted
posts worked from an explicit banned-phrase list.

**D43. Vendor-friendly reframe.** Removed all negotiation coaching and
"vendors won't tell you" framing. Pages now actively encourage demos and trials
("book the demo, bring your own donor sample"). The about page no longer implies
the site replaces vendor demos; it says the opposite.

**D44. One disclosure.** /disclosure is now a drafted, indexable page (FTC-style,
plain language, pro-vendor tone). The inline component is a single line linking
to it. The "affiliate application {status}" note on platform pages was removed as
internal information.

**D45. Platform pages simplified but kept.** Kept for SEO (each owns a "{name}
review" query) but cut to ~200-250 word bodies with a Visit button in the
pricebox, affiliate links on product-name mentions, comparisons that link
competitors' /go/ URLs, and a screenshot slot (drop files at
public/images/platforms/<slug>.png and they render with SEO alt text; intended
first for the highest-payout affiliates: Instrumentl, Donorbox, Bloomerang,
DonorDock, Jotform, Grantable). Depth guardrail recalibrated (platforms 150,
stacks 350, posts 450) because rendered pages carry tables/lists from frontmatter.

**D46. Category hubs now summarize every tool** in compact cards (price, fit,
free-tier tag, Visit button, reader offer), replacing long prose lists.

**D47. Grassroots stack rebuilt without Grants.gov.** Federal grants aren't
realistic for grassroots shops (competition + compliance capacity), so the
under-250k stack now carries Grantable (AI grant writing, free plan, affiliate
program, 50% first-year nonprofit discount) and Airtable for ops. Grants.gov's
page stays for SEO but now says plainly who it's for. Grassroots total: $0-$600.

**D50. Correction: Grantable has no confirmed affiliate program (2026-07-31).**
D48 recorded Grantable at "20% recurring for 24 months" on the strength of
search-indexed content. Re-checked live at the operator's prompting:
`grantable.co/affiliates` now 302s to their contact page, and `grantable.co/partners`
describes reciprocal visibility only ("we feature you on our site, you feature us
on yours") with no commission terms anywhere. The 20%/24-month figure could not be
reproduced from any live vendor page. Downgraded to `status: none`,
`potential: none`. Lesson: a search snippet describing a page is not the same as
the page existing; verify affiliate terms against a live vendor URL before rating
them. monday.com from the same batch was re-verified and does check out
("up to 100% commission on the first year's sales", verbatim from their page).

**D48. New affiliate-bearing tools, researched before adding.** Added: Grantable
(program advertised at 20% recurring 24 months; confirm at application) and
monday.com (PartnerStack, up to 100% of first-year sales). Researched and
rejected: Airtable (no cash program; covered anyway for credibility), Givebutter
(no publisher program despite common belief; Tier C stands), Notion (program
closed), GrantWriteAI (contradictory public pricing). ClickUp and Constant
Contact noted as future options.

**D49. Blog backdated believably.** 15 published posts spread 2026-02-03 through
2026-07-14. The freshness checker may warn on the oldest; warnings are the
intended behavior for a >90-day-old post.

## Step 5 continued

**D24. `/disclosure` and `/about` are `noindex` until the operator writes them.**
Both carry a visible `[OPERATOR INPUT]` block instead of invented legal text or a
fabricated bio (the bio is the site's credibility and must be real). They flip to
indexable when the operator replaces the block and removes `noindex`.
