// Until Another Hand, states 1 and 2: read every figure of the page as a visitor's browser shows it, at two widths, and
// compare it with the data the builds wrote. The expected values are computed here from data/window.json and
// data/clocks.json, independently of the page's own script.
// Usage: node check_page.mjs <url of index.html>     (needs Playwright with a browser)
import fs from 'node:fs';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const W = JSON.parse(fs.readFileSync(new URL('./data/window.json', import.meta.url)));
const C = JSON.parse(fs.readFileSync(new URL('./data/clocks.json', import.meta.url)));
const S = JSON.parse(fs.readFileSync(new URL('./sources.json', import.meta.url)));
const PG = JSON.parse(fs.readFileSync(new URL('./data/programme.json', import.meta.url)));
const DRAWN = ['mended inside the window', 'mended after the window closed', 'unmended, window open at head', 'unmended, window closed'];
const D = W.deeds.filter(r => DRAWN.includes(r.state));
const mended = D.filter(r => r.repair_hours != null);
const inside = mended.filter(r => r.state === 'mended inside the window');
const closed = D.filter(r => r.closed_hours != null);
const med = a => { const s = [...a].sort((x, y) => x - y), n = s.length; return n % 2 ? s[(n - 1) / 2] : (s[n / 2 - 1] + s[n / 2]) / 2; };
const one = x => (Math.round(x * 10) / 10).toFixed(1);
const E = {
  drawn: D.length, mended: mended.length, inside: inside.length, closed: closed.length,
  closedMed: one(med(closed.map(r => r.closed_hours))), mendDays: one(med(mended.map(r => r.repair_hours)) / 24),
  known: mended.filter(r => r.log_hours[1] > r.repair_hours).length,
  beforeLog: closed.filter(r => r.closed_hours < r.log_hours[0]).length,
  within24: closed.filter(r => r.closed_hours <= 24).length,
  mendBeforeLog: mended.filter(r => r.repair_hours < r.log_hours[0]).length,
  commits: W.results.house_commits.toLocaleString('en'), reverts: W.results.house_reverts,
};
// section IV, recomputed from the cases rather than read from the build's summary
const PK = PG.cases;
const firstCopy = c => c.copies.length ? Math.min(...c.copies.map(k => k.first_t)) : null;
const PE = {
  n: PK.length,
  inTime: PK.filter(c => firstCopy(c) === null || c.correction_t <= firstCopy(c)).length,
  winMed: one(med(PK.filter(c => firstCopy(c) !== null && firstCopy(c) < c.correction_t).map(c => (firstCopy(c) - c.first_t) / 3600))),
  corrMed: one(med(PK.map(c => (c.correction_t - c.first_t) / 3600))),
  pages: new Set(PK.flatMap(c => c.today.filter(x => !x.marked && x.reading === 'asserts').map(x => x.repo + ':' + x.path))).size,
  served: new Set(PK.flatMap(c => c.served.filter(x => x.reading === 'asserts').map(x => x.path))).size,
  lag: new Set(PK.flatMap(c => c.served.filter(x => x.reading === 'lags').map(x => x.path))).size,
  inState: PK.filter(c => c.correction_unit === 'middle:state:0').length,
  own: PK.reduce((a, c) => a + c.today.filter(x => x.repo === 'ulysses' && x.marked && /cycle-013/.test(x.path)).length, 0),
  excluded: PG.excluded.length,
};
PE.late = PE.n - PE.inTime;
let fails = 0, checks = 0;
const ok = (c, m) => { checks++; if (!c) { fails++; console.log('FAIL ' + m); } };

