// node verify_browser.mjs — UNDERNEATH in a real browser at 390 px (light) and 1100 px (dark)
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const D = JSON.parse(fs.readFileSync(join(here, 'data.json')));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files', '--autoplay-policy=no-user-gesture-required'] });
let pass = 0, fail = 0; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };
for (const [w, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + join(here, 'index.html')); await p.waitForTimeout(1200);
  t(w + ' no errors on load', errs.length === 0);
  t(w + ' land loaded', await p.evaluate(() => window.__UN.state.ready));
  t(w + ` ${D.rows.length} chips`, (await p.locator('.chip').count()) === D.rows.length);
  t(w + ' held figure has a bar per impact', (await p.locator('#held rect').count()) === D.rows.length);
  t(w + ' Field clock drawn (21 bars)', (await p.locator('#fclock rect.b').count()) === 21);
  // Berlin: fast path, then the counts on the page must equal data.json
  const iB = D.rows.findIndex(r => r.des === '2024 BX1');
  await p.evaluate(i => window.__UN.show(i, true), iB); await p.waitForTimeout(400);
  const nd = await p.evaluate(() => window.__UN.state.dots.length), want = Math.round(D.rows[iB].residents_50km / 1000);
  t(`${w} Berlin dots ${nd} vs ${want} (all on land, within 2 %)`, Math.abs(nd - want) <= want * 0.02);
  t(w + ' Berlin card says 2 h 44 min and night', /2 h 44 min/.test(await p.locator('#card').innerText()) && /night/.test(await p.locator('#card').innerText()));
  t(w + ' Berlin verdict names the count', /estimate, about 1,709,000/.test(await p.locator('#verdict').innerText()));
  // a sea impact has no dots
  const iS = D.rows.findIndex(r => r.des === '2014 AA');
  await p.evaluate(i => window.__UN.show(i, true), iS); await p.waitForTimeout(300);
  t(w + ' 2014 AA: open water, no dots', (await p.evaluate(() => window.__UN.state.dots.length)) === 0 && /open water/.test(await p.locator('#verdict').innerText()));
  // the slow path runs and ends in a verdict (shortest warning, 2024 UQ)
  await p.locator('.chip', { hasText: '2024 UQ' }).click(); await p.waitForTimeout(1400 + 1300 + 1800 + 1700);
  t(w + ' 2024 UQ played to its verdict', /1 h 46 min ahead/.test(await p.locator('#verdict').innerText()));
  t(w + ' no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  t(w + ' no errors at end', errs.length === 0);
  if (errs.length) console.log(errs);
  await p.evaluate(i => window.__UN.show(i, true), iB); await p.waitForTimeout(500);
  await p.screenshot({ path: join(here, `shot-${w}.png`), fullPage: true }); await p.close();
}
await b.close(); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
