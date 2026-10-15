// Drive index.html in a real browser at two widths. Node + playwright.
import { createRequire } from 'module'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); let bad = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const br = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
for (const wd of [390, 1100]) {
  const pg = await br.newPage({ viewport: { width: wd, height: 900 } }); const errs = [];
  pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await pg.goto('file://' + path.join(here, 'index.html'));
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: no horizontal scroll`);
  let t = await pg.innerText('#verdict');
  ok(t.includes('holds') && t.includes('0.85') && t.includes('15.0 %'), `${wd}px: default (33 %, k 1.00) holds; break-even 0.85; response rate 15.0 %`);
  await pg.fill('#k', '70'); ok((await pg.innerHTML('#verdict')).includes('fails</b>'), `${wd}px: k 0.70 fails`);
  await pg.fill('#k', '90'); ok((await pg.innerHTML('#verdict')).includes('holds</b>'), `${wd}px: k 0.90 holds`);
  await pg.selectOption('#q', '2'); t = await pg.innerText('#verdict'); ok(t.includes('0.59') || t.includes('0.58'), `${wd}px: control-problem question gives its own break-even`);
  await pg.selectOption('#d', '1'); t = await pg.innerText('#verdict'); ok(t.includes('13.8 %'), `${wd}px: larger frame lowers the response rate`);
  ok((await pg.$$('#ladder tr')).length === 5 && (await pg.$$('#records tr')).length === 5, `${wd}px: both tables drawn`);
  ok(errs.length === 0, `${wd}px: no console errors ${errs}`);
  if (wd === 1100) await pg.screenshot({ path: process.env.SHOT || '/tmp/shot.png', fullPage: true });
}
await br.close(); process.exit(bad ? 1 : 0);
