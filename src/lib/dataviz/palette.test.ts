// src/lib/dataviz/palette.test.ts — "validated" is a test, not a comment.
//
// Re-derives the colour math in-repo (sRGB → linear → Machado 2009 dichromacy simulation →
// OKLab, ΔE ×100; WCAG contrast) and fails the build if a recorded verdict in palette.ts
// drifts from what the hexes actually measure. The dataviz skill's validate_palette.js stays
// the tool of record for shipping NEW sets; this file is the tripwire that keeps the shipped
// record honest. Tritan values are recorded informationally from the validator and not
// re-derived here (tritan matrices differ slightly across sources; protan/deutan carry the
// pass/fail weight in the validator's CVD check).
import { readFileSync } from 'node:fs'
import { fileURLToPath } from 'node:url'
import { describe, expect, it } from 'vitest'
import { PALETTES, paletteById, SEQUENTIALS, sequentialById, type PaletteSet, type SequentialSet } from './palette'

const ROOT = fileURLToPath(new URL('../../..', import.meta.url))

// ——— colour math ————————————————————————————————————————————————————————————
const MACHADO: Record<'protan' | 'deutan', number[][]> = {
  protan: [
    [0.152286, 1.052583, -0.204868],
    [0.114503, 0.786281, 0.099216],
    [-0.003882, -0.048116, 1.051998],
  ],
  deutan: [
    [0.367322, 0.860646, -0.227968],
    [0.280085, 0.672501, 0.047413],
    [-0.01182, 0.04294, 0.968881],
  ],
}

function hexToLinear(hex: string): [number, number, number] {
  const c = (i: number) => {
    const v = parseInt(hex.slice(i, i + 2), 16) / 255
    return v <= 0.04045 ? v / 12.92 : Math.pow((v + 0.055) / 1.055, 2.4)
  }
  return [c(1), c(3), c(5)]
}

function apply(m: number[][], v: [number, number, number]): [number, number, number] {
  return [
    m[0][0] * v[0] + m[0][1] * v[1] + m[0][2] * v[2],
    m[1][0] * v[0] + m[1][1] * v[1] + m[1][2] * v[2],
    m[2][0] * v[0] + m[2][1] * v[1] + m[2][2] * v[2],
  ]
}

function oklab([r, g, b]: [number, number, number]): [number, number, number] {
  const l = 0.4122214708 * r + 0.5363325363 * g + 0.0514459929 * b
  const m = 0.2119034982 * r + 0.6806995451 * g + 0.1073969566 * b
  const s = 0.0883024619 * r + 0.2817188376 * g + 0.6299787005 * b
  const [l_, m_, s_] = [Math.cbrt(l), Math.cbrt(m), Math.cbrt(s)]
  return [
    0.2104542553 * l_ + 0.793617785 * m_ - 0.0040720468 * s_,
    1.9779984951 * l_ - 2.428592205 * m_ + 0.4505937099 * s_,
    0.0259040371 * l_ + 0.7827717662 * m_ - 0.808675766 * s_,
  ]
}

function deltaE(a: string, b: string, sim?: 'protan' | 'deutan'): number {
  let [va, vb] = [hexToLinear(a), hexToLinear(b)]
  if (sim) [va, vb] = [apply(MACHADO[sim], va), apply(MACHADO[sim], vb)]
  const [la, lb] = [oklab(va), oklab(vb)]
  return Math.hypot(la[0] - lb[0], la[1] - lb[1], la[2] - lb[2]) * 100
}

function wcagContrast(fg: string, bg: string): number {
  const lum = (hex: string) => {
    const [r, g, b] = hexToLinear(hex)
    return 0.2126 * r + 0.7152 * g + 0.0722 * b
  }
  const [l1, l2] = [lum(fg), lum(bg)].sort((x, y) => y - x)
  return (l1 + 0.05) / (l2 + 0.05)
}

function worstPairs(hexes: string[]) {
  let cvd = Infinity
  let normal = Infinity
  for (let i = 0; i < hexes.length; i++) {
    for (let j = i + 1; j < hexes.length; j++) {
      normal = Math.min(normal, deltaE(hexes[i], hexes[j]))
      for (const sim of ['protan', 'deutan'] as const) {
        cvd = Math.min(cvd, deltaE(hexes[i], hexes[j], sim))
      }
    }
  }
  return { cvd, normal }
}

const HEX = /^#[0-9a-f]{6}$/

