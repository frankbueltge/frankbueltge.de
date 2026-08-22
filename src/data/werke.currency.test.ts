// Does the register still say what the data says? (Frank, 2026-08-22 — after a currency audit
// found thirteen drifted claims on /experiments, seven of them contradicted by files in this
// repo.)
//
// The audit's real finding was not any single number. It was that six of the seven hard errors
// were figures that had been CORRECT on the day they were typed and were broken by the work
// continuing — every one of them derivable from a committed snapshot the page already ships.
// A comment saying "keep this in sync" would have drifted with them, so this file is the same
// move the house made for the USP duty on 2026-08-09: the obligation becomes a test.
//
// What belongs in here: an assertion that can only fail when the WORLD moved, not when someone
// rephrased a sentence. Each one therefore reads a committed file, and each failure message says
// which file to look at and what the register would have to say instead. Prose checks are kept
// to phrases that were literally false (never to house style), and they check both locale halves
// because both ship in the bundle.
import { describe, it, expect } from 'vitest'
import { readFileSync, readdirSync } from 'node:fs'
import { WERKE } from './werke'
import { AGENTS } from '@/lib/society/agents'

const read = (path: string) => JSON.parse(readFileSync(path, 'utf8'))
const newest = (dir: string) => {
  const files = readdirSync(dir).filter((f) => f.endsWith('.json')).sort()
  return `${dir}/${files[files.length - 1]}`
}

/** Both locale halves of one entry's description, plus its subtitle — everything the shelf ships. */
function prose(id: string): string {
  const werk = WERKE.find((w) => w.id === id)
  if (!werk) throw new Error(`werke.currency: no entry "${id}"`)
  return [werk.description.de, werk.description.en, werk.subtitle.de, werk.subtitle.en].join('\n')
}

describe('one sentence per entry', () => {
  it('keeps no diverging German copy on the shelf', () => {
    // The audit's second structural finding: the `de` halves carried the same false numbers as
    // the English ones, unrendered on an EN-only site since 2026-07-16. Two wordings mean two
    // things to keep true, and only one of them is ever read.
    for (const werk of WERKE.filter((w) => w.line)) {
      expect(werk.description.de, `${werk.id}: shelf entries carry one sentence, in both keys`).toBe(
        werk.description.en,
      )
    }
  })
})

describe('correction — the revision share', () => {
  it('does not claim every month was revised down while the data says otherwise', () => {
    const { systematic } = read('src/data/revision/latest.json')
    if (systematic.revised_down !== systematic.months) {
      expect(
        prose('correction'),
        `src/data/revision/latest.json says ${systematic.revised_down} of ${systematic.months} months were revised down, so the register may not promise all of them`,
      ).not.toMatch(/every one of the last/i)
    }
  })
})

describe('beifang — the vantage points', () => {
  it('claims two vantage points only while both actually deliver', () => {
    const census = read(newest('src/content/beifang/2026'))
    const delivering = Object.values(census.vantages as Record<string, { results: unknown[] }>).filter(
      (v) => (v.results?.length ?? 0) > 0,
    ).length
    if (delivering < 2) {
      expect(
        prose('beifang'),
        `the newest census (${newest('src/content/beifang/2026')}) has data from ${delivering} vantage point(s); the register may not advertise two`,
      ).not.toMatch(/two vantage points/i)
    }
  })
})

describe('protokoll — the source count', () => {
  it('names no source count at all, because the count moves', () => {
    // It went from twelve to thirteen on 2026-06-27 and sat wrong in the subtitle for eight
    // weeks. The register does not need the number; /protocol renders the sources themselves.
    const day = read(newest('src/content/protokoll/2026'))
    const sources = new Set(
      (day.entries as { source?: { name?: string } }[]).map((e) => e.source?.name).filter(Boolean),
    )
    expect(sources.size).toBeGreaterThan(0)
    expect(
      prose('protokoll'),
      `the newest committed day has ${sources.size} distinct sources; the register must not name a count`,
    ).not.toMatch(/\b(ten|eleven|twelve|thirteen|fourteen|fifteen|sixteen|\d{1,2})\s+(open|citable|offene)/i)
  })
})

