// Verification of WOVEN BY DAY.
//   node verify.mjs
//
// Everything is recomputed here in a second language from the method stated in analysis.py,
// not by importing it. The local hour comes from the platform's own time-zone database
// (Intl), not from Python's zoneinfo.
//   THE RECORD  — events.json by its digest; the type counts.
//   THE COUNTS  — every band x hour count, night mean, ratio, dark points; the blasts and
//                 their red points; the two ratios either side of M 1.2; the estimate;
//                 the weekday and weekend counts; the unsized events at 11-12.
//   THE LOOM    — the 8x8 threshold built again; every pick of the lift plan in cloth.wif
//                 and its weft colour, compared with a cloth woven here from the counts.
//   THE PAGE    — the drawn cloth read back from its paths, pick for pick; every number
//                 in the text; no script, nothing loaded.
//   THE READER  — a real browser at 390, 768 and 1280 px, light and dark, network refused.
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { dirname, join } from 'path';

const here = dirname(new URL(import.meta.url).pathname);
const raw = readFileSync(join(here, 'events.json'));
const R = JSON.parse(readFileSync(join(here, 'results.json'), 'utf8'));
const HTML = readFileSync(join(here, 'index.html'), 'utf8');
const WIF = readFileSync(join(here, 'cloth.wif'), 'utf8');

