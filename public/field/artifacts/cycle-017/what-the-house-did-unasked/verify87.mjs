// Check 87 (third state, session 285): open the page at 1100 px light and 390 px dark, read every figure of the check
// (data-k87), its tables, the unit chart of the final deeds and the verdicts of P138 to P140 and of study 86's three read
// again, from the page a visitor sees, and compare them with counts recomputed here from items85.json, first87.json,
// items87.json, candidates87.json, codesA87.json, codes86.json, blind87.json, codes87.json and commits87.json,
// independently of scores87.py's summary and of the page's own script; press an act of authority and check its readout
// and links; check errors and sideways scroll; write process/3.png from the light pass (NOSHOT=1 skips it).
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const rd = f => JSON.parse(fs.readFileSync(path.join(here, f), 'utf8'));
let checks = 0, fails = 0;
const eq = (a, b, what) => { checks++; if (String(a).trim() !== String(b).trim()) { fails++; console.log('FAIL', what, JSON.stringify(a), '!=', JSON.stringify(b)); } };
const ok = (c, what) => { checks++; if (!c) { fails++; console.log('FAIL', what); } };
const g = x => x.toLocaleString('en-GB');
const keyOf = d => [d.rule, d.practice, d.commit, d.path].join('|');
const CENSUS = Date.parse('2026-11-19T22:29:21Z');
const E = {};

// ---- the Atelier's correction, derived here
const ALL85 = rd('items85.json'), RU85 = rd('rules85.json'), FIRST = rd('first87.json'), R85 = rd('results85.json');
const START = Object.fromEntries(RU85.filter(r => r.practice === 'atelier' && ['score-lines', 'critique-lines'].includes(r.rule)).map(r => [r.rule, Date.parse(r.start)]));
const MINE = ALL85.filter(i => i.practice === 'atelier' && i.rule in START);
const ART = new Set(MINE.filter(i => !i.path.startsWith('presentations/')).map(i => i.rule + '|' + i.blob));
const COPY = MINE.filter(i => i.path.startsWith('presentations/') && ART.has(i.rule + '|' + i.blob));
const DROP = new Set(MINE.filter(i => (i.path.startsWith('presentations/') && ART.has(i.rule + '|' + i.blob)) || Date.parse(FIRST[i.path].time) < START[i.rule]).map(keyOf));
const I = ALL85.filter(i => !DROP.has(keyOf(i))), gone = ALL85.filter(i => DROP.has(keyOf(i)));
eq(MINE.filter(i => i.breach).length, 20, "the Atelier's 20 marks");
eq(COPY.length, MINE.filter(i => i.path.startsWith('presentations/')).length, 'every presentation version is a copy');
eq(COPY.filter(i => i.breach).length, 10, 'ten presentation copies over');
const robustOf = i => i.breach && (i.blocks_breach ?? true) && (i.ascii_breach ?? true);
E.cor_removed = g(gone.filter(i => i.breach).length); E.cor_removed2 = E.cor_removed; E.cor_was = g(R85.breach);
eq(R85.breach, ALL85.filter(i => i.breach).length, 'census as published');
E.cor_bound = g(gone.length); E.cor_copies = g(COPY.length); E.cor_standing = g(MINE.filter(i => i.breach && !DROP.has(keyOf(i))).length);
E.now_breach = g(I.filter(i => i.breach).length); E.now_bound = g(I.length); E.was_breach = g(ALL85.filter(i => i.breach).length); E.was_bound = g(ALL85.length);
E.now_robust = g(I.filter(robustOf).length); E.was_robust = g(ALL85.filter(robustOf).length);
E.codebook_decides = g(I.filter(i => i.breach && !robustOf(i)).length);
const early = items => { let eB = 0; for (const r of RU85) {
  const st = Date.parse(r.start), en = r.end ? Date.parse(r.end) : Date.parse('2026-11-19T23:59:00Z');
  if ((en - st) / 864e5 < 14) continue;
  const its = items.filter(i => i.rule === r.rule && i.practice === r.practice && Date.parse(i.time) >= st && Date.parse(i.time) < en);
  const e = its.filter(i => Date.parse(i.time) < st + 7 * 864e5), l = its.filter(i => Date.parse(i.time) >= st + 7 * 864e5);
  if (e.length < 5 || l.length < 5) continue; eB += e.filter(i => i.breach).length; } return eB; };
