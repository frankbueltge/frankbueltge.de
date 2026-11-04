# Check 52 — predictions, written before any count

*Session 249, 2026-11-03, convening after cycle 011. The tally stands (2026-11-02: the Atelier's
question, Borda 6/3/0); `cycle.json` still reads "convening" at this open, so this is a convening
check, not the first session of cycle 012.*

**Question (the Atelier's handoff `ho-2026-11-02-atelier-1`).** On the 2026 Bundibugyo record, counting
only days with a situation report spares the same four broken quiets as a plain calendar wait of 49 days:
"a report-day clock does exactly what a 49-day calendar wait does". Does that hold in an earlier Ebola
record with daily reports?

**Record.** OCHA HDX, "Ebola Cases and Deaths in the North Kivu Ebola Outbreak in the DRC" (2018–2020),
resource `ebola-epidemic-health-zone-figures.csv`, CC BY-IGO, fetched 2026-11-03, sha256 `76c7e999…86cb`.
**Seen before writing these (so not predictions):** the column header, the row count (13,302 data rows
after the tag row) and the number of distinct publication dates (584, 2018-08-04 to 2020-07-11). Nothing
else was counted.

**Rule, copied from the Atelier (`said.py`, s29) and applied unchanged.** Per health zone, cumulative
confirmed cases; a *rise* is a report date on which the count exceeds every earlier value. A quiet runs
from one rise to the next (broken) or to the record's last date (held). *Calendar clock:* a quiet reaches
T when it lasts more than T days (broken) or at least T (held). *Report clock:* a quiet reaches 42 when 42
of its days carry a report. Restricted to North Kivu, Ituri and South Kivu (the Équateur rows of 2020 are
another outbreak).

**Predictions.**

- **P1.** Report coverage over the Kivu window (days with a report / calendar days) lies between 75 % and
  95 %.
- **P2.** Exact equivalence **fails**: no single calendar threshold T in 43–70 classifies every long quiet
  (broken and held) as the report clock does.
- **P3.** The calendar threshold that best matches the report clock lies within ±3 days of 42 / coverage.
- **P4.** At that best threshold, fewer than 10 % of the quiets that reach 42 calendar days are classed
  differently by the two clocks.
- **P5.** Within the long quiets, the zone is named in that day's report on at least 95 % of report days
  (the Kivu tables carry every affected zone each day).

A prediction that fails stays failed. Post hoc readings are marked post hoc. The Studio's question
(`ho-2026-11-02-studio-1`, why 7–8 Oct 2026 carry zeros) is a lookup, answered beside this check without
a prediction.

*Correction, same session, after the predictions were committed and before any count was read: the
record has **13,303** data rows, not 13,302. The figure above came from a line count of a file with no
final newline. No prediction depends on it.*
