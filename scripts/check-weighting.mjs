// CLAUDE.md: "Weight the content calendar toward grant and prospect research…
// do not let the calendar drift back toward CRM posts just because that category
// has more competitors writing about it." The spec sets a 60% floor.
//
// That requirement drifted to 24% without anyone noticing, because nothing
// measured it — posts did not even carry a category, so the only tally that
// existed silently counted three of the five collections. This reports the real
// number across every published page that declares one.
//
// Warns rather than fails: the ratio moves one page at a time, and a red build
// on every commit until a multi-month content plan completes would just get
// ignored. Wire it into a red build only if it stops being watched.
import { readCollection, report, bold, green, yellow, red } from './_lib.mjs';

const FLOOR = 0.6;                       // CLAUDE.md requirement
const PRIORITY = ['grant-research', 'prospect-research'];
const COLLECTIONS = ['posts', 'platforms', 'alternatives', 'guides'];

const counts = new Map();
let total = 0;

for (const name of COLLECTIONS) {
  for (const entry of readCollection(name)) {
    if (entry.data.draft !== false) continue;
    const cat = entry.data.category;
    if (!cat) continue;
    counts.set(cat, (counts.get(cat) ?? 0) + 1);
    total += 1;
  }
}

if (total === 0) {
  console.log(yellow('~ weighting: no categorized published pages yet.'));
  process.exit(0);
}

const priority = PRIORITY.reduce((n, c) => n + (counts.get(c) ?? 0), 0);
const share = priority / total;
const pct = (n) => `${(n * 100).toFixed(0)}%`;

console.log(bold('\nCategory weighting'));
for (const [cat, n] of [...counts].sort((a, b) => b[1] - a[1])) {
  const star = PRIORITY.includes(cat) ? '*' : ' ';
  console.log(`  ${star} ${cat.padEnd(22)} ${String(n).padStart(3)}   ${pct(n / total).padStart(4)}`);
}
console.log(`    ${'—'.repeat(34)}`);
console.log(`      ${'grant + prospect'.padEnd(22)} ${String(priority).padStart(3)}   ${pct(share).padStart(4)}  (floor ${pct(FLOOR)})`);

// How many priority pages would close the gap, assuming nothing else is added.
if (share < FLOOR) {
  const needed = Math.ceil((FLOOR * total - priority) / (1 - FLOOR));
  console.log(
    yellow(
      `\n⚠ below the ${pct(FLOOR)} floor. ${needed} more grant/prospect page(s) would clear it ` +
      `if nothing else is published in the meantime.`
    )
  );
  console.log(yellow('  See content-calendar.md — Wave A and Wave B exist for this.'));
} else {
  console.log(green(`\n✓ weighting: grant + prospect at ${pct(share)}, above the ${pct(FLOOR)} floor.`));
}
