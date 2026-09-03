// src/lib/n1/works.ts — the works n-1 has laid down, read from the practice's own mirror.
//
// n-1 keeps no meta.json. Its works are directories under public/n-1/works/, each holding the
// work itself (index.html) and the deliberation that fixed its form (FORM.md), and the only
// dating either carries is the sentence the practice wrote at the top of the form: "Laid down
// YYYY-MM-DD, night NN". So that sentence is the date — the practice's own, not a file mtime
// and not the day the mirror happened to copy it.
//
// Why this exists at all, given that src/lib/ecology/lines.ts states the opposite rule for the
// works REGISTER: the register is the three practices' catalogue and n-1's record deliberately
// stays out of it (its dowry says the repository IS its record). The signal log is a different
// claim — "what landed last across this house" — and leaving n-1 out of THAT would have made
// the log say the practice had produced nothing since August (Frank, 2026-09-03). One reading,
// two different questions; neither borrows the other's rule.
//
// Fail-soft, unlike readN1Facts: the facts module reads two files the surface at /n-1 cannot do
// without, so a broken mirror there is an integration fault worth stopping the build for. A works
// directory is a growing shelf — a new work whose form is still being written has no "Laid down"
// line yet, and that is a normal night in this practice, not a broken mirror. Such a work is
// skipped, and the count says so by being one lower.

import { existsSync, readFileSync, readdirSync } from 'node:fs'
import { join } from 'node:path'

export const N1_WORKS_DIR = 'public/n-1/works'

export interface N1Work {
  /** directory name under works/, which is also its address: /n-1/works/<id>/ */
  id: string
  title: string
  /** the day the practice's own form document says the work was laid down */
  date: string
  href: string
}

/** The <title> of the work's own page — the practice named it there, so nothing is invented. */
const pageTitle = (html: string): string | undefined =>
  /<title>\s*([^<]+?)\s*<\/title>/i.exec(html)?.[1]

/** "*Laid down 2026-08-16, night 03 …" — the form's own first sentence. */
const laidDown = (form: string): string | undefined =>
  /Laid down\s+(\d{4}-\d{2}-\d{2})/.exec(form)?.[1]

/**
 * Every work on n-1's shelf, newest first. A directory missing either its page or its dated
 * form is not yet a work this house can date, and drops out rather than appearing undated.
 */
export function readN1Works(root: string = N1_WORKS_DIR): N1Work[] {
  if (!existsSync(root)) return []
  const out: N1Work[] = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    const page = join(root, entry.name, 'index.html')
    const form = join(root, entry.name, 'FORM.md')
    if (!existsSync(page) || !existsSync(form)) continue
    const date = laidDown(readFileSync(form, 'utf8'))
    if (!date) continue
    out.push({
      id: entry.name,
      title: pageTitle(readFileSync(page, 'utf8')) ?? entry.name,
      date,
      href: `/n-1/works/${entry.name}/`,
    })
  }
  return out.sort((a, b) => b.date.localeCompare(a.date) || b.id.localeCompare(a.id))
}

export const N1_NIGHTS_DIR = 'public/n-1/nights'

export interface N1Night {
  /** the file's own number prefix — the practice numbers its records, not its nights */
  record: number
  date: string
  /** the H1's own words after the date, which is how the practice titles a night */
  title: string
}

/** "# Night 20 — 2026-09-03, two skies in one reading, the seam at one night, …" */
const NIGHT_H1 = /^#\s+(.+?)\s+—\s+(\d{4}-\d{2}-\d{2}),\s*(.+?)\s*$/m

/**
 * The newest night on n-1's record — what the board means by "last landed" for this practice,
 * the way it means the newest session protocol for Arch. Its works are a shelf that grows
 * slowly; its nights are what it lands.
 *
 * Fail-soft for the same reason readN1Works is: a founder note or an offer sits in this
 * directory beside the nights and carries no "Night N — date" heading. That is the shelf's
 * normal shape, not a broken mirror, so an unparsable file is skipped rather than thrown on.
 */
export function lastN1Night(root: string = N1_NIGHTS_DIR): N1Night | null {
  if (!existsSync(root)) return null
  const nights: N1Night[] = []
  for (const name of readdirSync(root)) {
    if (!name.endsWith('.md') || name === 'README.md') continue
    const record = Number(/^(\d+)-/.exec(name)?.[1])
    if (!Number.isFinite(record)) continue
    const m = NIGHT_H1.exec(readFileSync(join(root, name), 'utf8'))
    if (!m) continue
    nights.push({ record, date: m[2], title: `${m[1]} — ${m[3]}` })
  }
  if (nights.length === 0) return null
  return nights.sort((a, b) => a.record - b.record).at(-1)!
}
