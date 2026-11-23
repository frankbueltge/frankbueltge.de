// Check 92 -- read every state-3 figure (data-k3) from the rendered page at two widths and recount it from the data
// files, independently of build92.py and agree92.py: Cohen's kappa from signals90.json and blind92.json, the
// reconciliation from codes92.json, the traces from moved91.json, blind92-traces.json and traces92.json, the house
// from window92.json, the wiki case from its dates; compare with results92.json; check the check's tables, lists,
// predictions and the corrected wiki line; then run verify91.mjs, which runs verify90.mjs.
// Usage: node verify92.mjs   (needs playwright; reads index.html from this folder)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const here = dirname(fileURLToPath(import.meta.url));
const J = f => JSON.parse(readFileSync(join(here, f), 'utf8'));
const S90 = J('signals90.json').signals, BL = J('blind92.json').readers.flatMap(r => r.signals);
const CODES = J('codes92.json'), TR = J('traces92.json'), MV = J('moved91.json'), BT = J('blind92-traces.json').signals;
const W = J('window92.json').rows, RES = J('results92.json'), Q = J('quotes92.json').items;
const one = Object.fromEntries(S90.map(s => [s.id, s])), two = Object.fromEntries(BL.map(s => [s.id, s]));
const ids = S90.map(s => s.id);
const BEFORE = ['before deployment', 'schedule', 'event short of harm'], EV = ['event short of harm', 'harm'];
const nd = v => (v === null || v === undefined || v === 'none') ? 'none' : (v === 'prompt' || v === 'prompt, no number') ? 'prompt' : Number(v);
const pick = (s, c, blind) => c === 'before_harm' ? (blind ? BEFORE.includes(s.trigger) : s.before_harm) : c === 'deadline' ? nd(s.deadline_h) : s[c];
const r2 = x => Math.round(x * 100) / 100;
function kappa(a, b) {
  const n = a.length, po = a.filter((x, i) => x === b[i]).length / n;
  const ca = {}, cb = {}; a.forEach(x => ca[x] = (ca[x] || 0) + 1); b.forEach(x => cb[x] = (cb[x] || 0) + 1);
  const pe = [...new Set([...a, ...b])].reduce((t, k) => t + (ca[k] || 0) * (cb[k] || 0), 0) / (n * n);
  return [pe < 1 ? r2((po - pe) / (1 - pe)) : null, Math.round(po * 1000) / 1000];
}
const median = a => { const b = [...a].sort((x, y) => x - y), n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };
const cnt = (rows, f) => rows.filter(f).length;
const days = (a, b) => Math.round((Date.parse(b) - Date.parse(a)) / 864e5);

