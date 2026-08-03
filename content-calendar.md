# Content calendar

Rewritten 2026-08-03. The original planned 30 posts; the site now carries 75
pages with a unique `targetQuery` across five collections, so a list of unwritten
post ideas had stopped describing the work. This is a status page plus the queue,
ordered by what earns rather than by category.

## Where the content actually is

| Collection | Pages | What it does |
|---|---|---|
| `platforms` | 26 | Product write-ups. The money pages. |
| `posts` | 17 | Blog. Concrete how-to and comparison questions. |
| `guides` | 15 | `/best/` — category head terms and vertical pages. |
| `alternatives` | 13 | `/alternatives/` — switching guides. Highest commercial intent. |
| `stacks` | 4 | The primary content unit. One per shop size. |

Plus `/compare/` (which absorbed the old `/pricing/` page) and `/benchmarks/`,
both built to be cited rather than to convert. All 75 pages are published and every `targetQuery` is unique, enforced
at build by `scripts/check-queries.mjs`.

---

## What to build next: whatever earns

**Rule changed 2026-08-03.** This file previously tracked a 60% grant + prospect
research quota from CLAUDE.md and reported the site as failing it. That quota is
superseded. Verifying every affiliate program disproved the assumption it rested on.

### What each program actually pays, per referred customer

| Program | Terms | Yr 1 | Yr 3 | Category |
|---|---|---|---|---|
| **DonorDock** | $500 flat | $500 | $500 | Donor CRM |
| **4aGoodCause** (Growth) | 25% recurring | $747 | $2,241 | Donation processing |
| **Donorbox** (@ $100k online) | 15% of fees, 3 yrs | $442 | $1,327 | Donation processing |
| **monday.com** | up to 100% of yr 1 | varies | — | Forms & ops |
| **Jotform** | 30% of yr 1 | ~$100 | ~$100 | Forms & ops |
| Eleo | $100 flat, after 90 days | $100 | $100 | Donor CRM |
| Instrumentl | $50 flat | $50 | $50 | Grant research |
| Bloomerang | a donation to a 501(c)(3), which we are not | $0 | $0 | Donor CRM |
| Everything in prospect research | negotiated consulting deals only | $0 | $0 | — |

The revenue is in **donor CRM, donation processing and forms/ops** — the categories
the original spec told us to de-prioritize. Grant research, the designated priority,
pays $50. Prospect research pays nothing at all.

Grant and prospect research stay on the site. They earn traffic, they carry the
operator's actual expertise, and a fundraising guide that is thin on grants is not
credible. They just do not get a quota, and they do not get the best real estate.

### The measure that replaced it

```
npm run check-monetization
```

Reports placement against earning potential for every program, and flags both
mismatches: heavy placement on something that cannot pay, and thin placement on
something that can. As of 2026-08-03 it reports **78 pages routing to a program
that can pay and 78 carrying only non-earning links** — a 50/50 split, and the
number to move.

Some non-earning placement is correct and should stay. A donation-processing list
without Zeffy and Givebutter is obviously compromised; Candid's Foundation
Directory being free at libraries is one of the most useful facts on the site.
Honesty is the product. The target is not zero — it is not spending the best
positions on products that return nothing when an equally honest alternative pays.

### Priorities in that light

1. **Anything routing to DonorDock, 4aGoodCause, Donorbox, monday.com or Jotform.**
   Comparison and "best of" pages in those categories convert; head-to-heads have
   the highest intent of anything on the site.
2. **Grant and prospect research** for traffic and authority — Waves A and B below,
   which are already written or queued. Worth finishing, not worth expanding.
3. **Get a reader offer for 4aGoodCause.** It is the only recurring program and the
   only high-potential one with no offer attached. DonorDock's 10% discount is
   doing measurable work; this is the cheapest available lift.

## Wave A — grant research (mostly written)

Six of the ten below are published. Finish the rest at a comfortable pace: these
earn traffic and authority rather than commission, so they are no longer the
front of the queue. Each parents to a stack hub.

| # | Working title | `targetQuery` | Stack | Affiliates |
|---|---|---|---|---|
| A1 | What a grant budget actually has to show | `nonprofit grant budget what to include` | 250k-1m | instrumentl |
| A2 | Writing a letter of inquiry that gets a proposal invited | `foundation letter of inquiry nonprofit` | under-250k | instrumentl, grantstation |
| A3 | The grant reporting calendar that keeps renewals | `grant reporting deadlines nonprofit` | 1m-5m | instrumentl |
| A4 | Why your grant was declined, and what the funder won't say | `why was our grant declined nonprofit` | 250k-1m | instrumentl |
| A5 | Reading a 990-PF: the four numbers that matter | `how to read 990-pf foundation` | under-250k | candid |
| A6 | Federal vs foundation grants: which to chase at your size | `federal grants vs foundation grants nonprofit` | 1m-5m | grantstation |
| A7 | Building a grant pipeline when you are the only writer | `one person grant program nonprofit` | under-250k | grantstation, instrumentl |
| A8 | What a grant writer costs and when to hire one | `nonprofit grant writer cost` | 250k-1m | — routes to /consulting/ |
| A9 | Free grant research: how far Grants.gov and the library get you | `free grant research tools nonprofit` | under-250k | candid |
| A10 | Corporate vs foundation grants: where research time pays | `corporate vs foundation grants nonprofit` | 250k-1m | instrumentl |

