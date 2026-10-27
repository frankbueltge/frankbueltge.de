// TAKE COVER, AGAIN, increment 4 (session 190): the record whole.
// Every county darkens with its run of empty tornado warnings, one shade per empty warning in a row, and is
// lit red and made pale again when a tornado meets one. The dead stay where they died. Listen: the nation's
// doubt as one drone, the record's answers as bells.
(() => {
const D = window.TCA, R = window.TCA_RECORD, X = window.TCA_TOLL;
const $ = id => document.getElementById(id);
const fmtN = n => n.toLocaleString('en-US');
const T0 = Date.parse(D.t0);
const qs = new URLSearchParams(location.search);
const NC = D.counties.length, NW = D.issue.length;

// the fixed sheet: paper to the dark of the wait, in both themes
const PAPER = [236, 231, 219], DARK = [5, 5, 5], RED = [179, 38, 30];
const shade = r => { const f = r <= 0 ? 0 : 1 - Math.exp(-r / 4.2); return PAPER.map((p, i) => Math.round(p + (DARK[i] - p) * f)); };
const SHADES = Array.from({length: 64}, (_, r) => `rgb(${shade(r).join(',')})`);
const mix = (a, b, f) => `rgb(${a.map((x, i) => Math.round(x + (b[i] - x) * f)).join(',')})`;

// county events: each warning ends in each of its counties, met or empty, in order of its end
const ev = [];
for (let c = 0; c < NC; c++) for (const w of D.counties[c][2]) ev.push([D.issue[w] + D.dur[w], c, D.met[w], w]);
ev.sort((a, b) => a[0] - b[0] || a[3] - b[3] || a[1] - b[1]);
const issueSorted = Array.from(D.issue.keys()).sort((a, b) => D.issue[a] - D.issue[b]);
const END = ev[ev.length - 1][0];
const DEAD = R.dead.slice().sort((a, b) => a[0] - b[0]);
// coda (session 192): the deadliest tornado, which the Field showed carries 29 % of the dead after a run of 3+
const BIG = DEAD.reduce((a, d) => d[1] > a[1] ? d : a, DEAD[0]);
let aside = false;
const OBS = new Set(R.observed);
const wCounties = new Map();
for (let c = 0; c < NC; c++) for (const w of D.counties[c][2]) if (OBS.has(w)) (wCounties.get(w) || wCounties.set(w, []).get(w)).push(c);
const OBSL = R.observed.map(w => [D.issue[w] + D.dur[w], w]).sort((a, b) => a[0] - b[0]);
const bsearch = (arr, t, key) => { let lo = 0, hi = arr.length; while (lo < hi) { const m = (lo + hi) >> 1; key(arr[m]) <= t ? lo = m + 1 : hi = m; } return lo; };

// the map
const HATCH = (() => { try { const c = document.createElement('canvas'); c.width = c.height = 6; const x = c.getContext('2d'); x.fillStyle = '#f7f5ef'; x.fillRect(0, 0, 6, 6); x.strokeStyle = '#cfc7b6'; x.lineWidth = 0.8; x.beginPath(); x.moveTo(0, 6); x.lineTo(6, 0); x.stroke(); return x.createPattern(c, 'repeat'); } catch (e) { return null; } })();
const topo = window.TCA_TOPO;
const canvas = $('map'), ctx = canvas.getContext('2d');
let PHONE = false, K = 1, W = 0, H = 0, paths = [], cent = [], bbox = [], proj = null;
const byFips = new Map(R.fips.map((f, c) => [f, c]));
const feats = topojson.feature(topo, topo.objects.counties).features.filter(f => byFips.has(f.id));
const nation = topojson.mesh(topo, topo.objects.states, (a, b) => a !== b);
const outline = topojson.feature(topo, topo.objects.nation);
let statePath = null, nationPath = null;
function layout() {
  const box = canvas.parentElement.getBoundingClientRect();
  W = Math.round(box.width); PHONE = W < 600; H = Math.round(W * (PHONE ? 0.66 : 0.62)); K = Math.max(0.5, Math.min(1, W / 1000));
  const dpr = Math.min(2, window.devicePixelRatio || 1);
  canvas.width = W * dpr; canvas.height = H * dpr; canvas.style.height = H + 'px';
  ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
  // on a phone the lower 48 fill the width; Alaska and Hawaii fall off the sheet (said under the map)
  proj = PHONE ? d3.geoAlbers().fitExtent([[4, 4], [W - 4, H - 4]], {type: 'MultiPoint', coordinates: [[-124.6, 25], [-67, 49.2], [-97, 24.6]]})
               : d3.geoAlbersUsa().fitExtent([[4, 4], [W - 4, H - 4]], outline);
  const gp = d3.geoPath(proj);
  paths = new Array(NC).fill(null); cent = new Array(NC).fill(null); bbox = new Array(NC).fill(null);
  for (const f of feats) {
    const c = byFips.get(f.id), d = gp(f);
    if (!d) continue;
    paths[c] = new Path2D(d); cent[c] = gp.centroid(f); bbox[c] = gp.bounds(f);
  }
  statePath = new Path2D(gp(nation)); nationPath = new Path2D(gp(outline));
  draw();
}

// state at minute t
let t = END, run = new Int16Array(NC), longest = new Int16Array(NC), lastMet = new Float64Array(NC).fill(-1e12);
let ei = 0, flash = new Float64Array(NC), now = 0, metN = 0, met3 = 0, taken = null, paidHere = 0;
function reset() { run.fill(0); longest.fill(0); lastMet.fill(-1e12); flash.fill(0); ei = 0; metN = 0; met3 = 0; }
function advance(to, live) {
  const bells = [];
  while (ei < ev.length && ev[ei][0] <= to) {
    const [m, c, met] = ev[ei++];
    if (met) { metN++; if (run[c] >= 3) met3++; if (live) { flash[c] = now; if (bells.length < 6) bells.push(run[c]); } run[c] = 0; lastMet[c] = m; }
    else { run[c]++; if (run[c] > longest[c]) longest[c] = run[c]; }
  }
  return bells;
}
function seek(to) { reset(); advance(to, false); t = to; }

let mode = 'now', showObs = true;
function draw() {
  if (!paths.length) return;
  ctx.fillStyle = `rgb(${PAPER.join(',')})`; ctx.fillRect(0, 0, W, H);
  ctx.fillStyle = HATCH || 'rgb(246,243,236)'; ctx.fill(nationPath);
  const active = activeCounties();
  for (let c = 0; c < NC; c++) {
    const p = paths[c]; if (!p) continue;
    const r = mode === 'now' ? run[c] : longest[c];
    const f = flash[c] ? Math.max(0, 1 - (now - flash[c]) / 600) : 0;
    ctx.fillStyle = f > 0 ? mix(shade(r), RED, f) : SHADES[Math.min(63, r)];
    ctx.fill(p);
  }
  ctx.lineWidth = 0.6; ctx.strokeStyle = 'rgba(120,112,98,0.55)'; ctx.stroke(statePath);
  ctx.lineWidth = 1.2; ctx.strokeStyle = 'rgba(29,78,137,0.95)';
  for (const c of active) if (paths[c]) ctx.stroke(paths[c]);
  if (showObs) {
    ctx.lineWidth = K < 0.7 ? 0.7 : 1; ctx.strokeStyle = 'rgba(106,61,154,0.8)';
    for (let i = 0, n = bsearch(OBSL, t, x => x[0]); i < n; i++) {
      const cs = wCounties.get(OBSL[i][1]).filter(c => cent[c]); if (!cs.length) continue;
      const x = cs.reduce((s, c) => s + cent[c][0], 0) / cs.length, y = cs.reduce((s, c) => s + cent[c][1], 0) / cs.length;
      ctx.beginPath(); ctx.arc(x, y, Math.max(1.4, 2.6 * K), 0, 7); ctx.stroke();
    }
  }
  const nd = bsearch(DEAD, t, x => x[0]);
  // the dead: a disc for a year after they died, then a small mark that stays; full red when their warning
  // came after three or more empty ones in their county, pale red otherwise (fewer, or no warning at all)
  for (let i = 0; i < nd; i++) {
    if (aside && DEAD[i] === BIG) continue;
    const [m, k, , c, rb] = DEAD[i]; if (c < 0 || !cent[c]) continue;
    const old = t - m > 525600, deep = rb >= 3;
    ctx.beginPath();
    if (old) {
      ctx.arc(cent[c][0], cent[c][1], (deep ? 1.9 : 1.3) * Math.max(K, 0.8), 0, 7);
      ctx.fillStyle = deep ? 'rgba(179,38,30,0.85)' : 'rgba(179,38,30,0.3)'; ctx.fill();
    } else {
      ctx.arc(cent[c][0], cent[c][1], (1.4 + Math.sqrt(k) * 1.3) * K, 0, 7);
      ctx.fillStyle = deep ? 'rgba(179,38,30,0.95)' : 'rgba(232,150,140,0.85)'; ctx.fill();
      ctx.lineWidth = 0.8; ctx.strokeStyle = 'rgba(255,255,255,0.85)'; ctx.stroke();
    }
  }
  // the county the visitor took below, with the seconds they paid in its dark
  if (taken !== null && paths[taken]) {
    ctx.lineWidth = 4; ctx.strokeStyle = 'rgba(255,255,255,0.9)'; ctx.stroke(paths[taken]);
    ctx.lineWidth = 2; ctx.strokeStyle = '#1c1a17'; ctx.stroke(paths[taken]);
    const [x, y] = cent[taken], label = D.counties[taken][1] + (paidHere ? ` · you sat ${paidHere} s in its dark` : ' · yours below');
    ctx.font = '600 12px system-ui,sans-serif'; const tw = ctx.measureText(label).width;
    const lx = Math.max(4, Math.min(W - tw - 12, x + 8)), ly = Math.max(16, y - 10);
    ctx.fillStyle = 'rgba(28,26,23,0.88)'; ctx.fillRect(lx - 4, ly - 12, tw + 8, 17);
    ctx.fillStyle = '#f4f1ea'; ctx.fillText(label, lx, ly);
  }
  if (hover !== null && paths[hover]) { ctx.lineWidth = 2; ctx.strokeStyle = 'rgb(29,78,137)'; ctx.stroke(paths[hover]); }
  readout();
}
// counties under a warning standing at minute t (a window of recent issues keeps this cheap)
function activeCounties() {
  const out = [], hi = bsearch(issueSorted, t, w => D.issue[w]);
  for (let i = hi - 1; i >= 0 && D.issue[issueSorted[i]] > t - 240; i--) {
    const w = issueSorted[i]; if (D.issue[w] + D.dur[w] > t) for (const c of (W2C[w] || [])) out.push(c);
  }
  return out;
}
const W2C = [];
for (let c = 0; c < NC; c++) for (const w of D.counties[c][2]) (W2C[w] || (W2C[w] = [])).push(c);

const wEnd = Array.from(D.issue.keys()).map(w => D.issue[w] + D.dur[w]).sort((a, b) => a - b);
const wEndMet = Array.from(D.issue.keys()).filter(w => D.met[w]).map(w => D.issue[w] + D.dur[w]).sort((a, b) => a - b);
function readout() {
  const n = bsearch(wEnd, t, x => x), m = bsearch(wEndMet, t, x => x);
  const nd = bsearch(DEAD, t, x => x[0]);
  let dead = 0, deadAfter3 = 0;
  for (let i = 0; i < nd; i++) { if (aside && DEAD[i] === BIG) continue; dead += DEAD[i][1]; if (DEAD[i][4] >= 3) deadAfter3 += DEAD[i][1]; }
  let dark3 = 0, dark10 = 0;
  const arr = mode === 'now' ? run : longest;
  for (let c = 0; c < NC; c++) { if (arr[c] >= 3) dark3++; if (arr[c] >= 10) dark10++; }
  const pc = (a, b) => b ? Math.round(100 * a / b) + ' %' : '—';
  $('wbase').innerHTML = `Of the times a tornado met a county's warning so far, <b>${pc(met3, metN)}</b> came after three or more empty ones there. Of the dead so far, <b>${pc(deadAfter3, dead)}</b> did.${aside ? ' (the deadliest tornado set aside)' : ''}` +
    (nd === DEAD.length ? ` <span class="coda">Coda, 2026-10-22: drawn again tornado by tornado, the dead's share could have been anywhere from <b>${aside ? '21 to 43 %' : '23 to 55 %'}</b>; the hits' share lies inside. ${aside ? 'Without Joplin it is about the hits\' share.' : 'One tornado, Joplin 2011, carries 158 of the ' + fmtN(deadAfter3) + '.'}</span>` : '');
  $('wdate').textContent = new Date(T0 + t * 60000).toISOString().slice(0, 10);
  $('wcount').innerHTML = [
    [fmtN(n), 'tornado warnings answered'],
    [n ? Math.round(100 * (n - m) / n) + ' %' : '—', 'of them empty'],
    [fmtN(dark3), mode === 'now' ? 'counties now three or more empty warnings deep' : 'counties that ever sat three or more empty warnings deep'],
    [fmtN(dark10), mode === 'now' ? 'ten or more deep' : 'ten or more deep, ever'],
    [fmtN(dead), 'killed (final database, to 2024)'],
    [fmtN(deadAfter3), 'of them under a warning that came after three or more empty ones in their county'],
  ].map(([b, s]) => `<div><b>${b}</b><span>${s}</span></div>`).join('');
  $('scrub').value = t;
}

// time
let playing = false, last = 0, rate = +$('speed').value;
function frame(ts) {
  if (!playing) return;
  now = ts;
  const dt = last ? Math.min(100, ts - last) : 16; last = ts;
  const to = Math.min(END, t + rate * dt / 1000);
  const bells = advance(to, true); t = to;
  sound(bells);
  draw();
  if (t >= END) { stop(); return; }
  requestAnimationFrame(frame);
}
function play() { if (t >= END) seek(0); playing = true; last = 0; $('play').textContent = 'Pause'; requestAnimationFrame(frame); }
function stop() { playing = false; $('play').textContent = t >= END ? 'Play the record again' : 'Play'; if (audio) audio.g.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.4); }
$('play').onclick = () => playing ? stop() : play();
$('speed').onchange = () => { rate = +$('speed').value; };
$('scrub').max = END; $('scrub').oninput = () => { seek(+$('scrub').value); draw(); };
$('mode').onchange = () => { mode = $('mode').value; draw(); };
$('obs').onchange = () => { showObs = $('obs').checked; draw(); };
$('aside').onchange = () => { aside = $('aside').checked; draw(); };

// sound: the doubt as a drone, each tornado's answer as a bell pitched by the run it ended
let audio = null;
$('listen').onclick = () => {
  if (audio) { audio.on = !audio.on; $('listen').textContent = audio.on ? 'Silence' : 'Listen'; if (!audio.on) audio.g.gain.setTargetAtTime(0, audio.ctx.currentTime, 0.2); return; }
  try {
    const ac = new (window.AudioContext || window.webkitAudioContext)();
    const g = ac.createGain(); g.gain.value = 0; const lp = ac.createBiquadFilter(); lp.type = 'lowpass'; lp.frequency.value = 180;
    for (const [f, ty] of [[55, 'sawtooth'], [55.4, 'triangle'], [82.4, 'sine']]) { const o = ac.createOscillator(); o.type = ty; o.frequency.value = f; o.connect(lp); o.start(); }
    lp.connect(g); g.connect(ac.destination);
    const bell = ac.createGain(); bell.gain.value = 0.18; bell.connect(ac.destination);
    audio = {ctx: ac, g, lp, bell, on: true};
    $('listen').textContent = 'Silence';
  } catch (e) { $('listen').disabled = true; $('listen').textContent = 'No sound in this browser'; }
};
function sound(bells) {
  if (!audio || !audio.on) return;
  const ac = audio.ctx, warned = NC;
  let d = 0; for (let c = 0; c < NC; c++) if (run[c] >= 3) d++;
  const doubt = d / warned;
  audio.g.gain.setTargetAtTime(Math.min(0.22, doubt * 0.5), ac.currentTime, 0.3);
  audio.lp.frequency.setTargetAtTime(120 + doubt * 900, ac.currentTime, 0.3);
  for (const r of bells) {
    const o = ac.createOscillator(), e = ac.createGain();
    o.type = 'sine'; o.frequency.value = 880 / Math.pow(2, Math.min(r, 36) / 12);
    e.gain.setValueAtTime(0.0001, ac.currentTime); e.gain.exponentialRampToValueAtTime(0.5, ac.currentTime + 0.01);
    e.gain.exponentialRampToValueAtTime(0.0001, ac.currentTime + 0.9);
    o.connect(e); e.connect(audio.bell); o.start(); o.stop(ac.currentTime + 1);
  }
}

// a county under the pointer, and a tap that deals it to the card below
let hover = null;
function at(ev0) {
  const r = canvas.getBoundingClientRect(), x = ev0.clientX - r.left, y = ev0.clientY - r.top;
  const dpr = canvas.width / W;
  for (let c = 0; c < NC; c++) {
    const b = bbox[c]; if (!b || x < b[0][0] || x > b[1][0] || y < b[0][1] || y > b[1][1]) continue;
    ctx.save(); ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    const hit = ctx.isPointInPath(paths[c], x * dpr, y * dpr); ctx.restore();
    if (hit) return c;
  }
  // a fingertip: the nearest county centre within 12 px
  let best = null, bd = 144;
  for (let c = 0; c < NC; c++) { if (!cent[c]) continue; const d = (cent[c][0] - x) ** 2 + (cent[c][1] - y) ** 2; if (d < bd) { bd = d; best = c; } }
  return best;
}
canvas.onmousemove = e => {
  const c = at(e); if (c === hover) return; hover = c;
  const tip = $('tip');
  if (c === null) { tip.textContent = 'Point at a county; tap it to live through its warnings below.'; }
  else tip.textContent = `${D.counties[c][1]}: ${mode === 'now' ? run[c] : longest[c]} empty ${mode === 'now' ? 'in a row as of this day' : 'in a row at its longest'} · ${D.counties[c][2].length} warnings since 2008 · tap to take it`;
  if (!playing) draw();
};
canvas.onmouseleave = () => { hover = null; if (!playing) draw(); };
canvas.onclick = e => {
  const c = at(e); if (c === null || !window.TCA_choose) return;
  window.TCA_choose(D.counties[c][0]);
  $('place').scrollIntoView({behavior: 'smooth', block: 'start'});
};

const S = R.summary, BR = S.dead_by_run_before;
$('wholefacts').innerHTML = `Every county here is shaded by its run: how many tornado warnings in a row had ended there without a tornado, one step darker for each, black past a dozen. When a tornado meets a warning, the county flashes red and goes pale; the record has just answered yes. ${fmtN(S.county_entries_empty)} times an empty warning ended over a county, after ${fmtN(S.county_minutes_issued_empty)} county-minutes issued. The longest run anywhere was ${S.longest_run_anywhere} empty warnings in a row, in ${S.longest_run_county}. On the day the record ends, ${fmtN(S.counties_in_a_run_of_3_or_more_at_the_end)} counties stand three or more deep, ${fmtN(S.counties_in_a_run_of_10_or_more_at_the_end)} ten or more. <br><br>The red discs are the ${fmtN(S.dead)} people the final database says tornadoes killed from 2008 to 2024, at their county. Of them, <b>${fmtN(BR['3-9'] + BR['10+'])}</b> died under a warning that came after three or more empty ones in a row in their county (full red discs), and ${fmtN(BR['10+'])} after ten or more; the line under the map sets that share, as the record plays, beside the share of all the times a tornado met a county's warning that came after three or more empty ones. ${fmtN(BR['0'])} died under a warning that followed a met one, ${fmtN(BR['1-2'])} after one or two empty, and ${fmtN(BR.none)} under no warning at all. Each disc stays a year, then shrinks to a mark that stays. These are the people the question is about: a run of empty warnings was the record they had, and the next one was meant. <br><br>The small violet rings are the Atelier's case (plate IV of <a href="https://github.com/frankbueltge/ulysses/tree/main/artifacts/cycle-009/the-wolfs-ledger">The Wolf's Ledger</a>): ${fmtN(S.atelier_observed_joined_unbacked_here)} warnings from 2015 to 2024 whose own words said a tornado was OBSERVED, and that neither the office's verification nor the final database ever filled. Each sits where its counties are. They are the empty warnings that stated a fact.`;

$('ramp').innerHTML = [0, 3, 6, 9, 12].map(r => `<i style="background:${SHADES[r]}"></i>`).join('');
window.addEventListener('resize', () => { const w = Math.round(canvas.parentElement.getBoundingClientRect().width); if (w !== W) layout(); });
layout();
if (PHONE) { showObs = false; $('obs').checked = false; }
const markNow = () => window.TCA_current && mark(...window.TCA_current());
const cIndex = new Map(D.counties.map((c, i) => [c[0], i]));
function mark(ugc, paid) { taken = cIndex.has(ugc) ? cIndex.get(ugc) : null; paidHere = paid || 0; if (!playing) draw(); }
if (qs.has('at')) seek(Math.min(END, +qs.get('at')));
else {
  // the record plays on arrival, silent, a season a second; the end frame is where it stops
  seek(0); $('speed').value = '131400'; rate = 131400;
  if (typeof IntersectionObserver === 'function') {
    const io = new IntersectionObserver(es => { if (es.some(e => e.isIntersecting)) { io.disconnect(); play(); } }, {threshold: 0.3});
    io.observe(canvas);
  } else play();
}
markNow();
draw();
$('tip').textContent = 'Point at a county; tap it to live through its warnings below.' + (PHONE ? ' Alaska and Hawaii are off this narrow sheet.' : '');
window.TCA_WHOLE = {mark, seek: m => { seek(m); draw(); }, run, longest, END, get t() { return t; }, play, stop, at: (x, y) => at({clientX: x, clientY: y})};
})();
