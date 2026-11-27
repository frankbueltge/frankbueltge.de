// Check 96 -- read every figure of the third state from the rendered page at two widths and recount it from the
// files of the check, independently of build96.py and agree96.py: the agreement from the blind readings and the first
// codes, the final counts from cases96.json, the duty cells from duties96.json, the quotes from check96.json. Also
// compares with results96.json. Studies 94 and 95 stay with verify94.mjs and verify95.mjs.
// Usage: node verify96.mjs [--shot]   (needs playwright; reads index.html from this folder; --shot writes process/3.png)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const here = dirname(fileURLToPath(import.meta.url));
const J = f => JSON.parse(readFileSync(join(here, f), 'utf8'));
const C = J('cases96.json'), DUT = J('duties96.json').cells, Q = J('check96.json'), RES = J('results96.json');
const CODES = J('codes96.json'), PAIRS = J('pairs96.json'), F95 = J('cases95.json'), R94 = J('receivers94.json').receivers;
const SEARCH = J('search96.json').queries, AT = J('atelier-reasons96.json').reasons, BD = J('blind96-D.json').items;
const blindA = Object.fromEntries([...J('blind96-A1.json').signals, ...J('blind96-A2.json').signals].map(s => [s.id, s]));
const blindB = Object.fromEntries([...J('blind96-B1.json').doors, ...J('blind96-B2.json').doors].map(d => [d.id, d]));
const day = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 864e5;
const pct = (k, n) => String(Math.round(k / n * 1000) / 10);
const f2 = x => x.toFixed(2);

// --- agreement, recomputed from the readings
function kappa(pairs) {
  const n = pairs.length, agree = pairs.filter(([a, b]) => a === b).length;
  const ca = {}, cb = {};
  for (const [a, b] of pairs) { ca[a] = (ca[a] || 0) + 1; cb[b] = (cb[b] || 0) + 1; }
  const pe = [...new Set([...Object.keys(ca), ...Object.keys(cb)])].reduce((s, k) => s + (ca[k] || 0) * (cb[k] || 0), 0) / (n * n);
  return { n, agree, k: pe === 1 ? null : (agree / n - pe) / (1 - pe) };
}
const ACTS = ['acknowledge', 'investigate', 'order', 'pass_on', 'tell_public', 'tell_public_aggregate'];
const nact = v => { v = (v || 'none').toLowerCase(); return v.startsWith('reco') ? 'none' : v; };
const ndl = v => v === null || v === undefined ? 'null' : typeof v === 'number' ? String(Math.trunc(v)) : String(v).toLowerCase();
const cells = [], sf = [], rf = [], party = [], dls = [];
for (const r of R94) {
  const b = blindA[r.id];
  for (const a of ACTS) {
    const x = nact(r.acts[a].v), y = nact((b.acts[a] || {}).v);
    cells.push([x, y]);
    if (x !== 'none' && y !== 'none') dls.push([ndl(r.acts[a].deadline_h), ndl((b.acts[a] || {}).deadline_h)]);
  }
  sf.push([r.sender_failure.v, (b.sender_failure || {}).v || 'none']);
  rf.push([r.receiver_failure.v, (b.receiver_failure || {}).v || 'none']);
  party.push([r.receiver_party, b.receiver_party]);
}
const kA = kappa(cells), kS = kappa(sf), kR = kappa(rf), kP = kappa(party), kD = kappa(dls);
const firstActs = Object.fromEntries(F95.doors.flatMap(d => d.acts.map((a, i) => [`${d.id}#${i}`, a])));
const blindActs = Object.fromEntries(Object.entries(blindB).flatMap(([id, d]) => (d.acts || []).map((a, i) => [`${id}#${i}`, a])));
const owed2 = v => ['receiver duty', 'sender duty', 'other law'].includes(v) ? 'owed' : 'not owed';
const pr = PAIRS.pairs.map(p => [firstActs[p.first], blindActs[p.blind]]);
const kCls = kappa(pr.map(([a, b]) => [a.code, b.code])), kO5 = kappa(pr.map(([a, b]) => [a.owed, b.owed]));
const kO2 = kappa(pr.map(([a, b]) => [owed2(a.owed), owed2(b.owed)]));
const onlyBlind = Object.keys(blindActs).filter(k => !PAIRS.pairs.some(p => p.blind === k));
const onlyFirst = Object.keys(firstActs).filter(k => !PAIRS.pairs.some(p => p.first === k));
const recPairs = F95.doors.map(d => {
  const b = blindB[d.id]; const ds = b ? (b.received || []).map(r => r.date).filter(Boolean).sort() : [];
  return [d.received.date || 'null', ds[0] || 'null'];
});
const kRec = kappa(recPairs);
const reasonsSame = AT.filter((r, i) => (r.circumstance ? 'circumstance' : 'class') === BD.find(x => x.item === `R${i + 1}`).code).length;

