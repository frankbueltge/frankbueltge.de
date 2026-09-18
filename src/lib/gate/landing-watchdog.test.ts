import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

/** Two mechanisms report a night that did not land, and they read the same practices from two
 *  hand-written lists.
 *
 *  The morning digest says "keine Session gelandet" when a practice committed nothing. The
 *  landing watchdog says the opposite thing — a session worked, pushed a branch, and never
 *  reached `main` — which the digest cannot see at all, because from `main` a stranded session
 *  and a session that never ran look identical.
 *
 *  On 2026-09-11 the digest's list was extended to arch, n-1 and error-as-method. The
 *  watchdog's was not, and stayed on the three practices of 2026-07-16. The cost came due on
 *  2026-09-18: n-1's night 29 ran, pushed `claude/fervent-hamilton-96wl27` three commits ahead
 *  of `main`, and opened a pull request saying in as many words that its own environment could
 *  not push to `main` and that some later session would have to merge it. Nothing was watching
 *  n-1, so nothing called — the practice's record simply sat outside its own repository.
 *
 *  So the lists are bound together here rather than left to be remembered twice: a practice the
 *  digest watches is one the watchdog must watch too.
 */

const WORKFLOWS = fileURLToPath(new URL('../../../.github/workflows', import.meta.url))
const read = (f: string) => readFileSync(`${WORKFLOWS}/${f}`, 'utf8')

/** Both workflows loop over their practices in a `for REPO in … ; do` line. */
function repoLoopList(text: string, file: string): string[] {
  const line = text.match(/^\s*for REPO in ([^;]+);/m)
  expect(line, `${file}: no "for REPO in …" loop found`).not.toBeNull()
  return line![1].trim().split(/\s+/)
}

describe('the two watchers read the same practices', () => {
  it('the landing watchdog watches every practice the morning digest watches', () => {
    const digest = repoLoopList(read('morning-digest.yml'), 'morning-digest.yml')
    const watchdog = repoLoopList(read('landing-watchdog.yml'), 'landing-watchdog.yml')

    // Guard the guard: if either list stops parsing, the check below passes on empty sets.
    expect(digest.length).toBeGreaterThan(3)
    expect(watchdog.length).toBeGreaterThan(3)

    const unwatched = digest.filter((r) => !watchdog.includes(r))
    expect(
      unwatched,
      `practices the digest watches but the landing watchdog does not: ${unwatched.join(', ')}`,
    ).toEqual([])
  })

  it('the watchdog matches the branch names the practices actually push', () => {
    // Each practice names its session branches its own way, and a branch the pattern misses is
    // invisible to the watchdog even once its repository is in the list. n-1 and the plenum push
    // `claude/*` (the cloud outcome branch); error-as-method pushes `night/<date>`; the Field
    // pushes `research/session-*`; the Atelier pushes `ulysses/*`.
    const pattern = read('landing-watchdog.yml').match(/refs\/heads\/\(([^)]+)\)/)
    expect(pattern, 'landing-watchdog.yml: no refs/heads/(…) branch pattern').not.toBeNull()
    const alternatives = pattern![1].split('|')
    for (const prefix of ['research/session-', 'ulysses/', 'claude/', 'night/']) {
      expect(alternatives, `branch prefix "${prefix}" is not matched`).toContain(prefix)
    }
  })
})
