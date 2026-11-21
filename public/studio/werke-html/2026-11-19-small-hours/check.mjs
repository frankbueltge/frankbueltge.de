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
// state 3: the census as the Field corrected it; a withdrawn mark is not a breach
const ST = S.breaches.filter(b => !b.wd);
const ages = ST.map(b => (S.census - C.t[b.c]) / 86400).sort((a, b) => a - b);
const agesAll = S.breaches.map(b => (S.census - C.t[b.c]) / 86400);
const median = ages.length % 2 ? ages[(ages.length - 1) / 2] : (ages[ages.length / 2 - 1] + ages[ages.length / 2]) / 2;
const machine = count(i => C.k[i] === 0);
const was = new Set(S.was);
const med = xs => { const a = [...xs].sort((x, y) => x - y); return a.length % 2 ? a[(a.length - 1) / 2] : (a[a.length / 2 - 1] + a[a.length / 2]) / 2; };
// state 2: the Field's own file, fetched at its commit, as a second source for the figures of who saw first
const R86 = await (await fetch('https://raw.githubusercontent.com/frankbueltge/field-research/bc1dc14f07024fe1ed2875649c756d30fd797f7f/artifacts/cycle-017/what-the-house-did-unasked/results86.json')).json();
const R87 = await (await fetch('https://raw.githubusercontent.com/frankbueltge/field-research/ce3a5de5e069d3b76265d54cfd853e71471a1408/artifacts/cycle-017/what-the-house-did-unasked/results87.json')).json();
// state 4: the mendings, from the Field's reading 88 and the Atelier's sort, each fetched at its commit
const CR88 = await (await fetch('https://raw.githubusercontent.com/frankbueltge/field-research/1c00dd20578f297a72b83b2e496b19e4a3f5013f/artifacts/cycle-017/what-the-house-did-unasked/credit88.json')).json();
const SORT = await (await fetch('https://raw.githubusercontent.com/frankbueltge/ulysses/aa8a96ee5dde6175de7993773d4e8bfa3853e504/artifacts/cycle-017/on-its-own-account/data/sort.json')).json();
// state 5: each join read from the deed's end, from the Field's reading 89 and the Atelier's state 5, each fetched at its commit
const J89 = await (await fetch('https://raw.githubusercontent.com/frankbueltge/field-research/e08ba8f424f9794a4c27c0711f02d90e3843d19f/artifacts/cycle-017/what-the-house-did-unasked/join89.json')).json();
const H89 = await (await fetch('https://raw.githubusercontent.com/frankbueltge/field-research/e08ba8f424f9794a4c27c0711f02d90e3843d19f/artifacts/cycle-017/what-the-house-did-unasked/heirs89.json')).json();
const BOTH = await (await fetch('https://raw.githubusercontent.com/frankbueltge/ulysses/b05b358d94aee0868a8258b4e707f2f4cdea9c17/artifacts/cycle-017/on-its-own-account/data/both.json')).json();
const SELF = ST.filter(b => b.by !== undefined), DD = S.deeds;
const MD = DD.filter(d => d.mj !== null && d.mj !== undefined), GJ = MD.filter(d => d.mj <= 2), mlags = MD.map(d => d.mo / 86400);
const seerIs = (...names) => DD.filter(d => names.includes(S.seers[d.seer])).length;
const lags = DD.filter(d => d.lag !== null).map(d => d.lag);
const earliestRepo = d => d.at.reduce((a, b) => (b[3] < a[3] ? b : a))[0];
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
  breaches: ST.length, breach_robust: ST.filter(b => b.rb).length, breach_commits: new Set(ST.map(b => b.c)).size,
  breach_reading: ST.filter(b => !b.rb).length, breaches_withdrawn: S.breaches.filter(b => b.wd).length,
  breaches_was: S.breaches.length, census_seen_was: S.breaches.filter(b => b.by === undefined).length,
  census_median_days_was: Math.round(med(agesAll)),
  census_median_days: Math.round(median), census_max_days: Math.round(ages[ages.length - 1]),
  signatures: S.signers.length,
  model_named: count(i => S.signers[C.g[i]].includes(RED) || C.s[i].includes(RED)),
  model_named_signature: count(i => S.signers[C.g[i]].includes(RED)),
  own_over: S.own.length, own_runs: new Set(S.own.map(o => o.run)).size,
  own_seen_runs: new Set(S.own.filter(o => o.seen).map(o => o.run)).size,
  own_seen_versions: S.own.filter(o => o.seen).length,
  own_missed_runs: new Set(S.own.filter(o => o.missed).map(o => o.run)).size,
  own_census: ST.filter(b => S.repos[C.r[b.c]] === 'ulysses' && b.rule === 'digest-words').length,
  own_recount_after_census: Math.round((S.recount - S.census) / 60),
  // state 2
  corrected_commits: was.size, machine_was: count(i => C.k[i] === 0 || was.has(i)),
  small_machine_was: count(i => small(i) && (C.k[i] === 0 || was.has(i))),
  self_seen: SELF.length, census_seen: ST.length - SELF.length,
  self_seen_median_hours: Math.round(med(SELF.map(b => (C.t[b.by] - C.t[b.c]) / 3600))),
  self_seen_max_days: Math.round(Math.max(...SELF.map(b => (C.t[b.by] - C.t[b.c]) / 86400))),
  census_seen_median_days: Math.round(med(ST.filter(b => b.by === undefined).map(b => (S.census - C.t[b.c]) / 86400))),
  census_seen_max_days: Math.round(Math.max(...ST.filter(b => b.by === undefined).map(b => (S.census - C.t[b.c]) / 86400))),
  log_rows: R86.partB.rows, deeds: DD.length,
  deeds_authority: DD.filter(d => d.kind === 'authority').length,
  deeds_found: DD.filter(d => d.found === 'at its commit').length, deeds_not_found: DD.filter(d => d.found === 'not found').length,
  legible_both: DD.filter(d => d.leg === 0).length, legible_act: DD.filter(d => d.leg === 1).length, legible_none: DD.filter(d => d.leg === 2).length,
  signed_architect: DD.filter(d => d.sig === 0 && d.found === 'at its commit').length,
  signed_persona: DD.filter(d => d.sig === 1 && d.found === 'at its commit').length,
  signed_workflow: DD.filter(d => d.sig === 2 && d.found === 'at its commit').length,
  deeds_site: DD.filter(d => d.at.length && earliestRepo(d) === 'frankbueltge.de').length,
  deeds_in_field: DD.filter(d => d.em.length).length,
  seer_stated: DD.filter(d => S.seers[d.seer] !== 'not stated').length,
  lag87_median: Math.round(med(lags)), lag87_max: Math.round(Math.max(...lags)), lag87_week: lags.filter(x => x > 7).length,
  lag87_negative: lags.filter(x => x < 0).length,
  // figures this work's arrays do not hold: what state 2 showed (study 86) and how the Field coded the log again (check 87)
  deeds_was: R86.partB.deeds, seer_architect_was: R86.partB.architect, seer_order_was: R86.partB.at_his_order,
  seer_machines_was: R86.partB.machines_unbidden, deeds_git_was: R86.partB.in_git,
  deed_rows: R87.partB.rows_with_deeds, blind_added: R87.partB.agreement.deed.blind_only, blind_missed: R87.partB.agreement.deed.published_only,
  struck_breaches: R87.partA.struck.breach, struck_self: R87.partA.struck.seen_by['the practice itself'],
  deeds_beyond: DD.filter(d => d.rel === 'beyond').length, deeds_against: DD.filter(d => d.rel === 'against').length,
  seer_architect: seerIs('the architect'), seer_order: seerIs("a session at the architect's order"),
  seer_machines: seerIs('another machine of the house', 'the acting machine itself', 'a guard, test, gate or CI'),
  seer_unstated: seerIs('not stated'), seer_outside: seerIs('someone outside the house'),
  deeds_not_git: DD.filter(d => d.found === 'not in Git').length,
  deeds_aug: DD.filter(d => d.date.startsWith('2026-08')).length, deeds_sep: DD.filter(d => d.date.startsWith('2026-09')).length,
  deeds_oct: DD.filter(d => d.date.startsWith('2026-10')).length, deeds_nov: DD.filter(d => d.date.startsWith('2026-11')).length,
  // state 4
  mended: MD.length, unmended: DD.length - MD.length, joined_git: GJ.length,
  join_same: MD.filter(d => d.mj === 0).length, join_name: MD.filter(d => d.mj === 1).length, join_lines: MD.filter(d => d.mj === 2).length,
  join_file: MD.filter(d => d.mj === 3).length, join_log: MD.filter(d => d.mj === 4).length,
  joined_git_architect: GJ.filter(d => d.ms === 0).length, joined_both_architect: GJ.filter(d => d.ms === 0 && d.sig === 0).length,
  mend_lag_median: Math.round(med(mlags) * 10) / 10, mend_within_day: mlags.filter(x => x <= 1).length, mend_lag_max: Math.round(Math.max(...mlags)),
  // state 5, from this work's arrays: how the walk from each deed ends, and the hand that came first
  fw_reached: GJ.filter(d => d.fw <= 2).length, fw_same: GJ.filter(d => d.fw === 0).length, fw_name: GJ.filter(d => d.fw === 1).length,
  fw_lines: GJ.filter(d => d.fw === 2).length, one_way: GJ.filter(d => d.fw === 3).length, lines_pairs: GJ.filter(d => d.fw >= 1).length,
  heirs: GJ.filter(d => d.hr).length, heir_architect: GJ.filter(d => d.hr && d.hk === 0).length,
  heir_workflow: GJ.filter(d => d.hr && d.hk === 2).length, heir_mending: GJ.filter(d => d.hr && d.hm).length,
  // the hours are the Field's, from the deed's last commit; recounted from its per-pair rows, not its summary
  heir_within_hour: H89.heirs.filter(h => h.hours_after_deed < 1).length, heir_within_day: H89.heirs.filter(h => h.hours_after_deed < 24).length,
  // the Atelier's own rule this work does not draw: recounted from its per-pair rows where they hold it
  at_first: BOTH.pairs.filter(p => p.join === 'lines' && p.hands.length === 0).length, at_lines: BOTH.pairs.filter(p => p.join === 'lines').length,
  at_lead: BOTH.results.lead_all, agree_first: BOTH.results.field_agree_first,
  own_recount: new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'long' }).format(new Date(S.recount * 1000)) + ', ' + new Date(S.recount * 1000).toISOString().slice(11, 16) + ' UTC',
};
{ // the sighting delays, per run, from the run's first version
  const per = new Map();
  for (const o of S.own) if (o.seen) per.set(o.run, Math.max(per.get(o.run) || 0, (C.t[o.seen.c] - C.t[o.c]) / 3600));
  const d = [...per.values()].sort((a, b) => a - b);
  expect.own_seen_min_hours = Math.round(d[0]); expect.own_seen_max_days = Math.round(d[d.length - 1] / 24);
}
// figures that hold by construction of the source and are checked against it
const fixed = { breaches: 156, bound_items: 8073, own_over: 38, own_runs: 15, own_seen_runs: 7, deeds: 88 };
// and the figures of state 2 against the Field's own file, not against this work's arrays
// state 3: the page against the Field's own files, never against this work's arrays: check 87 for what stands now,
// study 86 for what state 2 showed and the check corrected
const B = R87.partB, P = R87.partC, NOW = R87.correction85.census_now;
const field = { breaches: NOW.breach, breach_robust: NOW.robust, breach_reading: NOW.breach - NOW.robust, bound_items: NOW.bound,
  breaches_withdrawn: R87.correction85.removed.breach, breaches_was: R87.correction85.census_was.breach,
  self_seen: R87.partA.p135.rules_of_85.seen, census_seen: NOW.breach - R87.partA.p135.rules_of_85.seen,
  census_seen_was: R86.partA.seen_by['the census'],
  struck_breaches: R87.partA.struck.breach, struck_self: R87.partA.struck.seen_by['the practice itself'],
  deeds: B.deeds, deed_rows: B.rows_with_deeds, blind_added: B.agreement.deed.blind_only, blind_missed: B.agreement.deed.published_only,
  deeds_beyond: B.relation.beyond, deeds_against: B.relation.against, deeds_authority: B.kind.authority,
  seer_architect: B.seers_all.architect, seer_order: B.seers_all.at_his_order, seer_machines: B.seers_all.machines,
  seer_stated: B.seers_all.stated, seer_unstated: B.seer['not stated'], seer_outside: B.seer['someone outside the house'] || 0,
  deeds_found: P.found['at its commit'], deeds_not_git: P.found['not in Git'], deeds_not_found: P.found['not found'],
  legible_both: P.legible['deed and maker'],
  signed_architect: P.found_signed["the architect's name"], signed_persona: P.found_signed["a practice's persona"],
  signed_workflow: P.found_signed['a workflow or bot'],
  deeds_aug: B.by_month['2026-08'], deeds_sep: B.by_month['2026-09'], deeds_oct: B.by_month['2026-10'], deeds_nov: B.by_month['2026-11'],
  deeds_was: R86.partB.deeds, seer_architect_was: R86.partB.architect, seer_order_was: R86.partB.at_his_order,
  seer_machines_was: R86.partB.machines_unbidden, deeds_git_was: R86.partB.in_git,
  corrected_commits: Object.values(R86.correction85.commits_recoded).reduce((a, b) => a + b, 0) + 2,
  // state 4, against the siblings' own files
  mended: CR88.results.all.deeds, unmended: CR88.results.deeds - CR88.results.in_set, mend_lag_median: CR88.results.all.lag_median,
  mend_within_day: CR88.results.all.lag_within_1, mend_lag_max: Math.round(CR88.results.all.lag_max),
  joined_git: SORT.act.outsider, join_same: SORT.act.join.same, join_name: SORT.act.join.name, join_lines: SORT.act.join.lines,
  join_file: SORT.act.join.file, join_log: SORT.act.join.log,
  // state 5, against the siblings' own files
  fw_same: J89.results.all.same_commit, fw_lines: J89.results.all.git_points, lines_pairs: J89.results.all.lines,
  fw_reached: J89.pairs.filter(p => p.code === 'same_commit' || (p.code === 'lines' && (p.git_points || p.name))).length,
  one_way: J89.results.all.class_joined - J89.pairs.filter(p => p.code === 'same_commit' || (p.code === 'lines' && (p.git_points || p.name))).length,
  heirs: H89.results.pairs, heir_within_hour: H89.results.within_1h, heir_within_day: H89.results.within_24h,
  heir_architect: H89.results.signers["the architect's name"], heir_workflow: H89.results.signers['a workflow or bot'],
  heir_mending: H89.results.heir_is_a_mending,
  at_first: BOTH.results.first, at_lines: BOTH.results.lines, at_lead: BOTH.results.lead_all, agree_first: BOTH.results.field_agree_first };