// --- the final record
const doors = C.doors;
const acts = doors.flatMap(d => d.acts.map(a => ({ ...a, door: d.id, kind: d.kind, case: d.case, named: d.named_in_94.length > 0 })));
const LETTER = new Set(['receiver duty', 'sender duty', 'other law']), DUTY = new Set(['receiver duty', 'sender duty']);
const FORCE = new Set(['investigate', 'order', 'proceed']);
const letter = acts.filter(a => LETTER.has(a.owed)), duty = acts.filter(a => DUTY.has(a.owed));
const named = acts.filter(a => a.named), namedLetter = named.filter(a => LETTER.has(a.owed));
const contested = letter.filter(a => (a.doubt || '').startsWith('contested'));
const fo = C.found_outside_count;
const bodies = acts.filter(a => a.kind === 'public body' || a.kind === 'legislature');
const force = bodies.filter(a => FORCE.has(a.code)), compels = acts.filter(a => a.compels);
const boundOf = d => d.received.date ? d.received.bound : 'none';
const five = ['acknowledge', 'investigate', 'order', 'pass_on', 'tell_public'];
const rowsDuty = CODES.receivers.filter(r => five.some(a => r.acts[a].v === 'duty'));
const pbDuty = rowsDuty.filter(r => r.receiver === 'public body');
const cases = Object.fromEntries(C.cases.map(c => [c.id, c]));
const firstActOf = d => d.first_act_through_coalition ? d.first_act_through_coalition.date : (d.acts.map(a => a.date).filter(Boolean).sort()[0] || null);
const after = Object.fromEntries(doors.filter(d => d.kind === 'public body' || d.kind === 'legislature')
  .map(d => [d.id, firstActOf(d) === null ? null : day(firstActOf(d)) - day(cases[d.case].first_public)]));
const em = doors.find(d => d.id === 'E-MAKER');
const word = em.acts.filter(a => a.code === 'tell_public' && a.date).map(a => a.date).sort()[0];
const ev = w => C.maker_clock.find(e => e.what.includes(w)).date;
const dc = code => DUT.filter(c => c.code === code).length;
const bodiesDated = doors.filter(d => (d.kind === 'public body' || d.kind === 'legislature') && d.acts.length && d.received.date);
const p165 = letter.length / acts.length <= 0.25 && namedLetter.length / named.length <= 0.25 ? 'held' : 'failed';
const p166 = dc('met') === 0 ? 'held' : 'failed';
const p164 = kA.k >= 0.6 ? 'held' : 'failed';

