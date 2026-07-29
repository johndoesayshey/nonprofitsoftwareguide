// Guardrail #3: freshness. Software pricing queries are freshness-weighted, so
// this reports any page whose lastVerified (platforms/stacks) or updated/publish
// date (posts) is older than 90 days. WARNS ONLY — never fails the build.
import { readCollection, yellow, green } from './_lib.mjs';

const MAX_AGE_DAYS = 90;
const now = Date.now();
const stale = [];

function ageDays(value) {
  if (!value) return null;
  const t = new Date(value).getTime();
  if (Number.isNaN(t)) return null;
  return Math.floor((now - t) / 86_400_000);
}

for (const name of ['platforms', 'stacks']) {
  for (const entry of readCollection(name)) {
    const age = ageDays(entry.data.lastVerified);
    if (age !== null && age > MAX_AGE_DAYS) {
      stale.push(`${entry.file} — lastVerified ${age} days ago`);
    }
  }
}
for (const post of readCollection('posts')) {
  const ref = post.data.updatedDate ?? post.data.publishDate;
  const age = ageDays(ref);
  if (age !== null && age > MAX_AGE_DAYS) {
    stale.push(`${post.file} — last updated ${age} days ago`);
  }
}

if (stale.length === 0) {
  console.log(green(`✓ freshness: nothing over ${MAX_AGE_DAYS} days.`));
} else {
  console.log(yellow(`⚠ freshness: ${stale.length} page(s) over ${MAX_AGE_DAYS} days — re-verify pricing:`));
  for (const s of stale) console.log(yellow(`  • ${s}`));
}
// Warn only: always exit 0.
process.exit(0);
