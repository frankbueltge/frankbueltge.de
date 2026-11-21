// State 4, the presentation: open the page as a visitor does and read every figure of section II from it, against
// data/sort.json, recounting the joins from the deeds here rather than trusting the page's script; read every figure
// of the other sections against their data once more; check the order the presentation set and the length of the
// section it cut. Run from this folder: node check_page4.mjs [wide.png] [narrow.png]
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path'; import { execFileSync } from 'child_process';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(new URL(import.meta.url).pathname);
const J = f => JSON.parse(fs.readFileSync(path.join(here, f), 'utf8'));
const S = J('data/sort.json'), C = J('data/check.json'), R = J('data/rules.json'), D = J('data/digest.json');
const type = f => f.endsWith('.html') ? 'text/html' : f.endsWith('.js') || f.endsWith('.mjs') ? 'text/javascript' : f.endsWith('.json') ? 'application/json' : 'application/octet-stream';
const srv = http.createServer((q, r) => { const f = path.join(here, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); return } r.writeHead(200, { 'content-type': type(f) }); r.end(b) }) });
await new Promise(ok => srv.listen(0, ok));
const url = `http://127.0.0.1:${srv.address().port}/`;
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('FAIL', m) } else console.log('ok', m) };
const num = s => +String(s).replace(/[^0-9.]/g, '');
const at = (o, p) => { const parts = p.split('.'); for (let i = 0; i < parts.length && o != null; i++) { let hit = false; for (let j = parts.length; j > i; j--) { const k = parts.slice(i, j).join('.'); if (Object.hasOwn(o, k)) { o = o[k]; i = j - 1; hit = true; break } } if (!hit) return null } return o };

// recounted here from the deeds
const deeds = S.act.deeds, cnt = f => deeds.filter(f).length;
const E = {
  same: cnt(d => d.join === 'same'), name: cnt(d => d.join === 'name'), lines: cnt(d => d.join === 'lines'),
  file: cnt(d => d.join === 'file'), log: cnt(d => d.join === 'log'), none: cnt(d => !d.join),
  neither: deeds.filter(d => d.join && d.join !== 'same' && d.join !== 'name' && !d.says_machine)
};
ok(E.same + E.name + E.lines + E.file + E.log === S.act.mended && E.none === S.act.unmended && deeds.length === S.act.n,
  `the joins recounted from the deeds: ${E.same} same, ${E.name} named, ${E.lines} by lines, ${E.file} by a file, ${E.log} by the log, ${E.none} unmended`);
ok(E.same + E.name + E.lines === S.act.outsider, `joined without the log: ${S.act.outsider}`);
ok(deeds.filter(d => d.join === 'lines').every(d => d.evidence.length && d.evidence.every(e => e[1] > 0)) &&
   deeds.filter(d => d.join === 'file').every(d => d.evidence.length), 'every join by lines or by a file carries its evidence');
const nj = k => E.neither.filter(d => d.join === k).length;
ok(E.neither.length === S.act.neither.n && nj('lines') === S.act.neither.join.lines && nj('file') === S.act.neither.join.file && nj('log') === S.act.neither.join.log,
  `the Field's question recounted: ${E.neither.length} name neither, ${nj('lines')} by lines, ${nj('file')} by a file, ${nj('log')} by the log`);
const sum = (o, k) => Object.values(o).reduce((a, c) => a + (c[k] || 0), 0);
ok(sum(S.rule.by_day, 'kept') === S.rule.n, `the first row's days hold ${S.rule.n} items`);
ok(sum(S.limit.by_day, 'kept') + sum(S.limit.by_day, 'one') + sum(S.limit.by_day, 'every') === S.limit.n &&
   sum(S.limit.by_day, 'one') + sum(S.limit.by_day, 'every') === S.limit.over && sum(S.limit.by_day, 'every') === S.limit.every,
  `the second row's days hold ${S.limit.n} items, ${S.limit.over} over, ${S.limit.every} on every reading`);
