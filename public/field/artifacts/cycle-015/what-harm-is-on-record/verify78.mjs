// Study 78 (fourth state, the paper): open the page at 1100 px light and 390 px dark; read study 78's figures from the
// page a visitor sees and compare them with results78.json and with a recount from coding78.json; check errors and
// sideways scroll; write process/4.png from the light pass and shot-390.png from the dark one. The earlier states'
// checks are in verify75.mjs to verify77.mjs; verify77.mjs is superseded where this state changed its numbers.
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const J = f => JSON.parse(fs.readFileSync(path.join(here, f), 'utf8'));
const R = J('results78.json'), C = J('coding78.json'), R7 = J('results77.json');
const A = R.A, B = R.B, S = R.C, AC = R.atelier_case;
const en = n => n.toLocaleString('en-GB');
// independent recount from the coding file (not from results78.json)
const adjA = Object.fromEntries(C.adjudication.A.filter(x => x.field === 'act').map(x => [x.id, x.final]));
const adjB = Object.fromEntries(C.adjudication.B.map(x => [x.id, x.final]));
const secA = Object.fromEntries(C.second.A.map(x => [x.id, x])), secB = Object.fromEntries(C.second.B.map(x => [x.id, x]));
const acts = C.first.A.filter(x => (x.id in adjA) ? adjA[x.id] : (x.act && secA[x.id].act)).map(x => x.id);
const agreeA = C.first.A.filter(x => x.act === secA[x.id].act).length;
const aboutOf = x => (x.id in adjB) ? adjB[x.id] : x.about;
const own = C.first.B.filter(x => aboutOf(x) === 'own failure').length, mis = C.first.B.filter(x => aboutOf(x) === 'misuse by others').length;
const agreeB = C.first.B.filter(x => x.about === secB[x.id].about).length;
const b = await chromium.launch(); let fails = 0;
for (const [w, scheme, shot] of [[1100, 'light', 'process/4.png'], [390, 'dark', 'shot-390.png']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = []; const bad = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForTimeout(300);
  const q = s => p.evaluate(s); const t = s => q(`document.querySelector('${s}').textContent`);
  const want = (name, cond) => { if (!cond) bad.push(name); };
  want('recount A', acts.length === A.final_act && agreeA === A.agreement_act.agree && C.first.A.length === A.n && JSON.stringify(acts) === JSON.stringify(A.act_ids));
  want('recount B', own === B.about['own failure'] && mis === B.about['misuse by others'] && agreeB === B.agreement_about.agree && C.first.B.length === B.n);
  want('floor', A.floor_after === A.floor_before + A.new_n && A.floor_before === R7.B.public_act_on_record_at_least && A.all_acts_read === R7.B.public_final + A.new_n);
  const a8 = await t('#a8'), a9 = await t('#a9');
  want('a8', a8.includes(`opens ${A.n} incidents, and ${A.final_act} of those announce an act`) && a8.includes(`agree on ${A.agreement_act.agree} of ${A.n}`) && a8.includes(`${A.new_n} of them were not among the ${R7.B.public_final}`) &&
    a8.includes(`at least ${A.floor_after} of 1,803 incidents, not ${A.floor_before}`) && a8.includes(`of the ${A.all_acts_read} acts read, ${A.all_target.user} land on the person who used the AI and ${A.all_target.maker} on`));
  want('a9', a9.includes(`(${B.n} incidents)`) && a9.includes(`own system in ${own}, about other people's misuse of it in ${mis}`) && a9.includes(`${B.own_failure_2026.length} of the ${own} fall in 2026`) &&
    a9.includes(`files ${B.agent_column.n} incidents of 2026 under AI agent systems`) && a9.includes(`acting in ${B.agent_column.public_act.length} of them, an inquiry (incident ${B.agent_column.public_act[0]})`));
  // shares by year
  const segs = await q(`[...document.querySelectorAll('#figS .seg')].map(r=>[r.dataset.year,r.dataset.cat,Number(r.dataset.n)])`);
  want('figS segments', segs.length > 0 && segs.every(([y, k, n]) => R.by_year[y][k] === n) &&
    segs.length === Object.values(R.by_year).reduce((a, c) => a + ['public body', 'maker', 'self-published', 'research'].filter(k => c[k] > 0).length, 0));
  const legS = await q(`Object.fromEntries([...document.querySelectorAll('#legendS span[data-cat]')].map(s=>[s.dataset.cat,Number(s.dataset.n)]))`);
  want('figS legend', legS['public body'] === 37 && legS.maker === 23 && legS['self-published'] === 58 && legS.research === 24);
  want('figS first bar', (await q(`document.querySelector('#figS text:not([text-anchor=end])')?.textContent`)) !== undefined &&
    (await q(`[...document.querySelectorAll('#figS text')].filter(t=>t.getAttribute('text-anchor')==='middle')[0].textContent`)).startsWith(w < 600 ? '<12' : 'before'));
  await p.click('#figS .seg[data-year="2026"][data-cat="maker"]');
  want('readoutS', (await t('#readoutS')).includes('2026: 309 incidents with a report') && (await t('#readoutS')).includes('the maker 13'));
  want('noteS', (await t('#noteS')).includes(`(13 of 309, 4.2 %, against 10 of 1,492 before)`));
  // Part A squares
  const sqA = await q(`Object.fromEntries([...document.querySelectorAll('#figPA rect.sq')].map(r=>[r.dataset.id,r.dataset.cat]))`);
  want('A squares', Object.keys(sqA).length === A.n && C.first.A.every(x => sqA[x.id] === (acts.includes(x.id) ? (A.new.includes(x.id) ? 'new' : 'known') : 'none')));
  const legA = await q(`Object.fromEntries([...document.querySelectorAll('#legendPA span[data-cat]')].map(s=>[s.dataset.cat,Number(s.dataset.n)]))`);
  want('A legend', legA.new === A.new_n && legA.known === A.already_in_the_60.length && legA.none === A.not_an_act);
  await p.click('#figPA rect.sq[data-id="1222"]');
  want('readoutPA', (await t('#readoutPA')).includes('Incident 1222') && (await t('#readoutPA')).includes('a developer or deployer'));
  await p.click('#figPA rect.sq[data-id="1251"]');
  want('readoutPA third reading', (await t('#readoutPA')).includes('borderline') && (await t('#readoutPA')).includes('the third reading decided'));
  const pa = await t('#p78a');
  want('p78a', pa.includes(`the first reader found ${A.first_act}, the second ${A.second_act}`) && pa.includes(`kappa ${A.agreement_act.kappa}`) && pa.includes(`rises from ${A.floor_before} to ${A.floor_after}`) &&
    pa.includes(`${A.new_n} are new: ${A.new_target.user} on the person who used the AI, ${A.new_target.maker} on`) && pa.includes(`(incident ${A.link_error[0]})`));
  // Part B squares
  const sqB = await q(`Object.fromEntries([...document.querySelectorAll('#figPB rect.sq')].map(r=>[r.dataset.id,r.dataset.cat]))`);
  want('B squares', Object.keys(sqB).length === B.n && C.first.B.every(x => sqB[x.id] === aboutOf(x)));
  await p.click('#figPB rect.sq[data-id="1685"]');
  want('readoutPB', (await t('#readoutPB')).includes('Incident 1685 (2026)') && (await t('#readoutPB')).includes('a failure of its own system'));
  const pb = await t('#p78b');
  want('p78b', pb.includes(`${B.n} incidents, ${B.n_2026} of them in 2026`) && pb.includes(`agree on ${B.agreement_about.agree} of ${B.n} (kappa ${B.agreement_about.kappa})`) && pb.includes(`${B.about_2026['own failure']} report a failure`));
  // Part C table and text
  const rows = await q(`[...document.querySelectorAll('#subm tbody tr')].map(r=>[...r.cells].map(c=>c.textContent))`);
  want('subm rows', rows.length === 2 && rows[0][1] === en(S.top_n) && rows[1][1] === en(S.rest_n) && rows[0][7] === `${S.top_outside_pct} %` && rows[1][7] === `${S.rest_outside_pct} %` &&
    rows[0][3] === String(S.top_classes['public body']) && rows[0][4] === String(S.top_classes.maker) && rows[1][2] === en(S.rest_classes['press and other']));
  const pc = await t('#p78c');
  want('p78c', pc.includes(`${S.distinct_submitter_names} names`) && pc.includes(`${en(S.top_n)} of 1,801 incidents (${S.top_pct} %)`) && pc.includes(`${S.ratio_rest_to_top} times`) &&
    pc.includes(`(${S.since_2023.top[0]} of ${en(S.since_2023.top[1])})`) && pc.includes(`(${S.since_2023.rest[0]} of ${S.since_2023.rest[1]})`) && pc.includes(`counts ${en(S.atelier_count)}`));
  const pd = await t('#p78d');
  want('p78d', pd.includes(`2 of the ${AC.press_harmed} harmed writers`) && pd.includes(AC.press_itself.join(', ')) && pd.includes(`falls from ${AC.whole_record_all} to ${AC.whole_record_not_press} (between ${AC.whole_record_not_press_ci[0]} and ${AC.whole_record_not_press_ci[1]})`));
  // predictions and the first figure's floor
  const pr = await q(`[...document.querySelectorAll('#preds tbody tr')].map(r=>r.cells[0].textContent+'|'+r.className+'|'+r.cells[2].textContent)`);
  want('preds 12', pr.length === 12 && pr.filter(x => x.startsWith('P11') && /P11[456]/.test(x)).length === 3);
  want('predsum', (await t('#predsum')).includes(`Study 78: ${R.predictions_held} of 3 held`) && (await t('#predsum')).includes(`In all: ${R.all_predictions.held} of ${R.all_predictions.of}`));
  await p.click('[data-mode="acted"]');
  want('tally acted', (await t('#tally')).includes(`at least ${A.floor_after} of 1,803 incidents`));
  await p.click('[data-mode="who"]');
  want('tally who base', (await t('#tally')).includes('of 1,801 incidents with a report'));
  want('paper link', (await q(`[...document.querySelectorAll('a')].some(a=>a.getAttribute('href').endsWith('presentations/cycle-015/paper.md'))`)));
  const sw = await q('document.documentElement.scrollWidth'), iw = await q('innerWidth');
  want('no sideways scroll', sw <= iw);
  if (shot) await p.screenshot({ path: path.join(here, shot), fullPage: true });
  console.log(w, scheme, bad.length ? 'FAIL ' + bad.join('; ') : 'ok', errs.length ? 'ERRORS ' + errs.join(' | ') : 'no errors'); fails += bad.length + errs.length; await p.close();
}
await b.close(); process.exit(fails ? 1 : 0);
