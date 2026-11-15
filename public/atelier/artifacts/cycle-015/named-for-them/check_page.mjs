// Open the page as a visitor does, read the numbers it shows, compare them with named.json.
// Run from this folder: node check_page.mjs [shot-path]
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(new URL(import.meta.url).pathname);
const res = JSON.parse(fs.readFileSync(path.join(here, 'named.json'), 'utf8')).res;
const srv = http.createServer((q, r) => { const f = path.join(here, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); return } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream' }); r.end(b) }) });
await new Promise(ok => srv.listen(0, ok));
const url = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch();
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m) } else console.log('ok', m) };
const num = s => +String(s).replace(/[^0-9]/g, '');
const lane = res.lane_n;
const claim = lane['claimant'];
const named = res.incidents - res.named_none;
const self = Object.values(res.first_by_lane).reduce((a, x) => a + (x['self-published'] || 0), 0);
const resp = Object.values(res.response_by_lane).reduce((a, x) => a + x, 0);
for (const [w, scheme, shot] of [[1100, 'light', process.argv[2]], [390, 'dark', null]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) });
  await p.goto(url); await p.waitForTimeout(400);
  ok(errs.length === 0, `${w}px no errors ${errs.join(' | ')}`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${w}px no sideways scroll`);
  ok(num(await p.textContent('#s-named')) === named, `${w}px named ${named}`);
  ok(num(await p.textContent('#s-claim')) === claim, `${w}px could claim ${claim}`);
  ok(num(await p.textContent('#s-self')) === self, `${w}px self-published first ${self}`);
  ok(num(await p.textContent('#s-resp')) === resp, `${w}px response ${resp}`);
  ok((await p.$$('#field rect')).length === res.incidents, `${w}px ${res.incidents} squares`);
  // the default lens: a good
  ok((await p.$$('#field rect.on')).length === res.incidents_with_kind.value, `${w}px lit for a good = ${res.incidents_with_kind.value}`);
  ok((await p.textContent('#count')).startsWith(res.incidents_with_kind.value.toLocaleString('en-US') + ' of'), `${w}px count line`);
  await p.click('button[data-l="noclaim"]');
  ok((await p.$$('#field rect.on')).length === lane['no claimant'] + lane['none named'], `${w}px no claimant lit`);
  await p.click('button[data-l="k:1"]');
  ok((await p.$$('#field rect.on')).length === res.incidents_with_kind.users, `${w}px users lit`);
  const B = res.by_entry_block_of_200;
  ok((await p.textContent('#d-first')) === `${B['1'].value} of ${B['1'].n}`, `${w}px first block ${B['1'].value}`);
  ok((await p.textContent('#d-last')) === `${B['1601'].value} of ${B['1601'].n}`, `${w}px last full block ${B['1601'].value}`);
  ok((await p.$$('#goods tbody tr')).length === res.top.value.length, `${w}px goods table`);
  await p.click('button[data-l="k:3"]');
  await p.$eval('#field rect[data-i="1500"]', e => e.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  ok((await p.textContent('#det h4')).startsWith('Incident '), `${w}px a square opens its entry`);
  if (shot) { await p.screenshot({ path: shot, fullPage: true }); console.log('shot', shot) }
  await p.close();
}
await b.close(); srv.close();
console.log(fail ? `${fail} FAILED` : 'all passed'); process.exit(fail ? 1 : 0);
