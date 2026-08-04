# Promotion checklist — do these, in this order

Written 2026-08-03. `TRAFFIC-PLAN.md` holds the strategy and the research;
`link-targets.md` holds the 25 backlink prospects. **This file is the action
list.** Everything here is a task with a URL and a time estimate.

**The anonymity rule shapes all of it.** No name, no byline, no photo, and
nothing that requires anyone in the sector to know who runs this. That rules out
guest posts requiring a bio, podcast appearances, and Qwoted-style journalist
sourcing. It does *not* rule out a publication-branded LinkedIn presence, Reddit,
or pitching data to editors — data is citable without an author.

---

## Week 1 — setup (about 3 hours total)

### Affiliate applications — 45 minutes, do these first
Approval takes days to weeks, so start the clock before anything else.

- [ ] **DonorDock** — https://www.donordock.com/partners *(~$500/referral)*
- [ ] **4aGoodCause** — https://4agoodcause.firstpromoter.com/ *(25% recurring)*
      → while you are in, **ask for a reader discount**
- [ ] **Donorbox** — email `partner@donorbox.org` *(their form is broken; say so)*
- [ ] **PartnerStack account** — https://dash.partnerstack.com/signup
      → then apply inside it to **Ticket Tailor**, **Xero**, **Brevo**
- [ ] **Jotform** — https://www.jotform.com/partnership/affiliate/application/

Full detail and the rest of the list: `AFFILIATE-APPLICATIONS.md`.

### LinkedIn Page — 30 minutes
A **Page**, not your personal profile. Pages post as the publication, which keeps
the anonymity rule intact — the admin is not publicly visible.

- [ ] Create a Company Page: "Nonprofit Software Guide"
- [ ] Category: Media/News. Logo: the site mark from `public/images/`
- [ ] Tagline: *Independent pricing and comparisons for nonprofit fundraising software*
- [ ] Website link → the homepage
- [ ] First post: the survey (see Week 2)

### Reddit — 20 minutes, then two weeks of patience
- [ ] Create an account with **no identifying detail**. Pseudonymous is fine here
      and is the one major community that is anonymity-safe.
- [ ] Join r/nonprofit, r/fundraising, r/nonprofittech
- [ ] **Do not link to the site for two weeks.** Answer CRM and pricing questions
      from knowledge only. Self-promotion is against the rules and the mods
      enforce it. After that, link only when someone directly asks what to buy,
      and no more than one in ten comments.

Reddit is also weighted unusually heavily by AI search, so answers there feed
ChatGPT and Perplexity results as well as humans.

### Analytics baseline — 15 minutes
- [ ] Confirm GA4 is recording (it is live: `G-PX225BYE29`)
- [ ] In Search Console, note today's impressions and clicks. That is the number
      everything below is trying to move.

---

## Week 2 — the survey press push

This is the highest-value single thing available, because original data is the
one asset an unknown publisher can get covered on.

### The four findings that carry the story
All verified against `src/data/survey-2026.json`:

- Nonprofits raising **under $250k spend a mean of $2,611/yr** on all software
- **95% of them spend nothing at all** on wealth screening
- **Donation processing is the largest line at every size** — around a third of spend
- Total spend runs **$2,611 → $96,815** across the four size bands

### Write it once — 90 minutes
- [ ] One page. Headline finding in the first sentence, method in the second
      paragraph, the four bullets above, link to `/benchmarks/`, PDF attached.
- [ ] Subject line that is the finding, not the announcement:
      *"New survey: 95% of small nonprofits spend nothing on wealth screening"*

### Send as individual emails — 2 hours
Not a wire. Named editor, personal email, PDF attached. Google treats press
release links as advertisements and wire services nofollow them, so a syndicated
blast produces zero link equity. One editor who writes their own piece is worth
the entire wire.

- [ ] **Philanthropy News Digest** (Candid) — writes summaries from releases.
      A Candid mention is the single most authoritative outcome available here.
- [ ] **The NonProfit Times** — trade press, covers sector research
- [ ] **NonProfit PRO** — same
- [ ] **Nonprofit Quarterly** — research-friendly
- [ ] **Blue Avocado** — practitioner audience, small and engaged
- [ ] Five to ten sector newsletters — highest hit rate of anything on this list
- [ ] Consider offering **one** outlet a 48-hour exclusive. That is often what
      turns a summary into a real article.

**Cost: $0.** Skip the paid wire (~$300–$8,000) — see TRAFFIC-PLAN for why.

⚠️ **The one thing that will come back:** most editors ask who conducted the
survey. Decide the answer before you send. "Nonprofit Software Guide, an
independent publication" works for some outlets and not others, and that is the
real constraint on press coverage here — not the data.

---

## Ongoing — weekly, ~90 minutes

### LinkedIn Page — 2 posts a week
Post the finding, not the link. The link goes in the first comment or at the end.

Rotating angles that need no byline:
- **A number from the survey** — one chart, one sentence, link to `/benchmarks/`
- **A price nobody publishes** — "Kindsight is reported from ~$4,150/yr. Here is
  what else costs what." → `/compare/`
- **A correction** — "Aplos has no QuickBooks integration, despite what the
  roundups say." Corrections travel further than recommendations.
- **A decision rule** — "95% of shops under $250k spend $0 on wealth screening.
  Here is when it starts paying." → `/best/wealth-screening-software/`
- **A switching guide** — "What it actually costs to leave Raiser's Edge."

### Reddit — 3–4 genuine answers a week
Keep the 90/10 ratio. The goal is being the account people recognise as useful,
not traffic this week.

### One new page a week
Priority order now comes from `npm run check-monetization`, not from category.
Anything routing to DonorDock, Donorbox or 4aGoodCause first.

---

## Month 2–3

- [ ] **Resource-page submissions.** State nonprofit associations under the
      National Council of Nonprofits. Verify each individually — most are
      member-gated. Low hit rate, real `.org` authority when it lands.
- [ ] **Vendor links.** Vendors link to comparisons that treat them fairly. We
      have 25+ head-to-heads and several pages that correct the record in a
      vendor's favour. A short, factual email to a marketing manager — *"we cover
      you here, here is what we got right and wrong"* — converts better than a
      link request.
- [ ] **Refresh `lastVerified` quarterly.** This category is freshness-weighted
      and most competitors let their prices rot. `npm run check-freshness`.

---

## Not worth doing

- **Paid wire distribution.** Nofollowed by design. Zero link equity.
- **Guest posts requiring a byline** — Nonprofit Tech for Good, Bloomerang blog.
  Both are excellent and both need a named author. Revisit only if the anonymity
  decision changes.
- **Qwoted / Featured / SourceBottle.** Journalist sourcing needs an attributable
  expert.
- **Facebook groups.** Nonprofit Happy Hour (~45k) and Fundraising Chat (~13k)
  are the most active communities in the sector, but Facebook uses real names.
- **Buying links.** Obvious, and this category is small enough that it gets
  noticed.

---

## What to measure

Check monthly, in this order:

1. **Search Console impressions** — moves first, before clicks. The leading signal.
2. **Clicks to `/go/*`** in GA4 — intent, and the number that becomes revenue.
3. **Referring domains** — ten good ones beat fifty posts.
4. **`npm run check-monetization`** — are the pages getting traffic the ones that
   can pay?

Rankings take months in this category. Impressions moving with zero clicks is
normal and good at the start; it means pages are being seen and the titles need
work, not that the strategy is wrong.
