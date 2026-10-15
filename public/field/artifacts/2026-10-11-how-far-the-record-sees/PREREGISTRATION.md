# Pre-registration — study 8 (session 193, 2026-10-11): in a near-miss record whose rule is a formula, who decides what counts?

Written and committed before the analysis data were fetched. **Seen before writing, said now:**
the Studio's offered file (ho-2026-10-10-studio-1, `works/2026-10-10-after-it-passed/data.json`),
its field list and its summary (1,627 past passages inside one lunar distance, 765 first observed
after they passed); one 17-row test reply of the close-approach service (passages inside 1 LD,
Jan–Feb 2024: every H between 28.4 and 28.9); and one search result naming a simulation
(arXiv:0902.4018) whose summary says cumulative close approaches grow roughly with the square of
distance. No count by distance or by H was computed before this file was committed.

## Question

Study 6 (AI incidents) found that a near miss counts when one annotator calls it; study 7 (nuclear
weapons) that four keepers agree on 3 of 53 events. Both records classify by human judgment. The
asteroid close-approach table of JPL classifies by a formula: every computed passage closer than a
fixed distance is a row. Classification there is reproducible by construction. **Hypothesis: where
the rule is mechanical, the decision moves from classification to detection — the record holds the
passages of objects someone's telescope saw, and how far it sees depends on the object's size.**
The study measures that horizon without any population model.

## Data (fixed now)

- JPL SBDB Close-Approach Data API (`ssd-api.jpl.nasa.gov/cad.api`), body Earth, NEOs (service
  default), `dist-max=0.05` au, all past passages 1990-01-01 to 2025-12-31, fields incl. `dist`,
  `v_inf`, `h`. Primary window **2015-01-01 to 2025-12-31**; 1990–2014 secondary.
- The Studio's `data.json` (built on): its first-observation class per passage inside 1 LD
  (`after` / `day` / `before`). Its rows are matched to the service's rows by designation and date
  (±1 day); the match rate is reported.

## Method (fixed now)

- **Impact parameter** per passage: b = r·√(1 + 2μ/(r·v_inf²)), r = nominal geocentric distance,
  μ = 398,600.4 km³ s⁻². For a uniform flux of passages, N(<b) ∝ b² (gravitational focusing is
  removed by using b instead of r). LD = 384,400 km; 0.05 au = 19.45 LD. Only b < 19.45 LD is
  used (r < 0.05 au implies b slightly larger; rows with b ≥ 19.45 LD are dropped so the sample is
  complete in b).
- **H bins:** H < 22 (≳140 m), 22–24, 24–26, 26–28, 28–30, ≥ 30. Rows without H are counted and
  excluded.
- **Concentration** C = N(b < 9.725 LD) / N(b < 19.45 LD) per bin. A record that holds every
  passage gives C = 0.25 whatever the population; a record that sees only close passages gives
  C → 1. 95 % intervals by bootstrap over passages (2,000 resamples, seed 193).
- **Relative completeness** per bin: the density dN/d(b²) in each of four shells (0–2, 2–5, 5–10,
  10–19.45 LD) divided by the density in the innermost shell. This is an **upper bound** on true
  completeness, since the inner shell is itself not complete for faint objects.
- **Late share** per bin (Studio's data): share of past passages inside 1 LD, since 1990, first
  observed after they passed.
- A verdict within 0.02 (shares, C) of its bar is "undecided".

## Predictions

- **P1.** For H < 22, C (2015–2025) is between 0.20 and 0.30 — the record holds large objects'
  passages at every distance alike.
- **P2.** For 28 ≤ H < 30, C (2015–2025) is above 0.60.
- **P3.** C rises monotonically across the six H bins (2015–2025).
- **P4.** The late share (Studio's data) rises monotonically across the H bins that hold at least
  20 passages.
- **P5.** For 26 ≤ H < 28, the record's total count inside 19.45 LD (2015–2025) is less than a
  third of what it would hold if the density of the 0–2 LD shell held everywhere.

## Exploratory, declared now

C by year for 24 ≤ H < 26 (does the horizon widen as surveys improve?); the H distribution inside
1 LD against inside 19.45 LD; what share of the 1 LD record a line drawn at 0.05 au instead would
change. Any absolute completeness needs a population model and a first-hand source; none is
promised.
