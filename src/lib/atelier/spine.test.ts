// Determinism + honesty guard for the Buchrücken generator. Guards the approved data-edge
// wording (v4: nightly register closed), the uncompressed session register, and the explicit refusal to
// re-layout silently past the scale rule (§7: quires).
import { describe, expect, it } from 'vitest'
import { ATELIER_GRAMMAR } from '@/config/atelier-wording'
import { buildSpineSvg, spineRegister, type SpineInput } from './spine'
import { sessionRegister } from './sessions'

const pages = sessionRegister([
  'journal/2026-06-28.md',
  'journal/2026-06-28-sitzung-2.md',
  'journal/2026-06-29.md',
  'journal/2026-06-30.md',
  'journal/2026-07-01.md',
])

const input: SpineInput = {
  pages,
  worksByDate: { '2026-06-28': 1, '2026-06-30': 2 },
  errorsByDate: { '2026-06-29': 3 },
  threads: [{ session: 4, short: 'a thread', full: 'a thread, full label' }],
  constitutionNote: 'constitution amendments not mirrored here',
  worksCaption: 'hung by committed date',
}

describe('buildSpineSvg', () => {
  it('is pure: the same input renders byte-identical output on repeated calls', () => {
    expect(buildSpineSvg(input)).toBe(buildSpineSvg(structuredClone(input)))
  })

  it('draws one spine line per page plus the unwritten next page', () => {
    const svg = buildSpineSvg(input)
    expect(svg.match(/class="page"/g) ?? []).toHaveLength(pages.length)
    expect(svg.match(/class="page page-next"/g) ?? []).toHaveLength(1)
  })

  it('carries the approved data-edge formula verbatim (v4: nightly register closed …)', () => {
    const svg = buildSpineSvg(input)
    expect(svg).toContain(ATELIER_GRAMMAR.dataEdgeLines[0])
    expect(svg).toContain(ATELIER_GRAMMAR.dataEdgeLines[1])
  })

  it('names the missing constitution dates instead of drawing invented marks', () => {
    const svg = buildSpineSvg(input)
    expect(svg).toContain('constitution amendments not mirrored here')
    expect(svg).not.toContain('✳')
  })

  // Skalenregel erstmals aktiv mit S31/S32 (2026-07-16): >30 Seiten werfen nicht mehr,
  // sondern binden — die ältesten acht zu einer Oktav-Lage, deklariert auf der Karte.
  it('binds the oldest eight pages into a quire past 30 — declared on the map, register uncompressed', () => {
    const many = sessionRegister(
      Array.from({ length: 32 }, (_, i) => `journal/2026-08-${String(i + 1).padStart(2, '0')}.md`),
    )
    const svg = buildSpineSvg({ ...input, pages: many })
    expect(svg).toContain('S1–S8')
    expect(svg).toContain('class="quire"')
    expect(svg).toContain('oldest pages bind first, eight to a quire')
    // 24 lose Seiten + 1 ungeschriebene nächste Seite; die Lage zeichnet eigene page-Striche
    expect(svg.match(/<path class="page" d="M\d+ \d+ V\d+"><title>S\d+/g) ?? []).toHaveLength(24)
    // Register bleibt vollständig: eine Zeile pro Seite, keine Kompression
    expect(spineRegister({ ...input, pages: many })).toHaveLength(32)
  })

  it('quire mode is pure: same input ⇒ byte-identical output', () => {
    const many = sessionRegister(
      Array.from({ length: 32 }, (_, i) => `journal/2026-08-${String(i + 1).padStart(2, '0')}.md`),
    )
    expect(buildSpineSvg({ ...input, pages: many })).toBe(buildSpineSvg({ ...input, pages: structuredClone(many) }))
  })

  it('still refuses past the NEXT scale rule (volumes are a different generator)', () => {
    const far = sessionRegister(
      Array.from({ length: 241 }, (_, i) => `journal/2026-09-01-session-${i + 1}.md`),
    )
    expect(() => buildSpineSvg({ ...input, pages: far })).toThrow(/volumes/)
  })
})

describe('spineRegister', () => {
  it('compresses nothing: one row per page, counts at each day’s first page', () => {
    const rows = spineRegister(input)
    expect(rows).toHaveLength(pages.length)
    expect(rows[0]).toMatchObject({ page: 'S1', works: '1', anchor: 's1' })
    expect(rows[1]).toMatchObject({ page: 'S2', works: '', errors: '' })
    expect(rows[3].threadBorn).toBe('thread born: a thread')
  })
})
