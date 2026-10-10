// src/lib/n1/works.ts — the works n-1 has laid down and the nights it has kept, read from the
// practice's own mirror.
//
// n-1 keeps no meta.json. Its first works are directories under public/n-1/works/, each holding
// the work itself (index.html) beside the document that fixed it; since its projects began it
// also declares a work where the page was built, under projects/, in a night's record or a work
// document beside the page. The only dating any of it carries is the practice's own record: the
// night that built the page, or the sentence at the top of its form ("Laid down YYYY-MM-DD,
// night NN"). So that record is the date — the practice's own, not a file mtime and not the day
// the mirror happened to copy it. The
// derivation is src/lib/n1/shelf.ts, the one reading the signal log, the board and /experiments
// all share since 2026-10-10. Before that this module read the form
// alone, and a work declared in a WORK.md instead of a FORM.md (The Days, End to End,
// 2026-09-27) stood on the practice's shelf and was missing from the house's log.
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
// directory is a growing shelf — a new work no night has named yet and whose form carries no
// date is a normal night in this practice, not a broken mirror. Such a work is skipped here,
// and the count says so by being one lower.

import { existsSync } from 'node:fs'
import { dirname, join } from 'node:path'
import { builtPages, readN1Shelf, readNightRecords, n1PageHref, type N1Page } from './shelf'

export const N1_WORKS_DIR = 'public/n-1/works'

export interface N1Work {
  /** the work's own place in the mirror: the directory name for one filed under works/
   *  (`the-days-end-to-end`), the page's path for one declared inside a project
   *  (`projects/elbe-low-water/the-cut`) */
  id: string
  title: string
  /** the day the practice's own record says the work was built or laid down */
  date: string
  href: string
}

const workId = (path: string): string =>
  path.replace(/^works\//, '').replace(/\/index\.html$/, '').replace(/\.html$/, '')

/**
 * Every work on n-1's shelf, newest first — the pages filed under works/ and the pages of a
 * project the practice has declared a work. A work the practice's record does not date is not
 * yet one this house can file under a day, and drops out here rather than appearing undated
 * (readN1Shelf still lists it, last and undated).
 */
export function readN1Works(root: string = N1_WORKS_DIR): N1Work[] {
  return readN1Shelf(dirname(root))
    .filter((p): p is N1Page & { date: string } => p.kind === 'work' && p.date !== null)
    .map((p) => ({ id: workId(p.path), title: p.title, date: p.date, href: p.href }))
}

/**
 * The newest page of the practice a visitor can open — a work or a study, whichever the record
 * dates last. What the board and /experiments name beside the practice: its nights are what it
 * lands, but a night is a record to read, and this is the thing to open.
 */
export function newestN1Page(root: string = dirname(N1_WORKS_DIR)): (N1Page & { date: string }) | null {
  return readN1Shelf(root).find((p): p is N1Page & { date: string } => p.date !== null) ?? null
}

export const N1_NIGHTS_DIR = 'public/n-1/nights'

export interface N1Night {
  /** the file's own number prefix — the practice numbers its records, not its nights */
  record: number
  date: string
  /** the H1's own words after the date, which is how the practice titles a night */
  title: string
  /** the address of the page this night's record says it built ("Built: …"), when that page
   *  stands in the mirror — absent or null where the night built none, or names none */
  built?: string | null
}

/** The record has no page per night; a night that built nothing a visitor can open leads here. */
export const N1_RECORD_HREF = '/n-1/record.html'

/**
 * The newest night on n-1's record — what the signal log means by "last landed" for this
 * practice, the way it means the newest session protocol for Arch.
 *
 * Fail-soft for the same reason readN1Works is: a founder note or an offer sits in this
 * directory beside the nights and carries no "Night N — date" heading. That is the shelf's
 * normal shape, not a broken mirror, so an unparsable file is skipped rather than thrown on.
 */
export function lastN1Night(root: string = N1_NIGHTS_DIR): N1Night | null {
  return readN1Nights(root).at(-1) ?? null
}

/**
 * Every night on n-1's record, oldest first by the practice's own record number. The signal log
 * lists them all since 2026-10-05 — the nights are what this practice lands daily, and a log of
 * live updates that showed only its two works would say n-1 had been quiet since August. Same
 * fail-soft reading as lastN1Night, which is this list's last entry.
 *
 * Since 2026-10-10 each night also carries the page it built: the first path on its record's
 * "Built:" line that is a page standing in the mirror. A path the record names but the mirror
 * does not hold is not followed — a row must never lead to a 404.
 */
export function readN1Nights(root: string = N1_NIGHTS_DIR): N1Night[] {
  const mirror = dirname(root)
  return readNightRecords(root).map((n) => {
    const built = builtPages(n.text).find((path) => existsSync(join(mirror, path)))
    return {
      record: n.record,
      date: n.date,
      title: `${n.label} — ${n.title}`,
      built: built ? n1PageHref(built) : null,
    }
  })
}
