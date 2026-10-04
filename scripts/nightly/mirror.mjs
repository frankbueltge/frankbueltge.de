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
//   works/<slug>/index.html → public/error-as-method/works-html/<slug>/  (the work's own face,
//                             with everything beside it, subdirectories included since
//                             2026-10-05 — only when work.md is there too; a stage-only work
//                             lands at public/error-as-method/<slug>/ the same way)
//   journal/<date>.md       → src/data/nightly/journal/<date>.md
//   PROTOCOL.md             → src/data/nightly/PROTOCOL.md
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
// instead of lingering as an orphan. The faces live inside public/error-as-method, so the same
// reset clears them: a page withdrawn upstream, or a file dropped from beside it, is gone here
// on the next run.
//
// ONLY WHAT THE FORK MADE. The repository inherited the line's whole record — thirty works and
// forty-six research days from before 2026-07-18 — and every one of those is already on this
// site, mirrored from the Atelier since the night it was made. Taking them again would put the
// same work at two addresses and let the house count it twice. So the cut is the fork date:
// everything up to and including LINE_END belongs to the Atelier's mirror, everything after it
// to this one. The nightly-line page draws its list across both and says which is which.
import { cpSync, existsSync, mkdirSync, readdirSync, readFileSync, rmSync, statSync } from 'node:fs'
import { join, resolve } from 'node:path'

// Two forms, because the practice makes both. A TEXT work is `work.md` beside its metadata,
// rendered by this site at /error-as-method/<slug>/ with `figure.svg` resolving relatively. An
// INTERACTIVE work is a self-contained `index.html`, which this site does not render at all —
// it serves the practice's own page from public/error-as-method/<slug>/, exactly as built. Both
// answer to the same address; only one of them is a route.
//
// And both at once, since 2026-09-03: a text work may carry its own `index.html` beside its
// `work.md` — the work's own FACE, which the text accompanies. The house promised the line that
// day that such a page would be served at /error-as-method/works-html/<slug>/ and linked from the
// work's page as the work itself; until 2026-10-04 this script read a work with both files as a
// text work and dropped the page, so sixteen faces never went online. The text keeps its route;
// the face gets a directory of its own, because the route and a static index.html cannot share
// one address.
const META = 'meta.json'
const TEXT = 'work.md'
const STAGE = 'index.html'
const FIGURE = 'figure.svg'
/** Where a text work's own face is served, under public/error-as-method/. */
export const FACES = 'works-html'
/** Big enough that carrying it would make this site claim to be the archive. The repository
 *  holds the evidence and the work page links to it. Compressed files joined on 2026-10-04 with
 *  the first faces: the line ships its harvested corpora as `*.json.gz` (up to 6 MB a night),
 *  no face reads one, and copying them would have put 13 MB of evidence on the site. */
const HEAVY = /\.(py|ipynb|gz)$|citations\.json$/
/** The directory beside a work where the line keeps the source bytes it harvested — manifests,
 *  snapshots of other people's pages. Evidence, like HEAVY: the work's page cites it and links
 *  the repository; several works say outright that the bytes are "not redistributed here". */
const EVIDENCE = 'sources'
/** Cloudflare Pages refuses a single asset over 25 MiB — at DEPLOY time, after this mirror is
 *  committed, and then the whole house stops deploying. Same limit as src/lib/atelier/integrate.ts. */
export const MAX_ASSET_BYTES = 25 * 1024 * 1024

/** A stage, as the practice built it: the page and everything beside it, AT EVERY DEPTH.
 *
 *  Until 2026-10-05 directories stayed behind, so a multi-file work arrived broken — the face of
 *  2026-10-04-before-the-verdict loads its images from thumbs/ and showed none of them, and
 *  2026-10-04-the-mould lost seen/ and iterations/. Since Frank's decision of that day (wording
 *  private: the practices may publish rich works, size and form not limited) a work arrives
 *  whole: subdirectories, scripts, models, textures, sound, video, fonts, WebAssembly, data.
 *
 *  What stays behind, and why: the metadata at the top (mirrored to the data tree); the evidence
 *  the repository keeps — HEAVY files at any depth and the top-level sources/ directory, both
 *  linked from the work, not copied; dotfiles at any depth (a work's own .gitignore inside this
 *  repository would start deciding what the integrate commits); symbolic links, which can point
 *  outside the work; and a file over Cloudflare's 25 MiB asset limit, reported by name. */
