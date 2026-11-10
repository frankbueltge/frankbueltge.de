// Renders page 1 of every cached Miscellaneous Order PDF at the house's
// proven 4 px/mm scale, using pdf-render-lib.js (copied unmodified from
// projects/no-part/build/) exactly as render-sheets.js does there: one
// browser, one PDF loaded via file://...#page=1&zoom=100 at a time.
//
// pdf-render-lib.js's PDF_PATH is a fixed constant (../order-list.pdf
// relative to itself) — this script honours that by copying each source
// PDF's bytes to that one transient path immediately before rendering it,
// then deleting the transient file when the whole batch is done. That file
// is NEVER committed (see REPORT.md) and is removed at the end of this run.
//
// Usage: xvfb-run -a env NODE_PATH=/opt/node22/lib/node_modules node render-all-pages.js
const fs = require('fs');
const path = require('path');
const crypto = require('crypto');
const { chromium } = require('playwright');
const { PDF_PATH, renderPage } = require('./pdf-render-lib.js');
const { launchBrowser, desaturateToGrayscale } = require('./canvas-lib.js');

const CACHE_DIR = '/tmp/claude-0/-home-user-studio/98d41e62-3b71-5f78-9da1-5a51086e8713/scratchpad/pdfs';
const RENDER_DIR = '/tmp/claude-0/-home-user-studio/98d41e62-3b71-5f78-9da1-5a51086e8713/scratchpad/renders';
const CORPUS_PATH = path.resolve(__dirname, '..', '..', '..', 'projects', 'at-any-time', 'material', 'orders-2025-term.json');
const PX_PER_MM = 4;
const MAX_ATTEMPTS = 3;

function log(...a) { console.log(...a); }

async function renderWithRetry(browser, pageNum, pxPerMm, maxAttempts) {
  let lastErr;
  for (let attempt = 1; attempt <= maxAttempts; attempt++) {
    try { return await renderPage(browser, pageNum, pxPerMm); }
    catch (e) { lastErr = e; log(`  attempt ${attempt}/${maxAttempts} failed: ${e.message}`); await new Promise(r => setTimeout(r, 1000)); }
  }
  throw lastErr;
}

async function main() {
  const corpus = JSON.parse(fs.readFileSync(CORPUS_PATH, 'utf8'));
  const misc = corpus.records.filter(r => r.kind === 'Miscellaneous Order');
  fs.mkdirSync(RENDER_DIR, { recursive: true });

  const browser = await launchBrowser(chromium);
  const results = [];
  const failed = [];
  const t0 = Date.now();

  for (const r of misc) {
    const outPng = path.join(RENDER_DIR, r.file.replace(/\.pdf$/, '.png'));
    if (fs.existsSync(outPng)) {
      log(`skip (cached) ${r.file}`);
      continue;
    }
    const srcPdf = path.join(CACHE_DIR, r.file);
    if (!fs.existsSync(srcPdf)) { failed.push({ file: r.file, error: 'not fetched' }); continue; }
    fs.copyFileSync(srcPdf, PDF_PATH); // place at pdf-render-lib.js's fixed PDF_PATH
    const pageT0 = Date.now();
    try {
      const { buffer, widthPx, heightPx, shortfallPx } = await renderWithRetry(browser, 1, PX_PER_MM, MAX_ATTEMPTS);
      const grayBuffer = await desaturateToGrayscale(browser, buffer);
      fs.writeFileSync(outPng, grayBuffer);
      const dt = Date.now() - pageT0;
      log(`${r.file} -> ${path.basename(outPng)} ${widthPx}x${heightPx}px, ${grayBuffer.length}B, ${dt}ms${shortfallPx ? ` SHORTFALL=${shortfallPx}px` : ''}`);
      results.push({ file: r.file, date: r.date, widthPx, heightPx, bytes: grayBuffer.length, ms: dt, shortfallPx });
    } catch (e) {
      log(`${r.file} FAILED: ${e.message}`);
      failed.push({ file: r.file, error: e.message });
    }
  }

  await browser.close();
  if (fs.existsSync(PDF_PATH)) fs.unlinkSync(PDF_PATH); // remove transient file — never committed

  const totalMs = Date.now() - t0;
  const meanMs = results.length ? results.reduce((s, r) => s + r.ms, 0) / results.length : 0;
  log(`\nRendered ${results.length}/${misc.length} pages in ${(totalMs / 1000).toFixed(1)}s (this run only; cached skips not counted). Mean ${meanMs.toFixed(0)} ms/page.`);
  fs.writeFileSync(path.join(__dirname, 'render-log.json'), JSON.stringify({ pxPerMm: PX_PER_MM, totalMs, meanMs, results, failed }, null, 2));
  if (failed.length) { console.error('FAILED:', JSON.stringify(failed, null, 2)); process.exitCode = 1; }
}
main().catch(e => { console.error(e); process.exit(1); });
