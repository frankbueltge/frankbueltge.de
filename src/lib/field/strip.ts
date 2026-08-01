// Build-time Messprotokoll generators (Praxis-Oberflächen-Paket): a TS port of research-
// ecology's docs/design/variants-2026-07-15/field_viz.py — the Field's OWN grammar
// (ADR 0010): millimetre grid, a continuous pen trace on wall-clock days (quiet days stay
// on the tape as a flat line — Meridian's honest gap), violet move stamps, instrument
// triangles, the ochre caveat flag with its standing obligation line, one visible splice,
// one patch, and the resting pen as the data edge („the pen has not lifted“).
//
// Pure and deterministic (contract as score.ts / pulse/render.ts): same inputs ⇒
// byte-identical SVG. No randomness, no clock reads — the day range is a pure function of
// the committed dates.
//
// Named deviations from the mockup (the site reads its committed mirror, no engine git):
//  · the pen trace draws chronicled SESSIONS/day, not commits/day (√-scaled, labelled);
//  · calibration marks ‖ (PROTOCOL.md git dates) are not drawn — honest margin note;
//  · the top journal-anchor row (hand-picked in the mockup) is not drawn.

import { dayRange as geometryDayRange, escapeXml } from '@/lib/dataviz/geometry'

/** Inclusive ISO day range — pure date arithmetic, no clock. One-line wrapper around
 *  dataviz/geometry.ts's consolidated dayRange, keeping this module's historical contract
 *  (assumes well-formed dates, throws only on a reversed range) byte-identical. */
export function dayRange(first: string, last: string): string[] {
  return geometryDayRange(first, last, { onInvalid: 'throw' })
}

// ---------------------------------------------------------------- ported geometry
// (X0=300, STEP≤76, BASE_Y=460, grid pitch 15.2, stamps from y=268 in 22px rows,
// instruments in 4-column groups below the baseline).
const W = 1440
const X0 = 300
const MAX_STEP = 76
const BASE_Y = 460
const GRID_TOP = 226
const GRID_BOTTOM = 560
const TRACE_K = 26 // sessions/day → amplitude (√-scaled); the mockup used 9.5·√commits

const MONTHS = ['JAN', 'FEB', 'MAR', 'APR', 'MAY', 'JUN', 'JUL', 'AUG', 'SEP', 'OCT', 'NOV', 'DEC']

/**
 * The millimetre paper every field figure is drawn on: a 15.2px pitch with every fifth line
 * major. Exported (it was private until the claim figure needed it) so a second field figure
 * draws on the SAME paper instead of a second, drifting copy of this loop — the output is
 * byte-identical to the private version it replaces, which is what keeps strip.test.ts green.
 */
export function mmGrid(x0: number, x1: number, y0: number, y1: number): string {
  const out: string[] = []
  let i = 0
  for (let x = x0; x <= x1; x += 15.2, i++) {
    out.push(`<path class="${i % 5 === 0 ? 'gridmajor' : 'gridline'}" d="M${x.toFixed(1)} ${y0} V${y1}"/>`)
  }
  i = 0
  for (let y = y0; y <= y1; y += 15.2, i++) {
    out.push(`<path class="${i % 5 === 0 ? 'gridmajor' : 'gridline'}" d="M${x0} ${y.toFixed(1)} H${x1}"/>`)
  }
  return out.join('')
}

const grid = mmGrid

export interface StripDay {
  date: string
  /** chronicled sessions this day (0 = quiet day — stays on the tape) */
  sessions: number
}

export interface StampMark {
  session: number | null
  date: string
  move: string
  /** verbatim summary for the hover title */
  note: string
}

export interface StripInput {
  days: StripDay[]
  stamps: StampMark[]
  instruments: { date: string; count: number }[]
  flag?: { date: string; note: string }
  obligationLabel?: string
  splice?: { date: string; note: string }
  patch?: { date: string; note: string }
  /** honest margin note replacing the mockup's calibration row */
  calibrationNote: string
  traceLabel: readonly [string, string]
  dataEdgeLines: readonly [string, string]
  stampsLabel: readonly [string, string]
}

