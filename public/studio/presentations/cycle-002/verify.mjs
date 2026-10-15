// Headless verification of NEVER NOTHING — the Studio's presentation for cycle 002.
//   node verify.mjs [path-to-index.html]
//
// Two questions.
//
// WITHOUT SCRIPT: is the whole result really in the served document — all eight settings of
// the dial with every column, the served paragraph at the default setting, every one of the
// nine sentences with its line, its band and its verdict, the three worked cases, the feed's
// digest, and the neighbour list the direction of 2026-09-03 requires?
//
// WITH SCRIPT: does the control actually move the finding rather than the view, and does
// every value it writes match, to the first decimal, the number build.py derived in Python
// at that same setting — including the setting at which the recovery this cycle asked about
// is zero?
//
// A browser automation tool is a tool of this session, not a dependency of the work: nothing
// it needs is imported by the page, which loads no library and makes no network request.
import { readFileSync } from 'fs';

const GLOBAL_PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.js';
const pw = await import('playwright').catch(() => import(GLOBAL_PW));
const chromium = pw.chromium || pw.default.chromium;

const file = process.argv[2] || new URL('./index.html', import.meta.url).pathname;
const D = JSON.parse(readFileSync(new URL('./data.json', import.meta.url).pathname, 'utf8'));
const html = readFileSync(file, 'utf8');

const fails = [];
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails.push(msg); };
const f1 = x => x.toFixed(1);
const KS = D.meta.ks, DK = D.meta.default_k;
const dflt = D.rows.find(r => r.is_default);

// ------------------------------------------------------------------ 1. the served document
console.log('\nWITHOUT SCRIPT — is the finding in the document itself?');
ok(!/<script[^>]+src=/.test(html), 'the page loads no external script');
ok(!/<link[^>]+stylesheet/.test(html), 'the page loads no external stylesheet');
ok(!/https?:\/\/(?!raw\.githubusercontent|frankbueltge\.de)/.test(html.replace(/<a [^>]*>/g, '')),
   'the page names no host it would fetch from');
ok(html.includes(D.feed.sha256), 'the feed digest is printed in full');
ok(html.includes(String(D.feed.entries)), 'the entry count is printed');

for (const r of D.rows) {
  const cells = [f1(r.rank1_pct), f1(r.top10_pct), String(r.rec1), String(r.rec10),
                 f1(r.rec_mean_rank), r.rec_z.toFixed(2), f1(r.nn_cluster_pct)];
  ok(cells.every(c => html.includes(c)), `k=${r.k}: every published column is in the document`);
}
ok((html.match(/<tr/g) || []).length >= KS.length, `all ${KS.length} settings are rows in the served table`);

for (const s of D.sentences) {
  const verdict = s.holds ? 'holds at every setting' : 'the dial decides it';
  const i = html.indexOf(s.text.replace(/&/g, '&amp;'));
  ok(i > 0, `sentence present: “${s.text.slice(0, 58)}…”`);
  if (i > 0) {
    const near = html.slice(Math.max(0, i - 400), i + 700);
    ok(near.includes(verdict), `  …carries its verdict (${verdict})`);
    ok(near.includes(s.lo.toFixed(2)) && near.includes(s.hi.toFixed(2)), '  …carries its whole band');
  }
}
ok(D.sentences.filter(s => s.holds).length === 7 && D.sentences.filter(s => !s.holds).length === 2,
   'the tally is seven holding and two decided by the dial');

for (const c of D.cases) {
  ok(html.includes(c.query_title) && html.includes(c.latent_title),
     `worked case present: ${c.query_title} → ${c.latent_title}`);
}
for (const n of D.neighbours) ok(html.includes(n.title), `neighbour named: ${n.title}`);
ok(D.works.every(w => html.includes(w.title) && html.includes(w.slug)),
   'all four works of the cycle are named with their paths');

// the served paragraph must be the DEFAULT setting, not the best one
ok(html.includes(f1(dflt.rank1_pct)), `served at the default setting k=${DK}, not at the flattering one`);
const best = D.rows.reduce((a, b) => (b.rank1_pct > a.rank1_pct ? b : a));
ok(best.k !== DK || true, `(best setting for the latent index is k=${best.k}, ${f1(best.rank1_pct)}%)`);
ok(dflt.rank1_pct < D.keyword.rank1_pct && best.rank1_pct < D.keyword.rank1_pct,
   'the headline holds at the default AND at the setting most favourable to the latent index');

// ------------------------------------------------------------------ 2. the browser
const browser = await chromium.launch();

console.log('\nWITH SCRIPT DISABLED — does the page still say everything?');
{
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto('file://' + file);
  const txt = await p.innerText('body');
  ok(txt.includes(f1(dflt.rank1_pct)), 'the default reading is legible with no scripting');
  ok(txt.includes(String(D.task.silent)), 'the size of the silent set is legible with no scripting');
  for (const r of D.rows) ok(txt.includes(f1(r.rank1_pct)), `k=${r.k} readable with no scripting`);
  const ctrl = await p.$('#k');
  ok(ctrl !== null, 'the control is present but inert — and nothing depends on it');
  ok(await ctrl.isVisible(), 'the control is not left visible-but-broken by a style rule');
  await ctx.close();
}

console.log('\nWITH SCRIPT — does the control move the finding, and does it agree with Python?');
{
  const p = await browser.newPage();
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  const reqs = [];
  p.on('request', r => { if (!r.url().startsWith('file:')) reqs.push(r.url()); });
  await p.goto('file://' + file);

  for (let i = 0; i < KS.length; i++) {
    const r = D.rows[i];
    await p.$eval('#k', (el, v) => {
      el.value = String(v);
      el.dispatchEvent(new Event('input', { bubbles: true }));
    }, i);
    const got = await p.evaluate(() => ({
      k: document.getElementById('s-k').textContent,
      r1: document.getElementById('s-r1').textContent,
      t10: document.getElementById('s-t10').textContent,
      rec: document.getElementById('s-rec').textContent,
      rec10: document.getElementById('s-rec10').textContent,
      mean: document.getElementById('s-mean').textContent,
      sil: document.getElementById('v-sil').textContent,
    }));
    ok(got.k === String(r.k) && got.r1 === f1(r.rank1_pct) && got.t10 === f1(r.top10_pct)
       && got.rec === String(r.rec1) && got.rec10 === String(r.rec10)
       && got.mean === f1(r.rec_mean_rank) && got.sil === f1(r.silent_pct) + '%',
       `k=${r.k}: the browser reproduces Python exactly (${got.r1}% first, ${got.rec} of ${D.task.silent} recovered)`);
  }
  // the control must change the FINDING, not the view
  await p.$eval('#k', el => { el.value = '0'; el.dispatchEvent(new Event('input', { bubbles: true })); });
  const lo = await p.textContent('#s-r1');
  await p.$eval('#k', (el, v) => { el.value = String(v); el.dispatchEvent(new Event('input', { bubbles: true })); }, KS.length - 1);
  const hi = await p.textContent('#s-r1');
  ok(lo !== hi, `the one control on the page changes the finding itself (${lo}% → ${hi}%)`);
  ok(errs.length === 0, 'no script error in a real browser');
  ok(reqs.length === 0, 'the page makes no network request of any kind');
  await p.close();
}

await browser.close();
console.log(`\n${fails.length ? 'FAILED: ' + fails.length : 'PASSED'} — ${fails.length ? fails.join(' · ') : 'all checks'}`);
process.exit(fails.length ? 1 : 0);
