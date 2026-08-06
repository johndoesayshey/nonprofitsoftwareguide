// Minimal PDF writer, shared by scripts/build-survey-pdf.mjs and
// scripts/build-board-onepager.mjs.
//
// Written by hand against the PDF spec rather than pulling in a library: these
// documents are text, rules and one raster logo, and a PDF library would be
// ~2MB of node_modules to draw a table. Both PDFs run as part of `npm run
// build`, so neither can ever disagree with the site.

import { readFileSync } from 'node:fs';
import { inflateSync, deflateSync } from 'node:zlib';

export const PAGE_W = 612;   // US Letter, 72dpi
export const PAGE_H = 792;

/** PDF colour is 0-1 per channel, not 0-255. */
export const rgb = (hex) => [
  parseInt(hex.slice(1, 3), 16) / 255,
  parseInt(hex.slice(3, 5), 16) / 255,
  parseInt(hex.slice(5, 7), 16) / 255,
].map((n) => n.toFixed(3));

/**
 * PDF text strings escape backslash and both parentheses. Typographic
 * characters are folded to ASCII first: the base-14 Helvetica WinAnsi encoding
 * drops en-dashes and curly quotes silently, so they vanish from the page
 * rather than raising an error.
 */
const ASCII = { '–': '-', '—': '-', '‘': "'", '’': "'",
                '“': '"', '”': '"', '…': '...', ' ': ' ', '·': '-' };
const FOLD = /[–—‘’“”… ·]/g;
export const esc = (s) =>
  String(s)
    .replace(FOLD, (c) => ASCII[c])
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
// Helvetica-Bold is wider than Helvetica. Ignoring that pushed right-aligned
// bold figures a few points off their column and made centred bold headings sit
// left of true centre, which is exactly the sort of thing that reads as "made
// in a hurry" on a document going in front of a board.
const BOLD = {
  ' ': 278, '!': 333, '"': 474, '#': 556, '$': 556, '%': 889, '&': 722, "'": 238,
  '(': 333, ')': 333, '*': 389, '+': 584, ',': 278, '-': 333, '.': 278, '/': 278,
  '0': 556, '1': 556, '2': 556, '3': 556, '4': 556, '5': 556, '6': 556, '7': 556,
  '8': 556, '9': 556, ':': 333, ';': 333, '<': 584, '=': 584, '>': 584, '?': 611,
  '@': 975, 'A': 722, 'B': 722, 'C': 722, 'D': 722, 'E': 667, 'F': 611, 'G': 778,
  'H': 722, 'I': 278, 'J': 556, 'K': 722, 'L': 611, 'M': 833, 'N': 722, 'O': 778,
  'P': 667, 'Q': 778, 'R': 722, 'S': 667, 'T': 611, 'U': 722, 'V': 667, 'W': 944,
  'X': 667, 'Y': 667, 'Z': 611, '[': 333, '\\': 278, ']': 333, '^': 584, '_': 556,
  '`': 333, 'a': 556, 'b': 611, 'c': 556, 'd': 611, 'e': 556, 'f': 333, 'g': 611,
  'h': 611, 'i': 278, 'j': 278, 'k': 556, 'l': 278, 'm': 889, 'n': 611, 'o': 611,
  'p': 611, 'q': 611, 'r': 389, 's': 556, 't': 333, 'u': 611, 'v': 556, 'w': 778,
  'x': 556, 'y': 556, 'z': 500, '{': 389, '|': 280, '}': 389, '~': 584,
};

export function textWidth(str, size, bold = false) {
  const table = bold ? BOLD : W;
  let n = 0;
  for (const ch of String(str).replace(FOLD, (c) => ASCII[c])) n += table[ch] ?? (bold ? 611 : 556);
  return (n / 1000) * size;
}

// ---------- PNG -> PDF image XObject ----------------------------------------

/**
 * Decode an 8-bit truecolour PNG, box-downsample it, and re-deflate as raw RGB.
 *
 * A PDF can in principle carry the PNG's own IDAT bytes untouched, since
 * FlateDecode with /Predictor 15 is exactly PNG's filtering. That would be less
 * code, but it also means shipping the full 512px, 144KB original inside a
 * document that draws the mark at 40pt. Decoding lets the logo land at a size
 * that suits the page (~200dpi at the drawn size) for a few KB, and the decode
 * is the same twenty lines either way.
 *
 * Only colour type 2 (RGB, no alpha), bit depth 8, non-interlaced is handled,
 * which is what public/logo-512.png is. Anything else throws rather than
 * silently drawing garbage.
 */
