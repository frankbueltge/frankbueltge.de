// node seen.js: the face as a visitor sees it, at 1200 and 390 wide, to seen/face-<w>.png; prints errors and requests off-page.
const { chromium } = require('playwright'); const path = require('path'); const fs = require('fs');
(async () => { const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }); fs.mkdirSync(path.join(__dirname, 'seen'), { recursive: true });
 for (const w of [1200, 390]) { const p = await b.newPage({ viewport: { width: w, height: 900 } }); const errs = [], reqs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('request', r => { if (!r.url().startsWith('file://' + __dirname)) reqs.push(r.url()); });
  await p.goto('file://' + path.join(__dirname, 'index.html')); await p.waitForTimeout(1200);
  await p.screenshot({ path: path.join(__dirname, 'seen', 'face-' + w + '.png') });
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  console.log(JSON.stringify({ w, errors: errs, requests: reqs, scrollWidth: sw })); await p.close(); }
 await b.close(); })();
