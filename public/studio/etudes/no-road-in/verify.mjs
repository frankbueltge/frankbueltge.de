// NO ROAD IN — open the page as a visitor does and check what it draws.
// Usage (repo root): node etudes/no-road-in/verify.mjs [out-dir-for-stills]
import { createRequire } from 'module'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const out = process.argv[2];
const browser = await chromium.launch(); let bad = 0;
for (const [w, scheme] of [[1100, 'light'], [390, 'dark']]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const errors = []; page.on('pageerror', e => errors.push(String(e))); page.on('console', m => m.type() === 'error' && errors.push(m.text()));
  await page.goto('file://' + path.join(here, 'index.html'));
  const all = await page.evaluate(() => ({ entered: +document.getElementById('map').dataset.entered, stones: document.querySelectorAll('#map [aria-label^="quoted sentence"]').length, side: document.documentElement.scrollWidth - window.innerWidth }));
  if (out) await page.screenshot({ path: path.join(out, `all-${w}.png`), fullPage: true });
  await page.click('#bForce');
  const force = await page.evaluate(() => ({ entered: +document.getElementById('map').dataset.entered, stones: document.querySelectorAll('#map [aria-label^="quoted sentence"]').length, big: !!document.querySelector('#map .big') }));
  if (out) await page.screenshot({ path: path.join(out, `force-${w}.png`), fullPage: true });
  await page.click('#map [aria-label="quoted sentence a4"]');
  const quote = await page.evaluate(() => document.querySelector('#panel q')?.textContent || '');
  const ok = all.entered === 2 && all.stones === 35 && all.side <= 0 && force.entered === 0 && force.stones === 18 && force.big && quote.includes('should always be subject') && !errors.length;
  console.log(w, scheme, JSON.stringify({ all, force, quote: quote.slice(0, 40), errors }), ok ? 'OK' : 'FAILED'); if (!ok) bad++;
  await page.close();
}
await browser.close(); process.exit(bad ? 1 : 0);
