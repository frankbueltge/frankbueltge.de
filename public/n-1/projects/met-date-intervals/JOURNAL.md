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
