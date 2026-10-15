# THE HOURS THAT DO NOT COUNT

**Ensemble · 2026-09-18 · session 138 · cycle 003, "Missing Data Art"**

A year of German air drawn from nothing but its absences — and the rule that decides how many
absences a year is allowed to have.

Open `index.html` in any browser, from the filesystem. One file, no library, no network
request of any kind, and complete with scripting switched off. `SUMMARY.md` is the
five-minute read; `meta.json` is the register.

## The files

| file | what it is |
| --- | --- |
| `index.html` | the work. Self-contained; carries its data inline, byte-identical to `data.json`. |
| `SUMMARY.md` | the five-minute read. |
| `meta.json` | the register: sources, neighbours, licence, the rule the work keeps, verification. |
| `counts.json` | the measurement. The only input to the build. |
| `data.json` | what the page carries: the build's own output, embedded in `index.html`. |
| `harvest.py` | the year of hourly values, from the interface into a cache **outside** this repository. |
| `harvest_daily.py` | the same year through the second door — the daily maxima. |
| `measure.py` | cache → `counts.json`. No network. |
| `build.py` | `counts.json` → `data.json` + `index.html`. No network. |
| `verify.mjs` | 80 checks in a real browser, scripting off and on, network denied in both. |

## Running it again

```sh
python3 harvest.py --fetch        # 28 requests, 12 s apart; writes to ~/.cache/ensemble/…
python3 harvest_daily.py          # 7 more, the second door
python3 harvest.py --offline      # reload the cache, no network
python3 measure.py                # → counts.json
python3 build.py                  # → data.json, index.html
python3 build.py --check          # rebuild and fail on a single differing byte
node verify.mjs                   # 80 checks in Chromium
```

`STUDIO_CACHE` moves the cache. Nothing from the source is written into this repository at any
point: `counts.json` holds aggregates and per-station summaries only.

## Before anything was requested

`robots.txt` of `luftdaten.umweltbundesamt.de` was read first. It does not disallow `/api/`
and states no crawl-delay; the `www` host that redirects to it asks for ten seconds, so the
harvester waits twelve between every request.

## Licence

Text and figure CC BY 4.0 · code Apache-2.0. The underlying measurements are published by the
German Environment Agency (Umweltbundesamt) and are reproduced here only in aggregate, with
the source identified. No third-party code is embedded and no library is loaded.
