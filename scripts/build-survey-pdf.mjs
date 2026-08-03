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

// Brand palette, matched to src/styles/global.css so the PDF and the site are
// recognisably the same publication. PDF colour is 0-1 per channel, not 0-255.
const rgb = (hex) => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
].map((n) => n.toFixed(3));
const INK = rgb('#141514');
const TEAL = rgb('#0e4f4a');       // bands, emphasis
const TEAL_MID = rgb('#0a6a62');   // accents
const BAR = rgb('#8fbfba');        // data bars — must read as a scale, not a smudge
const PAPER = ['1', '1', '1'];

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
  /** Brand mark, drawn as strokes. Scale 1 ≈ 26pt wide. */
  mark(x, y, scale = 1, gray = 0.35) {
    const s = scale, o = [];
    o.push(`q ${gray} G ${(1.4 * s).toFixed(2)} w 1 J 1 j`);
    // screen
    o.push(`${(x).toFixed(2)} ${(y).toFixed(2)} ${(22 * s).toFixed(2)} ${(15 * s).toFixed(2)} re S`);
    // base
    o.push(`${(x - 3 * s).toFixed(2)} ${(y - 3.4 * s).toFixed(2)} m ${(x + 25 * s).toFixed(2)} ${(y - 3.4 * s).toFixed(2)} l`);
    o.push(`${(x + 23 * s).toFixed(2)} ${(y).toFixed(2)} l ${(x - 1 * s).toFixed(2)} ${(y).toFixed(2)} l h S`);
    // </>
    const cy = y + 7.5 * s;
    o.push(`${(x + 7 * s).toFixed(2)} ${(cy + 3 * s).toFixed(2)} m ${(x + 4 * s).toFixed(2)} ${cy.toFixed(2)} l ${(x + 7 * s).toFixed(2)} ${(cy - 3 * s).toFixed(2)} l S`);
    o.push(`${(x + 15 * s).toFixed(2)} ${(cy + 3 * s).toFixed(2)} m ${(x + 18 * s).toFixed(2)} ${cy.toFixed(2)} l ${(x + 15 * s).toFixed(2)} ${(cy - 3 * s).toFixed(2)} l S`);
    o.push(`${(x + 12.5 * s).toFixed(2)} ${(cy + 4 * s).toFixed(2)} m ${(x + 9.5 * s).toFixed(2)} ${(cy - 4 * s).toFixed(2)} l S`);
    // gear
    o.push(`${(x + 11 * s).toFixed(2)} ${(y + 15 * s).toFixed(2)} m ${(x + 11 * s).toFixed(2)} ${(y + 18 * s).toFixed(2)} l S`);
    const gx = x + 11 * s, gy = y + 21 * s, r = 3 * s, k = 0.5523 * r;
    o.push(`${(gx - r).toFixed(2)} ${gy.toFixed(2)} m`);
    o.push(`${(gx - r).toFixed(2)} ${(gy + k).toFixed(2)} ${(gx - k).toFixed(2)} ${(gy + r).toFixed(2)} ${gx.toFixed(2)} ${(gy + r).toFixed(2)} c`);
    o.push(`${(gx + k).toFixed(2)} ${(gy + r).toFixed(2)} ${(gx + r).toFixed(2)} ${(gy + k).toFixed(2)} ${(gx + r).toFixed(2)} ${gy.toFixed(2)} c`);
    o.push(`${(gx + r).toFixed(2)} ${(gy - k).toFixed(2)} ${(gx + k).toFixed(2)} ${(gy - r).toFixed(2)} ${gx.toFixed(2)} ${(gy - r).toFixed(2)} c`);
    o.push(`${(gx - k).toFixed(2)} ${(gy - r).toFixed(2)} ${(gx - r).toFixed(2)} ${(gy - k).toFixed(2)} ${(gx - r).toFixed(2)} ${gy.toFixed(2)} c S`);
    o.push('Q');
    this.ops.push(o.join('\n'));
    return this;
  }
  /** Horizontal proportional bar behind a figure. The strongest single signal
   *  that a table is a report rather than a text dump, and it costs one rect. */
  bar(xRight, y, value, max, { width = 66, height = 3, color = BAR } = {}) {
    if (!max || value <= 0) return this;
    const w = Math.max(1.2, (value / max) * width);
    this.rect(xRight - w, y - 4, w, height, 0, color);
    return this;
  }
  text(x, y, str, { size = 10, bold = false, gray = 0, color = null, align = 'left' } = {}) {
    const font = bold ? '/F2' : '/F1';
    let tx = x;
    if (align === 'right') tx = x - textWidth(str, size, bold);
    if (align === 'center') tx = x - textWidth(str, size, bold) / 2;
    const fill = color ? `${color.join(' ')} rg` : `${gray} g`;
    this.ops.push(`BT ${fill} ${font} ${size} Tf 1 0 0 1 ${tx.toFixed(2)} ${y.toFixed(2)} Tm (${esc(str)}) Tj ET`);
    return this;
  }
  line(x1, y1, x2, y2, { width = 0.5, gray = 0.75, color = null } = {}) {
    const stroke = color ? `${color.join(' ')} RG` : `${gray} G`;
    this.ops.push(`${stroke} ${width} w ${x1.toFixed(2)} ${y1.toFixed(2)} m ${x2.toFixed(2)} ${y2.toFixed(2)} l S`);
    return this;
  }
  rect(x, y, w, h, gray = 0.94, color = null) {
    const fill = color ? `${color.join(' ')} rg` : `${gray} g`;
    this.ops.push(`${fill} ${x.toFixed(2)} ${y.toFixed(2)} ${w.toFixed(2)} ${h.toFixed(2)} re f`);
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
      if (bars) p.bar(COL_X[i], y, values[c.slug][s.slug], colMax[s.slug]);
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

// --- page 1: cover ---------------------------------------------------------
// A cover rather than a crammed first page. Two tables on page one was the main
// reason this read as a text dump: no entry point, no headline finding, nothing
// to look at before the data starts.
const p1 = new Page();

const BAND_H = 250;
p1.rect(0, PAGE_H - BAND_H, PAGE_W, BAND_H, 0, TEAL);

p1.mark(MARGIN, PAGE_H - 92, 1.3, 1);   // white mark on the band
p1.text(MARGIN + 46, PAGE_H - 78, 'NONPROFIT', { size: 10, bold: true, color: PAPER });
p1.text(MARGIN + 46, PAGE_H - 90, 'SOFTWARE GUIDE', { size: 10, bold: true, color: PAPER });

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
    writeFileSync(join(SPLIT, `page-${i + 1}.pdf`), buildPdf([pg], { title: survey.title, author: 'Nonprofit Software Guide', subject: '' }));
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
