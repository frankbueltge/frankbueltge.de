// verify.mjs — the presentation must work with the script and be complete without it.
//
// The direction of 2026-09-03 asks for interactive, client-rendered work and keeps one floor:
// an honest still frame for a reader who has no JavaScript. That floor is a claim, and reading
// the source has repeatedly failed to catch what a browser did, so it is tested instead —
// twice over the same file, once with scripting on and once with it off, and in both states
// the page is denied the network, so a page that had quietly started fetching something fails
// here rather than in the world.
//
// The check that matters most is the last one. This page's central claim is that the width of
// an interval is the unread fraction and nothing else. The live figure recomputes that in
// JavaScript from the same committed numbers the still frame was drawn from in Python, so the
// script is driven to several settings and the two arithmetics are compared.
//
//   NODE_PATH=$(npm root -g) node presentations/cycle-003/verify.mjs
//
// Needs a playwright driver and a chromium on the machine (CHROMIUM_PATH overrides the
// executable). It is a check of the page, not part of it.
//
// Author: the Atelier. Licence: Apache-2.0 with the repository.

import { readFileSync, existsSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { dirname, join } from 'node:path'
import { createRequire } from 'node:module'

const require = createRequire(import.meta.url)
let pw
try { pw = require('playwright-core') } catch { pw = require('playwright') }
const { chromium } = pw

const HERE = dirname(fileURLToPath(import.meta.url))
const URL = 'file://' + join(HERE, 'index.html')
const D = JSON.parse(readFileSync(join(HERE, 'data.json'), 'utf8'))

function findChromium () {
  if (process.env.CHROMIUM_PATH) return process.env.CHROMIUM_PATH
  const root = process.env.PLAYWRIGHT_BROWSERS_PATH || '/opt/pw-browsers'
  const named = [join(root, 'chromium', 'chrome-linux', 'chrome')]
  if (existsSync(root)) {
    for (const d of readdirSync(root)) {
      if (d.startsWith('chromium')) named.push(join(root, d, 'chrome-linux', 'chrome'))
    }
  }
  return named.find(p => existsSync(p))
}

const EXEC = findChromium()
const fails = []
let n = 0
const ok = (cond, what) => { n++; if (!cond) fails.push(what) }

const RD = D.reading
const SEED = D.ledger.filter(r => r.id === 's2-free')[0]
const LEFT = 30
const PLOT = 660 - 60

async function denyNetwork (page, outbound) {
  await page.route('**/*', route => {
    const u = route.request().url()
    if (!u.startsWith('file://')) { outbound.push(u); return route.abort() }
    return route.continue()
  })
}

const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {})

// ---- 1. without JavaScript: the still frame is a complete page ------------------------
{
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  const errs = []; const outbound = []
  page.on('pageerror', e => errs.push(String(e)))
  await denyNetwork(page, outbound)
  await page.goto(URL)

  ok(errs.length === 0, `no-JS: page errors ${JSON.stringify(errs)}`)
  ok(outbound.length === 0, `no-JS: the page asked the network for ${JSON.stringify(outbound)}`)
  ok((await page.title()).startsWith(D.meta.title), 'no-JS: the title is served')

  const figs = await page.locator('svg.fig').count()
  ok(figs === 3, `no-JS: three figures are drawn (saw ${figs})`)

  const rows = await page.locator('table tbody tr').first().locator('xpath=..')
    .locator('tr').count()
  ok(rows === D.ledger.length, `no-JS: the ledger table has ${D.ledger.length} rows (saw ${rows})`)

  // the still frame stands at the published state and says so
  const w = Number(await page.locator('#ivl').getAttribute('width'))
  ok(Math.abs(w - PLOT * SEED.free_width) < 0.6,
    `no-JS: the still interval is drawn at its published width (saw ${w})`)
  const x = Number(await page.locator('#ivl').getAttribute('x'))
  ok(Math.abs(x - (LEFT + SEED.free_lo * PLOT)) < 0.6,
    `no-JS: the still interval starts at its lower bound (saw ${x})`)
  const lab = await page.locator('#ivllab').textContent()
  ok(lab.includes(String(SEED.count)) && lab.includes(String(SEED.count + SEED.unsettled)),
    `no-JS: the still caption names both ends (saw "${lab}")`)
  ok(lab.includes((SEED.free_width * 100).toFixed(2)),
    'no-JS: the still caption states the published width')
  const sub = await page.locator('#ivlsub').textContent()
  ok(/published state/.test(sub), 'no-JS: the still frame says which state it shows')

  // the controls are present but change nothing without a script
  await page.locator('#k').fill(String(RD.unread)).catch(() => {})
  const w2 = Number(await page.locator('#ivl').getAttribute('width'))
  ok(w2 === w, 'no-JS: the figure does not move when a dead control is dragged')
  const live = await page.locator('#readfig').getAttribute('data-live')
  ok(live === null, 'no-JS: the figure is not marked live')

  // every headline the record holds is in the served HTML
  const body = await page.locator('main').innerText()
  for (const s of [(SEED.free_width * 100).toFixed(2),
    (SEED.free_lo * 100).toFixed(2), (SEED.free_hi * 100).toFixed(2)]) {
    ok(body.includes(s), `no-JS: the served page states ${s}`)
  }
  ok(body.includes(String(D.identity.tested)), 'no-JS: the served page states how many shares were tested')

  await ctx.close()
}

