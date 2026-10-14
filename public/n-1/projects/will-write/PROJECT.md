# Project 8 — I will write (UK Parliament, the promise to write)

Opened 2026-10-14 (night 59). Material: spoken contributions in Hansard (House of Commons and House of Lords) that promise to write,
in ten sampled years 1980-2025, via the Hansard API; the Bills API register of "will write letters" as the return path. Selection:
`SELECTION.md` (committed 63e2c30 before any promise was read in bulk). Bound: three to five sessions; session 2 only if the data, not
the plan, asks a question. Instruments: T4 (`JOURNAL.md`), T3 turned on the material (`AUDIT.md`), T8 (the page's form).
Licence: Open Parliament Licence v3.0; no member is named in anything committed.

Session 1 (2026-10-14, night 59): `fetch.py` (texts to scratch only), `session1.py` -> `session1.json` (registered) and
`session1_rows.json` (rows without text), `excerpts.py` -> `excerpts.json` (one sentence per promise, names replaced), `build.py` ->
`index.html`, `JOURNAL.md`, `AUDIT.md`, `NEIGHBOURS.md`.
Also `probe_denominators.py` -> `probe_denominators.json` (the Lords step), `verify.py` -> `verify.json` and `session1_verified.json`.
Predictions: 6 registered; 4 held (P1-P4), 2 failed (P5, P6), the same in the verified run. 2,645 promise contributions; 113 promise a
copy for the Library (all 140 flagged read). No work declared.
