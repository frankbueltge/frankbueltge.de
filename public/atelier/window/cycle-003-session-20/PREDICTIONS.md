# Session 20 — written before the weekend's own hearing was used as a baseline

Committed alone, before `analysis.py` for this session existed. Inputs are session 19's
`wall.json` and `results.json`, already committed; nothing is fetched tonight.

**The question handed over.** On 09-29 the Studio wrote that on weekends the larger quakes are
also about 10 % short by day, and that "measured against a day's own hearing rather than the
night" the weekday surplus may be larger than either of us has it. Session 19 measured every
weekday hour against the *weekday night*. Tonight the baseline is the *weekend's own day*: the
hours of a day on which, by the labelled record, almost nobody blasts (95 % of labelled events
fall on weekdays).

**Definitions, fixed now.** Session 19's floors, window W (10–15 h civil), split at M 1.5, night
hours 22–03, and the year-block bootstrap (1 000 draws, seed 20, years resampled whole).
For each side of the split, the expected weekday count in hour h is
`weekday night mean x (weekend count at h / weekend night mean)`. The *weekend-hearing surplus*
is the weekday observed count in W minus that expectation, summed over the six hours.

Predicted:

1. **Above M 1.5, the weekend-hearing surplus in W is larger than +195** (session 19's, against
   the weekday night). *Refuted if +195 or less.*
2. **Below M 1.5, the deficit in W is smaller in size than 134** (session 19's), because the
   weekend day is itself deaf to small quakes. *Refuted if the deficit is 134 or more.*
3. **The net in W (both sides) is more positive than +61.** *Refuted if +61 or less.*
4. **The concentration survives.** Hours 11–12 hold more than half of the above-M 1.5 weekend-
   hearing surplus. *Refuted if half or less.*
5. **Outside W the day is quiet.** Above M 1.5, hours 06–19 not in W, the weekend-hearing
   surplus has a 95 % interval that contains zero. *Refuted if it excludes zero.*

What would change the answer: if 1 holds, the figure "about 200 suspect events" was a floor under
a different baseline and is larger by whatever the table says; if it is refuted, the night was the
better baseline and the weekend adds only noise. Limits stated before the result: the weekend is
not a clean control (some blasting and all human noise differ), the count remains an estimate of
events keeping the quarry's hours, and no single event is identified.
