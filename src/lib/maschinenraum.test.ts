// Tests for the machine room's data layer — fixtures, never the live mirrors (the lesson of the
// pulse week-window test, 2026-07-24: data rolls, tests must not pin snapshots).
//
// English since 2026-08-02, when this file was opened to drop the joint-inquiry reader: the
// EN-only rule covers test names too, and a file being touched is when its German is migrated.
import { describe, expect, it } from 'vitest'
import inquiriesJson from '@/data/begegnungen/joint-inquiries.json'
import { atelierState, jiBracket, lastChronicle, latestJournal, trimLine } from './maschinenraum'

describe('latestJournal', () => {
  it('takes the newest date-prefixed entry and its first heading', () => {
    const j = latestJournal({
      'a/journal/2026-07-20.md': '# Old\ntext',
      'a/journal/2026-07-24.md': '# **New** and `important`\ntext',
    })
    expect(j).toEqual({ date: '2026-07-24', slug: '2026-07-24', firstLine: 'New and important' })
    // Same-day suffixes order lexicographically ('.md' after '-'); documented behaviour, not a
    // statement about time — the file names carry no clock.
  })

  it('falls back to the first non-empty line where there is no heading; empty → null', () => {
    expect(latestJournal({ 'j/2026-01-01.md': '\nfirst line\n' })?.firstLine).toBe('first line')
    expect(latestJournal({})).toBeNull()
    expect(latestJournal({ 'j/README.md': '# no date' })).toBeNull()
  })
})

describe('atelierState', () => {
  const score = (front: string) => `---\n${front}\n---\nbody`
  it('collects the active lines/studies with kind and encounter ref, and counts the closed', () => {
    const s = atelierState({
      'x/projects/p-line/SCORE.md': score('status: ACTIVE\nkind: work-line\ntitle: "Line"\nencounter_ref: ji-1 # comment'),
      'x/projects/p-study/SCORE.md': score('status: ACTIVE\nkind: study\ntitle: Study'),
      'x/projects/p-old/SCORE.md': score('status: CLOSED\ntitle: Shut'),
      'x/projects/p-legacy/SCORE.md': score('status: ACTIVE\ntitle: Legacy project'),
    })
    expect(s.closed).toBe(1)
    expect(s.active.map((a) => a.kind)).toEqual(['work-line', 'study', 'project'])
    expect(s.active[0]).toMatchObject({ id: 'p-line', title: 'Line', encounterRef: 'ji-1' })
  })
})

describe('lastChronicle', () => {
  it('takes the highest seq and trims the summary', () => {
    const l = lastChronicle([
      { seq: 1, date: '2026-07-01', collective_session: 1, move: 'build', summary: 'a'.repeat(30) },
      { seq: 2, date: '2026-07-02', collective_session: 2, move: 'verify', summary: 'b'.repeat(300) },
    ])
    expect(l?.move).toBe('verify')
    expect(l?.summary.length).toBeLessThanOrEqual(180)
    expect(l?.summary.endsWith('…')).toBe(true)
  })
  it('empty → null', () => expect(lastChronicle([])).toBeNull())
})

describe('trimLine', () => {
  it('leaves short lines untouched', () => expect(trimLine('short', 10)).toBe('short'))
})

/** The bracket both scores draw. Fixtures for the rules, the committed register for the contract —
 *  never a pinned name: "Model Collapse" being hardcoded in two templates is the defect this
 *  helper exists to remove, and pinning it here would put the third copy in the tests. */
describe('jiBracket', () => {
  const scores = {
    'x/projects/p/SCORE.md': '---\nstatus: ACTIVE\nencounter_ref: ji-1\nopened: 2026-07-20\n---\n',
  }

  it('takes its id, name and lanes from the record, mapping the register’s voices onto the score’s', () => {
    const b = jiBracket(
      [
        {
          inquiry_id: 'ji-1',
          title: 'A shared question',
          status: 'REVIEW',
          participants: [
            { practice_id: 'ulysses' },
            { practice_id: 'meridian' },
            { practice_id: 'ensemble' },
          ],
        },
      ],
      scores,
    )
    expect(b?.id).toBe('ji-1')
    expect(b?.label).toBe('A shared question')
    expect(b?.voices).toEqual(['atelier', 'field', 'studio'])
  })

  it('draws no bracket where the record does not call the inquiry open — the caption says "still open"', () => {
    expect(jiBracket([{ inquiry_id: 'ji-1', title: 'Done', status: 'closed' }], scores)).toBeNull()
    expect(jiBracket([], scores)).toBeNull()
  })

  it('drops a participant the score has no lane for instead of inventing one', () => {
    const b = jiBracket(
      [
        {
          inquiry_id: 'ji-1',
          title: 'q',
          status: 'open',
          participants: [{ practice_id: 'meridian' }, { practice_id: 'datavism' }, { practice_id: 'nobody-here' }],
        },
      ],
      scores,
    )
    expect(b?.voices).toEqual(['field'])
  })

  it('brackets the inquiry the committed register actually carries', () => {
    const b = jiBracket(inquiriesJson, {})
    expect(b).not.toBeNull()
    expect(b!.id).toMatch(/^ji-/)
    expect(b!.label.length).toBeGreaterThan(0)
    expect(b!.voices.length).toBeGreaterThan(0)
  })
})
