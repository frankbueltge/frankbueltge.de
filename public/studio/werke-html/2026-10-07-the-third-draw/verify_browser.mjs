// node verify_browser.mjs — loads the page at 390 and 1100 px (photographs are not fetched), uses every control, checks the page's figures against results.json
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const R = JSON.parse(fs.readFileSync(join(here, 'results.json')));
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
let pass = 0, fail = 0; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };
for (const w of [390, 1100]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 } }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && !/Failed to load resource/.test(m.text()) && errs.push(m.text()));
  await p.route(/^https?:/, r => r.abort());
  await p.goto('file://' + join(here, 'index.html'));
  t(w + ' no errors on load', errs.length === 0);
  t(w + ' rows: 135, 135, 90, 90', [await p.locator('#rOpen i').count(), await p.locator('#rA i').count(), await p.locator('#rB i').count(), await p.locator('#rC i').count()].join() === '135,135,90,90');
  t(w + ' open shelf: 4 odd squares', await p.locator('#rOpen i.none, #rOpen i.remains').count() === 4);
  t(w + ' locked: 3 odd + 1 unclear in draw 2, none elsewhere', await p.locator('#rB i.none, #rB i.remains').count() === 3 && await p.locator('#rB i.unclear').count() === 1 && await p.locator('#rA i.none,#rC i.none,#rA i.remains,#rC i.remains').count() === 0);
  t(w + ' stamps disabled before a draw', await p.locator('#sA').isDisabled());
  await p.click('#next'); t(w + ' draw shows a frame', await p.locator('#frame img').count() === 1 && !(await p.locator('#sA').isDisabled()));
  await p.click('#sA'); t(w + ' stamp reveals the reading', !(await p.locator('#reveal').isHidden()) && (await p.locator('#tally').innerText()).includes('1'));
  for (let i = 0; i < 6; i++) { await p.click('#next'); await p.click(i % 2 ? '#sN' : '#sA'); }
  t(w + ' tally counts 7', (await p.locator('#tally').innerText()).includes('7'));
  await p.click('#fourbtn'); t(w + ' four odd figures shown', await p.locator('#four figure').count() === 4 && !(await p.locator('#fourbox').isHidden()));
  await p.click('#rB i.none >> nth=0'); t(w + ' locked odd square gives words, no image', (await p.locator('#probe').innerText()).includes('never shown') && await p.locator('#probe img').count() === 0);
  await p.click('#rOpen i >> nth=3'); t(w + ' open square shows image', await p.locator('#probe img').count() === 1);
  t(w + ' verdict at 0 reads: one population 4.0x', (await p.locator('#verd').innerText()).includes('3 of 315') && (await p.locator('#verd').innerText()).includes('4.0'));
  await p.fill('#x', '600'); await p.dispatchEvent('#x', 'input'); const v600 = await p.locator('#verd').innerText();
  t(w + ' verdict at 600 clean: separate ' + R.zero_odd_extra['600'].toFixed(1) + 'x', v600.includes('separate lots') && v600.includes(R.zero_odd_extra['600'].toFixed(1)));
  await p.fill('#x', '300'); await p.dispatchEvent('#x', 'input'); t(w + ' 300: ratio ' + R.zero_odd_extra['300'].toFixed(1), (await p.locator('#verd').innerText()).includes(R.zero_odd_extra['300'].toFixed(1)));
  await p.click('#uN'); await p.fill('#x', '0'); await p.dispatchEvent('#x', 'input'); t(w + ' unclear called odd: 4 of 315, 6.1x', (await p.locator('#verd').innerText()).includes('4 of 315') && (await p.locator('#verd').innerText()).includes(String((1 / R.ratio.pooled_315_unclear_odd).toFixed(1))));
  t(w + ' interval table has 4 rows', await p.locator('#jtab tr').count() === 5);
  t(w + ' lot table shows 3 of 315', (await p.locator('#tab').innerText()).includes('3 of 315'));
  t(w + ' no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1));
  t(w + ' no errors after use', errs.length === 0);
  await p.screenshot({ path: join(here, `shot-${w}.png`), fullPage: false }); await p.close();
}
await b.close(); console.log(pass, 'passed,', fail, 'failed'); process.exit(fail ? 1 : 0);
