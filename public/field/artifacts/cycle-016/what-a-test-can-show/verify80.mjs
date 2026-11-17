// Study 80 (first state): open the page at 1100 px light and 390 px dark; read every figure from the page a visitor
// sees and compare it with results80.json and with counts recomputed here from coding80.json and sentences80.json;
// check errors and sideways scroll; write process/1.png from the light pass (NOSHOT=1 skips it).
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const R = JSON.parse(fs.readFileSync(path.join(here, 'results80.json'), 'utf8'));
const S = JSON.parse(fs.readFileSync(path.join(here, 'sentences80.json'), 'utf8'));
const C = JSON.parse(fs.readFileSync(path.join(here, 'coding80.json'), 'utf8')).rows;
// recomputed here, not taken from the results
const kept = C.filter(r => r.about); const cnt = k => kept.reduce((a, r) => (a[r[k]] = (a[r[k]] || 0) + 1, a), {});
const g = cnt('grade'), t = cnt('tests');
const keptIds = new Set(kept.map(r => r.id));
const isInd = refs => refs.some(x => x.endsWith('*'));
const eC = S.sentences.filter(s => keptIds.has(s.id) && s.refs.length), rC = S.sentences.filter(s => !keptIds.has(s.id) && s.refs.length);
const eI = eC.filter(s => isInd(s.refs)).length, rI = rC.filter(s => isInd(s.refs)).length;
const passRows = kept.filter(r => r.pass); const dev = passRows.filter(r => r.setter === 'developer').length;
const b = await chromium.launch(); let fails = 0;
for (const [w, scheme, shot] of [[1100, 'light', 'process/1.png'], [390, 'dark', 'shot-390.png']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = []; const bad = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForTimeout(300);
  const q = s => p.evaluate(s); const tx = s => q(`document.querySelector('${s}').textContent`);
  const want = (name, cond) => { if (!cond) bad.push(name); };
  const a1 = await tx('#a1');
  want('a1', a1.includes(`Of ${S.sentences.length.toLocaleString('en-GB')} sentences`) && a1.includes(`${kept.length} speak of evaluating`) && a1.includes(`${g.measured} report a measured`) && a1.includes(`${g.open} say what evaluation cannot`) && a1.includes(`and ${g.inferred} state or infer`));
  const a2 = await tx('#a2');
  const oc = kept.filter(r => r.tests === 'control' && r.grade === 'open').length, op = kept.filter(r => r.tests === 'capability' && r.grade === 'open').length;
  want('a2', a2.includes(`capability in ${t.capability}`) && a2.includes(`control in ${t.control}`) && a2.includes(`safeguards in ${t.safeguards}`) && a2.includes(`practice in ${t.general}`) && a2.includes(`in ${oc} of ${t.control} sentences on control`) && a2.includes(`in ${op} of ${t.capability} on capability`));
  const a3 = await tx('#a3');
  want('a3', a3.includes(`${eI} of the ${eC.length} cited sentences`) && a3.includes(`(${(100 * eI / eC.length).toFixed(1)} %)`) && a3.includes(`${rI} of ${rC.length.toLocaleString('en-GB')} in the rest`) && a3.includes(`(${(100 * rI / rC.length).toFixed(1)} %)`) && a3.includes(`${R.cited.difference_ci[0]} to ${R.cited.difference_ci[1]}`));
  want('a4', (await tx('#a4')).includes(`${passRows.length} sentences name a pass mark. ${dev} say a developer`));
  // the grid: one square per kept sentence, in every mode; the legend counts add up and match
  for (const [m, k, src] of [['grade', 'grade', g], ['tests', 'tests', t]]) {
    await p.click(`[data-mode="${m}"]`);
    want('squares ' + m, (await q(`document.querySelectorAll('#grid rect.sq').length`)) === kept.length);
    const leg = await q(`Object.fromEntries([...document.querySelectorAll('#legend button')].map(b=>[b.dataset.cat,Number(b.dataset.n)]))`);
    for (const c of Object.keys(src)) want(`legend ${m} ${c}`, leg[c] === src[c]);
  }
  await p.click('[data-mode="footing"]');
  const legF = await q(`[...document.querySelectorAll('#legend button')].reduce((a,b)=>a+Number(b.dataset.n),0)`);
  want('legend footing', legF === kept.length);
  // the strip: one tall hair per kept sentence
  want('strip', (await q(`document.querySelectorAll('#strip rect[data-id]').length`)) === kept.length);
  // a square read out: sentence 1131 is quoted whole and coded as the coding file says
  await p.click('[data-mode="grade"]'); await p.click('#grid rect.sq[data-id="1131"]');
  const ro = await tx('#readout'); const s1131 = S.sentences.find(s => s.id === 1131); const c1131 = C.find(r => r.id === 1131);
  want('readout', ro.includes(s1131.text) && ro.includes(`Page ${s1131.page}`) && ro.includes(`Rests on: ${c1131.grade}`));
  // the bars
  const sh = await q(`[...document.querySelectorAll('#bars rect')].map(r=>Number(r.dataset.share))`);
  want('bars', sh[0] === R.cited.evaluation_share && sh[1] === R.cited.rest_share && Math.abs(sh[0] - 100 * eI / eC.length) < 0.06);
  // the pass marks
  const pr = await q(`[...document.querySelectorAll('#pass tbody tr')].map(r=>[Number(r.dataset.id),r.dataset.setter])`);
  want('pass rows', pr.length === passRows.length && pr.every(([id, st]) => C.find(r => r.id === id).setter === st));
  want('no public body', !pr.some(([, st]) => st === 'public body'));
  // the predictions
  const res = await q(`[...document.querySelectorAll('#preds tbody tr')].map(r=>r.cells[2].textContent)`);
  want('preds', res.join() === ['P117', 'P118', 'P119'].map(k => R.predictions[k] === true ? 'held' : (R.predictions[k] === false ? 'failed' : 'uninformative')).join());
  want('P117 recomputed', (100 * eI / eC.length - 100 * rI / rC.length >= 10) === R.predictions.P117);
  want('P118 recomputed', (oc / t.control >= 2 * op / t.capability) === R.predictions.P118);
  want('P119 recomputed', (dev >= 2 * passRows.length / 3 && !passRows.some(r => r.setter === 'public body')) === R.predictions.P119);
  want('predsum', (await tx('#predsum')).includes(`${R.predictions_held} of 3 held`));
  want('set aside', (await tx('#cutSum')).startsWith(`${C.length - kept.length} candidate sentences`));
  want('sha', (await tx('#sha')) === R.report.sha256);
  want('no sideways scroll', !(await q(`document.documentElement.scrollWidth > window.innerWidth`)));
  const ok = !errs.length && !bad.length; if (!ok) fails++;
  console.log(w, scheme, ok ? 'PASS' : 'FAIL', bad.join(', '), errs.join('; '));
  if (shot && !process.env.NOSHOT) { fs.mkdirSync(path.join(here, 'process'), { recursive: true }); await p.screenshot({ path: path.join(here, shot), fullPage: true }); }
  await p.close();
}
await b.close(); process.exit(fails ? 1 : 0);
