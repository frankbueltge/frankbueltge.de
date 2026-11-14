// Study 73 (third state, the check; verify71/72 keep the earlier states): open the page at 1100 px light and 390 px
// dark; read every figure the check adds from the page a visitor sees and compare it with results73.json; check errors
// and sideways scroll; write process/3.png from the light pass.
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const K = JSON.parse(fs.readFileSync(path.join(here, 'results73.json'), 'utf8'));
const b = await chromium.launch(); let fails = 0;
for (const [w, scheme, shot] of [[1100, 'light', 'process/3.png'], [390, 'dark', 'shot-390.png']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = []; const bad = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForTimeout(300);
  const q = s => p.evaluate(s); const t = s => q(`document.querySelector('${s}').textContent`);
  const want = (name, cond) => { if (!cond) bad.push(name); };
  // marks: the corrected effects are what the chain draws
  const shapes = await q(`({stopped: document.querySelectorAll('#chain .mk.stopped').length, delayed: document.querySelectorAll('#chain .mk.delayed').length, cond: document.querySelectorAll('#chain .mk.conditioned').length})`);
  want('shapes', shapes.stopped === K.counts.stopped && shapes.delayed === K.counts.delayed && shapes.cond === K.counts.conditioned);
  // the agreement table, cell by cell against the results
  const rows = await q(`[...document.querySelectorAll('#agree tbody tr')].map(r=>[...r.cells].map(c=>c.textContent.trim()))`);
  const ag = Object.values(K.agreement);
  want('agree rows', rows.length === ag.length);
  rows.forEach((r, i) => want('agree ' + i, +r[1] === ag[i].agree && +r[2] === ag[i].compared && (ag[i].kappa == null ? r[3] === '' : +r[3] === ag[i].kappa)));
  want('corrections', await q(`document.querySelectorAll('#corrs .corr').length`) === K.corrections.length);
  want('kept', await q(`document.querySelectorAll('#kept .flag').length`) === K.disagreements.filter(d => d.kept !== 'second').length);
  const mrows = await q(`[...document.querySelectorAll('#matters tbody tr')].map(r=>r.cells[3].textContent)`);
  want('matters', mrows.length === K.counts.matters);
  K.matters.forEach((m, i) => want('matter ' + m.matter, mrows[i].startsWith(m.state) && (m.age_days == null || mrows[i].includes(m.age_days + ' days'))));
  const first = await t('#first');
  want('first', first.includes(`${K.counts.stopped_after.stands} of ${K.counts.stopped} stops stand`) && first.includes('inquiry'));
  const ans = await t('#answer');
  const ms = K.counts.matter_states;
  want('answer matters', ans.includes(`of ${K.counts.matters_with_hold} matters with a stop or a pause, ${ms['stop stands']} stops stand, ${ms['pause running']} pauses run, ${ms['ended on terms']} ended on terms`));
  want('answer output', ans.includes(`${K.counts.model_output.length} rest in part on what a model outputs, the first in March 2023`));
  want('answer power', !ans.includes('at the grid'));
  await p.click('[data-mode="after"]');
  want('after tally', (await t('#tally')).includes(`Of ${K.counts.stopped} acts that stopped something`) && (await t('#tally')).includes(`${K.counts.stopped_after.stands} stand as stops`));
  await p.click('[data-mode="ground"]');
  want('ground tally', (await t('#tally')).includes(`${K.counts.model_output.length} rest, at least in part`));
  await p.click('#chain .mk[data-id="m1"]');
  const ro = await t('#readout');
  want('readout m1', ro.includes('Corrected 2026-11-14') && ro.includes('ChatGPT in Italy') && ro.includes('delayed'));
  await p.click('#chain .mk[data-id="s4"]');
  want('readout s4', (await t('#readout')).includes('Flagged by the check'));
  const studio = await t('#studio');
  want('studio', studio.includes('21.7 million') && studio.includes('ceiling'));
  const chase = await t('#chase');
  want('chase', chase.includes('Requests for Information') && chase.includes('1112'));
  await p.click('[data-mode="who"]');
  const sx = await q(`document.documentElement.scrollWidth > window.innerWidth`);
  want('no sideways scroll', !sx);
  const ok = !errs.length && !bad.length;
  if (!ok) fails++;
  console.log(w, scheme, ok ? 'PASS' : 'FAIL', JSON.stringify({ shapes, agreeRows: rows.length, matters: mrows.length }), bad.join(', '), errs.join('; '));
  if (shot) await p.screenshot({ path: path.join(here, shot), fullPage: true });
  await p.close();
}
await b.close(); process.exit(fails ? 1 : 0);
