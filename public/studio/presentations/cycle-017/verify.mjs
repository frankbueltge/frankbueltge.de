// The presentation is the work as it stands: index.html, world.js, data.js, meta.json and the vendored library here must
// be byte-identical to works/2026-11-19-small-hours/, and the page must open without errors, ask for the first gesture,
// and, held after its end has run, draw what a stranger can still check: 60 pairs Git joins by itself, 11 that share only
// a file, the 29 breaches over their limit on every count, and nothing of the readings.
// The work's own check.mjs reads every number of the page against the data; this one checks that this is that page.
// node verify.mjs (from this folder; it serves the folder itself)
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import crypto from 'crypto'; import http from 'http';
const require = createRequire(process.env.NODE_PATH ? process.env.NODE_PATH + '/' : import.meta.url); const { chromium } = require('playwright');
const here = path.dirname(new URL(import.meta.url).pathname), work = path.join(here, '../../works/2026-11-19-small-hours');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const files = ['index.html', 'world.js', 'data.js', 'meta.json', 'vendor/three.module.min.js', 'vendor/OrbitControls.js', 'vendor/THREE-LICENSE.txt'];
const same = files.map(f => [f, sha(path.join(here, f)) === sha(path.join(work, f))]);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.json': 'application/json', '.txt': 'text/plain' };
const server = http.createServer((q, r) => { const f = path.join(here, decodeURIComponent(q.url.split('?')[0]) === '/' ? 'index.html' : decodeURIComponent(q.url.split('?')[0]).slice(1));
  if (!f.startsWith(here) || !fs.existsSync(f)) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); });
await new Promise(ok => server.listen(0, '127.0.0.1', ok));
const browser = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await (await browser.newContext({ viewport: { width: 1100, height: 900 } })).newPage();
const errors = []; page.on('pageerror', e => errors.push(String(e)));
await page.goto(`http://127.0.0.1:${server.address().port}/`); await page.waitForFunction(() => document.documentElement.dataset.ready === '1');
const asked = await page.evaluate(() => !document.getElementById('enter').hidden && !window.__SH.st.playing);
await page.click('#enterQuiet'); await page.click('[data-go=coda]');
await page.evaluate(() => { window.__SH.coda.hold = 60000; }); await page.waitForTimeout(800);
const d = await page.evaluate(() => window.__SH.codaDrawn());
await browser.close(); server.close();
const ok = same.every(([, s]) => s) && !errors.length && asked && d.flames === 1 && d.out === 1 && d.stitched === 60 && d.fileOnly === 11 &&
  d.stitchedArchitect === 60 && d.steadyBreaches === 29 && d.waverCommitsLit === 0 && d.threadsOn === 0 && d.pillarsOn === 0 && d.logRingsOn === 0;
console.log(JSON.stringify({ identical: Object.fromEntries(same), errors, asked, stitched: d.stitched, fileOnly: d.fileOnly, architect: d.stitchedArchitect, steady: d.steadyBreaches, ok }));
process.exit(ok ? 0 : 1);
