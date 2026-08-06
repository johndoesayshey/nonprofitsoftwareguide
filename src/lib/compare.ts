import { getCollection, type CollectionEntry } from 'astro:content';

export interface Pair {
  slug: string;
  category: string;
  a: CollectionEntry<'platforms'>;
  b: CollectionEntry<'platforms'>;
}

/**
 * Cross-category pairs a reader genuinely faces, listed by hand.
 *
 * Deriving these from `alsoIn` was the obvious move and the wrong one: it would
 * generate 19 pages, including Jotform against all nine donor CRMs, which is not
 * a decision anyone is making. The pairs worth having are the ones our own
 * guidance sets up, so they get added deliberately.
 *
 * `category` is the shared ground the comparison is fought on, not either
 * product's home category.
 */
const CROSS_CATEGORY: Array<{ a: string; b: string; category: string }> = [
  // The $250k-$1M stack tells a reader to pick one of these two for a single
  // combined CRM-plus-processing line. It owes them the head-to-head.
  { a: '4agoodcause', b: 'donordock', category: 'donor-crm' },
];

// Otherwise every meaningful pair is two products in the SAME category — comparing
// a grant tool to a CRM isn't a real query. Slugs are alphabetical (a-vs-b) so URLs
// are stable regardless of file order. Comparison coverage is exhaustive within a
// category, per the spec.
export async function comparePairs(): Promise<Pair[]> {
  const platforms = await getCollection('platforms');
  const byCat = new Map<string, CollectionEntry<'platforms'>[]>();
  for (const p of platforms) {
    const list = byCat.get(p.data.category) ?? [];
    list.push(p);
    byCat.set(p.data.category, list);
  }

  const pairs: Pair[] = [];
  for (const [category, list] of byCat) {
    const sorted = [...list].sort((a, b) => a.data.slug.localeCompare(b.data.slug));
    for (let i = 0; i < sorted.length; i++) {
      for (let j = i + 1; j < sorted.length; j++) {
        const a = sorted[i];
        const b = sorted[j];
        pairs.push({ slug: `${a.data.slug}-vs-${b.data.slug}`, category, a, b });
      }
    }
  }

  const bySlug = new Map(platforms.map((p) => [p.data.slug, p]));
  for (const { a, b, category } of CROSS_CATEGORY) {
    const [x, y] = [bySlug.get(a), bySlug.get(b)];
    if (!x || !y) throw new Error(`CROSS_CATEGORY pair ${a}-vs-${b}: no platform named "${!x ? a : b}"`);
    const [first, second] = [x, y].sort((m, n) => m.data.slug.localeCompare(n.data.slug));
    const slug = `${first.data.slug}-vs-${second.data.slug}`;
    if (pairs.some((p) => p.slug === slug)) continue;   // already same-category
    pairs.push({ slug, category, a: first, b: second });
  }

  return pairs;
}
