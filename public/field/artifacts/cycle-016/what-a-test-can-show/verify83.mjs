// The paper (fourth state, session 281): open the page at 1100 px light and 390 px dark; read the figures the fourth
// state added from the page a visitor sees and compare them with results83.json and with counts recomputed here,
// independently of analyse83.py, from coding83.json, data82.js, org83.json and atelier_can_would83.json; check errors
// and sideways scroll; write process/4.png from the light pass and shot-390.png from the dark one (NOSHOT=1 skips both).
// verify82.mjs remains the check of the third state's figures and still runs against this page.
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const rd = f => JSON.parse(fs.readFileSync(path.join(here, f), 'utf8'));
const js = f => { const t = fs.readFileSync(path.join(here, f), 'utf8'); return JSON.parse(t.slice(t.indexOf('{'), t.lastIndexOf('}') + 1)); };
const R = rd('results83.json'), C = rd('coding83.json'), ORG = rd('org83.json').sources, AT = rd('atelier_can_would83.json').tests;
const D82 = js('data82.js'), D81 = js('data81.js');

// ---- recomputed here ----
const share = (k, n) => Math.round(1000 * k / n) / 10;
const CODES = ['binding', 'requires_evaluation', 'control', 'pass_mark', 'outside_evaluation', 'results'];
const I = C.instruments;
const agree = I.reduce((s, i) => s + CODES.filter(c => i.first[c] === i.second[c]).length, 0);
const count = (c, v) => I.filter(i => i.final[c] === v).length;
// a final code differs from the first only where the third reading decided it
const decidedOk = I.every(i => CODES.every(c => i.final[c] === i.first[c] ||
  C.adjudication.some(a => a.n === i.n && a.code === c && a.final === i.final[c])));
const p126 = count('pass_mark', 'set by the instrument') === 0 && count('pass_mark', 'left to the developer') >= 2;
const p127 = count('control', 'named') >= 4;
const p128 = count('outside_evaluation', 'required') <= 2 && count('results', 'published in full') === 0;
// shares against all sentences on evaluation
const S = Object.values(D82.sentences), N = 201;
const sh = { measured: S.length, held_by_any_source: S.filter(s => s.held_by_any).length, any_rerunnable: S.filter(s => s.any_rerunnable).length,
  all_rerunnable: S.filter(s => s.all_rerunnable).length, held_by_rerunnable: S.filter(s => s.held_by_rerunnable).length };
// tests on control
const src = D82.sources;
const tests = Object.keys(src).filter(r => src[r].final.test === 'yes');
const grp = Object.fromEntries(D81.sources.map(s => [s.ref, s.groups || []]));
const ctrl = tests.filter(r => grp[r].includes('control'));
const rer = r => src[r].final.outside === 'rerunnable';
const rh = r => rer(r) && Boolean(src[r].hold_any);
const ctrlRh = ctrl.filter(rh);
const how = Object.fromEntries(AT.map(t => [t.ref, t.how]));
const howCount = h => ctrlRh.filter(r => how[r] === h).length;
// grouping by organisation
const named = {}; tests.forEach(r => { if (ORG[r]) (named[ORG[r].org] ||= []).push(r); });
const units = Object.keys(named).length + tests.filter(r => !ORG[r]).length;
const inNamed = Object.values(named).reduce((s, v) => s + v.length, 0);

