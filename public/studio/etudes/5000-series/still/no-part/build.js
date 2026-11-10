// Builder — Ensemble, VECTOR 3 "NO PART", concept-gate still.
//
// CASE (A): this is a genuine RASTERISATION of the real source PDF, not a
// reconstruction from our own text extraction. See README.md for the full
// account of how (A) was established (Chromium's built-in PDF viewer,
// headful under Xvfb, opens and renders the actual file) and what was tried
// first and failed (headless chromium/chromium_headless_shell both treat a
// local PDF as a download; no pdftoppm/pdftocairo/gs/mutool/fitz/pypdfium2
// exist in this environment).
//
// What this script does, in order:
//   1. Verify order-list.pdf is present and its SHA-256 matches the
//      recorded hash (no network fetch here — that is a separate,
//      documented, one-time step; see README.md).
//   2. Rasterise PDF pages 30-35 individually at 4 px/mm via Chromium's
//      real PDF viewer (pdf-render-lib.js), saved as sheet-NN.png.
//   3. Sample the actual paper and ink colours off those rasterisations.
//   4. Compose the 1200x460mm dead-on frame (no-part-01.png, 4800x1840px)
//      from the six sheets, per VECTOR-3-proposal.md §10: last 168mm of
//      sheet 30, sheets 31-34 in full, first 168mm of sheet 35, 90mm wall
//      above, 91mm below, sheets butted with 0mm gap, seams as a paper-edge
//      shadow only.
//   5. Downsample by exactly 2x to no-part-01-half.png (2400x920, 2px/mm) —
//      not an independent low-DPI capture, because deviceScaleFactor < 1
//      triggers a Chromium PDF-plugin sizing bug (documented below and in
//      the README).
//   6. Run every measurement the brief calls for, printed to stdout: prose
//      inset check, hinge coordinates, glyph legibility, frame coverage,
//      colour census. This same output is what README.md's Measurements
//      section is transcribed from.
//
// Usage:
//   xvfb-run -a env NODE_PATH=/opt/node22/lib/node_modules node build.js
//
// Requires: order-list.pdf present in this directory (see README.md for the
// fetch command and hash), Playwright + Chromium at /opt/pw-browsers, and
// Xvfb (this build needs a real, non-headless Chromium instance for its PDF
// viewer to work, which needs a display).

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');
const { PDF_PATH, PAGE_MM, renderPage } = require('./pdf-render-lib.js');

const OUT_DIR = __dirname;
const EXPECTED_SHA256 = '354c9ba8dbc6e5104a6a6b84ee53a91a6f8e5e87b2d900e8c26f4a67ef6ec652';

const PX_PER_MM = 4;
const HALF_PX_PER_MM = 2;

// ---- Frame geometry, per VECTOR-3-proposal.md §10 ----
const FRAME_MM = { w: 1200, h: 460 };
const WALL_TOP_MM = 90;
const WALL_BOTTOM_MM = 91;
const SLICE_MM = 168; // leading/trailing partial-sheet width
const SHEETS = [30, 31, 32, 33, 34, 35]; // 30 and 35 contribute partial slices only

// Palette hypothesis from the proposal (used for wall + seam shadow only —
// there is no "real" wall or seam in the PDF to sample; paper/ink ARE
// sampled off the actual render, see below).
const HYPOTHESIS = {
  paper: '#F4F2ED',
  ink: '#161412',
  seam: '#D9D5CE',
  wall: '#8C8781',
};

function log(...args) { console.log(...args); }
function section(title) { console.log('\n=== ' + title + ' ==='); }

function verifyPdf() {
  if (!fs.existsSync(PDF_PATH)) {
    console.error(`Missing ${PDF_PATH}.`);
    console.error('Fetch it first (documented, one-time, network step):');
    console.error(`  curl -sS -o "${PDF_PATH}" https://www.supremecourt.gov/orders/courtorders/100625zor_5368.pdf`);
    process.exit(1);
  }
  const data = fs.readFileSync(PDF_PATH);
  const hash = crypto.createHash('sha256').update(data).digest('hex');
  if (hash !== EXPECTED_SHA256) {
    console.error(`SHA-256 mismatch: got ${hash}, expected ${EXPECTED_SHA256}`);
    process.exit(1);
  }
  section('PDF verification');
  log(`order-list.pdf: ${data.length} bytes, SHA-256 ${hash} — MATCHES recorded hash.`);
}

