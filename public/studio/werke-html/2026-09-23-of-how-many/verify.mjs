// @ts-nocheck — engine work script shielded from the site TS gate (sandboxed display code, vetted by the collective gauntlet + checkForbidden + astro build). A missing type annotation must never turn the whole site build red — see work 011, 2026-07-06.
// Verification of OF HOW MANY.
//   node verify.mjs [path-to-index.html]
//
// Nothing here is imported from the build. The arithmetic is written a second
// time, in another language, from the definitions rather than from the Python:
//
//   THE PRINTING   — three rounding rules, written again, checked against cases
//                    worked by hand.
//   THE CENSUS     — every pair of integers up to n = 2000 walked again, and
//                    every number in counts.json recomputed from that walk.
//   THE FLOORS     — recomputed at nought, one and two decimals, the last of
//                    them out to n = 10000, which is past the Python's reach.
//   THE PICTURE    — the map is decoded out of the page's own pixels and every
//                    one of its 2 002 000 cells compared with this census.
//   THE RULE       — every percentage in the page's text is recomputed from the
//                    two integers printed beside it, and any percentage without
//                    a pair, outside the page's declared exceptions, is a
//                    failure of the work's own rule.
//   THE READER     — the page is opened in a real browser with scripting on and
//                    off, with the network denied in both, and the control is
//                    worked by hand in each state.
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';
import zlib from 'zlib';

const here = dirname(new URL(import.meta.url).pathname);
const file = process.argv.slice(2).find(a => !a.startsWith('--')) || join(here, 'index.html');
const HTML = readFileSync(file, 'utf8');
const C = JSON.parse(readFileSync(join(here, 'counts.json'), 'utf8'));
const DJ = readFileSync(join(here, 'data.json'), 'utf8');
const D = JSON.parse(DJ);

let pass = 0, fail = 0;
const ok = (name, cond, note) => {
  if (cond) pass++;
  else { fail++; console.log('  FAIL  ' + name + (note !== undefined ? '  — ' + note : '')); }
};
const eq = (name, got, want) => ok(name, got === want, `got ${got}, expected ${want}`);
const NMAX = C.nmax;

// ─────────────────────────────────────────────── 1. the printing, written again
// The digits a report carries for k of n at d decimals, scaled by 10^d. Exact
// integer arithmetic: a BigInt is not needed at this size, but no float is used.
function printed(k, n, d, rule) {
  const num = 100 * k * 10 ** d;
  let q = Math.floor(num / n);
  const r = num - q * n;
  if (rule === 'trunc') return q;
  const t = 2 * r;
  if (t > n) return q + 1;
  if (t < n) return q;
  return rule === 'half_up' ? q + 1 : q + (q & 1);
}
const isTie = (k, n, d) => 2 * ((100 * k * 10 ** d) % n) === n;

// worked by hand, from the definitions of the three rules
for (const [k, n, d, up, even, tr] of [
  [1, 16, 1, 63, 62, 62],     // 6.25 % → 6.3 · 6.2 · 6.2
  [1, 8, 1, 125, 125, 125],   // 12.5 % is exact at one decimal: no rule involved
  [1, 8, 0, 13, 12, 12],      // 12.5 % → 13 · 12 · 12
  [1, 3, 1, 333, 333, 333],   // 33.333… is nobody's boundary
  [2, 3, 1, 667, 667, 666],   // 66.666… → 66.7 rounded, 66.6 truncated
  [1, 2000, 1, 1, 0, 0],      // 0.05 % → 0.1 · 0.0 · 0.0
  [3, 400, 1, 8, 8, 7],       // 0.75 % → 0.8 · 0.8 · 0.7
]) {
  eq(`printed ${k}/${n} half-up at ${d}`, printed(k, n, d, 'half_up'), up);
  eq(`printed ${k}/${n} half-even at ${d}`, printed(k, n, d, 'half_even'), even);
  eq(`printed ${k}/${n} truncated at ${d}`, printed(k, n, d, 'trunc'), tr);
}

