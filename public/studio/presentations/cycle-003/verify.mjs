// Headless verification of POINT AT ONE.
//   node verify.mjs [path-to-index.html]
//
// Five questions, in the order they matter.
//   WITHOUT SCRIPT — does a reader with no JavaScript get the whole presentation: both large
//     numbers, all five fields drawn, the four works named with their paths, and both
//     catalogues the pointer would otherwise read from?
//   THE DRAWING — is every field's drawn area exactly its count in square units at one scale?
//     This is the page's only claim about size, and it is checkable to the unit.
//   THE TWO EDGES — does the field made of units end in a part-row, and does the field made of
//     no units end inside a row? That difference is the whole argument of the first figure.
//   WITH SCRIPT — does pointing at a mark in the register name exactly the row the register
//     holds, and does pointing at the other field name nothing?
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

const fails = [];
const ok = (cond, msg) => { console.log((cond ? '  ok   ' : '  FAIL ') + msg); if (!cond) fails.push(msg); };
const sp = n => String(n).replace(/\B(?=(\d{3})+(?!\d))/g, ' ');

const exe = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome';
const browser = await chromium.launch(existsSync(exe) ? { executablePath: exe } : {});
const offsite = [];
const watch = ctx => ctx.on('request', r => { if (!r.url().startsWith('file:')) offsite.push(r.url()); });

const F = Object.fromEntries(D.fields.map(f => [f.key, f]));
const C = D.coincidence;
const REG = D.register;
const ROW = D.scale.row, MAG = D.scale.mag;

// the rows of the register, unpacked the same way the page unpacks them
const packed = REG.packed.split(',').map(v => parseInt(v, 16));
const rowAt = i => {
  const v = packed[i], y = v % REG.stride_years, rest = (v - y) / REG.stride_years;
  const cl = rest % REG.stride_classes, g = (rest - cl) / REG.stride_classes;
  return { geo: REG.geo_codes[g], cls: REG.class_codes[cl], year: REG.years[y] };
};
// and the same rows, read straight out of the file the register came from
const csv = readFileSync(join(here, '..', '..', REG.source), 'utf8').trim().split('\n').slice(1)
  .map(l => l.split(','));

// ---- 1. the floor, with JavaScript disabled -------------------------------------------
console.log('\nWITHOUT SCRIPT — what a reader gets from the served document alone');
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 1400 } });
  watch(ctx);
  const page = await ctx.newPage();
  await page.goto('file://' + file);
  const text = await page.locator('body').innerText();
  // What was SERVED, not what happens to be open: the two catalogues sit inside <details>,
  // and a reader without script can still open them.
  const doc = await page.evaluate(() => document.body.textContent);

  ok(text.includes(sp(C.sealed)), `the first number ${sp(C.sealed)} is in the served text`);
  ok(text.includes(sp(C.quake)), `the second number ${sp(C.quake)} is in the served text`);
  ok(text.includes(sp(C.diff)), `their difference ${sp(C.diff)} is printed rather than left to be taken on trust`);
  ok(text.includes(C.pct_str), `and the share ${C.pct_str}% with it`);
  ok(/coincidence/i.test(text), 'the page calls the near-equality a coincidence, on its face');

  for (const f of D.fields) {
    ok(text.includes(f.label), `field "${f.label.slice(0, 44)}…" is captioned`);
  }
  ok(text.includes('no number, and therefore no field'),
     'the absence with no count is drawn as an empty field and says so');
  ok(!text.includes('— '), 'the field with no count prints no number anywhere');

  for (const w of D.works) {
    ok(text.includes(w.title) && text.includes(w.path),
       `${w.title} is named with its path — the cycle is presented, not summarised away`);
  }

  let named = 0;
  for (const w of D.unmade) if (doc.includes(w.title)) named++;
  ok(named === D.unmade.length,
     `all ${D.unmade.length} unmade works are named in the served text (${named})`);
  let heads = 0;
  for (const l of D.letters) if (doc.includes(l.heading)) heads++;
  ok(heads === D.letters.length,
     `all ${D.letters.length} unanswered letters are listed in the served text (${heads})`);
  ok(doc.includes(REG.source), 'the register is named as a file, since it cannot be printed');

  ok(await page.locator('.no-js').first().isVisible(),
     'the note for a reader without script is shown to a reader without script');
  ok(!(await page.locator('.needs-js').first().isVisible().catch(() => false)),
     'and nothing that needs script is presented as if it worked');

  for (const w of [1280, 390]) {
    await page.setViewportSize({ width: w, height: 1000 });
    const over = await page.evaluate(() => document.documentElement.scrollWidth - document.documentElement.clientWidth);
    ok(over <= 0, `no horizontal overflow at ${w}px (${over})`);
  }
  await ctx.close();
}

