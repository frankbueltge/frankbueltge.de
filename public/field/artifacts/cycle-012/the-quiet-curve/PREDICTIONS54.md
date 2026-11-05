# Study 54 — predictions, written before any count

*Session 251, 2026-11-05. Cycle 012, second session of* The Quiet Curve. *State 2.*

**The study's question.** Of the confirmed Ebola cases the 2026 count records, how many did
surveillance first meet dead, in the community? And are the cases that end a long quiet met dead more
often than ordinary cases are?

**Why it is asked.** Study 53 found that only 3 of 105 breaks after three quiet weeks had no visible
source in the province, so on counts alone an import and an unseen local chain look the same. A
confirmed *community death* (a body swabbed positive outside a treatment centre) is a case the
surveillance did not see alive: the chain that produced it ran unseen until someone died of it. INSP's
daily situation reports state this count every day, nationally and by health zone ("Décès
communautaires (Swab+)", Tableau 2). That turns the unseen share from a bound into a measured figure.

**Records.** INSP, *Rapport de situation* SitRep MVE-BDBV, the 141 PDFs in INRB-UMIE/BDBV2026-Data
(commit `a5ee90c0`, 2026-11-04), 74 of them from the repository's large-file store, each matching its
pointer's sha256. Breaks: study 53's `results53.json`, `breaks21`, the 34 dated in 2026 (HDX dates).

**Seen before writing these (so not predictions).** SitRep 171 (1 Nov): 65 new confirmed, 20 community
deaths among them (11 North Kivu, 8 Ituri, 1 Haut-Uélé); contact follow-up 84.0 %, the day before
86.6 %. That the zone table carries the column. Nothing else has been counted.

**Definitions, fixed now.** *Day's share met dead:* community deaths reported for the day divided by
new confirmed cases for the day, both from the report's highlights paragraph ("FAITS SAILLANTS");
pooled share = sum over sum. *Zone case-day:* a zone row of the case table with at least one new
confirmed case. *Met dead:* that row shows at least one community death. *A break met dead:* in the
report whose reporting date equals the break's date, the break's zone row shows at least one community
death. Baseline: the share of all zone case-days met dead in the reports that are parsed. Intervals:
Wilson 95 % for shares; Spearman's ρ for the follow-up relation.

**Predictions.**

- **P7 (instrument).** At least 90 % of the 34 breaks of 2026 find their zone with at least one new
  confirmed case in the report of the same date. Below that, the date join is wrong and P9–P10 are
  reported as uninformative.
- **P8 (H4).** Pooled over all parsed reports, between 15 % and 40 % of new confirmed cases are
  community deaths.
- **P9 (H5).** The share of the 34 breaks met dead is at least 1.5 times the baseline share of zone
  case-days met dead.
- **P10 (H5).** Of the breaks that end a quiet of at least 42 days, at least a third are met dead.
- **P11 (H6).** Across reports, the day's share met dead falls as contact follow-up rises: Spearman's
  ρ between the two is at most −0.20.

A prediction that fails stays failed. Post hoc readings are marked post hoc.
