// Plate I, Three or Four Times: the village and its ledger. Recomputes the model of plate1.py in the browser.
(() => {
  const D = P1.model.defaults, $ = id => document.getElementById(id);
  const st = { wolf: true, words: false, boy: 'watcher', k: D.k, p: D.p, pi: D.pi };
  const belief = (cols, kind, k, w, p, pi) => {
    if (cols.words) return kind === 'hoaxer' ? w : p;
    let a = pi, b = 1 - pi;
    if (cols.wolf) { a = pi * (1 - w) ** k; b = (1 - pi) * (1 - p) ** k; }
    return (a * w + b * p) / (a + b);
  };
  const f2 = x => x.toFixed(2), f3 = x => x.toFixed(3);
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const cols = () => ({ wolf: st.wolf, words: st.words });
  const hab = k => D.h ** k * belief({}, st.boy, 0, D.w, st.p, st.pi);

  function ledger() {
    const t = $('ledger'), w = st.wolf ? '' : ' class="off"', o = st.words ? '' : ' class="off"';
    let h = `<tr><th>cry</th><th>came</th><th${w}>wolf?</th><th${o}>his words after</th></tr>`;
    for (let i = 1; i <= st.k; i++)
      h += `<tr><td>${i}</td><td>yes</td><td${w}>${st.wolf ? 'none' : 'not kept'}</td><td${o}>${st.words ? (st.boy === 'hoaxer' ? 'laughed' : 'none') : 'not kept'}</td></tr>`;
    h += `<tr><td>${st.k + 1}</td><td colspan="3"><i>the next cry: does the village come?</i></td></tr>`;
    t.innerHTML = h;
  }
  function draw() {
    const c = $('curve'), dpr = window.devicePixelRatio || 1, W = Math.max(280, c.clientWidth || 820), H = W < 600 ? 240 : 300;
    c.width = W * dpr; c.height = H * dpr; c.style.height = H + 'px'; const g = c.getContext('2d'); g.setTransform(dpr, 0, 0, dpr, 0, 0);
    const L = 44, R = 12, T = 12, B = 30; g.clearRect(0, 0, W, H);
    const X = k => L + (W - L - R) * k / 8, ymax = Math.max(0.3, st.p * 1.15, belief({}, 'watcher', 0, D.w, st.p, st.pi) * 1.15);
    const Y = v => T + (H - T - B) * (1 - Math.min(v, ymax) / ymax);
    g.strokeStyle = css('--rule'); g.fillStyle = css('--mute'); g.font = '12px system-ui'; g.lineWidth = 1;
    for (let k = 0; k <= 8; k++) { g.beginPath(); g.moveTo(X(k), T); g.lineTo(X(k), H - B); g.stroke(); g.fillText(String(k), X(k) - 3, H - 12); }
    for (const v of [0, ymax / 2, ymax]) g.fillText(f2(v), 4, Y(v) + 4);
    g.fillText('empty cries before this one →', W - 190, T + 12);
    g.setLineDash([2, 4]); g.strokeStyle = css('--ink'); g.beginPath(); g.moveTo(L, Y(D.t)); g.lineTo(W - R, Y(D.t)); g.stroke(); g.setLineDash([]);
    const line = (f, col, w) => { g.strokeStyle = col; g.lineWidth = w; g.beginPath(); for (let k = 0; k <= 8; k++) { const y = Y(f(k)); k ? g.lineTo(X(k), y) : g.moveTo(X(k), y); } g.stroke(); };
    line(k => hab(k), css('--grey'), 3);
    line(k => belief(cols(), 'hoaxer', k, D.w, st.p, st.pi), css('--calm'), 2);
    line(k => belief(cols(), 'watcher', k, D.w, st.p, st.pi), css('--accent'), 2.5);
    const b = belief(cols(), st.boy, st.k, D.w, st.p, st.pi);
    g.fillStyle = css(st.boy === 'watcher' ? '--accent' : '--calm'); g.beginPath(); g.arc(X(st.k), Y(b), 6, 0, 7); g.fill();
  }
  function read() {
    const b = belief(cols(), st.boy, st.k, D.w, st.p, st.pi), truth = st.boy === 'watcher' ? st.p : D.w, come = b >= D.t, hb = hab(st.k);
    const kept = ['came'].concat(st.wolf ? ['wolf?'] : [], st.words ? ['his words after'] : []).join(', ');
    $('read').innerHTML = `Ledger: <b>${kept}</b>. After ${st.k} empty ${st.k === 1 ? 'cry' : 'cries'}, the village believes the ${st.boy}'s next cry at <b>${f3(b)}</b>, so it <b>${come ? 'comes' : 'stays home'}</b>. ` +
      `A wolf is really there with chance ${f3(truth)}. The habituated village, which keeps no ledger, believes it at ${f3(hb)} and ${hb >= D.t ? 'comes' : 'stays home'}. ` +
      (st.boy === 'watcher' && !come && truth >= D.t ? 'The honest boy is paying for the liar the village thinks he might be, and if the wolf comes, the flock pays.' :
       st.boy === 'hoaxer' && !come ? 'The liar is not believed, as the fable has it, and if the wolf has come this time, the flock pays.' : '');
    window.__p1 = { b, come, truth, hab: hb, st: { ...st } };
  }
  function all() { ledger(); draw(); read(); }
  const press = (id, on) => $(id).setAttribute('aria-pressed', String(on));
  $('c-wolf').onclick = () => { st.wolf = !st.wolf; press('c-wolf', st.wolf); all(); };
  $('c-words').onclick = () => { st.words = !st.words; press('c-words', st.words); all(); };
  $('b-watch').onclick = () => { st.boy = 'watcher'; press('b-watch', true); press('b-hoax', false); all(); };
  $('b-hoax').onclick = () => { st.boy = 'hoaxer'; press('b-hoax', true); press('b-watch', false); all(); };
  for (const [s, k, fmt] of [['s-k', 'k', String], ['s-p', 'p', f2], ['s-pi', 'pi', f2]])
    $(s).oninput = e => { st[k] = +e.target.value; $('v-' + k).textContent = fmt(st[k]); all(); };
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', draw); addEventListener('resize', draw);

  const F = P1.model.fifth_cry;
  $('f-came').textContent = f3(belief({}, 'watcher', D.k, D.w, D.p, D.pi));
  $('f-wolf').textContent = f3(belief({ wolf: true }, 'watcher', D.k, D.w, D.p, D.pi));
  $('f-p').textContent = f2(D.p);
  window.__p1check = () => ['came', 'came+wolf', 'came+wolf+words'].every((L, i) => ['hoaxer', 'watcher'].every(kind =>
    Math.abs(belief([{}, { wolf: true }, { wolf: true, words: true }][i], kind, D.k, D.w, D.p, D.pi) - F[L][kind]) < 1e-6));

  // the real ledger's words column
  const A = P1.archive, box = $('cards');
  for (const k of ['error', 'other', 'bare', 'hoax']) $('n-' + k).textContent = A.classes[k];
  $('n-acted').textContent = A.speak_to_those_who_acted === 1 ? 'One' : A.speak_to_those_who_acted;
  A.rows.forEach((r, i) => {
    const b = document.createElement('button'); b.className = 'card'; b.dataset.cls = r.cls; b.dataset.i = i;
    b.innerHTML = `<span class="d">${r.sent.replace('T', ' ')}</span>${r.w.replace(/</g, '&lt;')}`;
    b.onclick = () => {
      const pw = r.pair_words, lab = { error: 'names an error', other: 'says someone else sent it', bare: 'withdraws, no reason given', hoax: 'confesses a hoax' }[r.cls];
      $('cread').innerHTML = `<b>Its words:</b> ${lab}${r.acted ? ', and speaks to those who acted' : ''}. ` +
        (r.hand === 'none' ? 'It takes back something the archive does not hold (the Studio\'s reading): a siren, or a message from another state or agency.' :
         `<b>What it takes back</b>, ${r.lag} minutes earlier (the Studio's pair, read as "${r.hand}"${r.backed ? ', backed' : ''}): ${pw ? '“' + pw.replace(/</g, '&lt;') + '”' : 'the archive shows no words for it.'}`);
      window.__p1card = i;
    };
    box.appendChild(b);
  });
  all();
})();