export function loadPng(path, { maxSize = 160 } = {}) {
  const buf = readFileSync(path);
  if (buf.slice(0, 8).toString('hex') !== '89504e470d0a1a0a') throw new Error(`${path}: not a PNG`);

  const width = buf.readUInt32BE(16), height = buf.readUInt32BE(20);
  const [depth, colorType, , , interlace] = [buf[24], buf[25], buf[26], buf[27], buf[28]];
  if (depth !== 8 || colorType !== 2 || interlace !== 0) {
    throw new Error(`${path}: need 8-bit truecolour non-interlaced PNG, got depth=${depth} colorType=${colorType} interlace=${interlace}`);
  }

  const idat = [];
  for (let off = 8; off < buf.length;) {
    const len = buf.readUInt32BE(off);
    if (buf.slice(off + 4, off + 8).toString('ascii') === 'IDAT') idat.push(buf.slice(off + 8, off + 8 + len));
    off += 12 + len;
  }
  const raw = inflateSync(Buffer.concat(idat));

  // Undo the per-scanline PNG filters.
  const BPP = 3, stride = width * BPP;
  const px = Buffer.alloc(height * stride);
  const paeth = (a, b, c) => {
    const p = a + b - c, pa = Math.abs(p - a), pb = Math.abs(p - b), pc = Math.abs(p - c);
    return pa <= pb && pa <= pc ? a : pb <= pc ? b : c;
  };
  let src = 0;
  for (let y = 0; y < height; y++) {
    const filter = raw[src++];
    const row = raw.slice(src, src + stride);
    src += stride;
    for (let x = 0; x < stride; x++) {
      const a = x >= BPP ? px[y * stride + x - BPP] : 0;
      const b = y > 0 ? px[(y - 1) * stride + x] : 0;
      const c = x >= BPP && y > 0 ? px[(y - 1) * stride + x - BPP] : 0;
      let v = row[x];
      if (filter === 1) v += a;
      else if (filter === 2) v += b;
      else if (filter === 3) v += (a + b) >> 1;
      else if (filter === 4) v += paeth(a, b, c);
      px[y * stride + x] = v & 255;
    }
  }

  // Integer box downsample. An integer factor keeps every output pixel an
  // average of the same number of inputs, so the thin white strokes in the mark
  // stay even instead of shimmering.
  // Largest exact divisor that still leaves the image at or above maxSize.
  // Stepping f upward one at a time and bailing on the first non-divisor stops
  // at 2 for a 512px source, because 3 does not divide it.
  let f = 1;
  for (let cand = 2; cand <= width; cand++) {
    if (width % cand === 0 && height % cand === 0 && width / cand >= maxSize) f = cand;
  }
  const ow = width / f, oh = height / f;
  const out = Buffer.alloc(oh * (ow * 3 + 1));  // +1 filter byte per row
  for (let y = 0; y < oh; y++) {
    const rowStart = y * (ow * 3 + 1);
    out[rowStart] = 0;  // filter: None
    for (let x = 0; x < ow; x++) {
      let r = 0, g = 0, b = 0;
      for (let dy = 0; dy < f; dy++) {
        for (let dx = 0; dx < f; dx++) {
          const i = (y * f + dy) * stride + (x * f + dx) * 3;
          r += px[i]; g += px[i + 1]; b += px[i + 2];
        }
      }
      const n = f * f, o = rowStart + 1 + x * 3;
      out[o] = Math.round(r / n); out[o + 1] = Math.round(g / n); out[o + 2] = Math.round(b / n);
    }
  }

  return {
    width: ow,
    height: oh,
    // Ship it back through FlateDecode with the PNG "None" predictor so the
    // filter byte per row is consumed the way the encoder wrote it.
    stream: deflateSync(out, { level: 9 }),
    predictor: 10,
    /** Top-left pixel, as a PDF colour triple. Used to match a band behind the
     *  mark to the logo's own background so the square edge disappears. */
    corner: [px[0] / 255, px[1] / 255, px[2] / 255].map((n) => n.toFixed(3)),
  };
}

// ---------- page ------------------------------------------------------------

export class Page {
  constructor() { this.ops = []; }