const b = await chromium.launch(); let fails = 0;
for (const [w, scheme, shot] of [[1100, 'light', 'process/4.png'], [390, 'dark', 'shot-390.png']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = []; const bad = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForTimeout(400);
  const q = s => p.evaluate(s); const tx = s => q(`document.querySelector('${s}').textContent`);
  const want = (name, cond) => { if (!cond) bad.push(name); };
  // the results file agrees with the recount
  const S83 = R.study83;
  want('results: agreement', S83.agreement_all_codes[0] === agree && S83.agreement_all_codes[1] === 42 && decidedOk);
  want('results: predictions', S83.predictions.P126 === p126 && S83.predictions.P127 === p127 && S83.predictions.P128 === p128);
  want('results: shares', Object.entries(sh).every(([k, v]) => R.shares_of_201[k].of_201[0] === v && R.shares_of_201[k].of_201[1] === N));
  want('results: control', R.control_tests.test_sources === ctrl.length && R.control_tests.rerunnable === ctrl.filter(rer).length &&
    R.control_tests.rerunnable_and_holds === ctrlRh.length && R.control_tests.untold === howCount('untold'));
  want('results: organisations', R.by_organisation.units === units && R.by_organisation.sources_in_named === inNamed);
  // the answer box
  const a7 = await tx('#a7');
  want('a7', a7.includes(`against all ${N} sentences on evaluation, ${sh.held_by_rerunnable} (${share(sh.held_by_rerunnable, N).toFixed(1)} %)`) &&
    a7.includes(`${['none', 'one', 'two', 'three'][count('pass_mark', 'left to the developer')]} leave it to the developer`));
  // every share against 201
  const bars = await q(`[...document.querySelectorAll('#shares rect.fill')].map(r=>[r.dataset.k,Number(r.dataset.n)])`);
  want('shares', bars.length === 5 && bars.every(([k, n]) => sh[k] === n));
  // tests on control
  const tiles = await q(`[...document.querySelectorAll('#ctrl g.ct')].map(g=>[g.dataset.ref,g.dataset.outside,g.dataset.how])`);
  want('control tiles', tiles.length === ctrl.length && tiles.every(([r, o, h]) => src[r].final.outside === o && (rh(r) ? h === how[r] : h === '')));
  const cn = await tx('#ctrlNote');
  want('control note', cn.includes(`trained the behaviour in for ${howCount('trained')}, told the model to do it for ${howCount('told')}, and asked the model a question whose answer is the result for ${howCount('asked')}`));
  await p.click(`#ctrl g.ct[data-ref="${ctrlRh[0]}"]`);
  want('control readout', (await tx('#creadout')).startsWith(`Source ${ctrlRh[0]}`));
  // organisations
  const org = await q(`[...document.querySelectorAll('#orgs tbody tr')].map(t=>[t.children[0].textContent,t.children[1].textContent])`);
  want('organisations', org.length === Object.keys(named).length && org.every(([o, n]) => n.startsWith(`${named[o].length} (`)) &&
    (await tx('#orgNote')).includes(`stand for ${units} distinct units at most`));
  // the seven instruments
  const cells = await q(`[...document.querySelectorAll('#inst tbody tr')].map(t=>[Number(t.dataset.n),[...t.querySelectorAll('td.code')].map(c=>[c.dataset.k,c.textContent])])`);
  want('instruments', cells.length === 7 && cells.every(([n, cs]) => cs.length === 6 && cs.every(([k, v]) => I.find(i => i.n === n).final[k] === v)));
  await p.click('#inst tbody tr[data-n="4"] td[data-k="pass_mark"]');
  const ir = await tx('#ireadout'); const q4 = I.find(i => i.n === 4).quotes.pass_mark.quote;
  want('instrument readout', ir.includes(q4));
  const inote = await tx('#instNote');
  const W = ['None', 'One', 'Two', 'Three', 'Four', 'Five', 'Six', 'Seven'];
  want('instrument note', inote.includes(`${W[count('pass_mark', 'left to the developer')]} leave it to the developer`) &&
    inote.includes(`${W[count('control', 'named')]} of the seven name a loss of control`) && inote.includes(`required by ${W[count('outside_evaluation', 'required')].toLowerCase()} (`));
  // predictions
  const pr = await q(`[...document.querySelectorAll('#preds83 tbody tr')].map(t=>[t.dataset.p,t.lastChild.textContent])`);
  want('predictions', pr.length === 3 && pr[0][1] === (p126 ? 'held' : 'failed') && pr[1][1] === (p127 ? 'held' : 'failed') && pr[2][1] === (p128 ? 'held' : 'failed'));
  const held12 = 1 + 0 + 3 + [p126, p127, p128].filter(Boolean).length;
  want('presented', (await tx('#presented')).includes(`Of the step's twelve predictions, ${held12} held`));
  const side = await q('document.documentElement.scrollWidth > window.innerWidth');
  want('no sideways scroll', !side); want('no errors', errs.length === 0);
  console.log(`${w}px ${scheme}: ${bad.length ? 'FAIL ' + bad.join(', ') : 'all figures match'}${errs.length ? ' · errors: ' + errs.join(' | ') : ''}`);
  fails += bad.length;
  if (!process.env.NOSHOT && !bad.length) await p.screenshot({ path: path.join(here, shot), fullPage: true });
  await p.close();
}
await b.close();
console.log(`agreement ${agree}/42; pass mark left to developer ${count('pass_mark', 'left to the developer')}, control named ${count('control', 'named')}, outside required ${count('outside_evaluation', 'required')}; held by a rerunnable test ${sh.held_by_rerunnable}/${N}; control ${ctrl.length}/${ctrl.filter(rer).length}/${ctrlRh.length}; units ${units}`);
process.exit(fails ? 1 : 0);
