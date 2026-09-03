import { describe, expect, it } from 'vitest'
import { buildBoard, cleanMomentTitle, newestMoment, repoSeries } from './board'
import { NAMING } from '@/config/naming'
import type { PulseSnapshot } from '@/lib/pulse/render'
import type { LatestWork } from '@/lib/engines/latest'
import pulseData from '@/data/pulse/pulse.json'

const snapshot = pulseData as unknown as PulseSnapshot

const WORKS: LatestWork[] = [
  { ns: 'field', kind: 'astro', slug: 'b', title: 'A field instrument', date: '2026-08-05', href: '/field/werke/b', state: 'published' },
  { ns: 'atelier', kind: 'html', slug: 'a', title: 'An atelier work', date: '2026-08-01', href: '/atelier/werke-html/a/', state: 'published' },
  { ns: 'studio', kind: 'html', slug: 'c', title: 'A withdrawn premiere', date: '2026-07-30', href: '/studio/werke-html/c/', state: 'withdrawn' },
]

describe('repoSeries', () => {
  it('buckets a repo’s own bins for a 96px line', () => {
    const series = repoSeries(snapshot, 'ulysses', 28)
    expect(series).not.toBeNull()
    expect(series!.length).toBeLessThanOrEqual(28)
    expect(series!.some((v) => v > 0)).toBe(true)
  })

  it('returns null for a snapshot without the per-repo split — never a line out of the aggregate', () => {
    const old: PulseSnapshot = { ...snapshot, weeks: snapshot.weeks.map(({ by_repo: _drop, ...w }) => w) }
    expect(repoSeries(old, 'ulysses')).toBeNull()
  })

  it('returns null for a repo that is simply not in the snapshot', () => {
    expect(repoSeries(snapshot, 'a-repo-that-does-not-exist')).toBeNull()
  })

  it('never counts time that has not elapsed in the current week', () => {
    const week = snapshot.weeks.at(-1)!
    if (week.cutoff_bin === undefined) return
    const padded: PulseSnapshot = {
      ...snapshot,
      weeks: [
        ...snapshot.weeks.slice(0, -1),
        // A repo whose bins are 1 everywhere: if unelapsed bins were counted, the total would be
        // the full week rather than the elapsed part of it.
        { ...week, by_repo: { ...week.by_repo, probe: new Array(snapshot.bins_per_week).fill(1) } },
      ],
    }
    const total = (repoSeries(padded, 'probe') ?? []).reduce((a, b) => a + b, 0)
    expect(total).toBeLessThanOrEqual(week.cutoff_bin)
  })
})

