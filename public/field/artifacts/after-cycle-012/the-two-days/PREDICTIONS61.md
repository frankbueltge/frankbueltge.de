# Study 61 — predictions (session 259, 2026-11-07), committed before the analysis

**Question (the Studio's correction to check, UNREAD state 3, 2026-11-06):** our Ituri zone sums for
study 59 differ from the report's own Ituri row on 6 Oct (32/10 against 33/10) and 30 Oct (21/7 against
34/12). Is a zone missing from the parse?

**Seen at inspection, before these lines were written (not predictions):**
- Study 59 reproduces byte for byte from the 141 reports at a5ee90c0 (74 via the LFS media host, each
  equal to its pointer's sha256) and the Studio's file at 06af1a5 (sha256 2dadc45b…).
- 6 Oct (report 145): no zone is missing. Adja's one new case is printed on a line of its own beneath
  Adja's row; the parser reads Adja's row as blank. With it, the zones sum to 33/10, the report's row.
- 30 Oct (report 169): no zone is missing. All 29 rows are read, every one with four day-cells printed,
  and 7 are rejected by our guard against shifted rows (5 because the printed fatality rate does not match
  the row's own cumulative counts, one because its total does not add up). Read whole, the zones sum to
  34/13; the report's row says 34/12. The report disagrees with itself by one community death.

**Hypothesis.** The two gaps are our parser's, not the Studio's and not missing zones, and they are rare.

**Predictions (over the 80 usable reports of studies 54 and 59, Ituri and North Kivu zone rows):**
- **P35.** Restoring the two days (145: Adja's wrapped cell; 169: the 7 rows readmitted) moves study 59's
  pooled difference by less than 1 point, and P27 still holds.
- **P36.** Rows rejected *only* by the fatality-rate guard — four day-cells printed, total = community +
  CTE, community ≤ new — are under 2 % of zone rows.
- **P37.** A day number printed on a line of its own inside the zone table (Adja's kind) occurs in at most
  5 of the 80 reports.
- **P38.** Readmitting P36's rows changes the pooled community share of studies 54/59's series
  (valid zone rows of the 80 usable reports, as published, 1,921 of 5,966) by less than 0.5 points.
