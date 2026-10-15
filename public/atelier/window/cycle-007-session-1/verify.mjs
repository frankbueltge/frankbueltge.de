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
  ok((await pg.$$('#pick button')).length === 14, `${wd}px: 14 events`);
  ok((await pg.innerText('#ename')).includes('Suez'), `${wd}px: first event is Suez`);
  ok(await pg.isHidden('#reveal'), `${wd}px: keepers hidden before a choice`);
  await pg.click('#pick button[data-i="2"]'); ok((await pg.innerText('#ename')).includes('Duluth'), `${wd}px: picks Duluth`);
  ok((await pg.$$('#fig .stp')).length === 5, `${wd}px: Duluth has 5 steps`);
  await pg.click('#fig .stp[data-s="3"]');
  let t = await pg.innerText('#reveal');
  ok(t.includes('Phillips 1998') && t.includes('hinge at step 4') && t.includes('hinge at step 3 and 4') && t.includes('hinge at step 3,'), `${wd}px: Duluth reveal`);
  ok(t.includes('Different hinges'), `${wd}px: Duluth marked different`);
  ok((await pg.$$('#fig path')).length === 4, `${wd}px: three keeper branches and yours`);
  ok((await pg.innerText('#tally')).includes('in 1 of 1'), `${wd}px: tally after one choice`);
  await pg.check('#lw'); ok((await pg.$$('#fig line')).length >= 6, `${wd}px: shared-history bars drawn`);
  await pg.click('#next'); ok((await pg.innerText('#ename')).includes('Malmstrom'), `${wd}px: next goes to Malmstrom`);
  await pg.click('#nowhere'); t = await pg.innerText('#reveal'); ok(t.includes('nowhere') && t.includes('no hinge'), `${wd}px: never-near choice`);
  ok((await pg.$$('#all circle.hh')).length === 26 && (await pg.$$('#all circle.nh')).length === 19, `${wd}px: overview 26 hinges, 19 without`);
  t = await pg.innerText('#pred'); ok(t.split('held').length === 4 && t.split('failed').length === 2, `${wd}px: predictions table`);
  ok((await pg.innerText('#q-brain')).includes('electrons in one brain'), `${wd}px: Bennett quotations filled`);
  ok((await pg.innerText('#obs')).includes('2,200') && (await pg.innerText('#obs')).includes('hardly'), `${wd}px: observations`);
  ok(await pg.evaluate(() => getComputedStyle(document.body).backgroundColor) === (scheme === 'dark' ? 'rgb(22, 21, 15)' : 'rgb(251, 250, 247)'), `${wd}px: ${scheme} background`);
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: still no horizontal page scroll`);
  ok(errs.length === 0, `${wd}px: no console errors ${errs}`);
  await pg.click('#pick button[data-i="2"]');
  await pg.screenshot({ path: (process.env.SHOT || '/tmp/shot.png').replace('.png', `-${wd}.png`), fullPage: true });
}
await br.close(); process.exit(bad ? 1 : 0);
