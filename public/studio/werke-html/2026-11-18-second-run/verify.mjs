// SECOND RUN — the page's numbers, read from the page and recomputed from the data (state 3, the check, 2026-11-19).
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
const goneOf = s => s.model_access === 'public product or API' && s.today === 'no' && s.out === 'rerunnable';
const CAPABILITY_KINDS = new Set(['biological or chemical', 'cyber', 'autonomy or AI research', 'persuasion']);
// what a measured claim with no test anyone else could run stands on
const underOf = e => {
  const ts = e.src.map(r => SRC[r]).filter(s => s.test === 'yes');
  if (ts.some(s => s.out === 'rerunnable')) return null;
  if (!ts.length) return 'no test';
  return ts.some(s => s.out === 'unstated') ? 'unstated' : 'closed';
};
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
  // state 3
  sent_stopped: meas.filter(([, e]) => !litOf(e) && e.src.some(r => SRC[r].test === 'yes' && SRC[r].out === 'rerunnable')).length,
  sent_none: meas.filter(([, e]) => !e.src.some(r => SRC[r].test === 'yes' && SRC[r].out === 'rerunnable')).length,
  sent_once: lit.filter(([, e]) => e.src.filter(r => SRC[r].test === 'yes' && SRC[r].out === 'rerunnable' && e.holds[r] === 'holds').every(r => goneOf(SRC[r]))).length,
  nine_given: D.nine.filter(c => c.atelier_out !== 'none named').length,
  nine_read: D.nine.filter(c => c.read_published).length,
  under_closed: meas.filter(([, e]) => underOf(e) === 'closed').length,
  under_unstated: meas.filter(([, e]) => underOf(e) === 'unstated').length,
  under_no_test: meas.filter(([, e]) => underOf(e) === 'no test').length,
  untold_seen: D.sources.filter(s => s.untold).length,
  does_closed: rows.does.filter(s => s.out !== 'rerunnable').length,
  legs: meas.reduce((m, [, e]) => m + e.src.length, 0),
  holds_pct: Math.round(100 * rh.length / tests.length),
};
const field = process.argv[2];
let skipped = 0;
if (field) {
  const show = f => JSON.parse(execFileSync('git', ['-C', field, 'show', `${D.meta.field_commit}:${D.meta.field_path}${f}`]).toString());
  const r82 = show('results82.json'), r81 = show('results81.json');
  R.kappa_rerun = r82.study81.rerunnable_or_not.kappa; R.kappa_outside = r82.study81.outside.kappa;
  // the check's figures, from the Field's presented commit
  const at = (f, c) => execFileSync('git', ['-C', field, 'show', `${c}:${D.meta.field_path}${f}`]).toString();
  const r83 = JSON.parse(at('results83.json', D.meta.field_commit_presented));
  const d82t = at('data82.js', D.meta.field_commit_presented), d82 = JSON.parse(d82t.slice(d82t.indexOf('=') + 1).trim().replace(/;$/, ''));
  const passRefs = tests.filter(s => s.pass && s.pass !== 'none').map(s => s.ref);
  R.pass_on_conduct = passRefs.filter(r => d82.sources[r].pass_applies_to.some(k => !CAPABILITY_KINDS.has(k.kind))).length;
  if (!passRefs.every(r => d82.sources[r].pass_applies_to.length)) { console.log('FAIL a pass mark applies to nothing'); process.exitCode = 1; }
  R.instruments = r83.study83.instruments; R.instr_set = r83.study83.pass_set_by_instrument.length;
  R.instr_left_dev = r83.study83.totals.pass_mark['left to the developer']; R.instr_power = r83.study83.totals.pass_mark['power to set'];
  R.instr_no_mark = r83.study83.totals.pass_mark.none; R.does_untold = r83.control_tests.untold;
  if (r83.control_tests.rerunnable_and_holds !== R.does_reach) { console.log('FAIL conduct reach against study 83'); process.exitCode = 1; }
  if (r83.nine_apart.rerunnable !== 0) { console.log('FAIL the nine against study 83'); process.exitCode = 1; }
  const r80 = JSON.parse(at('results80.json', D.meta.field_commit_presented));
  const r81p = JSON.parse(at('results81.json', D.meta.field_commit_presented));
  const r82p = JSON.parse(at('results82.json', D.meta.field_commit_presented));
  R.candidates = r80.candidates; R.about_second = r82p.study80.about.confusion['yes | yes']; R.kappa_about = r82p.study80.about.kappa;
  R.by_cites = r81p.sentences_how.cites; R.by_reading = r81p.sentences_how.reading; R.by_none = r81p.sentences_how.none;
  if (R.by_none !== meas.filter(([, e]) => !e.src.length).length) { console.log('FAIL sentences with no source'); process.exitCode = 1; }
  if (R.first_rerunnable !== r81.outside.rerunnable) { console.log('FAIL first reading of rerunnable'); process.exitCode = 1; }
  if (R.first_sent !== r81.sentence_outside.rerunnable) { console.log('FAIL first reading of lit sentences'); process.exitCode = 1; }
} else {
  for (const k of ['kappa_rerun', 'kappa_outside', 'pass_on_conduct', 'instruments', 'instr_set', 'instr_left_dev', 'instr_power', 'instr_no_mark', 'does_untold',
    'candidates', 'about_second', 'kappa_about', 'by_cites', 'by_reading', 'by_none']) { R[k] = D.N[k]; skipped++; }
}

