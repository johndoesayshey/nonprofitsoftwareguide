// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// The public site origin. Used for canonical URLs, sitemap, RSS, and JSON-LD.
export const SITE = 'https://nonprofitsoftwareguide.com';

// Any /go/ link written in markdown gets rel="sponsored nofollow noopener"
// automatically, so authors can write plain [Text](/go/slug) links and stay
// compliant with affiliate-program terms. (Component-rendered AffiliateLinks
// already set this; this covers hand-written markdown links.)
function rehypeAffiliateRel() {
  const walk = (node) => {
    if (
      node.type === 'element' &&
      node.tagName === 'a' &&
      typeof node.properties?.href === 'string' &&
      node.properties.href.startsWith('/go/')
    ) {
      node.properties.rel = ['sponsored', 'nofollow', 'noopener'];
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
