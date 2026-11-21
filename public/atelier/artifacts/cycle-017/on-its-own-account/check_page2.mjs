// State 2: open the page as a visitor does and read every figure of section II against data/rules.json, recounting from
// the items here rather than trusting the page's script. Run from this folder: node check_page2.mjs [wide.png] [narrow.png]
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(new URL(import.meta.url).pathname);
const R = JSON.parse(fs.readFileSync(path.join(here, 'data/rules.json'), 'utf8')), F = R.figures, I = R.items;
const type = f => f.endsWith('.html') ? 'text/html' : f.endsWith('.js') || f.endsWith('.mjs') ? 'text/javascript' : f.endsWith('.json') ? 'application/json' : 'application/octet-stream';
const srv = http.createServer((q, r) => { const f = path.join(here, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); return } r.writeHead(200, { 'content-type': type(f) }); r.end(b) }) });
await new Promise(ok => srv.listen(0, ok));
const url = `http://127.0.0.1:${srv.address().port}/`;
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('FAIL', m) } else console.log('ok', m) };
const num = s => +String(s).replace(/[^0-9.]/g, '');
const get = k => k.split('.').reduce((o, x) => o == null ? o : o[x], F);
// the verdicts, recounted here from each item's readings
for (const r of R.rules) {
  const its = I.filter(i => i.rule === r.id);
  const v = { kept: 0, broken: 0, open: 0 };
  for (const i of its) { if (i.exempt) continue; const xs = r.readings.map(x => i.n[x]); v[Math.max(...xs) <= r.limit ? 'kept' : Math.min(...xs) > r.limit ? 'broken' : 'open']++; }
  ok(v.kept === F[r.id].kept && v.broken === F[r.id].broken && v.open === F[r.id].open, `${r.id}: recounted ${v.kept} kept, ${v.broken} broken, ${v.open} open`);
}
const b = await chromium.launch();
for (const [w, scheme, shot] of [[1100, 'light', process.argv[2]], [390, 'dark', process.argv[3]]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) });
  await p.goto(url); await p.waitForSelector('#rules[data-done="1"]', { timeout: 30000 });
  ok(errs.length === 0, `${w}px no errors ${errs.join(' | ')}`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${w}px no sideways scroll of the page`);
  const fr = await p.$$eval('[data-rv]', es => es.map(e => [e.getAttribute('data-rv'), e.textContent]));
  const bad = fr.filter(([k, t]) => { const v = get(k); return typeof v === 'number' ? num(t) !== v : t !== String(v) });
  // state 3 rewrote a paragraph of section IV (its four figures now read from data/check.js) and added one in section II
  ok(fr.length === 45 && bad.length === 0, `${w}px ${fr.length} figures of section II read from the page ${JSON.stringify(bad)}`);
  const steps = (await p.$$eval('h2 ~ .steps', es => es[es.length - 1].textContent)).replace(/\s+/g, ' ');
  ok(new RegExp(`written down\\s*${F.seen_items}\\s*items`).test(steps), `${w}px the tile says ${F.seen_items} items written down`);
  ok((await p.$$('#rules .eye')).length === I.filter(i => i.seen).length && I.filter(i => i.seen).length === F.seen_items, `${w}px ${F.seen_items} items marked as named by this practice`);
  for (const r of R.rules) {
    const its = I.filter(i => i.rule === r.id);
    const drawn = await p.$$eval(`#rules g.row[data-rule="${r.id}"] g.it`, es => es.map(e => e.getAttribute('class')));
    const cls = k => drawn.filter(c => c.split(' ').includes(k)).length;
    ok(drawn.length === its.length && cls('kept') === F[r.id].kept && cls('broken') === F[r.id].broken && cls('open') === F[r.id].open && cls('not-bound') === F[r.id].not_bound,
      `${w}px row ${r.id}: ${drawn.length} marks, as many of each verdict as the data`);
    const rings = await p.$$eval(`#rules g.row[data-rule="${r.id}"] .cen`, es => es.length);
    ok(rings === its.filter(i => i.census && i.census.breach).length, `${w}px row ${r.id}: ${rings} census marks`);
  }
  // your browser's count, recounted here independently of the page's script
  const mine = await p.evaluate(() => { const s = new Intl.Segmenter('en', { granularity: 'word' }), c = {}; for (const [k, t] of Object.entries(window.RTEXTS)) { let n = 0; for (const x of s.segment(t)) if (x.isWordLike) n++; c[k] = n } return c });
  const eng = await p.evaluate(() => navigator.userAgent.match(/Chrome\/([\d.]+)/)?.[1]);
  if (R.runtime.browser === 'Chromium ' + eng) ok(Object.entries(mine).every(([k, v]) => I.find(i => i.k === k).n.browser === v), `${w}px this browser counts the word items as the build's ${R.runtime.browser} did`);
  // every reading: the tally of each row and the dots over, against a recount from the items
  const readings = { line: ['file', 'text', 'block'], word: ['declared', 'browser', 'spaces', 'field', 'mine'], char: ['points', 'bytes', 'units', 'graphemes'] };
  for (const [u, xs] of Object.entries(readings)) for (const x of xs) {
    await p.click(`.rask button[data-u="${u}"][data-x="${x}"]`);
    for (const r of R.rules.filter(r => r.unit === u && r.id !== 'bulletin-lines-defined')) {
      const want = I.filter(i => i.rule === r.id && !i.exempt && (x === 'mine' ? mine[i.k] : i.n[x]) > r.limit).length;
      const t = await p.$eval(`#rules g.row[data-rule="${r.id}"] .rt`, e => e.getAttribute('data-over'));
      const dots = await p.$$eval(`#rules g.row[data-rule="${r.id}"] .pt.on.over`, es => es.length);
      ok(+t === want && dots === want, `${w}px ${u} as ${x}: ${r.id} over ${want} (tally ${t}, dots ${dots})`);
    }
    await p.click(`.rask button[data-u="${u}"][data-x=""]`);
  }
  // one open item, opened
  const it = I.find(i => i.verdict === 'open' && i.rule === 'bulletin-words');
  await p.$eval(`#rules g.it[data-k="${it.k}"] .hit`, e => e.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  const shown = await p.$$eval('#rdet .nums span', es => Object.fromEntries(es.map(e => [e.getAttribute('data-x'), e.querySelector('b').textContent])));
  ok(Object.entries(it.n).every(([x, v]) => num(shown[x]) === v) && num(shown.mine) === mine[it.k], `${w}px panel of ${it.h}: ${JSON.stringify(shown)}`);
  ok((await p.textContent('#rdet .said')).includes('does not decide'), `${w}px the panel says the rule does not decide`);
  // the bulletin that counted itself
  const cells = await p.$$eval('#selfc g.sc', es => es.map(e => e.getAttribute('data-form')));
  ok(cells.filter(f => f !== 'none').length === R.self.length && cells.filter(f => f === 'over').length === F.self.said_over, `${w}px ${R.self.length} versions with a line, ${F.self.said_over} that wrote themselves over`);
  ok(cells.filter(f => f === 'approx').length === F.self.forms.approximated, `${w}px ${F.self.forms.approximated} "approximated"`);
  const late = R.self.filter(x => x.secs > 120).length + F.self.after.filter(x => x.secs > 120).length;
  ok((await p.$$('#selfc .late')).length === late && R.self.filter(x => x.date.slice(0, 10) > F.self.at_limit_date && x.secs > 120).length === F.self.post_over, `${w}px ${late} versions marked over two minutes at the bulletin's own rate, ${F.self.post_over} of them after it stood on the limit`);
  ok((await p.textContent('#sdet')).includes('2 min 0 s'), `${w}px the strip opens on the version that stood on the limit`);
  if (w < 700) ok(await p.$eval('#rules', e => e.getBoundingClientRect().width >= 770), `${w}px the rows keep their width and scroll`);
  if (shot) { await p.screenshot({ path: shot, fullPage: true }); console.log('shot', shot) }
  await p.close();
}
await b.close(); srv.close();
console.log(`${n - fail} of ${n} checks passed`);
process.exit(fail ? 1 : 0);
