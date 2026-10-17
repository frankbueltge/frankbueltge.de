// An instrument that renders on no page fails nothing.
//
// This test exists because of a day nobody noticed. The refrain score — the running work-line's
// time as a three-voice score — was built on 2026-08-02 with its own spec, its own stylesheet,
// its own parser and 40-odd assertions. On 2026-08-12 the pyramid rewrite replaced the Atelier's
// entrance, and nothing carried the score across. For a day it existed, passed every check it
// had, and appeared on no surface of this site. Its guards even kept working: the aspect floor
// was diagnosed and repaired on 2026-08-12 against a figure no page mounted.
//
// Unit tests cannot catch that, because the component is correct — it is simply unreachable.
// So the check is a different question: **is this thing on a page at all?**
//
// The list is deliberately short. It names the instruments whose disappearance would be silent —
// a whole figure, a whole archived record — not every component in the tree. A test that tried to
// assert "everything is mounted" would fail on the first partial and be deleted within a week.
import { describe, expect, it } from 'vitest'
import { readdirSync, readFileSync, statSync } from 'node:fs'
import { join } from 'node:path'
import { DOORS } from './pyramid/station'

// src/components/holdings joined on 2026-09-02: the knowledge-graph explorer's frame lives there
// and is what the page imports; the island it mounts must stay visible to this guard.
const roots = ['src/pages', 'src/components/pages', 'src/components/ecology', 'src/components/holdings']

// .astro pages and components, and — since the visual layer of 2026-09-02 — the React islands
// (.tsx) that pages mount. An instrument ported to an island must stay visible to this guard;
// otherwise the port would make it disappear from here silently, which is the exact failure
// this file exists to catch.
function everySourceFile(dir: string): string[] {
  const out: string[] = []
  for (const entry of readdirSync(dir)) {
    const path = join(dir, entry)
    if (statSync(path).isDirectory()) out.push(...everySourceFile(path))
    else if (entry.endsWith('.astro') || entry.endsWith('.tsx')) out.push(path)
  }
  return out
}

const pages = roots.flatMap(everySourceFile)
const source = pages.map((p) => readFileSync(p, 'utf8')).join('\n')

describe('the instruments are on a page', () => {
  // component → what disappears with it, in the words the failure would need to be understood
  const INSTRUMENTS: [string, string][] = [
    // RefrainScore LEFT THIS LIST ON 2026-10-17, named here so its absence is a decision and not a
    // slip: it drew one work-line's score on /atelier/lines/<id>, a page retired with the
    // publication rule (src/lib/engines/publication.mjs) — the line's record is read in the
    // practice's repository (projects/<id>), and the work-line itself was retired with v3. The
    // component stays in the repository unmounted, as the surfaces before it did. The map of every
    // line, just below, still stands on /atelier.
    ['LineMap', 'the map of every work-line on one time axis, and how each one ended'],
    // back on /studio since 2026-09-01 — it had rendered on no page since the station sheets of
    // 2026-08-12, and its own guard then held the whole studio mirror shut over a figure nobody saw
    ['SeasonFloor', 'the Studio’s season floor — every premiere lit, every strike taped, every return drawn back'],
    // TWO LEFT THIS LIST ON 2026-10-11, with the design handoff of that day, and are named here
    // so their absence is a decision and not a slip: CyclePartitur (the running cycle as a
    // score, on /ecology) and RelayTriangle (the Middle's triangle, on /encounters). Both were
    // replaced by a new drawing of the SAME records — the score of every cycle since v3 and the
    // giver × taker matrix with its log — and both stay in the repository unmounted, as the
    // surfaces they themselves replaced did. Their successors are held just below.
    ['ScoreFigure', 'the research ecology as a score — every session, every presentation and every relation since v3 on one dated ruler'],
    ['PartFigure', 'a practice’s own part of that score — its staff in full, the siblings as ghost staves, the slurs that reached it'],
    ['MiddleCrossings', 'the Middle’s page — who took what from whom, night by night, and the log of every relation in the relay’s own words'],
    // the knowledge graph, explorable (2026-09-02) — the one surface on which every record the
    // house keeps about itself stands with its receipts; without it the graph is a file
    ['GraphExplorer', 'the knowledge graph of the house — every node with the file and quote each edge was read from'],
    // the living globe (2026-09-03, G1) — the room's island at /globe. It stood under the hero in
    // a compact form too until the owner took the globe off the front door (2026-09-03, wording
    // private); if this name ever stops being imported, the room quietly falls back to a plate
    // the experiments gallery (2026-09-02) — the shelf's cards and, with them, every miniature
    // drawn from an experiment's own committed record; without it /experiments is a list again
    ['ExperimentGallery', 'the /experiments gallery — every experiment\u2019s card and the miniature of its own instrument'],
    ['LivingGlobe', 'the one globe of this house — every layer of the archive on one earth, in the room at /globe'],
  ]

  it.each(INSTRUMENTS)('%s is imported by at least one page', (component, what) => {
    expect(
      // an .astro component or a .tsx island, imported by path from a page or a page component
      new RegExp(`/${component}(\\.astro|\\.tsx)?['"]`).test(source),
      `${component} is mounted on no page — ${what} renders nowhere, and nothing else in this ` +
        `suite will say so: the component is correct, it is simply unreachable.`,
    ).toBe(true)
  })
})

describe('the archived record stays findable', () => {
  // Until 2026-10-17 this held a station door on the archived cockpit: ADR 0008 archives surfaces
  // rather than deleting them, which is only honest while the archive can be reached (between
  // 2026-08-12 and 2026-08-13 the only references to the page were a 301 and the sitemap). The
  // publication rule of 2026-10-17 retired the page itself — a retired interface rendered against
  // the live archive is not a finished work — so what must hold now is the other half: no door
  // leads to an address that is no longer a page, and the old addresses land on the Atelier's page.
  it('leads no station door to the retired cockpit, and lands its addresses on the Atelier', () => {
    const hrefs = Object.values(DOORS).flat().map((d) => d.href)
    expect(hrefs).not.toContain('/atelier/archive/cockpit')
    const redirects = readFileSync('public/_redirects', 'utf8')
    expect(redirects).toMatch(/^\/atelier\/archive\/cockpit \/atelier 301$/m)
    expect(redirects).toMatch(/^\/atelier\/cockpit \/atelier 301$/m)
  })
})
