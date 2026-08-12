// The pyramid's search heads, held to what a search result actually shows.
//
// Why this is a test and not a note: the first build of these five surfaces derived title and
// description from the practices' own door lines, which are 130 characters of considered prose.
// Nothing failed. The pages were correct, the headline was right, and the search result silently
// cut the practice's NAME off the end — the one string a name search has to see. A length rule
// that lives in a comment is a rule that drifts back the next time someone reuses a good sentence.

import { describe, expect, it } from 'vitest'
import { PYRAMID } from './ecology-pyramid-wording'

/** Google renders roughly 600px of title, which is ~60 characters at typical widths. The suffix
 *  " | Frank Bültge" is appended by every page, so the configured title gets what is left. */
const SUFFIX = ' | Frank Bültge'.length
const TITLE_MAX = 60 - SUFFIX
/** Descriptions are cut around 155–160 characters on desktop. */
const DESC_MAX = 160
/** Below this a description is not doing its job — it is a label, not a summary. */
const DESC_MIN = 70

const heads = [
  ['entrance', PYRAMID.entrance.seo],
  ...Object.entries(PYRAMID.stationSeo),
] as [string, { title: string; description: string }][]

describe('the pyramid’s search heads', () => {
  it.each(heads)('%s: the title survives the cut', (_name, head) => {
    expect(head.title.length).toBeLessThanOrEqual(TITLE_MAX)
  })

  it.each(heads)('%s: the description says something, and is not truncated', (_name, head) => {
    expect(head.description.length).toBeGreaterThanOrEqual(DESC_MIN)
    expect(head.description.length).toBeLessThanOrEqual(DESC_MAX)
  })

  it.each(heads)('%s: leads with the surface’s own name, not with a claim about it', (_name, head) => {
    // A result that opens "An empirical research collective putting…" is a sentence; a result
    // that opens "The Field —" is an answer to the query that brought someone there.
    expect(head.title).toMatch(/^The /)
  })

  it('gives every station its own head — no two surfaces compete for the same result', () => {
    const titles = heads.map(([, h]) => h.title)
    const descriptions = heads.map(([, h]) => h.description)
    expect(new Set(titles).size).toBe(titles.length)
    expect(new Set(descriptions).size).toBe(descriptions.length)
  })

  it('covers every station the pyramid has', () => {
    expect(Object.keys(PYRAMID.stationSeo).sort()).toEqual(['atelier', 'field', 'middle', 'studio'])
  })
})
