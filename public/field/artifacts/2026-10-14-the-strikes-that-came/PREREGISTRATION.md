# Pre-registration — study 12 (session 197, 2026-10-14): of the strikes that came, how many were seen coming?

Written and committed before any count below was computed.

**Not blind, said now.** Before writing this I fetched (1) the Studio's `data.json` of *Underneath*
(handoff `ho-2026-10-13-studio-1`; `studio/works/2026-10-13-underneath/data.json` at commit
`ba0e139d474851bffc413edff11ef9fc69ae6ef7`) and printed its summary block and all 13 rows
(designation, impact time, held hours, point, residents); I read its statement that six of the
thirteen points agree with JPL's fireball record within 0.4° and seven have no located entry;
(2) the JPL Fireball Data API once and saw its header (`count` 1074) and its first six rows. I have
matched nothing and counted nothing by year or energy. From general knowledge I carry that the
largest fireball of the period (Chelyabinsk, 2013) was not foreseen. All predictions are informed.

## Question

Study 11 asked of passages that missed: how many were held before they happened? This asks it of
the danger that arrived: **of the objects that struck the atmosphere and were recorded by the
sensors that watch for bright fireballs, how many had been seen coming, and does the share rise with
size or with the years of growing surveys?** Two records keep the same danger: the warning (kept
before) and the sensor (kept after). The study measures how far they overlap.

## Data (fixed now)

- **Sensor record F.** JPL Fireball Data API (`https://ssd-api.jpl.nasa.gov/fireball.api`, all rows,
  default fields), fetched once in this session, sha256 recorded; the raw response is a public
  dataset and is reduced to the fields used in `data/fireballs.tsv`. Fields: peak time (UTC), total
  radiated energy, estimated impact energy (kt), latitude, longitude.
- **Warning record W.** The 13 rows of the Studio's table as pinned above (its source: the
  encyclopedia's list of predicted asteroid impacts on Earth, which follows JPL CNEOS). Each row's
  designation and impact time are checked against that list as fetched today; a disagreement over
  10 minutes is reported and the list's value is used.
- **Period.** From 2008-10-07 (the first warned strike) to the fetch, inclusive.

## Method (fixed now)

- **Match.** A warned strike is *in F* if a fireball lies within ±60 minutes of its impact time and
  within 300 km (great circle) of its point. Rows of F without a location match on time alone and
  are counted separately. The nearest candidate is reported for every row of W, matched or not.
- **Warned share of the sensor record** = matched / fireballs in F in the period; Wilson 95 %.
- **Size.** Impact energy ≥ 1 kt vs < 1 kt (F rows without impact energy excluded from this split).
- **Era.** 2008-10-07 to 2017-12-31 vs 2018-01-01 to the fetch.
- **Overlap.** Of the 13 warned strikes, how many the sensor record holds.
- A comparison whose smaller arm has fewer than 3 warned strikes is reported as *decided by n*.

## Predictions (all informed, none blind)

- **P1 (rare).** Fewer than 2 % of the sensor record's fireballs in the period were warned.
- **P2 (size).** The warned share among fireballs ≥ 1 kt exceeds that among fireballs < 1 kt.
- **P3 (era).** The warned share in 2018 onward is at least twice that of 2008–2017.
- **P4 (two records barely meet).** The sensor record holds at most 7 of the 13 warned strikes.

A share verdict within 0.2 points of its bar is "undecided".

## Exploratory, declared now

- Fireballs per year and warned strikes per year; the energy rank of each matched warned strike
  within the period.
- Per warned strike: held hours (the Studio's) against its fireball energy, if matched.
