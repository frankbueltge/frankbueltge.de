// The programme's mirror (2026-11-08): read in order, links kept pointing to research-ecology.
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { loadProgrammeDocs, renderProgramme, stepOf, PROGRAMME_DIR } from './programme'

describe('the programme mirror', () => {
  it('is empty without a mirror — a legal state before the first choice', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prog-'))
    expect(loadProgrammeDocs(dir)).toEqual([])
  })

  it('reads question, state, plan and dossier in that order, and skips what is missing', () => {
    const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'prog-'))
    const base = path.join(dir, PROGRAMME_DIR)
    fs.mkdirSync(path.join(base, 'selection'), { recursive: true })
    fs.writeFileSync(path.join(base, 'PLAN.md'), '# Plan\n')
    fs.writeFileSync(path.join(base, 'selection/dossier.md'), '# Dossier\n')
    fs.writeFileSync(path.join(base, 'QUESTION.md'), '# Question\n')
    expect(loadProgrammeDocs(dir).map((d) => d.part)).toEqual(['question', 'plan', 'dossier'])
  })

  it('points relative links at the files in research-ecology', () => {
    const html = renderProgramme('[plan](PLAN.md) · [lines](../lines/README.md) · [web](https://example.org/x.md)')
    expect(html).toContain('https://github.com/frankbueltge/research-ecology/blob/main/programme/PLAN.md')
    expect(html).toContain('https://github.com/frankbueltge/research-ecology/blob/main/lines/README.md')
    expect(html).toContain('https://example.org/x.md')
  })

  it('resolves links against the folder of the file they stand in, folders to their tree', () => {
    const html = renderProgramme('[q](archive/x/QUESTION.md) · [dir](archive/x/) · [up](../README.md)', 'selection/dossier.md')
    expect(html).toContain('https://github.com/frankbueltge/research-ecology/blob/main/programme/selection/archive/x/QUESTION.md')
    expect(html).toContain('https://github.com/frankbueltge/research-ecology/tree/main/programme/selection/archive/x/')
    expect(html).toContain('https://github.com/frankbueltge/research-ecology/blob/main/programme/README.md')
    const top = renderProgramme('[dir](selection/archive/x/)')
    expect(top).toContain('https://github.com/frankbueltge/research-ecology/tree/main/programme/selection/archive/x/')
  })

  it('counts steps from the cycle the programme opened', () => {
    expect(stepOf(13, 13)).toBe(1)
    expect(stepOf(15, 13)).toBe(3)
    expect(stepOf(12, 13)).toBeNull()
    expect(stepOf(13, null)).toBeNull()
  })
})
