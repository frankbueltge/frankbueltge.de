// Guard for the season floor: it must derive EVERYTHING from the committed record and invent
// nothing. Two layers here — the real committed data (so the figure the site actually ships is
// under test, including the three returns of One Tap that the whole tour rests on) and small
// fixtures for the shapes the real data does not currently contain (an undated strike, a second
// withdrawal), so those paths are proven before the house produces one.
//
// The works are read off the content directory, never listed here: a floor that is missing the
// work the house premiered last night is not the floor the site draws, and a suite that lists its
// own five works would not notice. (2026-08-15, with the dossier suite it shares its shape with.)
import { readdirSync } from 'node:fs'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import chronicleUpstream from '@/data/studio/chronicle.upstream.json'
import stageData from '@/data/studio/stage.curated.json'
import oneTap from '@/content/studio/works/2026-07-23-one-tap/meta.json'
import {
  buildSeasonFloorSvg,
  buildSeasonModel,
  hoverText,
  seasonOrder,
  seasonRows,
  type SeasonInput,
  type SeasonKill,
  type SeasonWorkMeta,
} from './season'

const WORKS_DIR = 'src/content/studio/works'

/** Every work the mirror carries, keyed by slug — the same glob the site's own assembly uses. */
const METAS: Record<string, SeasonWorkMeta> = Object.fromEntries(
  Object.entries(
    import.meta.glob('/src/content/studio/works/*/meta.json', { eager: true, import: 'default' }),
  ).map(([path, meta]) => [path.split('/').at(-2) as string, meta as SeasonWorkMeta]),
)

const REAL: SeasonInput = {
  chronicle: chronicleUpstream,
  metas: METAS,
  kills: stageData.kills as SeasonKill[],
}

const ONE_TAP = '2026-07-23-one-tap'

/** The machine-readable head a withdrawn work carries in its own `medium` — re-read here so the
 *  expectations come from the committed files rather than from the module under test. */
const WITHDRAWN_HEAD = /^WITHDRAWN\s+\d{4}-\d{2}-\d{2}/i
/** Every work the record shipped and the mirror carries a meta for, oldest first. */
const SHIPPED = [
  ...new Set(
    chronicleUpstream.filter((e) => e.move === 'ship' && e.works.length > 0).map((e) => e.works[0]),
  ),
].filter((slug) => slug in METAS)
const WITHDRAWN = SHIPPED.filter((slug) => WITHDRAWN_HEAD.test(METAS[slug].medium ?? ''))

