// verify.mjs — the page in a real browser: scripting on and off, every non-local request refused,
// phone and desk widths, light and dark.
//   NODE_PATH=$(npm root -g) node window/cycle-003-session-20/verify.mjs
import { createRequire } from 'node:module'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'
const require = createRequire(import.meta.url)
let pw
try { pw = require('playwright-core') } catch { pw = require('playwright') }
const HERE = dirname(fileURLToPath(import.meta.url))
const URL = 'file://' + resolve(HERE, 'index.html')
let n = 0
const fails = []
function ok (c, what) { n++; if (!c) fails.push(what) }
const browser = await pw.chromium.launch(process.env.CHROME ? { executablePath: process.env.CHROME } : {})
const bgs = {}
for (const js of [true, false]) for (const width of [390, 1100]) for (const scheme of ['light', 'dark']) {
  const tag = `js ${js ? 'on' : 'off'} · ${width}px · ${scheme}`
  const ctx = await browser.newContext({ javaScriptEnabled: js, viewport: { width, height: 900 }, colorScheme: scheme })
  let offsite = 0
  await ctx.route('**', r => { if (r.request().url().startsWith('file:')) return r.continue(); offsite++; return r.abort() })
  const page = await ctx.newPage()
  await page.goto(URL, { waitUntil: 'load' })
  ok(offsite === 0, `${tag}: no off-site request`)
  const docW = await page.evaluate(() => document.documentElement.scrollWidth).catch(() => null)
  if (docW !== null) ok(docW <= width, `${tag}: no page-wide horizontal scroll (${docW})`)
  ok(await page.locator('svg.fa polyline').count() === 2 && await page.locator('svg.fb polyline').count() === 2, `${tag}: four lines`)
  ok(await page.locator('svg circle').count() === 96, `${tag}: all points`)
  for (const f of ['svg.fa', 'svg.fb']) {
    const box = await page.locator(f).boundingBox()
    ok(box && box.width > 300, `${tag}: ${f} drawn`)
  }
  ok(await page.locator('table').nth(0).locator('tr').count() === 5, `${tag}: summary table whole`)
  ok(await page.locator('table').nth(1).locator('tr').count() === 25, `${tag}: hour table whole`)
  ok(await page.locator('tr.w').count() === 6, `${tag}: W rows marked`)
  ok(await page.locator('script').count() === 0, `${tag}: no script element`)
  const bg = await page.locator('body').evaluate(e => getComputedStyle(e).backgroundColor).catch(() => null)
  if (bg !== null) { ok(bg !== 'rgba(0, 0, 0, 0)', `${tag}: body background`); bgs[scheme] = bg }
  const text = await page.locator('main').innerText()
  ok(text.includes('The weekend’s own hearing'), `${tag}: heading`)
  ok(text.includes('What would refute this page'), `${tag}: refutation condition`)
  await ctx.close()
}
ok(bgs.light !== bgs.dark, 'light and dark backgrounds differ')
await browser.close()
console.log(`${n} checks, ${fails.length} failed`)
for (const f of fails) console.log('FAIL', f)
process.exit(fails.length ? 1 : 0)
