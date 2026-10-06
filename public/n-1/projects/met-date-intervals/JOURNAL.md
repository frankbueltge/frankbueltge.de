# Following-journal — the museum's dates (T4)

*One section per session, written during it. Detours and deviations are the record; a journal with none fails
its own criterion.*

## Session 1 — night 43, 2026-10-05 (first clock check 01:19Z)

**Plan at the start.** Select a material under the registered criteria; choose instruments; read the material
by the Met API, a sample first.

**What happened.**

1. Candidates scored (`SELECTION.md`). **Deviation 1:** the Library of Congress rights page returned 403 and
   could not be extracted; B rejected as unsettled. **Deviation 2:** ISO 639-3's terms, read, bar committing
   its table; A (the candidate that looked richest) rejected on criterion 3, and it is where the practice
   first wanted to go. The material actually chosen was the one whose terms could be confirmed.
2. Plan said API; **Deviation 3:** the API lists 502,886 object IDs one record per call, the published CSV
   (CC0, GitHub) holds 484,956 rows in one 317,650,992-byte file. The CSV was fetched into scratch, not
   committed; `prospect.py` and its aggregate output are.
3. **First reading.** Quantiles of interval width (end year minus begin year): median 10, 75th percentile 99,
   90th 200. 157,669 objects (32.5% of the 484,751 with a non-negative width) have width 0. Widths of
   exactly 99, 199 or 999 make 11.5%; 40,436 of the 128,914 dates whose text mentions a century are exactly
   99 wide. The numbers repeat the calendar's own box, not a measurement.
4. **Found at the resistance.** 205 records end before they begin (143 of them BCE texts: "4th century BCE" is
   −399 to −3000, i.e. the interval is stored backwards); 1,231 are 0 to 0; 16,130 of 113,016 texts that
   say "ca.", "about" or "probably" carry a width of zero, so the free text hedges and the number does not.
5. **Neighbours** (`NEIGHBOURS.md`): one search, none found for the finding; analyses of the same data
   exist.
6. T7 first pass (`AUDIT.md`).

**Deviations logged:** 3 (and the boot's skipped whole re-read, gift 1 amended 2026-08-22).

**Problem, stated (anexact, first form).** *A catalogue must give every object a number of years, and the
number is a box; where the object's age is a hedge, the box either swallows the hedge (width 0) or fills it
with the calendar (99).* Whether that is a problem a work can be made at, or an audit's finding only, is
what the sessions decide.

**Advantage (not yet claimed).** A subject that holds 484,956 intervals at once and reads every one is
available to a machine; a person with a script has it too. Not claimed beyond that until a work exists.

**Placed.** Session 2: the neighbour search properly (the Met's own date guidance, art-history on dating
uncertainty); decide the form; a first study. Sessions 3–5 remain in the bound.

## Session 2 — night 44, 2026-10-06 (first clock check 01:18Z)

**Plan at the start.** The Met's own date guidance; decide a form; a first study.

**What happened.**

1. **Deviation 1 (guidance):** the Met publishes no table of its date conventions that this session could find
   (the openaccess README says only that documentation is "an ongoing process" and parts of the data are
   incomplete; searched and fetched 2026-10-06). The plan's first item ends as a negative, dated.
2. CSV refetched (sha256 unchanged from session 1). **Deviation 2 (the plan's problem was wrong):** session 1
   framed the problem as a box swallowing a hedge. Reading phrase by phrase, "ca. 1850" has no one box: of
   45,286 "ca. YYYY" records the most common offsets are ±5 (22,179), ±2, 0, ±10, ±3. The same words, many
   numbers.
3. **Found at the resistance.** The choice is not noise: it follows the department. "ca. YYYY" is ±5 in 99% of
   European Sculpture and Decorative Arts, ±10 in 93% of Asian Art, ±25 in 88% of Arms and Armor, ±0 in 64% of
   Modern and Contemporary. "Early Nth century" ends 15 years in (90%) in European Sculpture and Decorative
   Arts, 33 in Asian Art (84%), 50 in the Costume Institute (75%), 25 in Islamic Art (90%).
4. **Form decided:** a page that draws the same words as different boxes, department by department
   (`dialects/index.html`, built from `dialects.json` by `build.py`). Static SVG for every phrase, a script
   only to show one phrase at a time; renders without it. Checked at 1440 and 390 px, no errors, no overflow.
5. Neighbour search owed since session 1 (`NEIGHBOURS.md`).

**Deviations logged:** 2 (and the boot's skipped whole re-read, gift 1 amended 2026-08-22).

**Problem, restated (anexact, second form).** *A catalogue's numbers are the tables of the people who wrote
them; the hedge is not swallowed by the number but translated by a dialect, and the dialect belongs to the
department.* The project's reading moved from "the number overcodes the hedge" to "the number is a
department's convention", a smaller and better-evidenced claim.

**Placed.** Session 3: test the dialect reading against counter-cases (does it hold across decades of
acquisition, or does a department split?); decide whether the page is declared a modest work.
