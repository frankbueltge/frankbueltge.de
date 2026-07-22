// Build-time Partitur generator (work order phase-c2-site-entrance-design.md §2): a TS port of
// research-ecology's docs/design/variants-2026-07-15/assemble_variants.py `build_svg()`. Same
// geometry constants, same sign per event-type family, same lane/flow/obligation/divergence
// grammar (docs/design/zeichengrammatik-2026-07-15.md). Pure and deterministic: same score.json
// input ⇒ byte-identical SVG output. No randomness, no clock reads, no force layout — every
// coordinate is a function of the data (zeichengrammatik §5, "Determinismus-Vertrag").
//
// Types below duck-type research-ecology's packages/protocol `ScoreExport` shape rather than
// importing it — this site has no dependency on the research-ecology package, the same reasoning
// research-ecology's own packages/projections uses to duck-type packages/protocol's
// `LensDefinition` instead of importing it (see that file's own comment).

export interface ScoreEventIssuer {
  collective_id: string | null
  actor_id: string
}

export interface ScoreParticipant {
  actor_id: string
  collective_id?: string | null
  role: string
  local_status?: string | null
  /** Lane id this participant's events are drawn on. */
  lane?: string
  /** Vertical drawing rank, top to bottom (source above conductor above receiver). */
  rank?: number
}

export interface ScoreEvent {
  event_id: string
  event_type: string
  date: string
  issuer: ScoreEventIssuer
  lane: string
  infra: boolean
  station: number | null
  quote?: string | null
  attribution?: string | null
}

export interface ScoreObligation {
  id: string
  label: string
  lane: string
  source_event_id: string
  status: string
  clause_text?: string
}

export interface ScoreFlow {
  from_event_id: string
  to_event_id: string
  direction: 'downstream' | 'upstream'
}

export interface ScoreDivergence {
  leftLabel: string
  leftQuote: string
  rightLabel: string
  rightQuote: string
  closing: string
  leftLane?: string
  rightLane?: string
  station?: number | null
}

export interface ScoreExport {
  schema_version: string
  encounter_id: string
  headline: string
  status: { as_of: string; statusLine: string }
  authored_by: string
  approval: 'pending' | 'approved'
  akte: string
  participants: ScoreParticipant[]
  non_participants?: Array<{ collective_id: string; note: string }>
  events: ScoreEvent[]
  obligations: ScoreObligation[]
  flows: ScoreFlow[]
  divergence: ScoreDivergence
}

// ---------------------------------------------------------------- geometry constants, ported
// 1:1 from assemble_variants.py. Pinned to THIS encounter's 7-event, 3-lane ledger — a different
// event count needs the Zeit-Skalierung lens (zeichengrammatik-2026-07-15.md §7), a different,
// not-yet-built generator, not a silent re-layout of this one.
const W = 1440
const RULER_Y = 232
const LANE_X0 = 210
const ASOF_X = 1336
const DIV_X = 1250
const LANE_Y_BY_RANK = [300, 450, 580]

// Ordinal event positions — the Zeit-Skalierung lens (zeichengrammatik-2026-07-15.md §7),
// now built. Instead of a fixed seven-slot array, positions are DERIVED from the ledger's own
// event count so any encounter renders (not only the ported enc-2026-001). The original,
// hand-placed seven-event mockup layout is returned verbatim when the count is seven — so the
// ported encounter stays pixel-identical, no silent re-layout — while every other count spreads
// evenly across the same ruler span (EVT_SPAN_X0 … EVT_SPAN_X1). Still ordinal (ledger order),
// as the ruler caption states; a true date-scaled placement would be a further lens on top.
const PORTED_EVT_X = [340, 470, 600, 730, 860, 970, 1060]
const EVT_SPAN_X0 = PORTED_EVT_X[0]
const EVT_SPAN_X1 = PORTED_EVT_X[PORTED_EVT_X.length - 1]
function eventPositions(count: number): number[] {
  if (count === PORTED_EVT_X.length) return PORTED_EVT_X
  if (count <= 1) return [Math.round((EVT_SPAN_X0 + EVT_SPAN_X1) / 2)]
  const step = (EVT_SPAN_X1 - EVT_SPAN_X0) / (count - 1)
  return Array.from({ length: count }, (_, i) => Math.round(EVT_SPAN_X0 + i * step))
}
/** Greedy word-wrap budget for the divergence terminal's inline quotes (matches the design
 * session's own line lengths, ~44 chars — docs/design/variants-2026-07-15/a-observatorium.html). */
