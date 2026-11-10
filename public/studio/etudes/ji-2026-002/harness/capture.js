// Sampled-frames capture for the session-42 replication pass.
//
// One script, five cells. It drives a probe through its full arc (event-driven — the drive waits
// on the probe's own state, so screenshot latency and CPU contention cannot desynchronize it) while
// an independent sampler loop captures frames at a FIXED interval. Sampling is deliberately
// decoupled from the interaction beats: the session-41 harness sampled where the drive thought
// something interesting happened, which is how Probe B's quickening got aliased out of the record.
//
// These captures are still strips. No reader of them perceives continuous movement; the record must
// not call them a motion medium (Kritiker, session 41).
//
//   node capture.js --probe a --pointer none   --interval 4500 --out frames/A-lo
//   node capture.js --probe a --pointer none   --interval 500  --out frames/A-hi
//   node capture.js --probe a --pointer arrow  --interval 1300 --out frames/A-cv
//   node capture.js --probe a --pointer marker --interval 1300 --out frames/A-mk
//   node capture.js --probe b --pointer arrow  --interval 300  --out frames/B-hi
//
// Requires a headless-capable browser driver for node (NODE_PATH may need to point at the global
// module directory). Determinism: both probes are seeded (SEED 20260725) and the drive clears the
// probe's residue key first, so every run reproduces the same sitting — Probe A ends with residue
// {seat:47, family:1, clauses:[2,2]}, Probe B with {seat:47, stage:2, pressIndex:3, dead:true}.

const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const argv = process.argv.slice(2);
const arg = (k, d) => { const i = argv.indexOf('--' + k); return i === -1 ? d : argv[i + 1]; };

const PROBE = arg('probe', 'a');
const POINTER = arg('pointer', 'none');       // none | arrow | marker
const INTERVAL = parseInt(arg('interval', '1300'), 10);
const OUT = path.resolve(__dirname, arg('out', 'frames/out'));

const FILES = { a: 'etude-a-eroder.html', b: 'etude-b-keeper.html' };
const KEYS = { a: 'ensemble-etude-ji2026002-a', b: 'ensemble-etude-ji2026002-b' };
const URL = 'file://' + path.join(__dirname, '..', FILES[PROBE]);

// Pointer overlay, harness-side only — the probe files are never touched.
// 'arrow'  : the system cursor a real desktop screen recording would show.
// 'marker' : the pointer-confound control — the same coordinates and timings, hand iconography
//            removed (a neutral square outline). See RUBRIC.md for the named reading.
function overlay(mode) {
  if (mode === 'none') return;
  window.addEventListener('DOMContentLoaded', () => {
    const c = document.createElement('div');
    c.id = '__harness_pointer';
    c.style.cssText = 'position:fixed;left:0;top:0;z-index:2147483647;pointer-events:none;display:none;';
    c.innerHTML = mode === 'arrow'
      ? '<svg width="17" height="24" viewBox="0 0 17 24"><path d="M1 1 L1 19 L5.5 15 L8.5 22 L11.5 20.5 L8.5 13.5 L14.5 13.5 Z" fill="#fff" stroke="#000" stroke-width="1.4"/></svg>'
      : '<svg width="16" height="16" viewBox="0 0 16 16"><rect x="1" y="1" width="14" height="14" fill="none" stroke="#000" stroke-width="1.4"/><rect x="1" y="1" width="14" height="14" fill="none" stroke="#fff" stroke-width="0.6"/></svg>';
    const place = e => { c.style.display = 'block'; c.style.left = e.clientX + 'px'; c.style.top = e.clientY + 'px'; };
    document.body.appendChild(c);
    window.addEventListener('pointermove', place, true);
    window.addEventListener('pointerdown', place, true);
  });
}

