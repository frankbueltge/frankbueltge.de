// Verification of TAKEN, AND PUT BACK.
//   node verify.mjs
//
// Everything is recomputed here in a second language from the method stated in analysis.py,
// not by importing it. The local hour and weekday come from the platform's own time-zone
// database (Intl), not from Python's zoneinfo.
//   THE RECORD — session 147's events.json by the digest that work recorded.
//   THE COUNTS — every day kind x size x hour count, both nights, taken, put back, level;
//                the day sums, shares and the hidden share; the hours that read full.
//   THE FILL   — every row of tubes.csv.
//   THE PAGE   — every drawn tube read back from its rectangles; the numbers in the text;
//                no script, nothing loaded.
//   THE READER — a real browser at 390, 768 and 1280 px, light and dark, network refused;
//                the two-hands control worked by hand.
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { dirname, join } from 'path';

const here = dirname(new URL(import.meta.url).pathname);
const src = join(here, '..', '2026-09-28-woven-by-day');
const raw = readFileSync(join(src, 'events.json'));
const R = JSON.parse(readFileSync(join(here, 'results.json'), 'utf8'));
const HTML = readFileSync(join(here, 'index.html'), 'utf8');
const CSV = readFileSync(join(here, 'tubes.csv'), 'utf8').trim().split(/\r?\n/).map(l => l.split(','));

let ran = 0, failed = 0;
const ok = (name, cond, note) => {
  ran++;
  if (!cond) { failed++; console.log('  FAIL  ' + name + (note !== undefined ? '  — ' + note : '')); }
};
const eq = (name, got, want) => ok(name, JSON.stringify(got) === JSON.stringify(want),
  `got ${JSON.stringify(got)}, expected ${JSON.stringify(want)}`);
const near = (name, got, want, tol = 1e-3) => ok(name, Math.abs(got - want) <= tol, `got ${got}, expected ${want}`);

// ── 1. the record
const digest = createHash('sha256').update(raw).digest('hex');
eq('record · digest against session 147', digest, JSON.parse(readFileSync(join(src, 'results.json'), 'utf8')).events_sha256);
eq('record · digest in results', R.events_sha256, digest);

// ── 2. the counts
const fmtr = new Intl.DateTimeFormat('en-US', { timeZone: 'America/Los_Angeles', hour: 'numeric', hourCycle: 'h23', weekday: 'short' });
const C = { weekday: { small: Array(24).fill(0), larger: Array(24).fill(0) }, weekend: { small: Array(24).fill(0), larger: Array(24).fill(0) } };
let n = 0;
for (const [ms, m, t] of JSON.parse(raw).events) {
  if (t !== 0 || m === null) continue;
  const p = Object.fromEntries(fmtr.formatToParts(new Date(ms)).map(x => [x.type, x.value]));
  const kind = (p.weekday === 'Sat' || p.weekday === 'Sun') ? 'weekend' : 'weekday';
  C[kind][Math.round(m * 100) < 150 ? 'small' : 'larger'][+p.hour]++;
  n++;
}
eq('counts · earthquakes with a size', R.earthquakes_with_size, n);
const sum = (a, i, j) => a.slice(i, j).reduce((x, y) => x + y, 0);
const full = {};
for (const kind of ['weekday', 'weekend']) {
  const k = R[kind], c = C[kind];
  const nS = sum(c.small, 0, 6) / 6, nL = sum(c.larger, 0, 6) / 6;
  near(`${kind} · night small`, k.night_small, nS);
  near(`${kind} · night larger`, k.night_larger, nL);
  near(`${kind} · chance small`, k.chance_small, 2 * Math.sqrt(nS));
  for (let h = 0; h < 24; h++) {
    const x = k.hours[h];
    ok(`${kind} ${h} · counts`, x.hour === h && x.small === c.small[h] && x.larger === c.larger[h] && x.level === c.small[h] + c.larger[h]);
    ok(`${kind} ${h} · taken, put back, net`, Math.abs(x.taken - (nS - c.small[h])) < 1e-3 &&
      Math.abs(x.put_back - (c.larger[h] - nL)) < 1e-3 && Math.abs(x.net - (c.small[h] + c.larger[h] - nS - nL)) < 1e-3);
  }
  const taken = 8 * nS - sum(c.small, 9, 17), put = sum(c.larger, 9, 17) - 8 * nL, d = k.day_9_16;
  near(`${kind} · day taken`, d.taken, taken);
  near(`${kind} · day put back`, d.put_back, put);
  near(`${kind} · day net`, d.net, put - taken);
  eq(`${kind} · day level`, d.level, sum(c.small, 9, 17) + sum(c.larger, 9, 17));
  near(`${kind} · shares`, d.net_share + d.small_share + d.larger_share,
    (put - taken) / (8 * (nS + nL)) - taken / (8 * nS) + put / (8 * nL), 2e-4);
  near(`${kind} · hidden share`, d.hidden_share, taken > 0 && put > 0 ? put / taken : 0, 1e-4);
  full[kind] = [...Array(24).keys()].filter(h => c.small[h] + c.larger[h] - nS - nL >= 0 && nS - c.small[h] > 2 * Math.sqrt(nS));
  eq(`${kind} · hours that read full while taken`, k.full_but_taken, full[kind]);
}
// the coincidence the page states: both day levels short by exactly 680/3
eq('counts · weekday day short by 680/3 exactly', 3 * sum(C.weekday.small, 9, 17) + 3 * sum(C.weekday.larger, 9, 17)
  - 4 * (sum(C.weekday.small, 0, 6) + sum(C.weekday.larger, 0, 6)), -680);
