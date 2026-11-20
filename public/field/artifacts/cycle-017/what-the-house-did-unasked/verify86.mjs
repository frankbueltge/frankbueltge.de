// Study 86 (second state, session 284): open the page at 1100 px light and 390 px dark, read every figure of state 2
// (data-k86), the counts of the unit chart, the marks of the scatter and the verdicts of P135 to P137 from the page a
// visitor sees, and compare them with counts recomputed here from items85.json, candidates86.json, codes86.json and
// declared86.json, independently of scores86.py's summary and of the page's own script; press a mark and a square and
// check their readouts and links; check errors and sideways scroll; write process/2.png from the light pass
// (NOSHOT=1 skips it).
// Usage: node verify86.mjs [clones-dir]   With the directory that holds full clones of `ulysses` and `field-research`,
// the correction of study 85 (who signed) is recounted from Git too; without it, that one check is reported as skipped.
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const rd = f => JSON.parse(fs.readFileSync(path.join(here, f), 'utf8'));
const ALL = rd('items85.json'), CA = rd('candidates86.json').candidates, CO = rd('codes86.json'), DE = rd('declared86.json');
const RES = rd('results86.json');

let checks = 0, fails = 0;
const eq = (a, b, what) => { checks++; if (String(a).trim() !== String(b).trim()) { fails++; console.log('FAIL', what, JSON.stringify(a), '!=', JSON.stringify(b)); } };
const ok = (c, what) => { checks++; if (!c) { fails++; console.log('FAIL', what); } };
const g = x => x.toLocaleString('en-GB');
const med = xs => { xs = [...xs].sort((a, b) => a - b); const m = xs.length >> 1; return xs.length % 2 ? xs[m] : (xs[m - 1] + xs[m]) / 2; };
const lagText = d => d < 1 ? Math.round(d * 24) + ' hours' : (Math.round(d * 10) / 10) + ' days';
const key = d => [d.rule, d.practice, d.commit, d.path].join('|');

// ---- part A, recomputed here
const CENSUS = Date.parse('2026-11-19T22:29:21Z');
const I = ALL.filter(i => i.breach);
const cand = Object.fromEntries(CA.map(c => [c.id, c]));
const sight = {}, under = new Set(), within = new Set();
for (const p of CO.partA) {
  const c = cand[p.candidate]; ok(c, 'candidate ' + p.candidate + ' exists');
  for (const it of p.items) {
    const k = key(it);
    ok(I.some(i => key(i) === k), `coded item ${k} is a breach of study 85`);
    if (p.code === 'item') { ok(Date.parse(c.time) <= CENSUS, `sighting ${c.id} before the census`);
      if (!sight[k] || Date.parse(c.time) < Date.parse(sight[k].time)) sight[k] = c; }
    else if (p.code === 'under') under.add(k);
    else if (p.asserts_within) within.add(k);
  }
}
const lag = i => ((sight[key(i)] ? Date.parse(sight[key(i)].time) : CENSUS) - Date.parse(i.time)) / 864e5;
const seen = I.filter(i => sight[key(i)]), uns = I.filter(i => !sight[key(i)]);
for (const i of seen) ok(lag(i) >= 0, `sighting after the deed ${key(i)}`);
const robustOf = i => i.breach && (i.blocks_breach ?? true) && (i.ascii_breach ?? true);
const isFD = i => i.rule === 'digest-words' && i.practice === 'field';
const E = {};
E.a_n = g(I.length); E.a_seen = g(seen.length); E.a_unseen = g(uns.length);
E.a_seen_lag = lagText(med(seen.map(lag))); E.a_census_lag = g(Math.round(med(uns.map(lag))));
E.a_under = g(I.filter(i => under.has(key(i))).length); E.a_under2 = E.a_under;
E.a_within = g(I.filter(i => within.has(key(i))).length);
E.a_robust = g(I.filter(robustOf).length); E.a_robust_seen = g(seen.filter(robustOf).length);
E.a_fd = g(I.filter(isFD).length); E.a_fd_az = g(I.filter(i => isFD(i) && i.ascii > 2500).length);
E.a_cands = g(CA.length); E.a_item_lines = g(CO.partA.filter(p => p.code === 'item').length);
for (const i of I) eq(i.robust, robustOf(i), `robust flag ${key(i)}`);
// every stated count of an under-report equals the Field's A-to-Z counter
for (const p of CO.partA.filter(p => p.code === 'under')) {
  const i = I.find(i => key(i) === key(p.items[0])); eq(p.stated, i.ascii, `under-report ${p.candidate} equals the A-to-Z count`);
  ok(p.stated <= 2500 && i.value > 2500, `under-report ${p.candidate} says under while the codebook counts over`); }
// every sighter is the practice that broke the rule (the page says so)
for (const i of seen) eq(sight[key(i)].signer, i.practice, `sighter of ${key(i)}`);

