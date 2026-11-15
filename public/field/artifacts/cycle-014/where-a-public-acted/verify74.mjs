// Study 74 (fourth state, the paper; verify71-73 keep the earlier states and fail on this page by design): open the
// page at 1100 px light and 390 px dark; read every figure this state adds from the page a visitor sees and compare it
// with results74.json; check errors and sideways scroll; write process/4.png from the light pass.
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const N = JSON.parse(fs.readFileSync(path.join(here, 'results74.json'), 'utf8'));
const C = N.counts, A = N.atelier;
const b = await chromium.launch(); let fails = 0;
for (const [w, scheme, shot] of [[1100, 'light', 'process/4.png'], [390, 'dark', 'shot-390.png']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = []; const bad = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForTimeout(300);
  const q = s => p.evaluate(s); const t = s => q(`document.querySelector('${s}').textContent`);
  const want = (name, cond) => { if (!cond) bad.push(name); };
  const shapes = await q(`({n: document.querySelectorAll('#chain .mk:not(.none)').length, stopped: document.querySelectorAll('#chain .mk.stopped').length, delayed: document.querySelectorAll('#chain .mk.delayed').length, cond: document.querySelectorAll('#chain .mk.conditioned').length})`);
  want('marks', shapes.n === C.acts && shapes.stopped === C.by_effect.stopped && shapes.delayed === C.by_effect.delayed && shapes.cond === C.by_effect.conditioned);
  want('model n', (await q(`document.querySelector('#chain .st[data-point="model"] .n').textContent`)) === `${C.per_point.model} acts`);
  const first = await t('#first');
  want('first', first.includes(`${C.stopped_after.stands} of ${C.stopped} stops stand whole and one in part`));
  const ans = await t('#answer');
  want('answer acts', ans.includes(`Of ${C.acts} acts read first-hand`) && ans.includes('(m9)'));
  await p.click('[data-mode="after"]');
  const tal = await t('#tally');
  want('after tally', tal.includes(`${C.stopped_after.stands} stand as stops on 15 November 2026`) && tal.includes(`Over all ${C.acts} acts: ${C.after_all.stands} stand, ${C.after_all['loosened in part']} loosened in part, ${C.after_all.lifted} lifted`));
  want('c2 colour', await q(`document.querySelector('#chain .mk[data-id="c2"]').classList.contains('c4')`));
  await p.click('[data-mode="who"]');
  const la = await t('#lenanswer');
  want('length answer', la.includes(`${A.none_other.n} of ${A.none_other.of}`) && la.includes(`${A.none_model.n} of ${A.none_model.of}`) && la.includes(`(${A.stated_holds_due_ended} of ${A.stated_holds_due})`) && la.includes(`${A.unstated_holds_ended} of ${A.unstated_holds}`));
  const lrows = await q(`[...document.querySelectorAll('#lentable tbody tr')].map(r=>r.cells[2].textContent)`);
  want('length rows', lrows.length === A.rows.length + 1);
  A.rows.forEach((r, i) => want('length row ' + r.id, lrows[i].startsWith(r.after)));
  const rn = await t('#readnow');
  N.passages.filter(x => x.doc === 'NLSTB' || x.doc === 'CNGAI').forEach(x => want('passage ' + x.id, rn.includes(x.text)));
  await p.click('#chain .mk[data-id="s4"]');
  const ro = await t('#readout');
  want('readout s4', ro.includes('Corrected 2026-11-15') && !ro.includes('Flagged by the check') && ro.includes('Het Hogeland'));
  await p.click('#chain .mk[data-id="m9"]');
  const r9 = await t('#readout');
  want('readout m9', r9.includes('Cyberspace Administration of China') && r9.includes('until a condition') && r9.includes('allowed on terms'));
  want('preds', (await q(`document.querySelectorAll('#preds tbody tr').length`)) === 16 && (await t('#predsum')).includes(`Study 74: ${N.predictions_held} held`));
  want('hashes', (await q(`document.querySelectorAll('#hashes tbody tr').length`)) === 41);
  want('paper link', await q(`!!document.querySelector('a[href="../../../presentations/cycle-014/paper.md"]')`));
  const sx = await q(`document.documentElement.scrollWidth > window.innerWidth`);
  want('no sideways scroll', !sx);
  const ok = !errs.length && !bad.length;
  if (!ok) fails++;
  console.log(w, scheme, ok ? 'PASS' : 'FAIL', JSON.stringify(shapes), bad.join(', '), errs.join('; '));
  if (shot) await p.screenshot({ path: path.join(here, shot), fullPage: true });
  await p.close();
}
await b.close(); process.exit(fails ? 1 : 0);
