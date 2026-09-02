// src/lib/studio/season.ts — "The floor keeps every mark": the whole season of the house on ONE
// stage floor, derived from committed data alone.
//
// The Studio's own grammar (ADR 0010) says the floor keeps every strike. This generator takes that
// at its word and extends it to every OUTCOME the house has produced, because a strike is not the
// only thing the floor remembers:
//
//   · a PREMIERE is a lit position — a hard-edged pool with the work's title in Didone capitals
//     (hard-edged on purpose: Frank rejected the soft gradient in 2026-07-16, "hässlicher gold
//     glow", and the plotted light stayed);
//   · a STRIKE is a taped X with its verbatim reason;
//   · a RETURN is the human eye sending a work back — a violet arc curving off the public side of
//     the floor and down into the production area, one per return, numbered in Roman;
//   · a WITHDRAWAL is a struck spotlight: the pool stays on the floor, unlit, with an X drawn
//     THROUGH it. Not an error state and never a warning red — the house withdrew One Tap itself,
//     in writing, after the eye rejected three stagings. That is a completed honest act, and the
//     floor keeps it in the house's own curtain colour.
//
// Time runs left to right (a season does), and the vertical axis is the stage's own depth: the lit
// positions play downstage under the curtain line, the struck positions sit further back on the
// dark floor, and the production area is the band at the upstage edge that a returned work goes
// back into.
//
// Pure and deterministic, the same contract as stage.ts and score.ts: same inputs ⇒ byte-identical
// output, no clock reads, no Math.random. Every position is derived (dataviz/geometry.ts: FNV-1a
// hash → offset → fixed-iteration relaxation), so a rebuild is never a re-layout and a diff of the
// built figure shows real data changes only.
//
// NOTHING here invents a fact. Titles, dates and the WITHDRAWN state come from the works' own
// meta.json; strike reasons and their sources come from the curated kill list verbatim; returns are
// found by matching the chronicle's own sentences (see RETURN_PATTERNS) and the quoted fragment is
// carried through unedited or not at all.

import { bandScale, escapeXml, hash01, relaxOverlaps } from '@/lib/dataviz/geometry'
import { roman } from './stage'

// ---------------------------------------------------------------- inputs (injected, not imported)

export interface SeasonChronicleEntry {
  collective_session: number | null
  date: string
  move: string
  summary: string
  works: string[]
}

export interface SeasonWorkMeta {
  title?: string
  date?: string
  medium?: string
}

export interface SeasonKill {
  name: string
  session: string
  /** verbatim quote from the session commit — never summarised */
  reason: string
  source: string
}

export interface SeasonInput {
  chronicle: readonly SeasonChronicleEntry[]
  /** work slug → its committed meta.json */
  metas: Record<string, SeasonWorkMeta>
  kills: readonly SeasonKill[]
}

// ---------------------------------------------------------------- model

export type SeasonState = 'premiered' | 'withdrawn' | 'struck' | 'returned'

export interface SeasonMark {
  /** stable, slug-shaped-ish key: "<state>:<slug>" (returns add ":<ordinal>") */
  key: string
  state: SeasonState
  /** what the mark is called on the floor — a work title in Didone capitals, or a killed name */
  label: string
  date: string
  /** "S31" — the session that produced this mark, or '' when the record does not carry one */
  session: string
  /** the verbatim record behind the mark: a kill reason, a withdrawal note, a return's own words */
  record: string
  /** where that record comes from, named to the file */
  source: string
  /** false when the mark's date had to be taken from the season's opening rather than its own
   *  session — an honest gap, marked, never quietly bridged */
  dateKnown: boolean
  x: number
  y: number
  /** pool half-width (lit and withdrawn positions) or mark radius (strikes, returns) */
  rx: number
  ry: number
  /** returns only: the work whose pool the arc leaves */
  ofWork?: string
  /** returns only: 1, 2, 3 … in the order the chronicle records them */
  ordinal?: number
}

export interface SeasonModel {
  marks: SeasonMark[]
  /** state → how many marks carry it (drives the legend counts) */
  counts: Record<SeasonState, number>
  firstDate: string
  lastDate: string
  width: number
  height: number
  /** every path this model read, for the figure's own provenance line */
  provenance: string[]
  /** the title lettering the lit band could afford: 1 is the full face, 2 and 3 the two denser
   *  steps studio-stage.css matches through `data-lettering` on the svg (see LETTERING) */
  lettering: 1 | 2 | 3
}

// ---------------------------------------------------------------- geometry constants
// The floor is the drawing's whole subject, so it gets the whole frame; the composition is
// deliberately asymmetric (the season crowds at its opening, where five of the seven strikes fell
// on the first two evenings) rather than evened out into a false rhythm.
const W = 1440
// 884, not the 780 of 2026-07-31: the lit band gained a third row on 2026-09-01 (see the shelf
// below), and everything upstage of it — the struck band, the production area, the floor's own
// edge — moved down by that row's 104px rather than crowding what was already there.
const H = 884
const FLOOR = { x0: 96, y0: 150, x1: 1344, y1: 810 }
const AXIS = { x0: 214, x1: 1248 }
/** lit positions play downstage, just under the curtain line: three rows, this the middle one */
const LIT_Y = 352
/** the rows are 104px apart — more than the 72px two pool edges need, jitter included */
const LIT_ROW_GAP = 104
const LIT_ROWS = 3
const LIT_ROW_Y = [LIT_Y - LIT_ROW_GAP, LIT_Y, LIT_Y + LIT_ROW_GAP]
/** the lit band's two walls: 40px inside the floor's edge on either side */
const LIT_WALL = { min: FLOOR.x0 + 40, max: FLOOR.x1 - 40 }
/** struck positions sit further back, on the dark part of the floor */
const STRUCK_Y = 616
const STRUCK_JITTER = 74
/** the production area: the upstage band a returned work goes back into */
const PROD_Y = 748

