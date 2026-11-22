// EARSHOT: read every figure the page prints and recount it, from the signals in data.js and again from the
// Field's own file at its commit; read the clock the page runs and hold it against each passage's own hour;
// open the page at 1100 and 390 px, run it, stand in a room, and shoot it.
// State 2: the same for the two cases as it happened (the Field's study 91 at its commit): every date, passage
// and source against the Field's file, every hour the page places against its date, and the run of each case.
// Run with a static server on this folder:  python3 -m http.server 8771 --bind 127.0.0.1   then   node check.mjs
import { readFileSync, existsSync } from 'node:fs';
import { createHash } from 'node:crypto';
import { createRequire } from 'node:module';
const require = createRequire(import.meta.url);
const { chromium } = require('playwright');

const url = process.argv[2] || 'http://127.0.0.1:8771/';
const shot = process.argv[3] || null;
const window = {};
new Function('window', readFileSync(new URL('./data.js', import.meta.url), 'utf8'))(window);
const D = window.EARSHOT, S = D.signals;
let pass = 0; const fails = [];
const ok = (c, what) => { if (c) pass++; else fails.push(what); };

// the Field's file, at the commit this work built on, byte for byte
const raw = Buffer.from(await (await fetch(D.source.url)).arrayBuffer());
ok(createHash('sha256').update(raw).digest('hex') === D.source.sha256, 'signals90.json sha256');
const F = JSON.parse(raw.toString('utf8')).signals;
ok(F.length === S.length, 'same number of signals as the Field');
for (const f of F) {
  const s = S.find(x => x.id === f.id);
  ok(!!s, 'signal ' + f.id + ' present');
  if (!s) continue;
  for (const k of ['quote', 'receiver', 'public', 'trigger', 'clock', 'deadline_h', 'deadline_max_h', 'binding']) ok(JSON.stringify(s[k]) === JSON.stringify(f[k]), f.id + ' ' + k + ' as the Field coded it');
  ok(s.who === f.machine_or_person, f.id + ' who');
  ok(s.words.map(w => w[0]).join(' ') === f.quote.split(/\s+/).join(' '), f.id + ' words are the passage');
  ok(existsSync(new URL('./audio/' + f.id + '.mp3', import.meta.url)), f.id + ' audio');
  // the room is the receiver the Field coded
  const room = f.receiver === 'public' ? 'street' : f.receiver === 'other party' ? 'others' : f.receiver === 'own record' ? 'maker' : null;
  if (room) ok(s.room === room, f.id + ' room ' + s.room);
  else ok(!['street', 'others', 'maker'].includes(s.room), f.id + ' in a public body\'s room');
}

// figures, recounted from the Field's codes
const ev = F.filter(f => f.trigger === 'event short of harm' || f.trigger === 'harm');
const numbered = ev.filter(f => typeof f.deadline_h === 'number');
const at = S.filter(s => s.when.phase === 'at');
const expect = {
  signals: F.length,
  instruments: new Set(F.map(f => f.instrument)).size,
  room_street: S.filter(s => s.room === 'street').length,
  bodies: F.filter(f => f.receiver === 'public body').length,
  room_others: S.filter(s => s.room === 'others').length,
  room_maker: S.filter(s => s.room === 'maker').length,
  events: ev.length,
  numbered: numbered.length,
  events_public: ev.filter(f => f.public === 'public').length,
  events_law_public: ev.filter(f => f.binding === 'law' && f.public === 'public').length,
  aggregate: F.filter(f => f.public === 'aggregate only').length,
  who_required: F.filter(f => f.machine_or_person === 'required').length,
  who_class: F.filter(f => f.machine_or_person === 'by class').length,
  street_who: S.filter(s => s.room === 'street' && s.who !== 'not addressed').length,
  all_four: F.filter(f => f.all_four).length,
};
// the machine listener (listen.py): every passage heard, the totals the page prints recounted from its rows
const L = JSON.parse(readFileSync(new URL('./listen.json', import.meta.url), 'utf8'));
ok(L.rows.length === S.length && S.every(s => L.rows.some(r => r.id === s.id)), 'the listener heard every voice');
const sum = k => L.rows.reduce((a, r) => a + r[k], 0);
ok(sum('words') === L.words && sum('near') === L.near && sum('wall') === L.wall_words, 'listener totals are the sum of its rows');
ok(L.rows.every(r => r.near <= r.words && r.wall <= r.words), 'listener never recovers more words than a passage has');
const fmt = n => n.toLocaleString('en-US');
expect.listen_words = fmt(sum('words'));
expect.listen_near = fmt(sum('near'));
expect.listen_wall = fmt(sum('wall'));
// the five hours, as the work sounds them: the hour each passage names for itself
const hoursWord = { 24: '24 hours', 72: '72 hours', 120: 'five days', 360: '15 days' };
expect.numbered_list = at.map(s => s.when.h).sort((a, b) => a - b).map(h => hoursWord[h]).join(', ');
ok(at.length === numbered.length && at.every(s => numbered.some(f => f.id === s.id)), 'the clock sounds exactly the numbered event signals');
ok(numbered.every(f => f.clock === 'awareness'), 'all numbered event clocks run from awareness');
ok(numbered.every(f => f.receiver === 'public body'), 'all numbered event signals go to a public body');
ok(at.every(s => s.room !== 'street'), 'none of them in the street');
for (const s of at) {
  const f = F.find(x => x.id === s.id);
  const lo = f.deadline_h, hi = f.deadline_max_h ?? f.deadline_h;
  ok(s.when.h >= lo && s.when.h <= hi, s.id + ' hour within the text\'s range');
  if (s.id === 'COP3') ok(/five days/.test(f.quote), 'COP3 passage names five days');
  else ok(s.when.h === f.deadline_h, s.id + ' hour is the Field\'s deadline');
}
// the two that require who acted: kept by the maker, voluntary, not public
const req = F.filter(f => f.machine_or_person === 'required');
ok(req.every(f => f.receiver === 'own record' && f.binding === 'voluntary' && f.public === 'not public'), 'who-acted records: own, voluntary, not public');
ok(S.filter(s => s.when.phase === 'none').length === 17, 'seventeen set no hour and do not sound');
ok(D.clock.murmur.every(id => F.find(f => f.id === id).public === 'aggregate only'), 'the murmur gathers only aggregate signals');
const cn6 = F.find(f => f.id === 'CN6');
ok(/at least six months/.test(cn6.quote) && S.find(s => s.id === 'CN6').retention_end_h === 4380, 'CN6 kept six months');

