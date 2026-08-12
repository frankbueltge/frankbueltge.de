// The sitting dossier, checked twice — once against fixtures for each rule, and once against the
// REAL mirrored minutes, because /plenum's whole claim is "this is what the record says right
// now" and a fixture can only prove the parser runs.
//
// The checks against the real mirror were once a frozen census — "15 sittings across 9 day files,
// 2026-08-02", the protagonist named by date, the agenda split pinned at 9 and 6. The intent was a
// tripwire somebody should look at when it fires. The wiring was wrong: the plenum sitting again is
// the most ordinary thing it can do, and it fired the trap on every integrate lane at once, holding
// the Atelier's and the Studio's work out of the site along with its own (2026-08-07, Session 15).
//
// So the tripwire stays and the census goes. Every count below is now read off the mirror or off
// the model itself, and what is asserted is the RELATION that would be a real defect if it broke:
// the dossier disagreeing with a plain line scan of the same files, a protagonist that is not the
// newest sitting, a tally that does not add up to the record it counts, a goods-inward inspection
// that names nobody. Those fire when something is wrong — not when the plenum meets.
import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import {
  buildSittings,
  collidingSessions,
  currentSitting,
  headingDate,
  headingSession,
  headingSubject,
  readTable,
  tally,
  type PlenumEntry,
} from './dossier'
import { buildDayIndex } from '@/lib/engines/journal'

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))
const JOURNAL = `${ROOT}src/content/plenum/journal`

/** The real mirror, handed over the way `getCollection('plenum')` hands it to the page. */
function realEntries(): PlenumEntry[] {
  return readdirSync(JOURNAL)
    .filter((f) => f.endsWith('.md'))
    .map((f) => ({ id: `journal/${f}`, body: readFileSync(`${JOURNAL}/${f}`, 'utf8') }))
}

// ——— the heading ————————————————————————————————————————————————————————————

describe('the heading', () => {
  it('reads the date the heading names', () => {
    expect(headingDate('Plenum minutes — 2026-07-22 (Session 14): concept session')).toBe('2026-07-22')
  })

  it('reads the session number the heading names', () => {
    expect(headingSession('Plenum minutes — 2026-07-22 (Session 14): x')).toBe(14)
    expect(headingSession('Plenum minutes — 2026-07-03 (Session 2, same day)')).toBe(2)
  })

  it('names no session where the record names none', () => {
    expect(headingSession('Plenum protocol change — 2026-07-05 (post-S6): the Field Standard anchored')).toBeNull()
  })

  it('takes the subject verbatim, and reports none where the heading is bare', () => {
    expect(headingSubject('Plenum minutes — 2026-07-04 (Session 4)')).toBeNull()
    expect(headingSubject('Plenum minutes — 2026-07-22 (Session 14): concept session — matured')).toBe(
      'concept session — matured',
    )
  })
})

// ——— the table ——————————————————————————————————————————————————————————————

describe('the opening italic block', () => {
  it('takes the whole block, without its delimiting asterisks', () => {
    expect(readTable('\n*Chair: CHEF. Honest minutes.*\n\n## Agenda\n')).toBe('Chair: CHEF. Honest minutes.')
  })

  // The regression this rule exists for: a bold run that closes a line used to end the match
  // early, cutting session 4's cast list from 102 words to 76 and dropping its gate.
  it('is not cut short by a bold run that ends a line', () => {
    const text = '\n*Chair: CHEF. At the table: **Rook**\nand **Bite**. Gate: Verifier.*\n\n## Agenda\n'
    expect(readTable(text)).toBe('Chair: CHEF. At the table: **Rook**\nand **Bite**. Gate: Verifier.')
  })

  it('returns null where an entry opens with something else', () => {
    expect(readTable('\nPlain prose, no italic opening.\n')).toBeNull()
  })
})

// ——— the rules, on fixtures ————————————————————————————————————————————————