describe('buildSeasonModel over the committed record', () => {
  const model = buildSeasonModel(REAL)

  it('is pure: the same committed data yields a byte-identical figure', () => {
    expect(buildSeasonFloorSvg(model)).toBe(buildSeasonFloorSvg(buildSeasonModel(structuredClone(REAL))))
  })

  it('reads every work the mirror committed, from the directory itself', () => {
    // If the glob at the head of this file ever matched nothing, the counts below would agree with
    // an empty record and pass. What it found is checked against the directory the mirror writes.
    const onDisk = readdirSync(join(process.cwd(), WORKS_DIR), { withFileTypes: true })
      .filter((d) => d.isDirectory())
      .map((d) => d.name)
      .sort()
    expect(Object.keys(METAS).sort()).toEqual(onDisk)
    // and every premiere the chronicle records is on the floor, including the newest one
    for (const slug of SHIPPED) {
      expect(model.marks.map((m) => m.key), slug).toContain(
        WITHDRAWN.includes(slug) ? `withdrawn:${slug}` : `premiered:${slug}`,
      )
    }
  })

  it('keeps every mark: one per premiere, one per strike, one per return', () => {
    // Derived from the record, not typed: the premieres are the chronicle's `ship` entries, the
    // withdrawn ones are those the works' own metas mark WITHDRAWN, the strikes are the curated
    // list. Typing today's counts here is how the sixth premiere of 2026-08-15 went unnoticed.
    expect(model.counts.premiered).toBe(SHIPPED.length - WITHDRAWN.length)
    expect(model.counts.withdrawn).toBe(WITHDRAWN.length)
    expect(model.counts.struck).toBe(stageData.kills.length)
    // the eye's three returns of One Tap are history and stay pinned as three
    expect(model.marks.filter((m) => m.state === 'returned' && m.ofWork === ONE_TAP)).toHaveLength(3)
    // …and every count the legend prints is really the number of marks in that state
    for (const state of ['premiered', 'withdrawn', 'struck', 'returned'] as const) {
      expect(model.counts[state], state).toBe(model.marks.filter((m) => m.state === state).length)
    }
    expect(model.marks).toHaveLength(
      SHIPPED.length + stageData.kills.length + model.counts.returned,
    )
  })

  it('reads WITHDRAWN off the work\'s own meta.json, not off a hand-kept list', () => {
    const w = model.marks.filter((m) => m.state === 'withdrawn')
    const t = w.find((m) => m.key === `withdrawn:${ONE_TAP}`)!
    expect(t.label).toBe('ONE TAP')
    // the record for the withdrawal IS the meta line the collective wrote, verbatim
    expect(t.record).toBe(oneTap.medium)
    expect(t.record.startsWith('WITHDRAWN 2026-07-25 (collective session 43)')).toBe(true)
    expect(t.source).toContain('meta.json')
    // every withdrawal on this floor is read the same way — off the work's own file
    expect(w.map((m) => m.key).sort()).toEqual(WITHDRAWN.map((slug) => `withdrawn:${slug}`).sort())
    for (const m of w) {
      expect(m.record.startsWith('WITHDRAWN'), m.key).toBe(true)
      expect(m.source, m.key).toContain('meta.json')
    }
  })

  it('finds the three returns in the chronicle\'s own sentences, numbered in order', () => {
    const r = model.marks.filter((m) => m.state === 'returned' && m.ofWork === ONE_TAP)
    expect(r.map((m) => m.ordinal)).toEqual([1, 2, 3])
    expect(r.map((m) => m.session)).toEqual(['S28', 'S32', 'S43'])
    expect(r.map((m) => m.date)).toEqual(['2026-07-21', '2026-07-23', '2026-07-25'])
    // every return the floor draws belongs to a work the record premiered
    for (const m of model.marks.filter((k) => k.state === 'returned')) {
      expect(SHIPPED, m.key).toContain(m.ofWork)
    }
  })

  it('carries each return\'s own words verbatim, and each record is really in the chronicle', () => {
    const raw = JSON.stringify(chronicleUpstream)
    for (const m of model.marks.filter((k) => k.state === 'returned')) {
      expect(m.record.length).toBeGreaterThan(40)
      // the record is a substring of a committed summary — quoted, never re-written
      expect(chronicleUpstream.some((e) => e.summary.includes(m.record))).toBe(true)
      expect(raw).toContain(m.label)
    }
    // Each of One Tap's three returns is labelled with what that return SAID — short, and lifted
    // whole from the mirror rather than authored here. Until 2026-08-16 that was the eye's own
    // quoted words; the studio's privacy rule of 2026-08-15 replaced them in its chronicle with
    // its own dated paraphrase. WHICH of the two this suite sees depends on which side of the
    // redaction the committed mirror happens to be on — the site-PR gate reads it as committed,
    // the integrate workflow copies the studio's current record over it first — so no string is
    // pinned here. What is pinned is that a label is what a sentence SAID and not the whole
    // evening around it, and that the marker of a withheld passage never becomes the label. The
    // `raw.toContain` loop above already holds every label to being byte-exact in the file.
    const words = model.marks
      .filter((k) => k.state === 'returned' && k.ofWork === ONE_TAP)
      .map((k) => k.label)
    expect(words).toHaveLength(3)
    for (const w of words) {
      expect(w.length).toBeGreaterThan(8)
      // not the whole-evening sentence the fallback would have produced
      expect(w.length).toBeLessThan(140)
      expect(w).not.toMatch(/wording private/i)
    }
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
    // The floor's own edges, typed here on purpose rather than imported: 96/1344 across, 150 down
    // to 810 — the bottom edge was 706 until the lit band gained its third row on 2026-09-01.
    for (const m of model.marks) {
      expect(m.x).toBeGreaterThanOrEqual(96)
      expect(m.x).toBeLessThanOrEqual(1344)
      expect(m.y).toBeGreaterThan(150)
      expect(m.y).toBeLessThan(810)
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

  // The guard above only fires once the committed record has ALREADY collided — which is how the
  // site spent 2026-08-21 refusing every studio integration: the chronicle reached a new day, the
  // time axis compressed to fit it, and two premieres four days apart were pushed into each other.
  // The axis compresses a little further every night the season runs, so the pressure is a function
  // of the season's LENGTH, and that can be applied here directly instead of waited for.
  it('keeps the pools apart however far the season stretches past its premieres', () => {
    // Every premiere on the record, then a closing entry a year out: the six pools are squeezed
    // into the left edge of the axis, the worst case the real record walks towards one day at a
    // time. A layout that only just fits today fails here.
    for (const lastDay of ['2026-09-01', '2026-12-01', '2027-08-21', '2030-01-01']) {
      const stretched = [
        ...chronicleUpstream,
        {
          collective_session: Math.max(...chronicleUpstream.map((e) => e.collective_session)) + 1,
          date: lastDay,
          move: 'steer',
          summary: 'A later evening, so the axis must hold every premiere in less room.',
          works: [],
        },
      ]
      const m = buildSeasonModel({ ...REAL, chronicle: stretched })
      const pools = m.marks.filter((k) => k.state === 'premiered' || k.state === 'withdrawn')
      expect(pools.length, lastDay).toBe(SHIPPED.length)
      for (let i = 0; i < pools.length; i++) {
        for (let j = i + 1; j < pools.length; j++) {
          const a = pools[i]
          const b = pools[j]
          const overlapX = Math.abs(a.x - b.x) < a.rx + b.rx
          const overlapY = Math.abs(a.y - b.y) < a.ry + b.ry
          expect(overlapX && overlapY, `${lastDay}: ${a.label} overlaps ${b.label}`).toBe(false)
        }
      }
      // …and no pool is pushed off the floor to buy that clearance
      for (const p of pools) {
        expect(p.x - p.rx, `${lastDay}: ${p.label} runs off the left`).toBeGreaterThanOrEqual(96)
        expect(p.x + p.rx, `${lastDay}: ${p.label} runs off the right`).toBeLessThanOrEqual(1344)
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
    expect(svg.match(/class="st-sf-pool/g) ?? []).toHaveLength(SHIPPED.length)
    expect(svg.match(/class="st-sf-x"/g) ?? []).toHaveLength(stageData.kills.length)
    expect(svg.match(/st-sf-x-through/g) ?? []).toHaveLength(WITHDRAWN.length)
    expect(svg.match(/class="st-sf-arc"/g) ?? []).toHaveLength(model.counts.returned)
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
    // every lit position the record has, so a work that premiered tonight is named on the floor
    // tonight; the four the house had when this was written are still among them
    for (const m of model.marks.filter((k) => k.state === 'premiered' || k.state === 'withdrawn')) {
      expect(svg, m.key).toContain(`>${escapeForSvg(m.label)}<`)
    }
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

  // The ghost has to name a session the mirror CANNOT carry. It named S99 — a session in the
  // future when this was written, and an evening in the record from 2026-08-16, at which point the
  // fixture quietly began asserting the opposite of what its own sentence says. Any literal number
  // has that fate on a schedule; one past the newest session in the committed mirror has it never.
  // (2026-08-17.)
  it('marks a strike whose evening the mirror does not carry — never bridges it silently', () => {
    const absentSession = `S${Math.max(...chronicleUpstream.map((e) => e.collective_session)) + 1}`
    const model = buildSeasonModel({
      ...REAL,
      kills: [...(stageData.kills as SeasonKill[]), { name: 'Ghost', session: absentSession, reason: 'r', source: 's' }],
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

  // A work can reach the chronicle's `ship` move more than once: the practice revises a premiered
  // work and records the revision as the ship it is. The floor draws PREMIERES, so the second
  // entry is not a second position — it is the same pool, and drawing it twice put two identical
  // ellipses on the same coordinates, gave two marks the same `premiered:<slug>` key (which the
  // dossier index then silently collapsed), and doubled that work's returns. dossier.ts has always
  // kept the first ship per slug and ignored the rest; this holds season.ts to the same reading.
  // (2026-09-02, after the studio re-shipped a work of 2026-08-31 and the integration went red.)
  it('draws one pool for a work the record ships twice, anchored at its premiere', () => {
    const chronicle = [
      { collective_session: 1, date: '2026-08-01', move: 'ship', summary: 'A premiere happened here.', works: ['w1'] },
      {
        collective_session: 2,
        date: '2026-08-02',
        move: 'steer',
        summary: 'The human eye returned First a first time — "not staged at all". And the house agreed.',
        works: ['w1'],
      },
      { collective_session: 3, date: '2026-08-03', move: 'ship', summary: 'The same work, revised and shipped again.', works: ['w1'] },
    ]
    const metas = { w1: { title: 'First', medium: 'A live thing' } }
    const model = buildSeasonModel({ chronicle, metas, kills: [] })

    const pools = model.marks.filter((m) => m.state === 'premiered' || m.state === 'withdrawn')
    expect(pools).toHaveLength(1)
    expect(model.counts.premiered).toBe(1)
    // the premiere is the FIRST ship — the pool keeps that evening, not the revision's
    expect(pools[0].date).toBe('2026-08-01')
    expect(pools[0].session).toBe('S1')
    expect(pools[0].record).toBe('A premiere happened here.')
    // every mark still answers to its own key, and the return is counted once, not twice
    expect(new Set(model.marks.map((m) => m.key)).size).toBe(model.marks.length)
    expect(model.counts.returned).toBe(1)
    expect(buildSeasonFloorSvg(model).match(/class="st-sf-pool/g) ?? []).toHaveLength(1)
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

  // The withheld-wording path, on a fixture and not on the record — because WHICH side of the
  // 2026-08-16 redaction the committed mirror is on is not this suite's business and changes under
  // it. Asserted against the real record, this path is live one week and a no-op the next, and a
  // guard that quietly stops running is worse than no guard. Here it always runs. (2026-08-17.)
  const withheld = (paraphrase: string) =>
    buildSeasonModel({
      chronicle: [
        { collective_session: 1, date: '2026-08-01', move: 'ship', summary: 'A premiere happened here.', works: ['w1'] },
        {
          collective_session: 2,
          date: '2026-08-02',
          move: 'steer',
          summary: `The human eye returned First (2026-08-02, wording private — ${paraphrase}). Work continued afterwards.`,
          works: ['w1'],
        },
      ],
      metas: { w1: { title: 'First', medium: 'A live thing' } },
      kills: [],
    })

  it('labels a withheld return with the paraphrase standing in for it, never with the marker', () => {
    const r = withheld('the staging is still wrong').marks.find((m) => m.state === 'returned')!
    expect(r.label).toBe('the staging is still wrong')
    expect(r.label).not.toMatch(/wording private/i)
    // and the record around it still carries the whole passage, marker and all
    expect(r.record).toMatch(/wording private/i)
  })

  it('falls back to the record rather than publish a paraphrase cut at a nested bracket', () => {
    const r = withheld('the staging (again) is still wrong').marks.find((m) => m.state === 'returned')!
    // NOT 'the staging (again' — a truncation that would read like a whole sentence on the floor.
    // The fallback is the whole record, which does contain that text as a span; what must not
    // happen is the cut clause STANDING ALONE as the label.
    expect(r.label).not.toBe('the staging (again')
    expect(r.label).toBe(r.record)
    expect(r.label).toMatch(/is still wrong/)
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

// The lit band as a shelf (2026-09-01). Under research ecology v3 the studio ships one work per
// session and several a day; on 2026-09-01 three premieres wanted the same x at the axis end and
// two rows could not hold them — the bounds guard above fired and held the whole studio mirror shut.
// These fixtures walk the shelf through the shapes a v3 record takes, so the next such evening is
// proven here before the record produces it.
describe('the lit band as a shelf', () => {
  const ship = (n: number, date: string, slug: string) => ({
    collective_session: n,
    date,
    move: 'ship',
    summary: `Session ${n} shipped a work, and the record says so in one sentence.`,
    works: [slug],
  })
  const build = (chronicle: ReturnType<typeof ship>[], titles: Record<string, string>) =>
    buildSeasonModel({
      chronicle,
      metas: Object.fromEntries(Object.entries(titles).map(([slug, title]) => [slug, { title, medium: 'a live thing' }])),
      kills: [],
    })
  const poolsOf = (m: ReturnType<typeof buildSeasonModel>) =>
    m.marks.filter((k) => k.state === 'premiered' || k.state === 'withdrawn')
  const onTheFloor = (m: ReturnType<typeof buildSeasonModel>) => {
    for (const p of poolsOf(m)) {
      expect(p.x - p.rx, `${p.label} runs off the left`).toBeGreaterThanOrEqual(96)
      expect(p.x + p.rx, `${p.label} runs off the right`).toBeLessThanOrEqual(1344)
      expect(p.y - p.ry, `${p.label} above the curtain`).toBeGreaterThan(150)
      expect(p.y + p.ry, `${p.label} into the struck band`).toBeLessThan(542)
    }
  }
  const apart = (m: ReturnType<typeof buildSeasonModel>) => {
    const pools = poolsOf(m)
    for (let i = 0; i < pools.length; i++) {
      for (let j = i + 1; j < pools.length; j++) {
        const a = pools[i]
        const b = pools[j]
        const overlapX = Math.abs(a.x - b.x) < a.rx + b.rx
        const overlapY = Math.abs(a.y - b.y) < a.ry + b.ry
        expect(overlapX && overlapY, `${a.label} overlaps ${b.label}`).toBe(false)
      }
    }
  }
  /** the six premieres of the summer, in the shape of the record */
  const summer = [
    ship(1, '2026-07-13', 'native-speaker'),
    ship(4, '2026-07-17', 'no-way-of-knowing'),
    ship(9, '2026-07-21', 'recovery'),
    ship(12, '2026-07-23', 'one-tap'),
    ship(20, '2026-07-30', 'no-part'),
    ship(60, '2026-08-15', 'still-dark'),
  ]
  const summerTitles = {
    'native-speaker': 'Native Speaker',
    'no-way-of-knowing': 'No Way of Knowing',
    recovery: 'Recovery',
    'one-tap': 'One Tap',
    'no-part': 'No Part',
    'still-dark': 'Still Dark',
  }

  it('holds three premieres on one evening at the season’s end — none off the floor, none over another', () => {
    const m = build(
      [...summer, ship(117, '2026-08-31', 'come-in'), ship(118, '2026-09-01', 'not-yet'), ship(119, '2026-09-01', 'all-at-once'), ship(120, '2026-09-01', 'one-knock-each')],
      { ...summerTitles, 'come-in': 'Come In', 'not-yet': 'Not Yet', 'all-at-once': 'All at Once', 'one-knock-each': 'One Knock Each' },
    )
    expect(poolsOf(m)).toHaveLength(10)
    // the full face still holds this record — no step down for four works in two evenings
    expect(m.lettering).toBe(1)
    onTheFloor(m)
    apart(m)
    // the widest pool of the last evening stands at its own evening, against the wall
    const widest = poolsOf(m).find((p) => p.label === 'ONE KNOCK EACH')!
    expect(widest.x + widest.rx).toBeCloseTo(1304, 0)
  })

  it('ends the axis where the widest title of the last evening still fits inside the floor', () => {
    const m = build(
      [...summer, ship(121, '2026-09-01', 'long')],
      { ...summerTitles, long: 'The longest title this house has ever lit' },
    )
    const long = poolsOf(m).find((p) => p.label.startsWith('THE LONGEST'))!
    expect(long.rx).toBeGreaterThan(250)
    expect(long.x + long.rx).toBeLessThanOrEqual(1344)
    onTheFloor(m)
    apart(m)
  })

  it('opens a row only when the row before would push a pool far off its evening', () => {
    // three premieres a month apart stand on the top row alone
    const m = build(
      [ship(1, '2026-06-01', 'a'), ship(2, '2026-07-01', 'b'), ship(3, '2026-08-01', 'c')],
      { a: 'One', b: 'Two', c: 'Three' },
    )
    for (const p of poolsOf(m)) expect(Math.abs(p.y - 248)).toBeLessThanOrEqual(14)
    // …and the summer record, which two rows held before the third existed, still uses two
    const rows = new Set(poolsOf(build(summer, summerTitles)).map((p) => Math.round((p.y - 248) / 104)))
    expect(rows.size).toBeLessThanOrEqual(2)
  })

  it('steps the lettering down when three rows cannot hold the season, and says so on the svg', () => {
    const chronicle: ReturnType<typeof ship>[] = []
    const titles: Record<string, string> = {}
    for (let i = 0; i < 18; i++) {
      const day = String(1 + i).padStart(2, '0')
      chronicle.push(ship(100 + i, `2026-09-${day}`, `w${day}`))
      titles[`w${day}`] = `Twelve chars ${day}`.slice(0, 12).padEnd(12, 'x')
    }
    const m = build(chronicle, titles)
    expect(m.lettering).toBeGreaterThan(1)
    expect(buildSeasonFloorSvg(m)).toContain(`data-lettering="${m.lettering}"`)
    // the pools narrowed with the face — every one is below the full-face width of a twelve-letter title
    for (const p of poolsOf(m)) expect(p.rx).toBeLessThan(26 + 12 * 5.9)
    onTheFloor(m)
    apart(m)
    // …and a record the full face holds is drawn at the full face, on the svg too
    expect(buildSeasonFloorSvg(build(summer, summerTitles))).toContain('data-lettering="1"')
  })

  it('fails loud, never quietly: a season no lettering can hold throws', () => {
    const chronicle: ReturnType<typeof ship>[] = []
    const titles: Record<string, string> = {}
    for (let i = 0; i < 40; i++) {
      chronicle.push(ship(200 + i, `2026-09-0${1 + (i % 3)}`, `k${i}`))
      titles[`k${i}`] = `A twenty letter name ${i}`
    }
    expect(() => build(chronicle, titles)).toThrow(/the lit band is full/)
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
