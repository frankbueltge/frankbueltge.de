// The presentation is the work as it stands: index.html, ringback.js, data.js, overheard.js, meta.json and every voice
// in voices/ must be byte-identical to works/2026-11-25-ringback/, and the page must open without errors, say it is
// presented, wait for the visitor's call, and run: 9-1-1 is picked up at the fifteenth second while every other line
// rings; the third word that reached the maker comes in as its line ringing inside, its doubts drawn as threads; at the
// end of the record 81 acts were overheard, none to the visitor, and nine threads stand, eight grey, the AI Office's pale.
// The work's own check.mjs reads every number of the page against the data; this one checks that this is that page.
// node verify.mjs (from this folder; it serves the folder itself)
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import crypto from 'crypto'; import http from 'http';
const require = createRequire(process.env.NODE_PATH ? process.env.NODE_PATH + '/' : import.meta.url); const { chromium } = require('playwright');
const here = path.dirname(new URL(import.meta.url).pathname), work = path.join(here, '../../works/2026-11-25-ringback');
const sha = (f) => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const voices = fs.readdirSync(path.join(work, 'voices')).filter((f) => f.endsWith('.m4a')).map((f) => 'voices/' + f);
const files = ['index.html', 'ringback.js', 'data.js', 'overheard.js', 'meta.json', ...voices];
const same = files.map((f) => [f, fs.existsSync(path.join(here, f)) && sha(path.join(here, f)) === sha(path.join(work, f))]);
const extra = fs.readdirSync(path.join(here, 'voices')).filter((f) => !voices.includes('voices/' + f));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.m4a': 'audio/mp4' };
const server = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(here, u === '/' ? 'index.html' : u.slice(1));
  if (!f.startsWith(here) || !fs.existsSync(f)) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise((ok) => server.listen(0, '127.0.0.1', ok));
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1100, height: 820 } })).newPage();
const errors = []; page.on('pageerror', (e) => errors.push(String(e)));
await page.goto(`http://127.0.0.1:${server.address().port}/`); await page.waitForTimeout(800);
const face = await page.evaluate(() => document.querySelector('.wip').textContent);
const asked = await page.evaluate(() => !document.querySelector('#goQuiet').hidden && window.__ringback.lines().every((l) => l.st === 'dark'));
await page.click('#goQuiet'); await page.waitForTimeout(400);
const R = (f, a) => page.evaluate(f, a);
const to = async (t) => { await R((d) => window.__ringback.advance(d), Math.max(0, t - await R(() => window.__ringback.t()))); await page.waitForTimeout(700); };
await to(50);
const lines = await R(() => window.__ringback.lines());
const answered = lines.filter((l) => l.st === 'answered').map((l) => [l.id, +(l.answeredAt - l.t0).toFixed(2)]);
const ringing = lines.filter((l) => l.st === 'ringing').length;
const ins = await R(() => window.__ringback.inside());
await to(ins[2].t + 1.0);
const third = await R((n) => ({ form: document.querySelector('#heard').dataset.form, n: document.querySelector('#heard').dataset.n,
  ringsInside: Array.from({ length: 25 }, (_, k) => window.__ringback.insideAt(n, window.__ringback.t() - k * 0.1)).some((x) => x > 0), lamp: window.__ringback.lamp('COP5')[1], threads: window.__ringback.threads().filter((x) => x.drawn).length }), ins[2].n);
await to(await R(() => window.__ringback.hearEnd()) + 0.5);
const end = await R(() => ({ heard: (document.querySelector('#status [data-k="heard"]') || {}).textContent, ended: window.__ringback.ended(),
  threads: window.__ringback.threads(), pixels: window.__ringback.threadPixels() }));
await browser.close(); server.close();
const pale = end.threads.filter((x) => !x.past).map((x) => x.duty).join();
const ok = same.every(([, s]) => s) && !extra.length && voices.length === 44 && !errors.length && /^Presented · state 4 of 4/.test(face) && asked &&
  answered.length === 1 && answered[0][0] === '911' && Math.abs(answered[0][1] - 15) < 0.2 && ringing === 19 &&
  ins.length === 5 && third.form === 'inside' && third.n === String(ins[2].n) && third.ringsInside && third.lamp === 3 && third.threads > 0 &&
  end.heard === '81' && end.ended && end.threads.length === 9 && end.threads.every((x) => x.drawn) && pale === 'EU4' && end.pixels > 400;
console.log(JSON.stringify({ identical: same.filter(([, s]) => !s).length ? Object.fromEntries(same.filter(([, s]) => !s)) : 'all ' + same.length, extra, errors, face, asked,
  answered, ringing, inside: ins.map((e) => e.n), third, end: { heard: end.heard, ended: end.ended, threads: end.threads.length, grey: end.threads.filter((x) => x.past).length, pale, pixels: end.pixels }, ok }));
process.exit(ok ? 0 : 1);
