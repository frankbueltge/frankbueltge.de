// src/lib/atelier/process.test.ts
import { describe, it, expect } from 'vitest'
import { baueProzessbild, nameOhneDatum, zerlegeJournalId, type RohProjekt } from './process'

// Reale Akten-Lage vom 2026-07-30 (aus src/content/atelier/projects/*), gekürzt auf die
// Felder, die das Bild braucht.
const PROJEKTE: RohProjekt[] = [
  { id: '2026-07-18-gate-rehearsal', title: 'Gate rehearsal', status: 'CLOSED', disposition: 'KILL', created: '2026-07-18', dateien: ['DECISION.md', 'SCORE.md'] },
  { id: '2026-07-19-null-island', title: 'Null Island', status: 'CLOSED', disposition: 'ARCHIVE_AS_STUDY', created: '2026-07-19', dateien: ['DECISION.md', 'SCORE.md', 'TRACE.md'] },
  {
    id: '2026-07-23-negative-parallax', title: 'Negative parallax', status: 'ACTIVE', disposition: 'PUBLICATION_CANDIDATE', created: '2026-07-23',
    dateien: ['APPARATUS.md', 'DECISION.md', 'EXPOSITION.md', 'FIGURE-NOTE.md', 'SCORE.md', 'SKETCH-NOTE.md', 'TRACE.md'],
  },
  {
    id: '2026-07-24-kartographie-statt-kopie', title: 'Kartographie statt Kopie', status: 'CLOSED', disposition: 'PUBLISH', created: '2026-07-24',
    dateien: ['APPARATUS.md', 'DECISION.md', 'EXPOSITION.md', 'SCORE.md'],
  },
  { id: '2026-07-24-put-back-on-the-map', title: 'Put back on the map', status: 'ACTIVE', disposition: '', created: '2026-07-24', dateien: ['SCORE.md', 'TRACE.md'] },
]

const JOURNAL = [
  'journal/2026-07-18-session-41',
  'journal/2026-07-24-protocol-v5-adoption',
  'journal/2026-07-19-null-island-first-tick',
  'journal/2026-07-26-negative-parallax-two-boundaries-one-unit',
  'journal/2026-07-27-negative-parallax-the-mark-that-is-not-propagated',
  'journal/2026-07-30-negative-parallax-an-illustrative-example',
  'journal/2026-07-24-put-back-on-the-map-initiation',
]

describe('nameOhneDatum / zerlegeJournalId', () => {
  it('trennt Datumspräfix und Namen', () => {
    expect(nameOhneDatum('2026-07-23-negative-parallax')).toBe('negative-parallax')
    expect(zerlegeJournalId('journal/2026-07-30-negative-parallax-an-example')).toEqual({
      datum: '2026-07-30',
      rest: 'negative-parallax-an-example',
    })
    expect(zerlegeJournalId('journal/README.md')).toBeNull()
  })
})

describe('baueProzessbild', () => {
  const bild = baueProzessbild(PROJEKTE, JOURNAL, '2026-07-30')

  it('liest den Ausgang aus der Akte, statt ihn zu raten', () => {
    const nach = (id: string) => bild.linien.find((l) => l.id.endsWith(id))!
    expect(nach('gate-rehearsal').ausgang).toBe('KILL')
    expect(nach('null-island').ausgang).toBe('ARCHIVE_AS_STUDY')
    expect(nach('negative-parallax').ausgang).toBe('PUBLICATION_CANDIDATE')
    expect(nach('kartographie-statt-kopie').ausgang).toBe('PUBLISH')
  })

  it('eine laufende Linie ohne Urteil ist OPEN — es wird keins erfunden', () => {
    expect(bild.linien.find((l) => l.id.endsWith('put-back-on-the-map'))!.ausgang).toBe('OPEN')
  })

  it('erkennt die erreichten Stationen an den vorhandenen Aktenstücken', () => {
    const np = bild.linien.find((l) => l.id.endsWith('negative-parallax'))!
    expect(np.stationen).toEqual({ SCORE: true, TRACE: true, APPARATUS: true, EXPOSITION: true, DECISION: true })
    const gr = bild.linien.find((l) => l.id.endsWith('gate-rehearsal'))!
    expect(gr.stationen.TRACE).toBe(false)
    expect(gr.stationen.APPARATUS).toBe(false)
  })

  it('zählt die Züge über den Namen der Linie', () => {
    expect(bild.linien.find((l) => l.id.endsWith('negative-parallax'))!.zuege).toBe(3)
    expect(bild.linien.find((l) => l.id.endsWith('null-island'))!.zuege).toBe(1)
    expect(bild.linien.find((l) => l.id.endsWith('kartographie-statt-kopie'))!.zuege).toBe(0)
  })

  it('weist Einträge aus, die zu keiner Linie gehören, statt sie zu unterschlagen', () => {
    // session-41 und protocol-v5-adoption sind Ereignisse der Praxis, keine Züge einer Linie.
    expect(bild.ohneLinie).toBe(2)
  })

  it('laufende Linien altern bis heute, geschlossene bis zu ihrem letzten Zug', () => {
    expect(bild.linien.find((l) => l.id.endsWith('negative-parallax'))!.tage).toBe(7)
    expect(bild.linien.find((l) => l.id.endsWith('null-island'))!.tage).toBe(0)
  })

  it('der längste passende Name gewinnt — kein Präfix stiehlt fremde Züge', () => {
    const bild2 = baueProzessbild(
      [
        { id: '2026-07-01-parallax', title: 'A', status: 'CLOSED', disposition: 'KILL', created: '2026-07-01', dateien: ['SCORE.md'] },
        { id: '2026-07-02-parallax-ii', title: 'B', status: 'CLOSED', disposition: 'KILL', created: '2026-07-02', dateien: ['SCORE.md'] },
      ],
      ['journal/2026-07-03-parallax-ii-a-move'],
      '2026-07-05',
    )
    expect(bild2.linien.find((l) => l.id.endsWith('parallax-ii'))!.zuege).toBe(1)
    expect(bild2.linien.find((l) => l.id === '2026-07-01-parallax')!.zuege).toBe(0)
  })

  it('die Häfen zählen jede Linie genau einmal', () => {
    const summe = bild.haefen.reduce((n, h) => n + h.anzahl, 0)
    expect(summe).toBe(PROJEKTE.length)
    expect(bild.haefen.map((h) => h.ausgang)).toEqual(['PUBLISH', 'PUBLICATION_CANDIDATE', 'ARCHIVE_AS_STUDY', 'KILL', 'OPEN'])
  })

  it('leere Eingabe kippt nicht um', () => {
    const leer = baueProzessbild([], [], '2026-07-30')
    expect(leer.linien).toEqual([])
    expect(leer.haefen).toEqual([])
    expect(leer.ohneLinie).toBe(0)
  })
})
