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
    'The same letters with the signs taken away, the gaps closed up and the struck letters dropped. This is how the text reads wherever its markup is dropped. Some of these letters are the editor’s: mark the ones you think they are, then reveal.',
    'What a language model trained to restore papyri is given, in a corpus built from this databank and published openly. Accents and capitals go. Restored, added and doubtful letters become dashes, a stated loss becomes as many dashes, a loss of unknown size becomes “…”. The letters the editor wrote out from abbreviations stay, in the scribe’s ink. Rebuilt here from the edition’s tags; the corpus’s own record for this document is printed below for comparison.'
  ];
  const P = window.PATHS || null;
  const CORP = {}, TR = {};
  if (P) { for (const r of P.corpus.docs) CORP[r.id] = r; for (const t of P.translations.examples) TR[t.id] = t; }
  // the corpus's form of a letter: no accents, lower case, one sigma
  const fold = (t) => t.normalize('NFD').replace(/[\u0300-\u036f\u0345]/g, '').toLowerCase().replace(/ς/g, 'σ');
  const cform = (st, t) => st === 'r' || st === 'o' || st === 'u' ? t.replace(/[^\p{L}]/gu, '').replace(/\p{L}/gu, '-') : st === 'd' || st === 'p' ? '' : fold(t).replace(/[^\p{L}\s]/gu, '');
  const cgap = (g) => g.g === 'e' ? ' … ' : g.u === 'l' ? ' … ' : g.q == null ? ' … ' : '-'.repeat(Math.min(Array.isArray(g.q) ? g.q[0] : g.q, 60));
  let mode = 3, cur = null, revealed = false;
  const run = { docs: 0, marked: 0, hit: 0, ed: 0, found: 0 };
  const graph = new Intl.Segmenter('und', { granularity: 'grapheme' });
  // one span per letter, so a visitor can mark letters; other characters stay plain text
  const fill = (el, txt) => { for (const { segment } of graph.segment(txt)) { if (/\p{L}/u.test(segment)) { const c = document.createElement('span'); c.className = 'ch'; c.textContent = segment; el.appendChild(c); } else el.appendChild(document.createTextNode(segment)); } };
  const esc = (t) => t.replace(/[&<>]/g, (ch) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;' }[ch]));

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
    cur = i; sel.value = i; revealed = false;
    const d = docs[i], box = $('#text'); box.innerHTML = '';
    const lang = { grc: 'Greek', la: 'Latin', cop: 'Coptic', ar: 'Arabic' }[d.lang] || d.lang;
    $('#docHead').innerHTML = `<b>${d.title}</b> · ${lang} · edition of ${d.year || 'unstated year'} · Trismegistos ${d.tm || '—'} · <a href="https://papyri.info/ddbdp/${encodeURIComponent(d.id)}">papyri.info</a>`;
    box.setAttribute('lang', d.lang === 'ar' ? 'ar' : d.lang === 'la' ? 'la' : 'grc');
    for (const [n, toks] of d.L) {
      const row = document.createElement('div'); row.className = 'line';
      // a row that holds only lost lines numbers nothing: the edition's next line keeps the number
      const onlyLines = toks.length === 1 && typeof toks[0] === 'object' && toks[0].u === 'l';
      row.innerHTML = `<span class="n">${onlyLines ? '' : n}</span>`;
      const tx = document.createElement('span'); tx.className = 'tx';
      // a run of restored letters and counted lost gaps shares one pair of square brackets
      const inB = (k) => (typeof k === 'string' && k[0] === 'r') || (typeof k === 'object' && k.g === 'l' && k.u === 'c');
      toks.forEach((k, j) => {
        const sp = document.createElement('span');
        const open = inB(k) && !(j > 0 && inB(toks[j - 1])), close = inB(k) && !(j < toks.length - 1 && inB(toks[j + 1]));
        if (typeof k === 'string') {
          sp.className = `t st-${k[0]}` + (open ? ' open' : '') + (close ? ' close' : '');
          sp.innerHTML = '';
          const o = document.createElement('span'); o.className = 'o'; fill(o, k.slice(1));
          const c = document.createElement('span'); c.className = 'c'; c.textContent = cform(k[0], k.slice(1));
          sp.append(o, c);
        } else {
          sp.className = 'gap' + (k.g === 'l' && k.u === 'c' ? ' gl' : '') + (open ? ' open' : '') + (close ? ' close' : '');
          let ed = gapEd(k).trim();
          if (k.g === 'l' && k.u === 'c') ed = ed.replace(/^\[|\]$/g, '');
          const kind = k.g === 'i' ? 'illeg' : k.q == null ? 'unk' : 'lost';
          sp.innerHTML = `<span class="ed">${ed}</span><span class="sh ${kind}" style="width:${gapW(k) * 0.62}em" title="${k.q == null ? 'size not stated' : 'size stated: ' + (Array.isArray(k.q) ? k.q.join('–') : k.q)}"></span><span class="cg">${cgap(k)}</span>`;
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
    else if (mode === 4) {
      const r = CORP[docs[cur].id];
      t.innerHTML = `<span class="big">${fmt(c.s + c.x)}</span> letters given to the model. ${fmt(c.r + c.o + c.u)} are dashes, for it to restore. Among the letters it is given as the scribe’s, <span class="st-x">${fmt(c.x)}</span> are the editor’s, written out from abbreviations, and nothing marks them. <label><input type="checkbox" id="rev"> show who wrote them</label>`
        + (r ? `<div class="corp"><p class="cap">The corpus’s own record for this document (Trismegistos ${docs[cur].tm}; its letters match this edition’s at ${Math.round(100 * r.match)} %), first 600 characters.</p><p><b>Given:</b> <span lang="grc">${esc(r.without)}</span></p><p><b>Answer:</b> <span lang="grc">${esc(r.with)}</span></p></div>`
          : `<div class="corp"><p class="cap">${docs[cur].lang !== 'grc' ? 'This document is not in the corpus: it holds Greek texts only.' : 'This document is not in the corpus, or its record there does not match this edition (letters under 80 % alike), so it is not counted.'}</p></div>`);
    }
    else guessTally(t);
    const tr = TR[docs[cur].id], tb = $('#trans');
    if (tb) tb.innerHTML = tr ? `<details><summary>This document has an English translation in the same open data. Its square brackets: ${tr.bracket ? '<b>kept</b>' : '<b>none</b>'}.</summary><p>${esc(tr.en)}${tr.en.length >= 500 ? ' …' : ''}</p></details>` : '';
    const rev = $('#rev'); if (rev) rev.onchange = () => $('#text').classList.toggle('reveal', rev.checked);
    const rb = $('#revealBtn'); if (rb) rb.onclick = reveal;
    const ab = $('#againBtn'); if (ab) ab.onclick = () => { revealed = false; document.querySelectorAll('#text .ch.g').forEach((x) => x.classList.remove('g')); setMode(3); };
  }
  function setMode(m) {
    mode = m; const box = $('#text');
    box.className = 'text m' + m + (m === 3 ? (revealed ? ' reveal' : ' guessing') : '');
    document.querySelectorAll('.modes button').forEach((b) => b.setAttribute('aria-checked', String(+b.dataset.m === m)));
    $('#modeNote').textContent = NOTES[m];
    tally();
  }
  document.querySelectorAll('.modes button').forEach((b) => (b.onclick = () => setMode(+b.dataset.m)));

  // --- find the editor (the clean text) ---
  const isEd = (ch) => /st-[rxo]/.test(ch.parentNode.parentNode.className);
  const letters = () => [...document.querySelectorAll('#text .ch')].filter((x) => x.offsetParent !== null);
  function guessTally(t) {
    const L = letters(), E = L.filter(isEd).length, N = L.length, M = L.filter((x) => x.classList.contains('g'));
    if (!revealed) {
      t.innerHTML = `<span class="big">${fmt(N)}</span> letters, all in one ink. <b>${fmt(E)}</b> of them (${pct(E, N)}) are the editor’s: restored, written out or added. Nothing on the page says which. <span class="ask">Find them: click a letter, or drag across several, to mark it as the editor’s.</span> <button id="revealBtn" class="act">Reveal</button> <span class="mute" id="gcount">${fmt(M.length)} marked</span>`;
      return;
    }
    const H = M.filter(isEd).length, F = H;
    const line1 = M.length ? `You marked <b>${fmt(M.length)}</b> letters, and <b>${fmt(H)}</b> of them (${pct(H, M.length)}) are the editor’s. Marking at random, about ${pct(E, N)} would have been. You found ${fmt(F)} of the editor’s ${fmt(E)}.`
      : `You marked nothing, and ${E === 1 ? 'the editor’s one letter' : 'all ' + fmt(E) + ' of the editor’s letters'} passed as the scribe’s.`;
    const tot = run.docs > 1 ? ` <span class="mute">Over the ${run.docs} documents you have revealed here, ${fmt(run.hit)} of your ${fmt(run.marked)} marks fell on the editor’s letters (${run.marked ? pct(run.hit, run.marked) : '–'}), against ${pct(run.ed, run.n)} at random.</span>` : '';
    t.innerHTML = `${line1} In colour: <span class="st-r">restored</span>, <span class="st-x">written out</span>, <span class="st-o">added</span>; your marks are underlined, and a struck-through mark fell on the scribe’s ink.${tot} <button id="againBtn" class="act">Mark again</button>`;
  }
  function reveal() {
    const L = letters(), E = L.filter(isEd).length, M = L.filter((x) => x.classList.contains('g')), H = M.filter(isEd).length;
    run.docs++; run.marked += M.length; run.hit += H; run.ed += E; run.n = (run.n || 0) + L.length;
    revealed = true; setMode(3);
  }
  // marking works like a selection: press on a letter, drag, and every letter between is marked (or unmarked)
  const tb0 = $('#text'); let paint = null, from = -1, seq = [], before = [];
  const count = () => { const gc = $('#gcount'); if (gc) gc.textContent = fmt(document.querySelectorAll('#text .ch.g').length) + ' marked'; };
  const span = (el) => { const k = seq.indexOf(el); if (k < 0) return; const [lo, hi] = from < k ? [from, k] : [k, from]; seq.forEach((x, j) => x.classList.toggle('g', j >= lo && j <= hi ? paint : before[j])); count(); };
  tb0.addEventListener('pointerdown', (e) => { if (mode !== 3 || revealed || !e.target.classList.contains('ch')) return; seq = letters(); before = seq.map((x) => x.classList.contains('g')); from = seq.indexOf(e.target); paint = !before[from]; span(e.target); e.preventDefault(); });
  tb0.addEventListener('pointermove', (e) => { if (paint === null) return; const el = document.elementFromPoint(e.clientX, e.clientY); if (el && el.classList.contains('ch')) span(el); });
  window.addEventListener('pointerup', () => (paint = null)); window.addEventListener('pointercancel', () => (paint = null));
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
  $('#lossLede').innerHTML = `What the editors restored stands in the text. What they did not restore, they still marked. They restored ${fmt(L.r)} letters where the papyrus is lost. Of the ${fmt(tot)} stretches they left empty, ${fmt(nm)} carry a stated size, together ${fmt(G.lost_q)} letters (${G.lost_ca} of them marked approximate, ${G.lost_range} given as a range). <b>${fmt(nu)} (${pct(nu, tot)})</b> are marked as lost with the size not known, and a further ${fmt(G.lost_lines_unknown)} losses of whole lines carry no number. So the sum of what is missing has a floor and no ceiling. The editors wrote that down rather than guess.`;
  {
    const fl = G.lost_q + nu, span = L.r + fl;
    const band = (cls, n, label, txt) => `<span class="lb ${cls}" style="flex:${n}" title="${label}: ${fmt(n)} letters"><b>${txt}</b></span>`;
    $('#lossFig').innerHTML = `<div class="lrow">${band('filled', L.r, 'restored by the editors', 'restored ' + fmt(L.r))}${band('stated', G.lost_q, 'left empty, size stated', 'empty, stated ' + fmt(G.lost_q))}${band('floor', nu, 'left empty, size unknown, counted at one letter each', '≥ ' + fmt(nu))}<span class="lb open" title="no upper bound is stated"><b>no ceiling →</b></span></div>`
      + `<div class="pkey"><span><i style="background:var(--r)"></i>restored, standing in the text</span><span><i class="k-stated"></i>left empty, size stated</span><span><i class="k-floor"></i>left empty, size not known: at least one letter each</span><span>${fmt(G.lost_lines_unknown)} lost runs of lines with no number are not on this scale</span></div>`;
  }
  const redraw = () => drawBars();
  window.addEventListener('resize', redraw);
  matchMedia('(prefers-color-scheme: dark)').addEventListener('change', redraw);
  redraw();

  // --- where the marks drop ---
  if (P) {
    const A = P.corpus, Tt = A.tally, B = P.translations, pc = (x) => (100 * x).toFixed(1) + ' %', ci = (v) => `${pc(v[0])} (${pc(v[1])}–${pc(v[2])})`;
    const rows = [['s', 'the scribe’s, read without doubt', '--ink'], ['u', 'the scribe’s, read with doubt', '--ink'], ['r', 'restored by the editor', '--r'], ['x', 'written out by the editor', '--x'], ['o', 'added by the editor', '--o'], ['d', 'deleted by the scribe', '--d']];
    $('#pathFig').innerHTML = rows.map(([k, name, v]) => {
      const t = Tt[k], n = t.kept + t.masked + t.dropped;
      const seg = (cls, x, label) => x ? `<span class="seg ${cls}" style="flex:${x};${cls === 'kept' ? `background:var(${v})` : ''}" title="${label}: ${fmt(x)} (${pc(x / n)})"></span>` : '';
      return `<div class="prow"><span class="pname">${name} <i>${fmt(n)}</i></span><span class="pbar">${seg('kept', t.kept, 'given as a letter')}${seg('masked', t.masked, 'given as a dash')}${seg('dropped', t.dropped, 'not in the corpus text')}</span><span class="pval">${pc(t.kept / n)} letter · ${pc(t.masked / n)} dash</span></div>`;
    }).join('') + `<div class="pkey"><span><i class="k-kept"></i>given to the model as a letter</span><span><i class="k-masked"></i>given as a dash, to restore</span><span><i class="k-dropped"></i>gone</span></div>`;
    $('#heroNum').textContent = Math.round(100 * A.ci.editor_letters_unmasked[0]) + ' %';
    $('#corpNum').textContent = pc(A.ci.editor_letters_unmasked[0]);
    $('#pathCorpus').innerHTML = `<b>What it is.</b> ${fmt(A.records)} records built from this databank and its metadata, published openly in 2024 with scripts to format them for tuning language models (Hugging Face, <code>Ericu950/Papyri_1</code>). Each record pairs a masked text, given to the model, with its answer. ${fmt(A.matched)} of the 677 drawn documents are in it and match their edition closely enough to be counted; it holds Greek only. <b>What it keeps.</b> The sign for <i>lost</i>: ${pc(A.ci.restored_masked[0])} of restored letters become dashes, a stated loss becomes as many dashes, and a loss of unknown size becomes “…”. <b>What it drops.</b> The sign for <i>written out</i>: ${pc(A.ci.expanded_kept_as_scribe[0])} of the letters the editors wrote out from abbreviations are given as the scribe’s. <b>What it moves.</b> The scribe’s doubtful ink: ${pc(A.ci.doubtful_masked[0])} of it becomes a dash, as if lost.`;
    $('#pathNote').innerHTML = `Intervals, 95 %, from resampling documents: editor’s letters given as the scribe’s ${ci(A.ci.editor_letters_unmasked)}; restored letters masked ${ci(A.ci.restored_masked)}; written-out letters given as the scribe’s ${ci(A.ci.expanded_kept_as_scribe)}; doubtful letters masked ${ci(A.ci.doubtful_masked)}. Unknown-size losses: ${fmt(A.gaps.ellipses_corpus)} “…” in the corpus records against ${fmt(A.gaps.unknown_gaps_ours)} in the editions. The record the corpus names “with brackets” holds no editorial bracket: it is the clean text, and its only brackets, ⟨ ⟩, enclose numerals, which the corpus marks itself and the editors do not.`;
    $('#pathTrans').innerHTML = `<b>The translations.</b> The same open data carries ${fmt(B.files)} translation files. Only <b>${B.with_english}</b> of the 677 drawn documents have an English one. Of the ${B.with_english_and_restored} of those whose Greek has restorations, ${B.bracket_in_english} keep square brackets in the English: ${ci(B.ci_bracket)}. The others give the restored words as plain English.`;
    $('#pathSite').innerHTML = `<b>Not read: the edition’s own site.</b> papyri.info prints every sign. On ${P.site.checked.slice(0, 10)} it answered this work’s scripted reader on every document page with a proof-of-work challenge meant to keep machines out. The challenge was not circumvented, so this is not a path this work measured. What reaches a machine is the open files and the corpora built from them; what reaches a person at the site was not tested.`;
  }
})();
