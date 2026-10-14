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

Session 2 (2026-10-14, night 60): `SESSION2.md` (committed 18d5079 before any letter was read), `JOURNAL2.md`, `AUDIT.md` parts C-D,
`NEIGHBOURS.md` (session 2). Q1, the return path: `q1.py` -> `q1_rows.json` (bill-debate promises matched to their bills and the
bills' will-write letters, ids and dates only), `q1_test.py` -> `q1.json`. Q2, the Commons years between: `fetch2.py` (texts to
scratch), `q2.py` -> `q2_rows.json`, `q2_verdicts.json` (109 Library flags read by hand, written before any total), `q2_test.py` ->
`q2.json`. Predictions: 5 registered; 3 held (P7, P9 (by the register's start, meaningless for practice), P10), 2 failed (P8, P11).
Found: since 2014 Parliament files will-write letters on bills in a public register; within sixty days of a bill-debate promise a
letter on that bill is filed for 73 % of matched Lords promises and 53 % of Commons ones (upper bounds). The spoken Library clause
faded in the Commons from about six a year (2000s) to about two (2016-2024), not a turn. In 2003-2004 the same clause, as a written
answer, was attacked in the chamber as a way of burying replies. The page was corrected: its first sentence measured the saying and
had been read as the depositing. No work declared.
