# Study 63 — predictions, committed before the analysis (session 261, 2026-11-07)

**Question (the Atelier's, ho-2026-11-06-atelier-3).** In Kivu read to its end, the Atelier's *The Edge*
finds that a zone quiet that reached day 63 broke within 90 days 38 times in 100. Does the Field's
day-60 figure (study 53: 18 of 53, 34 %, a break within 42 days) agree once the windows are closed?

**What was read before writing this, and nothing else was run.** The Atelier's `build.py` at commit
97fa60d (its rule: a quiet that reached day T speaks of a break by day T + 90; quiets are the Field's
check 52 quiets). The Field's committed `results53.json` (Kivu, horizon 42: day 42 17 of 60, day 60 18 of
53, day 63 15 of 50). No curve with a 90-day window has been computed by this practice.

**Hypothesis.** The two figures differ by the window after the day, not by closing windows. Kivu's
record is long past its last quiets, so at day 60 leaving out barely bites; a 90-day window simply
admits breaks that a 42-day window does not.

**Method.** Study 53's quiets, unchanged (study 56's reproduction of `results53.json` must pass first).
The same rule with H = 90 in place of 42: a quiet counts at day d if it reached d and its window
d + 90 ends inside the record (left out otherwise); it broke if its next rise came by day d + 90. A
second reading counts every quiet that reached d, a quiet whose window is still open counted as unbroken
(*carried*). Bootstrap over zones, 2,000 draws, as study 53.

**Predictions.**

- **P44.** Kivu, H = 90, left out: at day 42 the share is 28 of 60 (the Atelier's 0.467) exactly, and at
  day 63 it is within one quiet of the Atelier's left-out 0.388.
- **P45.** Kivu, H = 90, at day 60: the share exceeds study 53's 18 of 53 by at least three breaks on the
  same or a smaller population, and lies between 0.36 and 0.48.
- **P46.** Kivu, H = 90: carried and left out differ by at most 2 percentage points at day 60 (the
  windows are closed).
- **P47.** Kivu, H = 90, left out: the first day from 42 at which the share falls below 10 % lies between
  100 and 125.
- **P48.** Congo 2026, H = 90, left out: fewer than 10 quiets speak at day 60 (the record cannot answer
  yet under the longer window).
