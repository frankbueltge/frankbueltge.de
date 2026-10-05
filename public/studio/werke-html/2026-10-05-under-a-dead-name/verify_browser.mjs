// node verify_browser.mjs — drives the page in a real browser at 390 and 1100 px: stamps all 22 by hand,
// reads the ledger back, checks that photographs load, a live draw arrives, and nothing overflows sideways.
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
  await page.waitForFunction(() => window.__underADeadName);
  await page.waitForTimeout(2500);
  ok(`${w}: first photograph loaded`, await page.evaluate(() => { const i = document.querySelector('#frame img'); return i && i.complete && i.naturalWidth > 0; }));
  ok(`${w}: stamps enabled, ledger hidden`, await page.evaluate(() => !document.querySelector('#stamps button').disabled && !document.getElementById('ledger').classList.contains('on')));
  // stamp: agree with the Studio on all but the first, which we contradict
  const info = await page.evaluate(() => window.__underADeadName.rows.map(r => r.reading));
  let expectAgree = 0;
  for (let i = 0; i < 22; i++) {
    const want = i === 0 ? (info[0] === 'alive' ? 'none' : 'alive') : info[i];
    if (want === info[i]) expectAgree++;
    await page.click(`#stamps button[data-s="${want}"]`);
    if (i === 0) ok(`${w}: reveal appears after a stamp`, await page.evaluate(() => document.getElementById('reveal').classList.contains('on') && /Studio/.test(document.getElementById('reveal').textContent)));
    if (i < 21) await page.click('#next');
  }
  ok(`${w}: ledger shown after 22`, await page.evaluate(() => document.getElementById('ledger').classList.contains('on')));
  const big = await page.evaluate(() => document.getElementById('big').textContent);
  ok(`${w}: agreement ${expectAgree} of 22 in ledger`, big.includes(`${expectAgree} of 22`), big);
  ok(`${w}: bone note names the bone`, await page.evaluate(() => /one bone/.test(document.getElementById('boneNote').textContent)));
  ok(`${w}: table has four species`, await page.evaluate(() => document.querySelectorAll('#tbl tbody tr').length === 4));
  ok(`${w}: routes text for four`, await page.evaluate(() => document.querySelectorAll('#routes p').length === 4));
  ok(`${w}: no sideways scroll`, await page.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), await page.evaluate(() => document.documentElement.scrollWidth));
  // live draw (network)
  await page.click('#drawbtns button:nth-child(2)');
  await page.waitForTimeout(6000);
  const live = await page.evaluate(() => ({ pos: document.getElementById('pos').textContent, img: !!document.querySelector('#frame img'), sp: document.getElementById('sp').textContent }));
  ok(`${w}: live draw arrived (${live.pos}, ${live.sp})`, /Live draw 1/.test(live.pos) && live.sp === 'Chelonoidis niger', JSON.stringify(live));
  await page.click('#stamps button[data-s="alive"]');
  ok(`${w}: live stamp tallied`, await page.evaluate(() => /Live draws you have stamped: 1/.test(document.getElementById('liveTally').textContent)));
  ok(`${w}: no page errors`, errs.length === 0, errs.join('|'));
  if (w === 390) { await page.evaluate(() => window.__underADeadName.go({ kind: 'set', i: 14 })); await page.waitForTimeout(2500); await page.screenshot({ path: '/tmp/claude-0/s/shot390.png' }); }
  else { await page.evaluate(() => window.__underADeadName.go({ kind: 'set', i: 14 })); await page.waitForTimeout(2500); await page.screenshot({ path: '/tmp/claude-0/s/shot1100.png' }); await page.evaluate(() => document.getElementById('ledger').scrollIntoView()); await page.screenshot({ path: '/tmp/claude-0/s/ledger1100.png' }); }
  await page.close();
}
await browser.close();
console.log(`${ran} checks, ${failed} failed`); process.exit(failed ? 1 : 0);
