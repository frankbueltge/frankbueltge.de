// src/lib/graph/hooks.test.ts — the two hooks that keep the artifact current stay wired.
//
// The graph's honesty guard fails when the committed artifact and its sources disagree. That is
// the point, but it landed on sessions that had nothing to do with the graph. Since 2026-08-09
// two hooks re-derive it automatically: a git pre-commit hook (any tool, any hand) and a Claude
// Code PostToolUse hook (every session, no setup). Both are easy to delete by accident and
// impossible to miss when they are gone — nothing fails, the friction simply comes back.
//
// So the wiring is asserted here. These tests check that the hooks EXIST and name the right
// things; that they WORK was proven by deleting the artifact and committing (see the pre-commit
// hook's own comment about the version that silently did nothing).

import { readFileSync, readdirSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { ATTENTION_FILE, SOURCE_FILES, WORK_META_DIRS } from './build'

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const read = (p: string): string => readFileSync(`${ROOT}${p}`, 'utf8')

describe('the git hook that re-derives the graph on the way in', () => {
  const hook = read('.githooks/pre-commit')

  it('is executable, or git ignores it without a word', () => {
    // eslint-disable-next-line no-bitwise
    expect(statSync(`${ROOT}.githooks/pre-commit`).mode & 0o111).toBeGreaterThan(0)
  })

  it('installs itself with the dependencies, so nobody has to remember a setup step', () => {
    const pkg = JSON.parse(read('package.json')) as { scripts: Record<string, string> }
    expect(pkg.scripts.prepare).toContain('core.hooksPath')
    expect(pkg.scripts.prepare).toContain('.githooks')
  })

  it('re-derives through the same command a session would type', () => {
    expect(hook).toContain('graph:build')
    expect(hook).toContain('git add -- src/data/graph/graph.json')
  })

  it('never blocks a commit — a hook that refuses teaches people --no-verify', () => {
    // Every failure path leaves with 0: no npm, no node_modules, a failed derivation.
    expect(hook).toContain('command -v npm >/dev/null 2>&1 || exit 0')
    expect(hook).toContain('[ -d node_modules ] || exit 0')
    expect(hook).not.toContain('exit 1')
  })

  it('stages by comparing INDEX entries, not the working tree', () => {
    // The regression this file exists for: `git diff --quiet` does not see a file staged as
    // DELETED, so the first version rebuilt the artifact and committed the deletion anyway.
    expect(hook).toContain('git rev-parse ":src/data/graph/graph.json"')
    expect(hook).not.toMatch(/git diff --quiet -- src\/data\/graph\/graph\.json/)
  })
})

describe('the Claude Code hook that re-derives after an edit', () => {
  const settings = JSON.parse(read('.claude/settings.json')) as {
    enabledPlugins?: Record<string, unknown>
    hooks?: { PostToolUse?: Array<{ matcher?: string; hooks?: Array<{ type: string; command?: string }> }> }
  }
  const command = settings.hooks?.PostToolUse?.flatMap((entry) => entry.hooks ?? [])
    .map((h) => h.command ?? '')
    .join('\n')

  it('is wired on writes and edits', () => {
    const matchers = settings.hooks?.PostToolUse?.map((e) => e.matcher) ?? []
    expect(matchers).toContain('Write|Edit')
    expect(command).toContain('graph:build')
  })

  it('kept the settings it found — a hook must not eat the rest of the file', () => {
    expect(settings.enabledPlugins).toBeDefined()
  })

  // The one way this hook rots invisibly: a new source is added to SOURCE_FILES and the hook
  // keeps watching the old list, so edits to it stop triggering a rebuild and the friction
  // returns for exactly that file. Every declared source must appear in the pattern.
  it('watches every source the graph is derived from', () => {
    for (const source of SOURCE_FILES) {
      const dir = source.includes('/audits/') ? 'docs/audits/' : source
      expect(command, `the hook does not watch ${source}`).toContain(dir)
    }
    // the practice works' metas and the optional attention export
    expect(command).toContain('/meta.json')
    expect(command).toContain(ATTENTION_FILE.replace('src/data/attention/', ''))
  })
})

// The third net, added 2026-08-11 after the second time it was needed.
//
// The two hooks above cover a hand and a session. They cannot cover a WORKFLOW: a mirror that
// commits with the built-in token runs no git hook and no Claude hook, so a graph source can
// reach main with the derivation left behind — and then every OTHER workflow that validates goes
// red on a disagreement it did not cause. That happened on 2026-08-11: an ecology export landed
// at 06:33, four workflows failed on it, and the nightly graph job at 04:25 was the first thing
// that would have repaired it — twenty-two hours later. A net that catches tomorrow morning is
// not a net for today.
//
// So: a workflow that writes a declared graph source must also derive the graph — itself, or by
// dispatching the job that does. This test finds them by the paths they name, which is exactly
// how such a workflow rots: someone adds a mirror for a new source and nothing says a word.
describe('the workflows that write a graph source keep it derived', () => {
  const dir = `${ROOT}.github/workflows`
  const workflows = readdirSync(dir)
    .filter((f) => f.endsWith('.yml'))
    .map((f) => ({ name: f, text: readFileSync(`${dir}/${f}`, 'utf8') }))

  const sourcePaths = [
    ...SOURCE_FILES,
    ...WORK_META_DIRS.map((d) => d.dir),
    ATTENTION_FILE,
  ]

  /** A workflow rarely names a source exactly: it mirrors into `src/data/nightly` while the
   *  source is `src/data/nightly/works`. So a source counts as touched when the workflow names
   *  it OR any ancestor of it three segments deep or more — deep enough that `src/data` alone
   *  never matches. Found by this test's own first version, which missed the workflow written
   *  the same night for exactly this reason. */
  const touches = (text: string, source: string): boolean => {
    const parts = source.split('/')
    for (let n = parts.length; n >= 3; n -= 1) {
      if (text.includes(parts.slice(0, n).join('/'))) return true
    }
    return false
  }

  it('finds the workflows at all — an empty sweep would pass silently', () => {
    expect(workflows.length).toBeGreaterThan(10)
  })

  for (const { name, text } of workflows) {
    const writes = sourcePaths.filter((p) => touches(text, p))
    if (!writes.length) continue
    it(`${name} derives the graph it disturbs (${writes.length} source(s))`, () => {
      const derives = text.includes('graph:build') || text.includes('graph.yml')
      expect(derives, `${name} names ${writes[0]} but never re-derives the graph`).toBe(true)
    })
  }

  // And the half of the rule the check above cannot see: a workflow may satisfy it by
  // DISPATCHING graph.yml instead of deriving inline, and a dispatch needs a permission the
  // workflow has to ask for. `permissions:` is exhaustive — every scope left out of the block is
  // set to none — so a job that lists contents/issues/pull-requests but not `actions` gets 403
  // from the dispatch endpoint. Behind `|| true`, which is right (the mirror must not fail on
  // its own follow-up), that 403 is silent, and the net simply never catches anything.
  //
  // It ran that way from 2026-08-11 to 2026-08-18: ecology-integrate dispatched graph.yml after
  // every export and graph.yml recorded not one workflow_dispatch run in those days — only its
  // 04:25 schedule. On 2026-08-18 the 05:32 export left the artifact behind, the production
  // deploy at 05:34 went red on graph.test.ts, and what repaired it was an unrelated field
  // integrate at 05:36 that happens to derive inline. The previous test passed throughout: the
  // workflow named graph.yml, and naming it was all it checked.
  for (const { name, text } of workflows) {
    if (!text.includes('gh workflow run')) continue
    it(`${name} may actually dispatch the workflow it calls`, () => {
      const block = /^permissions:\n(?: {2}\S.*\n)+/m.exec(text)?.[0] ?? ''
      // No block at all means the default token scope, which includes actions: write.
      if (!block) return
      expect(block, `${name} calls \`gh workflow run\` but its permissions block omits actions: write, so the dispatch gets 403`)
        .toMatch(/^ {2}actions: write$/m)
    })
  }
})
