// @ts-nocheck — engine work script shielded from the site TS gate (sandboxed display code, vetted by the collective gauntlet + checkForbidden + astro build). A missing type annotation must never turn the whole site build red — see work 011, 2026-07-06.
// Verification of A SET OF MEASURES.
//   node verify.mjs
//
// The readings are written a second time here, in another language, from the method
// stated in analysis.py rather than by importing it:
//   THE RECORD    — the 09-25 events.json, by its digest.
//   THE READINGS  — for each of the nine floors: every year's floor, the pooled slope,
//                   its standard error, every year's estimate, the totals, slope held too.
//   THE ATELIER   — the eighteen counts its session 16 published (transcribed below from
//                   window/cycle-003-session-16/index.html, 2026-09-26), matched exactly.
//   THE VESSELS   — every bore radius, every capacity, every throat.
//   THE FILE      — every point of every cavity outline in cups.scad.
//   THE PAGE      — every ring drawn, every caption and table cell, no script, no load.
//   THE READER    — a real browser, scripting on and off, network refused, 390 and
//                   1280 px, light and dark.
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { dirname, join } from 'path';

const here = dirname(new URL(import.meta.url).pathname);
const raw = readFileSync(join(here, '..', '2026-09-25-below-the-trace', 'events.json'));
const R = JSON.parse(readFileSync(join(here, 'results.json'), 'utf8'));
const HTML = readFileSync(join(here, 'index.html'), 'utf8');
const SCAD = readFileSync(join(here, 'cups.scad'), 'utf8');

