// verify.mjs — the page must work with the script and be complete without it.
//
// The direction of 2026-09-03 asks for interactive, client-rendered work and keeps one
// floor: an honest still frame for a reader who has no JavaScript. That floor is a claim,
// and reading the source has now failed five times to catch what a browser did. So it is
// tested rather than asserted, twice over the same file: once with scripting on, once with
// it off — and in both states the page is denied the network, so a page that had quietly
// started fetching something fails here rather than in the world.
//
// The check that matters most is the last one. The page has two arithmetics — Python's
// `shelf.profile` for the still frame, JavaScript's `profile` for the live one — and two
// arithmetics that are supposed to agree are two chances to publish different numbers for
// the same question. So the script is driven back to the still frame's own window and its
// bars are read out of the DOM and compared with the record, share by share.
//
//   NODE_PATH=$(npm root -g) node window/cycle-003-session-4/verify.mjs
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
const THIN = ' '
const group = v => String(v).replace(/\B(?=(\d{3})+(?!\d))/g, THIN)
const pct = v => (v * 100).toFixed(1) + THIN + '%'

const PRIMARY = 'creator_works'
const WIDE = 'any_works'
const WIN = D.birth_window
const WHOLE = D.whole_arm[PRIMARY].atlas
const PAD_L = 196
const PLOT = 620 - PAD_L - 58
const ARMS = D.bars_matched.map(b => b.arm)

async function denyNetwork (page, outbound) {
  await page.route('**/*', route => {
    const u = route.request().url()
    if (!u.startsWith('file://')) { outbound.push(u); return route.abort() }
    return route.continue()
  })
}

const browser = await chromium.launch(EXEC ? { executablePath: EXEC } : {})

