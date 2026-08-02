# Traffic plan

Verified 2026-08-02. Everything below was checked against the live page, not
recalled. Where a source turned out to be a trap it is listed under **Do not
bother** with the reason, so nobody re-researches it in six months.

The goal: rank and get cited for buyer-intent queries about nonprofit
fundraising software, so readers arrive already deciding what to buy.

---

## Who actually ranks for "best nonprofit CRM"

Checked in the browser, not inferred from search-result titles.

Three kinds of competitor, and no fourth:

1. **Review aggregators** — softwareconnect, softwareadvice, selecthub. Broad,
   shallow per product, no real pricing for anything quote-based.
2. **Vendor blogs** — Bloomerang and Givebutter ranking for the category they
   sell into.
3. **General nonprofit content sites** — nonprofitpoint.com is the example.
   Worth understanding properly, because it is not what it looks like from the
   SERP.

**What nonprofitpoint.com actually is:** a 73-page-deep general nonprofit
content site whose nav categories are Fundraising Ideas, Fundraising
Strategies, and For Volunteers. There is no software section. Its homepage and
recent output are dominated by "Charities That Help With Rent in Texas,"
"Charities That Help With Security Deposits," "Charities That Help With Car
Insurance" — high-volume assistance-seeker content aimed at people in financial
distress, which has nothing to do with software buyers.

The CRM article is one page out of hundreds. It ranks on **site-wide authority
bought with volume**, then spent on a commercial page. That is a real and
replicable strategy, but it is not evidence that a focused, high-quality
software guide can win the term. It is evidence that a large site with a lot of
easy-to-rank informational pages can.

**The honest read of this SERP:** nobody currently occupying it is a focused,
independent nonprofit-software publication with real pricing depth. That is
simultaneously the opportunity and the warning — the opportunity because the
niche is unclaimed, the warning because nobody has yet proven you can rank there
on depth alone rather than on domain size.

The strategic question that follows is in "Two models" below.

## Two models

**Model A — depth.** Stay narrow. Own every buyer-intent software query in the
nonprofit sector: alternatives pages, pricing pages, comparisons. Fewer pages,
each genuinely better than anything on the SERP. Wins the long tail first, and
the head term only much later if at all. This is what the site is currently
built for.

**Model B — volume, then spend it.** What nonprofitpoint does. Publish a large
volume of easy, high-search-volume nonprofit content that has nothing to do with
software, build domain authority off it, then rank the commercial pages on that
authority. Faster to authority. Dilutes what the site is, and most of the
traffic never buys anything.

These are not exclusive — a middle path is broad *fundraising-operations*
content (grant calendars, board reporting, year-end appeals) that a software
buyer would plausibly also read, which builds authority without turning the site
into a rent-assistance directory. That is the version worth considering.

---

## The blocker to clear first

Cloudflare injects a managed `robots.txt` that blocks **GPTBot, ClaudeBot,
Google-Extended, CCBot, Bytespider, Applebot-Extended, Amazonbot** and declares
`Content-Signal: ai-train=no`.

That is the site telling AI systems not to learn it exists, while the stated
goal is to be cited by them. It also opts out of Google's AI Overviews.

**Fix:** Cloudflare dashboard → domain → **AI Crawl Control** (older accounts:
Security → Bots → "Block AI Scrapers and Crawlers") → off.

Then: **Bing Webmaster Tools** as well as Google Search Console. ChatGPT's
search index is built on Bing. Being absent from Bing is being absent from
ChatGPT.

---

## The anonymity fork

This decides which half of the list below is available.

Almost every editorial link in this sector requires a byline. Verified:

- **Nonprofit Tech for Good** requires "a byline and 'About the Author'
  section."
- **Bloomerang** requires "author bio and headshot."

Two workable answers:

1. **Stay fully anonymous.** Skip guest posting. Lean on directory listings,
   data citation, community answers, and YouTube. Slower, but nothing is
   attached to a real name.
