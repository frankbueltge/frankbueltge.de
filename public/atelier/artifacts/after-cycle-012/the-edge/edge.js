(() => {
  "use strict";
  const E = window.EDGE, DAY = 864e5;
  const toD = s => Date.UTC(+s.slice(0, 4), +s.slice(5, 7) - 1, +s.slice(8, 10));
  const iso = t => new Date(t).toISOString().slice(0, 10);
  const nice = t => new Date(t).toLocaleDateString("en-GB", { day: "numeric", month: "short", year: "numeric", timeZone: "UTC" });
  const HOLE = toD(E.holeLast);
  const css = n => getComputedStyle(document.documentElement).getPropertyValue(n).trim();
  const $ = id => document.getElementById(id);
  let rec = "bdbv", edgeT = toD(E.records.bdbv[1]), hole = false, probeDay = null;
  // off: where a quiet's day 1 falls. 0 = the day after the rise (corrected 2026-11-06, after the Studio's
  // check in CALL IT); 1 = the rise day itself, as this page counted until then.
  let off = 0;
  // judge (fifth state): the rule the later record itself is read under, at the record's real last day
  let judge = "lost";
  // ninth state: standing at the edge hides what came after it; a declaration carries the cut quiets as over
  let blind = false, decl = null;

  const Q = E.quiets.map(q => ({ ...q, f0: toD(q.f) }));
  function events(r, edge, h, o = off) {
    const out = [];
    for (const q of Q) {
      if (q.rec !== r) continue;
      let through = Math.round((edge - q.f0) / DAY) + o;
      if (h && q.f0 <= HOLE && q.f0 + q.L * DAY > HOLE) through = Math.min(through, Math.round((HOLE - q.f0) / DAY) + o);
      if (q.b && q.L + 1 <= through) out.push({ t: q.L + 1, e: 1, q });
      else { const t = Math.min(q.L, through); if (t >= 42) out.push({ t, e: 0, q, through }); }
    }
    return out;
  }
  function km(ev) {
    let S = 1, n = ev.length; const steps = [];
    const ts = [...new Set(ev.map(x => x.t))].sort((a, b) => a - b);
    for (const t of ts) {
      const d = ev.filter(x => x.t === t && x.e).length;
      if (d) { S *= 1 - d / n; steps.push([t, S]); }
      n -= ev.filter(x => x.t === t).length;
    }
    let last = ev[0];
    for (const x of ev) if (x.t > last.t || (x.t === last.t && x.e < last.e)) last = x;
    return { steps, tStar: last.t, isLoss: last.e === 0, pStar: steps.length ? steps[steps.length - 1][1] : 1 };
  }
  const stepAt = (steps, t) => { let s = 1; for (const [u, v] of steps) { if (u <= t) s = v; else break; } return s; };
  // the later record's steps under a rule: lost (Kaplan and Meier), carried (its cut quiets never break),
  // left out (only its broken quiets speak, so it falls to 0 on its last break)
  function judgeSteps(ev2, j) {
    if (j === "lost") return km(ev2).steps;
    const d = ev2.filter(x => x.e).map(x => x.t).sort((a, b) => a - b), n = j === "carried" ? ev2.length : d.length;
    const out = []; let c = 0;
    for (const t of [...new Set(d)]) { c += d.filter(u => u === t).length; out.push([t, 1 - c / n]); }
    return out;
  }
  // at every edge a month or more back with at least ten quiets: which rule of the edge lies nearest the later
  // record read under each judge (build.py asserts the counts at the corrected count)
  const tallyCache = {};
  function tally(r) {
    const key = r + off;
    if (tallyCache[key]) return tallyCache[key];
    const [a, b] = E.records[r].map(toD), endEv = events(r, b, false);
    const T = { edges: 0, at: [], lost: { carried: 0, lost: 0, "left out": 0 }, carried: { carried: 0, lost: 0, "left out": 0 }, "left out": { carried: 0, lost: 0, "left out": 0 } };
    for (let e = b - 30 * DAY; e > a; e -= DAY) {
      const ev = events(r, e, false); if (ev.length < 10) continue;
      T.edges++;
      const ids = new Set(ev.map(x => x.q)), ev2 = endEv.filter(x => ids.has(x.q)), k = km(ev), t = k.tStar;
      const rv = { carried: ev.filter(x => !x.e).length / ev.length, lost: stepAt(k.steps, t), "left out": 0 };
      const cutQ = ev.filter(x => !x.e);
      const at = { e, cut: cutQ.length, lb: cutQ.filter(x => x.q.b).length };
      for (const j of ["lost", "carried", "left out"]) {
        const v = stepAt(judgeSteps(ev2, j), t), d = {};
        for (const q in rv) d[q] = Math.abs(rv[q] - v);
        const w = Object.keys(d).reduce((x, y) => d[y] < d[x] ? y : x);
        T[j][w]++; at[j] = w;
      }
      T.at.push(at);
    }
    return (tallyCache[key] = T);
  }

  // ---- the verdicts (sixth state): at every counted edge, the rule each judge finds nearest, on the calendar's axis ----
  const vc = $("verdicts"), JUDGES = ["lost", "carried", "left out"];
  let vgeom = null, vprobe = null;
  const ruleCol = r => css(r === "carried" ? "--held" : r === "lost" ? "--fg" : "--case");
  function drawVerdicts() {
    const [g, w, h] = size(vc), [a, b] = span(), pad = 8, top = 4, lab = 16, rowH = (h - top - lab - 6) / 4;
    const X = t => pad + (t - a) / (b - a) * (w - 2 * pad), cw = Math.max(1, (w - 2 * pad) / ((b - a) / DAY));
    const T = tally(rec);
    vgeom = { X, a, b, pad, w, T };
    g.clearRect(0, 0, w, h);
    JUDGES.forEach((j, i) => {
      const y = top + i * rowH;
      g.fillStyle = css("--line"); g.globalAlpha = .5; g.fillRect(pad, y + 1, w - 2 * pad, rowH - 2); g.globalAlpha = 1;
      for (const at of T.at) { g.fillStyle = ruleCol(at[j]); g.globalAlpha = j === judge ? 1 : .55; g.fillRect(Math.floor(X(at.e) - cw / 2), y + 1, Math.ceil(cw) + 1, rowH - 2); }
      g.globalAlpha = 1;
      if (j === judge) { g.strokeStyle = css("--a"); g.lineWidth = 2; g.strokeRect(pad - 1, y, w - 2 * pad + 2, rowH); }
      g.fillStyle = css("--bg"); g.globalAlpha = .8; g.font = "600 11px system-ui,sans-serif";
      const t = "judged " + j, tw = g.measureText(t).width; g.fillRect(pad + 3, y + rowH / 2 - 8, tw + 8, 15); g.globalAlpha = 1;
      g.fillStyle = css("--fg"); g.textAlign = "left"; g.fillText(t, pad + 7, y + rowH / 2 + 4);
    });
    // seventh state: what came next. Per edge, the share of the quiets it cuts that the later record shows breaking,
    // as a bar from the row's foot; where none broke, a thin mark only.
    { const y = top + 3 * rowH + 2;
      g.fillStyle = css("--line"); g.globalAlpha = .35; g.fillRect(pad, y + 1, w - 2 * pad, rowH - 2); g.globalAlpha = 1;
      for (const at of T.at) {
        const sh = at.cut ? at.lb / at.cut : 0, bh = Math.max(1.5, sh * (rowH - 3));
        g.fillStyle = css(sh ? "--a" : "--mute"); g.globalAlpha = sh ? .95 : .6;
        g.fillRect(Math.floor(X(at.e) - cw / 2), y + rowH - 1 - bh, Math.ceil(cw) + 1, bh);
      }
      g.globalAlpha = 1; g.strokeStyle = css("--mute"); g.lineWidth = 1; g.setLineDash([1, 3]);
      const yq = y + rowH - 1 - .25 * (rowH - 3); g.beginPath(); g.moveTo(pad, yq); g.lineTo(w - pad, yq); g.stroke(); g.setLineDash([]);
      g.fillStyle = css("--bg"); g.globalAlpha = .8; g.font = "600 11px system-ui,sans-serif";
      const t = "what came next", tw = g.measureText(t).width; g.fillRect(pad + 3, y + 2, tw + 8, 15); g.globalAlpha = 1;
      g.fillStyle = css("--fg"); g.textAlign = "left"; g.fillText(t, pad + 7, y + 13); }
    const ex = X(edgeT), yb = top + 4 * rowH + 2;
    g.strokeStyle = css("--cut"); g.lineWidth = 2; g.beginPath(); g.moveTo(ex, top - 2); g.lineTo(ex, yb + 3); g.stroke();
    if (vprobe != null) { const px = X(vprobe.e); g.strokeStyle = css("--you"); g.lineWidth = 1; g.setLineDash([2, 3]); g.beginPath(); g.moveTo(px, top); g.lineTo(px, yb); g.stroke(); g.setLineDash([]); }
    g.fillStyle = css("--mute"); g.font = "11px system-ui,sans-serif"; g.textAlign = "left"; g.fillText(nice(a), pad, h - 3);
    g.textAlign = "right"; g.fillText(nice(b), w - pad, h - 3);
    const lastCounted = T.at.length ? Math.max(...T.at.map(x => x.e)) : b;
    if (X(b) - X(lastCounted) > 70) { g.textAlign = "center"; g.fillText("last month: not judged", (X(lastCounted) + X(b)) / 2, top + 1.5 * rowH + 4); }
    // where the judges part, at the shown edge or the pointed one
    const all = T.at.filter(x => x["left out"] !== x.lost && x["left out"] !== x.carried).length;
    const agreeCL = T.at.filter(x => x.lost === x.carried).length;
    const here = vprobe || T.at.find(x => x.e === edgeT);
    $("verdictRead").innerHTML = (here ? `<b>${nice(here.e)}</b>: judged lost, <b>${here.lost}</b> is nearest; judged carried, <b>${here.carried}</b>; judged left out, <b>${here["left out"]}</b>. Of the <b>${here.cut}</b> quiets this edge cuts, the later record shows <b>${here.lb}</b> breaking. ` : "At this edge no verdict is counted (fewer than ten quiets, or less than a month before the record's last day). ") +
      `Across the strip the carried and lost rows match at <b>${agreeCL}</b> of <b>${T.edges}</b> edges; the left-out row names a rule neither of them names at <b>${all}</b>. Point at the strip to read an edge; click to move the edge there.`;
    window.__verdicts = { edges: T.edges, agreeCL, differ: all, rows: Object.fromEntries(JUDGES.map(j => [j, T[j]])) };
  }
  const vAt = ev => {
    if (!vgeom) return null; const r = vc.getBoundingClientRect(), x = ev.clientX - r.left, { a, b, pad, w, T } = vgeom;
    const t = a + (x - pad) / (w - 2 * pad) * (b - a); let best = null;
    for (const at of T.at) if (!best || Math.abs(at.e - t) < Math.abs(best.e - t)) best = at;
    return best && Math.abs(best.e - t) < 6 * DAY ? best : null;
  };
  vc.addEventListener("pointermove", e => { vprobe = vAt(e); drawVerdicts(); });
  vc.addEventListener("pointerleave", () => { vprobe = null; drawVerdicts(); });
  vc.addEventListener("click", e => { const at = vAt(e); if (!at) return; edgeT = at.e; vprobe = null; setRange(); render(); });

  // ---- the calendar ----
  const cal = $("cal"), cur = $("curve"), rng = $("edge");
  function size(c) {
    const dpr = window.devicePixelRatio || 1, w = c.clientWidth, h = +c.getAttribute("height");
    c.width = w * dpr; c.height = h * dpr; c.style.height = h + "px";
    const g = c.getContext("2d"); g.setTransform(dpr, 0, 0, dpr, 0, 0); return [g, w, h];
  }
  const span = () => { const [a, b] = E.records[rec]; return [toD(a), toD(b)]; };
  function drawCal() {
    const [g, w, h] = size(cal), [a, b] = span(), pad = 8, top = 18, bot = 22;
    const X = t => pad + (t - a) / (b - a) * (w - 2 * pad);
    const qs = Q.filter(q => q.rec === rec).sort((p, q) => p.f0 - q.f0);
    const rh = (h - top - bot) / qs.length;
    g.clearRect(0, 0, w, h);
    // the hole
    if (rec === "kivu") {
      const h0 = toD(E.records.kivuHole[0]) + DAY, h1 = toD(E.records.kivuHole[1]);
      g.fillStyle = css("--line"); g.globalAlpha = hole ? .9 : .45; g.fillRect(X(h0), top, X(h1) - X(h0), h - top - bot); g.globalAlpha = 1;
      g.fillStyle = css("--mute"); g.font = "11px system-ui,sans-serif"; g.textAlign = "center";
      g.textAlign = "right"; g.fillText("94 days, no report", Math.min(w - pad, X(h1)), top - 6);
    }
    const lw = Math.max(1.2, Math.min(5, rh * .6));
    qs.forEach((q, i) => {
      const y = top + (i + .5) * rh, s0 = q.f0 + (1 - off) * DAY, end = q.f0 + (q.L - off) * DAY;
      // with the hole as an edge, a quiet watched across it is cut on the last report day before it
      const cutT = (rec === "kivu" && hole && q.f0 <= HOLE && end + DAY > HOLE) ? Math.min(edgeT, HOLE) : edgeT;
      const caseT = q.f0 + (q.L + 1 - off) * DAY, seen = Math.min(end, cutT);
      g.lineWidth = lw; g.lineCap = "butt";
      if (end > cutT && !blind) { // what came after the edge
        g.strokeStyle = css("--nb"); g.globalAlpha = .45;
        g.beginPath(); g.moveTo(X(Math.max(s0, cutT)), y); g.lineTo(X(end), y); g.stroke();
        if (q.b) { g.fillStyle = css("--case"); g.beginPath(); g.arc(X(caseT), y, lw * .7 + 1, 0, 7); g.fill(); }
        g.globalAlpha = 1;
      }
      if (q.f0 > cutT) return;
      const reached = Math.round((cutT - q.f0) / DAY) + off >= 42 || (q.b && caseT <= cutT);
      g.strokeStyle = css("--w"); g.globalAlpha = reached ? 1 : .35;
      g.beginPath(); g.moveTo(X(s0), y); g.lineTo(X(seen), y); g.stroke(); g.globalAlpha = 1;
      if (q.b && caseT <= cutT) { g.fillStyle = css("--case"); g.beginPath(); g.arc(X(caseT), y, lw * .7 + 1.2, 0, 7); g.fill(); }
      else if (reached) { g.strokeStyle = css("--cut"); g.lineWidth = 1.6; g.beginPath(); g.arc(X(seen), y, lw * .7 + 1.5, 0, 7); g.stroke(); }
    });
    // the declaration (ninth state): a tick on each declared quiet's row at the day it was declared, and a ring round
    // every case that has since arrived in one of them
    if (decl && decl.rec === rec) {
      const dx = X(decl.edge);
      g.strokeStyle = css("--case"); g.lineWidth = 1; g.setLineDash([3, 3]);
      g.beginPath(); g.moveTo(dx, top - 2); g.lineTo(dx, h - bot); g.stroke(); g.setLineDash([]);
      g.fillStyle = css("--case"); g.font = "600 11px system-ui,sans-serif"; g.textAlign = dx > w - 120 ? "right" : "left";
      g.fillText("declared over · " + nice(decl.edge), dx + (dx > w - 120 ? -5 : 5), top - 6);
      qs.forEach((q, i) => {
        if (!decl.qs.has(q)) return;
        const y = top + (i + .5) * rh, caseT = q.f0 + (q.L + 1 - decl.off) * DAY;
        g.strokeStyle = css("--case"); g.lineWidth = 2; g.beginPath(); g.moveTo(dx - 4, y); g.lineTo(dx + 4, y); g.stroke();
        if (q.b && caseT <= edgeT && caseT > decl.edge) { g.lineWidth = 2; g.beginPath(); g.arc(X(caseT), y, lw * .7 + 4.5, 0, 7); g.stroke(); }
      });
    }
    // the edge
    const ex = X(edgeT);
    g.strokeStyle = css("--cut"); g.lineWidth = 2; g.beginPath(); g.moveTo(ex, 4); g.lineTo(ex, h - bot + 4); g.stroke();
    g.fillStyle = css("--cut"); g.font = "600 12px system-ui,sans-serif";
    g.textAlign = ex > w - 90 ? "right" : "left"; g.fillText("the edge · " + nice(edgeT), ex + (ex > w - 90 ? -6 : 6), h - 6);
    g.fillStyle = css("--mute"); g.font = "11px system-ui,sans-serif"; g.textAlign = "left";
    if (ex > 120) g.fillText(nice(a), pad, h - 6);
  }

  // ---- the curves ----
  let geom = null;
  function drawCurve(st) {
    const [g, w, h] = size(cur), L = 34, R = 70, T = 26, B = 30;
    const ev = st.ev, maxT = Math.max(...Q.filter(q => q.rec === rec).map(q => q.L + 1));
    const X = t => L + (t - 42) / (maxT - 42) * (w - L - R), Y = p => T + (1 - p) * (h - T - B);
    geom = { X, L, R, w, maxT };
    g.clearRect(0, 0, w, h);
    g.strokeStyle = css("--line"); g.lineWidth = 1; g.fillStyle = css("--mute"); g.font = "11px system-ui,sans-serif";
    for (const p of [0, .25, .5, .75, 1]) { g.beginPath(); g.moveTo(L, Y(p)); g.lineTo(w - R, Y(p)); g.stroke(); g.textAlign = "right"; g.fillText(Math.round(p * 100), L - 5, Y(p) + 4); }
    g.textAlign = "left"; g.fillText("still quiet, in 100 quiets that reached 42 days", L, 12);
    g.textAlign = "center";
    const tick = [20, 40, 50, 100, 200, 400].find(s => (w - L - R) / ((maxT - 42) / s) >= 58) || 400;
    for (let t = Math.ceil(42 / tick) * tick; t <= maxT; t += tick) g.fillText("day " + t, X(t), h - 10);
    g.fillText("42", X(42), h - 10);
    // lost: hatched band past t*
    const k = st.km;
    if (k.isLoss) {
      const x0 = X(k.tStar), x1 = X(maxT);
      g.save(); g.beginPath(); g.rect(x0, Y(k.pStar), x1 - x0, Y(0) - Y(k.pStar)); g.clip();
      g.strokeStyle = css("--mute"); g.globalAlpha = .45; g.lineWidth = 1;
      for (let x = x0 - 300; x < x1 + 300; x += 7) { g.beginPath(); g.moveTo(x, Y(0)); g.lineTo(x + 300, Y(0) - 300); g.stroke(); }
      g.restore();
      g.fillStyle = css("--mute"); g.textAlign = "left"; g.font = "italic 13px Georgia,serif";
      if (x1 - x0 > 70) g.fillText("undefined", x0 + 6, Y(k.pStar / 2) + 4);
    }
    const stepLine = (steps, until, col, dash, wdt) => {
      g.strokeStyle = col; g.lineWidth = wdt; g.setLineDash(dash); g.beginPath();
      let s = 1; g.moveTo(X(42), Y(1));
      for (const [t, v] of steps) { if (t > until) break; g.lineTo(X(t), Y(s)); g.lineTo(X(t), Y(v)); s = v; }
      g.lineTo(X(until), Y(s)); g.stroke(); g.setLineDash([]); return s;
    };
    const lab = (txt, y, col) => { g.fillStyle = col; g.font = "600 12px system-ui,sans-serif"; g.textAlign = "left"; g.fillText(txt, w - R + 6, y + 4); };
    // carried: cut quiets never break
    const n = ev.length, deaths = ev.filter(x => x.e).map(x => x.t).sort((a, b) => a - b);
    const carried = [], out = []; let dc = 0;
    const nb = deaths.length;
    for (const t of [...new Set(deaths)]) { dc += deaths.filter(u => u === t).length; carried.push([t, 1 - dc / n]); out.push([t, nb ? 1 - dc / nb : 1]); }
    const lc = stepLine(carried, maxT, css("--held"), [], 2.2); lab("carried", Y(lc), css("--held"));
    const lo = stepLine(out, nb ? deaths[nb - 1] : 42, css("--case"), [6, 4], 2); lab("left out", Y(lo) + (Math.abs(Y(lo) - Y(lc)) < 14 ? 14 : 0), css("--case"));
    // what the record later showed (fourth state): the same quiets read again at the record's own last day
    if (st.later) {
      const lk = st.later, lt = judge === "carried" ? maxT : Math.max(...lk.ev.filter(x => judge === "lost" || x.e).map(x => x.t).concat([42]));
      g.globalAlpha = .55; const lv = stepLine(lk.steps, lt, css("--a"), [1, 3], 5); g.globalAlpha = 1;
      { let y = Y(lv); while (Math.abs(y - Y(lc)) < 14 || Math.abs(y - Y(lo)) < 14) y -= 14; lab("later", y, css("--a")); }
      // the gap between the edge's rules and the later reading, on the last cut quiet's day
      const x = X(k.tStar), yv = Y(stepAt(lk.steps, k.tStar));
      g.fillStyle = css("--a"); g.beginPath(); g.arc(x, yv, 4.5, 0, 7); g.fill();
    }
    const ll = stepLine(k.steps, k.tStar, css("--fg"), [], 2.4);
    g.fillStyle = css("--fg"); g.beginPath(); g.arc(X(k.tStar), Y(ll), 3.5, 0, 7); g.fill();
    if (probeDay != null && probeDay >= 42 && probeDay <= maxT) {
      g.strokeStyle = css("--you"); g.lineWidth = 1; g.setLineDash([2, 3]); g.beginPath(); g.moveTo(X(probeDay), T); g.lineTo(X(probeDay), Y(0)); g.stroke(); g.setLineDash([]);
    }
    st.curves = { carried, out, nb };
  }

  const pct = p => Math.round(p * 100);

  // ---- the rule's own day (second state): for T = 42..120, the chance a quiet that reached T breaks within W days ----
  const W = E.W, T0 = 42, T1 = 120, day = $("day");
  let probeT = null, dgeom = null;
  function ruleDay(r, edge, h, T, o = off) {
    const rows = [];
    for (const q of Q) {
      if (q.rec !== r || q.L < T) continue;
      let through = Math.round((edge - q.f0) / DAY) + o;
      if (h && q.f0 <= HOLE && q.f0 + q.L * DAY > HOLE) through = Math.min(through, Math.round((HOLE - q.f0) / DAY) + o);
      if (through < T) continue;
      rows.push(q.b && q.L + 1 <= through ? [q.L + 1, 1] : [Math.min(q.L, through), 0]);
    }
    if (!rows.length) return null;
    const n = rows.length, H = T + W;
    const inwin = rows.filter(([t, e]) => e && t <= H).length;
    const known = rows.filter(([t, e]) => (e && t <= H) || t >= H).length;
    let S = 1, m = n;
    for (const t of [...new Set(rows.map(x => x[0]))].sort((a, b) => a - b)) {
      if (t > H) break;
      const d = rows.filter(([u, e]) => u === t && e).length;
      if (d) S *= 1 - d / m;
      m -= rows.filter(([u]) => u === t).length;
    }
    const maxt = Math.max(...rows.map(x => x[0]));
    const undef = H > maxt && rows.some(([t, e]) => t === maxt && !e);
    return { n, known, carried: inwin / n, out: known ? inwin / known : null, lost: undef ? null : 1 - S };
  }
  function drawDay() {
    const h0 = rec === "kivu" && hole, rows = [];
    for (let T = T0; T <= T1; T++) rows.push([T, ruleDay(rec, edgeT, h0, T)]);
    const [g, w, h] = size(day), L = 34, R = 70, Tp = 26, B = 30;
    const X = T => L + (T - T0) / (T1 - T0) * (w - L - R), Y = p => Tp + (1 - p) * (h - Tp - B);
    dgeom = { L, R, w };
    g.clearRect(0, 0, w, h);
    g.strokeStyle = css("--line"); g.lineWidth = 1; g.fillStyle = css("--mute"); g.font = "11px system-ui,sans-serif";
    for (const p of [0, .25, .5, .75, 1]) { g.beginPath(); g.moveTo(L, Y(p)); g.lineTo(w - R, Y(p)); g.stroke(); g.textAlign = "right"; g.fillText(Math.round(p * 100), L - 5, Y(p) + 4); }
    g.textAlign = "left"; g.fillText(w < 560 ? `broke within ${W} days, in 100` : `broke within the next ${W} days, in 100 quiets that reached the rule's day`, L, 12);
    // one in ten
    g.setLineDash([2, 4]); g.strokeStyle = css("--mute"); g.beginPath(); g.moveTo(L, Y(.1)); g.lineTo(w - R, Y(.1)); g.stroke(); g.setLineDash([]);
    g.textAlign = "left"; g.fillText("1 in 10", w - R + 6, Y(.1) + 4);
    g.textAlign = "center";
    const step = w < 520 ? 20 : 10;
    for (let T = 50; T <= T1; T += step) g.fillText("day " + T, X(T), h - 10);
    // the two days of the literature
    const mark = (T, txt, col) => { g.strokeStyle = col; g.lineWidth = 1.5; g.beginPath(); g.moveTo(X(T), Tp); g.lineTo(X(T), Y(0)); g.stroke(); g.fillStyle = col; g.font = "600 11px system-ui,sans-serif"; g.textAlign = "left"; g.fillText(txt, X(T) + 4, Tp + 10); g.font = "11px system-ui,sans-serif"; };
    mark(42, "42 · WHO", css("--a")); mark(63, w < 560 ? "63" : "63 · another clock", css("--mute"));
    const line = (key, col, dash, wd) => {
      g.strokeStyle = col; g.lineWidth = wd; g.setLineDash(dash); g.beginPath(); let on = false, lastY = null;
      for (const [T, r] of rows) {
        const v = r && r[key]; if (v == null) { on = false; continue; }
        on ? g.lineTo(X(T), Y(v)) : g.moveTo(X(T), Y(v)); on = true; lastY = [T, v];
      }
      g.stroke(); g.setLineDash([]); return lastY;
    };
    const lc = line("carried", css("--held"), [], 2.2), lo = line("out", css("--case"), [6, 4], 2), ll = line("lost", css("--fg"), [], 2.4);
    // where lost becomes undefined: hatch from the first undefined day
    const firstU = rows.find(([, r]) => r && r.lost == null), lastR = rows.filter(([, r]) => r).pop();
    if (firstU && lastR) {
      const x0 = X(firstU[0]), x1 = X(lastR[0]);
      g.save(); g.beginPath(); g.rect(x0, Tp, x1 - x0, Y(0) - Tp); g.clip(); g.strokeStyle = css("--mute"); g.globalAlpha = .3;
      for (let x = x0 - 300; x < x1 + 300; x += 7) { g.beginPath(); g.moveTo(x, Y(0)); g.lineTo(x + 300, Y(0) - 300); g.stroke(); }
      g.restore();
      if (x1 - x0 > 80) { g.fillStyle = css("--mute"); g.font = "italic 13px Georgia,serif"; g.textAlign = "left"; g.fillText("lost: undefined", x0 + 6, Y(.62)); }
    }
    const lab = (txt, pt, col, dy) => { if (!pt) return; g.fillStyle = col; g.font = "600 12px system-ui,sans-serif"; g.textAlign = "left"; g.fillText(txt, X(pt[0]) + 6, Y(pt[1]) + 4 + dy); };
    if (lc && lastR && lc[0] === T1) lab("carried", lc, css("--held"), 0);
    if (probeT != null) { g.strokeStyle = css("--you"); g.lineWidth = 1; g.setLineDash([2, 3]); g.beginPath(); g.moveTo(X(probeT), Tp); g.lineTo(X(probeT), Y(0)); g.stroke(); g.setLineDash([]); }
    const at = T => (rows.find(x => x[0] === T) || [])[1];
    const r42 = at(42), rp = probeT != null ? at(probeT) : null;
    const f = v => v == null ? "undefined" : pct(v) + " in 100";
    const tell = (T, r) => r ? `Day <b>${T}</b>: <b>${r.n}</b> quiets had reached it, and the window of ${W} days after it is closed at the edge for <b>${r.known}</b>. Broke within it: carried <b>${f(r.carried)}</b> · lost <b>${f(r.lost)}</b> · left out <b>${r.out == null ? "nothing to say" : f(r.out)}</b>.` : `Day <b>${T}</b>: no quiet had reached it by this edge.`;
    $("dayRead").innerHTML = rp !== null && probeT != null ? tell(probeT, rp) : (r42 ? tell(42, r42) : "At this edge no quiet has yet reached 42 days.");
    let spread = 0; for (const [, r] of rows) if (r && r.out != null) spread = Math.max(spread, r.out - r.carried);
    const tenth = rows.find(([, r]) => r && r.lost != null && r.lost < .1);
    $("dayVerdict").innerHTML = !r42 ? "At this edge no quiet has reached 42 days, so no rule has anything to say." : (r42 && r42.out != null && r42.out - r42.carried < .05)
      ? `Here the three rules almost agree: the edge lies far beyond most of the windows. ${tenth ? `The lost curve falls below 1 in 10 from day <b>${tenth[0]}</b>.` : "Up to day 120 it never falls below 1 in 10."}`
      : `Here the rules part by up to <b>${pct(spread)}</b> points on the same day: the edge cuts the windows, and how long is long enough is decided by the rule for the cut, not by the quiets. ${tenth ? `The lost curve falls below 1 in 10 from day <b>${tenth[0]}</b>.` : "No rule-day up to 120 brings the lost curve below 1 in 10 before it becomes undefined."}`;
    window.__dayState = r42 ? { n: r42.n, known: r42.known, carried: Math.round(r42.carried * 1000) / 1000, out: r42.out == null ? null : Math.round(r42.out * 1000) / 1000, lost: r42.lost == null ? null : Math.round(r42.lost * 1000) / 1000, tenth: tenth ? tenth[0] : null } : null;
  }
  day.addEventListener("pointermove", e => {
    if (!dgeom) return; const r = day.getBoundingClientRect(), x = e.clientX - r.left;
    const T = Math.round(T0 + (x - dgeom.L) / (dgeom.w - dgeom.L - dgeom.R) * (T1 - T0));
    probeT = T >= T0 && T <= T1 ? T : null; drawDay();
  });
  day.addEventListener("pointerleave", () => { probeT = null; drawDay(); });
  function render() {
    const ev = events(rec, edgeT, rec === "kivu" && hole);
    drawCal(); drawDay(); drawVerdicts();
    const read = $("read");
    if (!ev.length) {
      read.innerHTML = "At this edge no quiet has yet reached 42 days. There is nothing to read."; $("fence").textContent = ""; $("later").textContent = ""; $("judgeRead").textContent = ""; window.__edgeState = null;
      const [g, w, h] = size(cur); g.clearRect(0, 0, w, h);
      $("sCarried").textContent = $("sLost").textContent = $("sOut").textContent = ""; $("declare").hidden = true; declRead(); return;
    }
    const realEnd0 = edgeT >= toD(E.records[rec][1]);
    let lat = null;
    if (!realEnd0 && !blind) {
      const ids = new Set(ev.map(x => x.q)), ev2 = events(rec, toD(E.records[rec][1]), false).filter(x => ids.has(x.q));
      lat = { ev: ev2, steps: judgeSteps(ev2, judge) };
    }
    const st = { ev, km: km(ev), later: lat }; drawCurve(st);
    const cut = ev.filter(x => !x.e), later = cut.filter(x => x.q.b).length, broke = ev.length - cut.length;
    const realEnd = edgeT >= toD(E.records[rec][1]);
    read.innerHTML = `Edge: <b>${nice(edgeT)}</b>. <b>${ev.length}</b> quiets had reached 42 days: <b>${broke}</b> broke before the edge, <b>${cut.length}</b> are cut by it. ` +
      (realEnd ? "This is the record's own last day: what the cut quiets become, nobody here can know."
        : blind ? "You stand at the edge: what came after this day is hidden, as it was from the day itself."
        : `Of the ${cut.length} quiets this edge would carry as over, <b>${later}</b> broke later in the record.`);
    { const dB = $("declare"); dB.hidden = !blind || !cut.length;
      dB.textContent = cut.length === 1 ? "declare it over" : `declare these ${cut.length} over`; }
    declRead();
    { const L2 = $("later");
      if (st.later) {
        const t = st.km.tStar, v = stepAt(st.later.steps, t), c = cut.length / ev.length, l = stepAt(st.km.steps, t);
        const d = { carried: Math.abs(c - v), lost: Math.abs(l - v), "left out": v }, best = Object.keys(d).reduce((a, b) => d[b] < d[a] ? b : a);
        const still = st.later.ev.filter(x => !x.e).length;
        L2.innerHTML = `<span class="sw"></span><b>What the record later showed.</b> The same ${ev.length} quiets, read again on the record's own last day, ${nice(toD(E.records[rec][1]))}, by the rule <b>${judge}</b> (${still} of them are still quiet there, cut again): on day <b>${t}</b>, <b>${pct(v)} in 100</b> still quiet. At this edge carried said <b>${pct(c)}</b>, lost <b>${pct(l)}</b>, left out <b>0</b>. Nearest: <b>${best}</b>.` +
          (judge === "left out" ? " Made the judge, left out can only find for itself: it reads the later record by dropping every quiet that has not broken." : " The later reading is cut again by its own edge, so it is a second reading under a rule, not the truth.");
      } else if (blind && !realEnd0) L2.innerHTML = `<span class="sw"></span>Hidden: what the record's later days wrote about these quiets. Declare, or walk on.`;
      else L2.innerHTML = `<span class="sw"></span>Move the edge back, and a fourth line shows what the record's later days wrote about the same quiets.`;
      const T = tally(rec), J = T[judge];
      $("judgeRead").innerHTML = `Over the <b>${T.edges}</b> edges of this record a month or more back with at least ten quiets, the later record read as <b>${judge}</b> lies nearest carried at <b>${J.carried}</b>, nearest lost at <b>${J.lost}</b>, nearest left out at <b>${J["left out"]}</b>.` + (rec === "kivu" ? " (Here the 94 days without a report are not an edge.)" : "");
    }
    const k = st.km;
    { const ev2 = events(rec, edgeT, rec === "kivu" && hole, 1 - off), cut2 = ev2.filter(x => !x.e), k2 = ev2.length ? km(ev2) : null;
      const same = ev2.length === ev.length && cut2.length === cut.length && cut2.filter(x => x.q.b).length === later && k2 && k2.tStar === k.tStar;
      const who = off ? "With the correct count (from the day after the rise)," : "With the old count (from the rise day itself),";
      $("fence").innerHTML = `${who} the same edge reads ` + (ev2.length ? `<b>${ev2.length}</b> quiets past 42 days, <b>${cut2.length}</b> cut, <b>${cut2.filter(x => x.q.b).length}</b> of them broke later; last cut quiet on day <b>${k2.tStar}</b>. ` : "no quiet past 42 days. ") +
        (same ? "Here the one day changes nothing a curve shows." : "<b>Here the one day moves the reading.</b>"); }
    $("sCarried").innerHTML = `No quiet the edge cut ever breaks. The curve never falls below <b>${pct(cut.length / ev.length)} in 100</b>, and it runs on for ever.`;
    $("sLost").innerHTML = k.isLoss ? `Each cut quiet counts while it was watched. The last cut one is on day <b>${k.tStar}</b>; there the estimate is <b>${pct(k.pStar)} in 100</b>. Past it: anywhere between 0 and ${pct(k.pStar)}.`
      : `The longest quiet broke, on day ${k.tStar}; the estimate reaches 0 there.`;
    const lastBreak = st.curves.nb ? Math.max(...ev.filter(x => x.e).map(x => x.t)) : null;
    $("sOut").innerHTML = st.curves.nb ? `Only the <b>${st.curves.nb}</b> finished quiets speak, and every one of them broke. The curve reaches 0 on day <b>${lastBreak}</b>.`
      : "No quiet has finished; this rule has nothing to say at all.";
    $("probe").textContent = probeDay == null ? "point at the curves to read a day"
      : `day ${probeDay}: carried ${pct(stepAt(st.curves.carried, probeDay))} · lost ${probeDay > k.tStar && k.isLoss ? "undefined" : pct(stepAt(k.steps, probeDay))} · left out ${st.curves.nb && probeDay <= lastBreak ? pct(stepAt(st.curves.out, probeDay)) : st.curves.nb ? 0 : "—"} in 100`;
    window.__edgeState = { edge: iso(edgeT), n: ev.length, broke, cut: cut.length, cutLaterBroke: later, tStar: k.tStar, pStar: Math.round(k.pStar * 1000) / 1000 };
  }

  // ---- ninth state: the declaration, read as the days come ----
  function declRead() {
    const el = $("decl");
    if (!decl || decl.rec !== rec) { el.hidden = true; window.__decl = null; return; }
    el.hidden = false;
    const qs = [...decl.qs], n = qs.length, endT = toD(E.records[rec][1]);
    const caseT = q => q.f0 + (q.L + 1 - decl.off) * DAY;
    const broke = qs.filter(q => q.b).sort((p, q) => caseT(p) - caseT(q)), came = broke.filter(q => caseT(q) <= edgeT);
    const D = E.facts.declare[rec];
    const head = `On <b>${nice(decl.edge)}</b> you declared <b>${n}</b> ${n === 1 ? "quiet" : "quiets"} over, seeing nothing after that day. `;
    let body;
    if (edgeT < decl.edge) body = "The edge now stands before your declaration; walk it forward to meet it again.";
    else if (decl.edge >= endT) body = "That is the record's own last day. Nothing after it was ever written, so your declaration stays as you made it: no later day here can overtake it, and none can confirm it.";
    else if (edgeT === decl.edge) body = "Let the days come to see what follows it.";
    else {
      const names = came.map(q => `${q.z} on ${nice(caseT(q))} (day ${q.L + 1} of its quiet)`);
      body = (came.length ? `By <b>${nice(edgeT)}</b>, a case has come in <b>${came.length}</b> of them: ${names.join("; ")}. ` : `By <b>${nice(edgeT)}</b>, no case has come in any of them. `) +
        (edgeT >= endT ? (broke.length ? `The other ${n - broke.length} were still quiet on the record's last day, which is an edge too: not over, only unwritten.`
          : `All ${n} were still quiet when the record stopped. Your declaration was never overtaken here, and the record's last day is a declaration of its own.`)
          : "The days are still coming.");
    }
    el.innerHTML = head + body + ` <span class="mute">Of the ${D.days} days on which this record lets a declaration be made, a later case overtakes it on ${D.overtaken}.</span>`;
    window.__decl = { edge: iso(decl.edge), n, broke: broke.length, came: came.length };
  }
  // ---- facts stated in prose, from build.py's asserted figures ----
  function facts() {
    const F = E.facts;
    $("facts").innerHTML = `At the 2026 record's own last day, 29 October, the three rules disagree as far as they can: carried never falls below ${pct(F.full26.floor)} in 100, left out reaches 0, and the lost curve stops on day ${F.full26.tStar} at ${pct(F.full26.pStar)} in 100. ` +
      `Move the edge back to 29 September and ${F.sep29.cut} quiets are cut; the declaration's reading would carry all of them as over, and ${F.sep29.cutLaterBroke} of them broke in the month that followed. The worst edge for that reading is ${nice(toD(F.worst26.date))}: ${F.worst26.cutLaterBroke} of ${F.worst26.cut}. ` +
      `The lost curve does not stand still either. Over the ${F.pStarRange26.edges} edges in 2026 at which at least ten quiets had reached 42 days, its value at the last cut quiet runs from ${pct(F.pStarRange26.min[0])} in 100 (${nice(toD(F.pStarRange26.min[1]))}) to ${pct(F.pStarRange26.max[0])} (${nice(toD(F.pStarRange26.max[1]))}). The estimate is a reading of the edge as much as of the quiets. ` +
      `In Kivu, counting the 94 days without a report as an edge cuts every quiet watched across them on 7 March 2020: ${F.fullK.n - F.holeK.n} quiets fall below 42 days and leave, and the last cut quiet comes on day ${F.holeK.tStar} instead of ${F.fullK.tStar}, at ${pct(F.holeK.pStar)} in 100 instead of ${pct(F.fullK.pStar)}.`;
  }

  { const L = E.facts.later;
    $("laterFacts").innerHTML = `Move the edge back and the record's later days can be set beside the three rules. On 29 September, at the last cut quiet's day (${L.sep29.t}), carried said ${pct(L.sep29.carried)} in 100 still quiet, lost ${pct(L.sep29.lost)}, and the later record ${pct(L.sep29.later)}: carried read too much quiet. On 30 August, at day ${L.aug30.t}, lost said ${pct(L.aug30.lost)}, and the later record ${pct(L.aug30.later)}, as carried had: lost read too little. Over the ${L.near.carried + L.near.lost + L.near["left out"]} edges in 2026 a month or more back with at least ten quiets, the later reading lay nearest carried at ${L.near.carried} and nearest lost at ${L.near.lost}; left out was never nearest. No rule is the right one. Each is a wager on the edge, and the record that comes after settles it one edge at a time, under a rule of its own.`;
    const J = E.facts.judge, B = J.bdbv, K = J.kivu;
    $("judgeFacts").innerHTML = `That rule of its own can be changed. Read the later record as carried instead of lost, and in 2026 not one verdict moves: at all ${B.edges} edges the two judges name the same rule, and their readings part by at most ${(B.maxGapCarriedLost * 100).toFixed(1)} points, because the later record has watched these quiets a month longer and cuts almost none of them before the day that is read. Read it as left out, and left out is nearest at all ${B.tally["left out"]["left out"]}. In Kivu, over ${K.edges} edges, the carried and lost judges agree at ${K.agreeCarriedLost}; each leans to itself by a little (carried nearest at ${K.tally.carried.carried} under the carried judge and ${K.tally.lost.carried} under lost; lost nearest at ${K.tally.lost.lost} under lost and ${K.tally.carried.lost} under carried); the left-out judge finds for left out at ${K.tally["left out"]["left out"]}, where the other two judges find for it at ${K.tally.lost["left out"]} and ${K.tally.carried["left out"]}. A rule made the judge of the rules finds for itself: barely, where the later record has watched long enough for its own edge not to bite; wholly, where the rule is the one that cannot see a quiet still running. A later record can settle a wager only under a rule that can lose.`;
    const lr = x => `${nice(toD(x[0]))} to ${nice(toD(x[1]))}`;
    $("stripFacts").innerHTML = `Set out edge by edge, in the strip under the buttons, the verdicts are not scattered. They come in seasons. In 2026 the lost judge's verdict changes only ${B.lostRuns - 1} times over ${B.edges} edges; its longest run, ${B.lostLongest[2]}, lasts from ${lr(B.lostLongest)}. In Kivu it changes ${K.lostRuns - 1} times over ${K.edges} edges, and one run, ${K.lostLongest[2]}, holds from ${lr(K.lostLongest)}: for nearly eight months of edges, the record that came after sided with the rule that says it is over. The carried and lost judges part at ${K.splitN} edges: once, on ${nice(toD(K.splitDays[0]))}, and then at the last ${K.splitN - 1} edges judged, ${nice(toD(K.splitDays[1]))} to ${nice(toD(K.split[1]))}, where the later record has watched only a month longer and each of the two finds for itself; the left-out judge names a rule neither of the others names at ${K.outApart} of ${K.edges}. Which rule the later record vindicates is a fact about the calendar before it is a fact about the rules: an edge falls in a season, and the season answers.`;
    const N = E.facts.next, nb = N.bdbv, nk = N.kivu, tot = o => o.carried + o.lost + o["left out"];
    $("nextFacts").innerHTML = `What makes a season is shown in the strip's lowest row: of the quiets an edge cuts, how many the later record shows breaking. The edge cannot see this; only the days after it can. Where none of them broke, the later record, judged lost, sided with carried at every edge: ${nb.none.carried} of ${tot(nb.none)} in 2026, ${nk.none.carried} of ${tot(nk.none)} in Kivu. Where some broke but fewer than a quarter, carried still won ${nb.under.carried} of ${tot(nb.under)} and ${nk.under.carried} of ${tot(nk.under)}. Where a quarter or more broke, carried won only ${nb.quarter.carried} of ${tot(nb.quarter)} and ${nk.quarter.carried} of ${tot(nk.quarter)}; lost or left out took the rest. So the verdict on a rule is not a verdict on its reasoning. It is what the epidemic did next, read back onto the rule that happened to guess it. "The rule that was right" is a sentence only the later days can write, and at the edge, where the rule has to be chosen, it cannot yet be said.`; }
  // ---- controls ----
  const first = {};
  for (const r of ["bdbv", "kivu"]) { const a = toD(E.records[r][0]); let d = 0; while (!events(r, a + d * DAY, false, 0).length) d++; first[r] = d; }
  function setRange() {
    const [a, b] = span(); rng.min = first[rec]; rng.max = Math.round((b - a) / DAY); rng.value = Math.round((edgeT - a) / DAY);
  }
  function pick(r) {
    rec = r; edgeT = span()[1];
    $("r26").setAttribute("aria-pressed", r === "bdbv"); $("rK").setAttribute("aria-pressed", r === "kivu");
    $("holeL").hidden = r !== "kivu"; setRange(); render();
  }
  // ---- eighth state: let the days come. The edge walks forward as the days did. ----
  let timer = null;
  const playB = $("play");
  function stop() { if (!timer) return; clearInterval(timer); timer = null; playB.setAttribute("aria-pressed", "false"); playB.innerHTML = "&#9654; let the days come"; }
  function play() {
    const [a, b] = span(), last = Math.round((b - a) / DAY);
    let d = Math.round((edgeT - a) / DAY); if (d >= last) d = first[rec];
    const step = Math.max(1, Math.round((last - first[rec]) / 240));
    playB.setAttribute("aria-pressed", "true"); playB.innerHTML = "&#10074;&#10074; stop the days";
    timer = setInterval(() => {
      d = Math.min(last, d + step); edgeT = a + d * DAY; setRange(); render();
      if (d >= last) stop();
    }, 45);
  }
  playB.onclick = () => timer ? stop() : play();
  for (const el of [cal, rng]) el.addEventListener("pointerdown", stop, true);
  rng.addEventListener("keydown", stop);
  window.__edgePlay = () => { play(); return !!timer; };
  const blindB = $("blind");
  function setBlind(v) { blind = v; blindB.setAttribute("aria-pressed", v); document.body.classList.toggle("blind", v); render(); }
  blindB.onclick = () => setBlind(!blind);
  $("declare").onclick = () => {
    const cut = events(rec, edgeT, rec === "kivu" && hole).filter(x => !x.e);
    if (!cut.length) return;
    stop(); decl = { rec, edge: edgeT, off, qs: new Set(cut.map(x => x.q)) };
    setBlind(false);
    if (edgeT < span()[1]) play();
  };
  window.__edgeDeclare = d => { stop(); if (d) { edgeT = toD(d); setRange(); } setBlind(true); $("declare").click(); stop(); return window.__decl; };
  $("r26").onclick = () => { stop(); pick("bdbv"); }; $("rK").onclick = () => { stop(); pick("kivu"); };
  $("hole").onchange = e => { hole = e.target.checked; render(); };
  for (const b of document.querySelectorAll("[data-j]")) b.onclick = () => {
    judge = b.dataset.j; for (const c of document.querySelectorAll("[data-j]")) c.setAttribute("aria-pressed", c === b); render();
  };
  $("day1").onchange = e => { off = e.target.checked ? 1 : 0; render(); };
  rng.oninput = () => { edgeT = span()[0] + rng.value * DAY; render(); };
  const dragTo = ev => {
    const r = cal.getBoundingClientRect(), [a, b] = span(), pad = 8;
    const f = Math.max(0, Math.min(1, (ev.clientX - r.left - pad) / (r.width - 2 * pad)));
    edgeT = a + Math.max(first[rec], Math.round(f * (b - a) / DAY)) * DAY; setRange(); render();
  };
  let dragging = false;
  cal.addEventListener("pointerdown", e => { dragging = true; cal.setPointerCapture(e.pointerId); dragTo(e); });
  cal.addEventListener("pointermove", e => { if (dragging) dragTo(e); });
  cal.addEventListener("pointerup", () => { dragging = false; });
  cur.addEventListener("pointermove", e => {
    if (!geom) return; const r = cur.getBoundingClientRect(), x = e.clientX - r.left;
    const t = Math.round(42 + (x - geom.L) / (geom.w - geom.L - geom.R) * (geom.maxT - 42));
    probeDay = t >= 42 && t <= geom.maxT ? t : null; render();
  });
  cur.addEventListener("pointerleave", () => { probeDay = null; render(); });
  window.addEventListener("resize", render);
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", render);
  window.__edgeJudge = j => { document.querySelector(`[data-j="${j}"]`).click(); return { later: $("later").textContent, tally: tally(rec)[judge], edges: tally(rec).edges }; };
  window.__edgeSet = (r, d, h, o) => { pick(r); hole = !!h; $("hole").checked = hole; off = o ? 1 : 0; $("day1").checked = !!o; edgeT = toD(d); setRange(); render(); return { edge: window.__edgeState, day: window.__dayState }; };
  { const R = E.facts.ruleDay;
    $("dayFacts").innerHTML = `${pct(R.k42.lost)} in 100 quiets that reached 42 days broke within 90 days, ${pct(R.k63.lost)} in 100 of those that reached day 63, and the share falls below 1 in 10 only for quiets that reached day ${R.kTenth}. Counting the 94 days without a report as an edge raises the first figure to ${pct(R.h42.lost)} (lost) or ${pct(R.h42.out)} (left out).`; }
  facts(); pick("bdbv");
})();
