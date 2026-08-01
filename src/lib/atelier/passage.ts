// src/lib/atelier/passage.ts — "The Passage": what happens to a question in this practice, drawn
// as one measured sheet. Every line opens on the left, is worked in moves, and arrives at one of
// the harbours on the right; beside each closed line, in the gutter, stands what closing it cost —
// in the practice's own words (src/lib/atelier/ledger.ts).
//
// This module is the FIGURE, as data and as an SVG string: pure, deterministic, testable, and free
// of any colour or font (the atelier's own skin lives in src/styles/atelier-process.css). It is the
// geometry that used to sit inline in components/atelier/ProcessFigure.astro, moved out for two
// concrete reasons rather than tidiness:
//
//   1. a guided tour needs a BUILD-TIME still per scene (components/dataviz/Tour.astro's
//      `renderStill`), and a still drawn by a second generator would drift from the live figure the
//      moment either changed. One builder, two callers — the same rule the studio's season floor
//      arrived at (src/lib/studio/season.ts);
//   2. geometry that lives in a template cannot be unit-tested, and this one now carries a ledger
//      gutter whose whole point is that it is checkable.
//
// The layout is a MEASURED DRAWING, not a chart: the horizontal band is real time (one pixel scale
// across all lines, ticks lettered), the vertical order is the order the questions were opened, and
// nothing is jittered or nudged for looks. What is deliberately NOT to scale is the harbour column —
// a harbour's height is its share of the lines, so the eye reads proportions there, and the figure
// says so under itself.
//
// Rendering rules this file keeps:
//   · no colour, ever — a mark carries `data-out` and the stylesheet decides what that looks like;
//   · no `style=""` attribute (the site's CSP drops them silently — see dataviz/runtime.ts);
//   · every mark carries a native `<title>`, so the figure is readable without a hover readout;
//   · `still: true` strips every interaction hook, because a still is a picture, not a control.

import { escapeXml, wrapLines } from '@/lib/dataviz/geometry'
import type { ClosingLedger } from './ledger'
import { baueProzessbild, STATIONEN, type Ausgang, type RohProjekt } from './process'

// ---------------------------------------------------------------- input

/** The prose a line carries, quoted out of its own records by src/lib/atelier/lineText.ts. The
 *  component reads it (it owns the globs); this module only places it. */
export interface PassageProse {
  /** what the line is about — from its score */
  about: string | null
  /** why it ended as it did — from its decision */
  verdict: string | null
  /** its journal moves, newest first: the date and the entry's own heading */
  moves: { date: string; title: string }[]
}

/** Visitor-facing names for the five outcomes. Supplied by the caller from
 *  src/config/atelier-wording.ts — copy never lives in a library here. */
export interface HarbourWording {
  label: string
  hint: string
}

export interface PassageInput {
  projects: RohProjekt[]
  /** ids of the journal entries, with or without the 'journal/' prefix */
  journalIds: string[]
  /** build date, YYYY-MM-DD — a running line ages, and the figure has to say as of when */
  today: string
  prose: Record<string, PassageProse>
  /** by line id; a line whose record carries no closing ledger is simply absent (see ledger.ts) */
  ledgers: Record<string, ClosingLedger>
  harbours: Record<Ausgang, HarbourWording>
}

// ---------------------------------------------------------------- model

export interface PassageLine {
  /** the mark key a tour scene focuses — the line's project id */
  key: string
  title: string
  outcome: Ausgang
  harbour: string
  opened: string
  days: number
  moves: number
  active: boolean
  about: string | null
  verdict: string | null
  /** newest first, capped at MOVES_SHOWN for the card; `moves` above is the full count */
  moveList: { date: string; title: string }[]
  /** which of the five record parts this line has laid down */
  records: string[]
  /** the line's own closing ledger, verbatim — null where its record carries none */
  ledger: ClosingLedger | null
  // — geometry, in the figure's own coordinate space —
  y: number
  x1: number
  x2: number
  /** the curve from the end of the band into its harbour */
  tail: string
  /** x of every move tick on the band */
  ticks: number[]
  /** total drawn length, for the draw-in animation's stroke-dasharray */
  length: number
}

