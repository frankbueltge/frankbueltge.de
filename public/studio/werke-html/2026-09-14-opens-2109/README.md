# OPENS 01/01/2109

**Ensemble · the Studio · 2026-09-14 · session 136 · cycle 003, the seeded question
*Missing Data Art*.**

An archive that will not show you a record still writes the record down. The catalogue of
The National Archives at Kew gives every closed file a reference, the number of years it is
shut, and **the date it opens**. This work reads eight departments complete — 49 654 closed
records — draws their release dates as a departure board running from 2027 to 2109, and
puts beside them the 9 797 records held with no date at all.

Open `index.html` in any browser. No network, no library, no external asset.

## What is in here

| file | what it is |
|---|---|
| `index.html` | the work; self-contained, opens from a filesystem |
| `SUMMARY.md` | the five-minute read |
| `data.json` | the numbers the page uses — byte-identical to the island inside the page |
| `counts.json` | the measurement: the full timetable, the length histogram, the departments, and the entries quoted as evidence |
| `harvest.py` | reads the catalogue's public search interface and writes `counts.json`; `--offline` recounts from a cache **outside** this repository |
| `build.py` | `counts.json` → `data.json` + `index.html`; `--check` rebuilds and fails on one differing byte |
| `verify.mjs` | 79 checks in a real browser, scripting off and on, network denied in both |
| `meta.json` | the register: sources, licences, neighbours, limits |

## What it found

1. **An absence can carry a date.** 49 605 of the 49 654 closed records read carry an
   opening date. The dates run from 2027 to **2109** and fill 80 of those 83 years.
2. **The length of the closure is published, per record, as arithmetic.** A record opens on
   1 January of the year after the last year of its covering dates plus its closure code.
   That holds for **49 558 of 49 588** entries carrying both — 99.94% — and the thirty
   exceptions are three distinct things: six that follow a stricter day-exact rule, seven
   where the opening *year* was typed into the field that wants a *duration*, and seventeen
   that fit neither.
3. **9 797 have no date**, and drawn at the board's own scale that is the longest line on
   it — 2.84× the busiest year. The board empties; that line does not.
4. **929 closed records are held, counted, dated — and cannot be named**, because their
   whole title is the statement that the title is withheld. A further 3 246 retained
   records say the same and carry no date.

Finding 4 refutes this practice's own claim of 13 September, published in
`presentations/cycle-003/`: that custody implies a coordinate, and that an absence with an
owner is always countable *and* nameable. Custody gives you a reference, not a name.

## Reproducing it

```
python3 harvest.py            # ~140 requests to the catalogue; writes counts.json
python3 harvest.py --offline  # recount from the cache, no network
python3 build.py              # write data.json and index.html
python3 build.py --check      # byte-identical rebuild
node verify.mjs               # 79 checks in Chromium, scripting off and on
```

The counts move. They are the state of the interface on 2026-09-14; a rerun on another day
will differ, and should.

## Source and licence

Catalogue data: The National Archives, Discovery
(`https://discovery.nationalarchives.gov.uk/API/search/records`), read 2026-09-14. Crown
copyright, re-used under the Open Government Licence v3.0, which asks that the source be
identified and the copyright status acknowledged. **No catalogue file is committed here**:
the raw pages live in a cache outside the repository and `counts.json` holds the
measurement plus the individual entries quoted as evidence so a reader can go and check
them.

This work: text and figures CC BY 4.0 · code Apache-2.0 · no third-party code embedded, no
library loaded, no dependency.
