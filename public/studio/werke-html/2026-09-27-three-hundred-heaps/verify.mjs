// THREE HUNDRED HEAPS — verification by a second route.
//
//   node verify.mjs [path/to/lattice.json]
//
// Re-reads The Field's lattice (from its address, or a local copy with the same digest), recomputes
// every sheet in this language without importing analysis.py, checks results.json and the page
// against it, then opens the page in a browser: with script (every sheet poured, grain for grain),
// without script, under reduced motion, and at three widths. Every check is counted and the total
// is compared with the total declared, so the suite cannot report checks it did not run.
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { dirname, join } from 'path';

const here = dirname(new URL(import.meta.url).pathname);
const URL_ = 'https://raw.githubusercontent.com/frankbueltge/field-research/main/artifacts/2026-09-27-the-range-of-the-method/data/lattice.json';
const R = JSON.parse(readFileSync(join(here, 'results.json'), 'utf8'));
const HTML = readFileSync(join(here, 'index.html'), 'utf8');
let ran = 0, failed = 0;
const ok = (name, cond) => { ran++; if (!cond) { failed++; console.log('FAIL', name); } };

const raw = process.argv[2] ? readFileSync(process.argv[2]) : Buffer.from(await (await fetch(URL_)).arrayBuffer());
const digest = createHash('sha256').update(raw).digest('hex');
ok('lattice · digest is the one results.json records', digest === R.source.sha256);
const L = JSON.parse(raw.toString('utf8'));
const K = ['window', 'conn', 'split', 'pairing', 'text'];
const ORDER = { window: [10, 20, 40, 80, null], conn: ['all+slash', 'no-in', 'no-in-among', 'words-only', 'slash-only'],
  split: ['.;!?', '.!?', 'newline'], pairing: ['greedy', 'many'], text: ['fetched', 'decoded'] };
const id = r => K.map(k => ORDER[k].indexOf(r[k])).join('');
const scr = new Map(L.screens.map(r => [id(r), r]));
const fl = L.flags.filter(f => f.match === 'round-or-trunc');
ok('lattice · 300 screens', L.screens.length === 300 && scr.size === 300);
ok('lattice · 300 flag rows under round-or-trunc', fl.length === 300 && new Set(fl.map(id)).size === 300);

const byId = new Map(R.sheets.map(s => [s.index.join(''), s]));
ok('results · 300 sheets, each once', R.sheets.length === 300 && byId.size === 300);
let white = 0, black = 0, brown = 0;
for (const f of fl) {
  const i = id(f), s = byId.get(i), sc = scr.get(i);
  const w = f.M.consistent, c = f.M.complement, b = f.M.inconsistent;
  white += w; black += b; brown += c;
  ok(`sheet ${i} · counts`, s && s.white === w && s.brown === c && s.black === b);
  ok(`sheet ${i} · grains add to the screen's recomputable`, w + c + b === sc.M.recomputable && s.recomputable === sc.M.recomputable);
  ok(`sheet ${i} · rate and tokens`, s.rate === sc.M.rate && s.tokens === sc.M.tokens);
  const gpg = R.assumptions.grains_per_gram;
  ok(`sheet ${i} · grams`, ['white', 'brown', 'black'].every(k => Math.abs(s.heaps[k].grams - s[k] / gpg) < 0.006));
  const t = Math.tan(R.assumptions.angle_of_repose_deg * Math.PI / 180);
  const rr = n => n ? Math.cbrt(3 * (n / gpg / R.assumptions.bulk_g_per_ml * 1000) / (Math.PI * t)) : 0;
  ok(`sheet ${i} · poured radius`, ['white', 'brown', 'black'].every(k => Math.abs(s.heaps[k].r_mm - rr(s[k])) < 0.006));
  ok(`sheet ${i} · base flag`, s.base === K.every(k => f[k] === L.base[k]));
}
const S = R.summary;
const base = R.sheets.find(s => s.base);
ok('base · 289 light, 0 brown, 25 dark, 7.5372 %', base.white === 289 && base.brown === 0 && base.black === 25 && base.rate === 7.5372);
const top = R.sheets.reduce((a, s) => s.recomputable > a.recomputable ? s : a);
ok('top · 304 light, 9 brown, 719 dark, 24.772 %', top.white === 304 && top.brown === 9 && top.black === 719 && top.rate === 24.772);
ok('growth base→top · light +15, dark +694', S.growth_base_to_top.white === 15 && S.growth_base_to_top.black === 694);
ok('totals', S.grains_white === white && S.grains_black === black && S.grains_brown === brown && S.grains_total === white + black + brown && S.grains_total === 84504);
const over = R.sheets.filter(s => s.black > s.white), half = R.sheets.filter(s => 2 * s.black > s.white);
ok('10 sheets dark over light', over.length === 10 && S.sheets_black_over_white === 10);
ok('all 10: whole sentence, line breaks only, pairs reused', over.every(s => s.rule.window === null && s.rule.split === 'newline' && s.rule.pairing === 'many'));
ok('22 sheets dark over half of light', half.length === 22 && S.sheets_black_over_half_of_white === 22);
ok('all 22: pairs reused, window 80 or whole', half.every(s => s.rule.pairing === 'many' && (s.rule.window === 80 || s.rule.window === null)));
const rng = (c, k) => { const v = R.sheets.filter(s => s.rule.conn === c).map(s => s[k]); return [Math.min(...v), Math.max(...v)]; };
for (const c of ORDER.conn) ok(`light by connectives · ${c}`, JSON.stringify(rng(c, 'white')) === JSON.stringify(S.white_by_connectives[c]));
ok('light range with words and k/n is 258–304', ['all+slash', 'no-in', 'no-in-among'].every(c => JSON.stringify(rng(c, 'white')) === '[258,304]'));
ok('words-only light 60–84, slash-only 197–221', JSON.stringify(rng('words-only', 'white')) === '[60,84]' && JSON.stringify(rng('slash-only', 'white')) === '[197,221]');

