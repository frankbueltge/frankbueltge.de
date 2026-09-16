// verify.mjs — the page must work with the script and be complete without it.
//
// The direction of 2026-09-03 asks for interactive, client-rendered work and keeps one floor:
// an honest still frame for a reader with no JavaScript. That floor is a claim, and reading
// source has repeatedly failed to catch what a browser actually does, so it is tested — twice
// over the same file, once with scripting on and once with it off, and in both states the page
// is denied the network, so a page that had quietly started fetching something fails here
// rather than in the world.
//
// The checks that matter most are the last two groups. This page's claim is that a change in a
// count splits into arrival, departure and repair; that the repair term is empty; and that two
// of the six readings refuse the split, one of them silently. So the hand is actually used —
// the terms are joined into the single net number a count would give and split again — and the
// geometry of every bar is read back out of the DOM and compared with the committed numbers.
//
//   NODE_PATH=$(npm root -g) node window/cycle-003-session-8/verify.mjs
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

const COUNTS = D.series.filter(s => s.kind !== 'rate')
const MEM = D.membership
const thin = v => v.toLocaleString('en-GB').replace(/,/g, ' ')
const near = (a, b, eps = 0.02) => Math.abs(a - b) <= eps

async function denyNetwork (page, outbound) {
  await page.route('**/*', route => {
    const u = route.request().url()
    if (!u.startsWith('file://')) { outbound.push(u); return route.abort() }
    return route.continue()
  })
}

const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {})

// ---- 1. without JavaScript: the still frame is the complete, split page ----------------
{
  const ctx = await browser.newContext({ javaScriptEnabled: false })
  const page = await ctx.newPage()
  const errs = []; const outbound = []
  page.on('pageerror', e => errs.push(String(e)))
  await denyNetwork(page, outbound)
  await page.goto(URL)

  ok(errs.length === 0, `no-JS: page errors ${JSON.stringify(errs)}`)
  ok(outbound.length === 0, `no-JS: the page asked the network for ${JSON.stringify(outbound)}`)
  ok((await page.title()).includes('The repair term'), 'no-JS: the title is served')

  const body = await page.locator('body').innerText()

  // every reading, on all three nights, with its split and its residual
  const rows = await page.locator('tr.rd').count()
  ok(rows === D.series.length, `no-JS: ${D.series.length} readings are served (saw ${rows})`)
  for (const s of COUNTS) {
    for (const [what, v] of [['tonight', s.now], ['last night', s.was], ['first night', s.first],
      ['arrival term', s.arrived], ['departure term', s.left]]) {
      ok(body.includes(thin(v)), `no-JS: ${s.id} ${what} (${thin(v)}) is in the served text`)
    }
    const cls = await page.locator(`tr.rd[data-id="${s.id}"] .kl`).innerText()
    ok(cls.trim() === s.klass, `no-JS: ${s.id} is served as ${s.klass} (saw ${cls.trim()})`)
    const adm = await page.locator(`tr.rd[data-id="${s.id}"]`).getAttribute('data-admits')
    ok(adm === (s.admits ? '1' : '0'), `no-JS: ${s.id} admits flag is served`)
  }

  // the figure is drawn APART in the still frame — the split is the honest default
  for (const s of COUNTS) {
    const g = page.locator(`g.bg[data-id="${s.id}"]`)
    const a = parseFloat(await g.getAttribute('data-a'))
    const d = parseFloat(await g.getAttribute('data-d'))
    const ha = parseFloat(await g.locator('.b-a').getAttribute('height'))
    const hd = parseFloat(await g.locator('.b-d').getAttribute('height'))
    ok(near(ha, a), `no-JS: ${s.id}'s arrival bar is drawn at its full term`)
    ok(near(hd, d), `no-JS: ${s.id}'s departure bar is drawn at its full term`)
    // the two bars stand in the ratio of the two terms, so the picture cannot flatter the net
    if (s.left > 0 && s.arrived > 0) {
      ok(near(ha / hd, s.arrived / s.left, 0.01),
        `no-JS: ${s.id}'s bars are in the ratio of arrivals to departures`)
    }
  }

  // the load-bearing numbers of the other sections
  for (const v of [MEM.papers.left, MEM.papers.arrived, MEM.papers.gross, MEM.papers.was,
    MEM.papers.now, D.repair.records_compared, D.condition.n_first, D.condition.n_now,
    D.condition.still_short, D.condition.arxiv_lost]) {
    ok(body.includes(thin(v)), `no-JS: the served page states ${thin(v)}`)
  }
  ok(/Jim Gray/.test(body) && /1997/.test(body), 'no-JS: the outside source is named')
  ok(/cs\/0701155/.test(body), 'no-JS: where the outside source was read is named')
  ok(/Refutation conditions for tonight/.test(body), 'no-JS: this page states its own condition')
  ok(/transient pipeline state/.test(body), 'no-JS: the settled condition is quoted')
  ok(/distributive/.test(body) && /algebraic/.test(body) && /holistic/.test(body),
    'no-JS: the trichotomy is served')

  // the control is present and dead
  const before = await page.locator('g.bg[data-id="R1"] .b-a').getAttribute('height')
  await page.locator('#btn').click({ force: true }).catch(() => {})
  ok(await page.locator('g.bg[data-id="R1"] .b-a').getAttribute('height') === before,
    'no-JS: the figure does not move when a dead control is clicked')

  await ctx.close()
}

