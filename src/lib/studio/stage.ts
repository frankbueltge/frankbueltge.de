// Build-time Bühnen- und Abendzettel-Generatoren (Praxis-Oberflächen-Paket): a TS port of
// research-ecology's docs/design/variants-2026-07-15/studio_viz.py — the Studio's OWN
// grammar (ADR 0010): ONE spotlight on what is public now (no gallery grid), taped
// blocking corners, karmesin X-marks for every struck position (the floor keeps every
// mark), the Gasse offstage — visible, unlit — and the playbill as the history form.
// The practice IS theatrical in its own records; the drawing only takes it at its word.
//
// Pure and deterministic (contract as score.ts / pulse/render.ts): same inputs ⇒
// byte-identical output. No randomness, no clock reads.

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/** Deterministic greedy word-wrap (same construction as score.ts's wrapLines). */
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

export interface StageKill {
  name: string
  session: string
  reason: string
}

export interface GasseEntry {
  name: string
  sub: string
  note: string
}

export interface StagePremiere {
  /** set in Didone capitals in the spot */
  title: string
  metaLine: string
  /** verbatim hover record (e.g. the full ship summary) */
  hover: string
  /** the admission-contract quote, verbatim (wrapped deterministically) */
  quote: string
  attribution: string
}

export interface StageInput {
  premiere: StagePremiere
  marquee: string
  kills: StageKill[]
  gasse: GasseEntry[]
  strikeNote: string
  gasseLabel: string
  /** orientation line, top right of the floor ("the stage, seen from above …") */
  orientNote: string
}

// ---------------------------------------------------------------- ported geometry
// (floor 150,226 → 1230,642; curtain on top; spot at 610/400 r 300×170; the seven X
// positions verbatim from the mockup, extended by three more deterministic slots).
const CX = 610
const CY = 400
const X_POSITIONS: ReadonlyArray<readonly [number, number]> = [
  [255, 300], [1105, 296], [240, 536], [415, 600], [830, 608], [1040, 568], [1150, 468],
  [560, 592], [255, 420], [960, 300],
]

/** Builds the stage SVG, mirroring studio_viz.py's stage_svg() structure. */
export function buildStageSvg(input: StageInput): string {
  if (input.kills.length > X_POSITIONS.length) {
    throw new Error(
      `buildStageSvg: ${input.kills.length} struck positions exceed the floor's ${X_POSITIONS.length} ` +
        `taped slots — the season index (grammar §7, studio flavour) is a different, not-yet-built ` +
        `generator, not a silent re-layout of this one.`,
    )
  }

  const s: string[] = []
  s.push(
    `<svg id="stage" viewBox="0 200 1440 470" role="img" aria-label="The stage: one spotlight on ` +
      `${escapeXml(input.premiere.title)}; ${input.kills.length} taped X-marks for killed projects; ` +
      `the Gasse holds the refused material; the stage record follows as a table.">`,
  )
  s.push('<rect class="stagefloor" x="150" y="226" width="1080" height="416"/>')
  s.push('<path class="curtainline" d="M150 226 H1230"/>')

  // Der gezeichnete Lichtkegel (Umbau 2026-07-16, Franks Kritik am weichen Verlauf:
  // "hässlicher gold glow"). Lichtplan-Geste statt Weichzeichner: eine Lampe hängt an
  // der Vorhangstange, zwei Strahl-Haarlinien zeichnen den Kegel, die Lichtinsel ist
  // eine harte, helle Fläche wie ein echter Verfolger — Texte darin lesen sich dunkel
  // auf hell, in beiden Themes; die Kante macht das "beleuchtet" lesbar statt diffus.
  s.push(`<g class="lamp"><rect x="${CX - 8}" y="218" width="16" height="9"/></g>`)
  s.push(`<path class="beamline" d="M${CX - 6} 227 L${CX - 300} ${CY}"/>`)
  s.push(`<path class="beamline" d="M${CX + 6} 227 L${CX + 300} ${CY}"/>`)
  s.push(`<ellipse class="spotpool" cx="${CX}" cy="${CY}" rx="300" ry="170"/>`)
  s.push(`<text class="t-orient" x="1210" y="252" text-anchor="end">${escapeXml(input.orientNote)}</text>`)
  s.push(
    `<g class="evt2" tabindex="0">` +
      `<text class="t-worktitle" x="${CX}" y="${CY - 42}" text-anchor="middle">${escapeXml(input.premiere.title)}</text>` +
      `<text class="t-workmeta t-inspot" x="${CX}" y="${CY - 18}" text-anchor="middle">${escapeXml(input.premiere.metaLine)}</text>` +
      `<title>${escapeXml(input.premiere.hover)}</title></g>`,
  )
  s.push(`<text class="t-marquee" x="${CX}" y="${CY + 14}" text-anchor="middle">${escapeXml(input.marquee)}</text>`)
  const quoteLines = wrapLines(input.premiere.quote, 62)
  quoteLines.forEach((line, i) => {
    const decorated = (i === 0 ? '“' : '') + line + (i === quoteLines.length - 1 ? '”' : '')
    s.push(`<text class="t-quote-s" x="${CX}" y="${CY + 44 + i * 18}" text-anchor="middle">${escapeXml(decorated)}</text>`)
  })
  s.push(
    `<text class="t-workmeta t-inspot" x="${CX}" y="${CY + 44 + quoteLines.length * 18 + 2}" text-anchor="middle">— ${escapeXml(input.premiere.attribution)}</text>`,
  )

  // blocking tape corners around the spot position
  for (const [dx, dy] of [[-330, -120], [330, -120], [-330, 120], [330, 120]] as const) {
    const x = CX + dx
    const y = CY + dy
    const hx = dx < 0 ? 18 : -18
    const hy = dy < 0 ? 14 : -14
    s.push(`<path class="tapemark" d="M${x} ${y + hy} V${y} H${x + hx}"/>`)
  }

  // killed projects: taped X-marks on the dark floor, verbatim reasons on hover.
  // Marks near the right edge letter LEFTWARD so no name crosses into the Gasse
  // (a readability generalization of the mockup's hand-placed labels).
  input.kills.forEach((kill, i) => {
    const [x, y] = X_POSITIONS[i]
    const left = x > 1000
    const lx = left ? x - 16 : x + 16
    const anchor = left ? ' text-anchor="end"' : ''
    s.push(
      `<g class="evt2" tabindex="0">` +
        `<path class="xmark" d="M${x - 9} ${y - 9} L${x + 9} ${y + 9} M${x + 9} ${y - 9} L${x - 9} ${y + 9}"/>` +
        `<text class="t-kill-n" x="${lx}" y="${y - 1}"${anchor}>${escapeXml(kill.name)}</text>` +
        `<text class="t-kill" x="${lx}" y="${y + 13}"${anchor}>${escapeXml(kill.session)}</text>` +
        `<title>${escapeXml(kill.name)} — ${escapeXml(kill.session)}: ${escapeXml(kill.reason)}</title></g>`,
    )
  })
  s.push(`<text class="t-kill" x="230" y="252">${escapeXml(input.strikeNote)}</text>`)

  // die Gasse (offstage, visible but unlit)
  s.push('<path class="gasse" d="M1230 226 V642"/>')
  s.push(
    `<text class="t-gasse" transform="rotate(-90 1420 434)" x="1420" y="434" text-anchor="middle">${escapeXml(input.gasseLabel)}</text>`,
  )
  input.gasse.forEach((g, i) => {
    const y = 300 + i * 80
    s.push(
      `<g class="evt2" tabindex="0">` +
        `<text class="t-kill-n" x="1248" y="${y}">${escapeXml(g.name)}</text>` +
        `<text class="t-kill" x="1248" y="${y + 15}">${escapeXml(g.sub)}</text>` +
        `<title>${escapeXml(g.note)}</title></g>`,
    )
  })

  s.push('</svg>')
  return s.join('\n')
}

