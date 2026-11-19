// Check 82 (third state): open the page at 1100 px light and 390 px dark; read the figures the check changed or added
// from the page a visitor sees and compare them with results82.json and with counts recomputed here, independently of
// analyse82.py, from coding81.json, coding80.json, check82/second/*.json and check82/adjudication.json; check errors
// and sideways scroll; write process/3.png from the light pass and shot-390.png from the dark one (NOSHOT=1 skips both).
// verify81.mjs is the record of the second state and is superseded: it reads the first coding, which the check changed.
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const rd = f => JSON.parse(fs.readFileSync(path.join(here, f), 'utf8'));
const R = rd('results82.json'), K = rd('coding81.json'), C80 = rd('coding80.json').rows, ADJ = rd('check82/adjudication.json').items;
const SEC = Object.fromEntries(fs.readdirSync(path.join(here, 'check82/second')).filter(f => f.endsWith('.json')).map(f => [f.slice(0, -5), rd('check82/second/' + f)]));

// ---- recomputed here ----
const share = (k, n) => Math.round(1000 * k / n) / 10;
const kappa = pairs => { const n = pairs.length; if (!n) return null; const po = pairs.filter(([a, b]) => a === b).length / n;
  const ca = {}, cb = {}; pairs.forEach(([a, b]) => { ca[a] = (ca[a] || 0) + 1; cb[b] = (cb[b] || 0) + 1; });
  const pe = Object.keys(ca).reduce((s, k) => s + ca[k] * (cb[k] || 0), 0) / (n * n);
  return pe === 1 ? (po === 1 ? 1 : 0) : Math.round(100 * (po - pe) / (1 - pe)) / 100; };
const adj = (study, item, code) => ADJ.find(a => a.study === study && String(a.item) === String(item) && a.code === code);
const first = Object.fromEntries(K.sources.map(s => [s.ref, s]));
const second = {}; Object.entries(SEC).filter(([k]) => k.startsWith('s81-')).forEach(([, d]) => d.items.forEach(it => { second[String(it.ref)] = it; }));
const refs = Object.keys(first).sort((a, b) => a - b);
const F = Object.fromEntries(refs.map(r => [r, Object.fromEntries(['test', 'runner', 'pass', 'outside'].map(k => { const a = adj('81', r, k); return [k, a ? a.final : first[r][k]]; }))]));
const T = refs.filter(r => F[r].test === 'yes');
const pairs = []; refs.forEach(r => (second[r].pairs || []).forEach(p => { const a = adj('81h', `${p.sentence}-${r}`, 'holds'); pairs.push({ sentence: p.sentence, ref: r, holds: a ? a.final : p.holds }); }));
const holdAny = r => pairs.some(p => p.ref === r && p.holds === 'holds'), holdSome = r => pairs.some(p => p.ref === r && (p.holds === 'holds' || p.holds === 'partly'));
const rer = T.filter(r => F[r].outside === 'rerunnable'), rerHold = rer.filter(holdAny), rerSome = rer.filter(holdSome);
const rerOpen = rer.filter(r => second[r].model_access === 'open weights' && second[r].materials_access === 'public');
// agreement on the sources both read as tests
const t1 = r => (first[r].test === 'yes' || first[r].test === 'no') ? first[r].test : 'unreached';
const bt = refs.filter(r => t1(r) === 'yes' && second[r].test === 'yes');
const kRunner = kappa(bt.map(r => [first[r].runner, second[r].runner])), kOutside = kappa(bt.map(r => [first[r].outside, second[r].outside]));
const kTest = kappa(refs.map(r => [t1(r), second[r].test]));
// agreement on the sentences both readings keep (study 80)
const s2 = {}; ['s80-a', 's80-b'].forEach(k => SEC[k].items.forEach(it => { s2[it.id] = it; }));
const yn = v => (v === true || v === 'yes') ? 'yes' : 'no';
const both = C80.filter(r => yn(r.about) === 'yes' && s2[r.id] && s2[r.id].about === 'yes');
const kGrade = kappa(both.map(r => [r.grade, s2[r.id].grade])), kTests = kappa(both.map(r => [r.tests, s2[r.id].tests]));
// P125 as predicted: the second coding as it came
const T2 = refs.filter(r => second[r].test === 'yes');
const p125k = T2.filter(r => second[r].outside === 'rerunnable' && (second[r].pairs || []).some(p => p.holds === 'holds')).length;
// sentences: held in full by a rerunnable test
const D81 = (() => { const t = fs.readFileSync(path.join(here, 'data81.js'), 'utf8'); return JSON.parse(t.slice(t.indexOf('=') + 1).trim().replace(/;$/, '')); })();
const heldRer = D81.rows.filter(row => pairs.some(p => p.sentence === row.id && p.holds === 'holds' && rer.includes(p.ref))).length;
const anyRer = D81.rows.filter(row => row.sources.some(r => rer.includes(r))).length;
// pass marks: what they apply to, read blind
const passRefs = T.filter(r => F[r].pass !== 'none');
const kinds = new Set(passRefs.flatMap(r => (second[r].pass_applies_to || []).map(x => x.kind)));
const nineSecondOpen = SEC.nine.items.filter(c => c.outside === 'rerunnable').length;

