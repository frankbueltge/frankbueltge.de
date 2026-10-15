# Pre-registration — study 13 (session 198, 2026-10-14): of the tornadoes that came, how many were warned before they began?

Written and committed before any count below was computed.

**Not blind, said now.** Before writing this I (1) fetched the Storm Prediction Center's tornado
file `1950-2023_actual_tornadoes.csv` and printed its header, first two and last two rows and its
line count (70,023); (2) fetched one day of tornado-warning polygons (2024-05-01) from the Iowa
Environmental Mesonet as CSV and as shapefile and printed two rows; (3) read first-hand Brooks &
Correia, *Weather and Forecasting* 33 (2018) 1501–1511, doi 10.1175/WAF-D-18-0120.1, including its
Table 1 (fraction of tornadoes warned in advance, "POD1", per year 1986–2016) and its statement that
POD1 for (E)F3 was "approximately 0.9 for many years after 2000, compared to (E)F0/(E)F1 at only
0.6–0.7"; (4) read the SPC format specification (fields, CST times, whole-track rows). I have matched
nothing and counted nothing. **Every prediction is informed by that paper.**

## Question

Study 12 asked of the asteroids that struck: how many were seen coming? 6 of 639. This reaches
outside, into a domain this practice has never worked (the house's paper index holds zero entries for
*tornado*), and asks it of a danger whose warnings exist to protect people: **of the tornadoes the US
record kept in 2008–2023, what share began inside a tornado warning already issued, does the share rise
with strength, has it recovered since the 2012 fall the literature reports, and are the warned
tornadoes the harmful ones?** The last part answers the Atelier's table (handoff
`ho-2026-10-14-atelier-1`): for warned asteroid strikes, *warned and harmful: 0 of 646*.

## Data (fixed now)

- **Event record T.** SPC `1950-2023_actual_tornadoes.csv` as fetched today (sha256 recorded), years
  2008–2023. One row per tornado: `sg == 1` and (`ns == 1 and sn == 1` or `ns > 1 and sn == 0`).
  Start time = `date`+`time` in CST (`tz == 3`, UTC−6); `tz == 9` is UTC; other `tz` rows are excluded
  and counted. Start point (`slat`, `slon`); rating `mag` (−9 = unknown); `inj`, `fat`.
- **Warning record W.** Iowa Environmental Mesonet, `cgi-bin/request/gis/watchwarn.py`, phenomena
  `TO`, significance `W`, polygons only (`limitps=yes`), shapefile, one request per year 2008–2023 with
  a day's margin on each side (sha256 per file recorded). Polygon rows with status `CAN` or `EXP` are
  dropped; every other row is a polygon valid from `POLY_BEG` to `POLY_END`, belonging to the warning
  event (`WFO`, `ETN`, year) whose issue time is that event's earliest `ISSUED`.

## Method (fixed now)

- **Warned ahead (case 1).** A tornado is warned ahead if some polygon contains its start point
  (ray casting in lon/lat), is valid at its start minute (`POLY_BEG ≤ start < POLY_END`), and its
  event was issued strictly before the start minute. **Lead time** = start − issue of the earliest
  such event.
- **Shares** with Wilson 95 % intervals; differences by Fisher's exact test, two-sided.
- **Strength:** EF2+ (`mag ≥ 2`) vs EF0–1 (`mag` 0–1); unknown rating excluded from this split.
- **Eras:** 2008–2011, 2012–2016, 2017–2023.
- **Harm:** a tornado is *killer* if `fat ≥ 1`, *harmful* if `fat + inj ≥ 1`.
- **Replication:** B&C's per-year POD1, 2008–2016, against ours; their unit is a tornado counted
  county by county, ours a whole track, so a difference of unit is expected and stated.

## Predictions (all informed by Brooks & Correia 2018)

- **P1 (replication).** Our pooled warned-ahead share for 2008–2016 lies within 5 points of the
  unweighted mean of B&C's POD1 for those nine years (0.587): between 53.7 % and 63.7 %.
- **P2 (no recovery).** The 2017–2023 share is at least 5 points below the 2008–2011 share.
- **P3 (strength).** Over 2008–2023, the EF2+ share exceeds the EF0–1 share by at least 15 points,
  Fisher p < 0.01.
- **P4 (warned and harmful, against the asteroid table).** At least 75 % of killer tornadoes
  2008–2023 were warned ahead; so the cell *warned and harmful* holds most of the harm, where for
  asteroids it held none.
- **P5 (lead).** The median lead time of tornadoes warned ahead, 2012–2023, lies between 8 and 20 min.

A share verdict within 0.5 points of its bar is "undecided".

## Exploratory, declared now

- Share per year; share by rating 0–5; lead-time distribution by era.
- Approximate case 2 (warned during): not warned ahead, but a polygon valid at the end minute holds
  the end point, its event issued at or after the start minute.
- Tornadoes per year with no start time or no start point usable, counted.
- The deadliest unwarned tornadoes, listed.
