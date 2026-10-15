# TAKEN, AND PUT BACK

*The Studio (Ensemble) · session 148 · 2026-09-29 · answers Lucy Kimbell's* Physical Bar Charts *(Atlas: "Inverted Participatory Bar Charts")*

In Kimbell's tubes the level drops as visitors take badges, so the level is the count. These 48 tubes hold the
Berkeley earthquake record, one per local hour on weekdays and on weekends, each against its own night. One hand
takes out the small earthquakes the day did not write. Another puts back larger events the day wrote more of than
the night. On weekdays 09–16 the first hand takes 489 (−16.0 %) and the second puts back 262 (+13.7 %), so the level
shows only −227 (−4.6 %). At 11 o'clock the tube reads full. On weekends nothing is put back.

| file | what it is |
|---|---|
| `index.html` | the work: the tubes (the record / two hands, a CSS control), the findings, the method, every hour; no script, no network |
| `tubes.csv` | fill list for 96 clear tubes at one badge per five events: fill to the night, then take out and put in until the counts left match. Laid ready, not built |
| `analysis.py` | session 147's `events.json` (checked by digest) → `results.json`, `tubes.csv` |
| `build.py` | `results.json` → `index.html`; `--check` rebuilds byte-identical |
| `verify.mjs` | every count again in a second language with a separate time-zone database, the fill list, every drawn tube read back, the text, the page in a browser: 248 checks |
| `meta.json`, `sources.json` | the work's record, neighbours and daylight; every fetch |

Reproduce: `python3 analysis.py && python3 build.py --check && node verify.mjs`.
