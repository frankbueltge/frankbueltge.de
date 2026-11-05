// CLEAR AIR — the world. three.js r160 (MIT, vendored in ./vendor), no other library.
import * as THREE from 'three';
import { OrbitControls } from './vendor/OrbitControls.js';

const D = window.CLEAR_AIR, N = D.days.length, Q = 42;
const absent = new Set(D.report_absent), untr = new Set(D.report_untranscribed), prov = new Set(D.province);
const NAT_PEAK = D.facts.national_peak;
const $ = id => document.getElementById(id);

// ---------- scene ----------
const host = $('world');
const renderer = new THREE.WebGLRenderer({ antialias: true, preserveDrawingBuffer: true });
renderer.setPixelRatio(Math.min(devicePixelRatio, 2));
host.appendChild(renderer.domElement);
const scene = new THREE.Scene();
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 600);
camera.position.set(4, 36, 44);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(11, 0.5, 6); controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.47; controls.minDistance = 6; controls.maxDistance = 160;
controls.autoRotateSpeed = 0.35;

const SKY_CLEAR = new THREE.Color('#0d1626'), SKY_FOG = new THREE.Color('#b9b3a6'), SKY_DARK = new THREE.Color('#020203');
scene.background = SKY_CLEAR.clone();
scene.fog = new THREE.FogExp2(SKY_FOG.clone(), 0.001);
const hemi = new THREE.HemisphereLight('#c9d4e6', '#2a2219', 1.1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff4e0', 1.6); sun.position.set(-18, 30, 12); scene.add(sun);

const ground = new THREE.Mesh(new THREE.CircleGeometry(200, 96), new THREE.MeshStandardMaterial({ color: '#2b261f', roughness: 1 }));
ground.rotation.x = -Math.PI / 2; scene.add(ground);

// a soft round sprite for mist and lamps
function softTex(inner = 'rgba(255,255,255,1)') {
  const c = document.createElement('canvas'); c.width = c.height = 64;
  const g = c.getContext('2d'), gr = g.createRadialGradient(32, 32, 0, 32, 32, 32);
  gr.addColorStop(0, inner); gr.addColorStop(1, 'rgba(255,255,255,0)');
  g.fillStyle = gr; g.fillRect(0, 0, 64, 64);
  return new THREE.CanvasTexture(c);
}
const SOFT = softTex();

// ---------- the land (increment 2): every health zone of the region, the file's 69 among them ----------
const L = window.CLEAR_AIR_LAND, K = 6, LON0 = 29.6, LAT0 = 1.2;
const P = (lon, lat) => [(lon - LON0) * K, -(lat - LAT0) * K];
const byPc = new Map(L.zones.map(z => [z.pc, z]));
const linePts = [], unwritten = [];
function ringShape(ring) {
  const s = new THREE.Shape();
  ring.forEach(([lon, lat], i) => { const [x, y] = P(lon, lat); i ? s.lineTo(x, -y) : s.moveTo(x, -y); });
  return s;
}
for (const z of L.zones) {
  for (let i = 0; i < z.ring.length - 1; i++) {
    const [a, b] = [P(...z.ring[i]), P(...z.ring[i + 1])];
    linePts.push(a[0], 0.025, a[1], b[0], 0.025, b[1]);
  }
  if (!z.file) unwritten.push(ringShape(z.ring));
}
const flat = g => { g.rotateX(-Math.PI / 2); return g; };

// ---------- static (increment 3): ground over which the record writes no doubt reads as unlooked-at ----------
// grains are scattered over every health zone by area; each zone's grains flicker like a dead channel.
// A named zone loses its static only on days the file writes doubt for it (or for the country);
// the 280 zones the file never names keep a floor of static every day.
const grainPts = [], grainZone = [], grainSeed = [];
function inRing(x, y, pts) {
  let c = false;
  for (let i = 0, j = pts.length - 1; i < pts.length; j = i++) {
    const [xi, yi] = pts[i], [xj, yj] = pts[j];
    if ((yi > y) !== (yj > y) && x < (xj - xi) * (y - yi) / (yj - yi) + xi) c = !c;
  }
  return c;
}
L.zones.forEach((z, li) => {
  const pts = z.ring.map(([lon, lat]) => P(lon, lat));
  let x0 = 1e9, x1 = -1e9, y0 = 1e9, y1 = -1e9, a = 0;
  for (let i = 0; i < pts.length; i++) {
    const [x, y] = pts[i], [u, v] = pts[(i + 1) % pts.length];
    x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); a += x * v - u * y;
  }
  const want = Math.max(4, Math.round(Math.abs(a) / 2 * 3.2));
  for (let k = 0, tries = 0; k < want && tries < want * 40; tries++) {
    const x = x0 + Math.random() * (x1 - x0), y = y0 + Math.random() * (y1 - y0);
    if (!inRing(x, y, pts)) continue;
    grainPts.push(x, 0.07, y); grainZone.push(li); grainSeed.push(Math.random() * 1000); k++;
  }
});
const grainGeo = new THREE.BufferGeometry();
grainGeo.setAttribute('position', new THREE.Float32BufferAttribute(grainPts, 3));
grainGeo.setAttribute('seed', new THREE.Float32BufferAttribute(grainSeed, 1));
const grainA = new Float32Array(grainZone.length);
grainGeo.setAttribute('a', new THREE.BufferAttribute(grainA, 1));
const grainMat = new THREE.ShaderMaterial({
  transparent: true, depthWrite: false,
  uniforms: { uTime: { value: 0 }, uPx: { value: 2.0 * Math.min(devicePixelRatio, 2) } },
  vertexShader: `attribute float seed; attribute float a; uniform float uTime; uniform float uPx; varying float vA; varying float vL;
    void main(){ float t = floor(uTime * 13.0); float f = fract(sin(seed * 12.9898 + t * 78.233) * 43758.5453);
      vA = a * step(0.42, f); vL = 0.55 + 0.45 * fract(f * 7.0);
      gl_PointSize = uPx; gl_Position = projectionMatrix * modelViewMatrix * vec4(position, 1.0); }`,
  fragmentShader: `varying float vA; varying float vL; void main(){ if (vA < 0.01) discard; gl_FragColor = vec4(vec3(vL), vA); }`
});
scene.add(new THREE.Points(grainGeo, grainMat));
const liOfPc = new Map(L.zones.map((z, i) => [z.pc, i]));
scene.add(new THREE.Mesh(flat(new THREE.ShapeGeometry(unwritten)), new THREE.MeshStandardMaterial({ color: '#1d1a15', roughness: 1 })));
const zoneLines = new THREE.BufferGeometry(); zoneLines.setAttribute('position', new THREE.Float32BufferAttribute(linePts, 3));
scene.add(new THREE.LineSegments(zoneLines, new THREE.LineBasicMaterial({ color: '#4a463d', transparent: true, opacity: 0.55 })));
const borderPts = [];
for (const c of L.countries) for (const r of c.rings) for (let i = 0; i < r.length - 1; i++) {
  const [a, b] = [P(...r[i]), P(...r[i + 1])];
  borderPts.push(a[0], 0.05, a[1], b[0], 0.05, b[1]);
}
const borders = new THREE.BufferGeometry(); borders.setAttribute('position', new THREE.Float32BufferAttribute(borderPts, 3));
scene.add(new THREE.LineSegments(borders, new THREE.LineBasicMaterial({ color: '#a89f8c' })));
function label(text, lon, lat, size = 1, color = '#cfc6b2') {
  const c = document.createElement('canvas'), g = c.getContext('2d'); c.width = 512; c.height = 64;
  g.font = '36px Georgia, serif'; g.fillStyle = color; g.textAlign = 'center'; g.textBaseline = 'middle';
  g.fillText(text.split('').join(String.fromCharCode(8202)), 256, 32);
  const s = new THREE.Sprite(new THREE.SpriteMaterial({ map: new THREE.CanvasTexture(c), transparent: true, depthWrite: false, opacity: 0.8 }));
  const [x, y] = P(lon, lat); s.position.set(x, 1.2, y); s.scale.set(8 * size, size, 1); scene.add(s); return s;
}
label('D R  C O N G O', 24.5, -2.2, 2.2); label('U G A N D A', 32.4, 1.6, 1.6); label('K E N Y A', 37.6, 1.0, 1.6);
label('R W A N D A', 29.9, -2.2, 0.9); label('S O U T H  S U D A N', 30.5, 6.0, 1.3); label('T A N Z A N I A', 34.5, -5.2, 1.3);

