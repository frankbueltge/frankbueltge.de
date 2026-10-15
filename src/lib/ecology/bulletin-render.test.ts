// The bulletin reader, held to the two promises the stations make about a quoted record:
// the practice's own structure is read, never invented, and its text stays text — the module
// emits segments, and a segment that contained markup would be rendered as characters, not
// parsed. (Rendering the emphasis the practice itself wrote is not paraphrase — middle.ts's
// argument; this suite pins the mechanics of it.)
import { describe, expect, it } from 'vitest'
import { bulletinBlocks } from './bulletin-render'

const flat = (segs: { text: string }[]): string => segs.map((s) => s.text).join('')

describe('bulletinBlocks reads the shapes the bulletins use', () => {
  it('splits headings, list items and paragraphs at their own marks', () => {
    const blocks = bulletinBlocks(
      '# Bulletin — The Field\n\nA paragraph\nthat wraps.\n\n- first item\n- second item\n\n## Next\n\nAnother paragraph.',
    )
    expect(blocks.map((b) => b.kind)).toEqual([
      'heading',
      'para',
      'listItem',
      'listItem',
      'heading',
      'para',
    ])
    expect(blocks[0]).toMatchObject({ level: 1 })
    expect(blocks[4]).toMatchObject({ level: 2 })
    // wrapped paragraph lines are one block, whitespace normalised
    expect(flat(blocks[1]!.segments)).toBe('A paragraph that wraps.')
  })

  it('keeps a numbered item together with its indented continuation lines', () => {
    // The bulletins wrap their sibling items at the file's line width; the continuation is
    // indented, and reading it as a new paragraph would cut the practice's sentence in half.
    const blocks = bulletinBlocks('1. A first point that\n   continues indented.\n2. A second point.')
    expect(blocks.map((b) => b.kind)).toEqual(['listItem', 'listItem'])
    // the practice's own numbering stays in the text — it is content, not decoration
    expect(flat(blocks[0]!.segments)).toBe('1. A first point that continues indented.')
    expect(flat(blocks[1]!.segments)).toBe('2. A second point.')
  })

  it('strips the dash of a bulleted item but keeps everything after it verbatim', () => {
    const blocks = bulletinBlocks('- an item with a — dash inside')
    expect(flat(blocks[0]!.segments)).toBe('an item with a — dash inside')
  })

  it('normalises the single-asterisk emphasis segments cannot carry — words stay, markers go', () => {
    // The Atelier's bulletin nests italics inside bold with the closers flush ("…?***"); left
    // alone, segments() finds no strict `**…**` pair and the reader sees literal asterisks.
    const nested = bulletinBlocks('**A lead — *inner emphasis.*** The rest.')
    expect(nested[0]!.segments[0]).toEqual({ kind: 'strong', text: 'A lead — inner emphasis.' })
    expect(nested[0]!.segments[1]).toEqual({ kind: 'text', text: ' The rest.' })
    // …and the plain form, the same way firstClause treats it on the board rows.
    const plain = bulletinBlocks('the Studio’s *NOT YET*. Point noted.')
    expect(plain[0]!.segments).toEqual([
      { kind: 'text', text: 'the Studio’s NOT YET. Point noted.' },
    ])
  })

  it('runs each block’s inline text through segments — the emphasis the practice wrote', () => {
    const blocks = bulletinBlocks('**The lead claim.** And a `path/to/file` beside it.')
    expect(blocks).toHaveLength(1)
    expect(blocks[0]!.segments.map((s) => s.kind)).toEqual(['strong', 'text', 'code', 'text'])
    expect(blocks[0]!.segments[0]).toEqual({ kind: 'strong', text: 'The lead claim.' })
    expect(blocks[0]!.segments[2]).toEqual({ kind: 'code', text: 'path/to/file' })
  })

  it('never turns text into markup — a tag in a bulletin stays characters', () => {
    // The module emits segments, not HTML; whatever the mirrored file carries is data. A
    // template rendering these as text nodes escapes them — but only if nothing upstream
    // has already promoted the string to markup, which is what this pins.
    const blocks = bulletinBlocks('<script>alert(1)</script> and **<b>bold</b>**')
    expect(blocks).toHaveLength(1)
    const [first, , third] = blocks[0]!.segments
    expect(first).toEqual({ kind: 'text', text: '<script>alert(1)</script> and ' })
    expect(third).toBeUndefined()
    // the bold's inner tag survives as characters inside the strong segment
    expect(blocks[0]!.segments.at(-1)).toEqual({ kind: 'strong', text: '<b>bold</b>' })
  })

  it('draws nothing from nothing — empty input is an empty list, not an empty block', () => {
    expect(bulletinBlocks('')).toEqual([])
    expect(bulletinBlocks('\n\n  \n')).toEqual([])
  })
})