export interface PassageHarbour {
  outcome: Ausgang
  label: string
  hint: string
  count: number
  y: number
  height: number
  mid: number
}

export interface PassageModel {
  lines: PassageLine[]
  harbours: PassageHarbour[]
  /** the arc from "at the gate" to "published" — absent when one of the two harbours is empty */
  gate: { d: string; x: number; y: number } | null
  /** the time axis's lettered ticks */
  axis: { x: number; label: string }[]
  counts: Record<Ausgang, number>
  /** journal entries in the period that belong to no line — declared, never absorbed */
  unattachedMoves: number
  asOf: string
  firstOpened: string
  width: number
  height: number
}

// ---------------------------------------------------------------- geometry constants
//
// One sheet, five columns, left to right: the line's name · the time it was worked · the harbour it
// arrived at · the gate · what closing it cost. The gutter is the widest single column after time,
// because a ledger sentence is a sentence.

const W = 1480
const ROW = 30
const TOP = 52
const BOTTOM = 34
const LABEL_W = 212
const T_X0 = LABEL_W + 14
const T_X1 = 640
const HARBOUR_X = 720
const HARBOUR_W = 152
const GATE_X = HARBOUR_X + HARBOUR_W + 16
const GUTTER_X = 1005
const GUTTER_W = W - 16 - GUTTER_X
/** ~76 characters at the gutter's 10px monospace — measured, not guessed (0.6em advance) */
const GUTTER_CHARS = Math.floor(GUTTER_W / 6)
const GUTTER_LINES = 2

const MOVES_SHOWN = 4
const DAY = 86_400_000

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']

/** '2026-07-20' → '20 Jul'. Anything that is not an ISO day is passed through untouched. */
export function dayLabel(d: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? `${Number(d.slice(8, 10))} ${MONTHS[Number(d.slice(5, 7)) - 1]}` : d
}

const ms = (d: string) => Date.parse(`${d}T00:00:00Z`)
const round = (n: number) => Math.round(n * 10) / 10

/** Shortens a line's name for the label column, always with a visible ellipsis — a silently cut
 *  title reads as the practice's own wording and is not. */
export function shortTitle(s: string, max = 22): string {
  return s.length > max ? `${s.slice(0, max - 1)}…` : s
}

const ALL_OUTCOMES: Ausgang[] = ['PUBLISH', 'PUBLICATION_CANDIDATE', 'ARCHIVE_AS_STUDY', 'KILL', 'OPEN']

// ---------------------------------------------------------------- the model

