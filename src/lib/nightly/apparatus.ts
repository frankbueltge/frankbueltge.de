// src/lib/nightly/apparatus.ts — the nightly line's own instruments, read off its own texts.
//
// The line left more than works. It left a typed error register of 38 entries across 21
// numbered registers, a genealogy that started as four stations and grew three tracks over
// thirty sessions, and two position papers between which the practice took a word out of its
// own centre. All of it sits on this site already, mirrored verbatim from the practice into
// src/content/atelier/works/ — and until now it rendered as an accordion of raw markdown at
// the foot of a gallery, which is where a research line goes to be unreadable.
//
// This module derives the structure that is already in those texts. It writes nothing of its
// own: every count, type, session number and date below is read out of the practice's prose at
// build time. Where the prose does not say, this module returns undefined rather than guessing
// — a register entry with no session in its heading inherits its register's session, because
// that is a fact about the document, not an inference about the error.
//
// The one thing it deliberately does NOT infer is status. Each register ends by declaring which
// errors are still active; that declaration is the practice's own, and it is quoted and dated
// rather than recomputed from the entries. An instrument built to make fallibility checkable
// should not have its findings silently recalculated by the surface that displays it.

const WORKS = '/src/content/atelier/works'

const TEXTS = import.meta.glob('/src/content/atelier/works/*.md', {
  eager: true,
  query: '?raw',
  import: 'default',
}) as Record<string, string>

const text = (name: string): string => TEXTS[`${WORKS}/${name}`] ?? ''

/* ------------------------------------------------------------------ the error register ---- */

/** One numbered register — the practice published these as it went, one per working session. */
export interface RegisterFile {
  /** the register's own number, 1–21 */
  number: number
  /** the session it was written in, from its own header */
  session?: number
  /** the date it carries */
  date?: string
}

/** One heading in a register. An id appears more than once when the practice returned to it:
 *  F-009 was opened at session 4 and partly reclassified at session 8, F-030 opened at 15 and
 *  advanced later. Those revisits are the corrective thread the method claims, so they are kept
 *  as their own rows rather than collapsed into the opening. */
export interface RegisterEntry {
  /** 'F-001' */
  id: string
  /** 1 — for sorting without string maths */
  number: number
  /** the letters the heading names, e.g. ['A', 'C'] for "Type A + Type C" */
  types: string[]
  /** the session the heading names, or the register's own session when it names none */
  session?: number
  /** the register this heading stands in */
  register: number
  /** the date of that register */
  date?: string
  /** what the heading says beyond id, type and session — often nothing, and that is fine */
  headline: string
  /** true when this id was already opened in an earlier register */
  revisit: boolean
}

/** The typology as the register itself uses it. The practice started with four types and had
 *  eight by the end; each letter is glossed from register 021's own header line, which is the
 *  last statement of the full set. */
export const ERROR_TYPES: Readonly<Record<string, string>> = {
  A: 'wrong inference',
  B: 'inaccessible primary',
  C: 'unreliable instrument or source',
  D: 'transcription or quotation risk',
  E: 'toy-model limitation',
  F: 'access failure',
  G: 'pragmatic / address',
  H: 'oscillation / overcorrection',
}

const REGISTER_RE = /^fehlerkataster-(\d{3})\.md$/
const HEADING_RE = /^#{2,3}\s+F-(\d{3})(.*)$/gm

/** Every register file, in order. */
export function registerFiles(): RegisterFile[] {
  return Object.keys(TEXTS)
    .map((path) => path.slice(WORKS.length + 1))
    .filter((name) => REGISTER_RE.test(name))
    .sort()
    .map((name) => {
      const number = Number(name.match(REGISTER_RE)![1])
      const head = text(name).split(/\n---/)[0] ?? ''
      return {
        number,
        session: Number(head.match(/Sessions?\s+(\d+)/)?.[1]) || undefined,
        date: head.match(/\d{4}-\d{2}-\d{2}/)?.[0],
      }
    })
}