/** Builds the Schreiberstreifen SVG, mirroring field_viz.py's strip_svg() structure. */
export function buildStripSvg(input: StripInput): string {
  const { days } = input
  if (days.length < 2) throw new Error('buildStripSvg: need at least two days of tape')
  const step = Math.min(MAX_STEP, Math.floor((1282 - X0) / (days.length - 1)))
  const dxMap = new Map(days.map((d, i) => [d.date, X0 + i * step]))
  const dx = (date: string) => {
    const x = dxMap.get(date)
    if (x === undefined) throw new Error(`buildStripSvg: date ${date} is not on the tape`)
    return x
  }
  const lastX = X0 + (days.length - 1) * step
  const penX = lastX + 34

  const s: string[] = []
  s.push(
    `<svg id="strip" viewBox="0 190 ${W} 470" role="img" aria-label="Strip-chart tape ` +
      `${escapeXml(days[0].date)} to ${escapeXml(days[days.length - 1].date)}: pen trace of chronicled sessions per day, ` +
      `instrument marks, move stamps; the full register follows as a table.">`,
  )
  s.push(grid(250, penX + 30, GRID_TOP, GRID_BOTTOM))

  // day axis (month at the left edge; a month boundary re-labels with its month prefix)
  s.push(`<text class="t-n" x="${250}" y="580" text-anchor="end">${MONTHS[Number(days[0].date.slice(5, 7)) - 1]}·</text>`)
  for (let i = 0; i < days.length; i++) {
    const d = days[i]
    const boundary = i > 0 && d.date.slice(5, 7) !== days[i - 1].date.slice(5, 7)
    const label = boundary ? `${MONTHS[Number(d.date.slice(5, 7)) - 1]}·${d.date.slice(8)}` : d.date.slice(8)
    s.push(`<text class="t-n" x="${dx(d.date)}" y="580" text-anchor="middle">${escapeXml(label)}</text>`)
  }

  // honest margin note where the mockup drew calibration ticks
  s.push(`<text class="t-n" x="${250 - 8}" y="236" text-anchor="end">${escapeXml(input.calibrationNote)}</text>`)

  // pen trace (continuous; quiet days stay as a flat line)
  const pts = days
    .map((d) => `${dx(d.date)},${(BASE_Y - Math.round(TRACE_K * Math.sqrt(d.sessions) * 10) / 10).toFixed(1)}`)
    .join(' ')
  s.push(`<polyline class="trace" points="250,${BASE_Y} ${pts} ${penX - 14},${BASE_Y - 8}"/>`)
  for (const d of days) {
    s.push(
      `<g class="evt2" tabindex="0"><rect x="${dx(d.date) - 10}" y="${BASE_Y - 160}" width="20" height="176" fill="transparent"/>` +
        `<title>${escapeXml(d.date)} · ${d.sessions} chronicled session(s)</title></g>`,
    )
  }
  s.push(`<text class="t-n" x="${250 - 8}" y="${BASE_Y - 40}" text-anchor="end">${escapeXml(input.traceLabel[0])}</text>`)
  s.push(`<text class="t-n" x="${250 - 8}" y="${BASE_Y - 26}" text-anchor="end">${escapeXml(input.traceLabel[1])}</text>`)

  // move stamps above the trace (two columns when a day carries more than four)
  const seen = new Map<string, number>()
  for (const st of input.stamps) {
    const k = seen.get(st.date) ?? 0
    seen.set(st.date, k + 1)
    const total = input.stamps.filter((x) => x.date === st.date).length
    const twoCol = total > 4
    const col = twoCol ? k % 2 : 0
    const row = twoCol ? Math.floor(k / 2) : k
    const x = dx(st.date) + (twoCol ? (col === 0 ? -11 : 11) : 0)
    const y = 268 + row * 22
    const letter = st.move.charAt(0).toUpperCase()
    const sessLabel = st.session === null ? 'pre-constitution session' : `S${st.session}`
    s.push(
      `<g class="evt2" tabindex="0"><circle class="stamp" cx="${x}" cy="${y}" r="9"/>` +
        `<text class="stamp-t" x="${x}" y="${(y + 3.4).toFixed(1)}" text-anchor="middle">${escapeXml(letter)}</text>` +
        `<title>${escapeXml(sessLabel)} — ${escapeXml(st.date)} — move: ${escapeXml(st.move)} — ${escapeXml(st.note)} (chronicle, verbatim)</title></g>`,
    )
  }
  s.push(`<text class="t-n" x="${250 - 8}" y="276" text-anchor="end">${escapeXml(input.stampsLabel[0])}</text>`)
  s.push(`<text class="t-n" x="${250 - 8}" y="290" text-anchor="end">${escapeXml(input.stampsLabel[1])}</text>`)

  // instruments below the baseline
  let instrTotal = 0
  for (const m of input.instruments) {
    instrTotal += m.count
    const x = dx(m.date)
    for (let k = 0; k < m.count; k++) {
      const col = k % 4
      const row = Math.floor(k / 4)
      const xx = x - 18 + col * 12
      const yy = BASE_Y + 22 + row * 14
      s.push(
        `<path class="instr" d="M${xx} ${yy} l5 -9 l5 9 Z"><title>${escapeXml(m.date)} — instrument added (works/, committed date): ${m.count} this day</title></path>`,
      )
    }
  }
  s.push(`<text class="t-n" x="${250 - 8}" y="${BASE_Y + 34}" text-anchor="end">instruments · ${instrTotal}</text>`)

  // caveat flag + standing obligation line to the pen
  if (input.flag) {
    const xf = dx(input.flag.date)
    s.push(
      `<g class="evt2" tabindex="0"><path class="flag-pole" d="M${xf + 22} ${BASE_Y - 96} V${BASE_Y - 64}"/>` +
        `<path class="flag" d="M${xf + 22} ${BASE_Y - 96} l16 5 l-16 5 Z"/>` +
        `<title>${escapeXml(input.flag.date)} — ${escapeXml(input.flag.note)}</title></g>`,
    )
    if (input.obligationLabel) {
      s.push(`<path class="obl-f" d="M${xf + 22} ${BASE_Y - 64} L${penX - 16} ${BASE_Y - 64}"/>`)
      s.push(`<text class="t-cav" x="${penX - 20}" y="${BASE_Y - 70}" text-anchor="end">${escapeXml(input.obligationLabel)}</text>`)
    }
  }

  // splice (the tape cut and respliced) and patch (the restored entry)
  if (input.splice) {
    const xs = dx(input.splice.date) + 30
    s.push(
      `<g class="evt2" tabindex="0"><path class="splice" d="M${xs - 8} ${GRID_TOP} L${xs + 8} ${GRID_BOTTOM} M${xs + 2} ${GRID_TOP} L${xs + 18} ${GRID_BOTTOM}"/>` +
        `<rect class="tape" x="${xs - 16}" y="360" width="42" height="64"/>` +
        `<title>${escapeXml(input.splice.date)} — ${escapeXml(input.splice.note)}</title></g>`,
    )
    s.push(`<text class="t-n" x="${xs + 2}" y="602" text-anchor="middle">splice · ${escapeXml(input.splice.date.slice(5))}</text>`)
  }
  if (input.patch) {
    // offset +44 (the mockup used +26): clear of the two-column stamp stacks the fuller
    // site chronicle piles onto the same day.
    const xp = dx(input.patch.date) + 44
    s.push(
      `<g class="evt2" tabindex="0"><rect class="patch" x="${xp - 12}" y="${BASE_Y - 140}" width="26" height="20"/>` +
        `<title>${escapeXml(input.patch.date)} — ${escapeXml(input.patch.note)}</title></g>`,
    )
    s.push(`<text class="t-n" x="${xp + 16}" y="${BASE_Y - 126}">patch</text>`)
  }

  // the resting pen (data edge — approved formula)
  s.push(`<path class="pen" d="M${penX - 14} ${BASE_Y - 8} l22 -7 l-4 12 Z"/>`)
  s.push(`<text class="t-n" x="${penX + 22}" y="${BASE_Y + 24}" text-anchor="end">${escapeXml(input.dataEdgeLines[0])}</text>`)
  s.push(`<text class="t-n" x="${penX + 22}" y="${BASE_Y + 38}" text-anchor="end">${escapeXml(input.dataEdgeLines[1])}</text>`)

  s.push('</svg>')
  return s.join('\n')
}

