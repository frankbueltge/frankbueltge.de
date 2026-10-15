// node verify_browser.mjs — loads the page at 390 px (light) and 1100 px (dark), runs the clock, checks the counts against data.json
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const D = JSON.parse(fs.readFileSync(join(here, 'data.json'))); const S = D.summary;
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
let pass = 0, fail = 0; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };
const num = s => +s.replace(/[^\d]/g, '');
for (const [w, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + join(here, 'index.html')); await p.waitForTimeout(300);
  t(w + ' no errors', errs.length === 0);
  t(w + ' no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  const pend90 = D.rows.filter(r => r[1] < '1990-01-01' && r[7] > '1990-01-01').length;
  t(w + ` at 1 Jan 1990: ${S.pre1990.n} passed, ${pend90} of them not yet in any record`, num(await p.locator('#c-pend').innerText()) === pend90 && num(await p.locator('#c-all').innerText()) === S.pre1990.n);
  await p.fill('#t', '1000'); await p.dispatchEvent('#t', 'input'); await p.waitForTimeout(100);
  t(w + ' today: all past passages counted', num(await p.locator('#c-all').innerText()) === S.past);
  t(w + ' today: late count = ' + S.after, num(await p.locator('#c-late').innerText()) === S.after);
  t(w + ' today: seen count = before + day', num(await p.locator('#c-seen').innerText()) === S.before + S.day);
  t(w + ' today: nothing pending', num(await p.locator('#c-pend').innerText()) === 0);
  t(w + ' today: 13 came down, 0 rows', (await p.locator('#c-hit').innerText()) === `${S.impacts.length} · 0`);
  t(w + ' impact table: 13 rows, all "none"', await p.locator('#imp tbody tr').count() === S.impacts.length && await p.locator('#imp td.none', { hasText: 'none' }).count() === S.impacts.length);
  t(w + ' no impact has a row for its day', S.impacts_with_a_row_for_their_day === 0);
  t(w + ' p-after text', (await p.locator('#p-after').innerText()).startsWith(S.after.toLocaleString('en-GB')));
  t(w + ' dmin count 7', (await p.locator('#p-dmin').innerText()) === String(S.dist_min_inside_earth.length));
  // mid-date: pending > 0 somewhere in 2020
  await p.evaluate(() => { const a = window.__aip; a.setT(a.day('2020-11-13T23:59')) });
  const pend = num(await p.locator('#c-pend').innerText());
  const exp = D.rows.filter(r => r[8] === 'after' && r[1] <= '2020-11-13T23:59' && r[7] > '2020-11-13').length;
  t(w + ` 13 Nov 2020: pending ${pend} = ${exp} (2020 VT4 among them)`, pend === exp && exp > 0);
  t(w + ' event line written while scrubbing', (await p.locator('#ev').innerText()).length >= 0);
  await p.click('#m-now'); t(w + ' mode now note', (await p.locator('#mode-note').innerText()).includes('today'));
  await p.click('#ahead'); await p.fill('#t', '1000'); await p.dispatchEvent('#t', 'input');
  t(w + ' run on to 2100: date reads 2100', (await p.locator('#date').innerText()).includes('2100'));
  await p.click('#s-all'); await p.hover('#arcs', { position: { x: w * 0.55, y: 200 } }); await p.waitForTimeout(100);
  await p.click('#play'); await p.waitForTimeout(400); await p.click('#play');
  t(w + ' no errors after play', errs.length === 0);
  await p.click('#m-then'); await p.click('#ahead');
  await p.evaluate(() => { const a = window.__aip; a.setT(a.day('2024-02-01')) }); await p.waitForTimeout(200);
  await p.evaluate(() => scrollTo(0, 0)); await p.waitForTimeout(100);
  await p.screenshot({ path: join(here, `shot-${w}.png`), fullPage: false });
  await p.locator('#arcwrap').screenshot({ path: join(here, `shot-arcs-${w}.png`) });
  await p.close();
}
await b.close(); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
