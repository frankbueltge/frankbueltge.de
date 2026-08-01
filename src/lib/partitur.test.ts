// Tests for the score's data layer — fixtures instead of live mirrors (same lesson
// as maschinenraum.test.ts: data rolls forward, tests must not pin snapshots).
import { describe, expect, it } from 'vitest'
import {
  buildScore,
  chronicleEvents,
  clampToLastDays,
  dayRange,
  fanOffsets,
  jiStart,
  journalEvents,
  MARK_OFFSETS,
  nearestMarkOffset,
  scoreOpenings,
  VOICE_META,
  type ScoreEvent,
} from './partitur'

const ev = (over: Partial<ScoreEvent>): ScoreEvent => ({
  voice: 'atelier',
  date: '2026-07-01',
  glyph: 'session',
  session: null,
  move: null,
  verdict: null,
  text: 'x',
  ...over,
})

describe('dayRange', () => {
  it('yields the gapless axis including both bounds, across month boundaries', () => {
    expect(dayRange('2026-06-29', '2026-07-02')).toEqual([
      '2026-06-29', '2026-06-30', '2026-07-01', '2026-07-02',
    ])
  })
  it('rejects reversed or broken bounds instead of guessing', () => {
    expect(dayRange('2026-07-02', '2026-07-01')).toEqual([])
    expect(dayRange('yesterday', '2026-07-01')).toEqual([])
  })
})

describe('chronicleEvents', () => {
  const base = { collective_session: 7, move: 'build', summary: 'Two sentences of plain language.', verdict: null, works: [], fail: false }
  it('ranks marks: fail flag > work contact/ship > session', () => {
    const [a, b, c, d] = chronicleEvents(
      [
        { ...base, date: '2026-07-01' },
        { ...base, date: '2026-07-02', works: ['w-1'] },
        { ...base, date: '2026-07-03', move: 'ship' },
        { ...base, date: '2026-07-04', fail: true, works: ['w-1'] },
      ],
      'field',
    )
    expect([a.glyph, b.glyph, c.glyph, d.glyph]).toEqual(['session', 'work', 'work', 'fail'])
    expect(a).toMatchObject({ voice: 'field', session: 7, move: 'build', text: 'Two sentences of plain language.' })
  })
  it('drops entries without a valid date instead of bending the axis', () => {
    expect(chronicleEvents([{ ...base, date: 'soon' }], 'field')).toEqual([])
  })
})

describe('journalEvents', () => {
  it('one event per date-prefixed file, first heading as text', () => {
    const events = journalEvents(
      {
        'p/journal/2026-07-20.md': '# **Move 12** — the gate holds\ntext',
        'p/journal/2026-07-21.md': '\nplain first line\n',
        'p/journal/README.md': '# no date',
      },
      'plenum',
    )
    expect(events).toHaveLength(2)
    expect(events.map((e) => e.glyph)).toEqual(['session', 'session'])
    expect(events.find((e) => e.date === '2026-07-20')?.text).toBe('Move 12 — the gate holds')
    expect(events.find((e) => e.date === '2026-07-21')?.text).toBe('plain first line')
  })
})

describe('scoreOpenings / jiStart', () => {
  const score = (front: string) => `---\n${front}\n---\nbody`
  const scores = {
    'a/projects/p1/SCORE.md': score('title: "Line A"\nkind: work-line\ncreated: 2026-07-25\nencounter_ref: ji-9 # bracket'),
    'a/projects/p2/SCORE.md': score('title: Study B\nsub_kind: study\ncreated: 2026-07-27\nencounter_ref: ji-9'),
    'a/projects/p3/SCORE.md': score('title: no date'),
  }
  it('turns SCORE `created` into work marks with kind and title', () => {
    const events = scoreOpenings(scores).sort((a, b) => a.date.localeCompare(b.date))
    expect(events).toHaveLength(2)
    expect(events[0]).toMatchObject({
      voice: 'atelier', date: '2026-07-25', glyph: 'work', move: 'work-line opened', text: 'Line A',
    })
  })
  it('jiStart takes the earliest `created` of the matching encounter_ref; otherwise null', () => {
    expect(jiStart(scores, 'ji-9')).toBe('2026-07-25')
    expect(jiStart(scores, 'ji-0')).toBeNull()
  })
})

describe('clampToLastDays', () => {
  it('windows relative to the NEWEST landing (archive end), not to today', () => {
    const events = [
      ev({ date: '2026-07-01' }),
      ev({ date: '2026-07-10' }),
      ev({ date: '2026-07-20' }),
    ]
    // 14-day window ending 07-20 → from 07-07: 07-01 falls out
    expect(clampToLastDays(events, 14).map((e) => e.date)).toEqual(['2026-07-10', '2026-07-20'])
    expect(clampToLastDays(events, 1).map((e) => e.date)).toEqual(['2026-07-20'])
    expect(clampToLastDays([], 14)).toEqual([])
  })
})

