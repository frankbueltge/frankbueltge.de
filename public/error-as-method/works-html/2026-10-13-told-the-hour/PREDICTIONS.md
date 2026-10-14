# Told the Hour — predictions, fixed before any maker exists

**Session 123, 2026-10-13. Experiment 18 of the project. Operation: perceiving (with finding a form).**
Committed with `prepare.py`, `render.js`, the two pictures, `materials/holds.json`, the brief and `plan.json`,
before any maker folder exists. Nothing below is changed after a maker runs; a correction is a new dated note.

## What is asked

Session 122 (`S122.RECOGNISE`) found that makers given an undecodable picture filled the margin with a model
when, and only when, they recognised a regular in it. But the line between recognising and not coincided with
a line of resolution the practice drew. Tonight separates the two. One record, two grains, two accounts:

- **Grain F**, 300 × 90 px: ~4.9 hours per column, the daily cycle ~4.9 columns a cycle (resolvable).
- **Grain C**, 40 × 12 px: ~36.6 hours per column, the daily cycle ~0.66 columns a cycle (not resolvable);
  the weekly cycle ~4.6 columns a cycle (resolvable). `materials/holds.json`.
- **Account U**: the brief says *"one value every hour for 61 consecutive days, 1,464 values"*.
- **Account N**: the brief says *"1,464 values taken one after another at equal intervals"*.

Those words are the only difference between briefs of one grain. Three makers per cell (FU, FN, CU, CN), assigned
with seed 123. The material (what it is, where, when) is told to no maker.

The account is the practice's statement about the material: the order-word that turns dots into hours (ATP 80–81,
as *Cartography, not Tracing* §4.2 gives it). Arm N withholds it. If recognition needs the account, FN is
*resolvable but unrecognised*. If the account carries recognition past the grain, CU is *recognised but not
resolvable*. Either cell separates what Session 122 confounded.

## Coding (coder B, notes and reports; coder A, masked pictures; briefs in `coder/`)

- **Recognised** = B2 `yes` (a cycle measured in the picture) **and** B5 `yes` (it says what produces it in the world).
- **No measured regular** = B2 `no`.
- **Units** = B10 (`pixels`, `items`, `neither`).

## Predictions

| | prediction | fails if |
|---|---|---|
| P1 | All twelve decode the pixels with code. | B1 `yes` < 12 |
| P2 | FU: all three recognise, and at least two measure the daily cycle. | recognised < 3 or B3 `measured` < 2 in FU |
| P3 | FN: the material carries its own clock. At least two of three recognise, and at least two infer the interval. | recognised < 2 or B8 `inferred` < 2 in FN |
| P4 | CU: at least two measure the week; at least one supplies the day. | B4 `measured` < 2 or B3 `supplied` < 1 in CU |
| P5 | CN: at most one recognises. | recognised > 1 in CN |
| P6 | Units follow the grain: F at least five of six `items`, C at least five of six `pixels`. | either count < 5 |
| P7 | **`S122.RECOGNISE` falls by clause (a)**: at least one maker at C who recognises draws pixels. | no such maker |
| P8 | At least ten of twelve name a singular, and most of those (≥ 80 %) a low one. | B6 `yes` < 10, or `low` < 80 % of them |
| P9 | A holiday or date label for it: U at least three of six, N at most one; every label flagged as from outside. | U < 3, N > 1, or any B9 `yes` with B9_outside `no` |
| P10 | A fast alternation drawn (A2): F at least four of six, C at most one of six. | F < 4 or C > 1 |
| P11 | Quantity named as electricity: U at least three of six, N at most two of six. | U < 3 or N > 2 |
| P12 | **The grain moves recognition more than the account**: (recognised F − recognised C) > (recognised U − recognised N). | ≤ |
| P13 | The mask holds: A4 `no` for at least eleven of twelve. | < 11 |

## The rule for `S122.RECOGNISE`

It is due tonight: twelve fresh makers, a preparation that cannot be decoded back to its items (no grain holds
fewer than 4.88 hours per column), and a regular (the day) resolvable at one grain and not the other.
**Falsified** if (a) any maker coded *recognised* has B10 `pixels`, **or** (b) any maker coded *no measured regular*
has B10 `items`. `neither` triggers nothing. Scored by `score.py` from the coders' files, by the letter.

## Known weaknesses, written now

- The family will likely read hourly sampling off the ratio of two periods (24 and 168) without being told;
  arm N may not withhold the account at all. That is P3's forecast, and if it holds, the account variable is weak.
- At C a column holds ~1.5 days, so the band's thickness carries the daily range though not its rhythm.
  A maker could infer a fast cycle from thickness alone; B3 `supplied` should catch it.
- Three makers per cell; both coders of the makers' kind; one material.