const DIVERGENCE_QUOTE_WRAP = 44

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/** Deterministic greedy word-wrap — no hand-picked per-quote line breaks (those would be typing
 * the design session's own text back in); any quote of any length wraps the same way every time. */
function wrapLines(text: string, maxChars: number): string[] {
  const words = text.split(' ')
  const lines: string[] = []
  let current = ''
  for (const word of words) {
    const candidate = current ? `${current} ${word}` : word
    if (candidate.length > maxChars && current) {
      lines.push(current)
      current = word
    } else {
      current = candidate
    }
  }
  if (current) lines.push(current)
  return lines
}

function quotedTspans(x: number, text: string): string {
  const lines = wrapLines(text, DIVERGENCE_QUOTE_WRAP)
  return lines
    .map((line, i) => {
      const decorated = (i === 0 ? '“' : '') + line + (i === lines.length - 1 ? '”' : '')
      return `<tspan x="${x}" dy="${i === 0 ? 0 : 14}">${escapeXml(decorated)}</tspan>`
    })
    .join('')
}

function badge(n: number, x: number, y: number): string {
  return `<circle class="badge" cx="${x}" cy="${y}" r="9"/><text class="badge-n" x="${x}" y="${(y + 3.2).toFixed(1)}" text-anchor="middle">${n}</text>`
}

/** Sign per event-type family (zeichengrammatik §2). The final branch is the documented
 * fallback for an unknown family — never a guessed sign. */
function glyph(e: ScoreEvent, x: number, y: number): string {
  const c = e.infra ? 'pr-infra' : `pr-${e.lane}`
  const fam = e.event_type.split('.')[0]
  if (e.event_type === 'contract.published') {
    return (
      `<path class="mk ${c}" d="M${x} ${y - 16} V${y + 16}" />` +
      `<path class="mk mk-lt ${c}" d="M${x + 7} ${y - 16} V${y + 16}" />` +
      `<path class="mk ${c}" d="M${x + 7} ${y} H${x + 20}" marker-end="url(#tick)"/>`
    )
  }
  if (fam === 'object') {
    return `<rect class="mk-fill ${c}" x="${x - 8}" y="${y - 8}" width="16" height="16" />`
  }
  if (e.event_type === 'translation.loss_declared') {
    return (
      `<rect class="mk-hatch ${c}" x="${x - 16}" y="${y - 7}" width="11" height="14" />` +
      `<rect class="mk-hatch ${c}" x="${x + 5}" y="${y - 7}" width="11" height="14" />` +
      `<path class="mk-void" d="M${x - 3} ${y - 11} V${y + 11}" />`
    )
  }
  if (e.event_type === 'correction.issued') {
    return `<path class="mk ${c}" d="M${x} ${y - 11} L${x + 11} ${y} L${x} ${y + 11} L${x - 11} ${y} Z" fill="none"/>`
  }
  if (e.event_type === 'correction.applied') {
    return `<path class="mk ${c}" d="M${x - 10} ${y + 2} L${x - 3} ${y + 9} L${x + 11} ${y - 9}" fill="none"/>`
  }
  if (fam === 'derivative') {
    return (
      `<path class="mk-stem ${c}" d="M${x} ${y} V${y + 30}" />` +
      `<circle class="mk mk-punch ${c}" cx="${x}" cy="${y + 38}" r="7" />`
    )
  }
  return (
    `<circle class="mk mk-unknown" cx="${x}" cy="${y}" r="9" fill="none"/>` +
    `<text class="t-note" x="${x}" y="${y + 24}" text-anchor="middle">${escapeXml(e.event_type)}</text>`
  )
}

/**
 * A general S-curve between two lane positions, in the same visual grammar as the design
 * session's flow arcs (assemble_variants.py) — not a pixel reproduction of its two hand-tuned
 * example curves. That file demonstrates exactly one downstream and one (two-legged) upstream
 * pair; a general formula for an arbitrary number of flow edges can't be reverse-engineered from
 * a single example without guessing, so this is its own general construction: inset start/end
 * points (so the curve doesn't touch the glyph itself) and control points pulled toward the
 * transition's midpoint.
 */
