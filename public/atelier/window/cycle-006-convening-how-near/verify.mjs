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
  ok((await pg.$$('#strip button')).length === 23, `${wd}px: 23 incidents`);
  ok((await pg.innerText('#ctitle')).includes('Uber'), `${wd}px: first case is incident 8`);
  ok(await pg.isHidden('#reveal'), `${wd}px: readers hidden before a call`);
  await pg.click('#mycall button[data-v="AI tangible harm near-miss"]');
  let t = await pg.innerText('#reveal');
  ok(t.includes('reader 005: near miss') && t.includes('reader 007: unclear') && t.includes('final record: near miss'), `${wd}px: reveal of incident 8`);
  ok(t.includes('3 of 9 reports'), `${wd}px: report count shown`);
  ok((await pg.innerText('#tally')).includes('read 1 of 23') , `${wd}px: tally after one call`);
  await pg.click('#next'); ok((await pg.innerText('#cmeta')).includes('22'), `${wd}px: next goes to 22`);
  await pg.click('#mycall button[data-v="none"]'); t = await pg.innerText('#reveal');
  ok((await pg.$$('#reveal mark')).length >= 1, `${wd}px: counterfactual words marked in a note`);
  ok((await pg.innerText('#tally')).includes('second on 1 of 2'), `${wd}px: agreement with second reader counted`);
  const rows = await pg.$$eval('#dots .row', rs => rs.map(r => r.querySelectorAll('.on').length));
  ok(JSON.stringify(rows) === '[0,21,9]', `${wd}px: dots 0/21/9 (${rows})`);
  t = await pg.innerText('#pred'); ok(t.includes('undecidable') && t.split('failed').length === 2, `${wd}px: predictions table`);
  ok((await pg.innerText('#q-riggs')).includes('non-arbitrary'), `${wd}px: quotations filled`);
  ok(await pg.evaluate(() => getComputedStyle(document.body).backgroundColor) === (scheme === 'dark' ? 'rgb(22, 21, 15)' : 'rgb(251, 250, 247)'), `${wd}px: ${scheme} background`);
  ok(errs.length === 0, `${wd}px: no console errors ${errs}`);
  await pg.screenshot({ path: (process.env.SHOT || '/tmp/shot.png').replace('.png', `-${wd}.png`), fullPage: true });
}
await br.close(); process.exit(bad ? 1 : 0);
