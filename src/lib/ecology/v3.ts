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

import { buildSessionEntries } from '@/lib/atelier/sessions'
import { buildDayIndex } from '@/lib/engines/journal'

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
  /** The day the presentation's own summary names, or null when it names none — see
   *  summaryDate. A presentation with no committed day is listed, never placed on a ruler. */
  date: string | null
  /** The artifact page's own <title>, practice suffix trimmed. */
  title?: string
}

/** The day a presentation carries: the LAST calendar date its own SUMMARY.md names in its
 *  opening block. The two practices that have presented wrote different headers — the Field's
 *  reads "Five sessions, 2026-08-30 to 2026-09-01", the Studio's "The Studio's presentation for
 *  cycle 001 of the research ecology. 2026-09-02." — and neither carries a machine-readable
 *  field. The last date of the opening block is the one day both headers agree is not before the
 *  presentation: the Field's last session, the Studio's stated day. It is read from the
 *  practice's own record, never from the clock, and the figure's card names the file it came
 *  from so a reader can check it. A summary that names no date leaves the presentation undated. */
const SUMMARY_HEAD = 700
function summaryDate(dir: string): string | null {
  const file = path.join(dir, 'SUMMARY.md')
  if (!fs.existsSync(file)) return null
  const head = fs.readFileSync(file, 'utf8').slice(0, SUMMARY_HEAD)
  const days = [...head.matchAll(/\b(\d{4}-\d{2}-\d{2})\b/g)].map((m) => m[1]!)
  return days.length > 0 ? days.sort()[days.length - 1]! : null
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
      const face = path.join(full, 'index.html')
      const title = fs.existsSync(face) ? pageTitle(face) : undefined
      entries.push({
        cycle: Number(m[1]),
        practice,
        href,
        files: files.length,
        date: summaryDate(full),
        ...(title ? { title } : {}),
      })
    }
  }
  return entries.sort(
    (a, b) => b.cycle - a.cycle || PRACTICES.indexOf(a.practice) - PRACTICES.indexOf(b.practice),
  )
}

// ---------------------------------------------------------------------------------------------
// The three records the partitur added on 2026-09-02 (docs/design/2026-09-02-the-visual-layer.md,
// Phase 1). The artifact trail was never the whole cycle: a cycle also holds the SESSIONS that
// produced those artifacts, the LETTERS the house prepared for receivers outside it, and the
// ENCOUNTERS in which one practice's material travelled into another's work. All three already
// live in committed files with their own surfaces; these loaders only read them the way the
// score needs them — dated, titled, and pointing at the page this site already publishes.
//
// Every one of them takes a `since` day (the running cycle's opening) rather than filtering at
// the call site, because two of the three must walk their WHOLE record before they can filter:
// the journal's anchors are assigned in one chronological pass and a partial walk would invent
// different ones (see loadSessionNotes).

/** The body a content collection would hand a route: the file without its YAML frontmatter.
 *  Load-bearing, not cosmetic — thirty-three of the Atelier's journal files carry frontmatter,
 *  and a raw read would feed the `---` block to the same splitters the routes use: the H1 would
 *  no longer be the first line (the note would be titled by its date) and, in a day-based
 *  journal, the block would become a heading-less first chunk that shifts every anchor in the
 *  file. The marks would then link to pages that do not exist. */
function withoutFrontmatter(text: string): string {
  const m = /^---\r?\n([\s\S]*?)\r?\n---\r?\n?/.exec(text)
  return m ? text.slice(m[0].length) : text
}

/** One session of a practice's journal, as the practice wrote it and as this site publishes it. */
export interface SessionNote {
  practice: PracticeId
  /** the calendar day the note belongs to */
  date: string
  /** the note's own H1, or the day when the file carries none */
  title: string
  /** this site's page for that session */
  href: string
  /** the URL segment the practice's own journal route uses — its stable id */
  anchor: string
  /** the committed file the note was read from */
  source: string
}

/**
 * A practice's journal sessions from `since` onwards, each pointing at the page this site
 * already builds for it.
 *
 * THE WALK IS COMPLETE ON PURPOSE, THE FILTER COMES LAST. The two day-based practices number
 * their sessions in one chronological pass over the whole journal (buildDayIndex: the first
 * claimant of a drifting session number keeps the clean `cs-N` anchor, later ones get a day
 * suffix), so a walk that started at the cycle's opening would hand out DIFFERENT anchors than
 * the routes did — every mark would link to a page that does not exist. So the same functions
 * the routes use produce the same ids here, and only then does `since` cut the list.
 *
 * The three practices reach their session pages differently, and this follows each one rather
 * than inventing a fourth convention: the Field and the Studio publish `/<practice>/journal/
 * <anchor>/` from `buildDayIndex`, the Atelier `/atelier/journal/<slug>/` from
 * `buildSessionEntries` (`s12`, `note-<slug>` — the register's own numbering).
 */
