// Reading 93 -- read every state-4 figure (data-k4) from the rendered page at two widths and recount it from the data
// files, independently of build93.py: the findings from points93.json, the two readings from codes93-first.json and
// blind93.json, the reconciled codes from codes93.json, carriage and reach from the final codes of the 51 signals
// (codes92.json), who told from traces92.json, the escape from escape93.json; compare with results93.json; check the
// grid, the tables and lists of state 4 and the three new predictions; then run verify92.mjs, which runs the checks
// of states 1 to 3.
// Usage: node verify93.mjs   (needs playwright; reads index.html from this folder)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const here = dirname(fileURLToPath(import.meta.url));
const J = f => JSON.parse(readFileSync(join(here, f), 'utf8'));
const PTS = J('points93.json').points, FIRST = J('codes93-first.json').coded, BLIND = J('blind93.json').coded;
const FIN = J('codes93.json').findings, SIG = Object.fromEntries(J('codes92.json').signals.map(s => [s.id, s]));
const TR = J('traces92.json').signals, ESC = J('escape93.json'), RES = J('results93.json');
const ids = PTS.map(p => p.id);
const one = Object.fromEntries(FIRST.map(x => [x.id, x])), two = Object.fromEntries(BLIND.map(x => [x.id, x]));
const fin = Object.fromEntries(FIN.map(x => [x.id, x]));
const r2 = x => Math.round(x * 100) / 100;
function kappa(a, b) {
  const n = a.length, po = a.filter((x, i) => x === b[i]).length / n;
  const ca = {}, cb = {}; a.forEach(x => ca[x] = (ca[x] || 0) + 1); b.forEach(x => cb[x] = (cb[x] || 0) + 1);
  const pe = [...new Set([...a, ...b])].reduce((t, k) => t + (ca[k] || 0) * (cb[k] || 0), 0) / (n * n);
  return pe < 1 ? r2((po - pe) / (1 - pe)) : null;
}
const reachOf = list => {
  if (!list.length) return null;
  const r = list.map(i => SIG[i].public === 'public' ? 0 : SIG[i].public === 'aggregate only' ? 1 : SIG[i].receiver === 'public body' ? 2 : 3);
  return ['public', 'aggregate', 'body only', 'maker or other party'][Math.min(...r)];
};
const NOLAW = ['voluntary', 'third party', 'house'];

const E = {};
E['findings'] = ids.length;
// the reconciled codes, recounted from codes93.json; every finding the two readings differ on carries a reason
const carried = ids.filter(i => fin[i].carried.length);
E['carried'] = carried.length;
for (const s of ['instrument', 'other law', 'voluntary', 'third party', 'house']) E[`source.${s}`] = ids.filter(i => fin[i].source === s).length;
E['no_law'] = ids.filter(i => NOLAW.includes(fin[i].source)).length;
for (const r of ['public', 'aggregate', 'body only', 'maker or other party']) E[`reach.${r}`] = ids.filter(i => reachOf(fin[i].carried) === r).length;
E['signals_unused'] = 51 - new Set(ids.flatMap(i => fin[i].carried)).size;
// agreement, from the two readings as written
const fa = ids.map(i => one[i].carried.length ? 'yes' : 'no'), ba = ids.map(i => two[i].carried.length ? 'yes' : 'no');
E['agreement.carried.kappa'] = kappa(fa, ba); E['agreement.carried.same'] = fa.filter((x, i) => x === ba[i]).length;
E['agreement.carried.blind_yes'] = ba.filter(x => x === 'yes').length;
const fs = ids.map(i => one[i].source), bs = ids.map(i => two[i].source);
E['agreement.source.kappa'] = kappa(fs, bs); E['agreement.source.same'] = fs.filter((x, i) => x === bs[i]).length;
const differ = ids.filter((i, k) => fa[k] !== ba[k] || fs[k] !== bs[k]);
E['agreement.differ.length'] = differ.length;
// predictions
E['P155.carried'] = carried.length;
E['P156.carried'] = carried.length;
E['P156.not_public'] = carried.filter(i => reachOf(fin[i].carried) !== 'public').length;
E['P157.no_law'] = E['no_law']; E['P157.of'] = ids.length;
E['alone.blind.P155.carried'] = ba.filter(x => x === 'yes').length;
E['alone.blind.P157.no_law'] = bs.filter(s => NOLAW.includes(s)).length;
// who told: from check 92's traces and final codes
const moved = TR.filter(t => t.moved !== 'no trace found');
E['told_summary.moved'] = moved.length;
E['told_summary.required_public'] = moved.filter(t => SIG[t.id].public === 'public').length;
E['told_summary.kept_from_public_but_told.length'] = moved.filter(t => SIG[t.id].public !== 'public').length;
// the escape
const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);
const ev = Object.fromEntries(ESC.events.map(e => [e.key, e.date]));
E['escape.resumed_to_internet_days'] = days(ev.resumed, ev.internet);
E['escape.to_first_public_days.from 8 July'] = days(ev.internet, '2026-07-16');
E['escape.to_first_public_days.from 9 July'] = days('2026-07-09', '2026-07-16');
E['escape_found'] = ESC.passages_found;