// ---- part B, recomputed here
const rows = CO.partB;
const first = rows.filter(b => b.first.deed === 'yes');
eq(first.filter(b => b.review).length, first.length, 'every first-pass deed was read again');
for (const b of rows) {
  const r = b.review, fin = b.final;
  if (!r || r.status === 'kept') { for (const k of ['deed', 'actor', 'relation', 'seer', 'trace'])
    eq(fin[k], b.first[k], `row ${b.row} final ${k} as first pass`); }
  else if (r.status === 'changed') { for (const [k, v] of Object.entries(r.change)) eq(fin[k], v, `row ${b.row} change ${k}`);
    eq(fin.deed, 'yes', `row ${b.row} changed stays a deed`); }
  else if (r.status === 'dropped') eq(fin.deed, 'no', `row ${b.row} dropped`);
  else if (r.status === 'duplicate') ok(fin.dup_of && rows.some(x => x.row === fin.dup_of && x.final.deed === 'yes'), `row ${b.row} duplicate of a deed`);
  if (r && r.status !== 'kept') ok(r.why && r.why.length > 10, `row ${b.row} review gives a reason`);
}
const deeds = rows.filter(b => b.final.deed === 'yes' && !('dup_of' in b.final));
const S = s => deeds.filter(d => d.final.seer === s).length;
const stated = deeds.filter(d => d.final.seer !== 'not stated');
const rev = s => rows.filter(b => b.review && b.review.status === s).length;
E.b_rows = g(rows.length); E.b_rows2 = E.b_rows; E.b_deeds = g(deeds.length); E.b_deeds2 = E.b_deeds;
E.b_stated = g(stated.length); E.b_arch = g(S('the architect')); E.b_order = g(S("a session at the architect's order"));
E.b_unbidden = g(S('the acting machine itself') + S('another machine of the house') + S('a guard, test, gate or CI'));
E.b_outside = g(S('someone outside the house'));
E.b_git = g(deeds.filter(d => d.final.trace === 'in Git').length); E.b_nogit = g(deeds.filter(d => d.final.trace === 'not in public Git').length);
E.b_kept = g(rev('kept')); E.b_changed = g(rev('changed')); E.b_dropped = g(rev('dropped')); E.b_dup = g(rev('duplicate'));
const mo = ['2026-08', '2026-09', '2026-10', '2026-11'].map(m => deeds.filter(d => d.date.startsWith(m)).length);
eq(mo.reduce((a, b) => a + b, 0), deeds.length, 'every deed falls in August to November');
E.b_months = mo.slice(0, 3).map(g).join(', ') + ' and ' + g(mo[3]);
E.b_beyond = g(deeds.filter(d => d.final.relation === 'beyond').length); E.b_against = g(deeds.filter(d => d.final.relation === 'against').length);

// ---- the Atelier's question: its declared rule, recounted from the versions' list
const AD = ALL.filter(i => i.rule === 'digest-words' && i.practice === 'atelier');
eq(DE.list.length, AD.length, 'declared: every Atelier digest version counted');
for (const v of DE.list) { const i = AD.find(i => i.commit === v.commit); ok(i && i.value === v.codebook, `declared: codebook value of ${v.commit.slice(0, 8)}`);
  eq(v.after, Date.parse(v.time) >= Date.parse(DE.declared_on), `declared: after flag of ${v.commit.slice(0, 8)}`); }
const aft = DE.list.filter(v => v.after);
E.dec_node = DE.runtime.node; E.dec_icu = DE.runtime.icu;
E.dec_after = g(aft.filter(v => v.declared > 2500).length); E.dec_n_after = g(aft.length);
E.dec_all = g(DE.list.filter(v => v.declared > 2500).length); E.dec_n = g(DE.list.length);
E.dec_max = g(Math.max(...DE.list.map(v => v.declared)));
E.dec_chromium = g(54); // the Atelier's own figure (digest.json figures.b_over_after, ulysses 78dd6f7), cited, not recounted
E.dec_codebook = g(aft.filter(v => v.codebook > 2500).length);

// ---- the correction of study 85: who signed
const clones = process.argv[2];
let wfItems = RES.correction85.items_recoded, wfCommits = RES.correction85.commits_recoded;
if (clones) {
  const wf = new Map();
  for (const [repo, name] of [['ulysses', 'Atelier'], ['field-research', 'Meridian (autoloop)']]) {
    const log = execFileSync('git', ['-C', path.join(clones, repo), 'log', '--no-merges', '--format=%H|%an', '--until=2026-11-19T22:29:21Z', 'main']).toString();
    for (const l of log.split('\n')) if (l.endsWith('|' + name)) wf.set(l.split('|')[0], repo + ' ' + name);
  }
  const hit = ALL.filter(i => wf.has(i.commit));
  wfItems = hit.length; const per = {}; for (const c of new Set(hit.map(i => i.commit))) per[wf.get(c)] = (per[wf.get(c)] || 0) + 1;
  eq(JSON.stringify(per), JSON.stringify(RES.correction85.commits_recoded), 'correction: commits per workflow');
  eq(hit.filter(i => i.breach).length, 0, 'correction: none of them broke a rule');
  ok(hit.every(i => i.signer === 'practice'), 'correction: study 85 had coded all of them as the practice');
} else { console.log('SKIP correction recount from Git (no clones directory given); figures taken from results86.json'); }
const prac85 = ALL.filter(i => i.signer === 'practice').length, wf85 = ALL.filter(i => i.signer === 'other').length;
E.corr_items = g(wfItems); E.corr_commits = g(Object.values(wfCommits).reduce((a, b) => a + b, 0));
E.corr_prac = g(prac85 - wfItems); E.corr_wf = g(wf85 + wfItems);

