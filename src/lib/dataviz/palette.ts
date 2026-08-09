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

export interface ShapeCarriedSlot {
  /** an identity whose distinction is carried by the MARK'S SHAPE, not by its hue — recorded
   *  here, deliberately OUTSIDE the categorical set, because its hue sits in the validator's
   *  6–8 CVD floor band against another slot. Distinct from DeclaredNeutral: that one wears
   *  neutral ink on purpose (grayness IS the meaning); this one is fully chromatic and simply
   *  does not carry its identity by colour alone. */
  name: string
  light: string
  dark: string
  /** the shape that carries the meaning, the measured band that made this necessary, and where
   *  the relief is shipped — a claim this file's test re-derives rather than takes on trust */
  note: string
}

export interface PaletteSet {
  id: string
  description: string
  slots: PaletteSlot[]
  neutrals?: DeclaredNeutral[]
  /** hues that ship on the figure but are NOT categorical slots because shape, not colour,
   *  separates them (see ShapeCarriedSlot) — excluded from the categorical distance maths on
   *  purpose, and never a way to smuggle a failing hue into a passing record */
  shapeCarried?: ShapeCarriedSlot[]
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
      // The hub's own declaration moved out of HubEntrance.astro's scoped <style> on 2026-08-01
      // (WP7): the triptych is a component of its own, Astro's scoped styles do not reach a child
      // component, and the alternative was two copies of this quartet on one page. Both the doors
      // grid and the triptych cards now inherit it from .hub-voices in this one stylesheet.
      'src/styles/hub-triptych.css',
      'src/styles/score-map.css',
      'src/components/maschinenraum/Partitur.astro',
      // The works register (/works, 2026-08-01) gives each row the hairline of the practice that
      // made the work. Three slots only — the Plenum is not in that register and The Middle is
      // the declared neutral — and the hue never carries meaning alone: every row states its
      // practice by name in the column beside the rule, so the light-mode contrast WARN below
      // cannot reach it (nothing on that page is TEXT in these hues).
      'src/components/pages/WorksRegister.astro',
      // The Plenum's own rooms (/plenum, 2026-08-02) use exactly ONE slot of this set — their
      // own aqua — so the guest voice wears the same colour in its room as it does on the
      // Partitur lane and the score map. It is never text there and never the sole carrier of a
      // state: it is a 2px left rule and an 8px square, each sitting beside a word that says the
      // same thing ("the newest sitting"), which is the recorded relief for the light-mode WARN
      // below. Remove the hue entirely and that page loses decoration, not meaning.
      'src/styles/plenum-dossier.css',
    ],
  },
  {
    id: 'studio-season',
    description:
      "The Studio's season floor (SeasonFloor.astro): what the house did to each work, on one " +
      'stage floor. TWO categorical slots plus ONE shape-carried hue, and the split is the whole ' +
      'point of this record. Measured against the stage floor, the studio\'s lamp gold and its ' +
      'curtain crimson separate for normal vision (ΔE 16.4 light / 19.0 dark) but collapse for a ' +
      'deuteranope in LIGHT mode: ΔE 6.9, inside the validator\'s 6–8 floor band, which is legal ' +
      'ONLY with secondary encoding. On this figure the secondary encoding is not an add-on but ' +
      'the drawing itself — a lit position is a hard-edged POOL, a strike is a taped X, a ' +
      'withdrawal is an X drawn THROUGH an unlit pool — so the gold is recorded as a ' +
      'shapeCarried hue rather than counted as a third categorical slot, and the categorical ' +
      'maths runs over the pair that really does carry identity by colour alone: crimson (struck) ' +
      'against the violet (returned by the eye) the ecology already gives the atelier for its own ' +
      'published works. Recording it the other way round — three slots — would have put a 6.9 ' +
      "pair through an assertion that hard-fails below 8, and the honest options were to weaken " +
      'the test or to describe the figure as it is actually drawn. NOTE on the numbers: the ' +
      "validator's own printed light CVD for the crimson↔violet pair is 17.1, palette.test.ts " +
      're-derives 18.2, because the validator clamps the Machado-simulated channels back into ' +
      'gamut and the test does not — the two agree to 0.01 on every less saturated pair in this ' +
      'file, and both sit far above the floor of 8, so the verdict is unaffected. The values ' +
      'recorded below are the TEST\'s, since the test is the tripwire. No warning red anywhere: a ' +
      'withdrawal is a completed honest act, so it wears the house\'s own curtain colour, not an ' +
      'error state.',
    slots: [
      { name: 'struck — a taped X on the floor', light: '#a83248', dark: '#c2455a' },
      { name: 'returned by the eye', light: '#4a3aa7', dark: '#9085e9' },
    ],
    shapeCarried: [
      {
        name: 'lit / premiered — a hard-edged pool',
        light: '#8a6a10',
        dark: '#bd8b21',
        note:
          'the lamp gold; deutan ΔE 6.9 against the curtain crimson in light mode (12.5 in dark), ' +
          'i.e. inside the 6–8 floor band. Relief, shipped on every figure that uses this set: a ' +
          'lit position is a filled hard-edged pool and a struck one is a taped X (different ' +
          'marks, not two colours of one mark), every pool is direct-labelled with the work title ' +
          'in Didone capitals, and the whole season is repeated as a table with the verbatim ' +
          'reason and its source.',
      },
    ],
    surfaces: { light: ['#f3efe9', '#e9e4dc'], dark: ['#141110', '#0e0c0b'] },
    pairs: 'all',
    validatedOn: '2026-07-31',
    validator:
      'dataviz skill validate_palette.js (six checks, --pairs all, per mode against the stage ' +
      'floor) — categorical pair ALL CHECKS PASS; the three-hue run reports the 6.9 deutan WARN ' +
      'that this record answers with shapeCarried above',
    worst: [
      {
        mode: 'light',
        cvd: 18.2,
        cvdPair: '#a83248↔#4a3aa7',
        cvdType: 'protan',
        tritan: 26.2,
        normal: 23.7,
        normalPair: '#a83248↔#4a3aa7',
      },
      {
        mode: 'dark',
        cvd: 20.6,
        cvdPair: '#c2455a↔#9085e9',
        cvdType: 'deutan',
        tritan: 25.4,
        normal: 23.3,
        normalPair: '#c2455a↔#9085e9',
      },
    ],
    // No contrast WARN to record: every hue in this set, categorical and shape-carried alike,
    // clears 3:1 against BOTH declared surfaces of its mode (weakest: #c2455a on #141110 at 3.84).
    warns: [],
    usedBy: ['src/styles/studio-stage.css'],
  },
  {
    id: 'atelier-refrain',
    description:
      "The refrain score's three voices (RefrainScore.astro + src/lib/atelier/refrain.ts): " +
      'territory / home / opening — the three coexisting aspects of a work-line, per the ' +
      "published model's postulate 4. Identity colours for three aspects of ONE line, never " +
      'status: a deferred opening is a notated rest in the opening voice, not a warning. The ' +
      'triad deliberately avoids every hue the atelier entrance already spends (the outcomes ' +
      'quartet: violet/azure/amber/pink) so no hue means two things on one page. Separation ' +
      'rides lightness + the blue–yellow axis, which protan/deutan simulation preserves: ' +
      'teal-green (territory, the ground being built), gold (home, the working interior), ' +
      'plum (opening, the outward voice). NOTE: the dark-mode tritan value (6.7, validator, ' +
      'informational) sits under 8 — legal here because voice identity is never carried by ' +
      'colour alone: each voice is a fixed stave with a direct label at the sheet edge, and ' +
      'the whole score repeats as a table with verbatim quotes (the same relief the figure ' +
      'ships for every reader).',
    slots: [
      { name: 'territory — the ground being built', light: '#00846d', dark: '#23a184' },
      { name: 'home — the working interior', light: '#a2700f', dark: '#b8891f' },
      { name: 'opening — the outward voice', light: '#7d2b78', dark: '#c159b9' },
    ],
    surfaces: { light: ['#f6f1e7', '#f7f8fa'], dark: ['#1b1815', '#141414'] },
    pairs: 'all',
    validatedOn: '2026-08-02',
    validator:
      'dataviz skill validate_palette.js (six checks, --pairs all, per mode against both ' +
      'atelier surfaces) — ALL CHECKS PASS in both modes on both surfaces; no contrast WARN ' +
      '(weakest 3.84:1, #a2700f on #f6f1e7)',
    worst: [
      {
        mode: 'light',
        cvd: 10.1,
        cvdPair: '#00846d↔#a2700f',
        cvdType: 'protan',
        tritan: 15.2,
        normal: 17.1,
        normalPair: '#00846d↔#a2700f',
      },
      {
        mode: 'dark',
        cvd: 8.3,
        cvdPair: '#23a184↔#c159b9',
        cvdType: 'deutan',
        tritan: 6.7,
        normal: 17.3,
        normalPair: '#23a184↔#b8891f',
      },
    ],
    warns: [],
    usedBy: ['src/styles/atelier-refrain.css'],
  },
  {
    id: 'field-review',
    description:
      "The Field's claim plate (src/lib/field/claimladder.ts + components/field/ClaimFigure.astro): " +
      'a claim of the collective\'s, the ruling that caps what it may say, and the two verifications ' +
      'closing in on it. THREE categorical slots, and the third is the only new hue this package ' +
      'adds: the lab plate already wore the practice\'s violet stamp and its ochre caveat flag ' +
      '(field-plate.css since the surface package), and a figure about DISSENT needed an identity ' +
      'the plate did not already spend on something else — the two verifications and every finding ' +
      'they filed. Deliberately NOT a status pair: the plate never says which verification is right. ' +
      'A "fail" recommendation and a "pass" recommendation wear the SAME review magenta and are ' +
      'separated by their direct labels and by the direction their caliper closes from, because the ' +
      'runtime\'s own invariant (MRR-FR-077) keeps both records standing rather than adjudicating ' +
      'between them — painting one of them red would be the site taking the side the runtime refuses ' +
      'to take. The two existing hues keep their meanings unchanged: violet is the record\'s own ' +
      'hand (the claim, its ruled rung, the primary anchors), ochre is obligation (the standing ' +
      'dissent invariant, and the refused-language zone above the ceiling).',
    slots: [
      { name: 'stamp — the record’s own hand', light: '#6a3fb5', dark: '#7e5fd3' },
      { name: 'caveat — a standing obligation', light: '#9a6a08', dark: '#b3861d' },
      { name: 'review / dissent — a verification and its findings', light: '#e87ba4', dark: '#d55181' },
    ],
    surfaces: { light: ['#f5f7f6', '#e9eeeb'], dark: ['#12161a', '#1a2026'] },
    pairs: 'all',
    validatedOn: '2026-08-01',
    validator:
      'dataviz skill validate_palette.js (six checks, --pairs all, per mode against both declared ' +
      'field surfaces) — ALL CHECKS PASS in both modes; the one WARN is the light magenta\'s contrast, ' +
      'answered by the relief recorded below',
    worst: [
      {
        mode: 'light',
        cvd: 18.8,
        cvdPair: '#9a6a08↔#e87ba4',
        cvdType: 'deutan',
        tritan: 14.7,
        normal: 22.7,
        normalPair: '#9a6a08↔#e87ba4',
      },
      {
        mode: 'dark',
        cvd: 11.1,
        cvdPair: '#b3861d↔#d55181',
        cvdType: 'deutan',
        tritan: 10.9,
        normal: 19.9,
        normalPair: '#7e5fd3↔#d55181',
      },
    ],
    warns: [
      {
        hex: '#e87ba4',
        mode: 'light',
        // 2.50 against the plate itself (#f5f7f6); 2.29 against the card surface (#e9eeeb), which
        // is the weakest declared surface and therefore the number recorded
        contrast: 2.29,
        relief:
          'direct labels on every caliper (recommendation and confidence lettered beside the jaw) + ' +
          'the full findings table with each statement verbatim — both shipped by ClaimFigure.astro',
      },
    ],
    usedBy: ['src/styles/field-plate.css'],
  },
  {
    id: 'society-bands',
    description:
      "The Society's four level-bands (/society, SocietyFigure.astro): senses azure, " +
      'body+builders amber, proto-specialists magenta, reflection (B-brain and K-lines) ' +
      'violet. The quartet is atelier-outcomes UNCHANGED — same eight hexes, new identities ' +
      'on a different page (cross-page hue reuse is legal; one hue may never mean two things ' +
      'on ONE page) — so the 2026-07-31 validator run stands, on a surface subset of the ' +
      'one it was measured against. The censors wear the declared neutral: suppression has ' +
      'no colour of its own. A silenced agent is carried by SHAPE (taped X + strikethrough ' +
      'label), never by colour alone.',
    slots: [
      { name: 'senses', light: '#2a78d6', dark: '#256abf' },
      { name: 'body + builders', light: '#eda100', dark: '#c98500' },
      { name: 'proto-specialists', light: '#e87ba4', dark: '#d55181' },
      { name: 'reflection — B-brain and K-lines', light: '#4a3aa7', dark: '#9085e9' },
    ],
    neutrals: [
      {
        name: 'censors / a silenced agent',
        light: '#6b7684',
        dark: '#77828d',
        note: 'gate squares and ablated nodes; suppression deliberately wears no identity hue',
      },
    ],
    // #0b0b0d is the room exit's floor (/society/room) — a darker surface than the page's,
    // added 2026-08-07 when the room was restaged. All four dark hexes clear 3.0 against it
    // (weakest: senses #256abf at 3.65), so it adds no WARN.
    surfaces: { light: ['#f7f8fa'], dark: ['#141414', '#0b0b0d'] },
    pairs: 'all',
    validatedOn: '2026-07-31',
    validator:
      'dataviz skill validate_palette.js (six checks) — ALL CHECKS PASS per mode/surface, ' +
      'run 2026-07-31 for atelier-outcomes; society-bands reuses that quartet unchanged on ' +
      'a subset of the measured surfaces, and palette.test.ts re-derives the distances here',
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
        contrast: 2.04,
        relief:
          'every node wears its name as a direct label, and the whole roster repeats as a ' +
          'table (both shipped by SocietyFigure.astro)',
      },
      {
        hex: '#e87ba4',
        mode: 'light',
        contrast: 2.53,
        relief:
          'every node wears its name as a direct label, and the whole roster repeats as a ' +
          'table (both shipped by SocietyFigure.astro)',
      },
    ],
    // The room exit is listed here on purpose: it shipped 2026-08-06 carrying this set's
    // marker while using four brighter hexes of its own, one pair of which (senses #4b8fe4
    // ↔ reflection #9085e9) measured protan ΔE 1.1 against a floor of 8. Naming the file
    // here is what makes the test check it rather than take its comment's word.
    usedBy: ['src/styles/society.css', 'src/styles/society-room.css'],
  },
  {
    id: 'holdings-neighborhood',
    description:
      'The neighbourhood figure (/experiments/neighbors): every experiment on one rail, the ' +
      'projects that already do something like it inward on the same spoke, and the empty ' +
      'stretch between them — the daylight. THREE categorical slots, one per verdict class of ' +
      'the USP audit of 2026-08-09, plus the DECLARED NEUTRAL every neighbour wears: a project ' +
      'outside this house is not one of this house\'s identities, and greyness is that meaning. ' +
      'The quartet is atelier-outcomes MINUS its pink — the same hexes, new identities on a ' +
      'different page (cross-page reuse is legal; one hue may never mean two things on ONE ' +
      'page), so the 2026-07-31 run stands and only the surfaces change. DELIBERATELY NOT A ' +
      'STATUS SET: a verdict of "redundant" is a finding about the world, not an error state, ' +
      'so it wears the house\'s amber and not a warning red — the same reasoning that keeps a ' +
      'closed atelier line out of red. The distance carries the same fact as the hue (the ' +
      'audit\'s class), which is redundant encoding on purpose: the figure stays readable for a ' +
      'dichromat, in greyscale and in print.',
    slots: [
      { name: 'wide daylight — the audit found no project doing this', light: '#4a3aa7', dark: '#9085e9' },
      { name: 'some daylight — neighbours named, something still unreplicated', light: '#2a78d6', dark: '#256abf' },
      { name: 'little daylight — a named neighbour already does this', light: '#eda100', dark: '#c98500' },
    ],
    neutrals: [
      {
        name: 'a neighbour — a project outside this house',
        light: '#6b7684',
        dark: '#77828d',
        note: 'every prior-art mark and its spoke line; never a categorical slot, and every mark carries the project’s name in the register below the figure',
      },
    ],
    surfaces: { light: ['#edeef0', '#f7f8fa'], dark: ['#0a0a0a', '#141414'] },
    pairs: 'all',
    validatedOn: '2026-08-09',
    validator:
      'validate_palette.js was NOT re-run for this set, and this record says so rather than ' +
      'implying a run: the three hexes ARE the atelier-outcomes trio whose six-check run of ' +
      '2026-07-31 passed on a SUPERSET of these pairs. What changed is the surfaces — this page ' +
      'sits on the site background (#edeef0 light / #0a0a0a dark), which is why the contrast ' +
      'WARN below is measured at 1.87 here and 2.04 where society-bands measured it. ' +
      'palette.test.ts re-derives the CVD and normal-vision distances below; the tritan values ' +
      'were derived in-repo with the same Machado matrices (informational — protan/deutan carry ' +
      'the pass/fail weight).',
    worst: [
      {
        mode: 'light',
        cvd: 14.6,
        cvdPair: '#4a3aa7↔#2a78d6',
        cvdType: 'deutan',
        tritan: 17.5,
        normal: 16.3,
        normalPair: '#4a3aa7↔#2a78d6',
      },
      {
        mode: 'dark',
        cvd: 11.7,
        cvdPair: '#9085e9↔#256abf',
        cvdType: 'protan',
        tritan: 17.3,
        normal: 16.3,
        normalPair: '#9085e9↔#256abf',
      },
    ],
    warns: [
      {
        hex: '#eda100',
        mode: 'light',
        // against the page background #edeef0, which is the weaker of the two declared light
        // surfaces for a hue this dark — not against the panel, where it measures 2.04
        contrast: 1.87,
        relief:
          'every spoke is direct-labelled with its experiment’s title, and the whole field ' +
          'repeats below the figure as a register (verdict, daylight sentence, every neighbour ' +
          'as a named link) plus a compact table — nothing on this page is reachable only by ' +
          'reading a colour',
      },
    ],
    usedBy: ['src/styles/neighborhood.css'],
  },
]

/** Lookup by id — WP6 practice packages add their sets to PALETTES and get the same guards. */
export function paletteById(id: string): PaletteSet | undefined {
  return PALETTES.find((p) => p.id === id)
}
