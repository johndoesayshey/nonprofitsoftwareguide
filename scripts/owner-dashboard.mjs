// Owner dashboard: `npm run owner`
// Reads the live state of the site and prints what needs attention:
// affiliate pipeline, missing screenshots, stale prices, SEO setup,
// content counts, and any unchecked boxes in OWNER-GUIDE.md.
import { readFileSync, readdirSync, existsSync } from 'node:fs';
import { join } from 'node:path';
import { ROOT, readCollection, loadAffiliates, bold, green, yellow, red } from './_lib.mjs';

const dim = (s) => `\x1b[2m${s}\x1b[0m`;
const head = (s) => console.log('\n' + bold(s));
const line = (s) => console.log('  ' + s);

console.log(bold('\n════════ NONPROFIT SOFTWARE GUIDE — OWNER DASHBOARD ════════'));
console.log(dim(`  ${new Date().toDateString()} · run this anytime with: npm run owner`));

// ── 1. Affiliate pipeline ────────────────────────────────────────────────────
const affiliates = loadAffiliates();
const entries = Object.entries(affiliates);
const active = entries.filter(([, a]) => a.status === 'active');
const pending = entries.filter(([, a]) => a.status === 'pending');
const none = entries.filter(([, a]) => a.status === 'none');

// Application priority: fastest/most valuable first (see OWNER-GUIDE.md).
const APPLY_ORDER = [
  'jotform', 'donorbox', 'donordock', 'bloomerang', 'instrumentl',
  'grantstation', 'givewp', '4agoodcause', 'donorsnap', 'grantable',
  'monday', 'candid', 'kindsight', 'donorsearch', 'neoncrm',
];

head(`1. AFFILIATE PIPELINE — ${active.length} earning · ${pending.length} to apply · ${none.length} no program`);
if (active.length === 0) {
  line(red('No active affiliate links yet. Every /go/ click is currently unpaid.'));
  line(red('This is the highest-value task on the site.'));
} else {
  for (const [slug, a] of active) line(green(`✓ ${a.name} — earning (approved ${a.approvedOn ?? '?'})`));
}
const toApply = pending
  .filter(([, a]) => !a.appliedOn)
  .sort(([x], [y]) => (APPLY_ORDER.indexOf(x) + 99) - (APPLY_ORDER.indexOf(y) + 99));
if (toApply.length) {
  line('');
  line(bold('Apply next (in this order):'));
  for (const [slug, a] of toApply.slice(0, 15)) {
    line(yellow(`→ ${a.name.padEnd(16)} ${a.signupUrl ?? 'email partnerships (see OWNER-GUIDE.md)'}`));
  }
  line(dim('When approved: paste tracking URL into affiliateUrl, set status "active",'));
  line(dim('fill approvedOn, then rebuild + deploy. Every existing link starts earning.'));
}
const applied = pending.filter(([, a]) => a.appliedOn && !a.approvedOn);
if (applied.length) {
  line('');
  line(bold('Awaiting approval:'));
  for (const [, a] of applied) line(yellow(`… ${a.name} (applied ${a.appliedOn})`));
}

// ── 2. Screenshots ───────────────────────────────────────────────────────────
const platforms = readCollection('platforms');
const IMG_DIR = join(ROOT, 'public', 'images', 'platforms');
const hasShot = (slug) => ['png', 'webp', 'jpg'].some((e) => existsSync(join(IMG_DIR, `${slug}.${e}`)));
const priorityShots = ['instrumentl', 'donorbox', 'bloomerang', 'donordock', 'jotform', 'grantable'];
const missingPriority = priorityShots.filter((s) => !hasShot(s));
const haveShots = platforms.filter((p) => hasShot(p.data.slug)).length;

head(`2. SCREENSHOTS — ${haveShots}/${platforms.length} platform pages have one`);
if (missingPriority.length) {
  line(yellow(`Missing on top earners: ${missingPriority.join(', ')}`));
  line(dim('Drop files at public/images/platforms/<slug>.png (or .webp/.jpg).'));
  line(dim('They render automatically with SEO alt text. 1200-1600px wide is ideal.'));
} else {
  line(green('✓ All priority platforms have screenshots.'));
}

