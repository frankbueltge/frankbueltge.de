// Reading 97 -- read every figure of the fourth state from the rendered page at two widths and recount it from the
// files of the reading, independently of build97.py: Part A from cases96.json and the doors and acts codes97.json adds,
// Part B from the first coding, the blind reading and the final cells, the due dates from each word's date and each
// duty's clock as the text counts it, the quotes from check97.json, the related work from literature97.json, the step's
// predictions from the results of studies 94 to 96. Also compares with results97.json. Studies 94 to 96 stay with
// verify94.mjs, verify95.mjs and verify96.mjs.
// Usage: node verify97.mjs [--shot]   (needs playwright; reads index.html from this folder; --shot writes process/4.png)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const here = dirname(fileURLToPath(import.meta.url));
const J = f => JSON.parse(readFileSync(join(here, f), 'utf8'));
const C96 = J('cases96.json'), R96 = J('results96.json').k, R95 = J('results95.json'), R94 = J('results94.json').predictions;
const CODES = J('codes97.json'), FIRST = J('codes97-first.json').coded, BLIND = J('blind97.json').cells;
const Q = J('check97.json'), LIT = J('literature97.json'), RES = J('results97.json').k;
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
const day = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 864e5;
const iso = n => new Date(n * 864e5).toISOString().slice(0, 10);
const pct = (k, n) => Math.round(k / n * 1000) / 10;
const E = {};

// --- Part A: the acts after the check, with the Studio's case
const LETTER = new Set(['receiver duty', 'sender duty', 'other law']);
const FORCE = new Set(['investigate', 'order', 'proceed']);
const newDoors = CODES.new_doors;
const doors = [...C96.doors, ...newDoors];
const maker = CODES.maker_added.map(a => ({ ...a, door: 'E-MAKER' }));
const acts = [...C96.doors.flatMap(d => d.acts.map(a => ({ ...a, kind: d.kind, door: d.id }))),
  ...newDoors.flatMap(d => d.acts.map(a => ({ ...a, kind: d.kind, door: d.id }))),
  ...maker.map(a => ({ ...a, kind: 'maker' }))];
const added = [...newDoors.flatMap(d => d.acts.map(a => ({ ...a, kind: d.kind }))), ...maker];
E['A97.added'] = added.length;
E['A97.new_doors'] = newDoors.length;
E['owed.choice.added'] = added.filter(a => a.owed === 'choice').length;
E['owed.other_law.added'] = added.filter(a => a.owed === 'other law').length;
E['P167.out'] = added.every(a => a.owed === 'choice' || a.owed === 'other law') ? 'held' : 'failed';
E.acts = acts.length;
E.doors = doors.length;
E.doors_with_acts = C96.doors.filter(d => d.acts.length).length + newDoors.filter(d => d.acts.length).length;
const owed = acts.filter(a => LETTER.has(a.owed));
E['owed.letter'] = owed.length;
E['owed.letter.pct'] = pct(owed.length, acts.length);
E['owed.duty'] = acts.filter(a => a.owed === 'receiver duty' || a.owed === 'sender duty').length;
E['owed.other_law'] = acts.filter(a => a.owed === 'other law').length;
const namedIds = new Set(doors.filter(d => d.named_in_94 && d.named_in_94.length).map(d => d.id));
const nacts = acts.filter(a => namedIds.has(a.door));
E['named.doors'] = namedIds.size;
E['named.acts'] = nacts.length;
E['named.owed'] = nacts.filter(a => LETTER.has(a.owed)).length;
E['named.pct'] = pct(E['named.owed'], E['named.acts']);
const fo = C96.found_outside_count;
E['with_found.acts'] = acts.length + fo.length;
E['with_found.owed'] = owed.length + fo.filter(a => LETTER.has(a.owed)).length;
E['P165.out'] = (E['owed.letter.pct'] <= 25 && E['named.pct'] <= 25 && pct(E['with_found.owed'], E['with_found.acts']) <= 25) ? 'held' : 'failed';
const escape = C96.cases.find(c => c.id === 'escape');
const lag = id => { const d = newDoors.find(x => x.id === id); return day(d.acts.map(a => a.date).filter(Boolean).sort()[0]) - day(escape.first_public); };
E['P162.gov'] = lag('E-GOV'); E['P162.govops'] = lag('E-GOVOPS');
E['P162.out'] = R96['P162.out'] === 'held' && E['P162.gov'] > 0 && E['P162.govops'] > 0 ? 'held' : 'failed';
const bodies = acts.filter(a => a.kind === 'public body' || a.kind === 'legislature');
E['force.bodies'] = bodies.filter(a => FORCE.has(a.code)).length;
E.compels = acts.filter(a => a.compels).length;
E.pressure = E['force.bodies'] - E.compels;
const dl = added.filter(a => a.deadline);
E['clock.receiver_set'] = dl.length;
E['clock.receiver_met'] = dl.filter(a => newDoors.find(d => d.id === a.deadline.on).acts.some(b => b.owed === 'other law' && b.date && b.date <= a.deadline.due)).length;
const st = CODES.studio_case.checked;
E['studio.coded'] = st.filter(c => c.in_96 === 'act').length;
E['studio.note'] = st.filter(c => c.in_96 === 'note').length;
E['studio.not'] = st.filter(c => c.in_96 === 'not coded').length;
// the doors added are public bodies the instruments do not name, and their acts the check never saw
ok(newDoors.every(d => d.kind === 'public body' && !d.named_in_94.length), 'the added doors are unnamed public bodies');
ok(acts.length === R96.acts + added.length, 'acts = the check\'s acts plus the added');

