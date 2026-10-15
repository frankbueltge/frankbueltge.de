// node verify_browser.mjs — loads the page at 390 and 1100 px, moves every control, checks the figures against the committed results, writes shots
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }).catch(()=>chromium.launch());
let pass = 0, fail = 0; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };
for (const w of [390, 1100]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + join(here, 'index.html'));
  t(w + ' no errors on load', errs.length === 0);
  t(w + ' 225 cells', await p.locator('#cells i').count() === 225);
  t(w + ' 3 red cells', await p.locator('#cells i.o').count() === 3);
  t(w + ' 1 amber cell', await p.locator('#cells i.u').count() === 1);
  t(w + ' headline 3 of 225', (await p.locator('#tab').innerText()).includes('3 of 225'));
  t(w + ' fisher 0.43', (await p.locator('#tab').innerText()).includes('p = 0.43'));
  await p.click('#uN'); t(w + ' unclear called: 4 of 225', (await p.locator('#tab').innerText()).includes('4 of 225') && (await p.locator('#tab').innerText()).includes('p = 0.48'));
  await p.click('#uL');
  await p.fill('#n', '60'); await p.dispatchEvent('#n', 'input'); t(w + ' slider moves the line', (await p.locator('#line').innerText()).includes(' of 60'));
  const before = await p.locator('#fig').innerHTML(); await p.click('#shuf'); t(w + ' shuffle redraws', before !== await p.locator('#fig').innerHTML());
  await p.click('#orig'); t(w + ' order as read toggles', (await p.locator('#seed').innerText()).startsWith('Order as read'));
  t(w + ' 4 odd rows', await p.locator('#odd tr').count() === 5);
  t(w + ' no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  t(w + ' no errors after use', errs.length === 0);
  await p.fill('#n', '225'); await p.dispatchEvent('#n', 'input'); await p.screenshot({ path: join(here, `shot-${w}.png`), fullPage: false }); await p.close();
}
await b.close(); console.log(pass, 'passed,', fail, 'failed'); process.exit(fail ? 1 : 0);