const E = {
  'A.cells': kA.n, 'A.agree': kA.agree, 'A.kappa': f2(kA.k), 'A.sender.n': kS.n, 'A.sender.agree': kS.agree, 'A.sender.kappa': f2(kS.k),
  'A.recv.n': kR.n, 'A.recv.agree': kR.agree, 'A.recv.kappa': f2(kR.k), 'A.party.n': kP.n, 'A.party.agree': kP.agree,
  'A.party.kappa': f2(kP.k), 'A.dl.n': kD.n, 'A.dl.agree': kD.agree, 'A.dl.kappa': f2(kD.k),
  'A.diffs': cells.filter(([a, b]) => a !== b).length + sf.filter(([a, b]) => a !== b).length + rf.filter(([a, b]) => a !== b).length
    + party.filter(([a, b]) => a !== b).length + dls.filter(([a, b]) => a !== b).length,
  'A.moved': CODES.decisions.filter(d => d.final !== d.first).length,
  'A.P158.n': rowsDuty.length, 'A.pb_duty': pbDuty.length, 'A.P158.out': rowsDuty.length <= 3 ? 'held' : 'failed',
  'B.first': Object.keys(firstActs).length, 'B.blind': Object.keys(blindActs).length, 'B.paired': PAIRS.pairs.length,
  'B.union': PAIRS.pairs.length + onlyFirst.length + onlyBlind.length,
  'B.unit': f2(PAIRS.pairs.length / (PAIRS.pairs.length + onlyFirst.length + onlyBlind.length)),
  'B.class.kappa': f2(kCls.k), 'B.owed5.agree': kO5.agree, 'B.owed5.kappa': f2(kO5.k), 'B.owed2.kappa': f2(kO2.k),
  'B.rec.agree': kRec.agree, 'B.rec.n': kRec.n, 'B.rec.kappa': f2(kRec.k),
  'B.accepted': Object.values(PAIRS.only_blind).filter(v => v.startsWith('accepted')).length,
  'B.declined': Object.values(PAIRS.only_blind).filter(v => v.startsWith('declined')).length, 'B.only_first': onlyFirst.length,
  'acts': acts.length, 'held': acts.filter(a => a.check === 'held').length, 'corrected': acts.filter(a => a.check === 'corrected').length,
  'added': acts.filter(a => a.check === 'added').length, 'removed': C.removed.length,
  'doors': doors.length, 'doors_with_acts': doors.filter(d => d.acts.length).length,
  'owed.letter': letter.length, 'owed.duty': duty.length, 'owed.power': acts.filter(a => a.owed === 'power').length,
  'owed.letter.pct': pct(letter.length, acts.length),
  'named.doors': doors.filter(d => d.named_in_94.length).length, 'named.acts': named.length, 'named.owed': namedLetter.length,
  'named.pct': pct(namedLetter.length, named.length),
  'P165.no_contested.owed': letter.length - contested.length, 'P165.no_contested.acts': acts.length - contested.length,
  'found_outside': fo.length, 'P165.with_found.owed': letter.length + fo.filter(a => LETTER.has(a.owed)).length,
  'P165.with_found.acts': acts.length + fo.length, 'P165.out': p165,
  'duty.periodic': duty.filter(a => a.periodic).length, 'duty.doubt': duty.filter(a => a.doubt).length,
  'duty.clean': duty.filter(a => !a.doubt && !a.periodic).length,
  'force.bodies': force.length, 'compels': compels.length, 'pressure': force.length - compels.length,
  'compels.under_ai': compels.filter(a => a.owed === 'power' || a.owed === 'receiver duty').length,
  'rec.on': doors.filter(d => boundOf(d) === 'on').length, 'rec.by_act': doors.filter(d => boundOf(d) === 'by act').length,
  'rec.by': doors.filter(d => boundOf(d) === 'by').length, 'rec.none': doors.filter(d => boundOf(d) === 'none').length,
  'lags.measured': doors.filter(d => d.lag_days !== null).length,
  'rec.bodies_dated': bodiesDated.length, 'rec.bodies_by_act': bodiesDated.filter(d => d.received.bound === 'by act').length,
  'clock.inside': day(word) - day(em.received.date), 'clock.outside': day(word) - day(em.received_outside.date),
  'clock.earlier_to_inside': day(em.received.date) - day(em.earlier_word.date),
  'P162.wiki': Math.min(...Object.entries(after).filter(([i, v]) => i.startsWith('W-') && v !== null).map(([, v]) => v)),
  'P162.escape': Math.min(...Object.entries(after).filter(([i, v]) => i.startsWith('E-') && v !== null).map(([, v]) => v)),
  'P162.al': after['E-AL'], 'P162.out': Object.values(after).every(v => v === null || v > 0) ? 'held' : 'failed',
  'P163.consequences': doors.filter(d => d.consequence !== 'none').length,
  'C.cells': DUT.length, 'C.met': dc('met'), 'C.done': dc('done, set-off or time unknown'), 'C.declared': dc('declared not set off'),
  'C.missed': dc('missed'), 'C.notdue': dc('not due'), 'C.unknowable': dc('unknowable'), 'P166.out': p166,
  'C.queries': SEARCH.length, 'C.opened': new Set(SEARCH.flatMap(q => q.opened)).size,
  'D.same': reasonsSame, 'D.of': AT.length,
  'Q.n': Q.passages.length, 'Q.found': Q.passages.filter(p => p.found).length,
  'Q.extraction': Q.passages.filter(p => p.via === 'extraction service').length, 'Q.excerpt': Q.passages.filter(p => p.via === 'search excerpt').length,
  'P164.out': p164, 'predictions_held': [p164, p165, p166].filter(x => x === 'held').length,
};
let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
// build and recount must agree
for (const k in E) ok(k in RES.k && String(RES.k[k]) === String(E[k]), `results96.json ${k}: ${RES.k[k]} vs recount ${E[k]}`);
ok(Q.passages.every(p => p.found) && Q.over_40_words.length === 0, 'every passage found, none over 40 words');
for (const d of doors) {
  const f = firstActOf(d), b = d.received.bound;
  const want = d.received.date && f && (b === 'on' || b === 'by') ? day(f) - day(d.received.date) : null;
  ok(d.lag_days === want, `${d.id}: lag_days ${d.lag_days}, recount ${want}`);
  ok(d.consequence === 'none', `${d.id}: consequence coded none`);
}
for (const c of DUT) ok(c.passages.length > 0 || (c.search96 || []).length > 0, `duty ${c.case} ${c.signal}: a passage or a search`);
ok(JSON.stringify(C.found_outside_count.map(a => a.search).sort()) === JSON.stringify([1, 2]), 'acts found outside the count name their search');