const POOL_RY = 36
const STRIKE_R = 30
/** Clearance between two pools, so two names never letter into each other. */
const POOL_GAP = 18
/** A pool keeps a hashed offset inside its row (never more than half the 32px of slack), so the
 *  band still reads as a scatter rather than as three ruled rows. */
const LIT_ROW_JITTER = 14
/** How far a row may push a pool off its own evening before the shelf opens the next row instead:
 *  about one pool's width. Below it, sliding along the row keeps the band compact; above it, the
 *  pool would stand a fortnight from its date to save a row nobody needed saved. */
const OPEN_ROW_COST = 150
/** The title lettering, full face first. When three rows cannot hold the season at one step the
 *  layout is tried at the next; studio-stage.css sets the matching font size off `data-lettering`
 *  on the svg, so the face and the pool shrink together and a title never spills its pool. */
const LETTERING = [1, 0.85, 0.72] as const
/** the top edge of the lamp the light hangs from — the highest thing on the stage, and therefore
 *  the lowest a crop window's top edge may sit if the fragment is still to read as a stage */
const LAMP_TOP = FLOOR.y0 - 28

/** Didone capitals, measured against the glyph widths this figure actually uses at the full face:
 *  a pool is as wide as the name it lights, never a fixed box a long title spills out of. At a
 *  denser lettering step the pool narrows with the face. */
const poolRx = (label: string, lettering = 1) => Math.max(52, 26 + label.length * 5.9) * lettering

// ---------------------------------------------------------------- return derivation
//
// A return is not a field in any committed file — the chronicle states it in prose, in the two
// forms the collective has actually used. So it is matched, not assumed, and the match is the
// evidence: RETURN_PATTERNS finds exactly the three returns of One Tap across 53 sessions and
// nothing else (season.test.ts holds that count, so a fourth return appearing upstream shows up as
// a changed figure rather than a silent miss).
const RETURN_PATTERNS = (title: string): RegExp[] => [
  new RegExp(`the human eye returned ${escapeRe(title)}`, 'i'),
  new RegExp(`${escapeRe(title)} returned by the human eye`, 'i'),
]

function escapeRe(s: string): string {
  return s.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')
}

/** The record for a return, verbatim: the sentence the match sits in, plus the sentence AFTER it
 *  when that one carries the quotation the first only announces — which is how this collective
 *  actually writes a return up ("The human eye returned One Tap a second time. Frank played the
 *  premiered restage and returned it — …"). ". " is the only boundary this looks for (the
 *  chronicle's own prose style); this is deliberately not a general sentence tokenizer, because an
 *  over-long record is honest and a re-flowed one is not. */
function recordAround(summary: string, re: RegExp): string {
  const at = summary.search(re)
  if (at < 0) return summary
  const start = summary.lastIndexOf('. ', at)
  const from = start < 0 ? 0 : start + 2
  const firstEnd = summary.indexOf('. ', at)
  if (firstEnd < 0) return summary.slice(from).trim()
  let to = firstEnd + 1
  if (!carriesTheSaying(summary.slice(from, to))) {
    const secondEnd = summary.indexOf('. ', to + 1)
    const next = summary.slice(to, secondEnd < 0 ? summary.length : secondEnd + 1)
    if (carriesTheSaying(next)) to = secondEnd < 0 ? summary.length : secondEnd + 1
  }
  return summary.slice(from, to).trim()
}

/** The marker the studio writes where it has withheld the architect's own wording (privacy rule of
 *  2026-08-15, in its chronicle from 2026-08-16). Kept in step with dossier.ts, which carries the
 *  same three helpers over the same committed entries. */
const PRIVATE_MARKER = /wording private/i

/** Does this sentence carry WHAT WAS SAID — as a quotation, or as a paraphrase the record marks as
 *  standing in for withheld wording? Without the second case the record for One Tap's second
 *  return stops at "The human eye returned One Tap a second time." and announces a verdict without
 *  carrying it. */
const carriesTheSaying = (s: string) => /[“"]/.test(s) || PRIVATE_MARKER.test(s)

/** The quoted fragment inside a record — the eye's own words, when the record carries them. All
 *  three pairings occur in the committed chronicle (S43 uses “…”, S32 uses "…", S28 uses '…'), so
 *  each is tried in that order with a NON-greedy body that cannot run past its own closing mark.
 *  Returns '' when there is nothing quoted to find: the caller then keeps the whole sentence, and
 *  nothing is ever invented to fill the gap. */
function quotedFragment(text: string): string {
  if (PRIVATE_MARKER.test(text)) return ''
  for (const re of [/“([^”]{8,}?)”/, /"([^"]{8,}?)"/, /'([^']{8,}?)'/]) {
    const m = re.exec(text)
    if (m) return m[1]
  }
  return ''
}

/** THE SHORT NAMING OF WHAT A RETURN SAID — the mark's label on the floor's hover readout.
 *
 *  Until 2026-08-16 this was simply the eye's quoted words, and the fallback (`|| record`) was a
 *  path the committed data never took. The privacy rule took the quotation marks out of the
 *  chronicle, every return fell through to that fallback at once, and two of the three labels
 *  became a whole 330-character sentence about an entire evening.
 *
 *  So where the record marks the wording as withheld, the label is the paraphrase the record puts
 *  in its place. That paraphrase is this house's own writing, not the architect's — which is the
 *  point of the rule — and it is a byte-exact span of the mirror, which is what the figure's
 *  honesty test requires of every label. Nothing here is authored: both branches quote the
 *  committed file, and where neither matches the caller still falls back to the whole record. */
