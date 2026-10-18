// The nightly line's research project, read off the works' own records.
//
// Two kinds of test. The parsers are held against fixtures written in the line's own phrasings, so a
// change to a regular expression is caught here and not on the page. The real mirror is held loosely
// wherever a practice's delivery runs this suite (the nightly integrate, the deploy), because there a
// work that no longer parses was changed by the line, the page already shows it without the missing
// part, and the house must not turn the line's delivery red over it. Locally and in a pull request's
// CI the mirror is held strictly: that is where somebody changes the reader.
import { existsSync, readFileSync } from 'node:fs'
import { describe, expect, it } from 'vitest'
import { forkedWorks } from '@/lib/engines/nightly-line'
import {
  PROJECT_START,
  chosenResult,
  figureAltOf,
  lessonOf,
  operationIn,
  ordinal,
  project,
  readStep,
  sentencesOf,
  sessionOf,
  svgSize,
} from './project'

const STRICT = !process.env.GITHUB_WORKFLOW || process.env.GITHUB_WORKFLOW === 'CI'

describe('ordinals, as the line writes them', () => {
  it('reads words, compounds and digits', () => {
    expect(ordinal('First')).toBe(1)
    expect(ordinal('third')).toBe(3)
    expect(ordinal('Twelfth')).toBe(12)
    expect(ordinal('Nineteenth')).toBe(19)
    expect(ordinal('Twentieth')).toBe(20)
    expect(ordinal('Twenty-first')).toBe(21)
    expect(ordinal('Twenty-fourth')).toBe(24)
    expect(ordinal('Thirty-seventh')).toBe(37)
    expect(ordinal('Ninety-ninth')).toBe(99)
    expect(ordinal('25th')).toBe(25)
  })

  it('reads nothing into a word that is not one', () => {
    expect(ordinal('Next')).toBeUndefined()
    expect(ordinal('twenty')).toBeUndefined()
    expect(ordinal('first-second')).toBeUndefined()
  })
})

describe('a project step', () => {
  it('names an experiment by its ordinal, and its operation before the comma', () => {
    const step = readStep(
      'Fifth experiment of the project. Operation: perceiving, the thinnest row (one case, F-166, from The Mould). Takes from The Mould its loop.',
    )
    expect(step).toEqual({ role: 'experiment', number: 5, operation: { label: 'operation', text: 'perceiving' } })
  })

  it('keeps the commas inside brackets', () => {
    expect(readStep('Twenty-fourth experiment of the project. Operation: judging (perceiving, finding a form). It is the event.')).toEqual({
      role: 'experiment',
      number: 24,
      operation: { label: 'operation', text: 'judging (perceiving, finding a form)' },
    })
  })

  it('reads a strand to its full stop, because its commas join strands', () => {
    expect(readStep('First experiment of the project. Strand: reading at volume, and verification as a material. It asks.').operation).toEqual({
      label: 'strand',
      text: 'reading at volume, and verification as a material',
    })
  })

  it('reads a seventh night, the position it is evidence for, and the operation it names in a sentence', () => {
    expect(
      readStep(
        'Seventh-night evidence for works/position-2026-10-18.md, not a numbered experiment. The operation is judging: whether a habit recurs.',
      ),
    ).toEqual({
      role: 'seventh night',
      operation: { label: 'operation', text: 'judging' },
      position: 'works/position-2026-10-18.md',
    })
    expect(readStep('Seventh-night evidence for works/position-2026-10-07.md. The operation it bears on is erring: where.').operation).toEqual({
      label: 'operation',
      text: 'erring',
    })
  })

  it('keeps the position an experiment also stands as evidence for', () => {
    const step = readStep(
      "Third experiment of the project. Operations: varying and judging, the two not yet asked. It is also the seventh night's evidence for works/position-2026-10-04.md.",
    )
    expect(step).toEqual({
      role: 'experiment',
      number: 3,
      operation: { label: 'operations', text: 'varying and judging' },
      position: 'works/position-2026-10-04.md',
    })
  })

  it('reads the number when it comes after the word, and an unnumbered experiment as one', () => {
    expect(readStep('Experiment 25 of the project. Operation: erring.')).toMatchObject({ role: 'experiment', number: 25 })
    expect(readStep('Next experiment of the project.')).toEqual({ role: 'experiment' })
  })

  it('calls anything else a work of the project, and an empty step nothing more', () => {
    expect(readStep('A reading night.')).toEqual({ role: 'other' })
    expect(readStep(undefined)).toEqual({ role: 'other' })
    expect(readStep('')).toEqual({ role: 'other' })
    expect(operationIn('No label here.')).toBeUndefined()
  })

  it('reads the session a work is signed with', () => {
    expect(sessionOf('Ulysses (the nightly line), Session 135')).toBe(135)
    expect(sessionOf('Ulysses')).toBeUndefined()
    expect(sessionOf(undefined)).toBeUndefined()
  })
})

