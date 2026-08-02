import { describe, expect, it } from 'vitest'
import registerJson from '@/data/begegnungen/register.json'
import inquiriesJson from '@/data/begegnungen/joint-inquiries.json'
import enc001 from '@/data/begegnungen/enc-2026-001/score.json'
import enc005 from '@/data/begegnungen/enc-2026-005/score.json'
import { buildCrossings, type Crossing } from './crossings'
import { buildCrossingsMap } from './crossings-map'

const crossings = buildCrossings({
  inquiries: inquiriesJson,
  register: registerJson,
  ledgers: { 'enc-2026-001': enc001, 'enc-2026-005': enc005 },
})

describe('buildCrossingsMap against the committed register', () => {
  const map = buildCrossingsMap(crossings)!

  it('draws the register’s formal encounters and NOTHING else', () => {
    expect(map.marks).toHaveLength(registerJson.length)
    expect(map.marks.every((m) => m.crossingId.startsWith('enc-'))).toBe(true)
    // The joint inquiry is on the page; it is deliberately not on this figure, because the
    // figure's sign grammar (source → receiver) has no reading for a question answered three
    // ways in parallel.
    expect(map.marks.some((m) => m.crossingId.startsWith('ji-'))).toBe(false)
  })

  it('numbers each mark by the register’s own ordinal, in register order', () => {
    expect(map.marks.map((m) => m.n)).toEqual(['001', '002', '003', '004', '005'])
  })

  it('draws a lane only for a voice a recorded encounter actually names', () => {
    const named = new Set(crossings.filter((c) => c.kind === 'encounter').flatMap((c) => c.voices.map((v) => v.voice)))
    expect(new Set(map.lanes.map((l) => l.voice))).toEqual(named)
    expect(map.lanes.length).toBeGreaterThan(1)
  })

  it('puts the conductor at the foot — the hand that keeps the zone sits under the practices', () => {
    expect(map.lanes.at(-1)?.voice).toBe('conductor')
  })

  it('gives every voice its recorded hue, and the conductor the declared neutral', () => {
    expect(map.lanes.find((l) => l.voice === 'meridian')?.hue).toBe('meridian')
    expect(map.lanes.find((l) => l.voice === 'conductor')?.hue).toBe('neutral')
    // MRR wears Meridian's hue: it is Meridian's tool, and one house keeps one colour.
    expect(map.lanes.find((l) => l.voice === 'mrr')?.hue).toBe('meridian')
  })

  it('bridges only the lanes an encounter actually joined', () => {
    const atlas = map.marks.find((m) => m.crossingId.startsWith('enc-2026-005'))!
    expect(atlas.sources.map((s) => s.voice)).toEqual(['mrr'])
    expect(atlas.receivers.map((r) => r.voice)).toEqual(['ulysses'])
    expect(atlas.yTop).toBeLessThan(atlas.yBottom)
  })

  it('trims the register’s status line to its leading clause — a tooltip is not a paragraph', () => {
    const diner = map.marks.find((m) => m.crossingId.startsWith('enc-2026-004'))!
    expect(diner.status).toBe('open/standing')
  })

  it('is deterministic: the same record draws the same figure', () => {
    expect(buildCrossingsMap(crossings)).toEqual(map)
  })

  it('keeps every mark inside its own viewBox', () => {
    for (const m of map.marks) {
      expect(m.x).toBeGreaterThan(map.laneX0)
      expect(m.x).toBeLessThan(map.laneX1)
      expect(m.badgeY).toBeGreaterThan(0)
      expect(m.yBottom).toBeLessThan(map.height)
    }
  })
})

describe('buildCrossingsMap degrades honestly', () => {
  it('draws nothing rather than an empty frame when no encounter is recorded', () => {
    expect(buildCrossingsMap([])).toBeNull()
    expect(buildCrossingsMap(crossings.filter((c) => c.kind === 'joint-inquiry'))).toBeNull()
  })

  it('never throws on input that is not a list of crossings', () => {
    for (const junk of [null, undefined, 'x', 42, [null], [{}]]) {
      expect(() => buildCrossingsMap(junk as never)).not.toThrow()
    }
  })

  it('places a single encounter without dividing by zero', () => {
    const one = crossings.filter((c) => c.kind === 'encounter').slice(0, 1)
    const map = buildCrossingsMap(one)!
    expect(map.marks).toHaveLength(1)
    expect(Number.isFinite(map.marks[0].x)).toBe(true)
  })

  it('gives an unknown participant a lane rather than dropping the encounter', () => {
    const stub: Crossing = {
      ...crossings.find((c) => c.kind === 'encounter')!,
      voices: [{ voice: 'unknown', rawVoice: 'a-collective-founded-tonight', role: 'source', localStatus: null, localQuestion: null, headlineClaim: null, output: null }],
    }
    const map = buildCrossingsMap([stub])!
    expect(map.lanes.map((l) => l.voice)).toContain('unknown')
  })
})
