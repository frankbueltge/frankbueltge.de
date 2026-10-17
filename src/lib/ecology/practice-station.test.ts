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
//   · the template renders the DOORS registry — that list is what keeps the record reachable
//     (until 2026-10-17 mounted.test.ts held the archived cockpit through it; the publication
//     rule of that day retired the page, and the doors to the journal, the constitution and the
//     team channel now open the practice's repository).
//
// A fourth since 2026-10-17: the template links the newest piece, the shelf and the journal rows
// where they are read under the publication rule (src/lib/engines/publication-links.ts), never
// at an address that only reaches them through a 301.
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

  it('links pieces and journal sessions where the publication rule says they are read', () => {
    expect(station).toContain('pieceHref(newest.href)')
    expect(station).toContain('url(pieceHref(w.href))')
    expect(station).toContain('href={sessionHref(j)}')
    expect(station).toContain('REPOSITORY_DOORS[id].journal')
    // no link built on a retired journal route
    expect(station).not.toMatch(/`\/\$\{id\}\/journal/)
  })

  it('keeps the earlier station in the repo, unlinked, rather than deleting it', () => {
    expect(read('../../components/ecology/PracticeStation.astro').length).toBeGreaterThan(0)
  })

  it.each(pages)('/%s renders the shared template, not a page of its own', (_id, source) => {
    expect(source).toContain("/PracticePart.astro'")
    expect(source).toContain('surface="paper"')
  })
})
