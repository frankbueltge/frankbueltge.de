// The ledger's surfaces on the frame's recipe, and its figures on the visual layer's duties
// (2026-09-03). A source scan in the pattern src/lib/pages/recipe.test.ts established for the
// utility pages, and it exists for the same reason: Common Ground was built on 2026-09-01 and
// 2026-09-02, in parallel with the re-skin and against none of it. What that produced, measured
// on the morning of 2026-09-03: two hand-tuned heading clamps, the kicker retyped in three
// different trackings, a 16-pixel card radius of its own, and the same forty lines of table ink
// copied into three scoped <style> blocks. A recipe is only worth having if nothing can quietly
// step off it again.
//
// What is deliberately NOT asserted: prose, wording, data, provenance sentences, JSON-LD. This
// file reads the frame, never the content.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
const component = (name: string) => read(`../../components/pages/${name}`)

/** the template only — a frontmatter comment is allowed to NAME the rule it keeps */
const templateOf = (source: string) => source.slice(source.indexOf('\n---\n', 4) + 5)

/** the markup only: a scoped <style> block is exactly where a colour belongs, markup is not */
const markupOf = (source: string) => templateOf(source).replace(/<style>[\s\S]*?<\/style>/g, '')

/** the five surfaces a reader of the ledger actually meets */
const SURFACES: Record<string, string> = {
  TrendingPage: component('TrendingPage.astro'),
  TrendingTopicsHub: component('TrendingTopicsHub.astro'),
  TrendingTopicPage: component('TrendingTopicPage.astro'),
  TrendingRising: component('TrendingRising.astro'),
  TrendingAudience: component('TrendingAudience.astro'),
  TrendingConvergenceFigure: component('TrendingConvergenceFigure.astro'),
  MethodenblattTrending: component('MethodenblattTrending.astro'),
}

/** the three islands the ledger's figures are rendered by */
const ISLANDS: Record<string, string> = {
  TrendingConvergence: component('TrendingConvergence.tsx'),
  TrendingAudienceStrip: component('TrendingAudienceStrip.tsx'),
  TrendingArc: component('TrendingArc.tsx'),
}

