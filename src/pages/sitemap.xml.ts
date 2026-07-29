import type { APIContext } from 'astro';
import { getCollection } from 'astro:content';
import { comparePairs } from '../lib/compare';
import benchmarks from '../data/benchmarks.json';

// A hand-built sitemap listing only indexable URLs: published content plus the
// static hubs. Excludes drafts (noindex), /go/ redirects, and the noindex
// /disclosure and /about pages.
export async function GET(context: APIContext) {
  const site = context.site ?? new URL('https://nonprofitsoftwareguide.com');
  const url = (path: string) => new URL(path, site).href;

  type Entry = { loc: string; lastmod?: string };
  const entries: Entry[] = [];

  // Static hubs that are always indexable (the calculator is a public tool).
  for (const p of ['/', '/stacks/', '/platforms/', '/compare/', '/blog/', '/grant-research/', '/wealth-screening/', '/tools/calculator/']) {
    entries.push({ loc: url(p) });
  }
  // The benchmark joins the sitemap only once its data is filled in (ready:true).
  if ((benchmarks as any).ready === true) entries.push({ loc: url('/benchmarks/') });

  const iso = (d?: Date) => (d ? new Date(d).toISOString() : undefined);

  const stacks = await getCollection('stacks', ({ data }) => data.draft === false);
  for (const s of stacks) entries.push({ loc: url(`/stacks/${s.data.slug}/`), lastmod: iso(s.data.lastVerified) });

  const platforms = await getCollection('platforms', ({ data }) => data.draft === false);
  for (const p of platforms) entries.push({ loc: url(`/platforms/${p.data.slug}/`), lastmod: iso(p.data.lastVerified) });

  const posts = await getCollection('posts', ({ data }) => data.draft === false);
  for (const p of posts) entries.push({ loc: url(`/blog/${p.id}/`), lastmod: iso(p.data.updatedDate ?? p.data.publishDate) });

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
