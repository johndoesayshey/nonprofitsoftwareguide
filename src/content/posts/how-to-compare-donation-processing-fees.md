---
title: "How to compare donation processing fees the right way"
description: "Add platform fee, processing fee, and subscription into one effective rate on your own volume. Then weigh donor experience, which moves more money than fees."
publishDate: 2026-05-20
stack: 250k-1m
targetQuery: "how to compare donation processing fees"
platformsMentioned: [donorbox, zeffy, givebutter]
affiliateSlugs: [donorbox]
draft: false
faq:
  - q: "What is the difference between a platform fee and a processing fee?"
    a: "The processing fee goes to the payment processor, usually Stripe, for moving the money. The platform fee goes to the software vendor for the forms and tools. Some platforms charge both, some only one, some neither."
  - q: "How do I calculate my effective donation processing rate?"
    a: "Take everything a platform would cost you in a year on your actual volume: platform fees, processing fees, and any subscription. Divide by your annual online donation volume. That single percentage is the only fair way to compare platforms."
  - q: "Do lower fees always mean more money for my nonprofit?"
    a: "No. Donor experience moves more money than a fee point. A checkout that converts better, or recurring-gift tooling that recovers failed cards, can outweigh a fee difference many times over. Compare completed revenue, not just rates."
---

Compare donation platforms by computing one number: the effective rate. Add every cost a platform charges on your actual annual volume (platform fee, processing fee, and any subscription), then divide by that volume. Sticker percentages mislead because the three fee types stack differently at different sizes.

## The three fees that stack

Every donation platform's cost is some mix of three parts.

**The processing fee** pays the payment processor, usually Stripe, for moving money. It is typically a percentage plus a few cents per transaction.

**The platform fee** pays the software vendor for forms, receipts, and reporting. It is usually a percentage of each gift.

**The subscription** is a flat monthly charge, present on some plans and absent on others.

Vendors quote whichever number looks best. The only fair comparison adds all three on your volume.

## The three models in practice

[Zeffy](/go/zeffy) charges none of the three. No platform fee, no processing fee, no subscription. It is funded by optional donor tips at checkout and runs on Stripe underneath. Its effective rate is zero.

[Givebutter](/go/givebutter) charges no platform fee when donor tips are enabled, or a flat 3% with tips turned off. Processing runs about 2.9% + 30 cents on cards and 1.9% + 30 cents on ACH.

[Donorbox](/go/donorbox) charges a platform fee of about 2.95% plus Stripe processing of roughly 2.7% + 5 cents. The Pro plan, around $150/mo, cuts the platform fee to about 1.75%.

## Run the math on your volume, not theirs

Subscriptions change the ranking as volume grows. A flat monthly fee is enormous against $20k of annual online giving and trivial against $300k. Donorbox illustrates it cleanly: at roughly $150k per year in online volume, Pro's fee savings cover its own subscription, so the paid plan becomes the cheaper plan. Below that line the free plan wins; above it, Pro does.

So the procedure is: take last year's online volume, apply each platform's full fee stack to it, and compare annual dollar totals. Ten minutes in a spreadsheet settles arguments that feature pages never will.

## The factor that outweighs fees

Effective rate is the right way to compare costs. It is the wrong way to pick a platform, because fees only apply to gifts that complete.

A checkout that converts better raises revenue by whole percentage points, and a fee difference between platforms is usually a fraction of one. The same goes for recurring gifts: Donorbox's failed-card recovery and donor portals exist to keep monthly donors giving when cards expire, and one saved recurring donor can outweigh a year of fee differences by themselves. [Our Donorbox review](/platforms/donorbox/) covers that tooling in depth.

The practical test: set up a free form on your two finalists, donate $5 to yourself on your phone, and count the taps. Then check how each handles a monthly gift when a card fails.

## The short version

1. Compute effective rate on your real volume, all three fee types included.
2. Check where subscriptions flip the ranking as you grow.
3. Test the donor experience yourself before deciding.
4. Weight recurring-gift tooling heavily if monthly giving is in your plan.

All three platforms here are free to start, so the test costs an afternoon.

Where processing fits among your other tools is laid out in [the $250k-$1M stack](/stacks/250k-1m/).
