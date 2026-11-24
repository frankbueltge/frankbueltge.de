// The presentation is the work as it stands: index.html, earshot.js, data.js, heard.js, meta.json and every voice in
// audio/ must be byte-identical to works/2026-11-22-earshot/, and the page must open without errors, say it is
// presented, ask for the first gesture, and run: the escape opens before the deed on a day in June; on 5 July the
// maker's monitoring alarms in its room while the street stays shut out; at today the doors open.
// The work's own check.mjs reads every number of the page against the data; this one checks that this is that page.
// node verify.mjs (from this folder; it serves the folder itself)
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import crypto from 'crypto'; import http from 'http';
const require = createRequire(process.env.NODE_PATH ? process.env.NODE_PATH + '/' : import.meta.url); const { chromium } = require('playwright');
const here = path.dirname(new URL(import.meta.url).pathname), work = path.join(here, '../../works/2026-11-22-earshot');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const voices = fs.readdirSync(path.join(work, 'audio')).filter(f => f.endsWith('.mp3')).map(f => 'audio/' + f);
const files = ['index.html', 'earshot.js', 'data.js', 'heard.js', 'meta.json', ...voices];
const same = files.map(f => [f, fs.existsSync(path.join(here, f)) && sha(path.join(here, f)) === sha(path.join(work, f))]);
const extra = fs.readdirSync(path.join(here, 'audio')).filter(f => !voices.includes('audio/' + f));
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.mp3': 'audio/mpeg' };
const server = http.createServer((q, r) => { const u = decodeURIComponent(q.url.split('?')[0]), f = path.join(here, u === '/' ? 'index.html' : u.slice(1));
  if (!f.startsWith(here) || !fs.existsSync(f)) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise(ok => server.listen(0, '127.0.0.1', ok));
const browser = await chromium.launch();
const page = await (await browser.newContext({ viewport: { width: 1100, height: 820 } })).newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e)));
await page.goto(`http://127.0.0.1:${server.address().port}/`); await page.waitForTimeout(800);
const face = await page.evaluate(() => document.querySelector('.wip').textContent);
const asked = await page.evaluate(() => !document.getElementById('enter').hidden && !window.__earshot.started);
await page.click('#quiet'); await page.waitForTimeout(400);
const opens = await page.evaluate(() => ({ time: document.getElementById('time').textContent, mode: window.__earshot.mode, locked: window.__earshot.locked() }));
const a2 = await page.evaluate(() => window.EARSHOT.cases.find(c => c.id === 'escape').events.find(e => e.key === 'alert_2').h);
await page.evaluate(h => window.__earshot.seek(window.__earshot.preTau(h) - 0.05), a2); await page.waitForTimeout(1500);
const alert = await page.evaluate(() => { const s = window.__earshot; s.standIn('maker'); return { telling: s.telling && s.telling.e.key, alarm: s.alarm, listener: s.listener, time: document.getElementById('time').textContent }; });
await page.evaluate(() => window.__earshot.seek(window.__earshot.recEnd() + 1)); await page.waitForTimeout(300);
const today = await page.evaluate(() => { const s = window.__earshot; s.standIn('maker'); return { listener: s.listener, locked: s.locked() }; });
await browser.close(); server.close();
const ok = same.every(([, s]) => s) && !extra.length && voices.length === 67 && !errors.length && /^Presented · state 4 of 4/.test(face) && asked &&
  opens.mode === 'escape' && opens.locked && / June 2026 · \d+ days before the deed$/.test(opens.time) &&
  alert.telling === 'alert_2' && alert.alarm > 0.5 && alert.listener === 'street' && alert.time === '5 July 2026 · 4 days before the deed' &&
  today.listener === 'maker' && !today.locked;
console.log(JSON.stringify({ identical: same.filter(([, s]) => !s).map(([f]) => f).length ? Object.fromEntries(same.filter(([, s]) => !s)) : 'all ' + same.length, extra, errors, face, asked, opens, alert, today, ok }));
process.exit(ok ? 0 : 1);
