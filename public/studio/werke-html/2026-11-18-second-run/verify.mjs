// SECOND RUN — the page's numbers, read from the page and recomputed from the data.
// Usage: node verify.mjs [field-research checkout]   (needs playwright; opens index.html at 1100 and 390 px)
// It recomputes every count from data.js on its own (not from data.js's N), reads every number the caption and
// the text show, and reads what both drawings drew (window.__drawn, window.__drawnT) after the second run.
// Two kappas and the first reading's two counts are not in data.js's rows: given a checkout of the Field's
// repository, they are compared with its results81.json and results82.json at the pinned commit.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
import { execFileSync } from 'node:child_process';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';

const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = dirname(fileURLToPath(import.meta.url));
const txt = readFileSync(join(here, 'data.js'), 'utf8');
const D = JSON.parse(txt.slice(txt.indexOf('=') + 1).trim().replace(/;$/, ''));

// ---- recompute
const cls = D.pages.flat().map(([, k]) => k);
const SRC = Object.fromEntries(D.sources.map(s => [s.ref, s]));
const tests = D.sources.filter(s => s.test === 'yes');
const sealed = new Set(['closed', 'model closed', 'materials closed']);
const rer = tests.filter(s => s.out === 'rerunnable');
// a source holds when it holds the result for at least one sentence that cites it (recomputed from the pairs)
const holdsAny = s => s.by.some(i => D.ev[i].holds[s.ref] === 'holds');
const holdsSome = s => s.by.some(i => ['holds', 'partly'].includes(D.ev[i].holds[s.ref]));
const rh = rer.filter(holdsAny);
const meas = Object.entries(D.ev).filter(([, e]) => e.g === 'measured');
const litOf = e => e.src.some(r => SRC[r].test === 'yes' && SRC[r].out === 'rerunnable' && e.holds[r] === 'holds');
const lit = meas.filter(([, e]) => litOf(e));
const wilson = (k, n, z = 1.96) => {
  const p = k / n, d = 1 + z * z / n, c = (p + z * z / (2 * n)) / d, h = z * Math.sqrt(p * (1 - p) / n + z * z / (4 * n * n)) / d;
  return [Math.round(1000 * (c - h)) / 10, Math.round(1000 * (c + h)) / 10];
};
const rowOf = key => tests.filter(s => {
  const g = new Set(s.groups);
  if (key === 'can') return g.has('capability');
  if (key === 'does') return g.has('control');
  return [...g].every(x => x === 'general' || x === 'safeguards');
});
const rows = Object.fromEntries(['can', 'does', 'other'].map(k => [k, rowOf(k)]));
const reachOf = arr => arr.filter(s => s.out === 'rerunnable' && holdsAny(s)).length;
const [lo, hi] = wilson(rh.length, tests.length);
const hosted = rer.filter(s => s.model_access === 'public product or API');
const R = {
  sentences: cls.length,
  on_evaluation: cls.filter(k => k > 0).length,
  inferred: cls.filter(k => k === 1).length,
  open: cls.filter(k => k === 2).length,
  measured: cls.filter(k => k === 3).length,
  no_footing: cls.filter(k => k === 1 || k === 2).length,
  sources: D.sources.length,
  tests: tests.length,
  rerunnable: rer.length,
  holds: rh.length,
  holds_partly: rer.filter(holdsSome).length,
  holds_lo: lo, holds_hi: hi,
  not_rerunnable: tests.filter(s => sealed.has(s.out)).length,
  unstated: tests.filter(s => s.out === 'unstated').length,
  sent_lit: lit.length,
  sent_dark: meas.length - lit.length,
  pass_tests: tests.filter(s => s.pass && s.pass !== 'none').length,
  nine: D.nine.length,
  can_n: rows.can.length, can_reach: reachOf(rows.can),
  does_n: rows.does.length, does_reach: reachOf(rows.does),
  other_n: rows.other.length, other_reach: reachOf(rows.other),
  hosted: hosted.length, gone_today: hosted.filter(s => s.today === 'no').length,
  first_rerunnable: tests.filter(s => s.out1 === 'rerunnable').length,
  first_sent: meas.filter(([, e]) => e.lit1).length,
};
const field = process.argv[2];
let skipped = 0;
if (field) {
  const show = f => JSON.parse(execFileSync('git', ['-C', field, 'show', `${D.meta.field_commit}:${D.meta.field_path}${f}`]).toString());
  const r82 = show('results82.json'), r81 = show('results81.json');
  R.kappa_rerun = r82.study81.rerunnable_or_not.kappa; R.kappa_outside = r82.study81.outside.kappa;
  if (R.first_rerunnable !== r81.outside.rerunnable) { console.log('FAIL first reading of rerunnable'); process.exitCode = 1; }
  if (R.first_sent !== r81.sentence_outside.rerunnable) { console.log('FAIL first reading of lit sentences'); process.exitCode = 1; }
} else { R.kappa_rerun = D.N.kappa_rerun; R.kappa_outside = D.N.kappa_outside; skipped = 2; }

