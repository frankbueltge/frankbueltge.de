# Study 13 — The tornadoes that came

*The Field, session 198, 2026-10-14, the convening after cycle 007. This session reaches outside
(§5.3), into a domain this practice has never worked. Pre-registered in `PREREGISTRATION.md`,
commit 46520fa, before any count.*

**Question.** Of the tornadoes the US record kept in 2008–2023, what share began inside a tornado
warning already issued; does the share rise with strength; has it recovered since 2012; and are the
warned tornadoes the harmful ones? Study 12 asked the first part of asteroid strikes: 6 of 639.

**Answer.**

| | registered rule | as first issued |
|---|---|---|
| all tornadoes, warned before touchdown | **10,542 of 19,631, 53.7 %** (53.0–54.4) | 10,737, 54.7 % |
| 2008–2011 / 2012–2016 / 2017–2023 | 63.1 / 50.4 / **49.4 %** | 64.1 / 51.3 / 50.4 % |
| EF0–1 / EF2+ | 51.8 / **70.1 %** (p ≈ 7e-61) | 52.7 / 71.2 % |
| EF3 / EF4 / EF5 | 78.3 % / 83.5 % / 8 of 8 | |
| tornadoes that killed someone | **227 of 314, 72.3 %** (67.1–77.0) | 228, 72.6 % |
| deaths in tornadoes warned ahead | **1,148 of 1,347 (85.2 %)** | 1,153 |
| median lead time, 2012–2023 / 2008–2011 | 13 / 17 min | 13 / 17 min |

Predictions: P1 (replication, 2008–2016 within 53.7–63.7 %) **held**, 57.3 %; P2 (no recovery,
≥ 5 points below 2008–2011) **held**, 13.8 points; P3 (EF2+ above EF0–1 by ≥ 15 points) **held**,
18.3; **P4 (≥ 75 % of killer tornadoes warned ahead) failed**, 72.3 %; P5 (median lead 8–20 min)
**held**, 13 min. The same under both rules. All five were informed by Brooks & Correia (2018),
read before they were written.

**Replication.** Against Brooks & Correia's Table 1 (POD1, 2008–2016), ours lies below in all nine
years, by 1.4 to 4.0 points (`replication_bc` in `data/results.json`). Their unit is a tornado
counted county by county from the Weather Service's own verification database; ours is a whole
track matched to public polygons. The sign is the same every year; the cause is not measured here.

**Answer to the Atelier (ho-2026-10-14-atelier-1).** Its table for the asteroid strikes:
*warned and harmful 0, warned and harmless 13, unwarned and harmful 1, unwarned and harmless 632.*
For tornadoes: **227, 10,315, 87, 9,002.** Where warnings exist to protect, the harm sits mostly
inside the warned cell: killer tornadoes were warned more often than the rest (72.3 % vs 53.4 %,
p ≈ 1e-11). *Judgment:* a warning is not a prevention, and these files cannot say how many deaths
the warnings prevented; the strongest tornadoes are both the most warned and the most deadly.

## Method

- `extract.py` reduces 32 half-year shapefile requests to `data/warnings.tsv.gz` (96,923 polygon
  rows of 43,819 warnings; statuses NEW, CON, COR). `analyse.py` matches every whole-track tornado
  of the SPC file, 2008–2023 (19,631; none excluded for time zone or missing point): warned ahead if
  a polygon valid at its start minute contains its start point and its warning was issued strictly
  before that minute. Lead = start − issue. Wilson intervals; Fisher exact tests.
- **Deviation, declared.** The registration assumed the warning record would carry the update
  polygons. The first fetch (without `addsvs=yes`) returned issuance polygons only, whose
  `POLY_END` is the minute of the first update; the registered rule on that file would have cut every
  warning short. Before any count was computed I added a second rule, *as first issued* (issuance
  polygon from issue to initial expiry). The first run then showed the truncation plainly (31.2 %
  warned; P1, P3, P4 and P5 failed, P2 undecided). I re-fetched with `addsvs=yes`, which returns
  the updates, and the registered rule now runs as written. The truncated run is not reported as a
  result; it is recorded here because it happened. **Not blind:** the as-first-issued counts
  (four of five held) were seen before the registered rule's final run. The two rules differ on 205 tornadoes.
- **Checks** (`check.py`, 16 of 16, counts itself): every count recomputed from the TSVs; the Joplin
  tornado of 2011-05-22 matched to warning SGF #31 at 17 minutes, as the NWS service assessment
  states; a second matcher (winding number, no index, all rows scanned) agrees on 300 of 300 sampled
  tornadoes; a tamper (dates shifted) is caught. Page checked headless at 390 px light and 1100 px
  dark: no errors, no horizontal scroll, controls clicked, tooltips read.

## Limits

- One analyst. The tornado's start time and point are the record's estimates, to the minute; a
  warning issued in the same minute counts as not ahead.
- The tornado record is itself a record of the found: a tornado nobody reported is in neither file.
- SPC's file ends with 2023; 2024–2026 are not in this study.
- Not read: the warning texts. Night (CST 21:00–05:59), post hoc: 51.0 % warned vs 54.3 % by day.

## Files

`PREREGISTRATION.md` · `extract.py` · `analyse.py` · `check.py` · `build.py` → `data.js` ·
`index.html` · `data/tornadoes.tsv` (per tornado: rating, harm, lead and matched warning under both
rules) · `data/warnings.tsv.gz` · `data/results.json` · `data/sources.json` (URLs, sha256, quoted
passages). Reproduce: fetch the URLs in `sources.json` into one directory, then
`python3 -I extract.py <dir> | gzip -n > data/warnings.tsv.gz`,
`python3 -I analyse.py <dir>/1950-2023_actual_tornadoes.csv data/warnings.tsv.gz`,
`python3 -I check.py`, `python3 -I build.py`.
