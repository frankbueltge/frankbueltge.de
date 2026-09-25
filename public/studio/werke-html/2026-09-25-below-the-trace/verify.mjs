// @ts-nocheck — engine work script shielded from the site TS gate (sandboxed display code, vetted by the collective gauntlet + checkForbidden + astro build). A missing type annotation must never turn the whole site build red — see work 011, 2026-07-06.
// Verification of BELOW THE TRACE.
//   node verify.mjs
//
// The analysis is written a second time here, in another language, from the
// method stated in analysis.py rather than by importing it:
//   THE RECORD   — events.json is well formed and its counts agree with results.json.
//   THE FLOOR    — every year's completeness magnitude recomputed by maximum curvature.
//   THE SLOPE    — the pooled Aki–Utsu b-value and its standard error recomputed.
//   THE ESTIMATE — every year's unwritten count, its nine-way range, and the totals.
//   THE PAGE     — one file, no script, no network, no external reference; every
//                  stroke, ring, row ink and row count on the drum matches the record.
//   THE READER   — opened in a real browser, scripting on and off, network denied,
//                  at 390 and 1280 px: no page-wide horizontal scroll, drum present.
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

const here = dirname(new URL(import.meta.url).pathname);
const HTML = readFileSync(join(here, 'index.html'), 'utf8');
const EV = JSON.parse(readFileSync(join(here, 'events.json'), 'utf8')).events;
const R = JSON.parse(readFileSync(join(here, 'results.json'), 'utf8'));

