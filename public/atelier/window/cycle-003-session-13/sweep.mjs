// sweep.mjs — the second instrument. It drives pages through EVERY setting their
// controls can be put into, not one control at a time.
//
//   NODE_PATH=$(npm root -g) node window/cycle-003-session-13/sweep.mjs [--out FILE]
//
// Needs a playwright driver and a chromium (CHROMIUM_PATH overrides the executable).
// Every request that is not a local file is refused, with scripting on and with it
// off, so a page that had quietly acquired a dependency fails here and not in the world.
//
// Why a second instrument. The run of 2026-09-22 moved ONE control at a time from
// the default state and stopped at 48 states a page. That is a one-way sweep of a
// space whose size it never counted. enumerate.py has now counted it. Where the
// count is small enough to afford, this file drives the WHOLE space; where it is
// not, it drives nothing and the page says so.
//
// The two units are the ones declared on 2026-09-22 and are repeated here word for
// word, so the two nights are comparable. check.py writes them a third time from
// the declared text and not from this code.

import { createRequire } from 'node:module'
import { readFileSync, writeFileSync } from 'node:fs'
import { resolve, dirname } from 'node:path'
import { fileURLToPath } from 'node:url'

const require = createRequire(import.meta.url)
let pw
try { pw = require('playwright-core') } catch { pw = require('playwright') }

const HERE = dirname(fileURLToPath(import.meta.url))
const REPO = resolve(HERE, '..', '..')

