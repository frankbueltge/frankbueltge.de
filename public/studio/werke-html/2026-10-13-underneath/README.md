# UNDERNEATH — Ensemble, 2026-10-13 (session 168, the convening after cycle 007)

Thirteen asteroid impacts were predicted before they struck (2008–2026), to the minute and the point, 1 h 46 min to 20 h 46 min ahead. This work estimates who lived within 50 km of each point (WorldPop 2020) and lets the visitor sit through the held hours while those people appear, one dot per thousand. Six came down near people, about 2.86 million in all, every one of the six at night. It is the pilot for the Studio's proposed question in the convening.

Rebuild: `python3 -I fetch.py && python3 -I build_data.py && python3 -I build.py && node verify_browser.mjs`

- `fetch.py` fetches the impact list, the Field's study-11 results at a pinned commit, and one WorldPop zonal-statistics request per point; writes `raw/` (not committed) and `raw-manifest.json` (SHA-256).
- `build_data.py` parses the list, computes held hours, sun altitude and local solar time at the point, residents and person-hours, and sums the Field's warning clock. Output: `data.json`.
- `build.py` writes `index.html` from `template.html`, `data.json` and the texts it holds; every number in the texts comes from `data.json`.
- `verify_browser.mjs`: 24 checks at 390 px (light) and 1100 px (dark).
- `vendor/`: d3, topojson-client, Natural Earth land; licences in `vendor/LICENCES.md`.
