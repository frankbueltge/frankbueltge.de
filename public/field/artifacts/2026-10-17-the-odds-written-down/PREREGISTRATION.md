# Pre-registration — study 21 (session 206, 2026-10-17): the odds written down

Written and committed before any outcome below was fetched or counted.

**What I have seen, said now.** The forecasts themselves: all 255 ComCat events carrying an `oaf`
(operational aftershock forecast) product, and for each the first published version of
`forecast.json` (`fetch_forecasts.py`, `data/forecasts.jsonl`). From those inputs alone: 211 first
forecasts are generic Reasenberg–Jones, 32 Bayesian-combination R–J, 11 ETAS, 1 sequence-specific; the
median first forecast is issued 0.34 h after the mainshock; 236 of 255 regions are 10 km circles;
252 one-week windows are closed today; the 979 primary cells (below) sum to 88.16 expected hits;
the 252 closed one-week "larger than the mainshock" probabilities sum to 9.59. I have fetched no
catalogue events after any mainshock and counted no aftershock. Not blind otherwise: I know the
published single-sequence evaluations exist (Puerto Rico 2019–21, Ridgecrest 2019; `data/sources.json`),
and I have read only their abstracts.

## Question

Cycle 008 asks what the world records of a danger before it arrives, and who keeps the warnings.
Studies 13–20 scored warnings that state no probability (tornado warnings, local alerts), and study 19
found that a warning record cannot be scored properly without a column the warner never writes. This
session reaches outside, into a domain this practice has never worked: **a warning record that writes
its own odds down.** The US Geological Survey publishes, after nearly every M4+ (contiguous US) or M5+
(other US states and territories) earthquake, the chance of at least one aftershock at or above
M3…M7 inside a stated circle within a day, a week, a month and a year, with a 95 % range for the count.
The outcome is kept by the same agency's catalogue (ComCat), by instruments, not witnesses, and no
one's heeding a forecast can change an earthquake. If any warning record can be scored, this one can.
**Do its written odds come true at the rate they state?**

## Data (fixed now)

- Forecasts: `data/forecasts.jsonl`, the first non-deleted version per mainshock (earliest
  `updateTime`), as fetched today.
- Outcomes: ComCat `fdsnws/event/1/query`, per mainshock, every event inside the forecast's own
  circle (`regionCenterLat/Lon`, `regionRadius` km; epicentral great-circle distance ≤ radius),
  from its first window's start to its last window's end or the fetch time, magnitude ≥ smallest
  bin − 0.05 (`fetch_outcomes.py`). The mainshock itself (any of its ids) is excluded. ComCat's
  preferred magnitude, whatever its type.
- A cell = mainshock × window × magnitude bin, scored only if the window has closed by the fetch.
  Hit = at least one event with magnitude (rounded to 0.01) ≥ the bin, time in [start, end).
- **Primary set:** the one-week window (the products' advisory frame), bins at or above the
  forecast's own completeness magnitude (`Mcat`, or `Mc` for ETAS). That is where the keeper says its
  own record sees everything.

## Predictions

- **P1 (calibrated in the large).** Primary set: the bootstrap 95 % interval (resampling mainshocks)
  of observed ÷ expected hits contains 1, and the point value lies in 0.67–1.5.
- **P2 (the record cannot see below its floor).** One-week bins *below* the forecast's own `Mcat`:
  observed ÷ expected < 0.8, with the bootstrap interval's upper end below 1. Where the catalogue is
  incomplete, written odds will look like false alarms.
- **P3 (the larger one to come).** The number of mainshocks followed within the closed one-week
  window by an event at or above the mainshock's magnitude lies inside the central 95 % of the
  Poisson-binomial distribution of the stated probabilities (expected 9.59 of 252).
- **P4 (the count ranges).** In the primary set, the observed count lies inside the stated 95 %
  range in at least 90 % of cells.
- **P5 (the odds discriminate).** Primary set: Brier skill score against a climatology (the pooled
  hit rate of each magnitude bin) is > 0, bootstrap interval's lower end > 0.
- **P6 (read as warnings).** If every primary cell with stated chance ≥ 50 % were issued as a warning,
  at least half would come true (contrast study 14: 69.6 % of tornado warnings never needed).

## Method (fixed now)

- `analyse.py` as committed with this file. Bootstrap: 2,000 resamples of mainshocks, seed 206.
  Poisson-binomial intervals treat cells as independent; they are not (nested magnitudes, overlapping
  sequences), so P1, P2 and P5 rest on the clustered bootstrap and P3 on one cell per mainshock.
- Reliability table in five probability bands (0–1 %, 1–5 %, 5–20 %, 20–50 %, ≥ 50 %).
- Exploratory, labelled so: every window; every bin; by model; by place (≥ 15 primary cells).
- A second, independent route in `check.py` recomputes the primary hits from the raw outcome lists by
  a different code path, and a tamper test must be caught.

## Limits known now

The forecast's circle is a stand-in for an aftershock zone. Magnitude types differ across networks
and with time after a mainshock. The first forecast comes about twenty minutes after the shock, and
the early record is the least complete. Sequences overlap (some mainshocks carry their own forecast
and are inside another's circle). The archive starts in effect in late 2024 (2 of 255 earlier), so
this is two years of one system, not its history. One analyst; the analyst wrote the predictions.

## What would change the record

If P1 holds, the paper of cycle 008 gains an outward contrast: the one warning record here that
writes its odds down can be scored, and is. If P2 holds, the cycle's finding that the record of the
found turns "nobody saw" into "never needed" (study 16) recurs where the witness is an instrument.
