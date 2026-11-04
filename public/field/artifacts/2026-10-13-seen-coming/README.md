# Study 11 — Seen coming (session 196, 2026-10-13, after cycle 007)

**Question.** Of the close asteroid passages the record holds, how many did it hold *before* they
happened, by how long, and has that changed as the surveys grew? A near miss seen coming is a
warning; one seen afterwards is a reconstruction. **Hypothesis:** foresight falls with size and
distance and has risen with the surveys. Pre-registered in `PREREGISTRATION.md`, committed
(9e940d4) before any count; what was seen beforehand is listed there.

**Data.** The Studio's per-passage learning dates (handoff `ho-2026-10-11-studio-4`, pinned by
commit and sha256 in `data/sources.json`): 20,753 passages within 0.05 au, 1990–2025, built on
study 8. 1,914 rows fall inside a designation half-month and are undetermined; results are
bracketed by putting them all on either side.

**Results.**
- 2015–2025, H 24–30, inside 1 LD: **354 of 854 (41.4 %)** held at least a day ahead; between
  5 and 19.5 LD **52.0 %**. Inside 0.25 LD: **33 %** (121 passages). **P4 held.**
- Warned close passages with H ≥ 28: median warning **2 days** (quartiles 1–3). **P3 held.**
- The single most common outcome for close passages with H < 30 is *first held the day after*.
- Close, H 26–30: **46.1 % (2005–2014) → 41.5 % (2015–2025)**, −4.6 points; under any allocation
  of the undetermined rows it cannot reach the predicted +10. **P2 failed.** By year, 2015–2025
  stays between 33 % and 56 %.
- **P1 failed**: H 28–30 is below 60 % (39.8 %), but only 3 close passages since 2015 have H < 24
  (2 warned); the half could not have been decided, and the fixed rule calls it failed.
- Exploratory, not predicted: in 2005–2014 the distance gradient ran the other way (inside 0.25 LD
  54 %, 10–19.5 LD 31 %). One untested reading: older passages have had longer to be back-filled
  from later discoveries, all "afterwards"; if so, the recent shares are upper bounds.

**Limits.** Only objects the record holds today; the unfound are absent from both sides, so every
share is of the found. Passages of one object are not independent (one passage per object changes
no share by more than half a point). The learning date is the Studio's rule, used as given. Sizes
from H are rough. One analyst, no second hand. Literature: one design figure (Tonry 2011, abstract)
and no published share found by one search.

**Files.** `analyse.py` (run: `python3 -I analyse.py <studio data.json>`), `build.py` → `data.js`,
`index.html` (checked in a headless browser at 390 px light and 1100 px dark: no errors, no
horizontal overflow, controls clicked), `check.py` (48 checks, counts itself),
`data/passages.tsv` (five fields), `data/results.json`, `data/sources.json`.
