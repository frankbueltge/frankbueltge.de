// SMALL HOURS: the house's signed record as fires on a dark field (The Studio, cycle 017).
// Every mark is one commit of data.js; nothing here invents a deed. Positions: the present at the
// centre, every commit receding outward with its age; the four practices in four quarters.
import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

const S = window.SH, C = S.c, N = C.t.length, F = S.facts;
const $ = id => document.getElementById(id);
const DAY = 86400, HOUR = 3600;
const R0 = 16, RMAX = 600;
const T0 = S.t0, T1 = S.t1, CENSUS = S.census;
const K = (RMAX - R0) / (T1 - T0 + DAY);          // field units per second of age
const SECTOR = [-Math.PI / 2, 0, Math.PI / 2, Math.PI];   // studio, field, atelier, middle
const SPREAD = Math.PI / 2 - 0.16;
const LANTERN_R = 34, WALK = 46;                 // the visitor's light, and how fast it walks

// ---------- per commit, fixed: angle from its hash, size from its lines ----------
const theta = new Float32Array(N), cs = new Float32Array(N), sn = new Float32Array(N);
const size = new Float32Array(N), breach = new Float32Array(N), tRel = new Float32Array(N), seenAt = new Float32Array(N);
const breachOf = new Map(), ownOf = new Map();
for (const b of S.breaches) { breach[b.c] = 1; seenAt[b.c] = CENSUS - T0; (breachOf.get(b.c) || breachOf.set(b.c, []).get(b.c)).push(b); }
// the Atelier's digest over its own cap, by the count it declared: seen by its own next session, or by its recount
for (const o of S.own) {
  ownOf.set(o.c, o); breach[o.c] = 2;
  seenAt[o.c] = (o.seen ? C.t[o.seen.c] : Math.min(S.recount, breachOf.has(o.c) ? CENSUS : Infinity)) - T0;
}
const threads = S.own.filter(o => o.seen);
for (let i = 0; i < N; i++) {
  const h = C.h[i], u = parseInt(h.slice(0, 7), 16) / 0x10000000, v = parseInt(h.slice(7, 12), 16) / 0x100000;
  theta[i] = SECTOR[C.r[i]] + (u - 0.5) * SPREAD;
  cs[i] = Math.cos(theta[i]); sn[i] = Math.sin(theta[i]);
  size[i] = (C.k[i] === 1 ? 1.4 : 2.2) + Math.min(5.5, Math.log10(1 + C.l[i]) * 1.5) + v * 0.6;
  tRel[i] = C.t[i] - T0;
}
const radiusAt = (i, T) => R0 + K * (T - C.t[i]);

// ---------- renderer, scene, camera ----------
const host = $('world');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(2, window.devicePixelRatio || 1));
renderer.outputColorSpace = THREE.SRGBColorSpace;
host.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(52, 1, 0.5, 4000);
camera.position.set(-38, 62, 118);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 0, -46);
controls.enableDamping = true; controls.dampingFactor = 0.08;
controls.maxPolarAngle = Math.PI * 0.47; controls.minDistance = 12; controls.maxDistance = 1300;
controls.enablePan = false;

const U = {
  uT: { value: 0 }, uK: { value: K }, uR0: { value: R0 }, uTime: { value: 0 },
  uFlameLife: { value: 3 * HOUR }, uSweepR: { value: 0 }, uDay: { value: 0 }, uDusk: { value: 0 },
  uLantern: { value: new THREE.Vector2(0, 0) }, uLR: { value: LANTERN_R },
  uFog: { value: new THREE.Color(0x05070b) }, uFogD: { value: 0.0013 },
  uMonths: { value: new Float32Array(8) }, uCam: { value: new THREE.Vector3() },
};
const FOG = `
uniform vec3 uFog; uniform float uFogD; varying float vDepth;
float fogF(){ return clamp(1.0 - exp(-uFogD*uFogD*vDepth*vDepth), 0.0, 1.0); }
vec3 fogged(vec3 c){ return mix(c, uFog, fogF()); }
vec3 faded(vec3 c){ return c * (1.0 - fogF()); }`;