// the page, as text
const nn = v => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
for (const [label, s] of [['258', '258'], ['304', '304'], ['+15', '<b>15</b>'], ['+694', '<b>694</b>'], ['84 504', nn(84504) + ' grains'],
  ['10 of 300', '<b>10</b> of 300'], ['7.54', '7.54 %'], ['24.77', '24.77 %'], ['60 to 84', 'only 60']]) {
  ok(`page · says ${label}`, HTML.includes(s));
}
ok('page · digest printed', HTML.includes(R.source.sha256));
ok('page · nothing loaded from elsewhere', !/\ssrc\s*=/i.test(HTML) && !/<link/i.test(HTML) && !/@import|url\(/i.test(HTML));
ok('page · 300 cells on the floor', (HTML.match(/class="cell( base)?" data-i=/g) || []).length === 300);
ok('page · one base cell', (HTML.match(/class="cell base"/g) || []).length === 1);
ok('page · 300 rows in the pour list', (HTML.match(/<tr( class="base")?><td>/g) || []).length === 300);
const dj = JSON.parse(HTML.match(/<script type="application\/json" id="data">(.*?)<\/script>/s)[1]);
ok('page · embedded data matches results', dj.rows.length === 300 && dj.rows.every(r => { const s = byId.get(r[0]); return s && s.white === r[1] && s.brown === r[2] && s.black === r[3] && s.rate === r[4]; }));

// the page, in a browser
const pwmod = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.js');
const chromium = pwmod.chromium || pwmod.default.chromium;
const browser = await chromium.launch();
const file = 'file://' + join(here, 'index.html');
const count = async (p, c) => p.$$eval(`#big [data-heap="${c}"] ellipse`, e => e.length);
for (const width of [390, 768, 1280]) {
  const p = await browser.newPage({ viewport: { width, height: 900 } });
  const reqs = []; p.on('request', r => { if (!r.url().startsWith('file:')) reqs.push(r.url()); });
  const errs = []; p.on('pageerror', e => errs.push(String(e)));
  await p.goto(file); await p.waitForTimeout(1500);
  ok(`browser ${width} · no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  ok(`browser ${width} · no outside requests, no errors`, reqs.length === 0 && errs.length === 0);
  ok(`browser ${width} · registered sheet poured grain for grain`, await count(p, 'white') === 289 && await count(p, 'black') === 25 && await count(p, 'brown') === 0);
  await p.close();
}
const p = await browser.newPage({ viewport: { width: 1280, height: 900 }, reducedMotion: 'reduce' });
await p.goto(file);
ok('reduced motion · poured at once', await count(p, 'white') === 289);
let all = true, sampled = 0;
for (const s of R.sheets) {
  const i = s.index.join('');
  await p.evaluate(i => { const K = ['window', 'conn', 'split', 'pairing', 'text']; K.forEach((k, j) => { document.querySelector(`input[name="${k}"][value="${i[j]}"]`).checked = true; }); document.getElementById('choose').dispatchEvent(new Event('change')); }, i);
  const got = [await count(p, 'white'), await count(p, 'brown'), await count(p, 'black')];
  const rate = await p.$eval('#rate', e => e.textContent);
  if (got[0] !== s.white || got[1] !== s.brown || got[2] !== s.black || rate !== s.rate.toFixed(2)) { all = false; console.log('sheet', i, got, rate); }
  sampled++;
}
ok('script · all 300 sheets poured grain for grain, rate read out', all && sampled === 300);
await p.click('.cell[data-i="' + top.index.join('') + '"] .sheet');
ok('script · clicking the top sheet on the floor pours 719 dark grains', await count(p, 'black') === 719);
await p.close();
const q = await browser.newPage({ viewport: { width: 390, height: 900 }, javaScriptEnabled: false });
await q.goto(file);
ok('no script · the floor is complete', await q.$$eval('#floor .cell', e => e.length) === 300);
ok('no script · the registered sheet is drawn', await q.$$eval('#big [data-heap="white"] ellipse', e => e.length) === 289);
ok('no script · controls hidden, note shown', await q.evaluate(() => getComputedStyle(document.getElementById('choose')).display === 'none' && getComputedStyle(document.querySelector('.nojs')).display !== 'none'));
ok('no script · no horizontal overflow', await q.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
await q.close();
await browser.close();

const DECLARED = 3 + 1 + 300 * 6 + 2 + 1 + 1 + 4 + 5 + 2 + 9 + 6 + 9 + 1 + 2 + 4;
console.log(`${ran} checks, ${failed} failed (declared ${DECLARED})`);
if (ran !== DECLARED) { console.log('FAIL: ran a different number of checks than declared'); process.exit(1); }
process.exit(failed ? 1 : 0);
