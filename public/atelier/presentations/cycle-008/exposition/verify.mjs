// Drive the exposition in a real browser at two widths and check it against null.py. Node + playwright.
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); let bad = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const N = JSON.parse(fs.readFileSync(path.join(here, 'null.json')));
const br = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
for (const [wd, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const pg = await br.newPage({ viewport: { width: wd, height: 900 }, colorScheme: scheme }); const errs = [];
  pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await pg.goto('file://' + path.join(here, 'index.html'));
  const t = id => pg.innerText('#' + id);
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: no horizontal page scroll`);
  ok(await pg.evaluate(() => window.__expo.REC) === N.observed && N.observed === 38, `${wd}px: the browser re-judges the record to 38, as null.py does`);
  ok((await t('aread')).includes('too high') && (await t('aread')).includes('consistent'), `${wd}px: Avenal's narrowest classes disagree on the record`);
  ok((await t('t-om')) === String(N.laws['one factor'].median) && (await t('t-ag')) === Math.round(N.laws['as written'].share_ge_observed * 100) + ' %', `${wd}px: table filled from null.json`);
  await pg.click('#draw50'); ok(await pg.evaluate(() => window.__expo.count()) === 50, `${wd}px: fifty one-factor worlds drawn`);
  const c = +(await t('wcount')); ok(c >= 0 && c <= 252, `${wd}px: a drawn world reports a count (${c})`);
  await pg.click('#b-as'); await pg.click('#draw1'); ok((await t('wread')).includes('odds as written'), `${wd}px: law switches to the odds as written`);
  await pg.click('#b-rec'); ok(+(await t('wcount')) === 38, `${wd}px: the record button shows 38`);
  const px = await pg.$eval('#hist', e => { const d = e.getContext('2d').getImageData(0, 0, e.width, e.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) n += d[i] > 0; return n; });
  ok(px > 500, `${wd}px: the histogram is drawn`);
  ok(errs.length === 0, `${wd}px: no script errors ${errs.join(' | ')}`);
  await pg.screenshot({ path: path.join(process.env.SHOTS || '/tmp', `expo-${wd}.png`), fullPage: false });
}
await br.close(); console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
