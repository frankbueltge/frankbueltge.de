// Study 85 (first state, session 283): open the page at 1100 px light and 390 px dark, read every figure of the
// answer, the table of instructions, the readings table, the first-week table and the predictions from the page a
// visitor sees, and compare them with counts recomputed here from items85.json and rules85.json, independently of
// analyse85.py's summary and of the page's own script; press a broken cell and check its readout; check errors and
// sideways scroll; write process/1.png from the light pass (NOSHOT=1 skips it).
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const rd = f => JSON.parse(fs.readFileSync(path.join(here, f), 'utf8'));
const I = rd('items85.json'), RU = rd('rules85.json'), RES = rd('results85.json');

// ---- recomputed here ----
const KIND = {}; for (const r of RU) KIND[r.rule] = r.kind;
const LIMIT = {}; for (const r of RU) LIMIT[r.rule] = r.limit;
const n = f => I.filter(f).length;
const g = x => x.toLocaleString('en-GB'), pc = x => (100 * x).toFixed(1) + ' %';
const robustOf = i => i.breach && (i.blocks_breach ?? true) && (i.ascii_breach ?? true);
const E = {};
E.bound = g(I.length); E.breach = g(n(i => i.breach));
E.pro_bound = g(n(i => KIND[i.rule] === 'prohibition')); E.duty_bound = g(n(i => KIND[i.rule] === 'duty'));
const limN = n(i => KIND[i.rule] === 'limit'), limB = n(i => KIND[i.rule] === 'limit' && i.breach);
E.lim_bound = g(limN); E.lim_breach = g(limB); E.lim_share = pc(limB / limN);
E.robust = g(n(robustOf)); E.robust2 = E.robust;
E.robust_recent = g(n(i => robustOf(i) && i.time >= '2026-11-13' && ['journal-words', 'subject-chars', 'bulletin-words'].includes(i.rule)));
// P134 from the rules' own spans
let eN = 0, eB = 0, lN = 0, lB = 0, eNf = 0, eBf = 0; const pairs = [];
for (const r of RU) {
  const st = Date.parse(r.start), en = r.end ? Date.parse(r.end) : Date.parse('2026-11-19T23:59:00Z');
  if ((en - st) / 864e5 < 14) continue;
  const its = I.filter(i => i.rule === r.rule && i.practice === r.practice && Date.parse(i.time) >= st && Date.parse(i.time) < en);
  const e = its.filter(i => Date.parse(i.time) < st + 7 * 864e5), l = its.filter(i => Date.parse(i.time) >= st + 7 * 864e5);
  if (e.length < 5 || l.length < 5) continue;
  pairs.push(r.rule + '/' + r.practice);
  eN += e.length; eB += e.filter(i => i.breach).length; lN += l.length; lB += l.filter(i => i.breach).length;
  eNf += e.filter(i => !i.first_day).length; eBf += e.filter(i => i.breach && !i.first_day).length;
}
E.early_share = pc(eB / eN); E.late_share = pc(lB / lN); E.early_share2 = E.early_share; E.late_share2 = E.late_share;
E.early_b = g(eB); E.early_n = g(eN); E.late_b = g(lB); E.late_n = g(lN);
E.early_nfd = g(eBf) + ' in ' + g(eNf) + ' (' + pc(eBf / eNf) + ')';
const dF = I.filter(i => i.rule === 'digest-words' && i.practice === 'field');
E.digest_n = g(dF.length); E.digest_br = g(dF.filter(i => i.breach).length); E.digest_ascii = g(dF.filter(i => i.ascii > 2500).length);
E.digest_br2 = E.digest_br; E.digest_ascii2 = E.digest_ascii;
E.lines_file = g(n(i => /-lines$/.test(i.rule) && i.breach)); E.lines_blocks = g(n(i => i.blocks_breach));
E.unread = g(RES.unread_blobs.field + RES.unread_blobs.atelier + RES.unread_blobs.studio);
E.arch_items = g(n(i => i.signer === 'architect-name')); E.arch_br = g(n(i => i.signer === 'architect-name' && i.breach));
E.sig_exact = g(n(i => i.exact_breach));
const cells = {};
for (const i of I) { const k = i.rule + '|' + i.practice; const c = cells[k] ||= { b: 0, x: 0, r: 0, m: null };
  c.b++; c.x += i.breach; c.r += robustOf(i); c.m = c.m === null ? i.value : Math.max(c.m, i.value); }
const pairsB = Object.values(cells).filter(c => c.x > 0).length, pairsN = Object.keys(cells).length;
const verdict = { P132: pairsB * 2 >= pairsN ? 'held' : 'failed',
  P133: n(i => KIND[i.rule] === 'prohibition' && i.breach) === 0 ? (limB > 0 ? 'held' : 'uninformative')
    : (limB / limN >= 5 * n(i => KIND[i.rule] === 'prohibition' && i.breach) / n(i => KIND[i.rule] === 'prohibition') ? 'held' : 'failed'),
  P134: eB + lB === 0 ? 'uninformative' : (eB / eN <= lB / lN ? 'held' : 'failed') };

