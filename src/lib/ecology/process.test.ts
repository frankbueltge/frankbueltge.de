// src/lib/ecology/process.test.ts — a work's process (amendment of 2026-10-22): what a
// PROCESS.json declares is shown as it stands, what it gets wrong is left out, and no state
// points at a picture the site cannot serve.

import { mkdirSync, mkdtempSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { describe, expect, it } from 'vitest'
import { loadProcess, parseProcess } from './process'

const state = (n: number, extra: Record<string, unknown> = {}) => ({
  n,
  date: '2026-10-24',
  session: `session ${200 + n}`,
  changed: `The map now plays from 2008 (${n}).`,
  shot: `process/${n}.png`,
  ...extra,
})

describe('parseProcess', () => {
  it('returns the states in order of their number', () => {
    const states = parseProcess({ states: [state(3), state(1), state(2)] })
    expect(states.map((s) => s.n)).toEqual([1, 2, 3])
    expect(states[0]).toEqual({ n: 1, date: '2026-10-24', session: 'session 201', changed: 'The map now plays from 2008 (1).', shot: 'process/1.png' })
  })

  it('keeps the first entry under a number and drops a later one', () => {
    const states = parseProcess({ states: [state(1), state(1, { changed: 'rewritten' })] })
    expect(states).toHaveLength(1)
    expect(states[0]!.changed).toBe('The map now plays from 2008 (1).')
  })

  it('leaves out entries without a number, a date, a session or a sentence', () => {
    const states = parseProcess({
      states: [state(0), state(1.5), state(2, { date: '24.10.2026' }), state(3, { session: ' ' }), state(4, { changed: null }), 'x', null, state(5)],
    })
    expect(states.map((s) => s.n)).toEqual([5])
  })

  it('accepts a session given as a number, and folds whitespace', () => {
    const [s] = parseProcess({ states: [state(1, { session: 191, changed: '  one\n sentence ' })] })
    expect(s!.session).toBe('191')
    expect(s!.changed).toBe('one sentence')
  })

  it('drops a screenshot that leaves process/ and keeps the state', () => {
    const states = parseProcess({ states: [state(1, { shot: '../../secret.png' }), state(2, { shot: 'process/a/b.png' }), state(3, { shot: 'process/3.gif' })] })
    expect(states.map((s) => s.shot)).toEqual([null, null, null])
  })

  it('reads nothing from a file that is not a process', () => {
    expect(parseProcess(null)).toEqual([])
    expect(parseProcess([])).toEqual([])
    expect(parseProcess({ states: {} })).toEqual([])
  })
})

describe('loadProcess', () => {
  const root = mkdtempSync(join(tmpdir(), 'process-'))
  const href = '/studio/werke-html/2026-10-24-a-work/'
  const folder = join(root, 'public', href)
  mkdirSync(join(folder, 'process'), { recursive: true })
  writeFileSync(join(folder, 'process', '1.png'), '')
  writeFileSync(join(folder, 'PROCESS.json'), JSON.stringify({ states: [state(1), state(2)] }))

  it('turns each screenshot into its address on the site, only where the file is there', () => {
    const states = loadProcess(href, root)
    expect(states.map((s) => s.shot)).toEqual([`${href}process/1.png`, null])
  })

  it('shows no process for a work without the file, or for an address outside a folder', () => {
    expect(loadProcess('/studio/werke-html/none/', root)).toEqual([])
    expect(loadProcess('/studio/werke-html/2026-10-24-a-work', root)).toEqual([])
    expect(loadProcess('/studio/../studio/werke-html/2026-10-24-a-work/', root)).toEqual([])
  })
})
