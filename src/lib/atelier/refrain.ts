// src/lib/atelier/refrain.ts — the refrain score: a work-line's temporality drawn as a
// three-voice score. Territory, home, opening — all three voices sound at every tick; what
// shifts is DOMINANCE. That is the published model's postulate 4 (ATP 311–312, "sometimes,
// sometimes, sometimes"), and it is this figure's thesis: the one forbidden reading is the
// phase sequence, so the drawing never lets a voice disappear — a Gantt chart cannot be
// produced from this model, and refrain.test.ts asserts exactly that.
//
// Spec: docs/superpowers/specs/2026-08-02-refrain-partitur.md. Build pattern as in
// src/lib/atelier/passage.ts: this module is the figure as data and as an SVG string —
// pure, deterministic, testable, free of colour and font (the skin lives in
// src/styles/atelier-refrain.css); the build-tool bindings live in refrain-data.ts.
//
// Parsing rules, and why they are conservative:
//   · The records are prose with stable conventions, not a schema. Every reading this module
//     takes is anchored to a sentence it can quote verbatim; a tick whose reading cannot be
//     extracted renders as an UNMARKED tick — visible, dated, claiming nothing. Never
//     interpolated, never inherited from the previous tick ("Feststellung entfällt").
//   · No hardcoded totals anywhere. The archive grows because the practice works; the gate
//     lesson of 2026-08-01/02 (a pinned 11 blocked publication for six runs) applies to
//     builders as much as to tests.
//   · Motifs are DECLARED per line (a curated literal list), never inferred by fuzzy
//     matching — a glyph the parser guessed would be an invention in the figure.

import { escapeXml } from '@/lib/dataviz/geometry'

// ---------------------------------------------------------------- input

export type Voice = 'territory' | 'home' | 'opening'
export const VOICES: readonly Voice[] = ['territory', 'home', 'opening']

export interface RefrainSource {
  /** the line's project id, e.g. 2026-07-23-negative-parallax */
  id: string
  /** TRACE.md, raw */
  trace: string
  /** SCORE.md, raw (frontmatter: title, kind, refrain_aspect) */
  score: string
  /** declared leitmotifs of this line — literal strings, matched verbatim, curated per line */
  motifs?: string[]
}

// ---------------------------------------------------------------- events

export interface RefrainEvent {
  kind: 'tick' | 'compost'
  /** tick number; null for a compost-in (material arriving, not an operation) */
  n: number | null
  date: string
  /** the heading's own words after the date, verbatim */
  title: string
  /** coarse classification of the operation, from the heading only */
  operation: 'initiation' | 'expose' | 'declaration' | 'home' | 'opening' | 'review' | 'compost' | 'operation'
  /** the dominant aspect the record states for this tick — null is an honest gap */
  aspect: Voice | null
  /** the verbatim sentence the aspect reading stands on */
  aspectQuote: string | null
  /** verbatim sentence recording a deferred opening this tick, if the record states one */
  deferral: string | null
  /** true when the tick itself is an outward move (an opening operation) */
  opening: boolean
  /** declared motifs of the line that occur verbatim in this tick's section */
  motifs: string[]
}

const TICK_RE = /^## Tick (\d+) — (\d{4}-\d{2}-\d{2})(?:\s*—\s*|\s*\(\s*)?(.*)$/
/** The encounter line writes its headings date-first: "## 2026-07-25 — Tick 1: …". Same
 *  statement, different order — taught here rather than skipped, because a convention the
 *  practice actually uses is not noise. */
const TICK_ALT_RE = /^## (\d{4}-\d{2}-\d{2}) — Tick (\d+):\s*(.*)$/
const COMPOST_RE = /^## Compost in — (\d{4}-\d{2}-\d{2})(?:\s*—\s*)?(.*)$/

/** Strip markdown emphasis/backticks from a quoted sentence — typographic unwrapping only,
 *  never a rewording. */
