// src/lib/dataviz/palette.ts — the palette record for the practice figures.
//
// "Validated" used to be a CSS comment; comments drift (the atelier process figure shipped a
// quartet whose comment claimed all six validator checks passed while its green↔magenta pair
// sat at deutan ΔE 1.3 — indistinguishable for a deuteranope). This module makes the claim
// data, and palette.test.ts makes it a failing build:
//   · every shipped identity set is recorded here with its validator verdict, dated;
//   · the test re-derives the CVD/normal-vision distances in-repo (sRGB → Machado 2009
//     dichromacy simulation → OKLab) and fails if the recorded numbers drift;
//   · the test asserts the recorded hexes are the ones actually present in the CSS/components
//     that claim them (PALETTE: <id> markers, enforced by scripts/drift-check.mjs rule 7).
//
// Tool of record for NEW sets: the dataviz skill's validate_palette.js (six checks, both
// modes, --pairs all against the real surface). Record its verdict here when a set ships.
// Rules that bind every set (CLAUDE.md, 2026-07-30):
//   · identity colours, never status colours, where the practice does not judge;
//   · own steps per mode — never an automatic light/dark flip;
//   · a contrast WARN is legal only with named relief (direct labels and/or table view).

export interface PaletteSlot {
  /** what this colour identifies (an outcome, a voice) — identity, not state */
  name: string
  light: string
  dark: string
}

export interface DeclaredNeutral {
  /** a lane/door that deliberately wears neutral ink and sits OUTSIDE the categorical set */
  name: string
  light: string
  dark: string
  note: string
}

export interface WorstPairs {
  mode: 'light' | 'dark'
  /** worst all-pairs ΔE(OKLab ×100) under protan/deutan simulation (validator's CVD check) */
  cvd: number
  cvdPair: string
  cvdType: 'protan' | 'deutan'
  /** tritan reported separately by the validator (informational; rarest dichromacy) */
  tritan: number
  /** worst all-pairs ΔE for normal vision — hard floor 15 */
  normal: number
  normalPair: string
}

export interface PaletteWarn {
  hex: string
  mode: 'light' | 'dark'
  /** WCAG contrast vs the weakest declared surface of that mode */
  contrast: number
  /** the relief that makes the WARN legal — must exist on every figure using the set */
  relief: string
}

export interface PaletteSet {
  id: string
  description: string
  slots: PaletteSlot[]
  neutrals?: DeclaredNeutral[]
  /** chart surfaces the set was validated against, per mode */
  surfaces: { light: string[]; dark: string[] }
  pairs: 'all' | 'adjacent'
  validatedOn: string
  validator: string
  worst: WorstPairs[]
  warns: PaletteWarn[]
  /** files that carry these hexes (each carries a "PALETTE: <id>" marker) */
  usedBy: string[]
}

export const PALETTES: readonly PaletteSet[] = [
  {
    id: 'atelier-outcomes',
    description:
      "The Atelier's four outcome identities (published / at the gate / kept as study / " +
      'closed unfinished), shared by the hub map and the process figure. Violet — the ' +
      "practice's own hue — goes to published; closed lines get an identity colour, never a " +
      'warning red ("closing costs what continuing costs"). Replaces the quartet ' +
      '#a8690c/#c43a78/#0e8a6e/#1f6fd0, which FAILED CVD separation (deutan ΔE 1.3 light / ' +
      '1.6 dark on the green↔magenta pair) despite an in-CSS comment claiming otherwise.',
    slots: [
      { name: 'published', light: '#4a3aa7', dark: '#9085e9' },
      { name: 'at the gate', light: '#2a78d6', dark: '#256abf' },
      { name: 'kept as study', light: '#eda100', dark: '#c98500' },
      { name: 'closed unfinished', light: '#e87ba4', dark: '#d55181' },
    ],
    surfaces: { light: ['#f6f1e7', '#f7f8fa'], dark: ['#1b1815', '#141414'] },
    pairs: 'all',
    validatedOn: '2026-07-31',
    validator: 'dataviz skill validate_palette.js (six checks) — ALL CHECKS PASS per mode/surface',
    worst: [
      {
        mode: 'light',
        cvd: 13.0,
        cvdPair: '#e87ba4↔#2a78d6',
        cvdType: 'protan',
        tritan: 5.8,
        normal: 16.3,
        normalPair: '#2a78d6↔#4a3aa7',
      },
      {
        mode: 'dark',
        cvd: 10.9,
        cvdPair: '#d55181↔#256abf',
        cvdType: 'protan',
        tritan: 8.7,
        normal: 16.3,
        normalPair: '#256abf↔#9085e9',
      },
    ],
    warns: [
      {
        hex: '#eda100',
        mode: 'light',
        contrast: 1.92,
        relief: 'direct row labels + table view (both shipped by the process figure)',
      },
      {
        hex: '#e87ba4',
        mode: 'light',
        contrast: 2.39,
        relief: 'direct row labels + table view (both shipped by the process figure)',
      },
    ],
    usedBy: ['src/styles/atelier-sheet.css'],
  },
  {
    id: 'ecology-voices',
    description:
      'The ecology quartet — one identity colour per voice across the hub doors, the ' +
      'encounter score map and the Partitur, so the same practice never wears two colours ' +
      'on one page. The fourth categorical slot belongs to the Plenum (Partitur voice); the ' +
      'conductor/The Middle lane is a DECLARED NEUTRAL outside the set — "no resident — kept ' +
      'by the conductor", grayness is the meaning — because giving it the Plenum aqua would ' +
      'put one hue on two identities on the homepage. The previous light door set FAILED ' +
      'with the gray counted as a fourth categorical slot (chroma 0.025, normal ΔE 13.8).',
    slots: [
      { name: 'ulysses / atelier', light: '#4a3aa7', dark: '#9085e9' },
      { name: 'meridian / field', light: '#2a78d6', dark: '#256abf' },
      { name: 'ensemble / studio', light: '#eb6834', dark: '#d95926' },
      { name: 'plenum', light: '#1baf7a', dark: '#199e70' },
    ],
    neutrals: [
      {
        name: 'conductor / the middle',
        light: '#6b7684',
        dark: '#77828d',
        note: 'direct-labeled lane/door chrome; never a categorical slot',
      },
    ],
    surfaces: { light: ['#f7f8fa'], dark: ['#141414', '#131316'] },
    pairs: 'all',
    validatedOn: '2026-07-31',
    validator: 'dataviz skill validate_palette.js (six checks) — ALL CHECKS PASS per mode/surface',
    worst: [
      {
        mode: 'light',
        cvd: 9.2,
        cvdPair: '#1baf7a↔#eb6834',
        cvdType: 'deutan',
        tritan: 9.6,
        normal: 16.3,
        normalPair: '#2a78d6↔#4a3aa7',
      },
      {
        mode: 'dark',
        cvd: 9.4,
        cvdPair: '#199e70↔#d95926',
        cvdType: 'deutan',
        tritan: 9.4,
        normal: 16.3,
        normalPair: '#256abf↔#9085e9',
      },
    ],
    warns: [
      {
        hex: '#1baf7a',
        mode: 'light',
        contrast: 2.65,
        relief: 'direct labels on doors/lanes + table renditions under score map and Partitur',
      },
    ],
    usedBy: [
      'src/components/pages/HubEntrance.astro',
      'src/styles/score-map.css',
      'src/components/maschinenraum/Partitur.astro',
    ],
  },
]

/** Lookup by id — WP6 practice packages add their sets to PALETTES and get the same guards. */
export function paletteById(id: string): PaletteSet | undefined {
  return PALETTES.find((p) => p.id === id)
}
