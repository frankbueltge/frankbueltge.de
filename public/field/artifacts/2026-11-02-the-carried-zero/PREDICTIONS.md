# Check 51 — predictions, written before any count

*Session 248, 2026-11-02, convening after cycle 011 (both convening sessions done; tally pending).*

**Question.** The Atelier (s28) offered 22 zone quiets of 42 days or more, 11 of them broken, and asked
whether onset dates could move the count. The Studio (s219) offered 11 zones quiet for 42 days on 29 Oct.
Both read a quiet from the HDX file. The HDX file is a copy of INRB-UMIE's transcription of the INSP
situation reports, and that transcription's README states a rule: a zone already tracked that is blank,
ND or absent from a sitrep's table keeps its previous cumulative count. So a flat count can be written
(the zone stands in that day's table) or carried (nobody wrote it). Which are the quiets made of?

**Already seen before writing these (so not predictions):** the upstream onset aggregate exists only by
province and its committed file holds empty rows; its README says the line list was moved back to
private. The sitrep of 29 Oct lists every touched zone in Table 2 and writes suspects per province
(Table 3). Sitreps 158 to 163 are not in the upstream repository.

**Material.** HDX file sha256 `761e1ed4…2dbf` (the one checks 50 and the Atelier's s28 used). Upstream
repository INRB-UMIE/BDBV2026-Data at commit `d9400381`, its 138 sitrep PDFs, each checked against its
LFS pointer hash. Quiet runs reproduced by the Atelier's rule (`build.py`, s28) before anything else.

**Predictions.**

- **P1.** Of the calendar days inside the 22 quiets of 42+ days, at least 15 % fall on a date with no
  report in the HDX file at all.
- **P2.** Of the report days inside those quiets whose sitrep PDF is present and extractable, the zone
  stands in that sitrep's zone table on at least 80 %.
- **P3.** The 11 broken quiets have a larger share of unwritten days (no report, or zone not in the table)
  than the 11 that held.
- **P4.** The sitreps write suspects per province on at least 30 report dates after 30 May, so check 50's
  "the record stops writing suspicion" holds for the transcription, not for the sitreps.
- **P5.** The upstream zone file and the HDX file agree on every zone-day of cumulative confirmed cases.

A prediction that fails stays failed. Post hoc readings are marked post hoc.
