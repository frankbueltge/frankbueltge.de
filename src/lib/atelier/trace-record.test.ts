import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync, existsSync } from 'node:fs'
import { rotatedPart, partsFor, wholeTrace, declaresRotation } from './trace-record'
import { parseTrace } from './refrain'

const PROJECTS = 'src/content/atelier/projects'
const ROTATED = 'src/content/atelier/archive/trace'

describe('rotatedPart — a part of a trace, and nothing else', () => {
  it('reads the line id and the part number off the filename', () => {
    expect(rotatedPart('2026-07-23-negative-parallax-1.md')).toEqual({
      id: '2026-07-23-negative-parallax', part: 1,
    })
    expect(rotatedPart('/any/where/2026-07-24-put-back-on-the-map-12.md')).toEqual({
      id: '2026-07-24-put-back-on-the-map', part: 12,
    })
  })

  it('refuses a rotated SCORE — it ends in digits too, and folding it in would invent ticks', () => {
    expect(rotatedPart('2026-07-23-negative-parallax-score-2026-08-11.md')).toBeNull()
  })

  it('refuses anything that is not a numbered part', () => {
    expect(rotatedPart('README.md')).toBeNull()
    expect(rotatedPart('2026-07-23-negative-parallax.md')).toBeNull()
  })
})

describe('wholeTrace — record order, nothing rewritten', () => {
  const parts = {
    [`${ROTATED}/l-2.md`]: '## Tick 3 — 2026-08-02 — third\n',
    [`${ROTATED}/l-1.md`]: '## Tick 1 — 2026-08-01 — first\n\n## Tick 2 — 2026-08-01 — second\n',
    [`${ROTATED}/other-1.md`]: '## Tick 9 — 2026-08-09 — another line entirely\n',
    [`${ROTATED}/l-score-2026-08-11.md`]: '## Tick 99 — 2026-08-11 — a score, not a trace\n',
  }

  it('puts the parts in part order and the live file last', () => {
    const events = parseTrace(wholeTrace('l', '## Tick 4 — 2026-08-03 — live\n', parts))
    expect(events.map((e) => e.n)).toEqual([1, 2, 3, 4])
  })

  it('takes only this line’s parts, and never a rotated score', () => {
    expect(partsFor('l', parts)).toHaveLength(2)
    expect(wholeTrace('l', 'live', parts)).not.toContain('another line entirely')
    expect(wholeTrace('l', 'live', parts)).not.toContain('a score, not a trace')
  })

  it('is the live file unchanged when nothing was rotated', () => {
    expect(wholeTrace('unrotated', 'live only', parts)).toBe('live only')
  })
})

describe('declaresRotation — the pointer, not the word', () => {
  it('finds the part the live file names', () => {
    expect(declaresRotation('*Rotated under §8: ticks 1–56 into `archive/trace/l-1.md`.*')).toBe(true)
  })

  it('finds it when markdown has wrapped the note mid-sentence', () => {
    expect(declaresRotation('*Rotated twice under §8’s floor: ticks 1–56 into\n`archive/trace/l-1.md`.*')).toBe(true)
  })

  it('says no when the live file is whole', () => {
    expect(declaresRotation('*Append-only, one entry per decision.*')).toBe(false)
  })

  it('is not fooled by a line whose SUBJECT is rotation', () => {
    // Three of these lines research the SI second. Keying on the word declared them rotated.
    expect(declaresRotation('T-014: observations on the rotation rate of the Earth, §8 of the CCTF note')).toBe(false)
  })
})

// ——— the real records ————————————————————————————————————————————————————————————————
// The mirror's own integrity, asserted against the committed files rather than a fixture: a
// line that says it rotated must have its parts here. Before 2026-08-12 it could not — the
// engine's `archive/` was a protected path, the rotations sat in unmerged pull requests, and
// this repository mirrored `projects/` only. That is fixed at the source (the gate opens the
// path) and here (atelier-integrate.yml rsyncs `archive/trace/`), so the state that forced the
// refrain's floor to be weakened is now a FAILURE rather than a documented gap.
describe('the mirrored record — a rotated line arrives whole or the mirror is broken', () => {
  const lines = existsSync(PROJECTS)
    ? readdirSync(PROJECTS, { withFileTypes: true })
        .filter((d) => d.isDirectory() && !d.name.startsWith('_'))
        .map((d) => d.name)
        .filter((id) => existsSync(`${PROJECTS}/${id}/TRACE.md`))
    : []

  const rotated: Record<string, string> = existsSync(ROTATED)
    ? Object.fromEntries(
        readdirSync(ROTATED)
          .filter((f) => f.endsWith('.md'))
          .map((f) => [`${ROTATED}/${f}`, readFileSync(`${ROTATED}/${f}`, 'utf8')]),
      )
    : {}

  it.each(lines)('%s: if the live file declares a rotation, the rotated halves are here', (id) => {
    const live = readFileSync(`${PROJECTS}/${id}/TRACE.md`, 'utf8')
    if (!declaresRotation(live)) return
    expect(
      partsFor(id, rotated).length,
      `${id} says it rotated under §8 and no part of it reached the mirror — the site is ` +
        `counting a fragment as a whole record (check the archive/trace rsync in atelier-integrate.yml)`,
    ).toBeGreaterThan(0)
  })

  it('the composed record carries the live file whole and is longer than it', () => {
    const rotatedLines = lines.filter((id) =>
      declaresRotation(readFileSync(`${PROJECTS}/${id}/TRACE.md`, 'utf8')),
    )
    if (rotatedLines.length === 0) return // no rotation in the mirror yet: nothing to assert
    for (const id of rotatedLines) {
      const live = readFileSync(`${PROJECTS}/${id}/TRACE.md`, 'utf8')
      const whole = wholeTrace(id, live, rotated)
      // Bytes, not ticks: one rotated line here is an encounter line whose record is written in
      // sections rather than numbered moves and honestly parses to nothing. The claim being
      // made is that the rotated half ARRIVED, which holds whatever form the record is in.
      expect(whole.length, id).toBeGreaterThan(live.length)
      expect(whole.endsWith(live), `${id}: the live half must close the composed record`).toBe(true)
    }
  })

  it('the running work-line reads its whole passage, not the fragment left after a rotation', () => {
    const id = '2026-07-23-negative-parallax'
    if (!lines.includes(id)) return
    const live = readFileSync(`${PROJECTS}/${id}/TRACE.md`, 'utf8')
    const liveTicks = parseTrace(live).length
    const wholeTicks = parseTrace(wholeTrace(id, live, rotated)).length
    // The concrete failure this whole module exists for: on the night of 11./12.08. this line
    // rotated 57 of its 62 ticks out of the live file, and every count the site derived from it
    // fell with them — while the line was working hardest.
    expect(wholeTicks).toBeGreaterThan(liveTicks * 5)
  })
})
