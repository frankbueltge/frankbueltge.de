#!/usr/bin/env node
// scripts/nightly/mirror.mjs — mirror the nightly line's repository into this site.
//
// The site displays; the repository holds. This script copies a fixed, narrow set of files
// out of a checkout of frankbueltge/error-as-method and writes nothing of its own: no
// generated prose, no rewritten links, no derived summary. What it takes:
//
//   works/<slug>/meta.json  → src/data/nightly/works/<slug>/meta.json
//   works/<slug>/work.md    → src/data/nightly/works/<slug>/work.md
//   works/<slug>/figure.svg → public/error-as-method/<slug>/figure.svg
//   journal/<date>.md       → src/data/nightly/journal/<date>.md
//
// The figure lands beside the work's own route rather than in the content directory, because
// the practice writes `![…](figure.svg)` relative to its work — and a page served at
// /error-as-method/<slug>/ resolves that same relative path. Nothing rewrites its text.
//
// The evidence a night produces (measure.py, citations.json, …) stays in the repository and
// is linked, not copied: a site that carries 8 000 lines of harvested references would be
// claiming to be the archive, and git is the archive.
//
// Both target trees are reset before writing, so a work withdrawn upstream disappears here
// instead of lingering as an orphan.
//
// ONLY WHAT THE FORK MADE. The repository inherited the line's whole record — thirty works and
// forty-six research days from before 2026-07-18 — and every one of those is already on this
// site, mirrored from the Atelier since the night it was made. Taking them again would put the
// same work at two addresses and let the house count it twice. So the cut is the fork date:
// everything up to and including LINE_END belongs to the Atelier's mirror, everything after it
// to this one. The nightly-line page draws its list across both and says which is which.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

const TAKE_FILES = ['meta.json', 'work.md']
const FIGURE = 'figure.svg'
/** The last night under the Atelier's roof — kept in sync with src/lib/engines/nightly-line.ts. */
export const LINE_END = '2026-07-18'

/** A record's date, from its metadata where it has any and from its filename otherwise.
 *  Undated records are treated as inherited: this practice dates everything it makes. */
function dateOf(dir, slug) {
  const meta = join(dir, 'meta.json')
  if (existsSync(meta)) {
    try {
      const parsed = JSON.parse(readFileSync(meta, 'utf8'))
      if (typeof parsed.date === 'string') return parsed.date
    } catch {
      /* fall through to the filename */
    }
  }
  return slug.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? ''
}

export function mirror(src, dest) {
  const worksSrc = join(src, 'works')
  const worksDest = join(dest, 'src/data/nightly/works')
  const figuresDest = join(dest, 'public/error-as-method')
  const journalSrc = join(src, 'journal')
  const journalDest = join(dest, 'src/data/nightly/journal')

  rmSync(worksDest, { recursive: true, force: true })
  rmSync(figuresDest, { recursive: true, force: true })
  rmSync(journalDest, { recursive: true, force: true })
  mkdirSync(worksDest, { recursive: true })
  mkdirSync(journalDest, { recursive: true })

  const works = []
  const inherited = []
  const skipped = []
  for (const slug of existsSync(worksSrc) ? readdirSync(worksSrc).sort() : []) {
    const dir = join(worksSrc, slug)
    if (!statSync(dir).isDirectory()) continue
    if (dateOf(dir, slug) <= LINE_END) {
      inherited.push(slug)
      continue
    }
    // A work directory the site can show is one that carries both its metadata and its text.
    // Anything else is skipped by name, never guessed at — a malformed new work is a report,
    // not a silent gap.
    const missing = TAKE_FILES.filter((f) => !existsSync(join(dir, f)))
    if (missing.length) {
      skipped.push({ slug, missing })
      continue
    }
    mkdirSync(join(worksDest, slug), { recursive: true })
    for (const file of TAKE_FILES) cpSync(join(dir, file), join(worksDest, slug, file))
    if (existsSync(join(dir, FIGURE))) {
      mkdirSync(join(figuresDest, slug), { recursive: true })
      cpSync(join(dir, FIGURE), join(figuresDest, slug, FIGURE))
    }
    works.push(slug)
  }

  const journal = []
  for (const file of existsSync(journalSrc) ? readdirSync(journalSrc).sort() : []) {
    if (!file.endsWith('.md')) continue
    if ((file.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? '') <= LINE_END) continue
    cpSync(join(journalSrc, file), join(journalDest, file))
    journal.push(file)
  }

  return { works, inherited, journal, skipped }
}

if (import.meta.url === `file://${process.argv[1]}`) {
  const [src, dest = '.'] = process.argv.slice(2)
  if (!src) {
    console.error('usage: node scripts/nightly/mirror.mjs <checkout-of-error-as-method> [site-root]')
    process.exit(2)
  }
  const report = mirror(resolve(src), resolve(dest))
  console.log(JSON.stringify(report, null, 2))
  for (const { slug, missing } of report.skipped) {
    console.warn(`skipped ${slug}: missing ${missing.join(', ')}`)
  }
}
