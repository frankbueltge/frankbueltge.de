// The living globe's wording, held to the two rules the file exists to keep.
//
// The digit guard is the old one of this house (docs/wording-kanon.md, "Schwarze Liste", and the
// same check the front door, the catalogues and the pyramid heads carry): a number typed into a
// sentence goes stale the next night and nobody notices, because a sentence does not fail a test.
// So every count, every day and every date is a FUNCTION argument or a `{placeholder}` — and this
// file walks the whole wording tree to prove it, rather than trusting an author to remember.
//
// The second rule is particular to an island: Astro serialises a component's props to JSON, so a
// function cannot cross that boundary. Everything under `island` must therefore be a plain string
// or a template, and the frames must be able to hand it over untouched.
import { describe, expect, it } from 'vitest'

import { GLOBE, degrees, fill, placePhrase, type PlaceWording } from './globe-wording'
import type { LabelKind, LayerRecord } from '@/lib/globe/layers/types'

/** Every string in a tree, with the path that leads to it; functions are walked past, because a
 *  function is exactly how a number is allowed to reach a sentence. */
function strings(value: unknown, path = ''): [string, string][] {
  if (typeof value === 'string') return [[path, value]]
  if (Array.isArray(value)) return value.flatMap((v, i) => strings(v, `${path}[${i}]`))
  if (value && typeof value === 'object') {
    return Object.entries(value).flatMap(([k, v]) => strings(v, path ? `${path}.${k}` : k))
  }
  return []
}

const ISLAND_STRINGS = strings(GLOBE.island)
const ALL_STRINGS = strings(GLOBE)

describe('no number is typed into a sentence', () => {
  it.each(ALL_STRINGS)('%s carries no digit', (path, text) => {
    // an href is a path, not a sentence, and this file has none with a digit anyway
    expect(text, `${path}: "${text}"`).not.toMatch(/\d/)
  })

  it('walks a tree that actually has something in it — a guard over nothing passes forever', () => {
    expect(ALL_STRINGS.length).toBeGreaterThan(50)
    expect(ISLAND_STRINGS.length).toBeGreaterThan(30)
  })
})

describe('the island’s half survives the props boundary', () => {
  it('holds no function — Astro serialises props to JSON, and a function would arrive as nothing', () => {
    expect(JSON.parse(JSON.stringify(GLOBE.island))).toEqual(GLOBE.island)
  })

  it('says every count in two forms, so the island’s only arithmetic is choosing between them', () => {
    for (const pair of [GLOBE.island.controls.marks, GLOBE.island.controls.days]) {
      expect(pair.one).toContain('{n}')
      expect(pair.many).toContain('{n}')
      expect(pair.one).not.toBe(pair.many)
    }
  })

  it('names a placeholder in every template that needs one', () => {
    expect(GLOBE.island.controls.provenance).toContain('{file}')
    expect(GLOBE.island.controls.provenance).toContain('{asOf}')
    expect(GLOBE.island.controls.provenance).toContain('{marks}')
    expect(GLOBE.island.controls.dayOf).toContain('{day}')
    expect(GLOBE.island.card.position).toContain('{layer}')
    expect(GLOBE.island.readout).toContain('{words}')
  })

  it('leaves an unfilled placeholder empty rather than printing its own braces at a reader', () => {
    expect(fill('{a} · {b}', { a: 'one' })).toBe('one · ')
  })
})

describe('a mark is said in words, never in a bare pair of coordinates', () => {
  const P: PlaceWording = GLOBE.island.place
  const record = (labelKind: LabelKind, at: LayerRecord['at']): LayerRecord => ({
    key: 'k',
    at,
    labelKind,
    receipt: { file: 'f', locator: 'l', words: 'w' },
  })

  it('covers every kind the contract allows — a kind with no phrase would print an empty sentence', () => {
    for (const kind of ['point', 'seat', 'centroid', 'station', 'gap'] as LabelKind[]) {
      expect(P[kind]).toBeTruthy()
      expect(GLOBE.island.card.kinds[kind]).toBeTruthy()
    }
  })

  it('says what a seat, a station and a centroid ARE, and never calls one the other', () => {
    expect(placePhrase(record('seat', [8.6, 50.1]), P)).toContain('seat of')
    expect(placePhrase(record('station', [-155.6, 19.5]), P)).toContain('station at')
    expect(placePhrase(record('centroid', [10.4, 51.1]), P)).toContain('centroid of')
    expect(placePhrase(record('point', [0, 0]), P)).toContain('over')
  })

  it('says a gap as two ends, because the vessel was at neither of them for the hours in between', () => {
    const phrase = placePhrase(record('gap', { from: [-5, 40], to: [-3, 42] }), P)
    expect(phrase).toContain('gap from')
    expect(phrase).toContain(' to ')
  })

  it('says a country resolved through the crosswalk as a centroid, and NAMES it (G3, second evening)', () => {
    // the repair: until 2026-09-03 this phrase filled in the alpha-3 code, and a reader was told
    // "centroid of the country QAT" — a receipt only somebody holding the crosswalk could read
    const phrase = placePhrase(record('centroid', { iso3: 'QAT', name: 'Qatar' }), P)
    expect(phrase).toBe('centroid of Qatar')
    expect(phrase).not.toContain('QAT')
  })

  it('writes a coordinate with its hemisphere, so a minus sign is never a reader’s problem', () => {
    expect(degrees(8.6, 50.1, P)).toBe('50.1°N, 8.6°E')
    expect(degrees(-70.6, -33.4, P)).toBe('33.4°S, 70.6°W')
  })
})

describe('the sheet’s own copy', () => {
  it('renders its counts through its functions, and the day it was handed', () => {
    expect(GLOBE.sheet.caption('2026-09-02', 364, 3)).toContain('2026-09-02')
    expect(GLOBE.sheet.caption('2026-09-02', 364, 3)).toContain('364 marks')
    expect(GLOBE.sheet.caption('2026-09-02', 1, 1)).toContain('1 mark from 1 layer')
  })

  it('states the whole span of the archive in the foot, from the data it is given', () => {
    const foot = GLOBE.sheet.foot(84, '2026-06-11', '2026-09-02')
    expect(foot).toContain('84 days')
    expect(foot).toContain('2026-06-11')
    expect(foot).toContain('2026-09-02')
    expect(foot).toContain('never from a clock')
  })
})
