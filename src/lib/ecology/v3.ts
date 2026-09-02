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

/** A dated artifact of a cycle, as the practice committed it. Date, title and cycle are the
 *  practice's own — read from its record, never invented.
 *
 *  Three practices, three conventions (2026-09-02). Protocol v7 §4 says every session leaves an
 *  artifact and names no path for it, and the practices did not land in the same place:
 *
 *    · The Field writes `artifacts/cycle-NNN/<date>-<slug>/` — date and cycle in the path.
 *    · The Atelier writes `window/cycle-NNN[-session-n]/` — the cycle in the path, no date; the
 *      session note in its journal that names the window (`Artifact: window/…`) carries the day
 *      in its own filename, and the window's <title> is the artifact's title.
 *    · The Studio ships works: `works/<date>-<slug>/meta.json` (date, title) with the page under
 *      `werke-html/`. A work names no cycle; it belongs to the cycle whose opening it follows,
 *      which is the caller's rule (inCycle), because only the house clock knows the cycle.
 *
 *  Until 2026-09-02 the loader read the Field's convention alone, and the entrance's score drew
 *  "no artifact yet this cycle" on two lanes that had delivered four artifacts each. */
export interface ArtifactEntry {
  practice: PracticeId
  slug: string
  date: string | null
  href: string
  /** The cycle the practice's own path names; null when the record carries none (a work). */
  cycle: number | null
  /** The practice's own title where its record has one (a window's <title>, a work's meta.json). */
  title?: string
}

/** Whether an artifact belongs to the given cycle: by the cycle its path names, or — for a
 *  record that names none — by the house clock: shipped on or after the day the cycle opened.
 *  Only the running cycle can be judged this way (cycle.json holds no history), which is all
 *  the surfaces draw. */
export function inCycle(a: ArtifactEntry, cycle: CycleState): boolean {
  if (a.cycle !== null) return a.cycle === cycle.cycle
  return a.date !== null && a.date >= cycle.opened
}

const CYCLE_DIR = /^cycle-(\d+)/
const DATED_SLUG = /^(\d{4}-\d{2}-\d{2})-(.*)$/

function isDir(p: string): boolean {
  return fs.existsSync(p) && fs.statSync(p).isDirectory()
}

/** The <title> of a self-contained page, read from its head only, with the practice's own
 *  " — The Atelier, cycle 001, session 2" suffix trimmed: the practice is the lane, the cycle
 *  is the ruler, so the title keeps what only it says. Entities a title commonly carries are
 *  decoded; anything else is left as written. */