// ---------- state 2: the cases, against the Field's study 91 ----------
const mraw = Buffer.from(await (await fetch(D.moved.url)).arrayBuffer());
ok(createHash('sha256').update(mraw).digest('hex') === D.moved.sha256, 'moved91.json sha256');
const M = JSON.parse(mraw.toString('utf8'));
const dayOf = iso => Math.round(Date.parse(iso + 'T00:00:00Z') / 864e5);
for (const mc of M.cases) {
  const c = D.cases.find(x => x.id === mc.id);
  ok(!!c, 'case ' + mc.id + ' present');
  if (!c) continue;
  ok(c.began === mc.began, mc.id + ' began');
  ok(c.today_day === dayOf(D.moved.record_date) - dayOf(mc.began), mc.id + ' today counted from the deed');
  ok(c.events.length === mc.events.length, mc.id + ' every event of the record');
  for (const me of mc.events) {
    const e = c.events.find(x => x.key === me.key);
    ok(!!e, mc.id + ' ' + me.key + ' present'); if (!e) continue;
    ok(e.date === me.date && e.src === me.src[0] && e.quote === me.src[1] && e.public === me.public, mc.id + ' ' + me.key + ' date, source and passage as the Field coded them');
    ok(e.day === dayOf(me.date) - dayOf(mc.began) && e.h === e.day * 24, mc.id + ' ' + me.key + ' hour from its date');
    if (e.kind === 'voice') {
      ok(e.words.map(w => w[0]).join(' ') === e.show.split(/\s+/).join(' '), mc.id + ' ' + me.key + ' words shown are what is said');
      ok(e.show === me.src[1] || (me.src[1].includes('\u201c' + e.show + '\u201d')), mc.id + ' ' + me.key + ' says the passage, or the words it quotes');
      ok(existsSync(new URL('./audio/' + e.vid + '.mp3', import.meta.url)), mc.id + ' ' + me.key + ' audio');
      // only what was public on its day is said in the street
      if (e.place === 'street' || e.echo === 'street') ok(me.public === true, mc.id + ' ' + me.key + ' public on its day, so said in the street');
    } else ok(!e.vid, mc.id + ' ' + me.key + ' not public that day or the deed itself: not spoken');
    if (me.public === false) ok(e.place !== 'street' || e.kind === 'silent', mc.id + ' ' + me.key + ' not spoken in the street');
  }
  // the street hears first: no public body speaks of the case before the street does
  const firstStreet = Math.min(...c.events.filter(e => e.kind === 'voice' && e.place === 'street').map(e => e.day));
  const bodyDays = c.events.filter(e => (e.wake && !['street', 'maker'].includes(e.wake.room)) || (e.kind === 'voice' && !['street', 'maker'].includes(e.place))).map(e => e.day);
  ok(bodyDays.length > 0 && Math.min(...bodyDays) > firstStreet, mc.id + ' a public body speaks after the street');
  ok(c.events.find(e => e.key === 'first_public').day === firstStreet, mc.id + ' the first voice in the street is the first public one');
  const kn = c.events.find(e => e.knew);
  ok(kn ? c.paper_from_h === kn.h && mc.maker_knew.date === kn.date : c.paper_from_h === null && mc.maker_knew.date === null, mc.id + ' the paper\'s hours counted from the maker\'s own dated knowing, or not at all');
}
const W = M.cases.find(c => c.id === 'wiki').delays_days, X = M.cases.find(c => c.id === 'escape').delays_days;
const dd = (c, a, b) => { const k = M.cases.find(x => x.id === c); const ev = key => k.events.find(e => e.key === key).date; return dayOf(ev(b)) - dayOf(ev(a)); };
expect.wiki_first = dd('wiki', 'began', 'first_public'); expect.escape_first = dd('escape', 'began', 'first_public');
expect.wiki_maker = dd('wiki', 'first_public', 'maker_public'); expect.escape_maker = dd('escape', 'first_public', 'maker_public');
expect.wiki_body = dd('wiki', 'first_public', 'body'); expect.escape_body = dd('escape', 'first_public', 'body');
ok(expect.wiki_first === W.began_to_first_public && expect.escape_first === X.began_to_first_public && expect.wiki_maker === W.first_public_to_maker && expect.escape_maker === X.first_public_to_maker && expect.wiki_body === W.first_public_to_body && expect.escape_body === X.first_public_to_body, 'delays recounted from the dates agree with the Field\'s');
const MS = M.signals, due = MS.filter(m => m.due === 'due'), traced = due.filter(m => m.moved !== 'no trace found');
const streetIds = S.filter(s => s.room === 'street').map(s => s.id);
expect.due = due.length; expect.traced = traced.length;
expect.traced_body = traced.filter(m => m.hosts.includes('public body')).length;
expect.street_all = streetIds.length;
expect.street_traced = traced.filter(m => streetIds.includes(m.id)).length;
for (const m of MS) { const s = S.find(x => x.id === m.id); ok(s.due === m.due && s.moved === m.moved, m.id + ' due and trace as the Field coded them'); }

