import affiliatesData from '../data/affiliates.json';

export type AffiliateStatus = 'none' | 'pending' | 'active';

export interface Affiliate {
  name: string;
  category: string;
  status: AffiliateStatus;
  url: string;
  affiliateUrl: string | null;
  readerOffer: string | null;
  terms: string;
  signupUrl: string | null;
  appliedOn: string | null;
  approvedOn: string | null;
  payout?: string;
  potential?: 'high' | 'medium' | 'low' | 'unknown' | 'none';
  badge?: string;
  potentialNote?: string;
  evidence?: { url: string; checked: string; quote: string } | null;
}

const affiliates = affiliatesData as Record<string, Affiliate>;

export function getAffiliate(slug: string): Affiliate | undefined {
  return affiliates[slug];
}

// Keys beginning with "_" are documentation in affiliates.json, not products.
// Without this filter they generate a /go/_comment/ page that redirects to
// "undefined".
const isProduct = (slug: string) => !slug.startsWith('_');

export function allAffiliateSlugs(): string[] {
  return Object.keys(affiliates).filter(isProduct);
}

export function allAffiliates(): Array<{ slug: string } & Affiliate> {
  return Object.entries(affiliates)
    .filter(([slug]) => isProduct(slug))
    .map(([slug, a]) => ({ slug, ...a }));
}

/**
 * The URL a /go/<slug> link should resolve to: the real affiliate URL when the
 * program is active, otherwise the plain product URL so nothing breaks while an
 * application is pending or absent.
 */
export function resolveDestination(a: Affiliate): string {
  if (a.status === 'active' && a.affiliateUrl) return a.affiliateUrl;
  return a.url;
}

export default affiliates;
