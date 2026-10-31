import { mkdirSync, mkdtempSync, readFileSync, rmSync, writeFileSync } from 'node:fs'
import { tmpdir } from 'node:os'
import { join } from 'node:path'
import { afterEach, describe, expect, it } from 'vitest'
import { classify, isReadByBuild } from '../engines/publication.mjs'
import { loadInstructions, parseInstruction, STOPS_FILE, SUMMARY_MAX } from './instructions'

describe('an instruction’s text', () => {
  it('reads the title, the forms and the first paragraph, and nothing after it', () => {
    const text = '# The plate\n\nForm: 3D print, device\n\nA plate of 116 threads\nhangs in a window.\n\nThe rest is the practice’s.\n'
    expect(parseInstruction(text)).toEqual({ title: 'The plate', forms: ['3D print', 'device'], summary: 'A plate of 116 threads hangs in a window.' })
  })

  it('needs nothing: a file without a heading or a form still has its paragraph', () => {
    expect(parseInstruction('Print it.')).toEqual({ title: '', forms: [], summary: 'Print it.' })
    expect(parseInstruction('')).toEqual({ title: '', forms: [], summary: '' })
  })

  it('drops Markdown’s marks, which the page would show as they stand', () => {
    const text = '# *NO* PART\n\n**Form:** object\n\n*A print-and-instruction work.* See [the list](https://example.org) and `the wall`.'
    expect(parseInstruction(text)).toEqual({ title: 'NO PART', forms: ['object'], summary: 'A print-and-instruction work. See the list and the wall.' })
  })

  it('shortens a long paragraph at a word', () => {
    const { summary } = parseInstruction(`# Long\n\n${'word '.repeat(200)}`)
    expect(summary.length).toBeLessThanOrEqual(SUMMARY_MAX + 2)
    expect(summary.endsWith('word …')).toBe(true)
  })
})

describe('the instructions on /post', () => {
  const roots: string[] = []
  afterEach(() => roots.splice(0).forEach((r) => rmSync(r, { recursive: true, force: true })))

  /** A checkout with these files under public/; a work is a folder with an index.html. */
  function checkout(files: Record<string, string>): string {
    const root = mkdtempSync(join(tmpdir(), 'instructions-'))
    roots.push(root)
    for (const [path, text] of Object.entries(files)) {
      const p = join(root, path)
      mkdirSync(join(p, '..'), { recursive: true })
      writeFileSync(p, text)
    }
    return root
  }

  it('finds one beside a published work of each practice, names its repository, and lists the newest first', () => {
    const root = checkout({
      'public/studio/werke-html/2026-10-29-unwoven/index.html': '<!doctype html>',
      'public/studio/werke-html/2026-10-29-unwoven/INSTRUCTION.md': '# The plate\n\nForm: 3D print\n\nA plate.',
      'public/error-as-method/works-html/2026-10-25-asked/index.html': '<!doctype html>',
      'public/error-as-method/works-html/2026-10-25-asked/INSTRUCTION.md': 'A wall.',
      'public/field/werke-html/2026-10-30-no-instruction/index.html': '<!doctype html>',
      'public/atelier/werke-html/no-page/INSTRUCTION.md': '# Beside nothing',
    })
    expect(loadInstructions(root)).toEqual([
      {
        work: 'studio:2026-10-29-unwoven',
        practice: 'The Studio',
        title: 'The plate',
        forms: ['3D print'],
        summary: 'A plate.',
        href: '/studio/werke-html/2026-10-29-unwoven/',
        source: 'https://github.com/frankbueltge/studio/blob/main/works/2026-10-29-unwoven/INSTRUCTION.md',
        day: '2026-10-29',
      },
      {
        work: 'error-as-method:2026-10-25-asked',
        practice: 'The nightly line',
        title: '2026-10-25-asked',
        forms: [],
        summary: 'A wall.',
        href: '/error-as-method/works-html/2026-10-25-asked/',
        source: 'https://github.com/frankbueltge/error-as-method/blob/main/works/2026-10-25-asked/INSTRUCTION.md',
        day: '2026-10-25',
      },
    ])
  })

  it('leaves out a stopped instruction', () => {
    const root = checkout({
      'public/studio/werke-html/2026-10-29-unwoven/index.html': '<!doctype html>',
      'public/studio/werke-html/2026-10-29-unwoven/INSTRUCTION.md': '# The plate',
      [STOPS_FILE]: JSON.stringify({ stopped: [{ work: 'studio:2026-10-29-unwoven', stopped: '2026-10-31', why: 'a test' }] }),
    })
    expect(loadInstructions(root)).toEqual([])
  })

  it('keeps the file in the mirrors, where the build reads it, wherever a work may stand', () => {
    for (const path of [
      'atelier/werke-html/a/INSTRUCTION.md',
      'field/werke-html/a/INSTRUCTION.md',
      'studio/werke-html/a/INSTRUCTION.md',
      'error-as-method/works-html/a/INSTRUCTION.md',
      'error-as-method/a/INSTRUCTION.md',
      'field/artifacts/cycle-011/a/INSTRUCTION.md',
    ]) {
      expect(isReadByBuild(path) || classify(path).published, path).toBe(true)
    }
  })

  it('starts with no stop', () => {
    expect(JSON.parse(readFileSync(STOPS_FILE, 'utf8'))).toEqual({ $contract: 'instruction-stops/1', stopped: [] })
  })
})
