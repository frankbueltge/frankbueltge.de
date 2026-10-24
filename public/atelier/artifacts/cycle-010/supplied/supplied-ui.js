// Supplied: the reader, the draw and the losses. Data: window.SUPPLIED (supplied.py).
(() => {
  const D = window.SUPPLIED, docs = D.docs;
  const $ = (s) => document.querySelector(s);
  const fmt = (n) => n.toLocaleString('en-US');
  const pct = (a, b) => (100 * a / b).toFixed(1) + ' %';
  const css = (v) => getComputedStyle(document.documentElement).getPropertyValue(v).trim();
  const ED = (c) => c.r + c.o + c.x, ALL = (c) => Object.values(c).reduce((a, b) => a + b, 0);
  const NOTES = [
    'Only the scribe’s letters that the editors read without doubt. Hatched: the papyrus is lost here, wide as the letters the editor will restore or as many as the editor counted. A torn mark: lost, and the size is not stated. Letters the scribe abbreviated or left out are not here at all, because nobody wrote them.',
    'Add the letters whose ink is there but whose reading is in doubt, dotted underneath, as the editors print them.',
    'The edition, with every sign: [restored] where the papyrus is lost, (written out) where the scribe abbreviated, ⟨added⟩ where the scribe left a letter out, dots for letters counted but not restored, and [ - - - ] where the editor does not say how much is gone.',
    'The same letters with the signs taken away, the gaps closed up and the struck letters dropped. This is how the text reads wherever its markup is dropped.'
  ];
  let mode = 2, cur = null;

  // --- the reader ---
  const sel = $('#doc');
  const order = docs.map((d, i) => i).sort((a, b) => docs[a].title.localeCompare(docs[b].title, 'en', { numeric: true }));
  for (const i of order) {
    const o = document.createElement('option'); o.value = i;
    const c = docs[i].c; o.textContent = `${docs[i].title} · ${Math.round(100 * ED(c) / ALL(c))} %`;
    sel.appendChild(o);
  }
  const gapEd = (g) => {
    if (g.g === 'e') return ' … ';
    if (g.u === 'l') return g.q == null ? ' — lines lost, number not stated — ' : ` — ${Array.isArray(g.q) ? g.q.join('–') : g.q} line${g.q === 1 ? '' : 's'} ${g.g === 'i' ? 'illegible' : 'lost'} — `;
    if (g.q == null) return g.g === 'l' ? ' - - - ' : ' - - - ';
    if (Array.isArray(g.q)) return g.g === 'l' ? ` ${g.q[0]}–${g.q[1]} ` : ' . . ';
    if (g.ca) return ` ca. ${g.q} `;
    return g.q > 12 ? ` ±${g.q} ` : ' ' + '. '.repeat(g.q).trim() + ' ';
  };
  const gapW = (g) => g.u === 'l' ? 10 : g.q == null ? 3 : Array.isArray(g.q) ? g.q[1] : Math.min(g.q, 40);
  function render(i) {
    cur = i; sel.value = i;
    const d = docs[i], box = $('#text'); box.innerHTML = '';
    const lang = { grc: 'Greek', la: 'Latin', cop: 'Coptic', ar: 'Arabic' }[d.lang] || d.lang;
    $('#docHead').innerHTML = `<b>${d.title}</b> · ${lang} · edition of ${d.year || 'unstated year'} · Trismegistos ${d.tm || '—'} · <a href="https://papyri.info/ddbdp/${encodeURIComponent(d.id)}">papyri.info</a>`;
    box.setAttribute('lang', d.lang === 'ar' ? 'ar' : d.lang === 'la' ? 'la' : 'grc');
    for (const [n, toks] of d.L) {
      const row = document.createElement('div'); row.className = 'line';
      row.innerHTML = `<span class="n">${n}</span>`;
      const tx = document.createElement('span'); tx.className = 'tx';
      // a run of restored letters and counted lost gaps shares one pair of square brackets
      const inB = (k) => (typeof k === 'string' && k[0] === 'r') || (typeof k === 'object' && k.g === 'l' && k.u === 'c');
      toks.forEach((k, j) => {
        const sp = document.createElement('span');
        const open = inB(k) && !(j > 0 && inB(toks[j - 1])), close = inB(k) && !(j < toks.length - 1 && inB(toks[j + 1]));
        if (typeof k === 'string') {
          sp.className = `t st-${k[0]}` + (open ? ' open' : '') + (close ? ' close' : '');
          sp.textContent = k.slice(1);
        } else {
          sp.className = 'gap' + (k.g === 'l' && k.u === 'c' ? ' gl' : '') + (open ? ' open' : '') + (close ? ' close' : '');
          let ed = gapEd(k).trim();
          if (k.g === 'l' && k.u === 'c') ed = ed.replace(/^\[|\]$/g, '');
          const kind = k.g === 'i' ? 'illeg' : k.q == null ? 'unk' : 'lost';
          sp.innerHTML = `<span class="ed">${ed}</span><span class="sh ${kind}" style="width:${gapW(k) * 0.62}em" title="${k.q == null ? 'size not stated' : 'size stated: ' + (Array.isArray(k.q) ? k.q.join('–') : k.q)}"></span>`;
        }
        tx.appendChild(sp);
      });
      row.appendChild(tx); box.appendChild(row);
    }
    setMode(mode);
  }
  function tally() {
    const c = docs[cur].c, g = docs[cur].gaps, t = $('#tally');
    const surv = c.s, doubt = c.u, ed = ED(c), all = ALL(c);
    const unk = g.lost_unknown + g.lost_lines_unknown;
    if (mode === 0) t.innerHTML = `<span class="big">${fmt(surv)}</span> letters on the papyrus read without doubt. ${unk ? `${unk} loss${unk > 1 ? 'es' : ''} of unstated size.` : ''}`;
    else if (mode === 1) t.innerHTML = `<span class="big">${fmt(surv + doubt + c.d + c.p)}</span> letters on the papyrus, ${fmt(doubt)} of them read with doubt.`;
    else if (mode === 2) t.innerHTML = `<span class="big">${fmt(all)}</span> letters in the edition: ${fmt(c.s + c.u + c.d + c.p)} the scribe’s, <span class="st-r">${fmt(c.r)} restored</span>, <span class="st-x">${fmt(c.x)} written out</span>, <span class="st-o">${fmt(c.o)} added</span>.`;
    else t.innerHTML = `<span class="big">${fmt(all - c.d - c.p)}</span> letters, all in one ink. Nothing on the page says that ${fmt(ed)} of them (${pct(ed, all - c.d - c.p)}) are the editor’s. <label><input type="checkbox" id="rev"> show who wrote them</label>`;
    const rev = $('#rev'); if (rev) rev.onchange = () => $('#text').classList.toggle('reveal', rev.checked);
  }
  function setMode(m) {
    mode = m; const box = $('#text');
    box.className = 'text m' + m; $('#hand').value = m;
    document.querySelectorAll('.modes button').forEach((b) => b.setAttribute('aria-checked', String(+b.dataset.m === m)));
    $('#modeNote').textContent = NOTES[m];
    tally();
  }
  document.querySelectorAll('.modes button').forEach((b) => (b.onclick = () => setMode(+b.dataset.m)));
  $('#hand').oninput = (e) => setMode(+e.target.value);
  sel.onchange = () => render(+sel.value);
  $('#rand').onclick = () => render(Math.floor(Math.random() * docs.length));
  const lg = [['ink', 'the scribe'], ['r', 'restored by the editor'], ['x', 'written out by the editor'], ['o', 'added by the editor'], ['d', 'deleted or struck']];
  $('#legend').innerHTML = lg.map(([k, t]) => `<span><i style="background:var(--${k === 'ink' ? 'ink' : k})"></i>${t}</span>`).join('');
  const start = docs.findIndex((d) => d.id === 'p.heid;7;402');
  render(start >= 0 ? start : 0);

  // --- the draw ---
  const L = D.letters, all = ALL(L), ed = ED(L);
  $('#drawLede').innerHTML = `The editions of the 677 documents hold ${fmt(all)} letters. The scribe’s, read without doubt: ${fmt(L.s)} (${pct(L.s, all)}). Read with doubt: ${fmt(L.u)} (${pct(L.u, all)}). <span class="st-r">Restored</span> where the papyrus is lost: ${fmt(L.r)} (${pct(L.r, all)}). <span class="st-x">Written out</span> from abbreviations: ${fmt(L.x)} (${pct(L.x, all)}). <span class="st-o">Added</span>: ${fmt(L.o)}. So <b>${pct(ed, all)}</b> of what a reader reads is the editor’s. In the median document the share is ${(() => { const s = docs.map((d) => ED(d.c) / ALL(d.c)).sort((a, b) => a - b); return (100 * s[Math.floor(s.length / 2)]).toFixed(0); })()} %.`;
  const sorted = docs.map((d, i) => i).sort((a, b) => ED(docs[a].c) / ALL(docs[a].c) - ED(docs[b].c) / ALL(docs[b].c));
  const bars = $('#bars'), tip = $('#barTip');
  function drawBars() {
    const dpr = window.devicePixelRatio || 1, W = bars.clientWidth, H = 260;
    bars.width = W * dpr; bars.height = H * dpr; const g = bars.getContext('2d'); g.scale(dpr, dpr);
    g.clearRect(0, 0, W, H);
    const w = W / sorted.length, stack = [['r', '--r'], ['o', '--o'], ['x', '--x'], ['u', '--ink', .45], ['d', '--d'], ['p', '--d'], ['s', '--ink']];
    sorted.forEach((i, k) => {
      const c = docs[i].c, t = ALL(c); let y = 0;
      for (const [s, v, a] of stack) {
        const h = H * c[s] / t; g.globalAlpha = a || 1; g.fillStyle = css(v);
        g.fillRect(k * w, y, Math.max(w - (w > 2 ? .3 : 0), .6), h); y += h;
      }
      g.globalAlpha = 1;
      if (i === cur) { g.strokeStyle = css('--bg'); g.lineWidth = 1; g.strokeRect(k * w, 0, w, H); }
    });
  }
  const at = (e) => { const r = bars.getBoundingClientRect(); return [Math.min(sorted.length - 1, Math.max(0, Math.floor((e.clientX - r.left) / r.width * sorted.length))), e.clientX - r.left, e.clientY - r.top]; };
  bars.onmousemove = (e) => { const [k, x, y] = at(e), d = docs[sorted[k]]; tip.hidden = false; tip.style.left = x + 'px'; tip.style.top = y + 'px'; tip.textContent = `${d.title}: ${Math.round(100 * ED(d.c) / ALL(d.c))} % the editor’s`; };
  bars.onmouseleave = () => (tip.hidden = true);
  bars.onclick = (e) => { render(sorted[at(e)[0]]); drawBars(); $('#reader').scrollIntoView({ behavior: 'smooth' }); };

  // --- the losses ---
  const G = D.gaps, nm = G.n_lost_measured, nu = G.lost_unknown, tot = nm + nu;
  $('#lossLede').innerHTML = `Where the editors did not restore a loss, they still marked it. Of ${fmt(tot)} such stretches in the draw, ${fmt(nm)} carry a stated size, together ${fmt(G.lost_q)} letters (${G.lost_ca} of them marked approximate, ${G.lost_range} given as a range). <b>${fmt(nu)} (${pct(nu, tot)})</b> are marked as lost with the size not known, and a further ${fmt(G.lost_lines_unknown)} losses of whole lines carry no number. So the sum of what is missing has a floor and no ceiling. The editors wrote that down rather than guess.`;
  const loss = $('#losses');
  function drawLoss() {
    const dpr = window.devicePixelRatio || 1, W = loss.clientWidth, s = W < 600 ? 5 : 7, per = Math.floor(W / s), rows = Math.ceil(tot / per), H = rows * s;
    loss.style.height = H + 'px'; loss.width = W * dpr; loss.height = H * dpr;
    const g = loss.getContext('2d'); g.scale(dpr, dpr); g.clearRect(0, 0, W, H);
    for (let k = 0; k < tot; k++) {
      const x = (k % per) * s, y = Math.floor(k / per) * s;
      if (k < nm) { g.fillStyle = css('--r'); g.fillRect(x + .5, y + .5, s - 1.5, s - 1.5); }
      else { g.strokeStyle = css('--mute'); g.lineWidth = 1; g.strokeRect(x + 1, y + 1, s - 2.5, s - 2.5); }
    }
  }
  const redraw = () => { drawBars(); drawLoss(); };
  window.addEventListener('resize', redraw);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redraw);
  redraw();
})();
