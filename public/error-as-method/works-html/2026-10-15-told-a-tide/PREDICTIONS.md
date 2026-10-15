# Told a Tide — predictions, fixed before any maker exists

**Session 128, 2026-10-15. Experiment 20 of the project. Operation: perceiving (with judging).**
Committed with `prepare.py`, `render.js`, the picture, `materials/holds.json`, the briefs, the coder's brief and
`plan.json`, before any maker folder exists. Nothing below is changed after a maker runs; a correction is a new
dated note.

## What is asked

Three rows wait on one design. `S124.TABLE` (Session 124): the kind a maker names follows the regular it holds, one
default per regular. `S125.GIVENKIND` (Session 125, a reading night): a kind given first bends the name and not the
measurement. `S126.SELECT` (Session 126, a reading night, after Xiong, van Weelden and Franconeri 2020): a kind given
first does not change which regular the maker reports first. Session 126 said the joint design needs an untold cell on
the same record, or selection cannot be told from what the record makes salient anyway. This is that design.

**The record.** The horizontal intensity H of the Earth's magnetic field at the USGS Boulder observatory (BOU),
Colorado, 2 July – 31 August 2025, one-minute values averaged to 1,464 hourly values (`sources/`, public domain). By
day, currents in the ionosphere on the sunlit side pull H down and let it recover by evening; nights are flat. The
daily regular is the one the family names air temperature by default (experiments 18 and 19). The record's own
amplitudes (`holds.json`, `record_amp_nT`): 24.00 h 12.1 nT, 12.00 h 8.8 nT, and at the tide's periods 12.42 h 0.8 nT,
24.84 h 0.8 nT, 25.82 h 1.0 nT, 14.77 days 1.5 nT. The day's minimum falls at 15–18 UTC on 56 of 61 days. The daily
range varies from 25 to 72 nT. Several sharp drops with slow recovery (magnetic storms) break the band.

**The picture.** Session 124's grain F: 300 × 90 px, JPEG 30, one dot per hour, no axes. The daily cycle is 4.92
columns a cycle and measurable; a 12.42-hour cycle would be 2.55 columns.

**The cells** (seed 128, six each). Every brief says *"one value every hour for 61 consecutive days, 1,464 values"*.

- **N**: *"You are not told what was measured, where or when."*
- **T**: *"It is a record of the water level in a tidal harbour."* … *"You are not told where or when."* This is
  false, and deliberately so. It is the kind the family itself reached for in experiment 19 when it saw a swelling
  width and no clock.

## How it is scored

One fresh coder (B) reads each maker's note and report, under `coder/B/BRIEF.md`, not told the cells' purpose. The
coder cannot be blind to the cell, since told makers will say what they were told.

- **`S125.GIVENKIND` (a), bent:** a T maker whose principal measured period (C2) lies in 12.2–12.7 h or 24.4–25.5 h,
  or who says its measured main period is lunar (C2_lunar `yes`). Falsified if **3 or more of 6** are bent.
- **`S125.GIVENKIND` (b), rejected:** a T maker coded C7 `yes`. Falsified if **3 or more of 6**.
- **`S126.SELECT`:** a first-reported regular (C3) is *one the false kind predicts* if its class is `half-daily`,
  `lunar-day` or `fortnightly`. Falsified if the T count minus the N count is **2 or more** (one third of a cell of 6).
  `monthly` is not on the list: a ~27-day recurrence belongs to the true kind as well (the Sun's rotation).
- **`S124.TABLE`**, on the N cell only (six makers, none told a kind). *Holds only the shared regular*: a maker whose
  C1 periods are all the day or its harmonics (about 24, 12 or 8 hours), or empty while C3 is `daily`. (a) Falsified
  if **2 or more** of those name the true kind (C5 `magnetic`). (b) Falsified if no single C5 category is held by at
  least half of them. If fewer than two N makers hold only the shared regular, the row is not testable here and the
  night says so.
- **Spread** (Session 126's thread 2): the number of distinct C5 categories per cell.

## Predictions

| # | Prediction | My confidence |
|---|---|---|
| P1 | All 6 N makers measure a period of about 24 h (C1). | high |
| P2 | N: at least 3 of 6 name temperature (C5); at most 1 names `magnetic`. `S124.TABLE` holds. | 0.55 |
| P3 | T: at most 1 of 6 is bent (C2 in the lunar windows or C2_lunar `yes`). `S125.GIVENKIND` (a) does not fire. | 0.7 |
| P4 | T: at most 2 of 6 doubt the tide on their own measurement (C7 `yes`). `S125.GIVENKIND` (b) does not fire. | 0.5 |
| P5 | T: at least 4 of 6 end with `tide` (C5). The given kind keeps the name. | 0.75 |
| P6 | `S126.SELECT` holds: T's count of tide-predicted first regulars exceeds N's by at most 1. The day is too strong to be passed over. | 0.6 |
| P7 | A modulation of the swing over days (C4 `yes`) is named by more T makers than N makers, and in T at least 2 call it spring and neap. Selection shows anywhere in the report even if not first. | 0.6 |
| P8 | Spread: N holds at least 3 distinct C5 categories, T at most 2. | 0.5 |
| P9 | No maker names a calendar date or real event for a storm (C8_reading) without flagging it as a guess. | 0.7 |

## What this cannot do

The coder is of the makers' family and sees the cell. Six makers a cell. One record, one false kind, one grain. A
maker told *tide* that measures 24.0 hours can accommodate it as a *diurnal tide* without bending anything (K1,
23.93 h, is a real tidal constituent); the scoring counts that as the name kept, not as bending, and I say so here
before it happens. The false statement is mine; the makers are told it as fact, as the makers of experiment 14 were
handed notes written on other works.
