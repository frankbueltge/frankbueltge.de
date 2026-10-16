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
  const fr = () => pg.innerText('#fanread'); const set = async v => pg.$eval('#rep', (e, v) => { e.value = v; e.dispatchEvent(new Event('input')); }, v);
  ok((await fr()).startsWith('Report of 2008 Q2.'), `${wd}px: opens on the report of 2008 Q2`);
  await set(22); const f = await fr();
  ok(f.includes('Report of 2009 Q3') && f.includes('2.17 %') && f.includes('1.42 %') && f.includes('+0.75') && f.includes('4.7 %') && f.includes('came true'), `${wd}px: Aug 2009: held 2.17, market 1.42, gap +0.75, outturn 4.7, held`);
  await set(0); const g = await fr();
  ok(g.includes('2.03 %') && g.includes('1.87 %') && g.includes('4 % to 4.75 %') && g.includes('cannot be scored'), `${wd}px: Feb 2004: 2.03 vs 1.87, rate 4 to 4.75, not scorable`);
  const o = await pg.innerText('#out');
  ok(o.includes('+0.11') && o.includes('-0.47') && o.includes('+0.75') && o.includes('in 20 of 38') && o.includes('0.17 of the fan') && o.includes('at most 0.63') && o.includes('in only 2'), `${wd}px: gap findings 0.11, -0.47..0.75, 20/38, 0.17, 0.63, 2`);
  ok(o.includes('0.5 % for the whole two years after 17') && o.includes('in 15 of 17') && o.includes('1.19') && o.includes('1.46'), `${wd}px: held 17, nearer 15, 1.19 vs 1.46`);
  ok(o.includes('-0.01 points') && o.includes('13 of 21') && o.includes('(mean 0.26)') && o.includes('All 486 rows') && o.includes('125 of 342'), `${wd}px: moved -0.01, 13/21; 486 settled, 125/342`);
  ok(!o.includes('NaN') && !o.includes('undefined'), `${wd}px: no NaN or undefined`);
  ok((await pg.innerText('main')).includes('53.7 % before, 53.8 % after, difference +0.1 points (-6.4 to +6.5)'), `${wd}px: the Field's tornado window quoted as published`);
  ok((await pg.innerText('#gapread')).startsWith('38 reports. Mean gap +0.11'), `${wd}px: gap read, all`);
  await pg.click('#g-held'); ok((await pg.innerText('#gapread')).startsWith('17 reports. Mean gap +0.26') && (await pg.innerText('#gapread')).includes('only reports'), `${wd}px: gap read, held`);
  await pg.click('#g-moved'); ok((await pg.innerText('#gapread')).startsWith('21 reports. Mean gap -0.01') && (await pg.innerText('#gapread')).includes('in 13.'), `${wd}px: gap read, moved`);
  ok((await pg.innerText('main')).includes('Judgment (mine)'), `${wd}px: judgment marked`);
  ok(await pg.evaluate(() => getComputedStyle(document.body).backgroundColor) === (scheme === 'dark' ? 'rgb(22, 21, 15)' : 'rgb(251, 250, 247)'), `${wd}px: ${scheme} background`);
  ok(await pg.evaluate(() => { const c = document.getElementById('fan'), x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) n += d[i] > 0; return n > 5000; }), `${wd}px: fan canvas drawn`);
  if (process.env.SHOTS) await pg.screenshot({ path: path.join(process.env.SHOTS, `shot-${wd}.png`), fullPage: true });
  ok(errs.length === 0, `${wd}px: no page errors ${errs.join(' | ')}`);
}
await br.close(); console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
