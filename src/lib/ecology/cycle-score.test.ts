import fs from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { buildCycleScoreSvg } from './cycle-score'
import { inCycle, loadArtifacts, loadCycle, PRACTICES } from './v3'
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
  { practice: 'field', slug: 'a-door-to-knock-on', date: '2026-09-01', href: '/field/artifacts/cycle-001/2026-09-01-a-door-to-knock-on/', cycle: 1 },
  { practice: 'field', slug: 'how-long-a-warning-stands', date: '2026-09-01', href: '/field/artifacts/cycle-001/2026-09-01-how-long-a-warning-stands/', cycle: 1 },
  { practice: 'field', slug: 'yield-of-a-loop', date: '2026-08-30', href: '/field/artifacts/cycle-001/2026-08-30-yield-of-a-loop/', cycle: 1 },
]

/** All three conventions at once — the Field's slugs, the Atelier's windows with their own
 *  titles, the Studio's works with theirs. */
const EVERY_LANE: ArtifactEntry[] = [
  ...ARTIFACTS,
  { practice: 'atelier', slug: 'cycle-001-session-2', date: '2026-09-01', href: '/atelier/window/cycle-001-session-2/', cycle: 1, title: 'The Cheapest Thing That Worked' },
  { practice: 'atelier', slug: 'cycle-001', date: '2026-08-31', href: '/atelier/window/cycle-001/', cycle: 1, title: 'What the Record Remembers' },
  { practice: 'studio', slug: 'not-yet', date: '2026-09-01', href: '/studio/werke-html/2026-09-01-not-yet/', cycle: null, title: 'NOT YET' },
  { practice: 'studio', slug: 'come-in', date: '2026-08-31', href: '/studio/werke-html/2026-08-31-come-in/', cycle: null, title: 'COME IN' },
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

  it('gives a same-lane same-day triple three label rows, so no two words share a line', () => {
    const triple: ArtifactEntry[] = ['not-yet', 'all-at-once', 'one-knock-each'].map((slug) => ({
      practice: 'studio',
      slug,
      date: '2026-09-01',
      href: `/studio/werke-html/2026-09-01-${slug}/`,
      cycle: null,
      title: slug.replace(/-/g, ' ').toUpperCase(),
    }))
    const svg = buildCycleScoreSvg({ cycle: CYCLE, artifacts: triple })
    // the words of the marks only — each sits inside its mark's link; the ruler's date ticks do not
    const labelYs = svg
      .split('<a href=')
      .slice(1)
      .map((group) => Number(/<text class="t-note" x="[\d.]+" y="([\d.-]+)"/.exec(group)![1]))
    expect(labelYs).toHaveLength(3)
    expect(new Set(labelYs).size).toBe(3)
    // the third label sits one row further out than the first, on the same side
    const [first, , third] = labelYs as [number, number, number]
    expect(third).toBeGreaterThan(first)
    // the newest day is the axis end: the group steps left as one, no mark past the span (1330)
    const centres = [...svg.matchAll(/<rect class="mk-fill[^"]*" x="([\d.]+)"/g)].map((m) => Number(m[1]) + 8)
    expect(Math.max(...centres)).toBeLessThanOrEqual(1330)
    expect(new Set(centres).size).toBe(3)
  })

  it('rules the drawing with the cycle’s own dates', () => {
    const svg = buildCycleScoreSvg({ cycle: CYCLE, artifacts: ARTIFACTS })
    expect(svg).toContain('2026-08-30')
    expect(svg).toContain('opened 2026-08-30')
    expect(svg).toContain('dated · placed by the artifact’s own day')
  })

  it('fills every lane once every practice has delivered, whatever convention it wrote in', () => {
    const svg = buildCycleScoreSvg({ cycle: CYCLE, artifacts: EVERY_LANE })
    expect(svg).not.toContain('lane-thin')
    expect(svg).not.toContain('no artifact yet this cycle')
    for (const a of EVERY_LANE) expect(svg).toContain(`href="${a.href}"`)
  })

  it('carries the practice’s own title where its record has one, and cuts it at a word', () => {
    const svg = buildCycleScoreSvg({ cycle: CYCLE, artifacts: EVERY_LANE })
    expect(svg).toContain('<title>2026-09-01 · NOT YET</title>')
    expect(svg).toContain('>NOT YET</text>')
    expect(svg).toContain('<title>2026-09-01 · The Cheapest Thing That Worked</title>')
    expect(svg).toContain('>The Cheapest Thing That…</text>')
    // a bare slug still reads as words
    expect(svg).toContain('<title>2026-09-01 · a door to knock on</title>')
  })

  it('draws, on this repo, a thin lane for exactly the practices without a dated artifact in the running cycle', () => {
    const cycle = loadCycle()
    const dated = loadArtifacts().filter((a) => inCycle(a, cycle) && a.date !== null)
    const svg = buildCycleScoreSvg({ cycle, artifacts: dated })
    const quiet = PRACTICES.filter((p) => !dated.some((a) => a.practice === p)).length
    expect(svg.match(/lane-thin/g)?.length ?? 0).toBe(quiet)
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
