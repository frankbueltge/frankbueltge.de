// @ts-nocheck — engine work script shielded from the site TS gate (sandboxed display code, vetted by the collective gauntlet + checkForbidden + astro build). A missing type annotation must never turn the whole site build red — see work 011, 2026-07-06.
// Verification of THE NEARER ONE.
//   node verify.mjs [path-to-index.html]
//
// Six questions, and the first one is the point of the exercise: every number
// this work publishes is recomputed here from scratch, in another language,
// from the same published definitions — nothing is imported from the build.
//
//   THE FORMULAS  — all five written a second time and checked against the
//                   34 published CIEDE2000 test pairs (four quoted here) and
//                   against each formula's own structural promises.
//   THE CENSUS    — all 4 969 080 triples asked again, here, and every count
//                   in counts.json recomputed: unanimity, contradiction,
//                   abstention, the pairwise matrix, the buckets, the fifteen
//                   divisions, the per-colour map.
//   THE GEOMETRY  — the triangle sweep and the role-swap sweep, redone.
//   THE ISLAND    — is the page one file, carrying its own data, reaching for
//                   nothing?
//   WITHOUT SCRIPT— does a reader with no JavaScript get the whole work?
//   THE HAND      — do the controls work, in both states?
import { readFileSync, writeFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';

const here = dirname(new URL(import.meta.url).pathname);
const file = process.argv.slice(2).find(a => !a.startsWith('--')) || join(here, 'index.html');
const HTML = readFileSync(file, 'utf8');
const D = JSON.parse(readFileSync(join(here, 'data.json'), 'utf8'));
const C = JSON.parse(readFileSync(join(here, 'counts.json'), 'utf8'));
const S = JSON.parse(readFileSync(join(here, 'sources.json'), 'utf8'));
// The second implementation keeps its own books. --emit writes them; every
// other run checks that a fresh computation still produces the same file.
const EMIT = process.argv.includes('--emit');
const XPATH = join(here, 'crosscheck.json');
const X = (!EMIT && existsSync(XPATH))
  ? JSON.parse(readFileSync(XPATH, 'utf8')) : null;
const xc = { note: 'Figures computed by the second implementation of the five formulas, in JavaScript, in verify.mjs. Where they differ from counts.json, the difference is the finding: see METHOD.md.', triangle_strict: {} };

let pass = 0, fail = 0;
const ok = (name, cond, note) => {
  if (cond) pass++;
  else { fail++; console.log('  FAIL  ' + name + (note ? '  — ' + note : '')); }
};
const eq = (name, a, b) =>
  ok(name, a === b, `got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`);
const near = (name, a, b, tol) =>
  ok(name, Math.abs(a - b) <= tol, `got ${a}, expected ${b} (tol ${tol})`);
const section = s => console.log('\n' + s);

// ===================================================================== FORMULAS
// Written from the published definitions, not from the Python. Structured
// differently on purpose: this catches a slip of the finger, not a shared
// misreading of a standard, and the record says so.

const D2R = Math.PI / 180, R2D = 180 / Math.PI;
const srgbToLinear = v => {
  const u = v / 255;
  return u <= 0.04045 ? u / 12.92 : Math.pow((u + 0.055) / 1.055, 2.4);
};
const Mx = [[0.4124564, 0.3575761, 0.1804375],
            [0.2126729, 0.7151522, 0.0721750],
            [0.0193339, 0.1191920, 0.9503041]];
const Wp = Mx.map(row => row[0] + row[1] + row[2]);
const fLab = t => t > Math.pow(6 / 29, 3) ? Math.cbrt(t)
                                          : t * Math.pow(29 / 6, 2) / 3 + 4 / 29;
function toLab([r, g, b]) {
  const l = [srgbToLinear(r), srgbToLinear(g), srgbToLinear(b)];
  const xyz = Mx.map(row => row[0] * l[0] + row[1] * l[1] + row[2] * l[2]);
  const f = xyz.map((v, i) => fLab(v / Wp[i]));
  return [116 * f[1] - 16, 500 * (f[0] - f[1]), 200 * (f[1] - f[2])];
}
const hyp = (x, y) => Math.sqrt(x * x + y * y);

function dRGB(p, q) {
  let s = 0; for (let i = 0; i < 3; i++) s += (p[i] - q[i]) ** 2; return Math.sqrt(s);
}
function d76(p, q) {
  let s = 0; for (let i = 0; i < 3; i++) s += (p[i] - q[i]) ** 2; return Math.sqrt(s);
}
function d94(ref, smp) {
  const C1 = hyp(ref[1], ref[2]), C2 = hyp(smp[1], smp[2]);
  const dL = ref[0] - smp[0], dC = C1 - C2;
  const da = ref[1] - smp[1], db = ref[2] - smp[2];
  const dH2 = Math.max(0, da * da + db * db - dC * dC);
  const SC = 1 + 0.045 * C1, SH = 1 + 0.015 * C1;
  return Math.sqrt(dL * dL + (dC / SC) ** 2 + dH2 / (SH * SH));
}
function dCMC(ref, smp, l = 2, c = 1) {
  const C1 = hyp(ref[1], ref[2]), C2 = hyp(smp[1], smp[2]);
  const dL = ref[0] - smp[0], dC = C1 - C2;
  const da = ref[1] - smp[1], db = ref[2] - smp[2];
  const dH2 = Math.max(0, da * da + db * db - dC * dC);
  const SL = ref[0] < 16 ? 0.511 : 0.040975 * ref[0] / (1 + 0.01765 * ref[0]);
  const SC = 0.0638 * C1 / (1 + 0.0131 * C1) + 0.638;
  let H = Math.atan2(ref[2], ref[1]) * R2D; if (H < 0) H += 360;
  const T = (H >= 164 && H <= 345)
    ? 0.56 + Math.abs(0.2 * Math.cos((H + 168) * D2R))
    : 0.36 + Math.abs(0.4 * Math.cos((H + 35) * D2R));
  const F = Math.sqrt(Math.pow(C1, 4) / (Math.pow(C1, 4) + 1900));
  const SH = SC * (F * T + 1 - F);
  return Math.sqrt((dL / (l * SL)) ** 2 + (dC / (c * SC)) ** 2 + dH2 / (SH * SH));
}
const P7 = Math.pow(25, 7);
function d00(p, q) {
  const C1 = hyp(p[1], p[2]), C2 = hyp(q[1], q[2]);
  const Cm = (C1 + C2) / 2, Cm7 = Math.pow(Cm, 7);
  const G = 0.5 * (1 - Math.sqrt(Cm7 / (Cm7 + P7)));
  const ap1 = (1 + G) * p[1], ap2 = (1 + G) * q[1];
  const Cp1 = hyp(ap1, p[2]), Cp2 = hyp(ap2, q[2]);
  let h1 = (ap1 === 0 && p[2] === 0) ? 0 : Math.atan2(p[2], ap1) * R2D;
  let h2 = (ap2 === 0 && q[2] === 0) ? 0 : Math.atan2(q[2], ap2) * R2D;
  if (h1 < 0) h1 += 360; if (h2 < 0) h2 += 360;
  const dLp = q[0] - p[0], dCp = Cp2 - Cp1;
  let dh = 0;
  if (Cp1 * Cp2 !== 0) {
    dh = h2 - h1;
    if (dh > 180) dh -= 360; else if (dh < -180) dh += 360;
  }
  const dHp = 2 * Math.sqrt(Cp1 * Cp2) * Math.sin(dh * D2R / 2);
  const Lm = (p[0] + q[0]) / 2, Cpm = (Cp1 + Cp2) / 2;
  let hm;
  if (Cp1 * Cp2 === 0) hm = h1 + h2;
  else if (Math.abs(h1 - h2) <= 180) hm = (h1 + h2) / 2;
  else hm = (h1 + h2 < 360) ? (h1 + h2 + 360) / 2 : (h1 + h2 - 360) / 2;
  const T = 1 - 0.17 * Math.cos((hm - 30) * D2R) + 0.24 * Math.cos(2 * hm * D2R)
              + 0.32 * Math.cos((3 * hm + 6) * D2R) - 0.20 * Math.cos((4 * hm - 63) * D2R);
  const dTh = 30 * Math.exp(-Math.pow((hm - 275) / 25, 2));
  const Cpm7 = Math.pow(Cpm, 7);
  const RC = 2 * Math.sqrt(Cpm7 / (Cpm7 + P7));
  const SL = 1 + 0.015 * Math.pow(Lm - 50, 2) / Math.sqrt(20 + Math.pow(Lm - 50, 2));
  const SC = 1 + 0.045 * Cpm, SH = 1 + 0.015 * Cpm * T;
  const RT = -Math.sin(2 * dTh * D2R) * RC;
  const tL = dLp / SL, tC = dCp / SC, tH = dHp / SH;
  return Math.sqrt(tL * tL + tC * tC + tH * tH + RT * tC * tH);
}

const MEAS = ['rgb', 'cie76', 'cie94', 'cmc', 'de2000'];
const RGB = D.palette.rgb, HEX = D.palette.hex, N = RGB.length;
const LAB = RGB.map(toLab);
const dist = {
  rgb: (i, j) => dRGB(RGB[i], RGB[j]),
  cie76: (i, j) => d76(LAB[i], LAB[j]),
  cie94: (i, j) => d94(LAB[i], LAB[j]),
  cmc: (i, j) => dCMC(LAB[i], LAB[j]),
  de2000: (i, j) => d00(LAB[i], LAB[j]),
};

section('THE FORMULAS');
// Four rows quoted from the supplementary test data of Sharma, Wu & Dalal
// (2005) — reference L*a*b*, sample L*a*b*, published CIEDE2000. The whole
// file of 34 rows was checked at build time; its address and SHA-256 are in
// sources.json and it is not copied into this repository.
const SHARMA = [
  [[50.0000, 2.6772, -79.7751], [50.0000, 0.0000, -82.7485], 2.0425],
  [[50.0000, 2.5000, 0.0000], [50.0000, 0.0000, -2.5000], 4.3065],
  [[60.2574, -34.0099, 36.2677], [60.4626, -34.1751, 39.4387], 1.2644],
  [[2.0776, 0.0795, -1.1350], [0.9033, -0.0636, -0.5514], 0.9082],
];
SHARMA.forEach(([a, b, want], k) =>
  near('CIEDE2000 against published test pair ' + (k + 1), Math.round(d00(a, b) * 1e4) / 1e4, want, 1e-4));
near('white lands on L*=100', LAB[N - 1][0], 100, 1e-9);
near('white lands on a*=0', LAB[N - 1][1], 0, 1e-9);
near('white lands on b*=0', LAB[N - 1][2], 0, 1e-9);
near('black to white is 100 under CIE76', dist.cie76(0, N - 1), 100, 1e-9);
ok('the palette is generated, not stored', RGB.every(([r, g, b]) =>
  [r, g, b].every(v => [0, 51, 102, 153, 204, 255].includes(v))));
eq('the palette has 216 colours', N, 216);
eq('the palette has no duplicates', new Set(HEX).size, 216);
{ // CIE94 collapses to CIE76 when the reference is neutral — a structural check
  let worst = 0;
  for (let i = 0; i < N; i++) {
    if (RGB[i][0] !== RGB[i][1] || RGB[i][1] !== RGB[i][2]) continue;
    for (let j = 0; j < N; j++) worst = Math.max(worst, Math.abs(dist.cie94(i, j) - dist.cie76(i, j)));
  }
  ok('CIE94 is CIE76 at a neutral reference', worst < 1e-9, 'worst ' + worst);
}
{ // the symmetric three are symmetric, measured
  for (const m of ['rgb', 'cie76', 'de2000']) {
    let worst = 0;
    for (let i = 0; i < N; i++) for (let j = 0; j < N; j++)
      worst = Math.max(worst, Math.abs(dist[m](i, j) - dist[m](j, i)));
    ok(m + ' is symmetric', worst === 0, 'worst ' + worst);
  }
}

// ======================================================================= CENSUS
section('THE CENSUS  (4 969 080 triples, asked again here)');
const M = {};
for (const m of MEAS) {
  const a = new Float64Array(N * N);
  for (let i = 0; i < N; i++) for (let j = 0; j < N; j++) a[i * N + j] = dist[m](i, j);
  M[m] = a;
}
const EDGES = C.ratio_edges;
let total = 0, unanimous = 0, contradicted = 0, abstained = 0;
const ties = Object.fromEntries(MEAS.map(m => [m, 0]));
const alone = Object.fromEntries(MEAS.map(m => [m, 0]));
const pairDis = MEAS.map(() => MEAS.map(() => 0));
const bTot = new Array(EDGES.length + 1).fill(0);
const bCon = new Array(EDGES.length + 1).fill(0);
const perRef = new Array(N).fill(0);
const coal = new Map();
const outs = new Array(5), rat = new Array(5);
for (let r = 0; r < N; r++) {
  const base = MEAS.map(m => M[m].subarray(r * N, r * N + N));
  for (let a = 0; a < N; a++) {
    if (a === r) continue;
    for (let b = a + 1; b < N; b++) {
      if (b === r) continue;
      total++;
      let has0 = false, has1 = false, hasT = false, n0 = 0, mx = 1;
      for (let k = 0; k < 5; k++) {
        const x = base[k][a], y = base[k][b];
        const o = x < y ? 0 : (x > y ? 1 : 2);
        outs[k] = o;
        if (o === 0) { has0 = true; n0++; } else if (o === 1) has1 = true;
        else { hasT = true; ties[MEAS[k]]++; }
        const q = x > y ? (y ? x / y : 1) : (x ? y / x : 1);
        if (q > mx) mx = q;
      }
      let k = 0; while (k < EDGES.length && mx >= EDGES[k]) k++;
      bTot[k]++;
      if (has0 && has1) {
        contradicted++; bCon[k]++; perRef[r]++;
        for (let x = 0; x < 5; x++) {
          if (outs[x] === 2) continue;
          for (let y = x + 1; y < 5; y++)
            if (outs[y] !== 2 && outs[x] !== outs[y]) { pairDis[x][y]++; pairDis[y][x]++; }
        }
        if (!hasT) {
          if (n0 === 1) alone[MEAS[outs.indexOf(0)]]++;
          else if (n0 === 4) alone[MEAS[outs.indexOf(1)]]++;
          const side = n0 < 3 ? 0 : 1;
          const key = outs.map((o, i) => o === side ? i : -1).filter(i => i >= 0).join(',');
          coal.set(key, (coal.get(key) || 0) + 1);
        }
      } else if (outs[0] === outs[1] && outs[1] === outs[2] && outs[2] === outs[3]
                 && outs[3] === outs[4]) unanimous++;
      else abstained++;
    }
  }
}
eq('triples counted', total, C.triples);
eq('unanimous', unanimous, C.unanimous);
eq('contradicted', contradicted, C.contradicted);
eq('abstained only', abstained, C.abstained_only);
eq('the three add up', unanimous + contradicted + abstained, total);
for (const m of MEAS) eq('ties, ' + m, ties[m], C.ties[m]);
for (const m of MEAS) eq('alone against four, ' + m, alone[m], C.alone_against_four[m]);
MEAS.forEach((m, i) => MEAS.forEach((q, j) => {
  if (i !== j) eq(`pairwise ${m}/${q}`, pairDis[i][j], C.pair_disagree[m][q]);
}));
bTot.forEach((v, i) => eq('bucket total ' + i, v, C.bucket_total[i]));
bCon.forEach((v, i) => eq('bucket contradicted ' + i, v, C.bucket_contra[i]));
eq('bucket totals sum to the census', bTot.reduce((a, b) => a + b, 0), total);
eq('per-colour map sums to the contradictions',
   perRef.reduce((a, b) => a + b, 0), C.contradicted);
perRef.forEach((v, i) => eq('per-colour ' + HEX[i], v, C.per_reference_contradicted[i]));
eq('coalition total', [...coal.values()].reduce((a, b) => a + b, 0), C.coalition_total);
eq('fifteen divisions, no more', coal.size, 15);
eq('fifteen divisions, none empty', [...coal.values()].filter(v => v > 0).length, 15);
for (const e of D.eye) {
  const key = e.minority.map(m => MEAS.indexOf(m)).sort((a, b) => a - b).join(',');
  eq('division ' + e.minority.join('+'), coal.get(key) || 0, e.count);
}

// ===================================================================== GEOMETRY
section('THE GEOMETRY');
for (const m of MEAS) {
  const A = M[m];
  let strict = 0, real = 0, maxgap = 0;
  for (let b = 0; b < N; b++) for (let a = 0; a < N; a++) {
    if (a === b) continue;
    const u = A[a * N + b];
    for (let c = 0; c < N; c++) {
      if (c === a || c === b) continue;
      const direct = A[a * N + c], via = u + A[b * N + c];
      if (direct > via) {
        strict++;
        if (direct - via > maxgap) maxgap = direct - via;
        if (direct / via > 1 + 1e-9) real++;
      }
    }
  }
  xc.triangle_strict[m] = strict;
  if (X) eq('triangle, strict, second implementation, ' + m, strict, X.triangle_strict[m]);
  eq('triangle, beyond rounding, ' + m, real, C.triangle_beyond_rounding[m]);
  if (C.triangle_beyond_rounding[m] > 0) {
    // A real violation is a property of the formula: both implementations must
    // find exactly the same ones.
    eq('triangle, strict, ' + m, strict, C.triangle_violations[m]);
    near('triangle, largest gap, ' + m, maxgap, C.triangle_max_absolute_gap[m], 1e-9);
  } else {
    // An apparent one is a property of the arithmetic. The two implementations
    // are NOT required to agree about how many there are — and for CIE76 they
    // do not. What must hold is that every one of them is rounding.
    ok('apparent violations are rounding only, ' + m, maxgap < 1e-9, 'gap ' + maxgap);
    ok('and the build said the same, ' + m, C.triangle_max_absolute_gap[m] < 1e-9);
  }
}
for (const m of MEAS) {
  const A = M[m];
  let asym = 0;
  for (let i = 0; i < N; i++) for (let j = i + 1; j < N; j++)
    if (A[i * N + j] !== A[j * N + i]) asym++;
  eq('asymmetric pairs, ' + m, asym, C.asymmetric_pairs[m]);
  let flips = 0;
  for (let r = 0; r < N; r++) {
    for (let a = 0; a < N; a++) {
      if (a === r) continue;
      for (let b = a + 1; b < N; b++) {
        if (b === r) continue;
        const f = A[r * N + a] - A[r * N + b], g = A[a * N + r] - A[b * N + r];
        if (f === 0 || g === 0) continue;
        if ((f < 0) !== (g < 0)) flips++;
      }
    }
  }
  eq('role-swap flips, ' + m, flips, C.role_flips[m]);
}
{ // the fifteen pairs CIE94 treats alike are the fifteen pairs among the greys
  const sym = D.asymmetry.cie94.symmetric_pairs;
  eq('CIE94 symmetric pairs', sym.length, 15);
  ok('and all of them are greys', sym.every(([i, j]) =>
    RGB[i][0] === RGB[i][1] && RGB[i][1] === RGB[i][2] &&
    RGB[j][0] === RGB[j][1] && RGB[j][1] === RGB[j][2]));
}
{ // the galleries on the page say what the matrices say
  for (const m of MEAS) for (const w of D.triangle[m].worst) {
    const A = M[m];
    near('triangle case ' + m, A[w.a * N + w.c], w.direct, 1e-9);
    near('triangle detour ' + m, A[w.a * N + w.b] + A[w.b * N + w.c], w.via, 1e-9);
    ok('triangle case is a violation, ' + m, w.direct > w.via);
  }
  for (const e of D.eye) {
    if (!e.case) continue;
    const c = e.case;
    const got = MEAS.map(m => {
      const x = M[m][c.ref * N + c.a], y = M[m][c.ref * N + c.b];
      return x < y ? 0 : (x > y ? 1 : 2);
    });
    eq('gallery verdicts, ' + e.minority.join('+'), got.join(''), c.outcomes.join(''));
    const minority = got.map((o, i) => o === (got.filter(x => x === 0).length < 3 ? 0 : 1) ? MEAS[i] : null)
                        .filter(Boolean);
    eq('gallery minority, ' + e.minority.join('+'), minority.join('+'), e.minority.join('+'));
  }
}

// ======================================================================= ISLAND
section('THE ISLAND');
ok('no external script', !/<script[^>]+src=/i.test(HTML));
ok('no external stylesheet', !/<link[^>]+stylesheet/i.test(HTML));
ok('no image element at all', !/<img\b/i.test(HTML));
ok('no CSS import', !/@import/i.test(HTML));
ok('no url() in CSS', !/url\(/i.test(HTML));
ok('no iframe, object or embed', !/<(iframe|object|embed)\b/i.test(HTML));
{
  const links = [...HTML.matchAll(/href="(https?:[^"]+)"/g)].map(m => m[1]);
  ok('every outward link is a citation in an anchor',
     links.every(u => new RegExp('<a[^>]+href="' + u.replace(/[.*+?^${}()|[\]\\]/g, '\\$&') + '"').test(HTML)));
  ok('every outward link is in sources.json',
     links.every(u => JSON.stringify(S).includes(u)), links.filter(u => !JSON.stringify(S).includes(u)).join(' '));
}
eq('the ledger is named but not committed', C.ledger_sha256.length, 64);

// ==================================================================== IN A PAGE
const GLOBAL_PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.js';
const pw = await import('playwright').catch(() => import(GLOBAL_PW));
const chromium = pw.chromium || pw.default.chromium;
const nsp = n => n.toLocaleString('en-US').replace(/,/g, ' ');

async function inBrowser(js) {
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ javaScriptEnabled: js });
  const seen = [];
  ctx.on('request', r => seen.push(r.url()));
  await ctx.route('**/*', route =>
    route.request().url().startsWith('file://') ? route.continue() : route.abort());
  const page = await ctx.newPage();
  await page.goto('file://' + file, { waitUntil: 'load' });
  await page.waitForTimeout(200);
  return { browser, page, seen };
}