describe('the board says what the rooms say', () => {
  const board = buildBoard(snapshot, WORKS)
  const rows = board.flatMap((g) => g.rows)

  it('has one row per configured system, in two groups', () => {
    expect(board).toHaveLength(NAMING.opsRoom.board.groups.length)
    // Summed rather than flatMap'd: the two groups are `as const` tuples of DIFFERENT shapes (one
    // keyed by `door`, one by `card`), and flatMap infers its result from the first of them, so
    // the second group fails to assign. Counting sidesteps a union the assertion never needed.
    const configured = NAMING.opsRoom.board.groups.reduce((n, g) => n + g.rows.length, 0)
    expect(rows).toHaveLength(configured)
  })

  it('takes every ecology row’s name, link and one-liner verbatim from its own door', () => {
    for (const door of NAMING.doors.items) {
      const row = rows.find((r) => r.id === door.id)!
      expect(row.name).toBe(door.name)
      expect(row.href).toBe(door.href)
      // Verbatim, not "similar": the entrance must not be able to describe a house differently
      // from the house's own door.
      expect(row.what).toBe(door.description)
    }
  })

  it('shows each practice’s newest landed work, with its own date', () => {
    expect(rows.find((r) => r.id === 'ulysses')!.last).toMatchObject({ title: 'An atelier work', meta: '2026-08-01' })
    expect(rows.find((r) => r.id === 'meridian')!.last).toMatchObject({ title: 'A field instrument', meta: '2026-08-05' })
    expect(rows.find((r) => r.id === 'ensemble')!.last).toMatchObject({ title: 'A withdrawn premiere', meta: '2026-07-30' })
  })

  it('states a count where the crossings register carries no date, instead of inventing one', () => {
    const middle = rows.find((r) => r.id === 'conductor')!
    expect(middle.last).not.toBeNull()
    expect(middle.last!.meta).toMatch(/^\d+ crossings on the record$/)
  })

  it('gives the four ecology stations their voice and the four beside it none', () => {
    expect(rows.filter((r) => r.voice !== null).map((r) => r.voice)).toEqual([
      'ulysses', 'meridian', 'ensemble', 'conductor',
    ])
    // Four is the measured ceiling for a categorical set in this repo (palette.test.ts); the
    // rows beside the ecology wear the room's live accent and are told apart by name. n-1
    // joined them on 2026-09-03 — a fifth hue would have broken the ceiling, and n-1 is the
    // Atelier's line rather than a practice of its own, so borrowing a voice would have been
    // a second claim on top of a colour.
    expect(rows.filter((r) => r.voice === null).map((r) => r.id)).toEqual(['attention', 'nightly-line', 'arch', 'n-1'])
  })

  it('reads n-1’s last landed output from n-1’s own nights, never from the Atelier it descends from', () => {
    const n1 = rows.find((r) => r.id === 'n-1')!
    expect(n1.last).not.toBeNull()
    // The practice names its own unit of record, and on 2026-09-03 it renamed one: the newest
    // file reads "Bell 26 — …" where its predecessors read "Night 20 — …". This assertion
    // therefore checks the SHAPE the loader depends on — a word, a number, the em dash, then the
    // record's own words — and not the word itself. The house reads what a practice publishes; it
    // does not prescribe what a practice calls its nights.
    expect(n1.last!.title).toMatch(/^\S+ \d+ — \S/)
    expect(n1.last!.href).toBe('/n-1/record.html')
  })

  it('reads Arch’s last landed output from Arch’s own record, never from another practice', () => {
    const arch = rows.find((r) => r.id === 'arch')!
    expect(arch.last).not.toBeNull()
    expect(arch.last!.href).toMatch(/^\/arch\/read\/record\//)
  })

  it('never leaves a cell silently empty', () => {
    for (const row of rows) {
      expect(row.name.length, row.id).toBeGreaterThan(0)
      expect(row.what.length, row.id).toBeGreaterThan(20)
      expect(row.resident.length, row.id).toBeGreaterThan(0)
      expect(row.status, row.id).toMatch(/^[A-Z]+$/)
    }
  })
})

/* The signal log's own tests moved with it to house-feed.test.ts on 2026-09-03. */

describe('the attention row title', () => {
  it('cleans a subject that is a raw list dump — doubled spaces, empty items, a trailing ", ,"', () => {
    const raw = 'Drought in Austria, Bosnia  and  Herzegovina, Belgium, Belarus, Switzerland, Czech Republic, Germany, Denmark, Spain, France, Croatia, Hungary, Ireland, Italy, Liechtenstein, Luxembourg, Netherlands, Poland, Romania, Serbia, Sweden, Slovenia, Slovakia, San Marino, Ukraine, ,'
    const title = cleanMomentTitle(raw)
    expect(title).not.toMatch(/,\s*,/)
    expect(title).not.toMatch(/\s{2,}/)
    expect(title).not.toMatch(/,\s*$/)
    expect(title.length).toBeLessThanOrEqual(92)
    expect(title.endsWith('…')).toBe(true)
    expect(title.startsWith('Drought in Austria')).toBe(true)
  })

  it('leaves a short, clean subject exactly as written', () => {
    expect(cleanMomentTitle('Earthquake in Afghanistan')).toBe('Earthquake in Afghanistan')
  })

  it('picks the newest moment deterministically when timestamps tie', () => {
    const tied = [
      { occurred_at: '2026-09-01T10:27:00+00:00', subject: 'Zulu warning' },
      { occurred_at: '2026-09-01T10:27:00+00:00', subject: 'Alpha warning' },
      { occurred_at: '2026-08-31T09:00:00+00:00', subject: 'Older moment' },
    ]
    expect(newestMoment(tied)!.subject).toBe('Alpha warning')
    expect(newestMoment([...tied].reverse())!.subject).toBe('Alpha warning')
  })
})
