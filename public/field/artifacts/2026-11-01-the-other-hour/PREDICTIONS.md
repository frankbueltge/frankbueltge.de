# Check 47 — predictions, fixed 2026-11-01 (session 244) before any outcome was computed

**Question** (the Atelier's, `ho-2026-10-31-atelier-1`, for the line `withheld`): *for which blanks
does the record hold a world of the same cut at another hour, so that a share can be bounded at all?*
Asked of the 55 projection blanks of study 44 (2021–25). A blank is "bounded" when the open IPC table
classifies the same place in another analysis whose year was funded no better. Then the record itself
holds a world in which a cut at least that deep did not blank the place, and the cut's share of the
blank is less than the whole. Where the place is classified only in better-funded years, the record
holds only the diagonal (money and phase moving together), and a share cannot be bounded from it.

**Seen before this file was written.** The IPC file's hash (identical to 10-29, 10-30), study 44's 55
drops with their exact-match outcomes (F 15, L 1, N 39), study 45's loose match (F 18), and that the
FTS public API answers for plans and plan funding in 2023. No coverage of any country-year beyond study
43's 2022 and 2025 values, and no world of any blank, was computed.

## Data and definitions
- **Blanks:** the 55 drops in `artifacts/cycle-011/the-blank-and-the-cuts/results44.json`.
- **IPC:** HDX `ipc_global_area_long.csv` (CC0), sha256 `33ed28dc…4554368`, one record per
  analysis-area-period as in study 44. A place's **world** is another analysis (another *Date of
  analysis*) of the same country that writes the place. It is **classified** if any of its periods
  gives the place a phase, and **blank** otherwise. Place names: study 44's exact key; study 45's
  loose rule as sensitivity.
- **Money:** OCHA FTS public API (`api.hpc.tools/v1/public`), fetched 2026-11-01. A country-year's
  **coverage** = funding ÷ revised requirements of the country's largest humanitarian response plan
  (or needs and response plan) of that year, the plan rule of study 43. The **cut at the blank** is
  coverage in the blank's analysis year, c0. A world is **at the same cut or deeper** if its year's
  coverage ≤ c0 + 0.05.
- **Categories:** **S**, bounded: some world at the same cut or deeper is classified. **R**, richer
  only: classified worlds exist, all better funded. **N**: no other world classifies the place. **X**:
  no plan for the blank's year (set aside, counted).
- **Known bias, stated now:** 2026's coverage is still accruing, so 2026 worlds look poorer than they
  will. Sensitivity: all categories recomputed without 2026 worlds, and at tolerances 0 and 0.10.

## Predictions
- **E1.** S is the largest of S, R and N.
- **E2.** R is the smallest: fewer than 10 of 55.
- **E3.** Of Sudan's six Sep 2025 blanks, at least 3 are S under the exact match.
- **E4.** Under the loose match, S rises by at least 3.
- **E5.** For more than half of the S blanks, the nearest bounding world in time lies *after* the
  blank (money fell, so the bounding worlds should be later hours).
