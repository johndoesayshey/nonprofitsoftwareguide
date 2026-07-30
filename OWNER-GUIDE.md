# Owner's Guide — nonprofitsoftwareguide.com

This is your operating manual. It has four parts: the dashboard, the routines,
the playbooks, and your to-do list. The to-do boxes here are live: run
`npm run owner` anytime and the dashboard shows every unchecked box alongside
the site's real status (affiliates, screenshots, stale prices, SEO setup).

To check something off, edit this file and change `- [ ]` to `- [x]`.

---

## The dashboard

```bash
npm run owner
```

Run it weekly. It reads the actual site data and tells you:

| Section | What it checks | Where the data lives |
|---|---|---|
| Affiliate pipeline | Who's earning, who to apply to next, who's awaiting approval | `src/data/affiliates.json` |
| Screenshots | Which top-earner pages still lack a product screenshot | `public/images/platforms/` |
| Price freshness | Any published price older than 90 days | `lastVerified` in each content file |
| Content | Post/page counts, how long since the last post | `src/content/` |
| SEO & setup | GA4, Search Console, About page still hidden | `.env`, `src/pages/about.astro` |
| Your to-dos | Every unchecked box in this file | this file |

Two deeper checks when you want them:

```bash
npm run check-links
```
(verifies every affiliate URL still resolves)

```bash
npm run build
```
(runs every guardrail; it will refuse to build if a published page has a problem)

---

## Launch to-dos (one time)

- [x] Personalize the About page (`src/pages/about.astro`) and make it live (noindex removed)
- [ ] Set up a real mailbox for the site (e.g. hello@nonprofitsoftwareguide.com) and swap it into the About page's contact link (currently a placeholder)
- [ ] Push the repo to GitHub and connect Cloudflare Pages (DEPLOY.md Parts 1-2)
- [ ] Point nonprofitsoftwareguide.com at Cloudflare (DEPLOY.md Part 3)
- [ ] Set up Google Analytics: add `PUBLIC_GA4_ID` in Cloudflare env vars (DEPLOY.md Part 4)
- [ ] Verify Google Search Console, then submit `https://nonprofitsoftwareguide.com/sitemap.xml`
- [ ] Read the /disclosure page once and confirm you're comfortable with the wording (it's drafted for you)

## Affiliate applications (the money list)

Apply in this order: fastest approvals and best payouts first. When one is
approved, open `src/data/affiliates.json`, paste your tracking link into
`affiliateUrl`, change `status` to `"active"`, fill `approvedOn`, then push.
Every existing link on the site starts earning immediately.

- [ ] Jotform — jotform.com/partnership/affiliate (30% first year; approves in ~a day)
- [ ] Donorbox — donorbox.org/affiliate-partner-program (15% of fees for 3 yrs; links are already placed sitewide)
- [ ] DonorDock — donordock.com/partners ($500 per closed customer)
- [ ] Bloomerang — bloomerang.co/partners/join ($250 per closed referral)
- [ ] Instrumentl — instrumentl.com/partners (your best content category)
- [ ] GrantStation — grantstation.com/partner-programs/prp (apply and ask; program is aimed at associations)
- [ ] GiveWP — givewp.com footer → Affiliates (30-40%)
- [ ] 4aGoodCause — 4agoodcause.com/referral-program (25% recurring)
- [ ] DonorSnap — donorsnap.com → Affiliate ($200 per customer)
- [ ] Grantable — email hello@grantable.co (advertised 20% recurring for 24 months; confirm terms when you apply)
- [ ] monday.com — mondaycom.partnerstack.com (self-serve via PartnerStack)
- [ ] Later, once traffic is real: Kindsight, DonorSearch, Neon One (relationship deals; email their partnerships teams with your numbers)

## Screenshots (feeds the top pages)

Save as `public/images/platforms/<slug>.png` (or .webp/.jpg), 1200-1600px wide.
They appear automatically with SEO alt text. Grab the main dashboard view of
each trial account; avoid showing real donor data.

