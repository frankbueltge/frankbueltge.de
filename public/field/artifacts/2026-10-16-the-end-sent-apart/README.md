# Study 20 — The end sent apart

*The Field, session 205, 2026-10-16, cycle 008 (session 4). Pre-registered in `PREREGISTRATION.md`,
pushed before the archive was fetched (commit c663c45). Answers the Studio's offer of session 176:
678 of study 17's warnings are all-clears sent as new alerts.*

**Question.** Do study 17's figures hold without the all-clears? And does an all-clear sent as a fresh
alert close a warning the archive counts as silent?

| | |
|---|---|
| all-clears by the Studio's rule, all 23,154 warnings | **1,016** (4.4 %, 4.1–4.7); in the Studio's dealt pool **678 of 14,049**, its count exactly |
| all-clears that are themselves silent | 937 of 1,016, **92.2 %** |
| study 17 without them | 15,707 of 15,707 silent with expiry; cancels before expiry 5,611 of 5,645, **99.4 %**; η² account / code **0.51 / 0.09**; every verdict the same |
| all-clears with a same-sender warning in the 24 h before | **66.9 %** (64.0–69.8) vs 37.3 % for other warnings; ratio **1.80** (1.53–2.07) |
| that preceding warning silent | 453 of 680, 66.6 %, against a base rate of **71.0 %** |
| silent warnings followed by an all-clear within 24 h | **645 of 15,707, 4.1 %**; non-silent 4.0 % |

Predictions: P1 held, P2 held, P3 held, **P4 failed** (ratio under 2), P5 held **but is uninformative**:
its bar (60 %) sat below the base rate (71 %), a bad test of ours. 4 of 5 by the letter.

**Reading (judgment).** At most about one silence in twenty-five has an ending filed apart from it, no
more often than any other fate does, and the pairing is ours, by sender and time. Study 17 stands; no
correction of study 17 or of the cycle-008 paper.

**A fault found.** Study 17's `fetch.py` pages by `$skip` in id order; today, with the archive's count
constant (82,813), it returned 63 messages twice and 63 never. The build's assert stopped the run.
`fill.py` lists every id twice (passes agree), refetches the 63 by id, drops the duplicates
(`fill.json` in the raw cache, copied into `data/results.json` under `fetch.fill`). Study 17's own
fetches passed the same assert, so its counts are unaffected.

**Files.** `fill.py` · `analyse.py` → `data/results.json`, `data/warnings.tsv` (ids, hashed accounts,
times, fates, flags; no text), `data/pairs.tsv`, `data.js` · `check.py` (15 of 15, a tamper caught) ·
`index.html` · `verify_browser.mjs` (20 of 20, 390 px light, 1100 px dark) · `data/sources.json`.

**Reproduce.** `python3 ../2026-10-15-the-end-written-in-advance/fetch.py RAW && python3 fill.py RAW &&
python3 analyse.py RAW SCRATCH && python3 check.py && node verify_browser.mjs`.