// ——— structural record checks ————————————————————————————————————————————————
describe.each(PALETTES.map((p) => [p.id, p] as const))('palette set %s', (_id, set: PaletteSet) => {
  it('is a complete, dated record', () => {
    expect(set.slots.length).toBeGreaterThanOrEqual(2)
    expect(set.slots.length).toBeLessThanOrEqual(4) // measured ceiling: a 5th hue always collapses
    expect(set.validatedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(set.validator).toContain('validate_palette')
    expect(set.pairs).toBe('all')
    for (const s of set.slots) {
      expect(s.light).toMatch(HEX)
      expect(s.dark).toMatch(HEX)
    }
    expect(set.surfaces.light.length).toBeGreaterThan(0)
    expect(set.surfaces.dark.length).toBeGreaterThan(0)
    expect(set.worst.map((w) => w.mode).sort()).toEqual(['dark', 'light'])
  })

  it('every WARN names its relief — a contrast WARN is never dismissable', () => {
    for (const w of set.warns) {
      expect(w.relief.length).toBeGreaterThan(10)
      expect(w.hex).toMatch(HEX)
    }
  })

  it.each(set.worst.map((w) => [w.mode, w] as const))(
    '%s-mode distances re-derive to the recorded values',
    (mode, recorded) => {
      const hexes = set.slots.map((s) => s[mode])
      const derived = worstPairs(hexes)
      expect(Math.abs(derived.cvd - recorded.cvd)).toBeLessThanOrEqual(0.15)
      expect(Math.abs(derived.normal - recorded.normal)).toBeLessThanOrEqual(0.15)
      // Validator pass thresholds: CVD ≥ 8 without extra conditions (6–8 would demand
      // secondary encoding on EVERY figure — a conscious decision, not a silent one),
      // normal-vision floor 15 is hard.
      expect(derived.cvd).toBeGreaterThanOrEqual(8)
      expect(derived.normal).toBeGreaterThanOrEqual(15)
    },
  )

  it('recorded contrast WARNs match the weakest declared surface', () => {
    for (const w of set.warns) {
      const weakest = Math.min(...set.surfaces[w.mode].map((s) => wcagContrast(w.hex, s)))
      expect(Math.abs(weakest - w.contrast)).toBeLessThanOrEqual(0.05)
      expect(weakest).toBeLessThan(3) // otherwise it would not be a WARN — drop the entry
    }
  })

  it('a shape-carried hue is really in the 6–8 band — never a way past the CVD gate', () => {
    // The ONLY legitimate reason to record a hue outside `slots`: it collapses against a slot
    // under simulated CVD, and the figure separates the two by MARK SHAPE instead. So each
    // shapeCarried hue must actually measure below the validator's clean-pass threshold of 8
    // against at least one categorical slot in at least one mode. A hue that separates fine has
    // no business here — it belongs in `slots`, where the maths applies to it.
    for (const carried of set.shapeCarried ?? []) {
      expect(carried.light).toMatch(HEX)
      expect(carried.dark).toMatch(HEX)
      expect(carried.note.length).toBeGreaterThan(40)
      const collapses = (['light', 'dark'] as const).some((mode) =>
        set.slots.some((s) => worstPairs([carried[mode], s[mode]]).cvd < 8),
      )
      expect(
        collapses,
        `shapeCarried "${carried.name}" separates cleanly from every slot — record it as a slot`,
      ).toBe(true)
    }
  })

  it('carries its PALETTE marker in every file that claims it', () => {
    for (const rel of set.usedBy) {
      const text = readFileSync(new URL(rel, `file://${ROOT}`), 'utf8')
      expect(text, `${rel} must carry "PALETTE: ${set.id}"`).toContain(`PALETTE: ${set.id}`)
    }
  })

  it('each slot is rendered somewhere it claims (at least one mode hex present)', () => {
    const union = set.usedBy.map((rel) => readFileSync(new URL(rel, `file://${ROOT}`), 'utf8')).join('\n')
    for (const s of set.slots) {
      expect(
        union.includes(s.light) || union.includes(s.dark),
        `slot "${s.name}" (${s.light}/${s.dark}) not found in any usedBy file`,
      ).toBe(true)
    }
  })
})

// ——— set-specific regression guards ——————————————————————————————————————————
describe('atelier-outcomes replaces the failing quartet', () => {
  const sheet = readFileSync(new URL('src/styles/atelier-sheet.css', `file://${ROOT}`), 'utf8')
  const proc = readFileSync(new URL('src/styles/atelier-process.css', `file://${ROOT}`), 'utf8')

  it('all eight outcome hexes live in atelier-sheet.css (single source)', () => {
    for (const s of paletteById('atelier-outcomes')!.slots) {
      expect(sheet).toContain(s.light)
      expect(sheet).toContain(s.dark)
    }
  })

  it('the failed hexes are gone from the atelier stylesheets (as values — history may cite them in comments)', () => {
    const values = (css: string) =>
      css
        .split('\n')
        .filter((l) => !l.trim().startsWith('*') && !l.trim().startsWith('/*'))
        .join('\n')
    for (const old of ['#a8690c', '#c43a78', '#0e8a6e', '#1f6fd0', '#c08420', '#d14a85', '#159e76', '#4a79e4']) {
      expect(values(sheet)).not.toContain(old)
      expect(values(proc)).not.toContain(old)
    }
  })

  it('the process figure references tokens instead of re-declaring hexes', () => {
    expect(proc).toContain('var(--at-out-publish)')
    expect(proc).toContain('var(--at-surface)')
  })

  it('the old failing quartet really fails — the reason this set exists', () => {
    expect(worstPairs(['#a8690c', '#c43a78', '#0e8a6e', '#1f6fd0']).cvd).toBeLessThan(2)
  })
})

describe('studio-season records what the figure actually draws', () => {
  const set = paletteById('studio-season')!
  const stage = readFileSync(new URL('src/styles/studio-stage.css', `file://${ROOT}`), 'utf8')

  it('the lamp gold is on the floor, but never as a categorical slot', () => {
    const gold = set.shapeCarried!.find((c) => c.name.includes('lit'))!
    expect(stage).toContain(gold.light)
    expect(stage).toContain(gold.dark)
    expect(set.slots.map((s) => s.light)).not.toContain(gold.light)
    expect(set.slots.map((s) => s.dark)).not.toContain(gold.dark)
  })

  it('the exact pair that forced the split still measures 6.9 / 12.5 — the reason on the record', () => {
    // If a future re-step ever lifts this pair clear of 8, the honest move is to promote the gold
    // into `slots` and drop the shapeCarried entry; this assertion is what makes that visible
    // instead of leaving a stale justification standing in the description.
    expect(worstPairs(['#8a6a10', '#a83248']).cvd).toBeCloseTo(6.85, 1)
    expect(worstPairs(['#bd8b21', '#c2455a']).cvd).toBeCloseTo(12.54, 1)
  })

  it('ships the shape relief it claims: a pool, a taped X, and an X through an unlit pool', () => {
    for (const mark of ['.st-sf-pool', '.st-sf-x', '.st-sf-withdrawn']) expect(stage).toContain(mark)
  })

  it('wears no warning red — a withdrawal is a completed act, not an error state', () => {
    // The house crimson IS the curtain colour and is recorded as such; what must never appear is
    // a separate error/danger hue smuggled in beside it.
    for (const forbidden of ['#d32f2f', '#e5484d', '#dc2626', '#ff0000', 'red;']) {
      expect(stage).not.toContain(forbidden)
    }
  })
})

describe('field-review adds ONE hue to a plate that already had two', () => {
  const set = paletteById('field-review')!
  const plate = readFileSync(new URL('src/styles/field-plate.css', `file://${ROOT}`), 'utf8')

  it('keeps the surface package’s own stamp and caveat values unchanged', () => {
    // The plate has worn these since the field surface package; this set RECORDS them, it does not
    // re-step them. If a future re-step moves either one, this fails and the record must move too.
    expect(set.slots[0]).toMatchObject({ light: '#6a3fb5', dark: '#7e5fd3' })
    expect(set.slots[1]).toMatchObject({ light: '#9a6a08', dark: '#b3861d' })
    for (const s of set.slots) {
      expect(plate).toContain(s.light)
      expect(plate).toContain(s.dark)
    }
  })

  it('never paints a recommendation — both verifications wear one review hue', () => {
    // The runtime keeps two disagreeing records standing (MRR-FR-077); the plate must not adjudicate
    // by colour. So there is exactly ONE review hue per mode, and no status red anywhere.
    const reviewSlots = set.slots.filter((s) => s.name.startsWith('review'))
    expect(reviewSlots).toHaveLength(1)
    for (const forbidden of ['#d32f2f', '#e5484d', '#dc2626', '#ff0000', '#1baf7a', '#0e8a6e']) {
      expect(plate).not.toContain(forbidden)
    }
  })

  it('ships the relief its light-mode contrast WARN names: direct labels AND a table', () => {
    expect(set.warns).toHaveLength(1)
    const figure = readFileSync(new URL('src/components/field/ClaimFigure.astro', `file://${ROOT}`), 'utf8')
    // the direct labels are drawn by the builder, the table by the component
    const builder = readFileSync(new URL('src/lib/field/claimladder.ts', `file://${ROOT}`), 'utf8')
    expect(builder).toContain('fd-caliper-rec')
    expect(builder).toContain('fd-caliper-conf')
    expect(figure).toContain('TableFallback')
  })
})

describe('ecology-voices is ONE quartet across its four surfaces', () => {
  const set = paletteById('ecology-voices')!
  // The entrance's own declaration moved out of HubEntrance.astro's scoped <style> and into this
  // stylesheet on 2026-08-01 (WP7): the triptych cards need the same four hues as the doors, and
  // Astro's scoped styles do not reach a child component — so the quartet is declared once here,
  // on .hub-voices, and both inherit it. Same assertions, on the file that now carries the values.
  const hub = readFileSync(new URL('src/styles/hub-triptych.css', `file://${ROOT}`), 'utf8')
  const score = readFileSync(new URL('src/styles/score-map.css', `file://${ROOT}`), 'utf8')
  const partitur = readFileSync(new URL('src/components/maschinenraum/Partitur.astro', `file://${ROOT}`), 'utf8')
  // The fourth surface (2026-08-01): the works register's per-row practice hairline.
  const register = readFileSync(new URL('src/components/pages/WorksRegister.astro', `file://${ROOT}`), 'utf8')

  it('hub doors and score map carry identical practice-trio values in both modes', () => {
    for (const s of set.slots.slice(0, 3)) {
      expect(hub).toContain(s.light)
      expect(hub).toContain(s.dark)
      expect(score).toContain(s.light)
      expect(score).toContain(s.dark)
    }
  })

  it('the Partitur (always-dark stage) carries all four dark values', () => {
    for (const s of set.slots) expect(partitur).toContain(s.dark)
  })

  it('the works register carries the same practice trio, and only that trio', () => {
    for (const s of set.slots.slice(0, 3)) {
      expect(register).toContain(s.light)
      expect(register).toContain(s.dark)
    }
    // A register of the three practices lists neither the Plenum nor The Middle, so neither
    // may own a rule on it — a hue with no identity behind it is a claim the page cannot keep.
    for (const stray of ['#1baf7a', '#199e70', '#6b7684', '#77828d']) {
      expect(register, `stray identity hue ${stray}`).not.toContain(stray)
    }
  })

  it('never paints the register a warning colour — a withdrawal is not an error state', () => {
    for (const red of ['#d32f2f', '#e5484d', '#dc2626', '#ff0000', '#d03b3b', '#a83248']) {
      expect(register, `status red ${red}`).not.toContain(red)
    }
  })

  it('the near-miss hexes are gone (one blue, one orange — not three of each)', () => {
    for (const old of ['#3987e5', '#c1481c']) {
      expect(hub).not.toContain(old)
      expect(score).not.toContain(old)
    }
  })

  it('the conductor stays a declared neutral, never a fourth categorical slot', () => {
    const neutral = set.neutrals?.find((n) => n.name.includes('conductor'))
    expect(neutral).toBeDefined()
    expect(hub).toContain(neutral!.light)
    expect(score).toContain(neutral!.dark)
    // Plenum aqua must not leak onto the doors or the score map — on the homepage the
    // Partitur already gives that hue to the Plenum voice.
    expect(hub).not.toContain('#1baf7a')
    expect(score).not.toContain('#1baf7a')
    expect(score).not.toContain('#199e70')
  })
})


// ——— sequential ramps —————————————————————————————————————————————————————————
//
// A ramp owes different arithmetic than a categorical set, so it gets its own re-derivation. The
// categorical floor (all-pairs ΔE 15) would fail a ramp for doing exactly what a ramp is for; what
// a ramp must prove instead is that neighbouring steps are TELLABLE APART, that no step vanishes
// into the surface it is drawn on, and that it moves in one direction from end to end.
describe.each(SEQUENTIALS.map((s) => [s.id, s] as const))('sequential ramp %s', (_id, set: SequentialSet) => {
  const MODES = ['light', 'dark'] as const

  it('is a complete, dated record', () => {
    expect(set.steps.length).toBeGreaterThanOrEqual(3)
    expect(set.validatedOn).toMatch(/^\d{4}-\d{2}-\d{2}$/)
    expect(set.validator).toContain('validate_palette')
    for (const step of set.steps) {
      expect(step.light).toMatch(HEX)
      expect(step.dark).toMatch(HEX)
    }
    for (const mode of MODES) expect(set.surfaces[mode]).toMatch(HEX)
    expect(set.adjacent.map((a) => a.mode).sort()).toEqual(['dark', 'light'])
    expect(set.againstSurface.map((a) => a.mode).sort()).toEqual(['dark', 'light'])
  })

  it.each(MODES)('%s-mode adjacent steps re-derive, and stay far enough apart to be told apart', (mode) => {
    const hexes = set.steps.map((s) => s[mode])
    const recorded = set.adjacent.find((a) => a.mode === mode)!
    const derived = hexes.slice(1).map((hex, i) => deltaE(hexes[i], hex))
    expect(derived).toHaveLength(recorded.deltas.length)
    derived.forEach((d, i) => {
      expect(Math.abs(d - recorded.deltas[i])).toBeLessThanOrEqual(0.15)
      // a step a reader cannot separate from its neighbour is a step that is not there
      expect(d).toBeGreaterThanOrEqual(6)
    })
  })

  it.each(MODES)('%s-mode steps re-derive against the surface, and none of them disappears into it', (mode) => {
    const surface = set.surfaces[mode]
    const hexes = set.steps.map((s) => s[mode])
    const recorded = set.againstSurface.find((a) => a.mode === mode)!
    hexes.forEach((hex, i) => {
      expect(Math.abs(deltaE(hex, surface) - recorded.deltaE[i])).toBeLessThanOrEqual(0.15)
      expect(Math.abs(wcagContrast(hex, surface) - recorded.contrast[i])).toBeLessThanOrEqual(0.05)
    })
    // the faintest step still has to be visible AS a mark
    expect(deltaE(hexes[0], surface)).toBeGreaterThanOrEqual(6)
    // and the top of the ramp has to carry weight against the ground it sits on
    expect(wcagContrast(hexes[hexes.length - 1], surface)).toBeGreaterThanOrEqual(3)
  })

  it.each(MODES)('%s-mode moves in one direction — a ramp that reverses lies about its order', (mode) => {
    const surface = set.surfaces[mode]
    const away = set.steps.map((s) => deltaE(s[mode], surface))
    for (let i = 1; i < away.length; i++) expect(away[i]).toBeGreaterThan(away[i - 1])
  })

  it('carries its PALETTE marker, and every step, in the files that claim it', () => {
    for (const rel of set.usedBy) {
      const text = readFileSync(new URL(rel, `file://${ROOT}`), 'utf8')
      expect(text, `${rel} must carry "PALETTE: ${set.id}"`).toContain(`PALETTE: ${set.id}`)
      for (const step of set.steps) {
        expect(text).toContain(step.light)
        expect(text).toContain(step.dark)
      }
    }
  })
})

describe('the living globe records the emphasis rule it actually draws', () => {
  const voices = paletteById('globe-voices')!
  const ramp = sequentialById('globe-sequential')!
  const css = readFileSync(new URL('src/styles/living-globe.css', `file://${ROOT}`), 'utf8')

  it('reuses the hues this house already records, rather than inventing three more', () => {
    // the Field's voice, unchanged from hub-triptych.css; the invoked-past standout, unchanged
    expect(voices.slots[1]).toMatchObject({ light: '#2a78d6', dark: '#256abf' })
    expect(voices.slots[2]).toMatchObject({ light: '#b8410e', dark: '#e2691f' })
  })

  it('gives the ghost fleet the Field’s voice by token, not by a second hex', () => {
    expect(css).toContain('--globe-c-ghost-fleet: var(--globe-c-voice-meridian)')
  })

  it('shares one hue between the ramp’s top step and the layer in front — one ink, two jobs', () => {
    // The ramp is the room's live ink at five lightnesses; its top step IS the front hue, so a
    // country fill at its maximum and a mark of the layer in front are the same colour by
    // construction rather than by coincidence.
    expect(ramp.steps[ramp.steps.length - 1].light).toBe(voices.slots[0].light)
    expect(ramp.steps[ramp.steps.length - 1].dark).toBe(voices.slots[0].dark)
  })

  it('wears no warning red — a vessel gone dark is an identity, not an error', () => {
    for (const red of ['#d32f2f', '#e5484d', '#dc2626', '#ff0000', '#d03b3b']) {
      expect(css, `status red ${red}`).not.toContain(red)
    }
  })
})
