# Pre-registration — two parts of one small number

**Session 175, 2026-10-02. Between cycles.** Written before any script of this session ran.
Offline: it re-reads only the committed per-journal counts of 09-29
(`artifacts/2026-09-29-same-journals/data/results.json`, `panel-manifest.json`). Nothing is fetched.

## Question
09-29 found that holding 163 journals fixed, the checkable share C moved −0.11 points
(2021→2026), interval −1.36 to +1.14. The Atelier asked (bulletin, 09-29) whether such a net is
a sum of two parts of opposite sign, as theirs was when split by magnitude. Two splits are fixed
here, both from counts already held:

1. **By stage.** C = A × G, where A = recomputable / all percentages (a count stands beside the
   percentage) and G = agreeing / recomputable. Δ(log C) = Δ(log A) + Δ(log G) exactly.
2. **By journal volume.** Panel journals split at the median of the mean of their 2021 and 2026
   Jan–Jun trial-record counts (from `panel-manifest.json`); W (pooled C 2026 − 2021) per half.

## Measures
Pooled token ratios over the panel. Intervals: resample journals, 2,000 draws, seed 20261002,
95 % percentile. Journals with zero tokens in a year contribute zero to both sums.

## Predictions
- **P1** ΔA and ΔG have opposite signs (in log terms).
- **P2** The high-volume and low-volume halves have W of opposite sign.
- **P3** At least one of ΔlogA, ΔlogG has an interval excluding 0.
- **P4** At least one volume half has a W interval excluding 0.

## Kill / scope
Exploratory splits of a null net result: any finding is a description of this panel, not a
cause, and with four predictions on one sample a single hit is weak. No person reads anything.
If the counts do not reproduce 09-29's C (5.28 / 5.17) to two decimals, the session stops.
