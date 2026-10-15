// Headless verification of WHERE SOMEONE LOOKED.
//   node verify.mjs [path-to-index.html]
// Checks that the no-JS floor is a complete figure in its own right (every cell
// present and painted in one of the four classes, every year's record open,
// every count printed), that with script the three questions light exactly the
// counts build.py derived, that the ringed cells are the whole difference
// between the last two questions, and that the page does not overflow a narrow
// viewport.
import { readFileSync, existsSync } from 'fs';

// Playwright is a tool of this session, not a dependency of the work: it is
// resolved wherever the environment happens to keep it.
const GLOBAL_PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.js';
const pw = await import('playwright').catch(() => import(GLOBAL_PW));
const chromium = pw.chromium || pw.default.chromium;

const file = process.argv[2] || new URL('./index.html', import.meta.url).pathname;
const data = JSON.parse(readFileSync(new URL('./data.json', import.meta.url).pathname, 'utf8'));
const c = data.counts;
const want = {
  works: c.works,
  read: c.read,
  hand: c.by_hand,
  differ: c.read_not_hand + c.hand_not_read,
  years: data.years.length,
};

const fails = [];
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails.push(msg); };

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
  const rows = await p.locator('.yrec tbody tr.rec').count();
  ok(rows === want.works, `${rows} work records present`);
  const yrecs = await p.locator('.yrec').count();
  ok(yrecs === want.years, `${yrecs} year records standing open (want ${want.years})`);
  ok(await p.locator('.yrec').last().isVisible(), 'the last year record is visible, not folded');

  // all four classes are painted, and none of them is the unlit ground
  const grounds = {};
  for (const sel of ['.cell.read.hand', '.cell.read.list', '.cell.unread.hand', '.cell.unread.list']) {
    const n = await p.locator(sel).count();
    const bg = await p.locator(sel).first().evaluate(el => getComputedStyle(el).backgroundColor);
    grounds[sel] = bg;
    ok(n > 0 && bg !== 'rgba(0, 0, 0, 0)', `${sel}: ${n} cells, painted ${bg}`);
  }
  const distinct = new Set(Object.values(grounds)).size;
  ok(distinct === 4, `the four classes are four different colours on the floor (${distinct})`);

  const txt = await p.locator('body').innerText();
  for (const n of [want.works, want.read, want.hand, c.read_and_hand, want.differ]) {
    ok(txt.includes(String(n)), `the count ${n} is printed on the floor`);
  }
  ok((await p.locator('#readout').innerText()).trim() === '', 'the readout is empty without script');
  await ctx.close();
}

// ---- 2. with JavaScript, at a narrow viewport -----------------------------
{
  const errs = [];
  // reduced motion is honoured, so the repaint is instant and can be read
  // the moment the click returns
  const ctx = await browser.newContext({ viewport: { width: 390, height: 780 }, reducedMotion: 'reduce' });
  const p = await ctx.newPage();
  p.on('console', m => { if (m.type() === 'error') errs.push(m.text()); });
  p.on('pageerror', e => errs.push(String(e)));
  await p.goto('file://' + file);
  console.log('with script:');

  const litCount = async () => p.evaluate(() => {
    const wall = document.getElementById('wall');
    const q = wall.getAttribute('data-q');
    const sel = q === 'held' ? '.cell' : (q === 'read' ? '.cell.read' : '.cell.hand');
    let n = 0;
    for (const el of wall.querySelectorAll(sel)) {
      const bg = getComputedStyle(el).backgroundColor;
      if (bg !== 'rgb(38, 38, 46)') n++;
    }
    return n;
  });

  ok(await p.locator('#wall[data-q=held]').count() === 1, 'opens on the first question');
  const dur = await p.locator('.cell').first().evaluate(el => getComputedStyle(el).transitionDuration);
  ok(dur === '0s', `reduced motion is honoured: transition-duration ${dur}`);
  for (const [q, n] of [['held', want.works], ['read', want.read], ['hand', want.hand], ['held', want.works]]) {
    await p.locator(`.qs button[data-q="${q}"]`).click();
    const got = await litCount();
    ok(got === n, `question “${q}”: ${got} cells lit (want ${n})`);
    const read = await p.locator('#readout').innerText();
    ok(read.startsWith(String(n) + ' of'), `the readout says ${n} (${read.slice(0, 30)}…)`);
    ok(await p.locator(`.qs button[data-q="${q}"][aria-pressed=true]`).count() === 1,
       `the pressed button is “${q}”`);
  }

  // the ringed cells are exactly the difference between the two questions
  const ring = await p.locator('.cell.differs').count();
  ok(ring === want.differ, `${ring} cells ringed (want ${want.differ})`);
  const xor = await p.evaluate(() => {
    let n = 0;
    for (const el of document.querySelectorAll('.cell')) {
      if (el.classList.contains('read') !== el.classList.contains('hand')) n++;
    }
    return n;
  });
  ok(xor === want.differ, `the ring is the exact symmetric difference (${xor})`);

  // a cell points at its own record
  const href = await p.locator('.cell').nth(300).getAttribute('href');
  await p.locator('.cell').nth(300).click();
  ok(await p.locator(href).count() === 1, `cell 300 points at its own record (${href})`);

  const ov = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(ov <= 0, `no horizontal overflow at 390px (${ov}px)`);
  const wallScrolls = await p.evaluate(() => {
    const w = document.getElementById('wall');
    return w.scrollWidth > w.clientWidth && getComputedStyle(w).overflowX === 'auto';
  });
  ok(wallScrolls, 'the wall scrolls inside its own frame rather than the page');
  ok(errs.length === 0, `no console errors (${errs.slice(0, 2).join(' | ')})`);
  await ctx.close();
}

await browser.close();
console.log(fails.length ? `\nFAILED: ${fails.length}` : '\nall checks passed');
process.exit(fails.length ? 1 : 0);
