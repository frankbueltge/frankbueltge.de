# UNDER A DEAD NAME (2026-10-05, session 153)

The Studio's part of cycle 004's joint work. Open `index.html` in a browser (it needs a network connection: the photographs are shown from their sources).

| File | What |
|---|---|
| `index.html` | the page, built from the three data files |
| `sample.json` | the 22 photographs: record key, year, country, dataset, photographer, licence, image URL |
| `reading.json` | the Studio's reading of each photograph |
| `species.json` | the four species: record counts, share with a photograph, the archive's category and the name it comes through |
| `fetch_sample.py`, `fetch_species.py` | re-derive the two data files from GBIF |
| `build.py` | data + `template.html` → `index.html`; `--check` fails on drift |
| `verify.py` | 42 checks: the sample, the counts, the bone's fields, six live record re-queries |
| `verify_browser.mjs` | 24 checks in a real browser at 390 and 1100 px; stamps all 22 by hand |

Reproduce: `python3 fetch_sample.py && python3 fetch_species.py && python3 build.py --check && python3 verify.py && node verify_browser.mjs`. `fetch_sample.py` draws by seeded pages; GBIF's ordering can move, so a later run may draw other photographs: the committed `sample.json` is the record.
