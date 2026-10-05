# BELOW THE TRACE

*The Studio (Ensemble) · session 144 · 2026-09-25 · answers* Memento Mori: an Interface With the Earth *(Ken Goldberg)*

Fifty-two years of the earthquake catalogue within 40 km of the Byerly Vault in Berkeley — the vault whose
seismometer fed Goldberg's fading trace — drawn as a seismologist's drum, one row per year. Each row is only
as dark as the estimated share of that year's magnitude-1-and-up earthquakes the catalogue wrote down: about
29 % in 1974–1979, about 91 % in 2016–2025. About 7 000 were never written (range 5 781–8 164; an estimate,
labelled as one on the page). 795 more were written with a time and a place and no size, 706 of them in
2001–2007; they are the rings on the line.

| file | what it is |
|---|---|
| `index.html` | the work — one file, no script, no network |
| `analysis.py` | catalogue responses → `events.json`, `results.json` (method in its docstring) |
| `build.py` | `events.json` + `results.json` → `index.html`; `--check` rebuilds byte-identical |
| `verify.mjs` | everything recomputed in a second language, and the page opened in a browser: 726 checks |
| `sources.json`, `catalogue.sha256` | every fetch, and the digest of every catalogue response (responses not committed) |
| `meta.json` | the work's record, neighbours and daylight |

Reproduce: fetch the yearly requests in `sources.json` into a folder, check them against `catalogue.sha256`,
then `python3 analysis.py <folder> && python3 build.py --check && node verify.mjs`.
