// Drive index.html in a real browser at two widths. Node + playwright.
import { createRequire } from 'module'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire(process.env.PW_ROOT || '/opt/node22/lib/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); let bad = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const br = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
for (const [wd, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const pg = await br.newPage({ viewport: { width: wd, height: 900 }, colorScheme: scheme }); const errs = [];
  pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await pg.goto('file://' + path.join(here, 'index.html'));
  const T = id => pg.innerText('#' + id);
  const set = async (id, v) => pg.$eval('#' + id, (e, v) => { e.value = v; e.dispatchEvent(new Event('input')); }, v);
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: no horizontal page scroll`);
  ok((await T('r-true')) === 'Heeded 36 · acted on, came anyway 36 · ignored 48 · never needed 280 (of 400).', `${wd}px: default world 36/36/48/280`);
  ok((await T('r-clock')).includes('heeded 0 of 36, ignored 0 of 48, never needed 0 of 280') && (await T('r-clock')).includes('316 quiet'), `${wd}px: Clock merges 316`);
  ok((await T('r-bank')).includes('ignored 48 of 48, never needed 112 of 280') && (await T('r-bank')).includes('holds 204, of which 36 heeded'), `${wd}px: Bank 48, 112, column 204`);
  ok((await T('r-torn')).includes('never needed 316 (36 misfiled)') && (await T('r-torn')).includes('Exact only at e = 0'), `${wd}px: tornado misfiles 36`);
  ok((await T('r-local')).includes('Contradicts "never needed" 42 times; backs it 0'), `${wd}px: local contradicts 42`);
  // click the first dot (a heeded warning) in the true field
  const cvs = await pg.$('#c-true'); await cvs.scrollIntoViewIfNeeded(); const bb = await cvs.boundingBox();
  await pg.mouse.click(bb.x + bb.width / 50, bb.y + 4 + (bb.height - 8) / 32);
  const d = await T('r-dot');
  ok(d.startsWith('Warning 1: truly heeded') && d.includes('Clock files it as nothing came') && d.includes("Bank as the warner's column") && d.includes('false alarm (misfiled)') && d.includes('local archive as no word'), `${wd}px: a heeded dot is filed elsewhere in all four`);
  await pg.click('#e0');
  ok((await T('r-true')).startsWith('Heeded 0 · acted on, came anyway 72') && (await T('r-torn')).includes('At e = 0 the false-alarm count is exact') && (await T('r-torn')).includes('never needed 280 (0 misfiled)'), `${wd}px: e = 0, tornado ledger exact`);
  await pg.click('#reset'); await pg.click('#h0');
  ok((await T('r-bank')).includes('never needed 280 of 280') && (await T('r-bank')).includes('holds 0'), `${wd}px: nobody acts, Bank scores every never needed`);
  // sweep: heeded is never written as itself
  let zero = true, sum = 0;
  for (const [p, h, e, q] of [[10, 90, 90, 100], [80, 50, 100, 0], [50, 100, 30, 70], [100, 100, 100, 100], [0, 0, 0, 0]]) {
    await set('p', p); await set('h', h); await set('e', e); await set('q', q);
    const a = await T('r-all'); zero = zero && a.startsWith('Heeded written as itself, all four ledgers: 0 of'); sum += +a.match(/0 of (\d+)/)[1];
  }
  ok(zero && sum > 0, `${wd}px: heeded written 0 times in five worlds (true heeded total ${sum})`);
  const x = await pg.innerText('#real');
  ok(x.includes('33 settings from 1947 to 2026') && x.includes('at most 3.72 %'), `${wd}px: Clock panel 33, 3.72`);
  ok(x.includes('0.17 of the fan') && x.includes('in 20 of 38') && x.includes('came true in 17') && x.includes('nearer in 15') && x.includes('1.19 against 1.46') && x.includes('in 31; the outturn did in 14'), `${wd}px: Bank panel`);
  ok(x.includes('Of 43,819 tornado warnings') && x.includes('13,324') && x.includes('69.6 % never needed') && x.includes('80 % on the strict rule') && x.includes('53.69 % before, 53.78 % after, +0.09 points (-6.42 to +6.48)'), `${wd}px: tornado panel quoted`);
  ok(x.includes('15,012 local') && x.includes('8,142 withheld') && x.includes('heeded 0 times, ignored 0 times, never needed 1 time') && x.includes('2,679 times') && x.includes('16,644 silent') && x.includes('median 3 h') && x.includes('99.4 % of 5,711'), `${wd}px: local panel quoted`);
  const o = await T('out');
  ok(o.includes('69.6 % never needed') && o.includes('17 of 38') && o.includes('0.17 of its fan') && o.includes('16,644 silent') && o.includes('(2,679 times)'), `${wd}px: findings filled`);
  const m = await pg.innerText('main');
  ok(!m.includes('NaN') && !m.includes('undefined') && m.includes('Judgment (mine)') && m.includes('placebo rises 3.83'), `${wd}px: no NaN, judgment marked, placebo stated`);
  ok(await pg.evaluate(() => getComputedStyle(document.body).backgroundColor) === (scheme === 'dark' ? 'rgb(22, 21, 15)' : 'rgb(251, 250, 247)'), `${wd}px: ${scheme} background`);
  ok(await pg.evaluate(() => ['c-true', 'c-clock', 'c-bank', 'c-torn', 'c-local'].every(id => { const c = document.getElementById(id), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) n += d[i] > 0; return n > 2000; })), `${wd}px: five fields drawn`);
  if (process.env.SHOTS) { await pg.click('#reset'); await pg.screenshot({ path: path.join(process.env.SHOTS, `shot-${wd}.png`), fullPage: true }); }
  ok(errs.length === 0, `${wd}px: no page errors ${errs.join(' | ')}`);
}
await br.close(); console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
