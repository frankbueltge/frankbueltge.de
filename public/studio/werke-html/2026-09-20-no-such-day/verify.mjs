// @ts-nocheck — engine work script shielded from the site TS gate (sandboxed display code, vetted by the collective gauntlet + checkForbidden + astro build). A missing type annotation must never turn the whole site build red — see work 011, 2026-07-06.
// Headless verification of NO SUCH DAY.
//   node verify.mjs [path-to-index.html]
//
// Six questions.
//   THE ISLAND     — is the page one file, carrying its own data, reaching for nothing?
//   THE ARITHMETIC — do the published numbers follow from the parts? Every relation is
//                    recomputed here from data.json and counts.json, never copied from
//                    the page, and the two files are checked against each other.
//   THE DRAWING    — the sheet claims ink on exactly the contested cells. That claim is
//                    measured out of the SVG: every rectangle is decoded back into cells
//                    and counted against the layer it belongs to.
//   WITHOUT SCRIPT — does a reader with no JavaScript get the whole work: every headline
//                    number, all three layers, the zoom, the three windows, the table?
//   THE HAND       — do the three controls work with scripting switched off, as pure CSS?
//   THE NETWORK    — is any request made off the filesystem, in either state?
import { readFileSync } from 'fs';
import { dirname, join } from 'path';

const GLOBAL_PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.js';
const pw = await import('playwright').catch(() => import(GLOBAL_PW));
const chromium = pw.chromium || pw.default.chromium;

const here = dirname(new URL(import.meta.url).pathname);
const file = process.argv[2] || join(here, 'index.html');
const HTML = readFileSync(file, 'utf8');
const D = JSON.parse(readFileSync(join(here, 'data.json'), 'utf8'));
const C = JSON.parse(readFileSync(join(here, 'counts.json'), 'utf8'));
const S = JSON.parse(readFileSync(join(here, 'sources.json'), 'utf8'));

let pass = 0, fail = 0;
const ok = (name, cond, note) => {
  if (cond) { pass++; }
  else { fail++; console.log('  FAIL  ' + name + (note ? '  — ' + note : '')); }
};
const eq = (name, a, b) => ok(name, a === b, `got ${JSON.stringify(a)}, expected ${JSON.stringify(b)}`);
const section = s => console.log('\n' + s);

const Y0 = D.grid.year_from, NY = D.grid.years, N = D.grid.written_dates;
const idx = (y, m, d) => ((y - Y0) * 12 + (m - 1)) * 31 + (d - 1);
const cellsOf = runs => { const s = new Set(); for (const [slot, r0, len] of runs)
  for (let k = 0; k < len; k++) s.add(slot * NY + (r0 + k)); return s; };
const slotRowToIdx = key => { const slot = Math.floor(key / NY), row = key % NY;
  return ((row) * 12 + Math.floor(slot / 31)) * 31 + (slot % 31); };

// ───────────────────────────────────────────────────────────── THE ARITHMETIC
section('THE ARITHMETIC — every relation recomputed from the parts');

eq('the grid is 431 years of 12 months of 31 slots', NY * 12 * 31, N);
eq('431 years from 1500 to 1930', D.grid.year_to - D.grid.year_from + 1, NY);
eq('160 332 written dates', N, 160332);
eq('sixteen readers', D.readers.length, 16);
eq('eleven of them are what you get without asking',
   D.readers.filter(r => r.is_default).length, 11);
eq('five must be named', D.readers.filter(r => !r.is_default).length, 5);
eq('counts.json agrees on the number of readers', C.what_was_asked.readers, D.readers.length);
eq('counts.json agrees on the number of written dates', C.what_was_asked.written_dates, N);

for (const r of D.readers)
  eq(`${r.id}: accepted + refused = every written date`, r.accepted + r.refused, N);
for (const r of D.readers) {
  const p = C.per_reader[r.id];
  ok(`${r.id}: counts.json and data.json give the same answer counts`,
     p && p.accepted === r.accepted && p.refused === r.refused &&
     p.answers_a_day_already_named === r.already_named);
  ok(`${r.id}: its answer file carries a sha256`, /^[0-9a-f]{64}$/.test(p.sha256_of_its_answers));
}

