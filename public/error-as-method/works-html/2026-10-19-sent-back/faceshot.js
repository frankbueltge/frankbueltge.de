// node faceshot.js: serves this folder on localhost and shoots the face at 1200 light and 390 dark into seen/.
const { chromium } = require('playwright'); const http = require('http'); const fs = require('fs'); const path = require('path');
const T = { html: 'text/html', js: 'text/javascript', jpg: 'image/jpeg', png: 'image/png', svg: 'image/svg+xml' };
const srv = http.createServer((q, r) => { const f = path.join(__dirname, decodeURIComponent(q.url.split('?')[0]) === '/' ? 'index.html' : decodeURIComponent(q.url.split('?')[0]));
  fs.readFile(f, (e, d) => { if (e) { r.writeHead(404); r.end(); return; } r.writeHead(200, { 'content-type': T[f.split('.').pop()] || 'text/plain' }); r.end(d); }); });
srv.listen(0, async () => { const u = 'http://localhost:' + srv.address().port + '/'; const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' });
  fs.mkdirSync(path.join(__dirname, 'seen'), { recursive: true });
  for (const [w, s] of [[1200, 'light'], [390, 'dark']]) { const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: s }); const errs = [];
    p.on('pageerror', e => errs.push(String(e))); await p.goto(u); await p.waitForTimeout(800);
    if (w === 1200) { await p.click('input#mk'); await p.waitForTimeout(400); }
    await p.screenshot({ path: path.join(__dirname, 'seen', `face-${w}-${s}.png`), fullPage: true });
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    console.log(w, s, 'errors', errs, 'scrollWidth', sw); await p.close(); }
  await b.close(); srv.close(); });