eq('counts · weekend day short by 680/3 exactly', 3 * sum(C.weekend.small, 9, 17) + 3 * sum(C.weekend.larger, 9, 17)
  - 4 * (sum(C.weekend.small, 0, 6) + sum(C.weekend.larger, 0, 6)), -680);

// ── 3. the fill list
eq('fill · rows', CSV.length, 1 + 48);
for (const row of CSV.slice(1)) {
  const [kind, h, s, l, , , fs, fl, ls, ll] = row;
  const c = C[kind], nS = sum(c.small, 0, 6) / 6, nL = sum(c.larger, 0, 6) / 6;
  ok(`fill · ${kind} ${h}`, +s === c.small[+h] && +l === c.larger[+h] && +fs === Math.round(nS / 5) &&
    +fl === Math.round(nL / 5) && +ls === Math.round(c.small[+h] / 5) && +ll === Math.round(c.larger[+h] / 5));
}

// ── 4. the page
ok('page · no script, nothing loaded', !/<script/i.test(HTML) && !/\ssrc\s*=/i.test(HTML) && !/<link/i.test(HTML) && !/@import|url\(/i.test(HTML));
const H = 150;
const grab = cls => [...HTML.matchAll(new RegExp(`<rect class="${cls}" x="([\\d.]+)" y="([\\d.]+)" width="[\\d.]+" height="([\\d.]+)"/>`, 'g'))]
  .map(m => ({ x: +m[1], y: +m[2], h: +m[3] }));
const fills = grab('fill'), smalls = grab('small'), largers = grab('larger'), puts = grab('put');
eq('page · 48 record tubes, 48 small, 48 larger', [fills.length, smalls.length, largers.length], [48, 48, 48]);
let i = 0, pi = 0;
for (const kind of ['weekday', 'weekend']) {
  const c = C[kind], nS = sum(c.small, 0, 6) / 6, nL = sum(c.larger, 0, 6) / 6;
  for (let h = 0; h < 24; h++, i++) {
    const lv = (c.small[h] + c.larger[h]) / (nS + nL) * H, s = c.small[h] / nS * H, l = c.larger[h] / nL * H;
    let good = Math.abs(fills[i].h - lv) < 0.06 && Math.abs(smalls[i].h - s) < 0.06 && Math.abs(largers[i].h - Math.min(l, H)) < 0.06;
    if (l > H) { good = good && Math.abs(puts[pi].h - (l - H)) < 0.11 && puts[pi].x === largers[i].x; pi++; }
    ok(`page · drawn ${kind} ${h}`, good);
  }
}
eq('page · every put-back drawn, none extra', pi, puts.length);
const txt = HTML.replace(/<[^>]+>/g, ' ').replace(/&nbsp;/g, ' ').replace(/\s+/g, ' ').replace(/ /g, ' ').replace(/−/g, '-');
const has = s => ok(`page · says "${s}"`, txt.includes(s));
const wd = R.weekday.day_9_16, we = R.weekend.day_9_16;
has(`${Math.round(wd.taken)} small earthquakes are missing against the night (-16.0 %)`);
has(`${Math.round(wd.put_back)} larger ones are written beyond the night (+13.7 %)`);
has(`The level shows only -227 (-4.6 %): ${Math.round(wd.hidden_share * 100)} % of the hole is filled again`);
has(`66 small ones are taken and 82 larger ones put back, so the level stands +16 above the night`);
has(`about ±${Math.round(2 * Math.sqrt(sum(C.weekday.small, 0, 6) / 6))} for one hour`);
has(`In the same hours ${Math.round(we.taken)} small ones are missing (-9.6 %) and the larger ones fall short too, by ${Math.round(-we.put_back)} (-10.3 %)`);
has(`Weekdays and weekends both show -227 in the day hours: exactly 680/3 each`);
has(`the ${n.toLocaleString('en-US').replace(/,/g, ' ')} earthquakes with a magnitude`);
eq('page · 11 is the only weekday hour that reads full while taken', full.weekday, [11]);
eq('page · table rows', (HTML.match(/<tr( class="d")?><th>\d\d<\/th>/g) || []).length, 24);

// ── 5. the reader
const pw = await import(process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.js');
const browser = await (pw.chromium || pw.default.chromium).launch();
const file = 'file://' + join(here, 'index.html');
const bgs = {};
for (const [width, scheme] of [[390, 'light'], [768, 'dark'], [1280, 'light'], [390, 'dark']]) {
  const p = await browser.newPage({ viewport: { width, height: 900 }, colorScheme: scheme });
  const reqs = []; p.on('request', r => { if (!r.url().startsWith('file:')) reqs.push(r.url()); });
  await p.goto(file);
  ok(`browser ${width} ${scheme} · no horizontal page overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  ok(`browser ${width} ${scheme} · nothing requested`, reqs.length === 0);
  const vis = () => p.evaluate(() => [getComputedStyle(document.querySelector('.rec')).display, getComputedStyle(document.querySelector('.hands')).display]);
  eq(`browser ${width} ${scheme} · opens on the record`, await vis(), ['inline', 'none']);
  await p.click('label[for="v-hands"]');
  eq(`browser ${width} ${scheme} · two hands by hand`, await vis(), ['none', 'inline']);
  bgs[scheme] = await p.evaluate(() => getComputedStyle(document.body).backgroundColor);
  await p.close();
}
ok('browser · dark scheme differs from light', bgs.light !== bgs.dark);
await browser.close();

// record 2 · counts 1 + 2 x (3 + 24 x 2 + 6) + 2 · fill 1 + 48 · page 1 + 1 + 48 + 1 + 8 + 2 · reader 4 x 4 + 1
const DECLARED = 2 + (1 + 2 * (3 + 24 * 2 + 7) + 2) + (1 + 48) + (1 + 1 + 48 + 1 + 8 + 2) + (4 * 4 + 1);
console.log(`${ran} checks, ${failed} failed (declared ${DECLARED})`);
if (ran !== DECLARED) { console.log('FAIL: ran a different number of checks than declared'); process.exit(1); }
process.exit(failed ? 1 : 0);
