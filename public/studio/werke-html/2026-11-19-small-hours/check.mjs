// SMALL HOURS: read every figure the page prints and recount it from the arrays of data.js
// (never from data.js's own `facts`). Run with a static server on the work's folder:
//   python3 -m http.server 8765 --bind 127.0.0.1   then   node check.mjs [http://127.0.0.1:8765/]
import { readFileSync } from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const url = process.argv[2] || 'http://127.0.0.1:8765/';
const window = {};
new Function('window', readFileSync(new URL('./data.js', import.meta.url), 'utf8'))(window);
const S = window.SH, C = S.c, N = C.t.length;

const berlinHour = t => Number(new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', hour12: false }).format(new Date(t * 1000)));
const day = t => new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(t * 1000));
const count = f => { let n = 0; for (let i = 0; i < N; i++) if (f(i)) n++; return n; };
const RED = '[a model’s name]';
const small = i => { const h = berlinHour(C.t[i]); return h >= 3 && h < 7; };
const ages = S.breaches.map(b => (S.census - C.t[b.c]) / 86400).sort((a, b) => a - b);
const median = ages.length % 2 ? ages[(ages.length - 1) / 2] : (ages[ages.length / 2 - 1] + ages[ages.length / 2]) / 2;
const machine = count(i => C.k[i] === 0);
const was = new Set(S.was);
const med = xs => { const a = [...xs].sort((x, y) => x - y); return a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2; };
// state 2: the Field's own file, fetched at its commit, as a second source for the figures of who saw first
const R86 = await (await fetch('https://raw.githubusercontent.com/frankbueltge/field-research/bc1dc14f07024fe1ed2875649c756d30fd797f7f/artifacts/cycle-017/what-the-house-did-unasked/results86.json')).json();
const SELF = S.breaches.filter(b => b.by !== undefined), DD = S.deeds;
const seerIs = (...names) => DD.filter(d => names.includes(S.seers[d.seer])).length;
const lags = DD.filter(d => d.lag !== null).map(d => d.lag);
const utcDay = t => { const d = new Date(t * 1000); return Date.UTC(d.getUTCFullYear(), d.getUTCMonth(), d.getUTCDate()); };

