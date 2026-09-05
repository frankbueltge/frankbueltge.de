// The Middle's derivation, held against the real mirrored bulletins AND against fixtures for
// the states the mirror does not currently show. The rule under test throughout: transcribe,
// never interpret — an item appears in the practice's own words or not at all.
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { directedTraffic, loadMiddle, middleCounts, segments } from './middle'
import { PRACTICES } from './v3'

function root(): string {
  const dir = fs.mkdtempSync(path.join(os.tmpdir(), 'middle-'))
  for (const p of PRACTICES) fs.mkdirSync(path.join(dir, 'src/content', p), { recursive: true })
  return dir
}

const write = (dir: string, practice: string, body: string) =>
  fs.writeFileSync(path.join(dir, 'src/content', practice, 'BULLETIN.md'), body)

describe('loadMiddle against the committed mirror', () => {
  it('returns one voice per practice, in the house order', () => {
    const voices = loadMiddle()
    expect(voices.map((v) => v.practice)).toEqual(PRACTICES)
  })

  it('draws absence rather than inventing a section', () => {
    for (const v of loadMiddle()) {
      if (!v.present) expect(v.items).toEqual([])
    }
  })

  it('quotes items rather than shortening them — every item ends as its source does', () => {
    for (const item of loadMiddle().flatMap((v) => v.items)) {
      expect(item.text.length).toBeGreaterThan(20)
      expect(item.text).not.toMatch(/…$|\.\.\.$/)
    }
  })
})

describe('the two heading forms both parse', () => {
  it('reads a markdown heading (the Studio’s form)', () => {
    const dir = root()
    write(dir, 'studio', '# B\n\n## What the siblings should know\n1. **The Field** — a correction on your oldest row, stated at length.\n')
    write(dir, 'field', '# B\n')
    write(dir, 'atelier', '# B\n')
    const studio = loadMiddle(dir).find((v) => v.practice === 'studio')!
    expect(studio.present).toBe(true)
    expect(studio.items).toHaveLength(1)
    expect(studio.items[0]!.to).toEqual(['field'])
  })

  it('reads a bold label (the Field’s form) and a trailing full stop', () => {
    const dir = root()
    write(dir, 'field', '# B\n\n**What the siblings should know.**\n\n1. Concerns arrive in batches, which will bite anyone using the same file.\n')
    write(dir, 'studio', '# B\n')
    write(dir, 'atelier', '# B\n')
    const field = loadMiddle(dir).find((v) => v.practice === 'field')!
    expect(field.present).toBe(true)
    expect(field.items).toHaveLength(1)
    // named nobody, so it is carried for both
    expect(field.items[0]!.to).toEqual([])
  })
})

describe('addressing', () => {
  it('names the sibling by surface name or persona, and never the sender itself', () => {
    const dir = root()
    write(
      dir,
      'studio',
      '## What the siblings should know\n1. **The Field** — one thing. And Ulysses, another thing entirely.\n2. The Studio itself is named here and must not count as a recipient of its own item.\n',
    )
    write(dir, 'field', '# B\n')
    write(dir, 'atelier', '# B\n')
    const items = loadMiddle(dir).find((v) => v.practice === 'studio')!.items
    expect(items[0]!.to.sort()).toEqual(['atelier', 'field'])
    expect(items[1]!.to).toEqual([])
  })

  it('does not catch ordinary prose that merely contains the words', () => {
    const dir = root()
    write(dir, 'field', '## What the siblings should know\n1. Work in the field and in the studio continued without incident this week.\n')
    write(dir, 'studio', '# B\n')
    write(dir, 'atelier', '# B\n')
    expect(loadMiddle(dir).find((v) => v.practice === 'field')!.items[0]!.to).toEqual([])
  })
})

describe('multi-line items and section ends', () => {
  it('joins an item that wraps across indented lines', () => {
    const dir = root()
    write(
      dir,
      'field',
      '## What the siblings should know\n1. **A finding.** It runs across\n   several indented lines\n   like the real bulletins do.\n',
    )
    write(dir, 'studio', '# B\n')
    write(dir, 'atelier', '# B\n')
    const text = loadMiddle(dir).find((v) => v.practice === 'field')!.items[0]!.text
    expect(text).toContain('several indented lines like the real bulletins do.')
  })

  it('stops at the next section instead of swallowing the rest of the bulletin', () => {
    const dir = root()
    write(
      dir,
      'field',
      '## What the siblings should know\n1. The one item.\n\n## What comes next\n1. Not an item for the siblings.\n',
    )
    write(dir, 'studio', '# B\n')
    write(dir, 'atelier', '# B\n')
    const items = loadMiddle(dir).find((v) => v.practice === 'field')!.items
    expect(items).toHaveLength(1)
    expect(items[0]!.text).toBe('The one item.')
  })
})

describe('counts', () => {
  it('separates directed from open items and counts who is speaking', () => {
    const dir = root()
    write(dir, 'field', '## What the siblings should know\n1. **The Studio** — directed.\n2. Carried for both, naming nobody at all here.\n')
    write(dir, 'studio', '## What the siblings should know\n1. **Meridian** — directed by persona name.\n')
    write(dir, 'atelier', '# B, with no siblings section at all\n')
    const voices = loadMiddle(dir)
    expect(middleCounts(voices)).toEqual({ directed: 2, open: 1, speaking: 2 })
    expect(directedTraffic(voices)).toHaveLength(2)
  })
})

describe('segments — the practice’s own emphasis, without injecting markup', () => {
  it('splits bold and code out and leaves the rest verbatim', () => {
    const parts = segments('**A finding.** See `data/cohort.csv` for the rest.')
    expect(parts).toEqual([
      { kind: 'strong', text: 'A finding.' },
      { kind: 'text', text: ' See ' },
      { kind: 'code', text: 'data/cohort.csv' },
      { kind: 'text', text: ' for the rest.' },
    ])
  })

  it('round-trips the visible text — nothing is dropped or added', () => {
    const raw = '**Bold** plain `code` and **more bold** at the end.'
    expect(segments(raw).map((s) => s.text).join('')).toBe(
      'Bold plain code and more bold at the end.',
    )
  })

  it('leaves an unpaired marker alone rather than guessing', () => {
    expect(segments('a ** dangling marker')).toEqual([{ kind: 'text', text: 'a ** dangling marker' }])
  })

  it('splits a bold span that carries the practice’s own italics inside it', () => {
    const parts = segments('**Field — your *asleep* rule is here.** The rest.')
    expect(parts).toEqual([
      { kind: 'strong', text: 'Field — your *asleep* rule is here.' },
      { kind: 'text', text: ' The rest.' },
    ])
  })

  it('does not run one bold span into the next across the text between them', () => {
    expect(segments('**a *x* b** middle **c *y* d**')).toEqual([
      { kind: 'strong', text: 'a *x* b' },
      { kind: 'text', text: ' middle ' },
      { kind: 'strong', text: 'c *y* d' },
    ])
  })

  it('leaves every real mirrored item free of stray markers once rendered', () => {
    for (const item of loadMiddle().flatMap((v) => v.items)) {
      const rendered = segments(item.text).map((s) => s.text).join('')
      expect(rendered, item.text.slice(0, 40)).not.toContain('**')
    }
  })
})
