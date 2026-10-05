// Headless verification of SIXTY WAYS TO COUNT.
//   node verify.mjs [path-to-index.html]
// Two questions. Without script: is the complete surface really in the served
// document — all sixty counts, all eight sentences with the verdict that does
// not depend on a setting, the six measures with no dial, the four quoted
// entries? With script: does every one of the sixty settings, reached by the
// dials, by a tick and by a link, put on the page exactly the number build.py
// derived, do the eight sentences flip exactly where the data says they flip,
// and does the quotation carry the setting that produced it?
import { readFileSync, existsSync } from 'fs';

// Playwright is a tool of this session, not a dependency of the work.
const GLOBAL_PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.js';
const pw = await import('playwright').catch(() => import(GLOBAL_PW));
const chromium = pw.chromium || pw.default.chromium;

const file = process.argv[2] || new URL('./index.html', import.meta.url).pathname;
const data = JSON.parse(readFileSync(new URL('./data.json', import.meta.url).pathname, 'utf8'));
const S = data.settings;
const byId = Object.fromEntries(S.map(s => [s.id, s]));
const lo = S[0], hi = S[S.length - 1];

const fails = [];
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails.push(msg); };

const exe = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});

// ---- 1. the floor, with JavaScript disabled --------------------------------
{
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  const p = await ctx.newPage();
  await p.goto('file://' + file);
  console.log('no script — the served document alone:');

  const cells = await p.$$eval('table tbody td b', ns => ns.map(n => Number(n.textContent)));
  ok(cells.length === 60, `the whole surface is printed: 60 cells (${cells.length})`);
  const want = [];
  for (const w of [1, 2, 3, 4, 5]) for (const l of [1, 2, 3]) for (const i of [1, 2, 3, 4]) want.push(byId[`w${w}l${l}i${i}`].acts);
  ok(JSON.stringify(cells) === JSON.stringify(want), 'every one of the sixty printed counts is the derived one');
  ok(Math.min(...cells) === lo.acts && Math.max(...cells) === hi.acts,
    `the table spans the published span ${lo.acts}–${hi.acts}`);

  const claims = await p.$$eval('.claim', els => els.map(e => ({
    id: e.getAttribute('data-claim'),
    badge: e.querySelector('.cbadge').textContent.trim(),
    span: e.querySelector('.cspan').textContent.trim(),
  })));
  ok(claims.length === data.claims.length, `all ${data.claims.length} sentences stand in the floor (${claims.length})`);
  let claimsRight = true;
  for (const c of data.claims) {
    const got = claims.find(x => x.id === c.id);
    const wantBadge = c.status === 'set by the dial' ? 'you decide' : 'the file decides';
    const wantSpan = c.status === 'always' ? 'true at all 60'
      : c.status === 'never' ? 'false at all 60' : `true at ${c.true_at} of 60`;
    if (!got || got.badge !== wantBadge || got.span !== wantSpan) claimsRight = false;
  }
  ok(claimsRight, 'each sentence carries, without script, the verdict that does not depend on a setting');

  const inv = await p.$$eval('ul.inv li b', ns => ns.map(n => n.textContent.trim()));
  ok(inv.length === data.invariants.length, `the ${data.invariants.length} dial-free measures are printed (${inv.length})`);
  const invRight = data.invariants.every((x, k) => inv[k].replace(/\s/g, '') === String(x.n));
  ok(invRight, 'and each of them is the derived value');

  const ex = await p.$$eval('ul.ex li', els => els.map(e => ({
    q: e.querySelector('q').textContent, href: e.querySelector('a').getAttribute('href'),
  })));
  ok(ex.length === data.examples.length, `the ${data.examples.length} quoted entries are present (${ex.length})`);
  ok(data.examples.every((x, k) => ex[k].q.startsWith(x.q.slice(0, 24)) && ex[k].href === x.u),
    'each quotation carries the address the Atlas cites for it');

  const ticks = await p.$$eval('.tick', els => els.length);
  ok(ticks === 60, `the spectrum holds sixty ticks (${ticks})`);

  const dialsVisible = await p.$eval('.dials', el => getComputedStyle(el).display !== 'none');
  ok(!dialsVisible, 'the dials are not offered to a reader who cannot turn them');
  const nojs = await p.$$eval('.nojsonly', els => els.some(e => e.textContent.replace(/\s+/g, ' ').includes('complete surface')));
  ok(nojs, 'and the page says where the complete surface is instead');

  const sha = await p.$$eval('code', ns => ns.map(n => n.textContent).join(' '));
  ok(sha.includes(data.source.sha256), 'the feed the numbers came from is pinned on the page');
  await ctx.close();
}

