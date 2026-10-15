// node verify_browser.mjs — THE KEEPER'S WORD in a real browser at 390 px (light) and 1100 px (dark)
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const S = JSON.parse(fs.readFileSync(join(here, 'summary.json')));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required'] });
let pass = 0, fail = 0; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };
for (const [w, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', x => x.type() === 'error' && errs.push(x.text()));
  await p.goto('file://' + join(here, 'index.html')); await p.waitForTimeout(1200);
  t(w + ' no errors on load', errs.length === 0);
  t(w + ' ready', await p.evaluate(() => window.__KW.state.ready));
  t(w + ' no horizontal overflow', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  const c = await p.evaluate(() => window.__KW.state.counts);
  t(`${w} end: written ${c.written}`, c.written === S.counts.warnings);
  t(`${w} end: nothing after ${c.gone}`, c.gone === S.fates.silence);
  t(`${w} end: no reason ${c.mute}`, c.mute === S.fates['end-mute']);
  t(`${w} end: with reason ${c.reason}`, c.reason === S.fates['end-safe'] + S.fates['end-clear']);
  t(`${w} end: in error ${c.error}`, c.error === S.sent_in_error);
  t(`${w} end: none waiting`, c.open === 0);
  const dr = await p.locator('.drawer .n').allInnerTexts();
  t(`${w} drawers: heeded, ignored, never needed are 0`, dr[0] === '0' && dr[1] === '0' && dr[2] === '0');
  t(`${w} drawer: sent in error ${dr[3]}`, dr[3] === String(S.sent_in_error));
  await p.click('#hawaii');
  const card = await p.locator('#card').innerText();
  t(`${w} Hawaii card holds the warning`, card.includes('BALLISTIC MISSILE THREAT INBOUND TO HAWAII'));
  t(`${w} Hawaii card: cancel with no words, 38 minutes`, /carries no words/.test(card) && /38 minutes/.test(card));
  await p.locator('.drawer').nth(0).click();
  t(`${w} heeded drawer is empty`, /drawer is empty/.test(await p.locator('#drawerout').innerText()));
  await p.locator('.drawer').nth(3).click();
  t(`${w} error drawer draws an error card`, /error/i.test(await p.locator('#card').innerText()));
  // a dot click opens a card
  const box = await p.locator('#cv').boundingBox();
  const pt = await p.evaluate(() => { const st = window.__KW.state; return null });
  await p.evaluate(() => window.__KW.setT(window.__KW.T1));
  await p.mouse.click(box.x + box.width * 0.8, box.y + 55);
  t(`${w} a dot click opens a card`, /What the keeper wrote after/.test(await p.locator('#card').innerText()));
  // play runs and moves time
  await p.evaluate(() => window.__KW.setT(window.__KW.T0));
  await p.click('#play'); await p.waitForTimeout(1500); await p.click('#play');
  const tt = await p.evaluate(() => window.__KW.state.t - window.__KW.T0);
  t(`${w} play advances time (${Math.round(tt / 1440)} days)`, tt > 1440 * 30);
  t(`${w} no errors after play`, errs.length === 0);
  const table = await p.locator('#kinds tr').count();
  t(`${w} kinds table rows ${table - 1}`, table - 1 === Object.keys(S.by_code).length);
  await p.evaluate(() => window.__KW.setT(window.__KW.T1));
  await p.screenshot({ path: join(here, `shot-${w}.png`), fullPage: false });
  await p.close();
}
await b.close(); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
