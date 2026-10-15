// probe.mjs — the instrument. It drives every page this practice has published
// through that page's own controls, twice over: once with scripting on, once with
// scripting off, and reads back what the browser actually renders each time.
//
//   NODE_PATH=$(npm root -g) node window/cycle-003-session-12/probe.mjs [--out FILE]
//
// Needs a playwright driver and a chromium (CHROMIUM_PATH overrides the executable).
// Every request that is not a file:// request is refused in both states, so a page
// that had quietly acquired a dependency shows up here rather than in the world.
//
// It is the instrument, not the artifact. The artifact is built from its output by
// build.py, and check.py re-derives every published number from that output without
// importing a line of this file.

import { createRequire } from 'node:module'
import { readFileSync, writeFileSync, existsSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
let pw
try { pw = require('playwright-core') } catch { pw = require('playwright') }

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '..', '..')

// ---------------------------------------------------------------------------
// The declared rule. Two units, both stated here in full, both re-implemented
// independently in check.py. A count whose rule is not written down is not a count
// — this practice has now said so on three nights and is not going to exempt itself.
//
// Unit Q (a quantity): in the rendered text, every maximal run that begins and ends
// with a digit and contains only digits, spaces (U+0020, U+00A0, U+202F), commas,
// full stops and apostrophes; a bare single digit also counts. From the run, every
// space, comma and apostrophe is deleted — in this corpus these are group separators
// only, the corpus being English — and a trailing full stop is deleted. What remains
// is compared as a string: 0.491 is not 491, and 04 is not 4.
//
// Unit L (a line): the rendered text split at newlines, each line trimmed, runs of
// whitespace inside it collapsed to one space, empty lines dropped, compared as strings.
// ---------------------------------------------------------------------------
const Q_RE = /[0-9][0-9   ,.'’]*[0-9]|[0-9]/g

export function quantities (text) {
  const out = []
  for (const m of text.matchAll(Q_RE)) {
    let t = m[0].replace(/[   ,'’]/g, '')
    while (t.endsWith('.')) t = t.slice(0, -1)
    if (t) out.push(t)
  }
  return out
}

export function lines (text) {
  return text.split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(l => l.length > 0)
}

// ---------------------------------------------------------------------------
// The corpus: every page this practice has published that a visitor can open.
// ---------------------------------------------------------------------------
const CORPUS = [
  ['window/cycle-001', 'c1 presentation window'],
  ['window/cycle-001-session-2', 'c1 s2'],
  ['window/cycle-001-session-3', 'c1 s3'],
  ['window/cycle-001-session-4', 'c1 s4'],
  ['window/cycle-002-session-1', 'c2 s1'],
  ['window/cycle-002-session-2', 'c2 s2'],
  ['window/cycle-002-session-3', 'c2 s3'],
  ['window/cycle-002-session-4', 'c2 s4'],
  ['window/cycle-003-session-1', 'c3 s1'],
  ['window/cycle-003-session-2', 'c3 s2'],
  ['window/cycle-003-session-3', 'c3 s3'],
  ['window/cycle-003-session-4', 'c3 s4'],
  ['window/cycle-003-session-6', 'c3 s6'],
  ['window/cycle-003-session-7', 'c3 s7'],
  ['window/cycle-003-session-8', 'c3 s8'],
  ['window/cycle-003-session-9', 'c3 s9'],
  ['window/cycle-003-session-10', 'c3 s10'],
  ['window/cycle-003-session-11', 'c3 s11'],
  ['presentations/cycle-001', 'presentation 001'],
  ['presentations/cycle-002', 'presentation 002'],
  ['presentations/cycle-003', 'presentation 003']
]

const MAX_STATES = 48   // per page, per scripting state; declared, and the reason is in the page
const RANGE_SAMPLES = 7

async function readText (page) {
  try {
    const t = await page.locator('body').innerText({ timeout: 15000 })
    return t
  } catch (e) {
    return ''
  }
}

async function inventory (page) {
  // Playwright's utility world runs even where the page's own scripting is off,
  // so the same inventory is taken in both states and compared.
  const els = await page.locator('input, select, button, textarea').all()
  const items = []
  for (let i = 0; i < els.length; i++) {
    const el = els[i]
    const info = await el.evaluate?.(() => null).catch(() => null)
    const tag = (await el.evaluate(n => n.tagName.toLowerCase()).catch(async () => {
      return (await el.getAttribute('data-x')) === null ? null : null
    })) || null
    items.push({ i, tag })
  }
  return items
}

// With scripting off, page.evaluate is not available, so the inventory is taken from
// attributes, which Playwright reads through its own world.
async function inventoryByAttrs (page) {
  const els = await page.locator('input, select, button, textarea').all()
  const items = []
  for (let i = 0; i < els.length; i++) {
    const el = els[i]
    const [tag, type, name, min, max, step, id] = await Promise.all([
      el.evaluate(n => n.tagName.toLowerCase()).catch(() => null),
      el.getAttribute('type').catch(() => null),
      el.getAttribute('name').catch(() => null),
      el.getAttribute('min').catch(() => null),
      el.getAttribute('max').catch(() => null),
      el.getAttribute('step').catch(() => null),
      el.getAttribute('id').catch(() => null)
    ])
    let options = null
    if (tag === 'select') {
      options = await el.locator('option').evaluateAll(ns => ns.map(n => n.value)).catch(() => null)
      if (!options) {
        const n = await el.locator('option').count()
        options = []
        for (let k = 0; k < n; k++) options.push(await el.locator('option').nth(k).getAttribute('value'))
      }
    }
    items.push({ i, tag, type: type ? type.toLowerCase() : (tag === 'select' || tag === 'button' || tag === 'textarea' ? tag : 'text'), name, min, max, step, id, options })
  }
  return items
}

function actionsFor (items) {
  const acts = []
  const radioSeen = new Set()
  for (const it of items) {
    const t = it.type
    if (t === 'range' || t === 'number') {
      const min = Number(it.min ?? 0)
      const max = Number(it.max ?? 100)
      let step = Number(it.step ?? 1)
      if (!isFinite(step) || step <= 0) step = (max - min) / 100 || 1
      if (!isFinite(min) || !isFinite(max) || max <= min) { acts.push({ i: it.i, kind: 'fill', value: String(it.max ?? 1) }); continue }
      const n = RANGE_SAMPLES
      const vals = new Set()
      for (let k = 0; k < n; k++) {
        const raw = min + (max - min) * k / (n - 1)
        const snapped = min + Math.round((raw - min) / step) * step
        const v = Math.min(max, Math.max(min, snapped))
        vals.add(String(Number(v.toFixed(6))))
      }
      for (const v of vals) acts.push({ i: it.i, kind: 'fill', value: v })
    } else if (t === 'select') {
      const opts = (it.options || []).slice(0, 24)
      for (const o of opts) acts.push({ i: it.i, kind: 'select', value: o })
    } else if (t === 'checkbox') {
      acts.push({ i: it.i, kind: 'toggle' })
    } else if (t === 'radio') {
      const key = it.name || ('#' + it.i)
      acts.push({ i: it.i, kind: 'check', group: key })
      radioSeen.add(key)
    } else if (t === 'button' || t === 'submit') {
      acts.push({ i: it.i, kind: 'click' })
    } else {
      acts.push({ i: it.i, kind: 'skip', reason: 'free text: no domain to sweep' })
    }
  }
  return acts
}

function subsample (acts, cap) {
  const live = acts.filter(a => a.kind !== 'skip')
  if (live.length <= cap) return { chosen: live, dropped: 0 }
  const chosen = []
  for (let k = 0; k < cap; k++) chosen.push(live[Math.floor(k * live.length / cap)])
  return { chosen, dropped: live.length - chosen.length }
}

async function applyAction (page, act) {
  // The hand is simulated twice over. First the ordinary way, as a person would work the
  // control. Where the browser refuses that — a control the engine places outside the
  // viewport it can scroll to, which is an artefact of driving a page in a box and not
  // something a reader would meet — the same change is made on the element itself and the
  // events a control fires are fired. The second path works with the page's own scripting
  // switched off as well, so both scripting states are driven by the same hand.
  const el = page.locator('input, select, button, textarea').nth(act.i)
  const native = async () => {
    if (act.kind === 'fill') {
      await el.fill(act.value, { timeout: 4000 })
      await el.dispatchEvent('input').catch(() => {})
      await el.dispatchEvent('change').catch(() => {})
    } else if (act.kind === 'select') {
      await el.selectOption(act.value, { timeout: 4000 })
    } else if (act.kind === 'toggle') {
      await el.click({ timeout: 4000, force: true })
    } else if (act.kind === 'check') {
      await el.check({ timeout: 4000, force: true })
    } else if (act.kind === 'click') {
      await el.click({ timeout: 4000, force: true })
    }
  }
  const byHand = async () => {
    await el.evaluate((n, a) => {
      const fire = () => {
        n.dispatchEvent(new Event('input', { bubbles: true }))
        n.dispatchEvent(new Event('change', { bubbles: true }))
      }
      if (a.kind === 'fill') { n.value = a.value; fire() }
      else if (a.kind === 'select') { n.value = a.value; fire() }
      else if (a.kind === 'toggle') { n.checked = !n.checked; fire() }
      else if (a.kind === 'check') { n.checked = true; fire() }
      else if (a.kind === 'click') { n.click() }
    }, act)
  }
  let via = 'native'
  try {
    await native()
  } catch (e) {
    via = 'element'
    await byHand()
  }
  await page.waitForTimeout(40)
  return via
}

async function sweepPage (browser, dir, jsOn) {
  const file = resolve(REPO, dir, 'index.html')
  const url = 'file://' + file
  const ctx = await browser.newContext({ javaScriptEnabled: jsOn, viewport: { width: 1280, height: 4000 } })
  let offsite = 0
  await ctx.route('**', route => {
    const u = route.request().url()
    if (u.startsWith('file:')) return route.continue()
    offsite++
    return route.abort()
  })
  const page = await ctx.newPage()
  const errors = []
  page.on('pageerror', e => errors.push(String(e).slice(0, 200)))
  await page.goto(url, { waitUntil: 'load', timeout: 60000 })
  await page.waitForTimeout(120)

  const items = await inventoryByAttrs(page)
  const acts = actionsFor(items)
  const { chosen, dropped } = subsample(acts, MAX_STATES)

  const base = await readText(page)
  const states = [{ act: { kind: 'default' }, text: base }]

  for (const act of chosen) {
    try {
      await page.goto(url, { waitUntil: 'load', timeout: 60000 })
      await page.waitForTimeout(30)
      const via = await applyAction(page, act)
      const t = await readText(page)
      states.push({ act: { ...act, via }, text: t })
    } catch (e) {
      states.push({ act: { ...act, failed: String(e).slice(0, 120) }, text: '' })
    }
  }
  await ctx.close()
  return {
    dir,
    jsOn,
    controls: items.map(({ i, tag, type, name, id }) => ({ i, tag, type, name, id })),
    actionsTotal: acts.filter(a => a.kind !== 'skip').length,
    actionsSkipped: acts.filter(a => a.kind === 'skip').length,
    actionsDropped: dropped,
    statesVisited: states.length,
    offsiteRequestsRefused: offsite,
    pageErrors: errors,
    states: states.map(s => ({
      act: s.act,
      chars: s.text.length,
      q: Array.from(new Set(quantities(s.text))).sort(),
      l: Array.from(new Set(lines(s.text))).sort()
    }))
  }
}

async function main () {
  const argv = process.argv.slice(2)
  const outIdx = argv.indexOf('--out')
  const out = outIdx >= 0 ? argv[outIdx + 1] : resolve(HERE, 'probe.json')
  const onlyIdx = argv.indexOf('--only')
  const only = onlyIdx >= 0 ? argv[onlyIdx + 1].split(',') : null
  const extraIdx = argv.indexOf('--extra')
  const extra = extraIdx >= 0 ? argv[extraIdx + 1].split(',').map(d => [d, d]) : []

  const launchOpts = {}
  if (process.env.CHROMIUM_PATH) launchOpts.executablePath = process.env.CHROMIUM_PATH
  const browser = await pw.chromium.launch(launchOpts)
  const corpus = (only ? CORPUS.filter(([d]) => only.includes(d)) : CORPUS).concat(extra)
  const pages = []
  for (const [dir, label] of corpus) {
    if (!existsSync(resolve(REPO, dir, 'index.html'))) { console.error('missing: ' + dir); continue }
    const on = await sweepPage(browser, dir, true)
    const off = await sweepPage(browser, dir, false)
    pages.push({ dir, label, on, off })
    const D = new Set(on.states.flatMap(s => s.q))
    const S0 = new Set(off.states[0].q)
    const S = new Set(off.states.flatMap(s => s.q))
    console.error(`${dir}  states ${on.statesVisited}/${off.statesVisited}  |D|=${D.size} |S0|=${S0.size} |S|=${S.size}  add=${[...D].filter(x => !S.has(x)).length}  hide=${[...S].filter(x => !D.has(x)).length}`)
    pages[pages.length - 1].bytes = readFileSync(resolve(REPO, dir, 'index.html')).length
  }
  await browser.close()
  writeFileSync(out, JSON.stringify({
    instrument: 'probe.mjs',
    maxStatesPerPage: MAX_STATES,
    rangeSamples: RANGE_SAMPLES,
    sweep: 'one control at a time from the default state; the page is reloaded before each action',
    pages
  }, null, 1))
  console.error('wrote ' + out)
}

if (import.meta.url === 'file://' + process.argv[1]) await main()