export function loadSessionNotes(
  practice: PracticeId,
  since: string,
  root: string = process.cwd(),
): SessionNote[] {
  const dir = path.join(root, 'src/content', practice, 'journal')
  if (!isDir(dir)) return []
  const files = fs
    .readdirSync(dir)
    .filter((f) => f.endsWith('.md'))
    .sort()
  const entries = files.map((f) => ({
    id: `journal/${f}`,
    body: withoutFrontmatter(fs.readFileSync(path.join(dir, f), 'utf8')),
  }))
  const notes: SessionNote[] = []

  if (practice === 'atelier') {
    for (const e of buildSessionEntries(entries)) {
      notes.push({
        practice,
        date: e.date,
        title: e.heading,
        href: `/atelier/journal/${e.slug}/`,
        anchor: e.slug,
        source: `src/content/atelier/${e.id}`,
      })
    }
  } else {
    const repo = `https://github.com/frankbueltge/${PRACTICE_REPO[practice]}`
    const { daysAsc, sessionsAsc } = buildDayIndex(entries, { repo, docs: new Set<string>() })
    const dayOf = new Map(daysAsc.flatMap((d) => d.sessions.map((s) => [s.anchor, d] as const)))
    for (const s of sessionsAsc) {
      const day = dayOf.get(s.anchor)
      if (!day) continue
      notes.push({
        practice,
        date: day.date,
        title: s.heading || day.date,
        href: `/${practice}/journal/${s.anchor}/`,
        anchor: s.anchor,
        source: `src/content/${practice}/${day.id}`,
      })
    }
  }

  return notes
    .filter((n) => n.date >= since)
    .sort((a, b) => a.date.localeCompare(b.date) || a.anchor.localeCompare(b.anchor))
}

/** One prepared delivery of the post office's outgoing ledger. `practice` is the ledger's own
 *  field: one of the three practices, or the ecology / the plenum — which is the house speaking
 *  as itself, and lands on the house lane. */
export interface LetterEntry {
  id: string
  practice: 'atelier' | 'field' | 'studio' | 'plenum' | 'ecology'
  date: string
  title: string
  receiver: string
  status: string
  href: string
  source: string
}

const LEDGER_FILE = 'src/data/post/ledger.json'

/** The outgoing ledger from `since` onwards. Read from the committed file rather than through
 *  src/lib/post/ledger.ts because the loaders of this module take a root (a test hands them a
 *  fixture tree), which a bundler-resolved JSON import cannot do. The site's own post office
 *  stays the validating reader; this one only needs day, words and receiver. */
export function loadLetters(since: string, root: string = process.cwd()): LetterEntry[] {
  const file = path.join(root, LEDGER_FILE)
  if (!fs.existsSync(file)) return []
  let raw: unknown
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return []
  }
  if (!Array.isArray(raw)) return []
  const out: LetterEntry[] = []
  for (const e of raw as Record<string, unknown>[]) {
    const date = typeof e.as_of === 'string' ? e.as_of : ''
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < since) continue
    if (typeof e.id !== 'string' || typeof e.piece !== 'string') continue
    const practice = String(e.practice) as LetterEntry['practice']
    out.push({
      id: e.id,
      practice,
      date,
      title: e.piece,
      receiver: typeof e.receiver === 'string' ? e.receiver : '',
      status: typeof e.status === 'string' ? e.status : '',
      href: '/post/',
      source: LEDGER_FILE,
    })
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
}

/** One encounter of the register — a crossing between two practices, dated by the day the
 *  receiving practice premiered the work that carried the material. */
export interface EncounterEntry {
  id: string
  date: string
  title: string
  href: string
  source: string
}

const REGISTER_FILE = 'src/data/begegnungen/register.json'

/** The encounter register from `since` onwards. An encounter is dated by `observed.premiered_on`
 *  — the day the crossing became visible in a work — and belongs to no single practice, so the
 *  score puts it on the house lane. Entries the register has not yet observed a premiere for
 *  carry no day and are left out rather than placed on a guess. */
export function loadEncounters(since: string, root: string = process.cwd()): EncounterEntry[] {
  const file = path.join(root, REGISTER_FILE)
  if (!fs.existsSync(file)) return []
  let raw: unknown
  try {
    raw = JSON.parse(fs.readFileSync(file, 'utf8'))
  } catch {
    return []
  }
  if (!Array.isArray(raw)) return []
  const out: EncounterEntry[] = []
  for (const e of raw as Record<string, unknown>[]) {
    const observed = (e.observed ?? {}) as Record<string, unknown>
    const date = typeof observed.premiered_on === 'string' ? observed.premiered_on : ''
    if (!/^\d{4}-\d{2}-\d{2}$/.test(date) || date < since) continue
    if (typeof e.encounter_id !== 'string') continue
    out.push({
      id: e.encounter_id,
      date,
      title: typeof e.title === 'string' ? e.title : e.encounter_id,
      href: '/encounters/register/',
      source: REGISTER_FILE,
    })
  }
  return out.sort((a, b) => a.date.localeCompare(b.date) || a.id.localeCompare(b.id))
}
