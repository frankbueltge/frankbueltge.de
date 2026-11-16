// Check 79 (fifth state, after the presentation): open the work's page and its copy in the presentation at 1100 px
// light and 390 px dark; read the corrected figures from the page a visitor sees and compare them with results79.json
// and with a recount from correction79.json, data77.js and coding78.json; check errors and sideways scroll. Writes
// process/5.png (light, the work's page) and shot-390.png (dark). verify78.mjs still holds for study 78's figures;
// it writes process/4.png, so run it on a copy of this folder. verify77.mjs's count of six acts on a public body is
// superseded by this state (five).
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url));
const J = f => JSON.parse(fs.readFileSync(path.join(here, f), 'utf8'));
const js = f => JSON.parse(fs.readFileSync(path.join(here, f), 'utf8').split('=').slice(1).join('=').replace(/;\s*$/, ''));
const R = J('results79.json'), K = J('correction79.json'), D7 = js('data77.js'), C8 = J('coding78.json'), R8 = J('results78.json');
// independent recount, not from results79.json
const st = Object.fromEntries(K.state.map(x => [x.id, x.now])), dr = Object.fromEntries(K.direction.map(x => [x.id, x.now]));
const f8 = Object.fromEntries(C8.first.A.map(x => [x.id, x]));
const acts = D7.acts.map(a => ({ id: a[0], target: a[6], was: a[8], pub: a[7] }))
  .concat(R8.A.new.map(i => ({ id: i, target: f8[i].act_target, was: f8[i].state, pub: f8[i].target_public ? 1 : 0 })))
  .map(a => ({ ...a, now: st[a.id] || a.was, dir: dr[a.id] || 'against' }));
