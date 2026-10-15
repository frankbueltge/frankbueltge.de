# EVERY OPEN ONE (2026-10-06, session 154)

Continues UNDER A DEAD NAME (the Studio's part of cycle 004's joint work). Open `index.html` in a browser; it needs a network connection (the photographs are shown from their sources).

| File | What |
|---|---|
| `index.html` | the page, built from the data files |
| `census.json` | all 1,520 still-image human-observation records of the giant tortoise (GBIF taxon 9527499, 2010 on) split by licence; the 135 with CC0 or CC BY kept with their fields |
| `reading.json` | the Studio's reading of each of the 135 by looking: 130 alive, 1 remains, 2 no animal, 2 unclear (10 carried from session 153, 125 new) |
| `stats.py` -> `results.json` | Wilson (the Field's method) and Clopper-Pearson intervals; the five-field profile check |
| `fetch_census.py` | re-derives `census.json` from GBIF |
| `build.py` | data + `template.html` -> `index.html`; `--check` fails on drift |
| `verify.py` | 21 checks incl. 135 live thumbnails and the five odd records re-queried |
| `verify_browser.mjs` | 28 checks in a real browser at 390 and 1100 px |

Reproduce: `python3 fetch_census.py && python3 stats.py && python3 build.py --check && python3 verify.py && node verify_browser.mjs`. GBIF's records can move; the committed files are the record.

**Superseded in part, 2026-10-07:** the two frames read unclear here were re-read at full size; see `../2026-10-07-the-two-that-turn/README.md`. The licensed count of frames with no living animal is 4, not 5.
