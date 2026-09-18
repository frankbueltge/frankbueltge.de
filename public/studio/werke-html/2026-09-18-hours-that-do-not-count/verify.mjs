// @ts-nocheck — engine work script shielded from the site TS gate (sandboxed display code, vetted by the collective gauntlet + checkForbidden + astro build). A missing type annotation must never turn the whole site build red — see work 011, 2026-07-06.
// Headless verification of THE HOURS THAT DO NOT COUNT.
//   node verify.mjs [path-to-index.html]
//
// Six questions.
//   THE ISLAND    — is the page one file, carrying its own data, reaching for nothing?
//   THE ARITHMETIC— do counts.json's numbers agree with each other, and does data.json
//                   agree with counts.json? (counts.json is re-derived here where it can be.)
//   WITHOUT SCRIPT— does a reader with no JavaScript get the whole work: every headline
//                   number, the wall drawn in full, both bar figures, the capture strip,
//                   and all four tables?
//   THE DRAWING   — the wall claims one cell per hour, shaded by how many stations were
//                   silent. The claim is measured out of the SVG itself: every rect is
//                   decoded back to an hour index and a level, and compared with the series
//                   in counts.json, which the page never sees.
//   WITH SCRIPT   — do the three readings redraw the wall to exactly their own series, and
//                   does pointing at a cell report that cell's hour?
//   THE NETWORK   — is any request made off the filesystem, in either state?
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

// A browser automation tool is a tool of this session, not a dependency of the work.
const GLOBAL_PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.js';
const pw = await import('playwright').catch(() => import(GLOBAL_PW));
const chromium = pw.chromium || pw.default.chromium;

const here = dirname(new URL(import.meta.url).pathname);
const file = process.argv[2] || join(here, 'index.html');
const D = JSON.parse(readFileSync(join(here, 'data.json'), 'utf8'));
const C = JSON.parse(readFileSync(join(here, 'counts.json'), 'utf8'));
const html = readFileSync(file, 'utf8');

const fails = [];
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails.push(msg); };
const sp = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');
const has = (s) => html.includes(s);