// ---------------------------------------------------------------- envelope band
//
// The field's way of drawing an ADMISSIBLE REGION: everything inside the band is ordinary,
// everything outside it is the thing worth reporting. The idiom comes from the collective's own
// margin battery — instrument 018 fitted a pre-registered ordinary-drift envelope and reported
// NO SIGNAL BEYOND ORDINARY DRIFT when every metric landed inside it.
//
// Two rules make the drawing survive contexts a colour fill would not:
//   · the wash is INK at 6 %, never a colour fill — under forced-colors a background fill is
//     replaced wholesale, so the band would either vanish or become a solid block;
//   · the edges are a 1px DASHED stroke, which forced-colors keeps as a stroke — so even with
//     the wash gone the region still has a readable boundary.

export interface EnvelopeBandInput {
  x0: number
  x1: number
  /** the band's upper edge in SVG user units (smaller y — SVG counts downward) */
  yTop: number
  /** the band's lower edge (must be below yTop) */
  yBottom: number
  /** margin note lettered at the band's left edge; omitted draws no label */
  label?: string
  /** 'inside' letters the label just under the upper edge, 'above' letters it over the band */
  labelAt?: 'inside' | 'above'
}

/**
 * Builds one envelope band: a 6 % ink wash between two horizontal edges, both edges drawn as 1px
 * dashed hairlines, plus an optional margin label. Pure — same input, byte-identical output.
 * Refuses a degenerate or inverted band rather than drawing a zero-height rectangle nobody can
 * see: an envelope with no width is a derivation error upstream, not a drawing to be rendered.
 */