// ---------- sky: the sun over Berlin, stars at night ----------
const sky = new THREE.Mesh(new THREE.SphereGeometry(2400, 32, 16), new THREE.ShaderMaterial({
  side: THREE.BackSide, depthWrite: false, uniforms: U,
  vertexShader: `varying vec3 vDir; void main(){ vDir = normalize(position); gl_Position = projectionMatrix*modelViewMatrix*vec4(position,1.0); }`,
  fragmentShader: `uniform float uDay; uniform float uDusk; uniform vec3 uFog; varying vec3 vDir;
    float h(vec3 p){ return fract(sin(dot(p, vec3(12.9898,78.233,45.164)))*43758.5453); }
    void main(){
      float y = clamp(vDir.y, 0.0, 1.0);
      vec3 night = mix(vec3(0.012,0.016,0.03), vec3(0.002,0.004,0.012), y);
      vec3 day = mix(vec3(0.33,0.36,0.40), vec3(0.20,0.25,0.33), y);
      vec3 c = mix(night, day, uDay);
      c += vec3(0.55,0.24,0.08) * uDusk * pow(1.0 - y, 6.0);
      vec3 q = floor(vDir * 420.0); float s = h(q);
      c += vec3(0.8,0.85,1.0) * step(0.9975, s) * (1.0 - uDay) * smoothstep(0.03, 0.25, y) * (0.4 + 0.6*h(q+1.0));
      c = mix(uFog, c, smoothstep(0.0, 0.12, y));
      gl_FragColor = vec4(c, 1.0);
    }`,
}));
scene.add(sky);

// ---------- ground: dark earth, the rings of months receding, the present ring ----------
const ground = new THREE.Mesh(new THREE.CircleGeometry(1500, 128), new THREE.ShaderMaterial({
  uniforms: U,
  vertexShader: `varying vec3 vW; varying float vDepth; void main(){ vec4 w = modelMatrix*vec4(position,1.0); vW = w.xyz; vec4 mv = viewMatrix*w; vDepth = -mv.z; gl_Position = projectionMatrix*mv; }`,
  fragmentShader: `uniform float uDay; uniform float uR0; uniform float uT; uniform float uK; uniform float uMonths[8];
    uniform vec2 uLantern; uniform float uLR; uniform float uSweepR; varying vec3 vW; ${FOG}
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
    float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
      return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
    void main(){
      float r = length(vW.xz);
      float g = n(vW.xz*0.08)*0.6 + n(vW.xz*0.5)*0.4;
      vec3 c = mix(vec3(0.010,0.011,0.013), vec3(0.020,0.021,0.022), g);
      c += vec3(0.06,0.065,0.07) * uDay * (0.6 + 0.4*g);
      float now = 1.0 - smoothstep(0.0, 0.35, abs(r - uR0));
      c += vec3(0.20,0.22,0.26) * now * 0.6;
      for (int m = 0; m < 8; m++) {
        if (uMonths[m] <= 0.0) continue;
        float rr = uR0 + uK * uMonths[m];
        c += vec3(0.07,0.075,0.085) * (1.0 - smoothstep(0.0, 0.5, abs(r - rr)));
      }
      float d = length(vW.xz - uLantern);
      c += vec3(0.55,0.36,0.14) * pow(1.0 - smoothstep(0.0, uLR, d), 2.2) * 0.55;
      c += vec3(0.85,0.55,0.22) * (1.0 - smoothstep(0.0, 0.6, abs(d - uLR))) * 0.25;
      float sw = 1.0 - smoothstep(0.0, 3.0, abs(r - uSweepR));
      c += vec3(0.45,0.7,1.0) * sw * step(uSweepR, 5000.0) * step(1.0, uSweepR) * 0.8;
      gl_FragColor = vec4(fogged(c), 1.0);
    }`,
}));
ground.rotation.x = -Math.PI / 2;
scene.add(ground);

// ---------- the record: one instance per commit, embers on the ground and flames above them ----------
const quad = new THREE.InstancedBufferGeometry();
quad.setAttribute('position', new THREE.BufferAttribute(new Float32Array([-1, -1, 0, 1, -1, 0, 1, 1, 0, -1, 1, 0]), 3));
quad.setIndex([0, 1, 2, 0, 2, 3]);
quad.instanceCount = N;
const kinds = new Float32Array(N), reps = new Float32Array(N);
for (let i = 0; i < N; i++) { kinds[i] = C.k[i]; reps[i] = C.r[i]; }
quad.setAttribute('aT', new THREE.InstancedBufferAttribute(tRel, 1));
quad.setAttribute('aTh', new THREE.InstancedBufferAttribute(theta, 1));
quad.setAttribute('aS', new THREE.InstancedBufferAttribute(size, 1));
quad.setAttribute('aKind', new THREE.InstancedBufferAttribute(kinds, 1));
quad.setAttribute('aB', new THREE.InstancedBufferAttribute(breach, 1));
quad.setAttribute('aSeen', new THREE.InstancedBufferAttribute(seenAt, 1));
quad.boundingSphere = new THREE.Sphere(new THREE.Vector3(), 5000);

