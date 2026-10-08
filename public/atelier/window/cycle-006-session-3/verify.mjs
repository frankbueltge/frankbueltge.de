// Drive index.html in a real browser at two widths. Node + playwright.
import { createRequire } from 'module'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); let bad = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const br = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
for (const [wd, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const pg = await br.newPage({ viewport: { width: wd, height: 900 }, colorScheme: scheme }); const errs = [];
  pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await pg.goto('file://' + path.join(here, 'index.html'));
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: no horizontal scroll`);
  let t = await pg.innerText('#v1'); ok(t.includes('under-read') && t.includes('shadow'), `${wd}px: fixed reading shows the shadow`);
  const m = t.match(/×([0-9]+\.[0-9]+)/); ok(m && +m[1] > 1.6 && +m[1] < 2.3, `${wd}px: under-read factor near 1.9 (${m && m[1]})`);
  await pg.click('#mDraw'); t = await pg.innerText('#v1'); ok(t.includes('no shadow'), `${wd}px: uncertain reading dispels it`);
  const g = +(t.match(/largest gap ([0-9.]+)/) || [0, 9])[1]; ok(g < 0.02, `${wd}px: survivors on the naive line (gap ${g})`);
  await pg.click('#mFixed'); await pg.fill('#b', '0'); await pg.dispatchEvent('#b', 'input'); t = await pg.innerText('#v1');
  ok(t.includes('20,000 of 20,000'), `${wd}px: beta 0 leaves every world`);
  ok((await pg.$$('#strip i')).length === 40, `${wd}px: a record of 40 slots`);
  for (let i = 0; i < 20; i++) await pg.click('#gSafe');
  t = await pg.innerText('#v2'); ok(t.includes('60.6 %') && t.includes('never once'), `${wd}px: game ends with the best possible 60.6 %`);
  ok(await pg.isDisabled('#gDrift'), `${wd}px: game closed after 20 rounds`);
  await pg.click('[data-k="0"]'); t = await pg.innerText('#v3'); ok(t.includes('0.950') && t.includes('no information'), `${wd}px: k=0 bound 0.950`);
  await pg.click('[data-k="14"]'); t = await pg.innerText('#v3'); ok(t.includes('0.181'), `${wd}px: k=14 bound 0.181`);
  t = await pg.innerText('#preds'); ok(t.includes('P3 failed') && t.includes('P1 held'), `${wd}px: predictions scored, P3 failed`);
  ok(errs.length === 0, `${wd}px: no console errors ${errs}`);
  await pg.screenshot({ path: (process.env.SHOT || '/tmp/shot.png').replace('.png', `-${wd}.png`), fullPage: true });
}
await br.close(); process.exit(bad ? 1 : 0);
