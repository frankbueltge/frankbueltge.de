// Build-time Pulse SVG generator (site-v2 work order §2; decisions doc 2026-07-16 §1.2): a
// TS port of research-ecology's docs/design/variants-2026-07-16-hub/hub_pulse_viz.py
// `pulse_svg()` + `smooth()` — same geometry constants, same Joy-Division-ridgeline grammar
// (one row per ISO week, older above newer, 2-hour UTC bins), same smoothing formula. Pure
// and deterministic: same snapshot ⇒ byte-identical SVG. No randomness, no clock reads — the
// python generator reads "now" itself (it's a one-off mockup tool); this renderer never does.
// Everything it needs — which week is current, where that week's data ends — is decided once
// by scripts/fetch-pulse.ts at snapshot time and carried in the JSON (`cutoff_bin`).
//
// Annotations (the right-margin notes, e.g. "the as-of edge") are likewise derived from the
// data, not hand-placed per specific week number the way the one-off mockup did — see
// `computeAnnotations` below.

export interface PulseWeek {
  iso_year: number
  iso_week: number
  /** Raw commit counts, one per 2-hour UTC bin, Monday 00:00 → Sunday 24:00 (length = snapshot's
   * bins_per_week). For the current (last) week, bins at/after `cutoff_bin` are structurally
   * zero — that time hasn't happened yet, not "no data". */
  bins: number[]
  /** Only meaningful (and only ever set) on the LAST week in the snapshot: how many leading
   * bins are real/elapsed. Absent = a complete, fully-elapsed week. */
  cutoff_bin?: number
}

export interface PulseSnapshot {
  schema_version: string
  generated_at: string
  /** Human-readable as-of stamp for the caption, e.g. "2026-07-16 09:31 UTC". */
  as_of: string
  bin_hours: number
  bins_per_week: number
  /** The ecology's repositories this snapshot was built from (checkout names). */
  repos: string[]
  total_commits: number
  /** Oldest first, current (possibly partial) week last. */
  weeks: PulseWeek[]
}

// ---------------------------------------------------------------- ridgeline geometry, ported
// 1:1 from hub_pulse_viz.py (W, ROW_GAP, PEAK_H, PAD_X, PAD_TOP, NOTE_W).
const W = 940
const ROW_GAP = 27
const PEAK_H = 96
const PAD_X = 46
const PAD_TOP = 130
const NOTE_W = 190

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/** Declared smoothing: moving average, window 3, two passes — ported verbatim from
 * hub_pulse_viz.py's `smooth()`. Boundaries clamp to the edge value (no wraparound). */
export function smooth(values: readonly number[], passes = 2): number[] {
  let v = values.slice()
  for (let pass = 0; pass < passes; pass++) {
    const prev = v
    v = prev.map((_, i) => (prev[Math.max(i - 1, 0)] + prev[i] + prev[Math.min(i + 1, prev.length - 1)]) / 3)
  }
  return v
}

function fmt(n: number): string {
  return n.toFixed(1)
}

/** Right-margin notes, derived purely from which weeks are silent (all-zero) — never hand-
 * placed at specific week numbers the way the one-off mockup generator did. Three rules, in
 * ascending priority (later overwrites earlier at the same row):
 *   1. the first row, if it is silent — "nothing recorded yet"
 *   2. the first transition from a silent row to a non-silent one — "the record begins"
 *   3. the last row (the current, as-of week) — "the as-of edge", always shown
 */
function computeAnnotations(weeks: readonly PulseWeek[], series: readonly number[][]): Map<number, string> {
  const notes = new Map<number, string>()
  const silent = series.map((s) => Math.max(...s, 0) === 0)

  if (weeks.length > 0 && silent[0]) {
    notes.set(0, `W${weeks[0].iso_week} · nothing recorded yet`)
  }
  for (let i = 1; i < weeks.length; i++) {
    if (silent[i - 1] && !silent[i]) {
      notes.set(i, `W${weeks[i].iso_week} · the record begins`)
      break
    }
  }
  const last = weeks.length - 1
  if (last >= 0) {
    notes.set(last, `W${weeks[last].iso_week} · the as-of edge`)
  }
  return notes
}

