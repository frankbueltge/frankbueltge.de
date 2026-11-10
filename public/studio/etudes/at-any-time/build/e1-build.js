// ÉTUDE 1 — THE EXTENT IMAGE. For each of 3 lengths (8, 25, 55 unit-days),
// builds the real calendar-day column (real rendered pages, real blanks)
// and produces:
//   (i)  the extent image — the WHOLE column, scaled via CSS transform so it
//        fits inside one 1280x800 viewport, screenshotted unscrolled;
//   (ii) the native-entry still — the SAME column at native (1x) scale,
//        screenshotted at scroll position 0, i.e. exactly the first
//        viewport a visitor entering the work would see.
// Nothing is added to either: no wall, no background colour beyond the
// page's own white, no caption, no date, no border.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { launchBrowser } = require('./canvas-lib.js');
const { buildColumnHtml, PAGE_W, PAGE_H } = require('./column-html.js');
const { viewportShot } = require('./capture-lib.js');
const { whiteFraction } = require('./measure-lib.js');

const OUT_DIR = path.resolve(__dirname, '..');
const VIEWPORT = { width: 1280, height: 800 };

async function main() {
  const analysis = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus-analysis.json'), 'utf8'));
  const startDate = analysis.firstDate;
  const lengths = [
    { tag: '08', label: 'the door', cutoff: analysis.lengths.l8 },
    { tag: '25', label: 'middle length', cutoff: analysis.lengths.l25 },
    { tag: '55', label: 'full 2025-Term span', cutoff: analysis.lengths.l55 },
  ];

  const browser = await launchBrowser(chromium);
  const measurements = [];

  for (const L of lengths) {
    const endDate = L.cutoff.date;
    const n = L.cutoff.n;
    // Build once at scale=1 to learn totalHeight, then build the actually-used HTMLs.
    const probe = buildColumnHtml(startDate, endDate, analysis.byDateOrder, { scale: 1 });
    const totalHeight = probe.totalHeight;
    const dayCount = probe.dayCount;
    const scale = Math.min(VIEWPORT.width / PAGE_W, VIEWPORT.height / totalHeight);
    const pageMarkHeightAtScale = PAGE_H * scale;

    // (i) extent image
    const extentHtml = buildColumnHtml(startDate, endDate, analysis.byDateOrder, { scale }).html;
    const extentBuf = await viewportShot(browser, extentHtml, { viewport: VIEWPORT, name: `e1-extent-${L.tag}` });
    const extentPath = path.join(OUT_DIR, `e1-extent-${L.tag}.png`);
    fs.writeFileSync(extentPath, extentBuf);

    // (ii) native entry still (scale=1, scroll 0)
    const nativeHtml = buildColumnHtml(startDate, endDate, analysis.byDateOrder, { scale: 1 }).html;
    const nativeBuf = await viewportShot(browser, nativeHtml, { viewport: VIEWPORT, name: `e1-native-entry-${L.tag}` });
    const nativePath = path.join(OUT_DIR, `e1-native-entry-${L.tag}.png`);
    fs.writeFileSync(nativePath, nativeBuf);

    const wf = await whiteFraction(browser, extentBuf, 250);

    const orderDays = dayCount === n ? n : null; // sanity aid only
    const blankDays = dayCount - n;
    const ratioBlankToDoc = blankDays / n;

    const m = {
      tag: L.tag, label: L.label, unitDays: n, endDate, startDate,
      calendarDayCount: dayCount, blankDays, docDays: n,
      columnHeightPx: totalHeight, scale, pageMarkHeightAtScalePx: pageMarkHeightAtScale,
      ratioBlankDaysToDocDays: ratioBlankToDoc,
      extentWhitePixelFraction: wf.fraction, extentWhitePixels: wf.white, extentTotalPixels: wf.total,
      extentBytes: extentBuf.length, nativeBytes: nativeBuf.length,
    };
    measurements.push(m);
    console.log(JSON.stringify(m, null, 2));
  }

  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'e1-measurements.json'), JSON.stringify(measurements, null, 2));
  console.log('wrote e1-measurements.json');
}
main().catch(e => { console.error(e); process.exit(1); });
