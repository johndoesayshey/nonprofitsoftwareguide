// @ts-check
import { defineConfig } from 'astro/config';
import sitemap from '@astrojs/sitemap';
import mdx from '@astrojs/mdx';
import tailwindcss from '@tailwindcss/vite';

// The public site origin. Used for canonical URLs, sitemap, RSS, and JSON-LD.
export const SITE = 'https://nonprofitsoftwareguide.com';

// https://astro.build/config
export default defineConfig({
  site: SITE,
  integrations: [mdx(), sitemap()],
  vite: {
    plugins: [tailwindcss()],
  },
});