const multiset = d => d.acts.map(a => a.code + '|' + a.owed + '|' + a.check).sort();
const recvWant = d => (d.received.date ? 1 : 0) + (d.received_outside ? 1 : 0) + (d.earlier_word ? 1 : 0);
// sources the check added: every text it read, and every page its search opened, that study 95 did not list
const S95 = J('sources95.json').sources;
const ADDED = new Set([...Object.keys(Q.texts), ...SEARCH.flatMap(q => q.opened)].filter(k => !(k in S95)));
const browser = await chromium.launch();
for (const width of [1100, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + join(here, 'index.html'));
  await page.waitForTimeout(300);
  ok((await page.textContent('.kicker')).includes('State 3 of 4, 27 November 2026'), `${width}px: kicker names state 3`);
  const seen = await page.$$eval('[data-k96]', els => els.map(e => [e.dataset.k96, e.textContent.trim()]));
  const keys = new Set();
  for (const [k, v] of seen) { keys.add(k); ok(k in E, `${width}px: unknown key ${k}`); if (k in E) ok(String(E[k]) === v, `${width}px: ${k} shows ${v}, recount ${E[k]}`); }
  for (const k in E) ok(keys.has(k), `${width}px: key ${k} not on the page`);
  // the acts after the check: one row per door, one mark per act, undated acts in their own column
  const rows = await page.$$eval('#acts96 tr.r96', trs => trs.map(t => [t.dataset.id,
    [...t.querySelectorAll('.mk')].map(m => m.dataset.code + '|' + m.dataset.owed + '|' + m.dataset.check).sort(),
    t.querySelectorAll('td.nd .mk').length, t.querySelectorAll('[data-recv]').length]));
  ok(rows.length === doors.length, `${width}px: ${rows.length} rows drawn`);
  ok(rows.reduce((n, r) => n + r[1].length, 0) === acts.length, `${width}px: marks drawn equal the acts`);
  for (const [id, ms, nd, rv] of rows) {
    const d = doors.find(x => x.id === id);
    ok(d && JSON.stringify(ms) === JSON.stringify(multiset(d)), `${width}px: marks of ${id}`);
    ok(d && nd === d.acts.filter(a => !a.date).length, `${width}px: undated acts of ${id} in the no-date column`);
    ok(d && rv === recvWant(d), `${width}px: receipt marks of ${id}`);
  }
  const cls = await page.$$eval('#acts96 .mk', ms => ms.map(m => [m.dataset.owed, m.dataset.check, m.getAttribute('class'), !!m.querySelector('.cbar')]));
  const want = { 'receiver duty': 'duty', 'sender duty': 'duty', 'power': 'law', 'other law': 'law', 'choice': 'choice' };
  ok(cls.every(([o, c, k, bar]) => k === 'mk ' + want[o] + ' ck-' + c && bar === (c === 'corrected')), `${width}px: each mark drawn by what owed it and by the check`);
  for (const [g, n] of [['held', E.held], ['corrected', E.corrected], ['added', E.added], ['owed', E['owed.letter']], ['compels', E.compels], ['all', E.acts]]) {
    await page.click(`#ctl96 button[data-g="${g}"]`);
    const lit = await page.$$eval('#acts96 .mk', ms => ms.filter(m => !m.classList.contains('dim')).length);
    ok(lit === n, `${width}px: filter ${g} shows ${lit}, expected ${n}`);
  }
  await page.click('#acts96 tr.r96[data-id="E-AL"] th');
  const det = await page.textContent('#detail96');
  ok(det.includes('Alabama co-signed the coalition') && det.includes('Compels'), `${width}px: E-AL detail shows its first act and the subpoena`);
  // the name stays while the days scroll
  const st = await page.evaluate(() => {
    const sc = document.querySelector('#scroll96'); sc.scrollLeft = 400;
    const th = document.querySelector('#acts96 tr.r96 th.nm').getBoundingClientRect(), c = sc.getBoundingClientRect();
    const svg = document.querySelector('#acts96 tr.r96 td.tl svg').getBoundingClientRect();
    return { scrolled: sc.scrollLeft, thLeft: th.left - c.left, overflow: sc.scrollWidth > sc.clientWidth, svgLeft: svg.left - c.left };
  });
  if (st.overflow) ok(st.scrolled > 0 && Math.abs(st.thLeft) <= 2 && st.svgLeft < 0, `${width}px: name column holds while scrolled ${JSON.stringify(st)}`);
  else ok(width >= 1100, `${width}px: the acts figure should scroll at this width`);
  if (width === 390) ok(st.overflow, '390px: the acts figure scrolls inside its frame');
  await page.evaluate(() => { document.querySelector('#scroll96').scrollLeft = 0; });
  // the duty cells
  const dcells = await page.$$eval('#duty96 button', bs => bs.map(b => [b.dataset.case, b.dataset.signal, b.dataset.code]));
  ok(dcells.length === DUT.length, `${width}px: ${dcells.length} duty cells drawn`);
  ok(JSON.stringify(dcells.map(x => x.join('|')).sort()) === JSON.stringify(DUT.map(c => [c.case, c.signal, c.code].join('|')).sort()), `${width}px: duty cells as coded`);
  const ce = DUT.find(c => c.case === 'escape' && c.signal === 'CA4');
  await page.click('#duty96 button[data-case="escape"][data-signal="CA4"]');
  ok((await page.textContent('#detail96d')).includes('did not meet the threshold'), `${width}px: a duty cell opens its passages (${ce.code})`);
  // the maker's clocks, the reasons, the sources
  ok(await page.$$eval('#clock96 [data-ev]', e => e.length) === C.maker_clock.length, `${width}px: clock events drawn`);
  ok(await page.$$eval('#clocklist96 li', e => e.length) === C.maker_clock.length, `${width}px: clock events listed`);
  ok(await page.$$eval('#reasons96 tbody tr', e => e.length) === AT.length, `${width}px: reasons listed`);
  ok(await page.$$eval('#sources96 tbody tr', e => e.length) === ADDED.size, `${width}px: added sources listed`);
  ok(!errs.length, `${width}px: page errors ${errs.join(' | ')}`);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= width, `${width}px: page scrolls sideways (${sw})`);
  ok(await page.$$eval('[style]', e => e.length) === 0, `${width}px: no style attribute`);
  if (process.argv.includes('--shot') && width === 1100) {
    await page.click('#acts96 tr.r96[data-id="E-CAAG"] th');
    await page.click('#duty96 button[data-case="wiki"][data-signal="EU4"]');
    await page.screenshot({ path: join(here, 'process', '3.png'), fullPage: true });
  }
  await page.close();
}
await browser.close();
console.log(`verify96: ${pass} checks passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
