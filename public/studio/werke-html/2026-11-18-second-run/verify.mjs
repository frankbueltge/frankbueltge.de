// SECOND RUN — the page's numbers, read from the page and recomputed from the data (state 3, the check, 2026-11-19;
// state 4, the presentation, the same day: the date of a second run, and where a test ends).
// Usage: node verify.mjs [field-research checkout] [ulysses checkout]   (needs playwright; opens index.html at 1100 and 390 px)
// Given the Field's checkout, the date codes of every repeatable test are recomputed from its results84.json, not
// taken from data.js; given the Atelier's, the line where a test ends is read from its mark.json.
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

// ---- state 4: the date of a second run. A test that holds is read by the models of the result the report cites,
// one that holds less by the models it names; a claim is reached at a date where one test that holds it can be run.
let CODES = Object.fromEntries(rer.map(s => [s.ref, [s.d1, s.d2]])), CODES_L = Object.fromEntries(rer.map(s => [s.ref, [s.d1_latest, s.d2_latest]]));
const fromR84 = (pt, rd) => Object.fromEntries(rer.map(s => {
  const t = pt[s.ref]; let d1, d2;
  if (holdsAny(s)) { d1 = t.cited_code; d2 = rd.cited_can_after_2026_12_01.includes(s.ref) ? 'can' : d1 === 'can' ? 'cannot' : d1; }
  else { d1 = t.any_retired ? 'cannot' : t.code === 'all offered' ? 'can' : 'not settled'; d2 = d1; }
  return [s.ref, [d1, d2]];
}));
let r84 = null;
if (field) {
  r84 = JSON.parse(execFileSync('git', ['-C', field, 'show', `${D.meta.field_commit_check84}:${D.meta.field_path}results84.json`]).toString());
  const c = fromR84(r84.per_test.earliest, r84.readings.earliest), cl = fromR84(r84.per_test.latest, r84.readings.latest);
  for (const r in c) {
    if (JSON.stringify(c[r]) !== JSON.stringify(CODES[r])) { console.log(`FAIL date codes of ${r}: data.js ${CODES[r]}, results84 ${c[r]}`); process.exitCode = 1; }
    if (JSON.stringify(cl[r]) !== JSON.stringify(CODES_L[r])) { console.log(`FAIL latest date codes of ${r}`); process.exitCode = 1; }
  }
  CODES = c; CODES_L = cl;
}
const code = (s, d) => d === 0 ? 'can' : CODES[s.ref][d - 1];
const holdLegs = e => e.src.filter(r => SRC[r].test === 'yes' && SRC[r].out === 'rerunnable' && e.holds[r] === 'holds');
const claimAt = (e, d, C = CODES) => {
  const cs = new Set(holdLegs(e).map(r => d === 0 ? 'can' : C[r][d - 1]));
  return cs.has('can') ? 'can' : cs.has('not settled') ? 'not settled' : 'cannot';
};
const litAt = (d, C) => lit.filter(([, e]) => claimAt(e, d, C) === 'can').length;
const rowAt = (key, d) => rows[key].filter(s => s.out === 'rerunnable' && holdsAny(s) && code(s, d) === 'can').length;
Object.assign(R, {
  retired_tests: rer.filter(s => s.m84.retired.length).length, hosted_retired: hosted.filter(s => s.m84.retired.length).length,
  struck_d1: rer.filter(s => code(s, 1) === 'cannot').length, struck_d2: rer.filter(s => code(s, 2) === 'cannot').length,
  unsettled_d1: rer.filter(s => code(s, 1) === 'not settled').length,
  holds_d1: rh.filter(s => code(s, 1) === 'can').length, holds_d2: rh.filter(s => code(s, 2) === 'can').length,
  sent_d1: litAt(1), sent_d2: litAt(2), sent_d1_unsettled: lit.filter(([, e]) => claimAt(e, 1) === 'not settled').length,
  sent_d1_latest: litAt(1, CODES_L), sent_d2_latest: litAt(2, CODES_L),
  can_d1: rowAt('can', 1), can_d2: rowAt('can', 2), does_d1: rowAt('does', 1), does_d2: rowAt('does', 2), other_d1: rowAt('other', 1), other_d2: rowAt('other', 2),
});
if (r84) {
  if (R.retired_tests !== r84.readings.earliest.any_retired.length) { console.log('FAIL retired tests against results84'); process.exitCode = 1; }
  const by = r84.models_named.by_status;
  R.models_identified = Object.entries(by).filter(([k]) => k !== 'not found').reduce((m, [, v]) => m + v, 0);
  R.models_retired = by.retired; R.retired_since_report = r84.models_named.retired_after_feb_2026.length;
} else { for (const k of ['models_identified', 'models_retired', 'retired_since_report']) { R[k] = D.N[k]; skipped++; } }
const atelier = process.argv[3];
if (atelier) {
  const mk = JSON.parse(execFileSync('git', ['-C', atelier, 'show', `${D.meta.atelier_commit_line}:${D.meta.atelier_path}mark.json`]).toString());
  R.instr_line = mk.instruments.filter(i => i.line).length; R.instr_level = mk.side.mark_set;
  if (mk.instruments.length !== R.instruments) { console.log('FAIL the seven instruments, against the Atelier'); process.exitCode = 1; }
  const q = mk.instruments.find(i => i.line).quotes.find(x => x.quote === D.meta.test_line.quote);
  if (!q || q.where !== D.meta.test_line.where) { console.log('FAIL the clause where a test ends, against the Atelier'); process.exitCode = 1; }
} else { for (const k of ['instr_line', 'instr_level']) { R[k] = D.N[k]; skipped++; } }

