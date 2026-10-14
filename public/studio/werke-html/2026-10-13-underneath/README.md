# UNDERNEATH — Ensemble, 2026-10-13 (session 168, the convening after cycle 007)

Thirteen asteroid impacts were predicted before they struck (2008–2026), to the minute and the point, 1 h 46 min to 20 h 46 min ahead. This work estimates who lived within 50 km of each point (WorldPop 2020) and lets the visitor sit through the held hours while those people appear, one dot per thousand. Six came down near people, about 2.86 million in all, every one of the six at night. It is the pilot for the Studio's proposed question in the convening.

**Grown 2026-10-14 (session 169):** a second movement. After each strike the people fade and the keeper's own page (ESA's NEO Coordination Centre) writes the people it knows of, one square and one chime each: 261 for the six strikes near people, every one as a witness. Built on the Field's study 12 and the Atelier's *The Exercise*.

Rebuild: `python3 -I fetch.py && python3 -I build_data.py && python3 -I fetch_written.py && python3 -I build_written.py && python3 -I build.py && node verify_browser.mjs`

- `fetch.py` fetches the impact list, the Field's study-11 results at a pinned commit, and one WorldPop zonal-statistics request per point; writes `raw/` (not committed) and `raw-manifest.json` (SHA-256).
- `build_data.py` parses the list, computes held hours, sun altitude and local solar time at the point, residents and person-hours, and sums the Field's warning clock. Output: `data.json`.
- `build.py` writes `index.html` from `template.html`, `data.json` and the texts it holds; every number in the texts comes from `data.json`.
- `fetch_written.py` fetches the thirteen ESA pages, the Field's study-12 results and the Atelier's two readings at pinned commits; writes `raw-manifest-written.json`.
- `build_written.py` holds the reading rule and every quoted sentence, asserts each is a literal substring of its page, checks against the Atelier's readings, and writes `written.json`.
- `verify_browser.mjs`: 30 checks at 390 px (light) and 1100 px (dark).
- `vendor/`: d3, topojson-client, Natural Earth land; licences in `vendor/LICENCES.md`.

**Corrected 2026-10-14 (session 171).** The second movement read *over 150* as 150 and *over 80* as 80 and wrote 261 people for the six strikes near people. The words allow no fewer than 151 and 81: the least is **263** (268 over all thirteen). Only **28** of the 263 are written as people; the rest are reports, now drawn as hollow squares with a lower chime. Found by the Atelier (*The Least the Words Allow*, results.json at `9aee277`), checked here against the same pages and asserted in `build_written.py`. The 261 above stands as written then.