// ---------- the file's zones, each on its own ground ----------
const moundGeo = new THREE.CylinderGeometry(0.32, 0.5, 1, 20, 1);
moundGeo.translate(0, 0.5, 0);
const Z = [];
D.zones.forEach((z, zi) => {
  const land = byPc.get(L.file_names[z.name]);
  // the zone the file writes as "NA" has no place: it hangs over the land, on no ground
  const [x, y] = land ? P(...land.c) : P(33.2, 1.6);
  const lift = land ? 0 : 7;
  const mound = new THREE.Mesh(moundGeo, new THREE.MeshStandardMaterial({ color: '#ece6d8', roughness: 0.85 }));
  mound.position.set(x, lift, y); mound.userData.zi = zi; scene.add(mound);
  const ring = new THREE.Mesh(land ? flat(new THREE.ShapeGeometry(ringShape(land.ring))) : flat(new THREE.RingGeometry(0.6, 0.85, 32)),
    new THREE.MeshStandardMaterial({ color: '#3a3833', roughness: 1, side: THREE.DoubleSide }));
  ring.position.y = land ? 0.012 : 0.02; if (!land) ring.position.set(x, lift - 0.01, y);
  scene.add(ring);
  z.prov = land ? land.prov : null;
  // mist: 140 grains in a dome, drawn only on days the file wrote suspicion for this zone
  const NP = 140, pos = new Float32Array(NP * 3);
  for (let i = 0; i < NP; i++) {
    const u = Math.random() * Math.PI * 2, v = Math.acos(Math.random()), rr = 0.4 + Math.random() * 1.1;
    pos[i * 3] = rr * Math.sin(v) * Math.cos(u); pos[i * 3 + 1] = 0.3 + rr * Math.cos(v) * 1.3; pos[i * 3 + 2] = rr * Math.sin(v) * Math.sin(u);
  }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mist = new THREE.Points(pg, new THREE.PointsMaterial({ map: SOFT, color: '#e7d7b4', size: 1.1, transparent: true, opacity: 0, depthWrite: false }));
  mist.position.set(x, lift, y); scene.add(mist);
  // a zone counted quiet at 42 days: a cold, small mark, not a reward
  const lamp = new THREE.Sprite(new THREE.SpriteMaterial({ map: SOFT, color: '#9fb4c8', transparent: true, opacity: 0, depthWrite: false }));
  lamp.scale.set(0.7, 0.7, 1); scene.add(lamp);
  const embers = [];
  z.breaks.forEach((b, j) => {
    const e = new THREE.Mesh(new THREE.RingGeometry(0.62 + j * 0.16, 0.72 + j * 0.16, 40), new THREE.MeshBasicMaterial({ color: '#d2442f', side: THREE.DoubleSide, transparent: true, opacity: 0 }));
    e.rotation.x = -Math.PI / 2; e.position.set(x, lift + 0.03, y); scene.add(e); embers.push([b, e]);
  });
  // last rise on or before each day, so the quiet can be read
  const lastRise = []; let lr = -1;
  for (let i = 0; i < N; i++) { if (i === 0 ? z.cum[0] > 0 : z.cum[i] > z.cum[i - 1]) lr = i; lastRise.push(lr); }
  const lastS = []; { let l = -1; for (let i = 0; i < N; i++) { if (z.susp[i] > 0) l = i; lastS.push(l); } }
  Z.push({ z, mound, ring, mist, lamp, embers, lastRise, lastS, x, y, lift, li: land ? liOfPc.get(land.pc) : null });
});