const get = (o, path) => {
  if (o === undefined) return undefined;
  if (path === 'length') return Array.isArray(o) ? o.length : undefined;
  if (Object.prototype.hasOwnProperty.call(o, path)) return o[path];
  const keys = Object.keys(o).sort((a, b) => b.length - a.length);
  for (const k of keys) if (path.startsWith(k + '.')) return get(o[k], path.slice(k.length + 1));
  return undefined;
};
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
for (const k in E) ok(get(RES, k) === E[k], `results93.json ${k}: ${get(RES, k)} vs recount ${E[k]}`);
ok(ids.length === 28 && new Set(ids).size === 28, 'the 28 findings');
ok(differ.every(i => fin[i].reconciled && fin[i].reconciled.why), 'every difference carries its reason');
ok(ids.every(i => fin[i].carried.every(s => s in SIG)), 'every carrying signal is one of the 51');
ok(ESC.report.same_as_study_91 && ESC.passages_found === ESC.passages, 'escape: the report is the one study 91 read, every passage found');
ok(RES.P155.held === (E['P155.carried'] <= 9) && RES.P156.held === (E['P156.carried'] >= 4 ? E['P156.not_public'] * 2 > E['P156.carried'] : null) && RES.P157.held === (E['P157.no_law'] >= 15), 'verdicts in results93.json');

const browser = await chromium.launch();
for (const width of [1100, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + join(here, 'index.html'));
  await page.waitForTimeout(300);
  ok(errs.length === 0, `${width}: page errors ${errs}`);
  ok(await page.evaluate(() => document.documentElement.scrollWidth) <= width, `${width}: no sideways scroll`);
  const ks = await page.$$eval('[data-k4]', els => els.map(e => [e.dataset.k4, e.textContent.trim()]));
  ok(ks.length >= 30, `${width}: data-k4 count ${ks.length}`);
  for (const [k, t] of ks) {
    ok(k in E, `${width}: unknown key ${k}`);
    ok(Number(t) === E[k], `${width}: ${k} page ${t} vs recount ${E[k]}`);
  }
  // the grid: one square per finding, coloured by its reconciled source, ringed where carried
  const sq = await page.$$eval('#prog rect.sq', rs => rs.map(r => [r.dataset.id, r.dataset.source, r.dataset.carried]));
  ok(sq.length === 28 && sq.every(([i, s, c]) => fin[i] && fin[i].source === s && (c === 'yes') === (fin[i].carried.length > 0)), `${width}: grid`);
  ok(await page.$$eval('#prog rect.ring', r => r.length) === carried.length, `${width}: rings`);
  const told = await page.$$eval('#told tbody tr', rs => rs.map(r => [r.dataset.id, r.children[1].textContent]));
  ok(told.length === moved.length && told.every(([i, t]) => t.startsWith(SIG[i].public === 'public' ? 'asks for publication' : 'keeps it from the public')), `${width}: who told`);
  ok(await page.$$eval('#attr li', l => l.length) === RES.attribution.length, `${width}: who said machines acted`);
  const cl = await page.$$eval('#caselist2b li.corr', l => l.map(x => x.dataset.event));
  ok(['alert_2', 'resumed', 'internet', 'alert_3', 'tied'].every(k => cl.includes(k)), `${width}: the maker's alerts in the escape's list`);
  ok(await page.$$eval('#case2 line.corr', l => l.length) === 3, `${width}: three dated marks on the escape's time line`);
  for (const [id, v] of [['p155', RES.P155.held], ['p156', RES.P156.held], ['p157', RES.P157.held]])
    ok((await page.$eval('#' + id, e => e.textContent.trim())) === (v ? 'Held' : 'Failed'), `${width}: ${id}`);
  await page.click('#prog rect.sq[data-id="S3.5"]');
  const ro = await page.$eval('#preadout', e => e.textContent);
  ok(ro.includes(fin['S3.5'].lead) && ro.includes(fin['S3.5'].reconciled.why), `${width}: readout`);
  await page.close();
}
await browser.close();
console.log(`state 4: ${pass} checks passed, ${fail} failed`);
let v92 = '';
try { v92 = execFileSync('node', [join(here, 'verify92.mjs')], { encoding: 'utf8' }); } catch (e) { v92 = String(e.stdout) + ' (exit ' + e.status + ')'; fail++; }
console.log(v92.trim());
process.exit(fail ? 1 : 0);
