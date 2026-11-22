// Study 91 -- read every state-2 figure (data-k2) and figure from the rendered page at two widths and recount it from
// moved91.json, house91.json, window91*.json, archive91.json, quotes91.json and search91.json, independently of
// build91.py; compare with results91.json; then run verify90.mjs, which checks the state-1 figures on the same page.
// Usage: node verify91.mjs   (needs playwright; reads index.html from this folder)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { execFileSync } from 'node:child_process';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const here = dirname(fileURLToPath(import.meta.url));
const J = f => JSON.parse(readFileSync(join(here, f), 'utf8'));
const MV = J('moved91.json'), S = MV.signals, H = J('house91.json').pairs, RES = J('results91.json');
const W12 = J('window91.json'), WALL = J('window91-all.json'), Q = J('quotes91.json'), A = J('archive91.json').items;
const SEARCH = J('search91.json');

const EV = s => s.trigger === 'event short of harm' || s.trigger === 'harm';
const cnt = (rows, f) => rows.filter(f).length;
const median = a => { const b = [...a].sort((x, y) => x - y), n = b.length; return n % 2 ? b[(n - 1) / 2] : (b[n / 2 - 1] + b[n / 2]) / 2; };
const DUR = ['intergovernmental', 'public body', 'third party', 'sender'];
const day = d => Date.UTC(+d.slice(0, 4), +d.slice(5, 7) - 1, +d.slice(8, 10));
const days = (a, b) => Math.round((day(b) - day(a)) / 864e5);
// recount each signal's host and archive status from its traces and the archive's answers
const archived = (id, url) => { const a = A.find(x => x.item === id && x.url === url); return !!(a && a.captured && a.closest <= '20261121235959'); };
for (const s of S) {
  const t = [...s.traces].sort((a, b) => a.date.localeCompare(b.date));
  const hosts = t.length ? [t[0].host, ...(t[0].instance ? ['sender'] : [])] : [];
  s._hosts = [...new Set(hosts)].sort((a, b) => DUR.indexOf(a) - DUR.indexOf(b));
  s._host = s._hosts[0] ?? null;
  s._moved = s.due === 'due' && s.moved !== 'no trace found';
  for (const tr of s.traces) tr._arch = archived(s.id, tr.url);
}
const due = S.filter(s => s.due === 'due'), moved = S.filter(s => s._moved), cp = moved.filter(s => s.moved === 'content public');
const senderOnly = cp.filter(s => s._hosts.length === 1 && s._hosts[0] === 'sender');
const firm = cp.filter(s => !([...s.traces].sort((a, b) => a.date.localeCompare(b.date))[0].doubt));
const C = MV.cases[0];
const TOL = 0.05;
const mend = p => p.closed_by_mending ? 'at' : (p.state === 'mended inside the window' ? 'before' : 'after');
const earliest = p => p.first_hand_hours === null ? mend(p) :
  (p.first_hand_hours + TOL < p.closed_hours ? 'before' : (p.first_hand_hours - TOL > p.closed_hours ? 'after' : 'at'));
const allTr = S.flatMap(s => s.traces.map(t => [s.id, t]));

