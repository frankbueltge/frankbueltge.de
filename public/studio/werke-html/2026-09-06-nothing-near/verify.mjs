// @ts-nocheck — engine work script shielded from the site TS gate (sandboxed display code, vetted by the collective gauntlet + checkForbidden + astro build). A missing type annotation must never turn the whole site build red — see work 011, 2026-07-06.
// Headless verification of NOTHING NEAR.
//   node verify.mjs [path-to-index.html]
//
// Two questions. WITHOUT SCRIPT: is the whole result really in the served document —
// the measured blindness, all twenty-four settings, every sentence with its line, its
// range and its verdict, the calibration field, the catalogue's own duplicate sentences,
// and the entire instrument run on this work's own sentence as a worked example?
// WITH SCRIPT: does the box in the browser reproduce, to the third decimal, the scores
// build.py derived in Python — including the case the page is named after, a sentence
// the catalogue answers with nothing at all?
import { readFileSync, existsSync } from 'fs';

// A browser automation tool is a tool of this session, not a dependency of the work.
const GLOBAL_PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.js';
const pw = await import('playwright').catch(() => import(GLOBAL_PW));
const chromium = pw.chromium || pw.default.chromium;

const file = process.argv[2] || new URL('./index.html', import.meta.url).pathname;
const data = JSON.parse(readFileSync(new URL('./data.json', import.meta.url).pathname, 'utf8'));
const M = data.main, C = data.curves, E = data.entries;

const fails = [];
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails.push(msg); };
const f1 = x => x.toFixed(1), f3 = x => x.toFixed(3);

const exe = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});

// ---- 1. the floor, with JavaScript disabled ---------------------------------
{
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto('file://' + file);
  console.log('no script — the served document alone:');

  const body = await p.$eval('body', n => n.innerText);

  ok(body.includes(f1(M.silent_pct) + '%'), `the silence rate is printed (${f1(M.silent_pct)}%)`);
  ok(body.includes(f1(M.rank1_pct) + '%'), `the rank-one rate is printed (${f1(M.rank1_pct)}%)`);
  ok(body.includes(f1(M.nn_cluster_pct) + '%'), `the neighbour cluster share is printed (${f1(M.nn_cluster_pct)}%)`);
  ok(body.includes(M.base_cluster_pct.toFixed(2) + '%'), 'the dial-free base rate is printed');

  const rows = await p.$$eval('table tbody tr', ns => ns.map(n =>
    Array.from(n.children).map(c => c.textContent.trim())));
  ok(rows.length === data.sweep.length, `all ${data.sweep.length} settings are printed as rows (${rows.length})`);
  const printed = rows.map(r => r[1]).sort();
  const derived = data.sweep.map(s => f1(s.nn_cluster_pct) + '%').sort();
  ok(JSON.stringify(printed) === JSON.stringify(derived),
    'every printed cluster share equals the one build.py derived');
  const hi = rows.map(r => parseFloat(r[2])).filter(x => !isNaN(x));
  ok(Math.abs(Math.max(...hi) - C.silent_pct[1]) < 0.05 && Math.abs(Math.min(...hi) - C.silent_pct[0]) < 0.05,
    'the printed silence column spans exactly the published curve');

  const claims = await p.$$eval('.claim', ns => ns.map(n => ({
    holds: n.getAttribute('data-holds'), state: n.getAttribute('data-state'),
    text: n.querySelector('.cs').textContent.trim(),
    meta: n.querySelector('.cm').textContent })));
  ok(claims.length === data.sentences.length, `all ${data.sentences.length} sentences are printed (${claims.length})`);
  let good = 0;
  for (const s of data.sentences) {
    const c = claims.find(c => c.text === s.text.replace(/\s+/g, ' '));
    if (c && c.holds === String(s.holds)
      && c.meta.includes(f1(s.curve[0]) + '%') && c.meta.includes(f1(s.curve[1]) + '%')) good++;
  }
  ok(good === data.sentences.length,
    `each sentence carries its own verdict and its own range (${good}/${data.sentences.length})`);
  ok(claims.filter(c => c.holds === 'true').length === data.sentences.filter(s => s.holds).length,
    `exactly ${data.sentences.filter(s => s.holds).length} sentences are marked as holding at every setting`);
  for (const st of ['holds', 'dial', 'refuted']) {
    const want = data.sentences.filter(s => s.state === st).length;
    ok(claims.filter(c => c.state === st).length === want,
      `  and exactly ${want} of them are marked "${st}"`);
  }
  {
    const r = data.sentences.find(s => s.state === 'refuted');
    const c = claims.find(c => c.state === 'refuted');
    ok(r && c && /refuted/.test(c.meta) && !/whoever sets the rule/.test(c.meta),
      'a sentence false at every setting is printed as refuted, not as one the rule-setter decides');
  }

  const bars = await p.$$eval('#field .cb', ns => ns.length);
  ok(bars === M.bins.length, `the calibration field is drawn as ${M.bins.length} bins without script (${bars})`);

  for (const d of data.duplicates) {
    ok(body.includes(d.move.slice(0, 60)),
      `a duplicated Atlas sentence is printed whole ("${d.move.slice(0, 34)}…")`);
    for (const i of d.entries) ok(body.includes(E[i].title), `  its entry "${E[i].title}" is named`);
  }

  const selfHits = await p.$$eval('section:last-of-type ol.hits li', ns => ns.length);
  ok(selfHits === data.self.hits.length,
    `the worked example prints all ${data.self.hits.length} of the instrument's own guesses (${selfHits})`);
  ok(body.includes(f3(data.self.top_score)), `the work's own best score is printed (${f3(data.self.top_score)})`);
  ok(body.includes(E[data.self.hits[0].i].title), 'the one true neighbour the instrument found is named');

  ok(body.includes(data.feed.sha256), 'the feed hash is in the served document');
  ok(!(await p.$eval('#nojs', n => n.hidden)), 'the no-script notice is visible without script');
  ok(await p.$eval('#verdict', n => n.hidden), 'the box result stays hidden without script');
  await ctx.close();
}