const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [w, h] of [[1100, 820], [390, 844]]) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url + '?auto=sound');
  await p.waitForTimeout(2500);
  const page = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-k]')].map(e => [e.dataset.k, e.textContent.trim()])));
  for (const [k, v] of Object.entries(expect)) ok(page[k] === String(v), w + 'px ' + k + ': page ' + page[k] + ' / recount ' + v);
  // the clock the page runs
  const clock = await p.evaluate(() => { const s = window.__earshot; return { events: s.events, PRE: s.PRE, END: s.END, h: s.events.filter(e => e.h).map(e => [e.h, s.tauToH(e.tau)]) }; });
  for (const [hh, back] of clock.h) ok(Math.abs(back - hh) / hh < 1e-6, w + 'px clock: hour ' + hh + ' placed at ' + back);
  const deed = clock.events.find(e => e.kind === 'deed');
  ok(deed && deed.tau === clock.PRE, w + 'px the deed at the end of the release');
  const pre = clock.events.filter(e => e.kind === 'voice' && e.tau < clock.PRE).map(e => e.id);
  ok(pre.every(id => S.find(s => s.id === id).when.phase === 'before'), w + 'px only release signals before the deed');
  const voiced = new Set(clock.events.filter(e => e.kind === 'voice').map(e => e.id));
  ok(S.filter(s => s.when.phase === 'none').every(s => !voiced.has(s.id)), w + 'px no signal without an hour sounds on the clock');
  // audio: every voice decodes, at the length the data says
  const durs = await p.evaluate(async () => { const ac = new OfflineAudioContext(1, 100, 24000); const out = {}; const items = window.EARSHOT.signals.map(s => s.id).concat(window.EARSHOT.cases.flatMap(c => c.events.filter(e => e.vid).map(e => e.vid))); for (const id of items) { const b = await (await fetch('audio/' + id + '.mp3')).arrayBuffer(); out[id] = (await ac.decodeAudioData(b)).duration; } return out; });
  for (const s of S) ok(Math.abs(durs[s.id] - s.dur) < 0.15, w + 'px ' + s.id + ' decodes at ' + durs[s.id].toFixed(2) + ' s');
  for (const e of D.cases.flatMap(c => c.events.filter(e => e.vid))) ok(Math.abs(durs[e.vid] - e.dur) < 0.15, w + 'px ' + e.vid + ' decodes at ' + durs[e.vid].toFixed(2) + ' s');
  // run: a moment after a numbered signal sounds, it lights its room and nothing of it reaches the street's words
  await p.evaluate(() => window.__earshot.seek(window.__earshot.hToTau(72) - 0.5));
  await p.waitForTimeout(2600);
  const run = await p.evaluate(() => { const s = window.__earshot; return { voices: s.voices.map(v => [v.id, v.room, v.murmur]), lit: s.lit, listener: s.listener }; });
  ok(run.voices.some(([id, room]) => id === 'NY4' && room === 'dfs'), w + 'px NY4 sounds in New York\'s office at 72 h');
  ok(run.lit.dfs > 0.5, w + 'px that room is lit');
  ok(run.voices.filter(([, room]) => room === 'street').every(([id]) => S.find(s => s.id === id).room === 'street'), w + 'px only the street\'s own texts in the street');
  // as it happened: what each case's run sounds, read from the page's own clock
  for (const c of D.cases) {
    const evs = await p.evaluate(id => window.__earshot.buildEvents(id), c.id);
    const recEnd = await p.evaluate(id => window.__earshot.hToTau(window.EARSHOT.cases.find(x => x.id === id).today_h), c.id);
    ok(evs.every(e => e.tau <= recEnd + 1e-9), w + 'px ' + c.id + ' nothing after today');
    ok(evs.some(e => e.kind === 'today' && Math.abs(e.tau - recEnd) < 1e-9), w + 'px ' + c.id + ' the run ends today');
    const vids = evs.filter(e => e.kind === 'voice').map(e => e.id);
    ok(vids.every(id => S.find(s => s.id === id).due === 'due'), w + 'px ' + c.id + ' no signal not yet due sounds');
    ok(vids.every(id => S.find(s => s.id === id).when.phase !== 'at') && !evs.some(e => e.kind === 'murmur'), w + 'px ' + c.id + ' no hour of the paper is sounded as if it happened');
    for (const e of evs.filter(e => e.kind === 'case' && e.h >= 0)) { const back = await p.evaluate(t => window.__earshot.tauToH(t), e.tau); ok(Math.abs(back - e.h) / Math.max(1, e.h) < 1e-4 || e.id === 'knew_undated', w + 'px ' + c.id + ' ' + e.id + ' placed at its hour'); }
    const paper = evs.filter(e => e.kind === 'paper');
    ok(c.paper_from_h === null ? paper.length === 0 : paper.length === D.paper_hours.length && paper.every(e => D.paper_hours.includes(e.h - c.paper_from_h)), w + 'px ' + c.id + ' the paper\'s hours from the maker\'s knowing');
  }
  // run the escape: the first voice of the record in the street, and a report carried in from the street
  await p.evaluate(() => window.__earshot.setMode('escape', false));
  const fp = D.cases.find(c => c.id === 'escape').events.find(e => e.key === 'first_public');
  await p.evaluate(h => window.__earshot.seek(window.__earshot.hToTau(h) - 0.3), fp.h);
  await p.waitForTimeout(2500);
  const r1 = await p.evaluate(() => { const s = window.__earshot; return { telling: s.telling && s.telling.e.key, voices: s.voices.map(v => [v.id, v.room]), time: document.getElementById('time').textContent }; });
  ok(r1.telling === 'first_public' && r1.voices.some(([id, room]) => id === 'escape-first_public' && room === 'street'), w + 'px escape: the harmed party is heard in the street');
  ok(r1.time.startsWith('16 July 2026 · 7 days after the deed'), w + 'px escape: the page names the day: ' + r1.time);
  const rs = D.cases.find(c => c.id === 'escape').events.find(e => e.key === 'report_sent');
  await p.evaluate(h => window.__earshot.seek(window.__earshot.hToTau(h) - 0.2), rs.h);
  await p.waitForTimeout(4200);
  const r2 = await p.evaluate(() => { const s = window.__earshot; return { visitor: s.visitor, voices: s.voices.map(v => [v.id, v.room]), lit: s.lit.oes }; });
  ok(r2.visitor.oes === true && r2.voices.some(([id, room]) => id === 'CA6' && room === 'oes') && r2.lit > 0.5, w + 'px escape: someone from the street carries a report into the office, and its channel speaks');
  await p.evaluate(() => window.__earshot.setMode('paper', true));
  ok(errs.length === 0, w + 'px no page errors: ' + errs.join(' | '));
  if (shot && w === 1100) {
    await p.evaluate(() => window.__earshot.seek(window.__earshot.hToTau(360) - 0.4));
    await p.waitForTimeout(4200);
    await p.screenshot({ path: shot });
  }
  await p.close();
}
await browser.close();
console.log(pass + ' checks passed' + (fails.length ? ', ' + fails.length + ' failed:\n' + fails.join('\n') : ''));
process.exit(fails.length ? 1 : 0);
