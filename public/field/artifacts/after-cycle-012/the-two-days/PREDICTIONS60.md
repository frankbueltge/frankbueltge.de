# Study 60 — the day North Kivu stops writing "sans échec": predictions

*Session 258, 2026-11-06. Written and committed before any report's PDF metadata was read, before any
section of any report other than the file list was read, and before the Studio's North Kivu rows were
joined to anything. Seen before writing, and therefore **not** predicted: the Studio's quoted North Kivu
sentences for reports 156–157 and 164–174 (while checking its file's shape), and the archive's file list.*

**The question (the Studio's, offered 2026-11-06 with UNREAD, state 2).** North Kivu's line on the dead
writes "sans échec" (no failure) for the last time on 18 October (report 157); from 26 October it leaves
calls unaccounted. Does a change in the reports' format coincide with that date?

**A fact found before the predictions.** At INRB-UMIE/BDBV2026-Data@338e5780 no PDF exists for reports
158–163 (19–24 October) or 172 (2 November). The "last" day is the last day observed before a hole of
six reports. Whatever changed, it changed somewhere inside that hole, and this study can only bound it.

**Material.** INSP SitRep MVE-BDBV, reports 108–174 present in the archive (`pdftotext -layout`,
`pdfinfo`; no PDF or text committed). The Studio's file `etudes/unread/data.json` (`nk`), at the commit
named in results60.json.

**Hypothesis.** The change is the North Kivu writer's, not the document's: the report as a whole keeps
its make and its outline across the hole; only North Kivu's sentence changes its template.

**Predictions.**
- **P32 — the document's make holds.** `pdfinfo` Creator and Producer of reports 164 and 165 equal those
  of report 157. Fails if either differs in either.
- **P33 — the outline holds.** The ordered list of numbered section headings (lines beginning with a
  numbering such as `1.4.1`) of report 165 equals that of report 157 after whitespace is normalised, or
  differs from it by no more than the median difference between consecutive present reports 140–157
  (difference = size of the symmetric difference of the two heading sets). Fails otherwise.
- **P34 — Ituri's sentence keeps its template.** Classify each province's line on the dead by its
  opening template: **A** opens "Sur N alertes", **B** opens "N EDS réalisé(e)s sur N alertes", **C**
  any other. Ituri's class in report 165 equals its class in report 157. Fails otherwise.
- **P35 — North Kivu's sentence changes template across the hole.** North Kivu's class is A on at
  least 80 % of present reports 145–157 that carry a line, and A on none of 165–174. (Partly seen: see
  above. Stated so the measurement is fixed, not as a test.)
- **P36 — nowhere else after the hole.** The string "sans échec" (any accent or spacing, "aucun"
  allowed between) occurs in no present report 164–174, in any province.
- **P37 — the hole is the archive's alone.** The archive's own processed national table
  (`insp_sitrep__national_cumulative_confirmed_cases__daily.csv`) carries a row for at least one date
  19–24 October, i.e. its curators transcribed reports the raw folder does not hold. (Seen in part while
  locating the hole; stated so the reading is fixed.)

**What would answer the Studio.** P32 and P33 say whether the document changed; P34 and P35 whether the
sentence changed alone; P36 whether the phrase died everywhere. If P32–P34 hold, the answer is: no
change in the report's format is visible at the date; the change is North Kivu's sentence, and its day
lies somewhere in 19–25 October, unseen.
