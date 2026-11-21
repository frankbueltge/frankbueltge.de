// State 3, the check: open the page as a visitor does and read every figure of the check, the seventh row and the
// strike control against data/check.json and data/rules.json, recounting from the items here rather than trusting the
// page's script. Run from this folder: node check_page3.mjs [wide.png] [narrow.png]
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(new URL(import.meta.url).pathname);
const C = JSON.parse(fs.readFileSync(path.join(here, 'data/check.json'), 'utf8'));
const R = JSON.parse(fs.readFileSync(path.join(here, 'data/rules.json'), 'utf8'));
const type = f => f.endsWith('.html') ? 'text/html' : f.endsWith('.js') || f.endsWith('.mjs') ? 'text/javascript' : f.endsWith('.json') ? 'application/json' : 'application/octet-stream';
const srv = http.createServer((q, r) => { const f = path.join(here, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); return } r.writeHead(200, { 'content-type': type(f) }); r.end(b) }) });
await new Promise(ok => srv.listen(0, ok));
const url = `http://127.0.0.1:${srv.address().port}/`;
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('FAIL', m) } else console.log('ok', m) };
const num = s => +String(s).replace(/[^0-9.]/g, '');
const get = p => { let o = C; const parts = p.split('.'); for (let i = 0; i < parts.length && o != null; i++) { let hit = false; for (let j = parts.length; j > i; j--) { const k = parts.slice(i, j).join('.'); if (Object.hasOwn(o, k)) { o = o[k]; i = j - 1; hit = true; break } } if (!hit) return null } return o };
const WPM = { r175: 175, r184: 184, r238: 238, r300: 300 };
const val = (it, x) => { if (x.includes('.')) { const [w, q] = x.split('.'); return it.n[w] * 60 / WPM[q] } return it.n[x] };
// the verdicts on an admitted set of readings, recounted here from the items
function verdicts(adm) {
  const rules = R.rules.concat([C.time.rule]), items = R.items.concat(C.time.items), out = {};
  for (const r of rules) {
    const xs = r.id === 'bulletin-lines-defined' ? r.readings : r.readings.filter(x => x.split('.').every(q => adm.has(q)));
    const v = { kept: 0, broken: 0, open: 0 };
    for (const it of items.filter(i => i.rule === r.id && i.verdict !== 'not bound')) {
      const vs = xs.map(x => val(it, x));
      v[Math.max(...vs) <= r.limit ? 'kept' : Math.min(...vs) > r.limit ? 'broken' : 'open']++;
    }
    out[r.id] = v;
  }
  return out;
}
const six = v => Object.entries(v).filter(([k]) => k !== 'record-time').reduce((a, [, c]) => ({ kept: a.kept + c.kept, broken: a.broken + c.broken, open: a.open + c.open }), { kept: 0, broken: 0, open: 0 });
const ALL = ['file', 'text', 'block', 'declared', 'browser', 'spaces', 'field', 'points', 'units', 'bytes', 'graphemes', 'r175', 'r184', 'r238', 'r300'];
const v0 = verdicts(new Set(ALL));
ok(v0['record-time'].kept === C.time.figures.kept && v0['record-time'].broken === C.time.figures.broken && v0['record-time'].open === C.time.figures.open, `the seventh row recounted: ${JSON.stringify(v0['record-time'])}`);
// the limit struck on 30 August, recounted from its items
const A = { kept: 0, broken: 0, open: 0 };
for (const it of C.august.items) { const vs = Object.values(it.n); A[Math.max(...vs) <= 400 ? 'kept' : Math.min(...vs) > 400 ? 'broken' : 'open']++ }
ok(A.kept === C.august.figures.kept && A.broken === C.august.figures.broken && A.open === C.august.figures.open && C.august.items.length === C.august.figures.items, `the August ceiling recounted: ${JSON.stringify(A)}`);
const v1 = verdicts(new Set(ALL.filter(x => x !== 'block')));
ok(six(v1).broken === R.figures.all.broken + C.fine.sense && six(v1).open === C.fine.blank + C.fine.word, `struck the paragraph: ${JSON.stringify(six(v1))}, the ${C.fine.sense} move to broken`);
const v2 = verdicts(new Set(ALL.filter(x => x !== 'r175' && x !== 'r184')))['record-time'];

