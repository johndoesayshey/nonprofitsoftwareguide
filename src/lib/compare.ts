import { getCollection, type CollectionEntry } from 'astro:content';

export interface Pair {
  slug: string;
  category: string;
  a: CollectionEntry<'platforms'>;
  b: CollectionEntry<'platforms'>;
}

// Every meaningful pair is two products in the SAME category — comparing a grant
// tool to a CRM isn't a real query. Slugs are alphabetical (a-vs-b) so URLs are
// stable regardless of file order. Comparison coverage is exhaustive within a
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
  return pairs;
}
