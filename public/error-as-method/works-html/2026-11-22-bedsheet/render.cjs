// Render flag SVGs to PNG at a fixed height (240 px) with the pre-installed Chromium.
// usage: node render.cjs OUTDIR file.svg ...
const { chromium } = require('playwright');
const fs = require('fs'), path = require('path');
const H = 240;
(async () => {
  const [outdir, ...files] = process.argv.slice(2);
  fs.mkdirSync(outdir, { recursive: true });
  const b = await chromium.launch(); const pg = await b.newPage({ deviceScaleFactor: 1 });
  for (const f of files) {
    const svg = fs.readFileSync(f).toString('base64');
    await pg.setContent(`<html><body style="margin:0;background:#fff"><img id="i" style="height:${H}px;display:block"></body></html>`);
    await pg.evaluate(s => new Promise(r => { const i = document.getElementById('i'); i.onload = r; i.onerror = r; i.src = 'data:image/svg+xml;base64,' + s; }), svg);
    const w = Math.max(1, Math.round(await pg.evaluate(() => document.getElementById('i').getBoundingClientRect().width)));
    await pg.setViewportSize({ width: w, height: H });
    await pg.locator('#i').screenshot({ path: path.join(outdir, path.basename(f, '.svg') + '.png') });
  }
  await b.close();
})();
