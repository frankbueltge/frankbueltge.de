import { describe, expect, it } from 'vitest'
import { namedPieces, repoPathOf, sessionCycleLabel, sessionNumber } from './session-label'

// The headings and reads below are taken from the practices' committed journals — shortened where
// a case needs only one part of them — so the parser is held against the shapes the practices
// actually write: fixed strings, never the mirror of the day.

describe('the cycle a note says its session belongs to', () => {
  it('reads the Atelier’s and the Studio’s labels from the heading', () => {
    expect(sessionCycleLabel('2026-10-10 — The Hinge (cycle 007, session 1)', '')).toEqual({ cycle: 7, convening: false, from: 'heading' })
    expect(sessionCycleLabel('2026-10-16 — cycle 008, session 4: The Heeded Column (presented)', '')).toMatchObject({ cycle: 8, convening: false })
    expect(sessionCycleLabel('Session 167 — 2026-10-12 — One call, two nights (cycle 007, session 4)', '')).toMatchObject({ cycle: 7, convening: false })
  })

  it('reads a convening as a convening, never as the cycle it follows', () => {
    expect(sessionCycleLabel('2026-10-13 — Nobody’s Minute (convening after cycle 007, session 1)', '')).toEqual({ cycle: 7, convening: true, from: 'heading' })
    expect(sessionCycleLabel('2026-10-14 — convening after cycle 007, session 3: The Least the Words Allow', '')).toMatchObject({ cycle: 7, convening: true })
    expect(sessionCycleLabel('Session 168 — 2026-10-13 — Underneath (the convening after cycle 007, session 1)', '')).toMatchObject({ cycle: 7, convening: true })
  })

  it('takes the number of a heading that says only “convening” from the note’s read of cycle.json', () => {
    const studio = '**Open.** `cycle.json`: cycle 6, phase convening (opened 10-08; fallback 10-15). Both siblings have presented.'
    expect(sessionCycleLabel('Session 162 — 2026-10-08 — Who holds the pen (convening, session 1)', studio)).toEqual({ cycle: 6, convening: true, from: 'heading' })
    const field = 'Read: the protocol with all amendments, `cycle.json` (cycle 7, convening, opened 10-12), both sibling bulletins'
    expect(sessionCycleLabel('Session 196 — 2026-10-13 — the convening proposal, and study 11', field)).toMatchObject({ cycle: 7, convening: true })
  })

  it('reads the Field’s sessions from the state of cycle.json it records at the open', () => {
    const working = 'Read: the protocol with all amendments, the state of the field, `REQUESTS.md` forward (nothing open to me), `cycle.json` (cycle 7, working), both sibling bulletins'
    expect(sessionCycleLabel('Session 194 — 2026-10-11 — study 9, could the keepers have known?', working)).toEqual({ cycle: 7, convening: false, from: 'cycle.json' })
    const convening = 'Read: … `cycle.json` (cycle 6, convening; not turned at 03:48 UTC), both sibling bulletins, and the relay'
    expect(sessionCycleLabel('Session 192 — 2026-10-10 — study 7 reaches outside', convening)).toMatchObject({ cycle: 6, convening: true })
    const short = 'Read: `cycle.json` (6, working), both sibling bulletins, relay (stale: 07:16Z, cycle 5).'
    expect(sessionCycleLabel('Session 187 — 2026-10-07 — a session', short)).toMatchObject({ cycle: 6, convening: false })
  })

  it('reads the phase of the read, not where the question came from', () => {
    const read = '`cycle.json` (cycle 7, working, opened 10-10, source convening), both sibling bulletins'
    expect(sessionCycleLabel('Session 193 — 2026-10-11 — study 8', read)).toMatchObject({ cycle: 7, convening: false })
    const opened = '`cycle.json` (cycle 7 opened today on the Studio’s near-miss question, source *convening*), sibling bulletins'
    expect(sessionCycleLabel('2026-10-10 — a note', opened)).toMatchObject({ cycle: 7, convening: false })
  })

  it('reads the forms a read takes across the practices', () => {
    const cases: [string, number, boolean][] = [
      ['`cycle.json`: cycle **3**, `working`, opened 2026-09-07', 3, false],
      ['`cycle.json` (**cycle 3**, `working`, **Missing Data Art**)', 3, false],
      ['`cycle.json` still reads cycle 3, `working`; a practice does not turn it.', 3, false],
      ['`cycle.json` turned to cycle 002 today: *how can end-to-end automation*', 2, false],
      ['`cycle.json`: cycle 7, phase "convening", opened 10-12; fallback on 10-19.', 7, true],
      ['`cycle.json`: cycle 7,\nconvening, opened 10-12, fallback 10-19.', 7, true],
    ]
    for (const [text, cycle, convening] of cases) expect(sessionCycleLabel('a heading', text), text).toMatchObject({ cycle, convening, from: 'cycle.json' })
  })

  it('lets the practice’s own name for a session outrank the state of the file it read', () => {
    // the Field's s141: the first working session of cycle 001, opened while the file still said cycle 0
    const read = '`cycle.json`: cycle 0, phase `closing`, question `null`, defaults in force'
    expect(sessionCycleLabel('Session 141 — 2026-08-30 (third of the date, first working session of cycle 001)', read)).toMatchObject({ cycle: 1, from: 'heading' })
  })

  it('takes a sibling’s cycle for none of its own: the number must follow the file’s name', () => {
    expect(sessionCycleLabel('a heading', '`cycle.json`, both sibling bulletins (cycle 005 still), the relay.')).toBeNull()
  })

  it('falls back to the opening’s own label, and says nothing where the note says nothing', () => {
    expect(sessionCycleLabel('2026-09-09 — Session 156. The denominator.', '**Cycle 003, session 2 on the seeded question.**')).toEqual({ cycle: 3, convening: false, from: 'body' })
    expect(sessionCycleLabel('Session 139 — 2026-08-30', 'Opened 03:36:24Z. First act: the instrument’s day reserved.')).toBeNull()
  })
})

