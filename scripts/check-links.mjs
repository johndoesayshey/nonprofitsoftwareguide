// Guardrail #4: link health. Every URL in affiliates.json (product url + any
// affiliateUrl) should resolve to 200. Network check — run manually or on a
// schedule via `npm run check-links`, not wired into the build. Exits non-zero
// if any link is unreachable so it is useful in CI/cron.
import { loadAffiliates, red, green, yellow } from './_lib.mjs';

const affiliates = loadAffiliates();
const TIMEOUT_MS = 15_000;
const UA =
  'Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 ' +
  '(KHTML, like Gecko) Chrome/124.0 Safari/537.36 nonprofitsoftwareguide-linkcheck';

async function check(url) {
  const ctrl = new AbortController();
  const timer = setTimeout(() => ctrl.abort(), TIMEOUT_MS);
  try {
    // GET (many marketing sites reject HEAD). Follow redirects to final status.
    const res = await fetch(url, {
      method: 'GET',
      redirect: 'follow',
      signal: ctrl.signal,
      headers: { 'user-agent': UA, accept: 'text/html,*/*' },
    });
    return res.status;
  } catch (err) {
    return `ERR ${err.name === 'AbortError' ? 'timeout' : err.message}`;
  } finally {
    clearTimeout(timer);
  }
}

const jobs = [];
for (const [slug, a] of Object.entries(affiliates)) {
  if (a.url) jobs.push({ slug, kind: 'url', url: a.url });
  if (a.affiliateUrl) jobs.push({ slug, kind: 'affiliateUrl', url: a.affiliateUrl });
}

console.log(`Checking ${jobs.length} URL(s)…`);
const results = await Promise.all(
  jobs.map(async (j) => ({ ...j, status: await check(j.url) }))
);

// Codes that mean "server is up but refused this automated client" — WAF/bot
// blocks, not dead links. Warn, don't fail: a real dead link gives a DNS/connect
// error, a timeout, a 404, or a 5xx.
const BLOCKED = new Set([401, 403, 405, 429]);

let failed = 0;
for (const r of results) {
  const ok = r.status === 200;
  const reachable = typeof r.status === 'number' && r.status >= 200 && r.status < 400;
  const blocked = BLOCKED.has(r.status);
  if (ok) {
    console.log(green(`  ✓ ${r.slug} (${r.kind}) ${r.status} ${r.url}`));
  } else if (reachable) {
    console.log(yellow(`  ~ ${r.slug} (${r.kind}) ${r.status} ${r.url} (non-200 but reachable)`));
  } else if (blocked) {
    console.log(yellow(`  ~ ${r.slug} (${r.kind}) ${r.status} ${r.url} (bot-blocked; site is up — eyeball manually)`));
  } else {
    failed++;
    console.log(red(`  ✗ ${r.slug} (${r.kind}) ${r.status} ${r.url}`));
  }
}

if (failed > 0) {
  console.error(red(`\n${failed} link(s) failed.`));
  process.exit(1);
}
console.log(green('\nAll affiliate links reachable.'));
