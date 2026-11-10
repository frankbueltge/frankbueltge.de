// Study 68: open the page at 1100 px light and 390 px dark; check errors, sideways scroll, every figure of
// studies 65-67 (standing clusters, per-year money, the control grid and its readout); write process/<n>.png.
import { createRequire } from 'module'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const shotN = process.argv[2] || '4';
const b = await chromium.launch(); let fails = 0;
for (const [w, scheme, shot] of [[1100, 'light', `process/${shotN}.png`], [390, 'dark', null]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForTimeout(400);
  const r = await p.evaluate(() => ({ bars: document.querySelectorAll('#chart rect[aria-label]').length, cards: document.querySelectorAll('#blind .card').length,
    marks: document.querySelectorAll('#strip rect').length, preds: document.querySelectorAll('#preds tbody tr').length,
    lines: document.querySelectorAll('#use path[data-id]').length, ucards: document.querySelectorAll('#usecards .card').length,
    preds66: document.querySelectorAll('#preds66 tbody tr').length, preds67: document.querySelectorAll('#preds67 tbody tr').length,
    answer: document.querySelectorAll('#answer p').length, div: document.querySelectorAll('#divcards .card').length, preds68: document.querySelectorAll('#preds68 tbody tr').length, dtext: document.querySelector('#dividetext').textContent.includes('1.0 gigawatt'), money: document.querySelectorAll('#moneytable tbody tr').length,
    ctl: document.querySelectorAll('#ctlgrid tr[data-id]').length, ccards: document.querySelectorAll('#ctlcards .card').length,
    readout: document.querySelector('#ctlreadout').textContent.includes('regulatory agency'), corr: document.querySelector('#corr67').textContent.includes('12.7 % public'),
    usetext: document.querySelector('#usetext').textContent.split(' ')[0], sx: document.documentElement.scrollWidth > window.innerWidth }));
  await p.click('[data-ctl="silent"]'); const silent = await p.evaluate(() => document.querySelectorAll('#ctlgrid tr[data-id]').length);
  await p.click('[data-ctl="said"]'); const said = await p.evaluate(() => document.querySelectorAll('#ctlgrid tr[data-id]').length);
  await p.click('[data-ctl="all"]'); await p.focus('#ctlgrid tr[data-id="A15"]'); const ro = await p.evaluate(() => document.querySelector('#ctlreadout').textContent.includes('90 days'));
  await p.focus('#ctlgrid tr[data-id="A05"]');
  const s1rect = await p.evaluate(() => document.querySelectorAll('#divide rect').length);
  await p.click('[data-div="both"]'); const bothrect = await p.evaluate(() => document.querySelectorAll('#divide rect').length);
  const bt = await p.evaluate(() => document.querySelector('#dividetext').textContent.includes('300 megawatts'));
  await p.click('[data-div="s1"]');
  const ok = !errs.length && r.bars === 16 && r.cards === 7 && r.marks === 425 && r.preds === 6 && r.lines === 21 && r.ucards === 4 &&
    r.preds66 === 6 && r.preds67 === 7 && r.answer === 7 && r.div === 3 && r.preds68 === 4 && r.dtext && s1rect === 1 && bothrect === 2 && bt && r.money === 17 && r.ctl === 19 && r.ccards === 4 && r.readout && r.corr &&
    r.usetext === '11' && silent === 13 && said === 6 && ro && !r.sx;
  if (!ok) fails++; console.log(w, scheme, ok ? 'PASS' : 'FAIL', JSON.stringify(r), 'silent', silent, 'said', said, 'A15', ro, 'div', s1rect, bothrect, bt, errs.join('; '));
  if (shot) await p.screenshot({ path: path.join(here, shot), fullPage: true });
  await p.close();
}
await b.close(); process.exit(fails ? 1 : 0);
