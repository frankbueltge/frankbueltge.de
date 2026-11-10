// Pixel-measurement helpers, all executed inside a throwaway Chromium
// <canvas> via canvas-lib.js's runInCanvas (same in-browser-canvas-only
// discipline as pdf-render-lib.js — no external image library anywhere).
const { runInCanvas } = require('./canvas-lib.js');

// Fraction of pixels in the PNG whose luminance is >= threshold ("white").
async function whiteFraction(browser, pngBuffer, threshold) {
  return runInCanvas(browser, pngBuffer, (ctx, canvas, args) => {
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    let white = 0;
    const total = width * height;
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum >= args.threshold) white++;
    }
    return { white, total, fraction: white / total };
  }, { threshold: threshold != null ? threshold : 250 });
}

// At row y, scan from both sides for the first pixel that differs from the
// known ground colour (rgb triple) by more than tol — returns the paper's
// left/right edge x, or null if the whole row is "ground" (no paper) or the
// whole row is "not ground" (edge off-screen / paper fills the row).
async function paperEdgesAtRow(browser, pngBuffer, y, groundRgb, tol) {
  return runInCanvas(browser, pngBuffer, (ctx, canvas, args) => {
    const { width, height } = canvas;
    const yy = Math.min(Math.max(0, args.y), height - 1);
    const row = ctx.getImageData(0, yy, width, 1).data;
    const [gr, gg, gb] = args.groundRgb;
    const isGround = (i) => Math.abs(row[i] - gr) <= args.tol && Math.abs(row[i + 1] - gg) <= args.tol && Math.abs(row[i + 2] - gb) <= args.tol;
    let left = null, right = null;
    for (let x = 0; x < width; x++) {
      if (!isGround(x * 4)) { left = x; break; }
    }
    for (let x = width - 1; x >= 0; x--) {
      if (!isGround(x * 4)) { right = x; break; }
    }
    return { left, right, width, height, y: yy };
  }, { y, groundRgb, tol: tol != null ? tol : 12 });
}

module.exports = { whiteFraction, paperEdgesAtRow };
