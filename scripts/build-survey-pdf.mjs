#!/usr/bin/env node
// Builds the downloadable survey PDF from src/data/survey-2026.json.
//
// The PDF machinery lives in scripts/lib/pdf.mjs and is shared with
// build-board-onepager.mjs. Runs as part of `npm run build`, so the PDF can
// never disagree with the page.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';
import { Page, buildPdf, loadPng, paragraph as wrap, textWidth, rgb, PAGE_W, PAGE_H } from './lib/pdf.mjs';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const survey = JSON.parse(readFileSync(join(ROOT, 'src/data/survey-2026.json'), 'utf8'));
const OUT = join(ROOT, 'public', survey.pdf.replace(/^\//, ''));

const SITE = 'https://nonprofitsoftwareguide.com';
const MARGIN = 54;

// Brand palette, matched to src/styles/global.css so the PDF and the site are
// recognisably the same publication.
const INK = rgb('#141514');
const TEAL = rgb('#0e4f4a');       // bands, emphasis
const TEAL_MID = rgb('#0a6a62');   // accents
const BAR = rgb('#8fbfba');        // data bars, must read as a scale not a smudge
const PAPER = ['1', '1', '1'];

// The actual logo file, drawn as a raster. It used to be redrawn here in vector
// strokes, which never looked like the real mark (the gear came out a plain
// circle). The band behind it is painted the logo's own background colour so
// the edge of the square tile disappears.
const logo = loadPng(join(ROOT, 'public/logo-512.png'), { maxSize: 128 });
const BRAND = logo.corner;

// ---------- document --------------------------------------------------------

const money = (n) => (n === 0 ? '$0' : '$' + n.toLocaleString('en-US'));
const COL_X = [MARGIN + 232, MARGIN + 318, MARGIN + 404, MARGIN + 504]; // right edges
const LABEL_X = MARGIN;

function header(p, y) {
  p.text(LABEL_X, y, 'NONPROFIT SOFTWARE GUIDE', { size: 7.5, bold: true, color: TEAL });
  p.text(PAGE_W - MARGIN, y, `${survey.title}`, { size: 7.5, gray: 0.5, align: 'right' });
  p.line(MARGIN, y - 8, PAGE_W - MARGIN, y - 8, { color: TEAL, width: 1.2 });
  return y - 32;
}

function footer(p, n, total) {
  p.line(MARGIN, 56, PAGE_W - MARGIN, 56, { gray: 0.85 });
  p.text(LABEL_X, 42, `${SITE}/benchmarks/`, { size: 8, gray: 0.45 });
  p.text(PAGE_W - MARGIN, 42, `${n} / ${total}`, { size: 8, bold: true, color: TEAL, align: 'right' });
}

/** Numbered section head with a short teal rule under it. */
function section(p, y, num, title) {
  p.text(LABEL_X, y, num, { size: 9, bold: true, color: TEAL_MID });
  p.text(LABEL_X + 20, y, title, { size: 13, bold: true, color: INK });
  p.line(LABEL_X, y - 7, LABEL_X + 34, y - 7, { color: TEAL, width: 1.6 });
  return y - 24;
}

/**
 * One data table. Each cell carries a proportional bar scaled to the largest
 * value in its own COLUMN, not the whole table — spend rises so steeply with
 * shop size that a table-wide scale would flatten every small-shop row to
 * nothing and show only that $5M+ organizations spend more, which nobody needs
 * a chart to learn. Per-column scaling shows the category mix within a size.
 */
function table(p, y, { caption, note, values, totals, fmt, bars = true }) {
  p.text(LABEL_X, y, caption, { size: 11.5, bold: true, color: INK });
  y -= 14;
  if (note) { p.text(LABEL_X, y, note, { size: 8.5, gray: 0.4 }); y -= 19; }
  else y -= 6;

  // Column maxima for bar scaling.
  const colMax = {};
  for (const seg of survey.segments) {
    colMax[seg.slug] = Math.max(...survey.categories.map((c) => values[c.slug][seg.slug]));
  }

  // Header band in brand teal, reversed out.
  p.rect(MARGIN - 4, y - 7, PAGE_W - 2 * MARGIN + 8, 21, 0, TEAL);
  p.text(LABEL_X, y + 2, 'CATEGORY', { size: 7.5, bold: true, color: PAPER });
  survey.segments.forEach((s, i) => {
    p.text(COL_X[i], y + 6, s.label, { size: 7.5, bold: true, color: PAPER, align: 'right' });
    p.text(COL_X[i], y - 2.5, `n=${s.n}`, { size: 6.5, color: PAPER, align: 'right' });
  });
  y -= 22;

  survey.categories.forEach((c, rowIdx) => {
    // Zebra banding, very light — enough to track a row across four columns.
    if (rowIdx % 2 === 1) p.rect(MARGIN - 4, y - 4.5, PAGE_W - 2 * MARGIN + 8, 15, 0.972);
    survey.segments.forEach((s, i) => {
      if (bars) p.bar(COL_X[i], y, values[c.slug][s.slug], colMax[s.slug], { color: BAR });
    });
    p.text(LABEL_X, y, c.label, { size: 9.5, color: INK });
    survey.segments.forEach((s, i) => {
      p.text(COL_X[i], y, fmt(values[c.slug][s.slug]), { size: 9.5, color: INK, align: 'right' });
    });
    y -= 16;
  });

  if (totals) {
    y -= 1;
    p.line(MARGIN, y + 9, PAGE_W - MARGIN, y + 9, { color: TEAL, width: 1 });
    p.text(LABEL_X, y, 'TOTAL SOFTWARE SPEND', { size: 9, bold: true, color: TEAL });
    survey.segments.forEach((s, i) => {
      p.text(COL_X[i], y, fmt(totals[s.slug]), { size: 10.5, bold: true, color: TEAL, align: 'right' });
    });
    y -= 8;
    p.line(MARGIN, y, PAGE_W - MARGIN, y, { color: TEAL, width: 1 });
    y -= 18;
  } else {
    p.line(MARGIN, y + 9, PAGE_W - MARGIN, y + 9, { gray: 0.8 });
    y -= 8;
  }
  return y;
}

/** Wrapped body copy, always in the left text column. */
const paragraph = (p, y, str, opts = {}) =>
  wrap(p, LABEL_X, y, str, { width: PAGE_W - 2 * MARGIN, ...opts });

// --- page 1: cover ---------------------------------------------------------
// A cover rather than a crammed first page. Two tables on page one was the main
// reason this read as a text dump: no entry point, no headline finding, nothing
// to look at before the data starts.
const p1 = new Page();
p1.rect(0, 0, PAGE_W, PAGE_H, 1);

const BAND_H = 250;
p1.rect(0, PAGE_H - BAND_H, PAGE_W, BAND_H, 0, BRAND);

const LOGO = 76;
p1.image('Logo', MARGIN, PAGE_H - 22 - LOGO, LOGO, LOGO);

let cy = PAGE_H - 150;
const coverTitleSize = Math.min(27, (PAGE_W - 2 * MARGIN) / textWidth(survey.title, 1, true));
p1.text(MARGIN, cy, survey.title, { size: coverTitleSize, bold: true, color: PAPER });
cy -= coverTitleSize + 12;
p1.text(MARGIN, cy, `What ${survey.sampleSize} US fundraising professionals report spending, by shop size.`,
  { size: 11.5, color: PAPER });
cy -= 18;
p1.text(MARGIN, cy, `Fielded ${survey.fielded}   |   n = ${survey.sampleSize}   |   Six software categories   |   Free to cite`,
  { size: 8.5, color: PAPER });

// Headline figures. Everything derived from the data so it cannot go stale.
const totals = survey.meanTotal;
const first = survey.segments[0], last = survey.segments[survey.segments.length - 1];
const multiple = Math.round(totals[last.slug] / totals[first.slug]);
const zeroScreen = survey.pctZero['prospect-research'][first.slug];

let y = PAGE_H - BAND_H - 46;
const statW = (PAGE_W - 2 * MARGIN) / 3;
const stats = [
  [money(totals[first.slug]), `${first.label} raised`, 'Mean total annual software spend'],
  [`${multiple}x`, 'spread across the sector', `${last.label} shops spend ${multiple}x the smallest group`],
  [`${zeroScreen}%`, 'spend $0 on screening', `Share of ${first.label} shops buying no wealth screening`],
];
stats.forEach(([big, small, note], i) => {
  const x = MARGIN + statW * i;
  if (i > 0) p1.line(x - 12, y - 34, x - 12, y + 14, { gray: 0.85 });
  p1.text(x, y, big, { size: 26, bold: true, color: TEAL });
  p1.text(x, y - 14, small, { size: 9, bold: true, color: INK });
  p1.text(x, y - 26, note, { size: 7.5, gray: 0.45 });
});
y -= 62;
p1.line(MARGIN, y, PAGE_W - MARGIN, y, { gray: 0.85 });
y -= 26;

y = section(p1, y, '01', 'Why this exists');
y = paragraph(p1, y,
  'Nonprofit software pricing is quoted, not published. Vendors negotiate per organization, ' +
  'roundup sites recycle each other\u2019s guesses, and a development director with a board meeting ' +
  'on Thursday has no way to tell whether a quote is reasonable. This benchmark exists so that ' +
  'question has an answer.',
  { size: 10, leading: 14 });
y -= 6;
y = paragraph(p1, y,
  `In ${survey.fielded}, ${survey.sampleSize} fundraising professionals in the United States completed an ` +
  'online survey reporting their organization\u2019s annual spend on fundraising software across six ' +
  'categories, grouped by the amount their organization raises each year. The figures that follow ' +
  'are the mean and median reported spend per category within each group, in US dollars.',
  { size: 10, leading: 14 });
y -= 10;

p1.rect(MARGIN - 6, y - 30, PAGE_W - 2 * MARGIN + 12, 40, 0, rgb('#e4f0ee'));
p1.text(MARGIN + 4, y - 6, 'How to use it:', { size: 9.5, bold: true, color: TEAL });
p1.text(MARGIN + 76, y - 6, 'find your revenue band, read across. If a quote sits well above', { size: 9.5, color: INK });
p1.text(MARGIN + 4, y - 19, 'the band for your size, the burden of proof is on the vendor.', { size: 9.5, color: INK });
y -= 56;

y = section(p1, y, '', 'What is inside');
const contents = [
  ['01', 'Why this exists', '1'],
  ['02', 'Mean annual spend by category', '2'],
  ['03', 'Median annual spend by category', '2'],
  ['04', 'Who spends nothing', '3'],
  ['05', 'Methodology', '3'],
  ['06', 'Citation', '3'],
  ['07', 'About this guide', '3'],
];
contents.forEach(([num, title, page], i) => {
  if (i % 2 === 1) p1.rect(MARGIN - 6, y - 4, PAGE_W - 2 * MARGIN + 12, 15, 0.972);
  p1.text(LABEL_X, y, num, { size: 8.5, bold: true, color: TEAL_MID });
  p1.text(LABEL_X + 22, y, title, { size: 10, color: INK });
  // leader dots, drawn as a rule so they never wrap oddly
  p1.line(LABEL_X + 26 + textWidth(title, 10), y + 3, PAGE_W - MARGIN - 16, y + 3, { gray: 0.86 });
  p1.text(PAGE_W - MARGIN, y, page, { size: 9, gray: 0.4, align: 'right' });
  y -= 15;
});

footer(p1, 1, 3);

// --- page 2: the data -------------------------------------------------------
const pData = new Page();
pData.rect(0, 0, PAGE_W, PAGE_H, 1);
y = header(pData, PAGE_H - MARGIN);

y = section(pData, y, '02', 'Mean annual spend');
y = table(pData, y, {
  caption: 'Mean annual spend by category',
  note: 'Average across all respondents in each group, including those reporting $0. Bars are scaled within each column.',
  values: survey.mean, totals: survey.meanTotal, fmt: money,
});

y -= 12;
y = section(pData, y, '03', 'Median annual spend');
y = table(pData, y, {
  caption: 'Median annual spend by category',
  note: 'The midpoint response. Lower than the mean wherever a few large spenders pull the average up.',
  values: survey.median, totals: survey.medianTotal, fmt: money,
});

y -= 18;
pData.line(MARGIN, y + 8, PAGE_W - MARGIN, y + 8, { gray: 0.85 });
pData.text(LABEL_X, y - 6, 'READING THESE TABLES', { size: 7.5, bold: true, color: TEAL });
y -= 22;
y = paragraph(pData, y,
  'Where the median is far below the mean, a small number of large spenders is pulling the average ' +
  'up and most organizations in that group spend less than the mean suggests. The gap is widest in ' +
  'prospect research and grant research at the smaller sizes, where the median is $0 and the mean ' +
  'is not: most organizations that size buy nothing, and the average is produced entirely by the ' +
  'few that do. Read the median, not the mean, if you are deciding whether you are behind.',
  { size: 9.5, leading: 13 });
y -= 4;
y = paragraph(pData, y,
  'At the larger sizes the two measures converge, and in a few cases the median sits slightly above ' +
  'the mean \u2014 which means spending in that category is broadly shared rather than concentrated. ' +
  'Bars are scaled within each column, not across the table: spend rises so steeply with shop size ' +
  'that a shared scale would flatten every small-shop row to nothing and show only that larger ' +
  'organizations spend more, which needs no chart.',
  { size: 9.5, leading: 13 });
footer(pData, 2, 3);

// --- page 3: zero-spend, method, citation -----------------------------------
const p2 = new Page();
p2.rect(0, 0, PAGE_W, PAGE_H, 1);
y = header(p2, PAGE_H - MARGIN);

y = section(p2, y, '04', 'Who spends nothing');
y = table(p2, y, {
  caption: 'Share of each group reporting $0 spend',
  note: 'The proportion of respondents in each group who spend nothing at all in that category.',
  values: survey.pctZero, totals: null, fmt: (v) => `${v}%`,
});

y -= 14;
y = section(p2, y, '05', 'Methodology');
y = paragraph(p2, y,
  `Fielded ${survey.fielded}. Population: ${survey.population}. ${survey.method} ` +
  `Sample size ${survey.sampleSize}, distributed across four groups by annual revenue raised: ` +
  survey.segments.map((s) => `${s.label} (n=${s.n})`).join(', ') + '. ' +
  'Figures are self-reported and unaudited, and are rounded to the nearest dollar. Percentages ' +
  'are rounded to the nearest whole percent. Group sizes at the upper end are small, so the ' +
  '$1M–$5M and $5M+ figures should be read as indicative rather than precise. No respondent ' +
  'identifying information was collected.');
y -= 10;

y = section(p2, y, '06', 'Citation');
y = paragraph(p2, y,
  'This benchmark is free to cite and reproduce with attribution. Suggested citation:');
y -= 4;
p2.rect(MARGIN - 4, y - 30, PAGE_W - 2 * MARGIN + 8, 40, 0.95);
y = paragraph(p2, y - 4,
  `Nonprofit Software Guide, “${survey.title}” (${survey.fielded}). ${SITE}/benchmarks/`,
  { size: 9, gray: 0.2 });
y -= 22;

y = section(p2, y, '07', 'About this guide');
paragraph(p2, y,
  'Nonprofit Software Guide is an independent publication that reviews fundraising software and ' +
  'publishes recommended technology stacks by organization size. It carries affiliate links; no ' +
  'vendor pays for placement, and no vendor reviews content before it publishes. Full disclosure ' +
  `at ${SITE}/disclosure/.`);
footer(p2, 3, 3);

// ---------- write -----------------------------------------------------------
// PDF_SPLIT=<dir> also writes each page as its own single-page PDF. Only useful
// for design review: macOS `sips` rasterizes page 1 of a PDF and nothing else,
// so this is how you actually look at page 3 without installing a toolchain.
const SPLIT = process.env.PDF_SPLIT;
if (SPLIT) {
  mkdirSync(SPLIT, { recursive: true });
  [p1, pData, p2].forEach((pg, i) => {
    writeFileSync(join(SPLIT, `page-${i + 1}.pdf`), buildPdf([pg], { title: survey.title, author: 'Nonprofit Software Guide', subject: '' }, { Logo: logo }));
  });
  console.log(`  split pages -> ${SPLIT}`);
}

mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, buildPdf([p1, pData, p2], {
  title: survey.title,
  author: 'Nonprofit Software Guide',
  subject: 'Annual fundraising software spend by nonprofit shop size, n=100, July 2026',
}));
console.log(`✓ survey PDF  ${survey.pdf}  (${(Buffer.byteLength(readFileSync(OUT)) / 1024).toFixed(0)}KB, 3 pages)`);