// --- the declared units, verbatim from 2026-09-22 --------------------------
const Q_RE = /[0-9][0-9\u0020\u00a0\u202f,.'\u2019]*[0-9]|[0-9]/g
function quantities (text) {
  const out = []
  for (const m of text.matchAll(Q_RE)) {
    let t = m[0].replace(/[\u0020\u00a0\u202f,'\u2019]/g, '')
    while (t.endsWith('.')) t = t.slice(0, -1)
    if (t) out.push(t)
  }
  return out
}
function lines (text) {
  return text.split('\n').map(l => l.replace(/\s+/g, ' ').trim()).filter(l => l.length > 0)
}

// --- the declared budget ---------------------------------------------------
// A page whose settings exceed this is not driven at all. The number is the
// affordability of one night, stated before the run and printed on the page.
const CAP = 512
// Ordered pairs of presses, for the pages whose whole hand is buttons. A button
// leaves no state in the document, so its space is one of SEQUENCES, not settings.
const PAIR_CAP = 200

const ev = JSON.parse(readFileSync(resolve(HERE, 'evidence.json'), 'utf8'))

function product (arr) {
  // Cartesian product of arrays of position indices.
  let out = [[]]
  for (const a of arr) {
    const next = []
    for (const pre of out) for (const v of a) next.push(pre.concat([v]))
    out = next
  }
  return out
}

async function context (browser, jsOn) {
  const ctx = await browser.newContext({ javaScriptEnabled: jsOn, viewport: { width: 1280, height: 4000 } })
  const state = { offsite: 0 }
  await ctx.route('**', route => {
    const u = route.request().url()
    if (u.startsWith('file:')) return route.continue()
    state.offsite++
    return route.abort()
  })
  return { ctx, state }
}

async function readText (page) {
  try { return await page.locator('body').innerText({ timeout: 20000 }) } catch { return '' }
}

// Put one control into one position. Returns 'native', 'element' or false.
//
// Two paths, and the reason is 2026-09-22's own defect. That run recorded an action the
// engine refused as a state that did not change, which is what a state that did not change
// also looks like. So here the ordinary path is tried first, with a short deadline; where
// the engine refuses it — a control it has placed where it will not click, an artefact of
// driving a page in a box — the same placement is made on the element itself and the events
// a control fires are fired. Which path was used is counted and published. A placement that
// fails BOTH ways is dropped, never recorded as a setting that rendered the same.
function locate (page, ctl) {
  if (ctl.id) return page.locator(`#${CSS_ESC(ctl.id)}`)
  if (ctl.type === 'radio') return page.locator(`input[type=radio][name="${ctl.name}"]`).first()
  if (ctl.type === 'select') return page.locator('select').nth(ctl.ord)
  return page.locator(`input[type=${ctl.type}]`).nth(ctl.ord)
}
async function place (page, ctl, pos, memo) {
  const el = locate(page, ctl)
  const radio = () => page.locator(`input[type=radio][name="${ctl.name}"]`).nth(pos)
  const native = async () => {
    if (ctl.type === 'radio') await radio().check({ timeout: 1200, force: true })
    else if (ctl.type === 'checkbox') await el.setChecked(pos === 1, { timeout: 1200, force: true })
    else if (ctl.type === 'select') await el.selectOption({ index: pos }, { timeout: 1200 })
    else if (ctl.type === 'range') {
      await el.fill(String(ctl.values[pos]), { timeout: 2000 })
      await el.dispatchEvent('input').catch(() => {})
      await el.dispatchEvent('change').catch(() => {})
    } else throw new Error('no such control')
  }
  const byHand = async () => {
    const target = ctl.type === 'radio' ? radio() : el
    await target.evaluate((node, a) => {
      const fire = () => {
        node.dispatchEvent(new Event('input', { bubbles: true }))
        node.dispatchEvent(new Event('change', { bubbles: true }))
      }
      if (a.kind === 'radio') { node.checked = true; fire() }
      else if (a.kind === 'checkbox') { node.checked = a.on; fire() }
      else if (a.kind === 'select') { node.selectedIndex = a.pos; fire() }
      else { node.value = a.value; fire() }
    }, { kind: ctl.type, on: pos === 1, pos, value: ctl.values ? String(ctl.values[pos]) : '' })
  }
  // A path this engine has already refused for this control is not tried again: the
  // first refusal costs a deadline, the rest cost nothing. The memo is per page and
  // per scripting state, so the two states are never told about each other.
  const key = ctl.type + '\u0000' + (ctl.id || ctl.name || ctl.ord)
  if (memo && memo.get(key) !== 'element') {
    try { await native(); memo && memo.set(key, 'native'); return 'native' } catch (e) {}
  }
  try { await byHand(); memo && memo.set(key, 'element'); return 'element' } catch (e) {}
  return false
}
function CSS_ESC (s) { return s.replace(/([^\w-])/g, '\\$1') }

// Build the driveable control list for a page from enumerate.py's record.
function drivable (p) {
  const out = []
  const ord = {}
  for (const c of p.served_controls) {
    const k = c.type
    ord[k] = (ord[k] || 0)
    if (c.kind !== 'finite') { ord[k]++; continue }
    const rec = { type: c.type, name: c.name, id: c.id, ord: ord[k], n: c.positions }
    if (c.type === 'range') {
      const lo = c.min === null || c.min === undefined ? 0 : Number(c.min)
      const st = c.step === null || c.step === undefined ? 1 : Number(c.step)
      rec.values = []
      for (let k2 = 0; k2 < c.positions; k2++) rec.values.push(lo + k2 * st)
    }
    out.push(rec)
    ord[k]++
  }
  return out
}
function buttons (p) {
  const out = []
  let ord = 0
  for (const c of p.served_controls) {
    if (c.kind === 'none') { out.push({ id: c.id, ord }); ord++ }
    else if (c.tag === 'button' || (c.tag === 'input' && ['button', 'submit', 'reset', 'image'].includes(c.type))) ord++
  }
  return out
}

async function sweepPage (browser, p, jsOn) {
  const url = 'file://' + resolve(REPO, p.dir, 'index.html')
  const ctls = drivable(p)
  const btns = buttons(p)
  const settings = ctls.reduce((a, c) => a * c.n, 1)
  const nPairs = btns.length * Math.max(0, btns.length - 1)

  const res = {
    dir: p.dir,
    jsOn,
    settings,
    driven: 0,
    affordable: settings <= CAP && ctls.length > 0,
    pairsAffordable: btns.length > 0 && nPairs <= PAIR_CAP,
    pairsPossible: nPairs,
    pairsDriven: 0,
    placementsRefused: 0,
    placedNative: 0,
    placedByElement: 0,
    pressedNative: 0,
    pressedByElement: 0,
    pressesRefused: 0,
    offsite: 0,
    base: { q: 0, l: 0 },
    // union over every state driven, minus the base: what the hand can add
    addQ: [], addL: [], hideQ: [], hideL: [],
    // the one-way subset of the SAME sweep: exactly one control off its default
    oneWayAddQ: [], oneWayAddL: [],
    oneWayStates: 0,
    distinctRenderings: 0,
    singlesDriven: 0,
    singleAddQ: [], singleAddL: [],
    pairAddQ: [], pairAddL: []
  }

  const { ctx, state } = await context(browser, jsOn)
  const page = await ctx.newPage()
  await page.goto(url, { waitUntil: 'load' })
  const baseText = await readText(page)
  const baseQ = new Set(quantities(baseText))
  const baseL = new Set(lines(baseText))
  res.base = { q: baseQ.size, l: baseL.size }
  const seen = new Set([baseText])

  // the default position of each control, read once
  const defaults = []
  for (const c of ctls) {
    let d = 0
    try {
      if (c.type === 'radio') {
        const g = page.locator(`input[type=radio][name="${c.name}"]`)
        for (let k = 0; k < c.n; k++) if (await g.nth(k).isChecked()) { d = k; break }
      } else if (c.type === 'checkbox') {
        const el = c.id ? page.locator(`#${CSS_ESC(c.id)}`) : page.locator('input[type=checkbox]').nth(c.ord)
        d = (await el.isChecked()) ? 1 : 0
      } else if (c.type === 'select') {
        const el = c.id ? page.locator(`#${CSS_ESC(c.id)}`) : page.locator('select').nth(c.ord)
        const v = await el.inputValue()
        const vals = await el.locator('option').evaluateAll(ns => ns.map(n => n.value)).catch(() => null)
        d = vals ? Math.max(0, vals.indexOf(v)) : 0
      } else if (c.type === 'range') {
        const el = c.id ? page.locator(`#${CSS_ESC(c.id)}`) : page.locator('input[type=range]').nth(c.ord)
        const v = Number(await el.inputValue())
        d = Math.max(0, c.values.indexOf(v))
      }
    } catch { d = 0 }
    defaults.push(d)
  }
  res.defaults = defaults

  const memo = new Map()
  const addQ = new Set(); const addL = new Set()
  const hideQ = new Set(); const hideL = new Set()
  const owQ = new Set(); const owL = new Set()

  if (res.affordable) {
    const combos = product(ctls.map(c => Array.from({ length: c.n }, (_, i) => i)))
    for (const combo of combos) {
      await page.goto(url, { waitUntil: 'load' })
      let refused = 0
      for (let i = 0; i < ctls.length; i++) {
        if (combo[i] === defaults[i]) continue
        const how = await place(page, ctls[i], combo[i], memo)
        if (!how) refused++
        else if (how === 'native') res.placedNative++
        else res.placedByElement++
      }
      res.placementsRefused += refused
      if (refused) continue          // a setting we could not actually make is not a state
      const t = await readText(page)
      seen.add(t)
      res.driven++
      const q = new Set(quantities(t)); const l = new Set(lines(t))
      const offDefault = combo.filter((v, i) => v !== defaults[i]).length
      for (const x of q) if (!baseQ.has(x)) { addQ.add(x); if (offDefault === 1) owQ.add(x) }
      for (const x of l) if (!baseL.has(x)) { addL.add(x); if (offDefault === 1) owL.add(x) }
      for (const x of baseQ) if (!q.has(x)) hideQ.add(x)
      for (const x of baseL) if (!l.has(x)) hideL.add(x)
      if (offDefault === 1) res.oneWayStates++
    }
  }

  // Sequences of presses, for hands made of buttons.
  const pAddQ = new Set(); const pAddL = new Set()
  const sAddQ = new Set(); const sAddL = new Set()
  if (res.pairsAffordable) {
    const pressMemo = new Map()
    const press = async (b) => {
      const el = b.id ? page.locator(`#${CSS_ESC(b.id)}`)
        : page.locator('button, input[type=button], input[type=submit], input[type=reset]').nth(b.ord)
      const key = 'press\u0000' + (b.id || b.ord)
      if (pressMemo.get(key) !== 'element') {
        try {
          await el.click({ timeout: 2000, force: true })
          pressMemo.set(key, 'native'); res.pressedNative++; return
        } catch (e) {}
      }
      await el.evaluate(node => node.click())
      pressMemo.set(key, 'element'); res.pressedByElement++
    }
    // One press first, so that what a SECOND press reaches can be separated from what
    // the first already did. Without this row the pair figures would only say that a
    // button does something, which nobody doubted.
    for (let i = 0; i < btns.length; i++) {
      await page.goto(url, { waitUntil: 'load' })
      try { await press(btns[i]) } catch (e) { res.pressesRefused++; continue }
      const t = await readText(page)
      seen.add(t)
      res.singlesDriven++
      const q = new Set(quantities(t)); const l = new Set(lines(t))
      for (const x of q) if (!baseQ.has(x)) sAddQ.add(x)
      for (const x of l) if (!baseL.has(x)) sAddL.add(x)
    }
    for (let i = 0; i < btns.length; i++) {
      for (let j = 0; j < btns.length; j++) {
        if (i === j) continue
        await page.goto(url, { waitUntil: 'load' })
        try { await press(btns[i]); await press(btns[j]) } catch (e) { res.pressesRefused++; continue }
        const t = await readText(page)
        seen.add(t)
        res.pairsDriven++
        const q = new Set(quantities(t)); const l = new Set(lines(t))
        for (const x of q) if (!baseQ.has(x)) pAddQ.add(x)
        for (const x of l) if (!baseL.has(x)) pAddL.add(x)
      }
    }
  }

  res.addQ = [...addQ].sort(); res.addL = [...addL].sort()
  res.hideQ = [...hideQ].sort(); res.hideL = [...hideL].sort()
  res.oneWayAddQ = [...owQ].sort(); res.oneWayAddL = [...owL].sort()
  res.singleAddQ = [...sAddQ].sort(); res.singleAddL = [...sAddL].sort()
  res.pairAddQ = [...pAddQ].sort(); res.pairAddL = [...pAddL].sort()
  res.placementPaths = Object.fromEntries(memo)
  res.distinctRenderings = seen.size
  res.offsite = state.offsite
  await ctx.close()
  return res
}

async function main () {
  const outArg = process.argv.indexOf('--out')
  const out = outArg > -1 ? process.argv[outArg + 1] : resolve(HERE, 'sweep.json')
  const exe = process.env.CHROMIUM_PATH || undefined
  const browser = await pw.chromium.launch({ executablePath: exe, args: ['--disable-dev-shm-usage'] })
  const rows = []
  for (const p of ev.pages) {
    for (const jsOn of [true, false]) {
      const t0 = Date.now()
      const r = await sweepPage(browser, p, jsOn)
      r.ms = Date.now() - t0
      rows.push(r)
      process.stderr.write(`${p.dir} js=${jsOn} settings=${r.settings} driven=${r.driven} singles=${r.singlesDriven} pairs=${r.pairsDriven} renderings=${r.distinctRenderings} addQ=${r.addQ.length} 1wayQ=${r.oneWayAddQ.length} ${r.ms}ms\n`)
    }
  }
  await browser.close()
  writeFileSync(out, JSON.stringify({
    _note: 'Every setting this practice\'s pages can be put into, driven where the number is affordable. Produced by sweep.mjs. The cap and the pair cap are declared in this file and printed on the page.',
    date: '2026-09-23',
    cap: CAP,
    pairCap: PAIR_CAP,
    policy: 'the whole Cartesian product of the finite controls; the page is reloaded before each setting and every control is placed from its default; a setting whose placement the browser refused is dropped, not recorded as a state that changed nothing',
    units: 'the two units declared on 2026-09-22, repeated verbatim',
    rows
  }, null, 1) + '\n')
  process.stderr.write('wrote ' + out + '\n')
}

main().catch(e => { console.error(e); process.exit(1) })
