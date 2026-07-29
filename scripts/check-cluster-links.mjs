// Guardrail #5b (dist): hubs link down. Every published stack's rendered page must
// contain a link to each published post that names it. Runs on dist/ HTML because
// the stack template auto-renders the supporting-post list. Fails the build if a
// hub is missing one of its children.
import { readFileSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, readCollection, report } from './_lib.mjs';

const DIST = join(ROOT, 'dist');
if (!existsSync(DIST)) {
  console.error('✗ cluster-links check: dist/ not found — run `astro build` first.');
  process.exit(1);
}

const stacks = readCollection('stacks').filter((s) => s.data.draft === false);
const posts = readCollection('posts').filter((p) => p.data.draft === false);
const failures = [];

for (const stack of stacks) {
  const slug = stack.data.slug ?? stack.slug;
  const htmlPath = join(DIST, 'stacks', slug, 'index.html');
  const children = posts.filter((p) => p.data.stack === slug);
  if (children.length === 0) continue;
  if (!existsSync(htmlPath)) {
    failures.push(`stacks/${slug}: expected rendered page at ${htmlPath} not found`);
    continue;
  }
  const html = readFileSync(htmlPath, 'utf8');
  for (const child of children) {
    if (!html.includes(`/blog/${child.slug}`)) {
      failures.push(`stacks/${slug}: hub page does not link down to /blog/${child.slug} (${child.file})`);
    }
  }
}

report('cluster integrity — hubs link down to their posts', failures);