const derived = { 'act.anyone': E.same + E.name, 'act.git': E.lines, 'act.reader': E.file, 'act.logonly': E.log,
  'act.authority': cnt(d => d.kind === 'authority') };
const own = deeds.findIndex(d => d.row === 169), mine = deeds.findIndex(d => d.row === 138 && d.n === 1);
ok(own === 79 && deeds[own].commits[0][1].startsWith('f00897e') && deeds[mine].commits[0][1].startsWith('b9c5899') && deeds[mine].join === 'log',
  "this practice's two acts: f00897e joined by its lines, b9c5899 by the log alone");

// the section the presentation cut: state 3's section IV against state 4's section V
const words = h => h.replace(/<[^>]+>/g, ' ').replace(/&[a-z]+;/g, ' ').split(/\s+/).filter(w => /[A-Za-z0-9]/.test(w)).length;
const sec = (h, a) => { const i = h.indexOf(a), j = h.indexOf('<h2>', i + 4); return h.slice(i, j) };
const old = execFileSync('git', ['-C', here, 'show', 'a030f3c:artifacts/cycle-017/on-its-own-account/index.html'], { encoding: 'utf8' });
const now = fs.readFileSync(path.join(here, 'index.html'), 'utf8');
const w3 = words(sec(old, '<h2>IV. What self-observation can be here</h2>')), w4 = words(sec(now, '<h2>V. What self-observation can be here</h2>'));
ok(w4 <= w3 / 2 + 60, `the section on self-observation cut from ${w3} to ${w4} words (its last paragraph became section II)`);

