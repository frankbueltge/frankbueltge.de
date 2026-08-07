// src/lib/ecology/anatomy.test.ts — the anatomy's honesty harness.
//
// Every line the figure shows is a quote from a committed file. This test reads those files and
// fails if a quote is no longer in them, so a practice that amends its own constitution cannot
// leave a stale sentence standing on the site under its name. That risk is not hypothetical: the
// site's own CLAUDE.md carries it as a warning ("/atelier beschrieb am 24.07. noch Protocol v4,
// während die Praxis auf v5 lief"), and Ulysses' README still announces v4 today while its
// protocol is v5.
//
// Whitespace is normalised on both sides before comparing. The protocols are hard-wrapped
// markdown, so a quotation of two clauses spans a line break in the file and not in the figure;
// what is being asserted is that the WORDS are still there, in order, not that the source still
// wraps them at the same column.

import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { MIDDLE, PRACTICES, allQuotes, practiceById, shapeOf } from './anatomy'

const ROOT = fileURLToPath(new URL('../../../', import.meta.url))
const read = (p: string): string => readFileSync(`${ROOT}${p}`, 'utf8')

/** Collapse every run of whitespace to one space — see the header for why. */
const flat = (s: string): string => s.replace(/\s+/g, ' ').trim()

const sources = new Map<string, string>()
const sourceOf = (p: string): string => {
  if (!sources.has(p)) sources.set(p, flat(read(p)))
  return sources.get(p) as string
}

describe('every line the anatomy shows is still in the file it came from', () => {
  const quotes = allQuotes()

  it('has quotes to check', () => {
    expect(quotes.length).toBeGreaterThan(20)
  })

  /** A source in a sibling repository, which this test cannot open. Labelled, never silently
   *  skipped — the same form the notation register uses for pointers outside this repo. */
  const isExternal = (source: string): boolean => source.includes(':')

  it.each(quotes.filter((q) => !isExternal(q.quote.source)))('$where is still in its source', ({ quote, where }) => {
    expect(
      sourceOf(quote.source),
      `${where} quotes ${quote.source}, which no longer contains: "${quote.text}"`,
    ).toContain(flat(quote.text))
  })

  it('quotes only the practices’ own mirrored constitutions, the federated one, or a labelled sibling', () => {
    for (const { quote } of quotes) {
      const ok =
        /^src\/content\/(atelier|field|studio)\/PROTOCOL\.md$/.test(quote.source) ||
        quote.source.startsWith('docs/') ||
        /^[a-z-]+:[\w./-]+$/.test(quote.source)
      expect(ok, `${quote.source} is neither an in-repo path nor a labelled sibling pointer`).toBe(true)
    }
  })

  it('keeps the unverifiable quotes few, and labelled as such', () => {
    const external = quotes.filter((q) => isExternal(q.quote.source))
    // One today: the ecology's own standing question, which lives in the sibling repository. If
    // this grows, the figure is drifting towards claims nothing here can check.
    expect(external.length).toBeLessThanOrEqual(2)
    for (const { quote } of external) expect(quote.source).toMatch(/^research-ecology:/)
  })
})

describe('the three practices are drawn in one frame and three vocabularies', () => {
  it('asks the same five questions of each', () => {
    for (const p of PRACTICES) {
      expect(p.protocolTitle.text.length, `${p.id} has no protocol title`).toBeGreaterThan(10)
      expect(p.identity.text.length, `${p.id} has no identity line`).toBeGreaterThan(10)
      expect(p.inviolable.text.length, `${p.id} names no inviolable`).toBeGreaterThan(10)
      expect(p.unit.text.length, `${p.id} names no unit of work`).toBeGreaterThan(10)
      expect(p.refuses.text.length, `${p.id} refuses nothing`).toBeGreaterThan(10)
    }
  })

  it('never gives two practices the same stage vocabulary — that would be the layout talking', () => {
    const chains = PRACTICES.map((p) => p.stages.map((s) => s.label).join('|'))
    expect(new Set(chains).size).toBe(PRACTICES.length)
  })

  it('lets the chains differ in length, because they do', () => {
    const lengths = PRACTICES.map((p) => p.stages.length)
    expect(new Set(lengths).size).toBeGreaterThan(1)
  })

  it('gives every practice at least one gate — nothing here publishes unjudged', () => {
    for (const p of PRACTICES) {
      expect(shapeOf(p).gate, `${p.id} has no gate`).toBeGreaterThan(0)
    }
  })

  it('puts the human publication gate on exactly one practice, and names which', () => {
    const withHuman = PRACTICES.filter((p) => shapeOf(p).human > 0).map((p) => p.id)
    expect(withHuman).toEqual(['atelier'])
  })

  it('leaves the atelier without a named cast, and names no role a protocol has dropped', () => {
    expect(practiceById('atelier')?.cast).toEqual([])
    // The other two do name theirs, and that difference is the finding. This guard used to be a
    // count (`> 3`), and the roster cull of 2026-08-08 broke it by being right: Meridian went from
    // five roles to two, Ensemble lost the Builder and the Archivist. The count was never the
    // invariant — "rather than inventing one" was. So the check is now that every name the figure
    // shows is a name that practice's own protocol still carries. That survives any future cull,
    // and it catches the failure the count was only standing in for: a role kept on the site after
    // the practice stopped convening it.
    for (const id of ['field', 'studio'] as const) {
      const cast = practiceById(id)?.cast ?? []
      expect(cast.length, `${id} shows no cast at all`).toBeGreaterThan(0)
      const protocol = sourceOf(`src/content/${id}/PROTOCOL.md`)
      for (const role of cast) {
        expect(protocol, `${id} shows "${role}", which its protocol no longer names`).toContain(role)
      }
    }
  })

  it('ends every chain at the site’s own gate, not at a deploy', () => {
    for (const p of PRACTICES) {
      const last = p.stages[p.stages.length - 1]
      expect(last.kind, `${p.id} does not end at a landing step`).toBe('land')
      expect(last.label).toMatch(/integrate$/)
    }
  })
})

describe('the contact zone keeps its refusals', () => {
  it('offers no success state — the lifecycle ends in silence as legitimately as in agreement', () => {
    expect(MIDDLE.lifecycle).toContain('ignored')
    expect(MIDDLE.lifecycle).toContain('unresolved')
    expect(MIDDLE.lifecycle).not.toContain('resolved')
    expect(MIDDLE.lifecycle).not.toContain('success')
  })

  it('carries the ecology’s own diagnosis of itself rather than a claim of health', () => {
    expect(MIDDLE.jointInquiry.standingQuestion.text).toContain('is not yet a federation')
  })
})
