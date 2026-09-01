import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { MiddleVoice } from './middle'
import { buildMiddleScoreSvg, itemAnchor, itemNumbers, markTitle } from './middle-score'

const VOICES: MiddleVoice[] = [
  {
    practice: 'field',
    present: true,
    items: [
      { from: 'field', to: ['studio'], text: '**The correction is upheld.** Details follow.' },
      { from: 'field', to: [], text: 'Carried for both siblings, naming neither.' },
    ],
  },
  { practice: 'atelier', present: false, items: [] },
  {
    practice: 'studio',
    present: true,
    items: [{ from: 'studio', to: ['field', 'atelier'], text: 'A finding you `may` want.' }],
  },
]

describe('the middle partitur', () => {
  it('is deterministic — same voices, byte-identical drawing', () => {
    expect(buildMiddleScoreSvg(VOICES)).toBe(buildMiddleScoreSvg(VOICES))
  })

  it('draws three lanes in the original grammar, the quiet one thin and labeled', () => {
    const svg = buildMiddleScoreSvg(VOICES)
    for (const lane of ['meridian', 'ulysses', 'ensemble']) expect(svg).toContain(`pr-${lane}`)
    expect(svg.match(/lane-thin/g)!.length).toBe(1)
    expect(svg).toContain('quiet this session')
    expect(svg).toContain('ordinal · bulletin order')
  })

  it('draws one object square per item, a current with a ring per named sibling', () => {
    const svg = buildMiddleScoreSvg(VOICES)
    expect(svg.match(/mk-fill/g)!.length).toBe(3)
    // studio names two siblings, field names one — three currents, three rings
    expect(svg.match(/class="flow flow-down/g)!.length).toBe(3)
    expect(svg.match(/<circle class="mk pr-/g)!.length).toBe(3)
  })

  it('draws whiskers for an item carried for both, and no current for it', () => {
    const svg = buildMiddleScoreSvg([VOICES[0]!, VOICES[1]!, { practice: 'studio', present: true, items: [] }])
    expect(svg.match(/class="obl/g)!.length).toBe(2)
    expect(svg.match(/class="flow flow-down/g)!.length).toBe(1)
  })

  it('numbers the marks in page order — the same count the quoted list wears', () => {
    const svg = buildMiddleScoreSvg(VOICES)
    const badges = [...svg.matchAll(/class="badge-n"[^>]*>(\d+)</g)].map((m) => Number(m[1]))
    expect(badges).toEqual([1, 2, 3])
    const numbers = itemNumbers(VOICES)
    expect(numbers.get(itemAnchor('field', 0))).toBe(1)
    expect(numbers.get(itemAnchor('studio', 0))).toBe(3)
  })

  it('links every mark to its quoted item and titles it with the item’s own words', () => {
    const svg = buildMiddleScoreSvg(VOICES)
    expect(svg).toContain(`href="#${itemAnchor('field', 0)}"`)
    expect(svg).toContain(`href="#${itemAnchor('studio', 0)}"`)
    expect(svg).toContain('<title>The correction is upheld. Details follow.</title>')
  })

  it('tooltips strip the markdown marks and cut at a word', () => {
    expect(markTitle('**Bold** and `code` stay words.')).toBe('Bold and code stay words.')
    const long = markTitle(`${'word '.repeat(40)}end`)
    expect(long.length).toBeLessThanOrEqual(92)
    expect(long.endsWith('…')).toBe(true)
  })
})

describe('the partitur is mounted where the traffic is quoted', () => {
  // Source-scan in the house pattern (naming.test.ts): a figure that exists but is reachable
  // from no page is the failure mode mounted.test.ts was written against.
  const page = fs.readFileSync(
    fileURLToPath(new URL('../../components/ecology/MiddleV3.astro', import.meta.url)),
    'utf8',
  )
  it('MiddleV3 renders the figure, anchors the items, and wears the same numbers', () => {
    expect(page).toContain('MiddleScoreFigure')
    expect(page).toContain('itemAnchor(')
    expect(page).toContain('itemNumbers(')
  })
})