function saidFragment(text: string): string {
  const quoted = quotedFragment(text)
  if (quoted) return quoted
  const m = /wording private\s*[—–-]\s*([^)]{8,})\)/i.exec(text)
  if (!m) return ''
  const said = m[1].trim()
  // The capture stops at the FIRST ')', so a paraphrase carrying its own parenthetical would be
  // cut mid-clause and then printed on a public figure as though it were whole — and it would sit
  // inside every length bound a test could reasonably set, so nothing downstream would notice. A
  // span that opens a bracket it never closes is not a whole saying; a span that has swallowed a
  // second withheld passage is not one either. Both fall back to the record, which is long and
  // obviously the record, rather than publishing a truncation that reads like a sentence.
  // (2026-08-17, after a hostile reading found the nested-parenthesis case.)
  if (said.includes('(') || PRIVATE_MARKER.test(said)) return ''
  return said
}

// ---------------------------------------------------------------- builder

const PROV = [
  'src/data/studio/chronicle.curated.json',
  'src/data/studio/chronicle.upstream.json',
  'src/content/studio/works/*/meta.json',
  'src/data/studio/stage.curated.json',
]

export function buildSeasonModel(input: SeasonInput): SeasonModel {
  const { chronicle, metas, kills } = input
  if (chronicle.length === 0) {
    throw new Error('buildSeasonModel: the chronicle mirror is empty — there is no season to draw')
  }

  const dates = [...chronicle.map((e) => e.date)].sort()
  const firstDate = dates[0]
  const lastDate = dates[dates.length - 1]

  const sessionDate = new Map<number, string>()
  for (const e of chronicle) {
    if (e.collective_session !== null && !sessionDate.has(e.collective_session)) {
      sessionDate.set(e.collective_session, e.date)
    }
  }

  const ts = (d: string) => Date.parse(`${d}T00:00:00Z`)

  // ——— premieres and withdrawals: one mark per shipped work ————————————————————
  // Drafted without a position first: where a pool stands depends on the axis, and where the axis
  // ends depends on the widest pool of the last evening (below), so the time scale is chosen once
  // all the lit drafts are known and then applied to every band alike.
  interface Draft extends Omit<SeasonMark, 'x' | 'y'> {
    x: number
    y: number
  }
  const lit: Draft[] = []
  const returns: Draft[] = []
  /** Works already given a position. A work can be shipped more than once — the practice revises a
   *  premiered work and records the revision as the ship it is — but the floor draws PREMIERES, so
   *  only the first ship opens a position. Without this, a re-shipped work got a second ellipse on
   *  the same coordinates, a duplicate `premiered:<slug>` key (which markIndex then collapsed, so
   *  one of the two marks could no longer be addressed at all) and its returns counted twice.
   *  dossier.ts keeps the first ship per slug in the same way. (2026-09-02.) */
  const positioned = new Set<string>()

  for (const e of chronicle) {
    if (e.move !== 'ship') continue
    const slug = e.works[0]
    if (!slug) continue
    const meta = metas[slug]
    if (!meta?.title) continue
    if (positioned.has(slug)) continue
    positioned.add(slug)
    const label = meta.title.toUpperCase()
    // The WITHDRAWN state is machine-readable in the work's own meta.json — the same test /studio's
    // hero already applies to pick the newest LIVE premiere.
    const withdrawn = /^WITHDRAWN\b/i.test(meta.medium ?? '')
    const state: SeasonState = withdrawn ? 'withdrawn' : 'premiered'
    lit.push({
      key: `${state}:${slug}`,
      state,
      label,
      date: e.date,
      session: e.collective_session === null ? '' : `S${e.collective_session}`,
      record: withdrawn ? (meta.medium ?? '') : e.summary,
      source: withdrawn
        ? `src/content/studio/works/${slug}/meta.json, verbatim`
        : 'chronicle mirror, verbatim',
      dateKnown: true,
      x: 0,
      y: LIT_Y,
      rx: poolRx(label),
      ry: POOL_RY,
    })

    // ——— the returns of this work, found in the chronicle's own sentences ————————
    let ordinal = 0
    for (const c of chronicle) {
      const hit = RETURN_PATTERNS(meta.title).find((re) => re.test(c.summary))
      if (!hit) continue
      ordinal += 1
      const record = recordAround(c.summary, hit)
      returns.push({
        key: `returned:${slug}:${ordinal}`,
        state: 'returned',
        label: saidFragment(record) || record,
        date: c.date,
        session: c.collective_session === null ? '' : `S${c.collective_session}`,
        record,
        source: 'chronicle mirror, verbatim',
        dateKnown: true,
        x: 0,
        y: PROD_Y,
        rx: STRIKE_R,
        ry: STRIKE_R,
        ofWork: slug,
        ordinal,
      })
    }
  }

  // ——— the time axis, and the lettering the lit band can afford ———————————————————
  //
  // The axis's END is not a constant. A premiere on the season's newest evening stands at the axis
  // end by definition, and a pool is as wide as its title — so with the end fixed at 1248, ONE KNOCK
  // EACH (109px each side) stood with a third of its name past the floor's edge on 2026-09-01. The
  // axis now stops where the widest pool dated on the last evening still fits inside the wall; on
  // every earlier evening that is the same 1248 it always was.
  //
  // The layout is tried at the full face first. Only when three rows cannot hold it at that size
  // does the lettering step down (LETTERING; the svg says which step on `data-lettering`, and the
  // stylesheet sets the face to match). A record that fits no step is the honest alarm this file has
  // always kept — the band is full, the figure needs a decision — and it throws rather than draw a
  // name over a name.
  const layoutAt = (step: 1 | 2 | 3) => {
    const scale = LETTERING[step - 1]
    const rx = (label: string) => poolRx(label, scale)
    const widestLastDay = Math.max(0, ...lit.filter((d) => d.date === lastDate).map((d) => rx(d.label)))
    const axisEnd = Math.min(AXIS.x1, LIT_WALL.max - widestLastDay)
    const x = bandScale([ts(firstDate), ts(lastDate)], [AXIS.x0, axisEnd])
    const shelved = shelveLit(
      lit.map((d) => ({
        key: d.key,
        date: d.date,
        rx: rx(d.label),
        wanted: Math.max(x(ts(d.date)), LIT_WALL.min + rx(d.label)),
      })),
    )
    return shelved ? { step, scale, x, shelved } : null
  }
  const layout = layoutAt(1) ?? layoutAt(2) ?? layoutAt(3)
  if (!layout) {
    throw new Error(
      `buildSeasonModel: the lit band is full — ${lit.length} premieres do not fit ${LIT_ROWS} rows ` +
        'even at the densest lettering; the floor needs a decision (season.ts, the shelf), not a quietly overlapping name',
    )
  }
  const { x } = layout
  for (const r of returns) r.x = x(ts(r.date))

  // ——— strikes: the curated kill list, dated through its session's evening ——————
  const struck: Draft[] = kills.map((k) => {
    const n = Number.parseInt(String(k.session).replace(/\D/g, ''), 10)
    const known = sessionDate.get(n)
    return {
      key: `struck:${slugify(k.name)}`,
      state: 'struck' as const,
      label: k.name,
      date: known ?? firstDate,
      session: k.session,
      record: k.reason,
      source: k.source,
      dateKnown: known !== undefined,
      x: x(ts(known ?? firstDate)),
      y: STRUCK_Y + (hash01(k.name) - 0.5) * 2 * STRUCK_JITTER,
      rx: STRIKE_R,
      ry: STRIKE_R,
    }
  })

  // ——— settle overlaps, band by band ————————————————————————————————————————————
  // Each band relaxes within itself: a pool never collides with an X because the two bands do not
  // meet, and keeping them apart means the time axis stays readable inside each band.
  //
  // `aspect` is what keeps the LETTERING apart, not just the glyphs. A struck position's name and
  // session letter sideways from its X, so its real footprint is far wider than it is tall; a
  // circular relaxation would happily stack two marks 90px apart vertically and let one name run
  // straight through the other's X (it did — five of the seven strikes fell on the first two
  // evenings, so they arrive at almost the same x). Relaxing in a horizontally compressed space
  // and expanding back models that wide footprint exactly, with no second algorithm.
  const settle = (drafts: Draft[], minY: number, maxY: number, r: number, gap: number, aspect = 1): Draft[] => {
    const relaxed = relaxOverlaps(
      drafts.map((d) => ({ key: d.key, x: d.x / aspect, y: d.y, r: r > 0 ? r : d.rx })),
      {
        gap,
        iterations: 24,
        bounds: { minX: (FLOOR.x0 + 40) / aspect, minY, maxX: (FLOOR.x1 - 40) / aspect, maxY },
      },
    )
    const at = new Map(relaxed.map((n) => [n.key, n]))
    return drafts.map((d) => ({
      ...d,
      x: round(at.get(d.key)!.x * aspect),
      y: round(at.get(d.key)!.y),
    }))
  }

  const marks: SeasonMark[] = [
    // pools carry their own width (the title sets it), so their footprint IS their rx — shelved,
    // not relaxed (see shelveLit), at the lettering the band could afford
    ...lit.map((d) => ({ ...d, rx: poolRx(d.label, layout.scale), ...layout.shelved.get(d.key)! })),
    // an X plus two lettered lines: ~68 wide, ~26 tall
    ...settle(struck, STRUCK_Y - STRUCK_JITTER, STRUCK_Y + STRUCK_JITTER, 26, 16, 2.6),
    // returns land on the production band itself — the arc carries only a Roman numeral, so their
    // footprint is the numeral, and their x spread is what keeps three journeys legible
    ...settle(returns, PROD_Y, PROD_Y, 26, 26),
  ]

  const counts: Record<SeasonState, number> = { premiered: 0, withdrawn: 0, struck: 0, returned: 0 }
  for (const m of marks) counts[m.state] += 1

  return { marks, counts, firstDate, lastDate, width: W, height: H, provenance: PROV, lettering: layout.step }
}

