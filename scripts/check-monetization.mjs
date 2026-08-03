// Replaces check-weighting.mjs (removed 2026-08-03).
//
// That script measured the share of pages in the two "priority categories" the
// original spec named, and reported a 60% floor. Once every affiliate program
// was actually verified, the premise stopped holding: the priority category's
// best program pays $50 flat on a $2,148/yr product, while the categories the
// spec de-prioritized carry a $500 bounty and the only recurring commission on
// the roster. Counting pages by category was measuring the wrong thing.
//
// This measures placement against earning potential instead: where the site
// spends its most valuable real estate, and whether that matches what each
// program can actually pay. It reads dist/, so run it after a build.
//
// Warns rather than fails — it is a judgement aid, not a correctness check.
import { readdirSync, readFileSync, statSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, loadAffiliates, bold, green, yellow, red } from './_lib.mjs';

const DIST = join(ROOT, 'dist');
if (!existsSync(DIST)) {
  console.error('✗ monetization: dist/ not found — run `astro build` first.');
  process.exit(1);
}

// Same scale as src/lib/affiliate-value.ts. Kept in sync by hand; it is five
// numbers and a build-time import from TS into a plain .mjs script is not worth
// the toolchain.
const SCORE = { high: 100, medium: 40, unknown: 15, low: 8, none: 0 };
const EARNS = new Set(['high', 'medium']);

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

const affiliates = loadAffiliates();
const pages = walk(DIST).filter((f) => !f.includes(`${'/'}go${'/'}`));

const placement = new Map(); // slug -> page count
let earningPages = 0;
let deadPages = 0;

for (const file of pages) {
  const html = readFileSync(file, 'utf8');
  const slugs = [...new Set([...html.matchAll(/href="\/go\/([a-z0-9-]+)"/g)].map((m) => m[1]))];
  if (slugs.length === 0) continue;
  for (const s of slugs) placement.set(s, (placement.get(s) ?? 0) + 1);
  if (slugs.some((s) => EARNS.has(affiliates[s]?.potential))) earningPages += 1;
  else deadPages += 1;
}

const rows = [...placement.entries()]
  .map(([slug, count]) => {
    const a = affiliates[slug] ?? {};
    const pot = a.potential ?? 'none';
    return { slug, count, pot, score: SCORE[pot] ?? 0, payout: a.payout ?? '—' };
  })
  .sort((a, b) => b.count - a.count);

console.log(bold('\nPlacement vs earning potential'));
console.log(`  ${'program'.padEnd(16)}${'pages'.padStart(6)}  ${'potential'.padEnd(9)} payout`);
console.log(`  ${'-'.repeat(74)}`);
for (const r of rows) {
  const mark = EARNS.has(r.pot) ? green('$') : r.pot === 'none' ? red('·') : yellow('?');
  console.log(`  ${mark} ${r.slug.padEnd(14)}${String(r.count).padStart(5)}  ${r.pot.padEnd(9)} ${String(r.payout).slice(0, 44)}`);
}

// The mismatch that matters: heavy placement on a program that cannot pay.
const wasted = rows.filter((r) => r.pot === 'none' && r.count >= 10);
const underplaced = rows.filter((r) => EARNS.has(r.pot) && r.count < 15);

console.log(
  `\n  ${earningPages} page(s) route to a program that can pay; ${deadPages} carry only ` +
  `non-earning links.`
);

if (wasted.length) {
  console.log(yellow('\n⚠ Heavily placed, cannot pay:'));
  for (const r of wasted) {
    console.log(yellow(`    ${r.slug} on ${r.count} pages — ${r.payout}`));
  }
  console.log(yellow('  Fine where the product genuinely belongs in a shortlist (free options,'));
  console.log(yellow('  category leaders readers expect). Worth a look if it is neither.'));
}

if (underplaced.length) {
  console.log(yellow('\n⚠ Can pay, thinly placed:'));
  for (const r of underplaced) {
    console.log(yellow(`    ${r.slug} on only ${r.count} pages — ${r.payout}`));
  }
}

if (!wasted.length && !underplaced.length) {
  console.log(green('\n✓ placement broadly tracks earning potential.'));
}
console.log('');
