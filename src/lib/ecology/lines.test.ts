// A line is an attribution: it says which strand of a practice made a thing. Get the rule wrong
// and thirty works change hands silently, which is worse than showing nothing — so the rule is
// asserted against the real register as well as against fixtures.
import { describe, expect, it } from 'vitest'
import { ATELIER_LINES, NIGHTLY_ERA_END, countByLine, lineOfWork, lineLabel, lineShortLabel } from './lines'
import { NIGHTLY_FORK_DIR, allWorks } from '@/lib/engines/register'
import type { LatestWork } from '@/lib/engines/latest'

const work = (over: Partial<LatestWork>): LatestWork => ({
  ns: 'atelier', kind: 'html', slug: 's', title: 'T', date: '2026-08-01',
  href: '/x', state: 'live', ...over,
} as LatestWork)

describe('lineOfWork — the directory first, the date second', () => {
  it('reads a fork work as the nightly line whatever its date says', () => {
    // The fork's works are the nightly line's by the repository they came from. A date rule alone
    // would call every one of them a work-line work, because they are all after the era's end.
    expect(lineOfWork(work({ dir: NIGHTLY_FORK_DIR, date: '2026-08-11' }))).toBe('nightly')
  })

  it('reads the first era by its date', () => {
    expect(lineOfWork(work({ date: NIGHTLY_ERA_END }))).toBe('nightly')
    expect(lineOfWork(work({ date: '2026-06-29' }))).toBe('nightly')
  })

  it('reads everything after the era, in the practice’s own mirror, as the work-line', () => {
    expect(lineOfWork(work({ date: '2026-07-24' }))).toBe('work-line')
  })

  it('says nothing about a practice that runs one line', () => {
    // The marker exists to separate two strands. On the Field and the Studio it would be decoration
    // asserting a distinction their record does not make.
    expect(lineOfWork(work({ ns: 'field', date: '2026-08-01' }))).toBeNull()
    expect(lineOfWork(work({ ns: 'studio', date: '2026-06-01' }))).toBeNull()
  })
})

describe('the wording is the canon’s', () => {
  it('names the lines and never a protocol number', () => {
    // "Protocol vN" is a constitution's number, not a line's name — the numbers move, and a name
    // hung on a moving number is wrong at the next amendment (wording-kanon, 2026-08-12).
    for (const l of ATELIER_LINES) {
      expect(l.label).not.toMatch(/v\d/)
      expect(l.gloss.length).toBeGreaterThan(20)
    }
    expect(ATELIER_LINES.map((l) => l.label)).toEqual(['the nightly line', 'the work-line'])
  })

  it('drops the article for a chip, keeps it for a sentence', () => {
    expect(lineLabel('work-line')).toBe('the work-line')
    expect(lineShortLabel('work-line')).toBe('work-line')
  })
})

describe('the real register — both lines are populated and neither swallows the other', () => {
  const works = allWorks()
  const counts = countByLine(works)

  it('counts every Atelier work into exactly one line', () => {
    const atelier = works.filter((w) => w.ns === 'atelier')
    expect(atelier.length).toBeGreaterThan(0)
    expect(counts.nightly + counts['work-line']).toBe(atelier.length)
  })

  it('has works in both lines — the whole point of showing the distinction', () => {
    expect(counts.nightly).toBeGreaterThan(0)
    expect(counts['work-line']).toBeGreaterThan(0)
  })

  it('puts every mirrored fork work in the nightly line', () => {
    const forked = works.filter((w) => w.dir === NIGHTLY_FORK_DIR)
    expect(forked.length, 'the fork mirror is empty — nothing to attribute').toBeGreaterThan(0)
    for (const w of forked) expect(lineOfWork(w), w.slug).toBe('nightly')
  })

  it('leaves no work of another practice carrying a line', () => {
    for (const w of works.filter((w) => w.ns !== 'atelier')) expect(lineOfWork(w), w.slug).toBeNull()
  })
})
