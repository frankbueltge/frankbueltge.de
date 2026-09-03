import { describe, expect, it } from 'vitest'
import {
  archEntries,
  buildHouseFeed,
  FEED_PAGE_SIZE,
  houseNames,
  labEntries,
  n1Entries,
  paginate,
  registerEntries,
  type HouseId,
} from './house-feed'
import { NAMING } from '@/config/naming'
import { WERKE } from '@/data/werke'
import type { Werk } from '@/data/werke'
import type { ArchFacts } from '@/lib/arch/facts'
import type { N1Work } from '@/lib/n1/works'
import type { LatestWork } from '@/lib/engines/latest'
import { NIGHTLY_FORK_DIR } from '@/lib/engines/register'

const WORKS: LatestWork[] = [
  { ns: 'field', kind: 'astro', slug: 'b', title: 'A field instrument', date: '2026-08-05', href: '/field/werke/b', state: 'published' },
  { ns: 'atelier', kind: 'html', slug: 'a', title: 'An atelier work', date: '2026-08-01', href: '/atelier/werke-html/a/', state: 'published' },
  { ns: 'studio', kind: 'html', slug: 'c', title: 'A withdrawn premiere', date: '2026-07-30', href: '/studio/werke-html/c/', state: 'withdrawn' },
  { ns: 'atelier', kind: 'html', slug: 'n', title: 'A night in the fork', date: '2026-08-20', href: '/error-as-method/n/', state: 'published', dir: NIGHTLY_FORK_DIR },
]

const ARCH: ArchFacts = {
  founded: '2026-08-22',
  law: 'the Dowry',
  window: null,
  protocols: [],
  registers: [],
  reading: [],
  works: [
    { id: 'arrival', title: 'Arrival', instances: [], built: '2026-09-03' },
    { id: 'undated', title: 'A candidate with no build date', instances: [] },
  ],
}

const N1: N1Work[] = [
  { id: 'two-nights-deep', title: 'Two Nights Deep', date: '2026-08-25', href: '/n-1/works/two-nights-deep/' },
]

const LAB: Werk[] = [
  { id: 'x', line: 'ledger', title: 'A lab experiment', subtitle: { de: '', en: '' }, status: 'live', href: '/x', description: { de: '', en: '' }, since: '2026-08-10', tier: 'experiment' },
  { id: 'y', line: 'watchers', title: 'A lab instrument', subtitle: { de: '', en: '' }, status: 'live', href: '/y', description: { de: '', en: '' }, since: '2026-08-02', tier: 'instrument' },
  // a practice door: same array, not the lab's shelf — it carries no research line
  { id: 'door', title: 'A practice door', subtitle: { de: '', en: '' }, status: 'live', href: '/d', description: { de: '', en: '' }, since: '2026-09-02' },
]

const feed = () => buildHouseFeed({ works: WORKS, arch: ARCH, n1: N1, werke: LAB })

describe('the signal log speaks for the whole house', () => {
  it('carries every house that lands dated work, not only the ecology’s three practices', () => {
    const houses = new Set(feed().map((e) => e.house))
    expect(houses).toEqual(new Set<HouseId>(['field', 'atelier', 'studio', 'nightly-line', 'arch', 'n-1', 'lab']))
  })

  it('is newest first, and the order does not move between builds', () => {
    const dates = feed().map((e) => e.date)
    expect(dates).toEqual([...dates].sort().reverse())
    expect(feed().map((e) => e.title)).toEqual(feed().map((e) => e.title))
  })

  it('names the fork as its own house rather than as the Atelier it descends from', () => {
    const night = feed().find((e) => e.title === 'A night in the fork')!
    expect(night.house).toBe('nightly-line')
    expect(night.houseName).toBe(NAMING.overview.items.find((c) => c.id === 'nightly-line')!.title)
    // …while keeping the Atelier's colour: one practice, two addresses, three voices in the quartet.
    expect(night.voice).toBe('ulysses')
  })

  it('keeps a withdrawn work listed and marked — the record keeps every mark', () => {
    expect(feed().find((e) => e.title === 'A withdrawn premiere')!.withdrawn).toBe(true)
  })

  it('drops an entry whose record carries no date rather than dating it itself', () => {
    expect(feed().some((e) => e.title === 'A candidate with no build date')).toBe(false)
  })
})