// ---------- Kenya, across the border: not in the file, written from what the WHO and ECDC published ----------
// confirmed: 1 from 6 Oct (WHO AFRO, 26 Oct); 9 by the last case, reported 20 Oct (ECDC, 30 Oct). The steps between are not drawn.
// contacts in quarantine are written every day from 6 Oct to the end (98 remained on 26 Oct, WHO AFRO): Kenya's doubt is never unwritten.
const KE = { from: D.days.indexOf('2026-10-06'), full: D.days.indexOf('2026-10-20') };
const [kx, ky] = P(...L.nairobi);
const keMound = new THREE.Mesh(moundGeo, new THREE.MeshStandardMaterial({ color: '#ece6d8', roughness: 0.85 }));
keMound.position.set(kx, 0, ky); keMound.userData.kenya = true; scene.add(keMound);
const keGrains = 220, kpos = new Float32Array(keGrains * 3);
for (let i = 0; i < keGrains; i++) {
  const u = Math.random() * Math.PI * 2, v = Math.acos(Math.random()), rr = 0.5 + Math.random() * 1.8;
  kpos[i * 3] = rr * Math.sin(v) * Math.cos(u); kpos[i * 3 + 1] = 0.3 + rr * Math.cos(v) * 1.2; kpos[i * 3 + 2] = rr * Math.sin(v) * Math.sin(u);
}
const kg = new THREE.BufferGeometry(); kg.setAttribute('position', new THREE.BufferAttribute(kpos, 3));
const keMist = new THREE.Points(kg, new THREE.PointsMaterial({ map: SOFT, color: '#e7d7b4', size: 1.0, transparent: true, opacity: 0, depthWrite: false }));
keMist.position.set(kx, 0, ky); scene.add(keMist);
label('Nairobi', L.nairobi[0], L.nairobi[1] - 0.55, 0.9, '#e7d7b4');
{ const s = label('the zone written “NA”: nowhere', 33.2, 1.6, 0.8, '#9c968a'); s.position.y = 8.6; }

