# Told True — predictions, fixed before any maker or inquirer exists

**Session 130, 2026-10-16. Experiment 21 of the project. Operation: judging and perceiving (with finding a form).**
Committed with `prepare.py`, `render.js`, the picture, `materials/holds.json`, the briefs, the inquiry, the three
coders' briefs and `plan.json`, before any maker or inquirer runs. Nothing below is changed after an agent runs; a
correction is a new dated note.

## What is asked

Experiment 20 told six makers a false kind (a tidal harbour) before they looked at a record of the Earth's magnetic
field. Six of six tested it and refused it, and the tide still entered every told work. Two rows came out of that
night and one out of the reading night after it:

- `S128.SUBJECT`: a statement given before looking is not obeyed and not ignored; it becomes the work's subject,
  built as its test. *What it could not do:* the statement was false and checkable. A true one may act otherwise.
- `S129.INQUIRY` (Orne 1962, the pre-experimental inquiry): what told makers do is **not** what an agent of their
  kind predicts from the brief alone. If it is predicted, the testing may be the brief's demand, not the family's
  judging.
- `S128.SHAPE`: the default kind follows the daily regular and its shape together; a new shape brings a new
  default, still not the true kind.

The project question tonight: **does a machine maker judge what it is told, or does it judge only what it can
refute?** If makers test a true statement as they tested a false one, the testing belongs to the family (or to the
brief); if they take the true one as given, the test in experiment 20 was set off by the picture's disagreement.

**The record.** Carbon dioxide in the air at the NOAA tall tower at West Branch, Iowa (WBI), intake 31 m above
ground, hourly, 15 July – 13 September 2019, 1,464 values, 2 single missing hours filled by interpolation
(`sources/`, CC0). Over a summer cornfield landscape the plants draw CO₂ down by day and respiration builds it up
under the shallow night-time air. Median day (`holds.json`): lowest at 22 UTC (16:00 local), rising for 13 hours to
a peak at 11 UTC (05:00 local), then a fall of about 50 ppm in five hours, a floor through the afternoon. Single
nights spike far above the band (daily range 28–150 ppm; record 361.6–526.8 ppm). Amplitudes: 24.00 h 23.4 ppm,
12.00 h 4.8, 12.42 h (M2) 1.1, 24.84 h 1.3.

**Is the daily shape eligible for `S128.SHAPE`?** I say yes, and say why before any maker runs, since the row's
condition is a shape *other than a ceiling with a dip or a near-sine swing (a spike, a step, a plateau that
rises)*. The picture shows a floor with upward spikes (single hours far above the band on many nights) and a slow
rise with a fast fall. Against it: the *median* day is a skewed swing whose 12-h to 24-h ratio is 0.19, nearer a
sine than experiment 20's 0.73. If the makers describe a near-sine swing, that is a fact about the row's
eligibility, and the night says so.

**The picture.** Grain F as in experiments 19 and 20: 300 × 90 px, JPEG 30, one dot per hour, no axes.

**The cells** (seed 130, six each). Every brief says *"one value every hour for 61 consecutive days, 1,464 values"*.

- **N**: *"You are not told what was measured, where or when."*
- **T**: *"It is a record of the carbon dioxide content of the air at a measuring station."* … *"You are not told
  where or when."* True.
- **F**: *"It is a record of the water level in a tidal harbour."* … *"You are not told where or when."* False;
  experiment 20's sentence, word for word.

**The inquiry** (Orne's control, `S129.INQUIRY`). Eight fresh agents, four on the T brief and four on the F brief,
word for word, the picture withheld (`inquiry/qNN.md`). They run **before any maker**, and their answers are
committed before any maker exists.

## How it is scored

Three fresh coders, none told the purpose of the cells.

- **Coder B** reads each maker's note and report (`coder/B/BRIEF.md`; experiment 20's scheme, with `humidity`,
  `carbon` and `pollution` added to C5 and a new C10, *told and checked*).
- **Coder D** sees only the eighteen pages as screenshots (1100 × 800), in an order shuffled with seed 1300, and
  codes what kinds the pages name (K1), whether a page draws or states a comparison with a named kind (K2) and its
  verdict (K3) (`coder/D/BRIEF.md`). This is the page count `S128.SUBJECT` asks for: *"counted by a fresh coder from
  the pages, not the reports"*.
- **Coder Q** reads the eight inquiry answers (`coder/Q/BRIEF.md`).

**`S128.SUBJECT`**, on each told cell separately. A told work *carries the statement* if coder D's `K1_cats`
contains its kind (T: `carbon`; F: `tide`) or K2 is `yes` with K2_kind that kind. (a) fires if fewer than **4 of 6**
in a told cell carry it; (b) fires if **2 or more of 6** N works carry that cell's kind. The row is falsified if any
of the four clauses fires (T-a, T-b, F-a, F-b), and the night reports which. I say now that for the true cell
clause (a) is nearly empty: a maker that keeps a true name will write it. The informative part for T is (b) and the
comparison count (P8).

**`S129.INQUIRY`**, on the four F-brief inquirers (the brief the row was fixed from). Falsified if **3 or more of 4**
are coded I1 `yes` **and** I2 `yes`. The four T-brief inquirers are reported beside it and do not decide the row.

**`S128.SHAPE`**, on the N cell (coder B, C5). (a) falsified if **2 or more of 6** are `carbon`. (b) falsified if
no single category other than `none` is held by **3 or more of 6**.

## Predictions

| # | Prediction | My confidence |
|---|---|---|
| P1 | All 18 makers report a measured period of about 24 h (a C1 entry within 23–25 h). | 0.75 |
| P2 | F: at least 5 of 6 doubt the tide on their own measurement (C7 `yes`). Experiment 20 replicates. | 0.8 |
| P3 | T: at least 5 of 6 end with `carbon` (C5). | 0.85 |
| P4 | T: at least 4 of 6 say they checked the true statement against the picture (C10 `yes`). The family tests what it is told, true or not. | 0.6 |
| P5 | T: every maker coded C10 `yes` has outcome `agrees`. | 0.8 |
| P6 | `S128.SUBJECT`, F cell: F-a and F-b do not fire. | 0.75 |
| P7 | `S128.SUBJECT`, T cell: T-a and T-b do not fire (at most 1 N page names carbon). | 0.6 |
| P8 | A drawn or stated comparison with the told kind (K2 `yes`, K2_kind the cell's kind) is in at least 2 more F pages than T pages. A true statement is used, not tested, in the form. | 0.5 |
| P9 | `S129.INQUIRY` holds: at most 2 of the 4 F-brief inquirers predict check **and** subject. I expect them to predict that a maker builds a tide picture on the statement. | 0.6 |
| P10 | `S128.SHAPE` holds: at most 1 N maker names carbon, and one category other than `none` is held by at least 3 of 6. | 0.45 |
| P11 | N: at least 3 distinct C5 categories other than `none`. | 0.5 |

## What this cannot do

Six a cell; one record; one grain; all coders and inquirers of the makers' family. The true and the false
statements differ in content as well as in truth, so a T–F difference may belong to carbon and tide, not to true
and false. A maker told carbon dioxide may know what a CO₂ day looks like; that knowledge is what *checking* uses,
and it is not a leak. The inquirers see a brief with an unused folder path (`m19`). Orne himself calls the inquiry
*"one of approximation rather than of proof"* (p. 781). The false sentence is mine and is given as fact, as in
experiment 20.

**The rooms (F-231).** Every agent is launched from a neutral working directory with no slug in it, and the launch
directory and the room listings are written into `ROOMS.md`.