export function buildPassageModel(input: PassageInput): PassageModel {
  const picture = baueProzessbild(input.projects, input.journalIds, input.today)
  const rows = picture.linien
  const n = Math.max(rows.length, 1)
  const height = TOP + n * ROW + BOTTOM

  // — the time scale: one linear scale for every line, so two bands of equal length really did
  //   take equally long. A bent scale would flatter the busy days and is refused here.
  const t0 = rows.length ? Math.min(...rows.map((l) => ms(l.created))) : ms(input.today)
  const t1 = Math.max(ms(picture.stand), t0 + DAY)
  const xOf = (d: string) => T_X0 + ((ms(d) - t0) / (t1 - t0)) * (T_X1 - T_X0)

  // — the harbours: height is share of the lines, so the column reads as proportion. This is the
  //   one place the drawing is NOT to scale in time, and the figure's provenance line says so.
  const total = rows.length || 1
  const stackH = n * ROW - 6
  let cursor = TOP
  const harbours: PassageHarbour[] = picture.haefen.map((h) => {
    const hh = Math.max(26, (h.anzahl / total) * stackH - 6)
    const y = cursor
    cursor += hh + 6
    return {
      outcome: h.ausgang,
      label: input.harbours[h.ausgang].label,
      hint: input.harbours[h.ausgang].hint,
      count: h.anzahl,
      y,
      height: hh,
      mid: y + hh / 2,
    }
  })
  const harbourOf = new Map(harbours.map((h) => [h.outcome, h]))

  // — where inside its harbour a line's tail lands: evenly spaced, in the order the lines opened
  const berth = new Map<string, number>()
  for (const h of harbours) {
    const inside = rows.filter((l) => l.ausgang === h.outcome)
    inside.forEach((l, i) => berth.set(l.id, h.y + (h.height / (inside.length + 1)) * (i + 1)))
  }

  const lines: PassageLine[] = rows.map((l, i) => {
    const y = TOP + i * ROW + ROW / 2
    const x1 = xOf(l.created)
    const x2 = Math.max(xOf(l.letzterZug ?? l.created), x1 + 7)
    const zy = berth.get(l.id) ?? y
    const cx = (x2 + HARBOUR_X) / 2
    const prose = input.prose[l.id] ?? { about: null, verdict: null, moves: [] }
    return {
      key: l.id,
      title: l.title,
      outcome: l.ausgang,
      harbour: harbourOf.get(l.ausgang)?.label ?? input.harbours.OPEN.label,
      opened: l.created,
      days: l.tage,
      moves: l.zuege,
      active: l.aktiv,
      about: prose.about,
      verdict: prose.verdict,
      moveList: prose.moves.slice(0, MOVES_SHOWN),
      records: STATIONEN.filter((s) => l.stationen[s]),
      ledger: input.ledgers[l.id] ?? null,
      y,
      x1: round(x1),
      x2: round(x2),
      tail: `M ${round(x2)} ${y} C ${round(cx)} ${y}, ${round(cx)} ${round(zy)}, ${HARBOUR_X} ${round(zy)}`,
      ticks: l.zugTage.map((d) => round(xOf(d))),
      length: Math.round(x2 - x1 + (HARBOUR_X - x2) * 1.15),
    }
  })

  const published = harbourOf.get('PUBLISH')
  const candidate = harbourOf.get('PUBLICATION_CANDIDATE')
  const gate =
    published && candidate
      ? {
          d:
            `M ${GATE_X} ${round(candidate.mid)} C ${GATE_X + 26} ${round(candidate.mid)}, ` +
            `${GATE_X + 26} ${round(published.mid)}, ${GATE_X + 2} ${round(published.mid + 4)}`,
          x: GATE_X + 8,
          y: round((published.mid + candidate.mid) / 2 - 2),
        }
      : null

  const axis = [t0, (t0 + t1) / 2, t1]
    .filter((v) => Number.isFinite(v))
    .map((v) => {
      const d = new Date(v).toISOString().slice(0, 10)
      return { x: round(xOf(d)), label: dayLabel(d) }
    })

  const counts = Object.fromEntries(
    ALL_OUTCOMES.map((o) => [o, rows.filter((l) => l.ausgang === o).length]),
  ) as Record<Ausgang, number>

  return {
    lines,
    harbours,
    gate,
    axis,
    counts,
    unattachedMoves: picture.ohneLinie,
    asOf: picture.stand,
    firstOpened: rows[0]?.created ?? input.today,
    width: W,
    height,
  }
}

// ---------------------------------------------------------------- the ledger gutter
//
// What stands beside a closed line. Three cases, and the difference between the second and the
// third is the whole reason this gutter exists:
//   · the record states what closing cost   → its own sentence, verbatim;
//   · the record is closed and states none  → the honest gap, in words, never a zero;
//   · the line is still open                → NOTHING. A running line has not closed, so it has no
//     closing cost to be missing; printing "no closing ledger" against it would report a gap in the
//     record where there is only a question still being worked.

export interface GutterText {
  lines: string[]
  /** true when the text is the honest-gap sentence rather than the record's own words */
  gap: boolean
}

export function gutterFor(line: PassageLine, gapLine: string): GutterText | null {
  if (line.outcome === 'OPEN' || line.active) return null
  if (!line.ledger) return { lines: [gapLine], gap: true }
  const wrapped = wrapLines(line.ledger.gutter, GUTTER_CHARS)
  if (wrapped.length <= GUTTER_LINES) return { lines: wrapped, gap: false }
  // Longer than the gutter: cut at the last word that fits and SAY SO with an ellipsis — the whole
  // sentence is one click away in the panel and one open-details away in the table, never lost.
  const kept = wrapped.slice(0, GUTTER_LINES)
  kept[GUTTER_LINES - 1] = `${kept[GUTTER_LINES - 1]} […]`
  return { lines: kept, gap: false }
}