let ran = 0, failed = 0;
const ok = (name, cond, note) => {
  ran++;
  if (!cond) { failed++; console.log('  FAIL  ' + name + (note !== undefined ? '  — ' + note : '')); }
};
const eq = (name, got, want) => ok(name, JSON.stringify(got) === JSON.stringify(want),
  `got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
const near = (name, got, want, tol = 1e-4) => ok(name, Math.abs(got - want) <= tol, `got ${got}, expected ${want}`);
const fmt = v => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const EPS = 1e-9;

// ── 1. the record
const E = JSON.parse(raw);
eq('record · digest', createHash('sha256').update(raw).digest('hex'), R.events_sha256);
eq('record · events', E.events.length, R.events);
const byType = Object.fromEntries(E.types.map(t => [t, 0]));
for (const [, , t] of E.events) byType[E.types[t]]++;
eq('record · types', byType, R.by_type);

// ── 2. the counts
const F = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', hourCycle: 'h23', weekday: 'short', year: 'numeric' });
const local = ms => {
  const p = Object.fromEntries(F.formatToParts(new Date(ms)).map(x => [x.type, x.value]));
  return { h: +p.hour % 24, we: p.weekday === 'Sat' || p.weekday === 'Sun', y: +p.year };
};
const LABELS = ['no size', '< 0.6', '0.6', '0.8', '1.0', '1.2', '1.4', '1.6', '1.8', '2.0', '2.2', '2.4', '2.6', '3.0 +'];
const band = m => {
  if (m === null) return 'no size';
  const k = Math.floor(m * 10 + EPS);
  if (k < 6) return '< 0.6';
  if (k >= 30) return '3.0 +';
  if (k >= 26) return '2.6';
  return (Math.floor(k / 2) * 2 / 10).toFixed(1);
};
const cnt = Object.fromEntries(LABELS.map(l => [l, Array(24).fill(0)]));
const bl = Array(24).fill(0);
const ww = { eq_day_M16_weekday: 0, eq_day_M16_weekend: 0, eq_night_M16_weekday: 0, eq_night_M16_weekend: 0, blast_weekday: 0, blast_weekend: 0 };
const ns = { weekday_11_12: 0, weekday_all: 0, weekend_11_12: 0, weekend_all: 0, years_11_12: {} };
for (const [ms, m, t] of E.events) {
  const { h, we, y } = local(ms);
  const k = we ? 'weekend' : 'weekday';
  if (t === 0) {
    cnt[band(m)][h]++;
    if (m !== null && m >= 1.6 - EPS) {
      if (h >= 9 && h <= 16) ww['eq_day_M16_' + k]++;
      else if (h < 6) ww['eq_night_M16_' + k]++;
    }
    if (m === null) {
      ns[k + '_all']++;
      if (h === 11 || h === 12) { ns[k + '_11_12']++; ns.years_11_12[y] = (ns.years_11_12[y] || 0) + 1; }
    }
  } else { bl[h]++; ww['blast_' + k]++; }
}
eq('counts · bands in order', R.bands.map(b => b.band), LABELS);
const nightMean = c => (c[0] + c[1] + c[2] + c[3] + c[4] + c[5]) / 6;
const darkPts = [];
for (const b of R.bands) {
  const c = cnt[b.band], nm = nightMean(c);
  eq(`counts · ${b.band} · 24 hours`, b.counts, c);
  near(`counts · ${b.band} · night mean`, b.night_mean, nm);
  ok(`counts · ${b.band} · ratios`, c.every((x, h) => Math.abs(b.ratio[h] - x / nm) <= 5e-5));
  const d = c.map(x => Math.round(64 * Math.min(1, Math.max(0, x / nm - 0.5))));
  eq(`counts · ${b.band} · dark points`, b.dark_points, d);
  near(`counts · ${b.band} · day ratio 9–16`, b.day_ratio_9_16, c.slice(9, 17).reduce((a, x) => a + x, 0) / 8 / nm);
  darkPts.push(d);
}
eq('blasts · by hour', R.blasts_by_hour, bl);
const red = bl.map(x => Math.round(64 * x / Math.max(...bl)));
eq('blasts · red points', R.blast_red_points, red);
eq('blasts · busiest hour', R.blast_busiest_hour, 11);
const LOW = ['< 0.6', '0.6', '0.8', '1.0'];
const sumH = labs => Array.from({ length: 24 }, (_, h) => labs.reduce((a, l) => a + cnt[l][h], 0));
const lowC = sumH(LOW), highC = sumH(LABELS.filter(l => !LOW.includes(l) && l !== 'no size'));
eq('below 1.2 · by hour', R.below_1_2.counts_by_hour, lowC);
eq('1.2 and up · by hour', R.at_or_above_1_2.counts_by_hour, highC);
near('below 1.2 · day ratio', R.below_1_2.day_ratio_9_16, lowC.slice(9, 17).reduce((a, x) => a + x, 0) / 8 / nightMean(lowC));
near('1.2 and up · day ratio', R.at_or_above_1_2.day_ratio_9_16, highC.slice(9, 17).reduce((a, x) => a + x, 0) / 8 / nightMean(highC));
const est = LOW.reduce((a, l) => a + cnt[l].reduce((s, x) => s + nightMean(cnt[l]) - x, 0), 0);
near('below 1.2 · estimate', R.below_1_2.estimate_unwritten_if_every_hour_were_night, est, 0.05);
eq('weekday and weekend', R.weekday_weekend, ww);
eq('unsized at 11–12', R.no_size_at_11_12, { ...ns, years_11_12: Object.fromEntries(Object.entries(ns.years_11_12).map(([k, v]) => [String(k), v])) });

// ── 3. the loom
const bayer = n => n === 1 ? [[0]] : (() => {
  const s = bayer(n / 2), o = [];
  for (let i = 0; i < n; i++) { o.push([]); for (let j = 0; j < n; j++) o[i].push(4 * s[i % (n / 2)][j % (n / 2)] + [[0, 2], [3, 1]][Math.floor(i / (n / 2))][Math.floor(j / (n / 2))]); }
  return o;
})();
const B8 = bayer(8);
eq('loom · threshold', R.cloth.bayer8, B8);
ok('loom · threshold is a permutation of 0–63', [...B8.flat()].sort((a, b) => a - b).every((v, i) => v === i));
const rows = [...darkPts.map(p => [p, 2]), [red, 3]];
const cloth = [];
for (const [p, col] of rows) for (let i = 0; i < 8; i++) {
  const r = []; for (let h = 0; h < 24; h++) for (let j = 0; j < 8; j++) r.push(B8[i][j] < p[h] ? col : 0);
  cloth.push(r);
}
const ENDS = 192, PICKS = cloth.length;
eq('loom · size', [R.cloth.ends, R.cloth.picks], [ENDS, PICKS]);
eq('loom · dark and red crossings', [R.cloth.points_dark, R.cloth.points_red],
  [cloth.flat().filter(x => x === 2).length, cloth.flat().filter(x => x === 3).length]);
const sec = name => { const m = WIF.split('\n[' + name + ']\n')[1]; return m.split('\n\n')[0].trim().split('\n').map(l => l.split('=')); };
ok('wif · header', WIF.startsWith('[WIF]\nVersion=1.1\nDate='));
eq('wif · shafts and threads', [WIF.includes(`Shafts=${ENDS}`), WIF.match(/\[WARP\]\nThreads=(\d+)/)[1], WIF.match(/\[WEFT\]\nThreads=(\d+)/)[1]], [true, String(ENDS), String(PICKS)]);
const thr = sec('THREADING');
ok('wif · straight threading', thr.length === ENDS && thr.every(([e, s]) => e === s));
const lift = sec('LIFTPLAN'), wc = sec('WEFT COLORS');
eq('wif · picks', [lift.length, wc.length], [PICKS, PICKS]);
for (let p = 1; p <= PICKS; p++) {
  const row = cloth[PICKS - p];
  const up = new Set(lift[p - 1][1].split(',').filter(Boolean).map(Number));
  const col = row.includes(3) ? 3 : (p <= 8 ? 3 : 2);
  ok(`wif · pick ${p}`, +lift[p - 1][0] === p && row.every((c, e) => (c === 0) === up.has(e + 1)) && +wc[p - 1][1] === col);
}

// ── 4. the page
ok('page · no script, nothing loaded', !/<script/i.test(HTML) && !/\ssrc\s*=/i.test(HTML) && !/<link/i.test(HTML) && !/@import|url\(/i.test(HTML));
const drawn = Array.from({ length: PICKS }, () => Array(ENDS).fill(0));
for (const [cls, col] of [['weft', 2], ['red', 3]]) {
  const d = HTML.match(new RegExp(`<path class="${cls}" d="([^"]*)"`))[1];
  for (const m of d.matchAll(/M(\d+) (\d+)h(\d+)v1h-(\d+)z/g)) {
    const [x, y, w, w2] = m.slice(1).map(Number);
    for (let i = x; i < x + w; i++) drawn[y][i] = drawn[y][i] ? -1 : col;
    if (w !== w2) drawn[y][x] = -1;
  }
}
for (let y = 0; y < PICKS; y++) ok(`page · drawn pick ${PICKS - y}`, drawn[y].every((c, e) => c === cloth[y][e]));
const txt = HTML.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ');
const has = s => ok(`page · says "${s}"`, txt.includes(s));
has(`${fmt(R.events)} events within 40 km`);
has(`0.80 of the night's rate`);
has(`${R.at_or_above_1_2.day_ratio_9_16.toFixed(2)} the same ratio`);
has(`≈ ${fmt(Math.round(est))} small earthquakes`);
has(`${fmt(bl[11])} of the catalogue's ${fmt(R.events - byType.earthquake)} labelled blasts`);
has(`${fmt(ww.blast_weekday)} fall on weekdays and ${fmt(ww.blast_weekend)} at weekends`);
has(`On weekends ${ns.weekend_11_12} of ${ns.weekend_all}`);
has(`${(ns.weekend_11_12 / ns.weekend_all * 100).toFixed(1)} %`);
has(`On weekdays it is ${ns.weekday_11_12} of ${ns.weekday_all}, ${(ns.weekday_11_12 / ns.weekday_all * 100).toFixed(1)} %`);
has(`${Object.entries(ns.years_11_12).filter(([y]) => y >= 2001 && y <= 2006).reduce((a, [, v]) => a + v, 0)} of those ${ns.weekday_11_12 + ns.weekend_11_12} fall in 2001–2006`);
has(`at ${(cnt['no size'][11] / nightMean(cnt['no size'])).toFixed(2)} × its night`);
ok('page · 11 is the darkest unsized hour', cnt['no size'].indexOf(Math.max(...cnt['no size'])) === 11);
has(`between ${Math.min(...lowC.slice(6, 20)).toString() && (Math.min(...lowC.slice(6, 20)) / nightMean(lowC)).toFixed(2)} and ${(Math.max(...lowC.slice(6, 20)) / nightMean(lowC)).toFixed(2)} of its rate`);
ok('page · every hour 06–19 below the night', lowC.slice(6, 20).every(x => x < nightMean(lowC)));
has(`${fmt(R.cloth.points_dark)} of its ${fmt(ENDS * PICKS)} crossings show the dark weft and ${fmt(R.cloth.points_red)} show the red`);
ok('page · table rows', (HTML.match(/<tr><th>/g) || []).length === 15 && (HTML.match(/<tr class="bl">/g) || []).length === 1);

