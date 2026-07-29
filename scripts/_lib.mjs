// Shared helpers for the guardrail scripts. These run under plain Node (before
// or after `astro build`), so they parse markdown frontmatter directly rather
// than going through astro:content.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join, extname } from 'node:path';
import { fileURLToPath } from 'node:url';
import matter from 'gray-matter';

export const ROOT = fileURLToPath(new URL('..', import.meta.url));
export const CONTENT = join(ROOT, 'src', 'content');

const CONTENT_EXT = new Set(['.md', '.mdx']);

/** Read every markdown file in a content collection dir as { slug, path, data, body }. */
export function readCollection(name) {
  const dir = join(CONTENT, name);
  if (!existsSync(dir)) return [];
  return readdirSync(dir)
    .filter((f) => CONTENT_EXT.has(extname(f)))
    .map((f) => {
      const path = join(dir, f);
      const raw = readFileSync(path, 'utf8');
      const { data, content } = matter(raw);
      return {
        slug: f.replace(/\.(md|mdx)$/, ''),
        file: join('src', 'content', name, f),
        path,
        data,
        body: content,
      };
    });
}

export function loadAffiliates() {
  const p = join(ROOT, 'src', 'data', 'affiliates.json');
  return JSON.parse(readFileSync(p, 'utf8'));
}

// ANSI helpers — kept tiny, no dependency.
export const red = (s) => `\x1b[31m${s}\x1b[0m`;
export const green = (s) => `\x1b[32m${s}\x1b[0m`;
export const yellow = (s) => `\x1b[33m${s}\x1b[0m`;
export const bold = (s) => `\x1b[1m${s}\x1b[0m`;

/** Print failures and exit non-zero, or print a success line and return. */
export function report(label, failures) {
  if (failures.length === 0) {
    console.log(green(`✓ ${label}`));
    return;
  }
  console.error(red(`✗ ${label} — ${failures.length} problem(s):`));
  for (const f of failures) console.error(red(`  • ${f}`));
  process.exit(1);
}
