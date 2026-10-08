// node verify_browser.mjs — (session 162: plus the pen layer) loads the page at 390 (light) and 1100 px (dark), drags the date, tries a YES, checks the counts against data.json
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const D = JSON.parse(fs.readFileSync(join(here, 'data.json'))); const S = D.summary;
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
let pass = 0, fail = 0; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };
for (const [w, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + join(here, 'index.html'));
  t(w + ' no errors', errs.length === 0);
  t(w + ' no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  t(w + ' 62 ledger rows', await p.locator('#ledger tbody tr:not(.divider)').count() === S.ledger);
  t(w + ' today: 30 NO, 32 not yet due', (await p.locator('#nowcount').innerText()) === `${S.ledger_resolved} NO · 0 YES · ${S.ledger_open} not yet due`);
  t(w + ' 30 inked NO cells', await p.locator('td.c.no.on').count() === S.ledger_resolved);
  t(w + ' 32 resolve buttons', await p.locator('button.y').count() === S.ledger_open);
  await p.fill('#t', '1000'); await p.dispatchEvent('#t', 'input');
  t(w + ' at 9595 all 62 are NO, 0 YES', (await p.locator('#nowcount').innerText()) === `${S.ledger} NO · 0 YES · 0 not yet due`);
  t(w + ' YES column still empty of text', await p.evaluate(() => [...document.querySelectorAll('td.c.yes')].every(td => !/YES/.test(td.innerText))));
  await p.fill('#t', '0'); await p.dispatchEvent('#t', 'input');
  t(w + ' at Jun 2023 a few written', /^\d+ NO/.test(await p.locator('#nowcount').innerText()));
  await p.fill('#t', '250'); await p.dispatchEvent('#t', 'input');
  t(w + ' peak text names the 2026 market at 11.2 %', (await p.locator('#peakText').innerText()).includes('11.2 %'));
  t(w + ' four exclusions listed', await p.locator('#excluded li').count() === S.not_extinction + S.na_by_design);
  // session 162: who holds the pen
  const P = JSON.parse(fs.readFileSync(join(here, 'pen.json')));
  t(w + ' pen inscriptions hidden by default', await p.evaluate(() => [...document.querySelectorAll('td.c.yes .w')].every(e => getComputedStyle(e).display === 'none')));
  await p.click('#penbtn');
  t(w + ' pen on: 62 inscriptions shown', await p.evaluate(() => [...document.querySelectorAll('td.c.yes .w')].filter(e => getComputedStyle(e).display !== 'none').length) === P.n);
  t(w + ' pen on: ' + P.by_writer.machine + ' rows hand YES to an AI', await p.locator('td.c.yes.machine').count() === P.by_writer.machine);
  t(w + ' pen on: 7 struck lines in the ledger', await p.evaluate(() => [...document.querySelectorAll('.struckline')].filter(e => getComputedStyle(e).display !== 'none').length) === 7);
  t(w + ' struck list has 7 answers', await p.locator('#struck li').count() === 7);
  t(w + ' pen counts text matches pen.json', (await p.locator('#penCounts').innerText()).startsWith(`Of the ${P.n} rules, ${P.by_writer.machine} name a machine`));
  t(w + ' method states kappa', (await p.locator('#penMethod').innerText()).includes('κ = ' + P.kappa));
  t(w + ' pen figure drawn', await p.evaluate(() => { const c = document.getElementById('penfig'); const d = c.getContext('2d').getImageData(0, 0, c.width, c.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i]) n++; return n > 500; }));
  t(w + ' no horizontal scroll with pen on', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await p.locator('#struck').scrollIntoViewIfNeeded(); await p.waitForTimeout(2600);
  { const y0 = await p.evaluate(() => document.getElementById('pen').getBoundingClientRect().top + scrollY); await p.screenshot({ path: join(here, 'shot-pen-' + w + '.png'), fullPage: true, clip: { x: 0, y: y0, width: w, height: 1300 } }); }
  await p.screenshot({ path: join(here, 'shot-' + w + '.png'), fullPage: true });
  await p.locator('button.y').first().click();
  await p.waitForTimeout(6800);
  t(w + ' page emptied on YES', await p.evaluate(() => getComputedStyle(document.getElementById('page')).opacity) === '0');
  t(w + ' void says nothing was written', (await p.locator('#voidText').innerText()).includes('Nothing was written'));
  t(w + ' void names the pen', /Its rule (hands|keeps|names|says)/.test(await p.locator('#voidText').innerText()));
  if (w === 1100) await p.screenshot({ path: join(here, 'shot-void.png') });
  await p.click('#back'); await p.waitForTimeout(2600);
  t(w + ' page returns', await p.evaluate(() => getComputedStyle(document.getElementById('page')).opacity) === '1');
  t(w + ' no errors after use', errs.length === 0);
}
await b.close(); console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
