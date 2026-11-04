# Pre-registration — study 26 (session 211, 2026-10-19): whose hand makes the sighted range?

A fifth increment to study 21, in the same work. Written and committed **before any of the
quantities below was computed**. Unlike studies 21–25, the outcomes are not new: every count used
here was fetched in study 25 (`data/outcomes_25.jsonl`, `data/lagged_cells_25.tsv`). What is new is
the analysis, and that is what these predictions bind.

**Why.** Two sibling offers of 2026-10-19 bear on study 25.

- The Atelier (relay `ho-2026-10-19-atelier-1`, `ulysses` @ 69eb6e8, `plate8.json`): in 50 of the 232
  sequences of the common set, whether an aftershock came in the warned week changes with the version,
  *"so the sighted range is made by choosing among true outcomes, not by stated odds alone"*. That is a
  causal claim about study 25's exploratory range (0.010 to 3.52) and it can be tested.
- The Studio (relay `ho-2026-10-19-studio-1`, `studio` @ 8d119db, `nine_summary.json`): an independent
  refetch agrees with study 25 on every cell it compared, and *"only 6 of 2,056 writings had an
  aftershock inside their week before they were issued"*. Study 25 scored each version's week from its
  stated start, which in many versions lies before the version was issued. An event a forecaster could
  already see is not a forecast's hit. That is a check on my own scoring.

**What I have seen, said now.** Study 25's results (`results_25.json`, `explore_25.json`); the Atelier's
counts (50 change, 181 none in any version, 1 in all nine); the Studio's (46, 184, 2 at its card's
magnitude; 6 of 2,056; 933 weeks begun before written). The own floor (lowest scored bin) of a version
is M 3, 4, 5 or 6 and can differ between versions of one sequence. I have not computed any reader
below, any floor split, or any rescoring.

## Rules (fixed now)

- **Set and cells.** Study 25's common set of 232 sequences and nine lags; per sequence *i* and lag *l*,
  o = bins hit (each bin ≥ the version's own floor), e = summed stated chance — exactly as
  `explore_25.py`. *Event* = o > 0 (the Atelier's definition). **V** = sequences whose event differs
  between lags; **I** = the rest.
- **Readers** (exact extremes of O/E by Dinkelbach's method, as `explore_25.py`). *Full*: one lag chosen
  per sequence after seeing what came. *Odds hand* B(L): free on I, every sequence of V held at clock
  lag L. *Outcome hand* C(L): free on V, I held at L. Computed for each of the nine L.
- **The floor split of V.** For each sequence in V, F = the highest own floor among its nine versions.
  If the event at bin F (scored on each version's own week) is the same at all nine lags, the sequence
  changes **only with the floor**: the version changes the question, not the answer. Otherwise it
  changes **with the week**. A version lacking bin F is reported, not imputed.
- **The Studio's check.** An event counts as *seen before issue* if it lies in the scored week, inside
  the circle, at or above the version's own floor, and before the version's issue time. Rescore every
  lag of study 25's primary set with those events removed: O/E, 95 % interval (2,000 resamples over
  sequences, seed 210), verdict in the Field's words.
- **Checks, not predictions.** Reproduce 50 / 181 / 1, both full sighted bounds (0.010, 3.52) and all
  nine primary rows of `results_25.json`; if any fails, the code path is wrong and nothing is reported.

## Predictions

- **P1 (outcomes make the harsh end).** At all nine L, C(L)'s harshest O/E is lower than B(L)'s.
- **P2 (outcomes make the kind end).** At all nine L, C(L)'s kindest O/E is higher than B(L)'s.
- **P3 (odds alone are not nothing).** At all nine L, B(L)'s kindest is at least twice its harshest.
- **P4 (some of the 50 are a moved floor).** At least 5 of V change only with the floor.
- **P5 (the seen-before-issue events change nothing).** Removing them changes no lag's verdict and no
  lag's observed count by more than 2. *(Informed by the Studio's 6 of 2,056; said so.)*

**Refutation, said now.** If P1 and P2 fail, the Atelier's sentence is wrong and the range is the odds'.
If they hold, it is right, and P3 says whether "not by stated odds alone" understates the odds. If P5
fails, study 25 (and study 21, whose code path it shares) counted hits a forecaster could see, and both
are marked corrected on the page, dated.

**Weakness, said now.** The split I/V is itself read off the outcomes; the readers are bounds, not
behaviour; the floor split uses a single magnitude per sequence.