// the province haze: the reports' tables, standing outside the file's field
// increment 3: a wall, not a tint. Its texture is ruled like a tally sheet, because each day it stands a report tabled suspects.
const wallTex = (() => {
  const c = document.createElement('canvas'); c.width = 1024; c.height = 128; const g = c.getContext('2d');
  const gr = g.createLinearGradient(0, 0, 0, 128); gr.addColorStop(0, 'rgba(227,178,92,0)'); gr.addColorStop(0.35, 'rgba(227,178,92,0.75)'); gr.addColorStop(1, 'rgba(199,155,82,1)');
  g.fillStyle = gr; g.fillRect(0, 0, 1024, 128);
  g.strokeStyle = 'rgba(40,28,10,0.55)'; g.lineWidth = 2;
  for (let x = 0; x < 1024; x += 9) { const h = 40 + ((x * 37) % 60); g.beginPath(); g.moveTo(x + 0.5, 128); g.lineTo(x + 0.5, 128 - h); g.stroke(); }
  const t = new THREE.CanvasTexture(c); t.wrapS = THREE.RepeatWrapping; t.repeat.set(6, 1); return t;
})();
const band = new THREE.Mesh(new THREE.CylinderGeometry(56, 56, 28, 160, 1, true),
  new THREE.MeshBasicMaterial({ map: wallTex, transparent: true, opacity: 0, side: THREE.BackSide, depthWrite: false, fog: false }));
band.position.set(11, 14, 6); scene.add(band);

