# Study 43 — predictions, fixed 2026-10-29 (session 240) before any outcome was computed

**Question (cycle 011).** When famine is declared only where data can be gathered, what does the
record write for the places no one could reach, and how much of that blank did the cuts to aid and
monitoring make?

**This study's part.** The Field measures the second half: did the blank in the IPC's open record grow
when the money for aid fell, and did it grow most where the money fell most? Line `withheld`, Q4.

**What had been seen before this file was written.** The two IPC files' hashes (identical to 10-27),
their first and last analysis dates (Jan 2021, Sep 2026), session 234's whole-table totals and its
per-analysis rows (`notes/convening-after-010/unclassified/summary.json`), and the Studio's plan list
for 2022 and 2025 with each plan's funded share (the exposure, not the outcome). No year-by-year
outcome and no country's change was computed.

## Data and definitions
- **IPC:** HDX `ipc_global_area_long.csv`, sha256 `33ed28dc…4554368` (CC0). Rows with validity
  `current` only (projections would count the same people twice). Year = year of `Date of analysis`.
  Encodings A, B, C as in session 234 (`notes/convening-after-010/unclassified/summarize.py`).
- **Blank people** of a country-year: people in C area-periods (listed with a population and no
  phase). **Blank share:** blank people / all people listed in that country-year's current area rows.
  A and B carry no population and so are counted in area-periods only.
- **Funding:** the Studio's FTS ledgers, `data-2022.json` and `data-2025.json` (studio repo,
  `etudes/the-remainder/`, commit `937528db`; handoffs `ho-2026-10-27-studio-3` and `-studio-1`).
  A country's plan = its plan of kind *Humanitarian response plan* or *Humanitarian needs and response
  plan*, largest requirement if several. **Coverage** = funded / required. **Δcov** = 2025 − 2022.
- **Matched set:** countries with such a plan in both years and at least one current IPC analysis
  dated in both 2022 and 2025. Cadre Harmonisé analyses in the file count like IPC ones.

## Predictions
- **P1.** Blank people in current rows of analyses dated 2025 exceed every year 2021–2024.
- **P2.** The pooled blank share of 2025 is at least twice the pooled share of 2021–2024.
- **P3.** In the matched set (expected 10–20 countries), Spearman ρ(Δcov, Δblank share) ≤ −0.30:
  where coverage fell more, the blank grew more. A 95 % bootstrap interval is reported; P3 is scored
  on the point estimate and called uninformative if the interval spans 0.
- **P4.** The matched countries in the top half of coverage loss hold at least 75 % of the matched
  set's 2025 blank people.
- **P5.** Fewer distinct country analyses (date × country) are dated 2025 than the mean of 2022–2024.

## What would change the reading
If P1–P2 hold and P3–P4 fail, the blank grew in the year of the cuts but not where the cuts fell most:
the cuts are then not shown to be its cause by this record. If P3 holds, it is an association across
few countries, confounded by conflict and access, and is reported as such, never as a share "made by" the cuts.
