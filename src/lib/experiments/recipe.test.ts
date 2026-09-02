// The lab's surfaces are cut from ONE experiment-sheet recipe (re-skin 2c, 2026-09-02): the
// shared pieces in src/components/experiments/ — SheetHead, SheetFold, SheetFoot, SheetFigure,
// MethodSheet — and one stylesheet, src/styles/experiment-sheet.css. Before this pass every
// experiment page carried its own `text-[clamp(30px,6vw,56px)]` h1, its own hand-typed mono
// kicker and its own footer; the method sheets each opened their own <main>. This guard keeps
// the twenty-odd pages on the recipe the way src/lib/ecology/recipe.test.ts keeps the ecology's
// rooms on theirs: the failure it prevents is the slow drift back into twenty hands.
import { readdirSync, readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'

const pagesDir = fileURLToPath(new URL('../../components/pages/', import.meta.url))
const read = (name: string) => readFileSync(new URL(name, `file://${pagesDir}`), 'utf8')
const template = (source: string) => source.slice(source.indexOf('\n---\n', 4) + 5)

/** experiment pages with a titled head: SheetHead + SheetFoot + the stylesheet */
const SHEETS = [
  'ConsensusPage', 'ConsensusArchivePage', 'GhostFleetPage', 'ParallaxePage', 'SpielraumPage',
  'BeifangPage', 'ProtokollDataView', 'InvokedPastPage', 'BalancePage', 'CorrectionPage',
  'RedactionPage', 'RoundNumberPage', 'PatternPage', 'TellPage', 'UeberflugStudiePage',
  'AdmissionsPage', 'MeridianParallax', 'WorkDetail', 'LabDetail',
]
/** the two that render a DOCUMENT (the police, the protocol): their footer is the document's own
 *  closing lines and stays; only the stylesheet and the dressed nav are required */
const DOCUMENTS = ['PraemiePage', 'ProtokollDoc']
/** pages whose head is a number or a document, not a title — SheetHead is not required there */
const HEADLESS = new Set(['ParallaxePage'])
/** the two that carry no provenance foot of their own (a project, a lab note) */
const FOOTLESS = new Set(['WorkDetail', 'LabDetail'])

const methodSheets = readdirSync(pagesDir).filter((f) => /^Methodenblatt.*\.astro$/.test(f))

const HAND_H1 = /<h1 class="[^"]*text-\[clamp\(/
const HAND_KICKER = /font-mono text-\[1[01]px\] uppercase tracking-\[0\.1[28]em\] text-fg-faint/

describe('the experiment sheets on the frame recipe', () => {
  for (const name of SHEETS) {
    const source = read(`${name}.astro`)
    it(`${name} imports the recipe — the shared head and foot, and the sheet stylesheet`, () => {
      expect(source).toMatch(/import SheetHead from '@\/components\/experiments\/SheetHead\.astro'/)
      expect(source).toMatch(/import SheetFoot from '@\/components\/experiments\/SheetFoot\.astro'/)
      expect(source).toMatch(/import '@\/styles\/experiment-sheet\.css'/)
    })
    if (!HEADLESS.has(name)) {
      it(`${name} sets its head with SheetHead, never a hand-tuned h1`, () => {
        expect(source).toMatch(/<SheetHead[\s\n]/)
        expect(source, `${name} still carries a clamp() h1`).not.toMatch(HAND_H1)
      })
    }
    if (!FOOTLESS.has(name)) {
      it(`${name} closes with SheetFoot`, () => {
        expect(source).toMatch(/<SheetFoot>/)
      })
    }
    it(`${name} sets its kickers with the .kicker class, never a hand-typed mono line`, () => {
      expect(template(source), `${name} retypes the kicker by hand`).not.toMatch(HAND_KICKER)
    })
    it(`${name} carries no inline style — the CSP drops them, and the recipe has no need of one`, () => {
      // colour is not asserted here: a page's own figure may set an SVG presentation attribute
      // (fill=, stroke=), which the house allows — the hex ban is the dataviz layer's rule
      // (drift-check rule 6), not every page's
      expect(template(source)).not.toMatch(/style=["{]/)
    })
  }

  for (const name of DOCUMENTS) {
    const source = read(`${name}.astro`)
    it(`${name} keeps its document footer and dresses its nav through the sheet stylesheet`, () => {
      expect(source).toMatch(/import '@\/styles\/experiment-sheet\.css'/)
      expect(source).toMatch(/<nav class="sheet-nav /)
      expect(source).not.toMatch(/<SheetFoot>/)
    })
  }

  it('every method sheet is wrapped in MethodSheet and carries no <main> of its own', () => {
    expect(methodSheets.length).toBeGreaterThanOrEqual(17)
    for (const name of methodSheets) {
      const source = read(name)
      expect(source, `${name} is not wrapped in MethodSheet`).toMatch(/<MethodSheet[\s\n]/)
      expect(source, `${name} still opens its own <main>`).not.toMatch(/<main id="main"/)
      expect(source, `${name} still types a method-sheet h1`).not.toMatch(/<h1 class="mb-8 text-xl font-semibold">/)
      expect(template(source), `${name} retypes the kicker by hand`).not.toMatch(HAND_KICKER)
    }
  })

  it('the shelf (/experiments) cuts its chips and quiet links from the Button recipe, its stamps from Badge, its rows as lifting cards', () => {
    const source = read('BestaendeIndex.astro')
    expect(source).toMatch(/import \{ buttonVariants \} from '@\/components\/ui\/button'/)
    expect(source).toMatch(/import \{ Badge \} from '@\/components\/ui\/badge'/)
    expect(source).toMatch(/const chip = cn\(\s*buttonVariants\(\{ variant: 'outline', size: 'sm' \}\)/)
    expect(source).toMatch(/const card = 'sheet-row lift rounded-md border border-line bg-panel panel-raised'/)
    expect(source).toMatch(/<h1 class="text-h1 font-semibold text-fg">/)
    expect(source).toMatch(/fold-chevron/)
    expect(source).not.toMatch(HAND_H1)
  })

  it('the shared pieces exist, own no wording, and paint no colour', () => {
    const dir = fileURLToPath(new URL('../../components/experiments/', import.meta.url))
    for (const piece of ['SheetHead', 'SheetFold', 'SheetFoot', 'SheetFigure', 'MethodSheet']) {
      const source = readFileSync(`${dir}${piece}.astro`, 'utf8')
      const t = template(source)
      expect(t, `${piece} carries a hex`).not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
      expect(t, `${piece} carries an inline style`).not.toMatch(/style=["{]/)
    }
    const css = readFileSync(fileURLToPath(new URL('../../styles/experiment-sheet.css', import.meta.url)), 'utf8')
    expect(css, 'the sheet stylesheet decides a colour of its own').not.toMatch(/#[0-9a-fA-F]{3,8}\b/)
    expect(css).toMatch(/\.sheet-reveal \{/)
    expect(css).toMatch(/\.sheet-link \{/)
    expect(css).toMatch(/\.sheet-nav a \{/)
  })
})
