// Shared in-browser canvas helpers used by render-sheets.js, compose-strip.js
// and measure.js. Same pattern as the concept-gate étude's build.js
// (etudes/5000-series/still/no-part/build.js): there is no external image
// library anywhere on this machine (no sharp/pngjs/canvas/jimp under
// NODE_PATH), so every pixel operation — decode, crop, composite, downsample,
// measure — is done inside a throwaway Chromium page's <canvas>, and PNG
// encoding is Chromium's own canvas.toDataURL(), never a hand-rolled encoder.
//
// runInCanvas(browser, pngBuffer, fn, args) loads pngBuffer into an
// in-browser canvas and runs fn(ctx, canvas, args) there (fn is serialised
// via toString(), so it must be self-contained — no closures over outer
// scope, only what's passed in `args`), returning fn's return value back to
// Node as plain JSON.

const AA_FLAGS = [
  '--disable-lcd-text',
  '--disable-font-subpixel-positioning',
  '--force-color-profile=srgb',
  '--disable-features=PdfUseSkiaRenderer',
];

const LUM_THRESH = 150; // same ink/background threshold used throughout the concept-gate build

async function launchBrowser(chromium) {
  // headless:false under Xvfb is required for the PDF viewer path in
  // render-sheets.js (see README "environment quirks"); compose-strip.js and
  // measure.js don't need the PDF viewer at all, but are launched the same
  // way for consistency and so all three scripts can share one browser
  // instance if ever combined.
  return chromium.launch({ headless: false, args: AA_FLAGS });
}

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

// Post-process desaturation — see the concept-gate étude's README.md
// "Defects" §5 for the full account: this Chromium build's PDF viewer
// introduces a faint, non-neutral colour cast into anti-aliased glyph edges
// (subpixel/LCD text antialiasing internal to its PDF canvas), which is not
// a property of the source document (every text-showing content stream in
// order-list.pdf was grepped for a colour-setting operator; none exists —
// the PDF draws all glyphs at the DeviceGray default). Forcing every pixel's
// R,G,B to its own perceptual luminance removes that render-pipeline
// artefact without touching glyph shape or ink coverage (confirmed in the
// prior build: bounding-box measurements were bit-identical before/after).
// This is a correction of this house's own instrument, not an addition to
// the document — it can only ever remove a colour cast, never add a mark.
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

module.exports = { AA_FLAGS, LUM_THRESH, launchBrowser, runInCanvas, desaturateToGrayscale };
