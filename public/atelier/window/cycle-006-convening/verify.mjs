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
  ok((await pg.$$('#tbl tbody tr')).length === 16, `${wd}px: 16 rows`);
  let t = await pg.innerText('#v1'); ok(t.includes('A + B: 0 of 14 incidents and 2 of 2 regimes'), `${wd}px: default A+B`);
  await pg.click('#pC'); await pg.click('#pD'); t = await pg.innerText('#v1'); ok(t.includes('0 of 14 incidents and 1 of 2'), `${wd}px: all four, one regime`);
  ok((await pg.$$('#tbl tr.pass')).length === 1, `${wd}px: one row lit`);
  await pg.click('#pA'); await pg.click('#pD'); t = await pg.innerText('#v1'); ok(t.includes('B + C: 6 of 14 incidents and 2 of 2') && t.includes('Add A'), `${wd}px: B+C, six incidents`);
  ok(await pg.isDisabled('#pE'), `${wd}px: E cannot be switched on`);
  await pg.click('#tbl tbody tr >> nth=15'); t = await pg.innerText('#card'); ok(t.includes('enforcement action') && t.includes('D met'), `${wd}px: aviation card with quotation`);
  await pg.click('#tbl tbody tr >> nth=14'); t = await pg.innerText('#card'); ok(t.includes('D not met') && t.includes('investigations'), `${wd}px: AI Act card`);
  ok((await pg.innerText('#pq')).length > 100 && (await pg.innerText('#pd')).length > 100, `${wd}px: proposal shown`);
  ok((await pg.$$('#where div')).length === 4, `${wd}px: four prong panels`);
  ok(await pg.evaluate(() => getComputedStyle(document.body).backgroundColor) === (scheme === 'dark' ? 'rgb(22, 21, 15)' : 'rgb(251, 250, 247)'), `${wd}px: ${scheme} background`);
  ok(errs.length === 0, `${wd}px: no console errors ${errs}`);
  await pg.screenshot({ path: (process.env.SHOT || '/tmp/shot.png').replace('.png', `-${wd}.png`), fullPage: true });
}
await br.close(); process.exit(bad ? 1 : 0);