const COMMON = `
uniform float uT; uniform float uK; uniform float uR0; uniform float uTime; uniform float uFlameLife;
uniform float uSweepR; uniform vec2 uLantern; uniform float uLR; uniform float uDay;
attribute float aT; attribute float aTh; attribute float aS; attribute float aKind; attribute float aB; attribute float aSeen;
varying vec2 vUv; varying float vAge; varying float vKind; varying float vRed; varying float vLit; varying float vSeed; varying float vDepth;
vec3 centre(out float age){ age = uT - aT; float r = uR0 + uK*age; return vec3(cos(aTh)*r, 0.0, sin(aTh)*r); }
void setCommon(vec3 c, float age){
  vUv = position.xy; vAge = age; vKind = aKind; vSeed = fract(aT*0.0137 + aTh*7.31);
  vRed = (aB > 0.5 && uT >= aSeen && (aB > 1.5 || length(c.xz) < uSweepR)) ? 1.0 : 0.0;
  vLit = 1.0 - smoothstep(uLR*0.8, uLR, length(c.xz - uLantern));
}`;

const embers = new THREE.Mesh(quad, new THREE.ShaderMaterial({
  uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending, side: THREE.DoubleSide,
  vertexShader: `${COMMON}
    void main(){
      float age; vec3 c = centre(age); setCommon(c, age);
      if (age < 0.0) { gl_Position = vec4(2.0,2.0,2.0,1.0); return; }
      float fresh = exp(-age / (uFlameLife*1.5));
      float s = aS * (0.42 + 0.5*fresh) * (vRed > 0.5 ? 1.5 : 1.0);
      vec4 w = vec4(c + vec3(position.x*s, 0.25 + aKind*0.02, position.y*s), 1.0);
      vec4 mv = viewMatrix*w; vDepth = -mv.z; gl_Position = projectionMatrix*mv;
    }`,
  fragmentShader: `uniform float uTime; uniform float uFlameLife; uniform float uDay;
    varying vec2 vUv; varying float vAge; varying float vKind; varying float vRed; varying float vLit; varying float vSeed; ${FOG}
    void main(){
      float d = length(vUv); if (d > 1.0) discard;
      float fresh = exp(-vAge / (uFlameLife*1.5));
      float week = exp(-vAge / (7.0*86400.0));
      vec3 cold = vec3(0.45,0.70,1.00), warm = vec3(1.0,0.62,0.22), grey = vec3(0.6,0.62,0.66);
      vec3 col = vKind < 0.5 ? cold : (vKind < 1.5 ? grey : warm);
      float a = (0.45 + 0.6*week + 1.1*fresh) * (vKind > 0.5 && vKind < 1.5 ? 0.5 : 1.0) * (0.8 + 0.2*sin(uTime*0.6 + vSeed*60.0));
      if (vRed > 0.5) { col = vec3(1.0, 0.16, 0.05); a = 1.3 + 0.45*sin(uTime*2.2 + vSeed*40.0); }
      a *= (1.0 + 1.4*vLit) * (1.0 - 0.55*uDay);
      float core = exp(-d*d*10.0) + 0.18*exp(-d*d*2.0);
      vec3 c = col * core * a + vec3(1.0)*exp(-d*d*60.0)*(fresh*0.6 + 0.12);
      gl_FragColor = vec4(faded(c) * (1.0 - smoothstep(0.85,1.0,d)), 1.0);
    }`,
}));
embers.frustumCulled = false;
scene.add(embers);

const flames = new THREE.Mesh(quad, new THREE.ShaderMaterial({
  uniforms: U, transparent: true, depthWrite: false, blending: THREE.AdditiveBlending,
  vertexShader: `${COMMON}
    void main(){
      float age; vec3 c = centre(age); setCommon(c, age);
      float life = exp(-age / uFlameLife);
      if (age < 0.0 || life < 0.02 || aKind > 0.5 && aKind < 1.5 && age > uFlameLife*0.4) { gl_Position = vec4(2.0,2.0,2.0,1.0); return; }
      float hgt = aS * (aKind > 1.5 ? 1.6 : 2.6) * (0.35 + 0.65*life);
      vec4 mv = viewMatrix*vec4(c + vec3(0.0, hgt*0.9, 0.0), 1.0);
      mv.xy += position.xy * vec2(hgt*0.45, hgt);
      vDepth = -mv.z; gl_Position = projectionMatrix*mv;
    }`,
  fragmentShader: `uniform float uTime; uniform float uFlameLife; uniform float uDay;
    varying vec2 vUv; varying float vAge; varying float vKind; varying float vRed; varying float vLit; varying float vSeed; ${FOG}
    float h(vec2 p){ return fract(sin(dot(p, vec2(127.1,311.7)))*43758.5453); }
    float n(vec2 p){ vec2 i=floor(p), f=fract(p); f=f*f*(3.0-2.0*f);
      return mix(mix(h(i),h(i+vec2(1,0)),f.x), mix(h(i+vec2(0,1)),h(i+vec2(1,1)),f.x), f.y); }
    void main(){
      float life = exp(-vAge / uFlameLife);
      vec2 p = vUv; float t = uTime*(vKind > 1.5 ? 0.8 : 2.4) + vSeed*20.0;
      float fl = vKind > 1.5 ? 0.15 : 0.55;
      p.x += (n(vec2(p.y*2.5 - t, vSeed*9.0)) - 0.5) * fl * (p.y + 1.0) * 0.5;
      float w = mix(0.75, 0.05, clamp((p.y + 1.0)*0.5, 0.0, 1.0));
      float body = 1.0 - smoothstep(w*0.15, w, abs(p.x));
      body *= smoothstep(-1.0, -0.6, p.y) * (1.0 - smoothstep(0.4, 1.0, p.y + (n(vec2(p.x*3.0, t))-0.5)*0.6*fl));
      vec3 cold = mix(vec3(0.25,0.45,1.0), vec3(0.85,0.95,1.0), body);
      vec3 warm = mix(vec3(0.9,0.35,0.08), vec3(1.0,0.85,0.55), body);
      vec3 col = vKind < 0.5 ? cold : (vKind < 1.5 ? vec3(0.9) : warm);
      float a = body * life * (1.0 - 0.45*uDay);
      if (vKind > 0.5 && vKind < 1.5) a *= 0.5;
      gl_FragColor = vec4(faded(col*a), 1.0);
    }`,
}));
flames.frustumCulled = false;
scene.add(flames);

// the census ring: cold, travelling outward into the past
const ring = new THREE.Mesh(new THREE.TorusGeometry(1, 0.006, 6, 256), new THREE.MeshBasicMaterial({ color: 0x9fd0ff, transparent: true, opacity: 0.0, blending: THREE.AdditiveBlending, depthWrite: false }));
ring.rotation.x = Math.PI / 2; scene.add(ring);

// threads: from the session of the Atelier that wrote an overrun down, to the overrun it saw
const thrPos = new Float32Array(threads.length * 6), thrCol = new Float32Array(threads.length * 6);
const thrGeo = new THREE.BufferGeometry();
thrGeo.setAttribute('position', new THREE.BufferAttribute(thrPos, 3));
thrGeo.setAttribute('color', new THREE.BufferAttribute(thrCol, 3));
const thrLines = new THREE.LineSegments(thrGeo, new THREE.LineBasicMaterial({ vertexColors: true, transparent: true, blending: THREE.AdditiveBlending, depthWrite: false }));
thrLines.frustumCulled = false; scene.add(thrLines);
function updateThreads(T) {
  threads.forEach((o, k) => {
    const j = o.seen.c, ts = C.t[j];
    const on = T >= ts ? 0.35 + 0.65 * Math.exp(-(T - ts) / (2 * DAY)) : 0;
    const ra = radiusAt(o.c, T), rb = radiusAt(j, T);
    thrPos.set([cs[j] * rb, 1.2, sn[j] * rb, cs[o.c] * ra, 0.6, sn[o.c] * ra], k * 6);
    thrCol.set([1.0 * on, 0.45 * on, 0.3 * on, 0.9 * on, 0.2 * on, 0.1 * on], k * 6);
  });
  thrGeo.attributes.position.needsUpdate = true; thrGeo.attributes.color.needsUpdate = true;
}

// the visitor's lantern
const lamp = new THREE.PointLight(0xffb060, 0, 90, 1.6); lamp.position.set(0, 6, 0); scene.add(lamp);
const lampFlame = new THREE.Mesh(new THREE.SphereGeometry(0.9, 16, 8), new THREE.MeshBasicMaterial({ color: 0xffd9a0 }));
scene.add(lampFlame);
const lantern = new THREE.Vector2(0, 0), lanternGoal = new THREE.Vector2(0, 0);

// ---------- time ----------
const CENSUS_NIGHT = CENSUS - (22 * HOUR + 29 * 60) - HOUR;   // 00:00 in Berlin, the night of the census
const END = Math.max(T1, S.recount) + 2 * HOUR;
const st = { T: 0, playing: true, secPerDay: 10, sweep: null, swept: false, last: performance.now() };
const months = [];
for (let y = 2026, m = 7; ; m++) { if (m > 12) { m = 1; y++; } const t = Date.UTC(y, m - 1, 1) / 1000; if (t > T1) break; if (t > T0) months.push(t); }

