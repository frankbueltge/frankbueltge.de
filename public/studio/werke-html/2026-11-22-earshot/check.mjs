// EARSHOT: read every figure the page prints and recount it, from the signals in data.js and again from the
// Field's own file at its commit; read the clock the page runs and hold it against each passage's own hour;
// open the page at 1100 and 390 px, run it, stand in a room, and shoot it.
// State 2: the same for the two cases as it happened (the Field's study 91 at its commit): every date, passage
// and source against the Field's file, every hour the page places against its date, and the run of each case.
// State 3 (the check, session 262): the Field's own check 92 at its commit (final codes, reconciled traces, the wiki's
// first day) in place of the codes of studies 90 and 91; the listener's totals from the page's own sound; the doors shut
// while a case runs; a room that hears of the deed lit cold.
// State 4 (the presentation, session 263): the Field's reading 93 at its commit, its answer on the maker's own alerts:
// every sentence of the maker's report the escape now says stands in the Field's file, on its day, in the maker's room;
// the paper's hours run from 20 July, the day the maker tied its alert to the hub's incident. On the Atelier's reading
// of the wall: every word that came through is a small word, nearly all inside sentences nobody said, and the ear on
// the page draws every one of them as the recogniser's own.
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
const F90 = JSON.parse(raw.toString('utf8')).signals;
// state 3: the Field's check 92, each file at its pin
const pinned = {};
for (const [name, sha] of Object.entries(D.check.files)) {
  const b = Buffer.from(await (await fetch(D.check.base + name)).arrayBuffer());
  ok(createHash('sha256').update(b).digest('hex') === sha, name + ' sha256');
  pinned[name] = JSON.parse(b.toString('utf8'));
}
const FINAL = Object.fromEntries(pinned['codes92.json'].signals.map(c => [c.id, c]));
const F = F90.map(f => ({ ...f, ...FINAL[f.id], all_four: pinned['results92.json'].A.final.all_four.includes(f.id) }));
ok(D.check.changed.length === pinned['codes92.json'].changed.length, 'every code the Field changed is applied');
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

