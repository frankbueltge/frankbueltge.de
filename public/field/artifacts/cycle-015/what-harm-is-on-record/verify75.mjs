// Study 75 (first state): open the page at 1100 px light and 390 px dark; read every figure from the page a visitor
// sees and compare it with results75.json; check errors and sideways scroll; write process/1.png from the light pass.
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const R = JSON.parse(fs.readFileSync(path.join(here, 'results75.json'), 'utf8'));
const F = R.first_reporter, nf = R.incidents_with_first_report;
const b = await chromium.launch(); let fails = 0;
for (const [w, scheme, shot] of [[1100, 'light', 'process/1.png'], [390, 'dark', 'shot-390.png']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = []; const bad = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForTimeout(300);
  const q = s => p.evaluate(s); const t = s => q(`document.querySelector('${s}').textContent`);
  const want = (name, cond) => { if (!cond) bad.push(name); };
  const a1 = await t('#a1');
  want('a1', a1.includes(`Of ${nf.toLocaleString('en-GB')} incidents`) && a1.includes(`wrote it in ${F.maker} `) && a1.includes(`a public body in ${F['public body']} `) && a1.includes(`platform, where a harmed person could write without an editor, in ${F['self-published']} `));
  want('a2', (await t('#a2')).includes(`${R.maker_pct_domain7} %`) && (await t('#a2')).includes(`(${R.maker_pct_classified} %)`));
  want('a3', (await t('#a3')).includes(`${R.acts_matched} meet an incident`) && (await t('#a3')).includes(`${R.incidents_with_response_report} incidents`));
  // the bars: segments summed over the figure equal the incidents with a year, in every mode
  const withYear = Object.entries(R.years).filter(([y]) => y !== 'null').reduce((a, [, v]) => a + v, 0);
  for (const m of ['who', 'where', 'acted']) {
    await p.click(`[data-mode="${m}"]`);
    const sum = await q(`[...document.querySelectorAll('#fig .seg')].reduce((a,r)=>a+Number(r.getAttribute('aria-label').split(': ')[1]),0)`);
    want('bars ' + m, sum === withYear);
    const leg = await q(`[...document.querySelectorAll('#legend span')].reduce((a,s)=>a+Number(s.dataset.n),0)`);
    want('legend ' + m, leg === R.incidents);
  }
  await p.click('[data-mode="who"]');
  const leg = await q(`Object.fromEntries([...document.querySelectorAll('#legend span')].map(s=>[s.dataset.cat,Number(s.dataset.n)]))`);
  for (const k of Object.keys(F)) want('legend ' + k, leg[k] === F[k]);
  await p.click('[data-mode="acted"]');
  want('legend act', (await q(`Number(document.querySelector('#legend span[data-cat="act"]').dataset.n)`)) === R.incidents_matched.length);
  await p.click('#fig .seg[data-year="2023"]');
  want('readout', (await t('#readout')).includes('incident 513 (acts m1,m2)'));
  const acts = await q(`[...document.querySelectorAll('#acts tbody tr')].map(r=>[r.dataset.id,r.cells[4].textContent])`);
  want('acts rows', acts.length === 29);
  R.acts.forEach((a, i) => want('act ' + a.id, acts[i][0] === a.id && (a.match ? acts[i][1].startsWith('#' + a.match) : acts[i][1].startsWith('none'))));
  const pr = await q(`[...document.querySelectorAll('#preds tbody tr')].map(r=>r.cells[2].textContent.split(' ')[0])`);
  want('preds', pr.slice(0, 3).join() === ['P105', 'P106', 'P107'].map(k => R.predictions[k] ? 'held' : 'failed').join());
  want('predsum', (await t('#predsum')).includes(`${R.predictions_held} of 3 held`));
  want('sha', (await t('#sha')) === R.snapshot.sha256);
  want('no sideways scroll', !(await q(`document.documentElement.scrollWidth > window.innerWidth`)));
  const ok = !errs.length && !bad.length; if (!ok) fails++;
  console.log(w, scheme, ok ? 'PASS' : 'FAIL', bad.join(', '), errs.join('; '));
  await p.click('[data-mode="who"]');
  if (shot && !process.env.NOSHOT) await p.screenshot({ path: path.join(here, shot), fullPage: true });
  await p.close();
}
await b.close(); process.exit(fails ? 1 : 0);
