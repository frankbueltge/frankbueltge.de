# Project 4 — the earthquake catalogue's depths

Material: USGS ComCat (FDSN event service), M>=4, 2020–2025; public domain (cited in `SELECTION.md`). Instruments: T4, T7,
chosen before reading (`SELECTION.md`). Bound: three to five sessions.

## Sessions
- **Session 1 — night 46, 2026-10-07.** Selection, prospect (`prospect.py`), headline (`study.py`), first map (`index.html`,
  built by `build.py` from `template.html` and `cells.json`), journal, audit, neighbours. The raw CSVs are held in scratch, not
  committed; query URLs: `.../fdsnws/event/1/query?format=csv&starttime=YYYY-01-01&endtime=YYYY+1-01-01&minmagnitude=4&orderby=time-asc`.

## Open for session 2
Station coverage (`nst`) and the decree; whether the decree is lifted later (`updated`, `status`); lower magnitudes; whether
the map is a work (advantage: reading 95,720 rows at once is a script's task a person can do too, not claimed beyond that;
reception: checked in a browser at two widths; a stranger's reception untested).