/** Strip the machinery out of a heading and keep the practice's own words for the error.
 *  Headings are written four different ways across twenty-one registers; none of the shapes
 *  carries meaning the others do not, so they are normalised rather than preserved.
 *
 *  Two traps, both hit by an earlier version of this function:
 *   · A parenthetical directly after the type qualifies the TYPE, not the error — "Type B
 *     (structural, recurring)" left "structural, recurring" standing as if it were the entry's
 *     description. It is consumed with the type it belongs to.
 *   · Parentheses may not be trimmed off the ends. "Type B (inaccessible primary, verified via
 *     citing source): Marenko (2015)" came out as "inaccessible primary, verified via citing
 *     source): Marenko (2015" — the year's brackets eaten from both sides of the wrong span. */
function headlineOf(rest: string): string {
  const SEP = /^[\s·—:,-]+/
  /** the bookkeeping tokens a heading opens with, each optionally qualified in brackets */
  const MACHINERY = [
    /^\(Types?\s+[A-H]\)/i,
    /^Types?\s+[A-H](?:\s*[/+]\s*(?:Type\s+)?[A-H])*(?:\s*\([^)]*\))?/i,
    /^Sessions?\s+\d+(?:\s*[–-]\s*\d+)?(?:\s*\([^)]*\))?/i,
    /^\(?(?:new|update)\)?/i,
  ]

  // Consume machinery from the FRONT only, and stop at the first token that is not machinery.
  // Stripping it everywhere ate the "Type G" inside F-020's own description — the heading was
  // talking about a type, not being labelled with one.
  let out = rest
  for (let moved = true; moved; ) {
    moved = false
    out = out.replace(SEP, '')
    for (const token of MACHINERY) {
      const trimmed = out.replace(token, '')
      if (trimmed !== out) {
        out = trimmed
        moved = true
        break
      }
    }
  }

  return out
    // a trailing session marker is bookkeeping too — "→ partially reclassified · Session 8"
    .replace(/[\s·—:,-]*\bSessions?\s+\d+(?:\s*[–-]\s*\d+)?\s*$/i, '')
    // separators only — never brackets, which belong to the text
    .replace(/^[\s·—:,-]+|[\s·—:,-]+$/g, '')
    .replace(/\s{2,}/g, ' ')
    .trim()
}

/** All register headings, oldest register first, in the order the registers print them. */
export function registerEntries(): RegisterEntry[] {
  const files = registerFiles()
  const seen = new Set<string>()
  const entries: RegisterEntry[] = []

  for (const file of files) {
    const body = text(`fehlerkataster-${String(file.number).padStart(3, '0')}.md`)
    for (const match of body.matchAll(HEADING_RE)) {
      const id = `F-${match[1]}`
      const rest = match[2] ?? ''
      // "Type A + Type C" and "Type E/A" both name two letters; "Type B (structural)" names one.
      const types = [...rest.matchAll(/\bType\s+([A-H])(?:\s*[/+]\s*(?:Type\s+)?([A-H]))?/g)]
        .flatMap((m) => [m[1], m[2]])
        .filter((t): t is string => Boolean(t))
      const revisit = seen.has(id)
      seen.add(id)
      entries.push({
        id,
        number: Number(match[1]),
        types: [...new Set(types)],
        session: Number(rest.match(/Sessions?\s+(\d+)/)?.[1]) || file.session,
        register: file.number,
        date: file.date,
        headline: headlineOf(rest),
        revisit,
      })
    }
  }
  return entries
}

/** The errors the practice last declared still active, and the register that declared it.
 *  Read, not recomputed — see the note at the top of this file. */
export function activeErrors(): { ids: string[]; register?: number; date?: string; session?: number } {
  const files = registerFiles()
  for (const file of [...files].reverse()) {
    const body = text(`fehlerkataster-${String(file.number).padStart(3, '0')}.md`)
    const block = body.match(/\*\*Active errors:\*\*([\s\S]+?)(?:\n\n|$)/)
    if (!block) continue
    const ids = [...new Set(block[1].match(/F-\d{3}/g) ?? [])].sort()
    if (ids.length) return { ids, register: file.number, date: file.date, session: file.session }
  }
  return { ids: [] }
}

