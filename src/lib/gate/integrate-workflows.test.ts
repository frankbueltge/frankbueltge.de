import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { MIRRORS } from '@/lib/engines/publication.mjs'

/** The integrate workflows mirror a practice repository into the site and push the result to
 *  `main`. Two defects in that push mechanism turned the gate red on 2026-08-29 (run
 *  33236253015, Field integrate #762) and blocked a deploy, and neither is visible from the
 *  outcome alone — the run reports "push failed after 5 rebase attempts (concurrent push
 *  race)", which names a race rather than the defect that made the race unsurvivable.
 *
 *  Both are guarded here because both are one-line regressions in YAML nobody type-checks.
 */

const WORKFLOWS = fileURLToPath(new URL('../../../.github/workflows', import.meta.url))

/** The push loop is the marker: a workflow that carries it commits to `main` from a runner. */
const PUSH_LOOP = 'rebase attempts (concurrent push race)'

function integrateWorkflows(): { name: string; text: string }[] {
  return readdirSync(WORKFLOWS)
    .filter((f) => f.endsWith('.yml'))
    .map((name) => ({ name, text: readFileSync(`${WORKFLOWS}/${name}`, 'utf8') }))
    .filter((w) => w.text.includes(PUSH_LOOP))
}

describe('integrate workflows: pushing to main', () => {
  it('finds the workflows that push to main', () => {
    // If this drops to zero the two guards below pass vacuously and guard nothing.
    expect(integrateWorkflows().length).toBeGreaterThan(0)
  })

  it('checks out the tip of main, not the SHA the event was pinned to', () => {
    // `actions/checkout` defaults to `github.sha` — for a repository_dispatch that is the SHA
    // main had when the practice landed, not the SHA main has when the run finally starts.
    // These workflows are serialised by a concurrency group, so a run that waits behind a
    // sibling starts after that sibling has already pushed its own mirror commit. Building
    // from the pinned SHA then guarantees the rebase collides on exactly the file both runs
    // generate: on 2026-08-29 that was an add/add conflict on
    // src/content/field/journal/2026-08-29.md, between two runs dispatched at the same SHA.
    for (const { name, text } of integrateWorkflows()) {
      // The checkout step runs until the next step marker at the same indentation.
      const checkout = text.match(/ {6}- uses: actions\/checkout@v4\n(?: {8}.*\n|\n)*/)?.[0] ?? ''
      expect(checkout, `${name}: checkout has no with: block`).toMatch(/^ {8}with:$/m)
      expect(checkout, `${name}: checkout is pinned to the event SHA`).toMatch(/^ {10}ref: main$/m)
    }
  })

  it('clears a conflicted rebase before retrying the push', () => {
    // Without this the retry loop is a loop in name only. `git pull --rebase` stops mid-rebase
    // on a conflict and leaves unmerged files behind, so every later attempt dies instantly on
    // "Pulling is not possible because you have unmerged files" and the sleeps just burn a
    // minute. Run #762 advertised five attempts and got one.
    for (const { name, text } of integrateWorkflows()) {
      expect(text, `${name}: retry loop never aborts a conflicted rebase`).toContain(
        'git rebase --abort',
      )
    }
  })
})

/** Since 2026-10-17 the site publishes only a practice's finished works and cycle presentations,
 *  and an integrate trims the copy it has just made to the same rule before anything is validated
 *  or committed (scripts/engines/trim-mirror.mjs). The integrates had gone on committing the rest
 *  at about three hundred files a day that no page, count or score read. A mirror that grows and
 *  is not trimmed is that again, so the workflow is held to the step: present, for the right
 *  practice, after the copy and before the gate and the commit it must precede. */
describe('integrate workflows: trimming the mirror', () => {
  /** workflow → the practice key (a key of MIRRORS) it trims */
  const TRIMS: Record<string, string> = {
    'atelier-integrate.yml': 'atelier',
    'field-integrate.yml': 'field',
    'studio-integrate.yml': 'studio',
    'nightly-integrate.yml': 'error-as-method',
    'n1-integrate.yml': 'n-1',
  }
  /** mirrors that no longer grow: Arch is retired and its cron is off, the attention archive is finished */
  const NOT_GROWING = ['arch', 'attention']

  it('trims every mirror that still grows, and names only mirrors the rule knows', () => {
    const grows = Object.keys(MIRRORS).filter((p) => !NOT_GROWING.includes(p))
    expect(Object.values(TRIMS).sort()).toEqual(grows.sort())
  })

  it.each(Object.entries(TRIMS))('%s trims %s before it validates or commits', (file, practice) => {
    const text = readFileSync(`${WORKFLOWS}/${file}`, 'utf8')
    const step = text.indexOf(`scripts/engines/trim-mirror.mjs ${practice}`)
    expect(step, `${file} never trims ${practice}`).toBeGreaterThan(-1)
    // the gate (check, test, build) and the commit both come after the trim; n-1 has no gate and
    // commits inside the same function
    const after = text.indexOf('npm run build', step) > -1 ? text.indexOf('npm run build', step) : text.indexOf('git add public/n-1', step)
    expect(after, `${file}: nothing follows the trim that validates or commits`).toBeGreaterThan(step)
    expect(text.lastIndexOf('npm run build', step), `${file}: the build runs before the trim`).toBeLessThan(step)
  })

  it('keeps going when the trim itself fails: the script logs a warning and exits 0', () => {
    const script = readFileSync(fileURLToPath(new URL('../../../scripts/engines/trim-mirror.mjs', import.meta.url)), 'utf8')
    expect(script).toContain('::warning::the mirror was not trimmed')
    expect(script).not.toMatch(/process\.exit\(1\)/)
  })
})
