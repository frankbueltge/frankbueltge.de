// Study 90 -- read every figure from the rendered page at two widths and recount it from signals90.json and
// house90.json, independently of build90.py; also compare with results90.json.
// Usage: node verify90.mjs   (needs playwright; reads index.html from this folder)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const here = dirname(fileURLToPath(import.meta.url));
const S = JSON.parse(readFileSync(join(here, 'signals90.json'), 'utf8')).signals;
const H = JSON.parse(readFileSync(join(here, 'house90.json'), 'utf8')).pairs.filter(p => p.join === 'lines');
const RES = JSON.parse(readFileSync(join(here, 'results90.json'), 'utf8'));
const Q = JSON.parse(readFileSync(join(here, 'quotes90.json'), 'utf8'));

const EV = s => s.trigger === 'event short of harm' || s.trigger === 'harm';
const law = S.filter(s => s.binding === 'law');
const cnt = (rows, f) => rows.filter(f).length;
const median = a => { const b = [...a].sort((x, y) => x - y), n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };
const r1 = x => Math.round(x * 10) / 10;
const evDl = S.filter(s => EV(s) && s.deadline_h !== null);
const num = evDl.filter(s => typeof s.deadline_h === 'number');
const first = H.map(p => p.first_hand_hours ?? p.mending_hours);
const INSTRUMENTS = new Set(S.map(s => s.instrument));

// the expected value of every data-k key, recounted here
const E = {
  'instruments_law': new Set(law.map(s => s.instrument)).size,
  'signals': S.length,
  'receiver.public body': cnt(S, s => s.receiver === 'public body'),
  'receiver.own record': cnt(S, s => s.receiver === 'own record'),
  'receiver.other party': cnt(S, s => s.receiver === 'other party'),
  'receiver.public': cnt(S, s => s.receiver === 'public'),
  'law': law.length,
  'public_law.public': cnt(law, s => s.public === 'public'),
  'events_law': cnt(law, EV),
  'events_law_aggregate.length': cnt(law, s => EV(s) && s.public === 'aggregate only'),
  'P148.numeric_only.awareness': cnt(num, s => s.clock === 'awareness'),
  'P148.numeric_only.n': num.length,
  'shortest_event_deadline_h': Math.min(...num.map(s => s.deadline_h)),
  'P147.n': cnt(S, s => s.machine_or_person === 'required'),
  'machine_or_person.by class': cnt(S, s => s.machine_or_person === 'by class'),
  'says_who_and_public.length': cnt(S, s => ['required', 'by class'].includes(s.machine_or_person) && s.public === 'public'),
  'house.first_hand_median_h': r1(median(first)),
  'house.first_hand_within_24h': first.filter(h => h <= 24).length,
  'house.pairs': H.length,
  'house.mending_first': cnt(H, p => p.hands_before_mending === 0),
  'house.mending_median_h': r1(median(H.map(p => p.mending_hours))),
  "house.first_signer.the architect's name": cnt(H, p => (p.first_hand_signer ?? p.mending_signer) === "the architect's name"),
  'P146.law_public': cnt(law, s => s.public === 'public'),
  'P146.law_signals': law.length,
  'P148.n_awareness': cnt(evDl, s => s.clock === 'awareness'),
  'P148.n': evDl.length,
  'doubts.length': cnt(S, s => s.doubt),
  'quotes_found': Q.items.filter(i => i.found).length,
};
const get = (o, path) => {
  if (path.endsWith('.length')) { const v = get(o, path.slice(0, -7)); return v.length; }
  if (path in o) return o[path];
  const i = path.indexOf('.'); return get(o[path.slice(0, i)], path.slice(i + 1));
};

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
for (const k in E) ok(get(RES, k) === E[k], `results90.json ${k}: ${get(RES, k)} vs recount ${E[k]}`);
ok(E['quotes_found'] === S.length, 'every quote found');

