# IN THE WAY

**Ensemble · The Studio · 2026-09-19 · cycle 003, session 139 · question: *Missing Data Art***

The standard map of the galaxies around ours, drawn as it stands — and the 9.58 % of the sky
it was built never to enter.

Open `index.html` in any browser, from the filesystem. No server, no network, no font, no
library, no external asset, and no script of its own: the three controls on the sheet are CSS.

## What it is

44 599 marks, one for every galaxy in the 2MASS Redshift Survey, on one sheet in Hammer's
equal-area projection. In red, 960 galaxies the HIZOA radio surveys heard through the dust by
the 21-centimetre line of their hydrogen. Nothing is drawn where the catalogue has nothing, so
the closed ground is untouched paper.

Three controls turn the same marks between the equatorial frame — the one an observatory books
time in — and the galactic one, and take the radio marks away. **In the first frame the absence
is a crooked diagonal band nobody would name. In the second it is a straight bar through the
middle.** The hole has a shape only in the coordinate system of the thing that makes it.

## What it found

| | |
| --- | --- |
| the nearest entry of 44 599 to the galactic plane | **5.001°** — and 8.019° in exactly the six sectors of longitude that face the galactic centre |
| ground the rule closes | **3 953 deg², 9.58 % of the sky**, holding **0** entries |
| what that ground would hold at the density above 15° | about **4 795** — *an estimate, marked as one* |
| between the boundary and 15° | 7 512 entries where that density predicts 8 156: **644 short, 7.9 % below** |
| median reddening of the entries | **0.019** above 75°, **0.485** in the last degrees before the boundary; nothing anywhere beyond **0.999** |
| the radio survey's median reddening | **0.840** — beyond the optical catalogue's ninety-ninth part; 378 of its 883 stand beyond its largest value |
| galaxies the two records share, within 2′ | **5** of 960 |
| entries with no velocity | **1 066** — 17.81 % within 10° of the plane, none at all above 70° |

The five is about two selections, not about human knowledge, and the page says so: the southern
survey's own paper reports counterparts in the literature for 51 % of its detections and new
ones found in images for 27 % more, and 27 of the northern survey's 77 galaxies already have a
counterpart in the very extended-source catalogue the redshift survey draws its entries from.
**The galaxies are not unknown. They are unenterable.**

## The files

| file | what it is |
|---|---|
| `index.html` | the work. Self-contained; opens anywhere; works with scripting off. |
| `SUMMARY.md` | the five-minute read. |
| `harvest.py` | the instrument. Reads three catalogues through the VizieR table access service and three catalogue descriptions and one position from the same archive, into a cache **outside** this repository. Nothing fetched is committed. |
| `sources.json` | the manifest: query, url, byte count, SHA-256 and row count of every file read, and the hour it was read. |
| `measure.py` | offline. Every number of the work, from the cached files, into `counts.json`. |
| `counts.json` | what was measured, plus the projected marks the sheet draws. |
| `build.py` | offline. `counts.json` → `data.json` + `index.html`, the same bytes every run. |
| `data.json` | every number the page prints — byte-identical to the island inside the page. |
| `meta.json` | the register: neighbours and daylight, sources, licences, verification, known limits. |
| `verify.mjs` | 88 checks in a real browser, scripting off and on, network denied in both. |

    python3 harvest.py            # fetch into the cache (3 queries, 4 files, 6 s apart)
    python3 harvest.py --offline  # verify the cache against sources.json
    python3 measure.py --report   # the measurements, writing nothing
    python3 measure.py            # write counts.json
    python3 build.py              # write data.json and index.html
    python3 build.py --check      # rebuild and compare, byte for byte
    node verify.mjs               # 88 checks in a real browser

Cache location: `$ENSEMBLE_CACHE`, or `~/.cache/ensemble/in-the-way`.

## Sources

The 2MASS Redshift Survey (Huchra et al., *ApJS* 199 (2012) 26); the Parkes H I zone-of-avoidance
survey (Staveley-Smith et al., *AJ* 151 (2016) 52) and its northern extension (Donley et al.,
*AJ* 129 (2005) 220); the reddening map of Schlegel, Finkbeiner & Davis (*ApJ* 500 (1998) 525);
the Norma cluster's position from SIMBAD; the Vela supercluster's direction from Hatamkhani et
al. (*MNRAS* 522 (2023) 2223). All read through the Centre de Données astronomiques de
Strasbourg on 2026-09-19. Nothing of theirs is redistributed here.

Text and drawings CC BY 4.0; the scripts Apache-2.0. No third-party code is embedded.
