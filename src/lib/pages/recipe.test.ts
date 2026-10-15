// The rest of the house is cut from the frame's recipe (re-skin 2d, 2026-09-02): the utility
// pages — about, contact, legal, seed, post, admissions, 404 — the project pages, the four
// catalogue registers, and the entrance itself. This guard is a source scan in the pattern
// src/lib/ecology/recipe.test.ts established for the ecology's rooms in 2b, and it exists for the
// same reason: on 2026-09-01 the same kicker was a hand-typed `font-mono text-xs uppercase
// tracking-widest text-fg-faint` in a dozen components, three heads carried three different
// clamps for the same step, and every panel picked its own corner. The recipe is only worth
// having if nothing can quietly step off it again.
//
// What is deliberately NOT asserted: prose, wording, data, form field names, scripts. This file
// reads the frame, never the content.
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const read = (rel: string) => readFileSync(fileURLToPath(new URL(rel, import.meta.url)), 'utf8')
const page = (name: string) => read(`../../components/pages/${name}.astro`)

/** the template only — a frontmatter comment is allowed to NAME the rule it keeps */
const templateOf = (source: string) => source.slice(source.indexOf('\n---\n', 4) + 5)

/**
 * The markup only: the scoped <style> blocks are cut out. A stylesheet is exactly where a colour
 * belongs on this site, and two of these pages declare a recorded, PALETTE-marked set there (the
 * works register's practice hairlines). What may never carry a colour is the markup.
 */
const markupOf = (source: string) => templateOf(source).replace(/<style>[\s\S]*?<\/style>/g, '')

const SURFACES: Record<string, string> = {
  AboutPage: page('AboutPage'),
  ContactPage: page('ContactPage'),
  LegalPage: page('LegalPage'),
  SaatPage: page('SaatPage'),
  AdmissionsPage: page('AdmissionsPage'),
  CataloguesPage: page('CataloguesPage'),
  WorkIndex: page('WorkIndex'),
  WorkDetail: page('WorkDetail'),
  AtlasPage: page('AtlasPage'),
  DatasetRegisterPage: page('DatasetRegisterPage'),
  PapersPage: page('PapersPage'),
  // Moved to src/components/ecology/ on 2026-09-03, when the register became a section of
  // /ecology instead of a page of its own. Same recipe rules apply — it is still a surface a
  // reader meets, only now inside another one.
  WorksRegisterSection: read('../../components/ecology/WorksRegisterSection.astro'),
  OpsRoom: page('OpsRoom'),
  'pages/404': read('../../pages/404.astro'),
  'pages/post/index': read('../../pages/post/index.astro'),
}

const opsRoomCss = read('../../styles/ops-room.css')

