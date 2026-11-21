// Reading 88 (fourth state, session 286): open the page at 1100 px light and 390 px dark, read every figure of the
// paper's section (data-k88), the table of the six acts of authority, the verdicts of P141 to P143, the Atelier's
// correction and the literature from the page a visitor sees, and compare them with counts recomputed here from the
// per-deed records of credit88.json, from commits87.json, results87.json, rename88.json, items85.json and
// literature88.json, independently of credit88.py's summary and of the page's own script. With CLONES set (a directory
// of commit-only clones named <repo>.git) every mending is opened again in Git and its signer and its naming of the
// deed recoded here; with LIT set (the directory of the fetched abstract pages) every page's hash is checked. Checks
// errors and sideways scroll; writes process/4.png from the light pass (NOSHOT=1 skips it).
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
import { execFileSync } from 'child_process'; import crypto from 'crypto';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); const url = 'file://' + path.join(here, 'index.html');
const rd = f => JSON.parse(fs.readFileSync(path.join(here, f), 'utf8'));
let checks = 0, fails = 0;
const eq = (a, b, what) => { checks++; if (String(a).trim() !== String(b).trim()) { fails++; console.log('FAIL', what, JSON.stringify(a), '!=', JSON.stringify(b)); } };
const ok = (c, what) => { checks++; if (!c) { fails++; console.log('FAIL', what); } };
const g = x => x.toLocaleString('en-GB');
const median = xs => { const s = [...xs].sort((a, b) => a - b), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };

// ---- the deeds and their mendings, recounted from the per-deed records
const CR = rd('credit88.json').deeds, C87 = rd('commits87.json').deeds, R87 = rd('results87.json');
eq(CR.length, C87.length, 'one record per deed of check 87');
const K87 = Object.fromEntries(C87.map(d => [d.row + '|' + d.deed, d]));
for (const d of CR) { const c = K87[d.row + '|' + d.deed]; ok(c, `deed ${d.row}|${d.deed} in check 87`);
  eq(d.found, c.found, `found of ${d.row}|${d.deed}`); eq(d.repair, c.repair, `repair of ${d.row}|${d.deed}`);
  eq(d.in_set, c.found === 'at its commit' && !!c.repair, `in the set: ${d.row}|${d.deed}`);
  if (d.repair_found) ok(d.repair_hash.startsWith(c.repair), `repair hash of ${d.row}|${d.deed}`); }
const SET = CR.filter(d => d.in_set && d.repair_found);
const isSelf = d => d.deed_commits.some(c => c && c.hash === d.repair_hash);
const SEEN = new Set(['e6558c8', '86532f4', 'd93ca69', 'd34d42a', 'c538beb']);
const APART = SET.filter(d => !isSelf(d)), FRESH = SET.filter(d => !SEEN.has(d.repair_hash.slice(0, 7)));
for (const d of SET) { eq(d.self_repair, isSelf(d), `self repair ${d.row}|${d.deed}`);
  const first = d.deed_commits.filter(Boolean).map(c => Date.parse(c.time)).sort((a, b) => a - b)[0];
  eq(d.lag_days, Math.round((Date.parse(d.repair_time) - first) / 864e5 * 10) / 10, `lag ${d.row}|${d.deed}`); }
const sum = xs => ({ n: xs.length, named: xs.filter(d => d.names_deed).length, arch: xs.filter(d => d.repair_signer === "the architect's name").length,
  med: median(xs.map(d => d.lag_days)), w1: xs.filter(d => d.lag_days >= 0 && d.lag_days < 1).length, max: Math.max(...xs.map(d => d.lag_days)) });
const A = sum(SET), AP = sum(APART), FR = sum(FRESH);
const V = { P141: A.named / A.n <= 0.25 ? 'held' : 'failed', P142: A.arch / A.n >= 0.75 ? 'held' : 'failed', P143: A.med >= 7 ? 'held' : 'failed' };
eq(A.n, 77, 'the set holds the 77 deeds with a recorded mending');