// ---------------------------------------------------------------- the lit band is shelved, not relaxed
//
// A relaxation pass settles marks that are ALMOST in place. It cannot answer "which of these rows
// does this pool belong on", because that is an assignment, and a pass of local pushes has no way
// to reach it: pushing a pool towards the row it should be on drives it through whatever already
// sits there, so the pass stops in the first arrangement where every push cancels out.
//
// The lit band asks exactly that question, and got the wrong answer on 2026-08-21. The pools are
// as wide as their names (up to 253px for NO WAY OF KNOWING) and the band is 1168px wide, so the
// six premieres then on the record needed 1145px of it — 98% — to stand in a single row. The
// chronicle reached a new day, the time axis compressed to fit it, and NATIVE SPEAKER, clamped
// against the left wall with nowhere left to go, came to rest 0.3px inside NO WAY OF KNOWING. The
// relaxation was not short of passes: at 24, 200 and 800 iterations it returns the byte-identical
// wrong answer, because that arrangement is a fixed point.
//
// So the pools are SHELVED: walked oldest first (the x axis is time, and a shelf fills left to
// right), each placed on the row where it stands closest to its own evening, and slid right only as
// far as the pool already on that row requires. Two rows held the record from 2026-08-21 to the end
// of that month. On 2026-09-01 the practice restarted under research ecology v3 and shipped four
// works in two evenings, three of them on one day — every one of them wanting the axis end, and
// two rows cannot hold three names at one x. The 2026-09-01 shelf (Frank's decision that evening,
// wording private: rebuild the floor for the v3 record rather than archive it) changes three things:
//
//   · THREE ROWS, opened lazily. A row is opened only when every open row would push the pool more
//     than OPEN_ROW_COST off its own evening — so a record that two rows hold well still stands on
//     two, and a season stretched to 2030 spreads along the rows rather than stacking three deep at
//     the axis start.
//   · THE WALL. When a row's natural place for a pool runs past the floor's edge, the pool stands
//     against the wall and the pools before it on that row yield leftward — in order, each only as
//     far as the next requires — so a pool may stand LEFT of its evening at the season's end, but
//     never off the floor and never over a name. Its date is lettered under it either way. A row
//     that would have to push its first pool past the LEFT wall is full and takes nothing.
//   · THE LETTERING STEPS (in buildSeasonModel): only when all three rows are full at the current
//     face does the whole layout retry with the titles a step smaller.
//
// What has not changed: the alarm. A record no step can hold throws, and season.test.ts holds every
// pool inside the floor and apart from every other — the figure fails loud, never overlaps quietly.

