// Study 72 (second state; verify71.mjs keeps the first): open the page at 1100 px light and 390 px dark; check errors, sideways scroll, the chain's marks per
// point, the four colour modes, a readout, the lists and tables; write process/<n>.png from the light pass.
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
  await p.click('[data-mode="after"]');
  const aft = await q(`({stands: document.querySelectorAll('#chain .mk.c3').length, lifted: document.querySelectorAll('#chain .mk.c1').length, around: document.querySelectorAll('#chain .mk.c2').length, sup: document.querySelectorAll('#chain .mk.c6').length, tally: document.querySelector('#tally').textContent})`);
  await p.click('[data-mode="size"]');
  const size = await q(`({stated: document.querySelectorAll('#chain .mk.c4').length, thr: document.querySelectorAll('#chain .mk.c1').length, tally: document.querySelector('#tally').textContent})`);
  await p.click('#chain .mk[data-id="p1"]');
  const ro4 = await q(`document.querySelector('#readout').textContent`);
  await p.click('#chain .mk[data-id="s9"]');
  const ro5 = await q(`document.querySelector('#readout').textContent`);
  await p.click('[data-mode="who"]');
  const nnew = await q(`document.querySelectorAll('#chain .mk.new').length`);
  const ok = !errs.length && per.chip === 6 && per.site === 10 && per.power === 4 && per.deal === 0 && per.model === 8 && reviews === 4 &&
    shapes.stopped === 14 && shapes.delayed === 4 && shapes.cond === 10 && whoElected === 3 && nnew === 5 &&
    named.on === 8 && named.model === 6 && ground.sec === 6 && ground.data === 6 && ground.tally.includes('0 of 28') && terr.inside === 14 && terr.abroad === 6 &&
    aft.stands === 15 && aft.lifted === 7 && aft.around === 3 && aft.sup === 3 && aft.tally.includes('4</b> stand') === false && aft.tally.includes('Of 14 acts that stopped something, 4 stand') &&
    size.stated === 6 && size.thr === 6 && size.tally.includes('None states chips') &&
    ro.includes('we will not consider or approve Project Blue') && ro.includes('gone around') && ro.includes('without annexation') &&
    ro2.includes('OpenAI') && ro3.includes('Not an act') && ro4.includes('1,920') && ro4.includes('300 MW to 480 MW') && ro5.includes('Google') && ro5.includes('insufficient capacity') &&
    r.answer === 5 && r.notacts === 5 && r.second === 9 && r.preds === 13 && r.failed === 3 && r.hashes === 37 && !r.sx;
  if (!ok) fails++;
  console.log(w, scheme, ok ? 'PASS' : 'FAIL', JSON.stringify({ per, reviews, shapes, whoElected, named: [named.on, named.model], ground: [ground.sec, ground.data], terr, aft: [aft.stands, aft.lifted, aft.around, aft.sup], size: [size.stated, size.thr], nnew, r }), errs.join('; '));
  if (shot) await p.screenshot({ path: path.join(here, shot), fullPage: true });
  await p.close();
}
await b.close(); process.exit(fails ? 1 : 0);
