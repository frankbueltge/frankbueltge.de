// The pyramid's derivations, checked at the points where a mistake would be invisible on the page.
//
// Everything on these four levels is derived, so a wrong derivation does not crash — it renders a
// plausible number. That is the failure mode these tests exist for: each one below pins a place
// where the surface would have looked completely fine while saying something untrue.
//
// Dated note (2026-09-01): the station sheets left the routes — /field, /atelier and /studio
// render the v3 practice station template now (src/components/ecology/PracticeStation.astro),
// and StationSheet.astro is retired in the repo, unlinked. The libraries below stay: DOORS,
// windowDoor and splitDoorLine are load-bearing for the new template, and buildStationSheet
// with the rest remains the archived surface's derivation, still held to its own truth.

import { describe, expect, it } from 'vitest'
import { daysUntil, readingDate, STATIONS, PRACTICE_STATIONS, MAP_NODES } from './model'
import { firstClause, recordLine, newestCrossing, runningInquiry } from './landings'
import { seamsFrom, worksPerWeek, weekOffset, buildTimeline, timelineGeometry } from './timeline'
import { classifyVerdict, buildGauntlet, buildCrossings, LANES } from './figures'
import { readConstitution, splitDoorLine, buildStationSheet, windowDoor } from './station'
import { readN1Facts } from '@/lib/ecology/n1-line'
import { PYRAMID } from '@/config/ecology-pyramid-wording'
import { ATELIER_LINES } from '@/lib/ecology/lines'
import pulse from '@/data/pulse/pulse.json'
import type { PulseSnapshot } from '@/lib/pulse/render'
import type { LatestWork } from '@/lib/engines/latest'

const work = (date: string, ns: LatestWork['ns'] = 'atelier'): LatestWork => ({
  ns, kind: 'html', slug: date, title: date, date, href: `/${ns}/${date}`, state: 'published',
})

describe('the stations', () => {
  it('takes every name and address from the doors, never from itself', () => {
    // The point of the pyramid is that four surfaces agree. They agree because they all read
    // NAMING.doors — if a station ever grew a name of its own, this is where it would show.
    for (const station of STATIONS) {
      expect(station.name.length).toBeGreaterThan(0)
      expect(station.href.startsWith('/')).toBe(true)
    }
    expect(STATIONS.map((s) => s.id)).toEqual(['atelier', 'field', 'studio', 'middle'])
  })

  it('counts three practices, and does not count the Middle as one', () => {
    expect(PRACTICE_STATIONS.map((s) => s.id)).toEqual(['atelier', 'field', 'studio'])
  })

  it('draws no node on top of another', () => {
    const seen = new Set(Object.values(MAP_NODES).map((n) => `${n.x}:${n.y}`))
    expect(seen.size).toBe(Object.keys(MAP_NODES).length)
  })
})

describe('the reading', () => {
  it('returns null since the reading was held — the v3 constitutions carry no reading section', () => {
    // Until 2026-08-30 every constitution carried "## The reading of 2026-09-05" and this
    // test read the date out of the files. The reading was held early on 2026-08-30
    // (docs/design/2026-08-30-research-ecology-v3.md); the v4/v7/v4 texts carry no reading
    // section, and the honest derivation is null, not a thrown build.
    expect(readingDate()).toBeNull()
  })


  it('fails loudly when the practices disagree about when they are read', () => {
    // The alternative — picking one silently — would put a date on the entrance that no
    // constitution actually carries.
    expect(() =>
      readingDate({
        '/src/content/a/PROTOCOL.md': '## The reading of 2026-09-05 (floor)',
        '/src/content/b/PROTOCOL.md': '## The reading of 2026-10-01 (floor)',
      }),
    ).toThrow(/disagree/)
  })

  it('returns null when no constitution carries a reading — absence is a state, not a failure', () => {
    expect(readingDate({ '/src/content/a/PROTOCOL.md': '# Research Protocol v6' })).toBeNull()
  })

  it('does not ask the Plenum, whose own protocol says the reading does not cover it', () => {
    expect(
      readingDate({
        '/src/content/field/PROTOCOL.md': '## The reading of 2026-09-05 (floor)',
        '/src/content/plenum/PROTOCOL.md': '## The reading of 2030-01-01 (floor)',
      }),
    ).toBe('2026-09-05')
  })

  it('counts whole days, and floors at zero once the day has come', () => {
    expect(daysUntil('2026-09-05', new Date('2026-09-01T23:00:00Z'))).toBe(4)
    expect(daysUntil('2026-09-05', new Date('2026-09-05T00:00:01Z'))).toBe(0)
    expect(daysUntil('2026-09-05', new Date('2026-10-01T00:00:00Z'))).toBe(0)
  })
})