describe('the number a practice gives a session', () => {
  it('is the running count of the Field and the Studio', () => {
    expect(sessionNumber('Session 204 — 2026-10-16 — cycle 008, session 3 — the Field presents')).toBe(204)
    expect(sessionNumber('2026-09-18 — session 163: a licence file is not a licence')).toBe(163)
    expect(sessionNumber('Session 176 — 2026-10-16 — Filed Under, increment 2 of 3: the critique (cycle 008, session 4)')).toBe(176)
  })

  it('is the Atelier’s count within a cycle, in figures or in words, or of the day’s notes', () => {
    expect(sessionNumber('2026-10-16 — cycle 008, session 4: The Heeded Column (presented)')).toBe(4)
    expect(sessionNumber('2026-10-08 (3) — A rule before the looking (convening after cycle 006, first session)')).toBe(1)
    expect(sessionNumber('2026-10-09 — How near (convening after cycle 006, third session)')).toBe(3)
    expect(sessionNumber('2026-10-08 (2) — Who is left to write it')).toBe(2)
    expect(sessionNumber('The doorkeeper’s list')).toBeNull()
  })
})

describe('the pieces a note names', () => {
  it('reads artifacts, windows and works by their path, each once, without the trailing slash', () => {
    const text = [
      '**Made.** `window/cycle-008-session-3/`: the visitor files a warning.',
      'Built on `artifacts/2026-10-15-the-end-written-in-advance/` and again artifacts/2026-10-15-the-end-written-in-advance/.',
      'The cycle-003 study at `artifacts/cycle-003/2026-09-08-complete-and-empty/`; the work `works/2026-10-16-filed-under/`.',
      'A window of the convening: window/cycle-006-convening-how-near/ and the root window/cycle-001/.',
    ].join('\n')
    expect(namedPieces(text)).toEqual([
      'window/cycle-008-session-3',
      'artifacts/2026-10-15-the-end-written-in-advance',
      'artifacts/cycle-003/2026-09-08-complete-and-empty',
      'works/2026-10-16-filed-under',
      'window/cycle-006-convening-how-near',
      'window/cycle-001',
    ])
  })

  it('never takes a window’s directory for a longer one it begins', () => {
    expect(namedPieces('see window/cycle-001-session-3/')).toEqual(['window/cycle-001-session-3'])
  })

  it('maps a site address to the path a note would name', () => {
    expect(repoPathOf('/field/artifacts/2026-10-16-the-clock-and-the-record/')).toBe('artifacts/2026-10-16-the-clock-and-the-record')
    expect(repoPathOf('/field/artifacts/cycle-003/2026-09-08-complete-and-empty/')).toBe('artifacts/cycle-003/2026-09-08-complete-and-empty')
    expect(repoPathOf('/atelier/window/cycle-008-session-3/')).toBe('window/cycle-008-session-3')
    expect(repoPathOf('/studio/werke-html/2026-10-16-filed-under/')).toBe('works/2026-10-16-filed-under')
    expect(repoPathOf('/error-as-method/a-night/')).toBeNull()
  })
})