describe('the utility pages on the frame recipe', () => {
  for (const [name, source] of Object.entries(SURFACES)) {
    it(`${name} takes its heads from the type scale, never a hand-tuned clamp`, () => {
      expect(source, `${name} still draws its own heading size`).not.toMatch(/text-\[clamp\(/)
      expect(source, `${name} still carries a Tailwind default heading step`).not.toMatch(
        /\btext-(?:xl|2xl|3xl|4xl|5xl)\b/,
      )
    })

    it(`${name} sets its kickers with the .kicker class, never a hand-typed mono line`, () => {
      // The three trackings the kicker was retyped with across this tree before 2a gave it a class.
      for (const retyped of ['tracking-widest', 'tracking-[0.22em]', 'tracking-[0.28em]']) {
        expect(source, `${name} retypes the kicker by hand (${retyped})`).not.toContain(retyped)
      }
    })

    it(`${name} draws its corners from the radius scale, never a pixel of its own`, () => {
      expect(source, `${name} still types a radius`).not.toMatch(/rounded-\[/)
    })

    it(`${name} decides no colour of its own, and sets no style attribute`, () => {
      expect(markupOf(source)).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(templateOf(source)).not.toMatch(/style=["{]/)
    })
  }
})

describe('the panels, the cards and the marks', () => {
  const PANELLED = [
    'AboutPage',
    'ContactPage',
    'LegalPage',
    'SaatPage',
    'AtlasPage',
    'DatasetRegisterPage',
    'PapersPage',
    'WorksRegisterSection',
    'pages/post/index',
  ]
  for (const name of PANELLED) {
    it(`${name} paints its panels on the frame's radius and resting depth`, () => {
      expect(SURFACES[name]).toMatch(/rounded-md border border-line bg-panel panel-raised/)
    })
  }

  it('a card that leads somewhere lifts; a card read in place stays put', () => {
    // Catalogues, /work and the post office's doors are links whose whole surface is the target.
    for (const name of ['CataloguesPage', 'WorkIndex', 'pages/post/index']) {
      expect(SURFACES[name], `${name} has a destination card that does not lift`).toMatch(
        /const cardLink = 'lift /,
      )
    }
    // The four registers list rows and entry cards that are READ where they stand; they wash or
    // brighten their hairline instead, and none of them may take the lift by mistake.
    for (const name of ['AtlasPage', 'DatasetRegisterPage', 'PapersPage', 'WorksRegisterSection']) {
      expect(SURFACES[name], `${name} lifts a row of a register`).not.toMatch(/'lift /)
    }
  })

  it('the labels of the register are Badges, not a chip drawn once more by hand', () => {
    expect(SURFACES.WorksRegisterSection).toMatch(/import \{ Badge \} from '@\/components\/ui\/badge'/)
    expect(SURFACES.WorksRegisterSection, 'the withdrawal chip drew its own box again').not.toMatch(
      /\.wr-chip \{/,
    )
    // WorkDetail and AdmissionsPage went onto the experiment-sheet recipe in step 2c (SheetHead /
    // SheetFoot); they are guarded here only by the universal checks above and, for the tables,
    // by the row-hover check below.
  })

  it('the register filters are cut from the Button recipe', () => {
    for (const name of ['DatasetRegisterPage', 'PapersPage']) {
      expect(SURFACES[name]).toMatch(
        /import \{ buttonVariants \} from '@\/components\/ui\/button'/,
      )
      expect(SURFACES[name]).toMatch(/buttonVariants\(\{ variant: 'outline', size: 'sm' \}\)/)
    }
  })

  it('a row of a register answers the pointer at the frame’s speed, with the frame’s easing', () => {
    // The interactive rule in global.css reaches a, button, summary and .lift — never a <li> or a
    // <tr>. Every page that renders rows as one of those has to say so itself, and must not
    // reintroduce a hand-typed duration while doing it.
    for (const name of ['WorksRegisterSection', 'AdmissionsPage', 'AtlasPage', 'DatasetRegisterPage', 'PapersPage', 'pages/post/index']) {
      expect(SURFACES[name], `${name} has rows that never acknowledge the pointer`).toMatch(
        /0\.2s var\(--ease-frame\)/,
      )
      expect(SURFACES[name], `${name} still types its own hover duration`).not.toMatch(
        /transition:[^;]*0\.(?:15|3|6)s/,
      )
    }
  })
})

describe('the forms wear one field, wherever they stand', () => {
  for (const name of ['ContactPage', 'SaatPage', 'pages/post/index']) {
    it(`${name} takes its fields from src/lib/ui/field.ts`, () => {
      expect(SURFACES[name]).toMatch(/from '@\/lib\/ui\/field'/)
      expect(SURFACES[name], `${name} draws a field box by hand`).not.toMatch(
        /class="[^"]*w-full rounded-\[8px\] border border-line/,
      )
    })

    it(`${name} sends with the Button recipe`, () => {
      expect(SURFACES[name]).toMatch(/import \{ buttonVariants \} from '@\/components\/ui\/button'/)
    })
  }

  it('the shadcn field primitives and the Astro forms read the same recipe', () => {
    const field = read('../ui/field.ts')
    expect(field).toMatch(/export const fieldVariants = cva\(/)
    // the recipe itself, not the note above it — the comment is allowed to name the rule it keeps
    const recipe = field.slice(field.indexOf('export const fieldVariants'))
    expect(recipe, 'a status colour crept into the field').not.toMatch(
      /destructive|(?:border|text|bg|ring)-(?:red|amber|green|rose|orange)/,
    )
    for (const primitive of ['input', 'textarea']) {
      expect(read(`../../components/ui/${primitive}.tsx`)).toMatch(
        /import \{ fieldVariants, type FieldVariants \} from '@\/lib\/ui\/field'/,
      )
    }
  })
})

describe('the entrance on the frame’s tokens', () => {
  it('the room stopped keeping a second greyscale', () => {
    // Its neutrals are var() references into the mono skin now — so a theme change reaches the
    // entrance through the same tokens as every room behind it.
    for (const mapping of [
      '--ops-bg: var(--color-bg);',
      '--ops-panel: var(--color-panel);',
      '--ops-line: var(--color-line);',
      '--ops-fg: var(--color-fg);',
      '--ops-muted: var(--color-fg-muted);',
      '--ops-faint: var(--color-fg-faint);',
      '--ops-radius: var(--radius-lg);',
    ]) {
      expect(opsRoomCss, `the room no longer maps ${mapping}`).toContain(mapping)
    }
    // The live ink stays the room's own, per theme — that is a signal, not a surface.
    expect(opsRoomCss).toMatch(/:root\[data-theme='dark'\] \.ops-room \{\s*--ops-accent: #/)
    expect(opsRoomCss).toMatch(/:root\[data-theme='light'\] \.ops-room \{[\s\S]*?--ops-accent: #/)
  })

  it('its panels sit at the frame’s resting depth and its easing is the frame’s', () => {
    expect(opsRoomCss).toMatch(/\.ops-panel \{[^}]*box-shadow: var\(--elev-rest\);/)
    expect(opsRoomCss, 'a hand-typed easing survived in the room').not.toMatch(/0\.(?:15|3)s ease/)
  })

  it('its kickers are the frame’s kicker, and the cards that lead somewhere lift', () => {
    const room = SURFACES.OpsRoom
    expect(room).toMatch(/<p class="kicker ops-kicker">/)
    expect(room).toMatch(/<p class="kicker ops-hero-kicker">/)
    expect(room).toMatch(/<p class="kicker ops-group-label">/)
    expect(room).toMatch(/class="ops-panel ops-tile lift"/)
    expect(room).toMatch(/class="ops-panel ops-house lift"/)
    // A board row is read by running down the board: it washes, it does not rise.
    expect(room, 'a board row took the lift').not.toMatch(/ops-row[^"]*\blift\b/)
    // …and the lift's hairline has to travel through the room's own token, because .ops-panel's
    // unlayered `border` shorthand outranks the utility layer no matter how specific it is.
    expect(opsRoomCss).toMatch(/\.ops-room \.lift:hover[\s\S]{0,80}--ops-line: var\(--color-line-lift\);/)
  })

  it('the pulse instrument keeps its own interior', () => {
    // 2d re-tokenised the room around it; what it DRAWS is its own (Phase 3b). The sky panel stood
    // beside it under the same rule until the owner took it off the front page (2026-09-03); its
    // stylesheet stays for the figure the repo keeps, dated and unmounted.
    const room = SURFACES.OpsRoom
    expect(room).toMatch(/class="ops-panel ops-instrument"/)
    expect(opsRoomCss).toMatch(/\.ops-sky-stage \{/)
  })
})