// ---------------------------------------------------------------- der Abendzettel

export interface PlaybillEntry {
  collective_session: number | null
  date: string
  move: string
  summary: string
}

export interface PlaybillLine {
  roman: string
  move: string
  kill: boolean
  ship: boolean
  /** the premiere headline (ship lines only) */
  premiere?: string
  line: string
}

export interface PlaybillEvening {
  label: string
  date: string
  lines: PlaybillLine[]
}

const ROMAN = [
  'I', 'II', 'III', 'IV', 'V', 'VI', 'VII', 'VIII', 'IX', 'X',
  'XI', 'XII', 'XIII', 'XIV', 'XV', 'XVI', 'XVII', 'XVIII', 'XIX', 'XX',
]

export function roman(n: number): string {
  if (n < 1 || n > ROMAN.length) return String(n)
  return ROMAN[n - 1]
}

const PREMIERE_HEADLINE = 'The first premiere of the house.'

/** Groups the chronicle into evenings and sets each entry as a bill line — a direct port
 * of studio_viz.py's playbill_html() logic (first sentence on the bill, kill detection,
 * the premiere as the centrepiece). Summaries stay verbatim; only the first sentence is
 * extracted, never rewritten. */
export function buildPlaybill(
  entries: readonly PlaybillEntry[],
  eveningLabel: (n: number) => string,
): PlaybillEvening[] {
  const evenings: PlaybillEvening[] = []
  let currentDate: string | null = null
  for (const e of entries) {
    if (e.date !== currentDate) {
      currentDate = e.date
      evenings.push({ label: eveningLabel(evenings.length + 1), date: e.date, lines: [] })
    }
    const first = e.summary.split('. ')[0].replace(/\.+$/, '') + '.'
    const killy =
      e.summary.includes('KILLED') || first.includes('killed') || first.toLowerCase().includes('nothing opened')
    const ship = e.move === 'ship'
    // ship lines: the mockup strips the premiere headline off the first sentence and
    // shows the (possibly empty) remainder under it — ported as-is; pages skip empty lines.
    const line: PlaybillLine = {
      roman: roman(e.collective_session ?? 0),
      move: e.move.toUpperCase(),
      kill: killy,
      ship,
      line: ship && first.startsWith('The first premiere') ? first.slice(PREMIERE_HEADLINE.length).trim() : first,
    }
    if (ship) line.premiere = PREMIERE_HEADLINE
    evenings[evenings.length - 1].lines.push(line)
  }
  return evenings
}
