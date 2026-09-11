// @ts-nocheck — engine work script shielded from the site TS gate (sandboxed display code, vetted by the collective gauntlet + checkForbidden + astro build). A missing type annotation must never turn the whole site build red — see work 011, 2026-07-06.
// Headless verification of BELOW HEARING.
//   node verify.mjs [path-to-index.html]
//
// Four questions.
//   WITHOUT SCRIPT — does a reader with no JavaScript get the whole work: the headline, every
//     box, and every one of the 360 numbers the dial can produce, printed in the document?
//   THE HONEST ENTRY — does the setting that assumes no law really say "unbounded" rather
//     than a number, everywhere it appears?
//   WITH SCRIPT — does the dial move the finding to the numbers in data.json, both totals and
//     per box, and does the drawing move with it?
//   AND — does the page reach the network? It must not, once, in either state.
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';

// A browser automation tool is a tool of this session, not a dependency of the work.
const GLOBAL_PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.js';
const pw = await import('playwright').catch(() => import(GLOBAL_PW));
const chromium = pw.chromium || pw.default.chromium;

const here = dirname(new URL(import.meta.url).pathname);
const file = process.argv[2] || join(here, 'index.html');
const data = JSON.parse(readFileSync(join(here, 'data.json'), 'utf8'));
const html = readFileSync(file, 'utf8');

const fails = [];
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails.push(msg); };
const sp = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, '\u2009');

const exe = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});
const offsite = [];
const watch = ctx => ctx.on('request', r => { if (!r.url().startsWith('file:')) offsite.push(r.url()); });

const D = data, dfltRule = D.rule_default, dfltFloor = D.floor_default.toFixed(1);
const headline = D.grid_totals[dfltRule][dfltFloor];

// ---- 1. the floor, with JavaScript disabled -----------------------------------------
console.log('\nWITHOUT SCRIPT — what a reader gets from the served document alone');
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 1200 } });
  watch(ctx);
  const page = await ctx.newPage();
  await page.goto('file://' + file);
  const text = await page.locator('body').innerText();

  ok(text.includes(sp(headline.missing)),
     `the headline count ${sp(headline.missing)} is in the served text`);
  ok((await page.locator('.stat .big').innerText()).trim() === sp(headline.missing),
     'the big number is the default setting, drawn without script');

  let named = 0;
  for (const r of D.regions) if (text.includes(r.name)) named++;
  ok(named === D.regions.length, `all ${D.regions.length} boxes are named (${named})`);

  ok((await page.locator('.cell').count()) === D.regions.length,
     `${D.regions.length} panels are drawn in the served SVG`);
  ok((await page.locator('.cell .rec').count()) === D.regions.length,
     'every panel carries the recorded staircase');

  // every number the dial can reach must already be on the page
  const rows = await page.locator('tbody tr').all();
  ok(rows.length === D.regions.length, `the grid has one row per box (${rows.length})`);
  let checked = 0, wrong = [];
  for (const tr of rows) {
    const name = (await tr.locator('th').innerText()).trim();
    const reg = D.regions.find(r => r.name === name);
    const tds = await tr.locator('td').allInnerTexts();
    let i = 1;                                   // td[0] is the count in the record
    for (const rule of D.rules.map(x => x.key)) {
      for (const f of D.floors) {
        const c = reg.grid[rule][f.toFixed(1)];
        const want = c.unbounded ? '∞' : (c.unavailable ? '—' : (c.complete ? '0' : sp(c.missing)));
        const got = tds[i].trim();
        if (got !== want) wrong.push(`${name}/${rule}/M${f}: served ${got}, data ${want}`);
        i++; checked++;
      }
    }
    const tot = tds[0].trim();
    if (tot !== sp(reg.total)) wrong.push(`${name}: total served ${tot}, data ${sp(reg.total)}`);
  }
  ok(wrong.length === 0, `all ${checked} grid cells match data.json` + (wrong.length ? ' — ' + wrong.slice(0, 3).join('; ') : ''));

  ok(text.includes('Without scripting this page is served at its default setting'),
     'the page tells a reader without script what state they are in');
  ok(text.includes('U.S. Geological Survey'), 'the source is credited in the served text');
  ok(/Gutenberg/.test(text) && /Wiemer/.test(text) && /Aki/.test(text),
     'the method is cited on the face of the page');
  await ctx.close();
}

