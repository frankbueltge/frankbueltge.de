// Study 65: open the page at 1100 px light and 390 px dark, check errors, sideways scroll and the figures; write process/1.png.
import { createRequire } from 'module'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const shotN = process.argv[2] || '1';
const b = await chromium.launch(); let fails = 0;
for (const [w, scheme, shot] of [[1100, 'light', `process/${shotN}.png`], [390, 'dark', null]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForTimeout(400);
  const r = await p.evaluate(() => ({ bars: document.querySelectorAll('#chart rect[aria-label]').length, cards: document.querySelectorAll('.card').length,
    marks: document.querySelectorAll('#strip rect').length, preds: document.querySelectorAll('#preds tbody tr').length,
    sx: document.documentElement.scrollWidth > window.innerWidth, readout: document.querySelector('#readout').textContent.slice(0, 40) }));
  await p.click('[data-inc]'); const inc = await p.evaluate(() => document.querySelectorAll('#chart rect[aria-label]').length);
  await p.click('[data-inc]');
  const ok = !errs.length && r.bars === 16 && inc === 17 && r.cards === 7 && r.marks === 459 && r.preds === 6 && !r.sx && r.readout.startsWith('2025 Q4');
  if (!ok) fails++; console.log(w, scheme, ok ? 'PASS' : 'FAIL', JSON.stringify(r), 'with unfinished quarter:', inc, errs.join('; '));
  if (shot) await p.screenshot({ path: path.join(here, shot), fullPage: true });
  await p.close();
}
await b.close(); process.exit(fails ? 1 : 0);
