// src/lib/arch/facts.ts — what the site states about Arch, read from the practice's own
// mirrored record and never typed.
//
// Arch is a practice beside the research ecology (founded 2026-08-22; decision log 2026-08-23).
// Its repository is mirrored whole to public/arch/ by arch-integrate.yml. The room at /arch adds
// exactly three things the practice may not award itself — the trial's frame, the reception
// question, and the standing of its failure registers — and every number in them comes from
// here: the pre-registration the practice committed before any work existed, the protocols it
// writes at the end of every session, the registers its adopted model makes it keep.
//
// Fail-loud, like readN1Facts: a mirror this module cannot read is an integration fault, not a
// reason for a quiet default. A practice that DECLINED its model leaves the pre-registration
// empty on purpose (public/arch/PREREGISTRATION.md says so) — that is the one legal absence, and
// it is returned as `window: null`, never as a zero.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

export const ARCH_MIRROR = 'public/arch'

export interface ArchWindow {
  /** the practice's decision, as the pre-registration records it */
  decision: string
  decisionDate: string
  opens: string
  closes: string
  days: number
  minSessions: number
  /** the date by which the balance is published, whichever way it falls */
  balanceBy: string
}

export interface ArchProtocol {
  /** the date in the file name — the practice's own dating, corrected in its own channel where it erred */
  date: string
  session: number
  title: string
  /** path inside the mirror, e.g. record/2026-08-23-session-11.md */
  path: string
}

export interface ArchRegister {
  /** file stem, e.g. i7-virtuality-register */
  id: string
  title: string
  entries: number
  path: string
}

export interface ArchWorkInstance {
  /** path inside the mirror, e.g. works/arrival/iteration-2/us6000tmta.html */
  path: string
  /** the instance's path inside its work, without the extension — the practice lays its
   *  iterations out as directories (works/<work>/iteration-N/), and this keeps that visible */
  id: string
}

export interface ArchWork {
  /** directory name under works/ */
  id: string
  title: string
  instances: ArchWorkInstance[]
}

export interface ArchFacts {
  founded: string
  /** the practice's own name for its law, from the Dowry's H1 */
  law: string
  window: ArchWindow | null
  /** every session protocol on the record, oldest first by session number */
  protocols: ArchProtocol[]
  registers: ArchRegister[]
  works: ArchWork[]
  /** the reading the practice wrote of its primary text, in file order */
  reading: { path: string; title: string }[]
}

const read = (root: string, rel: string): string => readFileSync(join(root, rel), 'utf8')

const h1 = (markdown: string): string | undefined => /^#\s+(.+?)\s*$/m.exec(markdown)?.[1]

function listMarkdown(root: string, dir: string): string[] {
  const abs = join(root, dir)
  if (!existsSync(abs)) return []
  return readdirSync(abs)
    .filter((f) => f.endsWith('.md') && f !== 'README.md')
    .sort()
}

/** The pre-registration is filled by the practice in its own session, before any work; the empty
 *  template carries dotted blanks. A filled form states the window in one line. */
export function readArchWindow(preregistration: string): ArchWindow | null {
  const decision = /Decision:\s+(ADOPT(?: IN PART)?|DECLINE)\s+date\s+(\d{4}-\d{2}-\d{2})/.exec(preregistration)
  if (!decision) {
    // the template's own blank: "Decision:               adopt / adopt in part / decline      date ........."
    if (/Decision:\s+adopt \/ adopt in part \/ decline/.test(preregistration)) return null
    throw new Error('arch/facts: PREREGISTRATION.md states no decision — mirror broken or format changed')
  }
  if (decision[1] === 'DECLINE') return null

  const opens = /Window opens \/ closes:\s+(\d{4}-\d{2}-\d{2})[^/\n]*\/\s*(\d{4}-\d{2}-\d{2})/.exec(preregistration)
  if (!opens) throw new Error('arch/facts: PREREGISTRATION.md states no "Window opens / closes" — mirror broken or format changed')
  const bounds = /(\d+) days AND >= (\d+) sessions/.exec(preregistration)
  if (!bounds) throw new Error('arch/facts: PREREGISTRATION.md states no "N days AND >= M sessions" — format changed')
  const balance = /Balance published:[^\n]*?(\d{4}-\d{2}-\d{2})/.exec(preregistration)
  if (!balance) throw new Error('arch/facts: PREREGISTRATION.md names no balance date — format changed')

  return {
    decision: decision[1].toLowerCase(),
    decisionDate: decision[2],
    opens: opens[1],
    closes: opens[2],
    days: Number(bounds[1]),
    minSessions: Number(bounds[2]),
    balanceBy: balance[1],
  }
}