interface ShelfPool {
  key: string
  date: string
  rx: number
  /** where the pool wants to stand: its evening on the axis, already kept off the left wall */
  wanted: number
}

interface RowPool {
  key: string
  rx: number
  x: number
}

interface Placement {
  x: number
  /** how far this placement moves pools off their evenings — the new one and any it makes yield */
  cost: number
  /** earlier pools on the row that yield leftward to make room, by index */
  shifts: { at: number; x: number }[]
}

/** Where a row would take this pool, or null when it cannot without a name running off the floor. */
function placeOnRow(row: readonly RowPool[], d: ShelfPool): Placement | null {
  const last = row[row.length - 1]
  const natural = last ? Math.max(d.wanted, last.x + last.rx + POOL_GAP + d.rx) : d.wanted
  if (natural + d.rx <= LIT_WALL.max) return { x: natural, cost: natural - d.wanted, shifts: [] }
  // the wall: the pool stands against it, and the row yields leftward behind it
  const x = LIT_WALL.max - d.rx
  const shifts: { at: number; x: number }[] = []
  let cost = Math.abs(d.wanted - x)
  let edge = x - d.rx - POOL_GAP
  for (let i = row.length - 1; i >= 0; i--) {
    const p = row[i]
    if (p.x + p.rx <= edge) break
    const nx = edge - p.rx
    if (nx - p.rx < LIT_WALL.min) return null
    shifts.push({ at: i, x: nx })
    cost += p.x - nx
    edge = nx - p.rx - POOL_GAP
  }
  return { x, cost, shifts }
}

/** The shelf: every pool's place on the lit band, or null when LIT_ROWS rows cannot hold them at
 *  this lettering. Deterministic — same pools in, same map out; the key breaks a same-day tie, so
 *  the walk is a total order and never depends on the chronicle's own row order. */
function shelveLit(pools: readonly ShelfPool[]): Map<string, { x: number; y: number }> | null {
  const rows: RowPool[][] = []
  const oldestFirst = [...pools].sort((a, b) =>
    a.date === b.date ? a.key.localeCompare(b.key) : a.date < b.date ? -1 : 1,
  )
  for (const d of oldestFirst) {
    let best: { row: number; cost: number; placed: Placement } | null = null
    // every open row, and — while one is still free — the option of opening the next
    const options = Math.min(rows.length + 1, LIT_ROWS)
    for (let r = 0; r < options; r++) {
      const placed = placeOnRow(rows[r] ?? [], d)
      if (!placed) continue
      // opening a row costs a fixed OPEN_ROW_COST, so an open row that displaces the pool less
      // than that always wins; ties go to the row above (strict <, rows walked top down)
      const cost = r === rows.length ? OPEN_ROW_COST : placed.cost
      if (!best || cost < best.cost) best = { row: r, cost, placed }
    }
    if (!best) return null
    if (best.row === rows.length) rows.push([])
    const row = rows[best.row]
    for (const shift of best.placed.shifts) row[shift.at].x = shift.x
    row.push({ key: d.key, rx: d.rx, x: best.placed.x })
  }
  const at = new Map<string, { x: number; y: number }>()
  rows.forEach((row, r) => {
    for (const p of row) {
      at.set(p.key, { x: round(p.x), y: round(LIT_ROW_Y[r] + (hash01(p.key) - 0.5) * 2 * LIT_ROW_JITTER) })
    }
  })
  return at
}

const round = (n: number) => Math.round(n * 10) / 10

function slugify(s: string): string {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
}

/** Chronological order for the detail panel's prev/next stepping — date first, then the state
 *  order the evening itself runs in (a work is premiered before it can be returned or withdrawn),
 *  then the key, so the sequence is total and stable. */
const STATE_ORDER: Record<SeasonState, number> = { struck: 0, premiered: 1, returned: 2, withdrawn: 3 }

export function seasonOrder(marks: readonly SeasonMark[]): SeasonMark[] {
  return [...marks].sort(
    (a, b) =>
      a.date.localeCompare(b.date) || STATE_ORDER[a.state] - STATE_ORDER[b.state] || a.key.localeCompare(b.key),
  )
}

// ---------------------------------------------------------------- SVG

