// Verification of THE NAME ON THE DECK.   node verify.mjs
// Second-language recomputation of results.json from osm-extract.json; the page read back; a real browser if playwright is present.
import { readFileSync } from 'fs';
import { createHash } from 'crypto';
import { dirname, join } from 'path';
const here = dirname(new URL(import.meta.url).pathname);
const rawX = readFileSync(join(here, 'osm-extract.json'));
const X = JSON.parse(rawX), R = JSON.parse(readFileSync(join(here, 'results.json'), 'utf8'));
const HTML = readFileSync(join(here, 'index.html'), 'utf8');
let ran = 0, failed = 0;
const ok = (n, c, note) => { ran++; if (!c) { failed++; console.log('  FAIL  ' + n + (note !== undefined ? ' — ' + note : '')); } };
const eq = (n, g, w) => ok(n, JSON.stringify(g) === JSON.stringify(w), `got ${JSON.stringify(g)} want ${JSON.stringify(w)}`);
eq('digest', createHash('sha256').update(rawX).digest('hex'), R.osm_extract_sha256);
const WIKI = ['Coleman Bridge','Kim Seng Bridge','Elgin Bridge','Cavenagh Bridge','Ord Bridge','Read Bridge','Pulau Saigon Bridge','Anderson Bridge','Clemenceau Bridge','Benjamin Sheares Bridge','Esplanade Bridge','Robertson Bridge','Jiak Kim Bridge','Alkaff Bridge','Helix Bridge','Bayfront Bridge','Jubilee Bridge'];
eq('seventeen names in the extract', X.names, WIKI);
let nd = 0, nr = 0, ns = 0;
const spokenOf = {};
for (const nm of WIKI) {
  const el = X.elements;
  const body = el.filter(e => e.tags.name === nm && e.tags.man_made === 'bridge').length;
  const deck = el.filter(e => e.tags.name === nm && e.tags.highway && e.tags.highway !== 'bus_stop').length;
  const tag = el.filter(e => e.tags['bridge:name'] === nm && e.tags.highway).length;
  const sp = deck ? 'deck' : tag ? 'road' : 'silent';
  spokenOf[nm] = sp;
  const row = R.rows.find(r => r.name === nm);
  eq(nm + ' body', row.body, body); eq(nm + ' deck', row.deck, deck); eq(nm + ' tag', row.tag, tag); eq(nm + ' spoken', row.spoken, sp);
  ok(nm + ' has a structure', body >= 1);
  if (sp === 'deck') nd++; else if (sp === 'road') nr++; else ns++;
}
eq('deck count', [R.n_deck, nd], [5, 5]); eq('road count', [R.n_road, nr], [7, 7]); eq('silent count', [R.n_silent, ns], [5, 5]);
eq('all seventeen have a body', R.n_body, 17);
const med = a => a.sort((x, y) => x - y)[Math.floor(a.length / 2)];
eq('median year deck', R.median_year_deck, med(R.rows.filter(r => r.spoken === 'deck').map(r => r.first_year)));
eq('median year road', R.median_year_road, med(R.rows.filter(r => r.spoken === 'road').map(r => r.first_year)));
eq('river ways', X.river.length, 11); eq('river points', X.river.reduce((a, w) => a + w.length, 0), R.river_points);
// the page
ok('no script', !/<script/i.test(HTML)); ok('no external load', !/(src|href)="https?:/.test(HTML.replace(/<a href="https?:[^"]*">/g, '')));
eq('17 table rows', (HTML.match(/<tr class="[drs]">/g) || []).length, 17);
eq('17 marks', (HTML.match(/<g class="t [drs]">/g) || []).length, 17);
eq('11 river polylines', (HTML.match(/class="riv"/g) || []).length, 11);
for (const [k, v] of [['d', 5], ['r', 7], ['s', 5]]) {
  eq('rows class ' + k, (HTML.match(new RegExp(`<tr class="${k}">`, 'g')) || []).length, v);
  eq('marks class ' + k, (HTML.match(new RegExp(`<g class="t ${k}">`, 'g')) || []).length, v);
}
for (const nm of WIKI) ok('page names ' + nm, HTML.includes('>' + nm + '<') || HTML.includes(nm));
ok('big numbers 5 7 5', /<b>5<\/b>[\s\S]*<b>7<\/b>[\s\S]*<b>5<\/b>/.test(HTML));
ok('median years on page', HTML.includes(String(R.median_year_deck)) && HTML.includes(String(R.median_year_road)));
// a real browser
let pw; try { pw = await import('playwright'); } catch { try { pw = await import(process.env.PW || 'playwright'); } catch {} }
if (pw) {
  const b = await pw.chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium', args: ['--no-sandbox'] }).catch(() => null);
  if (b) {
    for (const [w, scheme] of [[390, 'light'], [768, 'dark'], [1280, 'light']]) {
      const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme, javaScriptEnabled: false });
      const p = await ctx.newPage(); const reqs = [];
      await p.route('**/*', r => { if (r.request().url().startsWith('file:')) r.continue(); else { reqs.push(r.request().url()); r.abort(); } });
      await p.goto('file://' + join(here, 'index.html'));
      ok(`browser ${w} no overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1));
      ok(`browser ${w} no network`, reqs.length === 0);
      const a = await p.$$eval('td.nm .a', n => n.filter(x => getComputedStyle(x).display !== 'none').length);
      eq(`browser ${w} first state shows way names`, a, 17);
      await p.click('label[for=sb]');
      const bb = await p.$$eval('td.nm .b', n => n.filter(x => getComputedStyle(x).display !== 'none').length);
      const aa = await p.$$eval('td.nm .a', n => n.filter(x => getComputedStyle(x).display !== 'none').length);
      eq(`browser ${w} second state shows bridge names`, [bb, aa], [17, 0]);
      await p.screenshot({ path: join(process.env.SHOTS || '/tmp', `shot-${w}.png`), fullPage: true });
      await ctx.close();
    }
    await b.close();
  } else console.log('  (browser not launched; page checks only)');
} else console.log('  (playwright not found; page checks only)');
console.log(`${ran} checks, ${failed} failed`);
process.exit(failed ? 1 : 0);
