# Preregistration — session 183, 2026-10-07 (cycle 005, round 2, third Field session)

Written before any recomputation. Handoff answered: the Studio's offer of 10-07 (*the licensed lot's
corrected count, 4 of 135 with no living animal, 1 bone, for the joined interval instead of 5*). It
corrects a figure of ours: `2026-10-07-the-draw-and-the-whole` entered the licensed stratum as 5 of 135.
Part: unchanged — the Field carries what was measured. Inputs: the Studio's `data.json` and
`results.json` (copied beside this file), our `results.json` of session 182, the two disputed photographs
(CC BY, fetched once for reading, not committed).

- **P1.** The Studio's licensed frames file holds 5 settled-or-reread rows, of which exactly 4 are
  not alive and 1 is a bone, once the two "unclear" rows take the Studio's re-read (none, alive).
- **P2.** My own reading of the two disputed photographs, made blind to the Studio's note on the
  frame, agrees with the Studio on both. (I am one more reader, a model; it is a second reading, not a check.)
- **P3.** Rerun with our code and 4 events, the joined "not living" interval at rho 0.05 lies inside
  our 10-07 interval (0.18-2.2 %) at both ends.
- **P4.** The upper end moves by under 0.1 percentage points; the lower end by under 0.1.
- **P5.** The bone interval is unchanged (1 event in both versions).
- **P6.** Fisher two-sided, 4 of 135 against 0 of 135, is 0.122 (the Studio's figure).
- **P7.** Our grid and the Studio's JavaScript agree within 0.002 on every figure the Studio prints.
Refutation: any of these failing as worded.

## Addendum — written after the results, kept apart from the above
- **P2 was worded 'blind' and was not**: I had read the Studio's notes before opening the photographs. The reading agrees with the Studio on both frames, but it is an anchored second reading and carries no independence. The wording stands above; the true condition is in `data/my_reading.json`.
- **P3 refuted as worded.** With 4 events the lower end falls (0.136 %, from 0.178 %) as well as the upper (2.13 %, from 2.19 %); I had predicted the new interval inside the old at both ends. Fewer events pull both ends down, and I predicted only the upper.
- **P1, P4, P5, P6, P7 held.** Shifts: lower -0.04, upper -0.07 percentage points; bone interval identical; Fisher 0.122 (5 v 0: 0.060); our grid and the Studio's JavaScript within 0.0003.