const browser = await chromium.launch();
for (const width of [1100, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + join(here, 'index.html'));
  await page.waitForTimeout(300);
  ok(errs.length === 0, `${width}: page errors ${errs}`);
  const ks = await page.$$eval('[data-k]', els => els.map(e => [e.dataset.k, e.textContent.trim()]));
  ok(ks.length >= Object.keys(E).length, `${width}: data-k count ${ks.length}`);
  for (const [k, t] of ks) {
    ok(k in E, `${width}: unknown key ${k}`);
    ok(Number(t) === E[k], `${width}: ${k} page ${t} vs recount ${E[k]}`);
  }
  ok(await page.$$eval('#ledger g.row', x => x.length) === S.length, `${width}: ledger rows`);
  const ids = await page.$$eval('#ledger g.row', x => x.map(g => g.dataset.id));
  ok(JSON.stringify([...ids].sort()) === JSON.stringify(S.map(s => s.id).sort()), `${width}: ledger ids`);
  // every mark: shape follows the receiver
  const shapes = await page.$$eval('#ledger g.row', gs => gs.map(g => [g.dataset.id, g.querySelector('circle, path, rect:not(.hit):not([class^="pc-"])')?.getAttribute('class')]));
  const cls = { 'public': 'mk-public', 'public body': 'mk-body', 'own record': 'mk-own', 'other party': 'mk-other' };
  for (const [id, c] of shapes) ok(c === cls[S.find(s => s.id === id).receiver], `${width}: mark of ${id} ${c}`);
  // property cells
  const cells = await page.$$eval('#ledger g.row', gs => gs.map(g => [g.dataset.id, [...g.querySelectorAll('rect[class^="pc-"]')].map(r => r.getAttribute('class'))]));
  for (const [id, c] of cells) {
    const s = S.find(x => x.id === id);
    const want = [s.says_unit ? 'full' : 'none', s.before_harm ? 'full' : 'none',
      s.stranger === 'yes' ? 'full' : s.stranger === 'aggregate only' ? 'half' : 'none',
      s.machine_or_person === 'required' ? 'full' : s.machine_or_person === 'by class' ? 'half' : 'none'];
    const got = []; for (let i = 0; i < c.length; i++) { if (c[i] === 'pc-none' && c[i + 1] === 'pc-half') { got.push('half'); i++; } else got.push(c[i].slice(3)); }
    ok(JSON.stringify(got) === JSON.stringify(want), `${width}: cells of ${id} ${got} vs ${want}`);
  }
  // table by instrument
  const tr = await page.$$eval('#byinst tbody tr', rs => rs.map(r => [r.dataset.inst, [...r.children].map(td => td.textContent)]));
  ok(tr.length === INSTRUMENTS.size, `${width}: table rows`);
  for (const [id, td] of tr) {
    const L = S.filter(s => s.instrument === id), ev = L.filter(EV), d = ev.filter(s => typeof s.deadline_h === 'number').map(s => s.deadline_h);
    ok(Number(td[2]) === L.length && Number(td[3]) === cnt(L, s => s.public === 'public') && Number(td[4]) === ev.length &&
       Number(td[5]) === cnt(L, s => s.says_who) && td[6] === (d.length ? Math.min(...d) + ' h' : '—'), `${width}: table ${id} ${td}`);
  }
  // predictions
  const verdict = async id => (await page.$eval('#' + id, e => e.textContent.trim()));
  ok((await verdict('p146')) === (E['P146.law_public'] < E['P146.law_signals'] / 2 ? 'Held' : 'Failed'), `${width}: P146`);
  ok((await verdict('p147')) === (E['P147.n'] <= 1 ? 'Held' : 'Failed'), `${width}: P147`);
  ok((await verdict('p148')) === (E['P148.n'] >= 4 && E['P148.n_awareness'] > E['P148.n'] / 2 ? 'Held' : 'Failed'), `${width}: P148`);
  // the readout shows the quote of the row chosen
  await page.click('#ledger g.row[data-id="NY4"]');
  const ro = await page.$eval('#readout', e => e.textContent);
  ok(ro.includes(S.find(s => s.id === 'NY4').quote), `${width}: readout quote`);
  // house strip: one row of marks per pair
  ok(await page.$$eval('#house circle', x => x.length) === H.length * 2 - E['house.mending_first'], `${width}: house marks`);
  await page.close();
}
await browser.close();
console.log(`${pass} checks passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