export interface ErrorRegister {
  /** one row per distinct id, at the register that opened it */
  opened: RegisterEntry[]
  /** later returns to an id already opened — the corrective thread, kept visible */
  revisits: RegisterEntry[]
  registers: RegisterFile[]
  /** how many distinct ids carry each type letter */
  byType: { type: string; gloss: string; count: number }[]
  active: ReturnType<typeof activeErrors>
  /** the last register's date — the instrument's own last entry */
  lastEntry?: string
}

/** The register as one instrument. */
export function errorRegister(): ErrorRegister {
  const entries = registerEntries()
  const opened = entries.filter((e) => !e.revisit).sort((a, b) => a.number - b.number)
  const revisits = entries.filter((e) => e.revisit)
  const registers = registerFiles()

  const counts = new Map<string, number>()
  for (const entry of opened) {
    // An id is counted once per letter it carries, and a revisit never re-counts it: the
    // question the tally answers is "what kinds of error does this line make", not "how often
    // did it write one down".
    for (const type of entry.types) counts.set(type, (counts.get(type) ?? 0) + 1)
  }

  return {
    opened,
    revisits,
    registers,
    byType: Object.keys(ERROR_TYPES)
      .map((type) => ({ type, gloss: ERROR_TYPES[type]!, count: counts.get(type) ?? 0 }))
      .filter((row) => row.count > 0),
    active: activeErrors(),
    lastEntry: registers[registers.length - 1]?.date,
  }
}

/* --------------------------------------------------------------------- the genealogy ------ */

/** One of the four stations the genealogy was built on. */
export interface Station {
  n: number
  author: string
  year: string
  claim: string
}

/** One dated growth of the genealogy — the research direction developing, session by session. */
export interface Addendum {
  /** '7' or '9–10' — the practice's own span */
  sessions: string
  /** the first session number, for sorting */
  from: number
  date: string
  title: string
}

const GENEALOGY = 'genealogie.md'

/** The four stations, from the genealogy's own headings. */
export function stations(): Station[] {
  const body = text(GENEALOGY)
  return [...body.matchAll(/^###\s+Station\s+(\d+)\s+—\s+([^(]+)\((\d{4})\):\s*(.+)$/gm)].map((m) => ({
    n: Number(m[1]),
    author: m[2]!.trim(),
    year: m[3]!,
    claim: m[4]!.trim(),
  }))
}

/** Every dated addendum, oldest first. The document writes them two ways — "## Addendum —
 *  Session 7 (2026-06-30)" early on, "### Session 29 addendum — …" later — and both are the
 *  same act: the genealogy being extended by the night that read something new.
 *
 *  Six of the early addenda put no title on the addendum line itself and open straight into a
 *  named subsection ("### Jones and the parallel track"). Their title is taken from that first
 *  subsection, scanned deliberately — an earlier version of this parser let a greedy `\s*`
 *  cross the newline and pick it up by accident, which worked and was still wrong: it would
 *  have taken any following line, heading or not. */
