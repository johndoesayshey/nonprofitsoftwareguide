# Content calendar

Rewritten 2026-08-03. The original planned 30 posts; the site now carries 75
pages with a unique `targetQuery` across five collections, so a list of unwritten
post ideas had stopped describing the work. This is a status page plus the queue.

## Where the content actually is

| Collection | Pages | What it does |
|---|---|---|
| `platforms` | 26 | Product write-ups. The money pages. |
| `posts` | 17 | Blog. Concrete how-to and comparison questions. |
| `guides` | 15 | `/best/` — category head terms and vertical pages. |
| `alternatives` | 13 | `/alternatives/` — switching guides. Highest commercial intent. |
| `stacks` | 4 | The primary content unit. One per shop size. |

Plus `/pricing/` and `/benchmarks/`, which exist to be cited rather than to
convert. All 75 pages are published and every `targetQuery` is unique, enforced
at build by `scripts/check-queries.mjs`.

---

## Category weighting — measured, and short of the floor

CLAUDE.md requires **at least 60% grant research and prospect research**, and warns
against drifting back toward CRM content because that category has more competitors
and worse economics.

Run `npm run check-weighting` for the live number. As of 2026-08-03:

| Category | Pages | Share |
|---|---|---|
| Donor CRM | 32 | 39% |
| **Grant research** | 22 | **27%** |
| Donation processing | 13 | 16% |
| **Prospect research** | 12 | **14%** |
| Events & auctions | 2 | 2% |
| Forms & other operations | 2 | 2% |

**Grant + prospect: 41%, against a 60% floor.**

### A correction to an earlier version of this file

An earlier revision put this at 24% and called it a serious drift. That figure was
wrong. It counted only platforms, alternatives and guides, because **posts carried
no `category` field at all** — so the entire blog, which is where most grant and
prospect content lives, was invisible to the tally. Writing ten grant posts moved
the number by zero, which is what exposed the bug.

Posts now declare a category, and `scripts/check-weighting.mjs` measures all four
collections. A requirement nobody can measure is a requirement that drifts, and this
one drifted precisely because nothing measured it.

### How the gap opened, and whether 60% is reachable

The alternatives cluster and the vertical pages are both inherently CRM-shaped.
People search "[CRM] alternatives" and "best donor management software for
churches"; nobody searches "Instrumentl alternatives for churches." Each page was
the right page to build, and the aggregate leaned CRM anyway.

Being straight about the arithmetic: at 81 categorized pages, clearing 60% needs
about **40 more** grant/prospect pages if nothing else is published. Waves A and B
below are 18. That gets to roughly 53%, not 60%.

So either the remaining waves grow, or some CRM-side pages get consolidated, or the
floor is treated as a direction rather than a gate. The first is the honest answer
while the categories still have unwritten queries worth owning — grant research is
the only category where high ACV and a working public affiliate program overlap.

**Rule for now: grant or prospect research only, until `check-weighting` clears
50%.** Nothing new in donor CRM before then, however good the query looks.

## Wave A — grant research (write next)

Each parents to a stack hub. None needs new product research.

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

## Wave B — prospect research (after A)

This category earns traffic and topical authority rather than commission — every
vendor in it is a negotiated deal. Cover it thoroughly; expect the revenue from
Wave A.

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

## Wave C — held until the ratio clears

Do not start these while grant/prospect is under 40%.

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
- **Every page declares a `category`.** Not for routing — so the weighting above
  stays measurable. Run `npm run check-weighting` before planning a wave.
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
