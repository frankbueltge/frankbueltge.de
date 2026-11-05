// The presentation is the work as it stands: index.html, data.js, land.js, world.js and vendor/ here must be
// byte-identical to works/2026-11-03-clear-air/, and the page must open without errors when served
// (ES modules do not load from file://).   node verify.mjs (from this folder; serves the repo root on :8766)
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import crypto from 'crypto'; import http from 'http';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(new URL(import.meta.url).pathname), root = path.join(here, '../..'), work = path.join(root, 'works/2026-11-03-clear-air');
const sha = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
const files = ['index.html', 'data.js', 'land.js', 'world.js', 'vendor/three.module.min.js', 'vendor/OrbitControls.js', 'vendor/THREE-LICENSE.txt'];
const same = files.map(f => [f, sha(path.join(here, f)) === sha(path.join(work, f))]);
const types = { '.html': 'text/html', '.js': 'text/javascript', '.txt': 'text/plain' };
const srv = http.createServer((q, r) => { const f = path.join(root, decodeURIComponent(q.url.split('?')[0]));
  if (!f.startsWith(root) || !fs.existsSync(f)) { r.writeHead(404); return r.end(); }
  r.writeHead(200, { 'content-type': types[path.extname(f)] || 'application/octet-stream' }); r.end(fs.readFileSync(f)); }).listen(8766);
const browser = await chromium.launch({ args: ['--use-gl=swiftshader', '--enable-unsafe-swiftshader'] });
const page = await browser.newPage({ viewport: { width: 1100, height: 900 } }); const errors = [];
page.on('pageerror', e => errors.push(String(e)));
await page.goto('http://localhost:8766/presentations/cycle-012/index.html?day=2026-09-10'); await page.waitForTimeout(3000);
const grains = await page.evaluate(() => window.__clearAir && window.__clearAir.grains);
await browser.close(); srv.close();
const ok = same.every(([, s]) => s) && !errors.length && grains > 10000;
console.log(JSON.stringify({ identical: Object.fromEntries(same), errors, grains, ok })); process.exit(ok ? 0 : 1);