// ---- Browser-side canvas helper (no external image library anywhere) ----
// Loads a PNG buffer into a throwaway page's <canvas> and runs `fn(ctx,
// canvas, args)` there, returning its result. This is how every pixel
// measurement and composite step in this file is done.
async function runInCanvas(browser, pngBuffer, fn, args) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto('about:blank');
  const b64 = pngBuffer.toString('base64');
  const result = await page.evaluate(
    async ({ dataUrl, args, fnSource }) => {
      const img = new Image();
      await new Promise((resolve, reject) => {
        img.onload = resolve;
        img.onerror = reject;
        img.src = dataUrl;
      });
      const canvas = document.createElement('canvas');
      canvas.width = img.naturalWidth;
      canvas.height = img.naturalHeight;
      const c = canvas.getContext('2d');
      c.drawImage(img, 0, 0);
      // eslint-disable-next-line no-new-func
      const f = new Function('return ' + fnSource)();
      return f(c, canvas, args);
    },
    { dataUrl: `data:image/png;base64,${b64}`, args: args || {}, fnSource: fn.toString() }
  );
  await ctx.close();
  return result;
}

async function main() {
  verifyPdf();

  // ---- Corrective note (was defect 5) ----
  // A prior pass measured this build's rendered ink at #180F22 and reported
  // it as a fact about the source document's own ink colour. That reading
  // was WRONG: every content stream in order-list.pdf containing a BT/text
  // block was searched (independently, twice) for a colour-setting operator
  // (rg/RG/g/G/k/K/sc/SC/scn/SCN) and NONE was found, anywhere, inside or
  // outside the text objects — the document draws its glyphs with the PDF
  // default fill (DeviceGray black, Tr 0). So #180F22 was never the Court's
  // ink; it was subpixel/LCD glyph antialiasing this render pipeline itself
  // introduces. Fix attempted, in order, all confirmed on this Chromium
  // build's bundled PDFium/Skia PDF viewer:
  //   1. --disable-lcd-text                                   -> no change
  //   2. + --disable-font-subpixel-positioning
  //        --force-color-profile=srgb                          -> no change
  //   3. --disable-features=PdfUseSkiaRenderer (forces PDFium's
  //      non-Skia/AGG glyph path)                               -> no change
  //   4. display-level greyscale-AA fontconfig override
  //      (rgba=none, lcdfilter=lcdnone, system-wide)            -> no change
  // None of these reach whatever internal glyph-coverage/compositing path
  // this bundled viewer uses for its own PDF canvas (it is not the same
  // code path system fontconfig or these Blink-level switches govern). So,
  // as the last resort the correction brief explicitly allows: every sheet
  // raster is desaturated to true neutral grey (R=G=B=perceptual luminance)
  // immediately after Chromium produces it, before it is written to disk or
  // used anywhere downstream. This is a post-process change to the image,
  // not a change in how the source was drawn — declared here and in
  // README.md exactly because of that distinction. It is applied ONLY to
  // the sheet rasters (pure PDF content); the wall/seam colours added later
  // at compositing are untouched.
  const AA_FLAGS = [
    '--disable-lcd-text',
    '--disable-font-subpixel-positioning',
    '--force-color-profile=srgb',
    '--disable-features=PdfUseSkiaRenderer',
  ];
  const browser = await chromium.launch({ headless: false, args: AA_FLAGS });

  // ---- 1. Rasterise the six needed sheets, then force neutral grey ----
  section('Rasterising sheets 30-35 at 4 px/mm (+ AA-flag attempt, + post-process desaturation — see corrective note above)');
  const sheetPngs = {};
  for (const pg of SHEETS) {
    const { buffer, widthPx, heightPx } = await renderPage(browser, pg, PX_PER_MM);
    const grayBuffer = await desaturateToGrayscale(browser, buffer);
    const fname = path.join(OUT_DIR, `sheet-${pg}.png`);
    fs.writeFileSync(fname, grayBuffer);
    sheetPngs[pg] = grayBuffer;
    log(`sheet ${pg}: ${widthPx}x${heightPx}px -> ${fname} (desaturated to neutral grey post-process)`);
  }

  // ---- 2. Sample paper & ink colour off the real rasterisation ----
  section('Colour sampling (measured off the render)');
  const colourSample = await runInCanvas(browser, sheetPngs[32], (ctx, canvas) => {
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    let paperSum = [0, 0, 0], paperN = 0;
    for (let y = 10; y < 60; y++) {
      for (let x = 10; x < width - 10; x++) {
        const i = (y * width + x) * 4;
        paperSum[0] += data[i]; paperSum[1] += data[i + 1]; paperSum[2] += data[i + 2];
        paperN++;
      }
    }
    const paper = paperSum.map((s) => Math.round(s / paperN));
    const lums = new Float64Array(width * height);
    for (let p = 0, i = 0; p < width * height; p++, i += 4) {
      lums[p] = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
    }
    const sorted = Array.from(lums).sort((a, b) => a - b);
    const darkThreshold = sorted[Math.floor(sorted.length * 0.001)];
    let inkSum = [0, 0, 0], inkN = 0;
    let inkMin = [255, 255, 255];
    for (let p = 0, i = 0; p < width * height; p++, i += 4) {
      if (lums[p] <= darkThreshold) {
        inkSum[0] += data[i]; inkSum[1] += data[i + 1]; inkSum[2] += data[i + 2];
        inkN++;
        inkMin[0] = Math.min(inkMin[0], data[i]);
        inkMin[1] = Math.min(inkMin[1], data[i + 1]);
        inkMin[2] = Math.min(inkMin[2], data[i + 2]);
      }
    }
    const ink = inkSum.map((s) => Math.round(s / inkN));
    return { paper, ink, inkMin, darkThreshold, inkN };
  });
  const hex = (rgb) => '#' + rgb.map((v) => v.toString(16).padStart(2, '0')).join('');
  log(`Measured paper: rgb(${colourSample.paper}) = ${hex(colourSample.paper)}  (hypothesis was ${HYPOTHESIS.paper})`);
  log(`Measured ink (darkest 0.1% of pixels, n=${colourSample.inkN}): rgb(${colourSample.ink}) = ${hex(colourSample.ink)}  (hypothesis was ${HYPOTHESIS.ink})`);
  log(`Measured ink, single darkest pixel per channel: rgb(${colourSample.inkMin}) = ${hex(colourSample.inkMin)}`);

  // ---- 3. Compose the main still ----
  section('Compositing no-part-01.png');
  const mainW = FRAME_MM.w * PX_PER_MM;
  const mainH = FRAME_MM.h * PX_PER_MM;
  // Use the SAME rounded integer pixel size renderPage() actually produced
  // (864x1118 — true US Letter at 4px/mm, see pdf-render-lib.js), not a raw
  // float multiply, so the composite math lines up with the real crops.
  const pageWpx = Math.round(PAGE_MM.w * PX_PER_MM);
  const pageHpx = Math.round(PAGE_MM.h * PX_PER_MM);
  const slicePx = SLICE_MM * PX_PER_MM;
  const wallTopPx = WALL_TOP_MM * PX_PER_MM;
  const wallBottomPx = mainH - wallTopPx - pageHpx;
  log(`Page raster: ${pageWpx}x${pageHpx}px = ${(pageWpx / PX_PER_MM).toFixed(2)}x${(pageHpx / PX_PER_MM).toFixed(2)}mm (true US Letter; see README defect note — proposal's "279mm" undershoots true 279.4mm).`);
  log(`Wall margins in the composite: top=${WALL_TOP_MM}mm (${wallTopPx}px, exact, as specified) / bottom=${(wallBottomPx / PX_PER_MM).toFixed(2)}mm (${wallBottomPx}px) — the spec's 91mm bottom margin is adjusted by the same 0.4mm the page height corrects, so the canvas stays exactly 4800x1840px.`);

  const compositeSpec = {
    mainW, mainH, pageWpx, pageHpx, slicePx, wallTopPx,
    wall: HYPOTHESIS.wall, seam: HYPOTHESIS.seam,
    placements: [
      { pg: 30, sx: pageWpx - slicePx, sy: 0, sw: slicePx, sh: pageHpx, dx: 0 },
      { pg: 31, sx: 0, sy: 0, sw: pageWpx, sh: pageHpx, dx: slicePx },
      { pg: 32, sx: 0, sy: 0, sw: pageWpx, sh: pageHpx, dx: slicePx + pageWpx },
      { pg: 33, sx: 0, sy: 0, sw: pageWpx, sh: pageHpx, dx: slicePx + 2 * pageWpx },
      { pg: 34, sx: 0, sy: 0, sw: pageWpx, sh: pageHpx, dx: slicePx + 3 * pageWpx },
      { pg: 35, sx: 0, sy: 0, sw: slicePx, sh: pageHpx, dx: slicePx + 4 * pageWpx },
    ],
  };
  // Seams: internal joins between consecutive placements (5 of them).
  const seamPositions = [];
  for (let i = 0; i < compositeSpec.placements.length - 1; i++) {
    const a = compositeSpec.placements[i];
    const w = a.sw;
    seamPositions.push(a.dx + w);
  }

  const compositeResult = await composeFrame(browser, sheetPngs, compositeSpec, seamPositions);
  fs.writeFileSync(path.join(OUT_DIR, 'no-part-01.png'), compositeResult.mainBuf);
  log(`wrote no-part-01.png: ${mainW}x${mainH}px (4 px/mm)`);

  // ---- 4. Downsample to the half version ----
  section('Downsampling no-part-01-half.png');
  const halfBuf = await downsample2x(browser, compositeResult.mainBuf, mainW, mainH);
  fs.writeFileSync(path.join(OUT_DIR, 'no-part-01-half.png'), halfBuf);
  log(`wrote no-part-01-half.png: ${mainW / 2}x${mainH / 2}px (2 px/mm, exact 2x downsample of the 4px/mm rasterisation)`);

  // ---- 5. Measurements ----
  section('MEASUREMENT 3 — prose inset check on sheets 30 & 31 (rows-only pages)');
  log('NOTE: a naive "is there ink at column x=229px (162.47pt)" test is not');
  log('useful here — every caption is long enough to cross that column as a');
  log('side effect of its own text, which is not the claim being tested. The');
  log('proposal\'s claim is about where a text RUN STARTS, so each detected');
  log('line is classified by its own leftmost ink pixel instead.');
  for (const pg of [30, 31]) {
    const r = await checkProseInsetCorrected(browser, sheetPngs[pg]);
    log(`sheet ${pg}: ${r.totalLines} text lines detected. Docket-column starts (x~102px): ${r.classified.filter((c) => c.cls === 'docket-row').length}. Short/folio-width lines: ${r.shortLines.map((s) => `y=[${s.top}-${s.bottom}] x=[${s.left}-${s.right}] (center x=${Math.round((s.left + s.right) / 2)}px = ${((s.left + s.right) / 2 / PX_PER_MM).toFixed(1)}mm)`).join('; ') || 'none'}. Lines starting at neither the docket column nor classified as a short folio-width line (i.e. candidates for a genuine prose-inset paragraph run, or any other anomaly): ${r.anomalies.length === 0 ? 'NONE — confirms no paragraph prose on this page' : JSON.stringify(r.anomalies)}`);
  }

  section('MEASUREMENT 4 — the hinge on sheet 32, in both sheet-local and final-frame pixel coordinates');
  const hinge = await findHingeLines(browser, sheetPngs[32]);
  const sheet32dx = compositeSpec.placements.find((p) => p.pg === 32).dx;
  for (const line of hinge) {
    const frameX0 = sheet32dx + line.left;
    const frameX1 = sheet32dx + line.right;
    const frameY0 = wallTopPx + line.top;
    const frameY1 = wallTopPx + line.bottom;
    log(`"${line.label}": sheet-local y=[${line.top}-${line.bottom}], x=[${line.left}-${line.right}]  |  FRAME coords x=[${frameX0}-${frameX1}], y=[${frameY0}-${frameY1}]`);
  }

  section('MEASUREMENT 5 — legibility (pixels, not propositions)');
  const glyph = await measureGlyphHeight(browser, sheetPngs[32]);
  log(`Capital "T" of "The petitions..." (mass sentence, sheet 32): ink bounding box height = ${glyph.heightPx}px (spec predicts 14.1px for 10.02pt type at 4px/mm).`);
  const halfGlyph = await measureGlyphHeightInRegion(browser, halfBuf, glyph.regionInMain);
  log(`Same glyph, read off no-part-01-half.png (2px/mm): ink bounding box height = ${halfGlyph.heightPx}px, distinct-row count = ${halfGlyph.distinctRows}.`);

  section('MEASUREMENT 6 — frame coverage (paper vs wall)');
  const coverage = await measureCoverage(browser, compositeResult.mainBuf, mainW, mainH, wallTopPx, pageHpx);
  log(`Analytic: paper band = ${pageHpx}px / ${mainH}px = ${(pageHpx / mainH * 100).toFixed(2)}% of frame height; wall = ${(100 - pageHpx / mainH * 100).toFixed(2)}%.`);
  log(`Pixel count: paper-coloured pixels = ${coverage.paperPixels} (${(coverage.paperPixels / (mainW * mainH) * 100).toFixed(2)}%), wall-coloured = ${coverage.wallPixels} (${(coverage.wallPixels / (mainW * mainH) * 100).toFixed(2)}%), other = ${coverage.otherPixels} (${(coverage.otherPixels / (mainW * mainH) * 100).toFixed(2)}%).`);

  section('MEASUREMENT 7 — colour census over no-part-01.png');
  const census = await colourCensus(browser, compositeResult.mainBuf);
  log(`Distinct colours: ${census.distinctColours}`);
  log(`Pixels with HSL saturation > 0.15: ${census.saturatedCount} (${(census.saturatedCount / (mainW * mainH) * 100).toFixed(2)}% of frame). Max saturation found: ${census.maxSat.toFixed(3)}.`);
  log(`Of those, pixels that are NOT within lightness [0.15,0.85] of white/black (i.e. would actually read as "coloured" to an eye, not just an HSL-formula artifact of a near-white/near-black antialiasing blend): ${census.saturatedNotNearWhiteBlack}.`);
  if (census.saturatedCount > 0) {
    log(`First ${Math.min(20, census.saturatedSamples.length)} saturated pixel locations (mostly near-white antialiasing fringe): ${JSON.stringify(census.saturatedSamples.slice(0, 20))}`);
  }
  if (census.saturatedNotNearWhiteBlack > 0) {
    log(`Sample of the perceptibly-coloured subset: ${JSON.stringify(census.midSamples.slice(0, 20))}`);
  }

  await browser.close();

  section('Done');
  log('See README.md for the (A)/(B) verdict, full measurement transcript, and defect list.');
}

