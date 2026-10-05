// Headless verification of THE SECOND ADDRESS.
//   node verify.mjs [path-to-index.html]
// Checks the no-JS floor is a complete figure, that the reach control moves the
// wall to the counts build.py derived, that choosing a cell opens that work's
// own record, and that the page does not overflow a narrow viewport.
import { chromium } from 'playwright';
import { readFileSync, existsSync } from 'fs';

const file = process.argv[2] || new URL('./index.html', import.meta.url).pathname;
const data = JSON.parse(readFileSync(new URL('./data.json', import.meta.url).pathname, 'utf8'));
const s = data.totals.states;
const want = {
  works: data.works.length,
  r1: s.own + s.moved,
  r2: s.own + s.moved + s.keeping,
  r3: s.own + s.moved + s.keeping + s.archive,
};

const fails = [];
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails.push(msg); };

// The environment ships Chromium at a fixed path; use it rather than letting
// Playwright look for a build of its own.
const exe = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});

// ---- 1. the floor, with JavaScript disabled -------------------------------
{
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto('file://' + file);
  console.log('no script:');
  const cells = await p.locator('.cell').count();
  ok(cells === want.works, `${cells} cells present (want ${want.works})`);
  const recs = await p.locator('#all .rec').count();
  ok(recs === want.works, `${recs} records present and visible`);
  ok(await p.locator('#all').isVisible(), 'the full record is not folded away');
  const litBg = await p.locator('.cell[data-state=own]').first()
    .evaluate(el => getComputedStyle(el).backgroundColor);
  ok(litBg !== 'rgba(0, 0, 0, 0)', `cells are drawn lit without script (${litBg})`);
  const txt = await p.locator('body').innerText();
  for (const n of [want.r1, want.r2, want.r3]) {
    ok(txt.includes(String(n)), `the count ${n} is printed on the floor`);
  }
  ok(await p.locator('.foldwrap').isHidden(), 'the fold control is hidden without script');
  await ctx.close();
}

// ---- 2. with JavaScript ---------------------------------------------------
{
  const errs = [];
  const ctx = await browser.newContext({ viewport: { width: 390, height: 780 } });
  const p = await ctx.newPage();
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + file);
  console.log('with script:');

  const lit = () => p.locator('.cell.lit').count();
  ok(await lit() === want.r1, `opens at reach 1: ${await lit()} lit (want ${want.r1})`);
  ok(await p.locator('#all').isHidden(), 'the full record is folded away at open');

  for (const [r, n] of [[2, want.r2], [3, want.r3], [1, want.r1]]) {
    await p.locator(`.steps button[data-r="${r}"]`).click();
    const got = await lit();
    ok(got === n, `reach ${r}: ${got} lit (want ${n})`);
    const read = await p.locator('#readout').innerText();
    ok(read.startsWith(String(n) + ' of'), `the readout says ${n} (${read.slice(0, 28)}…)`);
  }

  // a cell opens its own work, not another's
  const i = 7;
  await p.locator(`.cell[data-i="${i}"]`).click();
  const title = await p.locator('#card .rec h3').innerText();
  ok(title.includes(data.works[i].title.slice(0, 18)),
     `cell ${i} opens “${data.works[i].title}” (got “${title.trim().slice(0, 40)}”)`);
  ok(await p.locator(`.cell[data-i="${i}"].sel`).count() === 1, 'the chosen cell is marked');

  await p.locator('#fold').click();
  ok(await p.locator('#all').isVisible(), 'the fold control opens the full record');

  const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(ov <= 0, `no horizontal overflow at 390px (${ov}px)`);
  ok(errs.length === 0, `no console errors (${errs.slice(0, 2).join(' | ')})`);
  await ctx.close();
}

await browser.close();
console.log(fails.length ? `\nFAILED: ${fails.length}` : '\nall checks passed');
process.exit(fails.length ? 1 : 0);