- [ ] instrumentl.png
- [ ] donorbox.png
- [ ] bloomerang.png
- [ ] donordock.png
- [ ] jotform.png
- [ ] grantable.png

---

## Routines

### Weekly (~20 minutes)
1. `npm run owner` — act on anything yellow.
2. Follow up on one affiliate application that's been quiet a week.
3. Skim Search Console → Performance for new queries you rank for; note post ideas.

### Every 2-3 weeks
1. Publish one post from `content-calendar.md` (15 of 30 are live; the calendar
   marks what's next and its target search query).
2. Share it somewhere real: a LinkedIn post, a listserv, one email to a peer.

### Monthly (~1 hour)
1. `npm run check-links` — fix anything that fails.
2. Pick 2-3 targets from `link-targets.md` and send pitches. Lead with the
   benchmark table, not the product pages. Ten placements beat fifty posts.
3. Check affiliate dashboards for clicks/conversions; note which pages convert.

### Quarterly (~2 hours)
1. Re-verify prices on the top pages (Instrumentl, Bloomerang, LGL, Donorbox,
   Jotform, Zeffy): open each vendor's pricing page, update the file if
   changed, and bump `lastVerified` either way. The dashboard flags anything
   over 90 days automatically.
2. Update `/benchmarks` if prices moved (`src/data/benchmarks.json`, bump `updated`).
3. Review Search Console: which pages get impressions but few clicks? Improve
   those titles/descriptions first — it's the cheapest SEO win there is.

---

## Playbooks

### When an affiliate approves you
1. Open `src/data/affiliates.json`, find the product.
2. `affiliateUrl`: paste your tracking link. `status`: `"active"`. `approvedOn`: today's date.
3. If they gave you a reader discount or promo, put it in `readerOffer` — it
   renders next to every link automatically.
4. Push (`git add -A && git commit -m "activate X" && git push`). Done — no
   other file needs touching.

### Publishing a new post
1. Pick the next row in `content-calendar.md` (it has the title, target query,
   parent stack, and affiliate slugs).
2. Copy an existing post in `src/content/posts/` as a template. Keep the rules:
   answer the title question in the first 40-60 words, short sentences, no em
   dashes, product names link to `/go/slug`, end by linking the parent stack.
3. Set `draft: false` and push. The build will stop you if anything's off
   (duplicate query, missing stack, leftover placeholder).

### When a vendor changes pricing
1. Update the platform file in `src/content/platforms/` (frontmatter
   `entryPrice` + any body mentions + the pricing table).
2. Bump `lastVerified`. Check whether the stack pages or `benchmarks.json`
   used that number.
3. Push.

### If a vendor emails you (it will happen)
Vendors sometimes reach out about coverage. Good outcomes: updated pricing
info, a demo account for screenshots, a better affiliate rate, a reader
discount. Keep editorial control — corrections yes, approval no. The
disclosure page states no vendor sees content pre-publication; keep it true.

### SEO watch-list (what actually matters here)
- **Search Console → Performance**: your queries and click-through rates. The
  money queries are "[product] review", "[a] vs [b]", and "when to buy X".
- **Coverage/Indexing**: all ~100 pages should index over time; the `/go/`
  links are correctly blocked (that's intentional).
- **Freshness**: this niche rewards it. The quarterly price re-verify plus a
  post every 2-3 weeks is the whole freshness strategy.
- **Don't**: buy links, spin content, or chase every keyword. The benchmark
  table and real placements from `link-targets.md` are the authority plan.

---

## Where everything lives

| Thing | File |
|---|---|
| Affiliate links & statuses (single source of truth) | `src/data/affiliates.json` |
| Platform pages | `src/content/platforms/*.md` |
| Stack pages | `src/content/stacks/*.md` |
| Blog posts | `src/content/posts/*.md` |
| Benchmark data | `src/data/benchmarks.json` |
| Content plan (30 posts) | `content-calendar.md` |
| Backlink targets (25) | `link-targets.md` |
| Deploy instructions | `DEPLOY.md` |
| Decisions & rationale | `DECISIONS.md` |
| This guide | `OWNER-GUIDE.md` |
