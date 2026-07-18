// Build-time Buchrücken generator (Praxis-Oberflächen-Paket): a TS port of research-
// ecology's docs/design/variants-2026-07-15/atelier_history_viz.py — the Atelier's own
// history form (ADR 0010: sheet grammar, NOT the Middle's score). The practice counts in
// sessions: every journal page stands as a spine line, works hang as slabs under their
// night, the error register strikes in red pencil above, threads are born as red kinks
// and stay open, dates ride below as rotated marginalia. The right edge is the Atelier's
// own data edge: the nightly register closed 18 July 2026 (v4 revision of the approved
// formula, wortlaute §2 + public-surface patch 2026-07-18).
//
// Pure and deterministic: same inputs ⇒ byte-identical SVG. No randomness, no clock.
//
// Named deviations from the mockup (site reads its committed mirror, not the engine git):
//  · works hang by their COMMITTED dates (meta.json / register headings), not git
//    add-dates — the caption says so („hung by committed date“);
//  · constitution amendments (graphite ✳, git dates of PROTOCOL.md) are NOT drawn —
//    the mirror carries no amendment dates; an honest margin note replaces the row.
import { ATELIER_GRAMMAR } from '@/config/atelier-wording'
import type { SessionPage } from './sessions'

export interface SpineThread {
  /** the session the thread was born in (min swerve session) */
  session: number
  short: string
  full: string
}

export interface SpineInput {
  pages: SessionPage[]
  /** works per date (committed dates) */
  worksByDate: Record<string, number>
  /** catalogued errors per date (error-register headings) */
  errorsByDate: Record<string, number>
  threads: SpineThread[]
  /** margin note replacing the mockup's constitution row (honesty over silence) */
  constitutionNote: string
  worksCaption: string // e.g. 'hung by committed date'
}

// ---------------------------------------------------------------- ported constants
// (X0=300, STEP=34; thread stack 26px; strikes 9px; works rows 22px). SPINE_TOP moves
// down deterministically when more threads exist than the mockup's three.
const W = 1440
const VIEW_TOP = 172
const X0 = 300
const STEP = 34
const MAX_PAGES = 30
const QUIRE = 8

export interface BoundQuire {
  from: number
  to: number
}

/** Buchbinder-Regel (Zeichengrammatik §7, Atelier-Geschmack; erstmals aktiv mit S31/S32,
 * 2026-07-16): wächst der Rücken über die 30 Slots des Blatts, binden sich die ÄLTESTEN
 * Seiten zu Oktav-Lagen (8 Blatt), bis der Rücken wieder passt — die Gegenwart bleibt lose
 * und feinkörnig, die aktive Regel steht als Formel auf der Karte (deklariert, nie still),
 * und das Register darunter führt weiterhin jede einzelne Seite. */
export function bindQuires(pages: SessionPage[]): { quires: BoundQuire[]; loose: SessionPage[] } {
  const quires: BoundQuire[] = []
  let loose = pages.slice()
  while (quires.length + loose.length > MAX_PAGES && loose.length >= QUIRE) {
    quires.push({ from: loose[0].n, to: loose[QUIRE - 1].n })
    loose = loose.slice(QUIRE)
  }
  if (quires.length + loose.length > MAX_PAGES) {
    throw new Error(
      `buildSpineSvg: ${pages.length} pages exceed the sheet even fully bound ` +
        `(max ${MAX_PAGES} slots, ${QUIRE} pages a quire). The next gathering — quires into ` +
        `volumes — is a different, not-yet-built generator, not a silent re-layout of this one.`,
    )
  }
  return { quires, loose }
}

export interface SpineRegisterRow {
  page: string
  date: string
  works: string
  errors: string
  threadBorn: string
  anchor: string
}

/** The session register table under the spine — counts shown at each day's first page. */
export function spineRegister(input: SpineInput): SpineRegisterRow[] {
  const firstOfDay = new Map<string, number>()
  for (const p of input.pages) if (!firstOfDay.has(p.date)) firstOfDay.set(p.date, p.n)
  return input.pages.map((p) => {
    const first = firstOfDay.get(p.date) === p.n
    const thread = input.threads.find((t) => t.session === p.n)
    return {
      page: `S${p.n}`,
      date: p.date,
      works: first ? String(input.worksByDate[p.date] ?? '—') : '',
      errors: first ? String(input.errorsByDate[p.date] ?? '—') : '',
      threadBorn: thread ? `thread born: ${thread.short}` : '',
      anchor: `s${p.n}`,
    }
  })
}

function escapeXml(value: string): string {
  return value
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#x27;')
}

/**
 * Builds the spine SVG, mirroring atelier_history_viz.py's build_svg() structure: thread
 * ribbons born late and staying open, the error-register band, the spine of pages with the
 * unwritten next page, rotated date marginalia, works hanging under their night.
 */