export function addenda(): Addendum[] {
  const lines = text(GENEALOGY).split('\n')
  const found: Addendum[] = []

  /** the first `###` subsection under line `i`, before the next `##` closes the addendum */
  const firstSubsection = (i: number): string => {
    for (let j = i + 1; j < lines.length; j++) {
      const line = lines[j]!
      if (/^##\s/.test(line)) return ''
      const heading = line.match(/^###\s+(.+)$/)
      if (heading) return heading[1]!.trim()
    }
    return ''
  }

  lines.forEach((line, i) => {
    const dated = line.match(/^##\s+Addendum\s+—\s+Sessions?\s+([\d–-]+)[ \t]*\(([^)]+)\)[ \t]*:?[ \t]*(.*)$/)
    if (dated) {
      found.push({
        sessions: dated[1]!.replace(/-/g, '–'),
        from: Number(dated[1]!.match(/\d+/)?.[0]),
        date: dated[2]!.match(/\d{4}-\d{2}-\d{2}/)?.[0] ?? dated[2]!.trim(),
        title: dated[3]!.trim() || firstSubsection(i),
      })
      return
    }
    const late = line.match(/^###\s+Session\s+(\d+)\s+addendum\s*—?[ \t]*(.*)$/)
    if (late) {
      found.push({ sessions: late[1]!, from: Number(late[1]), date: '', title: late[2]!.trim() })
    }
  })

  return found.sort((a, b) => a.from - b.from)
}

/** The tracks the genealogy grew. Named where the document names them, counted from the
 *  station headings it carries for each. */
export function tracks(): { id: string; label: string; mentions: number }[] {
  const body = text(GENEALOGY)
  return (['A', 'B', 'C'] as const)
    .map((id) => ({
      id,
      label: `Track ${id}`,
      mentions: (body.match(new RegExp(`Track ${id}\\b`, 'g')) ?? []).length,
    }))
    .filter((t) => t.mentions > 0)
}

/* ------------------------------------------------------------------- the position shift --- */

/** The two position papers, and the one word the practice took out between them. */
export interface PositionShift {
  before: { date: string; title: string; claim: string }
  after: { date: string; title: string; claim: string }
}

/** Both position papers carry their claim in their own first section; the titles come from
 *  their H1. Nothing here is summarised — the pages quote the papers themselves. */
export function positionShift(): PositionShift {
  const first = text('position-2026-07-01.md')
  const second = text('position-2026-07-14.md')
  const h1 = (body: string): string => body.match(/^#\s+(.+)$/m)?.[1]?.trim() ?? ''
  return {
    before: {
      date: '2026-07-01',
      title: h1(first),
      claim: 'error is what method is made of',
    },
    after: {
      date: '2026-07-14',
      title: h1(second),
      claim: 'error is a special case of the epistemic thing',
    },
  }
}

/* ------------------------------------------------------------------------ the reading ----- */

/** A source the line cited, with the texts that cite it. Retrievable URLs only: the line's own
 *  first value is that a claim carries a link a reader can follow, so a "source" without one is
 *  not evidence of reading and is left out rather than padded in. */
export interface Citation {
  url: string
  host: string
  /** the file names that cite it, e.g. 'genealogie.md' */
  cited: string[]
}

const URL_RE = /https?:\/\/[^\s<>()[\]"'`]+[^\s<>()[\]"'`.,;:]/g

/** Every retrievable source the line's texts point at, most-cited first. Drawn across the
 *  genealogy, the registers and both position papers — the three places the practice does its
 *  reading — so the list is the line's bibliography as it actually used it, not a reading list
 *  anyone composed for it. */
export function citations(): Citation[] {
  const byUrl = new Map<string, Set<string>>()
  for (const [path, body] of Object.entries(TEXTS)) {
    const name = path.slice(WORKS.length + 1)
    for (const raw of body.match(URL_RE) ?? []) {
      const url = raw.replace(/[.,;:]+$/, '')
      if (!byUrl.has(url)) byUrl.set(url, new Set())
      byUrl.get(url)!.add(name)
    }
  }
  return [...byUrl.entries()]
    .map(([url, cited]) => ({
      url,
      host: (() => {
        try {
          return new URL(url).hostname.replace(/^www\./, '')
        } catch {
          return url
        }
      })(),
      cited: [...cited].sort(),
    }))
    .sort((a, b) => b.cited.length - a.cited.length || a.host.localeCompare(b.host))
}

/** The other half of the reading, and the half a bibliography normally hides: the primaries the
 *  line could not reach. Type B is the register's own letter for "source exists but was not
 *  retrievable; claim therefore unevidenced", and the line kept ten of them — paywalls, 403s,
 *  a book behind a library login. Counting them beside the sources it did reach is the point:
 *  a reading list that shows only what was read reports the infrastructure as frictionless.
 *
 *  Register 001 says it plainly — "a register that did not document this would conceal the
 *  scale of my fallibility" — so the surface does not conceal it either. */
export function barriers(): RegisterEntry[] {
  return errorRegister().opened.filter((entry) => entry.types.includes('B'))
}

/** What the line reached and what it did not, as one figure. */
export interface Reading {
  reached: Citation[]
  barriers: RegisterEntry[]
  /** how many distinct texts of the line carry a retrievable source */
  citingTexts: number
}

export function reading(): Reading {
  const reached = citations()
  return {
    reached,
    barriers: barriers(),
    citingTexts: new Set(reached.flatMap((c) => c.cited)).size,
  }
}
