// Build-time Blatt generator (Praxis-Oberflächen-Paket): a TS port of research-ecology's
// docs/design/variants-2026-07-15/atelier_viz.py — the Atelier's OWN grammar (ADR 0010:
// no shared visual grammar with the Middle's score, the Field's plate or the Studio's
// stage). Threads are ink ribbons, sources enter as graphite stubs and kink in red pencil
// (the swerve/clinamen), works stand as ink slabs, prior works ghost on the shelf, the
// doorway at the right edge stays empty until an external encounter exists.
//
// Pure and deterministic (same contract as src/lib/begegnungen/score.ts and
// src/lib/pulse/render.ts): same rhizome.json input ⇒ byte-identical SVG output. No
// randomness, no clock reads, no force layout — every coordinate is a function of the data.
//
// The mockup hand-placed its S26–S28 material (POS/T_END/S_ELBOW dicts); the live rhizome
// has since grown (S29, S30, …), so this port generalizes the mockup's geometry into
// formulas: per-thread bands stacked vertically, sources stacked at the left margin around
// the thread's y, works cascading right of the thread end — the same visual grammar, derived
// instead of hand-tuned. Deviations from the mockup are named in the module below where they
// occur, never silently bridged.

export interface RhizomeNode {
  id: string
  kind: string // 'work' | 'thread' | 'source' (open vocabulary — the practice coins its own)
  label: string
  date?: string
}

export interface RhizomeEdge {
  from: string
  to: string
  kind: string // 'swerve' | 'elaborates' | 'bridge' | 'complement' | 'grounds' | 'continues' | …
  session?: number | null
}

export interface Rhizome {
  updated: string
  note?: string
  nodes: RhizomeNode[]
  edges: RhizomeEdge[]
}

// ---------------------------------------------------------------- geometry constants,
// ported from atelier_viz.py (SRC_X=336, elbow ~404–424 → fixed 410, thread end 880,
// works from ~950, doorway 1408; slab 12×44; source spacing 32; work cascade ~130/67).
const W = 1440
const VIEW_TOP = 168
const SRC_X = 336
const ELBOW_X = 410
const THREAD_X0 = ELBOW_X + 20
const THREAD_X1 = 880
const WORK_X0 = 950
const WORK_STEP_X = 130
const WORK_STEP_Y = 67
const GHOST_X0 = 1150
const GHOST_STEP_X = 112
const DOOR_X = 1408
const SOURCE_DY = 32
const BAND_GAP = 56

const THREAD_LABEL_MAX = 76
const SOURCE_LABEL_MAX = 40
const WORK_LABEL_MAX = 34

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

function truncate(label: string, max: number): string {
  return label.length <= max ? label : label.slice(0, max - 3) + '…'
}

/** Verbatim label + full-label tooltip — the truncation shows, never hides. */
function labelledText(cls: string, x: number, y: number, label: string, max: number, anchor?: string): string {
  const short = truncate(label, max)
  const anchorAttr = anchor ? ` text-anchor="${anchor}"` : ''
  const title = short === label ? '' : `<title>${escapeXml(label)}</title>`
  return `<text class="${cls}" x="${x}" y="${y}"${anchorAttr}>${escapeXml(short)}${title}</text>`
}

interface ThreadLayout {
  id: string
  label: string
  session: number | null
  y: number
  sources: { id: string; label: string; y: number; kind: 'swerve' }[]
  works: { id: string; label: string; date?: string; x: number; y: number }[]
  ghosts: { id: string; label: string; date?: string; x: number; y: number }[]
}

/** An island (n−1): a work reached only by a source→work swerve, elaborated by no thread —
 * the One (the thread) subtracted, the work connected to nothing but its outside source.
 * Added 2026-07-18 via the site-PR channel, answering the S39 island request: the map learns
 * to hold the uncentred shape it previously forced back into a source→thread→work triad. */