const E = {};
// part A: agreement, recounted from the two codings
const CODES_A = ['kind', 'unit', 'trigger', 'before_harm', 'receiver', 'public', 'machine_or_person', 'stranger', 'clock', 'deadline'];
let ndiff = 0;
for (const c of CODES_A) {
  const a = ids.map(i => pick(one[i], c, false)), b = ids.map(i => pick(two[i], c, true));
  const [k, po] = kappa(a, b);
  E[`A.agreement.${c}.kappa`] = k; E[`A.agreement.${c}.raw`] = po;
  E[`A.agreement.${c}.same`] = a.filter((x, i) => x === b[i]).length; E[`A.agreement.${c}.of`] = ids.length;
  ndiff += a.filter((x, i) => x !== b[i]).length;
}
E['A.disagreements'] = ndiff;
for (const k of ['first', 'blind', 'neither']) E[`A.kept_${k}`] = cnt(CODES.rulings, r => r.kept === k);
// every ruling's final code is what codes92.json's signals carry
const fin = Object.fromEntries(CODES.signals.map(s => [s.id, s]));
E['A.changed_signals.length'] = ids.filter(i => ['kind', 'unit', 'trigger', 'receiver', 'public', 'stranger', 'clock', 'deadline_h', 'machine_or_person'].some(c => fin[i][c] !== one[i][c])).length;
for (const r of ['public body', 'other party', 'own record', 'public']) E[`A.final.receiver.${r}`] = cnt(CODES.signals, s => s.receiver === r);
for (const r of ['missed', 'folded', 'out']) E[`A.extras_ruling.${r}`] = cnt(CODES.extras, x => x.ruling === r);
E['P152.unit'] = E['A.agreement.unit.kappa'];
const p152 = ['receiver', 'public', 'trigger', 'unit', 'machine_or_person'].every(c => E[`A.agreement.${c}.kappa`] >= 0.6);
// part B: the traces read twice
const due = MV.signals.filter(s => s.due === 'due'), bt = Object.fromEntries(BT.map(s => [s.id, s]));
const a1 = due.map(s => s.moved), b1 = due.map(s => bt[s.id].strict.moved), b2 = due.map(s => bt[s.id].broad.moved);
const [kb, pob] = kappa(a1, b1);
E['B.B1.kappa'] = kb; E['B.B1.same'] = a1.filter((x, i) => x === b1[i]).length; E['B.B1.of'] = due.length;
E['B.B1.moved_blind_strict'] = cnt(b1, x => x !== 'no trace found'); E['B.B1.moved_blind_broad'] = cnt(b2, x => x !== 'no trace found');
E['B.new_traces'] = TR.new_traces.length;
// hosts recounted from study 91's traces and the new ones: a signal's host is the most durable of all its traces
const DUR = ['intergovernmental', 'public body', 'third party', 'sender'];
const moved = due.filter(s => s.moved !== 'no trace found');
const hostOf = s => { const t = [...s.traces, ...TR.new_traces.filter(x => x.signal === s.id)];
  const h = new Set(t.map(x => x.host)); if (t.some(x => x.instance)) h.add('sender'); return [...h].sort((x, y) => DUR.indexOf(x) - DUR.indexOf(y)); };
for (const h of DUR) E[`B.host.${h}`] = cnt(moved, s => hostOf(s)[0] === h);
E['B.on_public_body_site.length'] = cnt(moved, s => hostOf(s).includes('public body'));
const evMoved = moved.filter(s => EV.includes(s.trigger));
E['B.P149.listed_after_outside'] = cnt(evMoved, s => bt[s.id].alarm !== 'listed after');
E['P153.strict.length'] = E['B.on_public_body_site.length'];
// every new trace was opened and its passage found in the page as fetched
const quotesOk = TR.new_traces.every(t => Q.some(q => q.url === t.url && q.quote === t.quote && q.found));
// part C: the house by commit
const cat = r => r.closed_by_mending ? 'closed by its own mending' : r.earliest_by_commit;
for (const k of ['before', 'at', 'lands with it', 'after', 'closed by its own mending']) E[`C.earliest.${k}`] = cnt(W, r => cat(r) === k);
E['C.mend.before'] = cnt(W, r => r.mending_by_commit === 'before');
E['C.deeds'] = W.length; E['C.remeasured'] = W.length; E['C.remeasured_agree'] = cnt(W, r => r.remeasured_with_exclusion === r.closed_commit);
E['C.first_hours_shifted'] = cnt(W, r => !r.first_is_mending && Math.abs(r.first_hours_git - r.first_hours_carried) > 0.06);
E['C.mending_hours_max_diff'] = r2(Math.max(...W.map(r => Math.abs(r.mending_hours_git - r.mending_hours_carried))));
E['C.closed_median_h'] = r2(median(W.map(r => r.closed_hours_git)));
E['C.no_exclusion_median_h'] = r2(median(W.map(r => r.no_exclusion_hours)));
E['C.no_exclusion_earlier'] = cnt(W, r => r.no_exclusion_earlier);
E['P154.earlier'] = E['C.no_exclusion_earlier']; E['P154.of'] = W.length;
// the wiki case, from its first post on the wiki
const C = MV.cases.find(c => c.id === 'wiki'), began = RES.wiki.began;
E['wiki.delays_days.began_to_first_public'] = days(began, C.first_public.date);
E['wiki.delays_days.began_to_noticed'] = days(began, C.noticed.date);
E['wiki.delays_days.lasted'] = days(began, C.ended);