// ---- 1. without JavaScript: the still frame is a complete page -----------------------
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

  // The bar figure: one bar per arm, at the width the record says.
  const widths = await page.locator('svg.fig').first().locator('rect.bar')
    .evaluateAll(els => els.map(e => parseFloat(e.getAttribute('width'))))
  ok(widths.length === ARMS.length,
    `no-JS: one bar per arm (saw ${widths.length} of ${ARMS.length})`)
  D.bars_matched.forEach((b, i) => {
    const want = Math.max(PLOT * b.share_empty, 0.6)
    ok(Math.abs(widths[i] - want) < 0.2,
      `no-JS: ${b.arm} bar is drawn at its own share (${widths[i]} vs ${want.toFixed(1)})`)
  })
  const labs = await page.locator('svg.fig').first().locator('text.lab')
    .evaluateAll(els => els.map(e => e.textContent))
  D.bars_matched.forEach((b, i) => {
    ok(labs[i] === D.arms[b.arm].name, `no-JS: ${b.arm} is labelled in the still frame`)
  })

  // The shelf figure gives every single person a mark on the right, whatever the answer.
  const shelf = page.locator('svg.shelves')
  const held = await shelf.locator('rect.bar.held').count()
  const none = await shelf.locator('rect.nothing').count()
  const un = await shelf.locator('rect.unasked').count()
  ok(held + none + un === D.rows.length,
    `no-JS: every person has a right-hand mark (${held}+${none}+${un} of ${D.rows.length})`)
  ok(none === D.rows.filter(r => r.creator_works === 0).length,
    'no-JS: the people credited no artwork are drawn as nothing, not as absent')
  ok(un === D.rows.filter(r => r.creator_works === null).length,
    'no-JS: the people the record refused are drawn apart from the people it emptied')
  ok(held === D.rows.filter(r => r.creator_works > 0).length,
    'no-JS: the people with an artwork are drawn with it')
  // …and the pale run beside each tick is everything the record credits that is not an
  // artwork. It is the second finding, so it is checked rather than trusted.
  const other = await shelf.locator('rect.other').count()
  ok(other === D.rows.filter(r => r.any_works !== null && r.creator_works !== null &&
    Math.min((r.any_works - r.creator_works) * 7, 620 - 0.34 * 620 - 8) > 0.6 &&
    r.any_works - r.creator_works > 0).length,
  `no-JS: the non-artwork credits are drawn beside the artworks (saw ${other})`)

  // The controls are not offered, and the readout says what window the frame stands at.
  ok(await page.locator('#controls').isHidden(), 'no-JS: the controls are not offered')
  const read = await page.locator('#readout').innerText()
  ok(read.includes('still frame'), 'no-JS: the readout names itself a still frame')
  ok(read.includes(String(WIN.lo)) && read.includes(String(WIN.hi)),
    'no-JS: the readout states the window the figure stands at')

  // Every number the page leads with, in the text, grouped the way the script groups it.
  const body = await page.locator('body').innerText()
  ok(body.includes(group(WHOLE.empty)), 'no-JS: the headline count is in the text')
  ok(body.includes(pct(WHOLE.share_empty)), 'no-JS: the headline share is in the text')
  ok(body.includes(group(D.totals.atlas_works_in_first_record)),
    'no-JS: the first record\'s total is in the text')
  ok(body.includes(group(D.meta.artist_items)), 'no-JS: the number of people is in the text')
  for (const b of D.bars_matched.slice(1)) {
    ok(body.includes(pct(b.share_empty)), `no-JS: ${b.arm}'s share is in the text`)
  }
  // Every number big enough to be grouped must be grouped with the thin space and with
  // nothing else. On 2026-09-11 two files disagreed about which space this was, and both
  // wrote it as an invisible literal; here the expectation is built from the codepoint.
  const bigs = [D.questions.total, D.totals.atlas_works_in_first_record,
    D.totals.atlas_works_in_second_record].filter(v => v >= 1000)
  ok(bigs.length >= 1, 'no-JS: at least one published number is large enough to group')
  for (const v of bigs) {
    ok(body.includes(group(v)), `no-JS: ${v} is grouped with the thin space`)
    ok(!body.includes(String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ' ')),
      `no-JS: ${v} is not also grouped with an ordinary space`)
    ok(!body.includes(String(v).replace(/\B(?=(\d{3})+(?!\d))/g, ',')),
      `no-JS: ${v} is not also grouped with a comma`)
  }

  // Every figure is captioned and labelled, or a reader who cannot see it is told nothing.
  const caps = await page.locator('figure figcaption').count()
  ok(caps === 3, `no-JS: every figure carries a caption (saw ${caps})`)
  const labelled = await page.locator('svg.fig[aria-label]').count()
  ok(labelled === 3, `no-JS: every figure carries an aria-label (saw ${labelled})`)

  // The decade figure draws both arms of every decade it lists.
  const decMarks = await page.locator('svg.fig').nth(1).locator('rect.bar').count()
  const decWant = D.by_decade.filter(d => d.atlas.share_empty !== null).length +
    D.by_decade.filter(d => d.control.share_empty !== null).length
  ok(decMarks === decWant,
    `no-JS: the decade figure draws both arms of every decade (${decMarks} of ${decWant})`)

  // Tables complete without a script.
  const counts = await page.locator('table tbody')
    .evaluateAll(els => els.map(e => e.querySelectorAll('tr').length))
  const want = [D.rows.length, D.held_rows.length, D.by_decade.length,
    D.dates.paired.length, D.occupations.length, Object.keys(D.richness).length,
    D.wide.top.length, D.era.length * 2].sort((a, b) => a - b)
  ok(JSON.stringify(counts.slice().sort((a, b) => a - b)) === JSON.stringify(want),
    `no-JS: every table is served full (${JSON.stringify(counts)} vs ${JSON.stringify(want)})`)

  await ctx.close()
}