E.now_early = g(early(I)); E.was_early = g(early(ALL85));

// ---- part A: the struck limits, their sightings, and P135 on study 85's rules
const I87 = rd('items87.json'), CA = Object.fromEntries(rd('candidates87.json').candidates.map(c => [c.id, c])), CO = rd('codesA87.json');
const sight = {}, under = new Set();
for (const p of CO) { const c = CA[p.candidate]; ok(c, `candidate ${p.candidate} exists`);
  for (const it of p.items) { const k = keyOf(it); ok(I87.some(i => keyOf(i) === k && i.breach), `coded item ${k} is a struck-limit breach`);
    if (p.code === 'item') { ok(Date.parse(c.time) <= CENSUS, `sighting ${c.id} before the census`);
      if (!sight[k] || Date.parse(c.time) < Date.parse(sight[k].time)) sight[k] = c; }
    else if (p.code === 'under') under.add(k); } }
const B87 = I87.filter(i => i.breach), struck = I87.filter(i => i.rule !== 'line-chars-160'), sb = struck.filter(i => i.breach);
for (const i of B87) if (sight[keyOf(i)]) { ok(Date.parse(sight[keyOf(i)].time) >= Date.parse(i.time), `sighting after the deed ${keyOf(i)}`);
  eq(sight[keyOf(i)].signer, i.practice, `sighter of ${keyOf(i)} is the practice`); }
E.st_bound = g(struck.length); E.st_breach = g(sb.length); E.st_seen = g(sb.filter(i => sight[keyOf(i)]).length); E.st_seen2 = E.st_seen;
E.st_under = g(B87.filter(i => under.has(keyOf(i))).length);
E.at_breach = g(B87.filter(i => i.practice === 'atelier').length); E.lc_bound = g(I87.filter(i => i.rule === 'line-chars-160').length);
const logC = Object.values(CA).filter(c => c.repo === 'frankbueltge.de');
E.log_cands = g(logC.length); E.cands = g(Object.keys(CA).length); E.cands_new = g(CO.length);
eq(CO.filter(p => CA[p.candidate].repo === 'frankbueltge.de' && p.code === 'item').length, 0, 'the decision log names no item');
const C86 = rd('codes86.json'), C86A = rd('candidates86.json').candidates, cand86 = Object.fromEntries(C86A.map(c => [c.id, c]));
const s85 = {}; for (const p of C86.partA) if (p.code === 'item') for (const it of p.items) { const c = cand86[p.candidate];
  if (!s85[keyOf(it)] || Date.parse(c.time) < Date.parse(s85[keyOf(it)].time)) s85[keyOf(it)] = c; }
const old = I.filter(i => i.breach), oldSeen = old.filter(i => s85[keyOf(i)]);
E.old_seen = g(oldSeen.length); E.old_n = g(old.length);
E.all_seen = g(oldSeen.length + sb.filter(i => sight[keyOf(i)]).length); E.all_n = g(old.length + sb.length);
const struckRows = {}; for (const i of I87) { const k = i.rule + '|' + i.practice; const c = struckRows[k] ||= { b: 0, x: 0, s: 0, m: null };
  c.b++; c.x += i.breach; c.s += !!(i.breach && sight[keyOf(i)]); c.m = c.m === null ? i.value : Math.max(c.m, i.value); }