function sunElevation(unix) {     // degrees, Berlin (52.52 N, 13.40 E); a standard low-precision formula
  const rad = Math.PI / 180, d = unix / DAY - 10957.5;
  const g = (357.529 + 0.98560028 * d) * rad, q = 280.459 + 0.98564736 * d;
  const L = (q + 1.915 * Math.sin(g) + 0.02 * Math.sin(2 * g)) * rad, e = (23.439 - 0.00000036 * d) * rad;
  const ra = Math.atan2(Math.cos(e) * Math.sin(L), Math.cos(L)), dec = Math.asin(Math.sin(e) * Math.sin(L));
  const gmst = ((18.697374558 + 24.06570982441908 * d) % 24 + 24) % 24;
  const ha = (gmst * 15 + 13.40) * rad - ra, lat = 52.52 * rad;
  return Math.asin(Math.sin(lat) * Math.sin(dec) + Math.cos(lat) * Math.cos(dec) * Math.cos(ha)) / rad;
}

const fmtBerlin = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', weekday: 'short', day: 'numeric', month: 'long', year: 'numeric' });
const fmtHour = new Intl.DateTimeFormat('en-GB', { timeZone: 'Europe/Berlin', hour: '2-digit', minute: '2-digit', hour12: false });
const fmtUTC = new Intl.DateTimeFormat('en-GB', { timeZone: 'UTC', day: 'numeric', month: 'short', hour: '2-digit', minute: '2-digit', hour12: false });

// ---------- sound: each signed deed is heard where it lies ----------
let ac = null, master, windG, windF, voices = [], lastVoice = 0;
const PITCH = [659.3, 440.0, 523.3, 196.0];       // the Studio, the Field, the Atelier, the Middle
function startSound() {
  if (ac) return;
  ac = new (window.AudioContext || window.webkitAudioContext)();
  master = ac.createGain(); master.gain.value = 0.9; master.connect(ac.destination);
  const len = ac.sampleRate * 3, buf = ac.createBuffer(1, len, ac.sampleRate), ch = buf.getChannelData(0);
  let b = 0; for (let i = 0; i < len; i++) { b = 0.985 * b + 0.015 * (Math.random() * 2 - 1); ch[i] = b * 7; }
  const src = ac.createBufferSource(); src.buffer = buf; src.loop = true; src.start();
  windF = ac.createBiquadFilter(); windF.type = 'bandpass'; windF.frequency.value = 380; windF.Q.value = 0.6;
  windG = ac.createGain(); windG.gain.value = 0.12; src.connect(windF).connect(windG).connect(master);
  const nb = ac.createBuffer(1, ac.sampleRate * 0.4, ac.sampleRate), nc = nb.getChannelData(0);
  for (let i = 0; i < nc.length; i++) nc[i] = (Math.random() * 2 - 1) * Math.pow(1 - i / nc.length, 3);
  voices.noise = nb;
}
function voice(i, gainScale = 1) {
  if (!ac || !$('snd').checked) return;
  const now = ac.currentTime; if (now - lastVoice < 0.045) return; lastVoice = now;
  const r = radiusAt(i, st.T), x = cs[i] * r, z = sn[i] * r;
  const p = ac.createPanner(); p.panningModel = 'HRTF'; p.distanceModel = 'inverse'; p.refDistance = 18; p.rolloffFactor = 1.1;
  p.positionX ? (p.positionX.value = x, p.positionY.value = 1, p.positionZ.value = z) : p.setPosition(x, 1, z);
  p.connect(master);
  const k = C.k[i], amp = Math.min(1, 0.25 + Math.log10(1 + C.l[i]) * 0.2) * gainScale;
  if (k === 0) {            // a machine's name: a breath of cold noise and a glass tone of its practice
    const s = ac.createBufferSource(); s.buffer = voices.noise;
    const f = ac.createBiquadFilter(); f.type = 'bandpass'; f.frequency.value = 2600 + Math.random() * 1600; f.Q.value = 1.2;
    const g = ac.createGain(); g.gain.value = 0.5 * amp; s.connect(f).connect(g).connect(p); s.start(now);
    const o = ac.createOscillator(), og = ac.createGain(); o.type = 'sine'; o.frequency.value = PITCH[C.r[i]] * (1 + (Math.random() - 0.5) * 0.004);
    og.gain.setValueAtTime(0.0001, now); og.gain.exponentialRampToValueAtTime(0.16 * amp, now + 0.02); og.gain.exponentialRampToValueAtTime(0.0001, now + 1.8);
    o.connect(og).connect(p); o.start(now); o.stop(now + 1.9);
  } else if (k === 1) {     // a workflow: a dry click
    const o = ac.createOscillator(), g = ac.createGain(); o.type = 'square'; o.frequency.value = 2400;
    g.gain.setValueAtTime(0.05 * amp, now); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.03);
    o.connect(g).connect(p); o.start(now); o.stop(now + 0.04);
  } else {                  // the architect's name: a low warm bell
    [[196, 0.22], [493, 0.07], [784, 0.03]].forEach(([fq, a]) => {
      const o = ac.createOscillator(), g = ac.createGain(); o.frequency.value = fq;
      g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(a * amp, now + 0.01); g.gain.exponentialRampToValueAtTime(0.0001, now + 3.2);
      o.connect(g).connect(p); o.start(now); o.stop(now + 3.3);
    });
  }
}
function sweepSound() {
  if (!ac || !$('snd').checked) return;
  const now = ac.currentTime, o = ac.createOscillator(), g = ac.createGain();
  o.type = 'triangle'; o.frequency.setValueAtTime(260, now); o.frequency.exponentialRampToValueAtTime(1500, now + 6);
  g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.09, now + 0.6); g.gain.exponentialRampToValueAtTime(0.0001, now + 6.4);
  o.connect(g).connect(master); o.start(now); o.stop(now + 6.5);
}
function tock(i) {
  if (!ac || !$('snd').checked) return;
  const now = ac.currentTime, r = radiusAt(i, st.T);
  const p = ac.createStereoPanner ? ac.createStereoPanner() : null;
  const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(110, now); o.frequency.exponentialRampToValueAtTime(55, now + 0.5);
  g.gain.setValueAtTime(0.0001, now); g.gain.exponentialRampToValueAtTime(0.16, now + 0.005); g.gain.exponentialRampToValueAtTime(0.0001, now + 0.7);
  if (p) { p.pan.value = Math.max(-1, Math.min(1, cs[i])); o.connect(g).connect(p).connect(master); } else o.connect(g).connect(master);
  o.start(now); o.stop(now + 0.8);
}

