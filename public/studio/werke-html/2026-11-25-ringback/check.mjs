// RINGBACK: hold data.js against the Field's files at their commits, recount every figure the page prints from the
// Field's own codes, read the page's tones and clock while it runs, and shoot it at 1100 and 390 px.
// State 1 (session 264): the field, the nineteen lines and the 9-1-1 line beside the office.
// State 2 (session 265): what was overheard. overheard.js against the Field's study 95 at its commit, every figure of it
// recounted, every reading present and heard back, and the page read while the acts come in (its clock moved forward in
// a quiet run, and in real time with sound for the first act), the call kept up when the page is hidden.
// Run with a static server on this folder:  python3 -m http.server 8774 --bind 127.0.0.1   then   node check.mjs [url] [shot.png]
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const url = process.argv[2] || 'http://127.0.0.1:8774/';
const shot = process.argv[3] || null;
const window = {};
new Function('window', readFileSync(new URL('./data.js', import.meta.url), 'utf8'))(window);
new Function('window', readFileSync(new URL('./overheard.js', import.meta.url), 'utf8'))(window);
const D = window.RINGBACK, O = window.RINGBACK_OVERHEARD;
let pass = 0; const fails = [];
const ok = (c, what) => { if (c) pass++; else fails.push(what); };
const same = (a, b) => JSON.stringify(a) === JSON.stringify(b);

// ---------------------------------------------------------------- the Field's files, byte for byte at their commits
async function pinned(key) {
  const s = D.sources[key] || O.sources[key];
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

// ---------------------------------------------------------------- state 2: overheard.js against the Field's study 95
const C95 = await pinned('cases95'), S95 = (await pinned('sources95')).sources, K95 = (await pinned('check95')).items;
const CASES = Object.fromEntries(C95.cases.map((c) => [c.id, c]));
const days = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / 864e5);
const fieldActs = C95.doors.flatMap((d) => d.acts.map((a, i) => ({ d, a, i })));
ok(fieldActs.length === 47 && C95.doors.length === 18, '47 acts at 18 doors, as the Field has them');
const oActs = O.seq.filter((e) => e.kind === 'act');
ok(oActs.length === fieldActs.length, 'every act of the Field is overheard once');
for (const { d, a, i } of fieldActs) {
  const e = oActs.find((x) => x.door === d.id && x.i === i);
  ok(!!e, d.id + ' act ' + i + ' present'); if (!e) continue;
  ok(e.quote === a.quote && e.code === a.code && e.owed === a.owed && e.date === a.date && e.case === d.case, d.id + ' act ' + i + ' as coded, its passage word for word');
  ok(e.src_url === S95[a.src].url, d.id + ' act ' + i + ' source');
  ok(K95.some((k) => k.door === d.id && k.what === a.code + '#' + i && k.found), d.id + ' act ' + i + ' found by the Field in its source');
  ok(e.days === days(e.when, CASES[d.case].first_public), d.id + ' act ' + i + ' days from the first public account');
  ok(a.date ? e.when === a.date : e.bound === 'by', d.id + ' act ' + i + ' dated as the record dates it');
}
ok(O.seq.every((e, k) => k === 0 || O.seq[k - 1].when <= e.when), 'the acts come in the order of their dates');
ok(O.seq.filter((e) => e.public).map((e) => [e.door, e.when]).join() === 'E-HF,2026-07-16,W-RES,2026-09-04', 'the two first public accounts');
const silent = C95.doors.filter((d) => !d.acts.length);
ok(silent.length === 1 && silent[0].id === 'E-FBI' && O.seq.some((e) => e.kind === 'silence' && e.door === 'E-FBI' && e.when === silent[0].received.date), 'the one door told and silent: an open line on its day');
for (const d of C95.doors) {
  const o = O.doors.find((x) => x.id === d.id);
  ok(o && o.line === (d.named_in_94[0] || null) && (!o.line || D.lines.some((l) => l.id === o.line)), d.id + ' speaks from the first line study 94 names for it, or from beyond the rim');
}
const rimO = O.doors.filter((d) => !d.line).sort((a, b) => a.rim_order - b.rim_order);
const firstOf = (id) => { const ds = C95.doors.find((d) => d.id === id).acts.map((a) => a.date).filter(Boolean).sort(); return ds[0]; };
ok(rimO.every((d, k) => k === 0 || firstOf(rimO[k - 1].id) <= firstOf(d.id)) && rimO.length === 11, 'beyond the rim: eleven doors, in the order they first acted');
const fig2 = {
  acts: fieldActs.length,
  choice: fieldActs.filter((x) => x.a.owed === 'choice').length,
  duty: fieldActs.filter((x) => /duty/.test(x.a.owed)).length,
  power: fieldActs.filter((x) => x.a.owed === 'power').length,
  other_law: fieldActs.filter((x) => x.a.owed === 'other law').length,
  on_lines: C95.doors.filter((d) => d.named_in_94.length).length,
  rim: C95.doors.filter((d) => !d.named_in_94.length).length,
  pressure: fieldActs.filter((x) => ['public body', 'legislature'].includes(x.d.kind) && ['investigate', 'order', 'proceed'].includes(x.a.code)).length,
  answers: fieldActs.filter((x) => x.a.code === 'acknowledge').length,
  silent: silent.length,
  first_after: C95.doors.filter((d) => d.kind === 'public body' && d.acts.some((a) => a.date)).length,
};
ok(fig2.choice === 37 && fig2.duty === 4 && fig2.power === 2 && fig2.other_law === 4 && fig2.pressure === 12, 'the Field\'s own counts: 37 by nothing, 4 by a duty, 12 acts of pressure');
ok(C95.doors.filter((d) => d.kind === 'public body').every((d) => d.acts.filter((a) => a.date).every((a) => days(a.date, CASES[d.case].first_public) > 0)), 'every dated act of a public body came after the public knew');
ok(fieldActs.filter((x) => x.a.code === 'acknowledge').map((x) => x.d.id).join() === 'E-HF,E-OES', 'the two answers: the harmed company, and Cal OES');
ok(fieldActs.find((x) => x.d.id === 'E-OES' && x.a.code === 'acknowledge').a.quote.includes('report number'), 'Cal OES answered with a report number');
const HB = JSON.parse(readFileSync(new URL('./hear_back.json', import.meta.url), 'utf8'));
ok(HB.readings === 47 && HB.passed === 47, 'every reading heard back at 0.85 or better (' + HB.passed + ' of ' + HB.readings + ')');
for (const e of O.seq) if (e.kind === 'act') ok(!!e.clip && existsSync(new URL('./' + e.clip, import.meta.url)) && e.env && e.env.length > 10, 'reading ' + e.n + ' present with its loudness');

