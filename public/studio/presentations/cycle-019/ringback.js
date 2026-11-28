// RINGBACK, state 1 (session 264, 2026-11-25) and state 2 (session 265, 2026-11-26). The Studio's own code, Apache-2.0;
// no library.
// Every receiver the Field coded in study 94 is called at once, and each line rings in its own network's ringing tone
// (the ITU's list) for as long as the visitor stays. A line is picked up only where its text obliges its receiver to
// answer the sender. Beside California's Office of Emergency Services, a 9-1-1 line held by the same office's standard
// is picked up at the fifteenth second. The ground is a wave field run on the graphics card: every ring sets it moving,
// the edge absorbs everything, and only a line that is picked up falls still.
// State 2: once every line rings, what was said in the two cases of 2026 comes in, in the order of its dates, each
// passage read by a synthetic voice: on the line of the receiver that said it, as a crossed line, or, where no text
// names the one who said it, from beyond the far rim of the field, where nobody called. None of it is said to the caller.
// The call keeps ringing when the visitor leaves the page.
// State 3, the check (session 266, 2026-11-27): rebuilt on the Field's check of the two cases (study 96, 74 acts).
// What is said and what is done now come in apart: a statement is a voice, a small disturbance of the ground; a deed
// (looked into it, ordered a stop, went to court) is not read but goes through the ground as a front from where its
// door stands, as strong as its force, and every light it passes shakes. The world beyond the field stays lit once the
// public knows. The record ends in the form. On a tall screen the field is seen from California's end.
// State 4, the presentation (session 267, 2026-11-28): rebuilt on the Field's reading 97 (81 acts at 20 doors, the two
// doors and seven acts this practice's case found missing) and on its reading of the maker's own door. Five times the
// maker's own line rings inside: its report says word of its machine reached it. Each word is held against the four
// duties that could ask the maker to pass it on; every duty it leaves in doubt goes out as a thread from the maker's
// light to the light of the receiver that duty names, flickering, and turns grey when the day its report would have
// been due has passed. No text names anyone who settles the doubt, so the threads stay to the end.
(function () {
  'use strict';
  const D = window.RINGBACK;
  const $ = (s) => document.querySelector(s);
  const C = D.control;
  const LINES = D.lines.map((l) => Object.assign({}, l, { kind: 'line' }));
  const CONTROL = Object.assign({}, C, { kind: 'control', short: '9-1-1', receiver_name: C.name });
  const ALL = LINES.concat([CONTROL]);
  const byId = Object.fromEntries(ALL.map((l) => [l.id, l]));
  const ORDER = ['CA6', 'CA5', 'CA7', 'CA8', 'NY4', 'NY6', 'NY5', 'EU4', 'COP3', 'COP5', 'PC3', 'PC4', 'G7-1', 'G7-3',
    'GPA2', 'CN1', 'CN2', 'AS1'];
  const OPEN = { first: 0.6, answer: C.answer_s, next: 19.0, step: 1.6 };

  // ------------------------------------------------------------------ state 2: what was overheard (the Field's study 95)
  const O = window.RINGBACK_OVERHEARD;
  const DOOR = Object.fromEntries(O.doors.map((d) => [d.id, d]));
  const RIM_OUT = -0.07;   // beyond the far edge of the field as the visitor first sees it: no text names them
  const RIM = O.doors.filter((d) => !d.line).map((d) => ({ id: d.id, kind: 'rim', door: d, x: d.rim_x, z: RIM_OUT,
    short: d.short, receiver_name: d.name, st: 'dark', spoke: null }));
  // On a wide screen the far edge is the one behind the voluntary texts; on a tall one, where the field is seen along
  // its length from California's end (since the check: the 9-1-1 line stands near the thumb), it is the far end, behind
  // the Chinese lines. The doors stand there in a row, in the order in which they first acted.
  let rimEnd = false;
  function placeRim(portrait) {
    rimEnd = portrait;
    for (const r of RIM) { if (portrait) { r.x = 1 - RIM_OUT; r.z = r.door.rim_x; } else { r.x = r.door.rim_x; r.z = RIM_OUT; } }
  }
  const rimSource = (r) => rimEnd ? [0.9, r.z] : [r.x, 0.1];
  const SEQ = O.seq.map((e) => Object.assign({}, e));
  const HEAR = { start: OPEN.next + ORDER.length * OPEN.step + 6, gap: 3.2, gapDeed: 1.6, pre: 2.5 };
  let hearEnd = 0;
  function timeSeq(base) {
    let t = base;
    for (const e of SEQ) {
      if (e.public) t += HEAR.pre;
      e.t = t; t += e.dur + (e.form === 'deed' ? HEAR.gapDeed : HEAR.gap);
      e.sched = false; e.node = null; e.launch = null;
    }
    hearEnd = t;
  }
  timeSeq(HEAR.start);
  const where = (e) => { const d = DOOR[e.door]; return d.line ? null : RIM.find((r) => r.id === d.id); };

  // ------------------------------------------------------------------ state 4: the maker's door (the Field's reading 97)
  // A word that reached the maker is no act. Its own line rings inside, an extension's double ring heard through a
  // wall, twice, and is picked up: the report says the word reached it. Then every duty the word leaves in doubt goes
  // out as a thread to the receiver that duty names. A thread turns grey once the record has passed the day its report
  // would have been due, had the duty been set off. No thread is ever settled.
  const INSIDE = { on: 0.4, gap: 0.2, period: 2.4, rings: 2, pick: 4.6, out: 5.2, hz: 425 };
  const insideAt = (e, t) => {
    const dt = t - e.t; if (dt < 0 || dt >= INSIDE.pick) return 0;
    const ph = dt % INSIDE.period;
    if (dt >= INSIDE.period * INSIDE.rings) return 0;
    return (ph < INSIDE.on || (ph >= INSIDE.on + INSIDE.gap && ph < 2 * INSIDE.on + INSIDE.gap)) ? 1 : 0;
  };
  const THREADS = [];
  for (const e of SEQ) {
    if (e.kind !== 'inside') continue;
    const doubt = e.cells.filter((c) => c.code === 'in doubt');
    doubt.forEach((c) => THREADS.push({ e, cell: c, from: DOOR[e.door].line, to: c.line }));
  }
  // threads to one receiver lie side by side, each bent a little further, the oldest closest to the straight line
  const bend = {};
  for (const th of THREADS) { bend[th.to] = (bend[th.to] || 0) + 1; th.k = bend[th.to]; }
  const born = (th) => th.e.t + INSIDE.out;
  // the moment the record passes the day the report would have been due: the first entry dated after it comes in
  function dueAt(th) {
    if (!th.cell.due) return null;
    const x = SEQ.find((y) => y.when > th.cell.due);
    return x ? x.t : hearEnd;
  }

  // ------------------------------------------------------------------ state of every line
  // st: 'dark' (not called) | 'ringing' | 'answered' | 'hungup'
  for (const l of ALL) { l.st = 'dark'; l.t0 = null; l.wall0 = null; l.wallEnd = null; l.voice = null; l.calm = 0; }
  const DRAWN = ALL.concat(RIM);
  let started = false, T0perf = 0, audio = null, focus = null, muted = false, openingDone = false;
  const now = () => (audio && audio.ctx.state === 'running') ? audio.ctx.currentTime - audio.t0 : performance.now() / 1000 - T0perf;

  // ------------------------------------------------------------------ the field and its camera
  const W = 1.6, DZ = 1.0;                       // world size of the field: x across, z from far to near
  const world = (l) => [(l.x - 0.5) * W, 0, (l.z - 0.5) * DZ];
  const cam = { eye: [0, 0.5, 1], vfov: 50 * Math.PI / 180, f: [0, 0, -1], r: [1, 0, 0], u: [0, 1, 0], asp: 1, yaw: 0, yawSet: false };
  const sub = (a, b) => [a[0] - b[0], a[1] - b[1], a[2] - b[2]];
  const dot = (a, b) => a[0] * b[0] + a[1] * b[1] + a[2] * b[2];
  const cross = (a, b) => [a[1] * b[2] - a[2] * b[1], a[2] * b[0] - a[0] * b[2], a[0] * b[1] - a[1] * b[0]];
  const nrm = (a) => { const k = Math.hypot(a[0], a[1], a[2]); return [a[0] / k, a[1] / k, a[2] / k]; };
  // The visitor stands above the field, as on a gallery, and may walk round it (drag). On a wide screen the field is
  // seen across its breadth; on a tall one, along its length, from California's end, so that the office and 9-1-1
  // stand nearest the hand (the check; in the second state it was seen from the other end).
  function setCamera(w, h) {
    cam.asp = w / h;
    const portrait = cam.asp < 0.9;
    const [ht, dist, pitch, fov] = portrait ? [0.95, 0.85, 0.9, 72] : [1.35, 1.3, 0.78, 34];
    cam.vfov = fov * Math.PI / 180;
    if (!cam.yawSet) { cam.yaw = portrait ? Math.PI / 2 : 0; placeRim(portrait); }
    cam.eye = [-Math.sin(cam.yaw) * dist, ht, Math.cos(cam.yaw) * dist];
    cam.f = nrm([Math.sin(cam.yaw) * Math.cos(pitch), -Math.sin(pitch), -Math.cos(cam.yaw) * Math.cos(pitch)]);
    cam.r = nrm(cross(cam.f, [0, 1, 0])); cam.u = cross(cam.r, cam.f);
  }
  function project(p, w, h) {
    const d = sub(p, cam.eye), z = dot(d, cam.f);
    if (z <= 0.001) return null;
    const th = Math.tan(cam.vfov / 2);
    const x = dot(d, cam.r) / (z * th * cam.asp), y = dot(d, cam.u) / (z * th);
    return [(x * 0.5 + 0.5) * w, (0.5 - y * 0.5) * h, z];
  }

  // ------------------------------------------------------------------ cadence: is a line's tone on at time t
  const tone = (l) => D.tones[l.tone];
  const period = (l) => tone(l).on + tone(l).off;
  function isOn(l, t) {
    if (l.st !== 'ringing' || l.t0 === null || t < l.t0) return false;
    return ((t - l.t0) % period(l)) < tone(l).on;
  }

  // ------------------------------------------------------------------ WebGL2: the wave field
  const NX = 384, NZ = 240;
  const canvas = $('#c');
  let gl = null, G = null, path = '2d';
  const VS = `#version 300 es
in vec2 p; void main(){ gl_Position = vec4(p, 0.0, 1.0); }`;
  const SIM = `#version 300 es
precision highp float;
uniform sampler2D S; uniform vec2 N; uniform float t; uniform int n;
uniform vec4 src[24]; uniform vec4 ton[24]; uniform float st0[24]; uniform vec4 calm[4]; uniform vec4 vox[2];
uniform vec4 frt[3]; uniform vec4 frw[3];
out vec4 o;
void main(){
  vec2 px = gl_FragCoord.xy; vec2 tx = 1.0 / N; vec2 uv = px * tx;
  vec4 c = texture(S, uv); float u = c.r, up = c.g;
  float l = texture(S, uv - vec2(tx.x, 0.0)).r + texture(S, uv + vec2(tx.x, 0.0)).r
          + texture(S, uv - vec2(0.0, tx.y)).r + texture(S, uv + vec2(0.0, tx.y)).r - 4.0 * u;
  float un = 2.0 * u - up + 0.22 * l;
  float e = min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y));
  float damp = mix(0.86, 0.9995, smoothstep(0.0, 0.085, e));
  for (int k = 0; k < 4; k++) {
    float d = distance(px, calm[k].xy * N);
    damp *= mix(1.0 - calm[k].w, 1.0, smoothstep(calm[k].z * 0.55, calm[k].z, d));
  }
  un *= damp;
  for (int i = 0; i < 24; i++) {
    if (i >= n) break;
    float tt = t - st0[i];
    if (tt < 0.0) continue;
    float ph = mod(tt, ton[i].w);
    if (ph >= ton[i].z) continue;
    float env = smoothstep(0.0, 0.12, ph) * smoothstep(ton[i].z, ton[i].z - 0.12, ph);
    float s = sin(6.2831853 * ton[i].x * tt);
    if (ton[i].y > 0.0) s = 0.5 * (s + sin(6.2831853 * ton[i].y * tt));
    vec2 d = px - src[i].xy * N;
    un += src[i].z * env * s * exp(-dot(d, d) / (src[i].w * src[i].w));
  }
  for (int k = 0; k < 2; k++) {
    if (vox[k].z <= 0.0) continue;
    // a voice moves the ground as speech does: irregularly, with its loudness
    float s = sin(6.2831853 * 2.3 * t + 2.6 * sin(6.2831853 * 0.71 * t + float(k)) + 1.7 * sin(6.2831853 * 5.3 * t));
    vec2 d = px - vox[k].xy * N;
    un += vox[k].z * s * exp(-dot(d, d) / (vox[k].w * vox[k].w));
  }
  // a deed is not a voice: it drives the ground for a moment from where its door stands, and the front goes through
  // the field. frt: x, z, strength, shape (0 a point, 1 a band across the far edge, 2 a band across the far end);
  // frw: time, width in cells, spread along the band in cells, frequency
  for (int k = 0; k < 3; k++) {
    if (frt[k].z <= 0.0) continue;
    float tt = t - frw[k].x;
    if (tt < 0.0 || tt > 1.5 / frw[k].w) continue;
    float s = sin(6.2831853 * frw[k].w * tt) * smoothstep(0.0, 0.08, tt);
    vec2 c0 = frt[k].xy * N, d = px - c0;
    float g;
    if (frt[k].w < 0.5) g = exp(-dot(d, d) / (frw[k].y * frw[k].y));
    else if (frt[k].w < 1.5) g = exp(-d.y * d.y / (frw[k].y * frw[k].y)) * exp(-d.x * d.x / (frw[k].z * frw[k].z));
    else g = exp(-d.x * d.x / (frw[k].y * frw[k].y)) * exp(-d.y * d.y / (frw[k].z * frw[k].z));
    un += frt[k].z * s * g;
  }
  o = vec4(un, u, 0.0, 1.0);
}`;
  const SHOW = `#version 300 es
precision highp float;
uniform sampler2D S; uniform vec2 N; uniform vec2 R; uniform vec3 eye, cf, cr, cu; uniform float th, asp;
uniform vec4 lamp[40]; uniform int nl; uniform float W, DZ, pub;
out vec4 o;
void main(){
  vec2 q = gl_FragCoord.xy / R * 2.0 - 1.0;
  vec3 dir = normalize(cf + q.x * th * asp * cr + q.y * th * cu);
  vec3 col = vec3(0.012, 0.016, 0.028) + vec3(0.0, 0.004, 0.012) * (q.y * 0.5 + 0.5);
  // the world beyond the field: it lights up, softly, when the public first knows
  col += vec3(0.05, 0.055, 0.07) * pub * smoothstep(-0.6, 0.2, dir.y);
  if (dir.y < -0.0001) {
    float tt = -eye.y / dir.y; vec3 P = eye + tt * dir;
    vec2 uv = vec2(P.x / W + 0.5, P.z / DZ + 0.5);
    bool inside = uv.x > 0.0 && uv.x < 1.0 && uv.y > 0.0 && uv.y < 1.0;
    if (!inside) col += vec3(0.11, 0.115, 0.13) * pub * exp(-max(tt - 0.4, 0.0) * 0.45);
    if (inside) {
      vec2 tx = 1.0 / N;
      float hx = texture(S, uv + vec2(tx.x, 0.0)).r - texture(S, uv - vec2(tx.x, 0.0)).r;
      float hz = texture(S, uv + vec2(0.0, tx.y)).r - texture(S, uv - vec2(0.0, tx.y)).r;
      float h = texture(S, uv).r;
      float g = length(vec2(hx, hz));
      float fog = exp(-max(tt - 0.6, 0.0) * 0.55);
      float edge = smoothstep(0.0, 0.03, min(min(uv.x, 1.0 - uv.x), min(uv.y, 1.0 - uv.y)));
      vec3 ground = vec3(0.020, 0.024, 0.036);
      float b = clamp(g * 9.0, 0.0, 1.0);
      vec3 ring = vec3(1.0, 0.78, 0.52) * pow(b, 0.85) * 0.9 + vec3(0.55, 0.62, 0.85) * clamp(h * 2.2, 0.0, 0.6) * 0.25;
      col = mix(col, ground + ring, fog * edge);
      for (int i = 0; i < 40; i++) {
        if (i >= nl) break;
        vec2 lp = lamp[i].xy; float d = length((P.xz - vec2((lp.x - 0.5) * W, (lp.y - 0.5) * DZ)));
        vec3 lc = lamp[i].w > 2.5 ? vec3(0.9, 0.95, 0.88) : lamp[i].w > 1.5 ? vec3(0.75, 0.86, 1.0) : vec3(1.0, 0.72, 0.42);
        col += lc * lamp[i].z * (0.55 * exp(-d * d / 0.0009) + 0.18 * exp(-d / 0.05)) * fog;
      }
    }
  }
  for (int i = 0; i < 40; i++) {
    if (i >= nl) break;
    vec2 lp = lamp[i].xy; vec3 L = vec3((lp.x - 0.5) * W, 0.012, (lp.y - 0.5) * DZ);
    vec3 v = L - eye; float a = dot(v, dir); if (a <= 0.0) continue;
    float d = length(v - a * dir) / a;
    vec3 lc = lamp[i].w > 2.5 ? vec3(0.93, 0.97, 0.9) : lamp[i].w > 1.5 ? vec3(0.78, 0.88, 1.0) : (lamp[i].w > 0.5 ? vec3(1.0, 0.80, 0.55) : vec3(0.5, 0.52, 0.58));
    col += lc * (lamp[i].z * (exp(-d * d / 0.0000035) * 1.3 + exp(-d / 0.006) * 0.16) + 0.06 * exp(-d * d / 0.000002));
    // a voice carries further than a ring: a wider halo while it speaks
    if (lamp[i].w > 2.5) col += lc * lamp[i].z * (exp(-d / 0.018) * 0.22 + exp(-d * d / 0.00012) * 0.35);
  }
  o = vec4(pow(col, vec3(0.92)), 1.0);
}`;

  function compile(type, src) {
    const s = gl.createShader(type); gl.shaderSource(s, src); gl.compileShader(s);
    if (!gl.getShaderParameter(s, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(s));
    return s;
  }
  function program(fs) {
    const p = gl.createProgram();
    gl.attachShader(p, compile(gl.VERTEX_SHADER, VS)); gl.attachShader(p, compile(gl.FRAGMENT_SHADER, fs));
    gl.bindAttribLocation(p, 0, 'p'); gl.linkProgram(p);
    if (!gl.getProgramParameter(p, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(p));
    const u = {}; const n = gl.getProgramParameter(p, gl.ACTIVE_UNIFORMS);
    for (let i = 0; i < n; i++) { const a = gl.getActiveUniform(p, i); u[a.name.replace(/\[0\]$/, '')] = gl.getUniformLocation(p, a.name); }
    return { p, u };
  }
  function initGL() {
    try {
      gl = canvas.getContext('webgl2', { antialias: false, alpha: false, preserveDrawingBuffer: false });
      if (!gl) return false;
      let fmt = null;
      if (gl.getExtension('EXT_color_buffer_float')) fmt = [gl.RG32F, gl.RG, gl.FLOAT];
      else if (gl.getExtension('EXT_color_buffer_half_float')) fmt = [gl.RG16F, gl.RG, gl.HALF_FLOAT];
      if (!fmt) return false;
      const lin = fmt[2] === gl.HALF_FLOAT || gl.getExtension('OES_texture_float_linear');
      const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
      gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
      gl.enableVertexAttribArray(0); gl.vertexAttribPointer(0, 2, gl.FLOAT, false, 0, 0);
      const tex = [], fb = [];
      for (let i = 0; i < 2; i++) {
        const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
        gl.texImage2D(gl.TEXTURE_2D, 0, fmt[0], NX, NZ, 0, fmt[1], fmt[2], null);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, lin ? gl.LINEAR : gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, lin ? gl.LINEAR : gl.NEAREST);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE);
        gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
        const f = gl.createFramebuffer(); gl.bindFramebuffer(gl.FRAMEBUFFER, f);
        gl.framebufferTexture2D(gl.FRAMEBUFFER, gl.COLOR_ATTACHMENT0, gl.TEXTURE_2D, t, 0);
        if (gl.checkFramebufferStatus(gl.FRAMEBUFFER) !== gl.FRAMEBUFFER_COMPLETE) return false;
        gl.clearColor(0, 0, 0, 1); gl.clear(gl.COLOR_BUFFER_BIT);
        tex.push(t); fb.push(f);
      }
      G = { sim: program(SIM), show: program(SHOW), tex, fb, cur: 0, simT: 0, steps: 0 };
      return true;
    } catch (e) { console.warn('RINGBACK: WebGL2 path unavailable, drawing on a 2D canvas instead.', e); gl = null; return false; }
  }

  const SIM_DT = 1 / 120;
  function simStep(t) {
    const P = G.sim; gl.useProgram(P.p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, G.fb[1 - G.cur]); gl.viewport(0, 0, NX, NZ);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, G.tex[G.cur]);
    gl.uniform1i(P.u.S, 0); gl.uniform2f(P.u.N, NX, NZ); gl.uniform1f(P.u.t, t);
    const live = ALL.filter((l) => l.st === 'ringing');
    const src = new Float32Array(96), ton = new Float32Array(96), s0 = new Float32Array(24);
    live.slice(0, 24).forEach((l, i) => {
      const T = tone(l);
      src.set([l.x, l.z, 0.010, 1.7], i * 4);
      ton.set([T.hz[0] / 100, T.hz[1] ? T.hz[1] / 100 : 0, T.on, T.on + T.off], i * 4);
      s0[i] = l.t0;
    });
    gl.uniform4fv(P.u.src, src); gl.uniform4fv(P.u.ton, ton); gl.uniform1fv(P.u.st0, s0); gl.uniform1i(P.u.n, Math.min(24, live.length));
    const calm = new Float32Array(16);
    ALL.filter((l) => l.calm > 0).slice(0, 4).forEach((l, i) => calm.set([l.x, l.z, 26 + 60 * (1 - l.calm), 0.06 * l.calm], i * 4));
    gl.uniform4fv(P.u.calm, calm);
    const vox = new Float32Array(8);
    activeAt(t).slice(0, 2).forEach((e, i) => {
      const r = where(e), l = r ? null : byId[DOOR[e.door].line];
      // a door on a line speaks from its line; one beyond the rim comes in at the far edge, in front of where it stands
      vox.set(r ? rimSource(r).concat([0.022 * voiceAmp(e, t), 3.2]) : [l.x, l.z, 0.016 * voiceAmp(e, t), 2.2], i * 4);
    });
    gl.uniform4fv(P.u.vox, vox);
    const frt = new Float32Array(12), frw = new Float32Array(12);
    fronts(t).slice(0, 3).forEach((e, i) => {
      const F = frontOf(e);
      frt.set([F.x, F.z, F.amp, F.shape], i * 4); frw.set([e.t, F.width, F.spread, F.hz], i * 4);
      if (e.launch === null) e.launch = G.steps;
    });
    gl.uniform4fv(P.u.frt, frt); gl.uniform4fv(P.u.frw, frw);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
    G.cur = 1 - G.cur; G.steps++;
  }
  // ------------------------------------------------------------------ deeds: fronts through the ground
  // Force 2: a deed that compels (a subpoena, a suit), across the whole field. Force 1: a deed of force by a public
  // body or a legislature (a demand, an inquiry, a letter of investigation). Force 0: any other deed (the maker stops
  // its runs, the moderator deletes, the harmed company rotates its keys), a burst that does not reach far.
  const FRONT = { 2: { amp: 0.044, hz: 1.6, width: 6, spread: 2000 }, 1: { amp: 0.020, hz: 2.0, width: 4, spread: 70 },
    0: { amp: 0.011, hz: 2.6, width: 3, spread: 26 } };
  const CELLS_PER_STEP = Math.sqrt(0.22), STEP_HZ = 120, CELLS_PER_UNIT = NZ / DZ;
  function frontOf(e) {
    const r = where(e), l = r ? null : byId[DOOR[e.door].line], f = FRONT[e.force];
    if (r) {
      const [x, z] = rimSource(r);
      return { x, z, shape: rimEnd ? 2 : 1, amp: f.amp, width: f.width, spread: f.spread, hz: f.hz };
    }
    return { x: l.x, z: l.z, shape: 0, amp: f.amp * 0.9, width: f.width + 2, spread: 0, hz: f.hz };
  }
  // the deeds whose drive is on at time t (the drive lasts a breath; the front then travels on its own)
  function fronts(t) { return started ? SEQ.filter((e) => e.form === 'deed' && t >= e.t && t < e.t + 1.6) : []; }
  // How far a deed's front has gone, in world units: counted in the steps the wave has actually run since it began,
  // so that a light shakes when the front it can be seen to reach arrives, however fast the machine draws.
  function frontReach(e, t) {
    if (G && e.launch !== null && e.launch !== undefined) return (G.steps - e.launch) * CELLS_PER_STEP / CELLS_PER_UNIT;
    return Math.max(0, t - e.t) * CELLS_PER_STEP * STEP_HZ / CELLS_PER_UNIT;
  }
  // a light's shake as fronts pass it: [dx, dz, flare]
  // (only: one deed's own share, for the check)
  const REACH = { 2: 2.6, 1: 1.6, 0: 0.7 };
  function shakeAt(l, t, only) {
    let dx = 0, dz = 0, fl = 0;
    if (!started) return [0, 0, 0];
    for (const e of SEQ) {
      if (e.form !== 'deed' || t < e.t || (only !== undefined && e.n !== only)) continue;
      // a front is done when it has gone as far as its force carries it, counted in its own steps, not in seconds
      const reach = frontReach(e, t); if (reach > REACH[e.force]) continue;
      const F = frontOf(e), wp = world(l);
      const d = F.shape === 0 ? Math.hypot(wp[0] - (F.x - 0.5) * W, wp[2] - (F.z - 0.5) * DZ)
        : F.shape === 1 ? Math.abs(wp[2] - (F.z - 0.5) * DZ) * (Math.abs(wp[0] - (F.x - 0.5) * W) < F.spread / CELLS_PER_UNIT * 1.6 ? 1 : 99)
        : Math.abs(wp[0] - (F.x - 0.5) * W) * (Math.abs(wp[2] - (F.z - 0.5) * DZ) < F.spread / CELLS_PER_UNIT * 1.6 ? 1 : 99);
      const lag = reach - d;   // how far the front has gone past the light
      const train = 1.5 / F.hz * CELLS_PER_STEP * STEP_HZ / CELLS_PER_UNIT;
      if (lag < 0 || lag > train) continue;
      // a deed that compels shakes the whole field; one by a public body the lights around it; any other only its neighbours
      const k = { 2: 1, 1: 0.6, 0: 0.35 }[e.force] * Math.exp(-d / { 2: 3.0, 1: 0.8, 0: 0.3 }[e.force]) * Math.sin(Math.PI * lag / train);
      const ph = Math.sin(2 * Math.PI * lag / (train / 1.5));
      dx += 0.014 * k * ph; dz += 0.009 * k * Math.cos(2 * Math.PI * lag / (train / 1.5)); fl = Math.max(fl, k);
    }
    return [dx, dz, fl];
  }
  // ------------------------------------------------------------------ what is being said now, and how loud
  function activeAt(t) { return started ? SEQ.filter((e) => t >= e.t && t < e.t + e.dur) : []; }
  function voiceAmp(e, t) {
    if (e.kind === 'silence') return 0.1;   // an open line, and nothing on it
    if (e.kind === 'inside') return 0.55 * insideAt(e, t);   // the maker's own line, ringing inside
    const i = Math.floor((t - e.t) * 30);
    return e.env && i >= 0 && i < e.env.length ? e.env[i] / 255 : 0;
  }
  function speaking(l, t) { return activeAt(t).find((e) => (l.kind === 'rim' ? e.door === l.id : DOOR[e.door].line === l.id)); }
  // Once the public knows, the world beyond the field stays lit: half for each case whose first public account has come
  // in, with a brightening at the moment it comes. What came before it was done and said in the dark.
  function publicGlow(t) {
    let lit = 0, flash = 0;
    for (const e of SEQ) {
      if (!e.public || t < e.t) continue;
      lit += 0.5 * Math.min(1, (t - e.t) / 2.5);
      flash = Math.max(flash, 0.7 * Math.min(1, (t - e.t) / 0.8) * Math.exp(-(t - e.t) / 6));
    }
    return lit + flash;
  }
  // A door beyond the rim keeps a light from its first act on, as strong as the strongest deed it did: a door that
  // compelled stands brightest, one that only spoke stands dim (the critique: the uncalled had been the weakest lights).
  const rimRest = (l) => l.kind === 'rim' && l.spoke !== null ? 0.22 + 0.16 * (l.force || 0) : 0;
  function lampLevel(l, t) {
    const e = speaking(l, t);
    if (e) {
      if (e.kind === 'inside') return t - e.t < INSIDE.pick ? [0.25 + 0.75 * insideAt(e, t), 3] : [0.62, 2];
      if (e.form === 'deed') {
        // a deed flares its door and dies down to what it leaves behind
        const a = Math.exp(-(t - e.t) / { 2: 2.6, 1: 1.6, 0: 1.0 }[e.force]);
        return [Math.max(rimRest(l), 0.3 + { 2: 1.1, 1: 0.8, 0: 0.5 }[e.force] * a), 3];
      }
      const a = voiceAmp(e, t);
      return [e.kind === 'silence' ? 0.12 + 0.08 * Math.random() : 0.3 + 0.7 * a, 3];
    }
    if (l.kind === 'rim') return [l.spoke !== null ? rimRest(l) : 0, 3];
    if (l.st === 'answered') return [0.62, 2];
    if (l.st === 'ringing') {
      const ph = (t - l.t0) % period(l), on = tone(l).on;
      const lv = ph < on ? 0.35 + 0.65 * Math.min(1, ph / 0.08, (on - ph) / 0.12) : 0.22;
      return [lv, 1];
    }
    return [l.st === 'hungup' ? 0.0 : 0.05, 0];
  }
  function drawGL(t) {
    const w = canvas.width, h = canvas.height;
    const P = G.show; gl.useProgram(P.p);
    gl.bindFramebuffer(gl.FRAMEBUFFER, null); gl.viewport(0, 0, w, h);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, G.tex[G.cur]);
    gl.uniform1i(P.u.S, 0); gl.uniform2f(P.u.N, NX, NZ); gl.uniform2f(P.u.R, w, h);
    gl.uniform3fv(P.u.eye, cam.eye); gl.uniform3fv(P.u.cf, cam.f); gl.uniform3fv(P.u.cr, cam.r); gl.uniform3fv(P.u.cu, cam.u);
    gl.uniform1f(P.u.th, Math.tan(cam.vfov / 2)); gl.uniform1f(P.u.asp, cam.asp); gl.uniform1f(P.u.W, W); gl.uniform1f(P.u.DZ, DZ);
    const lamp = new Float32Array(160), shown = DRAWN.filter((l) => l.kind !== 'rim' || l.spoke !== null);
    shown.forEach((l, i) => {
      const [lv, kind] = lampLevel(l, t), [dx, dz, fl] = shakeAt(l, t);
      lamp.set([l.x + dx / W, l.z + dz / DZ, Math.min(1.6, lv * (focus === l ? 1.25 : 1) + 0.9 * fl), kind], i * 4);
    });
    gl.uniform4fv(P.u.lamp, lamp); gl.uniform1i(P.u.nl, shown.length); gl.uniform1f(P.u.pub, publicGlow(t));
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // ------------------------------------------------------------------ the threads of doubt, drawn over the ground
  // Each thread is a dashed curve on the ground from the maker's light to the light of the receiver its duty names. It
  // is drawn out from the maker once the maker's line has been picked up, then stays: it flickers, never travels, and
  // never arrives or goes. Once the record has passed the day its report would have been due, it turns grey. A duty
  // with no day ("without undue delay") keeps its colour.
  const tcan = $('#t'), tctx = tcan ? tcan.getContext('2d') : null;
  function threadPoints(th) {
    const a = world(byId[th.from]), b = world(byId[th.to]);
    const mx = (a[0] + b[0]) / 2, mz = (a[2] + b[2]) / 2, dx = b[0] - a[0], dz = b[2] - a[2], L = Math.hypot(dx, dz) || 1;
    const off = (0.05 + 0.045 * th.k) * Math.min(1, 0.35 + L);
    const cx = mx - dz / L * off, cz = mz + dx / L * off, pts = [];
    for (let i = 0; i <= 40; i++) {
      const u = i / 40, v = 1 - u;
      pts.push([v * v * a[0] + 2 * u * v * cx + u * u * b[0], 0, v * v * a[2] + 2 * u * v * cz + u * u * b[2]]);
    }
    return pts;
  }
  function threadState(th, t) {
    const b0 = born(th);
    if (!started || t < b0) return null;
    const due = dueAt(th);
    return { grow: Math.min(1, (t - b0) / 1.4), past: due !== null && t >= due };
  }
  function drawThreads(t) {
    if (!tctx) return;
    const w = tcan.width, h = tcan.height, c = tctx, k = w / 1100;
    c.clearRect(0, 0, w, h);
    THREADS.forEach((th, idx) => {
      const S = threadState(th, t); if (!S) return;
      const pts = threadPoints(th).map((p) => project(p, w, h));
      const near = focus && (focus.id === th.from || focus.id === th.to);
      const fl = 0.62 + 0.38 * (0.5 + 0.5 * Math.sin(t * 6.1 + idx * 1.9)) * (0.5 + 0.5 * Math.sin(t * 2.3 + idx * 0.7));
      const base = S.past ? 0.26 : 0.6, col = S.past ? '150,156,168' : '236,240,226';
      c.lineWidth = (near ? 2.0 : 1.3) * Math.max(0.7, k); c.lineCap = 'round';
      const n = Math.round(S.grow * 40);
      for (let i = 0; i < n; i += 2) {
        const p = pts[i], q = pts[i + 1]; if (!p || !q) continue;
        c.strokeStyle = `rgba(${col},${(base * fl * (near ? 1.5 : 1)).toFixed(3)})`;
        c.beginPath(); c.moveTo(p[0], p[1]); c.lineTo(q[0], q[1]); c.stroke();
      }
      if (S.grow < 1 && pts[n]) {
        const g = c.createRadialGradient(pts[n][0], pts[n][1], 0, pts[n][0], pts[n][1], 10 * k);
        g.addColorStop(0, 'rgba(240,244,232,0.9)'); g.addColorStop(1, 'rgba(240,244,232,0)');
        c.fillStyle = g; c.beginPath(); c.arc(pts[n][0], pts[n][1], 10 * k, 0, Math.PI * 2); c.fill();
      }
    });
  }

  // ------------------------------------------------------------------ the 2D path: rings drawn, not simulated
  let ctx2 = null;
  function draw2D(t) {
    const w = canvas.width, h = canvas.height, c = ctx2;
    c.fillStyle = '#04060a'; c.fillRect(0, 0, w, h);
    const k = w / 1100;
    for (const l of ALL) {
      if (!(l.st === 'ringing' || l.st === 'answered') || l.t0 === null) continue;
      const per = period(l), p0 = project(world(l), w, h); if (!p0) continue;
      const last = l.st === 'answered' ? l.t0 + C.answer_s : t;
      for (let n = Math.floor(Math.max(0, last - l.t0 - 9) / per); l.t0 + n * per <= last; n++) {
        const age = t - (l.t0 + n * per); if (age < 0 || age > 9) continue;
        const r = 0.47 * age * 0.18, pts = [];
        for (let a = 0; a <= 64; a++) {
          const ang = a / 64 * Math.PI * 2, wp = world(l);
          const q = project([wp[0] + Math.cos(ang) * r, 0, wp[2] + Math.sin(ang) * r], w, h); if (q) pts.push(q);
        }
        c.strokeStyle = `rgba(255,200,140,${0.5 * (1 - age / 9)})`; c.lineWidth = 1.2 * k;
        c.beginPath(); pts.forEach((q, i) => i ? c.lineTo(q[0], q[1]) : c.moveTo(q[0], q[1])); c.stroke();
      }
    }
    const pg = publicGlow(t);
    if (pg > 0.01) { c.fillStyle = `rgba(150,160,180,${0.08 * pg})`; c.fillRect(0, 0, w, h); }
    for (const e of SEQ) {
      if (e.form !== 'deed' || t < e.t || t > e.t + 9) continue;
      const F = frontOf(e), reach = frontReach(e, t), a = (1 - (t - e.t) / 9) * { 2: 0.9, 1: 0.6, 0: 0.35 }[e.force];
      c.strokeStyle = `rgba(235,240,225,${a})`; c.lineWidth = { 2: 3, 1: 2, 0: 1.2 }[e.force] * k; c.beginPath();
      if (F.shape === 0) {
        for (let q = 0; q <= 64; q++) {
          const ang = q / 64 * Math.PI * 2, p = project([(F.x - 0.5) * W + Math.cos(ang) * reach, 0, (F.z - 0.5) * DZ + Math.sin(ang) * reach], w, h);
          if (p) q ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]);
        }
      } else {
        const half = Math.min(1, F.spread / CELLS_PER_UNIT * 1.6);
        for (let q = 0; q <= 32; q++) {
          const u = -half + 2 * half * q / 32;
          const P = F.shape === 1 ? [(F.x - 0.5) * W + u, 0, (F.z - 0.5) * DZ + reach] : [(F.x - 0.5) * W - reach, 0, (F.z - 0.5) * DZ + u];
          const p = project(P, w, h); if (p) q ? c.lineTo(p[0], p[1]) : c.moveTo(p[0], p[1]);
        }
      }
      c.stroke();
    }
    for (const l of DRAWN) {
      if (l.kind === 'rim' && l.spoke === null) continue;
      const [sx, sz] = shakeAt(l, t), wl = world(l);
      const p = project([wl[0] + sx, 0, wl[2] + sz], w, h); if (!p) continue;
      const [lv, kind] = lampLevel(l, t);
      const g = c.createRadialGradient(p[0], p[1], 0, p[0], p[1], 26 * k);
      const col = kind === 3 ? '235,245,225' : kind === 2 ? '190,220,255' : kind === 1 ? '255,190,120' : '130,135,150';
      g.addColorStop(0, `rgba(${col},${0.25 + lv})`); g.addColorStop(1, `rgba(${col},0)`);
      c.fillStyle = g; c.beginPath(); c.arc(p[0], p[1], 26 * k, 0, Math.PI * 2); c.fill();
    }
  }

  // ------------------------------------------------------------------ sound: every tone made as it plays
  function startAudio() {
    const AC = window.AudioContext || window.webkitAudioContext; if (!AC) return null;
    const ctx = new AC();
    const comp = ctx.createDynamicsCompressor(); comp.threshold.value = -20; comp.ratio.value = 4;
    const master = ctx.createGain(); master.gain.value = 0.85;
    master.connect(comp); comp.connect(ctx.destination);
    const A = { ctx, master, t0: ctx.currentTime - (performance.now() / 1000 - T0perf) };
    loadClips(ctx);
    return A;
  }
  // every reading is fetched once and decoded; a reading not yet here when its turn comes is shown and not heard
  let clipsAsked = false;
  function loadClips(ctx) {
    if (clipsAsked) return; clipsAsked = true;
    for (const e of SEQ) {
      if (!e.clip) continue;
      fetch(e.clip).then((r) => r.arrayBuffer()).then((b) => ctx.decodeAudioData(b)).then((buf) => {
        for (const x of SEQ) if (x.clip === e.clip) x.buf = buf;
      }).catch(() => {});
    }
  }
  let hissBuf = null;
  function hiss(ctx) {
    if (hissBuf) return hissBuf;
    const n = ctx.sampleRate * 2, b = ctx.createBuffer(1, n, ctx.sampleRate), d = b.getChannelData(0);
    let v = 0;
    for (let i = 0; i < n; i++) { v = 0.97 * v + 0.03 * (Math.random() * 2 - 1); d[i] = (Math.random() * 2 - 1) * 0.35 + v * 2; }
    return (hissBuf = b);
  }
  // A door on a line is a crossed line: through the telephone's band, faint in the room where its line stands, and in
  // the ear when the visitor holds that line. A door beyond the rim is on no line: it is heard in the open, from where
  // it stands.
  function playVoice(e) {
    const A = audio, ctx = A.ctx, d = DOOR[e.door], r = where(e), l = r ? null : byId[d.line];
    const at = A.t0 + e.t, late = Math.max(0, ctx.currentTime - at), when = Math.max(at, ctx.currentTime);
    const end = at + e.dur;
    const x = r ? r.door.rim_x : l.x;
    const out = ctx.createGain(); out.gain.value = 1;
    if (e.kind === 'act' && e.buf) {
      const s = ctx.createBufferSource(); s.buffer = e.buf; s.connect(out); s.start(when, late);
    }
    let room, ear = null;
    if (r) {
      const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 5200;
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      room = ctx.createGain(); room.gain.value = 0.55;
      out.connect(lp); if (pan) { pan.pan.value = Math.max(-1, Math.min(1, (x - 0.5) * 1.6)); lp.connect(pan); pan.connect(room); } else lp.connect(room);
      room.connect(A.master);
    } else {
      const n = ctx.createBufferSource(); n.buffer = hiss(ctx); n.loop = true;
      const ng = ctx.createGain(); ng.gain.value = e.kind === 'silence' ? 0.05 : 0.018;
      n.connect(ng); ng.connect(out); n.start(when); n.stop(Math.max(end + 0.2, when + 0.1));
      const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 300;
      const tl = ctx.createBiquadFilter(); tl.type = 'lowpass'; tl.frequency.value = 3400;
      const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
      room = ctx.createGain(); room.gain.value = 0;
      ear = ctx.createGain(); ear.gain.value = 0;
      out.connect(hp); hp.connect(tl);
      if (pan) { pan.pan.value = Math.max(-1, Math.min(1, (x - 0.5) * 1.7)); tl.connect(pan); pan.connect(room); } else tl.connect(room);
      tl.connect(ear); room.connect(A.master); ear.connect(A.master);
    }
    e.node = { room, ear, line: l ? l.id : null, roomLevel: r ? 0.55 : 0.42 };
    setEar();
  }
  // A deed is not read. It is struck in the room where its door stands: a low blow, and for a deed that compels a long
  // rumble while its front goes through the field.
  function playDeed(e) {
    const A = audio, ctx = A.ctx, r = where(e), l = r ? null : byId[DOOR[e.door].line];
    const at = Math.max(A.t0 + e.t, ctx.currentTime), x = r ? r.door.rim_x : l.x;
    const f = e.force, peak = { 2: 0.95, 1: 0.6, 0: 0.32 }[f], len = { 2: 2.6, 1: 1.5, 0: 0.9 }[f];
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const out = ctx.createGain(); out.gain.value = 1;
    if (pan) { pan.pan.value = Math.max(-1, Math.min(1, (x - 0.5) * 1.5)); out.connect(pan); pan.connect(A.master); } else out.connect(A.master);
    const o = ctx.createOscillator(), og = ctx.createGain();
    o.frequency.setValueAtTime({ 2: 62, 1: 78, 0: 96 }[f], at); o.frequency.exponentialRampToValueAtTime({ 2: 34, 1: 44, 0: 58 }[f], at + 0.7);
    og.gain.setValueAtTime(0.0001, at); og.gain.exponentialRampToValueAtTime(peak, at + 0.012); og.gain.exponentialRampToValueAtTime(0.0001, at + len);
    o.connect(og); og.connect(out); o.start(at); o.stop(at + len + 0.1);
    const n = ctx.createBufferSource(); n.buffer = hiss(ctx);
    const nf = ctx.createBiquadFilter(); nf.type = 'lowpass'; nf.frequency.value = { 2: 420, 1: 700, 0: 1100 }[f];
    const ng = ctx.createGain(); ng.gain.setValueAtTime(0.0001, at); ng.gain.exponentialRampToValueAtTime(peak * 0.5, at + 0.006); ng.gain.exponentialRampToValueAtTime(0.0001, at + 0.22);
    n.connect(nf); nf.connect(ng); ng.connect(out); n.start(at); n.stop(at + 0.3);
    if (f === 2) {
      const rb = ctx.createBufferSource(); rb.buffer = hiss(ctx); rb.loop = true;
      const rf = ctx.createBiquadFilter(); rf.type = 'lowpass'; rf.frequency.value = 110;
      const rg = ctx.createGain(); rg.gain.setValueAtTime(0.0001, at); rg.gain.exponentialRampToValueAtTime(0.5, at + 1.4); rg.gain.exponentialRampToValueAtTime(0.0001, at + 5.5);
      rb.connect(rf); rf.connect(rg); rg.connect(out); rb.start(at); rb.stop(at + 5.6);
    }
    e.node = { deed: true };
  }
  // The maker's own line rings inside: an extension's double ring through a wall, twice, then the click of a receiver
  // lifted. Nothing goes out of it.
  function playInside(e) {
    const A = audio, ctx = A.ctx, l = byId[DOOR[e.door].line];
    const at = A.t0 + e.t;
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const wall = ctx.createBiquadFilter(); wall.type = 'lowpass'; wall.frequency.value = 520; wall.Q.value = 0.4;
    const out = ctx.createGain(); out.gain.value = 0.55;
    wall.connect(out); if (pan) { pan.pan.value = Math.max(-1, Math.min(1, (l.x - 0.5) * 1.7)); out.connect(pan); pan.connect(A.master); } else out.connect(A.master);
    const gate = ctx.createGain(); gate.gain.value = 0;
    const o1 = ctx.createOscillator(), o2 = ctx.createOscillator(); o1.frequency.value = INSIDE.hz; o2.frequency.value = INSIDE.hz * 2;
    const g2 = ctx.createGain(); g2.gain.value = 0.35;
    o1.connect(gate); o2.connect(g2); g2.connect(gate); gate.connect(wall);
    const g = gate.gain;
    for (let r = 0; r < INSIDE.rings; r++) {
      for (const off of [0, INSIDE.on + INSIDE.gap]) {
        const a = at + r * INSIDE.period + off; if (a + INSIDE.on < ctx.currentTime) continue;
        const a0 = Math.max(a, ctx.currentTime);
        g.setValueAtTime(0, a0); g.linearRampToValueAtTime(1, a0 + 0.01); g.setValueAtTime(1, a + INSIDE.on - 0.01); g.linearRampToValueAtTime(0, a + INSIDE.on);
      }
    }
    const end = at + INSIDE.pick + 0.2;
    o1.start(Math.max(at, ctx.currentTime)); o2.start(Math.max(at, ctx.currentTime)); o1.stop(end); o2.stop(end);
    if (at + INSIDE.pick > ctx.currentTime) click(e.t + INSIDE.pick, 0.18);
    e.node = { inside: true };
  }
  function scheduleVoices(horizon) {
    if (!audio) return;
    const t = now();
    for (const e of SEQ) {
      if (e.sched || e.t > horizon || e.t + e.dur <= t) continue;
      if (e.form === 'deed') { e.sched = true; try { playDeed(e); } catch (err) { console.warn('RINGBACK: a deed could not be struck.', err); } continue; }
      if (e.kind === 'inside') { e.sched = true; try { playInside(e); } catch (err) { console.warn('RINGBACK: the maker\'s line could not ring.', err); } continue; }
      if (e.kind === 'act' && !e.buf) continue;
      e.sched = true;
      try { playVoice(e); } catch (err) { console.warn('RINGBACK: a reading could not be played.', err); }
    }
  }
  function voice(l) {
    const A = audio, ctx = A.ctx, T = tone(l);
    const gate = ctx.createGain(); gate.gain.value = 0;
    const oscs = T.hz.map((f) => { const o = ctx.createOscillator(); o.frequency.value = f; const g = ctx.createGain(); g.gain.value = 0.5 / T.hz.length; o.connect(g); g.connect(gate); o.start(); return o; });
    const lp = ctx.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 700 + 2600 * l.z;
    const pan = ctx.createStereoPanner ? ctx.createStereoPanner() : null;
    const room = ctx.createGain(); room.gain.value = 0.05 + 0.05 * l.z;
    gate.connect(lp); if (pan) { pan.pan.value = Math.max(-1, Math.min(1, (l.x - 0.5) * 1.7)); lp.connect(pan); pan.connect(room); } else lp.connect(room);
    room.connect(A.master);
    const hp = ctx.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 300;
    const tl = ctx.createBiquadFilter(); tl.type = 'lowpass'; tl.frequency.value = 3400;
    const ear = ctx.createGain(); ear.gain.value = 0;
    gate.connect(hp); hp.connect(tl); tl.connect(ear); ear.connect(A.master);
    return { gate, oscs, room, ear, next: l.t0, roomLevel: room.gain.value };
  }
  function schedule(ahead) {
    if (!audio) return;
    const ctx = audio.ctx, horizon = now() + (ahead || 0.8);
    for (const l of ALL) {
      if (l.st !== 'ringing' || !l.voice) continue;
      const v = l.voice, T = tone(l);
      while (v.next < horizon) {
        const a = audio.t0 + v.next, g = v.gate.gain;
        if (a > ctx.currentTime) {
          g.setValueAtTime(0, a); g.linearRampToValueAtTime(1, a + 0.012);
          g.setValueAtTime(1, a + T.on - 0.012); g.linearRampToValueAtTime(0, a + T.on);
        }
        v.next += T.on + T.off;
      }
    }
  }
  function silence(l) {
    if (!audio || !l.voice) return;
    const ctx = audio.ctx, g = l.voice.gate.gain, t = ctx.currentTime;
    g.cancelScheduledValues(t); g.setValueAtTime(g.value, t); g.linearRampToValueAtTime(0, t + 0.015);
    l.voice.oscs.forEach((o) => o.stop(t + 0.1));
  }
  function click(at, level) {
    if (!audio) return;
    const ctx = audio.ctx, len = Math.floor(ctx.sampleRate * 0.03), b = ctx.createBuffer(1, len, ctx.sampleRate), d = b.getChannelData(0);
    for (let i = 0; i < len; i++) d[i] = (Math.random() * 2 - 1) * Math.exp(-i / (len * 0.12));
    const s = ctx.createBufferSource(); s.buffer = b;
    const f = ctx.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 1800; f.Q.value = 0.9;
    const g = ctx.createGain(); g.gain.value = level;
    s.connect(f); f.connect(g); g.connect(audio.master); s.start(Math.max(ctx.currentTime, audio.t0 + at));
  }
  function setEar() {
    if (!audio) return;
    const t = audio.ctx.currentTime;
    for (const l of ALL) {
      if (!l.voice) continue;
      const inEar = focus === l || (!openingDone && (l.id === 'CA4' || l.id === '911') && !focus);
      l.voice.ear.gain.setTargetAtTime(inEar ? 0.34 : 0, t, 0.08);
      l.voice.room.gain.setTargetAtTime(inEar ? 0 : l.voice.roomLevel, t, 0.08);
    }
    for (const e of SEQ) {
      if (!e.node || !e.node.ear) continue;   // a deed has no ear: it is in the room
      const inEar = focus && focus.id === e.node.line;
      e.node.ear.gain.setTargetAtTime(inEar ? 0.95 : 0, t, 0.08);
      e.node.room.gain.setTargetAtTime(inEar ? 0 : e.node.roomLevel, t, 0.08);
    }
  }

  // ------------------------------------------------------------------ calls
  function place(l, t) {
    l.st = 'ringing'; l.t0 = t; l.wall0 = Date.now(); l.wallEnd = null; l.calm = 0;
    if (audio) { l.voice = voice(l); click(t, 0.08); }
    setEar(); render();
  }
  function answer(l, t) {
    l.st = 'answered'; l.answeredAt = t; l.wallEnd = Date.now(); l.calm = 1;
    silence(l); click(t, 0.5); render();
  }
  function hangUp(l) {
    if (l.st !== 'ringing') return;
    l.st = 'hungup'; l.wallEnd = Date.now(); silence(l); l.voice = null;
    if (focus === l) vibrate(null);
    render();
  }
  function callAgain(l) { place(l, now()); }

  // the opening, then every line once
  const timeline = [];
  function begin() {
    if (started) return; started = true;
    T0perf = performance.now() / 1000;
    audio = muted ? null : startAudio();
    if (audio && audio.ctx.state !== 'running') audio.ctx.resume();
    timeline.push([OPEN.first, () => { place(byId['911'], OPEN.first); place(byId.CA4, OPEN.first); }]);
    timeline.push([OPEN.first + OPEN.answer, () => answer(byId['911'], OPEN.first + OPEN.answer)]);
    ORDER.forEach((id, i) => timeline.push([OPEN.next + i * OPEN.step, () => place(byId[id], OPEN.next + i * OPEN.step)]));
    timeline.push([OPEN.next + ORDER.length * OPEN.step + 1.5, () => { openingDone = true; document.body.classList.add('open'); setEar(); render(); }]);
    $('#enter').hidden = true; document.body.classList.add('begun');
    wake();
  }
  function runTimeline(t) {
    while (timeline.length && timeline[0][0] <= t) { const [, f] = timeline.shift(); f(); }
    if (G) G.calmFade = true;
    for (const l of ALL) if (l.calm > 0 && l.st === 'answered') l.calm = Math.max(0.25, 1 - (t - l.answeredAt) / 30);
  }

  // ------------------------------------------------------------------ what is overheard, as it comes in
  const MONTHS = ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September', 'October', 'November', 'December'];
  const fmtDate = (iso) => { const [y, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1]} ${y}`; };
  const fmtShort = (iso) => { const [, m, d] = iso.split('-').map(Number); return `${d} ${MONTHS[m - 1].slice(0, 3)}`; };
  const CASE = Object.fromEntries(O.cases.map((c) => [c.id, c]));
  function daysText(e) {
    const n = e.days, by = e.bound === 'by' && e.kind === 'act';
    if (by) return n < 0 ? 'before the public knew' : n === 0 ? 'by the day the public knew' : `by ${n} day${n === 1 ? '' : 's'} after the public knew`;
    return n < 0 ? `${-n} days before the public knew` : n === 0 ? 'the day the public knew' : `${n} day${n === 1 ? '' : 's'} after the public knew`;
  }
  const FORCE_WORDS = { 2: 'done, and it compels', 1: 'done by a public body or a legislator; it does not compel', 0: 'done, not said' };
  function owedText(e) {
    return O.owed[e.owed] + (e.asked_words ? ', but ' + e.asked_words : '') +
      (e.code === 'acknowledge' && /portal/.test(e.doubt || '') ? ' · a number its portal gives on filing: a receipt' : '');
  }
  const WHO = { 'not said': 'no text says who settles it', 'the sender': 'the maker\'s own judgement settles it',
    'a public body': 'a public body settles it', 'a court': 'a court settles it' };
  const dutyDue = (c) => `${O.duties[c.duty].short}${c.due ? ', due by ' + fmtShort(c.due) + ' if it was set off' : ', no day'}`;
  function insideLine(e) {
    const dbt = e.cells.filter((c) => c.code === 'in doubt'), met = e.cells.filter((c) => c.code === 'met').length;
    return `of the ${e.cells.length} duties that could ask it to pass the word on, ${met ? met + ' set off' : 'none plainly set off'}` +
      (dbt.length ? `, ${dbt.length} in doubt: ${dbt.map(dutyDue).join('; ')}` : '');
  }
  function whoLine(e) {
    const d = DOOR[e.door], c = CASE[e.case];
    if (e.kind === 'inside') {
      return `${d.short}, ${e.bound === 'around' ? 'around ' : ''}${fmtDate(e.when)} · ${c.name.toLowerCase()} · ${daysText(e)}` +
        `${e.days_to_harm > 0 ? `, ${e.days_to_harm} before its agents reached the internet` : ''} · word of its own machine reached it, its report says · ${insideLine(e)}`;
    }
    const when = e.kind === 'act' && !e.dated ? 'undated, by ' + fmtDate(e.when) : (e.bound === 'by' ? 'by ' : '') + fmtDate(e.when);
    if (e.kind === 'silence') return `${d.short}, told ${when} · ${c.name.toLowerCase()} · no act of it is in the record`;
    return `${d.short}, ${when} · ${c.name.toLowerCase()} · ${daysText(e)}${e.public ? ', the first public account' : ''} · ${O.does[e.code]}${e.form === 'deed' ? ' (' + FORCE_WORDS[e.force] + ')' : ''} · ${owedText(e)}`;
  }
  let shownN = 0, heard = 0, ended = false;
  const heardEl = () => $('#heard');
  function hearTick(t) {
    // a door beyond the rim keeps its light from its first word on, even if no frame was drawn while it spoke
    for (const e of SEQ) {
      if (t < e.t) continue; const r = where(e);
      if (r && (r.spoke === null || r.spoke > e.t)) r.spoke = e.t;
      if (r && e.form === 'deed') r.force = Math.max(r.force || 0, e.force + 1);
    }
    heard = SEQ.filter((e) => e.kind === 'act' && t >= e.t).length;
    const cur = SEQ.filter((e) => t >= e.t).pop();
    const el = heardEl(); if (!el) return;
    if (cur && t < cur.t + cur.dur + HEAR.gap && cur.n !== shownN) {
      shownN = cur.n; ended = false;
      el.hidden = false; el.dataset.n = cur.n; el.dataset.door = cur.door; el.classList.toggle('rimv', !!where(cur));
      el.dataset.form = cur.form; el.dataset.force = cur.force === null || cur.force === undefined ? '' : cur.force;
      // a deed is written, not read: its passage stands as the record has it while its front goes through the ground
      el.querySelector('.q').innerHTML = cur.kind === 'inside' ? `<q>${esc(cur.quote)}</q>`
        : cur.kind === 'silence' ? '<i>(an open line, and nothing on it)</i>'
        : cur.form === 'deed' ? `<span class="dw">${esc(cur.quote)}</span>` : `<q>${esc(cur.quote)}</q>`;
      el.querySelector('.who').textContent = whoLine(cur);
    } else if (t >= hearEnd && !ended) {
      // The record ends in the form: nothing more comes in, the doors that acted stay lit, the lines ring on alone.
      ended = true; shownN = -1;
      el.hidden = true; el.dataset.n = 'end'; el.classList.remove('rimv');
      el.querySelector('.q').innerHTML = ''; el.querySelector('.who').textContent = '';
      $('#rehear').hidden = false; render();
    } else if (cur && t >= cur.t + cur.dur + HEAR.gap && t < hearEnd && shownN === cur.n) {
      el.hidden = true;
    }
  }
  function hearAgain() {
    timeSeq(now() + 1.5); shownN = 0; ended = false; $('#rehear').hidden = true; heardEl().hidden = true;
    for (const r of RIM) { r.spoke = null; r.force = 0; }
  }

  // ------------------------------------------------------------------ the phone in the hand, and a screen that stays on
  function vibrate(l) {
    if (!('vibrate' in navigator) || !matchMedia('(pointer: coarse)').matches) return;
    if (!l || l.st !== 'ringing') { navigator.vibrate(0); return; }
    const T = tone(l), pat = [];
    for (let i = 0; i < 20; i++) pat.push(Math.round(T.on * 1000), Math.round(T.off * 1000));
    navigator.vibrate(pat);
  }
  let lock = null;
  async function wake() { try { if ('wakeLock' in navigator) lock = await navigator.wakeLock.request('screen'); } catch (e) { lock = null; } }
  // The call goes on when the visitor leaves the page: a hidden page draws nothing, so the rings and the voices of the
  // next ten minutes are handed to the audio clock ahead of time, and a slow timer keeps handing them on. The tab's
  // title keeps the count.
  let awayAt = null, awayNote = '', awayTimer = null, keepTimer = null;
  function keepRinging() { if (!started) return; const t = now(); runTimeline(t); schedule(600); scheduleVoices(t + 600); hearTick(t); }
  document.addEventListener('visibilitychange', () => {
    if (!started) return;
    if (document.visibilityState === 'hidden') {
      awayAt = Date.now(); keepRinging(); clearInterval(keepTimer); keepTimer = setInterval(keepRinging, 30000);
    } else {
      clearInterval(keepTimer); wake();
      if (awayAt) {
        const gone = (Date.now() - awayAt) / 1000, n = LINES.filter((l) => l.st === 'ringing').length;
        awayNote = `you were away ${fmtDur(gone)}; ${n} rang on, nobody picked up`; awayAt = null;
        clearTimeout(awayTimer); awayTimer = setTimeout(() => { awayNote = ''; render(); }, 15000); render();
      }
    }
  });
  setInterval(() => {
    if (!started) { document.title = 'RINGBACK'; return; }
    const n = LINES.filter((l) => l.st === 'ringing').length;
    const total = LINES.reduce((s, l) => s + (l.wall0 ? ((l.wallEnd || Date.now()) - l.wall0) / 1000 : 0), 0);
    document.title = n ? `${n} ringing · ${fmtDur(total)} · RINGBACK` : 'RINGBACK';
  }, 1000);

  // ------------------------------------------------------------------ words
  const fmtDur = (s) => {
    s = Math.max(0, Math.floor(s));
    const d = Math.floor(s / 86400), h = Math.floor(s % 86400 / 3600), m = Math.floor(s % 3600 / 60), x = s % 60;
    const p = (n) => String(n).padStart(2, '0');
    return d ? `${d} d ${h} h ${p(m)} min` : h ? `${h}:${p(m)}:${p(x)}` : `${m}:${p(x)}`;
  };
  const fmtClock = (ms) => new Date(ms).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', second: '2-digit' });
  const fmtDay = (ms) => new Date(ms).toLocaleString([], { weekday: 'short', day: 'numeric', month: 'long', hour: '2-digit', minute: '2-digit' });
  const money = (v, cur) => cur === 'EUR' ? 'EUR ' + (v / 1e6) + ' million' : '$' + (v / 1e6) + ' million';
  const esc = (s) => String(s == null ? '' : s).replace(/[&<>"]/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[c]));
  const VERB = { duty: 'must', power: 'may', recommended: 'is asked to', none: '—' };
  const ACT = [
    ['acknowledge', 'answer the one who sent it'], ['investigate', 'look into it'], ['order', 'order a stop'],
    ['pass_on', 'pass it on'], ['tell_public', 'tell the public of this report'], ['tell_public_aggregate', 'produce a yearly report, anonymised and aggregated'],
  ];
  function hours(h) {
    if (h === 'prompt') return 'without undue delay, no hour';
    if (h === 'periodic') return null;
    if (typeof h !== 'number') return null;
    return h % 24 === 0 && h >= 48 ? `${h / 24} days (${h} hours)` : `${h} hours`;
  }
  function senderWhen(l) {
    const a = l.sender_deadline_h, b = l.sender_deadline_max_h;
    if (typeof a === 'number' && typeof b === 'number') return `within ${a / 24} to ${b / 24} days of knowing, by the kind of incident`;
    if (typeof a === 'number') return `within ${hours(a)} of knowing`;
    if (a === 'prompt') return 'without undue delay: the text names no hour';
    return l.sender_failure.v === 'n/a' ? 'whenever they choose: nobody is obliged to send' : 'the text names no hour';
  }
  function senderIfSilent(l) {
    const f = l.sender_failure;
    if (f.v === 'penalty') {
      const cur = l.instrument === 'eu-act' ? 'EUR' : 'USD';
      const tail = l.instrument === 'eu-act' ? ', or 3 % of its worldwide turnover if higher' : l.instrument === 'raise' ? ' for a first violation, $3 million for any after' : ' per violation';
      return `a fine of up to ${money(f.max, cur)}${tail}, sought by ${esc(f.who)}`;
    }
    if (f.v === 'n/a') return 'nothing: nobody is obliged to send';
    return 'the text names nothing';
  }
  function actWhen(l, a) {
    const x = l.acts[a];
    if (x.v === 'none') return '';
    if (x.deadline_h === 'periodic') {
      if (a === 'acknowledge') return 'every month';
      const q = (x.quotes[0] || '');
      return /2027/.test(q) ? 'once a year, from 1 January 2027' : /twenty-eight/.test(q) ? 'once a year, from 1 January 2028' : 'on a schedule';
    }
    if (typeof x.deadline_h === 'number') return 'within ' + (x.deadline_max_h ? `${x.deadline_h / 24} to ${x.deadline_max_h / 24} days` : hours(x.deadline_h));
    return 'no hour';
  }
  function deadlineOnCalendar(l) {
    const a = l.sender_deadline_h; if (typeof a !== 'number' || !l.wall0) return '';
    const b = l.sender_deadline_max_h;
    const s = fmtDay(l.wall0 + a * 3600e3) + (b ? ' to ' + fmtDay(l.wall0 + b * 3600e3) : '');
    return `<p class="small">Had the sender learned of it when this call was placed, its last hour would be ${s}.</p>`;
  }
  function quote(qs, ref) {
    if (!qs || !qs.length) return '';
    return `<q>${qs.map(esc).join(' … ')}</q>${ref ? ` <span class="ref">${esc(ref)}</span>` : ''}`;
  }
  function cellsHTML(e) {
    return `<table class="cells">${e.cells.map((c) => `<tr data-duty="${esc(c.duty)}" data-code="${esc(c.code)}"><td class="v ${c.code === 'in doubt' ? 'doubt' : ''}">${esc(c.code)}</td><td>${esc(O.duties[c.duty].short)}${c.code === 'in doubt' ? ` <span class="when">${c.due ? 'had it been set off, its report was due by ' + fmtDate(c.due) : 'no day: without undue delay'}</span><div class="q">It turns on ${c.conditions.map((x) => `${esc(x.what)} <span class="note">(${esc(WHO[x.who] || x.who)})</span>`).join('; and ')}.</div>` : `<div class="q note">${esc(c.reason)}</div>`}</td></tr>`).join('')}</table>`;
  }
  function heardList(es) {
    return es.map((e) => {
      const d = DOOR[e.door];
      if (e.kind === 'inside') return `<tr data-n="${e.n}" data-form="inside"><td class="v">${e.bound === 'around' ? 'c. ' : ''}${fmtShort(e.when)}</td><td>word of its own machine reached it <span class="when">${esc(daysText(e))}${e.days_to_harm > 0 ? ` · ${e.days_to_harm} days before its agents reached the internet` : ''} · in its own report</span><div class="q"><q>${esc(e.quote)}</q> <a class="ref" href="${esc(e.src_url)}">source</a></div>${cellsHTML(e)}</td></tr>`;
      if (e.kind === 'silence') return `<tr data-n="${e.n}"><td class="v">${fmtShort(e.when)}</td><td>${esc(d.name)}: told ${e.bound === 'by' ? 'by ' : ''}${fmtDate(e.when)}, in ${esc(CASE[e.case].name.toLowerCase())}. <span class="note">${esc(e.note)}</span><div class="q"><q>${esc(e.quote)}</q> <a class="ref" href="${esc(e.src_url)}">source</a></div></td></tr>`;
      const chk = e.check === 'added' ? ' · added by the Field\'s check' : e.check === 'corrected' ? ' · corrected by the Field\'s check'
        : e.check === 'added, reading 97' ? ' · added by the Field\'s reading 97, on this work\'s case' : '';
      return `<tr data-n="${e.n}" data-owed="${esc(e.owed)}" data-form="${esc(e.form)}"><td class="v ${e.owed === 'choice' ? '' : 'duty'}">${e.dated ? fmtShort(e.when) : 'by ' + fmtShort(e.when)}</td><td>${esc(d.short)} ${esc(O.does[e.code])}${e.form === 'deed' ? ' <span class="note">(done, not said)</span>' : ''} <span class="when">${esc(daysText(e))} · ${esc(owedText(e))}${chk}</span><div class="q">${e.form === 'deed' ? esc(e.quote) : `<q>${esc(e.quote)}</q>`} <a class="ref" href="${esc(e.src_url)}">source</a>${e.via !== 'direct' && e.via !== 'pdf' ? ` <span class="note">(read through ${esc(e.via === 'search excerpt' ? 'a search excerpt' : 'an extraction service')})</span>` : ''}</div></td></tr>`;
    }).join('');
  }
  function panelHTML(l) {
    if (l.kind === 'rim') {
      const d = l.door, es = SEQ.filter((e) => e.door === d.id);
      return `<h3>${esc(d.name)}</h3>
      <p class="meta">${esc(d.kind)} · in ${esc(CASE[d.case].name.toLowerCase())}</p>
      <p class="state" data-k="state">${stateText(l)}</p>
      <p class="small" data-k="rim">None of the texts the Field read names it as a receiver of such word, so it has no line here and nobody called it. It stands beyond the rim, in the order in which it first acted (${d.rim_order} of ${RIM.length}).</p>
      <h4>What it did, in the record</h4>
      <table class="acts">${heardList(es)}</table>
      ${d.not_found ? `<p class="small">${esc(d.not_found)}</p>` : ''}`;
    }
    if (l.kind === 'control') {
      return `<h3>9-1-1 in California</h3>
      <p class="state" data-k="state">${stateText(l)}</p>
      <p>${esc(C.office)} holds every public safety answering point it funds to one clock:</p>
      <p><q>${esc(C.standard)}</q> <q>${esc(C.standard2)}</q> <span class="ref">${esc(C.ref)}</span></p>
      <p>And to a consequence: <q>${esc(C.consequence)}</q> It watches: <q>${esc(C.monitor)}</q></p>
      <p class="small">This line is picked up at the fifteenth second, the latest the standard allows for nine calls in ten. The office does not answer 9-1-1 calls itself; it sets the standard for those who do. The same office is the one California's law names to receive a frontier developer's report of a critical safety incident (the line beside this one).</p>`;
    }
    const T = tone(l);
    const acts = ACT.map(([a, label]) => {
      const x = l.acts[a];
      return `<tr data-act="${a}" data-v="${x.v}"><td class="v ${x.v}">${VERB[x.v]}</td><td>${label}${actWhen(l, a) ? ` <span class="when">${actWhen(l, a)}</span>` : ''}${x.v !== 'none' || (x.quotes && x.quotes.length) ? `<div class="q">${quote(x.quotes, x.ref)}${x.note ? ` <span class="note">${esc(x.note)}</span>` : ''}</div>` : ''}</td></tr>`;
    }).join('');
    const rf = l.receiver_failure;
    const silent = rf.v === 'named' ? `Named: ${quote(rf.quotes, rf.ref)}`
      : `No text it answers to names anything.${rf.note ? ` <span class="note">${esc(rf.note)}</span>` : ''}${rf.quotes && rf.quotes.length ? ` ${quote(rf.quotes, rf.ref)}` : ''}`;
    return `<h3>${esc(l.receiver_name)}</h3>
    <p class="meta">${esc(l.instrument_short)} · ${esc(l.binding)} · ${esc(l.what)} · ${esc(l.ref)}</p>
    <p class="state" data-k="state">${stateText(l)}</p>
    <h4>On receipt, the receiver</h4>
    ${l.receiver_party === 'no' ? '<p class="small" data-k="no-task">The text addresses only the sender: it gives this receiver no task at all.</p>' : ''}
    <table class="acts">${acts}</table>
    <h4>If the receiver does nothing</h4>
    <p data-k="recv-fail" data-v="${rf.v}">${silent}</p>
    <h4>Who must send it, and by when</h4>
    <p>${esc(l.sender)}: <span data-k="sender-when">${senderWhen(l)}</span>. <span class="q">${quote([l.sender_passage], l.sender_ref)}</span></p>
    ${deadlineOnCalendar(l)}
    <p>If the sender stays silent: <span data-k="sender-fail">${senderIfSilent(l)}</span>.${l.sender_failure.quotes.length ? ' <span class="q">' + quote(l.sender_failure.quotes, l.sender_failure.ref) + '</span>' : ''}</p>
    ${l.note ? `<p class="small">${esc(l.note)}</p>` : ''}
    <p class="small">The tone: ${T.line ? `${esc(T.network)}'s ringing tone, ${T.hz.join(' and ')} Hz, ${T.on} s on and ${T.off} s off, as the ITU lists it` : `425 Hz, ${T.on} s on and ${T.off} s off, the commonest in the ITU's list`}; ${esc(l.seat)}.</p>
    ${overheardHTML(l)}`;
  }
  const D96 = { 'unknowable': 'cannot be read from the record', 'done, set-off or time unknown': 'done; when it was set off or done is not known',
    'declared not set off': 'declared not set off', 'not due': 'not due', 'met': 'met' };
  function makerDoorHTML(l) {
    if (l.id !== DOOR['E-MAKER'].line) {
      const ts = THREADS.filter((th) => th.to === l.id);
      if (!ts.length) return '';
      return `<h4>Threads from the maker</h4><p class="small" data-k="threads-in" data-n="${ts.length}">${ts.length} thread${ts.length === 1 ? '' : 's'} from the maker's light end${ts.length === 1 ? 's' : ''} here: word of its own machine reached the maker, and whether that word set off its duty to report to this receiver (${esc(O.duties[ts[0].cell.duty].short)}${ts.some((th) => th.cell.duty !== ts[0].cell.duty) ? ', and ' + esc(O.duties[ts.find((th) => th.cell.duty !== ts[0].cell.duty).cell.duty].short) : ''}) turns on terms no text names anyone to settle. ${ts.map((th) => `${th.e.bound === 'around' ? 'Around ' : ''}${fmtDate(th.e.when)}${th.cell.due ? ': due by ' + fmtDate(th.cell.due) + ' if it was' : ': no day'}`).join('. ')}.</p>`;
    }
    const md = O.counts.maker_door;
    const rows = O.duties96.map((x) => `<tr data-case="${esc(x.case)}" data-code="${esc(x.code)}"><td class="v">${esc(x.case === 'wiki' ? 'wiki' : 'escape')}</td><td>${esc(x.duty)} <span class="when">${esc(D96[x.code] || x.code)}</span><div class="q note">${esc(x.reason)}</div></td></tr>`).join('');
    return `<h4>The maker's own door</h4>
    <p class="small" data-k="maker-door">Before its agents reached the internet on 8 July, word of its own machine reached the maker ${md.words_before} times, its own report says. The Field held each word against the ${md.duties} duties that could ask the maker to pass it on (reading 97, read twice, the second time blind): of those ${md.cells_before}, none is plainly set off, ${md.notmet_before} plainly are not, and ${md.doubt_before} are in doubt. Every doubt turns on a term no text names anyone to settle (how serious a breach, how material a risk, whether the model is in the text's scope), ${md.doubt_before_sender} also on what only the maker could see, none on a public body or a court. Had the EU Code's duty been set off by the first word, its report was due by ${fmtDate(md.earliest_due)}, ${md.earliest_due_days_before_harm} days before the agents reached the internet. Each word in doubt sends threads across the field to the receivers its duties name.</p>
    <h4>What the two cases could set off at the maker's door</h4>
    <p class="small" data-k="duties96">As the Field's check read the record on 27 November. None is shown done in time: ${O.duties96.filter((x) => x.code === 'done, set-off or time unknown').length} were done, but when the duty was set off or the act done no record gives, ${O.duties96.filter((x) => x.code === 'unknowable').length} cannot be read from the record, ${O.duties96.filter((x) => x.code === 'declared not set off').length} the maker declared not set off, and ${O.duties96.filter((x) => x.code === 'not due').length} were not yet due.</p>
    <table class="acts">${rows}</table>`;
  }
  function overheardHTML(l) {
    return overheardLines(l) + makerDoorHTML(l);
  }
  function overheardLines(l) {
    const es = SEQ.filter((e) => DOOR[e.door].line === l.id);
    if (!es.length) return `<h4>Overheard on this line</h4><p class="small" data-k="overheard" data-n="0">Nothing: in the two cases of 2026 no act of this receiver is in the record the Field searched.</p>`;
    return `<h4>Overheard on this line, in the two cases of 2026</h4>
    <p class="small" data-k="overheard" data-n="${es.length}">Said or done by the receiver the Field found behind this line, to others and elsewhere, never to the one who sent the word. Hold the line and you hear what it said as a crossed line when its turn comes; what it did goes through the ground from its light.</p>
    <table class="acts">${heardList(es)}</table>`;
  }
  function stateText(l) {
    if (l.kind === 'rim') return l.spoke === null ? 'Not called. It has not yet acted.' : 'Not called. It acts all the same.';
    if (l.st === 'dark') return 'Not yet called.';
    if (l.st === 'answered') return `Picked up at ${fmtDur(l.answeredAt - l.t0)}, after ${Math.round(l.answeredAt - l.t0)} seconds.`;
    if (l.st === 'hungup') return `You hung up after ${fmtDur((l.wallEnd - l.wall0) / 1000)}. ` + (l.acts && l.acts.acknowledge.v === 'duty'
      ? 'Its text owes the one who sent the word a monthly update: no visit lasts a month.' : 'No text set it an hour to answer by.');
    return `Ringing since ${fmtClock(l.wall0)}: <b data-k="elapsed">${fmtDur((Date.now() - l.wall0) / 1000)}</b>.`;
  }

  // ------------------------------------------------------------------ the panel, the labels, the bar
  const panel = $('#panel'), labels = $('#labels');
  for (const l of DRAWN) {
    const b = document.createElement('button');
    b.className = 'lab' + (l.kind === 'control' ? ' ctl' : '') + (l.kind === 'rim' ? ' rim' : ''); b.dataset.id = l.id; b.type = 'button';
    b.innerHTML = `<i></i><span class="n">${esc(l.short)}</span><span class="e"></span>`;
    b.addEventListener('click', (e) => { e.stopPropagation(); select(l); });
    labels.appendChild(b); l.label = b;
  }
  function select(l) {
    if (!started) begin();
    focus = l; setEar(); vibrate(l.kind === 'line' ? l : null);
    panel.hidden = false; panel.dataset.id = l.id; document.body.classList.add('paneled');
    $('#panelBody').innerHTML = panelHTML(l);
    $('#hang').hidden = !(l.kind === 'line' && l.st === 'ringing');
    $('#again').hidden = !(l.kind === 'line' && l.st === 'hungup');
    render();
  }
  $('#close').addEventListener('click', () => { focus = null; panel.hidden = true; document.body.classList.remove('paneled'); vibrate(null); setEar(); render(); });
  $('#hang').addEventListener('click', () => { if (focus) { hangUp(focus); select(focus); } });
  $('#again').addEventListener('click', () => { if (focus) { callAgain(focus); select(focus); } });
  $('#all').addEventListener('click', () => {
    const ringing = LINES.filter((l) => l.st === 'ringing');
    if (ringing.length) ringing.forEach(hangUp); else LINES.forEach((l) => { if (l.st === 'hungup') callAgain(l); });
    if (focus) select(focus); render();
  });
  $('#mute').addEventListener('click', () => {
    muted = !muted;
    if (audio) { audio.master.gain.setTargetAtTime(muted ? 0 : 0.85, audio.ctx.currentTime, 0.05); }
    else if (!muted && started) { audio = startAudio(); for (const l of ALL) if (l.st === 'ringing') l.voice = voice(l); for (const e of SEQ) e.sched = false; setEar(); }
    $('#mute').textContent = muted ? 'sound off' : 'sound on'; $('#mute').setAttribute('aria-pressed', String(muted));
  });
  $('#go').addEventListener('click', begin);
  $('#rehear').addEventListener('click', hearAgain);
  $('#goQuiet').addEventListener('click', () => { muted = true; $('#mute').textContent = 'sound off'; begin(); });
  function nearest(e, px) {
    const r = canvas.getBoundingClientRect(), dpr = canvas.width / r.width;
    let best = null, bd = px * dpr;
    for (const l of DRAWN) {
      if (l.kind === 'rim' && l.spoke === null) continue;
      const p = project(world(l), canvas.width, canvas.height); if (!p) continue;
      const d = Math.hypot(p[0] - (e.clientX - r.left) * dpr, p[1] - (e.clientY - r.top) * dpr);
      if (d < bd) { bd = d; best = l; }
    }
    return best;
  }
  // drag to walk round the field; a touch without a drag takes the nearest line
  let drag = null, hover = null;
  canvas.addEventListener('pointerdown', (e) => { drag = { x: e.clientX, yaw: cam.yaw, moved: 0 }; canvas.setPointerCapture(e.pointerId); });
  canvas.addEventListener('pointermove', (e) => {
    if (drag) {
      const dx = e.clientX - drag.x; drag.moved = Math.max(drag.moved, Math.abs(dx));
      if (drag.moved > 6) { cam.yawSet = true; cam.yaw = drag.yaw + dx / canvas.getBoundingClientRect().width * Math.PI; setCamera(canvas.width, canvas.height); render(); }
    } else if (e.pointerType === 'mouse') {
      const h = nearest(e, 30); if (h !== hover) { hover = h; render(); }
    }
  });
  canvas.addEventListener('pointerup', (e) => {
    const d = drag; drag = null;
    if (d && d.moved <= 6) { const l = nearest(e, 44); if (l) select(l); }
  });
  canvas.addEventListener('pointerleave', () => { if (hover) { hover = null; render(); } });

  function render() {
    const r = canvas.getBoundingClientRect(), dpr = canvas.width / Math.max(1, r.width);
    const tt = started ? now() : 0;
    // on a narrow screen the lines that start one after another name themselves one at a time (the check: in the
    // second state their names piled into a knot over the caption)
    const narrow = r.width < 640;
    const newest = LINES.filter((l) => l.st === 'ringing').reduce((a, l) => (!a || l.wall0 > a.wall0 ? l : a), null);
    for (const l of DRAWN) {
      const p = project(world(l), canvas.width, canvas.height), b = l.label;
      if (!p || (l.kind === 'rim' && l.spoke === null)) { b.hidden = true; continue; }
      b.hidden = false;
      const sp = speaking(l, tt);
      b.classList.toggle('speak', !!sp);
      b.style.transform = `translate(${(p[0] / dpr).toFixed(1)}px, ${(p[1] / dpr).toFixed(1)}px)`;
      b.dataset.state = l.st; b.classList.toggle('left', p[0] / dpr > r.width * 0.6); b.classList.toggle('focus', focus === l); b.classList.toggle('hover', hover === l);
      b.classList.toggle('fresh', l.st === 'ringing' && Date.now() - l.wall0 < 3500 && (!narrow || l === newest));
      b.querySelector('.e').textContent = sp ? (sp.kind === 'silence' ? 'told ' + fmtShort(sp.when) + ' · nothing' : (sp.form === 'deed' ? 'done · ' : l.kind === 'rim' ? 'not called · ' : 'overheard · ') + fmtShort(sp.when))
        : l.kind === 'rim' ? ''
        : l.st === 'ringing' ? fmtDur((Date.now() - l.wall0) / 1000)
        : l.st === 'answered' ? 'picked up at ' + fmtDur(l.answeredAt - l.t0) : l.st === 'hungup' ? 'hung up' : '';
    }
    const ringing = LINES.filter((l) => l.st === 'ringing');
    const total = LINES.reduce((s, l) => s + (l.wall0 ? ((l.wallEnd || Date.now()) - l.wall0) / 1000 : 0), 0);
    const ans = byId['911'];
    const st = $('#status');
    st.dataset.ringing = ringing.length; st.dataset.lines = LINES.length;
    st.innerHTML = !started ? '' : !openingDone && ans.st !== 'answered'
      ? '' : `<span data-k="ringing">${ringing.length}</span> of <span data-k="lines">${LINES.length}</span> lines ringing<span class="tog"> · together <span data-k="total">${fmtDur(total)}</span></span>` +
        (ans.st === 'answered' ? ` · <span class="nw">9-1-1 picked up at <span data-k="answered">${fmtDur(ans.answeredAt - ans.t0)}</span></span>` : '') +
        (heard ? ` · <span class="nw">${ended ? 'the record ended; ' : ''}<span data-k="heard">${heard}</span> of <span data-k="acts">${O.counts.acts}</span> acts, none to you</span>` : '') +
        (awayNote ? ` · <span class="nw" data-k="away">${awayNote}</span>` : '');
    $('#all').textContent = ringing.length ? 'hang up all' : 'call them all again';
    $('#all').hidden = !openingDone;
    if (!panel.hidden && focus) { const s = panel.querySelector('[data-k="state"]'); if (s) s.innerHTML = stateText(focus); }
  }

  // ------------------------------------------------------------------ the loop
  function resize() {
    const r = canvas.getBoundingClientRect(), dpr = Math.min(2, window.devicePixelRatio || 1);
    canvas.width = Math.max(2, Math.round(r.width * dpr)); canvas.height = Math.max(2, Math.round(r.height * dpr));
    if (tcan) { tcan.width = canvas.width; tcan.height = canvas.height; }
    setCamera(canvas.width, canvas.height); render();
  }
  let lastLabel = 0;
  function frame() {
    const t = started ? now() : 0;
    if (started) { runTimeline(t); schedule(); scheduleVoices(t + 1.5); hearTick(t); }
    if (gl) {
      if (!G.simT) G.simT = t;
      let k = 0;
      while (G.simT < t && k < 4) { simStep(G.simT); G.simT += SIM_DT; k++; }
      if (G.simT < t) G.simT = t;
      drawGL(t);
    } else draw2D(t);
    drawThreads(t);
    if (performance.now() - lastLabel > 250) { render(); lastLabel = performance.now(); }
    requestAnimationFrame(frame);
  }
  if (initGL()) path = 'webgl2'; else { ctx2 = canvas.getContext('2d'); path = '2d'; }
  document.body.dataset.path = path;
  window.addEventListener('resize', resize); resize();
  requestAnimationFrame(frame);

  // for the check: what the page holds, read from the page itself
  window.__ringback = {
    path: () => path,
    t: () => now(),
    lines: () => ALL.map((l) => ({ id: l.id, st: l.st, t0: l.t0, answeredAt: l.answeredAt || null, tone: l.tone,
      hz: tone(l).hz, on: tone(l).on, off: tone(l).off, voice: !!l.voice,
      oscHz: l.voice ? l.voice.oscs.map((o) => o.frequency.value) : null })),
    select: (id) => select(byId[id] || RIM.find((r) => r.id === id)),
    overheard: () => SEQ.map((e) => ({ n: e.n, door: e.door, kind: e.kind, t: e.t, dur: e.dur, sched: e.sched, playing: !!e.node,
      buf: !!e.buf, line: DOOR[e.door].line })),
    rim: () => RIM.map((r) => ({ id: r.id, x: r.x, spoke: r.spoke, p: project(world(r), canvas.width, canvas.height) })),
    active: (t) => activeAt(t === undefined ? now() : t).map((e) => e.n),
    lamp: (id, t) => { const l = byId[id] || RIM.find((r) => r.id === id); return lampLevel(l, t === undefined ? now() : t); },
    hearEnd: () => hearEnd,
    // how far ahead every ringing line's cadence is already handed to the audio clock, in seconds
    ahead: () => { const t = now(); const v = ALL.filter((l) => l.st === 'ringing' && l.voice).map((l) => l.voice.next - t); return v.length ? Math.min(...v) : null; },
    glow: (t) => publicGlow(t === undefined ? now() : t),
    fronts: (t) => fronts(t === undefined ? now() : t).map((e) => ({ n: e.n, door: e.door, force: e.force, launch: e.launch })),
    shake: (id, t, only) => { const l = byId[id] || RIM.find((r) => r.id === id); return shakeAt(l, t === undefined ? now() : t, only); },
    reach: (n, t) => { const e = SEQ.find((x) => x.n === n); return frontReach(e, t === undefined ? now() : t); },
    deedStruck: () => SEQ.filter((e) => e.form === 'deed' && e.node && e.node.deed).map((e) => e.n),
    ended: () => ended,
    camera: () => ({ yaw: cam.yaw, eye: cam.eye.slice() }),
    // for the check only: move the visitor's clock forward without waiting (the page runs quiet then)
    advance: (s) => { T0perf -= s; if (audio) audio.t0 -= s; },
    ringingAt: (id, t) => isOn(byId[id], t),
    // state 4: the maker's door
    inside: () => SEQ.filter((e) => e.kind === 'inside').map((e) => ({ n: e.n, word: e.word, t: e.t, dur: e.dur, sched: e.sched,
      played: !!(e.node && e.node.inside), line: DOOR[e.door].line })),
    insideAt: (n, t) => insideAt(SEQ.find((e) => e.n === n), t === undefined ? now() : t),
    threads: (t) => THREADS.map((th) => { const S = threadState(th, t === undefined ? now() : t);
      return { word: th.e.word, duty: th.cell.duty, from: th.from, to: th.to, due: th.cell.due, born: born(th), dueAt: dueAt(th),
        drawn: !!S, grow: S ? S.grow : 0, past: S ? S.past : false }; }),
    threadPixels: () => { if (!tctx) return 0; const d = tctx.getImageData(0, 0, tcan.width, tcan.height).data; let n = 0; for (let i = 3; i < d.length; i += 4) if (d[i] > 8) n++; return n; },
    project: (id) => project(world(byId[id]), canvas.width, canvas.height),
  };
})();
