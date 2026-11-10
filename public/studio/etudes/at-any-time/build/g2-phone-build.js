// TASK 2 — THE COLUMN AT 390 PX (Dramaturg §15 item 2, "the only untested
// horn left"). Builds the adopted column (grey ground, no data-date/
// data-docs) spanning exactly the corpus's longest gap (2026-03-20 ->
// 2026-04-09, order-before through order-after), using the RESPONSIVE
// builder (buildColumnHtmlResponsive — percentage/aspect-ratio sizing, no
// CSS transform) so the paper's LAYOUT width is genuinely 100% of a 390px
// viewport, not just its painted appearance (see g-column-html.js's own
// comment for the transform-overflow defect this replaced). Produces:
//   (i)  a full traversal capture (fullPage, 390px wide) of the whole gap
//   (ii) a real 390x844 viewport screenshot scrolled so the vertical
//        midpoint of the 19 blank calendar days is centred in the viewport
//        — literally "what is on screen at the midpoint."
// Measures how many full 844px screens of ground/blank the visitor passes
// between the order-before slot and the order-after slot.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { launchBrowser } = require('./canvas-lib.js');
const { buildColumnHtmlResponsive, PAGE_W, PAGE_H, GROUND_RGB } = require('./g-column-html.js');
const { writeAndGoto } = require('./capture-lib.js');
const { fullPageShot } = require('./g-capture-lib.js');
const { fullImageStats, pixelLuminance, paperEdgesAtRow } = require('./g-measure-lib.js');

const OUT_DIR = path.resolve(__dirname, '..');
const PHONE_VIEWPORT = { width: 390, height: 844 };
const PHONE_SCALE = 390 / PAGE_W; // for reporting only — the responsive builder derives this from CSS, not JS

async function measureStill(browser, buf, edgeRow) {
  const stats = await fullImageStats(browser, buf, 250);
  const ground = await pixelLuminance(browser, buf, Math.min(2, stats.width - 1), Math.min(2, stats.height - 1));
  const edges = await paperEdgesAtRow(browser, buf, edgeRow != null ? edgeRow : Math.floor(stats.height / 2), GROUND_RGB, 12);
  return {
    widthPx: stats.width, heightPx: stats.height, totalPixels: stats.total,
    fractionBelowLum250: stats.belowFraction, pixelsBelowLum250: stats.belowThreshold,
    darkestPixelLuminance: stats.minLuminance,
    cornerSample: { x: ground.x, y: ground.y, r: ground.r, g: ground.g, b: ground.b, luminance: ground.luminance },
    paperEdgeRow: edgeRow, leftEdgeX: edges.left, rightEdgeX: edges.right,
    paperWidthPx: (edges.left != null && edges.right != null) ? (edges.right - edges.left + 1) : null,
  };
}

async function main() {
  const analysis = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus-analysis.json'), 'utf8'));
  const from = analysis.gapMaxInstance.from, to = analysis.gapMaxInstance.to;
  const gapDays = analysis.gapMaxInstance.gapDays;
  const blankDays = gapDays - 1;

  const built = buildColumnHtmlResponsive(from, to, analysis.byDateOrder);
  const dayCount = built.dayCount; // should be gapDays+1 = 21 calendar days (order,blank x19,order)
  const sliceHeightPx = PHONE_VIEWPORT.width * (PAGE_H / PAGE_W); // CSS-px height of one calendar-day slot at 390px width (aspect-ratio-derived)

  const browser = await launchBrowser(chromium);

  // (i) full traversal capture
  const fullBuf = await fullPageShot(browser, built.html, { viewport: PHONE_VIEWPORT, name: 'g-phone-gap-full' });
  fs.writeFileSync(path.join(OUT_DIR, 'g-phone-gap-full.png'), fullBuf);
  const fullM = await measureStill(browser, fullBuf, Math.floor(sliceHeightPx / 2));

  // blank region: day-index 1..19 (0 = order-before, 20 = order-after)
  const blankStartPx = 1 * sliceHeightPx;
  const blankEndPx = (1 + blankDays) * sliceHeightPx;
  const blankRegionHeightPx = blankEndPx - blankStartPx;
  const fullScreensPassed = Math.floor(blankRegionHeightPx / PHONE_VIEWPORT.height);
  const screensPassedFractional = blankRegionHeightPx / PHONE_VIEWPORT.height;
  const midpointY = (blankStartPx + blankEndPx) / 2;
  const midpointDayIndex = Math.floor(midpointY / sliceHeightPx); // which calendar day (0-indexed from `from`) the midpoint falls in

  // (ii) real viewport screenshot centred on the midpoint
  const context = await browser.newContext({ viewport: PHONE_VIEWPORT });
  const page = await writeAndGoto(context, built.html, 'g-phone-gap-midpoint');
  const measuredScrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);
  const measuredScrollWidth = await page.evaluate(() => document.documentElement.scrollWidth);
  const maxScroll = Math.max(0, measuredScrollHeight - PHONE_VIEWPORT.height);
  const scrollY = Math.min(maxScroll, Math.max(0, Math.round(midpointY - PHONE_VIEWPORT.height / 2)));
  await page.evaluate((y) => window.scrollTo(0, y), scrollY);
  await page.waitForTimeout(30);
  const midBuf = await page.screenshot();
  fs.writeFileSync(path.join(OUT_DIR, 'g-phone-gap-midpoint.png'), midBuf);
  await context.close();
  const midM = await measureStill(browser, midBuf, Math.floor(PHONE_VIEWPORT.height / 2));

  await browser.close();

  const summary = {
    from, to, gapDaysDateDiff: gapDays, blankCalendarDays: blankDays, dayCount,
    phoneScale: PHONE_SCALE, sliceHeightPx, columnHeightPxAtPhoneScale: built.totalHeight,
    blankRegionHeightPx, fullScreensPassed, screensPassedFractional,
    midpointY, midpointDayIndex, midpointDate: (() => {
      const d = new Date(from + 'T00:00:00Z'); d.setUTCDate(d.getUTCDate() + midpointDayIndex); return d.toISOString().slice(0, 10);
    })(),
    scrollYUsedForMidpointShot: scrollY, measuredScrollHeight, measuredScrollWidth,
    noHorizontalOverflow: measuredScrollWidth === PHONE_VIEWPORT.width,
    fullTraversal: fullM, midpointViewport: midM,
  };
  fs.writeFileSync(path.join(__dirname, 'g2-measurements.json'), JSON.stringify(summary, null, 2));
  console.log(JSON.stringify(summary, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });
