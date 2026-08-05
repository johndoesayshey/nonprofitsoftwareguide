# PROJECT SPEC v3 — Nonprofit fundraising stack guide

> Save in the repo root as `CLAUDE.md`. Claude Code reads it automatically every session.
> This replaces v2. The scope changed from "CRM comparison site" to "full fundraising stack,
> organized by shop size." Read the SEO engineering requirements before writing any content —
> they are structural and apply to every page.

## What this project is

A guide to the entire nonprofit fundraising technology stack — not just donor CRMs, but grant
research, prospect research and wealth screening, donation processing, email, and events.

**The organizing idea is shop size, not product category.** The primary content unit is a
recommended stack: "here is what a $500k shop should run, here is what a $5M shop should run,
here is what changes when you cross $2M." Individual product comparisons exist to support
those pages, not the other way around.

The operator is a fundraising professional with 15+ years in institutional fundraising and
grant work, and has personally used several of these platforms. That experience is the
competitive advantage, and it shows up as judgment on the page: which line item to skip at
which size, what a quote actually includes, what breaks in year three.

**The site is anonymous, and it stays that way.** *(Operator direction, 2026-08-02.)* No name,
byline, photo, or identifying credential goes on the site. The operator's professional network
is not a distribution channel: do not propose asking colleagues for links, shares, reshares or
introductions, and do not plan tactics that require anyone in the sector to know who runs this.
Everything has to work cold. This supersedes the original premise, which treated the network as
the main asset — authority now has to come from demonstrated depth and original data instead of
from a résumé.

**The operator is not a developer.** Explain what you're doing in plain language. Never leave
the project in a state where `npm run dev` fails. When you need a decision, ask one question
and offer a default.

## SEO engineering requirements

Build every page to be the best answer to its query. Do not build any page to a lower standard
because a competitor currently outranks us for it — rankings change, and a page that does not
exist cannot accumulate authority. The comparison and category pages get the same quality bar
as everything else, from day one.

These are structural requirements. Enforce them in templates and build checks so they hold
automatically rather than depending on anyone remembering.

**One page, one query.** Every content file declares `targetQuery` in frontmatter. Fail the
build if two published pages declare the same one. Keyword cannibalization is the most common
self-inflicted ranking problem on sites like this, and it is mechanically preventable.

**Topic clusters, enforced.** Each stack page is a hub. Supporting posts link up to their hub
with descriptive anchor text; hubs link down to every supporting page. Fail the build on
orphans.

```
/stacks/2m-nonprofit                                  ← hub
   ├── /blog/excel-to-crm-migration-soft-credits      ← supporting
   ├── /blog/when-to-buy-wealth-screening             ← supporting
   ├── /compare/instrumentl-vs-grantstation           ← supporting
   └── /platforms/instrumentl                         ← money page
```

**Comparison coverage should be exhaustive within a category.** Generate a comparison page for
every meaningful pair of products we cover. These pages are cheap to produce, they capture
high-intent queries, and they compound. Do not skip pairs because a vendor owns that term now.

**Answer first.** Every page opens with a direct 40–60 word answer to its title question,
before any context or preamble. This serves featured snippets, AI assistant citation, and
readers, in that order of scarcity.

**Unique data on every page.** A page that only restates what competitors already say will not
rank at any point on any timeline. Every page must carry something the vendor blogs don't have:
original cost math, the operator's first-hand judgment, a structured tradeoff table, or a
recommendation that names a real constraint. This is the requirement that actually determines
outcomes — treat it as non-negotiable.

**Freshness is a ranking factor in this category.** Software pricing queries are heavily
freshness-weighted. Render `lastVerified` visibly beside every price, emit `dateModified` in
schema, and surface stale pages via `npm run check-freshness`.

**Structured data.** `Product` on platform pages, `ItemList` on comparisons, `FAQPage` where
there is a real Q&A block, `BreadcrumbList` sitewide. Keep pricing in real tables, not prose —
structured, attributable, current data is what both search engines and assistants extract.

**No thin pages.** Set a minimum-depth bar and fail the build below it. Index bloat from thin
pages suppresses the whole domain. Better to publish twenty strong pages than sixty weak ones.

**Stable URLs.** Never change a slug after publish. If a URL must change, write the 301 into
the redirects config in the same commit.

**Performance budget.** LCP under 2.0s, CLS under 0.1, under 100KB JS on content pages. Astro
gives this for free unless something heavy gets added — keep it that way.

**Build at least two link-magnet assets**, designed to earn citations rather than convert: a
stack cost calculator, and an annual benchmark table of what nonprofits at each size actually
spend on software. Original data attracts links; product roundups do not.

