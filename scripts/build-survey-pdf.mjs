#!/usr/bin/env node
// Builds the downloadable survey PDF from src/data/survey-2026.json.
//
// Written by hand against the PDF spec rather than pulling in a PDF library:
// the document is a few pages of text and rules, the site has no other runtime
// dependencies, and a library would be ~2MB of node_modules to draw a table.
// Runs as part of `npm run build`, so the PDF can never disagree with the page.

import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { join, dirname } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = join(dirname(fileURLToPath(import.meta.url)), '..');
const survey = JSON.parse(readFileSync(join(ROOT, 'src/data/survey-2026.json'), 'utf8'));
const OUT = join(ROOT, 'public', survey.pdf.replace(/^\//, ''));

const SITE = 'https://nonprofitsoftwareguide.com';
const PAGE_W = 612;   // US Letter, 72dpi
const PAGE_H = 792;
const MARGIN = 54;

// ---------- tiny PDF writer -------------------------------------------------

/**
 * PDF text strings escape backslash and both parentheses. Typographic
 * characters are folded to ASCII first: the base-14 Helvetica WinAnsi encoding
 * drops en-dashes and curly quotes silently, so they vanish from the page
 * rather than raising an error.
 */
const ASCII = { '\u2013': '-', '\u2014': '-', '\u2018': "'", '\u2019': "'",
                '\u201c': '"', '\u201d': '"', '\u2026': '...', '\u00a0': ' ', '\u00b7': '-' };
const esc = (s) =>
  String(s)
    .replace(/[\u2013\u2014\u2018\u2019\u201c\u201d\u2026\u00a0\u00b7]/g, (c) => ASCII[c])
    .replace(/\\/g, '\\\\')
    .replace(/\(/g, '\\(')
    .replace(/\)/g, '\\)');

// Helvetica advance widths (units/1000) for the printable ASCII range. Enough
// to right-align currency and centre a title without guessing.
const W = {
  ' ': 278, '!': 278, '"': 355, '#': 556, '$': 556, '%': 889, '&': 667, "'": 191,
  '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278,
  '0': 556, '1': 556, '2': 556, '3': 556, '4': 556, '5': 556, '6': 556, '7': 556,
  '8': 556, '9': 556, ':': 278, ';': 278, '<': 584, '=': 584, '>': 584, '?': 556,
  '@': 1015, 'A': 667, 'B': 667, 'C': 722, 'D': 722, 'E': 667, 'F': 611, 'G': 778,
  'H': 722, 'I': 278, 'J': 500, 'K': 667, 'L': 556, 'M': 833, 'N': 722, 'O': 778,
  'P': 667, 'Q': 778, 'R': 722, 'S': 667, 'T': 611, 'U': 722, 'V': 667, 'W': 944,
  'X': 667, 'Y': 667, 'Z': 611, '[': 278, '\\': 278, ']': 278, '^': 469, '_': 556,
  '`': 333, 'a': 556, 'b': 556, 'c': 500, 'd': 556, 'e': 556, 'f': 278, 'g': 556,
  'h': 556, 'i': 222, 'j': 222, 'k': 500, 'l': 222, 'm': 833, 'n': 556, 'o': 556,
  'p': 556, 'q': 556, 'r': 333, 's': 500, 't': 278, 'u': 556, 'v': 500, 'w': 722,
  'x': 500, 'y': 500, 'z': 500, '{': 334, '|': 260, '}': 334, '~': 584,
};
const BOLD_FACTOR = 1.0; // Helvetica-Bold is close enough at these sizes

function textWidth(str, size, bold = false) {
  let n = 0;
  const folded = String(str).replace(/[\u2013\u2014\u2018\u2019\u201c\u201d\u2026\u00a0\u00b7]/g, (c) => ASCII[c]);
  for (const ch of folded) n += W[ch] ?? 556;
  return (n / 1000) * size * (bold ? BOLD_FACTOR : 1);
}

class Page {
  constructor() { this.ops = []; }
  text(x, y, str, { size = 10, bold = false, gray = 0, align = 'left' } = {}) {
    const font = bold ? '/F2' : '/F1';
    let tx = x;
    if (align === 'right') tx = x - textWidth(str, size, bold);
    if (align === 'center') tx = x - textWidth(str, size, bold) / 2;
    this.ops.push(`BT ${gray} g ${font} ${size} Tf 1 0 0 1 ${tx.toFixed(2)} ${y.toFixed(2)} Tm (${esc(str)}) Tj ET`);
    return this;
  }
  line(x1, y1, x2, y2, { width = 0.5, gray = 0.75 } = {}) {
    this.ops.push(`${gray} G ${width} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
    return this;
  }
  rect(x, y, w, h, gray = 0.94) {
    this.ops.push(`${gray} g ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
    return this;
  }
  get stream() { return this.ops.join('\n'); }
}

function buildPdf(pages, meta) {
  const objs = [];
  const add = (body) => { objs.push(body); return objs.length; }; // 1-indexed

  const kidsIds = [];
  const contentIds = [];
  for (const p of pages) contentIds.push(null);

  // reserve: 1 catalog, 2 pages, 3 F1, 4 F2, then page/content pairs
  const catalogId = 1, pagesId = 2, f1Id = 3, f2Id = 4;
  objs.length = 4;
  objs[2] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
  objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';

  pages.forEach((p) => {
    const stream = p.stream;
    const cid = add(`<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`);
    const pid = add(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
      `/Resources << /Font << /F1 ${f1Id} 0 R /F2 ${f2Id} 0 R >> >> /Contents ${cid} 0 R >>`
    );
    kidsIds.push(pid);
  });

  objs[0] = `<< /Type /Catalog /Pages ${pagesId} 0 R >>`;
  objs[1] = `<< /Type /Pages /Kids [${kidsIds.map((i) => `${i} 0 R`).join(' ')}] /Count ${kidsIds.length} >>`;
  const infoId = add(
    `<< /Title (${esc(meta.title)}) /Author (${esc(meta.author)}) /Subject (${esc(meta.subject)}) ` +
    `/Creator (${esc(meta.author)}) /Producer (${esc(meta.author)}) >>`
  );

  let out = '%PDF-1.4\n';
  const offsets = [0];
  objs.forEach((body, i) => {
    offsets.push(Buffer.byteLength(out, 'latin1'));
    out += `${i + 1} 0 obj\n${body}\nendobj\n`;
  });
  const xrefPos = Buffer.byteLength(out, 'latin1');
  out += `xref\n0 ${objs.length + 1}\n0000000000 65535 f \n`;
  for (let i = 1; i <= objs.length; i++) {
    out += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  }
  out += `trailer\n<< /Size ${objs.length + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}

// ---------- document --------------------------------------------------------

const money = (n) => (n === 0 ? '$0' : '$' + n.toLocaleString('en-US'));
const COL_X = [MARGIN + 232, MARGIN + 318, MARGIN + 404, MARGIN + 504]; // right edges
const LABEL_X = MARGIN;

function header(p, y) {
  p.text(LABEL_X, y, 'NONPROFIT SOFTWARE GUIDE', { size: 8, bold: true, gray: 0.45 });
  p.text(PAGE_W - MARGIN, y, `Fielded ${survey.fielded}  ·  n = ${survey.sampleSize}`, { size: 8, gray: 0.45, align: 'right' });
  p.line(MARGIN, y - 8, PAGE_W - MARGIN, y - 8, { gray: 0.8 });
  return y - 30;
}

function footer(p, n, total) {
  p.line(MARGIN, 56, PAGE_W - MARGIN, 56, { gray: 0.85 });
  p.text(LABEL_X, 42, `${SITE}/benchmarks/`, { size: 8, gray: 0.45 });
  p.text(PAGE_W - MARGIN, 42, `Page ${n} of ${total}`, { size: 8, gray: 0.45, align: 'right' });
}

/** One data table: header row, a row per category, a bold total row. */
function table(p, y, { caption, note, values, totals, fmt }) {
  p.text(LABEL_X, y, caption, { size: 12, bold: true });
  y -= 15;
  if (note) { p.text(LABEL_X, y, note, { size: 8.5, gray: 0.4 }); y -= 20; }
  else y -= 6;

  p.rect(MARGIN - 4, y - 6, PAGE_W - 2 * MARGIN + 8, 20, 0.93);
  p.text(LABEL_X, y + 2, 'Category', { size: 8, bold: true, gray: 0.25 });
  survey.segments.forEach((s, i) => {
    p.text(COL_X[i], y + 6, s.label, { size: 8, bold: true, gray: 0.25, align: 'right' });
    p.text(COL_X[i], y - 2, `n=${s.n}`, { size: 7, gray: 0.5, align: 'right' });
  });
  y -= 16;
  p.line(MARGIN, y, PAGE_W - MARGIN, y, { gray: 0.35, width: 1 });
  y -= 15;

  for (const c of survey.categories) {
    p.text(LABEL_X, y, c.label, { size: 9.5 });
    survey.segments.forEach((s, i) => {
      p.text(COL_X[i], y, fmt(values[c.slug][s.slug]), { size: 9.5, align: 'right' });
    });
    y -= 8;
    p.line(MARGIN, y, PAGE_W - MARGIN, y, { gray: 0.9 });
    y -= 11;
  }

  if (totals) {
    y -= 2;
    p.text(LABEL_X, y, 'Total software spend', { size: 10, bold: true });
    survey.segments.forEach((s, i) => {
      p.text(COL_X[i], y, fmt(totals[s.slug]), { size: 10, bold: true, align: 'right' });
    });
    y -= 9;
    p.line(MARGIN, y, PAGE_W - MARGIN, y, { gray: 0.35, width: 1 });
    y -= 16;
  }
  return y;
}

/** Naive greedy wrap against the Helvetica metrics above. */
function paragraph(p, y, str, { size = 9.5, gray = 0.15, leading = 13, width = PAGE_W - 2 * MARGIN } = {}) {
  let line = '';
  for (const word of str.split(' ')) {
    const next = line ? line + ' ' + word : word;
    if (textWidth(next, size) > width && line) {
      p.text(LABEL_X, y, line, { size, gray });
      y -= leading;
      line = word;
    } else line = next;
  }
  if (line) { p.text(LABEL_X, y, line, { size, gray }); y -= leading; }
  return y;
}

// --- page 1 -----------------------------------------------------------------
const p1 = new Page();
let y = header(p1, PAGE_H - MARGIN);

p1.text(LABEL_X, y, survey.title, { size: 21, bold: true });
y -= 24;
p1.text(LABEL_X, y, 'What nonprofits actually spend on fundraising software, by shop size.', { size: 11, gray: 0.35 });
y -= 30;

y = paragraph(p1, y,
  `In ${survey.fielded}, ${survey.sampleSize} fundraising professionals in the United States completed an online ` +
  'survey reporting their organization’s annual spend on fundraising software across six categories. ' +
  'Respondents were grouped by the amount their organization raises each year. The figures below are the ' +
  'mean reported spend per category within each group, in US dollars.');
y -= 8;

y = table(p1, y, {
  caption: 'Mean annual spend by category',
  note: 'Average across all respondents in each group, including those reporting $0.',
  values: survey.mean, totals: survey.meanTotal, fmt: money,
});

y -= 4;
y = table(p1, y, {
  caption: 'Median annual spend by category',
  note: 'The midpoint response. Lower than the mean wherever a few large spenders pull the average up.',
  values: survey.median, totals: survey.medianTotal, fmt: money,
});
footer(p1, 1, 2);

// --- page 2 -----------------------------------------------------------------
const p2 = new Page();
y = header(p2, PAGE_H - MARGIN);

y = table(p2, y, {
  caption: 'Share of each group reporting $0 spend',
  note: 'The proportion of respondents in each group who spend nothing at all in that category.',
  values: survey.pctZero, totals: null, fmt: (v) => `${v}%`,
});

y -= 6;
p2.text(LABEL_X, y, 'Methodology', { size: 12, bold: true });
y -= 16;
y = paragraph(p2, y,
  `Fielded ${survey.fielded}. Population: ${survey.population}. ${survey.method} ` +
  `Sample size ${survey.sampleSize}, distributed across four groups by annual revenue raised: ` +
  survey.segments.map((s) => `${s.label} (n=${s.n})`).join(', ') + '. ' +
  'Figures are self-reported and unaudited, and are rounded to the nearest dollar. Percentages ' +
  'are rounded to the nearest whole percent. Group sizes at the upper end are small, so the ' +
  '$1M–$5M and $5M+ figures should be read as indicative rather than precise. No respondent ' +
  'identifying information was collected.');
y -= 10;

p2.text(LABEL_X, y, 'Citation', { size: 12, bold: true });
y -= 16;
y = paragraph(p2, y,
  'This survey is free to cite and reproduce with attribution. Suggested citation:');
y -= 4;
p2.rect(MARGIN - 4, y - 30, PAGE_W - 2 * MARGIN + 8, 40, 0.95);
y = paragraph(p2, y - 4,
  `Nonprofit Software Guide, “${survey.title}” (${survey.fielded}). ${SITE}/benchmarks/`,
  { size: 9, gray: 0.2 });
y -= 22;

p2.text(LABEL_X, y, 'About this guide', { size: 12, bold: true });
y -= 16;
paragraph(p2, y,
  'Nonprofit Software Guide is an independent publication that reviews fundraising software and ' +
  'publishes recommended technology stacks by organization size. It carries affiliate links; no ' +
  'vendor pays for placement, and no vendor reviews content before it publishes. Full disclosure ' +
  `at ${SITE}/disclosure/.`);
footer(p2, 2, 2);

// ---------- write -----------------------------------------------------------
mkdirSync(dirname(OUT), { recursive: true });
writeFileSync(OUT, buildPdf([p1, p2], {
  title: survey.title,
  author: 'Nonprofit Software Guide',
  subject: 'Annual fundraising software spend by nonprofit shop size, n=100, July 2026',
}));
console.log(`✓ survey PDF  ${survey.pdf}  (${(Buffer.byteLength(readFileSync(OUT)) / 1024).toFixed(0)}KB, 2 pages)`);
