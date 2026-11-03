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
const camera = new THREE.PerspectiveCamera(42, 1, 0.1, 400);
camera.position.set(0, 21, 33);
const controls = new OrbitControls(camera, renderer.domElement);
controls.target.set(0, 1.2, 0); controls.enableDamping = true;
controls.maxPolarAngle = Math.PI * 0.47; controls.minDistance = 6; controls.maxDistance = 80;
controls.autoRotateSpeed = 0.35;

const SKY_CLEAR = new THREE.Color('#0d1626'), SKY_FOG = new THREE.Color('#b9b3a6'), SKY_DARK = new THREE.Color('#020203');
scene.background = SKY_CLEAR.clone();
scene.fog = new THREE.FogExp2(SKY_FOG.clone(), 0.001);
const hemi = new THREE.HemisphereLight('#c9d4e6', '#2a2219', 1.1); scene.add(hemi);
const sun = new THREE.DirectionalLight('#fff4e0', 1.6); sun.position.set(-18, 30, 12); scene.add(sun);

const ground = new THREE.Mesh(new THREE.CircleGeometry(140, 96), new THREE.MeshStandardMaterial({ color: '#2b261f', roughness: 1 }));
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

// ---------- zones on a field: spiral by the day the file first wrote them ----------
const order = D.zones.map((z, i) => i).sort((a, b) => D.zones[a].first - D.zones[b].first || D.zones[b].cum[N - 1] - D.zones[a].cum[N - 1]);
const GA = Math.PI * (3 - Math.sqrt(5));
const moundGeo = new THREE.CylinderGeometry(0.5, 0.78, 1, 24, 1);
moundGeo.translate(0, 0.5, 0);
const ringGeo = new THREE.RingGeometry(0.85, 1.15, 40);
const Z = [];
order.forEach((zi, k) => {
  const z = D.zones[zi], r = 2.4 * Math.sqrt(k + 0.6), a = k * GA;
  const x = r * Math.cos(a), y = r * Math.sin(a);
  const mound = new THREE.Mesh(moundGeo, new THREE.MeshStandardMaterial({ color: '#ece6d8', roughness: 0.85 }));
  mound.position.set(x, 0, y); mound.userData.zi = zi; scene.add(mound);
  const ring = new THREE.Mesh(ringGeo, new THREE.MeshBasicMaterial({ color: '#3a3833', side: THREE.DoubleSide }));
  ring.rotation.x = -Math.PI / 2; ring.position.set(x, 0.02, y); scene.add(ring);
  // mist: 140 grains in a dome, drawn only on days the file wrote suspicion for this zone
  const P = 140, pos = new Float32Array(P * 3);
  for (let i = 0; i < P; i++) {
    const u = Math.random() * Math.PI * 2, v = Math.acos(Math.random()), rr = 0.6 + Math.random() * 1.5;
    pos[i * 3] = rr * Math.sin(v) * Math.cos(u); pos[i * 3 + 1] = 0.3 + rr * Math.cos(v) * 1.3; pos[i * 3 + 2] = rr * Math.sin(v) * Math.sin(u);
  }
  const pg = new THREE.BufferGeometry(); pg.setAttribute('position', new THREE.BufferAttribute(pos, 3));
  const mist = new THREE.Points(pg, new THREE.PointsMaterial({ map: SOFT, color: '#e7d7b4', size: 1.1, transparent: true, opacity: 0, depthWrite: false }));
  mist.position.set(x, 0, y); scene.add(mist);
  const lamp = new THREE.Sprite(new THREE.SpriteMaterial({ map: SOFT, color: '#ffc861', transparent: true, opacity: 0, depthWrite: false }));
  lamp.scale.set(1.3, 1.3, 1); scene.add(lamp);
  const embers = [];
  z.breaks.forEach((b, j) => {
    const e = new THREE.Mesh(new THREE.RingGeometry(1.25 + j * 0.22, 1.36 + j * 0.22, 40), new THREE.MeshBasicMaterial({ color: '#d2442f', side: THREE.DoubleSide, transparent: true, opacity: 0 }));
    e.rotation.x = -Math.PI / 2; e.position.set(x, 0.03, y); scene.add(e); embers.push([b, e]);
  });
  // last rise on or before each day, so the quiet can be read
  const lastRise = []; let lr = -1;
  for (let i = 0; i < N; i++) { if (i === 0 ? z.cum[0] > 0 : z.cum[i] > z.cum[i - 1]) lr = i; lastRise.push(lr); }
  Z.push({ z, mound, ring, mist, lamp, embers, lastRise, x, y });
});

