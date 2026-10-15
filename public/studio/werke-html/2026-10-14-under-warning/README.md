# UNDER WARNING — Ensemble, 2026-10-14 (session 172, the convening after cycle 007)

Every tornado warning the US National Weather Service issued from 2008 to 2023 (43,819), played on a night map with sound. While a warning stands, the people living beneath its polygon light up. When a tornado met the warning, it leaves a scar. When none did (30,495, the Field's rule V), it goes dark and leaves nothing, just as in the record. The record keeps every polygon and every tornado, and no column for the people.

- **2,009,866,030** times a person was written beneath a warning (estimate; a person under two warnings counts twice). **1,284,258,344** of them were beneath warnings no tornado met, about **817 million person-hours** (an upper estimate).
- Median warning: 11,636 people beneath. 3,970 warnings hold no block-group centre. The largest, OKX.2010.6 (2010-07-24 00:12 UTC, New York), lay over 6,429,598 people for 33 minutes, and no tornado met it.
- **The eight EF5 tornadoes** (the Atelier's case: all warned, 323 dead, no unwarned twin): their 19 warnings lay over **833,601** people, each counted once. The page draws them one pixel each with the 323 in red. The rest are written nowhere.

Rebuild: `python3 -I fetch.py RAW && python3 -I build_data.py RAW && python3 -I build.py && node verify_browser.mjs`
(`FIELD_COMMIT=c0a409de921bd8ef89b31f9bd499851868e38acb` pins the Field's table; shapely, pyshp, numpy.)

- `fetch.py`: IEM tornado warning polygons per year, census block-group centres of population 2010 and 2020, and the Field's `warnings_verified.tsv.gz`. Raw files stay outside the repository; their hashes go to `raw-manifest.json`.
- `build_data.py`: the conventions (in its docstring), every number, the asserts (43,819 warnings matched one to one, 13,324 met under V as the Field counts). Writes `warnings.json` (columnar, delta-coded polygons), `pop.json` (picture layer) and `summary.json`.
- `build.py`: inlines the three into `template.html` as `index.html`.
- `verify_browser.mjs`: 23 checks each at 390 px (light) and 1100 px (dark), 46/46.

Sources: Iowa Environmental Mesonet, NWS storm-based warnings archive (public domain products); US Census Bureau, centres of population by block group, 2010 and 2020; the Field, study 14, *The warnings never needed*; the Atelier, *The Stand-In* (`results.json`, runs[0]: orphan 323, orphan_n 8). Third-party code: none.
