// node verify_browser.mjs — loads the page at 390 px (light) and 1100 px (dark), scrubs the record, checks counts against data.json
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const D = JSON.parse(fs.readFileSync(join(here, 'data.json'))); const S = D.summary;
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
let pass = 0, fail = 0; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };
const num = async (p, id) => +(await p.locator(id).innerText()).replace(/[^\d]/g, '');
for (const [w, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + join(here, 'index.html')); await p.waitForTimeout(400);
  const wide = await p.evaluate(() => [...document.querySelectorAll('body *')].filter(e => e.getBoundingClientRect().right > innerWidth + 1).slice(0, 5).map(e => e.tagName + '.' + e.className + '#' + e.id));
  if (wide.length) console.log('wide:', wide.join(' '));
  t(w + ' no errors', errs.length === 0);
  t(w + ' no horizontal scroll', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  t(w + ' today: sky holds all rows', await num(p, '#r1') === S.sky_rows);
  t(w + ' today: sky late rows = ' + S.sky_late, await num(p, '#r2') === S.sky_late);
  t(w + ' today: archive 34 called near', await num(p, '#r3') === S.arch_rows);
  for (const y of [1970, 1993.5, 2005, 2020]) {
    await p.evaluate(y => window.__NK.setNow(y), y);
    const s = D.sky.filter(r => Math.max(r[1], r[2]) <= y), a = D.arch.filter(r => r.y_nm <= y);
    t(`${w} as of ${y}: sky ${s.length} (${s.filter(r => r[5] > 0).length} late), archive ${a.length}`,
      await num(p, '#r1') === s.length && await num(p, '#r2') === s.filter(r => r[5] > 0).length && await num(p, '#r3') === a.length);
  }
  t(w + ' thesis carries the late count', (await p.locator('#thesis').innerText()).includes(S.sky_late.toLocaleString('en')));
  t(w + ' table holds 34 close calls', await p.locator('#tbl tbody tr').count() === S.arch_rows);
  t(w + ' fan picker lists objects', await p.locator('#pick option').count() >= 10);
  t(w + ' book fan titled Sagan', (await p.locator('#titA').innerText()).includes('Sagan'));
  t(w + ' bound text names all three moons', await (async () => { const x = await p.locator('#boundText').innerText(); return S.bound_objects.every(o => x.includes(o)); })());
  await p.click('#ghost'); t(w + ' ghost toggles', (await p.locator('#ghost').getAttribute('aria-pressed')) === 'true');
  await p.evaluate(() => window.__NK.setNow(1999));
  await p.screenshot({ path: join(here, `shot-${w}.png`), fullPage: false });
  await p.click('#play'); await p.waitForTimeout(700); await p.click('#play');
  const box = await p.locator('#field').boundingBox();
  await p.evaluate(() => window.__NK.setNow(2026.9));
  await p.mouse.move(box.x + box.width * 0.35, box.y + box.height * 0.75); await p.waitForTimeout(100);
  await p.selectOption('#pick', '1'); 
  t(w + ' no errors after play, hover, pick', errs.length === 0);
  await p.locator('#strip').screenshot({ path: join(here, `shot-strip-${w}.png`) });
  await p.locator('.two').screenshot({ path: join(here, `shot-fans-${w}.png`) });
  await p.locator('#clocks').screenshot({ path: join(here, `shot-clocks-${w}.png`) });
  // one call, two nights
  await p.locator('#calls').scrollIntoViewIfNeeded();
  t(w + ' calls text names both nights', await (async () => { const x = await p.locator('#callText').innerText(); return x.includes('9 November 1979') && x.includes('3 June 1980'); })());
  await p.click('#callPanel [data-night="1980-06-03"]');
  const C = JSON.parse(fs.readFileSync(join(here, '../2026-10-12-one-call-two-nights/tellings.json'))).tellings;
  const n80 = C.filter(x => x.night === '1980-06-03').length;
  t(w + ' choosing 1980: ' + n80 + ' of ' + C.length + ' agree', (await p.locator('#callVerdict').innerText()).startsWith(`${n80} of ${C.length}`));
  await p.click('#callPlay'); await p.waitForTimeout(C.length * 900 + 400);
  t(w + ' play ends on the last telling', (await p.locator('#callCard').innerText()).includes('Wikipedia'));
  const cb = await p.locator('#calls').boundingBox(); await p.mouse.click(cb.x + cb.width - 30, cb.y + cb.height / 2 - 12);
  t(w + ' calls panel no errors', errs.length === 0);
  await p.locator('#callPanel').screenshot({ path: join(here, `../2026-10-12-one-call-two-nights/shot-${w}.png`) });
  t(w + ' no horizontal scroll at end', await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  await p.close();
}
await b.close(); console.log(`${pass} passed, ${fail} failed`); process.exit(fail ? 1 : 0);
