// Motion-pass drive: Probe B (the fogged pane). Captures timestamped frames across the
// full decay arc: press 1 (full clear) -> relapse -> press 2 (0.7 clamp) -> relapse ->
// press 3 (0.49 clamp) -> relapse -> dead pane -> attempted press on dead pane.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'frames-b');
const URL = 'file://' + path.join(__dirname, '..', 'etude-b-keeper.html');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 900, height: 600 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.addInitScript({ path: require('path').join(__dirname, 'cursor-overlay.js') });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));

  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('ensemble-etude-ji2026002-b'));
  await page.reload();
  await page.waitForTimeout(500);

  const t0 = Date.now();
  const manifest = [];
  let n = 0;
  let mouseState = 'up';
  async function frame(note) {
    n++;
    const name = `b-${String(n).padStart(2, '0')}.png`;
    await page.screenshot({ path: path.join(OUT, name) });
    const t = ((Date.now() - t0) / 1000).toFixed(1);
    manifest.push({ frame: name, t: `${t}s`, mouse: mouseState });
    console.log(`frame ${name} t=${t}s mouse=${mouseState} (${note})`);
  }

  const cx = 450, cy = 300;

  await frame('at rest, untouched');

  // press 1 — full clear, with a small wipe movement while held
  await page.mouse.move(cx, cy);
  await page.mouse.down(); mouseState = 'down';
  await page.waitForTimeout(150); await frame('press1 early');
  await page.waitForTimeout(300); await frame('press1 mid-ramp');
  await page.waitForTimeout(300); await frame('press1 at peak');
  // wipe while holding
  for (let i = 1; i <= 8; i++) { await page.mouse.move(cx - 120 + i * 30, cy - 20); await page.waitForTimeout(40); }
  await frame('press1 held, hand moved');
  await page.mouse.up(); mouseState = 'up';
  await page.waitForTimeout(700); await frame('release1 +0.7s');
  await page.waitForTimeout(1400); await frame('release1 +2.1s');
  await page.waitForTimeout(1500); await frame('release1 +3.6s');
  await page.waitForTimeout(1300); await frame('release1 +4.9s relapse complete');

  // press 2 — clamped at 0.7
  await page.mouse.move(cx, cy);
  await page.mouse.down(); mouseState = 'down';
  await page.waitForTimeout(750); await frame('press2 at peak');
  await page.waitForTimeout(600); await frame('press2 still held');
  await page.mouse.up(); mouseState = 'up';
  await page.waitForTimeout(1100); await frame('release2 +1.1s');
  await page.waitForTimeout(1400); await frame('release2 +2.5s relapse complete');

  // press 3 — clamped at 0.49
  await page.mouse.move(cx, cy);
  await page.mouse.down(); mouseState = 'down';
  await page.waitForTimeout(750); await frame('press3 at peak');
  await page.mouse.up(); mouseState = 'up';
  await page.waitForTimeout(650); await frame('release3 +0.65s');
  await page.waitForTimeout(800); await frame('release3 +1.45s relapse complete, pane dead');

  // attempted press on the dead pane
  await page.mouse.move(cx, cy);
  await page.mouse.down(); mouseState = 'down';
  await page.waitForTimeout(400); await frame('press4 attempt +0.4s');
  await page.waitForTimeout(700); await frame('press4 attempt +1.1s, still held');
  await page.mouse.up(); mouseState = 'up';
  await page.waitForTimeout(400); await frame('after release, at rest');

  const residue = await page.evaluate(() => localStorage.getItem('ensemble-etude-ji2026002-b'));
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('RESIDUE:', residue);
  console.log('CONSOLE ERRORS:', errors.length ? errors : 'none');
  await browser.close();
})();
