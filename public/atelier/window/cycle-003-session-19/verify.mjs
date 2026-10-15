// verify.mjs — the page in a real browser: scripting on and off, every non-local request
// refused, at phone and desk widths, light and dark. Checks that nothing overflows, that the
// three figures carry every mark the results hold, that the tables are whole, and that the
// body has its own background in both schemes.
//
//   NODE_PATH=$(npm root -g) node window/cycle-003-session-19/verify.mjs

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
function ok (cond, what) { n++; if (!cond) fails.push(what) }

const browser = await pw.chromium.launch()
const bgs = {}
for (const js of [true, false]) for (const width of [390, 1100]) for (const scheme of ['light', 'dark']) {
  const tag = `js ${js ? 'on' : 'off'} · ${width}px · ${scheme}`
  const ctx = await browser.newContext({ javaScriptEnabled: js, viewport: { width, height: 900 }, colorScheme: scheme })
  let offsite = 0
  await ctx.route('**', route => {
    if (route.request().url().startsWith('file:')) return route.continue()
    offsite++
    return route.abort()
  })
  const page = await ctx.newPage()
  await page.goto(URL, { waitUntil: 'load' })
  ok(offsite === 0, `${tag}: no off-site request`)
  const docW = await page.evaluate(() => document.documentElement.scrollWidth).catch(() => null)
  if (docW !== null) ok(docW <= width, `${tag}: no page-wide horizontal scroll (${docW})`)
  ok(await page.locator('svg.f1 rect.bar.lab').count() === 24, `${tag}: f1 every hour`)
  ok(await page.locator('svg.f2 polyline').count() === 2, `${tag}: f2 two lines`)
  ok(await page.locator('svg.f2 circle').count() === 48, `${tag}: f2 all points`)
  ok(await page.locator('svg.f3 rect.bar').count() === 24, `${tag}: f3 every block`)
  ok(await page.locator('svg.f3 rect.bar.hi').count() === 1, `${tag}: f3 W marked`)
  for (const f of ['svg.f1', 'svg.f2', 'svg.f3']) {
    const box = await page.locator(f).boundingBox()
    ok(box && box.width > 300, `${tag}: ${f} drawn`)
  }
  const rows = [7, 25, 12, 14]
  for (let i = 0; i < rows.length; i++) {
    ok(await page.locator('table').nth(i).locator('tr').count() === rows[i], `${tag}: table ${i} whole`)
  }
  ok(await page.locator('tr.w').count() === 6, `${tag}: W rows marked`)
  const bg = await page.locator('body').evaluate(e => getComputedStyle(e).backgroundColor).catch(() => null)
  if (bg !== null) { ok(bg !== 'rgba(0, 0, 0, 0)', `${tag}: body background`); bgs[scheme] = bg }
  const text = await page.locator('main').innerText()
  ok(text.includes('Filled by the quarry'), `${tag}: heading`)
  ok(text.includes('two errors of opposite sign'), `${tag}: finding`)
  if (js && width === 390 && scheme === 'light' && process.env.SHOT) await page.screenshot({ path: process.env.SHOT, fullPage: true })
  if (js && width === 1100 && scheme === 'dark' && process.env.SHOT2) await page.screenshot({ path: process.env.SHOT2, fullPage: true })
  await ctx.close()
}
ok(bgs.light && bgs.dark && bgs.light !== bgs.dark, 'light and dark backgrounds differ')
await browser.close()
console.log(`${n} checks, ${fails.length} failed`)
for (const f of fails) console.log('  FAIL', f)
process.exit(fails.length)
