// @ts-nocheck — engine work script shielded from the site TS gate (sandboxed display code, vetted by the collective gauntlet + checkForbidden + astro build). A missing type annotation must never turn the whole site build red — see work 011, 2026-07-06.
// Headless verification of TOO FEW TO HIDE BEHIND.
//   node verify.mjs [path-to-index.html]
//
// Five questions.
//   WITHOUT SCRIPT — does a reader with no JavaScript get the whole work: the headline, all four
//     years of the wall drawn, every activity named, every country, every rung of the ladder?
//   THE DRAWING — does the wall contain exactly as many cells as the data says, in each state,
//     in each of the four years?
//   THE REGISTER — is withheld.csv exactly the sealed cells of the wall, no more and no fewer?
//   WITH SCRIPT — does the dial change the year, and does pointing at a cell report the country,
//     the activity and the state the matrix holds for it?
//   AND — does the page reach the network? It must not, once, in either state.
import { readFileSync, existsSync } from 'fs';
import { dirname, join } from 'path';

// A browser automation tool is a tool of this session, not a dependency of the work.
const GLOBAL_PW = process.env.PLAYWRIGHT_PATH || '/opt/node22/lib/node_modules/playwright/index.js';
const pw = await import('playwright').catch(() => import(GLOBAL_PW));
const chromium = pw.chromium || pw.default.chromium;

const here = dirname(new URL(import.meta.url).pathname);
const file = process.argv[2] || join(here, 'index.html');
const D = JSON.parse(readFileSync(join(here, 'data.json'), 'utf8'));
const csv = readFileSync(join(here, 'withheld.csv'), 'utf8');

const fails = [];
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails.push(msg); };
const sp = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');   // U+2009 THIN SPACE

const exe = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});
const offsite = [];
const watch = ctx => ctx.on('request', r => { if (!r.url().startsWith('file:')) offsite.push(r.url()); });

const W = D.wall, T = D.table;
const YEARS = W.years;

// ---- 1. the floor, with JavaScript disabled -------------------------------------------
console.log('\nWITHOUT SCRIPT — what a reader gets from the served document alone');
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 1400 } });
  watch(ctx);
  const page = await ctx.newPage();
  await page.goto('file://' + file);
  const text = await page.locator('body').innerText();

  ok(text.includes(sp(T.sealed)), `the headline ${sp(T.sealed)} is in the served text`);
  ok((await page.locator('.stat .big').first().innerText()).trim() === sp(T.sealed),
     'the big number is the count of sealed cells');
  ok(text.includes(T.sealed_pct + '%'), `the share ${T.sealed_pct}% is printed`);
  ok(text.includes(D.census_pct + '%'), `the ten other tables' share ${D.census_pct}% is printed`);

  ok((await page.locator('.panel').count()) === YEARS.length,
     `all ${YEARS.length} years of the wall are in the served document`);
  ok((await page.locator('.panel:visible').count()) === YEARS.length,
     'and all four are visible without script — nothing is hidden behind the dial');
  ok(!(await page.locator('.dial').isVisible()),
     'the dial is not shown to a reader who cannot use it');

  for (const y of YEARS) {
    const c = W.by_year[y];
    ok(text.includes(`${y} — ${sp(c.sealed)} sealed`), `${y}: ${sp(c.sealed)} sealed, printed in the caption`);
  }

  let named = 0;
  for (const r of D.per_class) if (text.includes(r.name)) named++;
  ok(named === D.per_class.length,
     `all ${D.per_class.length} activity classes are named in the served text (${named})`);

  let countries = 0;
  for (const r of D.per_country) if (text.includes(r.name)) countries++;
  ok(countries === D.per_country.length,
     `all ${D.per_country.length} countries are named (${countries})`);

  let rungs = 0;
  for (const r of D.ladder) if (text.includes(r.pct + '%')) rungs++;
  ok(rungs === D.ladder.length, `all ${D.ladder.length} rungs of the ladder are printed (${rungs})`);

  let flows = 0;
  for (const r of D.census) if (text.includes(r.dataflow) && text.includes(sp(r.cells))) flows++;
  ok(flows === D.census.length, `all ${D.census.length} other dataflows are named with their size (${flows})`);

  let inds = 0;
  for (const r of D.by_indicator) if (text.includes(r.indicator)) inds++;
  ok(inds === D.by_indicator.length, `all ${D.by_indicator.length} indicators of the table are listed (${inds})`);

  ok(text.includes(sp(D.single.sealed)) && text.includes(sp(D.single.published)),
     'the single-enterprise counts are printed');
  for (const a of [...new Set(D.single.by_nace.slice(0, 4).map(r => r.activity))])
    ok(text.includes(a), `the single-enterprise list names ${a}`);

  // the rule, and the refusal
  ok(text.includes('second largest contributor'),
     "Eurostat's own rule is quoted, not paraphrased into a claim");
  ok(/Nothing here reconstructs a sealed figure/.test(text),
     'the page states that it reconstructs nothing');
  ok(/Sealed in this record and secret in the world are two different things/.test(text),
     'the page separates its record from the world before it is read as the world');

  await ctx.close();
}

