// Check 84 (fifth state, session 282, after the presentation): open the page at 1100 px light and 390 px dark; read
// the figure and the sentences check 84 added from the page a visitor sees and compare them with results84.json and
// with counts recomputed here, independently of analyse84.py, from models84.json, the second reading
// (check82/second/s81-*.json) and results82.json; switch the figure to the page as presented and count again; check
// errors and sideways scroll; write process/5.png from the light pass and shot-390.png from the dark one (NOSHOT=1
// skips both). verify82.mjs and verify83.mjs remain the checks of the third and fourth states (run them with NOSHOT=1).
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const rd = f => JSON.parse(fs.readFileSync(path.join(here, f), 'utf8'));
const R = rd('results84.json'), M = rd('models84.json'), R82 = rd('results82.json').study81;
const second = {};
for (const f of fs.readdirSync(path.join(here, 'check82', 'second')).filter(f => /^s81-.*\.json$/.test(f)))
  for (const it of JSON.parse(fs.readFileSync(path.join(here, 'check82', 'second', f), 'utf8')).items) second[String(it.ref)] = it;

// ---- recomputed here ----
const MOD = M.models, key = k => k === 'gpt-4o*' ? M.gpt4o_assumed.earliest : k, st = k => MOD[key(k)].status;
const off = s => s === 'offered' || s === 'offered, end set';
const T = M.tests, holds = R82.final_totals.rerunnable_and_holds.refs;
const codeOf = ks => { if (!ks.length) return 'not settled'; const s = ks.map(st), r = s.filter(x => x === 'retired').length,
  o = s.filter(off).length, nf = s.filter(x => x === 'not found').length;
  if (!r) return nf ? 'not settled' : 'all offered'; if (!o && !nf) return 'all retired'; if (!o) return 'retired, rest not found'; return 'some retired'; };
const citedOf = ks => !ks.length ? 'not settled' : ks.some(k => st(k) === 'retired') ? 'cannot' : ks.every(k => off(st(k))) ? 'can' : 'not settled';
const code = Object.fromEntries(T.map(t => [t.ref, codeOf(t.models)]));
const cited = Object.fromEntries(T.filter(t => t.cited).map(t => [t.ref, citedOf(t.cited)]));
const tally = o => Object.values(o).reduce((a, v) => (a[v] = (a[v] || 0) + 1, a), {});
const anyRet = T.filter(t => t.models.some(k => st(k) === 'retired')).map(t => t.ref);
const hosted9 = T.filter(t => second[t.ref].model_access === 'public product or API').map(t => t.ref);
const HP = ['openai', 'anthropic', 'gemini-api', 'vertex', 'xai', 'grayswan'];
const namesHosted = T.filter(t => t.models.some(k => HP.includes(MOD[key(k)].page))).map(t => t.ref);
const can = holds.filter(r => cited[r] === 'can');
const P = { P129: hosted9.every(r => anyRet.includes(r)), P130: can.length <= 3, P131: namesHosted.every(r => anyRet.includes(r)) };
const pres = tally(Object.fromEntries(T.map(t => [t.ref, String(second[t.ref].available_today)])));
const studioOk = M.studio.claims.reduce((a, c) => a + c.retired.filter(k => st(k) === 'retired').length + c.offered.filter(k => off(st(k))).length, 0);
const studioN = M.studio.claims.reduce((a, c) => a + c.retired.length + c.offered.length, 0);
const ids = [...new Set(T.flatMap(t => t.models.map(key)))];
const byStatus = tally(Object.fromEntries(ids.map(k => [k, MOD[k].status])));

