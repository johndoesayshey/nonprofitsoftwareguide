---
name: CharityEngine
slug: charityengine
category: donor-crm
entryPrice: "Listed at $550/mo in vendor-supplied directory listings; CharityEngine's own site publishes nothing"
pricingModel: "Tiered by users, contacts and email volume; contract length is a priced variable"
pricingBasis: "by users, contact count and monthly email volume"
pricingTiers:
  - tier: "Starter"
    price: "$550/mo"
    note: "5 users, up to 25k contacts, 100k emails/mo"
  - tier: "Pro"
    price: "Quoted"
    note: "10 users, 50k contacts, 200k emails/mo; adds auctions, P2P, major gifts"
  - tier: "Premier"
    price: "Quoted"
    note: "20 users, 100k contacts, 400k emails/mo; adds advocacy, custom pipelines"
lastVerified: 2026-08-03
bestFor: "Mid-to-large shops leaving Blackbaud or Salesforce that want fundraising, email, events and payment processing genuinely in one system."
targetQuery: "charityengine pricing"
affiliateSlug: charityengine
freeTier: false
features:
  emailMarketing: included
featureNotes:
  emailMarketing: "limits not published"
featured: false
draft: false
strengths:
  - "Genuinely all-in-one: CRM, email automation, events, membership and in-house payment processing without a middleman gateway"
  - "Native prospect research included at the entry tier, which usually costs four figures separately"
  - "Reviewers switching from Raiser's Edge consistently report a lower total cost"
otherOptions:
  - need: "Under $1M raised?"
    platformSlug: donordock
    note: "$550 a month is roughly nine times the survey mean for shops under $250k; this tier of system starts to make sense well above that."
  - need: "Want a short implementation?"
    platformSlug: bloomerang
    note: "CharityEngine implementations run about three months and reviewers report them slipping; a simpler CRM is live in days."
  - need: "Need published pricing?"
    platformSlug: eleo
    note: "Eleo's whole ladder is on the page, from $39 to $199 a month."
---

CharityEngine's own pricing page publishes no figures — package names and a "Book a Demo" button. Their blog defends the choice, opening with the two words nonprofit buyers hear too often: "it depends."

## But there is a published number, in an odd place

CharityEngine supplies a rate card to the software directories even though it doesn't put one on its own site. Capterra and GetApp both list **Starter at $550/month**, covering 5 users, up to 25,000 contacts, and 100,000 emails a month.

That distinction is worth stating plainly: the figure is vendor-supplied, but it's supplied somewhere the vendor doesn't link to. Pro and Premier are "contact our sales team" everywhere.

What $550 includes is more than the price suggests — CRM and donor management, custom donation forms, built-in payment processing, email and marketing automation, event management, membership and sustainer management, a dedicated onboarding specialist, and native prospect research. That last one normally costs four figures a year as a separate subscription, which changes the comparison against a cheaper CRM plus a screening tool.

The directories contradict each other on whether a free trial exists — Capterra says no, GetApp says yes. Ask.

## What we could not find

No reviewer anywhere states a dollar figure they actually pay. No payment processing rate is published, which matters because CharityEngine processes in-house rather than through a gateway, so that rate is a negotiated part of the deal rather than a market rate. No implementation fee figures. No stated minimum contract term — though the vendor confirms contract length is one of the levers that sets your price, alongside contact count and email volume.

A roundup range of "$450–700/month" circulates; we couldn't trace it to a source, so it isn't here.

## Whether the price makes sense for you

Our 2026 survey put mean annual donor CRM spend at $716 for shops under $250K raised and $2,726 at $250K–$1M. The $550/month Starter tier is $6,600 a year — above the mean for everyone under $1M, and roughly in line at $1M–$5M, where the mean is $7,130.

That's the honest read: this is a system for shops past about $1M, and the argument for it is consolidation. If it genuinely replaces your CRM, your email platform, your event tool and your prospect research subscription, the total can come out ahead. If it replaces only the CRM, it won't.

## The integrations logo wall is not an integrations list

CharityEngine's developer page shows about thirty-two logos under "Popular
Integrations." It is worth knowing what that wall actually mixes together, because
nothing on it is labelled. Verified 3 August 2026:

- **Native connectors** — QuickBooks Online, PayPal, Authorize.net, WealthEngine
- **Zapier-mediated** — Mailchimp, which has no native documentation at all
- **Competitor and migration-source systems** — Blackbaud, Luminate, Donor Direct
- **Shipping and telephony vendors** — FedEx, UPS, USPS, Twilio

Salesforce appears on that wall and has zero documentation anywhere in
CharityEngine's help centre. Given that Blackbaud and Luminate are plainly migration
sources rather than integrations, Salesforce most likely is too — but we could not
confirm it either way, so treat it as unestablished rather than as a feature.

**Stripe is absent, and that is a real constraint.** CharityEngine processes payments
itself; its published gateways are Authorize.net, BluePay, First Data, PayGate,
Razorpay and DPO Group. If you are currently on Stripe, moving to CharityEngine
means changing payment processors, which means re-enrolling recurring donors.

## How the QuickBooks sync actually works

One-way, CharityEngine to QuickBooks Online, run as a scheduled job. Both
granularities are offered as a setting, and the vendor pushes you toward summary —
their own documentation recommends a daily summary and notes that detail mode, which
creates line-item transactions, is for organizations that require individual
transactions for reconciliation.

Four operational details a bookkeeper will want before signing:

- GL code names in CharityEngine must **match QuickBooks account names exactly**.
  A transaction with a null or unmatched GL code **silently does not sync** — it does
  not error, it just isn't there.
- A misconfigured "sync from" date **creates duplicates**.
- The QuickBooks OAuth token expires periodically and has to be reconnected by hand.
- QuickBooks Enterprise (desktop) is not part of this at all — that path is an IIF
  file export.

Also worth knowing: PayPal **cannot be configured self-serve**. Their documentation
states you cannot add PayPal to your forms until support or professional services has
configured it in your account. Whether that carries a fee is not published.

## What reviewers consistently flag

**Implementations run long.** The vendor says about three months; reviewers describe go-live dates slipping, and one described being in sandbox after four months with no training available.

**Navigation and queries are complex.** A June 2026 reviewer: difficult to navigate "because of the different routes," with queries harder than at their previous vendor.

**Duplicate records.** The same reviewer reports the system creating multiple records for one person when the name isn't typed identically, and batch transaction entry that "never seems to work the way we had hoped."
