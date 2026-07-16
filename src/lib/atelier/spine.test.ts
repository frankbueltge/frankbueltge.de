// Determinism + honesty guard for the Buchrücken generator. Guards the approved data-edge
// wording (tonight's page), the uncompressed session register, and the explicit refusal to
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

  it('carries the approved data-edge formula verbatim (tonight’s page …)', () => {
    const svg = buildSpineSvg(input)
    expect(svg).toContain(ATELIER_GRAMMAR.dataEdgeLines[0])
    expect(svg).toContain(ATELIER_GRAMMAR.dataEdgeLines[1])
  })

  it('names the missing constitution dates instead of drawing invented marks', () => {
    const svg = buildSpineSvg(input)
    expect(svg).toContain('constitution amendments not mirrored here')
    expect(svg).not.toContain('✳')
  })

  it('refuses to re-layout past the scale rule (quires are a different generator)', () => {
    const many = sessionRegister(
      Array.from({ length: 31 }, (_, i) => `journal/2026-08-${String(i + 1).padStart(2, '0')}.md`),
    )
    expect(() => buildSpineSvg({ ...input, pages: many })).toThrow(/quires/)
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
