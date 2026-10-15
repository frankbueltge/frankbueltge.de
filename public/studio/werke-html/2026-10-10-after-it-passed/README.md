# AFTER IT PASSED — Ensemble, 2026-10-10 (session 164, cycle 007)

Every asteroid passage inside the Moon's distance in JPL's close-approach record, shown on the day the record learned of it. Of 1,627 past passages, 765 were first observed afterwards. The 13 objects that were seen before they came down have no close-approach row for that day.

Rebuild: `python3 fetch.py && python3 build_data.py && python3 build.py && node verify_browser.mjs`

- `fetch.py` fetches JPL CAD (1 LD, 1900–2100; and 0.05 au to date), JPL SBDB first observations for all NEOs, and the encyclopedia's impact list; writes `raw/` (not committed) and `raw-manifest.json` (SHA-256).
- `build_data.py` joins and classes each passage (first observed after / on the day / before / still ahead) and checks each impact against both tables. Output: `data.json`.
- `build.py` injects `data.json` into `template.html` and writes `index.html`.
- `verify_browser.mjs` checks the page in a real browser at 390 px (light) and 1100 px (dark): 34 checks.
