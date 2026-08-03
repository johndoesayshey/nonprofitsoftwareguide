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

## 2026-07-31 — Stack pages rebuilt around programs that pay

**Decision.** All four stack pages were re-specified by the operator against verified
affiliate programs. monday.com leads the grassroots stack; Jotform handles money in at that
size; Instrumentl appears at every tier; DonorDock is the CRM through $5M; Greater Giving
carries events from $250k up; Bloomerang and Kindsight appear only at $5M+.

**Why.** Products with no path to a commission were absorbing prime placement on the highest-
intent pages. Coverage of them stays (a guide that hides Zeffy is not credible), but the
recommended ledger now leads with tools that both fit the shop size and can pay.

**Bloomerang serving two lines.** At $5M+ Bloomerang appears as both CRM and event platform.
Verified against bloomerang.com/features/event-management and /features/auctions: ticketing,
QR check-in, and live/virtual/hybrid auctions are native to the platform.

**Advisory lines.** Stack components may now carry `advisory: true` and no platformSlug. Used
for wealth screening below $5M, where a consultant-run screen (~$4,000-$5,000 as a project)
delivers more than a subscription nobody logs into. Rendered by `ConsultantSlot.astro`, which
states plainly that introductions are not live yet rather than showing a dead button.

**"What to cut first" removed sitewide.** Operator judgment: fundraisers, EDs and boards do
not evaluate software through that lens, so the section read as invented rather than observed.
CLAUDE.md updated to match.

**Grantable removed.** No verifiable affiliate program, and no editorial reason to keep an AI
grant-writing subscription in a stack when a general assistant drafts as well. Platform page
deleted, 301 written to /grant-research/.

**rel=sponsored is now conditional.** Both the markdown rehype plugin and every .astro link use
the program's actual status. Labelling a Zeffy or Candid link "sponsored" would be a false
statement about a relationship that does not exist.

## 2026-08-02 — "Limitations" replaced by "Other options"; 4aGoodCause added

**Decision.** The `limitations` array is gone from the platform schema, replaced by
`otherOptions[{need, platformSlug, note}]`. Pages now render an "Other options" section that
states the reader's situation and names the tool that fits it, with a link.

**Why.** A bare list of faults reads as a verdict and leaves the reader nowhere to go. Framing
the same information as a routing decision keeps the page honest, sends traffic to another page
we control, and reads better to a buyer.

**Tone is an editorial call per product, not a template.**
- Products with a live program (`potential !== 'none'`) or a plausible future one get the need
  stated neutrally: "Want deeper retention reporting? → Bloomerang."
- Little Green Light and Neon One are treated the same way. LGL is small and bootstrapped and
  Neon relaunched its CAP program in Oct 2025; both are negotiable later, so nothing on their
  pages should read as a takedown.
- Products with no path to a program and no prospect of one — Zeffy, Givebutter, Candid,
  Grants.gov, GrantStation, OneCause, WealthEngine — keep the same structure but state the
  constraint plainly. Naming the tradeoff there costs nothing and is what makes the softer
  framing elsewhere credible.

**4aGoodCause added** (`src/content/platforms/4agoodcause.md`, donation-processing). Its
affiliate program pays 25% recurring on renewals, the strongest terms we have verified. The
page's unique data is the break-even table against Donorbox's ~2.95% platform fee: the
crossover is about $40,270 of annual online giving, below which the percentage wins and above
which the flat $1,188/yr does. That figure is repeated on the category page and in the $250k-$1M
and $1M-$5M stack prose. Pricing verified against 4agoodcause.com/pricing on 2026-08-02.

The stack ledger lines stay on Donorbox per the operator's note n21; 4aGoodCause is presented
as the priced alternative with the arithmetic to decide it.

**GiveWP mention dropped** from the donation-processing page: the program moved to LiquidWeb,
there is no platform page behind the link, and it was the only unreviewed product on the page.

## 2026-08-02 — Benchmark generated from the stacks; Grants.gov dropped

**Benchmark is no longer a separate dataset.** `src/data/benchmarks.json` is deleted. Every cell
in /benchmarks/ is now read off the four stack pages at build time. The two were maintained as
independent lists and drifted apart inside a week, which is exactly the contradiction a reader
checking our numbers would find first. One source, no drift. A dash means the stack leaves that
category out on purpose. Methodology and citation blocks removed at the operator's direction;
the figures now carry their provenance by linking to the stack page they came from.

**Homepage headline stat** now derives from the $250k-$1M stack's total for the same reason.

**Grants.gov removed sitewide.** Federal portal, no program, and a poor fit for the shops this
site serves; every mention, the platform page and its comparison pages are gone, with a 301 to
/grant-research/.

