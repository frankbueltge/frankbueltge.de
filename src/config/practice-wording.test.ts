// The v3 surfaces' search heads, held to what a search result actually shows — the same rules
// ecology-pyramid-wording.test.ts pinned for the pyramid heads (2026-08-12), carried to the
// wording that replaced them (2026-09-01): the three practice stations, and the two v3 heads
// (entrance and Middle) that had shipped without a guard.
import { describe, expect, it } from 'vitest'
import { PRACTICE_V3 } from './practice-wording'
import { ECOLOGY_V3 } from './ecology-v3-wording'
import { MIDDLE_V3 } from './middle-v3-wording'

/** Google renders roughly 600px of title, which is ~60 characters at typical widths. The suffix
 *  " | Frank Bültge" is appended by every page, so the configured title gets what is left —
 *  held one character under the arithmetic bound, the budget this rebuild wrote its titles to. */
const SUFFIX = ' | Frank Bültge'.length
const TITLE_MAX = 60 - SUFFIX - 1
/** Descriptions are cut around 155–160 characters on desktop. */
const DESC_MAX = 160
/** Below this a description is not doing its job — it is a label, not a summary. */
const DESC_MIN = 70

const heads = [
  ...Object.entries(PRACTICE_V3).map(
    ([id, w]) => [id, w.seo] as [string, { title: string; description: string }],
  ),
  ['ecology entrance', ECOLOGY_V3.seo],
  ['the Middle', MIDDLE_V3.seo],
] as [string, { title: string; description: string }][]

describe('the v3 surfaces’ search heads', () => {
  it.each(heads)('%s: the title survives the cut', (_name, head) => {
    expect(head.title.length).toBeLessThanOrEqual(TITLE_MAX)
  })

  it.each(heads)('%s: the description says something, and is not truncated', (_name, head) => {
    expect(head.description.length).toBeGreaterThanOrEqual(DESC_MIN)
    expect(head.description.length).toBeLessThanOrEqual(DESC_MAX)
  })

  it.each(heads)('%s: leads with the surface’s own name, not with a claim about it', (_name, head) => {
    // A result that opens "Measurements over impressions…" is a sentence; a result that opens
    // "The Field —" is an answer to the query that brought someone there.
    expect(head.title).toMatch(/^The /)
  })

  it('gives every surface its own head — no two compete for the same result', () => {
    const titles = heads.map(([, h]) => h.title)
    const descriptions = heads.map(([, h]) => h.description)
    expect(new Set(titles).size).toBe(titles.length)
    expect(new Set(descriptions).size).toBe(descriptions.length)
  })

  it('covers every practice the ecology has', () => {
    expect(Object.keys(PRACTICE_V3).sort()).toEqual(['atelier', 'field', 'studio'])
  })
})

describe('the stations’ own copy', () => {
  it('types no digit into an identity paragraph — counts are derived, dates are decisions', () => {
    // The one number an identity may carry is a decision date (YYYY-MM-DD): a dated decision is
    // a fact of the record, not a count that drifts. Anything else numeric belongs in the data.
    for (const [id, w] of Object.entries(PRACTICE_V3)) {
      const withoutDates = w.identity.replace(/\d{4}-\d{2}-\d{2}/g, '')
      expect(withoutDates, `digit in the ${id} identity`).not.toMatch(/\d/)
    }
  })

  it('writes every counted line around its argument, never around a memory of it', () => {
    for (const [id, w] of Object.entries(PRACTICE_V3)) {
      expect(w.madeLine(7), `madeLine of ${id}`).toContain('7')
      expect(w.registerLabel(7), `registerLabel of ${id}`).toContain('7')
      expect(w.registerHref.startsWith('/'), `registerHref of ${id}`).toBe(true)
    }
  })
})
