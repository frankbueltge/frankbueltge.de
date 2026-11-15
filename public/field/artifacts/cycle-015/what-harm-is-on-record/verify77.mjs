// Check 77 (third state): open the page at 1100 px light and 390 px dark; read the checked figures from the page a
// visitor sees and compare them with results77.json, check77/*.json and coding76.json; check errors and sideways
// scroll; write process/3.png from the light pass. Study 75's own checks stay in verify75.mjs (run with NOSHOT=1).
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const J = f => JSON.parse(fs.readFileSync(path.join(here, f), 'utf8'));
const R = J('results77.json'), C = J('coding76.json'), S = J('check77/second-coding.json'), PS = J('check77/press-sample.json'), ADJ = J('check77/adjudication.json');
const A = R.A, B = R.B, P = R.press, W = R.whole_record, K = R.critique;
const en = n => n.toLocaleString('en-GB');
// independent recount from the coding files (not from results77.json)
const first = Object.fromEntries(C.B.map(b => [b.id, b])), second = Object.fromEntries(S.B.map(b => [b.id, b]));
const admit = new Set(ADJ.B_public_act.filter(x => x.admit).map(x => x.id));
const finalP = C.B.map(b => b.id).filter(i => (first[i].codes.includes('P') && second[i].codes.includes('P')) || admit.has(i));
const tgt = i => admit.has(i) ? ADJ.B_public_act.find(x => x.id === i).target : first[i].act_target;
const nUser = finalP.filter(i => tgt(i) === 'user').length, nMaker = finalP.filter(i => tgt(i) === 'maker').length;
const pressHarmed = PS.items.filter(x => x.code === 'harmed').length;
const b = await chromium.launch(); let fails = 0;
for (const [w, scheme, shot] of [[1100, 'light', 'process/3.png'], [390, 'dark', 'shot-390.png']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = []; const bad = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForTimeout(300);
  const q = s => p.evaluate(s); const t = s => q(`document.querySelector('${s}').textContent`);
  const want = (name, cond) => { if (!cond) bad.push(name); };
  want('recount P', finalP.length === B.public_final && nUser === B.target.user && nMaker === B.target.maker && pressHarmed === P.harmed);
  const a2 = await t('#a2'), a4 = await t('#a4'), a5 = await t('#a5'), a6 = await t('#a6'), a7 = await t('#a7');
  want('a2', a2.includes(`wrote first in ${K.maker_domain7[0]} (`) && a2.includes(`against ${K.maker_classified[0]} of ${en(K.maker_classified[1])}`) && a2.includes(`${K.maker_first_2026[0]} of ${K.maker_first_2026[1]} incidents, against ${K.maker_first_before_2026[0]} of ${en(K.maker_first_before_2026[1])} before`));
  want('a4', a4.includes(`the harmed wrote ${A.final_harmed} of the 58 `) && a4.includes(`agree on ${A.agreement.agree} of ${A.agreement.n}; ${A.final_harmed_firm} without`) &&
    a4.includes(`draw of ${P.drawn} of the ${en(P.population)} `) && a4.includes(`the harmed wrote ${pressHarmed} of them (${P.harmed_pct} %, between ${P.ci95_pct[0]} and ${P.ci95_pct[1]})`) &&
    a4.includes(`an estimated ${W.estimate} of ${en(R.all_first_reports)} incidents (${W.estimate_pct} %; between ${W.estimate_ci[0]} and ${W.estimate_ci[1]})`));
  want('a5', a5.includes(`acted in ${finalP.length} (${B.public_final_pct} %)`) && a5.includes(`found ${B.public_first}; `) && a5.includes(`the same ${B.counts.P.both} and ${B.second_only.length} more, of which ${admit.size} hold`) &&
    a5.includes(`${nUser} acts land on the person`) && a5.includes(`and ${nMaker} on a developer or deployer; in ${B.target_is_public_body.by_deployer_column.length} of those`) &&
    a5.includes(`answered in ${B.counts.M.first} by the first reading and ${B.counts.M.second} by the second`) && a5.includes(`Of the ${B.classified} acted-on incidents the record has classified, ${B.domain7} concern`));
  want('a7', a7.includes(`holds 4 public acts`) && a7.includes(`incident ${ADJ.frontier.general_model_makers.concluded[0]}; the only one concluded`) && a7.includes(ADJ.frontier.general_model_makers.opened.join(', ')) && a7.includes(`(${ADJ.frontier.general_model_makers.for_the_maker[0]})`));
  want('a6', a6.includes(`of ${en(K.classified)} classified incidents`) && a6.includes(`malicious use (${K.domain_n['4']})`) && a6.includes(`system itself are ${K.domain_n['7']}`) && a6.includes(`${K.unclassified} newer entries`) &&
    a6.includes(`${B.by_domain['4'].P} of their ${finalP.length} acts sit in malicious use, ${B.by_domain['4'].P_user} of them on the user`) && a6.includes(`in ${B.user_system_worked} of the ${nUser} acts on a user`));
  // figure B shows the checked public code and target
  await p.click('[data-modeb="whom"]');
  const sqs = await q(`Object.fromEntries([...document.querySelectorAll('#figB rect.sq')].map(r=>[r.dataset.id,r.dataset.cat]))`);
  want('B squares', Object.keys(sqs).length === 176 && C.B.every(x => sqs[x.id] === (finalP.includes(x.id) ? tgt(x.id) : 'none')));
  const legB = await q(`Object.fromEntries([...document.querySelectorAll('#legendB span')].map(s=>[s.dataset.cat,Number(s.dataset.n)]))`);
  want('B legend', legB.user === nUser && legB.maker === nMaker && legB.none === 176 - finalP.length);
  want('tallyB whom', (await t('#tallyB')).includes(`Of ${finalP.length} public acts: ${nUser} on the person`));
  await p.click('#figB rect.sq[data-id="726"]');
  want('readoutB', (await t('#readoutB')).includes('Incident 726') && (await t('#readoutB')).includes('Found by the check'));
  await p.click('[data-modeb="who"]');
  want('tallyB who', (await t('#tallyB')).includes(`a public body acted in ${finalP.length} `));
  // first figure, acted mode
  await p.click('[data-mode="acted"]');
  const leg = await q(`Object.fromEntries([...document.querySelectorAll('#legend span')].map(s=>[s.dataset.cat,Number(s.dataset.n)]))`);
  want('fig acted', leg.act === 3 && leg.pub === finalP.length - 1 && leg.act + leg.pub + leg.resp + leg.none === 1803);
  want('tally acted', (await t('#tally')).includes(`at least ${B.public_act_on_record_at_least} of 1,803 incidents`) && B.public_act_on_record_at_least === finalP.length + 2);
  await p.click('[data-mode="who"]');
  // part A readout carries the second reader
  await p.click('#figA rect.sq[data-id="187"]');
  want('readoutA', (await t('#readoutA')).includes('The second reader coded it “witness”'));
  // the check section
  const rowsAg = await q(`[...document.querySelectorAll('#agree tbody tr')].map(r=>[...r.cells].map(c=>c.textContent))`);
  want('agree rows', rowsAg.length === 5 && rowsAg[1][1] === String(B.counts.P.first) && rowsAg[1][2] === String(S.B.filter(x => x.codes.includes('P')).length) && rowsAg[1][5] === String(finalP.length) &&
    rowsAg[1][4].includes(`kappa ${B.agreement.P.kappa}`) && rowsAg[0][4].includes(`kappa ${A.agreement.kappa}`) && rowsAg[2][2] === String(S.B.filter(x => x.codes.includes('M')).length));
  const chk2 = await t('#chk2');
  want('chk2', chk2.includes(`acted in ${finalP.length} of the 176 answered incidents, not ${B.public_first}`) && chk2.includes(`missed ${admit.size} acts`) && chk2.includes(`${B.domain7} of ${B.classified} concern`) && chk2.includes(`(incidents ${B.target_is_public_body.by_deployer_column.join(', ')})`));
  const sqC = await q(`[...document.querySelectorAll('#figC rect.sq')].map(r=>[Number(r.dataset.id),r.dataset.code])`);
  const codeC = Object.fromEntries(PS.items.map(x => [Number(x.id), x.code]));
  want('C squares', sqC.length === 120 && sqC.every(([i, c]) => codeC[i] === c));
  const legC = await q(`Object.fromEntries([...document.querySelectorAll('#legendC span[data-cat]')].map(s=>[s.dataset.cat,Number(s.dataset.n)]))`);
  want('C legend', legC.harmed === pressHarmed && legC.witness === P.codes.witness && legC.maker === P.codes.maker);
  await p.click('#figC rect.sq[data-id="1190"]');
  want('readoutC', (await t('#readoutC')).includes('Incident 1190') && (await t('#readoutC')).includes('the harmed'));
  const nAll = await q(`document.querySelectorAll('#pacts tbody tr').length`); want('acts all', nAll === finalP.length);
  for (const [m, n] of [['user', nUser], ['maker', nMaker], ['pub', B.target_is_public_body.by_deployer_column.length], ['new', admit.size]]) {
    await p.click(`[data-acts="${m}"]`); want('acts ' + m, (await q(`document.querySelectorAll('#pacts tbody tr').length`)) === n);
    want('actsum ' + m, (await t('#actsum')).includes(`${n} of ${finalP.length} acts`));
  }
  await p.click('[data-acts="all"]');
  const pr = await q(`[...document.querySelectorAll('#preds tbody tr')].map(r=>[r.cells[0].textContent,r.cells[2].textContent.split(' ')[0]])`);
  want('preds rows', pr.length === 9);
  for (const k of ['P111', 'P112', 'P113']) want('pred ' + k, (pr.find(x => x[0] === k) || [])[1] === (R.predictions[k] ? 'held' : 'failed'));
  want('predsum', (await t('#predsum')).includes(`Check 77: ${R.predictions_held} of 3 held`));
  want('no sideways scroll', !(await q(`document.documentElement.scrollWidth > window.innerWidth`)));
  const ok = !errs.length && !bad.length; if (!ok) fails++;
  console.log(w, scheme, ok ? 'PASS' : 'FAIL', bad.join(', '), errs.join('; '));
  if (shot) await p.screenshot({ path: path.join(here, shot), fullPage: true });
  await p.close();
}
await b.close(); process.exit(fails ? 1 : 0);
