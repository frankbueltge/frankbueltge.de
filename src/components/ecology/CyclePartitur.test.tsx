// The partitur's server render is the floor of the figure (visual layer, Phase 1, 2026-09-02).
//
// The contract every island in this house inherits (docs/design/2026-09-02-the-visual-layer.md
// §3, duty 2): the markup Astro renders on the server is the complete no-JS figure —
// deterministic, free of style attributes, and carrying every link and every native title before
// a single script has run. What JavaScript adds is zoom, cards and the readout; what it must
// never add is the figure itself.
import { renderToStaticMarkup } from 'react-dom/server'
import { describe, expect, it } from 'vitest'

import { ECOLOGY_V3 } from '@/config/ecology-v3-wording'
import { buildCycleModel, MARK_KINDS, type LaneId } from '@/lib/ecology/cycle-model'
import type {
  ArtifactEntry,
  CycleState,
  EncounterEntry,
  LetterEntry,
  PresentationEntry,
  SessionNote,
} from '@/lib/ecology/v3'

import CyclePartitur, { type PartiturWording } from './CyclePartitur'

const CYCLE: CycleState = {
  cycle: 1,
  phase: 'working',
  question: null,
  source: 'defaults',
  opened: '2026-08-30',
  sessionsPerPractice: '3-5',
  defaults: { field: 'a', atelier: 'b', studio: 'c' },
}

const artifacts: ArtifactEntry[] = [
  { practice: 'field', slug: 'a-door-to-knock-on', date: '2026-09-01', cycle: 1, href: '/field/artifacts/cycle-001/2026-09-01-a-door-to-knock-on/' },
  { practice: 'atelier', slug: 'cycle-001', date: '2026-08-31', cycle: 1, href: '/atelier/window/cycle-001/', title: 'What the Record Remembers' },
]
const sessions: SessionNote[] = [
  { practice: 'studio', date: '2026-08-30', title: 'Session 114 — 2026-08-30', href: '/studio/journal/cs-114/', anchor: 'cs-114', source: 'src/content/studio/journal/2026-08-30-session-114.md' },
]
const letters: LetterEntry[] = [
  { id: '2026-09-a-letter', practice: 'plenum', date: '2026-08-31', title: 'A packet lying open', receiver: 'a named receiver', status: 'prepared', href: '/post/', source: 'src/data/post/ledger.json' },
]
const encounters: EncounterEntry[] = [
  { id: 'enc-2026-009', date: '2026-09-01', title: 'The measurement travels', href: '/encounters/register/', source: 'src/data/begegnungen/register.json' },
]
const presentations: PresentationEntry[] = [
  { cycle: 1, practice: 'field', href: '/field/presentations/cycle-001/', files: 4, date: '2026-09-01', title: 'The handover' },
]

const model = buildCycleModel({ cycle: CYCLE, artifacts, sessions, letters, encounters, presentations })

const P = ECOLOGY_V3.score.partitur
const wording: PartiturWording = {
  lanes: P.lanes,
  laneRole: P.laneRole,
  laneQuiet: P.laneQuiet,
  laneCount: Object.fromEntries(model.lanes.map((l) => [l.id, P.laneCount(l.marks)])) as Record<LaneId, string>,
  hint: P.hint,
  axis: {
    opened: P.axis.opened(model.axis.start),
    newest: P.axis.newest(model.axis.end),
    note: P.axis.note,
  },
  kinds: P.kinds,
  kindWhat: P.kindWhat,
  band: P.band(ECOLOGY_V3.cycle.phase[model.phase].badge),
  card: P.card,
  zoom: P.zoom,
  figureLabel: P.figureLabel(ECOLOGY_V3.cycle.label(model.cycle)),
}

const render = () =>
  renderToStaticMarkup(
    <CyclePartitur model={model} wording={wording} readoutId="cycle-partitur-readout" figureId="cycle-partitur" />,
  )

describe('the cycle partitur, rendered on the server', () => {
  it('renders the same markup twice — the floor is deterministic', () => {
    expect(render()).toBe(render())
  })

  it('carries no style attribute — the CSP would drop it, and drift-check rule 3 forbids it', () => {
    // \x22 is the double quote, spelled out so drift-check rule 3 — which greps this source too,
    // .tsx included since 2026-09-02 — does not read the guard itself as an offence.
    expect(render()).not.toMatch(/ style=\x22/)
    expect(render()).not.toMatch(/ style=\{/)
  })

  it('gives every mark exactly one link, its own kind, and its own native title', () => {
    const html = render()
    const anchors = [...html.matchAll(/<a [^>]*data-mark="([^"]+)"/g)].map((m) => m[1]!)
    expect(anchors.sort()).toEqual(model.marks.map((m) => m.id).sort())
    for (const mark of model.marks) {
      expect(html).toContain(`href="${mark.href}"`)
      expect(html).toContain(`data-kind="${mark.kind}"`)
      expect(html).toContain(`data-lane="${mark.lane}"`)
      expect(html).toContain(`<title>${mark.date} ·`)
    }
    // one kind per fixture: the five signs of the grammar are all exercised
    expect(new Set(model.marks.map((m) => m.kind))).toEqual(new Set(MARK_KINDS))
  })

  it('draws four lanes with their own names, and says which of them is quiet', () => {
    const html = render()
    for (const lane of model.lanes) {
      expect(html).toContain(`pr-${lane.persona}`)
      expect(html).toContain(P.lanes[lane.id])
    }
    // every lane carries a record in this fixture, so nothing claims to be quiet
    expect(model.lanes.some((l) => l.quiet)).toBe(false)
    expect(html).not.toContain(P.laneQuiet)
  })

  it('rules the drawing with the cycle’s own dates and says the ruler is not a clock', () => {
    const html = render()
    expect(html).toContain(P.axis.opened('2026-08-30'))
    expect(html).toContain(P.axis.newest('2026-09-01'))
    expect(html).toContain(P.axis.note)
  })

  it('keeps the zoom controls hidden until the island has mounted — no dead buttons without JS', () => {
    const html = render()
    expect(html).toMatch(/class="score-zoom[^"]*"[^>]*hidden/)
  })

  it('opens no card on the server — a card is what a click adds', () => {
    expect(render()).not.toContain('score-card')
  })
})

describe('the partitur’s wording types no number', () => {
  const strings: string[] = []
  const walk = (value: unknown) => {
    if (typeof value === 'string') strings.push(value)
    else if (value && typeof value === 'object') Object.values(value).forEach(walk)
  }
  walk(P)

  it('carries no digit in any fixed string — counts and days arrive as arguments', () => {
    const offenders = strings.filter((s) => /\d/.test(s))
    expect(offenders, 'a number typed into wording goes stale; render it from the data instead').toEqual([])
  })
})
