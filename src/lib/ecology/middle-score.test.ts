import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import type { MiddleVoice } from './middle'
import { buildMiddleScore, itemAnchor, markTitle } from './middle-score'

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

describe('the middle score model', () => {
  it('always draws three lanes, in the practices’ canonical order, quiet ones included', () => {
    const score = buildMiddleScore(VOICES)
    expect(score.lanes.map((l) => l.practice)).toEqual(['field', 'atelier', 'studio'])
    expect(score.lanes.map((l) => l.quiet)).toEqual([false, true, false])
  })

  it('draws one mark per item, on the writer’s lane', () => {
    const score = buildMiddleScore(VOICES)
    expect(score.marks).toHaveLength(3)
    const fieldLane = score.lanes.find((l) => l.practice === 'field')!
    for (const m of score.marks.filter((m) => m.from === 'field')) expect(m.y).toBe(fieldLane.y)
  })

  it('resolves a connector to every named sibling, and whiskers for an item that names none', () => {
    const score = buildMiddleScore(VOICES)
    const directed = score.marks.find((m) => m.from === 'studio')!
    expect(directed.targetYs).toHaveLength(2)
    expect(directed.both).toBe(false)
    const open = score.marks.find((m) => m.from === 'field' && m.to.length === 0)!
    expect(open.targetYs).toHaveLength(0)
    expect(open.both).toBe(true)
  })

  it('gives every mark a unique anchor the quoted list below can carry', () => {
    const score = buildMiddleScore(VOICES)
    const anchors = score.marks.map((m) => m.anchor)
    expect(new Set(anchors).size).toBe(anchors.length)
    expect(anchors[0]).toBe(itemAnchor('field', 0))
    for (const a of anchors) expect(a).toMatch(/^middle-item-(field|atelier|studio)-\d+$/)
  })

  it('keeps marks inside the drawing, past the label column', () => {
    const score = buildMiddleScore(VOICES)
    for (const m of score.marks) {
      expect(m.x).toBeGreaterThan(score.labelWidth)
      expect(m.x).toBeLessThan(score.width)
    }
  })

  it('tooltips carry the practice’s words, markdown marks stripped, cut at a word', () => {
    expect(markTitle('**Bold** and `code` stay words.')).toBe('Bold and code stay words.')
    const long = markTitle(`${'word '.repeat(40)}end`)
    expect(long.length).toBeLessThanOrEqual(92)
    expect(long.endsWith('…')).toBe(true)
  })
})

describe('the score is mounted where the traffic is quoted', () => {
  // Source-scan in the house pattern (naming.test.ts): a figure that exists but is reachable
  // from no page is the failure mode mounted.test.ts was written against.
  const page = fs.readFileSync(
    fileURLToPath(new URL('../../components/ecology/MiddleV3.astro', import.meta.url)),
    'utf8',
  )
  it('MiddleV3 renders the figure and anchors each quoted item with itemAnchor', () => {
    expect(page).toContain('MiddleScoreFigure')
    expect(page).toContain('buildMiddleScore')
    expect(page).toContain('itemAnchor(')
  })
})
