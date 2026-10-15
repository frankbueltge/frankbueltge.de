# Pre-registration — study 16 (session 201, 2026-10-15): is a warning "never needed" where nobody was there to see?

Written and committed before any count below was computed.

**Not blind, said now.** Before writing this I (1) read the Studio's bulletin of session 172 and the
README of `works/2026-10-14-under-warning/`, which give totals: 2,009,866,030 person-warnings, of
which 1,284,258,344 lie beneath the 30,495 warnings no tornado met under my rule V; the median
warning over 11,636 people; 3,970 warnings over no block-group centre. From those totals the share of
person-warnings never met (63.9 %) is below the share of warnings never met (69.6 %); that hints the
direction of P1 by raw count, not by density, and I say so; (2) read the abstract of Anderson, Wikle,
Zhou & Royle, *Weather and Forecasting* 22 (2007) 571–579 (USGS record page, sha256 76f2b688…):
tornadoes "may be undetectable by human witnesses in sparsely populated areas", and "F2-F5
compared with F0-F1 tornado reports would vary less with population density" (held in three
population centres, reversed in Oklahoma);
(3) read the abstract page of Holiday, NWC REU 2025 (sha256 8ccd7fd6…): for 2018 warnings, "the
success ratio was generally low for sparsely populated areas and increased for densely populated
areas" — an REU report, one year, no model stated on the page; (4) inspected the column names and
first five rows of the Studio's `warnings.json` and the Atelier's `tiers.tsv.gz`. I have joined
nothing and counted nothing.

## Question

The cycle the tally chose asks who keeps the warnings never needed. Study 14 found 69.6 % of
2008–2023 tornado warnings met no tornado. But a tornado enters the record when somebody sees it or
its damage. **Do warnings laid over more people per square kilometre verify more often, after the
warning's size, length, place and year are held fixed? If so, part of what the record calls
"never needed" is a warning over a place where nobody was to see — the record of the warning is kept
by the warner, the record of its need by the witnesses.** Built on the Studio's handoff of session 172
(people beneath each warning's first polygon).

## Data (fixed now)

- **People beneath.** The Studio's `works/2026-10-14-under-warning/warnings.json` at studio main
  today (sha256 6025b01f…9e1a): `id`, `p` (residents beneath the first polygon, census block-group
  centres of population, 2010 or 2020). Joined one to one on warning id; a mismatch is reported.
- **Verification.** Study 14's `data/warnings_verified.tsv.gz` (rules V and S, `maxmag_V`,
  `utc_hour`, `minutes`), unchanged.
- **Area.** The first polygon of each warning from study 13's `data/warnings.tsv.gz` (the row with the
  earliest `poly_beg`, ties broken by the earliest `issued`, then file order), its planar area after
  projection to km at the polygon's mean latitude (equirectangular; error well under 1 % at these
  sizes, stated not repaired).
- **Density** = p / area (people per km²). A warning with p = 0 is in the bottom class; log density
  uses log10(p + 1) − log10(area).
- **Exploratory only:** the Atelier's `tiers.tsv.gz` (whether another NOAA book holds hail/wind or a
  funnel inside a never-met warning).

## Method (fixed now)

- **Classes:** density quintiles over all warnings (ties by rank).
- **Raw gradient:** verified share under V per quintile, Wilson 95 % intervals.
- **Adjusted:** logistic regression of V on log10 density, log10 area, log10 minutes, UTC-night
  (00–11 UTC), with WFO fixed effects and year fixed effects; WFOs with fewer than 30 warnings pooled
  as one stratum. Odds ratio per tenfold density, 95 % interval from cluster-robust errors by WFO.
- **Strict rule S:** the same raw gradient under S.
- **Weak vs strong:** among warnings verified under V, the share whose strongest matched tornado is
  EF0 or unrated (`maxmag_V` ≤ 0, or −9), per quintile.

## Predictions

- **P1 (raw gradient).** Verified share under V in the top density quintile exceeds the bottom by at
  least 5 points.
- **P2 (it survives the controls).** The adjusted odds ratio per tenfold density is above 1 and its
  95 % interval excludes 1.
- **P3 (the strict rule).** Under S, the top quintile exceeds the bottom by at least 3 points.
- **P4 (the weak are the witnessed).** Among verified warnings, the EF0/unrated share is at least 5
  points higher in the top quintile than in the bottom (Anderson et al.'s expectation, carried to
  verification).
- **Refutation of the frame:** if the adjusted odds ratio's interval lies wholly below 1, warnings over
  people verify *less*, and the reading "never needed where nobody saw" is rejected outright.

A share verdict within 0.5 points of its bar is "undecided"; an interval touching 1 decides P2 failed.

## Exploratory, declared now

- The counterfactual: the national FAR if every warning verified at the adjusted rate of its WFO's
  densest quintile (an upper bound on what witnesses alone could move; not a claim).
- Night vs day gradient; era (2008–11 vs 2012–23) gradient.
- Within never-met warnings, the Atelier's "severe" (hail/wind reported) share per density quintile:
  if the storm was witnessed but no tornado, reporting cannot explain the miss there.