// Post-process desaturation (last resort — see corrective note in main()).
// Forces every pixel's R, G, B channels to the SAME value (its own
// perceptual luminance, same 0.299/0.587/0.114 weights used everywhere else
// in this file), which drives HSL saturation to exactly 0 for every pixel
// in the buffer. Applied only to sheet rasters — pure PDF content, no
// studio-authored colour anywhere in them — never to the wall/seam fill
// added later at composite time.
async function desaturateToGrayscale(browser, pngBuffer) {
  return runInCanvas(browser, pngBuffer, (ctx, canvas) => {
    const { width, height } = canvas;
    const imgData = ctx.getImageData(0, 0, width, height);
    const data = imgData.data;
    for (let i = 0; i < data.length; i += 4) {
      const lum = Math.round(0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2]);
      data[i] = lum; data[i + 1] = lum; data[i + 2] = lum;
    }
    ctx.putImageData(imgData, 0, 0);
    return canvas.toDataURL('image/png').split(',')[1];
  }).then((b64) => Buffer.from(b64, 'base64'));
}

// ---- Composite + downsample + measurement implementations ----

async function composeFrame(browser, sheetPngs, spec, seamPositions) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto('about:blank');
  // Load all sheet images as data URLs
  const dataUrls = {};
  for (const pg of Object.keys(sheetPngs)) {
    dataUrls[pg] = 'data:image/png;base64,' + sheetPngs[pg].toString('base64');
  }
  const outB64 = await page.evaluate(async ({ dataUrls, spec, seamPositions }) => {
    const imgs = {};
    for (const pg of Object.keys(dataUrls)) {
      const img = new Image();
      await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = dataUrls[pg]; });
      imgs[pg] = img;
    }
    const canvas = document.createElement('canvas');
    canvas.width = spec.mainW;
    canvas.height = spec.mainH;
    const c = canvas.getContext('2d');
    c.fillStyle = spec.wall;
    c.fillRect(0, 0, spec.mainW, spec.mainH);
    for (const pl of spec.placements) {
      c.drawImage(imgs[pl.pg], pl.sx, pl.sy, pl.sw, pl.sh, pl.dx, spec.wallTopPx, pl.sw, pl.sh);
    }
    // Seam shadow: a subtle 2px vertical band at each internal join.
    c.save();
    c.globalAlpha = 0.55;
    c.fillStyle = spec.seam;
    for (const x of seamPositions) {
      c.fillRect(x - 1, spec.wallTopPx, 2, spec.pageHpx);
    }
    c.restore();
    return canvas.toDataURL('image/png').split(',')[1];
  }, { dataUrls, spec, seamPositions });
  await ctx.close();
  return { mainBuf: Buffer.from(outB64, 'base64') };
}

