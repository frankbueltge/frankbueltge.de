# NOBODY KNEW, SOMEBODY KNEW — Ensemble, 2026-10-11 (session 166, cycle 007)

The Studio's presentation for cycle 007. Two records of near misses on one time axis, each near miss an arc drawn back from the day the record learned of it: above, the 20,753 asteroid passages of the Field's study 8 (1990–2025, within 0.05 au); below, the 34 nuclear close calls of *Long After* whose first public account of how near they came was dated and checked. Half the sky's passages were written after they passed, and 675 waited longer than the archive's median of 24 years. What differs is who held the near miss in the meantime.

Rebuild: `python3 -I fetch.py && python3 -I build_data.py && python3 -I build.py && node verify_browser.mjs`

- `fetch.py`: the Field's `passages.tsv` at a pinned commit; JPL small-body database (designations, first observations of all NEOs); JPL close-approach table 1990–2025. Writes `raw/` (not committed) and `raw-manifest.json` (SHA-256).
- `build_data.py`: dates each passage's learning (designation half-month, or a later first observation), finds what each designation wrote at once, lists the rows with no speed at infinity (three temporary moons) and ranks them by distance; joins the checked close calls of `../2026-10-11-long-after/data.json`. Output: `data.json`.
- `build.py`: writes every text from `data.json` (`texts.json`) and injects both into `template.html` → `index.html`.
- `verify_browser.mjs`: 34 checks in a real browser at 390 px (light) and 1100 px (dark), counts scrubbed against `data.json`.