export function envelopeBand(input: EnvelopeBandInput): string {
  const { x0, x1, yTop, yBottom } = input
  if (x1 <= x0) throw new Error(`envelopeBand: x1 (${x1}) must lie right of x0 (${x0})`)
  if (yBottom <= yTop) throw new Error(`envelopeBand: yBottom (${yBottom}) must lie below yTop (${yTop})`)
  const s: string[] = ['<g class="env-band">']
  s.push(`<rect class="env-wash" x="${x0}" y="${yTop}" width="${x1 - x0}" height="${yBottom - yTop}"/>`)
  s.push(`<path class="env-edge" d="M${x0} ${yTop} H${x1} M${x0} ${yBottom} H${x1}"/>`)
  if (input.label) {
    const y = input.labelAt === 'above' ? yTop - 8 : yTop + 15
    s.push(`<text class="env-lab" x="${x0 + 8}" y="${y}">${escapeXml(input.label)}</text>`)
  }
  s.push('</g>')
  return s.join('')
}

// ---------------------------------------------------------------- the decision ladder
//
// The Meridian Research Runtime caps what a claim may SAY at a machine-enforceable
// `claim_ceiling`, issued by a MethodRuling and refused above by the Claim Service. The seven
// rungs below are that vocabulary, in the runtime spec's own order (strongest first), copied from
// the committed spec — docs/meridian-research-runtime-spec-v0.2.0/
// MERIDIAN_RESEARCH_RUNTIME_SPEC_v0.2.0.md § 5.1 "Claim-language ceiling" — and checked against
// that file by strip.test.ts, so the ladder can never quietly become a ladder this site invented.
//
// Attribution, and it is load-bearing (wording canon, enc-2026-005): the ruling and the ceiling
// belong to the RUNTIME — the architect's engineering line — not to the Meridian collective's
// research voice. A claim on a rung is the collective's; the rung it is held to is the runtime's.

