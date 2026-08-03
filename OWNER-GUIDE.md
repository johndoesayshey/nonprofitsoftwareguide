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

## Your email addresses

All three site addresses forward to **nonprofitsoftwareguide@gmail.com** via
Cloudflare Email Routing (free, no mailbox to pay for):

| Address | Used on |
|---|---|
| hello@nonprofitsoftwareguide.com | About page, disclosure page |
| consulting@nonprofitsoftwareguide.com | Consulting page |
| survey@nonprofitsoftwareguide.com | Benchmark survey (reserved) |

Receiving only — you cannot *send* from these yet. To add that later, either pay
for a mailbox on the domain or configure Gmail "Send mail as" with an SMTP
relay. Managed under Cloudflare → Email Routing, in the johndoesayshey@gmail.com
account.

## Search, analytics and crawler settings

**Google Search Console** — verified 2026-08-03 as a *Domain* property (covers
www and non-www, http and https) under **nonprofitsoftwareguide@gmail.com**.
Sitemap submitted; 75 pages discovered.

> **Do not delete the TXT record starting `google-site-verification=EE5b3lDD_`**
> on the root of the domain in Cloudflare DNS. Removing it un-verifies the
> property and you lose all Search Console data and access.

**AI crawlers** — Cloudflare → AI Crawl Control. The master "Block AI Bots"
setting is *Do not block*, so the per-crawler list is what governs.
Allowed: GPTBot, ClaudeBot, Claude-User, CCBot, Google-CloudVertexBot, plus every
live search bot (ChatGPT-User, OAI-SearchBot, Claude-SearchBot, PerplexityBot,
BingBot, Googlebot).
Blocked: Amazonbot, Anchor Browser, Arquivo, Bytespider, FacebookBot,
Meta-ExternalAgent, Novellum, PetalBot, TikTok Spider, Timpibot.
Cloudflare's Managed robots.txt is **off**, so `public/robots.txt` in this repo
is what actually serves.

**Still to set up:** Bing Webmaster Tools and GA4. Both require creating an
account and accepting terms, which has to be done by a person.

## Editing text visually (no typing file names)

```bash
npm run edit
```

Then open **http://localhost:4400/**. It opens as a normal preview of the site:
every link works and you can click around exactly as a visitor would.

To change text, press **✏️ Edit: OFF** in the bar at the bottom to switch it on.
Paragraphs and headings pick up a dashed outline. Click one, type over it, and
press **Save**. The change is written into the real source file and the page
reloads.

- Editing switches itself back **off** every time you load a page, so browsing
  never gets blocked. (While editing is on, clicks land in the text instead of
  following links — that is why it defaults off.)
- After a save the page reloads and stays in edit mode, so a run of edits isn't
  interrupted.
- **Enter** or clicking away finishes a field. **Escape** undoes it.
- The Save button shows how many changes are pending, so nothing saves by surprise.
- Works on every page, not just the homepage.
- **Ctrl+C** in the terminal when you're done.

Saved edits are local only. Tell Claude to push them when you're happy, or they
go out with the next push.

### Seeing the money while you write

Press **💰 Deals** in the editor toolbar. Every product link is tinted by how
much a conversion is worth, with the payout printed right on it:

| Colour | Badge shows | Means |
|---|---|---|
| green | `$500`, `$250`, `25%` | **High.** Worth building a page around. |
| blue | `15%`, `30%`, `$200` | **Medium.** Fine to recommend, smaller cheque. |
| amber | `PRP`, `CAP` | **Low.** Real program, small money. |
| red, struck through | `—` | **Cannot earn.** No program exists, ever. |
| amber left bar | — | A product that *could* pay is named here with no link. |

Hover any of them for the payout, why it is rated that way, the reader offer,
and (as a footnote) whether you have applied yet. The toolbar totals the page:
`3 high · 1 medium · 1 low · 2 can't earn · 4 unlinked`.

Use it to sanity-check where your writing effort is going. A 900-word page whose
links are all red is a page that will never pay you, however good it is. That is
sometimes the right call (Zeffy and Airtable earn nothing and are covered anyway,
because a guide that hides the free options is not credible) but it should be a
decision, not an accident.

The ratings live in `src/data/affiliates.json` as `payout`, `potential` and
`badge`. They are planning judgments, not promises. Re-rate them once you have
real conversion data.

### Telling Claude what to change

Press **💬 Notes** in the editor toolbar, then click *any* element on the page,
not just text. A little panel opens where you type what you want changed:

> "Move this below the ledger" · "Make this smaller" · "This should be two
> columns" · "Swap this for the Instrumentl card"

There are one-tap chips for the common ones (Move up, Make bigger, Remove this),
and an **↑ Wider** button that selects the parent element when you meant the
whole section rather than the bit you clicked. Elements with an open note get a
purple 💬 pin, and clicking a pinned element again lets you mark it **Done**.

Then just tell Claude **"read my notes"**. Each note is saved with the page, the
element, and the exact source file and line, so there is no guessing about which
thing you meant. Claude can also run:

```bash
npm run notes
```

Notes live in `feedback.json`, which is deliberately kept out of git: the repo is
public and these are your private working notes.

Notes mode pauses text editing while it is on (the two would fight over your
clicks). Turn it off to go back to typing.

Two limits worth knowing: text with a link inside it (like the "What's in a
stack" paragraph) is not click-editable, and if the exact same sentence appears
in two files the editor will skip it rather than guess. In both cases just ask
Claude to make the change.

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
- [x] Push the repo to GitHub and connect Cloudflare Pages (live at nonprofitsoftwareguide.pages.dev)
- [x] Point nonprofitsoftwareguide.com at Cloudflare (live; Cloudflare nameservers, apex + www)
- [ ] Set up Google Analytics: add `PUBLIC_GA4_ID` in Cloudflare env vars (DEPLOY.md Part 4)
- [ ] Verify Google Search Console, then submit `https://nonprofitsoftwareguide.com/sitemap.xml`
- [ ] Read the /disclosure page once and confirm you're comfortable with the wording (it's drafted for you)

## The homepage award (your best conversion slot)

The card in the top right of the homepage is the most valuable space on the
site. Point it at whichever program pays you best and is actually approved.

To change the winner, edit `src/data/featured-award.json`:

- `slug` — any platform slug (`jotform`, `instrumentl`, `donorbox`, `donordock`,
  `bloomerang`, `grantable`...). Price, link and reader discount are pulled in
  automatically from that platform's page and `affiliates.json`.
- `award` — the award name, e.g. "Most Versatile Software"
- `verdict` — one or two honest sentences on why it won
- `cta` — the button text
- `show` — set to `false` to hide the card entirely

Rotate it when a better-paying program approves, or seasonally to keep the page
fresh. Keep the claim honest and specific: it is labeled Editor's Pick because it
is your editorial opinion, not a third-party award, and that distinction is what
keeps it credible with both readers and affiliate managers.

## Affiliate applications (the money list)

Apply in this order: fastest approvals and best payouts first. When one is
approved, open `src/data/affiliates.json`, paste your tracking link into
`affiliateUrl`, change `status` to `"active"`, fill `approvedOn`, then push.
Every existing link on the site starts earning immediately.

- [ ] **DonorDock** — donordock.com/partners · **$500 cash per new paid customer**, reader gets 10% off. Verified 2026-07-31. Best payout on the site.
- [ ] **4aGoodCause** — 4agoodcause.com/referral-program · **25% recurring on every renewal**, via FirstPromoter. Verified 2026-07-31. Only compounding deal you have.
- [ ] **monday.com** — mondaycom.partnerstack.com · **up to 100% of first-year sales**, tiered. Verified 2026-07-31. Base rate not published.
- [ ] **Donorbox** — donorbox.org/affiliate-partner-program · **15% of fees for 3 years**, $50 min payout. Verified 2026-07-31. Link-only attribution.
- [ ] **Jotform** — jotform.com/partnership/affiliate · **30%, first year only**, ~1 day approval, 60-day qualifying period. Verified 2026-07-31. Fastest to go live.
- [ ] **Bloomerang** — bloomerang.partnerstack.com · program is real but **the rate is not published anywhere**. Ask for it in writing. The "$250" figure was never confirmable.
- [ ] **Instrumentl** — instrumentl.com/partners · **$50 flat per customer**, reader gets $50 off first month. Verified 2026-07-31. Much smaller than it looked; still worth linking for the reader discount and category strength.
- [ ] Ask-only, no live program page (all 404 or moved when checked 2026-07-31): **GrantStation**, **GiveWP** (now under LiquidWeb), **DonorSnap**, **Grantable**. Email each if the product matters to your coverage, but plan no revenue from them.
- [ ] Later, once traffic is real: Kindsight, DonorSearch, Neon One (negotiated deals, highest contract values on the site)

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
