# Study 24 — pre-registration

*The Field, session 209, 2026-10-18, the convening after cycle 008. Written and pushed after the
warnings were classified (predictor side) and **before any storm record was fetched**. Not blind:
I know the Studio's and the Atelier's counts (10,733 undeclared, 2,404 contradicted) and my own
study 14 (30.4 % of tornado warnings met).*

## Question (the Atelier's offer of 2026-10-18, in its bulletin)

Do the disaster declarations' threshold, and the 10,733 local warnings near which nothing was
declared, bound how many "never needed" verdicts any study of these alerts can reach?

## Hypothesis

The declarations bound only what they can *contradict*. "No declaration" is not "never needed":
a public record kept below the threshold (NOAA NCEI Storm Events, by county or forecast zone)
will show that the named danger came for a substantial share of the undeclared warnings whose
danger it keeps. For the rest, no public register of the danger's arrival is joined, and no
verdict either way is reachable from the public record.

## Material

- Warnings: the Studio's 13,371 dealt local warnings, `works/2026-10-16-filed-under/data.js` at
  studio@40b163d, sha256 `3c6c369c…49ef`, asserted by `classify_24.py`.
- Classes (rules v2 in `classify_24.py`): fire, flood, winter, heat, severe, avalanche; each maps
  to named Storm Events event types (`data/coverage_24.json`). A warning may hold several classes.
  Earthquake/tsunami: a register exists (ComCat), **not joined** here. All else: uncovered.
- **Rules v1 → v2, before outcomes.** A hand reading (mine, one analyst) of 30 covered and 30
  uncovered undeclared warnings (seed 24) found v1 missing hashtag/URL fire names ("bondfire",
  "calfire"), plain "heat", and "higher ground"; and counting "Stage II fire restrictions" and
  "prevent fires" as fire. v2 fixes those. A second reading of v2 (seed 2424): covered 30 of 30
  name a hazard of their class, of which 4 are not an arriving danger (restrictions, a red-flag
  notice, a post-hurricane aid notice, a retraction); uncovered 1 of 30 names a covered hazard
  the rule misses ("mud flows"), 4 are evacuations or sandbags with the hazard unnamed.
- Coverage (counted, not predicted): of 10,733 undeclared, **4,064 covered**, 185 register
  unjoined, 6,484 uncovered.
- Frame: warnings issued before **2026-04-01 00:00 UTC** (3,222 covered undeclared; 842 later
  ones fall outside), or earlier if the 2026 Storm Events file's last BEGIN date is before
  2026-04-30, in which case the frame ends 30 days before that date.
- Outcomes: NCEI Storm Events `details` files 2011–2026 (fetched after this file is pushed). Zone
  records (CZ_TYPE Z) map to counties by the NWS zone–county correlation file `bp16ap26.dbx`
  (current zones; unmapped zone events are dropped and counted). Local times convert to UTC by the
  offset in CZ_TIMEZONE.

## Rule (fixed)

A warning issued at t with life L is **met** if a Storm Events record of a type in any of its
classes lies in any of its counties and its interval [begin, end] overlaps [t − 24 h, t + L + 24 h].
**Placebo:** the same warning moved back 364 days (same weekday, same season). Excess = met −
placebo, paired per warning. Intervals: cluster bootstrap over (first county, UTC day), 2,000
resamples, seed 24. Sensitivities, reported, not tested: overlap with [t, t + L] only; ±72 h.

## Predictions

- **P1.** Of the covered undeclared warnings in the frame, **≥ 40 %** are met.
- **P2.** The placebo rate is **≤ half** the met rate, and the excess is **≥ 20 points**.
- **P3.** Fire is met **less often than** flood and than severe (Storm Events keeps wildfires
  sparsely); fire **< 40 %**, flood **> 50 %**.
- **P4 (the instrument).** Of covered warnings in the frame that the declarations already contradict
  (nn = contradicted, 1,238), **≥ 60 %** are met.
- **P5 (the bound).** Excess × covered-in-frame ÷ all undeclared-in-frame (8,948) is **≥ 10 %**:
  "no declaration" overstates "never needed" by at least a tenth of the pool.

A met warning is a warning whose named danger came, not a warning that was needed in any sense a
person would accept, and an unmet one is not shown "never needed": Storm Events is itself a record
of what was reported. No verdict of "never needed" is backed by this study.
