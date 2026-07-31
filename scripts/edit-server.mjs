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
import { ROOT, green, yellow, red, bold } from './_lib.mjs';

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
</style>
<div id="nsg-bar">
  <button id="nsg-toggle" class="on">✏️ Edit: ON</button>
  <span id="nsg-msg">Click any text to edit it.</span>
  <button id="nsg-save" disabled>Save 0</button>
</div>
<script>
(function () {
  var edits = new Map(); // element -> original text
  var on = true;

  var SEL = 'p,h1,h2,h3,h4,li,td,th,figcaption,blockquote,span,small,dd,dt,div,summary,strong,em,label';
  function eligible(el) {
    if (el.closest('#nsg-bar')) return false;
    if (el.children.length > 0) return false;          // text-only nodes stay safe to write back
    if (!el.getAttribute('data-astro-source-file')) return false;
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
      var loc = el.getAttribute('data-astro-source-loc') || '';
      payload.push({
        original: orig,
        updated: el.textContent,
        file: el.getAttribute('data-astro-source-file') || '',
        line: parseInt(loc.split(':')[0], 10) || 0
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

  mark();
  new MutationObserver(mark).observe(document.body, { childList: true, subtree: true });
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
      html = html.includes('</body>')
        ? html.replace('</body>', CLIENT + '</body>')
        : html + CLIENT;
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
