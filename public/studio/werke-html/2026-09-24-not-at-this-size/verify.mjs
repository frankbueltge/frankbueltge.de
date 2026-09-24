// @ts-nocheck — engine work script shielded from the site TS gate (sandboxed display code, vetted by the collective gauntlet + checkForbidden + astro build). A missing type annotation must never turn the whole site build red — see work 011, 2026-07-06.
// Verification of NOT AT THIS SIZE.
//   node verify.mjs [path-to-index.html]
//
// The reconstruction and audit logic is written a second time here, in
// another language, from the definitions in analysis.py rather than by
// importing it — the same discipline this house's other work follows.
//
//   THE ROUNDING   — three rules, checked against cases worked by hand.
//   THE COMPOSITION — Table 2's nine rows solved again by constraint
//                     propagation over their own printed percentages, with
//                     no count imported from anywhere outside each row.
//   THE AUDIT      — all 39 TPR cells of Table 4 and Table 5 tested again
//                    against the sizes the composition recovers.
//   THE PAGE       — is one file, no network, no library, and the data
//                    island matches results.json exactly.
//   THE READER     — opened in a real browser with scripting on and off,
//                    network denied in both, and the tab control worked by
//                    hand in each state.
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

const here = dirname(new URL(import.meta.url).pathname);
const file = process.argv.slice(2).find(a => !a.startsWith('--')) || join(here, 'index.html');
const HTML = readFileSync(file, 'utf8');
const DATA = JSON.parse(readFileSync(join(here, 'data.json'), 'utf8'));
const RJ = readFileSync(join(here, 'results.json'), 'utf8');
const R = JSON.parse(RJ);