export const CLAIM_CEILINGS = [
  'causal_bounded',
  'causal_local',
  'associational_adjusted',
  'associational_unadjusted',
  'descriptive',
  'mechanism_hypothesis',
  'insufficient_evidence',
] as const

export type ClaimCeiling = (typeof CLAIM_CEILINGS)[number]

export interface LadderRung {
  ceiling: string
  /** 0 = the strongest rung (top of the ladder) */
  index: number
  /** y of this rung's hairline */
  y: number
  /** true where the ruling permits this language — the ruled rung and everything weaker */
  permitted: boolean
  /** the one rung the ruling actually issued */
  ruled: boolean
}

export interface LadderOptions {
  /** y of the strongest rung */
  top: number
  /** vertical pitch between rungs */
  step: number
}

/**
 * Lays out the decision ladder for one issued ceiling: every rung of the runtime's vocabulary,
 * top-down from strongest, with the ruled rung marked and everything at or below it flagged
 * permitted. Pure geometry — no drawing, no colour; the figure that uses this decides how a
 * permitted rung differs from a refused one.
 *
 * Fails loud on a ceiling outside the vocabulary rather than defaulting it onto a rung: an
 * unrecognised ceiling silently drawn as "permitted at the bottom" would be a fabricated ruling.
 */
export function ladderRungs(ruledCeiling: string, opts: LadderOptions): LadderRung[] {
  const ruledIndex = CLAIM_CEILINGS.indexOf(ruledCeiling as ClaimCeiling)
  if (ruledIndex === -1) {
    throw new Error(
      `ladderRungs: "${ruledCeiling}" is not one of the runtime's claim ceilings (${CLAIM_CEILINGS.join(', ')})`,
    )
  }
  return CLAIM_CEILINGS.map((ceiling, index) => ({
    ceiling,
    index,
    y: opts.top + index * opts.step,
    permitted: index >= ruledIndex,
    ruled: index === ruledIndex,
  }))
}

// ---------------------------------------------------------------- Kontrollblatt (entry)

export type ControlMarkKind = 'instr' | 'flag' | 'splicein' | 'stamp'

export interface ControlMark {
  date: string
  label: string
  kind: ControlMarkKind
  /** stamp letter (move initial); only for kind 'stamp' */
  letter?: string
  /** stable identity a guided tour focuses this mark by; absent leaves the mark unkeyed and
   *  therefore undrivable — every historical caller stays byte-identical */
  key?: string
}

/** What a tour scene wants the plate to look like — the plate's own reading of FocusState
 *  (src/lib/tour/types.ts). Absent means the resting plate: every mark at full strength. */
export interface ControlFocus {
  /** mark KINDS drawn at full strength; empty or absent means all of them */
  filter?: string[]
  /** mark keys drawn de-emphasized without being removed from the plate */
  dim?: string[]
  /** the one mark key drawn as chosen */
  select?: string
}