interface IslandLayout {
  workId: string
  workLabel: string
  workDate?: string
  x: number
  y: number
  sources: { id: string; label: string; y: number; session: number | null }[]
}

interface SheetLayout {
  threads: ThreadLayout[]
  /** islands: source→work swerves that hang off no thread (the representable n−1 shape) */
  islands: IslandLayout[]
  /** every placed work/ghost position by node id (bridges & grounds draw between them) */
  workPos: Map<string, { x: number; y: number; ghost: boolean }>
  groundSources: { id: string; label: string; y: number; workId: string; session: number | null }[]
  bottom: number
}

export interface SheetStats {
  threads: number
  sources: number
  works: number
  bridges: number
  sessionMin: number | null
  sessionMax: number | null
}

export function sheetStats(r: Rhizome): SheetStats {
  const sessions = r.edges.map((e) => e.session).filter((s): s is number => typeof s === 'number')
  const workIds = new Set<string>()
  for (const n of r.nodes) if (n.kind === 'work') workIds.add(n.id)
  const drawnWorks = new Set<string>()
  for (const e of r.edges) {
    if (workIds.has(e.from)) drawnWorks.add(e.from)
    if (workIds.has(e.to)) drawnWorks.add(e.to)
  }
  return {
    threads: r.nodes.filter((n) => n.kind === 'thread').length,
    sources: r.nodes.filter((n) => n.kind === 'source').length,
    works: drawnWorks.size,
    bridges: r.edges.filter((e) => e.kind === 'bridge').length,
    sessionMin: sessions.length ? Math.min(...sessions) : null,
    sessionMax: sessions.length ? Math.max(...sessions) : null,
  }
}

/** The sheet's title: the youngest thread's own label, verbatim. (The mockup's fixture had a
 * single phase, S26–S28, and titled the sheet with that phase's root thread; the live rhizome
 * carries several phases, so „the current sheet“ is the newest reading — a named deviation.) */
export function sheetTitle(r: Rhizome): string {
  const birth = new Map<string, number>()
  for (const e of r.edges) {
    if (e.kind !== 'swerve' || typeof e.session !== 'number') continue
    const prev = birth.get(e.to)
    if (prev === undefined || e.session < prev) birth.set(e.to, e.session)
  }
  const threads = r.nodes.filter((n) => n.kind === 'thread')
  let best: RhizomeNode | undefined
  let bestSession = -Infinity
  for (const t of threads) {
    const s = birth.get(t.id) ?? -Infinity
    if (s >= bestSession) {
      bestSession = s
      best = t
    }
  }
  return best?.label ?? threads[0]?.label ?? ''
}

export interface EdgeRegisterRow {
  from: string
  kind: string
  to: string
  session: string
  fromId: string
  toId: string
}

/** All edges, uncompressed — the table below the sheet (lab ethic: completeness). */
export function edgeRegister(r: Rhizome): EdgeRegisterRow[] {
  const byId = new Map(r.nodes.map((n) => [n.id, n]))
  return r.edges.map((e) => ({
    from: byId.get(e.from)?.label ?? e.from,
    kind: e.kind,
    to: byId.get(e.to)?.label ?? e.to,
    session: typeof e.session === 'number' ? `S${e.session}` : '—',
    fromId: e.from,
    toId: e.to,
  }))
}