let pass = 0, fail = 0;
const ok = (name, cond, note) => {
  if (cond) pass++;
  else { fail++; console.log('  FAIL  ' + name + (note !== undefined ? '  — ' + note : '')); }
};
const eq = (name, got, want) => ok(name, JSON.stringify(got) === JSON.stringify(want),
  `got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);

// ─────────────────────────────────────────────── 1. rounding, written again
function printedTenths(k, n, rule) {
  const num = 1000 * k;
  let q = Math.floor(num / n);
  const r = num - q * n;
  if (rule === 'trunc') return q;
  const twice = 2 * r;
  if (twice > n) return q + 1;
  if (twice < n) return q;
  return rule === 'half_up' ? q + 1 : q + (q & 1);
}
const asTenths = s => Math.round(parseFloat(s) * 10);

// worked by hand
for (const [k, n, up, even, tr] of [
  [1, 8, 125, 125, 125],   // 12.5 % exact, no rule involved
  [1, 16, 63, 62, 62],     // 6.25 % → 6.3 · 6.2 · 6.2
  [3, 4, 750, 750, 750],   // 75.0 % exact
  [271, 1270, 213, 213, 213], // 21.339...% -> 21.3 all three ways (not a boundary)
]) {
  eq(`printed ${k}/${n} half-up`, printedTenths(k, n, 'half_up'), up);
  eq(`printed ${k}/${n} half-even`, printedTenths(k, n, 'half_even'), even);
  eq(`printed ${k}/${n} trunc`, printedTenths(k, n, 'trunc'), tr);
}

function candidates(pctStr, n, rule) {
  const want = asTenths(pctStr);
  const out = [];
  for (let k = 0; k <= n; k++) if (printedTenths(k, n, rule) === want) out.push(k);
  return out;
}

function nearest(pctStr, n0, rule, maxWindow = 80) {
  for (let dn = 0; dn < maxWindow; dn++) {
    const signs = dn > 0 ? [-1, 1] : [0];
    for (const sign of signs) {
      const nn = n0 + sign * dn;
      if (nn <= 0) continue;
      const c = candidates(pctStr, nn, rule);
      if (c.length) return { delta: sign * dn, n: nn, k: c };
    }
  }
  return null;
}

// ─────────────────────────────────────────── 2. the composition, solved again
function solveRow(n, p, rule) {
  const Fc = new Set(candidates(p.F, n, rule));
  const Mc = new Set(candidates(p.M, n, rule));
  const Dc = new Set(candidates(p.Darker, n, rule));
  const Lc = new Set(candidates(p.Lighter, n, rule));
  const DFc = candidates(p.DF, n, rule), DMc = candidates(p.DM, n, rule);
  const LFc = candidates(p.LF, n, rule), LMc = candidates(p.LM, n, rule);
  const sols = [];
  for (const df of DFc) for (const dm of DMc) {
    if (!Dc.has(df + dm)) continue;
    for (const lf of LFc) for (const lm of LMc) {
      if (!Lc.has(lf + lm)) continue;
      if (df + dm + lf + lm !== n) continue;
      if (!Fc.has(df + lf)) continue;
      if (!Mc.has(dm + lm)) continue;
      sols.push([df, dm, lf, lm]);
    }
  }
  return sols;
}

const table2Again = DATA.table2_composition.rows.map(row => {
  const p = { F: row.F, M: row.M, Darker: row.Darker, Lighter: row.Lighter,
              DF: row.DF, DM: row.DM, LF: row.LF, LM: row.LM };
  const sols = solveRow(row.n, p, 'half_up');
  return { name: row.name, n: row.n, solutions: sols };
});

for (let i = 0; i < table2Again.length; i++) {
  const mine = table2Again[i], theirs = R.table2[i];
  eq(`composition · ${mine.name} · solved again`, mine.solutions, theirs.solutions);
  ok(`composition · ${mine.name} · unique`, mine.solutions.length === 1);
}
ok('composition · all nine rows unique', table2Again.every(r => r.solutions.length === 1));
eq('composition · table2_all_unique flag', R.table2_all_unique, true);

// cross-check against the paper's own prose counts for South Africa
const sa = table2Again.find(r => r.name === 'South Africa').solutions[0];
const [saDF, saDM, saLF, saLM] = sa;
const prose = DATA.table2_composition.south_africa_prose_check;
eq('composition · South Africa darker matches the paper’s own prose count',
   saDF + saDM, prose.darker_n);
eq('composition · South Africa lighter matches the paper’s own prose count',
   saLF + saLM, prose.lighter_n);

// ─────────────────────────────────────────────────── 3. the audit, again
const all_ = table2Again.find(r => r.name === 'All Subjects').solutions[0];
const [aDF, aDM, aLF, aLM] = all_;
const nFull = { All: 1270, DF: aDF, DM: aDM, LF: aLF, LM: aLM,
                Darker: aDF + aDM, Lighter: aLF + aLM, F: aDF + aLF, M: aDM + aLM };
const nSA = { DF: saDF, DM: saDM, LF: saLF, LM: saLM };

function auditCell(table, clf, grp, n, pct) {
  const matches = { half_up: candidates(pct, n, 'half_up'),
                     half_even: candidates(pct, n, 'half_even'),
                     trunc: candidates(pct, n, 'trunc') };
  let status;
  if (matches.half_up.length || matches.half_even.length) status = 'ok';
  else if (matches.trunc.length) status = 'trunc_only';
  else status = 'broken';
  const entry = { table, classifier: clf, group: grp, n, printed: pct, matches, status };
  if (status === 'broken') {
    entry.nearest = { half_up: nearest(pct, n, 'half_up'), half_even: nearest(pct, n, 'half_even'),
                       trunc: nearest(pct, n, 'trunc') };
  }
  return entry;
}

const auditAgain = [];
for (const [clf, row] of Object.entries(DATA.table4_full_ppb.classifiers))
  for (const [grp, pct] of Object.entries(row))
    auditAgain.push(auditCell('Table 4 — full PPB', clf, grp, nFull[grp], pct));
for (const [clf, row] of Object.entries(DATA.table5_south_africa.classifiers))
  for (const [grp, pct] of Object.entries(row))
    auditAgain.push(auditCell('Table 5 — South Africa subset', clf, grp, nSA[grp], pct));

eq('audit · total cells', auditAgain.length, R.audit_total);
eq('audit · total cells is 39', auditAgain.length, 39);
const ok_ = auditAgain.filter(c => c.status === 'ok').length;
const truncOnly = auditAgain.filter(c => c.status === 'trunc_only').length;
const broken = auditAgain.filter(c => c.status === 'broken').length;
eq('audit · ok count', ok_, R.audit_ok);
eq('audit · trunc-only count', truncOnly, R.audit_trunc_only);
eq('audit · broken (irreducible) count', broken, R.audit_irreducible);
eq('audit · ok + trunc-only + broken = total', ok_ + truncOnly + broken, R.audit_total);

// cell by cell against results.json
for (const mine of auditAgain) {
  const theirs = R.audit.find(c => c.table === mine.table && c.classifier === mine.classifier
                                  && c.group === mine.group);
  ok(`audit · ${mine.table} · ${mine.classifier} · ${mine.group} status`,
     theirs && theirs.status === mine.status,
     `mine=${mine.status} theirs=${theirs && theirs.status}`);
  eq(`audit · ${mine.table} · ${mine.classifier} · ${mine.group} matches`,
     mine.matches, theirs && theirs.matches);
}

// the five irreducible cells, named explicitly, worked by hand once each
const wantIrreducible = [
  ['Table 4 — full PPB', 'MSFT', 'F'],
  ['Table 4 — full PPB', 'MSFT', 'DF'],
  ['Table 4 — full PPB', 'Face++', 'DF'],
  ['Table 5 — South Africa subset', 'MSFT', 'DF'],
  ['Table 5 — South Africa subset', 'Face++', 'DF'],
];
const gotIrreducible = auditAgain.filter(c => c.status === 'broken')
  .map(c => [c.table, c.classifier, c.group]);
eq('audit · the five irreducible cells are exactly these',
   gotIrreducible.sort().map(x => x.join('|')),
   wantIrreducible.sort().map(x => x.join('|')));
ok('audit · IBM never appears among the irreducible cells',
   !gotIrreducible.some(([, clf]) => clf === 'IBM'));
ok('audit · every irreducible cell is F or DF',
   gotIrreducible.every(([, , grp]) => grp === 'F' || grp === 'DF'));

// ─────────────────────────────────────────────────── 4. the page is one file
ok('page · no stylesheet link', !/<link[^>]+rel=["']?stylesheet/i.test(HTML));
ok('page · no script with a source', !/<script[^>]+src=/i.test(HTML));
ok('page · no @import', !/@import/i.test(HTML));
ok('page · the only URLs in the markup are the two cited sources, as text, not requests',
   [...HTML.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
     .every(m => m[1].startsWith('#') || m[1].startsWith('https://hek.ch')));
const island = HTML.match(/<script type="application\/json" id="data">([\s\S]*?)<\/script>/);
ok('page · carries the data island', !!island);
ok('page · the island is results.json, unchanged', island && island[1].trim() === RJ.trim());

// ─────────────────────────────────────────── 5. the reader, in a real browser
const GLOBAL_PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.js';
const pwmod = await import('playwright').catch(() => import(GLOBAL_PW));
const chromium = pwmod.chromium || pwmod.default.chromium;
if (!chromium) {
  console.log('  (no browser available — the reader checks did not run)');
} else {
  const browser = await chromium.launch();
  for (const scripting of [true, false]) {
    const ctx = await browser.newContext({ javaScriptEnabled: scripting });
    const page = await ctx.newPage();
    let reached = 0;
    await page.route('**', r => {
      const u = r.request().url();
      if (u.startsWith('file:') || u.startsWith('data:')) return r.continue();
      reached++; return r.abort();
    });
    await page.goto('file://' + file);
    const tag = scripting ? 'with script' : 'without script';
    eq(`reader ${tag} · nothing was fetched from the network`, reached, 0);
    const seen = await page.evaluate(() => ({
      ok: document.querySelectorAll('td.ok').length,
      trunc: document.querySelectorAll('td.trunc').length,
      broken: document.querySelectorAll('td.broken').length,
      title: document.title,
    }));
    eq(`reader ${tag} · ok cells rendered`, seen.ok, R.audit_ok);
    eq(`reader ${tag} · trunc-only cells rendered`, seen.trunc, R.audit_trunc_only);
    eq(`reader ${tag} · broken cells rendered`, seen.broken, R.audit_irreducible);
    eq(`reader ${tag} · title`, seen.title, 'NOT AT THIS SIZE');
    // the tab control, worked by hand — CSS radio buttons, no script required
    await page.click('label[for=p2]');
    const panel2 = await page.evaluate(() =>
      getComputedStyle(document.querySelector('.panel2')).display !== 'none');
    const panel1 = await page.evaluate(() =>
      getComputedStyle(document.querySelector('.panel1')).display !== 'none');
    ok(`reader ${tag} · clicking the second tab shows only the second panel`, panel2 && !panel1);
    await page.click('label[for=p1]');
    const panel1b = await page.evaluate(() =>
      getComputedStyle(document.querySelector('.panel1')).display !== 'none');
    ok(`reader ${tag} · clicking back shows the first panel again`, panel1b);
    await ctx.close();
  }
  await browser.close();
}

console.log(`\n  ${pass} checks, ${fail} failed`);
process.exit(fail ? 1 : 0);
