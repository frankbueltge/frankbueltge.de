// Study 81 (second state): open the page at 1100 px light and 390 px dark; read every figure of study 81 from the page a
// visitor sees and compare it with results81.json and with counts recomputed here from coding81.json, coding80.json and
// sentences80.json; check errors and sideways scroll; write process/2.png from the light pass and shot-390.png from the
// dark one (NOSHOT=1 skips both).
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const rd = f => JSON.parse(fs.readFileSync(path.join(here, f), 'utf8'));
const R = rd('results81.json'), K = rd('coding81.json'), C80 = rd('coding80.json').rows, S80 = rd('sentences80.json').sentences;
// recomputed here, not taken from the results
const SRC = Object.fromEntries(K.sources.map(s => [s.ref, s]));
const measured = C80.filter(r => r.about && r.grade === 'measured');
const srcOf = id => { const s = S80.find(x => x.id === id); return s.refs.length ? s.refs.map(r => r.replace('*', '')) : (K.sources_by_reading[String(id)] || []); };
const T = K.sources.filter(s => s.test === 'yes');
const cnt = (arr, k) => arr.reduce((a, s) => (a[s[k]] = (a[s[k]] || 0) + 1, a), {});
const run = cnt(T, 'runner'), out = cnt(T, 'outside');
const grpOf = ref => new Set(measured.filter(r => srcOf(r.id).includes(ref)).map(r => r.tests));
const inG = g => T.filter(s => grpOf(s.ref).has(g));
const makerPart = s => s.runner === 'maker' || s.runner === 'maker and others';
const share = (k, n) => Math.round(1000 * k / n) / 10;
const ctrl = inG('control'), capa = inG('capability');
const mC = share(ctrl.filter(makerPart).length, ctrl.length), mK = share(capa.filter(makerPart).length, capa.length);
const p120 = mC - mK >= 20, p121 = (out.rerunnable || 0) <= T.length / 2, p122 = !T.some(s => s.runner === 'public body');
const passed = T.filter(s => s.pass !== 'none');
const third = T.filter(s => s.runner === 'third party'), mk = T.filter(makerPart);
const sentOut = id => { const refs = srcOf(id); const ts = refs.map(r => SRC[r]).filter(s => s.test === 'yes');
  if (!refs.length) return 'no source named'; if (!ts.length) return 'no test in its sources';
  if (ts.some(s => s.outside === 'rerunnable')) return 'rerunnable'; const o = new Set(ts.map(s => s.outside)); return o.size === 1 ? [...o][0] : 'mixed'; };
