// ÉTUDE 2 — THE HOLE AND THE RATE.
// (A) Native-scale mid-column stills: real page, real gap, real page — for
//     the corpus's longest gap (20 days) and its median gap (5 days) between
//     consecutive Miscellaneous-Order dates.
// (B) Extent images at 2 / 8 / 55 unit-days (2 units is new; 8 and 55 are
//     built exactly as in Étude 1 and copied here under e2- names since the
//     build is deterministic — see REPORT.md).
// (C) Measurements: pixels of blank per pixel of document at each length,
//     and the fraction of each extent image that is white.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { launchBrowser } = require('./canvas-lib.js');
const { buildColumnHtml, PAGE_W, PAGE_H } = require('./column-html.js');
const { viewportShot, elementShot } = require('./capture-lib.js');
const { whiteFraction } = require('./measure-lib.js');

const OUT_DIR = path.resolve(__dirname, '..');
const VIEWPORT = { width: 1280, height: 800 };

async function main() {
  const analysis = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus-analysis.json'), 'utf8'));
  const browser = await launchBrowser(chromium);
  const measurements = { gaps: [], extents: [] };

  // --- (A) native mid-column gap stills ---
  const gapCases = [
    { tag: 'longest-20d', from: analysis.gapMaxInstance.from, to: analysis.gapMaxInstance.to, gapDays: analysis.gapMaxInstance.gapDays },
    { tag: 'median-5d', from: analysis.gapMedianInstance.from, to: analysis.gapMedianInstance.to, gapDays: analysis.gapMedianInstance.gapDays },
  ];
  for (const g of gapCases) {
    const built = buildColumnHtml(g.from, g.to, analysis.byDateOrder, { scale: 1 });
    const html = `${built.html.replace('<div id="stage"', '<div id="stage"')}`; // stage already id'd
    const buf = await elementShot(browser, html, { viewport: { width: 900, height: 900 }, selector: '#stage', name: `e2-gap-${g.tag}` });
    const outPath = path.join(OUT_DIR, `e2-gap-${g.tag}.png`);
    fs.writeFileSync(outPath, buf);
    const blankDays = g.gapDays - 1; // calendar days strictly between the two order dates
    const docDays = 2; // the two bounding order pages
    const blankPx = blankDays * PAGE_H;
    const docPx = docDays * PAGE_H;
    const m = {
      tag: g.tag, from: g.from, to: g.to, gapDaysDateDiff: g.gapDays, blankCalendarDays: blankDays,
      columnHeightPx: built.totalHeight, docCount: 2,
      blankPxPerDocPx: blankPx / docPx, blankPixels: blankPx, docPixels: docPx,
      bytes: buf.length,
    };
    measurements.gaps.push(m);
    console.log(JSON.stringify(m));
  }

  // --- (B) extent images at 2 / 8 / 55 unit-days ---
  const startDate = analysis.firstDate;
  const lens = [
    { tag: '02', cutoff: analysis.lengths.l2 },
    { tag: '08', cutoff: analysis.lengths.l8 },
    { tag: '55', cutoff: analysis.lengths.l55 },
  ];
  for (const L of lens) {
    const endDate = L.cutoff.date;
    const probe = buildColumnHtml(startDate, endDate, analysis.byDateOrder, { scale: 1 });
    const totalHeight = probe.totalHeight;
    const scale = Math.min(VIEWPORT.width / PAGE_W, VIEWPORT.height / totalHeight);
    const html = buildColumnHtml(startDate, endDate, analysis.byDateOrder, { scale }).html;
    const buf = await viewportShot(browser, html, { viewport: VIEWPORT, name: `e2-extent-${L.tag}` });
    fs.writeFileSync(path.join(OUT_DIR, `e2-extent-${L.tag}.png`), buf);
    const wf = await whiteFraction(browser, buf, 250);
    const n = L.cutoff.n;
    const blankDays = probe.dayCount - n;
    const m = {
      tag: L.tag, unitDays: n, endDate, calendarDayCount: probe.dayCount, blankDays, docDays: n,
      columnHeightPx: totalHeight, scale, blankPxPerDocPxBySlotCount: blankDays / n,
      extentWhitePixelFraction: wf.fraction, bytes: buf.length,
    };
    measurements.extents.push(m);
    console.log(JSON.stringify(m));
  }

  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'e2-measurements.json'), JSON.stringify(measurements, null, 2));
  console.log('wrote e2-measurements.json');
}
main().catch(e => { console.error(e); process.exit(1); });