// the layers, decoded back into cells
const Lex = cellsOf(D.layers.exist_defaults.runs);
const Lrf = cellsOf(D.layers.exist_reform.runs);
const Lid = cellsOf(D.layers.ident_defaults.runs);
const L16 = cellsOf(D.layers.ident_all.runs);
eq('the loud layer holds the cells it says it holds', Lex.size, D.layers.exist_defaults.cells);
eq('the reform layer holds the cells it says it holds', Lrf.size, D.layers.exist_reform.cells);
eq('the silent layer holds the cells it says it holds', Lid.size, D.layers.ident_defaults.cells);
eq('the sixteen-reader layer holds the cells it says it holds', L16.size, D.layers.ident_all.cells);
eq('the sixteen-reader layer is every written date in the range', L16.size, N);
eq('the headline loud figure is the layer', D.headline.loud, Lex.size);
eq('the headline silent figure is the layer', D.headline.silent, Lid.size);
eq('counts.json gives the same loud figure',
   C.the_loud_disagreement.written_dates_some_reader_refuses_and_another_accepts_defaults, Lex.size);
eq('counts.json gives the same silent figure',
   C.the_silent_disagreement.written_dates_every_default_accepts_and_they_do_not_all_mean_one_day, Lid.size);

ok('the reform cells are a subset of the loud layer', [...Lrf].every(k => Lex.has(k)));
eq('fourteen cells of the loud layer a calendar reform explains', Lrf.size, 14);
const reformWant = new Set();
for (let d = 5; d <= 14; d++) reformWant.add(idx(1582, 10, d));
for (const y of [1500, 1700, 1800, 1900]) reformWant.add(idx(y, 2, 29));
const reformGot = new Set([...Lrf].map(slotRowToIdx));
eq('and they are exactly October 1582 and four Julian leap days', reformGot.size, reformWant.size);
ok('every one of the fourteen is where it should be', [...reformWant].every(i => reformGot.has(i)));
eq('counts.json lists the same fourteen', C.the_loud_disagreement.which_are.length, 14);
eq('the rest of the loud layer is strictness, not history',
   C.the_loud_disagreement.the_rest_are_strictness_not_history, Lex.size - 14);
const bySlot = C.the_loud_disagreement.the_rest_by_slot;
eq('and six of its slots are a written date no calendar ever had',
   ['02-30','02-31','04-31','06-31','09-31','11-31'].filter(k => bySlot[k] === NY).length, 6);
eq('the seventh is 29 February in the years that are not leap years', bySlot['02-29'], 323);
eq('431 years hold 323 non-leap Februaries', NY - 323, 108);

// the silent block, recomputed as a closed span
const idsSilent = [...Lid].map(slotRowToIdx).sort((a, b) => a - b);
eq('the silent block begins at the first written date of 1500', idsSilent[0], idx(1500, 1, 1));
eq('the silent block ends at 14 October 1582', idsSilent[idsSilent.length - 1], idx(1582, 10, 14));
eq('and holds every written date in between, with no hole',
   idsSilent.length, idsSilent[idsSilent.length - 1] - idsSilent[0] + 1);
eq('which is the published figure', idsSilent.length, 30797);
eq('the published share of the range is that count over the whole',
   Math.round(1000 * idsSilent.length / N) / 10, D.headline.silent_share);
ok('the span in counts.json is the span in the drawing',
   C.the_silent_disagreement.span[0] === '1500-01-01' && C.the_silent_disagreement.span[1] === '1582-10-14');
ok('counts.json states the span is closed', C.the_silent_disagreement.span_is_every_written_date_in_it === true);

// who keeps what
eq('six readers refuse nothing at all', C.refuses_nothing.length, 6);
for (const r of C.refuses_nothing) {
  eq(`${r} refuses nothing`, C.per_reader[r].refused, 0);
  ok(`${r} hands back days already named`, C.per_reader[r].answers_a_day_already_named > 0);
  eq(`${r} has no reform legible in its answers`, C.per_reader[r].reform_read_off_its_own_answers.length, 0);
}
eq('two of the eleven defaults keep the deletion of 1582',
   C.carries_the_cutover_of_1582_among_the_defaults.length, 2);
ok('and they are Ruby’s default and Java’s GregorianCalendar',
   C.carries_the_cutover_of_1582_among_the_defaults.includes('ruby-default-italy') &&
   C.carries_the_cutover_of_1582_among_the_defaults.includes('java-gregoriancalendar'));