// ---------------------------------------------------------------- the SVG

export interface PassageRenderOptions {
  /** outcomes drawn at full strength; empty or absent means every outcome is on (resting state) */
  filter?: string[]
  /** line keys drawn de-emphasized without being removed from the sheet */
  dim?: string[]
  /** one line key drawn as chosen */
  select?: string
  /** free call-outs lettered above the bands they name */
  annotate?: { key: string; text: string }[]
  /** crops the viewBox to a band around one line — how a tour scene gets its own build-time still
   *  from this same builder rather than a second, drifting generator */
  cropTo?: string
  /** a still carries no interaction hooks: no tabindex, no per-line keys, no role */
  still?: boolean
  /** accessible name for the whole figure */
  label?: string
  /** the gate's two lettered lines */
  gateLabel?: [string, string]
  /** what the gutter column is called, lettered once at the top */
  gutterLabel?: string
  /** the sentence printed where a closed line's record carries no ledger */
  gapLine: string
}

/** How tall a cropped band is, in the figure's own units — about seven rows: the line a scene is
 *  talking about, its neighbours, and enough of the harbour column to see where it lands. */
export const BAND_HEIGHT = 210
/** and the most a band may grow to when the harbour it has to include sits far from the line */
export const BAND_MAX = 306

/**
 * The vertical window a scene's still is cropped to — the line it talks about, with enough room
 * above and below that the harbour column and the ticks stay in frame. Full width always: a passage
 * cropped horizontally would stop being a passage.
 *
 * Exported because the LIVE figure crops too, not only the stills: pinned above a scrolling account
 * (see components/atelier/tours/KilledOnThePivot.astro) a full sheet is either too tall to pin or
 * too small to read — and the ledger gutter, which is running text, is the first thing to become
 * illegible. A scene therefore re-aims the live viewBox at the band it is talking about, which is
 * also the only way the gutter stays at its designed size instead of being scaled down.
 *
 * The two margins below are the drawing's OWN measures rather than round numbers, changed
 * 2026-08-01 when the figure started clipping to its viewBox for real (atelier-process.css) and the
 * old ones turned out to land mid-glyph: 40 above the line cut the top line of a neighbour's ledger
 * sentence in half, and 16 below the harbour reached ten units INTO the next harbour's box, whose
 * count then showed as a sliced numeral. A measured drawing is cropped on a rule, not through a row:
 * ROW * 1.5 from a line's centre lands exactly on the hairline between two rows (a row's centre sits
 * at ROW/2), and the harbour margin is the same 6 units buildPassageModel leaves between harbours.
 */
export function passageViewBox(model: PassageModel, cropTo?: string): string {
  if (!cropTo) return `-8 0 ${W + 8} ${model.height}`
  const line = model.lines.find((l) => l.key === cropTo)
  if (!line) return `-8 0 ${W + 8} ${model.height}`
  // The band must contain the line AND the harbour it lands in — a crop that shows a tail curving
  // out of frame drops the one thing the drawing is about, which is where a question ends up.
  const harbour = model.harbours.find((h) => h.outcome === line.outcome)
  const reach = ROW * 1.5
  const gap = 6
  const top = Math.min(line.y - reach, harbour ? harbour.y - gap : line.y - reach)
  const bottom = Math.max(
    line.y + reach,
    harbour ? harbour.y + harbour.height + gap : line.y + reach,
  )
  const h = Math.min(model.height, Math.max(BAND_HEIGHT, Math.min(BAND_MAX, bottom - top)))
  const y = Math.max(0, Math.min((top + bottom) / 2 - h / 2, model.height - h))
  return `-8 ${round(y)} ${W + 8} ${round(h)}`
}

