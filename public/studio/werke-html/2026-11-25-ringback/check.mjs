// RINGBACK: hold data.js against the Field's files at their commits, recount every figure the page prints from the
// Field's own codes, read the page's tones and clock while it runs, and shoot it at 1100 and 390 px.
// State 1 (session 264): the field, the nineteen lines and the 9-1-1 line beside the office.
// State 3 (session 266), the check: everything rebuilt on the Field's study 96 and held against it, the Atelier's
// log of what each reason answered, deeds as fronts (struck, not read, and the lights they reach shake), the public's
// light that stays, the end in the form, the phone seen from California's end, and the check written into the page.
// State 4 (session 267), the presentation: rebuilt on the Field's reading 97 (81 acts at 20 doors; the doors and acts
// this practice's case found missing) and its reading of the maker's own door: five words, each held against four
// duties, the maker's line ringing inside, and a thread for every duty left in doubt, grey once its day has passed.
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
// the Field's check (study 96) moved one code; the figures below are recounted on study 94 with that code moved
for (const d of (await pinned('codes96')).decisions.filter((x) => x.moves)) R.find((r) => r.id === d.signal).acts[d.code].v = d.final;
const S = Object.fromEntries((await pinned('signals90')).signals.map((s) => [s.id, s]));
const ACTS = ['acknowledge', 'investigate', 'order', 'pass_on', 'tell_public', 'tell_public_aggregate'];