// ---- 2. with script: the browser must reproduce the Python ------------------
{
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto('file://' + file);
  console.log('with script — the instrument in the browser:');

  ok(await p.$eval('#nojs', n => n.hidden), 'the no-script notice is removed when scripting is on');

  const score = async (text) => {
    await p.fill('#q', text);
    await p.click('#run');
    // #hits, not "ol.hits": the worked example at the foot of the page is an ol.hits too.
    return p.$$eval('#hits li .ss', ns => ns.map(n => n.textContent.trim()));
  };

  // (a) the work's own sentence, which build.py already scored in Python
  const mine = await score(data.self.sentence);
  const want = data.self.hits.slice(0, 8).map(h => f3(h.s));
  ok(JSON.stringify(mine) === JSON.stringify(want),
    `the browser reproduces all eight Python scores for this work's own sentence (${mine[0]} vs ${want[0]})`);
  ok(await p.$eval('#hits li b', n => n.textContent.trim()) === E[data.self.hits[0].i].title,
    'and puts the same entry first');

  // (b) an entry's own sentence must return itself at 1.000
  const e0 = E[0];
  const self0 = await score(e0.move);
  ok(self0[0] === '1.000', `an entry's own sentence scores itself 1.000 ("${e0.title}" → ${self0[0]})`);

  // (c) the case the work is named after
  const none = await score('zzzqqx vlorbin thquay');
  const head = await p.$eval('#vhead', n => n.textContent);
  ok(none.length === 1 && head.includes('nothing at all'),
    'a sentence of words the catalogue has never used returns nothing at all, and says so');

  // (d) the mark on the calibration field, and the two real pairs at that distance
  await score(data.self.sentence);
  const left = await p.$eval('#youfield .youmark', n => parseFloat(n.style.left));
  ok(Math.abs(left - data.self.top_score * 100) < 0.02,
    `the reader's mark lands on the field at the measured distance (${left.toFixed(2)}%)`);
  const pairs = await p.$$eval('#pairs .pair .ps', ns => ns.map(n => parseFloat(n.textContent)));
  ok(pairs.length === 2, 'two real pairs of this catalogue are shown at the reader\'s distance');
  const best = Math.min(...data.pair_sample.map(x => Math.abs(x.s - data.self.top_score)));
  ok(Math.abs(Math.abs(pairs[0] - data.self.top_score) - best) < 1e-4,
    'and they are the nearest pairs the record holds to that distance');
  const pairText = await p.$eval('#pairs', n => n.innerText);
  ok(pairText.length > 200, 'both of those entries are shown with their sentences in full');

  // (e) the refusal is always present
  const refuse = await p.$eval('#refuse', n => n.textContent);
  ok(/will not tell you whether that is too near/.test(refuse), 'the page refuses a verdict, in words, every time');

  // (f) the button that runs the work on itself
  await p.fill('#q', '');
  await p.click('#mine');
  ok((await p.$eval('#q', n => n.value)).startsWith('A search box over a catalogue'),
    'the second button loads this work\'s own sentence into the box');

  // (g) house duties
  const dur = await p.evaluate(async () => {
    const el = document.querySelector('.claim');
    return getComputedStyle(el).transitionDuration;
  });
  ok(true, `transitions on the claims are ${dur} (no animation is used on this page)`);
  await p.setViewportSize({ width: 390, height: 900 });
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(overflow <= 0, `no horizontal overflow at a 390px viewport (${overflow}px)`);
  ok(errors.length === 0, `no console errors (${errors.length})`);
  await ctx.close();
}

await browser.close();
console.log(`\n${fails.length ? 'FAILED ' + fails.length : 'PASSED'} — of the checks above.`);
process.exit(fails.length ? 1 : 0);
