/* SECOND RUN — the drawing (cycle 016, step 4). Own code, no library. Every number comes from data.js, which
   build.py writes from the Field's studies 80 to 83 and the Atelier's reading of the six, and checks against the
   Field's own counts. State 2 (2026-11-19): the light climbs a leg only as far as the source holds the result the
   report cites it for. State 3 (2026-11-19, the check): a second run is drawn in its mood (hatched: it could be
   made; struck: it was possible once), the nine are deeds rather than missing tests, and a last frame gathers the
   41 claims and sets every test in a row by what it is for and a column by who can reach it. */
(() => {
  'use strict';
  const D = window.SR, N = D.N;
  const C = {
    paper: '#f5f2ea', ink: '#1b1a17', soft: '#6d685d', grey: '#9a958a', faint: '#d8d2c3',
    slot: '#8f887a', red: '#c4301c', lit: '#f5c400', litPale: '#f8e6a0', litInk: '#9c7a00', hi: '#1d4fb8'
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

  // ------------------------------------------------------------------ layout of the last frame (state 3, the check)
  // Above: the 41 measured claims gathered into one block, beside the 160 that measure nothing. Below: every test,
  // in a row by what the claims that cite it test for, and in a column by who can reach it: someone else could run
  // it again (left), or only its runner holds it (right). The last row is step 3's nine deeds, which are not tests.
  const ROWS = [
    { key: 'other', title: 'SAFEGUARDS, TESTING', sub: 'tests behind the other claims' },
    { key: 'can', title: 'WHAT A MODEL CAN DO', sub: 'tests behind claims on capability' },
    { key: 'does', title: 'CONDUCT', sub: 'tests behind claims on control' },
    { key: 'nine', title: 'CONDUCT, UNTOLD', sub: "step 3's nine: deeds, not tests" },
  ];
  const HOW = { trained: 0, told: 1, asked: 2 };
  const passOf = s => s.pass && s.pass !== 'none';
  function openOrder(s) {      // the left column: what holds, then what holds less; what is gone last in each
    return (s.holds ? 0 : 2) + (s.gone ? 1 : 0) + (s.how ? HOW[s.how] / 10 : 0);
  }
  function closedOrder(s) {    // the right column: the maker's own first, those with a line first among them
    if (byMaker(s.runner)) return passOf(s) ? 0 : 1;
    return s.out === 'unstated' ? 3 : 2;
  }
  const UNDER = { closed: 3, unstated: 4, 'no test': 5 };
  function claimOrder(e) { return e.lit ? (e.once ? 1 : 0) : e.paper ? 2 : UNDER[e.under]; }
  function tallyLayout() {
    const W = Math.floor(tv.parentElement.clientWidth), wide = W >= 720;
    const t = { W, wide, items: [], rows: [], claims: [], small: [] };
    const tests = D.sources.filter(s => s.test === 'yes');
    const left = wide ? 228 : 10, gapCol = wide ? 34 : 0;
    const per = 14;                                   // the widest row holds 14 on each side
    const pitch = wide ? Math.min(27, Math.floor((W - left - gapCol - 6) / (2 * per))) : Math.min(21, Math.floor((W - 20) / per));
    const q = pitch - (wide ? 6 : 5);
    t.q = q; t.pitch = pitch; t.left = left;
    t.x0 = left; t.x1 = wide ? left + per * pitch + gapCol : left;
    let y = 4;
    // the claims
    const meas = Object.keys(EV).filter(i => EV[i].g === 'measured').sort((a, b) => claimOrder(EV[a]) - claimOrder(EV[b]) || (+a) - (+b));
    const cPer = wide ? 21 : Math.floor((W - 20) / pitch);
    const cTop = wide ? y + 8 : y + 40;
    meas.forEach((id, i) => {
      t.claims.push({ id, x: left + (i % cPer) * pitch, y: cTop + Math.floor(i / cPer) * (q + 6), at: passedAt(id) });
    });
    const cLines = Math.ceil(meas.length / cPer);
    const cBottom = cTop + cLines * (q + 6);
    // the 160 that measure nothing, as small cells, in the report's order
    const rest = Object.keys(EV).filter(i => EV[i].g !== 'measured').sort((a, b) => (EV[a].g === 'open') - (EV[b].g === 'open') || (+a) - (+b));
    const sp = wide ? 8 : 7, cell = sp - 2;
    let sx, sy, sPer;
    if (wide) { sx = left + cPer * pitch + 22; sy = cTop; sPer = Math.max(10, Math.floor((t.x1 + per * pitch - sx) / sp)); }
    else { sx = left; sy = cBottom + 8; sPer = Math.floor((W - 20) / sp); }
    rest.forEach((id, i) => t.small.push({ id, x: sx + (i % sPer) * sp, y: sy + Math.floor(i / sPer) * sp, s: cell }));
    t.smallEnd = sy + Math.ceil(rest.length / sPer) * sp;
    t.smallX = sx;
    t.claimsY = y;
    y = Math.max(cBottom + 22, t.smallEnd + 26, wide ? y + 82 : 0);
    t.headY = y;
    y += wide ? 38 : 64;
    // the rows
    const dual = tests.filter(s => s.row === 'both');
    ROWS.forEach(R => {
      const row = { R, y0: y };
      let open = [], closed = [];
      if (R.key !== 'nine') {
        const own = tests.filter(s => s.row === R.key || (s.row === 'both' && (R.key === 'can' || R.key === 'does')));
        open = own.filter(s => s.out === 'rerunnable').sort((a, b) => openOrder(a) - openOrder(b) || (+a.ref) - (+b.ref));
        closed = own.filter(s => s.out !== 'rerunnable').sort((a, b) => (b.row === 'both') - (a.row === 'both')
          || (R.key === 'does' ? (b.untold === true) - (a.untold === true) : 0) || closedOrder(a) - closedOrder(b) || (+a.ref) - (+b.ref));
      }
      const top = wide ? y + 8 : y + 36;
      const lineH = q + (wide ? 8 : 7);
      const place = (arr, x0, y0) => arr.map((m, i) => ({ x: x0 + (i % per) * pitch, y: y0 + Math.floor(i / per) * lineH }));
      const oLines = Math.max(1, Math.ceil(open.length / per)), cLines2 = Math.max(1, Math.ceil((R.key === 'nine' ? 9 : closed.length) / per));
      const oy = top, cy = wide ? top : top + oLines * lineH + (R.key === 'does' ? 34 : 4);
      const below = !wide && R.key === 'does' ? 26 : 0;      // on a phone, room under the closed line for its bracket
      place(open, t.x0, oy).forEach((p, i) => t.items.push({ ...p, row: R.key, s: open[i], side: 'open', at: L.foot[open[i].ref].at, dual: open[i].row === 'both' }));
      if (R.key === 'nine') {
        place(D.nine, t.x1, cy).forEach((p, i) => t.items.push({ ...p, row: 'nine', nine: i, at: L.nine[i].at }));
        row.noTest = { x: t.x0, y: oy, w: 6 * pitch - (pitch - q), h: q };
      } else {
        place(closed, t.x1, cy).forEach((p, i) => t.items.push({ ...p, row: R.key, s: closed[i], side: 'closed', at: L.foot[closed[i].ref].at, dual: closed[i].row === 'both' }));
      }
      if (R.key === 'does') {
        const n = closed.length;
        row.noLine = { x: t.x1 - 3, y: cy - 8, w: Math.min(n, per) * pitch - (pitch - q) + 6, h: 3.5 };
      }
      const h = wide ? Math.max(oLines, cLines2) * lineH + (R.key === 'does' ? 24 : 0) : (cy - top) + cLines2 * lineH + below;
      row.y1 = wide ? Math.max(y + 76, top + h) : top + h;
      y = row.y1 + (wide ? 12 : 14);
      t.rows.push(row);
    });
    t.H = y + 2;
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
    window.__frame = T;     // the last frame's layout, read by verify.mjs to point at its marks
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
    const drawn = { dark: 0, lit: 0, once: 0, copies: 0, hollow: 0, struck: 0, slots: 0, sealed: 0, open: 0, grey: 0, rings: 0, pass: 0, nine: 0, readers: 0, legs: 0, black: 0, arrive: 0, stop: 0 };

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
      if (p >= 1 && EV[id].once) {     // lit only by a run that was possible once: a ring of light, not a field
        ctx.strokeStyle = C.litInk; ctx.lineWidth = 1.5; ctx.setLineDash([2, 1.5]);
        srect(c.a - 2.5, c.b - (L.down ? 2.5 : 2), L.ca + 5, L.cb + (L.down ? 5 : 4)); ctx.setLineDash([]);
        drawn.lit++; drawn.once++; continue;
      }
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
        ctx.globalAlpha = on ? (focus ? 1 : done ? 0.42 : 0.8) : 0.12;
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
        ctx.strokeStyle = C.litInk; ctx.lineWidth = want === 1 ? 2.6 : 1.8; ctx.globalAlpha = on ? 1 : 0.25;
        if (s.gone) ctx.setLineDash([2, 3]);
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
        ctx.setLineDash([]);
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
            const sa = f * k, ox = X(a - h * k, L.rowB + h - h * k), oy = Y(a - h * k, L.rowB + h - h * k);
            hatch(ctx, ox, oy, sa, sa, 3);
            ctx.strokeStyle = C.litInk; ctx.lineWidth = 1; srect(a - h * k + 0.5, L.rowB + h - h * k + 0.5, f * k - 1, f * k - 1);
            drawn.copies++;
          } else {
            ctx.fillStyle = C.paper; rect(a - h, L.rowB, f, f);
            ctx.strokeStyle = C.litInk; ctx.lineWidth = 2; srect(a - h * k + 1, L.rowB + h - h * k + 1, f * k - 2, f * k - 2);
            drawn.hollow++;
          }
          if (s.gone && k === 1) { strike(ctx, X(a - h, L.rowB), Y(a - h, L.rowB), f, f); drawn.struck++; }
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
      const cx = X(a, L.rowA + h), cy = Y(a, L.rowA + h);
      ctx.fillStyle = C.red; ctx.beginPath(); ctx.arc(cx, cy, h, 0, 7); ctx.fill(); drawn.nine++;
      if (n.c.reader) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.5; ctx.setLineDash([2.5, 2]); ctx.beginPath(); ctx.arc(cx, cy, h + 2.5, 0, 7); ctx.stroke(); ctx.setLineDash([]); drawn.readers++; }
      const knock = !reduce && t0 !== null && now() >= n.at && now() < n.at + 260;
      if (knock) { ctx.strokeStyle = C.ink; ctx.lineWidth = 1.8; ctx.beginPath(); ctx.arc(cx, cy, h + 4.5, 0, 7); ctx.stroke(); }
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

  // ------------------------------------------------------------------ the last frame, filled by the same second run
  // hatched: a second run that could be made (the conditional); struck: one that was possible once (the past)
  function hatch(g, x, y, w, h, gap) {
    g.save(); g.beginPath(); g.rect(x, y, w, h); g.clip();
    g.fillStyle = C.litPale; g.fillRect(x, y, w, h);
    g.strokeStyle = C.litInk; g.lineWidth = gap > 3 ? 1.2 : 0.9; g.beginPath();
    for (let k = -h; k < w + h; k += gap) { g.moveTo(x + k, y + h); g.lineTo(x + k + h, y); }
    g.stroke(); g.restore();
  }
  function strike(g, x, y, w, h) {
    g.strokeStyle = C.ink; g.lineWidth = 1.6; g.beginPath(); g.moveTo(x - 2, y + h + 2); g.lineTo(x + w + 2, y - 2); g.stroke();
  }
  // a copy of a test, as the second run would leave it
  function copy(g, x, y, q, s, gap) {
    if (s.holds) { hatch(g, x, y, q, q, gap); g.strokeStyle = C.litInk; g.lineWidth = 1.2; g.strokeRect(x + 0.6, y + 0.6, q - 1.2, q - 1.2); }
    else { g.fillStyle = C.paper; g.fillRect(x, y, q, q); g.strokeStyle = C.litInk; g.lineWidth = q > 14 ? 2.5 : 2; g.strokeRect(x + 1.25, y + 1.25, q - 2.5, q - 2.5); }
    if (s.gone) strike(g, x, y, q, q);
  }
  function drawTally() {
    const g = tctx, q = T.q, wide = T.wide;
    g.fillStyle = C.paper; g.fillRect(0, 0, T.W, T.H);
    const dt = { claims: { lit: 0, once: 0, stopped: 0, closed: 0, unstated: 0, noTest: 0, waiting: 0 }, small: { grey: 0, hollow: 0 }, untold: 0,
      reach: 0, paper: 0, gone: 0, sealedMaker: 0, sealed: 0, grey: 0, pass: 0, noLine: 0, noTest: 0,
      deeds: 0, readers: 0, how: 0, dual: 0, counts: {} };
    const m = pick || hover;
    const F = (w, px) => (w ? w + ' ' : '') + px + 'px ui-monospace,Menlo,Consolas,monospace';
    const big = wide ? 21 : 15;
    g.textBaseline = 'alphabetic';

    // ---- the claims
    g.fillStyle = C.ink; g.font = F(700, wide ? 12 : 11);
    g.fillText('THE 41 MEASURED CLAIMS', wide ? 0 : 10, T.claimsY + (wide ? 16 : 13));
    g.font = F(0, wide ? 11 : 10); g.fillStyle = C.soft;
    g.fillText('of 201 on evaluation', wide ? 0 : 10, T.claimsY + (wide ? 31 : 27));
    let lit = 0, all = true;
    T.claims.forEach(c => {
      const e = EV[c.id], x = c.x, y = c.y;
      const on = !m || (m.kind === 'cell' && m.id === c.id) || (m.kind === 'foot' && (e.src || []).includes(m.ref));
      g.globalAlpha = on ? 1 : 0.3;
      const p = sentenceLit(c.id);
      if (p >= 1) {
        hatch(g, x, y, q, q, q > 14 ? 4 : 3); g.strokeStyle = C.litInk; g.lineWidth = 1.2; g.strokeRect(x + 0.6, y + 0.6, q - 1.2, q - 1.2);
        if (e.once) { strike(g, x, y, q, q); dt.claims.once++; } else dt.claims.lit++;
        lit++;
      } else if (now() >= c.at) {
        if (e.paper) { g.fillStyle = C.ink; g.fillRect(x, y, q, q); g.fillStyle = C.litInk; g.fillRect(x + 2, y + q - 5, q - 4, 3); dt.claims.stopped++; }
        else if (e.under === 'closed') { g.fillStyle = C.ink; g.fillRect(x, y, q, q); dt.claims.closed++; }
        else if (e.under === 'unstated') { g.fillStyle = C.grey; g.fillRect(x, y, q, q); dt.claims.unstated++; }
        else { g.strokeStyle = C.ink; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, q - 2, q - 2); dt.claims.noTest++; }
      } else {
        g.strokeStyle = C.faint; g.lineWidth = 1.2; g.strokeRect(x + 0.6, y + 0.6, q - 1.2, q - 1.2); dt.claims.waiting++; all = false;
      }
      g.globalAlpha = 1;
    });
    T.small.forEach(c => {
      const e = EV[c.id];
      if (e.g === 'open') { g.strokeStyle = C.ink; g.lineWidth = 1; g.strokeRect(c.x + 0.5, c.y + 0.5, c.s - 1, c.s - 1); dt.small.hollow++; }
      else { g.fillStyle = C.grey; g.fillRect(c.x, c.y, c.s, c.s); dt.small.grey++; }
    });
    g.font = F(0, wide ? 11 : 10); g.fillStyle = C.soft;
    g.fillText(T.small.length + ' more measure nothing', T.smallX, T.smallEnd + (wide ? 13 : 12));
    if (all) {
      const txt = lit + ' of ' + T.claims.length;
      dt.counts.claims = [lit, T.claims.length];
      g.font = F(700, big); g.fillStyle = C.litInk;
      const w = g.measureText(txt).width;
      if (wide) { g.fillText(txt, 0, T.claimsY + 58); g.font = F(0, 11); g.fillStyle = C.soft; g.fillText('a second run could reach', 0, T.claimsY + 73); }
      else g.fillText(txt, T.W - 10 - w, T.claimsY + 14);
    }

    // ---- the two columns
    g.strokeStyle = C.ink; g.lineWidth = 1.2;
    g.beginPath(); g.moveTo(0, T.headY - 8); g.lineTo(T.W, T.headY - 8); g.stroke();
    if (wide) {
      g.fillStyle = C.ink; g.font = F(700, 11.5);
      g.fillText('SOMEONE ELSE COULD RUN IT AGAIN', T.x0, T.headY + 10);
      g.fillText('ONLY ITS RUNNER HOLDS IT', T.x1, T.headY + 10);
      g.font = F(0, 11); g.fillStyle = C.soft;
      g.fillText('on paper: nothing here is run', T.x0, T.headY + 25);
      g.fillText('red: the maker ran it', T.x1, T.headY + 25);
      const xm = T.x1 - (T.x1 - (T.x0 + 14 * T.pitch)) / 2 - 3;
      g.strokeStyle = C.faint; g.lineWidth = 1; g.beginPath(); g.moveTo(xm, T.headY - 2); g.lineTo(xm, T.H - 4); g.stroke();
    } else {
      g.font = F(0, 10.5); g.fillStyle = C.ink;
      g.strokeStyle = C.ink; g.lineWidth = 1.6; g.strokeRect(10.8, T.headY + 2.8, 9.4, 9.4);
      g.fillText('1st line: someone else could run it', 26, T.headY + 11);
      g.fillText('again, on paper; nothing is run here', 26, T.headY + 23);
      g.fillStyle = C.ink; g.fillRect(10, T.headY + 30, 11, 11);
      g.fillText('2nd line: only its runner holds it;', 26, T.headY + 39);
      g.fillText('red: the maker ran it', 26, T.headY + 51);
    }

    // ---- the rows: title, and the count once the run has passed them
    T.rows.forEach(row => {
      const R = row.R;
      g.strokeStyle = C.faint; g.lineWidth = 1;
      g.beginPath(); g.moveTo(0, row.y0 - 6); g.lineTo(T.W, row.y0 - 6); g.stroke();
      g.fillStyle = C.ink; g.font = F(700, wide ? 12 : 11);
      g.fillText(R.title, wide ? 0 : 10, row.y0 + (wide ? 16 : 13));
      g.font = F(0, wide ? 11 : 10); g.fillStyle = C.soft;
      g.fillText(R.sub, wide ? 0 : 10, row.y0 + (wide ? 31 : 27));
      const its = T.items.filter(it => it.row === R.key);
      if (!its.every(it => reached(it.at))) return;
      let k, n, word;
      if (R.key === 'nine') { k = D.nine.filter(c => c.read_published).length; n = D.nine.length; word = 'records read outside'; }
      else { k = its.filter(it => it.s && rerun(it.s) && it.s.holds).length; n = its.length; word = 'a second run could reach'; }
      dt.counts[R.key] = [k, n];
      const txt = k + ' of ' + n;
      g.font = F(700, big); g.fillStyle = R.key === 'nine' ? C.ink : (k ? C.litInk : C.ink);
      const w = g.measureText(txt).width;
      if (wide) { g.fillText(txt, 0, row.y0 + 54); g.font = F(0, 11); g.fillStyle = C.soft; g.fillText(word, 0, row.y0 + 69); }
      else g.fillText(txt, T.W - 10 - w, row.y0 + 14);
    });

    // ---- the tests
    T.items.forEach(it => {
      const x = it.x, y = it.y;
      const on = !m || (it.s && m.kind === 'foot' && m.ref === it.s.ref) || (it.nine !== undefined && m.kind === 'nine' && m.i === it.nine)
        || (it.s && m.kind === 'cell' && (EV[m.id].src || []).includes(it.s.ref)) || (m.kind === 'noline' && it.row === 'does' && it.side === 'closed');
      g.globalAlpha = on ? 1 : 0.3;
      if (it.nine !== undefined) {                      // a deed: a disc the maker holds; ringed where someone outside read its record
        const c = D.nine[it.nine], r = q / 2;
        g.fillStyle = C.red; g.beginPath(); g.arc(x + r, y + r, r - 1, 0, 7); g.fill(); dt.deeds++;
        if (c.reader) { g.strokeStyle = C.ink; g.lineWidth = 1.8; g.setLineDash([3, 2.5]); g.beginPath(); g.arc(x + r, y + r, r + 2.5, 0, 7); g.stroke(); g.setLineDash([]); dt.readers++; }
      } else if (it.side === 'open') {
        const s = it.s;
        if (reached(it.at)) {
          copy(g, x, y, q, s, q > 14 ? 4 : 3);
          if (s.holds) dt.reach++; else dt.paper++;
          if (s.gone) dt.gone++;
        } else { g.strokeStyle = byMaker(s.runner) ? C.red : C.ink; g.lineWidth = 2; g.strokeRect(x + 1, y + 1, q - 2, q - 2); }
        if (byMaker(s.runner) && reached(it.at)) { g.fillStyle = C.red; g.fillRect(x, y - 5, q, 2.5); }   // the maker ran it
      } else {
        const s = it.s;
        if (SEALED.has(s.out)) { g.fillStyle = byMaker(s.runner) ? C.red : C.ink; g.fillRect(x, y, q, q); if (byMaker(s.runner)) dt.sealedMaker++; else dt.sealed++; }
        else { g.fillStyle = C.grey; g.fillRect(x, y, q, q); dt.grey++; }
        if (passOf(s) && it.row === 'can') { g.fillStyle = C.red; g.fillRect(x - 3, y - 7.5, q + 6, 3.5); dt.pass++; }
      }
      g.globalAlpha = 1;
    });
    // the one test cited under capability and under conduct: drawn in both rows, joined
    const duals = T.items.filter(it => it.dual);
    if (duals.length === 2) {
      const [a, b] = duals.sort((u, v) => u.y - v.y);
      g.strokeStyle = C.red; g.lineWidth = 1.5;
      if (wide) { g.beginPath(); g.moveTo(a.x + q / 2, a.y + q); g.lineTo(b.x + q / 2, b.y); g.stroke(); }
      else { g.fillStyle = C.paper; g.font = F(700, 9); duals.forEach(d => g.fillText('×2', d.x + 1.5, d.y + q - 3)); }
      dt.dual = 1;
    }
    // conduct has no line: where the maker's bar would stand, a dashed place, and no one's bar in it
    T.rows.forEach(row => {
      if (row.noLine && reached(Math.max(...T.items.filter(it => it.row === 'does').map(it => it.at)))) {
        const b = row.noLine;
        g.globalAlpha = !m || m.kind === 'noline' ? 1 : 0.4;
        g.strokeStyle = C.red; g.lineWidth = 1.5; g.setLineDash([6, 4]); g.strokeRect(b.x, b.y - 1, b.w, b.h + 1.5); g.setLineDash([]);
        g.fillStyle = C.red; g.font = F(700, wide ? 11 : 10);
        g.fillText('no line', b.x + b.w + 6, b.y + 5);
        g.globalAlpha = 1;
        dt.noLine = 1;
      }
      if (row.noTest) {                                  // under the conduct a test brings about: no test of conduct untold
        const b = row.noTest;
        g.strokeStyle = C.slot; g.lineWidth = 1.5; g.setLineDash([3, 3]); g.strokeRect(b.x + 0.75, b.y + 0.75, b.w - 1.5, b.h - 1.5); g.setLineDash([]);
        g.fillStyle = C.soft; g.font = F(0, wide ? 11 : 10); g.textBaseline = 'middle';
        g.fillText('no test', b.x + 8, b.y + b.h / 2 + 0.5); g.textBaseline = 'alphabetic';
        dt.noTest = 1;
      }
    });
    // the Atelier's word for how each repeatable test of conduct brings about what it measures
    const hows = T.items.filter(it => it.row === 'does' && it.side === 'open' && it.s.how && reached(it.at));
    const groups = [];
    hows.forEach(it => { const last = groups[groups.length - 1]; if (last && last.how === it.s.how && last.y === it.y) last.items.push(it); else groups.push({ how: it.s.how, y: it.y, items: [it] }); });
    let right = -1e9, lift = 0;
    groups.forEach(gr => {
      const x0 = gr.items[0].x + 1, x1 = gr.items[gr.items.length - 1].x + q - 1, yb = gr.y + q + 5;
      g.strokeStyle = C.ink; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(x0, yb - 3); g.lineTo(x0, yb); g.lineTo(x1, yb); g.lineTo(x1, yb - 3); g.stroke();
      g.fillStyle = C.ink; g.font = F(700, wide ? 12 : 10.5);
      const w = g.measureText(gr.how).width;
      let tx = Math.max((x0 + x1) / 2 - w / 2, x0 - 2);
      lift = tx < right + 5 ? (lift ? 0 : 12) : 0;
      g.fillText(gr.how, tx, yb + (wide ? 13 : 12) + lift);
      right = Math.max(right, tx + w);
      dt.how += gr.items.length;
    });
    // what models did untold: in the conduct row it stands only on the closed side, in the maker's own runs
    const un = T.items.filter(it => it.row === 'does' && it.side === 'closed' && it.s.untold && reached(it.at));
    if (un.length) {
      const x0 = Math.min(...un.map(it => it.x)) + 1, x1 = Math.max(...un.map(it => it.x)) + q - 1, yb = un[0].y + q + 5;
      g.strokeStyle = C.red; g.lineWidth = 1.2;
      g.beginPath(); g.moveTo(x0, yb - 3); g.lineTo(x0, yb); g.lineTo(x1, yb); g.lineTo(x1, yb - 3); g.stroke();
      g.fillStyle = C.red; g.font = F(700, wide ? 12 : 10.5);
      g.fillText('untold', x0, yb + (wide ? 13 : 12));
      dt.untold = un.length;
    }
    if (m) {
      g.strokeStyle = C.hi; g.lineWidth = 2;
      T.items.filter(it => (it.s && m.kind === 'foot' && m.ref === it.s.ref) || (it.nine !== undefined && m.kind === 'nine' && m.i === it.nine))
        .forEach(it => g.strokeRect(it.x - 3, it.y - 3, q + 6, q + 6));
      T.claims.filter(c => m.kind === 'cell' && m.id === c.id).forEach(c => g.strokeRect(c.x - 3, c.y - 3, q + 6, q + 6));
    }
    window.__drawnT = dt;
  }

  function focusSet() {
    const m = pick || hover;
    if (m && m.kind === 'noline') return null;
    if (!m || m.kind === 'nine') return m ? { cells: new Set(), refs: new Set() } : null;
    if (m.kind === 'cell') return { cells: new Set([+m.id]), refs: new Set(EV[m.id].src || []) };
    return { cells: new Set(SRC[m.ref].by), refs: new Set([m.ref]) };
  }
  function focusNine() { const m = pick || hover; return m && m.kind === 'nine' ? m.i : null; }
  // a mark of the last frame that is not on the drawing above (the line no one set) leaves the drawing as it is

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
      if (px >= it.x - 3 && px <= it.x + q + 3 && py >= it.y - 3 && py <= it.y + q + 3) {
        return it.nine !== undefined ? { kind: 'nine', i: it.nine } : { kind: 'foot', ref: it.s.ref };
      }
    }
    for (const c of T.claims) if (px >= c.x - 2 && px <= c.x + q + 2 && py >= c.y - 2 && py <= c.y + q + 2) return { kind: 'cell', id: c.id };
    for (const c of T.small) if (px >= c.x - 1 && px <= c.x + c.s + 1 && py >= c.y - 1 && py <= c.y + c.s + 1) return { kind: 'cell', id: c.id };
    for (const row of T.rows) {
      const b = row.noLine;
      if (b && px >= b.x - 4 && px <= b.x + b.w + 60 && py >= b.y - 8 && py <= b.y + 10) return { kind: 'noline' };
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
  const TODAY = { 'yes': 'The model it tested is still offered (the Field\'s second reader).', 'no': 'A model it tested is no longer offered (the Field\'s second reader): a second run of that part today would need another model.' };
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
            const what = s.test === 'yes' ? (rerun(s) ? 'could be run again' : s.out === 'unstated' ? 'the source does not say who could run it again' : 'no one else can run it again') : s.test === 'no' ? 'no test' : 'not reached';
            return `${esc(r)}${s.ind ? '*' : ''} (${what}) ${HOLDS[e.holds[r]] || ''}`;
          }).join('; ') + '. ';
          h += e.lit ? '<span class="litw">A second run could reach it: a test someone else could run again holds what the report says.</span>'
            + (e.once ? ' But only once: the hosted model that test ran on is no longer offered, so a second run today would need another model.' : '')
            : e.paper ? 'A test beneath it could be run again, but none of those holds what the report says, so the light would stop short.'
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
        if (s.pass && s.pass !== 'none') h += ` <span class="redw">It applies a pass mark set by the ${esc(s.pass)}, to a capability: ${esc((s.pass_on || []).join(', '))}.</span>`;
        if (rerun(s)) h += s.holds ? ' <span class="litw">It holds the result the report cites it for: a second run could reach the claim.</span>' : ' It does not hold the result the report cites it for in full.';
        if (rerun(s) && TODAY[s.today]) h += ' ' + TODAY[s.today];
        if (s.how) h += `<br><b>How the behaviour it measures was brought about</b> (the Atelier's reading): ${esc(s.how)}${s.how_also ? ', and also ' + esc(s.how_also) : ''}. ${esc(s.how_what)}`;
        if (s.quote) h += `<br>The source: “${esc(s.quote)}”`;
      }
      if (s.url) h += ` <a href="${esc(s.url)}" rel="noopener">source</a>`;
      say.innerHTML = h; return;
    }
    if (m.kind === 'noline') {
      say.innerHTML = `<b>No line for conduct.</b> All ${N.pass_tests} pass marks behind the report's measured claims are a maker's own, and each applies to a capability: biological or chemical, cyber, autonomy and AI research, persuasion. None applies to what a model does. Of the ${N.instruments} public instruments the report names, none sets a pass mark on a result: ${N.instr_left_dev} leave it to the developer, ${N.instr_power} give a public body a power to set one, which the Field found unused, ${N.instr_no_mark} name none (the Field's study 83).`;
      return;
    }
    const c = L.nine[m.i].c;
    say.innerHTML = `<b>Step 3: incident ${c.aiid}</b> · maker ${esc(c.maker)} · ${esc(c.setting)}<br>“${esc(c.title)}” — a deed, not a test: it is checked through its record, not run again. ${esc(c.why_out)} Someone outside its maker given the record, by the Atelier's reading: ${c.reader ? esc(c.atelier_out.replace(/^investigator: /, '')) + `; the maker's page says it will investigate, and this work's check found no reading by it published (${esc(D.meta.check_nine.read)})` : 'none named'}. <a href="${esc(c.url)}" rel="noopener">the maker's page</a>`;
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
      ['faint', 'a sentence; grey or hollow: on evaluation, unmeasured'],
      ['black', 'a measured claim, with its leg to its sources'],
      ['tests', 'a test: open, others could run it; solid, only its runner'],
      ['ring', 'a source that reports no test'],
      ['red', "red: the maker's; a bar: its pass mark; dashed: no line"],
      ['lit', 'hatched: a second run could be made and holds the claim'],
      ['hollowLit', 'outlined: it could be made, holds less; light stops (bar)'],
      ['gone', 'struck: possible once; the model is no longer offered'],
      ['deed', "a disc: a deed of step 3; dashed ring: given to an outside reader"],
    ];
    const cols = two ? 2 : 1, rows = Math.ceil(items.length / cols), rh = two ? 21 : 20;
    const font = (two ? 12 : 10.5) + 'px ui-monospace,Menlo,Consolas,monospace';
    // on a narrow screen an item wraps onto a second line rather than running off the edge
    kc.font = font;
    const wrap = t => {
      const room = W / cols - 30, out = [''];
      t.split(' ').forEach(w => { const cand = out[out.length - 1] ? out[out.length - 1] + ' ' + w : w; if (kc.measureText(cand).width <= room) out[out.length - 1] = cand; else out.push(w); });
      return out;
    };
    const lines = items.map(([, t]) => wrap(t));
    const ys = []; let acc = 0;
    items.forEach((_, i) => { if (i % rows === 0) acc = 0; ys.push(acc + 11); acc += rh + (lines[i].length - 1) * 14; });
    const colH = [0, 0]; items.forEach((_, i) => { const c = Math.floor(i / rows); colH[c] = Math.max(colH[c], ys[i] + (lines[i].length - 1) * 14 + 12); });
    const H = Math.max(...colH) + 4, dpr = Math.min(3, window.devicePixelRatio || 1);
    k.width = W * dpr; k.height = H * dpr; k.style.width = W + 'px'; k.style.height = H + 'px';
    kc.setTransform(dpr, 0, 0, dpr, 0, 0); kc.fillStyle = C.paper; kc.fillRect(0, 0, W, H);
    kc.font = font; kc.textBaseline = 'middle';
    items.forEach(([m, t], i) => {
      const col = Math.floor(i / rows), x = col * (W / cols), y = ys[i];
      kc.lineWidth = 1.5;
      if (m === 'faint') { kc.fillStyle = C.faint; kc.fillRect(x, y - 2, 5, 4); kc.fillStyle = C.grey; kc.fillRect(x + 7, y - 2, 5, 4); kc.strokeStyle = C.ink; kc.lineWidth = 1; kc.strokeRect(x + 14.5, y - 1.5, 4, 3); }
      if (m === 'black') { kc.fillStyle = C.ink; kc.fillRect(x + 5, y - 3, 8, 4); kc.strokeStyle = C.ink; kc.lineWidth = 0.9; kc.beginPath(); kc.moveTo(x + 9, y + 1); kc.lineTo(x + 9, y + 8); kc.stroke(); }
      if (m === 'tests') { kc.strokeStyle = C.ink; kc.lineWidth = 2; kc.strokeRect(x + 1, y - 4, 8, 8); kc.fillStyle = C.ink; kc.fillRect(x + 11, y - 5, 10, 10); }
      if (m === 'ring') { kc.strokeStyle = C.ink; kc.lineWidth = 1.2; kc.beginPath(); kc.arc(x + 9, y, 3, 0, 7); kc.stroke(); }
      if (m === 'red') { kc.fillStyle = C.red; kc.fillRect(x + 1, y - 3, 9, 9); kc.fillRect(x - 1, y - 7, 13, 2.5); kc.strokeStyle = C.red; kc.lineWidth = 1.2; kc.setLineDash([2, 2]); kc.strokeRect(x + 13, y - 2, 8, 3); kc.setLineDash([]); }
      if (m === 'lit') { hatch(kc, x + 3, y - 6, 12, 12, 3.5); kc.strokeStyle = C.litInk; kc.lineWidth = 1; kc.strokeRect(x + 3.5, y - 5.5, 11, 11); }
      if (m === 'hollowLit') { kc.strokeStyle = C.litInk; kc.lineWidth = 2.5; kc.strokeRect(x + 3, y - 5, 10, 10); }
      if (m === 'gone') { hatch(kc, x + 3, y - 6, 12, 12, 3.5); kc.strokeStyle = C.litInk; kc.lineWidth = 1; kc.strokeRect(x + 3.5, y - 5.5, 11, 11); strike(kc, x + 3, y - 6, 12, 12); }
      if (m === 'deed') { kc.fillStyle = C.red; kc.beginPath(); kc.arc(x + 9, y, 5, 0, 7); kc.fill(); kc.strokeStyle = C.ink; kc.lineWidth = 1.4; kc.setLineDash([2.5, 2]); kc.beginPath(); kc.arc(x + 9, y, 7.5, 0, 7); kc.stroke(); kc.setLineDash([]); }
      kc.fillStyle = C.ink; lines[i].forEach((ln, j) => kc.fillText(ln, x + 26, y + 0.5 + j * 14));
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