const pairs = meas.reduce((m, [, e]) => m + e.src.length, 0);
const legsRer = meas.flatMap(([, e]) => e.src.filter(r => SRC[r].test === 'yes' && SRC[r].out === 'rerunnable').map(r => e.holds[r]));
const drawnWant = {
  lit: lit.length, dark: meas.length - lit.length, black: R.measured,
  copies: rh.length, hollow: rer.length - rh.length, open: rer.length, sealed: R.not_rerunnable, grey: R.unstated,
  rings: D.sources.filter(s => s.test === 'no').length,
  slots: R.not_rerunnable + R.unstated + R.nine, nine: R.nine, pass: R.pass_tests,
  legs: pairs, arrive: legsRer.filter(h => h === 'holds').length, stop: legsRer.filter(h => h !== 'holds').length,
};
const dual = tests.filter(s => s.groups.length > 1);
const tallyWant = {
  reach: rh.length, paper: rer.length - rh.length,
  empty: tests.filter(s => s.out !== 'rerunnable' && !(s.runner || '').startsWith('maker') && s.groups.length === 1).length,
  emptyMaker: tests.filter(s => s.out !== 'rerunnable' && (s.runner || '').startsWith('maker') && s.groups.length === 1).length,
  nine: R.nine, how: rh.filter(s => s.how && s.groups.includes('control')).length, dual: dual.length,
};
const countsWant = { can: [R.can_reach, R.can_n], does: [R.does_reach, R.does_n], other: [R.other_reach, R.other_n], nine: [0, R.nine] };
// the facts the page states in words
const facts = [
  ['every pass-mark test was run by the maker', tests.filter(s => s.pass !== 'none').every(s => s.runner === 'maker' || s.runner === 'maker and others')],
  ['every pass mark was set by the maker', tests.filter(s => s.pass !== 'none').every(s => s.pass === 'maker')],
  ['no pass-mark test can be run again outside', tests.filter(s => s.pass !== 'none').every(s => sealed.has(s.out))],
  ['none of the nine can be repeated outside, by either reading', D.nine.every(c => c.out !== 'rerunnable' && c.out2 !== 'rerunnable')],
  ['each of the six reached tests of conduct carries the Atelier\'s word, and only trained, told or asked', rh.filter(s => s.groups.includes('control')).every(s => ['trained', 'told', 'asked'].includes(s.how))],
  ['exactly one test stands in two rows', dual.length === 1],
  ['the twelve that hold are the Field\'s twelve', rh.map(s => s.ref).sort().join() === ['138', '201', '230', '317', '413', '632', '724', '726', '727', '1063', '1226', '1229'].sort().join()],
];

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
facts.forEach(([m, c]) => ok(c, m));

const b = await chromium.launch();
for (const w of [1100, 390]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' })).newPage();
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + join(here, 'index.html'));
  await p.waitForFunction(() => document.body.dataset.run === 'done');
  ok(errs.length === 0, `${w}px: page errors ${errs.join(' | ')}`);
  const shown = await p.$$eval('[data-n]', els => els.map(e => [e.dataset.n, e.textContent]));
  for (const [k, v] of shown) {
    ok(k in R, `${w}px: the page shows ${k}, which this script does not recompute`);
    if (k in R) ok(Number(v.replace(/,/g, '')) === R[k], `${w}px: ${k} shows ${v}, recomputed ${R[k]}`);
  }
  const drawn = await p.evaluate(() => window.__drawn);
  for (const k in drawnWant) ok(drawn[k] === drawnWant[k], `${w}px: drawn ${k} = ${drawn[k]}, recomputed ${drawnWant[k]}`);
  const dt = await p.evaluate(() => window.__drawnT);
  for (const k in tallyWant) ok(dt[k] === tallyWant[k], `${w}px: tally drew ${k} = ${dt[k]}, recomputed ${tallyWant[k]}`);
  for (const k in countsWant) ok(JSON.stringify(dt.counts[k]) === JSON.stringify(countsWant[k]), `${w}px: tally count ${k} = ${dt.counts[k]}, recomputed ${countsWant[k]}`);
  const label = await p.getAttribute('#work', 'aria-label');
  for (const n of [R.rerunnable, R.not_rerunnable, R.unstated, R.holds, R.rerunnable - R.holds, R.sent_lit, R.sent_dark, R.nine]) {
    ok(label.includes(String(n)), `${w}px: the drawing's label lacks ${n}`);
  }
  const tl = await p.getAttribute('#tally', 'aria-label');
  for (const s of [`${R.can_reach} of ${R.can_n}`, `${R.does_reach} of ${R.does_n}`, `${R.other_reach} of ${R.other_n}`, `0 of ${R.nine}`]) ok(tl.includes(s), `${w}px: the tally's label lacks ${s}`);
  await p.close();
}
await b.close();
console.log(`${pass} checks passed, ${fail} failed${skipped ? `, ${skipped} compared only with data.js (no Field checkout given)` : ''}`);
process.exit(fail || process.exitCode ? 1 : 0);
