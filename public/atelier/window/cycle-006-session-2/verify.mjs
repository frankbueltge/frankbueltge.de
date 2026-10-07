// Drive index.html in a real browser at two widths. Node + playwright.
import { createRequire } from 'module'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); let bad = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const br = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
for (const wd of [390, 1100]) {
  const pg = await br.newPage({ viewport: { width: wd, height: 900 } }); const errs = [];
  pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await pg.goto('file://' + path.join(here, 'index.html'));
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: no horizontal scroll`);
  ok((await pg.$$('#wall i')).length === 701, `${wd}px: 701 dots`);
  let t = await pg.innerText('#wallnote'); ok(t.includes('697 names'), `${wd}px: today shows 697`);
  await pg.click('#steps button:nth-child(1)'); t = await pg.innerText('#wallnote');
  ok(t.includes('185 names in 186 entries') && t.includes('three days older'), `${wd}px: first copy 186, before the public date`);
  ok((await pg.$$('#wall i.g')).length === 0, `${wd}px: nothing gone in the first copy`);
  await pg.click('#steps button:nth-child(4)'); ok((await pg.$$('#wall i.g')).length === 4, `${wd}px: 4 hollow dots today`);
  t = await pg.innerText('#verdict'); ok(t.includes('at least 8.5 %') && t.includes('100 %'), `${wd}px: frame bound 8.5-100 %`);
  await pg.fill('#guess', '0'); await pg.selectOption('#mean', '3'); t = await pg.innerText('#verdict');
  ok(t.includes('at least 8.5 %') && t.includes('did not move') && t.includes('disagree'), `${wd}px: bound unmoved by the reader's choice`);
  t = await pg.innerText('#verdict2'); ok(t.includes('above') && t.includes('8'), `${wd}px: default second look shows above with ~8`);
  await pg.fill('#r2', '90'); await pg.fill('#p', '0'); t = await pg.innerText('#verdict2'); ok(t.includes('No sample size settles it'), `${wd}px: 90 % response cannot show below`);
  await pg.fill('#r2', '100'); t = await pg.innerText('#verdict2'); ok(t.includes('below'), `${wd}px: full response can show below`);
  ok((await pg.innerText('#preds')).includes('P2 failed'), `${wd}px: failed prediction shown as failed`);
  ok(errs.length === 0, `${wd}px: no console errors ${errs}`);
  if (wd === 1100) await pg.screenshot({ path: process.env.SHOT || '/tmp/shot.png', fullPage: true });
  if (wd === 390) await pg.screenshot({ path: (process.env.SHOT || '/tmp/shot.png').replace('.png', '-390.png'), fullPage: true });
}
await br.close(); process.exit(bad ? 1 : 0);
