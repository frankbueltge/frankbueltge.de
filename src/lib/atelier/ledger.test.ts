// The closing ledger, checked twice: once against hand-written fixtures for each shape the
// committed archive actually contains, and once against the REAL DECISION.md files — because the
// figure's whole claim is "this is what the record says", and a fixture can only prove the parser
// works, never that it is reading the practice's own words.
//
// The coverage numbers below are deliberately exact. If a new line lands with a ledger, this test
// fails and someone looks at the figure — which is the point: the alternative is a figure that
// quietly starts printing "the record carries no closing ledger" over records that have one.
import { existsSync, readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { firstSentence, lineIdFromPath, readClosingLedger, readLedgerIndex, unwrap } from './ledger'

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))
const PROJECTS = `${ROOT}src/content/atelier/projects`

/** The real records, read the way the component's glob hands them over: absolute repo path → raw. */
function realDecisions(): Record<string, string> {
  const out: Record<string, string> = {}
  for (const dir of readdirSync(PROJECTS)) {
    const path = `${PROJECTS}/${dir}/DECISION.md`
    try {
      out[`/src/content/atelier/projects/${dir}/DECISION.md`] = readFileSync(path, 'utf8')
    } catch {
      // no DECISION.md — a line that has not been decided; absent by design, not an error
    }
  }
  return out
}

describe('unwrap is the only transformation, and it is reversible by eye', () => {
  it('turns the record’s hard wraps into single spaces and changes nothing else', () => {
    expect(unwrap('Budget closed at 2 of ≤ 4 ticks (initiation +\nthis Expose), 0 EUR.')).toBe(
      'Budget closed at 2 of ≤ 4 ticks (initiation + this Expose), 0 EUR.',
    )
  })

  it('keeps every character that is not a line wrap — no case, dash or ellipsis tidying', () => {
    const gnarly = '“by agreement among the authors” — 0 EUR; ≤ 4 ticks … kept as-is.'
    expect(unwrap(gnarly)).toBe(gnarly)
  })
})

describe('firstSentence', () => {
  it('cuts at the first sentence end', () => {
    expect(firstSentence('ACTIVE-project capacity returns to 0 of 2. The next tick initiates.')).toBe(
      'ACTIVE-project capacity returns to 0 of 2.',
    )
  })

  it('returns the whole text when it holds no sentence break', () => {
    expect(firstSentence('capacity returns to 0 of 2')).toBe('capacity returns to 0 of 2')
  })
})

describe('lineIdFromPath', () => {
  it('reads the line id out of a glob key', () => {
    expect(lineIdFromPath('/src/content/atelier/projects/2026-07-20-retraction-signature/DECISION.md')).toBe(
      '2026-07-20-retraction-signature',
    )
  })
})

describe('the three shapes the committed archive really contains', () => {
  it('reads a Standing paragraph that carries its own budget sentence', () => {
    const raw = [
      '**What is preserved.** SCORE.md, TRACE.md ticks 1–3, this decision.',
      '',
      '**Standing.** ACTIVE-project capacity returns to 0 of 2. Budget closed at 3 of ≤ 6 ticks,',
      '0 EUR, 0 full-text extractions.',
      '',
    ].join('\n')
    const l = readClosingLedger(raw, 'a-line', 'src/x/DECISION.md')!
    expect(l.standing).toBe(
      'ACTIVE-project capacity returns to 0 of 2. Budget closed at 3 of ≤ 6 ticks, 0 EUR, 0 full-text extractions.',
    )
    expect(l.cost).toBe('Budget closed at 3 of ≤ 6 ticks, 0 EUR, 0 full-text extractions.')
    expect(l.costShape).toBe('budget-line')
    expect(l.gutter).toBe('Budget closed at 3 of ≤ 6 ticks, 0 EUR, 0 full-text extractions.')
  })

  it('does not print the budget sentence twice when it already sits inside the standing block', () => {
    const raw = '**Standing.** Capacity returns to 0 of 2. Budget closed at 3 ticks, 0 EUR.\n'
    const l = readClosingLedger(raw, 'a-line', 'src/x/DECISION.md')!
    expect(l.full).toBe('Capacity returns to 0 of 2. Budget closed at 3 ticks, 0 EUR.')
  })

  it('joins a standing block and a budget sentence that live apart', () => {
    const raw = [
      'Closed by the practice’s own judgement. Four ticks in one day: initiation (T-001),',
      'judge (T-004). Budget closed at 4 ticks, 0 EUR; full-text extraction used once.',
      '',
      '**Standing.** ACTIVE-project capacity returns to 0 of 2.',
      '',
    ].join('\n')
    const l = readClosingLedger(raw, 'a-line', 'src/x/DECISION.md')!
    expect(l.full).toBe(
      'ACTIVE-project capacity returns to 0 of 2. Budget closed at 4 ticks, 0 EUR; full-text extraction used once.',
    )
    expect(l.gutter).toBe('Budget closed at 4 ticks, 0 EUR; full-text extraction used once.')
  })

  it('reads a "## Standing" section as well as an inline "**Standing.**" label', () => {
    const raw = '## Standing\n\nACTIVE-project capacity returns to 0 of 2. Budget closed at 2 ticks.\n'
    const l = readClosingLedger(raw, 'a-line', 'src/x/DECISION.md')!
    expect(l.standing).toBe('ACTIVE-project capacity returns to 0 of 2. Budget closed at 2 ticks.')
    expect(l.cost).toBe('Budget closed at 2 ticks.')
  })

  it('reads the older checklist template’s resource bullet, stem and "Yes:" dropped', () => {
    const raw = [
      '- Are rights acceptable? — Yes.',
      '- Is resource use within bounds? — Yes: 3 of ≤ 6 ticks, 1 day of ≤ 21, 0 EUR; no',
      '  shared full-text-extraction budget consumed (direct fetch sufficed).',
      '',
    ].join('\n')
    const l = readClosingLedger(raw, 'a-line', 'src/x/DECISION.md')!
    expect(l.standing).toBeNull()
    expect(l.cost).toBe(
      '3 of ≤ 6 ticks, 1 day of ≤ 21, 0 EUR; no shared full-text-extraction budget consumed (direct fetch sufficed).',
    )
    expect(l.costShape).toBe('resource-bullet')
  })

  it('returns null rather than inventing a zero when the record states nothing', () => {
    const raw = '# Project decision\n\n**Decision:** KILL\n\n**Rationale:** an infrastructure fixture.\n'
    expect(readClosingLedger(raw, 'a-line', 'src/x/DECISION.md')).toBeNull()
  })
})

