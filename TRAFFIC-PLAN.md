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

## The biggest idea: scale inside the niche, not outside it

The volume model works. It does not require writing about rent assistance.

There are hundreds of buyer-intent software queries in this sector and the site
currently addresses maybe thirty. Filling that out is the same authority play
nonprofitpoint runs, except every page is commercial and every page is on brand.

**Four page types, all near-zero competition:**

1. **Vertical pages.** "Best CRM for churches," "donor management for animal
   rescues," "best CRM for schools," "fundraising software for food banks,"
   "arts organizations," "animal shelters," "youth sports," "hospital
   foundations." Checked the SERP: these are currently answered by generic
   "best nonprofit CRM" roundups that mention a vertical in one line, plus
   vendor blogs. Almost nobody has a dedicated page. Search intent is high and
   commercial, and the operator's K-12 knowledge makes the schools one
   genuinely authoritative. **Roughly 12-15 pages.**

2. **Alternatives pages.** "Bloomerang alternatives," "DonorPerfect
   alternatives," "Salesforce Nonprofit Cloud alternatives," "Blackbaud
   alternatives," "Classy alternatives," "Kindful alternatives." The searcher is
   unhappy with what they have and shopping today. Highest commercial intent
   available. **8-12 pages.**

3. **Pricing pages for quote-only products.** Kindsight, DonorSearch, Greater
   Giving, OneCause, WealthEngine, Blackbaud publish nothing. Whoever collects
   reported ranges owns those queries — and they are precisely the questions AI
   assistants get asked and cannot currently answer. **6-8 pages.**

4. **Integration pages.** "Bloomerang QuickBooks integration," "donor CRM that
   syncs with Mailchimp," "Salesforce nonprofit accounting integration." Long,
   specific, low competition, and a real purchase blocker for buyers.
   **10+ pages.**

That is 40-50 new pages, all commercial, all on brand, all defensible. It is
the same volume strategy without becoming a different website.

**Also: widen the product roster.** The site covers 19 products. The
aggregators cover 25-40. Missing names that people actually search: Blackbaud
/ Raiser's Edge, Virtuous, Kindful, CharityEngine, Aplos, Bonterra, Salsa,
Network for Good, Donately, Funraise. Each addition multiplies the comparison
matrix — 20 products in a category generate 190 possible pairings.

---

## Buy authority instead of earning it

The operator is already browsing Flippa. Use it as a supply channel, not just
as market research.

- **Acquire a small nonprofit site or newsletter** with existing traffic and
  backlinks, then merge or 301 it in. Buys years of domain age instantly.
  Typical price for a small niche site is 30-40x monthly profit, so a site
  doing $200/mo runs $6-8k.
- **Expired domains** in the nonprofit space with real backlink profiles.
  Cheaper, riskier, requires checking the backlink profile is clean and the
  domain was never spammed.
- **Buy a newsletter** rather than a site. A 5,000-subscriber nonprofit
  newsletter is a distribution channel that does not depend on Google at all.

This is the single fastest route to domain authority and nobody has to know who
bought it.

---

## Paid traffic — the part that works this month

Organic takes months. Paid tests the economics in a week and tells you whether
the pages convert before you build fifty more.

| Channel | Cost | Why |
|---|---|---|
| **Nonprofit newsletter sponsorships** | ~$100-500 per send | The fastest qualified traffic in this sector. Nonprofit Tech for Good sells them; so do most sector newsletters. Cheap, targeted, and no gatekeeper judging whether you are "promotional." |
| **Reddit ads** | Low CPC | Can target r/nonprofit and r/fundraising directly. Sidesteps the self-promotion rules entirely — ads are allowed where posts are not. |
| **Google Ads on product terms** | $5-15 CPC | Not for profit at first. For *data*: run $300 against "bloomerang alternatives" and "instrumentl pricing" and you learn real conversion rates before writing the organic pages. |
| **Meta ads by job title** | Moderate | Development Director / Executive Director targeting is available and the audience is large. |

The point of paid here is not to buy revenue. It is to learn which pages
convert, so the organic effort goes where the money is.

---

