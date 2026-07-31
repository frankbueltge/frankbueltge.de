// src/lib/tour/verify.ts — the honesty harness behind every guided tour: a scene's substance
// (`quote.text`) must be a byte-exact substring of the committed file its `quote.source` names.
// This is what "no paraphrase, no tidied ellipsis, no re-typed number" means as CODE rather than
// an editorial promise: a tour whose quotes drift from their source fails a test, not merely
// "looks wrong on review" (see this module's own tests, and — once real tours ship in a later
// WP — each tour's own test calling verifyTourQuotes over its committed source files with
// `fs.readFileSync` as the `readFile`).
//
// Exact-match policy (deliberate, see verify.test.ts): `quote.text` must appear as a literal,
// character-for-character substring of the source file's raw content — no whitespace
// normalization, no trimming, no case-folding, no Unicode normalization. A quote that fixes a
// typo, re-flows a line break, collapses double spaces, or "cleans up" an ellipsis is a
// violation, by design: the entire point of this harness is that tidying a quote is
// indistinguishable from fabricating one unless the computer refuses to take the author's word
// for it and checks the bytes itself.

import type { Tour } from './types'

export type ViolationKind =
  | 'missing-provenance-file'
  | 'missing-quote-source'
  | 'not-verbatim'
  | 'duplicate-scene-id'
  | 'invalid-scene-id'
  | 'empty-figure'

export interface Violation {
  kind: ViolationKind
  /** the scene the violation belongs to — absent for a tour-level provenance-path violation
   *  that isn't tied to any one scene's quotes */
  sceneId?: string
  /** the file path involved, where relevant */
  path?: string
  message: string
}

const SLUG = /^[a-z0-9]+(?:-[a-z0-9]+)*$/

/**
 * Checks every scene quote in `tour` against the actual file its `quote.source` names, read via
 * the caller-supplied `readFile` — kept as an injected function (rather than importing `node:fs`
 * directly) so this stays a pure function over plain data, trivially testable with in-memory
 * fixtures, and equally usable in a real check with `(path) => readFileSync(join(repoRoot, path),
 * 'utf8')`. A `readFile` that throws (e.g. ENOENT) is treated as "file does not exist", not
 * propagated — the point of this harness is to collect every violation in one pass, not to abort
 * on the first missing file.
 *
 * Also checks the structural invariants a tour must hold for its own machinery to work: every
 * scene id is unique and slug-shaped (verify.ts has no opinion on what a slug should SAY, only
 * that it is safe as a DOM id fragment and a URL fragment), and every scene names a non-empty
 * `focus.figure` (an empty one can never be applied by any figure).
 */
export function verifyTourQuotes(tour: Tour, readFile: (path: string) => string): Violation[] {
  const violations: Violation[] = []
  const cache = new Map<string, string | null>()

  const read = (path: string): string | null => {
    const cached = cache.get(path)
    if (cached !== undefined) return cached
    let content: string | null
    try {
      content = readFile(path)
    } catch {
      content = null
    }
    cache.set(path, content)
    return content
  }

  for (const path of tour.provenance) {
    if (read(path) === null) {
      violations.push({
        kind: 'missing-provenance-file',
        path,
        message: `provenance path "${path}" does not exist or could not be read`,
      })
    }
  }

  const seenIds = new Set<string>()
  for (const scene of tour.scenes) {
    if (seenIds.has(scene.id)) {
      violations.push({
        kind: 'duplicate-scene-id',
        sceneId: scene.id,
        message: `scene id "${scene.id}" is used by more than one scene`,
      })
    }
    seenIds.add(scene.id)

    if (!SLUG.test(scene.id)) {
      violations.push({
        kind: 'invalid-scene-id',
        sceneId: scene.id,
        message: `scene id "${scene.id}" is not slug-shaped (lowercase letters, digits, single hyphens, no leading/trailing/double hyphen)`,
      })
    }

    if (!scene.focus.figure) {
      violations.push({
        kind: 'empty-figure',
        sceneId: scene.id,
        message: `scene "${scene.id}" has an empty focus.figure — no figure could ever apply it`,
      })
    }

    for (const quote of scene.quotes) {
      const content = read(quote.source)
      if (content === null) {
        violations.push({
          kind: 'missing-quote-source',
          sceneId: scene.id,
          path: quote.source,
          message: `quote source "${quote.source}" does not exist or could not be read`,
        })
        continue
      }
      if (!content.includes(quote.text)) {
        violations.push({
          kind: 'not-verbatim',
          sceneId: scene.id,
          path: quote.source,
          message: `quote text for scene "${scene.id}" is not a literal substring of "${quote.source}"`,
        })
      }
    }
  }

  return violations
}