function copyStage(from, to, report, rel = '') {
  mkdirSync(to, { recursive: true })
  for (const entry of readdirSync(from, { withFileTypes: true })) {
    const name = entry.name
    if (name.startsWith('.') || HEAVY.test(name)) continue
    if (!rel && (name === META || name === EVIDENCE)) continue
    const path = rel ? `${rel}/${name}` : name
    if (entry.isDirectory()) copyStage(join(from, name), join(to, name), report, path)
    else if (entry.isFile()) {
      const bytes = statSync(join(from, name)).size
      if (bytes > MAX_ASSET_BYTES) report.push({ file: path, bytes })
      else cpSync(join(from, name), join(to, name))
    }
  }
}
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
  const facesDest = join(figuresDest, FACES)
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
  /** the text works that carry their own face, by slug — reported, so a run says what it served */
  const faces = []
  /** files left behind for exceeding Cloudflare's asset limit, by work — a report, never silence */
  const oversized = []
  const stage = (dir, to, slug) => {
    const over = []
    copyStage(dir, to, over)
    for (const o of over) oversized.push({ slug, ...o })
  }
  for (const slug of existsSync(worksSrc) ? readdirSync(worksSrc).sort() : []) {
    const dir = join(worksSrc, slug)
    if (!statSync(dir).isDirectory()) continue
    if (dateOf(dir, slug) <= LINE_END) {
      inherited.push(slug)
      continue
    }
    // A work the site can show carries its metadata and one of the two forms. Anything else is
    // skipped by name, never guessed at — a malformed new work is a report, not a silent gap.
    const hasText = existsSync(join(dir, TEXT))
    const hasStage = existsSync(join(dir, STAGE))
    const missing = [
      ...(existsSync(join(dir, META)) ? [] : [META]),
      ...(hasText || hasStage ? [] : [`${TEXT} or ${STAGE}`]),
    ]
    if (missing.length) {
      skipped.push({ slug, missing })
      continue
    }

    // The metadata always travels: it is what the register, the entrance and the line's page
    // read, whichever form the work itself takes.
    mkdirSync(join(worksDest, slug), { recursive: true })
    cpSync(join(dir, META), join(worksDest, slug, META))

    if (hasText) {
      cpSync(join(dir, TEXT), join(worksDest, slug, TEXT))
      if (existsSync(join(dir, FIGURE))) {
        mkdirSync(join(figuresDest, slug), { recursive: true })
        cpSync(join(dir, FIGURE), join(figuresDest, slug, FIGURE))
      }
      // The work's own face, when it has one: copied by the same rule as an interactive work,
      // into its own directory. The text above is untouched by it and still renders as before.
      if (hasStage) {
        stage(dir, join(facesDest, slug), slug)
        faces.push(slug)
      }
    } else {
      // An interactive work is served as the practice built it. Everything beside it travels
      // too, subdirectories included — a page loads its own scripts, data and media — except
      // the measuring code and the harvested evidence, which stay in the repository and are linked.
      stage(dir, join(figuresDest, slug), slug)
    }
    works.push({ slug, form: hasText ? 'text' : 'stage', ...(hasText && hasStage ? { face: true } : {}) })
  }

  const journal = []
  for (const file of existsSync(journalSrc) ? readdirSync(journalSrc).sort() : []) {
    if (!file.endsWith('.md')) continue
    if ((file.match(/^\d{4}-\d{2}-\d{2}/)?.[0] ?? '') <= LINE_END) continue
    cpSync(join(journalSrc, file), join(journalDest, file))
    journal.push(file)
  }

  // The line's constitution. Added 2026-08-13, and it is the reason the station sheet can say
  // "two lines, two constitutions" without anybody typing a version number into a config: the
  // Atelier's own PROTOCOL.md is mirrored for the work-line, this one for the nightly line, and
  // both are read the same way (src/lib/ecology/pyramid/station.ts). A number that is typed is a
  // number that goes stale — this house spent 2026-08-12 proving that four times over.
  //
  // Copied whole and unedited, like everything else here. It is a fifth path and therefore a
  // change to the contract: SITE-API.md in the practice's repository names it.
  const protocolSrc = join(src, 'PROTOCOL.md')
  let protocol = null
  if (existsSync(protocolSrc)) {
    cpSync(protocolSrc, join(dest, 'src/data/nightly/PROTOCOL.md'))
    protocol = 'PROTOCOL.md'
  }

  return { works, faces, inherited, journal, skipped, oversized, protocol }
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
  for (const { slug, file, bytes } of report.oversized) {
    console.warn(`left behind ${slug}/${file}: ${(bytes / 1024 / 1024).toFixed(1)} MiB, over Cloudflare Pages' 25 MiB asset limit`)
  }
  // To stderr, like the warnings: stdout is the JSON report the workflow parses.
  console.warn(`faces served at /error-as-method/${FACES}/: ${report.faces.length}`)
  for (const slug of report.faces) console.warn(`  face ${slug}`)
}
