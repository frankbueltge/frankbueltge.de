# Told Where — predictions, fixed before any maker exists

**Session 133, 2026-10-17. Experiment 23 of the project. Operation: judging (perceiving, finding a form).**
Committed with `extract.py`, `prepare.py`, `render.js`, the picture, `materials/holds.json`, the briefs, both coders'
briefs, coder H's test criterion and `plan.json`, before any maker runs. Nothing below is changed after a maker runs;
a correction is a new dated note.

## What is asked

Experiments 21 and 22 told makers **what** their record was. Whatever the picture did not contradict was kept and
given back as the maker's own reading, true or false: 0 of 12 told makers who kept a kind said they had been told it
(F-236, F-241). Session 132 read this against source monitoring (Johnson, Hashtroudi and Lindsay 1993) and proposed
that the source is lost where the maker's own reading **confirms** the claim, and kept where nothing can confirm it.
Its own forecast on experiment 22 failed: a false kind that nothing on the picture confirmed lost its source as
completely (`docs/research-notes/machine-practice/audits/2026-10-16-source-kept/SCORE-exp22.md`).

One kind of told statement has never been tried: not *what* but **where**. A place cannot be read off a picture
without axes or clock. It cannot be fitted to the record the way the false carbon dioxide was fitted, and it cannot be
refuted. If the makers hold *where* as given while they absorb *what*, then this family does keep sources. It keeps
them for statements it has no way to make its own. Then what experiments 21 and 22 showed is not a reporting habit.
It is absorption of what can be read into the material. If *where* is absorbed as well, then nothing told survives as
told unless the picture contradicts it.

The project question: **when a machine maker is given words about its material, which of them does it keep as given,
and which does it make its own?** For a practice that delegates making, this decides what its makers' reports can be
trusted to carry.

**The record.** Downwelling global solar irradiance on a level surface at the SURFRAD station Fort Peck, Montana
(48.31° N, 105.10° W, 634 m; NOAA GML, CC0), hourly means of the provider's 1-minute values flagged good,
15 July – 13 September 2025, 1,464 hours, none empty. `materials/holds.json`, measured before any maker: amplitude
at 24.00 h 347 W m⁻², at 12.42 h 1.9; 40 % of hours below 5 W m⁻² (the night floor). One instrument fault (8 August,
18 UTC: 23 minutes missing, then ten flagged minutes falling from 8,566 W m⁻²) is excluded by the provider's flag.

**The picture.** Grain F as in experiments 19 to 22: 300 × 90 px, JPEG 30, one dot per hour, no axes.

**The cells** (seed 133, six each). Every brief says *"one value every hour for 61 consecutive days, 1,464 values"*.
All told sentences are true.

- **N**: *"You are not told what was measured, where or when."*
- **K** (what): *"It is a record of the sunlight reaching the ground: the solar radiation falling on a level surface."*
  … *"You are not told where or when."* The picture can confirm it: a flat floor every night.
- **P** (where): *"It was recorded at a station called Fort Peck, in north-eastern Montana, USA, 634 metres above sea
  level."* … *"You are not told what was measured or when."* The picture can neither confirm nor refute it.
- **KP**: both sentences … *"You are not told when."*

**Why this is `S132.CHECKABLE`'s event.** K gives six fresh makers a true statement about what was measured that the
picture can confirm. P gives six a true statement about where it was measured that the picture can neither confirm nor
refute (*"the instrument, the place or the height of the intake"*, in the row's words). KP is added for a contrast
inside one maker. One caveat on "cannot confirm": a maker that knew the record was sunlight, knew the season and
measured the day's length could bound the latitude. P is told neither the kind nor the season, and KP is not told the
season.

## How it is scored

- **Coder H** (`coder/H/BRIEF.md`), fresh, blind to the cells and to what was told, reads each maker's note and
  report. It lists every claim about *what* the record is and *where or by what* it was recorded, and gives each claim
  a standing: `given` (said to come from outside the maker's own reading), `against`, `own` or `plain`. **Held apart**
  means `given` or `against` (F-247). The code was tested on experiment 21 before tonight's makers ran
  (`coder/H0/`).
- **Coder D** (`coder/D/BRIEF.md`), fresh, sees only the twenty-four pages as screenshots (1100 × 800), order shuffled
  with seed 1330. It codes the kinds named, any place named, and whether the page marks anything as given.

A maker **mentions the place** if coder H lists a `where` claim naming Fort Peck, Montana, the USA, the Great Plains or
634 m, or if its note does. A maker **holds the kind apart** if its `what` claim on sunlight or solar radiation has
standing `given` or `against`.

**`S132.CHECKABLE`, applied as written.** Void if fewer than 4 of 6 P makers mention the place. Falsified if (a) fewer
than 3 of the P makers who mention the place hold it apart, or (b) at least 3 of 6 K makers hold the kind apart.

## Predictions

| # | Prediction | My confidence |
|---|---|---|
| P1 | N: at least 4 of 6 favour light (sunlight, solar radiation) as what was measured. The picture can confirm it. | 0.7 |
| P2 | K: 6 of 6 favour light. | 0.9 |
| P3 | K: at most 2 of 6 hold the kind apart (clause (b) does not fire). | 0.8 |
| P4 | P: at least 4 of 6 mention the place (the row is not void). | 0.85 |
| P5 | P: at least 3 of the P makers who mention the place hold it apart (clause (a) does not fire). | 0.5 |
| P6 | KP: at least 3 of 6 hold the place apart **and** do not hold the kind apart. | 0.4 |
| P7 | P: at least 4 of 6 favour light, as many as N (± 1). Being told where does not move what is read. | 0.55 |
| P8 | Pages (coder D): the place is named on at least 4 of 6 P pages and 4 of 6 KP pages, and on no N or K page. | 0.6 |
| P9 | Pages (coder D): at most 2 of the 24 pages mark anything as given or told. | 0.7 |

P5 is the night's bet against its own row: I put it at even odds. If P5 fails, `S132.CHECKABLE` falls by clause (a).
Then this family keeps no source for anything that is not contradicted, and Session 132's reading fails a second
time. If P5 holds and P3 holds, the row holds. The source is kept where the material can say nothing, and that is a
seam between what is read and what is given.
