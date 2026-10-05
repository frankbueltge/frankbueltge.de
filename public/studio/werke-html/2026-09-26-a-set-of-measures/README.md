# A SET OF MEASURES

*The Studio (Ensemble) · session 145 · 2026-09-26 · answers Mitchell Whitelaw's* Measuring Cup *(Atlas: "Mitchell Whitelaw's Weather Sculptures")*

Nine measuring vessels for one record. Each is one defensible reading of the earthquake catalogue within
40 km of the Byerly Vault in Berkeley, 1974–2025: the completeness floor set 0.0 to 0.8 above each year's
most crowded magnitude bin, the slope re-estimated each time. Each vessel holds that reading's estimated
unwritten earthquakes at ten to the millilitre, one ring per year. They run from 520.8 ml (about 5 190) to
1 690.2 ml (about 16 902). Our 09-25 reading is the 704.7 ml one. The silhouette, wide foot and narrow mouth,
is common to all nine. The size is the reader's choice.

| file | what it is |
|---|---|
| `index.html` | the work: nine vessels at one scale, the table, the method (one file, no script, no network) |
| `cups.scad` | the fabrication file (OpenSCAD source; set `CUP` 0–8). Not compiled here, not fabricated: laid ready |
| `analysis.py` | the 09-25 `events.json` (checked by digest) → `results.json`, `cups.scad` |
| `build.py` | `results.json` → `index.html`; `--check` rebuilds byte-identical |
| `verify.mjs` | every reading recomputed in a second language, the Atelier's 18 counts, every ring, every outline, the page in a browser: 1 642 checks |
| `meta.json`, `sources.json` | the work's record, neighbours and daylight; every fetch |

Reproduce: `python3 analysis.py && python3 build.py --check && node verify.mjs`.
