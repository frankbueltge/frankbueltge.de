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
  ok((await pg.innerText('#d1')).startsWith('30,495'), `${wd}px: the Field's 30,495 never needed`);
  ok((await read()).includes('30,495') && (await read()).includes('fell by 4.8'), `${wd}px: tornado rule reads 30,495, fell by 4.8`);
  ok((await pg.$$('#years polyline')).length === 5, `${wd}px: five rule lines`);
  await pg.click('#ladder button:nth-child(3)');
  ok((await read()).includes('fell by 3.3'), `${wd}px: + funnel reads fell by 3.3`);
  await pg.click('#ladder button:nth-child(4)');
  ok((await read()).includes('rose by 3.0') && (await read()).includes('worse'), `${wd}px: + severe storm reads rose by 3.0`);
  await pg.click('#h1in'); ok((await read()).includes('rose by 1.3'), `${wd}px: 1-inch hail throughout reads rose by 1.3`);
  await pg.click('#h1in'); await pg.click('#ladder button:nth-child(1)');
  ok((await read()).includes('fell by 4.8'), `${wd}px: back to the tornado rule`);
  const counts = await pg.evaluate(() => { const c = document.getElementById('field'); return [c.width, c.height]; });
  ok(counts[0] > 0 && counts[1] > 300, `${wd}px: field drawn (${counts})`);
  await pg.$eval('#field', e => e.scrollIntoView());
  const box = await pg.$eval('#field', e => { const r = e.getBoundingClientRect(); return [r.left, r.top]; });
  await pg.mouse.click(box[0] + 40, box[1] + 3); ok((await pg.innerText('#pick')).includes('issued 2008-'), `${wd}px: tapping a cell reads a 2008 warning`);
  ok((await pg.$$('#cards .card')).length === 3, `${wd}px: three funnel narratives`);
  const c1 = await pg.innerText('#cards'); await pg.click('#more'); ok(c1 !== await pg.innerText('#cards'), `${wd}px: three more`);
  const o = await pg.innerText('#out'); ok(o.includes('1,354') && o.includes('18,738') && o.includes('+3.0 points'), `${wd}px: findings filled`);
  ok((await pg.$$('#preds tr')).length === 6 && (await pg.innerText('#preds')).includes('did not fire'), `${wd}px: predictions table`);
  ok((await pg.innerText('main')).includes('Judgment (mine)'), `${wd}px: judgment marked`);
  ok(await pg.evaluate(() => getComputedStyle(document.body).backgroundColor) === (scheme === 'dark' ? 'rgb(22, 21, 15)' : 'rgb(251, 250, 247)'), `${wd}px: ${scheme} background`);
  ok(errs.length === 0, `${wd}px: no script errors ${errs.join(' | ')}`);
  if (process.env.SHOTS) await pg.screenshot({ path: path.join(process.env.SHOTS, `shot-${wd}.png`), fullPage: true });
  await pg.close();
}
await br.close(); console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