// ---- part B: agreement and the final deeds
const blind = Object.fromEntries(rd('blind87.json').rows.map(r => [r.row, r])), pub = Object.fromEntries(C86.partB.map(r => [r.row, r]));
const C87 = rd('codes87.json').partB;
eq(C87.length, 200, 'every row coded twice');
const kappa = pairs => { const n = pairs.length, po = pairs.filter(([a, b]) => a === b).length / n;
  const ca = {}, cb = {}; for (const [a, b] of pairs) { ca[a] = (ca[a] || 0) + 1; cb[b] = (cb[b] || 0) + 1; }
  const pe = Object.keys({ ...ca, ...cb }).reduce((s, c) => s + (ca[c] || 0) * (cb[c] || 0), 0) / n / n;
  return [((po - pe) / (1 - pe)).toFixed(2), (100 * po).toFixed(0) + ' %', n]; };
const both = C87.filter(r => r.decision === 'both');
const KA = { deed: kappa(C87.map(r => [pub[r.row].final.deed === 'yes', blind[r.row].deeds.length > 0])) };
for (const f of ['relation', 'seer', 'trace', 'actor']) KA[f] = kappa(both.map(r => [pub[r.row].final[f], blind[r.row].deeds[r.blind_match][f]]));
for (const r of C87) { eq(r.published, pub[r.row].final.deed, `row ${r.row} published code`); eq(r.blind, blind[r.row].deeds.length ? 'yes' : 'no', `row ${r.row} blind code`);
  if (r.decision !== 'neither' && r.decision !== 'both') ok(r.why && r.why.length > 10, `row ${r.row} decision gives a reason`);
  if (r.decision === 'dropped') eq(r.deeds.length, 0, `row ${r.row} dropped holds no deed`); }
E.blind_only = g(C87.filter(r => r.published === 'no' && r.blind === 'yes').length); E.blind_only2 = E.blind_only;
eq(C87.filter(r => r.published === 'yes' && r.blind === 'no').length, 0, 'the blind coding missed no published deed');
E.added = g(C87.filter(r => r.decision === 'added').length); E.dropped = g(C87.filter(r => r.decision === 'dropped').length);
const CM = Object.fromEntries(rd('commits87.json').deeds.map(c => [c.row + '/' + c.deed, c]));
const D = []; for (const r of C87) r.deeds.forEach((d, i) => { const c = CM[r.row + '/' + (i + 1)]; ok(c, `deed ${r.row}/${i + 1} looked for at its commit`);
  D.push({ ...d, row: r.row, date: r.date, log_line: r.log_line, found: c.found, legible: c.legible, signed: c.signed, commits: c.commits }); });
eq(Object.keys(CM).length, D.length, 'every looked-for deed is a final deed');
for (const d of D) { ok(['fault', 'authority'].includes(d.kind), `deed ${d.row} has a kind`);
  if (d.found === 'at its commit') ok(d.commits.length > 0 && d.commits.every(c => /^[0-9a-f]{40}$/.test(c.hash)), `deed ${d.row} names full hashes`);
  if (d.found !== 'at its commit') ok(d.legible !== 'deed and maker', `deed ${d.row} not found cannot show its maker`); }
const S = f => D.filter(f).length, rowsD = new Set(D.map(d => d.row));
E.b_deeds = g(D.length); E.u_deeds = E.b_deeds; E.c_deeds = E.b_deeds; E.b_rows_d = g(rowsD.size); E.b_rows = g(C87.length);
const au = D.filter(d => d.kind === 'authority'), stated = d => d.seer !== 'not stated', found = d => d.found === 'at its commit', arch = d => d.signed === "the architect's name";
E.b_auth = g(au.length); E.b_fault = g(S(d => d.kind === 'fault'));
E.b_stated = g(S(stated)); E.b_arch = g(S(d => d.seer === 'the architect')); E.b_order = g(S(d => d.seer === "a session at the architect's order"));
const MACH = ['the acting machine itself', 'another machine of the house', 'a guard, test, gate or CI'];
E.b_mach = g(S(d => MACH.includes(d.seer))); eq(S(d => d.seer === 'someone outside the house'), 0, 'nobody outside the house');
E.b_auth_arch = g(au.filter(stated).filter(d => d.seer === 'the architect').length); E.b_auth_stated = g(au.filter(stated).length);
const fd = D.filter(found); E.c_found = g(fd.length); E.c_found2 = E.c_found; E.c_dm = g(fd.filter(d => d.legible === 'deed and maker').length);
E.c_arch = g(fd.filter(arch).length); E.c_auth_found = g(au.filter(found).length); E.c_auth_arch = g(au.filter(found).filter(arch).length);
E.beyond = g(S(d => d.relation === 'beyond')); E.against = g(S(d => d.relation === 'against')); E.u_beyond = E.beyond; E.u_against = E.against;
const mo = ['2026-08', '2026-09', '2026-10', '2026-11'].map(m => S(d => d.date.startsWith(m)));
eq(mo.reduce((a, b) => a + b, 0), D.length, 'every deed falls in August to November');
E.u_months = mo.slice(0, 3).map(g).join(', ') + ' and ' + g(mo[3]);

