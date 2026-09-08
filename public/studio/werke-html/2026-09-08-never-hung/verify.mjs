// @ts-nocheck — engine work script shielded from the site TS gate (sandboxed display code, vetted by the collective gauntlet + checkForbidden + astro build). A missing type annotation must never turn the whole site build red — see work 011, 2026-07-06.
// Headless verification of NEVER HUNG.
//   node verify.mjs [path-to-index.html]
//
// Three questions. WITHOUT SCRIPT: does a reader with no JavaScript get the whole work —
// every frame on the wall, every entry of the catalogue, every verdict and every path?
// WITH SCRIPT: does the wall the browser actually lays out agree with data.json — is the
// area of each frame really proportional to the words written about that work, and do the
// bands that fill it really divide it in the proportions of its surviving documents?
// AND: does the page reach the network? It must not, once, ever.
import { readFileSync, existsSync } from 'fs';

// A browser automation tool is a tool of this session, not a dependency of the work.
const GLOBAL_PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.js';
const pw = await import('playwright').catch(() => import(GLOBAL_PW));
const chromium = pw.chromium || pw.default.chromium;

const file = process.argv[2] || new URL('./index.html', import.meta.url).pathname;
const data = JSON.parse(readFileSync(new URL('./data.json', import.meta.url).pathname, 'utf8'));
const W = data.works, T = data.totals;

const fails = [];
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails.push(msg); };
const sp = n => n.toLocaleString('en-US').replace(/,/g, ' ');  // 63 239, thin space, as printed

const exe = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});

// ---- 1. the floor, with JavaScript disabled ---------------------------------------
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  await p.goto('file://' + file);
  console.log('no script — the served document alone:');

  const body = await p.$eval('body', n => n.innerText);
  ok((await p.$$('.frame')).length === W.length, `all ${W.length} frames are hung`);
  ok((await p.$$('.entry')).length === W.length, `all ${W.length} catalogue entries are served`);

  let titles = 0, verdicts = 0, glosses = 0, paths = 0;
  for (const w of W) {
    if (body.includes(w.title)) titles++;
    if (body.includes(w.quote)) verdicts++;
    if (body.includes(w.gloss.slice(0, 60))) glosses++;
    if (body.includes(w.minutes[0])) paths++;
  }
  ok(titles === W.length, `every title is in the document (${titles}/${W.length})`);
  ok(verdicts === W.length, `every verdict is quoted in full (${verdicts}/${W.length})`);
  ok(glosses === W.length, `every work is described (${glosses}/${W.length})`);
  ok(paths === W.length, `every work's minutes are cited by path (${paths}/${W.length})`);

  ok(body.includes(sp(T.words)), `the total is printed (${sp(T.words)} words)`);
  ok(body.includes(String(T.works)), 'the number of works is printed');
  for (const t of data.register.missing_kills) {
    ok(body.includes(t), `the register's hole names ${t}`);
  }
  const nothing = await p.$$('.nothing:not(.held)');
  ok(nothing.length === data.register.missing_kills.length,
     `${nothing.length} entries say the register holds nothing about them`);
  ok((await p.$$('.nothing.held')).length === 1,
     'the one that was never refused says so in its own words');
  let late = 0;
  for (const w of W) if (w.late_entry_words && body.includes(sp(w.late_entry_words))) late++;
  ok(late === data.register.missing_kills.length,
     `each of the four says how many words were entered for it tonight (${late}/4)`);

  // the button that needs a script must not be offered to a reader who has none
  const btnVisible = await p.$eval('#fill', n => getComputedStyle(n).display !== 'none');
  ok(!btnVisible, 'the fill control is not shown when it cannot work');

  // the wall scrolls inside its own box; the page itself must not scroll sideways
  const geo = await p.evaluate(() => ({
    doc: document.documentElement.scrollWidth, vp: window.innerWidth,
    wall: document.querySelector('.wallscroll').scrollWidth,
  }));
  ok(geo.doc === geo.vp, `no horizontal page overflow at 1280 (${geo.doc} = ${geo.vp})`);
  ok(geo.wall > geo.vp, 'the wall is wider than the screen and scrolls in its own container');

  // every frame is a link into the catalogue, and every target exists
  const hrefs = await p.$$eval('.frame', ns => ns.map(n => n.getAttribute('href')));
  let targets = 0;
  for (const h of hrefs) if (await p.$(h)) targets++;
  ok(targets === W.length, `every frame links to an entry that exists (${targets}/${W.length})`);

  await ctx.close();
}

