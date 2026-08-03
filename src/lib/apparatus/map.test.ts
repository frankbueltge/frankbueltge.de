// src/lib/apparatus/map.test.ts — the figure's honesty contract, asserted against the markup it
// actually emits. No Astro-render tests exist in this repo by decision; a builder that returns a
// string can be held to its word directly, which is stricter than a snapshot nobody rereads.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { escapeXml } from '@/lib/dataviz/geometry'
import {
  APPARATUS_COLUMNS,
  apparatusRows,
  buildApparatusModel,
  buildApparatusSvg,
  edgeKey,
  traceEdgeKeys,
  traceFrom,
} from './map'
import { EDGES, NODES } from './topology'

const model = buildApparatusModel(NODES, EDGES)
const svg = buildApparatusSvg(model, { label: 'The apparatus' })
const still = buildApparatusSvg(model, { label: 'The apparatus', still: true })
const source = readFileSync(fileURLToPath(new URL('./map.ts', import.meta.url)), 'utf8')

describe('the SVG carries structure, never appearance', () => {
  it('contains no colour of its own — the skin decides what an owner looks like', () => {
    expect(svg).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })

  it('never emits a style attribute — the site’s CSP drops them silently', () => {
    expect(svg).not.toMatch(/style=/)
    expect(still).not.toMatch(/style=/)
  })

  it('is deterministic — the same topology draws the same pixels, every build', () => {
    expect(buildApparatusSvg(buildApparatusModel(NODES, EDGES), { label: 'The apparatus' })).toBe(svg)
  })

  it('names an owner and a kind on every node, so the stylesheet has something to key on', () => {
    const marks = svg.match(/<g class="ap-node"[^>]*>/g) ?? []
    expect(marks.length).toBe(NODES.length)
    for (const m of marks) {
      expect(m).toMatch(/data-owner="/)
      expect(m).toMatch(/data-node-kind="/)
    }
  })
})

describe('the figure is readable without a pointer', () => {
  it('titles every node in plain language', () => {
    for (const n of NODES) expect(svg).toContain(`<title>${escapeXml(n.label)} — ${escapeXml(n.what)}</title>`)
  })

  it('titles every edge with the mechanism it stands for', () => {
    const titles = svg.match(/<title>[^<]*→[^<]*<\/title>/g) ?? []
    expect(titles.length).toBe(EDGES.length)
  })

  it('keys every node for the panel and every edge for the trace', () => {
    for (const n of NODES) expect(svg).toContain(`data-key="${n.id}"`)
    for (const e of EDGES) expect(svg).toContain(`data-edge="${edgeKey(e)}"`)
  })

  it('strips every interaction hook from a still — a still is a picture, not a control', () => {
    expect(still).not.toMatch(/tabindex=/)
    expect(still).not.toMatch(/role="button"/)
    expect(still).not.toMatch(/data-key=/)
  })
})

describe('the layout holds', () => {
  it('places every node', () => {
    expect(model.nodes.length).toBe(NODES.length)
  })

  it('keeps every node inside the viewBox', () => {
    for (const p of model.nodes) {
      expect(p.x, `${p.node.id} starts left of the frame`).toBeGreaterThanOrEqual(0)
      expect(p.x + p.w, `${p.node.id} runs past the right edge`).toBeLessThanOrEqual(model.width)
      expect(p.y + p.h, `${p.node.id} runs past the bottom`).toBeLessThanOrEqual(model.height)
    }
  })

  it('never lets two boxes overlap — an unreadable figure makes no claim at all', () => {
    const overlaps: string[] = []
    for (let i = 0; i < model.nodes.length; i++) {
      for (let j = i + 1; j < model.nodes.length; j++) {
        const a = model.nodes[i]
        const b = model.nodes[j]
        const hit = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
        if (hit) overlaps.push(`${a.node.id} ↔ ${b.node.id}`)
      }
    }
    expect(overlaps).toEqual([])
  })

  it('draws a connector for every edge', () => {
    expect(model.edges.length).toBe(EDGES.length)
    for (const e of model.edges) expect(e.d).toMatch(/^M[\d.-]+ [\d.-]+ C/)
  })

  it('puts the two inflows in their own bands, converging on the archive', () => {
    const y = (id: string): number => model.nodes.find((p) => p.node.id === id)!.y
    // measurement above, research below, and the archive between them on the vertical
    expect(y('src-earth')).toBeLessThan(y('repo-ulysses'))
    expect(y('in-protokoll')).toBeLessThan(y('gate-atelier'))
    const archiveX = model.nodes.find((p) => p.node.layer === 'archive')!.x
    const worldX = model.nodes.find((p) => p.node.layer === 'world')!.x
    expect(archiveX).toBeGreaterThan(worldX)
  })
})

describe('a severed edge says so in geometry, not in colour', () => {
  const severed = EDGES.filter((e) => e.severed)

  it('has one to draw', () => {
    expect(severed.length).toBeGreaterThan(0)
  })

  it('marks the break with strokes that survive with styles off', () => {
    for (const e of severed) {
      const block = svg.split(`data-edge="${edgeKey(e)}"`)[1]?.split('</g>')[0] ?? ''
      expect(block).toMatch(/data-severed=""/)
      expect(block).toMatch(/class="ap-edge-break"/)
    }
  })

  it('carries the reason into the table, where it can be read in full', () => {
    const rows = apparatusRows(NODES, EDGES)
    for (const e of severed) {
      const row = rows.find((x) => x.mechanism.includes(e.mechanism))
      expect(row?.mechanism).toContain('severed:')
    }
  })
})

describe('the table floor repeats everything the figure shows', () => {
  const rows = apparatusRows(NODES, EDGES)

  it('gives every edge a row', () => {
    expect(rows.length).toBe(EDGES.length)
  })

  it('names both ends by their label, not their id', () => {
    for (const row of rows) {
      expect(row.from).not.toMatch(/^(src|in|repo|gate|st|del|ov)-/)
      expect(row.to).not.toMatch(/^(src|in|repo|gate|st|del|ov)-/)
    }
  })

  it('says for every row how far the map can vouch for it', () => {
    for (const row of rows) {
      expect(['read back from the file', 'declared here']).toContain(row.checked)
    }
  })

  it('declares a column for every field a row carries', () => {
    const keys = new Set(APPARATUS_COLUMNS.map((c) => c.key))
    for (const key of Object.keys(rows[0])) expect(keys.has(key)).toBe(true)
  })
})

describe('a trace answers a question instead of lighting everything up', () => {
  it('follows a practice all the way to the host', () => {
    const traced = traceFrom(EDGES, NODES, 'repo-field')
    expect(traced).toContain('gate-field')
    expect(traced).toContain('st-mirrors')
    expect(traced).toContain('del-build')
    expect(traced).toContain('del-pages')
  })

  it('does not run on through an oversight node', () => {
    // the watchdogs can start three gates; a trace that followed them would pull in the whole
    // apparatus and highlight nothing
    const traced = traceFrom(EDGES, NODES, 'st-protokoll')
    expect(traced).not.toContain('repo-ulysses')
  })

  it('still shows oversight as a neighbour when the reader starts there', () => {
    const traced = traceFrom(EDGES, NODES, 'ov-watchdogs')
    expect(traced).toContain('gate-field')
    expect(traced.size).toBeLessThan(NODES.length)
  })

  it('reaches everything only from the one place everything really passes through', () => {
    // The build step is a genuine convergence point: every committed file goes through it on its
    // way out, so a trace from it honestly is the whole apparatus. Anywhere else, a trace that
    // lit up all thirty-five nodes would be answering no question — so only this one may.
    const total = NODES.length
    const everything = NODES.filter((n) => traceFrom(EDGES, NODES, n.id).size === total).map((n) => n.id)
    expect(everything).toEqual(['del-build'])
  })

  it('lights only edges whose both ends are in the trace', () => {
    const traced = traceFrom(EDGES, NODES, 'repo-field')
    for (const key of traceEdgeKeys(EDGES, traced)) {
      const [from, to] = key.split('~')
      expect(traced.has(from) && traced.has(to)).toBe(true)
    }
  })
})
