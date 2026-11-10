// Copied from the concept-gate étude at
// etudes/5000-series/still/no-part/pdf-render-lib.js (see that file's own
// header for the full account of why this approach — Chromium's built-in
// PDF viewer, headful under Xvfb — was the only one that worked in this
// environment). Kept verbatim except: PDF_PATH (below, adjusted for this
// project's directory layout) and detectPageTopLeft/cropPng, which needed a
// genuinely new fix for a defect the 6-sheet concept gate never exercised —
// see "LAST-PAGE DEFECT" comment on detectPageTopLeft below for the full
// account. Everything else, including all comments, is unchanged.
//
// Shared low-level helper: rasterise one page of the real source PDF at an
// exact px/mm scale using Chromium's own built-in PDF viewer (PDFium), then
// crop out the viewer chrome (toolbar/sidebar/background) by detecting the
// page's top-left corner in the screenshot pixels — no external image
// library anywhere in this pipeline; cropping and colour analysis are done
// with an in-browser <canvas>, and PNG encoding is Chromium's own
// canvas.toDataURL(), not a hand-rolled encoder.
//
// Why this file exists at all (see the étude's README.md "(A) or (B)"
// section): this environment has no pdftoppm/pdftocairo/gs/mutool and no
// Python PDF library. Chromium's built-in PDF viewer, run headful
// (headless:false) under Xvfb, DOES open and rasterise the real PDF —
// confirmed by trial, documented in that README. That makes this a genuine
// rasterisation (case A), not a reconstruction from our own text extraction
// (case B).
const path = require('path');

// order-list.pdf lives one directory up from build/ in this project.
const PDF_PATH = path.resolve(__dirname, '..', 'order-list.pdf');
// TRUE US Letter (8.5in x 11in), confirmed by direct pixel measurement of
// the actual rasterisation (see the étude's README.md "defects" — the
// proposal's stated "216 x 279mm" rounds the true 215.9 x 279.4mm short by
// 0.4mm on the height, which is enough to clip the last text line at
// 4 px/mm).
const PAGE_MM = { w: 215.9, h: 279.4 };
const CSS_PX_PER_MM_AT_100PCT = 96 / 25.4; // nominal Chromium baseline: 96 CSS px/inch at 100% zoom

function dsfForPxPerMm(pxPerMm) {
  // MEASURED, non-obvious fact about this Chromium build's PDF viewer
  // plugin: it does not scale linearly with deviceScaleFactor. Rendering at
  // dsf=1.058333 (the naive formula pxPerMm/(96/25.4) for a 4px/mm target)
  // produced pages measuring 914x1183 physical px — i.e. an ACTUAL scale of
  // 4.234 px/mm, not 4. Testing multiple dsf values and back-solving shows
  // the plugin effectively applies deviceScaleFactor to its own internal
  // content scale IN ADDITION to the normal compositor scaling, i.e.:
  //   actual_px_per_mm = (96/25.4) * dsf^2   (not dsf^1, as every other
  //   element on a web page would give)
  // Solving for the dsf that yields the intended pxPerMm:
  //   dsf = sqrt(pxPerMm / (96/25.4))
  // Verified empirically: this formula at pxPerMm=4 gives dsf=1.028753,
  // and the resulting rasterised page measures exactly 864x1118px = 216.00
  // x 279.50mm (true Letter, within rounding). This is a real, reported
  // defect of the rendering pipeline, not a detail to paper over — see
  // the étude's README.md.
  //
  // NOTE: this formula is only used/valid for dsf >= 1 (pxPerMm >= ~3.78).
  // deviceScaleFactor < 1 has an independent, more severe bug in this same
  // plugin (page renders at a small fraction of any predictable size) — we
  // never call this for a sub-1 result; any half-scale output should be
  // produced by downsampling a real >=1x rasterisation instead.
  return Math.sqrt(pxPerMm / CSS_PX_PER_MM_AT_100PCT);
}

async function closeSidebar(page) {
  // Click the hamburger icon to close the auto-opened thumbnail sidebar.
  try {
    await page.mouse.click(32, 28);
    await page.waitForTimeout(300);
  } catch (e) {}
}

