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
  ok((await pg.$$('#guess button')).length === 5, `${wd}px: five rows to guess`);
  ok(await pg.isHidden('#greveal'), `${wd}px: orbits hidden before a guess`);
  await pg.click('#guess button[data-i="0"]'); let t = await pg.innerText('#greveal');
  ok(t.includes('You chose 2025 UC11') && t.includes('nobody can now say'), `${wd}px: guess reveal for the nearest row`);
  ok(t.includes('Berlin') && t.includes('three passages of the five'), `${wd}px: reveal names the impactor`);
  ok((await pg.$$('#guess button.T')).length === 3 && (await pg.$$('#guess button.U')).length === 2, `${wd}px: 3 timing, 2 undecided marked`);
  ok(await pg.evaluate(() => { const c = document.querySelector('#cv'); const x = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < x.length; i += 4) if (x[i]) n++; return n > 5000; }), `${wd}px: plot drawn`);
  await pg.click('#bend'); ok((await pg.innerText('#pcount')).includes('215'), `${wd}px: bend view names 215 rows`);
  ok((await pg.$$('#queue .q')).length === 12, `${wd}px: queue of 12`);
  ok((await pg.innerText('#queue .q:first-child')).includes('2025 UC11'), `${wd}px: record's order starts with 2025 UC11`);
  ok((await pg.innerText('#qnote')).includes('place 1160 of 1174'), `${wd}px: impactors far back in the record's order`);
  await pg.click('#o-l'); t = await pg.innerText('#qnote');
  ok(t.includes('place 13') && (await pg.$$('#queue .q.T')).length === 12, `${wd}px: Lewis's order puts timing-only first, impactor at 13`);
  t = await pg.innerText('#pred'); ok(t.split('held').length === 5 && t.split('failed').length === 2, `${wd}px: predictions 4 held, 1 failed`);
  ok((await pg.innerText('#out')).includes('329 undecided'), `${wd}px: findings filled`);
  ok((await pg.innerText('#q-off')).includes('off-hand judgments') && (await pg.innerText('#q-xi')).includes('timing of the encounter'), `${wd}px: quotations filled`);
  await pg.$eval('#cv', c => c.scrollIntoView());
  const at = await pg.evaluate(() => { const r = document.querySelector('#cv').getBoundingClientRect(); const p = pts[0]; return [r.left + p[0], r.top + p[1]]; });
  await pg.mouse.move(at[0], at[1]); await pg.waitForTimeout(50);
  ok(await pg.isVisible('#tip'), `${wd}px: hover shows a passage`);
  ok(await pg.evaluate(() => getComputedStyle(document.body).backgroundColor) === (scheme === 'dark' ? 'rgb(22, 21, 15)' : 'rgb(251, 250, 247)'), `${wd}px: ${scheme} background`);
  ok(errs.length === 0, `${wd}px: no script errors ${errs.join(' | ')}`);
  if (process.env.SHOTS) await pg.screenshot({ path: path.join(process.env.SHOTS, `shot-${wd}.png`) });
  await pg.close();
}
await br.close(); console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
