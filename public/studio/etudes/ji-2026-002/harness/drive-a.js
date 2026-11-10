// Motion-pass drive, event-driven: Probe A with visible cursor overlay.
// Waits on the probe's actual round state instead of a fixed schedule, so CPU contention
// cannot desynchronize the drive from the sitting.
const { chromium } = require('playwright');
const fs = require('fs');
const path = require('path');

const OUT = path.join(__dirname, 'frames-a');
const URL = 'file://' + path.join(__dirname, '..', 'etude-a-eroder.html');

(async () => {
  fs.mkdirSync(OUT, { recursive: true });
  const browser = await chromium.launch();
  const ctx = await browser.newContext({ viewport: { width: 900, height: 600 }, deviceScaleFactor: 1 });
  const page = await ctx.newPage();
  await page.addInitScript({ path: path.join(__dirname, 'cursor-overlay.js') });
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push(String(e)));

  await page.goto(URL);
  await page.evaluate(() => localStorage.removeItem('ensemble-etude-ji2026002-a'));
  await page.reload();

  const t0 = Date.now();
  const manifest = [];
  let n = 0;
  let mouseState = 'up';
  async function frame(note) {
    n++;
    const name = `a-${String(n).padStart(2, '0')}.png`;
    await page.screenshot({ path: path.join(OUT, name) });
    const t = ((Date.now() - t0) / 1000).toFixed(1);
    manifest.push({ frame: name, t: `${t}s`, mouse: mouseState });
    console.log(`frame ${name} t=${t}s mouse=${mouseState} (${note})`);
  }

  // a fresh round is on: both cards un-settled, visible, at rest
  async function waitForRound() {
    await page.waitForFunction(() => {
      const l = document.getElementById('cardLeft'), r = document.getElementById('cardRight');
      return l && r && !l.classList.contains('settled') && !r.classList.contains('settled') &&
        l.style.opacity === '1' && r.style.opacity === '1';
    }, null, { timeout: 20000 });
    await page.waitForTimeout(450); // let the fade-in finish visually
  }

  async function waitForTextShrink(sel, fullLen) {
    await page.waitForFunction(([s, len]) => {
      const el = document.querySelector(s + ' .cardtext');
      return el && el.textContent.length < len - 8;
    }, [sel, fullLen], { timeout: 20000 });
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
      if (i === 5) await frame('mid-drag');
    }
    await page.mouse.up(); mouseState = 'up';
  }

  const keeps = ['#cardLeft', '#cardRight', '#cardLeft'];
  for (let round = 1; round <= 3; round++) {
    await waitForRound();
    await frame(`round ${round} pair at rest`);
    const keep = keeps[round - 1];
    const discard = keep === '#cardLeft' ? '#cardRight' : '#cardLeft';
    const fullLen = await page.locator(discard + ' .cardtext').evaluate(el => el.textContent.length);
    await dragToGroove(keep);
    await page.waitForTimeout(150); await frame('card settled in groove');
    await waitForTextShrink(discard, fullLen);
    await frame('retraction underway');
    await page.waitForTimeout(280); await frame('retraction further along');
    await page.waitForTimeout(600); await frame('discard gone / kept card re-set');
  }

  // finale: stage quiets
  await page.waitForFunction(() => document.getElementById('stage').classList.contains('quiet'), null, { timeout: 20000 });
  await frame('kept card on the stack, screen quieting');
  await page.waitForTimeout(1500); await frame('at rest, end of sitting');

  await page.waitForFunction(() => localStorage.getItem('ensemble-etude-ji2026002-a') !== null, null, { timeout: 10000 });
  const residue = await page.evaluate(() => localStorage.getItem('ensemble-etude-ji2026002-a'));
  fs.writeFileSync(path.join(OUT, 'manifest.json'), JSON.stringify(manifest, null, 2));
  console.log('RESIDUE:', residue);
  console.log('CONSOLE ERRORS:', errors.length ? errors : 'none');
  await browser.close();
})();