// ---- predictions, recomputed
const V = { P135: seen.length <= 34 ? 'held' : 'failed',
  P136: stated.length < 10 ? 'uninformative' : (S('the architect') * 2 > stated.length ? 'held' : 'failed'),
  P137: (() => { const tr = deeds.filter(d => d.final.trace !== 'unclear'); const n = deeds.filter(d => d.final.trace === 'in Git').length;
    return tr.length < 10 ? 'uninformative' : (n * 3 >= 2 * tr.length ? 'held' : 'failed'); })() };
for (const k of Object.keys(V)) eq(RES.predictions[k].verdict, V[k], 'results ' + k);
eq(RES.partA.seen_before_census, seen.length, 'results seen'); eq(RES.partB.deeds, deeds.length, 'results deeds');

// ---- the page
const browser = await chromium.launch();
for (const [w, scheme] of [[1100, 'light'], [390, 'dark']]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme, deviceScaleFactor: 1 });
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(url); await page.waitForTimeout(500);
  eq(errs.length, 0, `${w}: page errors ${errs.join(' | ')}`);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= w, `${w}: sideways scroll ${sw}`);
  const K = await page.evaluate(() => [...document.querySelectorAll('[data-k86]')].map(e => [e.getAttribute('data-k86'), e.textContent]));
  for (const [k, v] of K) { ok(k in E, `${w}: unchecked figure ${k}`); if (k in E) eq(v, E[k], `${w}: figure ${k}`); }
  for (const k of Object.keys(E)) ok(K.some(([x]) => x === k), `${w}: figure ${k} on the page`);
  // unit chart
  const U = await page.$$eval('#units text[data-group]', ts => ts.map(t => [t.dataset.group, t.textContent]));
  for (const [s, v] of U) eq(v, g(S(s)), `${w}: unit count ${s}`);
  eq(U.reduce((a, [, v]) => a + Number(v), 0), deeds.length, `${w}: unit counts add up`);
  eq(await page.$$eval('#units rect[data-row]', r => r.length), deeds.length, `${w}: squares drawn`);
  eq(await page.$$eval('#units rect[data-row].g', r => r.length), deeds.filter(d => d.final.trace === 'in Git').length, `${w}: filled squares`);
  // scatter
  eq(await page.$$eval('#seen circle', c => c.length), I.length, `${w}: marks drawn`);
  eq(await page.$$eval('#seen circle.pr', c => c.length), seen.length, `${w}: marks named before the census`);
  await page.click('[data-seen="robust"]');
  eq(await page.$$eval('#seen circle.dim', c => c.length), I.length - I.filter(robustOf).length, `${w}: robust view dims the rest`);
  await page.click('[data-seen="all"]');
  eq(await page.$$eval('#seen circle.dim', c => c.length), 0, `${w}: all view dims none`);
  await page.locator('#seen circle.pr').last().click();
  const ro = await page.$eval('#seenout', e => ({ t: e.textContent, links: [...e.querySelectorAll('a')].map(a => a.href) }));
  ok(/named first by the practice/.test(ro.t) && ro.links.filter(h => /github\.com\/frankbueltge\/[^/]+\/commit\/[0-9a-f]{12}$/.test(h)).length >= 2, `${w}: mark readout ${ro.t.slice(0, 100)}`);
  await page.click('#units rect[data-row]');
  const uo = await page.$eval('#unitout', e => ({ t: e.textContent, links: [...e.querySelectorAll('a')].map(a => a.href) }));
  ok(uo.links.length === 1 && /decision-log\.md\?plain=1#L\d+$/.test(uo.links[0]) && /seen first by/.test(uo.t), `${w}: square readout ${uo.t.slice(0, 100)}`);
  // predictions
  const P = await page.$$eval('#preds86 p', ps => ps.map(p => [p.dataset.pred, p.querySelector('span').textContent]));
  eq(P.length, 3, `${w}: three predictions`); for (const [k, v] of P) eq(v, V[k], `${w}: prediction ${k}`);
  if (w === 1100 && !process.env.NOSHOT) { fs.mkdirSync(path.join(here, 'process'), { recursive: true });
    await page.locator('#seen circle.pr').last().click(); await page.click('#units rect[data-row]');
    await page.screenshot({ path: path.join(here, 'process', '2.png'), fullPage: true }); }
  await page.close();
}
await browser.close();
console.log(`${checks - fails} of ${checks} checks passed`); process.exit(fails ? 1 : 0);