// ---- 2. the honest entry ------------------------------------------------------------
console.log('\nTHE HONEST ENTRY — the setting that assumes nothing must refuse to give a number');
{
  let inf = 0, num = 0;
  for (const r of D.regions) for (const f of D.floors) {
    const c = r.grid.none[f.toFixed(1)];
    if (c.unbounded && c.missing === null) inf++; else num++;
  }
  ok(num === 0 && inf === D.regions.length * D.floors.length,
     `no law at all yields no count anywhere (${inf} cells, all unbounded)`);
  const nInf = (html.match(/∞/g) || []).length;
  ok(nInf >= D.regions.length * D.floors.length,
     `the served document prints ∞ at least ${D.regions.length * D.floors.length} times (${nInf})`);
  ok(/it is <i>unbounded<\/i>|it is unbounded/.test(html),
     'the standfirst says the number is unbounded, not zero, without the law');
}

// ---- 3. the dial, with JavaScript --------------------------------------------------
console.log('\nWITH SCRIPT — does the control move the finding');
{
  const ctx = await browser.newContext({ viewport: { width: 1280, height: 1200 } });
  watch(ctx);
  const page = await ctx.newPage();
  await page.goto('file://' + file);

  ok((await page.locator('.stat .big').innerText()).trim() === sp(headline.missing),
     'with script, the page opens on the same number it serves without');
  ok(await page.locator('#nojs').count() === 0,
     'the note addressed to readers without script is removed for readers with it');

  const settings = [['maxc', 4.0], ['gft95', 2.0], ['cautious', 3.0], ['maxc_raw', 2.5], ['none', 3.0]];
  for (const [rule, floor] of settings) {
    await page.selectOption('#rule', rule);
    await page.selectOption('#floor', floor.toFixed(1));
    const t = D.grid_totals[rule][floor.toFixed(1)];
    const want = t.unbounded ? '∞' : sp(t.missing);
    const got = (await page.locator('.stat .big').innerText()).trim();
    ok(got === want, `${rule} at M ${floor.toFixed(1)}: the page shows ${got}, data.json holds ${want}`);

    // and every panel, not only the total
    let bad = [];
    for (const r of D.regions) {
      const fig = page.locator(`.cell[data-region="${r.name}"]`);
      const c = r.grid[rule][floor.toFixed(1)];
      const w = c.unbounded ? '∞' : (c.unavailable ? '—' : sp(c.missing));
      const g = (await fig.locator('[data-missing]').innerText()).trim();
      if (g !== w) bad.push(`${r.name}: ${g} vs ${w}`);
    }
    ok(bad.length === 0, `  and all ${D.regions.length} panels follow` + (bad.length ? ' — ' + bad.slice(0, 2).join('; ') : ''));
  }

  // the drawing moves with the finding
  await page.selectOption('#rule', 'maxc');
  const deepest = D.regions.slice().sort(
    (a, b) => (b.grid.maxc['2.0'].missing || 0) - (a.grid.maxc['2.0'].missing || 0))[0];
  const sel = `.cell[data-region="${deepest.name}"] .gap`;
  await page.selectOption('#floor', '2.0');
  const wide = await page.locator(sel).getAttribute('points');
  await page.selectOption('#floor', '4.0');
  const narrow = await page.locator(sel).getAttribute('points');
  ok(wide !== narrow && wide.length > 0,
     `the red field over ${deepest.name} is redrawn when the floor moves`);

  await page.selectOption('#rule', 'none');
  const gaps = await page.locator('.cell .gap').all();
  let empty = 0;
  for (const g of gaps) if (((await g.getAttribute('points')) || '').trim() === '') empty++;
  ok(empty === gaps.length, 'holding no law empties every red field on the page');
  await ctx.close();
}

// ---- 4. the network ----------------------------------------------------------------
console.log('\nTHE NETWORK');
ok(offsite.length === 0, 'the page made no request off the filesystem, in either state'
   + (offsite.length ? ' — ' + offsite.slice(0, 3).join(', ') : ''));
ok(!/https?:\/\/[^"'\s]+\.(js|css|woff2?|json)\b/i.test(html.replace(/<a [^>]*>|<\/a>/g, '')),
   'the document loads no remote script, stylesheet, font or data file');

await browser.close();
console.log(`\n${fails.length ? 'FAILED ' + fails.length : 'all checks passed'}`);
process.exit(fails.length ? 1 : 0);
