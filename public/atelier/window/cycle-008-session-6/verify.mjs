// Drive index.html in a real browser at two widths and check its numbers against the build. Node + playwright.
import { createRequire } from 'module'; import path from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const require = createRequire('/opt/node-tools/node_modules/'); const { chromium } = require('playwright');
const here = path.dirname(fileURLToPath(import.meta.url)); let bad = 0;
const ok = (c, m) => { console.log((c ? 'ok   ' : 'FAIL ') + m); if (!c) bad++; };
const R = JSON.parse(fs.readFileSync(path.join(here, 'results.json')));
const br = await chromium.launch({ executablePath: process.env.CHROMIUM || '/opt/pw-browsers/chromium-1194/chrome-linux/chrome', args: ['--no-sandbox'] });
for (const [wd, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const pg = await br.newPage({ viewport: { width: wd, height: 900 }, colorScheme: scheme }); const errs = [];
  pg.on('pageerror', e => errs.push(String(e))); pg.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await pg.goto('file://' + path.join(here, 'index.html'));
  const t = id => pg.innerText('#' + id), num = async id => +(await t(id)).replace(/[^0-9.\-]/g, '');
  const setN = async v => pg.$eval('#N', (e, v) => { e.value = v; e.dispatchEvent(new Event('input')); }, v);
  ok(await pg.evaluate(() => document.documentElement.scrollWidth <= innerWidth + 1), `${wd}px: no horizontal page scroll`);
  ok((await t('wread')).includes('Avenal'), `${wd}px: opens on the Avenal warning`);
  for (const N of [5, 20, 30, 50, 100]) {
    await setN(N); const a = R.by_N[String(N)];
    ok(await num('f-split') === a.split && await num('f-strong') === a.strong_split && await num('f-nar') === a.multi_narrow
       && await num('f-narsplit') === a.narrow_split && await num('f-narstrong') === a.narrow_strong
       && await num('f-firm') === (a.verdict_sets['too high'] || 0), `${wd}px: at N=${N} the page recomputes the build (${a.split}, ${a.strong_split}, ${a.narrow_split}, ${a.narrow_strong})`);
  }
  await setN(20);
  const cr = await t('cread'); ok(/narrowest classes, and they say: (too high and consistent|consistent and too high)/.test(cr), `${wd}px: Avenal's narrowest classes disagree`);
  ok((await t('x-all')).includes(`${R.all.came} came where ${R.all.stated}`) && (await t('x-cal')).includes(`${R.california.came} of ${R.california.stated}`), `${wd}px: findings filled from the build`);
  ok(await num('x-ns') === 38, `${wd}px: 38 warnings whose narrowest classes disagree with power on both sides`);
  // make a class by hand: California alone
  await pg.check('input[name=region][value=California]'); ok((await t('own')).includes(`holds ${R.california.n} warnings`) && (await t('own')).includes('Verdict: consistent, and it could have told'), `${wd}px: own class California is consistent and could have told`);
  await pg.check('input[name=region][value=Alaska]'); ok((await t('own')).includes('Verdict: too high'), `${wd}px: own class Alaska is too high`);
  await pg.check('input[name=year][value="2026"]'); await pg.check('input[name=odds][value="stated ≥ 50 %"]'); ok((await t('own')).includes('no verdict') || (await t('own')).includes('Verdict'), `${wd}px: a narrow hand-made class is handled`);
  // tap the map: picks a warning
  await pg.$eval('#map', e => e.scrollIntoView({ block: 'center' }));
  const bx = await pg.$eval('#map', e => { const r = e.getBoundingClientRect(); return [r.left, r.top, r.width, r.height]; });
  await pg.mouse.click(bx[0] + bx[2] * 0.1, bx[1] + bx[3] * 0.6); ok(!(await t('wread')).includes('Avenal'), `${wd}px: tapping the map picks another warning`);
  ok(errs.length === 0, `${wd}px: no script errors ${errs.join(' | ')}`);
}
await br.close(); console.log(bad ? `${bad} FAILED` : 'all passed'); process.exit(bad ? 1 : 0);