// ── 5. the reader
const pw = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.js');
const browser = await (pw.chromium || pw.default.chromium).launch();
const file = 'file://' + join(here, 'index.html');
const bgs = {};
for (const [width, scheme] of [[390, 'light'], [768, 'dark'], [1280, 'light'], [390, 'dark']]) {
  const p = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: scheme });
  const reqs = []; p.on('request', r => { if (!r.url().startsWith('file:')) reqs.push(r.url()); });
  await p.goto(file);
  ok(`browser ${width} ${scheme} · no horizontal overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  ok(`browser ${width} ${scheme} · nothing requested`, reqs.length === 0);
  ok(`browser ${width} ${scheme} · cloth drawn at full width`, await p.$eval('svg.cloth', e => e.getBoundingClientRect().width > 300));
  bgs[scheme] = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await p.close();
}
ok('browser · dark scheme differs from light', bgs.light !== bgs.dark);
await browser.close();

// record 3 · counts 1 + 14 bands x 5 + blasts 3 + 2 + 2 + 1 + 1 + 1 · loom 4 + wif 4 + 120 picks
// · page 1 + 120 drawn picks + 16 · reader 4 x 3 + 1
const DECLARED = 3 + (1 + 14 * 5 + 3 + 2 + 2 + 1 + 1 + 1) + (4 + 4 + 120) + (1 + 120 + 16) + (4 * 3 + 1);
console.log(`${ran} checks, ${failed} failed (declared ${DECLARED})`);
if (ran !== DECLARED) { console.log('FAIL: ran a different number of checks than declared'); process.exit(1); }
process.exit(failed ? 1 : 0);
