// BINDING CONDITION 2 (Dramaturg's staging ruling, verbatim in the
// conductor's addendum): "THE PAPER IS CONTINUOUS AND ITS EDGES ARE VISIBLE
// EVERYWHERE. Test: screenshots at twenty scroll positions including the
// middle of the longest gap; every one shows both edges of the paper
// against a ground that is not the paper."
//
// Built as its own dedicated page (a real scrollable browser document, the
// full 296-calendar-day / 55-unit-day column, real rendered pages + real
// blanks, all at native 1x scale) with a mid-grey ground behind the column
// so the paper's left/right edges are measurable against something that is
// not paper-white. This ground colour is scaffolding for THIS test only —
// it is not part of Étude 1/2's "nothing added" column (see REPORT.md) —
// and is documented plainly as a build choice, not a claim about the
// finished work's final visual design.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { launchBrowser } = require('./canvas-lib.js');
const { calendarRange, daySlotHtml, daysBetween, PAGE_W, PAGE_H } = require('./column-html.js');
const { writeAndGoto } = require('./capture-lib.js');
const { paperEdgesAtRow } = require('./measure-lib.js');

const OUT_DIR = path.resolve(__dirname, '..');
const VIEWPORT = { width: 1280, height: 800 };
const GROUND_RGB = [128, 128, 128];
const SAMPLE_ROW_Y = 400; // vertical middle of the viewport

async function main() {
  const analysis = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus-analysis.json'), 'utf8'));
  const startDate = analysis.firstDate;
  const endDate = analysis.lengths.l55.date; // full term, longest length built
  const range = calendarRange(startDate, endDate, analysis.byDateOrder);
  const totalHeight = range.count * PAGE_H;

  const body = range.days.map(daySlotHtml).join('\n');
  const html = `<!doctype html><html><head><meta charset="utf-8"><style>
    html,body{margin:0;padding:0;background:rgb(${GROUND_RGB.join(',')});}
    ::-webkit-scrollbar{display:none;width:0;height:0;}
    html{scrollbar-width:none;}
    #stage{width:${PAGE_W}px;margin:0 auto;}
  </style></head><body><div id="stage">${body}</div></body></html>`;

  const maxScroll = Math.max(0, totalHeight - VIEWPORT.height);
  const positions = Array.from({ length: 20 }, (_, i) => Math.round((i * maxScroll) / 19));

  // 21st position: the middle of the corpus's longest gap (20 days).
  const gapFrom = analysis.gapMaxInstance.from, gapTo = analysis.gapMaxInstance.to;
  const idxFrom = daysBetween(startDate, gapFrom), idxTo = daysBetween(startDate, gapTo);
  const midDayIdx = Math.round((idxFrom + idxTo) / 2);
  const midTargetY = midDayIdx * PAGE_H + Math.floor(PAGE_H / 2);
  const gapScroll = Math.min(maxScroll, Math.max(0, midTargetY - Math.floor(VIEWPORT.height / 2)));

  const allPositions = [...positions.map(y => ({ y, tag: 'even' })), { y: gapScroll, tag: 'longest-gap-middle' }];

  const browser = await launchBrowser(chromium);
  const context = await browser.newContext({ viewport: VIEWPORT });
  const page = await writeAndGoto(context, html, 'bc2-column');
  const measuredScrollHeight = await page.evaluate(() => document.documentElement.scrollHeight);

  const rows = [];
  const commitTags = new Set([0, 5, 10, 19]); // representative few, plus the gap position always committed
  let i = 0;
  for (const pos of allPositions) {
    await page.evaluate((y) => window.scrollTo(0, y), pos.y);
    await page.waitForTimeout(30);
    const buf = await page.screenshot();
    const edges = await paperEdgesAtRow(browser, buf, SAMPLE_ROW_Y, GROUND_RGB, 12);
    const bothVisible = edges.left !== null && edges.right !== null && edges.left > 0 && edges.right < VIEWPORT.width - 1;
    const row = {
      index: i, tag: pos.tag, scrollY: pos.y, sampleRowY: SAMPLE_ROW_Y,
      leftEdgeX: edges.left, rightEdgeX: edges.right,
      paperWidthPx: edges.left !== null && edges.right !== null ? edges.right - edges.left + 1 : null,
      bothEdgesVisibleAgainstGround: bothVisible,
    };
    rows.push(row);
    console.log(JSON.stringify(row));
    if ((pos.tag === 'even' && commitTags.has(i)) || pos.tag === 'longest-gap-middle') {
      fs.writeFileSync(path.join(OUT_DIR, `bc2-scroll-${String(i).padStart(2, '0')}-${pos.tag}.png`), buf);
    }
    i++;
  }

  await context.close();
  await browser.close();

  const allPass = rows.every(r => r.bothEdgesVisibleAgainstGround);
  const summary = {
    groundRgb: GROUND_RGB, viewport: VIEWPORT, columnHeightPx: totalHeight,
    measuredScrollHeight, maxScroll, sampleRowY: SAMPLE_ROW_Y,
    positionsTested: rows.length, allPositionsShowBothEdges: allPass, rows,
  };
  fs.writeFileSync(path.join(__dirname, 'bc2-measurements.json'), JSON.stringify(summary, null, 2));
  console.log(`\nAll ${rows.length} positions show both paper edges against ground: ${allPass}`);
}
main().catch(e => { console.error(e); process.exit(1); });