const sentRer = measured.filter(r => sentOut(r.id) === 'rerunnable').length;
const b = await chromium.launch(); let fails = 0;
for (const [w, scheme, shot] of [[1100, 'light', 'process/2.png'], [390, 'dark', 'shot-390.png']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = []; const bad = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForTimeout(300);
  const q = s => p.evaluate(s); const tx = s => q(`document.querySelector('${s}').textContent`);
  const want = (name, cond) => { if (!cond) bad.push(name); };
  want('counts', measured.length === 41 && K.sources.length === R.sources && T.length === R.test_sources);
  const a5 = await tx('#a5');
  want('a5', a5.includes(`Behind the ${measured.length} measured sentences stand ${K.sources.length} sources`) && a5.includes(`${T.length} report a test`) &&
    a5.includes(`Third parties ran ${run['third party']} of the ${T.length}`) && a5.includes(`maker of a tested model ${mk.length} (${run.maker} alone, ${run['maker and others']} with others)`) &&
    a5.includes(`a public body ${run['public body']}`) && a5.includes(`could repeat ${out.rerunnable} of the ${T.length} (${R.rerunnable.share} %)`) && Math.abs(R.rerunnable.share - 100 * out.rerunnable / T.length) < 0.06 &&
    a5.includes(`${third.filter(s => s.outside === 'rerunnable').length} of the ${third.length} run by third parties, ${mk.filter(s => s.outside === 'rerunnable').length} of the ${mk.length} the maker ran`));
  const a6 = await tx('#a6');
  const allMaker = passed.every(s => s.pass === 'maker') && passed.every(makerPart), noneOpen = !passed.some(s => s.outside === 'rerunnable');
  want('a6', a6.includes(`${passed.length} of the ${T.length} tests apply a pass mark`) && allMaker && noneOpen && a6.includes(`Only ${passed.length} of the ${T.length} tests apply a pass mark`) && a6.includes('the maker set every one, ran every one') && a6.includes('and none of them can be repeated') &&
    a6.includes(`lists ${K.framework_table.rows.length} safety frameworks`) &&
    a6.includes(`And ${K.nine.some(c => c.outside === 'rerunnable') ? 'x' : 'none'} of step 3's ${K.nine.length} losses`) &&
    a6.includes(`records in ${K.nine.filter(c => c.atelier_outside !== 'none named').length} of them`));
  // the sentences: one square per measured sentence, coloured by the rule
  const sq = await q(`[...document.querySelectorAll('#sents rect.sq')].map(r=>[Number(r.dataset.id),r.dataset.outside])`);
  want('squares', sq.length === measured.length && sq.every(([id, o]) => sentOut(id) === o));
  want('sentence label', (await tx('#sentsLab')).includes(`${sentRer} rest on at least one test`));
  // the bands: one tile per source, in its band
  const tiles = await q(`[...document.querySelectorAll('#bands g.tile')].map(t=>[t.dataset.ref,t.dataset.outside,t.dataset.runner])`);
  want('tiles', tiles.length === K.sources.length && tiles.every(([r, o, ru]) => { const s = SRC[r]; return s.test === 'yes' ? (s.outside === o && s.runner === ru) : o === 'no test'; }));
  const leg = await q(`Object.fromEntries([...document.querySelectorAll('#blegend button')].map(b=>[b.dataset.cat,Number(b.dataset.n)]))`);
  want('legend runner', Object.keys(run).every(k => leg[k] === run[k]));
  // a sentence chosen lights up its sources; a tile chosen reads out its source
  await p.click('#sents rect.sq[data-id="530"]');
  const lit = await q(`[...document.querySelectorAll('#bands g.tile.on')].map(t=>t.dataset.ref)`);
  want('sentence lights its sources', lit.join() === srcOf(530).join());
  await p.click('#bands g.tile[data-ref="723"]');
  const ro = await tx('#breadout');
  want('readout', ro.includes('Reference 723') && ro.includes(SRC['723'].quote) && ro.includes('a public body'));
  await p.click('[data-bmode="group"]');
  want('group mode', (await q(`document.querySelectorAll('#bands g.tile').length`)) === K.sources.length);
  // the nine
  const nine = await q(`[...document.querySelectorAll('#nine tbody tr')].map(r=>[Number(r.dataset.aiid),r.dataset.outside,r.cells[1].textContent])`);
  want('nine', nine.length === 9 && nine.every(([a, o, cell]) => K.nine.find(c => c.aiid === a).outside === o && cell === (o === 'rerunnable' ? 'yes' : `no: ${o}`)));
  // the predictions
  const res = await q(`[...document.querySelectorAll('#preds81 tbody tr')].map(r=>r.cells[2].textContent)`);
  const word = v => v === true ? 'held' : (v === false ? 'failed' : 'uninformative');
  want('preds81', res.join() === ['P120', 'P121', 'P122'].map(k => word(R.predictions[k])).join());
  want('P120 recomputed', ctrl.length >= 5 && capa.length >= 5 && p120 === R.predictions.P120);
  want('P121 recomputed', p121 === R.predictions.P121);
  want('P122 recomputed', p122 === R.predictions.P122);
  want('predsum81', (await tx('#predsum81')).includes(`${[p120, p121, p122].filter(Boolean).length} of 3 held`));
  want('sha81', (await tx('#psha81')) === R.predictions_file_sha256);
  want('no sideways scroll', !(await q(`document.documentElement.scrollWidth > window.innerWidth`)));
  const ok = !errs.length && !bad.length; if (!ok) fails++;
  console.log(w, scheme, ok ? 'PASS' : 'FAIL', bad.join(', '), errs.join('; '));
  if (shot && !process.env.NOSHOT) {
    await p.click('[data-bmode="runner"]'); await p.click('#sents rect.sq[data-id="530"]'); await p.evaluate(() => window.scrollTo(0, 0));
    fs.mkdirSync(path.join(here, 'process'), { recursive: true }); await p.screenshot({ path: path.join(here, shot), fullPage: true });
  }
  await p.close();
}
await b.close(); process.exit(fails ? 1 : 0);