describe('each house is named and counted by its own record', () => {
  it('takes the practices’ names from the doors and the others’ from their cards', () => {
    const names = houseNames()
    expect(names.atelier).toBe(NAMING.doors.items.find((d) => d.id === 'ulysses')!.name)
    expect(names.field).toBe(NAMING.doors.items.find((d) => d.id === 'meridian')!.name)
    expect(names.studio).toBe(NAMING.doors.items.find((d) => d.id === 'ensemble')!.name)
    expect(names.arch).toBe(NAMING.overview.items.find((c) => c.id === 'arch')!.title)
    expect(names['n-1']).toBe(NAMING.overview.items.find((c) => c.id === 'n-1')!.title)
  })

  it('uses each house’s own noun for what it makes', () => {
    const K = NAMING.opsRoom.signal.kindLabels
    const byTitle = new Map(feed().map((e) => [e.title, e.kind]))
    expect(byTitle.get('A field instrument')).toBe(K.field)
    expect(byTitle.get('An atelier work')).toBe(K.atelier)
    expect(byTitle.get('A withdrawn premiere')).toBe(K.studio)
    expect(byTitle.get('A night in the fork')).toBe(K['nightly-line'])
    expect(byTitle.get('Arrival')).toBe(K.arch)
    expect(byTitle.get('Two Nights Deep')).toBe(K['n-1'])
    expect(byTitle.get('A lab experiment')).toBe(K.experiment)
    expect(byTitle.get('A lab instrument')).toBe(K.instrument)
  })

  it('takes only the lab’s own shelf from werke.ts — a practice door is not an experiment', () => {
    expect(labEntries(LAB).map((e) => e.title)).toEqual(['A lab experiment', 'A lab instrument'])
  })

  it('dates Arch by the day its current iteration was built, from the work’s own README', () => {
    expect(archEntries(ARCH)).toEqual([expect.objectContaining({ title: 'Arrival', date: '2026-09-03' })])
  })

  it('dates n-1 by the day its form says the work was laid down', () => {
    expect(n1Entries(N1)[0]).toMatchObject({ date: '2026-08-25', href: '/n-1/works/two-nights-deep/' })
  })

  it('gives no colour to a house outside the ecology quartet', () => {
    for (const e of feed()) {
      if (['arch', 'n-1', 'lab'].includes(e.house)) expect(e.voice, e.title).toBeNull()
    }
  })
})

describe('the pager', () => {
  it('shows seven and holds the rest — the house rule', () => {
    expect(FEED_PAGE_SIZE).toBe(7)
    const pages = paginate([...Array(17).keys()])
    expect(pages.map((p) => p.length)).toEqual([7, 7, 3])
  })

  it('offers no pages at all over an empty feed', () => {
    expect(paginate([])).toEqual([])
  })

  it('loses nothing and reorders nothing', () => {
    const entries = feed()
    expect(paginate(entries).flat()).toEqual(entries)
  })
})

describe('against the real record, not only the fixture', () => {
  const real = buildHouseFeed()

  it('reads the whole house — every source contributes at least one entry', () => {
    const houses = new Set(real.map((e) => e.house))
    for (const h of ['atelier', 'field', 'studio', 'nightly-line', 'arch', 'n-1', 'lab'] as HouseId[]) {
      expect(houses.has(h), `${h} contributes nothing to the signal log`).toBe(true)
    }
  })

  it('is long enough to page, and every row is complete', () => {
    expect(real.length).toBeGreaterThan(FEED_PAGE_SIZE)
    for (const e of real) {
      expect(e.date, e.title).toMatch(/^\d{4}-\d{2}-\d{2}$/)
      expect(e.title.length, e.href).toBeGreaterThan(0)
      expect(e.href, e.title).toMatch(/^(\/|https?:)/)
      expect(e.kind.length, e.title).toBeGreaterThan(0)
      expect(e.houseName.length, e.title).toBeGreaterThan(0)
    }
  })

  it('lists every lab experiment and instrument /experiments renders', () => {
    const lab = real.filter((e) => e.house === 'lab')
    expect(lab).toHaveLength(WERKE.filter((w) => w.line).length)
  })

  it('carries no address twice — one row per thing that landed', () => {
    const seen = real.map((e) => `${e.href}#${e.title}`)
    expect(new Set(seen).size).toBe(seen.length)
  })
})

describe('the register on /ecology keeps its own, narrower claim', () => {
  it('does not fold Arch, n-1 or the lab into the three practices’ catalogue', () => {
    // registerEntries is the ONLY part of the feed the works register shares; it must speak for
    // the register's sources and nothing else, or the count on /ecology stops being checkable.
    const houses = new Set(registerEntries(WORKS).map((e) => e.house))
    expect(houses).toEqual(new Set<HouseId>(['field', 'atelier', 'studio', 'nightly-line']))
  })
})
