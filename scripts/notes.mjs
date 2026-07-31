// `npm run notes` — print the feedback left in the visual editor.
// Notes are written by Notes mode in `npm run edit` and stored in feedback.json.
import { readFileSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, bold, green, yellow, red } from './_lib.mjs';

let notes = [];
try {
  notes = JSON.parse(readFileSync(join(ROOT, 'feedback.json'), 'utf8'));
} catch {
  console.log(yellow('\n  No feedback yet. Run `npm run edit`, press 💬 Notes, and click something.\n'));
  process.exit(0);
}

const open = notes.filter((n) => n.status === 'open');
const done = notes.filter((n) => n.status !== 'open');

console.log(bold(`\n  FEEDBACK — ${open.length} open, ${done.length} done\n`));

if (open.length === 0) console.log(green('  Nothing open.\n'));

const byPage = new Map();
for (const n of open) {
  if (!byPage.has(n.page)) byPage.set(n.page, []);
  byPage.get(n.page).push(n);
}

for (const [page, list] of byPage) {
  console.log(bold(`  ${page}`));
  for (const n of list) {
    console.log(yellow(`    • ${n.note}`));
    console.log(`        ${n.element}${n.file ? `  ${n.file}:${n.line}` : ''}  [${n.id}]`);
    if (n.snippet) console.log(`        "${n.snippet.slice(0, 70)}"`);
  }
  console.log('');
}

if (done.length) {
  console.log(green(`  ${done.length} resolved (kept for history in feedback.json)\n`));
}
