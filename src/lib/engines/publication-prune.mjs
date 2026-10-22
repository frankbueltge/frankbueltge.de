// @ts-check
// src/lib/engines/publication-prune.mjs — applies the publication rule to dist/ after the build.
//
// The rule itself, and why it exists, is in ./publication.mjs (2026-10-17). This file is the part
// that touches the file system: it walks the practices' mirrored files in dist/, reads what the
// rule needs to know about them (which n-1 pages are works, which works are still in progress,
// which working files a work still names), deletes every file the rule does not publish, removes
// the directories that leaves empty, and prints one summary line.
//
// It must never take the build down: the integrate workflows of every practice run this build as
// their gate, so a fault here would stop the whole house's deploy. A missing directory is simply
// skipped; any other fault is logged as an error and the build continues with dist/ as built.
//
// The same function trims the mirrors themselves (scripts/engines/trim-mirror.mjs): pointed at
// public/ instead of dist/, with `keep` naming what the build reads, it deletes from the copy an
// integrate has just made whatever the rule does not publish and nothing reads. One decision made
// twice is one decision: the trim cannot keep less than the build would publish, because it asks
// the same question of the same files.

import { existsSync, readdirSync, readFileSync, rmSync, statSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { fileURLToPath } from 'node:url'
import { n1WorkPages } from '../n1/published.ts'
import {
  MIRRORS,
  PUBLICATION_RULE_SINCE,
  basenameOf,
  classify,
  isInProgress,
  isReferrer,
  loadedAssets,
  matchRedirect,
  openCycleFolders,
  openCycleOf,
  openCycleRewrites,
  parseRedirects,
  servedAt,
  workFolderOf,
} from './publication.mjs'

/** Where a work's meta.json stands in the content mirror when it is not beside the work. */
const META_HOMES = /** @type {Record<string, string>} */ ({
  'studio/werke-html': 'src/content/studio/works',
  'atelier/werke-html': 'src/content/atelier/works',
  'field/werke-html': 'src/content/field/works',
  'error-as-method/works-html': 'src/data/nightly/works',
})

/** The ecology's cycle state; its working cycle's artifacts are published as in progress. */
const CYCLE_STATE = 'src/data/ecology/cycle.json'

/**
 * The cycle in its working phase, read from the committed cycle state under `root`; null when the
 * file is missing or unreadable (nothing is then published as in progress).
 * @param {string} root
 */
export function readOpenCycle(root) {
  try {
    return openCycleOf(JSON.parse(readFileSync(join(root, CYCLE_STATE), 'utf8')))
  } catch {
    return null
  }
}

/**
 * The redirects text with the open cycle's rewrites inserted before the first rule that would send
 * an address inside one of its folders away (the Field's `/field/artifacts/*`). Unchanged when no
 * rule does. The build writes the result into dist/_redirects; a test that asks public/_redirects
 * what the site does asks it through here.
 * @param {string} text
 * @param {number | null} openCycle
 */
export function withOpenCycleRewrites(text, openCycle) {
  const folders = openCycleFolders(openCycle)
  if (!folders.length) return text
  const rules = parseRedirects(text)
  let first = Infinity
  for (const folder of folders) {
    const hit = matchRedirect(rules, `/${folder}/a/`)
    if (hit && hit.rule.status !== 200) first = Math.min(first, hit.rule.line)
  }
  if (first === Infinity) return text
  const lines = text.split('\n')
  lines.splice(first - 1, 0, '# the open cycle, in progress (2026-10-20; publication.mjs, openCycleRewrites) — inserted by the build', ...openCycleRewrites(openCycle))
  return lines.join('\n')
}

/**
 * @param {string} abs
 * @param {string} rel
 * @param {string[]} out
 */
function walkFiles(abs, rel, out) {
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    const childRel = `${rel}/${entry.name}`
    if (entry.isDirectory()) walkFiles(join(abs, entry.name), childRel, out)
    else if (entry.isFile()) out.push(childRel)
  }
  return out
}

/**
 * Removes every empty directory below `abs`, bottom-up; `abs` itself too when it ends up empty.
 * @param {string} abs
 * @returns {boolean} whether `abs` was removed
 */
function removeEmptyDirs(abs) {
  let empty = true
  for (const entry of readdirSync(abs, { withFileTypes: true })) {
    if (entry.isDirectory() && removeEmptyDirs(join(abs, entry.name))) continue
    empty = false
  }
  if (empty) rmSync(abs, { recursive: true, force: true })
  return empty
}

/**
 * @param {string} abs
 */