## Make other people share it for you

This is the answer to the Facebook problem. Groups punish self-promotion; they
do not punish members posting a genuinely useful free thing they found.

Build assets whose natural behaviour is being passed around:

- **A CRM evaluation scorecard** (spreadsheet or PDF). Every ED running a
  software search wants one and none exist that aren't vendor-branded.
- **A vendor demo question checklist** — the twenty questions to ask, including
  the ones vendors dislike.
- **A data migration checklist** for leaving an old CRM.
- **An RFP template** for nonprofit software.
- **The annual pricing report** — package the benchmark as a dated, citable
  PDF. "2026 Nonprofit Software Pricing Report" is a thing journalists and
  newsletters link to; a comparison page is not.

Post these once where allowed, and then other people carry them. That is how
you get into 45,000-member groups without ever pitching.

---

## Get the vendors to link to you

Underrated and almost free. Vendors want independent reviews to point at.

- When an affiliate application is approved, ask the affiliate manager whether
  they feature partner reviews. Many maintain a "what people say" or press page.
- Vendor comparison pages ("Bloomerang vs X") routinely cite third-party
  reviews. A well-argued, fair review is something a vendor marketing team will
  happily link.
- Tier B partners (Kindsight, DonorSearch, Neon) are relationship deals anyway
  — a link is a smaller ask than a commission and a reasonable opener.

These are high-authority, topically perfect links, and asking a vendor is not
asking a favour of anyone in the operator's professional circle.

---

## Own an audience so Google isn't the only channel

- **A newsletter.** "What changed in nonprofit software pricing this month" is
  a genuinely useful five-minute read nobody publishes. Compounds, survives
  algorithm changes, and can be pseudonymous.
- **Substack specifically.** It has its own discovery and recommendation
  network, which is a traffic source in itself, and it is the most
  anonymity-friendly publishing platform there is.

Note this contradicts CLAUDE.md's "no newsletter backend" scope line. Worth
revisiting — that decision was made before traffic was the priority.

---

## Discovery engines that aren't social media

- **YouTube** — see below. Still the biggest gap.
- **Quora** — answers rank in Google for years and questions like "what CRM
  should a small nonprofit use" already exist with weak answers. Pseudonymous,
  no gatekeeper.
- **Pinterest** — genuinely works for checklist and infographic content, and
  nonprofit-admin content performs there. Nearly zero competition from software
  publishers.
- **Slideshare / carousel reposting** — the LinkedIn carousel already built can
  be reposted here for a second life.

---

## Communities beyond Facebook

Facebook groups are strict, but they are not the only rooms.

- **LinkedIn groups** — Nonprofit Tech for Good alone administers groups
  totalling 265,000+ members.
- **NTEN community** — the nonprofit technology professional association. This
  is the single most on-topic community that exists for this site.
- **TechSoup forums** — where nonprofits already go to ask about software.
- **Grant Professionals Association** — matches the strongest content category.
- **Nonprofit Slack and Discord communities** — smaller, far more tolerant of
  members sharing their own work.

---

## Optimise specifically for AI answers

Distinct from Google SEO and currently much less contested.

- Unblock the AI crawlers (above). Nothing else matters until that is done.
- **Bing Webmaster Tools** — ChatGPT search runs on Bing.
- **Add `/llms.txt`** — an emerging convention pointing AI systems at your
  key pages in plain text. Cheap to add, no downside.
- **Keep facts extractable** — prices in real HTML tables with dates attached,
  never in images. The site already does this, which is a real advantage.
- **Reddit and YouTube are weighted heavily** in AI answers, which is a second
  reason to be present on both.

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