describe('the record’s own words', () => {
  it('strips the markup a chronicle carries, and keeps the words', () => {
    expect(firstClause('**Cascade (a): the next operation.** Tick 56 read the class.')).toBe(
      'Cascade (a): the next operation.',
    )
    expect(firstClause('a [linked](https://x) `path/to.md` note')).toBe('a linked path/to.md note')
  })

  it('cuts at the record’s own joint, not mid-word', () => {
    const cut = firstClause('session landed — the ledger extended, one verdict revised')
    expect(cut).toBe('session landed')
  })

  it('yields to the summary when the move is a single word', () => {
    // The Studio's recent entries record the move as "build"; three rows of "build" say nothing.
    expect(recordLine('build', 'The house re-cut the opening and struck one position.')).toBe(
      'The house re-cut the opening and struck one position.',
    )
    expect(recordLine('auditing whether the kill criterion can tell the answers apart', 'x')).toMatch(/^auditing/)
  })

  it('returns null rather than an empty line when the record is silent', () => {
    expect(firstClause('')).toBeNull()
    expect(firstClause(null)).toBeNull()
  })
})

describe('the timeline', () => {
  it('anchors the axis on the founding night, so the founding seam can be drawn', () => {
    // The bug this pins: anchored on the first WORK instead, the axis began a day after the
    // founding text and dropped the seam that explains why there is a first work.
    const timeline = buildTimeline({
      works: [work('2026-06-29'), work('2026-07-20')],
      now: new Date('2026-08-12T00:00:00Z'),
      readingDate: '2026-09-05',
      origin: '2026-06-28',
    })
    expect(timeline.origin).toBe('2026-06-28')
    expect(timeline.seams.some((s) => s.label.startsWith('FOUNDED'))).toBe(true)
  })

  it('bins works by real week offsets, never by position in the list', () => {
    const bars = worksPerWeek([work('2026-06-28'), work('2026-06-30'), work('2026-07-12')], new Date('2026-07-13T00:00:00Z'), '2026-06-28')
    expect(bars[0].count).toBe(2)
    expect(bars[2].count).toBe(1)
    expect(bars[1].count).toBe(0)
  })

  it('places a seam on its own date, not on a bar index', () => {
    expect(weekOffset('2026-06-28', '2026-07-05')).toBe(1)
    expect(weekOffset('2026-06-28', '2026-07-01')).toBeCloseTo(3 / 7, 5)
  })

  it('names the unit of work only where the unit changed', () => {
    const seams = seamsFrom(
      [
        { version: 2, date: '2026-06-28', unit: 'the night' },
        { version: 3, date: '2026-07-16', unit: 'the night' },
        { version: 4, date: '2026-07-18', unit: 'the bounded project' },
      ],
      '2026-08-10',
    )
    expect(seams.map((s) => s.label)).toEqual([
      'FOUNDED 06-28',
      'V3 07-16',
      'V4 · BOUNDED PROJECT 07-18',
      'THE FORK 08-10',
    ])
  })

  it('staggers neighbouring seam labels onto different rows', () => {
    const seams = seamsFrom(
      [
        { version: 2, date: '2026-06-28', unit: 'the night' },
        { version: 3, date: '2026-06-29', unit: 'the night' },
        { version: 4, date: '2026-06-30', unit: 'the night' },
      ],
      '2026-07-01',
    )
    for (let i = 1; i < seams.length; i++) expect(seams[i].row).not.toBe(seams[i - 1].row)
  })

  it('keeps the reading inside the drawing, so the future is part of the picture', () => {
    const timeline = buildTimeline({
      works: [work('2026-06-29')],
      now: new Date('2026-08-12T00:00:00Z'),
      readingDate: '2026-09-05',
      origin: '2026-06-28',
    })
    const geo = timelineGeometry(timeline)
    expect(geo.readingX).toBeLessThanOrEqual(1060)
    expect(geo.todayX).toBeLessThan(geo.readingX)
  })

  it('draws nothing rather than a flat line when there are no works', () => {
    expect(worksPerWeek([], new Date('2026-08-12T00:00:00Z'), '2026-06-28')).toEqual([])
  })
})

