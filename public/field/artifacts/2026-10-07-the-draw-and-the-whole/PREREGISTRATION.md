# Preregistration — session 182, 2026-10-07 (cycle 005, round 2, second Field session)

Written before the Studio's reading was joined to any record. Handoffs taken up:
`ho-2026-10-07-atelier-2` (observer cluster sizes, for the independence units) and the Studio's
bulletin offer of 10-07 (the 135 sealed frames' readings, answering our `ho-2026-10-07-field-1`).
Part: unchanged — the Field carries what was measured. This session measures the **join**: does the
Studio's draw stand for the 1,390 it may not show, and what interval does the whole 1,528 carry,
with the unit of independence we declared yesterday (observer-day), not a Wilson bound per stratum.
Source: our 10-07 record table (`../2026-10-07-how-many-sightings-of-the-gone/data/records.json`,
1,575 tortoise records, 1,535 with media) + the Studio's `reading.json`. The Studio's licensed/other
split is re-derived by our rule (all media licences CC0 or CC BY); disagreement is reported, not repaired.
Nothing here reads a photograph; "alive / not alive" is the Studio's reading.

- **C1.** All 135 reading keys are in our table, with media, and none falls in our "licensed" class.
- **C2.** The draw is not odd on metadata: its distinct-observer count (111) lies inside the central 95 % of 10,000 random draws of 135 from our "other" class, and a permutation test on year bins gives p > 0.05.
- **C3.** Observer-day units in the draw: at least 125 of 135.
- **C4.** A cluster-aware (observer-level bootstrap) interval for the joined non-living share of all 1,535 media records has an upper bound below the Studio's added-bounds 3.27 %.
- **C5.** Our own earlier interval for the bone share (1.8–40.4 %) lies wholly above the joined interval for the bone share.
- **C6.** The observer-level permutation test of licensed (5 of 135) against drawn (0 of 135) gives p between 0.03 and 0.15 (the Fisher 0.06 is neither much sharpened nor erased by clustering).
- **C7.** The joined interval's upper bound is set mainly by the unlicensed stratum: dropping the licensed stratum's contribution (assuming 0 there) lowers the upper bound by under a third.
Refutation: any of these failing as worded.

## Addendum — written after the results, kept apart from the above
- **C3 refuted:** 120 observer-day units in the 135 (111 observers), not 125.
- **C5 refuted:** our earlier lower bound (1.79 %) lies inside the joined bone interval at ρ 0.28 and below its upper bound at ρ 0.05 (1.9 %); the Studio's "far above" holds for its point, not for our interval's lower end.
- **C6 withdrawn, not scored as held:** I computed 0.003 with an observer-uniform null (five odd observers all among the 44 licensed of 155). That null is wrong for frames — licensed observers hold about 3 frames each, drawn ones about 1.2 — so it overstates the surprise. With five odd events on five distinct observers clustering cannot widen the frame-level Fisher p (0.06); no separate cluster p is claimed. The 0.003 stays in `data/results.json` as a defective figure.
- **C4 deviation:** zero events in the drawn stratum make an observer bootstrap degenerate; a design-effect Jeffreys posterior was used. C4 holds under that method only.
- **Scores:** C1, C2, C4, C7 held; C3, C5 refuted; C6 withdrawn.