**Backlinks outweigh post count.** Maintain `link-targets.md`: nonprofit sector publications,
state association resource pages, grant-writing blogs, and directories. Ten placements beat
fifty posts. Every pitch angle must work as a cold approach from an unnamed publication, since
the operator is not trading on relationships or a byline. In practice that means leading with
the thing that needs no author: original cost data, a benchmark table, a tool comparison a
resource page can link to as a reference.

## Software categories to cover

| Category | Examples | Priority |
|---|---|---|
| Grant research | Instrumentl, GrantStation, Candid Foundation Directory, Grants.gov | **Highest** — best ACV, light competition, operator's day job |
| Prospect research / wealth screening | Kindsight (formerly iWave), DonorSearch, WealthEngine, Windfall | **High** — highest ACV, almost no affiliate competition |
| Donor CRM | Bloomerang, Neon, Keela, Little Green Light, DonorPerfect, Salesforce NPSP | Medium — needed for completeness, worst economics |
| Donation processing | Donorbox, Givebutter, Zeffy, GiveWP, Classy | Medium — good programs, easy conversions |
| Forms & ops | Jotform, Airtable | Low value each, but converts fast and approves instantly |
| Events & auctions | OneCause, Givebutter | Low |

*(Superseded 2026-08-03. The original rule was: "Weight the content calendar toward grant and
prospect research. That is where the money is… do not let the calendar drift back toward CRM
posts just because that category has more competitors writing about it." It rested on an
assumption about affiliate economics that verification disproved — see the amendment under
"Affiliate programs to seed". The replacement: **build and promote whatever earns the most,
measured rather than assumed.** Run `npm run check-monetization`. Grant and prospect research
are still worth covering for traffic, topical authority and the operator's expertise. They just
are not the revenue thesis any more, so they no longer carry a quota.)*

## Stack

Astro 5 + TypeScript + content collections, Tailwind CSS 4, Markdown/MDX, Cloudflare Pages.
No CMS, no database, no auth, no serverless functions. Everything in files.
Do not migrate to WordPress, Next.js, or a headless CMS.

## Directory layout

```
/
├── CLAUDE.md
├── src/
│   ├── content/
│   │   ├── platforms/     # one .md per product
│   │   ├── stacks/        # one .md per shop size — the primary content unit
│   │   ├── posts/
│   │   └── config.ts
│   ├── data/
│   │   └── affiliates.json    # SINGLE SOURCE OF TRUTH for affiliate links
│   ├── components/
│   ├── layouts/
│   └── pages/
│       ├── go/[slug].astro
│       ├── stacks/[slug].astro
│       ├── platforms/[slug].astro
│       └── compare/[slug].astro
├── scripts/
├── content-calendar.md
└── link-targets.md
```

## Affiliate link architecture — build this first

Every affiliate link is written `/go/<slug>`. Never put a raw tracking URL in a content file.

`src/data/affiliates.json` is the only place a real affiliate URL appears:

```json
{
  "instrumentl": {
    "name": "Instrumentl",
    "category": "grant-research",
    "status": "pending",
    "url": "https://www.instrumentl.com",
    "affiliateUrl": null,
    "readerOffer": "14-day free trial + $50 off first month",
    "terms": "[FACT-CHECK: confirm at signup]",
    "signupUrl": "https://www.instrumentl.com/partners",
    "appliedOn": null,
    "approvedOn": null
  }
}
```

`status` is `none` | `pending` | `active`. `/go/[slug].astro` redirects (302) to `affiliateUrl`
when active, otherwise to plain `url` so nothing breaks while an application is pending. Emit
`rel="sponsored nofollow noopener"` on source links and `noindex` on the redirect page.

`readerOffer` renders next to the link wherever present — reader discounts materially raise
click-through and several programs supply them.

## Build-time guardrails — implement as build failures

1. **Disclosure enforcement.** Any page rendering a `/go/` link must render
   `<AffiliateDisclosure />`. Auto-inject into post and stack layouts; fail the build with the
   file path if missing.
2. **Fact-check markers.** `[FACT-CHECK]` anywhere in published content fails the build. Use it
   on every price, tier, limit, and contract term. **Never invent a number.**
3. **Freshness.** `lastVerified` in frontmatter, rendered visibly beside any pricing.
   `npm run check-freshness` reports anything over 90 days. Warn, don't fail.
4. **Link health.** `npm run check-links` verifies every URL in `affiliates.json` returns 200.
5. **Cluster integrity.** Every post must declare a `stack` in frontmatter and every stack page
   must link to its posts. Fail the build on orphans — a post with no hub is a post that will
   not rank.
6. The [FACT-CHECK] build failure applies only to files with `draft: false`.
Draft content may contain markers freely — that's their purpose. Ship all
generated content as draft: true.

## Content rules

**Never fabricate first-hand experience.** Do not write "we tested," "in our testing," or "we
migrated" unless the operator has said he did. Fabricated testing claims violate most affiliate
program terms and are the fastest way to lose both the programs and the rankings.