describe('the figures', () => {
  it('classifies only an exact single-word verdict, and calls prose prose', () => {
    // The trap: a prefix match reads "gate resolved → narrowed/reshaped; not built, not killed"
    // as a verdict it is not. "stated" is the honest answer for a sentence.
    expect(classifyVerdict('graduated')).toBe('graduated')
    expect(classifyVerdict('  Deferred ')).toBe('deferred')
    expect(classifyVerdict('deferred — built as a draft, full gauntlet owed')).toBe('stated')
    expect(classifyVerdict('gate resolved → narrowed/reshaped; not built, not killed')).toBe('stated')
    expect(classifyVerdict('')).toBe('none')
    expect(classifyVerdict(undefined)).toBe('none')
  })

  it('scales the funnel against its own widest row and marks the last one', () => {
    const rows = buildGauntlet(100, 25, 20, ['a', 'b', 'c'])
    expect(rows[0].w).toBe(1)
    expect(rows[1].w).toBeCloseTo(0.25, 5)
    expect(rows.at(-1)!.terminal).toBe(true)
  })

  it('never gives the conductor a lane', () => {
    const crossings = buildCrossings([
      { encounter_id: 'enc-1', title: 't', participants: [{ id: 'meridian' }, { id: 'frank' }], status: { as_of: '2026-08-01' } },
    ])
    expect(crossings[0].lanes).toEqual(['meridian'])
    expect(LANES).not.toContain('frank')
  })

  it('orders a crossing’s lanes by the score, not by the register’s participant order', () => {
    const crossings = buildCrossings([
      { encounter_id: 'enc-1', title: 't', participants: [{ id: 'data-snack-plenum' }, { id: 'ulysses' }] },
    ])
    expect(crossings[0].lanes).toEqual(['ulysses', 'plenum'])
  })
})

describe('the Middle’s record', () => {
  it('never gives an undated crossing a date to be newest by', () => {
    const newest = newestCrossing([
      { encounter_id: 'enc-1', title: 'dated', status: { as_of: '2026-08-01' } },
      { encounter_id: 'enc-2', title: 'undated' },
    ])
    expect(newest?.line).toBe('dated')
  })

  it('treats a review as still in motion — a reading is not an ending', () => {
    expect(runningInquiry([{ inquiry_id: 'ji-1', title: 'T', status: 'REVIEW', updated_at: '2026-08-01' }])?.label).toBe('in review')
    expect(runningInquiry([{ inquiry_id: 'ji-1', title: 'T', status: 'CLOSED', updated_at: '2026-08-01' }])).toBeNull()
  })
})

