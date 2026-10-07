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
const verdict = v => v >= 3 ? 'two separate lots by ' + v.toFixed(1) + '×' : v <= 1 / 3 ? 'one population by ' + (1 / v).toFixed(1) + '×' : 'no verdict (' + (v >= 1 ? 'separate lots' : 'one population') + ' by ' + (v >= 1 ? v : 1 / v).toFixed(2) + '×)';
let t = await pg.innerText('#out'); const s = R.stages['4']['3'];
ok(t.includes(verdict(s.d1)) && t.includes(verdict(s.d2)) && t.includes(verdict(s.pool)), 'browser: default (k 4, 3 of 90) matches python: ' + verdict(s.pool));
for (const [k, j] of [['3', 0], ['5', 0], ['1', 2], ['4', 6]]) {
  await pg.selectOption('#k', k); await pg.fill('#j2', String(j)); t = await pg.innerText('#out'); const r = R.stages[k][String(j)];
  ok(t.includes(verdict(r.d1)) && t.includes(verdict(r.d2)) && t.includes(verdict(r.pool)), `browser: k ${k}, j ${j} matches python (${r.pool.toFixed(3)})`);
}
await pg.selectOption('#k', '4'); await pg.fill('#j2', '3'); await pg.fill('#e', '600'); await pg.fill('#je', '0'); t = await pg.innerText('#out');
ok(t.includes('2.6') || t.includes('2.56'), 'browser: 600 further frames, none odd -> 2.56 (python table 2.5569)');
await pg.fill('#e', '1000'); t = await pg.innerText('#out'); ok(t.includes('two separate lots by 8.8×'), 'browser: 1000 further, none odd -> 8.8x separate');
await pg.fill('#e', '300'); await pg.selectOption('#cl', 'disc'); t = await pg.innerText('#out'); ok(!/NaN|Infinity/.test(t) && t.includes('pooled with a further 300'), 'browser: clusters priced, further read renders');
await pg.fill('#e', '0'); await pg.selectOption('#cl', 'disc'); t = await pg.innerText('#out'); ok(t.includes(verdict(R.pooled.settled_3['discounted_b1.2'])), 'browser: priced pooled = python discounted_b1.2');
ok((await pg.locator('#fig rect').count()) >= 6, 'bars and zones drawn');
ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal scroll at 390 px');
await pg.setViewportSize({ width: 1100, height: 900 }); ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal scroll at 1100 px');
ok(errs.length === 0, 'no console or page errors ' + errs.join('|'));
await pg.screenshot({ path: '/tmp/claude-0/-home-user/392ff55a-ced5-5116-a083-8d5b487f1021/scratchpad/c5s5.png', fullPage: true });
await br.close(); process.exit(bad ? 1 : 0);
