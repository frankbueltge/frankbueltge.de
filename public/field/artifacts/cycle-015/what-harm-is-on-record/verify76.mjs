// Superseded for the page from state 3 (2026-11-15, session 275): the page now shows the checked figures, asserted by
// verify77.mjs. This file asserted state 2 as committed in session 274 and is kept as it ran; do not run it against a later page
// (it would also overwrite process/2.png).
// Study 76 (second state): open the page at 1100 px light and 390 px dark; read the new figures from the page a
// visitor sees and compare them with results76.json and coding76.json; check errors and sideways scroll; write
// process/2.png from the light pass. Study 75's own checks stay in verify75.mjs (run with NOSHOT=1 so it keeps 1.png).
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const R = JSON.parse(fs.readFileSync(path.join(here, 'results76.json'), 'utf8'));
const C = JSON.parse(fs.readFileSync(path.join(here, 'coding76.json'), 'utf8'));
const A = R.A, B = R.B;
const b = await chromium.launch(); let fails = 0;
for (const [w, scheme, shot] of [[1100, 'light', 'process/2.png'], [390, 'dark', 'shot-390.png']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = []; const bad = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForTimeout(300);
  const q = s => p.evaluate(s); const t = s => q(`document.querySelector('${s}').textContent`);
  const want = (name, cond) => { if (!cond) bad.push(name); };
  const a4 = await t('#a4'), a5 = await t('#a5');
  want('a4', a4.includes(`the harmed wrote ${A.harmed} of the ${A.n} `) && a4.includes(`(${A.harmed_pct_readable} % of the ${A.readable} readable`) &&
    a4.includes(`witnesses ${A.codes.witness}, the maker ${A.codes.maker}, the database's own note ${A.codes['record note']}`) &&
    a4.includes(`at least ${A.harmed} of ${A.all_first_reports.toLocaleString('en-GB')} incidents (${A.harmed_first_pct_all} %)`));
  want('a5', a5.includes(`Of the ${B.n} incidents`) && a5.includes(`answered in ${B.maker_responded} (${B.maker_pct} %)`) &&
    a5.includes(`acted in ${B.public_body_acted} (${B.public_pct} %)`) && a5.includes(`${B.act_target.user} of those ${B.public_body_acted} acts`) &&
    a5.includes(`and ${B.act_target.maker} on a developer or deployer`) && a5.includes(`Of the ${B.public_classified} acted-on incidents the record has classified, ${B.public_in_domain7} concerns`));
  // Part A: squares against the coding file, legend against the results
  const sqA = await q(`[...document.querySelectorAll('#figA rect.sq')].map(r=>[Number(r.dataset.id),r.dataset.code])`);
  want('A squares', sqA.length === C.A.length && C.A.every((a, i) => sqA[i][0] === a.id && sqA[i][1] === a.code));
  const legA = await q(`Object.fromEntries([...document.querySelectorAll('#legendA span')].map(s=>[s.dataset.cat,Number(s.dataset.n)]))`);
  for (const k of Object.keys(A.codes)) want('legendA ' + k, legA[k] === A.codes[k]);
  await p.click('#figA rect.sq[data-id="313"]');
  want('readoutA', (await t('#readoutA')).includes('Incident 313') && (await t('#readoutA')).includes('the harmed'));
  // Part B: squares and legends in each mode
  const count = (fn) => C.B.filter(fn).length;
  const exp = {
    who: { P: B.public_body_acted, M: count(x => !x.codes.includes('P') && x.codes.includes('M')), O: count(x => !x.codes.includes('P') && !x.codes.includes('M')) },
    whom: { maker: B.act_target.maker, user: B.act_target.user, none: B.n - B.public_body_acted },
  };
  for (const m of ['who', 'whom', 'where']) {
    await p.click(`[data-modeb="${m}"]`);
    const n = await q(`document.querySelectorAll('#figB rect.sq').length`);
    want('B squares ' + m, n === B.n);
    const leg = await q(`Object.fromEntries([...document.querySelectorAll('#legendB span')].map(s=>[s.dataset.cat,Number(s.dataset.n)]))`);
    want('B legend sum ' + m, Object.values(leg).reduce((a, v) => a + v, 0) === B.n);
    if (exp[m]) for (const k of Object.keys(exp[m])) want(`B legend ${m} ${k}`, leg[k] === exp[m][k]);
    if (m === 'where') for (const k of Object.keys(B.by_domain)) want('B domain ' + k, leg[k] === B.by_domain[k].n);
    const sqs = await q(`Object.fromEntries([...document.querySelectorAll('#figB rect.sq')].map(r=>[r.dataset.id,r.dataset.cat]))`);
    if (m === 'whom') want('B targets', C.B.every(x => sqs[x.id] === (x.act_target || 'none')));
  }
  want('tallyB where', (await t('#tallyB')).includes(`${B.by_domain['7'].n} answered incidents, the maker in ${B.by_domain['7'].M}, a public body in ${B.by_domain['7'].P}`));
  await p.click('[data-modeb="whom"]');
  want('tallyB whom', (await t('#tallyB')).includes(`Of ${B.public_body_acted} public acts: ${B.act_target.user} on the person`));
  await p.click('#figB rect.sq[data-id="1677"]');
  want('readoutB', (await t('#readoutB')).includes('Incident 1677') && (await t('#readoutB')).includes('acting for the maker'));
  await p.click('[data-modeb="who"]');
  want('tallyB who', (await t('#tallyB')).includes(`the maker answered in ${B.maker_responded}, a public body acted in ${B.public_body_acted}, others in ${B.other_responded}`));
  const pr = await q(`[...document.querySelectorAll('#preds tbody tr')].map(r=>[r.cells[0].textContent,r.cells[2].textContent.split(' ')[0]])`);
  want('preds rows', pr.length === 6);
  for (const k of ['P108', 'P109', 'P110']) want('pred ' + k, (pr.find(x => x[0] === k) || [])[1] === (R.predictions[k] ? 'held' : 'failed'));
  want('predsum', (await t('#predsum')).includes(`Study 76: ${R.predictions_held} of 3 held`));
  want('no sideways scroll', !(await q(`document.documentElement.scrollWidth > window.innerWidth`)));
  const ok = !errs.length && !bad.length; if (!ok) fails++;
  console.log(w, scheme, ok ? 'PASS' : 'FAIL', bad.join(', '), errs.join('; '));
  if (shot) await p.screenshot({ path: path.join(here, shot), fullPage: true });
  await p.close();
}
await b.close(); process.exit(fails ? 1 : 0);