## Wave B — prospect research (background)

Every vendor here is a negotiated consulting deal, so this category earns exactly
zero in commission. It is still worth covering — it is where the operator's
expertise is deepest and it draws serious readers — but it is background work, not
a priority.

| # | Working title | `targetQuery` | Stack | Affiliates |
|---|---|---|---|---|
| B1 | Hand-researching your top 25 prospects for free | `free prospect research nonprofit` | under-250k | — |
| B2 | Capacity vs inclination, and why a wealth score misleads | `wealth capacity vs inclination donor` | 1m-5m | kindsight, donorsearch |
| B3 | What a prospect research consultant does that software can't | `prospect research consultant cost` | 1m-5m | — routes to /consulting/ |
| B4 | Running a screening bake-off: the test-file method | `compare wealth screening vendors` | 1m-5m | kindsight, donorsearch |
| B5 | Public records a fundraiser can legitimately use | `public records prospect research nonprofit` | 250k-1m | — |
| B6 | When a donor-advised fund gift hides the real donor | `donor advised fund soft credit prospect` | 1m-5m | — |
| B7 | How often should you re-screen your donor file? | `how often to re-screen donor database` | 5m-plus | kindsight |
| B8 | Turning a wealth screen into a real major-gift portfolio | `wealth screen to major gift portfolio` | 5m-plus | kindsight |

## Wave C — unblocked

The "hold until the category ratio clears" gate is gone with the quota. These are
now ordered on the same basis as everything else: what they route to.

- **Integration reference page — BLOCKED, not just queued.** A verification pass
  on 2026-08-03 came back almost entirely unconfirmed: Intuit's QuickBooks App
  Store refused every connection, and Zapier's search API ignores its own query
  parameter, so a 404 at a canonical slug proves nothing. Only Givebutter could
  be verified across all eight integrations. Publishing a matrix that is 90%
  "unconfirmed" is worse than no page. What it needs is a browser-driven pass
  through the Intuit listings and each vendor's own help centre — specifically
  the question that decides purchases and that nobody publishes clearly: whether
  QuickBooks sync is two-way, and whether it posts individual transactions or
  only summary journal entries.

  **Four of fourteen products are now fully verified** — Givebutter, Aplos,
  CharityEngine and Virtuous — and their findings are published on their own
  platform pages rather than held for a matrix. Highlights, all sourced and dated:
  Aplos has **no QuickBooks integration at all** despite roundups listing one (it is
  a QuickBooks replacement, and third-party integrations are not in the Lite plan);
  CharityEngine's QuickBooks sync silently drops any transaction whose GL code does
  not exactly match a QuickBooks account name; Virtuous does no historical backfill
  and pauses **all** syncing when a single transaction fails; Givebutter gates
  QuickBooks Online behind Givebutter Plus while listing it among fifty
  integrations. Also: the official Donorbox and Funraise WordPress plugins are both
  around a year without an update.

  Ten products still need the same pass: Bloomerang, DonorDock, Little Green Light,
  Neon CRM, Donorbox, Donately, Zeffy, Funraise, Eleo, 4aGoodCause.
- Remaining verticals: libraries and Friends groups, environmental, international
  NGOs, professional associations
- Head terms: best events and auction software, best nonprofit forms software
- Alternatives pages for the newly added products, once each has traffic
- Grants.gov / SAM.gov registration timeline (needs current process verification)

---

## Rules that apply to everything here

- **One page, one query.** Unique `targetQuery` across all five collections,
  enforced at build.
- **Check what a page will route to before writing it.** Run
  `npm run check-monetization` after a build. A page that only links products
  which cannot pay is fine when that is the honest answer, and a wasted slot when
  an equally honest alternative earns.
- **Answer first.** 40–60 words, no preamble.
- **Unique data on every page.** Original cost math, a structured tradeoff, or a
  recommendation naming a real constraint. A page that restates the vendor blogs
  will not rank on any timeline.
- **Never invent a number.** Where a figure can't be sourced, say so on the page.
  Several already do, and it reads as a differentiator rather than a gap.
- **Never fabricate first-hand experience.** No "we tested," no "in our testing."
- **Every post declares a `stack`** and links up; hubs link down. Enforced by
  `check-clusters` and `check-cluster-links`.
- **Posts vs `/compare/` pages.** The generated comparison pages own the raw
  head-to-head query; posts take a narrower framing ("…for a one-person shop")
  so the two don't cannibalize each other.
