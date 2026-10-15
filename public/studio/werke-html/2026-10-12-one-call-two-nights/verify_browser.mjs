// node verify_browser.mjs — the standalone page at 390 px (light) and 1100 px (dark)
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const C = JSON.parse(fs.readFileSync(join(here, 'tellings.json'))).tellings;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
let pass = 0, fail = 0; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };
for (const [w, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + join(here, 'index.html')); await p.waitForTimeout(300);
  t(w + ' no errors on load', errs.length === 0);
  for (const [n, k] of [['1979-11-09', 0], ['1980-06-03', 1]]) {
    await p.click(`[data-night="${n}"]`); const a = C.filter(x => x.night === n).length;
    t(`${w} choosing ${n}: ${a} of ${C.length}`, (await p.locator('#callVerdict').innerText()).startsWith(`${a} of ${C.length}`));
  }
  await p.click('#callPlay'); await p.waitForTimeout(C.length * 900 + 400);
  t(w + ' play reaches the last telling', (await p.locator('#callCard').innerText()).includes('Wikipedia'));
  t(w + ' no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  t(w + ' no errors at end', errs.length === 0);
  await p.screenshot({ path: join(here, `shot-page-${w}.png`), fullPage: true }); await p.close();
}
await b.close(); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
