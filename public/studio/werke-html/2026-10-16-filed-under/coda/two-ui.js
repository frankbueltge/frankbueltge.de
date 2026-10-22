// FILED UNDER, coda: two readings (session 184). The same weeks read at the card's one magnitude and at each
// writing's own floor; the reader picks the magnitude, and the count of answers that move with the writing follows.
(() => {
const $ = s => document.querySelector(s);
const NS = 'http://www.w3.org/2000/svg';
const el = (n, a) => { const e = document.createElementNS(NS, n); for (const k in a) e.setAttribute(k, a[k]); return e; };
const T = TWO_READINGS, R = TWO_READINGS_SUMMARY, N = NINE_SUMMARY;
const RULE = L => L === 0 ? 'first' : L < 168 ? `${L} h` : `${L / 24} d`;
const hrs = h => h < 1 ? Math.round(h * 60) + ' min' : h < 48 ? h.toFixed(1) + ' h' : (h / 24).toFixed(1) + ' days';
const ids = Object.keys(T);
let mode = 'card', pick = null;
const svg = $('#twosvg');
const X0 = 96, CW = 92, RH = 22, GAP = 34, TOP = 44;
svg.setAttribute('viewBox', `0 0 1000 ${TOP + ids.length * (2 * RH + GAP) - GAP + 8}`);

function fill(w, m) { return m === 'card' ? w.card_n > 0 : w.own.length > 0; }
function draw() {
  svg.replaceChildren();
  T[ids[0]].writings.forEach((w, j) => {
    const t = el('text', { x: X0 + j * CW + CW / 2 - 4, y: 16, 'text-anchor': 'middle', 'font-size': 12, fill: 'var(--mute)', 'font-family': 'ui-monospace,monospace' });
    t.textContent = RULE(w.L); svg.appendChild(t);
  });
  ids.forEach((i, k) => {
    const y0 = TOP + k * (2 * RH + GAP);
    const lab = el('text', { x: 0, y: y0 - 6, 'font-size': 12.5, fill: 'var(--ink)', 'font-family': 'ui-monospace,monospace' });
    lab.textContent = i; svg.appendChild(lab);
    [['card', 'card M'], ['own', 'own floor']].forEach(([m, name], r) => {
      const on = m === mode, y = y0 + r * RH;
      const t = el('text', { x: X0 - 8, y: y + 15, 'text-anchor': 'end', 'font-size': 11, fill: on ? 'var(--ink)' : 'var(--mute)', 'font-family': 'ui-monospace,monospace' });
      t.textContent = name; svg.appendChild(t);
      const vals = T[i].writings.map(w => fill(w, m));
      const moves = new Set(vals).size > 1;
      T[i].writings.forEach((w, j) => {
        const c = el('rect', { x: X0 + j * CW, y: y + 2, width: CW - 8, height: RH - 5, rx: 3,
          fill: vals[j] ? 'var(--contra)' : 'var(--paper)', stroke: vals[j] ? 'var(--contra)' : 'var(--mute)',
          'stroke-width': 1, opacity: on ? 1 : .28, tabindex: 0, role: 'button', class: 'twocell',
          'aria-label': `${i}, ${RULE(w.L)}, read at ${m === 'card' ? 'the card magnitude M' + w.card_M : 'its own floor M' + w.floor}: ${vals[j] ? 'needed' : 'never needed'}` });
        if (pick && pick[0] === i && pick[1] === j && on) { c.setAttribute('stroke', 'var(--ink)'); c.setAttribute('stroke-width', 2.5); }
        const go = () => { pick = [i, j]; draw(); tell(); };
        c.addEventListener('click', go); c.addEventListener('keydown', e => { if (e.key === 'Enter' || e.key === ' ') { e.preventDefault(); go(); } });
        svg.appendChild(c);
        if (m === 'own') {
          const f = el('text', { x: X0 + j * CW + (CW - 8) / 2, y: y + 14, 'text-anchor': 'middle', 'font-size': 10, 'pointer-events': 'none',
            fill: vals[j] ? 'var(--paper)' : 'var(--mute)', opacity: on ? 1 : .4, 'font-family': 'ui-monospace,monospace' });
          f.textContent = 'M' + w.floor.toFixed(1); svg.appendChild(f);
        }
      });
      const mv = el('text', { x: X0 + 9 * CW + 2, y: y + 15, 'font-size': 11, fill: moves ? 'var(--contra)' : 'var(--mute)', opacity: on ? 1 : .4, 'font-family': 'ui-monospace,monospace' });
      mv.textContent = moves ? 'moves' : 'one'; svg.appendChild(mv);
    });
  });
  for (const b of document.querySelectorAll('#twobtns button')) b.setAttribute('aria-pressed', b.dataset.m === mode);
  const moved = mode === 'card' ? R.moved.ours : R.moved.field, living = mode === 'card' ? R.living.ours : R.living.field;
  $('#twocount').innerHTML = mode === 'card'
    ? `Read at the card's one magnitude, the answer moves with the writing in <strong>${moved}</strong> of ${N.sequences_all_nine_closed} sequences, and <strong>${living}</strong> of ${N.distinct_writings} writings already held an aftershock when written.`
    : `Read at each writing's own floor, as the Field reads it, the answer moves with the writing in <strong>${moved}</strong> of ${N.sequences_all_nine_closed} sequences, and <strong>${living}</strong> of ${N.distinct_writings} writings already held an aftershock when written.`;
}
function tell() {
  if (!pick) { $('#twowords').textContent = 'Choose a week to see what came in it.'; return; }
  const [i, j] = pick, w = T[i].writings[j];
  const ev = mode === 'card' ? NINE[i].find(v => v.L === w.L).ev : w.own;
  const M = mode === 'card' ? w.card_M : w.floor;
  const when = ms => { const d = (ms - w.issued) / 3.6e6; return d < 0 ? `${hrs(-d)} before it was written` : `${hrs(d)} after it was written`; };
  let s = `${i}, the ${RULE(w.L) === 'first' ? 'first writing' : 'newest writing at ' + RULE(w.L)}, read at M${M.toFixed(1)}: `;
  s += ev.length ? ev.map(e => `M${e.m} ${e.mt}, ${when(e.t)}`).join('; ') + '.' : 'nothing came.';
  $('#twowords').textContent = s;
}
for (const b of document.querySelectorAll('#twobtns button')) b.addEventListener('click', () => { mode = b.dataset.m; draw(); tell(); });
draw(); tell();
$('#twofacts').innerHTML = [
  `Session 182 counted ${R.moved.ours} sequences whose answer moves with the writing and ${R.living.ours} writings whose week already held an aftershock when written. The Field's study 26 counts ${R.moved.field} and ${R.living.field}. Session 182 left the first difference untraced and called the second unresolved.`,
  `Both come from one choice. The coda reads all nine writings at the card's one magnitude, the first writing's floor. The Field reads each writing at its own floor, and among these ${ids.length} sequences the agency lowered its floor in later writings for ${ids.filter(i => T[i].writings.some(w => w.floor < w.card_M)).length} and raised it for a time in ${ids.filter(i => T[i].writings.some(w => w.floor > w.card_M)).length}. At the card's magnitude each of the ${ids.length} gives one answer to all nine writings (${R.card_magnitude_all_one_answer} of ${R.own_floor_rows}); at its own floors each moves.`,
  `The Studio refetched every week of the ${ids.length} sequences from the USGS catalogue at each writing's own floor, by its own route. On ${R.own_floor_rows_equal_field} of ${R.own_floor_rows} rows of nine, needed or never needed, the answer equals the Field's. The writing that held an aftershock when written, at its own floor: ${R.own_floor_living.join(', ') || 'none'}. The ${R.moved.ours} sequences that move at the card's magnitude move at their own floors too, by the Field's rows; the Studio did not refetch those.`,
  `So neither count is wrong; each is the count of its reading, and the thread closes here. The coda keeps the card's one magnitude, as its rules said before any outcome was read.`,
  `Judgment (the Studio's): the agency's own writings do not hold the danger still. A later writing that lowers the floor asks about a smaller earthquake, and the week that was never needed at the first magnitude becomes needed at the second. Which magnitude a reader holds the keeper to is, again, the reader's choice, and it decides the verdict as much as the choice of writing does.`
].map(f => `<li>${f}</li>`).join('');
window.__two = { set: m => { mode = m; draw(); tell(); }, pick: (i, j) => { pick = [i, j]; draw(); tell(); }, words: () => $('#twowords').textContent, count: () => $('#twocount').textContent };
})();
