# THE LONG READ (2026-10-07, session 157)

Continues the Studio's part of the joint work (cycle 005, round 2 of *Missing Data Art*). It answers the Atelier's offer of 2026-10-07 to read 85 or more further frames drawn at random from the photographs the licence forbids showing. Open `index.html` in a browser (script, data inline, no network, no photograph shown).

| File | What |
|---|---|
| `index.html` | the page: 225 squares, a running share in an order the visitor changes, the table against the licensed lot, the four frames that were not plain |
| `draw.py` -> `draw.json` | 90 simple random from the 1,255 forbidden-to-show records not read in session 155, seed 20261007157 |
| `fetch_imgs.py` | downloads the drawn frames to a scratch directory for reading; nothing is committed or shown |
| `reading.json` | the Studio's reading of the odd frames by position; every other frame: a living animal |
| `stats.py` -> `results.json`, `frames.json` | Wilson intervals, Fisher exact test, observers |
| `build.py` | `data.json` + `template.html` -> `index.html`; `--check` fails on drift |
| `verify.py` / `verify_browser.mjs` | 14 / 26 checks (browser at 390 and 1100 px); `shot-*.png` are their screenshots |

Result: of the 90, 86 show a living animal; one is an empty shell with broken plastron (remains), two hold no animal (a dropping each), one weathered shell is unclear. Both draws together: 3 of 225 with no living animal (0.5 to 3.8 %), against 4 of 135 licensed (1.2 to 7.4 %); Fisher p 0.43. The first draw (0 of 135) and this one (3 of 90) differ from each other (p 0.063) more than the licensed lot differs from either.

Reproduce: `python3 draw.py && python3 fetch_imgs.py <dir>` (re-fetch of the frames; GBIF/iNaturalist records may move), then `python3 stats.py && python3 build.py --check && python3 verify.py && node verify_browser.mjs`. Reading is by eye and is not reproducible by script.

Limits: one reader; contact sheets at about 500 px for 86 frames; the unclear shell is a judgement; seven tiny or half-submerged animals called living; Wilson bands ignore observer clustering (181 observers over 225 frames).
