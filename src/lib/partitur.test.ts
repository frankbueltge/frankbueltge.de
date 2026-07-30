// Tests für die Partitur-Datenlage — Fixtures statt Live-Spiegel (dieselbe Lehre wie
// maschinenraum.test.ts: Daten rollen, Tests pinnen keine Snapshots).
import { describe, expect, it } from 'vitest'
import {
  buildScore,
  chronicleEvents,
  clampToLastDays,
  dayRange,
  jiStart,
  journalEvents,
  scoreOpenings,
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
  it('liefert die lückenlose Achse inklusive beider Grenzen, auch über Monatsgrenzen', () => {
    expect(dayRange('2026-06-29', '2026-07-02')).toEqual([
      '2026-06-29', '2026-06-30', '2026-07-01', '2026-07-02',
    ])
  })
  it('lehnt verdrehte oder kaputte Grenzen ab statt zu raten', () => {
    expect(dayRange('2026-07-02', '2026-07-01')).toEqual([])
    expect(dayRange('gestern', '2026-07-01')).toEqual([])
  })
})

describe('chronicleEvents', () => {
  const base = { collective_session: 7, move: 'build', summary: 'Zwei Sätze Klartext.', verdict: null, works: [], fail: false }
  it('stuft Marken: fail-Flag > Werkberührung/ship > Session', () => {
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
    expect(a).toMatchObject({ voice: 'field', session: 7, move: 'build', text: 'Zwei Sätze Klartext.' })
  })
  it('verwirft Einträge ohne gültiges Datum, statt die Achse zu verbiegen', () => {
    expect(chronicleEvents([{ ...base, date: 'bald' }], 'field')).toEqual([])
  })
})

describe('journalEvents', () => {
  it('ein Event je datumspräfigierter Datei, erste Überschrift als Text', () => {
    const events = journalEvents(
      {
        'p/journal/2026-07-20.md': '# **Move 12** — the gate holds\ntext',
        'p/journal/2026-07-21.md': '\nplain first line\n',
        'p/journal/README.md': '# kein Datum',
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
    'a/projects/p1/SCORE.md': score('title: "Linie A"\nkind: work-line\ncreated: 2026-07-25\nencounter_ref: ji-9 # Klammer'),
    'a/projects/p2/SCORE.md': score('title: Studie B\nsub_kind: study\ncreated: 2026-07-27\nencounter_ref: ji-9'),
    'a/projects/p3/SCORE.md': score('title: ohne Datum'),
  }
  it('macht aus SCORE-created Werk-Marken mit Kind und Titel', () => {
    const events = scoreOpenings(scores).sort((a, b) => a.date.localeCompare(b.date))
    expect(events).toHaveLength(2)
    expect(events[0]).toMatchObject({
      voice: 'atelier', date: '2026-07-25', glyph: 'work', move: 'work-line opened', text: 'Linie A',
    })
  })
  it('jiStart nimmt das früheste created der passenden encounter_ref; sonst null', () => {
    expect(jiStart(scores, 'ji-9')).toBe('2026-07-25')
    expect(jiStart(scores, 'ji-0')).toBeNull()
  })
})

describe('clampToLastDays', () => {
  it('fenstert relativ zur JÜNGSTEN Landung (Archivende), nicht zu heute', () => {
    const events = [
      ev({ date: '2026-07-01' }),
      ev({ date: '2026-07-10' }),
      ev({ date: '2026-07-20' }),
    ]
    // Fenster 14 Tage ab Ende 07-20 → ab 07-07: 07-01 fällt raus
    expect(clampToLastDays(events, 14).map((e) => e.date)).toEqual(['2026-07-10', '2026-07-20'])
    expect(clampToLastDays(events, 1).map((e) => e.date)).toEqual(['2026-07-20'])
    expect(clampToLastDays([], 14)).toEqual([])
  })
})

describe('buildScore', () => {
  it('bündelt je Stimme und Tag, schwerste Marke wird das Gesicht, as-of je Stimme', () => {
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
    // Reihenfolge der Stimmen ist die Partitur-Reihenfolge, auch bei leeren Stimmen
    expect(model!.lanes.map((l) => l.voice)).toEqual(['atelier', 'field', 'studio', 'plenum'])
    expect(model!.lanes.find((l) => l.voice === 'studio')!.asOf).toBeNull()
  })
  it('ohne Events keine Partitur — die Fläche behauptet dann nichts', () => {
    expect(buildScore([])).toBeNull()
  })
})
