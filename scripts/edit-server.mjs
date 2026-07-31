// Visual editor: `npm run edit`
//
// Starts the Astro dev server, then puts a proxy in front of it on port 4400 that
// injects a click-to-edit overlay. Click any paragraph or heading, type over it,
// press Save, and the change is written back into the real source file
// (.astro or .md) by matching the original text.
//
// This never ships to production: it's a separate local process and touches
// nothing in the built site.
import { createServer } from 'node:http';
import { spawn } from 'node:child_process';
import { readFileSync, writeFileSync, readdirSync, statSync } from 'node:fs';
import { join, extname } from 'node:path';
import { ROOT, loadAffiliates, green, yellow, red, bold } from './_lib.mjs';

const ASTRO_PORT = 4321;
const EDIT_PORT = 4400;
const SRC = join(ROOT, 'src');

// ---------- source-file search & replace -------------------------------------

const EDITABLE_EXT = new Set(['.astro', '.md', '.mdx', '.json']);

function allSourceFiles(dir = SRC, out = []) {
  for (const name of readdirSync(dir)) {
    const p = join(dir, name);
    if (statSync(p).isDirectory()) allSourceFiles(p, out);
    else if (EDITABLE_EXT.has(extname(name))) out.push(p);
  }
  return out;
}

// Collapse runs of whitespace but remember where each kept character came from,
// so a match in the normalized string maps back to exact offsets in the source.
function normalizeWithMap(s) {
  let norm = '';
  const map = [];
  let prevSpace = false;
  for (let i = 0; i < s.length; i++) {
    const ch = s[i];
    if (/\s/.test(ch)) {
      if (!prevSpace && norm.length) { norm += ' '; map.push(i); prevSpace = true; }
    } else {
      norm += ch; map.push(i); prevSpace = false;
    }
  }
  return { norm, map };
}

const norm = (s) => s.replace(/\s+/g, ' ').trim();

