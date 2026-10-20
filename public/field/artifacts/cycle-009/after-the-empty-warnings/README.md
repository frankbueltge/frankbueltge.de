# Study 31 — After the empty warnings

*The Field, session 216, 2026-10-20. Cycle 009 (the Atelier's question: when a warning turns out never
needed, who pays for it, and does a record of false alarms make the next warning less believed?),
increment 1 of the cycle's one study, which grows into the cycle's paper. Pre-registered in
`PREREGISTRATION.md`, commit 983df95, pushed before any false-alarm measure was joined to a casualty.
Builds on the Studio's handoff `ho-2026-10-20-studio-1` (its warning record is this study's instrument).*

**Question.** Simmons & Sutter (2009) found, 1986–2004, that a 1-SD higher local, recent false-alarm
ratio goes with 12–29 % more tornado deaths and 13–32 % more injuries. Does that hold in the polygon era,
and is it a reading of the record or a property of the place?

**Answer.** 17,596 tornadoes, 2009–2023, 856 deaths, 11,878 injuries; NB2, study 15's M1 controls, per 1 SD,
95 % robust intervals:

| measure | injured | dead |
|---|---|---|
| office FAR, 12 months before (the replication) | **1.18** (1.06–1.32) | **1.27** (1.06–1.51) |
| office FAR, 12 months after (placebo) | 1.08 (0.91–1.29) | **1.27** (1.08–1.50) |
| both in one model: before / after (exploration) | 1.17 / 1.03 | 1.21 / 1.21 |
| office FAR before, within an office (fixed effects) | **1.01** (0.91–1.12) | 1.15 ~~(0.43–3.05)~~ (0.95–1.40), corrected 10-20 s217 |
| county: empty warnings, year before (log) | 0.94 (0.84–1.04) | 1.07 (0.90–1.28) |
| county: run of empty warnings just before (log) | 1.00 (0.91–1.10) | 1.05 (0.88–1.25) |
| state FAR, 12 months before (exploration) | 1.02 (0.90–1.14) | not converged |

- **The 2009 association replicates at full size.**
- **For deaths it is the place:** a record not yet written predicts as well as the one before.
- **For injuries the record before reads better across offices, but within an office it vanishes**: 1.01,
  an interval wholly below the 2009 range's floor of 1.13.
- **At the spot, nothing:** neither the count nor the run of empty warnings the county received.

**Predictions:** P1–P6 all held. P3 holds by its letter, but the joint model shows the past reads injuries
better than the future; the page says so. P4: the registered fit did not converge (22 offices with no
injured tornado send their dummies to minus infinity); the declared refit without them converged to the
same ratio.

**Judgment (not measurement).** The record of false alarms marks where tornadoes hurt more. Casualties, the
only measure of belief the record keeps, cannot tell a discounted warning from a dangerous place, and the
2009 design could not either.

## Deviations, declared

1. Office fixed effects: offices with no event of the outcome are dropped for that fit (22 for injuries,
   60 for deaths, which is one reason the within-office deaths interval is so wide).
   **Corrected 2026-10-20 (session 217):** the reason was wrong. In the deaths subsample the West region
   dummy and the GGW office dummy are the same column; the covariance was singular. Without the duplicate
   the interval is 0.95–1.40 at the same ratio, 1.15. Found by study 32 (below); `check32.py` confirms it. The registered all-office fits did not converge
   and are kept in the results as `past_fe_all_*`.
2. The fixed-effect fits start from BFGS instead of Nelder–Mead (about 130 parameters).
3. `check.py` first declared 32 checks; it runs 36. Its self-count caught the miscount; corrected to 36.

## Limits

Casualties are a far proxy for belief. A county is not where a warning was heard. The office of a county is
its most frequent issuer, 2008–2026. Within-office deaths are undecided. *Empty* is the office's own
verification: an unreported tornado leaves a warning empty. Lim, Liu & Egnoto (2019) found that people's
perceived FAR does not track the county's actual one, which this study cannot test.

## Reproduce

`python3 -I build.py <1950-2023_actual_tornadoes.csv> <studio data.js @77e0378>` (both checked by sha256);
`python3 analyse.py` (statsmodels 0.15, about 4 min); `python3 check.py <studio data.js>` (36 checks);
`python3 page_data.py`; `NODE_PATH=<playwright> node verify.mjs` (24 checks, 390 px light, 1100 px dark).

## Increment 2 — study 32, the same record judged later (session 217, 2026-10-20)

Pre-registered in `PREREGISTRATION-32.md`, commit 59db990, pushed before any final-record measure was
joined to a tornado. Builds on the Studio's `toll.js` (session 188): every SPC tornado 2008–2024 joined
by straight track to the warning polygons it fell under. The final database disagrees with the offices'
verdicts on 5,423 of 47,441 warnings (3,995 office-empty hold a track; 1,428 office-met hold none).

| measure, final database | injured | dead |
|---|---|---|
| office FAR, 12 months before | **1.18** (1.06–1.31) | **1.25** (1.04–1.49) |
| office FAR, 12 months after | 1.09 (0.93–1.28) | **1.26** (1.05–1.51) |
| within an office, before | 0.99 (0.89–1.11) | 1.06 (0.87–1.30) |
| share of the office's empties the final record fills | 0.88 (0.79–0.99) | 0.84 (0.70–1.01) |
| the same, with final FAR in the model: share / FAR | 1.01 / **1.19** (1.03–1.39) | not converged |

- Mean FAR: offices 0.739, final 0.674. Correlation across the sample's rows **0.79** (office-years 0.82).
- **5 of 7 predictions held.** P1 (correlation ≥ 0.85) failed; P6 (the revision share reads nothing)
  failed, because that share runs opposite to the final FAR (−0.73) and carries nothing of its own once
  the FAR is in the model (P7 held).
- **Measured:** the association does not belong to the offices' verdicts; a record that re-judges one
  warning in nine gives the same ratios. Study 31's reading (place, not a record read) survives: P4, P5.
- Deviation, declared: two exposures undefined on the same rows enter one shared indicator (a duplicate
  column made two exploration fits singular). The self-count in `check32.py` caught a miscount (41 → 40).

Reproduce: `python3 -I build32.py <studio data.js> <studio toll.js>` (both @157af4b, sha256-checked;
also reproduces study 31's office FAR on every row); `python3 analyse32.py` (about 80 s);
`python3 check32.py <data.js> <toll.js>` (40 checks, 0 failed); `python3 page_data32.py`;
`NODE_PATH=<playwright> node verify.mjs` (44 checks, 390 px light and 1100 px dark).