// ---------- one day ----------
let day = 0;
const BARE = new THREE.Color('#3a3833');
// the last day on or before each day that the file wrote any doubt for the country (the haze)
const lastNat = []; { let l = -1; for (let i = 0; i < N; i++) { if (D.national_suspects[i] != null) l = i; lastNat.push(l); } }
const BLIND_RAMP = 21; // static comes up over three weeks once nothing uncertain is written
const ramp = since => since < 0 ? 1 : Math.min(1, since / BLIND_RAMP);
function setDay(d) {
  day = Math.max(0, Math.min(N - 1, d | 0));
  const nat = D.national_suspects[day], dark = absent.has(day), dim = untr.has(day);
  let fogZones = 0, lit = 0;
  for (const o of Z) {
    const c = o.z.cum[day], h = c > 0 ? 0.12 + 0.085 * Math.sqrt(c) : 0.04;
    o.mound.scale.set(1, h, 1); o.h0 = h;
    const s = o.z.susp[day];
    o.mist.material.opacity = s > 0 ? Math.min(0.85, 0.18 + 0.15 * Math.log10(s + 1)) : 0;
    if (s > 0) fogZones++;
    const lr = o.lastRise[day], q = lr >= 0 ? day - lr : -1;
    // the zone's last written doubt: its own fog or the country's haze
    const ld = Math.max(o.lastS[day], lastNat[day]);
    o.blind = s > 0 ? 0 : ramp(ld < 0 ? -1 : day - ld);
    const on = q >= Q && o.z.name !== 'NA';
    o.lamp.material.opacity = on ? 0.55 : 0; o.lamp.position.set(o.x, o.lift + h + 0.7, o.y);
    if (on) lit++;
    for (const [b, e] of o.embers) e.material.opacity = day >= b ? 0.9 : 0;
    o.q = q;
  }
  // static over the land
  const natHaze = nat == null ? 0 : nat / NAT_PEAK;
  const blindNat = ramp(lastNat[day] < 0 ? -1 : day - lastNat[day]);
  const zoneBlind = new Float32Array(L.zones.length);
  for (let i = 0; i < L.zones.length; i++) zoneBlind[i] = L.zones[i].file ? blindNat : Math.max(0.3, blindNat);
  for (const o of Z) if (o.li != null) zoneBlind[o.li] = o.blind;
  const k = dark ? 0 : dim ? 0.35 : (1 - 0.75 * natHaze);
  for (let i = 0; i < grainA.length; i++) grainA[i] = 0.62 * k * zoneBlind[grainZone[i]];
  grainGeo.attributes.a.needsUpdate = true;
  let blindSum = 0; for (const o of Z) blindSum += o.blind; air_blind = blindSum / Z.length;
  const ke = day < KE.from ? 0 : day < KE.full ? 1 : 9;
  keMound.scale.set(1, ke ? 0.12 + 0.085 * Math.sqrt(ke) : 0.001, 1); keMound.visible = ke > 0;
  keMist.material.opacity = ke ? 0.6 : 0;
  // the national row is a count of suspects standing open, not located: it is the air itself
  const f = nat == null ? 0 : nat / NAT_PEAK;
  scene.fog.density = nat == null ? 0.001 : 0.007 + 0.024 * f;
  const sky = SKY_CLEAR.clone().lerp(SKY_FOG, nat == null ? 0 : 0.35 + 0.65 * f);
  const light = dark ? 0.1 : dim ? 0.4 : 1;
  scene.background.copy(sky).lerp(SKY_DARK, 1 - light);
  scene.fog.color.copy(scene.background);
  hemi.intensity = 1.1 * light; sun.intensity = 1.6 * light;
  band.material.opacity = prov.has(day) && !dark ? 0.85 : 0;
  // a real blackout on the days with no report; a half-dark one where a report exists but was never transcribed
  const bl = $('black');
  bl.style.opacity = dark ? 0.93 : dim ? 0.62 : 0;
  bl.textContent = dark ? 'No report was published for this day.' : dim ? 'A report exists for this day. The file never transcribed it.' : '';
  air = { nat, fogZones, prov: prov.has(day), dark, dim, ke, blind: blindNat };
  readout(lit);
  sound();
  $('day').value = day;
}
let air = {}, air_blind = 0;

function fmt(n) { return n.toLocaleString('en-GB'); }
function readout(lit) {
  const d = new Date(D.days[day] + 'T00:00Z');
  $('date').textContent = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  let s;
  if (air.dark) s = 'No report was published for this day. The file carries yesterday’s numbers.';
  else if (air.dim) s = 'A report exists for this day, but the file never transcribed it.';
  else if (air.fogZones) s = `Fog over ${air.fogZones} zone${air.fogZones > 1 ? 's' : ''}: the file wrote suspected cases, deaths or contacts there.` + (air.nat != null ? ` And haze everywhere: ${fmt(air.nat)} suspects standing open, placed nowhere.` : '');
  else if (air.nat != null) s = `Haze everywhere: ${fmt(air.nat)} suspected cases standing open for the whole country, placed nowhere.`;
  else s = air.blind > 0.5 ? 'Clear air, and static over the land: the file writes nothing today but what a laboratory confirmed, and no doubt about anywhere.' : 'Clear air. The file writes nothing today but what a laboratory confirmed.';
  if (air.prov) s += ' The wall: a report tabled suspects by province, outside this file.';
  if (D.days[day] === '2026-10-09') s += ' Today’s rise of 186 confirmed covers three days: the file was silent on 7 and 8 October, not at zero.';
  if (air.ke) s += air.ke === 1 ? ' Across the border, Nairobi: one confirmed case, imported, and fog over the contacts it is watching. The count rises to nine by 20 October; the steps between are not drawn.' : ' Nairobi: nine confirmed, the eight after the first already contacts in quarantine, and its fog still standing.';
  $('air').textContent = s;
  $('conf').textContent = fmt(D.national_confirmed[day]);
}