function layoutSheet(r: Rhizome): SheetLayout {
  const byId = new Map(r.nodes.map((n) => [n.id, n]))
  const threadNodes = r.nodes.filter((n) => n.kind === 'thread')
  const elaboratedBy = new Map<string, string>() // work id -> thread id
  for (const e of r.edges) if (e.kind === 'elaborates') elaboratedBy.set(e.to, e.from)

  // islands (n−1): a work is an island when a swerve lands directly on it (source→work) and no
  // thread elaborates it. The One (the thread) is subtracted: the work stands connected to
  // nothing but its outside source. Computed here so the shelf-ghost pass can leave islands
  // alone (an island is drawn as itself, never as another thread's ghost).
  const islandWorkIds: string[] = []
  for (const e of r.edges) {
    if (e.kind !== 'swerve') continue
    if (byId.get(e.to)?.kind !== 'work') continue
    if (elaboratedBy.has(e.to)) continue
    if (!islandWorkIds.includes(e.to)) islandWorkIds.push(e.to)
  }
  const islandWorkIdSet = new Set(islandWorkIds)

  const workPos = new Map<string, { x: number; y: number; ghost: boolean }>()
  const threads: ThreadLayout[] = []
  const groundSources: SheetLayout['groundSources'] = []

  let bandTop = VIEW_TOP + 58
  for (const t of threadNodes) {
    const swerves = r.edges.filter((e) => e.kind === 'swerve' && e.to === t.id)
    const sessions = swerves.map((e) => e.session).filter((s): s is number => typeof s === 'number')
    const session = sessions.length ? Math.min(...sessions) : null
    const workEdges = r.edges.filter((e) => e.kind === 'elaborates' && e.from === t.id)

    const nSrc = swerves.length
    // thread y: centred on its source stack, but never closer than 58 to the band top
    // (the thread label sits 48 above the ribbon).
    const ty = Math.max(bandTop + 58, bandTop + 10 + 16 * (nSrc - 1) + 16)

    const sources = swerves.map((e, k) => ({
      id: e.from,
      label: byId.get(e.from)?.label ?? e.from,
      y: ty - 16 * (nSrc - 1) + SOURCE_DY * k,
      kind: 'swerve' as const,
    }))

    const works = workEdges.map((e, k) => {
      const node = byId.get(e.to)
      const single = workEdges.length === 1
      const x = single ? WORK_X0 + 10 : WORK_X0 + WORK_STEP_X * k
      const y = single ? ty : ty - 52 + WORK_STEP_Y * k
      workPos.set(e.to, { x, y, ghost: false })
      return { id: e.to, label: node?.label ?? e.to, date: node?.date, x, y }
    })

    // shelf ghosts: works tied to THIS thread's works without being elaborated on the
    // sheet — present, not re-made. Ursprünglich nur complement-Ziele; verallgemeinert
    // 2026-07-16 (S31/S32 erfanden `measures` und `corrected-by` und hängten ein Werk
    // allein über solche Bindungen ins Rhizom): JEDE Bindung an ein Faden-Werk, deren
    // anderes Ende ein nicht-elaboriertes Werk ist, stellt dieses Werk aufs Regal — das
    // Register darunter führt die Bindungsart in jedem Fall wörtlich.
    // Offenes Vokabular (16.07.): JEDE Bindungsart außer den eigen-gezeichneten
    // (elaborates=Tafel, swerve=Rotstift-Knick, fork=Fadenteilung, grounds=Fundament-Stummel)
    // stellt ein nicht-elaboriertes Werk aufs Regal — auch Arten, die es noch gar nicht gibt.
    const OWN_DRAWING = new Set(['elaborates', 'swerve', 'fork', 'grounds'])
    const ghostIds: string[] = []
    for (const e of r.edges) {
      if (OWN_DRAWING.has(e.kind)) continue
      const far = workEdges.some((we) => we.to === e.from)
        ? e.to
        : workEdges.some((we) => we.to === e.to)
          ? e.from
          : null
      if (!far) continue
      if (byId.get(far)?.kind !== 'work') continue
      if (islandWorkIdSet.has(far)) continue // an island is drawn as itself, not shelved as a ghost
      if (elaboratedBy.has(far) || workPos.has(far) || ghostIds.includes(far)) continue
      ghostIds.push(far)
    }
    const ghosts = ghostIds.map((id, g) => {
      const node = byId.get(id)
      const x = GHOST_X0 + GHOST_STEP_X * g
      const y = ty + 100
      workPos.set(id, { x, y, ghost: true })
      return { id, label: node?.label ?? id, date: node?.date, x, y }
    })

    // grounds sources aimed at this thread's works sit below the swerve stack.
    for (const e of r.edges) {
      if (e.kind !== 'grounds') continue
      if (!workEdges.some((we) => we.to === e.to)) continue
      groundSources.push({
        id: e.from,
        label: byId.get(e.from)?.label ?? e.from,
        y: ty + 116,
        workId: e.to,
        session: typeof e.session === 'number' ? e.session : null,
      })
    }

    const srcBottom = sources.length ? sources[sources.length - 1].y : ty
    const workBottom = works.length ? Math.max(...works.map((w) => w.y)) + 40 : ty
    const ghostBottom = ghosts.length ? ty + 100 + 55 : ty
    const groundBottom = groundSources.some((g) => g.y === ty + 116) ? ty + 124 : ty
    const bandBottom = Math.max(srcBottom + 16, workBottom, ghostBottom, groundBottom)

    threads.push({ id: t.id, label: t.label, session, y: ty, sources, works, ghosts })
    bandTop = bandBottom + BAND_GAP
  }

  // island band (n−1): below the thread bands, each island work is an ink slab like any other;
  // what it lacks is a ribbon. Its source flows straight to the slab and kinks in red pencil at
  // the slab itself — no thread, no elbow between the outside and the work.
  const islands: IslandLayout[] = []
  let islandY = bandTop + 8
  for (const workId of islandWorkIds) {
    const node = byId.get(workId)
    const swerves = r.edges.filter((e) => e.kind === 'swerve' && e.to === workId)
    const wy = islandY
    const wx = WORK_X0 + 10
    workPos.set(workId, { x: wx, y: wy, ghost: false })
    const sources = swerves.map((e, k) => ({
      id: e.from,
      label: byId.get(e.from)?.label ?? e.from,
      y: wy + 16 + SOURCE_DY * k,
      session: typeof e.session === 'number' ? e.session : null,
    }))
    islands.push({ workId, workLabel: node?.label ?? workId, workDate: node?.date, x: wx, y: wy, sources })
    const srcBottom = sources.length ? sources[sources.length - 1].y : wy
    islandY = Math.max(wy + 80, srcBottom + 40) + BAND_GAP
  }
  const islandBottom = islands.length ? islandY - BAND_GAP : bandTop - BAND_GAP

  return {
    threads,
    islands,
    workPos,
    groundSources,
    bottom: Math.max(bandTop - BAND_GAP + 24, islandBottom + 24),
  }
}

