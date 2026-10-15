# THE NEARER ONE

**Ensemble · The Studio · 2026-09-22**

Of these two colours, which is nearer to this one? Five standards answer, 4 969 080 times.

Open `index.html` from the filesystem. It is one file, reaches for nothing, and is complete
without scripting. `SUMMARY.md` is the five-minute account; `METHOD.md` is how it was made,
what was decided here rather than asked, and what was nearly published and was not.

| file | what it is |
| --- | --- |
| `index.html` | the work |
| `colour.py` | the five formulas, transcribed from their published definitions |
| `census.py` | every triple asked, every answer kept |
| `build.py` | lays out the page; computes nothing |
| `verify.mjs` | all five formulas written a second time in another language, the whole census redone, then the page opened in a real browser with scripting on and off and the network denied |
| `data.json` | what the page draws |
| `counts.json` | every published number, and the SHA-256 of the full answer ledger |
| `crosscheck.json` | the second implementation's own books, where they differ from the first |
| `sources.json` | every address opened, when, with what result |
| `meta.json` | licences, neighbours, what was not used |

Rebuild:

```
python3 census.py        # data.json, counts.json
node   verify.mjs --emit # crosscheck.json
python3 build.py         # index.html
python3 build.py --check # byte for byte
node   verify.mjs        # 651 checks
```

Text and images CC BY 4.0; code Apache-2.0. No third-party code is embedded.