const isFile = (abs) => existsSync(abs) && statSync(abs).isFile()

/**
 * The n-1 files published beyond the rule's globs: every page the practice has declared a work
 * (src/lib/n1/published.ts), and every file those pages, the front page and the record load.
 * @param {string} dist
 * @param {(root: string) => ReadonlySet<string>} readWorks
 * @param {string[]} warnings
 */
function n1Published(dist, readWorks, warnings) {
  /** @type {Set<string>} */
  const out = new Set()
  const n1 = join(dist, 'n-1')
  if (!existsSync(n1)) return out
  /** @type {ReadonlySet<string>} */
  let works = new Set()
  try {
    works = readWorks(n1)
  } catch (error) {
    warnings.push(`publication: n-1's works could not be read (${error instanceof Error ? error.message : String(error)}) — only its filed works stay`)
  }
  for (const page of works) if (isFile(join(dist, page))) out.add(page)

  // What the kept pages load. A script resolves its fetches against the page that runs it, a
  // stylesheet against itself; a page in a frame is a page of its own.
  /** @type {{ file: string, base: string }[]} */
  const queue = ['n-1/index.html', 'n-1/record.html', ...out].map((file) => ({ file, base: file }))
  const seen = new Set()
  while (queue.length) {
    const next = queue.shift()
    if (!next) break
    const key = `${next.file}\n${next.base}`
    if (seen.has(key)) continue
    seen.add(key)
    const abs = join(dist, next.file)
    if (!isFile(abs)) continue
    const text = readFileSync(abs, 'utf8')
    const base = /\.css$/i.test(next.file) ? next.file : next.base
    for (const asset of loadedAssets(text, base)) {
      if (!asset.startsWith('n-1/') || !isFile(join(dist, asset))) continue
      out.add(asset)
      if (/\.m?js$/i.test(asset)) queue.push({ file: asset, base: next.base })
      else if (/\.(css|html)$/i.test(asset)) queue.push({ file: asset, base: asset })
    }
  }
  return out
}

/**
 * @typedef {object} PruneResult
 * @property {Record<string, { kept: number, removed: number }>} practices mirrored files per practice
 * @property {string[]} removed dist-relative paths deleted
 * @property {number} removedBytes the size of those files, read before they were deleted
 * @property {string[]} shadowed addresses of published files that a redirect rule would send away
 * @property {string[]} warnings
 */

/**
 * Applies the publication rule to a built dist/ directory. With `dryRun` it decides and reports
 * without deleting anything.
 *
 * Three options serve the mirror trim, which points `dist` at public/ itself:
 *  - `only` limits the pass to the named practices (an integrate trims its own mirror);
 *  - `keep` names files that stay although the rule does not publish them (what the build reads);
 *  - `redirects: false` skips the redirect shadow report, which is a question about dist/.
 * @param {{ dist: string, publicDir: string, root: string, readWorks?: (root: string) => ReadonlySet<string>, dryRun?: boolean, only?: readonly string[], keep?: (path: string) => boolean, redirects?: boolean }} options
 * @returns {PruneResult}
 */
