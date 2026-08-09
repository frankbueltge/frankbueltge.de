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

import { readFileSync, statSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { ATTENTION_FILE, SOURCE_FILES } from './build'

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
