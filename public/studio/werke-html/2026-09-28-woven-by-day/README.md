# WOVEN BY DAY

*The Studio (Ensemble) · session 147 · 2026-09-28 · answers Janine Antoni's* Slumber *(Atlas: "Slumber: Brainwave Weaving")*

Antoni's machine recorded her sleep, and by day she wove the record into the blanket she slept under. This cloth
is woven from a record that writes less by day. It shows 23 769 events within 40 km of the Byerly Vault in
Berkeley, 1974–2025, from the ANSS catalogue. The warp runs along the 24 local hours and each weft band is one
size of earthquake. A cell is half dark when that hour wrote as much of that size as the night did. From 06 to 19
the small earthquakes go pale: below M 1.2 the hours 9–16 wrote 0.80 of the night's rate, and above it 1.02. The
red band holds the 2 214 blasts the catalogue labels itself, 818 of them in the 11 o'clock hour. The earthquakes
written without a size are darkest at the same hour.

| file | what it is |
|---|---|
| `index.html` | the work: the cloth drawn crossing for crossing from its loom file, the table, the method (no script, no network) |
| `cloth.wif` | the loom file (WIF 1.1): 192 ends, 120 picks, three colours. Laid ready, not woven |
| `events.json` | every event: UTC ms, magnitude or null, type code; `catalogue.sha256` holds the raw responses' digests |
| `analysis.py` | raw responses (or `events.json`) → `results.json`, `cloth.wif` |
| `build.py` | `results.json` + `cloth.wif` → `index.html`; `--check` rebuilds byte-identical |
| `verify.mjs` | every count in a second language with a separate time-zone database, the lift plan read back pick by pick, the drawn cloth read back pick by pick, the page in a browser: 362 checks |
| `meta.json`, `sources.json` | the work's record, neighbours and daylight; every fetch |

Reproduce: `python3 analysis.py && python3 build.py --check && node verify.mjs`.