ok(R.length === D.lines.length && R.length === 19, 'nineteen receivers, as the Field has them');
for (const r of R) {
  const l = D.lines.find((x) => x.id === r.id);
  ok(!!l, r.id + ' present'); if (!l) continue;
  for (const k of ['receiver_name', 'receiver', 'receiver_party', 'instrument', 'instrument_short', 'binding', 'what', 'ref',
    'sender', 'trigger', 'sender_deadline_h', 'sender_deadline_max_h', 'sender_clock', 'note']) ok(same(l[k], r[k]), r.id + ' ' + k + ' as the Field coded it');
  for (const a of ACTS) for (const k of ['v', 'deadline_h', 'deadline_max_h', 'ref', 'quotes', 'note', 'doubt']) {
    if (l.acts[a].corrected && (k === 'v' || k === 'note')) continue;   // moved by the Field's check: held below
    ok(same(l.acts[a][k], r.acts[a][k]), r.id + ' ' + a + '.' + k);
  }
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

// ---------------------------------------------------------------- state 3: overheard.js against the Field's check, study 96
const C96 = await pinned('cases96'), K96 = (await pinned('check96')).passages, S95 = (await pinned('sources95')).sources;
const K95 = (await pinned('check95')).items, C95 = await pinned('cases95'), AT = await pinned('atelier');
const CASES = Object.fromEntries(C96.cases.map((c) => [c.id, c]));
const days = (a, b) => Math.round((Date.parse(a) - Date.parse(b)) / 864e5);
ok(C96.doors.flatMap((d) => d.acts).length === 74 && C96.doors.length === 18, '74 acts at 18 doors, as the Field\'s check had them on 27 November');
// state 4: the Field's reading 97 adds the maker's letter of 20 October to its door, and two doors (its build97.py)
const R97 = await pinned('codes97'), K97 = (await pinned('check97')).passages, RS97 = (await pinned('results97')).k;
const DOORS = JSON.parse(JSON.stringify(C96.doors)).map((d) => d.id === 'E-MAKER' ? Object.assign(d, { acts: d.acts.concat(JSON.parse(JSON.stringify(R97.maker_added))) }) : d)
  .concat(JSON.parse(JSON.stringify(R97.new_doors)));
const fieldActs = DOORS.flatMap((d) => d.acts.map((a, i) => ({ d, a, i })));
ok(fieldActs.length === 81 && DOORS.length === 20 && RS97.acts === 81 && RS97.doors === 20 && RS97.acts96 === 74, '81 acts at 20 doors, as the Field\'s reading 97 has them');
const oActs = O.seq.filter((e) => e.kind === 'act');
ok(oActs.length === fieldActs.length, 'every act of the Field\'s check comes in once');
const BY = { cw: '2026-09-04', hf1: '2026-07-16', ml: '2026-09-09', tnw_eu: '2026-10-14', star: '2026-09-07' };
for (const { d, a, i } of fieldActs) {
  const e = oActs.find((x) => x.door === d.id && x.i === i);
  ok(!!e, d.id + ' act ' + i + ' present'); if (!e) continue;
  ok(e.quote === a.quote && e.code === a.code && e.owed === a.owed && e.date === a.date && e.case === d.case && e.check === a.check, d.id + ' act ' + i + ' as coded, its passage word for word');
  ok(S95[a.src] ? e.src_url === S95[a.src].url : /^https:\/\//.test(e.src_url), d.id + ' act ' + i + ' source');
  // found by the Field: by its check where the check added or changed it, else by study 95's check of the same passage
  const k96 = K96.find((k) => k.item === `${d.id} ${a.code} ${a.date === null ? 'None' : a.date}` && k.found);   // the Field's script writes an undated item as None
  const old95 = C95.doors.find((x) => x.id === d.id);
  const oi = old95 ? old95.acts.findIndex((b) => b.quote === a.quote) : -1;
  const k95 = oi >= 0 && K95.find((k) => k.door === d.id && k.what === old95.acts[oi].code + '#' + oi && k.found);
  const k97 = a.check === 'added, reading 97' && K97.find((k) => k.item === `${d.id} ${a.code} ${a.date}${d.id === 'E-MAKER' ? ' (added)' : ''}` && k.found);
  ok(!!((a.check !== 'held' && k96) || k95 || k97), d.id + ' act ' + i + ' found by the Field in its source');
  ok(e.days === days(e.when, CASES[d.case].first_public), d.id + ' act ' + i + ' days from the first public account');
  ok(a.date ? e.when === a.date : (e.bound === 'by' && e.when === BY[a.src]), d.id + ' act ' + i + ' dated as the record dates it');
  const deed = ['investigate', 'order', 'proceed'].includes(a.code);
  ok(e.form === (deed ? 'deed' : 'word') && (deed ? !e.clip && !e.say : !!e.clip), d.id + ' act ' + i + (deed ? ' done, not read' : ' said, and read'));
  if (deed) ok(e.force === (a.compels ? 2 : ['public body', 'legislature'].includes(d.kind) ? 1 : 0), d.id + ' act ' + i + ' front as strong as its force (' + e.force + ')');
}
ok(O.seq.every((e, k) => k === 0 || O.seq[k - 1].when <= e.when), 'the acts come in the order of their dates');
ok(O.seq.filter((e) => e.public).map((e) => [e.door, e.when]).join() === 'E-HF,2026-07-16,W-RES,2026-09-04', 'the two first public accounts');
const silent = DOORS.filter((d) => !d.acts.length);
ok(silent.length === 1 && silent[0].id === 'E-FBI' && O.seq.some((e) => e.kind === 'silence' && e.door === 'E-FBI' && e.when === silent[0].received.date), 'the one door told and silent: an open line on its day');
for (const d of DOORS) {
  const o = O.doors.find((x) => x.id === d.id);
  ok(o && o.line === (d.named_in_94[0] || null) && (!o.line || D.lines.some((l) => l.id === o.line)), d.id + ' acts from the first line study 94 names for it, or from beyond the rim');
}
const rimO = O.doors.filter((d) => !d.line).sort((a, b) => a.rim_order - b.rim_order);
const firstOf = (id) => { const ds = DOORS.find((d) => d.id === id).acts.map((a) => a.date).filter(Boolean).sort(); return ds[0]; };
ok(rimO.every((d, k) => k === 0 || firstOf(rimO[k - 1].id) <= firstOf(d.id)) && rimO.length === 13 && same(rimO.slice(-2).map((d) => d.id), ['E-GOV', 'E-GOVOPS']), 'beyond the rim: thirteen doors, in the order they first acted, the Governor and his agency last');
// what each reason answered: the Atelier's log, matched by its words
const asked = AT.reasons.filter((r) => r.asked !== 'none');
const askedHere = oActs.filter((e) => e.asked);
ok(askedHere.length === 4 && same(askedHere.map((e) => [e.door, e.asked]), [['E-OES', 'a hearing'], ['E-MAKER', "a law's report"], ['E-MAKER', 'an executive order'], ['E-GOVOPS', 'an executive order']]), 'four reasons answered what asked for them: a hearing, a report a law requires, the Governor\'s order twice');
ok(R97.studio_case.holds && same(R97.studio_case.checked.map((c) => c.in_96), ['act', 'act', 'note', 'not coded', 'not coded']) && RS97['studio.checked'] === 5, 'this work\'s case of 27 November, as the Field checked it: two acts, one note, two not coded; it holds');
// matched as the build matched them: forty characters or more of the Field's passage stand in the Atelier's, word for word
const plain = (x) => x.replace(/[\u201c\u201d]/g, '"').replace(/[\u2018\u2019]/g, "'");   // the two files set their quotation marks differently
const shares = (x, y) => { x = plain(x); y = plain(y); for (let i = 0; i + 40 <= x.length; i++) if (y.includes(x.slice(i, i + 40))) return true; return false; };
for (const e of askedHere) ok(asked.some((r) => r.asked === e.asked && r.asked_passage === e.asked_passage && shares(e.quote, r.passage)), e.door + ' asked: as the Atelier logged it');
const rimIds = new Set(rimO.map((d) => d.id));
const force = fieldActs.filter((x) => ['public body', 'legislature'].includes(x.d.kind) && ['investigate', 'order', 'proceed'].includes(x.a.code));
const fig2 = {
  acts: fieldActs.length,
  words: fieldActs.filter((x) => !['investigate', 'order', 'proceed'].includes(x.a.code)).length,
  deeds: fieldActs.filter((x) => ['investigate', 'order', 'proceed'].includes(x.a.code)).length,
  choice: fieldActs.filter((x) => x.a.owed === 'choice').length,
  duty: fieldActs.filter((x) => /duty/.test(x.a.owed)).length,
  power: fieldActs.filter((x) => x.a.owed === 'power').length,
  other_law: fieldActs.filter((x) => x.a.owed === 'other law').length,
  on_lines: DOORS.filter((d) => d.named_in_94.length).length,
  rim: DOORS.filter((d) => !d.named_in_94.length).length,
  force: force.length,
  answers: fieldActs.filter((x) => x.a.code === 'acknowledge').length,
  silent: silent.length,
  first_after: DOORS.filter((d) => ['public body', 'legislature'].includes(d.kind) && (d.acts.some((a) => a.date) || d.first_act_through_coalition)).length,
  undated: fieldActs.filter((x) => !x.a.date).length,
};
const R96 = await pinned('results96');
ok(fig2.choice === R96.k['owed.choice'] + RS97['owed.choice.added'] && fig2.duty === RS97['owed.duty'] && fig2.power === R96.k['owed.power'] && fig2.other_law === RS97['owed.other_law'] && fig2.force === RS97['force.bodies'] && fieldActs.filter((x) => x.a.compels).length === RS97.compels && fieldActs.length === RS97.acts,
  'the Field\'s own results of reading 97: ' + [fig2.choice, fig2.duty, fig2.power, fig2.other_law, fig2.force].join(', '));
ok(fieldActs.filter((x) => x.a.compels).every((x) => !['power', 'receiver duty'].includes(x.a.owed)) && R96.k['compels.under_ai'] === 0 && RS97['compels.added'] === 0, 'none of the three that compel was done under a text on AI');
ok(force.filter((x) => rimIds.has(x.d.id)).length === 9, 'nine deeds of force from beyond the rim (eight, and the Governor\'s order)');
const fsa = Object.fromEntries(Object.entries(R96.first_seen_after).filter(([, v]) => v !== null));
fsa['E-GOV'] = RS97['P162.gov']; fsa['E-GOVOPS'] = RS97['P162.govops'];
ok(same(Object.keys(O.counts.first_seen_after).sort(), Object.keys(fsa).sort()) && Object.entries(fsa).every(([k, v]) => O.counts.first_seen_after[k] === v) && Object.values(fsa).every((v) => v > 0),
  'every public body and legislature first seen acting only after the public knew, by the Field\'s own count: ' + Object.values(fsa).sort((a, b) => a - b).join(', '));
ok(O.counts.first_seen_after['E-AL'] === 18 && O.counts.first_through_coalition['E-AL'] === 'E-AGS' && C96.doors.find((d) => d.id === 'E-AL').first_act_through_coalition.date === '2026-08-03', 'Alabama first seen on the letter it signed, 18 days after (the second reader\'s correction)');
ok(DOORS.filter((d) => d.acts.length).length === O.counts.doors_with_acts && O.counts.doors_with_acts === RS97.doors_with_acts, 'the acts at nineteen doors');
ok(DOORS.filter((d) => d.kind === 'public body').every((d) => d.acts.filter((a) => a.date).every((a) => days(a.date, CASES[d.case].first_public) > 0)), 'every dated act of a public body came after the public knew');
const clockAct = fieldActs.find((x) => x.a.deadline);
ok(clockAct && clockAct.a.deadline.due === '2026-11-16' && DOORS.find((d) => d.id === clockAct.a.deadline.on).acts.some((a) => a.date === '2026-11-16' && /Executive Order N-9-26/.test(a.basis || '')) && RS97['clock.receiver_set'] === 1 && RS97['clock.receiver_met'] === 1 && O.counts.clock.due === '2026-11-16',
  'the one clock a text in the record sets a public body: the order\'s, met on the day');
ok(fieldActs.filter((x) => x.a.code === 'acknowledge').map((x) => x.d.id).join() === 'E-HF,E-OES', 'the two the Field codes as answers: the harmed company, and Cal OES');
ok(/portal issues on filing/.test(fieldActs.find((x) => x.d.id === 'E-OES' && x.a.code === 'acknowledge').a.doubt), 'Cal OES\'s: a number its portal issues on filing');
const HB = JSON.parse(readFileSync(new URL('./hear_back.json', import.meta.url), 'utf8'));
ok(HB.readings === 44 && HB.passed === 44 && same(O.heard_back, { readings: 44, passed: 44, threshold: 0.85 }), 'every reading heard back at 0.85 or better (' + HB.passed + ' of ' + HB.readings + ')');
for (const e of O.seq) if (e.kind === 'act' && e.form === 'word') ok(!!e.clip && existsSync(new URL('./' + e.clip, import.meta.url)) && e.env && e.env.length > 10, 'reading ' + e.n + ' present with its loudness');
// the Field's check moved one code of study 94: the page carries it
const C96codes = await pinned('codes96');
const moved = C96codes.decisions.filter((d) => d.moves);
ok(moved.length === 1 && moved[0].signal === 'PC3' && D.lines.find((l) => l.id === 'PC3').acts.pass_on.v === 'none', 'PC3: no duty to pass the word on, as the Field\'s check moved it');
ok(R.filter((r) => /\b(public|users)\b/.test(r.sender)).length === 5, 'five channels take word from the public or from users');

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
// the phone while its lines start one after another: one name at a time, seen from California's end, 9-1-1 near the thumb
const N = narrow.p;
await N.waitForTimeout(Math.max(0, (25 - await N.evaluate(() => window.__ringback.t())) * 1000));
const nf = await N.evaluate(() => ({ fresh: [...document.querySelectorAll('.fresh')].filter((e) => !e.hidden).length,
  ringing: window.__ringback.lines().filter((l) => l.st === 'ringing').length, cam: window.__ringback.camera(),
  p911: window.__ringback.project('911'), h: document.querySelector('canvas').height }));
ok(nf.ringing >= 3 && nf.fresh <= 1, '390 px: the lines name themselves one at a time (' + nf.fresh + ' named, ' + nf.ringing + ' ringing)');
ok(Math.abs(nf.cam.yaw - Math.PI / 2) < 1e-9, '390 px: the field seen from California\'s end');
ok(nf.p911 && nf.p911[1] > nf.h / 2, '390 px: 9-1-1 in the lower half, near the thumb (' + (nf.p911 && Math.round(nf.p911[1])) + ' of ' + nf.h + ')');
await wide.p.waitForTimeout(Math.max(0, (49 - await wide.p.evaluate(() => window.__ringback.t())) * 1000));

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
// the check written into the page: every number in it read from the page and recounted from the Field's and the Atelier's files
const nothing = pub.filter((r) => ACTS.every((a) => r.acts[a].v === 'none')).length;
// the box of 27 November keeps the check's figures, recounted here from the Field's check alone (study 96)
const acts96 = C96.doors.flatMap((d) => d.acts.map((a) => ({ d, a }))), isDeed = (x) => ['investigate', 'order', 'proceed'].includes(x.a.code);
const force96 = acts96.filter((x) => isDeed(x) && ['public body', 'legislature'].includes(x.d.kind));
const cbox = { 'c-acts': acts96.length, 'c-acts2': acts96.length, 'c-acts3': acts96.length, 'c-added': R96.k.added, 'c-corrected': R96.k.corrected,
  'c-removed': R96.k.removed, 'c-choice': R96.k['owed.choice'], 'c-deeds': acts96.filter(isDeed).length, 'c-force': force96.length,
  'c-rimforce': force96.filter((x) => !x.d.named_in_94.length).length,
  'c-compels': R96.k.compels, 'c-nothing': nothing, 'c-nothing-was': nothing - 1, 'c-public-send': R.filter((r) => /\b(public|users)\b/.test(r.sender)).length,
  'c-lines': R.length, 'c-at-reasons': AT.counts.reasons, 'c-at-asked': AT.counts.reasons_answering_a_demand,
  'c-first': Object.values(R96.first_seen_after).filter((v) => v !== null).sort((a, b) => a - b).join(', ') };
for (const [k, v] of Object.entries(cbox)) ok(spans[k] === String(v), 'the check of 27 November, ' + k + ': page ' + spans[k] + ', recounted ' + v);
// the box of the presentation: every number read from the page and recounted from the Field's reading 97
const cells = R97.cells, pre = cells.filter((c) => R97.words[c.word].before), dbtPre = pre.filter((c) => c.code === 'in doubt');
const dues = dbtPre.map((c) => c.due_if_set_off).filter(Boolean).sort();
const longDay = (iso) => +iso.slice(8) + ' ' + ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'][+iso.slice(5, 7) - 1] + ' ' + iso.slice(0, 4);
const pbox = { 'p-words': Object.keys(R97.words).length, 'p-duties': Object.keys(R97.duties).length, 'p-agree': RS97['B97.agree'], 'p-cells': RS97['B97.cells'],
  'p-kappa': RS97['B97.kappa'], 'p-met': pre.filter((c) => c.code === 'met').length, 'p-cells-before': pre.length,
  'p-notmet': pre.filter((c) => c.code === 'not met').length, 'p-doubt': dbtPre.length, 'p-threads': cells.filter((c) => c.code === 'in doubt').length,
  'p-sender': dbtPre.filter((c) => c.conditions.some((x) => x.who === 'the sender')).length,
  'p-body': dbtPre.filter((c) => c.conditions.some((x) => ['a public body', 'a court'].includes(x.who))).length === 0 ? 'none' : 'some',
  'p-due': longDay(dues[0]), 'p-due-days': days('2026-07-08', dues[0]), 'p-d96': (await pinned('duties96')).cells.length,
  'p-acts96': R96.k.acts, 'p-acts': fieldActs.length, 'p-doors': DOORS.length, 'p-added': RS97['A97.added'], 'p-newdoors': RS97['A97.new_doors'],
  'p-clock': longDay(clockAct.a.deadline.due), 'p-gov': RS97['P162.gov'], 'p-govops': RS97['P162.govops'],
  'p-heard': HB.passed + ' of ' + HB.readings + ' spoken passages at 0.85 or better' };
for (const [k, v] of Object.entries(pbox)) ok(spans[k] === String(v), 'the presentation, ' + k + ': page ' + spans[k] + ', recounted ' + v);
ok(pbox['p-met'] === RS97['pre.met'] && pbox['p-doubt'] === RS97['pre.in_doubt'] && pbox['p-notmet'] === RS97['pre.not_met'] && pbox['p-sender'] === RS97['pre.doubt.any_sender'] &&
  dbtPre.every((c) => c.conditions.some((x) => x.who === 'not said')) && dues[0] === RS97['pre.earliest_due'] && pbox['p-due-days'] === RS97['pre.earliest_due_before_escape_days'],
  'the maker\'s door, as the Field\'s own results have it: 0 met, 6 in doubt, every doubt on a term no text names anyone to settle');
ok(await P.evaluate(() => /^Presented · state 4 of 4 · 28 November 2026/.test(document.querySelector('.wip').textContent)), 'the face says it is presented');
ok(AT.reasons.length === AT.counts.reasons && asked.length === AT.counts.reasons_answering_a_demand, 'the Atelier\'s five of eight, counted again from its reasons');
ok(await P.evaluate(() => document.querySelectorAll('#second-reader li').length) === 7, 'the second reader\'s findings stand in the page');
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
await P.evaluate(() => document.querySelector('#close').click());

// state 3, in real time with sound: the first deed struck, its front on its second; then a reading heard on its second
const FW = { 2: 'done, and it compels', 1: 'done by a public body or a legislator; it does not compel', 0: 'done, not said' };
const seq0 = await P.evaluate(() => window.__ringback.overheard());
const words = O.seq.filter((e) => e.form === 'word').map((e) => e.n);
ok(seq0.filter((e) => words.includes(e.n)).every((e) => e.buf) && seq0.filter((e) => e.buf).length === words.length, 'every reading decoded in the page (' + seq0.filter((e) => e.buf).length + ')');
const d1 = seq0.find((e) => e.n === 2);
await P.waitForTimeout(Math.max(0, (d1.t + 2.0 - await P.evaluate(() => window.__ringback.t())) * 1000));
const s0 = await P.evaluate((t) => ({ struck: window.__ringback.deedStruck(), fronts: window.__ringback.fronts(t), form: document.querySelector('#heard').dataset.form,
  n: document.querySelector('#heard').dataset.n, dw: (document.querySelector('#heard .dw') || {}).textContent, q: !!document.querySelector('#heard q'),
  who: document.querySelector('#heard .who').textContent }), d1.t + 0.5);
ok(s0.struck.includes(2) && s0.fronts.some((f) => f.n === 2 && f.force === 0 && f.launch !== null), 'entry 2, the first deed: struck on the audio clock and sent through the ground (' + JSON.stringify(s0.fronts) + ')');
ok(s0.n === '2' && s0.form === 'deed' && s0.dw === O.seq[1].quote && !s0.q && s0.who.includes('(' + FW[0] + ')'), 'entry 2 written, not read: ' + JSON.stringify(s0).slice(0, 400));
const ins0 = await P.evaluate(() => window.__ringback.inside());
ok(ins0.length === 5 && ins0[0].n === 1 && ins0[0].played && ins0.every((x) => x.line === 'COP5'), 'entry 1, the first word to reach the maker: its own line rang inside, on the audio clock');
const w8 = seq0.find((e) => e.n === 10);
await P.evaluate((d) => window.__ringback.advance(d), w8.t - 1.5 - await P.evaluate(() => window.__ringback.t()));
await P.waitForTimeout(2600);
const s1 = await P.evaluate(() => ({ seq: window.__ringback.overheard().find((e) => e.n === 10), active: window.__ringback.active(),
  heard: document.querySelector('#heard').dataset.n, q: document.querySelector('#heard q') && document.querySelector('#heard q').textContent }));
ok(s1.seq.sched && s1.seq.playing && s1.active.includes(10) && s1.heard === '10' && s1.q === O.seq.find((e) => e.n === 10).quote,
  'entry 10, the first act that is said: heard and shown on its second, in real time (' + JSON.stringify(s1).slice(0, 160) + ')');
// the call kept up when the page is hidden: ten minutes of rings handed to the audio clock, and the title counts
await P.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'hidden', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
const ahead = await P.evaluate(() => window.__ringback.ahead());
ok(ahead > 590, 'hidden: every ringing line scheduled ' + Math.round(ahead) + ' s ahead');
ok(/^19 ringing · .* · RINGBACK$/.test(await P.evaluate(() => document.title)), 'the tab\'s title keeps the count: ' + await P.evaluate(() => document.title));
await P.evaluate(() => { Object.defineProperty(document, 'visibilityState', { value: 'visible', configurable: true }); document.dispatchEvent(new Event('visibilitychange')); });
await P.waitForTimeout(400);
ok(/you were away .*; 19 rang on, nobody picked up/.test(await P.evaluate(() => (document.querySelector('#status [data-k="away"]') || {}).textContent || '')), 'back on the page: the away note');

// the narrow page: no sideways scroll, the field there, a panel that fits
ok(await N.evaluate(() => document.documentElement.scrollWidth <= 390), '390 px: no sideways scroll');
ok((await N.evaluate(() => window.__ringback.lines())).filter((l) => l.st === 'ringing').length === 19, '390 px: all nineteen ring');
await N.evaluate(() => window.__ringback.select('CA4')); await N.waitForTimeout(300);
const box = await N.evaluate(() => { const r = document.querySelector('#panel').getBoundingClientRect(); return [r.left, r.right]; });
ok(box[0] >= 0 && box[1] <= 390, '390 px: the panel fits');
// the quiet page runs on alone from here, so that the software renderer of a headless check draws its wave as fast as it can
await wide.p.close(); await N.close();
// state 3, quiet, its clock moved forward act by act: opened only now, since the first word now comes in with the first entry,
// 55 s after the start, sooner than the checks above are done
const quiet = await run(1100, 820, false);
const Q = quiet.p;
const qseq = await Q.evaluate(() => window.__ringback.overheard());
const T = Object.fromEntries(qseq.map((e) => [e.n, e.t]));
const endT = await Q.evaluate(() => window.__ringback.hearEnd());
// the public's light: dark until the first public account, half lit after it, lit after both, and it stays
const glowAt = (t) => Q.evaluate((x) => window.__ringback.glow(x), t);
const PUB = O.seq.filter((e) => e.public).map((e) => e.n);
const g = [await glowAt(T[2]), await glowAt(T[PUB[0]] - 0.01), await glowAt(T[PUB[1]] - 0.01), await glowAt(T[PUB[1]] + 30), await glowAt(endT + 600)];
ok(g[0] === 0 && g[1] === 0 && g[2] > 0.49 && g[2] < 0.56 && g[3] > 0.99 && g[4] > 0.99, 'the world beyond the field: dark, then half lit, then lit, and it stays (' + g.map((x) => x.toFixed(2)).join(', ') + ')');
const go = async (n, into) => { const t = await Q.evaluate(() => window.__ringback.t()); ok(T[n] + into > t, n + ' still ahead of the clock'); await Q.evaluate((d) => window.__ringback.advance(d), Math.max(0, T[n] + into - t)); await Q.waitForTimeout(500); };
const ids = [...D.lines.map((l) => l.id), ...rimO.map((d) => d.id)];
async function shakes(n, ms) {
  const first = {}, max = {}; const t0 = Date.now(); let r0 = null, r1 = null;
  while (Date.now() - t0 < ms && !(r1 && r1[0] > 2.6)) {
    const s = await Q.evaluate(([n, ids]) => ({ r: window.__ringback.reach(n), f: ids.map((id) => window.__ringback.shake(id, undefined, n)[2]) }), [n, ids]);
    if (r0 === null) r0 = [s.r, Date.now()]; r1 = [s.r, Date.now()];
    s.f.forEach((f, i) => { max[ids[i]] = Math.max(max[ids[i]] || 0, f); if (f > 0.02 && first[ids[i]] === undefined) first[ids[i]] = Date.now() - t0; });
    await Q.waitForTimeout(90);
  }
  const shook = Object.keys(max).filter((id) => max[id] > 0.05), ft = shook.map((id) => first[id]).filter((x) => x !== undefined);
  return { shook: shook.length, sum: Object.values(max).reduce((a, b) => a + b, 0), spread: ft.length ? Math.max(...ft) - Math.min(...ft) : 0, rate: (r1[0] - r0[0]) / Math.max(0.001, (r1[1] - r0[1]) / 1000) };
}
const ddExp = (e) => { const n = e.days;
  if (e.bound === 'by' && e.kind === 'act') return n < 0 ? 'before the public knew' : n === 0 ? 'by the day the public knew' : `by ${n} day${n === 1 ? '' : 's'} after the public knew`;
  return n < 0 ? `${-n} days before the public knew` : n === 0 ? 'the day the public knew' : `${n} day${n === 1 ? '' : 's'} after the public knew`; };
const SH = {};
const SUB = { al: O.seq.find((e) => e.door === 'E-AL' && e.force === 2).n, mod: O.seq.find((e) => e.door === 'W-MOD' && e.when === '2026-09-04' && e.force === 0).n,
  ca: O.seq.find((e) => e.door === 'E-CAAG' && e.force === 2).n };
ok(SUB.al === 47 && SUB.mod === 50 && SUB.ca === 73, 'the subpoenas and the moderator\'s deed where they stand in the sequence: ' + JSON.stringify(SUB));
const INS = O.seq.filter((e) => e.kind === 'inside').map((e) => e.n);
for (const n of [1, 2, 8, 10, 11, 18, 21, 22, 24, 26, 34, 46, 47, 50, 54, 57, 60, 62, 65, 69, 70, 72, 73, 77, 82, 83, 84, 87]) {
  const e = O.seq.find((x) => x.n === n), d = O.doors.find((x) => x.id === e.door);
  await go(n, e.kind === 'inside' ? 1.0 : e.form === 'deed' ? 0.4 : Math.min(1.0, e.dur / 2));
  const r = await Q.evaluate(([id, into]) => ({ active: window.__ringback.active(), heardN: document.querySelector('#heard').dataset.n, form: document.querySelector('#heard').dataset.form,
    q: (document.querySelector('#heard q') || {}).textContent || '', dw: (document.querySelector('#heard .dw') || {}).textContent || '',
    who: document.querySelector('#heard .who').textContent, lamp: window.__ringback.lamp(id), fronts: window.__ringback.fronts(into),
    heard: (document.querySelector('#status [data-k="heard"]') || {}).textContent }), [d.line || d.id, T[n] + 0.5]);
  ok(r.active.includes(n) && r.heardN === String(n), n + ' comes in on its turn');
  if (e.kind === 'silence') ok(r.q === '' && r.dw === '' && /no act of it is in the record/.test(r.who), n + ' an open line, and nothing on it');
  else if (e.kind === 'inside') {
    const dbt = e.cells.filter((c) => c.code === 'in doubt');
    ok(r.form === 'inside' && r.q === e.quote && r.who.includes('word of its own machine reached it') && r.who.includes(dbt.length ? dbt.length + ' in doubt' : 'none plainly set off') && dbt.every((c) => !c.due || r.who.includes('due by ')),
      n + ' a word that reached the maker: its report\'s passage, and its duties in doubt: ' + r.who.slice(-120));
    ok(await Q.evaluate((n) => window.__ringback.insideAt(n) > 0 || window.__ringback.insideAt(n, window.__ringback.t() - 0.55) > 0 || window.__ringback.insideAt(n, window.__ringback.t() + 0.45) > 0, n), n + ' the maker\'s line rings inside');
  }
  else if (e.form === 'deed') ok(r.form === 'deed' && r.dw === e.quote && r.q === '' && r.fronts.some((f) => f.n === n && f.force === e.force), n + ' a deed: its passage written, not read, and its front in the ground');
  else ok(r.form === 'word' && r.q === e.quote, n + ' said: its passage, word for word');
  if (e.kind === 'act') {
    const owed = O.owed[e.owed] + (e.asked_words ? ', but ' + e.asked_words : '');
    if (e.check === 'added, reading 97') ok(fieldActs.some((x) => x.d.id === e.door && x.a.quote === e.quote && x.a.check === 'added, reading 97'), n + ' added by the Field\'s reading 97, on this work\'s case');
    ok(r.who.includes(ddExp(e)) && r.who.includes(O.does[e.code]) && r.who.includes(owed) && (e.form !== 'deed' || r.who.includes('(' + FW[e.force] + ')')), n + ' who, when, what, what owed it: ' + r.who.slice(0, 110));
    if (!e.dated) ok(r.who.includes('undated, by '), n + ' undated, shown by the day of the source that first shows it');
  }
  ok(r.lamp[1] === 3, n + ' the light of ' + (d.line || d.id) + ' speaks');
  ok(+(r.heard || 0) === O.seq.filter((x) => x.kind === 'act' && x.n <= n).length, n + ' status: overheard ' + r.heard);
  if (e.public) ok(await Q.evaluate(() => window.__ringback.glow()) > 0.3, n + ' the world beyond the field lights up');
  if ([SUB.al, SUB.mod, SUB.ca].includes(n)) SH[n] = await shakes(n, 14000);
  if (n === 11 || n === 26) {
    // the threads: those of every word so far are drawn, none has arrived or gone, and those whose day has passed are grey
    const th = await Q.evaluate(() => window.__ringback.threads());
    const tnow = await Q.evaluate(() => window.__ringback.t());
    const want = th.filter((x) => x.born <= tnow);
    ok(want.length === O.seq.filter((x) => x.kind === 'inside' && x.n <= n - (tnow < T[n] + 5.2 ? 1 : 0)).flatMap((x) => x.cells).filter((c) => c.code === 'in doubt').length && want.every((x) => x.drawn),
      n + ' threads drawn for every duty in doubt so far: ' + want.length);
    ok(want.every((x) => x.past === (x.dueAt !== null && tnow >= x.dueAt)), n + ' a thread turns grey once the record has passed its day');
  }
}
console.log('fronts', JSON.stringify(SH));
ok(SH[SUB.al].shook >= 6 && SH[SUB.al].spread > 300, 'the subpoena from beyond the rim crosses the field: ' + SH[SUB.al].shook + ' lights shake, the last ' + SH[SUB.al].spread + ' ms after the first');
ok(SH[SUB.ca].shook >= 6 && SH[SUB.ca].spread > 300, 'California\'s subpoena from its line: ' + SH[SUB.ca].shook + ' lights shake, the last ' + SH[SUB.ca].spread + ' ms after the first');
ok(SH[SUB.mod].shook < SH[SUB.al].shook && SH[SUB.mod].sum < SH[SUB.al].sum / 2, 'a deed done unasked shakes fewer lights, and less, than one that compels (' + SH[SUB.mod].shook + ' against ' + SH[SUB.al].shook + ')');
// the end, in the form: nothing more comes in, the doors that acted stay lit as strong as their strongest deed, the lines ring on
await Q.evaluate((d) => window.__ringback.advance(d), endT - await Q.evaluate(() => window.__ringback.t()) + 0.5); await Q.waitForTimeout(800);
const rimExp = (id) => 0.22 + 0.16 * Math.max(0, ...O.seq.filter((e) => e.door === id && e.form === 'deed').map((e) => e.force + 1));
const fin = await Q.evaluate((ids) => ({ hidden: document.querySelector('#heard').hidden, n: document.querySelector('#heard').dataset.n,
  endEl: !!document.querySelector('[data-k="end"]'), status: document.querySelector('#status').textContent, rehear: !document.querySelector('#rehear').hidden,
  ended: window.__ringback.ended(), ringing: window.__ringback.lines().filter((l) => l.st === 'ringing').length,
  rim: ids.map((id) => window.__ringback.lamp(id)[0]) }), rimO.map((d) => d.id));
ok(fin.hidden && fin.n === 'end' && !fin.endEl && fin.ended, 'the record ends in the form: no caption, no paragraph of totals');
ok(fin.status.includes('the record ended; 81 of 81 acts, none to you'), 'status at the end: ' + fin.status.slice(-60));
// the end: every thread still there, none settled, the ones with a day grey
const thEnd = await Q.evaluate(() => window.__ringback.threads()), pix = await Q.evaluate(() => window.__ringback.threadPixels());
ok(thEnd.length === 9 && thEnd.every((x) => x.drawn && x.grow === 1) && thEnd.filter((x) => x.past).length === 8 && thEnd.filter((x) => !x.past).map((x) => x.duty).join() === 'EU4',
  'at the end the nine threads stay, eight grey past their day, the AI Act\'s, with no day, still pale');
ok(pix > 400, 'the threads are drawn on the page (' + pix + ' pixels)');
ok(same(thEnd.map((x) => x.to).sort(), ['CA4', 'CA4', 'CA4', 'CA4', 'COP3', 'COP3', 'COP3', 'COP3', 'EU4']) && thEnd.every((x) => x.from === 'COP5'), 'the threads run from the maker\'s light to the AI Office and California\'s office');
ok(fin.rehear && fin.ringing === 19, 'overhear it again; the nineteen ring on alone');
ok(rimO.every((d, k) => Math.abs(fin.rim[k] - rimExp(d.id)) < 0.005), 'beyond the rim, every door lit as strong as its strongest deed: ' + rimO.map((d, k) => d.id + ' ' + fin.rim[k].toFixed(2)).join(', '));
ok(fin.rim[rimO.findIndex((d) => d.id === 'E-AL')] === Math.max(...fin.rim), 'Alabama, whose subpoena compels, stands brightest beyond the rim');
// the maker's panel: its door, the word-and-duty cells, the duty cells of the Field's check
await Q.evaluate(() => window.__ringback.select('COP5')); await Q.waitForTimeout(300);
const mp = await Q.evaluate(() => ({ door: (document.querySelector('#panelBody [data-k="maker-door"]') || {}).textContent || '', cells: [...document.querySelectorAll('#panelBody table.cells tr')].map((tr) => [tr.dataset.duty, tr.dataset.code]),
  d96: [...document.querySelectorAll('#panelBody tr[data-case]')].map((tr) => [tr.dataset.case, tr.dataset.code]), d96t: (document.querySelector('#panelBody [data-k="duties96"]') || {}).textContent || '' }));
const D96 = (await pinned('duties96')).cells;
ok(same(mp.cells, O.seq.filter((e) => e.kind === 'inside').flatMap((e) => e.cells.map((c) => [c.duty, c.code]))) && same(mp.cells, Object.keys(R97.words).flatMap((w) => R97.cells.filter((c) => c.word === w).map((c) => [c.duty, c.code]))),
  'the maker\'s panel: all ' + mp.cells.length + ' word-and-duty cells, as the Field coded them');
ok(same(mp.d96, D96.map((c) => [c.case, c.code])) && mp.d96t.includes(D96.filter((c) => c.code === 'unknowable').length + ' cannot be read') && !D96.some((c) => c.code === 'met'), 'the maker\'s panel: the ' + D96.length + ' duty cells of the Field\'s check, none met');
ok(mp.door.includes('of those 12, none is plainly set off, 6 plainly are not, and 6 are in doubt') && mp.door.includes('31 May 2026, 38 days'), 'the maker\'s door in its panel: ' + mp.door.slice(0, 120));
for (const id of ['COP3', 'CA4', 'EU4']) {
  await Q.evaluate((x) => window.__ringback.select(x), id); await Q.waitForTimeout(200);
  const tn = await Q.evaluate(() => { const e = document.querySelector('#panelBody [data-k="threads-in"]'); return e ? +e.dataset.n : 0; });
  ok(tn === thEnd.filter((x) => x.to === id).length, id + ' panel: the threads from the maker that end here (' + tn + ')');
}
await Q.evaluate(() => document.querySelector('#close').click());
for (const id of ['CA4', 'CA5', 'CA7', 'EU4', 'COP5']) {
  await Q.evaluate((x) => window.__ringback.select(x), id); await Q.waitForTimeout(250);
  const rows = await Q.evaluate(() => [...document.querySelectorAll('#panelBody tr[data-n]')].map((tr) => +tr.dataset.n));
  const want = O.seq.filter((e) => O.doors.find((d) => d.id === e.door).line === id).map((e) => e.n);
  ok(same(rows, want) && want.length > 0, id + ' panel: what was overheard on its line (' + rows.length + ')');
}
await Q.evaluate(() => window.__ringback.select('E-AGS')); await Q.waitForTimeout(250);
ok(await Q.evaluate(() => !!document.querySelector('#panelBody [data-k="rim"]') && document.querySelectorAll('#panelBody tr[data-n]').length === 3), 'E-AGS panel: not called, and its three acts');
await Q.evaluate(() => window.__ringback.select('E-GOVOPS')); await Q.waitForTimeout(250);
ok(await Q.evaluate(() => !!document.querySelector('#panelBody [data-k="rim"]') && document.querySelectorAll('#panelBody tr[data-n]').length === 3 && /reading 97/.test(document.querySelector('#panelBody').textContent)), 'the Governor\'s agency\'s panel: not called, its three acts, added by the Field\'s reading 97');
await Q.evaluate(() => document.querySelector('#close').click());
const pageFigs2 = await Q.evaluate(() => Object.fromEntries([...document.querySelectorAll('#figs2 b[data-fig2]')].map((e) => [e.dataset.fig2, +e.textContent])));
fig2.inside = Object.keys(R97.words).length; fig2.threads = R97.cells.filter((c) => c.code === 'in doubt').length;
for (const [k, v] of Object.entries(fig2)) ok(pageFigs2[k] === v, 'figure ' + k + ': page ' + pageFigs2[k] + ', Field ' + v);
ok(Object.keys(pageFigs2).length === Object.keys(fig2).length, 'no figure of what is overheard left unrecounted');

if (shot) {
  // the process shot: the quiet page, the ground filled, the maker's door after its third word, before the deed: six
  // threads of doubt from the maker's light, the first four grey past their day
  const qs = await b.newPage({ viewport: { width: 1100, height: 820 } });
  await qs.goto(url); await qs.waitForTimeout(500); await qs.click('#goQuiet'); await qs.waitForTimeout(1500);
  const t11 = (await qs.evaluate(() => window.__ringback.overheard())).find((x) => x.n === 11).t;
  await qs.evaluate((d) => window.__ringback.advance(d), t11 - 14 - await qs.evaluate(() => window.__ringback.t()));
  await qs.waitForTimeout(Math.max(0, (t11 + 8.6 - await qs.evaluate(() => window.__ringback.t())) * 1000));
  await qs.screenshot({ path: shot }); console.log('shot', shot, 'after the third word that reached the maker, its threads drawn');
}


const errs = [...wide.errs, ...narrow.errs, ...quiet.errs].filter((m) => !/GPU stall/.test(m));
ok(errs.length === 0, 'no page errors: ' + errs.slice(0, 3).join(' | '));
await b.close();
console.log(`${pass} checks pass` + (fails.length ? `, ${fails.length} fail:\n  ` + fails.join('\n  ') : ''));
process.exit(fails.length ? 1 : 0);
