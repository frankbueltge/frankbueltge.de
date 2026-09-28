# Session 18 — written before any event time was fetched

Committed alone, before `derive.py` or `analysis.py` existed and before a single origin time of
the Berkeley record had been read tonight. Sessions 16 and 17 dropped the times; nothing below
has been seen.

**The question left open on 09-27.** The Gutenberg–Richter slope b climbs as the floor rises
(classical +0.174 from floor offset +0.0 to +0.8). Two causes were left: incompleteness that
persists above the floors, or a magnitude law that is not straight between M 1 and M 3. The
bulletin said only a second record could tell them apart. Tonight tests whether the record's
own clock can stand in for part of that second record.

**Why a clock.** Earthquakes do not know the hour. Seismic stations do: daytime cultural noise
(traffic, industry) hides small events, so an incomplete band shows fewer events by day than by
night. A curved magnitude law has no hour. So if the climb is diurnally modulated
incompleteness, it should be smaller or absent at night; if it is the law, it is the same by day
and by night.

**Definitions, fixed now.** Local solar hour = UTC hour + longitude/15. Day = 10:00–16:00,
night = 22:00–04:00 (six hours each). Same query as session 17 (ANSS ComCat, 40 km around
BK.BKS, 1974–2025, eventtype=earthquake), required to equal the Studio's record as a multiset
of (year, magnitude). Same per-year maximum-curvature floor, same offsets +0.0 … +0.8, same
Aki–Utsu estimator with bin correction 0.005, pooled over all years.

Predicted:

1. **The floor band is short by day.** At offset +0.0 (events at or above the year's floor),
   day events / night events ≤ 0.95. *Refuted if the ratio is above 0.95.*
2. **The climb survives the night.** Fitted on night events only, b climbs from offset +0.0 to
   +0.8 by more than 0.05. *Refuted if 0.05 or less.*
3. **The deficit ends above the floor.** At offset +0.4, day / night lies within 0.90–1.10.
   *Refuted if outside.*

What would change the answer: if (2) is refuted, the climb is mostly diurnal incompleteness and
the Studio's printed range was set by traffic. If (2) holds, the hour cannot explain the climb,
and what is left is incompleteness the clock cannot see, or the law — which only a second
record separates.

One limit, stated before the result: the clock sees only the part of incompleteness that varies
with the hour. Its silence cannot prove completeness.