// ---- predictions, recomputed
const shSt = sb.filter(i => sight[keyOf(i)]).length / sb.length, sh85 = 8 / 171;
const auS = au.filter(stated), auA = auS.filter(d => d.seer === 'the architect').length;
const dm = fd.filter(d => d.legible === 'deed and maker').length;
const allS = D.filter(stated), allA = allS.filter(d => d.seer === 'the architect').length;
const V = { P138: sb.length < 20 ? 'uninformative' : (shSt >= 3 * sh85 ? 'held' : 'failed'),
  P139: auS.length < 6 ? 'uninformative' : (auA * 2 > auS.length ? 'held' : 'failed'),
  P140: fd.length < 10 ? 'uninformative' : (dm * 2 <= fd.length ? 'held' : 'failed'),
  P135_again: (oldSeen.length + sb.filter(i => sight[keyOf(i)]).length) * 5 <= old.length + sb.length ? 'held' : 'failed',
  P136_again: allS.length < 10 ? 'uninformative' : (allA * 2 > allS.length ? 'held' : 'failed'),
  P137_again: fd.length * 3 >= 2 * D.length ? 'held' : 'failed' };
const R = rd('results87.json');
for (const k of ['P138', 'P139', 'P140', 'P136_again', 'P137_again']) eq(R.predictions[k].verdict, V[k], 'results ' + k);
eq(R.partA.p135.struck_added.verdict, V.P135_again, 'results P135 again');
eq(R.partB.deeds, D.length, 'results deeds'); eq(R.correction85.census_now.breach, I.filter(i => i.breach).length, 'results corrected breaches');