eq('one reader of sixteen refuses the eleven days of the Act',
   C.refuses_the_eleven_days_of_the_act.length, 1);
eq('and it is the one you have to name', C.refuses_the_eleven_days_of_the_act[0], 'ruby-england');
ok('which is not a default', D.readers.find(r => r.id === 'ruby-england').is_default === false);
eq('no reader refuses any day of February 1918', C.refuses_any_day_of_february_1918.length, 0);
eq('no written date in 431 years is refused by every reader',
   C.the_whole_bench.written_dates_no_reader_at_all_accepts, 0);
eq('no written date is agreed on by all sixteen',
   C.the_whole_bench.written_dates_all_sixteen_agree_exist_and_mean_one_day, 0);
eq('the defaults agree outright on the rest of the range',
   C.the_whole_bench.written_dates_every_default_accepts_and_all_mean_one_day, 127182);
eq('and that is the range less the loud and the silent together',
   C.the_whole_bench.written_dates_every_default_accepts_and_all_mean_one_day,
   N - new Set([...idsSilent, ...[...Lex].map(slotRowToIdx)]).size);

// the reform each reader shows in its own answers
const reforms = Object.fromEntries(D.readers.map(r => [r.id, r.reform]));
eq('Ruby’s default shows a ten-day refusal', reforms['ruby-default-italy'][0].days, 10);
eq('beginning 1582-10-05', reforms['ruby-default-italy'][0].from, '1582-10-05');
eq('and ending 1582-10-14', reforms['ruby-default-italy'][0].to, '1582-10-14');
eq('Java’s strict GregorianCalendar shows the same ten days',
   reforms['java-gregcal-strict'][0].from + '/' + reforms['java-gregcal-strict'][0].to,
   '1582-10-05/1582-10-14');
eq('Date::ENGLAND shows eleven days', reforms['ruby-england'][0].days, 11);
eq('beginning 1752-09-03', reforms['ruby-england'][0].from, '1752-09-03');
eq('and ending 1752-09-13', reforms['ruby-england'][0].to, '1752-09-13');
eq('eleven is what the Act says it omitted', reforms['ruby-england'][0].days,
   S.the_act.the_number_of_nominal_days_it_omits);
eq('exactly three readers show a reform at all',
   D.readers.filter(r => r.reform.length > 0).length, 3);

// the collapse
ok('Java’s lenient GregorianCalendar answers 5 and 15 October 1582 with one day',
   C.the_collapse.same_day === true);
eq('and it is the day of the fifteenth', C.the_collapse['1582-10-05_is_answered_with'],
   C.the_collapse['1582-10-15_is_answered_with']);

// the two written dates looked at one at a time
eq('30 February 1712 is refused by ten readers',
   C.two_written_dates_in_detail['1712-02-30'].refused_by.length, 10);
eq('and taken by six', C.two_written_dates_in_detail['1712-02-30'].accepted_by.length, 6);
ok('and the six that take it are exactly the six that refuse nothing',
   JSON.stringify(C.two_written_dates_in_detail['1712-02-30'].accepted_by) ===
   JSON.stringify(C.refuses_nothing));
eq('ten and six are sixteen',
   C.two_written_dates_in_detail['1712-02-30'].refused_by.length +
   C.two_written_dates_in_detail['1712-02-30'].accepted_by.length, 16);
eq('every reader that takes it files it under a day already named',
   C.two_written_dates_in_detail['1712-02-30'].and_of_those_how_many_hand_back_a_day_already_named, 6);
eq('29 February 1700 splits the bench in half',
   C.two_written_dates_in_detail['1700-02-29'].refused_by.length, 8);

// the windows
eq('three windows', D.windows.length, 3);
for (const w of D.windows) {
  eq(`${w.key}: sixteen rows`, Object.keys(w.rows).length, 16);
  for (const [rid, row] of Object.entries(w.rows)) {
    eq(`${w.key}/${rid}: a cell for every day of the window`, row.cells.length, w.days.length);
    ok(`${w.key}/${rid}: every cell is refused, its own day, or a day already named`,
       row.cells.every(c => c === 0 || c === 1 || c === 2));
    ok(`${w.key}/${rid}: a refusal carries no day, an acceptance does`,
       (row.first_day_meant === null) === (row.cells[0] === 0));
  }
}
const rome = D.windows.find(w => w.key === 'rome');
eq('the Rome window covers 26 September to 25 October 1582', rome.days[0] + '/' + rome.days[rome.days.length-1],
   '1582-09-26/1582-10-25');