// Render one PDF page (1-indexed; this document's printed folios equal PDF
// page numbers) as a PNG buffer at the given px/mm scale.
async function renderPage(browser, pageNum, pxPerMm) {
  const dsf = dsfForPxPerMm(pxPerMm);
  const pageWCss = (PAGE_MM.w / 25.4) * 96;
  const pageHCss = (PAGE_MM.h / 25.4) * 96;
  // Viewport just tall/wide enough for toolbar + one page + slack, so the
  // neighbouring page in the continuous-scroll viewer never enters frame.
  const viewportCss = {
    width: Math.ceil(pageWCss + 260),
    height: Math.ceil(pageHCss + 140),
  };
  const context = await browser.newContext({ viewport: viewportCss, deviceScaleFactor: dsf });
  const page = await context.newPage();
  await page.goto(`file://${PDF_PATH}#page=${pageNum}&zoom=100`, { timeout: 20000 });
  await page.waitForTimeout(900);
  await closeSidebar(page);
  await page.waitForTimeout(400);
  const fullBuf = await page.screenshot();
  await context.close();

  const expectedW = Math.round(PAGE_MM.w * pxPerMm);
  const expectedH = Math.round(PAGE_MM.h * pxPerMm);

  const { left, top, sourceHeight } = await detectPageTopLeft(browser, fullBuf);
  const availableH = sourceHeight - top;
  const shortfallPx = Math.max(0, expectedH - availableH);
  const cropped = await cropPng(browser, fullBuf, left, top, expectedW, expectedH);
  return { buffer: cropped, widthPx: expectedW, heightPx: expectedH, dsf, left, top, shortfallPx };
}

// Find only the page's top-left corner (light paper vs. dark viewer
// background/chrome). We already know the page's exact target pixel size by
// construction (pxPerMm * PAGE_MM), so we never need to detect the
// bottom/right edge — the fragile part in a continuous-scroll PDF viewer
// where the gap between pages is thin.
//
// LAST-PAGE DEFECT (new, found and fixed in this project — the concept
// gate's 6-sheet frame, sheets 30-35, never included the actual last page of
// the 39-page document, so it never exercised this path):
//
// The original algorithm took the FIRST row from the top where the row's
// average luminance clears the paper/background threshold, on the
// assumption that only dark viewer chrome (toolbar/background) precedes the
// target page. That holds for every interior page (confirmed by direct
// pixel-transition analysis of pages 1, 15, 38) — but NOT for the actual
// last page of the document (39). Rendering page 39 alone and inspecting
// the full, uncropped screenshot's row-luminance transitions shows THREE
// transitions, not one: dark->bright at the toolbar boundary, bright->dark,
// then dark->bright again — because Chromium's continuous-scroll PDF viewer
// cannot scroll past the end of the document, so navigating to the last
// page leaves the TAIL of the second-to-last page still visible above it
// (confirmed visually: that tail band contains page 38's own folio number,
// "38"). The original "first transition" logic picks that tail as if it
// were the page, producing a crop that starts ~80px too early and — because
// the crop height is fixed — ends ~80px too early too, silently cutting off
// the true page 39's own bottom margin and folio.
//
// Fix: don't take the first dark->bright transition; take the first one
// whose following bright run is long enough to plausibly BE a full page
// (>= MIN_RUN_PX, comfortably between the tail band's measured height
// [66-236px across several tested viewport sizes, always much shorter] and
// a genuine page's [~1089-1117px, always much longer]). This is a strictly
// more general rule, not a page-39 special case: for every interior page,
// the very first transition already satisfies it (there is only one
// transition until the page's own bottom), so behaviour there is unchanged.
//
// Even with the correct transition selected, page 39's available room below
// it (screenshot height minus top) falls short of the expected full page
// height by a small, essentially constant amount (~29-34px across every
// viewport size tested, independent of how much slack is added) — this
// plugin's internal scroll/layout geometry allocates less vertical space to
// the document than its own dsf^2-scaled glyph rendering actually draws
// (see pdfRenderLib's dsfForPxPerMm() comment for that scaling defect, which
// this appears to be a second symptom of). No scroll position, wheel event,
// keyboard End, or out-of-range #page=40 fragment recovers the missing
// rows (all tried and confirmed to make no difference) — it is not
// reachable by this plugin, not just under-captured. detectPageTopLeft
// reports `sourceHeight` (the full raw screenshot height) alongside `top`
// so callers can compute and report this shortfall explicitly rather than
// silently crop past the end of the source image (which, in a plain
// <canvas>, would composite as transparent/black, not paper white — cropPng
// below fills white first specifically to avoid manufacturing a black bar
// out of a missing-data condition).
async function detectPageTopLeft(browser, pngBuffer) {
  const ctxPage = await browser.newContext();
  const p = await ctxPage.newPage();
  await p.goto('about:blank');
  const b64 = pngBuffer.toString('base64');
  const result = await p.evaluate(async (dataUrl) => {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = dataUrl;
    });
    const canvas = document.createElement('canvas');
    canvas.width = img.naturalWidth;
    canvas.height = img.naturalHeight;
    const ctx = canvas.getContext('2d');
    ctx.drawImage(img, 0, 0);
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    const lumAt = (x, y) => {
      const i = (y * width + x) * 4;
      return 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    };
    const THRESH = 150;
    const MIN_RUN_PX = 500; // see LAST-PAGE DEFECT above: tail bands measured 66-236px, genuine pages 1089-1117px — 500 sits cleanly between them
    const rowAvg = new Array(height);
    for (let y = 0; y < height; y++) {
      let sum = 0;
      for (let x = 0; x < width; x++) sum += lumAt(x, y);
      rowAvg[y] = sum / width;
    }
    let top = -1;
    for (let y = 0; y < height; y++) {
      const isTransitionIn = rowAvg[y] > THRESH && (y === 0 || rowAvg[y - 1] <= THRESH);
      if (!isTransitionIn) continue;
      let runEnd = y;
      while (runEnd < height && rowAvg[runEnd] > THRESH) runEnd++;
      if (runEnd - y >= MIN_RUN_PX || runEnd === height) {
        // Either a genuinely long run, or a run that is cut short only by
        // reaching the bottom of the screenshot itself (the last-page
        // shortfall case) — both are the real page, not a tail sliver.
        top = y;
        break;
      }
    }
    if (top === -1) return null;
    const bandBottom = Math.min(top + 40, height - 1);
    let left = -1;
    for (let x = 0; x < width; x++) {
      let sum = 0;
      for (let y = top; y <= bandBottom; y++) sum += lumAt(x, y);
      if (sum / (bandBottom - top + 1) > THRESH) { left = x; break; }
    }
    if (left === -1) return null;
    return { left, top, sourceHeight: height };
  }, `data:image/png;base64,${b64}`);
  await ctxPage.close();
  if (!result) throw new Error('Could not detect page top-left corner');
  return result;
}