const E = {
  'due': due.length,
  'not_yet_due.length': S.length - due.length,
  'moved': moved.length,
  'moved_code.content public': cnt(due, s => s.moved === 'content public'),
  'moved_code.fact only': cnt(due, s => s.moved === 'fact only'),
  'moved_code.no trace found': cnt(due, s => s.moved === 'no trace found'),
  'host_public_body': cnt(moved, s => s._host === 'public body'),
  'host.sender': cnt(moved, s => s._host === 'sender'),
  'host.intergovernmental': cnt(moved, s => s._host === 'intergovernmental'),
  'host.third party': cnt(moved, s => s._host === 'third party'),
  'due_by_receiver.public body': cnt(due, s => s.receiver === 'public body'),
  'moved_by_receiver.public body.length': cnt(moved, s => s.receiver === 'public body'),
  'events': cnt(S, EV),
  'P149.n': cnt(S, s => EV(s) && s.moved !== 'no trace found'),
  'found_by_critique.length': cnt(S, s => (s.note || '').startsWith('Found by the critique')),
  ...Object.fromEntries(MV.cases.flatMap(c => [
    [`cases.${c.id}.delays_days.began_to_first_public`, days(c.began, c.first_public.date)],
    [`cases.${c.id}.delays_days.ended_to_first_public`, days(c.ended, c.first_public.date)],
    [`cases.${c.id}.delays_days.first_public_to_maker`, days(c.first_public.date, c.maker_public.date)],
    [`cases.${c.id}.delays_days.first_public_to_body`, days(c.first_public.date, c.body[0].date)]])),
  'g7.listed_instances': MV.g7_instances.length,
  'g7.instances_who_acted.people': cnt(MV.g7_instances, c => c.who_acted === 'people'),
  'g7.instances_first_reader.the maker': cnt(MV.g7_instances, c => c.first_reader === 'the maker'),
  'g7.reports': MV.g7_reports.length,
  'house.pairs': H.length,
  'house.earliest.before': cnt(H, p => earliest(p) === 'before'),
  'house.earliest.at': cnt(H, p => earliest(p) === 'at'),
  'house.earliest.after': cnt(H, p => earliest(p) === 'after'),
  'house.mend.before': cnt(H, p => mend(p) === 'before'),
  'house.mend.at': cnt(H, p => mend(p) === 'at'),
  'house.mend.after': cnt(H, p => mend(p) === 'after'),
  'house.closed_median_h': Math.round(median(H.map(p => p.closed_hours)) * 100) / 100,
  'house.remeasured': cnt(H, p => p.remeasured !== 'not re-measured'),
  'house.remeasured_agree': cnt(H, p => p.agree === true),
  'P151.agree': cnt(W12.deeds, d => d.field_closed_by === d.atelier_closed_by),
  'P151.of': W12.deeds.length,
  'P151.whole_pool.agree': WALL.pool - WALL.differ.length,
  'P151.whole_pool.of': WALL.pool,
  'P150.n': cp.length,
  'P150.n_sender_only': senderOnly.length,
  'P150.without_doubtful_earliest.sender_only.length': cnt(firm, s => s._hosts.length === 1 && s._hosts[0] === 'sender'),
  'P150.without_doubtful_earliest.n': firm.length,
  'search_queries_logged': SEARCH.agents.reduce((a, g) => a + g.search_log.length, 0),
  'traces': allTr.length,
  'traces_archived': allTr.filter(([, t]) => t._arch).length,
  'quotes_found': Q.items.filter(i => i.found).length,
  'quotes_of': Q.items.length,
};
const get = (o, path) => {
  if (path.endsWith('.length')) return get(o, path.slice(0, -7)).length;
  if (path in o) return o[path];
  const i = path.indexOf('.'); return get(o[path.slice(0, i)], path.slice(i + 1));
};

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
for (const k in E) ok(get(RES, k) === E[k], `results91.json ${k}: ${get(RES, k)} vs recount ${E[k]}`);
ok(E.quotes_found === E.quotes_of, 'every quote found');
for (const s of S) for (const t of s.traces) ok((t.archived === 'yes') === t._arch, `archive code of ${s.id} ${t.url}`);
// the window measured twice: every agreement in window91.json is a matching commit
for (const d of W12.deeds) ok(d.agree === (d.field_closed_by === d.atelier_closed_by), `window91 row ${d.row}`);