const expect = {
  commits: N,
  machine, workflow: count(i => C.k[i] === 1), architect: count(i => C.k[i] === 2),
  first: day(S.t0), last: day(S.t1),
  days: Math.round((utcDay(S.t1) - utcDay(S.t0)) / 86400000) + 1,
  small_hours: count(small), small_machine: count(i => small(i) && C.k[i] === 0),
  small_workflow: count(i => small(i) && C.k[i] === 1), small_architect: count(i => small(i) && C.k[i] === 2),
  small_machine_share: Math.round(100 * count(i => small(i) && C.k[i] === 0) / machine),
  bound_items: C.b.reduce((a, b) => a + b, 0), bound_commits: count(i => C.b[i] > 0),
  breaches: S.breaches.length, breach_robust: S.breaches.filter(b => b.rb).length, breach_commits: new Set(S.breaches.map(b => b.c)).size,
  census_median_days: Math.round(median), census_max_days: Math.round(ages[ages.length - 1]),
  signatures: S.signers.length,
  model_named: count(i => S.signers[C.g[i]].includes(RED) || C.s[i].includes(RED)),
  model_named_signature: count(i => S.signers[C.g[i]].includes(RED)),
  own_over: S.own.length, own_runs: new Set(S.own.map(o => o.run)).size,
  own_seen_runs: new Set(S.own.filter(o => o.seen).map(o => o.run)).size,
  own_seen_versions: S.own.filter(o => o.seen).length,
  own_missed_runs: new Set(S.own.filter(o => o.missed).map(o => o.run)).size,
  own_census: S.breaches.filter(b => S.repos[C.r[b.c]] === 'ulysses' && b.rule === 'digest-words').length,
  own_recount_after_census: Math.round((S.recount - S.census) / 60),
  // state 2
  corrected_commits: was.size, machine_was: count(i => C.k[i] === 0 || was.has(i)),
  small_machine_was: count(i => small(i) && (C.k[i] === 0 || was.has(i))),
  self_seen: SELF.length, census_seen: S.breaches.length - SELF.length,
  self_seen_median_hours: Math.round(med(SELF.map(b => (C.t[b.by] - C.t[b.c]) / 3600))),
  self_seen_max_days: Math.round(Math.max(...SELF.map(b => (C.t[b.by] - C.t[b.c]) / 86400))),
  census_seen_median_days: Math.round(med(S.breaches.filter(b => b.by === undefined).map(b => (S.census - C.t[b.c]) / 86400))),
  census_seen_max_days: Math.round(Math.max(...S.breaches.filter(b => b.by === undefined).map(b => (S.census - C.t[b.c]) / 86400))),
  log_rows: R86.partB.rows, deeds: DD.length,
  deeds_beyond: DD.filter(d => d.rel === 'beyond').length, deeds_against: DD.filter(d => d.rel === 'against').length,
  seer_architect: seerIs('the architect'), seer_order: seerIs("a session at the architect's order"),
  seer_machines: seerIs('another machine of the house', 'the acting machine itself', 'a guard, test, gate or CI'),
  seer_unstated: seerIs('not stated'), seer_outside: seerIs('someone outside the house'),
  deeds_git: DD.filter(d => d.git).length, deeds_not_git: DD.filter(d => !d.git).length,
  deeds_aug: DD.filter(d => d.date.startsWith('2026-08')).length, deeds_sep: DD.filter(d => d.date.startsWith('2026-09')).length,
  deeds_oct: DD.filter(d => d.date.startsWith('2026-10')).length, deeds_nov: DD.filter(d => d.date.startsWith('2026-11')).length,
  deeds_lagged: lags.length, lag_max: Math.max(...lags), lag_median: Math.round(med(lags)),
  own_recount: new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long' }).format(new Date(S.recount * 1000)) + ', ' + new Date(S.recount * 1000).toISOString().slice(11, 16) + ' UTC',
};
{ // the sighting delays, per run, from the run's first version
  const per = new Map();
  for (const o of S.own) if (o.seen) per.set(o.run, Math.max(per.get(o.run) || 0, (C.t[o.seen.c] - C.t[o.c]) / 3600));
  const d = [...per.values()].sort((a, b) => a - b);
  expect.own_seen_min_hours = Math.round(d[0]); expect.own_seen_max_days = Math.round(d[d.length - 1] / 24);
}
// figures that hold by construction of the source and are checked against it
const fixed = { breaches: 171, bound_items: 8098, own_over: 38, own_runs: 15, own_seen_runs: 7 };
// and the figures of state 2 against the Field's own file, not against this work's arrays
const field = { self_seen: R86.partA.seen_before_census, census_seen: R86.partA.seen_by['the census'], deeds: R86.partB.deeds,
  deeds_beyond: R86.partB.relation.beyond, deeds_against: R86.partB.relation.against, seer_architect: R86.partB.architect,
  seer_order: R86.partB.at_his_order, seer_machines: R86.partB.machines_unbidden, seer_outside: R86.partB.outside,
  seer_unstated: R86.partB.seer['not stated'], deeds_git: R86.partB.in_git, deeds_aug: R86.partB.by_month['2026-08'],
  deeds_sep: R86.partB.by_month['2026-09'], deeds_oct: R86.partB.by_month['2026-10'], deeds_nov: R86.partB.by_month['2026-11'],
  deeds_lagged: R86.partB.lags.length, lag_max: Math.max(...R86.partB.lags), lag_median: Math.round(med(R86.partB.lags)),
  self_seen_median_hours: Math.round(R86.partA.seen_lag_median * 24), census_seen_median_days: Math.round(R86.partA.census_lag_median),
  census_seen_max_days: Math.round(R86.partA.census_lag_max), corrected_commits: Object.values(R86.correction85.commits_recoded).reduce((a, b) => a + b, 0) + 2 };
// the +2: the Field's layer-2 queue, two commits this work also reads as a workflow; the Field's correction names its lander and its autoloop
// the breach limits against the census's own rule file are asserted in build.py

const b = await chromium.launch({ args: ['--use-gl=angle', '--use-angle=swiftshader', '--enable-unsafe-swiftshader'] });
let pass = 0, fail = 0;
for (const width of [1100, 390]) {
  const p = await b.newPage({ viewport: { width, height: 800 } });
  const errors = []; p.on('pageerror', e => errors.push(e.message));
  await p.goto(url); await p.waitForFunction(() => document.documentElement.dataset.ready === '1');
  const shown = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-f]')].map(e => [e.dataset.f, e.textContent])));
  for (const [k, v] of Object.entries(shown)) {
    if (k === 'census') { const ok = v === new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long', year: 'numeric' }).format(new Date(S.census * 1000)) + ', ' + new Date(S.census * 1000).toISOString().slice(11, 16) + ' UTC'; ok ? pass++ : (fail++, console.log('FAIL', width, k, v)); continue; }
    if (k === 'repos') continue;
    const want = expect[k];
    const got = typeof want === 'number' ? Number(v.replace(/,/g, '')) : v;
    if (got === want) pass++; else { fail++; console.log('FAIL', width, k, 'page', v, 'recount', want); }
  }
  for (const [k, v] of Object.entries(fixed)) if (expect[k] === v) pass++; else { fail++; console.log('FAIL fixed', k, expect[k], v); }
  for (const [k, v] of Object.entries(field)) { const got = Number(String(shown[k]).replace(/,/g, '')); if (got === v) pass++; else { fail++; console.log('FAIL against the Field', width, k, 'page', shown[k], 'Field', v); } }
  if (errors.length) { fail++; console.log('FAIL page errors', width, errors); } else pass++;
  await p.close();
}
await b.close();
console.log(`${pass} checks passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
