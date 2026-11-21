// State 5 (2026-11-21, after the presentation): open the page as a visitor does, read every figure of the reading
// from both ends from it against data/both.json, recounting them from the pairs rather than trusting the build's
// totals; press "the deed's end" and count what the figure draws; open a deed with many hands and one the mending
// reaches first; check that the sentences this state corrected stand marked. Run from this folder:
//   node check_page5.mjs [wide.png] [narrow.png]
import { createRequire } from 'module';
import http from 'http'; import fs from 'fs'; import path from 'path';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');
const here = path.dirname(new URL(import.meta.url).pathname);
const J = f => JSON.parse(fs.readFileSync(path.join(here, f), 'utf8'));
const B = J('data/both.json'), S = J('data/sort.json');
const type = f => f.endsWith('.html') ? 'text/html' : f.endsWith('.js') || f.endsWith('.mjs') ? 'text/javascript' : f.endsWith('.json') ? 'application/json' : 'application/octet-stream';
const srv = http.createServer((q, r) => { const f = path.join(here, decodeURIComponent(q.url.split('?')[0]).replace(/^\/$/, '/index.html'));
  fs.readFile(f, (e, b) => { if (e) { r.writeHead(404); r.end(); return } r.writeHead(200, { 'content-type': type(f) }); r.end(b) }) });
await new Promise(ok => srv.listen(0, ok));
const url = `http://127.0.0.1:${srv.address().port}/`;
let fail = 0, n = 0; const ok = (c, m) => { n++; if (!c) { fail++; console.log('FAIL', m) } else console.log('ok', m) };
const num = s => +String(s).replace(/[^0-9.]/g, '');
const med = a => { const s = [...a].sort((x, y) => x - y), k = s.length; return k % 2 ? s[(k - 1) / 2] : (s[k / 2 - 1] + s[k / 2]) / 2 };

// recounted here from the pairs
const P = B.pairs, L = P.filter(r => r.join === 'lines'), hands = L.flatMap(r => r.hands);
const self = S.act.join.same + S.act.join.name;
const E = {
  pairs: P.length, lines: L.length, first: L.filter(r => !r.hands.length).length,
  hands_total: hands.length, hands_median_any: med(L.map(r => r.hands.length).filter(k => k)),
  first_hand_hours_median: med(L.filter(r => r.hands.length).map(r => r.hands[0].hours)),
  sig_arch: hands.filter(h => h.signer === "the architect's name").length, sig_bot: hands.filter(h => h.signer === 'a workflow or bot').length,
  hands_mending_another: hands.filter(h => h.mends_another).length,
  back_writers_median: med(L.map(r => r.back.writers)), back_deed_most: L.filter(r => r.back.deed_rank === 1).length,
  back_one_writer: L.filter(r => r.back.writers === 1).length, self
};
E.later = E.lines - E.first; E.lead_all = E.first + self;
E.field_agree_first = B.results.field_agree_first;   // asserted by build5.py against the Field's file
for (const k of Object.keys(E)) ok(E[k] === B.results[k], `recounted ${k}: ${E[k]}`);
ok(P.every(r => r.hands.every((h, i) => i === 0 || h.day >= r.hands[i - 1].day)), 'every lane\'s hands in order of their day');
const deeds = S.act.deeds, key = d => d.row + '|' + d.n;
ok(P.every(r => deeds.some(d => key(d) === r.row + '|' + r.n && d.repair && r.hands.every(h => h.day <= d.repair_day && h.day >= d.deed_day))),
  'every hand falls between its deed and its mending');