// the Field and the Atelier pair the same deeds with the same mendings, and every mending's name agrees
{ const so = new Map(SORT.act.deeds.map(d => [d.row + ':' + d.n, d]));
  const agree = CR88.deeds.every(c => { const s = so.get(c.row + ':' + c.deed); return s && (c.in_set ? s.repair[1] === c.repair_hash.slice(0, 12) : s.join === null); });
  const archJoined = SORT.act.deeds.filter(d => ['same', 'name', 'lines'].includes(d.join) && d.repair_signer === "the architect's name").length;
  field.joined_git_architect = archJoined;
  if (!agree) { console.log('FAIL the Field and the Atelier pair different mendings'); process.exitCode = 1; } }
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
  // the critique's one change, in the work: the eye stands at the lantern, at a person's height
  const eye = await p.evaluate(() => { const c = window.__SH.camera.position, t = window.__SH.controls.target; return [c.y, Math.hypot(c.x - t.x, c.z - t.z)]; });
  if (eye[0] < 6 && eye[1] < 12) pass++; else { fail++; console.log('FAIL the eye is not at the lantern', width, eye); }
  // state 4: the first gesture is asked for on the stage; the clock waits for it
  const gate = await p.evaluate(() => [!document.getElementById('enter').hidden, window.__SH.st.playing]);
  if (gate[0] && !gate[1]) pass++; else { fail++; console.log('FAIL the stage does not ask for the first gesture', width, gate); }
  await p.click('#enterQuiet', { noWaitAfter: true });
  if (await p.evaluate(() => document.getElementById('enter').hidden && window.__SH.st.playing)) pass++; else { fail++; console.log('FAIL the gesture did not start the clock', width); }
  // state 4: the end. Held after it has run, the field holds only what a stranger can check
  await p.click('[data-go=coda]', { noWaitAfter: true }); await p.evaluate(() => { window.__SH.coda.hold = 60000; }); await p.waitForTimeout(800);
  const end = await p.evaluate(() => window.__SH.codaDrawn());
  const num = k => Number(String(shown[k]).replace(/,/g, ''));
  const endWant = { flames: 1, out: 1, waverCommitsLit: 0, threadsOn: 0, pillarsOn: 0, logRingsOn: 0,
    stitched: num('joined_git'), fileOnly: num('join_file'), stitchedArchitect: num('joined_git_architect'), steadyBreaches: num('breach_robust'),
    twoWay: num('fw_reached'), oneWay: num('one_way'), hands: num('heirs'), handsArchitect: num('heir_architect') };
  for (const [k, v] of Object.entries(endWant)) if (end[k] === v) pass++; else { fail++; console.log('FAIL at the end', width, k, 'drawn', end[k], 'want', v); }
  // and what it drew against the arrays, not the page: the pairs Git joins, the reds over on every count
  if (end.stitched === GJ.length && end.fileOnly === MD.filter(d => d.mj === 3).length && end.steadyBreaches === ST.filter(b => b.rb).length) pass++;
  else { fail++; console.log('FAIL the end against the arrays', width, end); }
  // state 5: what the walk from each deed left drawn, against the arrays
  if (end.twoWay === GJ.filter(d => d.fw <= 2).length && end.oneWay === GJ.filter(d => d.fw === 3).length && end.hands === GJ.filter(d => d.hr).length) pass++;
  else { fail++; console.log('FAIL the walk from the deed against the arrays', width, end); }
  for (const k of ['joined_git', 'mended', 'fw_reached', 'heirs', 'heir_within_hour', 'heir_architect']) if (end.note.includes(String(shown[k]))) pass++; else { fail++; console.log('FAIL the last note lacks', k, end.note); }
  // the struck word: the page's description no longer says most
  const desc = await p.getAttribute('meta[name=description]', 'content');
  if (!/\bMost\b/.test(desc)) pass++; else { fail++; console.log('FAIL description still says most', desc); }
  await p.close();
}
await b.close();
console.log(`${pass} checks passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
