import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { comparePairs } from '../lib/compare';

// A hand-built sitemap listing only indexable URLs: published content plus the
// static hubs. Excludes drafts (noindex), /go/ redirects, and the noindex
// /disclosure and /about pages.
export async function GET(context: APIContext) {
  const site = context.site ?? new URL('https://nonprofitsoftwareguide.com');
  const url = (path: string) => new URL(path, site).href;

  type Entry = { loc: string; lastmod?: string };
  const entries: Entry[] = [];

  // Static hubs that are always indexable — one per nav section.
  for (const p of [
    '/', '/platforms/', '/compare/', '/alternatives/', '/best/', '/blog/', '/consulting/', '/about/',
    '/grant-research/', '/wealth-screening/', '/donor-crm/',
    '/donation-processing/', '/events/', '/forms-operations/',
  ]) {
    entries.push({ loc: url(p) });
  }
  const iso = (d?: Date) => (d ? new Date(d).toISOString() : undefined);

  const stacks = await getCollection('stacks', ({ data }) => data.draft === false);

  // The benchmark table is generated from the stack pages, so it exists whenever
  // they do and there is nothing separate to flip on.
  if (stacks.length > 0) entries.push({ loc: url('/benchmarks/') });

  for (const s of stacks) entries.push({ loc: url(`/stacks/${s.data.slug}/`), lastmod: iso(s.data.lastVerified) });

  const platforms = await getCollection('platforms', ({ data }) => data.draft === false);
  for (const p of platforms) entries.push({ loc: url(`/platforms/${p.data.slug}/`), lastmod: iso(p.data.lastVerified) });

  const posts = await getCollection('posts', ({ data }) => data.draft === false);
  for (const p of posts) entries.push({ loc: url(`/blog/${p.id}/`), lastmod: iso(p.data.updatedDate ?? p.data.publishDate) });

  // Switching guides ("[product] alternatives").
  const alternatives = await getCollection('alternatives', ({ data }) => data.draft === false);
  for (const a of alternatives) {
    entries.push({ loc: url(`/alternatives/${a.data.slug}/`), lastmod: iso(a.data.lastVerified) });
  }

  // "Best X" roundups: category head terms and vertical pages.
  const guides = await getCollection('guides', ({ data }) => data.draft === false);
  for (const g of guides) {
    entries.push({ loc: url(`/best/${g.data.slug}/`), lastmod: iso(g.data.lastVerified) });
  }

  // Comparisons where both platforms are published.
  const pairs = (await comparePairs()).filter((p) => p.a.data.draft === false && p.b.data.draft === false);
  for (const pair of pairs) entries.push({ loc: url(`/compare/${pair.slug}/`) });

  const body =
    `<?xml version="1.0" encoding="UTF-8"?>\n` +
    `<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">\n` +
    entries
      .map((e) => `  <url><loc>${e.loc}</loc>${e.lastmod ? `<lastmod>${e.lastmod}</lastmod>` : ''}</url>`)
      .join('\n') +
    `\n</urlset>\n`;

  return new Response(body, { headers: { 'Content-Type': 'application/xml' } });
}
