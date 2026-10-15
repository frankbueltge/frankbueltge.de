// The ecology's rooms are cut from the frame's recipe (re-skin 2b, 2026-09-02): the type scale
// for their heads, the `.kicker` class for their kickers, panels on the frame's radius and
// resting depth, links inside the panels on the shadcn Button recipe. This guard keeps the
// five surfaces on that recipe — the failure it prevents has a date: on 2026-09-01 the same
// kicker was retyped by hand as `font-mono text-xs uppercase tracking-[0.22em]` in three
// components, and the three had already begun to differ.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')

const SURFACES = {
  EcologyV3Entrance: read('../../components/ecology/EcologyV3Entrance.astro'),
  PracticeStation: read('../../components/ecology/PracticeStation.astro'),
  MiddleV3: read('../../components/ecology/MiddleV3.astro'),
}
const frame = read('../../components/ecology/CycleScoreFigure.astro')
const pyramid = read('../../styles/ecology-pyramid.css')
const global = read('../../styles/global.css')

describe('the ecology rooms on the frame recipe', () => {
  for (const [name, source] of Object.entries(SURFACES)) {
    it(`${name} sets its kickers with the .kicker class, never a hand-typed mono line`, () => {
      expect(source).toMatch(/const kicker = 'kicker'/)
      expect(source, `${name} retypes the kicker by hand`).not.toMatch(/tracking-\[0\.22em\]/)
    })

    it(`${name} puts its head on the type scale`, () => {
      expect(source).toMatch(/<h1 class="[^"]*\btext-h1\b/)
      expect(source, `${name} still carries a hand-tuned h1`).not.toMatch(/<h1 class="[^"]*text-3xl/)
    })

    it(`${name} cuts the links inside its panels from the Button recipe`, () => {
      expect(source).toMatch(/import \{ buttonVariants \} from '@\/components\/ui\/button'/)
      expect(source).toMatch(/buttonVariants\(\{ variant: 'ghost', size: 'sm' \}\)/)
    })

    it(`${name} paints its panels on the frame's radius and resting depth`, () => {
      expect(source).toMatch(/rounded-md border border-line bg-panel panel-raised/)
    })

    it(`${name} decides no colour of its own`, () => {
      // the template only — the frontmatter's comments are allowed to NAME the rule they keep
      const template = source.slice(source.indexOf('\n---\n', 4) + 5)
      expect(template).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(template).not.toMatch(/style=["{]/)
    })
  }

  it('the cards that lead somewhere lift; the bulletins, read in place, stay still', () => {
    const { EcologyV3Entrance, PracticeStation } = SURFACES
    for (const source of [EcologyV3Entrance, PracticeStation]) {
      expect(source).toMatch(/const card = 'lift /)
      expect(source).toMatch(/import \{ Card, CardContent \} from '@\/components\/ui\/card'/)
    }
    // the bulletin panel is the plain panel recipe, without the lift
    expect(EcologyV3Entrance).toMatch(/<div class=\{cn\(panel, 'flex flex-col'\)\}>/)
  })

  it('the bulletin fold wears the frame’s turning chevron, and the wording no longer points sideways', () => {
    expect(SURFACES.EcologyV3Entrance).toMatch(/fold-chevron/)
    expect(global).toMatch(/details\[open\] > summary \.fold-chevron \{\s*transform: rotate\(180deg\);/)
    const wording = read('../../config/ecology-v3-wording.ts')
    expect(wording).not.toMatch(/lines →`/)
    expect(wording).not.toMatch(/bulletin ←'/)
  })

  it('the partitur frame is a still panel on the recipe — depth, no lift', () => {
    expect(frame).toMatch(/<figure class="score-map score-map-flush rounded-md border border-line bg-panel panel-raised">/)
    expect(frame).not.toMatch(/<figure class="[^"]*\blift\b/)
  })

  it('the register and document sheets take the frame’s radius, depth and type steps through the stylesheet', () => {
    expect(pyramid).toMatch(/--eco-radius: var\(--radius-lg\);/)
    expect(pyramid).toMatch(/\.eco-panel \{[^}]*box-shadow: var\(--elev-rest\);/)
    expect(pyramid).toMatch(/\.eco-register-head h1 \{[^}]*font-size: var\(--text-h2\);/)
    expect(pyramid).toMatch(/\.eco-doc \{[^}]*font-size: var\(--text-body\);/)
    expect(pyramid).toMatch(/\.eco-filter \{[^}]*border-radius: var\(--radius-sm\);/)
  })
})
