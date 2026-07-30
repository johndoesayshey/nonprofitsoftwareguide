# Build progress

Running log of the 12-step work order in `CLAUDE.md`. A fresh session can resume
from here. Each step is committed separately.

## Status

| Step | What | State |
|---|---|---|
| 1 | Scaffold Astro + Tailwind + content collections | ✅ done |
| 2 | Affiliate system (affiliates.json, /go/[slug], components) | ✅ done |
| 3 | Five guardrail scripts wired into build | ✅ done |
| 4 | Layouts, design system, 3 design options, homepage | ✅ done |
| 5 | Stack / platform / compare / blog / disclosure / about pages | ✅ done |
| 6 | 14 platform files | ✅ done |
| 7 | 4 stack files | ✅ done |
| 8 | content-calendar.md (30 posts) | ✅ done |
| 9 | link-targets.md (25 targets) | ✅ done |
| 10 | Sitemap, RSS, meta, JSON-LD, GA4/GSC env | ✅ done |
| 11 | Draft first 3 posts | ✅ done |
| 12 | DEPLOY.md | ✅ done |

**All 12 work-order steps complete.** Full build green, all guardrails passing.
Everything generated ships `draft: true` — see DEPLOY.md Part 5 for how to verify
and publish. Remaining owner tasks: fill `[FACT-CHECK]` prices, write
`[OPERATOR INPUT]` slots + the `/about` bio + `/disclosure` text, then flip pages to
`draft: false`.

## Post-work-order build-out (operator direction, July 29 2026)

| Change | State |
|---|---|
| Design C ("Annual Report") locked in — full reskin | ✅ |
| Nav: Stacks + all 6 categories + Compare + Benchmark + Blog | ✅ |
| Footer trimmed to operator's exact wording (About · Disclosure · RSS) | ✅ |
| Cost calculator removed (operator call) | ✅ |
| Six category hub pages with editorial content | ✅ |
| Real, sourced prices in all platform files (verified 2026-07-29) | ✅ |
| 16 platform pages **published** (was 14 drafts) — incl. new Jotform, OneCause | ✅ |
| 4 stack pages **published** with computed totals ($0 / ~$2.7k / $11–14k / $18–28k) | ✅ |
| 3 blog posts **published** (grant + prospect research) | ✅ |
| Benchmark **published** with modeled data + methodology (`ready: true`) | ✅ |
| About page drafted (still noindex until operator personalizes) | ✅ |

Content approach: prices from web research with sources (quote-based categories
carry "reported" hedging); practitioner voice drawn from Reddit/forum sentiment
research (themes paraphrased, nothing fabricated as first-hand testimony).
Site builds to 80 pages, 53 in sitemap, all guardrails green on published content.

## Editorial + monetization pass (July 29 2026, second session)

| Change | State |
|---|---|
| Em dashes and AI-isms purged from rendered content | ✅ |
| Vendor-friendly reframe (encourage demos; no negotiation coaching) | ✅ |
| Single drafted /disclosure (indexable); one-line inline pointer | ✅ |
| Platform pages simplified (~200-250 words) w/ Visit buttons + screenshot slots | ✅ |
| Category hubs: compact tool cards (price, fit, Visit, reader offer) | ✅ |
| Grassroots stack rebuilt: Grantable + Airtable in, Grants.gov out | ✅ |
| New affiliates: Grantable, monday.com (researched, pending application) | ✅ |
| 12 new blog posts (15 total), dates spread Feb-Jul 2026 | ✅ |
| "Last verified" pill and "affiliate application" note removed from platform pages | ✅ |

104 pages, 25 comparisons, 15 posts. All guardrails green.

**Screenshot slots:** drop product screenshots at
`public/images/platforms/<slug>.png` (or .webp/.jpg) and they render
automatically with SEO alt text. Priority: instrumentl, donorbox, bloomerang,
donordock, jotform, grantable.

**Remaining operator tasks:** personalize `/about` (then remove its noindex),
apply to affiliate programs (incl. Grantable via hello@grantable.co and
monday.com via PartnerStack) and fill `affiliateUrl` + `status: "active"` in
`src/data/affiliates.json`, feed in screenshots, deploy per DEPLOY.md.

## Environment notes

- Astro 5.18, Tailwind 4 (via `@tailwindcss/vite`), TypeScript strict.
- `npm install` needs `--cache /tmp/npmcache-nsg` on this machine (a `~/.npm`
  permission quirk). Plain `npm run dev` / `npm run build` are unaffected.
- Content collections use the Astro 5 glob loader. Config lives at
  `src/content/config.ts` per the spec's directory layout.
- `npm run build` runs `npm run guardrails` first (5 scripts), then `astro build`.

## Decisions

See `DECISIONS.md` for the reasoning behind each judgment call.

## Step 1 — done

- `npm run dev` verified: HTTP 200 on `http://localhost:4321/`.
- Placeholder homepage; real design comes in step 4.
