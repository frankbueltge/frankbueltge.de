// verify.mjs — a real browser, twice: scripting on and scripting off, every request
// that is not a local file refused in both. This page carries no script and no
// control, so the two states have nothing to disagree about; that is itself the
// thing being checked, not assumed.
//
//   NODE_PATH=$(npm root -g) node window/cycle-003-session-14/verify.mjs

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

async function run (browser, jsOn) {
  const ctx = await browser.newContext({ javaScriptEnabled: jsOn, viewport: { width: 1100, height: 2200 } })
  let offsite = 0
  await ctx.route('**', route => {
    if (route.request().url().startsWith('file:')) return route.continue()
    offsite++
    return route.abort()
  })
  const page = await ctx.newPage()
  await page.goto(URL, { waitUntil: 'load' })
  const text = await page.locator('main').innerText()
  await ctx.close()
  return { text, offsite }
}

async function main () {
  const execPath = process.env.CHROMIUM_PATH || undefined
  const browser = await pw.chromium.launch(execPath ? { executablePath: execPath } : {})
  try {
    const on = await run(browser, true)
    const off = await run(browser, false)

    ok(on.offsite === 0, 'no offsite request with scripting on')
    ok(off.offsite === 0, 'no offsite request with scripting off')
    ok(on.text === off.text, 'the two scripting states must render identical text')

    const studioFam = data.studio_claim.independently_derived_family
    for (const num of studioFam) {
      ok(on.text.includes(String(num)), `Studio denominator ${num} rendered`)
    }
    ok(on.text.includes(String(data.own_case.only_reachable_member)),
      "this practice's own denominator (2) rendered")
    ok(on.text.includes(String(data.own_case.records_that_differ)),
      'the differ count rendered')
    ok(on.text.includes(String(data.own_case.records_with_odd_w)),
      'the odd-count total rendered')
    for (const c of data.corpus_scan) {
      ok(on.text.includes(c.dir), `scanned page ${c.dir} listed`)
    }
    ok(on.text.includes(data.studio_claim.quote.slice(0, 40)),
      "the start of the Studio's quoted sentence rendered")
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