describe('sentences', () => {
  it('ends a sentence past closing emphasis and quotation marks', () => {
    expect(sentencesOf('**1,198 notices (16.5 %) say nothing but *withdrawn*.** These are verdicts.')).toEqual([
      '**1,198 notices (16.5 %) say nothing but *withdrawn*.**',
      'These are verdicts.',
    ])
    expect(sentencesOf('It read *"the two terms"*. Then it rang.')).toEqual(['It read *"the two terms"*.', 'Then it rang.'])
  })

  it('does not end one at a decimal, an abbreviation or a lower-case continuation', () => {
    expect(sentencesOf('It fell 4.7 times, e.g. On a day. Next.')).toEqual(['It fell 4.7 times, e.g. On a day.', 'Next.'])
    expect(sentencesOf('See pp. 6 and 17. Done.')).toEqual(['See pp. 6 and 17.', 'Done.'])
    expect(sentencesOf('It asked "why?" and went on. Done.')).toEqual(['It asked "why?" and went on.', 'Done.'])
  })
})

describe('the result, from the work’s own text', () => {
  it('takes the first sentence under the heading "What this taught the project"', () => {
    const md = '# T\n\nText.\n\n## What this taught the project\n\nA machine practice can do x.\nIt then does y.\n\nMore.\n'
    expect(lessonOf(md)).toEqual({ text: 'A machine practice can do x.', from: 'lesson' })
  })

  it('takes it from a paragraph that opens with the words in bold', () => {
    const md = '# T\n\n**What this taught the project.** For this practice, truth does no work. It refutes.\n'
    expect(lessonOf(md)).toEqual({ text: 'For this practice, truth does no work.', from: 'lesson' })
  })

  it('passes over a sentence that only names the operation, which the row shows already', () => {
    expect(lessonOf('## What this taught the project\n\nThe operation is **judging**. A practice corrects a habit.\n')?.text).toBe(
      'A practice corrects a habit.',
    )
    expect(lessonOf("## What this taught the project\n\nThe project's operation here is **judging**. It judged more.\n")?.text).toBe(
      'It judged more.',
    )
  })

  it('reads the first experiment’s findings, which came before the heading was asked for', () => {
    const md = '## What it found\n\n- **1,198 notices say nothing but *withdrawn*.** These are verdicts.\n- **Second.** Next.\n'
    // A finding set wholly in bold loses the bold standing alone, and keeps the emphasis inside it.
    expect(lessonOf(md)).toEqual({ text: '1,198 notices say nothing but *withdrawn*.', from: 'found' })
    expect(lessonOf('## What this taught the project\n\nFor this practice, **looking is a way of stopping.**\n')?.text).toBe(
      'For this practice, **looking is a way of stopping.**',
    )
    expect(lessonOf('## What this taught the project\n\n**One** and **two** are kept.\n')?.text).toBe('**One** and **two** are kept.')
  })

  it('says nothing where the text says nothing', () => {
    expect(lessonOf('# T\n\nNo lesson here.\n')).toBeUndefined()
  })

  it('prefers a result the line chose itself', () => {
    expect(chosenResult({ result: '  One line,\n chosen. ' })).toBe('One line, chosen.')
    expect(chosenResult({ result: 3 })).toBeUndefined()
    expect(chosenResult(undefined)).toBeUndefined()
  })

  it('takes the figure’s alt text and proportions from the work', () => {
    expect(figureAltOf('![Where in the year twelve makers put one record.](figure.svg)')).toBe(
      'Where in the year twelve makers put one record.',
    )
    expect(figureAltOf('![a](other.svg)')).toBeUndefined()
    expect(svgSize('<svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 900 316" font-family="x">')).toEqual({ width: 900, height: 316 })
    expect(svgSize('<svg width="640" height="200.4">')).toEqual({ width: 640, height: 200 })
    expect(svgSize('<div>')).toBeUndefined()
  })
})

