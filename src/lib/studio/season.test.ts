// Guard for the season floor: it must derive EVERYTHING from the committed record and invent
// nothing. Two layers here — the real committed data (so the figure the site actually ships is
// under test, including the three returns of One Tap that the whole tour rests on) and small
// fixtures for the shapes the real data does not currently contain (an undated strike, a second
// withdrawal), so those paths are proven before the house produces one.
import { describe, expect, it } from 'vitest'
import chronicleUpstream from '@/data/studio/chronicle.upstream.json'
import stageData from '@/data/studio/stage.curated.json'
import oneTap from '@/content/studio/works/2026-07-23-one-tap/meta.json'
import nativeSpeaker from '@/content/studio/works/2026-07-13-native-speaker/meta.json'
import noWay from '@/content/studio/works/2026-07-17-no-way-of-knowing/meta.json'
import recovery from '@/content/studio/works/2026-07-21-recovery/meta.json'
import noPart from '@/content/studio/works/2026-07-30-no-part/meta.json'
import {
  buildSeasonFloorSvg,
  buildSeasonModel,
  hoverText,
  seasonOrder,
  seasonRows,
  type SeasonInput,
  type SeasonKill,
} from './season'

const METAS = {
  '2026-07-13-native-speaker': nativeSpeaker,
  '2026-07-17-no-way-of-knowing': noWay,
  '2026-07-21-recovery': recovery,
  '2026-07-23-one-tap': oneTap,
  '2026-07-30-no-part': noPart,
}

const REAL: SeasonInput = {
  chronicle: chronicleUpstream,
  metas: METAS,
  kills: stageData.kills as SeasonKill[],
}

describe('buildSeasonModel over the committed record', () => {
  const model = buildSeasonModel(REAL)

  it('is pure: the same committed data yields a byte-identical figure', () => {
    expect(buildSeasonFloorSvg(model)).toBe(buildSeasonFloorSvg(buildSeasonModel(structuredClone(REAL))))
  })

  it('keeps every mark: one per premiere, one per strike, one per return', () => {
    // five ship entries, one of them withdrawn; seven curated strikes; three returns of One Tap
    expect(model.counts.premiered).toBe(4)
    expect(model.counts.withdrawn).toBe(1)
    expect(model.counts.struck).toBe(stageData.kills.length)
    expect(model.counts.returned).toBe(3)
    expect(model.marks).toHaveLength(4 + 1 + stageData.kills.length + 3)
  })

  it('reads WITHDRAWN off the work\'s own meta.json, not off a hand-kept list', () => {
    const w = model.marks.filter((m) => m.state === 'withdrawn')
    expect(w.map((m) => m.key)).toEqual(['withdrawn:2026-07-23-one-tap'])
    expect(w[0].label).toBe('ONE TAP')
    // the record for the withdrawal IS the meta line the collective wrote
    expect(w[0].record.startsWith('WITHDRAWN 2026-07-25 (collective session 43)')).toBe(true)
    expect(w[0].source).toContain('meta.json')
  })

  it('finds the three returns in the chronicle\'s own sentences, numbered in order', () => {
    const r = model.marks.filter((m) => m.state === 'returned')
    expect(r.map((m) => m.ordinal)).toEqual([1, 2, 3])
    expect(r.map((m) => m.session)).toEqual(['S28', 'S32', 'S43'])
    expect(r.map((m) => m.date)).toEqual(['2026-07-21', '2026-07-23', '2026-07-25'])
    expect(r.every((m) => m.ofWork === '2026-07-23-one-tap')).toBe(true)
  })

  it('carries each return\'s own words verbatim, and each record is really in the chronicle', () => {
    const raw = JSON.stringify(chronicleUpstream)
    for (const m of model.marks.filter((k) => k.state === 'returned')) {
      expect(m.record.length).toBeGreaterThan(40)
      // the record is a substring of a committed summary — quoted, never re-written
      expect(chronicleUpstream.some((e) => e.summary.includes(m.record))).toBe(true)
      expect(raw).toContain(m.label)
    }
    // the second and third returns keep the eye's own quoted words
    const words = model.marks.filter((k) => k.state === 'returned').map((k) => k.label)
    expect(words[1]).toBe('keep working on the staging; this is even worse staged than the HTML version.')
    expect(words[2]).toBe(
      'the html version was better than everything you delivered afterwards; the staging is still very bad and cheap',
    )
  })

  it('keeps every strike reason and source verbatim from the curated list', () => {
    for (const kill of stageData.kills) {
      const m = model.marks.find((k) => k.state === 'struck' && k.label === kill.name)
      expect(m, `no mark for ${kill.name}`).toBeDefined()
      expect(m!.record).toBe(kill.reason)
      expect(m!.source).toBe(kill.source)
    }
  })

  it('names every file it read, so the figure can state its own provenance', () => {
    expect(model.provenance).toContain('src/data/studio/chronicle.upstream.json')
    expect(model.provenance).toContain('src/data/studio/stage.curated.json')
    expect(model.provenance).toContain('src/content/studio/works/*/meta.json')
  })

  it('places lit positions downstage and struck positions further back, all on the floor', () => {
    for (const m of model.marks) {
      expect(m.x).toBeGreaterThanOrEqual(96)
      expect(m.x).toBeLessThanOrEqual(1344)
      expect(m.y).toBeGreaterThan(150)
      expect(m.y).toBeLessThan(706)
    }
    const litY = model.marks.filter((m) => m.state === 'premiered' || m.state === 'withdrawn').map((m) => m.y)
    const struckY = model.marks.filter((m) => m.state === 'struck').map((m) => m.y)
    expect(Math.max(...litY)).toBeLessThan(Math.min(...struckY))
  })

  it('lets no two pools overlap — a name is never lettered over another name', () => {
    const pools = model.marks.filter((m) => m.state === 'premiered' || m.state === 'withdrawn')
    for (let i = 0; i < pools.length; i++) {
      for (let j = i + 1; j < pools.length; j++) {
        const a = pools[i]
        const b = pools[j]
        const overlapX = Math.abs(a.x - b.x) < a.rx + b.rx
        const overlapY = Math.abs(a.y - b.y) < a.ry + b.ry
        expect(overlapX && overlapY, `${a.label} overlaps ${b.label}`).toBe(false)
      }
    }
  })

  it('steps chronologically, and a work is premiered before it can be returned', () => {
    const order = seasonOrder(model.marks)
    const dates = order.map((m) => m.date)
    expect([...dates].sort()).toEqual(dates)
    const premiere = order.findIndex((m) => m.key === 'withdrawn:2026-07-23-one-tap')
    const thirdReturn = order.findIndex((m) => m.key === 'returned:2026-07-23-one-tap:3')
    expect(premiere).toBeLessThan(thirdReturn)
  })
})

