// Guardrail #2: [FACT-CHECK] (and [OPERATOR INPUT]) markers must never appear in
// PUBLISHED content (draft: false). Drafts may carry them freely — that's their
// purpose (CLAUDE.md guardrail #6). Fails the build with the offending file path.
import { readFileSync } from 'node:fs';
import { readCollection, report } from './_lib.mjs';

const MARKERS = ['[FACT-CHECK', '[OPERATOR INPUT'];
const failures = [];

for (const name of ['platforms', 'stacks', 'posts', 'alternatives', 'guides']) {
  for (const entry of readCollection(name)) {
    if (entry.data.draft !== false) continue; // only published content is gated
    const raw = readFileSync(entry.path, 'utf8');
    for (const marker of MARKERS) {
      if (raw.includes(marker)) {
        failures.push(`${entry.file} contains "${marker}]" but is published (draft: false)`);
      }
    }
  }
}

report('fact-check markers (published content is clean)', failures);
