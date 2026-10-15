// verify.mjs — the page is driven in a real browser rather than read.
//
//   NODE_PATH=$(npm root -g) node window/cycle-003-session-12/verify.mjs
//
// Needs a playwright driver and a chromium (CHROMIUM_PATH overrides the executable).
// The file is opened twice, with scripting on and with it off, and every request that is
// not a local file is refused in both states, so a page that had quietly acquired a
// dependency fails here rather than in the world.
//
// This page claims two things about itself and both are driven, not described: that its
// hand only selects among what it already serves, and that the whole verdict curve is in
// the served text. So every reading, both units and every threshold are worked through the
// controls, and each readout is checked against the cell the page served before any script
// ran. It is a check of the page, not part of it.

import { createRequire } from 'node:module'
import { readFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
let pw
try { pw = require('playwright-core') } catch { pw = require('playwright') }

const HERE = dirname(fileURLToPath(import.meta.url))
const URL = 'file://' + resolve(HERE, 'index.html')
const data = JSON.parse(readFileSync(resolve(HERE, 'data.json'), 'utf8'))

let n = 0
const fails = []
function ok (cond, what) { n++; if (!cond) fails.push(what) }

async function context (browser, jsOn) {
  const ctx = await browser.newContext({ javaScriptEnabled: jsOn,
    viewport: { width: 1280, height: 3000 } })
  let offsite = 0
  await ctx.route('**', route => {
    const u = route.request().url()
    if (u.startsWith('file:')) return route.continue()
    offsite++
    return route.abort()
  })
  const page = await ctx.newPage()
  const errs = []
  page.on('pageerror', e => errs.push(String(e)))
  await page.goto(URL, { waitUntil: 'load' })
  await page.waitForTimeout(100)
  return { ctx, page, errs, offsite: () => offsite }
}

async function main () {
  const launchOpts = {}
  if (process.env.CHROMIUM_PATH) launchOpts.executablePath = process.env.CHROMIUM_PATH
  const browser = await pw.chromium.launch(launchOpts)
  const readings = data.readings.map(r => r.name)
  const kmax = data.kmax
  const pages = data.pages.length

  // ---- scripting off: the page must be a complete document ------------------------
  {
    const { ctx, page, errs, offsite } = await context(browser, false)
    const text = await page.locator('body').innerText()
    ok((await page.locator('#ledger tbody tr').count()) === pages,
       'scripting off: the ledger must carry every page of the corpus')
    ok((await page.locator('#curve tbody tr').count()) === 2 * readings.length,
       'scripting off: the curve must carry both units and every reading')
    ok((await page.locator('#ledger tbody tr.out').count()) === 0,
       'scripting off: no row may be dimmed before any hand touches the page')
    for (const unit of ['q', 'l']) {
      for (const reading of readings) {
        const row = page.locator(`#curve tbody tr[data-unit="${unit}"][data-reading="${reading}"]`)
        ok(await row.count() === 1, `scripting off: the curve row for ${unit}/${reading}`)
        const cells = await row.locator('td.num').allInnerTexts()
        const want = data.verdict_curves[unit][reading].slice(1, kmax + 1).map(String)
        ok(JSON.stringify(cells) === JSON.stringify(want),
           `scripting off: the served curve for ${unit}/${reading} must match the evidence`)
      }
    }
    ok(text.includes(String(data.totals.add_q)), 'scripting off: the added total is served')
    ok(text.includes(String(data.totals.hide_q)), 'scripting off: the withheld total is served')
    ok(text.includes(data.totals.add_share), 'scripting off: the added share is served')
    ok(errs.length === 0, 'scripting off: the page must raise no error')
    ok(offsite() === 0, 'scripting off: the page must request nothing off the filesystem')
    await ctx.close()
  }

  // ---- scripting on: every reading, both units, every threshold --------------------
  {
    const { ctx, page, errs, offsite } = await context(browser, true)
    ok((await page.locator('#ledger tbody tr').count()) === pages,
       'scripting on: the ledger must carry every page of the corpus')
    const servedQ = new Set((await page.locator('body').innerText())
      .match(/[0-9][0-9   ,.'’]*[0-9]|[0-9]/g)
      .map(t => t.replace(/[   ,'’]/g, '').replace(/\.+$/, '')))

    for (const unit of ['q', 'l']) {
      await page.locator(`input[name=unit][value="${unit}"]`).evaluate(el => {
        el.checked = true
        el.dispatchEvent(new Event('change', { bubbles: true }))
      })
      for (const reading of readings) {
        await page.locator(`input[name=reading][value="${reading}"]`).evaluate(el => {
          el.checked = true
          el.dispatchEvent(new Event('change', { bubbles: true }))
        })
        for (let k = 1; k <= kmax; k++) {
          await page.locator('#k').evaluate((el, v) => {
            el.value = String(v)
            el.dispatchEvent(new Event('input', { bubbles: true }))
          }, k)
          await page.waitForTimeout(6)
          const want = data.verdict_curves[unit][reading][k]
          const shown = pages - (await page.locator('#ledger tbody tr.out').count())
          ok(shown === want,
             `scripting on: ${unit}/${reading}/k=${k} must leave ${want} rows, left ${shown}`)
          const out = (await page.locator('#out').innerText()).match(/\d+/g)
          ok(out && Number(out[0]) === want,
             `scripting on: ${unit}/${reading}/k=${k} readout must say ${want}`)
          ok(servedQ.has(String(want)),
             `scripting on: the readout ${want} must already be in the served text`)
          const kv = await page.locator('#kv').innerText()
          ok(Number(kv) === k, `scripting on: the threshold readout at k=${k}`)
          const lit = await page.locator('#curve tbody tr:not(.out)').count()
          ok(lit === 1, `scripting on: exactly one curve row may be lit at ${unit}/${reading}`)
        }
      }
    }
    ok(errs.length === 0, 'scripting on: the page must raise no error')
    ok(offsite() === 0, 'scripting on: the page must request nothing off the filesystem')
    await ctx.close()
  }

  await browser.close()
  console.log(`${n} checks in a real browser, ${fails.length} failed`)
  for (const f of fails) console.log('  FAIL ' + f)
  process.exit(fails.length ? 1 : 0)
}

await main()
