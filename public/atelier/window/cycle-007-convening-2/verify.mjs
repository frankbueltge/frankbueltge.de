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
  ok(await pg.evaluate(() => Math.abs(document.querySelector('#sky').clientWidth / 2 + 22 - document.querySelector('#sky').clientHeight) < 2), `${wd}px: map at 2:1 plus strip`);
  ok((await pg.$$('#picks button')).length === 15, `${wd}px: 13 warned + Chelyabinsk + any other`);
  ok((await pg.$$('#tbl tbody tr')).length === 13, `${wd}px: table of 13`);
  // play to the end, with sound switched on (headless audio must not throw)
  await pg.click('#mute'); await pg.click('#play');
  await pg.waitForFunction(() => document.querySelector('#cap').innerText.includes('is seen in space'), null, { timeout: 15000 });
  ok(true, `${wd}px: the clock stops for a warned strike`);
  await pg.waitForFunction(() => !document.querySelector('#play').disabled, null, { timeout: 120000 });
  let t = await pg.innerText('#cap'); ok(t.includes('639 fireballs kept') && t.includes('13 strikes warned') && t.includes('441 kt'), `${wd}px: play ends with 639, 13, 441 kt`);
  // the map holds drawn pixels in the warned colour
  ok(await pg.evaluate(() => { const c = document.querySelector('#sky'), d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 0; i < d.length; i += 4) if (d[i + 3] && (d[i] !== d[i + 1] || d[i + 1] !== d[i + 2])) n++; return n > 500; }), `${wd}px: sky drawn`);
  await pg.click('#picks button[data-id="2024BX1"]'); t = await pg.innerText('#claim');
  ok(t.includes('2 h 44 min ahead') && t.includes('not written') && t.includes('Dozens of people observed') && t.includes('Not admitted'), `${wd}px: claim 2024 BX1 refused, witnesses quoted`);
  await pg.click('#picks button[data-id="chel"]'); t = await pg.innerText('#claim'); ok(t.includes('1,491') && t.includes('approached Earth undetected') && t.includes('Not admitted'), `${wd}px: claim Chelyabinsk refused, harm written`);
  await pg.click('#picks button[data-id="any"]'); t = await pg.innerText('#tally'); ok(t.includes('Claims tried: 3') && t.includes('0 of 3') && t.includes('646') , `${wd}px: tally 0 of 3, universe 646`);
  t = await pg.innerText('#cells'); ok(/\b0\b[\s\S]*only cell/.test(t) && t.includes('13') && t.includes('632'), `${wd}px: cells 0 / 13 / 1 / 632`);
  t = await pg.innerText('#grid'); ok(t.includes('0 of 13') && t.includes('11 of 13') && t.includes('2 of 13') && t.includes('39 of 39'), `${wd}px: grid counts`);
  t = await pg.innerText('#out'); ok(t.includes('Judgment (mine)') && t.includes('spontaneous real-world exercises') && t.includes('2,864,140'), `${wd}px: findings and judgment filled`);
  t = await pg.innerText('#prop'); ok(t.includes('Ranking: Field > Atelier > Studio'), `${wd}px: ranking shown`);
  ok(await pg.evaluate(() => getComputedStyle(document.body).backgroundColor) === (scheme === 'dark' ? 'rgb(22, 21, 15)' : 'rgb(251, 250, 247)'), `${wd}px: ${scheme} background`);
  ok(errs.length === 0, `${wd}px: no script errors ${errs.join(' | ')}`);
  if (process.env.SHOTS) await pg.screenshot({ path: path.join(process.env.SHOTS, `shot-${wd}.png`), fullPage: true });
  await pg.close();
}
await br.close(); console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
