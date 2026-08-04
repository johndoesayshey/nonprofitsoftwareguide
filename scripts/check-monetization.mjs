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

// Estimated value of ONE referred customer, in dollars, over three years.
// A percentage band is not enough on its own: 30% sounds better than a $500
// bounty until you notice the product costs $204/yr, which makes it $61. Every
// figure below is computed from prices published on our own platform pages —
// see DECISIONS.md. null means genuinely unknown, not zero.
const LTV3 = {
  donordock: 500,      // $500 flat, one-time
  zeffy: 500,          // 30% of tips for 12 months; vendor-stated average per signup
  '4agoodcause': 891,  // 25% recurring, Grassroots $1,188/yr x 3
  donorbox: 1327,      // 15% of a 2.95% fee on $100k online, 3 years
  donately: 600,       // 20% of a 2-4% fee, modest online volume
  jotform: 88,         // 30% x 12 months of ~$24.50/mo
  eleo: 100,           // $100 flat, after 90 days
  instrumentl: 50,     // $50 flat
  monday: 20,          // $10+ per signup (PartnerStack directory, affiliate track)
  aplos: null,         // rate withheld until approval
  givewp: null,        // behind Impact terms
};

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
    return { slug, count, pot, score: SCORE[pot] ?? 0, ltv: LTV3[slug] ?? null, payout: a.payout ?? '—' };
  })
  .sort((a, b) => b.count - a.count);

console.log(bold('\nPlacement vs earning potential'));
console.log(`  ${'program'.padEnd(16)}${'pages'.padStart(6)}${'3yr/ref'.padStart(9)}  ${'potential'.padEnd(9)} payout`);
console.log(`  ${'-'.repeat(84)}`);
for (const r of rows) {
  const mark = EARNS.has(r.pot) ? green('$') : r.pot === 'none' ? red('·') : yellow('?');
  const val = r.ltv === null ? '     ?' : `$${r.ltv}`;
  console.log(`  ${mark} ${r.slug.padEnd(14)}${String(r.count).padStart(5)}${val.padStart(9)}  ${r.pot.padEnd(9)} ${String(r.payout).slice(0, 40)}`);
}

// The mismatch that matters: heavy placement on a program that cannot pay.
const wasted = rows.filter((r) => r.pot === 'none' && r.count >= 10);
// Worth more than an Eleo referral ($100) and placed on fewer than 15 pages.
// Anything below that threshold is not worth restructuring the site around.
const underplaced = rows.filter((r) => (r.ltv ?? 0) > 100 && r.count < 15);

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
    console.log(yellow(`    ${r.slug} on only ${r.count} pages — ~$${r.ltv} per referral over 3 years`));
  }
}

if (!wasted.length && !underplaced.length) {
  console.log(green('\n✓ placement broadly tracks earning potential.'));
}
console.log('');
