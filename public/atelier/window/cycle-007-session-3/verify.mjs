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
  ok((await pg.$$('.card')).length === 3 && await pg.isHidden('.card .rv'), `${wd}px: three cards, answers hidden`);
  await pg.click('.card[data-i="1"] button[data-a="yes"]'); let t = await pg.innerText('.card[data-i="1"] .rv');
  ok(t.includes('You said yes') && t.includes('modal'), `${wd}px: card reveal`);
  ok((await pg.$$('#tl line[stroke-width="5"]')).length === 34, `${wd}px: 34 lines drawn`);
  t = await pg.innerText('#read'); ok(t.includes('24 years') && t.includes('8 of 34'), `${wd}px: public: median 24 years, 8 within a year`);
  await pg.$eval('#info', e => { e.value = 100; e.dispatchEvent(new Event('input')); });
  t = await pg.innerText('#read'); ok(t.includes('under a year') && t.includes('21 of 34') && t.includes('19 of 34') && t.includes('5 still') && t.includes('10 still'), `${wd}px: chronicler: 19 on the day, 5 modal, 10 narrative`);
  await pg.click('#r2'); t = await pg.innerText('#read'); ok(t.includes('7 still') && t.includes('8 still'), `${wd}px: second reading 7 modal, 8 narrative`);
  t = (await pg.innerText('#boxes')).replace(/\s+/g, ' '); ok(t.includes('Box 4 · 19') && t.includes('Box 2 · 15') && t.includes('Box 3 · 8'), `${wd}px: four boxes filled`);
  ok((await pg.$$('#tb tr')).length === 34, `${wd}px: table of 34`);
  t = await pg.innerText('#pred'); ok(t.split('held').length === 2 && t.split('failed').length === 5, `${wd}px: predictions 1 held, 4 failed`);
  ok((await pg.innerText('#out')).includes('Every one of them waited ten years'), `${wd}px: findings filled`);
  ok((await pg.innerText('#q-ic')).includes('knows all events') && (await pg.innerText('#q-dan')).includes('right stories'), `${wd}px: quotations filled`);
  ok(await pg.evaluate(() => getComputedStyle(document.body).backgroundColor) === (scheme === 'dark' ? 'rgb(22, 21, 15)' : 'rgb(251, 250, 247)'), `${wd}px: ${scheme} background`);
  ok(errs.length === 0, `${wd}px: no script errors ${errs.join(' | ')}`);
  if (process.env.SHOTS) await pg.screenshot({ path: path.join(process.env.SHOTS, `shot-${wd}.png`), fullPage: true });
  await pg.close();
}
await br.close(); console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