// ---- 2. the wall, measured in the browser that drew it -----------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 900 } });
  const p = await ctx.newPage();
  const errors = [], requests = [];
  p.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  p.on('request', r => { if (!r.url().startsWith('file://')) requests.push(r.url()); });
  await p.goto('file://' + file);
  await p.waitForTimeout(150);
  console.log('with script — the wall as the browser lays it out:');

  ok(errors.length === 0, `no console errors (${errors.length})`);
  ok(requests.length === 0, `the page makes no network request of any kind (${requests.length})`);

  const boxes = await p.$$eval('.box', ns => ns.map(n => {
    const r = n.getBoundingClientRect();
    return { w: r.width, h: r.height };
  }));
  ok(boxes.length === W.length, 'every frame has a box');

  // area per word must be one constant across the whole wall
  const per = boxes.map((b, i) => (b.w * b.h) / W[i].words);
  const lo = Math.min(...per), hi = Math.max(...per);
  ok((hi - lo) / hi < 0.01,
     `frame area is proportional to words across all ${W.length} frames (spread ${((hi - lo) / hi * 100).toFixed(3)}%)`);
  const biggest = W.indexOf(W.reduce((a, b) => (a.words > b.words ? a : b)));
  const smallest = W.indexOf(W.reduce((a, b) => (a.words < b.words ? a : b)));
  const ratioArea = (boxes[biggest].w * boxes[biggest].h) / (boxes[smallest].w * boxes[smallest].h);
  const ratioWord = W[biggest].words / W[smallest].words;
  ok(Math.abs(ratioArea / ratioWord - 1) < 0.02,
     `the largest frame is ${ratioWord.toFixed(0)}× the smallest, on the wall as in the record`);

  // every frame is centred on the hanging line
  const centres = await p.$$eval('.box', ns => ns.map(n => {
    const r = n.getBoundingClientRect();
    return r.top + r.height / 2;
  }));
  const line = await p.$eval('.hangline', n => n.getBoundingClientRect().top);
  const off = Math.max(...centres.map(c => Math.abs(c - line)));
  ok(off < 2, `every frame hangs on one line (worst offset ${off.toFixed(2)}px)`);

  // the frames are empty until asked
  const shownBefore = await p.$$eval('.residue', ns => ns.filter(n => getComputedStyle(n).display !== 'none').length);
  ok(shownBefore === 0, 'the frames are empty on arrival');

  await p.click('#fill');
  await p.waitForTimeout(120);
  const shownAfter = await p.$$eval('.residue', ns => ns.filter(n => getComputedStyle(n).display !== 'none').length);
  ok(shownAfter === W.length, 'one press fills every frame');

  // the bands divide each frame in the proportions of its documents, exactly
  let exact = 0, tiled = 0;
  for (let i = 0; i < W.length; i++) {
    const w = W[i];
    const { hs, inner } = await p.evaluate(i => {
      const box = document.querySelectorAll('.box')[i];
      const res = box.querySelector('.residue');
      return {
        hs: Array.from(box.querySelectorAll('.band')).map(b => b.getBoundingClientRect().height),
        inner: res.getBoundingClientRect().height,
      };
    }, i);
    const docs = w.prose.map(d => d.words).sort((a, b) => b - a);
    if (w.register_words) docs.push(w.register_words);
    if (hs.length !== docs.length) continue;
    const sum = hs.reduce((a, b) => a + b, 0);
    if (Math.abs(sum - inner) < 0.5) tiled++;
    const shares = docs.map(d => d / w.words);
    const got = hs.map(h => h / sum);
    if (shares.every((s, k) => Math.abs(s - got[k]) < 0.01)) exact++;
  }
  ok(exact === W.length, `every frame's bands are in the proportions of its documents (${exact}/${W.length})`);
  ok(tiled === W.length, `the paperwork tiles each frame with nothing left over (${tiled}/${W.length})`);

  await ctx.close();
}

