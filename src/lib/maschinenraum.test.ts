// Tests für die Maschinenraum-Datenlage — Fixtures statt Live-Spiegel (Lehre aus dem
// Puls-Wochenfenster-Test 2026-07-24: Daten rollen, Tests pinnen keine Snapshots).
import { describe, expect, it } from 'vitest'
import { atelierState, jiStatus, lastChronicle, latestJournal, trimLine } from './maschinenraum'

describe('latestJournal', () => {
  it('nimmt den jüngsten datumspräfigierten Eintrag und dessen erste Überschrift', () => {
    const j = latestJournal({
      'a/journal/2026-07-20.md': '# Alt\ntext',
      'a/journal/2026-07-24.md': '# **Neu** und `wichtig`\ntext',
    })
    expect(j).toEqual({ date: '2026-07-24', slug: '2026-07-24', firstLine: 'Neu und wichtig' })
    // Same-Day-Suffixe ordnen lexikographisch ('.md' nach '-'); das ist dokumentiertes
    // Verhalten, keine Zeitaussage — Dateinamen tragen keine Uhrzeit.
  })

  it('fällt ohne Überschrift auf die erste nicht-leere Zeile zurück; leer → null', () => {
    expect(latestJournal({ 'j/2026-01-01.md': '\nerste Zeile\n' })?.firstLine).toBe('erste Zeile')
    expect(latestJournal({})).toBeNull()
    expect(latestJournal({ 'j/README.md': '# kein Datum' })).toBeNull()
  })
})

describe('atelierState', () => {
  const score = (front: string) => `---\n${front}\n---\nbody`
  it('sammelt aktive Linien/Studien mit Kind und Encounter-Ref, zählt Geschlossene', () => {
    const s = atelierState({
      'x/projects/p-line/SCORE.md': score('status: ACTIVE\nkind: work-line\ntitle: "Linie"\nencounter_ref: ji-1 # Kommentar'),
      'x/projects/p-study/SCORE.md': score('status: ACTIVE\nkind: study\ntitle: Studie'),
      'x/projects/p-old/SCORE.md': score('status: CLOSED\ntitle: Zu'),
      'x/projects/p-legacy/SCORE.md': score('status: ACTIVE\ntitle: Altprojekt'),
    })
    expect(s.closed).toBe(1)
    expect(s.active.map((a) => a.kind)).toEqual(['work-line', 'study', 'project'])
    expect(s.active[0]).toMatchObject({ id: 'p-line', title: 'Linie', encounterRef: 'ji-1' })
  })
})

describe('jiStatus', () => {
  const req = [
    '## Anderes',
    'text',
    '## Team note — Offer: joint inquiry (ji-2026-002)',
    'prosa **Status:** open — an offer; accept or decline.',
    '',
    '**Status addendum (Meridian, 2026-07-25):** first move under way — kill condition returned.',
    '## Nächster Abschnitt',
  ].join('\n')

  it('findet den letzten Status-Satz des ji-Abschnitts', () => {
    const s = jiStatus(req, 'ji-2026-002')
    expect(s.present).toBe(true)
    expect(s.status).toContain('Status addendum (Meridian, 2026-07-25): first move under way')
  })

  it('meldet Abwesenheit ehrlich', () => {
    expect(jiStatus('## Nichts\nhier', 'ji-2026-002')).toEqual({ present: false })
  })
})

describe('lastChronicle', () => {
  it('nimmt den höchsten seq und trimmt die Summary', () => {
    const l = lastChronicle([
      { seq: 1, date: '2026-07-01', collective_session: 1, move: 'build', summary: 'a'.repeat(30) },
      { seq: 2, date: '2026-07-02', collective_session: 2, move: 'verify', summary: 'b'.repeat(300) },
    ])
    expect(l?.move).toBe('verify')
    expect(l?.summary.length).toBeLessThanOrEqual(180)
    expect(l?.summary.endsWith('…')).toBe(true)
  })
  it('leer → null', () => expect(lastChronicle([])).toBeNull())
})

describe('trimLine', () => {
  it('lässt kurze Zeilen unangetastet', () => expect(trimLine('kurz', 10)).toBe('kurz'))
})