describe('the real records — the ledger says what the practice wrote, or it says nothing', () => {
  const files = realDecisions()
  const index = readLedgerIndex(files)

  it('finds the records that exist and does not invent one for the line that has none', () => {
    // Structural, not a fixed total. A line closing upstream is the practice working, not
    // drift — but a hard "11" here failed the integrate gate for six consecutive runs on
    // 2026-08-01, once negative-parallax and sixty-cases-blind landed their decisions, and
    // a gate that blocks publication on normal growth stops being read. What must hold is
    // FIDELITY: the helper sees exactly the DECISION.md files on disk and invents none for
    // the lines that carry none (today that is put-back-on-the-map, still ACTIVE).
    // The ledger-COVERAGE assertions below stay exact on purpose — those guard what the
    // figure prints, which is the tripwire this file's header is actually about.
    const key = (dir: string) => `/src/content/atelier/projects/${dir}/DECISION.md`
    const lines = readdirSync(PROJECTS, { withFileTypes: true })
      .filter((e) => e.isDirectory())
      .map((e) => e.name)
    const onDisk = lines.filter((d) => existsSync(`${PROJECTS}/${d}/DECISION.md`))
    expect(Object.keys(files).sort()).toEqual(onDisk.map(key).sort())
    for (const d of lines.filter((d) => !onDisk.includes(d))) {
      expect(files[key(d)], `${d} has no DECISION.md and must stay absent`).toBeUndefined()
    }
  })

  it('reads a closing ledger from exactly the seven records that carry one', () => {
    expect(Object.keys(index).sort()).toEqual([
      '2026-07-18-name-test',
      '2026-07-19-mach-ancestor',
      '2026-07-19-null-island',
      '2026-07-20-retraction-signature',
      '2026-07-20-vegetative-em',
      '2026-07-21-untested-second',
      '2026-07-22-unmoved-ground',
    ])
  })

  it('leaves the four records without one absent — an honest gap, not an empty string', () => {
    for (const id of [
      '2026-07-18-gate-rehearsal',
      '2026-07-23-negative-parallax',
      '2026-07-24-kartographie-statt-kopie',
      '2026-07-25-signature-in-the-world',
    ]) {
      expect(index[id], `${id} should carry no ledger`).toBeUndefined()
    }
  })

  it('every word it returns is in the file it names', () => {
    for (const [id, ledger] of Object.entries(index)) {
      const raw = files[`/${ledger.source}`]
      expect(raw, `${id}: source path does not resolve`).toBeTruthy()
      const flat = unwrap(raw)
      for (const [field, value] of [
        ['standing', ledger.standing],
        ['cost', ledger.cost],
        ['gutter', ledger.gutter],
      ] as const) {
        if (!value) continue
        expect(flat.includes(value), `${id}: ${field} is not verbatim in ${ledger.source}`).toBe(true)
      }
    }
  })

  it('reads the kill this practice is known by, to the character', () => {
    const l = index['2026-07-20-retraction-signature']
    expect(l.cost).toBe(
      'Budget closed at 2 of ≤ 4 ticks (initiation + this Expose), 0 EUR, 0 full-text extractions.',
    )
    expect(l.gutter).toBe(l.cost)
    expect(l.standing?.startsWith('ACTIVE-project capacity returns to 0 of 2.')).toBe(true)
  })

  it('falls back to the standing sentence where a line closed without a spend to report', () => {
    // mach-ancestor was closed by team direction, not by the practice running out of budget.
    const l = index['2026-07-19-mach-ancestor']
    expect(l.cost).toBeNull()
    expect(l.costShape).toBeNull()
    expect(l.gutter).toBe('ACTIVE-project capacity returns to 0 of 2.')
  })

  it('keeps every gutter line short enough to be a gutter line', () => {
    for (const [id, ledger] of Object.entries(index)) {
      expect(ledger.gutter.length, `${id}: gutter line is a paragraph, not a line`).toBeLessThan(200)
    }
  })
})