describe('the SVG the floor renders', () => {
  const model = buildSeasonModel(REAL)

  it('draws one pool per lit position, one X per strike, and the withdrawal struck through', () => {
    const svg = buildSeasonFloorSvg(model)
    expect(svg.match(/class="st-sf-pool/g) ?? []).toHaveLength(5)
    expect(svg.match(/class="st-sf-x"/g) ?? []).toHaveLength(stageData.kills.length)
    expect(svg.match(/st-sf-x-through/g) ?? []).toHaveLength(1)
    expect(svg.match(/class="st-sf-arc"/g) ?? []).toHaveLength(3)
    // the struck pool is BOTH a pool and struck — the position stays on the floor, unlit
    expect(svg).toContain('st-sf-pool st-sf-withdrawn')
  })

  it('carries no colour and no gradient — appearance belongs to studio-stage.css', () => {
    const svg = buildSeasonFloorSvg(model)
    expect(svg).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(svg).not.toContain('radialGradient')
    expect(svg).not.toContain('style=')
  })

  it('titles every pool in the work\'s own name — identity is never colour alone', () => {
    const svg = buildSeasonFloorSvg(model)
    for (const title of ['ONE TAP', 'NATIVE SPEAKER', 'RECOVERY', 'NO PART']) {
      expect(svg).toContain(`>${title}<`)
    }
  })

  it('puts the verbatim record on every mark, with no JavaScript involved', () => {
    const svg = buildSeasonFloorSvg(model)
    for (const kill of stageData.kills) {
      expect(svg).toContain(escapeForSvg(kill.reason))
    }
  })

  it('honours a scene\'s focus: filter, dim, select, annotate and a crop', () => {
    const plain = buildSeasonFloorSvg(model)
    const focused = buildSeasonFloorSvg(model, {
      filter: ['returned', 'withdrawn'],
      dim: ['struck:certified'],
      select: 'withdrawn:2026-07-23-one-tap',
      annotate: [{ key: 'withdrawn:2026-07-23-one-tap', text: 'three returns' }],
    })
    expect(plain).not.toContain('data-sel')
    expect(focused).toContain('data-sel')
    expect(focused).toContain('data-dim')
    expect(focused).toContain('three returns')
    // every mark is still DRAWN under a filter; only its "on" state changes
    expect(focused.match(/class="st-sf-x"/g) ?? []).toHaveLength(stageData.kills.length)

    const cropped = buildSeasonFloorSvg(model, { cropTo: 'withdrawn:2026-07-23-one-tap' })
    expect(cropped).not.toContain(`viewBox="0 0 ${model.width} ${model.height}"`)
    expect(cropped).toContain('viewBox="')
  })

  it('the crop window is opt-in — the tour\'s own crop stays byte-identical', () => {
    // The hub's triptych needs a tighter window than a tour scene does (WP7). It says so with
    // `cropBox`; a caller that does not is drawn exactly as it was before that option existed.
    const tour = buildSeasonFloorSvg(model, { cropTo: 'withdrawn:2026-07-23-one-tap', still: true })
    expect(buildSeasonFloorSvg(model, { cropTo: 'withdrawn:2026-07-23-one-tap', still: true })).toBe(tour)
    const thumb = buildSeasonFloorSvg(model, {
      cropTo: 'withdrawn:2026-07-23-one-tap',
      cropBox: { width: 520, height: 360 },
      still: true,
    })
    expect(thumb).toContain('viewBox="')
    expect(thumb).not.toBe(tour)
    // …and it is a WINDOW, not a scale change: the marks keep the coordinates they were laid out at
    const pool = /<ellipse class="st-sf-pool[^"]*" cx="([\d.-]+)"/.exec(thumb)![1]
    expect(tour).toContain(`cx="${pool}"`)
  })

  it('a still carries no interaction hooks (the tour\'s build-time image)', () => {
    const still = buildSeasonFloorSvg(model, { still: true })
    expect(still).not.toContain('tabindex')
    expect(still).not.toContain('data-key')
    // …but keeps its native <title> records, so even the still is readable
    expect(still).toContain('<title>')
  })
})

describe('the table floor and the honest gaps', () => {
  it('renders one row per mark, chronological, reasons verbatim', () => {
    const model = buildSeasonModel(REAL)
    const rows = seasonRows(model)
    expect(rows).toHaveLength(model.marks.length)
    expect(rows.map((r) => r.date.slice(0, 10)).every((d) => /^\d{4}-\d{2}-\d{2}$/.test(d))).toBe(true)
    const struck = rows.find((r) => r.work === 'Ledger of Days')!
    expect(struck.reason).toBe("rejected ('wallpaper by definition')")
    expect(struck.state).toBe('struck')
  })

  it('marks a strike whose evening the mirror does not carry — never bridges it silently', () => {
    const model = buildSeasonModel({
      ...REAL,
      kills: [...(stageData.kills as SeasonKill[]), { name: 'Ghost', session: 'S99', reason: 'r', source: 's' }],
    })
    const ghost = model.marks.find((m) => m.label === 'Ghost')!
    expect(ghost.dateKnown).toBe(false)
    expect(seasonRows(model).find((r) => r.work === 'Ghost')!.date).toContain('not in the mirror')
    expect(buildSeasonFloorSvg(model)).toContain('evening not in the mirror')
  })

  it('refuses to draw a season with no chronicle at all', () => {
    expect(() => buildSeasonModel({ chronicle: [], metas: {}, kills: [] })).toThrow(/no season to draw/)
  })

  it('takes a second withdrawal, and a work with no returns, without special-casing either', () => {
    const model = buildSeasonModel({
      chronicle: [
        { collective_session: 1, date: '2026-08-01', move: 'ship', summary: 'A premiere happened here.', works: ['w1'] },
        { collective_session: 2, date: '2026-08-02', move: 'ship', summary: 'Another premiere happened.', works: ['w2'] },
        {
          collective_session: 3,
          date: '2026-08-03',
          move: 'steer',
          summary: 'The human eye returned Second a first time — "not staged at all". And the house agreed.',
          works: ['w2'],
        },
      ],
      metas: {
        w1: { title: 'First', medium: 'WITHDRAWN 2026-08-04 — kept as record' },
        w2: { title: 'Second', medium: 'A live thing' },
      },
      kills: [],
    })
    expect(model.counts.withdrawn).toBe(1)
    expect(model.counts.premiered).toBe(1)
    expect(model.counts.returned).toBe(1)
    expect(model.marks.find((m) => m.state === 'returned')!.label).toBe('not staged at all')
  })

  it('keeps the whole sentence when a return carries no quotation to lift', () => {
    const model = buildSeasonModel({
      chronicle: [
        { collective_session: 1, date: '2026-08-01', move: 'ship', summary: 'A premiere happened here.', works: ['w1'] },
        {
          collective_session: 2,
          date: '2026-08-02',
          move: 'steer',
          summary: 'The human eye returned First without giving a reason on the record. Work continued.',
          works: ['w1'],
        },
      ],
      metas: { w1: { title: 'First', medium: 'A live thing' } },
      kills: [],
    })
    const r = model.marks.find((m) => m.state === 'returned')!
    expect(r.label).toBe('The human eye returned First without giving a reason on the record.')
    expect(r.record).toBe(r.label)
  })

  it('the hover record names the state, the session and the source', () => {
    const model = buildSeasonModel(REAL)
    const w = model.marks.find((m) => m.state === 'withdrawn')!
    const text = hoverText(w)
    expect(text).toContain('ONE TAP')
    expect(text).toContain('premiered, then withdrawn')
    expect(text).toContain('meta.json')
  })
})

/** stage.test.ts's own convention: the builder escapes for XML, so a verbatim check must too. */
function escapeForSvg(s: string): string {
  return s
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}
