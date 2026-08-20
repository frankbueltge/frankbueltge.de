import { describe, expect, it } from 'vitest'
import { cascadeBuckets, readTiles } from './tiles'
import { NAMING } from '@/config/naming'
import type { ProtokollDay } from '@/lib/protokoll/types'

import consensusLatest from '@/data/consensus/latest.json'
import police from '@/data/praemie/police.json'
import redactionLatest from '@/data/redaction/latest.json'
import ghostFleetLatest from '@/data/ghost-fleet/latest.json'
import roundNumberLatest from '@/data/round-number/latest.json'
import patternLatest from '@/data/pattern/latest.json'
import atlasWorks from '@/data/atlas/werke.json'

const tiles = readTiles()

// Whether each guarded piece's committed record can answer today. Each entry mirrors that
// piece's own `return null` condition in tiles.ts — deliberately, so the guard below can tell
// the two absences apart: a derivation that broke while its record still carries a reading
// (a defect) from a piece that steps back because its record is honestly empty (rule 2 of
// tiles.ts, "a tile with no reading is not rendered"). Keep an entry in step with its
// derivation when that condition moves.
//
// Cast rather than read off the import: these snapshots are rewritten nightly, so their
// inferred literal types shift with the day's data — `pick: null` and `redactions: []` infer
// as `null` and `never[]` on an empty night and as string and object[] on a full one. The
// shapes here are the stable contract the guard needs.
const ANSWERS_TODAY: Record<string, () => boolean> = {
  consensus: () =>
    (consensusLatest as unknown as { headline?: { domain_count?: number } }).headline
      ?.domain_count !== undefined,
  policy: () =>
    (police as unknown as { premium?: { change_pct_since_base?: number; base_year?: number } })
      .premium?.change_pct_since_base !== undefined,
  redaction: () => {
    const d = redactionLatest as unknown as { pick?: string | null; redactions?: { id: string }[] }
    return Boolean(d.pick) && (d.redactions ?? []).some((r) => r.id === d.pick)
  },
  ghostFleet: () => ((ghostFleetLatest as unknown as { events?: unknown[] }).events ?? []).length > 0,
  // The control series (ids prefixed with "_") are references, not defendants; the tile counts
  // the real official series, so those are what decides whether the piece can speak.
  roundNumbers: () =>
    ((roundNumberLatest as unknown as { series?: { id: string }[] }).series ?? []).some(
      (s) => !s.id.startsWith('_'),
    ),
  patterns: () =>
    (patternLatest as unknown as { headline?: { r?: number } }).headline?.r !== undefined,
  atlas: () => (atlasWorks as unknown as unknown[]).length > 0,
}