const n = f => acts.filter(f).length;
const conc = n(a => a.now === 'concluded'), concWas = n(a => a.was === 'concluded'), fav = n(a => a.dir === 'for');
const uAg = n(a => a.target === 'user' && a.dir === 'against'), mAg = n(a => a.target === 'maker' && a.dir === 'against');
const mAgC = n(a => a.target === 'maker' && a.dir === 'against' && a.now === 'concluded'), uAgC = n(a => a.target === 'user' && a.dir === 'against' && a.now === 'concluded');
const first60 = acts.slice(0, 60), c60 = first60.filter(a => a.now === 'concluded').length, c60was = first60.filter(a => a.was === 'concluded').length;
const pubNow = acts.filter(a => a.pub && !K.target_public.some(x => x.id === a.id && !x.now)).length;
const b = await chromium.launch(); let fails = 0;
const pages = [['work', 'file://' + path.join(here, 'index.html')], ['presentation', 'file://' + path.join(here, '../../../presentations/cycle-015/index.html')]];
for (const [name, url] of pages) for (const [w, scheme, shot] of [[1100, 'light', 'process/5.png'], [390, 'dark', 'shot-390.png']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = []; const bad = [];
  p.on('pageerror', e => errs.push(e.message)); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto(url); await p.waitForTimeout(300);
  const q = s => p.evaluate(s); const t = s => q(`document.querySelector('${s}').textContent`);
  const want = (nm, cond) => { if (!cond) bad.push(nm); };
  want('recount', acts.length === 69 && conc === R.n69.state.concluded && concWas === R.n69.state_presented.concluded && fav === R.for_the_party.length &&
    uAg === R.n69.target_direction['user against'] && mAg === R.against_maker.n && mAgC === R.against_maker.concluded_n && c60 === R.n60.corrected.concluded && c60was === 34 && pubNow === R.on_a_public_body.corrected.length);
  want('kicker', (await t('.kicker')).includes('corrected 16 November 2026'));
  const a10 = await t('#a10');
  want('a10', a10.includes(`${c60} are concluded and ${60 - c60} only begun, not ${c60was} and ${60 - c60was}`) && a10.includes(`${fav} of the 69 acts`) && a10.includes(`${uAg} acts go against the person`) && a10.includes(`${mAg} against a developer or deployer, ${mAgC} of those concluded`));
  const k1 = await t('#k1'); want('k1', k1.includes('on 55 of 60') && k1.includes(K.state.map(x => x.id).join(', ')) && k1.includes('1677, 1694'));
  const k3 = await t('#k3');
  want('k3', k3.includes(`${conc} of 69 acts are concluded, not ${concWas}`) && k3.includes(`${69 - fav} go against the party and ${fav} for it`) && k3.includes(`holds ${mAg} acts, ${mAgC} of them concluded`) &&
    k3.includes(`${R.against_maker.concluded_on_a_firm_n} concluded acts against a firm`) && k3.includes(`are ${pubNow}, not ${pubNow + 1}`));
  // the figure, as corrected
  const sq = async () => q(`[...document.querySelectorAll('#figK rect.sq')].map(r=>[+r.dataset.id,r.dataset.state,r.dataset.dir,r.dataset.target])`);
  let s = await sq();
  want('fig now', s.length === 69 && s.every(([i, a, d, g]) => { const x = acts.find(y => y.id === i); return x && x.now === a && x.dir === d && x.target === g; }));
  want('dots', (await q(`document.querySelectorAll('#figK circle.dot').length`)) === K.state.length + K.direction.length);
  const tn = await t('#tallyK');
  want('tally now', tn.includes(`${conc} concluded, ${69 - conc} begun`) && tn.includes(`used the AI ${uAg} (${uAgC} concluded)`) && tn.includes(`deployer ${mAg} (${mAgC} concluded)`) && tn.includes(`favour ${fav}.`));
  await p.click('#figK rect.sq[data-id="1694"]');
  const ro = await t('#readoutK'); const e = K.direction.find(x => x.id === 1694);
  want('readout 1694', ro.includes('Incident 1694') && ro.includes(e.quote) && ro.includes('in that party') && ro.includes('Offered by the Studio'));
  await p.click('#figK rect.sq[data-id="199"]');
  want('readout 199', (await t('#readoutK')).includes('opened (presented as concluded)') && (await t('#readoutK')).includes(K.state[0].quote));
  // as presented
  await p.click('[data-k="was"]'); s = await sq();
  want('fig was', s.length === 69 && s.every(([i, a, d]) => acts.find(y => y.id === i).was === a && d === 'against') && (await q(`document.querySelectorAll('#figK circle.dot').length`)) === 0);
  want('tally was', (await t('#tallyK')).includes(`${concWas} concluded, ${69 - concWas} begun`));
  await p.click('[data-k="now"]');
  // the table of the 60 acts
  const cells = await q(`[...document.querySelectorAll('#pacts tbody tr')].map(r=>[+r.dataset.id,r.cells[4].textContent,r.cells[5].textContent])`);
  want('table rows', cells.length === 60);
  want('table state', cells.filter(c => c[2].includes('corrected 16 November')).map(c => c[0]).join() === K.state.map(x => x.id).sort((a, b) => a - b).join() && cells.every(c => c[2].startsWith(acts.find(y => y.id === c[0]).now)));
  want('table direction', cells.filter(c => c[1].includes('favour')).map(c => c[0]).join() === K.direction.map(x => x.id).sort((a, b) => a - b).join());
  await p.click('[data-acts="pub"]');
  want('table pub', (await q(`document.querySelectorAll('#pacts tbody tr').length`)) === pubNow);
  await p.click('[data-acts="all"]');
  want('chk4', (await t('#chk4')).includes(`${c60} of the 60 acts are concluded`) && (await t('#chk4')).includes(`gave ${c60was} and ${60 - c60was}`));
  for (const f of ['correction79.json', 'results79.json', 'analyse79.py']) want('link ' + f, await q(`[...document.querySelectorAll('a')].some(a=>a.getAttribute('href').endsWith('${f}'))`));
  const sw = await q('document.documentElement.scrollWidth'), iw = await q('innerWidth');
  want('no sideways scroll', sw <= iw);
  if (name === 'work') await p.screenshot({ path: path.join(here, shot), fullPage: true });
  console.log(name, w, scheme, bad.length ? 'FAIL ' + bad.join('; ') : 'ok', errs.length ? 'ERRORS ' + errs.join(' | ') : 'no errors'); fails += bad.length + errs.length; await p.close();
}
await b.close(); process.exit(fails ? 1 : 0);
