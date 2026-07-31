import affiliates, { type Affiliate } from './affiliates';

// Ordering across the site follows verified earning potential, so the pages a
// reader hits first are the ones that can actually pay. Everything here derives
// from src/data/affiliates.json: when a program is approved, re-rated, or dies,
// the nav, category lists and comparison pages reorder themselves.

export type Potential = 'high' | 'medium' | 'low' | 'unknown' | 'none';

const SCORE: Record<Potential, number> = {
  high: 100,
  medium: 40,
  unknown: 15, // a real program whose rate is not published yet
  low: 8,
  none: 0,
};

export function potentialOf(slug: string | null | undefined): Potential {
  if (!slug) return 'none';
  const a = (affiliates as Record<string, Affiliate & { potential?: Potential }>)[slug];
  return (a?.potential as Potential) ?? 'none';
}

export function valueOf(slug: string | null | undefined): number {
  return SCORE[potentialOf(slug)];
}

/** Highest-earning first; ties keep their original (editorial) order. */
export function byValue<T>(items: T[], slugOf: (item: T) => string | null | undefined): T[] {
  return items
    .map((item, i) => ({ item, i, v: valueOf(slugOf(item)) }))
    .sort((a, b) => b.v - a.v || a.i - b.i)
    .map((x) => x.item);
}

/**
 * A category is worth as much as the best thing in it, with a small bump for
 * depth, so "one high payout" outranks "three low ones" but a category with two
 * high payouts still leads one with a single high payout.
 */
export function categoryValue(slugs: string[]): number {
  if (slugs.length === 0) return 0;
  const vals = slugs.map(valueOf).sort((a, b) => b - a);
  return vals[0] + vals.slice(1).reduce((n, v) => n + v * 0.25, 0);
}

/**
 * Every product links out through /go/ so clicks are consistent and a link starts
 * earning the moment a program is approved. Only claim "sponsored" where there is
 * actually a program behind it.
 */
export function relFor(slug: string | null | undefined): string {
  return potentialOf(slug) === 'none' ? 'nofollow noopener' : 'sponsored nofollow noopener';
}