const pairs = meas.reduce((m, [, e]) => m + e.src.length, 0);
const legsRer = meas.flatMap(([, e]) => e.src.filter(r => SRC[r].test === 'yes' && SRC[r].out === 'rerunnable').map(r => e.holds[r]));
const drawnWant = {
  lit: lit.length, dark: meas.length - lit.length, black: R.measured,
  copies: rh.length, hollow: rer.length - rh.length, open: rer.length, sealed: R.not_rerunnable, grey: R.unstated,
  rings: D.sources.filter(s => s.test === 'no').length,
  slots: R.not_rerunnable + R.unstated, nine: R.nine, pass: R.pass_tests, readers: R.nine_given,
  legs: pairs, arrive: legsRer.filter(h => h === 'holds').length, stop: legsRer.filter(h => h !== 'holds').length,
  once: R.sent_once, struck: rer.filter(goneOf).length,
};
const dual = tests.filter(s => s.groups.length > 1);
const inRows = s => s.groups.length;     // a test cited under two rows stands in both
const maker = s => (s.runner || '').startsWith('maker');
const tallyWant = {
  reach: rh.reduce((m, s) => m + inRows(s), 0), paper: rer.filter(s => !holdsAny(s)).reduce((m, s) => m + inRows(s), 0),
  gone: rer.filter(goneOf).reduce((m, s) => m + inRows(s), 0),
  sealedMaker: tests.filter(s => sealed.has(s.out) && maker(s)).reduce((m, s) => m + inRows(s), 0),
  sealed: tests.filter(s => sealed.has(s.out) && !maker(s)).reduce((m, s) => m + inRows(s), 0),
  grey: tests.filter(s => s.out === 'unstated').reduce((m, s) => m + inRows(s), 0),
  pass: R.pass_tests, noLine: 1, noTest: 1, deeds: R.nine, readers: R.nine_given, untold: R.untold_seen,
  how: rh.filter(s => s.how && s.groups.includes('control')).length, dual: dual.length,
};
const claimsWant = { lit: R.sent_lit - R.sent_once, once: R.sent_once, stopped: R.sent_stopped, closed: R.under_closed, unstated: R.under_unstated, noTest: R.under_no_test, waiting: 0 };
const smallWant = { grey: R.inferred, hollow: R.open };
const countsWant = { claims: [R.sent_lit, R.measured], can: [R.can_reach, R.can_n], does: [R.does_reach, R.does_n], other: [R.other_reach, R.other_n], nine: [R.nine_read, R.nine] };
// the facts the page states in words
const facts = [
  ['every pass-mark test was run by the maker', tests.filter(s => s.pass !== 'none').every(s => s.runner === 'maker' || s.runner === 'maker and others')],
  ['every pass mark was set by the maker', tests.filter(s => s.pass !== 'none').every(s => s.pass === 'maker')],
  ['no pass-mark test can be run again outside', tests.filter(s => s.pass !== 'none').every(s => sealed.has(s.out))],
  ['none of the nine can be repeated outside, by either reading', D.nine.every(c => c.out !== 'rerunnable' && c.out2 !== 'rerunnable')],
  ['every pass mark applies to a capability', tests.filter(s => s.pass !== 'none').every(s => s.pass_on && s.pass_on.length && s.pass_on.every(k => CAPABILITY_KINDS.has(k)))],
  ['the three marked untold are closed tests behind claims on control', D.sources.filter(s => s.untold).every(s => s.test === 'yes' && s.out !== 'rerunnable' && s.groups.includes('control'))],
  ['the one deed given an outside investigator is not drawn as read', D.nine.filter(c => c.reader).every(c => !c.read_published)],
  ['the four struck are the hosted tests whose model is gone', rer.filter(goneOf).map(s => s.ref).sort().join() === D.sources.filter(s => s.gone).map(s => s.ref).sort().join()],
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
  for (const k in claimsWant) ok(dt.claims[k] === claimsWant[k], `${w}px: last frame drew claims ${k} = ${dt.claims[k]}, recomputed ${claimsWant[k]}`);
  for (const k in smallWant) ok(dt.small[k] === smallWant[k], `${w}px: last frame drew unmeasured ${k} = ${dt.small[k]}, recomputed ${smallWant[k]}`);
  for (const k in countsWant) ok(JSON.stringify(dt.counts[k]) === JSON.stringify(countsWant[k]), `${w}px: tally count ${k} = ${dt.counts[k]}, recomputed ${countsWant[k]}`);
  const label = await p.getAttribute('#work', 'aria-label');
  for (const n of [R.rerunnable, R.not_rerunnable, R.unstated, R.holds, R.rerunnable - R.holds, R.sent_lit, R.sent_dark, R.nine, drawnWant.struck]) {
    ok(label.includes(String(n)), `${w}px: the drawing's label lacks ${n}`);
  }
  const tl = await p.getAttribute('#tally', 'aria-label');
  for (const s of [`${R.sent_lit} of ${R.measured}`, `${R.can_reach} of ${R.can_n}`, `${R.does_reach} of ${R.does_n}`, `${R.other_reach} of ${R.other_n}`, `${R.nine_read} of ${R.nine} records`, `${R.sent_stopped} black with`, `${R.under_closed} black, on`, `${R.under_unstated} grey`, `${R.under_no_test} outlined`, `${R.no_footing} small`]) ok(tl.includes(s), `${w}px: the tally's label lacks ${s}`);
  await p.close();
}
await b.close();
console.log(`${pass} checks passed, ${fail} failed${skipped ? `, ${skipped} compared only with data.js (no Field checkout given)` : ''}`);
process.exit(fail || process.exitCode ? 1 : 0);
