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

- [x] **DonorDock** — ✅ **approved, link live** 2026-08-04
- [x] **Donorbox** — ✅ **approved, link live** 2026-08-04
- [x] **4aGoodCause** — ✅ **approved, link live** 2026-08-04
      → still to do: **ask for a reader discount**
- [x] **Jotform** — ✅ **approved, link live** 2026-08-04
- [x] **PartnerStack account** — ❌ **denied** (stated reason: not enough
      nonprofit-specific content). **Appealed 2026-08-04**, pending. Gated
      behind it while denied: Ticket Tailor, Xero, Brevo, monday.com,
      Bloomerang's agency track. **Zeffy no longer waits on this** — see below.
- [x] **Zeffy** — 🔀 found a **direct application outside PartnerStack**;
      submitted. Compare the terms against PartnerStack's published 30% of
      tips / ~$500 per signup before accepting.
- [ ] **Eleo** — https://eleoonline.com/consultant-partner-interest/ *($100/referral)*
      → it is the *Consultant* Community form, so lead with the consulting work

Full detail and the rest of the list: `AFFILIATE-APPLICATIONS.md`.

**Expected response times**, so nothing gets chased too early:
Jotform ~1 business day · DonorDock, 4aGoodCause, Donorbox, PartnerStack — days
to a couple of weeks · Instrumentl up to a month.

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

### The three findings that carry the story
Corrected 2026-08-05 — the original four leaned on "95% spend nothing on
wealth screening," which reads as a non-event rather than a finding. Verified
fresh against `src/data/survey-2026.json`; ready-to-send copy using these is
in `OUTREACH-DRAFTS.md`.

- **36% of nonprofits raising under $250K have no donor database at all** —
  the sharpest, most "ouch, that's my sector" number in the dataset
- **Software spend scales 37x between the smallest and largest nonprofits
  surveyed** — $2,611/yr mean at the bottom, $96,815/yr at the top
- **Donation processing, not the CRM, is the single largest software line at
  every size** — 39% of the total budget for the smallest shops, $30,824/yr
  alone at the top

### Write it once — done
- [x] One-pager written, see `OUTREACH-DRAFTS.md` — the master template plus
      subject-line options, PDF attached, links `/benchmarks/`.

### Send as individual emails
Not a wire. Named editor, personal email, PDF attached. Google treats press
release links as advertisements and wire services nofollow them, so a syndicated
blast produces zero link equity. One editor who writes their own piece is worth
the entire wire.

**Use the verified Tier 1 from `OUTREACH-SHORTLIST.md`, not a generic press
list** — Nonprofit Quarterly and Blue Avocado were both checked and ruled out
(bylined-essay and first-person requirements, incompatible with staying
anonymous).

**Status as of 2026-08-05, see `OUTREACH-DRAFTS.md` for the full story:**

- [x] **Nonprofit Tech for Good** — heather@nptechforgood.com — **sent** (the
      operator's own version, PDF attached)
- ~~NonProfit PRO~~ — verified as a real contact, but ruled out on editorial
      fit; not pursuing
- ~~Whole Whale / Nonprofit News Feed~~ — turned out to be the agency's own
      content marketing, not an outlet; dropped
- [ ] **Jeff Brooks, Future Fundraising Now** — jeff@jeff-brooks.com — draft
      ready in Gmail, needs the PDF attached and a send
- [ ] **National Council of Nonprofits** — via site contact form, not email;
      text is in `OUTREACH-DRAFTS.md` ready to paste, has to be submitted
      by hand since their site blocks automated form submission
- [ ] **DH Leonard** — Megan@dhleonardconsulting.com
- [ ] **RKD Group / Rossi's Roundup** — connect@rkdgroup.com
- [ ] **Missions to Movements** — kat@positiveequation.com
- [ ] **Philanthropy News Digest** (Candid) — pnd@candid.org, Tier 2 but the
      single most authoritative outcome available if it lands
- [ ] Consider offering **one** outlet a 48-hour exclusive once the first
      replies come in. That is often what turns a summary into a real article.

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

## Activity log

Keep this. The only way to know which channel works is to have written down what
was tried and when — and to be able to spot a pattern before a moderator does.

| Date | Channel | What | Result |
|---|---|---|---|
| 2026-08-03 | Affiliate | DonorDock, Donorbox, 4aGoodCause, PartnerStack, Jotform, Instrumentl applied | All pending |
| 2026-08-03 | Reddit | 7 comments including a site link | **6 survived, 1 removed** |

### On the Reddit result

Six of seven is a normal rate and not worth changing anything over. A single
removal is almost always the site-wide spam filter reacting to account age and
link history rather than a human objecting to the comment.

Two things worth knowing, though, because they have different fixes:

- **Removed within seconds** — automod or the site-wide filter. It is about the
  account, not the content. It resolves as the account builds karma and age.
- **Removed hours later** — a human moderator. That is a signal about the comment
  itself, and it is worth reading that subreddit's rules on self-promotion before
  posting there again.

**Do not repost the removed one.** Reposting after a removal is the single fastest
way to get an account flagged, and it converts one lost comment into a lost
channel.

**Watch the pattern, not the individual comment.** Moderators notice a link
appearing across many comments far more readily than any one comment. Keep the
ratio well past 9:1 — most comments answering a question with no link at all —
and vary which page gets linked rather than pointing everything at the homepage.

**These comments are worth more than the clicks.** Reddit is weighted unusually
heavily in AI search results, so answers there feed ChatGPT and Perplexity as
well as humans. A comment that ranks for "best nonprofit CRM small budget" keeps
working long after the thread stops being read.

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