eq('two readers refuse 5 October 1582',
   Object.values(rome.rows).filter(r => r.cells[rome.days.indexOf('1582-10-05')] === 0).length, 2);
eq('and Java’s lenient calendar answers it with a day already named',
   rome.rows['java-gregoriancalendar'].cells[rome.days.indexOf('1582-10-05')], 2);
const london = D.windows.find(w => w.key === 'london');
eq('exactly one reader refuses 3 September 1752',
   Object.values(london.rows).filter(r => r.cells[london.days.indexOf('1752-09-03')] === 0).length, 1);
const petro = D.windows.find(w => w.key === 'petrograd');
for (let d = 1; d <= 13; d++)
  eq(`nobody refuses ${d} February 1918`,
     Object.values(petro.rows).filter(r => r.cells[petro.days.indexOf(`1918-02-${String(d).padStart(2,'0')}`)] === 0).length, 0);
eq('the ten days of 1582 are ten', 14 - 4, 10);
eq('the readers disagree by ten days across the 1582 cutover',
   rome.rows['ruby-default-italy'].first_day_meant - rome.rows['python-date'].first_day_meant, 10);
eq('and by eleven across the 1752 one',
   london.rows['ruby-england'].first_day_meant - london.rows['python-date'].first_day_meant, 11);

// sources
ok('the Act is cited to the service that publishes it',
   /legislation\.gov\.uk/.test(S.the_act.url));
ok('every source carries what it was read for', S.sources.every(s => s.url && s.read && s.what_for));
ok('the secondary claims are marked as secondary',
   S.not_verified_against_an_original.length >= 3 &&
   S.not_verified_against_an_original.every(x => x.claim && x.status === 'secondary, not verified here'));

