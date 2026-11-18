/* SECOND RUN — the drawing (cycle 016, step 4). Own code, no library. Every number comes from data.js,
   which build.py writes from the Field's studies 80 and 81 and checks against the Field's own counts. */
(() => {
  'use strict';
  const D = window.SR, N = D.N;
  const C = {
    paper: '#f5f2ea', ink: '#1b1a17', soft: '#6d685d', grey: '#9a958a', faint: '#d8d2c3',
    slot: '#8f887a', red: '#c4301c', lit: '#f5c400', litInk: '#9c7a00', hi: '#1d4fb8'
  };
  const EV = D.ev;
  const SRC = Object.fromEntries(D.sources.map(s => [s.ref, s]));
  const byMaker = r => r === 'maker' || r === 'maker and others';
  const SEALED = new Set(['closed', 'model closed', 'materials closed']);
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SWEEP_MS = 6500, LEG_MS = 700;

  const cv = document.getElementById('work');
  const ctx = cv.getContext('2d');
  const say = document.getElementById('say');
  let L = null;            // the layout
  let t0 = null;           // start of the running second run (performance.now), or null
  let done = false;        // the second run has passed the whole ground
  let hover = null, pick = null;
  let audio = null, soundOn = false, played = new Set();

  // ------------------------------------------------------------------ layout
  function layout() {
    const W = Math.floor(cv.parentElement.clientWidth);
    const down = W >= 720;
    const np = D.pages.length;
    const l = { W, down, np };
    if (down) {
      l.a0 = 0; l.pp = W / np; l.ca = Math.max(2, l.pp - 2.2); l.b0 = 22; l.sp = 4; l.cb = 3;
    } else {
      l.a0 = 6; l.pp = 5; l.ca = 3.6; l.b0 = 18; l.sp = Math.min(6, (W - 18 - 110) / 36); l.cb = l.sp - 1.2;
    }
    l.aLen = np * l.pp;
    l.slabB = l.b0 + 36 * l.sp;
    l.G = l.slabB + (down ? 150 : 74);
    const ng = D.sources.length, nn = D.nine.length;
    if (down) {
      l.fp = Math.min(17, (W - 34) / (ng + nn));
      l.footEnd = l.a0 + ng * l.fp + 4;
      l.nineA = W - nn * l.fp;
    } else {
      l.fp = Math.min(17, l.aLen / ng);
      l.footEnd = l.a0 + l.aLen;
      l.nineA = l.footEnd + 34;
    }
    l.f = Math.max(5, l.fp - 3.5);
    l.rowA = l.G; l.rowB = l.G + l.f + 5;
    l.bEnd = l.rowB + l.f + 8;
    l.aEnd = down ? W : l.nineA + nn * l.fp + 8;
    // the cells
    l.cells = {};
    D.pages.forEach((pg, pi) => pg.forEach(([id, k], si) => {
      const a = l.a0 + pi * l.pp + (l.pp - l.ca) / 2, b = l.b0 + si * l.sp;
      l.cells[id] = { a, b, k, ac: a + l.ca / 2, bc: b + l.cb / 2, pi };
    }));
    // the footings: each under the mean of the sentences that stand on it, then moved apart in order
    const tgt = D.sources.map(s => ({ s, t: s.by.reduce((m, i) => m + l.cells[i].ac, 0) / s.by.length }));
    tgt.sort((x, y) => x.t - y.t || (+x.s.ref) - (+y.s.ref));
    const lo = l.a0 + l.fp / 2, hi = l.footEnd - l.fp / 2;
    const xs = tgt.map(o => Math.min(hi, Math.max(lo, o.t)));
    for (let i = 1; i < xs.length; i++) xs[i] = Math.max(xs[i], xs[i - 1] + l.fp);
    for (let i = xs.length - 1; i >= 0; i--) xs[i] = Math.min(xs[i], i === xs.length - 1 ? hi : xs[i + 1] - l.fp);
    for (let i = 1; i < xs.length; i++) xs[i] = Math.max(xs[i], i === 0 ? lo : xs[i - 1] + l.fp);
    l.foot = {};
    tgt.forEach((o, i) => { l.foot[o.s.ref] = { a: xs[i], s: o.s }; });
    l.nine = D.nine.map((c, i) => ({ a: l.nineA + (i + 0.5) * l.fp, c }));
    // the second run reaches each footing at a time along the ground
    const span = l.aEnd - l.a0;
    for (const r in l.foot) l.foot[r].at = (l.foot[r].a - l.a0) / span * SWEEP_MS;
    l.nine.forEach(n => { n.at = (n.a - l.a0) / span * SWEEP_MS; });
    return l;
  }

  // a point on the drawing: a runs along the pages, b runs from the text to the ground
  const X = (a, b) => L.down ? a : b;
  const Y = (a, b) => L.down ? b : a;
  function rect(a, b, sa, sb) { ctx.fillRect(X(a, b), Y(a, b), L.down ? sa : sb, L.down ? sb : sa); }
  function srect(a, b, sa, sb) { ctx.strokeRect(X(a, b), Y(a, b), L.down ? sa : sb, L.down ? sb : sa); }
  function line(a1, b1, a2, b2) { ctx.beginPath(); ctx.moveTo(X(a1, b1), Y(a1, b1)); ctx.lineTo(X(a2, b2), Y(a2, b2)); ctx.stroke(); }

  function size() {
    L = layout();
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const w = L.down ? L.W : L.bEnd, h = L.down ? L.bEnd : L.aEnd;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ------------------------------------------------------------------ what the second run has reached
  function now() { return t0 === null ? (done ? Infinity : -1) : performance.now() - t0; }
  function reached(at) { const t = now(); return t >= at; }
  function legProgress(at) { const t = now(); return t === Infinity ? 1 : Math.max(0, Math.min(1, (t - at) / LEG_MS)); }
  // a measured sentence is lit when the light from its first rerunnable footing has reached it
  function sentenceLit(id) {
    let best = 0;
    for (const r of EV[id].src || []) {
      const s = SRC[r];
      if (s.test === 'yes' && s.out === 'rerunnable') best = Math.max(best, legProgress(L.foot[r].at));
    }
    return best;
  }

  // the moment the second run has passed every source beneath a sentence
  function passedAt(id) {
    const src = EV[id].src || [];
    return src.length ? Math.max(...src.map(r => L.foot[r].at)) + LEG_MS : SWEEP_MS;
  }

  // ------------------------------------------------------------------ drawing
  function draw() {
    const W = cv.width, H = cv.height;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H); ctx.restore();
    const focus = focusSet();
    const drawn = { dark: 0, lit: 0, twins: 0, slots: 0, sealed: 0, open: 0, grey: 0, rings: 0, pass: 0, nine: 0, legs: 0, black: 0 };

    // chapter marks
    ctx.fillStyle = C.soft; ctx.font = (L.down ? 10.5 : 9.5) + 'px ui-monospace,Menlo,Consolas,monospace';
    ctx.textBaseline = 'alphabetic';
    const names = { '1': 'BACKGROUND', '2': 'RISKS', '3': 'RISK MANAGEMENT' };
    let prev = null;
    D.meta.chapter.forEach((c, pi) => {
      if (c && c !== prev && names[c]) {
        const a = L.a0 + pi * L.pp;
        ctx.strokeStyle = C.soft; ctx.lineWidth = 1;
        if (L.down) { line(a, 4, a, L.b0 - 3); ctx.fillText(c + ' ' + names[c], a + 4, 12); }
        else { line(a, 2, a, L.b0 - 4); ctx.fillText(c, 4, a + 9); }
      }
      if (c) prev = c;
    });

    // the light behind every lit sentence, and the dark behind every measured sentence the run passed without answer
    for (const id in EV) {
      if (EV[id].g !== 'measured') continue;
      const p = sentenceLit(id), c = L.cells[id];
      if (p >= 1) { ctx.fillStyle = C.lit; drawn.lit++; }
      else if (now() >= passedAt(id)) { ctx.fillStyle = C.ink; drawn.dark++; }
      else continue;
      rect(c.a - 2.5, c.b - (L.down ? 2.5 : 2), L.ca + 5, L.cb + (L.down ? 5 : 4));
    }
    // the report: every sentence a cell
    for (const id in L.cells) {
      const c = L.cells[id];
      const dim = focus && !focus.cells.has(+id);
      if (c.k === 0) { ctx.fillStyle = C.faint; rect(c.a, c.b, L.ca, L.cb); continue; }
      ctx.globalAlpha = dim ? 0.35 : 1;
      if (c.k === 1) { ctx.fillStyle = C.grey; rect(c.a, c.b, L.ca, L.cb); }
      else if (c.k === 2) { ctx.fillStyle = C.paper; rect(c.a, c.b, L.ca, L.cb); ctx.strokeStyle = C.ink; ctx.lineWidth = 1; srect(c.a + 0.5, c.b + 0.5, L.ca - 1, L.cb - 1); }
      else { ctx.fillStyle = C.ink; rect(c.a, c.b, L.ca, L.cb); drawn.black++; }
      const pm = EV[id].pass;
      if (pm) { ctx.fillStyle = pm === 'developer' ? C.red : C.soft; rect(c.a - 1.5, c.b + L.cb + 0.6, L.ca + 3, 2.2); }
      ctx.globalAlpha = 1;
    }

    // the legs: from each measured sentence through its page to every source it stands on
    for (const id in EV) {
      const e = EV[id];
      if (e.g !== 'measured' || !e.src) continue;
      const c = L.cells[id];
      for (const r of e.src) {
        const f = L.foot[r], s = SRC[r];
        const on = !focus || (focus.cells.has(+id) && focus.refs.has(r));
        ctx.globalAlpha = on ? (focus ? 1 : 0.8) : 0.12;
        ctx.strokeStyle = C.ink; ctx.lineWidth = focus && on ? 1.6 : 1;
        line(c.ac, c.bc, c.ac, L.slabB + 2); line(c.ac, L.slabB + 2, f.a, L.rowA - 7);
        drawn.legs++;
        ctx.globalAlpha = 1;
        if (s.test === 'yes' && s.out === 'rerunnable') {
          const p = legProgress(f.at);
          if (p > 0) {
            // the light climbs from the footing to the sentence: first the slant, then the page
            const l1 = Math.hypot(f.a - c.ac, L.rowA - 7 - L.slabB - 2), l2 = L.slabB + 2 - c.bc, tot = l1 + l2;
            let d = p * tot;
            ctx.strokeStyle = C.litInk; ctx.lineWidth = 2; ctx.globalAlpha = on ? 1 : 0.25;
            const q = Math.min(1, d / l1);
            line(f.a, L.rowA - 7, f.a + (c.ac - f.a) * q, L.rowA - 7 + (L.slabB + 2 - (L.rowA - 7)) * q);
            if (d > l1) line(c.ac, L.slabB + 2, c.ac, L.slabB + 2 - (d - l1));
            ctx.globalAlpha = 1;
          }
        }
      }
    }

    // the ground
    ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2;
    line(L.a0, L.rowA - 3, L.footEnd, L.rowA - 3);
    line(L.nine[0].a - L.fp / 2, L.rowA - 3, L.nine[L.nine.length - 1].a + L.fp / 2, L.rowA - 3);

    const f = L.f, h = f / 2;
    for (const r in L.foot) {
      const o = L.foot[r], s = o.s, a = o.a;
      const on = !focus || focus.refs.has(r);
      ctx.globalAlpha = on ? 1 : 0.25;
      const knock = !reduce && t0 !== null && now() >= o.at && now() < o.at + 260;
      if (s.test === 'no') {
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.beginPath();
        ctx.arc(X(a, L.rowA + h), Y(a, L.rowA + h), Math.max(2.2, f * 0.22), 0, 7); ctx.stroke(); drawn.rings++;
      } else if (s.test === 'unreached') {
        ctx.strokeStyle = C.ink; ctx.lineWidth = 1.2; ctx.setLineDash([2, 2]); srect(a - h + 0.6, L.rowA + 0.6, f - 1.2, f - 1.2); ctx.setLineDash([]);
      } else {
        const col = byMaker(s.runner) ? C.red : C.ink;
        if (s.out === 'rerunnable') {
          ctx.fillStyle = C.paper; rect(a - h, L.rowA, f, f);
          ctx.strokeStyle = col; ctx.lineWidth = 2; srect(a - h + 1, L.rowA + 1, f - 2, f - 2); drawn.open++;
        } else if (SEALED.has(s.out)) {
          ctx.fillStyle = col; rect(a - h, L.rowA, f, f); drawn.sealed++;
        } else {
          ctx.fillStyle = C.grey; rect(a - h, L.rowA, f, f); drawn.grey++;
        }
        // the place of a second run
        if (s.out === 'rerunnable' && reached(o.at)) {
          const p = Math.min(1, (now() - o.at) / 220);
          const k = (reduce || p === Infinity) ? 1 : 0.6 + 0.4 * p;
          ctx.fillStyle = C.lit; rect(a - h * k, L.rowB + h - h * k, f * k, f * k);
          ctx.strokeStyle = C.litInk; ctx.lineWidth = 1; srect(a - h * k + 0.5, L.rowB + h - h * k + 0.5, f * k - 1, f * k - 1);
          drawn.twins++;
        } else {
          ctx.strokeStyle = knock ? C.ink : C.slot; ctx.lineWidth = knock ? 1.8 : 1.2; ctx.setLineDash([2, 2]);
          srect(a - h + 0.5, L.rowB + 0.5, f - 1, f - 1); ctx.setLineDash([]); drawn.slots++;
        }
        if (s.pass && s.pass !== 'none') {
          ctx.fillStyle = s.pass === 'maker' ? C.red : C.ink; rect(a - h - 3, L.rowA - 8.5, f + 6, 3); drawn.pass++;
        }
      }
      ctx.globalAlpha = 1;
    }
    // step 3's nine, beside the report: no sentence stands on them
    const nf = focusNine();
    L.nine.forEach((n, i) => {
      const a = n.a;
      ctx.globalAlpha = (!focus && nf === null) || nf === i ? 1 : 0.25;
      ctx.fillStyle = n.c.maker ? C.red : C.ink; rect(a - h, L.rowA, f, f); drawn.nine++;
      const knock = !reduce && t0 !== null && now() >= n.at && now() < n.at + 260;
      ctx.strokeStyle = knock ? C.ink : C.slot; ctx.lineWidth = knock ? 1.8 : 1.2; ctx.setLineDash([2, 2]);
      srect(a - h + 0.5, L.rowB + 0.5, f - 1, f - 1); ctx.setLineDash([]); drawn.slots++;
      ctx.globalAlpha = 1;
    });
    ctx.fillStyle = C.soft; ctx.font = (L.down ? 10.5 : 9.5) + 'px ui-monospace,Menlo,Consolas,monospace';
    if (L.down) ctx.fillText("STEP 3'S NINE", L.nine[0].a - L.fp / 2, L.rowA - 14);
    else { ctx.save(); ctx.fillText("STEP 3'S", L.b0, L.nine[0].a + 3); ctx.fillText('NINE', L.b0, L.nine[0].a + 14); ctx.restore(); }

    // the hand of the second run, passing along the ground
    const t = now();
    if (t0 !== null && t >= 0 && t < SWEEP_MS) {
      const a = L.a0 + t / SWEEP_MS * (L.aEnd - L.a0);
      ctx.strokeStyle = C.litInk; ctx.lineWidth = 2; line(a, L.rowA - 12, a, L.rowB + f + 4);
    }
    // the chosen mark
    const m = pick || hover;
    if (m) {
      ctx.strokeStyle = C.hi; ctx.lineWidth = 2;
      if (m.kind === 'cell') { const c = L.cells[m.id]; srect(c.a - 3, c.b - 3, L.ca + 6, L.cb + 6); }
      else if (m.kind === 'foot') { const o = L.foot[m.ref]; srect(o.a - h - 3, L.rowA - 3, f + 6, f + 6); }
      else { const n = L.nine[m.i]; srect(n.a - h - 3, L.rowA - 3, f + 6, f + 6); }
    }
    window.__drawn = drawn;
  }

  function focusSet() {
    const m = pick || hover;
    if (!m || m.kind === 'nine') return m ? { cells: new Set(), refs: new Set() } : null;
    if (m.kind === 'cell') {
      const e = EV[m.id];
      return { cells: new Set([+m.id]), refs: new Set(e.src || []) };
    }
    const s = SRC[m.ref];
    return { cells: new Set(s.by), refs: new Set([m.ref]) };
  }
  function focusNine() { const m = pick || hover; return m && m.kind === 'nine' ? m.i : null; }

  // ------------------------------------------------------------------ the second run
  function loop() {
    draw();
    if (t0 !== null) {
      const t = now();
      if (soundOn) sounds(t);
      if (t > SWEEP_MS + LEG_MS + 50) { t0 = null; done = true; draw(); finished(); return; }
      requestAnimationFrame(loop);
    }
  }
  function start() {
    done = false; played = new Set();
    if (reduce) { t0 = null; done = true; draw(); finished(); return; }
    t0 = performance.now(); requestAnimationFrame(loop);
  }
  function finished() { document.body.dataset.run = 'done'; }

  // ------------------------------------------------------------------ sound: an outsider's second run, heard
  function ensureAudio() {
    if (audio) return audio;
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    const ac = new AC();
    const n = ac.createBuffer(1, ac.sampleRate * 0.12, ac.sampleRate), d = n.getChannelData(0);
    for (let i = 0; i < d.length; i++) d[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / d.length, 3);
    audio = { ac, noise: n };
    return audio;
  }
  function ping(pos) {          // a test someone else could run again: a struck tone that rings on
    const a = ensureAudio(); if (!a) return; const ac = a.ac, t = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = 330 * Math.pow(2, pos * 1.6);
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + 1.1);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + 1.2);
  }
  function knock() {            // a test only its runner can run: a dull knock, nothing rings
    const a = ensureAudio(); if (!a) return; const ac = a.ac, t = ac.currentTime;
    const s = ac.createBufferSource(), f = ac.createBiquadFilter(), g = ac.createGain();
    s.buffer = a.noise; f.type = 'lowpass'; f.frequency.value = 380; g.gain.value = 0.5;
    s.connect(f).connect(g).connect(ac.destination); s.start(t);
  }
  function sounds(t) {
    const span = L.aEnd - L.a0;
    for (const r in L.foot) {
      const o = L.foot[r]; if (o.s.test !== 'yes' || played.has(r) || t < o.at) continue;
      played.add(r);
      if (o.s.out === 'rerunnable') ping((o.a - L.a0) / span); else knock();
    }
    L.nine.forEach((n, i) => { const k = 'n' + i; if (!played.has(k) && t >= n.at) { played.add(k); knock(); } });
  }

  // ------------------------------------------------------------------ reading a mark
  function find(px, py) {
    const a = L.down ? px : py, b = L.down ? py : px;
    let best = null, bd = 9;
    if (b >= L.rowA - 10) {
      for (const r in L.foot) { const d = Math.abs(L.foot[r].a - a); if (d < Math.max(bd, L.fp / 2)) { bd = d; best = { kind: 'foot', ref: r }; } }
      L.nine.forEach((n, i) => { const d = Math.abs(n.a - a); if (d < Math.max(bd, L.fp / 2)) { bd = d; best = { kind: 'nine', i }; } });
      return best;
    }
    for (const id in EV) {
      const c = L.cells[id]; const d = Math.hypot(c.ac - a, c.bc - b);
      if (d < bd) { bd = d; best = { kind: 'cell', id }; }
    }
    return best;
  }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
  const OUT = {
    'rerunnable': 'yes: its materials are published and the model was open to outsiders when it was tested (at most; nobody here ran it)',
    'materials closed': 'no: the model was open to outsiders, but the items, prompts or protocol are withheld',
    'model closed': 'no: the model tested was not open to outsiders (a snapshot before release, an internal or unidentified version)',
    'closed': 'no: neither the model nor the materials are open to outsiders',
    'unstated': 'the source does not say enough to tell'
  };
  const RUN = { 'maker': 'the maker of a tested model', 'maker and others': 'the maker with others', 'third party': 'someone other than any tested model\'s maker', 'public body': 'a public body', 'unstated': 'the source does not say' };
  const GR = { measured: 'reports a measurement', inferred: 'infers, describes or judges', open: 'says it is not known' };
  function tell(m) {
    if (!m) { say.innerHTML = defaultSay; return; }
    if (m.kind === 'cell') {
      const e = EV[m.id];
      let h = `<b>Page ${e.p}</b> · ${esc(e.sec)} · the sentence ${GR[e.g]}; its test is for ${esc(e.tests)}`;
      if (e.pass) h += ` · it names a pass mark, set by ${e.pass === 'developer' ? 'a developer' : 'someone it does not name'}`;
      h += `<br>“${esc(e.t)}”`;
      if (e.g === 'measured') {
        if (!e.src.length) h += '<br>It names no source.';
        else {
          const lit = e.out === 'rerunnable';
          h += `<br>It stands on ${e.src.map(r => esc(r) + (SRC[r].ind ? '*' : '')).join(', ')}. ` +
            (lit ? '<span class="litw">At least one test beneath it could be run again by someone outside its maker.</span>'
              : e.out === 'no test in its sources' ? 'None of its sources reports a test.' : 'No test beneath it could be run again by anyone outside.');
        }
      }
      say.innerHTML = h; return;
    }
    if (m.kind === 'foot') {
      const s = SRC[m.ref];
      let h = `<b>Reference ${esc(s.ref)}${s.ind ? '*' : ''}</b> · cited by ${s.by.length} measured sentence${s.by.length > 1 ? 's' : ''} · ${esc(s.entry)}`;
      if (s.test === 'no') h += '<br>It reports no test of an AI model.' + (s.what ? ' ' + esc(s.what) : '');
      else if (s.test === 'unreached') h += '<br>The Field could not reach it.';
      else {
        h += `<br><b>Who ran it:</b> ${RUN[s.runner]}. <b>Could someone outside the maker run it again?</b> ${OUT[s.out]}.`;
        if (s.pass && s.pass !== 'none') h += ` <span class="redw">It applies a pass mark set by the ${esc(s.pass)}.</span>`;
        if (s.why_out) h += `<br>${esc(s.why_out)}`;
        if (s.quote) h += `<br>The source: “${esc(s.quote)}”`;
      }
      if (s.url) h += ` <a href="${esc(s.url)}" rel="noopener">source</a>`;
      say.innerHTML = h; return;
    }
    const c = L.nine[m.i].c;
    say.innerHTML = `<b>Step 3: incident ${c.aiid}</b> · maker ${esc(c.maker)} · ${esc(c.setting)}<br>“${esc(c.title)}” — ${esc(c.why_out)} The Atelier names an outside investigator: ${esc(c.atelier_out)}. <a href="${esc(c.url)}" rel="noopener">the maker's page</a>`;
  }
  const defaultSay = say.innerHTML;

  function pos(ev) { const r = cv.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; }
  cv.addEventListener('pointermove', ev => { if (ev.pointerType === 'touch') return; const m = find(...pos(ev)); if (JSON.stringify(m) !== JSON.stringify(hover)) { hover = m; if (!pick) tell(m); if (t0 === null) draw(); } });
  cv.addEventListener('pointerleave', () => { hover = null; if (!pick) tell(null); if (t0 === null) draw(); });
  cv.addEventListener('click', ev => { const m = find(...pos(ev)); pick = m && JSON.stringify(m) !== JSON.stringify(pick) ? m : null; tell(pick || hover); if (t0 === null) draw(); });

  document.getElementById('bRun').addEventListener('click', () => { if (soundOn) ensureAudio(); start(); });
  const bS = document.getElementById('bSound');
  bS.addEventListener('click', () => { soundOn = !soundOn; bS.setAttribute('aria-pressed', soundOn); if (soundOn) { const a = ensureAudio(); if (a && a.ac.state === 'suspended') a.ac.resume(); } });

  // ------------------------------------------------------------------ the key, drawn with the same marks
  function key() {
    const k = document.getElementById('key'), kc = k.getContext('2d');
    const W = Math.floor(k.parentElement.clientWidth), two = W >= 720;
    const items = [
      ['faint', 'a sentence of the report'],
      ['grey', 'on evaluation: inferred'],
      ['hollow', 'on evaluation: not known'],
      ['black', 'on evaluation: measured, with its legs'],
      ['open', 'a test someone outside could run again'],
      ['sealed', 'a test no one else can run again'],
      ['greysq', 'the source does not say (dashed: not reached)'],
      ['ring', 'a source with no test'],
      ['lit', 'the second run, and the claims it lights'],
      ['dark', 'a measured claim it does not reach'],
      ['red', 'red: the maker ran it, or set the line'],
      ['bar', 'a pass mark, the line a test must clear'],
    ];
    const cols = two ? 2 : 1, rows = Math.ceil(items.length / cols), rh = 19;
    const H = rows * rh + 4, dpr = Math.min(3, window.devicePixelRatio || 1);
    k.width = W * dpr; k.height = H * dpr; k.style.width = W + 'px'; k.style.height = H + 'px';
    kc.setTransform(dpr, 0, 0, dpr, 0, 0); kc.fillStyle = C.paper; kc.fillRect(0, 0, W, H);
    kc.font = '12px ui-monospace,Menlo,Consolas,monospace'; kc.textBaseline = 'middle';
    items.forEach(([m, t], i) => {
      const col = Math.floor(i / rows), row = i % rows, x = col * (W / cols), y = row * rh + 10;
      kc.lineWidth = 1.5;
      if (m === 'faint') { kc.fillStyle = C.faint; kc.fillRect(x + 4, y - 2, 8, 4); }
      if (m === 'grey') { kc.fillStyle = C.grey; kc.fillRect(x + 4, y - 2, 8, 4); }
      if (m === 'hollow') { kc.strokeStyle = C.ink; kc.lineWidth = 1; kc.strokeRect(x + 4.5, y - 2.5, 8, 5); }
      if (m === 'black') { kc.fillStyle = C.ink; kc.fillRect(x + 4, y - 2, 8, 4); kc.strokeStyle = C.ink; kc.lineWidth = 0.9; kc.beginPath(); kc.moveTo(x + 8, y + 2); kc.lineTo(x + 8, y + 8); kc.stroke(); }
      if (m === 'open') { kc.strokeStyle = C.ink; kc.lineWidth = 2; kc.strokeRect(x + 3, y - 5, 10, 10); }
      if (m === 'sealed') { kc.fillStyle = C.ink; kc.fillRect(x + 2, y - 6, 12, 12); }
      if (m === 'greysq') { kc.fillStyle = C.grey; kc.fillRect(x + 2, y - 6, 12, 12); }
      if (m === 'ring') { kc.strokeStyle = C.ink; kc.lineWidth = 1.2; kc.beginPath(); kc.arc(x + 8, y, 3, 0, 7); kc.stroke(); }
      if (m === 'dark') { kc.fillStyle = C.ink; kc.fillRect(x + 1, y - 4, 14, 8); }
      if (m === 'lit') { kc.fillStyle = C.lit; kc.fillRect(x + 2, y - 6, 12, 12); kc.strokeStyle = C.litInk; kc.lineWidth = 1; kc.strokeRect(x + 2.5, y - 5.5, 11, 11); }
      if (m === 'red') { kc.fillStyle = C.red; kc.fillRect(x + 2, y - 6, 12, 12); }
      if (m === 'bar') { kc.fillStyle = C.red; kc.fillRect(x + 1, y - 2, 14, 3); }
      kc.fillStyle = C.ink; kc.fillText(t, x + 22, y + 0.5);
    });
  }

  // ------------------------------------------------------------------ numbers on the page come from data.js
  document.querySelectorAll('[data-n]').forEach(el => {
    const v = N[el.dataset.n];
    el.textContent = typeof v === 'number' ? v.toLocaleString('en-GB') : v;
  });

  let rw = null;
  function resize() { size(); key(); draw(); }
  window.addEventListener('resize', () => { clearTimeout(rw); rw = setTimeout(() => { const w = L && L.W; resize(); }, 120); });
  resize();
  tell(null);
  // the page opens on the second run, once
  setTimeout(start, reduce ? 0 : 700);
})();
