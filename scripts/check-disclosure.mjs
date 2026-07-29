// Guardrail #1: disclosure enforcement. Any rendered page that contains a /go/
// affiliate link MUST also render <AffiliateDisclosure /> (identified by the
// data-affiliate-disclosure marker). Runs on the built dist/ HTML so it verifies
// actual output, including layout auto-injection. Fails with the file path.
import { readdirSync, readFileSync, existsSync, statSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, report } from './_lib.mjs';

const DIST = join(ROOT, 'dist');

if (!existsSync(DIST)) {
  console.error('✗ disclosure check: dist/ not found — run `astro build` first.');
  process.exit(1);
}

function walk(dir) {
  const out = [];
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) out.push(...walk(p));
    else if (name.endsWith('.html')) out.push(p);
  }
  return out;
}

const failures = [];

for (const file of walk(DIST)) {
  const html = readFileSync(file, 'utf8');
  const hasGoLink = html.includes('href="/go/');
  const hasDisclosure = html.includes('data-affiliate-disclosure');
  if (hasGoLink && !hasDisclosure) {
    failures.push(`${file.replace(ROOT, '')} renders a /go/ link but no <AffiliateDisclosure />`);
  }
}

report('affiliate disclosure present wherever /go/ links render', failures);