describe('the live dashboard reads the archive', () => {
  it('renders a tile for every experiment whose record answers today', () => {
    // Asks the snapshots, not a hard-coded list of ids. A piece whose record carries a reading
    // must be on the board; a piece whose record is empty must NOT be — absent, never blank.
    //
    // Written after 2026-08-15, the first zero the redaction watch ever recorded: no change on
    // any of its 32 watched pages, three of them unverifiable and recorded as such. redaction()
    // returned null, exactly as tiles.ts requires, and this guard — which demanded a tile for a
    // fixed list of ids — failed the run instead: the deploy and both engine integrates red, the
    // site frozen on its 06:00 build. A day with nothing to report is a reading, not a fault.
    const ids = tiles.map((t) => t.id)
    for (const [id, answers] of Object.entries(ANSWERS_TODAY)) {
      if (answers()) {
        expect(ids, `${id}'s record carries a reading and must have a tile`).toContain(id)
      } else {
        expect(ids, `${id}'s record is empty today and must not be rendered blank`).not.toContain(id)
      }
    }
    // The floor is derived, not typed. Pinning a count made this test a chore that pretended to
    // be a guard, and it is the count that took the house down on the first honest empty night.
    const answering = Object.values(ANSWERS_TODAY).filter((answers) => answers()).length
    expect(tiles.length, 'the room must not be empty').toBeGreaterThan(0)
    expect(tiles.length).toBeGreaterThanOrEqual(answering)
  })

  it('never renders an empty or placeholder reading', () => {
    for (const tile of tiles) {
      expect(tile.big.trim().length, tile.id).toBeGreaterThan(0)
      expect(tile.big, tile.id).toMatch(/[\d]/) // a reading is a number, always
      expect(tile.sub.trim().length, tile.id).toBeGreaterThan(20)
      expect(tile.stamp.trim().length, tile.id).toBeGreaterThan(0)
      expect(tile.href, tile.id).toMatch(/^\//)
      // The mock's placeholder values, in case one is ever pasted in from the handoff by mistake.
      expect(['87 clocks', '+214', '12 items', '38 outlets', '2 silent', '−412 words', '23 dark', '31 in view', '203 works'])
        .not.toContain(tile.big)
    }
  })

  it('draws every mark from a series that exists — no decorative shapes', () => {
    for (const tile of tiles) {
      if (tile.viz.kind === 'line' || tile.viz.kind === 'bars') {
        expect(tile.viz.values.length, `${tile.id} has an empty series`).toBeGreaterThan(0)
        expect(tile.viz.values.every((v) => Number.isFinite(v)), tile.id).toBe(true)
      }
      if (tile.viz.kind === 'cells') expect(tile.viz.count, tile.id).toBeGreaterThan(0)
      if (tile.viz.kind === 'ratio') expect(tile.viz.whole, tile.id).toBeGreaterThan(0)
    }
  })

  it('omits The Protocol when no day file is handed in — absent, never blank', () => {
    const ids = readTiles({}).map((t) => t.id)
    expect(ids).not.toContain('protocol')
  })

  it('counts the day’s unreachable sources rather than glossing over them', () => {
    const day = {
      date: '2026-08-10',
      generated_at: '',
      schema_version: '3',
      pipeline_version: '0.1.0',
      index: null,
      entries: [
        { status: 'ok' },
        { status: 'unavailable' },
        { status: 'ok' },
      ],
    } as unknown as ProtokollDay
    const tile = readTiles({ protokoll: day }).find((t) => t.id === 'protocol')!
    expect(tile.big).toBe('3 items')
    expect(tile.sub).toContain('Feststellung entfällt')
    // The dim cell is the source that did not answer, at its own position in the day.
    expect(tile.viz).toEqual({ kind: 'cells', count: 3, marked: [1] })
  })
})

describe('the cascade is binned against a measured span, not a counted one', () => {
  // Written after 2026-08-13, when a snapshot arrived with span_hours: 10.2 and took the whole
  // house down with it — deploy, three integrates, the site frozen six hours on its last good
  // build. The bin count had been `new Array(span)`, which is a RangeError for any span that is
  // not a whole number, and the archive's spans are measurements: 4.2, 1.8, 23.5, 9.2. The line
  // had survived two days only because 11.0 and 21.0 happened to land on whole hours.
  const at = (h: number) => ({ at: new Date(Date.UTC(2026, 7, 13, h)).toISOString() })

  it('accepts a fractional span, which is the ordinary case in the archive', () => {
    for (const span of [10.2, 4.2, 1.8, 23.5, 9.2]) {
      expect(() => cascadeBuckets(span, []), `span_hours ${span}`).not.toThrow()
    }
  })

  it('gives the partly-elapsed last hour a bin of its own rather than folding it backwards', () => {
    // 10.2 hours is eleven hours touched, not ten: the eleventh is real but barely begun.
    expect(cascadeBuckets(10.2, []).length).toBe(11)
    expect(cascadeBuckets(10.0, []).length).toBe(10)
  })

  it('keeps the final cascade step in its own hour, where the record put it', () => {
    // The step at the end of the span is the one flooring would have mis-filed, every time.
    const buckets = cascadeBuckets(2.5, [at(0), at(1), at(2)])
    expect(buckets).toEqual([1, 1, 1])
  })

  it('survives a snapshot whose span is missing, zero, negative or unreadable', () => {
    for (const span of [0, -5, NaN, Number.POSITIVE_INFINITY]) {
      const buckets = cascadeBuckets(span, [])
      expect(Number.isInteger(buckets.length), `span_hours ${span}`).toBe(true)
      expect(buckets.length, `span_hours ${span}`).toBeGreaterThanOrEqual(1)
      expect(buckets.length, `span_hours ${span}`).toBeLessThanOrEqual(24)
    }
  })

  it('never draws more than a day of bins, however long the snapshot claims', () => {
    expect(cascadeBuckets(400, []).length).toBe(24)
  })
})

describe('the copy dictionary carries no readings', () => {
  /** Constants of the method, not measurements — the only digits allowed to be written down. The
   *  bin width is a property of how the pulse is built, fixed in scripts/fetch-pulse.ts; it cannot
   *  go stale the way a reading can. Anything else with a digit in it belongs in a derivation. */
  const ALLOWED = new Set(['2-HOUR BINS · TAPERED'])

  function walk(value: unknown, path: string, found: string[]): void {
    if (typeof value === 'string') {
      if (/\d/.test(value) && !ALLOWED.has(value)) found.push(`${path}: ${value}`)
      return
    }
    if (Array.isArray(value)) return value.forEach((v, i) => walk(v, `${path}[${i}]`, found))
    if (value && typeof value === 'object') {
      for (const [k, v] of Object.entries(value)) walk(v, `${path}.${k}`, found)
    }
  }

  it('has no digit typed into any static string of NAMING.opsRoom', () => {
    // The site's canon: numbers are rendered from data, never typed into wording. A sentence that
    // needs a number is a FUNCTION here (skipped by this walk, because a function has no literal
    // to go stale) and gets the number from the same derivation that prints it in the big line.
    const found: string[] = []
    walk(NAMING.opsRoom, 'opsRoom', found)
    expect(found).toEqual([])
  })
})
