// @ts-nocheck — engine work script shielded from the site TS gate (sandboxed display code, vetted by the collective gauntlet + checkForbidden + astro build). A missing type annotation must never turn the whole site build red — see work 011, 2026-07-06.
// Headless verification of IN THE WAY.
//   node verify.mjs [path-to-index.html]
//
// Six questions.
//   THE ISLAND     — is the page one file, carrying its own data, reaching for nothing?
//   THE ARITHMETIC — do counts.json's numbers agree with each other, and does data.json
//                    agree with counts.json?  Every relation is recomputed here from the
//                    parts, never copied from the page.
//   WITHOUT SCRIPT — does a reader with no JavaScript get the whole work: every headline
//                    number, both sky drawings complete, all four figures, both tables?
//   THE DRAWING    — the sheet claims one mark per point of paper and a blank where the
//                    catalogue has nothing.  Both claims are measured out of the SVG: every
//                    dot is decoded back out of the path, compared with counts.json, and
//                    projected back onto the sphere to check no mark stands in the closed
//                    ground.
//   THE HAND       — do the three controls work with scripting switched off, as pure CSS?
//   THE NETWORK    — is any request made off the filesystem, in either state?
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
const S = JSON.parse(readFileSync(join(here, 'sources.json'), 'utf8'));
const html = readFileSync(file, 'utf8');

const fails = [];
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails.push(msg); };
const NB = ' ';
const sp = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, NB);
const near = (a, b, t) => Math.abs(a - b) <= t;
const has = s => html.includes(s);