// the province haze: the reports' tables, standing outside the file's field
const band = new THREE.Mesh(new THREE.CylinderGeometry(70, 70, 7, 96, 1, true),
  new THREE.MeshBasicMaterial({ color: '#c79b52', transparent: true, opacity: 0, side: THREE.BackSide, depthWrite: false, fog: false }));
band.position.y = 3.5; scene.add(band);

// ---------- one day ----------
let day = 0;
const MOSS = new THREE.Color('#6e9a52'), BARE = new THREE.Color('#3a3833');
function setDay(d) {
  day = Math.max(0, Math.min(N - 1, d | 0));
  const nat = D.national_suspects[day], dark = absent.has(day), dim = untr.has(day);
  let fogZones = 0, lit = 0;
  for (const o of Z) {
    const c = o.z.cum[day], h = c > 0 ? 0.12 + 0.085 * Math.sqrt(c) : 0.04;
    o.mound.scale.set(1, h, 1);
    const s = o.z.susp[day];
    o.mist.material.opacity = s > 0 ? Math.min(0.85, 0.18 + 0.15 * Math.log10(s + 1)) : 0;
    if (s > 0) fogZones++;
    const lr = o.lastRise[day], q = lr >= 0 ? day - lr : -1;
    o.ring.material.color.copy(BARE).lerp(MOSS, q < 0 ? 0 : Math.min(1, q / Q));
    const on = q >= Q && o.z.name !== 'NA';
    o.lamp.material.opacity = on ? 0.95 : 0; o.lamp.position.set(o.x, h + 0.9, o.y);
    if (on) lit++;
    for (const [b, e] of o.embers) e.material.opacity = day >= b ? 0.9 : 0;
    o.q = q;
  }
  // the national row is a count of suspects standing open, not located: it is the air itself
  const f = nat == null ? 0 : nat / NAT_PEAK;
  scene.fog.density = nat == null ? 0.001 : 0.007 + 0.024 * f;
  const sky = SKY_CLEAR.clone().lerp(SKY_FOG, nat == null ? 0 : 0.35 + 0.65 * f);
  const light = dark ? 0.1 : dim ? 0.4 : 1;
  scene.background.copy(sky).lerp(SKY_DARK, 1 - light);
  scene.fog.color.copy(scene.background);
  hemi.intensity = 1.1 * light; sun.intensity = 1.6 * light;
  band.material.opacity = prov.has(day) && !dark ? 0.3 : 0;
  air = { nat, fogZones, prov: prov.has(day), dark, dim };
  readout(lit);
  sound();
  $('day').value = day;
}
let air = {};