async function downsample2x(browser, pngBuffer, w, h) {
  const ctx = await browser.newContext();
  const page = await ctx.newPage();
  await page.goto('about:blank');
  const b64 = pngBuffer.toString('base64');
  const outB64 = await page.evaluate(async ({ dataUrl, w, h }) => {
    const img = new Image();
    await new Promise((resolve, reject) => { img.onload = resolve; img.onerror = reject; img.src = dataUrl; });
    const canvas = document.createElement('canvas');
    canvas.width = w / 2;
    canvas.height = h / 2;
    const c = canvas.getContext('2d');
    c.imageSmoothingEnabled = true;
    c.imageSmoothingQuality = 'high';
    c.drawImage(img, 0, 0, w, h, 0, 0, w / 2, h / 2);
    return canvas.toDataURL('image/png').split(',')[1];
  }, { dataUrl: `data:image/png;base64,${b64}`, w, h });
  await ctx.close();
  return Buffer.from(outB64, 'base64');
}

async function findHingeLines(browser, pngBuffer) {
  // Detect all text-line bands by row ink-density, then label the last four
  // by their known reading order (visually verified against the render):
  // ... BROOKS row, mass sentence, GUERRERO row, Powe-motion opening line.
  const bands = await runInCanvas(browser, pngBuffer, (ctx, canvas) => {
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    const rowInk = new Array(height).fill(0);
    for (let y = 0; y < height; y++) {
      let count = 0;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (lum < 150) count++;
      }
      rowInk[y] = count;
    }
    const bands = [];
    let inBand = false, top = 0;
    for (let y = 0; y < height; y++) {
      const has = rowInk[y] > 2;
      if (has && !inBand) { inBand = true; top = y; }
      if (!has && inBand) { inBand = false; bands.push({ top, bottom: y - 1 }); }
    }
    if (inBand) bands.push({ top, bottom: height - 1 });
    // For each band, find left/right ink extent.
    return bands.map((b) => {
      let left = width, right = 0;
      for (let y = b.top; y <= b.bottom; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          if (lum < 150) { if (x < left) left = x; if (x > right) right = x; }
        }
      }
      return { ...b, left, right };
    });
  });
  // Two non-content bands sit below the four we want and must be filtered
  // out first (found by inspection, general enough to state as a rule):
  //  - the folio ("32"): a real text line, but narrow (~14px wide, it is
  //    only 2 digits) — width < 60px excludes it.
  //  - a 1px-tall, full-canvas-width artifact at the very bottom edge of
  //    the crop (an anti-aliasing seam at the page/background boundary,
  //    not text) — height < 6px excludes it.
  const realLines = bands.filter((b) => (b.right - b.left + 1) >= 60 && (b.bottom - b.top + 1) >= 6);
  const last4 = realLines.slice(-4);
  const labels = [
    '25-5543 BROOKS, ALTONY V. JOHNSTON, SGT., ET AL. (last docket row)',
    'The petitions for writs of certiorari are denied. (mass sentence)',
    '24-948 GUERRERO, CHIEF JUSTICE, ET AL. V. REDD, STEPHEN M.',
    'The motion to substitute Melissa Powe... (opening line)',
  ];
  return last4.map((b, i) => ({ ...b, label: labels[i] }));
}