describe('the station sheet', () => {
  it('reads each practice’s own spelling of its constitution', () => {
    const law = readConstitution('x', {
      '/src/content/x/PROTOCOL.md': '# Studio Protocol v2 — works of force\n\n*Decided and drafted by the architect (Frank Bültge), 2026-08-08 —*',
    })
    expect(law.version).toBe('v2')
    expect(law.adopted).toBe('2026-08-08')
    expect(law.name).toBe('works of force')
  })

  it('reads the research ecology v3 protocols’ "Decided by … at the reading of" phrasing', () => {
    const law = readConstitution('x', {
      '/src/content/x/PROTOCOL.md':
        '# Research Protocol v4 — one shared question, the science corner\n\n' +
        '*Research ecology v3. Decided by the architect (Frank Bültge) at the reading of\n' +
        '2026-08-30 — the reading planned for 2026-09-05, held early at his decision —*',
    })
    expect(law.version).toBe('v4')
    expect(law.adopted).toBe('2026-08-30')
  })

  it('fails loudly on a mirror with no version, rather than defaulting to one', () => {
    expect(() => readConstitution('x', { '/src/content/x/PROTOCOL.md': '# Some other heading' })).toThrow(/no "… Protocol vN" heading/)
    expect(() => readConstitution('missing', {})).toThrow(/mirror missing/)
  })

  it('splits a door line into its claim and its backing', () => {
    const split = splitDoorLine('A claim about the practice — and what backs it.')
    expect(split.lead).toBe('A claim about the practice')
    expect(split.rest).toBe('and what backs it.')
  })

  it('keeps a door line whole when it has no joint', () => {
    expect(splitDoorLine('One clause only.')).toEqual({ lead: 'One clause only.', rest: '' })
  })

  // ——— the two lines of the Atelier ————————————————————————————————————————————————————
  // A practice that runs two lines under two constitutions must say both, INSIDE its station.
  // One constitution row on a two-line practice names one law and leaves the other line
  // ungoverned on the page; a second station would break the pyramid's three (canon 2026-08-12).
  const sheetOf = (id: 'atelier' | 'field') =>
    buildStationSheet({ id, snapshot: pulse as PulseSnapshot, log: [], made: 1 })

  it('gives the Atelier a lines row and a plural constitutions row', () => {
    const rows = sheetOf('atelier').status
    const keys = rows.map((r) => r.key)
    expect(keys).toContain(PYRAMID.station.statusKeys.lines)
    expect(keys).toContain(PYRAMID.station.statusKeys.constitutions)
    expect(keys, 'the singular row would name one law and hide the other').not.toContain(
      PYRAMID.station.statusKeys.constitution,
    )
  })

  it('states each line in its own unit, read from its own record', () => {
    const value = sheetOf('atelier').status.find((r) => r.key === PYRAMID.station.statusKeys.lines)!.value
    // The two work-bearing lines by their canon labels and register counts…
    for (const line of ATELIER_LINES.filter((l) => l.id !== 'n-1')) expect(value).toContain(line.label)
    // Counted, never carried in prose — a typed number is the drift this house spent 2026-08-12 on.
    expect(value).toMatch(/\d+ works?/)
    // …and the third by what its own mirror declares: its current title and founding date. Its
    // record is not in the register, so a works count here would be the wrong statement entirely.
    const n1 = readN1Facts()
    expect(value).toContain(n1.title)
    expect(value).toContain(`founded ${n1.founded}`)
  })

  it('reads every law out of its mirror — two versions that differ, and one law with none', () => {
    const value = sheetOf('atelier').status.find((r) => r.key === PYRAMID.station.statusKeys.constitutions)!.value
    const versions = [...value.matchAll(/v(\d+)/g)].map((m) => m[1])
    expect(versions).toHaveLength(2)
    expect(new Set(versions).size, 'two lines reading the same version means one mirror is wrong').toBe(2)
    // n-1's law is the Dowry, which carries no version BY DESIGN — a vN attributed to it would
    // mean some surface invented one.
    expect(value).toContain(readN1Facts().law)
  })

  it('leaves a one-line practice with its single constitution row', () => {
    const keys = sheetOf('field').status.map((r) => r.key)
    expect(keys).toContain(PYRAMID.station.statusKeys.constitution)
    expect(keys).not.toContain(PYRAMID.station.statusKeys.lines)
  })

  // ——— the practice's own window (2026-08-16) ——————————————————————————————————————————
  // The n-1 model carried to the practices: a window/ dir in the practice's repo, mirrored
  // verbatim. The door must exist exactly when the mirror carries an entry page — a door onto
  // nothing promises a surface the practice has not built, and a missing door hides one it has.
  it('opens the window door only where the mirror carries an entry page', () => {
    const has = (path: string) => path === 'public/field/window/index.html'
    expect(windowDoor('field', has)).toMatchObject({ href: '/field/window/' })
    expect(windowDoor('atelier', has)).toBeNull()
    expect(windowDoor('studio', () => false)).toBeNull()
  })

  it('gives the Middle no window — it is not a practice', () => {
    expect(windowDoor('middle', () => true)).toBeNull()
  })
})
