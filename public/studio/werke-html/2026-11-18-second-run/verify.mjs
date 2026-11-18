// SECOND RUN — the page's numbers, read from the page and recomputed from the data.
// Usage: node verify.mjs   (needs playwright; opens index.html from this folder at 1100 and 390 px)
// It recomputes every count from data.js on its own (not from data.js's N), reads every number the
// caption and the text show, and reads what the drawing drew (window.__drawn) after the second run.
import { createRequire } from 'node:module';
import { readFileSync } from 'node:fs';
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
const meas = Object.entries(D.ev).filter(([, e]) => e.g === 'measured');
const testsOf = e => e.src.filter(r => SRC[r].test === 'yes');
const lit = meas.filter(([, e]) => testsOf(e).some(r => SRC[r].out === 'rerunnable'));
const every = meas.filter(([, e]) => testsOf(e).length && testsOf(e).every(r => SRC[r].out === 'rerunnable'));
const R = {
  sentences: cls.length,
  on_evaluation: cls.filter(k => k > 0).length,
  inferred: cls.filter(k => k === 1).length,
  open: cls.filter(k => k === 2).length,
  measured: cls.filter(k => k === 3).length,
  no_footing: cls.filter(k => k === 1 || k === 2).length,
  sources: D.sources.length,
  tests: tests.length,
  rerunnable: tests.filter(s => s.out === 'rerunnable').length,
  not_rerunnable: tests.filter(s => sealed.has(s.out)).length,
  unstated: tests.filter(s => s.out === 'unstated').length,
  sent_rerunnable: lit.length,
  sent_every: every.length,
  pass_tests: tests.filter(s => s.pass && s.pass !== 'none').length,
  nine: D.nine.length,
};
const drawnWant = {
  lit: lit.length, dark: meas.length - lit.length, black: R.measured,
  twins: R.rerunnable, open: R.rerunnable, sealed: R.not_rerunnable, grey: R.unstated,
  rings: D.sources.filter(s => s.test === 'no').length,
  slots: R.not_rerunnable + R.unstated + R.nine, nine: R.nine, pass: R.pass_tests,
  legs: meas.reduce((m, [, e]) => m + e.src.length, 0),
};
// the facts the caption states in words
const facts = [
  ['every pass-mark test was run by the maker', tests.filter(s => s.pass !== 'none').every(s => s.runner === 'maker' || s.runner === 'maker and others')],
  ['every pass mark was set by the maker', tests.filter(s => s.pass !== 'none').every(s => s.pass === 'maker')],
  ['no pass-mark test can be run again outside', tests.filter(s => s.pass !== 'none').every(s => sealed.has(s.out))],
  ['none of the nine can be repeated outside', D.nine.every(c => c.out !== 'rerunnable')],
];

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
facts.forEach(([m, c]) => ok(c, m));

const b = await chromium.launch();
for (const w of [1100, 390]) {
  const p = await (await b.newContext({ viewport: { width: w, height: 900 }, reducedMotion: 'reduce' })).newPage();
  await p.goto('file://' + join(here, 'index.html'));
  await p.waitForFunction(() => document.body.dataset.run === 'done');
  const shown = await p.$$eval('[data-n]', els => els.map(e => [e.dataset.n, e.textContent]));
  for (const [k, v] of shown) {
    ok(k in R, `${w}px: the page shows ${k}, which this script does not recompute`);
    if (k in R) ok(Number(v.replace(/,/g, '')) === R[k], `${w}px: ${k} shows ${v}, recomputed ${R[k]}`);
  }
  const drawn = await p.evaluate(() => window.__drawn);
  for (const k in drawnWant) ok(drawn[k] === drawnWant[k], `${w}px: drawn ${k} = ${drawn[k]}, recomputed ${drawnWant[k]}`);
  // the key and the drawing say the same as the caption: the work's label names the counts it draws
  const label = await p.getAttribute('#work', 'aria-label');
  for (const n of [R.rerunnable, R.not_rerunnable, R.unstated, R.sent_rerunnable, R.measured - R.sent_rerunnable, R.nine]) {
    ok(label.includes(String(n)), `${w}px: the drawing's label lacks ${n}`);
  }
  await p.close();
}
await b.close();
console.log(`${pass} checks passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
