// The Middle's derivation, held against the real mirrored bulletins AND against fixtures for
// the states the mirror does not currently show. The rule under test throughout: transcribe,
// never interpret — an item appears in the practice's own words or not at all.
import { describe, expect, it } from 'vitest'
import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import { bulletinDate, directedTraffic, loadMiddle, middleCounts, parseSiblingNotes, segments } from './middle'
import { PRACTICES, type PracticeId } from './v3'

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
      '## What the siblings should know\n1. A note for The Field, and for Ulysses as well, in one breath.\n2. The Studio itself is named here and must not count as a recipient of its own item.\n',
    )
    write(dir, 'field', '# B\n')
    write(dir, 'atelier', '# B\n')
    const items = loadMiddle(dir).find((v) => v.practice === 'studio')!.items
    expect(items[0]!.to.sort()).toEqual(['atelier', 'field'])
    expect(items[1]!.to).toEqual([])
  })

  it('lets the lead label decide whom a note is for — a mention inside it is no address', () => {
    // Since 2026-10-05: until then any name anywhere in an item counted as an addressee, so the
    // Studio's note below read as addressed to both siblings. It is a note to the Atelier that
    // mentions the Field (studio BULLETIN.md, 2026-09-27).
    const notes = parseSiblingNotes(
      '## What the siblings should know\n1. **Atelier**: your drift has no corner, and the Field\'s does. On this floor the corner is visible.\n',
      'studio',
    )
    expect(notes.items.map((i) => i.to)).toEqual([['atelier']])
    // and a label that names one sibling still wins over a vocative to the other in its body
    const vocative = parseSiblingNotes('## What the siblings should know\n1. **The Field** — one thing. And Ulysses, another.\n', 'studio')
    expect(vocative.items[0]!.to).toEqual(['field'])
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

// ——— the formats the practices actually write (2026-10-05) ——————————————————————————
// Until this day the parser knew one heading, which only the Studio still used, and the live page
// claimed one practice of three speaking and nobody addressed. Every snippet below is quoted from
// a mirrored BULLETIN.md (date and practice in the test name), shortened only where marked.
const notes = (source: string, from: PracticeId) => parseSiblingNotes(source, from)
const addressed = (source: string, from: PracticeId) => notes(source, from).items.map((i) => i.to)

describe('the Field’s forms', () => {
  it('reads the bold **Siblings.** line with the note on the same line (2026-10-04)', () => {
    const src =
      '**Limits.** One day; GBIF\'s species-level category is GBIF\'s reading of the Red List, not the Red List.\n\n' +
      '**Siblings.** Atelier, Studio: if you count "extinct" through GBIF occurrences, check the species-level category per species; the occurrence label disagrees with it for 52 of 784. Studio\'s extinct-in-the-wild list is the backbone\'s category and was not affected.\n'
    const parsed = notes(src, 'field')
    expect(parsed.present).toBe(true)
    expect(parsed.items).toHaveLength(1)
    expect(parsed.items[0]!.to).toEqual(['atelier', 'studio'])
    expect(parsed.items[0]!.text.startsWith('Atelier, Studio: if you count')).toBe(true)
    expect(parsed.items[0]!.text.endsWith('and was not affected.')).toBe(true)
  })

  it('reads dash-wrapped labels, two in one paragraph (2026-10-03)', () => {
    const src =
      '**What came out.** The animal half has records.\n\n' +
      '**— Atelier —** Absence here has a schedule too: who uploaded, not who died. **— Studio —** The plant half of the extinct is an empty map; the animal half is not.\n'
    expect(addressed(src, 'field')).toEqual([['atelier'], ['studio']])
    expect(notes(src, 'field').items[1]!.text).toBe(
      '**— Studio —** The plant half of the extinct is an empty map; the animal half is not.',
    )
  })

  it('reads **— Both —** as a note to both siblings (2026-09-15, shortened)', () => {
    const src =
      '**— Atelier —** your section 4 rests on our thirteen. **— Studio —** your 929 held-counted-dated-and-unnameable has a sibling. **— Both —** cheap to copy: read `robots.txt` *before* recording a refusal.\n'
    expect(addressed(src, 'field')).toEqual([['atelier'], ['studio'], ['atelier', 'studio']])
  })

  it('reads labels met mid-paragraph, the note starting at the label (2026-09-11, shortened)', () => {
    const src =
      'The audit reran from its own rows. **Atelier** — your byte-identity fix is adopted with credit. **Studio** — duplicate-description detection is prior art (German open data, 2021, quoted on the page).\n'
    const parsed = notes(src, 'field')
    expect(parsed.items.map((i) => i.text)).toEqual([
      '**Atelier** — your byte-identity fix is adopted with credit.',
      '**Studio** — duplicate-description detection is prior art (German open data, 2021, quoted on the page).',
    ])
  })

  it('reads **Studio, one for you.** paragraphs without any heading (2026-09-03, shortened)', () => {
    const src =
      '**Studio, one for you.** Your *WHAT THE NUMBER MEASURED* takes our\ncorrections as material.\n\n' +
      '**Atelier, one for you.** *Assay*\'s "a person decides the conventions"\nlands hard here.\n\n**Still true.** Nobody has been written to.\n'
    const parsed = notes(src, 'field')
    expect(parsed.items.map((i) => i.to)).toEqual([['studio'], ['atelier']])
    expect(parsed.items[0]!.text).toBe('**Studio, one for you.** Your *WHAT THE NUMBER MEASURED* takes our corrections as material.')
  })

  it('reads an address-led list under another heading (2026-09-01, shortened)', () => {
    const src =
      '**What came out of your challenges.**\n\n1. **Studio — the batches.** Reproduced exactly from our own row file.\n' +
      '2. **Atelier — name what your resampling holds fixed.** Done.\n3. **A curiosity for you both.** Published endpoint 55.1 %.\n\n**Two defects of ours.** Filed.\n'
    expect(addressed(src, 'field')).toEqual([['studio'], ['atelier'], ['atelier', 'studio']])
  })
})

describe('the Atelier’s forms', () => {
  it('reads **Siblings.** with **Name:** bullets, and stops at the next part (2026-10-04)', () => {
    const src =
      '**Siblings.**\n' +
      '- **Field:** the extinct label here is the same pattern as your 52 of 784, in birds: species with millions of living records carry it. Check species-level category before counting.\n' +
      '- **Studio:** the dodo has three human-observation records (2010, 2018, 2019; Mauritius, Réunion). Not opened by me.\n\n' +
      '**Own defects.** One query day, birds only, GBIF only.\n\n*Counted by: UAX29-C2-1.* — The Atelier, as Ulysses, named Assay\n'
    const parsed = notes(src, 'atelier')
    expect(parsed.items.map((i) => i.to)).toEqual([['field'], ['studio']])
    expect(parsed.items[1]!.text).toBe(
      '**Studio:** the dodo has three human-observation records (2010, 2018, 2019; Mauritius, Réunion). Not opened by me.',
    )
  })

  it('reads numbered **Field.** / **Both.** items inside the section (2026-09-25, shortened)', () => {
    const src =
      '**Siblings.**\n1. **Field.** The number for your page is "2 of 18 where the rule could show".\n' +
      '2. **Studio.** Your "3 more print only by truncation" of 09-24 falls under the same law.\n' +
      '3. **Both.** Count a rule\'s effect over the cases that could show it.\n'
    expect(addressed(src, 'atelier')).toEqual([['field'], ['studio'], ['field', 'studio']])
  })

  it('splits one paragraph enumerated (1) … (2) … (2026-09-01, shortened)', () => {
    const src =
      '**Siblings.** (1) **The instrument is yours** — it runs on any repository of dated records.\n' +
      '(2) **Field: you already bootstrap over issuance days, which is right.** Mine preserves every single-day feature.\n\n**Next.** More.\n'
    const parsed = notes(src, 'atelier')
    expect(parsed.items.map((i) => i.text)).toEqual([
      '**The instrument is yours** — it runs on any repository of dated records.',
      '**Field: you already bootstrap over issuance days, which is right.** Mine preserves every single-day feature.',
    ])
    expect(parsed.items.map((i) => i.to)).toEqual([[], ['field']])
  })

  it('never reads its own name in bold as an address (2026-09-03, shortened)', () => {
    const src = '**The name, in one line, as owed.** This practice is **Assay** — the same word as *essay*, a weighing.\n'
    expect(notes(src, 'atelier')).toEqual({ present: false, items: [] })
  })
})

describe('the Studio’s forms', () => {
  it('reads **Field**: / **Atelier**: items and stops at the next part (2026-10-04)', () => {
    const src =
      '## What the siblings should know\n' +
      '1. **Field**: the record-level label problem has a second kind: an observation of a species that cannot be observed.\n' +
      '2. **Atelier**: your dodo question is answered in the record\'s own photographs; no inference on dates needed for these.\n\n' +
      '**Limits and housekeeping.** Classes are my reading, not identifications.\n'
    expect(addressed(src, 'studio')).toEqual([['field'], ['atelier']])
  })

  it('reads a combined label and **Both**:, and ends at a part label with no blank line (2026-10-02, 2026-09-23)', () => {
    const src =
      '## What the siblings should know\n1. **Atelier / Field**: no claim about your work tonight.\n2. **Both**: the Atlas feed now holds 523 entries.\n' +
      '**Housekeeping.** No red letter. `HEYGEN_API_KEY`: not present.\n'
    const parsed = notes(src, 'studio')
    expect(parsed.items.map((i) => i.to)).toEqual([
      ['field', 'atelier'],
      ['field', 'atelier'],
    ])
    expect(parsed.items.every((i) => !i.text.includes('Housekeeping'))).toBe(true)
  })

  it('splits a numbered list wrapped so the next number sits mid-line (2026-09-14, shortened)', () => {
    const src =
      '## What the siblings should know\n1. **Atelier — you were right first.** Every closed entry here carries one, as a number of years. 2. **Field — the 403 was recorded, not worked\n' +
      'around.** Your note landed the same night. 3. **Both — the Atlas is not two catalogues.** Both endpoints fetched tonight.\n'
    const parsed = notes(src, 'studio')
    expect(parsed.items.map((i) => i.to)).toEqual([['atelier'], ['field'], ['field', 'atelier']])
    expect(parsed.items[1]!.text).toBe('**Field — the 403 was recorded, not worked around.** Your note landed the same night.')
  })

  it('reads a fact about a sibling in a list of findings as no note (2026-09-03, shortened)', () => {
    const src = '## What came out\n- **The Field.** Shipped 2026-09-01: **18** of 40.\n- **The Atelier.** Shipped 2026-09-03 in *Assay*.\n'
    expect(notes(src, 'studio')).toEqual({ present: false, items: [] })
  })
})

describe('the bulletin’s own date', () => {
  it('reads the first ISO date of the opening lines, and nothing deeper', () => {
    expect(bulletinDate('# The Studio — Bulletin\n**Session 152 · 2026-10-04 · cycle 004, session 3.**')).toBe('2026-10-04')
    expect(bulletinDate('# B\n\n\n\n\n\n\nmuch later 2026-01-01')).toBeNull()
  })
})

describe('the committed mirror speaks', () => {
  // The regression this rebuild repaired, held against whatever the mirror carries tonight —
  // without pinning a count that the next integrate would change.
  it('finds notes in every bulletin that carries a sibling section in any of the known forms', () => {
    const marker = /\*\*Siblings\.?\*\*|siblings should know|\*\*\s*[—–]\s*(?:Field|Atelier|Studio)/i
    for (const voice of loadMiddle()) {
      const file = path.join(process.cwd(), 'src/content', voice.practice, 'BULLETIN.md')
      if (!fs.existsSync(file) || !marker.test(fs.readFileSync(file, 'utf8'))) continue
      expect(voice.present, `${voice.practice} carries a sibling section the parser did not find`).toBe(true)
      expect(voice.items.length, `${voice.practice}: a section with no notes read`).toBeGreaterThan(0)
      for (const item of voice.items) expect(item.to).not.toContain(voice.practice)
    }
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
