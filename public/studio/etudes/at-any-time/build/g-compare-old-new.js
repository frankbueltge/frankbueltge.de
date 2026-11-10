// Re-measures the PREVIOUS session's stills (still on disk, unmodified)
// with the exact same measurement code used on the new ground stills, so
// every old-vs-new number in REPORT-2.md was decoded by the same apparatus
// in the same session, not copied from REPORT.md or the Dramaturg's ruling.
const fs = require('fs');
const path = require('path');
const { chromium } = require('playwright');
const { launchBrowser } = require('./canvas-lib.js');
const { fullImageStats, pixelLuminance, paperEdgesAtRow } = require('./g-measure-lib.js');

const DIR = path.resolve(__dirname, '..');
const OLD_GROUND = [255, 255, 255]; // the old build's ground WAS paper-white — no separate ground colour exists

async function measure(browser, file, edgeRow) {
  const buf = fs.readFileSync(path.join(DIR, file));
  const stats = await fullImageStats(browser, buf, 250);
  const corner = await pixelLuminance(browser, buf, 2, 2);
  const row = edgeRow != null ? edgeRow : Math.min(400, stats.height - 1);
  const edges = await paperEdgesAtRow(browser, buf, row, OLD_GROUND, 12);
  return {
    file, widthPx: stats.width, heightPx: stats.height, totalPixels: stats.total,
    fractionBelowLum250: stats.belowFraction, pixelsBelowLum250: stats.belowThreshold,
    darkestPixelLuminance: stats.minLuminance,
    cornerLuminance: corner.luminance,
    edgeRow: row, leftEdgeX: edges.left, rightEdgeX: edges.right,
    edgesDetectable: edges.left !== null && edges.right !== null && edges.left > 0 && edges.right < stats.width - 1,
  };
}

async function main() {
  const browser = await launchBrowser(chromium);
  const files = [
    ['e1-native-entry-08.png', 400], ['e1-native-entry-25.png', 400], ['e1-native-entry-55.png', 400],
    ['e1-extent-08.png', 5], ['e1-extent-25.png', 5], ['e1-extent-55.png', 5],
    ['e2-gap-longest-20d.png', 400], ['e2-gap-median-5d.png', 400],
  ];
  const out = [];
  for (const [f, row] of files) {
    if (!fs.existsSync(path.join(DIR, f))) { console.log('MISSING', f); continue; }
    const m = await measure(browser, f, row);
    out.push(m);
    console.log(JSON.stringify(m));
  }
  await browser.close();
  fs.writeFileSync(path.join(__dirname, 'g-compare-old-new.json'), JSON.stringify(out, null, 2));
}
main().catch(e => { console.error(e); process.exit(1); });