// --- Part B: the maker's door
const cells = CODES.cells, W = CODES.words;
const key = c => c.word + ' ' + c.duty;
const F = Object.fromEntries(FIRST.map(c => [key(c), c.code])), B = Object.fromEntries(BLIND.map(c => [key(c), c.code]));
ok(cells.length === 20 && FIRST.length === 20 && BLIND.length === 20, 'twenty cells in all three codings');
E['B97.cells'] = cells.length;
const pairs = cells.map(c => [F[key(c)], B[key(c)]]);
const n = pairs.length, agree = pairs.filter(([a, b]) => a === b).length;
const ca = {}, cb = {}; for (const [a, b] of pairs) { ca[a] = (ca[a] || 0) + 1; cb[b] = (cb[b] || 0) + 1; }
const pe = [...new Set([...Object.keys(ca), ...Object.keys(cb)])].reduce((s, k) => s + (ca[k] || 0) * (cb[k] || 0), 0) / (n * n);
E['B97.agree'] = agree; E['B97.diffs'] = n - agree; E['B97.kappa'] = ((agree / n - pe) / (1 - pe)).toFixed(2);
E['B97.blind.met'] = BLIND.filter(c => c.code === 'met').length;
const diff = cells.filter(c => F[key(c)] !== B[key(c)]);
E['B97.disagreed_first'] = diff.filter(c => c.code === F[key(c)]).length;
E['B97.disagreed_blind'] = diff.filter(c => c.code === B[key(c)]).length;
ok(diff.every(c => c.why && c.decided !== 'agreed'), 'every difference decided with a reason');
ok(cells.every(c => c.first === F[key(c)] && c.blind === B[key(c)]), 'final cells carry both readings as coded');
// the day the agents reached the internet, as check 96 coded the maker's clock from its technical report
const HARM = C96.maker_clock.find(e => e.what.includes('reach the internet')).date;
ok(W.W3.before && !W.W4.before && W.W3.date < HARM && W.W4.date > HARM, 'words split at the day the agents reached the internet');
const pre = cells.filter(c => W[c.word].date < HARM);
E['pre.cells'] = pre.length;
for (const code of ['met', 'in doubt', 'not met']) {
  E['pre.' + code.replace(' ', '_')] = pre.filter(c => c.code === code).length;
  E['all.' + code.replace(' ', '_')] = cells.filter(c => c.code === code).length;
}
E['P168.out'] = E['pre.met'] === 0 ? 'held' : 'failed';
const pd = pre.filter(c => c.code === 'in doubt');
const isScope = x => x.what.startsWith('whether the model is');
E['pre.doubt.any_sender'] = pd.filter(c => c.conditions.some(x => x.who === 'the sender')).length;
E['pre.doubt.only_sender'] = pd.filter(c => c.conditions.every(x => x.who === 'the sender')).length;
E['pre.doubt.any_notsaid'] = pd.filter(c => c.conditions.some(x => x.who === 'not said')).length;
E['pre.doubt.body_or_court'] = pd.filter(c => c.conditions.some(x => x.who === 'a public body' || x.who === 'a court')).length;
E['all.in_doubt.scope'] = cells.filter(c => c.code === 'in doubt' && c.conditions.some(isScope)).length;
E['P169.out'] = pd.length && E['pre.doubt.only_sender'] === pd.length && E['pre.doubt.body_or_court'] === 0 ? 'held' : 'failed';
E['P169.scope_as_sender.only_sender'] = pd.filter(c => c.conditions.every(x => x.who === 'the sender' || isScope(x))).length;
E['P169.scope_as_sender.out'] = pd.length && E['P169.scope_as_sender.only_sender'] === pd.length ? 'held' : 'failed';
ok(cells.every(c => (c.code === 'in doubt') === (c.conditions.length > 0)), 'conditions named exactly for the cells in doubt');
// due dates, recomputed from the word's date and the clock as each text counts it (days; the AI Act's has none)
const CLOCK = { EU4: null, COP3: 5, CA4: 15, CA5: 1 };
for (const c of cells) {
  const want = c.code !== 'not met' && CLOCK[c.duty] ? iso(day(W[c.word].date) + CLOCK[c.duty]) : null;
  ok(c.due_if_set_off === want, `due date of ${key(c)}: ${c.due_if_set_off}, recount ${want}`);
}
const dues = pre.map(c => c.due_if_set_off).filter(Boolean).sort();
E['pre.earliest_due_before_escape_days'] = day(HARM) - day(dues[0]);
const ED = dues[0];
// the step's twelve predictions
const outs = { P158: R94.P158.held, P159: R94.P159.held, P160: R94.P160.held,
  P161: R95.P161.out === 'held', P162: R95.P162.out === 'held', P163: R95.P163.out === 'held',
  P164: R96['P164.out'] === 'held', P165: R96['P165.out'] === 'held', P166: R96['P166.out'] === 'held',
  P167: E['P167.out'] === 'held', P168: E['P168.out'] === 'held', P169: E['P169.out'] === 'held' };