// ---- 2. with JavaScript: the hand joins the terms, and two readings refuse the split ----
{
  const ctx = await browser.newContext({ javaScriptEnabled: true })
  const page = await ctx.newPage()
  const errs = []; const outbound = []
  page.on('pageerror', e => errs.push(String(e)))
  await denyNetwork(page, outbound)
  await page.goto(URL)
  await page.waitForFunction(() => document.body.classList.contains('on'))

  ok(errs.length === 0, `JS: page errors ${JSON.stringify(errs)}`)
  ok(outbound.length === 0, `JS: the page asked the network for ${JSON.stringify(outbound)}`)
  ok(await page.locator('#hand').isVisible(), 'JS: the hand appears')
  ok(await page.locator('body.split').count() === 1, 'JS: the page starts split')

  // the refusal is marked on exactly the readings whose class refuses it — not on the
  // readings whose residual happens to be non-zero, which is the page's whole argument.
  const refused = await page.locator('tr.rd .terms.refused').count()
  const shouldRefuse = D.series.filter(s => !s.admits).length
  ok(refused === shouldRefuse,
    `JS: ${shouldRefuse} readings are marked as refusing (saw ${refused})`)
  for (const s of D.series) {
    const marked = await page.locator(`tr.rd[data-id="${s.id}"] .terms.refused`).count()
    ok((marked === 1) === !s.admits, `JS: ${s.id} is marked exactly when its class refuses`)
  }
  const silent = D.series.find(s => !s.admits && s.residual === 0)
  ok(silent !== undefined, 'JS: there is a reading that refuses although its residual is zero')
  ok(await page.locator(`tr.rd[data-id="${silent.id}"] .res.ok`).count() === 1,
    `JS: ${silent.id} shows a zero residual and is refused anyway`)

  const note0 = await page.locator('#handnote').innerText()
  ok(note0.includes(String(shouldRefuse)), 'JS: the note counts the refusals')
  ok(note0.includes(String(D.repair.cells_filled)), 'JS: the note states the repair term')

  // ---- the act: join the terms into the one number a count would give -------------------
  await page.locator('#btn').click()
  await page.waitForFunction(() => document.body.classList.contains('joined'))
  ok(await page.locator('#btn').getAttribute('aria-pressed') === 'true', 'JS: the hand is pressed')

  for (const s of COUNTS) {
    const g = page.locator(`g.bg[data-id="${s.id}"]`)
    const net = parseFloat(await g.getAttribute('data-net'))
    const ha = parseFloat(await g.locator('.b-a').getAttribute('height'))
    const hd = parseFloat(await g.locator('.b-d').getAttribute('height'))
    ok(near(ha, Math.max(net, 0)), `JS: joined, ${s.id}'s bar above the line is the net`)
    ok(near(hd, Math.max(-net, 0)), `JS: joined, ${s.id}'s bar below the line is the net`)
    // and the joined bar is genuinely smaller than either term it was made of
    if (s.arrived > 0 && s.left > 0) {
      const full = parseFloat(await g.getAttribute('data-a'))
      ok(ha + hd < full, `JS: joining ${s.id} loses the size of the movement`)
    }
  }
  const joinedNote = await page.locator('#handnote').innerText()
  ok(/one number again/.test(joinedNote), 'JS: the joined state says what was lost')
  ok(await page.locator('tr.rd .terms.refused').count() === 0,
    'JS: joined, nothing is marked as refusing — there is nothing to refuse')

  // ---- and split again: the page returns to its served state ---------------------------
  await page.locator('#btn').click()
  await page.waitForFunction(() => document.body.classList.contains('split'))
  for (const s of COUNTS) {
    const g = page.locator(`g.bg[data-id="${s.id}"]`)
    ok(near(parseFloat(await g.locator('.b-a').getAttribute('height')),
      parseFloat(await g.getAttribute('data-a'))),
    `JS: split again, ${s.id} is back at its arrival term`)
  }
  ok(await page.locator('tr.rd .terms.refused').count() === shouldRefuse,
    'JS: split again, the refusals are back')

  // ---- the numbers in the DOM are the committed ones -----------------------------------
  const body = await page.locator('body').innerText()
  for (const s of COUNTS) {
    ok(body.includes(thin(s.now)), `JS: ${s.id} tonight is in the text`)
    ok(body.includes(thin(s.arrived)) && body.includes(thin(s.left)),
      `JS: ${s.id}'s terms are in the text`)
  }
  ok(body.includes(thin(D.repair.records_compared)), 'JS: the survivor count is in the text')

  await ctx.close()
}

await browser.close()

console.log(`${n} checks in a real browser, ${fails.length} failed`)
for (const f of fails.slice(0, 25)) console.log('  FAIL', f)
process.exit(fails.length ? 1 : 0)
