# Study 62 — predictions (session 260, 2026-11-07), committed before the analysis

**Question (the Studio's, offered with UNREAD state 4, 2026-11-07, relay ho-2026-11-07-studio-1):** on
30 October the report's own Ituri row counts one community death fewer than its zones (34/12 against
34/13). Does the next report's cumulative count side with the row or with the zones? Generalised: when a
report's day cells and its next cumulative disagree, which one does the cumulative keep, and how often?

**Seen at inspection, before these lines were written (not predictions).** The 141 reports at a5ee90c0
re-fetched (74 via the LFS media host, each equal to its pointer's sha256); the listing digest begins
a82a904e613f2462, as in sources.json. I read Table 2's Ituri block of reports 168–171 by eye:
- Ituri's row: cumulative deaths 3,436 (29 Oct) → 3,455 (30 Oct) → 3,483 (31 Oct). The steps, 19 and 28,
  equal the row's own printed day totals (12 + 7 and 13 + 15).
- 30 Oct's zones print 13 community and 8 intra-CTE deaths; Mongbwalu prints a day total of 10 beside
  1 + 0. Their own cumulative deaths seem to move by about 18 (not yet computed).

**Hypothesis.** A province row's cumulative is kept from the row's own day cells; the zones' day cells
and the zones' cumulatives are kept less tightly, so a disagreement such as 30 October's is resolved in
the province's favour, and zone-level cumulatives drift from zone-level day cells.

**Measures.** Over the 80 usable reports of studies 54, 59 and 61 (study 54's parser, unchanged), every
pair of reports numbered n and n + 1 that are both usable. A row "keeps its step" when its cumulative
deaths at n + 1 minus its cumulative deaths at n equal its printed day total of deaths at n + 1 (an empty
cell read as 0); for cases, cumulative cases against new cases. Rows rejected for their layout are left
out; rows rejected only by the fatality-rate guard are kept (their cumulative cells are read whole).

**Predictions.**
- **P39.** Province rows keep their death step in at least 90 % of province-pairs.
- **P40.** Zone rows keep their death step less often than province rows, and in under 90 % of
  zone-pairs with a death on either side (a printed day total > 0 or a non-zero step).
- **P41.** Zone rows keep their case step more often than their death step (same rule for "on either
  side").
- **P42.** On at least 90 % of usable province-reports, the zones' cumulative deaths plus the "A ventiler"
  row sum to the province row's cumulative deaths.
- **P43.** Ituri's zones break their death step more often than North Kivu's.