const pairs = meas.reduce((m, [, e]) => m + e.src.length, 0);
const legsRer = meas.flatMap(([, e]) => e.src.filter(r => SRC[r].test === 'yes' && SRC[r].out === 'rerunnable').map(r => e.holds[r]));
const drawnWant = {
  lit: lit.length, dark: meas.length - lit.length, black: R.measured,
  copies: rh.length, hollow: rer.length - rh.length, open: rer.length, sealed: R.not_rerunnable, grey: R.unstated,
  rings: D.sources.filter(s => s.test === 'no').length,
  slots: R.not_rerunnable + R.unstated, nine: R.nine, pass: R.pass_tests, readers: R.nine_given,
  legs: pairs, arrive: legsRer.filter(h => h === 'holds').length, stop: legsRer.filter(h => h !== 'holds').length,
  now: R.sent_d2, once: lit.filter(([, e]) => claimAt(e, 2) === 'cannot').length, unsettled: lit.filter(([, e]) => claimAt(e, 2) === 'not settled').length,
  struck: R.struck_d2, dashed: rer.filter(s => code(s, 2) === 'not settled').length, stage: 2,
};
const dual = tests.filter(s => s.groups.length > 1);
const inRows = s => s.groups.length;     // a test cited under two rows stands in both
const maker = s => (s.runner || '').startsWith('maker');
const tallyWant = {
  reach: rh.reduce((m, s) => m + inRows(s), 0), paper: rer.filter(s => !holdsAny(s)).reduce((m, s) => m + inRows(s), 0),
  gone: rer.filter(s => code(s, 2) === 'cannot').reduce((m, s) => m + inRows(s), 0),
  unsettled: rer.filter(s => code(s, 2) === 'not settled').reduce((m, s) => m + inRows(s), 0), testLine: 1,
  sealedMaker: tests.filter(s => sealed.has(s.out) && maker(s)).reduce((m, s) => m + inRows(s), 0),
  sealed: tests.filter(s => sealed.has(s.out) && !maker(s)).reduce((m, s) => m + inRows(s), 0),
  grey: tests.filter(s => s.out === 'unstated').reduce((m, s) => m + inRows(s), 0),
  pass: R.pass_tests, noLine: 1, noTest: 1, deeds: R.nine, readers: R.nine_given, untold: R.untold_seen,
  how: rh.filter(s => s.how && s.groups.includes('control')).length, dual: dual.length,
};
const claimsWant = { lit: drawnWant.now, once: drawnWant.once, unsettled: drawnWant.unsettled, stopped: R.sent_stopped, closed: R.under_closed, unstated: R.under_unstated, noTest: R.under_no_test, waiting: 0 };
const smallWant = { grey: R.inferred, hollow: R.open };
const countsAt = st => ({
  claims: [R.sent_lit, R.sent_d1, R.sent_d2].slice(0, st + 1).concat([R.measured]),
  can: [R.can_reach, R.can_d1, R.can_d2].slice(0, st + 1).concat([R.can_n]),
  does: [R.does_reach, R.does_d1, R.does_d2].slice(0, st + 1).concat([R.does_n]),
  other: [R.other_reach, R.other_d1, R.other_d2].slice(0, st + 1).concat([R.other_n]),
  nine: [R.nine_read, R.nine],
});
const countsWant = countsAt(2);
// the facts the page states in words
const facts = [
  ['every pass-mark test was run by the maker', tests.filter(s => s.pass !== 'none').every(s => s.runner === 'maker' || s.runner === 'maker and others')],
  ['every pass mark was set by the maker', tests.filter(s => s.pass !== 'none').every(s => s.pass === 'maker')],
  ['no pass-mark test can be run again outside', tests.filter(s => s.pass !== 'none').every(s => sealed.has(s.out))],
  ['none of the nine can be repeated outside, by either reading', D.nine.every(c => c.out !== 'rerunnable' && c.out2 !== 'rerunnable')],
  ['every pass mark applies to a capability', tests.filter(s => s.pass !== 'none').every(s => s.pass_on && s.pass_on.length && s.pass_on.every(k => CAPABILITY_KINDS.has(k)))],
  ['the three marked untold are closed tests behind claims on control', D.sources.filter(s => s.untold).every(s => s.test === 'yes' && s.out !== 'rerunnable' && s.groups.includes('control'))],
  ['the one deed given an outside investigator is not drawn as read', D.nine.filter(c => c.reader).every(c => !c.read_published)],
  ['the four the check struck are the hosted tests the Field\'s second reader found gone', rer.filter(goneOf).map(s => s.ref).sort().join() === D.sources.filter(s => s.gone).map(s => s.ref).sort().join()],
  ['a date only strikes: nothing struck on 19 November can be run on 1 December', rer.every(s => code(s, 1) !== 'cannot' || code(s, 2) === 'cannot')],
  ['what a second run reaches from 1 December stands on open weights alone', rh.filter(s => code(s, 2) === 'can').every(s => s.cited_models.length && s.cited_models.every(m => /open weights/.test(m.maker)))],
  ['every test that holds and can be run on 19 November is a test of conduct', rh.filter(s => code(s, 1) === 'can').every(s => s.groups.includes('control'))],
  ['every hosted test names a retired model', hosted.every(s => s.m84.retired.length > 0)],
  ['the one law that draws where a test ends sets no level and leaves the pass mark to the developer', D.meta.test_line.mark === 'none' && D.meta.test_line.pass_mark === 'left to the developer'],
  ['the clause draws the line by the tester\'s design', D.meta.test_line.quote.includes('outside of the context of an evaluation designed to elicit this behavior')],
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
  for (const n of [R.rerunnable, R.not_rerunnable, R.unstated, R.holds, R.rerunnable - R.holds, R.sent_lit, R.sent_dark, R.nine]) {
    ok(label.includes(String(n)), `${w}px: the drawing's label lacks ${n}`);
  }
  for (const t of [`${R.struck_d1} of the ${R.rerunnable} copies`, `${R.unsettled_d1} are struck with a dashed line`, `${R.sent_d1} stay yellow`, `${R.struck_d2} in all, and ${R.sent_d2} cell stays yellow`]) ok(label.includes(t), `${w}px: the drawing's label lacks "${t}"`);
  const tl = await p.getAttribute('#tally', 'aria-label');
  const arrow = (a, b, c, n) => `${a} \u2192 ${b} \u2192 ${c} of ${n}`;
  for (const s of [`${R.sent_lit} of ${R.measured} on paper, ${R.sent_d1} on 19 November 2026, ${R.sent_d2} from 1 December 2026`, arrow(R.sent_lit, R.sent_d1, R.sent_d2, R.measured),
    arrow(R.can_reach, R.can_d1, R.can_d2, R.can_n), arrow(R.does_reach, R.does_d1, R.does_d2, R.does_n), arrow(R.other_reach, R.other_d1, R.other_d2, R.other_n),
    `no level: ${R.instr_level} of ${R.instruments} set one`, `where a test ends: ${R.instr_line} of ${R.instruments} draws it`, `${R.nine_read} of ${R.nine} records`, `${R.sent_stopped} black with`, `${R.under_closed} black, on`, `${R.under_unstated} grey`, `${R.under_no_test} outlined`, `${R.no_footing} small`]) ok(tl.includes(s), `${w}px: the tally's label lacks ${s}`);
  // the dates a visitor can choose: each button redraws the run at its date, and the counts follow
  for (const st of [0, 1, 2]) {
    await p.click(`[data-date="${st}"]`);
    const d = await p.evaluate(() => ({ t: window.__drawnT, w: window.__drawn, pressed: [...document.querySelectorAll('[data-date]')].map(b => b.getAttribute('aria-pressed')) }));
    const want = countsAt(st);
    for (const k in want) ok(JSON.stringify(d.t.counts[k]) === JSON.stringify(want[k]), `${w}px, date ${st}: count ${k} = ${d.t.counts[k]}, recomputed ${want[k]}`);
    const struck = st ? rer.filter(s => code(s, st) === 'cannot').length : 0;
    ok(d.w.struck === struck && d.w.stage === st, `${w}px, date ${st}: ${d.w.struck} copies struck, recomputed ${struck}`);
    ok(d.w.now === (st ? litAt(st) : R.sent_lit), `${w}px, date ${st}: ${d.w.now} claims lit in full`);
    ok(d.pressed.join() === [0, 1, 2].map(i => String(i === st)).join(), `${w}px, date ${st}: the pressed button`);
  }
  await p.close();
}
await b.close();
console.log(`${pass} checks passed, ${fail} failed${skipped ? `, ${skipped} compared only with data.js (no Field checkout given)` : ''}`);
process.exit(fail || process.exitCode ? 1 : 0);
