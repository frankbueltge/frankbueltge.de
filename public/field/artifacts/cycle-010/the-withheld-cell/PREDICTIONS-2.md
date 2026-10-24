# Study 40 — the dominant firm. Predictions, fixed before the analysis

*Written 2026-10-24T23:05Z, session 230, before any figure below was computed. What had been seen at
that moment: everything study 39 reported (`PREDICTIONS.md`, `data/results.json`), and the structure
of a second table, Eurostat `sbs_sc_ovw` (enterprise counts by employment size class, 2021): its
dimensions, its 343 NACE codes (sections, divisions and groups; no 4-digit classes) and a pooled count
of its status flags. Nothing broken down by country, code or size class.*

**Question.** Study 39 found that withholding follows the number of firms (94 % withheld at 1–2
firms), yet Ireland, mid-sized, withholds the most (51.7 % at class level) and Cyprus, small, less
than Denmark. Eurostat's metadata names a second reason to withhold besides too few contributors:
one contributor too large to hide (the p% rule). Does the firm count explain the country ranking once
it is held fixed, and where it does not, is a dominant firm the better reading?

**Data.** `sbs_ovw_act` 2021 as in study 39 (same digest). `sbs_sc_ovw` 2021, `indic_sbs=ENT_NR`,
fetched by the dissemination API on 2026-10-24; digest in `data/results-2.json`.

**Units, fixed now.**
- Universe and cell states as in study 39: 27 member states, the 19 level indicators, `W` withheld,
  `P` published.
- **Expected withholding.** For each country × class cell whose ENT_NR is published, its expected
  number of withheld indicators is 19 × the pooled EU27 class-level rate in its firm-count bin (study
  39's eight bins: 1–2, 3–4, 5–9, 10–19, 20–49, 50–99, 100–999, 1,000+). Pooled over all 27, so every
  country is measured against the same curve.
- **Standardized ratio** of a country = observed withheld / expected withheld, over its classes with
  ENT_NR published. 1 means: withholds exactly what its firm counts predict.
- **Above the threshold**: cells with ENT_NR ≥ 20, where no minimum-contributor rule plausibly bites.
- **Large firms of a group** (3-digit NACE): the `sbs_sc_ovw` ENT_NR in size class GE250 (250 persons
  employed or more). Bands: 0, 1–2, 3 or more, and *withheld* (the count itself flagged `C`).
- **Group-level rate**: as study 39, at 3-digit level, from `sbs_ovw_act`.

**Predictions.**
- **P7, Ireland.** Ireland's standardized ratio is at least 2.0.
- **P8, Cyprus.** Cyprus's standardized ratio is at most 1.2.
- **P9, size was firm count.** Across the 27, the standardized ratio is not related to country size:
  Spearman ρ with the number of enterprises lies strictly between −0.3 and 0.3.
- **P10, the dominant firm.** Among country × group cells above the threshold (group ENT_NR ≥ 20,
  published), the withholding rate where the group has 1 or 2 enterprises of 250+ is at least 3 times
  the rate where it has none.
- **P11, Ireland's excess sits there.** Of Ireland's withheld country × group cells above the
  threshold whose GE250 band is known (not withheld), at least half fall in the 1–2 band.

**Uncertainty.** Standardized ratios: bootstrap over the country's classes (2,000 draws). ρ: bootstrap
over countries (2,000 draws). P10: Wilson intervals on the two rates, cells counted as their share of
19 (a stated limit: indicators of one cell are not independent).

**What would change the reading.** If Ireland's ratio is near 1, its rank is a firm-count artifact
(many thin classes) and the dominance reading is unneeded. If P10 fails while P7 holds, Ireland's
excess is not where the large firms are, and secondary suppression or a national threshold above
other states' is the next candidate; neither is tested here.
