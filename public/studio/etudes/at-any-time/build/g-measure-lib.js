// Measurement helpers added for THE ADOPTED GROUND / phone / markup checks.
// Same in-browser-canvas-only discipline as measure-lib.js (reused directly
// for paperEdgesAtRow); nothing here re-implements PNG decoding by hand.
const { runInCanvas } = require('./canvas-lib.js');
const { paperEdgesAtRow } = require('./measure-lib.js');

// Full-image stats in one pass: dimensions, fraction of pixels below
// `threshold` luminance, and the single darkest pixel's luminance.
async function fullImageStats(browser, pngBuffer, threshold) {
  return runInCanvas(browser, pngBuffer, (ctx, canvas, args) => {
    const { width, height } = canvas;
    const data = ctx.getImageData(0, 0, width, height).data;
    let below = 0;
    let minLum = 255;
    const total = width * height;
    for (let i = 0; i < data.length; i += 4) {
      const lum = 0.299 * data[i] + 0.587 * data[i + 1] + 0.114 * data[i + 2];
      if (lum < args.threshold) below++;
      if (lum < minLum) minLum = lum;
    }
    return { width, height, total, belowThreshold: below, belowFraction: below / total, minLuminance: minLum };
  }, { threshold: threshold != null ? threshold : 250 });
}

// Single-pixel luminance (and raw RGB) at (x,y) — used to sample a point
// expected to be pure ground.
async function pixelLuminance(browser, pngBuffer, x, y) {
  return runInCanvas(browser, pngBuffer, (ctx, canvas, args) => {
    const xx = Math.min(Math.max(0, args.x), canvas.width - 1);
    const yy = Math.min(Math.max(0, args.y), canvas.height - 1);
    const d = ctx.getImageData(xx, yy, 1, 1).data;
    return { x: xx, y: yy, r: d[0], g: d[1], b: d[2], luminance: 0.299 * d[0] + 0.587 * d[1] + 0.114 * d[2] };
  }, { x, y });
}

module.exports = { fullImageStats, pixelLuminance, paperEdgesAtRow };
