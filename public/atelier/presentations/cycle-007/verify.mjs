// Drive index.html in a real browser at two widths. Node + playwright.
import { createRequire } from 'module'; import path from 'path'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); let bad = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const br = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
for (const [wd, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const pg = await br.newPage({ viewport: { width: wd, height: 900 }, colorScheme: scheme }); const errs = [];
  pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await pg.goto('file://' + path.join(here, 'index.html'));
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: no horizontal page scroll`);
  let t = await pg.innerText('#count'); ok(t.includes('Of 45 list entries') && t.includes('6 whole') && t.includes('20 hinge only') && t.includes('14 neither'), `${wd}px: lists 6/20/5/14`);
  await pg.$eval('#field', c => c.scrollIntoView({ block: 'center' })); const b = await pg.$eval('#field', c => { const r = c.getBoundingClientRect(); return [r.left, r.top]; });
  await pg.mouse.click(b[0] + 4 + 10, b[1] + 4 + 10); t = await pg.innerText('#sent'); ok(t.startsWith('Had') && t.includes('Phillips'), `${wd}px: clicking a disc writes the sentence`);
  await pg.click('button[data-t="sentences"]'); t = await pg.innerText('#count'); ok(t.includes('Of 34 first sentences') && t.includes('3 whole'), `${wd}px: sentences reading 1: 3 whole`);
  await pg.click('#o2'); t = await pg.innerText('#count'); ok(t.includes('4 whole'), `${wd}px: sentences reading 2: 4 whole`);
  await pg.click('button[data-t="sky"]'); t = await pg.innerText('#count'); ok(t.includes('Of 1,159 table rows') && t.includes('0 whole') && t.includes('1,159 neither'), `${wd}px: sky 0 whole`);
  await pg.click('#om'); t = await pg.innerText('#count'); ok(t.includes('12 rows get a hinge') && t.includes('329'), `${wd}px: my computation 12 / 329`);
  ok((await pg.$$('#evs button')).length === 14, `${wd}px: 14 close calls to join`);
  await pg.click('#evs button[data-i="9"]'); // E42
  await pg.click('#lh button[data-k="CH"]'); await pg.click('#rh button[data-k="PH"]');
  t = await pg.innerText('#joined'); ok(t.includes('You wrote this sentence') && t.includes('No keeper wrote any whole'), `${wd}px: joining E42 across hands`);
  ok((await pg.innerText('#tallyyou')).includes('joined from two hands: 1'), `${wd}px: visitor tally`);
  await pg.click('#evs button[data-i="3"]'); await pg.click('#lh button[data-k="PH"]'); await pg.click('#rh button[data-k="PH"]');
  ok((await pg.innerText('#joined')).includes('wrote this whole sentence'), `${wd}px: one keeper's whole sentence (E17)`);
  await pg.click('#evs button[data-i="1"]'); ok((await pg.innerText('#joined')).includes('Nobody wrote either half'), `${wd}px: E10 has no half`);
  ok((await pg.$$('#jt tr')).length === 8, `${wd}px: joint table of 8`);
  ok((await pg.$$('#findings .out')).length === 4, `${wd}px: four findings`);
  ok((await pg.innerText('#q-launch')).includes('launch the antecedent') && (await pg.innerText('#q-ns')).includes('later events'), `${wd}px: quotations`);
  ok((await pg.innerText('#prog')).startsWith('A near miss is half a sentence'), `${wd}px: programme line`);
  ok(await pg.evaluate(() => getComputedStyle(document.body).backgroundColor) === (scheme === 'dark' ? 'rgb(22, 21, 15)' : 'rgb(251, 250, 247)'), `${wd}px: ${scheme} background`);
  ok(errs.length === 0, `${wd}px: no script errors ${errs.join(' | ')}`);
  if (process.env.SHOTS) await pg.screenshot({ path: path.join(process.env.SHOTS, `shot-${wd}.png`), fullPage: true });
  await pg.close();
}
await br.close(); console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
