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
  const wr = () => pg.innerText('#worldread');
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: no horizontal page scroll`);
  ok((await pg.innerText('#nmoves')) === '27' && (await pg.innerText('#nquiet')) === '79', `${wd}px: 27 moves since 1947, 79 quiet years`);
  ok((await pg.innerText('#setread')).startsWith('1991: 17 min to midnight, moved back 7 min'), `${wd}px: opens on 1991, 17 minutes`);
  ok((await pg.innerText('#handcount')).includes('19 moves forward, 8 back') && (await pg.innerText('#handcount')).includes('0 figures'), `${wd}px: hand count 19 forward, 8 back, no probability`);
  await pg.$eval('#clock', e => e.scrollIntoView());
  const cb = await pg.$eval('#clock', e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width]; });
  await pg.mouse.click(cb[0] + 44 + (cb[2] - 56) * (1953 - 1947) / 79, cb[1] + 300 - 26 - Math.sqrt(120) / Math.sqrt(1020) * 260);
  ok((await pg.innerText('#setread')).startsWith('1953: 2 min'), `${wd}px: tapping 1953 reads 2 minutes`);
  await pg.click('#w-never'); ok((await wr()).includes('never needed') && (await wr()).includes('0.452'), `${wd}px: never needed preset, likelihood 0.452`);
  await pg.click('#w-heeded'); ok((await wr()).includes('heeded: the danger was real') && (await wr()).includes('0.135'), `${wd}px: heeded preset, likelihood 0.135`);
  await pg.click('#w-ignored'); ok((await wr()).includes('rejected by the quiet years'), `${wd}px: ignored-and-lucky rejected at 95 %`);
  await pg.selectOption('#conf', '0.01'); ok((await wr()).includes('somewhere between') || (await wr()).includes('never needed'), `${wd}px: at 99 % the same world is no longer rejected`);
  await pg.selectOption('#conf', '0.05');
  await pg.$eval('#plane', e => e.scrollIntoView());
  const pb = await pg.$eval('#plane', e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width]; });
  await pg.mouse.move(pb[0] + pb[2] - 20, pb[1] + 20); await pg.mouse.down(); await pg.mouse.move(pb[0] + pb[2] - 30, pb[1] + 13); await pg.mouse.up();
  ok((await wr()).includes('heeded'), `${wd}px: dragging to large p, high e reads heeded`);
  const o = await pg.innerText('#out'); ok(o.includes('3.72 %') && o.includes('92.6 %') && o.includes('16.0 %') && o.includes('10.75 %'), `${wd}px: findings filled (3.72, 92.6, 16.0, 10.75)`);
  ok((await pg.innerText('main')).includes('Judgment (mine)'), `${wd}px: judgment marked`);
  ok((await pg.innerText('main')).includes('Halley'), `${wd}px: Merton's comet quoted`);
  ok(await pg.evaluate(() => getComputedStyle(document.body).backgroundColor) === (scheme === 'dark' ? 'rgb(22, 21, 15)' : 'rgb(251, 250, 247)'), `${wd}px: ${scheme} background`);
  ok(errs.length === 0, `${wd}px: no script errors ${errs.join(' | ')}`);
  if (process.env.SHOTS) await pg.screenshot({ path: path.join(process.env.SHOTS, `shot-${wd}.png`), fullPage: true });
  await pg.close();
}
await br.close(); console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
