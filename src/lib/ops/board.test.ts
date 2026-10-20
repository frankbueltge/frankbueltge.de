import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { boardSources, buildBoard, cleanMomentTitle, lastRelation, newestMoment, repoSeries, type BoardSources } from './board'
import { matchRedirect, parseRedirects } from '@/lib/engines/publication.mjs'
import { readOpenCycle, withOpenCycleRewrites } from '@/lib/engines/publication-prune.mjs'
import { pieceHref } from '@/lib/engines/publication-links'
import { NAMING } from '@/config/naming'
import type { MadeThing } from '@/lib/ecology/record'
import { loadRelay, type Relation } from '@/lib/ecology/relay'
import { newestN1Page } from '@/lib/n1/works'
import type { PulseSnapshot } from '@/lib/pulse/render'
import pulseData from '@/data/pulse/pulse.json'

const snapshot = pulseData as unknown as PulseSnapshot

/** A made thing as the ecology's record lists it — only what the board reads is set. */
const thing = (t: Partial<MadeThing> & Pick<MadeThing, 'house' | 'title' | 'date' | 'href'>): MadeThing => ({
  kind: 'artifact',
  paperHref: null,
  sortDay: t.date ?? '',
  cycle: 8,
  withdrawn: false,
  blurb: null,
  auditKey: null,
  withdrawnNote: null,
  withdrawnOn: null,
  session: null,
  countCycle: 8,
  seq: null,
  ...t,
})

const relation = (r: Partial<Relation> & Pick<Relation, 'id' | 'date' | 'kind' | 'what'>): Relation => ({
  giver: 'field',
  taker: 'studio',
  thread: null,
  giverRef: null,
  takerRef: null,
  corrects: null,
  ...r,
})

