// The v3 entrance's data layer (research ecology v3, 2026-08-30 — the shared question).
//
// Everything the surface shows is derived from committed files; nothing is typed into the
// component and nothing is fetched at runtime. Three sources, three loaders:
//
//   · cycle       — src/data/ecology/cycle.json, the canonical cycle state this repo owns.
//                   Invalid state fails the build loudly: a wrong phase on the entrance would
//                   be the site lying about the house's clock.
//   · bulletins   — src/content/<practice>/BULLETIN.md, mirrored from the engine repos by the
//                   integrate workflows. Absence is a fact the surface draws, not an error:
//                   before a practice's first v3 session closes there IS no bulletin.
//   · presentations — public/<practice>/presentations/cycle-*/, mirrored bare (the artifacts
//                   are self-contained pages; the house adds no paratext). Served where they
//                   land; entries without an html face link to the practice's own repository.
import fs from 'node:fs'
import path from 'node:path'

export type PracticeId = 'atelier' | 'field' | 'studio'
export const PRACTICES: PracticeId[] = ['field', 'atelier', 'studio']

/** The engine repository behind each mirrored practice directory. */
export const PRACTICE_REPO: Record<PracticeId, string> = {
  atelier: 'ulysses',
  field: 'field-research',
  studio: 'studio',
}

export type CyclePhase = 'closing' | 'working' | 'presenting'
const PHASES: CyclePhase[] = ['closing', 'working', 'presenting']

export interface CycleState {
  cycle: number
  phase: CyclePhase
  question: string | null
  source: 'seed' | 'defaults'
  opened: string
  sessionsPerPractice: string
  defaults: Record<PracticeId, string>
}

export function loadCycle(root: string = process.cwd()): CycleState {
  const file = path.join(root, 'src/data/ecology/cycle.json')
  const raw = JSON.parse(fs.readFileSync(file, 'utf8'))
  if (!PHASES.includes(raw.phase)) throw new Error(`cycle.json: unknown phase "${raw.phase}"`)
  if (typeof raw.cycle !== 'number' || raw.cycle < 0)
    throw new Error(`cycle.json: cycle must be a non-negative number, got ${raw.cycle}`)
  if (raw.source !== 'seed' && raw.source !== 'defaults')
    throw new Error(`cycle.json: unknown source "${raw.source}"`)
  if (raw.source === 'seed' && (typeof raw.question !== 'string' || raw.question.length === 0))
    throw new Error('cycle.json: source "seed" requires a question')
  for (const p of PRACTICES)
    if (typeof raw.defaults?.[p] !== 'string' || raw.defaults[p].length === 0)
      throw new Error(`cycle.json: missing default theme for "${p}"`)
  if (!/^\d{4}-\d{2}-\d{2}$/.test(raw.opened))
    throw new Error(`cycle.json: opened must be a date, got "${raw.opened}"`)
  return {
    cycle: raw.cycle,
    phase: raw.phase,
    question: raw.question ?? null,
    source: raw.source,
    opened: raw.opened,
    sessionsPerPractice: String(raw.sessions_per_practice ?? '3-5'),
    defaults: { atelier: raw.defaults.atelier, field: raw.defaults.field, studio: raw.defaults.studio },
  }
}

/** The protocols cap a bulletin at 40 lines; the surface tolerates a little drift before it
 *  truncates, and says so when it does — a silently clipped record would misquote the practice. */
export const BULLETIN_DISPLAY_MAX = 48

export interface Bulletin {
  present: boolean
  /** The shown text (trailing whitespace trimmed, capped at BULLETIN_DISPLAY_MAX lines). */
  text: string | null
  lines: number
  truncated: boolean
}

export function loadBulletin(practice: PracticeId, root: string = process.cwd()): Bulletin {
  const file = path.join(root, 'src/content', practice, 'BULLETIN.md')
  if (!fs.existsSync(file)) return { present: false, text: null, lines: 0, truncated: false }
  const all = fs.readFileSync(file, 'utf8').replace(/\s+$/, '').split('\n')
  const truncated = all.length > BULLETIN_DISPLAY_MAX
  const shown = truncated ? all.slice(0, BULLETIN_DISPLAY_MAX) : all
  return { present: true, text: shown.join('\n'), lines: all.length, truncated }
}

