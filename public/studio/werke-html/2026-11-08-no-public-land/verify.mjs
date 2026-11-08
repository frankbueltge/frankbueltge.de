// Opens the work in Chromium at 1100 px (light) and 390 px (dark), checks for errors and sideways scroll,
// checks that every quarter's parcels are fitted to their shares, and writes process/<n>.png at 1100 px.
// Usage: node verify.mjs <n>
import { createRequire } from 'module';
import { fileURLToPath } from 'url';
import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const dir = path.dirname(fileURLToPath(import.meta.url));
const n = process.argv[2] || '1';
const b = await chromium.launch();
let bad = 0;
for (const [w, h, scheme] of [[1100, 900, 'light'], [390, 844, 'dark']]) {
  const p = await b.newPage({ viewport: { width: w, height: h }, deviceScaleFactor: 1, colorScheme: scheme });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto('file://' + dir + '/index.html');
  await p.waitForTimeout(600);
  let worst = 0;
  for (let q = 0; q < 17; q++) {
    const e = await p.evaluate((q) => { const s = document.getElementById('q'); s.value = String(q); s.dispatchEvent(new Event('input')); return window.NPL_fitError(); }, q);
    worst = Math.max(worst, e);
  }
  const sw = await p.evaluate(() => document.documentElement.scrollWidth);
  console.log(`${w}px ${scheme}: errors ${errs.length}, scrollWidth ${sw}, worst fit ${worst.toFixed(2)} points of share`);
  if (errs.length || sw > w || worst > 0.5) { bad++; console.log(errs); }
  if (w === 1100) {
    await p.evaluate(() => { const s = document.getElementById('q'); s.value = '15'; s.dispatchEvent(new Event('input')); });
    await p.waitForTimeout(150);
    await p.screenshot({ path: `${dir}/process/${n}.png`, clip: { x: 0, y: 0, width: 1100, height: 900 } });
  }
  await p.close();
}
await b.close();
if (bad) { console.log('FAILED'); process.exit(1); }
console.log('ok');
