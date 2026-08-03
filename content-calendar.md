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

## ⚠️ The category weighting has drifted and needs correcting

CLAUDE.md is explicit: **at least 60% grant research and prospect research**, and
"do not let the calendar drift back toward CRM posts just because that category
has more competitors writing about it."

That is exactly what happened. Current split across every page carrying a category:

| Category | Pages | Share |
|---|---|---|
| Donor CRM | 27 | **50%** |
| Donation processing | 10 | 19% |
| Prospect research | 7 | 13% |
| Grant research | 6 | 11% |
| Events & auctions | 2 | 4% |
| Forms & ops | 2 | 4% |

**Grant + prospect research is 24%, against a 60% floor.**

How it happened: the alternatives cluster and the vertical pages are both
inherently CRM-shaped. People search "[CRM] alternatives" and "best donor
management software for churches"; nobody searches "Instrumentl alternatives for
churches." Every individual page was the right page to build. The aggregate
drifted anyway, which is the exact failure mode CLAUDE.md warned about.

It matters commercially, not only as spec compliance. Grant research is the only
category where high ACV and a working public affiliate program overlap. Donor CRM
has the most competitors writing about it and the worst economics in the sector.

**Correction: everything in the next two waves is grant or prospect research
until the ratio clears 40%, then alternate.** Nothing new in donor CRM until
then, however good the query looks.

---

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

- Integration reference page (research in progress)
- Remaining verticals: libraries and Friends groups, environmental, international
  NGOs, professional associations
- Head terms: best events and auction software, best nonprofit forms software
- Alternatives pages for the newly added products, once each has traffic
- Grants.gov / SAM.gov registration timeline (needs current process verification)

---

## Rules that apply to everything here

- **One page, one query.** Unique `targetQuery` across all five collections,
  enforced at build.
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