const browser = await chromium.launch();
for (const width of [1100, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 } });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + join(here, 'index.html'));
  await page.waitForTimeout(300);
  ok(errs.length === 0, `${width}: page errors ${errs}`);
  ok(await page.evaluate(() => document.documentElement.scrollWidth) <= width, `${width}: no sideways scroll`);
  const ks = await page.$$eval('[data-k2]', els => els.map(e => [e.dataset.k2, e.textContent.trim()]));
  for (const k in E) ok(ks.some(x => x[0] === k), `${width}: ${k} not on the page`);
  for (const [k, t] of ks) {
    ok(k in E, `${width}: unknown key ${k}`);
    ok(Number(t) === E[k], `${width}: ${k} page ${t} vs recount ${E[k]}`);
  }
  // the fifth cell of every ledger row
  const mv = await page.$$eval('#ledger g.row', gs => gs.map(g => [g.dataset.id, [...g.querySelectorAll('[class^="mv-"]')].map(r => r.getAttribute('class')).join('+')]));
  for (const [id, c] of mv) {
    const s = S.find(x => x.id === id);
    const want = s.due !== 'due' ? 'mv-later' : s.moved === 'content public' ? 'mv-full' : s.moved === 'fact only' ? 'mv-none+mv-half' : 'mv-none';
    ok(c === want, `${width}: moved cell of ${id} ${c} vs ${want}`);
  }
  // the time line: one row per moved signal, one mark per trace, its shape by host, open when not archived
  const mrows = await page.$$eval('#moved g.mrow', gs => gs.map(g => [g.dataset.id, [...g.querySelectorAll('[data-trace]')].map(m => [m.tagName, m.getAttribute('class'), m.dataset.trace]), g.querySelectorAll('line.rep').length]));
  ok(JSON.stringify(mrows.map(r => r[0]).sort()) === JSON.stringify(moved.map(s => s.id).sort()), `${width}: time line rows`);
  const shape = { sender: 'rect', intergovernmental: 'circle', 'third party': 'path' };
  for (const [id, marks, reps] of mrows) {
    const s = S.find(x => x.id === id);
    ok(marks.length === s.traces.length, `${width}: marks of ${id}`);
    for (const [tag, cls, url] of marks) {
      const t = s.traces.find(x => x.url === url);
      ok(t && tag === shape[t.host] && cls.includes('tr-na') === !t._arch, `${width}: mark ${id} ${url}`);
    }
    ok(reps === (id === 'G7-4' ? MV.g7_reports.length : 0), `${width}: report ticks of ${id}`);
  }
  ok((await page.$eval('#notrace', e => e.textContent)) === due.filter(s => !s._moved).map(s => s.id).join(', '), `${width}: no-trace list`);
  // the cases: one dot per dated moment, on its day, and each moment's passage in the list beside it
  for (const [svg, list, c] of [['case', 'caselist', MV.cases.find(x => x.id === 'wiki')], ['case2', 'caselist2', MV.cases.find(x => x.id === 'escape')]]) {
    const want = [c.began, c.ended, ...['noticed', 'first_public', 'maker_knew', 'maker_public', 'precursor', 'report_sent', 'maker_scope']
      .filter(k => c[k] && c[k].date).map(k => c[k].date), ...c.body.map(b => b.date)].sort();
    const dots = (await page.$$eval(`#${svg} circle.ev`, cs => cs.map(x => x.dataset.date))).sort();
    ok(JSON.stringify(dots) === JSON.stringify(want), `${width}: ${svg} dots ${dots} vs ${want}`);
    const ct = await page.$eval('#' + svg, e => e.textContent);
    ok(ct.includes(`${days(c.began, c.first_public.date)} days from the first`) && ct.includes(`${days(c.ended, c.first_public.date)} days from the last`), `${width}: ${svg} brackets`);
    const items = await page.$$eval(`#${list} li`, ls => ls.map(l => l.textContent));
    const qs = [c.began_src, c.ended_src, ...['noticed', 'first_public', 'maker_knew', 'maker_public', 'precursor', 'report_sent', 'maker_scope']
      .filter(k => c[k] && c[k].src).map(k => c[k].src), ...c.body.map(b => b.src)].map(x => x[1]);
    ok(items.length === qs.length && qs.every(q => items.some(it => it.includes(q))), `${width}: ${list} quotes ${items.length} vs ${qs.length}`);
  }
  ok(await page.$$eval('#g7i tbody tr', x => x.length) === MV.g7_instances.length, `${width}: G7 instance rows`);
  // the house: one window tick per deed, for every deed
  const wins = await page.$$eval('#house line.win[data-key]', x => x.map(l => l.dataset.key));
  ok(JSON.stringify(wins.sort()) === JSON.stringify(H.map(p => p.row + '.' + p.deed).sort()), `${width}: window ticks`);
  // the table's new column
  const tr = await page.$$eval('#byinst tbody tr', rs => rs.map(r => [r.dataset.inst, r.children[7]?.textContent]));
  for (const [id, n] of tr) ok(Number(n) === cnt(moved, s => s.instrument === id), `${width}: moved in table ${id}`);
  // predictions
  const verdict = async id => (await page.$eval('#' + id, e => e.textContent.trim()));
  ok((await verdict('p149')) === (E['P149.n'] === 0 ? 'Held' : 'Failed'), `${width}: P149`);
  ok((await verdict('p150')) === (E['P150.n'] >= 3 && E['P150.n_sender_only'] > E['P150.n'] / 2 ? 'Held' : 'Failed'), `${width}: P150`);
  ok((await verdict('p151')) === (E['P151.agree'] >= 10 ? 'Held' : 'Failed'), `${width}: P151`);
  // the readouts show the traces' passages
  await page.click('#ledger g.row[data-id="EU4"]');
  const ro = await page.$eval('#readout', e => e.textContent);
  ok(S.find(s => s.id === 'EU4').traces.every(t => ro.includes(t.quote)), `${width}: readout traces`);
  await page.click('#moved g.mrow[data-id="G7-3"]');
  const mro = await page.$eval('#mreadout', e => e.textContent);
  ok(S.find(s => s.id === 'G7-3').traces.every(t => mro.includes(t.quote)), `${width}: time-line readout`);
  await page.close();
}
await browser.close();
console.log(`state 2: ${pass} checks passed, ${fail} failed`);
let v90 = '';
try { v90 = execFileSync('node', [join(here, 'verify90.mjs')], { encoding: 'utf8' }); } catch (e) { v90 = String(e.stdout) + ' (exit ' + e.status + ')'; fail++; }
console.log('state 1 (verify90.mjs): ' + v90.trim().split('\n').pop());
process.exit(fail ? 1 : 0);
