// node check_people.mjs <warnings34.tsv> — coda II by a second path: re-join the Field's rows in JS and
// recompute people.json's counts; then check people.js against data.js.
import fs from 'fs'; import { dirname, join } from 'path'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const D = JSON.parse(fs.readFileSync(join(here, 'data.js'), 'utf8').replace(/^window\.TCA=/, '').replace(/;\s*$/, ''));
const PE = JSON.parse(fs.readFileSync(join(here, 'people.js'), 'utf8').replace(/^window\.TCA_PEOPLE=/, '').replace(/;\s*$/, ''));
const PJ = JSON.parse(fs.readFileSync(join(here, 'people.json')));
let pass = 0, fail = 0; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };
const T0 = Date.parse(D.t0), by = new Map();
D.issue.forEach((m, i) => { const k = D.wfos[D.wfo[i]] + ' ' + m; by.set(k, (by.get(k) || []).concat(i)); });
const [hd, ...rows] = fs.readFileSync(process.argv[2], 'utf8').trim().split('\n').map(l => l.split('\t'));
const col = n => hd.indexOf(n);
const got = new Map(); let none = 0, ties = 0;
for (const r of rows) {
  const m = (Date.parse(r[col('issued')].replace(' ', 'T') + ':00Z') - T0) / 60000, g = by.get(r[col('office')] + ' ' + m);
  if (!g) { none++; continue; }
  const d = i => Math.abs(D.dur[i] - +r[col('minutes')]), s = [...g].sort((a, b) => d(a) - d(b));
  if (s.length > 1 && d(s[0]) === d(s[1])) { ties++; continue; }
  if (!got.has(s[0])) got.set(s[0], Math.round(+r[col('people')] / 10) * 10);
}
t(`rows ${rows.length}, unjoined ${none}, ties ${ties}`, rows.length === PJ.field_rows && none === PJ.unjoined && ties === PJ.ties_left_out);
t(`joined ${got.size}`, got.size === PJ.joined && PE.i.length === got.size);
t('people.js holds the same warning and the same people, in order', PE.i.every((w, k) => got.get(w) === PE.p[k] && (k === 0 || PE.i[k - 1] < w)));
let he = 0, hm = 0; for (const [w, p] of got) (D.met[w] ? (hm += p * D.dur[w] / 60) : (he += p * D.dur[w] / 60));
t(`person-hours under empty warnings ${Math.round(he)}`, Math.abs(Math.round(he) - PJ.person_hours_empty) <= 1 && Math.abs(Math.round(hm) - PJ.person_hours_met) <= 1);
t('every joined warning lies in 2016-2023', PE.i.every(w => { const y = new Date(T0 + D.issue[w] * 60000).getUTCFullYear(); return y >= 2016 && y <= 2023; }));
console.log(`${pass}/${pass + fail}`); process.exit(fail ? 1 : 0);