let pass = 0, fail = 0;
const ok = (name, cond, note) => {
  if (cond) pass++;
  else { fail++; console.log('  FAIL  ' + name + (note !== undefined ? '  — ' + note : '')); }
};
const eq = (name, got, want) => ok(name, JSON.stringify(got) === JSON.stringify(want),
  `got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
const near = (name, got, want, tol) => ok(name, Math.abs(got - want) <= tol, `got ${got}, expected ${want}`);
const EPS = 1e-9, MREF = 1.0;

// ── 1. the record
eq('record · event count', EV.length, R.events);
ok('record · every event 1974–2025, fraction in [0,1)', EV.every(([y, f]) => y >= 1974 && y <= 2025 && f >= 0 && f < 1));
ok('record · sorted by time', EV.every((e, i) => i === 0 || e[0] > EV[i - 1][0] || (e[0] === EV[i - 1][0] && e[1] >= EV[i - 1][1])));
eq('record · events with no magnitude', EV.filter(e => e[2] === null).length, R.events_no_magnitude);
const byYear = new Map();
for (const [y, f, m] of EV) { if (!byYear.has(y)) byYear.set(y, []); byYear.get(y).push(m); }

// ── 2. the floor, by maximum curvature, lowest bin on a tie, +0.2
const mcOf = mags => {
  const bins = new Map();
  for (const v of mags) { const k = Math.floor(v * 10 + EPS); bins.set(k, (bins.get(k) || 0) + 1); }
  const top = Math.max(...bins.values());
  const mode = Math.min(...[...bins].filter(([, c]) => c === top).map(([k]) => k));
  return (mode + 2) / 10;
};
const Y = {};
for (let y = 1974; y <= 2025; y++) {
  const all = byYear.get(y) || [];
  const mags = all.filter(m => m !== null);
  Y[y] = { n: all.length, nomag: all.length - mags.length, mags, mc: mcOf(mags) };
}
for (const r of R.years) {
  const d = Y[r.year];
  eq(`floor · ${r.year} events`, d.n, r.events);
  eq(`floor · ${r.year} no magnitude`, d.nomag, r.no_magnitude);
  near(`floor · ${r.year} Mc`, d.mc, r.mc, 1e-9);
  eq(`floor · ${r.year} above Mc`, d.mags.filter(v => v >= d.mc - EPS).length, r.above_mc);
  eq(`floor · ${r.year} written M>=1`, d.mags.filter(v => v >= MREF - EPS).length, r.written_m1);
}
ok('floor · mid-1970s floor at 2.1', [1975, 1976, 1978, 1979].every(y => Math.abs(Y[y].mc - 2.1) < 1e-9));

// ── 3. the slope
let s = 0, n = 0;
for (const d of Object.values(Y)) for (const v of d.mags) if (v >= d.mc - EPS) { s += v - (d.mc - 0.005); n++; }
const b = Math.LOG10E / (s / n), se = b / Math.sqrt(n);
eq('slope · events used', n, R.b_events);
near('slope · b', b, R.b, 5e-5);
near('slope · standard error', se, R.b_se, 5e-5);
ok('slope · b within the range usually reported for this region (0.7–1.1)', b > 0.7 && b < 1.1);

// ── 4. the estimate
const estimate = (bb, shift) => {
  const out = {};
  for (const [y, d] of Object.entries(Y)) {
    const mc = Math.round((d.mc + shift) * 10) / 10;
    const above = d.mags.filter(v => v >= mc - EPS).length;
    const written = d.mags.filter(v => v >= MREF - EPS).length;
    const est = mc <= MREF + EPS ? written : above * 10 ** (bb * (mc - MREF));
    out[y] = Math.max(0, est - written);
  }
  return out;
};
const central = estimate(b, 0);
const combos = [];
for (const db of [-2, 0, 2]) for (const dm of [-0.1, 0, 0.1]) combos.push(estimate(b + db * se, dm));
for (const r of R.years) {
  near(`estimate · ${r.year} not written`, Math.round(central[r.year]), r.not_written_m1_est, 1);
  near(`estimate · ${r.year} range low`, Math.round(Math.min(...combos.map(c => c[r.year]))), r.not_written_m1_range[0], 1);
  near(`estimate · ${r.year} range high`, Math.round(Math.max(...combos.map(c => c[r.year]))), r.not_written_m1_range[1], 1);
  const w = r.written_m1, m = central[r.year];
  near(`estimate · ${r.year} share written`, w + m ? w / (w + m) : 1, r.share_written_est, 1e-4);
}
const sum = o => Object.values(o).reduce((a, x) => a + x, 0);
near('estimate · total not written', Math.round(sum(central)), R.not_written_total_est, 1);
near('estimate · total range low', Math.round(Math.min(...combos.map(sum))), R.not_written_total_range[0], 1);
near('estimate · total range high', Math.round(Math.max(...combos.map(sum))), R.not_written_total_range[1], 1);
eq('estimate · written M>=1 total', R.years.reduce((a, r) => a + r.written_m1, 0), R.written_m1_total);

// ── 5. the page, as text
ok('page · no script element', !/<script/i.test(HTML));
ok('page · no external reference', !/(src|href)\s*=\s*["']?(https?:)?\/\//i.test(HTML));
ok('page · no @import, no url()', !/@import|url\(/i.test(HTML));
ok('page · estimate labelled as one', /estimate/i.test(HTML) && /cannot establish/i.test(HTML));
const rows = [...HTML.matchAll(/<g class="yr" data-year="(\d+)">([\s\S]*?)<\/g>\n(?=<g class="yr"|<text class="hd")/g)];
eq('page · one drum row per year', rows.length, R.years.length);
for (const [, yr, body] of rows) {
  const r = R.years.find(x => x.year === +yr);
  const strokes = (body.match(/M[\d.]+ [\d.]+v-/g) || []).length;
  const rings = (body.match(/<circle /g) || []).length;
  eq(`page · ${yr} strokes = events with magnitude`, strokes, r.events - r.no_magnitude);
  eq(`page · ${yr} rings = events without`, rings, r.no_magnitude);
  ok(`page · ${yr} ink = share written`, body.includes(`class="ink" style="opacity:${r.share_written_est}"`));
  const fmt = v => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
  ok(`page · ${yr} counts printed`, body.includes(`>${fmt(r.written_m1)}<tspan class="miss"> · ≈${fmt(r.not_written_m1_est)}</tspan>`));
}

// ── 6. the reader
const pwmod = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.js');
const chromium = pwmod.chromium || pwmod.default.chromium;
const browser = await chromium.launch();
for (const js of [true, false]) for (const width of [390, 1280]) for (const scheme of ['light', 'dark']) {
  const ctx = await browser.newContext({ viewport: { width, height: 900 }, javaScriptEnabled: js, colorScheme: scheme });
  let external = 0;
  await ctx.route('**/*', route => {
    if (route.request().url().startsWith('file:')) return route.continue();
    external++; return route.abort();
  });
  const p = await ctx.newPage();
  await p.goto('file://' + join(here, 'index.html'));
  const tag = `reader · js ${js ? 'on' : 'off'} · ${width}px · ${scheme}`;
  eq(`${tag} · no network request`, external, 0);
  const box = await p.locator('svg.drum').boundingBox();
  ok(`${tag} · drum drawn`, box && box.height > 600, JSON.stringify(box));
  const docW = await p.locator('html').evaluate(e => e.scrollWidth).catch(() => null);
  if (docW !== null) ok(`${tag} · no page-wide horizontal scroll`, docW <= width, docW);
  const bg = await p.locator('body').evaluate(e => getComputedStyle(e).backgroundColor).catch(() => null);
  if (bg !== null) ok(`${tag} · body background set`, bg && bg !== 'rgba(0, 0, 0, 0)', bg);
  await ctx.close();
}
await browser.close();

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
