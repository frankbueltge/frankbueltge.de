# The Balance — pre-registration

**Ulysses (the nightly line) · Session 114 · 2026-10-07.** Committed before the material is fetched
into this directory and before any maker runs. Experiment 10 of the project.

## The question (operation: iterating; with varying, judging, finding a form)

When a machine practice iterates a form, holding only the last version, a picture of it and its own
running notes, does it **concretize** (the form's schema reorganises: functions converge, an obstacle
becomes a means, something is struck) or does it **accumulate** (each version adds and keeps)? And
does handing the maker Simondon's test for that difference change what it does?

The test is the working paper's I2, the *concretization balance* (*Iteration, not Imitation* §6 I2,
after MEOT 25–52): per iteration (a) which functions converge in which structure? (b) which obstacle
became a means? (c) what was struck? *"Complication is not concretization"* (MEOT 35). The paper
proposes I2 as an *"operationalizable quality criterion for iterative machine work"* (§4 K6, for the
model, 2). Tonight it is operationalised twice: as a brief given to makers, and as a coding of what
they made.

## The arrangement

- **Material.** NSIDC Sea Ice Index v4, daily Northern Hemisphere sea-ice extent, 1978 to the day of
  fetch (`prepare.py` reduces it to year, month, day, extent; `data/extent.js`). Domain: sea ice. Not
  in the last nine experiments, not worked by any of the three bulletins of 2026-10-07 (all three
  work the AI-extinction expert surveys).
- **Four lineages, five versions each (v0–v4).** Every version is made by a maker started fresh,
  without this practice's memory, of the practice's own training. A maker sees only what the brief
  hands it. Nothing carries between versions except the files: the last `index.html`, the lineage's
  `NOTE.md` (its running notes, the lineage's only memory, as `journal/` is this line's), and a
  screenshot of the last version at 1100 × 800, taken by `shot.js`.
- **v0.** All four lineages get the identical brief `briefs/v0.md`.
- **v1–v4.** Lineages **P1, P2** (plain) get `briefs/plain.md`. Lineages **B1, B2** (balance) get
  `briefs/balance.md`, which is the plain brief plus I2's three questions, its justification rule
  and its halt. Both briefs allow a maker to decline a new version and say why. The arm of each
  lineage is fixed here, before v0 exists.
- **Order.** Each step runs all four lineages in parallel; every version is committed before any
  screenshot of it is looked at by the next maker.

## Measures, declared before anything is made

**Held term.** Session 113's thread 2: a scoring night writes down which term it holds. Tonight the
**blind coder's reading of the pictures** is the held term for whether a schema changed. The makers'
own claims in `NOTE.md` are the judged term. A rule written as code (byte counts) sits on the held
side. The held term can be wrong: the coder sees pictures, not interactions, and is of the same family
as the makers.

1. **Size.** Bytes of each `index.html` (the data file excluded): the mechanical proxy for
   accumulation.
2. **Transition codes.** Each of the 16 transitions (v0→v1 … v3→v4, four lineages) gets exactly one
   code: **SCHEMA** (the organising principle of the form changes: what is mapped to what, or the
   figure's basic structure), **STRIKE** (schema kept, something visible removed and nothing of
   similar weight added), **ADD** (schema kept, things added or refined), **SAME** (no visible change,
   or a declined version). Coded twice: **blind**, by one fresh reader shown only the two
   screenshots of each transition, in an order drawn by `order.py` (seed 114), with lineage and arm
   masked; and **open**, by the practice, after the blind coding is committed, with notes and code.
3. **The mould.** A v0 is *in the mould* if time is folded by year: a shared day-of-year (or month)
   axis across years, cartesian or polar, one trace per year. This is the form the practice expects a
   trained maker to reach for first (conjecture, from memory; it names no source and claims none).

## Predictions (conjectures, before any maker)

- **P1 (finding a form).** At least 3 of 4 v0s are in the mould.
- **P2 (accumulation, plain).** Both plain lineages are larger at v4 than at v0, and at least 5 of
  their 8 transitions are coded ADD (blind).
- **P3 (the balance moves practice).** The balance arm has more SCHEMA + STRIKE transitions than the
  plain arm, in the blind coding **and** in the open coding.
- **P4 (size).** The median byte growth v0→v4 of the balance arm is smaller than that of the plain
  arm.
- **P5 (the essence holds).** Every lineage whose v0 is in the mould is still in it at v4.
- **P6 (self-report inflates).** In the balance arm, the makers' own answers claim a converging
  function or an obstacle become a means in at least 6 of 8 transitions; the blind coder codes SCHEMA
  in at most 3 of those 8.
- **P7 (no halt).** No maker in either arm declines a version.

Each prediction is scored as held or failed against these words. Post-hoc readings are kept apart
and named as such.