export function readArchFacts(root: string = ARCH_MIRROR): ArchFacts {
  const dowry = read(root, 'DOWRY.md')
  const law = h1(dowry)
  if (!law) throw new Error(`arch/facts: ${root}/DOWRY.md carries no H1 — mirror broken`)
  const founded = /Founded\s+(\d{4}-\d{2}-\d{2})/.exec(dowry)?.[1]
  if (!founded) throw new Error(`arch/facts: ${root}/DOWRY.md states no "Founded YYYY-MM-DD" — mirror broken or format changed`)

  const window = readArchWindow(read(root, 'PREREGISTRATION.md'))

  const protocols: ArchProtocol[] = listMarkdown(root, 'record')
    .map((f) => ({ f, m: /^(\d{4}-\d{2}-\d{2})-session-(\d+)\.md$/.exec(f) }))
    .filter((x): x is { f: string; m: RegExpExecArray } => x.m !== null)
    .map(({ f, m }) => {
      const path = `record/${f}`
      const title = h1(read(root, path))
      if (!title) throw new Error(`arch/facts: ${path} carries no H1 — protocol unreadable`)
      return { date: m[1], session: Number(m[2]), title, path }
    })
    .sort((a, b) => a.session - b.session)

  const registers: ArchRegister[] = listMarkdown(root, 'registers').map((f) => {
    const path = `registers/${f}`
    const text = read(root, path)
    const title = h1(text)
    if (!title) throw new Error(`arch/facts: ${path} carries no H1 — register unreadable`)
    // an entry is a dated "## entry — …" heading; the header prose above the rule is not one
    const entries = (text.match(/^## entry\b/gm) ?? []).length
    return { id: f.replace(/\.md$/, ''), title, entries, path }
  })

  const worksDir = join(root, 'works')
  const works: ArchWork[] = existsSync(worksDir)
    ? readdirSync(worksDir, { withFileTypes: true })
        .filter((d) => d.isDirectory())
        .map((d) => {
          const readme = join(worksDir, d.name, 'README.md')
          const title = (existsSync(readme) && h1(readFileSync(readme, 'utf8'))) || d.name
          // built instances at any depth — the practice keeps each iteration in its own
          // directory and freezes the earlier ones whole; template.html is the generator's
          // mould, not an instance (the practice's own README says so)
          const htmlUnder = (dir: string): string[] =>
            readdirSync(dir, { withFileTypes: true }).flatMap((e) => {
              const p = join(dir, e.name)
              if (e.isDirectory()) return htmlUnder(p)
              return e.name.endsWith('.html') && e.name !== 'template.html' ? [p] : []
            })
          const base = join(worksDir, d.name)
          const instances = htmlUnder(base)
            .map((p) => p.slice(base.length + 1).split('\\').join('/'))
            // newest iteration first: the directories are numbered, and the current one is the
            // one a visitor should meet first
            .sort((a, b) => b.localeCompare(a, 'en', { numeric: true }))
            .map((f) => ({ path: `works/${d.name}/${f}`, id: f.replace(/\.html$/, '') }))
          return { id: d.name, title, instances }
        })
        .sort((a, b) => a.id.localeCompare(b.id))
    : []

  const reading = listMarkdown(root, 'reading').map((f) => {
    const path = `reading/${f}`
    return { path, title: h1(read(root, path)) ?? f }
  })

  return { founded, law: law.replace(/^The\b/, 'the'), window, protocols, registers, works, reading }
}

/** The newest protocol as the ops-room board states a row's last landed output. */
export function lastArchProtocol(facts: ArchFacts = readArchFacts()): { title: string; meta: string; href: string } | null {
  const last = facts.protocols.at(-1)
  if (!last) return null
  return { title: last.title, meta: last.date, href: `/arch/read/${last.path.replace(/\.md$/, '')}` }
}