(async () => {
  fs.rmSync(OUT, { recursive: true, force: true });
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 900, height: 600 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.addInitScript(overlay, POINTER);
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));

  await page.goto(URL);
  await page.evaluate(k => localStorage.removeItem(k), KEYS[PROBE]);
  await page.reload();
  await page.waitForTimeout(400);

  // --- the sampler: fixed interval, blind to what the drive is doing ---
  const t0 = Date.now();
  const manifest = [];
  let n = 0, sampling = true, mouseState = 'up';
  const prefix = PROBE;
  async function sampleLoop() {
    while (sampling) {
      const due = Date.now() + INTERVAL;
      n++;
      const name = `${prefix}-${String(n).padStart(3, '0')}.png`;
      try { await page.screenshot({ path: path.join(OUT, name) }); } catch (e) { n--; break; }
      manifest.push({ frame: name, t: `${((Date.now() - t0) / 1000).toFixed(1)}s`, mouse: mouseState });
      const wait = due - Date.now();
      if (wait > 0) await new Promise(r => setTimeout(r, wait));
    }
  }
  const sampler = sampleLoop();

  const residueOf = () => page.evaluate(k => localStorage.getItem(k), KEYS[PROBE]);

  if (PROBE === 'a') {
    // --- Probe A: three rounds, drags waited on the probe's actual round state ---
    async function waitForRound() {
      await page.waitForFunction(() => {
        const l = document.getElementById('cardLeft'), r = document.getElementById('cardRight');
        return l && r && !l.classList.contains('settled') && !r.classList.contains('settled') &&
          l.style.opacity === '1' && r.style.opacity === '1';
      }, null, { timeout: 30000 });
      await page.waitForTimeout(450);
    }
    async function waitForTextShrink(sel, fullLen) {
      await page.waitForFunction(([s, len]) => {
        const el = document.querySelector(s + ' .cardtext');
        return el && el.textContent.length < len - 8;
      }, [sel, fullLen], { timeout: 30000 });
    }
    async function dragToGroove(cardSel) {
      const cb = await page.locator(cardSel).boundingBox();
      const groove = await page.locator('#groove').boundingBox();
      const sx = cb.x + cb.width / 2, sy = cb.y + cb.height / 2;
      const tx = groove.x + groove.width / 2, ty = groove.y + groove.height / 2;
      await page.mouse.move(sx, sy);
      await page.mouse.down(); mouseState = 'down';
      for (let i = 1; i <= 10; i++) {
        await page.mouse.move(sx + (tx - sx) * (i / 10), sy + (ty - sy) * (i / 10));
        await page.waitForTimeout(30);
      }
      await page.mouse.up(); mouseState = 'up';
    }
    const keeps = ['#cardLeft', '#cardRight', '#cardLeft'];
    for (let round = 1; round <= 3; round++) {
      await waitForRound();
      const keep = keeps[round - 1];
      const discard = keep === '#cardLeft' ? '#cardRight' : '#cardLeft';
      const fullLen = await page.locator(discard + ' .cardtext').evaluate(el => el.textContent.length);
      await dragToGroove(keep);
      await waitForTextShrink(discard, fullLen);
      await page.waitForTimeout(900);
    }
    await page.waitForFunction(() => document.getElementById('stage').classList.contains('quiet'), null, { timeout: 30000 });
    await page.waitForFunction(k => localStorage.getItem(k) !== null, KEYS.a, { timeout: 15000 });
    await page.waitForTimeout(2500); // the sitting at rest
  } else {
    // --- Probe B: three press-hold-release cycles, each relapse waited out via the probe's own
    // persisted state (persist() runs when a relapse completes), then one press on the dead pane ---
    const cx = 450, cy = 300;
    const pressIndex = async () => {
      const r = await residueOf();
      return r ? (JSON.parse(r).pressIndex || 0) : 0;
    };
    await page.waitForTimeout(1200); // at rest, untouched
    for (let p = 0; p < 3; p++) {
      const before = await pressIndex();
      await page.mouse.move(cx, cy);
      await page.mouse.down(); mouseState = 'down';
      await page.waitForTimeout(900); // ramp is 650ms — the clamp is reached
      if (p === 0) { for (let i = 1; i <= 8; i++) { await page.mouse.move(cx - 120 + i * 30, cy - 20); await page.waitForTimeout(40); } }
      await page.mouse.up(); mouseState = 'up';
      // wait for this press's relapse to complete (state-driven, not a fixed sleep)
      const t = Date.now();
      while (Date.now() - t < 20000) {
        if ((await pressIndex()) > before) break;
        await page.waitForTimeout(60);
      }
      await page.waitForTimeout(300);
    }
    // attempted press on the dead pane
    await page.mouse.move(cx, cy);
    await page.mouse.down(); mouseState = 'down';
    await page.waitForTimeout(1400);
    await page.mouse.up(); mouseState = 'up';
    await page.waitForTimeout(1600);
  }

  sampling = false;
  await sampler;
  const residue = await residueOf();
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log(`CELL ${OUT.split(path.sep).pop()} probe=${PROBE} pointer=${POINTER} interval=${INTERVAL}ms frames=${manifest.length} duration=${((Date.now() - t0) / 1000).toFixed(1)}s`);
  console.log('RESIDUE:', residue);
  console.log('CONSOLE ERRORS:', errors.length ? errors : 'none');
  await browser.close();
})();