const url = process.argv[2];
const b = await chromium.launch();
for (const width of [1100, 390]) {
  const p = await b.newPage({ viewport: { width, height: 900 } });
  const errs = [];
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto(url);
  await p.waitForTimeout(500);
  ok(errs.length === 0, `${width}: no script error (${errs})`);
  const plain = await p.textContent('#plain');
  ok(plain.includes(`a median of ${E.closedMed} hours after the deed`), `${width}: plain words carry the window's median ${E.closedMed}`);
  ok(plain.includes(`a median of ${E.mendDays} days after it`), `${width}: plain words carry the mending's median ${E.mendDays} days`);
  ok(plain.includes(`only ${E.inside} of ${E.mended} mendings`), `${width}: plain words carry ${E.inside} of ${E.mended}`);
  ok(plain.includes(`in ${E.commits} commits`), `${width}: plain words carry ${E.commits} commits`);
  ok(plain.includes(`or later, for ${E.known} of ${E.mended}`), `${width}: plain words carry ${E.known} of ${E.mended} known at the answer`);
  const steps = await p.$$eval('#steps .n', ns => ns.map(n => n.textContent));
  ok(JSON.stringify(steps) === JSON.stringify([`${E.inside} of ${E.mended}`, `${E.closedMed} h`, `${E.known} of ${E.mended}`, String(E.reverts)]), `${width}: the four figures ${steps}`);
  // the figure: what is drawn, counted from the SVG itself
  ok(await p.$$eval('#lanes rect.win', r => r.length) === E.drawn, `${width}: ${E.drawn} lanes drawn`);
  ok(await p.$$eval('#lanes circle.mend', r => r.length) === E.mended, `${width}: ${E.mended} mendings drawn`);
  ok(await p.$$eval('#lanes circle.mend:not(.late)', r => r.length) === E.inside, `${width}: ${E.inside} drawn inside the window`);
  // each lane's bar ends where its window closes: re-derive the x of the close and compare with the bar
  const geo = await p.$$eval('#lanes g.lane', gs => gs.map(g => { const w = g.querySelector('rect.win'), m = g.querySelector('circle.mend');
    return { x: +w.getAttribute('x'), w: +w.getAttribute('width'), m: m ? +m.getAttribute('cx') : null }; }));
  const u = h => (h < 0 ? -1 : 1) * Math.log10(1 + Math.abs(h));
  const X = h => 16 + (u(h) - 0) / (u(3000) - 0) * (1000 - 32);
  const order = [...D].sort((a, c) => ((a.closed_hours ?? 1e9) - (c.closed_hours ?? 1e9)) || ((a.repair_hours || 0) - (c.repair_hours || 0)));
  let bad = 0;
  order.forEach((r, i) => {
    const end = r.closed_hours == null ? 1000 - 16 : X(r.closed_hours);
    if (Math.abs(geo[i].x + geo[i].w - Math.max(end, X(0) + 1.2)) > 0.6) bad++;
    if (r.repair_hours != null && Math.abs(geo[i].m - X(r.repair_hours)) > 0.6) bad++;
  });
  ok(bad === 0, `${width}: every bar ends at its window's close and every dot sits at its mending (${bad} off)`);
  let say = await p.textContent('#say');
  ok(say.includes(`a median of ${E.closedMed} hours after it, within a day for ${E.within24} of ${E.closed}`), `${width}: readout, from the deed`);
  ok(say.includes(`${E.inside} of ${E.mended} mendings came while one revert`), `${width}: readout, in time`);
  for (const [h, label] of [[24, '24 hours'], [72, '72 hours'], [360, '15 days']]) {
    await p.click(`[data-law="${h}"]`);
    say = await p.textContent('#say');
    const m = mended.filter(r => r.repair_hours <= h).length, c = closed.filter(r => r.closed_hours <= h).length;
    ok(say.includes(`A clock of ${label} from the deed would find ${m} of ${E.mended} mendings in time; by its end ${c} of ${E.closed} windows had closed.`), `${width}: readout, ${label} from the deed (${m}, ${c})`);
  }
  await p.click('[data-zero="log"]');
  await p.waitForTimeout(900);
  for (const [h, label] of [[24, '24 hours'], [72, '72 hours'], [360, '15 days']]) {
    await p.click(`[data-law="${h}"]`);
    say = await p.textContent('#say');
    const m = mended.filter(r => r.repair_hours - r.log_hours[0] <= h).length;
    ok(say.includes(`${E.beforeLog} of ${E.closed} windows had closed before the clock began, and ${E.known} of ${E.mended} mendings came by the end of that day, ${E.mendBeforeLog} of them before it.`), `${width}: readout, from the log's day`);
    ok(say.includes(`A clock of ${label} from that day would find ${m} of ${E.mended} mendings in time.`), `${width}: readout, ${label} from the log's day (${m})`);
  }
  const joined = await p.textContent('#joined');
  ok(joined.includes(`In the ${E.commits} commits`) && joined.includes(`that sentence stands ${E.reverts} times`), `${width}: section II, the reverts`);
  ok(await p.$$eval('#joined ul.ins li', l => l.length) === E.inside, `${width}: section II lists the ${E.inside}`);
  const law = await p.textContent('#lawtext');
  const aw = C.clocks.filter(c => c.clock === 'awareness').length, none = C.clocks.filter(c => c.clock === 'none').length;
  ok(law.includes(`${C.clocks.length} of them are set off by an event`) && law.includes(`${aw} count from the reporter`) && law.includes(`${none} give no point`), `${width}: section III, ${aw} and ${none}`);
  ok(law.includes(`for ${E.known} of ${E.mended} deeds`) && law.includes(`for ${E.beforeLog} of ${E.closed} deeds before`), `${width}: section III, the house's record`);
  ok(await p.$$eval('#clk tr', r => r.length) === C.clocks.length + 1, `${width}: the table has ${C.clocks.length} clocks`);
  const marks = await p.$$eval('#clk mark', m => m.map(x => x.textContent));
  ok(marks.length === C.clocks.filter(c => c.words).length, `${width}: every clock's words marked in its passage (${marks.length})`);
  const qs = await p.$$eval('q[id^="q-"]', q => q.map(x => [x.id, x.textContent]));
  const P = {}; S.forEach(s => s.passages.forEach((x, i) => { P[s.id + (i + 1)] = x.text; }));
  const nP = S.reduce((a, x) => a + x.passages.length, 0);
  ok(qs.length === nP && qs.every(([id, t]) => P[id.slice(2)] === t), `${width}: the ${nP} quotations are the checked passages`);
  // section IV: the programme's own answers
  const psay = await p.textContent('#psay');
  ok(psay.includes(`Of the ${PE.n} corrections, ${PE.inTime} came while the wrong wording stood in one work only. For ${PE.late} another work`), `${width}: IV readout, ${PE.inTime} in time of ${PE.n}`);
  ok(psay.includes(`a median of ${PE.winMed} hours after it was written; the corrections came a median of ${PE.corrMed} hours after`), `${width}: IV readout, medians ${PE.winMed} and ${PE.corrMed}`);
  ok(psay.includes(`The ${PE.inState} the programme made in its state`) && psay.includes(`${PE.pages} pages a visitor meets still assert them, and the site serves ${PE.served} of them, besides ${PE.lag} copies`), `${width}: IV readout, ${PE.pages} pages, ${PE.served} served, ${PE.lag} lagging`);
  const p2 = await p.textContent('#p2');
  ok(p2.includes(`Of ${PE.n} corrections`) && p2.includes(`${PE.late} came after another work`) && p2.includes(`${PE.pages} pages a visitor meets still state them, and the site serves ${PE.served}`) && p2.includes(`its own ${PE.own} pages`), `${width}: plain words, state 2`);
  ok(await p.$$eval('#plan g.plane', g => g.length) === PE.n, `${width}: ${PE.n} lanes in IV`);
  const bigs = await p.$$eval('#plan text.big', t => t.map(x => +x.textContent));
  ok(JSON.stringify(bigs) === JSON.stringify(PK.map(c => c.today.filter(x => !x.marked && x.reading === 'asserts').length)), `${width}: IV, pages asserting per lane ${bigs}`);
  ok(await p.$$eval('#plan line.corr:not(.own)', l => l.length) === PE.n && await p.$$eval('#plan line.corr.own', l => l.length) === 1, `${width}: IV, one correction per lane and this practice's own`);
  ok(await p.$$eval('#plan rect.copy', r => r.length) === PK.reduce((a, c) => a + c.copies.length, 0), `${width}: IV, every copy drawn`);
  ok((await p.textContent('#pin')).includes(`the ${PE.excluded} that could not`) && (await p.textContent('#method')).includes(`${PE.excluded} corrections could not be followed`), `${width}: IV, ${PE.excluded} excluded named`);
  for (let i = 0; i < PK.length; i++) {
    await p.click(`#plan g.plane:nth-of-type(${i + 1}) rect.hit`, { force: true });
    const det = await p.textContent('#pdet');
    const c = PK[i];
    const un = c.today.filter(x => !x.marked);
    ok(det.includes(`${c.copies_before} took it over before the correction`) && det.includes(`${c.asserting_today} pages assert it today`) &&
       (await p.$$eval('#pdet li', l => l.length)) === un.length, `${width}: IV, lane ${c.id} opens with its copies and its ${un.length} unreached pages`);
  }
  if (width === 390) {
    const sw = await p.evaluate(() => document.documentElement.scrollWidth);
    ok(sw <= 392, `390: the page itself does not scroll sideways (${sw})`);
  }
  await p.close();
}
await b.close();
console.log(`${checks - fails} of ${checks} checks hold`);
process.exit(fails ? 1 : 0);
