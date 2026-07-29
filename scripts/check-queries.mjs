// SEO requirement: one page, one query. No two PUBLISHED pages may declare the
// same targetQuery (keyword cannibalization is mechanically preventable). Posts
// must declare targetQuery; platforms/stacks may declare an optional one. All are
// checked together for uniqueness. Drafts are exempt so parked ideas can share a
// working query until one ships.
import { readCollection, report } from './_lib.mjs';

const failures = [];
const seen = new Map(); // normalized query -> file

function normalize(q) {
  return String(q).trim().toLowerCase().replace(/\s+/g, ' ');
}

// Posts are required to declare targetQuery.
for (const post of readCollection('posts')) {
  if (post.data.draft !== false) continue;
  if (!post.data.targetQuery) {
    failures.push(`${post.file} (published post) has no targetQuery`);
  }
}

// Uniqueness across every published page that declares one.
for (const name of ['posts', 'platforms', 'stacks']) {
  for (const entry of readCollection(name)) {
    if (entry.data.draft !== false) continue;
    const q = entry.data.targetQuery;
    if (!q) continue;
    const key = normalize(q);
    if (seen.has(key)) {
      failures.push(
        `duplicate targetQuery "${q}" — ${entry.file} collides with ${seen.get(key)}`
      );
    } else {
      seen.set(key, entry.file);
    }
  }
}

report('unique targetQuery (no cannibalization)', failures);
