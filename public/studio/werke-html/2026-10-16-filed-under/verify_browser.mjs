// node verify_browser.mjs — FILED UNDER in a real browser at 390 px (light) and 1100 px (dark)
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const S = JSON.parse(fs.readFileSync(join(here, 'summary.json')));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required', '--allow-file-access-from-files'] });
let pass = 0, fail = 0; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };
for (const [w, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', x => x.type() === 'error' && errs.push(x.text()));
  await p.goto('file://' + join(here, 'index.html') + '#w1');
  await p.waitForFunction(() => document.querySelectorAll('#map path').length > 3000, null, { timeout: 15000 });
  t(w + ' no errors on load', errs.length === 0);
  t(w + ' no horizontal overflow', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  t(w + ' in-progress line at the top', (await p.locator('#wip').innerText()).includes('increment 1 of 3'));
  const k = await p.evaluate(() => ({ n: CARDS.length, c: CARDS.filter(c => c.nn === 'contradicted').length,
    b: CARDS.filter(c => c.nn === 'backed' || c.nn === 'both').length }));
  t(`${w} cards ${k.n} = dealt`, k.n === S.dealt && S.dealt + S.withheld_not_dealt === S.warnings && S.warnings === 23154);
  t(`${w} contradicted ${k.c}, backed ${k.b}`, k.c === S.record_can_contradict_at_most && k.b === S.record_can_back_at_most && k.b === 1);
  // the page's answers, recomputed independently from the data for every card and every drawer
  const bad = await p.evaluate(() => {
    let bad = 0;
    CARDS.forEach(c => {
      const exp = { heeded: 'none', ignored: 'none', cant: 'agrees',
        never: c.nn === 'backed' ? 'backed' : c.nn === 'contradicted' ? 'contradicted' : 'none' };
      for (const f of Object.keys(exp)) if (window.__fu.answerFor(c, f)[0] !== exp[f]) bad++;
      if (c.nn === 'contradicted' && !c.dl.some(d => d[2] === 1)) bad++;   // a contradiction names its disaster
    });
    return bad;
  });
  t(`${w} every answer follows the fixed rules (${bad} off)`, bad === 0);
  // card 1: the first warning in the archive, NYC, Hurricane Sandy
  const card = await p.locator('#card').innerText();
  t(`${w} card 1 is the Rockaways evacuation, with Sandy declared`, card.includes('MANDATORY EVACUATION') && card.includes('Hurricane Sandy') && card.includes('DR-4085-NY'));
  t(`${w} card 1 lights its counties on the map`, await p.evaluate(() => [...document.querySelectorAll('#map path')].filter(e => e.getAttribute('fill') === getComputedStyle(document.documentElement).getPropertyValue('--lit').trim()).length === 5));
  await p.click('.drawer[data-f="never"]'); await p.waitForTimeout(1400);
  const ans = await p.locator('#answer').innerText();
  t(`${w} never needed on card 1 is contradicted`, /contradicted/i.test(ans) && await p.locator('#cc').innerText() === '1');
  t(`${w} the drawers lock after filing`, await p.locator('.drawer[data-f="heeded"]').isDisabled());
  await p.keyboard.press('n'); await p.keyboard.press('1'); await p.waitForTimeout(1400);
  t(`${w} heeded by key gets no word`, /no word/i.test(await p.locator('#answer').innerText()) && await p.locator('#cn').innerText() === '1');
  await p.keyboard.press('n'); await p.keyboard.press('4'); await p.waitForTimeout(1400);
  t(`${w} can't say agrees`, await p.locator('#ca').innerText() === '1' && (await p.locator('#ledger li').count()) === 3);
  // the one backed card
  const bi = await p.evaluate(() => CARDS.findIndex(c => c.nn === 'backed'));
  await p.evaluate(i => window.__fu.show(i), bi); await p.click('.drawer[data-f="never"]'); await p.waitForTimeout(1400);
  t(`${w} the one backed card says the error is an earlier message's`, /earlier message/.test(await p.locator('#answer').innerText()) && await p.locator('#cb').innerText() === '1');
  await p.click('#more'); await p.waitForFunction(() => document.getElementById('long').textContent.length > 50, null, { timeout: 15000 });
  t(`${w} the whole message loads on demand`, (await p.locator('#long').innerText()).includes('THE LAST ALERT WAS IN ERROR'));
  // persistence
  await p.reload(); await p.waitForTimeout(500);
  t(`${w} the column survives a reload`, (await p.locator('#ledger li').count()) === 4);
  const dl = p.waitForEvent('download'); await p.click('#csv'); const f = await dl;
  const csv = fs.readFileSync(await f.path(), 'utf8');
  t(`${w} the CSV holds the four filings`, csv.split('\n').length === 5 && csv.includes('never needed') && csv.includes('contradicted'));
  t(`${w} the grid is drawn`, await p.evaluate(() => { const c = document.getElementById('strip'); return c.width > 100 && c.height > 100 && c.getContext('2d').getImageData(4, 4, 1, 1).data[3] > 0; }));
  // the decks
  await p.click('.chip[data-mode="decl"]');
  t(`${w} the declared deck deals a card with a declaration`, await p.evaluate(() => CARDS[+location.hash.slice(2) - 1].dn > 0));
  await p.click('#clear'); await p.evaluate(i => window.__fu.show(i), 0);
  await p.screenshot({ path: join(here, `shot-${w}.png`), fullPage: false });
  t(`${w} no errors at the end`, errs.length === 0);
  if (errs.length) console.log(errs);
  await ctx.close();
}
await b.close();
console.log(`${pass}/${pass + fail}`); process.exit(fail ? 1 : 0);