// Try a few encodings, since the DOM gives us decoded text but source may hold entities.
function candidates(text) {
  const out = [text];
  out.push(text.replace(/&/g, '&amp;'));
  out.push(text.replace(/'/g, '&#39;'));
  return [...new Set(out)];
}

function writeSpan(file, raw, start, end, updated) {
  writeFileSync(file, raw.slice(0, start) + updated.trim() + raw.slice(end));
  return { ok: true, file: file.replace(ROOT, '') };
}

// Preferred path: Astro's dev server stamps every element with the source file
// and line it came from, so we can scope the search to a small window instead of
// hunting the whole codebase. That makes even one-character edits ("6" → "7")
// unambiguous.
function applyByLocation(original, updated, file, line) {
  if (!file || !line) return null;
  if (!file.startsWith(SRC)) return null; // never write outside src/
  let raw;
  try { raw = readFileSync(file, 'utf8'); } catch { return null; }

  const lines = raw.split('\n');
  const startLine = Math.max(0, line - 1);
  const offset = lines.slice(0, startLine).reduce((n, l) => n + l.length + 1, 0);
  const window = raw.slice(offset, offset + 6000);
  const { norm: nwin, map } = normalizeWithMap(window);

  for (const t of candidates(norm(original))) {
    const idx = nwin.indexOf(t);
    if (idx !== -1) {
      return writeSpan(file, raw, offset + map[idx], offset + map[idx + t.length - 1] + 1, updated);
    }
  }
  return null;
}

// Fallback for anything without a source stamp: unique text match across src/.
function applyByText(original, updated) {
  const targets = candidates(norm(original));
  const hits = [];

  for (const file of allSourceFiles()) {
    const raw = readFileSync(file, 'utf8');
    const { norm: nsrc, map } = normalizeWithMap(raw);
    for (const t of targets) {
      let idx = nsrc.indexOf(t);
      while (idx !== -1) {
        hits.push({ file, raw, start: map[idx], end: map[idx + t.length - 1] + 1 });
        idx = nsrc.indexOf(t, idx + 1);
      }
      if (hits.length) break;
    }
    if (hits.length > 1) break; // ambiguous, stop early
  }

  if (hits.length === 0) return { ok: false, reason: 'not found in source' };
  if (hits.length > 1) return { ok: false, reason: `appears ${hits.length} times; edit it directly` };

  const { file, raw, start, end } = hits[0];
  return writeSpan(file, raw, start, end, updated);
}

function applyEdit(original, updated, file, line) {
  return applyByLocation(original, updated, file, line) ?? applyByText(original, updated);
}

// ---------- feedback notes ----------------------------------------------------
// Click an element in Notes mode, type an instruction, and it lands here for
// Claude to read. Kept out of git (the repo is public and these are your notes).
const NOTES_FILE = join(ROOT, 'feedback.json');

function loadNotes() {
  try { return JSON.parse(readFileSync(NOTES_FILE, 'utf8')); } catch { return []; }
}
function saveNotes(notes) {
  writeFileSync(NOTES_FILE, JSON.stringify(notes, null, 2) + '\n');
}

// ---------- affiliate deal data for the overlay -------------------------------

// Extra names a product goes by in prose, so unlinked mentions are still caught.
const ALIASES = {
  kindsight: ['iWave'],
  neoncrm: ['Neon CRM', 'Neon One', 'Neon'],
  littlegreenlight: ['LGL'],
  candid: ['Candid', 'Foundation Directory'],
  grantsgov: ['Grants.gov'],
  monday: ['monday.com', 'Monday.com'],
  salesforcenpsp: ['Salesforce', 'NPSP'],
  '4agoodcause': ['4aGoodCause'],
};

function buildDeals() {
  const affiliates = loadAffiliates();
  const out = {};
  for (const [slug, a] of Object.entries(affiliates)) {
    const names = [a.name, ...(ALIASES[slug] ?? [])]
      .filter(Boolean)
      .sort((x, y) => y.length - x.length)
      .map((n) => n.replace(/[.*+?^${}()|[\]\\]/g, '\\$&'));
    out[slug] = {
      name: a.name,
      status: a.status,
      terms: a.terms,
      readerOffer: a.readerOffer,
      signupUrl: a.signupUrl,
      payout: a.payout,
      potential: a.potential || 'none',
      badge: a.badge || '—',
      potentialNote: a.potentialNote,
      evidence: a.evidence || null,
      rx: `(?:${names.join('|')})`, // matched case-insensitively, on word boundaries
    };
  }
  return out;
}

// ---------- injected client ---------------------------------------------------

const CLIENT = `
<style id="nsg-edit-style">
  /* currentColor keeps the outline visible on both the paper and dark-teal bands */
  .nsg-editable { outline: 1px dashed currentColor; outline-offset: 3px; opacity: .999;
    cursor: text; border-radius: 2px; }
  .nsg-editable:hover { outline: 2px dashed currentColor; background: rgba(127,127,127,.14); }
  .nsg-editable:focus { outline: 2px solid #0e4f4a; background: #fff; color: #141514 !important;
    box-shadow: 0 0 0 4px rgba(14,79,74,.18); }
  .nsg-dirty { background: #fff8dc !important; outline-color: #b7791f !important; }
  #nsg-bar { position: fixed; z-index: 999999; bottom: 18px; left: 50%; transform: translateX(-50%);
    background: #141514; color: #fff; border-radius: 999px; padding: 10px 14px; display: flex; gap: 10px;
    align-items: center; font: 600 13px/1 -apple-system, system-ui, sans-serif; box-shadow: 0 8px 28px rgba(0,0,0,.35); }
  #nsg-bar button { font: 700 12px/1 inherit; border: 0; border-radius: 999px; padding: 8px 14px; cursor: pointer; }
  #nsg-save { background: #17a06a; color: #fff; }
  #nsg-save[disabled] { background: #3a3a3a; color: #888; cursor: default; }
  #nsg-toggle { background: #2b2b2b; color: #fff; }
  #nsg-toggle.on { background: #0e4f4a; }
  #nsg-msg { opacity: .85; font-weight: 500; max-width: 380px; }
  #nsg-bar a { color: #7fd7c4; }
  #nsg-deals { background: #2b2b2b; color: #fff; }
  #nsg-deals.on { background: #7a5c12; }

  #nsg-notes { background: #2b2b2b; color: #fff; }
  #nsg-notes.on { background: #6d3fbf; }

  /* ---- notes mode ---- */
  .nsg-note-hover { outline: 2px dashed #8b5cf6 !important; outline-offset: 2px !important;
    background: rgba(139,92,246,.08) !important; cursor: crosshair !important; }
  .nsg-note-picked { outline: 3px solid #6d3fbf !important; outline-offset: 2px !important;
    background: rgba(109,63,191,.12) !important; }
  .nsg-noted { outline: 2px solid #6d3fbf !important; outline-offset: 2px !important; }
  .nsg-noted::after { content: '💬' attr(data-nsg-note-n); background: #6d3fbf; color: #fff;
    font: 800 10px/1 -apple-system, system-ui, sans-serif; padding: 3px 5px; border-radius: 999px;
    margin-left: .3em; vertical-align: super; white-space: nowrap; }
  #nsg-composer { position: fixed; z-index: 1000001; width: 22rem; display: none;
    background: #17131f; color: #fff; border: 1px solid #6d3fbf; border-radius: 8px; padding: .8rem;
    font: 500 13px/1.4 -apple-system, system-ui, sans-serif; box-shadow: 0 16px 40px rgba(0,0,0,.5); }
  #nsg-composer .target { font-size: 11px; opacity: .75; margin-bottom: .5rem; word-break: break-word; }
  #nsg-composer .target b { color: #c4b5fd; }
  #nsg-composer textarea { width: 100%; box-sizing: border-box; min-height: 4.5rem; resize: vertical;
    background: #0e0b14; color: #fff; border: 1px solid #3c3350; border-radius: 5px; padding: .5rem;
    font: 500 13px/1.4 inherit; }
  #nsg-composer .chips { display: flex; flex-wrap: wrap; gap: .3rem; margin: .5rem 0; }
  #nsg-composer .chips button { background: #2a2338; color: #d9cffb; border: 0; border-radius: 999px;
    font: 700 11px/1 inherit; padding: .35rem .55rem; cursor: pointer; }
  #nsg-composer .chips button:hover { background: #3c3350; }
  #nsg-composer .row { display: flex; gap: .4rem; justify-content: flex-end; margin-top: .5rem; }
  #nsg-composer .row button { border: 0; border-radius: 999px; font: 700 12px/1 inherit;
    padding: .45rem .8rem; cursor: pointer; }
  #nsg-c-save { background: #6d3fbf; color: #fff; }
  #nsg-c-cancel, #nsg-c-wider { background: #2a2338; color: #d9cffb; }
  #nsg-c-resolve { background: #17a06a; color: #fff; }
  #nsg-composer .existing { background: #0e0b14; border-radius: 5px; padding: .5rem; margin-bottom: .5rem;
    border-left: 3px solid #6d3fbf; }

  /* ---- affiliate deal layer ---- */
  .nsg-deal { text-decoration: none !important;
    box-shadow: inset 0 -0.55em 0 var(--nsg-tint), 0 1px 0 var(--nsg-ink); border-radius: 2px; }
  .nsg-deal::after { content: attr(data-nsg-tag); font-size: .62em; font-weight: 800;
    letter-spacing: .04em; vertical-align: super; margin-left: .18em; color: var(--nsg-ink); }
  .nsg-deal-high   { --nsg-tint: rgba(23,160,106,.30); --nsg-ink: #0b6d45; }
  .nsg-deal-medium { --nsg-tint: rgba(48,116,196,.26); --nsg-ink: #1d5fa8; }
  .nsg-deal-low    { --nsg-tint: rgba(183,121,31,.26); --nsg-ink: #9a6510; }
  .nsg-deal-unknown{ --nsg-tint: rgba(120,120,120,.22); --nsg-ink: #555; }
  .nsg-deal-none   { --nsg-tint: rgba(190,60,60,.20);  --nsg-ink: #a33; }
  .nsg-deal-none::after { text-decoration: line-through; }
  /* A mention that could be an earning link but isn't. No DOM children added. */
  .nsg-missed { border-left: 3px solid #b7791f !important; padding-left: .5rem !important;
    background: rgba(183,121,31,.07); }
  #nsg-tip { position: fixed; z-index: 1000000; max-width: 22rem; display: none;
    background: #141514; color: #fff; border-radius: 6px; padding: .7rem .85rem;
    font: 500 12px/1.45 -apple-system, system-ui, sans-serif; box-shadow: 0 10px 30px rgba(0,0,0,.45); }
  #nsg-tip h4 { margin: 0 0 .25rem; font-size: 13px; font-weight: 800; }
  #nsg-tip .pill { display: inline-block; font-size: 10px; font-weight: 800; letter-spacing: .08em;
    text-transform: uppercase; padding: .1rem .4rem; border-radius: 999px; margin-bottom: .35rem; }
  #nsg-tip .pill.high { background: #17a06a; }
  #nsg-tip .pill.medium { background: #3074c4; }
  #nsg-tip .pill.low { background: #b7791f; }
  #nsg-tip .pill.unknown { background: #6b6b6b; }
  #nsg-tip .pill.none { background: #a33; }
  #nsg-tip .payout { font-size: 15px; font-weight: 800; margin: .1rem 0 .3rem; }
  #nsg-tip .status { opacity: .7; margin-top: .45rem; font-size: 11px;
    border-top: 1px solid rgba(255,255,255,.15); padding-top: .35rem; }
  #nsg-tip .terms { opacity: .9; }
  #nsg-tip .offer { color: #8ee0bd; margin-top: .3rem; }
  #nsg-tip .hint { opacity: .65; margin-top: .4rem; font-size: 11px; }
</style>
<div id="nsg-tip"></div>
<div id="nsg-composer"></div>
<div id="nsg-bar">
  <button id="nsg-toggle" class="on">✏️ Edit: ON</button>
  <button id="nsg-deals">💰 Deals</button>
  <button id="nsg-notes">💬 Notes</button>
  <span id="nsg-msg">Click any text to edit it.</span>
  <button id="nsg-save" disabled>Save 0</button>
</div>
<script>
(function () {
  // Astro's dev toolbar strips data-astro-source-* shortly after load. This inline
  // script runs before it does, so snapshot the source map onto our own attributes.
  document.querySelectorAll('[data-astro-source-file]').forEach(function (el) {
    el.setAttribute('data-nsg-file', el.getAttribute('data-astro-source-file'));
    el.setAttribute('data-nsg-line', (el.getAttribute('data-astro-source-loc') || '').split(':')[0]);
  });

  var edits = new Map(); // element -> original text
  var on = true;

  var SEL = 'p,h1,h2,h3,h4,li,td,th,figcaption,blockquote,span,small,dd,dt,div,summary,strong,em,label';
  function eligible(el) {
    if (el.closest('#nsg-bar')) return false;
    if (el.children.length > 0) return false;          // text-only nodes stay safe to write back
    if (!el.getAttribute('data-nsg-file')) return false;
    var t = (el.textContent || '').trim();
    return t.length >= 1 && t.length < 3000;
  }

  function mark() {
    document.querySelectorAll(SEL).forEach(function (el) {
      if (!eligible(el)) return;
      el.classList.add('nsg-editable');
      el.setAttribute('contenteditable', on ? 'true' : 'false');
      el.spellcheck = true;
      if (el.dataset.nsgBound) return;
      el.dataset.nsgBound = '1';
      el.addEventListener('focus', function () {
        if (!el.dataset.nsgOriginal) el.dataset.nsgOriginal = el.textContent;
      });
      el.addEventListener('input', function () {
        var orig = el.dataset.nsgOriginal || '';
        if (el.textContent.trim() !== orig.trim()) { edits.set(el, orig); el.classList.add('nsg-dirty'); }
        else { edits.delete(el); el.classList.remove('nsg-dirty'); }
        refresh();
      });
      el.addEventListener('keydown', function (e) {
        if (e.key === 'Enter' && !e.shiftKey) { e.preventDefault(); el.blur(); }
        if (e.key === 'Escape') { el.textContent = el.dataset.nsgOriginal; edits.delete(el);
          el.classList.remove('nsg-dirty'); el.blur(); refresh(); }
      });
    });
  }

  function refresh() {
    var n = edits.size;
    var save = document.getElementById('nsg-save');
    save.textContent = 'Save ' + n;
    save.disabled = n === 0;
  }

  function msg(html) { document.getElementById('nsg-msg').innerHTML = html; }

  document.getElementById('nsg-toggle').addEventListener('click', function () {
    on = !on;
    this.textContent = on ? '✏️ Edit: ON' : '👁 Edit: OFF';
    this.classList.toggle('on', on);
    document.querySelectorAll('.nsg-editable').forEach(function (el) {
      el.setAttribute('contenteditable', on ? 'true' : 'false');
      el.style.outline = on ? '' : 'none';
    });
    msg(on ? 'Click any text to edit it.' : 'Editing paused. Browse normally.');
  });

  document.getElementById('nsg-save').addEventListener('click', function () {
    var payload = [];
    edits.forEach(function (orig, el) {
      payload.push({
        original: orig,
        updated: el.textContent,
        file: el.getAttribute('data-nsg-file') || '',
        line: parseInt(el.getAttribute('data-nsg-line'), 10) || 0
      });
    });
    msg('Saving…');
    fetch('/__nsg/save', {
      method: 'POST', headers: { 'content-type': 'application/json' },
      body: JSON.stringify({ edits: payload })
    }).then(function (r) { return r.json(); }).then(function (res) {
      var ok = res.results.filter(function (r) { return r.ok; }).length;
      var bad = res.results.filter(function (r) { return !r.ok; });
      edits.forEach(function (_, el) { el.classList.remove('nsg-dirty'); delete el.dataset.nsgOriginal; });
      edits.clear(); refresh();
      if (bad.length === 0) msg('✅ Saved ' + ok + ' change' + (ok === 1 ? '' : 's') + '. Page will reload.');
      else msg('Saved ' + ok + '. ' + bad.length + ' could not be matched: "' +
               bad[0].original.slice(0, 40) + '…" (' + bad[0].reason + ')');
    }).catch(function (e) { msg('Save failed: ' + e.message); });
  });

  // ---------- affiliate deal layer ----------
  var DEALS = __NSG_DEALS__;
  var dealsOn = false;
  var tip = document.getElementById('nsg-tip');

  function esc(s) { return String(s == null ? '' : s).replace(/[<>&]/g, function (c) {
    return { '<': '&lt;', '>': '&gt;', '&': '&amp;' }[c]; }); }

  function showTip(html, el) {
    tip.innerHTML = html;
    tip.style.display = 'block';
    var r = el.getBoundingClientRect();
    var top = r.bottom + 8;
    if (top + tip.offsetHeight > window.innerHeight - 10) top = r.top - tip.offsetHeight - 8;
    tip.style.top = Math.max(8, top) + 'px';
    tip.style.left = Math.min(Math.max(8, r.left), window.innerWidth - tip.offsetWidth - 8) + 'px';
  }
  function hideTip() { tip.style.display = 'none'; }

  var POT_LABEL = { high: 'High earning potential', medium: 'Medium potential',
                    low: 'Low potential', unknown: 'Rate not published',
                    none: 'Cannot earn' };

  function dealCard(d, extra) {
    var status = d.status === 'active' ? 'Approved — links are live'
               : d.potential === 'none' ? 'No program to apply to'
               : 'Not applied yet — earns nothing until you do';
    return '<h4>' + esc(d.name) + '</h4>' +
      '<span class="pill ' + d.potential + '">' + POT_LABEL[d.potential] + '</span>' +
      '<div class="payout">' + esc(d.payout || 'No program') + '</div>' +
      '<div class="terms">' + esc(d.potentialNote || '') + '</div>' +
      (d.evidence && d.evidence.quote
        ? '<div class="status">Verified ' + esc(d.evidence.checked) + ': “' +
          esc(String(d.evidence.quote).slice(0, 150)) + '”</div>' : '') +
      (d.readerOffer ? '<div class="offer">Reader offer: ' + esc(d.readerOffer) + '</div>' : '') +
      '<div class="status">Application: ' + esc(status) + '</div>' +
      (extra || '');
  }

  function applyDeals() {
    var counts = { high: 0, medium: 0, low: 0, unknown: 0, none: 0, missed: 0 };

    // 1. Existing /go/ links: tint by status, show the deal on hover.
    document.querySelectorAll('a[href^="/go/"]').forEach(function (a) {
      var slug = a.getAttribute('href').split('/')[2];
      var d = DEALS[slug];
      if (!d) return;
      counts[d.potential] = (counts[d.potential] || 0) + 1;
      if (!dealsOn) {
        a.classList.remove('nsg-deal', 'nsg-deal-high', 'nsg-deal-medium', 'nsg-deal-low', 'nsg-deal-none');
        a.removeAttribute('data-nsg-tag');
        return;
      }
      a.classList.add('nsg-deal', 'nsg-deal-' + d.potential);
      a.setAttribute('data-nsg-tag', d.badge);
      if (a.dataset.nsgDealBound) return;
      a.dataset.nsgDealBound = '1';
      a.addEventListener('mouseenter', function () {
        if (dealsOn) showTip(dealCard(DEALS[slug], ''), a);
      });
      a.addEventListener('mouseleave', hideTip);
    });

    // 2. Product mentions that could be earning links but are not.
    var BLOCKS = 'p,li,td,h2,h3,h4,dd,figcaption,blockquote';
    document.querySelectorAll(BLOCKS).forEach(function (el) {
      if (el.closest('#nsg-bar') || el.closest('#nsg-tip')) return;
      el.classList.remove('nsg-missed');
      el.removeAttribute('data-nsg-missed');
      if (!dealsOn) return;
      var text = el.textContent || '';
      if (!text.trim()) return;
      var missed = [];
      Object.keys(DEALS).forEach(function (slug) {
        var d = DEALS[slug];
        if (d.potential === 'none') return;            // cannot earn, nothing to flag
        if (!new RegExp('\\\\b' + d.rx + '\\\\b', 'i').test(text)) return;
        if (el.querySelector('a[href="/go/' + slug + '"]')) return;   // already linked here
        missed.push(slug);
      });
      if (!missed.length) return;
      counts.missed += missed.length;
      el.classList.add('nsg-missed');
      el.setAttribute('data-nsg-missed', missed.join(','));
      if (el.dataset.nsgMissBound) return;
      el.dataset.nsgMissBound = '1';
      el.addEventListener('mouseenter', function () {
        if (!dealsOn || !el.getAttribute('data-nsg-missed')) return;
        var list = el.getAttribute('data-nsg-missed').split(',');
        var html = '<h4>Unlinked money</h4><div class="terms">Named here with no /go/ link:</div>';
        list.forEach(function (s) {
          html += '<div style="margin-top:.45rem">' + dealCard(DEALS[s]) + '</div>';
        });
        html += '<div class="hint">Ask Claude to link these, or leave them if the mention is incidental.</div>';
        showTip(html, el);
      });
      el.addEventListener('mouseleave', hideTip);
    });

    return counts;
  }

  document.getElementById('nsg-deals').addEventListener('click', function () {
    dealsOn = !dealsOn;
    this.classList.toggle('on', dealsOn);
    hideTip();
    var c = applyDeals();
    if (dealsOn) {
      msg('<b>' + c.high + '</b> high · <b>' + c.medium + '</b> medium · <b>' + c.low +
          '</b> low · <b>' + c.none + '</b> can\\'t earn · <b>' + c.missed +
          '</b> unlinked. Hover for the payout.');
    } else {
      msg('Click any text to edit it.');
    }
  });

  // ---------- feedback notes ----------
  var NOTES = __NSG_NOTES__;
  var notesOn = false, picked = null, hovered = null;
  var composer = document.getElementById('nsg-composer');
  var PAGE = location.pathname;

  function describe(el) {
    var t = el.tagName.toLowerCase();
    var cls = (el.className || '').toString().split(/\\s+/)
      .filter(function (c) { return c && c.indexOf('nsg-') !== 0 && c.indexOf('astro-') !== 0; })
      .slice(0, 2).join('.');
    return t + (cls ? '.' + cls : '');
  }
  function srcOf(el) {
    var n = el;
    while (n && n.getAttribute && !n.getAttribute('data-nsg-file')) n = n.parentElement;
    if (!n || !n.getAttribute) return { file: '', line: 0 };
    return {
      file: n.getAttribute('data-nsg-file') || '',
      line: parseInt(n.getAttribute('data-nsg-line'), 10) || 0
    };
  }
  function snippet(el) { return (el.textContent || '').trim().replace(/\\s+/g, ' ').slice(0, 90); }

  function noteFor(el) {
    var src = srcOf(el), snip = snippet(el);
    for (var i = 0; i < NOTES.length; i++) {
      var n = NOTES[i];
      if (n.status !== 'open' || n.page !== PAGE) continue;
      if (n.file && src.file && n.file === src.file && n.line === src.line && n.element === describe(el)) return n;
      if (n.snippet && snip && n.snippet === snip) return n;
    }
    return null;
  }

  function paintPins() {
    document.querySelectorAll('.nsg-noted').forEach(function (el) {
      el.classList.remove('nsg-noted'); el.removeAttribute('data-nsg-note-n');
    });
    if (!notesOn) return;
    var open = NOTES.filter(function (n) { return n.status === 'open' && n.page === PAGE; });
    document.querySelectorAll('body *').forEach(function (el) {
      if (el.closest('#nsg-bar') || el.closest('#nsg-composer') || el.closest('#nsg-tip')) return;
      var n = noteFor(el);
      if (!n) return;
      el.classList.add('nsg-noted');
      el.setAttribute('data-nsg-note-n', open.indexOf(n) + 1);
    });
  }

  function closeComposer() {
    composer.style.display = 'none';
    if (picked) picked.classList.remove('nsg-note-picked');
    picked = null;
  }

  function openComposer(el) {
    if (picked) picked.classList.remove('nsg-note-picked');
    picked = el;
    el.classList.add('nsg-note-picked');
    var existing = noteFor(el);
    var src = srcOf(el);
    var chips = ['Move this up', 'Move this down', 'Make this bigger', 'Make this smaller',
                 'Remove this', 'Reword this', 'Change the colour'];
    composer.innerHTML =
      '<div class="target">Selected: <b>' + esc(describe(el)) + '</b>' +
        (src.file ? '<br>' + esc(src.file.split('/src/')[1] || src.file) + ':' + src.line : '') +
      '</div>' +
      (existing ? '<div class="existing">Existing note: ' + esc(existing.note) + '</div>' : '') +
      '<textarea id="nsg-c-text" placeholder="What should change here?"></textarea>' +
      '<div class="chips">' + chips.map(function (c) {
        return '<button type="button" data-chip="' + esc(c) + '">' + esc(c) + '</button>'; }).join('') + '</div>' +
      '<div class="row">' +
        '<button id="nsg-c-wider" type="button">↑ Wider</button>' +
        (existing ? '<button id="nsg-c-resolve" type="button">Done</button>' : '') +
        '<button id="nsg-c-cancel" type="button">Cancel</button>' +
        '<button id="nsg-c-save" type="button">Save note</button>' +
      '</div>';
    composer.style.display = 'block';
    var r = el.getBoundingClientRect();
    var top = Math.min(r.bottom + 8, window.innerHeight - composer.offsetHeight - 12);
    composer.style.top = Math.max(8, top) + 'px';
    composer.style.left = Math.min(Math.max(8, r.left), window.innerWidth - composer.offsetWidth - 8) + 'px';

    var ta = document.getElementById('nsg-c-text');
    ta.focus();
    composer.querySelectorAll('[data-chip]').forEach(function (b) {
      b.addEventListener('click', function () {
        ta.value = (ta.value ? ta.value.replace(/\\s*$/, '') + '. ' : '') + b.dataset.chip;
        ta.focus();
      });
    });
    document.getElementById('nsg-c-cancel').addEventListener('click', closeComposer);
    document.getElementById('nsg-c-wider').addEventListener('click', function () {
      if (picked && picked.parentElement && picked.parentElement !== document.body) openComposer(picked.parentElement);
    });
    if (existing) {
      document.getElementById('nsg-c-resolve').addEventListener('click', function () {
        fetch('/__nsg/note-resolve', { method: 'POST', headers: { 'content-type': 'application/json' },
          body: JSON.stringify({ id: existing.id }) })
          .then(function (r) { return r.json(); })
          .then(function (res) { NOTES = res.notes; closeComposer(); paintPins(); refreshNotesMsg(); });
      });
    }
    document.getElementById('nsg-c-save').addEventListener('click', function () {
      var text = ta.value.trim();
      if (!text) { ta.focus(); return; }
      fetch('/__nsg/note', { method: 'POST', headers: { 'content-type': 'application/json' },
        body: JSON.stringify({ page: PAGE, file: src.file, line: src.line,
                               element: describe(el), snippet: snippet(el), note: text }) })
        .then(function (r) { return r.json(); })
        .then(function (res) { NOTES = res.notes; closeComposer(); paintPins(); refreshNotesMsg(); });
    });
  }

  function refreshNotesMsg() {
    var openAll = NOTES.filter(function (n) { return n.status === 'open'; });
    var here = openAll.filter(function (n) { return n.page === PAGE; });
    msg(notesOn
      ? '<b>' + here.length + '</b> note' + (here.length === 1 ? '' : 's') + ' on this page · <b>' +
        openAll.length + '</b> total. Click anything to leave one.'
      : 'Click any text to edit it.');
  }

  document.addEventListener('mouseover', function (e) {
    if (!notesOn || picked) return;
    var el = e.target;
    if (!el || el.closest('#nsg-bar') || el.closest('#nsg-composer')) return;
    if (hovered) hovered.classList.remove('nsg-note-hover');
    hovered = el; el.classList.add('nsg-note-hover');
  }, true);

  document.addEventListener('click', function (e) {
    if (!notesOn) return;
    if (e.target.closest('#nsg-bar') || e.target.closest('#nsg-composer')) return;
    e.preventDefault(); e.stopPropagation();
    if (hovered) hovered.classList.remove('nsg-note-hover');
    openComposer(e.target);
  }, true);

  document.getElementById('nsg-notes').addEventListener('click', function () {
    notesOn = !notesOn;
    this.classList.toggle('on', notesOn);
    if (!notesOn) {
      closeComposer();
      if (hovered) hovered.classList.remove('nsg-note-hover');
      document.querySelectorAll('.nsg-editable').forEach(function (el) {
        el.setAttribute('contenteditable', on ? 'true' : 'false'); });
    } else {
      // editing and note-picking would fight over clicks
      document.querySelectorAll('.nsg-editable').forEach(function (el) {
        el.setAttribute('contenteditable', 'false'); });
    }
    paintPins();
    refreshNotesMsg();
  });

  paintPins();

  mark();
  new MutationObserver(function () { mark(); if (dealsOn) applyDeals(); })
    .observe(document.body, { childList: true, subtree: true });
})();
</script>
`;

// ---------- servers -----------------------------------------------------------

function waitForAstro() {
  return new Promise((resolve, reject) => {
    let tries = 0;
    const tick = async () => {
      try {
        const r = await fetch(`http://localhost:${ASTRO_PORT}/`);
        if (r.ok) return resolve();
      } catch {}
      if (++tries > 60) return reject(new Error('Astro dev server did not start'));
      setTimeout(tick, 500);
    };
    tick();
  });
}

console.log(bold('\n  Starting the visual editor…\n'));

const astro = spawn('npm', ['run', 'dev'], { cwd: ROOT, stdio: 'ignore' });
process.on('exit', () => astro.kill());
process.on('SIGINT', () => { astro.kill(); process.exit(0); });

await waitForAstro();

createServer(async (req, res) => {
  if (req.url === '/__nsg/save' && req.method === 'POST') {
    let body = '';
    for await (const chunk of req) body += chunk;
    let results = [];
    try {
      const { edits } = JSON.parse(body);
      results = edits.map((e) => {
        const r = applyEdit(e.original, e.updated, e.file, e.line);
        const label = e.original.slice(0, 55).replace(/\s+/g, ' ');
        if (r.ok) console.log(green(`  ✓ ${r.file}  "${label}…"`));
        else console.log(yellow(`  ! skipped (${r.reason}): "${label}…"`));
        return { ...r, original: e.original };
      });
    } catch (err) {
      console.log(red('  save error: ' + err.message));
    }
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ results }));
  }

  if (req.url === '/__nsg/note' && req.method === 'POST') {
    let body = '';
    for await (const chunk of req) body += chunk;
    const notes = loadNotes();
    try {
      const n = JSON.parse(body);
      const note = {
        id: 'n' + (notes.length + 1) + '-' + Math.random().toString(36).slice(2, 6),
        created: new Date().toISOString(),
        status: 'open',
        page: n.page, file: (n.file || '').replace(ROOT, ''), line: n.line,
        element: n.element, snippet: n.snippet, note: n.note,
      };
      notes.push(note);
      saveNotes(notes);
      console.log(yellow(`  💬 note on ${note.page} (${note.element}): ${note.note}`));
    } catch (err) { console.log(red('  note error: ' + err.message)); }
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ notes: loadNotes() }));
  }

  if (req.url === '/__nsg/note-resolve' && req.method === 'POST') {
    let body = '';
    for await (const chunk of req) body += chunk;
    const notes = loadNotes();
    try {
      const { id } = JSON.parse(body);
      const n = notes.find((x) => x.id === id);
      if (n) { n.status = 'done'; n.resolved = new Date().toISOString(); saveNotes(notes); }
      console.log(green(`  ✓ note resolved: ${id}`));
    } catch (err) { console.log(red('  resolve error: ' + err.message)); }
    res.writeHead(200, { 'content-type': 'application/json' });
    return res.end(JSON.stringify({ notes: loadNotes() }));
  }

  // Proxy everything else to Astro, injecting the editor into HTML pages.
  try {
    const upstream = await fetch(`http://localhost:${ASTRO_PORT}${req.url}`, {
      headers: { ...req.headers, host: `localhost:${ASTRO_PORT}` },
    });
    const type = upstream.headers.get('content-type') || '';
    const headers = {};
    upstream.headers.forEach((v, k) => {
      if (!['content-encoding', 'content-length', 'transfer-encoding'].includes(k)) headers[k] = v;
    });

    if (type.includes('text/html')) {
      let html = await upstream.text();
      // Re-read affiliates each request so status edits show up without a restart.
      // The replacement MUST be a function: a string replacement would treat `$'`
      // and `$&` in the client code as special patterns.
      const deals = JSON.stringify(buildDeals());
      const notes = JSON.stringify(loadNotes());
      const client = CLIENT
        .replace('__NSG_DEALS__', () => deals)
        .replace('__NSG_NOTES__', () => notes);
      html = html.includes('</body>')
        ? html.replace('</body>', () => client + '</body>')
        : html + client;
      res.writeHead(upstream.status, { ...headers, 'content-type': 'text/html; charset=utf-8' });
      return res.end(html);
    }
    res.writeHead(upstream.status, headers);
    return res.end(Buffer.from(await upstream.arrayBuffer()));
  } catch (err) {
    res.writeHead(502);
    res.end('proxy error: ' + err.message);
  }
}).listen(EDIT_PORT, () => {
  console.log(green(bold(`  Visual editor ready:  http://localhost:${EDIT_PORT}/\n`)));
  console.log('  Click any text to edit. Enter or click away to finish a field.');
  console.log('  Escape undoes a field. Then press Save.');
  console.log('  Saved edits go straight into your source files.\n');
  console.log('  Press Ctrl+C here when you are done.\n');
});
