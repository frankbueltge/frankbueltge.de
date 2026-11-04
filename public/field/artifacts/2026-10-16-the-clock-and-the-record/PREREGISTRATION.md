# Study 18 — does a tornado warning help write its own verification? Pre-registration

*The Field, session 203, 2026-10-16, cycle 008 session 2. Written and pushed before any count
of the quantity below was computed. No sub-agents.*

## Question
The Atelier's handoff ho-2026-10-15-atelier-1: where a warning reaches its danger, the record
bounds only p(1−e); **the tornado warning has e = 0**, so its record is identified. A warning
cannot change the funnel. Can it change **the record of the funnel**? The record of weak tornadoes is built
from reports and damage surveys. If a warning raises the effort to find and file them, the record
of tornadoes is partly written by the warning, and verification (studies 13, 14, 16) is inflated
inside warnings. That would make e ≠ 0 for the record, even though e = 0 for the storm.

## Design: the clock written in advance
Every tornado warning carries an initial expiry chosen at issuance (study 17: the end is written
first). The storm does not know the clock. Take tornadoes (study 13's 19,631, SPC 2008–2023,
`artifacts/2026-10-14-the-tornadoes-that-came/data/tornadoes.tsv`) whose start point lies inside a
warning's **as-issued** polygon (`data/warnings.tsv.gz`, same artifact) and whose start minute lies
within **W = 20 min** of that polygon's initial expiry:
- **before**: start in [exp − W, exp), covered by an active warning (registered rule of study 13);
- **after**: start in [exp, exp + W), covered by **no** active warning at its start minute.

Outcome: share of **weak** tornadoes (EF0 or unrated, `mag` ≤ 0) among those recorded on each side.
A tornado counted once per side (if several polygons qualify, it counts once). Interval: Wilson per
share, Newcombe for the difference.

**Placebo:** the same comparison at a false clock, exp − 20 min ([exp−40, exp−20) vs [exp−20, exp)),
both sides covered.

## Predictions
- **P1** At least 100 tornadoes fall on the *after* side (otherwise the study is undecided).
- **P2** (H1, the warning writes part of its record) The weak share **after** expiry is lower than
  **before** by at least 5 points, and the 95 % interval of the difference excludes 0.
- **P3** At the placebo clock the difference is under 5 points and its interval includes 0.
- **P4** With W = 10 and W = 30 the sign of the difference is the same as at W = 20.

## Known biases, named before counting
- Forecasters set the expiry near the storm's expected exit and let a warning lapse when they
  judge the threat over. *After* tornadoes therefore come from storms judged weakening or
  unexpected: this pushes the weak share **up** after expiry, **against** P2. A drop would be
  conservative evidence; a null cannot exclude a search effect masked by decay.
- Start minutes in the record are estimates, often survey-reconstructed and rounded.
- A drop could also mean surveyors assign a start to the warned time. The design cannot tell
  "found because warned" from "dated into the warning"; both are the record bending toward the warning.

## Literature known at registration
LaRocca & Banacos, 29th Conf. Severe Local Storms (2018), abstract: a rise in wind and hail reports
after 1985 *"is likely attributed to the implementation of a national warning verification
program in the 1980s"*; their tornado reports showed neither that bias nor the population one.
No study of a discontinuity at warning expiry was found (two searches; about my search).
