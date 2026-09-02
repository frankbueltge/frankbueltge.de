// The Middle's partitur as a MODEL (visual layer, Phase 3d, 2026-09-02).
//
// Until this day the same assertions were made against an SVG STRING: the builder emitted markup
// and the tests grepped it for `mk-fill`, `lane-thin`, `class="flow flow-down`. The drawing is a
// React island now (src/components/ecology/MiddleScore.tsx), so the geometry is tested here as
// numbers and the MARKUP is tested where it is written — MiddleScore.test.tsx renders the island
// on the server and checks the class vocabulary the stylesheet inks. Nothing was dropped in the
// move: every question the string tests asked is asked below, of the model that answers it.
import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { MiddleVoice } from './middle'
import {
  buildMiddleScoreModel,
  bulletinSource,
  itemAnchor,
  itemNumbers,
  markTitle,
  MIDDLE_IDENTITY,
  middleRows,
  placeMiddle,
  plainText,
} from './middle-score-model'

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

const ROW_WORDING = {
  voiceName: (p: 'field' | 'atelier' | 'studio') => ({ field: 'The Field', atelier: 'The Atelier', studio: 'The Studio' })[p],
  addressedTo: (names: string[]) => `to ${names.join(' and ')}`,
  forBoth: 'for both',
}

describe('the middle partitur', () => {
  it('is deterministic — same voices, the same model', () => {
    expect(buildMiddleScoreModel(VOICES)).toEqual(buildMiddleScoreModel(VOICES))
  })

  it('lays three lanes in the voices’ own hues, and says which bulletin is quiet', () => {
    const model = buildMiddleScoreModel(VOICES)
    expect(model.lanes.map((l) => l.persona)).toEqual(['meridian', 'ulysses', 'ensemble'])
    expect(model.lanes.filter((l) => l.quiet).map((l) => l.practice)).toEqual(['atelier'])
    // the lanes stand at even intervals, in the canonical order of the practices
    expect(model.lanes.map((l) => l.y)).toEqual([148, 270, 392])
  })

  it('places one mark per item, in bulletin order along the ordinal ruler', () => {
    const model = buildMiddleScoreModel(VOICES)
    expect(model.marks.map((m) => m.practice)).toEqual(['field', 'field', 'studio'])
    expect(model.marks.map((m) => m.x)).toEqual([505, 780, 1055])
    // every mark stands on its own writer's lane
    for (const m of model.marks) {
      expect(m.y).toBe(model.lanes.find((l) => l.practice === m.practice)!.y)
    }
  })

  it('runs a current to every sibling an item names, and none for one carried for both', () => {
    const model = buildMiddleScoreModel(VOICES)
    // studio names two siblings, field names one — three currents in all
    expect(model.flows).toHaveLength(3)
    expect(model.flows.filter((f) => f.from === 'studio').map((f) => f.to).sort()).toEqual(['atelier', 'field'])
    const whiskered = model.marks.filter((m) => m.whisker)
    expect(whiskered.map((m) => m.id)).toEqual([itemAnchor('field', 1)])
    expect(model.flows.some((f) => f.markId === whiskered[0]!.id)).toBe(false)
  })

  it('numbers the marks in page order — the same count the quoted list wears', () => {
    const model = buildMiddleScoreModel(VOICES)
    expect(model.marks.map((m) => m.number)).toEqual([1, 2, 3])
    const numbers = itemNumbers(VOICES)
    expect(numbers.get(itemAnchor('field', 0))).toBe(1)
    expect(numbers.get(itemAnchor('studio', 0))).toBe(3)
  })

  it('names the bulletin every item was read from', () => {
    const model = buildMiddleScoreModel(VOICES)
    expect(model.marks.map((m) => m.source)).toEqual([
      'src/content/field/BULLETIN.md',
      'src/content/field/BULLETIN.md',
      'src/content/studio/BULLETIN.md',
    ])
    expect(bulletinSource('atelier')).toBe('src/content/atelier/BULLETIN.md')
  })

  it('keeps the item verbatim on the mark and strips the markdown only for reading', () => {
    const model = buildMiddleScoreModel(VOICES)
    expect(model.marks[0]!.text).toBe('**The correction is upheld.** Details follow.')
    expect(plainText(model.marks[0]!.text)).toBe('The correction is upheld. Details follow.')
  })

  it('titles a mark with the item’s own words, stripped of the marks and cut at a word', () => {
    expect(markTitle('**Bold** and `code` stay words.')).toBe('Bold and code stay words.')
    const long = markTitle(`${'word '.repeat(40)}end`)
    expect(long.length).toBeLessThanOrEqual(92)
    expect(long.endsWith('…')).toBe(true)
  })

  it('draws nothing and claims nothing when no bulletin speaks', () => {
    const model = buildMiddleScoreModel([
      { practice: 'field', present: false, items: [] },
      { practice: 'atelier', present: false, items: [] },
      { practice: 'studio', present: false, items: [] },
    ])
    expect(model.marks).toEqual([])
    expect(model.flows).toEqual([])
    expect(model.lanes.every((l) => l.quiet)).toBe(true)
  })
})

describe('the ordinal ruler under a view', () => {
  const model = buildMiddleScoreModel(VOICES)

  it('leaves everything where the model put it at the identity view', () => {
    const placed = placeMiddle(model, MIDDLE_IDENTITY)
    expect(placed.marks.map((p) => p.x)).toEqual(model.marks.map((m) => m.x))
    expect(placed.marks.every((p) => p.visible)).toBe(true)
    expect(placed.graticules).toEqual(model.marks.map((m) => m.x))
  })

  it('stretches the ruler and drops what it carries off the span', () => {
    const placed = placeMiddle(model, { k: 2, x: -400 })
    expect(placed.marks.map((p) => p.x)).toEqual([610, 1160, 1710])
    expect(placed.marks.map((p) => p.visible)).toEqual([true, true, false])
    // a current is placed with the mark it leaves, so nothing hangs in the air
    expect(placed.flows.filter((f) => f.visible).every((f) => f.x <= model.box.spanX1)).toBe(true)
    expect(placed.graticules).toEqual([610, 1160])
  })

  it('never moves a lane — the ruler stretches, the voices stay', () => {
    expect(placeMiddle(model, { k: 4, x: -900 }).marks.map((p) => p.mark.y)).toEqual(
      model.marks.map((m) => m.y),
    )
  })
})

describe('the table floor carries every item whole', () => {
  const model = buildMiddleScoreModel(VOICES)
  const rows = middleRows(model, ROW_WORDING)

  it('renders one row per mark, in the same order and with the same numbers', () => {
    expect(rows.map((r) => r.number)).toEqual(['1', '2', '3'])
    expect(rows.map((r) => r.voice)).toEqual(['The Field', 'The Field', 'The Studio'])
  })

  it('says whom each item is addressed to, and names neither when it is carried for both', () => {
    expect(rows[0]!.addressed).toBe('to The Studio')
    expect(rows[1]!.addressed).toBe('for both')
    expect(rows[2]!.addressed).toBe('to The Field and The Atelier')
  })

  it('quotes the item, never a summary of it', () => {
    expect(rows[0]!.item).toBe('The correction is upheld. Details follow.')
    expect(rows[2]!.item).toBe('A finding you may want.')
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