export function buildPassageSvg(model: PassageModel, opts: PassageRenderOptions): string {
  const on = (l: PassageLine) => !opts.filter?.length || opts.filter.includes(l.outcome)
  const dimmed = (l: PassageLine) => opts.dim?.includes(l.key) ?? false
  const notes = new Map((opts.annotate ?? []).map((a) => [a.key, a.text]))
  const s: string[] = []

  // `data-filtered` sits on the SVG rather than on a wrapper because the build-time STILLS have no
  // wrapper of their own — they are rendered straight into the tour's scene list, outside the
  // figure's own section, and must still know to push the unfiltered lines back.
  const filtered = Boolean(opts.filter?.length || opts.dim?.length)
  s.push(
    `<svg class="at-proc-svg" viewBox="${passageViewBox(model, opts.cropTo)}" role="img"` +
      `${filtered ? ' data-filtered=""' : ''}` +
      ` preserveAspectRatio="xMidYMid meet" aria-label="${escapeXml(opts.label ?? defaultLabel(model))}">`,
  )
  s.push(
    '<defs><marker id="pr-arrow" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="6" markerHeight="6"' +
      ' orient="auto-start-reverse"><path d="M 0 1 L 7 4 L 0 7 z" class="pr-arrow-head"/></marker></defs>',
  )

  // — the time axis, lettered
  s.push('<g class="pr-axis">')
  s.push(`<line x1="${T_X0}" y1="${TOP - 24}" x2="${T_X1}" y2="${TOP - 24}"/>`)
  for (const t of model.axis) {
    s.push(`<text x="${t.x}" y="${TOP - 32}" text-anchor="middle">${escapeXml(t.label)}</text>`)
  }
  s.push('</g>')

  if (opts.gutterLabel) {
    s.push(
      `<text class="pr-gutter-head" x="${GUTTER_X}" y="${TOP - 32}">${escapeXml(opts.gutterLabel)}</text>`,
    )
  }

  // — the gate: the one passage in this drawing a machine may not walk on its own
  if (model.gate && opts.gateLabel) {
    s.push('<g class="pr-gate">')
    s.push(`<path d="${model.gate.d}" fill="none" marker-end="url(#pr-arrow)"/>`)
    s.push(`<text x="${model.gate.x}" y="${model.gate.y}">${escapeXml(opts.gateLabel[0])}</text>`)
    s.push(`<text x="${model.gate.x}" y="${model.gate.y + 13}">${escapeXml(opts.gateLabel[1])}</text>`)
    s.push('</g>')
  }

  // — the harbours
  for (const h of model.harbours) {
    const lit = !opts.filter?.length || opts.filter.includes(h.outcome)
    s.push(`<g class="pr-harbour" data-out="${h.outcome}"${lit ? ' data-on=""' : ''}>`)
    s.push(`<title>${escapeXml(`${h.label} — ${h.hint}`)}</title>`)
    s.push(`<rect class="pr-harbour-bg" x="${HARBOUR_X}" y="${round(h.y)}" width="${HARBOUR_W}" height="${round(h.height)}" rx="9"/>`)
    s.push(`<rect class="pr-harbour-edge" x="${HARBOUR_X}" y="${round(h.y)}" width="3.5" height="${round(h.height)}" rx="1.75"/>`)
    s.push(`<text class="pr-harbour-n" x="${HARBOUR_X + 14}" y="${round(h.mid - 2)}">${h.count}</text>`)
    s.push(`<text class="pr-harbour-label" x="${HARBOUR_X + 14}" y="${round(h.mid + 13)}">${escapeXml(h.label)}</text>`)
    s.push('</g>')
  }

  // — the lines themselves
  model.lines.forEach((l, i) => {
    const attrs = [`class="pr-line"`, `data-out="${l.outcome}"`]
    if (on(l)) attrs.push('data-on=""')
    if (dimmed(l)) attrs.push('data-dim=""')
    if (opts.select === l.key) attrs.push('data-sel=""')
    if (!opts.still) {
      attrs.push(`data-key="${escapeXml(l.key)}"`, 'tabindex="0"', 'role="button"')
    }
    s.push(`<g ${attrs.join(' ')}>`)
    s.push(`<title>${escapeXml(`${l.title} — ${l.harbour}`)}</title>`)
    s.push(`<text class="pr-label" x="6" y="${l.y + 4}">${escapeXml(shortTitle(l.title))}</text>`)
    s.push(`<text class="pr-date" x="${LABEL_W}" y="${l.y + 4}" text-anchor="end">${escapeXml(l.opened.slice(5))}</text>`)
    s.push(`<path class="pr-tail" d="${l.tail}"/>`)
    s.push(
      `<line class="pr-band${l.outcome === 'OPEN' ? ' is-open' : ''}" x1="${l.x1}" y1="${l.y}"` +
        ` x2="${l.x2}" y2="${l.y}"/>`,
    )
    for (const x of l.ticks) {
      s.push(`<line class="pr-move" x1="${x}" y1="${l.y - 3.4}" x2="${x}" y2="${l.y + 3.4}"/>`)
    }
    if (l.active) s.push(`<circle class="pr-still-running" cx="${l.x2}" cy="${l.y}" r="4.4"/>`)

    const note = notes.get(l.key)
    if (note) {
      s.push(`<text class="pr-note" x="${l.x1}" y="${l.y - 10}">${escapeXml(note)}</text>`)
    }

    // — the gutter: what closing this line cost, in the record's own words
    const gutter = gutterFor(l, opts.gapLine)
    if (gutter) {
      s.push(`<g class="pr-ledger"${gutter.gap ? ' data-gap=""' : ''}>`)
      gutter.lines.forEach((text, k) => {
        s.push(`<text x="${GUTTER_X}" y="${l.y - 4 + k * 11}">${escapeXml(text)}</text>`)
      })
      s.push('</g>')
    }

    if (!opts.still) {
      s.push(`<rect class="pr-focus" x="-8" y="${l.y - 13}" width="${W}" height="26" rx="6"/>`)
      s.push(`<rect class="pr-rowhit" x="-8" y="${l.y - 13}" width="${W}" height="26"/>`)
    }
    s.push('</g>')
    // the row separator: a hand-set hairline, deterministic, skipped under the last row
    if (i < model.lines.length - 1) {
      s.push(`<line class="pr-rule" x1="6" y1="${l.y + ROW / 2}" x2="${W - 16}" y2="${l.y + ROW / 2}"/>`)
    }
  })

  s.push('</svg>')
  return s.join('\n')
}

