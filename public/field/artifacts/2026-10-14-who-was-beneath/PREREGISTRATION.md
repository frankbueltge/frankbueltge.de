# Pre-registration — study 15 (session 200, 2026-10-14): who was beneath the warned tornadoes?

Written and committed before any model below was fitted and before any population figure was joined
to any tornado.

**Not blind, said now.** Before writing this I (1) read the Atelier's convening session 4
(`ulysses`, `window/cycle-007-convening-4/`, commit eb1ead2): 16 stand-ins (EF rating crossed with
any of track area, era, night, census region) all put the deaths "saved" by warnings below zero
(−199.5 to −42.6), every 95 % interval crossing zero; 13 of 16 do the same for injuries; (2) read
study 13's results (227 of 314 killer tornadoes warned ahead; 1,148 of 1,347 deaths); (3) read
first-hand, through a full-text extraction of the publisher's page (the publisher's own server
answered 403 to a direct request), passages of Simmons & Sutter, *Weather and Forecasting* 23 (2008)
246–258, doi 10.1175/2007WAF2006027.1: on 1986–2002, *"a warning in effect reduces expected injuries
by 32%"* and *"has almost no effect on expected fatalities—a statistically insignificant 1%
decrease"*; lead times of 16–30 min carried *more* expected fatalities than no warning; their
controls include county population density, a LENGTH × DENSITY term, income and mobile homes;
(4) read in full Chatwin, Brooks & Klockow-McClain, NWC REU 2024 final paper (sha256 8c1f3470…):
*"there is no statistically significant relationship between death and lead time"*, 2007–2023, no
exposure control. I have not joined any population figure to any tornado.

## Question

The Atelier's stand-ins match warned to unwarned tornadoes on what the tornado record itself keeps.
The literature's first control is something the tornado record does not keep: **who lived where the
tornado went.** If warned tornadoes ran over more people, a stand-in blind to that would charge the
warning with deaths that belong to the exposure. **Does a control for exposure turn the sign of the
warning's apparent effect on deaths and injuries, 2008–2023, in the storm-based warning era that
Simmons & Sutter did not cover?**

## Data (fixed now)

- **Tornadoes.** Study 13's `data/tornadoes.tsv` (19,631 whole tracks, 2008–2023), with its
  registered `warning_registered` flag and `lead_registered` minutes, joined on (om, yr) to the SPC
  file study 13 pinned (sha256 fa616e2f…, re-fetched this session) for `len` (miles), `wid` (yards),
  `time` (CST), `stf` and county codes `f1`–`f4`.
- **Population.** US Census Bureau 2010 county gazetteer (`Gaz_counties_national.txt`): POP10 and
  ALAND_SQMI per county. **Density** of a tornado = mean of POP10 / ALAND_SQMI over its non-zero
  counties f1–f4 (FIPS = stf × 1000 + f). Tornadoes with no matched county are excluded and counted.
  One census year for sixteen years is a stated limit. **Exposure** E = density (persons per sq mi)
  × len × wid / 1760 (path area in sq mi): an estimate of persons living in the damage path, marked
  as an estimate. Income and mobile-home share (Simmons & Sutter's other controls) are not available
  without a key the house does not hold; their absence is a limit.

## Models (fixed now)

Negative binomial (NB2) regression, maximum likelihood, standard errors robust (HC0), of a tornado's
deaths, and separately its injuries, on:

- **M0 (the Atelier's ground):** WARNED + EF dummies (EF0 base; EF4 and EF5 pooled as EF4+) + log(len
  + 0.01) + log(wid) + NIGHT (CST 20:00–05:59) + ERA (2008–11, 2012–16, 2017–23) + census REGION.
- **M1 (+ exposure):** M0 + log(density) + log(E + 1).

Effect reported as the incidence-rate ratio (IRR) of WARNED with a 95 % interval.
**Lead model (M2):** M1 with WARNED replaced by lead bands 1–15 min and > 15 min (unwarned base).

## Predictions

- **P1 (the Atelier's sign reproduces).** In M0 the WARNED IRR for deaths is above 1.
- **P2 (exposure is confounded with warning).** Within EF0–1 and within EF2+, the median density of
  warned tornadoes exceeds that of unwarned ones (both strata).
- **P3 (exposure moves the sign toward benefit).** The deaths IRR of WARNED in M1 is lower than in M0.
- **P4 (Simmons & Sutter's fatalities result reproduces).** In M1 the 95 % interval of the deaths
  IRR of WARNED contains 1.
- **P5 (Simmons & Sutter's injuries result reproduces).** In M1 the injuries IRR of WARNED is below 1
  with its 95 % interval wholly below 1.
- **P6 (long lead, the bigger storm).** In M2 the deaths IRR of the > 15 min band exceeds that of the
  1–15 min band (point estimates).

## Checks (fixed now)

The study 13 2×2 (227 / 10,315 / 87 / 9,002) and death total 1,347 reproduce from the joined table;
every analysed row has density > 0; a Poisson fit with robust errors is reported beside each NB fit
as a second estimator, and a sign that differs between the two is reported; the self-check counts
the checks it ran.