describe('the ledger on the frame recipe', () => {
  for (const [name, source] of Object.entries(SURFACES)) {
    it(`${name} takes its heads from the type scale, never a hand-tuned clamp`, () => {
      expect(source, `${name} still draws its own heading size`).not.toMatch(/text-\[clamp\(/)
      expect(source, `${name} still carries a Tailwind default heading step`).not.toMatch(
        /\btext-(?:xl|2xl|3xl|4xl|5xl)\b/,
      )
    })

    it(`${name} sets its kickers with the .kicker class, never a hand-typed mono line`, () => {
      // The trackings the kicker was retyped with across this tree before the recipe.
      for (const retyped of ['tracking-widest', 'tracking-[0.18em]', 'tracking-[0.2em]', 'tracking-[0.22em]']) {
        expect(source, `${name} retypes the kicker by hand (${retyped})`).not.toContain(retyped)
      }
    })

    it(`${name} takes its mono steps from the scale, never a pixel of its own`, () => {
      expect(source, `${name} still types a font size`).not.toMatch(/text-\[\d/)
    })

    it(`${name} draws its corners from the radius scale, never a pixel of its own`, () => {
      expect(source, `${name} still types a radius`).not.toMatch(/rounded-\[/)
    })

    it(`${name} decides no colour of its own, and sets no style attribute`, () => {
      expect(markupOf(source)).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(templateOf(source)).not.toMatch(/style=["{]/)
    })
  }

  it('keeps the sheet ink in ONE stylesheet, not a copy per surface', () => {
    // Until 2026-09-03 the disclosure note and the table dress lived three times, as scoped
    // <style> blocks. Three copies is three chances to drift.
    for (const name of ['TrendingPage', 'TrendingTopicsHub', 'TrendingTopicPage']) {
      expect(SURFACES[name], `${name} carries its own copy of the sheet ink again`).not.toContain('<style>')
    }
    const sheet = read('../../styles/trending.css')
    expect(sheet).toContain('.trending .au-note')
    expect(sheet).toContain('.trending .dv-table')
  })

  it('zeroes a cell\'s right padding only at the end of a row, never on every number', () => {
    // The copied blocks put `padding-right: 0` on every right-aligned cell, so a count and the
    // date beside it printed as one string ("3632026-09-02" on /trending/topics) and so did the
    // two headers above them. Found by looking at the page on 2026-09-03.
    const sheet = read('../../styles/trending.css')
    expect(sheet).toMatch(/tr > :last-child \{\s*padding-right: 0;/)
    expect(sheet).not.toMatch(/\[data-align='right'\] \{[^}]*padding-right: 0/)
  })

  it('scopes every surface with .trending, or the shared stylesheet reaches nothing', () => {
    for (const name of ['TrendingPage', 'TrendingTopicsHub', 'TrendingTopicPage']) {
      expect(SURFACES[name], `${name} left the .trending scope`).toMatch(/class="trending /)
    }
  })

  it('paints the panels on the frame\'s radius and resting depth', () => {
    for (const name of ['TrendingPage', 'TrendingConvergenceFigure']) {
      expect(SURFACES[name], `${name} paints a panel of its own`).toMatch(
        /rounded-md border border-line bg-panel panel-raised/,
      )
    }
  })

  it('draws a status chip as a Badge, never a box drawn once more by hand', () => {
    for (const name of ['TrendingPage', 'TrendingTopicsHub', 'TrendingTopicPage', 'TrendingRising']) {
      expect(SURFACES[name], `${name} draws a chip without the Badge primitive`).toContain(
        "import { Badge } from '@/components/ui/badge'",
      )
    }
  })
})

describe("the ledger's figures on the visual layer", () => {
  it('renders all three figures as islands, not as build-time SVG in a frame', () => {
    // The frames mount islands; a frame that starts drawing again is the habit of 2026-09-01
    // coming back (docs/design/2026-09-02-the-visual-layer.md §1).
    for (const [name, source] of Object.entries({
      TrendingAudience: SURFACES.TrendingAudience!,
      TrendingTopicPage: SURFACES.TrendingTopicPage!,
      TrendingConvergenceFigure: SURFACES.TrendingConvergenceFigure!,
    })) {
      expect(source, `${name} draws its own SVG again`).not.toContain('<svg')
      expect(source, `${name} mounts no island`).toMatch(/client:(visible|idle|load)/)
    }
  })

  it('gives every island the Readout shell and the box it clamps within', () => {
    for (const [name, source] of Object.entries(ISLANDS)) {
      expect(source, `${name} does not clamp its readout to a figure box`).toContain("'.tr-figure'")
      // The clamp box belongs to the FRAME: an island's own wrapper sits below its root, and
      // closest() looks upwards — so an island that declares `.tr-figure` itself would silently
      // fall back to its whole root, legend and card included (found on 2026-09-03 by probing the
      // rendered page, not by a test — hence this one).
      expect(source, `${name} owns the clamp box it should be inside`).not.toContain('"tr-figure"')
    }
    for (const name of ['TrendingAudience', 'TrendingTopicPage', 'TrendingConvergenceFigure']) {
      expect(SURFACES[name], `${name} mounts an island without a readout shell`).toContain('<Readout id=')
      expect(SURFACES[name], `${name} gives its readout no box to clamp within`).toMatch(
        /<div class="tr-figure">/,
      )
    }
  })

  it('computes no geometry inside an island — duty 1 keeps every number in a tested lib', () => {
    for (const [name, source] of Object.entries(ISLANDS)) {
      expect(source, `${name} does arithmetic of its own`).not.toMatch(/Math\.[a-z]/)
      expect(source, `${name} reads no model from src/lib`).toMatch(/from '@\/lib\/trending\//)
    }
  })

  it('sets no style attribute and no hex in an island, not even as a JSX prop', () => {
    for (const [name, source] of Object.entries(ISLANDS)) {
      expect(source, `${name} sets a style prop`).not.toMatch(/style=\{/)
      expect(source, `${name} writes a hex literal`).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    }
  })

  it('keeps the figures free of a colour palette, as six classes require', () => {
    // Duty 7 allows at most four categorical hues; the audience strip alone tells six classes
    // apart, so all three figures are ink and pattern. A hex or an hsl() in this stylesheet would
    // mean a palette record is missing (dataviz-figures.md, PALETTE: markers).
    const sheet = read('../../styles/trending-figures.css')
    expect(sheet).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(sheet).not.toMatch(/\b(?:hsl|oklch|rgb)\(/)
    expect(sheet).toContain('prefers-reduced-motion')
  })

  it('budgets every island, so a figure cannot grow unnoticed', () => {
    const budgets = JSON.parse(read('../../../scripts/budgets.json')) as { budgets: { prefix: string }[] }
    const prefixes = budgets.budgets.map((b) => b.prefix)
    for (const name of Object.keys(ISLANDS)) {
      expect(prefixes, `${name} has no gzip budget`).toContain(`${name}.`)
    }
  })
})
