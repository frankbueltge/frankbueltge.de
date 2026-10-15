// verify.mjs — the page must work with the script and be complete without it.
//
// The direction of 2026-09-03 asks for interactive, client-rendered work and keeps
// one floor: an honest still frame for a reader who has no JavaScript. That floor is
// a claim, and a claim this practice has not tested is a claim. This tests it, twice
// over the same file: once with scripting on, once with it off.
//
//   node --experimental-default-type=module window/cycle-002-session-3/verify.mjs
//
// Needs playwright-core and a chromium on the machine; it is a check of the page, not
// part of it, and the page itself loads nothing at runtime.
//
// Author: the Atelier. Licence: Apache-2.0 with the repository.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'

// Resolved through require rather than imported, so NODE_PATH still works: this file
// lives in the repository and the driver does not, which is the right way round.
const require = createRequire(import.meta.url)
const { chromium } = require('playwright-core')

const HERE = dirname(fileURLToPath(import.meta.url))
const URL = 'file://' + join(HERE, 'index.html')
const DATA = JSON.parse(readFileSync(join(HERE, 'data.json'), 'utf8'))
const EXEC = process.env.CHROMIUM_PATH || '/opt/pw-browsers/chromium/chrome-linux/chrome'

const fails = []
let n = 0
const ok = (cond, what) => { n++; if (!cond) fails.push(what) }

const totalFields = DATA.summary.fields_total

const browser = await chromium.launch({ executablePath: EXEC })

// ---- 1. without JavaScript: every row, both figures, no loss but the sorting
{
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  await page.goto(URL)
  const rows = await page.locator('tbody tr[data-cat]').count()
  ok(rows === totalFields, `no-JS: ${rows} column rows, expected ${totalFields}`)
  const svgs = await page.locator('svg.fig').count()
  ok(svgs === DATA.summary.catalogues, `no-JS: ${svgs} figures, expected ${DATA.summary.catalogues}`)
  const controls = await page.locator('#controls').evaluate(e => getComputedStyle(e).display)
  ok(controls === 'none', `no-JS: the controls must stay hidden, got ${controls}`)
  // the headline number is in the served document, not painted in later
  const body = await page.locator('body').innerText()
  ok(body.includes(`${DATA.summary.removable} of the ${totalFields} columns`),
    'no-JS: the headline is missing from the served document')
  for (const cat of DATA.catalogues) {
    if (!cat.fields) continue
    for (const f of cat.fields) {
      ok(body.includes(f.field), `no-JS: column ${cat.catalogue}.${f.field} is not in the text`)
    }
  }
  await ctx.close()
}

// ---- 2. with JavaScript: the controls appear, sorting and filtering do something
{
  const ctx = await browser.newContext()
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errors.push(m.text()) })
  await page.goto(URL)
  await page.waitForTimeout(150)

  ok(errors.length === 0, `JS: the page threw — ${errors[0] || ''}`)

  const controls = await page.locator('#controls').evaluate(e => getComputedStyle(e).display)
  ok(controls !== 'none', 'JS: the controls did not appear')

  const first = () => page.locator('tbody tr[data-cat]').first().locator('td').first().innerText()

  // default sort is by residual, descending: the top row of the atlas table is its
  // most constant column
  const atlas = DATA.catalogues.find(c => c.catalogue === 'atlas')
  const top = atlas.fields.slice().sort((a, b) => b.residual - a.residual)[0].field
  ok((await first()) === top, `JS: default sort put ${await first()} on top, expected ${top}`)

  // sorting by name reorders
  await page.locator('button[data-sort="field"]').click()
  const byName = atlas.fields.map(f => f.field).sort()[0]
  ok((await first()) === byName, `JS: sort by name put ${await first()} on top, expected ${byName}`)

  // filtering by a verdict shows exactly the columns carrying that flag
  await page.locator('button[data-filter="constant"]').click()
  const shown = await page.locator('tbody tr[data-cat]:visible').count()
  const expected = DATA.catalogues
    .filter(c => c.fields)
    .reduce((s, c) => s + c.fields.filter(f => f.flags.includes('constant')).length, 0)
  ok(shown === expected, `JS: filter "constant" showed ${shown} columns, expected ${expected}`)

  // opening a column reads out what is actually in it — whatever the current sort
  // has put on top, which is not the default one any more by this point
  await page.locator('button[data-filter="all"]').click()
  const opened = await first()
  await page.locator('tbody tr[data-cat]').first().click()
  const readout = await page.locator('#readout').innerText()
  ok(readout.includes(opened), `JS: the readout named something other than ${opened}`)
  ok(/residual/.test(readout), 'JS: the readout carries no numbers')

  await ctx.close()
}

await browser.close()

if (fails.length) {
  console.error(`FAILED after ${n} checks — ${fails.length} disagreement(s):`)
  for (const f of fails.slice(0, 15)) console.error('  ·', f)
  process.exit(1)
}
console.log(`${n} checks passed, with the script and without it.`)
