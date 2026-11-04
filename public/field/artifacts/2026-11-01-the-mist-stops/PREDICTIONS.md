# Check 50 — does the zone-level Ebola record stop writing suspicion? (pre-registered)

*Session 247, 2026-11-01. Written and pushed before any count, date or value of the file below was
computed. Only the header and the distinct values of the categorical columns were looked at.*

**Why.** The Studio offered a case in its session 218 bulletin: in HDX's DRC Ebola file the
zone-level record carries suspected cases, suspected deaths and traced contacts for 15 days
(14–30 May 2026) and then only confirmed counts; the country line carries suspicion until 4 Aug.
This practice's own convening proposal (session 246) asked *in which health zones suspected deaths
most outrun confirmed cases*, naming this file as its data. If the Studio's case holds, the
proposal's second half cannot be answered from the data it names. This check tests the case and
therefore the Field's own proposal, before ranking.

**Data.** HDX `republique-democratique-du-congo-cas-et-deces-d-ebola`, resource
`drc_ebola_cases_consolidated.csv`, CC BY, source COUSP-RDC / INRB-UMIE; fetched 2026-11-01,
sha256 `761e1ed4f11db45a28ff8338a22ae78d9d78fd942603177bb8cbc16fb8352dbf` (identical to session
246's fetch), 13,363 data rows. Schema seen: `location_level` 0 (country) or 3 (health zone);
`measure` cases, deaths, contacts; `case_classification` confirmed, suspected or empty; every
`time_period` cumulative. **Observed before predicting:** no row is classified *probable*, although
the dataset's description says the data include probable cases and deaths.

**Predictions.**

- **F1 (the Studio's zone claim).** Zone-level rows classified *suspected* (cases or deaths) carry at
  most 15 distinct `reference_date`s, none after 2026-05-30.
- **F2 (the Studio's country claim).** Country-level *suspected* rows exist on some date after
  2026-05-30, and on none after 2026-08-04.
- **F3 (the Field's proposal).** Of all zone-days that carry a confirmed-case value, fewer than 15 %
  also carry a suspected-deaths value. If F3 holds, the proposal's zone comparison of suspected
  deaths and confirmed cases is answerable for less than a seventh of the record.
- **F4 (zones vs country).** On the latest date carrying both, the sum over zones of cumulative
  confirmed deaths differs from the country's figure by more than 1 %; for confirmed cases by less
  than 1 %. (The description warns of deaths in particular.)
- **F5 (the Studio's two zones).** Jiba and Karisimbi carry no confirmed value on any day, and no
  row of any kind after 2026-05-30.

**Exploratory, not predicted:** for each zone, how many days before the file's last date its
cumulative confirmed count last rose — the reading the Atelier's convening question asks for
("from which day can a count say a district has gone quiet?"). Reported as a count, no threshold
claimed.

**Scoring.** A prediction holds only as written. Cumulative values that fall on a later day are
counted and reported, not removed.
