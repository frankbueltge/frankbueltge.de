# Session 19 — written before any labelled blast was fetched

Committed alone, before `derive.py` or `analysis.py` existed, before the catalogue's
non-earthquake events had been read by this practice, and before any origin time had been read
on the civil clock.

**The question left open on 09-28.** Above each year's floor, the Berkeley earthquake list holds
*more* events by day than by night (1.18 at offset +0.4), strongest on weekdays and at shallow
depth. I called that a pattern that looks like human-made events inside an earthquake-only
query, not an identification. On 09-28 the Studio wove the catalogue's own *labelled* blasts and
found them piled at 11 o'clock on weekdays. So the record already holds a signature of the thing
suspected: a labelled population with a clock of its own. Tonight asks whether the unexplained
daytime excess has that clock, and whether it matters to the slope.

**Why the civil clock, not the sun.** Blasting is scheduled by the clock on the wall, which
jumps an hour twice a year; session 18's solar hour smears that schedule over two hours. Tonight
every hour is civil local time, America/Los_Angeles, daylight saving included.

**Definitions, fixed now.**

- Record: ANSS ComCat, 40 km around BK.BKS, 1974–2025, **all event types**, one request per
  year. Its earthquakes must equal session 18's list as a multiset of (year, magnitude) before
  anything is kept. Every other type is the *labelled* record.
- Floors: session 17's per-year maximum-curvature floors on the earthquake list, unchanged.
  "Above the floor" = offset +0.0. Estimator for b: Aki–Utsu, bin correction 0.005, pooled.
- Blast window **W**: the smallest set of weekday (Mon–Fri) civil hours holding at least 80 % of
  the weekday labelled events, hours ranked by their labelled count. Chosen from the labelled
  record alone, before the earthquake list is split by hour.
- Night baseline: the mean count per hour over weekday civil hours 22, 23, 0, 1, 2, 3, earthquakes
  above the floor. Excess of an hour = its count minus that mean.

Predicted:

1. **The shape.** Weekday earthquakes above the floor: the 11 o'clock hour holds more than 1.3
   times the night baseline. *Refuted if 1.3 or less.*
2. **The place.** Of the weekday daytime excess (hours 06–19 summed), at least half falls inside
   W. *Refuted if less than half, or if the excess is not positive.*
3. **The control.** On weekends, earthquakes above the floor in the hours of W hold between 0.85
   and 1.15 times the weekend night baseline (same six hours). *Refuted if outside.*
4. **The depth.** More than half of the excess inside W comes from events shallower than 3 km.
   *Refuted if half or less.*
5. **The slope.** Removing every weekday earthquake inside W from the list moves the climb
   b(+0.8) − b(+0.0) by less than 0.03. *Refuted if it moves by 0.03 or more.*

What would change the answer: if (1)–(4) hold and (5) holds, unlabelled blasts are in the list
and the slope does not care; the climb stays with the law or with incompleteness the clock cannot
hear. If (5) is refuted, part of the climb the Studio printed was quarrying.

Limits stated before the result: a match of clocks is not an identification of any single event;
no event will be re-examined. The count of suspects this yields is an estimate.
