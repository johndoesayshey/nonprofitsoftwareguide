// @ts-check
import { defineConfig } from 'astro/config';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// The public site origin. Used for canonical URLs, sitemap, RSS, and JSON-LD.
export const SITE = 'https://nonprofitsoftwareguide.com';

// Sitemap is a custom endpoint (src/pages/sitemap.xml.ts) so we can exclude
// drafts, noindex pages, and /go/ redirects — the default integration would list
// everything.
// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [mdx()],
  vite: {
    plugins: [tailwindcss()],
  },
});