Draft with marked slots for real input:

```
> [OPERATOR INPUT — 3–4 sentences: what you actually do when a funder's stated
> priorities don't match their 990 giving history]
```

2–4 slots per post, placed where first-hand detail carries the most weight. These slots are
what makes the content rank.

**"Best for" is single-sourced, per category** *(operator rule, 2026-08-04)*: the
`bestFor` field in the platform's frontmatter is the only place that copy lives,
and a cross-listed product (`alsoIn`) carries one distinct canonical text per
software type via `bestForByCategory` — e.g. a product listed under both donor
CRM and donation processing has one CRM text and one processing text, each
consistent everywhere it renders in that context. Templates render via
`bestForIn()` from `src/lib/categories.ts`; never hand-write a variant in a
template or content body. Enforced by `scripts/check-bestfor.mjs` as a build
failure, including keys for categories the product is not listed under.

**Every "Best for" update triggers a full-site sweep** *(operator rule,
2026-08-04)*: when the operator changes any bestFor text, do not stop at the
field. Sweep the entire site's content — guide pick notes, alternatives picks,
stack rationales, posts, answer lines, hub prose — for wording that echoes the
old positioning, and align it. The operator means the full site, every time.

**Voice:** practitioner to practitioner. The reader is a development director with a board
meeting Thursday. Short sentences. Name the tradeoff. Never "game-changing," "robust," or
"seamless."

**Structure:** answer the title question in the first 40–60 words. No throat-clearing about why
donor management matters.

**Stack pages specifically:** lead with the total annual cost of the recommended stack, then
justify each line. Where a category is better bought as a consulting project than a
subscription at that size, say so and mark the line advisory rather than naming a product.

*(Superseded 2026-07-31: the original spec required a "what to cut first when the budget gets
cut" section on every stack page. The operator removed it — fundraisers, EDs and boards are not
evaluating software through that lens, so the section read as invented. Do not reintroduce it.)*

## Content schema

```ts
platforms: { name, slug, category, entryPrice, pricingModel, lastVerified,
             bestFor, strengths[], otherOptions[{need, platformSlug, note}],
             affiliateSlug, freeTier }
stacks:    { shopSize, annualRevenue, staffSize, totalStackCost, slug,
             components[{category, platformSlug, annualCost, rationale}], lastVerified }
posts:     { title, description, publishDate, updatedDate, stack, targetQuery (unique),
             platformsMentioned[], affiliateSlugs[], draft }
```

## Required pages

- `/` — the thesis and the four stack entry points
- `/stacks/[slug]` — **the primary pages.** One per shop size: under $250k, $250k–1M, $1M–5M,
  $5M+. Total cost, line-by-line rationale, upgrade triggers.
- `/platforms/[slug]`, `/compare/[slug]`, `/blog/[slug]`
- `/disclosure` — leave legal text as `[OPERATOR INPUT]`; do not write compliance language
- `/about` — what the guide is, how it is researched, and the depth of experience behind it,
  stated without a name or identifying detail. Written by the operator.

## Design direction

No generic SaaS landing page. No cream background with serif display and terracotta accent, no
dark-mode-with-one-neon-accent, no purple gradient hero. Take direction from the subject
matter — ledger paper, index cards, annual report typography, gift receipts — and commit. One
signature element, everything else quiet. Responsive to 360px, keyboard navigable with visible
focus, respects `prefers-reduced-motion`.

## Work order

1. Scaffold Astro + Tailwind + content collections. Verify `npm run dev`. **Checkpoint.**
2. Affiliate system: `affiliates.json`, `/go/[slug]`, `<AffiliateLink />`,
   `<AffiliateDisclosure />`. Seed from the table below. **Checkpoint.**
3. All five guardrail scripts, wired into `npm run build`. **Checkpoint.**
4. Layouts and design system. Show the homepage. **Checkpoint — approve design before
   building remaining pages.**
5. Stack pages, platform pages, comparison template, blog, disclosure, about.
6. 14 platform files with `[FACT-CHECK]` on every price.
7. Four stack files with `[OPERATOR INPUT]` on every recommendation rationale.
8. `content-calendar.md` — 30 posts with unique `targetQuery`, parent stack, and
   affiliate slugs. Every page in the plan gets built to full quality. The calendar orders
   *writing effort* only — start with specific, concrete questions where the operator's
   first-hand experience is the differentiator, and work outward to broader category pages as
   the cluster fills in. *(The "at least 60% grant research and prospect research" quota that
   was here is superseded — see 2026-08-03 above. Weight by what earns.)*
9. `link-targets.md` — 25 backlink targets with pitch angles.
10. Sitemap, RSS, meta, JSON-LD (`Product`, `FAQPage`, `BreadcrumbList`). GA4 + Search Console
    from env vars, values left empty.
