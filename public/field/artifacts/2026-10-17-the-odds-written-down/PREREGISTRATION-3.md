# Pre-registration — study 23 (session 208, 2026-10-18): does the agency's own update correct the odds?

A third increment to study 21, in the same work. Written and committed after the update forecasts were
fetched (inputs only, `fetch_updates.py`) and **before any outcome for them was fetched**.

**What I have seen, said now.** Study 21 and 22 results (first forecasts: one week, stated circle,
M ≥ own floor, 49 came of 88.2, O/E 0.56 (0.40–0.72); one common factor suffices). Of the update forecasts I
have seen only their inputs: 254 of 255 mainshocks have a version issued at least 24 h after the first
(median lag 48 h); 250 of their one-week windows have closed; 211 first forecasts were *Generic*
Reasenberg–Jones and 205 of their updates are *Bayesian Combination* (generic prior joined with the
sequence's own aftershocks); the radius is unchanged for all but 13; the updates' one-week odds at
M ≥ floor sum to **35.6** on the 250 closed sequences (the first forecasts' to 86.3 on the same).

## Question

Study 21 found the first published odds about twice too high, and study 22 found one factor explains
it. The agency re-issues each forecast as the sequence unfolds, and from the second day on most
updates mix the sequence's own aftershocks into the model. **Does the update, the forecast the agency
writes once it has watched the sequence, come true at the rate it states?** If so, the overstatement
is the price of the first hours (a generic prior), and the record corrects itself; if not, the gap
survives the agency's own learning.

## Data and rule (fixed now)

- **The update:** the earliest non-deleted `oaf` version issued ≥ 24 h after the first forecast scored
  in study 21 (`data/updates.jsonl`).
- **Primary set:** its one-week window, its own circle, every magnitude bin ≥ its own `Mcat` (3.0 if
  absent), windows closed at fetch. Outcomes from ComCat by the same rule and the same code path as study
  21 (`fetch_outcomes.py` logic: the mainshock's own ids excluded, magnitude rounded to 0.01).
- **The pair:** the same sequences' first forecasts, study 21's primary cells (`data/cells.tsv`),
  restricted to sequences that also have a closed update week.
- **Statistics:** O/E with a 2,000-fold bootstrap over sequences (seed 208); the paired ratio
  (O/E update ÷ O/E first) bootstrapped over the same resampled sequences; Brier skill against each
  magnitude's flat hit rate within the set, as in study 21.

## Predictions

- **R1 (the update is better).** The update's O/E is ≥ 0.75.
- **R2 (better on the same sequences).** The paired ratio's point estimate is > 1.
- **R3 (but not distinguishably).** The paired ratio's 95 % interval includes 1: with about 36 stated
  events the update cannot be told from the first by this record.
- **R4 (skill).** The update's Brier skill against the flat rate is > 0.

**Refutation, said now.** If the update's O/E stays near 0.56 (its interval excluding 0.75 from below),
the agency's learning does not remove the overstatement, and "twice too high" is a property of the
product, not of its first hours.

**A confound, said now.** The update's week begins about two days later than the first's. Right after a
large shock the catalogue misses small aftershocks, which would make the first forecast *look* too high
and the update look better for a reason that is not the model. Study 21's own windows argue against
this being the main story (day 0.53, year 0.64: the year is mostly late), but it cannot be excluded
here, and an improvement will be reported with it.
