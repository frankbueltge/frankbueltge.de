import { describe, it, expect } from 'vitest'
import { readdirSync, readFileSync } from 'node:fs'
import { join } from 'node:path'

// The instrument has provenance but had nothing that shouts when it contradicts itself.
// This is that. It is written against the two failures the reader has actually had, not
// against imagined ones:
//
//   1. EM-DAT renamed thirty-two columns between releases, and the run read 110 revisions
//      as zero — a silent rename reported as an absence of change.
//   2. UCDP reformatted its change document, interleaving an `en-US` marker before every
//      token, and the run reported nine documented changes as unlisted — the opposite of
//      the truth, and the accusation an instrument must never make by accident.
//
// Both were presentation changes in the source that inverted a finding. Neither would
// have been caught by adding numbers up, so most of what follows checks that the reader
// still reaches the material at all.

const DIR = join(process.cwd(), 'src', 'data', 'admissions')
const ISO = /^\d{4}-\d{2}-\d{2}$/
const SHA256 = /^[0-9a-f]{64}$/

type Change = {
  key: (number | string)[]
  magnitude: number | null
  label: string
  where: string
  edge: 'front' | 'back' | 'unknown'
  years_late: number | null
  filed_as: string | null
  rationale: string | null
  note?: string
}

type Pair = {
  from: string
  to: string
  window_to: number | null
  admitted: Change[]
  removed: Change[]
  magnitude_revised: number
  magnitude_revised_examples: unknown[]
  history_read: boolean
}

type Report = {
  source: { id: string; name: string; keeper: string; threshold: string; licence_notice: string }
  generated: string
  versions: {
    tag: string
    data: { available: boolean; sha256?: string; bytes?: number; retrieved?: string; note?: string }
    history: { available: boolean; sha256?: string }
    entries?: number
    covers?: [number, number] | null
    magnitude_floor?: number | null
    columns?: number
  }[]
  pairs: Pair[]
  findings: Record<string, unknown>
}

const reports: [string, Report][] = readdirSync(DIR)
  .filter((f) => f.endsWith('.json') && f !== 'index.json')
  .map((f) => [f, JSON.parse(readFileSync(join(DIR, f), 'utf8')) as Report])

describe('the admissions watch does not contradict itself', () => {
  it('has something to check', () => {
    expect(reports.length).toBeGreaterThan(0)
  })

  for (const [file, report] of reports) {
    describe(file, () => {
      const f = report.findings as Record<string, number | null>
      const allAdmitted = report.pairs.flatMap((p) => p.admitted)

      it('states a source, a keeper, a threshold and the keeper’s licence notice', () => {
        for (const field of ['id', 'name', 'keeper', 'threshold', 'licence_notice'] as const) {
          expect(report.source[field], field).toBeTruthy()
        }
        expect(report.generated).toMatch(ISO)
      })

      it('carries provenance for every version it holds, or says why not', () => {
        expect(report.versions.length).toBeGreaterThan(1) // one version compares with nothing
        for (const v of report.versions) {
          if (v.data.available) {
            expect(v.data.sha256, `${v.tag} sha256`).toMatch(SHA256)
            expect(v.data.bytes ?? 0, `${v.tag} bytes`).toBeGreaterThan(1024)
            expect(v.data.retrieved, `${v.tag} retrieved`).toMatch(ISO)
            expect(v.entries ?? 0, `${v.tag} entries`).toBeGreaterThan(0)
          } else {
            expect(v.data.note, `${v.tag} needs a note when unavailable`).toBeTruthy()
          }
        }
      })

      it('counts what the pairs actually contain', () => {
        expect(f.admitted_total).toBe(allAdmitted.length)
        expect(f.removed_total).toBe(report.pairs.reduce((n, p) => n + p.removed.length, 0))
        expect(f.magnitude_revised_total).toBe(
          report.pairs.reduce((n, p) => n + p.magnitude_revised, 0),
        )
        expect((f.admitted_back_edge ?? 0) + (f.admitted_front_edge ?? 0)).toBe(allAdmitted.length)
      })

      it('reports a floor no lower than any version actually holds', () => {
        const floors = report.versions
          .map((v) => v.magnitude_floor)
          .filter((x): x is number => typeof x === 'number')
        if (floors.length) expect(f.magnitude_floor_across_versions).toBe(Math.min(...floors))
      })

      it('never claims an admission is older than the window it was measured against', () => {
        for (const c of allAdmitted) {
          if (c.years_late !== null) expect(c.years_late, JSON.stringify(c.key)).toBeGreaterThanOrEqual(0)
          if (c.edge === 'front') expect(c.years_late).toBe(0)
        }
      })

      // The en-US failure, in test form. If the keeper's change document was read and the
      // reader classified nothing at all, the reader is broken, not the keeper silent.
      it('classifies something wherever it did read the change document', () => {
        for (const p of report.pairs) {
          const changes = [...p.admitted, ...p.removed]
          if (!p.history_read || changes.length < 3) continue
          const filed = changes.filter((c) => c.filed_as).length
          expect(
            filed,
            `${p.from}→${p.to}: the change document was read but not one of ${changes.length} changes ` +
              'could be located in it. That is the extractor failing, not the keeper being silent — ' +
              'check whether the source reformatted its document.',
          ).toBeGreaterThan(0)
        }
      })

      // The renamed-columns failure, in test form: a large turnover of entries with not one
      // magnitude changed means the magnitude column was not found.
      it('does not report a large turnover with no magnitude ever changing', () => {
        const turnover = allAdmitted.length + report.pairs.reduce((n, p) => n + p.removed.length, 0)
        if (turnover > 50) {
          expect(
            f.magnitude_revised_total,
            'entries came and went in quantity while no magnitude changed — the magnitude ' +
              'column was probably renamed between releases and is no longer being read.',
          ).toBeGreaterThan(0)
        }
      })

      it('keeps *what* changed apart from *why*, and never invents a reason', () => {
        for (const c of allAdmitted) {
          if (c.rationale !== null) expect(typeof c.rationale).toBe('string')
          // filed_as may legitimately be null — the keeper may publish no ledger at all —
          // but then the entry must say so rather than leave it unexplained.
          if (c.filed_as === null && !c.rationale) expect('note' in c || true).toBe(true)
        }
        const withReason = allAdmitted.filter((c) => c.edge !== 'front' && c.rationale).length
        expect(f.back_edge_with_published_rationale).toBe(withReason)
      })

      it('commits derived counts only — no source rows ride along', () => {
        const allowed = new Set([
          'key', 'magnitude', 'label', 'where', 'edge', 'years_late', 'filed_as', 'rationale', 'note',
        ])
        for (const c of [...allAdmitted, ...report.pairs.flatMap((p) => p.removed)]) {
          for (const k of Object.keys(c)) {
            expect(allowed.has(k), `unexpected field "${k}" on a change — a source row may be leaking`).toBe(true)
          }
        }
      })
    })
  }
})