// ─────────────────────────────────────────────── 2. the census, walked again
const W = 1001;                       // one-decimal printed values, 0.0 … 100.0
const cls = new Uint8Array(W * NMAX); // 0 impossible · 1 one · 2 several · 3 rule
const gcd = (a, b) => { while (b) { [a, b] = [b, a % b]; } return a; };
let possible = 0, multi = 0, ruleCells = 0, tiePairs = 0, pairs = 0;
let dHuHe = 0, dHuTr = 0, dHeTr = 0, firstCollision = null;
const tiesBy = new Map();
const worldsN = new Int32Array(W), worldsPairs = new Int32Array(W);
const distinctAt = new Map();
for (let n = 1; n <= NMAX; n++) {
  const row = cls.subarray((n - 1) * W, n * W);
  const count = new Map();
  for (let k = 0; k <= n; k++) {
    pairs++;
    const he = printed(k, n, 1, 'half_even');
    const hu = printed(k, n, 1, 'half_up');
    const tr = printed(k, n, 1, 'trunc');
    if (hu !== he) dHuHe++;
    if (hu !== tr) dHuTr++;
    if (he !== tr) dHeTr++;
    if (isTie(k, n, 1)) {
      tiePairs++;
      const red = k ? n / gcd(k, n) : 1;
      tiesBy.set(red, (tiesBy.get(red) || 0) + 1);
      row[he] = 3; row[hu] = 3;
    }
    count.set(he, (count.get(he) || 0) + 1);
    worldsPairs[he]++;
  }
  if (firstCollision === null) for (const c of count.values()) if (c > 1) { firstCollision = n; break; }
  for (const [v, c] of count) {
    worldsN[v]++;
    if (row[v] !== 3) row[v] = c > 1 ? 2 : 1;
    if (c > 1) multi++;
  }
  possible += count.size;
  distinctAt.set(String(n), count.size);
  for (let v = 0; v < W; v++) if (row[v] === 3) ruleCells++;
}
eq('census · pairs walked', pairs, C.rule_disagreement.pairs);
eq('census · cells possible', possible, C.fan.cells_possible);
eq('census · cells impossible', W * NMAX - possible, C.fan.cells_impossible);
eq('census · cells with two or more numerators', multi, C.fan.cells_two_or_more_numerators);
eq('census · cells the rule decides', ruleCells, C.fan.cells_the_rule_decides);
eq('census · first denominator with two numerators', firstCollision,
   C.fan.first_denominator_with_two_numerators);
eq('census · half-up vs half-even', dHuHe, C.rule_disagreement.half_up_vs_half_even);
eq('census · half-up vs truncation', dHuTr, C.rule_disagreement.half_up_vs_truncation);
eq('census · half-even vs truncation', dHeTr, C.rule_disagreement.half_even_vs_truncation);
eq('census · pairs on a boundary', tiePairs, C.ties.pairs_on_a_boundary);
for (const [n, want] of Object.entries(C.fan.distinct_values_at_n))
  eq(`census · printable values at n = ${n}`, distinctAt.get(n), want);
ok('census · the four boundary denominators are 16, 80, 400 and 2000',
   [...tiesBy.keys()].sort((a, b) => a - b).join() === '16,80,400,2000',
   [...tiesBy.keys()].sort((a, b) => a - b).join());
for (const [k, v] of Object.entries(C.ties.by_reduced_denominator))
  eq(`census · boundary pairs at n = ${k}`, tiesBy.get(Number(k)), v);
// and the reason, checked rather than asserted: 2000k/n odd means n carries every two of 2000
for (const n of [16, 80, 400, 2000]) ok(`2000 / ${n} is odd`, (2000 / n) % 2 === 1);
for (const n of [8, 40, 200, 32, 160, 25, 50, 100, 1000])
  ok(`${n} is not one of the four (2000/${n} is not an odd whole number)`,
     !(2000 % n === 0 && (2000 / n) % 2 === 1));
const meanN = worldsN.reduce((a, b) => a + b, 0) / W;
eq('census · mean denominators behind one printed value',
   Math.round(meanN * 100) / 100, C.worlds.mean_denominators_per_printed_value);
eq('census · mean pairs behind one printed value',
   Math.round(worldsPairs.reduce((a, b) => a + b, 0) / W * 100) / 100,
   C.worlds.mean_pairs_per_printed_value);
for (const w of C.worlds.fewest_denominators)
  eq(`census · denominators behind ${w.printed} %`,
     worldsN[Math.round(w.printed * 10)], w.denominators);

// ─────────────────────────────────────────────── 3. the floors, further out
function floorsTo(d, nmax) {
  const P = 100 * 10 ** d, f = new Int32Array(P + 1).fill(0), k = new Int32Array(P + 1);
  let found = 0;
  for (let n = 1; n <= nmax && found <= P; n++)
    for (let kk = 0; kk <= n; kk++) {
      const v = printed(kk, n, d, 'half_even');
      if (!f[v]) { f[v] = n; k[v] = kk; found++; }
    }
  return { f, k };
}
for (const [d, reach] of [[0, 2000], [1, 2000], [2, 10000]]) {
  const { f, k } = floorsTo(d, reach);
  const want = D.floors[`d${d}`], wantK = D.floor_k[`d${d}`];
  let same = 0, sameK = 0;
  for (let v = 0; v < want.length; v++) {
    if (f[v] === want[v]) same++;
    if (k[v] === wantK[v]) sameK++;
  }
  eq(`floors · every floor at ${d} decimals`, same, want.length);
  eq(`floors · every count at that floor, ${d} decimals`, sameK, want.length);
  const st = C.floors[`d${d}`];
  eq(`floors · the tallest at ${d} decimals`, Math.max(...want), st.max);
  eq(`floors · the median at ${d} decimals`,
     [...want].sort((a, b) => a - b)[Math.floor(want.length / 2)], st.median);
  eq(`floors · how many need more than a hundred, ${d} decimals`,
     want.filter(x => x > 100).length, st.floor_over_100);
}
// the tenfold ratchet the page claims, checked at the extremes
eq('floors · 1 % needs 67', D.floors.d0[1], 67);
eq('floors · 0.1 % needs 667', D.floors.d1[1], 667);
eq('floors · 0.01 % needs 6667', D.floors.d2[1], 6667);
ok('floors · 33.4 % needs 96 of 287', D.floors.d1[334] === 287 && D.floor_k.d1[334] === 96);