describe('MARK_OFFSETS / fanOffsets', () => {
  it('spreads up to three same-day landings symmetrically around the day center', () => {
    expect(MARK_OFFSETS[1]).toEqual([0])
    expect(MARK_OFFSETS[2]).toEqual([-6.5, 6.5])
    expect(MARK_OFFSETS[3]).toEqual([-9, 0, 9])
  })
  it('fans a dense (n > 3) day evenly, centered on 0', () => {
    expect(fanOffsets(4)).toEqual([-16.5, -5.5, 5.5, 16.5])
    expect(fanOffsets(1)).toEqual([0])
  })
})

describe('nearestMarkOffset', () => {
  // the hover fix (Frank, 2026-07-31): "nobody hits a 9px dot reliably" — anywhere inside a
  // cluster's hit band resolves to the CLOSEST mark by pointer distance, not always the first.
  const offsets = MARK_OFFSETS[3] // [-9, 0, 9]

  it('resolves the nearest mark for a pointer exactly on a mark', () => {
    expect(nearestMarkOffset(offsets, -9)).toBe(0)
    expect(nearestMarkOffset(offsets, 0)).toBe(1)
    expect(nearestMarkOffset(offsets, 9)).toBe(2)
  })

  it('resolves the nearest mark for a pointer BETWEEN two marks', () => {
    // -4 is 5 from -9 but only 4 from 0 — the middle mark wins
    expect(nearestMarkOffset(offsets, -4)).toBe(1)
    // 4.4 is nearer to 0 (4.4) than to 9 (4.6)
    expect(nearestMarkOffset(offsets, 4.4)).toBe(1)
    // 4.6 flips to the mark at 9 (4.4 away) over 0 (4.6 away)
    expect(nearestMarkOffset(offsets, 4.6)).toBe(2)
  })

  it('resolves a pointer past either edge to that edge mark', () => {
    expect(nearestMarkOffset(offsets, -100)).toBe(0)
    expect(nearestMarkOffset(offsets, 100)).toBe(2)
  })

  it('an exact tie goes to the earlier offset (deterministic, not unspecified)', () => {
    // 4.5 is equidistant between 0 (index 1) and 9 (index 2)
    expect(nearestMarkOffset(offsets, 4.5)).toBe(1)
  })

  it('a single-mark cluster always resolves to it', () => {
    expect(nearestMarkOffset(MARK_OFFSETS[1], 37)).toBe(0)
  })
})

describe('buildScore', () => {
  it('clusters per voice and day, the heaviest mark becomes the face, as-of per voice', () => {
    const model = buildScore([
      ev({ date: '2026-07-01' }),
      ev({ date: '2026-07-01', glyph: 'work' }),
      ev({ voice: 'field', date: '2026-07-03', glyph: 'fail' }),
      ev({ voice: 'plenum', date: '2026-07-02' }),
    ])
    expect(model).not.toBeNull()
    expect(model!.days).toEqual(['2026-07-01', '2026-07-02', '2026-07-03'])
    const atelier = model!.lanes.find((l) => l.voice === 'atelier')!
    expect(atelier.clusters).toHaveLength(1)
    expect(atelier.clusters[0].glyph).toBe('work')
    expect(atelier.clusters[0].events).toHaveLength(2)
    expect(atelier.asOf).toBe('2026-07-01')
    // lane order is the score order, even for empty voices
    expect(model!.lanes.map((l) => l.voice)).toEqual(['atelier', 'field', 'studio', 'plenum'])
    expect(model!.lanes.find((l) => l.voice === 'studio')!.asOf).toBeNull()
  })
  it('no events, no score — the surface then claims nothing', () => {
    expect(buildScore([])).toBeNull()
  })
})

/** Every lane label on the score is a link into that voice's own house (2026-08-02). The score is
 *  the one surface where all four voices sound at equal weight, and for the Plenum — a guest with
 *  no door on the hub — its lane is the only place on the entrance where it appears at all. So a
 *  lane without a house would strand a voice, and the compact score has no detail panel to fall
 *  back on. */
describe('VOICE_META', () => {
  it('gives every voice on the axis a room to open', () => {
    const model = buildScore([
      ev({ date: '2026-07-01' }),
      ev({ voice: 'field', date: '2026-07-01' }),
      ev({ voice: 'studio', date: '2026-07-01' }),
      ev({ voice: 'plenum', date: '2026-07-01' }),
    ])
    for (const lane of model!.lanes) {
      const meta = VOICE_META[lane.voice]
      expect(meta, `voice ${lane.voice}`).toBeDefined()
      expect(meta.href.startsWith('/'), `voice ${lane.voice}`).toBe(true)
      expect(meta.short.length, `voice ${lane.voice}`).toBeGreaterThan(0)
    }
  })

  it('sends the guest voice to its own room, not into a practice of this house', () => {
    // The Plenum is data-snack.com's resident collective; /plenum is the record it keeps here.
    expect(VOICE_META.plenum.href).toBe('/plenum')
    expect(VOICE_META.plenum.label).toContain('data-snack')
    const practiceRooms = (['atelier', 'field', 'studio'] as const).map((v) => VOICE_META[v].href)
    expect(practiceRooms).not.toContain(VOICE_META.plenum.href)
  })
})