const get = (o, path) => {
  if (path.endsWith('.length')) return get(o, path.slice(0, -7)).length;
  if (o !== null && typeof o === 'object' && path in o) return o[path];
  const i = path.indexOf('.'); if (i < 0) return undefined; return get(o[path.slice(0, i)], path.slice(i + 1));
};
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
for (const k in E) ok(get(RES, k) === E[k], `results92.json ${k}: ${get(RES, k)} vs recount ${E[k]}`);
ok(RES.P152.held === p152 && RES.P153.held === (E['P153.strict.length'] === 0) && RES.P154.held === (E['P154.earlier'] > E['P154.of'] / 2), 'verdicts in results92.json');
ok(quotesOk, 'every new trace opened and its passage found');
ok(began === '2026-05-24' && C.began === '2026-05-11', 'wiki: corrected first day beside the second state\'s');

const browser = await chromium.launch();
for (const width of [1100, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + join(here, 'index.html'));
  await page.waitForTimeout(300);
  ok(errs.length === 0, `${width}: page errors ${errs}`);
  ok(await page.evaluate(() => document.documentElement.scrollWidth) <= width, `${width}: no sideways scroll`);
  const ks = await page.$$eval('[data-k3]', els => els.map(e => [e.dataset.k3, e.textContent.trim()]));
  ok(ks.length >= 30, `${width}: data-k3 count ${ks.length}`);
  for (const [k, t] of ks) {
    ok(k in E, `${width}: unknown key ${k}`);
    ok(Number(t) === E[k], `${width}: ${k} page ${t} vs recount ${E[k]}`);
  }
  // the agreement table: one row per code, kappa as recounted
  const ag = await page.$$eval('#agree tbody tr', rs => rs.map(r => [r.dataset.code, [...r.children].map(td => td.textContent)]));
  ok(ag.length === CODES_A.length, `${width}: agreement rows`);
  for (const [c, td] of ag) ok(Number(td[1]) === E[`A.agreement.${c}.kappa`] && td[3] === `${E[`A.agreement.${c}.same`]} of 51`, `${width}: agreement ${c} ${td}`);
  ok(await page.$$eval('#recon tbody tr', x => x.length) === E['A.disagreements'], `${width}: reconciliation rows`);
  ok(await page.$$eval('#extras li', x => x.length) === CODES.extras.length, `${width}: extras`);
  const nl = await page.$$eval('#newtraces li', ls => ls.map(l => l.textContent));
  ok(nl.length === TR.new_traces.length && TR.new_traces.every(t => nl.some(x => x.includes(t.quote))), `${width}: new traces`);
  const hc = await page.$$eval('#housec tbody tr', rs => rs.map(r => [r.dataset.cat, r.children[1].textContent]));
  ok(hc.length === 5 && hc.every(([k, n]) => Number(n) === E[`C.earliest.${k}`]), `${width}: house by commit`);
  const verdict = async id => (await page.$eval('#' + id, e => e.textContent.trim()));
  ok((await verdict('p152')) === (p152 ? 'Held' : 'Failed'), `${width}: P152`);
  ok((await verdict('p153')) === (E['P153.strict.length'] === 0 ? 'Held' : 'Failed'), `${width}: P153`);
  ok((await verdict('p154')) === (E['P154.earlier'] > E['P154.of'] / 2 ? 'Held' : 'Failed'), `${width}: P154`);
  ok((await page.$eval('#case', e => e.textContent)).includes('24 May · first post on this wiki'), `${width}: wiki correction on the figure`);
  // a row's readout carries the second reading
  await page.click('#ledger g.row[data-id="G7-3"]');
  const ro = await page.$eval('#readout', e => e.textContent);
  ok(ro.includes('The check, 23 November 2026') && ro.includes(CODES.rulings.find(r => r.id === 'G7-3').reason), `${width}: readout second reading`);
  await page.close();
}
await browser.close();
console.log(`state 3: ${pass} checks passed, ${fail} failed`);
let v91 = '';
try { v91 = execFileSync('node', [join(here, 'verify91.mjs')], { encoding: 'utf8' }); } catch (e) { v91 = String(e.stdout) + ' (exit ' + e.status + ')'; fail++; }
console.log(v91.trim());
process.exit(fail ? 1 : 0);