11. Draft the first 3 posts — grant or prospect research, narrow and concrete.
12. `DEPLOY.md` — Cloudflare Pages, DNS, env vars. Plain language, numbered.

## Affiliate programs to seed

Verified July 2026. Terms still get `[FACT-CHECK]` — confirm against the program page at
signup, since rates change and published summaries go stale.

**Tier A — public self-serve programs. Apply to these.**

| Slug | Product | Terms | Sign up |
|---|---|---|---|
| `donordock` | DonorDock | $500 per new paid customer; referral gets 10% off | donordock.com/partners |
| `4agoodcause` | 4aGoodCause | 25%, recurring on every renewal | 4agoodcause.com/referral-program |
| `instrumentl` | Instrumentl | Commissions confirmed, rate not public | instrumentl.com/partners |
| `donorbox` | Donorbox | 15% of fees, 3 yrs, 45-day cookie, $50 min payout | donorbox.org/affiliate-partner-program |
| `givewp` | GiveWP | 30% first 24 referrals, then 40% | givewp.com footer → Affiliates |
| `jotform` | Jotform | 30%, first year, ~1 day approval | jotform.com/partnership/affiliate/ |
| `bloomerang` | Bloomerang | $250 per closed referral | bloomerang.co/partners/join/ |
| `donorsnap` | DonorSnap | $200 per paying customer, monthly, US/CA | donorsnap.com → Affiliate |
| `grantstation` | GrantStation | Product Referral Program, free to join | grantstation.com/partner-programs/prp |

Note on Donorbox: attribution is link-only and never retroactive. Every mention must route
through `/go/donorbox` or the commission is lost.

Note on GrantStation: the PRP is written for associations and alliances with members, not
publishers. Apply anyway and ask — affiliate commissions are demonstrably paid on their
products.

**Tier B — negotiated consultant programs. No signup form; email a partnerships manager.**

| Slug | Product | Reality |
|---|---|---|
| `kindsight` | Kindsight (formerly iWave) | Consulting partner program |
| `donorsearch` | DonorSearch | Consulting partner program |
| `neoncrm` | Neon One | CAP program relaunched Oct 2025 — 10% discount on referred sales, commissions "available" |

Do not approach Tier B with an empty site. These are relationship deals, and real traffic plus
a substantial published site is the leverage — not personal introductions. Vendor partnerships
are a private business conversation, so the anonymity rule does not block them; it only rules
out publishing identity on the site or leaning on sector contacts.

**Tier C — no program exists. Set `status: "none"` and leave it.**

`zeffy`, `givebutter` — free to nonprofits, funded by donor tips; there is no margin to
share, so no program is coming. `candid` — a 501(c)(3) itself. `littlegreenlight` — small and
bootstrapped. `wealthengine`, `classy`, `donorperfect`, `keela` — nothing public found.

Cover Tier C products honestly anyway. A comparison that omits the free options is obviously
compromised, and readers notice. Recommending Zeffy where it genuinely fits is what makes the
Tier A recommendations credible.

**Consequence for the content plan** *(rewritten 2026-08-03, after every program was opened and
verified rather than inferred from published summaries):*

The original claim that "grant research is where high ACV and a real public program overlap" is
false. **Instrumentl pays $50 flat** on a $2,148/yr product — 2.3%. Grant research earns traffic,
authority and the operator's credibility; it does not earn money.

What actually pays, per referred customer, computed from our own published prices:

| Program | Terms | Yr 1 | Yr 3 |
|---|---|---|---|
| DonorDock | $500 flat | $500 | $500 |
| 4aGoodCause (Growth) | 25% recurring | $747 | $2,241 |
| Donorbox (@ $100k online) | 15% of fees, 3 yrs | $442 | $1,327 |
| Instrumentl | $50 flat | $50 | $50 |
| Bloomerang | a donation to a 501(c)(3), which we are not | $0 | $0 |

So the revenue sits in **donor CRM, donation processing and forms/ops** — the categories this
spec originally told us to de-prioritize. Prospect research earns nothing at all: every vendor is
a negotiated consulting deal.

**The rule now: promote what earns, and measure it.** `npm run check-monetization` reports
placement against earning potential per program and flags both mismatches — heavy placement on a
program that cannot pay, and thin placement on one that can. Cover the rest honestly because a
guide that omits the free options is obviously compromised, but stop spending the best real
estate on products that return nothing.

## Out of scope

No user accounts, comments, newsletter backend, search index, database, or vendor portal.
Later, if the site works.

*(Amended 2026-08-02: the benchmark page carries a survey form, which the original scope line
ruled out. It is not a lead form — it collects survey responses to make the published data
credible and repeatable, and it does not capture anyone for marketing. Implemented without a
backend: `src/data/survey-form.json` switches between a `mailto:` composer and an embedded
hosted form. Do not extend this into general lead capture.)*
