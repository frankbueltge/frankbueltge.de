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
  const fr = () => pg.innerText('#fanread');
  ok((await fr()).startsWith('Report of 2008 Q3.'), `${wd}px: opens on the report of 2008 Q3`);
  await pg.$eval('#rep', e => { e.value = 20; e.dispatchEvent(new Event('input')); });
  ok((await fr()).includes('Report of 2009 Q1') && (await fr()).includes('mode was 0.50 %') && (await fr()).includes('4.1 %') && (await fr()).includes('above the 90 % fan'), `${wd}px: Feb 2009 report: mode 0.50, outturn 4.1, above the fan`);
  const b = await fr(); await pg.click('#c-sym'); const s = await fr();
  ok(b.includes('mode was 0.50 %') && s.includes('mode was 0.50 %'), `${wd}px: convention switch keeps the mode`);
  await pg.click('#c-bfw');
  const sr = await pg.innerText('#stripread');
  ok(sr.includes('31 of 40') && sr.includes('14 of 40') && sr.includes('0.39') && sr.includes('1.22') && sr.includes('0.97'), `${wd}px: strip read 31/40, 14/40, 0.39, 0.97, 1.22`);
  ok((await pg.innerText('#bp')) === '0.0900' && (await pg.innerText('#bw')) === '0.1800', `${wd}px: default p=40 e=75: Brier 0.0900 vs 0.1800`);
  ok((await pg.$$eval('#grid i.r', x => x.length)) === 10 && (await pg.$$eval('#grid i.a', x => x.length)) === 30, `${wd}px: 10 red, 30 amber occasions`);
  ok((await pg.innerText('#scoreread')).includes('0.0900') && (await pg.innerText('#scoreread')).includes('0.30²'), `${wd}px: fine (p e)^2 = 0.30^2 = 0.0900`);
  await pg.$eval('#e', e => { e.value = 0; e.dispatchEvent(new Event('input')); });
  ok((await pg.innerText('#scoreread')).includes('same number'), `${wd}px: e = 0 makes the two keepers one`);
  const o = await pg.innerText('#out');
  ok(o.includes('100 to 114') && o.includes('5 to 6') && o.includes('on 12') && o.includes('29 of 40') && o.includes('4.4 to 5.6') && o.includes('43.0 % to 46.4 %') && !o.includes('NaN'), `${wd}px: findings filled (100-114, 5-6, 12, 29, 4.4-5.6, 43.0-46.4 %)`);
  ok((await pg.innerText('main')).includes('Judgment (mine)'), `${wd}px: judgment marked`);
  ok((await pg.innerText('main')).includes('100 occasions'), `${wd}px: the keeper's hundred occasions quoted`);
  ok(await pg.evaluate(() => getComputedStyle(document.body).backgroundColor) === (scheme === 'dark' ? 'rgb(22, 21, 15)' : 'rgb(251, 250, 247)'), `${wd}px: ${scheme} background`);
  ok(errs.length === 0, `${wd}px: no script errors ${errs.join(' | ')}`);
  if (process.env.SHOTS) await pg.screenshot({ path: path.join(process.env.SHOTS, `shot-${wd}.png`), fullPage: true });
  await pg.close();
}
await br.close(); console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