// ---------------------------------------------------------------- the page, run
const b = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
async function run(w, h, sound) {
  const p = await b.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', (e) => errs.push(e.message)); p.on('console', (m) => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url); await p.waitForTimeout(600);
  await p.click(sound ? '#go' : '#goQuiet');
  return { p, errs };
}
const wide = await run(1100, 820, true), narrow = await run(390, 844, false), quiet = await run(1100, 820, false);
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
// state 2, in real time with sound: every reading decoded, the first act heard on its second
const seq0 = await P.evaluate(() => window.__ringback.overheard());
ok(seq0.filter((e) => e.kind === 'act').every((e) => e.buf), 'every reading decoded in the page (' + seq0.filter((e) => e.buf).length + ')');
const tNow = await P.evaluate(() => window.__ringback.t());
const nx = seq0.find((e) => e.kind === 'act' && e.t > tNow + 0.5);   // the next act still to come, heard in real time
await P.waitForTimeout(Math.max(0, (nx.t + 1.0 - await P.evaluate(() => window.__ringback.t())) * 1000));
const s1 = await P.evaluate((n) => ({ seq: window.__ringback.overheard().find((e) => e.n === n), first: window.__ringback.overheard()[0], active: window.__ringback.active(),
  heard: document.querySelector('#heard').dataset.n, q: document.querySelector('#heard q') && document.querySelector('#heard q').textContent }), nx.n);