// ───────────────────────────────────────────────────────────────── THE ISLAND
section('THE ISLAND — one file, reaching for nothing');
ok('no external script', !/<script[^>]+src=/i.test(HTML));
ok('no stylesheet link', !/<link[^>]+rel=["']?stylesheet/i.test(HTML));
ok('no image, frame, object or embed element',
   !/<(img|iframe|object|embed|video|audio|source)\b/i.test(HTML));
ok('no url() in the stylesheet', !/url\(/i.test(HTML));
ok('no @import', !/@import/i.test(HTML));
ok('the only script element is an inert block of the page’s own data',
   (HTML.match(/<script/gi) || []).length === 1 &&
   /<script type="application\/json" id="data">/.test(HTML));
const embedded = HTML.split('<script type="application/json" id="data">')[1].split('</script>')[0];
ok('and it is byte-identical to data.json',
   embedded === readFileSync(join(here, 'data.json'), 'utf8'));
const hrefs = [...HTML.matchAll(/href="([^"]+)"/g)].map(m => m[1]);
ok('every address in the page is a link a reader may follow, not a fetch',
   hrefs.every(h => /^https?:\/\//.test(h)));
ok('and the Act is one of them', hrefs.some(h => h.includes('legislation.gov.uk')));

// ───────────────────────────────────────────── the browser: drawing, hand, network
const browser = await chromium.launch();
async function run(js) {
  const ctx = await browser.newContext({ javaScriptEnabled: js });
  const seen = [];
  await ctx.route('**/*', route => {
    const u = route.request().url();
    if (!u.startsWith('file://')) { seen.push(u); return route.abort(); }
    route.continue();
  });
  const page = await ctx.newPage();
  page.on('request', r => { if (!r.url().startsWith('file://')) seen.push(r.url()); });
  await page.goto('file://' + file, { waitUntil: 'load' });
  return { ctx, page, seen };
}

for (const js of [true, false]) {
  section(`IN A REAL BROWSER — scripting ${js ? 'on' : 'off'}, network denied`);
  const { ctx, page, seen } = await run(js);
  const text = await page.evaluate(() => document.body.innerText);

  // THE DRAWING — measured out of the SVG, not read off the caption
  const draw = await page.evaluate(() => {
    const out = {};
    const area = sel => [...document.querySelectorAll(sel)]
      .reduce((a, r) => a + r.width.baseVal.value * r.height.baseVal.value, 0);
    out.ink1 = area('.p1 svg g.ink rect');
    out.red1 = area('.p1 svg g.red rect');
    out.ink2 = area('.p2 svg:first-of-type g.ink rect');
    out.ink3 = area('.p3 svg g.ink rect');
    out.n1 = document.querySelectorAll('.p1 svg g.ink rect').length;
    out.zoom = document.querySelectorAll('.p2 figure rect.z').length;
    out.wins = [...document.querySelectorAll('.win svg')].map(s => ({
      yes: s.querySelectorAll('rect.yes').length,
      dup: s.querySelectorAll('rect.dup').length,
      no: s.querySelectorAll('rect.no').length }));
    out.rows = document.querySelectorAll('table tbody tr').length;
    out.named = document.querySelectorAll('table tbody tr.nm').length;
    out.panes = document.querySelectorAll('.pane').length;
    return out;
  });
  const CELL = 4; // 2 x 2
  eq(`ink on the loud layer is ${D.layers.exist_defaults.cells} cells`, draw.ink1 / CELL, D.layers.exist_defaults.cells);
  eq('red on the loud layer is the fourteen', draw.red1 / CELL, 14);
  eq(`ink on the silent layer is ${D.layers.ident_defaults.cells} cells`, draw.ink2 / CELL, D.layers.ident_defaults.cells);
  eq('ink on the sixteen-reader layer is every cell of the sheet', draw.ink3 / CELL, N);
  eq('the loud layer is drawn as the runs it was encoded as', draw.n1, D.layers.exist_defaults.runs.length);
  ok('the zoom draws the years it says it draws', draw.zoom > 0);
  eq('the zoom holds September 1582 entire and October to the fourteenth',
     draw.zoom, (() => { let c = 0; const S2 = new Set([...Lid].map(slotRowToIdx));
       for (let y = 1578; y <= 1584; y++) for (let m = 8; m <= 11; m++)
         for (let d = 1; d <= 31; d++) if (S2.has(idx(y, m, d))) c++;
       return c; })());
  D.windows.forEach((w, i) => {
    const want = Object.values(w.rows).reduce((a, r) => {
      a.yes += r.cells.filter(c => c === 1).length;
      a.dup += r.cells.filter(c => c === 2).length;
      a.no  += r.cells.filter(c => c === 0).length; return a; }, {yes:0,dup:0,no:0});
    eq(`${w.key}: squares accepted and its own day`, draw.wins[i].yes, want.yes);
    eq(`${w.key}: squares accepted and a day already named`, draw.wins[i].dup, want.dup);
    eq(`${w.key}: squares refused`, draw.wins[i].no, want.no);
  });
  eq('the table has a row for each reader', draw.rows, 16);
  eq('and marks the five you must name', draw.named, 5);
  eq('all three layers are in the served page', draw.panes, 3);

  // WITHOUT SCRIPT — the headline numbers are in the text either way
  for (const s of ['160 332', '30 797', '2 923', 'fourteenth day of September',
                   'nominal days of the common calendar', '14 October 1582'])
    ok(`the page says ${JSON.stringify(s.slice(0, 34))}`, text.includes(s));
  ok('and names the practice', text.includes('Ensemble'));

  // THE HAND — three controls, CSS only
  const shown = () => page.evaluate(() => [...document.querySelectorAll('.pane')]
    .map(p => getComputedStyle(p).display));
  eq('the first layer is the one served', (await shown()).join(), 'block,none,none');
  await page.click('label[for=L2]');
  eq('the second control shows the second layer', (await shown()).join(), 'none,block,none');
  await page.click('label[for=L3]');
  eq('the third control shows the third layer', (await shown()).join(), 'none,none,block');
  await page.click('label[for=L1]');
  eq('and the first comes back', (await shown()).join(), 'block,none,none');

  // THE NETWORK
  eq('no request leaves the filesystem', seen.length, 0);
  await ctx.close();
}
await browser.close();

console.log(`\n${pass} checks passed, ${fail} failed.`);
process.exit(fail ? 1 : 0);
