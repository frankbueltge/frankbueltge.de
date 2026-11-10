// Study 69: open the page at 1100 px light and 390 px dark; check errors, sideways scroll, the grid, its two
// views, a row's readout and the four states of the bar; write process/<n>.png from the light pass.
import { createRequire } from 'module'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const shotN = process.argv[2] || '1';
const b = await chromium.launch(); let fails = 0;
for (const [w, scheme, shot] of [[1100, 'light', `process/${shotN}.png`], [390, 'dark', 'shot-390.png']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForTimeout(300);
  const q = s => p.evaluate(s);
  const rows = await q(`document.querySelectorAll('#grid tbody tr').length`);
  const yesAll = await q(`document.querySelectorAll('#grid tbody tr:not(.out) td:nth-child(5) .cell.yes').length`);
  const tallyAll = await q(`document.querySelector('#tally').textContent`);
  await p.click('[data-view="force"]');
  const out = await q(`document.querySelectorAll('#grid tbody tr.out').length`);
  const yesForce = await q(`document.querySelectorAll('#grid tbody tr:not(.out) td:nth-child(5) .cell.yes').length`);
  const stockForce = await q(`document.querySelectorAll('#grid tbody tr:not(.out) td:nth-child(7) .cell.yes').length`);
  const tallyForce = await q(`document.querySelector('#tally').textContent`);
  await p.click('#grid tbody tr[data-id="ca-sb53"]');
  const ro = await q(`document.querySelector('#readout').textContent`);
  await p.click('#grid tbody tr[data-id="us-eo14110"]');
  const ro2 = await q(`document.querySelector('#readout').textContent`);
  const texts = {};
  for (const l of ['eu_code_signatories', 'paris_call_companies', 'holder', 'none']) {
    await p.click(`[data-list="${l}"]`);
    texts[l] = [await q(`document.querySelector('#bartext').textContent`), await q(`document.querySelectorAll('#bar rect.dim').length`)];
  }
  await p.click('[data-view="all"]'); await p.click('#grid tbody tr[data-id="eu-ai-act"]');
  const r = await q(`({preds: document.querySelectorAll('#preds tbody tr').length, hashes: document.querySelectorAll('#hashes tbody tr').length,
    answer: document.querySelectorAll('#answer p').length, state: document.querySelector('#statecheck').textContent.includes('16 governments'),
    sx: document.documentElement.scrollWidth > window.innerWidth})`);
  const ok = !errs.length && rows === 9 && yesAll === 2 && out === 6 && yesForce === 0 && stockForce === 0 &&
    tallyAll.includes('Of all 9 texts') && tallyAll.includes('2 on the holder') && tallyForce.includes('3 texts') && tallyForce.includes('0 on the holder') &&
    ro.includes('every three months') && ro.includes('not machine-checked') && ro2.includes('acquire, develop, or possess') &&
    texts.eu_code_signatories[0].startsWith('26.8 %') && texts.eu_code_signatories[1] === 1 && texts.paris_call_companies[1] === 3 &&
    texts.holder[1] === 3 && texts.none[0].includes('37.8 %') && texts.none[1] === 0 &&
    r.preds === 7 && r.hashes === 13 && r.answer === 4 && r.state && !r.sx;
  if (!ok) fails++;
  console.log(w, scheme, ok ? 'PASS' : 'FAIL', JSON.stringify({ rows, yesAll, out, yesForce, stockForce, r, texts }), errs.join('; '));
  if (shot) await p.screenshot({ path: path.join(here, shot), fullPage: true });
  await p.close();
}
await b.close(); process.exit(fails ? 1 : 0);