// ---- 2. with script: all sixty settings, reached three ways -----------------
{
  const ctx = await browser.newContext();
  const p = await ctx.newPage();
  const errors = [];
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('pageerror', e => errors.push(String(e)));
  await p.goto('file://' + file);
  console.log('with script:');

  const start = await p.$eval('#num', n => n.textContent.trim());
  ok(Number(start) === byId['w1l1i1'].acts, `opens on the strictest setting: ${byId['w1l1i1'].acts} (${start})`);

  // every setting, by the dials
  let allRight = true, worst = null;
  for (const s of S) {
    await p.$eval('#dw', (el, v) => { el.value = String(v); el.dispatchEvent(new Event('input')); }, s.w);
    await p.$eval('#dl', (el, v) => { el.value = String(v); el.dispatchEvent(new Event('input')); }, s.l);
    await p.$eval('#di', (el, v) => { el.value = String(v); el.dispatchEvent(new Event('input')); }, s.i);
    const got = Number(await p.$eval('#num', n => n.textContent.trim()));
    if (got !== s.acts) { allRight = false; worst = `${s.id}: page ${got}, derived ${s.acts}`; }
  }
  ok(allRight, `all sixty settings put the derived number on the page${worst ? ' — ' + worst : ''}`);

  // the eight sentences flip exactly where the data says
  let flipsRight = true;
  for (const s of [lo, byId['w1l1i1'], byId['w3l2i2'], byId['w5l3i4'], hi]) {
    await p.$eval('#dw', (el, v) => { el.value = String(v); el.dispatchEvent(new Event('input')); }, s.w);
    await p.$eval('#dl', (el, v) => { el.value = String(v); el.dispatchEvent(new Event('input')); }, s.l);
    await p.$eval('#di', (el, v) => { el.value = String(v); el.dispatchEvent(new Event('input')); }, s.i);
    const now = await p.$$eval('.claim', els => Object.fromEntries(
      els.map(e => [e.getAttribute('data-claim'), e.getAttribute('data-now')])));
    for (const c of data.claims) {
      const wantNow = String(!!c.truth[S.findIndex(x => x.id === s.id)]);
      if (now[c.id] !== wantNow) flipsRight = false;
    }
  }
  ok(flipsRight, 'at five settings across the span, every sentence shows the truth value the data holds');

  const invariantsHeld = await p.$$eval('ul.inv li b', ns => ns.map(n => n.textContent.trim()));
  ok(data.invariants.every((x, k) => invariantsHeld[k].replace(/\s/g, '') === String(x.n)),
    'the dial-free measures did not move while sixty settings passed under them');

  // a tick sets the dials
  await p.$eval('.tick[data-id="w5l3i4"]', el => el.click());
  const afterTick = await p.$$eval('#dw,#dl,#di', els => els.map(e => e.value).join(''));
  ok(afterTick === '534', `clicking a tick turns the dials to that setting (${afterTick})`);
  ok(Number(await p.$eval('#num', n => n.textContent)) === byId['w5l3i4'].acts, 'and the finding follows the tick');

  // the quotation carries the setting
  const q = await p.$eval('#quote', n => n.textContent);
  ok(q.includes(String(byId['w5l3i4'].acts)) && q.includes('w5l3i4') && q.includes(data.source.sha256),
    'the quotable text carries the count, the setting and the feed it was read from');
  ok(q.includes(`${lo.acts} to ${hi.acts}`), 'and states the whole span the other settings give');
  ok(q.includes(String(byId['w5l3i4'].rests_on_ambiguous)), 'and how many of that count rest on an ambiguous word');

  const hash = await p.evaluate(() => location.hash);
  ok(hash === '#w5l3i4', `the address bar carries the setting (${hash})`);

  ok(errors.length === 0, `no console errors (${errors.length})`);
  await ctx.close();
}

// ---- 3. a deep link, a narrow viewport, and a reader who asked for stillness
{
  const ctx = await browser.newContext({ reducedMotion: 'reduce', viewport: { width: 390, height: 780 } });
  const p = await ctx.newPage();
  await p.goto('file://' + file + '#w5l3i4');
  console.log('deep link, 390px, reduced motion:');
  ok(Number(await p.$eval('#num', n => n.textContent)) === byId['w5l3i4'].acts,
    `a link to a setting opens on that finding (${byId['w5l3i4'].acts})`);
  const dials = await p.$$eval('#dw,#dl,#di', els => els.map(e => e.value).join(''));
  ok(dials === '534', `and the dials show the setting the link names (${dials})`);
  const dur = await p.$eval('.tick', el => getComputedStyle(el).transitionDuration);
  ok(/^0s(,\s*0s)*$/.test(dur), `no transition for a reader who asked for none (${dur})`);
  const overflow = await p.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
  ok(overflow <= 0, `no horizontal overflow at 390 px (${overflow})`);
  await ctx.close();
}

await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nall checks passed');
process.exit(fails.length ? 1 : 0);
