// node verify_browser.mjs — loads the page at 390 px (light) and 1100 px (dark), uses every control,
// and checks what it prints against data.json and the page's own declared rule.
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url));
const D = JSON.parse(fs.readFileSync(join(here, 'data.json')));
const b = await chromium.launch({ executablePath: process.env.CHROME || '/opt/pw-browsers/chromium' }).catch(() => chromium.launch());
let pass = 0, fail = 0; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };
const setS = async (p, id, prob) => p.evaluate(([id, prob]) => { const el = document.getElementById(id); el.value = Math.round(900 * (Math.log10(prob) + 9) / 9); el.dispatchEvent(new Event('input')); }, [id, prob]);
for (const [w, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const p = await b.newPage({ viewport: { width: w, height: 900 }, colorScheme: scheme }); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', m => m.type() === 'error' && errs.push(m.text()));
  await p.goto('file://' + join(here, 'index.html'));
  t(`${w} no horizontal scroll`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  t(`${w} slip hidden before hand-in`, !(await p.locator('#slip').isVisible()));
  // exact medians -> 200 points
  await setS(p, 'sup', 0.0038); await setS(p, 'exp', 0.03); await setS(p, 'own', 0.1);
  await p.click('#hand');
  t(`${w} slip shown`, await p.locator('#slip').isVisible());
  t(`${w} median target supers 0.38 %`, (await p.locator('#s-sup-t').innerText()) === '0.38 %');
  t(`${w} median target experts 3 %`, (await p.locator('#s-exp-t').innerText()) === '3 %');
  const st = await p.evaluate(() => window.__state.points);
  t(`${w} near-exact guesses score >= 98 each (${st})`, st[0] >= 98 && st[1] >= 98);
  t(`${w} own row says not scored`, (await p.locator('#s-own-p').innerText()) === 'not scored');
  const tot1 = await p.locator('#s-tot').innerText();
  // move only the own forecast: total must not change
  await p.click('#again'); await setS(p, 'own', 1e-8); await p.click('#hand');
  t(`${w} own forecast does not change the pay (${tot1})`, (await p.locator('#s-tot').innerText()) === tot1);
  // a guess off by 10x loses 40 points
  await p.click('#again'); await setS(p, 'sup', 0.038); await p.click('#hand');
  const s2 = await p.evaluate(() => window.__state.points[0]);
  t(`${w} 10x off scores 60 ±1 (${s2})`, Math.abs(s2 - 60) <= 1);
  t(`${w} strip has 3 rings`, await p.locator('#strip .ring').count() === 3);
  // ladder
  t(`${w} ladder has 11 rungs, 3 references`, await p.locator('#ladder .rung').count() === 11 && await p.locator('#ladder .rung.ref').count() === 3);
  await p.locator('#ladder .rung[data-x="300000"]').click();
  t(`${w} ladder selection`, await p.evaluate(() => window.__state.ladder) === 1 / 300000);
  const note = await p.locator('#gapnote').innerText();
  t(`${w} gap note names own factor and 600,000`, /factor of [\d,]+/.test(note) && note.includes('600,000'));
  t(`${w} public pair drawn`, (await p.locator('#gapfig').innerHTML()).includes('1 in 40 million'));
  // stages
  const sv = await p.locator('#stages').innerHTML();
  t(`${w} stages: four groups`, ['0.5 → 0.38', '6 → 3', '5.25 → 4.75', '2 → 2'].every(s => sv.includes(s)));
  const bb = await p.evaluate(() => { const s = document.getElementById('stages'); return [...s.querySelectorAll('text')].every(el => el.getBBox().x + el.getBBox().width <= 760); });
  t(`${w} stage labels inside the figure`, bb);
  t(`${w} no horizontal scroll after use`, await p.evaluate(() => document.documentElement.scrollWidth <= innerWidth));
  t(`${w} no errors`, errs.length === 0);
  await p.waitForTimeout(1300);
  await p.screenshot({ path: join(here, `shot-${w}.png`), fullPage: true });
}
await b.close(); console.log(pass + ' passed, ' + fail + ' failed'); process.exit(fail ? 1 : 0);
