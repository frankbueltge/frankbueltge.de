// The gallery's miniatures (visual layer, Phase 3c, 2026-09-02) — one per experiment on
// /experiments, each drawn AT BUILD TIME from the very file the experiment's own page reads.
//
// The rule this module exists to keep: a thumbnail on this shelf is never decoration. It is a
// miniature of the instrument — the same record, the same builder, a smaller box. Where an
// experiment has a figure, its own pure builder draws the miniature (round-number's histogram,
// praemie's year paths, spielraum's floor scale, invoked's histogram, balance's dumbbells, the
// ops room's spark/bar primitives). Where a record has no natural figure, the miniature draws
// the RECORD'S OWN SHAPE — the pages watched, the entries of the night, the slots a blocked
// publisher left hollow — and never a stand-in graphic. A hole in the record is drawn as a hole.
//
// Three constraints on what comes out of here:
//   · COLOUR-FREE. The model carries geometry and one boolean per mark ("this is the one the
//     reading is about"). src/styles/experiment-gallery.css inks them in the frame's mono; the
//     line's identity is carried by SHAPE, not by a hue, so no PALETTE record is needed.
//   · DETERMINISTIC. Same committed files ⇒ byte-identical model. Nothing reads the clock;
//     every coordinate is rounded once, here.
//   · BUILD-TIME ONLY. The frame (BestaendeIndex.astro) calls this and hands the finished
//     models to the island as props, so none of the data below is ever shipped to a browser.
//     The island imports the TYPES only.
import { readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

import { geoEquirectangular, geoPath } from 'd3-geo'
import { feature } from 'topojson-client'
import type { Topology } from 'topojson-specification'

import { GALLERY } from '@/config/gallery-wording'
import { bars as vizBars, linePath, type VizBox } from '@/lib/ops/viz'
import { bars as benfordBars } from '@/lib/round-number/histogram'
import { yearAreaPath, yearLinePath } from '@/lib/praemie/chart'
import { floorX, scaleX, type Domain } from '@/lib/spielraum/chart'
import { buildFigure as buildInvokedFigure, figureInput as invokedFigureInput } from '@/lib/invoked/figure'
import { buildFigure as buildBalanceFigure } from '@/lib/balance/figure'
import { AGENT_POS, EDGES } from '@/lib/society/layout'
import { getLatestTrending } from '@/lib/trending/data'
import type { InvokedData } from '@/lib/invoked/types'
import type { BalanceCountry } from '@/lib/balance/types'

import consensusData from '@/data/consensus/latest.json'
import ghostFleetData from '@/data/ghost-fleet/latest.json'
import redactionData from '@/data/redaction/latest.json'
import patternData from '@/data/pattern/latest.json'
import tellData from '@/data/tell/latest.json'
import roundNumberData from '@/data/round-number/latest.json'
import praemieData from '@/data/praemie/police.json'
import parallaxeData from '@/data/parallaxe/register.json'
import invokedData from '@/data/invoked/latest.json'
import balanceData from '@/data/balance/latest.json'
import revisionData from '@/data/revision/latest.json'
import spielraumData from '@/data/spielraum/register.json'
import ueberflugData from '@/data/ueberflug/densification.json'
import landTopology from '@/data/globe/land-110m.json'
import { LAYERS } from '@/lib/globe/layers'
import { buildLivingGlobe, frameAt } from '@/lib/globe/living'

/** The miniature's box. Wide and short on purpose: it sits above a card's title like a stave,
 *  and at this height no figure can pretend to be readable in detail — it is a signature. */
export const THUMB_BOX: VizBox = { width: 240, height: 72, pad: 6 }

/** One drawn thing. Every variant carries geometry and, at most, the flag `on` — "this mark is
 *  the one today's reading is about". No variant carries a colour, a font or a style. */
export type ThumbMark =
  | { t: 'bar'; x: number; y: number; w: number; h: number; on?: true }
  /** a slot the record left empty — drawn hollow, never as a zero */
  | { t: 'gap'; x: number; y: number; w: number; h: number }
  | { t: 'line'; d: string; on?: true }
  | { t: 'area'; d: string }
  | { t: 'dot'; x: number; y: number; r: number; on?: true }
  | { t: 'seg'; x1: number; y1: number; x2: number; y2: number; on?: true }
  /** a reference line the figure is measured against (a floor, a zero, an expectation) */
  | { t: 'rule'; x1: number; y1: number; x2: number; y2: number }

export interface Thumbnail {
  /** the experiment this draws — the id of src/data/werke.ts */
  id: string
  marks: ThumbMark[]
  /** what is on the axes, for the figure's accessible name */
  draws: string
  /** the reading of the day, composed from the record by the wording's own function */
  readout: string
  /** the committed file the drawing was read from */
  source: string
}

// ── rounding and formatting ───────────────────────────────────────────────────────────────
/** One decimal is all a 240-wide box can carry, and it keeps the server render byte-stable. */
const r1 = (n: number): number => Math.round(n * 10) / 10

const count = (n: number): string => new Intl.NumberFormat('en-GB').format(Math.round(n))
const decimal = (n: number, digits = 2): string =>
  new Intl.NumberFormat('en-GB', { minimumFractionDigits: digits, maximumFractionDigits: digits }).format(n)
const percent = (share: number): string =>
  new Intl.NumberFormat('en-GB', { style: 'percent', maximumFractionDigits: 0 }).format(share)

// ── shared primitives ─────────────────────────────────────────────────────────────────────
const { width: W, height: H, pad: P } = THUMB_BOX

/** Bars from the ops room's own primitive, mapped into the gallery's mark model. */
function barMarks(values: readonly number[], marked: ReadonlySet<number> = new Set()): ThumbMark[] {
  return vizBars(values, marked, THUMB_BOX).map((b) =>
    b.marked
      ? { t: 'bar' as const, x: b.x, y: b.y, w: b.width, h: b.height, on: true as const }
      : { t: 'bar' as const, x: b.x, y: b.y, w: b.width, h: b.height },
  )
}

/**
 * A row of slots, one per thing counted — the honest drawing for a record that is a LIST and not
 * a measurement. `marked` are the ones the reading is about; `hollow` are the ones the record
 * could not fill (a blocked page, a silent source), drawn as an outline so a hole in the record
 * stays visible as a hole. Deliberately uncapped, unlike the ops room's `cells`: this box is
 * two and a half times as wide, and a row of fifty is still countable in it.
 */
function slotRow(
  n: number,
  marked: ReadonlySet<number> = new Set(),
  hollow: ReadonlySet<number> = new Set(),
): ThumbMark[] {
  if (n <= 0) return []
  const slot = (W - 2 * P) / n
  const w = Math.max(1.2, r1(slot * 0.62))
  const tall = H - 2 * P
  const short = r1(tall * 0.55)
  return Array.from({ length: n }, (_, i) => {
    const x = r1(P + i * slot)
    if (hollow.has(i)) return { t: 'gap' as const, x, y: r1(H - P - tall), w, h: tall }
    const h = marked.has(i) ? tall : short
    const mark = { t: 'bar' as const, x, y: r1(H - P - h), w, h }
    return marked.has(i) ? { ...mark, on: true as const } : mark
  })
}

/** A line across the box from the ops room's spark primitive, peak-normalised to its own range. */
function lineMark(values: readonly number[], on = false): ThumbMark[] {
  const d = linePath(values, THUMB_BOX)
  if (!d) return []
  return [on ? { t: 'line', d, on: true } : { t: 'line', d }]
}

// ── one builder per experiment ────────────────────────────────────────────────────────────
// Each returns the marks; the readout and the provenance line travel beside them in THUMBNAILS.

/** Living Globe — the land of the committed geography, with the marks of the newest day the
 *  archive holds on it: one segment per vessel gone dark, one dot per satellite overhead, one
 *  filled dot per seat the planet's readings are published from. The same projection the plate on
 *  /globe uses, at a twentieth of the size, so the miniature is the figure and not a picture of
 *  one. Every coordinate is rounded once, here. */
function globeMarks(): ThumbMark[] {
  const topology = landTopology as unknown as Topology
  const projection = geoEquirectangular().fitExtent(
    [
      [P, P],
      [W - P, H - P],
    ],
    { type: 'Sphere' },
  )
  const path = geoPath(projection).digits(1)
  const marks: ThumbMark[] = []
  const land = path(feature(topology, topology.objects.land as never) as never)
  if (land) marks.push({ t: 'area', d: land })

  const model = buildLivingGlobe()
  const moment = frameAt(model, model.newest)
  for (const layer of LAYERS) {
    for (const record of moment.layers[layer.id].records) {
      if (Array.isArray(record.at)) {
        const xy = projection(record.at)
        if (!xy) continue
        const seat = record.labelKind === 'seat' || record.labelKind === 'station'
        const dot = { t: 'dot' as const, x: r1(xy[0]), y: r1(xy[1]), r: seat ? 1.2 : 0.6 }
        marks.push(seat ? { ...dot, on: true as const } : dot)
        continue
      }
      if ('from' in record.at) {
        const off = projection(record.at.from)
        const on = projection(record.at.to)
        if (!off || !on) continue
        marks.push({ t: 'seg', x1: r1(off[0]), y1: r1(off[1]), x2: r1(on[0]), y2: r1(on[1]) })
      }
    }
  }
  return marks
}

/** Consensus — the cascade of the day's phrase: outlets against the hours since the first one. */
function consensusMarks(): ThumbMark[] {
  const cascade = consensusData.headline.cascade as { at: string; domain: string }[]
  if (cascade.length < 2) return []
  const t0 = Date.parse(cascade[0]!.at)
  const t1 = Date.parse(cascade[cascade.length - 1]!.at)
  const span = t1 > t0 ? t1 - t0 : 1
  const x = (at: string) => r1(P + ((Date.parse(at) - t0) / span) * (W - 2 * P))
  const y = (i: number) => r1(H - P - ((i + 1) / cascade.length) * (H - 2 * P))
  // A step: an outlet does not fade in, it publishes. Horizontal to the hour, then vertical.
  let d = `M${x(cascade[0]!.at)} ${H - P}`
  for (const [i, entry] of cascade.entries()) {
    d += ` H${x(entry.at)} V${y(i)}`
  }
  d += ` H${W - P}`
  return [
    { t: 'rule', x1: P, y1: H - P, x2: W - P, y2: H - P },
    { t: 'line', d, on: true },
  ]
}

/** Ghost Fleet — hours gone dark, one bar per vessel in the window; the picked one marked. */
function ghostFleetMarks(): ThumbMark[] {
  const events = ghostFleetData.events as { id: string; duration_hours: number }[]
  const picked = events.findIndex((e) => e.id === ghostFleetData.pick)
  return barMarks(
    events.map((e) => e.duration_hours),
    new Set(picked >= 0 ? [picked] : []),
  )
}

/** Redaction — the watch list as slots: what changed, and what could not be verified at all. */
function redactionMarks(): ThumbMark[] {
  const watched = redactionData.watched_count
  const changed = Math.min(redactionData.changed_count, watched)
  const unverifiable = Math.min(redactionData.unverifiable.count, watched - changed)
  const marked = new Set(Array.from({ length: changed }, (_, i) => i))
  const hollow = new Set(Array.from({ length: unverifiable }, (_, i) => watched - 1 - i))
  return slotRow(watched, marked, hollow)
}

/** Round Number — the leading-digit histogram against Benford's expectation, the page's builder. */
function roundNumberMarks(): ThumbMark[] {
  const series = roundNumberData.series as {
    id: string
    name: string
    benford: { observed: number[]; expected: number[]; verdict: string; mad: number }
  }[]
  const picked = series.find((s) => s.id === roundNumberData.pick) ?? series[0]
  if (!picked) return []
  const digits = benfordBars(picked.benford.observed, picked.benford.expected)
  const marks = barMarks(digits.map((b) => b.obs))
  // The expectation as a stepped rule over the bars: what the observed is measured against.
  const slot = (W - 2 * P) / digits.length
  let d = ''
  digits.forEach((b, i) => {
    const y = r1(H - P - b.exp * (H - 2 * P))
    d += `${i === 0 ? 'M' : ' L'}${r1(P + i * slot)} ${y} L${r1(P + (i + 1) * slot)} ${y}`
  })
  return [...marks, { t: 'line', d }]
}

/** Pattern — the day's strongest pair, both series on their own scales over the days on file. */
function patternMarks(): ThumbMark[] {
  const a = patternData.headline.a_series as number[]
  const b = patternData.headline.b_series as number[]
  return [...lineMark(b), ...lineMark(a, true)]
}

/** Prämie — the premium index over the years of the record, the page's own year paths. */
function praemieMarks(): ThumbMark[] {
  const series = praemieData.premium.series as { year: number; index: number }[]
  if (series.length < 2) return []
  const years = series.map((p) => p.year)
  const valMax = Math.max(...series.map((p) => p.index))
  const points = series.map((p) => ({ year: p.year, value: p.index }))
  const xMin = Math.min(...years)
  const xMax = Math.max(...years)
  const area = yearAreaPath(points, xMin, xMax, valMax, W, H)
  const line = yearLinePath(points, xMin, xMax, valMax, W, H)
  const marks: ThumbMark[] = []
  if (area) marks.push({ t: 'area', d: area })
  if (line) marks.push({ t: 'line', d: line, on: true })
  return marks
}

/** Parallaxe — what each tracked topic leaves out, one bar per topic, the widest gap marked. */
function parallaxeMarks(): ThumbMark[] {
  const topics = parallaxeData.topics as unknown as { lemma: string; mean_omission: number }[]
  const values = topics.map((t) => t.mean_omission)
  const top = values.indexOf(Math.max(...values))
  return barMarks(values, new Set(top >= 0 ? [top] : []))
}

/** Überflug — the counted fleet across every observation the densification register holds. */
function ueberflugMarks(): ThumbMark[] {
  const series = ueberflugData.series as { date: string; fleet: number }[]
  return lineMark(series.map((s) => s.fleet), true)
}

/** Tell — the index of the marker words across the corpus years. */
function tellMarks(): ThumbMark[] {
  const index = tellData.index as { year: number; value: number }[]
  return lineMark(index.map((p) => p.value), true)
}

/** Invoked Past — the histogram of invoked years, the page's own builder in a smaller box. */
function invokedMarks(): ThumbMark[] {
  const figure = buildInvokedFigure(invokedFigureInput(invokedData as unknown as InvokedData), {
    width: W,
    plotHeight: H - 2 * P,
    padLeft: P,
    padRight: P,
    padTop: P,
    padBottom: P,
  })
  return figure.bars
    .filter((b) => r1(b.height) > 0)
    .map((b) =>
      b.standout
        ? { t: 'bar' as const, x: r1(b.x), y: r1(b.y), w: Math.max(1, r1(b.width)), h: r1(b.height), on: true as const }
        : { t: 'bar' as const, x: r1(b.x), y: r1(b.y), w: Math.max(1, r1(b.width)), h: r1(b.height) },
    )
}

/** Balance — the widest tone gaps as dumbbells, the page's own builder in a smaller box. */
function balanceMarks(): ThumbMark[] {
  const figure = buildBalanceFigure(balanceData.countries as unknown as BalanceCountry[], {
    top: 8,
    width: W,
    labelWidth: P,
    rowHeight: r1((H - 2 * P) / 8),
    padTop: P + 2,
    padRight: P,
  })
  return figure.rows.flatMap((row): ThumbMark[] => [
    { t: 'seg', x1: r1(row.xSelf), y1: r1(row.y), x2: r1(row.xForeign), y2: r1(row.y) },
    { t: 'dot', x: r1(row.xForeign), y: r1(row.y), r: 1.8 },
    { t: 'dot', x: r1(row.xSelf), y: r1(row.y), r: 2.4, on: true },
  ])
}

/** Correction — each month's revision as the distance from the first figure to the final one. */
function correctionMarks(): ThumbMark[] {
  const recent = revisionData.recent as { period: string; delta: number }[]
  if (recent.length === 0) return []
  const zero = r1(H / 2)
  const peak = Math.max(...recent.map((m) => Math.abs(m.delta)), 1)
  const slot = (W - 2 * P) / recent.length
  const w = Math.max(1.2, r1(slot * 0.62))
  const half = H / 2 - P
  const headline = revisionData.headline.period
  const marks: ThumbMark[] = [{ t: 'rule', x1: P, y1: zero, x2: W - P, y2: zero }]
  for (const [i, month] of recent.entries()) {
    const h = Math.max(1, r1((Math.abs(month.delta) / peak) * half))
    const x = r1(P + i * slot)
    const bar =
      month.delta < 0
        ? { t: 'bar' as const, x, y: zero, w, h }
        : { t: 'bar' as const, x, y: r1(zero - h), w, h }
    marks.push(month.period === headline ? { ...bar, on: true } : bar)
  }
  return marks
}

/** Headroom — each company's latest reported efficiency against the physical floor. */
function spielraumMarks(): ThumbMark[] {
  const companies = Object.values(
    spielraumData.companies as Record<string, { pue: { series: { figure: number }[] } }>,
  )
  const figures = companies
    .map((c) => c.pue.series[c.pue.series.length - 1]?.figure)
    .filter((f): f is number => typeof f === 'number')
  if (figures.length === 0) return []
  const floor = spielraumData.floor
  const domain: Domain = [floor - 0.02, Math.max(...figures) + 0.04]
  const plot = W - 2 * P
  const fx = r1(P + floorX(domain, plot, floor))
  const marks: ThumbMark[] = [{ t: 'rule', x1: fx, y1: P, x2: fx, y2: H - P }]
  const step = (H - 2 * P) / figures.length
  figures.forEach((figure, i) => {
    const y = r1(P + step * (i + 0.5))
    const x = r1(P + scaleX(figure, domain, plot))
    marks.push({ t: 'seg', x1: fx, y1: y, x2: x, y2: y })
    marks.push({ t: 'dot', x, y, r: 2.6, on: true })
  })
  return marks
}

/** Society — the room's own map: every agent at its position, every connection between them. */
function societyMarks(): ThumbMark[] {
  const positions = Object.values(AGENT_POS)
  const xs = positions.map((p) => p.x)
  const ys = positions.map((p) => p.y)
  const [x0, x1] = [Math.min(...xs), Math.max(...xs)]
  const [y0, y1] = [Math.min(...ys), Math.max(...ys)]
  // One scale for both axes: a schematic of a room may be small, but it may not be distorted.
  const k = Math.min((W - 2 * P) / (x1 - x0 || 1), (H - 2 * P) / (y1 - y0 || 1))
  const dx = (W - (x1 - x0) * k) / 2
  const dy = (H - (y1 - y0) * k) / 2
  const at = (p: { x: number; y: number }) => ({ x: r1(dx + (p.x - x0) * k), y: r1(dy + (p.y - y0) * k) })
  const marks: ThumbMark[] = []
  for (const edge of EDGES) {
    const from = AGENT_POS[edge.from]
    const to = AGENT_POS[edge.to]
    if (!from || !to) continue
    const a = at(from)
    const b = at(to)
    marks.push({ t: 'seg', x1: a.x, y1: a.y, x2: b.x, y2: b.y })
  }
  for (const p of positions) {
    const a = at(p)
    marks.push({ t: 'dot', x: a.x, y: a.y, r: 1.6, on: true })
  }
  return marks
}

// ── the two records that live in a directory, not in one file ─────────────────────────────
// Read from disk rather than glob-imported: these are build-time-only reads of eighty-odd and
// sixty-odd files, and an eager glob would carry every byte of them into the module graph for
// the sake of one day and one run. Paths are relative to the repository root, the way
// src/lib/ecology/n1-line.ts and src/lib/arch/facts.ts already read their mirrors.
const jsonFiles = (dir: string): string[] => readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
const readJson = <T>(path: string): T => JSON.parse(readFileSync(path, 'utf8')) as T

interface ProtokollDay {
  date: string
  entries: { status: string; trend: string | null }[]
  index: { improved: number; worsened: number; established: number }
}

const PROTOKOLL_DIR = 'src/content/protokoll/2026'
function latestProtokoll(): ProtokollDay | null {
  const files = jsonFiles(PROTOKOLL_DIR)
  const newest = files[files.length - 1]
  return newest ? readJson<ProtokollDay>(join(PROTOKOLL_DIR, newest)) : null
}

interface BeifangRun {
  date: string
  vantages: Record<string, { results: { third_party_requests: number | null; blocked: unknown }[] }>
}

const BEIFANG_DIR = 'src/content/beifang/2026'
function latestBeifang(): BeifangRun | null {
  const files = jsonFiles(BEIFANG_DIR)
  const newest = files[files.length - 1]
  return newest ? readJson<BeifangRun>(join(BEIFANG_DIR, newest)) : null
}

/** Protocol — the night's readings, one tick each; worsened marked, a silent source hollow. */
function protokollMarks(day: ProtokollDay): ThumbMark[] {
  const marked = new Set<number>()
  const hollow = new Set<number>()
  day.entries.forEach((entry, i) => {
    if (entry.status !== 'ok') hollow.add(i)
    else if (entry.trend === 'worsened') marked.add(i)
  })
  return slotRow(day.entries.length, marked, hollow)
}

/** Bycatch — third-party requests per article page; a page that refused the reader stays hollow. */
function beifangMarks(run: BeifangRun): ThumbMark[] {
  const results = run.vantages.automat?.results ?? []
  if (results.length === 0) return []
  const measured = results.map((r) => (typeof r.third_party_requests === 'number' ? r.third_party_requests : null))
  const peak = Math.max(...measured.filter((v): v is number => v !== null), 1)
  const slot = (W - 2 * P) / results.length
  const w = Math.max(1.2, r1(slot * 0.62))
  const tall = H - 2 * P
  return measured.map((value, i): ThumbMark => {
    const x = r1(P + i * slot)
    if (value === null) return { t: 'gap', x, y: P, w, h: tall }
    const h = Math.max(1, r1((value / peak) * tall))
    return { t: 'bar', x, y: r1(H - P - h), w, h }
  })
}

/** Common Ground — the day's converging topics over the sources that answered for them. */
function trendingMarks(): ThumbMark[] {
  const day = getLatestTrending()
  if (!day) return []
  const topics = day.topics ?? []
  const marks = barMarks(
    topics.map((t) => t.platform_count),
    new Set(topics.length > 0 ? [0] : []),
  )
  // Under the topics, one slot per source the morning asked: hollow where a source did not answer.
  const sources = day.sources ?? []
  const slot = (W - 2 * P) / Math.max(sources.length, 1)
  const w = Math.max(1.2, r1(slot * 0.5))
  const rule: ThumbMark[] = sources.map((source, i): ThumbMark => {
    const x = r1(P + i * slot)
    return source.status === 'ok'
      ? { t: 'bar', x, y: r1(H - 2), w, h: 2 }
      : { t: 'gap', x, y: r1(H - 2), w, h: 2 }
  })
  return [...marks, ...rule]
}

// ── the practices beside the lab ──────────────────────────────────────────────────────────
/**
 * The three houses listed beside the lab keep no instrument and publish no reading, so there is
 * no figure to miniaturise. What they DO have is a dated record, and that record has a shape:
 * one tick per entry on file. Drawn with the same primitive as everything else — never a
 * placeholder graphic, and never an invented measurement.
 */
export function recordThumbnail(id: string, entries: number, what: string, source: string): Thumbnail {
  return {
    id,
    marks: slotRow(entries, new Set(entries > 0 ? [entries - 1] : [])),
    draws: GALLERY.beside.draws,
    readout: GALLERY.beside.readout(count(entries), what),
    source,
  }
}

// ── the catalogue ─────────────────────────────────────────────────────────────────────────
function buildThumbnails(): Thumbnail[] {
  const R = GALLERY.readouts
  const D = GALLERY.draws
  const out: Thumbnail[] = []

  const day = latestProtokoll()
  if (day) {
    out.push({
      id: 'protokoll',
      marks: protokollMarks(day),
      draws: D.protokoll!,
      readout: R.protokoll(count(day.entries.length), count(day.index.worsened)),
      source: `${PROTOKOLL_DIR}/${day.date}.json`,
    })
  }

  const run = latestBeifang()
  if (run) {
    const results = run.vantages.automat?.results ?? []
    const blocked = results.filter((r) => typeof r.third_party_requests !== 'number').length
    out.push({
      id: 'beifang',
      marks: beifangMarks(run),
      draws: D.beifang!,
      readout: R.beifang(count(results.length - blocked), count(blocked)),
      source: `${BEIFANG_DIR}/${run.date}.json`,
    })
  }

  const trendingDay = getLatestTrending()
  if (trendingDay) {
    const platforms = Math.min(...trendingDay.topics.map((t) => t.platform_count), Infinity)
    out.push({
      id: 'trending',
      marks: trendingMarks(),
      draws: D.trending!,
      readout: R.trending(
        count(trendingDay.summary.converging),
        count(Number.isFinite(platforms) ? platforms : 0),
      ),
      source: `src/data/trending/${trendingDay.date}.json`,
    })
  }

  const picked = (roundNumberData.series as { id: string; name: string; benford: { verdict: string } }[]).find(
    (s) => s.id === roundNumberData.pick,
  )
  if (picked) {
    out.push({
      id: 'round-number',
      marks: roundNumberMarks(),
      draws: D['round-number']!,
      readout: R['round-number'](picked.name, picked.benford.verdict),
      source: 'src/data/round-number/latest.json',
    })
  }

  const societyAgents = Object.keys(AGENT_POS).length
  out.push({
    id: 'society',
    marks: societyMarks(),
    draws: D.society!,
    readout: R.society(count(societyAgents), count(EDGES.length)),
    source: 'src/lib/society/layout.ts',
  })

  const disclosing = Object.values(
    spielraumData.companies as Record<string, { pue: { series: { figure: number }[] } }>,
  ).filter((c) => c.pue.series.length > 0)
  const best = Math.min(
    ...disclosing.map((c) => c.pue.series[c.pue.series.length - 1]!.figure),
  )
  out.push({
    id: 'spielraum',
    marks: spielraumMarks(),
    draws: D.spielraum!,
    readout: R.spielraum(count(disclosing.length), decimal(best, 2)),
    source: 'src/data/spielraum/register.json',
  })

  out.push({
    id: 'tell',
    marks: tellMarks(),
    draws: D.tell!,
    readout: R.tell(tellData.headline.word, decimal(tellData.headline.fold, 1)),
    source: 'src/data/tell/latest.json',
  })

  out.push({
    id: 'redaction',
    marks: redactionMarks(),
    draws: D.redaction!,
    readout: R.redaction(count(redactionData.watched_count), count(redactionData.changed_count)),
    source: 'src/data/redaction/latest.json',
  })

  out.push({
    id: 'pattern',
    marks: patternMarks(),
    draws: D.pattern!,
    readout: R.pattern(
      patternData.headline.a_label.en,
      patternData.headline.b_label.en,
      decimal(patternData.headline.r, 2),
    ),
    source: 'src/data/pattern/latest.json',
  })

  out.push({
    id: 'praemie',
    marks: praemieMarks(),
    draws: D.praemie!,
    readout: R.praemie(
      count(praemieData.premium.base_year),
      percent(praemieData.premium.change_pct_since_base / 100),
    ),
    source: 'src/data/praemie/police.json',
  })

  out.push({
    id: 'parallaxe',
    marks: parallaxeMarks(),
    draws: D.parallaxe!,
    readout: R.parallaxe(count(parallaxeData.topics.length), decimal(parallaxeData.mean_omission_index, 2)),
    source: 'src/data/parallaxe/register.json',
  })

  out.push({
    id: 'ueberflug',
    marks: ueberflugMarks(),
    draws: D.ueberflug!,
    readout: R.ueberflug(
      count(ueberflugData.series[ueberflugData.series.length - 1]!.fleet),
      count(ueberflugData.observations),
    ),
    source: 'src/data/ueberflug/densification.json',
  })

  const globeModel = buildLivingGlobe()
  const globeMoment = frameAt(globeModel, globeModel.newest)
  out.push({
    id: 'globe',
    marks: globeMarks(),
    draws: D.globe!,
    readout: R.globe(
      count(LAYERS.reduce((sum, layer) => sum + globeMoment.layers[layer.id].records.length, 0)),
      count(LAYERS.length),
    ),
    source: 'src/data/globe/land-110m.json',
  })

  out.push({
    id: 'consensus',
    marks: consensusMarks(),
    draws: D.consensus!,
    readout: R.consensus(
      count(consensusData.headline.domain_count),
      decimal(consensusData.headline.span_hours, 1),
    ),
    source: 'src/data/consensus/latest.json',
  })

  out.push({
    id: 'invoked-past',
    marks: invokedMarks(),
    draws: D['invoked-past']!,
    readout: R['invoked-past'](
      count(invokedData.headline.year),
      decimal(invokedData.headline.times_its_neighbourhood, 1),
    ),
    source: 'src/data/invoked/latest.json',
  })

  out.push({
    id: 'balance',
    marks: balanceMarks(),
    draws: D.balance!,
    readout: R.balance(balanceData.headline.name, decimal(balanceData.headline.gap, 1)),
    source: 'src/data/balance/latest.json',
  })

  out.push({
    id: 'correction',
    marks: correctionMarks(),
    draws: D.correction!,
    readout: R.correction(
      count(revisionData.systematic.revised_down),
      count(revisionData.systematic.months),
    ),
    source: 'src/data/revision/latest.json',
  })

  const fleet = ghostFleetData.events as { id: string; duration_hours: number; vessel: { name: string } }[]
  const pick = fleet.find((e) => e.id === ghostFleetData.pick) ?? fleet[0]
  if (pick) {
    out.push({
      id: 'ghost-fleet',
      marks: ghostFleetMarks(),
      draws: D['ghost-fleet']!,
      readout: R['ghost-fleet'](pick.vessel.name, count(pick.duration_hours)),
      source: 'src/data/ghost-fleet/latest.json',
    })
  }

  return out
}

/** Every miniature the gallery can draw, by experiment id. Built once per build. */
export const THUMBNAILS: ReadonlyMap<string, Thumbnail> = new Map(
  buildThumbnails().map((t) => [t.id, t]),
)

/** How many entries a practice's own record holds — the shape `recordThumbnail` draws. Counts
 *  files, which is what an entry IS in these mirrors: one night, one journal entry, one session
 *  record. Nothing is inferred from a name, so a renamed file still counts once. */
export function datedEntries(dir: string, extension = '.md'): number {
  return readdirSync(dir).filter((f) => f.endsWith(extension)).length
}
