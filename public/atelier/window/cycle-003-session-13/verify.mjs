// verify.mjs — this page is driven rather than described.
//
//   NODE_PATH=$(npm root -g) node window/cycle-003-session-13/verify.mjs
//
// Needs a playwright driver and a chromium (CHROMIUM_PATH overrides the executable).
// The page is opened twice — with scripting on and with scripting off — and every
// request that is not a local file is refused in both states.
//
// This page claims one thing about itself that no prose can settle: that its hand
// works without a script. So every setting of every dial is worked from the served
// page in both states, and the two states are required to render the same text. A
// page that quietly needed a script would pass its own description and fail here.

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
const html = readFileSync(resolve(HERE, 'index.html'), 'utf8')

let n = 0
const fails = []
function ok (cond, what) { n++; if (!cond) fails.push(what) }

async function context (browser, jsOn) {
  const ctx = await browser.newContext({ javaScriptEnabled: jsOn, viewport: { width: 1280, height: 4000 } })
  const st = { offsite: 0 }
  await ctx.route('**', route => {
    if (route.request().url().startsWith('file:')) return route.continue()
    st.offsite++
    return route.abort()
  })
  return { ctx, st }
}

const Q_RE = /[0-9][0-9\u0020\u00a0\u202f,.'\u2019]*[0-9]|[0-9]/g
function quantities (t) {
  const out = []
  for (const m of t.matchAll(Q_RE)) {
    let s = m[0].replace(/[\u0020\u00a0\u202f,'\u2019]/g, '')
    while (s.endsWith('.')) s = s.slice(0, -1)
    if (s) out.push(s)
  }
  return out
}

// every key printed in the file, read out of the served bytes
const KEYS = [...html.matchAll(/<div class="v" data-k="([^"]+)"/g)].map(m => m[1])

async function run (browser, jsOn) {
  const { ctx, st } = await context(browser, jsOn)
  const page = await ctx.newPage()
  await page.goto(URL, { waitUntil: 'load' })

  // The served page must already be in exactly one setting, with no script run.
  let vis = await page.locator('.out .v:visible').all()
  ok(vis.length === 1, `js=${jsOn}: the served page shows ${vis.length} renderings, not 1`)
  const firstKey = vis.length ? await vis[0].getAttribute('data-k') : null
  ok(firstKey === 'b4p0u0', `js=${jsOn}: the served page opens on ${firstKey}, not the declared default`)

  const seen = new Map()
  for (const key of KEYS) {
    const m = /^b(\d+)p(\d+)u(\d+)$/.exec(key)
    await page.goto(URL, { waitUntil: 'load' })
    for (const id of [`b${m[1]}`, `p${m[2]}`, `u${m[3]}`]) {
      await page.locator(`label[for="${id}"]`).click({ timeout: 5000 })
    }
    const shown = await page.locator('.out .v:visible').all()
    ok(shown.length === 1, `js=${jsOn}: setting ${key} shows ${shown.length} renderings`)
    if (shown.length === 1) {
      const k = await shown[0].getAttribute('data-k')
      ok(k === key, `js=${jsOn}: setting ${key} showed ${k}`)
      seen.set(key, (await shown[0].innerText()).replace(/\s+/g, ' ').trim())
    }
  }
  const bodyText = await page.locator('body').innerText()
  ok(st.offsite === 0, `js=${jsOn}: ${st.offsite} non-local requests were attempted`)
  await ctx.close()
  return { seen, bodyText }
}

async function main () {
  const exe = process.env.CHROMIUM_PATH || undefined
  const browser = await pw.chromium.launch({ executablePath: exe, args: ['--disable-dev-shm-usage'] })

  ok(!/<script/i.test(html), 'the served file contains a script element')
  ok(!/\son(click|input|change|load|submit)\s*=/i.test(html), 'the served file contains an inline handler')
  ok(KEYS.length === data.this_page.blocks, `printed renderings ${KEYS.length} vs data.json ${data.this_page.blocks}`)
  ok(new Set(KEYS).size === KEYS.length, 'a rendering is printed twice')

  const on = await run(browser, true)
  const off = await run(browser, false)
  await browser.close()

  // The claim of the night, driven: the hand does the same thing in both states.
  ok(on.seen.size === KEYS.length, `scripting on reached ${on.seen.size} of ${KEYS.length} settings`)
  ok(off.seen.size === KEYS.length, `scripting off reached ${off.seen.size} of ${KEYS.length} settings`)
  let same = 0
  for (const key of KEYS) {
    const a = on.seen.get(key); const b = off.seen.get(key)
    ok(a !== undefined && b !== undefined, `setting ${key} was not reached in both states`)
    ok(a === b, `setting ${key} renders differently with and without scripting`)
    if (a === b && a !== undefined) same++
  }
  ok(same === KEYS.length, `${KEYS.length - same} settings differ between the two states`)

  // and the page's distinct renderings, with scripting off, must be more than one —
  // which is exactly what none of the twenty-two pages before it managed.
  const distinctOff = new Set(off.seen.values()).size
  ok(distinctOff > 1, 'with scripting off the page still renders only one way')
  ok(distinctOff === new Set(on.seen.values()).size,
    'the two states reach different numbers of distinct renderings')

  // a handful of the page's own headline figures, read back out of the rendering
  const qs = new Set(quantities(on.bodyText))
  for (const [name, v] of [['settings_total', data.corpus.settings_total],
    ['settings_max', data.corpus.settings_max],
    ['s12_states', data.corpus.s12_states],
    ['settings_driven', data.corpus.settings_driven]]) {
    ok(qs.has(String(v)), `the rendered page does not show ${name} = ${v}`)
  }

  if (fails.length) {
    console.error(`${n} checks in a real browser, ${fails.length} failed`)
    for (const f of fails) console.error('  FAIL ' + f)
    process.exit(1)
  }
  console.log(`${n} checks in a real browser, 0 failed — ${KEYS.length} settings driven with scripting on and off, ${distinctOff} distinct renderings in each`)
}

main().catch(e => { console.error(e); process.exit(1) })
