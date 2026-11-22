// EARSHOT: read every figure the page prints and recount it, from the signals in data.js and again from the
// Field's own file at its commit; read the clock the page runs and hold it against each passage's own hour;
// open the page at 1100 and 390 px, run it, stand in a room, and shoot it.
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
  const durs = await p.evaluate(async () => { const ac = new OfflineAudioContext(1, 100, 24000); const out = {}; for (const s of window.EARSHOT.signals) { const b = await (await fetch('audio/' + s.id + '.mp3')).arrayBuffer(); out[s.id] = (await ac.decodeAudioData(b)).duration; } return out; });
  for (const s of S) ok(Math.abs(durs[s.id] - s.dur) < 0.15, w + 'px ' + s.id + ' decodes at ' + durs[s.id].toFixed(2) + ' s');
  // run: a moment after a numbered signal sounds, it lights its room and nothing of it reaches the street's words
  await p.evaluate(() => window.__earshot.seek(window.__earshot.hToTau(72) - 0.5));
  await p.waitForTimeout(2600);
  const run = await p.evaluate(() => { const s = window.__earshot; return { voices: s.voices.map(v => [v.id, v.room, v.murmur]), lit: s.lit, listener: s.listener }; });
  ok(run.voices.some(([id, room]) => id === 'NY4' && room === 'dfs'), w + 'px NY4 sounds in New York\'s office at 72 h');
  ok(run.lit.dfs > 0.5, w + 'px that room is lit');
  ok(run.voices.filter(([, room]) => room === 'street').every(([id]) => S.find(s => s.id === id).room === 'street'), w + 'px only the street\'s own texts in the street');
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
