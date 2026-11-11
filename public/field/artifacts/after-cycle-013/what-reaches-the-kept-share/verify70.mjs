// Study 70: open the page at 1100 px light and 390 px dark; check errors, sideways scroll, study 69's grid, and the
// ladder: its two views, a row's readout, the party marks; write process/<n>.png from the light pass.
import { createRequire } from 'module'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const shotN = process.argv[2] || '2';
const b = await chromium.launch(); let fails = 0;
for (const [w, scheme, shot] of [[1100, 'light', `process/${shotN}.png`], [390, 'dark', 'shot-390.png']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForTimeout(300);
  const q = s => p.evaluate(s);
  const old = await q(`({rows: document.querySelectorAll('#grid tbody tr').length, preds: document.querySelectorAll('#preds tbody tr').length,
    answer: document.querySelectorAll('#answer p').length, bar: document.querySelectorAll('#bar rect').length})`);
  const filled = s => q(`document.querySelectorAll('#ladder tbody tr[data-id="${s}"] .cell.yes').length`);
  const all = { eu: await filled('eu-ai-act'), ca: await filled('ca-sb53'), us: await filled('us-export') };
  const penalty = await q(`[...document.querySelectorAll('#ladder [data-rung="penalty"]')].map(e=>e.textContent).join('|')`);
  const tallyAll = await q(`document.querySelector('#tally70').textContent`);
  await p.click('#ladder tbody tr[data-id="ca-sb53"]');
  const ro = await q(`document.querySelector('#readout70').textContent`);
  await p.click('#ladder tbody tr[data-id="us-export"]');
  const ro2 = await q(`document.querySelector('#readout70').textContent`);
  const marks = await q(`({n: document.querySelectorAll('#parties .pm').length, ring: document.querySelectorAll('#parties .pm.ring').length, sq: document.querySelectorAll('#parties .pm.sq').length, plea: document.querySelectorAll('#parties .pm.plea').length})`);
  await p.click('#parties .pm[data-id="u3|Hao Global LLC"]');
  const use = await q(`document.querySelector('#use70').textContent`);
  await p.click('#parties .pm[data-id="u7|OpenAI"]'); const use2 = await q(`document.querySelector('#use70').textContent`); if (!use2.includes('subpoena')) fails++;
  await p.click('[data-who="frontier"]');
  const fr = { us: await filled('us-export'), dim: await q(`document.querySelectorAll('#parties .pm.dim').length`),
    tally: await q(`document.querySelector('#tally70').textContent`), caInq: await q(`document.querySelector('#ladder tbody tr[data-id="ca-sb53"] [data-rung="inquiry"]').textContent`) };
  await p.click('[data-who="all"]');
  const r = await q(`({preds: document.querySelectorAll('#preds70 tbody tr').length, hashes: document.querySelectorAll('#hashes tbody tr').length,
    scale: document.querySelector('#scale70').textContent, sx: document.documentElement.scrollWidth > window.innerWidth})`);
  const ok = !errs.length && old.rows === 9 && old.preds === 7 && old.answer === 5 && old.bar === 4 &&
    all.eu === 1 && all.ca === 1 && all.us === 4 && penalty === 'none found|none found|none found' &&
    tallyAll.includes('14 parties') && tallyAll.includes('5 announcements') && tallyAll.includes('2 guilty pleas') &&
    ro.includes('brought only by the Attorney General') && ro.includes('not machine-checked') && ro.includes('consequence, gated') &&
    ro2.includes('The Secretary may impose') && ro2.includes('shall be fined') &&
    marks.n === 15 && marks.ring === 1 && marks.sq === 1 && marks.plea === 2 && use.includes('pleas of 2025-10-10') &&
    fr.us === 1 && fr.dim === 14 && fr.tally.includes('0 charges') && fr.caInq.includes('no statute named') &&
    r.preds === 7 && r.hashes === 27 && r.scale.includes('0.0045 %') && r.scale.includes('24 minutes') && !r.sx;
  if (!ok) fails++;
  console.log(w, scheme, ok ? 'PASS' : 'FAIL', JSON.stringify({ old, all, penalty, marks, fr, r, use }), errs.join('; '));
  if (shot) await p.screenshot({ path: path.join(here, shot), fullPage: true });
  await p.close();
}
await b.close(); process.exit(fails ? 1 : 0);
