// Drive index.html in a real browser at two widths. Node + playwright.
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); let bad = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const R = JSON.parse(fs.readFileSync(path.join(here, 'results.json')));
const br = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
for (const [wd, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const pg = await br.newPage({ viewport: { width: wd, height: 900 }, colorScheme: scheme }); const errs = [];
  pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await pg.goto('file://' + path.join(here, 'index.html'));
  const t = id => pg.innerText('#' + id), num = async id => +(await t(id)).replace(/[^0-9.\-]/g, '');
  const setR = async (id, v) => pg.$eval('#' + id, (e, v) => { e.value = v; e.dispatchEvent(new Event('input')); }, v);
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: no horizontal page scroll`);
  // the page's own computation against the build's, at the fit and both ends of the interval
  ok(Math.abs(await num('tot') - R.H.at.total) < 0.06, `${wd}px: harm total at the fit = ${R.H.at.total}`);
  ok(await num('over') === 0, `${wd}px: no calm above one half at the fit`);
  ok(Math.abs(await num('big') - 100 * R.H.at.largest) < 0.06, `${wd}px: largest share ${R.H.at.largest}`);
  ok((await t('orlab')).includes("model's fit"), `${wd}px: slider opens on the model's fit`);
  await setR('or', R.H.OR_ci[0]); ok(Math.abs(await num('tot') - R.H.at_lo.total) < 0.06 && await num('over') === 0, `${wd}px: strong end ${R.H.at_lo.total}, none above half`);
  await setR('or', R.H.OR_ci[1]); ok(Math.abs(await num('tot') - R.H.at_hi.total) < 0.06, `${wd}px: weak end ${R.H.at_hi.total}`);
  await setR('or', 0.48); ok(await num('over') === 0, `${wd}px: at OR 0.48 still none above half`);
  await setR('or', 0.47); ok(await num('over') >= 1 && (await t('ornote')).includes('outside it'), `${wd}px: at OR 0.47 the first passes half, marked outside the model`);
  await setR('or', 1); ok(Math.abs(await num('tot')) < 0.06, `${wd}px: at OR 1 the column is empty`);
  await setR('or', R.H.OR); await setR('thr', 0.25); ok(await num('over') === R.H.at.over_quarter, `${wd}px: ${R.H.at.over_quarter} calm above one quarter`);
  // fill the column twice
  await pg.click('#draw'); const d1 = await t('drawread'); const n1 = +d1.match(/Column 1: ([\d,]+)/)[1].replace(/,/g, '');
  ok(Math.abs(n1 - R.H.at.total) < 4 * Math.sqrt(R.H.at.total), `${wd}px: first filled column ${n1} near ${R.H.at.total}`);
  await pg.click('#draw'); const d2 = await t('drawread'); const re = +d2.match(/entered again \(([\d.]+) %\)/)[1];
  ok(re < 25 && d2.includes(`Expected on average: ${(100 * R.H.at.redrawn).toFixed(1)} %`), `${wd}px: second column re-enters ${re} % (expected ${(100 * R.H.at.redrawn).toFixed(1)} %)`);
  // tap a cell: the most exposed calm and a harmed one read correctly
  const tap = await pg.evaluate(() => { const o = window.__atelier.order(); let k = o.length - 1; while (ROWS[o[k]][3] === 1) k--; return k; });
  await pg.evaluate(k => window.__atelier.pickAt(k), tap); ok((await t('cellread')).includes('No record says which it was'), `${wd}px: a calm cell reads with its shares`);
  const tapH = await pg.evaluate(() => window.__atelier.order().findIndex(i => ROWS[i][3] === 1));
  await pg.evaluate(k => window.__atelier.pickAt(k), tapH); ok((await t('cellread')).includes('the world wrote this one'), `${wd}px: a harmed cell reads as written by the world`);
  // a real click lands on a cell
  await pg.locator('#grid').scrollIntoViewIfNeeded(); const b = await pg.locator('#grid').boundingBox();
  await pg.mouse.click(b.x + 10, b.y + 10); ok((await t('cellread')).includes('tornado'), `${wd}px: a real click reads a cell`);
  // deaths
  await pg.click('#o-D'); ok(Math.abs(await num('tot') - R.D.at.total) < 0.06, `${wd}px: death total at the fit ${R.D.at.total}`);
  await setR('or', R.D.OR_ci[1]); ok(Math.abs(await num('tot') - R.D.at_hi.total) < 0.06 && (await t('ornote')).includes('turns negative'), `${wd}px: death total at the weak end ${R.D.at_hi.total}, negative`);
  const o = await t('out');
  ok(o.includes('207') && o.includes('141 to 266') && o.includes('30.3 %') && o.includes('38.9 %') && o.includes('0.47') && o.includes('8.9 %') && o.includes('-35') && o.includes('+59'), `${wd}px: findings carry the build's numbers`);
  ok((await pg.innerText('main')).includes('Judgment (mine)') && (await pg.innerText('main')).includes('Fundamental Problem'), `${wd}px: judgment marked, source quoted`);
  ok(!(await pg.innerText('main')).match(/NaN|undefined/), `${wd}px: no NaN or undefined`);
  ok(await pg.evaluate(() => getComputedStyle(document.body).backgroundColor) === (scheme === 'dark' ? 'rgb(22, 21, 15)' : 'rgb(251, 250, 247)'), `${wd}px: ${scheme} background`);
  ok(await pg.evaluate(() => { const c = document.getElementById('grid'), x = c.getContext('2d'), d = x.getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) n += d[i] > 0; return n > 20000; }), `${wd}px: grid drawn`);
  ok(errs.length === 0, `${wd}px: no script errors ${errs.join(' | ')}`);
  if (process.env.SHOTS) await pg.screenshot({ path: path.join(process.env.SHOTS, `shot-${wd}.png`), fullPage: true });
  await pg.close();
}
await br.close(); console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