ok(s1.first.sched && s1.first.playing, 'the first act was handed to the audio clock and played');
ok(s1.seq.sched && s1.seq.playing && s1.active.includes(nx.n) && s1.heard === String(nx.n) && s1.q === O.seq.find((e) => e.n === nx.n).quote,
  'act ' + nx.n + ' heard and shown on its second, in real time (' + JSON.stringify(s1).slice(0, 160) + ')');
// the call kept up when the page is hidden: ten minutes of rings handed to the audio clock, and the title counts
await P.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
const ahead = await P.evaluate(() => window.__ringback.ahead());
ok(ahead > 590, 'hidden: every ringing line scheduled ' + Math.round(ahead) + ' s ahead');
ok(/^19 ringing · .* · RINGBACK$/.test(await P.evaluate(() => document.title)), 'the tab\'s title keeps the count: ' + await P.evaluate(() => document.title));
await P.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
await P.waitForTimeout(400);
ok(/you were away .*; 19 rang on, nobody picked up/.test(await P.evaluate(() => (document.querySelector('#status [data-k="away"]') || {}).textContent || '')), 'back on the page: the away note');

// state 2, quiet, its clock moved forward act by act: the passage, the line, the light, the rim, the count
const Q = quiet.p;
await Q.waitForTimeout(1500);
const qseq = await Q.evaluate(() => window.__ringback.overheard());
const go = async (n, into) => { const e = qseq.find((x) => x.n === n); const t = await Q.evaluate(() => window.__ringback.t()); await Q.evaluate((d) => window.__ringback.advance(d), e.t + into - t); await Q.waitForTimeout(500); return e; };
for (const n of [1, 8, 11, 15, 25, 37, 47]) {
  const e = O.seq.find((x) => x.n === n), d = O.doors.find((x) => x.id === e.door);
  await go(n, Math.min(1.0, e.dur / 2));
  const r = await Q.evaluate((id) => ({ active: window.__ringback.active(), heardN: document.querySelector('#heard').dataset.n,
    q: (document.querySelector('#heard q') || {}).textContent || '', who: document.querySelector('#heard .who').textContent,
    lamp: window.__ringback.lamp(id), heard: (document.querySelector('#status [data-k="heard"]') || {}).textContent }), d.line || d.id);
  ok(r.active.includes(n) && r.heardN === String(n), n + ' comes in on its turn');
  ok(e.kind === 'silence' ? r.q === '' : r.q === e.quote, n + ' its passage, word for word');
  const dd = e.days < 0 ? -e.days + ' days before the public knew' : e.days === 0 ? 'the day the public knew' : e.days + ' day' + (e.days === 1 ? '' : 's') + ' after the public knew';
  ok(e.kind === 'silence' ? /no act of it is in the record/.test(r.who) : (r.who.includes(dd) && r.who.includes(O.owed[e.owed]) && r.who.includes(O.does[e.code])), n + ' who, when, what and what owed it: ' + r.who.slice(0, 90));
  ok(r.lamp[1] === 3, n + ' the light of ' + (d.line || d.id) + ' speaks');
  ok(+r.heard === O.seq.filter((x) => x.kind === 'act' && x.n <= n).length, n + ' status: overheard ' + r.heard);
  if (e.public) ok(await Q.evaluate(() => window.__ringback.glow()) > 0.3, n + ' the world beyond the field lights up');
}
const rimNow = await Q.evaluate(() => window.__ringback.rim());
ok(rimNow.every((r) => r.spoke !== null) && rimNow.every((r) => r.p && r.p[0] > 0 && r.p[0] < 1100 * 2 && r.p[1] > 0), 'every door beyond the rim lit, and in view');
for (const [id, lineN] of [['CA4', 2], ['CA5', 1], ['COP5', 17]]) {
  await Q.evaluate((x) => window.__ringback.select(x), id); await Q.waitForTimeout(250);
  const rows = await Q.evaluate(() => [...document.querySelectorAll('#panelBody tr[data-n]')].map((tr) => +tr.dataset.n));
  const want = O.seq.filter((e) => O.doors.find((d) => d.id === e.door).line === id).map((e) => e.n);
  ok(JSON.stringify(rows) === JSON.stringify(want) && want.length === lineN, id + ' panel: what was overheard on its line (' + rows.length + ')');
}
await Q.evaluate(() => window.__ringback.select('E-AGS')); await Q.waitForTimeout(250);
ok(await Q.evaluate(() => !!document.querySelector('#panelBody [data-k="rim"]') && document.querySelectorAll('#panelBody tr[data-n]').length === 3), 'E-AGS panel: not called, and its three acts');
await Q.evaluate(() => document.querySelector('#close').click());
const endT = await Q.evaluate(() => window.__ringback.hearEnd()), tq = await Q.evaluate(() => window.__ringback.t());
await Q.evaluate((d) => window.__ringback.advance(d), endT - tq + 0.5); await Q.waitForTimeout(600);
const endTxt = await Q.evaluate(() => document.querySelector('#heard [data-k="end"]').textContent);
ok(endTxt.includes('You overheard 47 acts at 18 doors; 37 were owed by nothing. 2 answered one who had sent word') && endTxt.includes('16 November 2026'), 'the end of the record, recounted');
ok(await Q.evaluate(() => !document.querySelector('#rehear').hidden), 'overhear it again');
const pageFigs2 = await Q.evaluate(() => Object.fromEntries([...document.querySelectorAll('#figs2 b[data-fig2]')].map((e) => [e.dataset.fig2, +e.textContent])));
for (const [k, v] of Object.entries(fig2)) ok(pageFigs2[k] === v, 'figure ' + k + ': page ' + pageFigs2[k] + ', Field ' + v);
ok(Object.keys(pageFigs2).length === Object.keys(fig2).length, 'no figure of state 2 left unrecounted');

