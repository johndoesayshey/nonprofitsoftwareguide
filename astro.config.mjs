// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';
import affiliates from './src/data/affiliates.json' with { type: 'json' };

// The public site origin. Used for canonical URLs, sitemap, RSS, and JSON-LD.
export const SITE = 'https://nonprofitsoftwareguide.com';

// Any /go/ link written in markdown gets its rel set automatically, so authors
// can write plain [Text](/go/slug) links and stay compliant with affiliate
// terms. "sponsored" is only claimed where a program actually exists; a product
// we cover but earn nothing from gets plain nofollow, because labelling it
// sponsored would be a false statement about the relationship. Mirrors
// relFor() in src/lib/affiliate-value.ts.
function rehypeAffiliateRel() {
  const walk = (node) => {
    if (
      node.type === 'element' &&
      node.tagName === 'a' &&
      typeof node.properties?.href === 'string' &&
      node.properties.href.startsWith('/go/')
    ) {
      const slug = node.properties.href.replace('/go/', '').replace(/\/$/, '');
      const earns = (affiliates[slug]?.potential ?? 'none') !== 'none';
      node.properties.rel = earns
        ? ['sponsored', 'nofollow', 'noopener']
        : ['nofollow', 'noopener'];
    }
    node.children?.forEach(walk);
  };
  return (tree) => walk(tree);
}

// Sitemap is a custom endpoint (src/pages/sitemap.xml.ts) so we can exclude
// drafts, noindex pages, and /go/ redirects — the default integration would list
// everything.
// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [mdx()],
  markdown: {
    rehypePlugins: [rehypeAffiliateRel],
  },
  vite: {
    plugins: [tailwindcss()],
  },
});