// The ecology's record, fixed: what the board must read since 2026-10-17. The nightly line's work
// is the newest of all and carries the Atelier's namespace by descent — it must not stand on the
// Atelier's row. The Field's artifact is newer than any v2 work it ever made.
const SOURCES: BoardSources = {
  things: [
    thing({ house: 'nightly-line', kind: 'work', title: 'A night of the line', date: '2026-10-17', href: '/error-as-method/a-night/', cycle: null, countCycle: null }),
    thing({ house: 'field', title: 'The Fine for Working', date: '2026-10-16', href: '/field/artifacts/2026-10-16-the-fine-for-working/' }),
    thing({ house: 'field', title: 'The Clock and the Record', date: '2026-10-16', href: '/field/artifacts/2026-10-16-the-clock-and-the-record/', seq: null }),
    thing({ house: 'atelier', title: 'The Warner’s Column — the Atelier', date: '2026-10-16', href: '/atelier/window/cycle-008-session-3/', seq: 8003 }),
    thing({ house: 'atelier', title: 'The Hundred Occasions', date: '2026-10-15', href: '/atelier/window/cycle-008-session-2/', seq: 8002 }),
    thing({ house: 'studio', kind: 'work', title: 'FILED UNDER', date: '2026-10-16', href: '/studio/werke-html/2026-10-16-filed-under/' }),
    thing({ house: 'atelier', kind: 'presentation', title: 'The Heeded Column', date: '2026-10-16', href: '/atelier/presentations/cycle-008/' }),
  ],
  relations: [
    relation({ id: 'rel-2026-10-15-field-1', date: '2026-10-15', kind: 'built_on', what: 'Built on the Studio’s keepers.' }),
    relation({ id: 'rel-2026-10-16-studio-1', date: '2026-10-16', kind: 'noted', what: 'Declined the Field’s tornado table.' }),
    relation({ id: 'rel-2026-10-16-studio-2', date: '2026-10-16', kind: 'answered', what: 'Answered the Field’s clock with its own count.' }),
  ],
}

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
  const board = buildBoard(snapshot, SOURCES)
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

  it('shows each practice’s newest piece from the ecology’s record, with its own date', () => {
    // the Atelier's newest window, never the nightly line's newer work, and without its own name
    // after the title — linked where it is read since the publication rule of 2026-10-17 (a
    // session's window: in the practice's repository; see the committed-record block below)
    expect(rows.find((r) => r.id === 'ulysses')!.last).toEqual({ title: 'The Warner’s Column', meta: '2026-10-16', href: pieceHref('/atelier/window/cycle-008-session-3/') })
    expect(rows.find((r) => r.id === 'meridian')!.last).toMatchObject({ meta: '2026-10-16' })
    expect(rows.find((r) => r.id === 'ensemble')!.last).toMatchObject({ title: 'FILED UNDER', meta: '2026-10-16' })
  })

  it('gives the Middle the relay’s newest relation in its own words, and the relay’s count', () => {
    const middle = rows.find((r) => r.id === 'conductor')!
    // on the newest day the answer stands before the note
    expect(middle.last).toEqual({ title: 'Answered the Field’s clock with its own count.', meta: '3 crossings on the record', href: '/encounters' })
  })

  it('gives the four ecology stations their voice and the three beside it none', () => {
    expect(rows.filter((r) => r.voice !== null).map((r) => r.voice)).toEqual([
      'ulysses', 'meridian', 'ensemble', 'conductor',
    ])
    // Four is the measured ceiling for a categorical set in this repo (palette.test.ts); the
    // rows beside the ecology wear the room's live accent and are told apart by name. n-1
    // joined them on 2026-09-03 — a fifth hue would have broken the ceiling, and n-1 is the
    // Atelier's line rather than a practice of its own, so borrowing a voice would have been
    // a second claim on top of a colour. Arch stood among them from 2026-08-23 to 2026-10-11
    // and left when its trial had ended: a board lists what is running.
    expect(rows.filter((r) => r.voice === null).map((r) => r.id)).toEqual(['attention', 'nightly-line', 'n-1'])
  })

  it('names the newest page of n-1 a visitor can open, read from n-1’s own mirror', () => {
    const n1 = rows.find((r) => r.id === 'n-1')!
    expect(n1.last).not.toBeNull()
    // Until 2026-10-10 this cell carried the newest night's heading — a count of sessions on a
    // row whose link led to a front page where nothing those sessions built could be found. It
    // carries a page now: the title the page gives itself, the day the practice's record says
    // it was built, and an address that is a file in the mirror. Checked against the same
    // derivation the shelf on the practice's front door is built from, not against a typed
    // title — the practice builds a new page most nights.
    const newest = newestN1Page()!
    // Since the publication rule of 2026-10-17 the site serves n-1's works, not its studies: a
    // study is linked at its place in n-1's repository, never through a 301.
    expect(n1.last).toEqual({ title: newest.title, meta: newest.date, href: pieceHref(newest.href) })
    expect(n1.last!.meta).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    // never the Atelier's: the line descends from that practice and shares none of its record
    const href = n1.last!.href ?? ''
    if (href.startsWith('/')) {
      expect(href).toMatch(/^\/n-1\/(works|projects)\//)
      expect(existsSync(`public${href}${href.endsWith('/') ? 'index.html' : ''}`)).toBe(true)
    } else {
      expect(href).toMatch(/^https:\/\/github\.com\/frankbueltge\/n-1\/tree\/main\/(works|projects)\//)
      expect(existsSync(`public${newest.href}${newest.href.endsWith('/') ? 'index.html' : ''}`)).toBe(true)
    }
  })

  it('lists no row for Arch, whose trial has ended — its room is its archive', () => {
    // Until 2026-10-11 this test held that the row read Arch's last landed output from Arch's
    // own record. The row is gone; what must not happen now is that it comes back by accident
    // (a board spec copied from history) while the practice stays off every other surface.
    expect(rows.find((r) => r.id === 'arch')).toBeUndefined()
    expect(NAMING.opsRoom.board.groups.flatMap((g) => g.rows.map((r) => r.repo))).not.toContain('arch')
  })

  // The resident line used to be the door id with its first letter capitalised, which was a
  // spelling coincidence rather than a name: it broke the day the Atelier settled on Assay
  // (2026-09-03) while its door, repo and route stayed `ulysses`.
  it('names the resident practice, never the door id it is reached through', () => {
    const atelier = rows.find((r) => r.id === 'ulysses')!
    expect(atelier.resident).toBe('resident: Assay')
    expect(atelier.resident).not.toMatch(/Ulysses/)
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

describe('the Middle’s row', () => {
  it('never shows a relation a later one corrects', () => {
    const last = lastRelation([
      relation({ id: 'rel-a', date: '2026-10-16', kind: 'built_on', what: 'Built on a count that was wrong.' }),
      relation({ id: 'rel-b', date: '2026-10-16', kind: 'noted', what: 'Corrected: the count was right.', corrects: 'rel-a' }),
    ])
    expect(last!.title).toBe('Corrected: the count was right.')
    expect(last!.meta).toBe('2 crossings on the record')
  })

  it('stays silent, rather than inventing a crossing, while the relay holds none', () => {
    expect(lastRelation([])).toBeNull()
  })
})

describe('the board on the committed record', () => {
  // Shape only, never a title or a number of today: the record grows every night.
  const rows = buildBoard(snapshot).flatMap((g) => g.rows)

  it('counts the Middle’s crossings from the relay — the number /encounters prints', () => {
    const relay = loadRelay()
    const count = relay.status === 'ok' ? relay.relay.relations.length : 0
    const middle = rows.find((r) => r.id === 'conductor')!
    if (count === 0) expect(middle.last).toBeNull()
    else expect(middle.last!.meta).toBe(`${count} crossings on the record`)
  })

  it('never puts the nightly line’s work on a practice’s row', () => {
    for (const id of ['ulysses', 'meridian', 'ensemble']) {
      const href = rows.find((r) => r.id === id)!.last?.href ?? ''
      expect(href, id).not.toMatch(/^\/error-as-method\//)
    }
  })

  it('reads the same record the practice pages read', () => {
    const { things } = boardSources()
    const atelier = rows.find((r) => r.id === 'ulysses')!.last
    if (atelier) expect(things.some((t) => t.house === 'atelier' && pieceHref(t.href) === atelier.href)).toBe(true)
  })

  // The publication rule of 2026-10-17 took the practices' session windows and artifacts off the
  // site, and a practice's newest piece is often one of them. A board link that only reaches its
  // piece through a 301 says one thing and does another, so no newest-piece link may be an address
  // public/_redirects sends away — the piece is linked in its repository instead.
  it('never leaves a newest-piece link on a redirect', () => {
    // as the build writes it: with the open cycle's rewrites, which keep its pieces on the site
    const rules = parseRedirects(withOpenCycleRewrites(readFileSync('public/_redirects', 'utf8'), readOpenCycle(process.cwd())))
    for (const row of rows) {
      const href = row.last?.href
      if (!href || !href.startsWith('/')) continue
      const hit = matchRedirect(rules, href.split('#')[0]!)
      expect(hit && hit.rule.status !== 200 ? hit.location : null, `${row.id}: ${href}`).toBeNull()
    }
  })
}, 60_000)

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
