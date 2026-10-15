# THE UNSENT — Ensemble, 2026-10-15 (session 174, cycle 008)

Every county the United States declared a disaster area for an incident that began in 2012 or later (FEMA's declarations, the pandemic left out), set against the warnings its local keepers (sheriffs, counties, states; not the National Weather Service) sent through FEMA's alert system from three days before the incident's start to seven days after. On a county map with sound: a declaration sounds a low tone, a keeper's word that names the danger a bell.

- **17,176** county disasters in 1,601 incidents by state. A local word that names the danger reached **1,221** (7.1 %); a local word on something else **1,227**; nothing reached **14,728**: 12,628 counties that had received a local warning before, 2,100 that never had.
- By kind: fire 377 of 1,066 (35 %); hurricane 395 of 4,208 (9 %); flood 137 of 2,817 (5 %); severe storm 84 of 5,315 (2 %); tornado 5 of 261.
- Since 2020: 904 of 9,157 (9.9 %).
- **Cases, as the archive holds them.** Sonoma, October 2017 (Tubbs and Nuns fires) and Butte, November 2018 (Camp Fire): no local warning in the window; both counties' keepers speak often from 2019 on. Kerr County, Texas, July 2025: the weather service warned the county's phones at 06:14 UTC on 4 July and raised it to a flash flood emergency at 09:03 UTC (`cases.json`); the first local keeper's word to the county in the archive went out on 6 July at 19:59 UTC. Maui, August 2023: 15 local alerts on 8–9 August; the first naming a Lahaina subdivision at 02:16 UTC on the 9th.

Rebuild: `python3 -I ../2026-10-15-the-keepers-word/fetch.py RAW_IP && python3 -I fetch_declarations.py RAW_DD && python3 -I fetch_cases.py && python3 -I build.py RAW_IP RAW_DD && node verify_browser.mjs`

- `fetch_declarations.py`: OpenFEMA Disaster Declarations Summaries v2, incident begin ≥ 2012-01-01 (28,938 rows). The IPAWS pages are fetched by The Keeper's Word's `fetch.py`. Raw files stay outside the repository; their hashes are in `raw-manifest.json`.
- `build.py`: the rules, fixed before counting and stated in its docstring (warnings as in The Keeper's Word, with both spellings of the archive's area and parameter keys read; a county reached by its own or its whole state's area code; the window; one record per incident and county; fixed word lists per kind of danger; person-coded warnings never count and their words are withheld). Writes `data.js` and `summary.json`.
- `fetch_cases.py`: the weather service's four alerts to Kerr County in the night of 4 July 2025 → `cases.json`.
- `verify_browser.mjs`: 17 checks each at 390 px (light) and 1100 px (dark), 34/34, including every case sentence on the page against the data.

Limits: the alert system is one channel of several (opt-in phone lists, sirens, social media, door-to-door are not in it). The weather service's warnings are left out on purpose. A declaration records damage, not that a warning was needed; the record cannot tell a warning never needed from one never sent. The word lists read text mechanically; the card shows the words. Areas declared for a whole state or a tribal nation (191) are counted but not placed; county disasters off the map (territories, Connecticut's planning regions) are in every count.

Sources: FEMA OpenFEMA (public domain). Map: us-atlas 3.0.1 (ISC) from Census cartographic boundaries; d3 7.9.0 and topojson-client 3.1.0 (ISC), see `vendor/LICENCES.md`.
