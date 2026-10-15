// Drive index.html in a real browser and compare what it prints with results.json. Node + playwright (global).
import { createRequire } from 'module'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); let bad = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const br = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
const pg = await br.newPage({ viewport: { width: 390, height: 900 } }); const errs = [];
pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
await pg.goto('file://' + path.join(here, 'index.html'));
let t = await pg.innerText('#s22');
ok(t.includes('Best any rule, in sample: 21 of 22') && t.includes('shares its cell with 8'), 'browser: declared fields -> 21 of 22, 8 mates');
for (const n of ['state', 'licence', 'month']) await pg.check(`[data-n="${n}"]`);
t = await pg.innerText('#s22'); ok(t.includes('in sample: 22 of 22') && t.includes('judged: empty'), "browser: three widening fields -> 22 of 22, bone 'empty' held out");
for (const n of ['hour', 'creator']) await pg.check(`[data-n="${n}"]`);
ok((await pg.innerText('#s22')).includes('alone in their cell: 22'), 'browser: five widening fields -> all 22 alone');
for (const [v, e] of [['rec', '37 of 39'], ['place', '30 of 39'], ['species', '28 of 39'], ['none', '38 of 39']]) { await pg.selectOption('#ho', v); ok((await pg.innerText('#s39')).includes(e), `browser: hold out ${v} -> ${e}`); }
ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth), 'no horizontal scroll at 390 px');
ok(errs.length === 0, 'no console or page errors ' + errs.join('|'));
await pg.screenshot({ path: '/tmp/claude-0/s/s6.png', fullPage: true });
await br.close(); process.exit(bad ? 1 : 0);
