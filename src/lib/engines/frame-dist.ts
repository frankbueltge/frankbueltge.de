// src/lib/engines/frame-dist.ts — the standalone works' frame, applied to the built site (2026-10-17).
//
// A standalone work is served from its mirror, and the integrate writes the frame (the wall text
// and the way back, ./work-frame.ts) into the mirror when it copies the work (src/lib/atelier/
// integrate.ts), with the teaser on record at that moment. A teaser that landed later reached the
// page only with the next integrate — and the teaser writer could not wait for one. Its pull
// request changes src/data/teasers.json alone, so work-frame.test.ts failed on every work whose
// mirror predated its new teaser; the writer dropped those works, and the next integrate framed
// them without a wall text again, because none was on record. That loop kept every Studio work
// published from 2026-10-13 on without a wall text, until drift-check would have turned the gap
// into a finding that stops the house's deploys.
//
// So the build frames the served copy again, with the teasers on record on the day it runs: what a
// visitor reads is the teaser on record when the site was built, whenever the mirror was copied.
// The mirror keeps its own frame (the integrate still writes it, and work-frame.test.ts still
// holds every mirror to having one); this only makes the wall text current. Run as the second half
// of `npm run build` by scripts/engines/frame-dist.ts, which never fails the build over it.

import { existsSync, readdirSync, readFileSync, writeFileSync } from 'node:fs'
import { join } from 'node:path'
import { teaserFor } from './teaser'
import { frameStandaloneWork } from './work-frame'

/** The mirrors that hold standalone works as <ns>/werke-html/<slug>/index.html — the same four
 *  work-frame.test.ts walks and scripts/engines/reframe-works.ts frames. */
export const FRAMED_NAMESPACES = ['atelier', 'field', 'studio', 'plenum'] as const

export interface FrameDistReport {
  /** standalone work pages found in the built site */
  pages: number
  /** of those, the ones whose frame changed: a teaser that landed or changed after their mirror */
  reframed: number
  /** pages that could not be read or written, each with why; they keep the frame they were built with */
  failed: string[]
}

/**
 * Frames every standalone work page under `dist` with the wall text on record now. A page that
 * already carries it is left byte for byte; a page that cannot be framed is reported, never
 * thrown, and keeps the frame its mirror carries.
 */
export function frameDist(
  dist: string,
  wallText: (ns: string, slug: string) => string | undefined = teaserFor,
): FrameDistReport {
  const report: FrameDistReport = { pages: 0, reframed: 0, failed: [] }
  for (const ns of FRAMED_NAMESPACES) {
    const root = join(dist, ns, 'werke-html')
    if (!existsSync(root)) continue
    for (const slug of readdirSync(root)) {
      const file = join(root, slug, 'index.html')
      if (!existsSync(file)) continue
      report.pages++
      try {
        const before = readFileSync(file, 'utf8')
        const after = frameStandaloneWork(before, ns, wallText(ns, slug))
        if (after !== before) {
          writeFileSync(file, after)
          report.reframed++
        }
      } catch (e) {
        report.failed.push(`${ns}/${slug}: ${(e as Error).message}`)
      }
    }
  }
  // Since 2026-11-08: the artifacts the Field and the Atelier publish as pages of their own
  // (<ns>/artifacts/<slug>/ and, since the programme, <ns>/artifacts/cycle-NNN/<slug>/) are works a
  // visitor reaches from /ecology and the front page just as a Studio work, and had no way back.
  // They get the same frame. A page the site renders itself carries the house's head and is left.
  for (const ns of ARTIFACT_NAMESPACES) {
    for (const { file, slug } of artifactPages(join(dist, ns, 'artifacts'))) {
      report.pages++
      try {
        const before = readFileSync(file, 'utf8')
        if (/<html\b[^>]*\bdata-skin=/i.test(before)) continue
        const after = frameStandaloneWork(before, ns, wallText(ns, slug))
        if (after !== before) {
          writeFileSync(file, after)
          report.reframed++
        }
      } catch (e) {
        report.failed.push(`${ns}/artifacts/${slug}: ${(e as Error).message}`)
      }
    }
  }
  return report
}

/** The practices whose published artifacts stand as pages under <ns>/artifacts/. */
export const ARTIFACT_NAMESPACES = ['atelier', 'field'] as const

/** An artifact's own page: artifacts/<slug>/index.html, or artifacts/cycle-NNN/<slug>/index.html. */
export function artifactPages(root: string): { file: string; slug: string }[] {
  if (!existsSync(root)) return []
  const out: { file: string; slug: string }[] = []
  for (const entry of readdirSync(root, { withFileTypes: true })) {
    if (!entry.isDirectory()) continue
    if (/^cycle-\d+$/.test(entry.name)) {
      for (const inner of readdirSync(join(root, entry.name), { withFileTypes: true })) {
        const file = join(root, entry.name, inner.name, 'index.html')
        if (inner.isDirectory() && existsSync(file)) out.push({ file, slug: inner.name })
      }
    } else {
      const file = join(root, entry.name, 'index.html')
      if (existsSync(file)) out.push({ file, slug: entry.name })
    }
  }
  return out
}
