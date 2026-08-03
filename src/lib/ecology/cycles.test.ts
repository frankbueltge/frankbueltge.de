// src/lib/ecology/cycles.test.ts — the three-cycles figure, held to the same contract as every
// other builder here: structure without appearance, readable with nothing switched on, and
// deterministic.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { escapeXml } from '@/lib/dataviz/geometry'
import { PRACTICES } from './anatomy'
import { CYCLE_COLUMNS, buildCyclesModel, buildCyclesSvg, cycleRows, showArtefact } from './cycles'

const model = buildCyclesModel(PRACTICES)
const svg = buildCyclesSvg(model, { label: 'How research becomes public' })
const still = buildCyclesSvg(model, { label: 'How research becomes public', still: true })
const source = readFileSync(fileURLToPath(new URL('./cycles.ts', import.meta.url)), 'utf8')
const totalStages = PRACTICES.reduce((n, p) => n + p.stages.length, 0)

describe('the figure carries structure, never appearance', () => {
  it('contains no colour of its own', () => {
    expect(svg).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(source).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
  })

  it('never emits a style attribute — the CSP drops them silently', () => {
    expect(svg).not.toMatch(/style=/)
    expect(still).not.toMatch(/style=/)
  })

  it('is deterministic', () => {
    expect(buildCyclesSvg(buildCyclesModel(PRACTICES), { label: 'How research becomes public' })).toBe(svg)
  })

  it('keys every step to its practice, so a column can never borrow another’s mark', () => {
    for (const p of PRACTICES) {
      p.stages.forEach((_, i) => expect(svg).toContain(`data-key="${p.id}:${i}"`))
    }
  })
})

describe('the figure is readable with nothing switched on', () => {
  it('titles every step in plain language, naming whose it is', () => {
    for (const p of PRACTICES) {
      for (const s of p.stages) {
        expect(svg).toContain(escapeXml(`${p.persona} — ${s.label}: ${s.what}`))
      }
    }
  })

  it('prints every step’s own label, never a normalised one', () => {
    for (const p of PRACTICES) {
      for (const s of p.stages) expect(svg).toContain(`>${escapeXml(s.label)}</text>`)
    }
  })

  it('strips every interaction hook from a still', () => {
    expect(still).not.toMatch(/tabindex=/)
    expect(still).not.toMatch(/role="button"/)
    expect(still).not.toMatch(/data-key=/)
  })
})

describe('the layout lets the practices differ', () => {
  it('places every step of every practice', () => {
    expect(model.columns.reduce((n, c) => n + c.stages.length, 0)).toBe(totalStages)
  })

  it('gives all three columns the same frame — the difference must come from the practices', () => {
    const widths = new Set(model.columns.flatMap((c) => c.stages.map((s) => s.w)))
    const heights = new Set(model.columns.flatMap((c) => c.stages.map((s) => s.h)))
    expect(widths.size).toBe(1)
    expect(heights.size).toBe(1)
  })

  it('lets the chains end at different depths, because they are different lengths', () => {
    const bottoms = model.columns.map((c) => c.stages[c.stages.length - 1].y)
    expect(new Set(bottoms).size).toBeGreaterThan(1)
  })

  it('keeps every box inside the canvas', () => {
    for (const c of model.columns) {
      for (const s of c.stages) {
        expect(s.x).toBeGreaterThanOrEqual(0)
        expect(s.x + s.w).toBeLessThanOrEqual(model.width)
        expect(s.y + s.h).toBeLessThanOrEqual(model.height)
      }
    }
  })

  it('never overlaps two boxes', () => {
    const all = model.columns.flatMap((c) => c.stages)
    for (let i = 0; i < all.length; i++) {
      for (let j = i + 1; j < all.length; j++) {
        const a = all[i]
        const b = all[j]
        const hit = a.x < b.x + b.w && b.x < a.x + a.w && a.y < b.y + b.h && b.y < a.y + a.h
        expect(hit, `${a.practice.id}:${a.index} overlaps ${b.practice.id}:${b.index}`).toBe(false)
      }
    }
  })

  it('draws the human gate as the one filled mark, on the one chain that has it', () => {
    expect((svg.match(/data-stage-kind="human"/g) ?? []).length).toBe(2) // the group and its glyph
  })

  it('never prints an artefact that would collide with its own step label', () => {
    // The first draft overlapped in two rows. An overlapping label is worse than a missing hint,
    // and the hint is never lost: it stays in the step's title, the panel and the table.
    for (const p of PRACTICES) {
      for (const s of p.stages) {
        if (!s.artefact) continue
        if (showArtefact(s.label, s.artefact)) {
          expect(s.label.length * 6.9 + s.artefact.length * 6.3).toBeLessThanOrEqual(320 - 56)
        } else {
          // absent in the ARTEFACT role — the same string may still be the step's own label,
          // which is exactly the case this drops (the atelier names steps after the file they write)
          const asArtefact = new RegExp(`class="ec-artefact"[^>]*>${escapeXml(s.artefact).replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}</text>`)
          expect(svg).not.toMatch(asArtefact)
        }
      }
    }
  })

  it('never prints an artefact that merely repeats the step’s own name', () => {
    for (const p of PRACTICES) {
      for (const s of p.stages) {
        if (s.artefact && s.artefact === s.label) expect(showArtefact(s.label, s.artefact)).toBe(false)
      }
    }
  })

  it('keeps every dropped artefact reachable in the table', () => {
    const rows = cycleRows(PRACTICES)
    for (const p of PRACTICES) {
      for (const s of p.stages) {
        if (!s.artefact || showArtefact(s.label, s.artefact)) continue
        expect(rows.some((r) => r.step === s.label && r.lands === s.artefact)).toBe(true)
      }
    }
  })
})

describe('the table floor repeats every step the figure shows', () => {
  const rows = cycleRows(PRACTICES)

  it('gives every step a row', () => {
    expect(rows.length).toBe(totalStages)
  })

  it('says of every step what kind of step it is', () => {
    for (const r of rows) expect(r.kind.length).toBeGreaterThan(8)
  })

  it('declares a column for every field a row carries', () => {
    const keys = new Set(CYCLE_COLUMNS.map((c) => c.key))
    for (const key of Object.keys(rows[0])) expect(keys.has(key)).toBe(true)
  })
})