export interface SeasonRenderOptions {
  /** states drawn at full strength; empty or absent means every state is on (the resting state) */
  filter?: string[]
  /** mark keys drawn de-emphasized without being removed */
  dim?: string[]
  /** one mark key drawn as chosen */
  select?: string
  /** free call-outs lettered beside the marks they name */
  annotate?: { key: string; text: string }[]
  /** crops the viewBox around one mark — how a tour scene gets its own build-time still from this
   *  same builder rather than a second, drifting generator */
  cropTo?: string
  /**
   * The size of the window `cropTo` opens, in the figure's own units. The default window is sized
   * for a tour scene standing beside a reading column (1040 wide, the whole stage below the lamp
   * bar); a THUMBNAIL cropped that wide renders the house's Didone titles at about five pixels,
   * which is a picture of a stage rather than a stage anyone can read. A caller that needs a
   * tighter window says so here and the crop centres on the mark in both axes, clamped to the
   * floor. Opt-in: absent keeps the tour's crop byte-identical.
   */
  cropBox?: { width: number; height: number }
  /** a still carries no focus/hover hooks: no tabindex, no per-mark data keys to bind to */
  still?: boolean
  /** accessible name for the figure */
  label?: string
  /** the season's own strapline, lettered on the curtain bar */
  headline?: string
  /** the production band's label */
  productionLabel?: string
}

/** Builds the season floor as one SVG string. Appearance lives entirely in studio-stage.css under
 *  `.studio-surface` (ADR 0010); this function emits classes and geometry, never a colour. */
export function buildSeasonFloorSvg(model: SeasonModel, opts: SeasonRenderOptions = {}): string {
  const on = (m: SeasonMark) => !opts.filter?.length || opts.filter.includes(m.state)
  const dimmed = (m: SeasonMark) => opts.dim?.includes(m.key) ?? false
  const annotations = new Map((opts.annotate ?? []).map((a) => [a.key, a.text]))

  const view = cropView(model, opts.cropTo, opts.cropBox)
  const s: string[] = []
  s.push(
    `<svg class="st-sf" viewBox="${view}" role="img" preserveAspectRatio="xMidYMid meet"` +
      ` data-lettering="${model.lettering}" aria-label="${escapeXml(opts.label ?? defaultLabel(model))}">`,
  )

  // the floor, the curtain line, and the lamp bar the light hangs from
  s.push(`<rect class="st-sf-floor" x="${FLOOR.x0}" y="${FLOOR.y0}" width="${FLOOR.x1 - FLOOR.x0}" height="${FLOOR.y1 - FLOOR.y0}"/>`)
  s.push(`<path class="st-sf-curtain" d="M${FLOOR.x0} ${FLOOR.y0} H${FLOOR.x1}"/>`)
  s.push(`<path class="st-sf-bar" d="M${FLOOR.x0} ${FLOOR.y0 - 22} H${FLOOR.x1}"/>`)
  if (opts.headline) {
    s.push(`<text class="st-sf-headline" x="${FLOOR.x0}" y="${FLOOR.y0 - 34}">${escapeXml(opts.headline)}</text>`)
  }

  // the production area — the upstage band a returned work goes back into
  s.push(`<path class="st-sf-prod" d="M${FLOOR.x0 + 24} ${PROD_Y + 26} H${FLOOR.x1 - 24}"/>`)
  s.push(
    `<text class="st-sf-prod-label" x="${FLOOR.x0 + 24}" y="${PROD_Y + 46}">` +
      `${escapeXml(opts.productionLabel ?? 'THE PRODUCTION AREA')}</text>`,
  )

  // The season's own time axis is the floor's downstage edge itself — two ticks on it, and only the
  // two dates the data actually carries (an invented month grid would be a claim about evenings the
  // house never played). The dates letter at the TOP, where the axis starts, so the upstage edge
  // stays free for the production band's own label.
  s.push(`<path class="st-sf-axis" d="M${AXIS.x0} ${FLOOR.y1 - 7} V${FLOOR.y1 + 7} M${AXIS.x1} ${FLOOR.y1 - 7} V${FLOOR.y1 + 7}"/>`)
  s.push(`<text class="st-sf-tick" x="${FLOOR.x0 + 10}" y="${FLOOR.y0 + 20}">${escapeXml(model.firstDate)}</text>`)
  s.push(
    `<text class="st-sf-tick" x="${FLOOR.x1 - 10}" y="${FLOOR.y0 + 20}" text-anchor="end">${escapeXml(model.lastDate)}</text>`,
  )

  // returns first, so an arc never draws over the pool it leaves
  for (const m of model.marks.filter((k) => k.state === 'returned')) {
    s.push(returnArc(m, model, { on: on(m), dim: dimmed(m), sel: opts.select === m.key, still: opts.still }))
  }
  for (const m of model.marks.filter((k) => k.state === 'struck')) {
    s.push(strikeMark(m, { on: on(m), dim: dimmed(m), sel: opts.select === m.key, still: opts.still }))
  }
  for (const m of model.marks.filter((k) => k.state === 'premiered' || k.state === 'withdrawn')) {
    s.push(litMark(m, { on: on(m), dim: dimmed(m), sel: opts.select === m.key, still: opts.still }))
  }

  for (const [key, text] of annotations) {
    const m = model.marks.find((k) => k.key === key)
    if (!m) continue
    s.push(
      `<g class="st-sf-note"><path d="M${m.x} ${m.y + m.ry + 6} V${m.y + m.ry + 26}"/>` +
        `<text x="${m.x}" y="${m.y + m.ry + 42}" text-anchor="middle">${escapeXml(text)}</text></g>`,
    )
  }

  s.push('</svg>')
  return s.join('\n')
}

interface MarkFlags {
  on: boolean
  dim: boolean
  sel: boolean
  still?: boolean
}

/** The shared per-mark attribute block: the state is a data attribute so the stylesheet paints it
 *  and the client script re-keys focus by toggling attributes — never by rewriting the SVG. */
function markAttrs(m: SeasonMark, f: MarkFlags, cls: string): string {
  const parts = [`class="${cls}"`, `data-state="${m.state}"`]
  if (f.on) parts.push('data-on=""')
  if (f.dim) parts.push('data-dim=""')
  if (f.sel) parts.push('data-sel=""')
  if (!f.still) {
    parts.push(`data-key="${escapeXml(m.key)}"`, 'tabindex="0"', 'role="button"')
  }
  return parts.join(' ')
}