describe('the project as the mirror carries it', () => {
  const record = project()

  it('lists every work since the project began, once, and nothing older', () => {
    const since = forkedWorks()
      .filter((w) => w.date >= PROJECT_START)
      .map((w) => w.slug)
      .sort()
    expect(record.works.map((w) => w.slug).sort()).toEqual(since)
    expect(record.works.every((w) => w.date >= PROJECT_START)).toBe(true)
  })

  it('runs newest first', () => {
    const keys = record.works.map((w) => `${w.date}:${String(w.session ?? 0).padStart(5, '0')}`)
    expect([...keys].sort().reverse()).toEqual(keys)
  })

  it('stands on its highest-numbered experiment', () => {
    const numbers = record.experiments.flatMap((w) => (w.number ? [w.number] : []))
    if (numbers.length) expect(record.current?.number).toBe(Math.max(...numbers))
  })

  it('sends every link to something that exists: a face, a text page, the folder', () => {
    for (const w of record.works) {
      if (w.face?.startsWith('/error-as-method/works-html/')) {
        expect(existsSync(`public${w.face}index.html`), w.slug).toBe(true)
      }
      if (w.page) expect(existsSync(`src/data/nightly/works/${w.slug}/work.md`), w.slug).toBe(true)
      expect(w.folder).toBe(`https://github.com/frankbueltge/error-as-method/tree/main/works/${w.slug}`)
      if (w.figure) expect(existsSync(`public${w.figure.src}`), w.slug).toBe(true)
    }
  })

  it('reads the date it began from the first experiment’s own record', () => {
    const first = record.experiments.find((w) => w.number === 1)
    if (first || STRICT) expect(first?.date).toBe(PROJECT_START)
  })

  it('reads every numbered experiment’s result and operation, and every seventh night’s position (strict)', () => {
    if (!STRICT) return
    // Held against the mirror as it stood when this reader was written: twenty-four experiments,
    // every one numbered by its step and carrying the lesson condition 6 asks for.
    expect(record.experiments.length).toBeGreaterThanOrEqual(24)
    const numbers = record.experiments.map((w) => w.number)
    expect(numbers.every((n) => typeof n === 'number')).toBe(true)
    expect(new Set(numbers).size).toBe(numbers.length)
    for (const w of [...record.experiments, ...record.seventhNights]) {
      expect(w.result?.text, `${w.slug} has no result line`).toBeTruthy()
      expect(w.result!.text, w.slug).not.toMatch(/\n/)
      expect(w.operation, `${w.slug} names no operation`).toBeDefined()
      expect(w.session, `${w.slug} is signed with no session`).toBeDefined()
    }
    for (const w of record.seventhNights) expect(w.position, `${w.slug} names no position paper`).toMatch(/^works\/position-/)
    expect(record.positions.length).toBeGreaterThanOrEqual(5)
  })

  it('holds the meta.json it reads to what the mirror committed', () => {
    for (const w of record.works) {
      const meta = JSON.parse(readFileSync(`src/data/nightly/works/${w.slug}/meta.json`, 'utf8'))
      expect(w.title).toBe(meta.title)
      expect(readStep(meta.project_step).number).toBe(w.number)
    }
  })
})
