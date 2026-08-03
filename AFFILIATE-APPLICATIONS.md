# Affiliate applications — verified working list

Every URL below was opened in a browser on **2026-08-03** and confirmed to load a
real application. Where the vendor's own published link is broken, that is stated.
Nothing here is copied from a roundup post.

Work top to bottom. The first four are where the money is.

Use `nonprofitsoftwareguide@gmail.com` and the site URL
`https://nonprofitsoftwareguide.com` on every form.

---

## Apply now — self-serve, no gatekeeper

### 1. DonorDock — $500 per new paid customer

**https://www.donordock.com/partners** → application form is embedded on the page (7 steps)

The best economics on the list by a wide margin, and the product we recommend most
often. Free to join, no contract, no minimums or tiers, paid monthly. Referrals get
10% off their first payment, which is a real reader offer we already advertise.

Their FAQ was last updated 2026-03-25, so the terms are current.

---

### 2. 4aGoodCause — 25%, recurring on every renewal

**https://4agoodcause.firstpromoter.com/** → instant self-serve signup

This is the direct link. Their `/referral-program/` page just points here, so skip it.
Runs on FirstPromoter: fill in the form, agree to terms, account created.

The only recurring commission on the list. A client who stays three years pays three
years of commission, so this compounds in a way the flat bounties don't.

---

### 3. Jotform — 30%, approved in ~1 business day

**https://www.jotform.com/partnership/affiliate/application/**

Fastest approval on the list. The public page says 30% on every new paid user;
it does **not** state the "first year only" limit the original research assumed —
read the terms at signup and tell me what it actually says so I can correct the site.

---

### 4. Instrumentl — rate not public, commissions confirmed

**https://beinstrumentl.typeform.com/to/UVUTeuFk**

Their partners page has several routes and most are the wrong one. This is the form
titled **"Affiliate Partner Application"** — that's the one you want. The others go to
foundations, accounting firms, and implementation partners.

Two useful confirmations from their FAQ: they pay monthly via Gusto, and **you do not
need to be an Instrumentl customer to join**. Rate is disclosed after acceptance.

Grant research is our priority category and Instrumentl is the only product in it with
a working program, so this one matters more than its current `low` rating suggests.

---

### 5. Bloomerang — PartnerStack, 90-day cookie

**https://bloomerang.partnerstack.com/?group=agencies** → "Join now"

Self-serve. Commission is one-time, paid the month after the referred client signs
their contract. The dollar amount is not on the public page — it's behind the referral
agreement PDF. Tell me what it says once you're in.

---

### 6. monday.com — up to 20% per closed deal

**https://mondaycom.partnerstack.com/?group=mbmarketplace** → "Join now"

Self-serve, 90-day cookie. Two structures: partners earn up to 20% per closed deal,
online affiliates get a cost-per-lead deal per signup. Lower relevance to our audience
than the others, but it's five minutes and it's the highest-volume product we mention.

---

### 7. GiveWP — via StellarWP on Impact

**https://app.impact.com/campaign-promo-signup/StellarWP.brand**

⚠️ **Do not use givewp.com.** That domain now 301s wholesale to Liquid Web, and its old
affiliate page redirects to Liquid Web's *hosting* affiliate program, which has nothing
to do with GiveWP. Following the vendor's own links puts you in the wrong program.

The real program survived the consolidation on Impact. One application covers GiveWP,
LearnDash, The Events Calendar, SolidWP, KadenceWP, Restrict Content Pro, IconicWP and
Orderable. The commission rate is behind the terms — the "30% then 40%" figure we had
predates the consolidation and is now marked `[FACT-CHECK]` on our side.

---

## Apply by email — no working form

### 8. Donorbox — 15% of fees for 3 years

**Email `partner@donorbox.org`**

The program is live and the terms are good, but **their published application link is
broken**. `donorbox.tapfiliate.com` 301s to Tapfiliate's own marketing site, and their
current portal (`partners.donorbox.org`, now on Kiflo) redirects `/signup`, `/register`
and `/apply` to a sign-in screen with no self-serve registration. They migrated
platforms and never updated the page. Their own FAQ still tells you to use the dead link.

Worth saying in the email that you found the link broken — it's a real favour and it
opens the conversation.

Remember: Donorbox attribution is link-only and never retroactive. Every mention has to
route through `/go/donorbox` or the commission is lost.

---

## Low priority — apply only if you have spare time

### 9. GrantStation

**https://grantstation.com/partner-programs/product-referral-program-old**
Contact: Juliet Vile, VP Operations — `juliet.vile@grantstation.com`

Three problems, in order of severity:

1. The commission is on **Online Education (webinar) sales only** — not the ~$199
   membership, which is the product we actually recommend. The economics we assumed
   don't exist.
2. The only live page has an `-old` slug, is missing from their Partner Programs nav,
   and doesn't appear in any sitemap section. Orphaned pages usually mean a program
   being quietly wound down or made invite-only.
3. Eligibility is written for "alliances and associations" with members, chapters or
   subscribers. We have readers, not members.

Send the email if you want. Don't plan around it.

---

## Do not apply

### Greater Giving — **not an affiliate program**

I had this rated `high` on a $300-per-referral figure. Opening the actual form changed
that: it asks for the **referred organization's** name, email, phone, address and zip.
There is no tracking link. You refer a specific nonprofit you personally know, by name.

A content site can't use that. We don't know our readers' details, and submitting a
reader's contact information to a vendor without their consent isn't something we'll do.
Downgraded to `none`. Revisit only if they add a tracking link.

### DonorSnap — program appears discontinued

Every plausible path 404s. Their full 99-page sitemap dated 2026-07-31 contains no
affiliate, referral, partner or reseller page, and on-site search returns only CRM
feature docs. Wayback shows `/affiliates/` was live in 2022. The only source still
describing the program is a vendor blog roundup whose "sign up" link points at the bare
homepage — which is what those roundups do when the real target has rotted.

The `$200 per paying customer` figure has no live source. Set to `status: "none"`.

---

## After each approval

1. Paste the tracking link into `affiliateUrl` in `src/data/affiliates.json`.
2. Set `status` to `"active"` and fill in `approvedOn`.
3. Fill in `appliedOn` when you apply, so we can chase anything that goes quiet.
4. If the program supplies a reader discount, put it in `readerOffer` — it renders
   beside every link to that product and materially raises click-through.

Nothing else needs touching. `/go/<slug>` starts using the tracking link automatically,
and every mention across the site routes through it.

## Tier B — negotiated, not now

Kindsight, DonorSearch and Neon One are consulting-partner deals with no signup form.
Per CLAUDE.md these need real traffic behind them before you open the conversation.
Revisit when Search Console shows meaningful impressions.
