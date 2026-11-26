// Study 95 -- read every figure of the second state from the rendered page at two widths and recount it from
// cases95.json, receivers94.json, check95.json, search95.json and sources95.json, independently of build95.py;
// also compare with results95.json. Study 94's own figures stay with verify94.mjs.
// Usage: node verify95.mjs [--shot]   (needs playwright; reads index.html from this folder; --shot writes process/2.png)
import { readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const here = dirname(fileURLToPath(import.meta.url));
const J = f => JSON.parse(readFileSync(join(here, f), 'utf8'));
const C = J('cases95.json'), R94 = J('receivers94.json').receivers, Q = J('check95.json'), RES = J('results95.json');
const SEARCH = J('search95.json'), SRC = J('sources95.json').sources;
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const day = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10)) / 864e5;
const fmt = s => (+s.slice(8, 10)) + ' ' + MON[+s.slice(5, 7) - 1];
const pct = (k, n) => String(Math.round(k / n * 1000) / 10);

const cases = Object.fromEntries(C.cases.map(c => [c.id, c]));
const doors = C.doors;
const acts = doors.flatMap(d => d.acts.map(a => ({ ...a, door: d.id, kind: d.kind, case: d.case })));
const DUTY = new Set(['receiver duty', 'sender duty']), LAW = new Set(['power', 'other law']);
const FORCE = new Set(['investigate', 'order', 'proceed']);
const isPB = d => d.kind === 'public body', isLeg = d => d.kind === 'legislature';
// a public body is named when study 94 lists it as the receiver of an event signal and codes that receiver a public body
const r94 = Object.fromEntries(R94.map(r => [r.id, r]));
const named = doors.filter(d => isPB(d) && d.named_in_94.some(k => r94[k] && r94[k].receiver === 'public body'));
const firstAct = d => d.acts.map(a => a.date).filter(Boolean).sort()[0] || null;
const after = d => { const f = firstAct(d); return f === null ? null : day(f) - day(cases[d.case].first_public); };
const pbAfter = doors.filter(isPB).map(d => [d, after(d)]);
const escapeAfter = pbAfter.filter(([d, a]) => d.case === 'escape' && a !== null).map(([, a]) => a).sort((x, y) => x - y);
const legAfter = doors.filter(isLeg).map(after).filter(a => a !== null).sort((x, y) => x - y);
const duties = acts.filter(a => DUTY.has(a.owed));
const undoubted = duties.filter(a => !a.doubt);
const letter = acts.filter(a => DUTY.has(a.owed) || a.owed === 'other law');
const noProceed = acts.filter(a => a.code !== 'proceed');
const bodyForce = acts.filter(a => (a.kind === 'public body' || a.kind === 'legislature') && FORCE.has(a.code));
const deadlines = Object.fromEntries(acts.filter(a => a.deadline_set).map(a => [a.door, day(a.deadline_set) - day(a.date)]));
const makerDoor = c => doors.find(d => d.kind === 'maker' && d.case === c);
const makerFirstWord = c => makerDoor(c).acts.filter(a => a.code === 'tell_public' && a.date).map(a => a.date).sort()[0];
const subpoenas = acts.filter(a => a.code === 'investigate' && (a.quote.toLowerCase().includes('subpoena') || a.src === 'al_sub'));
// a binding order by a public body: an order coded without the doubt that it is only a demand; sanctions and findings
// have no class of their own and none was coded
const binding = acts.filter(a => (a.kind === 'public body' || a.kind === 'legislature') && a.code === 'order' && !a.doubt);
const consequences = binding.length + doors.filter(d => d.consequence !== 'none').length;
const p161 = letter.length / acts.length <= 0.25 ? 'held' : 'failed';
const p162 = pbAfter.concat(doors.filter(isLeg).map(d => [d, after(d)])).every(([, a]) => a === null || a > 0) ? 'held' : 'failed';
const p163 = consequences === 0 ? 'held' : 'failed';
const wikiPB = pbAfter.filter(([d, a]) => d.case === 'wiki' && a !== null).map(([, a]) => a).sort((x, y) => x - y);