E['step.predictions'] = Object.keys(outs).length;
E['step.held'] = Object.values(outs).filter(Boolean).length;
E['step.failed_ids'] = Object.keys(outs).filter(p => !outs[p]).join(', ');
// the quote check and the related work
E['Q.n'] = Q.passages.length; E['Q.found'] = Q.passages.filter(p => p.found).length;
E['Q.extraction'] = Q.passages.filter(p => p.via === 'extraction service').length;
ok(E['Q.found'] === E['Q.n'], 'every passage found');
ok(LIT.sources.length >= 3 && LIT.sources.every(s => s.http === 200 && /\((2025|2026)\)/.test(s.cite)), 'at least three current sources of the last two years');
// against the build
for (const k in E) if (k in RES) ok(String(RES[k]) === String(E[k]), `results97 ${k}: ${RES[k]}, recount ${E[k]}`);

const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmt = s => (+s.slice(8, 10)) + ' ' + MON[+s.slice(5, 7) - 1];
const browser = await chromium.launch();
for (const width of [1100, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + join(here, 'index.html'));
  await page.waitForTimeout(300);
  ok((await page.textContent('.kicker')).includes('State 4 of 4, 28 November 2026'), `${width}px: kicker names state 4`);
  const seen = await page.$$eval('[data-k97]', els => els.map(e => [e.dataset.k97, e.textContent.trim()]));
  const keys = new Set();
  for (const [k, v] of seen) { keys.add(k); ok(k in E, `${width}px: unknown key ${k}`); if (k in E) ok(String(E[k]) === v, `${width}px: ${k} shows ${v}, recount ${E[k]}`); }
  // shown only in the corrections table, which is checked below against check 96's figures
  const TABLE_ONLY = ['doors', 'doors_with_acts', 'owed.duty', 'owed.other_law', 'named.doors', 'force.bodies', 'compels', 'pressure'];
  for (const k in E) if (!TABLE_ONLY.includes(k)) ok(keys.has(k), `${width}px: key ${k} not on the page`);
  const dates = await page.$$eval('[data-k97d]', els => els.map(e => [e.dataset.k97d, e.textContent.trim()]));
  for (const [k, v] of dates) ok(v === fmt(k === 'harm_began' ? HARM : k === 'pre.earliest_due' ? ED : ''), `${width}px: date ${k} shows ${v}`);
  // the grid: one button per cell, as coded, the separator after the third word
  const g = await page.$$eval('#grid97 button', bs => bs.map(b => [b.dataset.word + ' ' + b.dataset.duty, b.dataset.code, b.dataset.before, b.textContent]));
  ok(g.length === cells.length, `${width}px: ${g.length} cells drawn`);
  for (const [k, code, before, t] of g) {
    const c = cells.find(x => key(x) === k);
    ok(c && c.code === code, `${width}px: cell ${k} as coded`);
    ok(c && (before === '1') === (W[c.word].date < HARM), `${width}px: cell ${k} on the right side of the harm`);
    ok(c && (!c.due_if_set_off || t.includes(fmt(c.due_if_set_off))), `${width}px: cell ${k} shows its due date`);
  }
  const sepAfter = await page.$eval('#grid97 tr.sep97', tr => tr.previousElementSibling.querySelector('button').dataset.word);
  ok(sepAfter === 'W3', `${width}px: the internet line falls after the third word`);
  await page.click('#grid97 button[data-word="W2"][data-duty="COP3"]');
  const det = await page.textContent('#detail97');
  ok(det.includes(W.W2.quote) && det.includes('no one the text names') && det.includes(fmt('2026-07-02')), `${width}px: a cell opens its word, its conditions and its due date`);
  // the due figure: one diamond per cell in doubt with a clock, filled where due before the harm
  const dm = await page.$$eval('#due97 [data-due]', es => es.map(e => [e.dataset.cell, e.dataset.due, e.getAttribute('class')]));
  const wantD = cells.filter(c => c.code === 'in doubt' && c.due_if_set_off);
  ok(dm.length === wantD.length, `${width}px: ${dm.length} due marks drawn, ${wantD.length} coded`);
  ok(dm.every(([k, due, cl]) => cl === (due < HARM ? 'due pre' : 'due')), `${width}px: due marks filled only before the harm`);
  ok(dm.filter(([, , cl]) => cl === 'due pre').length === dues.filter(x => x < HARM).length, `${width}px: filled marks equal the dues before the harm`);
  ok(await page.$$eval('#due97 [data-word]', e => e.length) === Object.keys(W).length, `${width}px: five words on the axis`);
  // the model, the added acts, the corrections, the sources
  ok(await page.$$eval('#model97 li', e => e.length) === CODES.model_passages.length, `${width}px: model passages listed`);
  ok(await page.$$eval('#added97 tbody tr', e => e.length) === added.length, `${width}px: added acts listed`);
  const corr = await page.$$eval('#corr97 tbody tr', trs => trs.map(t => [...t.cells].map(c => c.textContent)));
  const CK = [['Acts', 'acts', 'acts'], ['Doors', 'doors', 'doors'], ['Doors with acts', 'doors_with_acts', 'doors_with_acts'],
    ['Owed on the letter', 'owed.letter', 'owed.letter'], ['the same, per cent', 'owed.letter.pct', 'owed.letter.pct'],
    ['Owed by a duty', 'owed.duty', 'owed.duty'], ['Owed by other law', 'owed.other_law', 'owed.other_law'],
    ['Acts at the doors an instrument names', 'named.acts', 'named.acts'], ['owed among them', 'named.owed', 'named.owed'],
    ['With the acts found outside the count: acts', 'P165.with_found.acts', 'with_found.acts'], ['owed among them', 'P165.with_found.owed', 'with_found.owed'],
    ['Acts of force by public bodies and legislatures', 'force.bodies', 'force.bodies'], ['that compel', 'compels', 'compels'], ['of pressure', 'pressure', 'pressure']];
  ok(corr.length === CK.length, `${width}px: corrections table has ${corr.length} rows`);
  corr.forEach(([lab, a, b], i) => ok(CK[i] && lab === CK[i][0] && a === String(R96[CK[i][1]]) && b === String(E[CK[i][2]]), `${width}px: correction ${lab}: ${a} to ${b}`));
  ok(await page.$$eval('#sources97 tbody tr', e => e.length) === Object.keys(Q.texts).length, `${width}px: sources listed`);
  ok(!errs.length, `${width}px: page errors ${errs.join(' | ')}`);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= width, `${width}px: page scrolls sideways (${sw})`);
  ok(await page.$$eval('[style]', e => e.length) === 0, `${width}px: no style attribute`);
  if (process.argv.includes('--shot') && width === 1100) {
    await page.click('#grid97 button[data-word="W1"][data-duty="COP3"]');
    await page.screenshot({ path: join(here, 'process', '4.png'), fullPage: true });
  }
  await page.close();
}
await browser.close();
console.log(`verify97: ${pass} checks passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