// ---------- sound: the wind is the fog ----------
let ac = null, wind, windF, muff;
function startSound() {
  ac = new (window.AudioContext || window.webkitAudioContext)();
  const len = ac.sampleRate * 3, buf = ac.createBuffer(1, len, ac.sampleRate), ch = buf.getChannelData(0);
  let b = 0; for (let i = 0; i < len; i++) { b = 0.98 * b + 0.02 * (Math.random() * 2 - 1); ch[i] = b * 6; }
  const mk = () => { const s = ac.createBufferSource(); s.buffer = buf; s.loop = true; s.start(); return s; };
  windF = ac.createBiquadFilter(); windF.type = 'bandpass'; windF.Q.value = 0.7; windF.frequency.value = 500;
  wind = ac.createGain(); wind.gain.value = 0; mk().connect(windF).connect(wind).connect(ac.destination);
  const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180;
  muff = ac.createGain(); muff.gain.value = 0; mk().connect(lp).connect(muff).connect(ac.destination);
  // the static has a sound too: a thin hiss that comes up as the record stops writing doubt
  const wn = ac.createBuffer(1, ac.sampleRate * 2, ac.sampleRate), wc = wn.getChannelData(0);
  for (let i = 0; i < wc.length; i++) wc[i] = Math.random() * 2 - 1;
  const ws = ac.createBufferSource(); ws.buffer = wn; ws.loop = true; ws.start();
  const hp = ac.createBiquadFilter(); hp.type = 'highpass'; hp.frequency.value = 4200;
  hiss = ac.createGain(); hiss.gain.value = 0; ws.connect(hp).connect(hiss).connect(ac.destination);
  // a single thud for 9 October
  thud = () => { const o = ac.createOscillator(), g = ac.createGain(); o.frequency.setValueAtTime(70, ac.currentTime); o.frequency.exponentialRampToValueAtTime(30, ac.currentTime + 1.2);
    g.gain.setValueAtTime(0.6, ac.currentTime); g.gain.exponentialRampToValueAtTime(0.001, ac.currentTime + 1.6); o.connect(g).connect(ac.destination); o.start(); o.stop(ac.currentTime + 1.7); };
}
let hiss, thud = () => {};
function sound() {
  if (!ac || !$('snd').checked) { if (ac) { wind.gain.value = 0; muff.gain.value = 0; hiss.gain.value = 0; } return; }
  const t = ac.currentTime + 0.12;
  const f = air.dark ? 0 : Math.min(1, air.fogZones / 25 + (air.nat == null ? 0 : 0.25 + 0.5 * air.nat / NAT_PEAK));
  wind.gain.linearRampToValueAtTime(0.32 * f, t); windF.frequency.linearRampToValueAtTime(300 + 900 * f, t);
  muff.gain.linearRampToValueAtTime(air.prov && !air.dark ? 0.4 : 0, t);
  hiss.gain.linearRampToValueAtTime(air.dark ? 0 : 0.05 * air.blind * (air.nat == null ? 1 : 0.3), t);
}

// ---------- hover ----------
const ray = new THREE.Raycaster(), mp = new THREE.Vector2();
renderer.domElement.addEventListener('pointermove', e => {
  const r = renderer.domElement.getBoundingClientRect();
  mp.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(mp, camera);
  const hit = ray.intersectObjects(Z.map(o => o.mound).concat(keMound.visible ? [keMound] : []))[0], tip = $('tip');
  if (!hit) { tip.hidden = true; return; }
  if (hit.object === keMound) {
    tip.hidden = false; tip.style.left = (e.clientX - r.left + 14) + 'px'; tip.style.top = (e.clientY - r.top + 10) + 'px';
    tip.innerHTML = `<b>Nairobi, Kenya</b><br>not in the Congo file; from the WHO and ECDC<br>${air.ke} confirmed${air.ke === 1 ? ' (first, 6 Oct)' : ' (last reported 20 Oct)'}<br>contacts in quarantine: fog every day`;
    return;
  }
  const o = Z.find(o => o.mound === hit.object), z = o.z;
  tip.hidden = false; tip.style.left = (e.clientX - r.left + 14) + 'px'; tip.style.top = (e.clientY - r.top + 10) + 'px';
  tip.innerHTML = `<b>${z.name === 'NA' ? 'a zone the file writes only as “NA”' : z.name}</b>${z.prov ? ' · ' + z.prov : ''}<br>${fmt(z.cum[day])} confirmed by this day` +
    (o.q >= 0 ? `<br>${o.q} day${o.q === 1 ? '' : 's'} since its count last rose` : '') +
    (z.susp[day] > 0 ? '<br>suspicion written here today' : '<br>no suspicion written here today') +
    (z.breaks.filter(b => b <= day).length ? `<br>${z.breaks.filter(b => b <= day).length}× a case came after 42 quiet days` : '');
});
renderer.domElement.addEventListener('pointerleave', () => { $('tip').hidden = true; });

