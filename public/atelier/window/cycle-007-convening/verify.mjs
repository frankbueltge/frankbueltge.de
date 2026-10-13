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
  ok((await pg.$$('.row')).length === 6, `${wd}px: six tellings`);
  ok((await pg.$$('.row circle')).length === 0, `${wd}px: endings hidden before the night`);
  await pg.click('#mute'); await pg.click('#play'); await pg.waitForFunction(() => !document.querySelector('#play').disabled, null, { timeout: 15000 });
  let t = await pg.innerText('#night'); ok(t.includes('6 of 6') && t.includes('2 write a silence') && t.includes('1 a report') && t.includes('3 name nothing'), `${wd}px: night ends with 6/6 cause, 2 silence, 1 report, 3 none`);
  ok((await pg.$$('.row circle')).length === 3, `${wd}px: three endings drawn`);
  ok((await pg.$$('.row rect[fill="var(--P)"]')).length === 2, `${wd}px: two persons`);
  await pg.click('.row[data-id="chatham"]'); t = await pg.innerText('#detail'); ok(t.includes('no other early-warning systems') && t.includes('silence'), `${wd}px: detail chatham`);
  ok((await pg.$$('#detail .seg.e')).length === 1, `${wd}px: ending segment marked`);
  await pg.click('#claims button[data-c="hum"]'); t = await pg.innerText('#verdict'); ok(t.startsWith('0 of 6') && t.includes('human safeguards'), `${wd}px: claim: people reading data, 0 of 6`);
  await pg.click('#claims button[data-c="brz"]'); t = await pg.innerText('#verdict'); ok(t.startsWith('2 of 6') && t.includes('As he recounted it to me'), `${wd}px: claim: Brzezinski 2 of 6, own account`);
  await pg.click('#claims button[data-c="odom"]'); t = await pg.innerText('#verdict'); ok(t.startsWith('3 of 6'), `${wd}px: claim: Odom carries 3 of 6`);
  await pg.click('#claims button[data-c="none"]'); t = await pg.innerText('#verdict'); ok(t.startsWith('3 of 6'), `${wd}px: claim: nobody 3 of 6`);
  t = await pg.innerText('#out'); ok(t.includes('agree on 25 of 25') && t.includes('Judgment (mine)'), `${wd}px: findings and judgment filled`);
  t = await pg.innerText('#prop'); ok(t.includes('Proposed question:') && t.includes('Docks onto:'), `${wd}px: proposal shown`);
  ok(await pg.evaluate(() => getComputedStyle(document.body).backgroundColor) === (scheme === 'dark' ? 'rgb(22, 21, 15)' : 'rgb(251, 250, 247)'), `${wd}px: ${scheme} background`);
  ok(errs.length === 0, `${wd}px: no script errors ${errs.join(' | ')}`);
  if (process.env.SHOTS) await pg.screenshot({ path: path.join(process.env.SHOTS, `shot-${wd}.png`), fullPage: true });
  await pg.close();
}
await br.close(); console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
