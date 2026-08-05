// Guardrail: "Best for" has one source of truth — the `bestFor` field in the
// platform's frontmatter. Every page that shows a "Best for" label must render
// that field, never its own copy, so an edit in the platform file follows
// through everywhere (operator rule, 2026-08-04).
//
// Two ways drift can re-enter, both failed here:
//   1. An .astro template that shows a "Best for" label without reading a
//      bestFor field — i.e. someone hardcoded the text next to the label.
//   2. A content body (markdown, below the frontmatter) that hand-writes its
//      own bolded "Best for:" line or heading.
//
// Award titles like `award: "Best for consolidating your stack"` live in
// frontmatter and are names, not Best-for sections; they are not checked.
import { readFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname, relative } from 'node:path';
import { ROOT, readCollection, report } from './_lib.mjs';

const failures = [];

// --- 1. Templates: a "Best for" label requires a bestFor field read. ---------
function astroFiles(dir, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) astroFiles(p, out);
    else if (extname(name) === '.astro') out.push(p);
  }
  return out;
}

for (const file of astroFiles(join(ROOT, 'src'))) {
  const src = readFileSync(file, 'utf8');
  const hasLabel = /Best for\s*[<:]/i.test(src);
  const readsField = /\bbestFor\b/.test(src);
  if (hasLabel && !readsField) {
    failures.push(
      `${relative(ROOT, file)} shows a "Best for" label but never reads a bestFor field — render platform bestFor instead of hardcoding text`,
    );
  }
}

// --- 2. Content bodies: no hand-written "Best for" blocks. -------------------
for (const name of ['platforms', 'stacks', 'posts', 'alternatives', 'guides']) {
  for (const entry of readCollection(name)) {
    const raw = readFileSync(entry.path, 'utf8');
    const bodyStart = raw.indexOf('---', raw.indexOf('---') + 3);
    const body = bodyStart === -1 ? raw : raw.slice(bodyStart + 3);
    if (/^\s*(?:\*\*|#{1,6}\s*)Best for\b/im.test(body)) {
      failures.push(
        `${entry.file} hand-writes a "Best for" block in its body — the platform frontmatter bestFor field is the single source`,
      );
    }
  }
}

report('"Best for" single-sourced from platform frontmatter', failures);
