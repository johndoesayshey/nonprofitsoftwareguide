// Canonical shop-size tiers. The homepage, the /stacks index, and the stack
// content files (step 7) all agree on these slugs and this order. Slugs are
// stable URLs — never change one after publish (write a 301 instead).
export interface StackTier {
  slug: string;
  tier: string;
  blurb: string;
  revenue: string;
  order: number;
}

export const STACK_TIERS: StackTier[] = [
  { slug: 'under-250k', tier: 'Grassroots', blurb: 'the (nearly) all-free stack', revenue: 'under $250k', order: 1 },
  { slug: '250k-1m', tier: 'Growing', blurb: 'the first paid tools', revenue: '$250k – $1M', order: 2 },
  { slug: '1m-5m', tier: 'Established', blurb: 'research + wealth screening', revenue: '$1M – $5M', order: 3 },
  { slug: '5m-plus', tier: 'Institutional', blurb: 'the full stack', revenue: '$5M+', order: 4 },
];

export function tierBySlug(slug: string): StackTier | undefined {
  return STACK_TIERS.find((t) => t.slug === slug);
}
