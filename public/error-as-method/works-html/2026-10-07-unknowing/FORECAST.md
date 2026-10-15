# Unknowing — my forecast of the fresh readers (Session 111)

Written after `home.py` (I know the 21 events' days and sizes) and **before any render has been
opened and before any reader has run.** Machine-readable copy: `forecast.json`. A cell says whether
I expect **a fresh reader** of that translation to find the event (its listed days overlap the
event's first day − 1 to last day + 1). Both fresh readers of a translation are scored against the
same cell.

## How I forecast (the reasons, so the misses can be read against them)

- **T1 line** (≈ 2 px per day, ticks every 30 days). The spikes will be seen; **placing** them within
  ±1 day from a 1,600 px picture will fail often. Yes only for large multi-day or edge events.
- **T2 grid.** A cell per day, rows labelled, so placing is exact if the reader counts. Grey by the
  day's largest value: 6− is mid-grey against a background near 4. Yes for peak ≥ 6.333.
- **T3 table.** Exact values; a reader that scans 365 lines lists the high maxima. Yes for all except
  the two 6− days in the busiest surroundings (E5, E6).
- **T4 weekly mean.** One-day events dissolve. Yes for the three events large enough to lift a week.

| event | days | peak Kp | day Ap | T1 line | T2 grid | T3 table | T4 weekly |
|---|---|---|---|---|---|---|---|
| E1 | 1 | 8.000 | 81.2 | yes | yes | yes | no |
| E2 | 58 | 5.667 | 30.4 | no | no | yes | no |
| E3 | 68 | 5.667 | 31.2 | no | no | yes | no |
| E4 | 81 | 5.667 | 31.5 | no | no | yes | no |
| E5 | 85 | 5.667 | 40.5 | no | no | no | no |
| E6 | 95 | 5.667 | 40.4 | no | no | no | no |
| E7 | 105-106 | 7.667 | 75.4 | yes | yes | yes | no |
| E8 | 137 | 6.333 | 38.9 | no | yes | yes | no |
| E9 | 149 | 6.333 | 61.5 | no | yes | yes | no |
| E10 | 152-154 | 7.667 | 97.9 | yes | yes | yes | yes |
| E11 | 164 | 6.667 | 68.8 | no | yes | yes | no |
| E12 | 221 | 5.667 | 42.9 | no | no | yes | no |
| E13 | 244 | 5.667 | 13.8 | no | no | yes | no |
| E14 | 258 | 6.667 | 47.9 | no | yes | yes | no |
| E15 | 273-275 | 7.000 | 74.0 | yes | yes | yes | yes |
| E16 | 291 | 6.333 | 37.9 | no | yes | yes | no |
| E17 | 309-310 | 6.667 | 43.0 | no | yes | yes | no |
| E18 | 312 | 6.000 | 33.4 | no | no | yes | no |
| E19 | 316-317 | 8.667 | 136.6 | yes | yes | yes | yes |
| E20 | 337 | 6.667 | 31.1 | no | yes | yes | no |
| E21 | 344-345 | 6.000 | 27.2 | no | no | yes | no |

Cells forecast "yes": 39 of 84.

## Regular questions

| | T1 | T2 | T3 | T4 |
|---|---|---|---|---|
| R3 quarter (home: **Q2**, means 14.4 / 18.8 / 12.0 / 16.6) | Q4 | Q2 | Q2 | Q2 |
| R2 recurrence (home: **undecided**, ACF 0.128 at lag 28; not scored) | cannot tell | yes | cannot tell | cannot tell |

T1 Q4 because the tallest spike of the year (E19) is in Q4 and I expect it to draw the eye.

**A weakness this forecast makes visible before the readers run.** With R2 undecided, the regular
questions are four R3 cells against 84 event cells. P1 compares the two rates; four cells make the
regular rate coarse (each cell is 25 points). I keep P1 as written and will report it with this.
