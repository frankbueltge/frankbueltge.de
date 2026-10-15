/* The surface's logic. Plain JavaScript, no framework, no build step.
 *
 * Two sources, both committed, both read at load:
 *   atlas/layers/index.json and the layers it lists: the record. Everything the page
 *     shows of the practice's life (the last session, the points and connections of the
 *     record view, what a session's layer laid) is derived from these and from nothing else.
 *   surface/margin.json: the margin, hand-written standing prose beside the derived
 *     rendering, each item citing the file it was written from (surface/README.md).
 * The page holds no state a layer cannot back. What it keeps is the address
 * (#view=projects&p=6, #ask=<node id>) and, in this browser only, the last layer seen.
 */
(() => {
  'use strict';

  const GH = 'https://github.com/frankbueltge/n-1/blob/main/';
  const TREE = 'https://github.com/frankbueltge/n-1/tree/main/';
  const VIEWS = ['how', 'projects', 'record', 'works'];
  // research stands in front, coloured; sessions and documents are the record's bookkeeping
  const FG = ['practice', 'source', 'problem', 'finding', 'material', 'work', 'study', 'instrument', 'concept', 'channel', 'project'];
  const NAMED = ['problem', 'material', 'work', 'project'];
  const LANES = [['work', 'works'], ['project', 'projects'], ['problem', 'problems'], ['material', 'material'], ['concept', 'concepts'],
    ['source', 'sources'], ['instrument', 'instruments'], ['event', 'sessions'], ['document', 'documents']];
  const laneOf = t => { const i = LANES.findIndex(l => l[0] === t); return i >= 0 ? i : t === 'finding' ? 2 : t === 'study' ? 0 : 7; };
  // what a session's layer can be said to have done, in the atlas's own relation words
  const LAID = ['finds', 'declares', 'builds', 'shows', 'ends-in', 'opens', 'closes', 'takes', 'leaves'];
  const GLYPH = { work: '◆', modest: '◇', putback: '○', open: '→' };

  const $ = (sel, root = document) => root.querySelector(sel);
  const esc = s => String(s == null ? '' : s).replace(/[&<>"']/g, c => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]));
  const dayOf = s => Math.round(Date.parse(String(s).slice(0, 10) + 'T00:00:00Z') / 86400000);
  const fmt = (day, o = { day: 'numeric', month: 'short' }) => new Date(day * 86400000).toLocaleString('en-GB', { ...o, timeZone: 'UTC' });
  const fmtLong = day => fmt(day, { day: 'numeric', month: 'long', year: 'numeric' });
  // layers are dated by the Europe/Berlin civil date of the wake (atlas/SCHEMA.md), so "today" is read there too
  const today = () => dayOf(new Intl.DateTimeFormat('en-CA', { timeZone: 'Europe/Berlin', year: 'numeric', month: '2-digit', day: '2-digit' }).format(new Date()));
  const hash32 = s => { let h = 2166136261; for (const ch of s) h = Math.imul(h ^ ch.charCodeAt(0), 16777619); return ((h >>> 0) % 1000) / 1000; };
  const isFG = t => FG.includes(t);
  const tclass = t => (isFG(t) ? 't-' + t : 't-bk');
  const shortName = id => id.split(':').slice(1).join(':').replace(/-/g, ' ');
  const dash = s => String(s).replace(/ -- /g, ' — ');
  const clip = (s, n) => (s.length > n ? s.slice(0, n - 2).trimEnd() + '…' : s);
  const refHref = r => (/^https?:/.test(r) ? r : /\.html$|\/$/.test(r) ? r : GH + r);
  const mq = { mobile: window.matchMedia('(max-width: 759px)'), mid: window.matchMedia('(max-width: 1099px)') };
  const calm = window.matchMedia('(prefers-reduced-motion: reduce)');

  const state = { view: 'how', step: null, proj: null, sel: null, mode: 'stars', hover: null, t: 0, playing: false, played: false };
  let A = null, M = null, atlasError = null, marginError = null, sinceNote = '';

  // ── the address ─────────────────────────────────────────────────────────
  function readAddress() {
    const o = {};
    for (const part of location.hash.replace(/^#/, '').split('&')) {
      const i = part.indexOf('=');
      if (i < 1) continue;
      try { o[part.slice(0, i)] = decodeURIComponent(part.slice(i + 1)); } catch (e) { /* a malformed escape selects nothing */ }
    }
    // "#ask=<id>" alone is the address the surface used until 2026-10-10 and still answers
    state.view = VIEWS.includes(o.view) ? o.view : o.ask ? 'record' : 'how';
    state.sel = o.ask || null;
    state.step = o.step || null;
    state.proj = o.p ? Number(o.p) : null;
    state.mode = o.mode === 'lanes' ? 'lanes' : 'stars';
  }
  function address(patch = {}) {
    const s = { ...state, ...patch };
    const parts = ['view=' + s.view];
    if (s.view === 'how' && s.step) parts.push('step=' + s.step);
    if (s.view === 'projects' && s.proj) parts.push('p=' + s.proj);
    if (s.view === 'record') {
      if (s.mode === 'lanes') parts.push('mode=lanes');
      if (s.sel) parts.push('ask=' + encodeURIComponent(s.sel));
    }
    return '#' + parts.join('&');
  }

  // ── the record, derived ─────────────────────────────────────────────────
  async function loadAtlas() {
    const manifest = await (await fetch('atlas/layers/index.json')).json();
    const layers = await Promise.all(manifest.map(f => fetch('atlas/layers/' + f).then(r => r.json())));
    const nodes = {}, order = [];
    for (const l of layers) for (const n of l.nodes || []) { nodes[n.id] = { ...n, layer: l.layer }; order.push(n.id); }
    const edges = layers.flatMap(l => (l.edges || []).map(e => ({ ...e, layer: l.layer })));
    const degree = {};
    for (const e of edges) { degree[e.from] = (degree[e.from] || 0) + 1; degree[e.to] = (degree[e.to] || 0) + 1; }
    const d0 = dayOf(layers[0].layer), d1 = dayOf(layers[layers.length - 1].layer), days = d1 - d0 + 1;
    const cols = Array.from({ length: days }, () => []);
    for (const id of order) { nodes[id].day = dayOf(nodes[id].layer) - d0; cols[nodes[id].day].push(id); }
    const newest = layers[layers.length - 1];
    const session = (newest.nodes || []).find(n => /^night:|^event:bell-/.test(n.id)) || (newest.nodes || [])[0] || null;
    return { layers, nodes, order, edges, degree, d0, d1, days, cols, newest, session };
  }
  const neighbours = id => A.edges.filter(e => e.from === id || e.to === id).map(e => {
    const out = e.from === id, other = out ? e.to : e.from, n = A.nodes[other];
    return { out, other, relation: e.relation, label: n ? n.label : other, type: n ? n.type : '' };
  });

  // "Since your last visit": a marker kept in this browser only (the practice's own, night 29).
  // It reads and writes localStorage, never the record; a cleared store simply starts over.
  function noteVisit() {
    try {
      const KEY = 'n1-last-seen-layer', prev = localStorage.getItem(KEY), now = A.newest.layer;
      if (prev === null) sinceNote = 'First visit on this device';
      else if (prev === now) sinceNote = 'No new session since your last visit here';
      else {
        const at = A.layers.findIndex(l => l.layer === prev);
        const n = at === -1 ? A.layers.length : A.layers.length - 1 - at;
        sinceNote = n + (n === 1 ? ' session' : ' sessions') + ' new since your last visit here';
      }
      localStorage.setItem(KEY, now);
    } catch (e) { sinceNote = ''; }
  }

  // ── the shell ───────────────────────────────────────────────────────────
  function renderShell() {
    for (const v of VIEWS) $('#v-' + v).hidden = v !== state.view;
    for (const a of document.querySelectorAll('.tabs a')) {
      if (a.dataset.view === state.view) a.setAttribute('aria-current', 'page'); else a.removeAttribute('aria-current');
    }
    const box = $('#readout');
    if (atlasError) { box.innerHTML = '<span class="last">The record could not be loaded: ' + esc(atlasError) + '</span>'; return; }
    if (!A) return;
    const reading = M && M.reading ? dayOf(M.reading.date) : null;
    const left = reading === null ? null : reading - today();
    const when = reading === null ? '' : esc(M.reading.label) + ' ' + fmt(reading) + (left > 1 ? ' · in ' + left + ' days' : left === 1 ? ' · tomorrow' : left === 0 ? ' · today' : '');
    box.innerHTML =
      '<div class="readout-row"><span class="last"><i class="pulse"></i>Last session ' + fmt(A.d1) +
      (A.session ? ' · ' + esc(A.session.id.replace(':', ' ')) : '') + '</span>' +
      (when ? '<span class="reading">' + when + '</span>' : '') + '</div>' +
      (sinceNote ? '<div class="since">' + esc(sinceNote) + '</div>' : '');
  }

  // ── 1. how it works ─────────────────────────────────────────────────────
  function stepStat(s) {
    if (s.stat) return s.stat;
    const P = M.projects, count = kinds => P.filter(p => kinds.includes(p.outcome)).length;
    if (s.derive === 'projects') return String(P.length);
    if (s.derive === 'sessions') return String(P.reduce((n, p) => n + p.sessions.length, 0));
    if (s.derive === 'outcomes') return [count(['work', 'modest']), count(['putback']), count(['open'])].join(' · ');
    if (s.derive === 'instrumentsPerProject') {
      const c = P.map(p => p.instruments.length), a = Math.min(...c), b = Math.max(...c);
      return a === b ? String(a) : a + '–' + b;
    }
    return '';
  }
  const firstSession = () => Math.min(...M.projects.flatMap(p => p.sessions.map(s => dayOf(s.date))));
  const statLabel = s => String(s.statLabel || '').replace('{first}', fmt(firstSession()));
  const refLinks = refs => (refs || []).map(([label, href]) => '<a href="' + esc(href) + '">' + esc(label) + ' →</a>').join('');
  const stepDetail = s =>
    '<p class="step-body">' + esc(s.body) + '</p>' +
    '<div class="step-ex"><b>IN THE RECORD</b> ' + esc(s.example) + '</div>' +
    '<div class="refs">' + refLinks(s.refs) + '</div>';

  function renderHow() {
    if (!M) return marginMissing('#how-card', '#how-right');
    const mobile = mq.mobile.matches;
    const active = state.step || (mobile ? null : M.steps[0].key);
    const S = M.steps.find(s => s.key === active);
    $('#how-card').innerHTML = !S ? '' :
      '<div class="head"><span>STEP ' + (M.steps.indexOf(S) + 1) + ' / ' + M.steps.length + '</span><span>' + esc(stepStat(S)) + ' ' + esc(statLabel(S)) + '</span></div>' +
      '<h3>' + esc(S.title) + '</h3>' + stepDetail(S);
    $('#how-card').hidden = !S;
    const steps = M.steps.map((s, i) => {
      const on = s.key === active;
      return '<li class="step' + (on ? ' on' : '') + '"><a class="sb" data-replace href="' + address({ step: on && mobile ? null : s.key }) + '"' + (on ? ' aria-current="true"' : '') + '>' +
        '<span class="num">' + (i + 1) + '</span><span class="words"><span class="ttl">' + esc(s.title) + '</span><span class="ln">' + esc(s.line) + '</span></span>' +
        '<span class="st" title="' + esc(statLabel(s)) + '">' + esc(stepStat(s)) + '</span></a>' +
        '<div class="inline">' + stepDetail(s) + '</div></li>';
    }).join('');
    const posts = M.postulates.map(p =>
      '<li class="post" data-rank="' + p.rank + '"><div class="ph"><span class="pn" data-name="' + esc(p.name) + '">P' + p.n + '</span>' +
      '<span class="bars" role="img" aria-label="change: ' + esc(M.verdictScale[p.rank] || '') + ', ' + p.rank + ' of 4">' +
      [1, 2, 3, 4].map(i => '<i' + (i <= p.rank ? ' class="f"' : '') + '></i>').join('') + '</span></div>' +
      '<div class="nm">' + esc(p.name) + '</div><div class="vd">' + esc(p.verdict) + '</div><div class="tx">' + esc(p.text) + '</div></li>').join('');
    $('#how-right').innerHTML =
      '<div class="rowhead"><p class="kicker">One project, start to end</p><span class="hint">select a step</span></div>' +
      '<ol class="steps">' + steps + '</ol>' +
      '<div class="loop"><span>' + esc(M.loop) + '</span></div>' +
      '<div class="rowhead gap-l"><p class="kicker">The paper’s six postulates, tested on a machine</p><span class="hint">bars: how far each had to change</span></div>' +
      '<ol class="posts">' + posts + '</ol>' +
      '<p class="quote">“' + esc(M.quote.text) + '” <cite>' + esc(M.quote.by) + ', <a href="' + GH + esc(M.quote.source) + '">' + esc(M.quote.source.replace(/^reading\/(\d+).*/, 'reading/$1')) + '</a></cite></p>';
  }

  // ── 2. projects ─────────────────────────────────────────────────────────
  const instrument = code => M.instruments.find(i => i.code === code) || { code, name: code };
  const pips = p => '<span class="pips" aria-hidden="true">' + [0, 1, 2, 3, 4].map(k => '<i class="' + (k < p.sessions.length ? 'u' : k < 3 ? 'b' : '') + '"></i>').join('') + '</span>';

  // What the layer of a session's night laid for its project, in the atlas's own words.
  function laidBy(p, night) {
    if (!A) return [];
    const n = A.nodes['night:' + night];
    if (!n) return [];
    return A.edges
      .filter(e => e.layer === n.layer && (e.from === n.id || e.from === p.node) && LAID.includes(e.relation) && !/^project:/.test(e.to))
      .slice(0, 3)
      .map(e => ({ rel: e.relation, label: clip(dash(A.nodes[e.to] ? A.nodes[e.to].label : e.to), 110), to: e.to }));
  }
  // Nights on the record since the first project that no project in the margin lists yet.
  function unlistedNights() {
    if (!A) return [];
    const listed = new Set(M.projects.flatMap(p => p.sessions.map(s => s.night)));
    const first = Math.min(...listed);
    return A.order.filter(id => /^night:\d+$/.test(id)).map(id => Number(id.slice(6))).filter(n => n > first && !listed.has(n));
  }

  function renderProjects() {
    if (!M) return marginMissing('#proj-card', '#proj-right');
    const P = M.projects, proj = P.find(p => p.n === state.proj) || P[P.length - 1];
    const late = unlistedNights();
    $('#proj-notice').innerHTML = late.length ? '<p class="notice">' + (late.length === 1 ? 'Night ' + late[0] + ' is' : 'Nights ' + late.join(', ') + ' are') +
      ' on the record and not yet in this table. <a href="' + address({ view: 'record', sel: 'night:' + late[late.length - 1] }) + '">See the record →</a></p>' : '';

    // the detail card
    const sess = proj.sessions.map((s, i) =>
      '<li><div class="sid">S' + (i + 1) + '<span>' + fmt(dayOf(s.date)) + '</span></div><div class="what">' +
      laidBy(proj, s.night).map(x => '<span><i>' + esc(x.rel) + '</i> ' + esc(x.label) + '</span>').join('') +
      (s.predictions ? '<span class="pred">' + esc(s.predictions) + '</span>' : '') +
      '<span><a class="go" href="' + address({ view: 'record', sel: 'night:' + s.night }) + '">night ' + s.night + ' →</a></span></div></li>').join('');
    $('#proj-card').innerHTML =
      '<div class="head"><span>PROJECT ' + proj.n + '</span><span class="c-' + proj.outcome + '">' + esc(proj.outcomeLabel) + '</span></div>' +
      '<h3>' + esc(proj.title) + '</h3><div class="mat">' + esc(proj.material) + '</div>' +
      '<div class="chips">' + proj.instruments.map(c => '<span>' + esc(c) + ' ' + esc(instrument(c).name) + '</span>').join('') + '</div>' +
      '<ol class="sess">' + sess + '</ol>' +
      (proj.couldNot || []).map(t => '<p class="cnot"><span>' + esc(t) + '</span></p>').join('') +
      (proj.note ? '<p class="note">' + esc(proj.note) + '</p>' : '') +
      '<div class="refs">' + refLinks(proj.pages) + '<a href="' + TREE + esc(proj.dir) + '">The project’s record →</a></div>';

    // the timeline: one row per project, one dot per session, on the civil dates the record gives
    const reading = M.reading ? dayOf(M.reading.date) : null, now = today();
    const T0 = firstSession(), T1 = Math.max(now, reading || 0, ...P.flatMap(p => p.sessions.map(s => dayOf(s.date)))) + 1;
    const f = d => ((d - T0 + 0.5) / (T1 - T0)).toFixed(4);
    let ticks = '';
    for (let d = T0; d < T1; d++) {
      const dt = new Date(d * 86400000);
      if (d !== T0 && dt.getUTCDay() !== 1 && dt.getUTCDate() !== 1) continue;
      ticks += '<i class="at tick" style="--f:' + f(d) + '"></i><span class="at tick-l" style="--f:' + f(d) + '">' + fmt(d) + '</span>';
    }
    const rows = P.map((p, i) => {
      const byDay = {}; for (const s of p.sessions) byDay[s.date] = (byDay[s.date] || 0) + 1;
      const seen = {};
      const dots = p.sessions.map(s => { const k = seen[s.date] = (seen[s.date] || 0) + 1; return { f: f(dayOf(s.date)), dx: (k - 1 - (byDay[s.date] - 1) / 2) * 11 }; });
      const last = dots[dots.length - 1], first = dots[0], left = Number(last.f) > 0.64;
      const out = left ? { f: first.f, dx: first.dx - 14 } : { f: last.f, dx: last.dx + 14 };
      return '<a class="tl-row' + (p === proj ? ' on' : '') + '" data-replace style="--i:' + i + '" href="' + address({ proj: p.n }) + '"' + (p === proj ? ' aria-current="true"' : '') + '>' +
        '<span class="lab"><b>P' + p.n + '</b>' + esc(p.title) + '</span>' + pips(p) +
        dots.map(d => '<i class="at dot" style="--f:' + d.f + ';--dx:' + d.dx + 'px"></i>').join('') +
        '<span class="at out' + (left ? ' left' : '') + '" style="--f:' + out.f + ';--dx:' + out.dx + 'px"><b class="c-' + p.outcome + '">' + GLYPH[p.outcome] + '</b><span>' + esc(p.outcome === 'open' ? 'open' : p.outcomeLabel) + '</span></span></a>';
    }).join('');
    const marks = [[now, 'today', ''], ...(reading === null ? [] : [[reading, M.reading.label.toLowerCase(), 'reading']])].sort((a, b) => a[0] - b[0]);
    const mk = marks.map(([d, label, cls], i) =>
      '<i class="at mk ' + cls + '" style="--f:' + f(d) + '"></i><span class="at mk-l ' + cls + ((i === 0 && marks.length > 1) || Number(f(d)) > 0.8 ? ' end' : '') + '" style="--f:' + f(d) + '">' + esc(label) + '</span>').join('');
    const plist = '<ol class="plist">' + P.map(p =>
      '<li><a class="pl' + (p === proj ? ' on' : '') + '" data-replace href="' + address({ proj: p.n }) + '"><span class="pn">P' + p.n + '</span><span class="pt">' + esc(p.title) + pips(p) + '</span><span class="pg c-' + p.outcome + '">' + GLYPH[p.outcome] + '</span></a></li>').join('') + '</ol>';

    // the matrix: which of the paper's instruments each project chose
    const head = '<div class="h first">instrument</div>' + P.map(p =>
      '<a class="h' + (p === proj ? ' on' : '') + '" data-replace href="' + address({ proj: p.n }) + '"><span class="pp">P</span>' + p.n + '</a>').join('') + '<div class="h r">used</div>';
    const body = M.instruments.map(ins => {
      const n = P.filter(p => p.instruments.includes(ins.code)).length, none = !ins.practiceWide && n === 0;
      return '<div class="inst' + (none ? ' dim' : '') + '"><i>' + esc(ins.code) + '</i><span>' + esc(ins.name) + (ins.note ? ' <small>(' + esc(ins.note) + ')</small>' : '') + '</span></div>' +
        P.map(p => {
          const kind = ins.practiceWide ? 'wide' : !p.instruments.includes(ins.code) ? '' : p.fired && p.fired[ins.code] ? 'fired' : 'chosen';
          const say = { wide: 'runs practice-wide', fired: 'chosen; failure criterion ' + ((p.fired || {})[ins.code] || '') + ' triggered', chosen: 'chosen', '': 'not used' }[kind];
          return '<div class="cell ' + kind + (p === proj ? ' on' : '') + '" title="P' + p.n + ' · ' + esc(ins.code) + ': ' + esc(say) + '"><b></b></div>';
        }).join('') +
        '<div class="used' + (none ? ' dim' : '') + '">' + (ins.practiceWide ? 'all' : n + ' / ' + P.length) + '</div>';
    }).join('');

    $('#proj-right').innerHTML =
      '<div class="rowhead tlhead"><p class="kicker">Sessions, by night</p><span class="hint">pips: sessions used of the bound · select a row</span></div>' +
      '<div class="tl" style="--rows:' + P.length + '">' + ticks + rows + mk + '</div>' + plist +
      '<div class="rowhead mxhead gap-l"><p class="kicker">Which of the paper’s eight instruments each project chose</p><span class="hint">chosen before the material was read</span></div>' +
      '<div class="mxwrap"><div class="mx" style="--n:' + P.length + '">' + head + body + '</div></div>' +
      '<ul class="legend"><li class="chosen"><b></b>chosen, failure criterion not triggered</li><li class="fired"><b></b>failure criterion partly triggered</li><li class="wide"><b></b>runs practice-wide, not counted</li></ul>';
  }

  // ── 3. the record ───────────────────────────────────────────────────────
  const R = { key: '', pos: {}, nodes: [], edges: [], geom: null };

  function geometry() {
    const rec = $('#rec'), mobile = mq.mobile.matches, mid = mq.mid.matches;
    const lanes = state.mode === 'lanes' || mobile;
    if (mobile) {
      const W = Math.max(280, $('#rec-stage').clientWidth), LH = 50, H = LANES.length * LH + 24;
      return { kind: 'mobile', lanes: true, W, H, X0: 4, X1: W - 4, Y0: 0, Y1: LANES.length * LH, LH, labelX: 0, tickY: LANES.length * LH + 16, actTop: 0 };
    }
    if (mid) {
      const W = rec.clientWidth, H = 620;
      return { kind: 'mid', lanes, W, H, X0: lanes ? 150 : 30, X1: W - 30, Y0: 70, Y1: H - 60, LH: (H - 130) / LANES.length, labelX: 24, tickY: H - 28, actTop: 40 };
    }
    const top = rec.getBoundingClientRect().top + window.scrollY;
    const W = rec.clientWidth, H = Math.round(Math.max(700, Math.min(900, window.innerHeight - Math.min(top, 160))));
    rec.style.setProperty('--h', H + 'px');
    return { kind: 'wide', lanes, W, H, X0: lanes ? 616 : 470, X1: W - 50, Y0: 70, Y1: H - 136, LH: (H - 206) / LANES.length, labelX: 476, tickY: H - 102, actTop: 40 };
  }

  function buildRecord() {
    const g = geometry(), key = [g.kind, g.lanes, g.W, g.H, A.order.length, A.edges.length].join('|');
    if (key === R.key) return;
    R.key = key; R.geom = g;
    const { W, H, X0, X1, Y0, Y1, LH } = g, U = (X1 - X0) / A.days, pos = {};
    if (g.lanes) {
      for (const id of A.order) {
        const n = A.nodes[id], li = laneOf(n.type);
        pos[id] = [X0 + U * (n.day + 0.15 + 0.7 * hash32(id)), Y0 + li * LH + (g.kind === 'mobile' ? 18 : 12) + (LH - (g.kind === 'mobile' ? 24 : 20)) * hash32(id + 'y')];
      }
    } else {
      A.cols.forEach((ids, i) => ids.forEach((id, j) => {
        pos[id] = [X0 + U * (i + 0.2 + 0.6 * hash32(id)), Y0 + 40 + (Y1 - Y0 - 40) * (j + 0.5 + (hash32(id + 'y') - 0.5) * 0.8) / ids.length];
      }));
    }
    R.pos = pos;
    let s = '';
    if (g.lanes) LANES.forEach((l, i) => {
      const y = Y0 + i * LH, count = A.order.filter(id => laneOf(A.nodes[id].type) === i).length;
      s += '<line class="lane" x1="' + g.labelX + '" x2="' + (X1 + 10) + '" y1="' + y + '" y2="' + y + '"/>' +
        '<text class="lane-l ' + (i >= 7 ? '' : 't-' + l[0]) + '" x="' + g.labelX + '" y="' + (y + (g.kind === 'mobile' ? 12 : 15)) + '">' + l[1] +
        ' <tspan class="lane-n" dx="' + (g.kind === 'mobile' ? 4 : 10) + '">' + count + '</tspan></text>';
    });
    for (let i = 0; i < A.days; i++) {
      const dt = new Date((A.d0 + i) * 86400000), d = dt.getUTCDate();
      if (!(i === 0 || d === 1 || (d === 15 && g.kind !== 'mobile'))) continue;
      const x = X0 + U * i;
      if (g.kind !== 'mobile') s += '<line class="tk" x1="' + x + '" x2="' + x + '" y1="' + (g.tickY - 14) + '" y2="' + (g.tickY - 6) + '"/>';
      s += '<text class="tk-l" x="' + Math.max(x, 18) + '" y="' + (g.tickY + 4) + '">' + fmt(A.d0 + i) + '</text>';
    }
    (M ? M.acts : []).forEach((a, i) => {
      const x = X0 + U * (dayOf(a.date) - A.d0 + 0.5);
      if (g.kind === 'mobile') {
        s += '<line class="act-line" x1="' + x + '" x2="' + x + '" y1="0" y2="' + Y1 + '"/><text class="act-n" x="' + x + '" y="' + (-8 - (i % 2) * 14) + '">' + (i + 1) + '</text>';
      } else {
        const y = g.actTop + (i % 2) * 22;
        s += '<line class="act-line" x1="' + x + '" x2="' + x + '" y1="' + y + '" y2="' + (g.tickY - 14) + '"/><circle class="act-c" cx="' + x + '" cy="' + y + '" r="9"/>' +
          '<text class="act-n" x="' + x + '" y="' + (y + 3.5) + '">' + (i + 1) + '</text>';
      }
    });
    const drawn = A.edges.map((e, i) => ({ e, i })).filter(x => pos[x.e.from] && pos[x.e.to]);
    for (const { e, i } of drawn) {
      const a = pos[e.from], b = pos[e.to], same = Math.abs(a[0] - b[0]) < U;
      const mx = same ? Math.min(a[0], b[0]) - 12 - Math.abs(a[1] - b[1]) * 0.22 : (a[0] + b[0]) / 2;
      const my = same ? (a[1] + b[1]) / 2 : Math.min(a[1], b[1]) - Math.abs(a[0] - b[0]) * 0.18;
      const fg = isFG(A.nodes[e.from].type) && isFG(A.nodes[e.to].type);
      s += '<path class="e' + (fg ? ' fg' : '') + '" data-e="' + i + '" d="M ' + a[0].toFixed(1) + ' ' + a[1].toFixed(1) + ' Q ' + mx.toFixed(1) + ' ' + my.toFixed(1) + ' ' + b[0].toFixed(1) + ' ' + b[1].toFixed(1) + '"/>';
    }
    const radius = id => {
      const dg = A.degree[id] || 0;
      return !isFG(A.nodes[id].type) ? 1.4 : g.kind === 'mobile' ? Math.min(2.4 + Math.sqrt(dg) * 0.7, 6) : Math.min(2.6 + Math.sqrt(dg) * 0.9, 7.5);
    };
    // Names for the research that carries most connections, the best connected first; a name
    // that would lie over one already set, or run off the map, is left to the pointer.
    const names = {}, boxes = [];
    if (!g.lanes) {
      const wanted = A.order.filter(id => NAMED.includes(A.nodes[id].type) && (A.degree[id] || 0) >= 3).sort((a, b) => (A.degree[b] || 0) - (A.degree[a] || 0));
      for (const id of wanted) {
        const [x, y] = pos[id], r = radius(id), text = shortName(id), w = text.length * 6.4;
        const left = x + r + 6 + w > W - 16, x0 = left ? x - r - 6 - w : x + r + 6;
        const box = [x0 - 4, y - 9, x0 + w + 4, y + 6];
        if (x0 < X0 - 24 || boxes.some(b => box[0] < b[2] && box[2] > b[0] && box[1] < b[3] && box[3] > b[1])) continue;
        boxes.push(box); names[id] = { text, x: left ? x - r - 6 : x + r + 6, anchor: left ? 'end' : 'start' };
      }
    }
    for (const id of A.order) {
      const n = A.nodes[id], [x, y] = pos[id], fg = isFG(n.type), r = radius(id), named = names[id];
      s += '<a class="n ' + (fg ? 'fg ' : '') + tclass(n.type) + '" data-id="' + esc(id) + '" href="' + address({ view: 'record', sel: id }) + '"' + (fg ? '' : ' tabindex="-1"') +
        ' aria-label="' + esc(n.type + ': ' + dash(n.label)) + '">' +
        '<circle cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (g.kind === 'mobile' ? 8 : Math.max(5, r + 2)) + '" fill="transparent"/>' +
        (fg && !g.lanes ? '<circle class="halo" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + (r * 3).toFixed(1) + '"/>' : '') +
        '<circle class="c" cx="' + x.toFixed(1) + '" cy="' + y.toFixed(1) + '" r="' + r.toFixed(2) + '"/>' +
        (named ? '<text x="' + named.x.toFixed(1) + '" y="' + (y + 3.5).toFixed(1) + '" text-anchor="' + named.anchor + '">' + esc(named.text) + '</text>' : '') + '</a>';
    }
    const svg = $('#rec-svg');
    svg.setAttribute('width', W); svg.setAttribute('height', H);
    svg.setAttribute('viewBox', g.kind === 'mobile' ? '0 -40 ' + W + ' ' + (H + 40) : '0 0 ' + W + ' ' + H);
    if (g.kind === 'mobile') svg.setAttribute('height', H + 40);
    svg.innerHTML = s;
    R.nodes = [...svg.querySelectorAll('a.n')].map(el => ({ el, id: el.dataset.id, day: A.nodes[el.dataset.id].day, shown: true }));
    R.edges = [...svg.querySelectorAll('path.e')].map(el => { const e = A.edges[Number(el.dataset.e)]; return { el, e, day: Math.max(A.nodes[e.from].day, A.nodes[e.to].day), shown: true }; });
  }

  // Which points and connections the cursor's date already holds.
  function showUntil(t) {
    let nodes = 0, edges = 0;
    for (const n of R.nodes) { const v = n.day <= t; if (v) nodes++; if (v !== n.shown) { n.shown = v; n.el.style.display = v ? '' : 'none'; } }
    for (const x of R.edges) { const v = x.day <= t; if (v) edges++; if (v !== x.shown) { x.shown = v; x.el.style.display = v ? '' : 'none'; } }
    $('#rec-when').textContent = fmtLong(A.d0 + Math.min(A.days - 1, Math.floor(t)));
    $('#rec-count').textContent = nodes + ' points · ' + edges + ' connections';
    const range = $('#rec-range');
    if (document.activeElement !== range) range.value = t;
    $('#rec-play').textContent = state.playing ? '❚❚' : '▶';
    $('#rec-play').setAttribute('aria-label', state.playing ? 'Pause the replay' : 'Replay the record from its founding');
  }

  function focusRecord() {
    const sel = state.sel && A.nodes[state.sel] ? state.sel : null, focus = state.hover || sel;
    const near = sel ? new Set(neighbours(sel).map(c => c.other).concat(sel)) : null;
    $('#rec').classList.toggle('has-sel', !!sel);
    $('#rec').classList.toggle('lanes', R.geom.lanes);
    for (const x of R.edges) x.el.classList.toggle('on', !!focus && (x.e.from === focus || x.e.to === focus));
    for (const n of R.nodes) { n.el.classList.toggle('dim', !!near && !near.has(n.id)); n.el.classList.toggle('sel', n.id === sel); }
    const tip = $('#rec-tip'), h = state.hover && A.nodes[state.hover];
    tip.hidden = !h;
    if (h) {
      tip.innerHTML = '<b class="' + tclass(h.type) + '">' + esc(h.type) + ' · ' + fmt(A.d0 + h.day) + '</b>' + esc(dash(h.label));
      tip.style.left = R.pos[state.hover][0] + 'px'; tip.style.top = R.pos[state.hover][1] + 'px';
    }
    const insp = $('#insp');
    insp.hidden = !sel;
    // the panel stands on the side its point is not on
    insp.classList.toggle('left', !!sel && R.geom.kind === 'wide' && R.pos[sel][0] > R.geom.W - 440);
    if (!sel) { if (state.sel) { insp.hidden = false; insp.innerHTML = '<header><h3>No point ' + esc(state.sel) + ' on the record.</h3><div class="ty"><a href="' + address({ sel: null }) + '">Close ✕</a></div></header>'; } return; }
    const n = A.nodes[sel], conn = neighbours(sel), ref = n.refs && n.refs[0];
    insp.innerHTML =
      '<header><div class="ty"><span class="' + tclass(n.type) + '">' + esc(n.type) + ' · ' + fmtLong(A.d0 + n.day) + '</span>' +
      '<a href="' + address({ sel: null }) + '" aria-label="Close"><span class="w">Close </span>✕</a></div>' +
      '<h3>' + esc(dash(n.label)) + '</h3><div class="meta"><span>' + conn.length + (conn.length === 1 ? ' connection' : ' connections') + '</span>' +
      '<a href="' + esc(ref ? refHref(ref) : 'record.html') + '">' + (ref && /\.html$|\/$/.test(ref) ? 'Open the page' : 'Open record') + ' →</a></div></header>' +
      '<ol class="conn">' + conn.map(c =>
        '<li><a href="' + address({ sel: c.other }) + '"><b class="' + tclass(c.type) + '"></b><span><i>' + (c.out ? '→ ' : '← ') + esc(c.relation) + '</i><em>' + esc(dash(c.label)) + '</em></span></a></li>').join('') + '</ol>';
  }

  let raf = 0;
  function replay(from = 0) {
    cancelAnimationFrame(raf);
    const t0 = performance.now(), dur = 4000 * (1 - from / A.days);
    state.playing = true; state.played = true; state.t = from;
    const step = now => {
      const k = Math.min(1, (now - t0) / Math.max(dur, 1));
      state.t = from + (A.days - from) * (1 - Math.pow(1 - k, 2));
      if (k >= 1 || !state.playing) state.playing = false;
      showUntil(state.t);
      if (state.playing) raf = requestAnimationFrame(step);
    };
    raf = requestAnimationFrame(step);
  }

  function renderRecord() {
    const lanes = state.mode === 'lanes';
    $('#rec-modes').innerHTML = [['stars', 'CONSTELLATION'], ['lanes', 'BY TYPE']].map(([k, label]) =>
      '<a data-replace href="' + address({ mode: k }) + '"' + ((k === 'lanes') === lanes ? ' aria-current="true"' : '') + '>' + label + '</a>').join('');
    $('#rec-acts').innerHTML = (M ? M.acts : []).map((a, i) =>
      '<li><b>' + (i + 1) + '</b><time datetime="' + esc(a.date) + '">' + fmt(dayOf(a.date)) + '</time><span>' + esc(a.label) + '</span></li>').join('');
    if (atlasError || !A) { $('#rec-error').hidden = !atlasError; $('#rec-error').textContent = atlasError ? 'The record could not be loaded: ' + atlasError : ''; return; }
    buildRecord();
    $('#rec-range').max = A.days;
    // the first entry replays the record from its founding; an address that asks for a point shows it whole
    if (!state.played) {
      state.played = true;
      if (!state.sel && !calm.matches && !mq.mobile.matches) replay(0); else state.t = A.days;
    }
    if (!state.playing) showUntil(state.t);
    focusRecord();
  }

  // ── 4. works ────────────────────────────────────────────────────────────
  function renderWorks() {
    if (!M) return marginMissing('#works-grid');
    $('#works-grid').innerHTML = M.works.map(w =>
      '<li class="work"><a href="' + esc(w.href) + '"><div class="still">' +
      (w.still ? '<img src="' + esc(w.still) + '" alt="" loading="lazy">' : 'still · ' + esc(w.title)) + '</div>' +
      '<div class="meta"><span>' + (w.project ? 'Project ' + w.project : 'Before projects') + '</span><span class="k' + (w.modest ? ' modest' : '') + '">' + (w.modest ? 'Modest work' : 'Work') + '</span></div>' +
      '<h3>' + esc(w.title) + '</h3><p>' + esc(w.line) + '</p><span class="go">Enter the work →</span></a></li>').join('');
  }

  function marginMissing(...targets) {
    for (const t of targets) $(t).innerHTML = '';
    $(targets[targets.length - 1]).innerHTML = '<p class="error">This view’s standing text (surface/margin.json) could not be loaded' + (marginError ? ': ' + esc(marginError) : '') +
      '. The record itself is one door away: <a href="record.html">record.html</a>.</p>';
  }

  function render() {
    renderShell();
    if (state.view === 'how') renderHow();
    else if (state.view === 'projects') renderProjects();
    else if (state.view === 'record') renderRecord();
    else renderWorks();
  }
  function go() { state.hover = null; readAddress(); render(); }

  // ── wiring ──────────────────────────────────────────────────────────────
  document.addEventListener('click', ev => {
    const a = ev.target.closest && ev.target.closest('a[data-replace]');
    if (!a || ev.metaKey || ev.ctrlKey || ev.shiftKey || ev.button) return;
    ev.preventDefault();
    history.replaceState(null, '', a.getAttribute('href'));
    go();
  });
  window.addEventListener('hashchange', () => { const top = state.view; go(); if (state.view !== top) window.scrollTo(0, 0); });
  window.addEventListener('popstate', go);
  const stage = $('#rec-svg');
  stage.addEventListener('pointerover', ev => { const a = ev.target.closest('a.n'); if (a && state.hover !== a.dataset.id) { state.hover = a.dataset.id; focusRecord(); } });
  stage.addEventListener('pointerout', ev => { const a = ev.target.closest('a.n'); if (a && state.hover) { state.hover = null; focusRecord(); } });
  stage.addEventListener('click', ev => {
    if (ev.target.closest('a.n') || !state.sel) return;
    history.pushState(null, '', address({ sel: null })); go();   // a click on the empty map lets go of the point
  });
  $('#rec-range').addEventListener('input', ev => { cancelAnimationFrame(raf); state.playing = false; state.t = Number(ev.target.value); showUntil(state.t); });
  $('#rec-play').addEventListener('click', () => {
    if (!A) return;
    if (state.playing) { state.playing = false; showUntil(state.t); } else replay(state.t >= A.days - 0.01 ? 0 : state.t);
  });
  let resizing = 0;
  window.addEventListener('resize', () => { clearTimeout(resizing); resizing = setTimeout(() => { if (state.view === 'record' && A) { buildRecord(); showUntil(state.t); focusRecord(); } }, 120); });
  for (const m of Object.values(mq)) m.addEventListener('change', () => { R.key = ''; render(); });

  readAddress();
  document.documentElement.classList.add('js');
  const getMargin = fetch('surface/margin.json').then(r => { if (!r.ok) throw new Error('HTTP ' + r.status); return r.json(); })
    .then(m => { M = m; }, e => { marginError = e.message; });
  const getAtlas = loadAtlas().then(a => { A = a; noteVisit(); }, e => { atlasError = e.message; });
  getMargin.then(render);
  Promise.all([getMargin, getAtlas]).then(() => { R.key = ''; render(); });
})();