/** Builds the pulse SVG markup (viewBox + all inner elements) as a raw string, mirroring
 * hub_pulse_viz.py's `pulse_svg()` structure: one ridgeline per ISO week, oldest row on top,
 * current (possibly partial) row last — its area closes at the last real bin, its stroke ends
 * open there (nothing is drawn past the as-of edge). Silent weeks stay visible at low opacity
 * (Bestandsregel: absence is drawn, never hidden). Stays on the site's mono skin — the
 * ridgeline uses the plain --color-bg/--color-fg tokens, no practice-colour exception. */
export function buildPulseSvg(snapshot: PulseSnapshot): string {
  const { weeks, bins_per_week: BINS } = snapshot
  if (weeks.length === 0) {
    throw new Error('buildPulseSvg: snapshot has no weeks')
  }
  for (const wk of weeks) {
    if (wk.bins.length !== BINS) {
      throw new Error(
        `buildPulseSvg: week ${wk.iso_year}-W${wk.iso_week} has ${wk.bins.length} bins, expected ${BINS} (bins_per_week)`,
      )
    }
  }

  const series = weeks.map((wk) => smooth(wk.bins))
  const peak = Math.max(1, ...series.map((s) => Math.max(...s, 0)))
  const height = PAD_TOP + ROW_GAP * (weeks.length - 1) + 40
  const xs = Array.from({ length: BINS }, (_, i) => PAD_X + (i * (W - 2 * PAD_X)) / (BINS - 1))
  const notes = computeAnnotations(weeks, series)
  const lastRow = weeks.length - 1

  const parts: string[] = []
  weeks.forEach((wk, r) => {
    const base = PAD_TOP + r * ROW_GAP
    const isCurrent = r === lastRow
    const n = isCurrent ? Math.max(1, Math.min(wk.cutoff_bin ?? BINS, BINS)) : BINS
    const s = series[r]
    const silent = Math.max(...s, 0) === 0
    const y = Array.from({ length: n }, (_, i) => base - (s[i] / peak) * PEAK_H)
    const pts = Array.from({ length: n }, (_, i) => `L${fmt(xs[i])} ${fmt(y[i])}`).join('')

    if (isCurrent) {
      // Area closed to the baseline at the last real bin (no further); stroke stays open there
      // — "here ends what the ledger knows" for the pulse, the same as-of honesty score.ts
      // carries for the encounter map.
      parts.push(`<path d="M0 ${base}H${PAD_X}${pts}L${fmt(xs[n - 1])} ${base}Z" fill="var(--color-bg)"/>`)
      parts.push(
        `<path d="M0 ${base}H${PAD_X}${pts}" fill="none" stroke="var(--color-fg)" stroke-width="1.3" stroke-linejoin="round"/>`,
      )
    } else {
      const quiet = silent ? ' opacity=".33"' : ''
      parts.push(
        `<path d="M0 ${base}H${PAD_X}${pts}L${W - PAD_X} ${base}H${W}" fill="var(--color-bg)" ` +
          `stroke="var(--color-fg)" stroke-width="1.3" stroke-linejoin="round"${quiet}/>`,
      )
    }
    const label = notes.get(r)
    if (label) {
      parts.push(`<text x="${W + 10}" y="${base - 2}" class="pulse-note">${escapeXml(label)}</text>`)
    }
  })

  const ariaLabel =
    `The pulse: ${weeks.length} weeks of recorded practice across the ecology's ` +
    `${snapshot.repos.length} repositories, one ridgeline per ISO week.`

  return (
    `<svg viewBox="0 0 ${W + NOTE_W} ${height}" role="img" aria-label="${escapeXml(ariaLabel)}">` +
    parts.join('') +
    '</svg>'
  )
}

/** "W17–W29 2026" (same year) or "W51 2025–W11 2026" (window crosses a year boundary) — for the
 * caption. Pure formatting of the snapshot's own first/last week, no clock reads. */
export function formatWeekRange(weeks: readonly PulseWeek[]): string {
  if (weeks.length === 0) return ''
  const first = weeks[0]
  const last = weeks[weeks.length - 1]
  if (first.iso_year === last.iso_year) {
    return `W${first.iso_week}–W${last.iso_week} ${last.iso_year}`
  }
  return `W${first.iso_week} ${first.iso_year}–W${last.iso_week} ${last.iso_year}`
}
