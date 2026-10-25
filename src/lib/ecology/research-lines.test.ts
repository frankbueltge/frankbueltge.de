import { describe, expect, it } from 'vitest'
import { loadLines, parseLine, renderLine } from './research-lines'

const FILE = `# Line: some-line

Status: **resting** since 2026-10-24 · Opened: 2026-10-25 · Kept after cycle: 009

## 1. Question

What does a record
leave out?

## 3. Open questions

- **Q1** First. *Field.*
- **Q2** Second, see [the other](other-line.md).
`

describe('lines', () => {
  it('parses slug, status, question and open questions', () => {
    const l = parseLine(FILE)!
    expect(l.slug).toBe('some-line')
    expect(l.status).toBe('resting')
    expect(l.question).toBe('What does a record leave out?')
    expect(l.openQuestions).toBe(2)
    expect(l.header).toContain('Kept after cycle: 009')
  })

  it('is not a line without the header', () => {
    expect(parseLine('# Lines — rules\n\ntext')).toBeNull()
  })

  it('resolves links to sibling line files to their pages and keeps raw HTML out', () => {
    const html = renderLine('[x](other-line.md) [r](README.md) <script>alert(1)</script>')
    expect(html).toContain('href="/lines/other-line/"')
    expect(html).toContain('href="/lines/"')
    expect(html).not.toContain('<script>')
  })

  it('reads the committed mirror: three lines, each with a status and a question', () => {
    const lines = loadLines()
    expect(lines.length).toBeGreaterThanOrEqual(3)
    for (const l of lines) {
      expect(l.status).not.toBe('unknown')
      expect(l.question).toBeTruthy()
    }
    expect(lines[lines.length - 1]!.status).not.toBe('active')
  })
})
