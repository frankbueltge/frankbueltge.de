// BINDING CONDITION 4 (Dramaturg's staging ruling, verbatim in the
// conductor's addendum): "THE PHONE IS DECIDED FIRST. Étude 2 runs the 390px
// case before anything else and publishes the apparent type size in CSS px
// at deviceScaleFactor 1 and 2."
//
// Renders the entrance page and a mid-column page as a plain <img
// style="width:100%"> — the one non-operated-affordance way to fit a
// fixed-width document image into a narrow viewport (no pinch-zoom, no
// horizontal drag, no tap-to-enlarge control exists in this markup) — at a
// 390x844 viewport, at deviceScaleFactor 1 and 2, and MEASURES the apparent
// type size directly from the rendered screenshot pixels: a row-luminance
// scan finds contiguous horizontal ink bands (text lines), and each band's
// pixel height, divided by dsf, is the apparent CSS-px line height.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { launchBrowser, runInCanvas } = require('./canvas-lib.js');
const { writeAndGoto } = require('./capture-lib.js');

const OUT_DIR = path.resolve(__dirname, '..');
const RENDER_DIR = '/tmp/claude-0/-home-user-studio/98d41e62-3b71-5f78-9da1-5a51086e8713/scratchpad/renders';

async function measureLineBands(browser, pngBuffer) {
  return runInCanvas(browser, pngBuffer, (ctx, canvas) => {
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    const THRESH = 128; // ink vs paper
    const MIN_INK_PX = 3; // ignore stray antialiasing noise
    const isInkRow = new Array(height);
    for (let y = 0; y < height; y++) {
      let count = 0;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (lum < THRESH) { count++; if (count >= MIN_INK_PX) break; }
      }
      isInkRow[y] = count >= MIN_INK_PX;
    }
    const bands = [];
    let start = null;
    for (let y = 0; y < height; y++) {
      if (isInkRow[y] && start === null) start = y;
      if (!isInkRow[y] && start !== null) { bands.push({ start, end: y - 1, heightPx: y - start }); start = null; }
    }
    if (start !== null) bands.push({ start, end: height - 1, heightPx: height - start });
    return { bands, width, height };
  });
}

async function main() {
  const analysis = JSON.parse(fs.readFileSync(path.join(__dirname, 'corpus-analysis.json'), 'utf8'));
  const entranceFile = analysis.byDateOrder.find(e => e.date === analysis.firstDate).files[0];
  const midIdx = Math.floor((analysis.distinctDatesCount - 1) / 2); // middle of 55 -> index 27 (28th unit-day)
  const midDate = analysis.distinctDates[midIdx];
  const midFile = analysis.byDateOrder.find(e => e.date === midDate).files[0];

  const cases = [
    { tag: 'entrance', date: analysis.firstDate, file: entranceFile },
    { tag: 'midcolumn', date: midDate, file: midFile },
  ];

  const browser = await launchBrowser(chromium);
  const results = [];

  for (const c of cases) {
    const src = 'file://' + path.join(RENDER_DIR, c.file.replace(/\.pdf$/, '.png'));
    const html = `<!doctype html><html><head><meta charset="utf-8"><style>
      html,body{margin:0;padding:0;background:#fff;}
      img{display:block;width:100%;height:auto;}
    </style></head><body><img src="${src}"></body></html>`;

    for (const dsf of [1, 2]) {
      const context = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: dsf });
      const page = await writeAndGoto(context, html, `bc4-${c.tag}-dsf${dsf}`);
      const buf = await page.screenshot();
      await context.close();
      const outPath = path.join(OUT_DIR, `e2-phone-${c.tag}-dsf${dsf}.png`);
      fs.writeFileSync(outPath, buf);

      const { bands, width, height } = await measureLineBands(browser, buf);
      const heightsCss = bands.map(b => b.heightPx / dsf);
      heightsCss.sort((a, b) => a - b);
      const median = heightsCss.length ? heightsCss[Math.floor(heightsCss.length / 2)] : null;
      const m = {
        case: c.tag, date: c.date, file: c.file, dsf,
        screenshotPhysicalPx: [width, height],
        viewportCssPx: [390, 844],
        bandsDetected: bands.length,
        lineBandHeightsCssPx: { min: heightsCss[0] || null, median, max: heightsCss[heightsCss.length - 1] || null },
        bytes: buf.length,
      };
      results.push(m);
      console.log(JSON.stringify(m));
    }
  }

  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'bc4-measurements.json'), JSON.stringify(results, null, 2));
  console.log('wrote bc4-measurements.json');
}
main().catch(e => { console.error(e); process.exit(1); });