// figures, recounted from the Field's final codes
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
const LS = L.rows.filter(r => r.kind === 'signal'), LR = L.rows.filter(r => r.kind === 'record');
const caseVids = D.cases.flatMap(c => c.events.filter(e => e.vid).map(e => e.vid));
ok(LS.length === S.length && S.every(s => LS.some(r => r.id === s.id)), 'the listener heard every passage, on both sides');
ok(LR.length === caseVids.length && caseVids.every(v => LR.some(r => r.id === v)), 'the listener heard every sentence of the record');
const sum = (rows, k) => rows.reduce((a, r) => a + r[k], 0);
ok(sum(LS, 'words') === L.words && sum(LS, 'near') === L.near && sum(LS, 'wall') === L.wall_words, 'listener totals are the sum of its rows');
ok(sum(LR, 'words') === L.record_words && sum(LR, 'wall') === L.record_wall, 'record totals are the sum of its rows');
ok(L.rows.every(r => r.near <= r.words && r.wall <= r.words), 'listener never recovers more words than a passage has');
ok(/own audio graph/.test(L.wall), 'state 3: the wall is the page\'s own sound');
const HW = {}; new Function('window', readFileSync(new URL('./heard.js', import.meta.url), 'utf8'))(HW);
ok(L.rows.every(r => HW.EARSHOT_HEARD.rows[r.id] && HW.EARSHOT_HEARD.rows[r.id].wall.map(w => w[0]).join(' ') === r.heard_wall && HW.EARSHOT_HEARD.rows[r.id].near.map(w => w[0]).join(' ') === r.heard_near), 'the ear on the page writes what the listener heard');
const fmt = n => n.toLocaleString('en-US');
expect.ear_words = fmt(sum(LS, 'words')); expect.ear_near = fmt(sum(LS, 'near')); expect.ear_wall = fmt(sum(LS, 'wall'));
expect.record_words = fmt(sum(LR, 'words')); expect.record_wall = fmt(sum(LR, 'wall'));
// what session 3 counted, before the maker's six sentences joined (state 4): the rows of then, kept as they were heard
const R93 = new Set(D.cases.flatMap(c => c.events.filter(e => e.vid && e.reading === 93).map(e => e.vid)));
const LR3 = LR.filter(r => !R93.has(r.id));
ok(LR3.length === 10 && R93.size === 6, 'ten sentences of the record in state 3, six added in state 4');
expect.record_words_s3 = fmt(sum(LR3, 'words')); expect.record_wall_s3 = fmt(sum(LR3, 'wall'));
expect.listen1_wall = fmt(L.state1.wall_words);
// state 4, on the Atelier's reading of the wall: which words came through, and inside what
const SMALLW = new Set('a an the to of in on at by for from with as and or but so if can will i we you it is be'.split(' '));
const nrm = w => w.toLowerCase().replace('\u2019', "'").replace(/[^a-z0-9']/g, '');
const NUMW = { '24': 'twentyfour', '72': 'seventytwo', '15': 'fifteen', '30': 'thirty', '12000000': 'twelvemillion' };
const refOf = id => { const s = S.find(x => x.id === id); if (s) return s.quote; for (const c of D.cases) { const e = c.events.find(e => e.vid === id); if (e) return e.show; } };
function lcsIdx(ref, hyp) {  // listen.py's match, with the places in what was heard
  const a = ref.split(/\s+/).map(nrm).filter(x => x).map(x => NUMW[x] || x.replace(/-/g, '')), b = hyp.map(w => { const n = nrm(w); return NUMW[n] || n; });
  const Lm = Array.from({ length: a.length + 1 }, () => new Array(b.length + 1).fill(0));
  for (let i = 0; i < a.length; i++) for (let j = 0; j < b.length; j++) Lm[i + 1][j + 1] = a[i] === b[j] ? Lm[i][j] + 1 : Math.max(Lm[i][j + 1], Lm[i + 1][j]);
  const out = []; let i = a.length, j = b.length;
  while (i && j) { if (a[i - 1] === b[j - 1]) { out.push(j - 1); i--; j--; } else if (Lm[i - 1][j] >= Lm[i][j - 1]) i--; else j--; }
  return out.reverse();
}
const through = { signal: [], record: [] };
for (const r of L.rows) {
  const hw = HW.EARSHOT_HEARD.rows[r.id].wall.map(w => w[0]);
  const idx = lcsIdx(refOf(r.id), hw);
  ok(idx.length === r.wall, r.id + ' the wall\'s matches recounted: ' + idx.length);
  for (const k of idx) through[r.kind].push({ id: r.id, k, w: nrm(hw[k]) });
}
ok([...through.signal, ...through.record].every(x => SMALLW.has(x.w)), 'every word through the wall is a small word');
expect.wall_small = through.signal.length; expect.record_small = through.record.length;
expect.wall_words_list = [...new Set(through.signal.map(x => x.w))].join(', ');
// a word stands in a sentence nobody said when the sentence the recogniser wrote around it (to its full stop) has
// more than one word and does not stand in the passage
function sentenceOf(words, k) { let a = k; while (a > 0 && !/[.?!]$/.test(words[a - 1])) a--; let b = k; while (b < words.length - 1 && !/[.?!]$/.test(words[b])) b++; return words.slice(a, b + 1); }
const flat = t => t.split(/\s+/).map(nrm).filter(x => x).join(' ');
const unsaid = x => { const sn = sentenceOf(HW.EARSHOT_HEARD.rows[x.id].wall.map(w => w[0]), x.k); return sn.length > 1 && !flat(refOf(x.id)).includes(flat(sn.join(' '))); };
expect.wall_in_said = through.signal.filter(unsaid).length;
expect.record_in_said = through.record.filter(unsaid).length;
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
ok(S.find(s => s.id === 'G7-3').room === 'street' && S.find(s => s.id === 'G7-3').when.phase === 'none', 'G7-3 in the street since the check, with no hour');
ok(S.filter(s => s.id === 'CA3' || s.id === 'NY3').every(s => s.when.h === 2208 && s.deadline_h === 2208), 'quarterly clocks at 2208 h');
ok(D.clock.murmur.every(id => F.find(f => f.id === id).public === 'aggregate only'), 'the murmur gathers only aggregate signals');
const cn6 = F.find(f => f.id === 'CN6');
ok(/at least six months/.test(cn6.quote) && S.find(s => s.id === 'CN6').retention_end_h === 4380, 'CN6 kept six months');

// ---------- state 2: the cases, against the Field's study 91 ----------
const mraw = Buffer.from(await (await fetch(D.moved.url)).arrayBuffer());
ok(createHash('sha256').update(mraw).digest('hex') === D.moved.sha256, 'moved91.json sha256');
const M = JSON.parse(mraw.toString('utf8'));
{ const w = pinned['results92.json'].wiki, mc = M.cases.find(c => c.id === 'wiki'), b = mc.events.find(e => e.key === 'began');
  ok(mc.began === w.state2_began && b.date === w.state2_began, 'the wiki began on ' + w.state2_began + ' in study 91');
  mc.began = b.date = w.began; b.src = w.began_src; mc.delays_days = w.delays_days; }
const dayOf = iso => Math.round(Date.parse(iso + 'T00:00:00Z') / 864e5);
const MON = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
const fmtDay = iso => { const d = new Date(iso + 'T12:00:00Z'); return d.getUTCDate() + ' ' + MON[d.getUTCMonth()]; };
for (const mc of M.cases) {
  const c = D.cases.find(x => x.id === mc.id);
  ok(!!c, 'case ' + mc.id + ' present');
  if (!c) continue;
  ok(c.began === mc.began, mc.id + ' began');
  ok(c.today_day === dayOf(D.moved.record_date) - dayOf(mc.began), mc.id + ' today counted from the deed');
  ok(c.events.length === mc.events.length + (mc.id === 'escape' ? 7 : 0), mc.id + ' every event of the record');
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
  if (mc.id === 'escape') ok(kn && c.paper_from_h === kn.h && c.maker_knew_state3.date === mc.maker_knew.date && kn.date > mc.maker_knew.date, 'escape: study 91\'s day of knowing kept beside the corrected one');
  else ok(kn ? c.paper_from_h === kn.h && mc.maker_knew.date === kn.date : c.paper_from_h === null && mc.maker_knew.date === null, mc.id + ' the paper\'s hours counted from the maker\'s own dated knowing, or not at all');
}
// state 4: the Field's reading 93, at its pin
const e93raw = Buffer.from(await (await fetch(D.reading93.url)).arrayBuffer());
ok(createHash('sha256').update(e93raw).digest('hex') === D.reading93.sha256, 'escape93.json sha256');
const E93 = JSON.parse(e93raw.toString('utf8'));
const XE = D.cases.find(c => c.id === 'escape');
{ const R = XE.events.filter(e => e.reading === 93), fev = E93.events;
  ok(R.length === 7, 'escape: seven events from the maker\'s report join the record');
  for (const e of R) {
    const parts = e.quote.split(' \u2026 ').map((x, i, a) => i < a.length - 1 ? x : x);
    const f = fev.find(f => f.date === e.date && parts.every(p => f.passages.some(q => q === p || q.replace(/\.$/, '') === p)));
    ok(!!f && e.src === E93.report.url && e.public === false, 'escape ' + e.key + ': its passage stands in reading 93 on ' + e.date);
    if (e.kind === 'voice') ok(e.place === 'maker' && e.show === e.quote, 'escape ' + e.key + ': said in the maker\'s room, word for word');
    else ok(e.kind === 'caption' && !e.vid && f.key === 'internet', 'escape ' + e.key + ': the maker did not know it that day, so it is not said');
  }
  const said = new Set(XE.events.flatMap(e => e.quote.split(' \u2026 ')));
  const left = fev.flatMap(f => f.passages).filter(p => !said.has(p) && !said.has(p.replace(/\.$/, '')));
  ok(left.length === 1 && /no indication of a relationship/.test(left[0]), 'every passage of reading 93 is in the escape but the one the caption of 19 July carries: ' + left.length);
  const third = XE.events.find(e => e.key === 'maker_knew'), tied = XE.events.find(e => e.key === 'tied');
  ok(!third.knew && third.alarm && /not yet tied/.test(third.sub) && third.date === fev.find(f => f.key === 'alert_3').date, 'escape: 19 July is the third alert, not yet tied');
  ok(tied.knew && tied.date === fev.find(f => f.key === 'tied').date && XE.maker_knew.date === tied.date && XE.paper_from_h === tied.h, 'escape: the paper\'s hours from 20 July, the day the maker tied it');
  ok(XE.events.filter(e => e.alarm && e.date < XE.began).length === E93.answer.alerts_before_the_escape, 'escape: two alerts before the deed, as the Field counts them');
  expect.alerts_before = E93.answer.alerts_before_the_escape;
  expect.knew_tied = fmtDay(tied.date); expect.first_alert = fmtDay(fev[0].date);
  expect.first_alert_days = dayOf(XE.began) - dayOf(fev[0].date);
  expect.alert_to_tied = dayOf(tied.date) - dayOf(fev[0].date);
}
const W = M.cases.find(c => c.id === 'wiki').delays_days, X = M.cases.find(c => c.id === 'escape').delays_days;
const dd = (c, a, b) => { const k = M.cases.find(x => x.id === c); const ev = key => k.events.find(e => e.key === key).date; return dayOf(ev(b)) - dayOf(ev(a)); };
expect.wiki_first = dd('wiki', 'began', 'first_public'); expect.escape_first = dd('escape', 'began', 'first_public');
expect.wiki_maker = dd('wiki', 'first_public', 'maker_public'); expect.escape_maker = dd('escape', 'first_public', 'maker_public');
expect.wiki_body = dd('wiki', 'first_public', 'body'); expect.escape_body = dd('escape', 'first_public', 'body');
expect.wiki_last = dd('wiki', 'ended', 'first_public'); expect.wiki_lasted = dd('wiki', 'began', 'ended');
ok(expect.wiki_last === W.ended_to_first_public && expect.wiki_lasted === W.lasted, 'the wiki\'s span and its last edit agree with the Field\'s check');
ok(expect.wiki_first === 103 && D.cases.find(c => c.id === 'wiki').began === '2026-05-24', 'the wiki counted from its first post, 24 May');
ok(expect.wiki_first === W.began_to_first_public && expect.escape_first === X.began_to_first_public && expect.wiki_maker === W.first_public_to_maker && expect.escape_maker === X.first_public_to_maker && expect.wiki_body === W.first_public_to_body && expect.escape_body === X.first_public_to_body, 'delays recounted from the dates agree with the Field\'s');
const MS = M.signals, due = MS.filter(m => m.due === 'due');
const T = Object.fromEntries(pinned['traces92.json'].signals.map(t => [t.id, t]));
ok(due.length === Object.keys(T).length && due.every(m => T[m.id]), 'the check holds every due signal');
const traced = due.filter(m => T[m.id].moved !== 'no trace found');
const streetIds = S.filter(s => s.room === 'street' && s.when.phase === 'before').map(s => s.id);
expect.due = due.length; expect.traced = traced.length;
const onBody = traced.filter(m => T[m.id].hosts.includes('public body'));
expect.traced_body = onBody.length;
ok(JSON.stringify(onBody.map(m => m.id).sort()) === JSON.stringify([...pinned['results92.json'].B.on_public_body_site].sort()), 'on a public body\'s site: the Field\'s own list');
expect.traced_body_closed = onBody.filter(m => FINAL[m.id].public === 'not public').length;
expect.street_all = streetIds.length;
expect.street_traced = traced.filter(m => streetIds.includes(m.id)).length;
expect.street_event = S.filter(s => s.room === 'street' && ['event short of harm', 'harm'].includes(FINAL[s.id].trigger)).length;
for (const m of MS) { const s = S.find(x => x.id === m.id); ok(s.due === m.due && s.moved === (T[m.id] ? T[m.id].moved : m.moved), m.id + ' due and trace as the Field\'s check coded them'); }

const a2h = XE.events.find(e => e.key === 'alert_2').h;
const browser = await chromium.launch({ args: ['--autoplay-policy=no-user-gesture-required'] });
for (const [w, h] of [[1100, 820], [390, 844]]) {
  const p = await browser.newPage({ viewport: { width: w, height: h } });
  const errs = []; p.on('pageerror', e => errs.push(e.message)); p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  await p.goto(url + '?auto=sound');
  await p.waitForTimeout(2500);
  const page = await p.evaluate(() => Object.fromEntries([...document.querySelectorAll('[data-k]')].map(e => [e.dataset.k, e.textContent.trim()])));
  ok(await p.evaluate(() => /^Presented · state 4 of 4/.test(document.querySelector('.wip').textContent)), w + 'px the face says presented');
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
  // state 3: the doors are shut while a case runs, and open at today; the rooms the deed reaches light cold
  const shut = await p.evaluate(() => { const s = window.__earshot; s.standIn('oes'); return { listener: s.listener, locked: s.locked(), woken: { ...s.woken } }; });
  ok(shut.locked && shut.listener === 'street', w + 'px escape: a door clicked before today stays shut');
  ok(shut.woken.oes === true && shut.woken.maker === true && !shut.woken.street, w + 'px escape: the office the report reached and the maker\'s room are lit cold');
  await p.evaluate(() => window.__earshot.seek(window.__earshot.recEnd() + 1));
  await p.waitForTimeout(400);
  const open = await p.evaluate(() => { const s = window.__earshot; s.standIn('oes'); const l = s.listener; s.standIn('street'); return { listener: l, locked: s.locked() }; });
  ok(!open.locked && open.listener === 'oes', w + 'px escape: at today the doors open');
  await p.evaluate(() => window.__earshot.setMode('paper', true));
  const loop = await p.evaluate(() => window.__earshot.streetLoop());
  ok(!loop.includes('G7-3') && loop.length === 10, w + 'px the street says its ten release texts; G7-3, with no hour, is set down');
  await p.evaluate(() => window.__earshot.seek(window.__earshot.hToTau(73)));
  await p.waitForTimeout(300);
  const cold = await p.evaluate(() => ({ ...window.__earshot.woken }));
  ok(cold.dfs === true && cold.maker === true && !cold.bis && !cold.street, w + 'px on paper at 73 h: New York\'s office has heard of the deed, a room of routine paper has not');
  // state 4: the ear draws every word that came through the wall as the recogniser's own
  const red = await p.evaluate(ids => ids.map(([id, k]) => window.__earshot.invented(id, 'wall')[k]), [...through.signal, ...through.record].map(x => [x.id, x.k]));
  ok(red.length === through.signal.length + through.record.length && red.every(Boolean), w + 'px every word through the wall is drawn as the recogniser\'s own');
  // state 4: the escape before the deed, on the maker's own alerts
  await p.evaluate(() => window.__earshot.setMode('escape', false));
  await p.waitForTimeout(300);
  const t0 = await p.evaluate(() => document.getElementById('time').textContent);
  ok(/^2[0-9] June 2026 · 1[0-9] days before the deed$/.test(t0), w + 'px escape opens on a day in June: ' + t0);
  const a2 = XE.events.find(e => e.key === 'alert_2');
  await p.evaluate(t => window.__earshot.seek(t - 0.05), await p.evaluate(h => window.__earshot.preTau(h), a2.h));
  await p.waitForTimeout(2200);
  const r0 = await p.evaluate(() => { const s = window.__earshot; return { telling: s.telling && s.telling.e.key, alarm: s.alarm, voices: s.voices.map(v => [v.id, v.room]), time: document.getElementById('time').textContent, locked: s.locked() }; });
  ok(r0.telling === 'alert_2' && r0.alarm > 0.5 && r0.voices.some(([id, room]) => id === 'escape-alert_2' && room === 'maker'), w + 'px escape: on 5 July the maker\'s monitoring alarms in its room');
  ok(r0.time === '5 July 2026 · 4 days before the deed' && r0.locked, w + 'px escape: the page names the day, and the street is shut out: ' + r0.time);
  ok(errs.length === 0, w + 'px no page errors: ' + errs.join(' | '));
  if (shot && w === 1100) {
    // state 4: the escape on 5 July, four days before the deed: the maker's monitoring alarms, a machine's ear on
    await p.evaluate(() => { window.__earshot.setMode('escape', false); document.getElementById('ear').click(); });
    await p.evaluate(t => window.__earshot.seek(t - 0.05), await p.evaluate(h => window.__earshot.preTau(h), a2h));
    await p.waitForTimeout(1200);
    await p.waitForFunction(() => window.__earshot.alarm > 0.5 && Math.sin(window.__earshot.now * 7) > 0.85);
    await p.screenshot({ path: shot });
  }
  await p.close();
}
await browser.close();
console.log(pass + ' checks passed' + (fails.length ? ', ' + fails.length + ' failed:\n' + fails.join('\n') : ''));
process.exit(fails.length ? 1 : 0);
