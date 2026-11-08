// Study 66: open the page at 1100 px light and 390 px dark; check errors, sideways scroll, the study-65 figures
// and the new use figure (one line per agreement, three units, a readout with its passage); write process/<n>.png.
import { createRequire } from 'module'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const shotN = process.argv[2] || '2';
const b = await chromium.launch(); let fails = 0;
for (const [w, scheme, shot] of [[1100, 'light', `process/${shotN}.png`], [390, 'dark', null]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForTimeout(400);
  const r = await p.evaluate(() => ({ bars: document.querySelectorAll('#chart rect[aria-label]').length, cards: document.querySelectorAll('#blind .card').length,
    marks: document.querySelectorAll('#strip rect').length, preds: document.querySelectorAll('#preds tbody tr').length,
    lines: document.querySelectorAll('#use path[data-id]').length, ucards: document.querySelectorAll('#usecards .card').length,
    preds66: document.querySelectorAll('#preds66 tbody tr').length, answer: document.querySelectorAll('#answer p').length,
    readout: document.querySelector('#usereadout').textContent.includes('Colossus'),
    sx: document.documentElement.scrollWidth > window.innerWidth }));
  const units = [];
  for (const u of ['gw', 'chips', 'usd_bn']) { await p.click(`[data-unit="${u}"]`); units.push(await p.evaluate(() => document.querySelector('#usetext').textContent.split(' ')[0])); }
  await p.focus('#use path[data-id="A01"]'); const ro = await p.evaluate(() => document.querySelector('#usereadout').textContent.includes('$250B'));
  await p.focus('#use path[data-id="A15"]');
  const ok = !errs.length && r.bars === 16 && r.cards === 7 && r.marks === 459 && r.preds === 6 && r.lines === 21 && r.ucards === 4 &&
    r.preds66 === 6 && r.answer === 5 && r.readout && ro && units.join() === '9,3,13' && !r.sx;
  if (!ok) fails++; console.log(w, scheme, ok ? 'PASS' : 'FAIL', JSON.stringify(r), 'units', units.join(), 'readout A01', ro, errs.join('; '));
  if (shot) await p.screenshot({ path: path.join(here, shot), fullPage: true });
  await p.close();
}
await b.close(); process.exit(fails ? 1 : 0);
