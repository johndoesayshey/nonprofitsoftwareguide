// Category metadata. The `slug` matches the enum in content/config.ts and the
// affiliates.json "category" field. `path` is the public URL for the category hub
// (only the two priority categories get a nav hub; the rest are reachable via
// the platforms index and comparisons).
export interface CategoryMeta {
  slug: string;
  label: string;
  short: string;
  blurb: string;
  path?: string; // set only for categories that have their own hub page
}

export const CATEGORIES: Record<string, CategoryMeta> = {
  'grant-research': {
    slug: 'grant-research',
    label: 'Grant research',
    short: 'Grant Research',
    blurb:
      'Finding the funders worth your time — databases, deadline tracking, and 990 research. The best return on a fundraising software dollar for most shops.',
    path: '/grant-research/',
  },
  'prospect-research': {
    slug: 'prospect-research',
    label: 'Prospect research & wealth screening',
    short: 'Wealth Prospecting',
    blurb:
      'Telling capacity from inclination — wealth indicators, giving history, and screening at scale. Highest-cost category; skip it below roughly $1M raised.',
    path: '/wealth-screening/',
  },
  'donor-crm': {
    slug: 'donor-crm',
    label: 'Donor CRM',
    short: 'Donor CRM',
    blurb: 'The database of record for donors, gifts, and relationships. The last decision, not the first.',
    path: '/donor-crm/',
  },
  'donation-processing': {
    slug: 'donation-processing',
    label: 'Donation processing',
    short: 'Donation Processing',
    blurb: 'Taking the money — online donation forms, recurring gifts, and payment fees. Where the free options genuinely compete.',
    path: '/donation-processing/',
  },
  'forms-ops': {
    slug: 'forms-ops',
    label: 'Forms & other operations',
    short: 'Forms/Other Ops',
    blurb: 'The glue — intake forms, event registrations, and lightweight databases.',
    path: '/forms-operations/',
  },
  'events-auctions': {
    slug: 'events-auctions',
    label: 'Events & auctions',
    short: 'Events',
    blurb: 'Galas, auctions, and peer-to-peer — software you rent for a season, not a year.',
    path: '/events/',
  },
};

export function categoryLabel(slug: string): string {
  return CATEGORIES[slug]?.label ?? slug;
}

// The canonical "Best for" line for a platform *in a given category context*.
// Single source: platform frontmatter. Cross-listed products override per
// category via bestForByCategory; everything else falls back to bestFor.
export function bestForIn(
  data: { bestFor: string; bestForByCategory?: Record<string, string> },
  category?: string,
): string {
  return (category && data.bestForByCategory?.[category]) || data.bestFor;
}