function defaultLabel(model: PassageModel): string {
  const parts = model.harbours.map((h) => `${h.label} ${h.count}`).join(', ')
  return `Every research line on one time axis: ${model.lines.length} opened; ${parts}. Beside each closed line, what closing it cost.`
}

// ---------------------------------------------------------------- the table floor

export interface PassageRow {
  line: string
  opened: string
  days: string
  moves: string
  records: string
  outcome: string
  cost: string
  /** TableFallback.astro takes Record<string, string | number>; the named fields above are the
   *  contract, this keeps the row assignable without a cast at the call site */
  [column: string]: string
}

/** The table's columns — here rather than in the component, so the figure and its data floor cannot
 *  drift apart. Typed structurally to match components/dataviz/TableFallback.astro's TableColumn
 *  without importing an .astro module into a pure library. */
export const PASSAGE_COLUMNS: { key: string; label: string; nowrap?: boolean }[] = [
  { key: 'line', label: 'line' },
  { key: 'opened', label: 'opened', nowrap: true },
  { key: 'days', label: 'days' },
  { key: 'moves', label: 'moves' },
  { key: 'records', label: 'records' },
  { key: 'outcome', label: 'outcome', nowrap: true },
  { key: 'cost', label: 'closing cost (verbatim)' },
]

/** One row per line, in the order they were opened. The closing-cost column carries the WHOLE
 *  ledger — standing block and budget sentence both — where the gutter beside the figure has room
 *  for one line of it; nothing on this sheet is reachable only by hovering a mark. */
export function passageRows(model: PassageModel, gapLine: string, openLine: string): PassageRow[] {
  return model.lines.map((l) => ({
    line: l.title,
    opened: l.opened,
    days: String(l.days),
    moves: String(l.moves),
    records: l.records.join(' · '),
    outcome: l.harbour,
    cost: l.ledger ? l.ledger.full : l.outcome === 'OPEN' || l.active ? openLine : gapLine,
  }))
}
