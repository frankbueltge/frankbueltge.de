# Study 44 — predictions, fixed 2026-10-29 (session 241) before any outcome was computed

**Question.** When a place the IPC classified in an analysis's current period goes blank in that
analysis's projection, is the blank a blank of the *place* (no later analysis reaches it) or of the
*hour* (a later analysis classifies it for the same months)? And did such blanks grow, or stay
blank longer, in 2025, the year of the cuts? Line `withheld`, Q4. This answers the Atelier's case of
2026-10-29 (bulletin s21: Sudan's six areas, blank for Feb–May 2026 in the Sep 2025 analysis, are all
classified for the same months in the Jan 2026 analysis's current period), table-wide.

**What had been seen before this file was written.** The file's hash (identical to 10-27 and 10-29
s240), its validity values (current 168,751 rows; first projection 189,500; second 25,669), study
43's results (current rows only), session 234's whole-table encoding counts, and the Atelier's Sudan
case as its bulletin states it. No projection count by year and no later fill was computed.

## Data and definitions
- **IPC:** HDX `ipc_global_area_long.csv`, sha256 `33ed28dc…4554368` (CC0), fetched 2026-10-29.
- **Area-period:** (date of analysis, country, Level 1, area, validity). **Classified:** phases 1–5
  sum above 0. **Blank:** encodings A, B or C (session 234).
- **Name key:** (country, area) lowercased with whitespace collapsed; Level 1 is ignored (regions
  are renamed between analyses).
- **Drop:** a projection area-period (first or second) that is blank while the same analysis's
  current area-period under the same name key is classified.
- **Outcome of a drop.** **F (filled for the hour):** some analysis dated later than the drop's own
  classifies the same name key in a period (`From`–`To`, any validity) that overlaps the drop's
  period by at least one day. **L (later, other months):** classified later, no overlap. **N:** never
  classified again under that name key.
- **Window:** drops in analyses dated Jan 2021 – Dec 2025 (2026 analyses have had too little time).
- **Cadre Harmonisé:** the country set of study 43 (`analyse.py`, `CH`). Reported with and without.
- **Monthly analyses:** distinct (country, date of analysis) pairs per calendar month.

## Predictions
- **R1.** Sudan Sep 2025: the six areas the IPC names (El Fasher town, Kadugli town, Dilling,
  As Sunut, Al Lagowa, Habila, as written in the table) are all drops, and all six are F.
- **R2.** Pooled over 2021–2025, at least half of all drops are F.
- **R3.** The F share of drops in 2025 analyses is at least 10 points *below* that of 2021–2024
  (in the year of the cuts, a blank was reached again less often). Scored without the CH.
- **R4.** Drops in 2025 analyses (without the CH) exceed the drops of every year 2021–2024.
- **R5.** Distinct analyses dated Jan–Jun 2025 are at least 0.8 × the mean of Jan–Jun 2022, 2023
  and 2024: the IPC's own count shows no dip of 20 % or more while FEWS NET was dark.

## What would change the reading
If R2 holds, the record's named blanks are mostly of the hour: a projection could not be made, and the
place was reached later. If R3 and R4 also hold, the year of the cuts made more such blanks, and
filled fewer of them. If R3 and R4 fail, this record does not show the cuts deepening its blank.
None of it is a share "made by" the cuts; the table writes no reason.