let pass = 0, fail = 0;
const ok = (name, cond, note) => {
  if (cond) pass++;
  else { fail++; console.log('  FAIL  ' + name + (note !== undefined ? '  — ' + note : '')); }
};
const eq = (name, got, want) => ok(name, JSON.stringify(got) === JSON.stringify(want),
  `got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
const near = (name, got, want, tol) => ok(name, Math.abs(got - want) <= tol, `got ${got}, expected ${want}`);
const EPS = 1e-9, MREF = 1.0, H = 4, RMIN = 4, WALL = 2, FOOT = 2;
const fmt = v => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

// ── 1. the record
eq('record · digest', createHash('sha256').update(raw).digest('hex'), R.record_sha256);
const byYear = new Map();
for (const [y, , m] of JSON.parse(raw).events) {
  if (!byYear.has(y)) byYear.set(y, []);
  if (m !== null) byYear.get(y).push(m);
}
const YS = [...byYear.keys()].sort((a, b) => a - b);
eq('record · years', YS, R.years);

// ── 2. the readings
const mode = ms => {
  const c = new Map();
  for (const v of ms) { const k = Math.floor(v * 10 + EPS); c.set(k, (c.get(k) || 0) + 1); }
  const top = Math.max(...c.values());
  return Math.min(...[...c].filter(([, n]) => n === top).map(([k]) => k)) / 10;
};
const r1 = v => Math.round(v * 10) / 10;
function reading(delta, bFixed) {
  const mc = new Map(YS.map(y => [y, r1(mode(byYear.get(y)) + delta)]));
  let s = 0, n = 0;
  for (const y of YS) for (const v of byYear.get(y)) if (v >= mc.get(y) - EPS) { s += v - (mc.get(y) - 0.005); n++; }
  const b = bFixed ?? Math.LOG10E / (s / n);
  const per = YS.map(y => {
    const ms = byYear.get(y);
    const w = ms.filter(v => v >= MREF - EPS).length, a = ms.filter(v => v >= mc.get(y) - EPS).length;
    const est = mc.get(y) <= MREF + EPS ? w : a * 10 ** (b * (mc.get(y) - MREF));
    return Math.max(0, est - w);
  });
  return { b, n, per };
}
const bHeld = reading(0.2).b;
near('readings · held slope is the 09-25 slope', bHeld, R.slope_held_value, 1e-6);
eq('readings · nine floors', R.cups.map(c => c.floor_above_mode), [0, 0.1, 0.2, 0.3, 0.4, 0.5, 0.6, 0.7, 0.8]);
const sum = a => a.reduce((x, y) => x + y, 0);
const mine = [];
for (const c of R.cups) {
  const d = c.floor_above_mode, t = `reading +${d.toFixed(1)}`;
  const { b, n, per } = reading(d), held = reading(d, bHeld);
  mine.push({ total: Math.round(sum(per)), held: Math.round(sum(held.per)), b });
  near(`${t} · slope`, b, c.b, 5e-5);
  near(`${t} · slope SE`, b / Math.sqrt(n), c.b_se, 5e-5);
  eq(`${t} · earthquakes above the floor`, n, c.b_events);
  eq(`${t} · unwritten total`, Math.round(sum(per)), c.not_written_est);
  eq(`${t} · unwritten total, slope held`, Math.round(sum(held.per)), c.not_written_est_slope_held);
  eq(`${t} · years counted complete`, per.filter(u => u < 0.5).length, c.years_counted_complete);
  per.forEach((u, i) => near(`${t} · ${YS[i]} estimate`, u, c.per_year_not_written_est[i], 0.051));
  const w = y => byYear.get(y).filter(v => v >= MREF - EPS).length;
  const share = yy => sum(yy.map(w)) / sum(yy.map(y => w(y) + per[YS.indexOf(y)]));
  near(`${t} · share written 1974–79`, share(YS.filter(y => y <= 1979)), c.share_written_1974_1979, 5e-4);
  near(`${t} · share written 2016–25`, share(YS.filter(y => y >= 2016)), c.share_written_2016_2025, 5e-4);

  // ── 4. the vessel of this reading
  const radii = per.map(u => Math.max(RMIN, Math.sqrt(u * 100 / (Math.PI * H))));
  radii.forEach((r, i) => near(`${t} · ${YS[i]} bore`, r, c.bore_radius_mm[i], 5e-4));
  const cap = sum(radii.map(r => Math.PI * r * r * H)) / 1000;
  near(`${t} · capacity`, cap, c.capacity_ml, 0.051);
  near(`${t} · data volume = total / 10`, sum(per) / 10, c.data_ml, 0.051);
  near(`${t} · throat = capacity − data`, Math.max(0, cap - sum(per) / 10), c.throat_ml, 0.006);
  per.forEach((u, i) => { if (u * 100 / (Math.PI * H) >= RMIN * RMIN) near(`${t} · ${YS[i]} ring holds U/10 ml`, Math.PI * radii[i] ** 2 * H / 1000, u / 10, 1e-9); });
}

// ── 3. the Atelier, session 16: floor +0.0 … +0.8, slope re-estimated / slope held
const ATELIER_B = [0.816, 0.829, 0.862, 0.886, 0.913, 0.932, 0.957, 0.966, 0.989];
const ATELIER_REEST = [5190, 5460, 7043, 8421, 10252, 11512, 13817, 14511, 16902];
const ATELIER_HELD = [5902, 6121, 7043, 7604, 8129, 8104, 8368, 7864, 7657];
mine.forEach((m, i) => {
  eq(`atelier · +${(i / 10).toFixed(1)} re-estimated`, m.total, ATELIER_REEST[i]);
  eq(`atelier · +${(i / 10).toFixed(1)} held`, m.held, ATELIER_HELD[i]);
  eq(`atelier · +${(i / 10).toFixed(1)} slope`, Math.round(m.b * 1000) / 1000, ATELIER_B[i]);
});

// ── 5. the fabrication file
const polys = [...SCAD.matchAll(/^CAVITY_(\d) = (\[.*\]);$/gm)];
eq('file · nine cavity outlines', polys.map(p => +p[1]), [0, 1, 2, 3, 4, 5, 6, 7, 8]);
for (const [, i, js] of polys) {
  const P = JSON.parse(js), c = R.cups[+i], t = `file · cavity ${i}`;
  eq(`${t} · points`, P.length, 2 + 2 * YS.length);
  ok(`${t} · starts on the axis at the foot`, P[0][0] === 0 && P[0][1] === FOOT);
  ok(`${t} · ends on the axis at the rim`, P.at(-1)[0] === 0 && P.at(-1)[1] === FOOT + H * YS.length);
  let vol = 0, good = true;
  for (let k = 0; k < YS.length; k++) {
    const [a, b] = [P[1 + 2 * k], P[2 + 2 * k]];
    if (!(a[0] === b[0] && Math.abs(a[1] - (FOOT + k * H)) < 1e-9 && Math.abs(b[1] - (FOOT + (k + 1) * H)) < 1e-9)) good = false;
    if (Math.abs(a[0] - c.bore_radius_mm[k]) > 1e-3) good = false;
    vol += Math.PI * a[0] ** 2 * H;
  }
  ok(`${t} · one 4 mm ring per year at the recorded bore`, good);
  near(`${t} · encloses the recorded capacity`, vol / 1000, c.capacity_ml, 0.06);
}
ok('file · wall and foot as recorded', /^WALL = 2\.0;$/m.test(SCAD) && /^FOOT = 2\.0;$/m.test(SCAD));

// ── 6. the page, as text
ok('page · no script element', !/<script/i.test(HTML));
ok('page · nothing loaded from elsewhere', !/\ssrc\s*=/i.test(HTML) && !/<link/i.test(HTML) && !/@import|url\(/i.test(HTML));
ok('page · estimate labelled as one', /estimate/i.test(HTML) && /cannot establish/i.test(HTML));
ok('page · the file stated as not compiled', /not compiled here/.test(HTML));
const figs = [...HTML.matchAll(/<figure class="cup[^"]*" data-floor="([\d.]+)">([\s\S]*?)<\/figure>/g)];
eq('page · nine vessels', figs.length, 9);
const S = 0.9;
for (const [, fl, body] of figs) {
  const c = R.cups.find(x => x.floor_above_mode.toFixed(1) === fl), t = `page · vessel +${fl}`;
  const rings = [...body.matchAll(/<rect data-year="(\d+)" data-r="([\d.]+)" x="[\d.]+" y="[\d.]+" width="([\d.]+)" height="([\d.]+)"\/>/g)];
  eq(`${t} · one ring per year`, rings.map(r => +r[1]), YS);
  ok(`${t} · every ring at its bore, at one scale`, rings.every((r, i) =>
    Math.abs(+r[2] - c.bore_radius_mm[i]) < 1e-3 && Math.abs(+r[3] - 2 * c.bore_radius_mm[i] * S) < 0.01 && Math.abs(+r[4] - H * S) < 0.01));
  ok(`${t} · caption`, body.includes(`${c.capacity_ml.toFixed(1)} ml`) && body.includes(`≈${fmt(c.not_written_est)} unwritten`) && body.includes(`b ${c.b.toFixed(3)}`));
  ok(`${t} · table row`, HTML.includes(`<td>+${fl}</td><td>${c.b.toFixed(3)} ± ${c.b_se.toFixed(3)}</td><td>${fmt(c.b_events)}</td><td>${fmt(c.not_written_est)}</td><td>${fmt(c.not_written_est_slope_held)}</td><td>${c.capacity_ml.toFixed(1)}</td>`));
}
ok('page · the published reading marked, only once', (HTML.match(/the one we printed/g) || []).length === 1 && /data-floor="0.2"/.test(HTML));
ok('page · smallest and largest stated', HTML.includes(`<b>${R.cups[0].capacity_ml.toFixed(1)} ml</b>`) && HTML.includes(`<b>${R.cups[8].capacity_ml.toFixed(1)} ml</b>`));

// ── 7. the reader
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
  const boxes = await p.locator('svg.v').evaluateAll(els => els.map(e => e.getBoundingClientRect().height));
  ok(`${tag} · nine vessels drawn`, boxes.length === 9 && boxes.every(h => h > 150), JSON.stringify(boxes));
  if (width >= 1280) {
    const ws = await p.locator('svg.v').evaluateAll(els => els.map(e => e.getBoundingClientRect().width));
    ok(`${tag} · vessels at one scale (width tracks the widest bore)`, ws.every((w, i) =>
      Math.abs(w - (2 * (Math.max(...R.cups[i].bore_radius_mm) + WALL) * S + 28)) < 1.5), JSON.stringify(ws));
  }
  const docW = await p.locator('html').evaluate(e => e.scrollWidth).catch(() => null);
  if (docW !== null) ok(`${tag} · no page-wide horizontal scroll`, docW <= width, docW);
  const bg = await p.locator('body').evaluate(e => getComputedStyle(e).backgroundColor).catch(() => null);
  if (bg !== null) ok(`${tag} · body background set`, bg && bg !== 'rgba(0, 0, 0, 0)', bg);
  await ctx.close();
}
await browser.close();

console.log(`${pass} passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