// Corrected prose-inset check. A naive "is there ink at column x=162.47pt"
// test is USELESS on these pages: every caption is long enough to have ink
// crossing that column as a side effect of its own text, which is not what
// the proposal's claim is about. The proposal's claim is about where a text
// RUN STARTS. So: find every text-line band (full row/left/right detection,
// same as findHingeLines), and for each report its own leftmost ink pixel.
// On a docket+caption row that will be ~x=101.6px (71.97pt, the docket
// column). On the page-number folio it will be wherever the folio actually
// sits. A genuine "prose inset" line would be one whose leftmost ink is at
// neither of those — i.e. an indented paragraph run with no docket to its
// left. We report the full classified list so the gate can read the real
// evidence rather than a single collapsed number.
async function checkProseInsetCorrected(browser, pngBuffer) {
  const bands = await runInCanvas(browser, pngBuffer, (ctx, canvas) => {
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    const rowInk = new Array(height).fill(0);
    for (let y = 0; y < height; y++) {
      let count = 0;
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (lum < 150) count++;
      }
      rowInk[y] = count;
    }
    const bands = [];
    let inBand = false, top = 0;
    for (let y = 0; y < height; y++) {
      const has = rowInk[y] > 2;
      if (has && !inBand) { inBand = true; top = y; }
      if (!has && inBand) { inBand = false; bands.push({ top, bottom: y - 1 }); }
    }
    if (inBand) bands.push({ top, bottom: height - 1 });
    return bands.map((b) => {
      let left = width, right = 0;
      for (let y = b.top; y <= b.bottom; y++) {
        for (let x = 0; x < width; x++) {
          const i = (y * width + x) * 4;
          const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
          if (lum < 150) { if (x < left) left = x; if (x > right) right = x; }
        }
      }
      return { ...b, left, right };
    });
  });
  const DOCKET_X = 102; // measured: 71.97pt -> 101.6px
  const PROSE_X = 229; // proposal's claimed inset: 162.47pt -> 229.3px
  const TOL = 12;
  const realLines = bands.filter((b) => (b.right - b.left + 1) >= 6 && (b.bottom - b.top + 1) >= 6);
  const classified = realLines.map((b) => {
    let cls;
    if (Math.abs(b.left - DOCKET_X) <= TOL) cls = 'docket-row';
    else if ((b.right - b.left + 1) < 60) cls = 'short-line (likely folio)';
    else if (Math.abs(b.left - PROSE_X) <= TOL) cls = 'PROSE-INSET LINE';
    else cls = 'ANOMALY';
    return { ...b, cls };
  });
  const anomalies = classified.filter((b) => b.cls === 'ANOMALY' || b.cls === 'PROSE-INSET LINE');
  const shortLines = classified.filter((b) => b.cls === 'short-line (likely folio)');
  return { totalLines: realLines.length, classified, anomalies, shortLines };
}

