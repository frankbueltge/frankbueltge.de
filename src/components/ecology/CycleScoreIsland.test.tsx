// The first island's server render is the floor of the figure. These three tests are the
// contract every later island inherits (docs/design/2026-09-02-the-visual-layer.md §3): the
// server markup is deterministic, carries no style attribute, and carries every link — so a
// reader without JavaScript loses nothing but the hover.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { buildCycleScoreSvg } from '@/lib/ecology/cycle-score'
import type { ArtifactEntry, CycleState } from '@/lib/ecology/v3'

import CycleScoreIsland from './CycleScoreIsland'

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
  { practice: 'field', slug: 'a-door-to-knock-on', date: '2026-09-01', cycle: 1, href: '/field/artifacts/cycle-001/2026-09-01-a-door-to-knock-on/' },
  { practice: 'field', slug: 'yield-of-a-loop', date: '2026-08-30', cycle: 1, href: '/field/artifacts/cycle-001/2026-08-30-yield-of-a-loop/' },
]

const svg = buildCycleScoreSvg({ cycle: CYCLE, artifacts: ARTIFACTS })
const render = () => renderToStaticMarkup(<CycleScoreIsland svg={svg} readoutId="cycle-score-readout" />)

describe('the cycle score island, rendered on the server', () => {
  it('renders the same markup twice — the floor is deterministic', () => {
    expect(render()).toBe(render())
  })

  it('carries no style attribute — the CSP would drop it, and drift-check rule 3 forbids it', () => {
    // \x22 is the double quote, spelled out so drift-check rule 3 — which greps this source
    // too, .tsx included since 2026-09-02 — does not read the guard itself as an offence.
    expect(render()).not.toMatch(/ style=\x22/)
  })

  it('carries every artifact link before any script runs', () => {
    const html = render()
    for (const a of ARTIFACTS) expect(html).toContain(`href="${a.href}"`)
    expect(html).toContain('data-island="cycle-score"')
  })
})