let checks = 0, fails = 0;
const eq = (a, b, what) => { checks++; if (String(a).trim() !== String(b).trim()) { fails++; console.log('FAIL', what, JSON.stringify(a), '!=', JSON.stringify(b)); } };
// the summary written by analyse85.py must agree with the recount too
eq(RES.bound, I.length, 'results bound'); eq(RES.breach, n(i => i.breach), 'results breach');
eq(RES.pairs_breached + '/' + RES.pairs_bound, pairsB + '/' + pairsN, 'results pairs');
for (const k of ['P132', 'P133', 'P134']) eq(RES.predictions[k].verdict, verdict[k], 'results ' + k);
eq(RES.p134.early_breach + '/' + RES.p134.early, eB + '/' + eN, 'results p134 early');

const browser = await chromium.launch();
for (const [w, scheme] of [[1100, 'light'], [390, 'dark']]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme, deviceScaleFactor: 1 });
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(url); await page.waitForTimeout(400);
  eq(errs.length, 0, `${w}: page errors ${errs.join(' | ')}`);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  checks++; if (sw > w) { fails++; console.log('FAIL', w, 'sideways scroll', sw); }
  const K = await page.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-k]')].map(e => [e.getAttribute('data-k'), e.textContent])));
  for (const k of Object.keys(E)) eq(K[k], E[k], `${w}: answer ${k}`);
  for (const k of Object.keys(K)) { checks++; if (!(k in E)) { fails++; console.log('FAIL unchecked figure', k); } }
  const rows = await page.$$eval('#table tbody tr[data-rule]', trs => trs.map(t => [t.dataset.rule, t.dataset.practice, ...[...t.querySelectorAll('td')].map(td => td.textContent)]));
  eq(rows.length, Object.keys(cells).length, `${w}: table rows`);
  for (const r of rows) { const c = cells[r[0] + '|' + r[1]];
    eq(r[4], g(c.b), `${w}: bound ${r[0]}/${r[1]}`); eq(r[5], g(c.x), `${w}: broken ${r[0]}/${r[1]}`);
    eq(r[6], g(c.r), `${w}: every reading ${r[0]}/${r[1]}`);
    eq(r[7], LIMIT[r[0]] !== null ? g(c.m) : '', `${w}: largest ${r[0]}/${r[1]}`); }
  const rr = await page.$$eval('#readings tbody tr', trs => trs.map(t => [t.dataset.rule, ...[...t.querySelectorAll('td')].map(td => td.textContent)]));
  for (const r of rr) { const its = I.filter(i => i.rule === r[0]);
    eq(r[2], g(its.length), `${w}: readings bound ${r[0]}`); eq(r[3], g(its.filter(i => i.breach).length), `${w}: readings first ${r[0]}`);
    eq(r[4], g(its.filter(i => i.blocks_breach || i.ascii_breach).length), `${w}: readings second ${r[0]}`); }
  const last = await page.$$eval('#p134 tbody tr', trs => [...trs.at(-1).querySelectorAll('td')].map(td => td.textContent));
  eq(last.slice(1).join('|'), [g(eN), g(eB), g(lN), g(lB)].join('|'), `${w}: first-week pooled row`);
  eq(last[0], `All ${pairs.length} pairs, pooled`, `${w}: first-week pairs`);
  const preds = await page.$$eval('#preds p', ps => ps.map(p => [p.dataset.pred, p.querySelector('span').textContent]));
  for (const [k, v] of preds) eq(v, verdict[k], `${w}: prediction ${k}`);
  // press a broken cell: the readout names the instruction and links its commits
  await page.click('#lanes rect.c.k1');
  const ro = await page.$eval('#readout', e => ({ t: e.textContent, links: [...e.querySelectorAll('a')].map(a => a.href) }));
  checks++; if (!/broken/.test(ro.t) || !ro.links.some(h => /github\.com\/frankbueltge\/[^/]+\/commit\/[0-9a-f]{12}$/.test(h))) { fails++; console.log('FAIL', w, 'readout', ro.t.slice(0, 120)); }
  const nCells = await page.$$eval('#lanes rect.c:not(.sig)', r => r.length);
  const days = new Set(I.filter(i => i.time.slice(0, 10) >= '2026-07-12').map(i => i.rule + '|' + i.practice + '|' + i.time.slice(0, 10)));
  eq(nCells, days.size, `${w}: cells drawn`);
  if (w === 1100 && !process.env.NOSHOT) { fs.mkdirSync(path.join(here, 'process'), { recursive: true });
    await page.screenshot({ path: path.join(here, 'process', '1.png'), fullPage: true }); }
  await page.close();
}
await browser.close();
console.log(`${checks - fails} of ${checks} checks passed`); process.exit(fails ? 1 : 0);