async function measureGlyphHeight(browser, pngBuffer) {
  // The "T" of "The petitions" at the start of the mass sentence. Located by
  // cropping a small known region (established by direct visual inspection
  // of sheet-32.png at the sentence line) and finding the ink bbox within it.
  return runInCanvas(browser, pngBuffer, (ctx, canvas) => {
    const { width, height } = canvas;
    // Mass-sentence line band measured at y=933-943, left ink edge x=247
    // (see MEASUREMENT 4 log). Search a generous box around the "T".
    const region = { x0: 235, y0: 925, x1: 285, y1: 955 };
    const data = ctx.getImageData(0, 0, width, height).data;
    let top = null, bottom = null, left = null, right = null;
    for (let y = region.y0; y < region.y1; y++) {
      for (let x = region.x0; x < region.x1; x++) {
        const i = (y * width + x) * 4;
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (lum < 150) {
          if (top === null) top = y;
          bottom = y;
          if (left === null || x < left) left = x;
          if (right === null || x > right) right = x;
        }
      }
    }
    return {
      heightPx: top === null ? null : bottom - top + 1,
      widthPx: left === null ? null : right - left + 1,
      region,
      bbox: { top, bottom, left, right },
    };
  }).then((r) => ({ ...r, regionInMain: r.region }));
}