// ─────────────────────────────────────────────── 4. the eight sentences
for (const s of C.sentences) {
  const d = s.decimals, v = Math.round(Number(s.printed) * 10 ** d);
  let floor = null, floorK = null, sizes = 0;
  for (let n = 1; n <= NMAX; n++) {
    let hit = false;
    for (let k = 0; k <= n; k++) if (printed(k, n, d, 'half_even') === v) { hit = true; if (floor === null) { floor = n; floorK = k; } break; }
    if (hit) sizes++;
  }
  eq(`sentence ${s.printed} % · floor`, floor, s.floor);
  eq(`sentence ${s.printed} % · the count at that floor`, floorK, s.floor_k);
  eq(`sentence ${s.printed} % · denominators up to ${NMAX}`, sizes, s.denominators_up_to_nmax);
  const thousand = [...Array(1001).keys()].some(k => printed(k, 1000, d, 'half_even') === v);
  eq(`sentence ${s.printed} % · could it be a thousand`, !thousand, s.rules_out_1000);
}

// ─────────────────────────────────────────────── 5. the page is one file
ok('page · no stylesheet link', !/<link[^>]+rel=["']?stylesheet/i.test(HTML));
ok('page · no script with a source', !/<script[^>]+src=/i.test(HTML));
ok('page · no @import', !/@import/i.test(HTML));
ok('page · the only URLs in it are its own data',
   [...HTML.matchAll(/(?:src|href)=["']([^"']+)["']/g)]
     .every(m => m[1].startsWith('data:') || m[1].startsWith('#')));
ok('page · no http address anywhere in the markup', !/https?:\/\//i.test(HTML));
const island = HTML.match(/<script type="application\/json" id="data">([\s\S]*?)<\/script>/);
ok('page · carries the data island', !!island);
ok('page · the island is data.json, unchanged', island && island[1] === DJ.trimEnd());

// ─────────────────────────────────────────────── 6. the map, read back out of the page
const uri = HTML.match(/src="data:image\/png;base64,([A-Za-z0-9+/=]+)"/);
ok('picture · the map is in the page', !!uri);
const png = Buffer.from(uri[1], 'base64');
ok('picture · it is a PNG', png.subarray(0, 8).toString('hex') === '89504e470d0a1a0a');
let off = 8, ihdr = null, idat = [], plte = null;
while (off < png.length) {
  const len = png.readUInt32BE(off), tag = png.subarray(off + 4, off + 8).toString('latin1');
  const body = png.subarray(off + 8, off + 8 + len);
  if (tag === 'IHDR') ihdr = { w: body.readUInt32BE(0), h: body.readUInt32BE(4), depth: body[8], colour: body[9] };
  if (tag === 'PLTE') plte = body;
  if (tag === 'IDAT') idat.push(body);
  off += 12 + len;
}
eq('picture · width', ihdr.w, W);
eq('picture · height', ihdr.h, NMAX);
eq('picture · bit depth', ihdr.depth, 2);
eq('picture · palette colours', plte.length / 3, 4);
const raw = zlib.inflateSync(Buffer.concat(idat));
const stride = Math.ceil(W * 2 / 8);
eq('picture · decoded size', raw.length, (stride + 1) * NMAX);
let wrong = 0, filters = 0;
for (let y = 0; y < NMAX; y++) {
  if (raw[y * (stride + 1)] !== 0) filters++;
  const line = raw.subarray(y * (stride + 1) + 1, (y + 1) * (stride + 1));
  for (let x = 0; x < W; x++) {
    const b = line[x >> 2], v = (b >> (6 - 2 * (x & 3))) & 3;
    if (v !== cls[y * W + x]) wrong++;
  }
}
eq('picture · every row is stored unfiltered', filters, 0);
eq('picture · pixels disagreeing with this census', wrong, 0);
// what the page says the picture shows
let dark = 0, pale = 0, red = 0;
for (const v of cls) { if (v === 0) dark++; else if (v === 2) pale++; else if (v === 3) red++; }
const P = C.fan.picture_classes;
eq('picture · dark cells', dark, P.dark_impossible);
eq('picture · pale cells, where the numerator is gone', pale, P.pale_several_numerators);
eq('picture · red cells, where the rule decides', red, P.red_the_rule_decides);
eq('picture · red is the whole rule-decided set', red, C.fan.cells_the_rule_decides);
eq('picture · every cell is one of the four', dark + pale + red + P.one_numerator, W * NMAX);
// red is painted over the others, so the census counts are recovered by adding it back
let redImpossible = 0, redMulti = 0;
for (let n = 1; n <= NMAX; n++) {
  const count = new Map();
  for (let k = 0; k <= n; k++) {
    const he = printed(k, n, 1, 'half_even');
    count.set(he, (count.get(he) || 0) + 1);
  }
  for (let v = 0; v < W; v++) if (cls[(n - 1) * W + v] === 3) {
    const c = count.get(v) || 0;
    if (c === 0) redImpossible++; else if (c > 1) redMulti++;
  }
}
eq('picture · dark plus the impossible cells painted red', dark + redImpossible, C.fan.cells_impossible);
eq('picture · pale plus the crowded cells painted red', pale + redMulti,
   C.fan.cells_two_or_more_numerators);

// ─────────────────────────────── 7. the work's own rule: every percentage has its pair
const pcs = [...HTML.matchAll(/<span class="pc([^"]*)">([^<]*?) %<span class="of">([^<]*)<\/span><\/span>/g)];
ok('rule · the page prints percentages at all', pcs.length >= 8, `${pcs.length} found`);
let checked = 0, quoted = 0;
for (const m of pcs) {
  const [, kind, num, of] = m;
  if (kind.includes('quoted')) {
    ok(`rule · ${num} % says its integers were not published`, of.includes('integers not published'));
    quoted++;
    continue;
  }
  const pair = of.match(/\((\d[\d ]*) of (\d[\d ]*)\)/);
  ok(`rule · ${num} % carries a pair`, !!pair, of);
  if (!pair) continue;
  const k = Number(pair[1].replace(/ /g, '')), n = Number(pair[2].replace(/ /g, ''));
  const d = num.includes('.') ? num.split('.')[1].length : 0;
  const want = Number(num.replace('.', ''));
  eq(`rule · ${num} % is what ${k} of ${n} prints`, printed(k, n, d, 'half_even'), want);
  checked++;
}
ok('rule · at least six percentages recomputed from their own integers', checked >= 6, String(checked));
ok('rule · at least two quoted without integers, and marked so', quoted >= 2, String(quoted));

// ─────────────────────────────────────────────── 8. the reader, in a real browser
const GLOBAL_PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.js';
const pw = await import('playwright').catch(() => import(GLOBAL_PW));
const chromium = pw.chromium || pw.default.chromium;
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
      bands: [...document.querySelectorAll('.band')].map(
        b => getComputedStyle(b).display !== 'none'),
      img: (() => { const i = document.querySelector('img.fan'); return i ? i.naturalWidth : 0; })(),
      rows: document.querySelectorAll('tbody tr').length,
      pcs: document.querySelectorAll('.pc').length,
      bars: document.querySelectorAll('.band.b1 path.bars').length,
      segs: (document.querySelector('.band.b1 path.bars')?.getAttribute('d') || '').split('M').length - 1,
      text: document.body.innerText.length,
    }));
    eq(`reader ${tag} · one band shown, the other two hidden`,
       seen.bands.filter(Boolean).length, 1);
    eq(`reader ${tag} · the map decoded in the browser`, seen.img, W);
    ok(`reader ${tag} · the tables are there`, seen.rows >= 12, String(seen.rows));
    ok(`reader ${tag} · the percentages are there`, seen.pcs >= 8, String(seen.pcs));
    eq(`reader ${tag} · the skyline has one bar per printed value`, seen.segs, 1001);
    ok(`reader ${tag} · the page has its text`, seen.text > 8000, String(seen.text));
    // the control, worked by hand
    for (const [id, band] of [['d0', 'b0'], ['d2', 'b2'], ['d1', 'b1']]) {
      await page.click(`label[for=${id}]`);
      const shown = await page.evaluate(b => {
        const on = [...document.querySelectorAll('.band')]
          .filter(x => getComputedStyle(x).display !== 'none');
        return on.length === 1 && on[0].classList.contains(b);
      }, band);
      ok(`reader ${tag} · choosing ${id} shows only that band`, shown);
    }
    await ctx.close();
  }
  await browser.close();
}

console.log(`\n  ${pass} checks, ${fail} failed`);
process.exit(fail ? 1 : 0);
