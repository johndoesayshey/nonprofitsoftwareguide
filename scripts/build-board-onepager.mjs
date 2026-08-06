#!/usr/bin/env node
// Builds the one-page board briefing PDF from src/data/survey-2026.json.
//
// Different job from build-survey-pdf.mjs. That one is the full dataset for
// someone who wants to cite it. This one is a single sheet an executive
// director can hand round a board table to answer two questions: how much
// should an organization our size be spending, and where does the first dollar
// go. Every figure is read or derived from the same survey file, so the two
// documents and the site cannot drift apart.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Page, buildPdf, loadPng, paragraph, textWidth, rgb, PAGE_W, PAGE_H } from './lib/pdf.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const survey = JSON.parse(readFileSync(join(ROOT, 'src/data/survey-2026.json'), 'utf8'));
const OUT = join(ROOT, 'public', survey.boardPdf.replace(/^\//, ''));
const SITE = 'nonprofitsoftwareguide.com';

const MARGIN = 48;
const RIGHT = PAGE_W - MARGIN;
const COL = [312, 396, 480, 564];   // right edge of each revenue-band column

const INK = rgb('#141514');
const TEAL = rgb('#0e4f4a');
const TEAL_MID = rgb('#0a6a62');
const BAR = rgb('#a8ccc7');
const WASH = rgb('#e8f1ef');
const PAPER = ['1', '1', '1'];

// The real logo, not an approximation of it. Its own background is sampled off
// the file so the masthead band can be painted the identical colour and the
// square edge of the tile disappears into it.
const logo = loadPng(join(ROOT, 'public/logo-512.png'), { maxSize: 128 });
const BRAND = logo.corner;

const money = (n) => (n === 0 ? '$0' : '$' + n.toLocaleString('en-US'));
const seg = survey.segments;

// ---------- derived figures -------------------------------------------------

// Boards think in percentages of revenue; the survey collected dollars. The
// bands have no single revenue figure, so this is computed at each band's
// midpoint and, for the open-ended top band, at its floor (which makes that one
// a ceiling: an organization raising more than $5M spends a smaller share).
const MIDPOINT = { 'under-250k': 125_000, '250k-1m': 625_000, '1m-5m': 3_000_000, '5m-plus': 5_000_000 };
const pctOfRevenue = Object.fromEntries(
  seg.map((s) => [s.slug, (survey.medianTotal[s.slug] / MIDPOINT[s.slug]) * 100])
);

// "Share that buy anything" is the inverse of the reported $0 share, and it is
// the more useful direction for this audience: a board wants to know what peers
// their size actually buy, not what they skip.
const adoption = Object.fromEntries(
  survey.categories.map((c) => [c.slug, Object.fromEntries(seg.map((s) => [s.slug, 100 - survey.pctZero[c.slug][s.slug]]))])
);
// Ordered by how many of the smallest organizations buy it. That ordering is
// the finding: it is the sequence the sector actually buys in.
const bySequence = [...survey.categories].sort(
  (a, b) => adoption[b.slug][seg[0].slug] - adoption[a.slug][seg[0].slug]
);

const smallest = seg[0], largest = seg[seg.length - 1];
const pctRange = [Math.min(...Object.values(pctOfRevenue)), Math.max(...Object.values(pctOfRevenue))];

const p = new Page();

// Paint the sheet white. A PDF with no background is transparent, which most
// viewers show as white but rasterizers and LinkedIn's preview do not.
p.rect(0, 0, PAGE_W, PAGE_H, 1);

// ---------- masthead --------------------------------------------------------

const BAND_H = 104;
p.rect(0, PAGE_H - BAND_H, PAGE_W, BAND_H, 0, BRAND);

const LOGO = 74;
p.image('Logo', MARGIN, PAGE_H - 15 - LOGO, LOGO, LOGO);

const bx = MARGIN + LOGO + 22;
p.text(bx, PAGE_H - 42, 'BOARD BRIEFING', { size: 10, bold: true, color: PAPER, tracking: 1.6 });
p.line(bx, PAGE_H - 51, bx + 116, PAGE_H - 51, { color: PAPER, width: 1.2 });
p.text(bx, PAGE_H - 66, 'Independent research for boards and executive directors.', { size: 9.5, color: rgb('#cfe2df') });
p.text(bx, PAGE_H - 80, `${survey.sampleSize} US fundraising professionals  |  fielded ${survey.fielded}  |  free to cite`,
  { size: 8, color: rgb('#a9c8c3') });
p.text(RIGHT, PAGE_H - 42, SITE, { size: 9, bold: true, color: rgb('#cfe2df'), align: 'right' });

// ---------- title + answer --------------------------------------------------

let y = PAGE_H - BAND_H - 36;
p.text(MARGIN, y, 'What should we spend on fundraising software?', { size: 20, bold: true, color: INK });
y -= 23;

// Answer first, in 40-60 words, before any context. Same rule the site runs on.
y = paragraph(p, MARGIN, y,
  `Most nonprofits spend between 1% and 2% of what they raise on fundraising software, counting every ` +
  `tool together. A $500,000 organization sits in the second band below, where the median is ` +
  `${money(survey.medianTotal['250k-1m'])} a year. The first dollars belong in two places: the database that ` +
  `records who gives, and the way gifts come in.`,
  { size: 10.5, leading: 14.5, gray: 0.1, width: RIGHT - MARGIN });
y -= 6;

// ---------- section helper --------------------------------------------------

function section(yy, num, title) {
  p.text(MARGIN, yy, num, { size: 9, bold: true, color: TEAL_MID });
  p.text(MARGIN + 20, yy, title, { size: 12.5, bold: true, color: INK });
  p.line(MARGIN, yy - 6.5, RIGHT, yy - 6.5, { color: TEAL, width: 1.2 });
  return yy - 20;
}

/** Column header band, reversed out of brand teal. */
function columnHead(yy, label) {
  p.rect(MARGIN - 4, yy - 7, RIGHT - MARGIN + 8, 21, 0, TEAL);
  p.text(MARGIN, yy + 2, label, { size: 7.5, bold: true, color: PAPER, tracking: 0.5 });
  seg.forEach((s, i) => {
    p.text(COL[i], yy + 6, s.label, { size: 7.5, bold: true, color: PAPER, align: 'right' });
    p.text(COL[i], yy - 2.5, `n=${s.n}`, { size: 6.5, color: rgb('#a9c8c3'), align: 'right' });
  });
  return yy - 22;
}

// ---------- 01 how much -----------------------------------------------------

y = section(y, '01', 'What organizations your size spend');
y = columnHead(y, 'IF YOU RAISE');

const rows = [
  ['Median total, all software', (s) => money(survey.medianTotal[s.slug]), true],
  ['Mean total, all software', (s) => money(survey.meanTotal[s.slug]), false],
  ['Share of annual revenue', (s) => `${pctOfRevenue[s.slug].toFixed(1)}%`, false],
];
const maxMedian = Math.max(...seg.map((s) => survey.medianTotal[s.slug]));
rows.forEach(([label, fmt, emphasis], idx) => {
  if (idx === 1) p.rect(MARGIN - 4, y - 4.5, RIGHT - MARGIN + 8, 16, 0.972);
  if (idx === 0) seg.forEach((s, i) => p.bar(COL[i], y, survey.medianTotal[s.slug], maxMedian, { color: BAR, width: 62 }));
  p.text(MARGIN, y, label, { size: 9.5, color: INK, bold: emphasis });
  seg.forEach((s, i) => p.text(COL[i], y, fmt(s), {
    size: emphasis ? 11 : 9.5, bold: emphasis, color: emphasis ? TEAL : INK, align: 'right',
  }));
  y -= 16;
});
p.line(MARGIN, y + 10, RIGHT, y + 10, { color: TEAL, width: 1 });
y -= 2;
// Notes go through paragraph() rather than text() so a reworded one wraps
// inside the margins instead of running off the right edge of the sheet.
y = paragraph(p, MARGIN, y, 'Total across all six categories. Revenue share is computed at each band’s midpoint ' +
  '($125K, $625K, $3M) and at the $5M floor above, so the last figure is a ceiling.',
  { size: 7.5, gray: 0.45, leading: 10, width: RIGHT - MARGIN });
y -= 12;

// ---------- 02 what gets bought ---------------------------------------------

y = section(y, '02', 'What a shop your size actually buys');
y = columnHead(y, 'SHARE THAT SPEND ANYTHING');

bySequence.forEach((c, idx) => {
  if (idx % 2 === 1) p.rect(MARGIN - 4, y - 4.5, RIGHT - MARGIN + 8, 15, 0.972);
  seg.forEach((s, i) => p.bar(COL[i], y, adoption[c.slug][s.slug], 100, { color: BAR, width: 62 }));
  p.text(MARGIN, y, c.label, { size: 9.5, color: INK });
  seg.forEach((s, i) => p.text(COL[i], y, `${adoption[c.slug][s.slug]}%`, { size: 9.5, color: INK, align: 'right' }));
  y -= 14.5;
});
p.line(MARGIN, y + 9, RIGHT, y + 9, { color: TEAL, width: 1 });
y -= 3;
y = paragraph(p, MARGIN, y, 'Read down your column. Rows are ordered by how many of the smallest organizations buy the ' +
  'category, which is also the order the sector buys in.',
  { size: 7.5, gray: 0.45, leading: 10, width: RIGHT - MARGIN });
y -= 12;

// ---------- 03 priority -----------------------------------------------------

y = section(y, '03', 'Where the first dollar goes');

const priorities = [
  ['FIRST', 'The database, and the way gifts come in.',
    `The only two categories most small organizations pay for, and processing is the largest single line at ` +
    `every size. ${survey.pctZero['donor-crm'][smallest.slug]}% of organizations under $250K have no donor database at all.`],
  ['NEXT', 'Grant research, forms, events.',
    `${adoption['grant-research'][smallest.slug]}% of the smallest organizations buy grant research, rising to ` +
    `${adoption['grant-research']['1m-5m']}% at $1M to $5M and all of them above $5M. These arrive with staff capacity, not before it.`],
  ['LAST', 'Wealth screening.',
    `${survey.pctZero['prospect-research'][smallest.slug]}% of organizations under $250K spend nothing here. ` +
    `The clearest line to defer, and the clearest sign of scale when it appears.`],
];
priorities.forEach(([tag, head, body]) => {
  // Measure the wrapped body rather than assuming a fixed block height, so a
  // reworded line can never silently overlap the next tier.
  const bodyEnd = paragraph(p, MARGIN + 46, y - 12.5, body,
    { size: 9, leading: 11.5, gray: 0.28, width: RIGHT - MARGIN - 46 });
  p.rect(MARGIN - 4, bodyEnd + 8, 2.5, y - bodyEnd - 4, 0, TEAL);
  p.text(MARGIN + 6, y, tag, { size: 7.5, bold: true, color: TEAL_MID, tracking: 1 });
  p.text(MARGIN + 46, y, head, { size: 10, bold: true, color: INK });
  y = bodyEnd - 5;
});
y -= 2;

// ---------- 04 questions ----------------------------------------------------

y = section(y, '04', 'Four questions to ask before approving a line');

const questions = [
  'What do we spend in total, and what share of what we raise is that?',
  'How many gifts last year were never recorded in a database?',
  'What does a dollar cost us to accept online, and when did we last check?',
  'Which contracts renew in the next twelve months, and on what terms?',
];
const HALF = (RIGHT - MARGIN) / 2;
let qBottom = y;
questions.forEach((q, i) => {
  const qx = MARGIN + (i % 2) * (HALF + 6);
  const qy = y - Math.floor(i / 2) * 26;
  p.text(qx, qy, `${i + 1}`, { size: 10, bold: true, color: TEAL_MID });
  qBottom = Math.min(qBottom, paragraph(p, qx + 13, qy, q, { size: 9, leading: 11.5, gray: 0.15, width: HALF - 19 }));
});
y = qBottom - 10;

// ---------- closing note + footer -------------------------------------------

p.rect(MARGIN - 6, y - 8, RIGHT - MARGIN + 12, 21, 0, WASH);
p.text(MARGIN + 4, y, 'Software does not raise money. People do.', { size: 9.5, bold: true, color: TEAL });
p.text(MARGIN + 6 + textWidth('Software does not raise money. People do.', 9.5, true), y,
  'These are the cost of doing the work properly, not a fundraising plan.', { size: 9.5, color: INK });

const FOOT_TOP = 62;
p.line(MARGIN, FOOT_TOP, RIGHT, FOOT_TOP, { gray: 0.8 });
// Left block is held to 340pt so a longer source line can never run under the
// URL sitting right-aligned beside it.
p.text(MARGIN, 50, `Source: Nonprofit Software Guide, “${survey.title}”`, { size: 7.5, gray: 0.4 });
p.text(MARGIN, 40, `(${survey.fielded}). Self-reported and unaudited. The $1M-$5M (n=${seg[2].n}) and $5M+ (n=${seg[3].n}) groups are`,
  { size: 7.5, gray: 0.4 });
p.text(MARGIN, 30, 'small, so read those as indicative. Free to reproduce with attribution.', { size: 7.5, gray: 0.4 });
p.text(MARGIN, 20, 'Independent publication. Carries affiliate links; no vendor pays for placement or reviews content before publication.',
  { size: 7.5, gray: 0.55 });
p.text(RIGHT, 50, SITE, { size: 10, bold: true, color: TEAL, align: 'right' });
p.text(RIGHT, 39, '/benchmarks for the full data', { size: 7.5, gray: 0.45, align: 'right' });

// ---------- write -----------------------------------------------------------

// One page is the whole point of the format. Rewording any block above can push
// the last one into the footer, and a PDF does not complain when it happens, so
// the build does.
const contentBottom = y - 8;
if (contentBottom < FOOT_TOP + 6) {
  throw new Error(
    `board briefing overflows: content ends at y=${contentBottom.toFixed(1)}, footer rule is at ${FOOT_TOP}. ` +
    `Shorten a section by ${(FOOT_TOP + 6 - contentBottom).toFixed(0)}pt.`
  );
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, buildPdf([p], {
  title: 'What should we spend on fundraising software? A board briefing',
  author: 'Nonprofit Software Guide',
  subject: `Fundraising software spend benchmarks by nonprofit size, n=${survey.sampleSize}, ${survey.fielded}`,
}, { Logo: logo }));

console.log(
  `✓ board briefing  /${OUT.split('/').pop()}  ` +
  `(${(readFileSync(OUT).length / 1024).toFixed(0)}KB, 1 page, logo ${logo.width}px)  ` +
  `revenue share ${pctRange[0].toFixed(1)}%-${pctRange[1].toFixed(1)}%, ${(contentBottom - FOOT_TOP).toFixed(0)}pt clear of the footer`
);