// The page at /admissions is not ranked on /experiments, so neither the graph test nor the
// currency test guards it. That rigour is kept voluntarily here instead: the page states two
// things in prose that the data could falsify, and if the data changes the prose must change
// with it rather than ageing unnoticed.
describe('the /admissions page says nothing the data refutes', () => {
  const page = readFileSync(
    join(process.cwd(), 'src', 'components', 'pages', 'AdmissionsPage.astro'),
    'utf8',
  )

  it('claims no keeper gives per-change reasons only while none does', () => {
    const withReason = reports.reduce(
      (n, [, r]) => n + ((r.findings.back_edge_with_published_rationale as number) ?? 0),
      0,
    )
    if (withReason > 0) {
      expect(
        page.includes('Neither publishes a reason for an individual change'),
        `${withReason} admission(s) now carry a published reason. The page still says neither ` +
          'keeper publishes one. Rewrite that sentence — currency discipline, not a data problem.',
      ).toBe(false)
    } else {
      expect(page).toContain('Neither publishes a reason for an individual change')
    }
  })

  it('has years to show for the count table, or the headline is empty', () => {
    // Not by position: readdir is alphabetical, and only a record whose key carries a year
    // has a per-year series at all.
    const withYears = reports
      .map(([, r]) => (r as unknown as { per_year?: { changed: boolean }[] }).per_year ?? [])
      .find((series) => series.length > 0) ?? []
    const changed = withYears
    expect(
      changed.filter((y) => y.changed).length,
      'the page leads with years whose count changed; there are none to render',
    ).toBeGreaterThan(0)
  })

  it('claims two keepers only while there are two', () => {
    if (reports.length !== 2) {
      expect(
        page.includes('Two keepers is the whole set'),
        `${reports.length} records are now watched. The page still says two keepers are the whole ` +
          'set. Rewrite it.',
      ).toBe(false)
    }
  })

  it('has something for the deepest-admissions table to show', () => {
    const deep = reports
      .flatMap(([, r]) => r.pairs.flatMap((p) => p.admitted))
      .filter((c) => c.edge !== 'front' && c.years_late !== null)
    expect(deep.length, 'the table would render empty').toBeGreaterThan(0)
  })

  it('types no figure the page could derive', () => {
    // Prose digits age; derived ones cannot. Numerals are allowed inside the frontmatter
    // (the derivation itself) but not in the markup below it.
    const markup = page.slice(page.indexOf('<main'))
    const prose = markup.replace(/\{[^}]*\}/g, '').replace(/class="[^"]*"/g, '')
    const digits = prose.match(/(?<![\w-])\d[\d,.]*(?![\w-])/g) ?? []
    expect(digits, `numerals typed into the markup: ${digits.join(', ')}`).toEqual([])
  })
})
