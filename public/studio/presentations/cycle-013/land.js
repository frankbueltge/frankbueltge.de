// NO PUBLIC LAND — the world's counted AI compute as one surveyed land, parcelled by owner.
// Data: data.js (built by build.py from the Field's study 65; every figure asserted there).
// Own code, Apache-2.0. No library.
(function () {
  "use strict";
  const D = window.NPL;
  const Q = D.quarters;
  const FIVE = new Set(D.five);
  const SMUG = "China (smuggled)";
  const NQ = Q.length;
  const LAST_FULL = NQ - 2; // 2025-12-31; the last quarter is unfinished
  const MAXT = Math.max(...Q.map(q => q.total));
  const STAKES = D.stakes || [];
  // a stake stands from its survey until a later phase of the same site replaces it
  const standing = (m, qi) => m.q <= qi && (m.until === undefined || qi < m.until);
  function hash(str) { let h = 2166136261; for (let i = 0; i < str.length; i++) { h ^= str.charCodeAt(i); h = Math.imul(h, 16777619); } return (h >>> 0) / 4294967296; }
  STAKES.forEach((m, i) => { const key = (m.n || "anon") + "|" + m.c + "|" + i; m.ha = hash(key) * Math.PI * 2; m.hr = Math.sqrt(hash(key + "r")); });

  // fixed owners, fixed homes on the unit land (x east, y south), fixed harmonic of the hum
  const OWN = [
    { n: "Google",    x: 0.10, y: -0.18, h: 1 },
    { n: "Microsoft", x: -0.22, y: 0.05, h: 2 },
    { n: "Meta",      x: 0.25, y: 0.22, h: 3 },
    { n: "Amazon",    x: -0.05, y: 0.35, h: 4 },
    { n: "Oracle",    x: 0.38, y: -0.02, h: 5 },
    { n: "CoreWeave", x: 0.45, y: -0.42, h: 6 },
    { n: "xAI",       x: 0.10, y: -0.62, h: 7 },
    { n: "China",     x: -0.62, y: -0.20, h: 8 },
    { n: "Other",     x: -0.40, y: 0.62, h: 9 },
  ];
  const IDX = Object.fromEntries(OWN.map((o, i) => [o.n, i]));
  const K = OWN.length;

  // the coast: a fixed noisy radius, normalised so the land's area is exactly that of the unit disk
  const NA = 720;
  const coast = new Float32Array(NA);
  (function () {
    let s2 = 0;
    for (let i = 0; i < NA; i++) {
      const a = (i / NA) * Math.PI * 2;
      const r = 1 + 0.055 * Math.sin(3 * a + 0.4) + 0.04 * Math.sin(5 * a + 2.1) + 0.025 * Math.sin(11 * a + 0.7)
        + 0.015 * Math.sin(23 * a + 1.3) + 0.008 * Math.sin(41 * a + 2.9);
      coast[i] = r; s2 += r * r;
    }
    const k = Math.sqrt(NA / s2);
    for (let i = 0; i < NA; i++) coast[i] *= k;
  })();
  function coastR(x, y) {
    let a = Math.atan2(y, x); if (a < 0) a += Math.PI * 2;
    return coast[Math.floor((a / (Math.PI * 2)) * NA) % NA];
  }

  // the survey grid on which each parcel's area is fitted to its owner's share
  const G = 150, ext = 1.15;
  const cells = [];
  for (let j = 0; j < G; j++) for (let i = 0; i < G; i++) {
    const x = -ext + (2 * ext * (i + 0.5)) / G, y = -ext + (2 * ext * (j + 0.5)) / G;
    if (Math.hypot(x, y) <= coastR(x, y)) cells.push(x, y);
  }
  const NC = cells.length / 2;

  const sx = new Float64Array(K), sy = new Float64Array(K), w = new Float64Array(K);
  const live = new Uint8Array(K), target = new Float64Array(K), area = new Float64Array(K);
  const cx = new Float64Array(K), cy = new Float64Array(K);
  OWN.forEach((o, i) => { sx[i] = o.x; sy[i] = o.y; });

  // the land at a continuous time t (0 … NQ-1): holdings move straight from one survey to the next
  function state(t) {
    const i = Math.min(Math.floor(t), NQ - 1), f = Math.min(t - i, 1), j = Math.min(i + 1, NQ - 1);
    const A = Q[i].owners, B = Q[j].owners;
    const names = new Set([...Object.keys(A), ...Object.keys(B)]);
    const v = {};
    for (const n of names) {
      const a = A[n] || { m: 0, lo: 0, hi: 0, mw: 0 }, b = B[n] || { m: 0, lo: 0, hi: 0, mw: 0 };
      v[n] = { m: a.m + (b.m - a.m) * f, lo: a.lo + (b.lo - a.lo) * f, hi: a.hi + (b.hi - a.hi) * f, mw: a.mw + (b.mw - a.mw) * f };
    }
    let total = 0, mw = 0;
    for (const n in v) { total += v[n].m; mw += v[n].mw; }
    return { v, total, mw, land: total - (v[SMUG] ? v[SMUG].m : 0) };
  }

  function fit(st, iters) {
    let sum = 0;
    for (let k = 0; k < K; k++) {
      const o = st.v[OWN[k].n];
      target[k] = o && o.m > 0 ? o.m : 0;
      if (target[k] > 0 && !live[k]) { live[k] = 1; w[k] = -0.02; sx[k] = OWN[k].x; sy[k] = OWN[k].y; }
      if (target[k] === 0) live[k] = 0;
      sum += target[k];
    }
    for (let k = 0; k < K; k++) target[k] = (target[k] / sum) * NC;
    for (let it = 0; it < iters; it++) {
      area.fill(0); cx.fill(0); cy.fill(0);
      for (let c = 0; c < NC; c++) {
        const x = cells[2 * c], y = cells[2 * c + 1];
        let best = -1, bd = 1e9;
        for (let k = 0; k < K; k++) {
          if (!live[k]) continue;
          const d = (x - sx[k]) ** 2 + (y - sy[k]) ** 2 - w[k];
          if (d < bd) { bd = d; best = k; }
        }
        area[best]++; cx[best] += x; cy[best] += y;
      }
      for (let k = 0; k < K; k++) {
        if (!live[k]) continue;
        w[k] += 1.4 * (target[k] - area[k]) / NC;
        if (area[k] > 0) {
          const mx = cx[k] / area[k], my = cy[k] / area[k];
          sx[k] += 0.35 * (mx - sx[k]); sy[k] += 0.35 * (my - sy[k]);
          cx[k] = mx; cy[k] = my;
        }
      }
      let mean = 0, nl = 0;
      for (let k = 0; k < K; k++) if (live[k]) { mean += w[k]; nl++; }
      mean /= nl;
      for (let k = 0; k < K; k++) if (live[k]) w[k] -= mean;
    }
  }

  // ---- drawing ----
  const cv = document.getElementById("land");
  const ctx = cv.getContext("2d");
  const tip = document.getElementById("tip");
  let W = 0, H = 0, dpr = 1, img = null, own = null, own2 = null;
  const INK = [29, 27, 24], PAPER = [239, 233, 220], RED = [140, 47, 27], GREY = [104, 99, 90];

  const STYLE = OWN.map(o => {
    const five = FIVE.has(o.n);
    const s = { ink: five ? RED : GREY, ang: 0, sp: 5, lw: 1.2, cross: false, stipple: false };
    const ang = { Google: 45, Microsoft: -45, Meta: 0, Amazon: 90, Oracle: 22, CoreWeave: 67, xAI: -22, China: 45, Other: 0 }[o.n];
    s.ang = (ang * Math.PI) / 180;
    if (five) { s.sp = 4; s.lw = 1.5; }
    if (o.n === "China") { s.cross = true; s.sp = 7; s.lw = 1; }
    if (o.n === "Other") { s.stipple = true; }
    if (o.n === "CoreWeave" || o.n === "xAI") { s.sp = 7; s.lw = 1.1; }
    return s;
  });

  let mode = "true"; // "true": the land at its true scale; "fill": every quarter fills the sheet
  let t = LAST_FULL, playing = false, hover = -1;
  let geom = null;

  function resize() {
    const r = cv.getBoundingClientRect();
    dpr = Math.min(window.devicePixelRatio || 1, 2);
    W = Math.round(r.width); H = Math.round(r.height);
    cv.width = Math.round(W * dpr); cv.height = Math.round(H * dpr);
    img = ctx.createImageData(cv.width, cv.height);
    own = new Int8Array(cv.width * cv.height);
    own2 = new Int8Array(cv.width * cv.height).fill(-1);
    draw();
  }

  function layout(st) {
    const narrow = W < 640;
    const Rmax = Math.min(W * (narrow ? 0.36 : 0.30), H * (narrow ? 0.24 : 0.37));
    const ox = narrow ? W * 0.5 : W * 0.55, oy = narrow ? H * 0.45 : H * 0.55;
    const R = mode === "true" ? Rmax * Math.sqrt(st.land / MAXT) : Rmax * 0.97;
    const unit = mode === "true" ? Rmax / Math.sqrt(MAXT) : R / Math.sqrt(st.land); // px per sqrt(H100e) / sqrt(pi)
    // the inset: the same division at one size, top right (true scale only; "fill the sheet" is the division itself)
    const ir = narrow ? 36 : 62;
    const inset = mode === "true" ? { x: W - ir - (narrow ? 14 : 30), y: (narrow ? 30 : 30) + ir + 16, r: ir } : null;
    return { Rmax, ox, oy, R, unit, narrow, inset };
  }

  function draw() {
    if (!img) return;
    const st = state(t);
    fit(st, playing ? 6 : 60);
    const L = layout(st); geom = L;
    const pw = cv.width, ph = cv.height, data = img.data;
    const R = L.R * dpr, ox = L.ox * dpr, oy = L.oy * dpr;
    // paper and sea lines
    for (let y = 0; y < ph; y++) {
      const sea = (y % Math.round(9 * dpr)) === 0;
      for (let x = 0; x < pw; x++) {
        const p = (y * pw + x) * 4;
        const c = sea ? 0.93 : 1;
        data[p] = PAPER[0] * c; data[p + 1] = PAPER[1] * c; data[p + 2] = PAPER[2] * c; data[p + 3] = 255;
      }
    }
    own.fill(-1);
    paint(own, ox, oy, R, true);
    // the inset: the same division at one fixed size, so the five's spread reads while the land is still a speck
    if (L.inset) { paint(own2, L.inset.x * dpr, L.inset.y * dpr, L.inset.r * dpr, false); }
    ctx.putImageData(img, 0, 0);
    overlay(st, L);
    hud(st);
    hum(st);
  }

  function paint(ownA, ox, oy, R, main) {
    const pw = cv.width, ph = cv.height, data = img.data;
    const x0 = Math.max(0, Math.floor(ox - R * 1.12)), x1 = Math.min(pw - 1, Math.ceil(ox + R * 1.12));
    const y0 = Math.max(0, Math.floor(oy - R * 1.12)), y1 = Math.min(ph - 1, Math.ceil(oy + R * 1.12));
    if (!(R > 0.5)) return;
    if (!main) for (let y = y0; y <= y1; y++) ownA.fill(-1, y * pw + x0, y * pw + x1 + 1);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const ux = (x - ox) / R, uy = (y - oy) / R;
      if (Math.hypot(ux, uy) > coastR(ux, uy)) continue;
      let best = -1, bd = 1e9;
      for (let k = 0; k < K; k++) {
        if (!live[k]) continue;
        const d = (ux - sx[k]) ** 2 + (uy - sy[k]) ** 2 - w[k];
        if (d < bd) { bd = d; best = k; }
      }
      ownA[y * pw + x] = best;
    }
    const s1 = dpr * (main ? 1 : 0.8);
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const k = ownA[y * pw + x]; if (k < 0) continue;
      const S = STYLE[k], p = (y * pw + x) * 4;
      let col = PAPER, on = false;
      const xs = x / s1, ys = y / s1;
      if (S.stipple) {
        const hsh = Math.sin(xs * 12.9898 + ys * 78.233) * 43758.5453;
        on = (hsh - Math.floor(hsh)) < 0.06;
      } else {
        const u = xs * Math.cos(S.ang) + ys * Math.sin(S.ang);
        on = ((u % S.sp) + S.sp) % S.sp < S.lw;
        if (S.cross && !on) { const u2 = xs * Math.cos(-S.ang) + ys * Math.sin(-S.ang); on = ((u2 % S.sp) + S.sp) % S.sp < S.lw; }
      }
      const lit = main && hover === k;
      if (on) col = lit ? INK : S.ink;
      else col = lit ? [230, 221, 202] : PAPER;
      data[p] = col[0]; data[p + 1] = col[1]; data[p + 2] = col[2];
    }
    // parcel boundaries and the coast in ink
    const lw = Math.max(1, Math.round(dpr));
    for (let y = y0; y <= y1; y++) for (let x = x0; x <= x1; x++) {
      const k = ownA[y * pw + x];
      let edge = false, coastE = false;
      for (let d = 1; d <= lw && !edge; d++) {
        const nb = [x + d < pw ? ownA[y * pw + x + d] : -1, y + d < ph ? ownA[(y + d) * pw + x] : -1];
        for (const m of nb) if (m !== k) { edge = true; if (m < 0 || k < 0) coastE = true; }
      }
      if (!edge) continue;
      const p = (y * pw + x) * 4;
      data[p] = INK[0]; data[p + 1] = INK[1]; data[p + 2] = INK[2];
      if (coastE && main) for (const q of [p - 4, p + 4, p - pw * 4, p + pw * 4]) if (q >= 0 && q < data.length) { data[q] = INK[0]; data[q + 1] = INK[1]; data[q + 2] = INK[2]; }
    }
  }

  function fmtM(v) { return v >= 1e6 ? (v / 1e6).toFixed(1) + " M" : v >= 1e3 ? Math.round(v / 1e3) + " k" : String(Math.round(v)); }

  function overlay(st, L) {
    ctx.save(); ctx.scale(dpr, dpr);
    const qi = Math.round(t), q = Q[qi];
    // the last finished quarter's coast, where the unfinished one falls short
    if (mode === "true" && Math.abs(t - (NQ - 1)) < 0.5) {
      const Rg = L.Rmax * Math.sqrt((Q[LAST_FULL].total - Q[LAST_FULL].owners[SMUG].m) / MAXT);
      ctx.setLineDash([3, 4]); ctx.strokeStyle = "#1d1b18"; ctx.lineWidth = 1;
      ctx.beginPath();
      for (let i = 0; i <= NA; i++) { const a = (i / NA) * Math.PI * 2, r = coast[i % NA] * Rg; const x = L.ox + r * Math.cos(a), y = L.oy + r * Math.sin(a); i ? ctx.lineTo(x, y) : ctx.moveTo(x, y); }
      ctx.stroke(); ctx.setLineDash([]);
      ctx.fillStyle = "#1d1b18"; ctx.font = "12px ui-monospace, Menlo, monospace"; ctx.textAlign = "center";
      ctx.fillText("the coast at the end of 2025", L.ox, L.oy - Rg * 1.08 - 8);
    }
    // the smuggled chips: offshore, never surveyed, modelled within a range
    const sm = st.v[SMUG];
    if (sm && sm.m > 0) {
      const r = (k) => L.unit * Math.sqrt(k);
      const R = L.R, rh = r(sm.hi);
      const sxp = L.narrow ? W * 0.24 : L.ox + Math.max(R, 30) * 1.1 + rh + 40;
      const syp = L.narrow ? L.oy + L.Rmax * 1.03 + rh + 20 : L.oy + Math.max(R, 30) * 0.45;
      ctx.fillStyle = "#1d1b18";
      const rm = r(sm.m), n = Math.min(900, Math.round(rm * rm * 0.5));
      for (let i = 0; i < n; i++) { const a = i * 2.39996, rr = rm * Math.sqrt((i + 0.5) / n); ctx.fillRect(sxp + rr * Math.cos(a), syp + rr * Math.sin(a), 1.2, 1.2); }
      ctx.setLineDash([1, 3]); ctx.strokeStyle = "#1d1b18";
      for (const k of [sm.lo, sm.hi]) { ctx.beginPath(); ctx.arc(sxp, syp, r(k), 0, Math.PI * 2); ctx.stroke(); }
      ctx.setLineDash([]);
      if (rh > 8) {
        ctx.font = "12px ui-monospace, Menlo, monospace"; ctx.fillStyle = "#1d1b18";
        const lines = ["smuggled into China", "past US export controls:", "the one place a state's", "law shows on this sheet", "(modelled, never surveyed)"];
        ctx.textAlign = "center";
        if (L.narrow) lines.forEach((s, i) => ctx.fillText(s, sxp, syp + rh + 14 + 14 * i));
        else lines.forEach((s, i) => ctx.fillText(s, sxp, syp - rh - 8 - 14 * (lines.length - 1 - i)));
      }
      geom.shoal = { x: sxp, y: syp, r: r(sm.hi), v: sm };
    } else if (geom) geom.shoal = null;
    // the stakes: Epoch's cluster list laid on the land, each at its true area, in its owner's parcel
    geom.stakes = [];
    const showStakes = document.getElementById("stk").checked;
    const qs = Math.min(Math.round(t), LAST_FULL);
    const px2 = Math.PI * L.unit * L.unit; // px² per H100e
    const col = [], adrift = [];
    if (showStakes) {
      const pw = cv.width;
      for (const m of STAKES) {
        if (!standing(m, qs)) continue;
        const side = Math.sqrt(px2 * m.h);
        if (m.home === "public" || m.home === "mixed") { col.push({ m, side }); continue; }
        const k = IDX[m.home];
        if (k === undefined || !live[k]) { adrift.push({ m, side }); continue; }
        const rad = Math.sqrt(target[k] / NC) * L.R * 0.95;
        let f = m.hr, x = 0, y = 0, ok = false;
        for (let tries = 0; tries < 9 && !ok; tries++, f *= 0.6) {
          x = L.ox + cx[k] * L.R + f * rad * Math.cos(m.ha);
          y = L.oy + cy[k] * L.R + f * rad * Math.sin(m.ha);
          const i = Math.round(y * dpr) * pw + Math.round(x * dpr);
          ok = own[i] === k;
        }
        drawStake(m, x, y, side, false);
      }
    }
    // the column the owner table does not have: a state, a public. It is not a parcel of size zero; it is
    // a column missing from the record, so it stands off the coast, dashed, and holds only what another list
    // (the cluster list, 10–20 % of the world's capacity) stakes there.
    {
      const cw = L.narrow ? Math.min(W * 0.44, 170) : 168;
      const cxL = L.narrow ? W * 0.52 : Math.max(16, L.ox - L.Rmax * 1.08 - cw - 24);
      const top = L.narrow ? L.oy + L.Rmax * 1.08 + 26 : L.oy - L.Rmax * 0.55;
      // shelf-pack the public stakes, largest first, at the land's own scale; where they would leave the
      // sheet (early quarters filling the sheet), they are drawn smaller and the column says by how much
      const room = Math.max(60, H - 70 - (top + 30) - (L.narrow ? 70 : 90));
      let x = 0, y = 0, shelf = 0, placed = [], shrink = 1;
      const pad = 3;
      for (let tries = 0; tries < 30; tries++) {
        x = 0; y = 0; shelf = 0; placed = [];
        for (const it of col) {
          const sd = Math.max(it.side * shrink, 2);
          if (x + sd > cw - 2 * pad && x > 0) { x = 0; y += shelf + pad; shelf = 0; }
          placed.push({ it, x: cxL + pad + x + sd / 2, y: top + 30 + pad + y + sd / 2, sd });
          x += sd + pad; shelf = Math.max(shelf, sd);
        }
        if (y + shelf <= room) break;
        shrink *= 0.85;
      }
      const ch = Math.max(56, y + shelf + 2 * pad + 30 + (shrink < 0.999 ? 16 : 0));
      ctx.strokeStyle = "#1d1b18"; ctx.lineWidth = 1; ctx.setLineDash([5, 4]);
      ctx.beginPath(); ctx.moveTo(cxL, top + ch); ctx.lineTo(cxL, top); ctx.lineTo(cxL + cw, top); ctx.lineTo(cxL + cw, top + ch); ctx.stroke();
      ctx.setLineDash([]);
      ctx.fillStyle = "#1d1b18"; ctx.textAlign = "left"; ctx.textBaseline = "alphabetic";
      ctx.font = "bold 12px ui-monospace, Menlo, monospace"; ctx.fillText("STATE · PUBLIC", cxL + 6, top + 14);
      ctx.font = "11px ui-monospace, Menlo, monospace"; ctx.fillText("no column in the record", cxL + 6, top + 27);
      if (!showStakes) { ctx.font = "15px Georgia, serif"; ctx.fillText("— (not 0)", cxL + 6, top + 50); ctx.font = "11px ui-monospace, Menlo, monospace"; }
      for (const p of placed) drawStake(p.it.m, p.x, p.y, p.it.side * shrink, true);
      if (shrink < 0.999) { ctx.font = "11px ui-monospace, Menlo, monospace"; ctx.fillStyle = "#8c2f1b"; ctx.fillText(`area shown at 1/${Math.round(1 / (shrink * shrink))}`, cxL + 6, top + ch - 6); }
      if (showStakes) {
        let ph = 0, mx = 0; for (const it of col) { if (it.m.home === "public") ph += it.m.h; else mx += it.m.h; }
        ctx.font = "11px ui-monospace, Menlo, monospace"; ctx.fillStyle = "#1d1b18";
        const yb = top + ch + 14;
        ctx.fillText(`${col.filter(i => i.m.home === "public").length} public clusters, ${fmtM(ph)}`, cxL, yb);
        ctx.fillText(`${col.filter(i => i.m.home === "mixed").length} public/private, ${fmtM(mx)}`, cxL, yb + 14);
        ctx.fillText("markers: the cluster list,", cxL, yb + 30); ctx.fillText("not the owner table", cxL, yb + 44);
      }
      geom.column = { x: cxL, y: top, w: cw, h: ch };
      // stakes whose owner has no parcel in this survey (the unfinished quarter lacks rows)
      if (adrift.length) {
        let ax = 0; const ay = top + ch + (showStakes ? 80 : 20);
        ctx.fillText(`${adrift.length} stakes whose owner`, cxL, ay); ctx.fillText("has no row this quarter", cxL, ay + 14);
        for (const it of adrift) { const sd = Math.max(it.side, 2); drawStake(it.m, cxL + ax + sd / 2, ay + 24 + sd / 2, it.side, true); ax += sd + 3; }
      }
    }
    // labels on parcels large enough to carry them
    ctx.save(); ctx.textAlign = "center"; ctx.textBaseline = "middle";
    const fullArea = Math.PI * L.R * L.R;
    for (let k = 0; k < K; k++) {
      if (!live[k]) continue;
      const share = (target[k] / NC);
      const pxA = share * fullArea;
      if (pxA < (L.narrow ? 1400 : 2200)) continue;
      const x = L.ox + cx[k] * L.R, y = L.oy + cy[k] * L.R;
      const five = FIVE.has(OWN[k].n);
      const sh = (100 * st.v[OWN[k].n].m / st.land).toFixed(1) + " %";
      ctx.font = (five ? "bold " : "") + (L.narrow ? "12px" : "14px") + " Georgia, serif";
      const tw = Math.max(ctx.measureText(OWN[k].n).width, 44);
      ctx.fillStyle = "rgba(239,233,220,.92)"; ctx.fillRect(x - tw / 2 - 5, y - 17, tw + 10, 33);
      ctx.fillStyle = five ? "#5d1d10" : "#1d1b18";
      ctx.fillText(OWN[k].n === "Other" ? "everyone else" : OWN[k].n, x, y - 7);
      ctx.font = "11px ui-monospace, Menlo, monospace"; ctx.fillText(sh, x, y + 8);
    }
    ctx.restore();
    // the inset's frame and its one figure: the five's share of the land, March 2022 to now
    if (L.inset) {
      const I = L.inset;
      ctx.save();
      ctx.fillStyle = "#1d1b18"; ctx.textAlign = "center"; ctx.font = "11px ui-monospace, Menlo, monospace";
      let f5 = 0; for (const n of D.five) if (st.v[n]) f5 += st.v[n].m;
      const now5 = (100 * f5 / st.land).toFixed(1);
      if (L.narrow) {
        ctx.textAlign = "right"; ctx.font = "10px ui-monospace, Menlo, monospace";
        ctx.fillText("same division, one size", W - 8, I.y - I.r - 8);
        ctx.fillStyle = "#8c2f1b"; ctx.font = "bold 12px Georgia, serif";
        ctx.fillText("the five", W - 8, I.y + I.r + 16); ctx.fillText(`${Q[0].top5_land.toFixed(1)} → ${now5} %`, W - 8, I.y + I.r + 31);
      } else {
        ctx.fillText("the same division,", I.x, I.y - I.r - 24); ctx.fillText("at one size", I.x, I.y - I.r - 11);
        ctx.fillStyle = "#8c2f1b"; ctx.font = "bold 13px Georgia, serif";
        ctx.fillText(`the five: ${Q[0].top5_land.toFixed(1)} %  →  ${now5} %`, I.x, I.y + I.r + 20);
      }
      ctx.restore();
    }
    // ranges of the hovered parcel: its boundary redrawn at the 5th and 95th percentile
    if (hover >= 0 && live[hover]) {
      const o = st.v[OWN[hover].n];
      const pw = cv.width;
      ctx.fillStyle = "#1d1b18";
      for (const [k, step] of [[o.lo, 2], [o.hi, 2]]) {
        if (!(o.m > 0) || k === o.m) continue;
        const f = Math.sqrt(k / o.m), cxp = (L.ox + cx[hover] * L.R) * dpr, cyp = (L.oy + cy[hover] * L.R) * dpr;
        let cnt = 0;
        for (let y = 1; y < cv.height - 1; y += 1) for (let x = 1; x < pw - 1; x += 1) {
          const i = y * pw + x; if (own[i] !== hover) continue;
          if (own[i + 1] === hover && own[i - 1] === hover && own[i + pw] === hover && own[i - pw] === hover) continue;
          if ((cnt++ % (3 * step)) !== 0) continue;
          ctx.fillRect((cxp + (x - cxp) * f) / dpr - 0.8, (cyp + (y - cyp) * f) / dpr - 0.8, 1.6, 1.6);
        }
      }
    }
    ctx.restore();
  }

  function drawStake(m, x, y, side, inColumn) {
    const anon = !m.n;
    ctx.save();
    if (side >= 3) {
      // in the column a stake is an outline with its cross, a marker, never filled ground: the record has no such land
      ctx.fillStyle = "#efe9dc";
      ctx.fillRect(x - side / 2, y - side / 2, side, side);
      ctx.strokeStyle = "#1d1b18"; ctx.lineWidth = 1;
      if (inColumn && side >= 5) {
        ctx.beginPath(); ctx.moveTo(x - side / 2, y - side / 2); ctx.lineTo(x + side / 2, y + side / 2);
        if (m.home === "public") { ctx.moveTo(x + side / 2, y - side / 2); ctx.lineTo(x - side / 2, y + side / 2); }
        ctx.stroke();
      }
      if (anon) ctx.setLineDash([2, 2]);
      ctx.strokeRect(x - side / 2, y - side / 2, side, side);
      if (!inColumn && !anon && side >= 7) { ctx.beginPath(); ctx.moveTo(x, y - side / 2); ctx.lineTo(x, y - side / 2 - 5); ctx.lineTo(x + 4, y - side / 2 - 3.5); ctx.lineTo(x, y - side / 2 - 2); ctx.stroke(); }
    } else {
      ctx.fillStyle = anon || inColumn ? "#efe9dc" : "#1d1b18";
      ctx.strokeStyle = "#1d1b18"; ctx.lineWidth = 0.8;
      if (inColumn) { ctx.strokeRect(x - 1.5, y - 1.5, 3, 3); }
      ctx.fillRect(x - 1.1, y - 1.1, 2.2, 2.2); if (anon) ctx.strokeRect(x - 1.5, y - 1.5, 3, 3);
    }
    ctx.restore();
    geom.stakes.push({ m, x, y, r: Math.max(side / 2, 2.5) });
  }

  function hud(st) {
    const qi = Math.round(t), q = Q[qi];
    const d = new Date(q.q + "T00:00:00Z");
    const qn = Math.floor(d.getUTCMonth() / 3) + 1;
    document.getElementById("when").textContent = (Math.abs(t - qi) < 0.02 ? "" : "≈ ") + "end of Q" + qn + " " + d.getUTCFullYear();
    let five = 0; for (const n of D.five) if (st.v[n]) five += st.v[n].m;
    const pct = (100 * five / st.total).toFixed(1), pctLand = (100 * five / st.land).toFixed(1);
    const unfinished = Math.abs(t - (NQ - 1)) < 0.5;
    document.getElementById("five").textContent = unfinished
      ? `${pct} % held by the five, of an unfinished count`
      : st.land < st.total - 0.5
        ? `${pctLand} % of the land held by the five`
        : `${pct} % of the land held by the five`;
    document.getElementById("count").textContent = (unfinished ? "8 of 19 series · the published 75.8 % rests on this quarter · " : "") +
      `${fmtM(st.total)} H100e counted · ${(st.mw / 1000).toFixed(st.mw < 1000 ? 2 : 1)} GW` + stakeLine();
    const sl = document.getElementById("q"); if (!playing) sl.value = String(qi);
  }

  function stakeLine() {
    if (!document.getElementById("stk").checked) return "";
    const qs = Math.min(Math.round(t), LAST_FULL);
    let n = 0, h = 0; for (const m of STAKES) if (standing(m, qs)) { n++; h += m.h; }
    const cov = D.stake_stats.cover[qs];
    return ` · ${n} clusters staked, ${fmtM(h)} H100e, covering ${cov.toFixed(1)} % of the land: what the list sees, not what the land holds` + (Math.round(t) > LAST_FULL ? " (as at the end of 2025)" : "");
  }

  // ---- the hum: the land's power heard at 60 Hz, one harmonic per owner, loud as its share ----
  let AC = null, osc = [], gains = [], pans = [], master = null, noiseG = null;
  const MWMIN = Math.min(...Q.map(q => q.mw)), MWMAX = Math.max(...Q.map(q => q.mw));
  function startHum() {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    master = AC.createGain(); master.gain.value = 0;
    const lp = AC.createBiquadFilter(); lp.type = "lowpass"; lp.frequency.value = 900;
    master.connect(lp).connect(AC.destination);
    for (let k = 0; k < K; k++) {
      const o = AC.createOscillator(); o.type = "sine"; o.frequency.value = 60 * OWN[k].h;
      const g = AC.createGain(); g.gain.value = 0;
      const p = AC.createStereoPanner ? AC.createStereoPanner() : null;
      if (p) { o.connect(g).connect(p).connect(master); } else o.connect(g).connect(master);
      o.start(); osc.push(o); gains.push(g); pans.push(p);
    }
    const buf = AC.createBuffer(1, AC.sampleRate * 2, AC.sampleRate), ch = buf.getChannelData(0);
    for (let i = 0; i < ch.length; i++) ch[i] = Math.random() < 0.002 ? (Math.random() * 2 - 1) : 0;
    const src = AC.createBufferSource(); src.buffer = buf; src.loop = true;
    noiseG = AC.createGain(); noiseG.gain.value = 0;
    const np = AC.createStereoPanner ? AC.createStereoPanner() : null;
    if (np) { np.pan.value = 0.8; src.connect(noiseG).connect(np).connect(AC.destination); } else src.connect(noiseG).connect(AC.destination);
    src.start();
  }
  function hum(st) {
    if (!AC) return;
    const now = AC.currentTime, on = document.getElementById("snd").checked;
    const lvl = on ? 0.05 + 0.45 * Math.log(st.mw / MWMIN) / Math.log(MWMAX / MWMIN) : 0;
    master.gain.setTargetAtTime(lvl, now, 0.08);
    for (let k = 0; k < K; k++) {
      const o = st.v[OWN[k].n], sh = o ? o.m / st.total : 0;
      gains[k].gain.setTargetAtTime(0.5 * sh / Math.sqrt(OWN[k].h), now, 0.08);
      if (pans[k]) pans[k].pan.setTargetAtTime(Math.max(-1, Math.min(1, cx[k] || 0)), now, 0.1);
    }
    const sm = st.v[SMUG];
    noiseG.gain.setTargetAtTime(on && sm ? 2.5 * sm.m / st.total : 0, now, 0.1);
  }

  // ---- controls ----
  const sl = document.getElementById("q");
  sl.max = String(NQ - 1); sl.value = String(LAST_FULL);
  sl.addEventListener("input", () => { playing = false; setPlay(); t = +sl.value; tip.hidden = true; hover = -1; draw(); });
  const pb = document.getElementById("play");
  function setPlay() { pb.textContent = playing ? "Hold the survey" : "Survey from 2022"; }
  let last = 0;
  function frame(ts) {
    if (!playing) return;
    const dt = last ? Math.min(0.05, (ts - last) / 1000) : 0; last = ts;
    t += dt * 0.9;
    if (t >= LAST_FULL) { t = LAST_FULL; playing = false; setPlay(); } // the survey ends on the last finished quarter
    sl.value = String(Math.round(t));
    draw();
    if (playing) requestAnimationFrame(frame); else draw();
  }
  pb.addEventListener("click", () => {
    if (!AC && document.getElementById("snd").checked) { try { startHum(); } catch (e) { /* no sound */ } }
    playing = !playing;
    if (playing) { if (t >= LAST_FULL - 0.01) t = 0; last = 0; requestAnimationFrame(frame); }
    setPlay(); draw();
  });
  document.getElementById("snd").addEventListener("change", (e) => {
    if (e.target.checked && !AC) { try { startHum(); } catch (er) { /* no sound */ } }
    draw();
  });
  document.getElementById("stk").addEventListener("change", () => { tip.hidden = true; hover = -1; draw(); });
  document.querySelectorAll("input[name=scale]").forEach(r => r.addEventListener("change", (e) => { mode = e.target.value; draw(); }));

  function pick(ev) {
    const r = cv.getBoundingClientRect();
    const x = ev.clientX - r.left, y = ev.clientY - r.top;
    const i = Math.round(y * dpr) * cv.width + Math.round(x * dpr);
    let k = own && i >= 0 && i < own.length ? own[i] : -1;
    const st = state(t);
    let html = "";
    let sk = null;
    if (geom && geom.stakes) {
      let bd = 1e9;
      for (const s of geom.stakes) { const d = Math.max(Math.abs(x - s.x), Math.abs(y - s.y)); if (d <= s.r + 1.5 && s.r < bd) { bd = s.r; sk = s.m; } }
    }
    if (sk) {
      const where = sk.home === "public" ? "public: the owner table has no row for it" : sk.home === "mixed" ? "public/private: the owner table has no row for it"
        : (IDX[sk.home] !== undefined && live[IDX[sk.home]]) ? "staked in " + (sk.home === "Other" ? "everyone else" : sk.home) + "'s parcel" : "its owner's row is missing in this survey";
      html = `<b>${sk.n || "a cluster in China, unnamed in the list"}</b><br>${sk.o ? "owner: " + sk.o : "no owner named"}${sk.c ? " · " + sk.c : ""}` +
        `<br>${fmtM(sk.h)} H100e · ${sk.k.toLowerCase()}<br>${sk.d ? "operational from " + sk.d : "no date in the list; staked at its last survey"}` +
        (sk.site ? `<br>the list marks it superseded by ${sk.site}` : "") + `<br>${where}`;
      k = -1;
    } else if (k >= 0) {
      const n = OWN[k].n, o = st.v[n], qo = Q[Math.round(t)].owners[n];
      html = `<b>${n === "Other" ? "everyone else (the record's “Other”)" : n}</b><br>${fmtM(o.m)} H100e, ${(100 * o.m / st.land).toFixed(1)} % of the land, ${(100 * o.m / st.total).toFixed(1)} % of the count` +
        `<br>90 % of the estimate: ${fmtM(o.lo)}–${fmtM(o.hi)}` + (qo ? `<br>${qo.rows} row${qo.rows > 1 ? "s" : ""}: ${qo.designers.join(", ")} chips` + (qo.norange ? `; ${qo.norange} without a range` : "") : "") +
        (FIVE.has(n) ? (() => { const qq = Q[Math.round(t)]; return `<br>one of the five: together ${qq.top5_land.toFixed(1)} % of the land` +
          (qq.top5_land > qq.top5 + 0.01 ? `, ${qq.top5.toFixed(1)} % of every counted chip with the smuggled stock (90 %: ${qq.top5_90[0].toFixed(0)}–${qq.top5_90[1].toFixed(0)} %)` : ""); })() : "");
    } else if (geom && geom.shoal && Math.hypot(x - geom.shoal.x, y - geom.shoal.y) < geom.shoal.r + 4) {
      const o = geom.shoal.v;
      html = `<b>Chips smuggled into China</b><br>modelled at ${fmtM(o.m)} H100e<br>90 % of the model: ${fmtM(o.lo)}–${fmtM(o.hi)}<br>a row of the record with no owner and no place`;
    }
    if (k !== hover) { hover = k; draw(); }
    if (html) {
      tip.innerHTML = html; tip.hidden = false;
      // on a phone the note stands at the foot of the sheet, above the controls, and never covers the land
      if (W < 640) { tip.style.left = "8px"; tip.style.top = Math.max(8, H - 120 - tip.offsetHeight) + "px"; }
      else { tip.style.left = Math.min(x + 14, W - 250) + "px"; tip.style.top = Math.min(y + 14, H - 90 - tip.offsetHeight) + "px"; }
    }
    else tip.hidden = true;
  }
  cv.addEventListener("pointermove", pick);
  cv.addEventListener("pointerdown", pick);
  cv.addEventListener("pointerleave", () => { tip.hidden = true; if (hover !== -1) { hover = -1; draw(); } });

  // for verify.mjs: the largest gap, in points of share, between a parcel's fitted area and its owner's share
  window.NPL_fitError = function () {
    let e = 0; for (let k = 0; k < K; k++) if (live[k]) e = Math.max(e, Math.abs(area[k] - target[k]) / NC * 100);
    return e;
  };
  window.addEventListener("resize", resize);
  setPlay();
  t = LAST_FULL; fit(state(0), 80); fit(state(t), 120);
  resize();
})();