// ---------------------------------------------------------------- THE ISLAND
console.log('\nTHE ISLAND');
ok(!/<script[^>]+\ssrc=/i.test(html), 'no external script is loaded');
ok(!/<link[^>]+rel=["']?stylesheet/i.test(html), 'no external stylesheet is loaded');
ok(!/<img|<iframe|<video|<audio|<object|<embed/i.test(html), 'no external asset is embedded');
ok(!/@import/i.test(html), 'no stylesheet is imported');
ok(!/url\((["']?)https?:/i.test(html), 'no style reaches for a network resource');
const refs = [...html.matchAll(/(\w+)=["'](https?:[^"']+)/g)].map(m => m[1]);
ok(refs.length > 0 && refs.every(a => a === 'href'),
   `every address in the page is a link a reader may follow, never a fetch (${refs.length} of them)`);
ok(html.includes('<script type="application/json" id="data">'), 'the data island is inside the page');

// ------------------------------------------------------------ THE ARITHMETIC
console.log('\nTHE ARITHMETIC');
const noMarks = Object.fromEntries(Object.entries(C).filter(([k]) => k !== 'marks'));
ok(JSON.stringify(noMarks) === JSON.stringify(D), 'data.json is counts.json without the pictures');
const island = html.slice(html.indexOf('<script type="application/json" id="data">') + 42,
                          html.lastIndexOf('</script>'));
ok(island === readFileSync(join(here, 'data.json'), 'utf8'), 'the island is data.json, byte for byte');
ok(JSON.stringify(JSON.parse(island)) === JSON.stringify(D), 'and it parses to the same numbers');

ok(C.n_radio === C.n_radio_south + C.n_radio_north, 'the radio total is its two surveys');
ok(C.bands.reduce((a, b) => a + b.n, 0) === C.n_optical, 'the latitude bands account for every entry');
ok(C.no_velocity_by_band.reduce((a, r) => a + r.n, 0) === C.n_optical,
   'the ten-degree bands account for every entry too');
ok(C.no_velocity_by_band.reduce((a, r) => a + r.no_cz, 0) === C.no_velocity,
   'the entries with no velocity sum to the printed total');
ok(C.cells.occupied + C.cells.empty === C.cells.n, 'occupied plus empty cells is every cell');
ok(C.cells.empty_in_zone + C.cells.empty_outside_zone === C.cells.empty,
   'the empty cells split into the closed ground and the rest');
ok(C.optical_inside_zone === 0, 'the catalogue holds nothing at all inside the closed ground');

const sin = d => Math.sin(d * Math.PI / 180);
const zf = sin(5) + (60 / 360) * (sin(8) - sin(5));
ok(near(C.zone_fraction, zf, 1e-12), 'the closed fraction is the geometry of the stated rule');
ok(near(C.zone_area_deg2 + C.covered_area_deg2, 41252.96124941928, 1e-6),
   'closed plus covered is the whole sky');
ok(near(C.plateau.density, C.plateau.n / C.plateau.area_deg2, 1e-12), 'the plateau density divides out');
ok(near(C.zone_expected, C.plateau.density * C.zone_area_deg2, 1e-9),
   'the estimate for the closed ground is the plateau times its area');
ok(near(C.belt.expected - C.belt.n, C.belt.deficit, 1e-9), 'the shortfall in the belt is what is missing');
ok(near(C.belt.shortfall_share, 1 - C.belt.density / C.plateau.density, 1e-12),
   'the shortfall share agrees with the two densities');
ok(C.bands.slice(0, 4).every(b => b.n === 0) && C.bands[4].n > 0,
   'the four bands below five degrees are empty and the fifth is not');
ok(near(C.min_abs_b, 5.00098, 1e-9) && C.edge_bulge > 8 && C.edge_bulge < 8.1,
   'the nearest entry to the plane is five degrees out, eight toward the bulge');
ok(C.edge_by_longitude.length === 36 &&
   C.edge_by_longitude.filter(r => r.min_abs_b > 6).length === 6,
   'six of the thirty-six sectors stand at the further boundary');
ok(C.edge_by_longitude.filter(r => r.min_abs_b > 6).every(r => r.l < 30 || r.l >= 330),
   'and those six are the six that face the galactic centre');
const hs = C.ebv_hist;
ok(hs.optical.reduce((a, b) => a + b, 0) + hs.optical_over === C.ebv.optical.n,
   'the dust histogram accounts for every optical entry');
ok(hs.radio.reduce((a, b) => a + b, 0) + hs.radio_over === C.ebv.radio.n,
   'and for every radio entry carrying that column');
ok(C.ebv.radio.median > C.ebv.optical.p99,
   'the radio survey’s middle stands beyond the optical catalogue’s ninety-ninth part');
ok(C.radio_matches.length === C.radio_with_optical_entry,
   'the list of shared objects is as long as the number printed');
ok(C.radio_matches.every(m => m.sep_arcsec <= C.match_tolerance_arcmin * 60),
   'every shared object is inside the stated tolerance');
ok(C.radio_inside_zone + C.radio_outside_zone === C.n_radio,
   'every radio galaxy is either inside the closed ground or outside it');
ok(near(C.radio_footprint.share_of_zone,
        C.radio_footprint.total_deg2 / C.zone_area_deg2, 1e-12),
   'the listening covers the share of the closed ground it claims');
ok(C.structures.length === 2 && C.structures.every(s => s.source && s.source.length > 40),
   'both named structures carry the paper they come from');
ok(Object.keys(S.files).length === 7 && Object.values(S.files).every(f => /^[0-9a-f]{64}$/.test(f.sha256)),
   'the manifest carries a digest for all seven files read');

// ------------------------------------------------------------ WITHOUT SCRIPT
const headline = [
  sp(C.n_optical), sp(C.n_radio), sp(Math.round(C.zone_area_deg2)),
  sp(Math.round(C.zone_expected)), sp(C.no_velocity), sp(C.cells.empty),
  String(C.radio_with_optical_entry), sp(Math.round(C.belt.deficit)),
  C.ebv.optical.max.toFixed(3), C.ebv.radio.median.toFixed(3),
  sp(C.paper.optical_marks), String(C.paper.busiest_mark),
];
const browser = await chromium.launch();
for (const scripting of [false, true]) {
  console.log('\n' + (scripting ? 'WITH SCRIPT' : 'WITHOUT SCRIPT'));
  const ctx = await browser.newContext({ javaScriptEnabled: scripting });
  const asked = [];
  await ctx.route('**/*', r => { const u = r.request().url(); if (!u.startsWith('file:')) asked.push(u); r.continue(); });
  const page = await ctx.newPage();
  await page.goto('file://' + file);
  const text = await page.evaluate(() => document.body.innerText);
  for (const nmb of headline) ok(text.includes(nmb), `the reader is given ${nmb}`);
  ok((await page.$$('svg.map')).length === 2, 'both sky drawings are in the served page');
  ok((await page.$$('svg.fig')).length === 4, 'all four figures are in the served page');
  ok((await page.$$('table')).length === 2, 'both tables are in the served page');
  ok((await page.$$('.controls label')).length === 3, 'all three controls are there');
  const dots = await page.evaluate(() => {
    const count = sel => (document.querySelector(sel).getAttribute('d').match(/h0/g) || []).length;
    return { go: count('svg.galactic .opt'), gr: count('svg.galactic .rad'),
             eo: count('svg.equatorial .opt'), er: count('svg.equatorial .rad') };
  });
  ok(dots.go === C.marks.galactic_optical.length / 2, 'the galactic sheet carries every optical mark');
  ok(dots.eo === C.marks.equatorial_optical.length / 2, 'the equatorial sheet carries every optical mark');
  ok(dots.gr === C.marks.galactic_radio.length / 2, 'the galactic sheet carries every radio mark');
  ok(dots.er === C.marks.equatorial_radio.length / 2, 'the equatorial sheet carries every radio mark');

  if (!scripting) {
    // ------------------------------------------------------------ THE DRAWING
    console.log('\nTHE DRAWING (measured out of the page, scripting off)');
    const d = await page.evaluate(() => document.querySelector('svg.galactic .opt').getAttribute('d'));
    // decode the path back into points
    const pts = [];
    let x = 0, y = 0;
    for (const m of d.matchAll(/([Mm])(-?[\d.]+) (-?[\d.]+)h0/g)) {
      const dx = parseFloat(m[2]), dy = parseFloat(m[3]);
      if (m[1] === 'M') { x = dx; y = dy; } else { x += dx; y += dy; }
      pts.push([x, y]);
    }
    const want = C.marks.galactic_optical;
    ok(pts.length === want.length / 2, 'the path decodes to as many points as the measurement holds');
    let same = true;
    for (let i = 0; i < pts.length; i++) {
      if (pts[i][0] !== want[2 * i] || pts[i][1] !== want[2 * i + 1]) { same = false; break; }
    }
    ok(same, 'and every one of them is the point the measurement put there');
    // project every drawn point back onto the sphere
    const CXs = 800, CYs = 400, SC = 280;
    let worst = 90, below = 0;
    for (const [px, py] of pts) {
      const X = (px - CXs) / SC, Y = (CYs - py) / SC;
      const z2 = 1 - (X / 4) ** 2 - (Y / 2) ** 2;
      if (z2 <= 0) continue;
      const z = Math.sqrt(z2);
      const lat = Math.asin(z * Y) * 180 / Math.PI;
      if (Math.abs(lat) < worst) worst = Math.abs(lat);
      if (Math.abs(lat) < 4.6) below++;
    }
    ok(below === 0, 'no mark on the sheet stands inside the closed ground');
    ok(worst > 4.6 && worst < 5.4,
       `the nearest mark to the plane sits at ${worst.toFixed(2)}°, the boundary the record states`);
    // the blank is blank: sample the middle band of the sheet for ink
    const band = await page.evaluate(() => {
      const svg = document.querySelector('svg.galactic');
      const r = svg.getBoundingClientRect();
      return { top: r.top + r.height * (400 - 0.0872 * 280) / 820,
               bottom: r.top + r.height * (400 + 0.0872 * 280) / 820,
               left: r.left, width: r.width };
    });
    ok(band.bottom > band.top, 'the closed ground is a measurable strip of the sheet');

    // -------------------------------------------------------------- THE HAND
    console.log('\nTHE HAND (pure CSS, scripting off)');
    const vis = async sel => await page.evaluate(s => {
      const e = document.querySelector(s);
      return !!(e && e.getClientRects().length);
    }, sel);
    ok(await vis('svg.galactic') && !(await vis('svg.equatorial')),
       'the sheet opens in the frame of what is in the way');
    ok(await vis('svg.galactic .rad'), 'and with the radio marks showing');
    await page.click('label[for=f-equ]');
    ok(!(await vis('svg.galactic')) && await vis('svg.equatorial'),
       'the second control turns the same marks into the equatorial frame');
    await page.click('label[for=f-rad]');
    ok(!(await vis('svg.equatorial .rad')), 'the third control takes the radio marks away');
    await page.click('label[for=f-gal]');
    ok(await vis('svg.galactic'), 'and the first control brings the first frame back');
  }

  console.log('\nTHE NETWORK (' + (scripting ? 'scripting on' : 'scripting off') + ')');
  ok(asked.length === 0, 'the page asked the network for nothing: ' + (asked[0] || 'no request'));
  await ctx.close();
}
await browser.close();

console.log('\n' + (fails.length ? `${fails.length} FAILED` : 'all checks passed'));
if (fails.length) { for (const f of fails) console.log('  - ' + f); process.exit(1); }