// ---------- the clock ----------
let fired = 0;                                    // index of the next commit to sound
const idxAt = T => { let lo = 0, hi = N; while (lo < hi) { const m = (lo + hi) >> 1; if (C.t[m] <= T) lo = m + 1; else hi = m; } return lo; };
function setT(T, silent) { st.T = T; fired = idxAt(T); if (silent) {} }
function startSweep() {
  st.sweep = { start: performance.now(), dur: 6500, reached: new Set() };
  st.playing = false; sweepSound();
  $('note').textContent = 'A machine reads the record: the Field’s census of every written limit it can count, back to the first commit.';
}
function step(dtReal) {
  if (st.sweep) {
    const f = Math.min(1, (performance.now() - st.sweep.start) / st.sweep.dur);
    const R = R0 + (RMAX - R0 + 20) * (f * f * (3 - 2 * f));
    U.uSweepR.value = R;
    for (const b of S.breaches) if (!st.sweep.reached.has(b.c) && radiusAt(b.c, st.T) < R) { st.sweep.reached.add(b.c); if (st.sweep.reached.size % 2 === 1) tock(b.c); }
    ring.scale.setScalar(R); ring.material.opacity = 0.9 * (1 - f * f);
    if (f >= 1) { st.sweep = null; st.swept = true; st.playing = true; ring.material.opacity = 0; }
    return;
  }
  if (st.playing) {
    const prev = st.T;
    st.T = Math.min(END, st.T + dtReal * DAY / st.secPerDay);
    if (prev < CENSUS && st.T >= CENSUS && !st.swept) { st.T = CENSUS; startSweep(); }
    let n = 0;
    while (fired < N && C.t[fired] <= st.T) { if (n++ < 6) voice(fired); fired++; }
    if (st.T >= END) { st.playing = false; $('play').textContent = 'Run'; }
  }
  U.uSweepR.value = st.sweep ? U.uSweepR.value : (st.T >= CENSUS ? 1e6 : 0);
}

// ---------- HUD ----------
function hud() {
  const d = new Date(st.T * 1000), el = sunElevation(st.T);
  $('date').textContent = fmtBerlin.format(d);
  $('hour').textContent = fmtHour.format(d) + ' in Berlin';
  const T = st.T, lo = idxAt(T - 3 * HOUR), hi = idxAt(T);
  let m = 0, w = 0, a = 0; for (let i = lo; i < hi; i++) { if (C.k[i] === 0) m++; else if (C.k[i] === 1) w++; else a++; }
  if (!st.sweep && T >= S.recount && T < S.recount + 1.5 * HOUR) {
    $('note').textContent = 'Forty minutes later the Atelier recounts its own digest by the rule it declared, and finds more over its cap than the census did.';
  } else if (!st.sweep) {
    $('note').textContent = m + w + a === 0 ? (T < T0 ? 'Before the first commit.' : 'Nothing is signed in these three hours.')
      : `In the last three hours: ${m} signed with a machine’s name, ${w} by a workflow, ${a} with the architect’s name.`;
  }
  $('t').value = Math.round((T - T0) / HOUR);
  U.uDay.value = THREE.MathUtils.smoothstep(el, -6, 14);
  U.uDusk.value = Math.max(0, 1 - Math.abs(el + 1) / 7);
  U.uFog.value.setRGB(0.02 + 0.25 * U.uDay.value, 0.025 + 0.27 * U.uDay.value, 0.04 + 0.29 * U.uDay.value);
  for (let i = 0; i < 8; i++) U.uMonths.value[i] = i < months.length && T > months[i] ? T - months[i] : 0;
}