for (const js of [false, true]) {
  section('IN A REAL BROWSER — scripting ' + (js ? 'on' : 'off') + ', network denied');
  const { browser, page, seen } = await inBrowser(js);
  ok('nothing was requested off the filesystem', seen.every(u => u.startsWith('file://')),
     seen.filter(u => !u.startsWith('file://')).join(' '));
  eq('exactly one document was loaded', seen.length, 1);

  const text = await page.evaluate(() => document.body.innerText);
  const headline = [C.triples, C.unanimous, C.contradicted, C.abstained_only,
                    C.ties.rgb, C.coalition_total, C.ordered_triples,
                    C.triangle_beyond_rounding.de2000, C.triangle_beyond_rounding.cmc,
                    C.triangle_beyond_rounding.cie94,
                    C.role_flips.cmc, C.role_flips.cie94, C.pairs];
  for (const v of headline) ok('the page carries ' + nsp(v), text.includes(nsp(v)));
  for (const e of D.eye) ok('the page carries the count of ' + e.minority.join('+'),
                            text.includes(nsp(e.count)));
  for (const m of MEAS) ok('the page carries the loneliness of ' + m,
                           text.includes(nsp(C.alone_against_four[m])));
  if (X) {
    ok('the page carries the second implementation\'s CIE76 count',
       text.includes(nsp(X.triangle_strict.cie76)));
    ok('the page carries the real-violation total', text.includes(
      nsp(Object.values(C.triangle_beyond_rounding).reduce((a, b) => a + b, 0))));
  }

  // the swatches on the wall are the colours the census named
  const walls = await page.evaluate(() => [...document.querySelectorAll('.wall .case[data-k]')]
    .map(li => [...li.querySelectorAll('.chip.big')].map(c => c.style.background)));
  const rgbstr = h => 'rgb(' + [1, 3, 5].map(i => parseInt(h.slice(i, i + 2), 16)).join(', ') + ')';
  D.eye.filter(e => e.case).forEach((e, k) => {
    const want = [e.case.ref, e.case.a, e.case.b].map(i => rgbstr(HEX[i]));
    eq('wall swatches, ' + e.minority.join('+'), walls[k].join('|'), want.join('|'));
  });

  eq('fifteen cases are on the wall',
     await page.locator('.wall .case').count(), 15);
  eq('and every one of them has three swatches and two buttons',
     await page.locator('.wall .case .chip.big').count(), 45);
  eq('five verdicts per case, seventy-five in all',
     await page.locator('.wall .votes .v').count(), 75);

  // the drawn squares are the measured shares, read back out of the SVG
  const rects = await page.evaluate(() => {
    const g = document.querySelectorAll('#which svg')[1];
    return [...g.querySelectorAll('rect:not(.frame)')].map(r => +r.getAttribute('width'));
  });
  eq('the map draws all 216 colours', rects.length, 216);
  {
    const mx = Math.max(...C.per_reference_contradicted);
    let worst = 0;
    for (let i = 0; i < 216; i++)
      worst = Math.max(worst, Math.abs(
        (rects[i] / 26) ** 2 - C.per_reference_contradicted[i] / mx));
    // widths are written to a tenth of a pixel; a tenth of a pixel on a 26px
    // cell is up to 0.008 of the area
    ok('and each square is drawn at the area of its own argument', worst < 8e-3,
       'worst ' + worst);
  }

  // the strips are the orderings, read back out of the SVG
  const strips = await page.evaluate(() => [...document.querySelectorAll('.pane')]
    .map(p => [...p.querySelectorAll('.orow')].map(r =>
      [...r.querySelectorAll('rect')].map(x => x.getAttribute('class')))));
  eq('nine references are drawn', strips.length, 9);
  D.orderings.forEach((o, k) => MEAS.forEach((m, j) => {
    eq(`strip ${HEX[o.ref]} / ${m}`,
       strips[k][j].join(','), o.orders[m].map(i => 'c' + i).join(','));
  }));

  const shown = await page.evaluate(() =>
    [...document.querySelectorAll('.pane')].map(p => getComputedStyle(p).display));
  eq('one pane is open', shown.filter(d => d !== 'none').length, 1);
  await page.locator('label[for="rp8"]').click();
  const shown2 = await page.evaluate(() =>
    [...document.querySelectorAll('.pane')].map(p => getComputedStyle(p).display));
  ok('and the control opens another one, with no script in it',
     shown2[8] !== 'none' && shown2[0] === 'none');

  const vis = await page.evaluate(() =>
    getComputedStyle(document.querySelector('.wall .votes')).visibility);
  if (js) {
    eq('with scripting, the verdicts wait', vis, 'hidden');
    await page.locator('.wall .case[data-k="0"] .cand[data-side="1"]').click();
    eq('and a choice reveals them', await page.evaluate(() =>
      getComputedStyle(document.querySelector('.wall .votes')).visibility), 'visible');
    const t = await page.evaluate(() => document.getElementById('tally').innerText);
    ok('and the tally counts one answer', /answered\s+1\s+of\s+15/.test(t), t);
    ok('and says nothing is stored', /nothing is stored/i.test(t));
    const others = await page.evaluate(() => [...document.querySelectorAll('.wall .case')]
      .slice(1).map(c => getComputedStyle(c.querySelector('.votes')).visibility));
    ok('and the other fourteen stay covered', others.every(v => v === 'hidden'));
  } else {
    eq('without scripting, every verdict is already there', vis, 'visible');
    const all = await page.evaluate(() => [...document.querySelectorAll('.wall .votes')]
      .every(v => getComputedStyle(v).visibility === 'visible'));
    ok('all fifteen of them', all);
    ok('and the tally is not pretending to work', await page.evaluate(() =>
      getComputedStyle(document.getElementById('tally')).display) === 'none');
  }
  await browser.close();
}

if (EMIT) { writeFileSync(XPATH, JSON.stringify(xc, null, 1) + '\n'); console.log('\nwrote crosscheck.json'); }
console.log(`\n${pass} checks passed, ${fail} failed.`);
process.exit(fail ? 1 : 0);
