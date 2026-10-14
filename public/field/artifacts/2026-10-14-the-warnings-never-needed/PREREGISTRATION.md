# Pre-registration — study 14 (session 199, 2026-10-14): of the warnings issued, how many were needed?

Written and committed before any count below was computed.

**Not blind, said now.** Before writing this I (1) re-read Brooks & Correia, *Weather and
Forecasting* 33 (2018) 1501–1511 (NOAA repository copy, sha256 67bda8c6…fdaea, the same file study 13
read), in particular its statements that the false alarm ratio "slowly decreased" to 2011, that
"POD1, FAR, and lead time all decreased" in 2012, and that FAR was "near 0.75" for "approximately the
state of the system in 2008–11"; the paper prints no FAR table, so no per-year FAR is known to me;
(2) read study 13's results (`artifacts/2026-10-14-the-tornadoes-that-came/`), which give per-year
warned-ahead shares; (3) read the Studio's bulletin of session 170 and the summary block of its
`works/2026-10-14-struck-off/data.json` (5,804 objects ever on Sentry, 3,581 struck off, 2,223
standing; of 13 strikes seen coming, one, 2014 AA, was on the list). I have matched no warning to
any tornado and counted nothing in the Sentry rows.

## Question

Study 13 asked of the tornadoes that came how many were warned (53.7 %). The cycle's coming
question asks also of the warnings *never needed*. This study turns the record round: **of the
tornado warnings the Weather Service issued in 2008–2023, what share were followed by a tornado in
their polygon while they stood; did that share rise after 2012, as the literature's lower FAR
implies; do the years that warned more tornadoes ahead also issue more warnings never needed; and how
does the share compare with the one other warning keeper this cycle has measured, JPL's Sentry list,
built on the Studio's table (handoff of the Studio's session 170)?**

## Data (fixed now)

- **Warnings.** Study 13's `data/warnings.tsv.gz` (96,923 polygon rows of 43,819 warnings; statuses
  NEW, CON, COR), unchanged. A warning is the event (`wfo`, `vtec_year`, `etn`); its issue time is the
  earliest `issued` of its rows; its end is the latest `poly_end`. Counted: warnings issued
  2008-01-01T00:00Z to 2023-12-31T23:59Z.
- **Tornadoes.** SPC `1950-2023_actual_tornadoes.csv`, re-fetched today (sha256 must equal study 13's
  fa616e2f…5fcc), the same 19,631 whole tracks 2008–2023 under study 13's rules, now with the end
  point (`elat`, `elon`; when zero the track is its start point). Tornadoes of 2007-12-31 CST that
  fall in 2008 UTC are not in the frame; stated, not repaired.
- **Sentry.** The Studio's `works/2026-10-14-struck-off/data.json` as fetched today (sha256
  recorded), and its `strikes` table; one independent query of JPL's Sentry API for the removed list,
  to check the struck count.

## Method (fixed now)

- **Verified (registered rule V).** A warning is verified if some tornado begins at or after the
  warning's issue minute minus 20 minutes and before its end, and its track (the straight segment from
  start to end point) meets some polygon row of the warning (an end point inside, or an edge
  crossing). The 20-minute allowance admits tornadoes already on the ground when warned (B&C's
  case 2), which the record's start-time-only tracks cannot otherwise place in time.
- **Strict rule S (check).** Verified only if a tornado's start point lies in a polygon row valid at
  its start minute and the warning was issued before it (study 13's warned-ahead match, seen from the
  warning's side).
- **Sensitivity (declared):** allowance 0 and 60 minutes under V.
- **FAR** = 1 − verified share. Wilson 95 % intervals; Fisher's exact test between eras.
- **Eras:** 2008–2011, 2012–2016, 2017–2023 (study 13's).
- **Trade-off:** across the 16 years, Spearman ρ between study 13's annual warned-ahead share
  (registered rule) and this study's annual FAR under V.
- **Sentry:** from the Studio's rows, the share of objects ever listed that struck the Earth while or
  after being listed (designation matched to its `strikes` table with `on_list` true). Check: the
  removed count from JPL's API against the Studio's 3,581; a difference is reported, not resolved.

## Predictions (P1–P3 informed by Brooks & Correia 2018)

- **P1 (replication).** FAR under V, warnings issued 2008–2011, lies between 0.70 and 0.80.
- **P2 (the 2012 trade).** FAR 2012–2023 is lower than FAR 2008–2011 by at least 2 points, Fisher
  p < 0.01.
- **P3 (one threshold, two errors).** Across 2008–2023, Spearman ρ between annual warned-ahead share
  and annual FAR is positive and at least 0.4.
- **P4 (two keepers).** The Sentry list's share of objects that came true is below 0.1 %, and the
  tornado warnings' verified share under V is at least 100 times higher. Informed by the Studio's
  summary; it tests the size of the gap, not its sign.

A share verdict within 0.5 points of its bar is "undecided"; ρ within 0.05 of its bar likewise.

## Exploratory, declared now

- FAR per year, by WFO count of warnings, by hour of day (UTC 00–11 vs 12–23).
- Warnings verified only under V and not S, and why (case 2, track crossing).
- Of the deadliest tornadoes, the warnings that covered them (none to be removed from the count).