// ---- optional: every mending opened again in Git
if (process.env.CLONES) {
  const REPOS = ['frankbueltge.de', 'field-research', 'ulysses', 'studio', 'research-ecology', 'error-as-method', 'machine-attention'];
  const show = (repo, h) => { try { return execFileSync('git', ['--git-dir', path.join(process.env.CLONES, repo + '.git'), 'show', '-s', '--format=%an%x00%B', h], { stdio: ['ignore', 'pipe', 'ignore'], env: { ...process.env, GIT_NO_LAZY_FETCH: '1' } }).toString(); } catch { return null; } };
  for (const d of SET) {
    let out = show(d.repair_repo, d.repair_hash); for (const r of REPOS) { if (out) break; out = show(r, d.repair_hash); } ok(out, `mending ${d.repair_hash.slice(0, 8)} opened`); if (!out) continue;
    const [an, msg] = out.split('\0');
    const sig = an.trim() === 'Frank Bültge' ? "the architect's name" : /^(Meridian|Ulysses|Assay|Ensemble)\b/i.test(an.trim()) ? "a practice's persona" : 'other';
    eq(sig, d.repair_signer, `signer of mending ${d.repair_hash.slice(0, 8)}`);
    const byHash = d.deed_commits.filter(Boolean).some(c => msg.toLowerCase().includes(c.hash.slice(0, 7).toLowerCase()));
    const prs = d.deed_commits.filter(Boolean).map(c => { const s = (show(c.repo, c.hash) || '').split('\0')[1] || ''; const m = s.split('\n')[0].match(/\(#(\d+)\)\s*$/); return m && m[1]; }).filter(Boolean);
    const byPr = prs.some(p => new RegExp('(?<![\\w#])#' + p + '(?!\\d)').test(msg));
    eq(byHash || byPr, d.names_deed, `mending ${d.repair_hash.slice(0, 8)} names the deed`);
  }
}

// ---- the Atelier's correction of 21 November
const RN = rd('rename88.json'), I85 = rd('items85.json');
const app = I85.filter(i => ['journal-lines', 'journal-words'].includes(i.rule) && i.detail === 'appended');
eq(RN.items.length, app.length, 'every appended journal item looked up');
const ren = RN.items.filter(i => (i.status || '').startsWith('R')), a2 = ren.find(i => i.commit.startsWith('a2ef1c1'));
ok(a2 && a2.census_value === 7 && a2.whole_lines === 40, "a2ef1c1: 7 by the census, 40 as the note");
eq(app.find(i => i.commit.startsWith('a2ef1c1')).value, a2.census_value, 'the census value as published');
ok(a2.whole_lines <= 40 && !a2.whole_breach, 'the whole note is not over 40 by the codebook');
eq(ren.filter(i => i.whole_breach !== i.census_breach).length, 0, 'no breach changes');

// ---- the literature
const LIT = rd('literature88.json').sources;
eq(LIT.length, 5, 'five current sources');
for (const s of LIT) { ok(/^https:\/\/arxiv\.org\/abs\/2[5-6]\d\d\.\d{5}v\d$/.test(s.url), `${s.url} is a current arXiv page`);
  if (process.env.LIT) { const f = path.join(process.env.LIT, 'abs-' + s.url.split('/abs/')[1] + '.html'); const raw = fs.readFileSync(f);
    eq(crypto.createHash('sha256').update(raw).digest('hex'), s.sha256, `hash of ${s.url}`);
    const text = raw.toString('utf8').replace(/<[^>]+>/g, ' ').replace(/&#39;/g, "'").replace(/&quot;/g, '"').replace(/&amp;/g, '&').replace(/\s+/g, ' ');
    for (const p of s.passages) ok(text.includes(p), `passage found in ${s.url}: ${p.slice(0, 40)}`); } }

// ---- the six acts of authority
const AUTH = R87.deeds.filter(d => d.kind === 'authority').sort((a, b) => a.date.localeCompare(b.date) || a.row - b.row);
eq(AUTH.length, 6, 'six acts of authority');
const CRk = Object.fromEntries(CR.map(d => [d.row + '|' + d.deed, d]));

const E = { a_inGit: g(AUTH.filter(d => d.found === 'at its commit').length), apart: g(AP.n), apart2: g(AP.n), apart_named: g(AP.named), apart_named2: g(AP.named),
  set: g(A.n), set2: g(A.n), set3: g(A.n), found: g(CR.filter(d => d.found === 'at its commit').length), named: g(A.named), self_named: g(A.named - AP.named),
  arch: g(A.arch), persona: g(A.n - A.arch), lag: A.med.toLocaleString('en-GB', { minimumFractionDigits: 1, maximumFractionDigits: 2 }), within1: g(A.w1),
  lagmax: A.max.toLocaleString('en-GB', { minimumFractionDigits: 1 }), ap_items: g(app.length), ap_inplace: g(RN.items.filter(i => i.status === 'M').length),
  ap_renamed: ren.length === 1 ? 'one' : g(ren.length), a2_census: g(a2.census_value), a2_lines: g(a2.whole_lines), a2_strict: g(a2.whole_lines_strict),
  a2_blocks: g(a2.whole_blocks), a2_changes: 'No' };
// what the answer box and the section say in words
const authGit = AUTH.filter(d => d.found === 'at its commit').map(d => CRk[d.row + '|' + d.n]);
ok(authGit.every(d => d.repair_signer === "the architect's name" && !d.names_deed), 'every act in Git mended under his name, unnamed');
eq(authGit.filter(d => d.deed_commits[0].signer === "a practice's persona").length, 2, 'the practice signs two of the five');
ok(authGit.filter(d => d.deed_commits[0].repo === 'frankbueltge.de').every(d => !d.says_machine), 'no site mending names a machine');

const browser = await chromium.launch();
for (const [w, scheme] of [[1100, 'light'], [390, 'dark']]) {
  const page = await browser.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme, deviceScaleFactor: 1 });
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto(url); await page.waitForTimeout(600);
  eq(errs.length, 0, `${w}: no errors ${errs.join(' | ')}`);
  eq(await page.evaluate(() => document.documentElement.scrollWidth), w, `${w}: no sideways scroll`);
  const got = await page.$$eval('[data-k88]', es => es.map(e => [e.getAttribute('data-k88'), e.textContent]));
  eq(got.length, Object.keys(E).length + 0, `${w}: every figure of the section is on the page`);
  for (const [k, v] of got) { ok(k in E, `${w}: figure ${k} is recomputed`); eq(v, E[k], `${w}: figure ${k}`); }
  const rows = await page.$$eval('#acts tbody tr', trs => trs.map(t => ({ row: +t.dataset.row, cells: [...t.cells].map(c => c.textContent.trim()), links: [...t.querySelectorAll('a')].map(a => a.href) })));
  eq(rows.length, 6, `${w}: six rows`);
  rows.forEach((r, i) => { const d = AUTH[i], c = K87[d.row + '|' + d.n], x = CRk[d.row + '|' + d.n];
    eq(r.row, d.row, `${w}: row ${i} is log row ${d.row}`);
    ok(r.links[0].endsWith('decision-log.md?plain=1#L' + d.log_line), `${w}: row ${d.row} links its log line`);
    for (const cm of c.commits) ok(r.links.some(h => h.endsWith(`/${cm.repo}/commit/${cm.hash}`)), `${w}: row ${d.row} links ${cm.hash.slice(0, 8)}`);
    if (c.repair && d.found === 'at its commit') { ok(r.links.some(h => h.endsWith('/commit/' + x.repair_hash) && x.repair_hash.startsWith(c.repair)), `${w}: row ${d.row} links its mending`);
      eq(r.cells[5], x.lag_days.toLocaleString('en-GB', { minimumFractionDigits: 1 }), `${w}: days of row ${d.row}`); eq(r.cells[6], x.names_deed ? 'yes' : 'no', `${w}: naming of row ${d.row}`);
      ok(r.cells[4].includes(x.repair_signer === "the architect's name" ? "the architect's name" : "the practice's own"), `${w}: mending's name of row ${d.row}`); }
    else eq(r.cells[2], 'none in any public repository', `${w}: row ${d.row} has no commit`);
    ok(d.seer === 'not stated' ? r.cells[3] === 'the row does not say' : r.cells[3] === d.seer, `${w}: seer of row ${d.row}`); });
  const P = await page.$$eval('#preds88 p', ps => ps.map(p => [p.dataset.pred, p.querySelector('span').textContent, p.textContent]));
  eq(P.length, 3, `${w}: three predictions`);
  for (const [k, v, t] of P) { eq(v, V[k], `${w}: prediction ${k}`);
    if (k === 'P141') ok(t.includes(`${A.named} of ${A.n}`) && t.includes(`${AP.n} made apart from the deed, ${AP.named}`) && t.includes(`${FR.named} of ${FR.n}`), `${w}: P141 figures`);
    if (k === 'P142') ok(t.includes(`${A.arch} of ${A.n}`) && t.includes(`${FR.arch} of ${FR.n}`), `${w}: P142 figures`);
    if (k === 'P143') ok(t.includes(`median ${A.med} days`) && t.includes(`${A.w1} within a day`) && t.includes(`median ${FR.med}`), `${w}: P143 figures`); }
  const lit = await page.$$eval('#lit li', ls => ls.map(l => ({ t: l.textContent, h: [...l.querySelectorAll('a')].map(a => a.href) })));
  eq(lit.length, LIT.length, `${w}: literature listed`);
  LIT.forEach((s, i) => { ok(lit[i].h.includes(s.url), `${w}: ${s.url} linked`); ok(lit[i].t.includes(s.passages.at(-1).replace(/\.$/, '')), `${w}: passage of ${s.url} quoted`); });
  ok(await page.$eval('a[href$="presentations/cycle-017/paper.md"]', a => !!a), `${w}: the paper is linked`);
  eq(await page.$eval('.kicker', e => e.textContent.includes('state 4 · presented')), true, `${w}: kicker says presented`);
  if (w === 1100 && !process.env.NOSHOT) { fs.mkdirSync(path.join(here, 'process'), { recursive: true });
    await page.screenshot({ path: path.join(here, 'process', '4.png'), fullPage: true }); }
  await page.close();
}
await browser.close();
console.log(`${checks - fails} of ${checks} checks passed`); process.exit(fails ? 1 : 0);