const b = await chromium.launch(); let fails = 0;
for (const [w, scheme, shot] of [[1100, 'light', 'process/5.png'], [390, 'dark', 'shot-390.png']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = []; const bad = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForTimeout(500);
  const want = (name, cond) => { if (!cond) bad.push(name); };
  const tx = s => p.evaluate(s => document.querySelector(s).textContent, s);
  const E = R.readings.earliest;
  // the results file agrees with the recount
  want('results: test codes', JSON.stringify(Object.entries(tally(code)).sort()) === JSON.stringify(Object.entries(E.test_codes).sort()));
  want('results: cited codes', JSON.stringify(Object.entries(tally(Object.fromEntries(holds.map(r => [r, cited[r]])))).sort()) === JSON.stringify(Object.entries(E.cited_codes).sort()));
  want('results: predictions', Object.keys(P).every(k => P[k] === R.predictions[k]));
  want('results: studio', R.studio.hold === studioOk && R.studio.claims === studioN);
  want('results: models', JSON.stringify(Object.entries(byStatus).sort()) === JSON.stringify(Object.entries(R.models_named.by_status).sort()));
  want('results: hosted9', JSON.stringify(R.studio.hosted9) === JSON.stringify(hosted9.sort((a, b) => a - b)));
  // the figure, row by row and chip by chip
  const rows = await p.evaluate(() => [...document.querySelectorAll('#mods .mrow')].map(g => ({ ref: g.dataset.ref, code: g.dataset.code, cited: g.dataset.cited,
    chips: [...g.querySelectorAll('.chip')].filter(c => c.dataset.extra === '0').map(c => [c.dataset.k, c.dataset.st]) })));
  want('figure: 28 rows', rows.length === T.length && T.length === 28);
  for (const r of rows) {
    const t = T.find(z => z.ref === r.ref);
    want(`figure: row ${r.ref} code`, r.code === code[r.ref]);
    want(`figure: row ${r.ref} cited`, r.cited === (cited[r.ref] || ''));
    const exp = t.models.length ? t.models.map(k => [k, st(k)]) : [['', 'none']];
    want(`figure: row ${r.ref} chips`, JSON.stringify(r.chips) === JSON.stringify(exp));
  }
  // the sentences
  const a8 = await tx('#a8c'), mn = await tx('#mNote'), co = await tx('#corr84');
  want('answer: as presented', a8.includes(`gave ${pres.no} of the ${T.length} tests`) && a8.includes(`left ${pres.unknown} unsettled`));
  want('answer: read again', a8.includes(`${anyRet.length} of the ${T.length} name a retired model`) && a8.includes(`of the ${holds.length} results that hold`));
  want('note: studio', mn.includes(`${hosted9.filter(r => anyRet.includes(r)).length} of the ${hosted9.length} hosted tests`) && mn.includes(`each of its ${studioN} statements`));
  want('note: tests', mn.includes(`Of all ${T.length} tests repeatable on paper, ${anyRet.length} name at least one model since retired`));
  want('note: models', mn.includes(`Of the ${ids.length - (byStatus['not found'] || 0)} models identified, ${byStatus.retired} are retired`));
  want('note: cited', mn.includes(`for ${['none', 'one', 'two', 'three'][can.length]} (${can.join(' and ')})`));
  want('corrections: dated entry', co.startsWith('Corrected 19 November, after the presentation.') && co.includes(`${anyRet.length} of ${T.length} name a model since retired`));
  const pr = await p.evaluate(() => [...document.querySelectorAll('#preds84 tbody tr')].map(tr => [tr.dataset.p, tr.lastChild.textContent]));
  want('predictions: table', pr.length === 3 && pr.every(([k, v]) => v === (P[k] ? 'held' : 'failed')));
  // the page as presented
  await p.click('[data-mmode="presented"]'); await p.waitForTimeout(150);
  const pv = await p.evaluate(() => [...document.querySelectorAll('#mods .mrow')].reduce((a, g) => (a[g.dataset.pres] = (a[g.dataset.pres] || 0) + 1, a), {}));
  want('as presented: counts', pv.no === pres.no && pv.yes === pres.yes && pv.unknown === pres.unknown);
  await p.click('[data-mmode="now"]'); await p.waitForTimeout(150);
  const sw = await p.evaluate(() => document.documentElement.scrollWidth <= document.documentElement.clientWidth);
  want('no sideways scroll', sw); want('no errors', errs.length === 0);
  console.log(`${w}px ${scheme}: ${bad.length ? 'FAILED ' + bad.join('; ') : 'passed'} (${rows.length} rows)${errs.length ? ' errors: ' + errs.join(' | ') : ''}`);
  fails += bad.length;
  if (!process.env.NOSHOT && !bad.length) await p.screenshot({ path: path.join(here, shot), fullPage: true });
}
await b.close();
console.log(fails ? `verify84: ${fails} failed` : 'verify84: passed');
process.exit(fails ? 1 : 0);
