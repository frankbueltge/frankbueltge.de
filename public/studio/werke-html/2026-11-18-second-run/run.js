/* SECOND RUN — the drawing (cycle 016, step 4). Own code, no library. Every number comes from data.js, which
   build.py writes from the Field's studies 80 and 81 and its check 82, and the Atelier's reading of the six, and
   checks against the Field's own counts. State 2 (2026-11-19): the light climbs a leg only as far as the source
   holds the result the report cites it for, and the tally below sorts the tests by what they are for. */
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
  const rerun = s => s.test === 'yes' && s.out === 'rerunnable';
  const reduce = window.matchMedia && matchMedia('(prefers-reduced-motion: reduce)').matches;
  const SWEEP_MS = 7000, LEG_MS = 900;
  // how far up its leg the light of a second run gets, by what the source holds of the result the report cites
  const REACH = { 'holds': 1, 'partly': -1, 'not found': 0.35, 'not checkable': 0.35 };   // -1: to the foot of the page

  const cv = document.getElementById('work'), ctx = cv.getContext('2d');
  const tv = document.getElementById('tally'), tctx = tv.getContext('2d');
  const say = document.getElementById('say');
  let L = null, T = null;   // the layouts of the drawing and of the tally
  let t0 = null;            // start of the running second run (performance.now), or null
  let done = false;         // the second run has passed the whole ground
  let hover = null, pick = null;
  let audio = null, soundOn = false, played = new Set();

  // ------------------------------------------------------------------ layout of the drawing
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
    for (let i = 1; i < xs.length; i++) xs[i] = Math.max(xs[i], xs[i - 1] + l.fp);
    l.foot = {};
    tgt.forEach((o, i) => { l.foot[o.s.ref] = { a: xs[i], s: o.s }; });
    l.nine = D.nine.map((c, i) => ({ a: l.nineA + (i + 0.5) * l.fp, c }));
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

  // ------------------------------------------------------------------ layout of the tally: the tests by what they are for
  const ROWS = [
    { key: 'can', title: 'WHAT A MODEL CAN DO', sub: 'tests behind claims on capability' },
    { key: 'does', title: 'WHAT A MODEL DOES', sub: 'tests behind claims on conduct' },
    { key: 'other', title: 'SAFEGUARDS, TESTING ITSELF', sub: 'tests behind the other claims' },
    { key: 'nine', title: 'WHAT A MODEL DID, UNTOLD', sub: "step 3's nine deeds, not tests" },
  ];
  const HOW = { trained: 0, told: 1, asked: 2 };
  function order(s) {          // within a row: what a second run reaches, then what it could run, then the empty
    if (rerun(s) && s.holds) return s.how ? HOW[s.how] / 10 : 0;
    if (rerun(s)) return 1;
    return byMaker(s.runner) ? 3 : 2;
  }
  function tallyLayout() {
    const W = Math.floor(tv.parentElement.clientWidth), wide = W >= 720;
    const t = { W, wide, items: [], rows: [] };
    const q = wide ? 22 : 15, pitch = wide ? 29 : 20, left = wide ? 286 : 10;
    const perLine = wide ? 99 : Math.max(8, Math.floor((W - left - 4) / pitch));
    t.q = q; t.pitch = pitch;
    let y = wide ? 8 : 4;
    const tests = D.sources.filter(s => s.test === 'yes');
    const dual = tests.filter(s => s.row === 'both');
    ROWS.forEach(R => {
      let members;
      if (R.key === 'nine') members = D.nine.map((c, i) => ({ nine: i, c }));
      else {
        const own = tests.filter(s => s.row === R.key).sort((x, y) => order(x) - order(y) || (+x.ref) - (+y.ref));
        members = (R.key === 'can' || R.key === 'does') ? dual.concat(own) : own;
      }
      const row = { R, y0: y };
      if (!wide) y += 40;                                   // on a phone the title stands above its squares
      const sqTop = wide ? y + 6 : y;
      const lines = Math.ceil(members.length / perLine);
      members.forEach((m, i) => {
        const col = i % perLine, ln = Math.floor(i / perLine);
        const x = left + col * pitch, yy = sqTop + ln * (q + (wide ? 22 : 18));
        const it = { x, y: yy, row: R.key };
        if (m.nine !== undefined) { it.nine = m.nine; it.at = L.nine[m.nine].at; }
        else { it.s = m; it.at = L.foot[m.ref].at; it.dual = m.row === 'both'; }
        t.items.push(it);
      });
      const h = lines * (q + (wide ? 22 : 18)) + (R.key === 'does' ? 12 : 0);   // room for the Atelier's words
      row.y1 = wide ? Math.max(y + 58, sqTop + h) : sqTop + h;
      y = row.y1 + (wide ? 10 : 12);
      t.rows.push(row);
    });
    t.H = y + 4;
    t.left = left;
    return t;
  }

  function size() {
    L = layout();
    const dpr = Math.min(3, window.devicePixelRatio || 1);
    const w = L.down ? L.W : L.bEnd, h = L.down ? L.bEnd : L.aEnd;
    cv.width = Math.round(w * dpr); cv.height = Math.round(h * dpr);
    cv.style.width = w + 'px'; cv.style.height = h + 'px';
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    T = tallyLayout();
    tv.width = Math.round(T.W * dpr); tv.height = Math.round(T.H * dpr);
    tv.style.width = T.W + 'px'; tv.style.height = T.H + 'px';
    tctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  }

  // ------------------------------------------------------------------ what the second run has reached
  function now() { return t0 === null ? (done ? Infinity : -1) : performance.now() - t0; }
  function reached(at) { return now() >= at; }
  function legProgress(at) { const t = now(); return t === Infinity ? 1 : Math.max(0, Math.min(1, (t - at) / LEG_MS)); }
  // a measured sentence is lit when the light of a source that holds what the report cites it for has arrived
  function sentenceLit(id) {
    let best = 0;
    for (const r of EV[id].src || []) {
      const s = SRC[r];
      if (rerun(s) && EV[id].holds[r] === 'holds') best = Math.max(best, legProgress(L.foot[r].at));
    }
    return best;
  }
  function passedAt(id) {
    const src = EV[id].src || [];
    return src.length ? Math.max(...src.map(r => L.foot[r].at)) + LEG_MS : SWEEP_MS;
  }

  // ------------------------------------------------------------------ the drawing
  function draw() {
    const W = cv.width, H = cv.height;
    ctx.save(); ctx.setTransform(1, 0, 0, 1, 0, 0); ctx.fillStyle = C.paper; ctx.fillRect(0, 0, W, H); ctx.restore();
    const focus = focusSet();
    const drawn = { dark: 0, lit: 0, copies: 0, hollow: 0, slots: 0, sealed: 0, open: 0, grey: 0, rings: 0, pass: 0, nine: 0, legs: 0, black: 0, arrive: 0, stop: 0 };

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

    // the legs, and the light of a second run on them
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
        if (!rerun(s)) continue;
        const p = legProgress(f.at);
        if (p <= 0) continue;
        const l1 = Math.hypot(f.a - c.ac, L.rowA - 7 - L.slabB - 2), l2 = L.slabB + 2 - c.bc, tot = l1 + l2;
        const want = REACH[e.holds[r]], goal = want === 1 ? tot : want < 0 ? l1 : want * l1;
        const d = p * goal;
        ctx.strokeStyle = C.litInk; ctx.lineWidth = want === 1 ? 2.2 : 1.8; ctx.globalAlpha = on ? 1 : 0.25;
        const q = Math.min(1, d / l1);
        const ea = f.a + (c.ac - f.a) * q, eb = L.rowA - 7 + (L.slabB + 2 - (L.rowA - 7)) * q;
        line(f.a, L.rowA - 7, ea, eb);
        if (d > l1) line(c.ac, L.slabB + 2, c.ac, L.slabB + 2 - (d - l1));
        if (p >= 1) {
          if (want === 1) drawn.arrive++;
          else {   // where the light stops: a short bar across the leg
            const ua = c.ac - f.a, ub = L.slabB + 2 - (L.rowA - 7), ul = Math.hypot(ua, ub) || 1;
            const na = -ub / ul * 4, nb = ua / ul * 4;
            ctx.lineWidth = 2; line(ea - na, eb - nb, ea + na, eb + nb);
            drawn.stop++;
          }
        }
        ctx.globalAlpha = 1;
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
        // the place of a second run: a copy where it can be made, solid where it holds what the report cites
        if (s.out === 'rerunnable' && reached(o.at)) {
          const p = Math.min(1, (now() - o.at) / 220);
          const k = (reduce || p === Infinity) ? 1 : 0.6 + 0.4 * p;
          if (s.holds) {
            ctx.fillStyle = C.lit; rect(a - h * k, L.rowB + h - h * k, f * k, f * k);
            ctx.strokeStyle = C.litInk; ctx.lineWidth = 1; srect(a - h * k + 0.5, L.rowB + h - h * k + 0.5, f * k - 1, f * k - 1);
            drawn.copies++;
          } else {
            ctx.fillStyle = C.paper; rect(a - h, L.rowB, f, f);
            ctx.strokeStyle = C.litInk; ctx.lineWidth = 2; srect(a - h * k + 1, L.rowB + h - h * k + 1, f * k - 2, f * k - 2);
            drawn.hollow++;
          }
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
      ctx.fillStyle = C.red; rect(a - h, L.rowA, f, f); drawn.nine++;
      const knock = !reduce && t0 !== null && now() >= n.at && now() < n.at + 260;
      ctx.strokeStyle = knock ? C.ink : C.slot; ctx.lineWidth = knock ? 1.8 : 1.2; ctx.setLineDash([2, 2]);
      srect(a - h + 0.5, L.rowB + 0.5, f - 1, f - 1); ctx.setLineDash([]); drawn.slots++;
      ctx.globalAlpha = 1;
    });
    ctx.fillStyle = C.soft; ctx.font = (L.down ? 10.5 : 9.5) + 'px ui-monospace,Menlo,Consolas,monospace';
    if (L.down) ctx.fillText("STEP 3'S NINE", L.nine[0].a - L.fp / 2, L.rowA - 14);
    else { ctx.fillText("STEP 3'S", L.b0, L.nine[0].a + 3); ctx.fillText('NINE', L.b0, L.nine[0].a + 14); }

    // the hand of the second run, passing along the ground
    const t = now();
    if (t0 !== null && t >= 0 && t < SWEEP_MS) {
      const a = L.a0 + t / SWEEP_MS * (L.aEnd - L.a0);
      ctx.strokeStyle = C.litInk; ctx.lineWidth = 2; line(a, L.rowA - 12, a, L.rowB + f + 4);
    }
    const m = pick || hover;
    if (m) {
      ctx.strokeStyle = C.hi; ctx.lineWidth = 2;
      if (m.kind === 'cell') { const c = L.cells[m.id]; srect(c.a - 3, c.b - 3, L.ca + 6, L.cb + 6); }
      else if (m.kind === 'foot') { const o = L.foot[m.ref]; srect(o.a - h - 3, L.rowA - 3, f + 6, f + 6); }
      else { const n = L.nine[m.i]; srect(n.a - h - 3, L.rowA - 3, f + 6, f + 6); }
    }
    window.__drawn = drawn;
    drawTally();
  }

  // ------------------------------------------------------------------ the tally, filled by the same second run
  function drawTally() {
    const g = tctx, q = T.q;
    g.fillStyle = C.paper; g.fillRect(0, 0, T.W, T.H);
    const drawnT = { reach: 0, paper: 0, empty: 0, emptyMaker: 0, nine: 0, how: 0, dual: 0, pass: 0, counts: {} };
    const m = pick || hover;
    const big = T.wide ? 20 : 15, mid = T.wide ? 12 : 11;
    // the rows: title, and the count once the run has passed
    T.rows.forEach((row, ri) => {
      const R = row.R;
      g.strokeStyle = C.faint; g.lineWidth = 1;
      if (ri) { g.beginPath(); g.moveTo(0, row.y0 - (T.wide ? 5 : 6)); g.lineTo(T.W, row.y0 - (T.wide ? 5 : 6)); g.stroke(); }
      g.fillStyle = C.ink; g.textBaseline = 'alphabetic';
      g.font = '700 ' + mid + 'px ui-monospace,Menlo,Consolas,monospace';
      g.fillText(R.title, T.wide ? 0 : 10, row.y0 + (T.wide ? 16 : 13));
      g.font = (T.wide ? 11 : 10) + 'px ui-monospace,Menlo,Consolas,monospace'; g.fillStyle = C.soft;
      g.fillText(R.sub, T.wide ? 0 : 10, row.y0 + (T.wide ? 31 : 27));
      const its = T.items.filter(it => it.row === R.key);
      const all = its.every(it => reached(it.at));
      const reach = its.filter(it => it.s && rerun(it.s) && it.s.holds).length;
      if (all) {
        const txt = reach + ' of ' + its.length;
        drawnT.counts[R.key] = [reach, its.length];
        g.font = '700 ' + big + 'px ui-monospace,Menlo,Consolas,monospace'; g.fillStyle = reach ? C.litInk : C.ink;
        const w = g.measureText(txt).width;
        if (T.wide) g.fillText(txt, 0, row.y0 + 56);
        else g.fillText(txt, T.W - 10 - w, row.y0 + 14);
        if (T.wide) {
          g.font = '11px ui-monospace,Menlo,Consolas,monospace'; g.fillStyle = C.soft;
          g.fillText(R.key === 'nine' ? 'none can be repeated' : 'reached by a second run', w + 8, row.y0 + 55);
        }
      }
    });
    // the one test that stands in both rows: a band joining its two places
    const duals = T.items.filter(it => it.dual);
    if (duals.length === 2) {
      const [a, b] = duals;
      g.strokeStyle = C.red; g.lineWidth = 1.5; g.setLineDash([2, 2]);
      if (T.wide) g.strokeRect(a.x + 0.75, a.y + 0.75, q - 1.5, b.y + q - a.y - 1.5);
      else {      // on a phone a title stands between the rows: the same test, drawn in each, joined by a mark
        duals.forEach(d => g.strokeRect(d.x + 0.75, d.y + 0.75, q - 1.5, q - 1.5));
        g.setLineDash([]); g.fillStyle = C.red; g.font = '700 9px ui-monospace,Menlo,Consolas,monospace';
        duals.forEach(d => g.fillText('×2', d.x + 2, d.y + q - 4));
      }
      g.setLineDash([]);
      drawnT.dual = 1;
    }
    // the squares
    T.items.forEach(it => {
      const x = it.x, y = it.y;
      const on = !m || (it.s && m.kind === 'foot' && m.ref === it.s.ref) || (it.nine !== undefined && m.kind === 'nine' && m.i === it.nine)
        || (it.s && m.kind === 'cell' && (EV[m.id].src || []).includes(it.s.ref));
      g.globalAlpha = on ? 1 : 0.3;
      if (it.nine !== undefined) {
        g.strokeStyle = C.red; g.lineWidth = 1.5; g.setLineDash([2, 2]); g.strokeRect(x + 0.75, y + 0.75, q - 1.5, q - 1.5); g.setLineDash([]);
        drawnT.nine++;
      } else {
        const s = it.s, got = reached(it.at);
        if (!it.dual) {
          if (got && rerun(s) && s.holds) {
            g.fillStyle = C.lit; g.fillRect(x, y, q, q); g.strokeStyle = C.litInk; g.lineWidth = 1; g.strokeRect(x + 0.5, y + 0.5, q - 1, q - 1);
            drawnT.reach++;
          } else if (got && rerun(s)) {
            g.strokeStyle = C.litInk; g.lineWidth = 2.5; g.strokeRect(x + 1.25, y + 1.25, q - 2.5, q - 2.5);
            drawnT.paper++;
          } else {
            g.strokeStyle = byMaker(s.runner) ? C.red : C.slot; g.lineWidth = 1.5; g.setLineDash([2, 2]);
            g.strokeRect(x + 0.75, y + 0.75, q - 1.5, q - 1.5); g.setLineDash([]);
            if (byMaker(s.runner)) drawnT.emptyMaker++; else drawnT.empty++;
          }
        }
        if (s.pass && s.pass !== 'none' && (!it.dual || it.row === 'can')) { g.fillStyle = C.red; g.fillRect(x - 3, y - 7, q + 6, 3.5); drawnT.pass++; }
      }
      g.globalAlpha = 1;
    });
    // the Atelier's word for how each repeatable test of conduct brings about what it measures: one bracket a word
    const hows = T.items.filter(it => it.row === 'does' && it.s && it.s.how && reached(it.at));
    const groups = [];
    hows.forEach(it => { const last = groups[groups.length - 1]; if (last && last.how === it.s.how && last.y === it.y) last.items.push(it); else groups.push({ how: it.s.how, y: it.y, items: [it] }); });
    let right = -1e9, lift = 0;
    groups.forEach(gr => {
      const x0 = gr.items[0].x + 1, x1 = gr.items[gr.items.length - 1].x + q - 1, yb = gr.y + q + 4;
      g.strokeStyle = C.ink; g.lineWidth = 1;
      g.beginPath(); g.moveTo(x0, yb - 2); g.lineTo(x0, yb); g.lineTo(x1, yb); g.lineTo(x1, yb - 2); g.stroke();
      g.fillStyle = C.ink; g.font = (T.wide ? 11 : 9.5) + 'px ui-monospace,Menlo,Consolas,monospace';
      const w = g.measureText(gr.how).width;
      let tx = (x0 + x1) / 2 - w / 2;
      tx = Math.max(tx, x0 - 2);
      lift = tx < right + 5 ? (lift ? 0 : 11) : 0;      // a word that would touch the last one drops a line
      g.fillText(gr.how, tx, yb + (T.wide ? 12 : 11) + lift);
      right = Math.max(right, tx + w);
      drawnT.how += gr.items.length;
    });
    if (m) {
      const its = T.items.filter(it => (it.s && m.kind === 'foot' && m.ref === it.s.ref) || (it.nine !== undefined && m.kind === 'nine' && m.i === it.nine));
      g.strokeStyle = C.hi; g.lineWidth = 2; its.forEach(it => g.strokeRect(it.x - 3, it.y - 3, q + 6, q + 6));
    }
    window.__drawnT = drawnT;
  }

  function focusSet() {
    const m = pick || hover;
    if (!m || m.kind === 'nine') return m ? { cells: new Set(), refs: new Set() } : null;
    if (m.kind === 'cell') return { cells: new Set([+m.id]), refs: new Set(EV[m.id].src || []) };
    return { cells: new Set(SRC[m.ref].by), refs: new Set([m.ref]) };
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
  // a test someone else could run again: a struck tone; it rings on where the source holds the cited result,
  // and is choked off at once where it does not
  function ping(pos, holds) {
    const a = ensureAudio(); if (!a) return; const ac = a.ac, t = ac.currentTime;
    const o = ac.createOscillator(), g = ac.createGain();
    o.type = 'sine'; o.frequency.value = 330 * Math.pow(2, pos * 1.6);
    const end = holds ? 1.2 : 0.14;
    g.gain.setValueAtTime(0.0001, t); g.gain.exponentialRampToValueAtTime(0.18, t + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, t + end);
    o.connect(g).connect(ac.destination); o.start(t); o.stop(t + end + 0.05);
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
      if (rerun(o.s)) ping((o.a - L.a0) / span, o.s.holds); else knock();
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
  function findT(px, py) {
    const q = T.q;
    for (const it of T.items) {
      const h = T.wide && it.dual && it.row === 'can' ? (T.items.find(o => o.dual && o.row === 'does').y + q - it.y) : q;
      if (px >= it.x - 3 && px <= it.x + q + 3 && py >= it.y - 3 && py <= it.y + h + 3) {
        return it.nine !== undefined ? { kind: 'nine', i: it.nine } : { kind: 'foot', ref: it.s.ref };
      }
    }
    return null;
  }
  const esc = s => String(s == null ? '' : s).replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' })[ch]);
  const OUT = {
    'rerunnable': 'yes, on paper: its materials are published and the model was open to outsiders when it was tested (nobody here ran it)',
    'materials closed': 'no: the model was open to outsiders, but the items, prompts or protocol are withheld',
    'model closed': 'no: the model tested was not open to outsiders (a snapshot before release, an internal or unidentified version)',
    'closed': 'no: neither the model nor the materials are open to outsiders',
    'unstated': 'the source does not say enough to tell'
  };
  const RUN = { 'maker': 'the maker of a tested model', 'maker and others': 'the maker with others', 'third party': 'someone other than any tested model\'s maker', 'public body': 'a public body', 'unstated': 'the source does not say' };
  const GR = { measured: 'reports a measurement', inferred: 'infers, describes or judges', open: 'says it is not known' };
  const HOLDS = { 'holds': 'holds the result', 'partly': 'holds it only in part', 'not found': 'does not hold it', 'not checkable': 'could not be checked for it' };
  const TODAY = { 'yes': 'The model it tested is still offered (the Field\'s second reader).', 'no': 'The model it tested is no longer offered (the Field\'s second reader): a second run today would need another model.' };
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
          h += '<br>' + e.src.map(r => {
            const s = SRC[r];
            const what = s.test === 'yes' ? (rerun(s) ? 'could be run again' : 'no one else can run it again') : s.test === 'no' ? 'no test' : 'not reached';
            return `${esc(r)}${s.ind ? '*' : ''} (${what}) ${HOLDS[e.holds[r]] || ''}`;
          }).join('; ') + '. ';
          h += e.lit ? '<span class="litw">A second run reaches it: a test anyone could run again holds what the report says.</span>'
            : e.paper ? 'A test beneath it could be run again, but none of those holds what the report says, so the light stops short.'
              : 'No test beneath it could be run again by anyone outside.';
          if (e.lit1 && !e.lit) h += ' <i>The first state lit it; corrected 19 November.</i>';
        }
      }
      say.innerHTML = h; return;
    }
    if (m.kind === 'foot') {
      const s = SRC[m.ref];
      let h = `<b>Reference ${esc(s.ref)}${s.ind ? '*' : ''}</b> · cited by ${s.by.length} measured sentence${s.by.length > 1 ? 's' : ''} on ${esc(s.groups.join(' and '))} · ${esc(s.entry)}`;
      if (s.test === 'no') h += '<br>It reports no test of an AI model.' + (s.what ? ' ' + esc(s.what) : '');
      else if (s.test === 'unreached') h += '<br>The Field could not reach it.';
      else {
        h += `<br><b>Who ran it:</b> ${RUN[s.runner]}. <b>Could someone outside the maker run it again?</b> ${OUT[s.out]}.`;
        if (s.out1 !== s.out) h += ` <i>The first reading said: ${esc(s.out1)}; the Field's blind second reading, decided on a third, corrects it (19 November).</i>`;
        if (s.runner1 !== s.runner) h += ` <i>Its runner was first read as: ${esc(s.runner1)}.</i>`;
        if (s.pass && s.pass !== 'none') h += ` <span class="redw">It applies a pass mark set by the ${esc(s.pass)}.</span>`;
        if (rerun(s)) h += s.holds ? ' <span class="litw">It holds the result the report cites it for.</span>' : ' It does not hold the result the report cites it for in full.';
        if (rerun(s) && TODAY[s.today]) h += ' ' + TODAY[s.today];
        if (s.how) h += `<br><b>How the behaviour it measures was brought about</b> (the Atelier's reading): ${esc(s.how)}${s.how_also ? ', and also ' + esc(s.how_also) : ''}. ${esc(s.how_what)}`;
        if (s.quote) h += `<br>The source: “${esc(s.quote)}”`;
      }
      if (s.url) h += ` <a href="${esc(s.url)}" rel="noopener">source</a>`;
      say.innerHTML = h; return;
    }
    const c = L.nine[m.i].c;
    say.innerHTML = `<b>Step 3: incident ${c.aiid}</b> · maker ${esc(c.maker)} · ${esc(c.setting)}<br>“${esc(c.title)}” — ${esc(c.why_out)} The Atelier names an outside investigator: ${esc(c.atelier_out)}. <a href="${esc(c.url)}" rel="noopener">the maker's page</a>`;
  }
  const defaultSay = say.innerHTML;

  function bind(el, finder) {
    const pos = ev => { const r = el.getBoundingClientRect(); return [ev.clientX - r.left, ev.clientY - r.top]; };
    el.addEventListener('pointermove', ev => { if (ev.pointerType === 'touch') return; const m = finder(...pos(ev)); if (JSON.stringify(m) !== JSON.stringify(hover)) { hover = m; if (!pick) tell(m); if (t0 === null) draw(); } });
    el.addEventListener('pointerleave', () => { hover = null; if (!pick) tell(null); if (t0 === null) draw(); });
    el.addEventListener('click', ev => { const m = finder(...pos(ev)); pick = m && JSON.stringify(m) !== JSON.stringify(pick) ? m : null; tell(pick || hover); if (t0 === null) draw(); });
  }
  bind(cv, find); bind(tv, findT);

  document.getElementById('bRun').addEventListener('click', () => { if (soundOn) ensureAudio(); start(); });
  const bS = document.getElementById('bSound');
  bS.addEventListener('click', () => { soundOn = !soundOn; bS.setAttribute('aria-pressed', soundOn); if (soundOn) { const a = ensureAudio(); if (a && a.ac.state === 'suspended') a.ac.resume(); } });

  // ------------------------------------------------------------------ the key, drawn with the same marks
  function key() {
    const k = document.getElementById('key'), kc = k.getContext('2d');
    const W = Math.floor(k.parentElement.clientWidth), two = W >= 720;
    const items = [
      ['faint', 'a sentence of the report'],
      ['grey', 'on evaluation: inferred (hollow: not known)'],
      ['black', 'on evaluation: measured, with its legs'],
      ['open', 'a test someone outside could run again, on paper'],
      ['sealed', 'a test no one else can run (grey: does not say)'],
      ['ring', 'a source with no test'],
      ['lit', 'a second run that holds the result the report cites'],
      ['hollowLit', 'a second run that could be made, but holds less'],
      ['stop', 'where the light stops: the source holds less'],
      ['dark', 'a measured claim no second run reaches'],
      ['empty', 'a place no second run can fill'],
      ['red', 'red: the maker ran it, or set the line (bar)'],
    ];
    const cols = two ? 2 : 1, rows = Math.ceil(items.length / cols), rh = 19;
    const H = rows * rh + 4, dpr = Math.min(3, window.devicePixelRatio || 1);
    k.width = W * dpr; k.height = H * dpr; k.style.width = W + 'px'; k.style.height = H + 'px';
    kc.setTransform(dpr, 0, 0, dpr, 0, 0); kc.fillStyle = C.paper; kc.fillRect(0, 0, W, H);
    kc.font = (two ? 12 : 10.5) + 'px ui-monospace,Menlo,Consolas,monospace'; kc.textBaseline = 'middle';
    items.forEach(([m, t], i) => {
      const col = Math.floor(i / rows), row = i % rows, x = col * (W / cols), y = row * rh + 10;
      kc.lineWidth = 1.5;
      if (m === 'faint') { kc.fillStyle = C.faint; kc.fillRect(x + 4, y - 2, 8, 4); }
      if (m === 'grey') { kc.fillStyle = C.grey; kc.fillRect(x + 1, y - 2, 6, 4); kc.strokeStyle = C.ink; kc.lineWidth = 1; kc.strokeRect(x + 9.5, y - 2.5, 6, 5); }
      if (m === 'black') { kc.fillStyle = C.ink; kc.fillRect(x + 4, y - 2, 8, 4); kc.strokeStyle = C.ink; kc.lineWidth = 0.9; kc.beginPath(); kc.moveTo(x + 8, y + 2); kc.lineTo(x + 8, y + 8); kc.stroke(); }
      if (m === 'open') { kc.strokeStyle = C.ink; kc.lineWidth = 2; kc.strokeRect(x + 3, y - 5, 10, 10); }
      if (m === 'sealed') { kc.fillStyle = C.ink; kc.fillRect(x + 2, y - 6, 12, 12); }
      if (m === 'ring') { kc.strokeStyle = C.ink; kc.lineWidth = 1.2; kc.beginPath(); kc.arc(x + 8, y, 3, 0, 7); kc.stroke(); }
      if (m === 'lit') { kc.fillStyle = C.lit; kc.fillRect(x + 2, y - 6, 12, 12); kc.strokeStyle = C.litInk; kc.lineWidth = 1; kc.strokeRect(x + 2.5, y - 5.5, 11, 11); }
      if (m === 'hollowLit') { kc.strokeStyle = C.litInk; kc.lineWidth = 2.5; kc.strokeRect(x + 3, y - 5, 10, 10); }
      if (m === 'stop') { kc.strokeStyle = C.litInk; kc.lineWidth = 2; kc.beginPath(); kc.moveTo(x + 1, y + 5); kc.lineTo(x + 11, y - 3); kc.stroke(); kc.beginPath(); kc.moveTo(x + 8.5, y - 6); kc.lineTo(x + 13.5, y); kc.stroke(); }
      if (m === 'dark') { kc.fillStyle = C.ink; kc.fillRect(x + 1, y - 4, 14, 8); }
      if (m === 'empty') { kc.strokeStyle = C.slot; kc.lineWidth = 1.5; kc.setLineDash([2, 2]); kc.strokeRect(x + 2.5, y - 5.5, 11, 11); kc.setLineDash([]); }
      if (m === 'red') { kc.fillStyle = C.red; kc.fillRect(x + 2, y - 4, 12, 9); kc.fillRect(x + 0, y - 8, 16, 2.5); }
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
  window.addEventListener('resize', () => { clearTimeout(rw); rw = setTimeout(resize, 120); });
  resize();
  tell(null);
  setTimeout(start, reduce ? 0 : 700);
})();