const FIXTURE: PlenumEntry[] = [
  {
    id: 'journal/2026-01-01.md',
    body: [
      '# Plenum minutes — 2026-01-01 (Session 1)',
      '',
      '*Chair: CHEF. At the table: Rook.*',
      '',
      '## Agenda',
      '',
      'One concept only.',
      '',
      '## The gate',
      '',
      'Verifier: PASS.',
      '',
      '## Landed',
      '',
      'Two Appetizers queued.',
      '',
    ].join('\n'),
  },
  {
    id: 'journal/2026-01-02.md',
    body: [
      '# Plenum minutes — 2026-01-02 (Session 1)',
      '',
      '*Chair: CHEF. No hosts convened.*',
      '',
      '## Wareneingang (standing item)',
      '',
      'Read Meridian’s WORKBOARD.md.',
      '',
      '## Next step',
      '',
      'Read feedback first.',
      '',
    ].join('\n'),
  },
]

describe('buildSittings, on fixtures', () => {
  const sittings = buildSittings(FIXTURE)

  it('returns the sittings newest first', () => {
    expect(sittings.map((s) => s.date)).toEqual(['2026-01-02', '2026-01-01'])
  })

  it('marks the newest sitting as the protagonist, and only it', () => {
    expect(sittings.filter((s) => s.current).map((s) => s.date)).toEqual(['2026-01-02'])
    expect(currentSitting(sittings)?.date).toBe('2026-01-02')
  })

  it('quotes the agenda under the record’s own heading, and reports the gap where there is none', () => {
    expect(sittings[1].agenda?.text).toBe('One concept only.')
    expect(sittings[1].agenda?.label).toBe('Agenda')
    expect(sittings[1].agenda?.source).toBe('src/content/plenum/journal/2026-01-01.md')
    expect(sittings[0].agenda).toBeNull()
  })

  it('takes the outcome sections and leaves the gate in the contents', () => {
    expect(sittings[1].decisions.map((d) => d.label)).toEqual(['Landed'])
    expect(sittings[1].contents.map((c) => c.heading)).toEqual(['Agenda', 'The gate', 'Landed'])
  })

  it('reads the goods-inward item under the record’s own heading', () => {
    expect(sittings[0].goodsInward?.label).toBe('Wareneingang (standing item)')
    expect(sittings[0].goodsInward?.text).toBe('Read Meridian’s WORKBOARD.md.')
    expect(sittings[1].goodsInward).toBeNull()
  })

  it('reports the ecology names a sitting’s text carries, and nothing else', () => {
    expect(sittings[0].ecologyNames).toEqual(['Meridian / the Field'])
    expect(sittings[1].ecologyNames).toEqual([])
  })

  it('marks a session number two sittings claim', () => {
    expect(sittings.every((s) => s.sessionShared)).toBe(true)
    expect(collidingSessions(sittings)).toEqual([1])
  })

  it('sends every sitting to its own place in the complete record', () => {
    expect(new Set(sittings.map((s) => s.href)).size).toBe(2)
    for (const s of sittings) expect(s.href).toBe(`/plenum/record#${s.anchor}`)
  })
})

// ——— the real mirror ————————————————————————————————————————————————————————

