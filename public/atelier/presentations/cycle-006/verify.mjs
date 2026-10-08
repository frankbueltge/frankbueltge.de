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
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: no horizontal page scroll`);
  ok((await pg.$$('#grid button')).length === 62, `${wd}px: 62 squares`);
  let t = await pg.innerText('#v1'); ok(t.includes('43 of 62') && t.includes('30 NO, 0 YES'), `${wd}px: humans world`);
  ok((await pg.$$('#grid .w-NO')).length === 43, `${wd}px: 43 NO marks`);
  await pg.click('#wMac'); t = await pg.innerText('#v1'); ok(t.includes('10 of 62') && t.includes('machine'), `${wd}px: machines world`);
  ok((await pg.$$('#grid .w-YES')).length === 10 && (await pg.$$('#grid .w-ask')).length === 33, `${wd}px: 10 YES, 33 unwritten`);
  await pg.click('#wNone'); t = await pg.innerText('#v1'); ok(t.includes('5 of 62'), `${wd}px: no-one world`);
  ok((await pg.$$('#grid .w-void')).length === 5, `${wd}px: 5 void marks`);
  await pg.click('#grid button >> nth=0'); t = await pg.innerText('#card'); ok(t.includes('Deadline') && t.includes('the market'), `${wd}px: card opens`);
  t = await pg.innerText('#v2'); ok(t.includes('5.5 %') && t.includes('Only if a machine is certain'), `${wd}px: a=1 reads price as extinction`);
  await pg.fill('#a', '10'); await pg.dispatchEvent('#a', 'input'); t = await pg.innerText('#v2'); ok(t.includes('36.7 %'), `${wd}px: a=0.1 gives 36.7 %`);
  ok((await pg.$$('#tbl tbody tr')).length === 4, `${wd}px: four stand-ins`);
  ok(await pg.evaluate(() => getComputedStyle(document.body).backgroundColor) === (scheme === 'dark' ? 'rgb(22, 21, 15)' : 'rgb(251, 250, 247)'), `${wd}px: ${scheme} background`);
  ok(errs.length === 0, `${wd}px: no console errors ${errs}`);
  await pg.screenshot({ path: (process.env.SHOT || '/tmp/shot.png').replace('.png', `-${wd}.png`), fullPage: true });
}
await br.close(); process.exit(bad ? 1 : 0);
