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
  const read = () => pg.innerText('#read');
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: no horizontal page scroll`);
  ok(await pg.innerText('#c1') === '227' && await pg.innerText('#c3') === '87', `${wd}px: the Field's 2x2 (227, 87)`);
  ok((await read()).includes('−153') && (await read()).includes('323'), `${wd}px: rating-only stand-in reads -153, 323 without stand-in`);
  ok((await pg.$$('#line circle.bs')).length === 100, `${wd}px: 100 bootstrap quantiles drawn`);
  ok((await pg.$$('#forest circle')).length === 16 && (await pg.$$('#forest circle.cur')).length === 1, `${wd}px: 16 stand-ins, one current`);
  ok((await pg.$$('#tbl tr.orphan')).length === 1, `${wd}px: one stratum (EF5) without stand-in`);
  await pg.click('#covs button[data-c=size]'); await pg.click('#covs button[data-c=era]');
  ok((await read()).includes('−44') && (await read()).includes('298'), `${wd}px: rating+size+era reads -44, up to 298`);
  await pg.click('#mono'); ok((await read()).includes('between 0 and 298'), `${wd}px: monotone leaves 0 to 298`);
  ok(await pg.$eval('#pt', e => e.getAttribute('fill')) === 'none', `${wd}px: point reading hollow when ruled out`);
  await pg.click('#outc button[data-o=inj]'); ok((await read()).includes('injuries'), `${wd}px: injuries switch`);
  const o = await pg.innerText('#out'); ok(o.includes('16 stand-ins') && o.includes('−199') && o.includes('8 EF5') && o.includes('28%'), `${wd}px: findings filled`);
  ok((await pg.innerText('main')).includes('Judgment (mine)'), `${wd}px: judgment marked`);
  ok(await pg.evaluate(() => getComputedStyle(document.body).backgroundColor) === (scheme === 'dark' ? 'rgb(22, 21, 15)' : 'rgb(251, 250, 247)'), `${wd}px: ${scheme} background`);
  ok(errs.length === 0, `${wd}px: no script errors ${errs.join(' | ')}`);
  if (process.env.SHOTS) await pg.screenshot({ path: path.join(process.env.SHOTS, `shot-${wd}.png`), fullPage: true });
  await pg.close();
}
await br.close(); console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