const b = await chromium.launch(); let fails = 0;
for (const [w, scheme, shot] of [[1100, 'light', 'process/3.png'], [390, 'dark', 'shot-390.png']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = []; const bad = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForTimeout(400);
  const q = s => p.evaluate(s); const tx = s => q(`document.querySelector('${s}').textContent`);
  const want = (name, cond) => { if (!cond) bad.push(name); };
  // the results file agrees with the recount
  const FT = R.study81.final_totals;
  want('results: final codes', FT.test_sources === T.length && FT.rerunnable.k === rer.length && FT.rerunnable_and_holds.k === rerHold.length &&
    FT.rerunnable_and_holds_at_least_partly.k === rerSome.length && FT.rerunnable_open_weights_public_materials.k === rerOpen.length);
  want('results: kappa', R.study81.runner.kappa === kRunner && R.study81.outside.kappa === kOutside && R.study81.test.kappa === kTest &&
    R.study80.grade.kappa === kGrade && R.study80.tests.kappa === kTests);
  want('results: sentences', R.study81.sentences.held_by_rerunnable === heldRer && R.study81.sentences.any_rerunnable === anyRer);
  // the answer box
  const a5 = await tx('#a5');
  want('a5', a5.includes(`could repeat ${rer.length} of the ${T.length} (${share(rer.length, T.length)} %)`) &&
    a5.includes(`only ${rerHold.length} of them hold the result the report cites them for (${share(rerHold.length, T.length)} % of the ${T.length}`) &&
    a5.includes(`${heldRer} are held in full by a test an outsider could repeat: ${heldRer} of its 201 sentences on evaluation (${share(heldRer, 201)} %)`));
  const a6 = await tx('#a6');
  want('a6', a6.includes(`Only ${passRefs.length} of the ${T.length} tests apply a pass mark`) && !kinds.has('control') &&
    a6.includes(`to ${kinds.size} kinds of result`) && a6.includes('never to a model\'s conduct'));
  want('corrections', (await q(`document.querySelectorAll('.corr').length`)) >= 5 && (await tx('#a5c')).includes(`gave 27 of 48`));
  // the agreement table
  const ag = await q(`[...document.querySelectorAll('#agree tbody tr')].map(t=>[Number(t.dataset.n),Number(t.dataset.kappa)])`);
  want('agreement rows', ag.length === 9 && ag[1][1] === kGrade && ag[2][1] === kTests && ag[4][1] === kTest && ag[5][1] === kRunner && ag[6][1] === kOutside && ag[4][0] === refs.length && ag[5][0] === bt.length);
  // the funnel: from tests to those an outsider could check
  const fb = await q(`[...document.querySelectorAll('#funnel rect.fb')].map(r=>[r.dataset.k,Number(r.dataset.n)])`);
  want('funnel', JSON.stringify(fb) === JSON.stringify([['tests', T.length], ['rerunnable', rer.length], ['holds some', rerSome.length], ['holds', rerHold.length], ['open', rerOpen.length]]));
  await p.click('#funnel rect.fb[data-k="holds"]');
  const fl = await q(`[...document.querySelectorAll('#freadout li')].map(l=>l.textContent.split(' ')[0].replace('*',''))`);
  want('funnel readout', fl.length === rerHold.length && fl.every(r => rerHold.includes(r)));
  // the tiles carry the final codes and the check's reading of whether they hold
  const tiles = await q(`[...document.querySelectorAll('#bands g.tile')].map(t=>[t.dataset.ref,t.dataset.outside,t.dataset.runner,t.dataset.hold])`);
  want('tiles', tiles.length === refs.length && tiles.every(([r, o, ru, h]) => (F[r].test === 'yes' ? (F[r].outside === o && F[r].runner === ru) : o === 'no test') &&
    h === (holdAny(r) ? 'holds' : (holdSome(r) ? 'partly' : h))));
  const sq = await q(`[...document.querySelectorAll('#sents rect.sq')].filter(r=>r.dataset.outside==='rerunnable').length`);
  want('squares', sq === anyRer && (await tx('#sentsLab')).includes(`${anyRer} rest on at least one test`));
  // the predictions
  const pr = await q(`[...document.querySelectorAll('#preds82 tbody tr')].map(t=>[t.dataset.p,t.lastChild.textContent])`);
  const p123 = kGrade >= 0.6 && kTests >= 0.6, p124 = kRunner >= 0.6 && kOutside >= 0.5, p125 = p125k <= T2.length / 2;
  want('predictions', pr.length === 3 && pr[0][1] === (p123 ? 'held' : 'failed') && pr[1][1] === (p124 ? 'held' : 'failed') && pr[2][1] === (p125 ? 'held' : 'failed') &&
    (await tx('#preds82')).includes(`${p125k} of ${T2.length}`));
  want('nine', nineSecondOpen === 0 && (await tx('#nineNote')).includes(`and ${nineSecondOpen} of 9 by the second`));
  const side = await q('document.documentElement.scrollWidth > window.innerWidth');
  want('no sideways scroll', !side); want('no errors', errs.length === 0);
  console.log(`${w}px ${scheme}: ${bad.length ? 'FAIL ' + bad.join(', ') : 'all figures match'}${errs.length ? ' · errors: ' + errs.join(' | ') : ''}`);
  fails += bad.length;
  if (!process.env.NOSHOT && !bad.length) await p.screenshot({ path: path.join(here, shot), fullPage: true });
  await p.close();
}
await b.close();
console.log(`κ grade ${kGrade}, tests ${kTests}; runner ${kRunner}, outside ${kOutside}; rerunnable ${rer.length}/${T.length}, holding ${rerHold.length}, open ${rerOpen.length}; sentences held by a rerunnable test ${heldRer}/201; P125 ${p125k}/${T2.length}`);
process.exit(fails ? 1 : 0);
