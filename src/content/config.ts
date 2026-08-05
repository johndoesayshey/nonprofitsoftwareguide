import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

// Categories used across platforms, stacks, and posts. Keep in sync with the
// affiliates.json "category" values and the SEO cluster structure.
const category = z.enum([
  'grant-research',
  'prospect-research',
  'donor-crm',
  'donation-processing',
  'forms-ops',
  'events-auctions',
]);

// Shared by every entry in a platform's `features` map. See the note there for
// why this is five values rather than a boolean.
const featureLevel = z
  .enum(['included', 'basic', 'add-on', 'none', 'unknown'])
  .default('unknown');

// One .md per product. See CLAUDE.md "Content schema".
const platforms = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/platforms' }),
  schema: z.object({
    name: z.string(),
    // Short form for dense inline contexts — comparison links, chips — where the
    // full legal-ish name would dominate the line. Falls back to `name`.
    shortName: z.string().optional(),
    slug: z.string(),
    category,
    entryPrice: z.string(), // human-readable, may carry [FACT-CHECK] while draft
    pricingModel: z.string(),
    // The full published price ladder, where the vendor publishes one. Charts
    // show every tier rather than only the entry price, because "from $39" tells
    // a buyer nothing about what they will actually pay in year two. Leave empty
    // for quote-only products; the chart falls back to entryPrice.
    pricingTiers: z
      .array(
        z.object({
          tier: z.string(),            // "Standard", "Up to 5,000 records"
          price: z.string(),           // "$299/mo", "~2.95% + fees"
          note: z.string().optional(), // what the tier buys you
        })
      )
      .default([]),
    // What the ladder is priced on: "per seat", "by record count", "by volume".
    pricingBasis: z.string().optional(),
    lastVerified: z.coerce.date(),
    bestFor: z.string(),
    // Per-category "Best for". A cross-listed product (alsoIn) carries distinct
    // canonical text for each software type it appears under; anywhere the site
    // renders it in that category's context, this overrides bestFor. Keys must
    // be categories the product is actually listed in (check-bestfor enforces).
    bestForByCategory: z.record(z.string()).default({}),
    // Renders an "Editor's choice" chip beside the name in its PRIMARY
    // category's tables (hub + compare). One per category at most — editorial
    // call, not computed.
    editorsChoice: z.boolean().default(false),
    strengths: z.array(z.string()),
    // Replaces the old `limitations` list. A bare list of faults reads as a
    // verdict against the product and gives the reader nowhere to go; this says
    // what the tool is not for and names the tool that is. How blunt the `note`
    // gets is an editorial call per product — see DECISIONS.md.
    otherOptions: z.array(
      z.object({
        need: z.string(),           // the reader's situation, phrased as theirs
        platformSlug: z.string().nullable().default(null),
        // Display label override for the category cell — lets one ledger line
        // cover a combined need ("Donor CRM + donation processing") without
        // inventing a category slug.
        categoryLabel: z.string().optional(),
        // Grey the line and tag it "Optional at this size" — for tools most
        // peers at this size skip (per the benchmark), kept in the ledger so
        // the reader sees the whole decision.
        optional: z.boolean().default(false),
        note: z.string(),           // one sentence: why that one instead
      })
    ),
    // Extra categories this product should appear in. A general-purpose tool can
    // legitimately fill a role it isn't built for — a structured list in
    // monday.com is many small shops' first donor database — and the buyer
    // comparing CRMs should see it. `category` still decides where the product
    // page lives; this only adds it to another category's comparison chart.
    alsoIn: z.array(category).default([]),
    // What the product actually does, in the language buyers use.
    //
    // Five features, each chosen because it maps to a subscription a small shop
    // is realistically paying for separately. The recurring shape of the question
    // is consolidation: "we are paying for five things, which one tool replaces
    // the most of them?" Features every CRM claims are left out on purpose — a
    // row where everyone scores the same helps nobody choose.
    //
    // Every value uses the same five levels, because yes/no is the wrong shape.
    // The distinction that matters is between doing a thing and doing it properly
    // — sending a receipt is not email marketing — and vendors blur exactly that.
    //   included  — properly, as part of the core product
    //   basic     — technically present, not good enough to cancel a dedicated tool
    //   add-on    — real, but costs extra or is a separate product
    //   none      — absent; budget for something else
    //   unknown   — not established from a vendor source. Say so rather than guess.
    features: z
      .object({
        emailMarketing: featureLevel,     // campaigns to a segment, not receipts
        donationForms: featureLevel,      // customizable, embeddable
        paymentProcessing: featureLevel,  // takes the money itself
        events: featureLevel,             // ticketing and registration
        peerToPeer: featureLevel,
      })
      .default({}),
    // Keyed by the same names. One short clause — where a feature is an add-on,
    // put the price here.
    featureNotes: z.record(z.string()).default({}),
    affiliateSlug: z.string().nullable().default(null),
    freeTier: z.boolean().default(false),
    // Does this product appear in curated, reader-facing lists — category hubs,
    // the comparison index, "best of" roundups, the Software menu?
    //
    // false does NOT mean unpublished. The product page stays live and
    // indexable, its comparison pages are still generated, and switching guides
    // still link to it. It just stops competing for space in a shortlist.
    //
    // The rule (operator direction, 2026-08-03): 4-5 products per category,
    // weighted to the ones that can actually earn, plus the free options a
    // credible list cannot omit. Beyond that a roundup stops being a
    // recommendation and becomes a directory, which is the bloat this prevents.
    // See DECISIONS.md for why each unfeatured product is unfeatured.
    featured: z.boolean().default(true),
    // Not in the original spec schema; added so the [FACT-CHECK] guardrail can
    // skip in-progress content. Ship generated files as draft: true.
    draft: z.boolean().default(true),
  }),
});

