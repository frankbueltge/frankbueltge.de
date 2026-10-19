// node verify_browser.mjs — FILED UNDER in a real browser at 390 px (light) and 1100 px (dark)
// Session 176: rewritten for increment 2 (the record sealed until filing, filed warnings locked, the stale
// answer cancelled, verdicts apart from abstentions, four bands, the keeper's clock, the wider person rule).
// Session 177: increment 3, the presentation (no in-progress line; the slip carried by hand into a drawer;
// the time each warning was held; the cycle's works linked).
// Session 183: below the threshold (NOAA Storm Events answers never needed from below; the year-earlier line).
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const S = JSON.parse(fs.readFileSync(join(here, 'summary.json')));
const BS = JSON.parse(fs.readFileSync(join(here, 'below_summary.json')));
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
  t(w + ' presented: no in-progress line, the siblings linked', (await p.locator('#wip').count()) === 0 &&
    (await p.locator('a[href*="field-research/tree/main/presentations/cycle-008"]').count()) === 1 &&
    (await p.locator('a[href*="ulysses/tree/main/presentations/cycle-008"]').count()) === 1);
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
        never: c.nn === 'backed' ? 'backed' : c.nn === 'contradicted' ? 'contradicted' : BELOW[c._i].s === 'met' ? 'contradicted' : 'none' };
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
  // the slip, carried by hand: let go outside a drawer and it comes back; let it fall into a drawer and it files
  await p.keyboard.press('n'); await p.waitForTimeout(300);
  await p.locator('#slip').scrollIntoViewIfNeeded();
  let sb = await p.locator('#slip').boundingBox();
  await p.mouse.move(sb.x + 20, sb.y + sb.height / 2); await p.mouse.down();
  await p.mouse.move(sb.x + 30, sb.y - 120, { steps: 6 });
  t(`${w} the slip is lifted and carried`, (await p.locator('.carried').count()) === 1);
  await p.mouse.up(); await p.waitForTimeout(200);
  t(`${w} let go outside a drawer, the slip comes back and nothing is filed`, (await p.locator('.carried').count()) === 0 &&
    (await p.evaluate(() => window.__fu.ledger.length)) === 4 && !(await p.locator('#slip').evaluate(e => e.classList.contains('gone'))));
  sb = await p.locator('#slip').boundingBox(); const db = await p.locator('.drawer[data-f="ignored"]').boundingBox();
  await p.mouse.move(sb.x + 20, sb.y + sb.height / 2); await p.mouse.down();
  await p.mouse.move(db.x + db.width / 2, db.y + db.height / 2, { steps: 10 });
  t(`${w} the drawer under the slip opens`, await p.locator('.drawer[data-f="ignored"]').evaluate(e => e.classList.contains('over')));
  await p.mouse.up(); await p.waitForTimeout(2700);
  const last = await p.evaluate(() => window.__fu.ledger[window.__fu.ledger.length - 1]);
  t(`${w} carried into ignored, it is filed, held ${last.dt} ms, marked carried`, (await p.evaluate(() => window.__fu.ledger.length)) === 5 &&
    last.f === 'ignored' && last.h === 1 && last.dt > 0 && /no word/i.test(await p.locator('#answer').innerText()));
  t(`${w} the column says how long each was held`, /median [\d.]+ s/.test(await p.locator('#held').innerText()) && /1 of 5 carried/.test(await p.locator('#held').innerText()));
  await p.click('.drawer[data-f="never"]', { force: true }).catch(() => {});
  t(`${w} a filed card cannot be filed twice`, (await p.evaluate(() => window.__fu.ledger.length)) === 5);
  // a card the word list leaves silent though a disaster was declared
  const si = await p.evaluate(() => CARDS.findIndex((c, i) => c.nn === 'none' && c.dn && BELOW[i].s !== 'met'));
  await p.evaluate(i => window.__fu.show(i), si); await p.click('.drawer[data-f="never"]'); await p.waitForTimeout(2700);
  t(`${w} a declared disaster missed by the word list is said so`, /word list does not find/.test(await p.locator('#answer').innerText()));
  await p.click('#more'); await p.waitForFunction(() => document.getElementById('long').textContent.length > 10 && document.getElementById('long').textContent !== '…', null, { timeout: 15000 });
  t(`${w} the whole message loads on demand`, (await p.locator('#long').innerText()).length > 10);
  await p.reload(); await p.waitForTimeout(600);
  t(`${w} the column survives a reload`, (await p.locator('#ledger li').count()) === 6);
  const dl = p.waitForEvent('download'); await p.click('#csv'); const f = await dl;
  const csv = fs.readFileSync(await f.path(), 'utf8');
  t(`${w} the CSV holds the six filings, with the time held and the hand`, csv.split('\n').length === 7 && csv.includes('never needed') && csv.includes('contradicted') &&
    csv.split('\n')[0].includes('seconds_before_filing') && csv.includes('"carried"'));
  t(`${w} four bands are drawn`, await p.evaluate(() => { const c = document.getElementById('strip'); const g = c.getContext('2d');
    return c.height > 400 && [0.2, 0.45, 0.7, 0.95].every(y => g.getImageData(4, Math.floor(c.height * y), 1, 1).data[3] > 0 || g.getImageData(10, Math.floor(c.height * y) - 6, 1, 1).data[3] > 0); }));
  // below the threshold (session 183)
  const bk = await p.evaluate(() => { const n = {bw: 0, y0: 0, e: 0}; CARDS.forEach((c, i) => { const b = BELOW[i];
    if (b.s === 'met' && !b.e) n.e++; if (b.n0 && !b.e0) n.e++;
    if (c.nn !== 'contradicted' && b.s === 'met') { n.bw++; if (b.n0) n.y0++; } }); return {...n, len: BELOW.length}; });
  t(`${w} below: ${bk.bw} contradicted from below, ${bk.y0} of them also a year earlier, = build`, bk.len === 13371 && bk.e === 0 &&
    bk.bw === BS.counts['newly_contradicted|undeclared'] + BS.counts['newly_contradicted|declared'] && bk.y0 === BS.counts['newly_contradicted_and_year_earlier|undeclared'] + (BS.counts['newly_contradicted_and_year_earlier|declared'] || 0));
  t(`${w} below: the build agrees with the Field's met_24 on every warning`, BS.check_against_field_met_24.same === 4493 && !BS.check_against_field_met_24.different);
  t(`${w} below: the grown note is on the page, and the rule counts are filled`, /below the threshold/i.test(await p.locator('#grown').innerText()) && (await p.locator('#t_bw').innerText()) === bk.bw.toLocaleString('en-US'));
  await p.click('.chip[data-mode="below"]'); await p.waitForTimeout(200);
  const bi = await p.evaluate(() => +location.hash.slice(2) - 1);
  t(`${w} the lower-record deck deals a card the lower record contradicts`, await p.evaluate(i => BELOW[i].s === 'met' && CARDS[i].nn !== 'contradicted', bi));
  t(`${w} sealed, the lower record's entry is not shown`, !(await p.locator('#card').innerText()).includes('Storm Events wrote down'));
  await p.click('.drawer[data-f="never"]'); await p.waitForTimeout(1500);
  card = await p.locator('#card').innerText();
  t(`${w} filed never needed: contradicted from below, with the entry and the year-earlier line`, /contradicted from below/i.test(await p.locator('#answer').innerText()) &&
    card.includes('Storm Events wrote down') && /A year earlier, in the same counties/.test(card) && (await p.locator('#after a[href*="ncei.noaa.gov/stormevents/eventdetails.jsp?id="]').count()) === 1);
  const ks = await p.evaluate(() => CARDS.findIndex((c, i) => c.nn === 'none' && !c.dn && BELOW[i].s === 'silent'));
  await p.evaluate(i => window.__fu.show(i), ks); await p.click('.drawer[data-f="never"]'); await p.waitForTimeout(2700);
  t(`${w} where the lower record kept watch and wrote nothing: no word, a kept silence`, /silence where a record was kept/.test(await p.locator('#answer').innerText()) && /wrote none down/.test(await p.locator('#card').innerText()));
  const uk = await p.evaluate(() => CARDS.findIndex((c, i) => c.nn === 'none' && !c.dn && BELOW[i].s === 'unkept'));
  await p.evaluate(i => window.__fu.show(i), uk); await p.click('.drawer[data-f="never"]'); await p.waitForTimeout(2700);
  t(`${w} where no record keeps the danger: no word, and nothing could`, /nothing could/.test(await p.locator('#answer').innerText()));
  await p.click('#clear');
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
