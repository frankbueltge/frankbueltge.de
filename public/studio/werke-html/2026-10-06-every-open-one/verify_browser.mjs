// node verify_browser.mjs — real browser at 390 and 1100 px: marks tiles, reveals, reads the interval figure, checks photographs load and nothing overflows.
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path';
const here = dirname(new URL(import.meta.url).pathname);
let ran = 0, failed = 0;
const ok = (n, c, note) => { ran++; if (!c) { failed++; console.log('  FAIL ', n, note ?? ''); } };
const browser = await chromium.launch({ proxy: process.env.HTTPS_PROXY ? { server: process.env.HTTPS_PROXY } : undefined, args: ['--ignore-certificate-errors'] });
for (const [w, h] of [[390, 800], [1100, 900]]) {
  const page = await browser.newPage({ viewport: { width: w, height: h } });
  const errs = []; page.on('pageerror', e => errs.push(String(e)));
  await page.goto('file://' + join(here, 'index.html'));
  await page.waitForFunction(() => window.__everyOpenOne);
  ok(`${w}: 135 tiles`, await page.locator('#wall .t').count() === 135);
  ok(`${w}: 1520 strip cells`, await page.locator('#strip rect').count() === 1520);
  await page.evaluate(() => document.querySelector('#wall').scrollIntoView());
  await page.waitForTimeout(3500);
  const loaded = await page.evaluate(() => [...document.querySelectorAll('#wall img')].filter(i => i.complete && i.naturalWidth > 0).length);
  ok(`${w}: most visible photographs loaded`, loaded >= 20, loaded);
  ok(`${w}: reading hidden before the button`, await page.evaluate(() => getComputedStyle(document.getElementById('after')).display === 'none' && !document.querySelector('.t .tag').offsetParent));
  // mark the bone and one living tile
  const idx = await page.evaluate(() => { const D = window.__everyOpenOne; return [D.rows.findIndex(r => r.reading === 'remains'), D.rows.findIndex(r => r.reading === 'alive')]; });
  for (const i of idx) await page.locator(`#wall .t[data-i="${i}"]`).click({ position: { x: 40, y: 50 }, force: true });
  ok(`${w}: two marked`, (await page.textContent('#cnt')).startsWith('2 marked'));
  await page.locator(`#wall .t[data-i="${idx[1]}"]`).click({ position: { x: 40, y: 50 }, force: true });
  ok(`${w}: unmark works`, (await page.textContent('#cnt')).startsWith('1 marked'));
  await page.click('#show');
  ok(`${w}: after panel shown`, await page.evaluate(() => getComputedStyle(document.getElementById('after')).display === 'block'));
  const score = await page.textContent('#score');
  ok(`${w}: score says found 1, missed 4`, /found\s*1/.test(score) && /missed\s*4/.test(score), score);
  ok(`${w}: bone named as among yours`, /was among yours/.test(score));
  ok(`${w}: interval figure has 3 bars`, await page.locator('#iv rect').count() === 3);
  ok(`${w}: five odd tiles tagged`, await page.evaluate(() => [...document.querySelectorAll('.t .tag')].filter(t => t.offsetParent && t.textContent).length === 5));
  await page.locator(`#wall .t[data-i="${idx[0]}"]`).click({ position: { x: 40, y: 50 }, force: true });
  ok(`${w}: lightbox opens with the note after reveal`, await page.evaluate(() => document.getElementById('lb').classList.contains('on') && /Studio's reading: remains/.test(document.getElementById('lbc').textContent)));
  await page.click('#lbx');
  ok(`${w}: no sideways overflow`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
  ok(`${w}: no page errors`, errs.length === 0, errs.join(';'));
  await page.screenshot({ path: join(here, `shot-${w}.png`), fullPage: false });
  await page.close();
}
await browser.close();
console.log(`${ran} checks, ${failed} failed`); process.exit(failed ? 1 : 0);