// ---------- the lantern reads only where it stands ----------
const ray = new THREE.Raycaster(), mp = new THREE.Vector2(), plane = new THREE.Plane(new THREE.Vector3(0, 1, 0), 0), hitP = new THREE.Vector3();
function groundAt(e) {
  const r = renderer.domElement.getBoundingClientRect();
  mp.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(mp, camera);
  return ray.ray.intersectPlane(plane, hitP) ? hitP : null;
}
function nearest(p) {
  if (lantern.distanceTo(new THREE.Vector2(p.x, p.z)) > LANTERN_R) return -1;
  let best = -1, bd = 9; const hi = idxAt(st.T);
  for (let i = 0; i < hi; i++) {
    const r = radiusAt(i, st.T), dx = cs[i] * r - p.x, dz = sn[i] * r - p.z, d = dx * dx + dz * dz;
    if (d < bd) { bd = d; best = i; }
  }
  return best;
}
const KIND = ['signed with a machine’s name: a model-run session of the practice', 'signed by a workflow of the house: a script, which anyone can run again without a model', 'signed with the architect’s name: he, or a session acting for him; the record does not say which'];
const later = sec => { if (sec >= 1.5 * DAY) return Math.round(sec / DAY) + ' days later'; const h = Math.round(sec / HOUR); return h <= 1 ? 'within the hour' : h + ' hours later'; };
const esc = s => s.replace(/[&<>"]/g, ch => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;' }[ch]));
function card(i) {
  const d = new Date(C.t[i] * 1000), repo = S.repos[C.r[i]];
  const bs = breachOf.get(i) || [];
  const seen = st.T >= CENSUS && (!st.sweep || radiusAt(i, st.T) < U.uSweepR.value);
  let h = `<b>${S.practices[C.r[i]]}</b> · ${fmtBerlin.format(d)}, ${fmtHour.format(d)} in Berlin<br>`;
  h += `<span class="sig">${esc(S.signers[C.g[i]])}</span><br><i>${KIND[C.k[i]]}</i><br>`;
  h += `“${esc(C.s[i])}”<br>${C.f[i]} file${C.f[i] === 1 ? '' : 's'}, ${C.l[i].toLocaleString('en-GB')} lines · <a href="https://github.com/frankbueltge/${repo}/commit/${C.h[i]}" target="_blank" rel="noopener">${C.h[i]}</a>`;
  if (C.b[i]) h += `<br>checked by the census against written rules ${C.b[i] === 1 ? 'once' : C.b[i] + ' times'}`;
  for (const b of bs) h += `<br><span class="red">broke one: ${esc(b.rule)} ${b.v} over a limit of ${b.lim}${b.path ? ' (' + esc(b.path) + ')' : ''}</span>`;
  const o = ownOf.get(i);
  if (o) {
    h += `<br><span class="red">over the Atelier’s own cap, by the count it declared: ${o.n.toLocaleString('en-GB')} words of 2,500 (its digest, run ${o.run} of 15)</span>`;
    if (o.seen) h += `<br>first seen: the Atelier’s own session of ${fmtBerlin.format(new Date(C.t[o.seen.c] * 1000))}, ${later(C.t[o.seen.c] - C.t[i])} (<a href="https://github.com/frankbueltge/ulysses/commit/${C.h[o.seen.c]}" target="_blank" rel="noopener">${C.h[o.seen.c].slice(0, 7)}</a>): the practice reading its own record`;
    else {
      if (o.missed) h += `<br>looked at by its own session of ${fmtBerlin.format(new Date(C.t[o.missed.c] * 1000))}, which wrote that the digest stood under its cap`;
      const t = seenAt[i] + T0;
      h += `<br>first seen: ${t === CENSUS ? 'the Field’s census' : 'the Atelier’s recount'}, ${fmtUTC.format(new Date(t * 1000))} UTC, ${later(t - C.t[i])}`;
    }
  }
  if (bs.length && !o) h += seen ? `<br>first seen: the Field’s census, ${fmtUTC.format(new Date(CENSUS * 1000))} UTC, ${later(CENSUS - C.t[i])}: a machine reading the record` : `<br>not seen by anyone yet, on this clock`;
  h += `<br><span class="dim">which model ran it: not in the record</span>`;
  return h;
}
let downAt = null;
renderer.domElement.addEventListener('pointerdown', e => { downAt = [e.clientX, e.clientY]; });
renderer.domElement.addEventListener('pointerup', e => {
  if (!downAt || Math.hypot(e.clientX - downAt[0], e.clientY - downAt[1]) > 6) return;
  startSound();
  const p = groundAt(e); if (!p) return;
  const i = nearest(p);
  if (i >= 0) { showTip(e, i); return; }
  lanternGoal.set(p.x, p.z); $('tip').hidden = true;
});
renderer.domElement.addEventListener('pointermove', e => {
  if (e.pointerType !== 'mouse') return;
  const p = groundAt(e); if (!p) { $('tip').hidden = true; return; }
  const i = nearest(p); if (i < 0) { $('tip').hidden = true; renderer.domElement.style.cursor = 'crosshair'; return; }
  renderer.domElement.style.cursor = 'pointer'; showTip(e, i);
});
function showTip(e, i) {
  const r = renderer.domElement.getBoundingClientRect(), tip = $('tip');
  tip.innerHTML = card(i); tip.hidden = false;
  const x = Math.min(e.clientX - r.left + 14, r.width - tip.offsetWidth - 8), y = Math.min(e.clientY - r.top + 10, r.height - tip.offsetHeight - 8);
  tip.style.left = Math.max(8, x) + 'px'; tip.style.top = Math.max(8, y) + 'px';
}

// ---------- controls ----------
$('t').max = Math.round((END - T0) / HOUR);
$('t').addEventListener('input', () => { const T = T0 + Number($('t').value) * HOUR; setT(T); st.swept = T >= CENSUS; st.sweep = null; ring.material.opacity = 0; });
$('play').addEventListener('click', () => { startSound(); if (st.T >= END) setT(T0 - 6 * HOUR); st.playing = !st.playing; $('play').textContent = st.playing ? 'Pause' : 'Run'; });
document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
  startSound();
  const go = b.dataset.go;
  if (go === 'first') { setT(T0 - 6 * HOUR); st.secPerDay = 2; st.swept = false; }
  else if (go === 'census') { setT(CENSUS_NIGHT); st.secPerDay = 10; st.swept = false; }
  st.sweep = null; ring.material.opacity = 0; st.playing = true; $('play').textContent = 'Pause';
  document.getElementById('stage').scrollIntoView({ behavior: 'smooth' });
}));
$('snd').addEventListener('change', () => { startSound(); if (ac) master.gain.value = $('snd').checked ? 0.9 : 0; });
window.addEventListener('keydown', e => { if (e.key === ' ' && e.target === document.body) { e.preventDefault(); $('play').click(); } });

