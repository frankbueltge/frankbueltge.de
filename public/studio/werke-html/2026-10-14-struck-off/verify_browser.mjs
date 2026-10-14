// node verify_browser.mjs — STRUCK OFF in a real browser at 390 px (light) and 1100 px (dark)
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const D = JSON.parse(fs.readFileSync(join(here, 'data.json'))), S = D.summary;
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
let pass = 0, fail = 0; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };
for (const [w, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + join(here, 'index.html')); await p.waitForTimeout(600);
  t(w + ' no errors on load', errs.length === 0);
  t(w + ' ready', await p.evaluate(() => window.__SO.state.ready));
  const st = await p.evaluate(() => { const s = window.__SO.state; return { nS: s.nS, nK: s.nK, nLost: s.nLost, nL: s.nL }; });
  t(`${w} today: struck ${st.nS}, standing ${st.nK}, unseen>1y ${st.nLost}`, st.nS === S.struck && st.nK === S.standing && st.nLost === S.unseen_gt_365 && st.nL === S.total);
  t(w + ' counter shows the totals', (await p.locator('#count').innerText()).includes('3,581') && (await p.locator('#count').innerText()).includes('2,223'));
  // the past: on 2010-01-01 nothing struck after it is struck
  await p.evaluate(() => window.__SO.setT('2010-01-01'));
  const s10 = await p.evaluate(() => window.__SO.state.nS), want10 = D.rows.filter(r => r.struck && r.struck.slice(0, 10) <= '2010-01-01').length;
  t(`${w} 2010-01-01 struck ${s10} = ${want10}`, s10 === want10);
  // cards
  const iA = D.rows.findIndex(r => r.des === '99942'), iAA = D.rows.findIndex(r => r.des === '2014 AA'), iK = D.rows.findIndex(r => r.des === '29075');
  await p.evaluate(() => window.__SO.setT('2026-12-31'));
  await p.evaluate(i => window.__SO.card(i), iA); t(w + ' Apophis card: struck minute and the notes', /2021-02-21 08:22/.test(await p.locator('#card').innerText()) && /2021-Mar-26/.test(await p.locator('#card').innerText()));
  await p.evaluate(i => window.__SO.card(i), iAA); t(w + ' 2014 AA card: struck after it arrived', /about 22 hours before it was struck off/.test(await p.locator('#card').innerText()));
  await p.evaluate(i => window.__SO.card(i), iK); t(w + ' 1950 DA card: standing', /Standing/.test(await p.locator('#card').innerText()));
  // tap a real cell
  const box = await p.locator('#ledger').boundingBox(); await p.mouse.click(box.x + 3, box.y + 3);
  t(w + ' tapping the first cell writes a card', /first seen/.test(await p.locator('#card').innerText()));
  // highlights
  await p.evaluate(() => window.__SO.hl('why')); t(w + ' highlight: reasons', await p.evaluate(() => window.__SO.state.hl === 'why'));
  await p.evaluate(() => window.__SO.hl('lost')); await p.evaluate(() => window.__SO.hl('none'));
  // the thirteen
  t(w + ' thirteen, one on the list', (await p.locator('#came span').count()) === 13 && (await p.locator('#came span.on').count()) === 1);
  // figures
  const h = await p.evaluate(() => window.__SO.hist);
  t(w + ' histogram sums to both lists', h.up.reduce((a, b) => a + b) === S.struck && h.dn.reduce((a, b) => a + b) === S.standing);
  t(w + ` years figure: ${Object.keys(S.struck_by_year).length} bars`, (await p.locator('#years rect').count()) === Object.keys(S.struck_by_year).length);
  t(w + ' reasons line says 3 times', /3 times/.test(await p.locator('#yearsline').innerText()));
  // play runs and advances
  await p.locator('#play').click(); await p.waitForTimeout(1500);
  const T = await p.evaluate(() => window.__SO.state.T);
  t(w + ' play advances from 2002', T > Date.parse('2002-01-10') / 864e5 && T < Date.parse('2003-06-01') / 864e5);
  await p.locator('#play').click(); await p.locator('#end').click();
  t(w + ' no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  t(w + ' no errors at end', errs.length === 0); if (errs.length) console.log(errs);
  await p.screenshot({ path: join(here, `shot-${w}.png`), fullPage: true }); await p.close();
}
await b.close(); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