const b = await chromium.launch();
for (const [w, scheme, shot] of [[1100, 'light', process.argv[2]], [390, 'dark', process.argv[3]]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) });
  await p.goto(url);
  await p.waitForSelector('#rules[data-done="1"]', { timeout: 30000 });
  await p.waitForSelector('html[data-check="1"]', { timeout: 30000 });
  ok(errs.length === 0, `${w}px no errors ${errs.join(' | ')}`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${w}px no sideways scroll of the page`);
  // state 4 (the presentation) replaces the label; the check's findings stay on the page
  ok(['in progress · state 3 of 4 · checked', 'presented 21 November · state 4 of 4', 'presented 21 November · fifth state'].includes(await p.textContent('.progress')), `${w}px the work says it is checked or presented`);
  const fr = await p.$$eval('[data-ck]', es => es.map(e => [e.getAttribute('data-ck'), e.textContent]));
  const bad = fr.filter(([k, t]) => { const v = get(k); return typeof v === 'number' ? num(t) !== v : t !== String(v) });
  ok(fr.length === 57 && bad.length === 0, `${w}px ${fr.length} figures of the check read from the page ${JSON.stringify(bad)}`);
  ok((await p.$$('.check li')).length === 7, `${w}px the check lists seven findings`);
  const corr = (await p.textContent('main')).match(/corrected 2026-11-21/gi) || [];
  ok(corr.length >= 6, `${w}px ${corr.length} passages marked corrected by the check`);
  // the seventh row, drawn
  const drawn = await p.$$eval('#rules g.row[data-rule="record-time"] g.it', es => es.map(e => e.getAttribute('class')));
  const cls = k => drawn.filter(c => c.split(' ').includes(k)).length;
  ok(drawn.length === C.time.items.length && cls('kept') === C.time.figures.kept && cls('broken') === C.time.figures.broken && cls('open') === C.time.figures.open,
    `${w}px the seventh row: ${drawn.length} marks, ${cls('kept')} kept, ${cls('broken')} broken, ${cls('open')} open`);
  // one reading of the seventh row: the declared rule at the bulletin's own rate
  await p.click('.rask button[data-u="word"][data-x="declared"]');
  await p.click('.rask button[data-u="rate"][data-x="r184"]');
  const t184 = await p.$eval('#rules g.row[data-rule="record-time"] .rt', e => e.getAttribute('data-over'));
  ok(+t184 === C.time.figures.by_rate.r184, `${w}px at 184 words a minute, by the declared rule, ${t184} versions over two minutes`);
  await p.click('.rask button[data-u="word"][data-x=""]');
  await p.click('.rask button[data-u="rate"][data-x=""]');
  // strike the paragraph: the tiles and the rows move as the recount says
  await p.click('.rstrike button[data-s="block"]');
  const tile = async k => num(await p.$eval('#rsay', (e, k) => e.previousElementSibling.querySelector(`[data-rv="${k}"]`).textContent, k));
  const s1 = six(v1);
  ok(await tile('all.kept') === s1.kept && await tile('all.broken') === s1.broken && await tile('all.open') === s1.open, `${w}px struck the paragraph: tiles ${s1.kept} kept, ${s1.broken} broken, ${s1.open} open`);
  for (const r of ['journal-lines', 'critique-lines', 'score-lines', 'bulletin-lines']) {
    const t = await p.$eval(`#rules g.row[data-rule="${r}"] .rt`, e => e.getAttribute('data-v'));
    ok(t === `${v1[r].kept} ${v1[r].broken} ${v1[r].open}`, `${w}px struck the paragraph: ${r} ${t}`);
  }
  await p.click('.rstrike button[data-s="block"]');
  ok(await tile('all.open') === R.figures.all.open, `${w}px restored: ${R.figures.all.open} open again`);
  // an open item that broke a typed line on both counts is opened; its panel names the sense
  const sense = Object.entries(C.fine.sorts).find(([, s]) => s === 'sense')[0];
  await p.$eval(`#rules g.it[data-k="${sense}"] .hit`, e => e.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  ok((await p.textContent('#rdet .said')).includes('broke the rule in one of its senses'), `${w}px the panel of ${sense} names the sense it broke`);
  // strike the two slowest rates: the seventh row recounts
  await p.click('.rstrike button[data-s="r175"]');
  await p.click('.rstrike button[data-s="r184"]');
  const t2 = await p.$eval('#rules g.row[data-rule="record-time"] .rt', e => e.getAttribute('data-v'));
  ok(t2 === `${v2.kept} ${v2.broken} ${v2.open}`, `${w}px only the silent rates of 238 and 300 admitted: the seventh row ${t2}`);
  await p.click('.rstrike button[data-s="r175"]');
  await p.click('.rstrike button[data-s="r184"]');
  // a unit always keeps one reading
  for (const x of ['points', 'units', 'bytes', 'graphemes']) await p.click(`.rstrike button[data-s="${x}"]`);
  ok(await p.$eval('.rstrike button[data-s="graphemes"]', e => e.getAttribute('aria-pressed')) === 'true', `${w}px the last reading of a unit cannot be struck`);
  for (const x of ['points', 'units', 'bytes']) await p.click(`.rstrike button[data-s="${x}"]`);
  // the cards
  ok((await p.$$('#d1 dt.ck')).length === 1 && (await p.$$('#d2 dt.ck')).length === 1, `${w}px two cards carry what the check found`);
  const d1 = await p.textContent('#d1 dd.ck');
  ok(d1.includes('14b4bb0') && d1.includes('b9c5899'), `${w}px the first card links both commits`);
  if (shot) { await p.evaluate(() => window.scrollTo(0, 0)); await p.screenshot({ path: shot, fullPage: true }); console.log('shot', shot) }
  await p.close();
}
await b.close(); srv.close();
console.log(`${n - fail} of ${n} checks passed`);
process.exit(fail ? 1 : 0);