// ── 3. Content freshness (prices go stale) ───────────────────────────────────
const now = Date.now();
const ageDays = (d) => Math.floor((now - new Date(d).getTime()) / 86_400_000);
const stale = [];
for (const p of platforms) {
  if (p.data.draft === false && p.data.lastVerified && ageDays(p.data.lastVerified) > 90) {
    stale.push(`${p.data.slug} (${ageDays(p.data.lastVerified)}d)`);
  }
}
for (const s of readCollection('stacks')) {
  if (s.data.draft === false && s.data.lastVerified && ageDays(s.data.lastVerified) > 90) {
    stale.push(`stack ${s.data.slug} (${ageDays(s.data.lastVerified)}d)`);
  }
}
head('3. PRICE FRESHNESS — re-verify anything over 90 days');
if (stale.length) {
  line(yellow(`Stale: ${stale.join(', ')}`));
  line(dim('Check the vendor pricing page, update the file, bump lastVerified.'));
} else {
  line(green('✓ All published prices verified within 90 days.'));
}

// ── 4. Content pipeline ──────────────────────────────────────────────────────
const posts = readCollection('posts');
const pubPosts = posts.filter((p) => p.data.draft === false);
const stacks = readCollection('stacks').filter((s) => s.data.draft === false);
const pubPlatforms = platforms.filter((p) => p.data.draft === false);

head('4. CONTENT');
line(`${pubPosts.length} posts published · ${pubPlatforms.length} platform pages · ${stacks.length} stacks`);
const calendar = existsSync(join(ROOT, 'content-calendar.md'))
  ? readFileSync(join(ROOT, 'content-calendar.md'), 'utf8')
  : '';
const planned = (calendar.match(/^\|\s*[▶\d]/gm) || []).length;
if (planned > pubPosts.length) {
  line(dim(`Calendar has ~${planned - pubPosts.length} posts not yet written (content-calendar.md).`));
}
const newest = pubPosts.map((p) => +new Date(p.data.updatedDate ?? p.data.publishDate)).sort((a, b) => b - a)[0];
if (newest && ageDays(newest) > 21) {
  line(yellow(`Newest post is ${ageDays(newest)} days old. A post every 2-3 weeks keeps the site looking alive.`));
} else if (newest) {
  line(green('✓ Recent post within the last 3 weeks.'));
}

// ── 5. SEO & site setup ──────────────────────────────────────────────────────
head('5. SEO & SETUP');
const envPath = join(ROOT, '.env');
const env = existsSync(envPath) ? readFileSync(envPath, 'utf8') : '';
const flag = (ok, okMsg, badMsg) => line(ok ? green(`✓ ${okMsg}`) : yellow(`→ ${badMsg}`));
flag(/PUBLIC_GA4_ID=.+/.test(env), 'Google Analytics configured', 'GA4 not set: add PUBLIC_GA4_ID (see DEPLOY.md Part 4)');
flag(/PUBLIC_GSC_VERIFICATION=.+/.test(env), 'Search Console token set', 'Search Console not set: add PUBLIC_GSC_VERIFICATION, then submit sitemap.xml');
const aboutNoindex = readFileSync(join(ROOT, 'src/pages/about.astro'), 'utf8').includes('noindex={true}');
flag(!aboutNoindex, 'About page is live (indexable)', 'About page still hidden: personalize it, then remove noindex={true} in src/pages/about.astro');

// ── 6. Open to-dos from OWNER-GUIDE.md ──────────────────────────────────────
head('6. YOUR OPEN TO-DOS (unchecked boxes in OWNER-GUIDE.md)');
const guidePath = join(ROOT, 'OWNER-GUIDE.md');
if (existsSync(guidePath)) {
  const unchecked = readFileSync(guidePath, 'utf8')
    .split('\n')
    .filter((l) => /^\s*- \[ \]/.test(l))
    .map((l) => l.replace(/^\s*- \[ \]\s*/, ''));
  if (unchecked.length === 0) {
    line(green('✓ Nothing unchecked. Edit OWNER-GUIDE.md to add tasks.'));
  } else {
    for (const t of unchecked.slice(0, 12)) line(yellow(`☐ ${t}`));
    if (unchecked.length > 12) line(dim(`…and ${unchecked.length - 12} more in OWNER-GUIDE.md`));
    line(dim('Mark done by changing "- [ ]" to "- [x]" in OWNER-GUIDE.md.'));
  }
} else {
  line(red('OWNER-GUIDE.md not found.'));
}

console.log(bold('\n═════════════════════════════════════════════════════════════'));
console.log(dim('  Deeper checks: npm run check-links (affiliate URLs) · npm run build (all guardrails)\n'));