describe('society — the agent roster', () => {
  it('names no agent count, or names the one the simulation has', () => {
    const written = /\b(twenty|twenty-five|twenty-nine|thirty|thirty-one|\d{2})[\s-]?\w*\s+agents\b/i
    expect(
      prose('society'),
      `AGENTS.length is ${AGENTS.length} and has moved twice; the shelf should describe the roster, not count it`,
    ).not.toMatch(written)
  })
})

describe('spielraum — the newest disclosure', () => {
  it('does not pin the consumption growth to a single disclosed year', () => {
    const register = read('src/data/spielraum/register.json')
    const growth = register.companies.google.consumption.growth_pct as { period: string; value: number }[]
    const latest = growth[growth.length - 1]
    expect(latest.value).toBeGreaterThan(0)
    // A growth figure typed into prose is wrong the day the next report lands — which is exactly
    // how "27%" survived the 2025 disclosure of 37%.
    expect(
      prose('spielraum'),
      `the newest disclosed growth is ${latest.value}% (${latest.period}); the register states the floor rule instead of a year's figure`,
    ).not.toMatch(/grew\s+\d+\s?%|by\s+\d+\s?%\s+in\s+a\s+single\s+year/i)
  })
})

// The next two guards are absolute rather than tolerance-based, and deliberately so. A check
// like "within 15% of today's snapshot" would have gone red only on quiet news days — a gate that
// fails at the weekend and passes on Monday teaches people to re-run CI, not to fix the text. Both
// volumes swing about twofold across the committed days (articles_scanned 54k–116k; rewritten
// headlines 33k–54k), which is the real argument: a figure that moves that much cannot be stated
// in static prose at all, at any tolerance.

describe('invoked-past — the daily volume', () => {
  it('states no exact article figure, because the daily volume swings twofold', () => {
    const { stats } = read('src/data/invoked/latest.json')
    expect(stats.articles_scanned).toBeGreaterThan(0)
    expect(
      prose('invoked-past'),
      `src/data/invoked/latest.json scanned ${stats.articles_scanned} today, and that count runs from about 54,000 to 116,000 across the committed days; the register may only give an order of magnitude`,
    ).not.toMatch(/\d{2,3},\d{3}/)
  })
})

describe('redaction — the recrawl volume', () => {
  it('states no exact headline figure for a count that ranges by half', () => {
    const world = read(newest('src/data/redaction/world'))
    expect(world.gdg.status_counts.PAGE_TITLECHANGE).toBeGreaterThan(0)
    expect(
      prose('redaction'),
      `the newest world file counted ${world.gdg.status_counts.PAGE_TITLECHANGE} rewritten headlines, in a committed range of roughly 33k–54k; the register says "tens of thousands" instead`,
    ).not.toMatch(/~?\d{2,3}k\b/i)
  })
})

describe('round-number — how often the test is wrong', () => {
  it('does not say "just as suspicious" while the false-positive rate is nowhere near certain', () => {
    const { series } = read('src/data/round-number/latest.json')
    const rates = (series as { control?: { false_positive_rate?: number } }[])
      .map((s) => s.control?.false_positive_rate)
      .filter((r): r is number => typeof r === 'number')
    const worst = Math.max(...rates)
    if (worst < 0.9) {
      expect(
        prose('round-number'),
        `the highest same-size false-positive rate today is ${worst}; "just as suspicious" claims certainty the data does not show`,
      ).not.toMatch(/just as suspicious/i)
    }
  })
})

describe('balance — the country floor', () => {
  it('does not promise every country while a pool floor gates the day', () => {
    const day = read(newest('src/data/balance'))
    const floor: number | undefined = day.method?.min_pool
    if (floor && floor > 0) {
      expect(
        prose('balance'),
        `method.min_pool is ${floor}, so only ${day.countries.length} countries entered the newest day; the register may not say "for each country"`,
      ).not.toMatch(/for each country/i)
    }
  })
})
