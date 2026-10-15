// Drive index.html in a real browser; compare what it prints with results.json. Node + playwright.
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); let bad = 0;
const R = JSON.parse(fs.readFileSync(path.join(here, 'results.json')));
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const br = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const pg = await br.newPage({ viewport: { width: 390, height: 900 } }); const errs = [];
pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
await pg.goto('file://' + path.join(here, 'index.html'));
const f = (x, d) => x.toFixed(d);
let t = await pg.innerText('#s1');
ok(t.includes('4 odd of 135') && t.includes(f(R.draw.all_odd_4.plain, 2)), 'browser: k = 4, no further reads -> ' + f(R.draw.all_odd_4.plain, 2));
await pg.fill('#e', '85'); t = await pg.innerText('#s1');
await pg.selectOption('#k', '1'); await pg.fill('#e', '0'); t = await pg.innerText('#s1');
ok(t.includes(f(R.draw.bone_1.plain, 2)) && t.includes('one population'), 'browser: bone only -> ' + f(R.draw.bone_1.plain, 2) + ', one population');
await pg.selectOption('#k', '2'); t = await pg.innerText('#s1'); ok(t.includes(f(R.draw.bone_2_second_reader.plain, 2)), 'browser: second reader -> ' + f(R.draw.bone_2_second_reader.plain, 2));
await pg.selectOption('#k', '4'); await pg.check('#disc'); t = await pg.innerText('#s1'); ok(t.includes(f(R.draw.all_odd_4.discounted, 2)), 'browser: clusters priced -> ' + f(R.draw.all_odd_4.discounted, 2));
await pg.uncheck('#disc');
for (const e of [75, 100, 200, 400]) { const row = R.table.all_odd_4['0'].find(r => r.extra === e); await pg.fill('#e', String(e)); t = await pg.innerText('#s1'); ok(t.includes('Factor for strangers over one population: ' + f(row.ratio, 2)), 'browser: +' + e + ' living -> ' + f(row.ratio, 2)); }
await pg.fill('#e', '100'); await pg.fill('#j', '1'); t = await pg.innerText('#s1'); ok(t.includes(f(R.one_in_100.all_odd_4, 2)), 'browser: one odd in 100 -> ' + f(R.one_in_100.all_odd_4, 2));
t = await pg.innerText('#need'); ok(t.includes('219 (84 further)') && t.includes('351 (216 further)') && t.includes('883'), 'browser: size table 219 / 351 / 883');
await pg.selectOption('#q', '0.03'); ok((await pg.locator('#pow rect').count()) === 10, 'browser: ten power bars');
t = await pg.evaluate(() => document.getElementById('pow').textContent); const p100 = R.power.all_odd_4['0.03'][1].p_one_population_3x; ok(t.includes(f(p100, 2)), 'browser: power at q 3 %, +100 -> ' + f(p100, 2));
ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal scroll at 390 px');
await pg.setViewportSize({ width: 1100, height: 900 }); ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal scroll at 1100 px');
ok(errs.length === 0, 'no console or page errors ' + errs.join('|'));
await pg.screenshot({ path: '/tmp/claude-0/s/c5s3.png', fullPage: true });
await br.close(); process.exit(bad ? 1 : 0);