1. ~~**"[Product] alternatives" cluster** — 6–8 pages.~~ **DONE 2026-08-03.**
   Thirteen pages shipped at `/alternatives/<slug>/`, plus an index at
   `/alternatives/`, linked from the footer and the top of `/compare/`.
   Own content collection with its own schema (`reasonsToLeave`, `picks`,
   `stayIf`) so the shape is enforced rather than remembered.

   - **Donor CRM** — Blackbaud Raiser's Edge NXT, DonorPerfect, Salesforce for
     Nonprofits, Bloomerang, Little Green Light
   - **Donation processing** — Classy, Givebutter, Donorbox
   - **Prospect research** — iWave/Kindsight, DonorSearch, WealthEngine (all
     three; the category earns no commission and is covered for topical
     authority and search traffic, per the CLAUDE.md weighting)
   - **Grant research** — Candid Foundation Directory, GrantStation

   Deliberately **no Instrumentl alternatives page.** It is the only grant
   research product with a live program, so it is the destination in that
   category, not the thing readers get routed away from. Candid and GrantStation
   both recommend it first.

   Pick order is sorted at render time by `valueOf()` from `affiliate-value.ts` —
   the same rule the Software menu, category hubs and comparison index use.
   Hand-ordered frontmatter drifts; this can't. Ties keep authored order so
   editorial judgment still decides between two products worth the same.

   Every page carries a real price ladder for each recommendation, a
   survey-derived spend benchmark, and a migration section (recurring-donor
   re-enrollment on the processing pages, soft-credit and household-record
   fidelity on the CRM pages, "screen a file you can verify" on the prospect
   pages). `stayIf` is on every page deliberately — a switching guide that never
   says "stay" reads as a sales page.

   Still open in this workstream: pages for products we don't yet cover
   (Kindful, Virtuous, CharityEngine, Funraise, Network for Good) are blocked on
   workstream 5 below, since a switching guide needs somewhere credible to send
   people.
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

---

## Press releases and wire services — researched 2026-08-02

**Short version: skip the paid wire, pitch the data directly.**

### Why the wire itself does nothing for rankings

Google's guidance is explicit and long-standing: links in press releases should
carry `rel="nofollow"`, and press releases are to be treated like
advertisements. Wire services apply nofollow consistently, which means a
syndicated release passes **no link equity at all**. A release that lands on 400
sites produces 400 links that count for nothing.

The value of a wire release is indirect — brand signal, entity recognition, and
the chance a real journalist notices. One editorial link from someone who read
it and wrote their own piece is worth more than the entire syndication.

### The survey PDF is genuinely pitchable, though

Original data is the one thing outlets in this sector will cover from an unknown
publisher. "100 US fundraisers reported what they spend on software" is a real
story with real numbers, and the PDF makes it citable. Strong angles:

- Nonprofits raising under $250k spend a mean of **$2,611/yr** on software.
- **95%** of them spend nothing at all on wealth screening.
- Donation processing is the biggest line at **every** size, ~a third of spend.
- Mean spend runs from **$2,611 to $96,815** across the four size bands.

### Where to send it, cheapest first

| Target | What it is | Cost | Note |
|---|---|---|---|
| **Philanthropy News Digest** (Candid) | Sector news digest | Free | Does **not** republish releases — writes summaries from them. Being summarised by Candid is a strong, genuinely authoritative mention. |
| **NonProfit Times**, **NonProfit PRO** | Trade press | Free to pitch | Cover sector research. Direct editor pitch, not a wire blast. |
| **Sector newsletters and blogs** | Small lists, engaged readers | Free | Highest hit rate of anything here. Offer the data, not a product. |
| **eReleases "CauseWire"** | Wire with a nonprofit discount | ~$300-400+ | Discount is aimed at 501(c)(3)s; this site is a commercial publisher, so expect list price. |
| **Send2Press** | Wire, has nonprofit PR grants | Varies | Same eligibility caveat. |
| **PR Newswire / Business Wire** | Full wire, philanthropy category | ~$800-8,000 | Buys reach and "as seen in" logos. Not links. Hard to justify here. |

### The move

Write the release once. Send it as a personal email to a named editor at ten to
fifteen outlets, with the PDF attached and the headline finding in the subject
line. Consider giving one outlet a 48-hour exclusive — that is often what turns
a summary into a real article. Total cost: nothing.

**One practical constraint:** press outreach usually wants an attributable
quote, and most outlets will ask who conducted the survey. That is the same
fork as the guest-post section above — a consistent editor persona resolves it;
full anonymity makes press coverage considerably harder.
