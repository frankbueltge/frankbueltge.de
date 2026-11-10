// TASK 1 — THE ADOPTED GROUND (Dramaturg STAGING-RULING-2.md §15 item 1).
// Builds, on the adopted grey-ground / centred-column / no-date-leak staging
// (g-column-html.js):
//   (a) entrance stills (1280x800, scroll 0) at 8, 25, 55 unit-days
//   (b) extent stills   (1280x800, whole column scaled to fit) at 8, 25, 55
//   (c) the longest gap (20d) and median gap (5d), TRAVERSED — a full-page
//       (fullPage:true) screenshot at a fixed 1280px viewport WIDTH, native
//       1x scale, so the grey ground actually appears flanking the paper for
//       the whole traversed distance. (Read plainly: the previous run's gap
//       stills were an ELEMENT screenshot of #stage alone, which by
//       construction excludes anything outside that element's own box — so
//       repeating that exact method here would exclude the very ground this
//       task exists to test. A full-page capture at the same native scale is
//       used instead, so the ground purpose is actually exercised; the two
//       new gap files are shot by the same method as each other, so they
//       remain comparable to one another. This choice is recorded here, not
//       silently substituted.)
//
// Every still is measured directly from its own decoded pixels: dimensions,
// fraction of pixels below luminance 250, darkest pixel's luminance, the
// ground's own luminance (sampled at a corner expected to be pure ground),
// and the paper's left/right edge x-position (sampled at a fixed row).
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { launchBrowser } = require('./canvas-lib.js');
const { buildColumnHtml, PAGE_W, PAGE_H, GROUND_RGB } = require('./g-column-html.js');
const { viewportShot } = require('./capture-lib.js');
const { fullPageShot } = require('./g-capture-lib.js');
const { fullImageStats, pixelLuminance, paperEdgesAtRow } = require('./g-measure-lib.js');

const OUT_DIR = path.resolve(__dirname, '..');
const VIEWPORT = { width: 1280, height: 800 };
const WHITE_THRESH = 250;

async function measureStill(browser, buf, opts) {
  opts = opts || {};
  const stats = await fullImageStats(browser, buf, WHITE_THRESH);
  const ground = await pixelLuminance(browser, buf, opts.groundSampleX != null ? opts.groundSampleX : 5, opts.groundSampleY != null ? opts.groundSampleY : 5);
  const edgeRow = opts.edgeRow != null ? opts.edgeRow : Math.min(400, stats.height - 1);
  const edges = await paperEdgesAtRow(browser, buf, edgeRow, GROUND_RGB, 12);
  return {
    widthPx: stats.width, heightPx: stats.height, totalPixels: stats.total,
    fractionBelowLum250: stats.belowFraction, pixelsBelowLum250: stats.belowThreshold,
    darkestPixelLuminance: stats.minLuminance,
    groundSample: { x: ground.x, y: ground.y, r: ground.r, g: ground.g, b: ground.b, luminance: ground.luminance },
    paperEdgeRow: edgeRow, leftEdgeX: edges.left, rightEdgeX: edges.right,
    paperWidthPx: (edges.left != null && edges.right != null) ? (edges.right - edges.left + 1) : null,
  };
}

async function main() {
  const analysis = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus-analysis.json'), 'utf8'));
  const startDate = analysis.firstDate;
  const browser = await launchBrowser(chromium);
  const out = { entrance: [], extent: [], gaps: [] };

  // (a) + (b) entrance and extent stills at 8/25/55 unit-days
  const lengths = [
    { tag: '08', cutoff: analysis.lengths.l8 },
    { tag: '25', cutoff: analysis.lengths.l25 },
    { tag: '55', cutoff: analysis.lengths.l55 },
  ];
  for (const L of lengths) {
    const endDate = L.cutoff.date;
    const probe = buildColumnHtml(startDate, endDate, analysis.byDateOrder, { scale: 1 });
    const totalHeight = probe.totalHeight;
    const dayCount = probe.dayCount;

    // entrance (native, scroll 0)
    const entranceHtml = buildColumnHtml(startDate, endDate, analysis.byDateOrder, { scale: 1 }).html;
    const entranceBuf = await viewportShot(browser, entranceHtml, { viewport: VIEWPORT, name: `g-entry-${L.tag}` });
    fs.writeFileSync(path.join(OUT_DIR, `g-entry-${L.tag}.png`), entranceBuf);
    const entranceM = await measureStill(browser, entranceBuf, {});

    // extent (whole column scaled to fit)
    const scale = Math.min(VIEWPORT.width / PAGE_W, VIEWPORT.height / totalHeight);
    const extentHtml = buildColumnHtml(startDate, endDate, analysis.byDateOrder, { scale }).html;
    const extentBuf = await viewportShot(browser, extentHtml, { viewport: VIEWPORT, name: `g-extent-${L.tag}` });
    fs.writeFileSync(path.join(OUT_DIR, `g-extent-${L.tag}.png`), extentBuf);
    const extentM = await measureStill(browser, extentBuf, { edgeRow: Math.min(5, VIEWPORT.height - 1) });

    out.entrance.push({ tag: L.tag, unitDays: L.cutoff.n, endDate, dayCount, columnHeightPx: totalHeight, ...entranceM });
    out.extent.push({ tag: L.tag, unitDays: L.cutoff.n, endDate, dayCount, columnHeightPx: totalHeight, scale, ...extentM });
    console.log(`entrance ${L.tag}:`, JSON.stringify(entranceM));
    console.log(`extent   ${L.tag}:`, JSON.stringify(extentM));
  }

  // (c) gap traversals, full-page capture at 1280px width, native scale
  const gapCases = [
    { tag: 'longest-20d', from: analysis.gapMaxInstance.from, to: analysis.gapMaxInstance.to, gapDays: analysis.gapMaxInstance.gapDays },
    { tag: 'median-5d', from: analysis.gapMedianInstance.from, to: analysis.gapMedianInstance.to, gapDays: analysis.gapMedianInstance.gapDays },
  ];
  for (const g of gapCases) {
    const built = buildColumnHtml(g.from, g.to, analysis.byDateOrder, { scale: 1 });
    const buf = await fullPageShot(browser, built.html, { viewport: VIEWPORT, name: `g-gap-${g.tag}` });
    fs.writeFileSync(path.join(OUT_DIR, `g-gap-${g.tag}.png`), buf);
    const m = await measureStill(browser, buf, { edgeRow: Math.min(400, built.totalHeight - 1) });
    const blankDays = g.gapDays - 1;
    out.gaps.push({
      tag: g.tag, from: g.from, to: g.to, gapDaysDateDiff: g.gapDays, blankCalendarDays: blankDays,
      columnHeightPx: built.totalHeight, docCount: 2, ...m,
    });
    console.log(`gap ${g.tag}:`, JSON.stringify(m));
  }

  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'g1-measurements.json'), JSON.stringify(out, null, 2));
  console.log('wrote g1-measurements.json');
}
main().catch(e => { console.error(e); process.exit(1); });