// ---- the page
const browser = await chromium.launch();
for (const [w, scheme] of [[1100, 'light'], [390, 'dark']]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme, deviceScaleFactor: 1 });
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(url); await page.waitForTimeout(500);
  eq(errs.length, 0, `${w}: page errors ${errs.join(' | ')}`);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth); ok(sw <= w, `${w}: sideways scroll ${sw}`);
  const K = await page.evaluate(() => [...document.querySelectorAll('[data-k87]')].map(e => [e.getAttribute('data-k87'), e.textContent]));
  for (const [k, v] of K) { ok(k in E, `${w}: unchecked figure ${k}`); if (k in E) eq(v, E[k], `${w}: figure ${k}`); }
  for (const k of Object.keys(E)) ok(K.some(([x]) => x === k), `${w}: figure ${k} on the page`);
  // tables
  const st = await page.$$eval('#struck tbody tr', trs => trs.map(t => [t.dataset.rule, t.dataset.practice, ...[...t.querySelectorAll('td')].map(td => td.textContent)]));
  eq(st.length, Object.keys(struckRows).length, `${w}: struck rows`);
  for (const r of st) { const c = struckRows[r[0] + '|' + r[1]]; eq(r.slice(4).join('|'), [g(c.b), g(c.x), g(c.s), g(c.m)].join('|'), `${w}: struck ${r[0]}/${r[1]}`); }
  const ag = await page.$$eval('#agree tbody tr', trs => trs.map(t => [t.dataset.code, ...[...t.querySelectorAll('td')].map(td => td.textContent)]));
  eq(ag.length, 5, `${w}: agreement rows`);
  for (const r of ag) eq(r.slice(2).join('|'), [g(KA[r[0]][2]), KA[r[0]][0], KA[r[0]][1]].join('|'), `${w}: agreement ${r[0]}`);
  const gt = await page.$$eval('#git tbody tr', trs => trs.map(t => [t.dataset.kind, ...[...t.querySelectorAll('td')].map(td => td.textContent)]));
  for (const r of gt) { const ds = r[0] === 'all' ? D : D.filter(d => d.kind === r[0]), f = ds.filter(found);
    eq(r.slice(2).join('|'), [g(ds.length), g(f.length), g(f.filter(d => d.legible === 'deed and maker').length), g(f.filter(arch).length)].join('|'), `${w}: git ${r[0]}`); }
  const al = await page.$$eval('#auth li', ls => ls.map(l => ({ row: Number(l.dataset.row), links: [...l.querySelectorAll('a')].map(a => a.href) })));
  eq(al.map(a => a.row).sort((a, b) => a - b).join(','), au.map(d => d.row).sort((a, b) => a - b).join(','), `${w}: acts of authority listed`);
  for (const a of al) { const d = au.find(x => x.row === a.row);
    ok(a.links.some(h => /decision-log\.md\?plain=1#L\d+$/.test(h) && h.endsWith('#L' + d.log_line)), `${w}: authority ${a.row} links its log row`);
    for (const c of d.commits) ok(a.links.some(h => h.endsWith(`/${c.repo}/commit/${c.hash.slice(0, 12)}`)), `${w}: authority ${a.row} links ${c.hash.slice(0, 8)}`); }
  eq(await page.$$eval('#prec li', l => l.length), R.partA.process_record_3000.length, `${w}: process-record statements listed`);
  // unit chart of the final deeds
  const U = await page.$$eval('#units text[data-group]', ts => ts.map(t => [t.dataset.group, t.textContent]));
  for (const [s, v] of U) eq(v, g(S(d => d.seer === s)), `${w}: unit count ${s}`);
  eq(U.reduce((a, [, v]) => a + Number(v), 0), D.length, `${w}: unit counts add up`);
  eq(await page.$$eval('#units rect[data-row]', r => r.length), D.length, `${w}: squares drawn`);
  eq(await page.$$eval('#units rect[data-row].g', r => r.length), fd.length, `${w}: filled squares`);
  eq(await page.$$eval('#units rect[data-row].au', r => r.length), au.length, `${w}: ringed squares`);
  await page.click('#units rect[data-row].au.g');
  const uo = await page.$eval('#unitout', e => ({ t: e.textContent, links: [...e.querySelectorAll('a')].map(a => a.href) }));
  ok(/act of authority/.test(uo.t) && uo.links.some(h => /decision-log\.md\?plain=1#L\d+$/.test(h)) && uo.links.some(h => /github\.com\/frankbueltge\/[^/]+\/commit\/[0-9a-f]{12}$/.test(h)), `${w}: square readout ${uo.t.slice(0, 100)}`);
  // predictions
  const P = await page.$$eval('#preds87 p', ps => ps.map(p => [p.dataset.pred, p.querySelector('span').textContent]));
  eq(P.length, 6, `${w}: six predictions`); for (const [k, v] of P) eq(v, V[k], `${w}: prediction ${k}`);
  if (w === 1100 && !process.env.NOSHOT) { fs.mkdirSync(path.join(here, 'process'), { recursive: true });
    await page.screenshot({ path: path.join(here, 'process', '3.png'), fullPage: true }); }
  await page.close();
}
await browser.close();
console.log(`${checks - fails} of ${checks} checks passed`); process.exit(fails ? 1 : 0);