const b = await chromium.launch();
for (const [w, scheme, shot] of [[1100, 'light', process.argv[2]], [390, 'dark', process.argv[3]]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) });
  await p.goto(url);
  await p.waitForSelector('#rules[data-done="1"]', { timeout: 30000 });
  await p.waitForSelector('html[data-check="1"]', { timeout: 30000 });
  await p.waitForSelector('#sortf[data-done="1"]', { timeout: 30000 });
  ok(errs.length === 0, `${w}px no errors ${errs.join(' | ')}`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${w}px no sideways scroll of the page`);
  ok(await p.textContent('.progress') === 'presented 21 November · state 4 of 4', `${w}px the work says it is presented`);
  // order: the two made things that carry lead, the sort follows, the check below it
  const order = await p.evaluate(() => ['#strip', '#selfc', '#sortf', 'section.check', '#rules', '#cards'].map(s => document.querySelector(s).getBoundingClientRect().top + window.scrollY));
  ok(order.every((y, i) => i === 0 || y > order[i - 1]), `${w}px digest strip, bulletin strip, sort, check, rules, cards in that order`);
  const h2 = (await p.$$eval('main > h2', es => es.map(e => e.textContent.split('.')[0]))).join(' ');
  ok(h2 === 'I II III IV V VI Method, limits, sources', `${w}px sections ${h2}`);
  // every figure on the page against its data
  const so = await p.$$eval('[data-so]', es => es.map(e => [e.getAttribute('data-so'), e.textContent]));
  const badso = so.filter(([k, t]) => num(t) !== (Object.hasOwn(derived, k) ? derived[k] : at(S, k)));
  ok(so.length === 27 && badso.length === 0, `${w}px ${so.length} figures of section II read from the page ${JSON.stringify(badso)}`);
  const ck = await p.$$eval('[data-ck]', es => es.map(e => [e.getAttribute('data-ck'), e.textContent]));
  const badck = ck.filter(([k, t]) => { const v = at(C, k); return typeof v === 'number' ? num(t) !== v : t !== String(v) });
  ok(ck.length === 57 && badck.length === 0, `${w}px ${ck.length} figures of the check read from the page ${JSON.stringify(badck)}`);
  const rv = await p.$$eval('[data-rv]', es => es.map(e => [e.getAttribute('data-rv'), e.textContent]));
  const badrv = rv.filter(([k, t]) => { const v = at(R.figures, k); return typeof v === 'number' ? num(t) !== v : t !== String(v) });
  ok(rv.length === 46 && badrv.length === 0, `${w}px ${rv.length} figures of the limits read from the page ${JSON.stringify(badrv)}`);
  const f = await p.$$eval('[data-f]', es => es.map(e => [e.getAttribute('data-f'), e.textContent]));
  const badf = f.filter(([k, t]) => num(t) !== D.figures[k]);
  ok(f.length >= 45 && badf.length === 0, `${w}px ${f.length} figures of the digest read from the page ${JSON.stringify(badf)}`);
  const corr = (await p.textContent('main')).match(/corrected 2026-11-2[01]/gi) || [];
  ok(corr.length >= 8, `${w}px ${corr.length} passages still marked corrected, as many as state 3 marked`);
  // the sort, drawn
  const lanes = await p.$$eval('#sortf g.dd', es => es.map(e => e.getAttribute('class')));
  const has = k => lanes.filter(c => c.split(' ').includes(k)).length;
  ok(lanes.length === S.act.n && has('j-same') === E.same && has('j-name') === E.name && has('j-lines') === E.lines && has('j-file') === E.file && has('j-log') === E.log && has('j-none') === E.none && has('k-authority') === derived['act.authority'],
    `${w}px ${lanes.length} lanes drawn by their join`);
  ok((await p.$$('#sortf .r1 rect')).length === Object.keys(S.rule.by_day).length, `${w}px the first row: one column per day with items`);
  const lab = (await p.$$eval('#sortf text', es => es.map(e => e.textContent))).join(' | ');
  ok(lab.includes('6,696 items') && lab.includes('broken: 0') && lab.includes('1,377 items · 156 over') && lab.includes('29 on every reading') && lab.includes('88 deeds · 77 mended'), `${w}px the rows' labels give their counts`);
  const lit = async () => (await p.$$eval('#sortf g.dd', es => es.filter(e => !e.getAttribute('class').includes('dim')).length));
  for (const [k, v] of [['anyone', E.same + E.name], ['git', E.lines], ['reader', E.file], ['logonly', E.log], ['none', E.none], ['all', S.act.n]]) {
    await p.click(`#sortask button[data-w="${k}"]`);
    ok(await lit() === v, `${w}px "${k}" lights ${v} lanes`);
    if (k !== 'all') ok(num((await p.textContent('#ssay b'))) === v, `${w}px and says ${v}`);
  }
  await p.click('#sortq');
  ok(await lit() === E.neither.length && (await p.textContent('#ssay')).includes(`Of those ${E.neither.length} mendings, ${nj('lines')} take out`), `${w}px the Field's question lights ${E.neither.length} lanes and answers ${nj('lines')}, ${nj('file')}, ${nj('log')}`);
  await p.click('#sortask button[data-w="git"]');
  ok(await lit() === nj('lines'), `${w}px with Git alone, ${nj('lines')} of them`);
  await p.click('#sortq'); await p.click('#sortask button[data-w="all"]');
  // the deed it opens on, and one opened by hand
  ok((await p.textContent('#sdeed')).includes('b9c5899') && (await p.textContent('#sdeed')).includes('Only the log'), `${w}px it opens on this practice's own act that only the log joins`);
  await p.$eval(`#sortf rect.hit[data-i="${own}"]`, e => e.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  const t = await p.textContent('#sdeed');
  ok(t.includes('f00897e') && t.includes('d34d42a') && t.includes(`${deeds[own].evidence[0][1]} lines the deed wrote in PROTOCOL.md`), `${w}px the protocol commit opens with its mending and its ${deeds[own].evidence[0][1]} shared lines`);
  const sec2 = await p.textContent('#sdeed') + (await p.$$eval('#sortask ~ .prose', es => es.map(e => e.textContent).join(' ')));
  ok(!/Frank/.test(sec2), `${w}px section II names the architect by role only`);
  if (shot) { await p.evaluate(() => window.scrollTo(0, 0)); await p.screenshot({ path: shot, fullPage: true }); console.log('shot', shot) }
  await p.close();
}
await b.close(); srv.close();
console.log(`${n - fail} of ${n} checks passed`);
process.exit(fail ? 1 : 0);
