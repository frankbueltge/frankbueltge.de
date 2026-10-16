// node verify_browser.mjs — FILED UNDER in a real browser at 390 px (light) and 1100 px (dark)
// Session 176: rewritten for increment 2 (the record sealed until filing, filed warnings locked, the stale
// answer cancelled, verdicts apart from abstentions, four bands, the keeper's clock, the wider person rule).
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const S = JSON.parse(fs.readFileSync(join(here, 'summary.json')));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--autoplay-policy=no-user-gesture-required', '--allow-file-access-from-files'] });
let pass = 0, fail = 0; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };
const PERSON = /\b(silver alert|ashanti|bolo|be on the look ?out|last seen|[wbh]\/[mf]|males?|females?|y\/?o|year-old|locating)\b/i;
for (const [w, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', x => x.type() === 'error' && errs.push(x.text()));
  await p.goto('file://' + join(here, 'index.html') + '#w1');
  await p.waitForFunction(() => document.querySelectorAll('#map path').length > 3000, null, { timeout: 15000 });
  t(w + ' no errors on load', errs.length === 0);
  t(w + ' no horizontal overflow', await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  t(w + ' in-progress line at the top', (await p.locator('#wip').innerText()).includes('increment 2 of 3'));
  const k = await p.evaluate(() => ({ n: CARDS.length, c: CARDS.filter(c => c.nn === 'contradicted').length,
    b: CARDS.filter(c => c.nn === 'backed' || c.nn === 'both').length, lt: CARDS.filter(c => c.lt != null).length }));
  t(`${w} cards ${k.n} = dealt, and every warning is dealt or counted out`, k.n === S.dealt && S.warnings === 23154 &&
    S.dealt + S.withheld_not_dealt + S.s176_withheld_by_wider_person_rule + S.s176_allclear_not_dealt === S.warnings);
  t(`${w} contradicted ${k.c}, backed ${k.b}`, k.c === S.record_can_contradict_at_most && k.b === S.record_can_back_at_most);
  t(`${w} the keeper's clock on ${k.lt} cards = the Field join`, k.lt === S.s176_field_clock.joined);
  t(`${w} no dealt card carries the person words`, await p.evaluate(src => { const re = new RegExp(src, 'i'); return CARDS.filter(c => re.test(c.w + ' ' + c.x)).length; }, PERSON.source) === 0);
  const bad = await p.evaluate(() => {
    let bad = 0;
    CARDS.forEach(c => {
      const exp = { heeded: 'none', ignored: 'none', cant: 'agrees',
        never: c.nn === 'backed' ? 'backed' : c.nn === 'contradicted' ? 'contradicted' : 'none' };
      for (const f of Object.keys(exp)) if (window.__fu.answerFor(c, f)[0] !== exp[f]) bad++;
      if (c.nn === 'contradicted' && !c.dl.some(d => d[2] === 1)) bad++;
    });
    return bad;
  });
  t(`${w} every answer follows the fixed rules (${bad} off)`, bad === 0);
  // card 1: the record is sealed until filing
  let card = await p.locator('#card').innerText();
  t(`${w} card 1 is the Rockaways evacuation, the record sealed`, card.includes('MANDATORY EVACUATION') && !card.includes('Hurricane Sandy') && card.includes('Sealed until you file'));
  t(`${w} card 1 lights its counties on the map`, await p.evaluate(() => [...document.querySelectorAll('#map path')].filter(e => e.getAttribute('fill') === getComputedStyle(document.documentElement).getPropertyValue('--lit').trim()).length === 5));
  await p.click('.drawer[data-f="never"]'); await p.waitForTimeout(1500);
  card = await p.locator('#card').innerText();
  t(`${w} filed, the record opens: Sandy declared`, card.includes('Hurricane Sandy') && card.includes('DR-4085-NY') && !card.includes('Sealed until you file'));
  t(`${w} the keeper's clock is on the card`, /would stand/.test(card));
  t(`${w} never needed on card 1 is contradicted; verdicts 1, backed 0`, /contradicted/i.test(await p.locator('#answer').innerText()) &&
    await p.locator('#cc').innerText() === '1' && await p.locator('#vn').innerText() === '1' && await p.locator('#vb').innerText() === '0');
  t(`${w} the drawers lock after filing`, await p.locator('.drawer[data-f="heeded"]').isDisabled());
  // a filed warning stays filed: reload on its address
  await p.reload(); await p.waitForTimeout(600);
  t(`${w} reloaded, card 1 is still filed and locked`, await p.locator('.drawer[data-f="heeded"]').isDisabled() && (await p.locator('.drawer.chosen').innerText()).includes('Never needed') && (await p.locator('#ledger li').count()) === 1);
  await p.keyboard.press('n'); await p.keyboard.press('1'); await p.waitForTimeout(2700);
  t(`${w} heeded by key gets no word`, /no word/i.test(await p.locator('#answer').innerText()) && await p.locator('#cn').innerText() === '1');
  // the stale answer: file, and deal at once
  await p.keyboard.press('n'); await p.keyboard.press('3'); await p.keyboard.press('n'); await p.waitForTimeout(2700);
  t(`${w} dealing at once cancels the answer on its way`, await p.evaluate(() => { const a = document.getElementById('answer'); return a.classList.contains('hidden') && a.innerHTML === ''; }) &&
    !(await p.locator('.drawer[data-f="heeded"]').isDisabled()));
  await p.keyboard.press('4'); await p.waitForTimeout(1500);
  t(`${w} can't say counts as declined, not as a verdict`, await p.locator('#ca').innerText() === '1' && await p.locator('#vn').innerText() === '3' && (await p.locator('#ledger li').count()) === 4);
  t(`${w} each ledger row carries the record's answer`, (await p.locator('#ledger li').first().innerText()).includes('declined'));
  await p.click('.drawer[data-f="never"]', { force: true }).catch(() => {});
  t(`${w} a filed card cannot be filed twice`, (await p.evaluate(() => window.__fu.ledger.length)) === 4);
  // a card the word list leaves silent though a disaster was declared
  const si = await p.evaluate(() => CARDS.findIndex(c => c.nn === 'none' && c.dn));
  await p.evaluate(i => window.__fu.show(i), si); await p.click('.drawer[data-f="never"]'); await p.waitForTimeout(2700);
  t(`${w} a declared disaster missed by the word list is said so`, /word list does not find/.test(await p.locator('#answer').innerText()));
  await p.click('#more'); await p.waitForFunction(() => document.getElementById('long').textContent.length > 10 && document.getElementById('long').textContent !== '…', null, { timeout: 15000 });
  t(`${w} the whole message loads on demand`, (await p.locator('#long').innerText()).length > 10);
  await p.reload(); await p.waitForTimeout(600);
  t(`${w} the column survives a reload`, (await p.locator('#ledger li').count()) === 5);
  const dl = p.waitForEvent('download'); await p.click('#csv'); const f = await dl;
  const csv = fs.readFileSync(await f.path(), 'utf8');
  t(`${w} the CSV holds the five filings`, csv.split('\n').length === 6 && csv.includes('never needed') && csv.includes('contradicted'));
  t(`${w} four bands are drawn`, await p.evaluate(() => { const c = document.getElementById('strip'); const g = c.getContext('2d');
    return c.height > 400 && [0.2, 0.45, 0.7, 0.95].every(y => g.getImageData(4, Math.floor(c.height * y), 1, 1).data[3] > 0 || g.getImageData(10, Math.floor(c.height * y) - 6, 1, 1).data[3] > 0); }));
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