/** A practice's closing report (Protocol §8, the one-time transition of 2026-08-30) — a
 *  self-contained page mirrored bare from the engine repository. */
export interface ClosingReport {
  practice: PracticeId
  href: string
}

/** Where a report may sit, in the order the surface looks. Two entries because the practices
 *  did not land in the same place: the Field and the Studio wrote `closing-report/`, while the
 *  Atelier's gate refused a new root path on the day the constitution landed, so its report
 *  (titled "The Atelier — closing report") is its window page. The surface links where each
 *  practice actually put it rather than asserting a path none of them agreed on. */
const REPORT_CANDIDATES = ['closing-report', 'window'] as const

export function loadClosingReports(root: string = process.cwd()): ClosingReport[] {
  const found: ClosingReport[] = []
  for (const practice of PRACTICES) {
    for (const dir of REPORT_CANDIDATES) {
      const index = path.join(root, 'public', practice, dir, 'index.html')
      if (!fs.existsSync(index)) continue
      // Only count a window as the report when the page says so itself — a window is its own
      // thing, and a practice that has one but wrote no report must not appear to have one.
      if (dir === 'window') {
        const head = fs.readFileSync(index, 'utf8').slice(0, 4096)
        if (!/closing report/i.test(head)) continue
      }
      found.push({ practice, href: `/${practice}/${dir}/` })
      break
    }
  }
  return found
}

/** A dated artifact of the current cycle, as the practice committed it. The date prefix in
 *  the directory name is the practice's own; it is read, never invented. */
export interface ArtifactEntry {
  practice: PracticeId
  slug: string
  date: string | null
  href: string
}

export function loadArtifacts(root: string = process.cwd()): ArtifactEntry[] {
  const found: ArtifactEntry[] = []
  for (const practice of PRACTICES) {
    const base = path.join(root, 'public', practice, 'artifacts')
    if (!fs.existsSync(base)) continue
    for (const cycleDir of fs.readdirSync(base)) {
      const cyclePath = path.join(base, cycleDir)
      if (!fs.statSync(cyclePath).isDirectory()) continue
      for (const slug of fs.readdirSync(cyclePath)) {
        const dir = path.join(cyclePath, slug)
        if (!fs.statSync(dir).isDirectory()) continue
        if (!fs.existsSync(path.join(dir, 'index.html'))) continue
        const m = /^(\d{4}-\d{2}-\d{2})-(.*)$/.exec(slug)
        found.push({
          practice,
          slug: m ? m[2]! : slug,
          date: m ? m[1]! : null,
          href: `/${practice}/artifacts/${cycleDir}/${slug}/`,
        })
      }
    }
  }
  // newest first; undated entries last, then by practice for a stable order
  return found.sort(
    (a, b) =>
      (b.date ?? '').localeCompare(a.date ?? '') ||
      PRACTICES.indexOf(a.practice) - PRACTICES.indexOf(b.practice),
  )
}

export interface PresentationEntry {
  cycle: number
  practice: PracticeId
  /** Site-relative href when the artifact has an html face; the repo URL otherwise. */
  href: string
  files: number
}

export function loadPresentations(root: string = process.cwd()): PresentationEntry[] {
  const entries: PresentationEntry[] = []
  for (const practice of PRACTICES) {
    const base = path.join(root, 'public', practice, 'presentations')
    if (!fs.existsSync(base)) continue
    for (const dir of fs.readdirSync(base)) {
      const m = /^cycle-(\d+)$/.exec(dir)
      if (!m) continue
      const full = path.join(base, dir)
      if (!fs.statSync(full).isDirectory()) continue
      const files = fs.readdirSync(full, { recursive: true }).filter((f) => {
        return fs.statSync(path.join(full, String(f))).isFile()
      })
      if (files.length === 0) continue
      const html = files.map(String).find((f) => f.endsWith('index.html')) ??
        files.map(String).find((f) => f.endsWith('.html'))
      const href = html
        ? `/${practice}/presentations/${dir}/${html === 'index.html' ? '' : html}`
        : `https://github.com/frankbueltge/${PRACTICE_REPO[practice]}/tree/main/presentations/${dir}`
      entries.push({ cycle: Number(m[1]), practice, href, files: files.length })
    }
  }
  return entries.sort(
    (a, b) => b.cycle - a.cycle || PRACTICES.indexOf(a.practice) - PRACTICES.indexOf(b.practice),
  )
}