function pageTitle(index: string): string | undefined {
  const head = fs.readFileSync(index, 'utf8').slice(0, 4096)
  const m = /<title>([^<]*)<\/title>/i.exec(head)
  if (!m) return undefined
  const raw = m[1]!
    .replace(/&amp;/g, '&')
    .replace(/&#39;|&apos;/g, "'")
    .replace(/&quot;/g, '"')
    .replace(/&lt;/g, '<')
    .replace(/&gt;/g, '>')
    .replace(/\s+—\s+The (Atelier|Field|Studio)\b.*$/, '')
    .trim()
  return raw.length > 0 ? raw : undefined
}

/** The day a window was made: the earliest journal note that names it. A note names a window
 *  by its path (`window/cycle-001-session-3/`); the match stops at the directory's end so the
 *  note for `window/cycle-001/` does not date every session under that cycle. */
function windowDate(practice: PracticeId, dir: string, root: string): string | null {
  const journal = path.join(root, 'src/content', practice, 'journal')
  if (!isDir(journal)) return null
  const names = new RegExp(`window/${dir.replace(/[.*+?^${}()|[\]\\]/g, '\\$&')}(?![\\w-])`)
  const days: string[] = []
  for (const file of fs.readdirSync(journal)) {
    const m = /^(\d{4}-\d{2}-\d{2})-.*\.md$/.exec(file)
    if (!m) continue
    if (names.test(fs.readFileSync(path.join(journal, file), 'utf8'))) days.push(m[1]!)
  }
  return days.length > 0 ? days.sort()[0]! : null
}

export function loadArtifacts(root: string = process.cwd()): ArtifactEntry[] {
  const found: ArtifactEntry[] = []
  for (const practice of PRACTICES) {
    // artifacts/cycle-NNN/<date>-<slug>/ — the Field's convention, read for every practice
    const artifacts = path.join(root, 'public', practice, 'artifacts')
    if (isDir(artifacts)) {
      for (const cycleDir of fs.readdirSync(artifacts)) {
        const cyclePath = path.join(artifacts, cycleDir)
        if (!isDir(cyclePath)) continue
        const cycleNo = CYCLE_DIR.exec(cycleDir)
        for (const slug of fs.readdirSync(cyclePath)) {
          const dir = path.join(cyclePath, slug)
          if (!isDir(dir) || !fs.existsSync(path.join(dir, 'index.html'))) continue
          const m = DATED_SLUG.exec(slug)
          found.push({
            practice,
            slug: m ? m[2]! : slug,
            date: m ? m[1]! : null,
            href: `/${practice}/artifacts/${cycleDir}/${slug}/`,
            cycle: cycleNo ? Number(cycleNo[1]) : null,
          })
        }
      }
    }

    // window/cycle-NNN[-session-n]/ — the Atelier's convention. The window root itself is the
    // practice's own page (and, for the Atelier, its closing report — loadClosingReports), not
    // an artifact; only the cycle-named directories under it are.
    const window = path.join(root, 'public', practice, 'window')
    if (isDir(window)) {
      for (const dir of fs.readdirSync(window)) {
        const cycleNo = CYCLE_DIR.exec(dir)
        if (!cycleNo) continue
        const index = path.join(window, dir, 'index.html')
        if (!isDir(path.join(window, dir)) || !fs.existsSync(index)) continue
        found.push({
          practice,
          slug: dir,
          date: windowDate(practice, dir, root),
          href: `/${practice}/window/${dir}/`,
          cycle: Number(cycleNo[1]),
          title: pageTitle(index),
        })
      }
    }

    // works/<date>-<slug>/meta.json + werke-html/<slug>/index.html — the Studio's convention.
    // A work without a page on this site is not linked, so it is not listed.
    const works = path.join(root, 'src/content', practice, 'works')
    if (isDir(works)) {
      for (const dir of fs.readdirSync(works)) {
        const meta = path.join(works, dir, 'meta.json')
        const face = path.join(root, 'public', practice, 'werke-html', dir, 'index.html')
        if (!fs.existsSync(meta) || !fs.existsSync(face)) continue
        const m = DATED_SLUG.exec(dir)
        let parsed: { title?: unknown; date?: unknown } = {}
        try {
          parsed = JSON.parse(fs.readFileSync(meta, 'utf8'))
        } catch {
          continue
        }
        const date =
          typeof parsed.date === 'string' && /^\d{4}-\d{2}-\d{2}$/.test(parsed.date)
            ? parsed.date
            : m
              ? m[1]!
              : null
        const title = typeof parsed.title === 'string' && parsed.title.trim() ? parsed.title.trim() : undefined
        found.push({
          practice,
          slug: m ? m[2]! : dir,
          date,
          href: `/${practice}/werke-html/${dir}/`,
          cycle: null,
          ...(title ? { title } : {}),
        })
      }
    }
  }
  // newest first; undated entries last; then by practice, then by slug — a total order, so the
  // listing never depends on the filesystem's own
  return found.sort(
    (a, b) =>
      (b.date ?? '').localeCompare(a.date ?? '') ||
      PRACTICES.indexOf(a.practice) - PRACTICES.indexOf(b.practice) ||
      a.slug.localeCompare(b.slug),
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
