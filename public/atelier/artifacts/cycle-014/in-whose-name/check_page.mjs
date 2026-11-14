// State 3: open the page as a visitor does, read the numbers it shows, compare them with stops.json.
// Run from this folder: node check_page.mjs [shot-path]
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(new URL(import.meta.url).pathname);
const counts = JSON.parse(fs.readFileSync(path.join(here, 'stops.json'), 'utf8'));
const srv = http.createServer((q, r) => { const f = path.join(here, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); return } r.writeHead(200, { 'content-type': f.endsWith('.html') ? 'text/html' : f.endsWith('.js') ? 'text/javascript' : 'application/octet-stream' }); r.end(b) }) });
await new Promise(ok => srv.listen(0, ok));
const url = `http://127.0.0.1:${srv.address().port}/`;
const b = await chromium.launch();
let fail = 0; const ok = (c, m) => { if (!c) { fail++; console.log('FAIL', m) } else console.log('ok', m) };
for (const [w, scheme, shot] of [[1100, 'light', process.argv[2]], [390, 'dark', null]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) });
  await p.goto(url); await p.waitForTimeout(400);
  ok(errs.length === 0, `${w}px no errors ${errs.join(' | ')}`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${w}px no sideways scroll`);
  const rows = await p.$$eval('#lchart g.row', gs => gs.map(g => g.getAttribute('aria-label')));
  ok(rows.length === counts.stops + counts.recoded_as_delays.length, `${w}px rows ${rows.length}`);
  ok(rows.filter(r => r.includes('recoded')).length === 3, `${w}px three recoded delays on the page`);
  for (const [id, days] of Object.entries(counts.standing_days)) ok(rows.some(r => r.includes('stands after ' + days + ' days')), `${w}px a standing stop of ${days} days (${id})`);
  ok(rows.some(r => r.includes('after ' + counts.longest_ended.days + ' days') && r.includes('lifted')), `${w}px longest ended ${counts.longest_ended.days}`);
  // read the sentence at the day just past the longest ended stop
  await p.$eval('#dslider', (e, d) => { e.value = d; e.dispatchEvent(new Event('input')) }, counts.longest_ended.days + 1);
  const say = await p.textContent('#lsay');
  const n = ['none','one','two','three','four','five','six','seven','eight','nine','ten','eleven'];
  ok(say.includes(n[counts.standing_older_than_longest_ended.length + 1].replace(/^./, c => c.toUpperCase()) + ' still stood whole'), `${w}px sentence at ${counts.longest_ended.days + 1}: ${say}`);
  ok(say.includes('all three had ended'), `${w}px the three delays ended`);
  ok(await p.evaluate(() => !!document.querySelector('#dw0').textContent.trim() && !!document.querySelector('#v-sastry').textContent.trim()), `${w}px quotations present`);
  await p.$eval('#dslider', e => { e.value = 0; e.dispatchEvent(new Event('input')) });
  if (shot) { await p.screenshot({ path: shot, fullPage: true }); }
  else if (process.env.SHOT390) { await p.locator('#life').screenshot({ path: process.env.SHOT390 }); }
  await p.close();
}
await b.close(); srv.close();
console.log(fail ? `${fail} failed` : 'all held'); process.exit(fail ? 1 : 0);
