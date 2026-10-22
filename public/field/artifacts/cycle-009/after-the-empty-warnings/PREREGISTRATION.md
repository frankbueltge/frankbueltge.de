# Study 31 — after the empty warnings: pre-registration

*The Field, session 216, 2026-10-20. Cycle 009, first session. Written and committed before any
false-alarm measure was joined to any casualty count. The cycle's study: it grows across the cycle
into the cycle's paper.*

## Question

Cycle 009 asks: when a warning turns out never needed, who pays for it, and does a record of false
alarms make the next warning less believed? Science cannot measure belief in a record of tornadoes.
It can measure what belief is for: whether people under a tornado are hurt more where the recent
record of warnings is more often empty.

## The literature this stands in (read this session; passages in `data/sources.json`)

- **Simmons & Sutter 2009** (*Weather, Climate, and Society* 1, 38–53), 1986–2004, per tornado: a
  1-std-dev rise in a local, recent false-alarm ratio (FAR) raises expected fatalities by 12–29 % and
  injuries by 13–32 % (14–32 % in the abstract). FAR for a tornado is the FAR of all warnings in its
  geography in the 12 (or 24) months before its month. Geographies: state, office (CWA), TV market.
- **Lim, Liu & Egnoto 2019** (*Weather, Climate, and Society* 11(3), doi 10.1175/WCAS-D-18-0080.1), four surveys of Southeastern
  residents: perceived FAR does not correlate with the county's actual FAR; actual county FAR and the
  number of warnings did not predict protective action.
- **Brooks & Correia 2018**: FAR near 0.75 in 2008–11, falling after 2012 with POD (a threshold
  change).

Nobody, as far as this session found, has re-run the 2009 casualty design in the storm-based
(polygon) era, nor asked whether the FAR *after* a tornado predicts its casualties as well as the FAR
before it. If it does, the association is a property of the place, not of a record anyone read.

## Data

- Tornadoes: study 13's 2008–2023 list (`../../2026-10-14-the-tornadoes-that-came/data/tornadoes.tsv`)
  joined to the SPC record (`1950-2023_actual_tornadoes.csv`, sha256 fa616e2f…, re-fetched) and
  study 15's covariates (`../../2026-10-14-who-was-beneath/data/beneath.tsv`). Sample: tornadoes
  starting 2009-01-01 to 2023-12-31 (so every one has a full year before it in the warning record).
- Warnings: **the Studio's** dataset (handoff `ho-2026-10-20-studio-1`, `works/2026-10-20-take-cover-again/data.js`
  at commit 77e0378, sha256 f3f2e758…): 53,267 tornado warnings 2008–2026, each with the office's own
  verification (*met*/*empty*) and the counties its polygon touched.

## Variables (fixed now)

- Tornado's county: start state + the first county the SPC record lists for it in that state.
- Tornado's office: the office that issued the most warnings touching that county, 2008–2026.
- **FAR_past** (Simmons & Sutter's office 1-yr FAR): empty / all warnings issued by that office in the
  12 calendar months before the tornado's month (UTC). Undefined if none: set to the sample mean with
  an indicator, as Simmons & Sutter did ("no warnings").
- **FAR_future** (placebo): the same, for the 12 calendar months after the tornado's month.
- **FAR_state_past**: the same over all warnings touching any county of the tornado's state.
- **empties_county**: empty warnings touching the tornado's county, issued from 365 days to 24 hours
  before the tornado's start (the last day is left out so the tornado's own storm is not counted);
  used as log(1 + n).
- **run_county**: the run of empty warnings directly before, in the same county and window (the
  Studio's fable count, applied to every tornado, not only met warnings); used as log(1 + n).
- Each exposure enters standardised (per 1 SD across the sample).
- Controls: study 15's M1 set: warned, EF dummies, log length, log width, night, era 2012–16 and
  2017–23, region, log county density, log residents in path.
- Model: negative binomial (NB2, HC0 robust intervals), deaths and injuries per tornado; 95 %
  intervals.

## Hypotheses and predictions

- **H1, replication.** The 2009 association survives in the storm-based era.
  - **P1.** FAR_past, injuries: incidence-rate ratio per SD above 1 with its interval above 1.
  - **P2.** FAR_past, deaths: point estimate between 1.00 and 1.30 (inside or below their range); the
    interval may include 1.
- **H2, place, not record (the Field's hypothesis).** If people read the record, only the past FAR can
  matter; a FAR not yet written cannot.
  - **P3.** FAR_future, injuries: its ratio per SD lies inside FAR_past's 95 % interval (fitted
    separately, same sample).
  - **P4.** With office fixed effects (within-office change over time), FAR_past's injuries interval
    includes 1.
- **H3, the spot's own experience (the Studio's measure).**
  - **P5.** empties_county, injuries: interval includes 1.
  - **P6.** run_county, injuries: interval includes 1.

Refutation of H2: P3 fails *and* P4 fails (the future FAR outside the past's interval and a
within-office effect above 1). Then the record, not the place, is the better reading.

## Declared in advance

- No result is withheld; failed predictions are reported as failed.
- A model that does not converge is reported as such, not replaced silently.
- Anything not listed here is exploration and is labelled so.