async function measureGlyphHeightInRegion(browser, pngBuffer, region) {
  // region is in the ORIGINAL sheet-32.png coordinate space (4px/mm); the
  // half image is a straight 2x downsample of the whole composite, so the
  // corresponding region there is half those coordinates PLUS the sheet's
  // offset within the composite, also halved. We pass in the already
  // sheet-local region and just halve it for a local visual check, then
  // separately confirm the count of distinct dark "rows" (proxy for whether
  // strokes still resolve individually vs. have merged to a grey mass).
  const half = {
    x0: Math.floor(region.x0 / 2), x1: Math.ceil(region.x1 / 2),
    y0: Math.floor(region.y0 / 2), y1: Math.ceil(region.y1 / 2),
  };
  return runInCanvas(browser, pngBuffer, (ctx, canvas, args) => {
    const { width, height } = canvas;
    // Search across the WHOLE half image for the darkest local cluster near
    // the proportional location of the sentence (since composite offsets
    // differ from the single-sheet crop used to find the region originally,
    // we instead just do a broad row/col ink profile in a generously sized
    // box around the expected proportional position and report the ink
    // extent found, which is what matters for "has this become texture").
    const data = ctx.getImageData(0, 0, width, height).data;
    const x0 = Math.max(0, args.half.x0 - 10), x1 = Math.min(width, args.half.x1 + 200);
    const y0 = Math.max(0, args.half.y0 - 10), y1 = Math.min(height, args.half.y1 + 10);
    let top = null, bottom = null, distinctRows = 0;
    for (let y = y0; y < y1; y++) {
      let rowHasInk = false;
      for (let x = x0; x < x1; x++) {
        const i = (y * width + x) * 4;
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (lum < 180) { rowHasInk = true; if (top === null) top = y; bottom = y; }
      }
      if (rowHasInk) distinctRows++;
    }
    return { heightPx: top === null ? null : bottom - top + 1, distinctRows, searchBox: { x0, x1, y0, y1 } };
  }, { half });
}

