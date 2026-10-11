// node verify_browser.mjs — loads the page at 390 px (light) and 1100 px (dark), runs the clock, checks the counts against data.json
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const D = JSON.parse(fs.readFileSync(join(here, 'data.json'))); const S = D.summary; const OK = D.events.filter(e => e.ok);
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
let pass = 0, fail = 0; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };
const num = async (p, id) => +(await p.locator(id).innerText()).replace(/[^\d]/g, '');
for (const [w, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + join(here, 'index.html')); await p.waitForTimeout(300);
  t(w + ' no errors', errs.length === 0);
  t(w + ' no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  t(w + ' at 1945 nothing has happened', await num(p, '#c-hap') === 0);
  for (const y of [1962.9, 1983.9, 1991.0, 2000]) {
    await p.evaluate(y => window.__LA.setT(y), y);
    const hap = OK.filter(e => e.y_hap <= y), nm = hap.filter(e => e.y_nm <= y), occ = hap.filter(e => e.y_occ <= y);
    t(`${w} at ${y}: happened ${hap.length}, reported ${occ.length}, known ${nm.length}, pending ${hap.length - nm.length}`,
      await num(p, '#c-hap') === hap.length && await num(p, '#c-nm') === nm.length && await num(p, '#c-occ') === occ.length && await num(p, '#c-pend') === hap.length - nm.length);
  }
  await p.fill('#t', '2026.8'); await p.dispatchEvent('#t', 'input');
  t(w + ' today: all checked close calls known, none pending', await num(p, '#c-nm') === OK.length && await num(p, '#c-pend') === 0);
  t(w + ' table holds all events', await p.locator('#tab tbody tr').count() === S.events);
  t(w + ' grey rows = unchecked', await p.locator('#tab tbody tr.unv').count() === S.unchecked);
  await p.click('#tab th[data-k="lag"]'); const first = await p.locator('#tab tbody tr').first().innerText();
  const longest = OK.slice().sort((a, b) => b.lag_days - a.lag_days)[0];
  t(w + ' sort by wait: longest first (' + longest.label + ')', first.includes(longest.label));
  t(w + ' median lag shown', (await p.locator('#l-med').innerText()).includes(String(S.lag_median_years)));
  await p.click('#m-now'); t(w + ' mode now', (await p.locator('#year').innerText()) === 'now');
  await p.click('#m-then'); await p.click('#sound'); await p.click('#play'); await p.waitForTimeout(600); await p.click('#play');
  await p.hover('#clocks', { position: { x: w * 0.8, y: 80 } }); await p.waitForTimeout(100);
  t(w + ' tooltip on the two clocks', await p.locator('#tip').isVisible());
  t(w + ' no errors after play', errs.length === 0);
  await p.evaluate(() => window.__LA.setT(2000));
  await p.screenshot({ path: join(here, `shot-${w}.png`), fullPage: false });
  await p.locator('#cwrap').screenshot({ path: join(here, `shot-clocks-${w}.png`) });
  await p.close();
}
await b.close(); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