// ---------- loop ----------
function resize() { const w = host.clientWidth, h = host.clientHeight; renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix(); }
window.addEventListener('resize', resize); resize();
window.__SH = { st, setT, radiusAt, idxAt, lantern, U, scene, embers, flames, ground, renderer, renderOnce: () => renderer.render(scene, camera), camera, controls };

function frame(now) {
  const dt = Math.min(0.1, (now - st.last) / 1000); st.last = now;
  step(dt); hud();
  // the lantern walks, no faster than a person
  const dv = new THREE.Vector2().subVectors(lanternGoal, lantern), dl = dv.length();
  if (dl > 0.05) { const stepL = Math.min(dl, WALK * dt); lantern.addScaledVector(dv.normalize(), stepL); controls.target.x += (lantern.x - controls.target.x) * 0.08; controls.target.z += (lantern.y - controls.target.z) * 0.08; }
  U.uLantern.value.copy(lantern);
  lamp.position.set(lantern.x, 6, lantern.y); lamp.intensity = 40 * (1 - 0.6 * U.uDay.value);
  lampFlame.position.set(lantern.x, 3.2 + Math.sin(now / 300) * 0.08, lantern.y);
  U.uTime.value = now / 1000; U.uT.value = st.T - T0; updateThreads(st.T);
  U.uFlameLife.value = Math.max(3 * HOUR, (DAY / st.secPerDay) * 0.9);
  if (ac && windG) { const night = 1 - U.uDay.value; windG.gain.setTargetAtTime($('snd').checked ? 0.06 + 0.12 * night : 0, ac.currentTime, 0.3); }
  if (ac && ac.listener.positionX) { ac.listener.positionX.value = camera.position.x; ac.listener.positionY.value = camera.position.y; ac.listener.positionZ.value = camera.position.z;
    const fw = new THREE.Vector3(); camera.getWorldDirection(fw); ac.listener.forwardX.value = fw.x; ac.listener.forwardY.value = fw.y; ac.listener.forwardZ.value = fw.z; ac.listener.upX.value = 0; ac.listener.upY.value = 1; ac.listener.upZ.value = 0; }
  controls.update();
  renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
setT(CENSUS_NIGHT);
hud();
requestAnimationFrame(frame);
document.documentElement.dataset.ready = '1';
