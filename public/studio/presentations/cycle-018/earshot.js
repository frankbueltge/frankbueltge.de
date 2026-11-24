// EARSHOT: the 51 signals that eleven public instruments set up, each spoken by an open speech model in the room
// of the receiver it is addressed to. You stand in the street, with the public. What is said in your room you
// hear and read; what is said in another room comes through frosted glass and a wall: a voice without words,
// light and lines without letters. A model does what nobody asked; each text's own clock then runs.
// This work's own code, Apache-2.0.
(() => {
  'use strict';
  const E = window.EARSHOT;
  const SIG = E.signals, ROOMS = E.rooms;
  const byId = Object.fromEntries(SIG.map(s => [s.id, s]));
  const roomById = Object.fromEntries(ROOMS.map(r => [r.id, r]));
  const Q = new URLSearchParams(location.search);

  // ---------- the clock ----------
  // Run time tau, in seconds. [0, PRE): the release; tau = PRE: the deed; (PRE, END]: hours on a clock of powers
  // of ten, from one minute to two years after the deed. Each "at" signal sounds at the hour its own passage
  // names, counted from the moment the deed is known, here the moment it happens: the best case.
  const PRE = 36, RUN = 150, END = PRE + RUN;
  const LA = Math.log10(E.clock.from_h), LB = Math.log10(E.clock.to_h);
  const hToTau = h => PRE + (Math.log10(Math.max(h, E.clock.from_h)) - LA) / (LB - LA) * RUN;
  const tauToH = t => t < PRE ? null : Math.pow(10, LA + Math.min(1, (t - PRE) / RUN) * (LB - LA));
  // As it happened, the days before the deed run on a plain scale (state 4): 0.6 s a day, ending half a second before
  // the deed, so the maker's own alerts stand apart on their days.
  const PRE_DAY = 0.6, preTau = h => PRE - 0.5 + h / 24 * PRE_DAY;
  const preDays = t => Math.max(1, Math.ceil(-(t - PRE + 0.5) / PRE_DAY));
  const MARKS = [[1, 'one hour'], [24, 'one day'], [168, 'one week'], [730, 'one month'], [8760, 'one year'], [17520, 'two years']];

  function fmtH(h) {
    const m = h * 60;
    if (m < 60) { const n = Math.max(1, Math.floor(m)); return n + (n === 1 ? ' minute' : ' minutes'); }
    if (h < 48) { const H = Math.floor(h), M = Math.floor((h - H) * 60); return H + (H === 1 ? ' hour' : ' hours') + (M ? ' ' + M + ' min' : ''); }
    const d = h / 24;
    if (d < 60) { const D = Math.floor(d), H = Math.floor(h - D * 24); return D + ' days' + (H ? ' ' + H + ' h' : ''); }
    const mo = h / 730;
    if (mo < 24) { const M = Math.floor(mo), D = Math.floor((h - M * 730) / 24); return M + (M === 1 ? ' month' : ' months') + (D ? ' ' + D + ' days' : ''); }
    return 'two years';
  }

  // ---------- events ----------
  // Three runs of the same building. On paper (state 1): each text's own clock, in the best case, the reporter
  // learning at the deed. As it happened (state 2): one of the two cases the Field dated (study 91), on the same
  // clock, from its deed to today, where the record stops. In a case the texts not yet in force are silent, the
  // street says only what has left a public trace, and what a deed sets off is what the record shows, on its day.
  const CASES = Object.fromEntries((E.cases || []).map(c => [c.id, c]));
  const DAY0 = id => new Date(CASES[id].began + 'T12:00:00Z').getTime();
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const fmtDate = ms => { const d = new Date(ms); return d.getUTCDate() + ' ' + MONTHS[d.getUTCMonth()] + ' ' + d.getUTCFullYear(); };
  const dateAtH = (id, h) => fmtDate(DAY0(id) + h * 3600e3);
  let STREET_LOOP = [];
  let events = [];
  let REC_END = END;
  function buildEvents(mode) {
    const rec = mode !== 'paper', c = CASES[mode];
    const live = s => !rec || s.due === 'due';
    const ev = [];
    STREET_LOOP = SIG.filter(s => s.room === 'street' && s.when.phase !== 'none' && live(s) && (!rec || s.moved !== 'no trace found')).map(s => s.id);
    SIG.filter(s => s.when.phase === 'before' && s.room !== 'street' && live(s)).sort((a, b) => a.when.order - b.when.order)
      .forEach((s, i) => ev.push({ tau: 2.5 + i * 2.6, kind: 'voice', id: s.id }));
    ev.push({ tau: PRE, kind: 'deed' });
    SIG.filter(s => s.when.phase === 'deed').sort((a, b) => a.when.order - b.when.order)
      .forEach((s, i) => ev.push({ tau: PRE + 1.2 + i * 3.4, kind: 'voice', id: s.id, log: true }));
    SIG.filter(s => s.retention_end_h).forEach(s => ev.push({ tau: hToTau(s.retention_end_h), kind: 'retain', id: s.id, h: s.retention_end_h }));
    MARKS.forEach(([h, label]) => ev.push({ tau: hToTau(h), kind: 'mark', h, label }));
    if (!rec) {
      SIG.filter(s => s.when.phase === 'at').forEach(s => ev.push({ tau: hToTau(s.when.h), kind: 'voice', id: s.id, h: s.when.h }));
      SIG.filter(s => s.when.phase === 'every').forEach(s => {
        for (let k = 1; k * s.when.h <= E.clock.to_h; k++) ev.push({ tau: hToTau(k * s.when.h), kind: 'voice', id: s.id, h: k * s.when.h, again: k > 1 });
      });
      ev.push({ tau: hToTau(E.clock.murmur_h), kind: 'murmur', h: E.clock.murmur_h });
      ev.push({ tau: END, kind: 'end' });
      REC_END = END;
    } else {
      // the case's own events, on the day the record gives them
      c.events.forEach((e, i) => {
        if (e.kind === 'deed') return;                       // the deed is the clock's zero
        const tau = e.h < 0 ? preTau(e.h) + i * 0.001 : hToTau(e.h);
        ev.push({ tau, kind: 'case', ce: e, h: e.h });
      });
      // the hours the paper names, counted from the first day the maker's own record says it knew
      if (c.paper_from_h !== null) E.paper_hours.forEach(ph => ev.push({ tau: hToTau(c.paper_from_h + ph), kind: 'paper', h: c.paper_from_h + ph, ph }));
      else {
        const fp = c.events.find(e => e.key === 'first_public');
        ev.push({ tau: hToTau(fp.h) + 0.02, kind: 'case', h: fp.h, ce: { kind: 'silent', place: 'street', key: 'knew_undated', date: fp.date, h: fp.h, public: true,
          label: 'the maker', sub: 'had learned of it weeks before, Reuters reported; the day is not on record', src: c.maker_knew.src[0] } });
      }
      REC_END = hToTau(c.today_h);
      ev.push({ tau: REC_END, kind: 'today', h: c.today_h });
    }
    return ev.filter(e => !rec || e.tau <= REC_END + 1e-9).sort((a, b) => a.tau - b.tau);
  }
  events = buildEvents('paper');

  // ---------- state ----------
  const st = {
    started: false, sound: false, paused: false, tau: 0, now: 0, last: 0, listener: 'street', cam: null, camTo: null,
    eye: null, eyeTo: null, voices: [], lit: {}, flash: {}, ended: false, markText: '', markAt: -99, fired: new Set(),
    loopNext: 0, loopIdx: 0, deedAt: -1, retained: {}, layout: null,
    mode: 'paper', queue: [], telling: null, deedOn: false, notes: [], walk: null, visitor: {}, alarm: 0, pulseAt: 0,
    cold: {}, woken: {}, spreads: [], shut: {}, ear: false,
  };
  const EH = window.EARSHOT_HEARD || null;
  const CASEV = Object.fromEntries((E.cases || []).flatMap(c => c.events.filter(e => e.vid).map(e => [e.vid, e])));
  // State 3: in a case the doors stay shut until the record reaches today; you are the public.
  const locked = () => st.mode !== 'paper' && !st.ended;
  window.__earshot = st;

  // ---------- the building ----------
  const canvas = document.getElementById('c');
  const stage = document.getElementById('stage');
  const ctx = canvas.getContext('2d');
  let DPR = 1, VW = 0, VH = 0;
  const DEPTH = 230, F = 1250;     // how deep a room runs behind its front, and the eye's distance

  const WIDE = [['maker', 0, 0, 2], ['others', 2, 0, 2], ['eu', 0, 1, 1], ['oes', 1, 1, 1], ['ag', 2, 1, 1], ['dfs', 3, 1, 1],
    ['kr', 0, 2, 1], ['bis', 1, 2, 1], ['authority', 2, 2, 1], ['gov', 3, 2, 1]];
  const TALL = [['maker', 0, 0, 1], ['others', 1, 0, 1], ['eu', 0, 1, 1], ['oes', 1, 1, 1], ['ag', 0, 2, 1], ['dfs', 1, 2, 1],
    ['kr', 0, 3, 1], ['bis', 1, 3, 1], ['authority', 0, 4, 1], ['gov', 1, 4, 1]];

  function buildLayout() {
    const tall = VW / VH < 0.85;
    const cols = tall ? 2 : 4, rows = tall ? 5 : 3, plan = tall ? TALL : WIDE;
    const CW = tall ? 380 : 400, FH = tall ? 250 : 206, WALL = 18, X0 = 80, Y0 = 60;
    const rooms = {};
    plan.forEach(([id, c, r, span]) => {
      rooms[id] = { id, x: X0 + c * CW + WALL / 2, y: Y0 + r * FH + WALL / 2, w: span * CW - WALL, h: FH - WALL, col: c, row: r, span };
    });
    const bw = cols * CW, bh = rows * FH;
    const gy = Y0 + bh;                                  // ground line
    const sh = tall ? 540 : 300;
    rooms.street = { id: 'street', x: X0 - 70, y: gy + 6, w: bw + 140, h: sh, street: true };
    return { tall, cols, rows, CW, FH, WALL, X0, Y0, bw, bh, gy, rooms, W: X0 * 2 + bw, H: gy + sh + 20 };
  }

  const TOPM = () => VW < 600 ? 92 : 66, BOTM = () => 86;
  function camFor(roomId) {
    const L = st.layout, top = TOPM(), bot = BOTM();
    if (roomId === 'street') {
      const s = Math.min((VW - 16) / L.W, (VH - top - bot) / L.H);
      return { s, cx: L.W / 2, cy: L.H / 2 - (top - bot) / 2 / s };
    }
    const r = L.rooms[roomId];
    const s = Math.min((VW - 16) * (L.tall ? 0.92 : 0.56) / r.w, (VH - top - bot) * 0.62 / r.h, 2.4);
    return { s, cx: r.x + r.w / 2, cy: r.y + r.h / 2 - (top - bot) / 2 / s };
  }
  function eyeFor(roomId) {
    const L = st.layout, r = L.rooms[roomId];
    if (roomId === 'street') return { x: L.W / 2, y: L.gy + 150 };
    return { x: r.x + r.w / 2, y: r.y + r.h * 0.55 };
  }

  function resize() {
    DPR = Math.min(2, window.devicePixelRatio || 1);
    VW = stage.clientWidth; VH = stage.clientHeight;
    canvas.width = Math.round(VW * DPR); canvas.height = Math.round(VH * DPR);
    canvas.style.width = VW + 'px'; canvas.style.height = VH + 'px';
    st.layout = buildLayout();
    st.camTo = camFor(st.listener); st.cam = { ...st.camTo };
    st.eyeTo = eyeFor(st.listener); st.eye = { ...st.eyeTo };
    for (const v of st.voices) v.lay = null;
    placePanners();
  }

  // ---------- audio ----------
  let AC = null, master = null, nearVerb = null, wallVerb = null;
  const buffers = {}; let tickers = {}, pulse = null;

  function impulse(seconds, decay, bright) {
    const n = Math.round(AC.sampleRate * seconds), b = AC.createBuffer(2, n, AC.sampleRate);
    for (let c = 0; c < 2; c++) {
      const d = b.getChannelData(c); let lp = 0;
      for (let i = 0; i < n; i++) { const x = (Math.random() * 2 - 1) * Math.pow(1 - i / n, decay); lp += (x - lp) * bright; d[i] = lp; }
    }
    return b;
  }

  function graph() {
    master = AC.createGain(); master.gain.value = 0.9;
    const comp = AC.createDynamicsCompressor(); comp.threshold.value = -16; comp.ratio.value = 3;
    master.connect(comp).connect(AC.destination);
    nearVerb = AC.createConvolver(); nearVerb.buffer = impulse(0.8, 3.2, 0.5);
    wallVerb = AC.createConvolver(); wallVerb.buffer = impulse(1.7, 2.4, 0.16);
    const nv = AC.createGain(); nv.gain.value = 0.22; nearVerb.connect(nv).connect(master);
    const wv = AC.createGain(); wv.gain.value = 0.55; wallVerb.connect(wv).connect(master);
    // the street's air: a soft, low noise, always
    const n = AC.createBuffer(1, AC.sampleRate * 4, AC.sampleRate), d = n.getChannelData(0);
    let b0 = 0, b1 = 0; for (let i = 0; i < d.length; i++) { const w = Math.random() * 2 - 1; b0 = 0.995 * b0 + w * 0.03; b1 = 0.9 * b1 + w * 0.1; d[i] = (b0 + b1) * 0.5; }
    const air = AC.createBufferSource(); air.buffer = n; air.loop = true;
    const af = AC.createBiquadFilter(); af.type = 'lowpass'; af.frequency.value = 900;
    const ag = AC.createGain(); ag.gain.value = 0.05;
    air.connect(af).connect(ag).connect(master); air.start();
  }
  function startAudio() {
    AC = new (window.AudioContext || window.webkitAudioContext)();
    graph();
    const caseIds = (E.cases || []).flatMap(c => c.events.filter(e => e.vid).map(e => e.vid));
    return Promise.all(SIG.map(s => s.id).concat(caseIds).map(id => fetch('audio/' + id + '.mp3').then(r => r.arrayBuffer()).then(a => AC.decodeAudioData(a))
      .then(buf => { buffers[id] = buf; }).catch(() => {})));
  }

  // one place in space per room; the listener stands in the middle of their room. A voice heard in the street may
  // come from where its speaker stands (a spokesperson at the Commission's door): it is gated as the street's and
  // placed at that room.
  function roomPos(id, slot) {
    const L = st.layout, r = L.rooms[id], me = L.rooms[st.listener], k = 1 / 160;
    const dx = id === st.listener ? (slot - 0.5) * 2.4 : 0;
    return { x: (r.x + r.w / 2 - (me.x + me.w / 2)) * k + dx, y: ((me.y + me.h / 2) - (r.y + r.h / 2)) * k, z: -1.2 };
  }
  function setPan(p, room, slot) {
    const q = roomPos(room, slot), T = AC.currentTime;
    p.positionX.setTargetAtTime(q.x, T, 0.3); p.positionY.setTargetAtTime(q.y, T, 0.3); p.positionZ.setTargetAtTime(q.z, T, 0.3);
  }
  function placePanners() {
    if (!AC) return;
    for (const v of st.voices) if (v.chain) setPan(v.chain.pan, v.panRoom || v.room, v.slot);
    if (pulse) setPan(pulse.c.pan, 'maker', 0.5);
    for (const t of Object.values(tickers)) setPan(t.c.pan, 'maker', 0.5);
  }
  // Every sound in a room runs through two paths: one heard inside the room, one through its wall (two low-pass
  // filters at 340 Hz, which keep the rhythm and the pitch of a voice and take its consonants). Where the
  // listener stands opens one and closes the other.
  function chain(room, slot, murmur, panRoom) {
    const inG = AC.createGain(), near = AC.createGain(), wall = AC.createGain();
    const hp = AC.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 90;
    const lp1 = AC.createBiquadFilter(); lp1.type = 'lowpass'; lp1.frequency.value = 340; lp1.Q.value = 0.6;
    const lp2 = AC.createBiquadFilter(); lp2.type = 'lowpass'; lp2.frequency.value = 340; lp2.Q.value = 0.6;
    const pan = AC.createPanner(); pan.panningModel = 'HRTF'; pan.distanceModel = 'inverse'; pan.refDistance = 1.4; pan.rolloffFactor = 0.7;
    inG.connect(hp).connect(near).connect(pan);
    inG.connect(lp1).connect(lp2).connect(wall).connect(pan);
    near.connect(nearVerb); wall.connect(wallVerb); pan.connect(master);
    const c = { inG, near, wall, pan, room, slot, murmur: !!murmur };
    setPan(pan, panRoom || room, slot); setOpen(c, true);
    return c;
  }
  function setOpen(c, now) {
    const inside = c.room === st.listener;
    const T = AC.currentTime, k = now ? 0.001 : 0.35;
    c.near.gain.setTargetAtTime(inside ? 1 : 0, T, k);
    c.wall.gain.setTargetAtTime(inside ? 0 : 0.8, T, k);
  }

  // For the check (state 3): one voice rendered offline through the page's own graph, the same chain, reverbs,
  // compressor and street air, with the listener in its room or on the other side of the wall. Mono 16-bit WAV.
  async function renderOffline(id, listener) {
    const item = byId[id] || CASEV[id], room = byId[id] ? byId[id].room : item.place;
    const ab = await (await fetch('audio/' + id + '.mp3')).arrayBuffer();
    const sr = 24000, buf = await new OfflineAudioContext(1, sr, sr).decodeAudioData(ab);
    const saved = { AC, master, nearVerb, wallVerb, listener: st.listener };
    AC = new OfflineAudioContext(2, Math.ceil((buf.duration + 2.4) * sr), sr);
    graph(); st.listener = listener;
    const c = chain(room, 0.5), q = roomPos(room, 0.5);
    c.pan.positionX.value = q.x; c.pan.positionY.value = q.y; c.pan.positionZ.value = q.z;
    const src = AC.createBufferSource(); src.buffer = buf; src.connect(c.inG); src.start(0.1);
    const out = await AC.startRendering();
    ({ AC, master, nearVerb, wallVerb } = saved); st.listener = saved.listener;
    const L = out.getChannelData(0), R = out.getChannelData(1), n = L.length, wav = new DataView(new ArrayBuffer(44 + n * 2));
    const w4 = (o, t) => { for (let i = 0; i < 4; i++) wav.setUint8(o + i, t.charCodeAt(i)); };
    w4(0, 'RIFF'); wav.setUint32(4, 36 + n * 2, true); w4(8, 'WAVE'); w4(12, 'fmt '); wav.setUint32(16, 16, true);
    wav.setUint16(20, 1, true); wav.setUint16(22, 1, true); wav.setUint32(24, sr, true); wav.setUint32(28, sr * 2, true);
    wav.setUint16(32, 2, true); wav.setUint16(34, 16, true); w4(36, 'data'); wav.setUint32(40, n * 2, true);
    for (let i = 0; i < n; i++) wav.setInt16(44 + i * 2, Math.max(-1, Math.min(1, (L[i] + R[i]) / 2)) * 32767, true);
    let bin = ''; const u = new Uint8Array(wav.buffer); for (let i = 0; i < u.length; i += 8192) bin += String.fromCharCode.apply(null, u.subarray(i, i + 8192));
    return btoa(bin);
  }

  function tickBuffer(len, pitch) {
    const n = Math.round(AC.sampleRate * len), b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0);
    for (const f of [0, 0.37, 0.52]) { const c0 = Math.round(f * n); for (let i = 0; i < 900 && c0 + i < n; i++) d[c0 + i] = Math.sin(i / AC.sampleRate * pitch * 2 * Math.PI) * Math.exp(-i / 120) * 0.5; }
    return b;
  }
  function startTickers() {
    if (!AC || Object.keys(tickers).length) return;
    SIG.filter(s => s.when.phase === 'deed').forEach((s, i) => {
      const src = AC.createBufferSource(); src.buffer = tickBuffer(1.6 + i * 0.37, 1800 + i * 420); src.loop = true;
      const c = chain('maker', 0.5), g = AC.createGain(); g.gain.value = st.retained[s.id] !== undefined ? 0 : 0.16;
      src.connect(g).connect(c.inG); src.start();
      tickers[s.id] = { src, g, c };
    });
  }
  function stopTicker(id) { const t = tickers[id]; if (t) t.g.gain.setTargetAtTime(0, AC.currentTime, 0.6); }
  function stopAllTickers() { for (const t of Object.values(tickers)) { try { t.src.stop(); } catch (e) {} } tickers = {}; }

  function deedSound() {
    if (!AC) return;
    const len = AC.sampleRate * 2.4, b = AC.createBuffer(1, len, AC.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) { const t = i / AC.sampleRate; d[i] = Math.sin(2 * Math.PI * 52 * t) * Math.exp(-t * 2.2) * 0.9 + (t < 0.05 ? (Math.random() * 2 - 1) * (1 - t / 0.05) * 0.6 : 0); }
    const src = AC.createBufferSource(); src.buffer = b;
    const c = chain('maker', 0.5), g = AC.createGain(); g.gain.value = 1.6;
    src.connect(g).connect(c.inG); src.start();
  }
  // As it happened, the deed is not a moment but a stretch: the agents act for days or weeks. While they act, a low
  // beat in the maker's room, which from the street is only a pressure through the wall.
  function startPulse() {
    if (!AC || pulse) return;
    const n = Math.round(AC.sampleRate * 1.9), b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0);
    for (const at of [0, 0.32]) { const i0 = Math.round(at * AC.sampleRate); for (let i = 0; i < AC.sampleRate * 0.5 && i0 + i < n; i++) { const t = i / AC.sampleRate; d[i0 + i] += Math.sin(2 * Math.PI * (46 - t * 30) * t) * Math.exp(-t * 9) * (at ? 0.55 : 0.9); } }
    const src = AC.createBufferSource(); src.buffer = b; src.loop = true;
    const c = chain('maker', 0.5), g = AC.createGain(); g.gain.value = 1.1;
    src.connect(g).connect(c.inG); src.start();
    pulse = { src, g, c };
  }
  function stopPulse() { if (pulse) { const p = pulse; pulse = null; p.g.gain.setTargetAtTime(0, AC.currentTime, 0.8); setTimeout(() => { try { p.src.stop(); } catch (e) {} }, 4000); } }
  // a monitor's alarm in the maker's room: three short high tones, heard inside, a dull tick through the wall
  function alarm() {
    if (!AC) return;
    const c = chain('maker', 0.3), T = AC.currentTime;
    for (let k = 0; k < 3; k++) { const o = AC.createOscillator(), g = AC.createGain(); o.type = 'square'; o.frequency.value = 1320;
      g.gain.setValueAtTime(0, T + k * 0.32); g.gain.linearRampToValueAtTime(0.06, T + k * 0.32 + 0.01); g.gain.setTargetAtTime(0, T + k * 0.32 + 0.14, 0.02);
      o.connect(g).connect(c.inG); o.start(T + k * 0.32); o.stop(T + k * 0.32 + 0.3); }
  }
  // a soft sweep of noise in the street: something is noticed there, and not said
  function sweep() {
    if (!AC) return;
    const n = Math.round(AC.sampleRate * 1.4), b = AC.createBuffer(1, n, AC.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < n; i++) { const t = i / n; d[i] = (Math.random() * 2 - 1) * Math.sin(Math.PI * t) * 0.25; }
    const src = AC.createBufferSource(); src.buffer = b;
    const f = AC.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2400; f.Q.value = 0.7;
    const c = chain('street', 0.2); src.connect(f).connect(c.inG); src.start();
  }
  function bell(freq) {
    if (!AC) return;
    const o = AC.createOscillator(), g = AC.createGain(), T = AC.currentTime; o.frequency.value = freq;
    g.gain.setValueAtTime(0, T); g.gain.linearRampToValueAtTime(0.05, T + 0.02); g.gain.exponentialRampToValueAtTime(0.0001, T + 2.2);
    o.connect(g); g.connect(master); g.connect(nearVerb); o.start(); o.stop(T + 2.3);
  }

  // ---------- voices ----------
  // One passage spoken in one room. Its words appear as they are spoken: sharp from inside the room, through the
  // glass only as lines of light.
  // The deed's cold light. On paper it goes from the maker's room straight to the room a report is owed to, as the
  // texts imagine; as it happened it comes up from the street, where the deed was first told.
  function wake(room, from, delay) { if (room === 'street' || st.woken[room] && st.cold[room] > 0.6) return; st.spreads.push({ to: room, from, t0: st.now + (delay || 0) }); }
  function speak(id, opts = {}) {
    const s = opts.item || byId[id], room = opts.room || s.room;
    if (!opts.item && s.when && (s.when.phase === 'at' || s.when.phase === 'deed') && !opts.murmur && room !== 'maker') wake(room, 'maker', (opts.off || 0) - 1.4);
    const v = { id, s, room, t0: st.now + (opts.off || 0), dur: s.dur, slot: opts.slot ?? slotFor(room), again: !!opts.again,
      murmur: !!opts.murmur, rate: opts.rate || 1, gain: opts.gain ?? 1, lay: null, caseV: !!opts.item, panRoom: opts.panRoom || null };
    if (v.again) v.dur = Math.min(s.dur, 3.2);
    st.voices.push(v);
    if (AC && buffers[id] && !st.paused) {
      const src = AC.createBufferSource(); src.buffer = buffers[id]; src.playbackRate.value = v.rate;
      const c = chain(room, v.slot, v.murmur, v.panRoom), g = AC.createGain(), T = AC.currentTime + (opts.off || 0);
      g.gain.setValueAtTime(0, T); g.gain.linearRampToValueAtTime(v.gain * (v.again ? 0.5 : 1), T + 0.06);
      if (v.again) g.gain.setTargetAtTime(0, T + 2.6, 0.2);
      src.connect(g).connect(c.inG); src.start(T, 0, v.again ? 3.4 : undefined);
      v.src = src; v.chain = c;
      src.onended = () => { setTimeout(() => { try { c.pan.disconnect(); } catch (e) {} }, 2500); };
    }
    return v;
  }
  const SEEN = v => st.now - v.t0 < v.dur / v.rate + 5.2;  // how long a voice's words stay on the wall
  function slotFor(room) {
    if (room === 'street') {
      const busy = st.voices.filter(v => v.room === 'street' && !v.murmur && !v.caseV && SEEN(v)).map(v => v.slot);
      return busy.includes(0.25) ? 0.75 : 0.25;
    }
    const busy = st.voices.filter(v => v.room === room && !v.murmur && st.now - v.t0 < v.dur + 2).map(v => v.slot);
    for (const s of [0.25, 0.75, 0.5, 0, 1]) if (!busy.includes(s)) return s;
    return Math.random();
  }
  // The yearly reports publish only figures across all reports. The work sounds that once, in the street, as the
  // passages they gather said over each other: many reports, none of them to be made out.
  function murmur() {
    E.clock.murmur.forEach((id, i) => [0, 1, 2].forEach(k =>
      speak(id, { room: 'street', murmur: true, slot: (i * 3 + k) / 14, off: k * 0.7 + i * 0.25, rate: [1, 0.96, 1.04][k], gain: 0.5 })));
  }

  // ---------- the run ----------
  const PH_WORD = { 24: '24 hours', 72: '72 hours', 120: 'five days', 360: '15 days' };
  const host = u => { try { return new URL(u).hostname.replace(/^www\./, ''); } catch (e) { return ''; } };
  function mark(text, dur) { st.markText = text; st.markAt = st.now; st.markDur = dur || 3.2; }
  function fire(ev) {
    const rec = st.mode !== 'paper', c = CASES[st.mode];
    switch (ev.kind) {
      case 'voice': speak(ev.id, { again: ev.again }); break;
      case 'deed':
        st.deedAt = st.tau; st.flash.maker = 1; st.cold.maker = 1; st.woken.maker = true; deedSound(); startTickers();
        if (rec) { const b = c.events.find(e => e.key === 'began'); st.deedOn = true; startPulse(); mark(fmtDate(DAY0(st.mode)) + ' · ' + b.label + ' ' + b.sub, 6); }
        break;
      case 'murmur': murmur(); break;
      case 'retain': st.retained[ev.id] = st.tau; stopTicker(ev.id); break;
      case 'mark': if (!st.telling) mark(ev.label + ' after the deed'); bell(ev.h >= 8760 ? 660 : 990); break;
      case 'paper': mark(PH_WORD[ev.ph] + ' after the maker knew · an hour the paper names · owed to an office, not to the street', 4.5); bell(1480); break;
      case 'case': {
        const e = ev.ce;
        if (e.kind === 'voice') st.queue.push(e);
        else if (e.kind === 'deed_end') { st.deedOn = false; stopPulse(); mark(dateAtH(st.mode, e.h) + ' · ' + e.label + (e.sub ? ' ' + e.sub : ''), 5); }
        else if (e.kind === 'silent') { st.notes.push({ e, t0: st.now }); sweep(); }
        else if (e.kind === 'caption') mark(dateAtH(st.mode, e.h) + ' · ' + e.label + ', ' + e.sub + ' · not public', 5);
        break;
      }
      case 'today':
        st.ended = true; st.deedOn = false; stopPulse();
        mark(fmtDate(DAY0(st.mode) + ev.h * 3600e3) + ' · today: the record runs to here, and the doors open', 1e9);
        document.getElementById('again').hidden = false; offerNext(); break;
      case 'end': st.ended = true; document.getElementById('again').hidden = false; offerNext(); break;
    }
  }
  // As it happened, each voice of the record is heard whole, in order: while one speaks, the clock all but stops
  // and the street falls quiet to listen.
  function tell(e) {
    let off = 0, until = 0;
    for (const v of st.voices) if (v.room === 'street' && !v.caseV && !v.murmur) { try { v.src && v.src.stop(); } catch (x) {} v.t0 = -1e9; }
    if (e.walk) { st.walk = { t0: st.now, room: e.place }; off = 3.0; }
    if (e.alarm) { alarm(); st.alarm = 1; }
    if (e.place !== 'street') wake(e.place, e.walk ? null : (e.place === 'maker' ? null : 'street'), off - 1);
    if (e.wake) {
      wake(e.wake.room, e.walk ? null : 'street', off - 1.6);
      const w = byId[e.wake.signal];
      speak(w.id, { room: e.wake.room, off });
      if (e.walk) { off += w.dur + 0.3; until = off; } else { off += 1.2; until = off - 1.2 + w.dur; }
    }
    speak(e.vid, { item: e, room: e.place, panRoom: e.pan, slot: 0.5, off });
    until = Math.max(until, off + e.dur);
    if (e.echo) { speak(e.vid, { item: e, room: e.echo, slot: 0.5, off: off + 0.5, gain: 0.85 }); until = Math.max(until, off + 0.5 + e.dur); }
    st.telling = { e, until: st.now + until + 1.0 };
  }
  function story() {
    if (st.telling && st.now > st.telling.until) st.telling = null;
    if (!st.telling && st.queue.length) tell(st.queue.shift());
  }
  function streetLoop() {
    // what is published is said in the street again and again, before the deed and after it
    if (st.telling || st.queue.length) return;
    const shown = st.voices.filter(v => v.room === 'street' && !v.murmur && !v.caseV && SEEN(v)).length;
    if (STREET_LOOP.length && st.now >= st.loopNext && shown < 2) {
      const id = STREET_LOOP[st.loopIdx % STREET_LOOP.length]; st.loopIdx++;
      speak(id, { gain: 0.85 });
      st.loopNext = st.now + 3.5 + (st.loopIdx % 3) * 1.7;
    }
  }
  function seek(tau) {
    const rec = st.mode !== 'paper';
    st.tau = Math.max(0, Math.min(rec ? REC_END : END, tau));
    st.fired = new Set(events.filter(e => e.tau < st.tau - 0.05));
    for (const v of st.voices) { try { v.src && v.src.stop(); } catch (e) {} }
    st.voices = []; st.queue = []; st.telling = null; st.notes = []; st.walk = null; st.visitor = {}; st.alarm = 0;
    st.cold = {}; st.woken = {}; st.spreads = []; st.shut = {};
    const woke = r => { if (r && r !== 'street') { st.woken[r] = true; st.cold[r] = 0.45; } };
    if (st.tau >= PRE) woke('maker');
    for (const e of events) if (e.tau < st.tau - 0.05) {
      if (e.kind === 'voice' && byId[e.id] && ['at', 'deed'].includes(byId[e.id].when.phase)) woke(byId[e.id].room);
      if (e.kind === 'case' && e.ce.kind === 'voice') { woke(e.ce.place); if (e.ce.wake) woke(e.ce.wake.room); }
    }
    st.ended = st.tau >= (rec ? REC_END : END); document.getElementById('again').hidden = !st.ended;
    if (!st.ended) { st.markAt = -99; hideNext(); }
    st.retained = {};
    for (const e of events) if (e.kind === 'retain' && e.tau < st.tau) st.retained[e.id] = e.tau;
    if (st.tau >= PRE) { st.deedAt = PRE; startTickers(); for (const id of Object.keys(st.retained)) stopTicker(id); }
    else { st.deedAt = -1; stopAllTickers(); }
    // what the record has already done by this hour stays done: the deed still going on, a visitor already inside
    st.deedOn = false;
    if (rec) {
      const evs = CASES[st.mode].events, end = evs.find(e => e.kind === 'deed_end');
      st.deedOn = st.tau >= PRE && !st.ended && (!end || st.tau < hToTau(end.h));
      for (const e of evs) if (e.walk && hToTau(e.h) < st.tau - 0.05) st.visitor[e.place] = true;
    }
    if (st.deedOn) startPulse(); else stopPulse();
    st.loopNext = st.now + 0.4;
  }
  function setMode(m, fromRelease) {
    if (!(m === 'paper' || CASES[m])) return;
    st.mode = m; events = buildEvents(m);
    stopPulse(); stopAllTickers();
    seek(fromRelease ? 0 : PRE - 10);
    ticksOnBar(); modeButtons();
  }

  // ---------- drawing ----------
  const FONT = '"Helvetica Neue", Helvetica, Arial, system-ui, sans-serif';
  const pool = new Map();
  function offscreen(key, w, h) {
    let c = pool.get(key);
    if (!c || c.width !== w || c.height !== h) { c = document.createElement('canvas'); c.width = w; c.height = h; pool.set(key, c); }
    return c;
  }
  // a point of a room, z metres behind its front, seen from the eye
  function P(x, y, z) { const k = F / (F + z), e = st.eye; return [e.x + (x - e.x) * k, e.y + (y - e.y) * k]; }
  function quad(g, a, b, c, d, fill) { g.beginPath(); g.moveTo(a[0], a[1]); g.lineTo(b[0], b[1]); g.lineTo(c[0], c[1]); g.lineTo(d[0], d[1]); g.closePath(); g.fillStyle = fill; g.fill(); }

  function draw() {
    const L = st.layout, cam = st.cam;
    ctx.setTransform(DPR, 0, 0, DPR, 0, 0);
    const sky = ctx.createLinearGradient(0, 0, 0, VH);
    sky.addColorStop(0, '#070b18'); sky.addColorStop(0.6, '#10172a'); sky.addColorStop(1, '#1a2133');
    ctx.fillStyle = sky; ctx.fillRect(0, 0, VW, VH);
    ctx.setTransform(DPR * cam.s, 0, 0, DPR * cam.s, DPR * (VW / 2 - cam.cx * cam.s), DPR * (VH / 2 - cam.cy * cam.s));
    // the building's mass, its slabs and walls in concrete
    ctx.fillStyle = '#2b2c30'; ctx.fillRect(L.X0 - 14, L.Y0 - 22, L.bw + 28, L.bh + 22);
    ctx.fillStyle = '#34353a'; ctx.fillRect(L.X0 - 20, L.Y0 - 30, L.bw + 40, 12);
    drawStreet(false);
    for (const id of Object.keys(L.rooms)) if (id !== 'street') drawRoom(id);
    drawStreet(true);
    drawSpreads();
  }
  // the deed's cold light on its way to a room that wakes because of it
  function drawSpreads() {
    const L = st.layout;
    for (const sp of st.spreads) {
      const el = st.now - sp.t0; if (el < 0) continue;
      const r = L.rooms[sp.to], to = [r.x + r.w / 2, r.y + r.h / 2];
      const from = sp.from === 'street' ? [to[0], L.gy + 120] : sp.from === 'maker' ? [L.rooms.maker.x + L.rooms.maker.w / 2, L.rooms.maker.y + L.rooms.maker.h / 2] : to;
      const a = Math.min(1, el / 2.2), e = a * a * (3 - 2 * a), x = from[0] + (to[0] - from[0]) * e, y = from[1] + (to[1] - from[1]) * e;
      const gl = ctx.createRadialGradient(x, y, 2, x, y, 120);
      gl.addColorStop(0, 'rgba(170,205,255,' + (0.55 * (1 - 0.4 * a)) + ')'); gl.addColorStop(1, 'rgba(170,205,255,0)');
      ctx.fillStyle = gl; ctx.fillRect(x - 120, y - 120, 240, 240);
    }
  }
  // what a machine at the wall heard (state 3): the page's own sound rendered and given to an open recogniser.
  // State 4, on the Atelier's reading: through the wall a sentence in which no word that carries content stands in the
  // passage is the recogniser's own, and all of it is drawn red, its small words too: they match by chance.
  const SMALL = new Set(('a an the to of in on at by for from with as and or but so if then than that this these those it its ' +
    'is are was were be been am do does did can could will would shall should may might must i i\'ll i\'m we we\'ll you he she they ' +
    'me us him her them my our your their not no yes all some there here what which who how').split(' '));
  const key = w => w.toLowerCase().replace(/[^a-z0-9']/g, '');
  function invented(words, ref) {
    const out = [], cur = [];
    const close = () => { const own = !cur.some(i => !SMALL.has(key(words[i][0])) && ref.has(key(words[i][0]).replace(/'/g, ''))); cur.forEach(i => { out[i] = own; }); cur.length = 0; };
    words.forEach(([w], i) => { cur.push(i); if (/[.?!]$/.test(w)) close(); });
    if (cur.length) close();
    return out;
  }
  function earWords(g, v, r, side, top, size, color) {
    const h = EH && EH.rows[v.id] && EH.rows[v.id][side]; if (!h) return;
    const el = (st.now - v.t0) * v.rate; if (el < 0) return;
    const ref = new Set((v.s.show || v.s.quote).split(/\s+/).map(w => w.toLowerCase().replace(/[^a-z0-9]/g, '')));
    const own = side === 'wall' ? invented(h, ref) : [];
    g.font = size + 'px ui-monospace, Menlo, monospace'; g.textBaseline = 'top';
    const sp = g.measureText(' ').width, maxW = r.w - 44; let x = 0, line = 0;
    const lines = Math.max(1, Math.floor((r.y + r.h - 10 - top) / (size * 1.3)));
    const fade = el > v.dur + 3.5 ? Math.max(0, 1 - (el - v.dur - 3.5) / 1.6) : 1;
    const out = [];
    h.forEach(([w, a], i) => { const ww = g.measureText(w).width; if (x > 0 && x + ww > maxW) { x = 0; line++; } out.push([w, a, x, line, i]); x += ww + sp; });
    const sc = Math.max(0, line + 1 - lines);
    for (const [w, a, wx, ln, i] of out) {
      if (a - 0.1 > el || ln < sc) continue;
      const miss = own[i] || !ref.has(w.toLowerCase().replace(/[^a-z0-9]/g, ''));
      g.globalAlpha = fade * Math.min(1, (el - a + 0.1) / 0.2); g.fillStyle = miss ? '#ff9d8a' : color;
      g.fillText(w, r.x + 22 + wx, top + (ln - sc) * size * 1.3);
    }
    g.globalAlpha = 1;
  }

  // the inside of a room, in world coordinates, into g
  function interior(g, id, r, inside) {
    const lit = st.lit[id] || 0, fl = st.flash[id] || 0;
    const x0 = r.x, x1 = r.x + r.w, y0 = r.y, y1 = r.y + r.h;
    const B = [P(x0, y0, DEPTH), P(x1, y0, DEPTH), P(x1, y1, DEPTH), P(x0, y1, DEPTH)];
    const base = id === 'maker' ? [20, 26, 38] : [24, 24, 30];
    // a room that has heard of the deed: its light turns from lamp-warm to the deed's cold
    const cd = Math.min(1, (st.cold[id] || 0) * 1.6), lt = Math.max(lit, (st.cold[id] || 0) * 0.85);
    const tgt = [255 + (150 - 255) * cd, 190 + (196 - 190) * cd, 120 + (255 - 120) * cd];
    const warm = (a, k) => { a = Math.max(a, lt); return 'rgba(' + Math.round(base[0] + (tgt[0] - base[0]) * a * k) + ',' + Math.round(base[1] + (tgt[1] - base[1]) * a * k) + ',' + Math.round(base[2] + (tgt[2] - base[2]) * a * k) + ',1)'; };
    // ceiling, floor, side walls, back wall
    quad(g, [x0, y0], [x1, y0], B[1], B[0], warm(lit, 0.16));
    quad(g, [x0, y1], [x1, y1], B[2], B[3], warm(lit, 0.32));
    quad(g, [x0, y0], B[0], B[3], [x0, y1], warm(lit, 0.22));
    quad(g, [x1, y0], B[1], B[2], [x1, y1], warm(lit, 0.22));
    quad(g, B[0], B[1], B[2], B[3], warm(lit, 0.42));
    // the lamp and its pool of light on the back wall
    const lampX = (x0 + x1) / 2, lamp = P(lampX, y0 + 30, DEPTH * 0.45), top = P(lampX, y0, DEPTH * 0.45);
    if (lt > 0.02 || lit > 0.02) {
      const bw = B[1][0] - B[0][0], c = P(lampX, y0 + r.h * 0.55, DEPTH), pc = cd > 0.5 ? '160,200,255,' : '255,205,140,';
      const gl = g.createRadialGradient(c[0], c[1], 4, c[0], c[1], bw * 0.6);
      gl.addColorStop(0, 'rgba(' + pc + (0.42 * Math.max(lit, lt)) + ')'); gl.addColorStop(1, 'rgba(' + pc + '0)');
      g.fillStyle = gl; g.fillRect(B[0][0], B[0][1], bw, B[2][1] - B[0][1]);
    }
    g.strokeStyle = '#4a4b52'; g.lineWidth = 1.2; g.beginPath(); g.moveTo(top[0], top[1]); g.lineTo(lamp[0], lamp[1]); g.stroke();
    g.fillStyle = lit > 0.02 ? 'rgba(255,214,160,' + (0.4 + 0.6 * lit) + ')' : '#3b3c43';
    g.beginPath(); g.arc(lamp[0], lamp[1], 6 * F / (F + DEPTH * 0.45), 0, Math.PI * 2); g.fill();
    // as it happened, while the agents act: a cold beat on the maker's back wall
    if (id === 'maker' && st.deedOn) {
      const ph = (st.now % 1.9), a = Math.exp(-ph / 0.22) + 0.6 * Math.exp(-Math.max(0, ph - 0.32) / 0.22) * (ph > 0.32 ? 1 : 0);
      g.fillStyle = 'rgba(150,190,255,' + (0.55 * Math.min(1, a)) + ')';
      g.beginPath(); g.moveTo(B[0][0], B[0][1]); g.lineTo(B[1][0], B[1][1]); g.lineTo(B[2][0], B[2][1]); g.lineTo(B[3][0], B[3][1]); g.closePath(); g.fill();
    }
    // who reads here
    furniture(g, id, r, lit);
    // what is said here, written on the back wall as it is spoken
    words(g, id, r, inside);
    if (inside) unspoken(g, id, r);
    if (fl > 0.01) { g.fillStyle = 'rgba(225,238,255,' + (0.7 * fl) + ')'; g.fillRect(x0, y0, r.w, r.h); }
  }

  function person(g, x, yFloor, z, h, fill) {
    const k = F / (F + z), f = P(x, yFloor, z), s = h * k;
    g.fillStyle = fill;
    g.beginPath(); g.arc(f[0], f[1] - s * 0.9, s * 0.1, 0, Math.PI * 2); g.fill();
    g.beginPath(); g.moveTo(f[0] - s * 0.13, f[1]); g.lineTo(f[0] - s * 0.15, f[1] - s * 0.72); g.quadraticCurveTo(f[0], f[1] - s * 0.82, f[0] + s * 0.15, f[1] - s * 0.72); g.lineTo(f[0] + s * 0.13, f[1]); g.closePath(); g.fill();
  }
  function you(g, x, yFloor, h) {
    g.save(); g.strokeStyle = 'rgba(255,240,215,0.95)'; g.fillStyle = 'rgba(255,240,215,0.16)'; g.lineWidth = 2.2;
    g.beginPath(); g.arc(x, yFloor - h * 0.9, h * 0.1, 0, Math.PI * 2); g.fill(); g.stroke();
    g.beginPath(); g.moveTo(x - h * 0.13, yFloor); g.lineTo(x - h * 0.15, yFloor - h * 0.72); g.quadraticCurveTo(x, yFloor - h * 0.82, x + h * 0.15, yFloor - h * 0.72); g.lineTo(x + h * 0.13, yFloor); g.closePath(); g.fill(); g.stroke();
    g.restore();
  }
  function seated(g, x, yFloor, z, h, fill) {
    const k = F / (F + z), f = P(x, yFloor, z), s = h * k;
    g.fillStyle = fill;
    g.fillRect(f[0] - s * 0.42, f[1] - s * 0.42, s * 0.84, s * 0.06);            // desk top
    g.fillRect(f[0] - s * 0.38, f[1] - s * 0.38, s * 0.05, s * 0.38);            // desk legs
    g.fillRect(f[0] + s * 0.33, f[1] - s * 0.38, s * 0.05, s * 0.38);
    g.beginPath(); g.arc(f[0] - s * 0.1, f[1] - s * 0.74, s * 0.09, 0, Math.PI * 2); g.fill();
    g.fillRect(f[0] - s * 0.2, f[1] - s * 0.64, s * 0.2, s * 0.24);
  }
  function furniture(g, id, r, lit) {
    const y1 = r.y + r.h, dark = 'rgba(8,9,12,' + (0.55 + 0.4 * lit) + ')';
    if (id === 'maker') {
      // the record the maker keeps: racks; from the deed on they keep writing, until their kept time runs out
      const logs = SIG.filter(s => s.when.phase === 'deed');
      for (let i = 0; i < 6; i++) {
        const x = r.x + 40 + i * (r.w - 80) / 6, a = P(x, y1, DEPTH * 0.82), b = P(x + 58, y1 - 150, DEPTH * 0.82);
        g.fillStyle = '#0c0e13'; g.fillRect(a[0], b[1], b[0] - a[0], a[1] - b[1]);
        if (st.deedAt >= 0) for (let j = 0; j < 9; j++) {
          const s = logs[(i + j) % logs.length], gone = st.retained[s.id] !== undefined;
          const on = !gone && Math.sin(st.now * (5 + j * 1.3 + i) + i * 7) > 0.3;
          g.fillStyle = gone ? 'rgba(90,100,120,0.25)' : (on ? 'rgba(150,200,255,0.95)' : 'rgba(70,95,140,0.5)');
          const p = P(x + 10 + (j % 3) * 16, y1 - 130 + Math.floor(j / 3) * 34, DEPTH * 0.82);
          g.fillRect(p[0], p[1], 4, 4);
        }
      }
      seated(g, r.x + r.w * 0.78, y1, DEPTH * 0.35, 150, dark);
      if (st.alarm > 0.01) {
        // state 4: the monitor's light turns, and its red fills the room, so it shows through the glass to the street
        const a = P(r.x + r.w * 0.5, r.y + 48, DEPTH * 0.6), on = Math.max(0, Math.sin(st.now * 7));
        const gl = g.createRadialGradient(a[0], a[1], 4, a[0], a[1], r.w * 0.6);
        gl.addColorStop(0, 'rgba(255,70,55,' + (0.55 * st.alarm * on) + ')'); gl.addColorStop(1, 'rgba(255,70,55,0)');
        g.fillStyle = gl; g.fillRect(r.x, r.y, r.w, r.h);
        if (on > 0.2) { g.fillStyle = 'rgba(255,90,70,' + (0.95 * st.alarm) + ')'; g.beginPath(); g.arc(a[0], a[1], 9, 0, Math.PI * 2); g.fill(); }
      }
    } else if (id === 'others') {
      for (let i = 0; i < 4; i++) person(g, r.x + r.w * (0.25 + i * 0.16), y1, DEPTH * (0.45 + (i % 2) * 0.15), 140, dark);
    } else {
      seated(g, r.x + r.w * 0.76, y1, DEPTH * 0.38, 150, dark);
      // someone from the street who came in with a report
      if (st.visitor[id]) person(g, r.x + r.w * 0.36, y1, DEPTH * 0.3, 150, 'rgba(255,214,160,0.75)');
    }
  }

  function layVoice(g, v, r, size, inStreet) {
    const pad = 22, half = inStreet && !v.murmur && !v.caseV;
    const sw = half ? r.w / 2 - pad * 2 - 30 : r.w - pad * 2;
    const x0 = r.x + pad + (half ? (v.slot >= 0.5 ? r.w / 2 + 10 : 20) : 0);
    g.font = size + 'px ' + FONT;
    const space = g.measureText(' ').width, out = [];
    let x = 0, line = 0;
    for (const [w, a] of v.s.words) {
      const ww = g.measureText(w).width;
      if (x > 0 && x + ww > sw) { x = 0; line++; }
      out.push({ w, a, x: x0 + x, line });
      x += ww + space;
    }
    return { out, lines: line + 1, size, rw: r.w };
  }
  function drawVoice(g, v, r, size, color, alpha, top, rows, z) {
    if (!v.lay || v.lay.size !== size || v.lay.rw !== r.w) v.lay = layVoice(g, v, r, size, !!r.street);
    const el = (st.now - v.t0) * v.rate, lay = v.lay, lh = size * 1.3;
    if (el < 0) return;
    const scroll = Math.max(0, lay.lines - rows), sc = Math.min(scroll, Math.floor(Math.max(0, el) / v.dur * (scroll + 1)));
    const endAt = v.dur + 3.5, fade = el > endAt ? Math.max(0, 1 - (el - endAt) / 1.6) : 1;
    const k = F / (F + z), e = st.eye;
    if (v.caseV && v.s.who) {
      // who says it, and when: the record's own date and its source
      g.font = '600 ' + (Math.round(size * 0.46) * k) + 'px ' + FONT; g.textBaseline = 'top';
      g.fillStyle = 'rgba(255,200,140,' + (0.85 * alpha * fade) + ')';
      const cap = (dateAtH(st.mode, v.s.h) + ' · ' + v.s.who + ' · ' + host(v.s.src)).toUpperCase();
      g.fillText(cap, e.x + (r.x + 22 - e.x) * k, e.y + (top - size * 0.95 - e.y) * k, (r.w - 44) * k);
    }
    g.font = (size * k) + 'px ' + FONT; g.textBaseline = 'top'; g.fillStyle = color;
    for (const w of lay.out) {
      if (w.a > el || (v.again && w.a > 3.0)) continue;
      const line = w.line - sc;
      if (line < 0 || line >= rows) continue;
      g.globalAlpha = alpha * Math.min(1, (el - w.a) / 0.18) * fade * (v.again ? 0.6 : 1);
      g.fillText(w.w, e.x + (w.x - e.x) * k, e.y + (top + line * lh - e.y) * k);
    }
    g.globalAlpha = 1;
  }
  function words(g, id, r, inside) {
    const vs = st.voices.filter(v => v.room === id && !v.murmur);
    const size = 23, top = r.y + 48, rows = Math.max(1, Math.floor((r.h - 60) / (size * 1.3)));
    for (const v of vs) drawVoice(g, v, r, size, inside ? (v.caseV ? '#ffe2b8' : '#fbf7ee') : '#ffd9a6', 1, v.caseV ? top + size * 0.9 : top, v.caseV ? rows - 1 : rows, DEPTH * 0.99);
  }
  // the signals set down in this room with no hour: they do not sound; standing here you can read what they are
  function unspoken(g, id, r) {
    const ids = (roomById[id].signals || []).filter(x => byId[x].when.phase === 'none');
    if (!ids.length) return;
    const k = F / (F + DEPTH), e = st.eye, size = 12;
    g.font = (size * k) + 'px ' + FONT; g.fillStyle = 'rgba(200,196,186,0.55)'; g.textBaseline = 'top';
    const lines = ['Set down here, with no hour:'].concat(ids.map(x => '· ' + byId[x].what + ' (' + byId[x].inst + ')'));
    const y0 = r.y + r.h - 14 - lines.length * size * 1.35;
    lines.forEach((t, i) => g.fillText(t, e.x + (r.x + 70 - e.x) * k, e.y + (y0 + i * size * 1.35 - e.y) * k, (r.w * 0.5) * k));
  }

  function drawRoom(id) {
    const L = st.layout, r = L.rooms[id], meta = roomById[id], cam = st.cam;
    const inside = id === st.listener;
    if (inside) {
      ctx.save(); ctx.beginPath(); ctx.rect(r.x, r.y, r.w, r.h); ctx.clip();
      interior(ctx, id, r, true); ctx.restore();
    } else {
      // through frosted glass: the room drawn small and enlarged, so light, figures and lines of words show,
      // and no letter
      const blurPx = 7, BL = Math.max(3, blurPx / cam.s);
      const w = Math.max(8, Math.round(r.w / BL)), h = Math.max(8, Math.round(r.h / BL));
      const c = offscreen(id, w, h), g = c.getContext('2d');
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
      g.setTransform(w / r.w, 0, 0, h / r.h, -r.x * w / r.w, -r.y * h / r.h);
      interior(g, id, r, false);
      ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high';
      ctx.drawImage(c, r.x, r.y, r.w, r.h); ctx.restore();
      // the glass: a pale veil and its mullions
      ctx.fillStyle = 'rgba(150,170,205,0.07)'; ctx.fillRect(r.x, r.y, r.w, r.h);
      ctx.strokeStyle = 'rgba(160,170,190,0.22)'; ctx.lineWidth = 2;
      const panes = Math.max(2, Math.round(r.w / 120));
      for (let i = 1; i < panes; i++) { const x = r.x + i * r.w / panes; ctx.beginPath(); ctx.moveTo(x, r.y); ctx.lineTo(x, r.y + r.h); ctx.stroke(); }
      ctx.beginPath(); ctx.moveTo(r.x, r.y + r.h * 0.72); ctx.lineTo(r.x + r.w, r.y + r.h * 0.72); ctx.stroke();
      if (st.ear) st.voices.filter(v => v.room === id && !v.murmur).forEach((v, i) => earWords(ctx, v, r, 'wall', r.y + 50 + (i % 3) * 21, 15, '#bcd6ff'));
      if (st.shut[id] > 0.01) { ctx.strokeStyle = 'rgba(255,170,120,' + (0.9 * st.shut[id]) + ')'; ctx.lineWidth = 4; ctx.strokeRect(r.x + 2, r.y + 2, r.w - 4, r.h - 4); }
    }
    if (inside && st.ear) for (const v of st.voices.filter(v => v.room === id && v.caseV)) earWords(ctx, v, r, 'near', r.y + r.h - 64, 14, '#bcd6ff');
    // the name on the door can be read from anywhere: who is placed to read here is no secret
    ctx.fillStyle = 'rgba(8,10,14,0.55)'; ctx.fillRect(r.x, r.y, r.w, 40);
    ctx.textBaseline = 'top'; ctx.fillStyle = inside ? '#fbf7ee' : '#d6d2c8'; ctx.font = '600 17px ' + FONT;
    ctx.fillText(meta.name.toUpperCase(), r.x + 12, r.y + 5, r.w - 24);
    ctx.font = '13.5px ' + FONT; ctx.fillStyle = inside ? '#d8d3c8' : '#99958c';
    ctx.fillText(meta.sub, r.x + 12, r.y + 24, r.w - 24);
    if (!inside && locked()) { ctx.font = '600 12px ' + FONT; ctx.fillStyle = st.shut[id] > 0.01 ? '#ffb07a' : '#7d7a72'; ctx.textAlign = 'right'; ctx.fillText('SHUT', r.x + r.w - 12, r.y + 7); ctx.textAlign = 'left'; }
    if (inside) { ctx.strokeStyle = 'rgba(255,214,160,0.8)'; ctx.lineWidth = 3; ctx.strokeRect(r.x - 1.5, r.y - 1.5, r.w + 3, r.h + 3); you(ctx, r.x + 34, r.y + r.h - 4, 118); }
  }

  // the street, in front of the building: the public, the published texts in the air, a lamp, light from the windows
  function drawStreet(front) {
    const L = st.layout, r = L.rooms.street, inside = st.listener === 'street';
    if (!front) {
      // the pavement and the light that falls on it from lit rooms of the ground floor
      ctx.fillStyle = '#1c2130'; ctx.fillRect(r.x - 400, L.gy, r.w + 800, r.h + 200);
      ctx.fillStyle = '#262c3c'; ctx.fillRect(r.x - 400, L.gy, r.w + 800, 26);
      ctx.fillStyle = '#3b4152'; ctx.fillRect(r.x - 400, L.gy + 24, r.w + 800, 4);
      for (const [id, rm] of Object.entries(L.rooms)) {
        if (rm.street || rm.row !== L.rows - 1) continue;
        const lit = st.lit[id] || 0; if (lit < 0.02) continue;
        const gr = ctx.createLinearGradient(0, L.gy, 0, L.gy + 160);
        gr.addColorStop(0, 'rgba(255,200,130,' + (0.16 * lit) + ')'); gr.addColorStop(1, 'rgba(255,200,130,0)');
        ctx.fillStyle = gr; ctx.beginPath(); ctx.moveTo(rm.x, L.gy); ctx.lineTo(rm.x + rm.w, L.gy); ctx.lineTo(rm.x + rm.w + 60, L.gy + 160); ctx.lineTo(rm.x - 60, L.gy + 160); ctx.fill();
      }
      return;
    }
    // lamps
    const lamps = L.tall ? [r.x + 40, r.x + r.w - 40] : [r.x + 30, r.x + r.w * 0.4, r.x + r.w - 30];
    for (const lx of lamps) {
      ctx.fillStyle = '#4a4f5c'; ctx.fillRect(lx - 3, L.gy + 20, 6, r.h - 40);
      const gl = ctx.createRadialGradient(lx, L.gy + 24, 2, lx, L.gy + 24, 220);
      gl.addColorStop(0, 'rgba(210,225,255,0.22)'); gl.addColorStop(1, 'rgba(210,225,255,0)');
      ctx.fillStyle = gl; ctx.fillRect(lx - 220, L.gy - 200, 440, 440);
      ctx.fillStyle = 'rgba(230,238,255,0.9)'; ctx.beginPath(); ctx.arc(lx, L.gy + 22, 6, 0, Math.PI * 2); ctx.fill();
    }
    // as it happened, the deed is first told here: while the record speaks in the street, the street warms
    const told = st.voices.filter(v => v.caseV && v.room === 'street' && st.now - v.t0 > -0.2 && st.now - v.t0 < v.dur + 2.5).length;
    st.warm = Math.max(0, Math.min(1, (st.warm || 0) + (told ? 0.03 : -0.012)));
    if (st.warm > 0.01) {
      const gw = ctx.createRadialGradient(r.x + r.w / 2, r.y + r.h * 0.45, 20, r.x + r.w / 2, r.y + r.h * 0.45, r.w * 0.62);
      gw.addColorStop(0, 'rgba(255,196,128,' + (0.2 * st.warm) + ')'); gw.addColorStop(1, 'rgba(255,196,128,0)');
      ctx.fillStyle = gw; ctx.fillRect(r.x - 100, L.gy, r.w + 200, r.h + 40);
    }
    // the public: a few people on the pavement, and you among them while you stand here
    const yb = r.y + r.h - 22, ppl = L.tall ? [0.12, 0.3, 0.7, 0.88] : [0.08, 0.17, 0.3, 0.66, 0.79, 0.91];
    const walker = ppl.length - 2, glowing = st.notes.filter(n => st.now - n.t0 < 8).length ? 1 : -1;
    ppl.forEach((f, i) => {
      const x = r.x + r.w * f;
      if (i === walker && (st.walk || Object.keys(st.visitor).length)) {
        if (!st.walk) return;                            // gone in
        const a = Math.min(1, (st.now - st.walk.t0) / 2.8), tr = L.rooms[st.walk.room];
        const tx = tr.x + tr.w / 2, wx = x + (tx - x) * a, wy = yb + (L.gy + 30 - yb) * a;
        person(ctx, wx, wy, -30, 100 * (1 - 0.35 * a), 'rgba(255,214,160,' + (0.8 * (1 - Math.max(0, (a - 0.75) * 4))) + ')');
        return;
      }
      if (i === glowing) {
        const gl = ctx.createRadialGradient(x, yb - 55, 4, x, yb - 55, 90);
        gl.addColorStop(0, 'rgba(255,214,160,0.28)'); gl.addColorStop(1, 'rgba(255,214,160,0)');
        ctx.fillStyle = gl; ctx.fillRect(x - 90, yb - 145, 180, 180);
      }
      person(ctx, x, yb, -30 + (i % 3) * 14, 100, 'rgba(10,12,18,0.85)');
    });
    if (inside) you(ctx, r.x + r.w * 0.52, yb + 4, 118);
    // what is said in the street
    const size = L.tall ? 30 : 26, top = r.y + 52, noteY = r.y + r.h - (L.tall ? 230 : 160);
    const noted = st.notes.some(n => st.now - n.t0 < 9);
    const rows = Math.max(2, Math.floor(((noted ? noteY - 8 : r.y + r.h - 123) - top) / (size * 1.3)));
    const vs = st.voices.filter(v => v.room === 'street');
    const clear = vs.filter(v => !v.murmur), mur = vs.filter(v => v.murmur);
    const saveEye = st.eye; st.eye = { x: r.x + r.w / 2, y: r.y + r.h / 2 };
    if (inside) for (const v of clear) drawVoice(ctx, v, r, v.caseV ? size * 1.3 : size, v.caseV ? '#ffe2b8' : '#fbf7ee', 1, v.caseV ? top + size * 0.95 : top, v.caseV ? Math.max(2, rows - 1) : rows, 0);
    if (mur.length || !inside) {
      // through the wall (you stand in a room) or as a yearly figure (the murmur): blurred
      const BL = Math.max(3, 7 / st.cam.s), w = Math.max(8, Math.round(r.w / BL)), h = Math.max(8, Math.round(r.h / BL));
      const c = offscreen('street', w, h), g = c.getContext('2d');
      g.setTransform(1, 0, 0, 1, 0, 0); g.clearRect(0, 0, w, h);
      g.setTransform(w / r.w, 0, 0, h / r.h, -r.x * w / r.w, -r.y * h / r.h);
      if (!inside) for (const v of clear) drawVoice(g, v, r, size, v.caseV ? '#ffe2b8' : '#fbf7ee', 0.9, v.caseV ? top + size * 0.95 : top, rows, 0);
      mur.forEach((v, i) => drawVoice(g, v, r, size * 0.92, '#cfc9bc', 0.45, top + (i % 5) * size * 0.5, rows, 0));
      ctx.save(); ctx.imageSmoothingEnabled = true; ctx.imageSmoothingQuality = 'high'; ctx.drawImage(c, r.x, r.y, r.w, r.h); ctx.restore();
    }
    st.eye = saveEye;
    if (st.ear) {
      if (inside) for (const v of clear.filter(v => v.caseV)) earWords(ctx, v, r, 'near', r.y + (L.tall ? 330 : 166), L.tall ? 17 : 15, '#bcd6ff');
      else for (const v of clear) earWords(ctx, v, r, 'wall', top, L.tall ? 18 : 16, '#bcd6ff');
    }
    if (inside) {
      const ids = (roomById.street.signals || []).filter(x => byId[x].when.phase === 'none');
      if (ids.length) { ctx.font = '13px ' + FONT; ctx.fillStyle = 'rgba(200,196,186,0.6)'; ctx.textBaseline = 'top';
        ['Set down here, with no hour:'].concat(ids.map(x => '· ' + byId[x].what + ' (' + byId[x].inst + ')')).forEach((t, i) => ctx.fillText(t, r.x + r.w * 0.6, r.y + r.h - 64 + i * 17, r.w * 0.38)); }
    }
    for (const n of st.notes) {
      const el = st.now - n.t0; if (el > 9) continue;
      const a = Math.min(1, el / 0.6) * Math.min(1, (9 - el) / 1.2);
      ctx.globalAlpha = 0.85 * a; ctx.fillStyle = '#e8dccb'; ctx.textBaseline = 'top';
      ctx.font = 'italic ' + (L.tall ? 22 : 19) + 'px Georgia, serif';
      const t = dateAtH(st.mode, n.e.h) + ' · ' + n.e.label + ' ' + n.e.sub + (n.e.public === false ? ' · not public' : '');
      ctx.fillText(t, r.x + 92, noteY, r.w - 184);
      ctx.globalAlpha = 1;
    }
    ctx.textBaseline = 'top'; ctx.fillStyle = inside ? '#fbf7ee' : '#c9c5bb'; ctx.font = '600 15px ' + FONT;
    ctx.fillText('THE STREET', r.x + 92, r.y + 12); ctx.font = '13.5px ' + FONT; ctx.fillStyle = '#99958c'; ctx.fillText('the public: anyone', r.x + 92, r.y + 30);
  }

  // ---------- HUD ----------
  const elTime = document.getElementById('time'), elWhere = document.getElementById('where'), elMark = document.getElementById('mark');
  const elBar = document.getElementById('bar'), elPos = document.getElementById('pos'), elPause = document.getElementById('pause');
  function hud() {
    const h = tauToH(st.tau), rec = st.mode !== 'paper';
    if (rec && st.telling) {
      const e = st.telling.e, d = e.day;
      elTime.textContent = dateAtH(st.mode, e.h) + ' · ' + (d < 0 ? -d + ' days before the deed' : d + (d === 1 ? ' day' : ' days') + ' after the deed');
    } else if (rec) { const d = preDays(st.tau); elTime.textContent = h === null ? dateAtH(st.mode, -d * 24) + ' · ' + d + (d === 1 ? ' day' : ' days') + ' before the deed' : fmtH(h) + ' after the deed · ' + dateAtH(st.mode, h); }
    else elTime.textContent = h === null ? 'the model is released' : (st.ended ? 'two years after the deed' : fmtH(h) + ' after the deed');
    const m = roomById[st.listener];
    elWhere.textContent = st.listener === 'street' ? 'You stand in the street, with the public.' + (locked() ? ' The doors are shut until today.' : (st.mode !== 'paper' ? ' The doors are open: click a room.' : '')) : 'You stand in: ' + m.name + ' (' + m.sub + ').';
    elMark.textContent = st.now - st.markAt < (st.markDur || 3.2) ? st.markText : (st.mode === 'paper' && st.deedAt >= 0 && st.tau - st.deedAt < 5 && st.tau >= PRE ? 'A model does what nobody asked.' : '');
    elPos.style.left = (100 * st.tau / END).toFixed(2) + '%';
    document.getElementById('back').hidden = st.listener === 'street';
  }
  function ticksOnBar() {
    const tk = document.getElementById('ticks'), narrow = VW < 600;
    tk.textContent = '';
    const add = (tau, label, cls) => { const s = document.createElement('span'); s.className = cls || ''; s.style.left = (100 * tau / END) + '%'; s.textContent = label; tk.appendChild(s); return s; };
    add(0, 'release', 'first'); add(PRE, 'deed', 'deed');
    MARKS.forEach(([h, l]) => { if (narrow && (h === 168 || h === 17520 || h === 1)) return; if (h === 17520) return; add(hToTau(h), l.replace('one ', '1 ')); });
    // as it happened: a dot where the record speaks, and the bar after today shaded, because nothing is on record there
    const after = document.getElementById('after');
    if (st.mode === 'paper') { after.hidden = true; return; }
    after.hidden = false; after.style.left = (100 * REC_END / END) + '%';
    for (const e of CASES[st.mode].events) if (e.kind === 'voice') add(e.h < 0 ? preTau(e.h) : hToTau(e.h), '', 'dot' + (e.place === 'street' ? ' told' : ''));
  }
  const elModes = document.getElementById('modes'), elNext = document.getElementById('next');
  function modeButtons() { for (const b of elModes.querySelectorAll('button')) b.classList.toggle('on', b.dataset.mode === st.mode); }
  function offerNext() {
    elNext.textContent = '';
    const add = (t, m) => { const b = document.createElement('button'); b.textContent = t; b.addEventListener('click', () => setMode(m, m === 'paper')); elNext.appendChild(b); };
    elNext.appendChild(document.createTextNode(st.mode === 'paper' ? 'Two years on paper. Now as it happened: ' : 'The doors are open. Stand in any room, or hear: '));
    if (st.mode !== 'escape') add('the escape, 2026', 'escape');
    if (st.mode !== 'wiki') add('the wiki, 2026', 'wiki');
    if (st.mode !== 'paper') add('on paper, what the texts promise', 'paper');
    elNext.hidden = false;
  }
  function hideNext() { elNext.hidden = true; }

  // ---------- loop ----------
  function frame(t) {
    const dt = Math.min(0.1, (t - st.last) / 1000); st.last = t;
    if (st.started && !st.paused) {
      st.now += dt;
      // as it happened, the clock all but stops while the record speaks
      const rate = st.telling || st.queue.length ? 0.04 : 1;
      if (!st.ended) { st.tau = Math.min(END, st.tau + dt * rate); for (const ev of events) if (ev.tau <= st.tau && !st.fired.has(ev)) { st.fired.add(ev); fire(ev); } }
      story(); streetLoop();
      if (st.walk && st.now - st.walk.t0 > 3) { st.visitor[st.walk.room] = true; st.walk = null; }
      st.alarm = Math.max(0, st.alarm - dt * 0.12);
    }
    st.voices = st.voices.filter(v => st.now - v.t0 < v.dur / v.rate + 6);
    for (const k of Object.keys(roomById)) {
      const active = st.voices.some(v => v.room === k && !v.murmur && st.now - v.t0 > -0.2 && st.now - v.t0 < v.dur + 1);
      st.lit[k] = active ? Math.min(1, (st.lit[k] || 0) + dt * 2) : Math.max(0, (st.lit[k] || 0) - dt * 0.5);
    }
    for (const k of Object.keys(st.flash)) st.flash[k] = Math.max(0, st.flash[k] - dt * 0.7);
    for (const k of Object.keys(st.shut)) st.shut[k] = Math.max(0, st.shut[k] - dt * 0.8);
    st.spreads = st.spreads.filter(sp => { if (st.now - sp.t0 < 2.4) return true; st.cold[sp.to] = 1; st.woken[sp.to] = true; return false; });
    for (const k of Object.keys(st.cold)) st.cold[k] = Math.max(st.woken[k] ? 0.45 : 0, st.cold[k] - dt * 0.05);
    const f = 1 - Math.pow(0.03, dt);
    for (const [a, b] of [[st.cam, st.camTo], [st.eye, st.eyeTo]]) for (const k of Object.keys(b)) a[k] += (b[k] - a[k]) * f;
    draw(); hud();
    requestAnimationFrame(frame);
  }

  function standIn(id) {
    if (!roomById[id] || id === st.listener) return;
    if (id !== 'street' && locked()) { st.shut[id] = 1; mark('The door is shut. You are the public; the rooms open when the record reaches today.', 4); return; }
    st.listener = id; st.camTo = camFor(id); st.eyeTo = eyeFor(id);
    for (const v of st.voices) v.lay = null;
    if (AC) { for (const v of st.voices) if (v.chain) setOpen(v.chain, false); for (const t of Object.values(tickers)) setOpen(t.c, false); placePanners(); }
  }
  function roomAt(px, py) {
    const c = st.cam, wx = (px - VW / 2) / c.s + c.cx, wy = (py - VH / 2) / c.s + c.cy;
    for (const [id, r] of Object.entries(st.layout.rooms)) if (wx >= r.x && wx <= r.x + r.w && wy >= r.y && wy <= r.y + r.h) return id;
    if (wy > st.layout.gy) return 'street';
    return null;
  }

  canvas.addEventListener('click', e => { if (!st.started) return; const b = canvas.getBoundingClientRect(); const id = roomAt(e.clientX - b.left, e.clientY - b.top); if (id) standIn(id); });
  canvas.addEventListener('mousemove', e => { const b = canvas.getBoundingClientRect(); const id = roomAt(e.clientX - b.left, e.clientY - b.top); canvas.style.cursor = st.started && id && id !== st.listener ? 'pointer' : 'default'; });
  document.getElementById('back').addEventListener('click', () => standIn('street'));
  elPause.addEventListener('click', () => { st.paused = !st.paused; elPause.textContent = st.paused ? 'Go on' : 'Pause'; if (AC) (st.paused ? AC.suspend() : AC.resume()); });
  elBar.addEventListener('click', e => { if (!st.started) return; const b = elBar.getBoundingClientRect(); seek(END * (e.clientX - b.left) / b.width); });
  document.getElementById('again').addEventListener('click', () => seek(st.mode === 'paper' ? 0 : PRE - 10));
  for (const b of document.querySelectorAll('[data-mode]')) b.addEventListener('click', () => { if (!st.started) { begin(true, b.dataset.mode); return; } setMode(b.dataset.mode, false); });
  window.addEventListener('keydown', e => {
    if (!st.started) return;
    if (e.key === ' ') { e.preventDefault(); elPause.click(); }
    if (e.key === 'Escape') standIn('street');
  });

  async function begin(withSound, mode) {
    document.getElementById('enter').hidden = true;
    if (withSound) { try { await startAudio(); st.sound = true; } catch (e) { st.sound = false; } }
    st.started = true;
    const m = mode || Q.get('case');
    if (m && CASES[m]) setMode(m, false); else modeButtons();
    const t = parseFloat(Q.get('t'));
    if (!isNaN(t)) seek(t);
    if (Q.get('in') && roomById[Q.get('in')]) standIn(Q.get('in'));
    if (Q.get('ear')) { st.ear = true; if (elEar) elEar.classList.add('on'); }
  }
  document.getElementById('go').addEventListener('click', () => begin(true, 'escape'));
  document.getElementById('quiet').addEventListener('click', () => begin(false, 'escape'));
  const elEar = document.getElementById('ear');
  if (elEar) { if (!EH) elEar.hidden = true; elEar.addEventListener('click', () => { st.ear = !st.ear; elEar.classList.toggle('on', st.ear); }); }
  window.addEventListener('resize', resize);
  resize(); ticksOnBar();
  if (Q.get('auto')) begin(Q.get('auto') === 'sound', Q.get('case') || 'paper');
  requestAnimationFrame(t => { st.last = t; requestAnimationFrame(frame); });
  // for the check: the clock and its events, as the page runs them
  st.events = events.map(e => ({ tau: e.tau, kind: e.kind, id: e.id || null, h: e.h || null, again: !!e.again }));
  Object.assign(st, { PRE, RUN, END, hToTau, tauToH, preTau, invented: (id, side) => { const s = byId[id] || CASEV[id]; return invented(EH.rows[id][side], new Set((s.show || s.quote).split(/\s+/).map(w => w.toLowerCase().replace(/[^a-z0-9]/g, '')))); }, seek, standIn, setMode, renderOffline, locked, streetLoop: () => STREET_LOOP.slice(), buildEvents: m => buildEvents(m).map(e => ({ tau: e.tau, kind: e.kind, id: e.id || (e.ce && (e.ce.vid || e.ce.key)) || null, h: e.h ?? null, ph: e.ph || null })), recEnd: () => REC_END });
})();
