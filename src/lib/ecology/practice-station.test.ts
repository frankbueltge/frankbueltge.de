// The practice template is on the routes, and the routes are on the template.
//
// Source-scan, the same pattern naming.test.ts uses for the entrance: a component can be
// correct and unreachable, or a page can quietly stop deriving what it claims to show, and no
// unit test says so. Three things must stay true, and each would fail silently:
//
//   · the template reads the house clock and the practice's bulletin (loadCycle/loadBulletin) —
//     dropped, the page would still build and simply stop telling a visitor what runs NOW;
//   · every practice index renders the shared template — a page rebuilt "just for one practice"
//     is the drift the one-template decision exists to end;
//   · the template renders the DOORS registry — that list is what keeps the archived record
//     reachable (mounted.test.ts holds /atelier/archive/cockpit through it).
//
// The template was PracticeStation.astro from 2026-09-01 and is PracticePart.astro since the
// design handoff of 2026-10-11; the three promises moved with it unchanged.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (rel: string): string =>
  readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')

const station = read('../../components/ecology/score/PracticePart.astro')
const pages: [string, string][] = (['field', 'atelier', 'studio'] as const).map((p) => [
  p,
  read(`../../pages/${p}/index.astro`),
])

describe('the practice template', () => {
  it('derives the house clock and the bulletin from the committed record', () => {
    expect(station).toContain('loadCycle')
    expect(station).toContain('loadBulletin')
  })

  it('renders the doors registry, which keeps the archived record reachable', () => {
    expect(station).toContain('DOORS')
    expect(station).toContain('windowDoor')
  })

  it('keeps the earlier station in the repo, unlinked, rather than deleting it', () => {
    expect(read('../../components/ecology/PracticeStation.astro').length).toBeGreaterThan(0)
  })

  it.each(pages)('/%s renders the shared template, not a page of its own', (_id, source) => {
    expect(source).toContain("/PracticePart.astro'")
    expect(source).toContain('surface="paper"')
  })
})