// ---- 2. the drawing holds exactly the data ---------------------------------------------
console.log('\nTHE DRAWING — is the wall the data, cell for cell');
{
  const html = readFileSync(file, 'utf8');
  const panels = html.split('<figure class="panel"').slice(1);
  ok(panels.length === YEARS.length, `${YEARS.length} drawn panels in the file`);
  const cellsFromPath = d => {
    let n = 0;
    for (const m of d.matchAll(/M-?\d+ -?\d+h(\d+)v(\d+)h-\d+z/g)) n += (Number(m[2]) + 1) / 3;
    return n;
  };
  for (let i = 0; i < panels.length; i++) {
    const year = YEARS[i], c = W.by_year[year];
    const seal = /class="seal" d="([^"]*)"/.exec(panels[i])[1];
    const pub = /class="pub" d="([^"]*)"/.exec(panels[i])[1];
    const na = /class="na" d="([^"]*)"/.exec(panels[i])[1];
    ok(cellsFromPath(seal) === c.sealed, `${year}: the black field is exactly ${sp(c.sealed)} cells`);
    ok(cellsFromPath(pub) === c.published, `${year}: the pale field is exactly ${sp(c.published)} cells`);
    ok(cellsFromPath(na) === c.not_available, `${year}: the grey field is exactly ${sp(c.not_available)} cells`);
    ok(c.sealed + c.published + c.not_available + c.absent === W.geos.length * W.classes.length,
       `${year}: the four states account for all ${sp(W.geos.length * W.classes.length)} cells of the year`);
  }
  ok(W.sealed === YEARS.reduce((a, y) => a + W.by_year[y].sealed, 0),
     'the wall total is the sum of its years');
}

// ---- 3. the register is the wall --------------------------------------------------------
console.log('\nTHE REGISTER — withheld.csv against the matrix it comes from');
{
  const lines = csv.trim().split('\n');
  ok(lines[0] === 'geo,nace_r2,year,activity,country', 'the register carries a header');
  const rows = lines.slice(1);
  ok(rows.length === W.sealed, `the register has ${sp(W.sealed)} rows, one per sealed cell`);
  const idx = new Map(W.classes.map((c, i) => [c, i]));
  let matched = 0, seen = new Set();
  for (const line of rows) {
    const [geo, nace, year] = line.split(',');
    seen.add(geo + '|' + nace + '|' + year);
    if (W.matrix[year] && W.matrix[year][geo] && W.matrix[year][geo].charAt(idx.get(nace)) === '2') matched++;
  }
  ok(matched === rows.length, `every register row is a sealed cell of the matrix (${matched})`);
  ok(seen.size === rows.length, 'no row appears twice');
  let inMatrix = 0;
  for (const y of YEARS) for (const g of W.geos)
    for (let i = 0; i < W.classes.length; i++)
      if (W.matrix[y][g].charAt(i) === '2' && seen.has(g + '|' + W.classes[i] + '|' + y)) inMatrix++;
  ok(inMatrix === W.sealed, 'and every sealed cell of the matrix is in the register');
  ok(!/[0-9]+\.[0-9]+/.test(csv.split('\n').slice(1, 200).join('\n')),
     'the register carries coordinates and no reconstructed values');
}

// ---- 4. the dial and the readout ---------------------------------------------------------
console.log('\nWITH SCRIPT — the dial, and pointing at one cell');
{
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 900 } });
  watch(ctx);
  const page = await ctx.newPage();
  await page.goto('file://' + file);
  await page.waitForTimeout(200);

  ok(await page.locator('.dial').isVisible(), 'the dial appears when script runs');
  ok((await page.locator('.panel:visible').count()) === 1, 'exactly one year is on screen');
  ok((await page.locator('.panel:not([hidden])').first().getAttribute('data-year')) === W.year_default,
     `the year shown first is ${W.year_default}`);

  for (const y of ['2021', '2024', W.year_default]) {
    await page.locator(`.dial button[data-year="${y}"]`).click();
    await page.waitForTimeout(80);
    const shown = await page.locator('.panel:not([hidden])').first().getAttribute('data-year');
    ok(shown === y && (await page.locator('.panel:visible').count()) === 1,
       `the dial moves the wall to ${y}, and to nothing else`);
  }

  // point at three cells chosen from the data and read what the page says
  const svg = page.locator('.panel:not([hidden]) svg').first();
  await svg.scrollIntoViewIfNeeded();
  const box = await svg.boundingBox();
  const scale = box.width / W.width;
  const idx = new Map(W.classes.map((c, i) => [c, i]));
  const STATE = { '0': 'not in the file', '1': 'printed', '2': 'SEALED', '3': 'not available' };
  const probes = [
    ['IE', D.top_class[0].nace],
    ['DE', 'C1011'],
    [W.geos[W.geos.length - 1], W.classes[10]],
  ];
  for (const [geo, nace] of probes) {
    const col = W.geos.indexOf(geo), row = idx.get(nace);
    // bring the row into the viewport before pointing at it
    const top = await svg.boundingBox();
    await page.evaluate(dy => window.scrollBy(0, dy),
                        top.y + (W.rows[row] + 1) * scale - 400);
    await page.waitForTimeout(60);
    const b2 = await svg.boundingBox();
    const x = b2.x + (132 + col * 15 + 7) * scale;
    const y = b2.y + (W.rows[row] + 1) * scale;
    await page.mouse.move(x, y);
    await page.waitForTimeout(60);
    const said = await page.locator('.readout').innerText();
    const want = W.matrix[W.year_default][geo].charAt(row);
    ok(said.includes(W.geo_names[geo]) && said.includes(nace) && said.includes(STATE[want]),
       `pointing at ${geo} × ${nace} reports "${said.slice(0, 90)}"`);
  }
  await page.mouse.move(box.x + 4, box.y + 4);
  await page.waitForTimeout(60);
  ok((await page.locator('.readout').innerText()).includes('Point at the wall'),
     'the gutter reports nothing rather than the nearest cell');

  await ctx.close();
}

// ---- 5. the network ----------------------------------------------------------------------
console.log('\nTHE NETWORK');
ok(offsite.length === 0, `no request left the file, in either state (${offsite.length})`);

await browser.close();
console.log(`\n${fails.length ? 'FAILED ' + fails.length : 'all checks passed'}`);
process.exit(fails.length ? 1 : 0);
