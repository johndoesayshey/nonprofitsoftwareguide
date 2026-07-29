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

// One .md per product. See CLAUDE.md "Content schema".
const platforms = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/platforms' }),
  schema: z.object({
    name: z.string(),
    slug: z.string(),
    category,
    entryPrice: z.string(), // human-readable, may carry [FACT-CHECK] while draft
    pricingModel: z.string(),
    lastVerified: z.coerce.date(),
    bestFor: z.string(),
    strengths: z.array(z.string()),
    limitations: z.array(z.string()),
    affiliateSlug: z.string().nullable().default(null),
    freeTier: z.boolean().default(false),
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
        platformSlug: z.string(),
        annualCost: z.string(),
        rationale: z.string(),
      })
    ),
    lastVerified: z.coerce.date(),
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
    targetQuery: z.string(),
    platformsMentioned: z.array(z.string()).default([]),
    affiliateSlugs: z.array(z.string()).default([]),
    draft: z.boolean().default(true),
  }),
});

export const collections = { platforms, stacks, posts };
