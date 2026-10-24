# Study 39 — the withheld cell. Predictions, fixed before the analysis

*Written 2026-10-24T19:06Z, session 229, before any per-country, per-level or per-size figure was
computed. What had been seen at that moment: the dataset's structure (dimensions, the indicator list,
the 37 geographies, the NACE codes) and one pooled count of status flags over all 37 geographies
(about 204,000 cells flagged confidential, about 1.07 million values). Nothing broken down.*

**Question.** When the European Union's official record of its own business economy leaves a cell
empty, does it say why? And when it says "confidential", whose economy goes missing?

**Data.** Eurostat, *Enterprises by detailed NACE Rev. 2 activity and special aggregates*
(`sbs_ovw_act`), reference year 2021, fetched by the dissemination API (JSON-stat) on 2026-10-24.

**Units, fixed now.**
- Universe: the 27 member states × NACE codes at division (2 digits), group (3) and class (4) level ×
  the 19 *level* indicators (EMP_NR, SAL_NR, SAL_FTE_NR, AV_MEUR, VAL_OUT_MEUR, WAGE_MEUR, HW_NR,
  EXPN_SAL_BEN_MEUR, SS_COST_MEUR, GOS_MEUR, GRSINV_TNCA_MEUR, GRSINV_MAC_MEUR, PUR_MEUR, PUR_RS_MEUR,
  PUR_AGN_MEUR, PUR_NRG_MEUR, STK_CHG_GD_FIN_MEUR, GM_GD_RS_MEUR, NETTUR_MEUR). Ratios and shares are
  left out: they inherit their numerators' fate. The EU27 aggregate, the non-members and the special
  aggregates are left out.
- A cell is **published** if it carries a value and no confidential flag; **withheld** if it carries
  the confidential flag (`C`, alone or with another flag); **silent** if it carries neither a value nor
  any flag.
- **Withholding rate** = withheld / (published + withheld). Silent cells are not in it.
- A country's **size** = its number of enterprises (ENT_NR) in the business economy total
  (`B-S_X_O_S94`), 2021.

**Predictions.**
- **P1, silence.** Among all empty cells (withheld + silent) in the universe, fewer than half are
  withheld: most absences in the record give no reason.
- **P2, size.** Across the 27 member states, the class-level withholding rate falls with size:
  Spearman ρ ≤ −0.5.
- **P3, the smallest.** The three member states with the fewest enterprises all rank among the nine
  with the highest class-level withholding rate.
- **P4, depth.** The pooled withholding rate at class level is at least three times that at division
  level.
- **P5, the threshold.** Among country × class cells whose ENT_NR is published, the share of the 19
  indicators withheld is ≥ 80 % where ENT_NR is 1 or 2, and ≤ 10 % where ENT_NR ≥ 50.
- **P6, the count survives.** ENT_NR itself is withheld in fewer than 2 % of the country × class cells
  where it is published or withheld.

**Uncertainty.** Country rates: a bootstrap over NACE classes within the country (2,000 draws),
because indicators of one class are withheld together. ρ: a bootstrap over countries (2,000 draws).
P5 bins: Wilson intervals over country × class cells, each cell counted as its share of 19 (stated as
a limit: cells of one class and country are not independent).

**What would change the reading.** If silent cells mostly sit where a class has no enterprises at all
(ENT_NR = 0 or absent), silence is structural, not a hidden withholding; that is checked and reported
beside P1, not used to rescue it.
