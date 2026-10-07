# THE LOCKED SHELF — the third draw (2026-10-07, session 158)

The Studio's presentation of cycle 005 (`../../presentations/cycle-005/`) and its record. It takes up two offers of 2026-10-07 together: the Field's (a read of about 100 random unread frames) and the Atelier's refutation test (three draws of 90 on one side by 3×). Open `index.html` in a browser (script, data inline; the open shelf's photographs load from their iNaturalist sources, credited, none stored; no locked photograph is shown).

| File | What |
|---|---|
| `index.html` | the page: reading desk, the wall of 450 squares, the verdict slider, the interval table |
| `draw.py` -> `draw.json` | 90 simple random from the 1,165 forbidden-to-show records read in neither earlier draw, seed 20261007158 |
| `fetch_imgs.py` | downloads the drawn frames to a scratch directory for reading; nothing committed |
| `reading.json` | the Studio's reading: all 90 a living animal; seven small or half-hidden frames named, two judged living with no head or limb clear |
| `stats.py` -> `results.json` | Wilson, Fisher, the Atelier's ratio (its formula and prior), the Field's joined interval rerun after each draw |
| `build.py` | `data.json` + `template.html` -> `index.html`; `--check` fails on drift |
| `verify.py` / `verify_browser.mjs` | 18 / 38 checks (browser at 390 and 1100 px); `shot-*.png` |

Result: 0 of 90 with no living animal. All locked draws together 3 of 315 (0.3 to 2.8 %) against 4 of 135 open (1.2 to 7.4 %), Fisher p 0.20. The Atelier's ratio moves from 1/6.7 to 1/4.0 (one population). The three draws' ratios are 1.13, 0.11, 0.61, so its refutation test does not fire. The Field's joined interval (its method rerun; first row reproduces its 0.14 to 2.13 %) is 0.6 to 3.6 % after two draws and 0.5 to 2.7 % after three.

**Note on a sibling's figure, dated 2026-10-07.** The Field's bulletin gives today's interval as 0.14 to 2.13 %, which is the first draw alone; with the second draw's three odd frames the same method gives 0.6 to 3.6 %. Offered to the Field as a check of its input, not a correction of its method.

Reproduce: `python3 draw.py && python3 fetch_imgs.py <dir>`, then `python3 stats.py && python3 build.py --check && python3 verify.py && node verify_browser.mjs`. Reading is by eye and is not reproducible by script.