/** A lit position: the lamp on the bar, its two beam hairlines, the hard-edged pool, the title in
 *  Didone capitals, and the taped blocking corners. A withdrawn one keeps ALL of it and adds the X
 *  through the pool — the light is struck, the position stays on the floor. */
function litMark(m: SeasonMark, f: MarkFlags): string {
  const w = m.state === 'withdrawn'
  const g: string[] = []
  g.push(`<g ${markAttrs(m, f, 'st-sf-lit')}>`)
  g.push(`<rect class="st-sf-lamp" x="${round(m.x - 7)}" y="${FLOOR.y0 - 28}" width="14" height="8"/>`)
  g.push(`<path class="st-sf-beam" d="M${round(m.x - 5)} ${FLOOR.y0 - 20} L${round(m.x - m.rx)} ${round(m.y)}"/>`)
  g.push(`<path class="st-sf-beam" d="M${round(m.x + 5)} ${FLOOR.y0 - 20} L${round(m.x + m.rx)} ${round(m.y)}"/>`)
  g.push(
    `<ellipse class="${w ? 'st-sf-pool st-sf-withdrawn' : 'st-sf-pool'}" cx="${m.x}" cy="${m.y}"` +
      ` rx="${m.rx}" ry="${m.ry}"/>`,
  )
  // blocking tape: the position on the floor, kept whether or not the light is on
  for (const [dx, dy] of [
    [-1, -1],
    [1, -1],
    [-1, 1],
    [1, 1],
  ] as const) {
    const cx = round(m.x + dx * (m.rx + 16))
    const cy = round(m.y + dy * (m.ry + 14))
    g.push(`<path class="st-sf-tape" d="M${cx} ${round(cy - dy * 11)} V${cy} H${round(cx - dx * 14)}"/>`)
  }
  g.push(
    `<text class="st-sf-title" x="${m.x}" y="${round(m.y + 5)}" text-anchor="middle">${escapeXml(m.label)}</text>`,
  )
  g.push(
    `<text class="st-sf-litmeta" x="${m.x}" y="${round(m.y + m.ry + 16)}" text-anchor="middle">` +
      `${escapeXml(`${m.session ? m.session + ' · ' : ''}${m.date}`)}</text>`,
  )
  if (w) {
    // the strike THROUGH the pool — the one mark that says the light was taken away
    g.push(
      `<path class="st-sf-x st-sf-x-through" d="M${round(m.x - m.rx * 0.82)} ${round(m.y - m.ry * 0.9)}` +
        ` L${round(m.x + m.rx * 0.82)} ${round(m.y + m.ry * 0.9)}` +
        ` M${round(m.x + m.rx * 0.82)} ${round(m.y - m.ry * 0.9)}` +
        ` L${round(m.x - m.rx * 0.82)} ${round(m.y + m.ry * 0.9)}"/>`,
    )
  }
  // The hit target, last so it sits on top: the group's own bounding box reaches from the lamp on
  // the bar all the way down to the pool, so its geometric centre is empty air between two 1px
  // beams — a pointer aimed at "the position" would miss it. The pool plus a little margin is what
  // a visitor is actually aiming at.
  g.push(`<ellipse class="st-sf-hit" cx="${m.x}" cy="${m.y}" rx="${round(m.rx + 8)}" ry="${round(m.ry + 8)}"/>`)
  g.push(`<title>${escapeXml(hoverText(m))}</title></g>`)
  return g.join('')
}

/** A struck position: the taped X the studio's grammar already uses, with its name and session
 *  lettered beside it and the verbatim reason on hover. */
function strikeMark(m: SeasonMark, f: MarkFlags): string {
  const left = m.x > FLOOR.x1 - 220
  const lx = round(left ? m.x - 15 : m.x + 15)
  const anchor = left ? ' text-anchor="end"' : ''
  return (
    `<g ${markAttrs(m, f, 'st-sf-strike')}>` +
    `<path class="st-sf-x" d="M${round(m.x - 10)} ${round(m.y - 10)} L${round(m.x + 10)} ${round(m.y + 10)}` +
    ` M${round(m.x + 10)} ${round(m.y - 10)} L${round(m.x - 10)} ${round(m.y + 10)}"/>` +
    `<text class="st-sf-strike-n" x="${lx}" y="${round(m.y - 1)}"${anchor}>${escapeXml(m.label)}</text>` +
    `<text class="st-sf-strike-s" x="${lx}" y="${round(m.y + 13)}"${anchor}>` +
    `${escapeXml(`${m.session}${m.dateKnown ? ` · ${m.date}` : ' · evening not in the mirror'}`)}</text>` +
    // the hit target covers the X and its lettering, not just the 20px glyph
    `<rect class="st-sf-hit" x="${round(left ? m.x - 132 : m.x - 15)}" y="${round(m.y - 15)}" width="147" height="32"/>` +
    `<title>${escapeXml(hoverText(m))}</title></g>`
  )
}

/** A return: a violet arc leaving the work's own pool on the public side and curving back down
 *  into the production area, with its Roman ordinal at the landing.
 *
 *  A CUBIC, not a quadratic with a far-flung control point: the first version bowed each arc
 *  sideways by 120 + ordinal × 46 px and drew three enormous crossing teardrops (visible
 *  immediately in the first screenshot pass). The arcs already separate on their own, because each
 *  return lands at its own evening on the time axis — so the curve's only job is to leave the pool
 *  downward and arrive at the landing downward, which is what these two control points do. */
