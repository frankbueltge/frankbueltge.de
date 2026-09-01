import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { buildCycleScoreSvg } from './cycle-score'
import type { ArtifactEntry, CycleState } from './v3'

const CYCLE: CycleState = {
  cycle: 1,
  phase: 'working',
  question: null,
  source: 'defaults',
  opened: '2026-08-30',
  sessionsPerPractice: '3-5',
  defaults: { field: 'a', atelier: 'b', studio: 'c' },
}

const ARTIFACTS: ArtifactEntry[] = [
  { practice: 'field', slug: 'a-door-to-knock-on', date: '2026-09-01', href: '/field/artifacts/cycle-001/2026-09-01-a-door-to-knock-on/' },
  { practice: 'field', slug: 'how-long-a-warning-stands', date: '2026-09-01', href: '/field/artifacts/cycle-001/2026-09-01-how-long-a-warning-stands/' },
  { practice: 'field', slug: 'yield-of-a-loop', date: '2026-08-30', href: '/field/artifacts/cycle-001/2026-08-30-yield-of-a-loop/' },
]

describe('the cycle score', () => {
  it('is deterministic — same inputs, byte-identical drawing', () => {
    expect(buildCycleScoreSvg({ cycle: CYCLE, artifacts: ARTIFACTS })).toBe(
      buildCycleScoreSvg({ cycle: CYCLE, artifacts: ARTIFACTS }),
    )
  })

  it('draws three lanes in the original grammar, quiet ones thin and labeled', () => {
    const svg = buildCycleScoreSvg({ cycle: CYCLE, artifacts: ARTIFACTS })
    for (const lane of ['meridian', 'ulysses', 'ensemble']) expect(svg).toContain(`pr-${lane}`)
    // atelier and studio have no artifact in the fixture — their lanes go thin, and say why
    expect(svg.match(/lane-thin/g)!.length).toBe(2)
    expect(svg.match(/no artifact yet this cycle/g)!.length).toBe(2)
  })

  it('links every artifact and titles the mark with the artifact’s own date and words', () => {
    const svg = buildCycleScoreSvg({ cycle: CYCLE, artifacts: ARTIFACTS })
    for (const a of ARTIFACTS) expect(svg).toContain(`href="${a.href}"`)
    expect(svg).toContain('<title>2026-09-01 · a door to knock on</title>')
  })

  it('places marks on a true date scale — a later day sits further right', () => {
    const svg = buildCycleScoreSvg({ cycle: CYCLE, artifacts: ARTIFACTS })
    const xOf = (href: string) => {
      const group = svg.slice(svg.indexOf(`href="${href}"`))
      return Number(/<rect class="mk-fill[^"]*" x="([\d.]+)"/.exec(group)![1])
    }
    expect(xOf(ARTIFACTS[0]!.href)).toBeGreaterThan(xOf(ARTIFACTS[2]!.href))
  })

  it('steps a same-lane same-day pair apart instead of overprinting it', () => {
    const svg = buildCycleScoreSvg({ cycle: CYCLE, artifacts: ARTIFACTS })
    const xs = [...svg.matchAll(/<rect class="mk-fill[^"]*" x="([\d.]+)"/g)].map((m) => Number(m[1]))
    expect(new Set(xs).size).toBe(xs.length)
  })

  it('rules the drawing with the cycle’s own dates', () => {
    const svg = buildCycleScoreSvg({ cycle: CYCLE, artifacts: ARTIFACTS })
    expect(svg).toContain('2026-08-30')
    expect(svg).toContain('opened 2026-08-30')
    expect(svg).toContain('dated · placed by the artifact’s own day')
  })
})

describe('the score is mounted where the cycle is told', () => {
  const page = fs.readFileSync(
    fileURLToPath(new URL('../../components/ecology/EcologyV3Entrance.astro', import.meta.url)),
    'utf8',
  )
  it('the ecology entrance renders the figure and folds the bulletins without summarising', () => {
    expect(page).toContain('CycleScoreFigure')
    expect(page).toContain('<details')
    expect(page).toContain('bulletinBlocks')
  })
})