// ---------- controls ----------
let playing = false, acc = 0, last = performance.now(), holdUntil = 0, burst = 0;
// increment 3: the run stops where the record changes what it writes, and says so in the picture
const HOLDS = {
  '2026-05-30': [2200, 'The last day the file writes doubt for any one zone. From tomorrow, suspicion is written only for the country, placed nowhere.'],
  '2026-08-04': [5200, `4 August. The last suspect the file writes. From here the air is clear, and in it ${D.facts.confirmed_after_last_national.toLocaleString('en-GB')} more cases will be confirmed. The epidemic does not end here. The writing of doubt does.`],
  '2026-10-09': [3600, '+186 confirmed at once. Three days in one: the file wrote nothing on 7 and 8 October, not zero.']
};
function card(text, ms) { const c = $('card'); c.textContent = text; c.classList.add('on'); clearTimeout(card.t); card.t = setTimeout(() => c.classList.remove('on'), ms); }
function arrive(d, during) {
  const h = HOLDS[D.days[d]];
  if (h && during) { holdUntil = performance.now() + h[0]; card(h[1], h[0]); }
  if (D.days[d] === '2026-10-09') { burst = 1; thud(); $('flash').classList.remove('on'); void $('flash').offsetWidth; $('flash').classList.add('on'); }
  // black days are held a little, so a blackout is seen as one
  if (during && absent.has(d)) holdUntil = Math.max(holdUntil, performance.now() + 420);
}
const STEP = 260; // ms a day: the record in about 44 seconds
$('day').max = N - 1;
$('day').addEventListener('input', e => { playing = false; $('play').textContent = 'Run the record'; setDay(+e.target.value); });
$('play').addEventListener('click', () => {
  if (!ac && $('snd').checked) startSound();
  playing = !playing; if (playing && day >= N - 1) setDay(0);
  $('play').textContent = playing ? 'Pause' : 'Run the record'; controls.autoRotate = playing;
});
$('snd').addEventListener('change', () => { if ($('snd').checked && !ac) startSound(); sound(); });
document.querySelectorAll('[data-go]').forEach(b => b.addEventListener('click', () => {
  playing = false; $('play').textContent = 'Run the record'; const d = D.days.indexOf(b.dataset.go); setDay(d);
  const h = HOLDS[b.dataset.go]; if (h) card(h[1], h[0]); arrive(d, false);
  $('stage').scrollIntoView({ behavior: 'smooth', block: 'start' });
}));

function resize() {
  const w = host.clientWidth, h = host.clientHeight;
  renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
  const t0 = controls.target.clone(); controls.target.set(w < 600 ? 15 : 11, 0.5, 6); camera.position.add(controls.target).sub(t0);
  camera.position.sub(controls.target).setLength(w < 600 ? 110 : 64).add(controls.target);
}
addEventListener('resize', resize); resize();

function frame(now) {
  const dt = now - last; last = now;
  grainMat.uniforms.uTime.value = now / 1000;
  if (playing && now < holdUntil) acc = 0;
  else if (playing) { acc += dt; while (acc > STEP && now >= holdUntil) { acc -= STEP; if (day < N - 1) { setDay(day + 1); arrive(day, true); } else { playing = false; $('play').textContent = 'Run again'; controls.autoRotate = false; } } }
  if (burst > 0) { burst = Math.max(0, burst - dt / 1400); const b = 1 + 0.6 * burst * burst; for (const o of Z) { o.mound.scale.y = o.h0 * b; } }
  for (const o of Z) o.mist.rotation.y += 0.0009 * dt * (o.mist.material.opacity > 0 ? 1 : 0);
  keMist.rotation.y += 0.0009 * dt;
  controls.update(); renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
const start = new URLSearchParams(location.search).get('day');
setDay(start ? D.days.indexOf(start) : 12);
requestAnimationFrame(frame);
window.__clearAir = { setDay, get day() { return day; }, grains: grainZone.length };