function returnArc(m: SeasonMark, model: SeasonModel, f: MarkFlags): string {
  const from = model.marks.find((k) => k.ofWork === undefined && k.key.endsWith(`:${m.ofWork}`))
  const sx = from ? from.x : m.x
  const sy = from ? from.y + from.ry : LIT_Y + POOL_RY
  const ty = m.y - 12
  const dy = ty - sy
  const d =
    `M${round(sx)} ${round(sy)} C${round(sx)} ${round(sy + dy * 0.55)} ` +
    `${round(m.x)} ${round(sy + dy * 0.78)} ${round(m.x)} ${round(ty)}`
  return (
    `<g ${markAttrs(m, f, 'st-sf-return')}>` +
    `<path class="st-sf-arc" d="${d}"/>` +
    `<path class="st-sf-arrow" d="M${round(m.x - 6)} ${round(m.y - 21)} L${round(m.x)} ${round(m.y - 11)}` +
    ` L${round(m.x + 6)} ${round(m.y - 21)}"/>` +
    `<text class="st-sf-ord" x="${m.x}" y="${round(m.y + 15)}" text-anchor="middle">` +
    `${escapeXml(roman(m.ordinal ?? 1))}</text>` +
    // hit target at the landing, on top of the marks so a pointer finds the arc without having to
    // land on a 2px stroke (dataviz interaction rule: the hit area is bigger than the mark)
    `<circle class="st-sf-hit" cx="${m.x}" cy="${round(m.y)}" r="20"/>` +
    `<title>${escapeXml(hoverText(m))}</title></g>`
  )
}

/** The native-title hover text — the readout the figure shows without any JavaScript at all. Its
 *  substance is the mark's verbatim record; the JS readout shows the same string. */
export function hoverText(m: SeasonMark): string {
  const head = `${m.label} — ${STATE_WORD[m.state]}${m.session ? `, ${m.session}` : ''} (${m.date})`
  return `${head}: ${m.record} [${m.source}]`
}

export const STATE_WORD: Record<SeasonState, string> = {
  premiered: 'premiered',
  withdrawn: 'premiered, then withdrawn',
  struck: 'struck',
  returned: 'returned by the human eye',
}

function defaultLabel(model: SeasonModel): string {
  const c = model.counts
  return (
    `The season on one floor, ${model.firstDate} to ${model.lastDate}: ${c.premiered} lit position` +
    `${c.premiered === 1 ? '' : 's'}, ${c.struck} taped strike${c.struck === 1 ? '' : 's'}, ` +
    `${c.returned} return${c.returned === 1 ? '' : 's'} curving back into production, and ` +
    `${c.withdrawn} struck spotlight${c.withdrawn === 1 ? '' : 's'}. The same record follows as a table.`
  )
}

/** The crop a tour scene renders its still from: a window around one mark, keeping the FULL height
 *  of the stage — curtain line, lamp bar and production band all in frame — so the still still
 *  reads as a stage rather than a detail of one. Landscape on purpose: the first version cropped to
 *  760 × 684, nearly square, and the stills rendered a full reading column tall. */
function cropView(model: SeasonModel, cropTo?: string, box?: { width: number; height: number }): string {
  if (!cropTo) return `0 0 ${W} ${H}`
  const m = model.marks.find((k) => k.key === cropTo)
  if (!m) return `0 0 ${W} ${H}`
  if (box) {
    // A named window: centred on the mark in both axes and clamped to the figure, so a window
    // larger than the stage simply becomes the stage rather than a viewBox reaching past it.
    //
    // The top edge is clamped once more, to the lamp the light hangs from: a window centred on a
    // mark that sits low on the floor would open BELOW the bar and the fragment would stop reading
    // as a stage — the one thing the hub's card claims about it. The rule was always the intent of
    // this crop (see the comment above) and was only ever satisfied by accident: it held while the
    // lit pools happened to sit high enough, and broke by 3.5px the first evening a sixth premiere
    // pushed the newest pool down (2026-08-15).
    const cw = Math.min(box.width, W)
    const ch = Math.min(box.height, H)
    const bx = Math.min(Math.max(m.x - cw / 2, 0), W - cw)
    const by = Math.min(Math.max(m.y - ch / 2, 0), H - ch, LAMP_TOP)
    return `${round(bx)} ${round(by)} ${round(cw)} ${round(ch)}`
  }
  const cw = 1040
  const x0 = Math.min(Math.max(m.x - cw / 2, 0), W - cw)
  return `${round(x0)} 104 ${cw} ${H - 104}`
}

// ---------------------------------------------------------------- the table floor

export interface SeasonRow {
  date: string
  work: string
  state: string
  reason: string
  source: string
  /** TableFallback.astro's rows are Record<string, string | number>; the named fields above are
   *  the contract, this keeps the row assignable to that shape without a cast at the call site */
  [column: string]: string
}

/** The season table's columns — here rather than in a component so the figure and whoever renders
 *  the record beside it (see SeasonFloor.astro's `withRecord`) cannot drift apart. Typed
 *  structurally to match components/dataviz/TableFallback.astro's TableColumn without importing an
 *  .astro module into a pure library. */
export const SEASON_COLUMNS: { key: string; label: string; nowrap?: boolean }[] = [
  { key: 'date', label: 'date', nowrap: true },
  { key: 'work', label: 'work' },
  { key: 'state', label: 'state', nowrap: true },
  { key: 'reason', label: 'reason (verbatim)' },
  { key: 'source', label: 'source' },
]

/** The figure's table rendition — nothing on this floor is reachable only by hovering an SVG mark.
 *  Chronological, verbatim, one row per mark. */
export function seasonRows(model: SeasonModel): SeasonRow[] {
  return seasonOrder(model.marks).map((m) => ({
    date: m.dateKnown ? m.date : `${m.date} (evening not in the mirror)`,
    work: m.ofWork ? `${m.label} — on ${m.ofWork}` : m.label,
    state: STATE_WORD[m.state],
    reason: m.record,
    source: m.source,
  }))
}