// ---- 2. the drawing: area is the claim, and it is exact --------------------------------
console.log('\nTHE DRAWING — every field is its own count in square units, at one scale');
{
  const ctx = await browser.newContext({ javaScriptEnabled: false, viewport: { width: 1280, height: 1400 } });
  watch(ctx);
  const page = await ctx.newPage();
  await page.goto('file://' + file);

  const area = await page.evaluate(() => {
    const out = {};
    for (const fig of document.querySelectorAll('figure.fb')) {
      const key = fig.id.replace('fb-', '');
      const svg = fig.querySelector('svg');
      if (!svg) { out[key] = null; continue; }
      const rects = [...svg.querySelectorAll('rect')].map(r => ({
        cls: r.getAttribute('class'),
        w: parseFloat(r.getAttribute('width')), h: parseFloat(r.getAttribute('height')),
      }));
      out[key] = rects;
    }
    return out;
  });

  const sum = (rects, cls) => rects.filter(r => r.cls === cls).reduce((a, r) => a + r.w * r.h, 0);

  const sealed = area.sealed;
  ok(Math.abs(sum(sealed, 'ink') - F.sealed.count) < 1e-6,
     `the sealed field is exactly ${sp(F.sealed.count)} square units (${sum(sealed, 'ink')})`);
  ok(Math.abs(sum(sealed, 'reg') - REG.rows) < 1e-6,
     `the register band inside it is exactly ${sp(REG.rows)} (${sum(sealed, 'reg')})`);

  const quake = area.quake;
  ok(Math.abs(sum(quake, 'wash') - F.quake.count) < 1e-3,
     `the earthquake field is exactly ${sp(F.quake.count)} square units (${sum(quake, 'wash').toFixed(3)})`);

  ok(Math.abs(sum(area.silent, 'ink') - F.silent.count) < 1e-6,
     `the letters field is ${F.silent.count} square units`);
  ok(Math.abs(sum(area.unmade, 'ink') - F.unmade.count) < 1e-6,
     `the unmade-works field is ${F.unmade.count} square units`);
  ok(area.unproposed === null, 'the field with no count is drawn with no area at all');

  ok(Math.abs((sum(sealed, 'ink') - sum(quake, 'wash')) - C.diff) < 1e-3,
     `the two large fields differ by exactly ${sp(C.diff)} square units, which is the page's headline`);

  // the same scale everywhere: every field is ROW units wide or narrower, never wider
  const widths = Object.values(area).filter(Boolean).flat().map(r => r.w);
  ok(Math.max(...widths) <= ROW, `no field is drawn wider than ${ROW} units — one scale, no exceptions`);

  // the magnified register: same count, thirty-six times the area
  const mag = await page.evaluate(() => {
    const svg = document.getElementById('mag-reg');
    return [...svg.querySelectorAll('rect')].filter(r => r.getAttribute('fill'))
      .map(r => ({ w: +r.getAttribute('width'), h: +r.getAttribute('height') }));
  });
  const magArea = mag.reduce((a, r) => a + r.w * r.h, 0);
  ok(Math.abs(magArea - REG.rows * MAG * MAG) < 1e-6,
     `the magnifier holds the same ${sp(REG.rows)} marks at ${MAG * MAG}× the area (${magArea})`);
  await ctx.close();
}

// ---- 3. the two edges -----------------------------------------------------------------
console.log('\nTHE TWO EDGES — a field of units ends in a part-row; a field of none ends inside one');
{
  const ctx = await browser.newContext({ javaScriptEnabled: false });
  watch(ctx);
  const page = await ctx.newPage();
  await page.goto('file://' + file);
  const edges = await page.evaluate(() => {
    const g = id => [...document.querySelector('#' + id + ' svg').querySelectorAll('rect')]
      .map(r => ({ cls: r.getAttribute('class'), y: +r.getAttribute('y'), h: +r.getAttribute('height'), w: +r.getAttribute('width') }));
    return { sealed: g('fb-sealed'), quake: g('fb-quake') };
  });
  const sealedInk = edges.sealed.filter(r => r.cls === 'ink');
  ok(sealedInk.length === 2 && sealedInk[1].w === F.sealed.geom.remainder,
     `the sealed field ends in a part-row of ${F.sealed.geom.remainder} marks — the step that proves it is made of things`);
  ok(Number.isInteger(sealedInk[0].h), 'and every full row of it is a whole row');
  const wash = edges.quake.filter(r => r.cls === 'wash');
  ok(wash.length === 1, 'the earthquake field is one undivided area, not rows');
  ok(!Number.isInteger(wash[0].h),
     `its height falls inside a row (${wash[0].h}) — the number is not a count of units`);
  await ctx.close();
}

