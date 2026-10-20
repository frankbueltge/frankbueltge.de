// FILED UNDER, coda: written nine times (session 182). The clock hand: a writing is filed knowing only what had
// come by the hour it was written; the record of each week opens only once the hand has passed its end.
(() => {
const $ = s => document.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';
const el = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
const pct = p => p >= .995 ? '>99%' : p < .005 ? '<1%' : Math.round(p * 100) + '%';
const hrs = h => h < 1 ? Math.round(h * 60) + ' min' : h < 48 ? h.toFixed(1) + ' h' : (h / 24).toFixed(h < 240 ? 1 : 0) + ' days';
const RULE = L => L === 0 ? 'the first writing' : L < 168 ? `the newest at ${L} h` : `the newest at ${L / 24} days`;
const LS = 'filed-under-coda-nine-v1';
let book = {};
try { book = JSON.parse(localStorage.getItem(LS) || '{}'); } catch (e) { book = {}; }
const save = () => { try { localStorage.setItem(LS, JSON.stringify(book)); } catch (e) {} };
const S = NINE_SUMMARY;
let id = null, W = [], step = 0, hand = 0, filed = [], base = 0, end = 1;
const X0 = 70, X1 = 980, rowH = 26, top = 34;
const H = ms => (ms - base) / 3.6e6;
const x = ms => { const h = Math.max(-0.5, H(ms)); return X0 + (X1 - X0) * Math.log1p(h + 0.5) / Math.log1p(end + 0.5); };

function load(cid) {
  if (!NINE[cid]) { $('#ninebox').hidden = true; return; }
  $('#ninebox').hidden = false; id = cid; W = NINE[cid]; base = W[0].issued;
  end = Math.max(...W.map(w => H(w.t1)));
  filed = (book[id] && book[id].filed) || [];
  step = filed.length; hand = step < W.length ? W[step].issued : Infinity;
  draw(); words();
}
function draw() {
  const s = $('#ninesvg'); s.innerHTML = '';
  const hx = hand === Infinity ? X1 : x(hand);
  for (const [h, t] of [[0, 'first'], [1, '1 h'], [24, '1 day'], [168, '1 week'], [720, '30 days'], [2160, '90 days']]) {
    if (h > end) continue;
    const xx = x(base + h * 3.6e6);
    s.appendChild(el('line', { x1: xx, x2: xx, y1: top - 8, y2: top + 9 * rowH, stroke: 'var(--rule)', 'stroke-dasharray': '2 4' }));
    const tt = el('text', { x: xx, y: top + 9 * rowH + 16, 'text-anchor': 'middle', 'font-size': 12, fill: 'var(--mute)', 'font-family': 'ui-monospace,monospace' }); tt.textContent = t; s.appendChild(tt);
  }
  W.forEach((w, i) => {
    const y = top + i * rowH, same = i > 0 && w.issued === W[i - 1].issued;
    const lab = el('text', { x: X0 - 8, y: y + 12, 'text-anchor': 'end', 'font-size': 11.5, fill: i === step ? 'var(--lit)' : 'var(--mute)', 'font-family': 'ui-monospace,monospace' });
    lab.textContent = w.L === 0 ? '+0' : w.L < 168 ? `+${w.L}h` : `+${w.L / 24}d`; s.appendChild(lab);
    const shut = hand !== Infinity && w.t1 > hand;
    const bar = el('rect', { x: x(w.t0), y: y + 3, width: Math.max(2, x(w.t1) - x(w.t0)), height: 12, rx: 3,
      fill: i === step ? 'var(--lit)' : 'var(--land)', 'fill-opacity': i === step ? .35 : 1, stroke: same ? 'var(--mute)' : 'none', 'stroke-dasharray': '2 2' });
    s.appendChild(bar);
    s.appendChild(el('circle', { cx: x(w.issued), cy: y + 9, r: 3, fill: 'var(--ink)' }));
    const pt = el('text', { x: Math.min(X1 - 2, x(w.t1) + 6), y: y + 13, 'font-size': 11, fill: 'var(--ink)', 'font-family': 'ui-monospace,monospace', 'text-anchor': x(w.t1) + 60 > X1 ? 'end' : 'start' });
    pt.textContent = pct(w.p) + (same ? ' (same writing)' : ''); if (x(w.t1) + 60 > X1) pt.setAttribute('x', x(w.t0) - 6);
    s.appendChild(pt);
    w.ev.forEach(e => { if (e.t < hand) { const d = el('circle', { cx: x(e.t), cy: y + 9, r: 3.2 + Math.max(0, e.m - w.M) * 1.4, fill: 'var(--contra)', 'fill-opacity': .8 }); const ti = el('title', {}); ti.textContent = `M${e.m} ${e.mt}, ${hrs(H(e.t))} after the first writing`; d.appendChild(ti); s.appendChild(d); } });
    if (filed[i]) {
      const v = shut ? 'sealed' : (filed[i] === w.fate ? 'backed' : 'contradicted');
      const m = el('text', { x: 4, y: y + 13, 'font-size': 10.5, 'font-family': 'ui-monospace,monospace', fill: v === 'backed' ? 'var(--backed)' : v === 'contradicted' ? 'var(--contra)' : 'var(--mute)' });
      m.textContent = (filed[i] === 'needed' ? 'N ' : 'NN ') + (v === 'sealed' ? '…' : v === 'backed' ? '✓' : '✗'); s.appendChild(m);
    }
  });
  s.appendChild(el('rect', { x: hx, y: top - 10, width: X1 + 20 - hx, height: 9 * rowH + 12, fill: 'var(--bg)', 'fill-opacity': hand === Infinity ? 0 : .55 }));
  s.appendChild(el('line', { x1: hx, x2: hx, y1: top - 14, y2: top + 9 * rowH + 2, stroke: 'var(--lit)', 'stroke-width': 2 }));
  const ht = el('text', { x: Math.min(hx, X1 - 4), y: top - 18, 'text-anchor': hx > X1 - 120 ? 'end' : 'middle', 'font-size': 11.5, fill: 'var(--lit)', 'font-family': 'ui-monospace,monospace' });
  ht.textContent = hand === Infinity ? 'every week has closed' : `now: ${hrs(H(hand))} after the first writing`; s.appendChild(ht);
}
function words() {
  const done = step >= W.length;
  $('#ninefile').hidden = done; $('#ninerun').hidden = !done || hand === Infinity;
  if (!done) {
    const w = W[step], came = W.flatMap(v => v.ev).filter((e, i, a) => e.t < hand && a.findIndex(f => f.id === e.id) === i).length;
    $('#ninewords').innerHTML = `Writing ${step + 1} of 9, ${RULE(w.L)}: issued ${hrs(w.lag_h)} after the first. The keeper writes <b>${pct(w.p)}</b> for at least one aftershock of M<b>${w.M.toFixed(1)}</b> or larger within ${w.rkm} km, in its own week. ` +
      (came ? `By this hour you can see ${came} that came in the weeks already written.` : 'By this hour nothing at that size has come in any week already written.') + ' Its own week is sealed.';
  } else if (hand !== Infinity) {
    $('#ninewords').innerHTML = 'You have filed all nine writings. Their weeks are still running. Let the clock run to the end of the last week, and the record answers each.';
  } else {
    const ok = W.filter((w, i) => filed[i] === w.fate).length, keeper = W.filter(w => (w.p >= .5) === (w.fate === 'needed')).length;
    const fates = new Set(W.map(w => w.fate)).size > 1;
    $('#ninewords').innerHTML = `The record backs <b>${ok}</b> of your nine filings and contradicts <b>${9 - ok}</b>. Filed by the keeper's own odds (needed at 50% or more) it would back ${keeper}. ` +
      (fates ? 'For this sequence, which writing you read decides whether the warning was needed: some of its weeks had one and some had none.' : `Every one of its nine weeks was ${W[0].fate === 'needed' ? 'needed' : 'never needed'}, so here the choice of writing changes nothing.`) +
      ` Had you read each earlier week whole, as an archive does, ${archive()} of the later weeks would already have shown you their answer.`;
  }
}
function archive() {
  let n = 0; const seen = new Set();
  W.forEach((w, i) => { if (i > 0 && w.issued !== W[i - 1].issued && w.ev.some(e => seen.has(e.id))) n++; w.ev.forEach(e => seen.add(e.id)); });
  return n;
}
function file(d) {
  if (step >= W.length) return;
  filed[step] = d; step++;
  while (step < W.length && W[step].issued === W[step - 1].issued) { filed[step] = d; step++; }
  hand = step < W.length ? W[step].issued : W[W.length - 1].issued + 1;
  book[id] = { filed, at: new Date().toISOString() }; save(); draw(); words();
}
$('#nineN').onclick = () => file('needed');
$('#nineNN').onclick = () => file('never_needed');
$('#ninerun').onclick = () => { hand = Infinity; draw(); words(); };
$('#ninereset').onclick = () => { delete book[id]; save(); load(id); };
document.addEventListener('coda:show', e => load(e.detail));
if (window.__coda) load(window.__coda.cur().id);

// the nine rules over every sequence, stated against what came, at the card's magnitude
(function figure() {
  const s = $('#ninefig'); const P = S.per_lag, mx = Math.max(...P.map(p => p.stated)), y = v => 200 - v / mx * 170, cw = 100;
  P.forEach((p, i) => {
    const cx = 70 + i * cw;
    s.appendChild(el('rect', { x: cx, y: y(p.stated), width: 34, height: 200 - y(p.stated), fill: 'none', stroke: 'var(--mute)', 'stroke-width': 1.2 }));
    s.appendChild(el('rect', { x: cx + 40, y: y(p.came), width: 34, height: 200 - y(p.came), fill: 'var(--contra)', 'fill-opacity': .8 }));
    for (const [v, xx, c] of [[p.stated.toFixed(0), cx + 17, 'var(--mute)'], [p.came, cx + 57, 'var(--contra)']]) { const t = el('text', { x: xx, y: Math.min(y(+v), 196) - 5, 'text-anchor': 'middle', 'font-size': 12, fill: c, 'font-family': 'ui-monospace,monospace' }); t.textContent = v; s.appendChild(t); }
    const l = el('text', { x: cx + 37, y: 220, 'text-anchor': 'middle', 'font-size': 12, fill: 'var(--ink)', 'font-family': 'ui-monospace,monospace' }); l.textContent = p.lag_rule_h === 0 ? 'first' : p.lag_rule_h < 168 ? `${p.lag_rule_h} h` : `${p.lag_rule_h / 24} d`; s.appendChild(l);
    const r = el('text', { x: cx + 37, y: 238, 'text-anchor': 'middle', 'font-size': 11, fill: 'var(--mute)', 'font-family': 'ui-monospace,monospace' }); r.textContent = (p.came / p.stated).toFixed(2); s.appendChild(r);
  });
  s.appendChild(el('line', { x1: 60, x2: 980, y1: 200, y2: 200, stroke: 'var(--rule)' }));
  const a = el('text', { x: 60, y: 16, 'font-size': 12, fill: 'var(--mute)', 'font-family': 'ui-monospace,monospace' }); a.textContent = 'outline: aftershocks the odds add up to · filled: weeks one came · bottom row: came ÷ stated'; s.appendChild(a);
})();
const P = S.per_lag;
$('#ninelede').textContent = `The agency rewrote most forecasts many times. The Field fixed nine rules by the clock alone, before any outcome was read: the first writing, then the newest one at 6, 12, 24, 48 and 96 hours, 7, 14 and 30 days. Every week below was refetched by the Studio. For the card above, file each writing in turn. The hand stops at the hour it was written, and you see only what had come by then.`;
$('#ninefacts').innerHTML = [
  `At the card's magnitude, the first writings stated ${P[0].stated} and ${P[0].came} came, ${(P[0].came / P[0].stated).toFixed(2)} of what was written. From the newest at 6 hours on, the ratio stays between ${Math.min(...P.slice(1).map(p => p.came / p.stated)).toFixed(2)} and ${Math.max(...P.slice(1).map(p => p.came / p.stated)).toFixed(2)}. The Field, pooling every magnitude and with intervals, finds that only the first writing reads too high and every later rule cannot be told from right. The coda keeps one magnitude and has too few weeks to test that on its own; it says only that the first writing stands furthest from what came.`,
  `Read as warnings at 50% or more, ${P[0].warn} stood at the first writing and ${P[1].warn} six hours on. ${P[0].warn - P[0].warn_came} of the first ${P[0].warn} were never needed.`,
  `Of the ${S.sequences_all_nine_closed} sequences with all nine weeks closed, the record says <em>needed</em> in every week for ${S.fate_needed_in_all_nine}, <em>never needed</em> in every week for ${S.fate_never_in_all_nine}, and changes its answer with the writing for ${S.fate_moves_with_writing}. In those ${S.fate_moves_with_writing}, a reader who chooses the writing chooses the verdict. (The Atelier and the Field count 50 of 232. Session 182 put the difference down to pooling magnitudes; session 184 traced it to the floor instead: they read each writing at its own floor, the coda at the card's one magnitude. See <em>two readings</em>, below.)`,
  `In ${S.sequences_where_a_rule_repeats_a_writing} sequences the keeper wrote nothing new between two of the clock's hours, and the rule picks the same writing twice. The page files it once.`,
  `The two clocks. A reader at the hour of writing could already see something inside its week in only ${S.living_already_came_when_written} of ${S.distinct_writings} writings (${S.weeks_begun_before_written} weeks began minutes before they were written, a median of ${Math.round(S.median_hours_week_begun_before_written * 60)} minutes). A reader who opens each earlier week whole, as an archive does, has already seen the answer of ${S.archive_already_shown} of ${S.archive_later_weeks} later writings before filing them.`,
  `Judgment (the Studio's): the record answers every writing, and it answers each one for its own week. What it does not hold is the hour a person read. The hand puts that hour back, and only a reader can supply it.`
].map(f => `<li>${f}</li>`).join('');
window.__nine = { file, load, state: () => ({ id, step, filed: filed.slice(), hand }) };
})();