function fmt(n) { return n.toLocaleString('en-GB'); }
function readout(lit) {
  const d = new Date(D.days[day] + 'T00:00Z');
  $('date').textContent = d.toLocaleDateString('en-GB', { day: 'numeric', month: 'long', year: 'numeric', timeZone: 'UTC' });
  let s;
  if (air.dark) s = 'No report was published for this day. The file carries yesterday’s numbers.';
  else if (air.dim) s = 'A report exists for this day, but the file never transcribed it.';
  else if (air.fogZones) s = `Fog over ${air.fogZones} zone${air.fogZones > 1 ? 's' : ''}: the file wrote suspected cases, deaths or contacts there.` + (air.nat != null ? ` And haze everywhere: ${fmt(air.nat)} suspects standing open, placed nowhere.` : '');
  else if (air.nat != null) s = `Haze everywhere: ${fmt(air.nat)} suspected cases standing open for the whole country, placed nowhere.`;
  else s = 'Clear air. The file writes nothing today but what a laboratory confirmed.';
  if (air.prov) s += ' On the horizon: a report tabled suspects by province, outside this file.';
  $('air').textContent = s;
  $('conf').textContent = fmt(D.national_confirmed[day]);
  $('lit').textContent = lit;
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
}
function sound() {
  if (!ac || !$('snd').checked) { if (ac) { wind.gain.value = 0; muff.gain.value = 0; } return; }
  const t = ac.currentTime + 0.12;
  const f = air.dark ? 0 : Math.min(1, air.fogZones / 25 + (air.nat == null ? 0 : 0.25 + 0.5 * air.nat / NAT_PEAK));
  wind.gain.linearRampToValueAtTime(0.32 * f, t); windF.frequency.linearRampToValueAtTime(300 + 900 * f, t);
  muff.gain.linearRampToValueAtTime(air.prov && !air.dark ? 0.22 : 0, t);
}

// ---------- hover ----------
const ray = new THREE.Raycaster(), mp = new THREE.Vector2();
renderer.domElement.addEventListener('pointermove', e => {
  const r = renderer.domElement.getBoundingClientRect();
  mp.set(((e.clientX - r.left) / r.width) * 2 - 1, -((e.clientY - r.top) / r.height) * 2 + 1);
  ray.setFromCamera(mp, camera);
  const hit = ray.intersectObjects(Z.map(o => o.mound))[0], tip = $('tip');
  if (!hit) { tip.hidden = true; return; }
  const o = Z.find(o => o.mound === hit.object), z = o.z;
  tip.hidden = false; tip.style.left = (e.clientX - r.left + 14) + 'px'; tip.style.top = (e.clientY - r.top + 10) + 'px';
  tip.innerHTML = `<b>${z.name === 'NA' ? 'a zone the file writes only as “NA”' : z.name}</b><br>${fmt(z.cum[day])} confirmed by this day` +
    (o.q >= 0 ? `<br>${o.q} day${o.q === 1 ? '' : 's'} since its count last rose` : '') +
    (z.susp[day] > 0 ? '<br>suspicion written here today' : '<br>no suspicion written here today') +
    (z.breaks.filter(b => b <= day).length ? `<br>${z.breaks.filter(b => b <= day).length}× a case came after 42 quiet days` : '');
});
renderer.domElement.addEventListener('pointerleave', () => { $('tip').hidden = true; });

// ---------- controls ----------
let playing = false, acc = 0, last = performance.now();
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
  playing = false; $('play').textContent = 'Run the record'; setDay(D.days.indexOf(b.dataset.go));
}));

function resize() {
  const w = host.clientWidth, h = host.clientHeight;
  renderer.setSize(w, h); camera.aspect = w / h; camera.updateProjectionMatrix();
  camera.position.setLength(w < 600 ? 60 : 45);
}
addEventListener('resize', resize); resize();

function frame(now) {
  const dt = now - last; last = now;
  if (playing) { acc += dt; while (acc > STEP) { acc -= STEP; if (day < N - 1) setDay(day + 1); else { playing = false; $('play').textContent = 'Run again'; controls.autoRotate = false; } } }
  for (const o of Z) o.mist.rotation.y += 0.0009 * dt * (o.mist.material.opacity > 0 ? 1 : 0);
  controls.update(); renderer.render(scene, camera);
  requestAnimationFrame(frame);
}
const start = new URLSearchParams(location.search).get('day');
setDay(start ? D.days.indexOf(start) : 12);
requestAnimationFrame(frame);
window.__clearAir = { setDay, get day() { return day; } };
