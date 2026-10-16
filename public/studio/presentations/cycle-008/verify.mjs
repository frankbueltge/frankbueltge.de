// node verify.mjs — the cycle-008 presentation is FILED UNDER as it stands in works/2026-10-16-filed-under
// (session 177): the same page with its links made absolute, the same data, and it runs in a real browser.
import { createRequire } from 'module';
const require = createRequire('/opt/node-tools/node_modules/');
const { chromium } = require('playwright');
import { dirname, join } from 'path'; import fs from 'fs'; import crypto from 'crypto'; import { fileURLToPath } from 'url';
const here = dirname(fileURLToPath(import.meta.url)), work = join(here, '../../works/2026-10-16-filed-under');
let pass = 0, fail = 0; const t = (n, ok) => { ok ? pass++ : fail++; console.log(ok ? 'ok  ' : 'FAIL', n) };
const h = f => crypto.createHash('sha256').update(fs.readFileSync(f)).digest('hex');
for (const f of ['data.js', 'long.json', 'vendor/d3.min.js', 'vendor/topojson-client.min.js', 'vendor/counties-10m.json', 'vendor/LICENCES.md'])
  t(`${f} identical to the work's`, h(join(here, f)) === h(join(work, f)));
const strip = s => s.replace(/href="[^"]*"/g, '');
t('index.html identical to the work\'s but for its links', strip(fs.readFileSync(join(here, 'index.html'), 'utf8')) === strip(fs.readFileSync(join(work, 'index.html'), 'utf8')));
t('no relative link left that would break outside the work', !/href="(\.\.\/|SCORE|CRITIQUE)/.test(fs.readFileSync(join(here, 'index.html'), 'utf8')));
const b = await chromium.launch({ executablePath: '/opt/pw-browsers/chromium', args: ['--allow-file-access-from-files'] });
for (const [w, scheme] of [[390, 'light'], [1100, 'dark']]) {
  const ctx = await b.newContext({ viewport: { width: w, height: 900 }, colorScheme: scheme });
  const p = await ctx.newPage(); const errs = [];
  p.on('pageerror', e => errs.push(String(e))); p.on('console', x => x.type() === 'error' && errs.push(x.text()));
  await p.goto('file://' + join(here, 'index.html') + '#w1');
  await p.waitForFunction(() => document.querySelectorAll('#map path').length > 3000, null, { timeout: 15000 });
  t(`${w} loads with its map, no overflow`, await p.evaluate(() => document.documentElement.scrollWidth <= window.innerWidth));
  await p.locator('#slip').scrollIntoViewIfNeeded();
  const sb = await p.locator('#slip').boundingBox(), db = await p.locator('.drawer[data-f="never"]').boundingBox();
  await p.mouse.move(sb.x + 20, sb.y + sb.height / 2); await p.mouse.down();
  await p.mouse.move(db.x + db.width / 2, db.y + db.height / 2, { steps: 10 }); await p.mouse.up(); await p.waitForTimeout(1600);
  t(`${w} card 1 carried into never needed: contradicted, Sandy declared`, /contradicted/i.test(await p.locator('#answer').innerText()) && (await p.locator('#card').innerText()).includes('DR-4085-NY'));
  await p.click('#more'); await p.waitForFunction(() => document.getElementById('long').textContent.length > 10 && document.getElementById('long').textContent !== '…', null, { timeout: 15000 });
  t(`${w} the whole message loads`, true);
  t(`${w} no errors`, errs.length === 0); if (errs.length) console.log(errs);
  await ctx.close();
}
await b.close();
console.log(`${pass}/${pass + fail}`); process.exit(fail ? 1 : 0);