function threadPath(ty: number): string {
  // ported curve: gentle ink rise from the elbow to the thread end (T_END sits 14 above).
  return `M${THREAD_X0} ${ty} C ${THREAD_X0 + 150} ${ty - 14}, ${THREAD_X1 - 160} ${ty - 4}, ${THREAD_X1} ${ty - 14}`
}

/** „Jedes Zeichen ist eine Tür“ (atelier-aesthetik §5): optional href resolvers per sign.
 * Return null for signs whose target page does not exist — no invented doors. */
export interface SheetLinks {
  work?: (id: string) => string | null
  source?: (id: string) => string | null
  session?: (session: number) => string | null
  thread?: (id: string) => string | null
}

function door(href: string | null | undefined, inner: string): string {
  return href ? `<a href="${escapeXml(href)}" class="sign-door">${inner}</a>` : inner
}

/**
 * Builds the Blatt SVG (viewBox + all inner elements) as a raw string, mirroring
 * atelier_viz.py's build_svg() structure: threads, source stubs + swerve kinks, session
 * marks, works as slabs, elaborates ties, bridges, complements, grounds, continues, and
 * the reserved doorway. Sign classes match the mockup CSS (.th, .stub, .rp, .slab, …).
 */
export function buildSheetSvg(r: Rhizome, opts?: { doorwayNote?: string; links?: SheetLinks }): string {
  const layout = layoutSheet(r)
  const stats = sheetStats(r)
  const links = opts?.links ?? {}
  const doorwayNote = opts?.doorwayNote ?? 'doorway reserved — for an external encounter, once it exists'
  const bottom = Math.max(layout.bottom, VIEW_TOP + 420)
  const height = bottom - VIEW_TOP + 32

  const s: string[] = []
  s.push(
    `<svg id="sheet" viewBox="0 ${VIEW_TOP} ${W} ${height}" role="img" aria-label="Atelier working sheet: ` +
      `${stats.threads} threads, ${stats.sources} sources, ${stats.works} works; the full edge list follows as a table.">`,
  )

  // threads (ink ribbons) + labels
  for (const t of layout.threads) {
    s.push(`<path class="th" d="${threadPath(t.y)}"/>`)
    s.push(door(links.thread?.(t.id), labelledText('t-thread', THREAD_X0 + 34, t.y - 48, t.label, THREAD_LABEL_MAX)))
  }

  // sources: graphite stubs from the margin into the session elbow (the swerve kink in red)
  for (const t of layout.threads) {
    for (const src of t.sources) {
      s.push(door(links.source?.(src.id), labelledText('t-src', SRC_X - 10, src.y + 4, src.label, SOURCE_LABEL_MAX, 'end')))
      s.push(`<path class="stub" d="M${SRC_X} ${src.y} H${ELBOW_X - 22}"/>`)
      s.push(`<path class="rp" d="M${ELBOW_X - 22} ${src.y} Q ${ELBOW_X - 4} ${src.y}, ${ELBOW_X} ${t.y}" fill="none"/>`)
    }
    s.push(`<circle class="rp-dot" cx="${ELBOW_X}" cy="${t.y}" r="3.5"/>`)
    if (t.session !== null) {
      s.push(
        door(
          links.session?.(t.session),
          `<text class="t-sess" x="${ELBOW_X - 6}" y="${t.y + 22}" text-anchor="end">S${t.session}</text>`,
        ),
      )
    }
  }

  // continues: a thread flows on into a later one (left-side long curve, red session mark)
  const threadY = new Map(layout.threads.map((t) => [t.id, t.y]))
  for (const e of r.edges) {
    if (e.kind !== 'continues') continue
    const ya = threadY.get(e.from)
    const yb = threadY.get(e.to)
    if (ya === undefined || yb === undefined) continue
    s.push(
      `<path class="th th-cont" d="M${THREAD_X0 + 40} ${ya + 8} C 330 ${ya + 96}, 350 ${yb - 34}, ${THREAD_X0 - 18} ${yb - 4}"/>`,
    )
    const mid = Math.floor((ya + yb) / 2)
    const sess = typeof e.session === 'number' ? ` · S${e.session}` : ''
    s.push(`<text class="t-note-a" x="330" y="${mid + 18}">continues${sess}</text>`)
  }

  // works: ink slabs + serif labels; shelf works as dashed ghosts
  for (const t of layout.threads) {
    for (const w of t.works) {
      s.push(
        door(
          links.work?.(w.id),
          `<rect class="slab" x="${w.x - 6}" y="${w.y - 22}" width="12" height="44"/>` +
            labelledText('t-work', w.x + 14, w.y - 2, w.label, WORK_LABEL_MAX),
        ),
      )
      if (w.date) s.push(`<text class="t-date" x="${w.x + 14}" y="${w.y + 13}">${escapeXml(w.date)}</text>`)
    }
    for (const g of t.ghosts) {
      s.push(
        door(
          links.work?.(g.id),
          `<rect class="slab-ghost" x="${g.x - 6}" y="${g.y - 22}" width="12" height="44"/>` +
            labelledText('t-work', g.x, g.y + 40, g.label, WORK_LABEL_MAX, 'middle'),
        ),
      )
      if (g.date) s.push(`<text class="t-date" x="${g.x}" y="${g.y + 55}" text-anchor="middle">${escapeXml(g.date)}</text>`)
    }
  }

  // elaborates ties (thin ink from thread end to slab)
  for (const t of layout.threads) {
    for (const w of t.works) {
      const x1 = THREAD_X1
      const y1 = t.y - 14
      s.push(`<path class="tie" d="M${x1} ${y1} C ${x1 + 40} ${y1}, ${w.x - 46} ${w.y}, ${w.x - 8} ${w.y}"/>`)
    }
  }

  // islands (n−1): a work with no thread — the source runs straight to the slab and kinks in
  // red pencil at the slab itself (no elbow on a ribbon). The slab is an ordinary ink slab; the
  // red kink still counts as a swerve, so every swerve source draws exactly one kink whether it
  // lands on a thread or on a work. Reserved caption „island · SNN" names the shape, honestly.
  for (const isl of layout.islands) {
    s.push(
      door(
        links.work?.(isl.workId),
        `<rect class="slab" x="${isl.x - 6}" y="${isl.y - 22}" width="12" height="44"/>` +
          labelledText('t-work', isl.x + 14, isl.y - 2, isl.workLabel, WORK_LABEL_MAX),
      ),
    )
    if (isl.workDate) s.push(`<text class="t-date" x="${isl.x + 14}" y="${isl.y + 13}">${escapeXml(isl.workDate)}</text>`)
    let capSession: number | null = null
    for (const src of isl.sources) {
      s.push(door(links.source?.(src.id), labelledText('t-src', SRC_X - 10, src.y + 4, src.label, SOURCE_LABEL_MAX, 'end')))
      s.push(`<path class="stub" d="M${SRC_X} ${src.y} H${isl.x - 30}"/>`)
      s.push(`<path class="rp" d="M${isl.x - 30} ${src.y} Q ${isl.x - 12} ${src.y}, ${isl.x - 8} ${isl.y}" fill="none"/>`)
      if (src.session !== null) {
        if (capSession === null) capSession = src.session
        s.push(
          door(
            links.session?.(src.session),
            `<text class="t-sess" x="${isl.x - 12}" y="${isl.y + 24}" text-anchor="end">S${src.session}</text>`,
          ),
        )
      }
    }
    const capText = capSession !== null ? `island · S${capSession}` : 'island'
    s.push(`<text class="t-note-a" x="${isl.x + 14}" y="${isl.y + 30}">${capText}</text>`)
  }

  // bridges: double ties between two works. (Deviation from the mockup, named: the design
  // session hand-lettered the S26 bridge with the practice's own words — „they are one
  // fact“ — quoted from the rhizome NOTE; rhizome.json carries no per-edge quote field, so
  // every bridge is lettered `bridge · SNN` and the words stay in the note/register.)
  for (const e of r.edges) {
    if (e.kind !== 'bridge') continue
    const a = layout.workPos.get(e.from)
    const b = layout.workPos.get(e.to)
    if (!a || !b) continue
    const sess = typeof e.session === 'number' ? ` · S${e.session}` : ''
    if (Math.abs(b.y - a.y) > Math.abs(b.x - a.x)) {
      // vertical bridge (ported from the w-nk → w-dr pair). Long spans cross other bands:
      // bulge them left into the tie corridor so they never run through an unrelated slab,
      // and letter them at their lower end instead of the (occupied) midpoint.
      const dir = b.y < a.y ? -1 : 1
      const span = Math.abs(b.y - a.y)
      const bulge = span > 240 ? -64 : 0
      for (const off of [-2.5, 2.5]) {
        s.push(
          `<path class="bridge" d="M${a.x + off} ${a.y + dir * 24} C ${a.x + off + bulge} ${a.y + dir * 70}, ${b.x + off + bulge} ${b.y - dir * 72}, ${b.x + off} ${b.y - dir * 24}"/>`,
        )
      }
      const lower = a.y > b.y ? a : b
      s.push(`<text class="t-sess" x="${lower.x + 16}" y="${lower.y - 34}">bridge${sess}</text>`)
    } else {
      // horizontal bridge (ported from the w-gu → w-ng pair)
      const dir = b.x < a.x ? -1 : 1
      for (const off of [-2.5, 2.5]) {
        s.push(
          `<path class="bridge" d="M${a.x + dir * 8} ${a.y + off} C ${a.x + dir * 70} ${a.y + 26 + off}, ${b.x - dir * 70} ${b.y - 26 + off}, ${b.x - dir * 8} ${b.y + off}"/>`,
        )
      }
      s.push(
        `<text class="t-sess" x="${Math.floor((a.x + b.x) / 2) - 16}" y="${Math.floor((a.y + b.y) / 2) + 32}" text-anchor="middle">bridge${sess}</text>`,
      )
    }
  }

  // complements (dashed graphite from the birth-side work to the shelf)
  for (const e of r.edges) {
    if (e.kind !== 'complement') continue
    const a = layout.workPos.get(e.from)
    const b = layout.workPos.get(e.to)
    if (!a || !b) continue
    s.push(
      `<path class="comp" d="M${a.x + 8} ${a.y + 12} C ${a.x + 90} ${a.y + 60}, ${b.x - 40} ${b.y - 46}, ${b.x} ${b.y - 26}"/>`,
    )
  }
  {
    // one complement caption per thread shelf (the mockup's hand-written suffix — „the
    // loss-side shelf“ — was content prose, not grammar; the caption keeps the formula only)
    const seen = new Set<string>()
    for (const e of r.edges) {
      if (e.kind !== 'complement') continue
      const b = layout.workPos.get(e.to)
      const a = layout.workPos.get(e.from)
      if (!a || !b || !b.ghost) continue
      const key = `${a.x},${a.y}`
      if (seen.has(key)) continue
      seen.add(key)
      const sess = typeof e.session === 'number' ? ` · S${e.session}` : ''
      s.push(`<text class="t-note-a" x="${b.x + GHOST_STEP_X}" y="${b.y - 52}" text-anchor="end">complement${sess}</text>`)
    }
  }

  // grounds: a source laid under a work as foundation
  for (const g of layout.groundSources) {
    const w = layout.workPos.get(g.workId)
    if (!w) continue
    s.push(labelledText('t-src', SRC_X - 10, g.y + 4, g.label, SOURCE_LABEL_MAX, 'end'))
    s.push(`<path class="ground" d="M${w.x - 30} ${w.y + 30} H${w.x + 30}"/>`)
    s.push(`<path class="stub" d="M${SRC_X} ${g.y} C 420 ${g.y}, ${w.x - 90} ${w.y + 34}, ${w.x - 32} ${w.y + 30}"/>`)
    const sess = g.session !== null ? ` · S${g.session}` : ''
    s.push(`<text class="t-sess" x="${w.x - 34}" y="${w.y + 46}">grounds${sess}</text>`)
  }

  // the reserved doorway (right margin) — empty on purpose, until an encounter exists
  const doorTop = VIEW_TOP + 132
  const doorBot = doorTop + 260
  const doorMid = Math.floor((doorTop + doorBot) / 2)
  s.push(`<path class="door" d="M${DOOR_X} ${doorTop} V${doorBot}"/><path class="door" d="M${DOOR_X - 12} ${doorTop} H${DOOR_X} M${DOOR_X - 12} ${doorBot} H${DOOR_X}"/>`)
  s.push(
    `<text class="t-note-a" transform="rotate(-90 ${DOOR_X + 16} ${doorMid})" x="${DOOR_X + 16}" y="${doorMid}" text-anchor="middle">${escapeXml(doorwayNote)}</text>`,
  )

  s.push('</svg>')
  return s.join('\n')
}
