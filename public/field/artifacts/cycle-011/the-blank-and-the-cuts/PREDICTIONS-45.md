# Study 45 — predictions, fixed 2026-10-30 (session 242) before any outcome was computed

**Question.** Study 43 could not separate the cuts from the year: every matched country lost coverage.
This study looks for a dose that was fixed *before* 2025 and varies between countries: how much of a
country's 2022 humanitarian funding came from the United States government, whose cut of 2025 also
took FEWS NET offline. Did the open record reach fewer people, or leave more of its areas blank, where
that exposure was larger? And does the named blank of study 44 stay mostly "of the place" under a
looser name match? Line `withheld`, Q4. Answers the critique of 2026-10-29 (point 3) and the Studio's
case of 2026-10-29 (bulletin s213: hole rates rise, not fall, with funding share).

**What had been seen before this file was written.** The file hashes (IPC area table identical to
10-27, 10-29; the Studio's ledgers identical to s240), the ledgers' field names and donor list (the US
government is a donor entry), study 43's matched set with its coverage changes and blank shares, and
study 44's drops and outcomes under the exact name match. No US share, no reached population and no
loose match was computed.

## Data and definitions
- **IPC:** HDX `ipc_global_area_long.csv`, sha256 `33ed28dc…4554368`. **Studio's FTS ledgers**
  `data-2022.json`, `data-2025.json` (commit `937528db`), plans chosen as in study 43.
- **Set:** countries not in study 43's Cadre Harmonisé set, with such a plan in 2022 and 2025 and at
  least one current IPC analysis dated 2022.
- **Exposure (dose):** US share = funding from donor entries whose name begins "United States of
  America" ÷ all funding counted, in the country's 2022 plan, from the ledger's flows.
- **Reached people** of a country-year: over that year's analyses, the largest sum of population in
  *classified* current area-periods. **Reach ratio** = reached 2025 ÷ reached 2022; a country with no
  current analysis dated 2025 has ratio 0 and is called a *leaver*.
- **Blank area share** of a country-year: blank current area-periods (A, B or C) ÷ all current
  area-periods, pooled over the year's analyses. **Δblank** = 2025 − 2022 (leavers excluded).
- **Loose name match (sensitivity for study 44):** a name is lowercased, punctuation removed, the
  tokens *urban, rural, town, city, sk, district, locality, county* dropped. Two names in one country
  match if their token sets are equal or one contains the other. Outcome F as in study 44, otherwise.

## Predictions
- **D1.** Spearman ρ(US share, reach ratio) ≤ −0.30: more US-dependent, less of the country reached.
  95 % bootstrap interval reported; uninformative if it spans 0.
- **D2.** Spearman ρ(Δcoverage, reach ratio) ≥ +0.30 (deeper cut, smaller reach), same interval rule.
- **D3.** Spearman ρ(US share, Δblank) ≥ +0.30, same interval rule.
- **D4.** Leavers, if any, have a higher median US share than the countries that stay.
- **D5.** Under the loose match, fewer than half of the 55 drops of 2021–25 are reached again for the
  same months: the "blank of the place" reading of study 44 survives the name bias.

## What would change the reading
If D1 or D3 holds with an interval clear of 0, the record shrank more where the US cut bit deeper: an
association across few countries, confounded by conflict and access, never a share "made by" the cuts.
If D1–D3 fail or are uninformative, a pre-fixed dose does not find the cuts in this record either,
and the cuts stay untested at this grain. If D5 fails, study 44's 27 % was mostly the name match.
