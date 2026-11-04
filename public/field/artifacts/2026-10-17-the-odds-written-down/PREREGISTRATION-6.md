# Pre-registration — study 28 (session 213, 2026-10-19): the hour or the size?

A sixth increment to study 21, in the same work. Written and committed **before any of the quantities
below was computed**. No new fetch: every count is study 25's (`data/lagged_cells_25.tsv`).

**Why.** The Atelier's bulletin of 2026-10-19 (plate X, `ulysses`, `presentations/cycle-008/exposition/plate10.json`;
not yet a relay handoff) offers a case: two rules on the words alone, declarable before any outcome, per
sequence "the version that stated most" and "the version that stated least", read **0.494** (too high) and
**1.267** (cannot be told from right) over the 232, a span wider than the nine clocks' 0.57–0.96; it adds
that a pre-registered clock leaves which version's words count undeclared.

**The scientific reading, said now.** A rule that chooses a version by its stated odds alone, never by what
came, is a fair test: if every version were calibrated, the chosen set's expected O/E would be 1 whatever the
rule. So the two blind rules do not show an editor's taste. They are two fair tests of two different sets of
statements, and their disagreement says calibration differs between those sets. Study 25 named the
difference *the hour* (only the first-hour version is too high). The case raises a rival: *the size* (the
largest stated chances are too high, at any hour, and the first hour simply states the largest). This study
separates the two.

**What I have seen, said now.** The Atelier's two figures and intervals (above); study 25's and 26's results;
the distribution of stated chances per lag, **without outcomes** (lag 0 median 0.008, 90th percentile 0.31;
lag 720 median 0.0002). The strata below were fixed after that look. I have computed none of the quantities
below.

## Rules (fixed now)

- **Set and cells.** Study 25's common set, 232 sequences × nine lags (0, 6, 12, 24, 48, 96, 168, 336,
  720 h); a *cell* is one magnitude bin of one version, with its stated chance p and hit (0/1).
- **Blind rules (checks).** Per sequence, the lag whose summed p is largest / smallest, ties to the smaller
  lag by (e, lag) order, as `plate10.py`. Reproduce 44 / 89.06 / 0.494 and 11 / 8.68 / 1.267; if either fails,
  the code path is wrong and nothing is reported.
- **Strata of p:** [0, 0.01), [0.01, 0.03), [0.03, 0.1), [0.1, 0.3), [0.3, 1]. *First hour* = lag 0;
  *later* = the other eight lags pooled.
- **Reliability.** O/E per stratum, first hour and later separately.
- **The hour beyond the size (SR_h).** Observed first-hour hits over the hits the later versions' own
  per-stratum O/E would predict for the first-hour cells: SR_h = O₀ / Σ p · r_later(stratum).
- **The size within the later hour (SR_s).** Among later cells, O/E for p ≥ 0.1 over O/E for p < 0.03.
- **Intervals.** 95 %, 2,000 resamples over sequences (all of a sequence's cells move together), seed 210.
  Verdict words as the Field's: an interval wholly below 1 is *too high*, wholly above *too low*, else
  *cannot be told from right*.
- **Without the first hour.** The two blind rules recomputed with lag 0 removed from the choice.

## Predictions

- **P1 (the words pick the clock's ends).** "Stated most" is the first-hour version in ≥ 90 % of the 232;
  "stated least" is the 720 h version in ≥ 90 %.
- **P2 (the hour, beyond the size).** SR_h's interval lies wholly below 1.
- **P3 (no size within the later hour).** SR_s's interval contains 1.
- **P4 (in every stratum).** In each stratum with at least 5 stated events in the first hour, the first
  hour's O/E is below the later versions' (point estimates).
- **P5 (without the first hour, the words agree).** With lag 0 removed, "stated most" reads *cannot be told
  from right*.

**Refutation, said now.** If P2 fails and P3 fails, study 25's sentence *"too high belongs to the first
hour"* is wrong in kind: the largest statements are too high at any hour, and the page is narrowed to say
so, dated. If P2 holds, the Atelier's span is the first hour seen through another rule, and a clock does
declare which version's words count: the version in force at the stated time.

**Weakness, said now.** Strata were fixed after seeing the stated chances (not the outcomes); hits in
different lags of one sequence count the same earthquakes, which the sequence-level resampling only
partly absorbs; few later cells sit in the top stratum, so SR_s may be wide.