  text(x, y, str, { size = 10, bold = false, gray = 0, color = null, align = 'left', tracking = 0 } = {}) {
    const font = bold ? '/F2' : '/F1';
    const w = textWidth(str, size, bold) + tracking * Math.max(0, String(str).length - 1);
    let tx = x;
    if (align === 'right') tx = x - w;
    if (align === 'center') tx = x - w / 2;
    const fill = color ? `${color.join(' ')} rg` : `${gray} g`;
    // Tc is text *state*, not a per-object property: it survives ET and applies
    // to every later BT until something resets it. Emitting it only when
    // non-zero let one tracked kicker space out the rest of the document.
    this.ops.push(`BT ${fill} ${font} ${size} Tf ${tracking} Tc 1 0 0 1 ${tx.toFixed(2)} ${y.toFixed(2)} Tm (${esc(str)}) Tj ET`);
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

  /** Horizontal proportional bar behind a figure. The strongest single signal
   *  that a table is a report rather than a text dump, and it costs one rect. */
  bar(xRight, y, value, max, { width = 66, height = 2.5, drop = 6, color = null } = {}) {
    if (!max || value <= 0) return this;
    const w = Math.max(1.2, (value / max) * width);
    // `drop` has to clear the descenders of the figure above it, or the bar
    // reads as an underline rather than as a scale.
    this.rect(xRight - w, y - drop, w, height, 0, color);
    return this;
  }

  /** Place a registered image. `name` must match one passed to buildPdf. */
  image(name, x, y, w, h) {
    this.ops.push(`q ${w.toFixed(2)} 0 0 ${h.toFixed(2)} ${x.toFixed(2)} ${y.toFixed(2)} cm /${name} Do Q`);
    return this;
  }

  get stream() { return this.ops.join('\n'); }
}

// ---------- document --------------------------------------------------------

/**
 * @param pages   array of Page
 * @param meta    { title, author, subject }
 * @param images  { name: loadPng(...) } shared across every page
 */
export function buildPdf(pages, meta, images = {}) {
  const objs = [];
  const add = (body) => { objs.push(body); return objs.length; }; // 1-indexed

  const catalogId = 1, pagesId = 2, f1Id = 3, f2Id = 4;
  objs.length = 4;
  objs[2] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica /Encoding /WinAnsiEncoding >>';
  objs[3] = '<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold /Encoding /WinAnsiEncoding >>';

  const imgIds = {};
  for (const [name, img] of Object.entries(images)) {
    imgIds[name] = add(
      `<< /Type /XObject /Subtype /Image /Width ${img.width} /Height ${img.height} ` +
      `/ColorSpace /DeviceRGB /BitsPerComponent 8 /Filter /FlateDecode ` +
      `/DecodeParms << /Predictor ${img.predictor} /Colors 3 /BitsPerComponent 8 /Columns ${img.width} >> ` +
      `/Length ${img.stream.length} >>\nstream\n${img.stream.toString('latin1')}\nendstream`
    );
  }
  const xobj = Object.keys(imgIds).length
    ? ` /XObject << ${Object.entries(imgIds).map(([n, id]) => `/${n} ${id} 0 R`).join(' ')} >>`
    : '';

  const kidsIds = [];
  pages.forEach((p) => {
    const stream = p.stream;
    const cid = add(`<< /Length ${Buffer.byteLength(stream, 'latin1')} >>\nstream\n${stream}\nendstream`);
    kidsIds.push(add(
      `<< /Type /Page /Parent ${pagesId} 0 R /MediaBox [0 0 ${PAGE_W} ${PAGE_H}] ` +
      `/Resources << /Font << /F1 ${f1Id} 0 R /F2 ${f2Id} 0 R >>${xobj} >> /Contents ${cid} 0 R >>`
    ));
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
  for (let i = 1; i <= objs.length; i++) out += String(offsets[i]).padStart(10, '0') + ' 00000 n \n';
  out += `trailer\n<< /Size ${objs.length + 1} /Root ${catalogId} 0 R /Info ${infoId} 0 R >>\nstartxref\n${xrefPos}\n%%EOF\n`;
  return Buffer.from(out, 'latin1');
}

/** Naive greedy wrap against the Helvetica metrics above. */
export function paragraph(p, x, y, str, { size = 9.5, gray = 0.15, leading = 13, width = 500, bold = false, color = null } = {}) {
  let line = '';
  for (const word of str.split(' ')) {
    const next = line ? line + ' ' + word : word;
    if (textWidth(next, size, bold) > width && line) {
      p.text(x, y, line, { size, gray, bold, color });
      y -= leading;
      line = word;
    } else line = next;
  }
  if (line) { p.text(x, y, line, { size, gray, bold, color }); y -= leading; }
  return y;
}