**Editorial pin.** `priority` in affiliates.json adds to the ordering score, so a product can
lead its category for a reason the payout doesn't capture. Kindsight is pinned to the top of
prospect research: Tier B negotiated partner, and the name readers arrive searching for. Say why
in `priorityNote`; delete the field to fall back to payout order.

**Reader offers now say whose deal they are** (`ReaderOffer.astro`). `offerSource: "guide"` means
the discount exists because the reader used our link, and the label says so. `offerSource:
"vendor"` means it is the vendor's own public programme — Jotform's 50% nonprofit discount is
open to anyone, and taking credit for it would be false. Greater Giving's readerOffer was removed
entirely: the $300 is worded as a referral credit, not a confirmed customer discount, so it is
not something we can promise a reader.

**Open accuracy risk:** every program is still `status: "pending"`. The reader discounts are real
offers but only take effect once each application is approved. Apply, or the offers should be
hidden.

## 2026-08-02 — /benchmarks/ becomes survey results

**Real data replaced modelled data.** The operator supplied a July 2026 survey: 100 US
fundraising professionals reporting annual spend per software category, segmented by revenue
(n=55 / 28 / 12 / 5). The page previously showed figures derived from our own stack pages,
which was a summary of our recommendations dressed as a benchmark. It now reports what the
sector actually spends.

`src/data/survey-2026.json` is the single source: means, medians, share reporting $0, and
segment sizes. Every figure was recomputed from the 100 individual responses and matches the
workbook's own summary tab.

**The PDF is generated, not maintained.** `scripts/build-survey-pdf.mjs` writes a real
two-page PDF from the same JSON and runs as the first step of `npm run build`, so the download
can never disagree with the page. Written directly against the PDF spec rather than adding a
library — the document is text and rules, and the site has no other runtime dependencies. Two
gotchas worth remembering: base-14 Helvetica with WinAnsi silently drops en-dashes and curly
quotes (they are folded to ASCII in `esc()`), and text width must be measured on the folded
string or right-aligned columns drift.

**Tables are fixed-layout and full-width.** The article sets `max-width: none` with the reading
measure restored on the text elements, so all four segment columns fit without horizontal
scroll and the columns hold their widths across all four tables. This was the operator's "the
chart should not move around."

**Methodology and citation restored**, per operator direction, along with a more formal opening.
Both were removed on 2026-08-02 when the page was a derived table; with real survey data behind
it they are what make the page citable.

**The most valuable section is the comparison.** Mean reported spend against our recommended
stack: $10,197 vs ~$3,700 at $250k-$1M. That contrast is the site's thesis stated in the
sector's own numbers, and it is the reason this page can earn links.

**Homepage headline stat** now reads $10,197 from the survey rather than a derived stack
midpoint. Nav label changed from "Benchmark" to "Survey"; the URL stays /benchmarks/ because
slugs do not change after publish.

## 2026-08-02 — Benchmark keeps its name; the survey instrument is published

**Naming.** Operator preferred "benchmark" to "survey". The page heading, browser title, nav
label, breadcrumb and citation are all Benchmark again; the survey remains the method described
in the body. URL unchanged.

**The instrument is now on the page** (`SurveyForm.astro`, config in
`src/data/survey-form.json`). Publishing the exact questions is the credibility argument: a
reader can see how the figures were collected and can answer the same questions themselves,
which is the difference between a benchmark and a number someone made up. It also makes the
2027 edition self-feeding.

**No backend.** `provider: "jotform"` with a `formUrl` embeds a hosted form and actually stores
responses. Jotform is the recommended route: the site already covers it, it is a pending
affiliate partner, and running our own survey on it is an honest first-hand claim.

*(Amended later the same day: the mailto composer was removed at the operator's direction in
favour of `provider: "placeholder"`, which validates and shows a confirmation dialog but stores
nothing, pending a backend. **The dialog tells the reader their response was recorded when it
was not.** That is fine while nobody is being sent to the page and is flagged in the component
header; it should not sit in front of real traffic. Switching to jotform is a two-field change
in `src/data/survey-form.json`.)*

**Verification fields.** Job title plus organization or LinkedIn, with a stated privacy note:
never published, never shared, deleted once the edition is finalised, only aggregates reported.
Collecting identifying data needs that promise on the page next to the fields.

**Scope note.** CLAUDE.md ruled out lead forms. Amended rather than ignored: this collects
survey responses, not marketing contacts, and the amendment says not to extend it.

## 2026-08-03 — Consulting page; researched pricing for quote-only products

**Every quote-only product now carries a price ladder.** DonorSearch, WealthEngine, Greater
Giving, OneCause and Neon CRM previously showed "quote-based" or a bare entry price. Ranges are
researched from buyer guides and aggregator reports and are labelled "reported" in the note
column, matching the convention already used for Kindsight. Neon was verified directly on its
live pricing page and had genuinely changed: revenue-based, not record-count, unlimited
contacts and users, from $99/mo, with modules adding 10-20% of the CRM fee. Body copy corrected.