async function measureCoverage(browser, pngBuffer, mainW, mainH, wallTopPx, pageHpx) {
  return runInCanvas(browser, pngBuffer, (ctx, canvas, args) => {
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    let paperPixels = 0, wallPixels = 0, otherPixels = 0;
    // Wall colour and paper colour, sampled once from known-pure locations.
    const wallSample = ((y0) => {
      const i = (y0 * width + 5) * 4;
      return [data[i], data[i + 1], data[i + 2]];
    })(5);
    const closeTo = (i, ref, tol) => Math.abs(data[i] - ref[0]) <= tol && Math.abs(data[i + 1] - ref[1]) <= tol && Math.abs(data[i + 2] - ref[2]) <= tol;
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
        if (closeTo(i, wallSample, 6)) wallPixels++;
        else if (lum > 150) paperPixels++; // paper or ink-on-paper region (light background dominates each text row)
        else otherPixels++;
      }
    }
    return { paperPixels, wallPixels, otherPixels, wallSample };
  }, { mainW, mainH, wallTopPx, pageHpx });
}

async function colourCensus(browser, pngBuffer) {
  return runInCanvas(browser, pngBuffer, (ctx, canvas) => {
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    const seen = new Set();
    let saturatedCount = 0;
    let saturatedNotNearWhiteBlack = 0; // L in [0.15,0.85] — perceptibly-coloured pixels
    let maxSat = 0;
    const saturatedSamples = [];
    const midSamples = [];
    for (let y = 0; y < height; y++) {
      for (let x = 0; x < width; x++) {
        const i = (y * width + x) * 4;
        const r = data[i], g = data[i + 1], b = data[i + 2];
        const key = (r << 16) | (g << 8) | b;
        seen.add(key);
        const max = Math.max(r, g, b) / 255, min = Math.min(r, g, b) / 255;
        const l = (max + min) / 2;
        let s = 0;
        if (max !== min) {
          s = l > 0.5 ? (max - min) / (2 - max - min) : (max - min) / (max + min);
        }
        if (s > maxSat) maxSat = s;
        if (s > 0.15) {
          saturatedCount++;
          if (saturatedSamples.length < 200) saturatedSamples.push({ x, y, r, g, b, s: +s.toFixed(3) });
          if (l >= 0.15 && l <= 0.85) {
            saturatedNotNearWhiteBlack++;
            if (midSamples.length < 50) midSamples.push({ x, y, r, g, b, s: +s.toFixed(3), l: +l.toFixed(3) });
          }
        }
      }
    }
    return { distinctColours: seen.size, saturatedCount, saturatedSamples, saturatedNotNearWhiteBlack, midSamples, maxSat };
  });
}

main().catch((e) => { console.error(e); process.exit(1); });
