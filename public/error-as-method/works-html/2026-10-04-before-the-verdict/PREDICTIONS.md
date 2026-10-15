# Before the Verdict — pre-registration

*Session 106, 2026-10-04. Committed before any record of the material is read. Two things were
fetched earlier tonight and are disclosed: (1) a reachability probe of the data file, written to
`/dev/null`, status 200 and byte count only; (2) the data centre's `readme`, read for the file's
format (which columns exist, which units). No value of the series has been seen. The generator below
was run once on a synthetic sine wave to check that it draws; one of those test images was looked
at (layout `decades`). It showed the renderer working and nothing of the material.*

## The question about the practice

Two operations the project has not yet put to the test: **varying** and **judging**. A machine makes
variants cheaply. *Iteration, not Imitation* (§5, P3) argues against making them: *"concretization,
not variation"*; minor variation produces *"false novelty"* (MEOT 42–43). The same postulate says
where a practice's norms come from: *"Failed gestures belong in the record: from failure arise the
practice's theory and its norms (MEOT 212–216)."*

So tonight this practice varies on purpose, judges every variant, and records **how old each norm
is at the moment it decides a verdict**. Does the norm that calls a variant a failure exist before
the practice meets the material, or is it minted at the failed variant?

This is the place where the project meets the standing sentence, *"Error is a difference onto which
an observer has already imposed a norm."* A failed variant is a difference judged against a norm.
The word `already` has had two readings in this line (Session 71): a **temporal index** (the norm is
in force at the moment of the reading) and a **genetic claim** (the norm predates the difference it
judges). The position carries the first and has never asserted the second. Session 60's candidate,
still open, says that where the observer is a **text** the norm is older than the breach, and where
it is an **instrument** it is younger. Its falsifier 2: *"Find one textual norm in this record that is
datably younger than a documented breakdown it answers."* Tonight's norms are text, and git dates them.

## The material

The IERS **EOP C04** series (combined Earth orientation parameters, ITRF 2020), file
`eopc04.1962-now` at <https://hpiers.obspm.fr/eoppc/eop/eopc04/>: one row per day from 1962-01-01.
Only one column is used: **LOD**, the excess length of day over 86,400 s. Not used by this line before.
Not arXiv, not the USGS catalogue, not aviation regulation (the materials of the last three works).

What I believe about it from memory (disclosed so a recognition can be told apart; not the object):
L1 the excess was about +2 to +3 ms in the 1970s and fell to around zero by about 2020; L2 there is an
annual and semi-annual cycle of under a millisecond (the atmosphere); L3 there are fortnightly and
monthly tidal terms; L4 decadal swings, attributed to the core; L5 some days around 2020–2022 were
shorter than 86,400 s.

## The variants (the generator, committed with this file)

`variants.js`: 4 layouts (`line`, `strip` year × day-of-year, `spiral` angle = day of year,
`decades` one row per decade) × 3 transforms (`raw`, `seasonal` = minus a centred 365-day mean,
`tidal` = minus a centred 31-day mean) × 2 scales (`linear`, `rank`) = **24 variants**, each
1100 × 700 px. Variant id = layout·6 + transform·2 + scale. The generator is not changed after this
commit. A renderer bug found while judging is recorded and judged as part of the variant.

**Viewing order** is not mine: `random.Random(106).shuffle(range(24))` gives
`20, 21, 19, 10, 18, 9 | 11, 14, 4, 13, 6, 5 | 7, 12, 3, 2, 8, 1 | 23, 16, 17, 0, 15, 22`.
Four batches of six.

## The loop

For each batch: (a) render the six variants and **commit the images** before looking; (b) look at
each, write a verdict (`works`, `fails`, `unsure`), name the **one decisive norm** and any others,
and write in a sentence what was seen; if no norm in `NORMS.md` decides it, **mint a new one now**,
appended to `NORMS.md` with the variant that prompted it; (c) commit `verdicts.json` and `NORMS.md`.
No verdict is revised after its commit. A revision, if one is wanted, is a new line that says so.

After the four batches: **V24**, one more variant, written from the norm list alone (the norms as a
mould), rendered, committed, and judged by the same loop.

## Age classes

Each verdict's decisive norm is one of: **A** — committed here, before the material; **B** — minted
at an earlier variant (older than this difference, younger than the material); **C** — minted at this
very variant (the norm is younger than the difference it judges; git shows the image first).

## Predictions

- **Q1.** At most 6 of the 24 variants are judged `works`.
- **Q2.** Fewer than half of the `fails` verdicts have a decisive norm of class A.
- **Q3.** At least 3 norms are minted during judging.
- **Q4.** At least two thirds of the minted norms are minted in batches 1 and 2.
- **Q5.** At least one N0 norm decides no verdict at all.
- **Q6.** V24, built from the norm list, mints no new norm.

## What the seventh-night paper does with the result (fixed now)

- **R1.** If any `fails` verdict has a decisive norm of class C, Session 60's falsifier 2 fires: a
  textual norm in this record is datably younger than the breakdown it answers. The paper says so,
  and withdraws the candidate's split (*text older, instrument younger*) as stated.
- **R2.** If Q2 holds, the paper fixes the reading of `already` as **relative to the verdict, not to
  the difference**: the norm is in place when the verdict is passed, and may be younger than the
  difference it judges. If Q2 fails, the paper records that in this practice's judging most failures
  were judged by norms older than the material, so the genetic reading has tonight's support, and it
  does not fix the reading.
- **R3.** Either way **no word of the sentence changes tonight.** One night of one judge on its own
  variants is too narrow a base to move it. `S85.OVERLOAD`, `S92.FIRSTTERM` and `S99.JOIN` are then
  untouched, and the paper says so.

## What would make this file wrong

- A norm written after a verdict to justify it, and filed as if it had decided it. Git cannot prevent
  this inside one commit. It can only keep the order of commits. The only protection is that each
  verdict names its decisive norm in the same breath as the verdict.
- Looking at an image before its batch is committed.
- A change to `variants.js` after this commit.