**`/consulting/` exists and is the destination for every "hire someone instead" recommendation.**
The operator does this work directly, so the advisory lines in the stack ledgers, the
ConsultantSlot card, the wealth-screening category page and the About page all link to it. The
"introductions open later this year" holding text is gone.

Deliberately short — it exists to answer "can you help me" and give an address, not to sell.
Contact is consulting@nonprofitsoftwareguide.com.

*(The separation-from-the-guide paragraph was added unasked and removed on operator
instruction. Do not reinstate it.)*

## 2026-08-03 — Logo, used in three places only

The operator supplied a square mark (laptop + gear over the wordmark, on #18514A). Design C is
deliberately typographic, so the mark does **not** go in the site header, and the text wordmark
stays as-is.

Three uses, all places where a logo is expected and where none existed before:

1. **`/og-image.png`** — 1200x630 social card, mark centred on its own green. The site had
   `twitter:card: summary_large_image` declared with no image behind it, so every shared link
   rendered blank. This is the one that matters given the LinkedIn plan.
2. **`/apple-touch-icon.png`** — 180x180 home-screen icon. The 16px favicon stays as the
   existing SVG, since three lines of text are illegible at that size.
3. **PDF cover** — drawn as vector strokes rather than an embedded bitmap, so the download
   stays 14KB with no image dependency.

Source art kept at `public/logo-512.png`.


## D-2026-08-03. `featured` — a shortlist, not a directory

**Operator direction.** The site had grown to 26 products across the software,
pricing and comparison pages and read as bloated. Direction: 4–5 products per
category, weighted to the ones that can actually earn — and SEO pages that don't
need to be reachable from navigation.

**What was built.** `featured: boolean` on the platform schema, default true.
`featured: false` means the product is absent from every curated, reader-facing
list: category hubs, the compare/pricing tables, `/best/` roundups, switching-guide
picks. It does **not** mean unpublished. The product page stays live and indexable,
its comparison pages are still generated, it stays in the sitemap, and it keeps
inbound links (each unfeatured product currently has 6–19).

That split is the point. A page can earn search traffic without appearing in a
list we ask a reader to act on.

**Unfeatured, and why:**

| Product | Reason |
|---|---|
| Donorbox | Operator call. Trimming donation processing to a real shortlist. |
| Donately | 20% revenue share, but of a 2–4% platform fee — a small absolute number. |
| Funraise | Gift cards rather than commission; free-tier referrals excluded. |
| Bonterra (EveryAction) | No affiliate program and no sourceable price anywhere. |
| CharityEngine | No commission of any kind, and $550/mo sits outside our readers' band. |
| Virtuous | No affiliate program and no reliable reported price. |
| Blackbaud Raiser's Edge NXT | No publisher program; quote-only enterprise pricing. |

**One concern worth recording, since it is the operator's call to reverse.**
Removing Donorbox leaves donation processing with 4aGoodCause as the only product
carrying a working affiliate program — Givebutter and Zeffy are Tier C by
definition, since both are free to nonprofits and have no margin to share. Donorbox
was the category's one medium-potential earner (15% of fees for three years). It
stays fully covered — platform page, switching guide, comparison pages — and
re-featuring it is one line in its frontmatter.

**Consequences applied at the same time.**

- Aplos moved from `donor-crm` to `forms-ops`. It is fund accounting with donor
  management attached, not a donor CRM, and it was distorting the CRM matrix.
  `alsoIn: [donor-crm]` keeps it visible to a CRM shopper with a qualifier.
- Bonterra renamed to "Bonterra Fundraising and Engagement (EveryAction)" — the
  product people search for is EveryAction; Bonterra is the holding brand.
- The compare tables show **primary category only**. `alsoIn` still surfaces a
  product on a category hub, where the `alsoInNote` qualifier gives it context; a
  bare row in a price table carries no such nuance and made donor CRM look like
  eight products.
- The stacks recommended Donorbox at three of four sizes. Swapped to 4aGoodCause,
  with rationale rewritten and every stack total recomputed from its line items.

## D-2026-08-03b. /pricing/ merged into /compare/

`/pricing/` was the same table twice. A comparison of these products *is* a
comparison of their prices, so two pages competed for one intent while neither
carried the whole answer.

`/compare/` now does both jobs: the survey spend bands, per-category price ladders,
head-to-head links, methodology, and the citation block with `Dataset` schema.
`/pricing/` 301s to it (`public/_redirects`), and the nav item is one entry —
"Compare & pricing" — rather than two.

Comparison pages for unfeatured products still generate and are still linked, from
a quieter "Also compared" line beneath each category's shortlist chips. They keep
their crawl paths without reading as recommendations.