const E = {
  'doors': doors.length, 'doors_with_acts': doors.filter(d => d.acts.length).length, 'acts': acts.length,
  'owed.duty': duties.length, 'owed.law': acts.filter(a => LAW.has(a.owed)).length,
  'owed.choice': acts.filter(a => a.owed === 'choice').length,
  'owed.power': acts.filter(a => a.owed === 'power').length, 'owed.other_law': acts.filter(a => a.owed === 'other law').length,
  'force.all': acts.filter(a => FORCE.has(a.code)).length,
  'force.bodies': bodyForce.length, 'force.under_ai': bodyForce.filter(a => a.owed === 'power' || a.owed === 'receiver duty').length,
  'P161.letter': letter.length, 'P161.letter.pct': pct(letter.length, acts.length), 'P161.duty.pct': pct(duties.length, acts.length),
  'P161.letter_without_proceed': noProceed.filter(a => DUTY.has(a.owed) || a.owed === 'other law').length,
  'P161.duty_with_doubt': duties.filter(a => a.doubt).length,
  'P161.undoubted_date': undoubted.length === 1 ? fmt(undoubted[0].date) : 'more than one',
  'P161.out': p161,
  'P162.wiki': wikiPB[0], 'P162.escape': escapeAfter[0], 'P162.escape_second': escapeAfter[1],
  'P162.escape_last': escapeAfter[escapeAfter.length - 1], 'P162.leg': legAfter[0],
  'P162.no_act': pbAfter.filter(([, a]) => a === null).length, 'P162.out': p162,
  'P163.subpoenas': subpoenas.length, 'P163.proceedings': acts.filter(a => a.code === 'proceed').length,
  'P163.consequences': consequences, 'P163.out': p163,
  'deadlines': Object.keys(deadlines).length,
  'deadline.E-HOUSE': deadlines['E-HOUSE'], 'deadline.E-SEN': deadlines['E-SEN'], 'deadline.E-AL': deadlines['E-AL'],
  'reasons': acts.filter(a => a.code === 'reason_not').length,
  'pb': doors.filter(isPB).length, 'pb.named': named.length, 'leg': doors.filter(isLeg).length,
  'maker.escape.days': day(makerFirstWord('escape')) - day(makerDoor('escape').received.date),
  'maker.escape.after': day(makerFirstWord('escape')) - day(cases.escape.first_public),
  'maker.wiki.days': day(makerFirstWord('wiki')) - day(makerDoor('wiki').received.date),
  'predictions_held': [p161, p162, p163].filter(x => x === 'held').length,
  'queries': SEARCH.queries.length, 'sources': Object.keys(SRC).length, 'searched': C.searched_not_doors.length,
  'quotes.found': Q.items.filter(i => i.found).length, 'quotes.n': Q.items.length,
  'quotes.extraction': Q.items.filter(i => i.via === 'extraction service').length,
};

let pass = 0, fail = 0;
const ok = (c, m) => { if (c) pass++; else { fail++; console.log('FAIL', m); } };
// build and recount must agree
const fromRes = {
  'doors': RES.doors, 'doors_with_acts': RES.doors_with_acts, 'acts': RES.acts, 'owed.choice': RES.by_owed.choice, 'owed.power': RES.by_owed.power,
  'owed.other_law': RES.by_owed['other law'], 'P161.letter': RES.P161.letter.owed, 'P161.duty_with_doubt': RES.P161.duty_with_doubt,
  'P161.letter_without_proceed': RES.P161.letter_without_proceed.owed, 'owed.duty': RES.P161.duty_only.owed,
  'P161.out': RES.P161.out, 'P162.wiki': RES.P162.earliest_after.wiki, 'P162.escape': RES.P162.earliest_after.escape,
  'P162.no_act': RES.P162.no_act.length, 'P162.out': RES.P162.out, 'P163.subpoenas': RES.P163.subpoenas.length,
  'P163.proceedings': RES.P163.proceedings.length, 'P163.consequences': RES.P163.consequences, 'P163.out': RES.P163.out,
  'deadlines': RES.deadlines_set.length, 'reasons': RES.reasons_not.length, 'pb': RES.public_bodies,
  'pb.named': RES.named_public_bodies.length, 'leg': RES.doors_by_kind.legislature,
  'force.bodies': RES.named_force + RES.unnamed_force + RES.legislature_force, 'force.under_ai': RES.named_force_under_ai,
  'maker.escape.days': RES.maker.escape.days_from_receipt, 'maker.escape.after': RES.maker.escape.days_after_first_public,
  'maker.wiki.days': RES.maker.wiki.days_from_receipt, 'predictions_held': RES.predictions_held,
  'quotes.found': RES.quotes.found, 'quotes.n': RES.quotes.n, 'quotes.extraction': RES.quotes.extraction,
  'searched': RES.searched_not_doors,
};
for (const k in fromRes) ok(String(fromRes[k]) === String(E[k]), `results95.json ${k}: ${fromRes[k]} vs recount ${E[k]}`);
ok(JSON.stringify(named.map(d => d.id).sort()) === JSON.stringify([...RES.named_public_bodies].sort()), 'named public bodies agree with build95.py');
ok(Q.items.every(i => i.found) && Q.over_40_words === 0, 'every passage found, none over 40 words');
// the codebook's per-door fields: every door coded, each lag recounted from the dates
for (const d of doors) {
  ok(typeof d.consequence === 'string', `${d.id}: consequence coded`);
  const f = firstAct(d);
  ok(d.lag_days === (f && d.received.date ? day(f) - day(d.received.date) : null), `${d.id}: lag_days ${d.lag_days}`);
}

