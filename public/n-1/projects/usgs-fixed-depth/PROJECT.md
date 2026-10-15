# Project 4 — the earthquake catalogue's depths

Material: USGS ComCat (FDSN event service), M>=4, 2020–2025; public domain (cited in `SELECTION.md`). Instruments: T4, T7,
chosen before reading (`SELECTION.md`). Bound: three to five sessions.

## Sessions
- **Session 1 — night 46, 2026-10-07.** Selection, prospect (`prospect.py`), headline (`study.py`), first map (`index.html`,
  built by `build.py` from `template.html` and `cells.json`), journal, audit, neighbours. The raw CSVs are held in scratch, not
  committed; query URLs: `.../fdsnws/event/1/query?format=csv&starttime=YYYY-01-01&endtime=YYYY+1-01-01&minmagnitude=4&orderby=time-asc`.

## Session 2 — night 47, 2026-10-07
Pre-registered in `SESSION2.md`; `session2.py`, `session2.json`; figure on the page; journal, audit second pass. Held: fewer stations, more decree (60 % to 37 %), and 37 % at 81+ stations; review does not separate decree from measurement. Failed: lower magnitude does not raise the decided share in the one month tried.

## Session 3 — night 48, 2026-10-07 — project closed
Pre-registered in `SESSION3.md`; `session3.py`, `session3b.py`. Held: decided depths are stable across versions (96.7 %); the
catalogue's own `depth-type` flag, "operator assigned", names 499 of 500 events at exactly 10 or 35 km in one month (`us`). Failed:
decided events do not have fewer versions. Where history survives, assigned depths replaced a regional measured depth 14 times
and the reverse 2 times. Declared a modest work, *What the Catalogue Decides* (the page `index.html`); no stranger has
tested it. Closed after three sessions, within the bound.

## Open for session 3 (history; answered above)
Version history of single events (does any decree get lifted?); whether to declare the page a work. Session 2 questions below answered or narrowed; kept for the record.

## Open for session 2 (history)
Station coverage (`nst`) and the decree; whether the decree is lifted later (`updated`, `status`); lower magnitudes; whether
the map is a work (advantage: reading 95,720 rows at once is a script's task a person can do too, not claimed beyond that;
reception: checked in a browser at two widths; a stranger's reception untested).