// ---- 3. the phone, and the dark ----------------------------------------------------
{
  const ctx = await browser.newContext({ viewport: { width: 390, height: 844 }, deviceScaleFactor: 2 });
  const p = await ctx.newPage();
  await p.goto('file://' + file);
  const geo = await p.evaluate(() => ({
    doc: document.documentElement.scrollWidth, vp: window.innerWidth,
    wall: document.querySelector('.wall').getBoundingClientRect().height,
  }));
  console.log('at 390 px, and in the dark:');
  ok(geo.doc === geo.vp, `no horizontal page overflow at 390 (${geo.doc} = ${geo.vp})`);
  ok(geo.wall < 844, `the wall fits a phone screen (${geo.wall.toFixed(0)}px tall)`);
  const per = await p.$$eval('.box', ns => ns.map(n => {
    const r = n.getBoundingClientRect(); return r.width * r.height;
  }));
  const rat = per.map((a, i) => a / W[i].words);
  ok((Math.max(...rat) - Math.min(...rat)) / Math.max(...rat) < 0.01,
     'the wall stays proportional when it is scaled down for a phone');
  await ctx.close();

  const dark = await browser.newContext({ colorScheme: 'dark', viewport: { width: 1280, height: 900 } });
  const q = await dark.newPage();
  await q.goto('file://' + file);
  const c = await q.evaluate(() => {
    const s = getComputedStyle(document.body);
    const b = getComputedStyle(document.querySelector('.box'));
    return { bg: s.backgroundColor, ink: s.color, box: b.backgroundColor, border: b.borderTopColor };
  });
  const lum = s => { const [r, g, b] = s.match(/\d+/g).map(Number); return 0.2126 * r + 0.7152 * g + 0.0722 * b; };
  ok(lum(c.bg) < 60, `dark mode paints a dark ground (luminance ${lum(c.bg).toFixed(0)})`);
  ok(lum(c.ink) > 180, `dark mode paints light text (luminance ${lum(c.ink).toFixed(0)})`);
  ok(lum(c.box) < lum(c.ink), 'the frames stay darker than the text they sit beside');
  await dark.close();
}

// ---- 4. the page against its own data ----------------------------------------------
{
  const html = readFileSync(file, 'utf8');
  console.log('the page against data.json:');
  ok(html.indexOf('http://') === -1 && html.split('https://').length === 1,
     'no external address is loaded anywhere in the document');
  ok(!/<script[^>]+src=/.test(html), 'no script is loaded from anywhere');
  ok(!/<link[^>]+href=/.test(html), 'no stylesheet is loaded from anywhere');
  ok(html.includes(sp(T.words)), 'the headline total comes from the data');
  const words = W.reduce((a, w) => a + w.words, 0);
  ok(words === T.words, `the works sum to the total (${sp(words)})`);
  const reg = W.filter(w => w.register_words > 0).length;
  ok(reg === data.register.entries, `${reg} works carry a register entry, as the register says`);
  ok(W.filter(w => w.unregistered).length === 4, 'four works carry none');
  ok(data.register.entries_after_repair === data.register.entries_at_measure + 4,
     `the register holds ${data.register.entries_after_repair} entries after tonight's repair, four more than it held`);
  ok(W.every(w => !w.late_entry_words || w.unregistered),
     'a late entry was made only where the register held nothing');
  ok(W.every(w => w.words === w.prose.reduce((a, d) => a + d.words, 0) + w.register_words),
     'no frame counts a word written tonight');
  ok(W.every(w => w.unregistered === (w.register_words === 0 && !w.held)),
     'no work is marked unregistered that has an entry, and none is unmarked that has not');
}

await browser.close();
console.log(fails.length ? `\n${fails.length} FAILED` : '\nall checks passed');
process.exit(fails.length ? 1 : 0);