async function cropPng(browser, pngBuffer, left, top, width, height) {
  const ctxPage = await browser.newContext();
  const p = await ctxPage.newPage();
  await p.goto('about:blank');
  const b64 = pngBuffer.toString('base64');
  const outB64 = await p.evaluate(async ({ dataUrl, left, top, width, height }) => {
    const img = new Image();
    await new Promise((resolve, reject) => {
      img.onload = resolve;
      img.onerror = reject;
      img.src = dataUrl;
    });
    const canvas = document.createElement('canvas');
    canvas.width = width;
    canvas.height = height;
    const ctx = canvas.getContext('2d');
    // Fill white FIRST: if the source screenshot doesn't extend far enough
    // to cover the full requested crop (the last-page shortfall — see
    // detectPageTopLeft's LAST-PAGE DEFECT comment), canvas compositing
    // would otherwise leave the uncovered region transparent, which PNG
    // encodes as black, not paper-coloured. That would fabricate a black
    // bar where the truth is "not captured" — filling white instead is
    // still not a claim about what's really printed there, only the least
    // misleading default, and every such shortfall is logged and reported
    // by the caller, never silently absorbed.
    ctx.fillStyle = '#FFFFFF';
    ctx.fillRect(0, 0, width, height);
    ctx.drawImage(img, left, top, width, height, 0, 0, width, height);
    return canvas.toDataURL('image/png').split(',')[1];
  }, { dataUrl: `data:image/png;base64,${b64}`, left, top, width, height });
  await ctxPage.close();
  return Buffer.from(outB64, 'base64');
}

module.exports = { PDF_PATH, PAGE_MM, dsfForPxPerMm, renderPage, detectPageTopLeft, cropPng };
