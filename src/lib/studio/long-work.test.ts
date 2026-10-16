import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { describe, expect, it } from 'vitest'
import { hasScore, inProgress, longWorks, STUDIO_STAGE_DIR, type ChronicleMove } from './long-work'

// The chronicle of a long work as the amendment of 2026-10-15 has the practice write it (point 8):
// the score and each increment `build`, the critique `verify`, the last session `ship`. Fixed
// entries modelled on cycle 008 — never the mirror of the day.
const LONG = '2026-10-16-filed-under'
const ONE_NIGHT = '2026-10-15-the-unsent'
const entry = (collective_session: number | null, date: string, move: ChronicleMove['move'], works: string[]): ChronicleMove => ({
  collective_session,
  date,
  move,
  works,
})
const isLong = (slug: string) => slug === LONG

describe('a long work, counted from the chronicle', () => {
  const growing = [
    entry(174, '2026-10-15', 'build', [ONE_NIGHT]),
    entry(175, '2026-10-16', 'build', [LONG]),
    entry(176, '2026-10-16', 'verify', [LONG]),
  ]

  it('is advanced by every session the chronicle records under it — the score, the increments, the critique', () => {
    const [work] = longWorks(growing, isLong)
    expect(work!.slug).toBe(LONG)
    expect(work!.sessions).toEqual([
      { session: 175, date: '2026-10-16', move: 'build' },
      { session: 176, date: '2026-10-16', move: 'verify' },
    ])
  })

  it('is in progress until a session ships it, and never a premiere before', () => {
    expect(longWorks(growing, isLong)[0]!.shipped).toBeNull()
    expect([...inProgress(longWorks(growing, isLong))]).toEqual([LONG])

    const shipped = longWorks([...growing, entry(177, '2026-10-17', 'ship', [LONG])], isLong)
    expect(shipped[0]!.shipped).toEqual({ session: 177, date: '2026-10-17', move: 'ship' })
    expect(inProgress(shipped).size).toBe(0)
  })

  it('leaves a work made in one session alone: it is not a long work', () => {
    expect(longWorks(growing, isLong).map((w) => w.slug)).not.toContain(ONE_NIGHT)
  })

  it('counts a session once, and only under the three moves the amendment names', () => {
    const noisy = [
      ...growing,
      entry(176, '2026-10-16', 'verify', [LONG, LONG]),
      entry(178, '2026-10-18', 'steer', [LONG]),
      entry(null, '2026-10-18', 'build', [LONG]),
    ]
    expect(longWorks(noisy, isLong)[0]!.sessions.map((s) => s.session)).toEqual([175, 176])
  })

  it('orders the sessions by the night they ran, whatever order the file lists them in', () => {
    expect(longWorks([...growing].reverse(), isLong)[0]!.sessions.map((s) => s.session)).toEqual([175, 176])
  })
})

describe('what makes a work a long work', () => {
  it('is its score, standing beside it in the mirror', () => {
    const root = fs.mkdtempSync(path.join(os.tmpdir(), 'long-work-'))
    try {
      fs.mkdirSync(path.join(root, STUDIO_STAGE_DIR, LONG), { recursive: true })
      fs.writeFileSync(path.join(root, STUDIO_STAGE_DIR, LONG, 'SCORE.md'), '# FILED UNDER — score\n')
      fs.mkdirSync(path.join(root, STUDIO_STAGE_DIR, ONE_NIGHT), { recursive: true })
      fs.writeFileSync(path.join(root, STUDIO_STAGE_DIR, ONE_NIGHT, 'index.html'), '<title>THE UNSENT</title>')
      expect(hasScore(LONG, root)).toBe(true)
      expect(hasScore(ONE_NIGHT, root)).toBe(false)
      expect(hasScore('2026-10-17-not-there', root)).toBe(false)
    } finally {
      fs.rmSync(root, { recursive: true, force: true })
    }
  })
})