const b = await chromium.launch();
for (const [w, scheme, shot] of [[1100, 'light', process.argv[2]], [390, 'dark', process.argv[3]]]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const errs = []; p.on('pageerror', e => errs.push(String(e))); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()) });
  await p.goto(url);
  await p.waitForSelector('#sortf[data-done="1"]', { timeout: 30000 });
  ok(errs.length === 0, `${w}px no errors ${errs.join(' | ')}`);
  ok(await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth + 1), `${w}px no sideways scroll of the page`);
  ok(await p.textContent('.progress') === 'presented 21 November · fifth state', `${w}px the work says it is in its fifth state`);
  const bo = await p.$$eval('[data-bo]', es => es.map(e => [e.getAttribute('data-bo'), e.textContent]));
  const bad = bo.filter(([k, t]) => num(t) !== E[k]);
  ok(bo.length === 22 && bad.length === 0, `${w}px ${bo.length} figures of the fifth state read from the page ${JSON.stringify(bad)}`);
  const main = await p.textContent('main');
  ok((main.match(/corrected 2026-11-21, after the presentation/gi) || []).length === 2 && (main.match(/Corrected 2026-11-21: this said that anyone/g) || []).length === 0,
    `${w}px the two sentences this state corrected stand marked`);
  ok(!/Anyone with Git who follows that file forward from the deed comes to the mending/.test(main.replace(/this sentence said that anyone who follows the file forward from the deed comes to the mending/, '')),
    `${w}px the corrected sentence stands only inside its mark`);
  ok(main.includes('Item Removed') && main.includes('Completely to describe an event is to locate it in all the right stories'), `${w}px the source's removal is said beside its quotation`);
  // the figure from the deed's end
  ok(!(await p.getAttribute('#sortf', 'class') || '').includes('fore'), `${w}px opens on the mending's end`);
  await p.click('#dirask button[data-d="fore"]');
  ok((await p.getAttribute('#sortf', 'class') || '').includes('fore'), `${w}px "the deed's end" turns the figure`);
  const leads = await p.$$eval('#sortf g.dd.leads', es => es.length), ticks = await p.$$eval('#sortf .fo .hand', es => es.length),
    firsts = await p.$$eval('#sortf .fo .hand.first', es => es.length), vis = await p.$$eval('#sortf .fo .hand', es => es.filter(e => getComputedStyle(e).display !== 'none').length);
  ok(leads === E.lead_all && ticks === E.hands_total && firsts === E.later,
    `${w}px ${leads} lanes lead to their mending, ${ticks} hands drawn, ${firsts} first hands`);
  ok(vis === ticks, `${w}px every hand is visible from the deed's end`);
  const say = await p.textContent('#ssay');
  ok(say.includes(`in ${E.lead_all} of the ${S.act.mended}`) && say.includes(`${E.hands_total} other commits`), `${w}px the figure says ${E.lead_all} of ${S.act.mended} and ${E.hands_total} hands`);
  // a deed with many hands, and one the mending reaches first
  const order = deeds.map((d, i) => i).sort((a, c) => (deeds[a].deed_day < deeds[c].deed_day ? -1 : deeds[a].deed_day > deeds[c].deed_day ? 1 : deeds[a].row - deeds[c].row || deeds[a].n - deeds[c].n));
  const many = P.reduce((a, r) => (r.join === 'lines' && r.hands.length > a.hands.length ? r : a), P[0]);
  const iMany = deeds.findIndex(d => key(d) === many.row + '|' + many.n);
  await p.$eval(`#sortf rect.hit[data-i="${iMany}"]`, e => e.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  let t = await p.textContent('#sdeed');
  ok(t.includes(`From the deed's end: ${many.hands.length} later commits`) && t.includes(many.hands[0].h.slice(0, 7)) && t.includes(`the deed wrote ${many.back.deed} of ${many.back.lines}`),
    `${w}px log row ${many.row} opens with its ${many.hands.length} hands, the first ${many.hands[0].h.slice(0, 7)}, and whose lines its mending took out`);
  const lead = L.find(r => !r.hands.length && r.back.writers === 1);
  const iLead = deeds.findIndex(d => key(d) === lead.row + '|' + lead.n);
  await p.$eval(`#sortf rect.hit[data-i="${iLead}"]`, e => e.dispatchEvent(new MouseEvent('click', { bubbles: true })));
  t = await p.textContent('#sdeed');
  ok(t.includes('the mending is the first later commit') && t.includes('written by 1 commit;'), `${w}px log row ${lead.row} opens as a pair Git joins from both ends`);
  ok(order.length === deeds.length, `${w}px ${order.length} lanes`);
  if (shot) { await p.evaluate(() => window.scrollTo(0, 0)); await p.screenshot({ path: shot, fullPage: true }); console.log('shot', shot) }
  // back to the mending's end: the lanes of state 4 return
  await p.click('#dirask button[data-d="back"]');
  const lit = await p.$$eval('#sortf g.dd', es => es.filter(e => !e.getAttribute('class').includes('dim')).length);
  ok(!(await p.getAttribute('#sortf', 'class') || '').includes('fore') && lit === S.act.n, `${w}px the mending's end returns with all ${lit} lanes`);
  await p.close();
}
await b.close(); srv.close();
console.log(`${n - fail} of ${n} checks passed`);
process.exit(fail ? 1 : 0);