export function buildSpineSvg(input: SpineInput): string {
  const { pages, threads } = input
  if (pages.length === 0) throw new Error('buildSpineSvg: no journal pages')
  const { quires, loose } = bindQuires(pages)

  // Slot-Geometrie: eine gebundene Lage belegt EINEN Slot, lose Seiten je einen —
  // ohne Bindung ist xOf(n) exakt das alte sx(n) (byte-identischer Bestandspfad).
  const slotOf = new Map<number, number>()
  quires.forEach((q, i) => {
    for (let n = q.from; n <= q.to; n++) slotOf.set(n, i)
  })
  loose.forEach((p, i) => slotOf.set(p.n, quires.length + i))
  const xOf = (n: number) => X0 + (slotOf.get(n) ?? 0) * STEP
  const quireIndexOf = (n: number) => {
    for (let i = 0; i < quires.length; i++) if (n >= quires[i].from && n <= quires[i].to) return i
    return -1
  }

  const nextX = X0 + (quires.length + loose.length) * STEP
  const firstOfDay = new Map<string, number>()
  for (const p of pages) if (!firstOfDay.has(p.date)) firstOfDay.set(p.date, p.n)

  // thread stack above the spine — the spine top yields deterministically when the stack
  // outgrows the mockup's three ribbons.
  const thY0 = 232
  const threadsBottom = threads.length ? thY0 + (threads.length - 1) * 26 + 20 : thY0
  const maxErr = Math.max(0, ...Object.values(input.errorsByDate))
  const spineTop = Math.max(318, threadsBottom + 36 + maxErr * 9)
  const spineBot = spineTop + 56
  const worksY0 = spineBot + 94
  const maxWorks = Math.max(0, ...Object.values(input.worksByDate))
  const bottom = worksY0 + Math.max(0, maxWorks - 1) * 22 + 40
  const height = bottom - VIEW_TOP + 20

  const s: string[] = []
  s.push(
    `<svg id="spine" viewBox="0 ${VIEW_TOP} ${W} ${height}" role="img" aria-label="The spine: ` +
      `${pages.length} journal pages, works and errors per night, ${threads.length} threads; ` +
      `the session register follows as a table.">`,
  )

  // thread ribbons, born late, staying open
  threads.forEach((t, i) => {
    const x = xOf(t.session)
    const y = thY0 + i * 26
    s.push(`<path class="rp" d="M${x} ${spineTop} C ${x - 2} ${y + 40}, ${x + 4} ${y + 14}, ${x + 16} ${y}" fill="none"/>`)
    s.push(`<path class="th" d="M${x + 16} ${y} C ${x + 70} ${y - 4}, ${nextX - 60} ${y - 2}, ${nextX + 6} ${y - 3}"/>`)
    const short = t.short.length <= 40 ? t.short : t.short.slice(0, 37) + '…'
    s.push(
      `<text class="t-thread" x="${x - 16}" y="${y - 10}" text-anchor="end">${escapeXml(short)}<title>${escapeXml(t.full)}</title></text>`,
    )
  })
  if (threads.length) {
    s.push(`<text class="t-note-a" x="${nextX + 14}" y="${thY0 + 2}">threads stay</text>`)
    s.push(`<text class="t-note-a" x="${nextX + 14}" y="${thY0 + 16}">open →</text>`)
  }

  // the error-register band (red strikes above the spine)
  const errTotal = Object.values(input.errorsByDate).reduce((a, b) => a + b, 0)
  s.push(`<text class="t-sess" x="${X0 - 58}" y="${spineTop - 18}" text-anchor="end">ERROR REGISTER · ${errTotal}</text>`)
  const quireErr = quires.map(() => 0)
  for (const [d, cnt] of Object.entries(input.errorsByDate)) {
    const first = firstOfDay.get(d)
    if (first === undefined) continue
    const qi = quireIndexOf(first)
    if (qi >= 0) {
      quireErr[qi] += cnt
      continue
    }
    const x = xOf(first)
    for (let k = 0; k < cnt; k++) {
      const y = spineTop - 12 - k * 9
      s.push(`<path class="rp" d="M${x - 5} ${y} L${x + 5} ${y - 5}"/>`)
    }
  }

  // the spine: loose pages + bound quires + the unwritten next page (approved wording)
  for (const p of loose) {
    s.push(
      `<path class="page" d="M${xOf(p.n)} ${spineTop} V${spineBot}"><title>S${p.n} — ${escapeXml(p.date)} (journal/, verbatim)</title></path>`,
    )
    if (p.n === 1 || p.n % 5 === 0 || p.n === pages.length) {
      s.push(`<text class="t-sess-n" x="${xOf(p.n)}" y="${spineBot + 16}" text-anchor="middle">S${p.n}</text>`)
    }
  }
  quires.forEach((q, i) => {
    const x = X0 + i * STEP
    s.push(
      `<g class="quire"><path class="page" d="M${x - 3} ${spineTop} V${spineBot}"/>` +
        `<path class="page" d="M${x + 3} ${spineTop} V${spineBot}"/>` +
        `<path class="page" d="M${x - 7} ${spineTop + 7} H${x + 7}"/>` +
        `<path class="page" d="M${x - 7} ${spineBot - 7} H${x + 7}"/>` +
        `<title>${escapeXml(ATELIER_GRAMMAR.quireLabel(q.from, q.to))} — bound quire (${QUIRE} pages, oldest bind first); every page stays in the register below</title></g>`,
    )
    s.push(
      `<text class="t-sess-n" x="${x}" y="${spineBot + 16}" text-anchor="middle">${escapeXml(ATELIER_GRAMMAR.quireLabel(q.from, q.to))}</text>`,
    )
    if (quireErr[i] > 0) {
      s.push(`<text class="t-sess" x="${x}" y="${spineTop - 14}" text-anchor="middle">×${quireErr[i]}</text>`)
    }
  })
  s.push(`<path class="page page-next" d="M${nextX} ${spineTop} V${spineBot}"/>`)
  const midY = Math.floor((spineTop + spineBot) / 2)
  s.push(`<text class="t-note-a" x="${nextX + 12}" y="${midY - 2}">${escapeXml(ATELIER_GRAMMAR.dataEdgeLines[0])}</text>`)
  s.push(`<text class="t-note-a" x="${nextX + 12}" y="${midY + 12}">${escapeXml(ATELIER_GRAMMAR.dataEdgeLines[1])}</text>`)
  s.push(`<text class="t-lane-a" x="${X0 - 58}" y="${midY - 6}" text-anchor="end">JOURNAL</text>`)
  s.push(`<text class="t-note-a" x="${X0 - 58}" y="${midY + 10}" text-anchor="end">${pages.length} pages · S1–S${pages.length}</text>`)
  if (quires.length) {
    s.push(`<text class="t-note-a" x="${X0 - 58}" y="${midY + 26}" text-anchor="end">${quires.length} quire${quires.length === 1 ? '' : 's'} bound</text>`)
    s.push(`<text class="t-note-a" x="${nextX + 12}" y="${midY + 28}">${escapeXml(ATELIER_GRAMMAR.quireNote)}</text>`)
  }

  // honest margin note where the mockup drew constitution asterisks (git dates not mirrored)
  s.push(`<text class="t-note-a" x="${X0 - 58}" y="${spineTop - 34}" text-anchor="end">${escapeXml(input.constitutionNote)}</text>`)

  // date marginalia (rotated, at day change; bound days collapse to a range per quire)
  const quireDates = quires.map(() => [] as string[])
  for (const [d, n] of firstOfDay) {
    const qi = quireIndexOf(n)
    if (qi >= 0) {
      quireDates[qi].push(d)
      continue
    }
    const x = xOf(n)
    s.push(
      `<text class="t-date-r" transform="rotate(-90 ${x + 3} ${spineBot + 66})" x="${x + 3}" y="${spineBot + 66}" text-anchor="middle">${escapeXml(d.slice(5))}</text>`,
    )
  }
  quireDates.forEach((ds, i) => {
    if (!ds.length) return
    const sorted = ds.slice().sort()
    const lbl = sorted.length > 1 ? `${sorted[0].slice(5)}–${sorted[sorted.length - 1].slice(5)}` : sorted[0].slice(5)
    const x = X0 + i * STEP
    s.push(
      `<text class="t-date-r" transform="rotate(-90 ${x + 3} ${spineBot + 66})" x="${x + 3}" y="${spineBot + 66}" text-anchor="middle">${escapeXml(lbl)}</text>`,
    )
  })

  // works hanging under their night (slabs, stacked)
  const worksTotal = Object.values(input.worksByDate).reduce((a, b) => a + b, 0)
  s.push(`<text class="t-lane-a" x="${X0 - 58}" y="${worksY0 + 22}" text-anchor="end">WORKS · ${worksTotal}</text>`)
  s.push(`<text class="t-note-a" x="${X0 - 58}" y="${worksY0 + 38}" text-anchor="end">${escapeXml(input.worksCaption)}</text>`)
  const quireWorks = quires.map(() => 0)
  for (const [d, cnt] of Object.entries(input.worksByDate)) {
    const first = firstOfDay.get(d)
    if (first === undefined) continue
    const qi = quireIndexOf(first)
    if (qi >= 0) {
      quireWorks[qi] += cnt
      continue
    }
    const x = xOf(first)
    for (let k = 0; k < cnt; k++) {
      const y = worksY0 + k * 22
      s.push(
        `<rect class="slab" x="${x - 4}" y="${y}" width="8" height="16"><title>${escapeXml(d)} — ${cnt} work(s), committed date</title></rect>`,
      )
    }
  }
  quireWorks.forEach((cnt, i) => {
    if (cnt === 0) return
    const x = X0 + i * STEP
    s.push(
      `<rect class="slab" x="${x - 4}" y="${worksY0}" width="8" height="16"><title>${escapeXml(ATELIER_GRAMMAR.quireLabel(quires[i].from, quires[i].to))} — ${cnt} work(s), committed dates</title></rect>`,
    )
    s.push(`<text class="t-note-a" x="${x + 8}" y="${worksY0 + 13}">×${cnt}</text>`)
  })

  s.push('</svg>')
  return s.join('\n')
}
