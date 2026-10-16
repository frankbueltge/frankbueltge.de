# Project 9 — Named into the sky (minor planet name citations)

Opened 2026-10-15 (night 62). Material: the IAU's citations for named minor planets, a random 3,000 of the 26,519 numbers in the
Minor Planet Center's list of names, each read from JPL's Small-Body Database API. Selection: `SELECTION.md` (committed d8e2a3f before
any citation was read in bulk). Bound: three to five sessions. Instruments: T4 (`JOURNAL.md`), T6 (`LINES.md`, first use in any
project). No name, school or citation text is committed; under-18 honourees carry no number or link on the page.

Session 1 (2026-10-15, night 62): `sample.py` -> `sample.json`; `fetch.py` (answers to scratch only); `session1_test.py` (patterns on
invented strings, before parsing); `session1.py` -> `session1.json` (registered) and `session1_rows.json`; `read_sample.py` ->
`reading_sample.json` (60 + 30 read); `verify.py` -> `verify.json` and `rows.json` (mentor correction); `build.py` -> `index.html`;
`NEIGHBOURS.md`. Predictions: 6 registered; 2 held (P2, P6), 4 failed (P1, P3, P4, P5); after the verified correction P5 holds (3 of 6).
Found: the commonest age at naming is 15-19 (294 of 1,352 living honourees), nearly all school-competition finalists; the others'
median is 54.5; the dead wait a median 44 years (quartiles 6 and 117). Limit: the citation year is that of the standing citation, which
for a corrected one is later than the naming. No work declared.

Session 2 (2026-10-15, night 63): `SESSION2.md` (registered, pushed cd53845 before any re-fetched citation was parsed); the 3,000
re-fetched to scratch with `fetch.py` (every row equal to session 1's); the 107 WGSBN bulletins read in scratch; `tables2.py` ->
`tables2.json` (MPC circular batches, bulletin dates); `session2_lib.py`, `session2_test.py` (rules on invented strings);
`session2.py` -> `session2.json` (registered) and `session2_rows.json`; `verify2.py` -> `verify2.json` and `rows2.json`; `build.py`
-> `index.html`. Predictions: 6 registered; 2 held (P10, P12), 4 failed (P7, P8, P9, P11), the same after verification. Found:
**156 of 604 bulletin-dated citations (25.8 %) are not the naming**: 137 stand in Errata (copy-edits, mostly), dated a median 15
years after first publication (up to 40); 19 re-issued for a discovery credit or a trailing space. Re-dating moves 47 of 1,340
living ages by a band; the 15-19 band holds (295). Finalists were named within a year of their competition through 2018 (355 of
360); in the sample none in 2019-2020; the 2018-2020 finalists were named in 2021-2023, a median four years later, at a median age of
22; no later competition appears. The advantage question asked (`JOURNAL2.md` item 17): none that only this subject has. Corrections
before 2021 not measured. No work declared.

Session 3 (2026-10-16, night 64): `SESSION3.md` (registered, pushed 15e1eb2 before any re-fetched answer or circular entry was read);
the 1,733 MPC-dated objects re-fetched with `fetch3.py` (every citation year equal to session 2's); 178 circular batches downloaded to
scratch; `session3_lib.py`, `session3_test.py` (rules on invented strings); `session3.py` -> `session3.json` (registered) and
`session3_rows.json`; `verify3.py` -> `verify3.json` and `rows3.json`; `work_build.py` -> `named-into-the-sky/index.html`; `build.py` ->
`index.html`. Predictions: 5 registered; 4 held (P13, P15, P16, P17), 1 failed (P14), the same after verification. Found: 1,570 of
1,679 testable older citations stand under NEW NAMES in the batch the database names, none under a correction; 109 are not in that batch;
nothing re-dated. **Closed as a modest work, *Named into the Sky*** (`named-into-the-sky/`), by the registered rule. Toolkit account:
`TOOLKIT.md`.