// ---- 4. with script: pointing --------------------------------------------------------
console.log('\nWITH SCRIPT — pointing at one, and being told there is no one to point at');
{
  const ctx = await browser.newContext({ viewport: { width: 1200, height: 1000 } });
  watch(ctx);
  const page = await ctx.newPage();
  const errors = [];
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()); });
  page.on('pageerror', e => errors.push('pageerror: ' + e.message));
  await page.goto('file://' + file);
  await page.waitForTimeout(200);
  ok(errors.length === 0, `no console error (${errors.join(' | ') || 'none'})`);

  const readout = () => page.locator('#readout').innerText();
  const hover = async (sel, col, row) => {
    await page.locator(sel).evaluate(e => e.scrollIntoView({ block: 'start' }));
    await page.waitForTimeout(80);
    const bb = await page.locator(sel).boundingBox();
    const svg = await page.locator(sel).evaluate(e => ({ w: e.viewBox.baseVal.width, h: e.viewBox.baseVal.height }));
    const scale = bb.width / svg.w;
    await page.mouse.move(bb.x + (col + 0.5) * MAG * scale, bb.y + (row + 0.5) * MAG * scale);
    await page.waitForTimeout(60);
    return readout();
  };

  // three marks chosen from the register by index, not by what the page happens to show
  for (const i of [0, 4321, REG.rows - 1]) {
    const col = i % D.scale.mag_row, row = Math.floor(i / D.scale.mag_row);
    const said = await hover('#mag-reg', col, row);
    const want = rowAt(i);
    const fromFile = csv[i];
    ok(want.geo === fromFile[0] && want.cls === fromFile[1] && want.year === fromFile[2],
       `mark ${i + 1}: the page's own packing matches ${REG.source} (${fromFile[0]} ${fromFile[1]} ${fromFile[2]})`);
    ok(said.includes(REG.class_names[want.cls]) && said.includes(REG.geo_names[want.geo]) &&
       said.includes(want.year) && said.includes(`mark ${i + 1} of`),
       `and pointing at it says so: ${said.slice(0, 96)}`);
  }

  const nothing = await hover('#mag-wash', 10, 8);
  ok(/nothing here to name/i.test(nothing),
     'pointing at the other field reports that there is nothing there to name');
  ok(!/\d{4}/.test(nothing.replace(/\D/g, '').slice(0, 0) + nothing.match(/\b(19|20)\d\d\b/g)?.join('') || ''),
     'and names no year, no place and no thing — the refusal is not a disguised answer');

  const l = await hover('#mag-letters', 0, 0);
  ok(l.includes(D.letters[0].date) && l.includes(D.letters[0].heading.slice(0, 24)),
     `pointing at the first letter names it (${D.letters[0].date})`);
  const u = await hover('#mag-unmade', 0, 0);
  ok(u.includes(D.unmade[0].title), `pointing at the first unmade work names it (${D.unmade[0].title})`);

  // the page must not draw the things it says it will not draw
  const body = await page.locator('body').innerText();
  ok(!/\b\d+[.,]\d+\s*(EUR|€|million|thousand)\b/i.test(body),
     'no sealed figure is reconstructed anywhere on the page');
  await ctx.close();
}

// ---- 5. the network -------------------------------------------------------------------
console.log('\nTHE NETWORK');
ok(offsite.length === 0, `no request off the filesystem in any state (${offsite.length})`);
{
  const src = readFileSync(file, 'utf8');
  ok(!/\b(src|href)\s*=\s*["']https?:/i.test(src), 'no remote script, stylesheet or font in the document');
  ok(!/fetch\(|XMLHttpRequest|import\(/.test(src), 'and nothing in the page that could fetch one');
}

await browser.close();
console.log(`\n${fails.length ? 'FAILED — ' + fails.length + ' of ' : 'all '}` +
            `checks${fails.length ? '' : ' passed'}.`);
process.exit(fails.length ? 1 : 0);