2. **Use an editor persona.** A consistent pen name with a real bio ("15 years
   in institutional fundraising and grants") and no photo. This is standard
   practice for review sites and unlocks guest posts, journalist sourcing, and
   podcast appearances. It is not fabricating experience — the experience is
   real, the name is a pen name. Nobody in the operator's actual network
   connects it back.

Option 2 roughly triples the available channels. It is a personal call, not a
technical one.

---

## Verified link and traffic sources

### Tier 1 — start here

| # | Source | What it is | How to submit | Byline needed |
|---|---|---|---|---|
| 1 | **Nonprofit Tech for Good** — [guest post guidelines](https://www.nptechforgood.com/write-a-guest-post/) | 12,000-subscriber newsletter, 113k Facebook, 265k in LinkedIn groups. Estimates 2,000–4,000 referral visitors per post. Allows **up to 10 backlinks**. | Word doc + images by email per the guidelines page | Yes |
| 2 | **Bloomerang blog** — [guest guidelines](https://bloomerang.com/blog/guest-blogging-guidelines) | Highest-authority blog in the category. 750-word minimum, original only, no overt promotion. | Email Kristen Hay, Marketing Manager, kristen.hay@bloomerang.com, with topic + writing samples | Yes (bio + headshot) |
| 3 | **Facebook: Nonprofit Happy Hour** | ~45,000 members, the most active nonprofit group anywhere. "Which CRM should we use" is asked constantly. | Join, answer questions for two weeks before ever linking | Real name (Facebook) |
| 4 | **Facebook: Fundraising Chat** | ~13,000 members, fundraising-specific | Same approach | Real name |
| 5 | **Reddit r/nonprofit** | Very active; CRM questions daily. Reddit is also weighted heavily by AI search. | **Self-promotion is against the rules.** Answer questions genuinely; link only when directly asked and only occasionally. 90/10 at minimum. | Pseudonymous — anonymity-safe |
| 6 | **Qwoted / Featured / SourceBottle** | Journalist sourcing. Reporters covering nonprofit tech need quotable experts; placements are real publication links. | Free accounts, answer queries daily | Yes |

### Tier 2 — build toward

| # | Source | Note |
|---|---|---|
| 7 | **Candid blog** | Sector leaders contribute. High authority, editorial process, byline required. |
| 8 | **Grant-writing blogs** | Aligned with the strongest category. Most take contributors; each needs individual verification before pitching. |
| 9 | **YouTube** | See below — the biggest unexploited gap. |
| 10 | **State nonprofit associations** | Every state has one under the National Council of Nonprofits. Some maintain member resource lists. **Verify individually** — most are member-gated and there is no standard submission route. Low hit rate, but `.org` authority when it lands. |

### Do not bother

- **Feedspot "Top Blogs" lists.** Pay-to-play, priced per list, with credible
  scam allegations from bloggers and reports that it scrapes and rehosts your
  content and sells contact data to outreach spammers. Skip it.
- **Generic "submit your site" directories.** No authority, and association
  with link farms is a liability.
- **Buying links.** Fast, and the thing Google most reliably penalises.

---

## The channel nobody in this niche is using

Search YouTube for a genuine walkthrough of Bloomerang, DonorDock or
Instrumentl and you find vendor demos and sales webinars. There is no
independent review channel for nonprofit fundraising software.

That matters because:

- YouTube is the second-largest search engine, and video results appear inside
  Google for "[product] review" and "[product] demo".
- Video ranks on watch time and relevance, **not** domain authority. A new
  channel can outrank an old website in a way a new website cannot.
- It works completely faceless: screen recording, voiceover, no camera. The
  most anonymity-friendly channel available.
- Every video description carries a link. Those are nofollow, but they drive
  qualified referral clicks.

**Format that works:** 6–10 minute screen recordings. "Instrumentl pricing
explained," "What DonorDock's ActionBoard actually does," "Bloomerang vs
DonorDock: the pricing difference nobody mentions." Free trials give you
legitimate footage.

Start with the products that pay best and where free trials make recording
easy.

---

## Sequence

### Weeks 1–2 — unblock and measure
1. Turn off Cloudflare AI crawler blocking.
2. Google Search Console + **Bing Webmaster Tools**, submit sitemap to both.
3. GA4.
4. Decide the anonymity fork.

### Weeks 2–8 — build the pages that convert
The gap in the current 105 pages is buyer-intent commercial queries. Only one
of 15 posts targets a pricing or alternatives query.

1. **"[Product] alternatives" cluster** — 6–8 pages. Highest commercial intent
   in the category: someone searching "Bloomerang alternatives" is unhappy and
   shopping today. Near-zero competition. Target the products with the biggest
   installed bases, not the ones that pay best — Bloomerang, DonorPerfect,
   Salesforce NPSP, Neon, Little Green Light, Classy.
2. **Quote-only pricing pages** — nobody publishes what Kindsight, DonorSearch,
   Greater Giving or OneCause actually cost. Whoever collects reported ranges
   owns those queries, and they are exactly what an AI assistant needs an
   extractable answer for.
3. **"How much does X cost" pages** — 3–4, anchored to the benchmark table.

### Weeks 4–12 — start the community flywheel
Runs in parallel; it is the only channel that produces traffic before rankings.

- Reddit and the two Facebook groups: answer real questions, no links for the
  first two weeks.
- Qwoted/Featured daily if the persona decision allows it.
- First 3 YouTube videos.

### Months 3–6 — links and the head terms
- Pitch Nonprofit Tech for Good and Bloomerang (persona permitting).
- Pitch the benchmark table to sector newsletters as free-to-cite data.
- Build the "best nonprofit CRM" page now so it can age; expect nothing from it
  for a year.

### Months 6–12 — compound
- Keep the alternatives cluster growing.
- Internal linking from long-tail winners into the head-term pages.
- Refresh `lastVerified` dates quarterly — this category is freshness-weighted
  and most competitors let their prices rot.

---

## What this is worth

Comparable sites — thinner content, worse data, no practitioner judgment —
trade on Flippa at $2–3k/month profit. This site already has more depth than
most of them.

The economics here are unusually good because the products are expensive and
the commissions are large. It does not take much traffic:

- DonorDock: $500 per customer.
- 4aGoodCause: 25% recurring on $1,188–$5,148/yr subscriptions, **renewing
  every year**. Ten customers on the mid tier is roughly $7,500/yr that repeats
  and compounds.
- monday.com: up to 100% of first-year sales.

That is the difference between this niche and, say, kitchen gadgets. A handful
of conversions a month is a real number, not a rounding error — and recurring
commissions mean year two starts from a base rather than from zero.