export interface ControlInput {
  days: string[] // wall-clock range for the plate's x-axis (dayRange)
  marks: ControlMark[]
  obligation?: { fromDate: string; label: string }
  penLabel: string
  focus?: ControlFocus
  /** a build-time still carries no focus hooks: no tabindex, nothing to tab into behind a
   *  scene's prose (the live figure beside it is the interactive one) */
  still?: boolean
  /** the SVG element's own id — defaults to the historical "plate". A tour renders one still per
   *  scene from this same builder, so without distinct ids a page would carry seven elements all
   *  called "plate". */
  svgId?: string
  /** accessible name; the default names the mark count, as it always has */
  label?: string
  /** the margin word over a splice. The default says "from outside" because the entry plate's one
   *  splice really is a correction arriving from another practice; a plate whose splice is an
   *  internal review cut must say so instead of borrowing that claim. */
  spliceLabel?: string
  /**
   * Crops the viewBox to the drawn marks instead of keeping the full 1440-unit plate width. The
   * historical default is the full width, because the entry plate's tape is meant to read as a
   * tape that runs on past the pen — but a FIVE-DAY plate drawn at full width uses barely a third
   * of its own box, and inside a guided tour's half-width column that put the whole week into
   * about 260 pixels. Opt-in, so /field and /field/history render byte-identically.
   */
  fitToMarks?: boolean
  /**
   * The x offsets same-day marks fan out by. The historical default fans RIGHTWARD from the day's
   * tick ([-14, 30, 74, 118] — the mockup's hand offsets), which is fine while a day carries two
   * or three marks; a day carrying FOUR pushed the last of them past the resting pen itself, so a
   * plate whose busiest day is full can supply a centred spread instead. Opt-in: /field and
   * /field/history keep the hand offsets, byte for byte.
   */
  dayOffsets?: number[]
}

/**
 * Wall-clock span of an instrument's record plate: from the earliest of the work's committed
 * date and its mark dates to the latest of those and the ledger's as_of. Every mark is on the
 * plate by construction — a mark dated before the committed date (a build stamp the day before
 * the ship) widens the span instead of falling off it — and a work shipped today yields the
 * legitimate one-day span. Lives here, not inline in the page, so the derivation stays tested.
 */
export function plateSpan(metaDate: string, markDates: string[], asOf: string): string[] {
  const start = [metaDate, ...markDates].sort()[0]
  const end = [asOf, metaDate, ...markDates].sort().at(-1)!
  return dayRange(start, end)
}

