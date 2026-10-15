// Drive index.html in a real browser at two widths. Node + playwright.
import { createRequire } from 'module'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); let bad = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const br = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const tile0 = pg => pg.$eval('#tiles .big', e => e.innerText);
const ledger = pg => pg.$$eval('#ledger tbody tr', rs => rs.map(r => [r.cells[1].innerText.trim(), r.cells[2].innerText.trim()]));
for (const [wd, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const pg = await br.newPage({ viewport: { width: wd, height: 900 }, colorScheme: scheme }); const errs = [];
  pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await pg.goto('file://' + path.join(here, 'index.html'));
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: no horizontal page scroll`);
  ok((await pg.$$('#chart rect')).length === 9, `${wd}px: 9 pages carry a floor (report = person)`);
  ok((await pg.$$('#chart circle')).length === 6, `${wd}px: 6 pages over people`);
  ok((await pg.$$('#sliders input[type=range]')).length === 7, `${wd}px: 7 open phrases to sharpen`);
  ok(await tile0(pg) === '263', `${wd}px: total starts at the strict floor 263`);
  let L = await ledger(pg);
  ok(L.length === 6 && L.filter(r => r[1] === 'true on every sharpening').length === 1, `${wd}px: 1 of 6 claims supertrue`);
  ok(L[0][0] === 'true' && L[1][0] === 'false' && L[2][0] === 'true', `${wd}px: on the floors: >=263 true, >=264 false, <1 in 10,000 true`);
  await pg.click('#lit'); ok(await tile0(pg) === '261', `${wd}px: the Studio's rule gives 261`); await pg.click('#lit');
  await pg.click('#rep'); ok(await tile0(pg) === '28', `${wd}px: persons only gives 28`); await pg.click('#rep');
  await pg.click('#mute');
  await pg.click('#ledger tbody tr:nth-child(5) button'); L = await ledger(pg);
  ok(L[4][0] === 'false' && L[2][0] === 'false', `${wd}px: "fewer than lived beneath" broken by an admissible sharpening`);
  await pg.click('#ledger tbody tr:nth-child(6) button'); L = await ledger(pg); ok(L[5][0] === 'false', `${wd}px: Ontario > Normandy broken`);
  await pg.click('#ask'); const t = await pg.innerText('#second');
  ok(t.includes('Over 1100 reports (to date)') && t.includes('7.3'), `${wd}px: second keeper says over 1,100, x7.3`);
  ok(await tile0(pg) === '1,213', `${wd}px: total with the second keeper 1,213`);
  await pg.$eval('#sl1', e => { e.value = 1000; e.dispatchEvent(new Event('input')); });
  ok(/10,000,000/.test(await pg.innerText('#sliders')), `${wd}px: an open slider reaches 10,000,000`);
  const o = await pg.innerText('#out'); ok(o.includes('Judgment (mine)') && o.includes('263') && o.includes('28 are written as persons'), `${wd}px: findings filled`);
  ok((await pg.$$('#tbl tbody tr')).length === 23, `${wd}px: 21 phrases + 2 pages without one`);
  ok(await pg.evaluate(() => getComputedStyle(document.body).backgroundColor) === (scheme === 'dark' ? 'rgb(22, 21, 15)' : 'rgb(251, 250, 247)'), `${wd}px: ${scheme} background`);
  ok(errs.length === 0, `${wd}px: no script errors ${errs.join(' | ')}`);
  if (process.env.SHOTS) await pg.screenshot({ path: path.join(process.env.SHOTS, `shot-${wd}.png`), fullPage: true });
  await pg.close();
}
await br.close(); console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