// One .md per shop size. The primary content unit. See CLAUDE.md.
const stacks = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/stacks' }),
  schema: z.object({
    shopSize: z.string(),
    annualRevenue: z.string(),
    staffSize: z.string(),
    totalStackCost: z.string(),
    slug: z.string(),
    components: z.array(
      z.object({
        category,
        // A line can point at a product, or carry no product at all. Some
        // categories are better bought as a consulting project than a
        // subscription at a given size; those lines set advisory: true and
        // leave platformSlug empty.
        platformSlug: z.string().nullable().default(null),
        // Display label override for the category cell — lets one ledger line
        // cover a combined need ("Donor CRM + donation processing") without
        // inventing a category slug.
        categoryLabel: z.string().optional(),
        // Grey the line and tag it "Optional at this size" — for tools most
        // peers at this size skip (per the benchmark), kept in the ledger so
        // the reader sees the whole decision.
        optional: z.boolean().default(false),
        advisory: z.boolean().default(false),
        // Overrides the product name in the ledger. Used when one platform
        // fills two roles, or when an advisory line needs its own label.
        label: z.string().optional(),
        annualCost: z.string(),
        rationale: z.string(),
      })
    ),
    lastVerified: z.coerce.date(),
    // Explains any advisory line in the ledger (a category better bought as a
    // consulting project than a subscription at this size).
    consultantNote: z
      .object({ heading: z.string(), body: z.string() })
      .optional(),
    draft: z.boolean().default(true),
  }),
});

// Blog posts. Rendered at /blog/[slug]. targetQuery must be globally unique
// (enforced by scripts/check-queries.mjs).
const posts = defineCollection({
  loader: glob({ pattern: '**/*.{md,mdx}', base: './src/content/posts' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    publishDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    stack: z.string(), // slug of the parent stack hub (cluster integrity)
    // Which category this post builds authority in. Not used for routing. It was
    // added for a category-share check that has since been replaced by
    // `npm run check-monetization` — kept because knowing what a post is about
    // is worth having, and it costs nothing.
    category,
    targetQuery: z.string(),
    platformsMentioned: z.array(z.string()).default([]),
    affiliateSlugs: z.array(z.string()).default([]),
    // Optional Q&A block → renders an FAQ section and FAQPage structured data.
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    draft: z.boolean().default(true),
  }),
});

// "[Product] alternatives" pages. The searcher already has a tool and is
// shopping to replace it, which is the highest commercial intent in the sector
// and almost unserved: the results are vendor blogs listing themselves first.
// The target product does NOT need a platform page of its own — the page is
// about what to move to.
const alternatives = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/alternatives' }),
  schema: z.object({
    product: z.string(),          // the tool they're leaving, e.g. "Blackbaud Raiser's Edge"
    slug: z.string(),             // /alternatives/<slug>/
    category,                     // what it competes in, drives the comparison table
    targetQuery: z.string(),      // globally unique, enforced by check-queries
    lastVerified: z.coerce.date(),
    // Optional: set when we also review the product itself, so the page can
    // link to our own write-up instead of dead-ending.
    incumbentSlug: z.string().nullable().default(null),
    // Why people actually leave. This is the part vendor lists never write, and
    // the reason the page earns the click.
    reasonsToLeave: z.array(z.object({ reason: z.string(), detail: z.string() })),
    // Ordered recommendations. `forWhom` is the situation, not a superlative.
    picks: z.array(
      z.object({
        platformSlug: z.string(),
        forWhom: z.string(),
        note: z.string(),
      })
    ),
    // One honest line on when staying put is the right call.
    stayIf: z.string(),
    draft: z.boolean().default(true),
  }),
});

// "Best X" roundups, rendered at /best/<slug>/. Two jobs, one shape:
// the category head terms ("best nonprofit CRM") and the vertical pages
// ("best donor management software for churches"). A vertical page is just a
// roundup with an `audience` and different picks, so they share a template
// rather than drifting into two near-identical ones.
const guides = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/guides' }),
  schema: z.object({
    title: z.string(),
    slug: z.string(),
    category,
    targetQuery: z.string(),      // globally unique, enforced by check-queries
    lastVerified: z.coerce.date(),
    // Set on vertical pages ("churches", "animal rescues"). Empty on head terms.
    audience: z.string().optional(),
    // The answer-first paragraph. 40-60 words, no preamble — this is what a
    // featured snippet and an AI assistant lift, so it has to stand alone.
    answer: z.string(),
    picks: z.array(
      z.object({
        platformSlug: z.string(),
        award: z.string(),        // "Best overall", "Best value", "Best free option"
        forWhom: z.string(),
        note: z.string(),
      })
    ),
    // What actually decides the choice at this size or in this vertical. The
    // part a vendor roundup never writes.
    decidingFactors: z.array(z.object({ factor: z.string(), detail: z.string() })),
    // Optional Q&A -> renders an FAQ block and FAQPage structured data.
    faq: z.array(z.object({ q: z.string(), a: z.string() })).optional(),
    draft: z.boolean().default(true),
  }),
});

export const collections = { platforms, stacks, posts, alternatives, guides };