const multiset = d => d.acts.map(a => a.code + '|' + a.owed).sort();
const browser = await chromium.launch();
for (const width of [1100, 390]) {
  const page = await browser.newPage({ viewport: { width, height: 900 }, deviceScaleFactor: 1 });
  const errs = []; page.on('pageerror', e => errs.push(String(e))); page.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await page.goto('file://' + join(here, 'index.html'));
  await page.waitForTimeout(300);
  const seen = await page.$$eval('[data-k95]', els => els.map(e => [e.dataset.k95, e.textContent.trim()]));
  const keys = new Set();
  for (const [k, v] of seen) { keys.add(k); ok(k in E, `${width}px: unknown key ${k}`); if (k in E) ok(String(E[k]) === v, `${width}px: ${k} shows ${v}, recount ${E[k]}`); }
  for (const k in E) ok(keys.has(k), `${width}px: key ${k} not on the page`);
  // the figure: one row per door, one mark per act, drawn by what owed it
  const rows = await page.$$eval('#deeds g.drow', gs => gs.map(g => [g.dataset.id, [...g.querySelectorAll('.mk')].map(m => m.dataset.code + '|' + m.dataset.owed).sort(), g.querySelectorAll('[data-recv]').length]));
  ok(rows.length === doors.length, `${width}px: ${rows.length} rows drawn`);
  ok(rows.reduce((n, r) => n + r[1].length, 0) === acts.length, `${width}px: marks drawn equal the acts`);
  for (const [id, ms, rv] of rows) {
    const d = doors.find(x => x.id === id);
    ok(d && JSON.stringify(ms) === JSON.stringify(multiset(d)), `${width}px: marks of ${id}`);
    ok(d && rv === (d.received.date ? 1 : 0), `${width}px: receipt mark of ${id}`);
  }
  const cls = await page.$$eval('#deeds .mk', ms => ms.map(m => [m.dataset.owed, m.getAttribute('class')]));
  const want = { 'receiver duty': 'duty', 'sender duty': 'duty', 'power': 'law', 'other law': 'law', 'choice': 'choice' };
  ok(cls.every(([o, c]) => c === 'mk ' + want[o]), `${width}px: each mark drawn by what owed it`);
  // filters
  for (const [g, n] of [['duty', E['owed.duty']], ['law', E['owed.law']], ['force', E['force.all']], ['all', E.acts]]) {
    await page.click(`#ctl95 button[data-g="${g}"]`);
    const lit = await page.$$eval('#deeds .mk', ms => ms.filter(m => !m.classList.contains('dim')).length);
    ok(lit === n, `${width}px: filter ${g} shows ${lit}, expected ${n}`);
  }
  // a row opens its passages
  await page.click('#deeds g.drow[data-id="E-CAAG"]');
  const det = await page.textContent('#detail95');
  ok(det.includes('creates a public nuisance by posing a danger to the public'), `${width}px: E-CAAG detail shows its passage`);
  const srcRows = await page.$$eval('#sources95 tbody tr', t => t.length);
  ok(srcRows === Object.keys(SRC).length, `${width}px: ${srcRows} sources listed`);
  ok(!errs.length, `${width}px: page errors ${errs.join(' | ')}`);
  const sw = await page.evaluate(() => document.documentElement.scrollWidth);
  ok(sw <= width, `${width}px: page scrolls sideways (${sw})`);
  if (process.argv.includes('--shot') && width === 1100) {
    await page.click('#deeds g.drow[data-id="E-OES"]');
    await page.screenshot({ path: join(here, 'process', '2.png'), fullPage: true });
  }
  await page.close();
}
await browser.close();
console.log(`verify95: ${pass} checks passed, ${fail} failed`);
process.exit(fail ? 1 : 0);