function unmark(s: string): string {
  return s.replace(/\*\*|\*|`/g, '').replace(/\s+/g, ' ').trim()
}

/** The full sentence around a match index — expands to the previous and next sentence
 *  boundary so the quote carries its own context, not a fragment. A single newline is NOT a
 *  boundary (the records hard-wrap prose mid-sentence); a blank line is. */
function sentenceAt(text: string, index: number): string {
  const stops = /[.!?](?=\s)|\n\n/g
  let start = 0
  let m: RegExpExecArray | null
  while ((m = stops.exec(text)) !== null) {
    if (m.index + m[0].length > index) break
    start = m.index + m[0].length
  }
  const rest = text.slice(index)
  const end = rest.search(/[.!?](\s|$)|\n\n/)
  const stop = end === -1 ? text.length : index + end + 1
  return text.slice(start, stop).trim()
}

function classifyOperation(title: string, isCompost: boolean): RefrainEvent['operation'] {
  if (isCompost) return 'compost'
  const t = title.toLowerCase()
  // "opening" must LEAD the title ("Opening: …", "Opening operation: …") — a home operation
  // that merely talks about an opening is not one.
  if (/^opening\b/.test(t)) return 'opening'
  if (t.includes('review')) return 'review'
  if (t.includes('home operation') || t.startsWith('home ')) return 'home'
  if (t.includes('expose')) return 'expose'
  if (t.includes('declaration')) return 'declaration'
  if (t.includes('initiation') || t.includes('construct')) return 'initiation'
  return 'operation'
}

/** The dominant aspect a tick's section states, with the sentence it stands on.
 *  Three patterns, in order of explicitness; anything less explicit stays null. */
export function readAspect(section: string): { aspect: Voice; quote: string } | null {
  const patterns: RegExp[] = [
    // "Dominant aspect: **home**" / "Dominant aspect for the *line*: **home**"
    /Dominant aspect[^.\n]*?\*\*(territory|home|opening)\*\*/i,
    // "Home aspect dominates" / "Home aspect still dominates *this* tick"
    /\b(territory|home|opening) aspect (?:still )?dominates\b/i,
    // "**Line status.** ACTIVE, open horizon, aspect home."
    /\baspect (territory|home|opening)\b/i,
    // "**Aspect: territory. OUTWARD**" — the spelling the practice has used since its ticks
    // began stating the aspect in the TRACE section rather than in SCORE §11. Added 2026-08-12:
    // the colon meant the pattern above missed every one of them, so a record that plainly
    // states its aspect read as an honest gap. Found when this line's trace was rotated under
    // §8's floor and the older, differently-spelled ticks left the live file — the count fell to
    // zero and exposed a reading that had been silently incomplete for a fortnight.
    /\bAspect:\s*\*{0,2}(territory|home|opening)\b/i,
  ]
  for (const re of patterns) {
    const m = re.exec(section)
    if (m) {
      return {
        aspect: m[1].toLowerCase() as Voice,
        quote: unmark(sentenceAt(section, m.index)),
      }
    }
  }
  return null
}

/** A deferral the record states as this tick's own decision. Conservative on purpose:
 *  the sentence must contain a deferral word AND name the thing deferred (an opening or
 *  outward move), and subjunctive discussion ("deferring … would have been") is excluded —
 *  a hypothetical is not a decision. */
export function readDeferral(section: string): string | null {
  const re = /deferr(?:ed|al|ing)?/gi
  let m: RegExpExecArray | null
  while ((m = re.exec(section)) !== null) {
    const sentence = sentenceAt(section, m.index)
    if (!/open|outward|move/i.test(sentence)) continue
    if (/would have|could have|would be|deferring on that ground/i.test(sentence)) continue
    return unmark(sentence)
  }
  return null
}

/** Every event in the TRACE, in record order. Fidelity contract: one event per `## Tick N`
 *  or `## Compost in` heading — nothing invented, nothing dropped, order untouched. */
export function parseTrace(trace: string, motifs: string[] = []): RefrainEvent[] {
  const events: RefrainEvent[] = []
  const lines = trace.split('\n')
  // section boundaries: every `## ` heading
  const bounds: { header: string; start: number }[] = []
  lines.forEach((line, i) => {
    if (line.startsWith('## ')) bounds.push({ header: line, start: i })
  })
  bounds.forEach((b, k) => {
    const end = k + 1 < bounds.length ? bounds[k + 1].start : lines.length
    const section = lines.slice(b.start + 1, end).join('\n')
    const tick = TICK_RE.exec(b.header)
    const alt = tick ? null : TICK_ALT_RE.exec(b.header)
    const compost = tick || alt ? null : COMPOST_RE.exec(b.header)
    if (!tick && !alt && !compost) return
    const [n, date, rawTitle] = tick
      ? [Number(tick[1]), tick[2], tick[3]]
      : alt
        ? [Number(alt[2]), alt[1], alt[3]]
        : [null, compost![1], compost![2]]
    const title = unmark(rawTitle.replace(/\)\s*$/, ''))
    const operation = classifyOperation(title, Boolean(compost))
    const reading = readAspect(section)
    events.push({
      kind: compost ? 'compost' : 'tick',
      n,
      date,
      title,
      operation,
      aspect: reading?.aspect ?? null,
      aspectQuote: reading?.quote ?? null,
      deferral: readDeferral(section),
      opening: operation === 'opening',
      motifs: motifs.filter((p) => section.includes(p)),
    })
  })
  return events
}

// ---------------------------------------------------------------- the line's own frame

/** Frontmatter fields read off the raw SCORE — same tolerant regex the entrance uses. */
function fmField(raw: string, key: string): string | undefined {
  return (
    raw
      .split('\n---')[0]
      .match(new RegExp(`^${key}:\\s*"?([^"\\n]*)"?`, 'm'))?.[1]
      ?.trim() || undefined
  )
}

export function isWorkLine(scoreRaw: string): boolean {
  return fmField(scoreRaw, 'kind') === 'work-line'
}

/** The line's declared status (ACTIVE / CLOSED / …) — the score is a present-tense figure,
 *  so its callers render ACTIVE lines and leave closed ones to the archive passage. */
export function lineStatus(scoreRaw: string): string | undefined {
  return fmField(scoreRaw, 'status')
}

// ---------------------------------------------------------------- model

export interface RefrainColumn {
  /** stable key a panel/tour addresses the column by */
  key: string
  x: number
  event: RefrainEvent
  /** days of silence between the previous event and this one; 0 or 1 means none */
  gapBefore: number
}

export interface RefrainStave {
  voice: Voice
  y: number
}

export interface RefrainModel {
  line: {
    id: string
    title: string
    /** the line's current aspect from SCORE frontmatter — the "as of" state, not a per-tick reading */
    currentAspect: Voice | null
  }
  columns: RefrainColumn[]
  /** all three staves, always — the no-sequence guarantee lives in the model's shape */
  staves: RefrainStave[]
  /** x positions where a caesura (marked silence) is drawn, with its length in days */
  gaps: { x: number; days: number }[]
  /** date labels, printed where the date changes; `row` staggers labels that would collide
   *  (same-day clusters put two dates 34 units apart — closer than a date is wide) */
  axis: { x: number; label: string; row: 0 | 1 }[]
  motifRowY: number | null
  width: number
  height: number
  /** the column pitch this sheet was laid out at — the marks scale with it (see buildRefrainSvg) */
  step: number
}

// Geometry constants — a measured sheet, not a chart. The x axis is EVENT-ORDERED: one step
// per event, plus a bounded widening where days passed in silence. Same-day clusters read
// dense, silence reads as a hole — the irregular cadence is the data (spec §3).
//
// The pitch is ADAPTIVE since 2026-08-16. The first cut (2026-08-02) scaled the whole drawing
// down and was unreadable; the second (fixed 42-unit pitch) grew to 2 960 px by move 65 and had
// to be scrolled sideways, which Frank rejected the day the score moved onto the station sheet's
// panel. Neither failure was the data's: what must never shrink is the TYPE, and what must never
// scroll is the SHEET. So the sheet keeps a fixed target width, the pitch divides it among the
// moves (floored — a very long record scrolls rather than turning to noise), and the mark radii
// derive from the pitch so neighbouring marks stay apart at any density. Text is never scaled.
const LABEL_W = 88
const X0 = LABEL_W + 8
const STEP_MAX = 42
const STEP_MIN = 11
/** the sheet's target width: the station sheet's content column (eco-wrap 1180 − 2×40 padding) */
const TARGET_W = 1100
/** extra width per silent day, capped — a three-week hole must be visible, not dominant */
const GAP_UNIT = 10
const GAP_MAX_DAYS = 4
const TOP = 50
const STAVE_GAP = 56
const MOTIF_GAP = 44
const BOTTOM = 60
const R_PAD = 34

const MONTHS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec']
export function dayLabel(d: string): string {
  return /^\d{4}-\d{2}-\d{2}$/.test(d) ? `${Number(d.slice(8, 10))} ${MONTHS[Number(d.slice(5, 7)) - 1]}` : d
}

const dayMs = (d: string) => Date.parse(`${d}T00:00:00Z`)
const round = (v: number) => Math.round(v * 10) / 10

export function buildRefrainModel(source: RefrainSource): RefrainModel {
  const events = parseTrace(source.trace, source.motifs ?? [])
  const title = fmField(source.score, 'title') ?? source.id
  const rawAspect = fmField(source.score, 'refrain_aspect')?.split('#')[0].trim().toLowerCase()
  const currentAspect = (VOICES as readonly string[]).includes(rawAspect ?? '')
    ? (rawAspect as Voice)
    : null

  const hasMotifs = (source.motifs ?? []).length > 0
  const staves: RefrainStave[] = VOICES.map((voice, i) => ({ voice, y: TOP + i * STAVE_GAP }))
  const motifRowY = hasMotifs ? TOP + 2 * STAVE_GAP + MOTIF_GAP : null
  const height = (motifRowY ?? TOP + 2 * STAVE_GAP) + BOTTOM

  // The pitch: divide the target width among the moves, after the silence-widening has taken
  // its share — measured first, because a caesura is layout the moves must not absorb.
  const gapDays = (a: string, b: string) => {
    const diff = Math.round((dayMs(b) - dayMs(a)) / 86_400_000)
    return Number.isFinite(diff) && diff > 0 ? diff : 0
  }
  const widenTotal = events.reduce((sum, event, i) => {
    const gap = i > 0 ? gapDays(events[i - 1].date, event.date) : 0
    return sum + (gap >= 2 ? Math.min(gap, GAP_MAX_DAYS) * GAP_UNIT : 0)
  }, 0)
  const step = Math.max(
    STEP_MIN,
    Math.min(STEP_MAX, Math.floor((TARGET_W - X0 - R_PAD - widenTotal) / Math.max(1, events.length))),
  )

  const columns: RefrainColumn[] = []
  const gaps: { x: number; days: number }[] = []
  const axis: { x: number; label: string; row: 0 | 1 }[] = []
  /** a date label needs about this much room before the next one may share its row */
  const LABEL_ROOM = 50
  let x = X0
  let prevDate: string | null = null
  events.forEach((event) => {
    const gapBefore = prevDate ? gapDays(prevDate, event.date) : 0
    if (gapBefore >= 2) {
      const widen = Math.min(gapBefore, GAP_MAX_DAYS) * GAP_UNIT
      gaps.push({ x: round(x + widen / 2 - step / 4), days: gapBefore })
      x += widen
    }
    if (event.date !== prevDate) {
      // A label takes the first ROW with room at this x; when both rows are still occupied the
      // label is dropped rather than printed into its neighbour — at a dense pitch three dates
      // can change within one label's width, and every date is still on the column's <title>,
      // the readout, the panel and the table. (The old rule only looked at the immediately
      // preceding label, which let a third close date collide with the first.)
      const lastAt: Record<0 | 1, number> = { 0: -Infinity, 1: -Infinity }
      for (const a of axis) lastAt[a.row] = a.x
      const row: 0 | 1 | null = x - lastAt[0] >= LABEL_ROOM ? 0 : x - lastAt[1] >= LABEL_ROOM ? 1 : null
      if (row !== null) axis.push({ x: round(x), label: dayLabel(event.date), row })
    }
    columns.push({
      key: event.kind === 'tick' ? `tick-${event.n}` : `compost-${event.date}-${columns.length}`,
      x: round(x),
      event,
      gapBefore,
    })
    prevDate = event.date
    x += step
  })

  return {
    line: { id: source.id, title, currentAspect },
    columns,
    staves,
    gaps,
    axis,
    motifRowY,
    width: Math.ceil(x + R_PAD),
    height,
    step,
  }
}

// ---------------------------------------------------------------- the SVG

export interface RefrainRenderOptions {
  /** voices drawn at full strength; empty/absent = every voice on (resting state) */
  filter?: Voice[]
  /** one column key drawn as chosen */
  select?: string
  /** a still carries no interaction hooks */
  still?: boolean
  /** accessible name for the whole figure */
  label?: string
  /** visitor-facing voice names, from the wording config — copy never lives here */
  voiceLabels: Record<Voice, string>
  /** lettered under the motif row's label column, when the line declares motifs */
  motifLabel?: string
  /** wording for the per-column <title>: aspect unreadable */
  unreadLine: string
}

export function refrainViewBox(model: RefrainModel): string {
  return `0 0 ${model.width} ${model.height}`
}

/** A small quarter-rest squiggle — the deferred opening as a NOTATED rest, drawn at the
 *  opening stave. Deferring is a decision the record states; the mark makes it part of the
 *  music rather than a gap (spec §3). */
const REST_PATH = 'M -1.8 -6 C 2.4 -3.4, -2.4 -0.6, 1.8 2.4 C -0.6 1.2, -1.4 3.6, 0.6 5.6'

export function buildRefrainSvg(model: RefrainModel, opts: RefrainRenderOptions): string {
  const voiceOn = (v: Voice) => !opts.filter?.length || opts.filter.includes(v)

  // Mark radii derive from the pitch, capped at the sizes the 42-unit sheet always used, so a
  // dense record reads as a denser score instead of overlapping ink. The dominant/minor RATIO
  // is kept — emphasis is the drawing's one claim per column and must survive any density.
  const step = model.step
  const rDom = Math.max(3.2, Math.min(6.4, step * 0.3))
  const rMin = Math.max(1.5, Math.min(3, step * 0.14))
  const rUnread = Math.max(2.2, Math.min(4, step * 0.19))
  const rOpen = rDom + 3.4
  const restScale = Math.max(0.7, Math.min(1.25, step / 33))
  /** tick numbers need about 22 units of pitch before neighbours stop colliding; below that
   *  the number lives in the column's <title>, the readout, the panel and the table */
  const drawTickNumbers = step >= 22

  const s: string[] = []
  s.push(
    `<svg class="at-rf-svg" viewBox="${refrainViewBox(model)}" width="${model.width}" height="${model.height}" role="img"` +
      ` preserveAspectRatio="xMidYMid meet" aria-label="${escapeXml(opts.label ?? defaultLabel(model, opts))}">`,
  )

  // — the staves: one per voice, full width, ALWAYS all three. Identity is carried by the
  //   stave's position and its direct label; colour reinforces, never carries alone.
  for (const stave of model.staves) {
    const on = voiceOn(stave.voice)
    s.push(`<g class="rf-voice" data-voice="${stave.voice}"${on ? ' data-on=""' : ''}>`)
    s.push(`<line class="rf-stave" x1="${X0 - 8}" y1="${stave.y}" x2="${model.width - R_PAD + 12}" y2="${stave.y}"/>`)
    s.push(`<line class="rf-chip" x1="4" y1="${stave.y}" x2="16" y2="${stave.y}"/>`)
    s.push(`<text class="rf-voice-label" x="20" y="${stave.y + 3.5}">${escapeXml(opts.voiceLabels[stave.voice])}</text>`)
    s.push('</g>')
  }
  if (model.motifRowY !== null && opts.motifLabel) {
    s.push(`<text class="rf-motif-label" x="20" y="${model.motifRowY + 3.5}">${escapeXml(opts.motifLabel)}</text>`)
  }

  // — marked silence: a caesura across the stave block, its length lettered. The hole carries.
  for (const gap of model.gaps) {
    const y0 = TOP - 16
    const y1 = TOP + 2 * STAVE_GAP + 16
    s.push(`<g class="rf-gap"><title>${escapeXml(`${gap.days} days without a move`)}</title>`)
    s.push(`<line x1="${gap.x - 3}" y1="${y0 + 10}" x2="${gap.x + 5}" y2="${y0}"/>`)
    s.push(`<line x1="${gap.x + 3}" y1="${y0 + 10}" x2="${gap.x + 11}" y2="${y0}"/>`)
    s.push(`<line class="rf-gap-drop" x1="${gap.x + 4}" y1="${y0 + 12}" x2="${gap.x + 4}" y2="${y1 - 8}"/>`)
    s.push(`<text x="${gap.x + 4}" y="${y1 + 4}" text-anchor="middle">${gap.days}d</text>`)
    s.push('</g>')
  }

  // — the date line, printed where the date changes; colliding neighbours drop to a second row
  s.push('<g class="rf-axis">')
  for (const a of model.axis) {
    s.push(
      `<text x="${a.x}" y="${model.height - 40 + a.row * 13}" text-anchor="middle">${escapeXml(a.label)}</text>`,
    )
  }
  s.push('</g>')

  // — the columns: every event, every voice — the coexistence is drawn, not asserted
  for (const col of model.columns) {
    const e = col.event
    const attrs = [`class="rf-col"`, `data-key="${escapeXml(col.key)}"`]
    if (e.aspect === null) attrs.push('data-unread=""')
    if (opts.select === col.key) attrs.push('data-sel=""')
    if (!opts.still) attrs.push('tabindex="0"', 'role="button"')
    s.push(`<g ${attrs.join(' ')}>`)
    const what = e.kind === 'compost' ? 'compost in' : `tick ${e.n}`
    const aspectLine = e.aspect ? `dominant aspect: ${e.aspect}` : opts.unreadLine
    s.push(`<title>${escapeXml(`${dayLabel(e.date)} — ${what} — ${aspectLine}${e.deferral ? ' — opening deferred' : ''}`)}</title>`)

    for (const stave of model.staves) {
      const dominant = e.aspect === stave.voice
      const cls = e.aspect === null ? 'rf-unread' : dominant ? 'rf-note' : 'rf-note-min'
      s.push(
        `<circle class="${cls}" data-voice="${stave.voice}"${voiceOn(stave.voice) ? ' data-von=""' : ''}` +
          ` cx="${col.x}" cy="${stave.y}" r="${e.aspect === null ? rUnread : dominant ? rDom : rMin}"/>`,
      )
    }
    const openingStave = model.staves[2]
    if (e.opening) {
      s.push(`<circle class="rf-opening-event" data-voice="opening" cx="${col.x}" cy="${openingStave.y}" r="${rOpen}"/>`)
    }
    if (e.deferral) {
      s.push(`<path class="rf-rest" data-voice="opening" d="${REST_PATH}" transform="translate(${round(col.x + step * 0.26)} ${openingStave.y}) scale(${restScale})"/>`)
    }
    if (e.kind === 'compost') {
      const t = model.staves[0]
      s.push(`<path class="rf-compost" d="M ${col.x - 10} ${t.y - 14} Q ${col.x} ${t.y - 16}, ${col.x} ${t.y - 4}"/>`)
    }
    if (model.motifRowY !== null && e.motifs.length) {
      s.push(
        `<path class="rf-motif" d="M ${col.x} ${model.motifRowY - 5} l 5 5 l -5 5 l -5 -5 z">` +
          `<title>${escapeXml(e.motifs.join(' · '))}</title></path>`,
      )
    }
    if (e.kind === 'tick' && drawTickNumbers) {
      s.push(`<text class="rf-n" x="${col.x}" y="${model.height - 12}" text-anchor="middle">${e.n}</text>`)
    }
    if (!opts.still) {
      s.push(`<rect class="rf-focus" x="${round(col.x - step / 2 + 1)}" y="${TOP - 22}" width="${step - 2}" height="${(model.motifRowY ?? TOP + 2 * STAVE_GAP) - TOP + 40}" rx="5"/>`)
      s.push(`<rect class="rf-colhit" x="${round(col.x - step / 2 + 1)}" y="${TOP - 22}" width="${step - 2}" height="${(model.motifRowY ?? TOP + 2 * STAVE_GAP) - TOP + 40}"/>`)
    }
    s.push('</g>')
  }

  s.push('</svg>')
  return s.join('\n')
}

function defaultLabel(model: RefrainModel, opts: RefrainRenderOptions): string {
  const marked = model.columns.filter((c) => c.event.aspect !== null).length
  const deferred = model.columns.filter((c) => c.event.deferral).length
  return (
    `The refrain score of ${model.line.title}: ${model.columns.length} moves on three voices ` +
    `(${VOICES.map((v) => opts.voiceLabels[v]).join(', ')}), ${marked} with a stated dominant aspect, ` +
    `${deferred} with a deferred opening notated as a rest. All three voices sound at every tick.`
  )
}

// ---------------------------------------------------------------- the table floor

export const REFRAIN_COLUMNS: { key: string; label: string; nowrap?: boolean }[] = [
  { key: 'move', label: 'move', nowrap: true },
  { key: 'date', label: 'date', nowrap: true },
  { key: 'operation', label: 'operation', nowrap: true },
  { key: 'aspect', label: 'dominant aspect (verbatim)' },
  { key: 'opening', label: 'opening' },
  { key: 'motifs', label: 'motifs' },
]

export interface RefrainRow {
  move: string
  date: string
  operation: string
  aspect: string
  opening: string
  motifs: string
  [column: string]: string
}

/** One row per event. The aspect column carries the verbatim sentence the reading stands on,
 *  or the honest-gap line; the opening column carries the deferral sentence whole — nothing
 *  on this sheet is reachable only by hovering a mark. */
export function refrainRows(
  model: RefrainModel,
  wording: { unreadLine: string; openedLine: string; deferredPrefix: string; noneLine: string; compostLine: string },
): RefrainRow[] {
  return model.columns.map((c) => {
    const e = c.event
    return {
      move: e.kind === 'tick' ? `tick ${e.n}` : 'compost in',
      date: e.date,
      operation: e.kind === 'compost' ? wording.compostLine : e.operation,
      aspect: e.aspectQuote ?? wording.unreadLine,
      opening: e.opening ? wording.openedLine : e.deferral ? `${wording.deferredPrefix} ${e.deferral}` : wording.noneLine,
      motifs: e.motifs.join(' · '),
    }
  })
}