function flowPath(x1: number, y1: number, x2: number, y2: number): string {
  const dx = x2 - x1
  const dy = y2 - y1
  const inset = 14
  const dirX = dx === 0 ? 1 : Math.sign(dx)
  const dirY = dy === 0 ? 1 : Math.sign(dy)
  const sx = x1 + dirX * inset
  const sy = y1 + dirY * inset * 0.3
  const ex = x2 - dirX * inset
  const ey = y2 - dirY * inset * 0.3
  const c1x = x1 + dx * 0.55
  const c1y = y1 + dy * 0.15
  const c2x = x2 - dx * 0.55
  const c2y = y2 - dy * 0.15
  const n = (v: number) => Number(v.toFixed(1))
  return `M${n(sx)} ${n(sy)} C ${n(c1x)} ${n(c1y)}, ${n(c2x)} ${n(c2y)}, ${n(ex)} ${n(ey)}`
}

/** Builds the score SVG markup (viewBox + all inner elements) as a raw string, mirroring
 * assemble_variants.py's `build_svg()` structure exactly: graticule, day ruler, lanes, flows,
 * obligations, events, divergence terminal, as-of edge. */
export function buildScoreSvg(score: ScoreExport): string {
  if (score.events.length === 0) {
    throw new Error('buildScoreSvg: an encounter with no ledger events has no score to draw')
  }
  // Count-general ordinal geometry (the Zeit-Skalierung lens): the event x-positions come from
  // the ledger's own length. Seven events reproduce the ported mockup exactly; any other count
  // spreads evenly across the same span. THIN_LANE_STOP keeps the conductor lane visibly short
  // (~70% along the events, matching the mockup's hand-placed 5th-of-7 stop) at any count.
  const EVT_X = eventPositions(score.events.length)
  const THIN_LANE_STOP_X = EVT_X[Math.floor((EVT_X.length - 1) * 0.7)]

  const laneRank = new Map<string, number>()
  for (const p of score.participants) if (p.lane && p.rank !== undefined) laneRank.set(p.lane, p.rank)

  const fallbackY = LANE_Y_BY_RANK[LANE_Y_BY_RANK.length - 1] + 80
  function laneY(lane: string): number {
    const rank = laneRank.get(lane)
    if (rank === undefined) return fallbackY // documented fallback, e.g. an "unknown" lane
    return LANE_Y_BY_RANK[rank] ?? fallbackY
  }

  const eventX = new Map<string, number>()
  const eventY = new Map<string, number>()
  const eventLane = new Map<string, string>()
  score.events.forEach((e, i) => {
    eventX.set(e.event_id, EVT_X[i])
    eventY.set(e.event_id, laneY(e.lane))
    eventLane.set(e.event_id, e.lane)
  })

  const bottomY = LANE_Y_BY_RANK[LANE_Y_BY_RANK.length - 1] + 96

  // Canvas height is mostly the ported constant (496, from RULER_Y-40 to bottomY+something in
  // assemble_variants.py's single-obligation-per-lane fixture) but must never silently clip: a
  // lane carrying several stacked obligations (this ledger: two, both on ensemble) pushes the
  // divergence terminal's below-lane caption further down than the mock ever needed to draw.
  // Grow the viewBox to fit whatever that caption's actual lowest text line turns out to be,
  // rather than pretending the ported constant always has room.
  const obligationCountByLane = new Map<string, number>()
  for (const o of score.obligations) obligationCountByLane.set(o.lane, (obligationCountByLane.get(o.lane) ?? 0) + 1)
  const dv0 = score.divergence
  let lowestContentY = bottomY
  if (dv0.leftLane && dv0.rightLane) {
    const rightObligationClearance = (obligationCountByLane.get(dv0.rightLane) ?? 0) * 16
    const rightLabelY = laneY(dv0.rightLane) + 42 + rightObligationClearance
    const rightQuoteLines = wrapLines(dv0.rightQuote, DIVERGENCE_QUOTE_WRAP).length
    lowestContentY = Math.max(lowestContentY, rightLabelY + 14 * rightQuoteLines + 12)
  }
  const viewBoxTop = 192
  const viewBoxHeight = Math.max(496, lowestContentY - viewBoxTop + 20)

  const s: string[] = []

  s.push(
    `<svg id="score" viewBox="0 ${viewBoxTop} ${W} ${viewBoxHeight}" role="img" aria-label="Score map of encounter ` +
      `${escapeXml(score.encounter_id)}: ${score.events.length} ledger events across ` +
      `${score.participants.length} lanes; the full event table follows below.">`,
  )
  s.push(
    '<defs>' +
      '<pattern id="hatch" width="5" height="5" patternTransform="rotate(45)" patternUnits="userSpaceOnUse">' +
      '<line x1="0" y1="0" x2="0" y2="5" class="hatch-line"/></pattern>' +
      '<marker id="tick" viewBox="0 0 8 8" refX="6" refY="4" markerWidth="7" markerHeight="7" orient="auto">' +
      '<path d="M1 1 L7 4 L1 7" fill="none" class="marker-stroke"/></marker>' +
      '<marker id="arrow" viewBox="0 0 10 10" refX="8" refY="5" markerWidth="9" markerHeight="9" orient="auto">' +
      '<path d="M1 1 L9 5 L1 9" fill="none" class="marker-stroke"/></marker>' +
      '</defs>',
  )

  // graticule: verticals at event slots (recessive chrome)
  for (const x of EVT_X) s.push(`<path class="grat" d="M${x} ${RULER_Y + 16} V${bottomY}"/>`)

  // day ruler (ordinal slots, honest day labels — first occurrence of each date only)
  s.push(`<path class="ruler" d="M${LANE_X0} ${RULER_Y} H${ASOF_X}"/>`)
  const seenDates = new Set<string>()
  score.events.forEach((e, i) => {
    if (seenDates.has(e.date)) return
    seenDates.add(e.date)
    const x = EVT_X[i]
    s.push(`<path class="ruler" d="M${x} ${RULER_Y - 6} V${RULER_Y + 6}"/>`)
    s.push(`<text class="t-note" x="${x}" y="${RULER_Y - 14}" text-anchor="middle">${escapeXml(e.date)}</text>`)
  })
  s.push(`<path class="ruler" d="M${ASOF_X} ${RULER_Y - 6} V${RULER_Y + 6}"/>`)
  s.push(`<text class="t-note" x="${ASOF_X}" y="${RULER_Y - 14}" text-anchor="middle">${escapeXml(score.status.as_of)}</text>`)
  s.push(`<text class="t-note t-dim" x="${LANE_X0 + 2}" y="${RULER_Y + 22}">ordinal · ledger order</text>`)

  // lanes: one per participant, in vertical rank order (source above conductor above receiver)
  const lanesByRank = score.participants.filter((p) => p.lane).sort((a, b) => (a.rank ?? 0) - (b.rank ?? 0))
  const maxRank = Math.max(...lanesByRank.map((p) => p.rank ?? 0))
  for (const p of lanesByRank) {
    const lane = p.lane as string
    const y = laneY(lane)
    const isThin = p.role === 'conductor'
    const endX = isThin ? THIN_LANE_STOP_X : DIV_X - 24
    s.push(`<path class="lane ${isThin ? 'lane-thin' : ''} pr-${lane}" d="M${LANE_X0} ${y} H${endX}"/>`)
    s.push(`<text class="t-lane pr-${lane}" x="${LANE_X0 - 14}" y="${y - 16}" text-anchor="end">${escapeXml(lane.toUpperCase())}</text>`)
    s.push(`<text class="t-note t-dim" x="${LANE_X0 - 14}" y="${y + 2}" text-anchor="end">${escapeXml(p.role)}</text>`)
  }

  // flows: downstream arcs colored by the lane they arrive at, upstream arcs by the lane they
  // leave from (zeichengrammatik §1 "Stromrichtung")
  for (const f of score.flows) {
    const x1 = eventX.get(f.from_event_id)
    const y1 = eventY.get(f.from_event_id)
    const x2 = eventX.get(f.to_event_id)
    const y2 = eventY.get(f.to_event_id)
    if (x1 === undefined || y1 === undefined || x2 === undefined || y2 === undefined) continue
    const colorLane = f.direction === 'downstream' ? eventLane.get(f.to_event_id) : eventLane.get(f.from_event_id)
    const dirClass = f.direction === 'downstream' ? 'flow-down' : 'flow-up'
    s.push(`<path class="flow ${dirClass} pr-${colorLane ?? 'conductor'}" marker-end="url(#arrow)" d="${flowPath(x1, y1, x2, y2)}"/>`)
  }

  // obligations: sustained hairlines to the as-of edge, stacked per lane when more than one
  // shares a lane (a case assemble_variants.py's single-obligation-per-lane mock never needed —
  // this ledger's fixture has two obligations both obligated to the same collective).
  // `obligationCountByLane` was already computed above (needed there for the viewBox height).
  const obligationsPerLane = new Map<string, number>()
  for (const o of score.obligations) {
    const stackIndex = obligationsPerLane.get(o.lane) ?? 0
    obligationsPerLane.set(o.lane, stackIndex + 1)
    const y = laneY(o.lane) + 26 + stackIndex * 16
    const x0 = eventX.get(o.source_event_id) ?? LANE_X0
    s.push(`<path class="obl pr-${o.lane}" d="M${x0} ${y} H${ASOF_X - 6}"/>`)
    s.push(`<text class="t-note t-dim" x="${ASOF_X - 12}" y="${y - 6}" text-anchor="end">${escapeXml(o.label)}</text>`)
  }

  // events: glyph + badge + hover/focus hit target (progressive enhancement; the register table
  // further down the page is the fallback — no JS required to read the encounter)
  score.events.forEach((e, i) => {
    const x = EVT_X[i]
    const y = laneY(e.lane)
    s.push(`<g class="evt" data-i="${i}" tabindex="0">`)
    s.push(glyph(e, x, y))
    if (e.station) {
      const onBottomLane = (laneRank.get(e.lane) ?? 0) === maxRank
      const [bx, by] = onBottomLane ? [x + 24, y - 30] : [x - 22, y - 34]
      s.push(badge(e.station, bx, by))
    }
    const hitHeight = e.event_type.startsWith('derivative') ? 92 : 60
    s.push(`<rect class="hit" x="${x - 24}" y="${y - 30}" width="48" height="${hitHeight}" fill="transparent"/>`)
    s.push('</g>')
  })

  // divergence terminal: two open rings that never converge
  const dv = score.divergence
  if (dv.leftLane && dv.rightLane) {
    const ym = laneY(dv.leftLane)
    const ye = laneY(dv.rightLane)
    const mid = Math.floor((ym + ye) / 2)
    s.push(`<circle class="ring pr-${dv.leftLane}" cx="${DIV_X}" cy="${ym}" r="10" fill="none"/>`)
    s.push(`<circle class="ring pr-${dv.rightLane}" cx="${DIV_X}" cy="${ye}" r="10" fill="none"/>`)
    s.push(`<path class="gap" d="M${DIV_X} ${ym + 26} V${mid - 24} M${DIV_X} ${mid + 24} V${ye - 26}"/>`)
    if (dv.station) s.push(badge(dv.station, DIV_X - 26, mid - 44))
    s.push(`<text class="t-note" x="${DIV_X}" y="${mid - 4}" text-anchor="middle">${escapeXml(dv.closing)}</text>`)
    s.push(`<text class="t-note t-dim" x="${DIV_X}" y="${mid + 14}" text-anchor="middle">both stand</text>`)
    const lx = DIV_X - 28
    // The rightLabel/rightQuote sit BELOW their lane — the same side any obligations on that
    // lane are drawn on (obligations are always below-lane). Give them clearance so a lane with
    // several stacked obligations (this fixture: two, both on ensemble) never collides with the
    // divergence caption below it.
    const rightObligationClearance = (obligationCountByLane.get(dv.rightLane) ?? 0) * 16
    const rightLabelY = ye + 42 + rightObligationClearance
    s.push(`<text class="t-note t-dim" x="${lx}" y="${ym - 58}" text-anchor="end">${escapeXml(dv.leftLabel)}</text>`)
    s.push(`<text class="t-quote pr-${dv.leftLane}" x="${lx}" y="${ym - 44}" text-anchor="end">${quotedTspans(lx, dv.leftQuote)}</text>`)
    s.push(`<text class="t-note t-dim" x="${lx}" y="${rightLabelY}" text-anchor="end">${escapeXml(dv.rightLabel)}</text>`)
    s.push(`<text class="t-quote pr-${dv.rightLane}" x="${lx}" y="${rightLabelY + 14}" text-anchor="end">${quotedTspans(lx, dv.rightQuote)}</text>`)
  }

  // as-of edge: behind it there is nothing (freigegebene Wortlaute — exact)
  s.push(`<path class="asof" d="M${ASOF_X} ${RULER_Y + 16} V${bottomY}"/>`)
  const midRankY = LANE_Y_BY_RANK[Math.floor(LANE_Y_BY_RANK.length / 2)]
  s.push(
    `<text class="t-note" transform="rotate(-90 ${ASOF_X + 16} ${midRankY})" x="${ASOF_X + 16}" y="${midRankY}" text-anchor="middle">here ends what the ledger knows</text>`,
  )

  s.push('</svg>')
  return s.join('\n')
}
