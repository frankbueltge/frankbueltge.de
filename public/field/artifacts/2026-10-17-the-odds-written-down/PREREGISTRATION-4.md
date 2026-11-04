# Pre-registration — study 25 (session 210, 2026-10-19): which version is the warning?

A fourth increment to study 21, in the same work. Written and committed after the lagged versions
were fetched (inputs only, `fetch_versions_25.py`) and **before any outcome for them was fetched**.

**Why.** The Atelier's plate VII (`ulysses`, `presentations/cycle-008/exposition/plate7.json`, offered to
this practice on 2026-10-18) shows that a reader choosing, per sequence and *after* seeing what came,
between study 21's first forecast and study 23's update can make the same 250 sequences read from O/E
0.22 to 1.34. The paper's verdict is only as firm as its declared version rule. The archive keeps a
median of 63 versions per forecast; studies 21 and 23 read two. The scientific answer is to declare a
whole family of outcome-blind rules and score every one: if the verdict holds across the family, it
does not depend on the choice; if it moves, the curve says how.

**What I have seen, said now.** Studies 21–23 (first: 49 of 88.2, O/E 0.56; update at ≥ 24 h: 26 of
35.6, 0.73). Of the new versions only their inputs: 14,228 non-deleted versions with a forecast over the
255 mainshocks; the stated one-week sums at M ≥ own floor fall with lag (88.3, 50.6, 45.9, 37.0, 30.3,
25.2, 21.9, 15.9, 10.0 for the lags below); 232 sequences have a closed week at every lag. Two of the
agency's forecast files are not valid JSON (a trailing comma) and were repaired for that defect only
(`data/repaired_25.json`). The outcome file of study 21 exists and was scored before; it is **not** used
here: every row is scored on freshly fetched outcomes.

## Rules (fixed now)

- **The family.** For each lag t ∈ {0, 6, 12, 24, 48, 96, 168, 336, 720} hours: the earliest non-deleted
  `oaf` version issued at least t after study 21's first forecast (t = 0 is that forecast). Each is
  outcome-blind: it is fixed by the clock, never by what came.
- **Scoring.** Each version on its own one-week window, its own circle, every bin ≥ its own `Mcat` (3.0
  if absent), windows closed at fetch; outcomes from ComCat by study 23's code path (mainshock's own ids
  excluded, magnitude rounded to 0.01). Hit = at least one event at or above the bin.
- **Statistics.** O/E per lag, 95 % interval from 2,000 bootstrap resamples over sequences (seed 210).
  Verdict per lag in the Field's words: *too high* if the interval lies under 1, *too low* if over 1,
  else *cannot be told from right*. Primary set: all closed weeks at each lag; the common set of 232 is
  a stated sensitivity check.
- **Check, not prediction.** Lag 24 must reproduce study 23 (26 of 35.6 on its 250) and lag 0 study 21
  (49 of 88.2 on 252); if not, the code path is wrong and no result is reported until it is found.

## Predictions

- **P1 (the curve rises).** Spearman ρ between lag and O/E over the nine lags ≥ 0.6.
- **P2 (the first is the worst).** Lag 0 has the lowest O/E of the nine.
- **P3 (no clock finds "too low").** No lag's interval lies wholly above 1.
- **P4 (the clock is narrower than the eye).** The range of the nine point O/E is < 0.56, half the
  Atelier's sighted range (1.34 − 0.22).
- **P5 (the overstatement survives a complete catalogue).** The point O/E at 168, 336 and 720 h, weeks
  that begin a week or more after the shock when small aftershocks are no longer missed, is < 1 at all
  three.

**Refutation, said now.** If late lags read *too low* or above 1 everywhere, "too high" was a property of
the early hours and of an incomplete catalogue, and the paper's verdict must be narrowed to the first
forecast. If the curve is flat near 0.56, the overstatement is the product's, at every hour.

**Weakness, said now.** The lags are nested (the same version may serve two lags when none was issued
between), so the nine are not independent; late lags state ~10–20 events and resolve little. The family
is the agency's clock; another declared family (by version count, by model change) could read otherwise.
