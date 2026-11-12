// Study 71: open the page at 1100 px light and 390 px dark; check errors, sideways scroll, the chain's marks per
// point, the four colour modes, a readout, the lists and tables; write process/<n>.png from the light pass.
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
  const n = k => q(`document.querySelectorAll('#chain .st[data-point="${k}"] .mk:not(.none)').length`);
  const per = { chip: await n('chip'), site: await n('site'), power: await n('power'), deal: await n('deal'), model: await n('model') };
  const reviews = await q(`document.querySelectorAll('#chain .st[data-point="deal"] .mk.none').length`);
  const shapes = await q(`({stopped: document.querySelectorAll('#chain .mk.stopped').length, delayed: document.querySelectorAll('#chain .mk.delayed').length, cond: document.querySelectorAll('#chain .mk.conditioned').length})`);
  const whoElected = await q(`document.querySelectorAll('#chain .mk.c1').length`);
  await p.click('[data-mode="named"]');
  const named = await q(`({on: document.querySelectorAll('#chain .mk.c5').length, model: document.querySelectorAll('#chain .st[data-point="model"] .mk.c5').length, tally: document.querySelector('#tally').textContent})`);
  await p.click('[data-mode="ground"]');
  const ground = await q(`({sec: document.querySelectorAll('#chain .st[data-point="chip"] .mk.c5').length, data: document.querySelectorAll('#chain .st[data-point="model"] .mk.c4').length, tally: document.querySelector('#tally').textContent})`);
  await p.click('[data-mode="terr"]');
  const terr = await q(`({inside: document.querySelectorAll('#chain .mk.c1').length, abroad: document.querySelectorAll('#chain .mk.c5').length})`);
  await p.click('#chain .mk[data-id="s1"]');
  const ro = await q(`document.querySelector('#readout').textContent`);
  await p.click('#chain .mk[data-id="m1"]');
  const ro2 = await q(`document.querySelector('#readout').textContent`);
  await p.click('#chain .mk[data-id="d1"]');
  const ro3 = await q(`document.querySelector('#readout').textContent`);
  await p.click('[data-mode="who"]');
  const r = await q(`({answer: document.querySelectorAll('#answer p').length, notacts: document.querySelectorAll('#notacts li').length, second: document.querySelectorAll('#second li').length,
    preds: document.querySelectorAll('#preds tbody tr').length, failed: document.querySelectorAll('#preds td.failed').length, hashes: document.querySelectorAll('#hashes tbody tr').length,
    sx: document.documentElement.scrollWidth > window.innerWidth})`);
  const ok = !errs.length && per.chip === 6 && per.site === 8 && per.power === 3 && per.deal === 0 && per.model === 6 && reviews === 4 &&
    shapes.stopped === 12 && shapes.delayed === 4 && shapes.cond === 7 && whoElected === 3 &&
    named.on === 5 && named.model === 5 && named.tally.includes('all 5 sit at the model point') &&
    ground.sec === 6 && ground.data === 6 && ground.tally.includes('0 of 23') && terr.inside === 11 && terr.abroad === 6 &&
    ro.includes('we will not consider or approve Project Blue') && ro.includes('elected body') &&
    ro2.includes('OpenAI') && ro2.includes('four weeks later') && ro3.includes('Not an act') &&
    r.answer === 5 && r.notacts === 5 && r.second === 9 && r.preds === 7 && r.failed === 2 && r.hashes === 28 && !r.sx;
  if (!ok) fails++;
  console.log(w, scheme, ok ? 'PASS' : 'FAIL', JSON.stringify({ per, reviews, shapes, whoElected, named: [named.on, named.model], ground: [ground.sec, ground.data], terr, r }), errs.join('; '));
  if (shot) await p.screenshot({ path: path.join(here, shot), fullPage: true });
  await p.close();
}
await b.close(); process.exit(fails ? 1 : 0);
