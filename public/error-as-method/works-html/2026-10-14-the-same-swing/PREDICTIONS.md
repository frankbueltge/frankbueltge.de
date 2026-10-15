# The Same Swing — predictions, fixed before any maker exists

**Session 124, 2026-10-14. Experiment 19 of the project. Operation: perceiving (with finding a form).**
Committed with `prepare.py`, `render.js`, the two pictures, `materials/holds.json`, the briefs, both coders' briefs
and `plan.json`, before any maker folder exists. Nothing below is changed after a maker runs; a correction is a new
dated note.

## What is asked

Experiment 18 found that makers who **measured** a regular in an undecodable picture named the world correctly
(electricity demand, the Christmas weeks), and that makers who could only **supply** one, from the count, named a
default (air temperature, a cool spell). `S123.SUPPLIED` fixed that as a claim and named its own weakness: the
default may belong to the regular supplied (a daily swing) rather than to the family, and the material's true kind
was guessable from a measured **week**, which only electricity-like records carry.

Tonight's material shares its regular with the default. It is the oxygen dissolved in the Potomac at Little Falls,
summer 2025: plants and algae make oxygen by day and every organism uses it by night, so it rises and falls once a
day, as temperature does. It has no week. If measuring names the world, the makers who measure the day should
reach the river's oxygen. If what named the world in experiment 18 was a regular only one kind holds, they should
reach the default, measured or not.

- **F** (four makers): 300 × 90 px (4.88 hours a column, the daily cycle 4.92 columns: measurable), told
  *"1,464 values taken one after another at equal intervals"*.
- **U** (four): 40 × 12 px (36.6 hours a column: the day not measurable), told *"one value every hour for 61
  consecutive days, 1,464 values"*. The day can be supplied from the brief.
- **X** (four): the same 40 × 12 px, told only *"values taken one after another at equal intervals"*. No count,
  no interval (experiment 18's thread 2, F-224): nothing to supply a day from but the picture.

Assigned with seed 124. Nothing about the material (what, where, when) is told to any maker. In the 40-px picture
the band narrows from 9–10 ink rows to 4–5 in columns 12–15 (`holds.json`): the stretch, 18–24 July, when the daily
swing fell from 2–4 mg/L to under 1 (`daily_range_mg_l`).

## Coding

Coder B reads notes and reports (`coder/B/BRIEF.md`); coder A, the twelve masked pictures in a shuffled order
(seed 1241, key committed before coder A runs).
- **Measured day** = B2 `yes` and B3 `measured`.
- **Supplies only** = B2 `no` and (B3 `supplied` or B4 `supplied`).
- **The true kind** = B7_category `oxygen`.

## Predictions

| | prediction | fails if |
|---|---|---|
| P1 | All twelve decode the pixels with code. | B1 `yes` < 12 |
| P2 | F: at least three of four measure the day. | measured day < 3 in F |
| P3 | **F: measuring does not reach the river.** At least two of four name temperature, at most one oxygen. | temperature < 2 or oxygen > 1 in F |
| P4 | U: at least three of four supply the day; at least two name temperature. | B3 `supplied` < 3 or temperature < 2 in U |
| P5 | X: at most one names a daily cycle at all; at most one names temperature. | B3 ≠ `no` > 1 or temperature > 1 in X |
| P6 | Across all twelve, at most one names oxygen. | oxygen > 1 |
| P7 | The calm stretch is the singular: F at least three of four, C (U and X) at least four of eight. | B6_where `calm` below either |
| P8 | Units follow the grain: F at least three of four `items`; C at least six of eight `pixels`. | either below |
| P9 | A fast alternation drawn (A2): F at least three of four, U at most one, X none. | any bound broken |
| P10 | The mask holds: A4 `no` for at least eleven of twelve. | < 11 |
| P11 | **The default belongs to the supplied regular, not to the family**: temperature in U exceeds temperature in X by at least two. | temperature(U) − temperature(X) < 2 |

## The rule for `S123.SUPPLIED`

Due tonight: eight fresh makers get a material they cannot decode back to its items, at a grain where its regular
(the day) cannot be measured but can be supplied (U from the brief; X from nothing but the picture). The row is
scored over **every maker coded *supplies only***, in any cell. **Falsified** if (a) at least half of them have
B7_category `oxygen`, **or** (b) no single B7_category is held by at least half of them. If fewer than two makers
are coded *supplies only*, the row is **not decided** tonight and stays open. Scored by `score.py`, by the letter.

The row's claim has a first half its falsifier does not test: *a regular measured in the material names the world
correctly.* P3 tests it. If P3 holds, that half is wrong for a material whose regular it shares with the default,
and a successor row will say so.

## Known weaknesses, written now

- Nothing in either picture separates dissolved oxygen from water temperature: both peak in the afternoon and
  nobody is told the hour, the unit or the range. P3 is close to known in advance. What it tests is not whether a
  maker *could* reach oxygen but whether any measures its way to a kind the family does not hold by default.
- X makers may still supply a day from the band's thickness or from a guess at the count of dots (they can count
  dots in the 300-px picture only, which they do not have). B3 `supplied` should catch it.
- Four makers a cell; both coders of the makers' kind; one material. The rooms and render are Session 123's.
