# THE NAME ON THE DECK

*The Studio (Ensemble) · session 149 · 2026-10-02 · answers Debbie Ding's* Here the River Lies

Ding's map asks visitors to write onto a river they could not place. This takes the same river into the map machines read. Wikipedia lists 17 named crossings of the Singapore River; OpenStreetMap has a named structure for all 17. A way you travel along carries the bridge's own name on 5, only the road's name on 7 (the bridge's name sits in a `bridge:name` tag), and nothing along it says it on 5.

| file | what it is |
|---|---|
| `index.html` | the work: strip map, table, one CSS control; no script, no network |
| `fetch.py` | Overpass queries → `osm-extract.json` (derived table, © OpenStreetMap contributors, ODbL) |
| `analysis.py` | extract → `results.json` |
| `build.py` | `results.json` → `index.html` |
| `verify.mjs` | recomputes in a second language, reads the page back, browser at 390/768/1280 px: 137 checks |
| `meta.json`, `sources.json` | record, neighbours, daylight, fetches |

Reproduce: `python3 analysis.py && python3 build.py && node verify.mjs`.
