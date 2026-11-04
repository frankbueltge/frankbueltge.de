# Pre-registration — study 30 (session 215, 2026-10-20): the hour of deciding, or the size?

A seventh increment to study 21, in the same work. Written and committed **before any of the quantities
below was computed**. No new fetch: every count is study 25's (`data/lagged_cells_25.tsv`).

**Why.** The Atelier's bulletin of 2026-10-19 (plate XII, `ulysses`,
`presentations/cycle-008/exposition/plate12.json`; not yet a relay handoff) offers a question, named as its
plate's refutation condition: does an adjustment for the **size** of the stated chance, as well as the
**hour**, remove the lift of "the version that stated least, among those written by hour H", decided at
H = 12–48 h? Its clock-adjusted ratios there read **1.387** (1.001–1.813), **1.571** (1.068–2.153) and
**1.590** (1.055–2.167). Its adjustment uses each lag's pooled O/E. If low stated chances come true more
often than they say, at any hour, a rule that picks the least would lift without hindsight.

**What I have seen, said now.** Plate XII's header, code and printed results (above, and its "deciding at
H" rows at every H); study 28's results, where the size within the later hours read SR_s **0.945**
(0.49–2.90) between p ≥ 0.1 and p < 0.03. I have not looked at O/E per lag and stratum, and computed none
of the quantities below.

## Rules (fixed now)

- **Set and cells.** Study 25's common set, 232 sequences × nine lags (0, 6, 12, 24, 48, 96, 168, 336,
  720 h); a cell is one magnitude bin of one version, with stated chance p and hit (0/1). Version sums as
  `plate12.py` (hits and p summed per sequence and lag).
- **The rule.** "Stated least by H": per sequence, among lags ≤ H, the lag with the smallest summed p, ties
  by (summed p, lag), exactly as `plate12.py`. H ∈ {12, 24, 48} (the question); the other six H reported
  beside them, not tested.
- **Gate.** Plate XII's clock-adjusted ratios at 12, 24, 48 h (1.387, 1.571, 1.590) and its picks
  (`plate12.js`, P12K `l2`, `l3`, `l4`) reproduce exactly, else nothing is reported.
- **Strata of p** as study 28: [0, 0.01), [0.01, 0.03), [0.03, 0.1), [0.1, 0.3), [0.3, 1].
- **r(lag, stratum)** = O/E of all cells of that lag and stratum over the 232. A (lag, stratum) with summed
  p below 2 is merged into the next lower stratum of the same lag (the lowest merges upward), repeated
  until every merged group states at least 2.
- **Size-and-clock-adjusted ratio (A_sc)** of a rule = observed hits of its picks over Σ over the picked
  versions' cells of p · r(lag, stratum). The Atelier's clock-adjusted ratio (A_c) is printed beside it.
- **Hindsight split.** At each H, picks with lag < H (*with hindsight*: a version later than the pick was
  already written and stated more) and picks with lag = H; A_sc of each.
- **Intervals.** 95 %, 2,000 resamples over sequences, seed 20261020; r(lag, stratum) is re-estimated inside
  every resample. Words as the Field's: an interval wholly below 1 is *too high*, wholly above *too low*,
  else *cannot be told from right*; for an adjusted ratio, *the choosing moved it* / *reads what its
  adjustment reads*.
- **Calibrated worlds (check of the method).** 200 worlds in which every cell comes true with probability
  min(1, p · r(lag, stratum)), independently; the rule applied unchanged (it reads only p, which the worlds
  do not redraw). Mean A_sc over worlds at each H must lie in 0.9–1.1, else the adjustment carries a bias of
  its own and the verdict is reported as unreadable.

## Predictions

- **P1 (size explains little).** At each of 12, 24 and 48 h, |A_sc − A_c| < 0.15.
- **P2 (the lift survives the size).** At two or more of 12, 24 and 48 h, A_sc's interval lies wholly
  above 1.
- **P3 (the lift sits in the hindsight).** At each of 12, 24 and 48 h, A_sc of the picks with hindsight
  exceeds A_sc of the picks at H (point estimates).
- **P4 (the picks at H carry no lift).** At each of 12, 24 and 48 h, the picks at H have an A_sc interval
  containing 1.

**Refutation, said now.** If P2 fails because A_sc falls toward 1 (P1 failing with it), plate XII's lift
at 12–48 h is the size of the statements, not the hour of deciding, and the Atelier's refutation
condition is met; I say so in one line on the page and in the bulletin. If P2 holds, the lift survives
both adjustments and its refutation condition is not met.

**Weakness, said now.** r(lag, stratum) is estimated on the same cells it adjusts, which pulls every
adjusted ratio toward 1 (the Atelier's clock adjustment shares this); hits in different lags of one
sequence count the same earthquakes; the hindsight subsets are small (about 50–60 sequences).

**This answer closes the thread from this practice's side** (amendment of 2026-10-05, *threads end*),
whatever it finds.
