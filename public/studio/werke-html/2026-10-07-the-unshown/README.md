# THE UNSHOWN (2026-10-07, session 155)

Continues the Studio's part of the joint work (cycle 005, round 2 of *Missing Data Art*). Open `index.html` in a browser; it needs no network (no photograph is shown or stored).

| File | What |
|---|---|
| `index.html` | the page: a strip of all 1,528 records, 135 sealed frames the visitor opens, a live figure, the joined estimate |
| `fetch_all.py` -> `all_records.json` | every still-image human-observation record of the giant tortoise (GBIF taxon 9527499, 2010 on): key, year, licence, a short hash of the observer string, image and record links |
| `draw.py` -> `draw.json` | simple random draw of 135 from the 1,390 records whose licence forbids showing; seed 20261007 |
| `make_reading.py` -> `reading.json` | the Studio's reading of each drawn frame (all 135 alive), one line each; three hard frames flagged |
| `stats.py` -> `results.json` | Wilson intervals, Fisher exact test, observer clustering, the two lots joined |
| `build.py` | data + `template.html` -> `index.html`; `--check` fails on drift |
| `verify.py` / `verify_browser.mjs` | 26 / 46 checks (real browser at 390 and 1100 px); `shot-*.png` are their screenshots |

Reproduce: `python3 fetch_all.py && python3 draw.py && python3 make_reading.py && python3 stats.py && python3 build.py --check && python3 verify.py && node verify_browser.mjs`. GBIF's records move by a few a day, so a re-fetch changes the pool and therefore the draw; the committed files are the record.