if (shot) {
  // the process shot: the quiet page, its clock moved to the 37th act (Cal OES's report number), every earlier door lit
  await P.evaluate(() => { document.querySelector('#close').click(); }); await P.waitForTimeout(400);
  const qs = await (await b.newPage({ viewport: { width: 1100, height: 820 } }));
  await qs.goto(url); await qs.waitForTimeout(500); await qs.click('#goQuiet'); await qs.waitForTimeout(1500);
  const e37 = (await qs.evaluate(() => window.__ringback.overheard())).find((x) => x.n === 37);
  const t0 = await qs.evaluate(() => window.__ringback.t());
  await qs.evaluate((d) => window.__ringback.advance(d), 3); await qs.waitForTimeout(400);
  await qs.evaluate((d) => window.__ringback.advance(d), 30); await qs.waitForTimeout(16000);   // the opening; the ground fills, the lines no longer fresh
  const t1b = await qs.evaluate(() => window.__ringback.t());
  await qs.evaluate((d) => window.__ringback.advance(d), e37.t + 2.0 - t1b); await qs.waitForTimeout(900);
  await qs.screenshot({ path: shot }); console.log('shot', shot, 'at act 37, clock moved forward');
}

// the narrow page: no sideways scroll, the field there, a panel that fits
const N = narrow.p;
ok(await N.evaluate(() => document.documentElement.scrollWidth <= 390), '390 px: no sideways scroll');
ok((await N.evaluate(() => window.__ringback.lines())).filter((l) => l.st === 'ringing').length === 19, '390 px: all nineteen ring');
await N.evaluate(() => window.__ringback.select('CA4')); await N.waitForTimeout(300);
const box = await N.evaluate(() => { const r = document.querySelector('#panel').getBoundingClientRect(); return [r.left, r.right]; });
ok(box[0] >= 0 && box[1] <= 390, '390 px: the panel fits');

const errs = [...wide.errs, ...narrow.errs, ...quiet.errs].filter((m) => !/GPU stall/.test(m));
ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 3).join(' | '));
await b.close();
console.log(`${pass} checks pass` + (fails.length ? `, ${fails.length} fail:\n  ` + fails.join('\n  ') : ''));
process.exit(fails.length ? 1 : 0);
