// RINGBACK: hold data.js against the Field's files at their commits, recount every figure the page prints from the
// Field's own codes, read the page's tones and clock while it runs, and shoot it at 1100 and 390 px.
// State 1 (session 264): the field, the nineteen lines and the 9-1-1 line beside the office.
// Run with a static server on this folder:  python3 -m http.server 8774 --bind 127.0.0.1   then   node check.mjs [url] [shot.png]
import { readFileSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const url = process.argv[2] || 'http://127.0.0.1:8774/';
const shot = process.argv[3] || null;
const window = {};
new Function('window', readFileSync(new URL('./data.js', import.meta.url), 'utf8'))(window);
const D = window.RINGBACK;
let pass = 0; const fails = [];
const ok = (c, what) => { if (c) pass++; else fails.push(what); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------------------------------------------------------------- the Field's files, byte for byte at their commits
async function pinned(key) {
  const s = D.sources[key];
  const b = Buffer.from(await (await fetch(s.url)).arrayBuffer());
  ok(createHash('sha256').update(b).digest('hex') === s.sha256, key + ' sha256');
  return JSON.parse(b.toString('utf8'));
}
const R = (await pinned('receivers94')).receivers;
const S = Object.fromEntries((await pinned('signals90')).signals.map((s) => [s.id, s]));
const ACTS = ['acknowledge', 'investigate', 'order', 'pass_on', 'tell_public', 'tell_public_aggregate'];

ok(R.length === D.lines.length && R.length === 19, 'nineteen receivers, as the Field has them');
for (const r of R) {
  const l = D.lines.find((x) => x.id === r.id);
  ok(!!l, r.id + ' present'); if (!l) continue;
  for (const k of ['receiver_name', 'receiver', 'receiver_party', 'instrument', 'instrument_short', 'binding', 'what', 'ref',
    'sender', 'trigger', 'sender_deadline_h', 'sender_deadline_max_h', 'sender_clock', 'note']) ok(same(l[k], r[k]), r.id + ' ' + k + ' as the Field coded it');
  for (const a of ACTS) for (const k of ['v', 'deadline_h', 'deadline_max_h', 'ref', 'quotes', 'note', 'doubt'])
    ok(same(l.acts[a][k], r.acts[a][k]), r.id + ' ' + a + '.' + k);
  for (const k of ['v', 'ref', 'quotes']) {
    ok(same(l.sender_failure[k], r.sender_failure[k]), r.id + ' sender_failure.' + k);
    ok(same(l.receiver_failure[k], r.receiver_failure[k]), r.id + ' receiver_failure.' + k);
  }
  ok(l.sender_passage === S[r.id].quote && l.sender_ref === S[r.id].ref, r.id + ' sender passage from study 90');
  // the tone follows the seat: a public body of California or New York rings in the United States, one of the EU in
  // Brussels, the receivers of China's framework in China; a receiver named by role (a developer, "governments") has none
  const pb = r.receiver === 'public body';
  const seat = pb && ['sb53', 'raise'].includes(r.instrument) ? 'US' : pb && ['eu-act', 'eu-code'].includes(r.instrument) ? 'BE' : r.instrument === 'china' ? 'CN' : 'XX';
  ok(l.tone === seat, r.id + ' rings in ' + seat + ', not ' + l.tone);
}

// ---------------------------------------------------------------- every figure, recounted from the Field's file
const pub = R.filter((r) => r.receiver === 'public body');
const must = (r, a) => r.acts[a].v === 'duty';
const fig = {
  lines: R.length,
  public_body: pub.length,
  must_answer: R.filter((r) => must(r, 'acknowledge')).length,
  must_answer_public: pub.filter((r) => must(r, 'acknowledge')).length,
  must_review_public: pub.filter((r) => must(r, 'investigate')).length,
  must_order_public: pub.filter((r) => must(r, 'order')).length,
  must_tell_public: R.filter((r) => must(r, 'tell_public')).length,
  yearly_total: R.filter((r) => must(r, 'tell_public_aggregate')).length,
  clocked_public: pub.filter((r) => ACTS.some((a) => ['duty', 'power'].includes(r.acts[a].v) && typeof r.acts[a].deadline_h === 'number')).length,
  receiver_failure_public: pub.filter((r) => r.receiver_failure.v === 'named').length,
  no_task_public: pub.filter((r) => r.receiver_party === 'no').length,
  sender_fined: R.filter((r) => r.sender_failure.v === 'penalty').length,
};
ok(fig.must_answer === 1 && R.find((r) => must(r, 'acknowledge')).id === 'CA8', 'the one receiver that must answer is the developer\'s own channel');
ok(fig.must_answer_public === 0 && fig.clocked_public === 0, 'no public body must answer, none has an hour');
ok(same(pub.filter((r) => ACTS.every((a) => r.acts[a].v === 'none')).map((r) => r.id), D.counts.nothing_on_receipt_public), 'the bound body that owes nothing on receipt');
const fines = R.filter((r) => r.sender_failure.v === 'penalty');
ok(same(fines.map((r) => [r.instrument, r.sender_failure.max]).sort(), [['eu-act', 15000000], ['raise', 1000000], ['raise', 1000000], ['sb53', 1000000], ['sb53', 1000000]]), 'the fines the page names');
ok(fines.filter((r) => r.instrument === 'raise').every((r) => r.sender_failure.quotes.some((q) => q.includes('three million dollars per subsequent violation'))), 'New York: then three million');
ok(fines.find((r) => r.instrument === 'eu-act').sender_failure.quotes.some((q) => q.includes('3 %') && q.includes('whichever is higher')), 'EU: 3 % or EUR 15 m, whichever is higher');

// ---------------------------------------------------------------- the tones against the ITU lines the build read
for (const [k, t] of Object.entries(D.tones)) {
  if (t.line) ok(t.line.endsWith(`${t.on.toFixed(1)} on ${t.off.toFixed(1)} off`) && t.hz.every((h) => t.line.includes(String(h))), k + ' tone is its ITU line');
}
ok(same(D.tones.XX.hz, [425]) && D.tones.XX.on === 1 && D.tones.XX.off === 4 && same(D.itu_parsed.commonest, ['425', '1.0', '4.0']), 'the seatless tone is the commonest');
ok(D.tones.XX.on >= 0.67 && D.tones.XX.on <= 1.5 && D.tones.XX.off >= 3 && D.tones.XX.off <= 5, 'the seatless tone lies inside E.180');
ok(D.control.answer_s === 15 && D.control.standard.includes('Fifteen (15) seconds'), '9-1-1 picked up at the standard\'s fifteenth second');

// ---------------------------------------------------------------- the page, run
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
async function run(w, h, sound) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(600);
  await p.click(sound ? '#go' : '#goQuiet');
  return { p, errs };
}
const wide = await run(1100, 820, true), narrow = await run(390, 844, false);
await wide.p.waitForTimeout(49000);   // the opening: 9-1-1 and the office at once, then a line every 1.6 s from the 19th second

const P = wide.p;
ok((await P.evaluate(() => window.__ringback.path())) === 'webgl2', 'the wave runs on the graphics card');
const L = await P.evaluate(() => window.__ringback.lines());
const c911 = L.find((l) => l.id === '911');
ok(c911.st === 'answered' && Math.abs(c911.answeredAt - c911.t0 - 15) < 0.02, '9-1-1 picked up at 15 s (' + (c911.answeredAt - c911.t0).toFixed(3) + ')');
ok(L.filter((l) => l.id !== '911').every((l) => l.st === 'ringing') && L.length === 20, 'every other line rings');
for (const l of L) {
  const t = D.tones[l.tone];
  ok(same(l.hz, t.hz) && l.on === t.on && l.off === t.off, l.id + ' cadence');
  if (l.id !== '911') ok(same(l.oscHz, t.hz), l.id + ' sounds at ' + t.hz.join('+') + ' Hz (' + l.oscHz + ')');
  if (l.st === 'ringing') {
    const on = await P.evaluate(([id, a, b, c]) => [window.__ringback.ringingAt(id, a), window.__ringback.ringingAt(id, b), window.__ringback.ringingAt(id, c)],
      [l.id, l.t0 + 0.1, l.t0 + t.on + 0.1, l.t0 + t.on + t.off + 0.1]);
    ok(same(on, [true, false, true]), l.id + ' rings on, off, on in its cadence');
  }
}
const pageFigs = await P.evaluate(() => Object.fromEntries([...document.querySelectorAll('#figs b[data-fig]')].map((e) => [e.dataset.fig, +e.textContent])));
for (const [k, v] of Object.entries(fig)) ok(pageFigs[k] === v, 'figure ' + k + ': page ' + pageFigs[k] + ', Field ' + v);
ok(Object.keys(pageFigs).length === Object.keys(fig).length, 'no figure left unrecounted');
const table = await P.evaluate(() => [...document.querySelectorAll('#table tr[data-id]')].map((tr) => [tr.dataset.id, [...tr.querySelectorAll('td[data-act]')].map((td) => [td.dataset.act, td.textContent])]));
ok(table.length === 20, 'the table holds 19 lines and 9-1-1');
const word = { duty: 'must', power: 'may', recommended: 'asked', none: '' };
for (const [id, cells] of table) {
  const r = R.find((x) => x.id === id); if (!r) continue;
  ok(same(cells, ACTS.map((a) => [a, word[r.acts[a].v]])), id + ' table row as coded');
}
const spans = await P.evaluate(() => Object.fromEntries([...document.querySelectorAll('main [data-k]')].map((e) => [e.dataset.k, e.textContent])));
ok(spans.lines === '19', 'main: 19 lines');
for (const k of ['US', 'BE', 'CN', 'XX']) ok(+spans['tone-' + k] === D.lines.filter((l) => l.tone === k).length, 'main: tone ' + k);
const status = await P.evaluate(() => Object.fromEntries([...document.querySelectorAll('#status [data-k]')].map((e) => [e.dataset.k, e.textContent])));
ok(status.ringing === '19' && status.lines === '19' && status.answered === '0:15', 'status: 19 of 19 ringing, 9-1-1 at 0:15 (' + JSON.stringify(status) + ')');

// the panels: the one that must answer, one that has no task, and the office beside 9-1-1
for (const id of ['CA8', 'COP3', 'CA4']) {
  await P.evaluate((x) => window.__ringback.select(x), id); await P.waitForTimeout(250);
  const r = R.find((x) => x.id === id);
  const pan = await P.evaluate(() => ({ acts: [...document.querySelectorAll('#panelBody tr[data-act]')].map((tr) => [tr.dataset.act, tr.dataset.v]),
    notask: !!document.querySelector('#panelBody [data-k="no-task"]'), rf: document.querySelector('#panelBody [data-k="recv-fail"]').dataset.v,
    h3: document.querySelector('#panelBody h3').textContent }));
  ok(same(pan.acts, ACTS.map((a) => [a, r.acts[a].v])) && pan.rf === r.receiver_failure.v && pan.h3 === r.receiver_name, id + ' panel as coded');
  ok(pan.notask === (r.receiver_party === 'no'), id + ' panel says whether the receiver has a task');
}
if (shot) {
  await P.evaluate(() => { document.querySelector('#close').click(); }); await P.waitForTimeout(400);
  await P.screenshot({ path: shot }); console.log('shot', shot);
}

// the narrow page: no sideways scroll, the field there, a panel that fits
const N = narrow.p;
ok(await N.evaluate(() => document.documentElement.scrollWidth <= 390), '390 px: no sideways scroll');
ok((await N.evaluate(() => window.__ringback.lines())).filter((l) => l.st === 'ringing').length === 19, '390 px: all nineteen ring');
await N.evaluate(() => window.__ringback.select('CA4')); await N.waitForTimeout(300);
const box = await N.evaluate(() => { const r = document.querySelector('#panel').getBoundingClientRect(); return [r.left, r.right]; });
ok(box[0] >= 0 && box[1] <= 390, '390 px: the panel fits');

ok(wide.errs.length === 0 && narrow.errs.length === 0, 'no page errors: ' + [...wide.errs, ...narrow.errs].slice(0, 3).join(' | '));
await b.close();
console.log(`${pass} checks pass` + (fails.length ? `, ${fails.length} fail:\n  ` + fails.join('\n  ') : ''));
process.exit(fails.length ? 1 : 0);