// ---------------------------------------------------------------- THE ISLAND
console.log('\nTHE ISLAND');
ok(!/<script[^>]+\ssrc=/i.test(html), 'no external script is loaded');
ok(!/<link[^>]+rel=["']?stylesheet/i.test(html), 'no external stylesheet is loaded');
ok(!/<(img|iframe|video|audio|object|embed)\b/i.test(html), 'no external media element');
ok(!/@import|url\(/i.test(html), 'no CSS fetches anything');
{
  const urls = [...html.matchAll(/https?:\/\/[^\s"'<>)]+/g)].map(m => m[0]);
  const inAttr = [...html.matchAll(/(?:src|href)\s*=\s*["']([^"']+)["']/gi)].map(m => m[1]);
  const fetching = inAttr.filter(u => !/^https:\/\/eur-lex\.europa\.eu\//.test(u));
  ok(fetching.length === 0, `the only linked address is the directive itself (${inAttr.length} link, ${urls.length} addresses named in prose)`);
}
{
  const m = html.match(/<script type="application\/json" id="d">([\s\S]*?)<\/script>/);
  ok(!!m, 'the page carries its data inline');
  ok(m && m[1] === readFileSync(join(here, 'data.json'), 'utf8'), 'the inline JSON is byte-identical to data.json');
  ok(m && !m[1].includes('</script'), 'the inline JSON cannot close its own element');
}

// ------------------------------------------------------------ THE ARITHMETIC
console.log('\nTHE ARITHMETIC');
const T = C.totals, CAP = C.capture, W = C.wall;
ok(C.stations.length === T.stations_with_no2, `${T.stations_with_no2} stations carried in counts.json`);
{
  let span = 0, pres = 0, miss = 0, runs = 0, one = 0;
  for (const s of C.stations) {
    span += s.span; pres += s.present; miss += s.missing; runs += s.n_holes;
    ok_quiet(s.span === s.last_hour - s.first_hour + 1, 'span');
    ok_quiet(s.present + s.missing === s.span, 'present+missing=span');
    let h = 0; for (const [, l] of s.holes) h += l;
    ok_quiet(h === s.missing, 'hole run lengths sum to missing');
    for (const [, l] of s.holes) if (l === 1) one++;
  }
  ok(span === T.span_hours && pres === T.present_hours && miss === T.hole_hours,
     `per-station spans, values and holes re-add to ${sp(T.span_hours)} / ${sp(T.present_hours)} / ${sp(T.hole_hours)}`);
  ok(runs === T.hole_runs, `${sp(T.hole_runs)} separate holes, re-counted`);
  ok(one === Number(C.shape.hole_run_lengths['1']), `${sp(one)} of them are exactly one hour, re-counted`);
  ok(Math.abs(pres / span - T.capture_span) < 1e-12, `capture over the spans is ${(100 * T.capture_span).toFixed(3)} %`);
}
{
  let e = 0; for (const [k, v] of Object.entries(C.shape.hole_run_lengths)) e += Number(k) * v;
  ok(e === T.hole_hours, 'the run-length histogram accounts for every missing hour');
  let n = 0; for (const v of Object.values(C.shape.hole_run_lengths)) n += v;
  ok(n === T.hole_runs, 'the run-length histogram accounts for every hole');
}
{
  const byHod = new Array(24).fill(0);
  for (let i = 0; i < W.hole.length; i++) byHod[i % 24] += W.hole[i];
  ok(byHod.every((v, i) => v === C.shape.holes_by_hour_of_day[i]),
     'the clock is the wall summed by hour of day');
  ok(byHod.reduce((a, b) => a + b, 0) === T.hole_hours, 'the clock accounts for every missing hour');
  const peak = byHod.indexOf(Math.max(...byHod));
  ok(peak === 1, `the commonest missing hour is 01:00 (${sp(byHod[1])} h) and the rarest is ${String(byHod.indexOf(Math.min(...byHod))).padStart(2, '0')}:00`);
}
{
  const below = C.stations.filter(s => s.capture_year < 0.9).length;
  ok(below === CAP.below_90_year, `${below} stations below 90 % of the calendar year, re-counted`);
  const belowS = C.stations.filter(s => s.capture_span < 0.9).length;
  ok(belowS === CAP.below_90_span, `${belowS} below 90 % of their own span, re-counted`);
  ok(belowS < below, 'the two denominators disagree, and the page prints both');
}
{
  const exc = C.stations.reduce((a, s) => a + s.exceedances, 0);
  ok(exc === T.exceedance_hours, `${exc} hours above the ${C.law.hourly_limit_value_no2} µg/m³ limit, re-added`);
  ok(C.stations.filter(s => s.exceedances > 0).length === 1, 'all of them at one station');
  ok(C.stations.every(s => s.exceedances <= C.law.hourly_limit_allowance),
     `no station reaches the ${C.law.hourly_limit_allowance} the directive allows`);
}
{
  const D2 = C.two_doors;
  ok(D2.agree === D2.with_max && D2.max_above_hours === 0 && D2.max_below_hours === 0,
     `all ${sp(D2.agree)} published daily maxima equal the largest hourly value of their day`);
  ok(D2.max_but_no_hour === 0, 'no day carries a maximum with no hours behind it');
  ok(D2.hours_hist_without_max.slice(18).every(v => v === 0),
     'from 18 hours upward every station-day carries a maximum, without exception');
  ok(D2.hours_hist_with_max.slice(0, 4).every(v => v === 0) && D2.min_hours_with_max === 4,
     `the lowest a published maximum stands on is ${D2.min_hours_with_max} hours`);
  ok(D2.offset_agreement['0'] > 10 * Math.max(D2.offset_agreement['-1'], D2.offset_agreement['+1']),
     'the maximum belongs to the day it is dated, decided against ±1 day');
  const tot = D2.with_max + D2.without_max;
  ok(tot === D2.checked, 'every station-day checked is accounted for');
}
{
  // flat runs: every run of >=12 identical values sits at a low value
  let mx = 0, n = 0;
  for (const s of C.stations) for (const [, l, v] of s.flat_runs_ge12) { if (v > mx) mx = v; if (l >= 12) n++; }
  ok(mx <= 8, `every run of 12 h or more of the identical value sits at ${mx} µg/m³ or below`);
  ok(n === T.flat_runs_ge12, `${sp(n)} such runs, re-counted`);
  const bands = D.flat_bands;
  for (const b of bands) ok_quiet(b.n > 0, 'band non-empty');
  const lo = bands.filter(b => b.band === '0–6');
  ok(lo.length === 2 && lo.find(b => !b.tenths).hours > 10 * lo.find(b => b.tenths).hours,
     'in the cleanest band a whole-number station holds >10× the still hours of a tenths station');
}
{
  ok(C.register_vs_record.length === D.register.length && D.register.length === 9,
     'nine stations where the register and the archive disagree');
  ok(C.register_vs_record.filter(r => r.register.startsWith('2026')).length === 5,
     'five of them are listed as starting in 2026');
}
{
  // data.json agrees with counts.json
  ok(D.head.holes === T.hole_hours && D.head.present === T.present_hours
     && D.head.runs === T.hole_runs && D.head.stations === T.stations_with_no2,
     'data.json repeats counts.json without drift');
  ok(D.wall.hole.length === C.source.hours_in_year, `the wall is ${sp(C.source.hours_in_year)} hours long`);
  ok(D.wall.hole.every((v, i) => v === W.hole[i]), 'the wall in data.json is the wall in counts.json');
  ok(D.stations.length === C.stations.length, 'every station reaches the page');
}

function ok_quiet(cond, what) { if (!cond) { console.log('  FAIL ' + what); fails.push(what); } }

// -------------------------------------------------------------------- BROWSER
const browser = await chromium.launch();

async function run(js) {
  const ctx = await browser.newContext({ javaScriptEnabled: js });
  const page = await ctx.newPage();
  const offFs = [];
  await page.route('**/*', r => {
    const u = r.request().url();
    if (!u.startsWith('file://')) { offFs.push(u); return r.abort(); }
    return r.continue();
  });
  await page.goto('file://' + file, { waitUntil: 'load' });
  return { ctx, page, offFs };
}

// --------------------------------------------------------------- WITHOUT SCRIPT
console.log('\nWITHOUT SCRIPT');
{
  const { ctx, page, offFs } = await run(false);
  const nrm = t => t.replace(/[\s\u202f\u00a0\u2009]+/g, ' ');
  const text = nrm(await page.locator('body').innerText());
  const must = [
    [sp(T.hole_hours), 'the missing hours'],
    [sp(T.present_hours), 'the published values'],
    [sp(T.hole_runs), 'the number of holes'],
    [sp(Number(C.shape.hole_run_lengths['1'])), 'the one-hour holes'],
    [String(T.exceedance_hours), 'the exceedance count'],
    [sp(T.stations_with_no2), 'the station count'],
    [String(CAP.below_90_year), 'the stations below 90 % of the year'],
    [sp(C.two_doors.agree), 'the agreeing daily maxima'],
  ];
  for (const [s, what] of must) ok(text.includes(nrm(s)), `${what} (${s}) is in the served text`);
  ok(/do not include losses of data due to the regular calibration/.test(text),
     'the directive sentence the whole argument turns on is quoted in full');
  ok(text.includes('No cause is inferred anywhere on this page'),
     'the page says in its own words that it infers no cause');

  const rects = await page.$$eval('#wallg rect', rs => rs.map(r => ({
    x: +r.getAttribute('x'), y: +r.getAttribute('y'),
    w: +r.getAttribute('width'), h: +r.getAttribute('height'),
    c: r.getAttribute('class'),
  })));
  const nonzero = W.hole.filter(v => v).length;
  ok(rects.length === nonzero, `the wall carries ${sp(nonzero)} cells with no script — one per hour in which someone was silent`);

  // decode every rect back to its hour and its level
  const mx = Math.max(...W.hole);
  const seen = new Set();
  let bad = 0, badlvl = 0;
  for (const r of rects) {
    if (r.w !== 3 || r.h !== 12) { bad++; continue; }
    const day = r.x / 3, hod = r.y / 12;
    if (!Number.isInteger(day) || !Number.isInteger(hod) || hod > 23 || day >= D.days) { bad++; continue; }
    const i = day * 24 + hod;
    if (seen.has(i)) { bad++; continue; }
    seen.add(i);
    const v = W.hole[i];
    if (!v) { bad++; continue; }
    const lvl = Math.min(6, 1 + Math.floor(6 * (v - 1) / mx));
    if (r.c !== 'w' + lvl) badlvl++;
  }
  ok(bad === 0, 'every cell decodes to one distinct hour that really is missing somewhere');
  ok(badlvl === 0, 'every cell\'s shade is the level its own station count demands');
  ok(seen.size === nonzero, 'no missing hour is left undrawn');

  const bars = await page.$$eval('svg rect.bar, svg rect.bar.hi', rs => rs.map(r => +r.getAttribute('height')));
  ok(bars.length === 24 + D.runlen.length, `the two bar figures carry ${24 + D.runlen.length} bars`);
  const clock = bars.slice(0, 24), cm = Math.max(...clock);
  ok(clock.indexOf(cm) === 1, 'the tallest bar of the clock is 01:00');
  {
    const want = C.shape.holes_by_hour_of_day, wm = Math.max(...want);
    let off = 0;
    for (let i = 0; i < 24; i++) if (Math.abs(clock[i] / cm - want[i] / wm) > 0.002) off++;
    ok(off === 0, 'every bar of the clock is as tall as its own number');
  }
  const ticks = await page.$$eval('svg line.st', ls => ls.map(l => l.getAttribute('class')));
  ok(ticks.length === C.stations.length, `the capture strip carries one tick per station (${ticks.length})`);
  ok(ticks.filter(c => c.includes('low')).length === CAP.below_90_year,
     `${CAP.below_90_year} of them are marked below the line`);

  const rows = await page.$$eval('table tbody tr', rs => rs.length);
  ok(rows === D.longest_holes.length + D.flat_bands.length + D.resolution.length + D.register.length,
     `the four tables carry ${rows} rows and none is empty`);
  const t1 = await page.$$eval('table:nth-of-type(1) tbody tr td.n:nth-child(3)', ts => ts.map(t => t.textContent));
  ok(t1[0].replace(/ /g, ' ') === sp(D.longest_holes[0].len).replace(/ /g, ' '),
     `the longest hole in the table is ${sp(D.longest_holes[0].len)} hours`);

  ok(await page.locator('#layers').isHidden(), 'the reading switch is hidden when it cannot work');
  ok(offFs.length === 0, 'no request left the filesystem');
  await ctx.close();
}

// ------------------------------------------------------------------ WITH SCRIPT
console.log('\nWITH SCRIPT');
{
  const { ctx, page, offFs } = await run(true);
  await page.waitForFunction(() => !document.getElementById('layers').hidden);
  ok(true, 'the reading switch appears when a script can drive it');

  const count = () => page.$$eval('#wallg rect', rs => rs.length);
  const layers = [['hole', D.wall.hole], ['flat', D.wall.flat], ['outside', D.wall.outside]];
  for (const [name, series] of layers) {
    await page.click(`#layers button[data-layer="${name}"]`);
    await page.waitForTimeout(40);
    const n = await count();
    const want = series.filter(v => v).length;
    ok(n === want, `the "${name}" reading draws ${sp(want)} cells, one per hour it is true of`);
    const readout = await page.locator('#wallout').innerText();
    ok(readout.includes(sp(series.reduce((a, b) => a + b, 0))),
       `and reports its own total, ${sp(series.reduce((a, b) => a + b, 0))} station-hours`);
    // the shades must again be exactly right
    const mx = Math.max(...series);
    const rs = await page.$$eval('#wallg rect', rr => rr.map(r => [+r.getAttribute('x'), +r.getAttribute('y'), r.getAttribute('class')]));
    let bad = 0;
    for (const [x, y, c] of rs) {
      const i = (x / 3) * 24 + y / 12, v = series[i];
      if (!v) { bad++; continue; }
      if (c !== 'w' + Math.min(6, 1 + Math.floor(6 * (v - 1) / mx))) bad++;
    }
    ok(bad === 0, `and every one of its cells lands on the right hour at the right shade`);
  }

  await page.click('#layers button[data-layer="hole"]');
  await page.waitForTimeout(40);
  // point at three known hours and read them back
  const box = await page.locator('#wallg').boundingBox();
  const svgBox = await page.locator('svg:has(#wallg)').boundingBox();
  const probe = [[0, 1], [180, 13], [365, 23]];
  for (const [day, hod] of probe) {
    const i = day * 24 + hod;
    const x = box.x + (day + 0.5) * (box.width / D.days);
    const y = box.y + (hod + 0.5) * (box.height / 24);
    await page.mouse.move(x, y);
    await page.waitForTimeout(30);
    const r = await page.locator('#wallout').innerText();
    const t = new Date(Date.UTC(2024, 0, 1) + i * 3600000);
    const want = `${t.getUTCFullYear()}-${String(t.getUTCMonth() + 1).padStart(2, '0')}-${String(t.getUTCDate()).padStart(2, '0')} ${String(t.getUTCHours()).padStart(2, '0')}:00`;
    ok(r.includes(want), `pointing at day ${day}, hour ${hod} reads back ${want}`);
    ok(r.includes(String(D.wall.hole[i])) || (D.wall.hole[i] === 0 && r.includes('no')),
       `and reports ${D.wall.hole[i]} station(s) silent there`);
  }
  ok(svgBox.width > 0, 'the wall occupies the page');
  ok(offFs.length === 0, 'no request left the filesystem with scripting on either');
  await ctx.close();
}

await browser.close();
const total = fails.length;
console.log(`\n${total === 0 ? 'ALL CHECKS PASSED' : total + ' CHECK(S) FAILED'}`);
if (total) { for (const f of fails) console.log('  - ' + f); process.exit(1); }