/** Builds the Kontrollblatt SVG, mirroring field_viz.py's control_svg() structure. */
export function buildControlSvg(input: ControlInput): string {
  const { days } = input
  // A single-day plate is a real state, not an error: an instrument shipped today has exactly
  // one wall-clock day of service (built mark, ship stamp and pen all on the same date). Only
  // the empty plate is refused; the one-day geometry degenerates cleanly (every mark at X0).
  if (days.length < 1) throw new Error('buildControlSvg: need at least one day')
  const step = days.length === 1 ? 0 : Math.min(MAX_STEP, Math.floor((1282 - X0) / (days.length - 1)))
  const dxMap = new Map(days.map((d, i) => [d, X0 + i * step]))
  const dx = (date: string) => {
    const x = dxMap.get(date)
    if (x === undefined) throw new Error(`buildControlSvg: date ${date} is not on the plate`)
    return x
  }
  const lastX = X0 + (days.length - 1) * step
  const penX = lastX + 34
  const y = 370

  const s: string[] = []
  // the right margin of a fitted box is not the pen but the pen's LABEL, which is lettered to its
  // right and would otherwise be cropped mid-word
  const viewBox = input.fitToMarks ? `220 210 ${penX + 150 - 220} 330` : `0 210 ${W} 330`
  s.push(
    `<svg id="${escapeXml(input.svgId ?? 'plate')}" viewBox="${viewBox}" role="img" aria-label="${escapeXml(
      input.label ??
        `Instrument record strip: ${input.marks.length} marks on the wall-clock line; the record follows as a table.`,
    )}">`,
  )
  s.push(grid(250, penX + 30, 240, 500))
  s.push(`<polyline class="trace" points="250,${y} ${penX - 16},${y}"/>`)

  // marks, with deterministic same-day offsets (ported from the mockup's hand offsets)
  const seen = new Map<string, number>()
  const dayOffsets = input.dayOffsets ?? [-14, 30, 74, 118]
  const labelledDays = new Set<string>()
  let stampRow = new Map<string, number>()

  // The per-mark group attributes. A plate with no keys and no focus emits exactly what it always
  // did (`<g class="evt2" tabindex="0">`) — the focus vocabulary only appears once a caller opts
  // in by keying its marks, so /field, /field/history and their tests are untouched.
  const f = input.focus
  const attrs = (m: ControlMark): string => {
    const parts = ['class="evt2"']
    if (m.key !== undefined) {
      parts.push(`data-key="${escapeXml(m.key)}"`)
      if (!f?.filter?.length || f.filter.includes(m.kind)) parts.push('data-on=""')
      if (f?.dim?.includes(m.key)) parts.push('data-dim=""')
      if (f?.select === m.key) parts.push('data-sel=""')
    }
    if (!input.still) {
      parts.push('tabindex="0"')
      // A keyed mark is a live control (readout on focus, panel on Enter via the tour
      // wiring) — announce it as one. Unkeyed plates keep their historical emission.
      if (m.key !== undefined) parts.push('role="button"')
    }
    return parts.join(' ')
  }

  for (const m of input.marks) {
    const perDay = input.marks.filter((x) => x.date === m.date).length
    const k = seen.get(m.date) ?? 0
    seen.set(m.date, k + 1)
    const x = dx(m.date) + (perDay > 1 ? dayOffsets[k % dayOffsets.length] : 0)
    if (m.kind === 'instr') {
      s.push(
        `<g ${attrs(m)}><path class="instr" d="M${x - 6} ${y - 4} l6 -11 l6 11 Z"/><title>${escapeXml(m.date)} — ${escapeXml(m.label)}</title></g>`,
      )
    } else if (m.kind === 'flag') {
      s.push(
        `<g ${attrs(m)}><path class="flag-pole" d="M${x} ${y - 52} V${y - 4}"/><path class="flag" d="M${x} ${y - 52} l16 5 l-16 5 Z"/><title>${escapeXml(m.date)} — ${escapeXml(m.label)}</title></g>`,
      )
    } else if (m.kind === 'splicein') {
      s.push(
        `<g ${attrs(m)}><path class="splice" d="M${x} ${y - 70} C ${x - 10} ${y - 46}, ${x - 4} ${y - 22}, ${x} ${y - 6}"/><path class="instr" d="M${x - 5} ${y - 12} l5 9 l5 -9 Z"/><title>${escapeXml(m.date)} — ${escapeXml(m.label)}</title></g>`,
      )
      s.push(
        `<text class="t-n" x="${x - 6}" y="${y - 78}" text-anchor="end">${escapeXml(input.spliceLabel ?? 'from outside ↓')}</text>`,
      )
    } else {
      const row = stampRow.get(m.date) ?? 0
      stampRow.set(m.date, row + 1)
      const sy = y - 26 - row * 30
      s.push(
        `<g ${attrs(m)}><circle class="stamp" cx="${x}" cy="${sy}" r="9"/>` +
          `<text class="stamp-t" x="${x}" y="${(sy + 3.4).toFixed(1)}" text-anchor="middle">${escapeXml(m.letter ?? 'S')}</text>` +
          `<title>${escapeXml(m.date)} — ${escapeXml(m.label)}</title></g>`,
      )
    }
    if (!labelledDays.has(m.date)) {
      labelledDays.add(m.date)
      s.push(`<text class="t-n" x="${dx(m.date)}" y="${y + 26}" text-anchor="middle">${escapeXml(m.date.slice(5))}</text>`)
    }
  }

  // standing obligation + the pen
  if (input.obligation) {
    s.push(`<path class="obl-f" d="M${dx(input.obligation.fromDate)} ${y + 44} H${penX - 16}"/>`)
    s.push(`<text class="t-cav" x="${penX - 20}" y="${y + 38}" text-anchor="end">${escapeXml(input.obligation.label)}</text>`)
  }
  s.push(`<path class="pen" d="M${penX - 14} ${y} l22 -7 l-4 12 Z"/>`)
  s.push(`<text class="t-n" x="${penX + 10}" y="${y - 8}">${escapeXml(input.penLabel)}</text>`)

  s.push('</svg>')
  return s.join('\n')
}