// ---- 2. with JavaScript: the live figure agrees with the record -----------------------
{
  const ctx = await browser.newContext({ javaScriptEnabled: true })
  const page = await ctx.newPage()
  const errs = []; const outbound = []
  page.on('pageerror', e => errs.push(String(e)))
  await denyNetwork(page, outbound)
  await page.goto(URL)
  await page.waitForSelector('#readfig[data-live="1"]')

  ok(errs.length === 0, `JS: page errors ${JSON.stringify(errs)}`)
  ok(outbound.length === 0, `JS: the page asked the network for ${JSON.stringify(outbound)}`)

  // at the default setting the live figure must be the still frame, exactly
  const w0 = Number(await page.locator('#ivl').getAttribute('width'))
  ok(Math.abs(w0 - PLOT * SEED.free_width) < 0.6,
    `JS: at rest the live figure equals the still one (saw ${w0})`)

  // the width follows the reading and nothing else: same k, three different yes-rates
  for (const k of [0, 100, 235, 470]) {
    await page.locator('#k').fill(String(k))
    await page.locator('#k').dispatchEvent('input')
    const widths = []
    for (const p of [0, 43, 100]) {
      await page.locator('#p').fill(String(p))
      await page.locator('#p').dispatchEvent('input')
      widths.push(Number(await page.locator('#ivl').getAttribute('width')))
      const txt = await page.locator('#ivllab').textContent()
      const want = ((RD.unread - k) / RD.n * 100).toFixed(2)
      ok(txt.includes(want),
        `JS: at ${k} read and ${p}% yes the caption states a width of ${want} (saw "${txt}")`)
    }
    ok(new Set(widths.map(v => v.toFixed(1))).size === 1,
      `JS: at ${k} read the width does not depend on the yes-rate (saw ${widths})`)
  }

  // the position follows the yes-rate and nothing else
  await page.locator('#k').fill('470')
  await page.locator('#k').dispatchEvent('input')
  const xs = []
  for (const p of [0, 50, 100]) {
    await page.locator('#p').fill(String(p))
    await page.locator('#p').dispatchEvent('input')
    xs.push(Number(await page.locator('#ivl').getAttribute('x')))
  }
  ok(xs[0] < xs[1] && xs[1] < xs[2], `JS: reading everything moves the answer with the rate (saw ${xs})`)
  ok(Math.abs(xs[0] - (LEFT + (RD.yes / RD.n) * PLOT)) < 1,
    'JS: reading everything and finding no more leaves the published count')
  ok(Math.abs(xs[2] - (LEFT + ((RD.yes + RD.unread) / RD.n) * PLOT)) < 1,
    'JS: reading everything and finding all yes reaches the upper bound')

  // each committed target is exactly the reading it claims to be
  for (const t of D.reading.targets) {
    await page.locator('#k').fill(String(t.must_read))
    await page.locator('#k').dispatchEvent('input')
    const txt = await page.locator('#ivllab').textContent()
    const w = Number(txt.match(/([\d.]+) points wide/)[1]) / 100
    ok(w <= t.want + 1e-9, `JS: reading ${t.must_read} gets the width under ${t.want}`)
    await page.locator('#k').fill(String(t.must_read - 1))
    await page.locator('#k').dispatchEvent('input')
    const txt2 = await page.locator('#ivllab').textContent()
    const w2 = Number(txt2.match(/([\d.]+) points wide/)[1]) / 100
    ok(w2 > t.want - 1e-9, `JS: reading one fewer than ${t.must_read} does not`)
  }

  // back to rest: the live figure must return to the state the still frame shows
  await page.locator('#k').fill('0')
  await page.locator('#k').dispatchEvent('input')
  const back = await page.locator('#ivlsub').textContent()
  ok(/published state/.test(back), 'JS: returning to zero returns to the published state')

  await ctx.close()
}

await browser.close()

console.log(`${n} checks in a real browser`)
if (fails.length) {
  console.log(`${fails.length} FAILED:`)
  for (const f of fails) console.log('  ✗ ' + f)
  process.exit(1)
}
console.log('all passed')