// ---- 2. with JavaScript: the live figure must agree with the still one ----------------
{
  const ctx = await browser.newContext({ javaScriptEnabled: true })
  const page = await ctx.newPage()
  const errs = []; const outbound = []
  page.on('pageerror', e => errs.push(String(e)))
  page.on('console', m => { if (m.type() === 'error') errs.push('console: ' + m.text()) })
  await denyNetwork(page, outbound)
  await page.goto(URL)
  await page.waitForFunction(() => document.querySelectorAll('svg.fig g.row').length > 0)

  ok(errs.length === 0, `JS: page errors ${JSON.stringify(errs)}`)
  ok(outbound.length === 0, `JS: the page asked the network for ${JSON.stringify(outbound)}`)
  ok(await page.locator('#controls').isVisible(), 'JS: the controls are offered')
  ok(await page.locator('#from').inputValue() === String(WIN.lo),
    'JS: the window opens where the still frame stands')
  ok(await page.locator('#to').inputValue() === String(WIN.hi),
    'JS: the window closes where the still frame stands')

  const readArms = async () => page.locator('svg.fig g.row').evaluateAll(gs => gs.map(g => ({
    label: g.querySelector('text.lab').textContent,
    val: g.querySelector('text.val').textContent,
    width: parseFloat(g.querySelector('rect.bar').getAttribute('width')),
    band: parseFloat(g.querySelector('rect.band').getAttribute('width') || '0')
  })))

  // THE check: at the still frame's own window the two arithmetics must publish the same
  // shares. A disagreement here is two numbers for one question, which is the defect this
  // practice has now measured in three different records including its own.
  let live = await readArms()
  ok(live.length === ARMS.length, `JS: one live row per arm (saw ${live.length})`)
  D.bars_matched.forEach((b, i) => {
    ok(live[i] && live[i].label === D.arms[b.arm].name, `JS: ${b.arm} keeps its label`)
    ok(live[i] && live[i].val === pct(b.share_empty),
      `JS: ${b.arm} reads out its own share (${live[i] && live[i].val} vs ${pct(b.share_empty)})`)
    const want = Math.max(PLOT * b.share_empty, 0.6)
    ok(live[i] && Math.abs(live[i].width - want) < 0.3,
      `JS: ${b.arm} is drawn at the same width as the still frame`)
  })

  const readout0 = await page.locator('#readout').innerText()
  const wp = D.profiles[PRIMARY].atlas
  ok(readout0.includes(group(wp.empty)) && readout0.includes(group(wp.asked)),
    'JS: the readout states the windowed count, not the whole-arm one')
  ok(readout0.includes(THIN) || wp.empty < 1000,
    'JS: the readout groups digits with the same codepoint as the page')

  // Narrowing the window must change the numbers, and change them to the right ones.
  await page.fill('#from', '1970')
  await page.fill('#to', '1989')
  await page.locator('#to').dispatchEvent('input')
  await page.waitForTimeout(80)
  const narrowed = await readArms()
  const readout1 = await page.locator('#readout').innerText()
  ok(readout1.includes('1970') && readout1.includes('1989'),
    'JS: the readout follows the window the reader set')
  ok(readout1 !== readout0, 'JS: narrowing the window changes what the page says')
  const expect1970s = (() => {
    const rows = D.arm_rows.atlas.filter(r => r.birth !== null && r.birth >= 1970 && r.birth <= 1989)
    const asked = rows.filter(r => r[PRIMARY] !== null)
    return asked.length ? asked.filter(r => r[PRIMARY] === 0).length / asked.length : null
  })()
  ok(narrowed[0].val === pct(expect1970s),
    `JS: the 1970s–80s window reads out its own share (${narrowed[0].val} vs ${pct(expect1970s)})`)

  // The narrow measure must be reachable, and must be the narrow measure.
  await page.fill('#from', String(WIN.lo))
  await page.fill('#to', String(WIN.hi))
  await page.check('#creator')
  await page.waitForTimeout(80)
  const wideMeasure = await readArms()
  ok(wideMeasure[0].val === pct(D.profiles[WIDE].atlas.share_empty),
    `JS: widening to all making properties gives the wide share (${wideMeasure[0].val} vs ` +
    `${pct(D.profiles[WIDE].atlas.share_empty)})`)
  ok(wideMeasure[0].val !== live[0].val,
    'JS: the two measures do not publish the same number, and the page shows both')
  await page.uncheck('#creator')
  await page.waitForTimeout(80)

  // The other draw must be reachable, and must be the other draw.
  await page.check('#rangedraw')
  await page.waitForTimeout(80)
  const rangeDraw = await readArms()
  const rangeArms = Object.keys(D.arms).filter(a => a.indexOf('range:') === 0).sort()
  ok(rangeDraw.length === rangeArms.length + 1,
    `JS: the birth-range draw shows its own arms (saw ${rangeDraw.length})`)
  rangeArms.forEach((a, i) => {
    ok(rangeDraw[i + 1].val === pct(D.profiles[PRIMARY][a].share_empty),
      `JS: ${a} reads out its own share`)
  })
  ok(rangeDraw[0].val === live[0].val,
    'JS: switching the control draw does not move the atlas arm')
  await page.uncheck('#rangedraw')
  await page.waitForTimeout(80)

  // A window with nobody in it must not throw and must not invent a share.
  await page.fill('#from', '2010')
  await page.fill('#to', '2010')
  await page.locator('#to').dispatchEvent('input')
  await page.waitForTimeout(80)
  const empty = await readArms()
  ok(errs.length === 0, `JS: an empty window does not break the page ${JSON.stringify(errs)}`)
  ok(empty.every(r => r.val === '—' || r.width === 0 || isNaN(r.width)),
    'JS: an empty window reads out nothing rather than a number')

  // A reversed window is refused rather than drawn upside down.
  await page.fill('#from', '2000')
  await page.fill('#to', '1900')
  await page.locator('#to').dispatchEvent('input')
  await page.waitForTimeout(80)
  ok(errs.length === 0, 'JS: a reversed window does not break the page')

  await ctx.close()
}

await browser.close()
console.log(`${n} checks, ${fails.length} failed`)
for (const f of fails) console.log('  FAIL ' + f)
process.exit(fails.length ? 1 : 0)
