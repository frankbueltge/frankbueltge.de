// node verify_browser.mjs — loads the page at 390 and 1100 px, uses every control, checks the figures against results-corrected.json (corrected 2026-10-08; the 2026-10-07 version checked the superseded results.json)
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const RC = JSON.parse(fs.readFileSync(join(here, 'results-corrected.json')));
const pc = v => (100 * v).toFixed(v < .1 ? 1 : 0) + ' %';
const row = (n, s) => RC.rows.find(r => r.n === n && r.share === s);
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
let pass = 0, fail = 0; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };
for (const w of [390, 1100]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + join(here, 'index.html'));
  t(w + ' no errors', errs.length === 0);
  t(w + ' wall drew 18,459 cells', await p.evaluate(() => document.getElementById('wall').dataset.drawn) === '18459' && await p.evaluate(() => window.__ans.size) === 2778);
  t(w + ' no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const a = row(1321, .412), lo = pc(a.floor), hi = pc(a.ceiling);
  t(w + ' corrected lower bound ' + lo, (await p.locator('#lo').innerText()) === lo);
  t(w + ' corrected upper bound ' + hi, (await p.locator('#hi').innerText()) === hi);
  t(w + ' correction notice shown', (await p.locator('#corr').innerText()).includes('6.2–7.7 %'));
  await p.fill('#q', '0'); await p.dispatchEvent('#q', 'input'); t(w + ' q=0 point = lower', (await p.locator('#pt').innerText()) === lo);
  await p.fill('#q', '100'); await p.dispatchEvent('#q', 'input'); t(w + ' q=100 point = upper', (await p.locator('#pt').innerText()) === hi);
  await p.click('#w2'); t(w + ' share 51.4 lower', (await p.locator('#lo').innerText()) === pc(row(1321, .514).floor));
  await p.click('#n3'); t(w + ' wording 655 lower 1.8 %', (await p.locator('#lo').innerText()) === pc(row(655, .514).floor));
  await p.click('#w1'); t(w + ' floor of range 1.5 %', (await p.locator('#lo').innerText()) === '1.5 %');
  await p.click('.g[data-v="3"]'); t(w + ' group 3 %: 7.9x', (await p.locator('#gm').innerText()).includes('7.9'));
  t(w + ' table rows', await p.locator('#tb tr').count() === 8);
  await p.screenshot({ path: join(here, 'shot-' + w + '.png'), fullPage: true });
}
await b.close(); console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
