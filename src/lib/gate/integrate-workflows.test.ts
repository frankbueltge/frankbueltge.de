import { readFileSync, readdirSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

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