describe('the real mirrored minutes', () => {
  const sittings = buildSittings(realEntries())

  // A second, dumber reading of the same files: one entry per level-1 heading. If the dossier and
  // a plain line scan ever disagree, one of them is misreading the record and the page is lying.
  const h1 = () =>
    realEntries().flatMap((e) => (e.body ?? '').split('\n').filter((l) => /^#\s/.test(l)))

  it('carries every sitting the mirror holds — counted off the mirror, never typed', () => {
    expect(sittings.length).toBe(h1().length)
    expect(sittings.length).toBeGreaterThan(0)
    // the notes are the level-1 headings that are not minutes (a protocol change, so far)
    expect(sittings.filter((s) => s.kind === 'note').length).toBe(
      h1().filter((l) => !/^#\s+Plenum minutes\b/.test(l)).length,
    )
  })

  it('opens on the newest sitting — derived, never typed', () => {
    const current = currentSitting(sittings)
    expect(sittings[0]).toBe(current)
    expect(current?.current).toBe(true)
    // newest by the record's own dates, whatever they have grown to
    const newest = [...sittings.map((s) => s.date)].sort().at(-1)
    expect(current?.date).toBe(newest)
    expect(sittings.filter((s) => s.current)).toHaveLength(1)
  })

  it('reads every sitting’s cast list — none opens without one', () => {
    expect(sittings.filter((s) => s.table === null)).toEqual([])
  })

  it('never invents a date: every sitting’s date comes from its own heading', () => {
    expect(sittings.filter((s) => !s.dateFromHeading)).toEqual([])
  })

  // The session dated 2026-07-06 lives inside the 2026-07-05 day file. Chronology follows the
  // record's own numbering, not the filename, and this is the case that proves it.
  it('is in the record’s own chronological order', () => {
    const ascending = sittings
      .filter((s) => s.sessionNumber !== null)
      .map((s) => s.sessionNumber!)
      .reverse()
    // Non-decreasing, never smoothed: the record's own numbering repeats where two sittings share
    // a session and skips where it skips, and both stand as written.
    expect(ascending).toEqual([...ascending].sort((a, b) => a - b))
    expect(ascending.length).toBeGreaterThan(0)
    // …and the case that proves order follows the record and not the filename, anchored to the
    // committed pair itself: the sitting dated 2026-07-06 lives in the 2026-07-05 day file.
    expect(sittings.find((s) => s.date === '2026-07-06')?.source).toContain('2026-07-05')
  })

  it('states the record’s own numbering collisions rather than smoothing them', () => {
    const nums = sittings.filter((s) => s.sessionNumber !== null).map((s) => s.sessionNumber!)
    const repeated = [...new Set(nums.filter((n, i) => nums.indexOf(n) !== i))].sort((a, b) => a - b)
    expect(collidingSessions(sittings)).toEqual(repeated)
    expect(repeated.length).toBeGreaterThan(0) // the record really does collide; keep proving it
  })

  it('quotes an agenda where the sitting wrote one, and reports the gap where it did not', () => {
    const written = sittings.filter((s) => s.agenda !== null)
    const gaps = sittings.filter((s) => s.agenda === null)
    // exhaustive partition: no sitting falls between "quoted" and "reported as missing"
    expect(written.length + gaps.length).toBe(sittings.length)
    expect(written.length).toBeGreaterThan(0)
    expect(gaps.length).toBeGreaterThan(0) // the gap is real, and shown rather than papered over
    for (const s of written) expect(s.agenda?.text.length).toBeGreaterThan(0)
  })

  it('quotes what the settling sittings settled, under their own headings', () => {
    const settled = sittings.filter((s) => s.decisions.length > 0)
    expect(settled.length).toBeGreaterThan(0)
    expect(settled.length).toBeLessThanOrEqual(sittings.length)
    // a decision without its own heading is the defect — an unlabelled quote asserts on its own
    for (const s of settled) for (const d of s.decisions) expect(d.label.length).toBeGreaterThan(0)
  })

  it('finds contact with this ecology only where the record records it', () => {
    const withGoods = sittings.filter((s) => s.goodsInward !== null)
    expect(withGoods.length).toBeGreaterThan(0)
    // The defect this guards is an inspection that names nobody — not the arrival of a new one.
    for (const s of withGoods) expect(s.ecologyNames.length).toBeGreaterThan(0)
    // and no name appears where the record does not carry the sitting's text for it
    for (const s of sittings.filter((x) => x.ecologyNames.length > 0)) {
      expect(s.words).toBeGreaterThan(0)
    }
  })

  it('counts the record honestly', () => {
    const t = tally(sittings)
    // the tally is checked against the record it counts, not against a number typed here
    expect(t.sittings + t.notes).toBe(sittings.length)
    expect(t.notes).toBe(sittings.filter((s) => s.kind === 'note').length)
    expect(t.goodsInward).toBe(sittings.filter((s) => s.goodsInward !== null).length)
    expect(t.words).toBeGreaterThan(20000)
  })

  // THE LOCK. The dossier links every sitting into the complete record by anchor. Those anchors
  // are assigned by buildDayIndex, whose walk order is load-bearing (the first claimant of a
  // drifting session number keeps the clean id). If the two walks ever disagree, every deep link
  // on /plenum would point at a different sitting than the one it names — silently.
  it('assigns the same anchors, in the same order, as the complete record', () => {
    const index = buildDayIndex(realEntries(), { repo: 'https://example.invalid', docs: new Set() })
    expect([...sittings].reverse().map((s) => s.anchor)).toEqual(index.sessionsAsc.map((s) => s.anchor))
  })

  it('gives every sitting a unique deep-link id', () => {
    expect(new Set(sittings.map((s) => s.id)).size).toBe(sittings.length)
  })
})
