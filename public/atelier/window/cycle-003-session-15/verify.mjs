// verify.mjs — a real browser, scripting on and off, every non-local request refused,
// at phone and desk widths. The page has no script; that the two states agree, that
// nothing overflows at 390 px, and that the figure and table carry all 41 units are
// checked, not assumed.
//
//   NODE_PATH=$(npm root -g) node window/cycle-003-session-15/verify.mjs

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

async function run (browser, jsOn, width) {
  const ctx = await browser.newContext({ javaScriptEnabled: jsOn, viewport: { width, height: 900 } })
  let offsite = 0
  await ctx.route('**', route => {
    if (route.request().url().startsWith('file:')) return route.continue()
    offsite++
    return route.abort()
  })
  const page = await ctx.newPage()
  await page.goto(URL, { waitUntil: 'load' })
  const text = await page.locator('main').innerText()
  const overflow = await page.evaluate(() => document.documentElement.scrollWidth > window.innerWidth + 1)
    .catch(() => null)
  const dots = await page.locator('svg circle').count()
  const rows = await page.locator('tr[class]').count()
  await ctx.close()
  return { text, offsite, overflow, dots, rows }
}

async function main () {
  const execPath = process.env.CHROMIUM_PATH || undefined
  const browser = await pw.chromium.launch(execPath ? { executablePath: execPath } : {})
  try {
    for (const width of [390, 1100]) {
      const on = await run(browser, true, width)
      const off = await run(browser, false, width)
      ok(on.offsite === 0 && off.offsite === 0, `${width}px: no offsite request`)
      ok(on.text === off.text, `${width}px: scripting on and off render identical text`)
      ok(on.overflow === false, `${width}px: no horizontal page scroll`)
      ok(on.dots === 41 && off.dots === 41, `${width}px: 41 dots`)
      ok(on.rows === 41 && off.rows === 41, `${width}px: 41 table rows`)
      const S = data.summary
      for (const needle of ['Twice in eighteen', 'not out of 41', `rounded ${S.half_up_among_those} times and truncated ${S.trunc_among_those}`,
        `${S.widening_percent} % more`, `fall from ${S.consistent_under_either} to ${S.consistent_under_half_up_alone}`]) {
        ok(on.text.includes(needle), `${width}px: renders "${needle}"`)
      }
    }
  } finally {
    await browser.close()
  }
  if (fails.length) {
    console.log(`FAILED ${fails.length} of ${n} check(s):`)
    for (const f of fails) console.log(' -', f)
    process.exit(1)
  }
  console.log(`all ${n} browser checks passed`)
}

main()
