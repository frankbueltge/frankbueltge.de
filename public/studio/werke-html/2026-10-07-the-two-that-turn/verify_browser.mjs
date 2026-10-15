// node verify_browser.mjs — runs the page at 390 and 1100 px, calls the two open frames every way, checks the interval against the Field's grid, writes results.json
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs';
const here = dirname(new URL(import.meta.url).pathname);
let ran = 0, failed = 0; const ok = (n, c, note) => { ran++; if (!c) { failed++; console.log('  FAIL ', n, note ?? ''); } };
const browser = await chromium.launch({ args: ['--no-sandbox'] }); const grid = JSON.parse(fs.readFileSync(join(here, 'data.json'))).fields_grid; let results;
for (const [w, h] of [[390, 800], [1100, 900]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } }); const errs = [];
  page.on('pageerror', e => errs.push(String(e)));
  await page.route('https://inaturalist-open-data.s3.amazonaws.com/**', r => r.fulfill({ status: 200, contentType: 'image/png', body: Buffer.from('iVBORw0KGgoAAAANSUhEUgAAAAEAAAABCAYAAAAfFcSJAAAADUlEQVR42mNkYPhfDwAChwGA60e6kgAAAABJRU5ErkJggg==', 'base64') }));
  await page.goto('file://' + join(here, 'index.html')); await page.waitForFunction(() => window.__ready);
  ok(`${w}: five frames`, await page.locator('.f').count() === 5);
  ok(`${w}: two open frames with buttons`, await page.locator('.f.open').count() === 2 && await page.locator('.f.open button').count() === 5);
  ok(`${w}: no figure before the call`, (await page.locator('#fig').innerHTML()) === '');
  ok(`${w}: credit on every frame`, (await page.locator('.cap').allTextContents()).every(t => /CC0|CC BY/.test(t)));
  const out = [];
  for (const [a, b] of [['alive', 'alive'], ['none', 'alive'], ['alive', 'none'], ['none', 'none'], ['bone', 'none']]) {
    await page.locator('.f.open').nth(0).locator('button', { hasText: { alive: 'a living animal', none: 'no living animal', bone: 'a bone' }[a] }).click();
    await page.locator('.f.open').nth(1).locator('button', { hasText: { alive: 'a living animal', none: 'no living animal' }[b] }).click();
    const r = await page.evaluate(() => window.__two); out.push({ a, b, ...r });
    ok(`${w}: ${a}/${b} counts`, r.non === 3 + (a !== 'alive') + (b === 'none'));
    ok(`${w}: ${a}/${b} interval ordered`, r.lo < r.mid && r.mid < r.hi && r.hi < 0.05);
  }
  ok(`${w}: Studio's call shown`, (await page.textContent('#reveal')).includes('instead of 5'));
  // five events vs the Field's grid at rho .05 and .28
  await page.locator('.f.open').nth(0).locator('button', { hasText: 'no living animal' }).click(); await page.locator('.f.open').nth(1).locator('button', { hasText: 'no living animal' }).click();
  for (const rho of [0.05, 0.28]) {
    const iv = await page.evaluate(r => window.__interval(5, r, 40000, 1), rho); const F = grid[String(rho)].non_living;
    ok(`${w}: rho ${rho} lo vs Field`, Math.abs(iv[0] - F[0]) < 0.0003, iv[0] + ' ' + F[0]); ok(`${w}: rho ${rho} hi vs Field`, Math.abs(iv[2] - F[2]) < 0.0012, iv[2] + ' ' + F[2]); ok(`${w}: rho ${rho} mid vs Field`, Math.abs(iv[1] - F[1]) < 0.0004, iv[1] + ' ' + F[1]);
    if (w === 1100) (results ??= {}).field_check ??= {}, results.field_check[rho] = { studio_js: iv, field: F };
  }
  await page.fill('#rho', '0.28').catch(() => {}); await page.evaluate(() => { const r = document.getElementById('rho'); r.value = 0.28; r.dispatchEvent(new Event('input')); });
  ok(`${w}: slider moves figure`, (await page.textContent('#rv')) === '0.28');
  await page.click('#mB'); ok(`${w}: bone mode`, (await page.textContent('#kline')).includes('as bone'));
  ok(`${w}: no horizontal overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  ok(`${w}: no errors`, errs.length === 0, errs.join('|'));
  if (w === 1100) { (results ??= {}).scenarios = out; await page.screenshot({ path: join(here, 'shot-1100.png'), fullPage: true }); } else await page.screenshot({ path: join(here, 'shot-390.png'), fullPage: true });
  await page.close();
}
await browser.close();
fs.writeFileSync(join(here, 'results.json'), JSON.stringify({ note: 'Interval of the share of all 1,528 records with no living animal (2.5 to 97.5 %, 20,000 seeded draws), by the visitor-style call of the two open frames; Studio reread = none/alive', ...results }, null, 1));
console.log(`${ran - failed} passed, ${failed} failed`); process.exit(failed ? 1 : 0);