export function prunePublication({ dist, publicDir, root, readWorks = n1WorkPages, dryRun = false, only, keep, redirects: checkRedirects = true }) {
  /** @type {string[]} */
  const warnings = []
  /** @type {string[]} */
  const files = []
  const practicesInScope = Object.keys(MIRRORS).filter((practice) => !only || only.includes(practice))
  for (const practice of practicesInScope) {
    const abs = join(dist, practice)
    if (existsSync(abs) && statSync(abs).isDirectory()) walkFiles(abs, practice, files)
  }
  const isMirrored = (/** @type {string} */ path) => existsSync(join(publicDir, path))

  // the work folders, with the files in each that may still name a working file
  /** @type {Map<string, string[]>} */
  const referrers = new Map()
  for (const path of files) {
    const folder = workFolderOf(path)
    if (!folder) continue
    if (!referrers.has(folder)) referrers.set(folder, [])
    if (isReferrer(path)) referrers.get(folder)?.push(path)
  }

  // a work still in progress stays exactly as mirrored
  /** @type {Set<string>} */
  const inProgress = new Set()
  for (const folder of referrers.keys()) {
    const metas = [join(dist, folder, 'meta.json')]
    for (const [workRoot, home] of Object.entries(META_HOMES)) {
      if (folder.startsWith(`${workRoot}/`)) metas.push(join(root, home, folder.slice(workRoot.length + 1), 'meta.json'))
    }
    for (const meta of metas) {
      try {
        if (isFile(meta) && isInProgress(JSON.parse(readFileSync(meta, 'utf8')))) {
          inProgress.add(folder)
          break
        }
      } catch {
        // an unreadable meta.json says nothing about progress
      }
    }
  }

  /** @type {Map<string, string>} */
  const texts = new Map()
  const folderText = (/** @type {string} */ folder) => {
    let text = texts.get(folder)
    if (text === undefined) {
      text = (referrers.get(folder) ?? []).map((path) => readFileSync(join(dist, path), 'utf8')).join('\n')
      texts.set(folder, text)
    }
    return text
  }
  const isReferenced = (/** @type {string} */ path) => {
    const folder = workFolderOf(path)
    return folder !== null && folderText(folder).includes(basenameOf(path))
  }

  const openCycle = readOpenCycle(root)
  const ctx = { isMirrored, inProgress, openCycle, isReferenced, n1Pages: only && !only.includes('n-1') ? new Set() : n1Published(dist, readWorks, warnings) }

  /** @type {Record<string, { kept: number, removed: number }>} */
  const practices = {}
  /** @type {string[]} */
  const removed = []
  let removedBytes = 0
  /** @type {string[]} */
  const remaining = []
  for (const path of files) {
    const decision = classify(path, ctx)
    if (decision.reason === 'page') {
      remaining.push(path)
      continue
    }
    const tally = (practices[decision.practice ?? 'house'] ??= { kept: 0, removed: 0 })
    if (decision.published || keep?.(path)) {
      tally.kept++
      remaining.push(path)
    } else {
      removedBytes += statSync(join(dist, path)).size
      if (!dryRun) rmSync(join(dist, path), { force: true })
      tally.removed++
      removed.push(path)
    }
  }
  for (const practice of dryRun ? [] : practicesInScope) {
    const abs = join(dist, practice)
    if (existsSync(abs) && statSync(abs).isDirectory()) removeEmptyDirs(abs)
  }

  // A redirect fires before Cloudflare Pages looks for a file, so a rule that matches a published
  // file takes it off the site. Reported, never fatal: the file is still in dist/.
  /** @type {string[]} */
  const shadowed = []
  const redirects = join(dist, '_redirects')
  if (checkRedirects && isFile(redirects)) {
    let text = readFileSync(redirects, 'utf8')
    const rewritten = withOpenCycleRewrites(text, openCycle)
    if (rewritten !== text && !dryRun) writeFileSync(redirects, rewritten)
    text = rewritten
    const rules = parseRedirects(text)
    for (const path of remaining) {
      for (const address of servedAt(path)) {
        const hit = matchRedirect(rules, address)
        if (hit && hit.rule.status !== 200) shadowed.push(`${address} → ${hit.location} (_redirects line ${hit.rule.line})`)
      }
    }
  }
  if (shadowed.length) {
    warnings.push(
      `publication: ${shadowed.length} address(es) of published files are caught by a redirect rule and would leave the site — ${shadowed.slice(0, 5).join('; ')}${shadowed.length > 5 ? '; …' : ''}`,
    )
  }
  return { practices, removed, removedBytes, shadowed, warnings }
}

/**
 * The one line the build prints.
 * @param {PruneResult} result
 */
export function summaryLine(result) {
  const entries = Object.entries(result.practices)
  const kept = entries.reduce((sum, [, t]) => sum + t.kept, 0)
  const removed = entries.reduce((sum, [, t]) => sum + t.removed, 0)
  const each = entries.map(([practice, t]) => `${practice} ${t.kept}/${t.removed}`).join(' · ')
  return `publication rule (${PUBLICATION_RULE_SINCE}): ${kept + removed} mirrored files, ${kept} kept, ${removed} removed — kept/removed per practice: ${each}`
}

/**
 * The Astro integration. Registered in astro.config.mjs.
 * @returns {import('astro').AstroIntegration}
 */
export default function publicationPrune() {
  let publicDir = ''
  let root = ''
  return {
    name: 'publication-prune',
    hooks: {
      'astro:config:done': ({ config }) => {
        publicDir = fileURLToPath(config.publicDir)
        root = fileURLToPath(config.root)
      },
      'astro:build:done': ({ dir, logger }) => {
        try {
          const result = prunePublication({ dist: fileURLToPath(dir), publicDir, root })
          logger.info(summaryLine(result))
          for (const warning of result.warnings) logger.warn(warning)
        } catch (error) {
          logger.error(
            `the publication rule was not applied (${error instanceof Error ? error.message : String(error)}); dist/ keeps every mirrored file`,
          )
        }
      },
    },
  }
}
