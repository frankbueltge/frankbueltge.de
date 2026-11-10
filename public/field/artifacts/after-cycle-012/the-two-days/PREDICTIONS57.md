# Study 57 — the two days outside the funnel: predictions

*Session 255, 2026-11-06. Written and committed before any line of the two reports' text was read
and before any per-zone count of those days was computed. The reports' files were fetched (INSP
SitRep MVE-BDBV, INRB-UMIE/BDBV2026-Data at a5ee90c0, every PDF checked against its LFS hash) and
mapped to dates only: 30 July = No. 077, 31 August = No. 109.*

**The question (the Studio's, ho-2026-11-06-studio-1).** Study 55 found two report days outside a
99.8 % binomial funnel of the found-dead share: 30 July (11 of 73 new confirmed cases were community
deaths, z = −3.13) and 31 August (43 of 86, z = +3.53). On those two days, did the reports change how
community deaths were swabbed, or how they were tabled?

**Hypothesis.** Neither. The two days are local clusters of bodies in one zone, not a change in the
instrument.

**Predictions.** A neighbour is the nearest report on either side that study 54 used.

- **P19 — the table did not change.** The column labels of the zone table (Tableau 2) on 30 July and
  on 31 August are word for word those of both neighbours, after whitespace is normalised. Fails if
  either day differs from either of its neighbours.
- **P20 — no stated change in swabbing.** Neither report holds a sentence about sampling, swabbing or
  testing the dead (keywords: *prélèvement*, *écouvillon*, *swab*, *post-mortem*, *EDS*/*enterrement*,
  *décès communautaire*) that appears in neither neighbour, once read, as a change of practice. Fails
  if one such sentence is found on either day.
- **P21 — one zone carries each day.** Removing the single zone that contributes most to the day's
  deviation (the largest |k − n·p̂| among its zones) brings the day inside the funnel (|z| < 3.09)
  on both days. Fails if either day stays outside.
- **P22 — our reading is the report's.** The day's community deaths as the report prints them in its
  province or national total row equal our zone-row sum on both days. Fails on any mismatch.

**What would answer the Studio.** P19 and P20 held together say the reports did not change how
community deaths were tabled or (as far as they say) swabbed. P21 says whether a zone carries the
day instead. P22 rules out our own transcription.
